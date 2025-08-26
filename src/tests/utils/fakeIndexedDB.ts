/* eslint-disable */
// Minimal in-memory fake for IndexedDB used only in unit tests here.
// It implements a very small subset of IDB needed by database-manager and adapters.
export function installFakeIndexedDB() {
  const stores: Record<string, Map<string, unknown>> = {};

  class FakeRequest {
    onsuccess: ((ev?: unknown) => void) | null = null;
    onerror: ((ev?: unknown) => void) | null = null;
    onupgradeneeded: ((ev?: unknown) => void) | null = null;
    result: unknown = null;
  }

  class FakeDB {
    name: string;
    version: number;
    // minimal DOMStringList-like shim
    objectStoreNames: { contains: (n: string) => boolean };
    constructor(name: string, version: number) {
      this.name = name;
      this.version = version;
      this.objectStoreNames = {
        contains: (n: string) => !!stores[n],
      };
    }
    createObjectStore(name: string, _opts?: unknown) {
      if (!stores[name]) stores[name] = new Map();
      return {
        createIndex: () => undefined,
      };
    }
    transaction(_storeNames: string | string[], _mode: IDBTransactionMode) {
      const tx = {
        objectStore: (n: string) => {
          const map = stores[n] || new Map();
          return {
            get: (key: string) => {
              const req = new FakeRequest();
              setTimeout(() => {
                req.result = map.get(key) ?? null;
                req.onsuccess && req.onsuccess();
              }, 0);
              return req;
            },
            put: (value: any) => {
              const id =
                (value && (value.id ?? value.key)) ||
                value?.key ||
                String(Date.now());
              const req = new FakeRequest();
              setTimeout(() => {
                map.set(id, value);
                req.onsuccess && req.onsuccess();
              }, 0);
              return req;
            },
            delete: (key: string) => {
              const req = new FakeRequest();
              setTimeout(() => {
                map.delete(key);
                req.onsuccess && req.onsuccess();
              }, 0);
              return req;
            },
            getAll: () => {
              const req = new FakeRequest();
              setTimeout(() => {
                req.result = Array.from(map.values());
                req.onsuccess && req.onsuccess();
              }, 0);
              return req;
            },
            clear: () => {
              const req = new FakeRequest();
              setTimeout(() => {
                map.clear();
                req.onsuccess && req.onsuccess();
              }, 0);
              return req;
            },
          };
        },
        abort: () => undefined,
      } as unknown as IDBTransaction;
      return tx;
    }
    close() {
      // noop
    }
  }

  const fakeIndexedDB = {
    open(name: string, version?: number) {
      const req = new FakeRequest();
      setTimeout(() => {
        const db = new FakeDB(name, version ?? 1);
        req.result = db;
        // call onupgradeneeded first if present
        if (typeof req.onupgradeneeded === "function")
          req.onupgradeneeded({ oldVersion: 0, newVersion: version ?? 1 });
        req.onsuccess && req.onsuccess();
      }, 0);
      return req;
    },
    deleteDatabase(_name: string) {
      const req = new FakeRequest();
      setTimeout(() => {
        // clear all stores
        for (const k of Object.keys(stores)) delete stores[k];
        req.onsuccess && req.onsuccess();
      }, 0);
      return req;
    },
  } as unknown as IDBFactory;

  // assign test shim
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (globalThis as any).indexedDB = fakeIndexedDB;
}

export function uninstallFakeIndexedDB() {
  // @ts-ignore
  delete (globalThis as any).indexedDB;
}
