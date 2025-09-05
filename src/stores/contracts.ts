// Contracts Store
import { defineStore } from "pinia";
import { ref, computed, readonly, watch } from "vue";
import type { Contract } from "@/types/contract";
import {
  ContractStatus,
  ContractDifficulty,
  ContractorType,
  DeadlineType,
  calculateBreachPenalty,
  type GuildContracts,
  createEmptyGuildContracts,
  canGuildGenerateContracts,
} from "@/types/contract";
import {
  ContractLifecycleManager,
  type ContractLifecycleState,
  markExpiredContracts,
  processContractDeadlines,
  applySignedContractResolution,
  applyUnsignedContractResolution,
} from "@/utils/generators/contractLifeCycle";
import {
  ContractGenerator,
  type ContractGenerationConfig,
} from "@/utils/generators/contractGenerator";
import { CONTRACT_DIFFICULTY_TABLE } from "@/data/tables/contract-base-tables";
import { useGuildStore } from "./guild";
import { useContractsStorage } from "@/composables/useContractsStorage";
import { useTimelineStore } from "./timeline";
import { useToast } from "@/composables/useToast";
import {
  ScheduledEventType,
  type ScheduledEvent,
  type TimeAdvanceResult,
} from "@/types/timeline";
import {
  rollNewContractsTime,
  rollSignedContractResolutionTime,
  rollUnsignedContractResolutionTime,
} from "@/utils/generators/contractLifeCycle";
import {
  addDays,
  createGameDate,
  isDateAfter,
  getDaysDifference,
} from "@/utils/date-utils";
import {
  scheduleModuleEvents,
  processModuleTimeAdvance,
  type TimelineModuleConfig,
  type ModuleEventConfig,
  type ModuleEventHandler,
} from "@/utils/timeline-store-integration";

