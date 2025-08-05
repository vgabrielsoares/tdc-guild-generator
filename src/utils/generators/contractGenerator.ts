import { rollDice } from "../dice";
import { rollOnTable } from "../tableRoller";
import {
  CONTRACT_DICE_BY_SIZE,
  CONTRACT_VALUE_TABLE,
  CONTRACT_QUANTITY_TABLE,
  CONTRACT_DEADLINE_TABLE,
  CONTRACT_DIFFICULTY_TABLE,
  CONTRACT_DISTANCE_TABLE,
  STAFF_CONDITION_MODIFIERS,
  STAFF_PREPARATION_ROLL_MODIFIERS,
  POPULATION_RELATION_MODIFIERS,
  GOVERNMENT_RELATION_MODIFIERS,
  calculateExtendedValue,
} from "../../data/tables/contract-base-tables";

import {
  CONTRACT_PREREQUISITES_TABLE,
  CONTRACT_CLAUSES_TABLE,
  CONTRACT_PAYMENT_TYPE_TABLE,
  getPrerequisiteDiceModifier,
  getClauseDiceModifier,
  getPaymentDiceModifier,
} from "../../data/tables/contract-requirements-tables";

import {
  MAIN_OBJECTIVE_TABLE,
  getObjectiveSpecificationTable,
  shouldRollTwiceForObjective,
  shouldRollTwiceForSpecification,
} from "../../data/tables/contract-content-tables";

import {
  ANTAGONIST_TYPES_TABLE,
  ANTAGONIST_DETAIL_TABLE_MAP,
  mapAntagonistTypeToCategory,
  shouldRollTwice,
} from "../../data/tables/contract-antagonist-tables";

import {
  COMPLICATION_TYPES_TABLE,
  COMPLICATION_DETAIL_TABLES,
} from "../../data/tables/contract-complications-tables";

import {
  ALLY_APPEARANCE_CHANCE_TABLE,
  ALLY_TYPES_TABLE,
  ALLY_APPEARANCE_TIMING_TABLE,
  ALLY_ARTIFACT_TABLE,
  ALLY_POWERFUL_CREATURE_TABLE,
  ALLY_UNEXPECTED_TABLE,
  ALLY_SUPERNATURAL_HELP_TABLE,
  ALLY_ORDINARY_CIVILIANS_TABLE,
  ALLY_NATURE_TABLE,
  ALLY_ORGANIZATIONS_TABLE,
  ALLY_REFUGE_TABLE,
  ALLY_ADVENTURERS_TABLE,
  ALLY_ADVENTURER_LEVEL_TABLE,
  ALLY_FRIENDLY_MONSTROSITY_TABLE,
  ALLY_MONSTROSITY_CHARACTERISTICS_TABLE,
  // Tabelas de recompensas adicionais
  REWARD_CHANCE_TABLE,
  REWARD_TYPES_TABLE,
  REWARD_RICHES_TABLE,
  REWARD_MAGICAL_ARTIFACTS_TABLE,
  REWARD_POWER_TABLE,
  REWARD_KNOWLEDGE_TABLE,
  REWARD_INFLUENCE_TABLE,
  REWARD_GLORY_TABLE,
  REWARD_MORAL_TABLE,
  REWARD_ALTERNATIVE_PAYMENT_TABLE,
  REWARD_BIZARRE_TABLE,
  REWARD_DECEPTIVE_TABLE,
} from "../../data/tables/contract-rewards-tables";

import {
  SEVERE_CONSEQUENCES_CHANCE_TABLE,
  SEVERE_CONSEQUENCES_TYPES_TABLE,
  SEVERE_CONSEQUENCE_DETAIL_TABLES,
} from "../../data/tables/contract-consequences-tables";

import {
  MAIN_LOCATION_TABLE,
  LOCATION_IMPORTANCE_TABLE,
  LOCATION_PECULIARITY_TABLE,
  DISTRITO_ESPECIFICO_TABLE,
  getLocationSpecificationTable,
  shouldRollTwiceForLocation,
  requiresDistrictRoll,
  mapLocationToCategory,
} from "../../data/tables/contract-location-tables";

