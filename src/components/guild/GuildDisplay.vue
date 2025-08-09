<template>
  <div class="guild-display">
    <div v-if="guildStore.isGenerating" class="loading">
      <div class="flex items-center justify-center space-x-2">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
        <span class="text-gray-300">Gerando guilda...</span>
      </div>
    </div>

    <div v-else-if="guild" class="guild-content">
      <!-- Header da Guilda -->
      <div class="guild-header bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-700">
        <div class="flex items-center justify-between mb-4">
          <!-- Nome Editável da Guilda -->
          <div class="flex-1 mr-4">
            <div v-if="!isEditingName" class="flex items-center group">
              <button @click="regenerateGuildName"
                class="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-green-400 p-1 ml-1"
                :disabled="guild.locked" title="Regenerar nome da guilda">
                <ArrowPathIcon class="w-4 h-4" />
              </button>
              <h1 class="text-3xl font-bold text-amber-400 mr-2">{{ guild.name }}</h1>
              <button @click="startEditingName"
                class="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-amber-400 p-1"
                title="Editar nome da guilda">
                <PencilIcon class="w-4 h-4" />
              </button>
              <Tooltip
                content="Clique no ícone de lápis para editar o nome da sua guilda. O nome é usado apenas para organização e pode ser alterado a qualquer momento."
                title="Nome da Guilda" position="bottom">
                <InfoButton help-key="guild-naming" @open-help="openHelpModal" class="ml-2" />
              </Tooltip>
            </div>
            <div v-else class="flex items-center">
              <input v-model="editingGuildName" ref="nameInput" @keyup.enter="saveGuildName"
                @keyup.escape="cancelEditingName" @blur="saveGuildName"
                class="text-3xl font-bold text-amber-400 bg-gray-700 border border-amber-400 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-500 flex-1"
                maxlength="100" />
              <button @click="saveGuildName" class="ml-2 text-green-400 hover:text-green-300 p-1" title="Salvar">
                <CheckIcon class="w-4 h-4" />
              </button>
              <button @click="cancelEditingName" class="ml-1 text-red-400 hover:text-red-300 p-1" title="Cancelar">
                <XMarkIcon class="w-4 h-4" />
              </button>
            </div>
          </div>
          <div class="flex space-x-2">
            <Tooltip content="Gera uma nova guilda com estrutura, relações e características completamente diferentes."
              title="Regenerar Guilda">
              <button @click="regenerateGuild" class="btn btn-secondary flex items-center space-x-2"
                :disabled="guildStore.isGenerating || guild?.locked">
                <ArrowPathIcon class="w-4 h-4" />
                <span>Regenerar</span>
              </button>
            </Tooltip>
            <Tooltip content="Exporta todos os dados da guilda atual em formato CSV para backup ou compartilhamento."
              title="Exportar Dados">
              <button @click="exportGuild" class="btn btn-primary flex items-center space-x-2">
                <ArrowDownTrayIcon class="w-4 h-4" />
                <span>Exportar</span>
              </button>
            </Tooltip>
            <Tooltip content="Remove a guilda atual. Esta ação não afeta o histórico de guildas salvas."
              title="Limpar Guilda">
              <button @click="clearGuild" class="btn btn-outline-danger flex items-center space-x-2"
                :disabled="guildStore.isGenerating">
                <TrashIcon class="w-4 h-4" />
                <span>Limpar</span>
              </button>
            </Tooltip>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div class="bg-gray-700 rounded-lg p-3">
            <div class="font-semibold text-gray-300 flex items-center space-x-2">
              <span>Tipo de Assentamento</span>
              <Tooltip
                content="O tipo de assentamento determina o tamanho dos dados usados na geração. Metrópoles têm sedes maiores e melhores que lugarejos."
                title="Tipos de Assentamento">
                <InfoButton help-key="settlement-types" @open-help="openHelpModal" />
              </Tooltip>
            </div>
            <div class="text-amber-400">{{ guild.settlementType }}</div>
          </div>
          <div class="bg-gray-700 rounded-lg p-3">
            <div class="font-semibold text-gray-300 flex items-center space-x-2">
              <span>Tamanho</span>
              <Tooltip
                content="O tamanho determina quantos aventureiros e atividades a sede pode comportar. Também afeta recursos e movimentação."
                title="Tamanho da Sede">
                <InfoButton help-key="guild-structure" @open-help="openHelpModal" />
              </Tooltip>
            </div>
            <div class="text-white">{{ guild.structure.size }}</div>
          </div>
          <div class="bg-gray-700 rounded-lg p-3">
            <div class="font-semibold text-gray-300 flex items-center space-x-2">
              <span>Recursos</span>
              <Tooltip
                content="Recursos determinam que equipamentos, informações e apoio a sede pode oferecer. Afetados pelas relações locais."
                title="Recursos da Sede">
                <InfoButton help-key="guild-resources" @open-help="openHelpModal" />
              </Tooltip>
            </div>
            <div class="text-green-400">{{ guild.resources.level }}</div>
          </div>
        </div>
      </div>

      <!-- Componentes de Estrutura e Relações -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GuildStructure :guild="guild" @regenerate-structure="regenerateStructure" @open-help="openHelpModal" />
        <GuildRelations :guild="guild" @regenerate-relations="regenerateRelations"
          @regenerate-visitors="regenerateVisitors" @open-help="openHelpModal" />
      </div>

      <!-- Modal de Ajuda -->
      <HelpModal :is-open="showHelpModal" :help-key="currentHelpKey" @close="closeHelpModal" />

      <!-- Ações Rápidas -->
      <div class="mt-6 bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
        <h3 class="text-lg font-semibold text-amber-400 mb-4">Ações Rápidas</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          <button @click="regenerateStructure" class="btn btn-outline flex items-center justify-center space-x-2"
            :disabled="guildStore.isGenerating || guild?.locked">
            <BuildingOffice2Icon class="w-4 h-4" />
            <span>Regenerar Estrutura</span>
          </button>
          <button @click="regenerateRelations" class="btn btn-outline flex items-center justify-center space-x-2"
            :disabled="guildStore.isGenerating || guild?.locked">
            <UserGroupIcon class="w-4 h-4" />
            <span>Regenerar Relações</span>
          </button>
          <button @click="toggleLock" :class="[
            'btn flex items-center justify-center space-x-2',
            guild?.locked ? 'btn-outline-danger' : (isGuildInHistory ? 'btn-outline' : 'btn-outline opacity-60')
          ]" :disabled="!guild || guildStore.isGenerating || !isGuildInHistory">
            <LockClosedIcon v-if="guild?.locked" class="w-4 h-4" />
            <LockOpenIcon v-else class="w-4 h-4" />
            <span>{{
              guild?.locked ? 'Desbloquear' :
                isGuildInHistory ? 'Bloquear' : 'Salvar p/ Bloquear'
            }}</span>
          </button>
          <button @click="saveToHistory" :class="[
            'btn flex items-center justify-center space-x-2',
            isGuildInHistory ? 'btn-success' : 'btn-outline'
          ]" :disabled="!guild || guildStore.isGenerating || isGuildInHistory">
            <CheckIcon v-if="isGuildInHistory" class="w-4 h-4" />
            <BookmarkIcon v-else class="w-4 h-4" />
            <span>{{ isGuildInHistory ? 'Já no Histórico' : 'Salvar no Histórico' }}</span>
          </button>
          <button @click="clearGuild" class="btn btn-outline-danger flex items-center justify-center space-x-2"
            :disabled="guildStore.isGenerating">
            <TrashIcon class="w-4 h-4" />
            <span>Limpar</span>
          </button>
        </div>
      </div>

      <!-- Estatísticas do Histórico -->
      <div v-if="guildStore.historyCount > 0" class="mt-6 bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
        <h3 class="text-lg font-semibold text-amber-400 mb-4">Estatísticas do Histórico</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div class="bg-blue-900 rounded-lg p-3 border border-blue-700">
            <div class="font-semibold text-blue-300">Total de Guildas</div>
            <div class="text-2xl font-bold text-blue-100">{{ guildStore.historyCount }}</div>
          </div>
          <div class="bg-green-900 rounded-lg p-3 border border-green-700">
            <div class="font-semibold text-green-300">Tipo Mais Comum</div>
            <div class="text-green-100">{{ mostCommonSettlement || 'N/A' }}</div>
          </div>
          <div class="bg-cyan-900 rounded-lg p-3 border border-cyan-700">
            <div class="font-semibold text-cyan-300">Recursos Médios</div>
            <div class="text-cyan-100">{{ averageResources || 'N/A' }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="text-center py-12 bg-gray-800 rounded-lg shadow-md border border-gray-700">
        <BuildingStorefrontIcon class="w-24 h-24 text-gray-500 mb-4 mx-auto" />
        <h2 class="text-2xl font-semibold text-gray-300 mb-2">Nenhuma guilda gerada</h2>
        <p class="text-gray-400 mb-6">Configure o tipo de assentamento e gere uma nova guilda</p>

        <!-- Seletor de Tipo de Assentamento -->
        <div class="mb-6 max-w-sm mx-auto">
          <label class="block text-sm font-medium text-gray-300 mb-2">
            Tipo de Assentamento
          </label>
          <select v-model="selectedSettlementType"
            class="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option value="random">Aleatório</option>
            <option v-for="type in settlementTypes" :key="type" :value="type">
              {{ type }}
            </option>
          </select>
        </div>

        <button @click="generateNewGuild"
          class="btn btn-primary text-lg px-8 py-3 flex items-center justify-center gap-2 mx-auto"
          :disabled="guildStore.isGenerating">
          <PlusIcon class="w-5 h-5" />
          Gerar Nova Guilda
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  BuildingOffice2Icon,
  UserGroupIcon,
  BookmarkIcon,
  TrashIcon,
  PlusIcon,
  LockClosedIcon,
  LockOpenIcon
} from '@heroicons/vue/24/solid'
import { BuildingStorefrontIcon } from '@heroicons/vue/24/outline'
import { useGuildStore } from '@/stores/guild'
import { useContractsStore } from '@/stores/contracts'
import { SettlementType, type Guild } from '@/types/guild'
import { useToast } from '@/composables/useToast'
import GuildStructure from './GuildStructure.vue'
import GuildRelations from './GuildRelations.vue'
import Tooltip from '@/components/common/Tooltip.vue'
import InfoButton from '@/components/common/InfoButton.vue'
import HelpModal from '@/components/common/HelpModal.vue'

