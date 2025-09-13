import {
  installFakeIndexedDB,
  uninstallFakeIndexedDB,
} from "./utils/fakeIndexedDB";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { clearAdapter } from "@/utils/storage-adapter-resolver";
import {
  initDatabase,
  exportBackup,
  importBackup,
  deleteDatabase,
  transactionWithTimeout,
  clearCache,
  closeDB,
} from "@/utils/database-manager";

describe("Database Manager - Issues 6.1 / 6.2 / 6.3", () => {
  beforeEach(async () => {
    installFakeIndexedDB();
    clearCache();
    try {
      await deleteDatabase();
    } catch (e) {
      // ignore
    }
  });

  afterEach(() => {
    closeDB();
    // uninstall shim so other tests use localStorage by default
    try {
      uninstallFakeIndexedDB();
    } catch (e) {
      // ignore
    }
    try {
      clearAdapter();
    } catch (e) {
      // ignore
    }
  });

  it("initializes database and performs simple transaction", async () => {
    const db = await initDatabase({ autoBackup: false, retry: 0 });
    expect(db).toBeDefined();

    // write a value into settings store
    await transactionWithTimeout(db, "settings", "readwrite", (tx) => {
      return new Promise<void>((resolve, reject) => {
        try {
          const os = tx.objectStore("settings");
          const req = os.put({
            key: "test-key",
            value: { v: 1 },
            createdAt: new Date(),
          });
          req.onsuccess = () => resolve();
          req.onerror = () => reject(req.error);
        } catch (err) {
          reject(err);
        }
      });
    });

    const backup = await exportBackup();
    expect(typeof backup).toBe("string");
    expect(backup.length).toBeGreaterThan(0);

    // import back (should not throw)
    await importBackup(backup);

    // delete database and ensure reinitialization possible
    await deleteDatabase();
    const db2 = await initDatabase({ autoBackup: false, retry: 0 });
    expect(db2).toBeDefined();
  });
});
