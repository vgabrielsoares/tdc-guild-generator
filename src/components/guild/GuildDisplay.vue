<template>
  <div class="guild-display">
    <div v-if="guildStore.isGenerating" class="loading">
      <div class="flex items-center justify-center space-x-2">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        <span class="text-gray-300">Gerando guilda...</span>
      </div>
    </div>

    <div v-else-if="guild" class="guild-content">
      <!-- Header da Guilda -->
      <div class="guild-header bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-700">
        <div class="flex items-center justify-between mb-4">
          <h1 class="text-3xl font-bold text-amber-400">{{ guild.name }}</h1>
          <div class="flex space-x-2">
            <button
              @click="regenerateGuild"
              class="btn btn-secondary flex items-center space-x-2"
              :disabled="guildStore.isGenerating"
            >
              <font-awesome-icon :icon="['fas', 'sync-alt']" />
              <span>Regenerar</span>
            </button>
            <button
              @click="exportGuild"
              class="btn btn-primary flex items-center space-x-2"
            >
              <font-awesome-icon :icon="['fas', 'download']" />
              <span>Exportar</span>
            </button>
          </div>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div class="bg-gray-700 rounded-lg p-3">
            <div class="font-semibold text-gray-300">Tipo de Assentamento</div>
            <div class="text-amber-400">{{ guild.settlementType }}</div>
          </div>
          <div class="bg-gray-700 rounded-lg p-3">
            <div class="font-semibold text-gray-300">Tamanho</div>
            <div class="text-white">{{ guild.structure.size }}</div>
          </div>
          <div class="bg-gray-700 rounded-lg p-3">
            <div class="font-semibold text-gray-300">Recursos</div>
            <div class="text-green-400">{{ guild.resources.level }}</div>
          </div>
        </div>
      </div>

      <!-- Componentes de Estrutura e Relações -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GuildStructure :guild="guild" @regenerate-structure="regenerateStructure" />
        <GuildRelations :guild="guild" @regenerate-relations="regenerateRelations" />
      </div>

      <!-- Ações Rápidas -->
      <div class="mt-6 bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
        <h3 class="text-lg font-semibold text-amber-400 mb-4">Ações Rápidas</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            @click="regenerateStructure"
            class="btn btn-outline flex items-center justify-center space-x-2"
            :disabled="guildStore.isGenerating"
          >
            <font-awesome-icon :icon="['fas', 'building']" />
            <span>Regenerar Estrutura</span>
          </button>
          <button
            @click="regenerateRelations"
            class="btn btn-outline flex items-center justify-center space-x-2"
            :disabled="guildStore.isGenerating"
          >
            <font-awesome-icon :icon="['fas', 'users']" />
            <span>Regenerar Relações</span>
          </button>
          <button
            @click="saveToHistory"
            class="btn btn-outline flex items-center justify-center space-x-2"
            :disabled="!guild || guildStore.isGenerating"
          >
            <font-awesome-icon :icon="['fas', 'save']" />
            <span>Salvar no Histórico</span>
          </button>
          <button
            @click="clearGuild"
            class="btn btn-outline-danger flex items-center justify-center space-x-2"
            :disabled="guildStore.isGenerating"
          >
            <font-awesome-icon :icon="['fas', 'trash']" />
            <span>Limpar</span>
          </button>
        </div>
      </div>

      <!-- Estatísticas do Histórico -->
      <div v-if="guildStore.historyStats.total > 0" class="mt-6 bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
        <h3 class="text-lg font-semibold text-amber-400 mb-4">Estatísticas do Histórico</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div class="bg-blue-900 rounded-lg p-3 border border-blue-700">
            <div class="font-semibold text-blue-300">Total de Guildas</div>
            <div class="text-2xl font-bold text-blue-100">{{ guildStore.historyStats.total }}</div>
          </div>
          <div class="bg-green-900 rounded-lg p-3 border border-green-700">
            <div class="font-semibold text-green-300">Tipo Mais Comum</div>
            <div class="text-green-100">{{ mostCommonSettlement || 'N/A' }}</div>
          </div>
          <div class="bg-purple-900 rounded-lg p-3 border border-purple-700">
            <div class="font-semibold text-purple-300">Recursos Médios</div>
            <div class="text-purple-100">{{ averageResources || 'N/A' }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="text-center py-12 bg-gray-800 rounded-lg shadow-md border border-gray-700">
        <font-awesome-icon :icon="['fas', 'castle']" class="text-6xl text-gray-500 mb-4" />
        <h2 class="text-2xl font-semibold text-gray-300 mb-2">Nenhuma guilda gerada</h2>
        <p class="text-gray-400 mb-6">Configure o tipo de assentamento e gere uma nova guilda</p>
        
        <!-- Seletor de Tipo de Assentamento -->
        <div class="mb-6 max-w-sm mx-auto">
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Tipo de Assentamento
          </label>
          <select 
            v-model="selectedSettlementType" 
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="random">Aleatório</option>
            <option v-for="type in settlementTypes" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </div>
        
        <button
          @click="generateNewGuild"
          class="btn btn-primary text-lg px-8 py-3"
          :disabled="guildStore.isGenerating"
        >
          <font-awesome-icon :icon="['fas', 'plus']" class="mr-2" />
          Gerar Nova Guilda
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useGuildStore } from '@/stores/guild'
import { SettlementType } from '@/types/guild'
import GuildStructure from './GuildStructure.vue'
import GuildRelations from './GuildRelations.vue'

