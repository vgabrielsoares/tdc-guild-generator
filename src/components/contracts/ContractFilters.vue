<template>
  <div class="contract-filters bg-gray-800 rounded-lg border border-gray-700 p-4 space-y-4">
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-semibold text-amber-400 flex items-center gap-2">
        <FunnelIcon class="w-5 h-5" />
        Filtros Avançados
      </h3>
      <button
        @click="clearAllFilters"
        class="text-sm text-gray-400 hover:text-white transition-colors underline"
      >
        Limpar Filtros
      </button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      
      <!-- Filtro por Status -->
      <div class="filter-group">
        <label class="filter-label">Status</label>
        <select
          :value="filters.status"
          @change="updateStatusFilter(($event.target as HTMLSelectElement).value)"
          class="filter-select"
        >
          <option value="">Todos os status</option>
          <option
            v-for="status in statusOptions"
            :key="status.value"
            :value="status.value"
          >
            {{ status.label }} ({{ status.count }})
          </option>
        </select>
      </div>

      <!-- Filtro por Dificuldade -->
      <div class="filter-group">
        <label class="filter-label">Dificuldade</label>
        <select
          :value="filters.difficulty"
          @change="updateDifficultyFilter(($event.target as HTMLSelectElement).value)"
          class="filter-select"
        >
          <option value="">Todas as dificuldades</option>
          <option
            v-for="difficulty in difficultyOptions"
            :key="difficulty.value"
            :value="difficulty.value"
          >
            {{ difficulty.label }} ({{ difficulty.count }})
          </option>
        </select>
      </div>

      <!-- Filtro por Contratante -->
      <div class="filter-group">
        <label class="filter-label">Contratante</label>
        <select
          :value="filters.contractor"
          @change="updateContractorFilter(($event.target as HTMLSelectElement).value)"
          class="filter-select"
        >
          <option value="">Todos os contratantes</option>
          <option
            v-for="contractor in contractorOptions"
            :key="contractor.value"
            :value="contractor.value"
          >
            {{ contractor.label }} ({{ contractor.count }})
          </option>
        </select>
      </div>

      <!-- Filtro por Prazo -->
      <div class="filter-group">
        <label class="filter-label">Prazo</label>
        <select
          :value="deadlineFilterValue"
          @change="updateDeadlineFilter(($event.target as HTMLSelectElement).value)"
          class="filter-select"
        >
          <option value="">Todos os prazos</option>
          <option value="with-deadline">Com prazo ({{ contractsWithDeadline }})</option>
          <option value="no-deadline">Sem prazo ({{ contractsWithoutDeadline }})</option>
        </select>
      </div>

    </div>

    <!-- Segunda linha de filtros -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      
      <!-- Busca por texto -->
      <div class="filter-group md:col-span-2">
        <label class="filter-label">Buscar</label>
        <div class="relative">
          <input
            :value="filters.searchText"
            @input="updateSearchFilter(($event.target as HTMLInputElement).value)"
            type="text"
            placeholder="Buscar por título, descrição, objetivo ou contratante..."
            class="filter-input pl-10"
          />
          <MagnifyingGlassIcon
            class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
          />
          <button
            v-if="filters.searchText"
            @click="clearSearchFilter"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
          >
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Filtro por faixa de valores -->
      <div class="filter-group">
        <label class="filter-label">Recompensa (PO$)</label>
        <div class="flex gap-2">
          <input
            :value="filters.minValue || ''"
            @input="updateMinValue(($event.target as HTMLInputElement).value)"
            type="number"
            placeholder="Min"
            class="filter-input text-sm"
            min="0"
          />
          <span class="text-gray-400 self-center">-</span>
          <input
            :value="filters.maxValue || ''"
            @input="updateMaxValue(($event.target as HTMLInputElement).value)"
            type="number"
            placeholder="Max"
            class="filter-input text-sm"
            min="0"
          />
        </div>
      </div>

    </div>

    <!-- Filtros rápidos (botões) -->
    <div class="border-t border-gray-600 pt-4">
      <h4 class="text-sm font-medium text-gray-300 mb-2">Filtros Rápidos</h4>
      <div class="flex flex-wrap gap-2">
        <button
          @click="applyQuickFilter('available')"
          :class="quickFilterClasses('available')"
        >
          <ClockIcon class="w-4 h-4 mr-1" />
          Disponíveis ({{ availableCount }})
        </button>
        
        <button
          @click="applyQuickFilter('accepted')"
          :class="quickFilterClasses('accepted')"
        >
          <HandRaisedIcon class="w-4 h-4 mr-1" />
          Aceitos ({{ acceptedCount }})
        </button>
        
        <button
          @click="applyQuickFilter('high-reward')"
          :class="quickFilterClasses('high-reward')"
        >
          <CurrencyDollarIcon class="w-4 h-4 mr-1" />
          Alta Recompensa ({{ highRewardCount }})
        </button>
        
        <button
          @click="applyQuickFilter('dangerous')"
          :class="quickFilterClasses('dangerous')"
        >
          <XCircleIcon class="w-4 h-4 mr-1" />
          Perigosos ({{ dangerousCount }})
        </button>
        
        <button
          @click="applyQuickFilter('no-deadline')"
          :class="quickFilterClasses('no-deadline')"
        >
          <XCircleIcon class="w-4 h-4 mr-1" />
          Sem Prazo ({{ contractsWithoutDeadline }})
        </button>
      </div>
    </div>

    <!-- Resumo dos filtros ativos -->
    <div v-if="hasActiveFilters" class="border-t border-gray-600 pt-4">
      <h4 class="text-sm font-medium text-gray-300 mb-2">Filtros Ativos</h4>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="activeFilter in activeFilters"
          :key="activeFilter.key"
          class="inline-flex items-center gap-1 px-2 py-1 bg-amber-600/20 border border-amber-600/50 rounded text-xs text-amber-200"
        >
          {{ activeFilter.label }}
          <button
            @click="removeFilter(activeFilter.key)"
            class="text-amber-300 hover:text-white"
          >
            <XMarkIcon class="w-3 h-3" />
          </button>
        </span>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Contract } from '@/types/contract';
