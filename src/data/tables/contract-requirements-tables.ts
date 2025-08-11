/**
 * Tabelas de Pré-requisitos e Cláusulas para Contratos da Guilda
 *
 * Seções: "Pré-requisitos e Cláusulas" e "Tipo de Pagamento"
 *
 * Implementa:
 * - Sistema de pré-requisitos baseado no valor do contrato
 * - Cláusulas adicionais que modificam a dificuldade
 * - Tipos de pagamento e forma de recebimento
 * - Modificadores dinâmicos baseados no resultado valor/recompensa
 */

import type { TableEntry } from "@/types/tables";

// ====================================
// TIPOS E ENUMS
// ====================================

export enum PrerequisiteType {
  NONE = "none",
  RENOWN = "renown",
  CASTER = "caster",
  SKILL = "skill",
  PROFICIENCY = "proficiency",
  VEHICLE = "vehicle",
  GROUP_SIZE = "group_size",
}

export enum ClauseType {
  NONE = "none",
  NO_KILLING = "no_killing",
  PROTECT_CREATURE = "protect_creature",
  TROPHY_REQUIRED = "trophy_required",
  STEALTH = "stealth",
  NO_MAGIC = "no_magic",
  COMPETITION = "competition",
  EXTERMINATE_SOURCE = "exterminate_source",
  SUPERVISOR = "supervisor",
  TIME_RESTRICTION = "time_restriction",
  REPORT_REQUIRED = "report_required",
  NO_TREASURE = "no_treasure",
  SECRET_IDENTITY = "secret_identity",
  ABSOLUTE_SECRECY = "absolute_secrecy",
}

export enum PaymentType {
  DIRECT_FROM_CONTRACTOR = "direct_from_contractor",
  HALF_GUILD_HALF_CONTRACTOR = "half_guild_half_contractor",
  HALF_GUILD_HALF_GOODS = "half_guild_half_goods",
  GOODS_AND_SERVICES = "goods_and_services",
  FULL_GUILD_PAYMENT = "full_guild_payment",
  FULL_GUILD_PLUS_SERVICES = "full_guild_plus_services",
}

export interface ContractPrerequisite {
  type: PrerequisiteType;
  description: string;
  value?: number; // Para renome, tamanho do grupo, etc.
  subtype?: string; // Para especificar tipo de perícia, proficiência, etc.
}

export interface ContractClause {
  type: ClauseType;
  description: string;
  rewardModifier: number; // +5 para cada pré-requisito/cláusula
}

export interface ContractPayment {
  type: PaymentType;
  description: string;
  guildPercentage: number; // Porcentagem paga pela guilda
  contractorPercentage: number; // Porcentagem paga pelo contratante
  includesGoods: boolean; // Se inclui bens/serviços
  includesServices: boolean; // Se inclui serviços adicionais
}

// ====================================
// FUNÇÕES AUXILIARES PARA DADOS
// ====================================

/**
 * Calcula o dado a ser usado para pré-requisitos baseado no resultado de valor
 * Baseado na tabela "Dados por Resultado de Valor e Recompensa: Pré-requisitos"
 */
export function getPrerequisiteDiceModifier(valueResult: number): number {
  if (valueResult <= 20) return -10;
  if (valueResult <= 40) return -5;
  if (valueResult <= 60) return 0;
  if (valueResult <= 80) return 5;
  if (valueResult <= 100) return 10;
  return 15; // 101+
}

/**
 * Calcula o dado a ser usado para cláusulas baseado no resultado de recompensa
 * Baseado na tabela "Dados por Resultado de Valor e Recompensa: Cláusulas Adicionais"
 */
export function getClauseDiceModifier(rewardResult: number): number {
  if (rewardResult <= 20) return -2;
  if (rewardResult <= 40) return -1;
  if (rewardResult <= 60) return 0;
  if (rewardResult <= 80) return 2;
  if (rewardResult <= 100) return 5;
  return 7; // 101+
}

