import type { Guild, GuildStaff } from "@/types/guild";
import { rollDice } from "@/utils/dice";

/**
 * Sistema de modificadores para avisos conforme condições específicas
 * Baseado em: [3] Mural de Avisos - Guilda.md
 */

/**
 * Calcula modificadores por condição dos funcionários da guilda
 * REGRA: "Funcionários despreparados: -1d20, Funcionários experientes: +1d20"
 *
 * @param staff - Funcionários da guilda
 * @param diceRoller - Função de rolagem (opcional, usa rollDice por padrão)
 */
export function calculateStaffModifier(
  staff: GuildStaff,
  diceRoller?: (notation: string) => number
): number {
  const roller =
    diceRoller || ((notation: string) => rollDice({ notation }).result);

  // Verificar condição dos funcionários conforme definido na guilda
  // Usar lowercase para comparação mais robusta
  const condition = staff.employees?.toLowerCase() || "";

  if (condition.includes("despreparados") || condition.includes("desprepara")) {
    const roll = roller("1d20");
    return -roll; // Sempre negativo
  }

  if (condition.includes("experientes") || condition.includes("experiente")) {
    const roll = roller("1d20");
    return roll; // Sempre positivo
  }

  return 0; // Funcionários normais não aplicam modificador
}

/**
 * Aplica modificadores gerais para avisos baseados na condição da guilda
 */
export function applyNoticeModifiers(
  baseValue: number,
  guild: Guild,
  diceRoller?: (notation: string) => number
): number {
  let finalValue = baseValue;

  // Aplicar modificador de funcionários
  const staffModifier = calculateStaffModifier(guild.staff, diceRoller);
  finalValue += staffModifier;

  // Garantir que o valor não seja negativo
  return Math.max(0, finalValue);
}

/**
 * Calcula redução de recompensa para avisos de contratos e serviços
 * REGRA: "Considere a recompensa sempre 1/3 da original"
 */
export function applyAlternativePaymentReduction(
  originalValue: number
): number {
  return Math.floor(originalValue / 3);
}

/**
 * Verifica se um aviso deve ter integração cross-module
 * REGRA: "Quando tipo '1d4 contratos' é rolado" ou "Quando tipo '1d4 serviços' é rolado"
 *
 * @param noticeType - Tipo do aviso
 * @param diceRoller - Função de rolagem (opcional, usa rollDice por padrão)
 * @param preRolledQuantity - Quantidade já rolada (para evitar double-rolling)
 */
export function shouldTriggerCrossModuleIntegration(
  noticeType: string,
  diceRoller?: (notation: string) => number,
  preRolledQuantity?: number
): {
  shouldTrigger: boolean;
  moduleType?: "contracts" | "services";
  quantity?: number;
} {
  const roller =
    diceRoller || ((notation: string) => rollDice({ notation }).result);

  switch (noticeType) {
    case "1d4 contratos":
    case "contracts":
      return {
        shouldTrigger: true,
        moduleType: "contracts",
        quantity: preRolledQuantity || roller("1d4"),
      };
    case "1d4 serviços":
    case "services":
      return {
        shouldTrigger: true,
        moduleType: "services",
        quantity: preRolledQuantity || roller("1d4"),
      };
    default:
      return { shouldTrigger: false };
  }
}

/**
 * Valida se a guilda e módulos necessários estão disponíveis para integração
 */
export function validateDependencies(
  guild: Guild | null,
  moduleType: "contracts" | "services"
): { isValid: boolean; reason?: string } {
  if (!guild) {
    return {
      isValid: false,
      reason: "Guilda não está definida",
    };
  }

  if (!guild.id) {
    return {
      isValid: false,
      reason: "ID da guilda não está definido",
    };
  }

  // Verificar se a guilda tem estrutura mínima para o módulo
  if (!guild.structure) {
    return {
      isValid: false,
      reason: "Estrutura da guilda não está definida",
    };
  }

  // Para contratos, verificar se a guilda pode gerar contratos
  if (moduleType === "contracts") {
    // Verificar se há funcionários (mesmo que despreparados)
    if (!guild.staff) {
      return {
        isValid: false,
        reason: "Guilda não possui funcionários para gerenciar contratos",
      };
    }
  }

  // Para serviços, verificar se a guilda pode oferecer serviços
  if (moduleType === "services") {
    // Verificar se há funcionários (mesmo que despreparados)
    if (!guild.staff) {
      return {
        isValid: false,
        reason: "Guilda não possui funcionários para gerenciar serviços",
      };
    }
  }

  return { isValid: true };
}

/**
 * Tipo para resultado de aplicação de modificadores
 */
export interface ModifierResult {
  originalValue: number;
  staffModifier: number;
  finalValue: number;
  reducedForAlternativePayment?: number;
}

/**
 * Aplica todos os modificadores de uma vez e retorna resultado detalhado
 *
 * @param baseValue - Valor base
 * @param guild - Guilda para aplicar modificadores
 * @param isAlternativePayment - Se deve aplicar redução de pagamento alternativo
 * @param diceRoller - Função de rolagem (opcional, usa rollDice por padrão)
 */
export function applyAllModifiers(
  baseValue: number,
  guild: Guild,
  isAlternativePayment: boolean = false,
  diceRoller?: (notation: string) => number
): ModifierResult {
  const staffModifier = calculateStaffModifier(guild.staff, diceRoller);
  const finalValue = Math.max(0, baseValue + staffModifier);

  const result: ModifierResult = {
    originalValue: baseValue,
    staffModifier,
    finalValue,
  };

  if (isAlternativePayment) {
    result.reducedForAlternativePayment =
      applyAlternativePaymentReduction(finalValue);
  }

  return result;
}
