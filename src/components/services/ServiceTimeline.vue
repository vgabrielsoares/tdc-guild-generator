<template>
  <div class="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-xl font-semibold text-white">Timeline de Serviços</h3>
      <Tooltip
        content="Sistema de evolução temporal dos serviços: resolução automática, competição com NPCs e mudanças de status."
        title="Ciclo de Vida dos Serviços"
        position="auto"
      >
        <InfoButton
          help-key="service-lifecycle"
          @open-help="$emit('open-help', 'service-lifecycle')"
        />
      </Tooltip>
    </div>

    <!-- Resumo temporal -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div
        class="bg-blue-900/30 p-4 rounded-lg text-center border border-blue-800/30"
      >
        <div class="text-2xl font-bold text-blue-400">
          {{ serviceStats.available }}
        </div>
        <div class="text-sm text-blue-300">Disponíveis</div>
      </div>

      <div
        class="bg-green-900/30 p-4 rounded-lg text-center border border-green-800/30"
      >
        <div class="text-2xl font-bold text-green-400">
          {{ serviceStats.inProgress }}
        </div>
        <div class="text-sm text-green-300">Em Andamento</div>
      </div>

      <div
        class="bg-yellow-900/30 p-4 rounded-lg text-center border border-yellow-800/30"
      >
        <div class="text-2xl font-bold text-yellow-400">
          {{ expiringServices.length }}
        </div>
        <div class="text-sm text-yellow-300">Expirando Em Breve</div>
      </div>

      <div
        class="bg-purple-900/30 p-4 rounded-lg text-center border border-purple-800/30"
      >
        <div class="text-2xl font-bold text-purple-400">
          {{ serviceStats.completed }}
        </div>
        <div class="text-sm text-purple-300">Concluídos</div>
      </div>
    </div>

    <!-- Serviços expirando -->
    <div v-if="expiringServices.length > 0" class="mb-6">
      <h4 class="text-lg font-medium text-white mb-3">
        Serviços Expirando em Breve
      </h4>

      <div class="space-y-2">
        <div
          v-for="service in expiringServices"
          :key="service.id"
          class="flex items-center justify-between p-3 bg-yellow-900/30 border border-yellow-800/30 rounded-lg"
        >
          <div class="flex-1">
            <div class="font-medium text-white">
              {{ service.contractorType || "Contratante não definido" }}
            </div>
            <div class="text-sm text-gray-300">
              {{ service.description || "Descrição não definida" }}
            </div>
          </div>

          <div class="text-right">
            <div class="text-sm font-medium text-yellow-300">
              {{ getExpirationText(service) }}
            </div>
            <div class="text-xs text-yellow-400" v-if="service.value">
              {{ formatValue(service.value.rewardAmount) }}
              {{ service.value.currency }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Eventos de timeline relacionados a serviços -->
    <div v-if="serviceEvents.length > 0" class="mb-6">
      <h4 class="text-lg font-medium text-white mb-3">
        Próximos Eventos de Serviços
      </h4>

      <div class="space-y-2">
        <div
          v-for="event in serviceEvents"
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
import { useServicesStore } from "@/stores/services";
import { useGuildStore } from "@/stores/guild";
import { useTimelineStore } from "@/stores/timeline";
import { useTimeline } from "@/composables/useTimeline";
import { ServiceStatus } from "@/types/service";
import { ScheduledEventType } from "@/types/timeline";
import type { GameDate } from "@/types/timeline";
import { getDaysDifference } from "@/utils/date-utils";
import InfoButton from "@/components/common/InfoButton.vue";
import Tooltip from "@/components/common/Tooltip.vue";

// Stores
const servicesStore = useServicesStore();
const guildStore = useGuildStore();
const timelineStore = useTimelineStore();
const { currentDate, dateUtils } = useTimeline();

// Computed
const guild = computed(() => guildStore.currentGuild);
const currentTimeline = computed(() => timelineStore.currentTimeline);
const formattedCurrentDate = computed(() => timelineStore.formattedCurrentDate);

const allServices = computed(() => {
  if (!guild.value) return [];
  return servicesStore.getServicesForGuild(guild.value.id);
});

// Serviços expirando em breve (próximos 3 dias)
const expiringServices = computed(() => {
  const current = currentDate.value;
  if (!current) return [];

  return allServices.value.filter((service) => {
    // Usar deadlineDate (GameDate) em vez de expiresAt (Date JavaScript)
    if (!service.deadlineDate) return false;

    if (
      service.status !== ServiceStatus.DISPONIVEL &&
      service.status !== ServiceStatus.ACEITO &&
      service.status !== ServiceStatus.EM_ANDAMENTO
    )
      return false;

    // Calcular diferença de dias usando as funções de GameDate
    const daysUntilExpiration = dateUtils.getDaysDifference(
      current,
      service.deadlineDate
    );

    // Considerar expirando se for nos próximos 3 dias (incluindo hoje)
    return daysUntilExpiration >= 0 && daysUntilExpiration <= 3;
  });
});

// Eventos de timeline relacionados a serviços
const { events } = useTimeline();
const serviceEvents = computed(() => {
  return events.value
    .filter(
      (event) =>
        event.type === ScheduledEventType.NEW_SERVICES ||
        event.type === ScheduledEventType.SERVICE_RESOLUTION
    )
    .slice(0, 5); // Mostrar apenas os próximos 5 eventos
});

const serviceStats = computed(() => {
  const services = allServices.value;
  return {
    available: services.filter((s) => s.status === ServiceStatus.DISPONIVEL)
      .length,
    inProgress: services.filter(
      (s) =>
        s.status === ServiceStatus.ACEITO ||
        s.status === ServiceStatus.EM_ANDAMENTO
    ).length,
    completed: services.filter(
      (s) =>
        s.status === ServiceStatus.CONCLUIDO ||
        s.status === ServiceStatus.FALHOU ||
        s.status === ServiceStatus.RESOLVIDO_POR_OUTROS
    ).length,
  };
});

// Methods
function getExpirationText(service: { deadlineDate?: GameDate }): string {
  if (!service.deadlineDate) return "Sem prazo";

  const current = currentDate.value;
  if (!current) return "Data não disponível";

  // Calcular diferença em dias usando GameDate
  const daysUntilExpiration = getDaysDifference(current, service.deadlineDate);

  if (daysUntilExpiration < 0) return "Expirado";
  if (daysUntilExpiration === 0) return "Expira hoje";
  if (daysUntilExpiration === 1) return "Expira amanhã";
  return `Expira em ${daysUntilExpiration} dias`;
}

function formatValue(value: number): string {
  return Number(value.toFixed(1)).toString();
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
