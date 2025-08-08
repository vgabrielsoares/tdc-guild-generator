<template>
  <span
    :class="[
      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors',
      statusClasses,
      sizeClasses
    ]"
  >
    <component
      v-if="showIcon"
      :is="statusIcon"
      :class="['w-3 h-3 mr-1', iconClasses]"
    />
    {{ statusLabel }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ContractStatus } from '@/types/contract';
import {
  ClockIcon,
  HandRaisedIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  NoSymbolIcon,
  UserIcon,
  ExclamationTriangleIcon,
  QuestionMarkCircleIcon,
  UsersIcon
} from '@heroicons/vue/24/outline';

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
      return ClockIcon;
    case ContractStatus.ACEITO:
      return HandRaisedIcon;
    case ContractStatus.EM_ANDAMENTO:
      return ArrowPathIcon;
    case ContractStatus.CONCLUIDO:
      return CheckCircleIcon;
    case ContractStatus.FALHOU:
      return XCircleIcon;
    case ContractStatus.EXPIRADO:
      return ClockIcon;
    case ContractStatus.ANULADO:
      return NoSymbolIcon;
    case ContractStatus.RESOLVIDO_POR_OUTROS:
      return UserIcon;
    case ContractStatus.ACEITO_POR_OUTROS:
      return UsersIcon;
    case ContractStatus.QUEBRADO:
      return ExclamationTriangleIcon;
    default:
      return QuestionMarkCircleIcon;
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
    case ContractStatus.ACEITO_POR_OUTROS:
      return 'bg-orange-900/40 text-orange-200 border border-orange-400/40';
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
