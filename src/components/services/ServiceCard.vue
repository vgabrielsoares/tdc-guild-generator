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
            :content="`Serviço solicitado por: ${contractorTypeLabel}`"
            :title="'Tipo de Contratante'"
            :contractor-type="contractorTypeLabel"
          >
            <component :is="contractorIcon" class="w-5 h-5 text-blue-400" />
          </ServiceTooltip>
          <Tooltip
            position="auto"
            title="Identificador do Serviço"
            :content="`ID completo: ${service.id}`"
          >
            <h3 class="text-lg font-semibold text-gold-400">
              {{ `Serviço #${service.id.slice(-8).toUpperCase()}` }}
            </h3>
          </Tooltip>
          <InfoButton
            help-key="service-contractors"
            @open-help="$emit('open-help', 'service-contractors')"
            button-class="text-xs"
          />
        </div>
        <ServiceStatusComponent :status="service.status" size="sm" />
      </div>

      <p class="text-md text-gray-400 mt-1">
        <template v-if="service.contractorName">
          {{ contractorTypeLabel }} - {{ service.contractorName }}
        </template>
        <template v-else>
          {{ contractorTypeLabel }}
        </template>
      </p>

      <!-- Descrição geral do serviço -->
      <div
        v-if="service.description"
        class="mt-2 p-2 bg-blue-900/20 rounded border-l-2 border-blue-400/50"
      >
        <p class="text-sm text-blue-100 leading-relaxed">
          {{ service.description }}
        </p>
      </div>
    </div>

    <!-- Conteúdo principal -->
    <div class="p-4 space-y-3">
      <!-- Informações essenciais do serviço -->
      <div class="grid grid-cols-1 gap-3">
        <!-- Dificuldade -->
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-400">Dificuldade:</span>
          <ServiceTooltip
            :content="`Dificuldade ${service.difficulty} determina o ND dos testes necessários para completar este serviço`"
            :difficulty="service.difficulty"
          >
            <span class="text-sm font-medium text-yellow-400 cursor-help">
              {{ service.difficulty }}
            </span>
          </ServiceTooltip>
        </div>

        <!-- Recompensa -->
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-400">Recompensa:</span>
          <ServiceTooltip
            :content="`Valor base: ${service.value?.rewardAmount || 0} ${service.value?.currency} — Recorrência: ${recurrenceAppliedDisplay} ${service.value?.currency}${service.value?.recurrenceAppliedCount ? ` (${service.value.recurrenceAppliedCount}x)` : ''} — Multiplicador de complexidade: x${complexityMultiplierDisplay}`"
            title="Breakdown da Recompensa"
          >
            <div class="flex items-center gap-2 cursor-help">
              <span class="text-sm font-medium text-yellow-300">
                {{ finalReward }} {{ service.value?.currency }}
              </span>
              <span
                v-if="
                  service.value?.recurrenceAppliedCount &&
                  service.value?.recurrenceAppliedCount > 0
                "
                class="text-xs bg-green-800 text-green-100 px-2 py-0.5 rounded-full border border-green-700"
                :title="`${service.value.recurrenceAppliedCount}x aplicação(s)`"
              >
                +{{ recurrenceAppliedDisplay }} {{ service.value?.currency }}
              </span>
            </div>
          </ServiceTooltip>
        </div>

        <!-- Prazo (se houver) -->
        <div
          v-if="service.deadline && service.deadline.value"
          class="flex items-center justify-between"
        >
          <span class="text-sm text-gray-400">Prazo:</span>
          <span class="text-sm font-medium text-orange-400">
            {{ service.deadline.value }}
          </span>
        </div>
      </div>
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
          <!-- Ver Detalhes quando há apenas uma ação -->
          <button
            @click="$emit('view-details', service)"
            class="flex-1 px-3 py-2 bg-gray-600 text-white rounded text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Ver Detalhes
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
            class="flex-1 px-3 py-2 bg-red-600 text-white rounded text-sm font-medium hover:bg-red-700 transition-colors"
          >
            Abandonar
          </button>
          <!-- Ver Detalhes quando há múltiplas ações -->
          <button
            @click="$emit('view-details', service)"
            class="flex-1 px-3 py-2 bg-gray-600 text-white rounded text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Ver Detalhes
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
          <!-- Ver Detalhes quando há múltiplas ações -->
          <button
            @click="$emit('view-details', service)"
            class="px-3 py-2 bg-gray-600 text-white rounded text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Ver Detalhes
          </button>
        </template>

        <!-- Para outros status, Ver Detalhes ocupa todo o espaço -->
        <template v-else>
          <button
            @click="$emit('view-details', service)"
            class="w-full px-3 py-2 bg-gray-600 text-white rounded text-sm font-medium hover:bg-gray-700 transition-colors"
          >
            Ver Detalhes
          </button>
        </template>
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
import { ServiceStatus, ServiceContractorType } from "@/types/service";
import ServiceStatusComponent from "./ServiceStatus.vue";
import ServiceTooltip from "./ServiceTooltip.vue";
import Tooltip from "@/components/common/Tooltip.vue";
import InfoButton from "@/components/common/InfoButton.vue";
import { calculateFinalServiceReward } from "@/types/service";

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
    props.service.complexity === "Extremamente complexa" ||
    props.service.complexity === "Extremamente complexa e Direta"
);

const isEasyDifficulty = computed(
  () =>
    props.service.difficulty === "Muito Fácil (ND 10)" ||
    props.service.difficulty === "Fácil (ND 14)"
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

const finalReward = computed(() => {
  try {
    return calculateFinalServiceReward(props.service as Service);
  } catch {
    return props.service.value?.rewardAmount || 0;
  }
});

const complexityMultiplierDisplay = computed(() => {
  return props.service.value?.complexityMultiplier || 1;
});

// Formata o valor da recorrência já multiplicado
const recurrenceAppliedDisplay = computed(() => {
  const total = props.service.value?.recurrenceBonusAmount || 0;
  const mult = props.service.value?.complexityMultiplier || 1;
  const currency = props.service.value?.currency || "";
  return formatCurrency(total * mult, currency);
});

function formatCurrency(amount: number, currency: string) {
  const rounded = Math.round((amount + Number.EPSILON) * 100) / 100;
  if (currency === "PO$") {
    const s = rounded.toFixed(2);
    return s.replace(/\.00$/, "").replace(/(\.[0-9])0$/, "$1");
  }
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}

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
