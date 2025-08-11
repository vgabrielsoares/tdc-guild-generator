<template>
  <div class="relative inline-block">
    <!-- Trigger elemento -->
    <div ref="triggerRef" @mouseenter="handleMouseEnter" @mouseleave="showTooltip = false" @focus="handleMouseEnter"
      @blur="showTooltip = false" class="cursor-help">
      <slot />
    </div>

    <!-- Tooltip -->
    <Transition enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-200" enter-from-class="opacity-0" leave-to-class="opacity-0">
      <div v-if="showTooltip" ref="tooltipRef" :class="[
        'absolute z-50 px-4 py-3 text-sm text-white bg-gray-900 rounded-lg shadow-lg border border-gray-600',
        'w-80 max-w-sm break-words',
        positionClasses
      ]" role="tooltip">
        <div class="tooltip-content">
          <div v-if="title" class="font-semibold text-amber-400 mb-1">{{ title }}</div>
          <div class="text-gray-200 leading-relaxed">{{ content }}</div>
        </div>

        <!-- Arrow -->
        <div :class="[
          'absolute w-2 h-2 bg-gray-900 border border-gray-600 transform rotate-45',
          arrowClasses
        ]"></div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'

interface Props {
  content: string
  title?: string
  position?: 'auto' | 'top' | 'bottom' | 'left' | 'right'
}

const props = withDefaults(defineProps<Props>(), {
  position: 'auto'
})

const showTooltip = ref(false)
const triggerRef = ref<HTMLElement>()
const tooltipRef = ref<HTMLElement>()
const actualPosition = ref<'top' | 'bottom' | 'left' | 'right'>('bottom')

const handleMouseEnter = async () => {
  showTooltip.value = true

  if (props.position === 'auto') {
    await nextTick()
    detectPosition()
  } else {
    actualPosition.value = props.position
  }
}

const detectPosition = () => {
  if (!triggerRef.value || !tooltipRef.value) return

  const trigger = triggerRef.value.getBoundingClientRect()
  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight
  }

  // Calcular espaço disponível em cada direção
  const spaceAbove = trigger.top
  const spaceBelow = viewport.height - trigger.bottom
  const spaceLeft = trigger.left
  const spaceRight = viewport.width - trigger.right

  // Priorizar bottom, mas usar top se não houver espaço suficiente
  if (spaceBelow >= 120) {
    actualPosition.value = 'bottom'
  } else if (spaceAbove >= 120) {
    actualPosition.value = 'top'
  } else if (spaceRight >= 320) {
    actualPosition.value = 'right'
  } else if (spaceLeft >= 320) {
    actualPosition.value = 'left'
  } else {
    // Se não há espaço suficiente em nenhum lugar, usar a posição com mais espaço
    const maxSpace = Math.max(spaceAbove, spaceBelow, spaceLeft, spaceRight)
    if (maxSpace === spaceBelow) actualPosition.value = 'bottom'
    else if (maxSpace === spaceAbove) actualPosition.value = 'top'
    else if (maxSpace === spaceRight) actualPosition.value = 'right'
    else actualPosition.value = 'left'
  }
}

const positionClasses = computed(() => {
  const position = props.position === 'auto' ? actualPosition.value : props.position

  switch (position) {
    case 'top':
      return 'bottom-full left-1/2 transform -translate-x-1/2 mb-2'
    case 'bottom':
      return 'top-full left-1/2 transform -translate-x-1/2 mt-2'
    case 'left':
      return 'right-full top-1/2 transform -translate-y-1/2 mr-2'
    case 'right':
      return 'left-full top-1/2 transform -translate-y-1/2 ml-2'
    default:
      return 'top-full left-1/2 transform -translate-x-1/2 mt-2'
  }
})

const arrowClasses = computed(() => {
  const position = props.position === 'auto' ? actualPosition.value : props.position

  switch (position) {
    case 'top':
      return 'top-full left-1/2 transform -translate-x-1/2 -mt-1 border-t-0 border-l-0'
    case 'bottom':
      return 'bottom-full left-1/2 transform -translate-x-1/2 -mb-1 border-b-0 border-r-0'
    case 'left':
      return 'left-full top-1/2 transform -translate-y-1/2 -ml-1 border-l-0 border-b-0'
    case 'right':
      return 'right-full top-1/2 transform -translate-y-1/2 -mr-1 border-r-0 border-t-0'
    default:
      return 'bottom-full left-1/2 transform -translate-x-1/2 -mb-1 border-b-0 border-r-0'
  }
})
</script>
