// Utilitários de serialização para Storage Adapters
// Funções reutilizadas pelos adapters IndexedDB e LocalStorage para garantir consistência

/**
 * Serializa datas para armazenamento persistente
 * Usado pelos storage adapters para manter consistência na serialização
 */
function dateReplacer(_key: string, value: unknown): unknown {
  if (value instanceof Date) {
    return { __type: "Date", value: value.toISOString() };
  }
  return value;
}

/**
 * Deserializa datas do armazenamento persistente
 * Usado pelos storage adapters para manter consistência na deserialização
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

// ===== MIGRAÇÃO PARA STORAGE ADAPTERS =====
// O sistema usa uma arquitetura de storage adapters:
// - IndexedDB como storage principal (maior capacidade, melhor performance)
// - LocalStorage como fallback automático (compatibilidade universal)
// - Interface unificada através dos adapters para consistência

// Funções de serialização exportadas para reutilização pelos adapters
export function serializeData(value: unknown): string {
  return JSON.stringify(value, dateReplacer);
}

export function deserializeData<T>(text: string): T {
  return JSON.parse(text, dateReviver) as T;
}
