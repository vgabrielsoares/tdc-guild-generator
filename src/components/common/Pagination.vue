<template>
  <div
    v-if="totalPages > 1"
    class="flex items-center justify-center gap-3 py-2"
  >
    <button
      :disabled="currentPage <= 1"
      @click="changePage(currentPage - 1)"
      class="px-3 py-1 bg-gray-700 text-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
    >
      Anterior
    </button>

    <div class="text-sm text-gray-300">
      Página {{ currentPage }} de {{ totalPages }}
    </div>

    <button
      :disabled="currentPage >= totalPages"
      @click="changePage(currentPage + 1)"
      class="px-3 py-1 bg-gray-700 text-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
    >
      Próxima
    </button>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

const props = defineProps<{
  currentPage: number;
  totalPages: number;
}>();

const emit = defineEmits(["page-change"]);

function changePage(page: number) {
  if (page < 1) page = 1;
  if (page > props.totalPages) page = props.totalPages;
  emit("page-change", page);
}
</script>

<style scoped>
/* estilização mínima; visual é gerenciado pelas classes tailwind nos templates */
</style>