/**
 * Calcula o dado a ser usado para tipo de pagamento baseado no resultado de valor/recompensa
 * Baseado na tabela "Dados por Resultado de Valor e Recompensa: Tipo de Pagamento"
 */
export function getPaymentDiceModifier(valueResult: number): number {
  if (valueResult <= 20) return -2;
  if (valueResult <= 40) return -1;
  if (valueResult <= 60) return 0;
  if (valueResult <= 80) return 2;
  if (valueResult <= 100) return 5;
  return 7; // 101+
}

// ====================================
// TABELAS DE PRÉ-REQUISITOS
// ====================================

/**
 * Tabela de Pré-requisitos de Contratos
 * Rolagem: 1d20 + modificador baseado no valor do contrato
 */
export const CONTRACT_PREREQUISITES_TABLE: TableEntry<ContractPrerequisite>[] =
  [
    // 1-5: Nenhum
    {
      min: 1,
      max: 5,
      result: {
        type: PrerequisiteType.NONE,
        description: "Nenhum",
      },
    },
    // 6: 5 de renome
    {
      min: 6,
      max: 6,
      result: {
        type: PrerequisiteType.RENOWN,
        description: "5 de renome",
        value: 5,
      },
    },
    // 7: Um conjurador
    {
      min: 7,
      max: 7,
      result: {
        type: PrerequisiteType.CASTER,
        description: "Um conjurador",
      },
    },
    // 8: Proficiência com um Instrumento de Habilidade
    {
      min: 8,
      max: 8,
      result: {
        type: PrerequisiteType.PROFICIENCY,
        description: "Proficiência com um Instrumento de Habilidade",
        subtype: "instrument",
      },
    },
    // 9: Perícia treinada que envolve Força
    {
      min: 9,
      max: 9,
      result: {
        type: PrerequisiteType.SKILL,
        description: "Perícia treinada que envolve Força",
        subtype: "strength",
      },
    },
    // 10: 10 de renome
    {
      min: 10,
      max: 10,
      result: {
        type: PrerequisiteType.RENOWN,
        description: "10 de renome",
        value: 10,
      },
    },
    // 11: Proficiência com um Idioma
    {
      min: 11,
      max: 11,
      result: {
        type: PrerequisiteType.PROFICIENCY,
        description: "Proficiência com um Idioma",
        subtype: "language",
      },
    },
    // 12: Perícia treinada que envolve Agilidade
    {
      min: 12,
      max: 12,
      result: {
        type: PrerequisiteType.SKILL,
        description: "Perícia treinada que envolve Agilidade",
        subtype: "agility",
      },
    },
    // 13: Veículo de carga (como um cavalo ou uma carroça)
    {
      min: 13,
      max: 13,
      result: {
        type: PrerequisiteType.VEHICLE,
        description: "Veículo de carga (como um cavalo ou uma carroça)",
      },
    },
    // 14: Perícia treinada que envolve Presença
    {
      min: 14,
      max: 14,
      result: {
        type: PrerequisiteType.SKILL,
        description: "Perícia treinada que envolve Presença",
        subtype: "presence",
      },
    },
    // 15: 15 de renome
    {
      min: 15,
      max: 15,
      result: {
        type: PrerequisiteType.RENOWN,
        description: "15 de renome",
        value: 15,
      },
    },
    // 16: Perícia treinada que envolve Mente
    {
      min: 16,
      max: 16,
      result: {
        type: PrerequisiteType.SKILL,
        description: "Perícia treinada que envolve Mente",
        subtype: "mind",
      },
    },
    // 17: Um conjurador arcano e um divino
    {
      min: 17,
      max: 17,
      result: {
        type: PrerequisiteType.CASTER,
        description: "Um conjurador arcano e um divino",
        subtype: "both_types",
      },
    },
    // 18: Perícia treinada que envolve Influência
    {
      min: 18,
      max: 18,
      result: {
        type: PrerequisiteType.SKILL,
        description: "Perícia treinada que envolve Influência",
        subtype: "influence",
      },
    },
    // 19: Grupo de no mínimo 6 membros
    {
      min: 19,
      max: 19,
      result: {
        type: PrerequisiteType.GROUP_SIZE,
        description: "Grupo de no mínimo 6 membros",
        value: 6,
      },
    },
    // 20: Ter 50 de renome
    {
      min: 20,
      max: 20,
      result: {
        type: PrerequisiteType.RENOWN,
        description: "Ter 50 de renome",
        value: 50,
      },
    },
    // 21+: Role duas vezes e use ambos - tratado na função de geração
  ];

