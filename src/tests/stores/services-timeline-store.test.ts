import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useServicesStore } from "../../stores/services";
import { useTimelineStore } from "../../stores/timeline";
import { createGameDate } from "../../utils/date-utils";
import { ScheduledEventType, type GameDate } from "../../types/timeline";

describe("Services Timeline Integration - Simple Test", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe("Basic Store Integration", () => {
    it("deve ter stores funcionais", () => {
      const servicesStore = useServicesStore();
      const timelineStore = useTimelineStore();

      expect(servicesStore).toBeDefined();
      expect(timelineStore).toBeDefined();
    });

    it("deve ter métodos essenciais no services store", () => {
      const servicesStore = useServicesStore();

      expect(typeof servicesStore.processTimeAdvance).toBe("function");
      expect(typeof servicesStore.scheduleServiceEvents).toBe("function");
      expect(typeof servicesStore.generateServicesAutomatically).toBe(
        "function"
      );
      expect(typeof servicesStore.processSignedServiceResolution).toBe(
        "function"
      );
      expect(typeof servicesStore.processUnsignedServiceResolution).toBe(
        "function"
      );
      expect(typeof servicesStore.getServicesForGuild).toBe("function");
    });

    it("deve processar eventos de timeline", async () => {
      const servicesStore = useServicesStore();

      // Criar evento simples
      const currentDate = createGameDate(1, 1, 1);
      const timeAdvanceResult = {
        newDate: currentDate,
        triggeredEvents: [
          {
            id: "test-event",
            type: ScheduledEventType.NEW_SERVICES,
            date: currentDate,
            description: "Test event",
            data: { guildId: "test-guild" },
          },
        ],
        eventsRemaining: [],
      };

      // Executar processamento
      await servicesStore.processTimeAdvance(timeAdvanceResult);

      // Se chegou até aqui, o método funcionou
      expect(true).toBe(true);
    });

    it("deve executar métodos de resolução sem erro", () => {
      const servicesStore = useServicesStore();
      const timelineStore = useTimelineStore();

      // Configurar guilda e data na timeline
      timelineStore.setCurrentGuild("test-guild");

      // Executar métodos
      expect(() => {
        servicesStore.scheduleServiceEvents();
        servicesStore.generateServicesAutomatically();
        servicesStore.processSignedServiceResolution();
        servicesStore.processUnsignedServiceResolution();
      }).not.toThrow();
    });

    it("deve retornar array de serviços por guilda", () => {
      const servicesStore = useServicesStore();

      const services = servicesStore.getServicesForGuild("test-guild");

      expect(Array.isArray(services)).toBe(true);
    });

    it("deve usar GameDate corretamente", () => {
      const date1: GameDate = { day: 1, month: 1, year: 1 };
      const date2: GameDate = { day: 4, month: 3, year: 2 };

      expect(date1.year).toBe(1);
      expect(date1.month).toBe(1);
      expect(date1.day).toBe(1);

      expect(date2.year).toBe(2);
      expect(date2.month).toBe(3);
      expect(date2.day).toBe(4);
    });
  });
});
