<template>
  <div class="contract-filters bg-gray-800 rounded-lg border border-gray-700 p-4 space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-amber-400 flex items-center gap-2">
        <FunnelIcon class="w-5 h-5" />
        Filtros de Contratos
      </h3>
      <button @click="clearAllFilters" class="text-sm text-gray-400 hover:text-white transition-colors underline">
        Limpar Filtros
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <!-- Filtro por Status -->
      <div class="filter-group">
        <label class="filter-label">Status</label>
        <select :value="filters.status" @change="
          updateStatusFilter(($event.target as HTMLSelectElement).value)
          " class="filter-select">
          <option value="">Todos os status</option>
          <option v-for="status in statusOptions" :key="status.value" :value="status.value">
            {{ status.label }}
            {{ formatCount(status.totalCount, status.filteredCount) }}
          </option>
        </select>
      </div>

      <!-- Filtro por Dificuldade -->
      <div class="filter-group">
        <label class="filter-label">Dificuldade</label>
        <select :value="filters.difficulty" @change="
          updateDifficultyFilter(($event.target as HTMLSelectElement).value)
          " class="filter-select">
          <option value="">Todas as dificuldades</option>
          <option v-for="difficulty in difficultyOptions" :key="difficulty.value" :value="difficulty.value">
            {{ difficulty.label }}
            {{ formatCount(difficulty.totalCount, difficulty.filteredCount) }}
          </option>
        </select>
      </div>

      <!-- Filtro por Contratante -->
      <div class="filter-group">
        <label class="filter-label">Contratante</label>
        <select :value="filters.contractor" @change="
          updateContractorFilter(($event.target as HTMLSelectElement).value)
          " class="filter-select">
          <option value="">Todos os contratantes</option>
          <option v-for="contractor in contractorOptions" :key="contractor.value" :value="contractor.value">
            {{ contractor.label }}
            {{ formatCount(contractor.totalCount, contractor.filteredCount) }}
          </option>
        </select>
      </div>

      <!-- Filtro por Prazo -->
      <div class="filter-group">
        <label class="filter-label">Prazo</label>
        <select :value="deadlineFilterValue" @change="
          updateDeadlineFilter(($event.target as HTMLSelectElement).value)
          " class="filter-select">
          <option value="">Todos os prazos</option>
          <option value="with-deadline">
            Com prazo
            {{
              formatCount(
                contractsWithDeadlineTotal,
                contractsWithDeadlineFiltered
              )
            }}
          </option>
          <option value="no-deadline">
            Sem prazo
            {{
              formatCount(
                contractsWithoutDeadlineTotal,
                contractsWithoutDeadlineFiltered
              )
            }}
          </option>
        </select>
      </div>
    </div>

    <!-- Segunda linha de filtros -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <!-- Busca por texto -->
      <div class="filter-group md:col-span-2">
        <label class="filter-label">Buscar</label>
        <div class="relative">
          <input :value="filters.searchText" @input="
            updateSearchFilter(($event.target as HTMLInputElement).value)
            " type="text" placeholder="Buscar por título, descrição, objetivo, contratante ou código..."
            class="filter-input pl-10" />
          <button v-if="filters.searchText" @click="clearSearchFilter"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Filtro por faixa de valores -->
      <div class="filter-group">
        <label class="filter-label">Recompensa (PO$)</label>
        <div class="flex gap-2">
          <input :value="filters.minValue || ''" @input="updateMinValue(($event.target as HTMLInputElement).value)"
            type="number" placeholder="Min" class="filter-input text-sm" min="0" />
          <span class="text-gray-400 self-center">-</span>
          <input :value="filters.maxValue || ''" @input="updateMaxValue(($event.target as HTMLInputElement).value)"
            type="number" placeholder="Max" class="filter-input text-sm" min="0" />
        </div>
      </div>
    </div>

    <!-- Resumo dos filtros ativos -->
    <div v-if="hasActiveFilters" class="border-t border-gray-600 pt-4">
      <h4 class="text-sm font-medium text-gray-300 mb-2">Filtros Ativos</h4>
      <div class="flex flex-wrap gap-2">
        <span v-for="activeFilter in activeFilters" :key="activeFilter.key"
          class="inline-flex items-center gap-1 px-2 py-1 bg-amber-600/20 border border-amber-600/50 rounded text-sm text-amber-200">
          {{ activeFilter.label }}
          <button @click="removeFilter(activeFilter.key)" class="text-amber-300 hover:text-white">
            <XMarkIcon class="w-3 h-3" />
          </button>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Contract } from "@/types/contract";