const guildStore = useGuildStore()
const contractsStore = useContractsStore()
const toast = useToast()

const guild = computed(() => guildStore.currentGuild)

// Seletor de tipo de assentamento
const selectedSettlementType = ref<SettlementType | 'random'>('random')
const settlementTypes = [
  SettlementType.LUGAREJO,
  SettlementType.POVOADO,
  SettlementType.ALDEIA,
  SettlementType.VILAREJO,
  SettlementType.VILA_GRANDE,
  SettlementType.CIDADELA,
  SettlementType.CIDADE_GRANDE,
  SettlementType.METROPOLE
]

// Edição do nome da guilda
const isEditingName = ref(false)
const editingGuildName = ref('')
const nameInput = ref<HTMLInputElement>()

const mostCommonSettlement = computed(() => {
  const history = guildStore.guildHistory
  if (history.length === 0) return 'N/A'

  const settlementCounts: Record<string, number> = {}
  history.forEach(guild => {
    const type = guild.settlementType
    settlementCounts[type] = (settlementCounts[type] || 0) + 1
  })

  const entries = Object.entries(settlementCounts)
  if (entries.length === 0) return 'N/A'

  const [mostCommon] = entries.reduce((a, b) => a[1] > b[1] ? a : b)
  return mostCommon
})

