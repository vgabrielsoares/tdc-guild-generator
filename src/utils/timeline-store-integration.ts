import type {
  GameDate,
  ScheduledEvent,
  ScheduledEventType,
  TimeAdvanceResult,
} from "@/types/timeline";
import { addDays } from "@/utils/date-utils";

/**
 * Tipo para representar o store de timeline
 */
export type TimelineStore = {
  currentGameDate: GameDate | null;
  currentEvents: ScheduledEvent[];
  scheduleEvent: (
    type: ScheduledEventType,
    date: GameDate,
    description: string,
    data?: Record<string, unknown>
  ) => ScheduledEvent | null;
};

/**
 * Configuração para agendamento de eventos de um módulo
 */
export interface ModuleEventConfig {
  type: ScheduledEventType;
  source: string;
  description: string;
  rollTimeFunction: () => number;
  guildId: string;
  resolutionType?: string;
}

/**
 * Configuração base para um módulo integrado com timeline
 */
export interface TimelineModuleConfig {
  moduleType: "contracts" | "services" | "notices" | "members" | "renown";
  guildIdGetter: () => string | undefined;
  timelineStore: TimelineStore;
}

/**
 * Verifica se já existe um evento ativo de um tipo específico para a guilda atual
 * Funcionalidade compartilhada entre contracts e services stores
 */
export function hasActiveEvent(
  config: TimelineModuleConfig,
  eventType: ScheduledEventType,
  source?: string
): boolean {
  const { timelineStore, guildIdGetter } = config;

  if (!timelineStore.currentGameDate) return false;

  const currentGuildId = guildIdGetter();
  if (!currentGuildId) return false;

  const currentEvents = timelineStore.currentEvents;
  const currentDate = timelineStore.currentGameDate;

  return currentEvents.some((event: ScheduledEvent) => {
    // Verificar se é da guilda atual
    if (event.data?.guildId !== currentGuildId) return false;

    // Verificar se é do tipo correto
    if (event.type !== eventType) return false;

    // Verificar source se especificado
    if (source && event.data?.source !== source) return false;

    // Verificar se não é um evento para resolução hoje (esses podem ser processados)
    if (eventType.toString().includes("_RESOLUTION")) {
      const isToday =
        event.date.year === currentDate.year &&
        event.date.month === currentDate.month &&
        event.date.day === currentDate.day;
      if (isToday) return false; // Não considerar eventos de hoje como "ativos" para esta verificação
    }

    return true;
  });
}

/**
 * Agenda eventos de timeline baseados em configurações do módulo
 * Funcionalidade compartilhada para agendar eventos futuros
 */
export function scheduleModuleEvents(
  config: TimelineModuleConfig,
  eventConfigs: ModuleEventConfig[]
): void {
  const { timelineStore, guildIdGetter } = config;

  if (!timelineStore.currentGameDate) {
    return;
  }

  const currentGuildId = guildIdGetter();
  if (!currentGuildId) {
    return;
  }

  eventConfigs.forEach((eventConfig) => {
    // Verificar se já existe um evento ativo deste tipo
    if (!hasActiveEvent(config, eventConfig.type, eventConfig.source)) {
      // Agendar próximo evento baseado nas regras
      const daysUntilEvent = eventConfig.rollTimeFunction();
      const eventDate = addDays(timelineStore.currentGameDate!, daysUntilEvent);

      const eventData: Record<string, unknown> = {
        source: eventConfig.source,
        guildId: currentGuildId,
      };

      if (eventConfig.resolutionType) {
        eventData.resolutionType = eventConfig.resolutionType;
      }

      timelineStore.scheduleEvent(
        eventConfig.type,
        eventDate,
        eventConfig.description,
        eventData
      );
    }
  });
}

/**
 * Filtra eventos relacionados a um módulo específico
 * Funcionalidade compartilhada para processar eventos de timeline
 */
export function filterModuleEvents(
  result: TimeAdvanceResult,
  moduleTypes: ScheduledEventType[],
  guildId: string
): ScheduledEvent[] {
  return result.triggeredEvents.filter(
    (event: ScheduledEvent) =>
      event.data?.guildId === guildId && moduleTypes.includes(event.type)
  );
}

/**
 * Interface para handlers de eventos específicos de módulo
 */
export interface ModuleEventHandler {
  eventType: ScheduledEventType;
  handler: (event: ScheduledEvent) => void;
}

/**
 * Processa eventos de timeline para um módulo específico
 * Funcionalidade compartilhada para executar ações baseadas em eventos
 */
export function processModuleTimeAdvance(
  config: TimelineModuleConfig,
  result: TimeAdvanceResult,
  eventHandlers: ModuleEventHandler[],
  rescheduleFunction: () => void
): void {
  const { guildIdGetter } = config;

  if (!config.timelineStore.currentGameDate) {
    return;
  }

  const currentGuildId = guildIdGetter();
  if (!currentGuildId) {
    return;
  }

  // Criar mapa de tipos de eventos suportados
  const supportedEventTypes = eventHandlers.map((h) => h.eventType);

  // Filtrar eventos relevantes para este módulo
  const moduleEvents = filterModuleEvents(
    result,
    supportedEventTypes,
    currentGuildId
  );

  // Processar cada evento
  moduleEvents.forEach((event) => {
    const handler = eventHandlers.find((h) => h.eventType === event.type);
    if (handler) {
      handler.handler(event);
    }
  });

  // Reagendar eventos para o futuro
  rescheduleFunction();
}

/**
 * Cria data GameDate a partir da timeline atual
 * Utilidade compartilhada para conversões de data
 */
export function createGameDateFromTimeline(
  timelineStore: TimelineStore
): GameDate {
  const currentDate = timelineStore.currentGameDate;
  if (!currentDate) {
    throw new Error("Timeline não possui data atual definida");
  }

  return {
    day: currentDate.day,
    month: currentDate.month,
    year: currentDate.year,
  };
}

/**
 * Utilitário para atualizar lastUpdate de forma consistente
 */
export function updateModuleTimestamp(timelineStore: TimelineStore): GameDate {
  const currentDate = timelineStore.currentGameDate;
  if (!currentDate) {
    throw new Error("Timeline não possui data atual definida");
  }

  return {
    day: currentDate.day,
    month: currentDate.month,
    year: currentDate.year,
  };
}

/**
 * Interface para configuração de resolução automática
 */
export interface ResolutionConfig<T> {
  statusFilter: (item: T) => boolean;
  resolutionFunction: (items: T[]) => T[];
  successMessage?: (count: number) => { title: string; message: string };
}

/**
 * Função genérica para aplicar resoluções automáticas
 * Compartilhada entre contratos e serviços
 */
export function applyAutomaticResolution<T extends { guildId?: string }>(
  items: T[],
  resolutionConfig: ResolutionConfig<T>,
  guildIdGetter: () => string | undefined,
  updateFunction: (updatedItems: T[]) => void,
  saveFunction: () => void
): void {
  const targetItems = items.filter(resolutionConfig.statusFilter);

  if (targetItems.length === 0) {
    return;
  }

  // Aplicar resolução específica
  const updatedItems = resolutionConfig.resolutionFunction(items);
  const itemsWithGuild = updatedItems.map((item) => ({
    ...item,
    guildId: item.guildId || guildIdGetter() || "unknown",
  })) as T[];

  updateFunction(itemsWithGuild);
  saveFunction();
}
