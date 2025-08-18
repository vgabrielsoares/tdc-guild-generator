<template>
  <div
    class="service-filters bg-gray-800 rounded-lg border border-blue-700/50 p-4 space-y-4"
  >
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-blue-400 flex items-center gap-2">
        <FunnelIcon class="w-5 h-5" />
        Filtros de Serviços
      </h3>
      <button
        @click="clearAllFilters"
        class="text-sm text-gray-400 hover:text-white transition-colors underline"
      >
        Limpar Filtros
      </button>
    </div>

    <div
      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
    >
      <!-- Filtro por Status -->
      <div class="filter-group">
        <label class="filter-label">Status</label>
        <select
          :value="filters.status"
          @change="
            updateStatusFilter(($event.target as HTMLSelectElement).value)
          "
          class="filter-select"
        >
          <option value="">Todos os status</option>
          <option
            v-for="status in statusOptions"
            :key="status.value"
            :value="status.value"
          >
            {{ status.label }}
            {{ formatCount(status.totalCount, status.filteredCount) }}
          </option>
        </select>
      </div>

      <!-- Filtro por Dificuldade -->
      <div class="filter-group">
        <label class="filter-label">Dificuldade</label>
        <select
          :value="filters.difficulty"
          @change="
            updateDifficultyFilter(($event.target as HTMLSelectElement).value)
          "
          class="filter-select"
        >
          <option value="">Todas as dificuldades</option>
          <option
            v-for="difficulty in difficultyOptions"
            :key="difficulty.value"
            :value="difficulty.value"
          >
            {{ difficulty.label }}
            {{ formatCount(difficulty.totalCount, difficulty.filteredCount) }}
          </option>
        </select>
      </div>

      <!-- Filtro por Complexidade -->
      <div class="filter-group">
        <label class="filter-label">Complexidade</label>
        <select
          :value="filters.complexity"
          @change="
            updateComplexityFilter(($event.target as HTMLSelectElement).value)
          "
          class="filter-select"
        >
          <option value="">Todas as complexidades</option>
          <option
            v-for="complexity in complexityOptions"
            :key="complexity.value"
            :value="complexity.value"
          >
            {{ complexity.label }}
            {{ formatCount(complexity.totalCount, complexity.filteredCount) }}
          </option>
        </select>
      </div>

      <!-- Filtro por Tipo de Contratante -->
      <div class="filter-group">
        <label class="filter-label">Contratante</label>
        <select
          :value="filters.contractorType"
          @change="
            updateContractorTypeFilter(
              ($event.target as HTMLSelectElement).value
            )
          "
          class="filter-select"
        >
          <option value="">Todos os contratantes</option>
          <option
            v-for="contractor in contractorOptions"
            :key="contractor.value"
            :value="contractor.value"
          >
            {{ contractor.label }}
            {{ formatCount(contractor.totalCount, contractor.filteredCount) }}
          </option>
        </select>
      </div>

      <!-- Filtro por ND (Nível de Dificuldade) -->
      <div class="filter-group">
        <label class="filter-label">ND (Classe de Dificuldade)</label>
        <div class="flex gap-2">
          <input
            type="number"
            :value="filters.ndMin"
            @input="
              updateNdMinFilter(($event.target as HTMLInputElement).value)
            "
            placeholder="Min"
            min="10"
            max="25"
            class="filter-input flex-1"
          />
          <input
            type="number"
            :value="filters.ndMax"
            @input="
              updateNdMaxFilter(($event.target as HTMLInputElement).value)
            "
            placeholder="Max"
            min="10"
            max="25"
            class="filter-input flex-1"
          />
        </div>
      </div>

      <!-- Filtro por Recompensa -->
      <div class="filter-group">
        <label class="filter-label">Recompensa Mínima</label>
        <div class="flex gap-2">
          <input
            type="number"
            :value="filters.minReward"
            @input="
              updateMinRewardFilter(($event.target as HTMLInputElement).value)
            "
            placeholder="Valor"
            min="0"
            step="0.5"
            class="filter-input flex-1"
          />
          <select
            :value="filters.rewardCurrency"
            @change="
              updateRewardCurrencyFilter(
                ($event.target as HTMLSelectElement).value
              )
            "
            class="filter-select w-20"
          >
            <option value="">Todas</option>
            <option value="C$">C$</option>
            <option value="PO$">PO$</option>
          </select>
        </div>
      </div>

      <!-- Filtro por Prazo -->
      <div class="filter-group">
        <label class="filter-label">Prazo</label>
        <select
          :value="filters.deadlineType"
          @change="
            updateDeadlineTypeFilter(($event.target as HTMLSelectElement).value)
          "
          class="filter-select"
        >
          <option value="">Todos os prazos</option>
          <option value="SEM_PRAZO">Sem prazo</option>
          <option value="DIAS">Em dias</option>
          <option value="SEMANAS">Em semanas</option>
        </select>
      </div>

      <!-- Filtro por Quantidade de Testes -->
      <div class="filter-group">
        <label class="filter-label">Quantidade de Testes</label>
        <select
          :value="filters.testCount"
          @change="
            updateTestCountFilter(($event.target as HTMLSelectElement).value)
          "
          class="filter-select"
        >
          <option value="">Qualquer quantidade</option>
          <option value="1">1 teste</option>
          <option value="2">2 testes</option>
          <option value="3">3 testes</option>
          <option value="4">4+ testes</option>
        </select>
      </div>
    </div>

    <!-- Filtros avançados (toggle) -->
    <div>
      <button
        @click="showAdvancedFilters = !showAdvancedFilters"
        class="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
      >
        <ChevronDownIcon
          :class="[
            'w-4 h-4 transition-transform',
            { 'rotate-180': showAdvancedFilters },
          ]"
        />
        Filtros Avançados
      </button>

      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0 max-h-0"
        enter-to-class="opacity-100 max-h-96"
        leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="opacity-100 max-h-96"
        leave-to-class="opacity-0 max-h-0"
      >
        <div
          v-if="showAdvancedFilters"
          class="mt-4 pt-4 border-t border-blue-700/30"
        >
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Filtro por Taxa de Recorrência -->
            <div class="filter-group">
              <label class="filter-label">Com Taxa de Recorrência</label>
              <select
                :value="filters.hasRecurrence"
                @change="
                  updateHasRecurrenceFilter(
                    ($event.target as HTMLSelectElement).value
                  )
                "
                class="filter-select"
              >
                <option value="">Todos</option>
                <option value="true">Apenas com bônus aplicado</option>
                <option value="false">Apenas sem bônus</option>
              </select>
            </div>

            <!-- Filtro por Tipo de Perícia -->
            <div class="filter-group">
              <label class="filter-label">Tipo de Perícia</label>
              <select
                :value="filters.skillRequirement"
                @change="
                  updateSkillRequirementFilter(
                    ($event.target as HTMLSelectElement).value
                  )
                "
                class="filter-select"
              >
                <option value="">Todos os tipos</option>
                <option value="same">Mesma perícia</option>
                <option value="different">Perícias diferentes</option>
                <option value="mixed">Perícias mistas</option>
              </select>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Resumo dos filtros ativos -->
    <div v-if="hasActiveFilters" class="pt-4 border-t border-blue-700/30">
      <div class="flex flex-wrap gap-2">
        <span class="text-sm text-gray-400">Filtros ativos:</span>
        <span
          v-for="filter in activeFilters"
          :key="filter.key"
          class="inline-flex items-center gap-1 px-2 py-1 bg-blue-600/20 text-blue-300 rounded text-xs"
        >
          {{ filter.label }}
          <button
            @click="removeFilter(filter.key)"
            class="text-blue-400 hover:text-white"
          >
            <XMarkIcon class="w-3 h-3" />
          </button>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import {
  FunnelIcon,
  ChevronDownIcon,
  XMarkIcon,
} from "@heroicons/vue/24/outline";
import type { Service } from "@/types/service";
import {
  ServiceStatus,
  ServiceDifficulty,
  ServiceComplexity,
  ServiceContractorType,
} from "@/types/service";

