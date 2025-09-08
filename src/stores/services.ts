import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import type { Service, ServiceTestOutcome } from "@/types/service";
import { ServiceStatus, applyRecurrenceBonus } from "@/types/service";
import type { Guild } from "@/types/guild";
import type { GameDate, TimeAdvanceResult } from "@/types/timeline";
import { ScheduledEventType } from "@/types/timeline";
import { createGameDate } from "@/utils/date-utils";
import {
  ServiceLifecycleManager,
  applyServiceUnsignedResolution,
  applyServiceSignedResolution,
  rollNewServicesTime,
  rollServiceSignedResolutionTime,
  rollServiceUnsignedResolutionTime,
  type ServiceLifecycleState,
} from "@/utils/generators/serviceLifeCycle";
import { ServiceGenerator } from "@/utils/generators/serviceGenerator";
import { useServicesStorage } from "@/composables/useServicesStorage";
import { useTimelineStore } from "@/stores/timeline";
import { useGuildStore } from "@/stores/guild";
import { useToast } from "@/composables/useToast";
import {
  scheduleModuleEvents,
  processModuleTimeAdvance,
  updateModuleTimestamp,
  applyAutomaticResolution,
  type TimelineModuleConfig,
  type ModuleEventConfig,
  type ModuleEventHandler,
  type ResolutionConfig,
} from "@/utils/timeline-store-integration";

// Interface estendida para incluir guildId
interface ServiceWithGuild extends Service {
  guildId: string;
  resolvedAt?: Date;
}

