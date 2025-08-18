<template>
  <div
    class="service-card bg-gradient-to-br from-blue-900/40 to-blue-800/30 border border-blue-600/50 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:border-blue-400/60"
    :class="[
      { 'opacity-60': isExpired || isUnavailable },
      { 'border-blue-400/50': isHighValue },
      { 'border-orange-400/50': isHighComplexity },
      { 'border-green-400/50': isEasyDifficulty },
    ]"
  >
    <!-- Header com status e tipo de contratante -->
    <div class="p-4 border-b border-blue-700/50">
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-2">
          <ServiceTooltip
            :content="getContractorTooltip()"
            :title="'Tipo de Contratante'"
            :contractor-type="contractorTypeLabel"
          >
            <component :is="contractorIcon" class="w-5 h-5 text-blue-400" />
          </ServiceTooltip>
          <h3 class="text-lg font-semibold text-gold-400">
            {{ service.title || `Serviço ${service.id.slice(0, 6)}` }}
          </h3>
          <InfoButton
            help-key="service-contractors"
            @open-help="$emit('open-help', 'service-contractors')"
            button-class="text-xs"
          />
        </div>
        <ServiceStatusComponent :status="service.status" size="sm" />
      </div>

      <p class="text-md text-gray-400 mt-1">
        {{ contractorTypeLabel }} -
        {{ service.contractorName || "Nome não especificado" }}
      </p>
    </div>

    <!-- Conteúdo principal -->
    <div class="p-4 space-y-3">
      <!-- Objetivo -->
      <div v-if="service.objective">
        <div class="flex items-center gap-1 mb-1">
          <ServiceTooltip
            :content="getObjectiveTooltip()"
            :title="'Objetivo do Serviço'"
          >
            <p class="text-md font-medium text-gray-300">
              {{ service.objective.type }}
            </p>
          </ServiceTooltip>
          <InfoButton
            help-key="service-objectives"
            @open-help="$emit('open-help', 'service-objectives')"
            button-class="text-xs"
          />
        </div>
        <p class="text-sm text-gray-400 leading-relaxed">
          {{ service.objective.description }}
        </p>
      </div>

      <!-- Dificuldade e Complexidade (exclusivo dos serviços) -->
      <div class="bg-gray-900/50 rounded-lg p-3 space-y-2">
        <div class="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span class="text-gray-400">Dificuldade:</span>
            <p :class="getDifficultyColor()" class="font-medium">
              {{ getDifficultyLabel() }}
            </p>
          </div>
          <div>
            <span class="text-gray-400">Complexidade:</span>
            <p :class="getComplexityColor()" class="font-medium">
              {{ service.complexity }}
            </p>
          </div>
        </div>

        <!-- Estrutura de Testes -->
        <div v-if="service.testStructure" class="text-sm">
          <span class="text-gray-400">Testes:</span>
          <p class="text-white font-medium">
            {{ service.testStructure.totalTests }} teste{{
              service.testStructure.totalTests > 1 ? "s" : ""
            }}
            ({{
              service.testStructure.skillRequirement === "same"
                ? "mesma perícia"
                : service.testStructure.skillRequirement === "different"
                  ? "perícias diferentes"
                  : "perícias mistas"
            }})
          </p>
        </div>
      </div>

      <!-- Valor e Recompensa -->
      <div v-if="service.value">
        <div class="flex items-center gap-1 mb-1">
          <ServiceTooltip
            :content="getValueTooltip()"
            :title="'Recompensa do Serviço'"
          >
            <span class="text-sm text-gray-400">Recompensa:</span>
          </ServiceTooltip>
          <InfoButton
            help-key="service-rewards"
            @open-help="$emit('open-help', 'service-rewards')"
            button-class="text-xs"
          />
        </div>
        <ServiceValue :value="service.value" />
      </div>

      <!-- Prazo -->
      <div v-if="service.deadline">
        <span class="text-sm text-gray-400">Prazo:</span>
        <p class="text-white font-medium">{{ service.deadline.value }}</p>
      </div>

      <!-- Pagamento -->
      <div v-if="service.paymentType">
        <span class="text-sm text-gray-400">Forma de pagamento:</span>
        <p class="text-white text-sm">{{ getPaymentTypeLabel() }}</p>
      </div>

      <!-- Elementos narrativos (quando existem) -->
      <!-- 
        TODO: Elementos narrativos
      -->
      <!--
      <div v-if="hasNarrativeElements()" class="border-t border-blue-700/30 pt-3">
        <div class="text-xs text-gray-400 mb-2">Elementos adicionais:</div>
        
        <div v-if="service.problemOrigin" class="mb-2">
          <span class="text-xs text-blue-300">Origem:</span>
          <p class="text-xs text-gray-300">{{ service.problemOrigin }}</p>
        </div>
        
        <div v-if="service.complication" class="mb-2">
          <span class="text-xs text-orange-300">Complicação:</span>
          <p class="text-xs text-gray-300">{{ service.complication.description }}</p>
        </div>
        
        <div v-if="service.rival" class="mb-2">
          <span class="text-xs text-red-300">Rival:</span>
          <p class="text-xs text-gray-300">{{ service.rival.action }} - {{ service.rival.motivation }}</p>
        </div>
        
        <div v-if="service.additionalChallenge">
          <span class="text-xs text-purple-300">Desafio:</span>
          <p class="text-xs text-gray-300">{{ service.additionalChallenge.description }}</p>
        </div>
      </div>
      -->
    </div>

    <!-- Footer com ações -->
    <div v-if="showActions" class="px-4 pb-4">
      <div class="flex flex-wrap gap-2">
        <!-- Ações por status -->
        <template v-if="service.status === ServiceStatus.DISPONIVEL">
          <button
            @click="$emit('accept', service)"
            class="flex-1 px-3 py-2 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Aceitar Serviço
          </button>
        </template>

        <template v-else-if="service.status === ServiceStatus.ACEITO">
          <button
            @click="$emit('start-tests', service)"
            class="flex-1 px-3 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Iniciar Testes
          </button>
          <button
            @click="$emit('abandon', service)"
            class="px-3 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Abandonar
          </button>
        </template>

        <template v-else-if="service.status === ServiceStatus.EM_ANDAMENTO">
          <button
            @click="$emit('continue-tests', service)"
            class="flex-1 px-3 py-2 bg-amber-600 text-white rounded text-sm font-medium hover:bg-amber-700 transition-colors"
          >
            Continuar Testes
          </button>
          <button
            @click="$emit('complete', service)"
            class="px-3 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 transition-colors"
          >
            Concluir
          </button>
        </template>

        <!-- Ação comum: Ver detalhes -->
        <button
          @click="$emit('view-details', service)"
          class="px-3 py-2 bg-gray-600 text-white rounded text-sm font-medium hover:bg-gray-700 transition-colors"
        >
          Ver Detalhes
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  UserGroupIcon,
  BuildingOfficeIcon,
  ShieldCheckIcon,
} from "@heroicons/vue/24/outline";
import type { Service } from "@/types/service";
import {
  ServiceStatus,
  ServiceContractorType,
  ServiceDifficulty,
  ServiceComplexity,
  ServicePaymentType,
} from "@/types/service";
import ServiceTooltip from "./ServiceTooltip.vue";
import ServiceStatusComponent from "./ServiceStatus.vue";
import ServiceValue from "./ServiceValue.vue";
import InfoButton from "@/components/common/InfoButton.vue";

