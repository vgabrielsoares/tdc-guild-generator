<template>
  <div
    class="contract-card bg-gray-800 border border-gray-600 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 hover:border-amber-400/50"
    :class="[
      { 'opacity-60': isExpired || isUnavailable },
      { 'border-amber-400/30': isHighValue },
      { 'border-red-400/30': isDangerous }
    ]"
  >
    <!-- Header com status e tipo de contratante -->
    <div class="p-4 border-b border-gray-700">
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-2">
          <component
            :is="contractorIcon"
            class="w-5 h-5 text-amber-400"
          />
          <h3 class="text-lg font-semibold text-amber-400">
            {{ contract.title || `Contrato ${contract.id.slice(0, 6)}` }}
          </h3>
        </div>
        <ContractStatus :status="contract.status" size="sm" />
      </div>
      
      <p class="text-md text-gray-400 mt-1">
        {{ contractorTypeLabel }} - {{ contract.contractorName || 'Nome não especificado' }}
      </p>
    </div>

    <!-- Conteúdo principal -->
    <div class="p-4 space-y-3">
      <!-- Objetivo -->
      <div v-if="contract.objective">
        <p class="text-md font-medium text-gray-300">
          {{ contract.objective.category }}
        </p>
        <p class="text-md text-gray-400 line-clamp-2">
          {{ contract.objective.description }}
        </p>
      </div>

      <!-- Localização -->
      <div v-if="contract.location" class="flex items-center gap-2 text-md text-gray-400">
        <MapPinIcon class="w-4 h-4 text-amber-400" />
        <span>{{ contract.location.name }}</span>
        <span v-if="contract.location.description" class="text-md">
          ({{ contract.location.description }})
        </span>
      </div>

      <!-- Valores e prazo -->
      <div class="flex items-center justify-between">
        <ContractValue
          :value="contract.value"
          :difficulty="contract.difficulty"
          size="md"
        />
        
        <div v-if="contract.deadline.type !== 'Sem prazo'" class="text-right">
          <p class="text-md font-medium text-gray-300">
            {{ contract.deadline.value }}
          </p>
        </div>
      </div>

      <!-- Indicadores especiais -->
      <div v-if="hasSpecialFeatures" class="flex items-center gap-2 pt-2 border-t border-gray-700">
        <!-- Indicador de aliados -->
        <div v-if="contract.allies?.length" 
             class="flex items-center gap-1 bg-green-900/30 px-2 py-1 rounded-full text-md text-green-300"
             title="Aliados disponíveis">
          <UserPlusIcon class="w-3 h-3" />
          <span>{{ contract.allies.length }} aliado{{ contract.allies.length > 1 ? 's' : '' }}</span>
        </div>

        <!-- Indicador de consequências severas -->
        <div v-if="contract.severeConsequences?.length" 
             class="flex items-center gap-1 bg-red-900/30 px-2 py-1 rounded-full text-md text-red-300"
             title="Consequências por falha">
          <ShieldExclamationIcon class="w-3 h-3" />
          <span>Consequências severas</span>
        </div>

        <!-- Indicador de recompensas adicionais -->
        <div v-if="contract.additionalRewards?.length" 
             class="flex items-center gap-1 bg-amber-900/30 px-2 py-1 rounded-full text-md text-amber-300"
             :title="getAdditionalRewardsTooltip(contract.additionalRewards)">
          <GiftIcon class="w-3 h-3" />
          <span>{{ contract.additionalRewards.length }} extra{{ contract.additionalRewards.length > 1 ? 's' : '' }}</span>
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
import { computed } from 'vue';
import type { Contract } from '@/types/contract';
import { ContractStatus as Status, ContractorType, ContractDifficulty } from '@/types/contract';
import ContractStatus from './ContractStatus.vue';
import ContractValue from './ContractValue.vue';
import { 
  UsersIcon, 
  BuildingOfficeIcon, 
  QuestionMarkCircleIcon,
  MapPinIcon,
  XMarkIcon,
  UserPlusIcon,
  ShieldExclamationIcon,
  GiftIcon
} from '@heroicons/vue/24/outline';

interface Props {
  contract: Contract;
  showActions?: boolean;
}

interface Emits {
  accept: [contract: Contract];
  complete: [contract: Contract];
  abandon: [contract: Contract];
  'view-details': [contract: Contract];
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true
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
  return props.contract.status === Status.EXPIRADO;
});

const isUnavailable = computed(() => {
  return [
    Status.CONCLUIDO,
    Status.FALHOU,
    Status.ANULADO,
    Status.RESOLVIDO_POR_OUTROS
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
  return (props.contract.allies?.length || 0) > 0 || 
         (props.contract.severeConsequences?.length || 0) > 0 ||
         (props.contract.additionalRewards?.length || 0) > 0;
});

const canAccept = computed(() => {
  return props.showActions && props.contract.status === Status.DISPONIVEL;
});

const canComplete = computed(() => {
  return props.showActions && [
    Status.ACEITO,
    Status.EM_ANDAMENTO
  ].includes(props.contract.status);
});

const canAbandon = computed(() => {
  return props.showActions && [
    Status.ACEITO,
    Status.EM_ANDAMENTO
  ].includes(props.contract.status);
});

// ===== FUNCTIONS =====

function getAdditionalRewardsTooltip(rewards: { isPositive: boolean }[]): string {
  if (!rewards || rewards.length === 0) return '';
  
  const positiveRewards = rewards.filter(r => r.isPositive);
  const negativeRewards = rewards.filter(r => r.isPositive === false);
  
  const parts = [];
  if (positiveRewards.length > 0) {
    parts.push(`${positiveRewards.length} recompensa${positiveRewards.length > 1 ? 's' : ''} adicional${positiveRewards.length > 1 ? 'is' : ''}`);
  }
  if (negativeRewards.length > 0) {
    parts.push(`${negativeRewards.length} problema${negativeRewards.length > 1 ? 's' : ''} oculto${negativeRewards.length > 1 ? 's' : ''}`);
  }
  
  return parts.join(' e ');
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
