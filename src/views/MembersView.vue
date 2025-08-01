<template>
  <div class="space-y-8">
    <div class="text-center">
      <h1 class="text-3xl font-medieval font-bold text-gold-400 mb-4 flex items-center justify-center gap-3">
        <font-awesome-icon :icon="['fas', 'users']" class="text-gold-400" />
        Membros
      </h1>
      <p class="text-lg text-gray-300 mb-8">
        Contrate aventureiros de diferentes níveis e especialidades.
      </p>
    </div>

    <!-- Member Components -->
    <MemberList />
  </div>
</template>

<script setup lang="ts">
// Import member components
import MemberList from '@/components/members/MemberList.vue'

// Members view implementation will be added in Phase 6
console.log('[MEMBERS VIEW] Members View loaded')
</script>
