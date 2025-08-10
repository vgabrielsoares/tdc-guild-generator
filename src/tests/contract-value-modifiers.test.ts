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
        population: RelationLevel.PESSIMA, // +4 para governo
        government: RelationLevel.EXCELENTE, // +5 para governo
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
      expect(contract.value.modifiers.populationRelationValue).toBe(0); // Não aplicado para contrato do governo
      expect(contract.value.modifiers.governmentRelationValue).toBe(5); // EXCELENTE = +5
      expect(contract.value.modifiers.distance).toBe(0); // Rolagem 12 = 0

      // Com os modificadores calculados:
      // XP: 40 + 0(população) + 5(governo) + 0(distância) = 45 → valor 600
      expect(contract.value.experienceValue).toBe(600);

      // Recompensa: 40 + 0(população) + 5(governo) + (-2)(funcionários) + 0(distância) + 10(bônus) = 53 → valor 1300
      expect(contract.value.rewardValue).toBe(1300);
      expect(contract.value.modifiers.requirementsAndClauses).toBe(10);

      // Verificar que temos os pré-requisitos e cláusulas esperados
      expect(contract.prerequisites.length + contract.clauses.length).toBe(2);
    });
  });
});
