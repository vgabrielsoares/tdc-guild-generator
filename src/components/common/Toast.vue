<template>
  <div
    class="fixed inset-x-0 top-4 z-50 flex flex-col items-center space-y-2 pointer-events-none"
    aria-live="assertive"
  >
    <TransitionGroup name="toast-fade" tag="div">
      <template v-for="toast in toasts" :key="toast.id">
        <div
          :class="[
            'w-full max-w-xs rounded-lg shadow-lg px-4 py-3 flex items-center gap-3 pointer-events-auto relative group',
            toastTypeClass(toast.type)
          ]"
          role="status"
          tabindex="0"
          @mouseenter="pauseToast(toast.id)"
          @mouseleave="resumeToast(toast.id)"
          @focus="pauseToast(toast.id)"
          @blur="resumeToast(toast.id)"
          @mousedown="pauseToast(toast.id)"
          @mouseup="resumeToast(toast.id)"
        >
          <span class="font-semibold">{{ toast.title }}</span>
          <span v-if="toast.message" class="text-sm">{{ toast.message }}</span>
          <button
            class="ml-auto text-gray-300 hover:text-white focus:outline-none transition-colors duration-200"
            @click="removeToast(toast.id)"
            aria-label="Fechar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <!-- Barra de progresso -->
          <div class="absolute left-0 bottom-0 h-1 w-full bg-gray-300/30 rounded-b-lg overflow-hidden">
            <div
              class="h-full transition-all duration-100 linear"
              :style="{ width: getToastProgress(toast.id) + '%', background: toastTypeBarColor(toast.type) }"
            ></div>
          </div>
        </div>
      </template>
    </TransitionGroup>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useToastStore, ToastType } from '../../stores/toast';
import { watch, onUnmounted } from 'vue';

const { toasts } = storeToRefs(useToastStore());
const { removeToast } = useToastStore();

// Map de timeouts para cada toast
interface ToastTimeout {
  timeout: ReturnType<typeof setTimeout>;
  remaining: number;
  start: number;
  paused: boolean;
}

import { ref, onMounted } from 'vue';
const progressUpdate = ref(0);

function updateProgressLoop() {
  progressUpdate.value = Date.now();
  requestAnimationFrame(updateProgressLoop);
}

onMounted(() => {
  updateProgressLoop();
});

const getToastProgress = (id: string): number => {
  // progressUpdate é usado apenas para forçar reatividade
  void progressUpdate.value;
  const t = toastTimeouts.get(id);
  if (!t) return 100;
  const toast = toasts.value.find(toast => toast.id === id);
  const duration = toast?.duration ?? 3500;
  // O tempo restante real do toast
  const remaining = t.paused ? t.remaining : Math.max(0, t.remaining - (Date.now() - t.start));
  return Math.max(0, Math.min(100, (remaining / duration) * 100));
};

const toastTypeBarColor = (type: ToastType) => {
  switch (type) {
    case ToastType.SUCCESS:
      return '#22c55e'; // green-500
    case ToastType.ERROR:
      return '#ef4444'; // red-500
    case ToastType.INFO:
      return '#3b82f6'; // blue-500
    case ToastType.WARNING:
      return '#eab308'; // yellow-500
    default:
      return '#a3a3a3'; // gray-400
  }
};

const toastTimeouts = new Map<string, ToastTimeout>();

function clearToastTimeout(id: string) {
  const t = toastTimeouts.get(id);
  if (t) {
    clearTimeout(t.timeout);
    toastTimeouts.delete(id);
  }
}

import type { Toast } from '../../stores/toast';
function setToastTimeout(toast: Toast) {
  clearToastTimeout(toast.id);
  const duration = toast.duration ?? 3500;
  const timeoutObj = {
    timeout: setTimeout(() => removeToast(toast.id), duration),
    remaining: duration,
    start: Date.now(),
    paused: false,
  };
  toastTimeouts.set(toast.id, timeoutObj);
}

function pauseToast(id: string) {
  const t = toastTimeouts.get(id);
  if (t && !t.paused) {
    const elapsed = Date.now() - t.start;
    t.remaining = Math.max(0, t.remaining - elapsed);
    clearTimeout(t.timeout);
    t.paused = true;
  }
}

function resumeToast(id: string) {
  const t = toastTimeouts.get(id);
  if (t && t.paused && t.remaining > 0) {
    t.start = Date.now();
    t.timeout = setTimeout(() => removeToast(id), t.remaining);
    t.paused = false;
  }
}

// Gerenciar timeouts ao adicionar/remover toasts
watch(
  toasts,
  (newToasts, oldToasts) => {
    // Adiciona timeout para novos toasts
    for (const toast of newToasts) {
      if (!toastTimeouts.has(toast.id)) {
        setToastTimeout(toast);
      }
    }
    // Remove timeouts de toasts removidos
    for (const toast of oldToasts) {
      if (!newToasts.find((t: Toast) => t.id === toast.id)) {
        clearToastTimeout(toast.id);
      }
    }
  },
  { deep: true }
);

onUnmounted(() => {
  for (const { timeout } of toastTimeouts.values()) {
    clearTimeout(timeout);
  }
  toastTimeouts.clear();
});

function toastTypeClass(type: ToastType) {
  switch (type) {
    case ToastType.SUCCESS:
      return 'bg-green-900/90 text-green-100 border border-green-700';
    case ToastType.ERROR:
      return 'bg-red-900/90 text-red-100 border border-red-700';
    case ToastType.INFO:
      return 'bg-blue-900/90 text-blue-100 border border-blue-700';
    case ToastType.WARNING:
      return 'bg-yellow-900/90 text-yellow-100 border border-yellow-700';
    default:
      return 'bg-gray-800/90 text-gray-100 border border-gray-600';
  }
}
</script>

<style scoped>
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.4,0,0.2,1), transform 0.3s cubic-bezier(0.4,0,0.2,1);
}
.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-16px) scale(0.96);
}
.toast-fade-enter-to,
.toast-fade-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
</style>
