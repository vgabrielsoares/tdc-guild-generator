<template>
  <div class="guild-relations bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-amber-400 flex items-center space-x-2">
        <UsersIcon class="w-5 h-5 text-amber-400" />
        <span>Relações e Recursos</span>
      </h3>
      <button
        @click="$emit('regenerate-relations')"
        class="btn btn-sm btn-outline flex items-center space-x-1"
        title="Regenerar relações"
      >
        <ArrowPathIcon class="w-4 h-4" />
        <span class="text-xs">Regenerar</span>
      </button>
    </div>

    <div class="space-y-4">
      <!-- Relações com o Governo Local -->
      <div class="bg-gray-700 rounded-lg p-4 border border-gray-600">
        <h4 class="font-semibold text-gray-300 mb-2 flex items-center space-x-2">
          <BuildingLibraryIcon class="w-4 h-4 text-gray-400" />
          <span>Relação com o Governo Local</span>
        </h4>
        <div class="flex items-center space-x-2">
          <span class="inline-block w-3 h-3 rounded-full" :class="getRelationColor(guild.relations.government)"></span>
          <span class="text-white font-medium">{{ guild.relations.government }}</span>
        </div>
        <div v-if="guild.relations.governmentDescription" class="mt-2">
          <p class="text-gray-300 text-sm italic">{{ guild.relations.governmentDescription }}</p>
        </div>
      </div>

      <!-- Reputação com a População Local -->
      <div class="bg-gray-700 rounded-lg p-4 border border-gray-600">
        <h4 class="font-semibold text-gray-300 mb-2 flex items-center space-x-2">
          <UserGroupIcon class="w-4 h-4 text-gray-400" />
          <span>Reputação com a População Local</span>
        </h4>
        <div class="flex items-center space-x-2">
          <span class="inline-block w-3 h-3 rounded-full" :class="getRelationColor(guild.relations.population)"></span>
          <span class="text-white font-medium">{{ guild.relations.population }}</span>
        </div>
        <div v-if="guild.relations.populationDescription" class="mt-2">
          <p class="text-gray-300 text-sm italic">{{ guild.relations.populationDescription }}</p>
        </div>
      </div>

      <!-- Recursos -->
      <div class="bg-gray-700 rounded-lg p-4 border border-gray-600">
        <h4 class="font-semibold text-gray-300 mb-2 flex items-center space-x-2">
          <CurrencyDollarIcon class="w-4 h-4 text-gray-400" />
          <span>Nível de Recursos</span>
        </h4>
        <div class="flex items-center space-x-2">
          <span class="inline-block w-3 h-3 rounded-full" :class="getResourceColor(guild.resources.level)"></span>
          <span class="text-white font-medium">{{ guild.resources.level }}</span>
        </div>
        <div v-if="guild.resources.details && guild.resources.details.length > 0" class="mt-2">
          <p class="text-gray-300 text-sm mb-1">Especialidades:</p>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="(detail, index) in guild.resources.details"
              :key="index"
              class="inline-block px-2 py-1 bg-green-800 text-green-200 text-xs rounded-full border border-green-600"
            >
              {{ detail }}
            </span>
          </div>
        </div>
      </div>

      <!-- Notas (se houver) -->
      <div v-if="guild.relations.notes" class="bg-gray-700 rounded-lg p-4 border border-gray-600">
        <h4 class="font-semibold text-gray-300 mb-2 flex items-center space-x-2">
          <DocumentTextIcon class="w-4 h-4 text-gray-400" />
          <span>Notas Adicionais</span>
        </h4>
        <p class="text-gray-200">{{ guild.relations.notes }}</p>
      </div>

      <!-- Informações do Assentamento -->
      <div class="bg-blue-900 rounded-lg p-4 border border-blue-700">
        <h4 class="font-semibold text-blue-300 mb-2 flex items-center space-x-2">
          <ArrowRightOnRectangleIcon class="w-4 h-4 text-gray-400" />
          <span>Assentamento</span>
        </h4>
        <p class="text-blue-100 font-medium">{{ guild.settlementType }}</p>
      </div>

      <!-- Metadados -->
      <div class="border-t border-gray-600 pt-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-gray-400">
          <div>
            <span class="font-medium">Criado:</span>
            {{ formatDate(guild.createdAt) }}
          </div>
          <div v-if="guild.updatedAt">
            <span class="font-medium">Atualizado:</span>
            {{ formatDate(guild.updatedAt) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  UsersIcon, 
  UserGroupIcon, 
  CurrencyDollarIcon, 
  DocumentTextIcon, 
  ArrowRightOnRectangleIcon,
  ArrowPathIcon,
  BuildingLibraryIcon
} from '@heroicons/vue/24/outline';
import type { Guild } from '@/types/guild'

defineProps<{
  guild: Guild
}>()

defineEmits<{
  'regenerate-relations': []
}>()

const getRelationColor = (relation: string): string => {
  const lowerRelation = relation.toLowerCase()
  
  if (lowerRelation.includes('hostil') || lowerRelation.includes('temida')) {
    return 'bg-red-500'
  } else if (lowerRelation.includes('suspeita') || lowerRelation.includes('desconfiada')) {
    return 'bg-orange-500'
  } else if (lowerRelation.includes('indiferente')) {
    return 'bg-gray-400'
  } else if (lowerRelation.includes('tolerante') || lowerRelation.includes('respeitada')) {
    return 'bg-yellow-500'
  } else if (lowerRelation.includes('cooperativa') || lowerRelation.includes('admirada')) {
    return 'bg-blue-500'
  } else if (lowerRelation.includes('aliada') || lowerRelation.includes('reverenciada')) {
    return 'bg-green-500'
  }
  
  return 'bg-gray-400'
}

const getResourceColor = (level: string): string => {
  const lowerLevel = level.toLowerCase()
  
  if (lowerLevel.includes('escassos')) {
    return 'bg-red-500'
  } else if (lowerLevel.includes('limitados')) {
    return 'bg-orange-500'
  } else if (lowerLevel.includes('básicos')) {
    return 'bg-yellow-500'
  } else if (lowerLevel.includes('adequados')) {
    return 'bg-blue-500'
  } else if (lowerLevel.includes('abundantes')) {
    return 'bg-green-500'
  } else if (lowerLevel.includes('vastos')) {
    return 'bg-purple-500'
  } else if (lowerLevel.includes('lendários')) {
    return 'bg-amber-500'
  }
  
  return 'bg-gray-400'
}

const formatDate = (date: Date | string | number): string => {
  try {
    const dateObj = new Date(date)
    
    // Verifica se a data é válida
    if (isNaN(dateObj.getTime())) {
      return 'Data inválida'
    }
    
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj)
  } catch {
    return 'Data inválida'
  }
}
</script>

<style scoped>
.btn {
  @apply px-2 py-1 rounded font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-sm {
  @apply px-2 py-1 text-sm;
}

.btn-outline {
  @apply border border-gray-600 text-gray-300 bg-transparent hover:bg-gray-700 hover:text-white hover:border-gray-500;
}
</style>
