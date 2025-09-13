<template>
  <div class="guild-history">
    <!-- Header do Histórico -->
    <div class="history-header">
      <h3 class="history-title">
        <ClockIcon class="w-5 h-5" />
        Histórico de Guildas
        <span class="history-count"
          >({{ filteredGuilds.length }}/{{ guildStore.historyCount }})</span
        >
      </h3>

      <div class="history-actions">
        <button
          @click="showConfirmClear = true"
          :disabled="guildStore.historyCount === 0"
          class="btn btn-danger btn-sm flex items-center gap-2"
          title="Limpar Histórico"
        >
          <TrashIcon class="w-4 h-4" />
          Limpar Histórico
        </button>
      </div>
    </div>

    <!-- Filtros e Pesquisa -->
    <div v-if="guildStore.historyCount > 0" class="history-filters">
      <!-- Barra de Pesquisa -->
      <div class="search-container">
        <div class="search-input-wrapper">
          <MagnifyingGlassIcon class="search-icon w-5 h-5" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Pesquisar por nome da guilda..."
            class="search-input"
          />
          <button
            v-if="searchQuery"
            @click="clearSearch"
            class="clear-search-button"
            title="Limpar pesquisa"
          >
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Filtro de Ordenação -->
      <div class="sort-container">
        <select
          v-model="sortOrder"
          class="sort-select"
          title="Ordenar por data"
        >
          <option value="newest">Mais recente primeiro</option>
          <option value="oldest">Mais antiga primeiro</option>
        </select>
      </div>
    </div>

    <!-- Lista de Guildas -->
    <div v-if="guildStore.historyCount === 0" class="empty-history">
      <FolderOpenIcon class="empty-icon w-12 h-12 text-gray-500" />
      <p>Nenhuma guilda salva no histórico</p>
      <p class="empty-hint">
        Gere uma guilda e clique em "Salvar no Histórico" para começar
      </p>
    </div>

    <div v-else-if="filteredGuilds.length === 0" class="empty-search">
      <MagnifyingGlassIcon class="empty-icon w-12 h-12 text-gray-500" />
      <p>Nenhuma guilda encontrada</p>
      <p class="empty-hint">Tente uma pesquisa diferente ou limpe o filtro</p>
    </div>

    <div v-else class="history-list">
      <div
        v-for="guild in paginatedGuilds"
        :key="guild.id"
        :class="[
          'history-item',
          { 'history-item-active': guild.id === guildStore.currentGuild?.id },
        ]"
      >
        <!-- Informações da Guilda -->
        <div class="guild-info" @click="loadGuild(guild.id)">
          <div class="guild-main-info">
            <h4 class="guild-name flex items-center gap-2">
              {{ guild.name }}
              <StarIcon
                v-if="guild.structure.isHeadquarters"
                class="w-4 h-4 text-amber-400"
                title="Sede Matriz"
              />
            </h4>
            <span class="guild-settlement">{{ guild.settlementType }}</span>
          </div>

          <div class="guild-details">
            <span class="guild-size">{{ guild.structure.size }}</span>
            <span class="guild-resources">{{ guild.resources.level }}</span>
            <span class="guild-date">
              {{ formatDate(guild.createdAt) }}
            </span>
          </div>
        </div>

        <!-- Ações da Guilda -->
        <div class="guild-actions">
          <button
            @click.stop="toggleLock(guild.id)"
            :class="[
              'btn btn-sm lock-button',
              guild.locked ? 'btn-locked' : 'btn-unlocked',
            ]"
            :title="
              guild.locked
                ? 'Desbloquear Guilda - Permitir remoção e regeneração'
                : 'Bloquear Guilda - Proteger de remoção e regeneração'
            "
          >
            <LockClosedIcon
              v-if="guild.locked"
              class="w-4 h-4 text-yellow-300"
            />
            <LockOpenIcon v-else class="w-4 h-4 text-gray-400" />
          </button>

          <button
            @click.stop="removeGuild(guild.id)"
            :disabled="guild.locked"
            class="btn btn-danger btn-sm"
            :title="
              guild.locked
                ? 'Guilda bloqueada - não pode ser removida'
                : 'Remover do Histórico'
            "
          >
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- Paginação -->
      <div v-if="totalPages > 1" class="pagination">
        <div class="pagination-info">
          <span class="pagination-text">
            Página {{ currentPage }} de {{ totalPages }} ({{
              paginationStartIndex + 1
            }}-{{ paginationEndIndex }} de {{ filteredGuilds.length }})
          </span>
        </div>

        <div class="pagination-controls">
          <button
            @click="goToPage(1)"
            :disabled="currentPage === 1"
            class="btn btn-outline btn-sm pagination-btn"
            title="Primeira página"
          >
            <ChevronDoubleLeftIcon class="w-4 h-4" />
          </button>

          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="btn btn-outline btn-sm pagination-btn"
            title="Página anterior"
          >
            <ChevronLeftIcon class="w-4 h-4" />
          </button>

          <span class="pagination-current">
            {{ currentPage }}
          </span>

          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="btn btn-outline btn-sm pagination-btn"
            title="Próxima página"
          >
            <ChevronRightIcon class="w-4 h-4" />
          </button>

          <button
            @click="goToPage(totalPages)"
            :disabled="currentPage === totalPages"
            class="btn btn-outline btn-sm pagination-btn"
            title="Última página"
          >
            <ChevronDoubleRightIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmação -->
    <div
      v-if="showConfirmClear"
      class="modal-overlay"
      @click="showConfirmClear = false"
    >
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4>Confirmar Limpeza</h4>
        </div>

        <div class="modal-body">
          <p>Tem certeza que deseja limpar o histórico?</p>
          <p class="warning-text">
            <ExclamationTriangleIcon class="w-4 h-4" />
            Esta ação removerá todas as guildas não bloqueadas do histórico e
            não pode ser desfeita.
          </p>
          <p v-if="lockedCount > 0" class="info-text">
            <LockClosedIcon class="w-4 h-4" />
            {{ lockedCount }} guilda(s) bloqueada(s) será(ão) mantida(s).
          </p>
        </div>

        <div class="modal-actions">
          <button @click="showConfirmClear = false" class="btn btn-outline">
            Cancelar
          </button>
          <button
            @click="confirmClearHistory"
            class="btn btn-danger flex items-center gap-2"
          >
            <TrashIcon class="w-4 h-4" />
            Limpar Histórico
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import {
  ClockIcon,
  TrashIcon,
  FolderOpenIcon,
  LockClosedIcon,
  LockOpenIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  StarIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/vue/24/solid";
import { useGuildStore } from "@/stores/guild";
import { useToast } from "@/composables/useToast";

const guildStore = useGuildStore();
const toast = useToast();

// Estados reativos
const showConfirmClear = ref(false);
const searchQuery = ref("");
const sortOrder = ref<"newest" | "oldest">("newest");
const currentPage = ref(1);

// Configurações de paginação
const ITEMS_PER_PAGE = 10;

// Computed para filtrar e ordenar guildas
const filteredGuilds = computed(() => {
  let guilds = [...guildStore.guildHistory];

  // Aplicar filtro de pesquisa
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase().trim();
    guilds = guilds.filter((guild) => guild.name.toLowerCase().includes(query));
  }

  // Aplicar ordenação
  guilds.sort((a, b) => {
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();

    if (sortOrder.value === "newest") {
      return dateB - dateA; // Mais recente primeiro
    } else {
      return dateA - dateB; // Mais antiga primeiro
    }
  });

  return guilds;
});