const guildStore = useGuildStore()

const guild = computed(() => guildStore.currentGuild)

// Seletor de tipo de assentamento
const selectedSettlementType = ref<SettlementType | 'random'>('random')
const settlementTypes = Object.values(SettlementType)

const mostCommonSettlement = computed(() => {
  const stats = guildStore.historyStats.bySettlement
  const settlements = Object.entries(stats)
  if (settlements.length === 0) return 'N/A'
  
  const [mostCommon] = settlements.reduce((a, b) => a[1] > b[1] ? a : b)
  return mostCommon
})

const averageResources = computed(() => {
  const stats = guildStore.historyStats.byResourceLevel
  const levels = Object.entries(stats)
  if (levels.length === 0) return 'N/A'
  
  const [mostCommon] = levels.reduce((a, b) => a[1] > b[1] ? a : b)
  return mostCommon
})

const generateNewGuild = () => {
  if (selectedSettlementType.value === 'random') {
    guildStore.generateGuildWithDefaults()
  } else {
    guildStore.generateGuild({
      settlementType: selectedSettlementType.value as SettlementType,
      saveToHistory: true
    })
  }
}

const regenerateGuild = () => {
  guildStore.regenerateCurrentGuild()
}

const regenerateStructure = () => {
  guildStore.regenerateStructure()
}

const regenerateRelations = () => {
  guildStore.regenerateRelations()
}

const saveToHistory = () => {
  if (guild.value) {
    // A guilda já é automaticamente adicionada ao histórico na geração
    // Aqui poderíamos implementar alguma lógica adicional se necessário
  }
}

const clearGuild = () => {
  guildStore.clearCurrentGuild()
}

const exportGuild = () => {
  const guildData = guildStore.exportCurrentGuild()
  if (guildData) {
    const blob = new Blob([guildData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `guilda-${guild.value?.name?.replace(/\s+/g, '-').toLowerCase() || 'export'}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}
</script>

<style scoped>
.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.btn-secondary {
  @apply bg-gray-600 text-white hover:bg-gray-700;
}

.btn-outline {
  @apply border border-gray-500 text-gray-300 hover:bg-gray-700;
}

.btn-outline-danger {
  @apply border border-red-500 text-red-400 hover:bg-red-900;
}

.loading {
  @apply flex items-center justify-center py-12;
}

.guild-display {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6;
}

.guild-content {
  @apply space-y-6;
}

.empty-state {
  @apply bg-gray-800 rounded-lg shadow-md border border-gray-700;
}
</style>
