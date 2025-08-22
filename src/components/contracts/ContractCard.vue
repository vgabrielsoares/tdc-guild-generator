<template>
  <div
    class="contract-card bg-gray-800 border border-gray-600 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:border-amber-400/50"
    :class="[
      { 'opacity-60': isExpired || isUnavailable },
      { 'border-amber-400/30': isHighValue },
      { 'border-red-400/30': isDangerous },
    ]"
  >
    <!-- Header com status e tipo de contratante -->
    <div class="p-4 border-b border-gray-700">
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-2">
          <ContractTooltip
            :content="getContractorTooltip()"
            :title="'Tipo de Contratante'"
            :contractor-type="contractorTypeLabel"
          >
            <component :is="contractorIcon" class="w-5 h-5 text-amber-400" />
          </ContractTooltip>
          <h3 class="text-lg font-semibold text-amber-400">
            {{ contract.title || `Contrato ${contract.id.slice(0, 6)}` }}
          </h3>
          <InfoButton
            help-key="contract-contractors"
            @open-help="$emit('open-help', 'contract-contractors')"
            button-class="text-xs"
          />
        </div>
        <ContractStatusComponent :status="contract.status" size="sm" />
      </div>

      <p class="text-md text-gray-400 mt-1">
        {{ contractorTypeLabel }} -
        {{ contract.contractorName || "Nome não especificado" }}
      </p>
    </div>

    <!-- Conteúdo principal -->
    <div class="p-4 space-y-3">
      <!-- Objetivo -->
      <div v-if="contract.objective">
        <div class="flex items-center gap-1 mb-1">
          <ContractTooltip
            :content="getObjectiveTooltip()"
            :title="'Objetivo do Contrato'"
          >
            <p class="text-md font-medium text-gray-300">
              {{ contract.objective.category }}
            </p>
          </ContractTooltip>
          <InfoButton
            help-key="contract-objectives"
            @open-help="$emit('open-help', 'contract-objectives')"
            button-class="text-xs"
          />
        </div>
        <p class="text-md text-gray-400 line-clamp-2">
          {{ contract.objective.description }}
        </p>
      </div>

      <!-- Localização -->
      <div
        v-if="contract.location"
        class="flex items-center gap-2 text-md text-gray-400"
      >
        <ContractTooltip
          :content="getLocationTooltip()"
          :title="'Localização do Contrato'"
        >
          <MapPinIcon class="w-4 h-4 text-amber-400" />
        </ContractTooltip>
        <span>{{ contract.location.name }}</span>
        <span v-if="contract.location.specification?.location" class="text-md">
          ({{ contract.location.specification?.location }})
        </span>
        <InfoButton
          help-key="contract-locations"
          @open-help="$emit('open-help', 'contract-locations')"
          button-class="text-xs"
        />
      </div>

      <!-- Valores e prazo -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-1">
          <ContractValue
            :value="contract.value"
            :difficulty="contract.difficulty"
            :contractor-type="contract.contractorType"
            size="md"
          />
          <InfoButton
            help-key="contract-values"
            @open-help="$emit('open-help', 'contract-values')"
            button-class="text-xs"
          />
        </div>

        <div v-if="contract.deadline.type !== 'Sem prazo'" class="text-right">
          <ContractTooltip
            :content="getDeadlineTooltip()"
            :title="'Prazo do Contrato'"
            :deadline="contract.deadline.value"
          >
            <p class="text-md font-medium text-gray-300">
              {{ contract.deadline.value }}
            </p>
          </ContractTooltip>
          <!-- Countdown para contratos aceitos -->
          <div
            v-if="daysUntilBreak !== null"
            class="text-sm mt-1"
            :class="
              daysUntilBreak <= 2
                ? 'text-red-400'
                : daysUntilBreak <= 5
                  ? 'text-orange-400'
                  : 'text-blue-400'
            "
          >
            <span v-if="daysUntilBreak === 0">Prazo hoje!</span>
            <span v-else-if="daysUntilBreak === 1">1 dia restante</span>
            <span v-else>{{ daysUntilBreak }} dias restantes</span>
          </div>
        </div>
      </div>

      <!-- Indicadores especiais -->
      <div
        v-if="hasSpecialFeatures"
        class="flex items-center gap-2 pt-2 border-t border-gray-700"
      >
        <!-- Indicador de contrato aceito por outros -->
        <div
          v-if="contract.status === ContractStatus.ACEITO_POR_OUTROS"
          class="flex items-center gap-1 bg-orange-900/30 px-2 py-1 rounded-full text-md text-orange-300"
          :title="getTakenByOthersTooltip()"
        >
          <UsersIcon class="w-3 h-3" />
          <span>Aceito por outros</span>
        </div>

        <!-- Indicador de contrato resolvido por outros -->
        <div
          v-if="contract.status === ContractStatus.RESOLVIDO_POR_OUTROS"
          class="flex items-center gap-1 bg-gray-900/30 px-2 py-1 rounded-full text-md text-gray-400"
          title="Este contrato já foi resolvido por outros aventureiros"
        >
          <CheckCircleIcon class="w-3 h-3" />
          <span>Resolvido por outros</span>
        </div>

        <!-- Indicador de contrato anulado -->
        <div
          v-if="contract.status === ContractStatus.ANULADO"
          class="flex items-center gap-1 bg-gray-900/30 px-2 py-1 rounded-full text-md text-gray-400"
          title="Este contrato foi anulado"
        >
          <CheckCircleIcon class="w-3 h-3" />
          <span>Anulado</span>
        </div>

        <!-- Indicador de aliados -->
        <div
          v-if="contract.allies?.length"
          class="flex items-center gap-1 bg-green-900/30 px-2 py-1 rounded-full text-md text-green-300"
          title="Aliados disponíveis"
        >
          <UserPlusIcon class="w-3 h-3" />
          <span
            >{{ contract.allies.length }} aliado{{
              contract.allies.length > 1 ? "s" : ""
            }}</span
          >
        </div>

        <!-- Indicador de consequências severas -->
        <div
          v-if="contract.severeConsequences?.length"
          class="flex items-center gap-1 bg-red-900/30 px-2 py-1 rounded-full text-md text-red-300"
          title="Consequências por falha"
        >
          <ShieldExclamationIcon class="w-3 h-3" />
          <span>Consequências severas</span>
        </div>

        <!-- Indicador de recompensas adicionais -->
        <div
          v-if="contract.additionalRewards?.length"
          class="flex items-center gap-1 bg-amber-900/30 px-2 py-1 rounded-full text-md text-amber-300"
          :title="getAdditionalRewardsTooltip(contract.additionalRewards)"
        >
          <GiftIcon class="w-3 h-3" />
          <span
            >{{ contract.additionalRewards.length }} extra{{
              contract.additionalRewards.length > 1 ? "s" : ""
            }}</span
          >
        </div>

        <!-- Indicador de penalidade -->
        <div
          v-if="contract.penalty"
          class="flex items-center gap-1 bg-red-900/40 px-2 py-1 rounded-full text-md text-red-300"
          title="Multa aplicada por quebra de contrato"
        >
          <XCircleIcon class="w-3 h-3" />
          <span>Multa: {{ contract.penalty.amount }} PO</span>
        </div>
      </div>
    </div>

    <!-- Footer com ações -->
    <div class="p-4 pt-0">
      <div class="flex gap-2">
        <button
          v-if="canAccept"
          @click="$emit('accept', contract)"
          class="flex-1 bg-green-600 hover:bg-green-700 text-white text-md py-2 px-3 rounded transition-colors"
        >
          Aceitar
        </button>

        <button
          v-if="canComplete"
          @click="$emit('complete', contract)"
          class="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-md py-2 px-3 rounded transition-colors"
        >
          Concluir
        </button>

        <button
          @click="$emit('view-details', contract)"
          class="flex-1 bg-gray-600 hover:bg-gray-700 text-white text-md py-2 px-3 rounded transition-colors"
        >
          Detalhes
        </button>

        <button
          v-if="canAbandon"
          @click="$emit('abandon', contract)"
          class="bg-red-600 hover:bg-red-700 text-white text-md py-2 px-3 rounded transition-colors"
        >
          <XMarkIcon class="w-4 h-4" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Contract } from "@/types/contract";
