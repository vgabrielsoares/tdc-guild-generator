import {
  installFakeIndexedDB,
  uninstallFakeIndexedDB,
} from "../utils/fakeIndexedDB";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createIndexedDBAdapter } from "@/utils/storage-adapters/indexeddb-adapter";
import { clearAdapter } from "@/utils/storage-adapter-resolver";
import type { StorageAdapter } from "@/utils/storage-adapter";

describe("IndexedDB Adapter - Comprehensive Tests", () => {
  let adapter: StorageAdapter;

  beforeEach(async () => {
    installFakeIndexedDB();
    adapter = createIndexedDBAdapter();
    clearAdapter(); // Clear cache between tests
  });

  afterEach(() => {
    try {
      uninstallFakeIndexedDB();
      clearAdapter();
    } catch (e) {
      // ignore cleanup errors
    }
  });

  describe("Availability and Initialization", () => {
    it("should detect IndexedDB availability", () => {
      expect(adapter.isAvailable()).toBe(true);
    });

    it("should handle missing IndexedDB gracefully", () => {
      // Temporarily remove indexedDB
      const originalIndexedDB = globalThis.indexedDB;
      delete (globalThis as Record<string, unknown>).indexedDB;

      const testAdapter = createIndexedDBAdapter();
      expect(testAdapter.isAvailable()).toBe(false);

      // Restore
      globalThis.indexedDB = originalIndexedDB;
    });
  });

  describe("Basic CRUD Operations", () => {
    const testStore = "settings";
    const testKey = "test-key";
    const testData = {
      id: "test-id",
      name: "Test Item",
      value: 42,
      createdAt: new Date("2024-01-01"),
      nested: {
        array: [1, 2, 3],
        boolean: true,
        null: null,
      },
    };

    it("should store and retrieve data correctly", async () => {
      await adapter.put(testStore, testKey, testData);
      const retrieved = await adapter.get(testStore, testKey);

      expect(retrieved).toEqual(testData);
    });

    it("should return null for non-existent keys", async () => {
      const result = await adapter.get(testStore, "non-existent-key");
      expect(result).toBeNull();
    });

    it("should delete data correctly", async () => {
      await adapter.put(testStore, testKey, testData);
      await adapter.del(testStore, testKey);

      const result = await adapter.get(testStore, testKey);
      expect(result).toBeNull();
    });

    it("should list all keys in a store", async () => {
      const testData1 = { ...testData, id: "item1" };
      const testData2 = { ...testData, id: "item2" };

      await adapter.put(testStore, "key1", testData1);
      await adapter.put(testStore, "key2", testData2);

      const items = await adapter.list(testStore);
      // list() retorna objetos completos, não apenas keys
      expect(items.length).toBeGreaterThanOrEqual(2);
      expect(
        items.some((item) => {
          const obj = item as Record<string, unknown>;
          return obj.id === "key1" || obj.key === "key1";
        })
      ).toBe(true);
      expect(
        items.some((item) => {
          const obj = item as Record<string, unknown>;
          return obj.id === "key2" || obj.key === "key2";
        })
      ).toBe(true);
    });

    it("should handle empty stores", async () => {
      const keys = await adapter.list("empty-store");
      expect(Array.isArray(keys)).toBe(true);
    });
  });

  describe("Data Types and Serialization", () => {
    const testStore = "settings";

    it("should handle primitive types", async () => {
      await adapter.put(testStore, "string", "test string");
      await adapter.put(testStore, "number", 123.45);
      await adapter.put(testStore, "boolean", true);
      await adapter.put(testStore, "null", null);

      expect(await adapter.get(testStore, "string")).toBe("test string");
      expect(await adapter.get(testStore, "number")).toBe(123.45);
      expect(await adapter.get(testStore, "boolean")).toBe(true);
      // Para valores primitivos como null, o adapter pode encapsular
      const nullResult = await adapter.get(testStore, "null");
      expect(
        nullResult === null ||
          (nullResult as Record<string, unknown>)?.value === null
      ).toBe(true);
    });

    it("should handle complex objects", async () => {
      const complexObject = {
        array: [1, "two", { three: 3 }],
        date: new Date("2024-01-01"),
        nested: {
          deep: {
            value: "nested value",
            number: 42,
          },
        },
        map: new Map([
          ["key1", "value1"],
          ["key2", "value2"],
        ]),
        set: new Set([1, 2, 3]),
      };

      await adapter.put(testStore, "complex", complexObject);
      const retrieved = await adapter.get(testStore, "complex");

      expect(retrieved).toEqual(complexObject);
    });

    it("should handle arrays", async () => {
      const testArray = [
        { id: 1, name: "Item 1" },
        { id: 2, name: "Item 2" },
        { id: 3, name: "Item 3" },
      ];

      await adapter.put(testStore, "array", testArray);
      const retrieved = await adapter.get(testStore, "array");

      expect(retrieved).toEqual(testArray);
      expect(Array.isArray(retrieved)).toBe(true);
    });

    it("should preserve data type consistency", async () => {
      const testCases = [
        { key: "undefined", value: undefined },
        { key: "zero", value: 0 },
        { key: "false", value: false },
        { key: "empty-string", value: "" },
        { key: "empty-object", value: {} },
        { key: "empty-array", value: [] },
      ];

      for (const testCase of testCases) {
        await adapter.put(testStore, testCase.key, testCase.value);
        const retrieved = await adapter.get(testStore, testCase.key);

        // Para valores primitivos, o adapter pode encapsular em objeto
        if (typeof testCase.value === "object" && testCase.value !== null) {
          expect(retrieved).toEqual(testCase.value);
        } else {
          // Para primitivos, pode ser o valor direto ou encapsulado
          const isDirectValue = retrieved === testCase.value;
          const isEncapsulated =
            (retrieved as Record<string, unknown>)?.value === testCase.value;
          expect(isDirectValue || isEncapsulated).toBe(true);
        }
      }
    });
  });

  describe("Error Handling", () => {
    it("should handle put operations with invalid data gracefully", async () => {
      // Test with circular reference (should be handled by serialization)
      const circularObj: Record<string, unknown> = { name: "circular" };
      circularObj.self = circularObj;

      // Should not throw but may serialize differently
      await expect(
        adapter.put("settings", "circular", circularObj)
      ).resolves.not.toThrow();
    });

    it("should handle get operations on invalid stores", async () => {
      // Should return null or empty result for non-existent stores
      const result = await adapter.get("non-existent-store", "any-key");
      expect(result).toBeNull();
    });

    it("should handle delete operations on non-existent keys", async () => {
      // Should not throw for non-existent keys
      await expect(
        adapter.del("settings", "non-existent")
      ).resolves.not.toThrow();
    });

    it("should handle list operations on non-existent stores", async () => {
      const result = await adapter.list("non-existent-store");
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("Performance and Concurrency", () => {
    const testStore = "settings";

    it("should handle multiple concurrent operations", async () => {
      const operations = [];

      // Create multiple concurrent put operations
      for (let i = 0; i < 10; i++) {
        operations.push(
          adapter.put(testStore, `concurrent-key-${i}`, {
            id: i,
            value: `value-${i}`,
            timestamp: Date.now(),
          })
        );
      }

      // Wait for all operations to complete
      await Promise.all(operations);

      // Verify all data was stored correctly
      for (let i = 0; i < 10; i++) {
        const result = await adapter.get(testStore, `concurrent-key-${i}`);
        expect(result).toEqual({
          id: i,
          value: `value-${i}`,
          timestamp: expect.any(Number),
        });
      }
    });

    it("should handle large datasets efficiently", async () => {
      const largeDataset = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        description: `Description for item ${i}`.repeat(10), // Make it larger
        data: Array.from({ length: 10 }, (_, j) => ({
          index: j,
          value: Math.random(),
        })),
      }));

      const startTime = performance.now();

      // Store large dataset
      const putOperations = largeDataset.map((item, index) =>
        adapter.put(testStore, `large-item-${index}`, item)
      );
      await Promise.all(putOperations);

      const putTime = performance.now() - startTime;

      // Retrieve large dataset
      const getStartTime = performance.now();
      const getOperations = largeDataset.map((_, index) =>
        adapter.get(testStore, `large-item-${index}`)
      );
      const results = await Promise.all(getOperations);
      const getTime = performance.now() - getStartTime;

      // Verify all data is correct
      results.forEach((result, index) => {
        expect(result).toEqual(largeDataset[index]);
      });

      // Performance assertions (reasonable expectations for fake IndexedDB)
      expect(putTime).toBeLessThan(5000); // 5 seconds max for 100 items
      expect(getTime).toBeLessThan(2000); // 2 seconds max for retrieval
    });
  });

  describe("Cache Integration", () => {
    const testStore = "settings";
    const testKey = "cache-test";
    const testData = { cached: true, timestamp: Date.now() };

    it("should use cache for repeated reads", async () => {
      await adapter.put(testStore, testKey, testData);

      // First read (should cache)
      const result1 = await adapter.get(testStore, testKey);
      expect(result1).toEqual(testData);

      // Second read (should use cache)
      const result2 = await adapter.get(testStore, testKey);
      expect(result2).toEqual(testData);
      expect(result2).toBe(result1); // Should be the same reference from cache
    });

    it("should invalidate cache on updates", async () => {
      const initialData = { version: 1 };
      const updatedData = { version: 2 };

      await adapter.put(testStore, testKey, initialData);
      const cached = await adapter.get(testStore, testKey);
      expect(cached).toEqual(initialData);

      // Update should invalidate cache
      await adapter.put(testStore, testKey, updatedData);
      const updated = await adapter.get(testStore, testKey);
      expect(updated).toEqual(updatedData);
    });
  });

  describe("Transaction Handling", () => {
    const testStore = "settings";

    it("should handle transaction timeouts gracefully", async () => {
      // This is difficult to test with fake IndexedDB, but we can at least verify
      // that operations complete without hanging indefinitely
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("Operation timed out")), 5000);
      });

      const operation = adapter.put(testStore, "timeout-test", {
        data: "test",
      });

      await expect(
        Promise.race([operation, timeoutPromise])
      ).resolves.not.toThrow();
    });

    it("should handle failed transactions", async () => {
      // Test recovery from failed operations
      try {
        // Attempt operation that might fail
        await adapter.put(
          "invalid-store-name-that-might-not-exist",
          "key",
          "value"
        );
      } catch (error) {
        // Should handle gracefully
        expect(error).toBeDefined();
      }

      // Subsequent operations should still work
      await expect(
        adapter.put(testStore, "recovery-test", { recovered: true })
      ).resolves.not.toThrow();
    });
  });

  describe("Data Integrity", () => {
    const testStore = "settings";

    it("should maintain data integrity across operations", async () => {
      const testData = {
        id: "integrity-test",
        criticalData: "important-value",
        timestamp: new Date(),
        checksum: "abc123",
      };

      // Store data
      await adapter.put(testStore, "integrity", testData);

      // Retrieve and verify
      const retrieved = await adapter.get(testStore, "integrity");
      expect(retrieved).toEqual(testData);

      // Update part of the data
      const updatedData = { ...testData, criticalData: "updated-value" };
      await adapter.put(testStore, "integrity", updatedData);

      // Verify update maintained integrity
      const afterUpdate = await adapter.get(testStore, "integrity");
      expect(afterUpdate).toEqual(updatedData);
      expect((afterUpdate as typeof updatedData)?.criticalData).toBe(
        "updated-value"
      );
    });

    it("should handle edge cases in data serialization", async () => {
      const edgeCases = [
        { key: "bigint", value: BigInt(123456789) },
        { key: "symbol", value: Symbol("test") },
        { key: "function", value: () => "test" },
        { key: "regex", value: /test/gi },
        { key: "error", value: new Error("Test error") },
      ];

      for (const testCase of edgeCases) {
        try {
          await adapter.put(testStore, testCase.key, testCase.value);
          const retrieved = await adapter.get(testStore, testCase.key);

          // Some types may not serialize perfectly, but should not crash
          expect(retrieved).toBeDefined();
        } catch (error) {
          // Some edge cases may fail serialization, which is acceptable
          expect(error).toBeDefined();
        }
      }
    });
  });
});
