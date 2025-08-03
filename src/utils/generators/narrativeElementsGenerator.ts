/**
 * Gerador de Elementos Narrativos Avançados para Contratos
 *
 * Este arquivo implementa geradores para elementos narrativos mais complexos:
 * - Contratantes Inusitados
 * - Palavras-chave Temáticas
 * - Utilitários para criatividade narrativa
 *
 * Baseado nas seções "Contratantes Inusitados" e "Palavras-chave Temáticas"
 */

import { rollOnTable } from "@/utils/tableRoller";
import type { UnusualContractor, ThemeKeyword } from "@/types/contract";
import { ThemeKeywordSet } from "@/types/contract";
import {
  UNUSUAL_CONTRACTOR_CHANCE_TABLE,
  UNUSUAL_CONTRACTORS_TABLE,
  ALL_THEME_TABLES,
  ALL_CONTRACTOR_KEYWORD_TABLES,
} from "@/data/tables/contract-themes-tables";

/**
 * Gera um contratante inusitado conforme as regras do arquivo base
 *
 * Processo:
 * 1. Testa se o contratante será inusitado (1d20, apenas 1 = Sim)
 * 2. Se for inusitado, rola na tabela de 100 contratantes únicos
 * 3. Sempre gera palavras-chave temáticas para inspiração criativa
 *
 * As palavras-chave são sempre geradas e cabe ao usuário decidir como integrá-las.
 *
 * @returns Contratante inusitado ou indicação de contratante normal
 */
export function generateUnusualContractor(): UnusualContractor {
  // 1. Testar excentricidade (1d20, apenas 1 = Sim)
  const chanceResult = rollOnTable(
    UNUSUAL_CONTRACTOR_CHANCE_TABLE,
    [],
    "Teste de Excentricidade"
  );
  const isUnusual = chanceResult.result;

  if (!isUnusual) {
    // Mesmo contratantes comuns recebem palavras-chave para inspiração
    const themeKeywords = generateContractorThemeKeywords();
    
    return {
      isUnusual: false,
      description: "Contratante comum - use as tabelas padrão de contratantes.",
      themeKeywords,
    };
  }

  // 2. Gerar contratante inusitado (1d100)
  const contractorResult = rollOnTable(
    UNUSUAL_CONTRACTORS_TABLE,
    [],
    "Contratante Inusitado"
  );
  const description = contractorResult.result;

  // 3. Sempre gerar palavras-chave para criatividade
  const themeKeywords = generateContractorThemeKeywords();

  return {
    isUnusual: true,
    description,
    themeKeywords,
  };
}

/**
 * Gera palavras-chave temáticas para contratos conforme as regras
 *
 * Processo conforme arquivo base:
 * - Rola 1d6-1 para determinar quantas palavras-chave usar (0-5)
 * - Para cada palavra-chave, seleciona uma tabela temática aleatória
 * - Rola 1d20 na tabela selecionada
 *
 * @returns Array de palavras-chave temáticas
 */
export function generateThemeKeywords(): ThemeKeyword[] {
  // Rolar 1d6-1 para quantidade de palavras-chave (0-5)
  const quantity = Math.max(0, Math.floor(Math.random() * 6)); // 0-5

  if (quantity === 0) {
    return [];
  }

  const keywords: ThemeKeyword[] = [];

  for (let i = 0; i < quantity; i++) {
    // Selecionar tabela temática aleatória
    const tableIndex = Math.floor(Math.random() * ALL_THEME_TABLES.length);
    const selectedTable = ALL_THEME_TABLES[tableIndex];

    // Mapear índice da tabela para enum correto
    const themeSetMap = [
      ThemeKeywordSet.MACABRO,     // Tabela 1
      ThemeKeywordSet.GUERRA,      // Tabela 2
      ThemeKeywordSet.FANTASIA,    // Tabela 3
      ThemeKeywordSet.STEAMPUNK,   // Tabela 4
      ThemeKeywordSet.MASMORRAS,   // Tabela 5
      ThemeKeywordSet.POLITICA,    // Tabela 6
    ];

    // Rolar na tabela selecionada
    const keywordResult = rollOnTable(
      selectedTable,
      [],
      `Palavra-chave Temática ${i + 1}`
    );

    keywords.push({
      set: themeSetMap[tableIndex],
      keyword: keywordResult.result as string,
    });
  }

  return keywords;
}

