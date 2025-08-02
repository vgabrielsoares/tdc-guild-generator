/**
 * Teste básico para o Gerador Base de Contratos
 *
 * Este arquivo testa as funcionalidades implementadas para garantir que
 * seguem estritamente as regras do arquivo "[2-1] Contratos - Guilda.md"
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  ContractGenerator,
  type ContractGenerationConfig,
} from "@/utils/generators/contractGenerator";
import { ContractStatus, ContractorType, PaymentType } from "@/types/contract";
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

describe("ContractGenerator - Issue 4.11", () => {
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
      expect(contract.description).toBe("Contrato gerado automaticamente");
      expect(contract.status).toBe(ContractStatus.DISPONIVEL);
      expect(contract.contractorType).toBe(ContractorType.POVO);
      expect(contract.paymentType).toBe(PaymentType.TOTAL_GUILDA);
      expect(contract.createdAt).toBeInstanceOf(Date);

      // Verificar valores
      expect(contract.value.baseValue).toBeGreaterThanOrEqual(75);
      expect(contract.value.baseValue).toBeLessThanOrEqual(50000);
      expect(contract.value.experienceValue).toBeGreaterThanOrEqual(0);
      expect(contract.value.rewardValue).toBeGreaterThanOrEqual(0);
      expect(contract.value.finalGoldReward).toBeGreaterThanOrEqual(0);

      // Verificar dados de geração
      expect(contract.generationData.baseRoll).toBeGreaterThanOrEqual(1);
      expect(contract.generationData.baseRoll).toBeLessThanOrEqual(100);
      expect(contract.generationData.distanceRoll).toBeGreaterThanOrEqual(1);
      expect(contract.generationData.distanceRoll).toBeLessThanOrEqual(20);
      expect(contract.generationData.difficultyRoll).toBeGreaterThanOrEqual(1);
      expect(contract.generationData.difficultyRoll).toBeLessThanOrEqual(20);
    });

    it("deve aplicar modificadores baseados na guilda", () => {
      // Teste com guilda que tem relações ruins
      const badRelationsGuild: Guild = {
        ...mockGuild,
        relations: {
          government: RelationLevel.PESSIMA,
          population: RelationLevel.RUIM,
        },
        staff: {
          employees: "Funcionários despreparados",
          description: "Funcionários despreparados",
        },
      };

      const contract = ContractGenerator.generateBaseContract({
        guild: badRelationsGuild,
        skipFrequentatorsReduction: true,
      });

      // Verificar que modificadores foram aplicados
      expect(contract.value.modifiers.populationRelation).toBeDefined();
      expect(contract.value.modifiers.governmentRelation).toBeDefined();
      expect(contract.value.modifiers.distance).toBeDefined();
    });

    it("deve gerar prazos corretamente", () => {
      const contract = ContractGenerator.generateBaseContract(config);

      expect(contract.deadline.type).toBeDefined();
      expect(contract.deadline.value).toBeDefined();
      expect(typeof contract.deadline.isFlexible).toBe("boolean");
      expect(typeof contract.deadline.isArbitrary).toBe("boolean");
    });
  });

  describe("calculateContractQuantity", () => {
    it("deve calcular quantidade baseada no tamanho da sede", () => {
      const quantity = ContractGenerator.calculateContractQuantity(config);

      expect(quantity.totalGenerated).toBeGreaterThanOrEqual(0);
      expect(quantity.baseQuantity).toBeGreaterThanOrEqual(0);
      expect(quantity.reduction).toBe(0); // Pois skipFrequentatorsReduction = true
      expect(quantity.dice).toBe("1d6+1"); // Para "Pequeno e modesto"
      expect(quantity.modifier).toBe(0); // Funcionários normais
    });

    it("deve aplicar modificadores por funcionários experientes", () => {
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

      expect(quantity.modifier).toBe(1); // Funcionários experientes
    });

    it("deve aplicar redução por frequentadores quando não pulada", () => {
      const crowdedGuild: Guild = {
        ...mockGuild,
        visitors: {
          frequency: VisitorLevel.MUITO_FREQUENTADA,
        },
      };

      const quantity = ContractGenerator.calculateContractQuantity({
        guild: crowdedGuild,
        skipFrequentatorsReduction: false,
      });

      // Pode haver redução (mas não sempre, depende das rolagens)
      expect(quantity.reduction).toBeGreaterThanOrEqual(0);
    });
  });

  describe("generateMultipleContracts", () => {
    it("deve gerar múltiplos contratos", () => {
      const contracts = ContractGenerator.generateMultipleContracts(config);

      expect(Array.isArray(contracts)).toBe(true);
      expect(contracts.length).toBeGreaterThanOrEqual(0);

      // Verificar que todos os contratos são válidos
      contracts.forEach((contract: Contract) => {
        expect(contract.id).toBeDefined();
        expect(contract.status).toBe(ContractStatus.DISPONIVEL);
        expect(contract.value.finalGoldReward).toBeGreaterThanOrEqual(0);
      });
    });

    it("deve gerar contratos únicos", () => {
      const contracts = ContractGenerator.generateMultipleContracts(config);

      if (contracts.length > 1) {
        const ids = contracts.map((c: Contract) => c.id);
        const uniqueIds = new Set(ids);
        expect(uniqueIds.size).toBe(ids.length);
      }
    });
  });

  describe("Regras do arquivo markdown", () => {
    it("deve rolar 1d100 sem modificadores para valor base", () => {
      const contract = ContractGenerator.generateBaseContract(config);

      // A rolagem base deve estar entre 1-100
      expect(contract.generationData.baseRoll).toBeGreaterThanOrEqual(1);
      expect(contract.generationData.baseRoll).toBeLessThanOrEqual(100);

      // O valor deve corresponder à tabela
      expect(contract.value.baseValue).toBeGreaterThanOrEqual(75);
    });

    it("deve calcular PO$ final como recompensa * 0.1", () => {
      const contract = ContractGenerator.generateBaseContract(config);

      const expectedGold =
        Math.round(contract.value.rewardValue * 0.1 * 100) / 100;
      expect(contract.value.finalGoldReward).toBe(expectedGold);
    });

    it("deve usar dados corretos por tamanho da sede", () => {
      const quantity = ContractGenerator.calculateContractQuantity(config);

      // Para "Pequeno e modesto" deve ser 1d6+1
      expect(quantity.dice).toBe("1d6+1");
    });

    it("deve aplicar modificadores de dificuldade corretamente", () => {
      const contract = ContractGenerator.generateBaseContract(config);

      const { difficultyMultiplier } = contract.value.modifiers;

      // Verificar que multiplicadores estão nos valores esperados
      expect([1, 2, 4, 8]).toContain(difficultyMultiplier.experienceMultiplier);
      expect([1, 1.3, 2, 3]).toContain(difficultyMultiplier.rewardMultiplier);
    });
  });
});

describe("ContractGenerator - Issue 4.11", () => {
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
      expect(contract.description).toBe("Contrato gerado automaticamente");
      expect(contract.status).toBe(ContractStatus.DISPONIVEL);
      expect(contract.contractorType).toBe(ContractorType.POVO);
      expect(contract.paymentType).toBe(PaymentType.TOTAL_GUILDA);
      expect(contract.createdAt).toBeInstanceOf(Date);

      // Verificar valores
      expect(contract.value.baseValue).toBeGreaterThanOrEqual(75);
      expect(contract.value.baseValue).toBeLessThanOrEqual(50000);
      expect(contract.value.experienceValue).toBeGreaterThanOrEqual(0);
      expect(contract.value.rewardValue).toBeGreaterThanOrEqual(0);
      expect(contract.value.finalGoldReward).toBeGreaterThanOrEqual(0);

      // Verificar dados de geração
      expect(contract.generationData.baseRoll).toBeGreaterThanOrEqual(1);
      expect(contract.generationData.baseRoll).toBeLessThanOrEqual(100);
      expect(contract.generationData.distanceRoll).toBeGreaterThanOrEqual(1);
      expect(contract.generationData.distanceRoll).toBeLessThanOrEqual(20);
      expect(contract.generationData.difficultyRoll).toBeGreaterThanOrEqual(1);
      expect(contract.generationData.difficultyRoll).toBeLessThanOrEqual(20);
    });

    it("deve aplicar modificadores baseados na guilda", () => {
      // Teste com guilda que tem relações ruins
      const badRelationsGuild: Guild = {
        ...mockGuild,
        relations: {
          government: RelationLevel.PESSIMA,
          population: RelationLevel.RUIM,
        },
        staff: {
          employees: "Funcionários despreparados",
          description: "Funcionários despreparados",
        },
      };

      const contract = ContractGenerator.generateBaseContract({
        guild: badRelationsGuild,
        skipFrequentatorsReduction: true,
      });

      // Verificar que modificadores foram aplicados
      expect(contract.value.modifiers.populationRelation).toBeDefined();
      expect(contract.value.modifiers.governmentRelation).toBeDefined();
      expect(contract.value.modifiers.distance).toBeDefined();
    });

    it("deve gerar prazos corretamente", () => {
      const contract = ContractGenerator.generateBaseContract(config);

      expect(contract.deadline.type).toBeDefined();
      expect(contract.deadline.value).toBeDefined();
      expect(typeof contract.deadline.isFlexible).toBe("boolean");
      expect(typeof contract.deadline.isArbitrary).toBe("boolean");
    });
  });

  describe("calculateContractQuantity", () => {
    it("deve calcular quantidade baseada no tamanho da sede", () => {
      const quantity = ContractGenerator.calculateContractQuantity(config);

      expect(quantity.totalGenerated).toBeGreaterThanOrEqual(0);
      expect(quantity.baseQuantity).toBeGreaterThanOrEqual(0);
      expect(quantity.reduction).toBe(0); // Pois skipFrequentatorsReduction = true
      expect(quantity.dice).toBe("1d6+1"); // Para "Pequeno e modesto"
      expect(quantity.modifier).toBe(0); // Funcionários normais
    });

    it("deve aplicar modificadores por funcionários experientes", () => {
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

      expect(quantity.modifier).toBe(1); // Funcionários experientes
    });

    it("deve aplicar redução por frequentadores quando não pulada", () => {
      const crowdedGuild: Guild = {
        ...mockGuild,
        visitors: {
          frequency: VisitorLevel.MUITO_FREQUENTADA,
        },
      };

      const quantity = ContractGenerator.calculateContractQuantity({
        guild: crowdedGuild,
        skipFrequentatorsReduction: false,
      });

      // Pode haver redução (mas não sempre, depende das rolagens)
      expect(quantity.reduction).toBeGreaterThanOrEqual(0);
    });
  });

  describe("generateMultipleContracts", () => {
    it("deve gerar múltiplos contratos", () => {
      const contracts = ContractGenerator.generateMultipleContracts(config);

      expect(Array.isArray(contracts)).toBe(true);
      expect(contracts.length).toBeGreaterThanOrEqual(0);

      // Verificar que todos os contratos são válidos
      contracts.forEach((contract) => {
        expect(contract.id).toBeDefined();
        expect(contract.status).toBe(ContractStatus.DISPONIVEL);
        expect(contract.value.finalGoldReward).toBeGreaterThanOrEqual(0);
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

  describe("Regras do arquivo markdown", () => {
    it("deve rolar 1d100 sem modificadores para valor base", () => {
      const contract = ContractGenerator.generateBaseContract(config);

      // A rolagem base deve estar entre 1-100
      expect(contract.generationData.baseRoll).toBeGreaterThanOrEqual(1);
      expect(contract.generationData.baseRoll).toBeLessThanOrEqual(100);

      // O valor deve corresponder à tabela
      expect(contract.value.baseValue).toBeGreaterThanOrEqual(75);
    });

    it("deve calcular PO$ final como recompensa * 0.1", () => {
      const contract = ContractGenerator.generateBaseContract(config);

      const expectedGold =
        Math.round(contract.value.rewardValue * 0.1 * 100) / 100;
      expect(contract.value.finalGoldReward).toBe(expectedGold);
    });

    it("deve usar dados corretos por tamanho da sede", () => {
      const quantity = ContractGenerator.calculateContractQuantity(config);

      // Para "Pequeno e modesto" deve ser 1d6+1
      expect(quantity.dice).toBe("1d6+1");
    });

    it("deve aplicar modificadores de dificuldade corretamente", () => {
      const contract = ContractGenerator.generateBaseContract(config);

      const { difficultyMultiplier } = contract.value.modifiers;

      // Verificar que multiplicadores estão nos valores esperados
      expect([1, 2, 4, 8]).toContain(difficultyMultiplier.experienceMultiplier);
      expect([1, 1.3, 2, 3]).toContain(difficultyMultiplier.rewardMultiplier);
    });
  });
});