import {
  ContractStatus,
  ContractorType,
  ContractDifficulty,
  DeadlineType,
} from "@/types/contract";
import { useTimeline } from "@/composables/useTimeline";
import ContractStatusComponent from "./ContractStatus.vue";
import ContractValue from "./ContractValue.vue";
import ContractTooltip from "./ContractTooltip.vue";
import InfoButton from "@/components/common/InfoButton.vue";
import {
  UsersIcon,
  BuildingOfficeIcon,
  QuestionMarkCircleIcon,
  MapPinIcon,
  XMarkIcon,
  UserPlusIcon,
  ShieldExclamationIcon,
  GiftIcon,
  CheckCircleIcon,
} from "@heroicons/vue/24/outline";
import { XCircleIcon } from "@heroicons/vue/24/solid";

interface Props {
  contract: Contract;
  showActions?: boolean;
}

interface Emits {
  accept: [contract: Contract];
  complete: [contract: Contract];
  abandon: [contract: Contract];
  "view-details": [contract: Contract];
  "open-help": [helpKey: string];
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true,
});

defineEmits<Emits>();

// ===== COMPUTED =====

const contractorIcon = computed(() => {
  switch (props.contract.contractorType) {
    case ContractorType.POVO:
      return UsersIcon;
    case ContractorType.GOVERNO:
      return BuildingOfficeIcon;
    case ContractorType.INSTITUICAO:
      return BuildingOfficeIcon;
    default:
      return QuestionMarkCircleIcon;
  }
});

