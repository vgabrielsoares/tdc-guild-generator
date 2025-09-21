import type { TableEntry } from "@/types/tables";
import { SettlementType } from "@/types/guild";
import { NoticeType } from "@/types/notice";

/**
 * Tabela para determinar quando novos avisos serão fixados no mural
 * Baseado em: [3] Mural de Avisos - Guilda.md - "Quando Novos Avisos Serão Fixados"
 * Rolagem: 1d20
 */
export const NEW_NOTICES_SCHEDULE_TABLE: TableEntry<{
  description: string;
  days: number;
  isVariable?: boolean;
  variableDice?: string;
}>[] = [
  {
    min: 1,
    max: 1,
    result: {
      description: "2d4 meses",
      days: 0, // Será calculado dinamicamente
      isVariable: true,
      variableDice: "2d4",
    },
  },
  {
    min: 2,
    max: 2,
    result: {
      description: "Três meses",
      days: 90,
    },
  },
  {
    min: 3,
    max: 4,
    result: {
      description: "Dois meses",
      days: 60,
    },
  },
  {
    min: 5,
    max: 9,
    result: {
      description: "Um mês",
      days: 30,
    },
  },
  {
    min: 10,
    max: 13,
    result: {
      description: "2d4 semanas",
      days: 0, // Será calculado dinamicamente
      isVariable: true,
      variableDice: "2d4*7", // 2d4 semanas em dias
    },
  },
  {
    min: 14,
    max: 15,
    result: {
      description: "Três semanas",
      days: 21,
    },
  },
  {
    min: 16,
    max: 17,
    result: {
      description: "Duas semanas",
      days: 14,
    },
  },
  {
    min: 18,
    max: 18,
    result: {
      description: "Uma semana",
      days: 7,
    },
  },
  {
    min: 19,
    max: 19,
    result: {
      description: "Quatro dias",
      days: 4,
    },
  },
  {
    min: 20,
    max: 20,
    result: {
      description: "Dois dias",
      days: 2,
    },
  },
];

/**
 * Dados para renovação de avisos por tamanho do assentamento
 * Baseado em: [3] Mural de Avisos - Guilda.md - "Dados por Tamanho do Assentamento"
 * IMPORTANTE: Role diretamente da tabela de mural de avisos com redutores
 */
export const RENEWAL_DICE_BY_SETTLEMENT: Record<
  SettlementType,
  {
    dice: string;
    description: string;
  }
> = {
  [SettlementType.LUGAREJO]: {
    dice: "1d20-15",
    description: "Lugarejo (1d20-15)",
  },
  [SettlementType.POVOADO]: {
    dice: "2d20-15",
    description: "Povoado (2d20-15)",
  },
  [SettlementType.ALDEIA]: {
    dice: "1d20-10",
    description: "Aldeia (1d20-10)",
  },
  [SettlementType.VILAREJO]: {
    dice: "2d20-10",
    description: "Vilarejo (2d20-10)",
  },
  [SettlementType.VILA_GRANDE]: {
    dice: "1d20-5",
    description: "Vila grande (1d20-5)",
  },
  [SettlementType.CIDADELA]: {
    dice: "2d20-5",
    description: "Cidadela (2d20-5)",
  },
  [SettlementType.CIDADE_GRANDE]: {
    dice: "2d20",
    description: "Cidade grande (2d20)",
  },
  [SettlementType.METROPOLE]: {
    dice: "2d20+5",
    description: "Metrópole (2d20+5)",
  },
};

/**
 * Tabela para determinar quando avisos são retirados ou resolvidos
 * Baseado em: [3] Mural de Avisos - Guilda.md - "Quando Avisos São Retirados ou Resolvidos"
 * Rolagem: 1d20 + modificadores por tipo
 */
export const NOTICE_EXPIRATION_TABLE: TableEntry<{
  description: string;
  days: number;
  isVariable?: boolean;
  variableDice?: string;
}>[] = [
  {
    min: 1,
    max: 1,
    result: {
      description: "Três meses",
      days: 90,
    },
  },
  {
    min: 2,
    max: 2,
    result: {
      description: "Dois meses",
      days: 60,
    },
  },
  {
    min: 3,
    max: 4,
    result: {
      description: "Um mês",
      days: 30,
    },
  },
  {
    min: 5,
    max: 6,
    result: {
      description: "2d4 semanas",
      days: 0, // Será calculado dinamicamente
      isVariable: true,
      variableDice: "2d4*7", // 2d4 semanas em dias
    },
  },
  {
    min: 7,
    max: 10,
    result: {
      description: "Duas semanas",
      days: 14,
    },
  },
  {
    min: 11,
    max: 13,
    result: {
      description: "Uma semana",
      days: 7,
    },
  },
  {
    min: 14,
    max: 15,
    result: {
      description: "Quatro dias",
      days: 4,
    },
  },
  {
    min: 16,
    max: 17,
    result: {
      description: "Três dias",
      days: 3,
    },
  },
  {
    min: 18,
    max: 19,
    result: {
      description: "Dois dias",
      days: 2,
    },
  },
  {
    min: 20,
    max: 20,
    result: {
      description: "Um dia",
      days: 1,
    },
  },
];

/**
 * Modificadores por tipo de aviso para expiração
 * Baseado em: [3] Mural de Avisos - Guilda.md - "Modificadores por Tipo de Aviso"
 */
export const EXPIRATION_MODIFIERS_BY_TYPE: Record<NoticeType, number> = {
  [NoticeType.RESIDENTS_NOTICE]: 8, // Aviso dos habitantes
  [NoticeType.SERVICES]: 6, // Serviços
  [NoticeType.COMMERCIAL_PROPOSAL]: 4, // Proposta comercial
  [NoticeType.ANNOUNCEMENT]: 2, // Divulgação
  [NoticeType.HUNT_PROPOSAL]: 0, // Proposta de caçada
  [NoticeType.WANTED_POSTER]: -2, // Cartaz de procurado
  [NoticeType.CONTRACTS]: -4, // Contratos
  [NoticeType.OFFICIAL_STATEMENT]: -8, // Pronunciamento
  [NoticeType.EXECUTION]: 0, // Execuções usam rolagem normal, mas são programadas para o dia da execução
  [NoticeType.NOTHING]: 0, // Não se aplica
};

/**
 * Calcula o modificador de expiração para um tipo de aviso
 */
export function getExpirationModifier(noticeType: NoticeType): number {
  return EXPIRATION_MODIFIERS_BY_TYPE[noticeType] || 0;
}