import { ContractStatus, ContractDifficulty, ContractorType, DeadlineType } from '@/types/contract';
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  ClockIcon,
  HandRaisedIcon,
  CurrencyDollarIcon,
  XCircleIcon
} from '@heroicons/vue/24/outline';

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
  'update-status': [status: string];
  'update-difficulty': [difficulty: string];
  'update-contractor': [contractor: string];
  'update-search': [search: string];
  'update-min-value': [value: number | null];
  'update-max-value': [value: number | null];
  'update-deadline': [hasDeadline: boolean | null];
  'clear-filters': [];
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// ===== COMPUTED =====

// Contagens por categoria
const statusOptions = computed(() => {
  const counts: Record<string, number> = {};
  props.contracts.forEach(contract => {
    counts[contract.status] = (counts[contract.status] || 0) + 1;
  });

  return Object.values(ContractStatus).map(status => ({
    value: status,
    label: status,
    count: counts[status] || 0
  })).filter(option => option.count > 0);
});

const difficultyOptions = computed(() => {
  const counts: Record<string, number> = {};
  props.contracts.forEach(contract => {
    counts[contract.difficulty] = (counts[contract.difficulty] || 0) + 1;
  });

  return Object.values(ContractDifficulty).map(difficulty => ({
    value: difficulty,
    label: difficulty,
    count: counts[difficulty] || 0
  })).filter(option => option.count > 0);
});

const contractorOptions = computed(() => {
  const counts: Record<string, number> = {};
  props.contracts.forEach(contract => {
    counts[contract.contractorType] = (counts[contract.contractorType] || 0) + 1;
  });

  return Object.values(ContractorType).map(contractor => ({
    value: contractor,
    label: contractor,
    count: counts[contractor] || 0
  })).filter(option => option.count > 0);
});

// Contagens para filtros rápidos
const availableCount = computed(() => 
  props.contracts.filter(c => c.status === ContractStatus.DISPONIVEL).length
);

const acceptedCount = computed(() => 
  props.contracts.filter(c => c.status === ContractStatus.ACEITO || c.status === ContractStatus.EM_ANDAMENTO).length
);

const highRewardCount = computed(() => 
  props.contracts.filter(c => c.value.finalGoldReward >= 100).length // 1000+ pontos = 100+ PO$
);

const dangerousCount = computed(() => 
  props.contracts.filter(c => [ContractDifficulty.DIFICIL, ContractDifficulty.MORTAL].includes(c.difficulty)).length
);

const contractsWithDeadline = computed(() => 
  props.contracts.filter(c => c.deadline.type !== DeadlineType.SEM_PRAZO).length
);

const contractsWithoutDeadline = computed(() => 
  props.contracts.filter(c => c.deadline.type === DeadlineType.SEM_PRAZO).length
);

