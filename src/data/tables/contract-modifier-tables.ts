import type { TableEntry } from "@/types/tables";
import { ContractResolution, FailureReason } from "@/types/contract";

/**
 * Tabelas de Modificadores de Contratos - Ciclo de Vida e Resolução Automática
 *
 * Este arquivo contém as funcionalidades específicas para:
 * - Modificadores dinâmicos baseados em valor
 * - Resolução automática de contratos
 * - Ciclo de vida e gestão temporal
 */

// ===== DADOS POR RESULTADO DE VALOR E RECOMPENSA =====

// Interface para dados de rolagem baseados no valor do contrato
interface ValueBasedRoll {
  diceNotation: string;
  modifier: number;
}

// Dados para pré-requisitos baseados no resultado de valor
export const PREREQUISITE_DICE_BY_VALUE: Record<string, ValueBasedRoll> = {
  "1-20": { diceNotation: "1d20", modifier: -10 },
  "21-40": { diceNotation: "1d20", modifier: -5 },
  "41-60": { diceNotation: "1d20", modifier: 0 },
  "61-80": { diceNotation: "1d20", modifier: 5 },
  "81-100": { diceNotation: "1d20", modifier: 10 },
  "101+": { diceNotation: "1d20", modifier: 15 },
};

// Dados para cláusulas baseados no resultado de recompensa
export const CLAUSE_DICE_BY_VALUE: Record<string, ValueBasedRoll> = {
  "1-20": { diceNotation: "1d20", modifier: -2 },
  "21-40": { diceNotation: "1d20", modifier: -1 },
  "41-60": { diceNotation: "1d20", modifier: 0 },
  "61-80": { diceNotation: "1d20", modifier: 2 },
  "81-100": { diceNotation: "1d20", modifier: 5 },
  "101+": { diceNotation: "1d20", modifier: 7 },
};

// Dados para tipo de pagamento baseados no resultado
export const PAYMENT_TYPE_DICE_BY_VALUE: Record<string, ValueBasedRoll> = {
  "1-20": { diceNotation: "1d20", modifier: -2 },
  "21-40": { diceNotation: "1d20", modifier: -1 },
  "41-60": { diceNotation: "1d20", modifier: 0 },
  "61-80": { diceNotation: "1d20", modifier: 2 },
  "81-100": { diceNotation: "1d20", modifier: 5 },
  "101+": { diceNotation: "1d20", modifier: 7 },
};

// ===== TEMPO DE RESOLUÇÃO AUTOMÁTICA =====

// Tempo para resolução de contratos firmados
export const SIGNED_CONTRACT_RESOLUTION_TIME_TABLE: TableEntry<string>[] = [
  { min: 1, max: 6, result: "1d6 dias" },
  { min: 7, max: 8, result: "1 semana" },
  { min: 9, max: 9, result: "2d6+3 dias" },
  { min: 10, max: 11, result: "1d8+1 dias" },
  { min: 12, max: 12, result: "2 semanas" },
  { min: 13, max: 13, result: "2d10 dias" },
  { min: 14, max: 15, result: "1d4 dias" },
  { min: 16, max: 18, result: "1d6+3 dias" },
  { min: 19, max: 19, result: "3 semanas" },
  { min: 20, max: 20, result: "2d8 dias" },
];

// Tempo para resolução de contratos não assinados
export const UNSIGNED_CONTRACT_RESOLUTION_TIME_TABLE: TableEntry<string>[] = [
  { min: 1, max: 4, result: "3 dias" },
  { min: 5, max: 6, result: "4 dias" },
  { min: 7, max: 9, result: "1d4 dias" },
  { min: 10, max: 11, result: "1d6 dias" },
  { min: 12, max: 13, result: "1 semana" },
  { min: 14, max: 15, result: "5 dias" },
  { min: 16, max: 16, result: "1d8 dias" },
  { min: 17, max: 17, result: "1d12 dias" },
  { min: 18, max: 19, result: "1d20 dias" },
  { min: 20, max: 20, result: "1 dia" },
];

// ===== RESOLUÇÃO DE CONTRATOS FIRMADOS =====

// Resultado da resolução de contratos firmados por outros aventureiros
export const SIGNED_CONTRACT_RESOLUTION_TABLE: TableEntry<ContractResolution>[] =
  [
    { min: 1, max: 12, result: ContractResolution.RESOLVIDO },
    { min: 13, max: 16, result: ContractResolution.NAO_RESOLVIDO },
    { min: 17, max: 18, result: ContractResolution.RESOLVIDO_COM_RESSALVAS },
    { min: 19, max: 20, result: ContractResolution.AINDA_NAO_SE_SABE },
  ];

// ===== RESOLUÇÃO DE CONTRATOS NÃO ASSINADOS =====

// Interface para resultado de resolução de contratos não assinados
interface UnsignedResolutionResult {
  description: string;
  action: string;
}

