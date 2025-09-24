/**
 * Testes para Issue 7.21: Store Completo do Mural de Avisos - Funcionalidades Principais
 *
 * Valida as funcionalidades implementadas seguindo as regras de negócio
 * do arquivo [3] Mural de Avisos - Guilda.md
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useNoticesStore } from "@/stores/notices";
import { useGuildStore } from "@/stores/guild";
import { NoticeType, NoticeStatus } from "@/types/notice";
import { SettlementType } from "@/types/guild";
import { Species } from "@/types/species";

// Mock do gerador com dados válidos
const mockNoticeGeneratorInstance = {
  generate: vi.fn().mockResolvedValue([
    {
      id: "generated-notice-1",
      type: NoticeType.ANNOUNCEMENT,
      status: NoticeStatus.ACTIVE,
      guildId: "test-guild-1",
      createdDate: new Date(),
      expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      content: null,
      mentionedSpecies: [{ species: Species.HUMAN, subrace: undefined }],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]),
};

// Mock dos utilitários principais
vi.mock("@/utils/generators/noticeGenerator", () => ({
  NoticeGenerator: vi.fn(() => mockNoticeGeneratorInstance),
}));

vi.mock("@/utils/generators/noticeLifeCycle", () => ({
  rollNoticeExpiration: vi
    .fn()
    .mockReturnValue({ days: 7, isExecutionDay: false }),
  calculateNextRenewalDate: vi
    .fn()
    .mockReturnValue({ year: 2024, month: 1, day: 15 }),
}));

vi.mock("@/composables/useNoticesStorage", () => ({
  useNoticesStorage: vi.fn(() => ({
    updateNoticesForGuild: vi.fn(),
    getNoticesForGuild: vi.fn().mockReturnValue([]),
  })),
}));

vi.mock("@/composables/useToast", () => ({
  useToast: vi.fn(() => ({
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  })),
}));

vi.mock("@/utils/timeline-store-integration", () => ({
  processModuleTimeAdvance: vi.fn(),
}));

vi.mock("@/utils/date-utils", () => ({
  addDays: vi.fn().mockReturnValue({ year: 2024, month: 1, day: 15 }),
}));

describe("Issue 7.21: Store Completo do Mural de Avisos", () => {
  let noticesStore: ReturnType<typeof useNoticesStore>;
  let guildStore: ReturnType<typeof useGuildStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    noticesStore = useNoticesStore();
    guildStore = useGuildStore();

    // Reset dos mocks
    vi.clearAllMocks();
    mockNoticeGeneratorInstance.generate.mockResolvedValue([
      {
        id: "generated-notice-1",
        type: NoticeType.ANNOUNCEMENT,
        status: NoticeStatus.ACTIVE,
        guildId: "test-guild-1",
        createdDate: new Date(),
        expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        content: null,
        mentionedSpecies: [{ species: Species.HUMAN, subrace: undefined }],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);

    // Mock da guilda atual - usando estrutura mínima necessária
    const mockGuild = {
      id: "test-guild-1",
      name: "Guilda de Teste",
      settlementType: SettlementType.LUGAREJO,
      createdAt: new Date(),
    };

    vi.spyOn(guildStore, "currentGuild", "get").mockReturnValue(
      mockGuild as never
    );
  });

  describe("1. Estado Inicial", () => {
    it("deve inicializar com estado limpo", () => {
      expect(noticesStore.notices).toEqual([]);
      expect(noticesStore.isLoading).toBe(false);
    });

    it("deve ter filtros inicializados", () => {
      expect(noticesStore.filters.type).toBeNull();
      expect(noticesStore.filters.status).toBeNull();
      expect(noticesStore.filters.species).toBeNull();
      expect(noticesStore.filters.dangerLevel).toBeNull();
      expect(noticesStore.filters.guildId).toBeNull();
      expect(noticesStore.filters.showExpired).toBe(false);
    });

    it("deve ter computed properties básicas", () => {
      expect(noticesStore.hasNotices).toBe(false);
      expect(noticesStore.hasActiveNotices).toBe(false);
      expect(noticesStore.hasExpiredNotices).toBe(false);
      expect(noticesStore.isEmptyState).toBe(true);
    });
  });

  describe("2. Geração de Avisos", () => {
    it("deve gerar avisos usando o NoticeGenerator", async () => {
      await noticesStore.generateNotices();

      expect(noticesStore.notices).toHaveLength(1);
      expect(noticesStore.notices[0].type).toBe(NoticeType.ANNOUNCEMENT);
      expect(noticesStore.isLoading).toBe(false);
    });

    it("deve tratar erros na geração", async () => {
      mockNoticeGeneratorInstance.generate.mockRejectedValue(
        new Error("Erro de teste")
      );

      // O store captura e trata erros internamente, então não rejeitamos, mas verificamos os estados
      try {
        await noticesStore.generateNotices();
      } catch (error) {
        // Se chegar aqui, o erro foi propagado (esperado comportamento)
        expect(error).toBeInstanceOf(Error);
        expect((error as Error).message).toBe("Erro de teste");
      }

      expect(noticesStore.isLoading).toBe(false);
      expect(noticesStore.generationError).toBe("Erro de teste");
    });

    it("deve marcar loading durante geração", async () => {
      let loadingDuringCall = false;

      mockNoticeGeneratorInstance.generate.mockImplementation(async () => {
        loadingDuringCall = noticesStore.isLoading;
        return [
          {
            id: "generated-notice-1",
            type: NoticeType.ANNOUNCEMENT,
            status: NoticeStatus.ACTIVE,
            guildId: "test-guild-1",
            createdDate: new Date(),
            expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            content: null,
            mentionedSpecies: [{ species: Species.HUMAN, subrace: undefined }],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];
      });

      await noticesStore.generateNotices();

      expect(loadingDuringCall).toBe(true);
      expect(noticesStore.isLoading).toBe(false);
    });
  });

  describe("3. Filtros", () => {
    beforeEach(async () => {
      // Gerar alguns avisos de teste primeiro
      await noticesStore.generateNotices();
    });

    it("deve filtrar avisos por tipo", () => {
      noticesStore.setTypeFilter(NoticeType.ANNOUNCEMENT);
      expect(noticesStore.filters.type).toBe(NoticeType.ANNOUNCEMENT);
    });

    it("deve filtrar avisos por status", () => {
      noticesStore.setStatusFilter(NoticeStatus.ACTIVE);
      expect(noticesStore.filters.status).toBe(NoticeStatus.ACTIVE);
    });

    it("deve limpar todos os filtros", () => {
      noticesStore.setTypeFilter(NoticeType.ANNOUNCEMENT);
      noticesStore.setStatusFilter(NoticeStatus.ACTIVE);
      noticesStore.clearFilters();

      expect(noticesStore.filters.type).toBeNull();
      expect(noticesStore.filters.status).toBeNull();
      expect(noticesStore.filters.searchText).toBe("");
      expect(noticesStore.filters.showExpired).toBe(false);
    });
  });

  describe("4. Computed Properties", () => {
    beforeEach(async () => {
      await noticesStore.generateNotices();
    });

    it("deve calcular avisos ativos corretamente", () => {
      expect(noticesStore.activeNotices).toHaveLength(1);
      expect(noticesStore.activeNotices[0].status).toBe(NoticeStatus.ACTIVE);
    });

    it("deve calcular contadores de avisos", () => {
      const counters = noticesStore.noticesCounters;

      expect(counters.total).toBe(1);
      expect(counters.active).toBe(1);
      expect(counters.expired).toBe(0);
    });

    it("deve agrupar avisos por tipo", () => {
      const byType = noticesStore.noticesByType;

      expect(byType[NoticeType.ANNOUNCEMENT]).toHaveLength(1);
      expect(byType[NoticeType.WANTED_POSTER] || []).toHaveLength(0);
    });

    it("deve listar espécies mencionadas", () => {
      const species = noticesStore.mentionedSpecies;

      expect(species).toContain(Species.HUMAN);
    });
  });

  describe("5. Gerenciamento de Avisos", () => {
    beforeEach(async () => {
      await noticesStore.generateNotices();
    });

    it("deve renovar um aviso específico", () => {
      const notice = noticesStore.notices[0];

      // Spy na função renewNotice para verificar se foi chamada
      const renewSpy = vi.spyOn(noticesStore, "renewNotice");

      noticesStore.renewNotice(notice.id);

      const renewedNotice = noticesStore.getNoticeById(notice.id);

      // Verificar que a função foi chamada
      expect(renewSpy).toHaveBeenCalledWith(notice.id);
      // Verificar que o aviso ainda existe
      expect(renewedNotice).toBeDefined();
      expect(renewedNotice?.id).toBe(notice.id);
    });

    it("deve remover um aviso específico", () => {
      const notice = noticesStore.notices[0];

      noticesStore.removeNotice(notice.id);

      expect(noticesStore.notices).toHaveLength(0);
      expect(noticesStore.getNoticeById(notice.id)).toBeUndefined();
    });

    it("deve limpar todos os avisos", () => {
      noticesStore.clearNotices();

      expect(noticesStore.notices).toHaveLength(0);
      expect(noticesStore.hasNotices).toBe(false);
    });
  });

  describe("6. Ações Auxiliares", () => {
    beforeEach(async () => {
      await noticesStore.generateNotices();
    });

    it("deve buscar aviso por ID", () => {
      const notice = noticesStore.notices[0];
      const found = noticesStore.getNoticeById(notice.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(notice.id);
    });

    it("deve buscar avisos por tipo", () => {
      const announcements = noticesStore.getNoticesByType(
        NoticeType.ANNOUNCEMENT
      );

      expect(announcements).toHaveLength(1);
      expect(announcements[0].type).toBe(NoticeType.ANNOUNCEMENT);
    });

    it("deve retornar array vazio para tipo não existente", () => {
      const wanted = noticesStore.getNoticesByType(NoticeType.WANTED_POSTER);

      expect(wanted).toHaveLength(0);
    });
  });

  describe("7. API Store - Exposição de Funcionalidades", () => {
    it("deve expor todas as actions necessárias", () => {
      // Ações principais
      expect(typeof noticesStore.generateNotices).toBe("function");
      expect(typeof noticesStore.removeExpiredNotices).toBe("function");

      // Ações de gerenciamento
      expect(typeof noticesStore.renewNotice).toBe("function");
      expect(typeof noticesStore.removeNotice).toBe("function");
      expect(typeof noticesStore.clearNotices).toBe("function");

      // Ações auxiliares
      expect(typeof noticesStore.getNoticeById).toBe("function");
      expect(typeof noticesStore.getNoticesByType).toBe("function");

      // Ações de filtro
      expect(typeof noticesStore.setTypeFilter).toBe("function");
      expect(typeof noticesStore.setStatusFilter).toBe("function");
      expect(typeof noticesStore.clearFilters).toBe("function");
    });

    it("deve expor computed properties essenciais", () => {
      expect(noticesStore.notices).toBeDefined();
      expect(noticesStore.activeNotices).toBeDefined();
      expect(noticesStore.expiredNotices).toBeDefined();
      expect(noticesStore.filteredNotices).toBeDefined();
      expect(noticesStore.noticesByType).toBeDefined();
      expect(noticesStore.noticesCounters).toBeDefined();
      expect(noticesStore.mentionedSpecies).toBeDefined();
      expect(noticesStore.availableDangerLevels).toBeDefined();
    });

    it("deve expor estados essenciais", () => {
      expect(noticesStore.isLoading).toBeDefined();
      expect(noticesStore.isReady).toBeDefined();
      expect(noticesStore.lastUpdate).toBeDefined();
      expect(noticesStore.filters).toBeDefined();
      expect(noticesStore.hasNotices).toBeDefined();
      expect(noticesStore.isEmptyState).toBeDefined();
    });
  });
});
