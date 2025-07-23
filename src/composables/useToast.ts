import { type Toast } from '@/components/common/ToastManager.vue';

export const useToast = () => {
  const showToast = (toast: Omit<Toast, 'id'>) => {
    const event = new CustomEvent('show-toast', { detail: toast });
    window.dispatchEvent(event);
  };

  const showSuccess = (message: string, duration?: number) => {
    showToast({ message, type: 'success', duration });
  };

  const showError = (message: string, duration?: number) => {
    showToast({ message, type: 'error', duration });
  };

  const showWarning = (message: string, duration?: number) => {
    showToast({ message, type: 'warning', duration });
  };

  const showInfo = (message: string, duration?: number) => {
    showToast({ message, type: 'info', duration });
  };

  return {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};
