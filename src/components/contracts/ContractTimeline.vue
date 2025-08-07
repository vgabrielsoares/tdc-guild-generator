<template>
  <div class="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
    <h3 class="text-xl font-semibold text-white mb-6">Timeline de Contratos</h3>

    <!-- Resumo temporal -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div
        class="bg-blue-900/30 p-4 rounded-lg text-center border border-blue-800/30"
      >
        <div class="text-2xl font-bold text-blue-400">
          {{ contractStats.available }}
        </div>
        <div class="text-sm text-blue-300">Disponíveis</div>
      </div>

      <div
        class="bg-green-900/30 p-4 rounded-lg text-center border border-green-800/30"
      >
        <div class="text-2xl font-bold text-green-400">
          {{ contractStats.inProgress }}
        </div>
        <div class="text-sm text-green-300">Em Andamento</div>
      </div>

      <div
        class="bg-yellow-900/30 p-4 rounded-lg text-center border border-yellow-800/30"
      >
        <div class="text-2xl font-bold text-yellow-400">
          {{ expiringContracts.length }}
        </div>
        <div class="text-sm text-yellow-300">Expirando Soon</div>
      </div>

      <div
        class="bg-purple-900/30 p-4 rounded-lg text-center border border-purple-800/30"
      >
        <div class="text-2xl font-bold text-purple-400">
          {{ contractStats.completed }}
        </div>
        <div class="text-sm text-purple-300">Concluídos</div>
      </div>
    </div>

    <!-- Contratos expirando -->
    <div v-if="expiringContracts.length > 0" class="mb-6">
      <h4 class="text-lg font-medium text-white mb-3">
        Contratos Expirando em Breve
      </h4>

      <div class="space-y-2">
        <div
          v-for="contract in expiringContracts"
          :key="contract.id"
          class="flex items-center justify-between p-3 bg-yellow-900/30 border border-yellow-800/30 rounded-lg"
        >
          <div class="flex-1">
            <div class="font-medium text-white">
              {{ contract.contractorType || "Contratante não definido" }}
            </div>
            <div class="text-sm text-gray-300">
              {{ contract.objective?.description || "Objetivo não definido" }}
            </div>
          </div>

          <div class="text-right">
            <div class="text-sm font-medium text-yellow-300">
              {{ getExpirationText(contract) }}
            </div>
            <div class="text-xs text-yellow-400">
              {{ formatValue(contract.value.finalGoldReward) }} PO$
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Eventos de timeline relacionados a contratos -->
    <div v-if="contractEvents.length > 0" class="mb-6">
      <h4 class="text-lg font-medium text-white mb-3">
        Próximos Eventos de Contratos
      </h4>

      <div class="space-y-2">
        <div
          v-for="event in contractEvents"
          :key="event.id"
          class="flex items-center justify-between p-3 bg-blue-900/30 border border-blue-800/30 rounded-lg"
        >
          <div class="flex items-center space-x-3">
            <div class="w-2 h-2 bg-blue-400 rounded-full"></div>
            <div>
              <div class="font-medium text-white">{{ event.description }}</div>
              <div class="text-sm text-gray-300">
                {{ formatEventDate(event.date) }}
              </div>
            </div>
          </div>

          <div class="text-sm font-medium text-blue-400">
            {{ getDaysUntilEvent(event.date) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Ações rápidas -->
    <div class="border-t border-gray-700 pt-6">
      <h4 class="text-lg font-medium text-white mb-3">Ações Rápidas</h4>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <button
          @click="$emit('generate-contracts')"
          :disabled="!canGenerateContracts"
          class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          Gerar Novos Contratos
        </button>

        <button
          @click="$emit('force-resolution')"
          :disabled="
            contractStats.available === 0 && contractStats.inProgress === 0
          "
          class="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          Forçar Resolução
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useTimeline } from "@/composables/useTimeline";
import { useContractsStore } from "@/stores/contracts";
import { ScheduledEventType } from "@/types/timeline";
import { ContractStatus } from "@/types/contract";
import type { GameDate } from "@/types/timeline";

// Emits
defineEmits<{
  "generate-contracts": [];
  "force-resolution": [];
  "pass-time": [];
}>();

// Stores e composables
const contractsStore = useContractsStore();
const { currentDate, events, dateUtils } = useTimeline();

// Computed
const contractStats = computed(() => contractsStore.contractStats);
const canGenerateContracts = computed(
  () => contractsStore.canGenerateContracts
);

// Contratos expirando em breve (próximos 3 dias)
const expiringContracts = computed(() => {
  if (!currentDate.value) return [];

  return contractsStore.contracts.filter((contract) => {
    if (!contract.expiresAt) return false;
    if (
      contract.status !== ContractStatus.DISPONIVEL &&
      contract.status !== ContractStatus.EM_ANDAMENTO
    )
      return false;

    const daysUntilExpiration = Math.ceil(
      (contract.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    return daysUntilExpiration >= 0 && daysUntilExpiration <= 3;
  });
});

// Eventos de timeline relacionados a contratos
const contractEvents = computed(() => {
  return events.value
    .filter(
      (event) =>
        event.type === ScheduledEventType.NEW_CONTRACTS ||
        event.type === ScheduledEventType.CONTRACT_RESOLUTION ||
        event.type === ScheduledEventType.CONTRACT_EXPIRATION
    )
    .slice(0, 5); // Mostrar apenas os próximos 5 eventos
});

// Methods
function getExpirationText(contract: { expiresAt?: Date }): string {
  if (!contract.expiresAt) return "Sem prazo";

  const daysUntilExpiration = Math.ceil(
    (contract.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  if (daysUntilExpiration < 0) return "Expirado";
  if (daysUntilExpiration === 0) return "Expira hoje";
  if (daysUntilExpiration === 1) return "Expira amanhã";
  return `Expira em ${daysUntilExpiration} dias`;
}

function formatValue(value: number): string {
  return value.toFixed(1);
}

function formatEventDate(date: GameDate): string {
  return dateUtils.format(date);
}

function getDaysUntilEvent(date: GameDate): string {
  if (!currentDate.value) return "";

  const days = dateUtils.getDaysDifference(currentDate.value, date);

  if (days < 0) return "Passou";
  if (days === 0) return "Hoje";
  if (days === 1) return "Amanhã";
  return `Em ${days} dias`;
}
</script>
