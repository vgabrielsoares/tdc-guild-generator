import { defineStore } from 'pinia';
import { ref } from 'vue';
import { nanoid } from 'nanoid';


export enum ToastType {
  SUCCESS = 'success',
  ERROR = 'error',
  INFO = 'info',
  WARNING = 'warning',
}

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // ms
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([]);

  function showToast(toast: Omit<Toast, 'id'>) {
    const id = nanoid();
    const toastObj: Toast = { id, ...toast };
    toasts.value.push(toastObj);
    setTimeout(() => removeToast(id), toast.duration ?? 3500);
    return id;
  }

  function removeToast(id: string) {
    toasts.value = toasts.value.filter(t => t.id !== id);
  }

  return { toasts, showToast, removeToast };
});
