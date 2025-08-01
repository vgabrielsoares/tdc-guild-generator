<template>
  <div class="relative inline-block">
    <!-- Trigger elemento -->
    <div
      @mouseenter="showTooltip = true"
      @mouseleave="showTooltip = false"
      @focus="showTooltip = true"
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
        :class="[
          'absolute z-50 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg border border-gray-600',
          'max-w-lg break-words',
          positionClasses
        ]"
        role="tooltip"
      >
        <div class="tooltip-content">
          <div v-if="title" class="font-semibold text-amber-400 mb-1">{{ title }}</div>
          <div class="text-gray-200">{{ content }}</div>
        </div>
        
        <!-- Arrow -->
        <div
          :class="[
            'absolute w-2 h-2 bg-gray-900 border border-gray-600 transform rotate-45',
            arrowClasses
          ]"
        ></div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  content: string
  title?: string
  position?: 'top' | 'bottom' | 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  position: 'top'
})

const showTooltip = ref(false)

const positionClasses = computed(() => {
  switch (props.position) {
    case 'top':
      return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2'
    case 'bottom':
      return 'top-full left-1/2 transform -translate-x-1/2 mt-2'
    case 'left':
      return 'right-full top-1/2 transform -translate-y-1/2 mr-2'
    case 'right':
      return 'left-full top-1/2 transform -translate-y-1/2 ml-2'
    default:
      return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2'
  }
})

const arrowClasses = computed(() => {
  switch (props.position) {
    case 'top':
      return 'top-full left-1/2 transform -translate-x-1/2 -mt-1 border-t-0 border-l-0'
    case 'bottom':
      return 'bottom-full left-1/2 transform -translate-x-1/2 -mb-1 border-b-0 border-r-0'
    case 'left':
      return 'left-full top-1/2 transform -translate-y-1/2 -ml-1 border-l-0 border-b-0'
    case 'right':
      return 'right-full top-1/2 transform -translate-y-1/2 -mr-1 border-r-0 border-t-0'
    default:
      return 'top-full left-1/2 transform -translate-x-1/2 -mt-1 border-t-0 border-l-0'
  }
})
</script>
