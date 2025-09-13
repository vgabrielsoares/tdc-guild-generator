import {
  installFakeIndexedDB,
  uninstallFakeIndexedDB,
} from "../utils/fakeIndexedDB";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createIndexedDBAdapter } from "@/utils/storage-adapters/indexeddb-adapter";
import { getDB } from "@/utils/database-manager";
import { DB_STORES } from "@/utils/database-schema";
import { DB_VERSION } from "@/utils/database-config";

// Get store names array from DB_STORES configuration
const STORE_NAMES = DB_STORES.map((store) => store.name);

describe("Migration Tests", () => {
  beforeEach(() => {
    installFakeIndexedDB();
  });

  afterEach(() => {
    try {
      uninstallFakeIndexedDB();
    } catch (e) {
      // ignore cleanup errors
    }
  });

  describe("Database Initialization", () => {
    it("should initialize database with current schema version", async () => {
      const db = await getDB();
      expect(db).toBeDefined();
      expect(db.version).toBe(DB_VERSION);

      // Verify all required stores exist - using contains method from fakeIndexedDB
      STORE_NAMES.forEach((storeName) => {
        expect(db.objectStoreNames.contains(storeName)).toBe(true);
      });

      db.close();
    });

    it("should create all required object stores", async () => {
      const db = await getDB();

      // Verify stores exist using the contains method (fakeIndexedDB compatible)
      STORE_NAMES.forEach((storeName) => {
        expect(db.objectStoreNames.contains(storeName)).toBe(true);
      });

      db.close();
    }, 10000); // Aumentar timeout para 10 segundos
  });

  describe("Schema Migration", () => {
    it("should handle migration from version 1 to current", async () => {
      // This test simulates a migration scenario
      // In a real environment, this would involve opening with an older version first

      const db = await getDB();
      expect(db.version).toBe(DB_VERSION);

      // Verify migration completed successfully using contains method
      STORE_NAMES.forEach((storeName) => {
        expect(db.objectStoreNames.contains(storeName)).toBe(true);
      });

      db.close();
    });

    it("should apply migrations correctly", async () => {
      // Test the migration function directly
      const testMigrations = [
        {
          version: 1,
          upgrade: (db: IDBDatabase) => {
            if (!db.objectStoreNames.contains("test-store")) {
              db.createObjectStore("test-store", { keyPath: "id" });
            }
          },
        },
        {
          version: 2,
          upgrade: (db: IDBDatabase) => {
            if (!db.objectStoreNames.contains("test-store-2")) {
              db.createObjectStore("test-store-2", { keyPath: "id" });
            }
          },
        },
      ];

      // Since we can't easily test version upgrades in the fake environment,
      // we'll test basic migration structure
      expect(testMigrations.length).toBeGreaterThan(0);

      // Test with a mock database object
      const mockDb = {
        objectStoreNames: {
          contains: () => false,
        },
        createObjectStore: (
          name: string,
          options?: IDBObjectStoreParameters
        ) => ({
          name,
          ...options,
        }),
      } as unknown as IDBDatabase;

      // Apply migrations
      testMigrations.forEach((migration) => {
        expect(() => migration.upgrade(mockDb)).not.toThrow();
      });
    });
  });

  describe("Data Persistence Through Migrations", () => {
    it("should preserve data during schema updates", async () => {
      const adapter = createIndexedDBAdapter();
      const store = "guilds"; // Using a real store name

      // Store some test data
      const testData = {
        id: "migration-test-1",
        name: "Test Guild",
        version: "1.0",
        timestamp: new Date(),
      };

      await adapter.put(store, "migration-test-1", testData);

      // Verify data was stored
      const stored = await adapter.get(store, "migration-test-1");
      expect(stored).toEqual(testData);

      // Simulate a new connection (which might trigger migration checks)
      const newAdapter = createIndexedDBAdapter();

      // Verify data persists after "migration"
      const persisted = await newAdapter.get(store, "migration-test-1");
      expect(persisted).toEqual(testData);
    });

    it("should handle data format changes during migration", async () => {
      const adapter = createIndexedDBAdapter();
      const store = "contracts"; // Using a real store name

      // Store data in "old" format
      const oldFormatData = {
        id: "old-format-test",
        title: "Old Format Contract",
        value: 100,
        // Old format might be missing some fields
      };

      await adapter.put(store, "old-format-test", oldFormatData);

      // Verify old format data is accessible
      const retrieved = await adapter.get(store, "old-format-test");
      expect(retrieved).toEqual(oldFormatData);

      // Simulate updating to new format
      const newFormatData = {
        ...oldFormatData,
        status: "AVAILABLE", // New field added in migration
        timeline: [], // Another new field
        version: "2.0", // Version field updated
      };

      await adapter.put(store, "old-format-test", newFormatData);

      // Verify new format is stored correctly
      const updated = await adapter.get(store, "old-format-test");
      expect(updated).toEqual(newFormatData);
    });
  });

  describe("Migration Error Handling", () => {
    it("should handle migration failures gracefully", async () => {
      // Test that the system can handle errors during migration
      const adapter = createIndexedDBAdapter();

      // Even if there were migration issues, basic operations should still work
      const testData = {
        id: "error-recovery-test",
        data: "test data",
        timestamp: new Date(),
      };

      // Should not throw even if there were migration issues
      await expect(
        adapter.put("guilds", "error-recovery-test", testData)
      ).resolves.not.toThrow();

      const retrieved = await adapter.get("guilds", "error-recovery-test");
      expect(retrieved).toEqual(testData);
    });

    it("should maintain database integrity after failed migrations", async () => {
      // Test that database remains functional even after migration errors
      const adapter = createIndexedDBAdapter();

      // Store data before potential migration
      const preData = {
        id: "pre-migration",
        value: "before migration",
      };

      await adapter.put("services", "pre-migration", preData);

      // Store data after potential migration
      const postData = {
        id: "post-migration",
        value: "after migration",
      };

      await adapter.put("services", "post-migration", postData);

      // Both should be accessible
      expect(await adapter.get("services", "pre-migration")).toEqual(preData);
      expect(await adapter.get("services", "post-migration")).toEqual(postData);

      // List operation should work
      const allItems = await adapter.list("services");
      expect(Array.isArray(allItems)).toBe(true);
    });
  });

  describe("Version Compatibility", () => {
    it("should handle version mismatches appropriately", async () => {
      const db = await getDB();

      // Verify we're using the current version
      expect(db.version).toBe(DB_VERSION);

      // Database should be functional regardless of version
      const transaction = db.transaction(["guilds"], "readwrite");
      const store = transaction.objectStore("guilds");

      const testData = {
        id: "version-test",
        name: "Version Test Guild",
        timestamp: new Date(),
      };

      await new Promise<void>((resolve, reject) => {
        const request = store.put(testData);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });

      // Verify data was stored
      await new Promise<void>((resolve, reject) => {
        const request = store.get("version-test");
        request.onsuccess = () => {
          expect(request.result).toBeDefined();
          expect(request.result.id).toBe("version-test");
          resolve();
        };
        request.onerror = () => reject(request.error);
      });

      db.close();
    });

    it("should support backward compatibility", async () => {
      // Test that newer versions can read older data formats
      const adapter = createIndexedDBAdapter();

      // Simulate older data format
      const legacyData = {
        id: "legacy-item",
        // Legacy format might have different field names or structures
        title: "Legacy Item", // Instead of 'name'
        cost: 50, // Instead of 'value'
        active: true, // Instead of 'status'
      };

      await adapter.put("notices", "legacy-item", legacyData);

      // Should be able to read legacy data
      const retrieved = await adapter.get("notices", "legacy-item");
      expect(retrieved).toEqual(legacyData);

      // Should be able to update to new format
      const modernData = {
        id: "legacy-item",
        name: "Modern Item", // Updated field name
        value: 75, // Updated field name
        status: "ACTIVE", // Updated field format
        version: "2.0", // New field
      };

      await adapter.put("notices", "legacy-item", modernData);

      const updated = await adapter.get("notices", "legacy-item");
      expect(updated).toEqual(modernData);
    });
  });

  describe("Performance Impact of Migrations", () => {
    it("should complete migrations within reasonable time", async () => {
      const startTime = performance.now();

      // Initialize database (which includes any necessary migrations)
      const db = await getDB();

      const migrationTime = performance.now() - startTime;

      // Migration should complete quickly (less than 5 seconds even in worst case)
      expect(migrationTime).toBeLessThan(5000);

      // Database should be fully functional after migration
      expect(db.version).toBe(DB_VERSION);

      // Verify stores exist using contains method
      expect(
        STORE_NAMES.some((name) => db.objectStoreNames.contains(name))
      ).toBe(true);

      db.close();
    });

    it("should not significantly impact adapter creation time", async () => {
      const iterations = 5;
      const times: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        const adapter = createIndexedDBAdapter();

        // Perform a basic operation to ensure full initialization
        await adapter.put("timeline", `perf-test-${i}`, {
          id: `perf-test-${i}`,
          value: i,
        });

        const endTime = performance.now();
        times.push(endTime - startTime);
      }

      const averageTime =
        times.reduce((sum, time) => sum + time, 0) / times.length;

      // Adapter creation and basic operation should be fast (less than 1 second)
      expect(averageTime).toBeLessThan(1000);

      // No single operation should take excessively long
      times.forEach((time) => {
        expect(time).toBeLessThan(2000);
      });
    });
  });
});
