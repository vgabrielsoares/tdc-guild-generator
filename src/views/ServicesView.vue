<template>
  <div class="space-y-8">
    <div class="text-center">
      <h1 class="text-3xl font-medieval font-bold text-gold-400 mb-4">
        ⚒️ Serviços
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
import ServiceList from '@/components/services/ServiceList.vue'

// Services view implementation will be added in Phase 5
console.log('⚔️ Services View loaded')
</script>
