<template>
  <div class="bg-gray-800 rounded-lg shadow-md border border-gray-700">
    <!-- Cabeçalho -->
    <div class="flex items-center justify-between p-4 border-b border-gray-700">
      <h3 class="text-lg font-semibold text-white">Navegação Temporal</h3>
      <Tooltip
        content="Controles para navegar e filtrar eventos da timeline, além de gerenciar a passagem do tempo."
        title="Navegação da Timeline"
        position="auto"
      >
        <InfoButton
          help-key="timeline-navigation"
          @open-help="$emit('open-help', 'timeline-navigation')"
        />
      </Tooltip>
    </div>

    <!-- Status da timeline -->
    <div class="p-4 border-b border-gray-700">
      <div
        v-if="!currentDate"
        class="p-3 bg-red-900/30 border border-red-800/30 rounded-lg"
      >
        <div class="flex items-center justify-between">
          <span class="text-sm text-red-300">Timeline não inicializada</span>
          <button
            @click="initializeTimeline"
            class="text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
          >
            Inicializar
          </button>
        </div>
      </div>

      <div v-else class="space-y-3">
        <!-- Data atual -->
        <div
          class="flex items-center justify-between p-3 bg-blue-900/30 border border-blue-800/30 rounded-lg"
        >
          <span class="text-sm font-medium text-blue-300">Data Atual</span>
          <span class="text-lg font-bold text-blue-100">
            {{ formattedDate }}
          </span>
        </div>

        <!-- Status dos próximos eventos -->
        <div
          v-if="timelineStatus"
          class="p-3 rounded-lg border"
          :class="getStatusStyles(timelineStatus.status)"
        >
          <div class="flex items-center space-x-2">
            <div
              class="w-2 h-2 rounded-full"
              :class="getStatusIndicator(timelineStatus.status)"
            ></div>
            <span
              class="text-sm"
              :class="getStatusTextColor(timelineStatus.status)"
            >
              {{ timelineStatus.message }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Controles de navegação temporal -->
    <div class="p-4 border-b border-gray-700">
      <h4 class="text-md font-medium text-gray-300 mb-3">Passagem de Tempo</h4>

      <div class="grid grid-cols-2 gap-2 mb-3">
        <button
          @click="handlePassDay(1)"
          :disabled="!currentDate"
          class="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          +1 Dia
        </button>

        <button
          @click="handlePassDay(7)"
          :disabled="!currentDate"
          class="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          +1 Semana
        </button>

        <button
          @click="handlePassDay(30)"
          :disabled="!currentDate"
          class="bg-purple-600 text-white px-3 py-2 rounded-lg hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          +1 Mês
        </button>

        <button
          @click="handlePassDay(365)"
          :disabled="!currentDate"
          class="bg-orange-600 text-white px-3 py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm font-medium"
        >
          +1 Ano
        </button>
      </div>

      <!-- Aviso sobre eventos -->
      <div
        v-if="hasEventsToday()"
        class="p-2 bg-yellow-900/30 border border-yellow-800/30 rounded text-xs text-yellow-300"
      >
        <ExclamationTriangleIcon class="w-6 h-6 mx-auto text-gray-500" />
        Existem eventos hoje que serão processados
      </div>
    </div>

    <!-- Filtros de visualização -->
    <div class="p-4 border-b border-gray-700">
      <h4 class="text-md font-medium text-gray-300 mb-3">Filtros de Período</h4>

      <div class="space-y-2">
        <button
          @click="setTimeFilter('today')"
          :class="[
            'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
            timeFilter === 'today'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
          ]"
        >
          Eventos de Hoje ({{ todayEventsCount }})
        </button>

        <button
          @click="setTimeFilter('week')"
          :class="[
            'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
            timeFilter === 'week'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
          ]"
        >
          Próximos 7 Dias ({{ weekEventsCount }})
        </button>

        <button
          @click="setTimeFilter('month')"
          :class="[
            'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
            timeFilter === 'month'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
          ]"
        >
          Próximos 30 Dias ({{ monthEventsCount }})
        </button>

        <button
          @click="setTimeFilter('all')"
          :class="[
            'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
            timeFilter === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600',
          ]"
        >
          Todos os Eventos ({{ events.length }})
        </button>
      </div>
    </div>

    <!-- Data customizada -->
    <div class="p-4">
      <h4 class="text-md font-medium text-gray-300 mb-3">
        Definir Data Específica
      </h4>

      <div class="grid grid-cols-3 gap-2 mb-3">
        <div>
          <label class="block text-xs text-gray-400 mb-1">Dia</label>
          <input
            v-model.number="customDate.day"
            type="number"
            min="1"
            max="31"
            class="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
            :disabled="!currentDate"
          />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">Mês</label>
          <input
            v-model.number="customDate.month"
            type="number"
            min="1"
            max="12"
            class="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
            :disabled="!currentDate"
          />
        </div>
        <div>
          <label class="block text-xs text-gray-400 mb-1">Ano</label>
          <input
            v-model.number="customDate.year"
            type="number"
            min="1"
            class="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white text-sm"
            :disabled="!currentDate"
          />
        </div>
      </div>

      <button
        @click="setCustomDate"
        :disabled="!currentDate || !isValidCustomDate"
        class="w-full bg-indigo-600 text-white px-3 py-2 rounded-lg hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm font-medium"
      >
        Definir Data
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useTimeline } from "@/composables/useTimeline";
import { useTimelineStore } from "@/stores/timeline";
import { useGuildStore } from "@/stores/guild";
import { useContractsStore } from "@/stores/contracts";
import { useServicesStore } from "@/stores/services";
import { createGameDate } from "@/utils/date-utils";
import InfoButton from "@/components/common/InfoButton.vue";
import Tooltip from "@/components/common/Tooltip.vue";
import { ExclamationTriangleIcon } from "@heroicons/vue/24/solid";

