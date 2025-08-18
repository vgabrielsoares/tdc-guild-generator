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
import { useContractsStore } from "@/stores/contracts";
import { ContractStatus } from "@/types/contract";
import ModuleTimeline from "@/components/timeline/ModuleTimeline.vue";
import {
  useContractTimelineConfig,
  useStandardStats,
} from "@/composables/useModuleTimeline";

// Emits
defineEmits<{
  "open-help": [key: string];
}>();

// Stores e composables
const contractsStore = useContractsStore();
const { currentDate, dateUtils } = useTimeline();
const { createConfig } = useContractTimelineConfig();
const { createStats } = useStandardStats();

// Computed
const contractStats = computed(() => contractsStore.contractStats);

// Contratos expirando em breve (próximos 3 dias)
const expiringContracts = computed(() => {
  const current = currentDate.value;
  if (!current) return [];

  return contractsStore.contracts.filter((contract) => {
    // Usar deadlineDate (GameDate) em vez de expiresAt (Date JavaScript)
    if (!contract.deadlineDate) return false;

    if (
      contract.status !== ContractStatus.DISPONIVEL &&
      contract.status !== ContractStatus.ACEITO &&
      contract.status !== ContractStatus.EM_ANDAMENTO
    )
      return false;

    // Calcular diferença de dias usando as funções de GameDate
    const daysUntilExpiration = dateUtils.getDaysDifference(
      current,
      contract.deadlineDate
    );

    // Considerar expirando se for nos próximos 3 dias (incluindo hoje)
    return daysUntilExpiration >= 0 && daysUntilExpiration <= 3;
  });
});

// Configuração do timeline
const timelineConfig = computed(() => {
  const stats = createStats(
    contractStats.value.available,
    contractStats.value.inProgress,
    expiringContracts.value.length,
    contractStats.value.completed
  );

  return createConfig(stats);
});

// Items expirando convertidos para o formato genérico
const expiringItems = computed(() => {
  return expiringContracts.value.map((contract) => ({
    id: contract.id,
    title: contract.contractorType || "Contratante não definido",
    description: contract.objective?.description || "Objetivo não definido",
    deadlineDate: contract.deadlineDate,
    value: contract.value ? `${contract.value.finalGoldReward} PO$` : undefined,
  }));
});
</script>

<style scoped></style>
