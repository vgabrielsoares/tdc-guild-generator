<!--
  Componente detalhado da guilda - mostra todas as informações geradas
  Organizado em seções com design responsivo
-->
<template>
  <div class="guild-details">
    <!-- Header com ações -->
    <div class="guild-details__header">
      <GuildInfoCard
        :guild="guild"
        :show-characteristics="false"
        :show-metadata="true"
        :readonly="readonly"
        @guild:edit="$emit('guild:edit')"
      >
        <template #actions>
          <div class="guild-actions">
            <button
              v-if="!readonly"
              @click="$emit('guild:regenerate')"
              class="btn btn--primary"
              :disabled="isRegenerating"
            >
              <icon name="refresh" :class="{ 'animate-spin': isRegenerating }" />
              <span>{{ isRegenerating ? 'Regenerando...' : 'Regenerar' }}</span>
            </button>
            
            <button
              @click="$emit('guild:export')"
              class="btn btn--secondary"
            >
              <icon name="download" />
              <span>Exportar</span>
            </button>
            
            <button
              v-if="showAdvanced"
              @click="toggleAdvanced"
              class="btn btn--ghost"
            >
              <icon :name="showAdvancedInfo ? 'eye-slash' : 'eye'" />
              <span>{{ showAdvancedInfo ? 'Ocultar' : 'Avançado' }}</span>
            </button>
          </div>
        </template>
      </GuildInfoCard>
    </div>

    <!-- Conteúdo principal em grid -->
    <div class="guild-details__content">
      <div class="guild-sections">
        
        <!-- Estrutura Física -->
        <section class="guild-section">
          <h3 class="guild-section__title">
            <icon name="building" />
            Estrutura Física
          </h3>
          
          <div class="guild-section__content">
            <div class="detail-grid">
              <div class="detail-item">
                <dt>Tamanho da Sede</dt>
                <dd>{{ guild.structure.size }}</dd>
              </div>
              
              <div class="detail-item detail-item--full">
                <dt>Características</dt>
                <dd>
                  <ul class="characteristics-list">
                    <li
                      v-for="(characteristic, index) in guild.structure.characteristics"
                      :key="index"
                      class="characteristic-item"
                    >
                      {{ characteristic }}
                    </li>
                  </ul>
                </dd>
              </div>
            </div>
          </div>
        </section>

        <!-- Funcionários -->
        <section class="guild-section">
          <h3 class="guild-section__title">
            <icon name="users" />
            Funcionários
          </h3>
          
          <div class="guild-section__content">
            <div class="detail-grid">
              <div class="detail-item detail-item--full">
                <dt>Descrição</dt>
                <dd>{{ guild.staff.employees }}</dd>
              </div>
              
              <div v-if="guild.staff.count" class="detail-item">
                <dt>Quantidade</dt>
                <dd>{{ guild.staff.count }}</dd>
              </div>
            </div>
          </div>
        </section>

        <!-- Relações -->
        <section class="guild-section">
          <h3 class="guild-section__title">
            <icon name="handshake" />
            Relações
          </h3>
          
          <div class="guild-section__content">
            <div class="detail-grid">
              <div class="detail-item">
                <dt>Com o Governo</dt>
                <dd>
                  <span 
                    class="relation-status"
                    :class="getRelationClass(guild.relations.government)"
                  >
                    {{ guild.relations.government }}
                  </span>
                </dd>
              </div>
              
              <div class="detail-item">
                <dt>Com a População</dt>
                <dd>
                  <span 
                    class="relation-status"
                    :class="getRelationClass(guild.relations.population)"
                  >
                    {{ guild.relations.population }}
                  </span>
                </dd>
              </div>
              
              <div 
                v-if="guild.relations.notes"
                class="detail-item detail-item--full"
              >
                <dt>Observações</dt>
                <dd>{{ guild.relations.notes }}</dd>
              </div>
            </div>
          </div>
        </section>

        <!-- Recursos -->
        <section class="guild-section">
          <h3 class="guild-section__title">
            <icon name="coins" />
            Recursos
          </h3>
          
          <div class="guild-section__content">
            <div class="detail-grid">
              <div class="detail-item">
                <dt>Nível</dt>
                <dd>
                  <span 
                    class="resource-status"
                    :class="getResourceClass(guild.resources.level)"
                  >
                    {{ guild.resources.level }}
                  </span>
                </dd>
              </div>
              
              <div 
                v-if="guild.resources.description"
                class="detail-item detail-item--full"
              >
                <dt>Descrição</dt>
                <dd>{{ guild.resources.description }}</dd>
              </div>
              
              <div 
                v-if="guild.resources.details?.length"
                class="detail-item detail-item--full"
              >
                <dt>Detalhes</dt>
                <dd>
                  <ul class="details-list">
                    <li
                      v-for="(detail, index) in guild.resources.details"
                      :key="index"
                    >
                      {{ detail }}
                    </li>
                  </ul>
                </dd>
              </div>
            </div>
          </div>
        </section>

        <!-- Visitantes -->
        <section class="guild-section">
          <h3 class="guild-section__title">
            <icon name="user-group" />
            Movimento de Visitantes
          </h3>
          
          <div class="guild-section__content">
            <div class="detail-grid">
              <div class="detail-item">
                <dt>Frequência</dt>
                <dd>
                  <span 
                    class="visitor-status"
                    :class="getVisitorClass(guild.visitors.frequency)"
                  >
                    {{ guild.visitors.frequency }}
                  </span>
                </dd>
              </div>
              
              <div 
                v-if="guild.visitors.description"
                class="detail-item detail-item--full"
              >
                <dt>Descrição</dt>
                <dd>{{ guild.visitors.description }}</dd>
              </div>
              
              <div 
                v-if="guild.visitors.types?.length"
                class="detail-item detail-item--full"
              >
                <dt>Tipos de Visitantes</dt>
                <dd>
                  <div class="visitor-types">
                    <span
                      v-for="(type, index) in guild.visitors.types"
                      :key="index"
                      class="visitor-type-tag"
                    >
                      {{ type }}
                    </span>
                  </div>
                </dd>
              </div>
            </div>
          </div>
        </section>

        <!-- Informações Avançadas (Logs de Geração) -->
        <section 
          v-if="showAdvancedInfo && generationLogs.length"
          class="guild-section guild-section--advanced"
        >
          <h3 class="guild-section__title">
            <icon name="document-text" />
            Logs de Geração
          </h3>
          
          <div class="guild-section__content">
            <div class="logs-container">
              <div
                v-for="(log, index) in generationLogs"
                :key="index"
                class="log-entry"
                :class="getLogClass(log)"
              >
                {{ log }}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { Guild } from '@/types/guild';
