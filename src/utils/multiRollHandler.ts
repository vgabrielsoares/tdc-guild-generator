/**
 * Utilitário para lidar com rolagens múltiplas em tabelas
 * Permite recursão teórica infinita mas evita repetir opções que não sejam "rolar duas vezes"
 */

import type { TableEntry } from "@/types/tables";
import { rollOnTable } from "@/utils/tableRoller";

/**
 * Tipo para objetos que podem ter uma descrição
 */
type DescribableObject = {
  description: string;
} & Record<string, unknown>;

/**
 * Configuração para o comportamento de rolagens múltiplas
 */
export interface MultiRollConfig<T> {
  /** Tabela para rolar */
  table: TableEntry<T>[];
  /** Função que determina se deve rolar novamente */
  shouldRollAgain: (result: T) => boolean;
  /** Contexto para logs/debug */
  context?: string;
  /** Máximo de resultados únicos para coletar (padrão: todos os não-roll-again da tabela) */
  maxUniqueResults?: number;
}

/**
 * Resultado de múltiplas rolagens
 */
export interface MultiRollResult<T> {
  /** Resultados únicos obtidos (excluindo "rolar duas vezes") */
  results: T[];
  /** Quantas vezes a opção "rolar duas vezes" foi rolada */
  rollAgainCount: number;
  /** Total de rolagens realizadas */
  totalRolls: number;
  /** Descrição combinada dos resultados */
  combinedDescription: string;
}

/**
 * Executa múltiplas rolagens quando "Role duas vezes e use ambos" é obtido
 *
 * Lógica:
 * 1. Rola na tabela
 * 2. Se for "rolar duas vezes": incrementa contador e faz UMA rolagem adicional
 * 3. Se não for "rolar duas vezes": adiciona aos resultados únicos
 * 4. Para quando não há mais rolagens pendentes
 *
 * @param config Configuração da rolagem múltipla
 * @returns Resultado com todos os valores únicos coletados
 */
export function handleMultipleRolls<T>(
  config: MultiRollConfig<T>
): MultiRollResult<T> {
  const {
    table,
    shouldRollAgain,
    context = "Multi-roll",
    maxUniqueResults = 19,
  } = config;

  const collectedResults = new Set<T>();
  let rollAgainCount = 0;
  let totalRolls = 0;
  let pendingRolls = 1; // Começa com uma rolagem para fazer

  while (pendingRolls > 0 && collectedResults.size < maxUniqueResults) {
    totalRolls++;
    pendingRolls--; // Consome uma rolagem pendente

    const rollResult = rollOnTable(
      table,
      [],
      `${context} - Rolagem ${totalRolls}`
    );

    if (shouldRollAgain(rollResult.result)) {
      // É "rolar duas vezes" - incrementa contador e agenda DUAS novas rolagens
      rollAgainCount++;
      pendingRolls += 2;

      // Proteção contra loop infinito teórico
      if (rollAgainCount > 50) {
        // eslint-disable-next-line no-console
        console.warn(
          `[MultiRollHandler] Limite de segurança atingido após ${rollAgainCount} rolagens "rolar duas vezes"`
        );
        break;
      }
    } else {
      // Resultado válido - adiciona ao conjunto se único
      collectedResults.add(rollResult.result);
    }
  }

  const results = Array.from(collectedResults);

  return {
    results,
    rollAgainCount,
    totalRolls,
    combinedDescription: formatCombinedResults(results, rollAgainCount),
  };
}

/**
 * Formata os resultados múltiplos em uma descrição legível
 */
function formatCombinedResults<T>(
  results: T[],
  rollAgainCount: number
): string {
  if (results.length === 0) {
    return rollAgainCount > 0
      ? `Rolou "${rollAgainCount}" vezes "rolar duas vezes" mas não obteve resultados únicos`
      : "Nenhum resultado obtido";
  }

  if (results.length === 1) {
    const result = results[0];
    // Se é um objeto com description, usar essa propriedade
    if (
      typeof result === "object" &&
      result !== null &&
      "description" in result
    ) {
      return (result as DescribableObject).description;
    }
    return String(result);
  }

  // Para múltiplos resultados, une com " E "
  const resultStrings = results.map((r) => {
    // Se é um objeto com description, usar essa propriedade
    if (typeof r === "object" && r !== null && "description" in r) {
      return (r as DescribableObject).description;
    }
    return String(r);
  });

  if (resultStrings.length === 2) {
    return `${resultStrings[0]} E ${resultStrings[1]}`;
  }

  // Para 3+ resultados: "A, B E C"
  const lastResult = resultStrings.pop();
  return `${resultStrings.join(", ")} E ${lastResult}`;
}

/**
 * Versão simplificada para casos onde só precisamos de texto combinado
 */
export function rollMultipleWithCombining<T>(
  table: TableEntry<T>[],
  shouldRollAgain: (result: T) => boolean,
  context?: string,
  maxResults?: number
): string {
  const result = handleMultipleRolls({
    table,
    shouldRollAgain,
    context,
    maxUniqueResults: maxResults,
  });

  return result.combinedDescription;
}

/**
 * Helper para criar função shouldRollAgain baseada em texto
 */
export function createTextBasedRollAgainChecker(triggerText: string) {
  return (result: unknown): boolean => {
    return String(result).includes(triggerText);
  };
}

/**
 * Helper para criar função shouldRollAgain baseada em propriedade boolean
 */
export function createBooleanBasedRollAgainChecker<
  T extends Record<string, unknown>,
>(property: keyof T) {
  return (result: T): boolean => {
    return Boolean(result[property]);
  };
}
