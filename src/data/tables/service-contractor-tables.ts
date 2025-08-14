/**
 * Implementação das tabelas para determinação de contratantes
 */

import type { TableEntry } from "@/types/tables";
import { ServiceContractorType } from "@/types/service";

// ===== TABELA PRINCIPAL DE CONTRATANTES =====

/**
 * Tabela para determinar o tipo de contratante do serviço
 * Baseada na seção "Contratante do Serviço"
 *
 * Rolagem: 1d20
 * Modificadores: Aplicar modificadores de relação após a rolagem
 */
export const SERVICE_CONTRACTOR_TABLE: TableEntry<ServiceContractorType>[] = [
  { min: 1, max: 6, result: ServiceContractorType.POVO },
  { min: 7, max: 14, result: ServiceContractorType.INSTITUICAO_OFICIO },
  { min: 15, max: 20, result: ServiceContractorType.GOVERNO },
];

// ===== TIPOS DE CONTRATANTES ESPECÍFICOS DO GOVERNO =====

/**
 * Enum para contratantes específicos do governo
 * Implementado conforme tabela "Contratante do Governo"
 */
export enum ServiceGovernmentContractorType {
  ARCANISTA_DIPLOMATA = "Arcanista diplomata",
  MEMBRO_CLERO = "Membro importante do clero",
  NOBRE_PODEROSO = "Nobre poderoso",
  CIRCULO_FAMILIAR = "Círculo familiar dos governantes",
  AGENTE_BUROCRATICO = "Agente burocrático",
  MILITAR_ALTO_ESCALAO = "Militar de alto escalão",
  GOVERNO_OUTRO_ASSENTAMENTO = "Membro do governo de outro assentamento",
  LIDER_LOCAL = "Líder local",
}

/**
 * Tabela para determinar contratante específico do governo
 * Usar apenas quando o contratante principal for GOVERNO
 *
 * Rolagem: 1d20
 */
export const SERVICE_GOVERNMENT_CONTRACTOR_TABLE: TableEntry<ServiceGovernmentContractorType>[] =
  [
    {
      min: 1,
      max: 2,
      result: ServiceGovernmentContractorType.ARCANISTA_DIPLOMATA,
    },
    { min: 3, max: 5, result: ServiceGovernmentContractorType.MEMBRO_CLERO },
    { min: 6, max: 10, result: ServiceGovernmentContractorType.NOBRE_PODEROSO },
    {
      min: 11,
      max: 15,
      result: ServiceGovernmentContractorType.CIRCULO_FAMILIAR,
    },
    {
      min: 16,
      max: 16,
      result: ServiceGovernmentContractorType.AGENTE_BUROCRATICO,
    },
    {
      min: 17,
      max: 17,
      result: ServiceGovernmentContractorType.MILITAR_ALTO_ESCALAO,
    },
    {
      min: 18,
      max: 19,
      result: ServiceGovernmentContractorType.GOVERNO_OUTRO_ASSENTAMENTO,
    },
    { min: 20, max: 20, result: ServiceGovernmentContractorType.LIDER_LOCAL },
  ];

// ===== MODIFICADORES POR RELAÇÃO =====

/**
 * Enum para níveis de relação com população local
 * Baseado no sistema de relações da guilda
 */
export enum PopulationRelationLevel {
  PESSIMA = "péssima",
  RUIM = "ruim",
  DIVIDIDA = "dividida",
  BOA = "boa",
  MUITO_BOA = "muito boa",
  EXCELENTE = "excelente",
}

/**
 * Enum para níveis de relação com governo local
 * Baseado no sistema de relações da guilda
 */
export enum GovernmentRelationLevel {
  PESSIMA = "péssima",
  RUIM = "ruim",
  DIPLOMATICA = "diplomática",
  BOA = "boa",
  MUITO_BOA = "muito boa",
  EXCELENTE = "excelente",
}

/**
 * Tabela de modificadores por relação com a população local para serviços
 * Aplicar APÓS a rolagem do contratante principal
 *
 */
export const SERVICE_POPULATION_RELATION_MODIFIERS: Record<
  PopulationRelationLevel,
  number
> = {
  [PopulationRelationLevel.PESSIMA]: +4,
  [PopulationRelationLevel.RUIM]: +2,
  [PopulationRelationLevel.DIVIDIDA]: 0,
  [PopulationRelationLevel.BOA]: -1,
  [PopulationRelationLevel.MUITO_BOA]: -2,
  [PopulationRelationLevel.EXCELENTE]: -5,
};

/**
 * Tabela de modificadores por relação com o governo local para serviços
 * Aplicar APÓS a rolagem do contratante principal
 *
 */
export const SERVICE_GOVERNMENT_RELATION_MODIFIERS: Record<
  GovernmentRelationLevel,
  number
> = {
  [GovernmentRelationLevel.PESSIMA]: -4,
  [GovernmentRelationLevel.RUIM]: -2,
  [GovernmentRelationLevel.DIPLOMATICA]: 0,
  [GovernmentRelationLevel.BOA]: +1,
  [GovernmentRelationLevel.MUITO_BOA]: +2,
  [GovernmentRelationLevel.EXCELENTE]: +5,
};

