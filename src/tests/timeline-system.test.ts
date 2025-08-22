import { describe, it, expect } from "vitest";
import {
  createGameDate,
  formatGameDate,
  addDays,
  getDaysDifference,
} from "@/utils/date-utils";
import { ScheduledEventType } from "@/types/timeline";

describe("Timeline System - Basic Functionality", () => {
  describe("Date Utils", () => {
    it("should create valid game dates", () => {
      const date = createGameDate(15, 6, 1000);
      expect(date.day).toBe(15);
      expect(date.month).toBe(6);
      expect(date.year).toBe(1000);
    });

    it("should format dates correctly", () => {
      const date = createGameDate(1, 1, 1000);
      const formatted = formatGameDate(date);
      expect(formatted).toBe("1 de Janeiro de 1000");
    });

    it("should add days correctly", () => {
      const date = createGameDate(15, 6, 1000);
      const newDate = addDays(date, 10);
      expect(newDate.day).toBe(25);
      expect(newDate.month).toBe(6);
      expect(newDate.year).toBe(1000);
    });

    it("should handle month overflow when adding days", () => {
      const date = createGameDate(25, 6, 1000); // Junho tem 30 dias
      const newDate = addDays(date, 10); // 25 + 10 = 35, deve ir para Julho
      expect(newDate.day).toBe(5);
      expect(newDate.month).toBe(7);
      expect(newDate.year).toBe(1000);
    });

    it("should calculate days difference correctly", () => {
      const date1 = createGameDate(1, 1, 1000);
      const date2 = createGameDate(8, 1, 1000);
      const diff = getDaysDifference(date1, date2);
      expect(diff).toBe(7);
    });
  });

  describe("Timeline Types", () => {
    it("should have all required event types", () => {
      expect(ScheduledEventType.NEW_CONTRACTS).toBe("new_contracts");
      expect(ScheduledEventType.CONTRACT_EXPIRATION).toBe(
        "contract_expiration"
      );
      expect(ScheduledEventType.CONTRACT_RESOLUTION).toBe(
        "contract_resolution"
      );
      expect(ScheduledEventType.NEW_NOTICES).toBe("new_notices");
      expect(ScheduledEventType.MEMBER_REGISTRY_UPDATE).toBe(
        "member_registry_update"
      );
    });
  });
});

describe("Timeline System - Edge Cases", () => {
  it("should handle leap years correctly", () => {
    const date = createGameDate(28, 2, 2000); // Ano bissexto
    const newDate = addDays(date, 1);
    expect(newDate.day).toBe(29);
    expect(newDate.month).toBe(2);
  });

  it("should handle year transitions", () => {
    const date = createGameDate(31, 12, 1000);
    const newDate = addDays(date, 1);
    expect(newDate.day).toBe(1);
    expect(newDate.month).toBe(1);
    expect(newDate.year).toBe(1001);
  });

  it("should throw error for invalid dates", () => {
    expect(() => createGameDate(32, 1, 1000)).toThrow();
    expect(() => createGameDate(29, 2, 1001)).toThrow(); // Não bissexto
    expect(() => createGameDate(1, 13, 1000)).toThrow();
    expect(() => createGameDate(1, 1, 0)).toThrow();
  });
});
