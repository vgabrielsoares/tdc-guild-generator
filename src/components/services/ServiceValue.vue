<template>
  <div class="service-value w-full">
    <div class="flex items-center justify-between w-full">
      <div class="flex items-center gap-2">
        <!-- Valor atual -->
        <span class="text-white font-medium text-lg">
          {{ currentValue }} {{ value.currency }}
        </span>

        <!-- Indicador de taxa de recorrência aplicada -->
        <span
          v-if="hasRecurrenceBonus"
          class="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full border border-green-200"
        >
          +{{ appliedBonusAmount }} {{ value.currency }}
        </span>
      </div>

      <!-- Informações extras -->
      <div class="text-right">
        <div class="text-xs text-gray-400">
          {{ value.rewardRoll }}
        </div>
        <div v-if="hasRecurrenceBonus" class="text-xs text-green-600">
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

// Label da dificuldade
const difficultyLabel = computed(() => {
  return props.value.difficulty.split(" (")[0];
});
</script>