// Valor do filtro de prazo convertido
const deadlineFilterValue = computed(() => {
  if (props.filters.hasDeadline === true) return 'with-deadline';
  if (props.filters.hasDeadline === false) return 'no-deadline';
  return '';
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
    filters.push({ key: 'status', label: `Status: ${props.filters.status}` });
  }
  
  if (props.filters.difficulty) {
    filters.push({ key: 'difficulty', label: `Dificuldade: ${props.filters.difficulty}` });
  }
  
  if (props.filters.contractor) {
    filters.push({ key: 'contractor', label: `Contratante: ${props.filters.contractor}` });
  }
  
  if (props.filters.searchText) {
    filters.push({ key: 'searchText', label: `Busca: "${props.filters.searchText}"` });
  }
  
  if (props.filters.minValue !== null || props.filters.maxValue !== null) {
    const min = props.filters.minValue ?? 0;
    const max = props.filters.maxValue ?? '∞';
    filters.push({ key: 'valueRange', label: `Valor: ${min} - ${max} PO$` });
  }
  
  if (props.filters.hasDeadline !== null) {
    const label = props.filters.hasDeadline ? 'Com prazo' : 'Sem prazo';
    filters.push({ key: 'hasDeadline', label: `Prazo: ${label}` });
  }
  
  return filters;
});

// ===== METHODS =====

function updateStatusFilter(value: string) {
  emit('update-status', value);
}

function updateDifficultyFilter(value: string) {
  emit('update-difficulty', value);
}

function updateContractorFilter(value: string) {
  emit('update-contractor', value);
}

function updateSearchFilter(value: string) {
  emit('update-search', value);
}

function updateDeadlineFilter(value: string) {
  if (value === 'with-deadline') {
    emit('update-deadline', true);
  } else if (value === 'no-deadline') {
    emit('update-deadline', false);
  } else {
    emit('update-deadline', null);
  }
}

function updateMinValue(value: string) {
  const numValue = value ? parseInt(value, 10) : null;
  emit('update-min-value', numValue);
}

function updateMaxValue(value: string) {
  const numValue = value ? parseInt(value, 10) : null;
  emit('update-max-value', numValue);
}

function clearSearchFilter() {
  emit('update-search', '');
}

function clearAllFilters() {
  emit('clear-filters');
}

function applyQuickFilter(filterType: string) {
  // Limpar filtros primeiro
  emit('clear-filters');
  
  // Aplicar filtro específico
  switch (filterType) {
    case 'available':
      emit('update-status', ContractStatus.DISPONIVEL);
      break;
    case 'accepted':
      emit('update-status', ContractStatus.ACEITO);
      break;
    case 'high-reward':
      emit('update-min-value', 100);
      break;
    case 'dangerous':
      emit('update-difficulty', ContractDifficulty.DIFICIL);
      break;
    case 'no-deadline':
      emit('update-deadline', false);
      break;
  }
}

function quickFilterClasses(filterType: string): string {
  const baseClasses = 'px-3 py-1 rounded-full text-xs font-medium transition-colors';
  
  // Verificar se o filtro está ativo
  let isActive = false;
  
  switch (filterType) {
    case 'available':
      isActive = props.filters.status === ContractStatus.DISPONIVEL;
      break;
    case 'accepted':
      isActive = props.filters.status === ContractStatus.ACEITO;
      break;
    case 'high-reward':
      isActive = props.filters.minValue === 100;
      break;
    case 'dangerous':
      isActive = props.filters.difficulty === ContractDifficulty.DIFICIL;
      break;
    case 'no-deadline':
      isActive = props.filters.hasDeadline === false;
      break;
  }
  
  return isActive
    ? `${baseClasses} bg-amber-600 text-white`
    : `${baseClasses} bg-gray-700 text-gray-300 hover:bg-gray-600`;
}

function removeFilter(filterKey: string) {
  switch (filterKey) {
    case 'status':
      emit('update-status', '');
      break;
    case 'difficulty':
      emit('update-difficulty', '');
      break;
    case 'contractor':
      emit('update-contractor', '');
      break;
    case 'searchText':
      emit('update-search', '');
      break;
    case 'valueRange':
      emit('update-min-value', null);
      emit('update-max-value', null);
      break;
    case 'hasDeadline':
      emit('update-deadline', null);
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
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(209, 213, 219);
}

.filter-select {
  width: 100%;
  background-color: rgb(55, 65, 81);
  border: 1px solid rgb(75, 85, 99);
  border-radius: 0.375rem;
  color: white;
  font-size: 0.875rem;
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
  font-size: 0.875rem;
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
