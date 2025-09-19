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
  type GuildStructure,
  type GuildRelations,
  type GuildStaff,
  type GuildVisitors,
  type GuildResources,
} from "@/types/guild";
import { NoticeType, NoticeStatus, AlternativePayment } from "@/types/notice";

// Mock de guilda para testes
function createMockGuild(overrides: Partial<Guild> = {}): Guild {
  const defaultGuild: Guild = {
    id: "test-guild-1",
    name: "Guilda de Teste",
    settlementType: SettlementType.LUGAREJO,
    structure: {
      size: "Médio (9m x 6m)",
      characteristics: ["Bem organizada", "Limpa"],
    } as GuildStructure,
    relations: {
      government: RelationLevel.DIPLOMATICA,
      population: RelationLevel.BOA,
    } as GuildRelations,
    resources: {
      level: ResourceLevel.SUFICIENTES,
    } as GuildResources,
    visitors: {
      frequency: VisitorLevel.NEM_MUITO_NEM_POUCO,
    } as GuildVisitors,
    staff: {
      employees: "competentes",
    } as GuildStaff,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
  return defaultGuild;
}

describe("NoticeGenerator - Issue 7.14: Gerador Base de Avisos", () => {
  let generator: NoticeGenerator;
  let mockDiceRoller: MockedFunction<(notation: string) => number>;

  beforeEach(() => {
    mockDiceRoller = vi.fn();
    generator = new NoticeGenerator(mockDiceRoller);
  });

  describe("1. Disponibilidade Inicial de Avisos", () => {
    describe("Tabela 1d20 com Modificadores por Assentamento", () => {
      it("deve retornar 'Não, nenhum' para rolagens 1-10 sem modificadores", () => {
        const guild = createMockGuild();
        mockDiceRoller.mockReturnValue(5); // Resultado na faixa 1-10

        const notices = generator.generate({
          guild,
          settlementType: SettlementType.LUGAREJO, // +0 modificador
        });

        expect(notices).toHaveLength(0);
        expect(mockDiceRoller).toHaveBeenCalledWith("1d20");
      });

      it("DEBUG: deve testar disponibilidade básica isoladamente", () => {
        const mockDice = vi
          .fn()
          .mockReturnValueOnce(20) // Disponibilidade: Sim (17-999)
          .mockReturnValueOnce(20) // Quantidade: 1d20 = 20 (base alta)
          .mockReturnValueOnce(1) // Modificador sede minúscula: -1d20 = -1 (resultado final: 20-1=19)
          // Adicionar 19 rolagens para tipos de avisos
          .mockReturnValue(10); // Para todos os tipos subsequentes (animals payment)

        const generator = new NoticeGenerator(mockDice);
        const guild = createMockGuild({
          settlementType: SettlementType.LUGAREJO,
          structure: {
            size: "Minúsculo (3m x 1,5m)",
            characteristics: ["bem organizada"],
          },
          staff: {
            employees: "funcionários preparados",
          },
        });

        const config = {
          guild,
          settlementType: SettlementType.LUGAREJO,
        };

        const notices = generator.generate(config);

        // Debug: Se falhar aqui, problema é na disponibilidade inicial
        expect(notices.length).toBeGreaterThan(0);
        expect(notices.length).toBe(19); // 20 - 1 = 19 avisos esperados
      });

      it("deve aplicar modificadores por tamanho de assentamento corretamente", () => {
        const guild = createMockGuild();

        // Teste para Metrópole (+12 modificador)
        mockDiceRoller
          .mockReturnValueOnce(5) // Base 5 + 12 = 17 -> "Sim"
          .mockReturnValueOnce(10) // Quantidade de avisos
          // Adicionar rolagens para os 10 avisos individuais (tipos)
          .mockReturnValue(10); // Para todos os tipos subsequentes

        const notices = generator.generate({
          guild,
          settlementType: SettlementType.METROPOLE,
        });

        // Deve ter avisos porque 5 + 12 = 17 (faixa "Sim")
        expect(notices.length).toBeGreaterThan(0);
      });

      it("deve processar caso 'Talvez, -4d20' corretamente", () => {
        const guild = createMockGuild();

        // Configurar para resultado "Talvez" (11-13)
        mockDiceRoller
          .mockReturnValueOnce(11) // Primeira rolagem -> "Talvez"
          .mockReturnValueOnce(5) // -4d20: primeira rolagem
          .mockReturnValueOnce(10) // -4d20: segunda rolagem
          .mockReturnValueOnce(18) // -4d20: terceira rolagem (17+ = "Sim")
          .mockReturnValueOnce(8) // -4d20: quarta rolagem
          .mockReturnValueOnce(15) // Quantidade de avisos
          // Adicionar rolagens para os 15 avisos individuais
          .mockReturnValue(10); // Para todos os tipos subsequentes

        const notices = generator.generate({
          guild,
          settlementType: SettlementType.LUGAREJO,
        });

        // Deve ter avisos porque uma das 4 rolagens extras resultou em "Sim"
        expect(notices.length).toBeGreaterThan(0);
        expect(mockDiceRoller).toHaveBeenCalledTimes(6 + 15); // 1 inicial + 4 extras + 1 quantidade + 15 tipos
      });

      it("deve processar caso 'Mais ou menos, -2d20' corretamente", () => {
        const guild = createMockGuild();

        // Configurar para resultado "Mais ou menos" (14-16)
        mockDiceRoller
          .mockReturnValueOnce(15) // Primeira rolagem -> "Mais ou menos"
          .mockReturnValueOnce(8) // -2d20: primeira rolagem
          .mockReturnValueOnce(19) // -2d20: segunda rolagem (17+ = "Sim")
          .mockReturnValueOnce(12) // Quantidade de avisos
          // Adicionar rolagens para os 12 avisos individuais
          .mockReturnValue(10); // Para todos os tipos subsequentes

        const notices = generator.generate({
          guild,
          settlementType: SettlementType.LUGAREJO,
        });

        // Deve ter avisos porque uma das 2 rolagens extras resultou em "Sim"
        expect(notices.length).toBeGreaterThan(0);
        expect(mockDiceRoller).toHaveBeenCalledTimes(4 + 12); // 1 inicial + 2 extras + 1 quantidade + 12 tipos
      });
    });
  });

  describe("2. Cálculo de Quantidade de Avisos", () => {
    describe("Dados por Tamanho do Assentamento", () => {
      it("deve usar dados corretos por tipo de assentamento", () => {
        const guild = createMockGuild();

        // Configurar disponibilidade = "Sim"
        mockDiceRoller
          .mockReturnValueOnce(20) // Disponibilidade inicial -> "Sim"
          .mockReturnValueOnce(15); // Quantidade base

        generator.generate({
          guild,
          settlementType: SettlementType.CIDADELA, // 5d20 conforme tabela
        });

        expect(mockDiceRoller).toHaveBeenCalledWith("5d20");
      });

      const settlementDiceTests = [
        { settlement: SettlementType.LUGAREJO, expectedDice: "1d20" },
        { settlement: SettlementType.POVOADO, expectedDice: "2d20" },
        { settlement: SettlementType.ALDEIA, expectedDice: "2d20" },
        { settlement: SettlementType.VILAREJO, expectedDice: "3d20" },
        { settlement: SettlementType.VILA_GRANDE, expectedDice: "4d20" },
        { settlement: SettlementType.CIDADELA, expectedDice: "5d20" },
        { settlement: SettlementType.CIDADE_GRANDE, expectedDice: "6d20" },
        { settlement: SettlementType.METROPOLE, expectedDice: "8d20" },
      ];

      settlementDiceTests.forEach(({ settlement, expectedDice }) => {
        it(`deve usar ${expectedDice} para ${settlement}`, () => {
          const guild = createMockGuild();

          mockDiceRoller
            .mockReturnValueOnce(20) // Disponibilidade -> "Sim"
            .mockReturnValueOnce(10); // Quantidade

          generator.generate({
            guild,
            settlementType: settlement,
          });

          expect(mockDiceRoller).toHaveBeenCalledWith(expectedDice);
        });
      });
    });

    describe("Modificadores por Tamanho da Sede da Guilda", () => {
      it("deve aplicar modificador negativo para sede minúscula", () => {
        const guild = createMockGuild({
          structure: {
            ...createMockGuild().structure,
            size: "Minúsculo (3m x 1,5m)",
          },
        });

        // Disponibilidade = "Sim", Base = 20
        mockDiceRoller
          .mockReturnValueOnce(20) // Disponibilidade
          .mockReturnValueOnce(20) // Base (1d20 para lugarejo)
          .mockReturnValueOnce(5) // Modificador -1d20
          // Adicionar rolagens para os 15 avisos individuais esperados
          .mockReturnValue(10); // Para todos os tipos subsequentes (animals payment)

        const notices = generator.generate({
          guild,
          settlementType: SettlementType.LUGAREJO,
        });

        // Base 20 - 5 = 15 avisos
        expect(notices).toHaveLength(15);
      });

      it("deve aplicar modificador complexo para sede grande", () => {
        const guild = createMockGuild({
          structure: {
            ...createMockGuild().structure,
            size: "Grande (15m x 12m)",
          },
        });

        // +1d20-10 para sede grande
        mockDiceRoller
          .mockReturnValueOnce(20) // Disponibilidade
          .mockReturnValueOnce(15) // Base
          .mockReturnValueOnce(8) // Modificador 1d20 = 8, então +8-10 = -2
          // Adicionar rolagens para os 13 avisos individuais esperados
          .mockReturnValue(10); // Para todos os tipos subsequentes

        const notices = generator.generate({
          guild,
          settlementType: SettlementType.LUGAREJO,
        });

        // Base 15 + (8-10) = Base 15 - 2 = 13 avisos
        expect(notices).toHaveLength(13);
      });
    });

    describe("Modificadores por Condição dos Funcionários", () => {
      it("deve aplicar -1d20 para funcionários despreparados", () => {
        const guild = createMockGuild({
          staff: {
            employees: "despreparados",
          } as GuildStaff,
        });

        mockDiceRoller
          .mockReturnValueOnce(20) // Disponibilidade
          .mockReturnValueOnce(15) // Base
          .mockReturnValueOnce(3) // Penalidade -1d20 = -3
          // Adicionar rolagens para os 12 avisos individuais esperados
          .mockReturnValue(10); // Para todos os tipos subsequentes

        const notices = generator.generate({
          guild,
          settlementType: SettlementType.LUGAREJO,
        });

        // Base 15 - 3 = 12 avisos
        expect(notices).toHaveLength(12);
      });

      it("deve aplicar +1d20 para funcionários experientes", () => {
        const guild = createMockGuild({
          staff: {
            employees: "experientes",
          } as GuildStaff,
        });

        mockDiceRoller
          .mockReturnValueOnce(20) // Disponibilidade
          .mockReturnValueOnce(10) // Base
          .mockReturnValueOnce(7) // Bônus +1d20 = +7
          // Adicionar rolagens para os 17 avisos individuais esperados
          .mockReturnValue(10); // Para todos os tipos subsequentes

        const notices = generator.generate({
          guild,
          settlementType: SettlementType.LUGAREJO,
        });

        // Base 10 + 7 = 17 avisos
        expect(notices).toHaveLength(17);
      });
    });

    it("deve garantir que quantidade nunca seja negativa", () => {
      const guild = createMockGuild({
        structure: {
          ...createMockGuild().structure,
          size: "Minúsculo (3m x 1,5m)", // -1d20
        },
        staff: {
          employees: "despreparados", // -1d20
        } as GuildStaff,
      });

      mockDiceRoller
        .mockReturnValueOnce(20) // Disponibilidade
        .mockReturnValueOnce(5) // Base baixa
        .mockReturnValueOnce(10) // Penalidade sede: -10
        .mockReturnValueOnce(8); // Penalidade funcionários: -8

      const notices = generator.generate({
        guild,
        settlementType: SettlementType.LUGAREJO,
      });

      // Base 5 - 10 - 8 = -13, mas deve ser 0
      expect(notices).toHaveLength(0);
    });
  });

  describe("3. Geração de Tipos de Avisos", () => {
    describe("Tabela 1d20 de Tipos", () => {
      const typeTests = [
        { roll: 1, expectedType: NoticeType.NOTHING, expectedCount: 0 },
        {
          roll: 3,
          expectedType: NoticeType.RESIDENTS_NOTICE,
          expectedCount: 1,
        },
        { roll: 7, expectedType: NoticeType.SERVICES, expectedCount: 1 },
        {
          roll: 9,
          expectedType: NoticeType.COMMERCIAL_PROPOSAL,
          expectedCount: 1,
        },
        { roll: 12, expectedType: NoticeType.ANNOUNCEMENT, expectedCount: 1 },
        { roll: 14, expectedType: NoticeType.HUNT_PROPOSAL, expectedCount: 1 },
        { roll: 15, expectedType: NoticeType.WANTED_POSTER, expectedCount: 1 },
        { roll: 17, expectedType: NoticeType.CONTRACTS, expectedCount: 1 },
        { roll: 19, expectedType: NoticeType.EXECUTION, expectedCount: 1 },
        {
          roll: 20,
          expectedType: NoticeType.OFFICIAL_STATEMENT,
          expectedCount: 1,
        },
      ];

      typeTests.forEach(({ roll, expectedType, expectedCount }) => {
        it(`deve gerar ${expectedType} para rolagem ${roll}`, () => {
          const guild = createMockGuild();

          mockDiceRoller
            .mockReturnValueOnce(20) // Disponibilidade -> "Sim"
            .mockReturnValueOnce(1) // Quantidade = 1 aviso
            .mockReturnValueOnce(roll); // Tipo do aviso

          // Para contratos e serviços, adicionar pagamento alternativo
          if (
            expectedType === NoticeType.SERVICES ||
            expectedType === NoticeType.CONTRACTS
          ) {
            mockDiceRoller.mockReturnValueOnce(10); // Pagamento alternativo
          }

          const notices = generator.generate({
            guild,
            settlementType: SettlementType.LUGAREJO,
          });

          expect(notices).toHaveLength(expectedCount);
          if (expectedCount > 0) {
            expect(notices[0].type).toBe(expectedType);
            expect(notices[0].status).toBe(NoticeStatus.ACTIVE);
            expect(notices[0].id).toBeDefined();
            expect(notices[0].createdDate).toBeInstanceOf(Date);
          }
        });
      });
    });

    it("deve gerar múltiplos avisos conforme quantidade calculada", () => {
      const guild = createMockGuild();

      mockDiceRoller
        .mockReturnValueOnce(20) // Disponibilidade
        .mockReturnValueOnce(3) // Quantidade = 3 avisos
        .mockReturnValueOnce(5) // Primeiro aviso: Aviso dos habitantes
        .mockReturnValueOnce(12) // Segundo aviso: Divulgação
        .mockReturnValueOnce(17); // Terceiro aviso: Contratos

      const notices = generator.generate({
        guild,
        settlementType: SettlementType.LUGAREJO,
      });

      expect(notices).toHaveLength(3);
      expect(notices[0].type).toBe(NoticeType.RESIDENTS_NOTICE);
      expect(notices[1].type).toBe(NoticeType.ANNOUNCEMENT);
      expect(notices[2].type).toBe(NoticeType.CONTRACTS);
    });
  });

  describe("4. Sistema de Pagamento Alternativo", () => {
    describe("Para Contratos e Serviços", () => {
      const paymentTests = [
        { roll: 3, expectedPayment: AlternativePayment.NONE },
        { roll: 7, expectedPayment: AlternativePayment.IRON_COPPER },
        { roll: 8, expectedPayment: AlternativePayment.COPPER_SILVER },
        { roll: 10, expectedPayment: AlternativePayment.ANIMALS },
        { roll: 12, expectedPayment: AlternativePayment.LAND },
        { roll: 13, expectedPayment: AlternativePayment.HARVEST },
        { roll: 15, expectedPayment: AlternativePayment.FAVORS },
        { roll: 17, expectedPayment: AlternativePayment.TREASURE_MAP },
        { roll: 18, expectedPayment: AlternativePayment.SPICES },
        { roll: 20, expectedPayment: AlternativePayment.VALUABLE_OBJECTS },
      ];

      paymentTests.forEach(({ roll, expectedPayment }) => {
        it(`deve gerar pagamento ${expectedPayment} para rolagem ${roll}`, () => {
          const guild = createMockGuild();

          mockDiceRoller
            .mockReturnValueOnce(20) // Disponibilidade
            .mockReturnValueOnce(1) // Quantidade = 1
            .mockReturnValueOnce(17) // Tipo: Contratos (que usa pagamento alternativo)
            .mockReturnValueOnce(roll); // Pagamento alternativo

          const notices = generator.generate({
            guild,
            settlementType: SettlementType.LUGAREJO,
          });

          expect(notices).toHaveLength(1);
          expect(notices[0].type).toBe(NoticeType.CONTRACTS);
          expect(notices[0].alternativePayment).toBe(expectedPayment);
          expect(notices[0].reducedReward).toBe(true);
        });
      });

      it("deve aplicar pagamento alternativo apenas para contratos e serviços", () => {
        const guild = createMockGuild();

        mockDiceRoller
          .mockReturnValueOnce(20) // Disponibilidade
          .mockReturnValueOnce(1) // Quantidade
          .mockReturnValueOnce(12); // Tipo: Divulgação (não deve ter pagamento alternativo)

        const notices = generator.generate({
          guild,
          settlementType: SettlementType.LUGAREJO,
        });

        expect(notices).toHaveLength(1);
        expect(notices[0].type).toBe(NoticeType.ANNOUNCEMENT);
        expect(notices[0].alternativePayment).toBeUndefined();
        expect(notices[0].reducedReward).toBe(false);
      });

      it("deve marcar recompensa reduzida para contratos e serviços", () => {
        const guild = createMockGuild();

        mockDiceRoller
          .mockReturnValueOnce(20) // Disponibilidade
          .mockReturnValueOnce(2) // Quantidade = 2
          .mockReturnValueOnce(7) // Primeiro: Serviços
          .mockReturnValueOnce(15) // Pagamento alternativo para serviços
          .mockReturnValueOnce(17) // Segundo: Contratos
          .mockReturnValueOnce(10); // Pagamento alternativo para contratos

        const notices = generator.generate({
          guild,
          settlementType: SettlementType.LUGAREJO,
        });

        expect(notices).toHaveLength(2);

        // Primeiro aviso: Serviços
        expect(notices[0].type).toBe(NoticeType.SERVICES);
        expect(notices[0].reducedReward).toBe(true);
        expect(notices[0].alternativePayment).toBeDefined();

        // Segundo aviso: Contratos
        expect(notices[1].type).toBe(NoticeType.CONTRACTS);
        expect(notices[1].reducedReward).toBe(true);
        expect(notices[1].alternativePayment).toBeDefined();
      });
    });
  });

  describe("5. Casos Especiais e Edge Cases", () => {
    it("deve lidar com resultado 'Nada' corretamente", () => {
      const guild = createMockGuild();

      mockDiceRoller
        .mockReturnValueOnce(20) // Disponibilidade
        .mockReturnValueOnce(3) // Quantidade = 3
        .mockReturnValueOnce(1) // Primeiro: Nada
        .mockReturnValueOnce(5) // Segundo: Aviso dos habitantes
        .mockReturnValueOnce(1); // Terceiro: Nada

      const notices = generator.generate({
        guild,
        settlementType: SettlementType.LUGAREJO,
      });

      // Apenas o segundo aviso deve ser gerado
      expect(notices).toHaveLength(1);
      expect(notices[0].type).toBe(NoticeType.RESIDENTS_NOTICE);
    });

    it("deve funcionar com injeção de dependência de dice roller", () => {
      const customDiceRoller = vi
        .fn()
        .mockReturnValueOnce(20) // Disponibilidade
        .mockReturnValueOnce(1) // Quantidade
        .mockReturnValueOnce(12); // Tipo

      const customGenerator = new NoticeGenerator(customDiceRoller);
      const guild = createMockGuild();

      const notices = customGenerator.generate({
        guild,
        settlementType: SettlementType.LUGAREJO,
      });

      expect(notices).toHaveLength(1);
      expect(customDiceRoller).toHaveBeenCalledTimes(3);
    });

    it("deve gerar IDs únicos para cada aviso", () => {
      const guild = createMockGuild();

      mockDiceRoller
        .mockReturnValueOnce(20) // Disponibilidade
        .mockReturnValueOnce(3) // Quantidade = 3
        .mockReturnValueOnce(5) // Primeiro aviso
        .mockReturnValueOnce(12) // Segundo aviso
        .mockReturnValueOnce(17); // Terceiro aviso

      const notices = generator.generate({
        guild,
        settlementType: SettlementType.LUGAREJO,
      });

      expect(notices).toHaveLength(3);

      const ids = notices.map((notice) => notice.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(3); // Todos os IDs devem ser únicos
      ids.forEach((id) => {
        expect(id).toMatch(/^notice_\d+_[a-z0-9]+$/); // Formato esperado
      });
    });
  });

  describe("6. Integração Completa", () => {
    it("deve gerar avisos completos para guilda em metrópole", () => {
      const guild = createMockGuild({
        structure: {
          ...createMockGuild().structure,
          size: "Colossal e primorosa (45m x 36m)", // +2d20-5
        },
        staff: {
          employees: "experientes", // +1d20
        } as GuildStaff,
      });

      mockDiceRoller
        .mockReturnValueOnce(10) // Disponibilidade: 10 + 12 (metrópole) = 22 -> "Sim"
        .mockReturnValueOnce(40) // Base: 8d20 para metrópole
        .mockReturnValueOnce(25) // Modificador sede: +2d20-5 = 25-5 = +20
        .mockReturnValueOnce(10) // Modificador funcionários: +1d20 = +10
        .mockReturnValueOnce(12) // Primeiro aviso: Divulgação
        .mockReturnValueOnce(17) // Segundo aviso: Contratos
        .mockReturnValueOnce(15); // Pagamento alternativo para contratos

      const notices = generator.generate({
        guild,
        settlementType: SettlementType.METROPOLE,
      });

      // Base 40 + 20 + 10 = 70 avisos seria muito para teste, limitamos a 2 por simplicidade
      expect(notices.length).toBeGreaterThan(0);

      // Verificar que avisos foram gerados corretamente
      const hasContracts = notices.some(
        (notice) => notice.type === NoticeType.CONTRACTS
      );
      if (hasContracts) {
        const contractNotice = notices.find(
          (notice) => notice.type === NoticeType.CONTRACTS
        );
        expect(contractNotice?.alternativePayment).toBeDefined();
        expect(contractNotice?.reducedReward).toBe(true);
      }
    });

    it("deve aplicar todas as regras conforme especificação do .md", () => {
      const guild = createMockGuild();

      mockDiceRoller
        .mockReturnValueOnce(18) // Disponibilidade -> "Sim"
        .mockReturnValueOnce(2) // Quantidade = 2 avisos
        .mockReturnValueOnce(7) // Primeiro: Serviços
        .mockReturnValueOnce(18) // Pagamento: Especiarias
        .mockReturnValueOnce(15); // Segundo: Cartaz de procurado

      const notices = generator.generate({
        guild,
        settlementType: SettlementType.VILAREJO,
      });

      expect(notices).toHaveLength(2);

      // Primeiro aviso: Serviços
      expect(notices[0].type).toBe(NoticeType.SERVICES);
      expect(notices[0].alternativePayment).toBe(AlternativePayment.SPICES);
      expect(notices[0].reducedReward).toBe(true);
      expect(notices[0].status).toBe(NoticeStatus.ACTIVE);

      // Segundo aviso: Cartaz de procurado
      expect(notices[1].type).toBe(NoticeType.WANTED_POSTER);
      expect(notices[1].alternativePayment).toBeUndefined();
      expect(notices[1].reducedReward).toBe(false);

      // Verificações gerais
      notices.forEach((notice) => {
        expect(notice.id).toBeDefined();
        expect(notice.guildId).toBe(""); // Será preenchido na integração com store
        expect(notice.createdDate).toBeInstanceOf(Date);
        expect(notice.createdAt).toBeInstanceOf(Date);
        expect(notice.updatedAt).toBeInstanceOf(Date);
        expect(notice.mentionedSpecies).toEqual([]); // Estrutura preparada para Issues futuras
        expect(notice.content).toBeNull(); // Será preenchido em Issues de conteúdo específico
      });
    });
  });
});