import { RelationLevel, ResourceLevel, VisitorLevel } from '@/types/guild';
import GuildInfoCard from './GuildInfoCard.vue';

interface Props {
  readonly guild: Guild;
  readonly readonly?: boolean;
  readonly isRegenerating?: boolean;
  readonly showAdvanced?: boolean;
  readonly generationLogs?: readonly string[];
}

withDefaults(defineProps<Props>(), {
  readonly: false,
  isRegenerating: false,
  showAdvanced: true,
  generationLogs: () => [],
});

defineEmits<{
  'guild:edit': [];
  'guild:regenerate': [];
  'guild:export': [];
}>();

// Estado local
const showAdvancedInfo = ref(false);

// Métodos para toggling
function toggleAdvanced(): void {
  showAdvancedInfo.value = !showAdvancedInfo.value;
}

// Classes de estilo baseadas nos valores
function getRelationClass(relation: RelationLevel): string {
  if (relation.includes('Péssima') || relation.includes('puro ódio')) {
    return 'relation-status--terrible';
  }
  if (relation.includes('Ruim')) {
    return 'relation-status--bad';
  }
  if (relation.includes('Diplomática') || relation.includes('dividida')) {
    return 'relation-status--neutral';
  }
  if (relation.includes('Boa')) {
    return 'relation-status--good';
  }
  if (relation.includes('Muito boa') || relation.includes('Excelente')) {
    return 'relation-status--excellent';
  }
  return 'relation-status--neutral';
}

function getResourceClass(level: ResourceLevel): string {
  if (level.includes('débito') || level === ResourceLevel.NENHUM) {
    return 'resource-status--critical';
  }
  if (level.includes('Escassos')) {
    return 'resource-status--poor';
  }
  if (level === ResourceLevel.LIMITADOS) {
    return 'resource-status--limited';
  }
  if (level === ResourceLevel.SUFICIENTES) {
    return 'resource-status--good';
  }
  if (level.includes('Abundantes') || level.includes('Excedentes')) {
    return 'resource-status--excellent';
  }
  return 'resource-status--neutral';
}

