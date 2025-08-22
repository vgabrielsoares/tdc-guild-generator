<template>
  <div class="service-value w-full">
    <div class="flex items-center justify-between w-full">
      <div class="flex items-center gap-2">
        <!-- Valor atual -->
        <span class="text-white font-medium text-lg">
          {{ adjustedCurrentValueDisplay }} {{ value.currency }}
        </span>

        <!-- Indicador de taxa de recorrência aplicada -->
        <span
          v-if="hasRecurrenceBonus"
          class="text-xs bg-green-800 text-green-100 px-2 py-0.5 rounded-full border border-green-700"
        >
          +{{ appliedTotalDisplay }} {{ value.currency }}
        </span>
      </div>

      <!-- Informações extras -->
      <div class="text-right">
        <div class="text-xs text-gray-400">
          {{ value.rewardRoll }}
        </div>
        <div v-if="hasRecurrenceBonus" class="text-xs text-green-300">
          {{ recurrenceCount }}x bônus
        </div>
        <div class="text-xs text-gray-300 mt-1">
          Multiplicador: x{{ complexityMultiplier }}
        </div>
      </div>
    </div>

    <!-- Detalhes do valor (expandível) -->
    <div v-if="showDetails" class="mt-2 text-xs text-gray-500 space-y-1">
      <div>Valor base: {{ value.rewardAmount }} {{ value.currency }}</div>
      <div v-if="hasRecurrenceBonus">
        Bônus por recorrência: +{{ recurrenceStepDisplay }} {{ value.currency }}
        <span class="text-gray-400">(aplicado {{ recurrenceCount }}x)</span>
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

// Valor base da taxa (por aplicação) formatado
const recurrenceStepDisplay = computed(() => {
  const step = props.value.recurrenceStepAmount || 0;
  const mult = props.value.complexityMultiplier || 1;
  return formatCurrency(step * mult, props.value.currency);
});

// Valor total aplicado (acumulado) formatado
const appliedTotalDisplay = computed(() => {
  const total = props.value.recurrenceBonusAmount || 0;
  const mult = props.value.complexityMultiplier || 1;
  return formatCurrency(total * mult, props.value.currency);
});

// Se tem bônus de recorrência aplicado
const hasRecurrenceBonus = computed(() => {
  const count =
    props.recurrenceCount || props.value.recurrenceAppliedCount || 0;
  return count > 0;
});

// Label da dificuldade
const difficultyLabel = computed(() => {
  return props.value.difficulty.split(" (")[0];
});

const complexityMultiplier = computed(
  () => props.value.complexityMultiplier || 1
);

const adjustedCurrentValueDisplay = computed(() => {
  const base = props.value.rewardAmount || 0;
  const bonus = props.value.recurrenceBonusAmount || 0;
  const mult = props.value.complexityMultiplier || 1;
  return formatCurrency(
    Math.round((base + bonus) * mult * 100) / 100,
    props.value.currency
  );
});

// Helper de formatação simples: PO$ pode ter casas decimais, C$ normalmente inteiro
function formatCurrency(amount: number, currency: string) {
  const rounded = Math.round((amount + Number.EPSILON) * 100) / 100;
  if (currency === "PO$") {
    const s = rounded.toFixed(2);
    return s.replace(/\.00$/, "").replace(/(\.[0-9])0$/, "$1");
  }
  return Number.isInteger(rounded) ? String(rounded) : String(rounded);
}
</script>
