<template>
  <div class="contract-list space-y-4">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-3">
        <DocumentTextIcon class="w-6 h-6 text-amber-400" />
        <h3 class="text-xl font-semibold text-amber-400">Lista de Contratos</h3>
        <span v-if="totalContracts > 0" class="text-sm text-gray-400">
          ({{ filteredContracts.length }} de {{ totalContracts }})
        </span>
      </div>
    </div>

    <!-- Filtros rápidos -->
    <div v-if="showFilters" class="flex flex-wrap gap-2">
      <button
        v-for="(status, index) in statusFilters"
        :key="status.value ?? `all-${index}`"
        @click="onQuickFilter(status.value)"
        :class="[
          'px-3 py-1 rounded-full text-sm font-medium transition-colors',
          (activeStatusFilter ?? '') === (status.value ?? '')
            ? 'bg-amber-600 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
        ]"
      >
        {{ status.label }}
        <span v-if="status.count > 0" class="ml-1"> ({{ status.count }}) </span>
      </button>
    </div>

    <!-- Lista de contratos -->
    <div v-if="filteredContracts.length > 0" class="space-y-3">
      <div
        v-for="contract in paginatedContracts"
        :key="contract.id"
        class="transition-all duration-200"
      >
        <ContractCard
          :contract="contract"
          :show-actions="showActions"
          @accept="handleAccept"
          @complete="handleComplete"
          @abandon="handleAbandon"
          @view-details="handleViewDetails"
          @open-help="$emit('open-help', $event)"
        />
      </div>
    </div>

    <!-- Estado vazio -->
    <div v-else-if="!isLoading" class="text-center py-8">
      <DocumentTextIcon class="w-16 h-16 text-gray-500 mx-auto mb-4" />
      <h4 class="text-lg font-medium text-gray-400 mb-2">
        Nenhum contrato encontrado
      </h4>
      <p class="text-gray-500 mb-4">
        {{ emptyStateMessage }}
      </p>
      <div class="flex items-center justify-center gap-2">
        <button
          v-if="canGenerate"
          @click="$emit('generate')"
          class="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
        >
          Gerar Contratos
        </button>
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="isLoading" class="text-center py-8">
      <ArrowPathIcon
        class="w-12 h-12 text-amber-400 mx-auto animate-spin mb-4"
      />
      <p class="text-gray-400">Gerando contratos...</p>
    </div>

    <!-- Paginação -->
    <div
      v-if="totalPages > 1"
      class="flex items-center justify-center gap-2 mt-6"
    >
      <button
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage <= 1"
        class="px-3 py-1 bg-gray-700 text-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
      >
        Anterior
      </button>

      <span class="px-3 py-1 text-gray-400">
        {{ currentPage }} de {{ totalPages }}
      </span>

      <button
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage >= totalPages"
        class="px-3 py-1 bg-gray-700 text-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
      >
        Próxima
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Contract } from "@/types/contract";
import { ContractStatus } from "@/types/contract";
import ContractCard from "./ContractCard.vue";
import { DocumentTextIcon, ArrowPathIcon } from "@heroicons/vue/24/outline";

interface Props {
  contracts: Contract[];
  isLoading?: boolean;
  showActions?: boolean;
  showFilters?: boolean;
  canGenerate?: boolean;
  allContracts?: Contract[];
  activeStatusFilter?: string;
  currentPage?: number;
  pageSize?: number;
}

interface Emits {
  accept: [contract: Contract];
  complete: [contract: Contract];
  abandon: [contract: Contract];
  "view-details": [contract: Contract];
  regenerate: [];
  generate: [];
  "filter-status": [status: string];
  "page-change": [page: number];
  "open-help": [helpKey: string];
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  showActions: true,
  showFilters: true,
  canGenerate: true,
  activeStatusFilter: "",
  currentPage: 1,
  pageSize: 10,
});

const emit = defineEmits<Emits>();

// ===== COMPUTED =====

const totalContracts = computed(() =>
  props.allContracts ? props.allContracts.length : props.contracts.length
);

const filteredContracts = computed(() => {
  // O filtro de status usa string vazia ('') para "Todos"
  if (!props.activeStatusFilter) {
    return props.contracts;
  }
  return props.contracts.filter((c) => c.status === props.activeStatusFilter);
});

const totalPages = computed(() => {
  return Math.ceil(filteredContracts.value.length / props.pageSize);
});

const paginatedContracts = computed(() => {
  const start = (props.currentPage - 1) * props.pageSize;
  const end = start + props.pageSize;
  return filteredContracts.value.slice(start, end);
});

const statusFilters = computed(() => {
  const statusCounts: Record<string, number> = {};
  // Use allContracts (sem filtros) quando disponível, senão use props.contracts
  const source = props.allContracts ?? props.contracts;
  source.forEach((contract) => {
    statusCounts[contract.status] = (statusCounts[contract.status] || 0) + 1;
  });
  // Sempre mostra o botão "Todos" com o total sem filtros
  const filters = [
    {
      label: "Todos",
      value: "",
      count: source.length,
    },
  ];
  if (statusCounts[ContractStatus.DISPONIVEL]) {
    filters.push({
      label: "Disponíveis",
      value: ContractStatus.DISPONIVEL,
      count: statusCounts[ContractStatus.DISPONIVEL],
    });
  }
  if (statusCounts[ContractStatus.ACEITO]) {
    filters.push({
      label: "Aceitos",
      value: ContractStatus.ACEITO,
      count: statusCounts[ContractStatus.ACEITO],
    });
  }
  if (statusCounts[ContractStatus.EM_ANDAMENTO]) {
    filters.push({
      label: "Em Andamento",
      value: ContractStatus.EM_ANDAMENTO,
      count: statusCounts[ContractStatus.EM_ANDAMENTO],
    });
  }
  if (statusCounts[ContractStatus.CONCLUIDO]) {
    filters.push({
      label: "Concluídos",
      value: ContractStatus.CONCLUIDO,
      count: statusCounts[ContractStatus.CONCLUIDO],
    });
  }
  if (statusCounts[ContractStatus.FALHOU]) {
    filters.push({
      label: "Falharam",
      value: ContractStatus.FALHOU,
      count: statusCounts[ContractStatus.FALHOU],
    });
  }
  return filters;
});

const emptyStateMessage = computed(() => {
  if (props.activeStatusFilter) {
    return `Nenhum contrato com status "${props.activeStatusFilter}" encontrado.`;
  }
  return "Ainda não há contratos disponíveis. Gere alguns contratos para começar.";
});

// ===== METHODS =====

function handleAccept(contract: Contract) {
  emit("accept", contract);
}

function handleComplete(contract: Contract) {
  emit("complete", contract);
}

function handleAbandon(contract: Contract) {
  emit("abandon", contract);
}

function handleViewDetails(contract: Contract) {
  emit("view-details", contract);
}

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    emit("page-change", page);
  }
}

function onQuickFilter(value: string) {
  // Toggle behavior: se já está selecionado, limpa (''), caso contrário aplica
  const newValue =
    (props.activeStatusFilter ?? "") === (value ?? "") ? "" : (value ?? "");
  emit("filter-status", newValue);
}
</script>
