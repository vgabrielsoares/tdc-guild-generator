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
    const difficulty =
      difficultyEntry?.result.difficulty || ContractDifficulty.MEDIO;

    // 7. Gerar contratante seguindo as regras do markdown
    const contractor = this.generateContractor(guild);

    // 8. Gerar objetivo conforme tabela do markdown
    const objective = this.generateObjective();

    // 9. Gerar localidade conforme tabela do markdown
    const location = this.generateLocation();

    // 10. Gerar pré-requisitos baseados no valor
    const prerequisites = this.generatePrerequisites(
      valueResult.experienceValue
    );

    // 11. Gerar cláusulas especiais
    const clauses = this.generateClauses(valueResult.rewardValue);

    // 12. Aplicar bônus por pré-requisitos e cláusulas
    const totalBonuses = (prerequisites.length + clauses.length) * 5;
    const finalValueResult = {
      ...valueResult,
      rewardValue: valueResult.rewardValue + totalBonuses,
      finalGoldReward:
        Math.round((valueResult.rewardValue + totalBonuses) * 0.1 * 100) / 100,
      modifiers: {
        ...valueResult.modifiers,
        requirementsAndClauses: totalBonuses,
      },
    };

    // 13. Gerar tipo de pagamento
    const paymentType = this.generatePaymentType(finalValueResult.rewardValue);

    // 13. Gerar antagonista
    const antagonist = this.generateAntagonist();

    // 14. Gerar complicações
    const complications = this.generateComplications();

    // 15. Gerar reviravoltas
    const twists = this.generateTwists();

    // 16. Gerar descrição completa do contrato
    const fullDescription = this.generateFullContractDescription({
      objective,
      location,
      contractor,
      antagonist,
      complications,
      twists,
      prerequisites,
      clauses,
      finalValueResult,
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
      value: finalValueResult,
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
    experienceValue += modifiers.populationRelationValue;
    rewardValue += modifiers.populationRelationReward;

    // 6. Aplicar modificadores de relação com governo
    experienceValue += modifiers.governmentRelationValue;
    rewardValue += modifiers.governmentRelationReward;

    // 7. Aplicar modificadores de funcionários (já aplicados na rolagem)
    // staffPreparation é aplicado à rolagem d100, não ao valor final

    // 8. Aplicar multiplicadores de dificuldade
    experienceValue = Math.floor(
      experienceValue * modifiers.difficultyMultiplier.experienceMultiplier
    );
    rewardValue = Math.floor(
      rewardValue * modifiers.difficultyMultiplier.rewardMultiplier
    );

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
      populationRelationValue: 0,
      populationRelationReward: 0,
      governmentRelationValue: 0,
      governmentRelationReward: 0,
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
    const populationRelation = this.mapRelationLevelToString(
      guild.relations.population
    );
    const populationMods = POPULATION_RELATION_MODIFIERS[
      populationRelation
    ] || { valueModifier: 0, rewardModifier: 0 };
    modifiers.populationRelationValue = populationMods.valueModifier;
    modifiers.populationRelationReward = populationMods.rewardModifier;

    // 3. Aplicar modificadores por relação com governo
    const governmentRelation = this.mapRelationLevelToString(
      guild.relations.government
    );
    const governmentMods = GOVERNMENT_RELATION_MODIFIERS[
      governmentRelation
    ] || { valueModifier: 0, rewardModifier: 0 };
    modifiers.governmentRelationValue = governmentMods.valueModifier;
    modifiers.governmentRelationReward = governmentMods.rewardModifier;

    // 4. Modificadores de funcionários (aplicados à rolagem d100, não ao valor final)
    const staffDescription = guild.staff.employees || "";
    if (staffDescription.toLowerCase().includes("experientes")) {
      modifiers.staffPreparation =
        STAFF_PREPARATION_ROLL_MODIFIERS["experientes"] || 2;
    } else if (staffDescription.toLowerCase().includes("despreparados")) {
      modifiers.staffPreparation =
        STAFF_PREPARATION_ROLL_MODIFIERS["despreparados"] || -2;
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
    if (
      finalValue.includes("sem prazo") ||
      finalValue.toLowerCase().includes("sem prazo")
    ) {
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
        description: "Contratante do governo não identificado"
      };
    }
    return {
      name: entry.result.name,
      description: entry.result.description
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
    const baseDescriptions: Record<ComplicationCategory, string> = {
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
      baseDescriptions[category] || "Uma complicação afeta a missão";
    return `${baseDescription}: ${specificDetail}.`;
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
    prerequisites: string[];
    clauses: string[];
    finalValueResult: ContractValue;
    deadline: {
      type: DeadlineType;
      value?: string;
      isFlexible: boolean;
      isArbitrary: boolean;
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
      prerequisites,
      clauses,
      finalValueResult,
      deadline,
      paymentType,
    } = params;

    const sections: string[] = [];

    // 1. Objetivo
    let objectiveText = `**Objetivo:** ${objective.description}`;
    if (objective.specificObjective) {
      objectiveText += `\nDetalhes: ${objective.specificObjective}`;
    }
    sections.push(objectiveText);

    // 2. Localidade com todas as informações organizadas
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

    // 3. Contratante
    sections.push(
      `**Contratante:** ${contractor.name}\n→ ${contractor.description}`
    );

    // 4. Antagonista
    sections.push(
      `**Antagonista:** ${antagonist.name}\n→ ${antagonist.description}`
    );

    // 5. Complicações
    if (complications.length > 0) {
      const complicationTexts = complications
        .map((c) => `• ${c.description}`)
        .join("\n");
      sections.push(`**Complicações:**\n${complicationTexts}`);
    }

    // 6. Reviravoltas (se houver)
    if (twists.length > 0) {
      const twistTexts = twists.map((t) => `• ${t.description}`).join("\n");
      sections.push(`**Reviravoltas:**\n${twistTexts}`);
    }

    // 7. Recompensa e incentivos
    sections.push(
      `**Recompensa:** ${finalValueResult.finalGoldReward} moedas de ouro`
    );

    // 8. Prazo
    if (deadline.type !== DeadlineType.SEM_PRAZO) {
      sections.push(`**Prazo:** ${deadline.value}`);
    }

    // 9. Pré-requisitos (se houver)
    if (prerequisites.length > 0) {
      const prerequisiteTexts = prerequisites.map((p) => `• ${p}`).join("\n");
      sections.push(`**Pré-requisitos:**\n${prerequisiteTexts}`);
    }

    // 10. Cláusulas (se houver)
    if (clauses.length > 0) {
      const clauseTexts = clauses.map((c) => `• ${c}`).join("\n");
      sections.push(`**Cláusulas:**\n${clauseTexts}`);
    }

    // 11. Tipo de pagamento
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
}
