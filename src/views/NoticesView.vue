<template>
  <div class="space-y-8">
    <div class="text-center">
      <h1 class="text-3xl font-medieval font-bold text-gold-400 mb-4">
        📋 Mural de Avisos
      </h1>
      <p class="text-lg text-gray-300 mb-8">
        Avisos, execuções, procurados e oportunidades comerciais.
      </p>
    </div>

    <!-- Notice Components -->
    <NoticeBoard />
  </div>
</template>

<script setup lang="ts">
// Import notice components
import NoticeBoard from '@/components/notices/NoticeBoard.vue'

// Notices view implementation will be added in Phase 7
console.log('📰 Notices View loaded')
</script>
