<template>
  <span
    :class="[
      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors',
      statusClasses,
      sizeClasses
    ]"
  >
    <font-awesome-icon
      v-if="showIcon"
      :icon="statusIcon"
      :class="['mr-1', iconClasses]"
    />
    {{ statusLabel }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ContractStatus } from '@/types/contract';

interface Props {
  status: ContractStatus;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  size: 'md',
  showIcon: true
});

// ===== COMPUTED =====

const statusIcon = computed(() => {
  switch (props.status) {
    case ContractStatus.DISPONIVEL:
      return ['fas', 'clock'];
    case ContractStatus.ACEITO:
      return ['fas', 'handshake'];
    case ContractStatus.EM_ANDAMENTO:
      return ['fas', 'spinner'];
    case ContractStatus.CONCLUIDO:
      return ['fas', 'check-circle'];
    case ContractStatus.FALHOU:
      return ['fas', 'times-circle'];
    case ContractStatus.EXPIRADO:
      return ['fas', 'hourglass-end'];
    case ContractStatus.ANULADO:
      return ['fas', 'ban'];
    case ContractStatus.RESOLVIDO_POR_OUTROS:
      return ['fas', 'user-check'];
    case ContractStatus.QUEBRADO:
      return ['fas', 'exclamation-triangle'];
    default:
      return ['fas', 'question-circle'];
  }
});

const statusLabel = computed(() => {
  return props.status;
});

const statusClasses = computed(() => {
  switch (props.status) {
    case ContractStatus.DISPONIVEL:
      return 'bg-green-900/30 text-green-300 border border-green-500/30';
    case ContractStatus.ACEITO:
      return 'bg-blue-900/30 text-blue-300 border border-blue-500/30';
    case ContractStatus.EM_ANDAMENTO:
      return 'bg-yellow-900/30 text-yellow-300 border border-yellow-500/30';
    case ContractStatus.CONCLUIDO:
      return 'bg-green-900/50 text-green-200 border border-green-400/50';
    case ContractStatus.FALHOU:
      return 'bg-red-900/30 text-red-300 border border-red-500/30';
    case ContractStatus.EXPIRADO:
      return 'bg-orange-900/30 text-orange-300 border border-orange-500/30';
    case ContractStatus.ANULADO:
      return 'bg-gray-900/30 text-gray-400 border border-gray-500/30';
    case ContractStatus.RESOLVIDO_POR_OUTROS:
      return 'bg-purple-900/30 text-purple-300 border border-purple-500/30';
    case ContractStatus.QUEBRADO:
      return 'bg-red-900/50 text-red-200 border border-red-400/50';
    default:
      return 'bg-gray-900/30 text-gray-400 border border-gray-500/30';
  }
});

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'text-xs px-1 py-0.5';
    case 'sm':
      return 'text-xs px-2 py-1';
    case 'md':
      return 'text-sm px-3 py-1';
    case 'lg':
      return 'text-base px-4 py-2';
    default:
      return 'text-sm px-3 py-1';
  }
});

const iconClasses = computed(() => {
  if (props.status === ContractStatus.EM_ANDAMENTO) {
    return 'animate-spin';
  }
  return '';
});
</script>
