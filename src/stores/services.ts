import { defineStore } from "pinia";
import { ref, computed } from "vue";
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
import { saveToStorage, loadFromStorage } from "@/utils/storage";
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

  // State
  const services = ref<ServiceWithGuild[]>([]);
  const isLoading = ref(false);
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
      // Usar a data atual da timeline da guilda em vez de data padrão
      const timelineStore = useTimelineStore();
      timelineStore.setCurrentGuild(guild.id);
      const currentDate =
        timelineStore.currentGameDate || createGameDate(1, 1, 2025);

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

      saveServicesToStorage();

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
  const saveServicesToStorage = () => {
    saveToStorage("services-store", {
      services: services.value,
      lifecycleState: exportLifecycleState(),
    });
  };

  const loadServicesFromStorage = (currentDate?: GameDate) => {
    const data = loadFromStorage<{
      services: ServiceWithGuild[];
      lifecycleState: ServiceLifecycleState | null;
    }>("services-store");

    if (data) {
      services.value = data.services || [];
      if (data.lifecycleState && currentDate) {
        importLifecycleState(data.lifecycleState, currentDate);
      }
    }
  };

  const clearAllServices = () => {
    services.value = [];
    lifecycleManager.value = null;
    saveServicesToStorage();
  };

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
      successMessage: (count) => ({
        title: "Resolução de Serviços Aceitos por Outros",
        message: `${count} serviço(s) aceito(s) por outros aventureiros foi(ram) processado(s)`,
      }),
    };

    applyAutomaticResolution(
      services.value,
      resolutionConfig,
      () => currentGuildId.value,
      (updatedItems) => {
        services.value = updatedItems;
      },
      saveServicesToStorage,
      success
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

      // Notificação opcional
      success(
        `Taxa de recorrência aplicada: ${bonusAppliedCount} serviço(s) recebeu(ram) bônus por não serem resolvidos`
      );
    }
  };
  const processUnsignedServiceResolution = () => {
    const resolutionConfig: ResolutionConfig<ServiceWithGuild> = {
      statusFilter: (s) => s.status === ServiceStatus.DISPONIVEL,
      resolutionFunction: (items) =>
        applyServiceUnsignedResolution(
          items as Service[]
        ) as ServiceWithGuild[],
      successMessage: (count) => ({
        title: "Resolução de Serviços Não Assinados",
        message: `${count} serviço(s) não assinado(s) foi(ram) processado(s)`,
      }),
    };

    applyAutomaticResolution(
      services.value,
      resolutionConfig,
      () => currentGuildId.value,
      (updatedItems) => {
        services.value = updatedItems;
      },
      saveServicesToStorage,
      success
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
      quantity: 1,
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

      success(
        "Novos Serviços Gerados",
        `${result.services.length} novo(s) serviço(s) foi(ram) disponibilizado(s)`
      );
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

    // Skill test actions
    initializeServiceTests,
    processServiceSkillTest,
    applyServiceTestOutcome,
    resetServiceTests,
    getServiceTestStructure,
    canStartTests,
  };
});