const averageResources = computed(() => {
  const history = guildStore.guildHistory
  if (history.length === 0) return 'N/A'

  const resourceCounts: Record<string, number> = {}
  history.forEach(guild => {
    const level = guild.resources.level
    resourceCounts[level] = (resourceCounts[level] || 0) + 1
  })

  const entries = Object.entries(resourceCounts)
  if (entries.length === 0) return 'N/A'

  const [mostCommon] = entries.reduce((a, b) => a[1] > b[1] ? a : b)
  return mostCommon
})

// Verificar se a guilda atual está no histórico
const isGuildInHistory = computed(() => {
  if (!guild.value) return false
  return guildStore.guildHistory.some(g => g.id === guild.value!.id)
})

const generateNewGuild = async () => {
  try {
    if (selectedSettlementType.value === 'random') {
      // Gera tipo aleatório de settlement
      const settlements = Object.values(SettlementType);
      const randomSettlement = settlements[Math.floor(Math.random() * settlements.length)];

      await guildStore.generateGuild({
        settlementType: randomSettlement,
        saveToHistory: false
      })
    } else {
      await guildStore.generateGuild({
        settlementType: selectedSettlementType.value as SettlementType,
        saveToHistory: false
      })
    }
  } catch (error) {
    if (error instanceof Error) {
      alert(`Erro ao gerar guilda: ${error.message}`)
    }
  }
}

