<template>
  <div class="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
    <!-- Header -->
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-xl font-semibold text-white">
        Timeline de {{ config.displayName }}
      </h3>
      <Tooltip
        :content="config.tooltipContent"
        :title="config.tooltipTitle"
        position="auto"
      >
        <InfoButton
          :help-key="config.helpKey"
          @open-help="$emit('open-help', config.helpKey)"
        />
      </Tooltip>
    </div>

    <!-- Resumo temporal (Cards de estatísticas) -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div
        v-for="(stat, index) in config.stats"
        :key="stat.key"
        :class="[
          'p-4 rounded-lg text-center border',
          getStatCardClasses(index),
        ]"
      >
        <div :class="['text-2xl font-bold', getStatTextClasses(index)]">
          {{ stat.value }}
        </div>
        <div :class="['text-sm', getStatLabelClasses(index)]">
          {{ stat.label }}
        </div>
      </div>
    </div>

    <!-- Items expirando em breve -->
    <div v-if="expiringItems.length > 0" class="mb-6">
      <h4 class="text-lg font-medium text-white mb-3">
        {{ config.displayName }} Expirando em Breve
      </h4>

      <div class="space-y-2">
        <div
          v-for="item in expiringItems"
          :key="item.id"
          class="flex items-center justify-between p-3 bg-yellow-900/30 border border-yellow-800/30 rounded-lg"
        >
          <div class="flex-1">
            <div class="font-medium text-white">
              {{ item.title || "Título não definido" }}
            </div>
            <div class="text-sm text-gray-300">
              {{ item.description || "Descrição não definida" }}
            </div>
          </div>

          <div class="text-right">
            <div class="text-sm font-medium text-yellow-300">
              {{ getExpirationText(item) }}
            </div>
            <div class="text-xs text-yellow-400" v-if="item.value">
              {{ formatValue(item.value) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Eventos de timeline -->
    <div v-if="relatedEvents.length > 0" class="mb-6">
      <h4 class="text-lg font-medium text-white mb-3">
        Próximos Eventos de {{ config.displayName }}
      </h4>

      <div class="space-y-2">
        <div
          v-for="event in relatedEvents"
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

    <!-- Ações principais -->
    <div class="flex justify-between items-center">
      <div v-if="currentTimeline" class="p-4 bg-gray-700/50 rounded-lg">
        <div class="text-sm text-gray-300">
          <span class="font-medium">Data atual:</span>
          {{ formattedCurrentDate || "Timeline inativa" }}
        </div>
      </div>

      <router-link
        to="/timeline"
        class="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors flex items-center"
      >
        <ClockIcon class="w-5 h-5 mr-2" />
        Gerenciar Tempo
      </router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { ClockIcon } from "@heroicons/vue/24/outline";
import { useTimeline } from "@/composables/useTimeline";
import { useTimelineStore } from "@/stores/timeline";
import { getDaysDifference } from "@/utils/date-utils";
import type { GameDate } from "@/types/timeline";
import InfoButton from "@/components/common/InfoButton.vue";
import Tooltip from "@/components/common/Tooltip.vue";

// Interfaces para tipagem
export interface ModuleTimelineStat {
  key: string;
  label: string;
  value: number;
}

export interface ModuleTimelineItem {
  id: string;
  title: string;
  description: string;
  deadlineDate?: GameDate;
  value?: string; // Valor formatado (ex: "100 PO$", "50 C$")
}

export interface ModuleTimelineConfig {
  displayName: string; // "Contratos", "Serviços", etc.
  helpKey: string; // Chave para o sistema de ajuda
  tooltipTitle: string;
  tooltipContent: string;
  stats: ModuleTimelineStat[];
  eventTypes: string[]; // Tipos de eventos a filtrar da timeline
}

// Props
interface Props {
  config: ModuleTimelineConfig;
  expiringItems: ModuleTimelineItem[];
}

const props = defineProps<Props>();

// Emits
defineEmits<{
  "open-help": [key: string];
}>();

// Composables e stores
const { currentDate, dateUtils, events } = useTimeline();
const timelineStore = useTimelineStore();

// Computed
const currentTimeline = computed(() => timelineStore.currentTimeline);
const formattedCurrentDate = computed(() => timelineStore.formattedCurrentDate);

// Eventos relacionados ao módulo
const relatedEvents = computed(() => {
  return events.value
    .filter((event) => props.config.eventTypes.includes(event.type))
    .slice(0, 5); // Mostrar apenas os próximos 5 eventos
});

// Classes dinâmicas para os cards de estatísticas
const statCardColors = [
  "bg-blue-900/30 border-blue-800/30", // Disponíveis
  "bg-green-900/30 border-green-800/30", // Em Andamento
  "bg-yellow-900/30 border-yellow-800/30", // Expirando/Com Prazo
  "bg-purple-900/30 border-purple-800/30", // Concluídos
];

const statTextColors = [
  "text-blue-400", // Disponíveis
  "text-green-400", // Em Andamento
  "text-yellow-400", // Expirando/Com Prazo
  "text-purple-400", // Concluídos
];

const statLabelColors = [
  "text-blue-300", // Disponíveis
  "text-green-300", // Em Andamento
  "text-yellow-300", // Expirando/Com Prazo
  "text-purple-300", // Concluídos
];

const getStatCardClasses = (index: number): string => {
  return statCardColors[index % statCardColors.length];
};

const getStatTextClasses = (index: number): string => {
  return statTextColors[index % statTextColors.length];
};

const getStatLabelClasses = (index: number): string => {
  return statLabelColors[index % statLabelColors.length];
};

// Funções helper
function getExpirationText(item: ModuleTimelineItem): string {
  if (!item.deadlineDate) return "Sem prazo";

  const current = currentDate.value;
  if (!current) return "Data não disponível";

  const daysUntilExpiration = getDaysDifference(current, item.deadlineDate);

  if (daysUntilExpiration < 0) return "Expirado";
  if (daysUntilExpiration === 0) return "Expira hoje";
  if (daysUntilExpiration === 1) return "Expira amanhã";
  return `Expira em ${daysUntilExpiration} dias`;
}

function formatValue(value: string): string {
  return value;
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

<style scoped></style>
