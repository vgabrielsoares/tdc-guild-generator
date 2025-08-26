import type { StorageAdapter } from "@/utils/storage-adapter";
import { serializeData, deserializeData } from "@/utils/storage";
import {
  getDB,
  transactionWithTimeout,
  cache as dbCache,
} from "@/utils/database-manager";

export function createIndexedDBAdapter(): StorageAdapter {
  return {
    isAvailable: () => typeof indexedDB !== "undefined",

    async get<T>(store: string, key: string): Promise<T | null> {
      const cacheKey = `${store}:${key}`;
      const cached = dbCache.get<T>(cacheKey);
      if (cached) return cached;

      const db = await getDB();
      const result = await transactionWithTimeout(
        db,
        store,
        "readonly",
        (tx) => {
          return new Promise<T | null>((resolve, reject) => {
            try {
              const objectStore = tx.objectStore(store);
              const req = objectStore.get(key);
              req.onsuccess = () => {
                const res = req.result as unknown;
                if (!res) return resolve(null);
                if (typeof res === "string")
                  return resolve(deserializeData(res) as T);
                if (
                  res &&
                  typeof (res as Record<string, unknown>).__serialized ===
                    "string"
                ) {
                  return resolve(
                    deserializeData(
                      (res as Record<string, unknown>).__serialized as string
                    ) as T
                  );
                }
                resolve(res as T);
              };
              req.onerror = () => reject(req.error);
            } catch (e) {
              reject(e);
            }
          });
        }
      );

      if (result !== null) dbCache.set(cacheKey, result as unknown);
      return result;
    },

    async put<T>(store: string, key: string, value: T): Promise<void> {
      const db = await getDB();
      await transactionWithTimeout(db, store, "readwrite", (tx) => {
        return new Promise<void>((resolve, reject) => {
          try {
            const objectStore = tx.objectStore(store);
            const payload =
              typeof value === "object" && value !== null
                ? Object.assign({}, value as Record<string, unknown>, {
                    id: key,
                  })
                : { id: key, value };
            const req = objectStore.put(payload);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
          } catch (e) {
            // Fallback to serialized storage
            try {
              const objectStore = tx.objectStore(store);
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
      });

      const cacheKey = `${store}:${key}`;
      dbCache.set(cacheKey, value as unknown);
    },

    async del(store: string, key: string): Promise<void> {
      const db = await getDB();
      await transactionWithTimeout(db, store, "readwrite", (tx) => {
        return new Promise<void>((resolve, reject) => {
          try {
            const objectStore = tx.objectStore(store);
            const req = objectStore.delete(key);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
          } catch (e) {
            reject(e);
          }
        });
      });

      const cacheKey = `${store}:${key}`;
      // remove from cache
      dbCache.set(cacheKey, null as unknown);
    },

    async list<T>(store: string): Promise<T[]> {
      const db = await getDB();
      const rows = await transactionWithTimeout(db, store, "readonly", (tx) => {
        return new Promise<T[]>((resolve, reject) => {
          try {
            const objectStore = tx.objectStore(store);
            const req = objectStore.getAll();
            req.onsuccess = () => {
              const mapped = (req.result as unknown[]).map((r) => {
                const item = r as Record<string, unknown>;
                if (item && typeof item.__serialized === "string")
                  return deserializeData(item.__serialized) as T;
                return item as T;
              });
              resolve(mapped);
            };
            req.onerror = () => reject(req.error);
          } catch (e) {
            reject(e);
          }
        });
      });

      return rows;
    },
  };
}
