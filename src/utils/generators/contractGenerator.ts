import { rollDice } from "../dice";
import {
  CONTRACT_DICE_BY_SIZE,
  CONTRACT_VALUE_TABLE,
} from "../../data/tables/contract-base-tables";
import {
  ContractStatus,
  ContractDifficulty,
  ContractorType,
  DeadlineType,
  PaymentType,
} from "../../types/contract";
import type {
  Contract,
  ContractValue,
  ContractModifiers,
} from "../../types/contract";
import type { Guild } from "../../types/guild";
import { VisitorLevel, RelationLevel } from "../../types/guild";

/**
 * Configuração para geração de contratos
 */
export interface ContractGenerationConfig {
  guild: Guild;
  skipFrequentatorsReduction?: boolean;
}

/**
 * Resultado do cálculo de quantidade de contratos
 */
export interface ContractQuantityResult {
  baseGenerated: number;
  experiencedStaffBonus: number;
  frequentatorsReduction: number;
  totalGenerated: number;
  details: {
    baseRoll: number;
    appliedModifiers: string[];
  };
  // Campos extras para compatibilidade com testes
  baseQuantity: number;
  reduction: number;
  modifier: number;
  dice: string;
}

/**
 * Gerador de contratos 
 */
export class ContractGenerator {
  /**
   * Gera um ID único para contratos
   */
  private static generateId(): string {
    return `contract-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Gera um contrato base seguindo as regras do markdown
   */
  static generateBaseContract(config: ContractGenerationConfig): Contract {
    const { guild } = config;

    // Gerar valor base (1d100)
    const baseRoll = rollDice({ notation: "1d100" }).result;
    const valueResult = this.calculateContractValue(baseRoll, guild);

    // Gerar rolagens adicionais para dados de geração
    const distanceRoll = rollDice({ notation: "1d20" }).result;
    const difficultyRoll = rollDice({ notation: "1d20" }).result;

    // Gerar deadline simples
    const deadline = this.generateDeadline();

    // Estrutura básica do contrato
    const contract: Contract = {
      id: this.generateId(),
      title: `Contrato #${Math.floor(Math.random() * 1000) + 1}`,
      description: "Contrato gerado automaticamente",
      status: ContractStatus.DISPONIVEL,
      difficulty: ContractDifficulty.MEDIO,
      contractorType: ContractorType.POVO,
      contractorName: "Contratante Automático",
      value: valueResult,
      deadline,
      paymentType: PaymentType.TOTAL_GUILDA,
      generationData: {
        baseRoll,
        distanceRoll,
        difficultyRoll,
        settlementType: guild.settlementType,
      },
      createdAt: new Date(),
    };

