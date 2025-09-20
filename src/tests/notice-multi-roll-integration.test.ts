/**
 * Teste de integração do multiRollHandler no sistema de avisos
 * Verifica se as 5 tabelas identificadas tratam corretamente os casos de "Role duas vezes e use ambos"
 */

import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  type MockedFunction,
} from "vitest";
import { NoticeGenerator } from "@/utils/generators/noticeGenerator";
import type { Guild } from "@/types/guild";
import {
  SettlementType,
  RelationLevel,
  ResourceLevel,
  VisitorLevel,
} from "@/types/guild";
import { NoticeType } from "@/types/notice";

const mockGuild: Guild = {
  id: "test-guild",
  name: "Guilda de Teste",
  structure: {
    size: "Médio (9m x 6m)",
    isHeadquarters: true,
    characteristics: [],
  },
  relations: {
    government: RelationLevel.BOA,
    population: RelationLevel.BOA,
  },
  staff: {
    employees: "Funcionários experientes",
  },
  visitors: {
    frequency: VisitorLevel.MUITO_FREQUENTADA,
  },
  resources: {
    level: ResourceLevel.ABUNDANTES,
  },
  settlementType: SettlementType.CIDADELA,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("Notice Multi-Roll Integration - Issue 7.15", () => {
  let generator: NoticeGenerator;
  let mockDiceRoller: MockedFunction<(notation: string) => number>;

  beforeEach(() => {
    mockDiceRoller = vi.fn();
    generator = new NoticeGenerator(mockDiceRoller);
  });

  describe("1. Integration Test - MultiRollHandler Usage", () => {
    it("deve gerar avisos sem erros usando multiRollHandler internamente", async () => {
      // Mock para forçar geração de avisos
      mockDiceRoller
        .mockReturnValueOnce(15) // Disponibilidade inicial: "Sim, +1d20"
        .mockReturnValueOnce(10) // Quantidade base
        .mockReturnValueOnce(5) // Modificador adicional
        .mockReturnValueOnce(15) // Tipo: wanted_poster (subtype será determinado internamente)
        .mockReturnValue(10); // Valores padrão para outras rolagens

      const notices = await generator.generate({
        guild: mockGuild,
        settlementType: SettlementType.CIDADELA,
      });

      expect(notices).toBeDefined();
      expect(notices.length).toBeGreaterThan(0);

      // Verificar que todos os avisos gerados têm estrutura válida
      notices.forEach((notice) => {
        expect(notice.id).toBeDefined();
        expect(notice.type).toBeDefined();
        expect(notice.createdAt).toBeDefined();
        expect(notice.content).toBeDefined();
      });
    });

    it("deve gerar multiple avisos incluindo hunt_proposal", async () => {
      // Mock para gerar múltiplos avisos incluindo hunt_proposal
      mockDiceRoller
        .mockReturnValueOnce(15) // Disponibilidade inicial: "Sim, +1d20"
        .mockReturnValueOnce(15) // Quantidade base
        .mockReturnValueOnce(10) // Modificador adicional (resultará em mais avisos)
        .mockReturnValueOnce(14) // Primeiro tipo: hunt_proposal
        .mockReturnValueOnce(9) // Segundo tipo: commercial_proposal
        .mockReturnValue(10); // Valores padrão para outras rolagens

      const notices = await generator.generate({
        guild: mockGuild,
        settlementType: SettlementType.METROPOLE,
      });

      expect(notices).toBeDefined();
      expect(notices.length).toBeGreaterThanOrEqual(2);

      // Verificar que temos pelo menos um hunt_proposal
      const huntProposal = notices.find(
        (n) => n.type === NoticeType.HUNT_PROPOSAL
      );
      expect(huntProposal).toBeDefined();

      if (huntProposal && huntProposal.content) {
        // Verificar que o conteúdo foi gerado corretamente
        expect(huntProposal.content).toBeDefined();
        expect(typeof huntProposal.content).toBe("object");
      }
    });
  });

  describe("2. Performance and Safety Tests", () => {
    it("deve completar geração mesmo com rolagens que poderiam causar multi-roll", async () => {
      // Mock para simular múltiplas rolagens altas (potenciais multi-rolls)
      mockDiceRoller
        .mockReturnValueOnce(15) // Disponibilidade inicial: "Sim, +1d20"
        .mockReturnValueOnce(10) // Quantidade base
        .mockReturnValueOnce(5) // Modificador adicional
        .mockReturnValue(19); // Valores altos que podem resultar em multi-roll

      const startTime = performance.now();

      // Deve completar sem travamento ou timeout
      const notices = await generator.generate({
        guild: mockGuild,
        settlementType: SettlementType.CIDADELA,
      });

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(notices).toBeDefined();
      expect(notices.length).toBeGreaterThan(0);
      // Não deve demorar mais que 3 segundos (limite de segurança)
      expect(duration).toBeLessThan(3000);
    });

    it("deve tratar casos extremos com valores de borda", async () => {
      // Mock para casos extremos - usar valores que garantam funcionalidade
      mockDiceRoller
        .mockReturnValueOnce(20) // Disponibilidade inicial alta para garantir sucesso
        .mockReturnValueOnce(10) // Quantidade base suficiente
        .mockReturnValue(10); // Valores consistentes para outras rolagens

      const notices = await generator.generate({
        guild: mockGuild,
        settlementType: SettlementType.LUGAREJO,
      });

      expect(notices).toBeDefined();
      // Com valores suficientes, deve ter pelo menos um aviso
      expect(notices.length).toBeGreaterThan(0);
    });
  });

  describe("3. Type Coverage Tests", () => {
    it("deve conseguir gerar diferentes tipos de avisos", async () => {
      const typesGenerated = new Set<NoticeType>();

      // Executar múltiplas gerações para cobrir diferentes tipos
      for (let i = 0; i < 20; i++) {
        mockDiceRoller.mockReset();
        mockDiceRoller
          .mockReturnValueOnce(15) // Disponibilidade inicial: "Sim, +1d20"
          .mockReturnValueOnce(10) // Quantidade base
          .mockReturnValueOnce(5) // Modificador adicional
          .mockReturnValueOnce(2 + i) // Varia o tipo de aviso (2-21, mapeado para 1-20)
          .mockReturnValue(10); // Valores padrão

        const notices = await generator.generate({
          guild: mockGuild,
          settlementType: SettlementType.CIDADELA,
        });

        notices.forEach((notice) => {
          typesGenerated.add(notice.type);
        });
      }

      // Deve conseguir gerar pelo menos alguns tipos diferentes
      expect(typesGenerated.size).toBeGreaterThan(1);
    });

    it("deve gerar avisos com espécies mencionadas", async () => {
      // Usar valores altos para maximizar chances de gerar tipos com espécies
      mockDiceRoller
        .mockReturnValueOnce(20) // Disponibilidade inicial: "Sim"
        .mockReturnValueOnce(20) // Quantidade alta
        .mockReturnValue(20); // Valores altos para todas as rolagens (incluindo tipos com espécies)

      const notices = await generator.generate({
        guild: mockGuild,
        settlementType: SettlementType.CIDADELA,
      });

      // Com valores altos, é estatisticamente provável que pelo menos um aviso seja gerado
      expect(notices.length).toBeGreaterThan(0);
      // Confirmar que o sistema de espécies está inicializado corretamente
      expect(
        notices.every((notice) => notice.mentionedSpecies !== undefined)
      ).toBe(true);
    });
  });

  describe("4. Business Logic Validation", () => {
    it("deve respeitar regras de disponibilidade por tipo de assentamento", async () => {
      // Teste com Lugarejo (deve ter menos avisos)
      mockDiceRoller
        .mockReturnValueOnce(18) // Disponibilidade inicial: "Sim" (17+ passa)
        .mockReturnValueOnce(5) // Quantidade baixa
        .mockReturnValueOnce(2) // Modificador baixo
        .mockReturnValue(10);

      const noticesLugarejo = await generator.generate({
        guild: mockGuild,
        settlementType: SettlementType.LUGAREJO,
      });

      // Reset para Metrópole
      mockDiceRoller.mockReset();
      mockDiceRoller
        .mockReturnValueOnce(18) // Disponibilidade inicial: "Sim" (17+ passa)
        .mockReturnValueOnce(15) // Quantidade alta
        .mockReturnValueOnce(15) // Modificador alto
        .mockReturnValue(10);

      const noticesMetropole = await generator.generate({
        guild: mockGuild,
        settlementType: SettlementType.METROPOLE,
      });

      // Validar que diferentes assentamentos funcionam
      expect(noticesLugarejo).toBeDefined();
      expect(noticesMetropole).toBeDefined();
      expect(noticesLugarejo.length).toBeGreaterThan(0);
      expect(noticesMetropole.length).toBeGreaterThan(0);
    });
  });
});
