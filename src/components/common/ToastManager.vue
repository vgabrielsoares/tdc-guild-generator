<template>
  <div class="toast-container">
    <transition-group name="toast" tag="div">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'toast',
          `toast-${toast.type}`,
          { 'toast-dismissible': toast.dismissible }
        ]"
      >
        <div class="toast-content">
          <component 
            :is="getToastIcon(toast.type)" 
            class="toast-icon"
          />
          <span class="toast-message">{{ toast.message }}</span>
        </div>
        <button
          v-if="toast.dismissible"
          @click="removeToast(toast.id)"
          class="toast-close"
          type="button"
        >
          <XMarkIcon class="w-4 h-4" />
        </button>
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { 
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XMarkIcon
} from '@heroicons/vue/24/solid';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  dismissible?: boolean;
}

const toasts = ref<Toast[]>([]);

const getToastIcon = (type: Toast['type']) => {
  const icons = {
    success: CheckCircleIcon,
    error: ExclamationCircleIcon,
    warning: ExclamationTriangleIcon,
    info: InformationCircleIcon
  };
  return icons[type];
};

const addToast = (toast: Omit<Toast, 'id'>) => {
  const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  const newToast: Toast = {
    id,
    dismissible: true,
    duration: 4000,
    ...toast
  };
  
  toasts.value.push(newToast);
  
  if (newToast.duration && newToast.duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, newToast.duration);
  }
};

const removeToast = (id: string) => {
  const index = toasts.value.findIndex(toast => toast.id === id);
  if (index > -1) {
    toasts.value.splice(index, 1);
  }
};

const clearToasts = () => {
  toasts.value = [];
};

// Event listeners para toasts globais
const handleToastEvent = (event: CustomEvent<Omit<Toast, 'id'>>) => {
  addToast(event.detail);
};

onMounted(() => {
  window.addEventListener('show-toast', handleToastEvent as EventListener);
});

onUnmounted(() => {
  window.removeEventListener('show-toast', handleToastEvent as EventListener);
});

defineExpose({
  addToast,
  removeToast,
  clearToasts
});
</script>

<style scoped>
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 400px;
}

.toast {
  @apply bg-gray-800 border rounded-lg shadow-lg mb-3 p-4 flex items-start justify-between;
  min-width: 300px;
  animation: slideIn 0.3s ease-out;
}

.toast-success {
  @apply border-green-500 bg-green-900/20;
}

.toast-error {
  @apply border-red-500 bg-red-900/20;
}

.toast-warning {
  @apply border-yellow-500 bg-yellow-900/20;
}

.toast-info {
  @apply border-blue-500 bg-blue-900/20;
}

.toast-content {
  @apply flex items-center gap-3 flex-1;
}

.toast-icon {
  @apply w-5 h-5 flex-shrink-0;
}

.toast-success .toast-icon {
  @apply text-green-400;
}

.toast-error .toast-icon {
  @apply text-red-400;
}

.toast-warning .toast-icon {
  @apply text-yellow-400;
}

.toast-info .toast-icon {
  @apply text-blue-400;
}

.toast-message {
  @apply text-white font-medium;
}

.toast-close {
  @apply text-gray-400 hover:text-white ml-4 p-1 rounded transition-colors;
}

.toast-close:hover {
  @apply bg-gray-700;
}

/* Transições */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
</style>
