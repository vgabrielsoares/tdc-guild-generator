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
  createGameDate,
  addDays,
  getTriggeredEvents,
  getRemainingEvents,
  getNextEvent,
  getDaysUntilNextEvent,
  sortEventsByDate,
  formatGameDate,
  isSameDate,
} from "@/utils/date-utils";
import { useStorageAdapter } from "@/composables/useStorageAdapter";
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

  // Storage adapter para IndexedDB
  const storageAdapter = useStorageAdapter();
  const { success, info, warning } = useToast();

  // Normaliza diferentes representações de data para o formato GameDate
  function normalizeGameDate(input: unknown) {
    try {
      if (input === null || input === undefined) return createDefaultGameDate();

      // Se já for um objeto do tipo GameDate
      if (typeof input === "object") {
        const obj = input as Record<string, unknown>;
        if (
          typeof obj.day === "number" &&
          typeof obj.month === "number" &&
          typeof obj.year === "number"
        ) {
          return createGameDate(
            obj.day as number,
            obj.month as number,
            obj.year as number
          );
        }

        // Se for uma instância Date (possivelmente revivida pela desserialização)
        if (obj instanceof Date) {
          return createGameDate(
            obj.getDate(),
            obj.getMonth() + 1,
            obj.getFullYear()
          );
        }

        // Se for um objeto de data serializado produzido por serializeData (ex: { __type: 'Date', value: '...' })
        if (obj.__type === "Date" && typeof obj.value === "string") {
          const parsed = new Date(obj.value);
          if (!Number.isNaN(parsed.getTime())) {
            return createGameDate(
              parsed.getDate(),
              parsed.getMonth() + 1,
              parsed.getFullYear()
            );
          }
        }
      }

      // Strings (ISO ou outros) ou timestamps numéricos
      if (typeof input === "string" || typeof input === "number") {
        const parsed = new Date(input as string | number);
        if (!Number.isNaN(parsed.getTime())) {
          return createGameDate(
            parsed.getDate(),
            parsed.getMonth() + 1,
            parsed.getFullYear()
          );
        }
      }
    } catch (e) {
      // fallback
    }

    return createDefaultGameDate();
  }

  // Flag para controlar se os dados foram carregados inicialmente
  const isInitialized = ref(false);

  /**
   * Carrega todas as timelines do IndexedDB
   */
  async function loadAllTimelinesFromDB(): Promise<void> {
    try {
      const timelineRecords = await storageAdapter.list<{
        guildId: string;
        currentDate: GameDate;
        events: ScheduledEvent[];
        createdAt: Date;
        updatedAt: Date;
      }>("timeline");

      // Agrupar eventos por guildId para reconstituir as timelines
      const timelinesMap: Record<string, GuildTimeline> = {};

      for (const record of timelineRecords) {
        const rec = record as unknown as Record<string, unknown>;
        const guildId = rec.guildId as string;

        // Garantir que exista um placeholder para esta guilda
        if (!timelinesMap[guildId]) {
          timelinesMap[guildId] = {
            guildId,
            currentDate: createDefaultGameDate(),
            events: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        }

        // Se este registro aparenta ser a timeline principal (possui currentDate ou array events), usá-lo para popular metadados
        if (rec.currentDate || (rec.events && Array.isArray(rec.events))) {
          // Sobrescrever currentDate se presente (esta é a linha autoritativa da timeline)
          if (rec.currentDate) {
            timelinesMap[guildId].currentDate = normalizeGameDate(
              rec.currentDate
            );
          }

          // createdAt/updatedAt podem estar armazenados como Date ou string
          if (record.createdAt)
            timelinesMap[guildId].createdAt = new Date(
              record.createdAt as unknown as string | number | Date
            );
          if (record.updatedAt)
            timelinesMap[guildId].updatedAt = new Date(
              record.updatedAt as unknown as string | number | Date
            );

          // Mesclar array de eventos se presente
          if (rec.events && Array.isArray(rec.events)) {
            for (const ev of rec.events as unknown as unknown[]) {
              try {
                if (ev && typeof ev === "object") {
                  const eObj = {
                    ...(ev as unknown as Record<string, unknown>),
                  } as Record<string, unknown>;
                  eObj.date = normalizeGameDate(eObj.date as unknown);
                  timelinesMap[guildId].events.push(
                    eObj as unknown as ScheduledEvent
                  );
                }
              } catch {
                // ignore invalid event
              }
            }
          }
        }

        // Se este registro aparenta ser uma linha de evento individual (possui propriedade event), adicioná-lo
        if (rec.event && typeof rec.event === "object") {
          try {
            const ev = { ...(rec.event as Record<string, unknown>) } as Record<
              string,
              unknown
            >;
            ev.date = normalizeGameDate(ev.date as unknown);
            timelinesMap[guildId].events.push(ev as unknown as ScheduledEvent);
          } catch {
            // ignore invalid
          }
        }
      }

      // Ordenar eventos por data em cada timeline
      Object.values(timelinesMap).forEach((timeline) => {
        timeline.events = sortEventsByDate(timeline.events);
      });

      timelines.value = timelinesMap;
      // marcar inicializado antes de tentar restaurar guilda atual
      isInitialized.value = true;

      // Tentar restaurar a guilda atual persistida nas settings (compatibilidade com useGuildStorage)
      try {
        const persistedCurrentGuildId = await storageAdapter.get<string | null>(
          "settings",
          "guild-current-id"
        );
        if (
          persistedCurrentGuildId &&
          typeof persistedCurrentGuildId === "string"
        ) {
          // delegar para a função que já lida com sincronização com guild store
          try {
            setCurrentGuild(persistedCurrentGuildId);
          } catch (e) {
            // ignore errors restoring current guild to avoid breaking timeline load
          }
        }
      } catch (e) {
        // ignore errors reading settings
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Erro ao carregar timelines:", error);
      warning("Erro", "Falha ao carregar timelines do banco de dados");
      isInitialized.value = true; // Marca como inicializado mesmo com erro
    }
  }

  /**
   * Salva uma timeline específica no IndexedDB
   */
  async function saveTimelineToDatabase(
    timeline: GuildTimeline
  ): Promise<void> {
    try {
      // Salvar dados básicos da timeline
      const timelineKey = `timeline_${timeline.guildId}`;
      await storageAdapter.put("timeline", timelineKey, {
        guildId: timeline.guildId,
        currentDate: timeline.currentDate,
        events: timeline.events,
        createdAt: timeline.createdAt,
        updatedAt: timeline.updatedAt,
      });

      // Salvar eventos individuais para otimização de consultas
      for (const event of timeline.events) {
        if (!event || !event.date) continue; // proteger eventos inválidos

        const normalizedDate = normalizeGameDate(event.date);

        const eventKey = `event_${event.id}`;
        await storageAdapter.put("timeline", eventKey, {
          guildId: timeline.guildId,
          event: { ...event, date: normalizedDate },
          eventDate: new Date(
            normalizedDate.year,
            normalizedDate.month - 1,
            normalizedDate.day
          ),
          eventType: event.type,
        });
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Erro ao salvar timeline:", error);
      throw new Error("Falha ao salvar timeline no banco de dados");
    }
  }

  /**
   * Remove uma timeline do IndexedDB
   */
  async function removeTimelineFromDatabase(guildId: string): Promise<void> {
    try {
      // Remover timeline principal
      const timelineKey = `timeline_${guildId}`;
      await storageAdapter.del("timeline", timelineKey);

      // Buscar e remover eventos associados
      const allRecords = await storageAdapter.list<{
        guildId: string;
        event?: ScheduledEvent;
      }>("timeline");

      const eventsToDelete = allRecords.filter(
        (record) => record.guildId === guildId && record.event
      );

      for (const eventRecord of eventsToDelete) {
        if (eventRecord.event) {
          await storageAdapter.del("timeline", `event_${eventRecord.event.id}`);
        }
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Erro ao remover timeline:", error);
      throw new Error("Falha ao remover timeline do banco de dados");
    }
  }

  // Inicialização automática
  loadAllTimelinesFromDB();

  // Auto-save quando timelines mudam (com debounce para performance)
  let saveTimeout: NodeJS.Timeout | null = null;
  watch(
    timelines,
    (newTimelines) => {
      if (!isInitialized.value) return; // Não salvar durante carregamento inicial

      // Debounce para evitar muitas operações de salvamento
      if (saveTimeout) {
        clearTimeout(saveTimeout);
      }

      saveTimeout = setTimeout(async () => {
        for (const timeline of Object.values(newTimelines)) {
          try {
            await saveTimelineToDatabase(timeline);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error("Erro no auto-save da timeline:", error);
          }
        }
      }, 500); // Aguardar 500ms entre salvamentos
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

    // Also attempt to notify the guild store so the 'currentGuild' is set and persisted.
    // Use dynamic import to avoid circular dependency at module load time.
    void (async () => {
      try {
        const [{ useGuildStore }, { useStorageAdapter }] = await Promise.all([
          import("./guild"),
          import("@/composables/useStorageAdapter"),
        ]);

        const guildStore = useGuildStore();
        // If the guild is already present in history, load it into currentGuild
        const inHistory = guildStore.guildHistory.some((g) => g.id === guildId);
        if (inHistory) {
          guildStore.loadGuildFromHistory(guildId);
          // Ensure it's locked when the timeline is active
          void guildStore.toggleGuildLock(guildId);
          return;
        }

        // Fallback: try to fetch the guild directly from persistent storage and add to history
        const adapter = useStorageAdapter();
        try {
          const rec = await adapter.get<Record<string, unknown> | null>(
            "guilds",
            guildId
          );
          if (rec) {
            // rec may be { value: Guild } or raw Guild
            let candidate: unknown = rec;
            if (
              rec &&
              typeof rec === "object" &&
              (rec as Record<string, unknown>).value
            ) {
              candidate = (rec as Record<string, unknown>).value;
            }
            const { createGuild } = await import("@/types/guild");
            try {
              const guildObj = createGuild(candidate as unknown);
              guildStore.addToHistory(guildObj);
              guildStore.setCurrentGuild(guildObj);
              // lock it
              void guildStore.toggleGuildLock(guildId);
            } catch (e) {
              // ignore parse errors
            }
          }
        } catch (e) {
          // ignore adapter errors
        }
      } catch {
        // ignore any errors to avoid breaking timeline creation
      }
    })();
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

    // Set this guild as current timeline/guild so UI and other stores sync
    currentGuildId.value = guildId;

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
  async function removeTimelineForGuild(guildId: string): Promise<void> {
    if (timelines.value[guildId]) {
      // Remover do banco de dados
      try {
        await removeTimelineFromDatabase(guildId);
      } catch (error) {
        warning("Erro", "Falha ao remover timeline do banco de dados");
      }

      // Remover do estado local
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
   * Busca eventos por data específica (otimizada para IndexedDB)
   */
  async function getEventsByDate(
    guildId: string,
    date: GameDate
  ): Promise<ScheduledEvent[]> {
    try {
      const targetDate = new Date(date.year, date.month - 1, date.day);
      const allRecords = await storageAdapter.list<{
        guildId: string;
        event?: ScheduledEvent;
        eventDate?: Date;
      }>("timeline");

      return allRecords
        .filter(
          (record) =>
            record.guildId === guildId &&
            record.event &&
            record.eventDate &&
            record.eventDate.getTime() === targetDate.getTime()
        )
        .map((record) => record.event as ScheduledEvent);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Erro ao buscar eventos por data:", error);
      return [];
    }
  }

  /**
   * Busca eventos por tipo em uma guilda específica (otimizada para IndexedDB)
   */
  async function getEventsByTypeAndGuild(
    guildId: string,
    type: ScheduledEventType
  ): Promise<ScheduledEvent[]> {
    try {
      const allRecords = await storageAdapter.list<{
        guildId: string;
        event?: ScheduledEvent;
        eventType?: string;
      }>("timeline");

      return allRecords
        .filter(
          (record) =>
            record.guildId === guildId &&
            record.event &&
            record.eventType === type
        )
        .map((record) => record.event as ScheduledEvent);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Erro ao buscar eventos por tipo:", error);
      return [];
    }
  }

  /**
   * Busca eventos pendentes (futuros) para uma guilda
   */
  async function getPendingEvents(guildId: string): Promise<ScheduledEvent[]> {
    try {
      const timeline = timelines.value[guildId];
      if (!timeline) return [];

      const currentDate = timeline.currentDate;
      const currentDateJs = new Date(
        currentDate.year,
        currentDate.month - 1,
        currentDate.day
      );

      const allRecords = await storageAdapter.list<{
        guildId: string;
        event?: ScheduledEvent;
        eventDate?: Date;
      }>("timeline");

      return allRecords
        .filter(
          (record) =>
            record.guildId === guildId &&
            record.event &&
            record.eventDate &&
            record.eventDate.getTime() > currentDateJs.getTime()
        )
        .map((record) => record.event as ScheduledEvent)
        .sort((a, b) => {
          const dateA = new Date(a.date.year, a.date.month - 1, a.date.day);
          const dateB = new Date(b.date.year, b.date.month - 1, b.date.day);
          return dateA.getTime() - dateB.getTime();
        });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Erro ao buscar eventos pendentes:", error);
      return [];
    }
  }

  /**
   * Limpeza de histórico temporal antigo (manter últimos N dias)
   */
  async function cleanupOldHistory(
    guildId: string,
    daysToKeep: number = 90
  ): Promise<void> {
    try {
      const timeline = timelines.value[guildId];
      if (!timeline) return;

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const allRecords = await storageAdapter.list<{
        guildId: string;
        event?: ScheduledEvent;
        eventDate?: Date;
      }>("timeline");

      const recordsToDelete = allRecords.filter(
        (record) =>
          record.guildId === guildId &&
          record.event &&
          record.eventDate &&
          record.eventDate.getTime() < cutoffDate.getTime()
      );

      for (const record of recordsToDelete) {
        if (record.event) {
          await storageAdapter.del("timeline", `event_${record.event.id}`);
        }
      }

      info(
        "Limpeza concluída",
        `${recordsToDelete.length} eventos antigos removidos`
      );
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Erro na limpeza de histórico:", error);
      warning("Erro", "Falha na limpeza de eventos antigos");
    }
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
  async function resetAllTimelines(): Promise<void> {
    // Remover todas as timelines do banco de dados
    const guildIds = Object.keys(timelines.value);

    for (const guildId of guildIds) {
      try {
        await removeTimelineFromDatabase(guildId);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(`Erro ao remover timeline ${guildId}:`, error);
      }
    }

    // Limpar estado local
    timelines.value = {};
    currentGuildId.value = null;

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

    // Consultas IndexedDB
    getEventsByDate,
    getEventsByTypeAndGuild,
    getPendingEvents,
    cleanupOldHistory,

    // Callbacks de integração
    registerTimeAdvanceCallback,
    unregisterTimeAdvanceCallback,

    // Utilitários de persistência
    loadAllTimelinesFromDB,
    saveTimelineToDatabase,
    removeTimelineFromDatabase,
  };
});
