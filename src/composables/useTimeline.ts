import { computed } from 'vue';
import { useTimelineStore } from '@/stores/timeline';
import type { GameDate, ScheduledEventType } from '@/types/timeline';
import { 
  addDays, 
  addWeeks, 
  addMonths,
  formatGameDate,
  formatShortGameDate,
  getDaysDifference,
  createGameDate
} from '@/utils/date-utils';

/**
 * Composable para facilitar o uso do sistema de timeline
 * Fornece uma interface simplificada para operações comuns
 */
export function useTimeline() {
  const timelineStore = useTimelineStore();

  // Estado reativo
  const currentDate = computed(() => timelineStore.currentGameDate);
  const formattedDate = computed(() => timelineStore.formattedCurrentDate);
  const nextEvent = computed(() => timelineStore.nextEvent);
  const daysUntilNext = computed(() => timelineStore.daysUntilNextEvent);
  const timelineStats = computed(() => timelineStore.timelineStats);
  const events = computed(() => timelineStore.currentEvents);

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
    if (!currentDate.value) return null;
    const newDate = addDays(currentDate.value, days);
    return timelineStore.setCustomDate(newDate);
  }

  /**
   * Avança semanas
   */
  function passWeeks(weeks: number) {
    if (!currentDate.value) return null;
    const newDate = addWeeks(currentDate.value, weeks);
    return timelineStore.setCustomDate(newDate);
  }

  /**
   * Avança meses
   */
  function passMonths(months: number) {
    if (!currentDate.value) return null;
    const newDate = addMonths(currentDate.value, months);
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
    if (!currentDate.value) return null;
    const eventDate = addDays(currentDate.value, daysFromNow);
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
    return timelineStats.value.todayEvents > 0;
  }

  /**
   * Verifica se há eventos futuros
   */
  function hasFutureEvents() {
    return timelineStats.value.futureEvents > 0;
  }

  /**
   * Obtém uma descrição textual do próximo evento
   */
  function getNextEventDescription() {
    if (!nextEvent.value || !daysUntilNext.value) return null;
    
    if (daysUntilNext.value === 0) {
      return `Hoje: ${nextEvent.value.description}`;
    } else if (daysUntilNext.value === 1) {
      return `Amanhã: ${nextEvent.value.description}`;
    } else {
      return `Em ${daysUntilNext.value} dias: ${nextEvent.value.description}`;
    }
  }

  /**
   * Obtém status da timeline
   */
  function getTimelineStatus() {
    if (!currentDate.value) {
      return {
        status: 'inactive',
        message: 'Timeline não ativa',
      };
    }

    if (hasEventsToday()) {
      return {
        status: 'events-today',
        message: `${timelineStats.value.todayEvents} evento(s) hoje`,
      };
    }

    if (hasFutureEvents()) {
      return {
        status: 'events-scheduled',
        message: getNextEventDescription() || 'Eventos agendados',
      };
    }

    return {
      status: 'no-events',
      message: 'Nenhum evento agendado',
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
        'new_contracts' as ScheduledEventType,
        daysFromNow,
        'Novos contratos disponíveis',
        { source: 'contract_generation' }
      );
    },

    /**
     * Agenda expiração de contrato
     */
    scheduleContractExpiration(contractId: string, daysFromNow: number) {
      return scheduleEvent(
        'contract_expiration' as ScheduledEventType,
        daysFromNow,
        `Contrato ${contractId} expira`,
        { contractId, source: 'contract_deadline' }
      );
    },

    /**
     * Agenda resolução automática de contrato
     */
    scheduleContractResolution(contractId: string, daysFromNow: number) {
      return scheduleEvent(
        'contract_resolution' as ScheduledEventType,
        daysFromNow,
        `Contrato ${contractId} será resolvido automaticamente`,
        { contractId, source: 'automatic_resolution' }
      );
    },
  };

  return {
    // Estado
    currentDate,
    formattedDate,
    nextEvent,
    daysUntilNext,
    timelineStats,
    events,

    // Utilidades
    dateUtils,
    contractUtils,

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
