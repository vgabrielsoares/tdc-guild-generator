<template>
  <div class="space-y-8">
    <div class="text-center">
      <h1 class="text-3xl font-medieval font-bold text-gold-400 mb-4 flex items-center justify-center gap-3">
        <font-awesome-icon icon="home" class="text-gold-400" />
        Estrutura da Guilda
      </h1>
      <p class="text-lg text-gray-300 mb-8">
        Gere e visualize a estrutura completa da sua guilda.
      </p>
    </div>

    <div class="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h2 class="text-xl font-semibold text-amber-400 mb-4 flex items-center gap-2">
        <font-awesome-icon icon="flask" />
        Store Testing (Issue 1.4)
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div class="bg-gray-700 p-4 rounded">
          <h3 class="text-sm font-medium text-gray-300 mb-2">Estado</h3>
          <p class="text-lg font-bold text-white">
            {{ guildStore.hasCurrentGuild ? 'Com Guilda' : 'Sem Guilda' }}
          </p>
        </div>

        <div class="bg-gray-700 p-4 rounded">
          <h3 class="text-sm font-medium text-gray-300 mb-2">Total</h3>
          <p class="text-lg font-bold text-white">
            {{ guildStore.guildCount }} guildas
          </p>
        </div>

        <div class="bg-gray-700 p-4 rounded">
          <h3 class="text-sm font-medium text-gray-300 mb-2">Status</h3>
          <p class="text-lg font-bold text-white">
            {{ guildStore.isGenerating ? 'Gerando...' : 'Pronto' }}
          </p>
        </div>
      </div>

      <div class="flex gap-4 mb-6">
        <button @click="generateGuild" :disabled="guildStore.isGenerating"
          class="bg-amber-600 hover:bg-amber-700 disabled:bg-gray-600 text-white px-4 py-2 rounded font-medium transition-colors flex items-center gap-2">
          <font-awesome-icon icon="home" v-if="!guildStore.isGenerating" />
          {{ guildStore.isGenerating ? 'Gerando...' : 'Gerar Guilda' }}
        </button>

        <button @click="clearGuilds" :disabled="guildStore.isGenerating || guildStore.guildCount === 0"
          class="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-4 py-2 rounded font-medium transition-colors flex items-center gap-2">
          <font-awesome-icon icon="trash" />
          Limpar Tudo
        </button>
      </div>

      <div v-if="guildStore.currentGuild" class="bg-gray-700 p-4 rounded mb-4">
        <h3 class="text-lg font-semibold text-amber-400 mb-2">Guilda Atual:</h3>
        <p class="text-white">{{ guildStore.currentGuild.name }}</p>
        <p class="text-gray-300 text-sm">ID: {{ guildStore.currentGuild.id }}</p>
        <p class="text-gray-300 text-sm">Criada: {{ formatDate(guildStore.currentGuild.createdAt) }}</p>
      </div>

      <div v-if="guildStore.recentGuilds && guildStore.recentGuilds.length > 0">
        <h3 class="text-lg font-semibold text-amber-400 mb-2">Guildas Recentes:</h3>
        <div class="space-y-2">
          <div v-for="guild in guildStore.recentGuilds" :key="guild.id"
            class="flex justify-between items-center bg-gray-700 p-3 rounded cursor-pointer hover:bg-gray-600 transition-colors"
            @click="selectGuild(guild)">
            <div>
              <p class="text-white font-medium">{{ guild.name }}</p>
              <p class="text-gray-300 text-sm">{{ formatDate(guild.createdAt) }}</p>
            </div>
            <button @click.stop="removeGuild(guild.id)" class="text-red-400 hover:text-red-300 transition-colors">
              <font-awesome-icon icon="trash" />
            </button>
          </div>
        </div>
      </div>
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

import { useGuildStore } from '@/stores/guild'
import type { Guild } from '@/types/guild'

// Initialize store
const guildStore = useGuildStore()

const generateGuild = async () => {
  await guildStore.generateGuildWithDefaults()
}

const clearGuilds = () => {
  guildStore.clearAll()
}

const selectGuild = (guild: Guild) => {
  guildStore.setCurrentGuild(guild)
}

const removeGuild = (guildId: string) => {
  guildStore.removeGuild(guildId)
}

const formatDate = (date: Date | string | undefined) => {
  if (!date) return 'Data não disponível'
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj)
}

console.log('[GUILD VIEW] Guild View loaded with store testing')
</script>
