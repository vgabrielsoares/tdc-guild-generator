/**
 * Utilitário para detecção de ambiente de execução
 * Centraliza a lógica de identificação de diferentes ambientes (Vitest, browser, etc.)
 */

/**
 * Detecta se está executando em ambiente de teste Vitest
 * Verifica múltiplas formas de detecção para garantir compatibilidade
 */
export function isVitestEnvironment(): boolean {
  try {
    // Verificação via process.env.VITEST
    if (typeof process !== "undefined") {
      const env = (process as unknown as { env?: Record<string, string> }).env;
      if (env && env.VITEST === "true") {
        return true;
      }
    }

    // Verificação via globalThis.__vitest
    if (typeof globalThis !== "undefined") {
      const vitest = (globalThis as unknown as { __vitest?: unknown }).__vitest;
      if (typeof vitest !== "undefined") {
        return true;
      }
    }

    return false;
  } catch {
    // Em caso de erro, assumir que não é ambiente de teste
    return false;
  }
}

/**
 * Detecta se está executando em ambiente browser
 */
export function isBrowserEnvironment(): boolean {
  try {
    return (
      typeof window !== "undefined" &&
      typeof document !== "undefined" &&
      typeof navigator !== "undefined"
    );
  } catch {
    return false;
  }
}

/**
 * Detecta se está executando em ambiente Node.js
 */
export function isNodeEnvironment(): boolean {
  try {
    return (
      typeof process !== "undefined" &&
      !!process.versions &&
      !!process.versions.node
    );
  } catch {
    return false;
  }
}

/**
 * Detecta se localStorage está disponível
 */
export function isLocalStorageAvailable(): boolean {
  try {
    return typeof localStorage !== "undefined" && localStorage !== null;
  } catch {
    return false;
  }
}

/**
 * Detecta se IndexedDB está disponível
 */
export function isIndexedDBAvailable(): boolean {
  try {
    return typeof indexedDB !== "undefined" && indexedDB !== null;
  } catch {
    return false;
  }
}

/**
 * Informações consolidadas sobre o ambiente de execução
 */
export interface EnvironmentInfo {
  isVitest: boolean;
  isBrowser: boolean;
  isNode: boolean;
  hasLocalStorage: boolean;
  hasIndexedDB: boolean;
}

/**
 * Retorna informações completas sobre o ambiente atual
 */
export function getEnvironmentInfo(): EnvironmentInfo {
  return {
    isVitest: isVitestEnvironment(),
    isBrowser: isBrowserEnvironment(),
    isNode: isNodeEnvironment(),
    hasLocalStorage: isLocalStorageAvailable(),
    hasIndexedDB: isIndexedDBAvailable(),
  };
}

/**
 * Detecta se deve executar inicialização automática
 * Usado por stores para evitar inicialização em ambiente de teste
 */
export function shouldAutoInitialize(): boolean {
  return !isVitestEnvironment();
}
