<template>
  <div class="bg-gray-800 rounded-lg shadow-md p-4 border border-gray-700">
    <h3 class="text-lg font-semibold text-white mb-4">
      Contadores de Timeline
    </h3>

    <!-- Data atual -->
    <div class="mb-4 p-3 bg-blue-900/30 rounded-lg border border-blue-800/30">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-blue-300"
          >Data Atual do Jogo</span
        >
        <span class="text-lg font-bold text-blue-100">
          {{ formattedDate || "Timeline inativa" }}
        </span>
      </div>
    </div>

    <!-- Contadores de contratos -->
    <div v-if="contractCounters" class="space-y-3">
      <!-- Próximos novos contratos -->
      <div
        v-if="contractCounters.daysUntilNewContracts !== null"
        class="flex items-center justify-between p-3 bg-green-900/30 rounded-lg border border-green-800/30"
      >
        <div class="flex items-center space-x-2">
          <svg
            class="w-5 h-5 text-green-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            ></path>
          </svg>
          <span class="text-sm font-medium text-green-300"
            >Novos Contratos</span
          >
        </div>
        <span class="text-sm font-bold text-green-100">
          {{ formatDaysCounter(contractCounters.daysUntilNewContracts) }}
        </span>
      </div>

      <!-- Próximas resoluções -->
      <div
        v-if="contractCounters.daysUntilResolution !== null"
        class="flex items-center justify-between p-3 bg-yellow-900/30 rounded-lg border border-yellow-800/30"
      >
        <div class="flex items-center space-x-2">
          <svg
            class="w-5 h-5 text-yellow-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            ></path>
          </svg>
          <span class="text-sm font-medium text-yellow-300"
            >Resolução Automática</span
          >
        </div>
        <span class="text-sm font-bold text-yellow-100">
          {{ formatDaysCounter(contractCounters.daysUntilResolution) }}
        </span>
      </div>

      <!-- Próximo evento geral -->
      <div
        v-if="nextEvent"
        class="flex items-center justify-between p-3 bg-purple-900/30 rounded-lg border border-purple-800/30"
      >
        <div class="flex items-center space-x-2">
          <svg
            class="w-5 h-5 text-purple-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            ></path>
          </svg>
          <span class="text-sm font-medium text-purple-300"
            >Próximo Evento</span
          >
        </div>
        <span class="text-sm font-bold text-purple-100">
          {{ formatDaysCounter(daysUntilNext) }}
        </span>
      </div>
    </div>

    <!-- Estado sem dados -->
    <div
      v-if="!contractCounters && !nextEvent"
      class="text-center py-4 text-gray-400 text-sm"
    >
      <p>Nenhum evento agendado</p>
      <p class="text-xs mt-1 text-gray-500">
        Gere contratos para ver contadores
      </p>
    </div>

    <!-- Controle de tempo -->
    <div class="mt-4 pt-4 border-t border-gray-700">
      <!-- Status da timeline -->
      <div
        v-if="!currentDate"
        class="mb-3 p-3 bg-red-900/30 border border-red-800/30 rounded-lg"
      >
        <div class="flex items-center justify-between">
          <span class="text-sm text-red-300">Timeline não inicializada</span>
          <button
            @click="initializeTimeline"
            class="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700 transition-colors"
          >
            Inicializar
          </button>
        </div>
      </div>

      <div class="space-y-2">
        <button
          @click="handlePassDay"
          :disabled="!currentDate"
          class="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          Passar 1 Dia
        </button>

        <button
          @click="handleGenerateContracts"
          :disabled="!currentDate || !canGenerateContracts"
          class="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          Gerar Novos Contratos
        </button>

        <button
          @click="handlePassTime"
          :disabled="!currentDate"
          class="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          Passagem de Tempo
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useTimeline } from "@/composables/useTimeline";
import { useContractsStore } from "@/stores/contracts";

// Props
interface Props {
  showTimeControl?: boolean;
}

withDefaults(defineProps<Props>(), {
  showTimeControl: true,
});

// Stores e composables
const {
  currentDate,
  formattedDate,
  nextEvent,
  daysUntilNext,
  passDay,
  setDateFromValues,
} = useTimeline();

const contractsStore = useContractsStore();

// Computed
const contractCounters = computed(() => {
  if (!contractsStore.nextActions) return null;

  return {
    daysUntilNewContracts: contractsStore.nextActions.daysUntilNewContracts,
    daysUntilResolution: contractsStore.nextActions.daysUntilResolution,
  };
});

const canGenerateContracts = computed(
  () => contractsStore.canGenerateContracts
);

// Methods
function formatDaysCounter(days: number | null): string {
  if (days === null) return "N/A";
  if (days === 0) return "Hoje";
  if (days === 1) return "Amanhã";
  return `Em ${days} dias`;
}

function handlePassDay() {
  const result = passDay();
  if (result?.triggeredEvents.length) {
    // Eventos foram processados automaticamente
  }
}

function initializeTimeline() {
  // Inicializa a timeline com data padrão (1 de Janeiro, Ano 1)
  setDateFromValues(1, 1, 1);
}

function handleGenerateContracts() {
  contractsStore.generateContracts();
}

function handlePassTime() {
  // Implementar passagem de tempo customizada
  const days = prompt("Quantos dias passar?", "1");
  if (days && !isNaN(Number(days))) {
    const numDays = parseInt(days);
    for (let i = 0; i < numDays; i++) {
      passDay();
    }
  }
}
</script>
