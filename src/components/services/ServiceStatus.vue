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
      return "bg-blue-100 text-blue-800 border border-blue-200";
    case ServiceStatus.ACEITO:
      return "bg-amber-100 text-amber-800 border border-amber-200";
    case ServiceStatus.EM_ANDAMENTO:
      return "bg-indigo-100 text-indigo-800 border border-indigo-200";
    case ServiceStatus.CONCLUIDO:
      return "bg-green-100 text-green-800 border border-green-200";
    case ServiceStatus.FALHOU:
      return "bg-red-100 text-red-800 border border-red-200";
    case ServiceStatus.EXPIRADO:
      return "bg-orange-100 text-orange-800 border border-orange-200";
    case ServiceStatus.ANULADO:
      return "bg-gray-100 text-gray-800 border border-gray-200";
    case ServiceStatus.RESOLVIDO_POR_OUTROS:
      return "bg-purple-100 text-purple-800 border border-purple-200";
    case ServiceStatus.ACEITO_POR_OUTROS:
      return "bg-cyan-100 text-cyan-800 border border-cyan-200";
    case ServiceStatus.QUEBRADO:
      return "bg-pink-100 text-pink-800 border border-pink-200";
    default:
      return "bg-gray-100 text-gray-800 border border-gray-200";
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