const contractorTypeLabel = computed(() => {
  return props.contract.contractorType;
});

const isExpired = computed(() => {
  return props.contract.status === ContractStatus.EXPIRADO;
});

const isUnavailable = computed(() => {
  return [
    ContractStatus.CONCLUIDO,
    ContractStatus.FALHOU,
    ContractStatus.ANULADO,
    ContractStatus.RESOLVIDO_POR_OUTROS,
  ].includes(props.contract.status);
});

const isHighValue = computed(() => {
  return props.contract.value.finalGoldReward >= 100; // 1000+ pontos = 100+ PO$
});

const isDangerous = computed(() => {
  return [ContractDifficulty.DIFICIL, ContractDifficulty.MORTAL].includes(
    props.contract.difficulty
  );
});

const hasSpecialFeatures = computed(() => {
  return (
    (props.contract.allies?.length || 0) > 0 ||
    (props.contract.severeConsequences?.length || 0) > 0 ||
    (props.contract.additionalRewards?.length || 0) > 0 ||
    !!props.contract.penalty ||
    props.contract.status === ContractStatus.ACEITO_POR_OUTROS ||
    props.contract.status === ContractStatus.RESOLVIDO_POR_OUTROS
  );
});

const canAccept = computed(() => {
  return (
    props.showActions && props.contract.status === ContractStatus.DISPONIVEL
  );
});

const canComplete = computed(() => {
  return (
    props.showActions &&
    [ContractStatus.ACEITO, ContractStatus.EM_ANDAMENTO].includes(
      props.contract.status
    )
  );
});

const canAbandon = computed(() => {
  return (
    props.showActions &&
    [ContractStatus.ACEITO, ContractStatus.EM_ANDAMENTO].includes(
      props.contract.status
    )
  );
});

const daysUntilBreak = computed(() => {
  // Só mostrar para contratos aceitos com prazo
  if (
    ![ContractStatus.ACEITO, ContractStatus.EM_ANDAMENTO].includes(
      props.contract.status
    )
  ) {
    return null;
  }

  if (
    !props.contract.deadlineDate ||
    props.contract.deadline.type === DeadlineType.SEM_PRAZO
  ) {
    return null;
  }

  const timeline = useTimeline();
  const currentDate = timeline.currentDate.value;
  const deadlineDate = props.contract.deadlineDate;

  // Verificação adicional para garantir que não é null
  if (!currentDate || !deadlineDate) {
    return null;
  }

  const daysDiff = timeline.dateUtils.getDaysDifference(
    currentDate,
    deadlineDate
  );

  // Se já passou do prazo, retornar 0
  return Math.max(0, daysDiff);
});

// ===== FUNCTIONS =====

