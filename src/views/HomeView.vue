<template>
  <div class="space-y-8">
    <!-- Hero Section -->
    <div class="text-center bg-gradient-to-r from-guild-800 to-guild-900 rounded-lg p-8 mb-8">
      <h1 class="text-4xl font-medieval font-bold text-gold-400 mb-4 flex items-center justify-center gap-3">
        <SparklesIcon class="w-10 h-10 text-gold-400" />
        Gerador de Guildas
      </h1>
      <p class="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
        Sistema completo para geração procedural de guildas de aventureiros para RPG de mesa.
        Baseado nas regras e tabelas tradicionais de guildas medievais.
      </p>
    </div>

    <!-- Quick Start Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div v-for="feature in features" :key="feature.title"
        class="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors cursor-pointer"
        @click="navigateTo(feature.path)">
        <div class="flex items-center justify-center w-12 h-12 bg-amber-600 rounded-lg mb-4">
          <component :is="feature.icon" class="w-6 h-6 text-white" />
        </div>
        <h3 class="text-lg font-semibold text-white mb-2">{{ feature.title }}</h3>
        <p class="text-gray-400">{{ feature.description }}</p>
      </div>
    </div>

    <!-- Getting Started -->
    <div class="bg-guild-800 rounded-lg p-8">
      <h2 class="text-2xl font-semibold text-white mb-4">Como Começar</h2>
      <div class="space-y-4 text-gray-300">
        <div class="flex items-start space-x-3">
          <span
            class="bg-guild-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">1</span>
          <div>
            <h3 class="font-semibold text-white">Gere sua Guilda</h3>
            <p>Comece criando a estrutura básica da sua guilda, incluindo tamanho, recursos e relações.</p>
          </div>
        </div>
        <div class="flex items-start space-x-3">
          <span
            class="bg-guild-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">2</span>
          <div>
            <h3 class="font-semibold text-white">Explore Contratos e Serviços</h3>
            <p>Descubra os contratos disponíveis e serviços que sua guilda pode oferecer.</p>
          </div>
        </div>
        <div class="flex items-start space-x-3">
          <span
            class="bg-guild-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5">3</span>
          <div>
            <h3 class="font-semibold text-white">Gerencie Membros e Renome</h3>
            <p>Contrate aventureiros e acompanhe a progressão do seu renome na guilda.</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import {
  SparklesIcon,
  HomeIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  TrophyIcon
} from '@heroicons/vue/24/solid'

const router = useRouter()

const features = [
  {
    title: 'Estrutura da Guilda',
    description: 'Gere a sede, recursos, relações e funcionários da sua guilda.',
    icon: HomeIcon,
    path: '/guild'
  },
  {
    title: 'Contratos',
    description: 'Contratos disponíveis com valores dinâmicos e modificadores.',
    icon: DocumentTextIcon,
    path: '/contracts'
  },
  {
    title: 'Serviços',
    description: 'Serviços especializados com pagamentos alternativos.',
    icon: WrenchScrewdriverIcon,
    path: '/services'
  },
  {
    title: 'Membros',
    description: 'Contrate aventureiros de diferentes níveis e especialidades.',
    icon: UserGroupIcon,
    path: '/members'
  },
  {
    title: 'Mural de Avisos',
    description: 'Avisos, execuções, procurados e oportunidades comerciais.',
    icon: ClipboardDocumentListIcon,
    path: '/notices'
  },
  {
    title: 'Sistema de Renome',
    description: 'Acompanhe sua progressão e benefícios na guilda.',
    icon: TrophyIcon,
    path: '/renown'
  }
]

const navigateTo = (path: string) => {
  router.push(path)
}
</script>
