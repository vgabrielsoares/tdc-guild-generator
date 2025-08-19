<template>
  <div class="space-y-6">
    <!-- Cabeçalho -->
    <div class="text-center">
      <h1
        class="text-3xl font-medieval font-bold text-gold-400 mb-4 flex items-center justify-center gap-3"
      >
        <CalendarDaysIcon class="w-7 h-7 text-gold-400" />
        Timeline da Guilda
        <Tooltip
          content="Sistema unificado de gestão temporal para todos os aspectos da guilda: contratos, serviços, membros, mural e renome."
          title="Timeline Unificada"
          position="auto"
        >
          <InfoButton
            help-key="guild-timeline-overview"
            @open-help="handleOpenHelp"
            button-class="ml-2"
          />
        </Tooltip>
      </h1>
      <p class="text-lg text-gray-300 mb-8">
        Gerencie a evolução temporal de todas as atividades da guilda
      </p>
    </div>

    <!-- Info da Guilda Atual -->
    <div
      v-if="guild"
      class="bg-gradient-to-r from-amber-900/20 to-yellow-900/20 border border-amber-600/50 rounded-lg p-6"
    >
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-xl font-semibold text-amber-400 flex items-center">
          <BuildingOfficeIcon class="w-5 h-5 mr-2" />
          {{ guild.name }}
        </h3>
        <span
          class="text-sm px-3 py-1 bg-amber-600 text-amber-100 rounded-full"
        >
          {{ guild.settlementType }}
        </span>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div class="flex flex-col">
          <span class="text-gray-400 uppercase tracking-wide text-xs"
            >Sede</span
          >
          <span class="text-white font-medium">{{ guild.structure.size }}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-gray-400 uppercase tracking-wide text-xs"
            >Recursos</span
          >
          <span class="text-white font-medium">{{
            guild.resources.level
          }}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-gray-400 uppercase tracking-wide text-xs"
            >Rel. Governo</span
          >
          <span class="text-white font-medium">{{
            guild.relations.government
          }}</span>
        </div>
        <div class="flex flex-col">
          <span class="text-gray-400 uppercase tracking-wide text-xs"
            >Rel. População</span
          >
          <span class="text-white font-medium">{{
            guild.relations.population
          }}</span>
        </div>
      </div>
    </div>

    <!-- Aviso se não há guilda -->
    <div
      v-else
      class="bg-red-900/30 border border-red-800/30 rounded-lg p-6 text-center"
    >
      <ExclamationTriangleIcon class="w-12 h-12 text-red-400 mx-auto mb-4" />
      <h3 class="text-lg font-semibold text-red-300 mb-2">
        Nenhuma Guilda Ativa
      </h3>
      <p class="text-red-400 mb-4">
        É necessário ter uma guilda ativa para gerenciar a timeline.
      </p>
      <router-link
        to="/guild"
        class="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      >
        <PlusIcon class="w-4 h-4 mr-2" />
        Ir para Guildas
      </router-link>
    </div>

    <!-- Dashboard Principal -->
    <template v-if="guild">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Dashboard central -->
        <div class="lg:col-span-2 space-y-6">
          <TimelineDashboard
            @open-help="handleOpenHelp"
            @generate-contracts="handleGenerateContracts"
          />
          <TimelineEventList @open-help="handleOpenHelp" />
        </div>

        <!-- Navegação e controles -->
        <div class="space-y-6">
          <TimelineNavigation
            @open-help="handleOpenHelp"
            @time-filter-change="handleTimeFilterChange"
            @time-advance="handleTimeAdvance"
          />

          <!-- Links de navegação rápida -->
          <div
            class="bg-gray-800 rounded-lg shadow-md border border-gray-700 p-4"
          >
            <h3 class="text-lg font-semibold text-white mb-3">
              Navegação Rápida
            </h3>
            <div class="space-y-2">
              <router-link
                to="/contracts"
                class="flex items-center w-full text-left px-3 py-2 rounded-lg text-sm bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
              >
                <DocumentTextIcon class="w-4 h-4 mr-2" />
                Gerenciar Contratos
              </router-link>

              <router-link
                to="/services"
                class="flex items-center w-full text-left px-3 py-2 rounded-lg text-sm bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
              >
                <WrenchScrewdriverIcon class="w-4 h-4 mr-2" />
                Gerenciar Serviços
              </router-link>

              <router-link
                to="/members"
                class="flex items-center w-full text-left px-3 py-2 rounded-lg text-sm bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
              >
                <UsersIcon class="w-4 h-4 mr-2" />
                Gerenciar Membros
              </router-link>

              <router-link
                to="/notices"
                class="flex items-center w-full text-left px-3 py-2 rounded-lg text-sm bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
              >
                <ClipboardDocumentListIcon class="w-4 h-4 mr-2" />
                Gerenciar Mural
              </router-link>

              <router-link
                to="/renown"
                class="flex items-center w-full text-left px-3 py-2 rounded-lg text-sm bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
              >
                <TrophyIcon class="w-4 h-4 mr-2" />
                Gerenciar Renome
              </router-link>
            </div>
          </div>

          <!-- Estatísticas rápidas -->
          <div
            class="bg-gray-800 rounded-lg shadow-md border border-gray-700 p-4"
          >
            <h3 class="text-lg font-semibold text-white mb-3">Estatísticas</h3>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-400">Total de Eventos</span>
                <span class="text-sm font-medium text-white">{{
                  events.length
                }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-400">Eventos Hoje</span>
                <span class="text-sm font-medium text-yellow-400">{{
                  todayEventsCount
                }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-400">Próximos 7 Dias</span>
                <span class="text-sm font-medium text-blue-400">{{
                  weekEventsCount
                }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-400">Dias até Próximo</span>
                <span class="text-sm font-medium text-purple-400">
                  {{ daysUntilNext !== null ? daysUntilNext : "∞" }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Modal de Ajuda -->
    <HelpModal
      :is-open="showHelpModal"
      :help-key="currentHelpKey"
      @close="handleCloseHelp"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from "vue";
import { useTimeline } from "@/composables/useTimeline";
import { useGuildStore } from "@/stores/guild";
import { useTimelineStore } from "@/stores/timeline";
import { useContractsStore } from "@/stores/contracts";
import { useTimelineIntegration } from "@/composables/useTimelineIntegration";

// Componentes
import TimelineDashboard from "@/components/timeline/TimelineDashboard.vue";
import TimelineEventList from "@/components/timeline/TimelineEventList.vue";
import TimelineNavigation from "@/components/timeline/TimelineNavigation.vue";
import HelpModal from "@/components/common/HelpModal.vue";
import InfoButton from "@/components/common/InfoButton.vue";
import Tooltip from "@/components/common/Tooltip.vue";

// Ícones
import {
  CalendarDaysIcon,
  BuildingOfficeIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  TrophyIcon,
} from "@heroicons/vue/24/outline";

// ===== STORES =====
const guildStore = useGuildStore();
const timelineStore = useTimelineStore();

// Importar store de contratos para a ação de gerar contratos
const contractsStore = useContractsStore();

// ===== INTEGRAÇÃO DE TIMELINE =====
// Inicializa automaticamente a integração entre timeline e todos os módulos
useTimelineIntegration();

// ===== TIMELINE =====
const { currentDate, events, daysUntilNext, dateUtils } = useTimeline();

// ===== STATE =====
// Modal de ajuda
const showHelpModal = ref(false);
const currentHelpKey = ref<string>("");

// ===== COMPUTED =====
const guild = computed(() => guildStore.currentGuild);

// ===== WATCHERS =====
// Quando a guilda muda, atualizar o guildId da timeline
watch(
  () => guild.value?.id,
  (newGuildId) => {
    if (newGuildId) {
      timelineStore.setCurrentGuild(newGuildId);
    }
  },
  { immediate: true }
);

// ===== LIFECYCLE =====
onMounted(() => {
  // Garantir que a timeline está configurada para a guilda atual
  if (guild.value?.id) {
    timelineStore.setCurrentGuild(guild.value.id);
  }
});

// Computed - Contadores de eventos
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

// ===== METHODS =====
function handleOpenHelp(key: string) {
  currentHelpKey.value = key;
  showHelpModal.value = true;
}

function handleCloseHelp() {
  showHelpModal.value = false;
  currentHelpKey.value = "";
}

function handleTimeFilterChange(filter: string) {
  // TODO: implementar filtro temporal se necessário
  // Placeholder para futuras implementações de filtro
  filter; // Para evitar warning de variável não utilizada
}

function handleTimeAdvance(days: number) {
  // Feedback visual ou ações após avançar tempo
  // TODO: implementar feedback visual se necessário
  days; // Para evitar warning de variável não utilizada
}

function handleGenerateContracts() {
  // Delegar a geração de contratos para o store apropriado
  contractsStore.generateContracts();
}
</script>
