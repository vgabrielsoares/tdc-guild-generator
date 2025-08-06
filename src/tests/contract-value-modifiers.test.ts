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

      // Configurar sequência determinística de rolagens
      mockRollDice
        .mockReturnValueOnce({
          result: 40, // 1d100 base do valor
          notation: "1d100",
          individual: [40],
          modifier: 0,
          timestamp: new Date(),
        })
        .mockReturnValueOnce({
          result: 12, // 1d20 para distância (modificador 0)
          notation: "1d20",
          individual: [12],
          modifier: 0,
          timestamp: new Date(),
        })
        .mockReturnValueOnce({
          result: 5, // 1d20 para dificuldade (multiplicador 1x)
          notation: "1d20",
          individual: [5],
          modifier: 0,
          timestamp: new Date(),
        })
        .mockReturnValue({
          result: 10, // Padrão para outras rolagens
          notation: "1d20",
          individual: [10],
          modifier: 0,
          timestamp: new Date(),
        });

      const contract = ContractGenerator.generateBaseContract({
        guild: mockGuild,
        skipFrequentatorsReduction: true,
      });

      // Verificar modificadores individualmente
      expect(contract.value.modifiers.populationRelationValue).toBe(1); // BOA = +1
      expect(contract.value.modifiers.governmentRelationValue).toBe(-25); // PÉSSIMA = -25
      expect(contract.value.modifiers.distance).toBe(0); // Rolagem 12 = 0

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
