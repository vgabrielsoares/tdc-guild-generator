<template>
  <div class="roll-result p-4 rounded-lg border transition-all duration-300" :class="resultClasses">
    <!-- Roll Header -->
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <span class="text-sm font-medium text-gray-300">{{ roll.notation }}</span>
        <span v-if="context" class="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">
          {{ context }}
        </span>
      </div>
      <span class="text-xl font-bold" :class="resultTextClass">
        {{ roll.result }}
      </span>
    </div>

    <!-- Roll Details -->
    <div class="text-sm text-gray-400 space-y-1">
      <div v-if="(roll.individual && roll.individual.length > 1) || showDetails">
        <span class="mr-1">Dados:</span>
        <span class="font-mono">[{{ roll.individual?.join(', ') || '-' }}]</span>
      </div>

      <div v-if="roll.modifier !== undefined && roll.modifier !== 0">
        <span class="mr-1">Modificador:</span>
        <span class="font-mono">{{ roll.modifier > 0 ? '+' : '' }}{{ roll.modifier }}</span>
      </div>

      <div v-if="showTimestamp" class="text-xs">
        {{ formatTime(roll.timestamp) }}
      </div>
    </div>

    <!-- Roll Actions -->
    <div v-if="showActions" class="flex gap-2 mt-3">
      <button v-if="canReroll" @click="$emit('reroll')"
        class="text-xs px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded transition-colors flex items-center gap-1">
        <font-awesome-icon icon="arrows-rotate" />
        Rolar Novamente
      </button>

      <button v-if="canCopy" @click="copyResult"
        class="text-xs px-2 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors flex items-center gap-1">
        <font-awesome-icon icon="copy" />
        Copiar
      </button>
    </div>

    <!-- Animation overlay for new rolls -->
    <div v-if="isNew && showAnimation" class="absolute inset-0 bg-amber-500 opacity-20 rounded-lg animate-pulse"></div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { DiceRoll, RollLog } from '@/types/dice'

// Props
interface Props {
  roll: DiceRoll | RollLog
  context?: string
  variant?: 'default' | 'success' | 'warning' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  showDetails?: boolean
  showTimestamp?: boolean
  showActions?: boolean
  canReroll?: boolean
  canCopy?: boolean
  isNew?: boolean
  showAnimation?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  size: 'md',
  showDetails: true,
  showTimestamp: true,
  showActions: true,
  canReroll: true,
  canCopy: true,
  isNew: false,
  showAnimation: true
})

// Emits
const emit = defineEmits<{
  reroll: []
  copy: [text: string]
}>()

// Computed classes
const resultClasses = computed(() => {
  const base = 'relative'

  const variants = {
    default: 'bg-gray-700 border-gray-600',
    success: 'bg-green-900 border-green-600',
    warning: 'bg-yellow-900 border-yellow-600',
    danger: 'bg-red-900 border-red-600'
  }

  const sizes = {
    sm: 'p-2 text-sm',
    md: 'p-4',
    lg: 'p-6 text-lg'
  }

  return [base, variants[props.variant], sizes[props.size]].join(' ')
})

const resultTextClass = computed(() => {
  const variants = {
    default: 'text-amber-400',
    success: 'text-green-400',
    warning: 'text-yellow-400',
    danger: 'text-red-400'
  }

  return variants[props.variant]
})

// Methods
const formatTime = (date: Date): string => {
  try {
    const dateObj = new Date(date)
    
    // Verifica se a data é válida
    if (isNaN(dateObj.getTime())) {
      return '--:--:--'
    }
    
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(dateObj)
  } catch {
    return '--:--:--'
  }
}

const copyResult = async () => {
  const text = `${props.roll.notation}: ${props.roll.result}`

  try {
    await navigator.clipboard.writeText(text)
    emit('copy', text)
    console.log('[ROLL RESULT] Result copied to clipboard:', text)
  } catch (error) {
    console.warn('Failed to copy to clipboard:', error)
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    emit('copy', text)
  }
}

console.log('[ROLL RESULT] RollResult component loaded')
</script>

<style scoped>
@keyframes pulse {

  0%,
  100% {
    opacity: 0.2;
  }

  50% {
    opacity: 0.4;
  }
}

.animate-pulse {
  animation: pulse 1s ease-in-out;
}
</style>
