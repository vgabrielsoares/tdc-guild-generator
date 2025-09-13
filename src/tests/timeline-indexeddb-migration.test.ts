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

describe("Timeline IndexedDB Migration", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe("Database Operations", () => {
    it("should load timelines from IndexedDB on initialization", async () => {
      const mockTimelineData = [
        {
          guildId: "guild-1",
          currentDate: createGameDate(1, 1, 1000),
          events: [
            {
              id: "event-1",
              type: ScheduledEventType.NEW_CONTRACTS,
              date: createGameDate(2, 1, 1000),
              description: "Novos contratos",
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

      expect(mockStorageAdapter.list).toHaveBeenCalledWith("timeline");
      expect(store.timelines["guild-1"]).toBeDefined();
    });

    it("should save timeline to IndexedDB when creating new timeline", async () => {
      mockStorageAdapter.list.mockResolvedValue([]);
      mockStorageAdapter.put.mockResolvedValue(undefined);

      const store = useTimelineStore();

      // Aguardar inicialização
      await new Promise((resolve) => setTimeout(resolve, 100));

      const timeline = store.createTimelineForGuild("guild-test");

      expect(timeline).toBeDefined();
      expect(timeline.guildId).toBe("guild-test");

      // Aguardar auto-save
      await new Promise((resolve) => setTimeout(resolve, 600));

      expect(mockStorageAdapter.put).toHaveBeenCalledWith(
        "timeline",
        "timeline_guild-test",
        expect.objectContaining({
          guildId: "guild-test",
        })
      );
    });

    it("should schedule and save events to IndexedDB", async () => {
      mockStorageAdapter.list.mockResolvedValue([]);
      mockStorageAdapter.put.mockResolvedValue(undefined);

      const store = useTimelineStore();

      // Aguardar inicialização
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Criar timeline
      store.createTimelineForGuild("guild-test");
      store.setCurrentGuild("guild-test");

      const eventDate = createGameDate(10, 1, 1000);
      const event = store.scheduleEvent(
        ScheduledEventType.NEW_CONTRACTS,
        eventDate,
        "Teste de evento"
      );

      expect(event).toBeDefined();
      expect(event?.type).toBe(ScheduledEventType.NEW_CONTRACTS);

      // Testar salvamento direto
      if (event) {
        await store.saveTimelineToDatabase(store.timelines["guild-test"]);

        expect(mockStorageAdapter.put).toHaveBeenCalledWith(
          "timeline",
          "timeline_guild-test",
          expect.objectContaining({
            guildId: "guild-test",
            events: expect.arrayContaining([event]),
          })
        );
      }
    });
  });

  describe("Optimized Queries", () => {
    it("should query events by date", async () => {
      const testDate = createGameDate(1, 1, 1000);
      const mockEvents = [
        {
          guildId: "guild-1",
          event: {
            id: "event-1",
            type: ScheduledEventType.NEW_CONTRACTS,
            date: testDate,
            description: "Evento teste",
          },
          eventDate: new Date(1000, 0, 1),
        },
      ];

      mockStorageAdapter.list.mockResolvedValue(mockEvents);

      const store = useTimelineStore();
      const events = await store.getEventsByDate("guild-1", testDate);

      expect(events).toHaveLength(1);
      expect(events[0].description).toBe("Evento teste");
    });

    it("should query events by type and guild", async () => {
      const mockEvents = [
        {
          guildId: "guild-1",
          event: {
            id: "event-1",
            type: ScheduledEventType.NEW_CONTRACTS,
            date: createGameDate(1, 1, 1000),
            description: "Contratos",
          },
          eventType: ScheduledEventType.NEW_CONTRACTS,
        },
        {
          guildId: "guild-1",
          event: {
            id: "event-2",
            type: ScheduledEventType.NEW_SERVICES,
            date: createGameDate(2, 1, 1000),
            description: "Serviços",
          },
          eventType: ScheduledEventType.NEW_SERVICES,
        },
      ];

      mockStorageAdapter.list.mockResolvedValue(mockEvents);

      const store = useTimelineStore();
      const events = await store.getEventsByTypeAndGuild(
        "guild-1",
        ScheduledEventType.NEW_CONTRACTS
      );

      expect(events).toHaveLength(1);
      expect(events[0].description).toBe("Contratos");
    });

    it("should get pending events for a guild", async () => {
      // Mock timeline em memória
      mockStorageAdapter.list.mockResolvedValue([]);
      const store = useTimelineStore();

      const timeline = store.createTimelineForGuild("guild-1");
      timeline.currentDate = createGameDate(1, 1, 1000);

      const mockEvents = [
        {
          guildId: "guild-1",
          event: {
            id: "event-future",
            type: ScheduledEventType.NEW_CONTRACTS,
            date: createGameDate(5, 1, 1000),
            description: "Evento futuro",
          },
          eventDate: new Date(1000, 0, 5),
        },
        {
          guildId: "guild-1",
          event: {
            id: "event-past",
            type: ScheduledEventType.NEW_CONTRACTS,
            date: createGameDate(1, 1, 999),
            description: "Evento passado",
          },
          eventDate: new Date(999, 0, 1),
        },
      ];

      mockStorageAdapter.list.mockResolvedValue(mockEvents);

      const pendingEvents = await store.getPendingEvents("guild-1");

      expect(pendingEvents).toHaveLength(1);
      expect(pendingEvents[0].description).toBe("Evento futuro");
    });
  });

  describe("Cleanup Operations", () => {
    it("should cleanup old history", async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 100); // 100 dias atrás

      const mockEvents = [
        {
          guildId: "guild-1",
          event: {
            id: "event-old",
            type: ScheduledEventType.NEW_CONTRACTS,
            date: createGameDate(1, 1, 900),
            description: "Evento antigo",
          },
          eventDate: oldDate,
        },
        {
          guildId: "guild-1",
          event: {
            id: "event-recent",
            type: ScheduledEventType.NEW_CONTRACTS,
            date: createGameDate(1, 1, 1000),
            description: "Evento recente",
          },
          eventDate: new Date(),
        },
      ];

      mockStorageAdapter.list.mockResolvedValue(mockEvents);
      mockStorageAdapter.del.mockResolvedValue(undefined);

      const store = useTimelineStore();
      store.createTimelineForGuild("guild-1");

      await store.cleanupOldHistory("guild-1", 30);

      expect(mockStorageAdapter.del).toHaveBeenCalledWith(
        "timeline",
        "event_event-old"
      );
    });

    it("should remove timeline from database", async () => {
      const mockEvents = [
        {
          guildId: "guild-1",
          event: {
            id: "event-1",
            type: ScheduledEventType.NEW_CONTRACTS,
            date: createGameDate(1, 1, 1000),
            description: "Evento",
          },
        },
      ];

      mockStorageAdapter.list.mockResolvedValue(mockEvents);
      mockStorageAdapter.del.mockResolvedValue(undefined);

      const store = useTimelineStore();
      await store.removeTimelineFromDatabase("guild-1");

      expect(mockStorageAdapter.del).toHaveBeenCalledWith(
        "timeline",
        "timeline_guild-1"
      );
      expect(mockStorageAdapter.del).toHaveBeenCalledWith(
        "timeline",
        "event_event-1"
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle database errors gracefully", async () => {
      mockStorageAdapter.list.mockRejectedValue(new Error("DB Error"));

      const store = useTimelineStore();

      // Aguardar tentativa de carregamento
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Store deve continuar funcionando mesmo com erro no DB
      expect(store.timelines).toEqual({});
    });

    it("should handle save errors gracefully", async () => {
      mockStorageAdapter.list.mockResolvedValue([]);
      mockStorageAdapter.put.mockRejectedValue(new Error("Save Error"));

      const store = useTimelineStore();

      // Não deve quebrar a aplicação
      expect(() => {
        store.createTimelineForGuild("guild-test");
      }).not.toThrow();
    });
  });
});
