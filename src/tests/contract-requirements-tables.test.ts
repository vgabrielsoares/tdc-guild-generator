/**
 * Testes para Tabelas de Pré-requisitos e Cláusulas de Contratos
 *
 * Testa:
 * - Fidelidade às tabelas originais do arquivo .md
 * - Modificadores de dados baseados em valor/recompensa
 * - Estrutura de dados e tipos
 * - Casos especiais (21+)
 */

import { describe, it, expect } from "vitest";
import {
  CONTRACT_PREREQUISITES_TABLE,
  CONTRACT_CLAUSES_TABLE,
  CONTRACT_PAYMENT_TYPE_TABLE,
  getPrerequisiteDiceModifier,
  getClauseDiceModifier,
  getPaymentDiceModifier,
  PrerequisiteType,
  ClauseType,
  PaymentType,
  CONTRACT_BREACH_PENALTY_PERCENTAGE,
  REWARD_MODIFIER_PER_REQUIREMENT,
} from "@/data/tables/contract-requirements-tables";
import { findTableEntry } from "@/utils/table-operations";

describe("Contract Requirements Tables - Issue 4.5", () => {
  describe("Funções de Modificadores de Dados", () => {
    describe("getPrerequisiteDiceModifier", () => {
      it("should return correct modifiers based on value result", () => {
        // Baseado na tabela "Dados por Resultado de Valor e Recompensa: Pré-requisitos"
        expect(getPrerequisiteDiceModifier(10)).toBe(-10); // 1-20: -10
        expect(getPrerequisiteDiceModifier(20)).toBe(-10); // 1-20: -10
        expect(getPrerequisiteDiceModifier(30)).toBe(-5); // 21-40: -5
        expect(getPrerequisiteDiceModifier(40)).toBe(-5); // 21-40: -5
        expect(getPrerequisiteDiceModifier(50)).toBe(0); // 41-60: +0
        expect(getPrerequisiteDiceModifier(60)).toBe(0); // 41-60: +0
        expect(getPrerequisiteDiceModifier(70)).toBe(5); // 61-80: +5
        expect(getPrerequisiteDiceModifier(80)).toBe(5); // 61-80: +5
        expect(getPrerequisiteDiceModifier(90)).toBe(10); // 81-100: +10
        expect(getPrerequisiteDiceModifier(100)).toBe(10); // 81-100: +10
        expect(getPrerequisiteDiceModifier(150)).toBe(15); // 101+: +15
      });
    });

    describe("getClauseDiceModifier", () => {
      it("should return correct modifiers based on reward result", () => {
        // Baseado na tabela "Dados por Resultado de Valor e Recompensa: Cláusulas Adicionais"
        expect(getClauseDiceModifier(10)).toBe(-2); // 1-20: -2
        expect(getClauseDiceModifier(20)).toBe(-2); // 1-20: -2
        expect(getClauseDiceModifier(30)).toBe(-1); // 21-40: -1
        expect(getClauseDiceModifier(40)).toBe(-1); // 21-40: -1
        expect(getClauseDiceModifier(50)).toBe(0); // 41-60: +0
        expect(getClauseDiceModifier(60)).toBe(0); // 41-60: +0
        expect(getClauseDiceModifier(70)).toBe(2); // 61-80: +2
        expect(getClauseDiceModifier(80)).toBe(2); // 61-80: +2
        expect(getClauseDiceModifier(90)).toBe(5); // 81-100: +5
        expect(getClauseDiceModifier(100)).toBe(5); // 81-100: +5
        expect(getClauseDiceModifier(150)).toBe(7); // 101+: +7
      });
    });

    describe("getPaymentDiceModifier", () => {
      it("should return correct modifiers based on value result", () => {
        // Baseado na tabela "Dados por Resultado de Valor e Recompensa: Tipo de Pagamento"
        expect(getPaymentDiceModifier(10)).toBe(-2); // 1-20: -2
        expect(getPaymentDiceModifier(20)).toBe(-2); // 1-20: -2
        expect(getPaymentDiceModifier(30)).toBe(-1); // 21-40: -1
        expect(getPaymentDiceModifier(40)).toBe(-1); // 21-40: -1
        expect(getPaymentDiceModifier(50)).toBe(0); // 41-60: +0
        expect(getPaymentDiceModifier(60)).toBe(0); // 41-60: +0
        expect(getPaymentDiceModifier(70)).toBe(2); // 61-80: +2
        expect(getPaymentDiceModifier(80)).toBe(2); // 61-80: +2
        expect(getPaymentDiceModifier(90)).toBe(5); // 81-100: +5
        expect(getPaymentDiceModifier(100)).toBe(5); // 81-100: +5
        expect(getPaymentDiceModifier(150)).toBe(7); // 101+: +7
      });
    });
  });

  describe("Tabela de Pré-requisitos", () => {
    it("should have correct table structure and coverage", () => {
      // Verificar que a tabela cobre 1-20
      const ranges = CONTRACT_PREREQUISITES_TABLE.map((entry) => ({
        min: entry.min,
        max: entry.max,
      }));

      for (let i = 1; i <= 20; i++) {
        const hasRange = ranges.some(
          (range) => i >= range.min && i <= range.max
        );
        expect(hasRange).toBe(true);
      }
    });

    it('should return "Nenhum" for rolls 1-5', () => {
      // Testa diferentes valores na faixa 1-5
      for (let roll = 1; roll <= 5; roll++) {
        const result = findTableEntry(CONTRACT_PREREQUISITES_TABLE, roll);

        expect(result).not.toBeNull();
        expect(result!.type).toBe(PrerequisiteType.NONE);
        expect(result!.description).toBe("Nenhum");
      }
    });

    it("should return correct renown requirements", () => {
      // Testa alguns valores específicos de renome
      const testCases = [
        { roll: 6, expectedRenown: 5, description: "5 de renome" },
        { roll: 10, expectedRenown: 10, description: "10 de renome" },
        { roll: 15, expectedRenown: 15, description: "15 de renome" },
        { roll: 20, expectedRenown: 50, description: "Ter 50 de renome" },
      ];

      testCases.forEach(({ roll, expectedRenown, description }) => {
        const result = findTableEntry(CONTRACT_PREREQUISITES_TABLE, roll);

        expect(result).not.toBeNull();
        expect(result!.type).toBe(PrerequisiteType.RENOWN);
        expect(result!.value).toBe(expectedRenown);
        expect(result!.description).toBe(description);
      });
    });

    it("should return caster requirements", () => {
      // Testa conjuradores
      const testCases = [
        {
          roll: 7,
          expectedDescription: "Um conjurador",
          expectedSubtype: undefined,
        },
        {
          roll: 17,
          expectedDescription: "Um conjurador arcano e um divino",
          expectedSubtype: "both_types",
        },
      ];

      testCases.forEach(({ roll, expectedDescription, expectedSubtype }) => {
        const result = findTableEntry(CONTRACT_PREREQUISITES_TABLE, roll);

        expect(result).not.toBeNull();
        expect(result!.type).toBe(PrerequisiteType.CASTER);
        expect(result!.description).toBe(expectedDescription);
        expect(result!.subtype).toBe(expectedSubtype);
      });
    });

    it("should return skill requirements with correct subtypes", () => {
      const testCases = [
        {
          roll: 9,
          expectedSubtype: "strength",
          expectedDesc: "Perícia treinada que envolve Força",
        },
        {
          roll: 12,
          expectedSubtype: "agility",
          expectedDesc: "Perícia treinada que envolve Agilidade",
        },
        {
          roll: 14,
          expectedSubtype: "presence",
          expectedDesc: "Perícia treinada que envolve Presença",
        },
        {
          roll: 16,
          expectedSubtype: "mind",
          expectedDesc: "Perícia treinada que envolve Mente",
        },
        {
          roll: 18,
          expectedSubtype: "influence",
          expectedDesc: "Perícia treinada que envolve Influência",
        },
      ];

      testCases.forEach(({ roll, expectedSubtype, expectedDesc }) => {
        const result = findTableEntry(CONTRACT_PREREQUISITES_TABLE, roll);

        expect(result).not.toBeNull();
        expect(result!.type).toBe(PrerequisiteType.SKILL);
        expect(result!.subtype).toBe(expectedSubtype);
        expect(result!.description).toBe(expectedDesc);
      });
    });

    it("should return group size requirement", () => {
      const result = findTableEntry(CONTRACT_PREREQUISITES_TABLE, 19);

      expect(result).not.toBeNull();
      expect(result!.type).toBe(PrerequisiteType.GROUP_SIZE);
      expect(result!.value).toBe(6);
      expect(result!.description).toBe("Grupo de no mínimo 6 membros");
    });
  });

  describe("Tabela de Cláusulas Adicionais", () => {
    it("should have correct table structure and coverage", () => {
      // Verificar que a tabela cobre 1-20
      const ranges = CONTRACT_CLAUSES_TABLE.map((entry) => ({
        min: entry.min,
        max: entry.max,
      }));

      for (let i = 1; i <= 20; i++) {
        const hasRange = ranges.some(
          (range) => i >= range.min && i <= range.max
        );
        expect(hasRange).toBe(true);
      }
    });

    it('should return "Nenhuma" for rolls 1-7', () => {
      // Testa diferentes valores na faixa 1-7
      for (let roll = 1; roll <= 7; roll++) {
        const result = findTableEntry(CONTRACT_CLAUSES_TABLE, roll);

        expect(result).not.toBeNull();
        expect(result!.type).toBe(ClauseType.NONE);
        expect(result!.description).toBe("Nenhuma");
        expect(result!.rewardModifier).toBe(0);
      }
    });

    it("should apply +5 reward modifier for all clauses except none", () => {
      // Testa todos os valores que devem dar +5
      for (let roll = 8; roll <= 20; roll++) {
        const result = findTableEntry(CONTRACT_CLAUSES_TABLE, roll);

        expect(result).not.toBeNull();
        expect(result!.rewardModifier).toBe(5);
        expect(result!.type).not.toBe(ClauseType.NONE);
      }
    });

    it("should return specific clauses for correct rolls", () => {
      const testCases = [
        {
          roll: 8,
          expectedType: ClauseType.NO_KILLING,
          expectedDesc: "Nenhum inimigo deve ser morto",
        },
        {
          roll: 9,
          expectedType: ClauseType.PROTECT_CREATURE,
          expectedDesc: "Uma criatura específica não pode ser ferida",
        },
        {
          roll: 11,
          expectedType: ClauseType.STEALTH,
          expectedDesc: "O objetivo deve ser concluído sem ser detectado",
        },
        {
          roll: 12,
          expectedType: ClauseType.NO_MAGIC,
          expectedDesc: "Proibido o uso de magia",
        },
        {
          roll: 20,
          expectedType: ClauseType.ABSOLUTE_SECRECY,
          expectedDesc: "Sigilo absoluto",
        },
      ];

      testCases.forEach(({ roll, expectedType, expectedDesc }) => {
        const result = findTableEntry(CONTRACT_CLAUSES_TABLE, roll);

        expect(result).not.toBeNull();
        expect(result!.type).toBe(expectedType);
        expect(result!.description).toBe(expectedDesc);
        expect(result!.rewardModifier).toBe(5);
      });
    });
  });

  describe("Tabela de Tipo de Pagamento", () => {
    it("should have correct table structure and coverage", () => {
      // Verificar que a tabela cobre 1-20+ (até valores altos para 21+)
      const ranges = CONTRACT_PAYMENT_TYPE_TABLE.map((entry) => ({
        min: entry.min,
        max: entry.max,
      }));

      for (let i = 1; i <= 25; i++) {
        const hasRange = ranges.some(
          (range) => i >= range.min && i <= range.max
        );
        expect(hasRange).toBe(true);
      }
    });

    it("should return direct contractor payment for rolls 1-3", () => {
      for (let roll = 1; roll <= 3; roll++) {
        const result = findTableEntry(CONTRACT_PAYMENT_TYPE_TABLE, roll);

        expect(result).not.toBeNull();
        expect(result!.type).toBe(PaymentType.DIRECT_FROM_CONTRACTOR);
        expect(result!.guildPercentage).toBe(0);
        expect(result!.contractorPercentage).toBe(100);
        expect(result!.includesGoods).toBe(false);
        expect(result!.includesServices).toBe(false);
      }
    });

    it("should return correct payment splits", () => {
      const testCases = [
        {
          roll: 5,
          expectedType: PaymentType.HALF_GUILD_HALF_CONTRACTOR,
          expectedGuild: 50,
          expectedContractor: 50,
          expectedGoods: false,
          expectedServices: false,
        },
        {
          roll: 8,
          expectedType: PaymentType.HALF_GUILD_HALF_GOODS,
          expectedGuild: 50,
          expectedContractor: 50,
          expectedGoods: true,
          expectedServices: false,
        },
        {
          roll: 15,
          expectedType: PaymentType.FULL_GUILD_PAYMENT,
          expectedGuild: 100,
          expectedContractor: 0,
          expectedGoods: false,
          expectedServices: false,
        },
        {
          roll: 25,
          expectedType: PaymentType.FULL_GUILD_PLUS_SERVICES,
          expectedGuild: 100,
          expectedContractor: 0,
          expectedGoods: false,
          expectedServices: true,
        },
      ];

      testCases.forEach(
        ({
          roll,
          expectedType,
          expectedGuild,
          expectedContractor,
          expectedGoods,
          expectedServices,
        }) => {
          const result = findTableEntry(CONTRACT_PAYMENT_TYPE_TABLE, roll);

          expect(result).not.toBeNull();
          expect(result!.type).toBe(expectedType);
          expect(result!.guildPercentage).toBe(expectedGuild);
          expect(result!.contractorPercentage).toBe(expectedContractor);
          expect(result!.includesGoods).toBe(expectedGoods);
          expect(result!.includesServices).toBe(expectedServices);
        }
      );
    });
  });

  describe("Constantes e Configurações", () => {
    it("should have correct contract breach penalty", () => {
      // Baseado na regra: "Quebrar um contrato gera uma multa no valor de 10% da recompensa em PO$"
      expect(CONTRACT_BREACH_PENALTY_PERCENTAGE).toBe(10);
    });

    it("should have correct reward modifier per requirement", () => {
      // Baseado na regra: "Cada pré-requisito e cláusula adicional aumenta a recompensa do contrato em 5 pontos"
      expect(REWARD_MODIFIER_PER_REQUIREMENT).toBe(5);
    });
  });

  describe("Casos Especiais - Rolagem 21+", () => {
    it("should handle prerequisite rolls above 20 (multiple prerequisites)", () => {
      // Para rolagens 21+, deve-se rolar duas vezes e usar ambos
      // Este teste documenta o comportamento esperado para implementação futura
      const result = findTableEntry(CONTRACT_PREREQUISITES_TABLE, 21);

      // A tabela deve permitir valores acima de 20 retornarem null
      // para que o gerador possa detectar e fazer rolagens múltiplas
      expect(result).toBeNull();

      // O gerador deve detectar valores >= 21 e fazer rolagens múltiplas
      // Isso será implementado na função de geração
    });

    it("should handle clause rolls above 20 (multiple clauses)", () => {
      // Para rolagens 21+, deve-se rolar duas vezes e usar ambos
      const result = findTableEntry(CONTRACT_CLAUSES_TABLE, 22);

      // Deve retornar null para valores > 20 para permitir tratamento especial
      expect(result).toBeNull();
    });
  });

  describe("Validação de Enum Coverage", () => {
    it("should use all prerequisite types in table", () => {
      const usedTypes = CONTRACT_PREREQUISITES_TABLE.map(
        (entry) => entry.result.type
      );
      const uniqueTypes = [...new Set(usedTypes)];

      // Verificar que todos os tipos principais estão representados
      expect(uniqueTypes).toContain(PrerequisiteType.NONE);
      expect(uniqueTypes).toContain(PrerequisiteType.RENOWN);
      expect(uniqueTypes).toContain(PrerequisiteType.CASTER);
      expect(uniqueTypes).toContain(PrerequisiteType.SKILL);
      expect(uniqueTypes).toContain(PrerequisiteType.PROFICIENCY);
      expect(uniqueTypes).toContain(PrerequisiteType.VEHICLE);
      expect(uniqueTypes).toContain(PrerequisiteType.GROUP_SIZE);
    });

    it("should use all clause types in table", () => {
      const usedTypes = CONTRACT_CLAUSES_TABLE.map(
        (entry) => entry.result.type
      );
      const uniqueTypes = [...new Set(usedTypes)];

      // Verificar que temos boa variedade de tipos de cláusulas
      expect(uniqueTypes.length).toBeGreaterThanOrEqual(10);
      expect(uniqueTypes).toContain(ClauseType.NONE);
      expect(uniqueTypes).toContain(ClauseType.NO_KILLING);
      expect(uniqueTypes).toContain(ClauseType.STEALTH);
      expect(uniqueTypes).toContain(ClauseType.ABSOLUTE_SECRECY);
    });

    it("should use all payment types in table", () => {
      const usedTypes = CONTRACT_PAYMENT_TYPE_TABLE.map(
        (entry) => entry.result.type
      );
      const uniqueTypes = [...new Set(usedTypes)];

      // Verificar que todos os tipos de pagamento estão representados
      expect(uniqueTypes).toContain(PaymentType.DIRECT_FROM_CONTRACTOR);
      expect(uniqueTypes).toContain(PaymentType.HALF_GUILD_HALF_CONTRACTOR);
      expect(uniqueTypes).toContain(PaymentType.FULL_GUILD_PAYMENT);
      expect(uniqueTypes).toContain(PaymentType.FULL_GUILD_PLUS_SERVICES);
    });
  });
});