const regenerateGuild = async () => {
  if (guild.value?.locked) {
    toast.warning('Esta guilda está bloqueada. Desbloqueie no histórico para permitir regeneração.');
    return;
  }

  try {
    await guildStore.regenerateCurrentGuild()
  } catch (error) {
    // Erro será tratado pelo store
  }
}

const regenerateStructure = async () => {
  if (guild.value?.locked) {
    toast.warning('Esta guilda está bloqueada. Desbloqueie no histórico para permitir regeneração da estrutura.');
    return;
  }

  try {
    await guildStore.regenerateStructure()
  } catch (error) {
    // Erro será tratado pelo store
  }
}

const regenerateRelations = async () => {
  if (guild.value?.locked) {
    toast.warning('Esta guilda está bloqueada. Desbloqueie no histórico para permitir regeneração das relações.');
    return;
  }

  try {
    await guildStore.regenerateRelations()
  } catch (error) {
    // Erro será tratado pelo store
  }
}

const regenerateVisitors = async () => {
  try {
    await guildStore.regenerateVisitors()
  } catch (error) {
    // Erro será tratado pelo store
  }
}

const regenerateGuildName = async () => {
  if (guild.value?.locked) {
    toast.warning('Esta guilda está bloqueada. Desbloqueie no histórico para permitir regeneração do nome.');
    return;
  }

  try {
    await guildStore.regenerateGuildName()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    toast.error('Erro ao regenerar nome da guilda', message)
  }
}

const saveToHistory = () => {
  if (guild.value) {
    try {
      // Converter readonly para tipo mutável
      const guildCopy = JSON.parse(JSON.stringify(guild.value));

      // Converter strings de data de volta para objetos Date
      if (guildCopy.createdAt && typeof guildCopy.createdAt === 'string') {
        guildCopy.createdAt = new Date(guildCopy.createdAt);
      }
      if (guildCopy.updatedAt && typeof guildCopy.updatedAt === 'string') {
        guildCopy.updatedAt = new Date(guildCopy.updatedAt);
      }

      const guildToSave = guildCopy as Guild;
      guildStore.addToHistory(guildToSave);

      toast.success('Guilda salva no histórico com sucesso!');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Erro completo:', error);
      const message = error instanceof Error ? error.message : 'Erro desconhecido ao salvar guilda';
      toast.error('Erro ao salvar guilda', message);
    }
  } else {
    toast.warning('Nenhuma guilda para salvar');
  }
}

