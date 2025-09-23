/**
 * Testes para Issue 7.20: Sistema de Renovação e Expiração
 *
 * Valida todas as funcionalidades implementadas para o sistema temporal
 * de avisos conforme regras do arquivo [3] Mural de Avisos - Guilda.md
 */

import { describe, it, expect, vi } from "vitest";
import {
  rollNewNoticesSchedule,
  rollNewNoticesQuantity,
  rollNoticeExpiration,
  calculateNextRenewalDate,
  shouldExpireNotice,
} from "@/utils/generators/noticeLifeCycle";
import {
  NEW_NOTICES_SCHEDULE_TABLE,
  RENEWAL_DICE_BY_SETTLEMENT,
  NOTICE_EXPIRATION_TABLE,
  EXPIRATION_MODIFIERS_BY_TYPE,
  getExpirationModifier,
} from "@/data/tables/notice-renewal-tables";
import { SettlementType } from "@/types/guild";
import { NoticeType } from "@/types/notice";
import type { GameDate } from "@/types/timeline";
import type { Notice } from "@/types/notice";

describe("Issue 7.20: Sistema de Renovação e Expiração", () => {
  describe("Tabela: Quando Novos Avisos Serão Fixados (1d20)", () => {
    it("deve implementar exatamente conforme tabela no .md", () => {
      // Verificar cobertura completa 1-20
      for (let roll = 1; roll <= 20; roll++) {
        const entry = NEW_NOTICES_SCHEDULE_TABLE.find(
          (e) => roll >= e.min && roll <= e.max
        );
        expect(entry).toBeDefined();
      }

      // Verificar entradas específicas
      expect(NEW_NOTICES_SCHEDULE_TABLE).toEqual([
        {
          min: 1,
          max: 1,
          result: {
            description: "2d4 meses",
            days: 0,
            isVariable: true,
            variableDice: "2d4",
          },
        },
        {
          min: 2,
          max: 2,
          result: {
            description: "Três meses",
            days: 90,
          },
        },
        {
          min: 3,
          max: 4,
          result: {
            description: "Dois meses",
            days: 60,
          },
        },
        {
          min: 5,
          max: 9,
          result: {
            description: "Um mês",
            days: 30,
          },
        },
        {
          min: 10,
          max: 13,
          result: {
            description: "2d4 semanas",
            days: 0,
            isVariable: true,
            variableDice: "2d4",
            multiplier: 7, // Converte semanas em dias
          },
        },
        {
          min: 14,
          max: 15,
          result: {
            description: "Três semanas",
            days: 21,
          },
        },
        {
          min: 16,
          max: 17,
          result: {
            description: "Duas semanas",
            days: 14,
          },
        },
        {
          min: 18,
          max: 18,
          result: {
            description: "Uma semana",
            days: 7,
          },
        },
        {
          min: 19,
          max: 19,
          result: {
            description: "Quatro dias",
            days: 4,
          },
        },
        {
          min: 20,
          max: 20,
          result: {
            description: "Dois dias",
            days: 2,
          },
        },
      ]);
    });

    it("deve calcular dias variáveis para 2d4 meses (roll 1)", () => {
      const mockRoller = vi
        .fn()
        .mockReturnValueOnce(1) // Primeiro roll: tabela principal
        .mockReturnValueOnce(3); // Segundo roll: 2d4 = 3

      const result = rollNewNoticesSchedule(mockRoller);

      expect(result.days).toBe(90); // 3 meses × 30 dias = 90 dias
      expect(result.description).toBe("2d4 meses (90 dias)");
    });

    it("deve calcular dias variáveis para 2d4 semanas (roll 10-13)", () => {
      const mockRoller = vi
        .fn()
        .mockReturnValueOnce(12) // Roll na tabela principal
        .mockReturnValueOnce(4); // 2d4 = 4 semanas

      const result = rollNewNoticesSchedule(mockRoller);

      expect(result.days).toBe(28); // 4 semanas × 7 dias = 28 dias
      expect(result.description).toBe("2d4 semanas (28 dias)");
    });

    it("deve retornar valores fixos para entradas não-variáveis", () => {
      const mockRoller = vi.fn().mockReturnValue(20); // "Dois dias"

      const result = rollNewNoticesSchedule(mockRoller);

      expect(result.days).toBe(2);
      expect(result.description).toBe("Dois dias");
    });
  });

  describe("Dados por Tamanho do Assentamento para Renovação", () => {
    it("deve implementar exatamente conforme tabela no .md", () => {
      expect(RENEWAL_DICE_BY_SETTLEMENT).toEqual({
        [SettlementType.LUGAREJO]: {
          dice: "1d20-15",
          description: "Lugarejo (1d20-15)",
        },
        [SettlementType.POVOADO]: {
          dice: "2d20-15",
          description: "Povoado (2d20-15)",
        },
        [SettlementType.ALDEIA]: {
          dice: "1d20-10",
          description: "Aldeia (1d20-10)",
        },
        [SettlementType.VILAREJO]: {
          dice: "2d20-10",
          description: "Vilarejo (2d20-10)",
        },
        [SettlementType.VILA_GRANDE]: {
          dice: "1d20-5",
          description: "Vila grande (1d20-5)",
        },
        [SettlementType.CIDADELA]: {
          dice: "2d20-5",
          description: "Cidadela (2d20-5)",
        },
        [SettlementType.CIDADE_GRANDE]: {
          dice: "2d20",
          description: "Cidade grande (2d20)",
        },
        [SettlementType.METROPOLE]: {
          dice: "2d20+5",
          description: "Metrópole (2d20+5)",
        },
      });
    });

    it("deve calcular quantidade com redutores conforme especificado", () => {
      const mockRoller1 = vi.fn().mockReturnValue(10);
      const lugarejo = rollNewNoticesQuantity(
        SettlementType.LUGAREJO,
        mockRoller1
      );

      // Verificar que o mock foi chamado com a notação correta
      expect(mockRoller1).toHaveBeenCalledWith("1d20-15");

      expect(lugarejo.quantity).toBe(10);
      expect(lugarejo.dice).toBe("1d20-15");

      // Teste para Cidade grande: 2d20 → sem modificadores
      const mockRoller2 = vi.fn().mockReturnValue(25);
      const cidadeGrande = rollNewNoticesQuantity(
        SettlementType.CIDADE_GRANDE,
        mockRoller2
      );
      expect(cidadeGrande.quantity).toBe(25);
      expect(cidadeGrande.dice).toBe("2d20");

      // Teste com resultado negativo que deve ser convertido para 0
      const mockRoller3 = vi.fn().mockReturnValue(-5);
      const lugarejo2 = rollNewNoticesQuantity(
        SettlementType.LUGAREJO,
        mockRoller3
      );
      expect(lugarejo2.quantity).toBe(0); // Math.max(0, -5) = 0
    });
  });

  describe("Tabela: Quando Avisos São Retirados ou Resolvidos (1d20)", () => {
    it("deve implementar exatamente conforme tabela no .md", () => {
      // Verificar cobertura completa 1-20
      for (let roll = 1; roll <= 20; roll++) {
        const entry = NOTICE_EXPIRATION_TABLE.find(
          (e) => roll >= e.min && roll <= e.max
        );
        expect(entry).toBeDefined();
      }

      // Verificar estrutura
      const expectedTable = [
        { min: 1, max: 1, description: "Três meses", days: 90 },
        { min: 2, max: 2, description: "Dois meses", days: 60 },
        { min: 3, max: 4, description: "Um mês", days: 30 },
        { min: 5, max: 6, description: "2d4 semanas", variable: true },
        { min: 7, max: 10, description: "Duas semanas", days: 14 },
        { min: 11, max: 13, description: "Uma semana", days: 7 },
        { min: 14, max: 15, description: "Quatro dias", days: 4 },
        { min: 16, max: 17, description: "Três dias", days: 3 },
        { min: 18, max: 19, description: "Dois dias", days: 2 },
        { min: 20, max: 20, description: "Um dia", days: 1 },
      ];

      expectedTable.forEach(({ min, max, description, days, variable }) => {
        const entry = NOTICE_EXPIRATION_TABLE.find(
          (e) => e.min === min && e.max === max
        );
        expect(entry).toBeDefined();
        expect(entry!.result.description).toBe(description);

        if (!variable) {
          expect(entry!.result.days).toBe(days);
        } else {
          expect(entry!.result.isVariable).toBe(true);
          expect(entry!.result.variableDice).toBe("2d4");
        }
      });
    });
  });

  describe("Modificadores por Tipo de Aviso", () => {
    it("deve implementar exatamente conforme tabela no .md", () => {
      expect(EXPIRATION_MODIFIERS_BY_TYPE).toEqual({
        [NoticeType.RESIDENTS_NOTICE]: 8, // Aviso dos habitantes
        [NoticeType.SERVICES]: 6, // Serviços
        [NoticeType.COMMERCIAL_PROPOSAL]: 4, // Proposta comercial
        [NoticeType.ANNOUNCEMENT]: 2, // Divulgação
        [NoticeType.HUNT_PROPOSAL]: 0, // Proposta de caçada
        [NoticeType.WANTED_POSTER]: -2, // Cartaz de procurado
        [NoticeType.CONTRACTS]: -4, // Contratos
        [NoticeType.OFFICIAL_STATEMENT]: -8, // Pronunciamento
        [NoticeType.EXECUTION]: 0, // Execuções (tratamento especial)
        [NoticeType.NOTHING]: 0, // Não se aplica
      });
    });

    it("deve aplicar modificadores corretamente na rolagem", () => {
      const mockRoller = vi.fn().mockReturnValue(10); // Base roll

      // Aviso dos habitantes: +8 → roll 10 + 8 = 18 → "Dois dias"
      const residentsResult = rollNoticeExpiration(
        NoticeType.RESIDENTS_NOTICE,
        mockRoller
      );
      expect(residentsResult.days).toBe(2);
      expect(residentsResult.description).toContain("+8");

      // Pronunciamento: -8 → roll 10 - 8 = 2 → "Dois meses"
      mockRoller.mockReturnValue(10);
      const statementResult = rollNoticeExpiration(
        NoticeType.OFFICIAL_STATEMENT,
        mockRoller
      );
      expect(statementResult.days).toBe(60);
      expect(statementResult.description).toContain("-8");
    });

    it("deve limitar rolagens finais entre 1-20", () => {
      // Test edge cases para evitar overflow/underflow
      const mockRoller = vi.fn();

      // Casos extremos: modificador alto + roll alto
      mockRoller.mockReturnValue(20);
      const highResult = rollNoticeExpiration(
        NoticeType.RESIDENTS_NOTICE,
        mockRoller
      );
      expect(highResult.days).toBe(1); // 20+8 limitado a 20 → "Um dia"

      // Casos extremos: modificador baixo + roll baixo
      mockRoller.mockReturnValue(1);
      const lowResult = rollNoticeExpiration(
        NoticeType.OFFICIAL_STATEMENT,
        mockRoller
      );
      expect(lowResult.days).toBe(90); // 1-8 limitado a 1 → "Três meses"
    });
  });

  describe("Casos Especiais: Execuções", () => {
    it("deve tratar execuções com rolagem normal mas identificar como dia da execução", () => {
      const mockRoller = vi.fn().mockReturnValue(15); // "Quatro dias"

      const result = rollNoticeExpiration(NoticeType.EXECUTION, mockRoller);

      expect(result.days).toBe(4);
      expect(result.description).toContain("Execução em");
      expect(result.isExecutionDay).toBe(true);
      expect(result.immediateRemoval).toBe(false);
    });

    it("deve aplicar modificador 0 para execuções", () => {
      expect(getExpirationModifier(NoticeType.EXECUTION)).toBe(0);
    });

    it("deve identificar que execuções são programadas, não expiradas", () => {
      const mockRoller = vi.fn().mockReturnValue(10);

      const executionResult = rollNoticeExpiration(
        NoticeType.EXECUTION,
        mockRoller
      );
      const contractResult = rollNoticeExpiration(
        NoticeType.CONTRACTS,
        mockRoller
      );

      // Execução é dia programado
      expect(executionResult.isExecutionDay).toBe(true);
      expect(executionResult.description).toContain("Execução em");

      // Contrato é expiração normal
      expect(contractResult.isExecutionDay).toBeUndefined();
      expect(contractResult.description).not.toContain("Execução em");
    });
  });

  describe("Integração Temporal", () => {
    it("deve calcular próxima data de renovação corretamente", () => {
      const mockRoller = vi.fn().mockReturnValue(20); // "Dois dias"

      const currentDate: GameDate = { year: 2024, month: 1, day: 15 };
      const renewalDate = calculateNextRenewalDate(currentDate, mockRoller);

      expect(renewalDate).toEqual({ year: 2024, month: 1, day: 17 });
    });

    it("deve verificar expiração de avisos corretamente", () => {
      const currentDate: GameDate = { year: 2024, month: 1, day: 15 };
      const expirationDate: GameDate = { year: 2024, month: 1, day: 14 }; // Ontem
      const futureExpirationDate: GameDate = { year: 2024, month: 1, day: 16 }; // Amanhã

      const mockNotice = {
        id: "test",
        type: NoticeType.RESIDENTS_NOTICE,
      };

      expect(
        shouldExpireNotice(mockNotice as Notice, currentDate, expirationDate)
      ).toBe(true);
      expect(
        shouldExpireNotice(
          mockNotice as Notice,
          currentDate,
          futureExpirationDate
        )
      ).toBe(false);
    });

    it("deve lidar com mudanças de mês/ano na verificação de expiração", () => {
      const currentDate: GameDate = { year: 2024, month: 2, day: 1 };
      const lastMonthExpiration: GameDate = { year: 2024, month: 1, day: 31 };
      const lastYearExpiration: GameDate = { year: 2023, month: 12, day: 31 };

      const mockNotice = { id: "test", type: NoticeType.RESIDENTS_NOTICE };

      expect(
        shouldExpireNotice(
          mockNotice as Notice,
          currentDate,
          lastMonthExpiration
        )
      ).toBe(true);
      expect(
        shouldExpireNotice(
          mockNotice as Notice,
          currentDate,
          lastYearExpiration
        )
      ).toBe(true);
    });
  });

  describe("Validação de Completude da Issue 7.20", () => {
    it("deve ter implementado todas as funcionalidades especificadas", () => {
      // ✅ Renovação do mural: Tabela 1d20 "Quando Novos Avisos Serão Fixados"
      expect(NEW_NOTICES_SCHEDULE_TABLE).toBeDefined();
      expect(NEW_NOTICES_SCHEDULE_TABLE.length).toBe(10);

      // ✅ Dados por tamanho para renovação: Tabelas específicas com redutores
      expect(RENEWAL_DICE_BY_SETTLEMENT).toBeDefined();
      expect(Object.keys(RENEWAL_DICE_BY_SETTLEMENT)).toHaveLength(8);

      // ✅ Expiração de avisos: Tabela 1d20 "Quando Avisos São Retirados"
      expect(NOTICE_EXPIRATION_TABLE).toBeDefined();
      expect(NOTICE_EXPIRATION_TABLE.length).toBe(10);

      // ✅ Modificadores por tipo: Habitantes +8, Serviços +6, etc.
      expect(EXPIRATION_MODIFIERS_BY_TYPE).toBeDefined();
      expect(Object.keys(EXPIRATION_MODIFIERS_BY_TYPE)).toHaveLength(10);

      // ✅ Casos especiais: Execuções com tratamento específico
      expect(getExpirationModifier(NoticeType.EXECUTION)).toBe(0);

      // ✅ Funções disponíveis para integração com timeline
      expect(typeof rollNewNoticesSchedule).toBe("function");
      expect(typeof rollNewNoticesQuantity).toBe("function");
      expect(typeof rollNoticeExpiration).toBe("function");
      expect(typeof calculateNextRenewalDate).toBe("function");
      expect(typeof shouldExpireNotice).toBe("function");
    });
  });
});
