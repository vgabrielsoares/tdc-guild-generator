/**
 * Gerador de Complicações e Reviravoltas para Contratos
 *
 * Este arquivo implementa as regras de Complicações e Reviravoltas
 * - Complicações: Tipo (1d20) + Detalhamento específico da categoria
 * - Reviravoltas: Chance (1d20, 19-20 = Sim) + Elementos ("Quem?", "Na verdade...", "Mas...")
 * - Tratamento de "Role duas vezes e use ambos"
 */

import { rollOnTable } from "@/utils/dice";
import type { Complication, Twist } from "@/types/contract";
import {
  COMPLICATION_TYPES_TABLE,
  COMPLICATION_DETAIL_TABLES,
  TWIST_CHANCE_TABLE,
  TWIST_WHO_TABLE,
  TWIST_WHAT_TABLE,
  TWIST_BUT_TABLE,
} from "@/data/tables/contract-complications-tables";
import {
  TWIST_AND_FIRST_TABLE,
  TWIST_AND_SECOND_TABLE,
} from "@/data/tables/contract-twist-tables";

/**
 * Gera uma complicação aleatória
 *
 * Processo:
 * 1. Rola 1d20 na tabela de tipos de complicações
 * 2. Rola 1d20 na tabela de detalhamento da categoria específica
 * 3. Trata caso especial "Role duas vezes e use ambos"
 *
 * @returns Complicação gerada com categoria e detalhamento específico
 */
export function generateComplication(): Complication {
  // 1. Rolar o tipo de complicação (1d20)
  const categoryResult = rollOnTable({
    table: COMPLICATION_TYPES_TABLE,
    context: "Tipo de Complicação",
  });
  const category = categoryResult.result;

  // 2. Rolar o detalhamento específico da categoria
  const detailTable = COMPLICATION_DETAIL_TABLES[category];
  const detailResult = rollOnTable({
    table: detailTable,
    context: `Detalhamento ${category}`,
  });
  let specificDetail = detailResult.result;

  // 3. Tratar caso especial "Role duas vezes e use ambos"
  if (specificDetail === "Role duas vezes e use ambos") {
    const firstRoll = rollOnTable({
      table: detailTable,
      context: `Detalhamento ${category} - Primeira rolagem`,
    });
    const secondRoll = rollOnTable({
      table: detailTable,
      context: `Detalhamento ${category} - Segunda rolagem`,
    });

    // Evitar recursão infinita se as duas rolagens também derem "role duas vezes"
    const firstDetail =
      firstRoll.result === "Role duas vezes e use ambos"
        ? getAlternativeResult(detailTable)
        : firstRoll.result;

    const secondDetail =
      secondRoll.result === "Role duas vezes e use ambos"
        ? getAlternativeResult(detailTable)
        : secondRoll.result;

    specificDetail = `${firstDetail} E ${secondDetail}`;
  }

  // 4. Montar resultado conforme especificação
  const description = `${category}: ${specificDetail}`;

  return {
    category,
    specificDetail,
    description,
  };
}

/**
 * Gera uma reviravolta conforme especificado no arquivo base
 *
 * Implementa o sistema de reviravoltas incluindo:
 * - Chance de reviravolta (1d20, apenas 19-20 = Sim)
 * - Elementos obrigatórios: "Quem?", "Na verdade...", "Mas...", "E..." (primeira e segunda tabela)
 *
 * @returns Reviravolta gerada ou indicação de que não há reviravolta
 */
export function generateTwist(): Twist {
  // 1. Verificar se haverá reviravolta (1d20, apenas 19-20 = Sim)
  const chanceResult = rollOnTable({
    table: TWIST_CHANCE_TABLE,
    context: "Chance de Reviravolta",
  });
  const hasTwist = chanceResult.result;

  if (!hasTwist) {
    return {
      hasTwist: false,
      description: "Não há reviravoltas neste contrato.",
    };
  }

  // 2. Gerar elementos da reviravolta conforme tabelas do arquivo base
  const whoResult = rollOnTable({
    table: TWIST_WHO_TABLE,
    context: "Quem na Reviravolta",
  });
  const whatResult = rollOnTable({
    table: TWIST_WHAT_TABLE,
    context: "Na verdade...",
  });
  const butResult = rollOnTable({
    table: TWIST_BUT_TABLE,
    context: "Mas...",
  });

  const who = whoResult.result;
  const what = whatResult.result;
  const but = butResult.result;

  // 3. Gerar elementos "E..."
  const andFirstResult = rollOnTable({
    table: TWIST_AND_FIRST_TABLE,
    context: "E... (primeira tabela)",
  });
  const andFirst = andFirstResult.result;

  const andSecondResult = rollOnTable({
    table: TWIST_AND_SECOND_TABLE,
    context: "E... (segunda tabela)",
  });
  const andSecond = andSecondResult.result;

  // 4. Montar descrição completa com todos os elementos
  const description = `REVIRAVOLTA: ${who} ${what.toLowerCase()}, mas ${but.toLowerCase()}. E ${andFirst.toLowerCase()}. E ${andSecond.toLowerCase()}.`;

  return {
    hasTwist: true,
    who,
    what,
    but,
    andFirst,
    andSecond,
    description,
  };
}

/**
 * Obtém um resultado alternativo da tabela para evitar "Role duas vezes" recursivo
 *
 * @param table - Tabela para rolar resultado alternativo
 * @returns Resultado que não seja "Role duas vezes"
 */
function getAlternativeResult(
  table: Array<{ min: number; max: number; result: string }>
): string {
  // Filtra resultados que não sejam "Role duas vezes"
  const validEntries = table.filter(
    (entry) => !entry.result.includes("Role duas vezes")
  );

  if (validEntries.length === 0) {
    return "Complicação indefinida";
  }

  // Pega um resultado aleatório dos válidos
  const randomIndex = Math.floor(Math.random() * validEntries.length);
  return validEntries[randomIndex].result;
}
