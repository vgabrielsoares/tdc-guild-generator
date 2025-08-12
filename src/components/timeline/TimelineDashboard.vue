<template>
  <div class="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-xl font-semibold text-white">Dashboard de Timeline</h3>
      <Tooltip
        content="Sistema unificado de evolução temporal da guilda: contratos, serviços, membros, mural e renome."
        title="Timeline da Guilda"
        position="auto"
      >
        <InfoButton
          help-key="guild-timeline"
          @open-help="$emit('open-help', 'guild-timeline')"
        />
      </Tooltip>
    </div>

    <!-- Data atual -->
    <div class="mb-6 p-4 bg-blue-900/30 rounded-lg border border-blue-800/30">
      <div class="flex items-center justify-between">
        <span class="text-sm font-medium text-blue-300"
          >Data Atual do Jogo</span
        >
        <span class="text-xl font-bold text-blue-100">
          {{ formattedDate || "Timeline inativa" }}
        </span>
      </div>
    </div>

    <!-- Resumo de estatísticas por módulo -->
    <div class="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      <!-- Contratos -->
      <div
        class="bg-emerald-900/30 p-4 rounded-lg text-center border border-emerald-800/30"
      >
        <div class="text-2xl font-bold text-emerald-400">
          {{ moduleStats.contracts.active }}
        </div>
        <div class="text-sm text-emerald-300">Contratos Ativos</div>
      </div>

      <!-- Serviços (preparação para futuro) -->
      <div
        class="bg-amber-900/30 p-4 rounded-lg text-center border border-amber-800/30"
      >
        <div class="text-2xl font-bold text-amber-400">
          {{ moduleStats.services.active }}
        </div>
        <div class="text-sm text-amber-300">Serviços Ativos</div>
      </div>

      <!-- Membros (preparação para futuro) -->
      <div
        class="bg-purple-900/30 p-4 rounded-lg text-center border border-purple-800/30"
      >
        <div class="text-2xl font-bold text-purple-400">
          {{ moduleStats.members.available }}
        </div>
        <div class="text-sm text-purple-300">Membros Disponíveis</div>
      </div>

      <!-- Mural (preparação para futuro) -->
      <div
        class="bg-blue-900/30 p-4 rounded-lg text-center border border-blue-800/30"
      >
        <div class="text-2xl font-bold text-blue-400">
          {{ moduleStats.notices.active }}
        </div>
        <div class="text-sm text-blue-300">Avisos Ativos</div>
      </div>

      <!-- Próximos eventos -->
      <div
        class="bg-rose-900/30 p-4 rounded-lg text-center border border-rose-800/30"
      >
        <div class="text-2xl font-bold text-rose-400">
          {{ nextEventDays !== null ? nextEventDays : "∞" }}
        </div>
        <div class="text-sm text-rose-300">
          {{ nextEventDays !== null ? "Dias até próximo" : "Sem eventos" }}
        </div>
      </div>
    </div>

    <!-- Eventos prioritários (próximos 7 dias) -->
    <div v-if="upcomingEvents.length > 0" class="mb-6">
      <h4 class="text-lg font-medium text-white mb-3">
        Próximos Eventos (7 dias)
      </h4>

      <div class="space-y-2">
        <div
          v-for="event in upcomingEvents"
          :key="event.id"
          class="flex items-center justify-between p-3 border rounded-lg"
          :class="getEventStyles(event.type)"
        >
          <div class="flex items-center space-x-3">
            <div
              class="w-3 h-3 rounded-full"
              :class="getEventIconColor(event.type)"
            ></div>
            <div>
              <div class="font-medium text-white">{{ event.description }}</div>
              <div class="text-sm text-gray-300">
                {{ formatEventDate(event.date) }}
              </div>
            </div>
          </div>

          <div class="text-right">
            <div
              class="text-sm font-medium"
              :class="getEventTextColor(event.type)"
            >
              {{ getDaysUntilEvent(event.date) }}
            </div>
            <div class="text-xs text-gray-400">
              {{ getEventTypeLabel(event.type) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Sem eventos próximos -->
    <div v-else class="text-center py-6 text-gray-400">
      <div class="text-lg mb-2">
        <CalendarIcon class="w-6 h-6 mx-auto text-gray-500" />
      </div>
      <p class="text-sm">Nenhum evento nos próximos 7 dias</p>
      <p class="text-xs mt-1 text-gray-500">
        A timeline está tranquila por enquanto
      </p>
    </div>

    <!-- Widget específico de contratos -->
    <div class="mt-6">
      <ContractTimelineWidget
        @open-help="$emit('open-help', 'contract-lifecycle')"
        @generate-contracts="$emit('generate-contracts')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useTimeline } from "@/composables/useTimeline";
import { useContractsStore } from "@/stores/contracts";
import InfoButton from "@/components/common/InfoButton.vue";
import Tooltip from "@/components/common/Tooltip.vue";
import ContractTimelineWidget from "@/components/timeline/ContractTimelineWidget.vue";
import { ScheduledEventType, type GameDate } from "@/types/timeline";
import { CalendarIcon } from "@heroicons/vue/24/solid";

// Emits
defineEmits<{
  "open-help": [key: string];
  "generate-contracts": [];
}>();

// Stores e composables
const { currentDate, formattedDate, daysUntilNext, events, dateUtils } =
  useTimeline();

const contractsStore = useContractsStore();

// Computed - Estatísticas por módulo
const moduleStats = computed(() => {
  const contractStats = contractsStore.contractStats;

  return {
    contracts: {
      active:
        contractStats.available +
        contractStats.inProgress +
        contractStats.accepted,
      total: contractStats.total,
    },
    services: {
      active: 0, // TODO: implementar quando serviços estiverem prontos
      total: 0,
    },
    members: {
      available: 0, // TODO: implementar quando membros estiverem prontos
      total: 0,
    },
    notices: {
      active: 0, // TODO: implementar quando mural estiver pronto
      total: 0,
    },
  };
});

// Computed - Próximos eventos (7 dias)
const upcomingEvents = computed(() => {
  const current = currentDate.value;
  if (!current) return [];

  return events.value
    .filter((event) => {
      const daysUntil = dateUtils.getDaysDifference(current, event.date);
      return daysUntil >= 0 && daysUntil <= 7;
    })
    .sort((a, b) => {
      const daysA = dateUtils.getDaysDifference(current, a.date);
      const daysB = dateUtils.getDaysDifference(current, b.date);
      return daysA - daysB;
    })
    .slice(0, 8); // Limitar a 8 eventos para não sobrecarregar
});

// Computed - Dias até próximo evento
const nextEventDays = computed(() => {
  return daysUntilNext.value;
});

// Methods - Formatação e estilização
function formatEventDate(date: GameDate): string {
  const months = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];

  return `${date.day} de ${months[date.month - 1]}`;
}

function getDaysUntilEvent(date: GameDate): string {
  const current = currentDate.value;
  if (!current) return "N/A";

  const days = dateUtils.getDaysDifference(current, date);

  if (days === 0) return "Hoje";
  if (days === 1) return "Amanhã";
  if (days < 0) return "Atrasado";
  return `${days} dias`;
}

function getEventTypeLabel(type: ScheduledEventType): string {
  const labels = {
    [ScheduledEventType.NEW_CONTRACTS]: "Contratos",
    [ScheduledEventType.CONTRACT_EXPIRATION]: "Contrato",
    [ScheduledEventType.CONTRACT_RESOLUTION]: "Contrato",
    [ScheduledEventType.NEW_NOTICES]: "Mural",
    [ScheduledEventType.MEMBER_AVAILABILITY]: "Membro",
  };

  return labels[type] || "Evento";
}

function getEventStyles(type: ScheduledEventType): string {
  const styles = {
    [ScheduledEventType.NEW_CONTRACTS]:
      "bg-emerald-900/30 border-emerald-800/30",
    [ScheduledEventType.CONTRACT_EXPIRATION]:
      "bg-yellow-900/30 border-yellow-800/30",
    [ScheduledEventType.CONTRACT_RESOLUTION]: "bg-red-900/30 border-red-800/30",
    [ScheduledEventType.NEW_NOTICES]: "bg-blue-900/30 border-blue-800/30",
    [ScheduledEventType.MEMBER_AVAILABILITY]:
      "bg-purple-900/30 border-purple-800/30",
  };

  return styles[type] || "bg-gray-900/30 border-gray-800/30";
}

function getEventIconColor(type: ScheduledEventType): string {
  const colors = {
    [ScheduledEventType.NEW_CONTRACTS]: "bg-emerald-400",
    [ScheduledEventType.CONTRACT_EXPIRATION]: "bg-yellow-400",
    [ScheduledEventType.CONTRACT_RESOLUTION]: "bg-red-400",
    [ScheduledEventType.NEW_NOTICES]: "bg-blue-400",
    [ScheduledEventType.MEMBER_AVAILABILITY]: "bg-purple-400",
  };

  return colors[type] || "bg-gray-400";
}

function getEventTextColor(type: ScheduledEventType): string {
  const colors = {
    [ScheduledEventType.NEW_CONTRACTS]: "text-emerald-300",
    [ScheduledEventType.CONTRACT_EXPIRATION]: "text-yellow-300",
    [ScheduledEventType.CONTRACT_RESOLUTION]: "text-red-300",
    [ScheduledEventType.NEW_NOTICES]: "text-blue-300",
    [ScheduledEventType.MEMBER_AVAILABILITY]: "text-purple-300",
  };

  return colors[type] || "text-gray-300";
}
</script>
