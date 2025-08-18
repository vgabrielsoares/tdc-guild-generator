<template>
  <div class="service-list space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <WrenchScrewdriverIcon class="w-6 h-6 text-blue-400" />
        <h3 class="text-xl font-semibold text-blue-400">Lista de Serviços</h3>
        <span v-if="totalServices > 0" class="text-sm text-gray-400">
          ({{ filteredServices.length }} de {{ totalServices }})
        </span>
      </div>
    </div>

    <!-- Filtros rápidos -->
    <div v-if="showFilters" class="flex flex-wrap gap-2">
      <button
        v-for="(status, index) in statusFilters"
        :key="status.value || `all-${index}`"
        @click="$emit('filter-status', status.value)"
        :class="[
          'px-3 py-1 rounded-full text-xs font-medium transition-colors',
          activeStatusFilter === status.value
            ? 'bg-blue-600 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
        ]"
      >
        {{ status.label }}
        <span v-if="status.count > 0" class="ml-1"> ({{ status.count }}) </span>
      </button>
    </div>

    <!-- Lista de serviços -->
    <div v-if="filteredServices.length > 0" class="space-y-3">
      <div
        v-for="service in paginatedServices"
        :key="service.id"
        class="transition-all duration-200"
      >
        <ServiceCard
          :service="service"
          :show-actions="showActions"
          @accept="handleAccept"
          @start-tests="handleStartTests"
          @continue-tests="handleContinueTests"
          @complete="handleComplete"
          @abandon="handleAbandon"
          @view-details="handleViewDetails"
          @open-help="$emit('open-help', $event)"
        />
      </div>
    </div>

    <!-- Estado vazio -->
    <div v-else-if="!isLoading" class="text-center py-8">
      <WrenchScrewdriverIcon class="w-16 h-16 text-gray-500 mx-auto mb-4" />
      <h4 class="text-lg font-medium text-gray-400 mb-2">
        Nenhum serviço encontrado
      </h4>
      <p class="text-gray-500 mb-4">
        {{ emptyStateMessage }}
      </p>
      <div class="flex items-center justify-center gap-2">
        <button
          v-if="hasFilters"
          @click="$emit('clear-filters')"
          class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          Limpar Filtros
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-else-if="isLoading" class="text-center py-8">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"
      ></div>
      <p class="text-gray-400">Carregando serviços...</p>
    </div>

    <!-- Paginação -->
    <div
      v-if="totalPages > 1"
      class="flex items-center justify-center gap-2 pt-4"
    >
      <button
        @click="$emit('page-change', currentPage - 1)"
        :disabled="currentPage === 1"
        class="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
      >
        Anterior
      </button>

      <span class="text-gray-400 text-sm">
        Página {{ currentPage }} de {{ totalPages }}
      </span>

      <button
        @click="$emit('page-change', currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="px-3 py-1 bg-gray-700 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
      >
        Próxima
      </button>
    </div>

    <!-- Informações de performance -->
    <div
      v-if="showPerformanceInfo && totalServices > 0"
      class="text-center pt-4 border-t border-gray-700"
    >
      <p class="text-xs text-gray-500">
        Mostrando {{ Math.min(itemsPerPage, filteredServices.length) }} de
        {{ filteredServices.length }} serviços
        {{ hasFilters ? "(filtrados)" : "" }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { WrenchScrewdriverIcon } from "@heroicons/vue/24/outline";
import type { Service } from "@/types/service";
import { ServiceStatus } from "@/types/service";
import ServiceCard from "./ServiceCard.vue";

// Props
interface Props {
  services: Service[];
  isLoading?: boolean;
  showActions?: boolean;
  showFilters?: boolean;
  activeStatusFilter?: string;
  hasActiveFilters?: boolean;
  hasFilters?: boolean;
  currentPage?: number;
  itemsPerPage?: number;
  emptyStateMessage?: string;
  showPerformanceInfo?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  showActions: true,
  showFilters: true,
  activeStatusFilter: "",
  hasFilters: false,
  currentPage: 1,
  itemsPerPage: 10,
  emptyStateMessage: "Nenhum serviço disponível no momento.",
  showPerformanceInfo: false,
});

// Emits
const emit = defineEmits<{
  accept: [service: Service];
  "start-tests": [service: Service];
  "continue-tests": [service: Service];
  complete: [service: Service];
  abandon: [service: Service];
  "view-details": [service: Service];
  "open-help": [key: string];
  "filter-status": [status: string];
  "clear-filters": [];
  "page-change": [page: number];
}>();

// Computed
const totalServices = computed(() => props.services.length);

const filteredServices = computed(() => {
  // Se há um filtro de status ativo, aplica o filtro
  if (props.activeStatusFilter) {
    return props.services.filter(
      (service) => service.status === props.activeStatusFilter
    );
  }
  return props.services;
});

const totalPages = computed(() => {
  return Math.ceil(filteredServices.value.length / props.itemsPerPage);
});

const paginatedServices = computed(() => {
  const start = (props.currentPage - 1) * props.itemsPerPage;
  const end = start + props.itemsPerPage;
  return filteredServices.value.slice(start, end);
});

// Status filters para os botões rápidos
const statusFilters = computed(() => {
  const statusCounts = new Map<string, number>();

  // Contar serviços por status
  props.services.forEach((service) => {
    const count = statusCounts.get(service.status) || 0;
    statusCounts.set(service.status, count + 1);
  });

  const filters = [{ value: "", label: "Todos", count: totalServices.value }];

  // Adicionar apenas status que existem
  Object.values(ServiceStatus).forEach((status) => {
    const count = statusCounts.get(status) || 0;
    if (count > 0) {
      filters.push({
        value: status,
        label: getStatusLabel(status),
        count,
      });
    }
  });

  return filters;
});

// Helper para obter label do status
const getStatusLabel = (status: ServiceStatus): string => {
  switch (status) {
    case ServiceStatus.DISPONIVEL:
      return "Disponíveis";
    case ServiceStatus.ACEITO:
      return "Aceitos";
    case ServiceStatus.EM_ANDAMENTO:
      return "Em Andamento";
    case ServiceStatus.CONCLUIDO:
      return "Concluídos";
    case ServiceStatus.FALHOU:
      return "Falharam";
    case ServiceStatus.EXPIRADO:
      return "Expirados";
    default:
      return status;
  }
};

// Event handlers
const handleAccept = (service: Service) => {
  emit("accept", service);
};

const handleStartTests = (service: Service) => {
  emit("start-tests", service);
};

const handleContinueTests = (service: Service) => {
  emit("continue-tests", service);
};

const handleComplete = (service: Service) => {
  emit("complete", service);
};

const handleAbandon = (service: Service) => {
  emit("abandon", service);
};

const handleViewDetails = (service: Service) => {
  emit("view-details", service);
};
</script>

<style scoped>
/* Estilização específica para lista de serviços */
</style>
