import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  type MockedFunction,
} from "vitest";
import {
  NoticeGenerator,
  type NoticeGenerationConfig,
} from "@/utils/generators/noticeGenerator";
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

/**
 * Testes de integração para NoticeGenerator com modificadores e cross-module
 * Baseado em: [3] Mural de Avisos - Guilda.md
 *
 * Validações:
 * - Modificadores de funcionários aplicados corretamente
 * - Redução de recompensa para pagamento alternativo (1/3)
 * - Cross-module integration com contratos e serviços
 * - Aplicação de todas as regras do markdown
 */

describe("NoticeGenerator - Integration Tests", () => {
  let generator: NoticeGenerator;
  let mockDiceRoller: MockedFunction<(notation: string) => number>;
  let mockContractsStore: {
    generateContracts: MockedFunction<
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (config: Record<string, unknown>) => Promise<any[]>
    >;
  };
  let mockServicesStore: {
    generateServices: MockedFunction<
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (config: Record<string, unknown>) => Promise<any[]>
    >;
  };

  // Helper para criar guild mock
  const createMockGuild = (overrides: Partial<Guild> = {}): Guild => {
    const defaultStructure: GuildStructure = {
      size: "Médio (9m x 6m)",
      characteristics: ["bem organizada"],
    };

    const defaultRelations: GuildRelations = {
      government: RelationLevel.DIPLOMATICA,
      population: RelationLevel.DIPLOMATICA,
    };

    const defaultStaff: GuildStaff = {
      employees: "funcionários preparados",
    };

    const defaultVisitors: GuildVisitors = {
      frequency: VisitorLevel.NEM_MUITO_NEM_POUCO,
    };

    const defaultResources: GuildResources = {
      level: ResourceLevel.SUFICIENTES,
    };

    return {
      id: "test-guild-id",
      name: "Guilda de Teste",
      settlementType: SettlementType.LUGAREJO,
      structure: { ...defaultStructure, ...overrides.structure },
      relations: { ...defaultRelations, ...overrides.relations },
      staff: { ...defaultStaff, ...overrides.staff },
      visitors: { ...defaultVisitors, ...overrides.visitors },
      resources: { ...defaultResources, ...overrides.resources },
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };
  };

  beforeEach(() => {
    // Mock do dice roller
    mockDiceRoller = vi.fn();
    generator = new NoticeGenerator(mockDiceRoller);

    // Mock dos stores
    mockContractsStore = {
      generateContracts: vi.fn().mockResolvedValue([
        {
          id: "contract-1",
          title: "Contrato do Mural",
          value: { rewardValue: 150 },
        },
      ]),
    };

    mockServicesStore = {
      generateServices: vi.fn().mockResolvedValue([
        {
          id: "service-1",
          title: "Serviço do Mural",
          value: { rewardAmount: 75 },
        },
      ]),
    };
  });

  describe("Modificadores de Funcionários", () => {
    it("REGRA: Funcionários experientes aplicam +1d20", async () => {
      // Setup: funcionários experientes
      const guild = createMockGuild({
        staff: {
          employees: "experientes",
        },
      });

      // Mock controlado para os 3 rolls iniciais, depois permitir rolls naturais
      mockDiceRoller
        .mockReturnValueOnce(17) // 1. Disponibilidade: "Sim"
        .mockReturnValueOnce(3) // 2. Base: 1d20 = 3
        .mockReturnValueOnce(5) // 3. Modificador experientes: +1d20 = +5 (total: 8)
        .mockReturnValue(12); // Todos os outros rolls usam 12 (valor médio para rolagens naturais)

      const config = {
        guild,
        settlementType: SettlementType.LUGAREJO,
      };

      const notices = await generator.generate(config);

      // Validar que modificador foi aplicado
      expect(notices.length).toBe(8); // Base (3) + modificador (+5) = 8

      // Validar que houve pelo menos as 3 chamadas essenciais
      expect(mockDiceRoller).toHaveBeenCalledWith("1d20");
    });

    it("REGRA: Funcionários despreparados aplicam -1d20", async () => {
      const guild = createMockGuild({
        staff: {
          employees: "despreparados",
        },
      });

      // Mock controlado para os 3 rolls iniciais, depois permitir rolls naturais
      mockDiceRoller
        .mockReturnValueOnce(17) // 1. Disponibilidade: "Sim"
        .mockReturnValueOnce(12) // 2. Base: 1d20 = 12
        .mockReturnValueOnce(5) // 3. Modificador despreparados: -1d20 = -5 (total: 7)
        .mockReturnValue(12); // Todos os outros rolls usam 12 (valor médio)

      const config = {
        guild,
        settlementType: SettlementType.LUGAREJO,
      };

      const notices = await generator.generate(config);

      // Validar que modificador negativo foi aplicado corretamente
      expect(notices.length).toBe(7); // Base (12) - modificador (5) = 7
      expect(notices.length).toBeGreaterThanOrEqual(0); // Nunca negativo
    });

    it("REGRA: Funcionários normais não aplicam modificador", async () => {
      const guild = createMockGuild({
        staff: {
          employees: "funcionários preparados", // Normal
        },
      });

      mockDiceRoller
        .mockReturnValueOnce(17) // 1. Disponibilidade: "Sim"
        .mockReturnValueOnce(8) // 2. Base: 1d20 = 8 (sem modificador adicional)
        .mockReturnValue(12); // Todos os outros rolls usam 12

      const config = {
        guild,
        settlementType: SettlementType.LUGAREJO,
      };

      const notices = await generator.generate(config);

      // Validar que não há modificador adicional
      expect(notices.length).toBe(8); // Exatamente o valor base
    });
  });

  describe("Pagamento Alternativo e Redução de Recompensa", () => {
    it("REGRA: Contratos do mural sempre têm recompensa reduzida (1/3)", async () => {
      const guild = createMockGuild();

      // Mock para gerar exatamente um contrato
      mockDiceRoller
        .mockReturnValueOnce(17) // Disponibilidade: "Sim"
        .mockReturnValueOnce(1) // Quantidade: 1 aviso
        .mockReturnValueOnce(17) // Tipo: "1d4 contratos" (17 na tabela)
        .mockReturnValueOnce(3) // Quantidade de contratos: 1d4 = 3
        .mockReturnValueOnce(12); // Pagamento alternativo: "Equivalente em terras"

      const config = {
        guild,
        settlementType: SettlementType.LUGAREJO,
        contractsStore: mockContractsStore,
      };

      const notices = await generator.generate(config);

      expect(notices).toHaveLength(1);
      const notice = notices[0];

      // Validar regras de pagamento alternativo
      expect(notice.type).toBe(NoticeType.CONTRACTS);
      expect(notice.reducedReward).toBe(true); // Sempre true para contratos
      expect(notice.alternativePayment).toBe(AlternativePayment.LAND);

      // Validar que cross-module foi chamado
      expect(mockContractsStore.generateContracts).toHaveBeenCalledWith({
        guild,
        quantity: 3, // 1d4 rolado
        alternativePayment: true,
        rewardReduction: 1 / 3,
      });
    });

    it("REGRA: Serviços do mural sempre têm recompensa reduzida (1/3)", async () => {
      const guild = createMockGuild();

      mockDiceRoller
        .mockReturnValueOnce(17) // Disponibilidade: "Sim"
        .mockReturnValueOnce(1) // Quantidade: 1 aviso
        .mockReturnValueOnce(7) // Tipo: "1d4 serviços" (7 na tabela)
        .mockReturnValueOnce(2) // Quantidade de serviços: 1d4 = 2
        .mockReturnValueOnce(18); // Pagamento alternativo: "Equivalente em especiarias"

      const config = {
        guild,
        settlementType: SettlementType.LUGAREJO,
        servicesStore:
          mockServicesStore as unknown as NoticeGenerationConfig["servicesStore"],
      };

      const notices = await generator.generate(config);

      expect(notices).toHaveLength(1);
      const notice = notices[0];

      // Validar regras de pagamento alternativo
      expect(notice.type).toBe(NoticeType.SERVICES);
      expect(notice.reducedReward).toBe(true); // Sempre true para serviços
      expect(notice.alternativePayment).toBe(AlternativePayment.SPICES);

      // Validar que cross-module foi chamado
      expect(mockServicesStore.generateServices).toHaveBeenCalledWith({
        guild,
        quantity: 2, // 1d4 rolado
        alternativePayment: true,
        rewardReduction: 1 / 3,
      });
    });

    it("REGRA: Outros tipos de aviso não têm pagamento alternativo", async () => {
      const guild = createMockGuild();

      mockDiceRoller
        .mockReturnValueOnce(17) // Disponibilidade: "Sim"
        .mockReturnValueOnce(1) // Quantidade: 1 aviso
        .mockReturnValueOnce(11); // Tipo: "Divulgação" (11 na tabela)

      const config = {
        guild,
        settlementType: SettlementType.LUGAREJO,
      };

      const notices = await generator.generate(config);

      expect(notices).toHaveLength(1);
      const notice = notices[0];

      // Validar que não há pagamento alternativo
      expect(notice.type).toBe(NoticeType.ANNOUNCEMENT);
      expect(notice.reducedReward).toBe(false);
      expect(notice.alternativePayment).toBeUndefined();
    });
  });

  describe("Cross-Module Integration", () => {
    it("REGRA: '1d4 contratos' deve rolar quantidade e integrar com sistema de contratos", async () => {
      const guild = createMockGuild();

      mockDiceRoller
        .mockReturnValueOnce(17) // Disponibilidade: "Sim"
        .mockReturnValueOnce(1) // Quantidade: 1 aviso
        .mockReturnValueOnce(17) // Tipo: "1d4 contratos"
        .mockReturnValueOnce(4) // Quantidade de contratos: 1d4 = 4 (máximo)
        .mockReturnValueOnce(15); // Pagamento alternativo: "Favores"

      const config = {
        guild,
        settlementType: SettlementType.LUGAREJO,
        contractsStore: mockContractsStore,
      };

      const notices = await generator.generate(config);

      // Validar que a quantidade foi rolada e passada corretamente
      expect(mockContractsStore.generateContracts).toHaveBeenCalledWith({
        guild,
        quantity: 4, // Resultado específico do 1d4
        alternativePayment: true,
        rewardReduction: 1 / 3,
      });

      expect(notices[0].alternativePayment).toBe(AlternativePayment.FAVORS);
    });

    it("REGRA: '1d4 serviços' deve rolar quantidade e integrar com sistema de serviços", async () => {
      const guild = createMockGuild();

      mockDiceRoller
        .mockReturnValueOnce(17) // Disponibilidade: "Sim"
        .mockReturnValueOnce(1) // Quantidade: 1 aviso
        .mockReturnValueOnce(8) // Tipo: "1d4 serviços" (8 na tabela)
        .mockReturnValueOnce(1) // Quantidade de serviços: 1d4 = 1 (mínimo)
        .mockReturnValueOnce(6); // Pagamento alternativo: "Não há pagamento"

      const config = {
        guild,
        settlementType: SettlementType.LUGAREJO,
        servicesStore: mockServicesStore,
      };

      const notices = await generator.generate(config);

      // Validar que a quantidade foi rolada e passada corretamente
      expect(mockServicesStore.generateServices).toHaveBeenCalledWith({
        guild,
        quantity: 1, // Resultado específico do 1d4
        alternativePayment: true,
        rewardReduction: 1 / 3,
      });

      expect(notices[0].alternativePayment).toBe(AlternativePayment.NONE);
    });

    it("REGRA: Cross-module deve falhar graciosamente quando stores não estão disponíveis", async () => {
      const guild = createMockGuild();

      mockDiceRoller
        .mockReturnValueOnce(17) // Disponibilidade: "Sim"
        .mockReturnValueOnce(1) // Quantidade: 1 aviso
        .mockReturnValueOnce(17); // Tipo: "1d4 contratos"

      const config = {
        guild,
        settlementType: SettlementType.LUGAREJO,
        // Sem contractsStore definido
      };

      // Deve continuar funcionando mesmo sem stores
      const notices = await generator.generate(config);

      expect(notices).toHaveLength(1);
      expect(notices[0].type).toBe(NoticeType.CONTRACTS);
      // Sem integração, mas aviso ainda é criado
    });
  });

  describe("Aplicação de Todas as Regras", () => {
    it("CENÁRIO COMPLETO: Guilda com funcionários experientes gerando contratos", async () => {
      // Setup: Guilda com funcionários experientes que garantem +3 bônus no contador
      const guild = createMockGuild({
        staff: {
          employees: "experientes", // +1d20 modificador
        },
      });

      // Mock mais flexível que aceita variabilidade mas força alguns contratos
      mockDiceRoller
        .mockReturnValueOnce(17) // Availability check - Sim
        .mockReturnValueOnce(10) // Base count (1d20)
        .mockReturnValueOnce(5) // Modificador experientes: +5 (total: 15)
        // Para os tipos de aviso, força alguns contratos mas permite variabilidade
        .mockReturnValueOnce(17) // Contrato 1
        .mockReturnValueOnce(2) // Quantidade 2
        .mockReturnValueOnce(18) // Contrato 2
        .mockReturnValueOnce(1) // Quantidade 1
        .mockReturnValueOnce(17) // Contrato 3
        .mockReturnValueOnce(3); // Quantidade 3
      // Depois deixa natural para outros

      const config = {
        guild,
        settlementType: SettlementType.LUGAREJO,
        contractsStore:
          mockContractsStore as unknown as NoticeGenerationConfig["contractsStore"],
      };

      const notices = await generator.generate(config);

      // Validação: Deve ter sido gerado pelo menos alguns avisos
      expect(notices.length).toBeGreaterThan(0);

      // Filtrar apenas os contratos para validação
      const contractNotices = notices.filter(
        (notice) => notice.type === NoticeType.CONTRACTS
      );

      // Deve ter pelo menos alguns contratos (pelo menos os mocks que forçamos)
      expect(contractNotices.length).toBeGreaterThan(0);

      // Todos os contratos devem ter as regras aplicadas
      contractNotices.forEach((notice) => {
        expect(notice.type).toBe(NoticeType.CONTRACTS);
        expect(notice.reducedReward).toBe(true);
        expect(notice.alternativePayment).toBeDefined();
        expect(notice.guildId).toBe(guild.id);
        expect(notice.status).toBe(NoticeStatus.ACTIVE);
      });

      // Verificar que cross-module integration foi chamada pelos contratos gerados
      expect(mockContractsStore.generateContracts).toHaveBeenCalledTimes(
        contractNotices.length
      );
    });

    it("CENÁRIO COMPLETO: Guilda com funcionários despreparados em metrópole", async () => {
      const guild = createMockGuild({
        staff: {
          employees: "despreparados", // -1d20 modificador
        },
      });

      mockDiceRoller
        .mockReturnValueOnce(17) // Disponibilidade: "Sim"
        .mockReturnValueOnce(20) // Base: 8d20 para metrópole (simulando 20)
        .mockReturnValueOnce(15); // Modificador despreparados: -1d20 = -15 (total: 5)

      // Para cada um dos 5 avisos individuais:
      for (let i = 0; i < 5; i++) {
        mockDiceRoller.mockReturnValueOnce(11); // Todos geram divulgações (11 na tabela)
      }

      const config = {
        guild,
        settlementType: SettlementType.METROPOLE, // Maior modificador base
      };

      const notices = await generator.generate(config);

      // Validar que modificador negativo foi aplicado mas não resultou em valor negativo
      expect(notices.length).toBe(5); // 20 - 15 = 5 (limitado a >= 0)

      // Avisos devem ser divulgações (sem pagamento alternativo)
      notices.forEach((notice) => {
        expect(notice.type).toBe(NoticeType.ANNOUNCEMENT);
        expect(notice.reducedReward).toBe(false);
        expect(notice.alternativePayment).toBeUndefined();
      });
    });
  });

  describe("Validação das Tabelas de Pagamento Alternativo", () => {
    const alternativePaymentTestCases = [
      {
        roll: 3,
        expected: AlternativePayment.NONE,
        description: "1-6: Não há pagamento",
      },
      {
        roll: 7,
        expected: AlternativePayment.IRON_COPPER,
        description: "7: Ferro ou peças de cobre",
      },
      {
        roll: 8,
        expected: AlternativePayment.COPPER_SILVER,
        description: "8: Cobre ou prata",
      },
      {
        roll: 10,
        expected: AlternativePayment.ANIMALS,
        description: "9-11: Equivalente em animais",
      },
      {
        roll: 12,
        expected: AlternativePayment.LAND,
        description: "12: Equivalente em terras",
      },
      {
        roll: 14,
        expected: AlternativePayment.HARVEST,
        description: "13-14: Equivalente em colheita",
      },
      {
        roll: 16,
        expected: AlternativePayment.FAVORS,
        description: "15-16: Favores",
      },
      {
        roll: 17,
        expected: AlternativePayment.TREASURE_MAP,
        description: "17: Mapa ou localização de tesouro",
      },
      {
        roll: 19,
        expected: AlternativePayment.SPICES,
        description: "18-19: Equivalente em especiarias",
      },
      {
        roll: 20,
        expected: AlternativePayment.VALUABLE_OBJECTS,
        description: "20: Objetos valiosos",
      },
    ];

    alternativePaymentTestCases.forEach(({ roll, expected, description }) => {
      it(`TABELA: ${description}`, async () => {
        const guild = createMockGuild();

        mockDiceRoller
          .mockReturnValueOnce(17) // Disponibilidade: "Sim"
          .mockReturnValueOnce(1) // Quantidade: 1 aviso
          .mockReturnValueOnce(17) // Tipo: "1d4 contratos"
          .mockReturnValueOnce(2) // Quantidade de contratos: 1d4 = 2
          .mockReturnValueOnce(roll); // Pagamento alternativo específico

        const config = {
          guild,
          settlementType: SettlementType.LUGAREJO,
          contractsStore:
            mockContractsStore as unknown as NoticeGenerationConfig["contractsStore"],
        };

        const notices = await generator.generate(config);

        expect(notices[0].alternativePayment).toBe(expected);
      });
    });
  });
});