// Computed para paginação
const totalPages = computed(() => {
  return Math.ceil(filteredGuilds.value.length / ITEMS_PER_PAGE);
});

const paginationStartIndex = computed(() => {
  return (currentPage.value - 1) * ITEMS_PER_PAGE;
});

const paginationEndIndex = computed(() => {
  return Math.min(
    paginationStartIndex.value + ITEMS_PER_PAGE,
    filteredGuilds.value.length
  );
});

const paginatedGuilds = computed(() => {
  return filteredGuilds.value.slice(
    paginationStartIndex.value,
    paginationEndIndex.value
  );
});

// Computed para contagem de guildas bloqueadas
const lockedCount = computed(() => {
  return guildStore.guildHistory.filter((g) => g.locked).length;
});

// Watchers para reset de paginação
watch([searchQuery, sortOrder], () => {
  currentPage.value = 1;
});

// Métodos de paginação
const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};

// Método para limpar pesquisa
const clearSearch = () => {
  searchQuery.value = "";
};

const formatDate = (date: Date | string | null | undefined): string => {
  try {
    if (!date) return "Data inválida";

    // Converter para Date se for string
    const dateObj = date instanceof Date ? date : new Date(date);

    // Verificar se a data é válida
    if (isNaN(dateObj.getTime())) {
      return "Data inválida";
    }

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn("Erro ao formatar data:", error);
    return "Data inválida";
  }
};

const loadGuild = (guildId: string) => {
  guildStore.selectGuildFromHistory(guildId);

  if (guildStore.currentGuild?.id === guildId) {
    toast.success("Guilda carregada do histórico");
  } else {
    toast.error("Erro ao carregar guilda do histórico");
  }
};

const toggleLock = async (guildId: string) => {
  // Capture previous locked state to show appropriate feedback on failure
  const prevGuild = guildStore.guildHistory.find((g) => g.id === guildId);
  const wasLocked = !!prevGuild?.locked;

  const success = await guildStore.toggleGuildLock(guildId);

  if (success) {
    const updatedGuild = guildStore.guildHistory.find((g) => g.id === guildId);
    if (updatedGuild?.locked) {
      toast.success("Guilda bloqueada");
    } else {
      toast.success("Guilda desbloqueada");
    }
    return;
  }

  // Toggle failed — if we tried to unlock, show specific warning based on the reason
  if (wasLocked) {
    // Verificar se há timeline ou contratos ativos para mensagem mais específica
    toast.warning(
      "Esta guilda não pode ser desbloqueada porque possui timeline ou contratos iniciados.",
      "Desbloqueio não permitido"
    );
  } else {
    toast.error("Erro ao alterar bloqueio da guilda");
  }
};

