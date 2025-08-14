import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Service, ServiceStatus } from "@/types/service";
import { ServiceStatus as ServiceStatusEnum } from "@/types/service";
import type { Guild } from "@/types/guild";
import type { GameDate } from "@/types/timeline";
import {
  ServiceLifecycleManager,
  applyServiceUnsignedResolution,
  type ServiceLifecycleState,
} from "@/utils/generators/serviceLifeCycle";
import { saveToStorage, loadFromStorage } from "@/utils/storage";

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
      lifecycleManager.value.scheduleNextResolutions(
        new Date(currentDate.year, currentDate.month - 1, currentDate.day)
      );
    }
  };

  const generateServices = async (guild: Guild, quantity?: number) => {
    isLoading.value = true;
    try {
      // eslint-disable-next-line no-console
      console.log(
        "[SERVICES STORE] Generate services - to be implemented in Issue 5.22"
      );
      // This will be implemented in the main services generation issue
      // Avoid unused parameter warnings
      void guild;
      void quantity;
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

  const loadServicesFromStorage = (currentDate: GameDate) => {
    const data = loadFromStorage<{
      services: ServiceWithGuild[];
      lifecycleState: ServiceLifecycleState | null;
    }>("services-store");

    if (data) {
      services.value = data.services || [];
      if (data.lifecycleState) {
        importLifecycleState(data.lifecycleState, currentDate);
      }
    }
  };

  const clearAllServices = () => {
    services.value = [];
    lifecycleManager.value = null;
    saveServicesToStorage();
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

    // Storage actions
    saveServicesToStorage,
    loadServicesFromStorage,
    clearAllServices,
  };
});
