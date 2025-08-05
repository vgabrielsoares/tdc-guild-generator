import { describe, it, expect, vi, beforeEach } from "vitest";
import { ContractGenerator } from "../utils/generators/contractGenerator";
import type { Guild } from "../types";
import {
  SettlementType,
  RelationLevel,
  ResourceLevel,
  VisitorLevel,
} from "../types";
import { rollDice } from "../utils/dice";

// Mock da função rollDice para controle determinístico
vi.mock("../utils/dice");

describe("Contract Value Modifiers - Fixed Roll Logic", () => {
  let mockGuild: Guild;

  beforeEach(() => {
    // Reset all mocks before each test
    vi.resetAllMocks();

    mockGuild = {
      id: "test-guild",
      name: "Guilda de Teste",
      settlementType: SettlementType.CIDADELA,
      structure: {
        size: "Médio (9m x 6m)",
        characteristics: ["Característica teste"],
      },
      staff: {
        employees: "despreparados",
        description: "Funcionários despreparados",
      },
      visitors: {
        frequency: VisitorLevel.NEM_MUITO_NEM_POUCO,
      },
      relations: {
        population: RelationLevel.BOA,
        government: RelationLevel.PESSIMA,
      },
      resources: {
        level: ResourceLevel.SUFICIENTES,
      },
      createdAt: new Date(),
    };
  });

  describe("Lógica de aplicação de modificadores", () => {
    it("deve aplicar modificadores à rolagem, não aos valores finais", () => {
      const mockRollDice = vi.mocked(rollDice);
      let rollCount = 0;

      mockRollDice.mockImplementation(({ notation }) => {
        rollCount++;

        if (notation === "1d100") {
          // Rolagem base do valor do contrato
          return {
            result: 40,
            notation,
            individual: [40],
            modifier: 0,
            timestamp: new Date(),
          };
        }

        if (notation === "1d20") {
          if (rollCount === 2) {
            // Primeira rolagem d20: distância = 12 (modificador 0)
            return {
              result: 12,
              notation,
              individual: [12],
              modifier: 0,
              timestamp: new Date(),
            };
          }
          if (rollCount === 3) {
            // Segunda rolagem d20: dificuldade = 5 (multiplicador 1x)
            return {
              result: 5,
              notation,
              individual: [5],
              modifier: 0,
              timestamp: new Date(),
            };
          }
          // Outras rolagens d20 (prazos, etc.)
          return {
            result: 10,
            notation,
            individual: [10],
            modifier: 0,
            timestamp: new Date(),
          };
        }

        // Qualquer outra rolagem
        return {
          result: 1,
          notation,
          individual: [1],
          modifier: 0,
          timestamp: new Date(),
        };
      });

      const contract = ContractGenerator.generateBaseContract({
        guild: mockGuild,
        skipFrequentatorsReduction: true,
      });

      // Com os modificadores calculados:
      // XP: 40 + 1(população) + (-25)(governo) + 0(distância) = 16 → valor 125
      expect(contract.value.experienceValue).toBe(125);

      // Recompensa: 40 + (-5)(população) + (-25)(governo) + (-2)(funcionários) + 0(distância) + 10(bônus) = 18 → valor 125
      expect(contract.value.rewardValue).toBe(125);
      expect(contract.value.modifiers.requirementsAndClauses).toBe(10);

      // Verificar que temos os pré-requisitos e cláusulas esperados
      expect(contract.prerequisites.length + contract.clauses.length).toBe(2);
    });
  });
});
