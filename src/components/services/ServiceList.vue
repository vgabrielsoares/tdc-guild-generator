<template>
  <div class="service-list space-y-4">
    <!-- Lista de serviços e tudo relacionado só aparecem se houver guilda atual -->
    <template v-if="hasCurrentGuild">
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
            'px-3 py-1 rounded-full text-sm font-medium transition-colors',
            activeStatusFilter === status.value
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
          ]"
        >
          {{ status.label }}
          <span v-if="status.count > 0" class="ml-1">
            ({{ status.count }})
          </span>
        </button>
      </div>

      <!-- Paginação (top) -->
      <Pagination
        v-if="props.showPagination && totalPages > 1"
        :current-page="props.currentPage"
        :total-pages="totalPages"
        @page-change="$emit('page-change', $event)"
      />

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
    </template>

    <!-- Loading state -->
    <div v-else-if="isLoading" class="text-center py-8">
      <div
        class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto mb-4"
      ></div>
      <p class="text-gray-400">Carregando serviços...</p>
    </div>

    <!-- Paginação (bottom) -->
    <Pagination
      v-if="props.showPagination && totalPages > 1"
      :current-page="props.currentPage"
      :total-pages="totalPages"
      @page-change="$emit('page-change', $event)"
    />

    <!-- Informações de performance -->
    <div
      v-if="showPerformanceInfo && totalServices > 0"
      class="text-center pt-4 border-t border-gray-700"
    >
      <p class="text-xs text-gray-500">
        Mostrando {{ Math.min(itemsPerPage, filteredServices.length) }} de
        {{ totalServices }} serviços
        {{ hasFilters ? "(filtrados)" : "" }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import Pagination from "@/components/common/Pagination.vue";
import { WrenchScrewdriverIcon } from "@heroicons/vue/24/outline";
import type { Service } from "@/types/service";
import { ServiceStatus } from "@/types/service";
import ServiceCard from "./ServiceCard.vue";
import { useGuildStore } from "@/stores/guild";
import { useServicesStore } from "@/stores/services";
import type { Service as ServiceType } from "@/types/service";

type ServiceWithGuild = ServiceType & { guildId: string };

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
  showPagination?: boolean;
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
  showPagination: true,
});

// Guilda atual
const guildStore = useGuildStore();
const hasCurrentGuild = computed(() => !!guildStore.currentGuild);

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

const servicesStore = useServicesStore();
const currentGuildId = computed(() => guildStore.currentGuild?.id || "");

// Computed
// quando `props.services` for fornecida (por exemplo, filtros aplicados pelo parent),
// use-a diretamente; caso contrário, fallback para os serviços do store
const guildServices = computed(() => {
  // Se o parent forneceu explicitamente a lista (mesmo que vazia), respeitamos isso.
  if (props.services && Array.isArray(props.services)) {
    return props.services as ServiceWithGuild[];
  }

  return servicesStore.services.filter(
    (s: ServiceWithGuild) => s.guildId === currentGuildId.value
  );
});

const totalServices = computed(() => guildServices.value.length);

// Filtrar usando a lista canônica (garante consistência entre contagens e filtros)
const filteredServices = computed(() => {
  if (props.activeStatusFilter) {
    return guildServices.value.filter(
      (service) => service.status === props.activeStatusFilter
    );
  }
  return guildServices.value;
});

const totalPages = computed(() => {
  return Math.max(
    1,
    Math.ceil(filteredServices.value.length / props.itemsPerPage)
  );
});

// Página efetiva (clamp): evita slices fora do intervalo quando o parent não resetou a página
const effectivePage = computed(() =>
  Math.min(Math.max(1, props.currentPage), totalPages.value)
);

const paginatedServices = computed(() => {
  const start = (effectivePage.value - 1) * props.itemsPerPage;
  const end = start + props.itemsPerPage;
  return filteredServices.value.slice(start, end);
});

// Se o effectivePage difere do prop currentPage, notifica o parent para manter a UI consistente
watch(
  () => effectivePage.value,
  (page) => {
    if (page !== props.currentPage) {
      emit("page-change", page);
    }
  },
  { immediate: false }
);

// Quando um filtro rápido é ativado, é desejável voltar para a primeira página
watch(
  () => props.activeStatusFilter,
  (newVal, oldVal) => {
    if (newVal !== oldVal) emit("page-change", 1);
  }
);

// Status filters para os botões rápidos — calcular a partir dos serviços da guilda atual
const statusFilters = computed(() => {
  const statusCounts = new Map<string, number>();

  // Pegar serviços da guilda atual a partir do store (fonte canônica)
  const guildServices = servicesStore.services.filter(
    (s: ServiceWithGuild) => s.guildId === currentGuildId.value
  );

  // Contar serviços por status
  guildServices.forEach((service: ServiceWithGuild) => {
    const count = statusCounts.get(service.status) || 0;
    statusCounts.set(service.status, count + 1);
  });

  const filters: { value: string; label: string; count: number }[] = [
    { value: "", label: "Todos", count: guildServices.length },
  ];

  // Adicionar apenas status que possuem pelo menos um serviço nessa guilda
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