// Props
interface Props {
  services: Service[];
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  "filters-changed": [filters: ServiceFilters];
}>();

// Interface dos filtros
export interface ServiceFilters {
  status: string;
  difficulty: string;
  complexity: string;
  contractorType: string;
  ndMin: string;
  ndMax: string;
  minReward: string;
  rewardCurrency: string;
  deadlineType: string;
  testCount: string;
  hasRecurrence: string;
  skillRequirement: string;
}

// State
const showAdvancedFilters = ref(false);

const filters = ref<ServiceFilters>({
  status: "",
  difficulty: "",
  complexity: "",
  contractorType: "",
  ndMin: "",
  ndMax: "",
  minReward: "",
  rewardCurrency: "",
  deadlineType: "",
  testCount: "",
  hasRecurrence: "",
  skillRequirement: "",
});

// Computed options with counts
const statusOptions = computed(() => {
  const statusCounts = new Map<string, { total: number; filtered: number }>();

  Object.values(ServiceStatus).forEach((status) => {
    const total = props.services.filter((s) => s.status === status).length;
    const filtered = getFilteredServicesForOption("status", status).length;
    statusCounts.set(status, { total, filtered });
  });

  return Object.values(ServiceStatus).map((status) => ({
    value: status,
    label: status,
    totalCount: statusCounts.get(status)?.total || 0,
    filteredCount: statusCounts.get(status)?.filtered || 0,
  }));
});

