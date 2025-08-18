<template>
  <ModuleTimeline
    :config="timelineConfig"
    :expiring-items="expiringItems"
    @open-help="$emit('open-help', $event)"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useTimeline } from "@/composables/useTimeline";
import { useServicesStore } from "@/stores/services";
import { useGuildStore } from "@/stores/guild";
import { ServiceStatus } from "@/types/service";
import ModuleTimeline from "@/components/timeline/ModuleTimeline.vue";
import {
  useServiceTimelineConfig,
  useStandardStats,
} from "@/composables/useModuleTimeline";

// Emits
defineEmits<{
  "open-help": [key: string];
}>();

// Stores e composables
const servicesStore = useServicesStore();
const guildStore = useGuildStore();
const { currentDate, dateUtils } = useTimeline();
const { createConfig } = useServiceTimelineConfig();
const { createStats } = useStandardStats();

// Computed
const guild = computed(() => guildStore.currentGuild);

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

// Configuração do timeline
const timelineConfig = computed(() => {
  const stats = createStats(
    serviceStats.value.available,
    serviceStats.value.inProgress,
    expiringServices.value.length,
    serviceStats.value.completed
  );

  return createConfig(stats);
});

// Items expirando convertidos para o formato genérico
const expiringItems = computed(() => {
  return expiringServices.value.map((service) => ({
    id: service.id,
    title: service.contractorType || "Contratante não definido",
    description: service.description || "Descrição não definida",
    deadlineDate: service.deadlineDate,
    value: service.value
      ? `${service.value.rewardAmount} ${service.value.currency}`
      : undefined,
  }));
});
</script>

<style scoped></style>
