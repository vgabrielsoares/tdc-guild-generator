<template>
  <div class="guild-structure bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-amber-400 flex items-center space-x-2">
        <BuildingOffice2Icon class="w-5 h-5 text-amber-400" />
        <span>Estrutura</span>
      </h3>
      <button
        @click="$emit('regenerate-structure')"
        class="btn btn-sm btn-outline flex items-center space-x-1"
        title="Regenerar estrutura"
      >
        <ArrowPathIcon class="w-4 h-4" />
        <span class="text-xs">Regenerar</span>
      </button>
    </div>

    <div class="space-y-4">
      <!-- Tamanho da Guilda -->
      <div class="bg-gray-700 rounded-lg p-4 border border-gray-600">
        <h4 class="font-semibold text-gray-300 mb-2 flex items-center space-x-2">
          <Square3Stack3DIcon class="w-4 h-4 text-gray-400" />
          <span>Tamanho</span>
        </h4>
        <p class="text-white font-medium">{{ guild.structure.size }}</p>
      </div>

      <!-- Características -->
      <div class="bg-gray-700 rounded-lg p-4 border border-gray-600">
        <h4 class="font-semibold text-gray-300 mb-2 flex items-center space-x-2">
          <ListBulletIcon class="w-4 h-4 text-gray-400" />
          <span>Características</span>
        </h4>
        <ul class="space-y-1">
          <li
            v-for="(characteristic, index) in guild.structure.characteristics"
            :key="index"
            class="text-gray-200 flex items-start space-x-2"
          >
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
        </h4>
        <p class="text-white font-medium">{{ guild.staff.employees }}</p>
        <p v-if="guild.staff.description" class="text-gray-300 text-sm mt-1">{{ guild.staff.description }}</p>
      </div>

      <!-- Visitantes -->
      <div class="bg-gray-700 rounded-lg p-4 border border-gray-600">
        <h4 class="font-semibold text-gray-300 mb-2 flex items-center space-x-2">
          <BuildingOfficeIcon class="w-4 h-4 text-blue-400" />
          <span>Frequentadores</span>
        </h4>
        <p class="text-white font-medium">{{ guild.visitors.frequency }}</p>
        <div v-if="guild.visitors.types && guild.visitors.types.length > 0" class="mt-2">
          <p class="text-gray-300 text-sm mb-1">Tipos de visitantes:</p>
          <div class="flex flex-wrap gap-1">
            <span
              v-for="(type, index) in guild.visitors.types"
              :key="index"
              class="inline-block px-2 py-1 bg-blue-800 text-blue-200 text-xs rounded-full border border-blue-600"
            >
              {{ type }}
            </span>
          </div>
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
  BuildingOfficeIcon
} from '@heroicons/vue/24/solid'
import type { Guild } from '@/types/guild'

defineProps<{
  guild: Guild
}>()

defineEmits<{
  'regenerate-structure': []
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