export const useServicesStore = defineStore("services", () => {
  // Stores
  const timelineStore = useTimelineStore();
  const guildStore = useGuildStore();
  const { success } = useToast();
  const servicesStorage = useServicesStorage();

  // State
  const services = ref<ServiceWithGuild[]>([]);
  const isLoading = ref(false);
  const isReady = ref(false);
  const lifecycleManager = ref<ServiceLifecycleManager | null>(null);
  const lastUpdate = ref<GameDate>(createGameDate(1, 1, 2025));

  // Computed for current guild ID
  const currentGuildId = computed(() => guildStore.currentGuild?.id);
  const currentGuild = computed(() => guildStore.currentGuild);

  // Configuração do módulo para integração com timeline
  const moduleConfig: TimelineModuleConfig = {
    moduleType: "services",
    guildIdGetter: () => currentGuildId.value,
    timelineStore,
  };

  // Getters
  const activeServices = computed(() =>
    services.value.filter((service) => service.status === ServiceStatus.ACEITO)
  );

  const pendingServices = computed(() =>
    services.value.filter(
      (service) => service.status === ServiceStatus.DISPONIVEL
    )
  );

  const completedServices = computed(() =>
    services.value.filter(
      (service) =>
        service.status === ServiceStatus.CONCLUIDO ||
        service.status === ServiceStatus.FALHOU ||
        service.status === ServiceStatus.RESOLVIDO_POR_OUTROS
    )
  );

  const servicesByGuild = computed(() => {
    const groupedServices: Record<string, ServiceWithGuild[]> = {};
    services.value.forEach((service) => {
      if (!groupedServices[service.guildId]) {
        groupedServices[service.guildId] = [];
      }
      groupedServices[service.guildId].push(service);
    });
    return groupedServices;
  });

  // Actions
  const initializeLifecycleManager = (currentDate: GameDate) => {
    if (!lifecycleManager.value) {
      lifecycleManager.value = new ServiceLifecycleManager();
      // Converter GameDate para Date JavaScript para o lifecycle manager
      const jsDate = new Date(
        currentDate.year,
        currentDate.month - 1,
        currentDate.day
      );
      lifecycleManager.value.scheduleNextResolutions(jsDate);
    }
  };

  const generateServices = async (guild: Guild, quantity?: number) => {
    isLoading.value = true;
    try {
      // Garantir que a timeline está inicializada para esta guilda
      timelineStore.setCurrentGuild(guild.id);
      const currentDate =
        timelineStore.currentGameDate || createGameDate(1, 1, 2025);

      // Inicializar lifecycle manager se necessário
      if (!lifecycleManager.value) {
        initializeLifecycleManager(currentDate);
      }

      const config = {
        guild,
        quantity,
        currentDate,
        applyReductions: true,
      };

      const result = ServiceGenerator.generateServices(config);

      // Converter para ServiceWithGuild e adicionar à store
      const servicesWithGuild: ServiceWithGuild[] = result.services.map(
        (service: Service) => ({
          ...service,
          guildId: guild.id,
        })
      );

      // Adicionar todos os serviços gerados
      servicesWithGuild.forEach((service) => {
        services.value.push(service);
      });

      // Salvar alterações primeiro
      saveServicesToStorage();

      // Aguardar um momento para garantir que o estado esteja sincronizado
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Agendar eventos de timeline após gerar serviços
      scheduleServiceEvents();

      return servicesWithGuild;
    } finally {
      isLoading.value = false;
    }
  };

  const addService = (service: ServiceWithGuild) => {
    services.value.push(service);
    saveServicesToStorage();
  };

  const updateServiceStatus = (serviceId: string, status: ServiceStatus) => {
    const service = services.value.find((s) => s.id === serviceId);
    if (service) {
      service.status = status;
      if (
        status === ServiceStatus.CONCLUIDO ||
        status === ServiceStatus.FALHOU ||
        status === ServiceStatus.RESOLVIDO_POR_OUTROS
      ) {
        service.resolvedAt = new Date();
      }
      saveServicesToStorage();
    }
  };

  const removeService = (serviceId: string) => {
    const index = services.value.findIndex((s) => s.id === serviceId);
    if (index > -1) {
      services.value.splice(index, 1);
      saveServicesToStorage();
    }
  };

  const removeServicesByGuild = (guildId: string) => {
    services.value = services.value.filter((s) => s.guildId !== guildId);
    saveServicesToStorage();
  };

  /**
   * Aplica taxa de recorrência a um serviço específico e persiste a alteração
   */
  const applyRecurrenceToService = (serviceId: string) => {
    const index = services.value.findIndex((s) => s.id === serviceId);
    if (index === -1) return null;

    const updated = applyRecurrenceBonus(
      services.value[index] as Service
    ) as ServiceWithGuild;
    // manter guildId e outros campos
    services.value[index] = {
      ...services.value[index],
      ...updated,
    } as ServiceWithGuild;
    saveServicesToStorage();
    return services.value[index];
  };

  const getServicesForGuild = (guildId: string): ServiceWithGuild[] => {
    return services.value.filter((service) => service.guildId === guildId);
  };

  const processServiceResolutions = async (
    currentDate: GameDate
  ): Promise<{
    resolvedServices: ServiceWithGuild[];
    newGenerationTime?: number;
  }> => {
    if (!lifecycleManager.value) {
      initializeLifecycleManager(currentDate);
    }

    const results = {
      resolvedServices: [] as ServiceWithGuild[],
      newGenerationTime: undefined as number | undefined,
    };

    // Converter GameDate para Date JavaScript para compatibilidade com lifecycle manager
    const currentJSDate = new Date(
      currentDate.year,
      currentDate.month - 1,
      currentDate.day
    );

    // Process events using the lifecycle manager
    const { updatedServices, processedEvents } =
      lifecycleManager.value!.processEvents(services.value, currentJSDate);

    // Update our services with the processed results
    services.value = updatedServices as ServiceWithGuild[];

    // Find newly resolved services
    results.resolvedServices = services.value.filter(
      (service) =>
        (service.status === ServiceStatus.CONCLUIDO ||
          service.status === ServiceStatus.FALHOU ||
          service.status === ServiceStatus.RESOLVIDO_POR_OUTROS) &&
        !service.resolvedAt
    );

    // Mark resolved services with timestamp
    results.resolvedServices.forEach((service) => {
      service.resolvedAt = new Date();
    });

    // Check for new service generation events
    if (processedEvents.includes("new_services")) {
      results.newGenerationTime = Math.floor(Math.random() * 7) + 1; // 1-7 days as example
    }

    // Reschedule after processing
    lifecycleManager.value!.rescheduleAfterProcessing(currentJSDate);

    saveServicesToStorage();

    return results;
  };

  const forceResolveServices = async (
    guildId: string,
    currentDate: GameDate
  ): Promise<ServiceWithGuild[]> => {
    if (!lifecycleManager.value) {
      initializeLifecycleManager(currentDate);
    }

    const guildServices = getServicesForGuild(guildId).filter(
      (s) => s.status === ServiceStatus.DISPONIVEL
    );

    if (guildServices.length === 0) {
      return [];
    }

    // Apply unsigned service resolution using the global function
    const updatedServices = applyServiceUnsignedResolution(guildServices);

    const resolvedServices: ServiceWithGuild[] = [];

    // Update our store with the resolved services
    updatedServices.forEach((updated: Service) => {
      const index = services.value.findIndex((s) => s.id === updated.id);
      if (index > -1) {
        services.value[index] = updated as ServiceWithGuild;
        if (
          updated.status === ServiceStatus.CONCLUIDO ||
          updated.status === ServiceStatus.FALHOU ||
          updated.status === ServiceStatus.RESOLVIDO_POR_OUTROS
        ) {
          (services.value[index] as ServiceWithGuild).resolvedAt = new Date();
          resolvedServices.push(services.value[index]);
        }
      }
    });

    saveServicesToStorage();
    return resolvedServices;
  };

  // Import/Export for lifecycle state
  const exportLifecycleState = () => {
    return lifecycleManager.value?.getState() || null;
  };

  const importLifecycleState = (
    state: ServiceLifecycleState,
    currentDate: GameDate
  ) => {
    if (!lifecycleManager.value) {
      initializeLifecycleManager(currentDate);
    }
    lifecycleManager.value!.updateState(state);
  };

  // Storage methods
  const saveServicesToStorage = async () => {
    const currentGuildId = guildStore.currentGuild?.id;
    if (!currentGuildId) return;

    // Converter services para formato sem guildId (Service[])
    const servicesForGuild = services.value
      .filter((s) => s.guildId === currentGuildId)
      .map((s) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { guildId: _, ...service } = s;
        return service as Service;
      });

    await servicesStorage.updateServicesForGuild(
      currentGuildId,
      servicesForGuild
    );

    // Forçar persistência imediata para evitar perda de dados
    try {
      await servicesStorage.persistGuildServices(currentGuildId);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("Failed to force persist services:", e);
    }
  };

  const loadServicesFromStorage = async (currentDate?: GameDate) => {
    const currentGuildId = guildStore.currentGuild?.id;
    if (!currentGuildId) return;

    const guildServices = servicesStorage.getServicesForGuild(currentGuildId);

    // Converter para ServiceWithGuild
    const servicesWithGuild: ServiceWithGuild[] = guildServices.map(
      (service) => ({
        ...service,
        guildId: currentGuildId,
      })
    );

    services.value = servicesWithGuild;

    // Inicializar lifecycle manager se necessário
    if (currentDate) {
      initializeLifecycleManager(currentDate);
    }
  };

  const clearAllServices = async (testGuildId?: string) => {
    const currentGuildId = testGuildId || guildStore.currentGuild?.id;
    if (!currentGuildId) return;

    services.value = services.value.filter((s) => s.guildId !== currentGuildId);
    lifecycleManager.value = null;
    await servicesStorage.removeServicesForGuild(currentGuildId);
  };

  /**
   * Inicializa o store de serviços
   */
  const initializeStore = async () => {
    try {
      // Garantir que o storage foi carregado
      await servicesStorage.load();

      // Carregar serviços da guilda atual se existir
      const currentGuildId = guildStore.currentGuild?.id;
      if (currentGuildId) {
        await loadServicesFromStorage(
          timelineStore.currentGameDate || undefined
        );
      }

      isReady.value = true;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("Failed to initialize services store:", error);
    }
  };

  // Auto-load de serviços do storage quando store é inicializado
  // Garante serviços persistidos disponíveis para outras views (timeline)
  void initializeStore();

  // Auto-save quando services mudam
  watch(
    () => services.value,
    () => {
      void saveServicesToStorage();
    },
    { deep: true }
  );

  // watch pra guilda atual pra inicializar o lifecycle manager com a timeline
  watch(
    () => guildStore.currentGuild?.id,
    (newGuildId) => {
      if (!newGuildId) return;

      // Carregar serviços da nova guilda
      void loadServicesFromStorage(timelineStore.currentGameDate || undefined);

      const currentDate = timelineStore.currentGameDate;
      if (currentDate) {
        // Initialize lifecycle manager with the current timeline date
        initializeLifecycleManager(currentDate);
      }
    },
    { immediate: true }
  );

  /**
   * Agenda eventos de timeline baseados no ciclo de vida dos serviços
   */
  const scheduleServiceEvents = () => {
    if (!timelineStore.currentGameDate || !currentGuildId.value) {
      return;
    }

    const eventConfigs: ModuleEventConfig[] = [
      {
        type: ScheduledEventType.NEW_SERVICES,
        source: "service_generation",
        description: "Novos serviços disponíveis",
        rollTimeFunction: rollNewServicesTime,
        guildId: currentGuildId.value,
      },
      {
        type: ScheduledEventType.SERVICE_RESOLUTION,
        source: "signed_resolution",
        description: "Resolução automática de serviços assinados",
        rollTimeFunction: rollServiceSignedResolutionTime,
        guildId: currentGuildId.value,
        resolutionType: "signed",
      },
      {
        type: ScheduledEventType.SERVICE_RESOLUTION,
        source: "unsigned_resolution",
        description: "Resolução automática de serviços não assinados",
        rollTimeFunction: rollServiceUnsignedResolutionTime,
        guildId: currentGuildId.value,
        resolutionType: "unsigned",
      },
    ];

    scheduleModuleEvents(moduleConfig, eventConfigs);
  };

  /**
   * Processa resolução automática específica para serviços assinados
   */
  const processSignedServiceResolution = () => {
    const resolutionConfig: ResolutionConfig<ServiceWithGuild> = {
      statusFilter: (s) => s.status === ServiceStatus.ACEITO_POR_OUTROS,
      resolutionFunction: (items) =>
        applyServiceSignedResolution(items as Service[]) as ServiceWithGuild[],
    };

    applyAutomaticResolution(
      services.value,
      resolutionConfig,
      () => currentGuildId.value,
      (updatedItems) => {
        services.value = updatedItems;
      },
      saveServicesToStorage
    );

    // Atualizar timestamp usando utilitário modular
    lastUpdate.value = updateModuleTimestamp(timelineStore);
  };

  /**
   * Aplica bônus de recorrência para serviços não resolvidos
   */
  const applyRecurrenceBonusToUnresolvedServices = () => {
    const unresolvedServices = services.value.filter(
      (service) =>
        service.status === ServiceStatus.DISPONIVEL &&
        service.guildId === currentGuildId.value &&
        service.value.recurrenceBonusAmount > 0
    );

    if (unresolvedServices.length === 0) {
      return;
    }

    let bonusAppliedCount = 0;

    // Aplicar bônus de recorrência para cada serviço não resolvido
    services.value = services.value.map((service) => {
      if (unresolvedServices.includes(service as ServiceWithGuild)) {
        bonusAppliedCount++;
        // Usar a função de bônus de recorrência dos types
        return applyRecurrenceBonus(service as Service) as ServiceWithGuild;
      }
      return service;
    });

    if (bonusAppliedCount > 0) {
      // Salvar alterações
      saveServicesToStorage();
    }
  };
  const processUnsignedServiceResolution = () => {
    const resolutionConfig: ResolutionConfig<ServiceWithGuild> = {
      statusFilter: (s) => s.status === ServiceStatus.DISPONIVEL,
      resolutionFunction: (items) =>
        applyServiceUnsignedResolution(
          items as Service[]
        ) as ServiceWithGuild[],
    };

    applyAutomaticResolution(
      services.value,
      resolutionConfig,
      () => currentGuildId.value,
      (updatedItems) => {
        services.value = updatedItems;
      },
      saveServicesToStorage
    );

    // Aplicar taxa de recorrência para serviços não resolvidos
    applyRecurrenceBonusToUnresolvedServices();

    // Atualizar timestamp usando utilitário modular
    lastUpdate.value = updateModuleTimestamp(timelineStore);
  };

  /**
   * Gera serviços automaticamente quando ativado por evento da timeline
   */
  const generateServicesAutomatically = () => {
    if (!currentGuild.value || !timelineStore.currentGameDate) {
      return;
    }

    // Usar gerador baseado na configuração da guilda
    const result = ServiceGenerator.generateServices({
      guild: currentGuild.value,
      currentDate: timelineStore.currentGameDate,
      applyReductions: true,
    });

    if (result.services.length > 0) {
      const servicesWithGuild = result.services.map((service: Service) => ({
        ...service,
        guildId: currentGuildId.value || "unknown",
      })) as ServiceWithGuild[];

      services.value.push(...servicesWithGuild);
      lastUpdate.value = createGameDate(
        timelineStore.currentGameDate.day,
        timelineStore.currentGameDate.month,
        timelineStore.currentGameDate.year
      );
      saveServicesToStorage();
    }
  };

  /**
   * Integração com passagem de tempo do timeline
   */
  const processTimeAdvance = async (result: TimeAdvanceResult) => {
    if (!timelineStore.currentGameDate || !currentGuildId.value) {
      return;
    }

    // Configuração dos handlers para eventos de serviços
    const eventHandlers: ModuleEventHandler[] = [
      {
        eventType: ScheduledEventType.NEW_SERVICES,
        handler: () => generateServicesAutomatically(),
      },
      {
        eventType: ScheduledEventType.SERVICE_RESOLUTION,
        handler: (event) => {
          if (event.data?.resolutionType === "signed") {
            processSignedServiceResolution();
          } else if (event.data?.resolutionType === "unsigned") {
            processUnsignedServiceResolution();
          }
        },
      },
    ];

    // Configuração do módulo
    const moduleConfig: TimelineModuleConfig = {
      moduleType: "services",
      guildIdGetter: () => currentGuildId.value,
      timelineStore,
    };

    // Processar eventos usando utilitário modular
    processModuleTimeAdvance(
      moduleConfig,
      result,
      eventHandlers,
      scheduleServiceEvents
    );
  };

  // ===== SKILL TEST ACTIONS =====

  /**
   * Inicializa estrutura de testes para um serviço aceito
   */
  const initializeServiceTests = async (serviceId: string) => {
    const service = services.value.find((s) => s.id === serviceId);
    if (!service) {
      throw new Error(`Serviço não encontrado: ${serviceId}`);
    }

    // Usar função já existente das tabelas
    const { initializeServiceTests: initTests } = await import(
      "@/utils/service-skill-resolution"
    );
    const testStructure = initTests(service);

    // Atualizar serviço com estrutura de testes
    service.testStructure = testStructure;
    saveServicesToStorage();

    return testStructure;
  };

  /**
   * Processa um teste de perícia individual
   */
  const processServiceSkillTest = async (
    serviceId: string,
    testIndex: number,
    rollResult: number
  ) => {
    const service = services.value.find((s) => s.id === serviceId);
    if (!service) {
      throw new Error(`Serviço não encontrado: ${serviceId}`);
    }

    if (!service.testStructure) {
      throw new Error(
        `Serviço ${serviceId} não possui estrutura de testes inicializada`
      );
    }

    // Usar função já existente das tabelas
    const { processSkillTest } = await import(
      "@/utils/service-skill-resolution"
    );
    const { result, updatedStructure } = processSkillTest(
      service.testStructure,
      testIndex,
      rollResult
    );

    // Atualizar serviço com estrutura atualizada
    service.testStructure = updatedStructure;

    // Se todos os testes foram completados, aplicar resultado
    if (updatedStructure.completed && updatedStructure.outcome) {
      await applyServiceTestOutcome(serviceId, updatedStructure.outcome);
    }

    saveServicesToStorage();

    return { result, updatedStructure };
  };

  /**
   * Aplica o resultado final dos testes ao serviço
   */
  const applyServiceTestOutcome = async (
    serviceId: string,
    outcome: ServiceTestOutcome
  ) => {
    const service = services.value.find((s) => s.id === serviceId);
    if (!service) return;

    // Aplicar modificadores de renome (será integrado com store de renome)
    if (outcome.renownModifier !== 0) {
      // TODO: Integrar com store de renome quando implementado
      // renownStore.addRenown(outcome.renownModifier, `Serviço: ${service.objective?.description || 'Sem descrição'}`);
    }

    // Aplicar modificadores de recompensa
    if (outcome.rewardModifier !== 1) {
      const originalReward = service.value.rewardAmount;
      service.value.rewardAmount = Math.floor(
        originalReward * outcome.rewardModifier
      );
    }

    // Marcar serviço como concluído
    service.status = ServiceStatus.CONCLUIDO;
    service.completedAt =
      timelineStore.currentGameDate || createGameDate(1, 1, 2024);
    service.resolvedAt = new Date();

    saveServicesToStorage();

    // Notificar sucesso
    success(`Serviço concluído! ${outcome.result}`);
  };

  /**
   * Reinicia testes de um serviço
   */
  const resetServiceTests = async (serviceId: string) => {
    const service = services.value.find((s) => s.id === serviceId);
    if (!service) {
      throw new Error(`Serviço não encontrado: ${serviceId}`);
    }

    // Reinicializar estrutura de testes criando uma nova
    const { initializeServiceTests: initTests } = await import(
      "@/utils/service-skill-resolution"
    );
    service.testStructure = initTests(service);
    saveServicesToStorage();
  };

  /**
   * Obtém estrutura de testes de um serviço
   */
  const getServiceTestStructure = (serviceId: string) => {
    const service = services.value.find((s) => s.id === serviceId);
    return service?.testStructure;
  };

  /**
   * Verifica se um serviço pode iniciar testes
   */
  const canStartTests = (serviceId: string): boolean => {
    const service = services.value.find((s) => s.id === serviceId);
    return service?.status === ServiceStatus.ACEITO;
  };

  return {
    // State
    services,
    isLoading,
    isReady,
    lifecycleManager,

    // Getters
    activeServices,
    pendingServices,
    completedServices,
    servicesByGuild,

    // Basic actions
    generateServices,
    addService,
    updateServiceStatus,
    removeService,
    removeServicesByGuild,
    getServicesForGuild,

    // Lifecycle actions
    initializeLifecycleManager,
    processServiceResolutions,
    forceResolveServices,
    exportLifecycleState,
    importLifecycleState,

    // Timeline integration
    processTimeAdvance,
    scheduleServiceEvents,
    processSignedServiceResolution,
    processUnsignedServiceResolution,
    generateServicesAutomatically,

    // Storage actions
    saveServicesToStorage,
    loadServicesFromStorage,
    clearAllServices,
    initializeStore,

    // Skill test actions
    initializeServiceTests,
    processServiceSkillTest,
    applyServiceTestOutcome,
    resetServiceTests,
    getServiceTestStructure,
    canStartTests,
    // Recurrence
    applyRecurrenceToService,
  };
});
