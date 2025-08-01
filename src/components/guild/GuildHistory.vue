<template>
  <div class="guild-history">
    <!-- Header do Histórico -->
    <div class="history-header">
      <h3 class="history-title">
        <ClockIcon class="w-5 h-5" />
        Histórico de Guildas
        <span class="history-count">({{ guildStore.historyCount }})</span>
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

    <!-- Lista de Guildas -->
    <div v-if="guildStore.historyCount === 0" class="empty-history">
      <FolderOpenIcon class="empty-icon w-12 h-12 text-gray-500" />
      <p>Nenhuma guilda salva no histórico</p>
      <p class="empty-hint">
        Gere uma guilda e clique em "Salvar no Histórico" para começar
      </p>
    </div>

    <div v-else class="history-list">
      <div
        v-for="guild in guildStore.guildHistory"
        :key="guild.id"
        :class="[
          'history-item',
          { 'history-item-active': guild.id === guildStore.currentGuild?.id }
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
              guild.locked ? 'btn-locked' : 'btn-unlocked'
            ]"
            :title="guild.locked ? 'Desbloquear Guilda - Permitir remoção' : 'Bloquear Guilda - Proteger de remoção'"
          >
            <LockClosedIcon 
              v-if="guild.locked"
              class="w-4 h-4 text-yellow-300"
            />
            <LockOpenIcon 
              v-else
              class="w-4 h-4 text-gray-400"
            />
          </button>
          
          <button
            @click.stop="removeGuild(guild.id)"
            :disabled="guild.locked"
            class="btn btn-danger btn-sm"
            :title="guild.locked ? 'Guilda bloqueada - não pode ser removida' : 'Remover do Histórico'"
          >
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de Confirmação -->
    <div v-if="showConfirmClear" class="modal-overlay" @click="showConfirmClear = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h4>Confirmar Limpeza</h4>
        </div>
        
        <div class="modal-body">
          <p>Tem certeza que deseja limpar o histórico?</p>
          <p class="warning-text">
            <ExclamationTriangleIcon class="w-4 h-4" />
            Esta ação removerá todas as guildas não bloqueadas do histórico e não pode ser desfeita.
          </p>
          <p v-if="lockedCount > 0" class="info-text">
            <LockClosedIcon class="w-4 h-4" />
            {{ lockedCount }} guilda(s) bloqueada(s) será(ão) mantida(s).
          </p>
        </div>
        
        <div class="modal-actions">
          <button
            @click="showConfirmClear = false"
            class="btn btn-outline"
          >
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
import { ref, computed } from 'vue';
import { 
  ClockIcon,
  TrashIcon,
  FolderOpenIcon,
  LockClosedIcon,
  LockOpenIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  StarIcon
} from '@heroicons/vue/24/solid';
import { useGuildStore } from '@/stores/guild';
import { useToast } from '@/composables/useToast';

const guildStore = useGuildStore();
const toast = useToast();

const showConfirmClear = ref(false);

const lockedCount = computed(() => {
  return guildStore.guildHistory.filter(g => g.locked).length;
});

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

const loadGuild = (guildId: string) => {
  const success = guildStore.selectGuildFromHistory(guildId);
  if (success) {
    toast.success('Guilda carregada do histórico');
  } else {
    toast.error('Erro ao carregar guilda do histórico');
  }
};

const toggleLock = (guildId: string) => {
  const success = guildStore.toggleGuildLock(guildId);
  if (success) {
    const guild = guildStore.guildHistory.find(g => g.id === guildId);
    if (guild?.locked) {
      toast.success('Guilda bloqueada - não será removida ao limpar histórico');
    } else {
      toast.warning('Guilda desbloqueada - pode ser removida ao limpar histórico');
    }
  } else {
    toast.error('Erro ao alterar bloqueio da guilda');
  }
};

const removeGuild = (guildId: string) => {
  const guild = guildStore.guildHistory.find(g => g.id === guildId);
  
  if (guild?.locked) {
    toast.warning('Esta guilda está bloqueada e não pode ser removida');
    return;
  }
  
  const success = guildStore.removeFromHistory(guildId);
  if (success) {
    toast.success('Guilda removida do histórico');
  } else {
    toast.error('Erro ao remover guilda do histórico');
  }
};

const confirmClearHistory = () => {
  guildStore.clearHistory();
  showConfirmClear.value = false;
  
  if (lockedCount.value > 0) {
    toast.success(`Histórico limpo. ${lockedCount.value} guilda(s) bloqueada(s) mantida(s).`);
  } else {
    toast.success('Histórico limpo com sucesso');
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

.empty-history {
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
</style>