import {
  ContractStatus,
  ContractDifficulty,
  ContractorType,
  DeadlineType,
  PaymentType,
  ObjectiveCategory,
  AntagonistCategory,
  ComplicationCategory,
  TwistWho,
  TwistWhat,
  AllyCategory,
  AllyTiming,
  SevereConsequenceCategory,
  RewardCategory,
} from "../../types/contract";
import type {
  Contract,
  ContractValue,
  ContractModifiers,
  ContractObjective,
  ContractLocation,
  Antagonist,
  Complication,
  Twist,
  Ally,
  SevereConsequence,
  AdditionalReward,
} from "../../types/contract";
import type { Guild } from "../../types/guild";
import { VisitorLevel, RelationLevel } from "../../types/guild";
import { GOVERNMENT_CONTRACTOR_TABLE } from "../../data/tables/contract-content-tables";

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

    // 2. Calcular valor aplicando todos os modificadores
    const valueCalculationResult = this.calculateContractValue(baseRoll, guild);
    const { contractValue, prerequisites, clauses } = valueCalculationResult;

    // 3. Gerar rolagens adicionais para dados de geração
    const distanceRoll = rollDice({ notation: "1d20" }).result;
    const difficultyRoll = rollDice({ notation: "1d20" }).result;

    // 4. Gerar deadline usando a tabela
    const deadline = this.generateDeadline();

    // 5. Determinar dificuldade baseada na rolagem
    const difficultyEntry = CONTRACT_DIFFICULTY_TABLE.find(
      (entry) => difficultyRoll >= entry.min && difficultyRoll <= entry.max
    );
    const difficulty =
      difficultyEntry?.result.difficulty || ContractDifficulty.MEDIO;

    // 6. Gerar contratante seguindo as regras do markdown
    const contractor = this.generateContractor(guild);

    // 7. Gerar objetivo conforme tabela do markdown
    const objective = this.generateObjective();

    // 8. Gerar localidade conforme tabela do markdown
    const location = this.generateLocation();

    // 9. Gerar tipo de pagamento
    const paymentType = this.generatePaymentType(contractValue.rewardValue);

    // 10. Gerar antagonista
    const antagonist = this.generateAntagonist();

    // 11. Gerar complicações
    const complications = this.generateComplications();

    // 12. Gerar reviravoltas
    const twists = this.generateTwists();

    // 13. Gerar aliados
    const allies = this.generateAllies();

    // 14. Gerar consequências severas (para quando o contrato falha)
    const severeConsequences = this.generateSevereConsequences();

    // 15. Gerar recompensas adicionais
    const additionalRewards = this.generateAdditionalRewards();

    // 16. Gerar descrição completa do contrato
    const fullDescription = this.generateFullContractDescription({
      objective,
      location,
      contractor,
      antagonist,
      complications,
      twists,
      allies,
      severeConsequences,
      additionalRewards,
      prerequisites,
      clauses,
      finalValueResult: contractValue,
      deadline,
      paymentType,
    });

    // 17. Estrutura básica do contrato
    const contract: Contract = {
      id: this.generateId(),
      title: `Contrato #${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`,
      description: fullDescription,
      status: ContractStatus.DISPONIVEL,
      difficulty,
      contractorType: contractor.type,
      contractorName: contractor.name,
      objective,
      location,
      prerequisites,
      clauses,
      antagonist,
      complications,
      twists,
      allies,
      severeConsequences,
      additionalRewards: additionalRewards || [],
      value: contractValue,
      deadline,
      paymentType,
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
        details.push(
          `Quantidade adicional (${quantityRoll}/20 = ${quantityDice}): +${additionalContracts}`
        );
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
        details.push(
          `Redução por frequentadores (${reductionDice}): -${frequentatorsReduction}`
        );
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
   * 2. Calcula modificadores que afetam a rolagem
   * 3. Gera pré-requisitos e cláusulas baseados no valor preliminar
   * 4. Aplica modificadores à rolagem
   * 5. Consulta a tabela novamente com as rolagens modificadas
   * 6. Aplica multiplicadores de dificuldade
   */
  private static calculateContractValue(
    baseRoll: number,
    guild: Guild
  ): {
    contractValue: ContractValue;
    prerequisites: string[];
    clauses: string[];
  } {
    // 1. Obter valor base da tabela usando a rolagem 1d100
    const baseTableEntry = CONTRACT_VALUE_TABLE.find(
      (entry) => baseRoll >= entry.min && baseRoll <= entry.max
    );
    let baseValue = baseTableEntry?.result || 75;

    // Tratar caso especial 101+ (valor anterior * 1.1)
    if (baseRoll > 100) {
      baseValue = calculateExtendedValue(baseRoll, baseValue);
    }

    // 2. Calcular todos os modificadores que afetam a rolagem
    const rollModifiers = this.calculateRollModifiers(guild);

    // 3. Gerar pré-requisitos e cláusulas baseados no valor base preliminar
    // Isso nos permite calcular o bônus que será aplicado à rolagem
    const preliminaryExperienceValue = baseValue;
    const preliminaryRewardValue = baseValue;

    const prerequisites = this.generatePrerequisites(
      preliminaryExperienceValue
    );
    const clauses = this.generateClauses(preliminaryRewardValue);

    // 4. Calcular bônus de pré-requisitos e cláusulas (+5 por item na rolagem)
    const requirementsBonusToRoll = (prerequisites.length + clauses.length) * 5;

    // 5. Aplicar modificadores às rolagens separadas para XP e Recompensa
    // Incluindo bônus de pré-requisitos e cláusulas
    const experienceRoll = Math.max(
      1,
      Math.min(100, baseRoll + rollModifiers.experienceModifier)
    );
    const rewardRoll = Math.max(
      1,
      Math.min(
        100,
        baseRoll + rollModifiers.rewardModifier + requirementsBonusToRoll
      )
    );

    // 6. Consultar a tabela novamente com as rolagens modificadas
    const experienceTableEntry = CONTRACT_VALUE_TABLE.find(
      (entry) => experienceRoll >= entry.min && experienceRoll <= entry.max
    );
    let experienceValue = experienceTableEntry?.result || 75;

    const rewardTableEntry = CONTRACT_VALUE_TABLE.find(
      (entry) => rewardRoll >= entry.min && rewardRoll <= entry.max
    );
    let rewardValue = rewardTableEntry?.result || 75;

    // Tratar casos especiais 101+ para ambas as rolagens
    if (experienceRoll > 100) {
      experienceValue = calculateExtendedValue(experienceRoll, experienceValue);
    }
    if (rewardRoll > 100) {
      rewardValue = calculateExtendedValue(rewardRoll, rewardValue);
    }

    // 7. Aplicar multiplicadores de dificuldade
    const difficultyMultipliers = this.calculateDifficultyMultipliers();
    experienceValue = Math.floor(
      experienceValue * difficultyMultipliers.experienceMultiplier
    );
    rewardValue = Math.floor(
      rewardValue * difficultyMultipliers.rewardMultiplier
    );

    // 8. Garantir valores mínimos
    experienceValue = Math.max(1, experienceValue);
    rewardValue = Math.max(1, rewardValue);

    // 9. Calcular PO$ final (recompensa * 0.1)
    const finalGoldReward = Math.round(rewardValue * 10) / 100;

    // 10. Construir objeto de modificadores para referência
    const modifiers: ContractModifiers = {
      distance: rollModifiers.distance,
      populationRelationValue: rollModifiers.populationRelationValue,
      populationRelationReward: rollModifiers.populationRelationReward,
      governmentRelationValue: rollModifiers.governmentRelationValue,
      governmentRelationReward: rollModifiers.governmentRelationReward,
      staffPreparation: rollModifiers.staffPreparation,
      difficultyMultiplier: difficultyMultipliers,
      requirementsAndClauses: requirementsBonusToRoll,
    };

    const contractValue: ContractValue = {
      baseValue, // Valor original da tabela
      experienceValue, // Valor para estruturar o contrato (orçamento XP)
      rewardValue, // Valor da recompensa em pontos
      finalGoldReward, // Valor final em PO$
      modifiers,
    };

    return {
      contractValue,
      prerequisites,
      clauses,
    };
  }

  /**
   * Calcula modificadores que afetam a rolagem d100
   */
  private static calculateRollModifiers(guild: Guild): {
    experienceModifier: number;
    rewardModifier: number;
    distance: number;
    populationRelationValue: number;
    populationRelationReward: number;
    governmentRelationValue: number;
    governmentRelationReward: number;
    staffPreparation: number;
  } {
    let experienceModifier = 0;
    let rewardModifier = 0;

    // 1. Modificadores de distância (afetam tanto valor quanto recompensa)
    const distanceRoll = rollDice({ notation: "1d20" }).result;
    const distanceEntry = CONTRACT_DISTANCE_TABLE.find(
      (entry) => distanceRoll >= entry.min && distanceRoll <= entry.max
    );
    const distanceModifier = distanceEntry?.result.valueModifier || 0;
    experienceModifier += distanceModifier;
    rewardModifier += distanceModifier;

    // 2. Modificadores por relação com população
    const populationRelation = this.mapRelationLevelToString(
      guild.relations.population
    );
    const populationMods = POPULATION_RELATION_MODIFIERS[
      populationRelation
    ] || {
      valueModifier: 0,
      rewardModifier: 0,
    };
    experienceModifier += populationMods.valueModifier;
    rewardModifier += populationMods.rewardModifier;

    // 3. Modificadores por relação com governo
    const governmentRelation = this.mapRelationLevelToString(
      guild.relations.government
    );
    const governmentMods = GOVERNMENT_RELATION_MODIFIERS[
      governmentRelation
    ] || {
      valueModifier: 0,
      rewardModifier: 0,
    };
    experienceModifier += governmentMods.valueModifier;
    rewardModifier += governmentMods.rewardModifier;

    // 4. Modificadores de funcionários (aplicados apenas à rolagem de recompensa)
    let staffPreparation = 0;
    const staffDescription = guild.staff.employees || "";
    if (staffDescription.toLowerCase().includes("experientes")) {
      staffPreparation = STAFF_PREPARATION_ROLL_MODIFIERS["experientes"] || 2;
    } else if (staffDescription.toLowerCase().includes("despreparados")) {
      staffPreparation =
        STAFF_PREPARATION_ROLL_MODIFIERS["despreparados"] || -2;
    }
    rewardModifier += staffPreparation; // Funcionários afetam apenas a recompensa

    return {
      experienceModifier,
      rewardModifier,
      distance: distanceModifier,
      populationRelationValue: populationMods.valueModifier,
      populationRelationReward: populationMods.rewardModifier,
      governmentRelationValue: governmentMods.valueModifier,
      governmentRelationReward: governmentMods.rewardModifier,
      staffPreparation,
    };
  }

  /**
   * Calcula multiplicadores de dificuldade
   */
  private static calculateDifficultyMultipliers(): {
    experienceMultiplier: number;
    rewardMultiplier: number;
  } {
    const difficultyRoll = rollDice({ notation: "1d20" }).result;
    const difficultyEntry = CONTRACT_DIFFICULTY_TABLE.find(
      (entry) => difficultyRoll >= entry.min && difficultyRoll <= entry.max
    );

    return {
      experienceMultiplier: difficultyEntry?.result.experienceMultiplier || 1,
      rewardMultiplier: difficultyEntry?.result.rewardMultiplier || 1,
    };
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
    if (
      finalValue.includes("sem prazo") ||
      finalValue.toLowerCase().includes("sem prazo")
    ) {
      type = DeadlineType.SEM_PRAZO;
    } else if (finalValue.includes("dia")) {
      type = DeadlineType.DIAS;
    } else if (finalValue.includes("semana")) {
      type = DeadlineType.SEMANAS;
    } else {
      type = DeadlineType.SEM_PRAZO;
    }

    return {
      type,
      value: finalValue,
    };
  }

  /**
   * Gera o contratante
   * 1. Rola 1d20 para determinar tipo (Povo/Instituição/Governo)
   * 2. Aplica modificadores por relação com população e governo
   * 3. Se for governo, gera contratante específico
   */
  private static generateContractor(guild: Guild): {
    type: ContractorType;
    name: string;
    description: string;
  } {
    // 1. Rolagem base 1d20
    let contractorRoll = rollDice({ notation: "1d20" }).result;

    // 2. Aplicar modificadores por relação com população
    const populationRelation = this.mapRelationLevelToString(
      guild.relations.population
    );
    switch (populationRelation) {
      case "Péssima":
        contractorRoll += 4;
        break;
      case "Ruim":
        contractorRoll += 2;
        break;
      case "Dividida":
        contractorRoll += 0;
        break;
      case "Boa":
        contractorRoll -= 1;
        break;
      case "Muito boa":
        contractorRoll -= 2;
        break;
      case "Excelente":
        contractorRoll -= 5;
        break;
    }

    // 3. Aplicar modificadores por relação com governo
    const governmentRelation = this.mapRelationLevelToString(
      guild.relations.government
    );
    switch (governmentRelation) {
      case "Péssima":
        contractorRoll -= 4;
        break;
      case "Ruim":
        contractorRoll -= 2;
        break;
      case "Diplomática":
        contractorRoll += 0;
        break;
      case "Boa":
        contractorRoll += 1;
        break;
      case "Muito boa":
        contractorRoll += 2;
        break;
      case "Excelente":
        contractorRoll += 5;
        break;
    }

    // 4. Determinar tipo de contratante baseado no resultado modificado
    let contractorType: ContractorType;
    let description = "";

    if (contractorRoll <= 12) {
      contractorType = ContractorType.POVO;
      description = "Membro da população local";
    } else if (contractorRoll <= 14) {
      contractorType = ContractorType.INSTITUICAO;
      description = "Representante de uma instituição de ofício";
    } else {
      contractorType = ContractorType.GOVERNO;
      description = "Representante do governo local";
    }

    // 5. Gerar nome básico do contratante
    let contractorName = this.generateBasicContractorName(contractorType);

    // 6. Se for governo, determinar contratante específico
    if (contractorType === ContractorType.GOVERNO) {
      const governmentDetail = this.generateGovernmentContractor();
      contractorName = governmentDetail.name;
      description = governmentDetail.description;
    }

    return {
      type: contractorType,
      name: contractorName,
      description,
    };
  }

  /**
   * Gera contratante específico do governo
   */
  private static generateGovernmentContractor(): {
    name: string;
    description: string;
  } {
    const roll = rollDice({ notation: "1d20" }).result;
    const entry = GOVERNMENT_CONTRACTOR_TABLE.find(
      (e) => roll >= e.min && roll <= e.max
    );
    if (!entry) {
      return {
        name: "Funcionário desconhecido",
        description: "Contratante do governo não identificado",
      };
    }
    return {
      name: entry.result.name,
      description: entry.result.description,
    };
  }

  /**
   * Gera nome básico para o contratante baseado apenas no tipo
   */
  private static generateBasicContractorName(type: ContractorType): string {
    switch (type) {
      case ContractorType.POVO:
        return "Cidadão Local";
      case ContractorType.INSTITUICAO:
        return "Representante Institucional";
      case ContractorType.GOVERNO:
      default:
        return "Agente Governamental";
    }
  }

  /**
   * Gera objetivo principal e especificações
   */
  private static generateObjective(): ContractObjective {
    // 1. Rolar objetivo principal (1d20)
    const objectiveResult = rollOnTable(
      MAIN_OBJECTIVE_TABLE,
      [],
      "Objetivo Principal"
    );

    // 2. Verificar se deve rolar duas vezes
    if (shouldRollTwiceForObjective(objectiveResult.result)) {
      // Gerar dois objetivos separados
      const firstObjective = this.generateSingleObjective();
      const secondObjective = this.generateSingleObjective();

      return {
        category: firstObjective.category,
        description: `${firstObjective.description} Além disso, ${secondObjective.description}`,
        specificObjective: `${firstObjective.specificObjective} e ${secondObjective.specificObjective}`,
      };
    }

    // 3. Gerar especificação baseada na categoria
    const specification = this.generateObjectiveSpecification(
      objectiveResult.result.category
    );

    return {
      category: objectiveResult.result.category,
      description: objectiveResult.result.description,
      specificObjective: specification.target,
    };
  }

  /**
   * Gera um objetivo individual para casos de "role duas vezes"
   */
  private static generateSingleObjective(): ContractObjective {
    let objectiveResult;
    do {
      objectiveResult = rollOnTable(
        MAIN_OBJECTIVE_TABLE,
        [],
        "Objetivo Principal"
      );
      // Evitar recursão infinita - se der "role duas vezes", rolar novamente
    } while (objectiveResult.result.name === "Role duas vezes e use ambos");

    const specification = this.generateObjectiveSpecification(
      objectiveResult.result.category
    );

    return {
      category: objectiveResult.result.category,
      description: objectiveResult.result.description,
      specificObjective: specification.target,
    };
  }

  /**
   * Gera especificação do objetivo baseado na categoria usando as tabelas implementadas
   */
  private static generateObjectiveSpecification(category: ObjectiveCategory): {
    target: string;
    description: string;
  } {
    const specTable = getObjectiveSpecificationTable(category);
    const specResult = rollOnTable(specTable, [], "Especificação do Objetivo");

    // Verificar se deve rolar duas vezes para a especificação
    if (shouldRollTwiceForSpecification(specResult.result)) {
      // Gerar duas especificações da mesma categoria
      const firstSpec = this.generateSingleSpecification(category);
      const secondSpec = this.generateSingleSpecification(category);

      return {
        target: `${firstSpec.target} e ${secondSpec.target}`,
        description: `${firstSpec.description} Além disso, ${secondSpec.description}`,
      };
    }

    return specResult.result;
  }

  /**
   * Gera uma especificação individual para casos de "role duas vezes"
   */
  private static generateSingleSpecification(category: ObjectiveCategory): {
    target: string;
    description: string;
  } {
    const specTable = getObjectiveSpecificationTable(category);
    let specResult;

    do {
      specResult = rollOnTable(specTable, [], "Especificação Individual");
      // Evitar recursão infinita - se der "role duas vezes", rolar novamente
    } while (specResult.result.rollTwice === true);

    return specResult.result;
  }

  /**
   * Gera localidade do contrato seguindo as regras do markdown
   */
  private static generateLocation(): ContractLocation {
    // 1. Determinar localidade principal
    const mainLocationResult = rollOnTable(MAIN_LOCATION_TABLE);
    const mainLocationData = mainLocationResult.result;

    // 2. Gerar importância do local
    const importanceResult = rollOnTable(LOCATION_IMPORTANCE_TABLE);
    const importance = {
      type: importanceResult.result.type,
      name: importanceResult.result.name,
      description: importanceResult.result.description,
    };

    // 3. Gerar peculiaridade do local
    const peculiarityResult = rollOnTable(LOCATION_PECULIARITY_TABLE);
    const peculiarity = {
      type: peculiarityResult.result.type,
      name: peculiarityResult.result.name,
      description: peculiarityResult.result.description,
    };

    // 4. Gerar especificação da localidade específica
    const specificationTable = getLocationSpecificationTable(
      mainLocationData.category
    );
    const specificationResult = rollOnTable(specificationTable);

    // Tratar casos de "role duas vezes"
    const specifications: Array<{ location: string; description: string }> = [];

    if (shouldRollTwiceForLocation(specificationResult.result)) {
      // Rolar duas vezes e usar ambos
      const firstSpec = rollOnTable(specificationTable);
      const secondSpec = rollOnTable(specificationTable);
      specifications.push(
        {
          location: firstSpec.result.location,
          description: firstSpec.result.description,
        },
        {
          location: secondSpec.result.location,
          description: secondSpec.result.description,
        }
      );
    } else {
      specifications.push({
        location: specificationResult.result.location,
        description: specificationResult.result.description,
      });
    }

    // 5. Verificar se precisa rolar distrito específico
    let districtInfo = null;
    if (specifications.some((spec) => requiresDistrictRoll(spec))) {
      const districtResult = rollOnTable(DISTRITO_ESPECIFICO_TABLE);
      if (shouldRollTwiceForLocation(districtResult.result)) {
        const firstDistrict = rollOnTable(DISTRITO_ESPECIFICO_TABLE);
        const secondDistrict = rollOnTable(DISTRITO_ESPECIFICO_TABLE);
        districtInfo = {
          primary: {
            type: firstDistrict.result.type,
            name: firstDistrict.result.name,
            description: firstDistrict.result.description,
          },
          secondary: {
            type: secondDistrict.result.type,
            name: secondDistrict.result.name,
            description: secondDistrict.result.description,
          },
        };
      } else {
        districtInfo = {
          primary: {
            type: districtResult.result.type,
            name: districtResult.result.name,
            description: districtResult.result.description,
          },
        };
      }
    }

    // 6. Mapear categoria corretamente
    const category = mapLocationToCategory(mainLocationData.category);

    // 7. Montar especificação consolidada
    const specification =
      specifications.length === 1
        ? specifications[0]
        : {
            location: specifications.map((s) => s.location).join(" e "),
            description: specifications.map((s) => s.description).join("; "),
          };

    // 8. Montar descrição completa e organizada
    let description = mainLocationData.description;

    if (specification) {
      description += `\nLocalização específica: ${specification.location}`;
      if (specification.description !== specification.location) {
        description += ` - ${specification.description}`;
      }
    }

    if (districtInfo) {
      description += `\nDistrito: ${districtInfo.primary.name}`;
      if (districtInfo.secondary) {
        description += ` e ${districtInfo.secondary.name}`;
      }
    }

    if (importance.type !== "nenhuma") {
      description += `\nImportância: ${importance.name}`;
      if (importance.description !== importance.name) {
        description += ` - ${importance.description}`;
      }
    }

    if (peculiarity.type !== "nenhuma") {
      description += `\nPeculiaridade: ${peculiarity.name}`;
      if (peculiarity.description !== peculiarity.name) {
        description += ` - ${peculiarity.description}`;
      }
    }

    return {
      category,
      specificLocation: mainLocationData.name,
      name: mainLocationData.name,
      description,
      importance,
      peculiarity,
      specification,
      district: districtInfo,
    };
  }

  /**
   * Gera pré-requisitos
   */
  private static generatePrerequisites(contractValue: number): string[] {
    const prerequisites: string[] = [];

    // 1. Determinar modificador baseado no valor do contrato usando função da tabela
    const modifier = getPrerequisiteDiceModifier(contractValue);

    // 2. Rolar na tabela de pré-requisitos (1d20 + modificador)
    const baseRoll = rollDice({ notation: "1d20" }).result;
    const prerequisiteRoll = baseRoll + modifier;

    // 3. Verificar se deve rolar duas vezes (21+)
    if (prerequisiteRoll >= 21) {
      // Role duas vezes na tabela - gerar dois pré-requisitos separados
      const firstPrereq = this.generateSinglePrerequisite();
      const secondPrereq = this.generateSinglePrerequisite();
      if (firstPrereq) prerequisites.push(firstPrereq);
      if (secondPrereq && secondPrereq !== firstPrereq)
        prerequisites.push(secondPrereq);
      return prerequisites;
    }

    // 4. Buscar na tabela usando rollOnTable
    const prerequisiteEntry = CONTRACT_PREREQUISITES_TABLE.find(
      (entry) => prerequisiteRoll >= entry.min && prerequisiteRoll <= entry.max
    );

    if (
      prerequisiteEntry &&
      prerequisiteEntry.result.description !== "Nenhum"
    ) {
      prerequisites.push(prerequisiteEntry.result.description);
    }

    return prerequisites;
  }

  /**
   * Gera um único pré-requisito (para casos de "role duas vezes")
   */
  private static generateSinglePrerequisite(): string | null {
    // Rolar evitando recursão infinita (1d20 sem modificadores para casos individuais)
    const prerequisiteRoll = rollDice({ notation: "1d20" }).result;

    // Buscar na tabela
    const prerequisiteEntry = CONTRACT_PREREQUISITES_TABLE.find(
      (entry) => prerequisiteRoll >= entry.min && prerequisiteRoll <= entry.max
    );

    if (
      prerequisiteEntry &&
      prerequisiteEntry.result.description !== "Nenhum"
    ) {
      return prerequisiteEntry.result.description;
    }

    return null;
  }

  /**
   * Gera cláusulas especiais
   */
  private static generateClauses(rewardValue: number): string[] {
    const clauses: string[] = [];

    // 1. Determinar modificador baseado no valor da recompensa usando função da tabela
    const modifier = getClauseDiceModifier(rewardValue);

    // 2. Rolar na tabela de cláusulas (1d20 + modificador)
    const baseRoll = rollDice({ notation: "1d20" }).result;
    const clauseRoll = baseRoll + modifier;

    // 3. Verificar se deve rolar duas vezes (21+)
    if (clauseRoll >= 21) {
      // Role duas vezes na tabela - gerar duas cláusulas separadas
      const firstClause = this.generateSingleClause();
      const secondClause = this.generateSingleClause();
      if (firstClause) clauses.push(firstClause);
      if (secondClause && secondClause !== firstClause)
        clauses.push(secondClause);
      return clauses;
    }

    // 4. Buscar na tabela usando a rolagem
    const clauseEntry = CONTRACT_CLAUSES_TABLE.find(
      (entry) => clauseRoll >= entry.min && clauseRoll <= entry.max
    );

    if (clauseEntry && clauseEntry.result.description !== "Nenhuma") {
      clauses.push(clauseEntry.result.description);
    }

    return clauses;
  }

  /**
   * Gera uma única cláusula (para casos de "role duas vezes")
   */
  private static generateSingleClause(): string | null {
    // Rolar evitando recursão infinita (1d20 sem modificadores para casos individuais)
    const clauseRoll = rollDice({ notation: "1d20" }).result;

    // Buscar na tabela
    const clauseEntry = CONTRACT_CLAUSES_TABLE.find(
      (entry) => clauseRoll >= entry.min && clauseRoll <= entry.max
    );

    if (clauseEntry && clauseEntry.result.description !== "Nenhuma") {
      return clauseEntry.result.description;
    }

    return null;
  }

  /**
   * Gera tipo de pagamento
   */
  private static generatePaymentType(contractValue: number): PaymentType {
    // 1. Determinar modificador baseado no valor/recompensa do contrato usando função da tabela
    const modifier = getPaymentDiceModifier(contractValue);

    // 2. Rolar na tabela de tipo de pagamento (1d20 + modificador)
    const baseRoll = rollDice({ notation: "1d20" }).result;
    const paymentRoll = baseRoll + modifier;

    // 3. Buscar na tabela usando a rolagem
    const paymentEntry = CONTRACT_PAYMENT_TYPE_TABLE.find(
      (entry) => paymentRoll >= entry.min && paymentRoll <= entry.max
    );

    if (paymentEntry) {
      // Converter do enum da tabela para o enum do contract
      switch (paymentEntry.result.type) {
        case "direct_from_contractor":
          return PaymentType.DIRETO_CONTRATANTE;
        case "half_guild_half_contractor":
          return PaymentType.METADE_GUILDA_METADE_CONTRATANTE;
        case "half_guild_half_goods":
          return PaymentType.METADE_GUILDA_METADE_BENS;
        case "goods_and_services":
          return PaymentType.BENS_SERVICOS;
        case "full_guild_payment":
          return PaymentType.TOTAL_GUILDA;
        case "full_guild_plus_services":
          return PaymentType.TOTAL_GUILDA_MAIS_SERVICOS;
        default:
          return PaymentType.TOTAL_GUILDA;
      }
    }

    // Fallback para valor padrão
    return PaymentType.TOTAL_GUILDA;
  }

  /**
   * Gera antagonista
   */
  private static generateAntagonist(): Antagonist {
    // Rolar na tabela principal de tipos de antagonistas (1d20)
    const antagonistTypeResult = rollOnTable(ANTAGONIST_TYPES_TABLE);

    let antagonistTypes: string[] = [];

    // Verificar se deve rolar duas vezes
    if (shouldRollTwice(antagonistTypeResult.result)) {
      // Rolar duas vezes e usar ambos
      const firstRoll = rollOnTable(ANTAGONIST_TYPES_TABLE);
      const secondRoll = rollOnTable(ANTAGONIST_TYPES_TABLE);
      antagonistTypes = [firstRoll.result, secondRoll.result];
    } else {
      antagonistTypes = [antagonistTypeResult.result];
    }

    // Para simplicidade, usar apenas o primeiro tipo se houver múltiplos
    const primaryType = antagonistTypes[0];

    // Obter a tabela de detalhamento para este tipo
    const detailTable = ANTAGONIST_DETAIL_TABLE_MAP[primaryType];
    if (!detailTable) {
      // Fallback para humanoide poderoso se a tabela não existir
      return this.generateFallbackAntagonist();
    }

    // Rolar na tabela de detalhamento
    const specificResult = rollOnTable(detailTable);

    let specificTypes: string[] = [];

    // Verificar se deve rolar duas vezes na tabela específica
    if (shouldRollTwice(specificResult.result)) {
      // Rolar duas vezes na tabela específica
      const firstSpecific = rollOnTable(detailTable);
      const secondSpecific = rollOnTable(detailTable);
      specificTypes = [firstSpecific.result, secondSpecific.result];
    } else {
      specificTypes = [specificResult.result];
    }

    // Usar o primeiro tipo específico para criar o antagonista
    const specificType = specificTypes[0];
    const category = mapAntagonistTypeToCategory(primaryType);

    return {
      category,
      specificType,
      name: specificType,
      description: this.generateAntagonistDescription(category, specificType),
    };
  }

  /**
   * Gera um antagonista fallback caso não encontre a tabela
   */
  private static generateFallbackAntagonist(): Antagonist {
    return {
      category: AntagonistCategory.HUMANOIDE_PODEROSO,
      specificType: "Nobre",
      name: "Nobre Corrupto",
      description:
        "Um membro da nobreza local tem interesse em impedir esta missão.",
    };
  }

  /**
   * Gera descrição para o antagonista baseado no tipo
   */
  private static generateAntagonistDescription(
    category: AntagonistCategory,
    specificType: string
  ): string {
    const descriptions: Record<AntagonistCategory, string> = {
      [AntagonistCategory.HUMANOIDE_PODEROSO]: `Um ${specificType.toLowerCase()} poderoso que se opõe diretamente aos objetivos da missão.`,
      [AntagonistCategory.ARTEFATO_MAGICO]: `Um ${specificType.toLowerCase()} que está causando problemas na região e precisa ser lidado.`,
      [AntagonistCategory.ORGANIZACAO]: `Uma ${specificType.toLowerCase()} que tem interesses conflitantes com a missão.`,
      [AntagonistCategory.PERIGO_IMINENTE]: `${specificType} representam uma ameaça direta que deve ser enfrentada.`,
      [AntagonistCategory.ENTIDADE_SOBRENATURAL]: `Um ${specificType.toLowerCase()} sobrenatural está interferindo na missão.`,
      [AntagonistCategory.ANOMALIA]: `Uma ${specificType.toLowerCase()} está causando distúrbios na área.`,
      [AntagonistCategory.DESASTRE_ACIDENTE]: `Um ${specificType.toLowerCase()} complica drasticamente a execução da missão.`,
      [AntagonistCategory.CRISE]: `Uma ${specificType.toLowerCase()} está em andamento e afeta diretamente o contrato.`,
      [AntagonistCategory.MISTERIO]: `Um ${specificType.toLowerCase()} envolve a missão e precisa ser desvendado.`,
    };

    return (
      descriptions[category] ||
      `Um antagonista do tipo ${specificType} está envolvido na missão.`
    );
  }

  /**
   * Gera complicações
   */
  private static generateComplications(): Complication[] {
    const complications: Complication[] = [];

    // Rolar na tabela de tipos de complicações (1d20)
    const complicationTypeResult = rollOnTable(COMPLICATION_TYPES_TABLE);
    const category = complicationTypeResult.result;

    // Gerar descrição baseada na categoria
    const specificDetail = this.generateComplicationDetail(category);
    const description = this.generateComplicationDescription(
      category,
      specificDetail
    );

    complications.push({
      category,
      specificDetail,
      description,
    });

    return complications;
  }

  /**
   * Gera detalhe específico para uma complicação
   */
  private static generateComplicationDetail(
    category: ComplicationCategory
  ): string {
    // Usar as tabelas de detalhamento implementadas
    const detailTable = COMPLICATION_DETAIL_TABLES[category];

    if (!detailTable) {
      return "Complicação geral";
    }

    // Rolar na tabela de detalhes específicos (1d20)
    const detailResult = rollOnTable(detailTable);
    const details: string[] = [];

    // Verificar se deve rolar duas vezes
    if (detailResult.result === "Role duas vezes e use ambos") {
      // Gerar dois detalhes separados
      const firstDetail = this.generateSingleComplicationDetail(category);
      const secondDetail = this.generateSingleComplicationDetail(category);

      if (firstDetail) details.push(firstDetail);
      if (secondDetail) details.push(secondDetail);

      return details.length > 0 ? details.join(" e ") : "Complicação geral";
    }

    return detailResult.result;
  }

  /**
   * Gera um único detalhe de complicação (para casos de "role duas vezes")
   */
  private static generateSingleComplicationDetail(
    category: ComplicationCategory
  ): string | null {
    const detailTable = COMPLICATION_DETAIL_TABLES[category];

    if (!detailTable) {
      return null;
    }

    let detailResult;
    do {
      detailResult = rollOnTable(detailTable);
    } while (detailResult.result === "Role duas vezes e use ambos");

    return detailResult.result;
  }

  /**
   * Gera descrição para uma complicação
   */
  private static generateComplicationDescription(
    category: ComplicationCategory,
    specificDetail: string
  ): string {
    const categoryDescriptions: Record<ComplicationCategory, string> = {
      [ComplicationCategory.RECURSOS]:
        "Uma complicação relacionada a recursos disponíveis afeta a missão",
      [ComplicationCategory.VITIMAS]:
        "Há vítimas ou pessoas inocentes envolvidas que precisam ser protegidas",
      [ComplicationCategory.ORGANIZACAO]:
        "Problemas organizacionais complicam a execução da missão",
      [ComplicationCategory.MIRACULOSO]:
        "Um evento miraculoso ou sobrenatural afeta a situação",
      [ComplicationCategory.AMBIENTE_HOSTIL]:
        "O ambiente se torna hostil e perigoso para a execução da missão",
      [ComplicationCategory.INUSITADO]:
        "Uma situação inusitada e inesperada surge durante a missão",
      [ComplicationCategory.PROBLEMAS_DIPLOMATICOS]:
        "Problemas diplomáticos complicam as negociações",
      [ComplicationCategory.PROTECAO]:
        "Algum tipo de proteção inesperada interfere na missão",
      [ComplicationCategory.CONTRA_TEMPO_AMISTOSO]:
        "Um contra-tempo aparentemente amistoso causa problemas",
      [ComplicationCategory.ENCONTRO_HOSTIL]:
        "Um encontro hostil inesperado complica a situação",
    };

    const baseDescription =
      categoryDescriptions[category] || "Uma complicação afeta a missão";
    return `${baseDescription}: ${specificDetail}`;
  }

  /**
   * Gera reviravoltas
   * 10% de chance de reviravolta (19-20 no d20)
   */
  private static generateTwists(): Twist[] {
    const twists: Twist[] = [];

    // Rolar 1d20 para verificar se há reviravolta (19-20 = sim)
    const twistRoll = rollDice({ notation: "1d20" }).result;

    // Conforme tabela: 1-18 = Não, 19-20 = Sim
    if (twistRoll < 19) {
      return twists;
    }

    // Gerar elementos da reviravolta
    const who = this.generateTwistWho();
    const what = this.generateTwistWhat();
    const description = this.generateTwistDescription(who, what);

    twists.push({
      hasTwist: true,
      who,
      what,
      description,
    });

    return twists;
  }

  /**
   * Gera "quem" está envolvido na reviravolta
   */
  private static generateTwistWho(): TwistWho {
    const whoOptions = Object.values(TwistWho);
    return whoOptions[Math.floor(Math.random() * whoOptions.length)];
  }

  /**
   * Gera "o que" acontece na reviravolta
   */
  private static generateTwistWhat(): TwistWhat {
    const whatOptions = Object.values(TwistWhat);
    return whatOptions[Math.floor(Math.random() * whatOptions.length)];
  }

  /**
   * Gera descrição da reviravolta
   */
  private static generateTwistDescription(
    who: TwistWho,
    what: TwistWhat
  ): string {
    return `Reviravolta: ${who} ${what.toLowerCase()}.`;
  }

  /**
   * Gera descrição completa do contrato englobando todos os elementos
   */
  private static generateFullContractDescription(params: {
    objective: ContractObjective;
    location: ContractLocation;
    contractor: { type: ContractorType; name: string; description: string };
    antagonist: Antagonist;
    complications: Complication[];
    twists: Twist[];
    allies: Ally[];
    severeConsequences: SevereConsequence[];
    additionalRewards: AdditionalReward[];
    prerequisites: string[];
    clauses: string[];
    finalValueResult: ContractValue;
    deadline: {
      type: DeadlineType;
      value?: string;
    };
    paymentType: PaymentType;
  }): string {
    const {
      objective,
      location,
      contractor,
      antagonist,
      complications,
      twists,
      allies,
      severeConsequences,
      additionalRewards,
      prerequisites,
      clauses,
      finalValueResult,
      deadline,
      paymentType,
    } = params;

    const sections: string[] = [];

    // 1. Contratante
    sections.push(
      `**Contratante:** ${contractor.name}\n→ ${contractor.description}`
    );

    // 2. Objetivo
    let objectiveText = `**Objetivo:** ${objective.description}`;
    if (objective.specificObjective) {
      objectiveText += `\nDetalhes: ${objective.specificObjective}`;
    }
    sections.push(objectiveText);

    // 3. Localidade com todas as informações organizadas
    let locationText = `**Local:** ${location.name}`;

    if (location.specification) {
      locationText += `\nLocalização específica: ${location.specification.location}`;
      if (
        location.specification.description !== location.specification.location
      ) {
        locationText += `\n→ ${location.specification.description}`;
      }
    }

    if (location.district) {
      locationText += `\nDistrito: ${location.district.primary.name}`;
      if (location.district.secondary) {
        locationText += ` e ${location.district.secondary.name}`;
      }
    }

    if (location.importance && location.importance.type !== "nenhuma") {
      locationText += `\nImportância: ${location.importance.name}`;
      if (location.importance.description !== location.importance.name) {
        locationText += `\n→ ${location.importance.description}`;
      }
    }

    if (location.peculiarity && location.peculiarity.type !== "nenhuma") {
      locationText += `\nPeculiaridade: ${location.peculiarity.name}`;
      if (location.peculiarity.description !== location.peculiarity.name) {
        locationText += `\n→ ${location.peculiarity.description}`;
      }
    }

    sections.push(locationText);

    // 4. Antagonista
    sections.push(
      `**Antagonista:** ${antagonist.specificType}\n→ ${antagonist.description}`
    );

    // 5. Complicações
    if (complications.length > 0) {
      const complicationTexts = complications
        .map((c) => `• ${c.description}`)
        .join("\n");
      sections.push(`**Complicações:**\n${complicationTexts}`);
    }

    // 6. Aliados (se houver)
    if (allies.length > 0) {
      const allyTexts = allies
        .map(
          (ally) => `• ${ally.name} (${ally.category}) - ${ally.description}`
        )
        .join("\n");
      sections.push(`**Aliados potenciais:**\n${allyTexts}`);
    }

    // 7. Reviravoltas (se houver)
    if (twists.length > 0) {
      const twistTexts = twists.map((t) => `• ${t.description}`).join("\n");
      sections.push(`**Reviravoltas:**\n${twistTexts}`);
    }

    // 8. Valor em XP
    sections.push(
      `**Experiência:** ${finalValueResult.experienceValue} XP`
    );

    // 9. Recompensa principal
    sections.push(
      `**Recompensa:** ${finalValueResult.finalGoldReward} moedas de ouro`
    );

    // 10. Recompensas e incentivos (se houver)
    if (additionalRewards.length > 0) {
      const rewardTexts = additionalRewards
        .map((reward) => {
          const prefix = reward.isPositive ? "✓" : "⚠";
          return `${prefix} ${reward.description}`;
        })
        .join("\n");
      sections.push(`**Recompensas e Incentivos:**\n${rewardTexts}`);
    }

    // 11. Consequências severas (se houver)
    if (severeConsequences.length > 0) {
      const consequenceTexts = severeConsequences
        .map(
          (consequence) =>
            `• ${consequence.description}\n  Afeta contratados: ${consequence.affectsContractors}`
        )
        .join("\n");
      sections.push(`**Consequências por falha:**\n${consequenceTexts}`);
    }

    // 12. Prazo
    if (deadline.type !== DeadlineType.SEM_PRAZO) {
      sections.push(`**Prazo:** ${deadline.value}`);
    }

    // 13. Pré-requisitos (se houver)
    if (prerequisites.length > 0) {
      const prerequisiteTexts = prerequisites.map((p) => `• ${p}`).join("\n");
      sections.push(`**Pré-requisitos:**\n${prerequisiteTexts}`);
    }

    // 14. Cláusulas (se houver)
    if (clauses.length > 0) {
      const clauseTexts = clauses.map((c) => `• ${c}`).join("\n");
      sections.push(`**Cláusulas:**\n${clauseTexts}`);
    }

    // 15. Tipo de pagamento
    const paymentText = this.getPaymentTypeDescription(paymentType);
    sections.push(`**Forma de pagamento:** ${paymentText}`);

    return sections.join("\n");
  }

  /**
   * Converte PaymentType em descrição legível
   */
  private static getPaymentTypeDescription(paymentType: PaymentType): string {
    switch (paymentType) {
      case PaymentType.DIRETO_CONTRATANTE:
        return "Pagamento direto com contratante";
      case PaymentType.METADE_GUILDA_METADE_CONTRATANTE:
        return "Metade com a guilda, metade com o contratante";
      case PaymentType.METADE_GUILDA_METADE_BENS:
        return "Metade com a guilda, metade em bens com o contratante";
      case PaymentType.BENS_SERVICOS:
        return "Em materiais, joias, bens ou serviços do contratante";
      case PaymentType.TOTAL_GUILDA:
        return "Pagamento total na guilda";
      case PaymentType.TOTAL_GUILDA_MAIS_SERVICOS:
        return "Pagamento total na guilda + serviços do contratante";
      default:
        return "Pagamento a definir";
    }
  }

  // ===== GERAÇÃO DE ALIADOS =====

  /**
   * Gera aliados que podem aparecer durante o contrato
   * Baseado nas regras da seção "Aliados"
   */
  private static generateAllies(): Ally[] {
    const allies: Ally[] = [];

    // 1. Verificar se aliados aparecerão (1d20, 11-20 = Sim)
    const willAlliesAppear = rollOnTable(
      ALLY_APPEARANCE_CHANCE_TABLE,
      [],
      "Aparição de Aliados"
    );

    if (!willAlliesAppear.result) {
      return allies; // Nenhum aliado aparecerá
    }

    // 2. Determinar o tipo de aliado (1d20)
    const allyTypeResult = rollOnTable(ALLY_TYPES_TABLE, [], "Tipo de Aliado");
    const allyCategory = this.mapStringToAllyCategory(
      allyTypeResult.result as string
    );

    // 3. Determinar quando/como o aliado surgirá (1d20)
    const timingResult = rollOnTable(
      ALLY_APPEARANCE_TIMING_TABLE,
      [],
      "Tempo de Aparição"
    );
    const allyTiming = this.mapStringToAllyTiming(
      timingResult.result as string
    );

    // 4. Gerar detalhes específicos do aliado
    const allyDetails = this.generateAllyDetails(allyCategory);

    // 5. Criar o objeto do aliado
    const ally: Ally = {
      category: allyCategory,
      specificType: allyDetails.specificType,
      name: allyDetails.name,
      description: allyDetails.description,
      timing: allyTiming,
      powerLevel: allyDetails.powerLevel,
      characteristics: allyDetails.characteristics,
    };

    allies.push(ally);

    // Verificar se precisa rolar duas vezes (resultado 20 nas tabelas)
    if (
      allyTypeResult.result === "Role duas vezes e use ambos" ||
      timingResult.result === "Role duas vezes e use ambos"
    ) {
      // Gerar segundo aliado
      const secondAlly = this.generateSingleAlly();
      if (secondAlly) {
        allies.push(secondAlly);
      }
    }

    return allies;
  }

  /**
   * Gera um único aliado (usado para rolagens duplas)
   */
  private static generateSingleAlly(): Ally | null {
    const allyTypeResult = rollOnTable(
      ALLY_TYPES_TABLE,
      [],
      "Tipo de Aliado Individual"
    );

    // Evitar loops infinitos em rolagens duplas
    if (allyTypeResult.result === "Role duas vezes e use ambos") {
      return null;
    }

    const allyCategory = this.mapStringToAllyCategory(
      allyTypeResult.result as string
    );
    const timingResult = rollOnTable(
      ALLY_APPEARANCE_TIMING_TABLE,
      [],
      "Tempo de Aparição Individual"
    );
    const allyTiming = this.mapStringToAllyTiming(
      timingResult.result as string
    );
    const allyDetails = this.generateAllyDetails(allyCategory);

    return {
      category: allyCategory,
      specificType: allyDetails.specificType,
      name: allyDetails.name,
      description: allyDetails.description,
      timing: allyTiming,
      powerLevel: allyDetails.powerLevel,
      characteristics: allyDetails.characteristics,
    };
  }

  /**
   * Gera detalhes específicos baseados na categoria do aliado
   */
  private static generateAllyDetails(category: AllyCategory): {
    specificType: string;
    name: string;
    description: string;
    powerLevel?: number;
    characteristics?: string[];
  } {
    let specificType = "";
    let name = "";
    let description = "";
    let powerLevel: number | undefined;
    let characteristics: string[] | undefined;

    switch (category) {
      case AllyCategory.ARTEFATO: {
        const artifactResult = rollOnTable(
          ALLY_ARTIFACT_TABLE,
          [],
          "Artefato Aliado"
        );
        specificType = artifactResult.result as string;
        name = `Artefato: ${specificType}`;
        description = `Um ${specificType.toLowerCase()} que pode auxiliar na missão.`;
        break;
      }

      case AllyCategory.CRIATURA_PODEROSA: {
        const creatureResult = rollOnTable(
          ALLY_POWERFUL_CREATURE_TABLE,
          [],
          "Criatura Poderosa"
        );
        specificType = creatureResult.result as string;
        name = specificType;
        description = `${specificType} que se oferece para ajudar na missão.`;
        break;
      }

      case AllyCategory.INESPERADO: {
        const unexpectedResult = rollOnTable(
          ALLY_UNEXPECTED_TABLE,
          [],
          "Aliado Inesperado"
        );
        specificType = unexpectedResult.result as string;
        name = specificType;
        description = `${specificType} que aparece de forma inesperada.`;
        break;
      }

      case AllyCategory.AJUDA_SOBRENATURAL: {
        const supernaturalResult = rollOnTable(
          ALLY_SUPERNATURAL_HELP_TABLE,
          [],
          "Ajuda Sobrenatural"
        );
        specificType = supernaturalResult.result as string;
        name = specificType;
        description = `${specificType} oferece assistência sobrenatural.`;
        break;
      }

      case AllyCategory.CIVIS_ORDINARIOS: {
        const civilianResult = rollOnTable(
          ALLY_ORDINARY_CIVILIANS_TABLE,
          [],
          "Civis Ordinários"
        );
        specificType = civilianResult.result as string;
        name = specificType;
        description = `${specificType} que decide ajudar na missão.`;
        break;
      }

      case AllyCategory.NATUREZA: {
        const natureResult = rollOnTable(
          ALLY_NATURE_TABLE,
          [],
          "Natureza Aliada"
        );
        specificType = natureResult.result as string;
        name = specificType;
        description = `${specificType} oferece auxílio natural.`;
        break;
      }

      case AllyCategory.ORGANIZACAO: {
        const orgResult = rollOnTable(
          ALLY_ORGANIZATIONS_TABLE,
          [],
          "Organização Aliada"
        );
        specificType = orgResult.result as string;
        name = specificType;
        description = `${specificType} oferece suporte organizacional.`;
        break;
      }

      case AllyCategory.REFUGIO: {
        const refugeResult = rollOnTable(ALLY_REFUGE_TABLE, [], "Refúgio");
        specificType = refugeResult.result as string;
        name = specificType;
        description = `${specificType} serve como refúgio seguro.`;
        break;
      }

      case AllyCategory.AVENTUREIROS: {
        const adventurerResult = rollOnTable(
          ALLY_ADVENTURERS_TABLE,
          [],
          "Aventureiro Aliado"
        );
        specificType = adventurerResult.result as string;
        name = specificType;

        // Determinar nível do aventureiro
        const levelResult = rollOnTable(
          ALLY_ADVENTURER_LEVEL_TABLE,
          [],
          "Nível do Aventureiro"
        );
        const levelString = levelResult.result as string;
        powerLevel = parseInt(levelString.replace("NA ", ""));

        description = `${specificType} (${levelString}) que se junta à missão.`;
        break;
      }

      case AllyCategory.MONSTRUOSIDADE_AMIGAVEL: {
        const monstrosityResult = rollOnTable(
          ALLY_FRIENDLY_MONSTROSITY_TABLE,
          [],
          "Monstruosidade Amigável"
        );
        specificType = monstrosityResult.result as string;
        name = specificType;

        // Determinar características da monstruosidade
        const charResult = rollOnTable(
          ALLY_MONSTROSITY_CHARACTERISTICS_TABLE,
          [],
          "Características da Monstruosidade"
        );
        characteristics = [charResult.result as string];

        description = `${specificType} ${characteristics[0].toLowerCase()} que oferece ajuda.`;
        break;
      }

      default:
        specificType = "Aliado genérico";
        name = "Aliado";
        description = "Um aliado inesperado surge para ajudar.";
    }

    return { specificType, name, description, powerLevel, characteristics };
  }

  /**
   * Mapeia string para AllyCategory enum
   */
  private static mapStringToAllyCategory(categoryStr: string): AllyCategory {
    switch (categoryStr) {
      case "Artefato":
        return AllyCategory.ARTEFATO;
      case "Criatura poderosa":
        return AllyCategory.CRIATURA_PODEROSA;
      case "Inesperado":
        return AllyCategory.INESPERADO;
      case "Ajuda sobrenatural":
        return AllyCategory.AJUDA_SOBRENATURAL;
      case "Civis ordinários":
        return AllyCategory.CIVIS_ORDINARIOS;
      case "Natureza":
        return AllyCategory.NATUREZA;
      case "Organização":
        return AllyCategory.ORGANIZACAO;
      case "Refúgio":
        return AllyCategory.REFUGIO;
      case "Aventureiros":
        return AllyCategory.AVENTUREIROS;
      case "Monstruosidade amigável":
        return AllyCategory.MONSTRUOSIDADE_AMIGAVEL;
      default:
        return AllyCategory.CIVIS_ORDINARIOS;
    }
  }

  /**
   * Mapeia string para AllyTiming enum
   */
  private static mapStringToAllyTiming(timingStr: string): AllyTiming {
    switch (timingStr) {
      case "Correndo perigo":
        return AllyTiming.CORRENDO_PERIGO;
      case "De um jeito constrangedor":
        return AllyTiming.JEITO_CONSTRANGEDOR;
      case "De maneira comum e pacata":
        return AllyTiming.MANEIRA_COMUM;
      case "Pedindo ajuda durante um descanso":
        return AllyTiming.PEDINDO_AJUDA_DESCANSO;
      case "Ainda no assentamento":
        return AllyTiming.AINDA_ASSENTAMENTO;
      case "Já estará lidando com a complicação":
        return AllyTiming.LIDANDO_COMPLICACAO;
      case "1d4 dias após o começo do contrato":
        return AllyTiming.UM_D4_DIAS_APOS;
      case "2d4 dias após o começo do contrato":
        return AllyTiming.DOIS_D4_DIAS_APOS;
      case "Magicamente invocado":
        return AllyTiming.MAGICAMENTE_INVOCADO;
      case "Para salvar o dia":
        return AllyTiming.PARA_SALVAR_DIA;
      default:
        return AllyTiming.MANEIRA_COMUM;
    }
  }

  // ===== GERAÇÃO DE CONSEQUÊNCIAS SEVERAS =====

  /**
   * Gera consequências severas que podem ocorrer se o contrato falhar
   * Baseado nas regras da seção "Chance de Consequências Severas"
   */
  private static generateSevereConsequences(): SevereConsequence[] {
    const consequences: SevereConsequence[] = [];

    // 1. Verificar se haverá consequências severas (1d20, 1-2 = Sim)
    const willHaveConsequences = rollOnTable(
      SEVERE_CONSEQUENCES_CHANCE_TABLE,
      [],
      "Chance de Consequências Severas"
    );

    if (!willHaveConsequences.result) {
      return consequences; // Nenhuma consequência severa
    }

    // 2. Determinar o tipo de consequência severa (1d20)
    const typeResult = rollOnTable(
      SEVERE_CONSEQUENCES_TYPES_TABLE,
      [],
      "Tipo de Consequência Severa"
    );
    const consequenceCategory = typeResult.result as SevereConsequenceCategory;

    // 3. Gerar detalhes específicos da consequência
    const detailTable = SEVERE_CONSEQUENCE_DETAIL_TABLES[consequenceCategory];
    if (detailTable) {
      const detailResult = rollOnTable(
        detailTable,
        [],
        "Detalhamento da Consequência"
      );
      const specificConsequence = detailResult.result as string;

      // 4. Criar o objeto da consequência
      const consequence: SevereConsequence = {
        category: consequenceCategory,
        specificConsequence,
        description: this.generateConsequenceDescription(
          consequenceCategory,
          specificConsequence
        ),
        affectsContractors: this.generateContractorConsequenceDescription(
          consequenceCategory,
          specificConsequence
        ),
      };

      consequences.push(consequence);

      // Verificar se precisa rolar duas vezes (resultado "Role duas vezes e use ambos")
      if (specificConsequence === "Role duas vezes e use ambos") {
        const secondConsequence = this.generateSingleSevereConsequence();
        if (secondConsequence) {
          consequences.push(secondConsequence);
        }
      }
    }

    return consequences;
  }

  /**
   * Gera uma única consequência severa (usado para rolagens duplas)
   */
  private static generateSingleSevereConsequence(): SevereConsequence | null {
    const typeResult = rollOnTable(
      SEVERE_CONSEQUENCES_TYPES_TABLE,
      [],
      "Tipo de Consequência Severa"
    );
    const consequenceCategory = typeResult.result as SevereConsequenceCategory;

    const detailTable = SEVERE_CONSEQUENCE_DETAIL_TABLES[consequenceCategory];
    if (!detailTable) return null;

    const detailResult = rollOnTable(
      detailTable,
      [],
      "Detalhamento da Consequência"
    );
    const specificConsequence = detailResult.result as string;

    // Evitar loops infinitos
    if (specificConsequence === "Role duas vezes e use ambos") {
      return null;
    }

    return {
      category: consequenceCategory,
      specificConsequence,
      description: this.generateConsequenceDescription(
        consequenceCategory,
        specificConsequence
      ),
      affectsContractors: this.generateContractorConsequenceDescription(
        consequenceCategory,
        specificConsequence
      ),
    };
  }

  /**
   * Gera descrição da consequência severa
   */
  private static generateConsequenceDescription(
    category: SevereConsequenceCategory,
    specific: string
  ): string {
    const categoryName = category.toLowerCase();
    return `Em caso de falha no contrato, pode ocorrer: ${categoryName} - ${specific}`;
  }

  /**
   * Verifica se a consequência afeta os contratados e gera descrição apropriada
   */
  private static generateContractorConsequenceDescription(
    category: SevereConsequenceCategory,
    specific: string
  ): string {
    // Baseado nas regras do markdown, gerar uma descrição do que acontece com os contratados
    const affectsContractors =
      category === SevereConsequenceCategory.MORTE_IMPORTANTES ||
      category === SevereConsequenceCategory.PERSEGUICAO ||
      specific.toLowerCase().includes("contratado") ||
      specific.toLowerCase().includes("morte");

    if (affectsContractors) {
      return "Os contratados podem ser diretamente afetados por esta consequência";
    } else {
      return "A consequência afeta primariamente o ambiente ou região do contrato";
    }
  }

  // ===== GERAÇÃO DE RECOMPENSAS ADICIONAIS =====

  /**
   * Gera recompensas adicionais para o contrato
   */
  private static generateAdditionalRewards(): AdditionalReward[] {
    const rewards: AdditionalReward[] = [];

    // 1. Verificar se haverá recompensas adicionais (1d20, 1-13 = Não, 14-20 = Sim)
    const willHaveRewards = rollOnTable(
      REWARD_CHANCE_TABLE,
      [],
      "Chance de Recompensas Adicionais"
    );

    if (!willHaveRewards.result) {
      return rewards; // Nenhuma recompensa adicional
    }

    // 2. Determinar o tipo de recompensa (1d20)
    const typeResult = rollOnTable(
      REWARD_TYPES_TABLE,
      [],
      "Tipo de Recompensa Adicional"
    );
    const rewardType = typeResult.result as string;

    // 3. Gerar detalhes específicos da recompensa
    const rewardDetail = this.generateRewardDetail(rewardType);
    if (rewardDetail) {
      // Verificar se precisa rolar duas vezes antes de adicionar
      if (rewardDetail.specificReward === "Role duas vezes e use ambos") {
        // Substituir pela geração de duas recompensas reais
        const firstReward = this.generateSingleAdditionalReward();
        const secondReward = this.generateSingleAdditionalReward();

        if (firstReward) rewards.push(firstReward);
        if (secondReward) rewards.push(secondReward);
      } else {
        // Recompensa normal, adicionar diretamente
        rewards.push(rewardDetail);
      }
    }

    return rewards;
  }

  /**
   * Gera uma única recompensa adicional (usado para rolagens duplas)
   */
  private static generateSingleAdditionalReward(): AdditionalReward | null {
    // Tenta até 3 vezes para evitar loops infinitos
    for (let attempts = 0; attempts < 3; attempts++) {
      const typeResult = rollOnTable(
        REWARD_TYPES_TABLE,
        [],
        "Tipo de Recompensa Adicional"
      );
      const rewardType = typeResult.result as string;

      const rewardDetail = this.generateRewardDetail(rewardType);

      // Se não é "Role duas vezes e use ambos", retorna a recompensa
      if (
        rewardDetail &&
        rewardDetail.specificReward !== "Role duas vezes e use ambos"
      ) {
        return rewardDetail;
      }
    }

    // Se ainda não conseguiu uma recompensa válida, força uma recompensa padrão
    return {
      category: RewardCategory.MORAL,
      specificReward: "Satisfação pessoal",
      description: "Benefício para a comunidade: Satisfação pessoal",
      isPositive: true,
    };
  }

  /**
   * Gera os detalhes específicos de uma recompensa baseado no tipo
   */
  private static generateRewardDetail(
    rewardType: string
  ): AdditionalReward | null {
    let detailTable;
    let category: RewardCategory;
    let isPositive = true;

    // Mapear tipo para categoria e tabela correspondente
    switch (rewardType) {
      case "Riquezas":
        detailTable = REWARD_RICHES_TABLE;
        category = RewardCategory.RIQUEZAS;
        break;
      case "Artefatos mágicos":
        detailTable = REWARD_MAGICAL_ARTIFACTS_TABLE;
        category = RewardCategory.ARTEFATOS_MAGICOS;
        break;
      case "Poder":
        detailTable = REWARD_POWER_TABLE;
        category = RewardCategory.PODER;
        break;
      case "Conhecimento":
        detailTable = REWARD_KNOWLEDGE_TABLE;
        category = RewardCategory.CONHECIMENTO;
        break;
      case "Influência e renome":
        detailTable = REWARD_INFLUENCE_TABLE;
        category = RewardCategory.INFLUENCIA_RENOME;
        break;
      case "Glória":
        detailTable = REWARD_GLORY_TABLE;
        category = RewardCategory.GLORIA;
        break;
      case "Moral":
        detailTable = REWARD_MORAL_TABLE;
        category = RewardCategory.MORAL;
        break;
      case "Pagamento diferenciado":
        detailTable = REWARD_ALTERNATIVE_PAYMENT_TABLE;
        category = RewardCategory.PAGAMENTO_DIFERENCIADO;
        break;
      case "Recompensa bizarra":
        detailTable = REWARD_BIZARRE_TABLE;
        category = RewardCategory.RECOMPENSA_BIZARRA;
        break;
      case "Aparências enganam":
        detailTable = REWARD_DECEPTIVE_TABLE;
        category = RewardCategory.APARENCIAS_ENGANAM;
        isPositive = false; // Este tipo é negativo
        break;
      default:
        return null;
    }

    if (!detailTable) return null;

    const detailResult = rollOnTable(
      detailTable,
      [],
      `Detalhamento ${rewardType}`
    );
    const specificReward = detailResult.result as string;

    return {
      category,
      specificReward,
      description: this.generateRewardDescription(category, specificReward),
      isPositive,
    };
  }

  /**
   * Gera uma descrição clara para a recompensa
   */
  private static generateRewardDescription(
    category: RewardCategory,
    specific: string
  ): string {
    const categoryDescriptions: Record<RewardCategory, string> = {
      [RewardCategory.RIQUEZAS]: "Riqueza material adicional",
      [RewardCategory.ARTEFATOS_MAGICOS]: "Objeto mágico de valor",
      [RewardCategory.PODER]: "Influência ou autoridade",
      [RewardCategory.CONHECIMENTO]: "Informação valiosa ou secreta",
      [RewardCategory.INFLUENCIA_RENOME]: "Conexões sociais e reputação",
      [RewardCategory.GLORIA]: "Reconhecimento público",
      [RewardCategory.MORAL]: "Benefício para a comunidade",
      [RewardCategory.PAGAMENTO_DIFERENCIADO]: "Pagamento não monetário",
      [RewardCategory.RECOMPENSA_BIZARRA]: "Benefício inusitado",
      [RewardCategory.APARENCIAS_ENGANAM]: "Complicação ou engano",
    };

    return `${categoryDescriptions[category]}: ${specific}`;
  }
}
