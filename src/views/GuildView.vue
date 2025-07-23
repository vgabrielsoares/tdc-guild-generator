<template>
  <div class="space-y-8">
    <div class="text-center">
      <h1 class="text-3xl font-medieval font-bold text-gold-400 mb-4 flex items-center justify-center gap-3">
        <HomeIcon class="w-7 h-7 text-gold-400" />
        Estrutura da Guilda
      </h1>
      <p class="text-lg text-gray-300 mb-8">
        Gere e visualize a estrutura completa da sua guilda.
      </p>
    </div>

    <!-- Guilda Atual e Geração -->
    <GuildDisplay />

    <!-- Histórico de Guildas -->
    <GuildHistory />
  </div>
</template>

<script setup lang="ts">
import { HomeIcon } from '@heroicons/vue/24/outline'
import GuildDisplay from '@/components/guild/GuildDisplay.vue'
import GuildHistory from '@/components/guild/GuildHistory.vue'
</script>
