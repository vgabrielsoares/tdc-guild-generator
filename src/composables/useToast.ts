interface ToastOptions {
  type?: ToastType;
  title: string;
  message?: string;
  duration?: number;
}
import { useToastStore, ToastType } from "@/stores/toast";

export function useToast() {
  const toastStore = useToastStore();

  function show({
    type = ToastType.INFO,
    title,
    message,
    duration,
  }: ToastOptions) {
    toastStore.showToast({ type, title, message, duration });
  }

  function success(title: string, message?: string, duration?: number) {
    show({ type: ToastType.SUCCESS, title, message, duration });
  }

  function error(title: string, message?: string, duration?: number) {
    show({ type: ToastType.ERROR, title, message, duration });
  }

  function info(title: string, message?: string, duration?: number) {
    show({ type: ToastType.INFO, title, message, duration });
  }

  function warning(title: string, message?: string, duration?: number) {
    show({ type: ToastType.WARNING, title, message, duration });
  }

  return { show, success, error, info, warning };
}
