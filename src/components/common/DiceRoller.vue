<template>
  <div class="dice-roller p-6 bg-gray-800 rounded-lg border border-gray-700">
    <div class="text-center mb-6">
      <h3 class="text-xl font-semibold text-amber-400 mb-2 flex items-center justify-center gap-2">
        <font-awesome-icon icon="dice" class="text-amber-400" />
        Rolador de Dados
      </h3>
      <p class="text-sm text-gray-400">
        Sistema completo de rolagem para RPG
      </p>
    </div>

    <!-- Dice Input Section -->
    <div class="mb-6">
      <div class="flex gap-2 mb-3">
        <input v-model="diceNotation" @keyup.enter="rollDice" type="text" placeholder="Ex: 1d20, 2d6+3, 1d8-1"
          class="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-amber-500" />
        <button @click="rollDice" :disabled="isRolling || !isValidNotation"
          class="px-4 py-2 bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 text-white rounded font-medium transition-colors min-w-[80px] flex items-center gap-2">
          <font-awesome-icon icon="dice" v-if="!isRolling" />
          {{ isRolling ? 'Rolando...' : 'Rolar' }}
        </button>
      </div>

      <!-- Quick Dice Buttons -->
      <div class="flex flex-wrap gap-2 mb-3">
        <button v-for="quickDice in quickDiceOptions" :key="quickDice" @click="setQuickDice(quickDice)"
          class="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors">
          {{ quickDice }}
        </button>
      </div>

      <!-- Advanced Options -->
      <div class="flex flex-wrap gap-3 text-sm">
        <label class="flex items-center text-gray-300">
          <input v-model="rollOptions.advantage" type="checkbox" class="mr-1" />
          Vantagem
        </label>
        <label class="flex items-center text-gray-300">
          <input v-model="rollOptions.disadvantage" type="checkbox" class="mr-1" />
          Desvantagem
        </label>
        <label class="flex items-center text-gray-300">
          <input v-model="rollOptions.exploding" type="checkbox" class="mr-1" />
          Explosivo
        </label>
      </div>
    </div>

    <!-- Current Roll Result -->
    <RollResult 
      v-if="currentRoll" 
      :roll="currentRoll"
      :is-new="true"
      :show-actions="true"
      :can-reroll="true"
      class="mb-6"
      @reroll="reroll"
    />

    <!-- Roll History -->
    <div v-if="rollHistory.length > 0">
      <div class="flex items-center justify-between mb-3">
        <h4 class="text-lg font-semibold text-amber-400 flex items-center gap-2">
          <font-awesome-icon icon="history" />
          Histórico
        </h4>
        <button @click="clearHistory"
          class="text-xs text-red-400 hover:text-red-300 transition-colors flex items-center gap-1">
          <font-awesome-icon icon="trash" />
          Limpar
        </button>
      </div>

      <div class="space-y-2 max-h-48 overflow-y-auto">
        <RollResult
          v-for="roll in rollHistory.slice(0, 10)" 
          :key="roll.id"
          :roll="roll"
          :is-new="false"
          :show-actions="true"
          :can-reroll="true"
          :size="'sm'"
          @reroll="rerollFromHistory(roll)"
        />
      </div>
    </div>

    <!-- Validation Error -->
    <div v-if="validationError" class="mt-4 p-3 bg-red-900 border border-red-600 rounded">
      <p class="text-red-200 text-sm">{{ validationError }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  rollDice as rollDiceUtil,
  rollAdvanced,
  parseDiceNotation,
  getRollHistory,
  clearRollHistory
} from '@/utils/dice'
import type { DiceRoll, RollLog } from '@/types/dice'
import RollResult from './RollResult.vue'

// State
const diceNotation = ref('1d20')
const currentRoll = ref<DiceRoll | null>(null)
const isRolling = ref(false)
const validationError = ref('')
const rollHistory = ref<RollLog[]>([])

// Roll options
const rollOptions = ref({
  advantage: false,
  disadvantage: false,
  exploding: false,
  rerollOnes: false,
  dropLowest: false,
  dropHighest: false
})

// Quick dice options
const quickDiceOptions = [
  '1d4', '1d6', '1d8', '1d10', '1d12', '1d20', '1d100',
  '2d6', '3d6', '4d6', '2d8', '1d6+1', '1d20+5', '1d8-1'
]

// Computed
const isValidNotation = computed(() => {
  if (!diceNotation.value.trim()) return false
  const validation = parseDiceNotation(diceNotation.value)
  validationError.value = validation.isValid ? '' : validation.error || ''
  return validation.isValid
})

// Watch for advantage/disadvantage conflict
watch([() => rollOptions.value.advantage, () => rollOptions.value.disadvantage], () => {
  if (rollOptions.value.advantage && rollOptions.value.disadvantage) {
    rollOptions.value.disadvantage = false
  }
})

// Methods
const setQuickDice = (notation: string) => {
  diceNotation.value = notation
  validationError.value = ''
}

const rollDice = async () => {
  if (!isValidNotation.value) return

  isRolling.value = true

  try {
    // Add a small delay for animation effect
    await new Promise(resolve => setTimeout(resolve, 300))

    const hasAdvancedOptions = Object.values(rollOptions.value).some(option => option)

    if (hasAdvancedOptions) {
      currentRoll.value = rollAdvanced(diceNotation.value, {
        advantage: rollOptions.value.advantage,
        disadvantage: rollOptions.value.disadvantage,
        exploding: rollOptions.value.exploding,
        rerollOnes: rollOptions.value.rerollOnes,
        dropLowest: rollOptions.value.dropLowest,
        dropHighest: rollOptions.value.dropHighest,
        context: 'Manual roll'
      })
    } else {
      currentRoll.value = rollDiceUtil({
        notation: diceNotation.value,
        context: 'Manual roll',
        advantage: rollOptions.value.advantage,
        disadvantage: rollOptions.value.disadvantage
      })
    }

    // Update history
    updateHistory()
  } catch (error) {
    console.error('[DICE ROLLER] Error rolling dice:', error)
    validationError.value = error instanceof Error ? error.message : 'Erro desconhecido'
  } finally {
    isRolling.value = false
  }
}

const reroll = () => {
  if (currentRoll.value) {
    rollDice()
  }
}

const rerollFromHistory = (roll: RollLog) => {
  diceNotation.value = roll.notation
  rollDice()
}

const updateHistory = () => {
  rollHistory.value = getRollHistory(20)
}

const clearHistory = () => {
  clearRollHistory()
  rollHistory.value = []
}

// Initialize history
updateHistory()
</script>

<style scoped>
/* Tailwind classes applied directly in template */
</style>
