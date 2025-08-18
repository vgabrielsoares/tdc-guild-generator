<template>
  <div
    class="service-tooltip relative inline-block"
    @mouseenter="showTooltip"
    @mouseleave="hideTooltip"
  >
    <slot />

    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="opacity-0 translate-y-1"
      enter-to-class="opacity-100 translate-y-0"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="opacity-100 translate-y-0"
      leave-to-class="opacity-0 translate-y-1"
    >
      <div
        v-if="isVisible"
        class="absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 border border-blue-600/50 rounded-lg shadow-lg bottom-full left-1/2 transform -translate-x-1/2 mb-2 max-w-xs"
        :style="{ zIndex: 9999 }"
      >
        <!-- Seta do tooltip -->
        <div
          class="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"
        ></div>

        <!-- Título (se fornecido) -->
        <div v-if="title" class="font-semibold text-blue-400 mb-1">
          {{ title }}
        </div>

        <!-- Conteúdo principal -->
        <div class="text-gray-200">
          {{ content }}
        </div>

        <!-- Informações específicas (quando fornecidas) -->
        <div v-if="contractorType" class="mt-2 text-xs text-blue-300">
          Tipo: {{ contractorType }}
        </div>

        <div v-if="difficulty" class="mt-1 text-xs text-yellow-300">
          Dificuldade: {{ difficulty }}
        </div>

        <div v-if="complexity" class="mt-1 text-xs text-purple-300">
          Complexidade: {{ complexity }}
        </div>

        <!-- Dicas adicionais -->
        <div v-if="hint" class="mt-2 text-xs text-gray-400 italic">
          {{ hint }}
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

interface Props {
  title?: string;
  content: string;
  contractorType?: string;
  difficulty?: string;
  complexity?: string;
  hint?: string;
  delay?: number;
}

const props = withDefaults(defineProps<Props>(), {
  delay: 300,
});

const isVisible = ref(false);
let timeoutId: number | null = null;

const showTooltip = () => {
  if (timeoutId) {
    clearTimeout(timeoutId);
  }

  timeoutId = window.setTimeout(() => {
    isVisible.value = true;
  }, props.delay);
};

const hideTooltip = () => {
  if (timeoutId) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }

  isVisible.value = false;
};
</script>

<style scoped>
.service-tooltip {
  cursor: help;
}
</style>
