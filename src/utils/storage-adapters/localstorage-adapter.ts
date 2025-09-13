import type { StorageAdapter } from "@/utils/storage-adapter";
import { serializeData, deserializeData } from "@/utils/storage";

export function createLocalStorageAdapter(): StorageAdapter {
  return {
    isAvailable: (): boolean => typeof localStorage !== "undefined",

    async get<T>(store: string, key: string): Promise<T | null> {
      try {
        const raw = localStorage.getItem(`${store}:${key}`);
        if (!raw) return null;
        return deserializeData(raw);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("[LS Adapter] get failed", e);
        return null;
      }
    },

    async put<T>(store: string, key: string, value: T): Promise<void> {
      try {
        localStorage.setItem(`${store}:${key}`, serializeData(value));
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("[LS Adapter] put failed", e);
        throw e;
      }
    },

    async del(store: string, key: string): Promise<void> {
      try {
        localStorage.removeItem(`${store}:${key}`);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("[LS Adapter] del failed", e);
        throw e;
      }
    },

    async list<T>(store: string): Promise<T[]> {
      try {
        const prefix = `${store}:`;
        const results: T[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const fullKey = localStorage.key(i);
          if (!fullKey) continue;
          if (fullKey.startsWith(prefix)) {
            const raw = localStorage.getItem(fullKey);
            if (raw) results.push(deserializeData(raw) as T);
          }
        }
        return results;
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error("[LS Adapter] list failed", e);
        return [];
      }
    },
  };
}
