export interface StorageAdapter {
  isAvailable(): boolean;

  get<T>(store: string, key: string): Promise<T | null>;
  put<T>(store: string, key: string, value: T): Promise<void>;
  del(store: string, key: string): Promise<void>;
  list<T>(
    store: string,
    query?: Partial<Record<string, unknown>>
  ): Promise<T[]>;
}

export type AdapterFactory = () => StorageAdapter;

export function createAdapterPlaceholder(): StorageAdapter {
  return {
    isAvailable: () => false,
    async get() {
      return null;
    },
    async put() {
      return;
    },
    async del() {
      return;
    },
    async list() {
      return [];
    },
  };
}
