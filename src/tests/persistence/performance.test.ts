import {
  installFakeIndexedDB,
  uninstallFakeIndexedDB,
} from "../utils/fakeIndexedDB";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createIndexedDBAdapter } from "@/utils/storage-adapters/indexeddb-adapter";
import { createLocalStorageAdapter } from "@/utils/storage-adapters/localstorage-adapter";
import type { StorageAdapter } from "@/utils/storage-adapter";

interface PerformanceMetrics {
  operationType: string;
  adapterType: "IndexedDB" | "LocalStorage";
  totalTime: number;
  averageTime: number;
  operationsPerSecond: number;
  minTime: number;
  maxTime: number;
  operationCount: number;
}

interface BenchmarkOptions {
  iterations: number;
  dataSize: "small" | "medium" | "large";
  operationType: "put" | "get" | "delete" | "list";
}

describe("Storage Performance Benchmarks", () => {
  let indexedDBAdapter: StorageAdapter;
  let localStorageAdapter: StorageAdapter;

  beforeEach(() => {
    installFakeIndexedDB();
    indexedDBAdapter = createIndexedDBAdapter();
    localStorageAdapter = createLocalStorageAdapter();
  });

  afterEach(() => {
    try {
      uninstallFakeIndexedDB();
    } catch (e) {
      // ignore cleanup errors
    }
  });

  const generateTestData = (size: "small" | "medium" | "large") => {
    const baseData = {
      id: "test-item",
      name: "Test Item",
      timestamp: new Date(),
      metadata: {
        created: new Date(),
        updated: new Date(),
      },
    };

    switch (size) {
      case "small":
        return {
          ...baseData,
          description: "Small test data",
        };
      case "medium":
        return {
          ...baseData,
          description: "Medium test data".repeat(10),
          data: Array.from({ length: 100 }, (_, i) => ({
            index: i,
            value: `item-${i}`,
            random: Math.random(),
          })),
        };
      case "large":
        return {
          ...baseData,
          description: "Large test data".repeat(100),
          data: Array.from({ length: 1000 }, (_, i) => ({
            index: i,
            value: `item-${i}`,
            random: Math.random(),
            details: {
              nested: Array.from({ length: 10 }, (_, j) => ({
                id: j,
                content: `nested-content-${j}`.repeat(5),
              })),
            },
          })),
        };
      default:
        return baseData;
    }
  };

  const runBenchmark = async (
    adapter: StorageAdapter,
    adapterType: "IndexedDB" | "LocalStorage",
    options: BenchmarkOptions
  ): Promise<PerformanceMetrics> => {
    const { iterations, dataSize, operationType } = options;
    const testData = generateTestData(dataSize);
    const times: number[] = [];
    const store = "benchmarks";

    for (let i = 0; i < iterations; i++) {
      const key = `${operationType}-test-${i}`;
      const startTime = performance.now();

      try {
        switch (operationType) {
          case "put":
            await adapter.put(store, key, { ...testData, iteration: i });
            break;
          case "get":
            // First put the data if it doesn't exist
            await adapter.put(store, key, { ...testData, iteration: i });
            await adapter.get(store, key);
            break;
          case "delete":
            // First put the data to delete
            await adapter.put(store, key, { ...testData, iteration: i });
            await adapter.del(store, key);
            break;
          case "list":
            // Prepare some data for listing
            await adapter.put(store, key, { ...testData, iteration: i });
            await adapter.list(store);
            break;
        }
      } catch (error) {
        // Operation failed, skip this iteration
        continue;
      }
      const endTime = performance.now();
      times.push(endTime - startTime);
    }

    const totalTime = times.reduce((sum, time) => sum + time, 0);
    const averageTime = totalTime / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const operationsPerSecond = times.length > 0 ? 1000 / averageTime : 0;

    return {
      operationType,
      adapterType,
      totalTime,
      averageTime,
      operationsPerSecond,
      minTime,
      maxTime,
      operationCount: times.length,
    };
  };

  const compareBenchmarks = (
    indexedDBMetrics: PerformanceMetrics,
    localStorageMetrics: PerformanceMetrics
  ) => {
    const performanceRatio =
      localStorageMetrics.averageTime / indexedDBMetrics.averageTime;
    const throughputRatio =
      indexedDBMetrics.operationsPerSecond /
      localStorageMetrics.operationsPerSecond;

    return {
      performanceRatio,
      throughputRatio,
      fasterAdapter: performanceRatio > 1 ? "IndexedDB" : "LocalStorage",
      speedImprovement: Math.abs(performanceRatio - 1) * 100,
    };
  };

  describe("Basic CRUD Performance", () => {
    it("should benchmark PUT operations", async () => {
      const iterations = 50;
      const options: BenchmarkOptions = {
        iterations,
        dataSize: "medium",
        operationType: "put",
      };

      const indexedDBMetrics = await runBenchmark(
        indexedDBAdapter,
        "IndexedDB",
        options
      );
      const localStorageMetrics = await runBenchmark(
        localStorageAdapter,
        "LocalStorage",
        options
      );

      const comparison = compareBenchmarks(
        indexedDBMetrics,
        localStorageMetrics
      );

      // Validations
      expect(indexedDBMetrics.operationCount).toBe(iterations);
      expect(localStorageMetrics.operationCount).toBe(iterations);
      expect(indexedDBMetrics.averageTime).toBeGreaterThan(0);
      expect(localStorageMetrics.averageTime).toBeGreaterThan(0);

      // Performance assertions (reasonable expectations)
      expect(indexedDBMetrics.averageTime).toBeLessThan(1000); // Less than 1 second per operation
      expect(localStorageMetrics.averageTime).toBeLessThan(1000);

      // Log results for visibility
      expect(comparison).toBeDefined();
      expect(indexedDBMetrics.operationsPerSecond).toBeGreaterThan(0);
      expect(localStorageMetrics.operationsPerSecond).toBeGreaterThan(0);
    }, 30000); // 30 second timeout for benchmark

    it("should benchmark GET operations", async () => {
      const iterations = 50;
      const options: BenchmarkOptions = {
        iterations,
        dataSize: "medium",
        operationType: "get",
      };

      const indexedDBMetrics = await runBenchmark(
        indexedDBAdapter,
        "IndexedDB",
        options
      );
      const localStorageMetrics = await runBenchmark(
        localStorageAdapter,
        "LocalStorage",
        options
      );

      const comparison = compareBenchmarks(
        indexedDBMetrics,
        localStorageMetrics
      );

      expect(indexedDBMetrics.operationCount).toBe(iterations);
      expect(localStorageMetrics.operationCount).toBe(iterations);

      // GET operations should generally be faster than PUT operations
      expect(indexedDBMetrics.averageTime).toBeLessThan(500);
      expect(localStorageMetrics.averageTime).toBeLessThan(500);

      // Verify comparison metrics
      expect(comparison).toBeDefined();
      expect(indexedDBMetrics.operationsPerSecond).toBeGreaterThan(0);
      expect(localStorageMetrics.operationsPerSecond).toBeGreaterThan(0);
    }, 30000);

    it("should benchmark DELETE operations", async () => {
      const iterations = 50;
      const options: BenchmarkOptions = {
        iterations,
        dataSize: "medium",
        operationType: "delete",
      };

      const indexedDBMetrics = await runBenchmark(
        indexedDBAdapter,
        "IndexedDB",
        options
      );
      const localStorageMetrics = await runBenchmark(
        localStorageAdapter,
        "LocalStorage",
        options
      );

      const comparison = compareBenchmarks(
        indexedDBMetrics,
        localStorageMetrics
      );

      expect(indexedDBMetrics.operationCount).toBe(iterations);
      expect(localStorageMetrics.operationCount).toBe(iterations);

      // Verify comparison metrics
      expect(comparison).toBeDefined();
      expect(indexedDBMetrics.operationsPerSecond).toBeGreaterThan(0);
      expect(localStorageMetrics.operationsPerSecond).toBeGreaterThan(0);
    }, 30000);

    it("should benchmark LIST operations", async () => {
      const iterations = 20; // Fewer iterations for list operations
      const options: BenchmarkOptions = {
        iterations,
        dataSize: "small",
        operationType: "list",
      };

      const indexedDBMetrics = await runBenchmark(
        indexedDBAdapter,
        "IndexedDB",
        options
      );
      const localStorageMetrics = await runBenchmark(
        localStorageAdapter,
        "LocalStorage",
        options
      );

      const comparison = compareBenchmarks(
        indexedDBMetrics,
        localStorageMetrics
      );

      expect(indexedDBMetrics.operationCount).toBe(iterations);
      expect(localStorageMetrics.operationCount).toBe(iterations);

      // Verify comparison metrics
      expect(comparison).toBeDefined();
      expect(indexedDBMetrics.operationsPerSecond).toBeGreaterThan(0);
      expect(localStorageMetrics.operationsPerSecond).toBeGreaterThan(0);
    }, 30000);
  });

  describe("Data Size Impact", () => {
    it("should compare performance with different data sizes", async () => {
      const iterations = 20;
      const dataSizes: Array<"small" | "medium" | "large"> = [
        "small",
        "medium",
        "large",
      ];

      const results: Record<string, PerformanceMetrics[]> = {
        IndexedDB: [],
        LocalStorage: [],
      };

      for (const dataSize of dataSizes) {
        const options: BenchmarkOptions = {
          iterations,
          dataSize,
          operationType: "put",
        };

        const indexedDBMetrics = await runBenchmark(
          indexedDBAdapter,
          "IndexedDB",
          options
        );
        const localStorageMetrics = await runBenchmark(
          localStorageAdapter,
          "LocalStorage",
          options
        );

        results.IndexedDB.push(indexedDBMetrics);
        results.LocalStorage.push(localStorageMetrics);
      }

      // Verify that performance degrades gracefully with larger data
      const indexedDBResults = results.IndexedDB;
      const localStorageResults = results.LocalStorage;

      // Verify performance trends with data size
      expect(indexedDBResults[2].averageTime).toBeGreaterThan(
        indexedDBResults[0].averageTime
      );
      expect(localStorageResults[2].averageTime).toBeGreaterThan(
        localStorageResults[0].averageTime
      );

      // Verify all metrics are valid
      indexedDBResults.forEach((result) => {
        expect(result.operationsPerSecond).toBeGreaterThan(0);
        expect(result.averageTime).toBeGreaterThan(0);
      });
      localStorageResults.forEach((result) => {
        expect(result.operationsPerSecond).toBeGreaterThan(0);
        expect(result.averageTime).toBeGreaterThan(0);
      });
    }, 60000); // 1 minute timeout for comprehensive benchmark
  });

  describe("Concurrent Operations Performance", () => {
    it("should handle concurrent operations efficiently", async () => {
      const concurrentOperations = 10;
      const testData = generateTestData("medium");
      const store = "concurrent-test";

      // IndexedDB concurrent test
      const indexedDBStartTime = performance.now();
      const indexedDBPromises = Array.from(
        { length: concurrentOperations },
        (_, i) =>
          indexedDBAdapter.put(store, `concurrent-key-${i}`, {
            ...testData,
            id: i,
          })
      );
      await Promise.all(indexedDBPromises);
      const indexedDBTotalTime = performance.now() - indexedDBStartTime;

      // LocalStorage concurrent test
      const localStorageStartTime = performance.now();
      const localStoragePromises = Array.from(
        { length: concurrentOperations },
        (_, i) =>
          localStorageAdapter.put(store, `concurrent-key-${i}`, {
            ...testData,
            id: i,
          })
      );
      await Promise.all(localStoragePromises);
      const localStorageTotalTime = performance.now() - localStorageStartTime;

      // Validate that concurrent operations completed
      expect(indexedDBTotalTime).toBeGreaterThan(0);
      expect(localStorageTotalTime).toBeGreaterThan(0);

      // Verify all data was stored correctly
      for (let i = 0; i < concurrentOperations; i++) {
        const indexedDBResult = await indexedDBAdapter.get(
          store,
          `concurrent-key-${i}`
        );
        const localStorageResult = await localStorageAdapter.get(
          store,
          `concurrent-key-${i}`
        );

        expect(indexedDBResult).toBeDefined();
        expect(localStorageResult).toBeDefined();
        expect((indexedDBResult as { id: number }).id).toBe(i);
        expect((localStorageResult as { id: number }).id).toBe(i);
      }

      // Verify performance metrics
      expect(indexedDBTotalTime).toBeGreaterThan(0);
      expect(localStorageTotalTime).toBeGreaterThan(0);
      expect(indexedDBTotalTime / concurrentOperations).toBeLessThan(1000); // Less than 1 second per operation
      expect(localStorageTotalTime / concurrentOperations).toBeLessThan(1000);
    }, 30000);
  });

  describe("Memory Usage and Efficiency", () => {
    it("should handle large datasets without memory issues", async () => {
      const largeDataset = 100;
      const store = "memory-test";
      const testData = generateTestData("large");

      // Memory usage before operations
      const memoryBefore =
        (performance as unknown as { memory?: { usedJSHeapSize: number } })
          .memory?.usedJSHeapSize || 0;

      // Store large dataset in IndexedDB
      const indexedDBStartTime = performance.now();
      for (let i = 0; i < largeDataset; i++) {
        await indexedDBAdapter.put(store, `large-item-${i}`, {
          ...testData,
          id: i,
        });
      }
      const indexedDBStoreTime = performance.now() - indexedDBStartTime;

      // Retrieve large dataset from IndexedDB
      const indexedDBRetrieveStartTime = performance.now();
      const indexedDBResults = [];
      for (let i = 0; i < largeDataset; i++) {
        const result = await indexedDBAdapter.get(store, `large-item-${i}`);
        indexedDBResults.push(result);
      }
      const indexedDBRetrieveTime =
        performance.now() - indexedDBRetrieveStartTime;

      // Memory usage after operations
      const memoryAfter =
        (performance as unknown as { memory?: { usedJSHeapSize: number } })
          .memory?.usedJSHeapSize || 0;

      // Verify memory usage is reasonable (if memory info is available)
      if (memoryBefore > 0 && memoryAfter > 0) {
        expect(memoryAfter).toBeGreaterThanOrEqual(memoryBefore);
      }

      // Validations
      expect(indexedDBResults.length).toBe(largeDataset);
      expect(indexedDBResults.every((result) => result !== null)).toBe(true);

      // Performance expectations for large datasets
      expect(indexedDBStoreTime).toBeLessThan(30000); // Less than 30 seconds to store
      expect(indexedDBRetrieveTime).toBeLessThan(15000); // Less than 15 seconds to retrieve

      // Verify metrics
      expect(indexedDBStoreTime / largeDataset).toBeLessThan(300); // Less than 300ms per item
      expect(indexedDBRetrieveTime / largeDataset).toBeLessThan(150); // Less than 150ms per item
      expect((largeDataset / indexedDBStoreTime) * 1000).toBeGreaterThan(0); // Operations per second > 0
      expect((largeDataset / indexedDBRetrieveTime) * 1000).toBeGreaterThan(0);
    }, 60000); // 1 minute timeout for large dataset test
  });

  describe("Real-world Scenario Performance", () => {
    it("should simulate guild management system operations", async () => {
      const store = "real-world-test";

      // Simulate typical guild management operations
      const scenarios = [
        {
          name: "Create Guild",
          operation: async (adapter: StorageAdapter) => {
            const guild = generateTestData("medium");
            await adapter.put(store, "guild-1", guild);
          },
        },
        {
          name: "Load Guild",
          operation: async (adapter: StorageAdapter) => {
            await adapter.get(store, "guild-1");
          },
        },
        {
          name: "Create Multiple Contracts",
          operation: async (adapter: StorageAdapter) => {
            const contracts = Array.from({ length: 10 }, (_, i) => ({
              id: `contract-${i}`,
              guildId: "guild-1",
              title: `Contract ${i}`,
              value: Math.floor(Math.random() * 1000),
              status: "AVAILABLE",
            }));

            for (const contract of contracts) {
              await adapter.put(store, `contract-${contract.id}`, contract);
            }
          },
        },
        {
          name: "List All Items",
          operation: async (adapter: StorageAdapter) => {
            await adapter.list(store);
          },
        },
        {
          name: "Update Guild",
          operation: async (adapter: StorageAdapter) => {
            const existingGuild = await adapter.get(store, "guild-1");
            if (existingGuild) {
              await adapter.put(store, "guild-1", {
                ...existingGuild,
                lastUpdated: new Date(),
              });
            }
          },
        },
      ];

      const results: Record<
        string,
        { IndexedDB: number; LocalStorage: number }
      > = {};

      for (const scenario of scenarios) {
        // Test IndexedDB
        const indexedDBStartTime = performance.now();
        await scenario.operation(indexedDBAdapter);
        const indexedDBTime = performance.now() - indexedDBStartTime;

        // Test LocalStorage
        const localStorageStartTime = performance.now();
        await scenario.operation(localStorageAdapter);
        const localStorageTime = performance.now() - localStorageStartTime;

        results[scenario.name] = {
          IndexedDB: indexedDBTime,
          LocalStorage: localStorageTime,
        };
      }

      // Validate that all operations completed successfully
      Object.values(results).forEach(({ IndexedDB, LocalStorage }) => {
        expect(IndexedDB).toBeGreaterThan(0);
        expect(LocalStorage).toBeGreaterThan(0);
        expect(IndexedDB).toBeLessThan(5000); // Less than 5 seconds per operation
        expect(LocalStorage).toBeLessThan(5000);
      });

      // Verify that all scenario results are valid
      expect(Object.keys(results)).toHaveLength(scenarios.length);
      Object.entries(results).forEach(([scenarioName, metrics]) => {
        expect(scenarioName).toBeTruthy();
        expect(metrics.IndexedDB).toBeGreaterThan(0);
        expect(metrics.LocalStorage).toBeGreaterThan(0);
      });

      // Calculate overall performance comparison
      const totalIndexedDBTime = Object.values(results).reduce(
        (sum, r) => sum + r.IndexedDB,
        0
      );
      const totalLocalStorageTime = Object.values(results).reduce(
        (sum, r) => sum + r.LocalStorage,
        0
      );
      const overallPerformanceRatio =
        totalLocalStorageTime / totalIndexedDBTime;

      // Verify overall performance metrics
      expect(totalIndexedDBTime).toBeGreaterThan(0);
      expect(totalLocalStorageTime).toBeGreaterThan(0);
      expect(overallPerformanceRatio).toBeGreaterThan(0);
      expect(Math.abs(overallPerformanceRatio - 1) * 100).toBeLessThan(1000); // Reasonable performance difference
    }, 60000); // 1 minute timeout for real-world scenario
  });
});
