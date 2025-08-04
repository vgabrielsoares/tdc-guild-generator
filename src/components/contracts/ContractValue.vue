<template>
  <div
    :class="[
      'contract-value',
      sizeClasses,
      difficultyClasses
    ]"
  >
    <!-- Valor principal (recompensa em PO$) -->
    <div class="value-main">
      <span class="value-amount">
        {{ formattedGoldValue }}
      </span>
      <span class="value-currency">PO$</span>
    </div>

    <!-- Dificuldade (quando mostrada) -->
    <div v-if="showDifficulty" class="value-difficulty">
      <span :class="difficultyTextClasses">
        {{ difficulty }}
      </span>
    </div>

    <!-- Detalhes extras em tamanho maior -->
    <div v-if="showDetails && size !== 'xs' && size !== 'sm'" class="value-details">
      <!-- Valor de experiência para o mestre -->
      <div class="value-detail">
        <span class="detail-label">XP:</span>
        <span class="detail-value">{{ formattedExperienceValue }}</span>
      </div>

      <!-- Modificadores aplicados -->
      <div v-if="hasModifiers" class="value-detail">
        <span class="detail-label">Mods:</span>
        <span :class="modifierClasses">
          {{ totalModifierDisplay }}
        </span>
      </div>

      <!-- Tipo de pagamento -->
      <div v-if="showPaymentType" class="value-detail">
        <span class="detail-label">Pagamento:</span>
        <span class="detail-value text-xs">
          {{ paymentTypeShort }}
        </span>
      </div>
    </div>

    <!-- Tooltip com detalhes completos -->
    <div v-if="showTooltip" class="value-tooltip">
      <div class="tooltip-section">
        <h4 class="tooltip-title">Valores do Contrato</h4>
        
        <div class="tooltip-item">
          <span class="tooltip-label">Valor Base (1d100):</span>
          <span class="tooltip-value">{{ value.baseValue }}</span>
        </div>
        
        <div class="tooltip-item">
          <span class="tooltip-label">Experiência (XP):</span>
          <span class="tooltip-value">{{ formattedExperienceValue }}</span>
        </div>
        
        <div class="tooltip-item">
          <span class="tooltip-label">Recompensa (pontos):</span>
          <span class="tooltip-value">{{ formattedRewardValue }}</span>
        </div>
        
        <div class="tooltip-item">
          <span class="tooltip-label">Pagamento final:</span>
          <span class="tooltip-value font-bold">{{ formattedGoldValue }} PO$</span>
        </div>
      </div>

      <div v-if="hasModifiers" class="tooltip-section">
        <h4 class="tooltip-title">Modificadores</h4>
        
        <div v-if="value.modifiers.distance !== 0" class="tooltip-item">
          <span class="tooltip-label">Distância:</span>
          <span :class="getModifierClass(value.modifiers.distance)">
            {{ formatModifier(value.modifiers.distance) }}
          </span>
        </div>
        
        <div v-if="value.modifiers.populationRelationValue !== 0" class="tooltip-item">
          <span class="tooltip-label">Relação População:</span>
          <span :class="getModifierClass(value.modifiers.populationRelationValue)">
            {{ formatModifier(value.modifiers.populationRelationValue) }}
          </span>
        </div>
        
        <div v-if="value.modifiers.governmentRelationValue !== 0" class="tooltip-item">
          <span class="tooltip-label">Relação Governo:</span>
          <span :class="getModifierClass(value.modifiers.governmentRelationValue)">
            {{ formatModifier(value.modifiers.governmentRelationValue) }}
          </span>
        </div>
        
        <div v-if="value.modifiers.staffPreparation !== 0" class="tooltip-item">
          <span class="tooltip-label">Funcionários:</span>
          <span :class="getModifierClass(value.modifiers.staffPreparation)">
            {{ formatModifier(value.modifiers.staffPreparation) }}
          </span>
        </div>
        
        <div v-if="value.modifiers.requirementsAndClauses > 0" class="tooltip-item">
          <span class="tooltip-label">Pré-req./Cláusulas:</span>
          <span class="text-green-300">
            +{{ value.modifiers.requirementsAndClauses }}
          </span>
        </div>
      </div>

      <div v-if="hasDifficultyMultipliers" class="tooltip-section">
        <h4 class="tooltip-title">Multiplicadores de Dificuldade</h4>
        
        <div class="tooltip-item">
          <span class="tooltip-label">Mult. Experiência:</span>
          <span class="tooltip-value">×{{ value.modifiers.difficultyMultiplier.experienceMultiplier }}</span>
        </div>
        
        <div class="tooltip-item">
          <span class="tooltip-label">Mult. Recompensa:</span>
          <span class="tooltip-value">×{{ value.modifiers.difficultyMultiplier.rewardMultiplier }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ContractValue } from '@/types/contract';
import { ContractDifficulty, PaymentType } from '@/types/contract';

interface Props {
  value: ContractValue;
  difficulty?: ContractDifficulty;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showDifficulty?: boolean;
  showDetails?: boolean;
  showPaymentType?: boolean;
  showTooltip?: boolean;
  paymentType?: PaymentType;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showDifficulty: true,
  showDetails: true,
  showPaymentType: false,
  showTooltip: false
});

// ===== COMPUTED =====

