import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useTimelineStore } from "@/stores/timeline";
import { createGameDate } from "@/utils/date-utils";
import { ScheduledEventType } from "@/types/timeline";

// Mock do storage adapter
const mockStorageAdapter = {
  get: vi.fn(),
  put: vi.fn(),
  del: vi.fn(),
  list: vi.fn(),
};

vi.mock("@/composables/useStorageAdapter", () => ({
  useStorageAdapter: () => mockStorageAdapter,
}));

vi.mock("@/composables/useToast", () => ({
  useToast: () => ({
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
  }),
}));

describe("Timeline Duplication Fix", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe("Event Deduplication on Load", () => {
    it("should not duplicate events when loading from IndexedDB with both timeline array and individual records", async () => {
      const duplicatedEvent = {
        id: "event-duplicate-test",
        type: ScheduledEventType.NEW_CONTRACTS,
        date: createGameDate(1, 1, 1000),
        description: "Evento duplicado",
      };

      // Simular dados com eventos duplicados (array principal + registro individual)
      const mockTimelineData = [
        // Timeline principal com array de eventos
        {
          guildId: "guild-1",
          currentDate: createGameDate(1, 1, 1000),
          events: [duplicatedEvent], // Evento no array principal
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // Registro individual do mesmo evento
        {
          guildId: "guild-1",
          event: duplicatedEvent, // Mesmo evento como registro individual
        },
        // Outro evento único para validar que eventos únicos não são afetados
        {
          guildId: "guild-1",
          event: {
            id: "event-unique",
            type: ScheduledEventType.CONTRACT_EXPIRATION,
            date: createGameDate(2, 1, 1000),
            description: "Evento único",
          },
        },
      ];

      mockStorageAdapter.list.mockResolvedValue(mockTimelineData);

      const store = useTimelineStore();

      // Aguardar carregamento
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verificar que a timeline foi carregada
      expect(store.timelines["guild-1"]).toBeDefined();

      // Verificar que não há eventos duplicados
      const events = store.timelines["guild-1"].events;
      const eventIds = events.map((e) => e.id);
      const uniqueEventIds = [...new Set(eventIds)];

      expect(eventIds.length).toBe(uniqueEventIds.length);
      expect(events.length).toBe(2); // Deve ter apenas 2 eventos únicos
      expect(events.find((e) => e.id === "event-duplicate-test")).toBeDefined();
      expect(events.find((e) => e.id === "event-unique")).toBeDefined();
    });

    it("should handle multiple timelines without cross-contamination", async () => {
      const mockTimelineData = [
        // Guilda 1: evento duplicado
        {
          guildId: "guild-1",
          currentDate: createGameDate(1, 1, 1000),
          events: [
            {
              id: "event-guild-1",
              type: ScheduledEventType.NEW_CONTRACTS,
              date: createGameDate(1, 1, 1000),
              description: "Evento da guilda 1",
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          guildId: "guild-1",
          event: {
            id: "event-guild-1",
            type: ScheduledEventType.NEW_CONTRACTS,
            date: createGameDate(1, 1, 1000),
            description: "Evento da guilda 1",
          },
        },
        // Guilda 2: evento único
        {
          guildId: "guild-2",
          currentDate: createGameDate(1, 1, 1000),
          events: [
            {
              id: "event-guild-2",
              type: ScheduledEventType.NEW_SERVICES,
              date: createGameDate(1, 1, 1000),
              description: "Evento da guilda 2",
            },
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockStorageAdapter.list.mockResolvedValue(mockTimelineData);

      const store = useTimelineStore();

      // Aguardar carregamento
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verificar que cada guilda tem apenas seus eventos
      expect(store.timelines["guild-1"].events.length).toBe(1);
      expect(store.timelines["guild-2"].events.length).toBe(1);

      // Verificar que os eventos estão nas guildas corretas
      expect(store.timelines["guild-1"].events[0].description).toBe(
        "Evento da guilda 1"
      );
      expect(store.timelines["guild-2"].events[0].description).toBe(
        "Evento da guilda 2"
      );
    });

    it("should prevent multiple simultaneous loading calls", async () => {
      mockStorageAdapter.list.mockResolvedValue([]);

      const store = useTimelineStore();

      // Tentar carregar múltiplas vezes simultaneamente
      const loadPromises = [
        store.loadAllTimelinesFromDB(),
        store.loadAllTimelinesFromDB(),
        store.loadAllTimelinesFromDB(),
      ];

      await Promise.all(loadPromises);

      // Verificar que list foi chamado apenas uma vez (proteção contra múltiplas cargas)
      expect(mockStorageAdapter.list).toHaveBeenCalledTimes(1);
    });
  });

  describe("Computed Properties Deduplication", () => {
    it("should deduplicate events in currentEvents computed", async () => {
      // Setup do store com eventos duplicados manualmente
      mockStorageAdapter.list.mockResolvedValue([]);
      const store = useTimelineStore();

      // Aguardar inicialização
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Criar timeline com eventos duplicados (simulando bug de duplicação)
      const timeline = store.createTimelineForGuild("test-guild");
      store.setCurrentGuild("test-guild");

      const duplicatedEvent = {
        id: "duplicate-event",
        type: ScheduledEventType.NEW_CONTRACTS,
        date: createGameDate(1, 1, 1000),
        description: "Evento duplicado",
      };

      // Adicionar o mesmo evento múltiplas vezes (simulando bug)
      timeline.events.push(duplicatedEvent);
      timeline.events.push({ ...duplicatedEvent }); // Cópia do mesmo evento
      timeline.events.push({
        id: "unique-event",
        type: ScheduledEventType.CONTRACT_EXPIRATION,
        date: createGameDate(2, 1, 1000),
        description: "Evento único",
      });

      // Forçar atualização da timeline
      store.timelines["test-guild"] = timeline;

      // Verificar que currentEvents deduplicou automaticamente
      const currentEvents = store.currentEvents;
      expect(currentEvents.length).toBe(2); // Deve ter apenas 2 eventos únicos
      expect(
        currentEvents.filter((e) => e.id === "duplicate-event").length
      ).toBe(1);
      expect(currentEvents.filter((e) => e.id === "unique-event").length).toBe(
        1
      );
    });
  });

  describe("Page Reload Scenarios", () => {
    it("should handle page reload without duplication", async () => {
      const originalEvent = {
        id: "reload-test-event",
        type: ScheduledEventType.NEW_CONTRACTS,
        date: createGameDate(1, 1, 1000),
        description: "Evento de teste de reload",
      };

      // Primeiro carregamento (simulando estado inicial)
      mockStorageAdapter.list.mockResolvedValueOnce([
        {
          guildId: "reload-guild",
          currentDate: createGameDate(1, 1, 1000),
          events: [originalEvent],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      const store1 = useTimelineStore();
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(store1.timelines["reload-guild"].events.length).toBe(1);

      // Simular reload da página (novo store)
      setActivePinia(createPinia());

      // Simular dados após reload (poderia ter duplicação)
      mockStorageAdapter.list.mockResolvedValueOnce([
        {
          guildId: "reload-guild",
          currentDate: createGameDate(1, 1, 1000),
          events: [originalEvent],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          guildId: "reload-guild",
          event: originalEvent, // Mesmo evento como registro individual
        },
      ]);

      const store2 = useTimelineStore();
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verificar que mesmo após "reload" não há duplicação
      expect(store2.timelines["reload-guild"].events.length).toBe(1);
      expect(store2.timelines["reload-guild"].events[0].id).toBe(
        "reload-test-event"
      );
    });
  });
});
