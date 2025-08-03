<template>
  <div class="space-y-8">
    <div class="text-center">
      <h1 class="text-3xl font-medieval font-bold text-gold-400 mb-4">
        <font-awesome-icon icon="scroll" class="mr-2" />
        Contratos da Guilda
      </h1>
      <p class="text-lg text-gray-300 mb-8">
        Explore contratos disponíveis com valores dinâmicos e modificadores baseados na estrutura da guilda.
      </p>
    </div>

    <!-- Componente principal de contratos -->
    <ContractList
      :contracts="[...contracts]"
      :is-loading="isLoading"
      :show-actions="true"
      :show-filters="true"
      :can-generate="!isLoading"
      :active-status-filter="activeFilter"
      :current-page="currentPage"
      :page-size="pageSize"
      @accept="handleAcceptContract"
      @complete="handleCompleteContract"
      @abandon="handleAbandonContract"
      @view-details="handleViewContractDetails"
      @regenerate="handleRegenerateContracts"
      @generate="handleGenerateContracts"
      @filter-status="handleFilterStatus"
      @page-change="handlePageChange"
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
import { ContractStatus } from '@/types/contract';
import ContractList from '@/components/contracts/ContractList.vue';

// ===== STORES =====
const contractsStore = useContractsStore();
const guildStore = useGuildStore();

// ===== STATE =====
const activeFilter = ref<ContractStatus | null>(null);
const currentPage = ref(1);
const pageSize = ref(10);
const toastMessage = ref<string>('');

// ===== COMPUTED =====
const contracts = computed(() => contractsStore.contracts);
const isLoading = computed(() => contractsStore.isLoading);
const guild = computed(() => guildStore.currentGuild);

// ===== METHODS =====

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function handleViewContractDetails(_contract: Contract) {
  // TODO: Implementar modal de detalhes na Issue 4.17
  showToast('Detalhes do contrato em desenvolvimento');
}

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

function handleFilterStatus(status: ContractStatus | null) {
  activeFilter.value = status;
  currentPage.value = 1; // Reset para primeira página
}

function handlePageChange(page: number) {
  currentPage.value = page;
}

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
