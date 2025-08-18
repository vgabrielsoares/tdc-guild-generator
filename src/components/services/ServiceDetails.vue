<template>
  <div
    v-if="service"
    class="service-details bg-gray-900 text-white rounded-xl p-6 shadow-2xl border border-blue-700/30"
  >
    <!-- Header com Status e Título -->
    <div class="flex items-start justify-between mb-6">
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-2">
          <ServiceStatusComponent :status="service.status" size="lg" />
          <component :is="contractorIcon" class="w-6 h-6 text-blue-400" />
        </div>
        <h2 class="text-2xl font-bold text-white mb-2">
          {{ service.title || `Serviço ${service.id.slice(0, 8)}` }}
        </h2>
        <p class="text-gray-300 mb-2">
          {{ contractorTypeLabel }} - {{ service.contractorName }}
        </p>
      </div>
    </div>

    <!-- Grid principal de informações -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <!-- Dificuldade e Complexidade -->
      <div class="bg-gray-800/50 rounded-lg p-4">
        <h3
          class="text-lg font-semibold text-orange-300 mb-3 flex items-center gap-2"
        >
          <SparklesIcon class="w-5 h-5" />
          Dificuldade
        </h3>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-400">Dificuldade:</span>
            <span :class="getDifficultyColor()" class="font-medium">
              {{ getDifficultyLabel() }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Complexidade:</span>
            <span :class="getComplexityColor()" class="font-medium">
              {{ service.complexity }}
            </span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">ND Base:</span>
            <span class="text-white font-medium">
              {{
                service.testStructure?.baseND ||
                extractNDFromDifficulty(service.difficulty)
              }}
            </span>
          </div>
        </div>
      </div>

      <!-- Recompensa -->
      <div class="bg-gray-800/50 rounded-lg p-4">
        <h3
          class="text-lg font-semibold text-green-300 mb-3 flex items-center gap-2"
        >
          <CurrencyDollarIcon class="w-5 h-5" />
          Recompensa
        </h3>
        <ServiceValue
          v-if="service.value"
          :value="service.value"
          :show-details="true"
        />
      </div>

      <!-- Prazo e Pagamento -->
      <div class="bg-gray-800/50 rounded-lg p-4">
        <h3
          class="text-lg font-semibold text-amber-300 mb-3 flex items-center gap-2"
        >
          <ClockIcon class="w-5 h-5" />
          Termos
        </h3>
        <div class="space-y-2 text-sm">
          <div v-if="service.deadline">
            <span class="text-gray-400">Prazo:</span>
            <p class="text-white font-medium">{{ service.deadline.value }}</p>
          </div>
          <div v-if="service.paymentType">
            <span class="text-gray-400">Pagamento:</span>
            <p class="text-white text-sm">{{ getPaymentTypeLabel() }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Objetivo -->
    <div v-if="service.objective" class="bg-gray-800/50 rounded-lg p-6 mb-6">
      <h3
        class="text-lg font-semibold text-gold-400 mb-4 flex items-center gap-2"
      >
        <TagIcon class="w-5 h-5" />
        Objetivo
      </h3>
      <div class="space-y-3">
        <div>
          <span class="text-sm text-gray-400">Tipo:</span>
          <p class="text-white font-medium">{{ service.objective.type }}</p>
        </div>
        <div>
          <span class="text-sm text-gray-400">Descrição:</span>
          <p class="text-gray-200 leading-relaxed">
            {{ service.objective.description }}
          </p>
        </div>

        <!-- Detalhes específicos do objetivo -->
        <div
          v-if="service.objective.action"
          class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm"
        >
          <div v-if="service.objective.action">
            <span class="text-gray-400">Ação:</span>
            <p class="text-blue-200">{{ service.objective.action }}</p>
          </div>
          <div v-if="service.objective.target">
            <span class="text-gray-400">Alvo:</span>
            <p class="text-green-200">{{ service.objective.target }}</p>
          </div>
          <div v-if="service.objective.complication">
            <span class="text-gray-400">Complicação:</span>
            <p class="text-orange-200">{{ service.objective.complication }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Sistema de Testes -->
    <div
      v-if="service.testStructure"
      class="bg-gray-800/50 rounded-lg p-6 mb-6"
    >
      <h3
        class="text-lg font-semibold text-purple-300 mb-4 flex items-center gap-2"
      >
        <BeakerIcon class="w-5 h-5" />
        Sistema de Testes
      </h3>

      <div
        class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-sm"
      >
        <div>
          <span class="text-gray-400">Total de Testes:</span>
          <p class="text-white font-medium">
            {{ service.testStructure.totalTests }}
          </p>
        </div>
        <div>
          <span class="text-gray-400">ND Base:</span>
          <p class="text-white font-medium">
            {{ service.testStructure.baseND }}
          </p>
        </div>
        <div>
          <span class="text-gray-400">Perícias:</span>
          <p class="text-white font-medium">{{ getSkillRequirementLabel() }}</p>
        </div>
        <div>
          <span class="text-gray-400">Sucessos:</span>
          <p class="text-white font-medium">
            {{ service.testStructure.successCount }}/{{
              service.testStructure.totalTests
            }}
          </p>
        </div>
      </div>

      <!-- Botão para sistema de testes -->
      <div v-if="canStartTests" class="flex gap-3">
        <button
          @click="handleStartTests"
          class="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors flex items-center gap-2"
        >
          <BeakerIcon class="w-4 h-4" />
          {{
            service.testStructure.tests.length > 0
              ? "Continuar Testes"
              : "Iniciar Testes"
          }}
        </button>

        <button
          v-if="service.testStructure.tests.length > 0"
          @click="handleResetTests"
          class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
        >
          Reiniciar Testes
        </button>
      </div>
    </div>

    <!-- Histórico de datas -->
    <div class="bg-gray-800/50 rounded-lg p-6 mb-6">
      <h3
        class="text-lg font-semibold text-gold-400 mb-4 flex items-center gap-2"
      >
        <CalendarIcon class="w-5 h-5" />
        Histórico
      </h3>
      <div class="space-y-2 text-sm">
        <div v-if="service.createdAt">
          <span class="text-gray-400">Criado em:</span>
          <span class="text-white ml-2">{{
            formatGameDate(service.createdAt)
          }}</span>
        </div>
        <div v-if="service.acceptedAt">
          <span class="text-gray-400">Aceito em:</span>
          <span class="text-white ml-2">{{
            formatGameDate(service.acceptedAt)
          }}</span>
        </div>
        <div v-if="service.completedAt">
          <span class="text-gray-400">Concluído em:</span>
          <span class="text-white ml-2">{{
            formatGameDate(service.completedAt)
          }}</span>
        </div>
      </div>
    </div>

    <!-- Ações -->
    <div class="flex flex-wrap gap-3 pt-4 border-t border-blue-700/30">
      <!-- Ações baseadas no status -->
      <template v-if="service.status === ServiceStatus.DISPONIVEL">
        <button
          @click="handleAccept"
          class="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
        >
          Aceitar Serviço
        </button>
      </template>

      <template v-else-if="service.status === ServiceStatus.ACEITO">
        <button
          @click="handleStartTests"
          class="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
        >
          Iniciar Testes
        </button>
        <button
          @click="handleAbandon"
          class="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors font-medium"
        >
          Abandonar
        </button>
      </template>

      <template v-else-if="service.status === ServiceStatus.EM_ANDAMENTO">
        <button
          @click="handleContinueTests"
          class="px-6 py-3 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors font-medium"
        >
          Continuar Testes
        </button>
        <button
          @click="handleComplete"
          class="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-medium"
        >
          Concluir Serviço
        </button>
      </template>

      <!-- Ação sempre disponível -->
      <button
        @click="$emit('close')"
        class="px-6 py-3 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors font-medium ml-auto"
      >
        Fechar
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  UserGroupIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  ClockIcon,
  TagIcon,
  BeakerIcon,
  CalendarIcon,
} from "@heroicons/vue/24/outline";
import type { Service } from "@/types/service";
import {
  ServiceStatus,
  ServiceContractorType,
  ServiceDifficulty,
  ServiceComplexity,
  ServicePaymentType,
} from "@/types/service";
import ServiceStatusComponent from "./ServiceStatus.vue";
import ServiceValue from "./ServiceValue.vue";
import type { GameDate } from "@/types/timeline";

// Props
interface Props {
  service: Service | null;
}

const props = defineProps<Props>();

// Emits
const emit = defineEmits<{
  accept: [service: Service];
  "start-tests": [service: Service];
  "continue-tests": [service: Service];
  "reset-tests": [service: Service];
  complete: [service: Service];
  abandon: [service: Service];
  close: [];
}>();

// Computed properties
const contractorIcon = computed(() => {
  if (!props.service) return UserGroupIcon;

  switch (props.service.contractorType) {
    case ServiceContractorType.POVO:
      return UserGroupIcon;
    case ServiceContractorType.INSTITUICAO_OFICIO:
      return BuildingOfficeIcon;
    case ServiceContractorType.GOVERNO:
      return ShieldCheckIcon;
    default:
      return UserGroupIcon;
  }
});

const contractorTypeLabel = computed(() => {
  if (!props.service) return "";

  switch (props.service.contractorType) {
    case ServiceContractorType.POVO:
      return "Povo";
    case ServiceContractorType.INSTITUICAO_OFICIO:
      return "Instituição de Ofício";
    case ServiceContractorType.GOVERNO:
      return "Governo";
    default:
      return "Desconhecido";
  }
});

const canStartTests = computed(() => {
  return (
    props.service?.status === ServiceStatus.ACEITO ||
    props.service?.status === ServiceStatus.EM_ANDAMENTO
  );
});

// Event handlers
const handleAccept = () => {
  if (props.service) {
    emit("accept", props.service);
  }
};

const handleStartTests = () => {
  if (props.service) {
    emit("start-tests", props.service);
  }
};

const handleContinueTests = () => {
  if (props.service) {
    emit("continue-tests", props.service);
  }
};

const handleResetTests = () => {
  if (props.service) {
    emit("reset-tests", props.service);
  }
};

const handleComplete = () => {
  if (props.service) {
    emit("complete", props.service);
  }
};

const handleAbandon = () => {
  if (props.service) {
    emit("abandon", props.service);
  }
};

// Helper functions
const getDifficultyColor = () => {
  if (!props.service) return "text-gray-400";

  switch (props.service.difficulty) {
    case ServiceDifficulty.MUITO_FACIL:
    case ServiceDifficulty.FACIL_ND14:
    case ServiceDifficulty.FACIL_ND15:
    case ServiceDifficulty.FACIL_ND16:
      return "text-green-400";
    case ServiceDifficulty.MEDIA_ND17:
    case ServiceDifficulty.MEDIA_ND18:
    case ServiceDifficulty.MEDIA_ND19:
      return "text-yellow-400";
    case ServiceDifficulty.DIFICIL_ND20:
    case ServiceDifficulty.DIFICIL_ND21:
    case ServiceDifficulty.DESAFIADOR_ND22:
    case ServiceDifficulty.DESAFIADOR_ND23:
      return "text-orange-400";
    case ServiceDifficulty.MUITO_DIFICIL:
      return "text-red-400";
    default:
      return "text-gray-400";
  }
};

const getDifficultyLabel = () => {
  return props.service?.difficulty.split(" (")[0] || "";
};

const getComplexityColor = () => {
  if (!props.service) return "text-gray-400";

  switch (props.service.complexity) {
    case ServiceComplexity.SIMPLES:
    case ServiceComplexity.MODERADA_E_DIRETA:
      return "text-green-400";
    case ServiceComplexity.MODERADA:
    case ServiceComplexity.COMPLEXA_E_DIRETA:
      return "text-yellow-400";
    case ServiceComplexity.COMPLEXA:
    case ServiceComplexity.EXTREMAMENTE_COMPLEXA_E_DIRETA:
      return "text-orange-400";
    case ServiceComplexity.EXTREMAMENTE_COMPLEXA:
      return "text-red-400";
    default:
      return "text-gray-400";
  }
};

const getPaymentTypeLabel = () => {
  if (!props.service) return "";

  switch (props.service.paymentType) {
    case ServicePaymentType.PAGAMENTO_DIRETO_CONTRATANTE:
      return "Direto com contratante";
    case ServicePaymentType.METADE_GUILDA_METADE_CONTRATANTE:
      return "Metade na guilda, metade com contratante";
    case ServicePaymentType.METADE_GUILDA_METADE_BENS:
      return "Metade na guilda, metade em bens";
    case ServicePaymentType.MATERIAIS_BENS_SERVICOS:
      return "Em materiais/bens/serviços";
    case ServicePaymentType.PAGAMENTO_TOTAL_GUILDA:
      return "Total na guilda";
    default:
      return "Não especificado";
  }
};

const getSkillRequirementLabel = () => {
  if (!props.service?.testStructure) return "";

  switch (props.service.testStructure.skillRequirement) {
    case "same":
      return "Mesma perícia";
    case "different":
      return "Perícias diferentes";
    case "mixed":
      return "Perícias mistas";
    default:
      return "Não especificado";
  }
};

const extractNDFromDifficulty = (difficulty: string): number => {
  const match = difficulty.match(/ND (\d+)/);
  return match ? parseInt(match[1]) : 0;
};

const formatGameDate = (date: GameDate): string => {
  return `${date.day}/${date.month}/${date.year}`;
};
</script>

<style scoped>
.service-details {
  /* Gradiente específico para detalhes de serviços */
  background: linear-gradient(
    135deg,
    rgba(30, 58, 138, 0.3) 0%,
    rgba(30, 64, 175, 0.2) 100%
  );
}
</style>