/**
 * Gera palavras-chave específicas para criatividade de contratantes
 *
 * Conforme dica do arquivo base: "role 1d6 palavras aleatórias de diferentes tabelas
 * e tente incorporá-las criativamente ao contratante"
 *
 * @returns Array de 1d6 palavras-chave de diferentes conjuntos
 */
export function generateContractorThemeKeywords(): ThemeKeyword[] {
  // Rolar 1d6 para quantidade de palavras-chave
  const quantity = Math.floor(Math.random() * 6) + 1; // 1-6

  const keywords: ThemeKeyword[] = [];
  const usedTables = new Set<number>(); // Para garantir tabelas diferentes

  for (let i = 0; i < quantity; i++) {
    // Selecionar tabela que ainda não foi usada
    let tableIndex: number;
    let attempts = 0;
    do {
      tableIndex = Math.floor(Math.random() * ALL_CONTRACTOR_KEYWORD_TABLES.length);
      attempts++;
    } while (usedTables.has(tableIndex) && attempts < 10);

    usedTables.add(tableIndex);
    const selectedTable = ALL_CONTRACTOR_KEYWORD_TABLES[tableIndex];

    // Mapear índice da tabela para enum (usando os mesmos para simplificar)
    const contractorSetMap = [
      ThemeKeywordSet.MACABRO,     // Conjunto 1
      ThemeKeywordSet.GUERRA,      // Conjunto 2
      ThemeKeywordSet.FANTASIA,    // Conjunto 3
      ThemeKeywordSet.STEAMPUNK,   // Conjunto 4
      ThemeKeywordSet.MASMORRAS,   // Conjunto 5
      ThemeKeywordSet.POLITICA,    // Conjunto 6
    ];

    // Rolar na tabela selecionada
    const keywordResult = rollOnTable(
      selectedTable,
      [],
      `Palavra-chave Contratante ${i + 1}`
    );

    keywords.push({
      set: contractorSetMap[tableIndex],
      keyword: keywordResult.result as string,
    });
  }

  return keywords;
}

/**
 * Gera uma combinação completa de elementos narrativos avançados
 *
 * Útil para criar contratos com máxima criatividade narrativa,
 * combinando contratantes inusitados, palavras-chave temáticas
 * e outras inspirações criativas.
 *
 * @returns Objeto com todos os elementos narrativos gerados
 */
export function generateAdvancedNarrativeElements() {
  const unusualContractor = generateUnusualContractor();
  const themeKeywords = generateThemeKeywords();
  const contractorKeywords = generateContractorThemeKeywords();

  return {
    unusualContractor,
    themeKeywords,
    contractorKeywords,
    creativityTips: [
      "Use as palavras-chave para inspirar características únicas do contratante",
      "Combine elementos das diferentes tabelas para criar situações inesperadas",
      "Considere como as palavras-chave podem influenciar objetivos e complicações",
      "Use os elementos para criar reviravoltas mais ricas e conectadas",
    ],
  };
}

/**
 * Utilitário para incorporar palavras-chave em descrições
 *
 * Ajuda a integrar palavras-chave temáticas de forma criativa
 * nas descrições de contratos, contratantes e elementos narrativos.
 *
 * @param keywords - Palavras-chave para incorporar
 * @returns Sugestões de como integrar as palavras-chave
 */
export function suggestKeywordIntegration(
  keywords: ThemeKeyword[]
): string[] {
  if (keywords.length === 0) {
    return ["Nenhuma palavra-chave para integrar."];
  }

  const suggestions: string[] = [];

  keywords.forEach((keyword, index) => {
    suggestions.push(
      `${index + 1}. Considere incorporar "${keyword.keyword}" através de:`
    );
    suggestions.push(`   - Características físicas ou visuais`);
    suggestions.push(`   - Motivações ou histórico pessoal`);
    suggestions.push(`   - Objetos, locais ou elementos do ambiente`);
    suggestions.push(`   - Maneirismos ou forma de falar`);
    suggestions.push("");
  });

  return suggestions;
}