// Resultado da resolução de contratos não assinados
export const UNSIGNED_CONTRACT_RESOLUTION_TABLE: TableEntry<UnsignedResolutionResult>[] =
  [
    {
      min: 1,
      max: 2,
      result: {
        description: "Nenhum foi assinado, todos continuam disponíveis",
        action: "keep_all",
      },
    },
    {
      min: 3,
      max: 5,
      result: {
        description: "Todos foram devidamente resolvidos",
        action: "resolve_all",
      },
    },
    {
      min: 6,
      max: 10,
      result: {
        description: "Os de menor XP foram resolvidos",
        action: "resolve_lowest_xp",
      },
    },
    {
      min: 11,
      max: 12,
      result: {
        description: "Contratos com as melhores Recompensas foram resolvidos",
        action: "resolve_highest_reward",
      },
    },
    {
      min: 13,
      max: 15,
      result: {
        description: "1d6 contratos aleatórios são resolvidos",
        action: "resolve_random_1d6",
      },
    },
    {
      min: 16,
      max: 16,
      result: {
        description: "1d4+2 contratos são assinados, porém não são resolvidos",
        action: "sign_but_not_resolve_1d4plus2",
      },
    },
    {
      min: 17,
      max: 18,
      result: {
        description: "1d6+2 contratos são resolvidos",
        action: "resolve_1d6plus2",
      },
    },
    {
      min: 19,
      max: 19,
      result: {
        description: "2d6+2 contratos são resolvidos",
        action: "resolve_2d6plus2",
      },
    },
    {
      min: 20,
      max: 20,
      result: {
        description:
          "Nenhum foi assinado, e há algum motivo estranho para isso",
        action: "strange_reason",
      },
    },
  ];

// ===== MOTIVOS PARA NÃO RESOLUÇÃO =====

// Motivos pelos quais contratos não são resolvidos
export const CONTRACT_FAILURE_REASONS_TABLE: TableEntry<FailureReason>[] = [
  { min: 1, max: 6, result: FailureReason.DESISTENCIA },
  { min: 7, max: 7, result: FailureReason.PICARETAGEM },
  { min: 8, max: 14, result: FailureReason.OBITO },
  { min: 15, max: 17, result: FailureReason.PRAZO_NAO_CUMPRIDO },
  { min: 18, max: 19, result: FailureReason.CLAUSULA_NAO_CUMPRIDA },
  { min: 20, max: 20, result: FailureReason.CONTRATANTE_MORTO },
];

// ===== GERAÇÃO DE NOVOS CONTRATOS =====

// Tempo para geração de novos contratos
export const NEW_CONTRACTS_TIME_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "1d6 dias" },
  { min: 2, max: 2, result: "1 semana" },
  { min: 3, max: 4, result: "2d6+3 dias" },
  { min: 5, max: 8, result: "1d6 semanas" },
  { min: 9, max: 13, result: "1d6+2 semanas" },
  { min: 14, max: 14, result: "1 mês" },
  { min: 15, max: 16, result: "2d6+3 semanas" },
  { min: 17, max: 17, result: "1d20+10 dias" },
  { min: 18, max: 18, result: "2 meses" },
  { min: 19, max: 19, result: "2d6+6 semanas" },
  { min: 20, max: 20, result: "3 meses" },
];

// ===== CONSTANTES DE MODIFICADORES =====

// Penalidade por quebra de contrato (10% da recompensa)
export const CONTRACT_BREACH_PENALTY_RATE = 0.1;

// Aumento de recompensa para contratos não resolvidos (+2)
export const UNRESOLVED_CONTRACT_BONUS = 2;

// Aumento de recompensa por pré-requisito/cláusula (+5 cada)
export const REQUIREMENT_CLAUSE_BONUS = 5;

// ===== FUNÇÕES UTILITÁRIAS =====

/**
 * Obtém o dado apropriado para pré-requisitos baseado no valor do contrato
 */
export function getPrerequisiteDice(contractValue: number): ValueBasedRoll {
  if (contractValue <= 20) return PREREQUISITE_DICE_BY_VALUE["1-20"];
  if (contractValue <= 40) return PREREQUISITE_DICE_BY_VALUE["21-40"];
  if (contractValue <= 60) return PREREQUISITE_DICE_BY_VALUE["41-60"];
  if (contractValue <= 80) return PREREQUISITE_DICE_BY_VALUE["61-80"];
  if (contractValue <= 100) return PREREQUISITE_DICE_BY_VALUE["81-100"];
  return PREREQUISITE_DICE_BY_VALUE["101+"];
}

/**
 * Obtém o dado apropriado para cláusulas baseado no valor de recompensa
 */
export function getClauseDice(rewardValue: number): ValueBasedRoll {
  if (rewardValue <= 20) return CLAUSE_DICE_BY_VALUE["1-20"];
  if (rewardValue <= 40) return CLAUSE_DICE_BY_VALUE["21-40"];
  if (rewardValue <= 60) return CLAUSE_DICE_BY_VALUE["41-60"];
  if (rewardValue <= 80) return CLAUSE_DICE_BY_VALUE["61-80"];
  if (rewardValue <= 100) return CLAUSE_DICE_BY_VALUE["81-100"];
  return CLAUSE_DICE_BY_VALUE["101+"];
}

/**
 * Obtém o dado apropriado para tipo de pagamento baseado no valor
 */
export function getPaymentTypeDice(contractValue: number): ValueBasedRoll {
  if (contractValue <= 20) return PAYMENT_TYPE_DICE_BY_VALUE["1-20"];
  if (contractValue <= 40) return PAYMENT_TYPE_DICE_BY_VALUE["21-40"];
  if (contractValue <= 60) return PAYMENT_TYPE_DICE_BY_VALUE["41-60"];
  if (contractValue <= 80) return PAYMENT_TYPE_DICE_BY_VALUE["61-80"];
  if (contractValue <= 100) return PAYMENT_TYPE_DICE_BY_VALUE["81-100"];
  return PAYMENT_TYPE_DICE_BY_VALUE["101+"];
}

/**
 * Calcula a penalidade por quebra de contrato
 */
export function calculateBreachPenalty(rewardValue: number): number {
  return Math.floor(rewardValue * CONTRACT_BREACH_PENALTY_RATE);
}

/**
 * Calcula o bônus total por pré-requisitos e cláusulas
 */
export function calculateRequirementClauseBonus(
  prerequisiteCount: number,
  clauseCount: number
): number {
  return (prerequisiteCount + clauseCount) * REQUIREMENT_CLAUSE_BONUS;
}
