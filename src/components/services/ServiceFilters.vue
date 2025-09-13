<template>
  <div class="service-filters bg-gray-800 rounded-lg border border-gray-700 p-4 space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-blue-400 flex items-center gap-2">
        <FunnelIcon class="w-5 h-5" />
        Filtros de Serviços
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
            {{ formatCount(difficulty.total, difficulty.filtered) }}
          </option>
        </select>
      </div>

      <!-- Filtro por Complexidade -->
      <div class="filter-group">
        <label class="filter-label">Complexidade</label>
        <select :value="filters.complexity" @change="
          updateComplexityFilter(($event.target as HTMLSelectElement).value)
          " class="filter-select">
          <option value="">Todas as complexidades</option>
          <option v-for="complexity in complexityOptions" :key="complexity.value" :value="complexity.value">
            {{ complexity.label }}
            {{ formatCount(complexity.totalCount, complexity.filteredCount) }}
          </option>
        </select>
      </div>

      <!-- Filtro por Tipo de Contratante -->
      <div class="filter-group">
        <label class="filter-label">Contratante</label>
        <select :value="filters.contractorType" @change="
          updateContractorTypeFilter(
            ($event.target as HTMLSelectElement).value
          )
          " class="filter-select">
          <option value="">Todos os contratantes</option>
          <option v-for="contractor in contractorOptions" :key="contractor.value" :value="contractor.value">
            {{ contractor.label }}
            {{ formatCount(contractor.totalCount, contractor.filteredCount) }}
          </option>
        </select>
      </div>

      <!-- Filtro por ND (Nível de Dificuldade) -->
      <div class="filter-group">
        <label class="filter-label">ND (Classe de Dificuldade)</label>
        <div class="flex gap-2">
          <input type="number" :value="filters.ndMin" @input="
            updateNdMinFilter(($event.target as HTMLInputElement).value)
            " placeholder="Min" min="10" max="25" class="filter-input flex-1" />
          <input type="number" :value="filters.ndMax" @input="
            updateNdMaxFilter(($event.target as HTMLInputElement).value)
            " placeholder="Max" min="10" max="25" class="filter-input flex-1" />
        </div>
      </div>

      <!-- Filtro por Recompensa -->
      <div class="filter-group">
        <label class="filter-label">Recompensa Mínima</label>
        <div class="flex gap-2">
          <input type="number" :value="filters.minReward" @input="
            updateMinRewardFilter(($event.target as HTMLInputElement).value)
            " placeholder="Valor" min="0" step="0.5" class="filter-input flex-[2]" />
          <select :value="filters.rewardCurrency" @change="
            updateRewardCurrencyFilter(
              ($event.target as HTMLSelectElement).value
            )
            " class="filter-select flex-1">
            <option value="">Todas</option>
            <option v-for="cur in rewardCurrencyOptions" :key="cur.value" :value="cur.value">
              {{ cur.label }} {{ formatCount(cur.total, cur.filtered) }}
            </option>
          </select>
        </div>
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
              formatCount(servicesWithDeadline, servicesWithDeadlineFiltered)
            }}
          </option>
          <option value="no-deadline">
            Sem prazo
            {{
              formatCount(
                servicesWithoutDeadline,
                servicesWithoutDeadlineFiltered
              )
            }}
          </option>
          <option value="expiring-soon">
            Expirando Em Breve
            {{ formatCount(expiringServices.length, expiringServicesFiltered) }}
          </option>
        </select>
      </div>

      <!-- Filtro por Quantidade de Testes -->
      <div class="filter-group">
        <label class="filter-label">Quantidade de Testes</label>
        <select :value="filters.testCount" @change="
          updateTestCountFilter(($event.target as HTMLSelectElement).value)
          " class="filter-select">
          <option value="">Qualquer quantidade</option>
          <option v-for="opt in testCountOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }} {{ formatCount(opt.total, opt.filtered) }}
          </option>
        </select>
      </div>
    </div>

    <!-- Filtros avançados (toggle) -->
    <div>
      <!-- Busca por texto (sem avançados) -->
      <div class="mt-2 mb-4">
        <label class="filter-label">Buscar</label>
        <div class="relative">
          <input :value="filters.searchText" @input="
            updateSearchFilter(($event.target as HTMLInputElement).value)
            " type="text" placeholder="Buscar por título, descrição, contratante ou código..."
            class="filter-input pl-10 w-full" />
          <button v-if="filters.searchText" @click="clearSearchFilter"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
      <button @click="showAdvancedFilters = !showAdvancedFilters"
        class="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
        <ChevronDownIcon :class="[
          'w-4 h-4 transition-transform',
          { 'rotate-180': showAdvancedFilters },
        ]" />
        Filtros Avançados
      </button>

      <Transition enter-active-class="transition-all duration-300 ease-out" enter-from-class="opacity-0 max-h-0"
        enter-to-class="opacity-100 max-h-96" leave-active-class="transition-all duration-300 ease-in"
        leave-from-class="opacity-100 max-h-96" leave-to-class="opacity-0 max-h-0">
        <div v-if="showAdvancedFilters" class="mt-4 pt-4 border-t border-blue-700/30">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Filtro por Taxa de Recorrência -->
            <div class="filter-group">
              <label class="filter-label">Com Taxa de Recorrência</label>
              <select :value="filters.hasRecurrence" @change="
                updateHasRecurrenceFilter(
                  ($event.target as HTMLSelectElement).value
                )
                " class="filter-select">
                <option value="">Todos</option>
                <option value="true">
                  Apenas com bônus aplicado
                  {{
                    formatCount(
                      recurrenceTotals.totalTrue,
                      recurrenceTotals.filteredTrue
                    )
                  }}
                </option>
                <option value="false">
                  Apenas sem bônus
                  {{
                    formatCount(
                      recurrenceTotals.totalFalse,
                      recurrenceTotals.filteredFalse
                    )
                  }}
                </option>
              </select>
            </div>

            <!-- Filtro por Tipo de Perícia -->
            <div class="filter-group">
              <label class="filter-label">Tipo de Perícia</label>
              <select :value="filters.skillRequirement" @change="
                updateSkillRequirementFilter(
                  ($event.target as HTMLSelectElement).value
                )
                " class="filter-select">
                <option value="">Todos os tipos</option>
                <option v-for="skill in skillRequirementOptions" :key="skill.value" :value="skill.value">
                  {{ skill.label }}
                  {{ formatCount(skill.total, skill.filtered) }}
                </option>
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
        <span v-for="filter in activeFilters" :key="filter.key"
          class="inline-flex items-center gap-1 px-2 py-1 bg-blue-600/20 text-blue-300 rounded text-xs">
          {{ filter.label }}
          <button @click="removeFilter(filter.key)" class="text-blue-400 hover:text-white">
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
  ServiceDeadlineType,
} from "@/types/service";
import { matchesServiceCode } from "@/utils/id-search";
import { useTimeline } from "@/composables/useTimeline";