// ====================================
// TABELAS DE CLÁUSULAS ADICIONAIS
// ====================================

/**
 * Tabela de Cláusulas Adicionais de Contratos
 * Rolagem: 1d20 + modificador baseado na recompensa do contrato
 * Cada cláusula adiciona +5 à recompensa
 */
export const CONTRACT_CLAUSES_TABLE: TableEntry<ContractClause>[] = [
  // 1-7: Nenhuma
  {
    min: 1,
    max: 7,
    result: {
      type: ClauseType.NONE,
      description: "Nenhuma",
      rewardModifier: 0,
    },
  },
  // 8: Nenhum inimigo deve ser morto
  {
    min: 8,
    max: 8,
    result: {
      type: ClauseType.NO_KILLING,
      description: "Nenhum inimigo deve ser morto",
      rewardModifier: 5,
    },
  },
  // 9: Uma criatura específica não pode ser ferida
  {
    min: 9,
    max: 9,
    result: {
      type: ClauseType.PROTECT_CREATURE,
      description: "Uma criatura específica não pode ser ferida",
      rewardModifier: 5,
    },
  },
  // 10: Um troféu é exigido
  {
    min: 10,
    max: 10,
    result: {
      type: ClauseType.TROPHY_REQUIRED,
      description: "Um troféu é exigido",
      rewardModifier: 5,
    },
  },
  // 11: O objetivo deve ser concluído sem ser detectado
  {
    min: 11,
    max: 11,
    result: {
      type: ClauseType.STEALTH,
      description: "O objetivo deve ser concluído sem ser detectado",
      rewardModifier: 5,
    },
  },
  // 12: Proibido o uso de magia
  {
    min: 12,
    max: 12,
    result: {
      type: ClauseType.NO_MAGIC,
      description: "Proibido o uso de magia",
      rewardModifier: 5,
    },
  },
  // 13: Outro grupo tem o mesmo contrato
  {
    min: 13,
    max: 13,
    result: {
      type: ClauseType.COMPETITION,
      description:
        "Outro grupo tem o mesmo contrato. Apenas o primeiro a completá-lo é agraciado com a recompensa",
      rewardModifier: 5,
    },
  },
  // 14: Exterminar a fonte do problema
  {
    min: 14,
    max: 14,
    result: {
      type: ClauseType.EXTERMINATE_SOURCE,
      description: "Exterminar a fonte do problema",
      rewardModifier: 5,
    },
  },
  // 15: Um supervisor deve ser protegido e acompanhar o contratado
  {
    min: 15,
    max: 15,
    result: {
      type: ClauseType.SUPERVISOR,
      description: "Um supervisor deve ser protegido e acompanhar o contratado",
      rewardModifier: 5,
    },
  },
  // 16: Deve ser feito em um horário específico do dia
  {
    min: 16,
    max: 16,
    result: {
      type: ClauseType.TIME_RESTRICTION,
      description:
        "Deve ser feito em um horário específico do dia (como manhã, tarde ou noite)",
      rewardModifier: 5,
    },
  },
  // 17: Um relatório completo deve ser escrito ao concluir o contrato
  {
    min: 17,
    max: 17,
    result: {
      type: ClauseType.REPORT_REQUIRED,
      description:
        "Um relatório completo deve ser escrito ao concluir o contrato",
      rewardModifier: 5,
    },
  },
  // 18: Todo tesouro conquistado é de posse do contratante
  {
    min: 18,
    max: 18,
    result: {
      type: ClauseType.NO_TREASURE,
      description: "Todo tesouro conquistado é de posse do contratante",
      rewardModifier: 5,
    },
  },
  // 19: Deve se manter a própria identidade em segredo
  {
    min: 19,
    max: 19,
    result: {
      type: ClauseType.SECRET_IDENTITY,
      description:
        "Deve se manter a própria identidade em segredo, e/ou estar sob disfarce",
      rewardModifier: 5,
    },
  },
  // 20: Sigilo absoluto
  {
    min: 20,
    max: 20,
    result: {
      type: ClauseType.ABSOLUTE_SECRECY,
      description: "Sigilo absoluto",
      rewardModifier: 5,
    },
  },
  // 21+: Role duas vezes e use ambos - tratado na função de geração
];

