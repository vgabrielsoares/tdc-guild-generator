import { createIndexedDBAdapter } from "@/utils/storage-adapters/indexeddb-adapter";
import { createLocalStorageAdapter } from "@/utils/storage-adapters/localstorage-adapter";
import type { StorageAdapter } from "@/utils/storage-adapter";

let adapter: StorageAdapter | undefined = undefined;

export function getAdapter(): StorageAdapter {
  if (adapter) return adapter;
  const indexed = createIndexedDBAdapter();
  if (indexed.isAvailable()) {
    adapter = indexed;
    return adapter;
  }
  const ls = createLocalStorageAdapter();
  if (ls.isAvailable()) {
    adapter = ls;
    return adapter;
  }
  // fallback placeholder
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { createAdapterPlaceholder } = require("@/utils/storage-adapter");
  adapter = createAdapterPlaceholder();
  return adapter!;
}

// Test helper: clear cached adapter so tests can change environment (indexedDB vs localStorage)
export function clearAdapter() {
  adapter = undefined;
}
