import { describe, it, expect } from "vitest";
import {
  UNSIGNED_CONTRACT_RESOLUTION_TABLE,
  UNSIGNED_CONTRACT_RESOLUTION_TIME_TABLE,
  SIGNED_CONTRACT_RESOLUTION_TIME_TABLE,
  SIGNED_CONTRACT_RESOLUTION_TABLE,
  CONTRACT_FAILURE_REASONS_TABLE,
  NEW_CONTRACTS_TIME_TABLE,
  getPaymentTypeDice,
  calculateBreachPenalty,
  calculateRequirementClauseBonus,
  CONTRACT_BREACH_PENALTY_RATE,
  UNRESOLVED_CONTRACT_BONUS,
  REQUIREMENT_CLAUSE_BONUS,
} from "@/data/tables/contract-modifier-tables";
import type { TableEntry } from "@/types/tables";

describe("Contract Lifecycle Tables", () => {
  describe("Resolution Time Tables", () => {
    it("should have valid time ranges for signed contracts", () => {
      expect(SIGNED_CONTRACT_RESOLUTION_TIME_TABLE).toBeDefined();
      expect(SIGNED_CONTRACT_RESOLUTION_TIME_TABLE.length).toBeGreaterThan(0);

      SIGNED_CONTRACT_RESOLUTION_TIME_TABLE.forEach(
        (entry: TableEntry<string>) => {
          expect(entry.min).toBeGreaterThan(0);
          expect(entry.max).toBeGreaterThanOrEqual(entry.min);
          expect(entry.result).toMatch(
            /\d+\s+(dia|dias|semana|semanas|mês|meses)/
          );
        }
      );
    });

    it("should have valid time ranges for unsigned contracts", () => {
      expect(UNSIGNED_CONTRACT_RESOLUTION_TIME_TABLE).toBeDefined();
      expect(UNSIGNED_CONTRACT_RESOLUTION_TIME_TABLE.length).toBeGreaterThan(0);

      UNSIGNED_CONTRACT_RESOLUTION_TIME_TABLE.forEach(
        (entry: TableEntry<string>) => {
          expect(entry.min).toBeGreaterThan(0);
          expect(entry.max).toBeGreaterThanOrEqual(entry.min);
          expect(entry.result).toMatch(
            /\d+\s+(dia|dias|semana|semanas|mês|meses)/
          );
        }
      );
    });
  });

  describe("Contract Resolution Tables", () => {
    it("should cover all possible signed contract outcomes", () => {
      expect(SIGNED_CONTRACT_RESOLUTION_TABLE).toBeDefined();
      expect(SIGNED_CONTRACT_RESOLUTION_TABLE.length).toBeGreaterThan(0);

      SIGNED_CONTRACT_RESOLUTION_TABLE.forEach((entry) => {
        expect(entry.min).toBeGreaterThan(0);
        expect(entry.max).toBeGreaterThanOrEqual(entry.min);

        // Verifica tipos válidos de resolução para contratos assinados usando valores de enum
        const validResolutions = [
          "O contrato foi resolvido",
          "O contrato não foi resolvido",
          "O contrato foi resolvido mas com ressalvas",
          "Ainda não se sabe",
        ];
        expect(validResolutions).toContain(entry.result);
      });
    });

    it("should cover all possible unsigned contract outcomes", () => {
      expect(UNSIGNED_CONTRACT_RESOLUTION_TABLE).toBeDefined();
      expect(UNSIGNED_CONTRACT_RESOLUTION_TABLE.length).toBeGreaterThan(0);

      UNSIGNED_CONTRACT_RESOLUTION_TABLE.forEach((entry) => {
        expect(entry.min).toBeGreaterThan(0);
        expect(entry.max).toBeGreaterThanOrEqual(entry.min);
        expect(entry.result).toHaveProperty("description");
        expect(entry.result).toHaveProperty("action");
      });
    });
  });

  describe("Contract Failure Reasons Table", () => {
    it("should have valid failure reasons", () => {
      expect(CONTRACT_FAILURE_REASONS_TABLE).toBeDefined();
      expect(CONTRACT_FAILURE_REASONS_TABLE.length).toBeGreaterThan(0);

      CONTRACT_FAILURE_REASONS_TABLE.forEach((entry) => {
        expect(entry.min).toBeGreaterThan(0);
        expect(entry.max).toBeGreaterThanOrEqual(entry.min);

        // Verifica tipos válidos de razão de falha usando valores de enum
        const validReasons = [
          "Quebra devido a desistência",
          "Quebra devido a picaretagem do contratante",
          "Óbito de todos ou maioria dos envolvidos",
          "Prazo não cumprido ou contratados desaparecidos",
          "Quebra devido a cláusula adicional não cumprida",
          "Contratante morto ou desaparecido",
        ];
        expect(validReasons).toContain(entry.result);
      });
    });
  });

  describe("New Contracts Time Table", () => {
    it("should have valid time intervals for new contracts", () => {
      expect(NEW_CONTRACTS_TIME_TABLE).toBeDefined();
      expect(NEW_CONTRACTS_TIME_TABLE.length).toBeGreaterThan(0);

      NEW_CONTRACTS_TIME_TABLE.forEach((entry: TableEntry<string>) => {
        expect(entry.min).toBeGreaterThan(0);
        expect(entry.max).toBeGreaterThanOrEqual(entry.min);
        expect(entry.result).toMatch(
          /\d+\s+(dia|dias|semana|semanas|mês|meses)/
        );
      });
    });
  });

  describe("Payment Type Dice Functions", () => {
    it("should return correct dice notation for different value ranges", () => {
      const testValues = [10, 25, 50, 75, 95, 150];

      testValues.forEach((value) => {
        const dice = getPaymentTypeDice(value);
        expect(dice).toHaveProperty("diceNotation");
        expect(dice.diceNotation).toMatch(/^\d+d\d+(\+\d+)?$/);
      });
    });
  });

  describe("Contract Constants", () => {
    it("should have correct penalty rate", () => {
      expect(CONTRACT_BREACH_PENALTY_RATE).toBe(0.1);
    });

    it("should have correct bonus values", () => {
      expect(UNRESOLVED_CONTRACT_BONUS).toBe(2);
      expect(REQUIREMENT_CLAUSE_BONUS).toBe(5);
    });
  });

  describe("Calculation Functions", () => {
    it("should calculate breach penalty correctly", () => {
      expect(calculateBreachPenalty(100)).toBe(10);
      expect(calculateBreachPenalty(500)).toBe(50);
      expect(calculateBreachPenalty(0)).toBe(0);
    });

    it("should calculate requirement clause bonus correctly", () => {
      const bonus = calculateRequirementClauseBonus(2, 1);
      expect(bonus).toBe(15); // (2 + 1) * 5 = 15

      const noBonus = calculateRequirementClauseBonus(0, 0);
      expect(noBonus).toBe(0);

      const singleReq = calculateRequirementClauseBonus(1, 0);
      expect(singleReq).toBe(5); // 1 * 5 = 5
    });
  });
});