// ====================================
// TABELAS DE TIPO DE PAGAMENTO
// ====================================

/**
 * Tabela de Tipo de Pagamento de Contratos
 * Rolagem: 1d20 + modificador baseado no valor/recompensa do contrato
 */
export const CONTRACT_PAYMENT_TYPE_TABLE: TableEntry<ContractPayment>[] = [
  // 1-3: Pagamento em PO$ direto com contratante
  {
    min: 1,
    max: 3,
    result: {
      type: PaymentType.DIRECT_FROM_CONTRACTOR,
      description: "Pagamento em PO$ direto com contratante",
      guildPercentage: 0,
      contractorPercentage: 100,
      includesGoods: false,
      includesServices: false,
    },
  },
  // 4-6: Metade com a guilda, metade com o contratante
  {
    min: 4,
    max: 6,
    result: {
      type: PaymentType.HALF_GUILD_HALF_CONTRACTOR,
      description: "Metade com a guilda, metade com o contratante",
      guildPercentage: 50,
      contractorPercentage: 50,
      includesGoods: false,
      includesServices: false,
    },
  },
  // 7-9: Metade com a guilda, metade, em bens, com o contratante
  {
    min: 7,
    max: 9,
    result: {
      type: PaymentType.HALF_GUILD_HALF_GOODS,
      description: "Metade com a guilda, metade, em bens, com o contratante",
      guildPercentage: 50,
      contractorPercentage: 50,
      includesGoods: true,
      includesServices: false,
    },
  },
  // 10-12: Em materiais, joias, bens ou serviços do contratante
  {
    min: 10,
    max: 12,
    result: {
      type: PaymentType.GOODS_AND_SERVICES,
      description: "Em materiais, joias, bens ou serviços do contratante",
      guildPercentage: 0,
      contractorPercentage: 100,
      includesGoods: true,
      includesServices: true,
    },
  },
  // 13-20: Pagamento total na guilda em PO$
  {
    min: 13,
    max: 20,
    result: {
      type: PaymentType.FULL_GUILD_PAYMENT,
      description: "Pagamento total na guilda em PO$",
      guildPercentage: 100,
      contractorPercentage: 0,
      includesGoods: false,
      includesServices: false,
    },
  },
  // 21+: Pagamento total na guilda em PO$ e serviços do contratante
  {
    min: 21,
    max: 999,
    result: {
      type: PaymentType.FULL_GUILD_PLUS_SERVICES,
      description: "Pagamento total na guilda em PO$ e serviços do contratante",
      guildPercentage: 100,
      contractorPercentage: 0,
      includesGoods: false,
      includesServices: true,
    },
  },
];

// ====================================
// CONSTANTES E CONFIGURAÇÕES
// ====================================

/**
 * Penalidade de quebra de contrato
 * Baseado na regra: "Quebrar um contrato gera uma multa no valor de 10% da recompensa em PO$"
 */
export const CONTRACT_BREACH_PENALTY_PERCENTAGE = 10;

/**
 * Modificador de recompensa por pré-requisito/cláusula
 * Baseado na regra: "Cada pré-requisito e cláusula adicional aumenta a recompensa do contrato em 5 pontos"
 */
export const REWARD_MODIFIER_PER_REQUIREMENT = 5;
