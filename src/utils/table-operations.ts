/**
 * Utilitários para operações com tabelas de RPG
 * Funções reutilizáveis para lookup e validação de tabelas
 */

import type { TableEntry } from "@/types/tables";

/**
 * Busca um valor em uma tabela baseado no roll
 * @param table - Tabela para buscar
 * @param roll - Valor do dado rolado
 * @returns Resultado da tabela ou null se não encontrado
 */
export function findTableEntry<T>(
  table: TableEntry<T>[],
  roll: number
): T | null {
  const entry = table.find((entry) => roll >= entry.min && roll <= entry.max);
  return entry ? entry.result : null;
}

/**
 * Busca um valor em uma tabela com fallback para o mais próximo
 * @param table - Tabela para buscar
 * @param value - Valor para buscar
 * @returns Resultado da tabela (sempre retorna um valor)
 */
export function lookupTableValue<T>(table: TableEntry<T>[], value: number): T {
  const matchingEntry = table.find(
    (entry) => value >= entry.min && value <= entry.max
  );

  if (matchingEntry) {
    return matchingEntry.result;
  }

  // Fallback: encontrar a entrada mais próxima
  const closest = table.reduce((prev, curr) => {
    const prevDistance = Math.min(
      Math.abs(prev.min - value),
      Math.abs(prev.max - value)
    );
    const currDistance = Math.min(
      Math.abs(curr.min - value),
      Math.abs(curr.max - value)
    );
    return currDistance < prevDistance ? curr : prev;
  });

  return closest.result;
}

/**
 * Valida se uma tabela tem cobertura completa de probabilidades
 * @param table - Tabela para validar
 * @param expectedMax - Valor máximo esperado (ex: 20 para d20)
 * @returns true se a tabela tem cobertura completa
 */
export function validateTableCoverage<T>(
  table: TableEntry<T>[],
  expectedMax: number
): boolean {
  if (!table.length) return false;

  // Ordenar por min para verificação sequencial
  const sortedTable = [...table].sort((a, b) => a.min - b.min);

  // Verificar se começa em 1
  if (sortedTable[0].min !== 1) return false;

  // Verificar se termina no máximo esperado
  if (sortedTable[sortedTable.length - 1].max !== expectedMax) return false;

  // Verificar se não há gaps
  for (let i = 0; i < sortedTable.length - 1; i++) {
    if (sortedTable[i].max + 1 !== sortedTable[i + 1].min) {
      return false;
    }
  }

  return true;
}

/**
 * Encontra overlaps em uma tabela
 * @param table - Tabela para verificar
 * @returns Array de overlaps encontrados
 */
export function findTableOverlaps<T>(table: TableEntry<T>[]): Array<{
  entry1: TableEntry<T>;
  entry2: TableEntry<T>;
  overlap: { min: number; max: number };
}> {
  const overlaps: Array<{
    entry1: TableEntry<T>;
    entry2: TableEntry<T>;
    overlap: { min: number; max: number };
  }> = [];

  for (let i = 0; i < table.length; i++) {
    for (let j = i + 1; j < table.length; j++) {
      const entry1 = table[i];
      const entry2 = table[j];

      const overlapMin = Math.max(entry1.min, entry2.min);
      const overlapMax = Math.min(entry1.max, entry2.max);

      if (overlapMin <= overlapMax) {
        overlaps.push({
          entry1,
          entry2,
          overlap: { min: overlapMin, max: overlapMax },
        });
      }
    }
  }

  return overlaps;
}

/**
 * Gera todas as combinações possíveis de uma tabela para testes
 * @param table - Tabela para gerar combinações
 * @returns Array com todos os valores possíveis e seus resultados
 */
export function generateTableTestCases<T>(table: TableEntry<T>[]): Array<{
  roll: number;
  result: T;
  entry: TableEntry<T>;
}> {
  const testCases: Array<{
    roll: number;
    result: T;
    entry: TableEntry<T>;
  }> = [];

  table.forEach((entry) => {
    // Testar valores de borda e meio
    const valuesToTest = [
      entry.min,
      entry.max,
      Math.floor((entry.min + entry.max) / 2),
    ].filter((value, index, array) => array.indexOf(value) === index); // Remove duplicatas

    valuesToTest.forEach((roll) => {
      testCases.push({
        roll,
        result: entry.result,
        entry,
      });
    });
  });

  return testCases.sort((a, b) => a.roll - b.roll);
}

/**
 * Calcula estatísticas de uma tabela
 * @param table - Tabela para analisar
 * @returns Estatísticas da tabela
 */
export function calculateTableStatistics<T>(table: TableEntry<T>[]): {
  totalEntries: number;
  totalRange: number;
  averageRangeSize: number;
  resultFrequency: Map<T, number>;
  coverage: { min: number; max: number };
} {
  const resultFrequency = new Map<T, number>();
  let minValue = Infinity;
  let maxValue = -Infinity;
  let totalRangeSize = 0;

  table.forEach((entry) => {
    // Calcular frequência de resultados
    const currentCount = resultFrequency.get(entry.result) || 0;
    const rangeSize = entry.max - entry.min + 1;
    resultFrequency.set(entry.result, currentCount + rangeSize);

    // Calcular limites
    minValue = Math.min(minValue, entry.min);
    maxValue = Math.max(maxValue, entry.max);
    totalRangeSize += rangeSize;
  });

  return {
    totalEntries: table.length,
    totalRange: maxValue - minValue + 1,
    averageRangeSize: totalRangeSize / table.length,
    resultFrequency,
    coverage: { min: minValue, max: maxValue },
  };
}