const formattedGoldValue = computed(() => {
  const value = props.value.finalGoldReward;
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return value.toString();
});

const formattedExperienceValue = computed(() => {
  const value = props.value.experienceValue;
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return value.toString();
});

const formattedRewardValue = computed(() => {
  const value = props.value.rewardValue;
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  return value.toString();
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'text-xs space-y-0.5';
    case 'sm':
      return 'text-sm space-y-1';
    case 'md':
      return 'text-base space-y-1';
    case 'lg':
      return 'text-lg space-y-2';
    default:
      return 'text-base space-y-1';
  }
});

const difficultyClasses = computed(() => {
  if (!props.difficulty) return '';
  
  switch (props.difficulty) {
    case ContractDifficulty.FACIL:
      return 'border-l-4 border-green-500 pl-2';
    case ContractDifficulty.MEDIO:
      return 'border-l-4 border-yellow-500 pl-2';
    case ContractDifficulty.DIFICIL:
      return 'border-l-4 border-orange-500 pl-2';
    case ContractDifficulty.MORTAL:
      return 'border-l-4 border-red-500 pl-2';
    default:
      return '';
  }
});

const difficultyTextClasses = computed(() => {
  if (!props.difficulty) return 'text-gray-400';
  
  switch (props.difficulty) {
    case ContractDifficulty.FACIL:
      return 'text-green-400';
    case ContractDifficulty.MEDIO:
      return 'text-yellow-400';
    case ContractDifficulty.DIFICIL:
      return 'text-orange-400';
    case ContractDifficulty.MORTAL:
      return 'text-red-400';
    default:
      return 'text-gray-400';
  }
});

const hasModifiers = computed(() => {
  const mods = props.value.modifiers;
  return mods.distance !== 0 ||
         mods.populationRelationValue !== 0 ||
         mods.governmentRelationValue !== 0 ||
         mods.staffPreparation !== 0 ||
         mods.requirementsAndClauses > 0;
});

const hasDifficultyMultipliers = computed(() => {
  const mods = props.value.modifiers.difficultyMultiplier;
  return mods.experienceMultiplier !== 1 || mods.rewardMultiplier !== 1;
});

const totalModifierDisplay = computed(() => {
  const mods = props.value.modifiers;
  const total = mods.distance + 
                mods.populationRelationValue + 
                mods.governmentRelationValue + 
                mods.staffPreparation + 
                mods.requirementsAndClauses;
  
  return formatModifier(total);
});

const modifierClasses = computed(() => {
  const mods = props.value.modifiers;
  const total = mods.distance + 
                mods.populationRelationValue + 
                mods.governmentRelationValue + 
                mods.staffPreparation + 
                mods.requirementsAndClauses;
  
  return getModifierClass(total);
});

const paymentTypeShort = computed(() => {
  if (!props.paymentType) return '';
  
  switch (props.paymentType) {
    case PaymentType.DIRETO_CONTRATANTE:
      return 'Direto';
    case PaymentType.METADE_GUILDA_METADE_CONTRATANTE:
      return '50/50';
    case PaymentType.METADE_GUILDA_METADE_BENS:
      return '50/50 Bens';
    case PaymentType.BENS_SERVICOS:
      return 'Bens';
    case PaymentType.TOTAL_GUILDA:
      return 'Guilda';
    case PaymentType.TOTAL_GUILDA_MAIS_SERVICOS:
      return 'Guilda+';
    default:
      return '';
  }
});

// ===== METHODS =====

function formatModifier(value: number): string {
  return value >= 0 ? `+${value}` : value.toString();
}

function getModifierClass(value: number): string {
  if (value > 0) return 'text-green-300';
  if (value < 0) return 'text-red-300';
  return 'text-gray-400';
}
</script>

<style scoped>
.contract-value {
  color: rgb(229, 231, 235);
}

.value-main {
  display: flex;
  align-items: baseline;
  gap: 0.25rem;
}

.value-amount {
  font-weight: bold;
  color: rgb(251, 191, 36);
}

.value-currency {
  font-size: 0.75rem;
  color: rgb(156, 163, 175);
  font-weight: 500;
}

.value-difficulty {
  font-size: 0.75rem;
  font-weight: 500;
}

.value-details {
  font-size: 0.75rem;
}

.value-details > * + * {
  margin-top: 0.125rem;
}

.value-detail {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.detail-label {
  color: rgb(107, 114, 128);
  font-weight: 500;
}

.detail-value {
  color: rgb(209, 213, 219);
}

.value-tooltip {
  position: absolute;
  z-index: 10;
  background-color: rgb(17, 24, 39);
  border: 1px solid rgb(75, 85, 99);
  border-radius: 0.5rem;
  padding: 0.75rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  min-width: 16rem;
  top: 100%;
  left: 0;
  margin-top: 0.5rem;
}

.value-tooltip > * + * {
  margin-top: 0.75rem;
}

.tooltip-section > * + * {
  margin-top: 0.25rem;
}

.tooltip-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: rgb(251, 191, 36);
  border-bottom: 1px solid rgb(75, 85, 99);
  padding-bottom: 0.25rem;
}

.tooltip-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
}

.tooltip-label {
  color: rgb(156, 163, 175);
}

.tooltip-value {
  color: rgb(229, 231, 235);
  font-weight: 500;
}
</style>
