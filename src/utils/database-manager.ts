import {
  DB_NAME,
  DB_VERSION,
  TRANSACTION_TIMEOUT_MS,
  CACHE_ENABLED,
  CACHE_TTL_MS,
  AUTO_BACKUP_ENABLED,
  AUTO_BACKUP_INTERVAL_MS,
} from "./database-config";
import { getInitialStores, applyMigrations } from "./database-migrations";
import {
  DB_STORES,
  DBGuildSchema,
  DBSettingSchema,
  DBContractSchema,
  DBServiceSchema,
  DBTimelineSchema,
} from "./database-schema";
import { serializeData, deserializeData } from "@/utils/storage";

let cachedDB: IDBDatabase | null = null;

// Simple in-memory cache for frequently accessed records
const memoryCache = new Map<string, { value: unknown; expiresAt: number }>();

function setCache(key: string, value: unknown) {
  if (!CACHE_ENABLED) return;
  memoryCache.set(key, { value, expiresAt: Date.now() + CACHE_TTL_MS });
}

function getCache<T>(key: string): T | null {
  if (!CACHE_ENABLED) return null;
  const item = memoryCache.get(key);
  if (!item) return null;
  if (Date.now() > item.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return item.value as T;
}

function openDBOnce(): Promise<IDBDatabase> {
  if (cachedDB) return Promise.resolve(cachedDB);

  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (ev) => {
      const db = req.result;
      const stores = getInitialStores();
      stores.forEach((s) => {
        if (!db.objectStoreNames.contains(s.name)) {
          const store = db.createObjectStore(s.name, {
            keyPath: s.keyPath || "id",
          });
          if (Array.isArray(s.indices)) {
            s.indices.forEach((idx: string) => {
              try {
                store.createIndex(idx, idx, { unique: false });
              } catch (e) {
                // ignore
              }
            });
          }
        }
      });

      const verEvent = ev as IDBVersionChangeEvent;
      const oldV =
        typeof verEvent.oldVersion === "number" ? verEvent.oldVersion : 0;
      const newV =
        typeof verEvent.newVersion === "number"
          ? verEvent.newVersion
          : DB_VERSION;
      applyMigrations(req.result, oldV, newV || DB_VERSION);
    };

    req.onsuccess = () => {
      cachedDB = req.result;
      // Close DB when page unloads
      try {
        window.addEventListener("unload", () => {
          try {
            cachedDB?.close();
          } catch (e) {
            // ignore close errors
            // eslint-disable-next-line no-console
            console.warn("db close warning", e);
          }
        });
      } catch (e) {
        // ignore addEventListener errors
        // eslint-disable-next-line no-console
        console.warn("event listener registration failed", e);
      }
      resolve(cachedDB!);
    };

    req.onerror = () => reject(req.error);
  });
}

export async function getDB(): Promise<IDBDatabase> {
  return openDBOnce();
}

// Helper to perform a transaction with timeout
export function transactionWithTimeout<T>(
  db: IDBDatabase,
  storeNames: string | string[],
  mode: IDBTransactionMode,
  fn: (tx: IDBTransaction) => Promise<T>
): Promise<T> {
  const tx = db.transaction(storeNames, mode);
  let finished = false;

  const timeout = setTimeout(() => {
    if (!finished) {
      finished = true;
      try {
        tx.abort();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("failed to abort transaction", e);
      }
    }
  }, TRANSACTION_TIMEOUT_MS);

  return fn(tx)
    .then((res) => {
      if (!finished) {
        finished = true;
        clearTimeout(timeout);
        return res;
      }
      throw new Error("Transaction finished early");
    })
    .catch((err) => {
      if (!finished) {
        finished = true;
        clearTimeout(timeout);
      }
      throw err;
    });
}

export const cache = {
  get: getCache,
  set: setCache,
};

let autoBackupTimer: number | null = null;

// Initialize database with optional auto-backup and recovery
export async function initDatabase(options?: {
  autoBackup?: boolean;
  retry?: number;
}): Promise<IDBDatabase> {
  const retries = options?.retry ?? 1;
  try {
    const db = await getDB();
    const shouldStart = options?.autoBackup ?? AUTO_BACKUP_ENABLED;
    if (shouldStart) startAutoBackup();
    return db;
  } catch (err) {
    // Attempt recovery: delete and retry once
    if (retries > 0) {
      try {
        await deleteDatabase();
        // clear cached DB reference
        cachedDB = null;
        const db = await getDB();
        const shouldStart = options?.autoBackup ?? AUTO_BACKUP_ENABLED;
        if (shouldStart) startAutoBackup();
        return db;
      } catch (err2) {
        throw new Error(`Database initialization failed: ${String(err2)}`);
      }
    }
    throw err;
  }
}

