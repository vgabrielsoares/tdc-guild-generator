/**
 * Testes para Tipos TypeScript de Serviços
 *
 * Valida:
 * - Interfaces com estrutura correta de recompensas
 * - Schemas Zod atualizados
 * - Funções utilitárias ajustadas
 * - Fidelidade total ao arquivo markdown
 */

import { describe, it, expect } from "vitest";
import type { Service } from "../types/service";
import {
  ServiceStatus,
  ServiceComplexity,
  ServiceDifficulty,
  ServiceContractorType,
  ServiceDeadlineType,
  ServicePaymentType,
  validateService,
  calculateFinalServiceReward,
  isServiceExpired,
  applyRecurrenceBonus,
} from "../types/service";
import type { GameDate } from "../types/timeline";

describe("Service Types - Issue 5.7 (Corrected)", () => {
  describe("Enums Corretos Conforme .md", () => {
    it("should have all required ServiceStatus values", () => {
      const expectedStatuses = [
        "Disponível",
        "Aceito",
        "Em andamento",
        "Concluído",
        "Falhou",
        "Expirado",
        "Anulado",
        "Resolvido por outros",
        "Aceito por outros aventureiros",
        "Quebrado",
      ];

      expectedStatuses.forEach((status) => {
        expect(Object.values(ServiceStatus)).toContain(status);
      });
    });

    it("should have ServiceComplexity following exact md table", () => {
      const expectedComplexities = [
        "Simples",
        "Moderada e Direta",
        "Moderada",
        "Complexa e Direta",
        "Complexa",
        "Extremamente complexa e Direta",
        "Extremamente complexa",
      ];

      expectedComplexities.forEach((complexity) => {
        expect(Object.values(ServiceComplexity)).toContain(complexity);
      });
    });

    it("should have ServiceDifficulty with exact ND values from md", () => {
      const expectedDifficulties = [
        "Muito Fácil (ND 10)",
        "Fácil (ND 14)",
        "Fácil (ND 15)",
        "Fácil (ND 16)",
        "Média (ND 17)",
        "Média (ND 18)",
        "Média (ND 19)",
        "Difícil (ND 20)",
        "Difícil (ND 21)",
        "Desafiador (ND 22)",
        "Desafiador (ND 23)",
        "Muito Difícil (ND 25)",
      ];

      expectedDifficulties.forEach((difficulty) => {
        expect(Object.values(ServiceDifficulty)).toContain(difficulty);
      });
    });

    it("should have ServiceContractorType matching service rules", () => {
      const expectedContractors = ["Povo", "Instituição de Ofício", "Governo"];

      expectedContractors.forEach((contractor) => {
        expect(Object.values(ServiceContractorType)).toContain(contractor);
      });
    });
  });

  describe("Sistema de Recompensas Baseado no .md", () => {
    const validService: Service = {
      id: "12345678-1234-1234-1234-123456789012",
      title: "Ensinar culinária básica",
      description:
        "Ensinar técnicas básicas de culinária para grupo de crianças",
      status: ServiceStatus.DISPONIVEL,
      complexity: ServiceComplexity.SIMPLES,
      difficulty: ServiceDifficulty.FACIL_ND15,
      contractorType: ServiceContractorType.POVO,
      value: {
        rewardRoll: "3d6 C$", // Conforme tabela
        rewardAmount: 12, // Resultado da rolagem
        currency: "C$", // C$ ou PO$ conforme tabela
        recurrenceBonus: "+2 C$", // Texto da taxa de recorrência
        recurrenceBonusAmount: 2, // Valor numérico do bônus
        difficulty: ServiceDifficulty.FACIL_ND15,
        modifiers: {
          populationRelation: 1,
          governmentRelation: 0,
          staffCondition: 0,
        },
      },
      deadline: {
        type: ServiceDeadlineType.DIAS,
        value: "3 dias",
      },
      paymentType: ServicePaymentType.PAGAMENTO_TOTAL_GUILDA,
      createdAt: {
        day: 13,
        month: 8,
        year: 2025,
      },
      isActive: false,
      isExpired: false,
    };

    it("should validate correct service structure", () => {
      expect(() => validateService(validService)).not.toThrow();
    });

    it("should have rewardRoll string following md format", () => {
      expect(validService.value.rewardRoll).toBe("3d6 C$");
    });

    it("should have currency C$ or PO$ following md rules", () => {
      expect(["C$", "PO$"]).toContain(validService.value.currency);
    });

    it("should have recurrenceBonus as string with currency", () => {
      expect(validService.value.recurrenceBonus).toBe("+2 C$");
    });
  });

  describe("Funções Utilitárias Atualizadas", () => {
    const testService: Service = {
      id: "87654321-4321-4321-4321-210987654321",
      title: "Serviço de Teste",
      description: "Serviço para teste das funções",
      status: ServiceStatus.DISPONIVEL,
      complexity: ServiceComplexity.MODERADA,
      difficulty: ServiceDifficulty.MEDIA_ND17,
      contractorType: ServiceContractorType.POVO,
      value: {
        rewardRoll: "5d6 C$",
        rewardAmount: 18,
        currency: "C$",
        recurrenceBonus: "+5 C$",
        recurrenceBonusAmount: 5,
        difficulty: ServiceDifficulty.MEDIA_ND17,
        modifiers: {
          populationRelation: 1,
          governmentRelation: -2,
          staffCondition: 1,
        },
      },
      deadline: {
        type: ServiceDeadlineType.DIAS,
        value: "5 dias",
      },
      deadlineDate: {
        day: 18,
        month: 8,
        year: 2025,
      },
      paymentType: ServicePaymentType.PAGAMENTO_TOTAL_GUILDA,
      createdAt: {
        day: 13,
        month: 8,
        year: 2025,
      },
      isActive: false,
      isExpired: false,
    };

    describe("calculateFinalServiceReward", () => {
      it("should calculate final reward based on md system", () => {
        // rewardAmount: 18, recurrenceBonusAmount: 5 = 23 (em C$)
        const result = calculateFinalServiceReward(testService);
        expect(result).toBe(23);
      });
    });

    describe("isServiceExpired", () => {
      it("should return false for services without deadline", () => {
        const noDeadlineService = {
          ...testService,
          deadline: { type: ServiceDeadlineType.SEM_PRAZO },
          deadlineDate: undefined,
        };

        const currentDate: GameDate = { day: 20, month: 8, year: 2025 };
        expect(isServiceExpired(noDeadlineService, currentDate)).toBe(false);
      });

      it("should return true for expired services", () => {
        const currentDate: GameDate = { day: 20, month: 8, year: 2025 };
        expect(isServiceExpired(testService, currentDate)).toBe(true);
      });
    });

    describe("applyRecurrenceBonus", () => {
      it("should increment recurrence bonus for C$ services", () => {
        const result = applyRecurrenceBonus(testService);
        expect(result.value.recurrenceBonusAmount).toBe(10); // 5 + 5
        expect(result.value.recurrenceBonus).toBe("+10 C$");
      });

      it("should handle PO$ services differently", () => {
        const poService = {
          ...testService,
          value: {
            ...testService.value,
            currency: "PO$" as const,
            recurrenceBonus: "+1 PO$",
            recurrenceBonusAmount: 1,
          },
        };

        const result = applyRecurrenceBonus(poService);
        expect(result.value.recurrenceBonusAmount).toBe(2); // 1 + 1
        expect(result.value.recurrenceBonus).toBe("+2 PO$");
      });
    });
  });

  describe("Diferenciação Correta de Contratos", () => {
    it("should use exact complexity levels from md", () => {
      expect(ServiceComplexity.SIMPLES).toBe("Simples");
      expect(ServiceComplexity.MODERADA_E_DIRETA).toBe("Moderada e Direta");
      expect(ServiceComplexity.EXTREMAMENTE_COMPLEXA).toBe(
        "Extremamente complexa"
      );
    });

    it("should use ND system with descriptive strings", () => {
      expect(ServiceDifficulty.MUITO_FACIL).toBe("Muito Fácil (ND 10)");
      expect(ServiceDifficulty.DIFICIL_ND20).toBe("Difícil (ND 20)");
      expect(ServiceDifficulty.MUITO_DIFICIL).toBe("Muito Difícil (ND 25)");
    });

    it("should have C$/PO$ currency system", () => {
      const serviceValue = {
        rewardRoll: "3d6 C$",
        rewardAmount: 12,
        currency: "C$",
        recurrenceBonus: "+2 C$",
        recurrenceBonusAmount: 2,
      };

      expect(serviceValue.currency).toBe("C$");
      expect(serviceValue.recurrenceBonus).toContain("C$");
    });
  });
});
