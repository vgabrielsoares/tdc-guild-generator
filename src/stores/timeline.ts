import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import type {
  GameDate,
  GuildTimeline,
  ScheduledEvent,
  ScheduledEventType,
  TimeAdvanceResult,
} from "@/types/timeline";
import {
  createDefaultGameDate,
  addDays,
  getTriggeredEvents,
  getRemainingEvents,
  getNextEvent,
  getDaysUntilNextEvent,
  sortEventsByDate,
  formatGameDate,
  isSameDate,
} from "@/utils/date-utils";
import { useStorage } from "@/composables/useStorage";
import { useToast } from "@/composables/useToast";

// Função simples para gerar IDs únicos
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export const useTimelineStore = defineStore("timeline", () => {
  // Estado interno
  const timelines = ref<Record<string, GuildTimeline>>({});
  const currentGuildId = ref<string | null>(null);

  // Callbacks para integração com outros stores
  const timeAdvanceCallbacks = ref<((result: TimeAdvanceResult) => void)[]>([]);

  // Storage e utilitários
  const { data: storedTimelines, reset: resetStorage } = useStorage(
    "guild-timelines",
    {} as Record<string, GuildTimeline>
  );
  const { success, info, warning } = useToast();

  // Carregar dados do storage na inicialização
  if (storedTimelines.value && typeof storedTimelines.value === "object") {
    timelines.value = { ...storedTimelines.value };
  }

  // Auto-save quando timelines mudam
  watch(
    timelines,
    (newTimelines) => {
      storedTimelines.value = { ...newTimelines };
    },
    { deep: true }
  );

  // Computed: Timeline atual
  const currentTimeline = computed((): GuildTimeline | null => {
    if (!currentGuildId.value) return null;
    return timelines.value[currentGuildId.value] || null;
  });

  // Computed: Data atual do jogo
  const currentGameDate = computed((): GameDate | null => {
    return currentTimeline.value?.currentDate || null;
  });

  // Computed: Eventos da timeline atual
  const currentEvents = computed((): ScheduledEvent[] => {
    return currentTimeline.value?.events || [];
  });

  // Computed: Próximo evento
  const nextEvent = computed((): ScheduledEvent | null => {
    if (!currentGameDate.value) return null;
    return getNextEvent(currentEvents.value, currentGameDate.value);
  });

  // Computed: Dias até próximo evento
  const daysUntilNextEvent = computed((): number | null => {
    if (!currentGameDate.value) return null;
    return getDaysUntilNextEvent(currentEvents.value, currentGameDate.value);
  });

  // Computed: Data formatada atual
  const formattedCurrentDate = computed((): string => {
    if (!currentGameDate.value) return "";
    return formatGameDate(currentGameDate.value);
  });

  // Computed: Estatísticas da timeline
  const timelineStats = computed(() => {
    if (!currentTimeline.value) {
      return {
        totalEvents: 0,
        pastEvents: 0,
        futureEvents: 0,
        todayEvents: 0,
      };
    }

    const { events, currentDate } = currentTimeline.value;
    const pastEvents = getTriggeredEvents(events, currentDate);
    const futureEvents = getRemainingEvents(events, currentDate);
    const todayEvents = events.filter((event) =>
      isSameDate(event.date, currentDate)
    );

    return {
      totalEvents: events.length,
      pastEvents: pastEvents.length,
      futureEvents: futureEvents.length,
      todayEvents: todayEvents.length,
    };
  });

  // Actions

  /**
   * Define a guilda atual e carrega sua timeline (se existir)
   */
  function setCurrentGuild(guildId: string): void {
    currentGuildId.value = guildId;
  }

  /**
   * Inicializa manualmente a timeline para a guilda atual
   */
  function initializeTimelineForCurrentGuild(
    startDate?: GameDate
  ): GuildTimeline | null {
    if (!currentGuildId.value) {
      warning("Erro", "Nenhuma guilda ativa para inicializar timeline");
      return null;
    }

    // Criar timeline se não existir
    if (!timelines.value[currentGuildId.value]) {
      const timeline = createTimelineForGuild(currentGuildId.value, startDate);
      success(
        "Timeline Inicializada",
        "Timeline da guilda foi criada com sucesso"
      );
      return timeline;
    }

    return timelines.value[currentGuildId.value];
  }

  /**
   * Cria uma nova timeline para uma guilda
   */
  function createTimelineForGuild(
    guildId: string,
    startDate?: GameDate
  ): GuildTimeline {
    const now = new Date();
    const timeline: GuildTimeline = {
      guildId,
      currentDate: startDate || createDefaultGameDate(),
      events: [],
      createdAt: now,
      updatedAt: now,
    };

    timelines.value[guildId] = timeline;

    // Ao criar a timeline pela primeira vez, marcar a guilda como bloqueada
    // automaticamente para evitar que o usuário regenere partes que deveriam
    // permanecer estáveis após a inicialização da timeline. Usamos import
    // dinâmico para evitar import circulares entre stores.
    import("./guild")
      .then(({ useGuildStore }) => {
        try {
          const guildStore = useGuildStore();
          // Se a guilda já estiver no histórico e desbloqueada, aplicar lock
          const inHistory = guildStore.guildHistory.some(
            (g) => g.id === guildId
          );
          const alreadyLocked = guildStore.guildHistory.some(
            (g) => g.id === guildId && g.locked
          );

          if (inHistory && !alreadyLocked) {
            // toggleGuildLock é async. não aguardamos para não bloquear a criação
            // da timeline, apenas tentamos aplicar o lock (erros são silenciosos).
            void guildStore.toggleGuildLock(guildId).catch(() => {});
          }
        } catch {
          // silencioso: se algo falhar, não impedimos a criação da timeline
        }
      })
      .catch(() => {
        // silencioso
      });

    return timeline;
  }

  /**
   * Remove a timeline de uma guilda (quando guilda é removida)
   */
  function removeTimelineForGuild(guildId: string): void {
    if (timelines.value[guildId]) {
      delete timelines.value[guildId];

      // Se era a timeline atual, limpar referência
      if (currentGuildId.value === guildId) {
        currentGuildId.value = null;
      }

      info("Timeline removida", "Timeline da guilda foi removida");
    }
  }

  /**
   * Avança o tempo por um dia e processa eventos
   */
  function advanceOneDay(): TimeAdvanceResult | null {
    if (!currentTimeline.value) {
      warning("Erro", "Nenhuma timeline ativa");
      return null;
    }

    const { currentDate, events } = currentTimeline.value;
    const newDate = addDays(currentDate, 1);

    // Encontrar eventos que devem ser acionados
    const triggeredEvents = getTriggeredEvents(events, newDate);
    const eventsRemaining = getRemainingEvents(events, newDate);

    // Atualizar timeline
    const updatedTimeline: GuildTimeline = {
      ...currentTimeline.value,
      currentDate: newDate,
      events: eventsRemaining, // Remove eventos processados
      updatedAt: new Date(),
    };

    timelines.value[currentTimeline.value.guildId] = updatedTimeline;

    const result: TimeAdvanceResult = {
      newDate,
      triggeredEvents,
      eventsRemaining,
    };

    // Notificar outros stores sobre a mudança de tempo
    notifyTimeAdvanceCallbacks(result);

    return result;
  }

  /**
   * Define uma data específica (pula para uma data)
   */
  function setCustomDate(date: GameDate): TimeAdvanceResult | null {
    if (!currentTimeline.value) {
      warning("Erro", "Nenhuma timeline ativa");
      return null;
    }

    const { events } = currentTimeline.value;

    // Encontrar eventos que devem ser acionados até a nova data
    const triggeredEvents = getTriggeredEvents(events, date);
    const eventsRemaining = getRemainingEvents(events, date);

    // Atualizar timeline
    const updatedTimeline: GuildTimeline = {
      ...currentTimeline.value,
      currentDate: date,
      events: eventsRemaining,
      updatedAt: new Date(),
    };

    timelines.value[currentTimeline.value.guildId] = updatedTimeline;

    const result: TimeAdvanceResult = {
      newDate: date,
      triggeredEvents,
      eventsRemaining,
    };

    // Notificar outros stores sobre a mudança de tempo
    notifyTimeAdvanceCallbacks(result);

    return result;
  }

  /**
   * Agenda um novo evento
   */
  function scheduleEvent(
    type: ScheduledEventType,
    date: GameDate,
    description: string,
    data?: Record<string, unknown>
  ): ScheduledEvent | null {
    if (!currentTimeline.value) {
      warning("Erro", "Nenhuma timeline ativa");
      return null;
    }

    const event: ScheduledEvent = {
      id: generateId(),
      type,
      date,
      description,
      data,
    };

    const updatedEvents = [...currentTimeline.value.events, event];
    const sortedEvents = sortEventsByDate(updatedEvents);

    const updatedTimeline: GuildTimeline = {
      ...currentTimeline.value,
      events: sortedEvents,
      updatedAt: new Date(),
    };

    timelines.value[currentTimeline.value.guildId] = updatedTimeline;

    return event;
  }

  /**
   * Remove um evento agendado
   */
  function removeEvent(eventId: string): boolean {
    if (!currentTimeline.value) return false;

    const updatedEvents = currentTimeline.value.events.filter(
      (event) => event.id !== eventId
    );

    if (updatedEvents.length === currentTimeline.value.events.length) {
      return false; // Evento não encontrado
    }

    const updatedTimeline: GuildTimeline = {
      ...currentTimeline.value,
      events: updatedEvents,
      updatedAt: new Date(),
    };

    timelines.value[currentTimeline.value.guildId] = updatedTimeline;

    return true;
  }

  /**
   * Obtém eventos de um tipo específico
   */
  function getEventsByType(type: ScheduledEventType): ScheduledEvent[] {
    if (!currentTimeline.value) return [];
    return currentTimeline.value.events.filter((event) => event.type === type);
  }

  /**
   * Limpa todos os eventos de uma timeline
   */
  function clearEvents(): void {
    if (!currentTimeline.value) return;

    const updatedTimeline: GuildTimeline = {
      ...currentTimeline.value,
      events: [],
      updatedAt: new Date(),
    };

    timelines.value[currentTimeline.value.guildId] = updatedTimeline;

    info("Eventos limpos", "Todos os eventos foram removidos da timeline");
  }

  /**
   * Reseta todas as timelines (usado para limpeza)
   */
  function resetAllTimelines(): void {
    timelines.value = {};
    currentGuildId.value = null;
    resetStorage();

    info("Timelines resetadas", "Todas as timelines foram removidas");
  }

  /**
   * Registra um callback para ser chamado quando o tempo avança
   */
  function registerTimeAdvanceCallback(
    callback: (result: TimeAdvanceResult) => void
  ): void {
    timeAdvanceCallbacks.value.push(callback);
  }

  /**
   * Remove um callback de time advance
   */
  function unregisterTimeAdvanceCallback(
    callback: (result: TimeAdvanceResult) => void
  ): void {
    const index = timeAdvanceCallbacks.value.indexOf(callback);
    if (index > -1) {
      timeAdvanceCallbacks.value.splice(index, 1);
    }
  }

  /**
   * Notifica todos os callbacks registrados sobre mudança de tempo
   */
  function notifyTimeAdvanceCallbacks(result: TimeAdvanceResult): void {
    timeAdvanceCallbacks.value.forEach((callback) => {
      try {
        callback(result);
      } catch (error) {
        // Silenciar erro para evitar breaking da app
      }
    });
  }

  return {
    // Estado
    timelines: computed(() => timelines.value),
    currentGuildId: computed(() => currentGuildId.value),
    currentTimeline,
    currentGameDate,
    currentEvents,
    nextEvent,
    daysUntilNextEvent,
    formattedCurrentDate,
    timelineStats,

    // Actions
    setCurrentGuild,
    initializeTimelineForCurrentGuild,
    createTimelineForGuild,
    removeTimelineForGuild,
    advanceOneDay,
    setCustomDate,
    scheduleEvent,
    removeEvent,
    getEventsByType,
    clearEvents,
    resetAllTimelines,

    // Callbacks de integração
    registerTimeAdvanceCallback,
    unregisterTimeAdvanceCallback,
  };
});