const difficultyOptions = computed(() => {
  const difficultyCounts = new Map<
    string,
    { total: number; filtered: number }
  >();

  Object.values(ServiceDifficulty).forEach((difficulty) => {
    const total = props.services.filter(
      (s) => s.difficulty === difficulty
    ).length;
    const filtered = getFilteredServicesForOption(
      "difficulty",
      difficulty
    ).length;
    difficultyCounts.set(difficulty, { total, filtered });
  });

  return Object.values(ServiceDifficulty).map((difficulty) => ({
    value: difficulty,
    label: difficulty.split(" (")[0], // Remove ND da label
    totalCount: difficultyCounts.get(difficulty)?.total || 0,
    filteredCount: difficultyCounts.get(difficulty)?.filtered || 0,
  }));
});

const complexityOptions = computed(() => {
  const complexityCounts = new Map<
    string,
    { total: number; filtered: number }
  >();

  Object.values(ServiceComplexity).forEach((complexity) => {
    const total = props.services.filter(
      (s) => s.complexity === complexity
    ).length;
    const filtered = getFilteredServicesForOption(
      "complexity",
      complexity
    ).length;
    complexityCounts.set(complexity, { total, filtered });
  });

  return Object.values(ServiceComplexity).map((complexity) => ({
    value: complexity,
    label: complexity,
    totalCount: complexityCounts.get(complexity)?.total || 0,
    filteredCount: complexityCounts.get(complexity)?.filtered || 0,
  }));
});

const contractorOptions = computed(() => {
  const contractorCounts = new Map<
    string,
    { total: number; filtered: number }
  >();

  Object.values(ServiceContractorType).forEach((contractor) => {
    const total = props.services.filter(
      (s) => s.contractorType === contractor
    ).length;
    const filtered = getFilteredServicesForOption(
      "contractorType",
      contractor
    ).length;
    contractorCounts.set(contractor, { total, filtered });
  });

  return Object.values(ServiceContractorType).map((contractor) => ({
    value: contractor,
    label: contractor,
    totalCount: contractorCounts.get(contractor)?.total || 0,
    filteredCount: contractorCounts.get(contractor)?.filtered || 0,
  }));
});

// Helper para contar serviços filtrados para uma opção específica
const getFilteredServicesForOption = (
  filterType: string,
  optionValue: string
): Service[] => {
  const tempFilters = { ...filters.value, [filterType]: optionValue };
  return applyAllFilters(props.services, tempFilters);
};

// Aplicar todos os filtros
const applyAllFilters = (
  services: Service[],
  filtersToApply: ServiceFilters
): Service[] => {
  return services.filter((service) => {
    // Status
    if (filtersToApply.status && service.status !== filtersToApply.status)
      return false;

    // Dificuldade
    if (
      filtersToApply.difficulty &&
      service.difficulty !== filtersToApply.difficulty
    )
      return false;

    // Complexidade
    if (
      filtersToApply.complexity &&
      service.complexity !== filtersToApply.complexity
    )
      return false;

    // Tipo de contratante
    if (
      filtersToApply.contractorType &&
      service.contractorType !== filtersToApply.contractorType
    )
      return false;

    // ND
    if (filtersToApply.ndMin || filtersToApply.ndMax) {
      const serviceND = extractNDFromDifficulty(service.difficulty);
      if (filtersToApply.ndMin && serviceND < parseInt(filtersToApply.ndMin))
        return false;
      if (filtersToApply.ndMax && serviceND > parseInt(filtersToApply.ndMax))
        return false;
    }

    // Recompensa
    if (filtersToApply.minReward && service.value) {
      const minReward = parseFloat(filtersToApply.minReward);
      if (filtersToApply.rewardCurrency) {
        if (service.value.currency !== filtersToApply.rewardCurrency)
          return false;
      }
      if (service.value.rewardAmount < minReward) return false;
    }

    // Prazo
    if (
      filtersToApply.deadlineType &&
      service.deadline?.type !== filtersToApply.deadlineType
    )
      return false;

    // Quantidade de testes
    if (filtersToApply.testCount && service.testStructure) {
      const testCount = parseInt(filtersToApply.testCount);
      if (testCount === 4 && service.testStructure.totalTests < 4) return false;
      if (testCount < 4 && service.testStructure.totalTests !== testCount)
        return false;
    }

    // Tipo de perícia
    if (
      filtersToApply.skillRequirement &&
      service.testStructure?.skillRequirement !==
        filtersToApply.skillRequirement
    )
      return false;

    return true;
  });
};

// Extrair ND da string de dificuldade
const extractNDFromDifficulty = (difficulty: string): number => {
  const match = difficulty.match(/ND (\d+)/);
  return match ? parseInt(match[1]) : 0;
};

