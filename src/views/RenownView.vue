<template>
  <div class="space-y-8">
    <div class="text-center">
      <h1 class="text-3xl font-medieval font-bold text-gold-400 mb-4 flex items-center justify-center gap-3">
        <font-awesome-icon :icon="['fas', 'trophy']" class="text-gold-400" />
        Sistema de Renome
      </h1>
      <p class="text-lg text-gray-300 mb-8">
        Acompanhe sua progressão e benefícios na guilda.
      </p>
    </div>

    <!-- Renown Components -->
    <RenownTracker />
  </div>
</template>

<script setup lang="ts">
// Import renown components
import RenownTracker from '@/components/renown/RenownTracker.vue'

// Renown view implementation will be added in Phase 8
console.log('[RENOWN] Renown View loaded')
</script>