    return contract;
  }

  /**
   * Calcula a quantidade de contratos gerados baseado no tamanho da sede
   */
  static calculateContractQuantity(
    config: ContractGenerationConfig
  ): ContractQuantityResult {
    const { guild, skipFrequentatorsReduction = false } = config;
    const details: string[] = [];

    // Pegar dados baseados no tamanho da estrutura da guilda
    const structureSize = guild.structure.size || "Pequeno e modesto (6m x 6m)";
    const diceExpression = CONTRACT_DICE_BY_SIZE[structureSize];

    if (!diceExpression) {
      throw new Error(`Tamanho de estrutura não suportado: ${structureSize}`);
    }

    // Rolagem base
    const baseRoll = rollDice({ notation: diceExpression }).result;
    let totalGenerated = baseRoll;
    details.push(`Base (${diceExpression}): ${baseRoll}`);

    // Modificador por funcionários experientes (simulado)
    let experiencedStaffBonus = 0;
    const staffDescription = guild.staff.employees || "";

    if (staffDescription.toLowerCase().includes("experientes")) {
      experiencedStaffBonus = 1;
      totalGenerated += experiencedStaffBonus;
      details.push(`Funcionários experientes: +${experiencedStaffBonus}`);
    }

    // Redução por frequentadores (simulado)
    let frequentatorsReduction = 0;
    if (
      !skipFrequentatorsReduction &&
      guild.visitors.frequency === VisitorLevel.MUITO_FREQUENTADA
    ) {
      // Rolar 1d6 para ver se reduz
      const reductionRoll = rollDice({ notation: "1d6" }).result;
      if (reductionRoll <= 2) {
        // 1-2 reduz
        frequentatorsReduction = 1;
        totalGenerated = Math.max(0, totalGenerated - frequentatorsReduction);
        details.push(
          `Frequentadores (${reductionRoll}/6): -${frequentatorsReduction}`
        );
      } else {
        details.push(`Frequentadores (${reductionRoll}/6): sem redução`);
      }
    }

    return {
      baseGenerated: baseRoll,
      experiencedStaffBonus,
      frequentatorsReduction,
      totalGenerated: Math.max(0, totalGenerated),
      details: {
        baseRoll,
        appliedModifiers: details,
      },
      // Campos extras para compatibilidade com testes
      baseQuantity: baseRoll,
      reduction: frequentatorsReduction,
      modifier: experiencedStaffBonus,
      dice: diceExpression,
    };
  }

  /**
   * Gera múltiplos contratos baseado na quantidade calculada
   */
  static generateMultipleContracts(
    config: ContractGenerationConfig
  ): Contract[] {
    const quantityResult = this.calculateContractQuantity(config);
    const contracts: Contract[] = [];

    for (let i = 0; i < quantityResult.totalGenerated; i++) {
      contracts.push(this.generateBaseContract(config));
    }

    return contracts;
  }

  /**
   * Calcula o valor do contrato
   */
  private static calculateContractValue(
    baseRoll: number,
    guild: Guild
  ): ContractValue {
    // Primeiro obter o valor base da tabela usando a rolagem 1d100
    const tableEntry = CONTRACT_VALUE_TABLE.find(
      (entry) => baseRoll >= entry.min && baseRoll <= entry.max
    );
    const baseValue = tableEntry?.result || 75; // Valor padrão se não encontrar

    // Calcular modificadores usando estrutura existente
    const modifiers = this.calculateModifiers(guild);

    // Aplicar modificadores ao valor base da tabela
    let finalReward = baseValue;

    // Aplicar modificadores básicos
    finalReward += modifiers.populationRelation || 0;
    finalReward += modifiers.governmentRelation || 0;
    finalReward += modifiers.staffPreparation || 0;

    // Garantir valor mínimo
    finalReward = Math.max(1, finalReward);

    // Calcular PO$ (10% do valor final)
    const finalGoldReward = Math.round(finalReward * 0.1 * 100) / 100;

    return {
      baseValue, // Valor da tabela baseado na rolagem 1d100
      experienceValue: 0,
      rewardValue: finalReward,
      finalGoldReward,
      modifiers,
    };
  }

  /**
   * Calcula modificadores baseados na guilda
   */
  private static calculateModifiers(guild: Guild): ContractModifiers {
    const modifiers: ContractModifiers = {
      distance: 0,
      populationRelation: 0,
      governmentRelation: 0,
      staffPreparation: 0,
      difficultyMultiplier: {
        experienceMultiplier: 1,
        rewardMultiplier: 1,
      },
      requirementsAndClauses: 0,
    };

    // Modificadores por relacionamentos usando estrutura existente
    if (guild.relations.population === RelationLevel.RUIM) {
      modifiers.populationRelation = -10;
    } else if (guild.relations.population === RelationLevel.BOA) {
      modifiers.populationRelation = 5;
    }

    return modifiers;
  }

  /**
   * Gera prazo para o contrato
   */
  private static generateDeadline() {
    const typeOptions = ["urgente", "normal", "flexível"];
    const randomType =
      typeOptions[Math.floor(Math.random() * typeOptions.length)];

    let timeValue: number;
    let type: DeadlineType;

    switch (randomType) {
      case "urgente":
        timeValue = rollDice({ notation: "1d3" }).result;
        type = DeadlineType.DIAS;
        break;
      case "normal":
        timeValue = rollDice({ notation: "1d6" }).result;
        type = DeadlineType.SEMANAS;
        break;
      case "flexível":
        timeValue = rollDice({ notation: "2d4" }).result;
        type = DeadlineType.SEMANAS;
        break;
      default:
        timeValue = 1;
        type = DeadlineType.SEMANAS;
    }

    return {
      type,
      value: `${timeValue} ${type === DeadlineType.DIAS ? "dias" : "semanas"}`,
      isFlexible: randomType === "flexível",
      isArbitrary: false,
    };
  }
}
