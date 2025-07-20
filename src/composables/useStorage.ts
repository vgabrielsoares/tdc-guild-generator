// Storage composable
import { ref, watch } from 'vue'
import { saveToStorage, loadFromStorage, removeFromStorage } from '@/utils/storage'

export function useStorage<T>(key: string, defaultValue: T) {
  const storedValue = loadFromStorage<T>(key)
  const data = ref<T>(storedValue ?? defaultValue)

  // Auto-save when data changes
  watch(
    data,
    (newValue) => {
      saveToStorage(key, newValue)
    },
    { deep: true }
  )

  const reset = () => {
    data.value = defaultValue
    removeFromStorage(key)
  }

  const load = () => {
    const stored = loadFromStorage<T>(key)
    if (stored !== null) {
      data.value = stored
    }
  }

  return {
    data,
    reset,
    load
  }
}
