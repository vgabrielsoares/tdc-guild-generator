<template>
  <div class="service-value">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-2">
        <!-- Valor atual -->
        <span
          :class="valueClass"
          class="font-bold cursor-help"
          :title="valueTooltip"
        >
          {{ currentValue }} {{ value.currency }}
        </span>

        <!-- Indicador de taxa de recorrência aplicada -->
        <span
          v-if="hasRecurrenceBonus"
          class="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full border border-green-200 cursor-help"
          :title="recurrenceTooltip"
        >
          +{{ appliedBonusAmount }} {{ value.currency }}
        </span>
      </div>

      <!-- Informações extras -->
      <div class="text-right">
        <div class="text-xs text-gray-400 cursor-help" :title="rollTooltip">
          {{ value.rewardRoll }}
        </div>
        <div
          v-if="hasRecurrenceBonus"
          class="text-xs text-green-600 cursor-help"
          :title="bonusCountTooltip"
        >
          {{ recurrenceCount }}x bônus
        </div>
      </div>
    </div>

    <!-- Detalhes do valor (expandível) -->
    <div v-if="showDetails" class="mt-2 text-xs text-gray-500 space-y-1">
      <div>Valor base: {{ value.rewardAmount }} {{ value.currency }}</div>
      <div v-if="hasRecurrenceBonus">
        Bônus por recorrência: {{ value.recurrenceBonus }} (aplicado
        {{ recurrenceCount }}x)
      </div>
      <div>Dificuldade: {{ difficultyLabel }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ServiceValue } from "@/types/service";

interface Props {
  value: ServiceValue;
  showDetails?: boolean;
  recurrenceCount?: number; // Quantas vezes a taxa de recorrência foi aplicada
}

const props = withDefaults(defineProps<Props>(), {
  showDetails: false,
  recurrenceCount: 0,
});

// Valor atual (base + bônus de recorrência aplicado)
const currentValue = computed(() => {
  const baseValue = props.value.rewardAmount;
  const bonusPerApplication = props.value.recurrenceBonusAmount;
  const totalBonus = bonusPerApplication * props.recurrenceCount;

  return Math.round((baseValue + totalBonus) * 100) / 100; // Arredondar para 2 casas decimais
});

// Quantidade de bônus aplicada
const appliedBonusAmount = computed(() => {
  return (
    Math.round(
      props.value.recurrenceBonusAmount * props.recurrenceCount * 100
    ) / 100
  );
});

// Se tem bônus de recorrência aplicado
const hasRecurrenceBonus = computed(() => props.recurrenceCount > 0);

// Classe de cor baseada no valor
const valueClass = computed(() => {
  const value = currentValue.value;

  if (props.value.currency === "PO$") {
    if (value >= 10) return "text-yellow-400"; // Alto valor em PO$
    if (value >= 5) return "text-amber-400"; // Médio valor em PO$
    return "text-yellow-600"; // Baixo valor em PO$
  } else {
    // Valores em C$ (Cobre)
    if (value >= 100) return "text-yellow-400"; // 100+ C$ = 1+ PO$ (alto)
    if (value >= 50) return "text-amber-400"; // 50+ C$ = 0.5+ PO$ (médio)
    return "text-orange-400"; // Baixo valor em C$
  }
});

// Label da dificuldade
const difficultyLabel = computed(() => {
  return props.value.difficulty.split(" (")[0];
});

// Tooltip da recorrência
const recurrenceTooltip = computed(() => {
  return `Taxa de recorrência aplicada ${props.recurrenceCount}x. Bônus: ${props.value.recurrenceBonus} por aplicação.`;
});

// Tooltip do valor principal
const valueTooltip = computed(() => {
  const baseText = `Valor base: ${props.value.rewardAmount} ${props.value.currency}`;
  const bonusText = hasRecurrenceBonus.value
    ? ` + Bônus de recorrência: ${appliedBonusAmount.value} ${props.value.currency}`
    : "";
  const diffText = ` (Dificuldade: ${difficultyLabel.value})`;
  return baseText + bonusText + diffText;
});

// Tooltip da rolagem
const rollTooltip = computed(() => {
  return `Rolagem original que gerou esta recompensa: ${props.value.rewardRoll}`;
});

// Tooltip do contador de bônus
const bonusCountTooltip = computed(() => {
  return `Bônus de recorrência aplicado ${props.recurrenceCount} vezes. Total de bônus: +${appliedBonusAmount.value} ${props.value.currency}`;
});
</script>

<style scoped>
.service-value {
  background-color: rgba(17, 24, 39, 0.3); /* bg-gray-900/30 */
  border-radius: 0.375rem; /* rounded-md */
  padding: 0.5rem; /* p-2 */
}
</style>