// Props
interface Props {
  services: Service[];
  filters?: Partial<ServiceFilters>;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  "update:filters": [filters: Partial<ServiceFilters>];
  filtered: [services: Service[]];
  close: [];
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
  searchText: string;
  hasDeadline: string;
}

// State
const showAdvancedFilters = ref(false);
const { currentDate, dateUtils } = useTimeline();

const defaultFilters: ServiceFilters = {
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
  searchText: "",
  hasDeadline: "",
};

// Local reactive filters synced with prop (if provided)
const filters = ref<ServiceFilters>({
  ...defaultFilters,
  ...(props.filters || {}),
});

import { watch } from "vue";

watch(
  () => props.filters,
  (val) => {
    filters.value = { ...defaultFilters, ...(val || {}) };
  },
  { deep: true, immediate: true }
);

// Computed para serviços expirando
const expiringServices = computed(() => {
  const current = currentDate.value;
  if (!current) return [];

  return props.services.filter((service) => {
    if (!service.deadlineDate) return false;

    if (
      service.status !== ServiceStatus.DISPONIVEL &&
      service.status !== ServiceStatus.ACEITO &&
      service.status !== ServiceStatus.EM_ANDAMENTO
    )
      return false;

    const daysUntilExpiration = dateUtils.getDaysDifference(
      current,
      service.deadlineDate
    );

    return daysUntilExpiration >= 0 && daysUntilExpiration <= 3;
  });
});

// Computed para contadores de deadline
const servicesWithDeadline = computed(() => {
  return props.services.filter(
    (s) => s.deadline?.type !== ServiceDeadlineType.SEM_PRAZO
  ).length;
});

const servicesWithoutDeadline = computed(() => {
  return props.services.filter(
    (s) => s.deadline?.type === ServiceDeadlineType.SEM_PRAZO
  ).length;
});