// ===== FUNÇÕES UTILITÁRIAS =====

/**
 * Interface para configuração de modificadores de relação
 */
export interface ServiceContractorModifiers {
  populationRelation: PopulationRelationLevel;
  governmentRelation: GovernmentRelationLevel;
}

/**
 * Aplica modificadores de relação ao resultado da rolagem de contratante
 *
 * @param baseRoll - Resultado original da rolagem (1-20)
 * @param modifiers - Modificadores de relação a aplicar
 * @returns Resultado final modificado
 *
 * @example
 * ```typescript
 * const roll = 10;
 * const modifiers = {
 *   populationRelation: PopulationRelationLevel.BOA,    // -1
 *   governmentRelation: GovernmentRelationLevel.PESSIMA // -4
 * };
 * const finalRoll = applyContractorModifiers(roll, modifiers); // 5
 * ```
 */
export function applyContractorModifiers(
  baseRoll: number,
  modifiers: ServiceContractorModifiers
): number {
  const populationModifier =
    SERVICE_POPULATION_RELATION_MODIFIERS[modifiers.populationRelation];
  const governmentModifier =
    SERVICE_GOVERNMENT_RELATION_MODIFIERS[modifiers.governmentRelation];

  return baseRoll + populationModifier + governmentModifier;
}

/**
 * Determina o tipo de contratante aplicando modificadores e validando ranges
 *
 * @param baseRoll - Resultado original da rolagem (1-20)
 * @param modifiers - Modificadores de relação a aplicar
 * @returns Tipo de contratante final
 *
 * @example
 * ```typescript
 * const contractor = determineServiceContractor(15, {
 *   populationRelation: PopulationRelationLevel.BOA,
 *   governmentRelation: GovernmentRelationLevel.EXCELENTE
 * });
 * // roll 15 + (-1) + (+5) = 19 → GOVERNO
 * ```
 */
export function determineServiceContractor(
  baseRoll: number,
  modifiers: ServiceContractorModifiers
): ServiceContractorType {
  const finalRoll = applyContractorModifiers(baseRoll, modifiers);

  // Aplicar limites da tabela (1-20+)
  const clampedRoll = Math.max(1, finalRoll);

  // Buscar na tabela
  for (const entry of SERVICE_CONTRACTOR_TABLE) {
    if (clampedRoll >= entry.min && clampedRoll <= entry.max) {
      return entry.result;
    }
  }

  // Fallback para valores acima de 20 (governo)
  return ServiceContractorType.GOVERNO;
}

/**
 * Mapeia string de relação com população para enum
 *
 * @param relation - String da relação conforme guilda
 * @returns Enum correspondente
 */
export function mapPopulationRelation(
  relation: string
): PopulationRelationLevel {
  const mapping: Record<string, PopulationRelationLevel> = {
    péssima: PopulationRelationLevel.PESSIMA,
    ruim: PopulationRelationLevel.RUIM,
    dividida: PopulationRelationLevel.DIVIDIDA,
    boa: PopulationRelationLevel.BOA,
    "muito boa": PopulationRelationLevel.MUITO_BOA,
    excelente: PopulationRelationLevel.EXCELENTE,
  };

  return mapping[relation.toLowerCase()] || PopulationRelationLevel.DIVIDIDA;
}

/**
 * Mapeia string de relação com governo para enum
 *
 * @param relation - String da relação conforme guilda
 * @returns Enum correspondente
 */
export function mapGovernmentRelation(
  relation: string
): GovernmentRelationLevel {
  const mapping: Record<string, GovernmentRelationLevel> = {
    péssima: GovernmentRelationLevel.PESSIMA,
    ruim: GovernmentRelationLevel.RUIM,
    diplomática: GovernmentRelationLevel.DIPLOMATICA,
    boa: GovernmentRelationLevel.BOA,
    "muito boa": GovernmentRelationLevel.MUITO_BOA,
    excelente: GovernmentRelationLevel.EXCELENTE,
  };

  return mapping[relation.toLowerCase()] || GovernmentRelationLevel.DIPLOMATICA;
}

/**
 * Valida se todas as tabelas estão corretamente estruturadas
 * Útil para testes e verificação de integridade
 */
export function validateServiceContractorTables(): boolean {
  // Verificar cobertura completa da tabela principal (1-20)
  const mainTableCoverage = new Set<number>();

  for (const entry of SERVICE_CONTRACTOR_TABLE) {
    for (let i = entry.min; i <= entry.max; i++) {
      mainTableCoverage.add(i);
    }
  }

  const hasFullCoverage = Array.from({ length: 20 }, (_, i) => i + 1).every(
    (num) => mainTableCoverage.has(num)
  );

  // Verificar tabela de governo (1-20)
  const govTableCoverage = new Set<number>();

  for (const entry of SERVICE_GOVERNMENT_CONTRACTOR_TABLE) {
    for (let i = entry.min; i <= entry.max; i++) {
      govTableCoverage.add(i);
    }
  }

  const hasGovCoverage = Array.from({ length: 20 }, (_, i) => i + 1).every(
    (num) => govTableCoverage.has(num)
  );

  return hasFullCoverage && hasGovCoverage;
}