export const useContractsStore = defineStore("contracts", () => {
  try {
    const env =
      (typeof process !== "undefined"
        ? (process as unknown as { env?: Record<string, string> }).env
        : undefined) || undefined;
    const isVitest =
      !!(env && env.VITEST === "true") ||
      typeof (globalThis as unknown as { __vitest?: unknown }).__vitest !==
        "undefined";
    if (isVitest) {
      // eslint-disable-next-line no-console
      console.log("[CONTRACTS_STORE] module loaded under Vitest");
    }
  } catch {
    // ignore
  }
  // Store dependencies
  const timelineStore = useTimelineStore();
  const { success, info, warning } = useToast();

  // Estado dos contratos atuais (da guilda selecionada)
  const contracts = ref<Contract[]>([]);
  const isLoading = ref(false);
  const isReady = ref(false);
  const lastUpdate = ref<Date | null>(null);
  const generationError = ref<string | null>(null);
  const currentGuildId = ref<string | null>(null);

  // Gerenciador de ciclo de vida
  const lifecycleManager = new ContractLifecycleManager();

  // Filtros
  const filters = ref({
    status: null as ContractStatus | null,
    difficulty: null as ContractDifficulty | null,
    contractor: null as ContractorType | null,
    searchText: "",
    minValue: null as number | null,
    maxValue: null as number | null,
    hasDeadline: null as boolean | null,
  });

  // Persistência segregada por guilda
  const storage = useContractsStorage();

  // ===== COMPUTED =====

  // Filtros de contratos por status
  const availableContracts = computed(() =>
    contracts.value.filter((c) => c.status === ContractStatus.DISPONIVEL)
  );

  const acceptedContracts = computed(() =>
    contracts.value.filter((c) => c.status === ContractStatus.ACEITO)
  );

  const inProgressContracts = computed(() =>
    contracts.value.filter((c) => c.status === ContractStatus.EM_ANDAMENTO)
  );

  const completedContracts = computed(() =>
    contracts.value.filter(
      (c) =>
        c.status === ContractStatus.CONCLUIDO ||
        c.status === ContractStatus.RESOLVIDO_POR_OUTROS
    )
  );

  const failedContracts = computed(() =>
    contracts.value.filter(
      (c) =>
        c.status === ContractStatus.FALHOU ||
        c.status === ContractStatus.QUEBRADO ||
        c.status === ContractStatus.ANULADO
    )
  );

  const expiredContracts = computed(() =>
    contracts.value.filter((c) => c.status === ContractStatus.EXPIRADO)
  );

  // Contratos filtrados baseado nos filtros ativos
  const filteredContracts = computed(() => {
    let result = contracts.value;

    // Filtro por status
    if (filters.value.status !== null) {
      result = result.filter((c) => c.status === filters.value.status);
    }

    // Filtro por dificuldade
    if (filters.value.difficulty !== null) {
      result = result.filter((c) => c.difficulty === filters.value.difficulty);
    }

    // Filtro por contratante
    if (filters.value.contractor !== null) {
      result = result.filter(
        (c) => c.contractorType === filters.value.contractor
      );
    }

    // Filtro por texto (busca em descrição, objetivo, localização)
    if (filters.value.searchText.trim()) {
      const searchLower = filters.value.searchText.toLowerCase();
      result = result.filter(
        (c) =>
          c.description.toLowerCase().includes(searchLower) ||
          c.title.toLowerCase().includes(searchLower) ||
          c.objective?.description?.toLowerCase().includes(searchLower) ||
          c.contractorName?.toLowerCase().includes(searchLower) ||
          c.location?.name?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por valor mínimo
    if (filters.value.minValue !== null) {
      result = result.filter(
        (c) => c.value.finalGoldReward >= filters.value.minValue!
      );
    }

    // Filtro por valor máximo
    if (filters.value.maxValue !== null) {
      result = result.filter(
        (c) => c.value.finalGoldReward <= filters.value.maxValue!
      );
    }

    // Filtro por existência de prazo
    if (filters.value.hasDeadline !== null) {
      const hasDeadline = filters.value.hasDeadline;
      result = result.filter((c) => {
        const contractHasDeadline = c.deadline.type !== DeadlineType.SEM_PRAZO;
        return contractHasDeadline === hasDeadline;
      });
    }

    return result;
  });

  // Estatísticas dos contratos
  const contractStats = computed(() => ({
    total: contracts.value.length,
    available: availableContracts.value.length,
    accepted: acceptedContracts.value.length,
    inProgress: contracts.value.filter(
      (c) =>
        c.status === ContractStatus.ACEITO ||
        c.status === ContractStatus.EM_ANDAMENTO ||
        c.status === ContractStatus.ACEITO_POR_OUTROS
    ).length,
    completed: completedContracts.value.length,
    failed: failedContracts.value.length,
    expired: expiredContracts.value.length,
  }));

  // Verificar se a guilda atual pode gerar contratos
  const canGenerateContracts = computed(() => {
    if (!currentGuildId.value) return false;

    const guildData = storage.data.value.guildContracts[currentGuildId.value];
    return !guildData || canGuildGenerateContracts(guildData);
  });

  // Informações do gerenciador de ciclo de vida
  const nextActions = computed(() => {
    const timelineStore = useTimelineStore();
    const currentGameDate = timelineStore.currentGameDate;

    // Se não há data do jogo, usar a data atual do sistema
    let gameDate: Date | undefined;
    if (currentGameDate) {
      gameDate = new Date(
        currentGameDate.year,
        currentGameDate.month - 1,
        currentGameDate.day
      );
    }

    return lifecycleManager.getNextActions(gameDate);
  });

  // ===== MÉTODOS AUXILIARES =====

  /**
   * Salva os contratos da guilda atual no storage
   */
  const saveToStorage = () => {
    if (!currentGuildId.value) return;

    const guildData: GuildContracts =
      storage.data.value.guildContracts[currentGuildId.value] ||
      createEmptyGuildContracts(currentGuildId.value);

    guildData.contracts = contracts.value;
    guildData.lastUpdate = lastUpdate.value;

    storage.data.value.guildContracts[currentGuildId.value] = guildData;
    storage.data.value.currentGuildId = currentGuildId.value;
    storage.data.value.globalLastUpdate = new Date();
  };

  // persist current guild's contracts to adapter and wait for completion
  const persistCurrentGuildToAdapter = async () => {
    if (!currentGuildId.value) return;
    try {
      await storage.persistGuildContracts(currentGuildId.value);
    } catch (e) {
      // silent
    }
  };

  /**
   * Carrega os contratos de uma guilda específica
   */
  const loadGuildContracts = (guildId: string) => {
    const guildData = storage.data.value.guildContracts[guildId];

    if (guildData) {
      contracts.value = guildData.contracts;
      lastUpdate.value = guildData.lastUpdate;
    } else {
      contracts.value = [];
      lastUpdate.value = null;
      // Criar entrada vazia para a guilda
      storage.data.value.guildContracts[guildId] =
        createEmptyGuildContracts(guildId);
    }

    currentGuildId.value = guildId;
    storage.data.value.currentGuildId = guildId;

    // Inicializar timeline para esta guilda
    timelineStore.setCurrentGuild(guildId);

    // Marca que o store já tinha sido reidratado ao menos uma vez
    isReady.value = true;
  };

  /**
   * Remove todos os contratos de uma guilda do storage
   */
  const cleanupGuildContracts = async (guildId: string) => {
    delete storage.data.value.guildContracts[guildId];

    // Remove persisted rows for this guild
    try {
      await storage.deleteGuildContracts(guildId);
    } catch {
      // ignore
    }

    // Se era a guilda atual, limpar o estado
    if (currentGuildId.value === guildId) {
      contracts.value = [];
      lastUpdate.value = null;
      currentGuildId.value = null;
      storage.data.value.currentGuildId = null;
    }
  };

  /**
   * Migra contratos do formato antigo se existirem
   */
  const migrateOldData = async () => {
    // Delegate legacy migration to composable which handles settings-based legacy key
    try {
      await storage.migrateLegacyIfNeeded();
    } catch {
      // silent
    }
  };

  /**
   * Sincroniza com a guilda atual do store de guild
   */
  const syncWithCurrentGuild = async () => {
    const guildStore = useGuildStore();
    const currentGuild = guildStore.currentGuild;

    if (currentGuild && currentGuild.id !== currentGuildId.value) {
      loadGuildContracts(currentGuild.id);
      await migrateOldData(); // Tentar migrar dados antigos se necessário
    } else if (!currentGuild && currentGuildId.value) {
      // Guilda foi desmarcada, limpar estado
      contracts.value = [];
      lastUpdate.value = null;
      currentGuildId.value = null;
      storage.data.value.currentGuildId = null;
    }
  };

  /**
   * Inicializa o gerenciador de ciclo de vida
   */
  const initializeLifecycle = () => {
    lifecycleManager.initializeResolutionTimes();
  };

  /**
   * Agenda eventos de timeline baseados no ciclo de vida dos contratos
   */
  const scheduleContractEvents = () => {
    if (!timelineStore.currentGameDate || !currentGuildId.value) {
      return;
    }

    // Configuração do módulo
    const moduleConfig: TimelineModuleConfig = {
      moduleType: "contracts",
      guildIdGetter: () => currentGuildId.value || undefined,
      timelineStore,
    };

    // Configuração dos eventos
    const eventConfigs: ModuleEventConfig[] = [
      {
        type: ScheduledEventType.NEW_CONTRACTS,
        source: "contract_generation",
        description: "Novos contratos disponíveis",
        rollTimeFunction: rollNewContractsTime,
        guildId: currentGuildId.value,
      },
      {
        type: ScheduledEventType.CONTRACT_RESOLUTION,
        source: "signed_resolution",
        description: "Resolução automática de contratos assinados",
        rollTimeFunction: rollSignedContractResolutionTime,
        guildId: currentGuildId.value,
        resolutionType: "signed",
      },
      {
        type: ScheduledEventType.CONTRACT_RESOLUTION,
        source: "unsigned_resolution",
        description: "Resolução automática de contratos não assinados",
        rollTimeFunction: rollUnsignedContractResolutionTime,
        guildId: currentGuildId.value,
        resolutionType: "unsigned",
      },
    ];

    scheduleModuleEvents(moduleConfig, eventConfigs);
  };

  /**
   * Processa resolução automática específica para contratos assinados
   * Baseado na tabela "Resoluções para Contratos Firmados"
   */
  const processSignedContractResolution = () => {
    const signedContracts = contracts.value.filter(
      (c) => c.status === ContractStatus.ACEITO_POR_OUTROS
    );

    if (signedContracts.length === 0) {
      return;
    }

    // Aplicar resolução específica para contratos assinados por outros aventureiros
    contracts.value = applySignedContractResolution(contracts.value);
    lastUpdate.value = new Date();
    saveToStorage();
  };

  /**
   * Processa resolução automática específica para contratos não assinados
   * Baseado na tabela "Resolução para Contratos que Não Foram Assinados"
   */
  const processUnsignedContractResolution = () => {
    // Aplicar resolução apenas aos contratos DISPONIVEL (não assinados)
    const unsignedContracts = contracts.value.filter(
      (c) => c.status === ContractStatus.DISPONIVEL
    );

    if (unsignedContracts.length === 0) {
      return;
    }

    // Aplicar resolução específica para contratos não assinados
    contracts.value = applyUnsignedContractResolution(contracts.value);
    lastUpdate.value = new Date();
    saveToStorage();
  };

  /**
   * Processa eventos de timeline relacionados a contratos
   */
  const processTimelineEvents = (triggeredEvents: ScheduledEvent[]) => {
    if (!currentGuildId.value) return;

    triggeredEvents.forEach((event) => {
      // Só processar eventos da guilda atual
      if (event.data?.guildId !== currentGuildId.value) return;

      switch (event.type) {
        case ScheduledEventType.NEW_CONTRACTS:
          // Gerar novos contratos automaticamente (ignora limitações manuais)
          generateContractsAutomatically();
          break;

        case ScheduledEventType.CONTRACT_RESOLUTION:
          // Processar resolução automática baseada no tipo
          if (event.data?.resolutionType === "signed") {
            processSignedContractResolution();
          } else if (event.data?.resolutionType === "unsigned") {
            processUnsignedContractResolution();
          } else {
            // Fallback: processar todos os contratos
            processContractLifecycle();
            info(
              "Resolução Processada",
              "Contratos foram resolvidos automaticamente"
            );
          }

          // Reagendar próximas resoluções após processar
          scheduleContractEvents();
          break;

        case ScheduledEventType.CONTRACT_EXPIRATION:
          // Processar expiração específica de contrato
          if (event.data && typeof event.data.contractId === "string") {
            const contract = contracts.value.find(
              (c) => c.id === event.data!.contractId
            );
            if (contract && contract.status === ContractStatus.DISPONIVEL) {
              updateContractStatus(contract.id, ContractStatus.EXPIRADO);
              info(
                "Contrato Expirado",
                `Contrato ${contract.objective?.description} expirou`
              );
            }
          }
          break;
      }
    });
  };

  /**
   * Integração com passagem de tempo do timeline
   */
  const processTimeAdvance = (result: TimeAdvanceResult) => {
    if (!result || !result.triggeredEvents) return;

    // Verificar contratos aceitos que passaram do prazo
    checkAndBreakOverdueContracts();

    // Configuração dos handlers para eventos de contratos
    const eventHandlers: ModuleEventHandler[] = [
      {
        eventType: ScheduledEventType.NEW_CONTRACTS,
        handler: () => generateContractsAutomatically(),
      },
      {
        eventType: ScheduledEventType.CONTRACT_RESOLUTION,
        handler: (event) => {
          if (event.data?.resolutionType === "signed") {
            processSignedContractResolution();
          } else if (event.data?.resolutionType === "unsigned") {
            processUnsignedContractResolution();
          }
        },
      },
    ];

    // Configuração do módulo
    const moduleConfig: TimelineModuleConfig = {
      moduleType: "contracts",
      guildIdGetter: () => currentGuildId.value || undefined,
      timelineStore,
    };

    // Processar eventos usando utilitário modular
    processModuleTimeAdvance(
      moduleConfig,
      result,
      eventHandlers,
      scheduleContractEvents
    );

    // Processar prazos baseado na data atual do jogo
    if (timelineStore.currentGameDate) {
      // Converter GameDate para Date para verificar prazos
      const currentJSDate = new Date(); // Para compatibilidade com sistema existente
      contracts.value = processContractDeadlines(
        contracts.value,
        currentJSDate
      );
      contracts.value = markExpiredContracts(contracts.value);
      saveToStorage();
    }
  };

  // ===== ACTIONS =====

  /**
   * Inicializa o store
   */
  const initializeStore = async () => {
    try {
      const env =
        (typeof process !== "undefined"
          ? (process as unknown as { env?: Record<string, string> }).env
          : undefined) || undefined;
      const isVitest =
        !!(env && env.VITEST === "true") ||
        typeof (globalThis as unknown as { __vitest?: unknown }).__vitest !==
          "undefined";
      const trace = (msg: string) => {
        if (isVitest) {
          // eslint-disable-next-line no-console
          console.log(`[CONTRACTS_INIT] ${msg}`);
        }
      };

      trace("starting initializeStore");

      // Garantir que os dados do storage foram carregados
      // Carregar explicitamente o storage para evitar condições de corrida
      // entre stores (guild/timeline/contracts)
      try {
        trace("before storage.load()");
        await storage.load();
        trace("after storage.load()");
      } catch (e) {
        trace(`storage.load() failed: ${String(e)}`);
      }

      // Attempt migration early
      try {
        trace("before storage.migrateLegacyIfNeeded()");
        await storage.migrateLegacyIfNeeded();
        trace("after storage.migrateLegacyIfNeeded()");
      } catch (e) {
        trace(`storage.migrateLegacyIfNeeded() failed: ${String(e)}`);
      }

      // Se o storage lembra da última guilda usada, restaurar seus contratos
      try {
        const persistedGuildId = storage.data.value.currentGuildId;
        trace(`persistedGuildId=${String(persistedGuildId)}`);
        if (persistedGuildId) {
          loadGuildContracts(persistedGuildId);
          trace("loaded persisted guild contracts");
        }
      } catch (e) {
        trace(`loading persisted guild failed: ${String(e)}`);
      }

      // Sincronizar com a guilda atual
      try {
        trace("before syncWithCurrentGuild()");
        await syncWithCurrentGuild();
        trace("after syncWithCurrentGuild()");
      } catch (e) {
        trace(`syncWithCurrentGuild() failed: ${String(e)}`);
      }

      // Inicializar o lifecycle
      try {
        trace("before initializeLifecycle()");
        initializeLifecycle();
        trace("after initializeLifecycle()");
      } catch (e) {
        trace(`initializeLifecycle() failed: ${String(e)}`);
      }

      // Indicar que a reidratação/initialização foi concluída
      isReady.value = true;

      generationError.value = null;
      trace("initializeStore completed");
    } catch (error) {
      generationError.value = "Erro ao inicializar store de contratos";
    }
  };
  // inicialização do store de contratos para persistência de outras views (timeline)
  let __isVitest = false;
  try {
    const env =
      (typeof process !== "undefined"
        ? (process as unknown as { env?: Record<string, string> }).env
        : undefined) || undefined;
    __isVitest =
      !!(env && env.VITEST === "true") ||
      typeof (globalThis as unknown as { __vitest?: unknown }).__vitest !==
        "undefined";
  } catch {
    __isVitest = false;
  }

  if (!__isVitest) {
    initializeStore();
  }

  // watch pra mudanças da guilda e re-sync
  watch(
    () => useGuildStore().currentGuild?.id,
    () => {
      void (async () => {
        try {
          await syncWithCurrentGuild();
        } catch {
          // silent
        }
      })();
    },
    { immediate: !__isVitest }
  );

  /**
   * Gera novos contratos automaticamente via timeline (ignora limitações de geração manual)
   */
  const generateContractsAutomatically = async () => {
    const guildStore = useGuildStore();
    const currentGuild = guildStore.currentGuild;

    if (!currentGuild) {
      return;
    }

    isLoading.value = true;
    generationError.value = null;

    try {
      // Garantir que estamos sincronizados com a guilda
      if (currentGuildId.value !== currentGuild.id) {
        loadGuildContracts(currentGuild.id);
      }

      // Garantir que a timeline está inicializada
      if (!timelineStore.currentGameDate) {
        timelineStore.setCurrentGuild(currentGuild.id);
        // Se ainda não há data, inicializar com data padrão
        if (!timelineStore.currentGameDate) {
          const defaultDate = createGameDate(1, 1, 1);
          timelineStore.createTimelineForGuild(currentGuild.id, defaultDate);
        }
      }

      const config: ContractGenerationConfig = {
        guild: currentGuild,
        skipFrequentatorsReduction: false,
      };

      const newContracts =
        ContractGenerator.generateContractsWithFrequentatorsReduction(
          config,
          timelineStore.currentGameDate!
        );

      // Adicionar novos contratos
      contracts.value.push(...newContracts);

      // Não incrementar generationCount para geração automática,
      // apenas marcar no lifecycle manager
      lifecycleManager.markNewContractsGenerated();
      lastUpdate.value = new Date();
      saveToStorage();
      // Ensure persistence completed before continuing (avoids UI showing counts without saved rows)
      await persistCurrentGuildToAdapter();

      // Agendar próximos eventos de timeline
      scheduleContractEvents();
    } catch (error) {
      // Log erro mas não mostrar ao usuário para geração automática
      generationError.value =
        error instanceof Error ? error.message : "Erro desconhecido na geração";
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Gera novos contratos baseado na guilda atual (geração manual do usuário)
   */
  const generateContracts = async () => {
    const guildStore = useGuildStore();
    const currentGuild = guildStore.currentGuild;

    if (!currentGuild) {
      generationError.value = "Nenhuma guilda selecionada para gerar contratos";
      return;
    }

    if (!canGenerateContracts.value) {
      generationError.value =
        "Esta guilda já teve contratos gerados. Use o sistema de timeline para novos contratos.";
      return;
    }

    isLoading.value = true;
    generationError.value = null;

    try {
      // Garantir que estamos sincronizados com a guilda
      if (currentGuildId.value !== currentGuild.id) {
        loadGuildContracts(currentGuild.id);
      }

      // Garantir que a timeline está inicializada
      if (!timelineStore.currentGameDate) {
        timelineStore.setCurrentGuild(currentGuild.id);
        // Se ainda não há data, inicializar com data padrão
        if (!timelineStore.currentGameDate) {
          const defaultDate = createGameDate(1, 1, 1);
          timelineStore.createTimelineForGuild(currentGuild.id, defaultDate);
        }
      }

      const config: ContractGenerationConfig = {
        guild: currentGuild,
        skipFrequentatorsReduction: false,
      };

      const newContracts =
        ContractGenerator.generateContractsWithFrequentatorsReduction(
          config,
          timelineStore.currentGameDate!
        );

      // Adicionar novos contratos
      contracts.value.push(...newContracts);

      // Marcar que contratos foram gerados para esta guilda
      const guildData = storage.data.value.guildContracts[currentGuild.id];
      if (guildData) {
        guildData.generationCount += 1;
      }

      // Salvar a guilda no histórico se ainda não estiver salva
      const guildStore = useGuildStore();
      const isInHistory = guildStore.guildHistory.some(
        (g) => g.id === currentGuild.id
      );
      if (!isInHistory) {
        guildStore.addToHistory(currentGuild);
      }

      // Bloquear a guilda automaticamente após primeira geração de contratos
      // (impede regeneração de estrutura, mantendo consistência)
      if (!currentGuild.locked) {
        await guildStore.toggleGuildLock(currentGuild.id);
      }

      lifecycleManager.markNewContractsGenerated();
      lastUpdate.value = new Date();
      saveToStorage();
      // Ensure persistence completed before continuing (avoids UI showing counts without saved rows)
      await persistCurrentGuildToAdapter();

      // Agendar eventos de timeline após gerar contratos
      scheduleContractEvents();
    } catch (error) {
      generationError.value =
        error instanceof Error ? error.message : "Erro desconhecido na geração";
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Processa o ciclo de vida dos contratos
   */
  const processContractLifecycle = () => {
    // Verificar prazos expirados
    contracts.value = processContractDeadlines(contracts.value);

    // Marcar contratos expirados
    contracts.value = markExpiredContracts(contracts.value);

    // Processar resoluções automáticas
    contracts.value = lifecycleManager.processContractResolution(
      contracts.value
    );

    lastUpdate.value = new Date();
    saveToStorage();
  };

  /**
   * Atualiza o status de um contrato específico
   */
  const updateContractStatus = (
    contractId: string,
    newStatus: ContractStatus
  ) => {
    const contract = contracts.value.find((c) => c.id === contractId);
    if (contract) {
      contract.status = newStatus;
      lastUpdate.value = new Date();
      saveToStorage();
    }
  };

  /**
   * Remove um contrato específico
   */
  const removeContract = (contractId: string) => {
    const index = contracts.value.findIndex((c) => c.id === contractId);
    if (index !== -1) {
      contracts.value.splice(index, 1);
      lastUpdate.value = new Date();
      saveToStorage();
    }
  };

  /**
   * Reseta todos os contratos
   */
  const resetContracts = () => {
    contracts.value = [];
    lastUpdate.value = new Date();
    generationError.value = null;
    // TODO: lifecycleManager não tem método reset implementado ainda
    saveToStorage();
  };

  /**
   * Aplica penalidade por quebra de contrato
   */
  const applyBreachPenalty = (contractId: string) => {
    const contract = contracts.value.find((c) => c.id === contractId);
    if (contract) {
      const penalty = calculateBreachPenalty(contract.value.finalGoldReward);
      contract.status = ContractStatus.QUEBRADO;
      lastUpdate.value = new Date();
      saveToStorage();
      return penalty;
    }
    return 0;
  };

  /**
   * Limpa filtros ativos
   */
  const clearFilters = () => {
    filters.value = {
      status: null,
      difficulty: null,
      contractor: null,
      searchText: "",
      minValue: null,
      maxValue: null,
      hasDeadline: null,
    };
  };

  /**
   * Define um filtro específico
   */
  const setFilter = <K extends keyof typeof filters.value>(
    key: K,
    value: (typeof filters.value)[K]
  ) => {
    filters.value[key] = value;
  };

  /**
   * Converte deadline em dias baseado no tipo e valor
   */
  const convertDeadlineToDays = (deadline: Contract["deadline"]): number => {
    if (deadline.type === DeadlineType.SEM_PRAZO) {
      return 0; // Sem prazo
    }

    if (!deadline.value) return 7; // Default de 1 semana

    const value = deadline.value.toLowerCase();

    // Extrair número de dias
    if (deadline.type === DeadlineType.DIAS && value.includes("dia")) {
      const match = value.match(/(\d+)/);
      return match ? parseInt(match[1]) : 7;
    }

    // Extrair número de semanas e converter para dias
    if (deadline.type === DeadlineType.SEMANAS && value.includes("semana")) {
      const match = value.match(/(\d+)/);
      return match ? parseInt(match[1]) * 7 : 7;
    }

    return 7; // Default de 1 semana
  };

  /**
   * Verifica contratos aceitos que passaram do prazo e os quebra automaticamente
   */
  const checkAndBreakOverdueContracts = () => {
    const timelineStore = useTimelineStore();
    const currentDate = timelineStore.currentGameDate;

    if (!currentDate) return;

    const acceptedContracts = contracts.value.filter(
      (c) => c.status === ContractStatus.ACEITO && c.deadlineDate
    );

    for (const contract of acceptedContracts) {
      if (
        contract.deadlineDate &&
        isDateAfter(currentDate, contract.deadlineDate)
      ) {
        // Contrato passou do prazo, quebrar automaticamente
        breakContractWithPenalty(
          contract.id,
          `Prazo excedido em ${getDaysDifference(contract.deadlineDate, currentDate)} dias`
        );
      }
    }
  };

  /**
   * Quebra um contrato específico e aplica penalidade
   */
  const breakContractWithPenalty = (
    contractId: string,
    reason: string = "Contrato quebrado"
  ) => {
    const contract = contracts.value.find((c) => c.id === contractId);
    if (contract) {
      const timelineStore = useTimelineStore();
      const currentDate = timelineStore.currentGameDate;

      if (currentDate) {
        contract.brokenAt = currentDate;
      }

      // Calcular penalidade (10% da recompensa)
      const penaltyAmount = Math.floor(contract.value.finalGoldReward * 0.1);
      contract.penalty = {
        amount: penaltyAmount,
        reason: reason,
        appliedAt: currentDate || createGameDate(1, 1, 1000),
      };

      // Aplicar bônus de recompensa para futuros aventureiros (+2 na rolagem)
      // contratos quebrados/abandonados ficam com recompensa maior
      applyRewardBonusToContract(contractId, 2);

      // Atualizar status para DISPONIVEL (contrato volta a ficar disponível com bônus)
      contract.status = ContractStatus.DISPONIVEL;

      // Resetar dados relacionados ao aceite anterior
      contract.acceptedAt = undefined;
      if (currentDate) {
        contract.brokenAt = currentDate; // Manter registro de quando foi quebrado
      }

      lastUpdate.value = new Date();
      saveToStorage();

      // Mostrar notificação
      warning(
        "Contrato Quebrado",
        `${contract.objective?.description || "Contrato"} foi quebrado. Multa: ${formatCurrency(penaltyAmount)} PO$. ` +
          `O contrato voltou a ficar disponível com recompensa aumentada para ${formatCurrency(contract.value.finalGoldReward)} PO$.`
      );

      return penaltyAmount;
    }
    return 0;
  };

  // ===== UTILITY FUNCTIONS =====

  /**
   * Formata valores monetários evitando dízimas periódicas
   */
  const formatCurrency = (value: number): string => {
    return Number(value.toFixed(1)).toString();
  };

  /**
   * Aplica bônus de recompensa a um contrato específico
   * Usado quando contratos não são resolvidos no prazo
   *
   * O bônus avança posições na tabela d100
   * e recalcula o valor com todos os modificadores originais aplicados.
   * O bônus sempre resulta em valor maior ou igual ao anterior.
   */
  const applyRewardBonusToContract = (
    contractId: string,
    bonusAmount: number = 2
  ): boolean => {
    const contract = contracts.value.find((c) => c.id === contractId);
    if (!contract) return false;

    const guild = useGuildStore().currentGuild;
    if (!guild) return false;

    // Armazenar o valor anterior para o histórico
    const previousValue = contract.value.finalGoldReward;

    // Recalcular valor usando progressão na tabela d100
    // O bônus adiciona pontos diretamente à rolagem, avançando posições na tabela
    const currentBonusTotal =
      (contract.generationData.rewardRollBonus || 0) + bonusAmount;

    // Buscar o difficultyEntry usando o difficultyRoll armazenado
    const difficultyEntry = contract.generationData.difficultyRoll
      ? CONTRACT_DIFFICULTY_TABLE.find(
          (entry) =>
            contract.generationData.difficultyRoll! >= entry.min &&
            contract.generationData.difficultyRoll! <= entry.max
        )
      : undefined;

    // Recalcular o contrato inteiro com o novo bônus de recompensa
    const newContractValue =
      ContractGenerator.calculateContractValueWithRewardBonus(
        contract.generationData.baseRoll,
        guild,
        contract.contractorType,
        difficultyEntry,
        contract.generationData.distanceRoll,
        currentBonusTotal
      );

    // Garantir que o bônus sempre resulte em valor adequado
    let finalContractValue = newContractValue.contractValue;

    // Calcular incremento mínimo e máximo razoáveis
    const guaranteedMinimum = Math.ceil(previousValue * 1.1); // +10% mínimo
    const maximumReasonable = previousValue * 2.0; // Máximo 2x para evitar valores absurdos

    // CASO 1: Valor muito baixo - aplicar garantia mínima
    if (finalContractValue.finalGoldReward <= previousValue) {
      finalContractValue = {
        ...finalContractValue,
        rewardValue: Math.floor(guaranteedMinimum * 10), // Manter proporção 10:1
        finalGoldReward: guaranteedMinimum,
        modifiers: {
          ...finalContractValue.modifiers,
          rewardRollBonus: currentBonusTotal,
        },
      };
    }
    // CASO 2: Valor excessivamente alto - corrigir para máximo razoável
    else if (finalContractValue.finalGoldReward > maximumReasonable) {
      // Detectar valores absurdos e aplicar correção
      const correctedValue = Math.max(
        guaranteedMinimum,
        Math.min(maximumReasonable, previousValue * 1.5)
      );

      finalContractValue = {
        ...finalContractValue,
        rewardValue: Math.floor(correctedValue * 10), // Manter proporção 10:1
        finalGoldReward: correctedValue,
        modifiers: {
          ...finalContractValue.modifiers,
          rewardRollBonus: currentBonusTotal,
        },
      };
    }
    // CASO 3: Valor dentro do esperado - manter o cálculo normal

    // Atualizar o valor do contrato com os novos cálculos
    contract.value = finalContractValue;

    // Registrar o bônus aplicado nos dados de geração
    contract.generationData = {
      ...contract.generationData,
      rewardRollBonus: currentBonusTotal,
      previousFinalGoldReward: previousValue,
    };

    // Atualizar a descrição do contrato para mostrar o reajuste
    contract.description =
      ContractGenerator.updateContractDescriptionWithBonusReward(
        contract,
        previousValue,
        "quebra de contrato"
      );

    lastUpdate.value = new Date();
    saveToStorage();

    // Determinar tipo de correção aplicada para a mensagem
    let mensagemTipo = "bônus padrão";
    if (finalContractValue.finalGoldReward === guaranteedMinimum) {
      mensagemTipo = "garantia mínima (+10%)";
    } else if (finalContractValue.finalGoldReward <= maximumReasonable) {
      mensagemTipo = "correção de valor excessivo";
    }

    info(
      "Contrato Atualizado",
      `O contrato teve sua recompensa ajustada de ${formatCurrency(previousValue)} PO$ para ${formatCurrency(contract.value.finalGoldReward)} PO$ (${mensagemTipo}) devido ao bônus por não resolução.`
    );

    return true;
  };

  /**
   * Retorna um contrato quebrado/abandonado para disponível com bônus de recompensa
   */
  const returnContractToAvailableWithBonus = (contractId: string) => {
    const contract = contracts.value.find((c) => c.id === contractId);
    if (!contract) return false;

    // Aplicar bônus de recompensa (+2 na rolagem)
    applyRewardBonusToContract(contractId, 2);

    // Resetar status e dados relacionados
    contract.status = ContractStatus.DISPONIVEL;
    contract.acceptedAt = undefined;
    contract.brokenAt = undefined;
    contract.penalty = undefined;

    lastUpdate.value = new Date();
    saveToStorage();

    success(
      "Contrato Renovado",
      `O contrato foi renovado e retornou para disponível com recompensa aumentada.`
    );

    return true;
  };

  /**
   * Aceita um contrato específico
   */
  const acceptContract = (contractId: string) => {
    const contract = contracts.value.find((c) => c.id === contractId);
    if (contract) {
      const timelineStore = useTimelineStore();
      const currentDate = timelineStore.currentGameDate;

      if (!currentDate) {
        return;
      }

      // Define a data de aceitação
      contract.acceptedAt = currentDate;

      // Calcula a data limite baseada no prazo do contrato
      const deadlineDays = convertDeadlineToDays(contract.deadline);
      if (deadlineDays > 0) {
        contract.deadlineDate = addDays(currentDate, deadlineDays);
      }

      // Atualiza o status
      contract.status = ContractStatus.ACEITO;
      lastUpdate.value = new Date();
      saveToStorage();
    }
  };

  /**
   * Completa um contrato específico
   */
  const completeContract = (contractId: string) => {
    updateContractStatus(contractId, ContractStatus.CONCLUIDO);
  };

  /**
   * Quebra um contrato e aplica penalidade
   */
  const breakContract = (contractId: string) => {
    return applyBreachPenalty(contractId);
  };

  /**
   * Limpa todos os contratos (alias para resetContracts)
   */
  const clearContracts = () => {
    resetContracts();
  };

  /**
   * Limpa contratos para nova guilda (alias para compatibilidade)
   */
  const clearContractsForNewGuild = () => {
    resetContracts();
  };

  // ===== FUNÇÕES ESPECÍFICAS DE FILTROS (Compatibilidade) =====

  /**
   * Define filtro por status
   */
  const setStatusFilter = (status: ContractStatus | null) => {
    setFilter("status", status);
  };

  /**
   * Define filtro por dificuldade
   */
  const setDifficultyFilter = (difficulty: ContractDifficulty | null) => {
    setFilter("difficulty", difficulty);
  };

  /**
   * Define filtro por tipo de contratante
   */
  const setContractorFilter = (contractor: ContractorType | null) => {
    setFilter("contractor", contractor);
  };

  /**
   * Define filtro por texto de busca
   */
  const setSearchFilter = (searchText: string) => {
    setFilter("searchText", searchText);
  };

  /**
   * Define filtro por range de valores
   */
  const setValueRangeFilter = (
    minValue: number | null,
    maxValue: number | null
  ) => {
    setFilter("minValue", minValue);
    setFilter("maxValue", maxValue);
  };

  /**
   * Define filtro por existência de prazo
   */
  const setDeadlineFilter = (hasDeadline: boolean | null) => {
    setFilter("hasDeadline", hasDeadline);
  };

  // ===== FUNÇÕES DO CICLO DE VIDA (Compatibilidade) =====

  /**
   * Verifica se deve processar ciclo de vida
   */
  const shouldProcessLifecycle = (): boolean => {
    return contracts.value.length > 0;
  };

  /**
   * Verifica se deve gerar novos contratos
   */
  const shouldGenerateNewContracts = (): boolean => {
    return canGenerateContracts.value;
  };

  /**
   * Exporta estado completo do store
   */
  const exportState = () => {
    return {
      contracts: contracts.value,
      lastUpdate: lastUpdate.value,
      lifecycle: lifecycleManager.exportState(),
      filters: filters.value,
      currentGuildId: currentGuildId.value,
      guildContracts: storage.data.value.guildContracts,
    };
  };

  /**
   * Importa estado da persistência externa
   */
  const importState = (state: {
    contracts: Contract[];
    lastUpdate: string | null;
    lifecycle: ContractLifecycleState;
    filters?: typeof filters.value;
  }) => {
    contracts.value = state.contracts;
    lastUpdate.value = state.lastUpdate ? new Date(state.lastUpdate) : null;
    lifecycleManager.importState(state.lifecycle);

    if (state.filters) {
      filters.value = { ...filters.value, ...state.filters };
    }

    saveToStorage();
  };

  /**
   * Inicia um contrato aceito
   */
  const startContract = (contractId: string) => {
    const contract = contracts.value.find((c) => c.id === contractId);
    if (contract && contract.status === ContractStatus.ACEITO) {
      contract.status = ContractStatus.EM_ANDAMENTO;
      lastUpdate.value = new Date();
      saveToStorage();
    }
  };

  /**
   * Marca um contrato como falhado
   */
  const failContract = (contractId: string) => {
    const contract = contracts.value.find((c) => c.id === contractId);
    if (
      contract &&
      (contract.status === ContractStatus.ACEITO ||
        contract.status === ContractStatus.EM_ANDAMENTO)
    ) {
      contract.status = ContractStatus.FALHOU;
      lastUpdate.value = new Date();
      saveToStorage();
    }
  };

  /**
   * Cancela/anula um contrato
   */
  const cancelContract = (contractId: string) => {
    const contract = contracts.value.find((c) => c.id === contractId);
    if (contract) {
      contract.status = ContractStatus.ANULADO;
      lastUpdate.value = new Date();
      saveToStorage();
    }
  };

  /**
   * Adiciona um novo contrato
   */
  const addContract = (contract: Contract) => {
    contracts.value.push(contract);
    lastUpdate.value = new Date();
    saveToStorage();
  };

  /**
   * Obtém um contrato por ID
   */
  const getContractById = (contractId: string): Contract | undefined => {
    return contracts.value.find((c) => c.id === contractId);
  };

  /**
   * Força a resolução automática de contratos (para teste/debug)
   */
  const forceResolution = () => {
    contracts.value = lifecycleManager.forceContractResolution(contracts.value);
    lastUpdate.value = new Date();
    saveToStorage();
  };

  /**
   * Processa automaticamente o ciclo de vida se necessário
   */
  const autoProcessLifecycle = () => {
    if (shouldProcessLifecycle()) {
      processContractLifecycle();
    }
  };

  /**
   * Atualiza as estatísticas e processa ciclo se necessário
   */
  const updateAndProcess = () => {
    autoProcessLifecycle();
    lastUpdate.value = new Date();
    saveToStorage();
  };

  // ===== ESTATÍSTICAS FILTRADAS =====

  /**
   * Estatísticas dos contratos filtrados
   */
  const filteredStats = computed(() => {
    const filtered = filteredContracts.value;
    return {
      total: filtered.length,
      available: filtered.filter((c) => c.status === ContractStatus.DISPONIVEL)
        .length,
      accepted: filtered.filter((c) => c.status === ContractStatus.ACEITO)
        .length,
      inProgress: filtered.filter(
        (c) => c.status === ContractStatus.EM_ANDAMENTO
      ).length,
      completed: filtered.filter(
        (c) =>
          c.status === ContractStatus.CONCLUIDO ||
          c.status === ContractStatus.RESOLVIDO_POR_OUTROS
      ).length,
      failed: filtered.filter(
        (c) =>
          c.status === ContractStatus.FALHOU ||
          c.status === ContractStatus.QUEBRADO ||
          c.status === ContractStatus.ANULADO
      ).length,
      totalValue: filtered.reduce((sum, c) => sum + c.value.finalGoldReward, 0),
      averageValue:
        filtered.length > 0
          ? filtered.reduce((sum, c) => sum + c.value.finalGoldReward, 0) /
            filtered.length
          : 0,
    };
  });

  /**
   * Limpa dados de guildas removidas do histórico
   */
  const cleanupRemovedGuilds = (existingGuildIds: string[]) => {
    const storageGuildIds = Object.keys(storage.data.value.guildContracts);
    const toRemove = storageGuildIds.filter(
      (id) => !existingGuildIds.includes(id)
    );

    toRemove.forEach((guildId) => {
      cleanupGuildContracts(guildId);
    });
  };

  // Retornar a API pública do store
  return {
    // ===== ESTADO =====
    contracts: readonly(contracts),
    isReady: readonly(isReady),
    isLoading: readonly(isLoading),
    lastUpdate: readonly(lastUpdate),
    generationError: readonly(generationError),
    currentGuildId: readonly(currentGuildId),
    filters: readonly(filters),

    // ===== COMPUTED =====
    availableContracts,
    acceptedContracts,
    inProgressContracts,
    completedContracts,
    failedContracts,
    expiredContracts,
    filteredContracts,
    contractStats,
    canGenerateContracts,
    nextActions,

    // ===== ACTIONS - Core =====
    initializeStore,
    syncWithCurrentGuild,
    loadGuildContracts,
    cleanupGuildContracts,
    cleanupRemovedGuilds,

    // ===== ACTIONS - Geração e Ciclo de Vida =====
    generateContracts,
    generateContractsAutomatically,
    processContractLifecycle,
    updateContractStatus,
    removeContract,
    resetContracts,
    applyBreachPenalty,
    clearFilters,
    setFilter,

    // ===== ACTIONS - Gerenciamento Manual =====
    acceptContract,
    startContract,
    completeContract,
    failContract,
    breakContract,
    breakContractWithPenalty,
    cancelContract,
    applyRewardBonusToContract,
    returnContractToAvailableWithBonus,

    // ===== ACTIONS - CRUD =====
    clearContracts,
    clearContractsForNewGuild,
    addContract,
    getContractById,

    // ===== ACTIONS - Filtros =====
    setStatusFilter,
    setDifficultyFilter,
    setContractorFilter,
    setSearchFilter,
    setValueRangeFilter,
    setDeadlineFilter,

    // ===== ACTIONS - Estado =====
    shouldProcessLifecycle,
    shouldGenerateNewContracts,
    forceResolution,
    autoProcessLifecycle,
    updateAndProcess,

    // ===== ACTIONS - Exportação e Estatísticas =====
    exportState,
    importState,
    filteredStats,

    // ===== FUNÇÕES DO GERENCIADOR =====
    initializeLifecycle,

    // ===== INTEGRAÇÃO COM TIMELINE =====
    scheduleContractEvents,
    processSignedContractResolution,
    processUnsignedContractResolution,
    processTimelineEvents,
    processTimeAdvance,
    checkAndBreakOverdueContracts,
  };
});
