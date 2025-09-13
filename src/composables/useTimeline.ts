import { useTimelineStore } from "@/stores/timeline";
import { storeToRefs } from "pinia";
import type { GameDate, ScheduledEventType } from "@/types/timeline";
import {
  addDays,
  addWeeks,
  addMonths,
  formatGameDate,
  formatShortGameDate,
  getDaysDifference,
  createGameDate,
} from "@/utils/date-utils";

/**
 * Composable para facilitar o uso do sistema de timeline
 * Fornece uma interface simplificada para operações comuns
 */
export function useTimeline() {
  const timelineStore = useTimelineStore();

  // Estado reativo

  // Obtém refs declarados no store (mantém .value para os consumidores)
  const {
    currentGameDate,
    formattedCurrentDate,
    nextEvent: nextEventRef,
    daysUntilNextEvent,
    timelineStats,
    currentEvents,
  } = storeToRefs(timelineStore);

  // Utilidades de data
  const dateUtils = {
    format: formatGameDate,
    formatShort: formatShortGameDate,
    addDays,
    addWeeks,
    addMonths,
    getDaysDifference,
    createDate: createGameDate,
  };

  // Ações simplificadas

  /**
   * Avança um dia na timeline
   */
  function passDay() {
    return timelineStore.advanceOneDay();
  }

  /**
   * Define uma data específica
   */
  function setDate(date: GameDate) {
    return timelineStore.setCustomDate(date);
  }

  /**
   * Define uma data usando valores separados
   */
  function setDateFromValues(day: number, month: number, year: number) {
    const date = createGameDate(day, month, year);
    return timelineStore.setCustomDate(date);
  }

  /**
   * Avança vários dias de uma vez
   */
  function passDays(days: number) {
    if (!currentGameDate.value) return null;
    const newDate = addDays(currentGameDate.value, days);
    return timelineStore.setCustomDate(newDate);
  }

  /**
   * Avança semanas
   */
  function passWeeks(weeks: number) {
    if (!currentGameDate.value) return null;
    const newDate = addWeeks(currentGameDate.value, weeks);
    return timelineStore.setCustomDate(newDate);
  }

  /**
   * Avança meses
   */
  function passMonths(months: number) {
    if (!currentGameDate.value) return null;
    const newDate = addMonths(currentGameDate.value, months);
    return timelineStore.setCustomDate(newDate);
  }

  /**
   * Agenda um evento simples
   */
  function scheduleEvent(
    type: ScheduledEventType,
    daysFromNow: number,
    description: string,
    data?: Record<string, unknown>
  ) {
    if (!currentGameDate.value) return null;
    const eventDate = addDays(currentGameDate.value, daysFromNow);
    return timelineStore.scheduleEvent(type, eventDate, description, data);
  }

  /**
   * Agenda evento para uma data específica
   */
  function scheduleEventForDate(
    type: ScheduledEventType,
    date: GameDate,
    description: string,
    data?: Record<string, unknown>
  ) {
    return timelineStore.scheduleEvent(type, date, description, data);
  }

  /**
   * Agenda evento usando valores de data
   */
  function scheduleEventForDateValues(
    type: ScheduledEventType,
    day: number,
    month: number,
    year: number,
    description: string,
    data?: Record<string, unknown>
  ) {
    const date = createGameDate(day, month, year);
    return timelineStore.scheduleEvent(type, date, description, data);
  }

  /**
   * Remove um evento
   */
  function removeEvent(eventId: string) {
    return timelineStore.removeEvent(eventId);
  }

  /**
   * Obtém eventos de um tipo específico
   */
  function getEventsByType(type: ScheduledEventType) {
    return timelineStore.getEventsByType(type);
  }

  /**
   * Verifica se há eventos hoje
   */
  function hasEventsToday() {
    return timelineStats.value?.todayEvents > 0;
  }

  /**
   * Verifica se há eventos futuros
   */
  function hasFutureEvents() {
    return timelineStats.value?.futureEvents > 0;
  }

  /**
   * Obtém uma descrição textual do próximo evento
   */
  function getNextEventDescription() {
    const ne = nextEventRef.value;
    const dn = daysUntilNextEvent.value;
    if (!ne || dn == null) return null;

    if (dn === 0) {
      return `Hoje: ${ne.description}`;
    } else if (dn === 1) {
      return `Amanhã: ${ne.description}`;
    } else {
      return `Em ${dn} dias: ${ne.description}`;
    }
  }

  /**
   * Obtém status da timeline
   */
  function getTimelineStatus() {
    if (!currentGameDate.value) {
      return {
        status: "inactive",
        message: "Timeline não ativa",
      };
    }
    if (hasEventsToday()) {
      return {
        status: "events-today",
        message: `${timelineStats.value?.todayEvents ?? 0} evento(s) hoje`,
      };
    }

    if (hasFutureEvents()) {
      return {
        status: "events-scheduled",
        message: getNextEventDescription() || "Eventos agendados",
      };
    }

    return {
      status: "no-events",
      message: "Nenhum evento agendado",
    };
  }

  /**
   * Utilitários para trabalhar com contratos
   */
  const contractUtils = {
    /**
     * Agenda novos contratos conforme as regras
     */
    scheduleNewContracts(daysFromNow: number) {
      return scheduleEvent(
        "new_contracts" as ScheduledEventType,
        daysFromNow,
        "Novos contratos disponíveis",
        { source: "contract_generation" }
      );
    },

    /**
     * Agenda expiração de contrato
     */
    scheduleContractExpiration(contractId: string, daysFromNow: number) {
      return scheduleEvent(
        "contract_expiration" as ScheduledEventType,
        daysFromNow,
        `Contrato ${contractId} expira`,
        { contractId, source: "contract_deadline" }
      );
    },

    /**
     * Agenda resolução automática de contrato
     */
    scheduleContractResolution(contractId: string, daysFromNow: number) {
      return scheduleEvent(
        "contract_resolution" as ScheduledEventType,
        daysFromNow,
        `Contrato ${contractId} será resolvido automaticamente`,
        { contractId, source: "automatic_resolution" }
      );
    },
  };

  // Utilidades avançadas para IndexedDB
  const advancedQueries = {
    /**
     * Busca eventos por data específica
     */
    async getEventsByDate(guildId: string, date: GameDate) {
      return timelineStore.getEventsByDate(guildId, date);
    },

    /**
     * Busca eventos por tipo em uma guilda específica
     */
    async getEventsByTypeAndGuild(guildId: string, type: ScheduledEventType) {
      return timelineStore.getEventsByTypeAndGuild(guildId, type);
    },

    /**
     * Busca eventos pendentes para uma guilda
     */
    async getPendingEvents(guildId: string) {
      return timelineStore.getPendingEvents(guildId);
    },

    /**
     * Limpa histórico antigo
     */
    async cleanupOldHistory(guildId: string, daysToKeep = 90) {
      return timelineStore.cleanupOldHistory(guildId, daysToKeep);
    },
  };

  return {
    // Estado
    currentDate: currentGameDate,
    formattedDate: formattedCurrentDate,
    nextEvent: nextEventRef,
    daysUntilNext: daysUntilNextEvent,
    timelineStats: timelineStats,
    events: currentEvents,

    // Utilidades
    dateUtils,
    contractUtils,
    advancedQueries,

    // Ações principais
    passDay,
    setDate,
    setDateFromValues,
    passDays,
    passWeeks,
    passMonths,

    // Eventos
    scheduleEvent,
    scheduleEventForDate,
    scheduleEventForDateValues,
    removeEvent,
    getEventsByType,

    // Status e informações
    hasEventsToday,
    hasFutureEvents,
    getNextEventDescription,
    getTimelineStatus,

    // Acesso direto ao store
    store: timelineStore,
  };
}
