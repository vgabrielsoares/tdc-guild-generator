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
          {{ serviceStats.expiring }}
        </div>
        <div class="text-sm text-yellow-300">Com Prazo</div>
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

    <!-- Ações principais -->
    <div class="flex flex-wrap gap-4">
      <button
        @click="handleGenerateServices"
        :disabled="!guild || isGenerating"
        class="flex-1 min-w-[200px] px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center"
      >
        <svg
          v-if="isGenerating"
          class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <WrenchScrewdriverIcon v-else class="w-5 h-5 mr-2" />
        {{ isGenerating ? "Gerando..." : "Gerar Novos Serviços" }}
      </button>

      <button
        @click="$emit('force-resolution')"
        class="px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors flex items-center"
      >
        <ClockIcon class="w-5 h-5 mr-2" />
        Avançar Tempo
      </button>
    </div>

    <!-- Informações adicionais -->
    <div v-if="currentTimeline" class="mt-6 p-4 bg-gray-700/50 rounded-lg">
      <div class="text-sm text-gray-300">
        <span class="font-medium">Data atual:</span>
        {{ formattedCurrentDate || "Timeline inativa" }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { WrenchScrewdriverIcon, ClockIcon } from "@heroicons/vue/24/outline";
import { useServicesStore } from "@/stores/services";
import { useGuildStore } from "@/stores/guild";
import { useTimelineStore } from "@/stores/timeline";
import { ServiceStatus, ServiceDeadlineType } from "@/types/service";
import InfoButton from "@/components/common/InfoButton.vue";
import Tooltip from "@/components/common/Tooltip.vue";

// Emits
const emit = defineEmits<{
  "generate-services": [];
  "force-resolution": [];
  "open-help": [helpKey: string];
}>();

// Stores
const servicesStore = useServicesStore();
const guildStore = useGuildStore();
const timelineStore = useTimelineStore();

// State
const isGenerating = ref(false);

// Computed
const guild = computed(() => guildStore.currentGuild);
const currentTimeline = computed(() => timelineStore.currentTimeline);
const formattedCurrentDate = computed(() => timelineStore.formattedCurrentDate);

const allServices = computed(() => {
  if (!guild.value) return [];
  return servicesStore.servicesByGuild[guild.value.id] || [];
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
    expiring: services.filter(
      (s) => s.deadline && s.deadline.type !== ServiceDeadlineType.SEM_PRAZO
    ).length,
    completed: services.filter((s) => s.status === ServiceStatus.CONCLUIDO)
      .length,
  };
});

// Functions
const handleGenerateServices = async () => {
  if (!guild.value) return;

  try {
    isGenerating.value = true;
    emit("generate-services");
  } finally {
    isGenerating.value = false;
  }
};
</script>

<style scoped></style>
