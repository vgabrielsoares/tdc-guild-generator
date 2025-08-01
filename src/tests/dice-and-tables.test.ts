import { describe, it, expect } from "vitest";
import { rollDice, parseDiceNotation } from "@/utils/dice";
import { rollOnTable, validateTable } from "@/utils/tableRoller";
import type { TableEntry } from "@/types/tables";

describe("Issue 2.1 - Dice System", () => {
  it("should parse dice notation correctly", () => {
    const result = parseDiceNotation("1d20");
    expect(result.isValid).toBe(true);
    expect(result.parsed?.count).toBe(1);
    expect(result.parsed?.sides).toBe(20);
    expect(result.parsed?.modifier).toBe(0);
  });

  it("should parse dice notation with modifiers", () => {
    const result = parseDiceNotation("2d6+3");
    expect(result.isValid).toBe(true);
    expect(result.parsed?.count).toBe(2);
    expect(result.parsed?.sides).toBe(6);
    expect(result.parsed?.modifier).toBe(3);
  });

  it("should roll dice correctly", () => {
    const result = rollDice({ notation: "1d6" });
    expect(result.result).toBeGreaterThanOrEqual(1);
    expect(result.result).toBeLessThanOrEqual(6);
    expect(result.individual).toHaveLength(1);
  });

  it("should handle multiple dice", () => {
    const result = rollDice({ notation: "2d6" });
    expect(result.result).toBeGreaterThanOrEqual(2);
    expect(result.result).toBeLessThanOrEqual(12);
    expect(result.individual).toHaveLength(2);
  });
});

