import type { StorageAdapter } from "@/utils/storage-adapter";
import { serializeData, deserializeData } from "@/utils/storage";
import { getInitialStores } from "@/utils/database-migrations";
import { applyMigrations } from "@/utils/database-migrations";

const DB_NAME = "guild-generator-db";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
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
                // ignore if index exists or invalid
              }
            });
          }
        }
      });
      // Apply programmatic migrations if any
      const verEvent = ev as IDBVersionChangeEvent;
      const oldV =
        typeof verEvent.oldVersion === "number" ? verEvent.oldVersion : 0;
      const newV =
        typeof verEvent.newVersion === "number"
          ? verEvent.newVersion
          : DB_VERSION;
      applyMigrations(db, oldV, newV || DB_VERSION);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function createIndexedDBAdapter(): StorageAdapter {
  return {
    isAvailable: () => typeof indexedDB !== "undefined",

    async get<T>(store: string, key: string): Promise<T | null> {
      const db = await openDB();
      return new Promise<T | null>((resolve, reject) => {
        const tx = db.transaction(store, "readonly");
        const objectStore = tx.objectStore(store);
        const req = objectStore.get(key);
        req.onsuccess = () => {
          const result = req.result as unknown;
          if (!result) return resolve(null);
          // If stored as serialized string, deserialize
          if (typeof result === "string")
            return resolve(deserializeData(result) as T);
          if (result) {
            const rec = result as Record<string, unknown>;
            if (typeof rec.__serialized === "string") {
              const serialized = rec.__serialized as string;
              return resolve(deserializeData(serialized) as T);
            }
          }
          resolve(result as T);
        };
        req.onerror = () => reject(req.error);
      });
    },

    async put<T>(store: string, key: string, value: T): Promise<void> {
      const db = await openDB();
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(store, "readwrite");
        const objectStore = tx.objectStore(store);
        // attempt to store value directly. if it fails due to structured clone, fallback to string
        try {
          // ensure an id field exists when store expects it
          const payload =
            typeof value === "object" && value !== null
              ? Object.assign({}, value as Record<string, unknown>, { id: key })
              : { id: key, value };
          const req = objectStore.put(payload);
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        } catch (e) {
          try {
            const req2 = objectStore.put({
              id: key,
              __serialized: serializeData(value),
            });
            req2.onsuccess = () => resolve();
            req2.onerror = () => reject(req2.error);
          } catch (err) {
            reject(err);
          }
        }
      });
    },

    async del(store: string, key: string): Promise<void> {
      const db = await openDB();
      return new Promise<void>((resolve, reject) => {
        const tx = db.transaction(store, "readwrite");
        const objectStore = tx.objectStore(store);
        const req = objectStore.delete(key);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
      });
    },

    async list<T>(store: string): Promise<T[]> {
      const db = await openDB();
      return new Promise<T[]>((resolve, reject) => {
        const tx = db.transaction(store, "readonly");
        const objectStore = tx.objectStore(store);
        const req = objectStore.getAll();
        req.onsuccess = () => {
          const rows = (req.result as unknown[]).map((r) => {
            const item = r as Record<string, unknown>;
            if (item && typeof item.__serialized === "string")
              return deserializeData(item.__serialized) as T;
            return item as T;
          });
          resolve(rows);
        };
        req.onerror = () => reject(req.error);
      });
    },
  };
}
