<template>
  <div class="space-y-8">
    <div class="text-center">
      <h1 class="text-3xl font-medieval font-bold text-gold-400 mb-4">
        📜 Contratos
      </h1>
      <p class="text-lg text-gray-300 mb-8">
        Explore contratos disponíveis com valores dinâmicos e modificadores.
      </p>
    </div>

    <!-- Contract Components -->
    <ContractList />
  </div>
</template>

<script setup lang="ts">
// Import contract components
import ContractList from '@/components/contracts/ContractList.vue'

// Contracts view implementation will be added in Phase 4
console.log('📋 Contracts View loaded')
</script>