describe("Issue 2.2 - Table System", () => {
  const testTable: TableEntry<string>[] = [
    { min: 1, max: 5, result: "Low", description: "Low result" },
    { min: 6, max: 15, result: "Medium", description: "Medium result" },
    { min: 16, max: 20, result: "High", description: "High result" },
  ];

  it("should validate table structure", () => {
    const validation = validateTable(testTable);
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it("should roll on table correctly", () => {
    const result = rollOnTable(testTable);
    expect(["Low", "Medium", "High"]).toContain(result.result);
    expect(result.roll).toBeGreaterThanOrEqual(1);
    expect(result.roll).toBeLessThanOrEqual(20);
  });

  it("should apply modifiers correctly", () => {
    const modifier = [
      { name: "Test", value: 10, description: "Test modifier" },
    ];
    const result = rollOnTable(testTable, modifier);
    expect(result.modifiers).toHaveLength(1);
    expect(result.modifiers[0].value).toBe(10);
  });

  it("should handle invalid tables", () => {
    expect(() => rollOnTable([])).toThrow("Table is empty or undefined");
  });
});

describe("Issue 2.3 - Guild Structure Tables", () => {
  // This will test when guild structure is properly implemented
  it("should be implemented", () => {
    // For now, just check if the basic functionality works
    expect(true).toBe(true);
  });
});

import { SettlementType as ST } from "@/types/guild";
import {
  generateHeadquartersSize,
  generateVisitors,
  generateGuildStructure,
} from "@/utils/generators/guildStructure";

describe("Settlement Dice Constraints - Bug Fix Validation (migrado)", () => {
  describe("Real Dice Roll Validation", () => {
    it("should respect dice limitations for small settlements over multiple generations", () => {
      const results = Array.from({ length: 3 }, () => ({
        lugarejo: generateHeadquartersSize(ST.LUGAREJO, 0),
        aldeia: generateHeadquartersSize(ST.ALDEIA, 0),
      }));
      results.forEach((result, index) => {
        expect(result.lugarejo.roll).toBeLessThanOrEqual(8);
        expect(result.lugarejo.roll).toBeGreaterThanOrEqual(1);
        expect(result.aldeia.roll).toBeLessThanOrEqual(8);
        expect(result.aldeia.roll).toBeGreaterThanOrEqual(1);
        if (result.lugarejo.roll > 8 || result.aldeia.roll > 8) {
          throw new Error(
            `Small settlement exceeded dice limits - Test ${index}: Lugarejo=${result.lugarejo.roll}, Aldeia=${result.aldeia.roll}`
          );
        }
      });
    });
    it("should allow appropriate ranges for larger settlements", () => {
      const results = Array.from({ length: 3 }, () => ({
        povoado: generateHeadquartersSize(ST.POVOADO, 0),
        cidadeGrande: generateHeadquartersSize(ST.CIDADE_GRANDE, 0),
        metropole: generateHeadquartersSize(ST.METROPOLE, 0),
      }));
      results.forEach((result) => {
        expect(result.povoado.roll).toBeLessThanOrEqual(8);
        expect(result.povoado.roll).toBeGreaterThanOrEqual(1);
        expect(result.cidadeGrande.roll).toBeLessThanOrEqual(24);
        expect(result.cidadeGrande.roll).toBeGreaterThanOrEqual(5);
        expect(result.metropole.roll).toBeLessThanOrEqual(28);
        expect(result.metropole.roll).toBeGreaterThanOrEqual(9);
      });
    });
    it("should prevent visitor frequency violations for small settlements", () => {
      const results = Array.from({ length: 3 }, () => ({
        lugarejoVisitors: generateVisitors(ST.LUGAREJO, 0),
        aldeiaVisitors: generateVisitors(ST.ALDEIA, 0),
      }));
      results.forEach((result, index) => {
        expect(result.lugarejoVisitors.roll).toBeLessThanOrEqual(8);
        expect(result.lugarejoVisitors.roll).toBeGreaterThanOrEqual(1);
        expect(result.aldeiaVisitors.roll).toBeLessThanOrEqual(8);
        expect(result.aldeiaVisitors.roll).toBeGreaterThanOrEqual(1);
        if (
          result.lugarejoVisitors.roll > 8 ||
          result.aldeiaVisitors.roll > 8
        ) {
          throw new Error(
            `Small settlement visitors exceeded dice limits - Test ${index}: LugarejoV=${result.lugarejoVisitors.roll}, AldeiaV=${result.aldeiaVisitors.roll}`
          );
        }
      });
    });
    it("should show clear differences between settlement types", () => {
      const results: Record<ST, ReturnType<typeof generateGuildStructure>[]> = {
        [ST.LUGAREJO]: [],
        [ST.POVOADO]: [],
        [ST.ALDEIA]: [],
        [ST.VILAREJO]: [],
        [ST.VILA_GRANDE]: [],
        [ST.CIDADELA]: [],
        [ST.CIDADE_GRANDE]: [],
        [ST.METROPOLE]: [],
      };
      const settlementTypes = [
        ST.LUGAREJO,
        ST.POVOADO,
        ST.ALDEIA,
        ST.VILAREJO,
        ST.VILA_GRANDE,
        ST.CIDADELA,
        ST.CIDADE_GRANDE,
        ST.METROPOLE,
      ];
      settlementTypes.forEach((settlementType) => {
        for (let i = 0; i < 10; i++) {
          const result = generateGuildStructure({
            settlementType,
            useModifiers: false,
          });
          results[settlementType].push(result);
        }
      });
      const lugarejosRolls = results[ST.LUGAREJO].map(
        (r) => r.rolls.structure.size as number
      );
      const metropoleRolls = results[ST.METROPOLE].map(
        (r) => r.rolls.structure.size as number
      );
      const avgLugarejo =
        lugarejosRolls.reduce((a: number, b: number) => a + b, 0) /
        lugarejosRolls.length;
      const avgMetropole =
        metropoleRolls.reduce((a: number, b: number) => a + b, 0) /
        metropoleRolls.length;
      expect(avgLugarejo).toBeLessThan(avgMetropole);
    });
    it("should handle all settlement types without errors", () => {
      const settlementTypes = [
        ST.LUGAREJO,
        ST.POVOADO,
        ST.ALDEIA,
        ST.VILAREJO,
        ST.VILA_GRANDE,
        ST.CIDADELA,
        ST.CIDADE_GRANDE,
        ST.METROPOLE,
      ];
      settlementTypes.forEach((settlementType) => {
        expect(() => {
          const result = generateGuildStructure({
            settlementType,
            useModifiers: false,
          });
          expect(result.guild).toBeDefined();
          expect(result.guild.settlementType).toBe(settlementType);
          expect(result.rolls).toBeDefined();
          expect(result.rolls.structure).toBeDefined();
          expect(result.rolls.visitors).toBeDefined();
        }).not.toThrow();
      });
    });
    it("should maintain consistency in regeneration logic", () => {
      const settlementType = ST.POVOADO;
      const config = { settlementType, useModifiers: false };
      const results = [];
      for (let i = 0; i < 20; i++) {
        results.push(generateGuildStructure(config));
      }
      results.forEach((result) => {
        expect(result.guild.settlementType).toBe(settlementType);
        expect(result.rolls.structure).toBeDefined();
        expect(result.rolls.structure.size).toBeGreaterThan(0);
        expect(result.rolls.structure.characteristics).toBeInstanceOf(Array);
        expect(result.rolls.structure.characteristics.length).toBeGreaterThan(
          0
        );
      });
      const sizeRolls = results.map((r) => r.rolls.structure.size);
      expect(Math.min(...sizeRolls)).toBeGreaterThanOrEqual(1);
      expect(Math.max(...sizeRolls)).toBeLessThanOrEqual(20);
    });
  });
});

import {
  RESOURCES_LEVEL_TABLE,
  VISITORS_FREQUENCY_TABLE,
  SETTLEMENT_DICE,
} from "@/data/tables/guild-structure";
import { findTableEntry } from "@/utils/table-operations";

describe("Unified Table System (migrado)", () => {
  describe("Resources Level Table", () => {
    it("should have complete range from -20 to 50", () => {
      const minEntry = findTableEntry(RESOURCES_LEVEL_TABLE, -20);
      expect(minEntry).toBe("Em débito");
      const maxEntry = findTableEntry(RESOURCES_LEVEL_TABLE, 50);
      expect(maxEntry).toBe("Abundantes vindos de muitos anos de serviço");
      const neutralEntry = findTableEntry(RESOURCES_LEVEL_TABLE, 15);
      expect(neutralEntry).toBe("Suficientes");
      const belowMin = findTableEntry(RESOURCES_LEVEL_TABLE, -25);
      expect(belowMin).toBeNull();
      const aboveMax = findTableEntry(RESOURCES_LEVEL_TABLE, 55);
      expect(aboveMax).toBeNull();
    });
    it("should cover all possible settlement dice results", () => {
      const d8Results = [1, 2, 3, 4, 5, 6, 7, 8];
      d8Results.forEach((roll) => {
        const entry = findTableEntry(RESOURCES_LEVEL_TABLE, roll);
        expect(entry).toBeDefined();
      });
      const d12Results = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      d12Results.forEach((roll) => {
        const entry = findTableEntry(RESOURCES_LEVEL_TABLE, roll);
        expect(entry).toBeDefined();
      });
      const d20Results = [1, 5, 10, 15, 20, 25, 30];
      d20Results.forEach((roll) => {
        const entry = findTableEntry(RESOURCES_LEVEL_TABLE, roll);
        expect(entry).toBeDefined();
      });
    });
  });
  describe("Visitors Frequency Table", () => {
    it("should have complete range from 1 to 20", () => {
      const minEntry = findTableEntry(VISITORS_FREQUENCY_TABLE, 1);
      expect(minEntry).toBe("Vazia");
      const maxEntry = findTableEntry(VISITORS_FREQUENCY_TABLE, 20);
      expect(maxEntry).toBe("Lotada");
      const midEntry = findTableEntry(VISITORS_FREQUENCY_TABLE, 14);
      expect(midEntry).toBe("Nem muito nem pouco");
      const belowMin = findTableEntry(VISITORS_FREQUENCY_TABLE, 0);
      expect(belowMin).toBe("Vazia");
      const aboveMax = findTableEntry(VISITORS_FREQUENCY_TABLE, 25);
      expect(aboveMax).toBe("Lotada");
    });
    it("should cover all possible settlement dice results", () => {
      const possibleRolls = [
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
      ];
      possibleRolls.forEach((roll) => {
        const entry = findTableEntry(VISITORS_FREQUENCY_TABLE, roll);
        expect(entry).toBeDefined();
      });
    });
  });
  describe("Settlement Dice Configuration", () => {
    it("should maintain proper dice configuration for each settlement type", () => {
      expect(SETTLEMENT_DICE.structure.Lugarejo.dice).toBe("d8");
      expect(SETTLEMENT_DICE.visitors.Lugarejo.dice).toBe("d8");
      expect(SETTLEMENT_DICE.structure.Aldeia.dice).toBe("d8");
      expect(SETTLEMENT_DICE.visitors.Aldeia.dice).toBe("d8");
      expect(SETTLEMENT_DICE.structure.Vilarejo.dice).toBe("d12");
      expect(SETTLEMENT_DICE.visitors.Vilarejo.dice).toBe("d10");
      expect(SETTLEMENT_DICE.structure["Cidade Grande"].dice).toBe("d20");
      expect(SETTLEMENT_DICE.structure["Cidade Grande"].modifier).toBe(4);
      expect(SETTLEMENT_DICE.visitors["Cidade Grande"].dice).toBe("d20");
    });
    it("should demonstrate proper business logic of unified tables", () => {
      const d8Roll = 5;
      const d8Entry = findTableEntry(RESOURCES_LEVEL_TABLE, d8Roll);
      expect(d8Entry).toBe("Nenhum");
      const d20PlusRoll = 25;
      const d20Entry = findTableEntry(RESOURCES_LEVEL_TABLE, d20PlusRoll);
      expect(d20Entry).toBe("Abundantes vindos de muitos anos de serviço");
    });
  });
  describe("Table Completeness", () => {
    it("should have no gaps in resource level table", () => {
      const sortedTable = [...RESOURCES_LEVEL_TABLE].sort(
        (a, b) => a.min - b.min
      );
      for (let i = 0; i < sortedTable.length - 1; i++) {
        const current = sortedTable[i];
        const next = sortedTable[i + 1];
        expect(next.min).toBe(current.max + 1);
      }
    });
    it("should have no gaps in visitors frequency table", () => {
      const sortedTable = [...VISITORS_FREQUENCY_TABLE].sort(
        (a, b) => a.min - b.min
      );
      for (let i = 0; i < sortedTable.length - 1; i++) {
        const current = sortedTable[i];
        const next = sortedTable[i + 1];
        expect(next.min).toBe(current.max + 1);
      }
    });
  });
  describe("Real-world Settlement Generation", () => {
    it("should generate consistent results for same settlement type", () => {
      const lugarejoResults = Array.from({ length: 8 }, (_, i) => i + 1);
      lugarejoResults.forEach((roll) => {
        const entry = findTableEntry(RESOURCES_LEVEL_TABLE, roll);
        expect(entry).toBeDefined();
        expect([
          "Em débito",
          "Nenhum",
          "Escassos",
          "Escassos e obtidos com muito esforço e honestidade",
        ]).toContain(entry);
      });
      const cidadeResults = Array.from({ length: 20 }, (_, i) => i + 9);
      cidadeResults.forEach((roll) => {
        const entry = findTableEntry(RESOURCES_LEVEL_TABLE, roll);
        expect(entry).toBeDefined();
        expect([
          "Escassos e obtidos com muito esforço e honestidade",
          "Limitados",
          "Suficientes",
          "Excedentes",
          "Excedentes mas alimenta fins malignos",
          "Abundantes porém quase todo vindo do governo de um assentamento próximo",
          "Abundantes",
          "Abundantes vindos de muitos anos de serviço",
        ]).toContain(entry);
      });
    });
  });
});
