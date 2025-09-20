import type { Guild } from "@/types/guild";
import type { Contract } from "@/types/contract";
import type { Service } from "@/types/service";
import type { Notice } from "@/types/notice";
import { AlternativePayment } from "@/types/notice";
import {
  shouldTriggerCrossModuleIntegration,
  validateDependencies,
  applyAlternativePaymentReduction,
} from "../generators/noticeModifiers";
import { rollDice } from "@/utils/dice";
import { ALTERNATIVE_PAYMENT_TABLE } from "@/data/tables/notice-base-tables";

/**
 * Sistema de integração cross-module para avisos
 * REGRA: "Contratos e serviços do mural de avisos serão sempre de criaturas que não têm como pagar"
 */

/**
 * Configuração para integração cross-module
 */
export interface CrossModuleConfig {
  guild: Guild;
  notice: Notice;
  originalTableType?: string; // Tipo original da tabela para decisão de integração
  contractsStore?: {
    generateContracts: (config: Record<string, unknown>) => Promise<Contract[]>;
  };
  servicesStore?: {
    generateServices: (config: Record<string, unknown>) => Promise<Service[]>;
  };
  diceRoller?: (notation: string) => number;
}

/**
 * Resultado da integração cross-module
 */
export interface CrossModuleResult {
  success: boolean;
  modulesTriggered: string[];
  contractsGenerated?: Contract[];
  servicesGenerated?: Service[];
  alternativePayment?: AlternativePayment;
  errors?: string[];
}

/**
 * Executa integração cross-module baseada no tipo de aviso
 * REGRA: "Quando tipo '1d4 contratos' é rolado" ou "Quando tipo '1d4 serviços' é rolado"
 */
export async function executeCrossModuleIntegration(
  config: CrossModuleConfig
): Promise<CrossModuleResult> {
  const { guild, notice, originalTableType, contractsStore, servicesStore } = config;
  const diceRoller =
    config.diceRoller || ((notation: string) => rollDice({ notation }).result);

  const result: CrossModuleResult = {
    success: false,
    modulesTriggered: [],
    errors: [],
  };

  // Verificar se deve disparar integração usando tipo original se disponível
  const typeToCheck = originalTableType || notice.type;
  
  // Log para debug do tipo sendo verificado
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log(`[CROSS-MODULE DEBUG] Verificando integração - originalTableType: "${originalTableType}", notice.type: "${notice.type}", typeToCheck: "${typeToCheck}"`);
  }
  
  const integrationCheck = shouldTriggerCrossModuleIntegration(
    typeToCheck,
    diceRoller
  );
  
  // Log para debug do resultado da verificação
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log(`[CROSS-MODULE DEBUG] Resultado da verificação - shouldTrigger: ${integrationCheck.shouldTrigger}, moduleType: ${integrationCheck.moduleType}, quantity: ${integrationCheck.quantity}`);
  }
  
  if (!integrationCheck.shouldTrigger || !integrationCheck.moduleType) {
    result.success = true; // Não precisa de integração, sucesso
    return result;
  }

  // Validar dependências
  const validation = validateDependencies(guild, integrationCheck.moduleType);
  if (!validation.isValid) {
    result.errors?.push(
      validation.reason || "Validação de dependências falhou"
    );
    return result;
  }

  try {
    if (integrationCheck.moduleType === "contracts" && contractsStore) {
      // Log para debug da quantidade
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log(`[CROSS-MODULE DEBUG] Contratos - quantidade rolada: ${integrationCheck.quantity}, usando: ${integrationCheck.quantity || 1}`);
      }
      
      const contractResult = await handleContractsIntegration(
        guild,
        contractsStore,
        diceRoller,
        integrationCheck.quantity || 1 // Usar a quantidade rolada ou 1 como fallback
      );
      if (contractResult.success) {
        result.contractsGenerated = contractResult.contracts;
        result.modulesTriggered.push("contracts");
        result.alternativePayment = contractResult.alternativePayment;
      } else {
        result.errors?.push(...(contractResult.errors || []));
      }
    }

    if (integrationCheck.moduleType === "services" && servicesStore) {
      // Log para debug da quantidade
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log(`[CROSS-MODULE DEBUG] Serviços - quantidade rolada: ${integrationCheck.quantity}, usando: ${integrationCheck.quantity || 1}`);
      }
      
      const serviceResult = await handleServicesIntegration(
        guild,
        servicesStore,
        diceRoller,
        integrationCheck.quantity || 1 // Usar a quantidade rolada ou 1 como fallback
      );
      if (serviceResult.success) {
        result.servicesGenerated = serviceResult.services;
        result.modulesTriggered.push("services");
        result.alternativePayment = serviceResult.alternativePayment;
      } else {
        result.errors?.push(...(serviceResult.errors || []));
      }
    }

    result.success =
      result.modulesTriggered.length > 0 || result.errors?.length === 0;
  } catch (error) {
    result.errors?.push(
      `Erro durante integração: ${error instanceof Error ? error.message : String(error)}`
    );
  }

  return result;
}

/**
 * Lida com integração específica de contratos
 * REGRA: "Role a tabela de 'Pagamento alternativo' para saber as condições de pagamento"
 * REGRA: "Considere a recompensa sempre 1/3 da original"
 */
