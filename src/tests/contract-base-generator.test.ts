/**
 * Teste completo para o Gerador Base de Contratos
 *
 * Este arquivo testa as funcionalidades implementadas
 *
 * Issue 4.11: Gerador Base de Contratos
 *
 * Funcionalidades testadas:
 * - Geração de quantidade baseada na sede
 * - Cálculo de valores base (1d100)
 * - Aplicação de modificadores básicos
 * - Geração de prazos
 * - Modificadores por relações
 * - Multiplicadores de dificuldade
 * - Tabelas de distância
 * - Redução por frequentadores
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  ContractGenerator,
  type ContractGenerationConfig,
} from "@/utils/generators/contractGenerator";
import {
  ContractStatus,
  ContractorType,
  PaymentType,
  ContractDifficulty,
  DeadlineType,
} from "@/types/contract";
import type { Guild } from "@/types/guild";
import type { Contract } from "@/types/contract";
import {
  VisitorLevel,
  RelationLevel,
  ResourceLevel,
  SettlementType,
} from "@/types/guild";

// Mock de uma guilda para testes
const mockGuild: Guild = {
  id: "test-guild",
  name: "Guilda de Teste",
  structure: {
    size: "Pequeno e modesto (6m x 6m)",
    characteristics: ["Característica teste"],
  },
  relations: {
    government: RelationLevel.BOA,
    population: RelationLevel.MUITO_BOA,
  },
  staff: {
    employees: "Funcionários normais",
    description: "Funcionários padrão",
  },
  visitors: {
    frequency: VisitorLevel.NEM_MUITO_NEM_POUCO,
  },
  resources: {
    level: ResourceLevel.SUFICIENTES,
  },
  createdAt: new Date(),
  settlementType: SettlementType.ALDEIA,
};

describe("ContractGenerator - Issue 4.11 - Implementação Completa", () => {
  let config: ContractGenerationConfig;

  beforeEach(() => {
    config = {
      guild: mockGuild,
      skipFrequentatorsReduction: true, // Para testes determinísticos
    };
  });

  describe("generateBaseContract", () => {
    it("deve gerar um contrato base válido", () => {
      const contract = ContractGenerator.generateBaseContract(config);

      // Verificar estrutura básica
      expect(contract.id).toBeDefined();
      expect(contract.id).toMatch(/^contract-/);
      expect(contract.title).toContain("Contrato #");
      expect(contract.description).toBeDefined();
      expect(contract.description).toContain("Local:");
      expect(contract.description).toContain("Contratante:");
      expect(contract.status).toBe(ContractStatus.DISPONIVEL);
      expect(Object.values(ContractorType)).toContain(contract.contractorType);
      expect(Object.values(PaymentType)).toContain(contract.paymentType);
      expect(contract.createdAt).toBeInstanceOf(Date);

      // Verificar valores seguindo tabela 1d100
      expect(contract.value.baseValue).toBeGreaterThanOrEqual(75);
      expect(contract.value.baseValue).toBeLessThanOrEqual(50000);
      expect(contract.value.experienceValue).toBeGreaterThanOrEqual(1);
      expect(contract.value.rewardValue).toBeGreaterThanOrEqual(1);
      expect(contract.value.finalGoldReward).toBeGreaterThanOrEqual(0);

      // Verificar dados de geração
      expect(contract.generationData.baseRoll).toBeGreaterThanOrEqual(1);
      expect(contract.generationData.baseRoll).toBeLessThanOrEqual(100);
      expect(contract.generationData.distanceRoll).toBeGreaterThanOrEqual(1);
      expect(contract.generationData.distanceRoll).toBeLessThanOrEqual(20);
      expect(contract.generationData.difficultyRoll).toBeGreaterThanOrEqual(1);
      expect(contract.generationData.difficultyRoll).toBeLessThanOrEqual(20);

      // Verificar dificuldade foi determinada pela rolagem
      expect(Object.values(ContractDifficulty)).toContain(contract.difficulty);

      // Verificar que modificadores estão presentes
      expect(contract.value.modifiers).toBeDefined();
      expect(contract.value.modifiers.distance).toBeDefined();
      expect(contract.value.modifiers.difficultyMultiplier).toBeDefined();
      expect(
        contract.value.modifiers.difficultyMultiplier.experienceMultiplier
      ).toBeGreaterThan(0);
      expect(
        contract.value.modifiers.difficultyMultiplier.rewardMultiplier
      ).toBeGreaterThan(0);
    });

    it("deve rolar 1d100 sem modificadores para valor base conforme regras", () => {
      const contract = ContractGenerator.generateBaseContract(config);

      // A rolagem base deve estar entre 1-100
      expect(contract.generationData.baseRoll).toBeGreaterThanOrEqual(1);
      expect(contract.generationData.baseRoll).toBeLessThanOrEqual(100);

      // O valor deve corresponder à tabela (mínimo 75)
      expect(contract.value.baseValue).toBeGreaterThanOrEqual(75);
    });

    it("deve calcular PO$ final como recompensa * 0.1", () => {
      const contract = ContractGenerator.generateBaseContract(config);

      const expectedGold =
        Math.round(contract.value.rewardValue * 0.1 * 100) / 100;
      expect(contract.value.finalGoldReward).toBe(expectedGold);
    });

    it("deve aplicar modificadores de distância (1d20)", () => {
      const contract = ContractGenerator.generateBaseContract(config);

      // Verificar que o modificador de distância foi aplicado
      expect(contract.value.modifiers.distance).toBeDefined();
      expect(contract.value.modifiers.distance).toBeGreaterThanOrEqual(-20);
      expect(contract.value.modifiers.distance).toBeLessThanOrEqual(20);
    });

    it("deve aplicar modificadores de dificuldade corretamente", () => {
      const contract = ContractGenerator.generateBaseContract(config);

      const { difficultyMultiplier } = contract.value.modifiers;

      // Verificar que multiplicadores estão nos valores esperados das tabelas
      expect([1, 2, 4, 8]).toContain(difficultyMultiplier.experienceMultiplier);
      expect([1, 1.3, 2, 3]).toContain(difficultyMultiplier.rewardMultiplier);
    });

    it("deve aplicar modificadores de relação conforme as tabelas", () => {
      const contract = ContractGenerator.generateBaseContract(config);

      // Para uma guilda com relação BOA com governo e MUITO_BOA com população
      // os modificadores devem estar nos ranges esperados
      expect(
        contract.value.modifiers.populationRelationValue
      ).toBeGreaterThanOrEqual(-20);
      expect(
        contract.value.modifiers.populationRelationValue
      ).toBeLessThanOrEqual(5);
      expect(
        contract.value.modifiers.governmentRelationValue
      ).toBeGreaterThanOrEqual(-25);
      expect(
        contract.value.modifiers.governmentRelationValue
      ).toBeLessThanOrEqual(10);
    });

    it("deve garantir que experienceValue e rewardValue sejam separados", () => {
      const contract = ContractGenerator.generateBaseContract(config);

      // Ambos começam com o mesmo valor base mas podem divergir com modificadores
      expect(contract.value.experienceValue).toBeGreaterThan(0);
      expect(contract.value.rewardValue).toBeGreaterThan(0);
      expect(contract.value.baseValue).toBeGreaterThan(0);

      // ExperienceValue é usado para orçamento do mestre, rewardValue para PO$
      expect(contract.value.finalGoldReward).toBe(
        Math.round(contract.value.rewardValue * 0.1 * 100) / 100
      );
    });
  });

  describe("Modificadores por Funcionários", () => {
    it("deve aplicar modificadores de funcionários despreparados na rolagem", () => {
      const guildWithBadStaff: Guild = {
        ...mockGuild,
        staff: {
          employees: "Funcionários despreparados",
          description: "Funcionários despreparados",
        },
      };

      const contract = ContractGenerator.generateBaseContract({
        guild: guildWithBadStaff,
        skipFrequentatorsReduction: true,
      });

      // Verificar que o modificador foi registrado (-2 na rolagem)
      expect(contract.value.modifiers.staffPreparation).toBe(-2);
    });

    it("deve aplicar modificadores de funcionários experientes na rolagem", () => {
      const guildWithGoodStaff: Guild = {
        ...mockGuild,
        staff: {
          employees: "Funcionários experientes",
          description: "Funcionários experientes",
        },
      };

      const contract = ContractGenerator.generateBaseContract({
        guild: guildWithGoodStaff,
        skipFrequentatorsReduction: true,
      });

      // Verificar que o modificador foi registrado (+2 na rolagem)
      expect(contract.value.modifiers.staffPreparation).toBe(2);
    });
  });

  describe("calculateContractQuantity - Regras Completas", () => {
    it("deve calcular quantidade seguindo regras do markdown", () => {
      const quantity = ContractGenerator.calculateContractQuantity(config);

      expect(quantity.totalGenerated).toBeGreaterThanOrEqual(0);
      expect(quantity.baseQuantity).toBeGreaterThanOrEqual(0);
      expect(quantity.reduction).toBe(0); // Pois skipFrequentatorsReduction = true
      expect(quantity.dice).toBe("1d6+1"); // Para "Pequeno e modesto"
      expect(quantity.modifier).toBe(0); // Funcionários normais
    });

    it("deve aplicar modificadores por funcionários experientes (+1)", () => {
      const experiencedStaffGuild: Guild = {
        ...mockGuild,
        staff: {
          employees: "Funcionários experientes",
          description: "Funcionários experientes",
        },
      };

      const quantity = ContractGenerator.calculateContractQuantity({
        guild: experiencedStaffGuild,
        skipFrequentatorsReduction: true,
      });

      expect(quantity.modifier).toBe(1); // Funcionários experientes (+1)
    });

    it("deve aplicar modificadores por funcionários despreparados (-1)", () => {
      const inexperiencedStaffGuild: Guild = {
        ...mockGuild,
        staff: {
          employees: "Funcionários despreparados",
          description: "Funcionários despreparados",
        },
      };

      const quantity = ContractGenerator.calculateContractQuantity({
        guild: inexperiencedStaffGuild,
        skipFrequentatorsReduction: true,
      });

      expect(quantity.modifier).toBe(-1); // Funcionários despreparados (-1)
    });
  });

  describe("Tabelas e dados corretos por tamanho da sede", () => {
    it("deve usar 1d6+1 para 'Pequeno e modesto'", () => {
      const quantity = ContractGenerator.calculateContractQuantity(config);
      expect(quantity.dice).toBe("1d6+1");
    });

    it("deve usar 1d4 para 'Minúsculo'", () => {
      const minusculeGuild: Guild = {
        ...mockGuild,
        structure: { ...mockGuild.structure, size: "Minúsculo (3m x 1,5m)" },
      };

      const quantity = ContractGenerator.calculateContractQuantity({
        guild: minusculeGuild,
        skipFrequentatorsReduction: true,
      });
      expect(quantity.dice).toBe("1d4");
    });

    it("deve usar 1d20+10 para 'Colossal e primorosa'", () => {
      const colossalGuild: Guild = {
        ...mockGuild,
        structure: {
          ...mockGuild.structure,
          size: "Colossal e primorosa (20m x 20m, +2 andares)",
        },
      };

      const quantity = ContractGenerator.calculateContractQuantity({
        guild: colossalGuild,
        skipFrequentatorsReduction: true,
      });
      expect(quantity.dice).toBe("1d20+10");
    });
  });

  describe("Redução por frequentadores - Implementação completa", () => {
    it("deve aplicar redução correta para 'Muito frequentada'", () => {
      const crowdedGuild: Guild = {
        ...mockGuild,
        visitors: { frequency: VisitorLevel.MUITO_FREQUENTADA },
      };

      const quantity = ContractGenerator.calculateContractQuantity({
        guild: crowdedGuild,
        skipFrequentatorsReduction: false,
      });

      // Deve ter aplicado redução (2d6 conforme tabela)
      expect(quantity.frequentatorsReduction).toBeGreaterThanOrEqual(0);
      expect(
        quantity.details.appliedModifiers.some(
          (mod) =>
            mod.includes("Redução por frequentadores") ||
            mod.includes("frequentadores")
        )
      ).toBe(true);
    });

    it("deve não aplicar redução para 'Vazia'", () => {
      const emptyGuild: Guild = {
        ...mockGuild,
        visitors: { frequency: VisitorLevel.VAZIA },
      };

      const quantity = ContractGenerator.calculateContractQuantity({
        guild: emptyGuild,
        skipFrequentatorsReduction: false,
      });

      // Não deve ter redução para guilda vazia
      expect(quantity.frequentatorsReduction).toBe(0);
      expect(
        quantity.details.appliedModifiers.some((mod) =>
          mod.includes("sem redução")
        )
      ).toBe(true);
    });

    it("deve aplicar redução para 'Abarrotada' (3d6)", () => {
      const packedGuild: Guild = {
        ...mockGuild,
        visitors: { frequency: VisitorLevel.ABARROTADA },
      };

      const quantity = ContractGenerator.calculateContractQuantity({
        guild: packedGuild,
        skipFrequentatorsReduction: false,
      });

      // Deve ter aplicado redução considerável
      expect(quantity.frequentatorsReduction).toBeGreaterThanOrEqual(0);
    });
  });

  describe("generateMultipleContracts", () => {
    it("deve gerar múltiplos contratos baseado na quantidade calculada", () => {
      const contracts = ContractGenerator.generateMultipleContracts(config);

      expect(Array.isArray(contracts)).toBe(true);
      expect(contracts.length).toBeGreaterThanOrEqual(0);

      // Verificar que todos os contratos são válidos
      contracts.forEach((contract: Contract) => {
        expect(contract.id).toBeDefined();
        expect(contract.value.baseValue).toBeGreaterThanOrEqual(75);
        expect(contract.value.finalGoldReward).toBeGreaterThanOrEqual(0);
        expect(contract.generationData.baseRoll).toBeGreaterThanOrEqual(1);
        expect(contract.generationData.baseRoll).toBeLessThanOrEqual(100);
      });
    });

    it("deve gerar contratos únicos", () => {
      const contracts = ContractGenerator.generateMultipleContracts(config);

      if (contracts.length > 1) {
        const ids = contracts.map((c) => c.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
      }
    });
  });

  describe("Modificadores por relações ruins", () => {
    it("deve aplicar modificadores para relações péssimas", () => {
      const badRelationsGuild: Guild = {
        ...mockGuild,
        relations: {
          government: RelationLevel.PESSIMA,
          population: RelationLevel.RUIM,
        },
      };

      const contract = ContractGenerator.generateBaseContract({
        guild: badRelationsGuild,
        skipFrequentatorsReduction: true,
      });

      // Verificar que modificadores negativos foram aplicados
      expect(
        contract.value.modifiers.populationRelationValue
      ).toBeLessThanOrEqual(0);
      expect(
        contract.value.modifiers.governmentRelationValue
      ).toBeLessThanOrEqual(0);
    });
  });

  describe("Geração de prazos conforme tabela", () => {
    it("deve gerar prazos seguindo a tabela 1d20", () => {
      const contract = ContractGenerator.generateBaseContract(config);

      expect(contract.deadline.type).toBeDefined();
      expect(contract.deadline.value).toBeDefined();

      // Verificar que o tipo é um dos valores válidos
      expect(Object.values(DeadlineType)).toContain(contract.deadline.type);
    });
  });
});
