<template>
  <div class="space-y-6">
    <div class="text-center">
      <h1 class="text-3xl font-medieval font-bold text-gold-400 mb-4">
        <font-awesome-icon icon="scroll" class="mr-2" />
        Contratos da Guilda
      </h1>
      <p class="text-lg text-gray-300 mb-8">
        Gerencie contratos da sede da guilda atual
      </p>
    </div>

    <!-- Info da Guilda Atual -->
    <div v-if="guild" class="bg-gradient-to-r from-amber-900/20 to-yellow-900/20 border border-amber-600/50 rounded-lg p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-semibold text-amber-400 flex items-center">
          <font-awesome-icon icon="crown" class="mr-2" />
          {{ guild.name }}
        </h3>
        <span class="text-sm px-3 py-1 bg-amber-600 text-amber-100 rounded-full">
          {{ guild.settlementType }}
        </span>
      </div>
      
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div class="flex flex-col">
          <span class="text-gray-400 uppercase tracking-wide text-xs">Sede</span>
          <span class="text-white font-medium">{{ guild.structure.size }}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-gray-400 uppercase tracking-wide text-xs">Recursos</span>
          <span class="text-white font-medium">{{ guild.resources.level }}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-gray-400 uppercase tracking-wide text-xs">Rel. Governo</span>
          <span class="text-white font-medium">{{ guild.relations.government }}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-gray-400 uppercase tracking-wide text-xs">Rel. População</span>
          <span class="text-white font-medium">{{ guild.relations.population }}</span>
        </div>
      </div>

      <div class="mt-4 pt-4 border-t border-amber-600/30">
        <div class="flex items-center justify-between">
          <span class="text-sm text-amber-200">
            <font-awesome-icon icon="map-marker-alt" class="mr-2" />
            Sede localizada em: <span class="font-medium">{{ guild.settlementType }}</span>
          </span>
          <span class="text-xs text-gray-400">
            Criada em: {{ formatDate(guild.createdAt) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Aviso quando não há guilda -->
    <div v-else class="bg-red-900/20 border border-red-600/50 rounded-lg p-8 text-center">
      <font-awesome-icon icon="exclamation-triangle" class="text-red-400 text-4xl mb-4" />
      <h2 class="text-xl font-semibold text-red-400 mb-2">Nenhuma Guilda Encontrada</h2>
      <p class="text-gray-300 mb-6">
        Para gerar contratos, você precisa primeiro ter uma guilda ativa. 
        Acesse a página de Guildas para gerar uma nova sede.
      </p>
      <router-link 
        to="/guild" 
        class="inline-flex items-center px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
      >
        <font-awesome-icon icon="plus" class="mr-2" />
        Gerar Nova Guilda
      </router-link>
    </div>

    <!-- Contratos (só mostra se há guilda) -->
    <template v-if="guild">
      <!-- Botão de Gerar Contratos -->
      <div class="bg-gray-800 border border-gray-700 rounded-lg p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-semibold text-white mb-2">Contratos Disponíveis</h3>
            <p class="text-sm text-gray-400">
              Total de {{ contracts.length }} contratos para esta sede da guilda
            </p>
          </div>
          <div class="flex gap-3">
            <button
              @click="handleGenerateContracts"
              :disabled="isLoading"
              class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors flex items-center"
            >
              <font-awesome-icon 
                :icon="isLoading ? 'spinner' : 'plus'" 
                :class="{ 'animate-spin': isLoading }" 
                class="mr-2" 
              />
              {{ isLoading ? 'Gerando...' : contracts.length > 0 ? 'Gerar Novos' : 'Gerar Contratos' }}
            </button>
            <button
              v-if="contracts.length > 0"
              @click="handleRegenerateContracts"
              :disabled="isLoading"
              class="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 text-white font-medium rounded-lg transition-colors flex items-center"
            >
              <font-awesome-icon 
                :icon="isLoading ? 'spinner' : 'refresh'" 
                :class="{ 'animate-spin': isLoading }" 
                class="mr-2" 
              />
              Regenerar Todos
            </button>
          </div>
        </div>
      </div>

      <!-- Filtros Avançados -->
      <ContractFilters
        v-if="contracts.length > 0"
        :contracts="[...contracts]"
        :filters="currentFilters"
        @update-status="handleFilterUpdate('status', $event)"
        @update-difficulty="handleFilterUpdate('difficulty', $event)"
        @update-contractor="handleFilterUpdate('contractor', $event)"
        @update-search="handleFilterUpdate('searchText', $event)"
        @update-min-value="handleFilterUpdate('minValue', $event)"
        @update-max-value="handleFilterUpdate('maxValue', $event)"
        @update-deadline="handleFilterUpdate('hasDeadline', $event)"
        @clear-filters="handleClearFilters"
      />

      <!-- Lista de Contratos -->
      <ContractList
        :contracts="[...filteredContracts]"
        :is-loading="isLoading"
        :show-actions="true"
        :show-filters="false"
        :can-generate="false"
        :active-status-filter="null"
        :current-page="currentPage"
        :page-size="pageSize"
        @accept="handleAcceptContract"
        @complete="handleCompleteContract"
        @abandon="handleAbandonContract"
        @view-details="handleViewContractDetails"
        @page-change="handlePageChange"
      />
    </template>

    <!-- Modal de Detalhes do Contrato -->
    <ContractDetails
      :is-open="showContractDetails"
      :contract="selectedContract"
      :show-debug-info="false"
      @close="handleCloseDetails"
      @accept="handleAcceptContractFromDetails"
      @complete="handleCompleteContractFromDetails"
      @abandon="handleAbandonContractFromDetails"
    />

    <!-- Toast para feedback -->
    <div
      v-if="toastMessage"
      class="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50"
    >
      {{ toastMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useContractsStore } from '@/stores/contracts';
import { useGuildStore } from '@/stores/guild';
import type { Contract } from '@/types/contract';
import ContractList from '@/components/contracts/ContractList.vue';
import ContractFilters from '@/components/contracts/ContractFilters.vue';
import ContractDetails from '@/components/contracts/ContractDetails.vue';

// Interface para os filtros
interface ContractFilterState {
  status: string;
  difficulty: string;
  contractor: string;
  searchText: string;
  minValue: number | null;
  maxValue: number | null;
  hasDeadline: boolean | null;
}

// ===== STORES =====
const contractsStore = useContractsStore();
const guildStore = useGuildStore();

// ===== STATE =====
const currentPage = ref(1);
const pageSize = ref(5);
const toastMessage = ref<string>('');

// Modal de detalhes
const showContractDetails = ref(false);
const selectedContract = ref<Contract | null>(null);

// Filtros locais
const currentFilters = ref<ContractFilterState>({
  status: '',
  difficulty: '',
  contractor: '',
  searchText: '',
  minValue: null,
  maxValue: null,
  hasDeadline: null,
});

// ===== COMPUTED =====
const contracts = computed(() => contractsStore.contracts);
const isLoading = computed(() => contractsStore.isLoading);
const guild = computed(() => guildStore.currentGuild);

// Contratos filtrados com base nos filtros locais
const filteredContracts = computed(() => {
  let result = contracts.value;

  // Filtro por status
  if (currentFilters.value.status) {
    result = result.filter(c => c.status === currentFilters.value.status);
  }

  // Filtro por dificuldade
  if (currentFilters.value.difficulty) {
    result = result.filter(c => c.difficulty === currentFilters.value.difficulty);
  }

  // Filtro por contratante
  if (currentFilters.value.contractor) {
    result = result.filter(c => c.contractorType === currentFilters.value.contractor);
  }

  // Filtro por texto de busca
  if (currentFilters.value.searchText) {
    const searchLower = currentFilters.value.searchText.toLowerCase().trim();
    result = result.filter(c =>
      c.title.toLowerCase().includes(searchLower) ||
      c.description.toLowerCase().includes(searchLower) ||
      c.objective?.description.toLowerCase().includes(searchLower) ||
      c.contractorName?.toLowerCase().includes(searchLower)
    );
  }

  // Filtro por valor mínimo
  if (currentFilters.value.minValue !== null) {
    result = result.filter(c => c.value.finalGoldReward >= currentFilters.value.minValue!);
  }

  // Filtro por valor máximo
  if (currentFilters.value.maxValue !== null) {
    result = result.filter(c => c.value.finalGoldReward <= currentFilters.value.maxValue!);
  }

  // Filtro por prazo
  if (currentFilters.value.hasDeadline !== null) {
    if (currentFilters.value.hasDeadline) {
      result = result.filter(c => c.deadline.type !== 'Sem prazo');
    } else {
      result = result.filter(c => c.deadline.type === 'Sem prazo');
    }
  }

  return result;
});

// ===== METHODS =====

// Métodos para lidar com contratos
async function handleAcceptContract(contract: Contract) {
  try {
    contractsStore.acceptContract(contract.id);
    showToast(`Contrato "${contract.title || contract.id.slice(0, 6)}" aceito!`);
  } catch (error) {
    showToast('Erro ao aceitar contrato');
  }
}

async function handleCompleteContract(contract: Contract) {
  try {
    contractsStore.completeContract(contract.id);
    showToast(`Contrato "${contract.title || contract.id.slice(0, 6)}" concluído!`);
  } catch (error) {
    showToast('Erro ao concluir contrato');
  }
}

async function handleAbandonContract(contract: Contract) {
  try {
    const penalty = contractsStore.breakContract(contract.id);
    if (penalty > 0) {
      showToast(`Contrato abandonado. Multa: ${penalty} PO$`);
    } else {
      showToast(`Contrato "${contract.title || contract.id.slice(0, 6)}" abandonado.`);
    }
  } catch (error) {
    showToast('Erro ao abandonar contrato');
  }
}

// Métodos para modal de detalhes
function handleViewContractDetails(contract: Contract) {
  selectedContract.value = contract;
  showContractDetails.value = true;
}

function handleCloseDetails() {
  showContractDetails.value = false;
  selectedContract.value = null;
}

function handleAcceptContractFromDetails(contract: Contract) {
  handleAcceptContract(contract);
  handleCloseDetails();
}

function handleCompleteContractFromDetails(contract: Contract) {
  handleCompleteContract(contract);
  handleCloseDetails();
}

function handleAbandonContractFromDetails(contract: Contract) {
  handleAbandonContract(contract);
  handleCloseDetails();
}

// Métodos para geração de contratos
async function handleGenerateContracts() {
  try {
    if (!guild.value) {
      showToast('É necessário ter uma guilda ativa para gerar contratos');
      return;
    }
    
    // Gerar novos contratos usando a guilda atual
    await contractsStore.generateContracts();
    currentPage.value = 1; // Reset para primeira página
    showToast(`Novos contratos gerados para a guilda "${guild.value.name}"!`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    showToast(`Erro ao gerar contratos: ${errorMessage}`);
  }
}

async function handleRegenerateContracts() {
  try {
    if (!guild.value) {
      showToast('É necessário ter uma guilda ativa para regenerar contratos');
      return;
    }
    
    // Confirmar se há contratos para limpar
    if (contracts.value.length > 0) {
      // Limpar contratos existentes
      contractsStore.clearContracts();
      showToast('Contratos anteriores removidos.');
    }
    
    // Gerar novos contratos
    await contractsStore.generateContracts();
    currentPage.value = 1; // Reset para primeira página
    showToast(`Contratos regenerados para a guilda "${guild.value.name}"!`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    showToast(`Erro ao regenerar contratos: ${errorMessage}`);
  }
}

// Métodos para filtros
function handleFilterUpdate(filterKey: keyof ContractFilterState, value: string | number | boolean | null) {
  currentFilters.value[filterKey] = value as never;
  currentPage.value = 1; // Reset para primeira página quando filtrar
}

function handleClearFilters() {
  currentFilters.value = {
    status: '',
    difficulty: '',
    contractor: '',
    searchText: '',
    minValue: null,
    maxValue: null,
    hasDeadline: null,
  };
  currentPage.value = 1;
}

// Método para paginação
function handlePageChange(page: number) {
  currentPage.value = page;
}

// Utility para toast
function showToast(message: string) {
  toastMessage.value = message;
  setTimeout(() => {
    toastMessage.value = '';
  }, 3000);
}

// Utility para formatação de data
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

// ===== LIFECYCLE =====
onMounted(async () => {
  // Carregar dados do store
  await contractsStore.initializeStore();
  
  // Se não há guilda ativa, limpar contratos órfãos
  if (!guild.value) {
    if (contracts.value.length > 0) {
      contractsStore.clearContractsForNewGuild();
      showToast('Contratos removidos - nenhuma guilda ativa.');
    }
    return;
  }
  
  // Se há guilda mas não há contratos, o usuário pode gerar clicando no botão
});
</script>