async function handleContractsIntegration(
  guild: Guild,
  contractsStore: NonNullable<CrossModuleConfig["contractsStore"]>,
  diceRoller: (notation: string) => number,
  quantity: number
): Promise<{
  success: boolean;
  contracts?: Contract[];
  alternativePayment?: AlternativePayment;
  errors?: string[];
}> {
  try {
    // Usar a quantidade já rolada (não rolar novamente)
    // A quantidade já foi rolada na função shouldTriggerCrossModuleIntegration

    // Gerar contratos com configuração especial para pagamento alternativo
    const contractConfig = {
      guild,
      quantity,
      alternativePayment: true, // Flag especial para avisos
      rewardReduction: 1 / 3, // Redução para 1/3 da recompensa original
    };

    const contracts = await contractsStore.generateContracts(contractConfig);

    // Rolar pagamento alternativo (tabela 1d20 simples)
    const paymentRoll = diceRoller("1d20");
    const alternativePayment = determineAlternativePayment(paymentRoll);

    // Aplicar redução de recompensa em cada contrato
    const modifiedContracts = contracts.map((contract) => ({
      ...contract,
      value: {
        ...contract.value,
        rewardValue: applyAlternativePaymentReduction(
          contract.value.rewardValue
        ),
      },
      alternativePayment,
      isFromNoticeBoard: true, // Flag para identificar origem
    })) as Contract[];

    return {
      success: true,
      contracts: modifiedContracts,
      alternativePayment,
    };
  } catch (error) {
    return {
      success: false,
      errors: [
        `Erro na integração de contratos: ${error instanceof Error ? error.message : String(error)}`,
      ],
    };
  }
}

/**
 * Lida com integração específica de serviços
 * REGRA: "Role a tabela de 'Pagamento alternativo' para saber as condições de pagamento"
 * REGRA: "Considere a recompensa sempre 1/3 da original"
 */
async function handleServicesIntegration(
  guild: Guild,
  servicesStore: NonNullable<CrossModuleConfig["servicesStore"]>,
  diceRoller: (notation: string) => number,
  quantity: number
): Promise<{
  success: boolean;
  services?: Service[];
  alternativePayment?: AlternativePayment;
  errors?: string[];
}> {
  try {
    // Usar a quantidade já rolada (não rolar novamente)
    // A quantidade já foi rolada na função shouldTriggerCrossModuleIntegration

    // Gerar serviços com configuração especial para pagamento alternativo
    const serviceConfig = {
      guild,
      quantity,
      alternativePayment: true, // Flag especial para avisos
      rewardReduction: 1 / 3, // Redução para 1/3 da recompensa original
    };

    const services = await servicesStore.generateServices(serviceConfig);

    // Rolar pagamento alternativo (tabela 1d20 simples)
    const paymentRoll = diceRoller("1d20");
    const alternativePayment = determineAlternativePayment(paymentRoll);

    // Aplicar redução de recompensa em cada serviço
    const modifiedServices = services.map((service) => ({
      ...service,
      value: {
        ...service.value,
        rewardAmount: applyAlternativePaymentReduction(
          service.value.rewardAmount
        ),
      },
      alternativePayment,
      isFromNoticeBoard: true, // Flag para identificar origem
    })) as Service[];

    return {
      success: true,
      services: modifiedServices,
      alternativePayment,
    };
  } catch (error) {
    return {
      success: false,
      errors: [
        `Erro na integração de serviços: ${error instanceof Error ? error.message : String(error)}`,
      ],
    };
  }
}

/**
 * Determina o tipo de pagamento alternativo baseado na rolagem 1d20
 */
function determineAlternativePayment(roll: number): AlternativePayment {
  // Usar a tabela existente ao invés de método manual
  const entry = ALTERNATIVE_PAYMENT_TABLE.find(
    (entry) => roll >= entry.min && roll <= entry.max
  );
  
  if (!entry) {
    return AlternativePayment.NONE;
  }
  
  // Mapear string do resultado para enum AlternativePayment
  switch (entry.result) {
    case "Não há pagamento":
      return AlternativePayment.NONE;
    case "Ferro ou peças de cobre":
      return AlternativePayment.IRON_COPPER;
    case "Cobre ou prata":
      return AlternativePayment.COPPER_SILVER;
    case "Equivalente em animais":
      return AlternativePayment.ANIMALS;
    case "Equivalente em terras":
      return AlternativePayment.LAND;
    case "Equivalente em colheita":
      return AlternativePayment.HARVEST;
    case "Favores":
      return AlternativePayment.FAVORS;
    case "Mapa ou localização de tesouro":
      return AlternativePayment.TREASURE_MAP;
    case "Equivalente em especiarias":
      return AlternativePayment.SPICES;
    case "Objetos valiosos":
      return AlternativePayment.VALUABLE_OBJECTS;
    default:
      return AlternativePayment.NONE;
  }
}

/**
 * Utilitário para verificar se um aviso gerou integração cross-module
 */
export function hasNoticeTriggeredIntegration(notice: Notice): boolean {
  const check = shouldTriggerCrossModuleIntegration(notice.type);
  return check.shouldTrigger;
}

/**
 * Utilitário para obter detalhes da integração de um aviso
 * NOTA: Esta função faz uma nova rolagem, use apenas para preview/informação
 */
export function getNoticeIntegrationDetails(
  notice: Notice,
  diceRoller?: (notation: string) => number
): {
  willTrigger: boolean;
  moduleType?: "contracts" | "services";
  expectedQuantity?: number;
} {
  const check = shouldTriggerCrossModuleIntegration(notice.type, diceRoller);
  return {
    willTrigger: check.shouldTrigger,
    moduleType: check.moduleType,
    expectedQuantity: check.quantity,
  };
}
