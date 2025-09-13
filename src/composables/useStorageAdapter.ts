import { getAdapter } from "@/utils/storage-adapter-resolver";

export function useStorageAdapter() {
  const adapter = getAdapter();

  async function get<T>(store: string, key: string): Promise<T | null> {
    return adapter.get<T>(store, key);
  }

  async function put<T>(store: string, key: string, value: T): Promise<void> {
    return adapter.put(store, key, value);
  }

  async function del(store: string, key: string): Promise<void> {
    return adapter.del(store, key);
  }

  async function list<T>(store: string): Promise<T[]> {
    return adapter.list<T>(store);
  }

  return { get, put, del, list };
}