// Types
type TimeFilter = "today" | "week" | "month" | "all";
type TimelineStatus =
  | "inactive"
  | "events-today"
  | "events-scheduled"
  | "no-events";

// Emits
const emit = defineEmits<{
  "open-help": [key: string];
  "time-filter-change": [filter: TimeFilter];
  "time-advance": [days: number];
}>();

// State
const timeFilter = ref<TimeFilter>("all");
const customDate = ref({
  day: 1,
  month: 1,
  year: 1000,
});

// Stores e composables
const guildStore = useGuildStore();
const contractsStore = useContractsStore();
const servicesStore = useServicesStore();
const timelineStore = useTimelineStore();
const {
  currentDate,
  formattedDate,
  events,
  hasEventsToday,
  passDays,
  setDateFromValues,
  getTimelineStatus,
  dateUtils,
} = useTimeline();

// Computed
const timelineStatus = computed(() => {
  return getTimelineStatus();
});

// Computed - Contadores de eventos por período
const todayEventsCount = computed(() => {
  const current = currentDate.value;
  if (!current) return 0;

  return events.value.filter((event) => {
    const days = dateUtils.getDaysDifference(current, event.date);
    return days === 0;
  }).length;
});

const weekEventsCount = computed(() => {
  const current = currentDate.value;
  if (!current) return 0;

  return events.value.filter((event) => {
    const days = dateUtils.getDaysDifference(current, event.date);
    return days >= 0 && days <= 7;
  }).length;
});

const monthEventsCount = computed(() => {
  const current = currentDate.value;
  if (!current) return 0;

  return events.value.filter((event) => {
    const days = dateUtils.getDaysDifference(current, event.date);
    return days >= 0 && days <= 30;
  }).length;
});

const isValidCustomDate = computed(() => {
  const { day, month, year } = customDate.value;
  return day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 1;
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
async function initializeTimeline() {
  // Verificar se há guilda atual
  const currentGuild = guildStore.currentGuild;
  if (!currentGuild) {
    return;
  }

  // Inicializar timeline com data padrão
  const startDate = createGameDate(1, 1, 1000);
  const timeline = timelineStore.initializeTimelineForCurrentGuild(startDate);

  if (!timeline) {
    return;
  }

  // Aguardar um tick para garantir que a timeline esteja totalmente inicializada
  await new Promise((resolve) => setTimeout(resolve, 10));

  // Gerar contratos e serviços iniciais de uma vez
  try {
    // Primeiro gerar contratos
    await contractsStore.generateContracts();

    // Depois gerar serviços
    await servicesStore.generateServices(currentGuild);

    // Salvar a guilda no histórico
    guildStore.addToHistory(currentGuild);

    // Bloquear a guilda
    guildStore.toggleGuildLock(currentGuild.id);
  } catch (error) {
    // Erro tratado pelos stores individuais - adicionar log se necessário
  }
}

function handlePassDay(days: number) {
  const result = passDays(days);
  emit("time-advance", days);

  if (result?.triggeredEvents.length) {
    // Timeline processou eventos automaticamente
  }
}

function setTimeFilter(filter: TimeFilter) {
  timeFilter.value = filter;
  emit("time-filter-change", filter);
}

function setCustomDate() {
  if (!isValidCustomDate.value) return;

  const { day, month, year } = customDate.value;
  setDateFromValues(day, month, year);
}

function getStatusStyles(status: string): string {
  const styles = {
    inactive: "bg-red-900/30 border-red-800/30",
    "events-today": "bg-yellow-900/30 border-yellow-800/30",
    "events-scheduled": "bg-green-900/30 border-green-800/30",
    "no-events": "bg-gray-900/30 border-gray-800/30",
  };

  return styles[status as TimelineStatus] || styles["no-events"];
}

function getStatusIndicator(status: string): string {
  const indicators = {
    inactive: "bg-red-400",
    "events-today": "bg-yellow-400",
    "events-scheduled": "bg-green-400",
    "no-events": "bg-gray-400",
  };

  return indicators[status as TimelineStatus] || indicators["no-events"];
}

function getStatusTextColor(status: string): string {
  const colors = {
    inactive: "text-red-300",
    "events-today": "text-yellow-300",
    "events-scheduled": "text-green-300",
    "no-events": "text-gray-300",
  };

  return colors[status as TimelineStatus] || colors["no-events"];
}
</script>
