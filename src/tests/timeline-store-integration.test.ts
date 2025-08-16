import { describe, it, expect, beforeEach, vi } from "vitest";
import type {
  GameDate,
  ScheduledEvent,
  ScheduledEventType,
  TimeAdvanceResult,
} from "@/types/timeline";
import {
  scheduleModuleEvents,
  processModuleTimeAdvance,
  hasActiveEvent,
  updateModuleTimestamp,
  applyAutomaticResolution,
  type TimelineModuleConfig,
  type ModuleEventConfig,
  type ModuleEventHandler,
  type ResolutionConfig,
  type TimelineStore,
} from "@/utils/timeline-store-integration";

describe("Timeline Store Integration - Utilitários Modulares DRY", () => {
  let mockTimelineStore: TimelineStore;
  let mockGuildIdGetter: () => string | undefined;
  let moduleConfig: TimelineModuleConfig;

  beforeEach(() => {
    mockTimelineStore = {
      currentGameDate: { day: 1, month: 1, year: 1000 } as GameDate,
      currentEvents: [] as ScheduledEvent[],
      scheduleEvent: vi.fn().mockReturnValue({
        id: "test-event",
        type: "NEW_CONTRACTS" as ScheduledEventType,
        date: { day: 2, month: 1, year: 1000 } as GameDate,
        description: "Test event",
        data: { guildId: "test-guild" },
      } as ScheduledEvent),
    };

    mockGuildIdGetter = () => "test-guild";

    moduleConfig = {
      moduleType: "contracts",
      guildIdGetter: mockGuildIdGetter,
      timelineStore: mockTimelineStore,
    };
  });

  describe("hasActiveEvent", () => {
    it("deve retornar false quando não há data atual", () => {
      const configSemData = {
        ...moduleConfig,
        timelineStore: { ...mockTimelineStore, currentGameDate: null },
      };

      const result = hasActiveEvent(
        configSemData,
        "NEW_CONTRACTS" as ScheduledEventType
      );
      expect(result).toBe(false);
    });

    it("deve retornar false quando não há guilda atual", () => {
      const configSemGuilda = {
        ...moduleConfig,
        guildIdGetter: () => undefined,
      };

      const result = hasActiveEvent(
        configSemGuilda,
        "NEW_CONTRACTS" as ScheduledEventType
      );
      expect(result).toBe(false);
    });

    it("deve detectar evento ativo corretamente", () => {
      mockTimelineStore.currentEvents = [
        {
          id: "test-1",
          type: "NEW_CONTRACTS" as ScheduledEventType,
          date: { day: 5, month: 1, year: 1000 },
          description: "Futuros contratos",
          data: { guildId: "test-guild", source: "contract_generation" },
        },
      ];

      const result = hasActiveEvent(
        moduleConfig,
        "NEW_CONTRACTS" as ScheduledEventType,
        "contract_generation"
      );
      expect(result).toBe(true);
    });

    it("deve filtrar por guilda correta", () => {
      mockTimelineStore.currentEvents = [
        {
          id: "test-1",
          type: "NEW_CONTRACTS" as ScheduledEventType,
          date: { day: 5, month: 1, year: 1000 },
          description: "Contratos de outra guilda",
          data: { guildId: "outra-guilda", source: "contract_generation" },
        },
      ];

      const result = hasActiveEvent(
        moduleConfig,
        "NEW_CONTRACTS" as ScheduledEventType,
        "contract_generation"
      );
      expect(result).toBe(false);
    });
  });

  describe("scheduleModuleEvents", () => {
    it("deve agendar eventos corretamente", () => {
      const eventConfigs: ModuleEventConfig[] = [
        {
          type: "NEW_CONTRACTS" as ScheduledEventType,
          source: "contract_generation",
          description: "Novos contratos disponíveis",
          rollTimeFunction: () => 3,
          guildId: "test-guild",
        },
        {
          type: "CONTRACT_RESOLUTION" as ScheduledEventType,
          source: "signed_resolution",
          description: "Resolução de contratos assinados",
          rollTimeFunction: () => 7,
          guildId: "test-guild",
          resolutionType: "signed",
        },
      ];

      scheduleModuleEvents(moduleConfig, eventConfigs);

      expect(mockTimelineStore.scheduleEvent).toHaveBeenCalledTimes(2);

      // Verificar primeira chamada (NEW_CONTRACTS)
      expect(mockTimelineStore.scheduleEvent).toHaveBeenNthCalledWith(
        1,
        "NEW_CONTRACTS",
        { day: 4, month: 1, year: 1000 }, // 3 dias depois
        "Novos contratos disponíveis",
        { source: "contract_generation", guildId: "test-guild" }
      );

      // Verificar segunda chamada (CONTRACT_RESOLUTION)
      expect(mockTimelineStore.scheduleEvent).toHaveBeenNthCalledWith(
        2,
        "CONTRACT_RESOLUTION",
        { day: 8, month: 1, year: 1000 }, // 7 dias depois
        "Resolução de contratos assinados",
        {
          source: "signed_resolution",
          guildId: "test-guild",
          resolutionType: "signed",
        }
      );
    });

    it("deve pular agendamento se evento já existe", () => {
      // Simular evento já existente
      mockTimelineStore.currentEvents = [
        {
          id: "existing",
          type: "NEW_CONTRACTS" as ScheduledEventType,
          date: { day: 5, month: 1, year: 1000 },
          description: "Evento existente",
          data: { guildId: "test-guild", source: "contract_generation" },
        },
      ];

      const eventConfigs: ModuleEventConfig[] = [
        {
          type: "NEW_CONTRACTS" as ScheduledEventType,
          source: "contract_generation",
          description: "Novos contratos",
          rollTimeFunction: () => 3,
          guildId: "test-guild",
        },
      ];

      scheduleModuleEvents(moduleConfig, eventConfigs);

      // Não deve agendar novo evento pois já existe
      expect(mockTimelineStore.scheduleEvent).not.toHaveBeenCalled();
    });
  });

  describe("processModuleTimeAdvance", () => {
    it("deve processar eventos corretamente", () => {
      const mockHandler1 = vi.fn();
      const mockHandler2 = vi.fn();
      const mockReschedule = vi.fn();

      const eventHandlers: ModuleEventHandler[] = [
        {
          eventType: "NEW_CONTRACTS" as ScheduledEventType,
          handler: mockHandler1,
        },
        {
          eventType: "CONTRACT_RESOLUTION" as ScheduledEventType,
          handler: mockHandler2,
        },
      ];

      const result: TimeAdvanceResult = {
        newDate: { day: 2, month: 1, year: 1000 },
        triggeredEvents: [
          {
            id: "event-1",
            type: "NEW_CONTRACTS" as ScheduledEventType,
            date: { day: 2, month: 1, year: 1000 },
            description: "Novos contratos",
            data: { guildId: "test-guild" },
          },
          {
            id: "event-2",
            type: "CONTRACT_RESOLUTION" as ScheduledEventType,
            date: { day: 2, month: 1, year: 1000 },
            description: "Resolução",
            data: { guildId: "test-guild", resolutionType: "signed" },
          },
          {
            id: "event-3",
            type: "NEW_CONTRACTS" as ScheduledEventType,
            date: { day: 2, month: 1, year: 1000 },
            description: "Evento de outra guilda",
            data: { guildId: "outra-guilda" },
          },
        ],
        eventsRemaining: [],
      };

      processModuleTimeAdvance(
        moduleConfig,
        result,
        eventHandlers,
        mockReschedule
      );

      // Verificar que apenas eventos da guilda correta foram processados
      expect(mockHandler1).toHaveBeenCalledTimes(1);
      expect(mockHandler1).toHaveBeenCalledWith(result.triggeredEvents[0]);

      expect(mockHandler2).toHaveBeenCalledTimes(1);
      expect(mockHandler2).toHaveBeenCalledWith(result.triggeredEvents[1]);

      // Verificar que reagendamento foi chamado
      expect(mockReschedule).toHaveBeenCalledTimes(1);
    });

    it("deve ignorar eventos sem handler", () => {
      const mockHandler = vi.fn();
      const mockReschedule = vi.fn();

      const eventHandlers: ModuleEventHandler[] = [
        {
          eventType: "NEW_CONTRACTS" as ScheduledEventType,
          handler: mockHandler,
        },
      ];

      const result: TimeAdvanceResult = {
        newDate: { day: 2, month: 1, year: 1000 },
        triggeredEvents: [
          {
            id: "event-1",
            type: "SERVICE_RESOLUTION" as ScheduledEventType, // Tipo sem handler
            date: { day: 2, month: 1, year: 1000 },
            description: "Evento sem handler",
            data: { guildId: "test-guild" },
          },
        ],
        eventsRemaining: [],
      };

      processModuleTimeAdvance(
        moduleConfig,
        result,
        eventHandlers,
        mockReschedule
      );

      // Handler não deve ser chamado para evento não suportado
      expect(mockHandler).not.toHaveBeenCalled();
      expect(mockReschedule).toHaveBeenCalledTimes(1);
    });
  });

  describe("updateModuleTimestamp", () => {
    it("deve retornar data atual da timeline", () => {
      const result = updateModuleTimestamp(mockTimelineStore);

      expect(result).toEqual({
        day: 1,
        month: 1,
        year: 1000,
      });
    });

    it("deve falhar se não há data atual", () => {
      const timelineStoreSemData = {
        ...mockTimelineStore,
        currentGameDate: null,
      };

      expect(() => updateModuleTimestamp(timelineStoreSemData)).toThrow(
        "Timeline não possui data atual definida"
      );
    });
  });

  describe("applyAutomaticResolution", () => {
    it("deve aplicar resolução automática corretamente", () => {
      const mockSaveFunction = vi.fn();
      const mockSuccessToast = vi.fn();
      const mockUpdateFunction = vi.fn();

      interface TestItem {
        id: string;
        status: string;
        guildId?: string;
      }

      const items: TestItem[] = [
        { id: "1", status: "ATIVO" },
        { id: "2", status: "PENDENTE" },
        { id: "3", status: "ATIVO" },
      ];

      const resolutionConfig: ResolutionConfig<TestItem> = {
        statusFilter: (item) => item.status === "ATIVO",
        resolutionFunction: (items) =>
          items.map((item) =>
            item.status === "ATIVO" ? { ...item, status: "RESOLVIDO" } : item
          ),
        successMessage: (count) => ({
          title: "Resolução Concluída",
          message: `${count} item(s) foram resolvidos`,
        }),
      };

      applyAutomaticResolution(
        items,
        resolutionConfig,
        () => "test-guild",
        mockUpdateFunction,
        mockSaveFunction,
        mockSuccessToast
      );

      // Verificar que função de update foi chamada com itens corretos
      expect(mockUpdateFunction).toHaveBeenCalledTimes(1);
      const updatedItems = mockUpdateFunction.mock.calls[0][0];

      expect(updatedItems).toHaveLength(3);
      expect(updatedItems[0]).toEqual({
        id: "1",
        status: "RESOLVIDO",
        guildId: "test-guild",
      });
      expect(updatedItems[1]).toEqual({
        id: "2",
        status: "PENDENTE",
        guildId: "test-guild",
      });
      expect(updatedItems[2]).toEqual({
        id: "3",
        status: "RESOLVIDO",
        guildId: "test-guild",
      });

      // Verificar que save foi chamado
      expect(mockSaveFunction).toHaveBeenCalledTimes(1);

      // Verificar que toast foi exibido com mensagem correta
      expect(mockSuccessToast).toHaveBeenCalledWith(
        "Resolução Concluída",
        "2 item(s) foram resolvidos"
      );
    });

    it("deve sair cedo se não há itens para processar", () => {
      const mockSaveFunction = vi.fn();
      const mockSuccessToast = vi.fn();
      const mockUpdateFunction = vi.fn();

      interface TestItem {
        id: string;
        status: string;
        guildId?: string;
      }

      const items: TestItem[] = [
        { id: "1", status: "INATIVO" },
        { id: "2", status: "PAUSADO" },
      ];

      const resolutionConfig: ResolutionConfig<TestItem> = {
        statusFilter: (item) => item.status === "ATIVO",
        resolutionFunction: (items) => items,
        successMessage: (count) => ({
          title: "Resolução",
          message: `${count} item(s)`,
        }),
      };

      applyAutomaticResolution(
        items,
        resolutionConfig,
        () => "test-guild",
        mockUpdateFunction,
        mockSaveFunction,
        mockSuccessToast
      );

      // Nenhuma função deve ter sido chamada
      expect(mockUpdateFunction).not.toHaveBeenCalled();
      expect(mockSaveFunction).not.toHaveBeenCalled();
      expect(mockSuccessToast).not.toHaveBeenCalled();
    });
  });

  describe("Integração entre funções", () => {
    it("deve funcionar em workflow completo de módulo", () => {
      // 1. Verificar que não há eventos ativos
      expect(
        hasActiveEvent(
          moduleConfig,
          "NEW_CONTRACTS" as ScheduledEventType,
          "contract_generation"
        )
      ).toBe(false);

      // 2. Agendar eventos
      const eventConfigs: ModuleEventConfig[] = [
        {
          type: "NEW_CONTRACTS" as ScheduledEventType,
          source: "contract_generation",
          description: "Novos contratos",
          rollTimeFunction: () => 1,
          guildId: "test-guild",
        },
      ];

      scheduleModuleEvents(moduleConfig, eventConfigs);
      expect(mockTimelineStore.scheduleEvent).toHaveBeenCalledTimes(1);

      // 3. Simular que evento foi adicionado à timeline
      mockTimelineStore.currentEvents.push({
        id: "scheduled-event",
        type: "NEW_CONTRACTS" as ScheduledEventType,
        date: { day: 2, month: 1, year: 1000 },
        description: "Novos contratos",
        data: { guildId: "test-guild", source: "contract_generation" },
      });

      // 4. Verificar que agora há evento ativo
      expect(
        hasActiveEvent(
          moduleConfig,
          "NEW_CONTRACTS" as ScheduledEventType,
          "contract_generation"
        )
      ).toBe(true);

      // 5. Processar avanço de tempo
      const mockHandler = vi.fn();
      const mockReschedule = vi.fn();

      const timeAdvance: TimeAdvanceResult = {
        newDate: { day: 2, month: 1, year: 1000 },
        triggeredEvents: mockTimelineStore.currentEvents,
        eventsRemaining: [],
      };

      processModuleTimeAdvance(
        moduleConfig,
        timeAdvance,
        [
          {
            eventType: "NEW_CONTRACTS" as ScheduledEventType,
            handler: mockHandler,
          },
        ],
        mockReschedule
      );

      expect(mockHandler).toHaveBeenCalledTimes(1);
      expect(mockReschedule).toHaveBeenCalledTimes(1);

      // 6. Verificar timestamp atualizado
      const timestamp = updateModuleTimestamp(mockTimelineStore);
      expect(timestamp).toEqual(mockTimelineStore.currentGameDate);
    });
  });
});