const removeGuild = async (guildId: string) => {
  const guild = guildStore.guildHistory.find((g) => g.id === guildId);

  if (guild?.locked) {
    toast.warning("Esta guilda está bloqueada e não pode ser removida");
    return;
  }

  const success = await guildStore.removeFromHistory(guildId);
  if (success) {
    toast.success("Guilda removida do histórico");
  } else {
    toast.error("Erro ao remover guilda do histórico");
  }
};

const confirmClearHistory = () => {
  guildStore.clearHistory();
  showConfirmClear.value = false;

  if (lockedCount.value > 0) {
    toast.success(
      `Histórico limpo. ${lockedCount.value} guilda(s) bloqueada(s) mantida(s).`
    );
  } else {
    toast.success("Histórico limpo com sucesso");
  }
};
</script>

<style scoped>
.guild-history {
  @apply bg-gray-800 rounded-lg p-6;
}

.history-header {
  @apply flex justify-between items-center mb-6 pb-4 border-b border-gray-700;
}

.history-title {
  @apply text-xl font-bold text-white flex items-center gap-2;
}

.history-count {
  @apply text-sm text-gray-400 font-normal;
}

.history-actions {
  @apply flex gap-2;
}

/* Filtros e Pesquisa */
.history-filters {
  @apply mb-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between;
}

.search-container {
  @apply flex-1 max-w-md;
}

.search-input-wrapper {
  @apply relative;
}

.search-icon {
  @apply absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none;
}

.search-input {
  @apply w-full pl-10 pr-10 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors;
}

.clear-search-button {
  @apply absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-white hover:bg-gray-600 rounded transition-colors;
}

.sort-container {
  @apply flex-shrink-0;
}

.sort-select {
  @apply px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors;
}

/* Estados vazios */
.empty-history,
.empty-search {
  @apply text-center py-12 text-gray-400;
}

.empty-icon {
  @apply mx-auto mb-4;
}

.empty-hint {
  @apply text-sm text-gray-500;
}

.history-list {
  @apply space-y-3;
}

.history-item {
  @apply bg-gray-700 rounded-lg p-4 flex items-center justify-between hover:bg-gray-600 transition-colors cursor-pointer;
}

.history-item-active {
  @apply bg-blue-900 border border-blue-500;
}

.guild-info {
  @apply flex-1 grid grid-cols-2 gap-4;
}

.guild-main-info {
  @apply space-y-1;
}

.guild-name {
  @apply text-lg font-semibold text-white;
}

.guild-settlement {
  @apply text-sm text-blue-400;
}

.guild-details {
  @apply text-right space-y-1 text-sm text-gray-300;
}

.guild-size,
.guild-resources {
  @apply block;
}

.guild-date {
  @apply text-xs text-gray-500;
}

.guild-actions {
  @apply flex gap-2 ml-4;
}

/* Paginação */
.pagination {
  @apply mt-6 pt-4 border-t border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4;
}

.pagination-info {
  @apply text-sm text-gray-400;
}

.pagination-text {
  @apply block;
}

.pagination-controls {
  @apply flex items-center gap-2;
}

.pagination-btn {
  @apply flex items-center justify-center w-8 h-8 p-0;
}

.pagination-current {
  @apply px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-medium min-w-[2rem] text-center;
}

/* Botões */
.btn {
  @apply px-3 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-sm {
  @apply px-2 py-1 text-sm;
}

.btn-outline {
  @apply border border-gray-500 text-gray-300 hover:bg-gray-700;
}

.btn-danger {
  @apply bg-red-600 text-white hover:bg-red-700 border border-red-500;
}

.btn-warning {
  @apply bg-yellow-600 text-white hover:bg-yellow-700 border border-yellow-500;
}

.btn-locked {
  @apply bg-yellow-900/30 border-yellow-500 hover:bg-yellow-800/40 transition-all duration-200;
  box-shadow: 0 0 8px rgba(251, 191, 36, 0.3);
}

.btn-unlocked {
  @apply bg-gray-700 border-gray-500 hover:bg-gray-600 transition-all duration-200;
}

.lock-button {
  @apply relative;
}

.lock-button:hover .text-gray-400 {
  @apply text-yellow-400;
}

/* Modal */
.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-content {
  @apply bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 border border-gray-700;
}

.modal-header {
  @apply mb-4;
}

.modal-header h4 {
  @apply text-lg font-bold text-white;
}

.modal-body {
  @apply mb-6 space-y-3;
}

.modal-body p {
  @apply text-gray-300;
}

.warning-text {
  @apply text-yellow-400 flex items-center gap-2;
}

.info-text {
  @apply text-blue-400 flex items-center gap-2;
}

.modal-actions {
  @apply flex gap-3 justify-end;
}

/* Responsividade */
@media (max-width: 640px) {
  .guild-info {
    @apply grid-cols-1 gap-2;
  }

  .guild-details {
    @apply text-left;
  }

  .history-item {
    @apply flex-col items-start gap-3;
  }

  .guild-actions {
    @apply ml-0 self-end;
  }

  .pagination-controls {
    @apply flex-wrap justify-center;
  }
}
</style>
