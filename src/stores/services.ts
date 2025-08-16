import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Service, ServiceStatus } from "@/types/service";
import { ServiceStatus as ServiceStatusEnum } from "@/types/service";
import type { Guild } from "@/types/guild";
import type { GameDate, TimeAdvanceResult } from "@/types/timeline";
import { ScheduledEventType } from "@/types/timeline";
import { createGameDate } from "@/utils/date-utils";
import {
  ServiceLifecycleManager,
  applyServiceUnsignedResolution,
  type ServiceLifecycleState,
} from "@/utils/generators/serviceLifeCycle";
import { ServiceGenerator } from "@/utils/generators/serviceGenerator";
import { saveToStorage, loadFromStorage } from "@/utils/storage";
import { useTimelineStore } from "@/stores/timeline";

// Interface estendida para incluir guildId
interface ServiceWithGuild extends Service {
  guildId: string;
  resolvedAt?: Date;
}

export const useServicesStore = defineStore("services", () => {
  // State
  const services = ref<ServiceWithGuild[]>([]);
  const isLoading = ref(false);
  const lifecycleManager = ref<ServiceLifecycleManager | null>(null);

  // Getters
  const activeServices = computed(() =>
    services.value.filter(
      (service) => service.status === ServiceStatusEnum.ACEITO
    )
  );

  const pendingServices = computed(() =>
    services.value.filter(
      (service) => service.status === ServiceStatusEnum.DISPONIVEL
    )
  );

  const completedServices = computed(() =>
    services.value.filter(
      (service) =>
        service.status === ServiceStatusEnum.CONCLUIDO ||
        service.status === ServiceStatusEnum.FALHOU ||
        service.status === ServiceStatusEnum.RESOLVIDO_POR_OUTROS
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
        status === ServiceStatusEnum.CONCLUIDO ||
        status === ServiceStatusEnum.FALHOU ||
        status === ServiceStatusEnum.RESOLVIDO_POR_OUTROS
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
        (service.status === ServiceStatusEnum.CONCLUIDO ||
          service.status === ServiceStatusEnum.FALHOU ||
          service.status === ServiceStatusEnum.RESOLVIDO_POR_OUTROS) &&
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
      (s) => s.status === ServiceStatusEnum.DISPONIVEL
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
          updated.status === ServiceStatusEnum.CONCLUIDO ||
          updated.status === ServiceStatusEnum.FALHOU ||
          updated.status === ServiceStatusEnum.RESOLVIDO_POR_OUTROS
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
   * Integração com passagem de tempo do timeline
   * Processa eventos de serviços quando o tempo avança
   */
  const processTimeAdvance = async (result: TimeAdvanceResult) => {
    if (!result || !result.triggeredEvents) return;

    // Verificar eventos de serviços disparados
    const serviceEvents = result.triggeredEvents.filter(
      (event) =>
        event.type === ScheduledEventType.NEW_SERVICES ||
        event.type === ScheduledEventType.SERVICE_RESOLUTION
    );

    // Processar cada evento de serviço
    for (const event of serviceEvents) {
      switch (event.type) {
        case ScheduledEventType.NEW_SERVICES:
          // Processar geração de novos serviços
          // TODO: Implementar lógica de geração automática de novos serviços
          break;

        case ScheduledEventType.SERVICE_RESOLUTION:
          // Processar resoluções de serviços
          // TODO: Implementar lógica de resolução automática
          break;
      }
    }

    // Processar resoluções baseado na data atual do jogo
    if (result.newDate) {
      const resolutionResults = await processServiceResolutions(result.newDate);

      // Informar sobre resoluções automáticas se houver
      if (resolutionResults.resolvedServices.length > 0) {
        // TODO: Adicionar notificação via toast sobre resoluções
      }
    }
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

    // Storage actions
    saveServicesToStorage,
    loadServicesFromStorage,
    clearAllServices,
  };
});