// Props
interface Props {
  service: Service;
  showActions?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
});

// Emits
defineEmits<{
  accept: [service: Service];
  "start-tests": [service: Service];
  "continue-tests": [service: Service];
  complete: [service: Service];
  abandon: [service: Service];
  "view-details": [service: Service];
  "open-help": [key: string];
}>();

// Computed properties para estados
const isExpired = computed(() => props.service.isExpired);
const isUnavailable = computed(
  () =>
    props.service.status === ServiceStatus.ANULADO ||
    props.service.status === ServiceStatus.RESOLVIDO_POR_OUTROS ||
    props.service.status === ServiceStatus.ACEITO_POR_OUTROS
);

const isHighValue = computed(() => {
  if (!props.service.value) return false;
  return props.service.value.rewardAmount >= 20; // Valor arbitrário para "alto valor"
});

const isHighComplexity = computed(
  () =>
    props.service.complexity === ServiceComplexity.EXTREMAMENTE_COMPLEXA ||
    props.service.complexity ===
      ServiceComplexity.EXTREMAMENTE_COMPLEXA_E_DIRETA
);

const isEasyDifficulty = computed(
  () =>
    props.service.difficulty === ServiceDifficulty.MUITO_FACIL ||
    props.service.difficulty === ServiceDifficulty.FACIL_ND14
);

// Ícone do contratante
const contractorIcon = computed(() => {
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

// Label do tipo de contratante
const contractorTypeLabel = computed(() => {
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

// Cores da dificuldade
const getDifficultyColor = () => {
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

// Label da dificuldade (sem o ND)
const getDifficultyLabel = () => {
  return props.service.difficulty.split(" (")[0];
};

// Cores da complexidade
const getComplexityColor = () => {
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

// Label do tipo de pagamento
const getPaymentTypeLabel = () => {
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

// Tooltips
const getContractorTooltip = () => {
  return `Serviço solicitado por: ${contractorTypeLabel.value}`;
};

const getObjectiveTooltip = () => {
  return `Tipo de objetivo: ${props.service.objective?.type}\n\nDescrição: ${props.service.objective?.description}`;
};

const getValueTooltip = () => {
  if (!props.service.value) return "Recompensa não definida";

  return `Recompensa: ${props.service.value.rewardRoll}\nValor calculado: ${props.service.value.rewardAmount} ${props.service.value.currency}\nTaxa de recorrência: ${props.service.value.recurrenceBonus}`;
};
</script>

<style scoped>
.service-card {
  /* Gradiente específico para diferenciar de contratos */
  background: linear-gradient(
    135deg,
    rgba(30, 58, 138, 0.4) 0%,
    rgba(30, 64, 175, 0.3) 100%
  );
}

.service-card:hover {
  transform: translateY(-2px);
}
</style>
