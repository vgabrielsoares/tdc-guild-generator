import { describe, it, expect, beforeEach } from "vitest";
import { rollOnTable, clearTableCache, getCacheStats } from "../utils/dice";
import type { TableEntry } from "../types/tables";

describe("Dice Table Performance Optimizations", () => {
  beforeEach(() => {
    clearTableCache();
  });

  describe("Small Tables (Linear Search)", () => {
    it("should use linear search for small tables", () => {
      const smallTable: TableEntry<string>[] = [
        { min: 1, max: 3, result: "Common" },
        { min: 4, max: 5, result: "Uncommon" },
        { min: 6, max: 6, result: "Rare" },
      ];

      const result = rollOnTable({
        table: smallTable,
        context: "small-test",
      });

      expect(result.result).toMatch(/Common|Uncommon|Rare/);

      // Should not create cache for small tables
      const stats = getCacheStats();
      expect(stats.cacheSize).toBe(0);
    });
  });

  describe("Medium Dense Tables (Map Lookup)", () => {
    it("should use map lookup for dense tables", () => {
      // Create a dense table (good range-to-size ratio)
      const denseTable: TableEntry<string>[] = [];
      for (let i = 1; i <= 20; i++) {
        denseTable.push({
          min: i,
          max: i,
          result: `Result ${i}`,
        });
      }

      const result1 = rollOnTable({
        table: denseTable,
        context: "dense-test",
      });

      expect(result1.result).toMatch(/Result \d+/);

      // Should create cache for dense tables
      const stats = getCacheStats();
      expect(stats.cacheSize).toBe(1);
      expect(stats.totalEntries).toBe(20);

      // Second call should use cached lookup
      const result2 = rollOnTable({
        table: denseTable,
        context: "dense-test",
      });

      expect(result2.result).toMatch(/Result \d+/);

      // Cache size should remain the same
      const stats2 = getCacheStats();
      expect(stats2.cacheSize).toBe(1);
    });
  });

  describe("Large Sparse Tables (Binary Search)", () => {
    it("should use binary search for large sparse tables", () => {
      // Create a large sparse table that covers a reasonable range
      const sparseTable: TableEntry<string>[] = [];
      for (let i = 0; i < 60; i++) {
        const min = i + 1;
        const max = i + 1; // Single value entries to ensure matches
        sparseTable.push({
          min,
          max,
          result: `Sparse Result ${i}`,
        });
      }

      const result = rollOnTable({
        table: sparseTable,
        context: "sparse-test",
      });

      expect(result.result).toMatch(/Sparse Result \d+/);

      // Should not create cache for large tables (uses binary search)
      const stats = getCacheStats();
      expect(stats.cacheSize).toBe(0);
    });
  });

  describe("Cache Management", () => {
    it("should manage cache correctly", () => {
      const table1: TableEntry<string>[] = Array.from(
        { length: 15 },
        (_, i) => ({
          min: i + 1,
          max: i + 1,
          result: `Table1-${i + 1}`,
        })
      );

      const table2: TableEntry<string>[] = Array.from(
        { length: 18 },
        (_, i) => ({
          min: i + 1,
          max: i + 1,
          result: `Table2-${i + 1}`,
        })
      );

      // Roll on both tables
      rollOnTable({ table: table1, context: "cache-test-1" });
      rollOnTable({ table: table2, context: "cache-test-2" });

      const stats = getCacheStats();
      expect(stats.cacheSize).toBe(2);
      expect(stats.totalEntries).toBe(33); // 15 + 18

      // Clear cache
      clearTableCache();
      const statsAfterClear = getCacheStats();
      expect(statsAfterClear.cacheSize).toBe(0);
      expect(statsAfterClear.totalEntries).toBe(0);
    });
  });

  describe("Edge Cases", () => {
    it("should handle overlapping ranges correctly", () => {
      const overlappingTable: TableEntry<string>[] = [
        { min: 1, max: 10, result: "Low" },
        { min: 5, max: 15, result: "Medium" }, // Overlap with previous
        { min: 11, max: 20, result: "High" },
      ];

      const result = rollOnTable({
        table: overlappingTable,
        context: "overlap-test",
      });

      expect(result.result).toMatch(/Low|Medium|High/);
      expect(result.tableEntry).toBeDefined();
    });

    it("should handle empty table gracefully", () => {
      expect(() => {
        rollOnTable({
          table: [],
          context: "empty-test",
        });
      }).toThrow("Table is empty or undefined");
    });
  });

  describe("Performance Characteristics", () => {
    it("should choose appropriate algorithm based on table characteristics", () => {
      // Test different table types and verify they use expected algorithms

      // Small table (< 10 entries) -> Linear search
      const smallTable = Array.from({ length: 5 }, (_, i) => ({
        min: i + 1,
        max: i + 1,
        result: `Small-${i}`,
      }));

      rollOnTable({ table: smallTable, context: "perf-small" });
      expect(getCacheStats().cacheSize).toBe(0); // No cache for small tables

      clearTableCache();

      // Dense table (good density, >= 10 entries, < 50 entries) -> Map lookup
      const denseTable = Array.from({ length: 15 }, (_, i) => ({
        min: i + 1,
        max: i + 1,
        result: `Dense-${i}`,
      }));

      rollOnTable({ table: denseTable, context: "perf-dense" });
      expect(getCacheStats().cacheSize).toBe(1); // Should cache dense tables

      clearTableCache();

      // Large table (>= 50 entries) -> Binary search (no cache)
      const largeTable = Array.from({ length: 60 }, (_, i) => ({
        min: i + 1,
        max: i + 3, // Small range to ensure some entries will match
        result: `Large-${i}`,
      }));

      rollOnTable({ table: largeTable, context: "perf-large" });
      expect(getCacheStats().cacheSize).toBe(0); // No cache for large tables (uses binary search)
    });
  });
});
