import type { GameDate } from "@/types/timeline";
import type { SettlementType } from "@/types/guild";
import type { Notice, NoticeType } from "@/types/notice";
import {
  NEW_NOTICES_SCHEDULE_TABLE,
  RENEWAL_DICE_BY_SETTLEMENT,
  NOTICE_EXPIRATION_TABLE,
  getExpirationModifier,
} from "@/data/tables/notice-renewal-tables";
import { rollDice } from "@/utils/dice";
import { addDays } from "@/utils/date-utils";

/**
 * Calcula quando novos avisos serão fixados no mural
 * Baseado na tabela "Quando Novos Avisos Serão Fixados"
 */
export function rollNewNoticesSchedule(
  diceRoller?: (notation: string) => number
): {
  days: number;
  description: string;
} {
  const roller =
    diceRoller || ((notation: string) => rollDice({ notation }).result);

  const baseRoll = roller("1d20");
  const result = NEW_NOTICES_SCHEDULE_TABLE.find(
    (entry) => baseRoll >= entry.min && baseRoll <= entry.max
  );

  if (!result) {
    return {
      days: 1,
      description: "Erro na tabela - padrão de 1 dia",
    };
  }

  if (result.result.isVariable && result.result.variableDice) {
    // Para casos como "2d4 meses" ou "2d4 semanas"
    const variableRoll = roller(result.result.variableDice);
    let calculatedDays: number;

    if (result.result.description.includes("meses")) {
      calculatedDays = variableRoll * 30; // Aproximação de 30 dias por mês
    } else {
      calculatedDays = variableRoll; // Já está em dias ou semanas*7
    }

    return {
      days: calculatedDays,
      description: `${result.result.description} (${calculatedDays} dias)`,
    };
  }

  return {
    days: result.result.days,
    description: result.result.description,
  };
}

/**
 * Calcula a quantidade de novos avisos que devem ser gerados na renovação
 * Usa os dados por tamanho do assentamento com redutores
 */
export function rollNewNoticesQuantity(
  settlementType: SettlementType,
  diceRoller?: (notation: string) => number
): {
  quantity: number;
  dice: string;
  description: string;
} {
  const roller =
    diceRoller || ((notation: string) => rollDice({ notation }).result);

  const renewalConfig = RENEWAL_DICE_BY_SETTLEMENT[settlementType];
  if (!renewalConfig) {
    return {
      quantity: 0,
      dice: "0",
      description: "Tipo de assentamento não encontrado",
    };
  }

  const quantity = Math.max(0, roller(renewalConfig.dice));

  return {
    quantity,
    dice: renewalConfig.dice,
    description: renewalConfig.description,
  };
}

/**
 * Calcula quando um aviso específico deve expirar
 * Aplica modificadores por tipo de aviso
 *
 * EXECUÇÕES: Rolagem normal para determinar o dia da execução,
 * depois são removidas automaticamente "logo após acontecerem"
 */
export function rollNoticeExpiration(
  noticeType: NoticeType,
  diceRoller?: (notation: string) => number
): {
  days: number;
  description: string;
  immediateRemoval: boolean;
  isExecutionDay?: boolean;
} {
  const roller =
    diceRoller || ((notation: string) => rollDice({ notation }).result);

  // Para execuções, rolar normalmente para determinar quando acontecerá
  if (noticeType === "execution") {
    const modifier = getExpirationModifier(noticeType); // 0 para execuções
    const baseRoll = roller("1d20");
    const finalRoll = Math.max(1, Math.min(20, baseRoll + modifier));

    const result = NOTICE_EXPIRATION_TABLE.find(
      (entry) => finalRoll >= entry.min && finalRoll <= entry.max
    );

    if (!result) {
      return {
        days: 1,
        description: "Erro na tabela - execução em 1 dia",
        immediateRemoval: false,
        isExecutionDay: true,
      };
    }

    let calculatedDays: number;
    let description: string;

    if (result.result.isVariable && result.result.variableDice) {
      const variableRoll = roller(result.result.variableDice);
      calculatedDays = variableRoll;
      description = `Execução em ${result.result.description}`;
    } else {
      calculatedDays = result.result.days;
      description = `Execução em ${result.result.description}`;
    }

    return {
      days: calculatedDays,
      description,
      immediateRemoval: false,
      isExecutionDay: true, // Indica que é o dia da execução, não expiração normal
    };
  }

  // Para outros tipos, lógica normal de expiração
  const modifier = getExpirationModifier(noticeType);
  const baseRoll = roller("1d20");
  const finalRoll = Math.max(1, Math.min(20, baseRoll + modifier));

  const result = NOTICE_EXPIRATION_TABLE.find(
    (entry) => finalRoll >= entry.min && finalRoll <= entry.max
  );

  if (!result) {
    return {
      days: 1,
      description: "Erro na tabela - padrão de 1 dia",
      immediateRemoval: false,
    };
  }

  if (result.result.isVariable && result.result.variableDice) {
    // Para casos como "2d4 semanas"
    const variableRoll = roller(result.result.variableDice);

    return {
      days: variableRoll,
      description: `${result.result.description} (${variableRoll} dias, modificador: ${modifier >= 0 ? "+" : ""}${modifier})`,
      immediateRemoval: false,
    };
  }

  return {
    days: result.result.days,
    description: `${result.result.description} (modificador: ${modifier >= 0 ? "+" : ""}${modifier})`,
    immediateRemoval: false,
  };
}

/**
 * Calcula a data de expiração para um aviso
 * Para execuções, esta será a data da execução programada
 */
export function calculateNoticeExpirationDate(
  notice: Notice,
  currentDate: GameDate,
  diceRoller?: (notation: string) => number
): GameDate {
  const expiration = rollNoticeExpiration(notice.type, diceRoller);

  // Execuções e outros tipos seguem o mesmo fluxo
  // A diferença é semântica: para execuções, é o dia da execução
  return addDays(currentDate, expiration.days);
}

/**
 * Calcula a próxima data de renovação do mural
 */
export function calculateNextRenewalDate(
  currentDate: GameDate,
  diceRoller?: (notation: string) => number
): GameDate {
  const schedule = rollNewNoticesSchedule(diceRoller);
  return addDays(currentDate, schedule.days);
}

/**
 * Verifica se um aviso deve expirar baseado na data atual
 * Para execuções, verifica se chegou o dia programado da execução
 */
export function shouldExpireNotice(
  _notice: Notice,
  currentDate: GameDate,
  expirationDate: GameDate
): boolean {
  // Verificar se a data de expiração/execução chegou ou passou
  return (
    currentDate.year > expirationDate.year ||
    (currentDate.year === expirationDate.year &&
      currentDate.month > expirationDate.month) ||
    (currentDate.year === expirationDate.year &&
      currentDate.month === expirationDate.month &&
      currentDate.day >= expirationDate.day)
  );
}
