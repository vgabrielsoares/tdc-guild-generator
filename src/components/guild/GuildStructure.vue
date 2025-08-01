<template>
  <div class="guild-structure bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-amber-400 flex items-center space-x-2">
        <BuildingOffice2Icon class="w-5 h-5 text-amber-400" />
        <span>Estrutura</span>
        <Tooltip
          content="A estrutura física define o tamanho, características e capacidades da sede da Guilda no assentamento."
          title="Estrutura da Sede">
          <InfoButton help-key="guild-structure" @open-help="$emit('open-help', 'guild-structure')" />
        </Tooltip>
      </h3>
      <Tooltip
        content="Regenera apenas a estrutura física (tamanho, características, funcionários) mantendo as relações."
        title="Regenerar Estrutura">
        <button @click="$emit('regenerate-structure')" class="btn btn-sm btn-outline flex items-center space-x-1"
          title="Regenerar estrutura">
          <ArrowPathIcon class="w-4 h-4" />
          <span class="text-xs">Regenerar</span>
        </button>
      </Tooltip>
    </div>

    <div class="space-y-4">
      <!-- Tamanho da Guilda -->
      <div class="bg-gray-700 rounded-lg p-4 border border-gray-600">
        <h4 class="font-semibold text-gray-300 mb-2 flex items-center space-x-2">
          <Square3Stack3DIcon class="w-4 h-4 text-gray-400" />
          <span>Tamanho</span>
          <Tooltip
            content="Determina a capacidade física da sede. Sedes maiores podem acomodar mais aventureiros e atividades simultâneas."
            title="Tamanho da Sede">
            <InfoButton help-key="guild-structure" @open-help="$emit('open-help', 'guild-structure')"
              button-class="text-xs" />
          </Tooltip>
        </h4>
        <p class="text-white font-medium">{{ guild.structure.size }}</p>
      </div>

      <!-- Sede Matriz (se for) -->
      <div v-if="guild.structure.isHeadquarters" class="bg-amber-900 rounded-lg p-4 border border-amber-700">
        <h4 class="font-semibold text-amber-300 mb-2 flex items-center space-x-2">
          <StarIcon class="w-4 h-4 text-amber-400" />
          <span>Sede Matriz</span>
          <Tooltip
            content="Sede especial que recebe +5 em todas as rolagens. Centro regional de operações com recursos e autoridade superiores."
            title="Sede Matriz">
            <InfoButton help-key="guild-structure" @open-help="$emit('open-help', 'guild-structure')"
              button-class="text-xs" />
          </Tooltip>
        </h4>
        <p class="text-amber-100 font-medium">
          Esta é uma Sede Matriz, com recursos e influência superiores às sedes comuns.
        </p>
        <p class="text-amber-200 text-sm mt-1">
          (+5 em todas as rolagens de estrutura)
        </p>
      </div>

      <!-- Características -->
      <div class="bg-gray-700 rounded-lg p-4 border border-gray-600">
        <h4 class="font-semibold text-gray-300 mb-2 flex items-center space-x-2">
          <ListBulletIcon class="w-4 h-4 text-gray-400" />
          <span>Características</span>
          <Tooltip
            content="Aspectos únicos da sede que influenciam sua atmosfera e funcionalidade. Use como ganchos narrativos."
            title="Características da Sede">
            <InfoButton help-key="guild-structure" @open-help="$emit('open-help', 'guild-structure')"
              button-class="text-xs" />
          </Tooltip>
        </h4>
        <ul class="space-y-1">
          <li v-for="(characteristic, index) in guild.structure.characteristics" :key="index"
            class="text-gray-200 flex items-start space-x-2">
            <span class="text-blue-400 mt-1">•</span>
            <span>{{ characteristic }}</span>
          </li>
        </ul>
      </div>

      <!-- Localização (se houver) -->
      <div v-if="guild.structure.location" class="bg-gray-700 rounded-lg p-4 border border-gray-600">
        <h4 class="font-semibold text-gray-300 mb-2 flex items-center space-x-2">
          <MapPinIcon class="w-4 h-4 text-gray-400" />
          <span>Localização</span>
        </h4>
        <p class="text-gray-200">{{ guild.structure.location }}</p>
      </div>

      <!-- Descrição (se houver) -->
      <div v-if="guild.structure.description" class="bg-gray-700 rounded-lg p-4 border border-gray-600">
        <h4 class="font-semibold text-gray-300 mb-2 flex items-center space-x-2">
          <DocumentTextIcon class="w-4 h-4 text-gray-400" />
          <span>Descrição</span>
        </h4>
        <p class="text-gray-200">{{ guild.structure.description }}</p>
      </div>

      <!-- Funcionários -->
      <div class="bg-gray-700 rounded-lg p-4 border border-gray-600">
        <h4 class="font-semibold text-gray-300 mb-2 flex items-center space-x-2">
          <UserGroupIcon class="w-4 h-4 text-gray-400" />
          <span>Funcionários</span>
          <Tooltip
            content="Equipe que mantém a sede funcionando. Funcionários experientes atraem mais visitantes, enquanto despreparados podem causar problemas."
            title="Funcionários da Sede">
            <InfoButton help-key="guild-staff" @open-help="$emit('open-help', 'guild-staff')" button-class="text-xs" />
          </Tooltip>
        </h4>
        <p class="text-white font-medium">{{ guild.staff.employees }}</p>
        <p v-if="guild.staff.description" class="text-gray-300 text-sm mt-1">{{ guild.staff.description }}</p>

        <!-- Dica especial sobre dragões -->
        <div v-if="guild.staff.employees.includes('dragão') || guild.staff.description?.includes('dragão')"
          class="mt-2 text-xs text-amber-300 bg-amber-900 bg-opacity-30 rounded p-2 border border-amber-700">
          <span class="font-semibold">Easter Egg:</span> Um dragão disfarçado trabalha na sede!
          Isso acontece quando todas as rolagens de estrutura resultam em 23.
        </div>
      </div>

      <!-- Informações do Assentamento -->
      <div class="bg-blue-900 rounded-lg p-4 border border-blue-700">
        <h4 class="font-semibold text-blue-300 mb-2 flex items-center space-x-2">
          <BuildingOfficeIcon class="w-4 h-4 text-blue-400" />
          <span>Assentamento</span>
          <Tooltip
            content="Tipo de comunidade onde a sede está localizada. Determina o tamanho dos dados usados na geração - cidades maiores têm sedes melhores."
            title="Tipo de Assentamento">
            <InfoButton help-key="settlement-types" @open-help="$emit('open-help', 'settlement-types')"
              button-class="text-xs" />
          </Tooltip>
        </h4>
        <p class="text-blue-100 font-medium">{{ guild.settlementType }}</p>

        <!-- Informação sobre dados -->
        <div class="mt-2 text-xs text-blue-200">
          <span class="font-medium">Dados usados:</span>
          <span
            v-if="guild.settlementType.includes('Lugarejo') || guild.settlementType.includes('Povoado') || guild.settlementType.includes('Aldeia')">
            1d8 (resultados 1-8)
          </span>
          <span v-else-if="guild.settlementType.includes('Vilarejo') || guild.settlementType.includes('Vila')">
            1d12 (resultados 1-12)
          </span>
          <span v-else-if="guild.settlementType.includes('Cidadela')">
            1d20 (resultados 1-20)
          </span>
          <span v-else-if="guild.settlementType.includes('Cidade Grande')">
            1d20+4 (resultados 5-24)
          </span>
          <span v-else-if="guild.settlementType.includes('Metrópole')">
            1d20+8 (resultados 9-28)
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  BuildingOffice2Icon,
  ArrowPathIcon,
  Square3Stack3DIcon,
  ListBulletIcon,
  MapPinIcon,
  DocumentTextIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  StarIcon
} from '@heroicons/vue/24/solid'
import type { Guild } from '@/types/guild'
import Tooltip from '@/components/common/Tooltip.vue'
import InfoButton from '@/components/common/InfoButton.vue'

defineProps<{
  guild: Guild
}>()

defineEmits<{
  'regenerate-structure': []
  'open-help': [helpKey: string]
}>()
</script>

<style scoped>
.btn {
  @apply px-2 py-1 rounded font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-sm {
  @apply px-2 py-1 text-sm;
}

.btn-outline {
  @apply border border-gray-500 text-gray-400 hover:bg-gray-700;
}
</style>
