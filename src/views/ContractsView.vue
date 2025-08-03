<template>
  <div class="space-y-6">
    <div class="text-center">
      <h1 class="text-3xl font-medieval font-bold text-gold-400 mb-4">
        <font-awesome-icon icon="scroll" class="mr-2" />
        Contratos da Guilda
      </h1>
      <p class="text-lg text-gray-300 mb-8">
        Explore contratos disponíveis com valores dinâmicos e modificadores baseados na estrutura da guilda.
      </p>
    </div>

    <!-- Filtros Avançados -->
    <ContractFilters
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

    <!-- Componente principal de contratos -->
    <ContractList
      :contracts="[...filteredContracts]"
      :is-loading="isLoading"
      :show-actions="true"
      :show-filters="false"
      :can-generate="!isLoading"
      :active-status-filter="null"
      :current-page="currentPage"
      :page-size="pageSize"
      @accept="handleAcceptContract"
      @complete="handleCompleteContract"
      @abandon="handleAbandonContract"
      @view-details="handleViewContractDetails"
      @regenerate="handleRegenerateContracts"
      @generate="handleGenerateContracts"
      @page-change="handlePageChange"
    />

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

    <!-- Debug/Info sobre a guilda atual -->
    <div v-if="guild" class="bg-gray-800 border border-gray-700 rounded-lg p-4 text-sm">
      <h3 class="text-amber-400 font-semibold mb-2">Info da Guilda Atual</h3>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-2 text-gray-300">
        <div>
          <span class="text-gray-500">Sede:</span> {{ guild.structure.size }}
        </div>
        <div>
          <span class="text-gray-500">Recursos:</span> {{ guild.resources.level }}
        </div>
        <div>
          <span class="text-gray-500">Governo:</span> {{ guild.relations.government }}
        </div>
        <div>
          <span class="text-gray-500">População:</span> {{ guild.relations.population }}
        </div>
      </div>
    </div>

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
const pageSize = ref(10);
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
async function handleRegenerateContracts() {
  try {
    if (!guild.value) {
      showToast('É necessário ter uma guilda para gerar contratos');
      return;
    }
    
    // Limpar contratos existentes
    contractsStore.clearContracts();
    
    // Gerar novos contratos
    await contractsStore.generateContracts();
    currentPage.value = 1; // Reset para primeira página
    showToast('Contratos regenerados com sucesso!');
  } catch (error) {
    showToast('Erro ao regenerar contratos');
  }
}

async function handleGenerateContracts() {
  await handleRegenerateContracts();
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

// ===== LIFECYCLE =====
onMounted(async () => {
  // Carregar dados do store
  await contractsStore.initializeStore();
  
  // Se não há guilda, gerar uma
  if (!guild.value) {
    showToast('Gerando guilda para começar...');
    const { SettlementType } = await import('@/types/guild');
    await guildStore.generateQuickGuildAction(SettlementType.POVOADO, 'Guilda Padrão');
  }
  
  // Se não há contratos, gerar alguns
  if (contracts.value.length === 0 && guild.value) {
    await handleGenerateContracts();
  }
});
</script>
