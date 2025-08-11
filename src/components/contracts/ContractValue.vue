<template>
  <div
    :class="['contract-value', sizeClasses, difficultyClasses]"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
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
    <div
      v-if="showDetails && size !== 'xs' && size !== 'sm'"
      class="value-details"
    >
      <!-- Valor de experiência para o mestre -->
      <div class="value-detail">
        <span class="detail-label">XP:</span>
        <span class="detail-value">{{ formattedExperienceValue }}</span>
      </div>

      <!-- Tipo de pagamento -->
      <div v-if="showPaymentType" class="value-detail">
        <span class="detail-label">Pagamento:</span>
        <span class="detail-value text-xs">
          {{ paymentTypeShort }}
        </span>
      </div>
    </div>

    <!-- Tooltip com detalhes dos valores -->
    <div v-if="props.value && enableTooltip" class="relative">
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="transform scale-100 opacity-100"
        leave-to-class="transform scale-95 opacity-0"
      >
        <div
          v-show="isTooltipVisible"
          class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 bg-slate-900 text-white text-sm rounded-lg p-4 shadow-xl border border-slate-700 min-w-[320px] max-w-[450px]"
        >
          <!-- Seta do tooltip -->
          <div
            class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-slate-900"
          ></div>

          <!-- Conteúdo do tooltip -->
          <div class="space-y-3">
            <!-- Valor base -->
            <div
              class="flex justify-between items-center border-b border-slate-600 pb-2"
            >
              <span class="text-slate-300">Valor Base (1d100):</span>
              <span class="font-mono text-blue-300">{{
                props.value.baseValue
              }}</span>
            </div>

            <!-- Modificadores aplicados às rolagens -->
            <div class="space-y-3">
              <!-- Modificadores para rolagem de Valor XP -->
              <div>
                <div
                  class="text-purple-300 text-xs font-semibold uppercase tracking-wide border-b border-purple-700 pb-1"
                >
                  Modificadores na Rolagem XP:
                </div>

                <div class="space-y-1 mt-2">
                  <template
                    v-for="modifier in xpModifiers"
                    :key="'xp-' + modifier.key"
                  >
                    <div class="flex justify-between items-center">
                      <span class="text-slate-400 text-xs"
                        >{{ modifier.label }}:</span
                      >
                      <span
                        class="font-mono text-xs"
                        :class="[
                          modifier.value > 0
                            ? 'text-green-400'
                            : modifier.value < 0
                              ? 'text-red-400'
                              : 'text-slate-400',
                        ]"
                      >
                        {{ modifier.value > 0 ? "+" : "" }}{{ modifier.value }}
                      </span>
                    </div>
                  </template>

                  <!-- Total Modificadores XP -->
                  <div
                    class="flex justify-between items-center border-t border-purple-700 pt-1 mt-2"
                  >
                    <span class="text-purple-300 text-xs font-semibold"
                      >Total de Modificadores:</span
                    >
                    <span
                      class="font-mono text-xs font-semibold"
                      :class="[
                        totalXpModifiers > 0
                          ? 'text-green-400'
                          : totalXpModifiers < 0
                            ? 'text-red-400'
                            : 'text-slate-400',
                      ]"
                    >
                      {{ totalXpModifiers > 0 ? "+" : ""
                      }}{{ totalXpModifiers }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Modificadores para rolagem de Recompensa -->
              <div>
                <div
                  class="text-yellow-300 text-xs font-semibold uppercase tracking-wide border-b border-yellow-700 pb-1"
                >
                  Modificadores na Rolagem Recompensa:
                </div>

                <div class="space-y-1 mt-2">
                  <template
                    v-for="modifier in rewardModifiers"
                    :key="'reward-' + modifier.key"
                  >
                    <div class="flex justify-between items-center">
                      <span class="text-slate-400 text-xs"
                        >{{ modifier.label }}:</span
                      >
                      <span
                        class="font-mono text-xs"
                        :class="[
                          modifier.value > 0
                            ? 'text-green-400'
                            : modifier.value < 0
                              ? 'text-red-400'
                              : 'text-slate-400',
                        ]"
                      >
                        {{ modifier.value > 0 ? "+" : "" }}{{ modifier.value }}
                      </span>
                    </div>
                  </template>

                  <!-- Total Modificadores Recompensa -->
                  <div
                    class="flex justify-between items-center border-t border-yellow-700 pt-1 mt-2"
                  >
                    <span class="text-yellow-300 text-xs font-semibold"
                      >Total de Modificadores:</span
                    >
                    <span
                      class="font-mono text-xs font-semibold"
                      :class="[
                        totalRewardModifiers > 0
                          ? 'text-green-400'
                          : totalRewardModifiers < 0
                            ? 'text-red-400'
                            : 'text-slate-400',
                      ]"
                    >
                      {{ totalRewardModifiers > 0 ? "+" : ""
                      }}{{ totalRewardModifiers }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Valores finais com explicação do cálculo -->
            <div class="space-y-2 border-t border-slate-600 pt-2">
              <div
                class="text-slate-300 text-xs font-semibold uppercase tracking-wide"
              >
                Cálculo Final:
              </div>

              <!-- Processo de cálculo -->
              <div class="text-xs text-slate-400 space-y-1">
                <div class="flex justify-between">
                  <span>Valor Base (1d100):</span>
                  <span class="font-mono">{{ props.value.baseValue }}</span>
                </div>
                <div class="flex justify-between">
                  <span>+ Modificadores aplicados</span>
                  <span class="font-mono">→ Rolagem modificada</span>
                </div>
                <div class="flex justify-between">
                  <span>= Valor da tabela</span>
                  <span class="font-mono">→ Consulta tabela</span>
                </div>
                <div class="flex justify-between">
                  <span>× Multiplicador dificuldade</span>
                  <span class="font-mono">→ Valor final</span>
                </div>
              </div>

              <!-- Separador -->
              <div class="border-t border-slate-700 pt-2"></div>

              <!-- Valores finais -->
              <div class="space-y-1">
                <div class="flex justify-between items-center">
                  <span class="text-purple-300">Valor XP:</span>
                  <span class="font-mono text-purple-300 font-semibold">
                    {{ props.value.experienceValue }}
                  </span>
                </div>

                <div class="flex justify-between items-center">
                  <span class="text-yellow-300">Recompensa:</span>
                  <span class="font-mono text-yellow-300 font-semibold">
                    {{ props.value.rewardValue }} pts
                  </span>
                </div>

                <div class="flex justify-between items-center">
                  <span class="text-amber-300">Ouro Final:</span>
                  <span class="font-mono text-amber-300 font-semibold">
                    {{ props.value.finalGoldReward }} PO$
                  </span>
                </div>

                <div class="text-xs text-slate-500 mt-1">
                  * Ouro = Recompensa ÷ 10
                </div>
              </div>
            </div>

            <!-- Multiplicadores de dificuldade -->
            <div
              v-if="
                props.value.modifiers.difficultyMultiplier
                  .experienceMultiplier > 1 ||
                props.value.modifiers.difficultyMultiplier.rewardMultiplier > 1
              "
              class="space-y-1 border-t border-slate-600 pt-2"
            >
              <div
                class="text-slate-300 text-xs font-semibold uppercase tracking-wide"
              >
                Multiplicadores de Dificuldade:
              </div>

              <div class="flex justify-between items-center">
                <span class="text-purple-300 text-xs">XP:</span>
                <span class="font-mono text-purple-300 text-xs">
                  x{{
                    props.value.modifiers.difficultyMultiplier
                      .experienceMultiplier
                  }}
                </span>
              </div>

              <div class="flex justify-between items-center">
                <span class="text-yellow-300 text-xs">Recompensa:</span>
                <span class="font-mono text-yellow-300 text-xs">
                  x{{
                    props.value.modifiers.difficultyMultiplier.rewardMultiplier
                  }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import type { ContractValue } from "@/types/contract";
import { ContractDifficulty, PaymentType, ContractorType } from "@/types/contract";

interface Props {
  value: ContractValue;
  difficulty?: ContractDifficulty;
  contractorType?: ContractorType;
  size?: "xs" | "sm" | "md" | "lg";
  showDifficulty?: boolean;
  showDetails?: boolean;
  showPaymentType?: boolean;
  showTooltip?: boolean;
  paymentType?: PaymentType;
}

const props = withDefaults(defineProps<Props>(), {
  size: "md",
  showDifficulty: true,
  showDetails: true,
  showPaymentType: false,
  showTooltip: true,
});

// ===== REACTIVE STATE =====
const isTooltipVisible = ref(false);

// ===== COMPUTED =====

const enableTooltip = computed(() => {
  // Habilita tooltip por padrão, exceto quando explicitamente desabilitado
  // ou em tamanhos muito pequenos onde não faz sentido
  return props.showTooltip && props.size !== "xs";
});

const formattedGoldValue = computed(() => {
  const value = props.value.finalGoldReward;
  if (value >= 1000) {
    return `${Number((value / 1000).toFixed(1))}k`;
  }
  return Number(value.toFixed(1)).toString();
});

const formattedExperienceValue = computed(() => {
  const value = props.value.experienceValue;
  if (value >= 1000) {
    return `${Number((value / 1000).toFixed(1))}k`;
  }
  return Number(value.toFixed(1)).toString();
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case "xs":
      return "text-xs space-y-0.5";
    case "sm":
      return "text-sm space-y-1";
    case "md":
      return "text-base space-y-1";
    case "lg":
      return "text-lg space-y-2";
    default:
      return "text-base space-y-1";
  }
});

const difficultyClasses = computed(() => {
  if (!props.difficulty) return "";

  switch (props.difficulty) {
    case ContractDifficulty.FACIL:
      return "border-l-4 border-green-500 pl-2";
    case ContractDifficulty.MEDIO:
      return "border-l-4 border-yellow-500 pl-2";
    case ContractDifficulty.DIFICIL:
      return "border-l-4 border-orange-500 pl-2";
    case ContractDifficulty.MORTAL:
      return "border-l-4 border-red-500 pl-2";
    default:
      return "";
  }
});

const difficultyTextClasses = computed(() => {
  if (!props.difficulty) return "text-gray-400";

  switch (props.difficulty) {
    case ContractDifficulty.FACIL:
      return "text-green-400";
    case ContractDifficulty.MEDIO:
      return "text-yellow-400";
    case ContractDifficulty.DIFICIL:
      return "text-orange-400";
    case ContractDifficulty.MORTAL:
      return "text-red-400";
    default:
      return "text-gray-400";
  }
});

// Separar modificadores por categoria (XP vs Recompensa)
const xpModifiers = computed(() => {
  if (!props.value?.modifiers) return [];

  const modifiers = props.value.modifiers;
  const result = [];

  // Distância afeta ambos (XP e Recompensa)
  if (modifiers.distance !== 0) {
    result.push({
      key: "distance",
      label: "Distância",
      value: modifiers.distance,
    });
  }

  // Relação com população afeta valor de XP (APENAS se contratante for do Povo)
  if (modifiers.populationRelationValue !== 0 && props.contractorType === ContractorType.POVO) {
    result.push({
      key: "populationValue",
      label: "Relação Pop.",
      value: modifiers.populationRelationValue,
    });
  }

  // Relação com governo afeta valor de XP (APENAS se contratante for do Governo)
  if (modifiers.governmentRelationValue !== 0 && props.contractorType === ContractorType.GOVERNO) {
    result.push({
      key: "governmentValue",
      label: "Relação Gov.",
      value: modifiers.governmentRelationValue,
    });
  }

  return result;
});

const rewardModifiers = computed(() => {
  if (!props.value?.modifiers) return [];

  const modifiers = props.value.modifiers;
  const result = [];

  // Distância afeta ambos (XP e Recompensa)
  if (modifiers.distance !== 0) {
    result.push({
      key: "distance",
      label: "Distância",
      value: modifiers.distance,
    });
  }

  // Relação com população afeta recompensa (APENAS se contratante for do Povo)
  if (modifiers.populationRelationReward !== 0 && props.contractorType === ContractorType.POVO) {
    result.push({
      key: "populationReward",
      label: "Relação Pop.",
      value: modifiers.populationRelationReward,
    });
  }

  // Relação com governo afeta recompensa (APENAS se contratante for do Governo)
  if (modifiers.governmentRelationReward !== 0 && props.contractorType === ContractorType.GOVERNO) {
    result.push({
      key: "governmentReward",
      label: "Relação Gov.",
      value: modifiers.governmentRelationReward,
    });
  }

  // Funcionários afetam apenas recompensa
  if (modifiers.staffPreparation !== 0) {
    result.push({
      key: "staffPreparation",
      label: "Prep. Funcionários",
      value: modifiers.staffPreparation,
    });
  }

  // Pré-requisitos e cláusulas afetam a rolagem de recompensa
  if (modifiers.requirementsAndClauses !== 0) {
    result.push({
      key: "requirements",
      label: "Pré-req. & Cláusulas",
      value: modifiers.requirementsAndClauses,
    });
  }

  return result;
});

const totalXpModifiers = computed(() => {
  if (!props.value?.modifiers) return 0;

  const modifiers = props.value.modifiers;
  let total = modifiers.distance;
  
  // Adicionar modificadores de relação apenas se aplicáveis ao tipo de contratante
  if (props.contractorType === ContractorType.POVO) {
    total += modifiers.populationRelationValue;
  }
  if (props.contractorType === ContractorType.GOVERNO) {
    total += modifiers.governmentRelationValue;
  }
  // Instituições de Ofício são neutras (sem modificadores de relação)
  
  return total;
});

const totalRewardModifiers = computed(() => {
  if (!props.value?.modifiers) return 0;

  const modifiers = props.value.modifiers;
  let total = modifiers.distance + modifiers.staffPreparation + modifiers.requirementsAndClauses;
  
  // Adicionar modificadores de relação apenas se aplicáveis ao tipo de contratante
  if (props.contractorType === ContractorType.POVO) {
    total += modifiers.populationRelationReward;
  }
  if (props.contractorType === ContractorType.GOVERNO) {
    total += modifiers.governmentRelationReward;
  }
  // Instituições de Ofício são neutras (sem modificadores de relação)
  
  return total;
});

const paymentTypeShort = computed(() => {
  if (!props.paymentType) return "";

  switch (props.paymentType) {
    case PaymentType.DIRETO_CONTRATANTE:
      return "Direto";
    case PaymentType.METADE_GUILDA_METADE_CONTRATANTE:
      return "50/50";
    case PaymentType.METADE_GUILDA_METADE_BENS:
      return "50/50 Bens";
    case PaymentType.BENS_SERVICOS:
      return "Bens";
    case PaymentType.TOTAL_GUILDA:
      return "Guilda";
    case PaymentType.TOTAL_GUILDA_MAIS_SERVICOS:
      return "Guilda+";
    default:
      return "";
  }
});

// ===== METHODS =====

function onMouseEnter() {
  if (enableTooltip.value) {
    isTooltipVisible.value = true;
  }
}

function onMouseLeave() {
  isTooltipVisible.value = false;
}
</script>

<style scoped>
.contract-value {
  color: rgb(229, 231, 235);
  cursor: help;
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
  font-size: 1rem;
  color: rgb(156, 163, 175);
  font-weight: 500;
}

.value-difficulty {
  font-size: 1rem;
  font-weight: 500;
}

.value-details {
  font-size: 1rem;
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
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
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
  font-size: 1rem;
  font-weight: 600;
  color: rgb(251, 191, 36);
  border-bottom: 1px solid rgb(75, 85, 99);
  padding-bottom: 0.25rem;
}

.tooltip-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 1rem;
}

.tooltip-label {
  color: rgb(156, 163, 175);
}

.tooltip-value {
  color: rgb(229, 231, 235);
  font-weight: 500;
}
</style>