const clearGuild = () => {
  guildStore.clearCurrentGuild()
}

// Funções de edição do nome
const startEditingName = () => {
  if (!guild.value) return
  editingGuildName.value = guild.value.name
  isEditingName.value = true
  // Focus no input após o próximo tick
  setTimeout(() => {
    nameInput.value?.focus()
    nameInput.value?.select()
  }, 10)
}

const saveGuildName = async () => {
  if (!guild.value || !editingGuildName.value.trim()) {
    cancelEditingName()
    return
  }

  const newName = editingGuildName.value.trim()
  if (newName === guild.value.name) {
    cancelEditingName()
    return
  }

  try {
    const success = guildStore.updateGuildName(newName)
    if (success) {
      isEditingName.value = false
      toast.success('Nome da guilda atualizado com sucesso!')
    } else {
      toast.error('Erro ao atualizar nome da guilda')
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    toast.error('Erro ao atualizar nome', message)
  }
}

const cancelEditingName = () => {
  isEditingName.value = false
  editingGuildName.value = ''
}

// Função de toggle do lock
const toggleLock = () => {
  if (!guild.value) return

  // Verificar se a guilda está salva no histórico
  if (!isGuildInHistory.value) {
    toast.warning(
      'Esta guilda precisa estar salva no histórico para ser bloqueada. Salve-a primeiro usando o botão "Salvar no Histórico".',
      'Guilda não salva no histórico'
    )
    return
  }

  // Verificar se estamos tentando desbloquear uma guilda que já está em uso
  if (guild.value.locked && !contractsStore.canGenerateContracts) {
    toast.warning(
      'Esta guilda já está em. O desbloqueio não é permitido para manter a consistência dos dados.',
      'Guilda em uso'
    )
    return
  }

  try {
    const success = guildStore.toggleGuildLock(guild.value.id)
    if (success) {
      const isNowLocked = guild.value.locked
      const message = isNowLocked ? 'Guilda bloqueada com sucesso!' : 'Guilda desbloqueada com sucesso!'
      toast.success(message)
    } else {
      // Se o toggle falhou, mostrar mensagem específica dependendo do estado
      if (guild.value.locked) {
        toast.warning(
          'Esta guilda já está em uso e não pode ser desbloqueada.',
          'Desbloqueio não permitido'
        )
      } else {
        toast.error('Erro ao alterar status de bloqueio da guilda')
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro desconhecido'
    toast.error('Erro ao alterar bloqueio', message)
  }
}

// Sistema de Ajuda
const showHelpModal = ref(false)
const currentHelpKey = ref<string>('')

const openHelpModal = (helpKey: string) => {
  currentHelpKey.value = helpKey
  showHelpModal.value = true
}

const closeHelpModal = () => {
  showHelpModal.value = false
  currentHelpKey.value = ''
}

const exportGuild = () => {
  const guildData = guildStore.exportCurrentGuild()
  if (guildData) {
    const blob = new Blob([guildData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `guilda-${guild.value?.name?.replace(/\s+/g, '-').toLowerCase() || 'export'}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}
</script>

<style scoped>
.btn {
  @apply px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-primary {
  @apply bg-blue-600 text-white hover:bg-blue-700;
}

.btn-secondary {
  @apply bg-gray-600 text-white hover:bg-gray-700;
}

.btn-success {
  @apply bg-green-600 text-white border border-green-500;
}

.btn-outline {
  @apply border border-gray-500 text-gray-300 hover:bg-gray-700;
}

.btn-outline-danger {
  @apply border border-red-500 text-red-400 hover:bg-red-900;
}

.loading {
  @apply flex items-center justify-center py-12;
}

.guild-display {
  @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6;
}

.guild-content {
  @apply space-y-6;
}

.empty-state {
  @apply bg-gray-800 rounded-lg shadow-md border border-gray-700;
}
</style>
