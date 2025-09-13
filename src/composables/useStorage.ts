// Storage composable
import { ref, watch, onUnmounted } from "vue";
import { useStorageAdapter } from "@/composables/useStorageAdapter";

// Generic composable for reactive storage using the pluggable adapter
export function useStorage<T>(key: string, defaultValue: T) {
  const adapter = useStorageAdapter();
  const STORE = "settings"; // generic store for key/value entries

  const data = ref<T>(defaultValue);

  // debounce timer for async saves
  let saveTimer: ReturnType<typeof setTimeout> | null = null;

  async function load() {
    try {
      const stored = await adapter.get<T>(STORE, key);
      if (stored !== null && stored !== undefined) {
        data.value = stored as T;
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[useStorage] load failed", e);
    }
  }

  // initial load (async, won't block composable creation)
  void load();

  // Auto-save with small debounce when data changes
  watch(
    data,
    (newValue) => {
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(async () => {
        try {
          await adapter.put<T>(STORE, key, newValue as T);
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error("[useStorage] save failed", e);
        }
        saveTimer = null;
      }, 200);
    },
    { deep: true }
  );

  onUnmounted(() => {
    if (saveTimer) clearTimeout(saveTimer);
  });

  async function reset() {
    data.value = defaultValue;
    try {
      await adapter.del(STORE, key);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("[useStorage] reset failed", e);
    }
  }

  return {
    data,
    reset,
    load,
  };
}
