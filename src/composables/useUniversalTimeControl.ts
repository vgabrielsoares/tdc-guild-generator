import { computed, ref, readonly } from "vue";
import { useTimeline } from "@/composables/useTimeline";
import { useRouter } from "vue-router";
import type { TimeAdvanceResult, ScheduledEvent } from "@/types/timeline";
import { addDays } from "@/utils/date-utils";

/**
 * Composable para controle temporal universal integrado
 *
 * Facilita o uso do sistema de timeline universalmente, oferecendo:
 * - Funcionalidades migradas do sistema de contratos
 * - Interface unificada para qualquer módulo
 * - Navegação contextual entre módulos
 * - Gerenciamento de estado temporal global
 */
export function useUniversalTimeControl() {
  const timeline = useTimeline();
  const router = useRouter();

  // Estados globais da integração
  const isProcessing = ref(false);
  const lastActionResult = ref<{
    success: boolean;
    message: string;
    timestamp: Date;
    eventsProcessed?: number;
    details?: string[];
  } | null>(null);

  // Computed derivados do timeline base
  const isTimelineActive = computed(() => timeline.currentDate.value !== null);

  const timelineStatus = computed(() => {
    if (!isTimelineActive.value) {
      return {
        status: "inactive",
        message: "Timeline não inicializada",
        canAdvance: false,
      };
    }

    const eventsCount = upcomingEvents.value.length;
    if (eventsCount === 0) {
      return {
        status: "ready",
        message: "Pronto para avançar",
        canAdvance: true,
      };
    }

    return {
      status: "active",
      message: `${eventsCount} evento(s) agendado(s)`,
      canAdvance: true,
    };
  });

  const upcomingEvents = computed(() => {
    if (!timeline.currentDate.value || !timeline.events.value) return [];

    return timeline.events.value
      .filter((event) => {
        const eventDate = event.date;
        const current = timeline.currentDate.value!;

        return (
          eventDate.year > current.year ||
          (eventDate.year === current.year &&
            eventDate.month > current.month) ||
          (eventDate.year === current.year &&
            eventDate.month === current.month &&
            eventDate.day >= current.day)
        );
      })
      .sort((a, b) => {
        const dateA = a.date;
        const dateB = b.date;

        if (dateA.year !== dateB.year) return dateA.year - dateB.year;
        if (dateA.month !== dateB.month) return dateA.month - dateB.month;
        return dateA.day - dateB.day;
      });
  });

  const nextEvent = computed(() => upcomingEvents.value[0] || null);

  const eventsToday = computed(() => {
    if (!timeline.currentDate.value) return [];

    const current = timeline.currentDate.value;

    return timeline.events.value.filter((event) => {
      const eventDate = event.date;
      return (
        eventDate.year === current.year &&
        eventDate.month === current.month &&
        eventDate.day === current.day
      );
    });
  });

  // Funcionalidades migradas e centralizadas

  /**
   * Inicializa a timeline se necessário
   */
  function ensureTimelineInitialized(): boolean {
    if (!isTimelineActive.value) {
      timeline.setDateFromValues(1, 1, 1);
      setActionResult({
        success: true,
        message: "Timeline inicializada em 1º de Janeiro, Ano 1",
      });
      return true;
    }
    return false;
  }

  /**
   * Passa um dia com processamento completo e feedback
   */
  async function advanceOneDay(
    options: {
      skipConfirmation?: boolean;
      returnRoute?: string;
      context?: string;
    } = {}
  ): Promise<TimeAdvanceResult | null> {
    if (!isTimelineActive.value) {
      ensureTimelineInitialized();
      return null;
    }

    try {
      isProcessing.value = true;

      const result = timeline.passDay();

      if (result) {
        const eventsCount = result.triggeredEvents?.length || 0;
        const details: string[] = [];

        if (eventsCount > 0) {
          details.push(`${eventsCount} eventos processados automaticamente`);
          result.triggeredEvents.forEach((event) => {
            details.push(`• ${event.description}`);
          });
        }

        setActionResult({
          success: true,
          message: `Dia avançado para ${timeline.formattedDate.value}`,
          eventsProcessed: eventsCount,
          details: details.length > 0 ? details : undefined,
        });

        // Navegar se especificado
        if (options.returnRoute) {
          await router.push(options.returnRoute);
        }

        return result;
      } else {
        throw new Error("Falha ao avançar o tempo");
      }
    } catch (error) {
      setActionResult({
        success: false,
        message: "Erro ao avançar tempo: " + (error as Error).message,
      });
      return null;
    } finally {
      isProcessing.value = false;
    }
  }

  /**
   * Avança múltiplos dias
   */
  async function advanceMultipleDays(
    days: number,
    options: {
      skipConfirmation?: boolean;
      returnRoute?: string;
      context?: string;
    } = {}
  ): Promise<TimeAdvanceResult | null> {
    if (!isTimelineActive.value) {
      ensureTimelineInitialized();
      return null;
    }

    try {
      isProcessing.value = true;

      const result = timeline.passDays(days);

      if (result) {
        setActionResult({
          success: true,
          message: `${days} dias avançados para ${timeline.formattedDate.value}`,
        });

        if (options.returnRoute) {
          await router.push(options.returnRoute);
        }

        return result;
      } else {
        throw new Error("Falha ao avançar múltiplos dias");
      }
    } catch (error) {
      setActionResult({
        success: false,
        message: "Erro ao avançar múltiplos dias: " + (error as Error).message,
      });
      return null;
    } finally {
      isProcessing.value = false;
    }
  }

  /**
   * Avança semanas
   */
  async function advanceWeeks(
    weeks: number,
    options: {
      returnRoute?: string;
      context?: string;
    } = {}
  ): Promise<TimeAdvanceResult | null> {
    return await advanceMultipleDays(weeks * 7, options);
  }

  /**
   * Avança meses
   */
  async function advanceMonths(
    months: number,
    options: {
      returnRoute?: string;
      context?: string;
    } = {}
  ): Promise<TimeAdvanceResult | null> {
    if (!isTimelineActive.value) {
      ensureTimelineInitialized();
      return null;
    }

    try {
      isProcessing.value = true;

      const result = timeline.passMonths(months);

      if (result) {
        setActionResult({
          success: true,
          message: `${months} mês(es) avançado(s) para ${timeline.formattedDate.value}`,
        });

        if (options.returnRoute) {
          await router.push(options.returnRoute);
        }

        return result;
      } else {
        throw new Error("Falha ao avançar meses");
      }
    } catch (error) {
      setActionResult({
        success: false,
        message: "Erro ao avançar meses: " + (error as Error).message,
      });
      return null;
    } finally {
      isProcessing.value = false;
    }
  }

  /**
   * Navega para o dashboard unificado de timeline
   */
  async function navigateToTimeline(filter?: string): Promise<void> {
    const route = filter
      ? `/timeline?filter=${encodeURIComponent(filter)}`
      : "/timeline";

    await router.push(route);
  }

  /**
   * Navega de volta para um módulo específico
   */
  async function navigateToModule(moduleName: string): Promise<void> {
    const moduleRoutes: Record<string, string> = {
      contracts: "/contracts",
      services: "/services",
      notices: "/notices",
      members: "/members",
      renown: "/renown",
      guild: "/guild",
    };

    const route = moduleRoutes[moduleName] || "/";
    await router.push(route);
  }

  /**
   * Define resultado da última ação
   */
  function setActionResult(result: {
    success: boolean;
    message: string;
    eventsProcessed?: number;
    details?: string[];
  }): void {
    const resultWithTimestamp = {
      ...result,
      timestamp: new Date(),
    };

    lastActionResult.value = resultWithTimestamp;

    // Limpar após 5 segundos
    setTimeout(() => {
      if (lastActionResult.value?.timestamp === resultWithTimestamp.timestamp) {
        lastActionResult.value = null;
      }
    }, 5000);
  }

  /**
   * Limpa resultado da última ação
   */
  function clearActionResult(): void {
    lastActionResult.value = null;
  }

  /**
   * Obtém eventos que serão processados em um avanço específico
   */
  function getEventsForAdvance(days: number): ScheduledEvent[] {
    if (!timeline.currentDate.value) return [];

    const current = timeline.currentDate.value;
    const target = addDays(current, days);

    return timeline.events.value.filter((event) => {
      const eventDate = event.date;

      // Evento está entre current (exclusivo) e target (inclusivo)
      const afterCurrent =
        eventDate.year > current.year ||
        (eventDate.year === current.year && eventDate.month > current.month) ||
        (eventDate.year === current.year &&
          eventDate.month === current.month &&
          eventDate.day > current.day);

      const beforeOrEqualTarget =
        eventDate.year < target.year ||
        (eventDate.year === target.year && eventDate.month < target.month) ||
        (eventDate.year === target.year &&
          eventDate.month === target.month &&
          eventDate.day <= target.day);

      return afterCurrent && beforeOrEqualTarget;
    });
  }

  /**
   * Formata contadores para exibição
   */
  function formatTimeCounter(days: number | null): string {
    if (days === null) return "N/A";
    if (days === 0) return "Hoje";
    if (days === 1) return "Amanhã";
    return `Em ${days} dias`;
  }

  /**
   * Obtém estatísticas da timeline
   */
  const timelineStats = computed(() => {
    return {
      totalEvents: timeline.events.value.length,
      upcomingEvents: upcomingEvents.value.length,
      eventsToday: eventsToday.value.length,
      isActive: isTimelineActive.value,
      currentDate: timeline.currentDate.value,
      formattedDate: timeline.formattedDate.value,
    };
  });

  return {
    // Estado base do timeline
    ...timeline,

    // Estados da integração
    isProcessing: readonly(isProcessing),
    lastActionResult: readonly(lastActionResult),
    isTimelineActive,
    timelineStatus,
    timelineStats,

    // Eventos computados
    upcomingEvents,
    nextEvent,
    eventsToday,

    // Ações centralizadas
    ensureTimelineInitialized,
    advanceOneDay,
    advanceMultipleDays,
    advanceWeeks,
    advanceMonths,

    // Navegação
    navigateToTimeline,
    navigateToModule,

    // Utilitários
    setActionResult,
    clearActionResult,
    getEventsForAdvance,
    formatTimeCounter,
  };
}