function getTakenByOthersTooltip(): string {
  const info = props.contract.takenByOthersInfo;
  if (!info) return "Este contrato foi aceito por outros aventureiros";

  let tooltip = "Aceito por outros aventureiros";

  if (info.resolutionReason) {
    tooltip += ` - ${info.resolutionReason}`;
  }

  if (info.canReturnToAvailable) {
    tooltip += ". Pode voltar a ficar disponível futuramente.";
  } else {
    tooltip += ". Não retornará à disponibilidade.";
  }

  return tooltip;
}

function getAdditionalRewardsTooltip(
  rewards: { isPositive: boolean }[]
): string {
  if (!rewards || rewards.length === 0) return "";

  const positiveRewards = rewards.filter((r) => r.isPositive);
  const negativeRewards = rewards.filter((r) => r.isPositive === false);

  const parts = [];
  if (positiveRewards.length > 0) {
    parts.push(
      `${positiveRewards.length} recompensa${positiveRewards.length > 1 ? "s" : ""} adicional${positiveRewards.length > 1 ? "is" : ""}`
    );
  }
  if (negativeRewards.length > 0) {
    parts.push(
      `${negativeRewards.length} problema${negativeRewards.length > 1 ? "s" : ""} oculto${negativeRewards.length > 1 ? "s" : ""}`
    );
  }

  return parts.join(" e ");
}

function getContractorTooltip(): string {
  switch (props.contract.contractorType) {
    case ContractorType.POVO:
      return "Cidadãos comuns, comerciantes e artesãos com problemas pessoais. Geralmente oferecem recompensas menores mas histórias emocionais.";
    case ContractorType.GOVERNO:
      return "Líderes oficiais e representantes da lei. Questões de segurança pública e aplicação da lei. Valor afetado pela relação com o governo local.";
    case ContractorType.INSTITUICAO:
      return "Guildas de comerciantes, ordens religiosas e academias. Problemas organizacionais com possível apoio institucional.";
    default:
      return "Tipo de contratante não especificado.";
  }
}

function getObjectiveTooltip(): string {
  if (!props.contract.objective) return "Objetivo não especificado.";

  const category = props.contract.objective.category;
  const tooltips: Record<string, string> = {
    Eliminação:
      "Derrotar criaturas, bandidos ou ameaças específicas. Use o valor XP para balancear encontros.",
    Escolta:
      "Proteger pessoas ou caravanas durante viagens. Considere perigos da jornada e valor da carga.",
    Investigação:
      "Descobrir informações e resolver mistérios. Desafios sociais e de conhecimento.",
    Recuperação:
      "Encontrar objetos, pessoas ou locais perdidos. Pode envolver exploração e busca.",
    Diplomacia:
      "Negociar acordos e resolver conflitos pacificamente. Foco em interpretação e persuasão.",
  };

  return (
    tooltips[category] ||
    `Categoria: ${category}. Use criatividade para desenvolver os desafios.`
  );
}

function getLocationTooltip(): string {
  if (!props.contract.location) return "Localização não especificada.";

  const distance = props.contract.distance;
  let tooltip = `Local da missão: ${props.contract.location.name}.`;

  if (distance) {
    tooltip += ` Distância: ${distance.result}.`;
  }

  tooltip +=
    " A distância afeta o valor do contrato e pode requerer preparação especial para viagem.";

  return tooltip;
}

function getDeadlineTooltip(): string {
  if (
    !props.contract.deadline ||
    props.contract.deadline.type === DeadlineType.SEM_PRAZO
  ) {
    return "Este contrato não possui prazo definido, oferecendo maior flexibilidade para completá-lo.";
  }

  let tooltip = `Prazo: ${props.contract.deadline.value}.`;

  if (daysUntilBreak.value !== null) {
    if (daysUntilBreak.value === 0) {
      tooltip += " Prazo vence hoje!";
    } else if (daysUntilBreak.value <= 2) {
      tooltip += " Prazo crítico!";
    } else if (daysUntilBreak.value <= 5) {
      tooltip += " Prazo próximo.";
    }
  }

  tooltip +=
    " Alguns prazos são arbitrários, outros têm janela de oportunidade específica.";

  return tooltip;
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
