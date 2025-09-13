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
            // respeitar o keyPath do object store (pode ser 'id' ou 'key', etc.)
            const keyPath = (objectStore as IDBObjectStore).keyPath ?? "id";
            const makePayload = () => {
              if (typeof value === "object" && value !== null) {
                const copy = Object.assign(
                  {},
                  value as Record<string, unknown>
                );
                // Se keyPath for array (composto), não podemos preenchê-lo automaticamente; lançar para cair no fallback serializado
                if (Array.isArray(keyPath)) {
                  throw new Error(
                    "composite keyPath not supported for automatic payload creation"
                  );
                }
                (copy as Record<string, unknown>)[String(keyPath)] = key;
                return copy;
              }
              // valor primitivo, encapsular em objeto usando o keyPath
              return { [String(keyPath)]: key, value };
            };
            const payload = makePayload();
            const req = objectStore.put(payload as unknown);
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
          } catch (e) {
            // Fallback para armazenamento serializado
            try {
              const objectStore = tx.objectStore(store);
              const keyPath = (objectStore as IDBObjectStore).keyPath ?? "id";
              if (Array.isArray(keyPath)) {
                // keyPaths compostos não podem ser preenchidos automaticamente, armazenar serializado com 'id'
                const req2 = objectStore.put({
                  id: key,
                  __serialized: serializeData(value),
                });
                req2.onsuccess = () => resolve();
                req2.onerror = () => reject(req2.error);
              } else {
                const payload2: Record<string, unknown> = {
                  __serialized: serializeData(value),
                };
                payload2[String(keyPath)] = key;
                const req2 = objectStore.put(payload2);
                req2.onsuccess = () => resolve();
                req2.onerror = () => reject(req2.error);
              }
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
