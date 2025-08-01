<template>
  <div class="guild-relations bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-amber-400 flex items-center space-x-2">
        <UsersIcon class="w-5 h-5 text-amber-400" />
        <span>Relações e Recursos</span>
        <Tooltip
          content="As relações determinam como a Guilda é vista localmente e afetam diretamente os recursos disponíveis."
          title="Relações da Guilda">
          <InfoButton help-key="guild-relations" @open-help="$emit('open-help', 'guild-relations')" />
        </Tooltip>
      </h3>
      <Tooltip
        content="Regenera as relações com governo e população, além de recalcular recursos baseado nas novas relações."
        title="Regenerar Relações">
        <button @click="$emit('regenerate-relations')" class="btn btn-sm btn-outline flex items-center space-x-1"
          title="Regenerar relações">
          <ArrowPathIcon class="w-4 h-4" />
          <span class="text-xs">Regenerar</span>
        </button>
      </Tooltip>
    </div>

    <div class="space-y-4">
      <!-- Relações com o Governo Local -->
      <div class="bg-gray-700 rounded-lg p-4 border border-gray-600">
        <h4 class="font-semibold text-gray-300 mb-2 flex items-center space-x-2">
          <BuildingLibraryIcon class="w-4 h-4 text-gray-400" />
          <span>Relação com o Governo Local</span>
          <Tooltip
            content="Determina se autoridades locais apoiam, toleram ou hostilizam a Guilda. Afeta tipos de contratos e recursos."
            title="Relação Governamental">
            <InfoButton help-key="guild-relations" @open-help="$emit('open-help', 'guild-relations')"
              button-class="text-xs" />
          </Tooltip>
        </h4>
        <div class="flex items-center space-x-2">
          <span class="inline-block w-3 h-3 rounded-full"
            :class="getRelationCircleColor(guild.relations.government)"></span>
          <span class="text-white font-medium">{{ guild.relations.government }}</span>
        </div>
        <div v-if="guild.relations.governmentDescription" class="mt-2">
          <p class="text-gray-300 text-sm italic">{{ guild.relations.governmentDescription }}</p>
        </div>

        <!-- Modificador de Recursos -->
        <div class="mt-2 text-xs text-blue-200">
          <span class="font-medium">Modificador de recursos: </span>
          <span :class="getModifierColor(getRelationModifier(guild.relations.government))">
            {{ getModifierText(getRelationModifier(guild.relations.government)) }}
          </span>
        </div>
      </div>

      <!-- Reputação com a População Local -->
      <div class="bg-gray-700 rounded-lg p-4 border border-gray-600">
        <h4 class="font-semibold text-gray-300 mb-2 flex items-center space-x-2">
          <UserGroupIcon class="w-4 h-4 text-gray-400" />
          <span>Reputação com a População Local</span>
          <Tooltip content="Como cidadãos comuns veem a Guilda. Afeta cooperação, informações disponíveis e recursos."
            title="Reputação Popular">
            <InfoButton help-key="guild-relations" @open-help="$emit('open-help', 'guild-relations')"
              button-class="text-xs" />
          </Tooltip>
        </h4>
        <div class="flex items-center space-x-2">
          <span class="inline-block w-3 h-3 rounded-full"
            :class="getRelationCircleColor(guild.relations.population)"></span>
          <span class="text-white font-medium">{{ guild.relations.population }}</span>
        </div>
        <div v-if="guild.relations.populationDescription" class="mt-2">
          <p class="text-gray-300 text-sm italic">{{ guild.relations.populationDescription }}</p>
        </div>

        <!-- Modificador de Recursos -->
        <div class="mt-2 text-xs text-blue-200">
          <span class="font-medium">Modificador de recursos: </span>
          <span :class="getModifierColor(getRelationModifier(guild.relations.population))">
            {{ getModifierText(getRelationModifier(guild.relations.population)) }}
          </span>
        </div>
      </div>

      <!-- Recursos -->
      <div class="bg-gray-700 rounded-lg p-4 border border-gray-600">
        <h4 class="font-semibold text-gray-300 mb-2 flex items-center space-x-2">
          <CurrencyDollarIcon class="w-4 h-4 text-gray-400" />
          <span>Nível de Recursos</span>
          <Tooltip
            content="Recursos são afetados pelas relações com governo e população. Modificadores são somados para determinar o nível final."
            title="Sistema de Recursos">
            <InfoButton help-key="guild-resources" @open-help="$emit('open-help', 'guild-resources')"
              button-class="text-xs" />
          </Tooltip>
        </h4>
        <div class="flex items-center space-x-2">
          <span class="inline-block w-3 h-3 rounded-full" :class="getResourceCircleColor(guild.resources.level)"></span>
          <span class="text-white font-medium">{{ guild.resources.level }}</span>
        </div>

        <!-- Cálculo dos modificadores -->
        <div class="mt-3 p-3 bg-gray-600 rounded border border-gray-500">
          <div class="text-xs text-gray-300 mb-2 font-medium">Modificadores aplicados:</div>
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div class="flex justify-between">
              <span class="text-gray-400">Governo:</span>
              <span :class="getModifierColor(getRelationModifier(guild.relations.government))">
                {{ getModifierText(getRelationModifier(guild.relations.government)) }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-400">População:</span>
              <span :class="getModifierColor(getRelationModifier(guild.relations.population))">
                {{ getModifierText(getRelationModifier(guild.relations.population)) }}
              </span>
            </div>
          </div>
          <div class="border-t border-gray-500 mt-2 pt-2 text-xs">
            <div class="flex justify-between font-medium">
              <span class="text-gray-300">Total:</span>
              <span
                :class="getModifierColor(getRelationModifier(guild.relations.government) + getRelationModifier(guild.relations.population))">
                {{ getModifierText(getRelationModifier(guild.relations.government) +
                getRelationModifier(guild.relations.population)) }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="guild.resources.details && guild.resources.details.length > 0" class="mt-2">
          <p class="text-gray-300 text-sm mb-1">Especialidades:</p>
          <div class="flex flex-wrap gap-1">
            <span v-for="(detail, index) in guild.resources.details" :key="index"
              class="inline-block px-2 py-1 bg-green-800 text-green-200 text-xs rounded-full border border-green-600">
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

      <!-- Frequentadores -->
      <div class="bg-gray-700 rounded-lg p-4 border border-gray-600">
        <div class="flex items-center justify-between mb-2">
          <h4 class="font-semibold text-gray-300 flex items-center space-x-2">
            <ArrowRightOnRectangleIcon class="w-4 h-4 text-gray-400" />
            <span>Frequentadores</span>
            <Tooltip
              content="Movimento na sede é afetado pelos recursos disponíveis e competência dos funcionários. Indica popularidade e atividade."
              title="Frequentadores da Sede">
              <InfoButton help-key="guild-visitors" @open-help="$emit('open-help', 'guild-visitors')"
                button-class="text-xs" />
            </Tooltip>
          </h4>
          <button @click="$emit('regenerate-visitors')" class="btn btn-sm btn-outline flex items-center space-x-1"
            title="Regenerar frequentadores">
            <ArrowPathIcon class="w-3 h-3" />
            <span class="text-xs">Regenerar</span>
          </button>
        </div>
        <div class="flex items-center space-x-2">
          <span class="inline-block w-3 h-3 rounded-full"
            :class="getVisitorFrequencyCircleColor(guild.visitors.frequency)"></span>
          <span class="text-white font-medium">{{ guild.visitors.frequency }}</span>
        </div>
        <div v-if="guild.visitors.types && guild.visitors.types.length > 0" class="mt-2">
          <p class="text-gray-300 text-sm mb-1">Tipos de visitantes:</p>
          <div class="flex flex-wrap gap-1">
            <span v-for="(type, index) in guild.visitors.types" :key="index"
              class="inline-block px-2 py-1 text-xs rounded-full font-medium bg-gray-600 text-gray-100 border border-gray-500">
              {{ type }}
            </span>
          </div>
        </div>
        <p v-if="guild.visitors.description" class="text-gray-300 text-sm mt-2">{{ guild.visitors.description }}</p>
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
import { getRelationCircleColor, getResourceCircleColor, getVisitorFrequencyCircleColor } from '@/utils/colorHelpers'
import Tooltip from '@/components/common/Tooltip.vue'
import InfoButton from '@/components/common/InfoButton.vue'

defineProps<{
  guild: Guild
}>()

defineEmits<{
  'regenerate-relations': []
  'regenerate-visitors': []
  'open-help': [helpKey: string]
}>()

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

// Funções para modificadores de relações
const getRelationModifier = (relation: string): number => {
  const relationMap: Record<string, number> = {
    'Péssima': -3,
    'Péssima, puro ódio': -3,
    'Ruim': -2,
    'Ruim, mas tentam manter a cordialidade': -2,
    'Ruim, vistos como mercenários': -2,
    'Ruim, só causam problemas': -2,
    'Diplomática': -1,
    'Opinião dividida': -1,
    'Boa': 1,
    'Boa, mas o governo tenta miná-los secretamente': 1,
    'Boa, ajudam com problemas': 1,
    'Boa, "nos mantêm seguros"': 1,
    'Muito boa': 2,
    'Muito boa, cooperam frequentemente': 2,
    'Muito boa, "sem eles estaríamos perdidos"': 2,
    'Excelente': 3,
    'Excelente, governo e guilda são quase como um': 3,
    'Excelente, a guilda faz o assentamento funcionar': 3
  }
  
  return relationMap[relation] || 0
}

const getModifierText = (modifier: number): string => {
  if (modifier > 0) return `+${modifier}`
  if (modifier < 0) return `${modifier}`
  return '0'
}

const getModifierColor = (modifier: number): string => {
  if (modifier > 0) return 'text-green-400'
  if (modifier < 0) return 'text-red-400'
  return 'text-gray-400'
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
