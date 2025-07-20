<template>
  <div class="space-y-8">
    <div class="text-center">
      <h1 class="text-3xl font-medieval font-bold text-gold-400 mb-4">
        🏰 Estrutura da Guilda
      </h1>
      <p class="text-lg text-gray-300 mb-8">
        Gere e visualize a estrutura completa da sua guilda.
      </p>
    </div>

    <!-- Guild Components -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <GuildDisplay />
      <div class="space-y-4">
        <GuildStructure />
        <GuildRelations />
      </div>
    </div>

    <!-- Dice Roller -->
    <DiceRoller />
  </div>
</template>

<script setup lang="ts">
// Import guild components
import GuildDisplay from '@/components/guild/GuildDisplay.vue'
import GuildStructure from '@/components/guild/GuildStructure.vue'
import GuildRelations from '@/components/guild/GuildRelations.vue'
import DiceRoller from '@/components/common/DiceRoller.vue'

// Guild store will be used in future issues
console.log('🏰 Guild View loaded')
</script>
