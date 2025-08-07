<template>
  <div class="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
    <h3 class="text-xl font-semibold text-white mb-6">Controle de Timeline</h3>

    <!-- Data atual e informações -->
    <div class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <label class="text-sm font-medium text-gray-300"
          >Data Atual do Jogo</label
        >
        <span class="text-lg font-bold text-blue-400">
          {{ formattedDate || "Timeline não ativa" }}
        </span>
      </div>

      <!-- Status da timeline -->
      <div
        v-if="timelineStatus"
        class="p-3 rounded-lg border"
        :class="getStatusClass(timelineStatus.status)"
      >
        <div class="flex items-center space-x-2">
          <div
            class="w-2 h-2 rounded-full"
            :class="getStatusDotClass(timelineStatus.status)"
          ></div>
          <span class="text-sm font-medium">{{ timelineStatus.message }}</span>
        </div>
      </div>
    </div>

    <!-- Controles de passagem de tempo -->
    <div class="space-y-4">
      <h4 class="text-md font-medium text-gray-300">Passagem de Tempo</h4>

      <div class="grid grid-cols-2 gap-3">
        <button
          @click="handlePassDay"
          :disabled="!currentDate"
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          +1 Dia
        </button>

        <button
          @click="() => passDays(7)"
          :disabled="!currentDate"
          class="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          +1 Semana
        </button>

        <button
          @click="() => passWeeks(2)"
          :disabled="!currentDate"
          class="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          +2 Semanas
        </button>

        <button
          @click="() => passMonths(1)"
          :disabled="!currentDate"
          class="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          +1 Mês
        </button>
      </div>
    </div>

    <!-- Definir data customizada -->
    <div class="mt-6 pt-6 border-t border-gray-700">
      <h4 class="text-md font-medium text-gray-300 mb-4">
        Definir Data Específica
      </h4>

      <div class="grid grid-cols-3 gap-3 mb-4">
        <div>
          <label class="block text-xs font-medium text-gray-400 mb-1"
            >Dia</label
          >
          <input
            v-model.number="customDate.day"
            type="number"
            min="1"
            max="31"
            class="w-full px-3 py-2 border border-gray-600 rounded-md text-sm bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="1"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-400 mb-1"
            >Mês</label
          >
          <select
            v-model.number="customDate.month"
            class="w-full px-3 py-2 border border-gray-600 rounded-md text-sm bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option
              v-for="(month, index) in monthNames"
              :key="index"
              :value="index + 1"
            >
              {{ month }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-400 mb-1"
            >Ano</label
          >
          <input
            v-model.number="customDate.year"
            type="number"
            min="1"
            class="w-full px-3 py-2 border border-gray-600 rounded-md text-sm bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="1000"
          />
        </div>
      </div>

      <button
        @click="handleSetCustomDate"
        :disabled="!isValidCustomDate"
        class="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm font-medium"
      >
        Definir Data
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useTimeline } from "@/composables/useTimeline";
import type { GameDate } from "@/types/timeline";

// Stores e composables
const {
  currentDate,
  formattedDate,
  passDay,
  passDays,
  passWeeks,
  passMonths,
  setDate,
  events,
} = useTimeline();

// Estados locais
const customDate = ref<GameDate>({
  day: 1,
  month: 1,
  year: 1000,
});

const monthNames = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

// Computed
const timelineStatus = computed(() => {
  if (!currentDate.value) {
    return {
      status: "inactive",
      message: "Timeline não iniciada",
    };
  }

  const nextEvent = events.value.find(
    (e) =>
      e.date.year >= currentDate.value!.year &&
      e.date.month >= currentDate.value!.month &&
      e.date.day >= currentDate.value!.day
  );

  if (nextEvent) {
    return {
      status: "active",
      message: `Próximo evento: ${nextEvent.description}`,
    };
  }

  return {
    status: "waiting",
    message: "Nenhum evento agendado",
  };
});

const isValidCustomDate = computed(() => {
  return (
    customDate.value.day >= 1 &&
    customDate.value.day <= 31 &&
    customDate.value.month >= 1 &&
    customDate.value.month <= 12 &&
    customDate.value.year >= 1
  );
});

// Watchers
watch(
  currentDate,
  (newDate) => {
    if (newDate) {
      customDate.value = { ...newDate };
    }
  },
  { immediate: true }
);

// Methods
function handlePassDay() {
  const result = passDay();
  if (result?.triggeredEvents.length) {
    // Eventos foram processados automaticamente
  }
}

function handleSetCustomDate() {
  if (isValidCustomDate.value) {
    setDate(customDate.value);
  }
}

function getStatusClass(status: string): string {
  switch (status) {
    case "active":
      return "bg-green-900/30 border-green-800/30 text-green-300";
    case "waiting":
      return "bg-yellow-900/30 border-yellow-800/30 text-yellow-300";
    case "inactive":
      return "bg-red-900/30 border-red-800/30 text-red-300";
    default:
      return "bg-gray-700 border-gray-600 text-gray-300";
  }
}

function getStatusDotClass(status: string): string {
  switch (status) {
    case "active":
      return "bg-green-400";
    case "waiting":
      return "bg-yellow-400";
    case "inactive":
      return "bg-red-400";
    default:
      return "bg-gray-400";
  }
}
</script>
