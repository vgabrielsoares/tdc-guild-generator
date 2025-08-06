/**
 * Utilitário para lidar com rolagens múltiplas em tabelas
 * Permite recursão teórica infinita mas evita repetir opções que não sejam "rolar duas vezes"
 */

import type { TableEntry } from '@/types/tables';
import { rollOnTable } from '@/utils/tableRoller';

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
 * Executa múltiplas rolagens permitindo recursão teórica infinita,
 * mas coletando apenas resultados únicos (não-repeat)
 * 
 * Lógica:
 * 1. Rola na tabela
 * 2. Se não for "rolar duas vezes", adiciona aos resultados (se único)
 * 3. Se for "rolar duas vezes", incrementa contador e rola novamente
 * 4. Continua até coletar todos os resultados únicos possíveis ou atingir limite
 * 
 * @param config Configuração da rolagem múltipla
 * @returns Resultado com todos os valores únicos coletados
 */
export function handleMultipleRolls<T>(config: MultiRollConfig<T>): MultiRollResult<T> {
  const { table, shouldRollAgain, context = 'Multi-roll', maxUniqueResults } = config;
  
  // Calcular quantos resultados únicos são possíveis (excluindo "rolar duas vezes")
  const uniqueNonRollAgainResults = table
    .map(entry => entry.result)
    .filter((result, index, array) => 
      !shouldRollAgain(result) && array.indexOf(result) === index
    );
  
  const maxPossibleUnique = maxUniqueResults || uniqueNonRollAgainResults.length;
  
  const collectedResults = new Set<T>();
  let rollAgainCount = 0;
  let totalRolls = 0;
  
  // Continua rolando até coletar todos os resultados únicos possíveis
  while (collectedResults.size < maxPossibleUnique) {
    totalRolls++;
    
    const rollResult = rollOnTable(table, [], `${context} - Rolagem ${totalRolls}`);
    
    if (shouldRollAgain(rollResult.result)) {
      // É "rolar duas vezes" - incrementa contador e continua
      rollAgainCount++;
      
      // Proteção contra loop infinito teórico (caso extremamente raro)
      if (rollAgainCount > 1000) {
        // eslint-disable-next-line no-console
        console.warn(`[MultiRollHandler] Limite de segurança atingido após ${rollAgainCount} rolagens "rolar duas vezes"`);
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
    combinedDescription: formatCombinedResults(results, rollAgainCount)
  };
}

/**
 * Formata os resultados múltiplos em uma descrição legível
 */
function formatCombinedResults<T>(results: T[], rollAgainCount: number): string {
  if (results.length === 0) {
    return rollAgainCount > 0 
      ? `Rolou "${rollAgainCount}" vezes "rolar duas vezes" mas não obteve resultados únicos` 
      : 'Nenhum resultado obtido';
  }
  
  if (results.length === 1) {
    const result = results[0];
    // Se é um objeto com description, usar essa propriedade
    if (typeof result === 'object' && result !== null && 'description' in result) {
      return (result as DescribableObject).description;
    }
    return String(result);
  }
  
  // Para múltiplos resultados, une com " E "
  const resultStrings = results.map(r => {
    // Se é um objeto com description, usar essa propriedade
    if (typeof r === 'object' && r !== null && 'description' in r) {
      return (r as DescribableObject).description;
    }
    return String(r);
  });
  
  if (resultStrings.length === 2) {
    return `${resultStrings[0]} E ${resultStrings[1]}`;
  }
  
  // Para 3+ resultados: "A, B E C"
  const lastResult = resultStrings.pop();
  return `${resultStrings.join(', ')} E ${lastResult}`;
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
    maxUniqueResults: maxResults
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
export function createBooleanBasedRollAgainChecker<T extends Record<string, unknown>>(
  property: keyof T
) {
  return (result: T): boolean => {
    return Boolean(result[property]);
  };
}
