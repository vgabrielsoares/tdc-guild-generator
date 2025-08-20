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
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useTimeline } from "@/composables/useTimeline";
import { useContractsStore } from "@/stores/contracts";
import { useServicesStore } from "@/stores/services";
import { useGuildStore } from "@/stores/guild";
import { ServiceStatus } from "@/types/service";
import InfoButton from "@/components/common/InfoButton.vue";
import Tooltip from "@/components/common/Tooltip.vue";
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
const servicesStore = useServicesStore();
const guildStore = useGuildStore();

// Computed - Estatísticas por módulo
type ModuleStatsType = {
  contracts: { active: number | string; total: number | string };
  services: { active: number | string; total: number | string };
  members: { available: number; total: number };
  notices: { active: number; total: number };
};

const moduleStats = computed<ModuleStatsType>(() => {
  if (!contractsStore.isReady) {
    return {
      contracts: { active: "—", total: "—" },
      services: { active: "—", total: "—" },
      members: { available: 0, total: 0 },
      notices: { active: 0, total: 0 },
    };
  }

  const contractStats = contractsStore.contractStats;
  const currentGuild = guildStore.currentGuild;

  // Calcular serviços ativos APENAS da guilda atual
  const activeServicesCount = currentGuild
    ? servicesStore.services.filter(
        (service) =>
          service.guildId === currentGuild.id &&
          (service.status === ServiceStatus.DISPONIVEL ||
            service.status === ServiceStatus.ACEITO ||
            service.status === ServiceStatus.EM_ANDAMENTO ||
            service.status === ServiceStatus.ACEITO_POR_OUTROS)
      ).length
    : 0;

  return {
    contracts: {
      active:
        contractStats.available +
        contractStats.inProgress +
        contractStats.accepted,
      total: contractStats.total,
    },
    services: {
      active: activeServicesCount,
      total: servicesStore.services.length,
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
    [ScheduledEventType.NEW_SERVICES]: "Serviços",
    [ScheduledEventType.SERVICE_RESOLUTION]: "Serviço",
    [ScheduledEventType.NEW_NOTICES]: "Mural",
    [ScheduledEventType.NOTICE_EXPIRATION]: "Mural",
    [ScheduledEventType.MEMBER_REGISTRY_UPDATE]: "Membro",
    [ScheduledEventType.RENOWN_AUTHORIZATION]: "Renome",
    [ScheduledEventType.RESOURCE_AVAILABILITY]: "Recursos",
  } as const;

  return labels[type] || "Evento";
}

function getEventStyles(type: ScheduledEventType): string {
  const styles = {
    [ScheduledEventType.NEW_CONTRACTS]:
      "bg-emerald-900/30 border-emerald-800/30",
    [ScheduledEventType.CONTRACT_EXPIRATION]:
      "bg-yellow-900/30 border-yellow-800/30",
    [ScheduledEventType.CONTRACT_RESOLUTION]: "bg-red-900/30 border-red-800/30",
    [ScheduledEventType.NEW_SERVICES]: "bg-indigo-900/30 border-indigo-800/30",
    [ScheduledEventType.SERVICE_RESOLUTION]:
      "bg-orange-900/30 border-orange-800/30",
    [ScheduledEventType.NEW_NOTICES]: "bg-blue-900/30 border-blue-800/30",
    [ScheduledEventType.NOTICE_EXPIRATION]: "bg-cyan-900/30 border-cyan-800/30",
    [ScheduledEventType.MEMBER_REGISTRY_UPDATE]:
      "bg-purple-900/30 border-purple-800/30",
    [ScheduledEventType.RENOWN_AUTHORIZATION]:
      "bg-pink-900/30 border-pink-800/30",
    [ScheduledEventType.RESOURCE_AVAILABILITY]:
      "bg-teal-900/30 border-teal-800/30",
  } as const;

  return styles[type] || "bg-gray-900/30 border-gray-800/30";
}

function getEventIconColor(type: ScheduledEventType): string {
  const colors = {
    [ScheduledEventType.NEW_CONTRACTS]: "bg-emerald-400",
    [ScheduledEventType.CONTRACT_EXPIRATION]: "bg-yellow-400",
    [ScheduledEventType.CONTRACT_RESOLUTION]: "bg-red-400",
    [ScheduledEventType.NEW_SERVICES]: "bg-indigo-400",
    [ScheduledEventType.SERVICE_RESOLUTION]: "bg-orange-400",
    [ScheduledEventType.NEW_NOTICES]: "bg-blue-400",
    [ScheduledEventType.NOTICE_EXPIRATION]: "bg-cyan-400",
    [ScheduledEventType.MEMBER_REGISTRY_UPDATE]: "bg-purple-400",
    [ScheduledEventType.RENOWN_AUTHORIZATION]: "bg-pink-400",
    [ScheduledEventType.RESOURCE_AVAILABILITY]: "bg-teal-400",
  } as const;

  return colors[type] || "bg-gray-400";
}

function getEventTextColor(type: ScheduledEventType): string {
  const colors = {
    [ScheduledEventType.NEW_CONTRACTS]: "text-emerald-300",
    [ScheduledEventType.CONTRACT_EXPIRATION]: "text-yellow-300",
    [ScheduledEventType.CONTRACT_RESOLUTION]: "text-red-300",
    [ScheduledEventType.NEW_SERVICES]: "text-indigo-300",
    [ScheduledEventType.SERVICE_RESOLUTION]: "text-orange-300",
    [ScheduledEventType.NEW_NOTICES]: "text-blue-300",
    [ScheduledEventType.NOTICE_EXPIRATION]: "text-cyan-300",
    [ScheduledEventType.MEMBER_REGISTRY_UPDATE]: "text-purple-300",
    [ScheduledEventType.RENOWN_AUTHORIZATION]: "text-pink-300",
    [ScheduledEventType.RESOURCE_AVAILABILITY]: "text-teal-300",
  } as const;

  return colors[type] || "text-gray-300";
}
</script>
