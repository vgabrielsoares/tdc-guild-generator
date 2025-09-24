import { defineStore } from "pinia";
import { ref, computed, watch, readonly } from "vue";
import type { Notice, WantedPoster } from "@/types/notice";
import { NoticeType, NoticeStatus } from "@/types/notice";
import { SettlementType, type Guild } from "@/types/guild";
import type { GameDate, TimeAdvanceResult } from "@/types/timeline";
import { ScheduledEventType, type ScheduledEvent } from "@/types/timeline";
import {
  NoticeGenerator,
  type NoticeGenerationConfig,
} from "@/utils/generators/noticeGenerator";
import {
  rollNoticeExpiration,
  calculateNextRenewalDate,
} from "@/utils/generators/noticeLifeCycle";
import { useGuildStore } from "./guild";
import { useTimelineStore } from "./timeline";
import { useNoticesStorage } from "@/composables/useNoticesStorage";
import { useToast } from "@/composables/useToast";
import {
  processModuleTimeAdvance,
  type TimelineModuleConfig,
} from "@/utils/timeline-store-integration";
import { addDays } from "@/utils/date-utils";

export const useNoticesStore = defineStore("notices", () => {
  // Dependências
  const guildStore = useGuildStore();
  const timelineStore = useTimelineStore();
  const { success, info, warning } = useToast();

  // Estado dos avisos atuais (da guilda selecionada)
  const notices = ref<Notice[]>([]);
  const isLoading = ref(false);
  const isReady = ref(false);
  const lastUpdate = ref<Date | null>(null);
  const generationError = ref<string | null>(null);
  const currentGuildId = ref<string | null>(null);

  // Filtros
  const filters = ref({
    type: null as NoticeType | null,
    status: null as NoticeStatus | null,
    searchText: "",
    showExpired: false,
    species: null as string | null,
    dangerLevel: null as string | null,
    guildId: null as string | null,
  });

  // Configuração do módulo para integração com timeline
  const moduleConfig: TimelineModuleConfig = {
    moduleType: "notices",
    guildIdGetter: () => currentGuildId.value || undefined,
    timelineStore,
  };

  // Persistência segregada por guilda
  const storage = useNoticesStorage();

  // ===== COMPUTED =====

  const currentGuild = computed(() => guildStore.currentGuild);

  const activeNotices = computed(() =>
    notices.value.filter((notice) => notice.status === NoticeStatus.ACTIVE)
  );

  const expiredNotices = computed(() =>
    notices.value.filter((notice) => notice.status === NoticeStatus.EXPIRED)
  );

  const noticesByType = computed(() => {
    const grouped: Record<string, Notice[]> = {};
    notices.value.forEach((notice) => {
      const typeKey = notice.type.toString();
      if (!grouped[typeKey]) {
        grouped[typeKey] = [];
      }
      grouped[typeKey].push(notice);
    });
    return grouped;
  });

  const filteredNotices = computed(() => {
    let filtered = notices.value;

    // Filtro por tipo
    if (filters.value.type) {
      filtered = filtered.filter(
        (notice) => notice.type === filters.value.type
      );
    }

    // Filtro por status
    if (filters.value.status) {
      filtered = filtered.filter(
        (notice) => notice.status === filters.value.status
      );
    }

    // Filtro por expirados
    if (!filters.value.showExpired) {
      filtered = filtered.filter(
        (notice) => notice.status !== NoticeStatus.EXPIRED
      );
    }

    // Filtro por espécie mencionada
    if (filters.value.species) {
      filtered = filtered.filter((notice) => {
        // Verificar espécies mencionadas (array de SpeciesWithSubrace)
        return notice.mentionedSpecies?.some((speciesWithSubrace) =>
          speciesWithSubrace.species
            .toLowerCase()
            .includes(filters.value.species!.toLowerCase())
        );
      });
    }

    // Filtro por nível de periculosidade
    if (filters.value.dangerLevel) {
      filtered = filtered.filter((notice) => {
        // Aplicar apenas para cartazes de procurado com condenados fugitivos
        if (notice.type === NoticeType.WANTED_POSTER && notice.content) {
          const content = notice.content as WantedPoster;
          if (
            content.type === "fugitive_convict" &&
            "dangerLevel" in content.details
          ) {
            return content.details.dangerLevel === filters.value.dangerLevel;
          }
        }
        return false;
      });
    }

    // Filtro por guilda específica
    if (filters.value.guildId) {
      filtered = filtered.filter(
        (notice) => notice.guildId === filters.value.guildId
      );
    }

    // Filtro por texto de busca
    if (filters.value.searchText) {
      const searchLower = filters.value.searchText.toLowerCase();
      filtered = filtered.filter((notice) => {
        const content = notice.content;
        if (!content) return false;

        return (
          content.toString().toLowerCase().includes(searchLower) ||
          notice.type.toString().toLowerCase().includes(searchLower) ||
          // Buscar também em espécies mencionadas
          notice.mentionedSpecies?.some(
            (species) =>
              species.species.toLowerCase().includes(searchLower) ||
              species.subrace?.toLowerCase().includes(searchLower)
          )
        );
      });
    }

    return filtered;
  });

  // Computed helpers para filtros avançados
  const mentionedSpecies = computed(() => {
    const speciesSet = new Set<string>();
    notices.value.forEach((notice) => {
      notice.mentionedSpecies?.forEach((species) => {
        speciesSet.add(species.species);
      });
    });
    return Array.from(speciesSet).sort();
  });

  const availableDangerLevels = computed(() => {
    const dangerLevels = new Set<string>();
    notices.value.forEach((notice) => {
      if (notice.type === NoticeType.WANTED_POSTER && notice.content) {
        const content = notice.content as WantedPoster;
        if (
          content.type === "fugitive_convict" &&
          "dangerLevel" in content.details
        ) {
          dangerLevels.add(content.details.dangerLevel);
        }
      }
    });
    return Array.from(dangerLevels).sort();
  });

  const noticesCounters = computed(() => {
    const counters = {
      total: notices.value.length,
      active: activeNotices.value.length,
      expired: expiredNotices.value.length,
      byType: {} as Record<NoticeType, number>,
      withSpecies: notices.value.filter(
        (n) => n.mentionedSpecies && n.mentionedSpecies.length > 0
      ).length,
      dangerous: notices.value.filter((notice) => {
        if (notice.type === NoticeType.WANTED_POSTER && notice.content) {
          const content = notice.content as WantedPoster;
          if (
            content.type === "fugitive_convict" &&
            "dangerLevel" in content.details
          ) {
            return ["critical", "mortal_danger", "extremely_high"].includes(
              content.details.dangerLevel
            );
          }
        }
        return false;
      }).length,
    };

    // Contar por tipo
    Object.values(NoticeType).forEach((type) => {
      counters.byType[type] = notices.value.filter(
        (n) => n.type === type
      ).length;
    });

    return counters;
  });

  // ===== PERSISTÊNCIA =====

  const saveToStorage = () => {
    if (currentGuildId.value) {
      storage.updateNoticesForGuild(currentGuildId.value, notices.value);
    }
  };

  const loadFromStorage = () => {
    if (currentGuildId.value) {
      const stored = storage.getNoticesForGuild(currentGuildId.value);
      notices.value = stored;
      lastUpdate.value = new Date();
    }
  };

  // ===== COMPUTED ADICIONAL =====

  // Estados derivados úteis para UI
  const hasNotices = computed(() => notices.value.length > 0);
  const hasActiveNotices = computed(() => activeNotices.value.length > 0);
  const hasExpiredNotices = computed(() => expiredNotices.value.length > 0);
  const isEmptyState = computed(() => !hasNotices.value && !isLoading.value);

  // ===== AÇÕES PRINCIPAIS =====

  /**
   * Gera avisos iniciais para uma nova guilda ou renovação
   */
  const generateNotices = async (
    guild?: Guild,
    settlementType?: SettlementType,
    isRenewal = false
  ) => {
    isLoading.value = true;
    generationError.value = null;

    try {
      const targetGuild = guild || currentGuild.value;
      const targetSettlement = settlementType || targetGuild?.settlementType;

      if (!targetGuild || !targetSettlement) {
        throw new Error("Guild or settlement type not available");
      }

      currentGuildId.value = targetGuild.id;

      // Para renovação, limpar avisos expirados antes
      if (isRenewal) {
        removeExpiredNotices();
      }

      const generator = new NoticeGenerator();
      const config: NoticeGenerationConfig = {
        guild: targetGuild,
        settlementType: targetSettlement,
        // TODO: Adicionar integração com contracts e services store quando necessário
      };

      const newNotices = await generator.generate(config);

      if (isRenewal) {
        // Para renovação, adicionar aos avisos existentes
        notices.value.push(...newNotices);
      } else {
        // Para geração inicial, substituir todos
        notices.value = newNotices;
      }

      // Agendar eventos de expiração para os novos avisos
      scheduleNoticeExpirations(newNotices);

      // Agendar próxima renovação se esta não for uma renovação
      if (!isRenewal) {
        scheduleNextRenewal();
      }

      lastUpdate.value = new Date();
      saveToStorage();

      success(
        `${newNotices.length} aviso(s) ${isRenewal ? "adicionado(s)" : "gerado(s)"} com sucesso!`
      );

      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log(
          `[NOTICES STORE] Generated ${newNotices.length} notices for guild ${targetGuild.id}`
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      generationError.value = errorMessage;
      warning(`Erro ao gerar avisos: ${errorMessage}`);

      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("[NOTICES STORE] Generation error:", error);
      }
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Verifica se um aviso deve expirar baseado na data atual
   */
  const shouldNoticeExpire = (
    notice: Notice,
    currentDate: GameDate
  ): boolean => {
    // Verificar se tem data de expiração
    if (!notice.expirationDate) {
      return false;
    }

    // Converter GameDate para Date para comparação
    const currentDateJS = new Date(
      currentDate.year,
      currentDate.month - 1,
      currentDate.day
    );

    // Verificar se a data de expiração/execução chegou ou passou
    return notice.expirationDate <= currentDateJS;
  };

  /**
   * Remove avisos expirados com base na data atual do timeline
   */
  const removeExpiredNotices = () => {
    const currentDate = timelineStore.currentGameDate;
    if (!currentDate) return;

    const beforeCount = notices.value.length;
    notices.value = notices.value.filter((notice) => {
      if (notice.status === NoticeStatus.EXPIRED) return false;

      // Verificar se deve expirar agora
      const shouldExpire = shouldNoticeExpire(notice, currentDate);
      if (shouldExpire) {
        notice.status = NoticeStatus.EXPIRED;
        notice.updatedAt = new Date();
        return false; // Remove da lista ativa
      }

      return true;
    });

    const expiredCount = beforeCount - notices.value.length;
    if (expiredCount > 0) {
      info(`${expiredCount} aviso(s) expirado(s) removido(s)`);
      saveToStorage();
    }
  };

  // ===== INTEGRAÇÃO COM TIMELINE =====

  /**
   * Agenda eventos de expiração para avisos específicos
   */
  const scheduleNoticeExpirations = (noticesToSchedule: Notice[]) => {
    const currentDate = timelineStore.currentGameDate;
    if (!currentGuildId.value || !currentDate) return;

    noticesToSchedule.forEach((notice) => {
      const expirationResult = rollNoticeExpiration(notice.type);

      // Todos os avisos (incluindo execuções) seguem fluxo normal de agendamento
      const expirationDate = addDays(currentDate, expirationResult.days);

      // Converter GameDate para Date para armazenar no Notice
      const expirationDateJS = new Date(
        expirationDate.year,
        expirationDate.month - 1,
        expirationDate.day
      );
      notice.expirationDate = expirationDateJS;

      // Agendar evento de expiração (ou execução para avisos de execução)
      const eventDescription = expirationResult.isExecutionDay
        ? `Execução programada: ${notice.type}`
        : `Aviso ${notice.type} expira`;

      timelineStore.scheduleEvent(
        ScheduledEventType.NOTICE_EXPIRATION,
        expirationDate,
        eventDescription,
        {
          guildId: currentGuildId.value,
          noticeId: notice.id,
          noticeType: notice.type,
          isExecutionDay: expirationResult.isExecutionDay,
        }
      );
    });
  };

  /**
   * Agenda próxima renovação do mural
   */
  const scheduleNextRenewal = () => {
    const currentDate = timelineStore.currentGameDate;
    if (!currentDate || !currentGuildId.value) return;

    const renewalDate = calculateNextRenewalDate(currentDate);

    timelineStore.scheduleEvent(
      ScheduledEventType.NEW_NOTICES,
      renewalDate,
      "Renovação do mural de avisos",
      {
        guildId: currentGuildId.value,
        source: "renewal",
      }
    );
  };

  /**
   * Processa eventos de timeline para avisos
   */
  const processTimelineEvents = (events: ScheduledEvent[]) => {
    events.forEach((event) => {
      if (event.data?.guildId !== currentGuildId.value) return;

      switch (event.type) {
        case ScheduledEventType.NEW_NOTICES:
          handleNewNoticesEvent();
          break;
        case ScheduledEventType.NOTICE_EXPIRATION:
          handleNoticeExpirationEvent(event);
          break;
      }
    });
  };

  /**
   * Processa evento de novos avisos (renovação)
   */
  const handleNewNoticesEvent = async () => {
    if (!currentGuild.value) return;

    try {
      await generateNotices(
        currentGuild.value,
        currentGuild.value.settlementType,
        true
      );

      // Agendar próxima renovação
      scheduleNextRenewal();

      info("Mural de avisos renovado automaticamente!");
    } catch (error) {
      warning("Erro na renovação automática do mural");

      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.error("[NOTICES STORE] Auto renewal error:", error);
      }
    }
  };

  /**
   * Processa evento de expiração de aviso
   */
  const handleNoticeExpirationEvent = (event: ScheduledEvent) => {
    const noticeId = event.data?.noticeId as string;
    if (!noticeId) return;

    const noticeIndex = notices.value.findIndex((n) => n.id === noticeId);
    if (noticeIndex >= 0) {
      const notice = notices.value[noticeIndex];

      // Marcar como expirada (para todos os tipos, incluindo execuções)
      notice.status = NoticeStatus.EXPIRED;
      notice.updatedAt = new Date();

      if (import.meta.env.DEV) {
        const actionType =
          notice.type === NoticeType.EXECUTION ? "completed" : "expired";
        // eslint-disable-next-line no-console
        console.log(`[NOTICES STORE] Notice ${noticeId} ${actionType}`);
      }

      saveToStorage();
    }
  };

  /**
   * Processa avanço de tempo do timeline
   */
  const processTimeAdvance = (result: TimeAdvanceResult) => {
    const eventHandlers = [
      {
        eventType: ScheduledEventType.NEW_NOTICES,
        handler: () => handleNewNoticesEvent(),
      },
      {
        eventType: ScheduledEventType.NOTICE_EXPIRATION,
        handler: (event: ScheduledEvent) => handleNoticeExpirationEvent(event),
      },
    ];

    processModuleTimeAdvance(
      moduleConfig,
      result,
      eventHandlers,
      scheduleNextRenewal
    );

    // Verificar e remover avisos expirados após avanço do tempo
    removeExpiredNotices();
  };

  // ===== AÇÕES DE GERENCIAMENTO =====

  /**
   * Renova um aviso específico, estendendo sua expiração
   */
  const renewNotice = (noticeId: string) => {
    const notice = notices.value.find((n) => n.id === noticeId);
    if (!notice) {
      warning("Aviso não encontrado para renovação");
      return;
    }

    // Verificar se o aviso pode ser renovado (não expirado)
    if (notice.status === NoticeStatus.EXPIRED) {
      warning("Não é possível renovar avisos expirados");
      return;
    }

    const currentDate = timelineStore.currentGameDate;
    if (!currentDate) {
      warning("Data atual não disponível para renovação");
      return;
    }

    // Calcular nova data de expiração
    const expirationResult = rollNoticeExpiration(notice.type);
    const newExpirationDate = addDays(currentDate, expirationResult.days);

    // Converter GameDate para Date
    const newExpirationDateJS = new Date(
      newExpirationDate.year,
      newExpirationDate.month - 1,
      newExpirationDate.day
    );

    // Atualizar o aviso
    notice.expirationDate = newExpirationDateJS;
    notice.updatedAt = new Date();
    notice.status = NoticeStatus.ACTIVE;

    // Reagendar evento de expiração
    timelineStore.scheduleEvent(
      ScheduledEventType.NOTICE_EXPIRATION,
      newExpirationDate,
      expirationResult.isExecutionDay
        ? `Execução programada: ${notice.type}`
        : `Aviso ${notice.type} expira`,
      {
        guildId: currentGuildId.value,
        noticeId: notice.id,
        noticeType: notice.type,
        isExecutionDay: expirationResult.isExecutionDay,
      }
    );

    saveToStorage();
    success("Aviso renovado com sucesso!");

    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(
        `[NOTICES STORE] Notice ${noticeId} renewed until ${newExpirationDateJS.toDateString()}`
      );
    }
  };

  const removeNotice = (noticeId: string) => {
    const index = notices.value.findIndex((n) => n.id === noticeId);
    if (index >= 0) {
      notices.value.splice(index, 1);
      saveToStorage();
      info("Aviso removido com sucesso");
    }
  };

  const clearNotices = () => {
    notices.value = [];
    generationError.value = null;
    lastUpdate.value = null;
    saveToStorage();
    info("Todos os avisos foram removidos");
  };

  const clearNoticesForNewGuild = () => {
    notices.value = [];
    generationError.value = null;
    lastUpdate.value = null;
    currentGuildId.value = null;
    isReady.value = false;
  };

  // ===== AÇÕES AUXILIARES =====

  /**
   * Busca um aviso específico por ID
   */
  const getNoticeById = (noticeId: string): Notice | undefined => {
    return notices.value.find((notice) => notice.id === noticeId);
  };

  /**
   * Busca avisos por tipo específico
   */
  const getNoticesByType = (type: NoticeType): Notice[] => {
    return notices.value.filter((notice) => notice.type === type);
  };

  /**
   * Busca avisos que expiram em uma data específica
   */
  const getNoticesExpiringOn = (date: GameDate): Notice[] => {
    const targetDate = new Date(date.year, date.month - 1, date.day);
    return notices.value.filter((notice) => {
      if (!notice.expirationDate) return false;
      const expDate = notice.expirationDate;
      return (
        expDate.getFullYear() === targetDate.getFullYear() &&
        expDate.getMonth() === targetDate.getMonth() &&
        expDate.getDate() === targetDate.getDate()
      );
    });
  };

  /**
   * Força atualização do storage (útil para debugging)
   */
  const forceSaveToStorage = () => {
    saveToStorage();
    info("Dados salvos manualmente");
  };

  // ===== FILTROS =====

  const setTypeFilter = (type: NoticeType | null) => {
    filters.value.type = type;
  };

  const setStatusFilter = (status: NoticeStatus | null) => {
    filters.value.status = status;
  };

  const setSearchFilter = (text: string) => {
    filters.value.searchText = text;
  };

  const setSpeciesFilter = (species: string | null) => {
    filters.value.species = species;
  };

  const setDangerLevelFilter = (dangerLevel: string | null) => {
    filters.value.dangerLevel = dangerLevel;
  };

  const setGuildIdFilter = (guildId: string | null) => {
    filters.value.guildId = guildId;
  };

  const toggleExpiredFilter = () => {
    filters.value.showExpired = !filters.value.showExpired;
  };

  const clearFilters = () => {
    filters.value = {
      type: null,
      status: null,
      searchText: "",
      showExpired: false,
      species: null,
      dangerLevel: null,
      guildId: null,
    };
  };

  // ===== WATCHERS =====

  // Carregar dados quando a guilda atual mudar
  watch(
    () => guildStore.currentGuild?.id,
    (newGuildId) => {
      if (newGuildId && newGuildId !== currentGuildId.value) {
        currentGuildId.value = newGuildId;
        loadFromStorage();
        isReady.value = true;
      } else if (!newGuildId) {
        clearNoticesForNewGuild();
      }
    },
    { immediate: true }
  );

  return {
    // ===== STATE =====
    notices: readonly(notices),
    isLoading: readonly(isLoading),
    isReady: readonly(isReady),
    lastUpdate: readonly(lastUpdate),
    generationError: readonly(generationError),
    currentGuildId: readonly(currentGuildId),
    filters: readonly(filters),

    // ===== COMPUTED =====
    currentGuild,
    activeNotices,
    expiredNotices,
    noticesByType,
    filteredNotices,
    mentionedSpecies,
    availableDangerLevels,
    noticesCounters,
    hasNotices,
    hasActiveNotices,
    hasExpiredNotices,
    isEmptyState,

    // ===== ACTIONS - Principais =====
    generateNotices,
    removeExpiredNotices,

    // ===== ACTIONS - Gerenciamento =====
    renewNotice,
    removeNotice,
    clearNotices,
    clearNoticesForNewGuild,

    // ===== ACTIONS - Auxiliares =====
    getNoticeById,
    getNoticesByType,
    getNoticesExpiringOn,
    forceSaveToStorage,

    // ===== ACTIONS - Filtros =====
    setTypeFilter,
    setStatusFilter,
    setSearchFilter,
    setSpeciesFilter,
    setDangerLevelFilter,
    setGuildIdFilter,
    toggleExpiredFilter,
    clearFilters,

    // ===== INTEGRAÇÃO COM TIMELINE =====
    scheduleNoticeExpirations,
    scheduleNextRenewal,
    processTimelineEvents,
    processTimeAdvance,
  };
});
