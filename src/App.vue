<template>
  <div id="app" class="min-h-screen bg-gray-900 text-white">
    <!-- PWA Manager -->
    <PWAManager />

    <!-- Navigation Header -->
    <nav class="bg-guild-800 shadow-lg">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0">
              <h1 class="text-xl font-medieval font-bold text-gold-400 flex items-center gap-2">
                <SparklesIcon class="w-5 h-5 text-gold-400" />
                Gerador de Guildas
              </h1>
            </div>
            <div class="hidden md:block">
              <div class="ml-10 flex items-baseline space-x-4">
                <router-link v-for="item in navigation" :key="item.name" :to="item.href"
                  class="px-3 py-2 rounded-md text-sm font-medium transition-colors" :class="isCurrentRoute(item.href)
                    ? 'bg-guild-900 text-guild-100'
                    : 'text-guild-200 hover:bg-guild-700 hover:text-white'">
                  {{ item.name }}
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="px-4 py-6 sm:px-0">
        <router-view />
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-gray-800 mt-auto">
      <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <p class="text-center text-gray-400 text-sm">
          © 2025 Gerador de Guildas - Sistema para RPG de Mesa
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import PWAManager from '@/components/common/PWAManager.vue'

const route = useRoute()

const navigation = [
  { name: 'Início', href: '/' },
  { name: 'Guilda', href: '/guild' },
  { name: 'Contratos', href: '/contracts' },
  { name: 'Serviços', href: '/services' },
  { name: 'Membros', href: '/members' },
  { name: 'Avisos', href: '/notices' },
  { name: 'Renome', href: '/renown' },
]

const isCurrentRoute = (href: string) => {
  if (href === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(href)
}
</script>

<style scoped>
/* Estilos específicos do componente podem ser adicionados aqui */
</style>
