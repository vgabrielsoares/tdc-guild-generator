<template>
  <span
    :class="[
      'inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
      statusClass,
      sizeClass,
    ]"
  >
    <component :is="statusIcon" :class="iconSize" />
    {{ statusLabel }}
  </span>
</template>

<script setup lang="ts">
import { computed } from "vue";
import {
  CheckCircleIcon,
  ClockIcon,
  PlayCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  UserIcon,
  StopCircleIcon,
} from "@heroicons/vue/24/outline";
import { ServiceStatus } from "@/types/service";

interface Props {
  status: ServiceStatus;
  size?: "sm" | "md" | "lg";
}

const props = withDefaults(defineProps<Props>(), {
  size: "md",
});

const statusLabel = computed(() => {
  switch (props.status) {
    case ServiceStatus.DISPONIVEL:
      return "Disponível";
    case ServiceStatus.ACEITO:
      return "Aceito";
    case ServiceStatus.EM_ANDAMENTO:
      return "Em andamento";
    case ServiceStatus.CONCLUIDO:
      return "Concluído";
    case ServiceStatus.FALHOU:
      return "Falhou";
    case ServiceStatus.EXPIRADO:
      return "Expirado";
    case ServiceStatus.ANULADO:
      return "Anulado";
    case ServiceStatus.RESOLVIDO_POR_OUTROS:
      return "Resolvido por outros";
    case ServiceStatus.ACEITO_POR_OUTROS:
      return "Aceito por outros";
    case ServiceStatus.QUEBRADO:
      return "Quebrado";
    default:
      return "Desconhecido";
  }
});

const statusIcon = computed(() => {
  switch (props.status) {
    case ServiceStatus.DISPONIVEL:
      return InformationCircleIcon;
    case ServiceStatus.ACEITO:
      return ClockIcon;
    case ServiceStatus.EM_ANDAMENTO:
      return PlayCircleIcon;
    case ServiceStatus.CONCLUIDO:
      return CheckCircleIcon;
    case ServiceStatus.FALHOU:
      return XCircleIcon;
    case ServiceStatus.EXPIRADO:
      return ExclamationTriangleIcon;
    case ServiceStatus.ANULADO:
      return StopCircleIcon;
    case ServiceStatus.RESOLVIDO_POR_OUTROS:
      return UserIcon;
    case ServiceStatus.ACEITO_POR_OUTROS:
      return UserIcon;
    case ServiceStatus.QUEBRADO:
      return ExclamationTriangleIcon;
    default:
      return InformationCircleIcon;
  }
});

const statusClass = computed(() => {
  switch (props.status) {
    case ServiceStatus.DISPONIVEL:
      return "bg-blue-900/30 text-blue-300 border border-blue-600/50";
    case ServiceStatus.ACEITO:
      return "bg-amber-900/30 text-amber-300 border border-amber-600/50";
    case ServiceStatus.EM_ANDAMENTO:
      return "bg-indigo-900/30 text-indigo-300 border border-indigo-600/50";
    case ServiceStatus.CONCLUIDO:
      return "bg-green-900/30 text-green-300 border border-green-600/50";
    case ServiceStatus.FALHOU:
      return "bg-red-900/30 text-red-300 border border-red-600/50";
    case ServiceStatus.EXPIRADO:
      return "bg-orange-900/30 text-orange-300 border border-orange-600/50";
    case ServiceStatus.ANULADO:
      return "bg-gray-900/30 text-gray-300 border border-gray-600/50";
    case ServiceStatus.RESOLVIDO_POR_OUTROS:
      return "bg-purple-900/30 text-purple-300 border border-purple-600/50";
    case ServiceStatus.ACEITO_POR_OUTROS:
      return "bg-cyan-900/30 text-cyan-300 border border-cyan-600/50";
    case ServiceStatus.QUEBRADO:
      return "bg-pink-900/30 text-pink-300 border border-pink-600/50";
    default:
      return "bg-gray-900/30 text-gray-300 border border-gray-600/50";
  }
});

const sizeClass = computed(() => {
  switch (props.size) {
    case "sm":
      return "text-xs px-2 py-0.5";
    case "md":
      return "text-sm px-2 py-1";
    case "lg":
      return "text-base px-3 py-1.5";
    default:
      return "text-sm px-2 py-1";
  }
});

const iconSize = computed(() => {
  switch (props.size) {
    case "sm":
      return "w-3 h-3";
    case "md":
      return "w-4 h-4";
    case "lg":
      return "w-5 h-5";
    default:
      return "w-4 h-4";
  }
});
</script>
