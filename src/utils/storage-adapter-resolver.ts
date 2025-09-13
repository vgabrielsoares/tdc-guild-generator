import { createIndexedDBAdapter } from "@/utils/storage-adapters/indexeddb-adapter";
import { createLocalStorageAdapter } from "@/utils/storage-adapters/localstorage-adapter";
import type { StorageAdapter } from "@/utils/storage-adapter";
import { createAdapterPlaceholder } from "@/utils/storage-adapter";
import {
  isVitestEnvironment,
  isLocalStorageAvailable,
} from "./environment-detection";

let adapter: StorageAdapter | undefined = undefined;
let persistentMemoryStores: Map<string, Map<string, unknown>> | null = null;

export function getAdapter(): StorageAdapter {
  if (isVitestEnvironment()) {
    try {
      const INIT_KEY = "__vitest_inMemoryAdapter_init";
      const lsPresent = isLocalStorageAvailable();
      const initFlag = lsPresent ? localStorage.getItem(INIT_KEY) : null;

      if (!adapter || !initFlag) {
        if (!initFlag) persistentMemoryStores = null;

        const memoryStores =
          persistentMemoryStores ?? new Map<string, Map<string, unknown>>();
        persistentMemoryStores = memoryStores;

        const inMemoryAdapter: StorageAdapter = {
          isAvailable: () => true,
          async get<T>(store: string, key: string) {
            try {
              if (typeof localStorage !== "undefined" && store === "settings") {
                const lsKey = `${store}:${key}`;
                const raw = localStorage.getItem(lsKey);
                if (raw !== null) return JSON.parse(raw) as T;
              }
            } catch (e) {
              // ignore localStorage errors
            }

            const s = memoryStores.get(store);
            if (!s) return null;
            return (s.has(key) ? (s.get(key) as T) : null) as T | null;
          },
          async put<T>(store: string, key: string, value: T) {
            let s = memoryStores.get(store);
            if (!s) {
              s = new Map<string, unknown>();
              memoryStores.set(store, s);
            }
            s.set(key, value as unknown);

            try {
              if (typeof localStorage !== "undefined" && store === "settings") {
                const lsKey = `${store}:${key}`;
                localStorage.setItem(lsKey, JSON.stringify(value));
              }
            } catch (e) {
              // ignore localStorage write errors during tests
            }
          },
          async del(store: string, key: string) {
            const s = memoryStores.get(store);
            if (s) s.delete(key);
            try {
              if (typeof localStorage !== "undefined" && store === "settings") {
                const lsKey = `${store}:${key}`;
                localStorage.removeItem(lsKey);
              }
            } catch (e) {
              // ignore
            }
          },
          async list<T>(store: string) {
            if (typeof localStorage !== "undefined" && store === "settings") {
              try {
                const results: T[] = [];
                for (let i = 0; i < localStorage.length; i++) {
                  const k = localStorage.key(i);
                  if (!k) continue;
                  if (k.startsWith(`${store}:`)) {
                    const val = localStorage.getItem(k);
                    if (val !== null) {
                      try {
                        results.push(JSON.parse(val) as T);
                      } catch (e) {
                        // ignore parse errors
                      }
                    }
                  }
                }
                return results;
              } catch (e) {
                // fallthrough to memory-backed list
              }
            }

            const s = memoryStores.get(store);
            if (!s) return [];
            return Array.from(s.values()) as T[];
          },
        };
        adapter = inMemoryAdapter;
        // eslint-disable-next-line no-console
        console.log("[STORAGE_ADAPTER] Using in-memory adapter for Vitest");

        try {
          if (lsPresent) localStorage.setItem(INIT_KEY, "1");
        } catch (e) {
          // ignore if localStorage is not writable
        }
      }
      return adapter;
    } catch (e) {
      adapter = createAdapterPlaceholder();
      return adapter;
    }
  }

  if (adapter) return adapter;
  const indexed = createIndexedDBAdapter();
  if (indexed.isAvailable()) {
    // eslint-disable-next-line no-console
    console.log("[STORAGE_ADAPTER] Using IndexedDB adapter");
    adapter = indexed;
    return adapter;
  }
  const ls = createLocalStorageAdapter();
  if (ls.isAvailable()) {
    // eslint-disable-next-line no-console
    console.log("[STORAGE_ADAPTER] Using LocalStorage adapter");
    adapter = ls;
    return adapter;
  }
  // fallback placeholder
  // eslint-disable-next-line no-console
  console.log("[STORAGE_ADAPTER] Using placeholder adapter");
  adapter = createAdapterPlaceholder();
  return adapter!;
}

// Test helper: clear cached adapter so tests can change environment (indexedDB vs localStorage)
export function clearAdapter() {
  adapter = undefined;
}
