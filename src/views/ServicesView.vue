<template>
  <div class="space-y-6">
    <div class="text-center">
      <h1
        class="text-3xl font-medieval font-bold text-gold-400 mb-4 flex items-center justify-center gap-3"
      >
        <WrenchScrewdriverIcon class="w-7 h-7 text-gold-400" />
        Serviços da Guilda
        <Tooltip
          content="Sistema completo de geração e gerenciamento de serviços para aventureiros com valores dinâmicos baseados na sede da guilda."
          title="Sistema de Serviços"
          position="auto"
        >
          <InfoButton
            help-key="service-overview"
            @open-help="handleOpenHelp"
            button-class="ml-2"
          />
        </Tooltip>
      </h1>
      <p class="text-lg text-gray-300 mb-8">
        Gerencie serviços da sede da guilda atual
      </p>
    </div>

    <!-- Aviso quando não há guilda -->
    <div
      v-if="!guild"
      class="text-center bg-red-900/20 border border-red-600/50 rounded-lg p-8"
    >
      <ExclamationTriangleIcon class="w-16 h-16 text-red-400 mx-auto mb-4" />
      <h2 class="text-xl font-semibold text-red-400 mb-2">
        Nenhuma Guilda Encontrada
      </h2>
      <p class="text-gray-300 mb-6">
        Para gerar serviços, você precisa primeiro ter uma guilda ativa. Acesse
        a página de Guildas para gerar uma nova sede.
      </p>
      <router-link
        to="/guild"
        class="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
      >
        <PlusIcon class="w-4 h-4 mr-2" />
        Gerar Nova Guilda
      </router-link>
    </div>

    <!-- Serviços (só mostra se há guilda) -->
    <template v-if="guild">
      <!-- Info da Guilda Atual -->
      <div
        class="bg-gradient-to-r from-blue-900/20 to-indigo-900/20 border border-blue-600/50 rounded-lg p-6"
      >
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-xl font-semibold text-blue-400 flex items-center">
            <BuildingOfficeIcon class="w-5 h-5 mr-2" />
            {{ guild.name }}
          </h3>
          <span
            class="text-sm px-3 py-1 bg-blue-600 text-blue-100 rounded-full"
          >
            {{ guild.settlementType }}
          </span>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div class="flex flex-col">
            <span class="text-gray-400 uppercase tracking-wide text-lg"
              >Sede</span
            >
            <span class="text-white font-medium text-base">{{
              guild.structure.size
            }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-gray-400 uppercase tracking-wide text-lg"
              >Recursos</span
            >
            <span class="text-white font-medium text-base">{{
              guild.resources.level || guild.resources
            }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-gray-400 uppercase tracking-wide text-lg"
              >População</span
            >
            <span class="text-white font-medium text-base">{{
              guild.relations.population
            }}</span>
          </div>
          <div class="flex flex-col">
            <span class="text-gray-400 uppercase tracking-wide text-lg"
              >Governo</span
            >
            <span class="text-white font-medium text-base">{{
              guild.relations.government
            }}</span>
          </div>
        </div>
      </div>

      <!-- Filtros Avançados -->
      <ServiceFiltersComponent
        v-if="allServices.length > 0"
        :filters="activeFilters"
        :services="allServices"
        @update:filters="handleFiltersChange"
        @close="() => {}"
        @filtered="handleFilteredPayload"
      />

      <!-- Timeline e Controles -->
      <ServiceTimeline
        @generate-services="handleGenerateServices"
        @force-resolution="handleForceResolution"
        @open-help="handleOpenHelp"
      />
    </template>

    <!-- Filtros (sidebar quando visível) -->
    <Transition
      enter-active-class="transition-transform duration-300 ease-out"
      enter-from-class="transform translate-x-full"
      enter-to-class="transform translate-x-0"
      leave-active-class="transition-transform duration-300 ease-in"
      leave-from-class="transform translate-x-0"
      leave-to-class="transform translate-x-full"
    >
      <div
        v-if="showFilters"
        class="fixed right-0 top-0 h-full w-96 bg-white shadow-2xl z-40 overflow-y-auto"
      >
        <ServiceFiltersComponent
          :filters="activeFilters"
          :services="allServices"
          @update:filters="handleFiltersChange"
          @close="showFilters = false"
          @filtered="handleFilteredPayload"
        />
      </div>
    </Transition>

    <!-- Lista de Serviços -->
    <ServiceList
      :services="filteredServices"
      :is-loading="isLoading"
      :active-status-filter="activeStatusFilter"
      :current-page="currentPage"
      :has-active-filters="hasActiveFilters"
      @view-details="showServiceDetails"
      @accept="handleAcceptService"
      @start-tests="handleStartTests"
      @continue-tests="handleContinueTests"
      @reset-tests="handleResetTests"
      @complete="handleCompleteService"
      @abandon="handleAbandonService"
      @filter-status="handleStatusFilter"
      @clear-filters="handleClearFilters"
      @page-change="handlePageChange"
    />

    <!-- Modal de Detalhes -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="selectedService"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          @click.self="closeServiceDetails"
        >
          <div class="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <ServiceDetails
              :service="selectedService"
              @accept="handleAcceptService"
              @start-tests="handleStartTests"
              @continue-tests="handleContinueTests"
              @reset-tests="handleResetTests"
              @complete="handleCompleteService"
              @abandon="handleAbandonService"
              @close="closeServiceDetails"
            />
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Modal de Sistema de Testes -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showTestsModal && serviceForTests"
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
          @click.self="closeTestsModal"
        >
          <div class="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ServiceSkillTests
              :service="serviceForTests"
              @test:completed="handleTestCompleted"
              @tests:finished="handleTestsFinished"
              @service:complete="handleServiceComplete"
              @tests:reset="handleTestsReset"
              @close="closeTestsModal"
            />
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Toggle para mostrar/ocultar filtros -->
    <div class="fixed bottom-4 right-4">
      <button
        @click="showFilters = !showFilters"
        class="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-colors"
        :title="showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'"
      >
        <FunnelIcon class="w-5 h-5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import {
  WrenchScrewdriverIcon,
  FunnelIcon,
  BuildingOfficeIcon,
  PlusIcon,
  ExclamationTriangleIcon,
} from "@heroicons/vue/24/outline";
import { useToast } from "@/composables/useToast";
import { useServicesStore } from "@/stores/services";
import { useGuildStore } from "@/stores/guild";
import { ServiceStatus, applyRecurrenceBonus } from "@/types/service";
import type { Service } from "@/types/service";
import type { ServiceFilters } from "@/components/services/ServiceFilters.vue";
import type { SkillTestResult } from "@/utils/service-skill-resolution";

// Definir ServiceWithGuild localmente baseado no store
interface ServiceWithGuild extends Service {
  guildId: string;
  resolvedAt?: Date;
}

import ServiceList from "@/components/services/ServiceList.vue";
import ServiceFiltersComponent from "@/components/services/ServiceFilters.vue";
import ServiceDetails from "@/components/services/ServiceDetails.vue";
import ServiceSkillTests from "@/components/services/ServiceSkillTests.vue";
import ServiceTimeline from "@/components/services/ServiceTimeline.vue";
import InfoButton from "@/components/common/InfoButton.vue";
import Tooltip from "@/components/common/Tooltip.vue";

// Stores & Composables
const servicesStore = useServicesStore();
const guildStore = useGuildStore();
const { success, error } = useToast();

// State
const showFilters = ref(false);
const activeFilters = ref<Partial<ServiceFilters>>({});
const filteredServicesState = ref<ServiceWithGuild[] | null>(null);
const activeStatusFilter = ref<string | undefined>(undefined);
const hasActiveFilters = computed(
  () => Object.keys(activeFilters.value).length > 0
);
const currentPage = ref(1);
const isGenerating = ref(false);

// Modal states
const selectedService = ref<ServiceWithGuild | null>(null);
const showTestsModal = ref(false);
const serviceForTests = ref<ServiceWithGuild | null>(null);

// Computed
const guild = computed(() => guildStore.currentGuild);
const allServices = computed(() => {
  if (!guildStore.currentGuild) return [];
  return servicesStore.servicesByGuild[guildStore.currentGuild.id] || [];
});

const isLoading = computed(() => servicesStore.isLoading);

const filteredServices = computed(() => {
  if (filteredServicesState.value) return filteredServicesState.value;

  let services = [...allServices.value];

  // Aplicar filtro de status rápido
  if (activeStatusFilter.value) {
    services = services.filter(
      (service) => service.status === activeStatusFilter.value
    );
  }

  // Aplicar filtros avançados
  if (hasActiveFilters.value) {
    services = applyAdvancedFilters(services);
  }

  return services;
});

// Functions
const applyAdvancedFilters = (
  services: ServiceWithGuild[]
): ServiceWithGuild[] => {
  return services.filter(() => {
    // Aplicar filtros baseados em activeFilters.value
    // Implementação dos filtros avançados aqui
    return true; // Placeholder por enquanto
  });
};

// Actions
const handleGenerateServices = async () => {
  if (!guildStore.currentGuild) return;
  try {
    isGenerating.value = true;
    await servicesStore.generateServices(guildStore.currentGuild, 3);
    success("Serviços gerados com sucesso!");
  } catch (err) {
    error("Erro ao gerar serviços:", String(err));
  } finally {
    isGenerating.value = false;
  }
};

const handleAcceptService = async (service: Service) => {
  try {
    servicesStore.updateServiceStatus(service.id, ServiceStatus.ACEITO);
    success(`Serviço "${service.title}" aceito com sucesso!`);
    closeServiceDetails();
  } catch (err) {
    error("Erro ao aceitar serviço:", String(err));
  }
};

const handleStartTests = async (service: Service) => {
  try {
    await servicesStore.initializeServiceTests(service.id);
    serviceForTests.value = service as ServiceWithGuild;
    showTestsModal.value = true;
    closeServiceDetails();
  } catch (err) {
    error("Erro ao inicializar testes:", String(err));
  }
};

const handleContinueTests = (service: Service) => {
  serviceForTests.value = service as ServiceWithGuild;
  showTestsModal.value = true;
  closeServiceDetails();
};

const handleResetTests = async (service: Service) => {
  try {
    await servicesStore.resetServiceTests(service.id);
    success("Testes reiniciados com sucesso!");
  } catch (err) {
    error("Erro ao reiniciar testes:", String(err));
  }
};

const handleCompleteService = (service: Service) => {
  try {
    servicesStore.updateServiceStatus(service.id, ServiceStatus.CONCLUIDO);
    success(`Serviço "${service.title}" concluído com sucesso!`);
    closeServiceDetails();
  } catch (err) {
    error("Erro ao concluir serviço:", String(err));
  }
};

const handleAbandonService = (service: Service) => {
  try {
    // Aplicar bônus de recorrência primeiro (se aplicável)
    const updatedService = applyRecurrenceBonus(service);

    // Encontrar o serviço no store e atualizá-lo
    const serviceIndex = servicesStore.services.findIndex(
      (s) => s.id === service.id
    );
    if (serviceIndex !== -1) {
      // Atualizar o serviço no array do store
      Object.assign(servicesStore.services[serviceIndex], {
        ...updatedService,
        status: ServiceStatus.DISPONIVEL,
      });
    }

    // Salvar alterações no storage
    servicesStore.saveServicesToStorage();

    success(
      `Serviço "${service.title}" abandonado. Taxa de recorrência aplicada.`
    );
    closeServiceDetails();
  } catch (err) {
    error("Erro ao abandonar serviço:", String(err));
  }
};

const showServiceDetails = (service: Service) => {
  selectedService.value = service as ServiceWithGuild;
};

const closeServiceDetails = () => {
  selectedService.value = null;
};

const closeTestsModal = () => {
  showTestsModal.value = false;
  serviceForTests.value = null;
};

const handleTestCompleted = (result: SkillTestResult) => {
  if (result.success) {
    success(
      `Teste ${result.testIndex + 1} bem-sucedido! (Rolou ${result.rollResult} vs ND ${result.finalND})`
    );
  } else {
    error(
      `Teste ${result.testIndex + 1} falhou! (Rolou ${result.rollResult} vs ND ${result.finalND})`
    );
  }
};

const handleTestsFinished = () => {
  success(
    "Todos os testes foram concluídos! Você pode revisar os resultados ou reiniciar os testes."
  );
};

const handleServiceComplete = (service: Service) => {
  handleCompleteService(service);
  closeTestsModal();
};

const handleTestsReset = () => {
  success("Testes reiniciados!");
};

const handleStatusFilter = (status: string | null) => {
  activeStatusFilter.value = status || undefined;
};

const handleFiltersChange = (filters: Partial<ServiceFilters>) => {
  activeFilters.value = filters;
  filteredServicesState.value = null;
};

const handleFilteredPayload = (services: Service[]) => {
  filteredServicesState.value = services as ServiceWithGuild[];
};

const handleClearFilters = () => {
  activeFilters.value = {};
  activeStatusFilter.value = undefined;
};

const handlePageChange = (page: number) => {
  currentPage.value = page;
};

const handleOpenHelp = (helpKey: string) => {
  // Implementação da ajuda - placeholder por enquanto
  // eslint-disable-next-line no-console
  console.log("Help requested for:", helpKey);
};

const handleForceResolution = async () => {
  // Implementação da resolução forçada - placeholder por enquanto
  // eslint-disable-next-line no-console
  console.log("Force resolution requested for services");
};

// Lifecycle
onMounted(async () => {
  try {
    await servicesStore.loadServicesFromStorage();
  } catch (err) {
    error("Erro ao carregar serviços:", String(err));
  }
});
</script>

<style scoped></style>