export async function exportBackup(): Promise<string> {
  const db = await getDB();
  const backup: Record<string, unknown[]> = {};

  for (const s of DB_STORES) {
    const storeName = s.name;
    const rows = await transactionWithTimeout(
      db,
      storeName,
      "readonly",
      (tx) => {
        return new Promise<unknown[]>((resolve, reject) => {
          try {
            const objectStore = tx.objectStore(storeName);
            const req = objectStore.getAll();
            req.onsuccess = () => resolve(req.result as unknown[]);
            req.onerror = () => reject(req.error);
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    backup[storeName] = rows;
  }

  const payload = {
    meta: {
      name: DB_NAME,
      version: DB_VERSION,
      exportedAt: new Date().toISOString(),
    },
    stores: backup,
  };

  return serializeData(payload);
}

export async function importBackup(text: string): Promise<void> {
  const data = deserializeData<{
    meta: Record<string, unknown>;
    stores: Record<string, unknown[]>;
  }>(text);
  if (!data || !data.stores) throw new Error("Invalid backup format");

  const db = await getDB();

  for (const s of DB_STORES) {
    const storeName = s.name;
    const entries = data.stores[storeName] ?? [];
    // Validate and normalize entries per-store before writing
    const normalized: unknown[] = [];
    if (storeName === "guilds") {
      for (const ent of entries) {
        try {
          const parsed = DBGuildSchema.parse(ent);
          normalized.push(parsed);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn("Skipping invalid guild entry during import:", err);
        }
      }
    } else if (storeName === "contracts") {
      for (const ent of entries) {
        try {
          const parsed = DBContractSchema.parse(ent);
          normalized.push(parsed);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn("Skipping invalid contract entry during import:", err);
        }
      }
    } else if (storeName === "services") {
      for (const ent of entries) {
        try {
          const parsed = DBServiceSchema.parse(ent);
          normalized.push(parsed);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn("Skipping invalid service entry during import:", err);
        }
      }
    } else if (storeName === "timeline") {
      for (const ent of entries) {
        try {
          const parsed = DBTimelineSchema.parse(ent);
          normalized.push(parsed);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn("Skipping invalid timeline entry during import:", err);
        }
      }
    } else if (storeName === "settings") {
      for (const ent of entries) {
        try {
          const parsed = DBSettingSchema.parse(ent);
          normalized.push(parsed);
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn("Skipping invalid settings entry during import:", err);
        }
      }
    } else {
      // Generic validation: ensure object with id
      for (const ent of entries) {
        try {
          if (
            ent &&
            typeof ent === "object" &&
            "id" in (ent as Record<string, unknown>)
          ) {
            normalized.push(ent);
          } else {
            // eslint-disable-next-line no-console
            console.warn(
              `Skipping invalid entry for store ${storeName} during import`
            );
          }
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn(
            `Skipping invalid entry for store ${storeName} during import:`,
            err
          );
        }
      }
    }

    await transactionWithTimeout(db, storeName, "readwrite", (tx) => {
      return new Promise<void>((resolve, reject) => {
        try {
          const objectStore = tx.objectStore(storeName);
          // clear existing
          const clrReq = objectStore.clear();
          clrReq.onsuccess = () => {
            try {
              let pending = normalized.length;
              if (pending === 0) return resolve();
              normalized.forEach((entry) => {
                const putReq = objectStore.put(entry as unknown);
                putReq.onsuccess = () => {
                  pending -= 1;
                  if (pending === 0) resolve();
                };
                putReq.onerror = () => reject(putReq.error);
              });
            } catch (e) {
              reject(e);
            }
          };
          clrReq.onerror = () => reject(clrReq.error);
        } catch (e) {
          reject(e);
        }
      });
    });
  }
}

export async function deleteDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const req = indexedDB.deleteDatabase(DB_NAME);
      req.onsuccess = () => {
        // clear cached instance
        try {
          cachedDB?.close();
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn("error closing during delete", e);
        }
        cachedDB = null;
        resolve();
      };
      req.onerror = () => reject(req.error);
      req.onblocked = () => {
        // eslint-disable-next-line no-console
        console.warn("deleteDatabase blocked");
      };
    } catch (e) {
      reject(e);
    }
  });
}

export function startAutoBackup(intervalMs?: number) {
  if (!AUTO_BACKUP_ENABLED) return;
  const ms = intervalMs ?? AUTO_BACKUP_INTERVAL_MS;
  if (autoBackupTimer) return;
  autoBackupTimer = window.setInterval(async () => {
    try {
      const dump = await exportBackup();
      // Save to settings store as 'auto-backup:last'
      const db = await getDB();
      await transactionWithTimeout(db, "settings", "readwrite", (tx) => {
        return new Promise<void>((resolve, reject) => {
          try {
            const os = tx.objectStore("settings");
            const req = os.put({
              key: "auto-backup:last",
              value: dump,
              createdAt: new Date(),
            });
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
          } catch (e) {
            reject(e);
          }
        });
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("auto-backup failed", e);
    }
  }, ms);
}

export function stopAutoBackup() {
  if (!autoBackupTimer) return;
  clearInterval(autoBackupTimer);
  autoBackupTimer = null;
}

export function clearCache() {
  memoryCache.clear();
}

export function closeDB() {
  try {
    cachedDB?.close();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("error closing db", e);
  }
  cachedDB = null;
}
