<template>
  <div class="space-y-8">
    <div class="text-center">
      <h1 class="text-3xl font-medieval font-bold text-gold-400 mb-4 flex items-center justify-center gap-3">
        <WrenchScrewdriverIcon class="w-7 h-7 text-gold-400" />
        Serviços
      </h1>
      <p class="text-lg text-gray-300 mb-8">
        Serviços especializados com pagamentos alternativos.
      </p>
    </div>

    <!-- Service Components -->
    <ServiceList />
  </div>
</template>

<script setup lang="ts">
// Import service components
import { WrenchScrewdriverIcon } from '@heroicons/vue/24/outline'
import ServiceList from '@/components/services/ServiceList.vue'

// Services view implementation will be added in Phase 5
</script>
