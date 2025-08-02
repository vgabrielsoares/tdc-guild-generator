import { rollDice } from "../dice";
import {
  CONTRACT_DICE_BY_SIZE,
  CONTRACT_VALUE_TABLE,
  CONTRACT_QUANTITY_TABLE,
  CONTRACT_DEADLINE_TABLE,
  CONTRACT_DIFFICULTY_TABLE,
  CONTRACT_DISTANCE_TABLE,
  STAFF_CONDITION_MODIFIERS,
  POPULATION_RELATION_MODIFIERS,
  GOVERNMENT_RELATION_MODIFIERS,
  STAFF_PREPARATION_ROLL_MODIFIERS,
  calculateExtendedValue,
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

    // 1. Rolar valor base (1d100)
    const baseRoll = rollDice({ notation: "1d100" }).result;
    
    // 2. Aplicar modificador de funcionários à rolagem se necessário
    let adjustedRoll = baseRoll;
    const staffDescription = guild.staff.employees || "";
    if (staffDescription.toLowerCase().includes("experientes")) {
      adjustedRoll += STAFF_PREPARATION_ROLL_MODIFIERS["experientes"] || 2;
    } else if (staffDescription.toLowerCase().includes("despreparados")) {
      adjustedRoll += STAFF_PREPARATION_ROLL_MODIFIERS["despreparados"] || -2;
    }
    
    // Garantir que o roll ajustado esteja dentro dos limites da tabela
    adjustedRoll = Math.max(1, Math.min(100, adjustedRoll));

    // 3. Calcular valor usando a rolagem ajustada
    const valueResult = this.calculateContractValue(adjustedRoll, guild);

    // 4. Gerar rolagens adicionais para dados de geração
    const distanceRoll = rollDice({ notation: "1d20" }).result;
    const difficultyRoll = rollDice({ notation: "1d20" }).result;

    // 5. Gerar deadline usando a tabela
    const deadline = this.generateDeadline();

    // 6. Determinar dificuldade baseada na rolagem
    const difficultyEntry = CONTRACT_DIFFICULTY_TABLE.find(
      (entry) => difficultyRoll >= entry.min && difficultyRoll <= entry.max
    );
    const difficulty = difficultyEntry?.result.difficulty || ContractDifficulty.MEDIO;

    // 7. Estrutura básica do contrato
    const contract: Contract = {
      id: this.generateId(),
      title: `Contrato #${Math.floor(Math.random() * 1000) + 1}`,
      description: "Contrato gerado automaticamente",
      status: ContractStatus.DISPONIVEL,
      difficulty,
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

    // 1. Pegar dados baseados no tamanho da estrutura da guilda
    const structureSize = guild.structure.size || "Pequeno e modesto (6m x 6m)";
    const diceExpression = CONTRACT_DICE_BY_SIZE[structureSize];

    if (!diceExpression) {
      throw new Error(`Tamanho de estrutura não suportado: ${structureSize}`);
    }

    // 2. Rolagem base usando o dado da sede
    const baseRoll = rollDice({ notation: diceExpression }).result;
    let totalGenerated = baseRoll;
    details.push(`Base (${diceExpression}): ${baseRoll}`);

    // 3. Aplicar modificadores por condição dos funcionários
    let staffModifier = 0;
    const staffDescription = guild.staff.employees || "";

    if (staffDescription.toLowerCase().includes("experientes")) {
      staffModifier = STAFF_CONDITION_MODIFIERS["experientes"] || 1;
      totalGenerated += staffModifier;
      details.push(`Funcionários experientes: +${staffModifier}`);
    } else if (staffDescription.toLowerCase().includes("despreparados")) {
      staffModifier = STAFF_CONDITION_MODIFIERS["despreparados"] || -1;
      totalGenerated += staffModifier;
      details.push(`Funcionários despreparados: ${staffModifier}`);
    }

    // 4. Rolar na tabela de quantidade disponível (1d20)
    const quantityRoll = rollDice({ notation: "1d20" }).result;
    const quantityEntry = CONTRACT_QUANTITY_TABLE.find(
      (entry) => quantityRoll >= entry.min && quantityRoll <= entry.max
    );

    if (quantityEntry) {
      // Extrair apenas o dado da descrição (ex: "1d4 contratos" -> "1d4")
      const diceMatch = quantityEntry.result.match(/(\d+d\d+(?:\+\d+)?)/);
      if (diceMatch) {
        const quantityDice = diceMatch[1];
        const additionalContracts = rollDice({ notation: quantityDice }).result;
        totalGenerated += additionalContracts;
        details.push(`Quantidade adicional (${quantityRoll}/20 = ${quantityDice}): +${additionalContracts}`);
      } else if (quantityEntry.result.includes("1 contrato")) {
        totalGenerated += 1;
        details.push(`Quantidade adicional (${quantityRoll}/20): +1 contrato`);
      }
    }

    // 5. Aplicar redução por frequentadores
    let frequentatorsReduction = 0;
    if (!skipFrequentatorsReduction) {
      const visitorFrequency = guild.visitors.frequency;
      
      // Mapear VisitorLevel para os valores da tabela
      let reductionDice = "";
      switch (visitorFrequency) {
        case VisitorLevel.VAZIA:
          // "Todos os contratos estão disponíveis" - sem redução
          details.push("Frequentadores (Vazia): sem redução");
          break;
        case VisitorLevel.QUASE_DESERTA:
          reductionDice = "1"; // -1 contrato
          break;
        case VisitorLevel.POUCO_MOVIMENTADA:
          reductionDice = "1d4";
          break;
        case VisitorLevel.NEM_MUITO_NEM_POUCO:
          reductionDice = "1d6+1";
          break;
        case VisitorLevel.MUITO_FREQUENTADA:
          reductionDice = "2d6";
          break;
        case VisitorLevel.ABARROTADA:
          reductionDice = "3d6";
          break;
        case VisitorLevel.LOTADA:
          reductionDice = "4d6";
          break;
      }

      if (reductionDice && reductionDice !== "1") {
        frequentatorsReduction = rollDice({ notation: reductionDice }).result;
        details.push(`Redução por frequentadores (${reductionDice}): -${frequentatorsReduction}`);
      } else if (reductionDice === "1") {
        frequentatorsReduction = 1;
        details.push(`Redução por frequentadores: -1`);
      }

      totalGenerated = Math.max(0, totalGenerated - frequentatorsReduction);
    }

    return {
      baseGenerated: baseRoll,
      experiencedStaffBonus: Math.max(0, staffModifier),
      frequentatorsReduction,
      totalGenerated: Math.max(0, totalGenerated),
      details: {
        baseRoll,
        appliedModifiers: details,
      },
      // Campos extras para compatibilidade com testes
      baseQuantity: baseRoll,
      reduction: frequentatorsReduction,
      modifier: staffModifier,
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
   * 1. Rola 1d100 para valor base na tabela
   * 2. Aplica modificadores de distância
   * 3. Aplica modificadores de relações
   * 4. Aplica modificadores de funcionários
   * 5. Aplica multiplicadores de dificuldade
   */
  private static calculateContractValue(
    baseRoll: number,
    guild: Guild
  ): ContractValue {
    // 1. Obter valor base da tabela usando a rolagem 1d100
    const tableEntry = CONTRACT_VALUE_TABLE.find(
      (entry) => baseRoll >= entry.min && baseRoll <= entry.max
    );
    let baseValue = tableEntry?.result || 75;

    // Tratar caso especial 101+ (valor anterior * 1.1)
    if (baseRoll > 100) {
      baseValue = calculateExtendedValue(baseRoll, baseValue);
    }

    // 2. Calcular modificadores
    const modifiers = this.calculateModifiers(guild);

    // 3. Separar valores de experiência e recompensa (começam iguais)
    let experienceValue = baseValue;
    let rewardValue = baseValue;

    // 4. Aplicar modificadores de distância
    experienceValue += modifiers.distance;
    rewardValue += modifiers.distance;

    // 5. Aplicar modificadores de relação com população
    experienceValue += modifiers.populationRelation;
    rewardValue += modifiers.populationRelation;

    // 6. Aplicar modificadores de relação com governo
    experienceValue += modifiers.governmentRelation;
    rewardValue += modifiers.governmentRelation;

    // 7. Aplicar modificadores de funcionários (já aplicados na rolagem)
    // staffPreparation é aplicado à rolagem d100, não ao valor final

    // 8. Aplicar multiplicadores de dificuldade
    experienceValue = Math.floor(experienceValue * modifiers.difficultyMultiplier.experienceMultiplier);
    rewardValue = Math.floor(rewardValue * modifiers.difficultyMultiplier.rewardMultiplier);

    // 9. Garantir valores mínimos
    experienceValue = Math.max(1, experienceValue);
    rewardValue = Math.max(1, rewardValue);

    // 10. Calcular PO$ final (recompensa * 0.1)
    const finalGoldReward = Math.round(rewardValue * 0.1 * 100) / 100;

    return {
      baseValue, // Valor original da tabela
      experienceValue, // Valor para estruturar o contrato (orçamento XP)
      rewardValue, // Valor da recompensa em pontos
      finalGoldReward, // Valor final em PO$
      modifiers,
    };
  }

  /**
   * Calcula modificadores baseados na guilda seguindo as regras do markdown
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

    // 1. Rolar distância (1d20) e aplicar modificadores
    const distanceRoll = rollDice({ notation: "1d20" }).result;
    const distanceEntry = CONTRACT_DISTANCE_TABLE.find(
      (entry) => distanceRoll >= entry.min && distanceRoll <= entry.max
    );
    if (distanceEntry) {
      modifiers.distance = distanceEntry.result.valueModifier;
    }

    // 2. Aplicar modificadores por relação com população
    const populationRelation = this.mapRelationLevelToString(guild.relations.population);
    const populationMods = POPULATION_RELATION_MODIFIERS[populationRelation];
    if (populationMods) {
      modifiers.populationRelation = populationMods.rewardModifier; // Usar rewardModifier conforme regras
    }

    // 3. Aplicar modificadores por relação com governo
    const governmentRelation = this.mapRelationLevelToString(guild.relations.government);
    const governmentMods = GOVERNMENT_RELATION_MODIFIERS[governmentRelation];
    if (governmentMods) {
      modifiers.governmentRelation = governmentMods.rewardModifier; // Usar rewardModifier conforme regras
    }

    // 4. Modificadores de funcionários (aplicados à rolagem d100, não ao valor final)
    const staffDescription = guild.staff.employees || "";
    if (staffDescription.toLowerCase().includes("experientes")) {
      modifiers.staffPreparation = STAFF_PREPARATION_ROLL_MODIFIERS["experientes"] || 2;
    } else if (staffDescription.toLowerCase().includes("despreparados")) {
      modifiers.staffPreparation = STAFF_PREPARATION_ROLL_MODIFIERS["despreparados"] || -2;
    }

    // 5. Rolar dificuldade (1d20) e aplicar multiplicadores
    const difficultyRoll = rollDice({ notation: "1d20" }).result;
    const difficultyEntry = CONTRACT_DIFFICULTY_TABLE.find(
      (entry) => difficultyRoll >= entry.min && difficultyRoll <= entry.max
    );
    if (difficultyEntry) {
      modifiers.difficultyMultiplier = {
        experienceMultiplier: difficultyEntry.result.experienceMultiplier,
        rewardMultiplier: difficultyEntry.result.rewardMultiplier,
      };
    }

    return modifiers;
  }

  /**
   * Mapeia RelationLevel enum para strings das tabelas
   */
  private static mapRelationLevelToString(relation: RelationLevel): string {
    switch (relation) {
      case RelationLevel.PESSIMA:
      case RelationLevel.PESSIMA_ODIO:
        return "Péssima";
      case RelationLevel.RUIM:
      case RelationLevel.RUIM_MERCENARIOS:
      case RelationLevel.RUIM_CORDIAL:
      case RelationLevel.RUIM_PROBLEMAS:
        return "Ruim";
      case RelationLevel.DIPLOMATICA:
        return "Diplomática";
      case RelationLevel.OPINIAO_DIVIDIDA:
        return "Dividida";
      case RelationLevel.BOA:
      case RelationLevel.BOA_TENSAO:
      case RelationLevel.BOA_AJUDAM:
      case RelationLevel.BOA_SEGUROS:
        return "Boa";
      case RelationLevel.MUITO_BOA:
      case RelationLevel.MUITO_BOA_PERDIDOS:
        return "Muito boa";
      case RelationLevel.EXCELENTE:
      case RelationLevel.EXCELENTE_FUNCIONAR:
        return "Excelente";
      default:
        return "Diplomática"; // Valor padrão
    }
  }

  /**
   * Gera prazo para o contrato seguindo a tabela do markdown
   */
  private static generateDeadline() {
    // Rolar na tabela de prazos (1d20)
    const deadlineRoll = rollDice({ notation: "1d20" }).result;
    const deadlineEntry = CONTRACT_DEADLINE_TABLE.find(
      (entry) => deadlineRoll >= entry.min && deadlineRoll <= entry.max
    );

    if (!deadlineEntry) {
      // Valor padrão se não encontrar na tabela
      return {
        type: DeadlineType.SEM_PRAZO,
        value: "Sem prazo",
        isFlexible: true,
        isArbitrary: true,
      };
    }

    const result = deadlineEntry.result;
    
    // Se o prazo contém dados, fazer a rolagem
    let finalValue = result.deadline;
    if (result.deadline.includes("d")) {
      const diceMatch = result.deadline.match(/(\d+d\d+(?:\+\d+)?)/);
      if (diceMatch) {
        const diceRoll = rollDice({ notation: diceMatch[1] }).result;
        finalValue = result.deadline.replace(diceMatch[1], diceRoll.toString());
      }
    }

    // Determinar o tipo baseado no conteúdo
    let type: DeadlineType;
    if (finalValue.includes("sem prazo") || finalValue.toLowerCase().includes("sem prazo")) {
      type = DeadlineType.SEM_PRAZO;
    } else if (finalValue.includes("dia")) {
      type = DeadlineType.DIAS;
    } else if (finalValue.includes("semana")) {
      type = DeadlineType.SEMANAS;
    } else if (result.isArbitrary) {
      type = DeadlineType.ARBITRARIO;
    } else if (result.hasOpportunityWindow) {
      type = DeadlineType.JANELA_OPORTUNIDADE;
    } else {
      type = DeadlineType.SEM_PRAZO;
    }

    return {
      type,
      value: finalValue,
      isFlexible: result.isFlexible,
      isArbitrary: result.isArbitrary,
    };
  }
}
