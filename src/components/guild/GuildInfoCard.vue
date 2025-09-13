<!--
  Componente base para exibir informações básicas da guilda
  Reutilizável e tipado seguindo as melhores práticas
-->
<template>
  <div class="guild-info-card">
    <div class="guild-info-card__header">
      <div class="guild-info-card__title-section">
        <h3 class="guild-info-card__title">
          {{ guild.name }}
        </h3>
        <div class="guild-info-card__badges">
          <div
            v-if="showBadge"
            class="guild-info-card__badge"
            :class="badgeClasses"
          >
            {{ guild.settlementType }}
          </div>
          <div
            v-if="guild.structure.isHeadquarters"
            class="guild-info-card__badge guild-info-card__badge--headquarters"
          >
            <svg
              class="inline-block w-3 h-3 mr-1"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
              />
            </svg>
            Sede Matriz
          </div>
        </div>
      </div>

      <div v-if="showActions" class="guild-info-card__actions">
        <slot name="actions">
          <button
            @click="$emit('guild:edit')"
            class="btn btn--small btn--secondary"
            :disabled="readonly"
          >
            <icon name="edit" size="sm" />
            <span>Editar</span>
          </button>
        </slot>
      </div>
    </div>

    <div class="guild-info-card__content">
      <div class="guild-info-grid">
        <!-- Estrutura -->
        <div class="guild-info-grid__item">
          <dt class="guild-info-grid__label">Tamanho</dt>
          <dd class="guild-info-grid__value">{{ guild.structure.size }}</dd>
        </div>

        <!-- Recursos -->
        <div class="guild-info-grid__item">
          <dt class="guild-info-grid__label">Recursos</dt>
          <dd class="guild-info-grid__value">
            <span
              class="resource-level"
              :class="getResourceLevelClass(guild.resources.level)"
            >
              {{ guild.resources.level }}
            </span>
          </dd>
        </div>

        <!-- Visitantes -->
        <div class="guild-info-grid__item">
          <dt class="guild-info-grid__label">Frequência</dt>
          <dd class="guild-info-grid__value">
            <span
              class="visitor-level"
              :class="getVisitorLevelClass(guild.visitors.frequency)"
            >
              {{ guild.visitors.frequency }}
            </span>
          </dd>
        </div>

        <!-- Características (se houver espaço) -->
        <div
          v-if="showCharacteristics && guild.structure.characteristics.length"
          class="guild-info-grid__item guild-info-grid__item--full"
        >
          <dt class="guild-info-grid__label">Características</dt>
          <dd class="guild-info-grid__value">
            <div class="characteristics-list">
              <span
                v-for="(characteristic, index) in guild.structure
                  .characteristics"
                :key="index"
                class="characteristic-tag"
              >
                {{ characteristic }}
              </span>
            </div>
          </dd>
        </div>
      </div>

      <!-- Slot para conteúdo adicional -->
      <div v-if="$slots.extra" class="guild-info-card__extra">
        <slot name="extra"></slot>
      </div>
    </div>

    <!-- Footer com metadados -->
    <div v-if="showMetadata" class="guild-info-card__footer">
      <div class="guild-metadata">
        <span class="guild-metadata__item">
          <icon name="calendar" size="xs" />
          Criada: {{ formatDate(guild.createdAt) }}
        </span>
        <span v-if="guild.updatedAt" class="guild-metadata__item">
          <icon name="clock" size="xs" />
          Atualizada: {{ formatDate(guild.updatedAt) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { Guild } from "@/types/guild";
import { ResourceLevel, VisitorLevel } from "@/types/guild";

// Interface para props
interface Props {
  readonly guild: Guild;
  readonly showBadge?: boolean;
  readonly showActions?: boolean;
  readonly showCharacteristics?: boolean;
  readonly showMetadata?: boolean;
  readonly readonly?: boolean;
  readonly compact?: boolean;
}

// Props com defaults
const props = withDefaults(defineProps<Props>(), {
  showBadge: true,
  showActions: true,
  showCharacteristics: true,
  showMetadata: false,
  readonly: false,
  compact: false,
});

// Emits tipados
defineEmits<{
  "guild:edit": [];
  "guild:view": [];
  "guild:delete": [];
}>();

// Classes computadas para o badge
const badgeClasses = computed(() => ({
  "guild-info-card__badge--lugarejo": props.guild.settlementType === "Lugarejo",
  "guild-info-card__badge--povoado": props.guild.settlementType === "Povoado",
  "guild-info-card__badge--aldeia": props.guild.settlementType === "Aldeia",
  "guild-info-card__badge--vilarejo": props.guild.settlementType === "Vilarejo",
  "guild-info-card__badge--vila-grande":
    props.guild.settlementType === "Vila Grande",
  "guild-info-card__badge--cidadela": props.guild.settlementType === "Cidadela",
  "guild-info-card__badge--grande":
    props.guild.settlementType === "Cidade Grande",
  "guild-info-card__badge--metropole":
    props.guild.settlementType === "Metrópole",
}));

// Classes para nível de recursos
function getResourceLevelClass(level: ResourceLevel): string {
  const classes: Record<ResourceLevel, string> = {
    [ResourceLevel.EM_DEBITO]: "resource-level--critical",
    [ResourceLevel.NENHUM]: "resource-level--critical",
    [ResourceLevel.ESCASSOS]: "resource-level--poor",
    [ResourceLevel.ESCASSOS_HONESTOS]: "resource-level--poor",
    [ResourceLevel.LIMITADOS]: "resource-level--limited",
    [ResourceLevel.SUFICIENTES]: "resource-level--good",
    [ResourceLevel.EXCEDENTES]: "resource-level--excellent",
    [ResourceLevel.EXCEDENTES_MALIGNOS]: "resource-level--warning",
    [ResourceLevel.ABUNDANTES_GOVERNO]: "resource-level--government",
    [ResourceLevel.ABUNDANTES]: "resource-level--excellent",
    [ResourceLevel.ABUNDANTES_SERVICO]: "resource-level--excellent",
  };

  return classes[level] || "resource-level--neutral";
}

// Classes para nível de visitantes
function getVisitorLevelClass(level: VisitorLevel): string {
  const classes: Record<VisitorLevel, string> = {
    [VisitorLevel.VAZIA]: "visitor-level--empty",
    [VisitorLevel.QUASE_DESERTA]: "visitor-level--very-low",
    [VisitorLevel.POUCO_MOVIMENTADA]: "visitor-level--low",
    [VisitorLevel.NEM_MUITO_NEM_POUCO]: "visitor-level--normal",
    [VisitorLevel.MUITO_FREQUENTADA]: "visitor-level--high",
    [VisitorLevel.ABARROTADA]: "visitor-level--very-high",
    [VisitorLevel.LOTADA]: "visitor-level--crowded",
  };

  return classes[level] || "visitor-level--neutral";
}

// Formatação de data
function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}
</script>

<style scoped>
.guild-info-card {
  @apply bg-gray-800 rounded-lg border border-gray-700 overflow-hidden;
}

.guild-info-card__header {
  @apply p-4 border-b border-gray-700 flex items-start justify-between;
}

.guild-info-card__title-section {
  @apply flex items-start gap-3 flex-1;
}

.guild-info-card__title {
  @apply text-lg font-semibold text-amber-400 leading-tight;
}

.guild-info-card__badge {
  @apply px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap;
}

.guild-info-card__badge--lugarejo {
  @apply bg-gray-700 text-gray-300;
}

.guild-info-card__badge--aldeia {
  @apply bg-green-900 text-green-300;
}

.guild-info-card__badge--pequena {
  @apply bg-blue-900 text-blue-300;
}

.guild-info-card__badge--grande {
  @apply bg-cyan-900 text-cyan-300;
}

.guild-info-card__badge--metropole {
  @apply bg-amber-900 text-amber-300;
}

.guild-info-card__badge--headquarters {
  @apply bg-gradient-to-r from-yellow-600 to-amber-600 text-yellow-100 font-bold shadow-lg border border-yellow-500;
}

.guild-info-card__badges {
  @apply flex flex-wrap gap-2;
}

.guild-info-card__actions {
  @apply flex items-center gap-2;
}

.guild-info-card__content {
  @apply p-4;
}

.guild-info-grid {
  @apply grid grid-cols-1 sm:grid-cols-3 gap-3;
}

.guild-info-grid__item {
  @apply space-y-1;
}

.guild-info-grid__item--full {
  @apply sm:col-span-3;
}

.guild-info-grid__label {
  @apply text-xs font-medium text-gray-400 uppercase tracking-wider;
}

.guild-info-grid__value {
  @apply text-sm text-white font-medium;
}

.characteristics-list {
  @apply flex flex-wrap gap-1;
}

.characteristic-tag {
  @apply inline-block px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded;
}

.guild-info-card__extra {
  @apply mt-4 pt-4 border-t border-gray-700;
}

.guild-info-card__footer {
  @apply px-4 py-3 bg-gray-750 border-t border-gray-700;
}

.guild-metadata {
  @apply flex items-center gap-4 text-xs text-gray-400;
}

.guild-metadata__item {
  @apply flex items-center gap-1;
}

/* Resource level styles */
.resource-level--critical {
  @apply text-red-400;
}

.resource-level--poor {
  @apply text-orange-400;
}

.resource-level--limited {
  @apply text-yellow-400;
}

.resource-level--good {
  @apply text-green-400;
}

.resource-level--excellent {
  @apply text-emerald-400;
}

.resource-level--warning {
  @apply text-amber-400;
}

.resource-level--government {
  @apply text-blue-400;
}

.resource-level--neutral {
  @apply text-gray-400;
}

/* Visitor level styles */
.visitor-level--empty,
.visitor-level--very-low {
  @apply text-red-400;
}

.visitor-level--low {
  @apply text-orange-400;
}

.visitor-level--normal {
  @apply text-green-400;
}

.visitor-level--high,
.visitor-level--very-high {
  @apply text-blue-400;
}

.visitor-level--crowded {
  @apply text-cyan-400;
}

.visitor-level--neutral {
  @apply text-gray-400;
}

/* Utilities */
.btn {
  @apply inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors;
}

.btn--small {
  @apply px-2 py-1 text-xs;
}

.btn--secondary {
  @apply bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600 hover:text-white;
}

.btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}
</style>