function getVisitorClass(level: VisitorLevel): string {
  if (level === VisitorLevel.VAZIA || level === VisitorLevel.QUASE_DESERTA) {
    return 'visitor-status--empty';
  }
  if (level === VisitorLevel.POUCO_MOVIMENTADA) {
    return 'visitor-status--low';
  }
  if (level === VisitorLevel.NEM_MUITO_NEM_POUCO) {
    return 'visitor-status--normal';
  }
  if (level === VisitorLevel.MUITO_FREQUENTADA) {
    return 'visitor-status--high';
  }
  if (level === VisitorLevel.ABARROTADA || level === VisitorLevel.LOTADA) {
    return 'visitor-status--crowded';
  }
  return 'visitor-status--neutral';
}

function getLogClass(log: string): string {
  if (log.includes('[ERROR]') || log.includes('failed')) {
    return 'log-entry--error';
  }
  if (log.includes('[WARNING]')) {
    return 'log-entry--warning';
  }
  if (log.includes('[PHASE]')) {
    return 'log-entry--phase';
  }
  if (log.includes('[ROLL]')) {
    return 'log-entry--roll';
  }
  return 'log-entry--info';
}
</script>

<style scoped>
.guild-details {
  @apply space-y-6;
}

.guild-details__header {
  @apply w-full;
}

.guild-actions {
  @apply flex items-center gap-2;
}

.guild-details__content {
  @apply w-full;
}

.guild-sections {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-6;
}

.guild-section {
  @apply bg-gray-800 rounded-lg border border-gray-700 overflow-hidden;
}

.guild-section--advanced {
  @apply lg:col-span-2;
}

.guild-section__title {
  @apply flex items-center gap-2 px-4 py-3 bg-gray-750 border-b border-gray-700 text-sm font-semibold text-amber-400;
}

.guild-section__content {
  @apply p-4;
}

.detail-grid {
  @apply grid grid-cols-1 md:grid-cols-2 gap-4;
}

.detail-item {
  @apply space-y-1;
}

.detail-item--full {
  @apply md:col-span-2;
}

.detail-item dt {
  @apply text-xs font-medium text-gray-400 uppercase tracking-wider;
}

.detail-item dd {
  @apply text-sm text-white;
}

.characteristics-list {
  @apply space-y-2;
}

.characteristic-item {
  @apply p-2 bg-gray-700 rounded text-gray-300;
}

.details-list {
  @apply space-y-1 text-gray-300;
}

.visitor-types {
  @apply flex flex-wrap gap-2;
}

.visitor-type-tag {
  @apply px-2 py-1 bg-blue-900 text-blue-300 rounded text-xs;
}

/* Status classes */
.relation-status,
.resource-status,
.visitor-status {
  @apply font-medium;
}

.relation-status--terrible {
  @apply text-red-400;
}

.relation-status--bad {
  @apply text-orange-400;
}

.relation-status--neutral {
  @apply text-yellow-400;
}

.relation-status--good {
  @apply text-green-400;
}

.relation-status--excellent {
  @apply text-emerald-400;
}

.resource-status--critical {
  @apply text-red-400;
}

.resource-status--poor {
  @apply text-orange-400;
}

.resource-status--limited {
  @apply text-yellow-400;
}

.resource-status--good {
  @apply text-green-400;
}

.resource-status--excellent {
  @apply text-emerald-400;
}

.resource-status--neutral {
  @apply text-gray-400;
}

.visitor-status--empty {
  @apply text-red-400;
}

.visitor-status--low {
  @apply text-orange-400;
}

.visitor-status--normal {
  @apply text-green-400;
}

.visitor-status--high {
  @apply text-blue-400;
}

.visitor-status--crowded {
  @apply text-cyan-400;
}

.visitor-status--neutral {
  @apply text-gray-400;
}

/* Logs */
.logs-container {
  @apply bg-gray-900 rounded p-4 font-mono text-xs max-h-64 overflow-y-auto;
}

.log-entry {
  @apply py-1 border-b border-gray-800 last:border-b-0;
}

.log-entry--error {
  @apply text-red-400;
}

.log-entry--warning {
  @apply text-yellow-400;
}

.log-entry--phase {
  @apply text-blue-400 font-bold;
}

.log-entry--roll {
  @apply text-green-400;
}

.log-entry--info {
  @apply text-gray-400;
}

/* Buttons */
.btn {
  @apply inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors;
}

.btn--primary {
  @apply bg-blue-600 text-white hover:bg-blue-500;
}

.btn--secondary {
  @apply bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600;
}

.btn--ghost {
  @apply text-gray-400 hover:text-white hover:bg-gray-700;
}

.btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