// Verificar se há filtros ativos
const hasActiveFilters = computed(() => {
  return Object.values(filters.value).some((value) => value !== "");
});

// Lista de filtros ativos
const activeFilters = computed(() => {
  const active: Array<{ key: keyof ServiceFilters; label: string }> = [];

  if (filters.value.status)
    active.push({ key: "status", label: `Status: ${filters.value.status}` });
  if (filters.value.difficulty)
    active.push({
      key: "difficulty",
      label: `Dificuldade: ${filters.value.difficulty.split(" (")[0]}`,
    });
  if (filters.value.complexity)
    active.push({
      key: "complexity",
      label: `Complexidade: ${filters.value.complexity}`,
    });
  if (filters.value.contractorType)
    active.push({
      key: "contractorType",
      label: `Contratante: ${filters.value.contractorType}`,
    });
  if (filters.value.ndMin)
    active.push({ key: "ndMin", label: `ND Min: ${filters.value.ndMin}` });
  if (filters.value.ndMax)
    active.push({ key: "ndMax", label: `ND Max: ${filters.value.ndMax}` });
  if (filters.value.minReward)
    active.push({
      key: "minReward",
      label: `Recompensa Min: ${filters.value.minReward}${filters.value.rewardCurrency ? " " + filters.value.rewardCurrency : ""}`,
    });
  if (filters.value.deadlineType)
    active.push({
      key: "deadlineType",
      label: `Prazo: ${filters.value.deadlineType}`,
    });
  if (filters.value.testCount)
    active.push({
      key: "testCount",
      label: `Testes: ${filters.value.testCount}`,
    });
  if (filters.value.skillRequirement)
    active.push({
      key: "skillRequirement",
      label: `Perícias: ${filters.value.skillRequirement}`,
    });

  return active;
});

// Update functions
const updateStatusFilter = (value: string) => {
  filters.value.status = value;
  emitFilters();
};

const updateDifficultyFilter = (value: string) => {
  filters.value.difficulty = value;
  emitFilters();
};

const updateComplexityFilter = (value: string) => {
  filters.value.complexity = value;
  emitFilters();
};

const updateContractorTypeFilter = (value: string) => {
  filters.value.contractorType = value;
  emitFilters();
};

const updateNdMinFilter = (value: string) => {
  filters.value.ndMin = value;
  emitFilters();
};

const updateNdMaxFilter = (value: string) => {
  filters.value.ndMax = value;
  emitFilters();
};

const updateMinRewardFilter = (value: string) => {
  filters.value.minReward = value;
  emitFilters();
};

const updateRewardCurrencyFilter = (value: string) => {
  filters.value.rewardCurrency = value;
  emitFilters();
};

const updateDeadlineTypeFilter = (value: string) => {
  filters.value.deadlineType = value;
  emitFilters();
};

const updateTestCountFilter = (value: string) => {
  filters.value.testCount = value;
  emitFilters();
};

const updateHasRecurrenceFilter = (value: string) => {
  filters.value.hasRecurrence = value;
  emitFilters();
};

const updateSkillRequirementFilter = (value: string) => {
  filters.value.skillRequirement = value;
  emitFilters();
};

// Remover filtro específico
const removeFilter = (filterKey: keyof ServiceFilters) => {
  filters.value[filterKey] = "";
  emitFilters();
};

// Limpar todos os filtros
const clearAllFilters = () => {
  const keys = Object.keys(filters.value) as Array<keyof ServiceFilters>;
  keys.forEach((key) => {
    filters.value[key] = "";
  });
  emitFilters();
};

// Emit filters
const emitFilters = () => {
  emit("filters-changed", filters.value);
};

// Formatar contadores
const formatCount = (total: number, filtered: number) => {
  if (total === 0) return "";
  if (hasActiveFilters.value) {
    return `(${filtered}/${total})`;
  }
  return `(${total})`;
};
</script>

<style scoped>
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(147 197 253);
}

.filter-select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  background-color: rgb(55 65 81);
  border: 1px solid rgba(37 99 235, 0.3);
  border-radius: 0.375rem;
  color: white;
  font-size: 0.875rem;
}

.filter-select:focus {
  outline: none;
  border-color: transparent;
  box-shadow: 0 0 0 2px rgb(59 130 246);
}

.filter-input {
  padding: 0.5rem 0.75rem;
  background-color: rgb(55 65 81);
  border: 1px solid rgba(37 99 235, 0.3);
  border-radius: 0.375rem;
  color: white;
  font-size: 0.875rem;
}

.filter-input::placeholder {
  color: rgb(156 163 175);
}

.filter-input:focus {
  outline: none;
  border-color: transparent;
  box-shadow: 0 0 0 2px rgb(59 130 246);
}
</style>