import {
  ContractStatus,
  ContractDifficulty,
  ContractorType,
  DeadlineType,
} from "@/types/contract";
import { getStatusLabel } from "@/utils/status-labels";
import { matchesContractCode } from "@/utils/id-search";
import { FunnelIcon, XMarkIcon } from "@heroicons/vue/24/outline";

interface ContractFilters {
  status: string;
  difficulty: string;
  contractor: string;
  searchText: string;
  minValue: number | null;
  maxValue: number | null;
  hasDeadline: boolean | null;
}

interface Props {
  contracts: Contract[];
  filters: ContractFilters;
}

interface Emits {
  "update-status": [status: string];
  "update-difficulty": [difficulty: string];
  "update-contractor": [contractor: string];
  "update-search": [search: string];
  "update-min-value": [value: number | null];
  "update-max-value": [value: number | null];
  "update-deadline": [hasDeadline: boolean | null];
  "clear-filters": [];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// ===== COMPUTED =====

// Função auxiliar para criar contratos filtrados excluindo um filtro específico
const getFilteredContractsExcluding = (
  excludeFilter: keyof ContractFilters
) => {
  let result = props.contracts;

  // Aplicar todos os filtros exceto o especificado
  if (excludeFilter !== "status" && props.filters.status) {
    result = result.filter((c) => c.status === props.filters.status);
  }

  if (excludeFilter !== "difficulty" && props.filters.difficulty) {
    result = result.filter((c) => c.difficulty === props.filters.difficulty);
  }

  if (excludeFilter !== "contractor" && props.filters.contractor) {
    result = result.filter(
      (c) => c.contractorType === props.filters.contractor
    );
  }

  if (excludeFilter !== "searchText" && props.filters.searchText.trim()) {
    const searchLower = props.filters.searchText.toLowerCase();
    const searchText = props.filters.searchText.trim();
    result = result.filter(
      (c) =>
        c.description.toLowerCase().includes(searchLower) ||
        c.title.toLowerCase().includes(searchLower) ||
        c.objective?.description?.toLowerCase().includes(searchLower) ||
        c.contractorName?.toLowerCase().includes(searchLower) ||
        c.location?.name?.toLowerCase().includes(searchLower) ||
        matchesContractCode(searchText, c.id)
    );
  }

  if (excludeFilter !== "minValue" && props.filters.minValue !== null) {
    result = result.filter(
      (c) => c.value.finalGoldReward >= props.filters.minValue!
    );
  }

  if (excludeFilter !== "maxValue" && props.filters.maxValue !== null) {
    result = result.filter(
      (c) => c.value.finalGoldReward <= props.filters.maxValue!
    );
  }

  if (excludeFilter !== "hasDeadline" && props.filters.hasDeadline !== null) {
    const hasDeadline = props.filters.hasDeadline;
    result = result.filter((c) => {
      const contractHasDeadline = c.deadline.type !== DeadlineType.SEM_PRAZO;
      return contractHasDeadline === hasDeadline;
    });
  }

  return result;
};

// Contagens por categoria (com filtros aplicados quando relevante)
const statusOptions = computed(() => {
  const totalCounts: Record<string, number> = {};
  const filteredCounts: Record<string, number> = {};

  // Contar totais
  props.contracts.forEach((contract) => {
    totalCounts[contract.status] = (totalCounts[contract.status] || 0) + 1;
  });

  // Contar com outros filtros aplicados (exceto status)
  const contractsExcludingStatus = getFilteredContractsExcluding("status");
  contractsExcludingStatus.forEach((contract) => {
    filteredCounts[contract.status] =
      (filteredCounts[contract.status] || 0) + 1;
  });

  return Object.values(ContractStatus)
    .map((status) => ({
      value: status,
      label: getStatusLabel(status as unknown as ContractStatus),
      totalCount: totalCounts[status] || 0,
      filteredCount: filteredCounts[status] || 0,
    }))
    .filter((option) => option.totalCount > 0);
});

const difficultyOptions = computed(() => {
  const totalCounts: Record<string, number> = {};
  const filteredCounts: Record<string, number> = {};

  // Contar totais
  props.contracts.forEach((contract) => {
    totalCounts[contract.difficulty] =
      (totalCounts[contract.difficulty] || 0) + 1;
  });

  // Contar com outros filtros aplicados (exceto difficulty)
  const contractsExcludingDifficulty =
    getFilteredContractsExcluding("difficulty");
  contractsExcludingDifficulty.forEach((contract) => {
    filteredCounts[contract.difficulty] =
      (filteredCounts[contract.difficulty] || 0) + 1;
  });

  return Object.values(ContractDifficulty)
    .map((difficulty) => ({
      value: difficulty,
      label: difficulty,
      totalCount: totalCounts[difficulty] || 0,
      filteredCount: filteredCounts[difficulty] || 0,
    }))
    .filter((option) => option.totalCount > 0);
});

const contractorOptions = computed(() => {
  const totalCounts: Record<string, number> = {};
  const filteredCounts: Record<string, number> = {};

  // Contar totais
  props.contracts.forEach((contract) => {
    totalCounts[contract.contractorType] =
      (totalCounts[contract.contractorType] || 0) + 1;
  });

  // Contar com outros filtros aplicados (exceto contractor)
  const contractsExcludingContractor =
    getFilteredContractsExcluding("contractor");
  contractsExcludingContractor.forEach((contract) => {
    filteredCounts[contract.contractorType] =
      (filteredCounts[contract.contractorType] || 0) + 1;
  });

  return Object.values(ContractorType)
    .map((contractor) => ({
      value: contractor,
      label: contractor,
      totalCount: totalCounts[contractor] || 0,
      filteredCount: filteredCounts[contractor] || 0,
    }))
    .filter((option) => option.totalCount > 0);
});

// Função auxiliar para formatar contadores (total) ou (filtrado/total) se diferentes
const formatCount = (totalCount: number, filteredCount: number): string => {
  if (totalCount === filteredCount) {
    return `(${totalCount})`;
  }
  return `(${filteredCount}/${totalCount})`;
};

const contractsWithDeadlineTotal = computed(
  () =>
    props.contracts.filter((c) => c.deadline.type !== DeadlineType.SEM_PRAZO)
      .length
);

const contractsWithoutDeadlineTotal = computed(
  () =>
    props.contracts.filter((c) => c.deadline.type === DeadlineType.SEM_PRAZO)
      .length
);

const contractsExcludingDeadline = computed(() =>
  getFilteredContractsExcluding("hasDeadline")
);

const contractsWithDeadlineFiltered = computed(
  () =>
    contractsExcludingDeadline.value.filter(
      (c) => c.deadline.type !== DeadlineType.SEM_PRAZO
    ).length
);

const contractsWithoutDeadlineFiltered = computed(
  () =>
    contractsExcludingDeadline.value.filter(
      (c) => c.deadline.type === DeadlineType.SEM_PRAZO
    ).length
);

// Valor do filtro de prazo convertido
const deadlineFilterValue = computed(() => {
  if (props.filters.hasDeadline === true) return "with-deadline";
  if (props.filters.hasDeadline === false) return "no-deadline";
  return "";
});

// Filtros ativos
const hasActiveFilters = computed(() => {
  return !!(
    props.filters.status ||
    props.filters.difficulty ||
    props.filters.contractor ||
    props.filters.searchText ||
    props.filters.minValue !== null ||
    props.filters.maxValue !== null ||
    props.filters.hasDeadline !== null
  );
});

const activeFilters = computed(() => {
  const filters = [];

  if (props.filters.status) {
    filters.push({ key: "status", label: `Status: ${props.filters.status}` });
  }

  if (props.filters.difficulty) {
    filters.push({
      key: "difficulty",
      label: `Dificuldade: ${props.filters.difficulty}`,
    });
  }

  if (props.filters.contractor) {
    filters.push({
      key: "contractor",
      label: `Contratante: ${props.filters.contractor}`,
    });
  }

  if (props.filters.searchText) {
    filters.push({
      key: "searchText",
      label: `Busca: "${props.filters.searchText}"`,
    });
  }

  if (props.filters.minValue !== null || props.filters.maxValue !== null) {
    const min = props.filters.minValue ?? 0;
    const max = props.filters.maxValue ?? "∞";
    filters.push({ key: "valueRange", label: `Valor: ${min} - ${max} PO$` });
  }

  if (props.filters.hasDeadline !== null) {
    const label = props.filters.hasDeadline ? "Com prazo" : "Sem prazo";
    filters.push({ key: "hasDeadline", label: `Prazo: ${label}` });
  }

  return filters;
});

// ===== METHODS =====

function updateStatusFilter(value: string) {
  emit("update-status", value);
}

function updateDifficultyFilter(value: string) {
  emit("update-difficulty", value);
}

function updateContractorFilter(value: string) {
  emit("update-contractor", value);
}

function updateSearchFilter(value: string) {
  emit("update-search", value);
}

function updateDeadlineFilter(value: string) {
  if (value === "with-deadline") {
    emit("update-deadline", true);
  } else if (value === "no-deadline") {
    emit("update-deadline", false);
  } else {
    emit("update-deadline", null);
  }
}

function updateMinValue(value: string) {
  const numValue = value ? parseInt(value, 10) : null;
  emit("update-min-value", numValue);
}

function updateMaxValue(value: string) {
  const numValue = value ? parseInt(value, 10) : null;
  emit("update-max-value", numValue);
}

function clearSearchFilter() {
  emit("update-search", "");
}

function clearAllFilters() {
  emit("clear-filters");
}

function removeFilter(filterKey: string) {
  switch (filterKey) {
    case "status":
      emit("update-status", "");
      break;
    case "difficulty":
      emit("update-difficulty", "");
      break;
    case "contractor":
      emit("update-contractor", "");
      break;
    case "searchText":
      emit("update-search", "");
      break;
    case "valueRange":
      emit("update-min-value", null);
      emit("update-max-value", null);
      break;
    case "hasDeadline":
      emit("update-deadline", null);
      break;
  }
}
</script>

<style scoped>
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.filter-label {
  display: block;
  font-size: 1rem;
  font-weight: 500;
  color: rgb(209, 213, 219);
}

.filter-select {
  width: 100%;
  background-color: rgb(55, 65, 81);
  border: 1px solid rgb(75, 85, 99);
  border-radius: 0.375rem;
  color: white;
  font-size: 1rem;
  padding: 0.5rem 0.75rem;
  transition: border-color 0.2s;
}

.filter-select:focus {
  outline: none;
  border-color: rgb(245, 158, 11);
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.5);
}

.filter-select:hover {
  border-color: rgb(107, 114, 128);
}

.filter-input {
  width: 100%;
  background-color: rgb(55, 65, 81);
  border: 1px solid rgb(75, 85, 99);
  border-radius: 0.375rem;
  color: white;
  font-size: 1rem;
  padding: 0.5rem 0.75rem;
  transition: border-color 0.2s;
}

.filter-input:focus {
  outline: none;
  border-color: rgb(245, 158, 11);
  box-shadow: 0 0 0 2px rgba(245, 158, 11, 0.5);
}

.filter-input:hover {
  border-color: rgb(107, 114, 128);
}

.filter-input::placeholder {
  color: rgb(156, 163, 175);
}
</style>