// Filtra contadores para prazos (contando com outros filtros ativos)
const servicesWithDeadlineFiltered = computed(() => {
  return getFilteredServicesForOption("hasDeadline", "true").length;
});

const servicesWithoutDeadlineFiltered = computed(() => {
  return getFilteredServicesForOption("hasDeadline", "false").length;
});

const expiringServicesFiltered = computed(() => {
  return getFilteredServicesForOption("hasDeadline", "expiring").length;
});

// Computed para valor do filtro de deadline
const deadlineFilterValue = computed(() => {
  if (filters.value.hasDeadline === "true") return "with-deadline";
  if (filters.value.hasDeadline === "false") return "no-deadline";
  if (filters.value.hasDeadline === "expiring") return "expiring-soon";
  return "";
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
  // Agrupar por rótulo base (ex: "Fácil", "Média") para evitar entradas duplicadas
  const groupMap = new Map<
    string,
    { value: string; label: string; total: number; filtered: number }
  >();

  Object.values(ServiceDifficulty).forEach((difficulty) => {
    const baseLabel = String(difficulty).split(" (")[0];

    // Conta total para o variant específico
    const total = props.services.filter(
      (s) => s.difficulty === difficulty
    ).length;

    // Para o filtro "difficulty" agrupado por rótulo base, somamos os
    // resultados filtrados de cada variante (evita duplicação/inversão)
    const filteredForVariant = getFilteredServicesForOption(
      "difficulty",
      difficulty
    ).length;

    if (!groupMap.has(baseLabel)) {
      groupMap.set(baseLabel, {
        value: baseLabel,
        label: baseLabel,
        total,
        filtered: filteredForVariant,
      });
    } else {
      const existing = groupMap.get(baseLabel)!;
      existing.total += total;
      existing.filtered += filteredForVariant;
    }
  });

  return Array.from(groupMap.values());
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

const rewardCurrencyOptions = computed(() => {
  const totals = new Map<string, { total: number; filtered: number }>();

  ["C$", "PO$"] as const;
  ["C$", "PO$"].forEach((cur) => {
    const total = props.services.filter((s) => s.value.currency === cur).length;
    const filtered = getFilteredServicesForOption("rewardCurrency", cur).length;
    totals.set(cur, { total, filtered });
  });

  return ["C$", "PO$"].map((cur) => ({
    value: cur,
    label: cur,
    total: totals.get(cur)?.total || 0,
    filtered: totals.get(cur)?.filtered || 0,
  }));
});

const recurrenceTotals = computed(() => {
  const totalTrue = props.services.filter(
    (s) => s.value && s.value.recurrenceBonusAmount > 0
  ).length;
  const totalFalse = props.services.filter(
    (s) => !s.value || s.value.recurrenceBonusAmount === 0
  ).length;

  const filteredTrue = getFilteredServicesForOption(
    "hasRecurrence",
    "true"
  ).length;
  const filteredFalse = getFilteredServicesForOption(
    "hasRecurrence",
    "false"
  ).length;

  return { totalTrue, totalFalse, filteredTrue, filteredFalse };
});

const skillRequirementOptions = computed(() => {
  const values = ["same", "different", "mixed"] as const;
  return values.map((v) => ({
    value: v,
    label:
      v === "same"
        ? "Mesma perícia"
        : v === "different"
          ? "Perícias diferentes"
          : "Perícias mistas",
    total: props.services.filter((s) => s.testStructure?.skillRequirement === v)
      .length,
    filtered: getFilteredServicesForOption("skillRequirement", v).length,
  }));
});

const testCountOptions = computed(() => {
  const totals = new Map<string, { total: number; filtered: number }>();
  const options = ["1", "2", "3", "4"];
  options.forEach((opt) => {
    let total = 0;
    if (opt === "4") {
      total = props.services.filter(
        (s) => s.testStructure.totalTests >= 4
      ).length;
    } else {
      const n = parseInt(opt);
      total = props.services.filter(
        (s) => s.testStructure.totalTests === n
      ).length;
    }
    const filtered = getFilteredServicesForOption("testCount", opt).length;
    totals.set(opt, { total, filtered });
  });

  return options.map((opt) => ({
    value: opt,
    label: opt === "4" ? "4+ testes" : `${opt} teste${opt !== "1" ? "s" : ""}`,
    total: totals.get(opt)?.total || 0,
    filtered: totals.get(opt)?.filtered || 0,
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
    if (filtersToApply.difficulty) {
      // Suporta tanto filtro por rótulo base (ex: "Fácil") quanto valor exato
      if (!String(service.difficulty).startsWith(filtersToApply.difficulty))
        return false;
    }

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

    // Busca por texto
    if (filtersToApply.searchText && filtersToApply.searchText.trim()) {
      const q = filtersToApply.searchText.toLowerCase();
      const searchText = filtersToApply.searchText.trim();
      const matches =
        (service.title && service.title.toLowerCase().includes(q)) ||
        (service.description &&
          service.description.toLowerCase().includes(q)) ||
        (service.contractorName &&
          service.contractorName.toLowerCase().includes(q)) ||
        (service.objective &&
          service.objective.description &&
          service.objective.description.toLowerCase().includes(q)) ||
        matchesServiceCode(searchText, service.id);

      if (!matches) return false;
    }

    // Prazo e deadline
    if (filtersToApply.hasDeadline) {
      const serviceHasDeadline =
        service.deadline?.type !== ServiceDeadlineType.SEM_PRAZO;

      if (filtersToApply.hasDeadline === "true" && !serviceHasDeadline)
        return false;
      if (filtersToApply.hasDeadline === "false" && serviceHasDeadline)
        return false;
      if (filtersToApply.hasDeadline === "expiring") {
        // Verificar se está expirando em breve
        if (!service.deadlineDate || !currentDate.value) return false;

        const daysUntilExpiration = dateUtils.getDaysDifference(
          currentDate.value,
          service.deadlineDate
        );

        if (!(daysUntilExpiration >= 0 && daysUntilExpiration <= 3))
          return false;
      }
    }

    // Recorrência / Taxa de recorrência
    if (filtersToApply.hasRecurrence) {
      const serviceTyped = service as Service;
      const serviceHasRecurrence = !!(
        serviceTyped.value &&
        typeof serviceTyped.value.recurrenceBonusAmount === "number" &&
        serviceTyped.value.recurrenceBonusAmount > 0
      );

      if (filtersToApply.hasRecurrence === "true" && !serviceHasRecurrence)
        return false;
      if (filtersToApply.hasRecurrence === "false" && serviceHasRecurrence)
        return false;
    }

    // Prazo por tipo (mantido para compatibilidade)
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

// Lista de serviços já filtrada pelo conjunto atual de filtros (usada para emitir)
const filteredServicesForComponent = computed(() => {
  return applyAllFilters(props.services, filters.value);
});

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
  if (filters.value.searchText && filters.value.searchText.trim())
    active.push({
      key: "searchText",
      label: `Busca: ${filters.value.searchText}`,
    });
  if (filters.value.hasDeadline) {
    let label = "Prazo: ";
    switch (filters.value.hasDeadline) {
      case "true":
        label += "Com prazo";
        break;
      case "false":
        label += "Sem prazo";
        break;
      case "expiring":
        label += "Expirando em breve";
        break;
    }
    active.push({
      key: "hasDeadline",
      label,
    });
  }

  if (filters.value.hasRecurrence) {
    let label = "Recorrência: ";
    switch (filters.value.hasRecurrence) {
      case "true":
        label += "Com bônus";
        break;
      case "false":
        label += "Sem bônus";
        break;
    }
    active.push({ key: "hasRecurrence", label });
  }

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

const updateDeadlineFilter = (value: string) => {
  // Mapear valores do select para o filtro hasDeadline
  switch (value) {
    case "with-deadline":
      filters.value.hasDeadline = "true";
      break;
    case "no-deadline":
      filters.value.hasDeadline = "false";
      break;
    case "expiring-soon":
      filters.value.hasDeadline = "expiring";
      break;
    default:
      filters.value.hasDeadline = "";
      break;
  }
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

const updateSearchFilter = (value: string) => {
  filters.value.searchText = value;
  emitFilters();
};

const clearSearchFilter = () => {
  filters.value.searchText = "";
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
  const payloadEntries = Object.entries(filters.value).filter(
    ([, v]) => v !== "" && v !== null && v !== undefined
  );

  const payload = Object.fromEntries(payloadEntries) as Partial<ServiceFilters>;
  emit("update:filters", payload);
  emit("filtered", filteredServicesForComponent.value);
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
  border-color: rgb(59, 130, 246);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
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
  border-color: rgb(59, 130, 246);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

.filter-input:hover {
  border-color: rgb(107, 114, 128);
}

.filter-input::placeholder {
  color: rgb(156, 163, 175);
}
</style>
