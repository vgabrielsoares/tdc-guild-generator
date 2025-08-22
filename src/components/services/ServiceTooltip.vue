<template>
  <div class="relative inline-block">
    <!-- Trigger elemento -->
    <div
      ref="triggerRef"
      @mouseenter="handleMouseEnter"
      @mouseleave="showTooltip = false"
      @focus="handleMouseEnter"
      @blur="showTooltip = false"
      class="cursor-help"
    >
      <slot />
    </div>

    <!-- Tooltip -->
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="showTooltip"
        ref="tooltipRef"
        :class="[
          'absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg border border-gray-600',
          sizeClass,
          positionClasses,
        ]"
        role="tooltip"
      >
        <div class="tooltip-content">
          <div v-if="title" class="font-semibold text-blue-400 mb-1">
            {{ title }}
          </div>
          <div class="text-gray-200">{{ content }}</div>

          <!-- Informações específicas de serviços -->
          <div v-if="contractorType" class="mt-2 text-xs">
            <div class="text-blue-300 font-medium">
              Tipo: {{ contractorType }}
            </div>
          </div>

          <div v-if="difficulty" class="mt-1 text-xs">
            <span class="text-purple-300 font-medium">Dificuldade: </span>
            <span :class="getDifficultyColor(difficulty)">{{
              difficulty
            }}</span>
          </div>

          <div v-if="complexity" class="mt-1 text-xs">
            <span class="text-yellow-300 font-medium">Complexidade: </span>
            <span class="text-yellow-200">{{ complexity }}</span>
          </div>

          <!-- Dicas adicionais -->
          <div v-if="hint" class="mt-2 text-xs text-gray-400 italic">
            {{ hint }}
          </div>
        </div>

        <!-- Arrow -->
        <div
          :class="[
            'absolute w-2 h-2 bg-gray-900 border border-gray-600 transform rotate-45',
            arrowClasses,
          ]"
        ></div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from "vue";

interface Props {
  content: string;
  title?: string;
  position?: "auto" | "top" | "bottom" | "left" | "right";
  wide?: boolean;
  contractorType?: string;
  difficulty?: string;
  complexity?: string;
  hint?: string;
}

const props = withDefaults(defineProps<Props>(), {
  position: "auto",
  wide: false,
});

const showTooltip = ref(false);
const triggerRef = ref<HTMLElement | null>(null);
const tooltipRef = ref<HTMLElement | null>(null);
const actualPosition = ref<"top" | "bottom" | "left" | "right">("bottom");

const handleMouseEnter = async () => {
  showTooltip.value = true;
  if (props.position === "auto") {
    await nextTick();
    detectPosition();
  } else {
    // props.position here is one of the explicit positions
    actualPosition.value = props.position as
      | "top"
      | "bottom"
      | "left"
      | "right";
  }
};

const detectPosition = () => {
  if (!triggerRef.value || !tooltipRef.value) return;

  const trigger = triggerRef.value.getBoundingClientRect();
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  const spaceAbove = trigger.top;
  const spaceBelow = viewport.height - trigger.bottom;
  const spaceLeft = trigger.left;
  const spaceRight = viewport.width - trigger.right;

  // Priorizar bottom, mas usar top se não houver espaço suficiente
  if (spaceBelow >= 120) {
    actualPosition.value = "bottom";
  } else if (spaceAbove >= 120) {
    actualPosition.value = "top";
  } else if (spaceRight >= 320) {
    actualPosition.value = "right";
  } else if (spaceLeft >= 320) {
    actualPosition.value = "left";
  } else {
    const maxSpace = Math.max(spaceAbove, spaceBelow, spaceLeft, spaceRight);
    if (maxSpace === spaceBelow) actualPosition.value = "bottom";
    else if (maxSpace === spaceAbove) actualPosition.value = "top";
    else if (maxSpace === spaceRight) actualPosition.value = "right";
    else actualPosition.value = "left";
  }
};

const sizeClass = computed(() =>
  props.wide ? "w-96 max-w-xl break-words" : "w-80 max-w-sm break-words"
);

const positionClasses = computed(() => {
  const pos = props.position === "auto" ? actualPosition.value : props.position;
  switch (pos) {
    case "bottom":
      return "top-full left-1/2 transform -translate-x-1/2 mt-2";
    case "left":
      return "right-full top-1/2 transform -translate-y-1/2 mr-2";
    case "right":
      return "left-full top-1/2 transform -translate-y-1/2 ml-2";
    default: // top
      return "bottom-full left-1/2 transform -translate-x-1/2 mb-2";
  }
});

const arrowClasses = computed(() => {
  const pos = props.position === "auto" ? actualPosition.value : props.position;
  switch (pos) {
    case "bottom":
      return "bottom-full left-1/2 transform -translate-x-1/2 mb-1";
    case "left":
      return "left-full top-1/2 transform -translate-y-1/2 -translate-x-1 ml-1";
    case "right":
      return "right-full top-1/2 transform -translate-y-1/2 translate-x-1 mr-1";
    default: // top
      return "top-full left-1/2 transform -translate-x-1/2 -mt-1";
  }
});

function getDifficultyColor(difficulty: string): string {
  if (!difficulty) return "text-gray-400";
  if (difficulty.includes("Muito Fácil")) return "text-green-400";
  if (difficulty.includes("Fácil")) return "text-green-300";
  if (difficulty.includes("Médio")) return "text-yellow-400";
  if (difficulty.includes("Difícil")) return "text-orange-400";
  if (difficulty.includes("Extremo") || difficulty.includes("Extremamente"))
    return "text-red-400";
  return "text-gray-400";
}
</script>

<style scoped>
.service-tooltip {
  cursor: help;
}
</style>
