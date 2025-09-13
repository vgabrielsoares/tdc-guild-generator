// Funções utilitárias de storage
// Implementação básica para persistência de dados

/**
 * Serializa datas para localStorage
 */
function dateReplacer(_key: string, value: unknown): unknown {
  if (value instanceof Date) {
    return { __type: "Date", value: value.toISOString() };
  }
  return value;
}

/**
 * Deserializa datas do localStorage
 */
function dateReviver(_key: string, value: unknown): unknown {
  if (
    typeof value === "object" &&
    value !== null &&
    "__type" in value &&
    value.__type === "Date" &&
    "value" in value &&
    typeof value.value === "string"
  ) {
    return new Date(value.value);
  }
  return value;
}

/**
 * Salva dados no localStorage
 */
export function saveToStorage(key: string, data: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(data, dateReplacer));
    // eslint-disable-next-line no-console
    console.log("[STORAGE] Saved to storage:", key);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[STORAGE] Failed to save to storage:", error);
  }
}

/**
 * Carrega dados do localStorage
 */
export function loadFromStorage<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    if (item) {
      return JSON.parse(item, dateReviver) as T;
    }
    return null;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[STORAGE] Failed to load from storage:", error);
    return null;
  }
}

/**
 * Remove dados do localStorage
 */
export function removeFromStorage(key: string): void {
  try {
    localStorage.removeItem(key);
    // eslint-disable-next-line no-console
    console.log("[STORAGE] Removed from storage:", key);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("[STORAGE] Failed to remove from storage:", error);
  }
}

// Helpers exportados para os adapters reutilizarem a mesma lógica de serialização
export function serializeData(value: unknown): string {
  return JSON.stringify(value, dateReplacer);
}

export function deserializeData<T>(text: string): T {
  return JSON.parse(text, dateReviver) as T;
}
