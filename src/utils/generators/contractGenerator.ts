import { rollDice } from "../dice";
import { rollOnTable } from "../tableRoller";
import { handleMultipleRolls } from "../multiRollHandler";
import type { TableEntry } from "@/types/tables";
import { addDays } from "../date-utils";
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
  SIGNED_CONTRACT_RESOLUTION_TABLE,
  canContractReturnToAvailable,
  shouldCancelContract,
  shouldGetUnresolvedBonus,
} from "../../data/tables/contract-reduction-tables";

import { CONTRACT_FAILURE_REASONS_TABLE } from "../../data/tables/contract-modifier-tables";

import {
  ContractStatus,
  ContractDifficulty,
  ContractorType,
  DeadlineType,
  PaymentType,
  ContractResolution,
  FailureReason,
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
import type { GameDate } from "@/types/timeline";

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

    // 2. Gerar rolagens adicionais para dados de geração
    const distanceRoll = rollDice({ notation: "1d20" }).result;
    const difficultyRoll = rollDice({ notation: "1d20" }).result;

    // 3. Determinar dificuldade baseada na rolagem
    const difficultyEntry = CONTRACT_DIFFICULTY_TABLE.find(
      (entry) => difficultyRoll >= entry.min && difficultyRoll <= entry.max
    );
    const difficulty =
      difficultyEntry?.result.difficulty || ContractDifficulty.MEDIO;

    // 4. Gerar contratante primeiro para saber que tipo de modificadores aplicar
    const contractor = this.generateContractor(guild);

    // 5. Calcular valor aplicando modificadores baseados no tipo de contratante
    const valueCalculationResult = this.calculateContractValue(
      baseRoll,
      guild,
      contractor.type,
      difficultyEntry,
      distanceRoll
    );
    const { contractValue, prerequisites, clauses } = valueCalculationResult;

    // 6. Gerar deadline usando a tabela
    const deadline = this.generateDeadline();

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
      distanceRoll,
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
   * Gera um contrato base com bônus aplicado à rolagem de recompensa
   * Usado quando contratos não resolvidos ganham bônus de recompensa
   */
  static generateBaseContractWithRewardBonus(
    config: ContractGenerationConfig,
    rewardRollBonus: number = 0
  ): Contract {
    const { guild } = config;

    // 1. Rolar valor base (1d100)
    const baseRoll = rollDice({ notation: "1d100" }).result;

    // 2. Gerar rolagens adicionais para dados de geração
    const distanceRoll = rollDice({ notation: "1d20" }).result;
    const difficultyRoll = rollDice({ notation: "1d20" }).result;

    // 3. Determinar dificuldade baseada na rolagem
    const difficultyEntry = CONTRACT_DIFFICULTY_TABLE.find(
      (entry) => difficultyRoll >= entry.min && difficultyRoll <= entry.max
    );
    const difficulty =
      difficultyEntry?.result.difficulty || ContractDifficulty.MEDIO;

    // 4. Gerar contratante primeiro para saber que tipo de modificadores aplicar
    const contractor = this.generateContractor(guild);

    // 5. Calcular valor aplicando o bônus de rolagem de recompensa
    const valueCalculationResult = this.calculateContractValueWithRewardBonus(
      baseRoll,
      guild,
      contractor.type,
      difficultyEntry,
      distanceRoll,
      rewardRollBonus
    );
    const { contractValue, prerequisites, clauses } = valueCalculationResult;

    // 6. Gerar deadline usando a tabela
    const deadline = this.generateDeadline();

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
      distanceRoll,
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
        rewardRollBonus: rewardRollBonus > 0 ? rewardRollBonus : undefined,
      },
      createdAt: new Date(),
    };

    return contract;
  }

  /**
   * Calcula a quantidade de contratos gerados baseado no tamanho da sede
   * usa o dado da sede + modificadores para consultar a tabela de quantidade
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

    // 2. Rolagem base usando o dado da sede (para consultar a tabela de quantidade)
    const baseRoll = rollDice({ notation: diceExpression }).result;
    let tableRoll = baseRoll;
    details.push(`Base (${diceExpression}): ${baseRoll}`);

    // 3. Aplicar modificadores por condição dos funcionários ao resultado da rolagem
    let staffModifier = 0;
    const staffDescription = guild.staff.employees || "";

    if (staffDescription.toLowerCase().includes("experientes")) {
      staffModifier = STAFF_CONDITION_MODIFIERS["experientes"] || 1;
      tableRoll += staffModifier;
      details.push(`Funcionários experientes: +${staffModifier}`);
    } else if (staffDescription.toLowerCase().includes("despreparados")) {
      staffModifier = STAFF_CONDITION_MODIFIERS["despreparados"] || -1;
      tableRoll += staffModifier;
      details.push(`Funcionários despreparados: ${staffModifier}`);
    }

    details.push(`Rolagem final para tabela: ${tableRoll}`);

    // 4. Usar essa rolagem modificada para consultar a tabela de quantidade disponível
    const quantityEntry = CONTRACT_QUANTITY_TABLE.find(
      (entry) => tableRoll >= entry.min && tableRoll <= entry.max
    );

    let totalGenerated = 0;
    if (quantityEntry) {
      // Extrair apenas o dado da descrição (ex: "1d4 contratos" -> "1d4")
      const diceMatch = quantityEntry.result.match(/(\d+d\d+(?:\+\d+)?)/);
      if (diceMatch) {
        const quantityDice = diceMatch[1];
        totalGenerated = rollDice({ notation: quantityDice }).result;
        details.push(
          `Quantidade (${tableRoll}/20 = ${quantityDice}): ${totalGenerated}`
        );
      } else if (quantityEntry.result.includes("1 contrato")) {
        totalGenerated = 1;
        details.push(`Quantidade (${tableRoll}/20): 1 contrato`);
      }
    } else {
      // Fallback se não encontrar entrada na tabela
      totalGenerated = 1;
      details.push(`Quantidade (fallback): 1 contrato`);
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
   * Gera contratos aplicando redução por frequentadores como contratos aceitos por outros
   * Esta é a função principal que deve ser usada para incluir contratos indisponíveis
   */
  static generateContractsWithFrequentatorsReduction(
    config: ContractGenerationConfig,
    currentDate: GameDate
  ): Contract[] {
    // 1. Calcular quantidade SEM redução por frequentadores
    const configWithoutReduction = {
      ...config,
      skipFrequentatorsReduction: true,
    };
    const quantityWithoutReduction = this.calculateContractQuantity(
      configWithoutReduction
    );

    // 2. Calcular quantidade COM redução por frequentadores
    const quantityWithReduction = this.calculateContractQuantity(config);

    // 3. A diferença são os contratos "aceitos por outros aventureiros"
    const contractsTakenByOthers =
      quantityWithoutReduction.totalGenerated -
      quantityWithReduction.totalGenerated;

    // 4. Gerar contratos disponíveis (quantidade após redução)
    const availableContracts: Contract[] = [];
    for (let i = 0; i < quantityWithReduction.totalGenerated; i++) {
      availableContracts.push(this.generateBaseContract(config));
    }

    // 5. Gerar contratos aceitos por outros aventureiros
    const takenContracts: Contract[] = [];
    for (let i = 0; i < contractsTakenByOthers; i++) {
      const takenContract = this.generateContractTakenByOthers(
        config,
        currentDate
      );
      takenContracts.push(takenContract);
    }

    // 6. Retornar todos os contratos (disponíveis + aceitos por outros)
    return [...availableContracts, ...takenContracts];
  }

  /**
   * Gera um contrato que foi aceito por outros aventureiros
   * Baseado nas regras de resolução de contratos firmados
   */
  private static generateContractTakenByOthers(
    config: ContractGenerationConfig,
    currentDate: GameDate
  ): Contract {
    // Rolar para ver o que aconteceu com o contrato aceito por outros
    const outcomeRoll = rollDice({ notation: "1d20" }).result;
    const outcomeEntry = SIGNED_CONTRACT_RESOLUTION_TABLE.find(
      (entry) => outcomeRoll >= entry.min && outcomeRoll <= entry.max
    );

    if (!outcomeEntry) {
      // Fallback - gerar contrato base sem bônus
      const baseContract = this.generateBaseContract(config);
      return {
        ...baseContract,
        status: ContractStatus.ACEITO_POR_OUTROS,
        takenByOthersInfo: {
          takenAt: currentDate,
          canReturnToAvailable: true,
        },
      };
    }

    const outcome = outcomeEntry.result;
    let failureReason: FailureReason | undefined;

    // Se não foi resolvido, rolar motivo
    if (outcome === ContractResolution.NAO_RESOLVIDO) {
      const reasonRoll = rollDice({ notation: "1d20" }).result;
      const reasonEntry = CONTRACT_FAILURE_REASONS_TABLE.find(
        (entry) => reasonRoll >= entry.min && reasonRoll <= entry.max
      );
      failureReason = reasonEntry?.result;
    }

    // Determinar se contrato deve ser anulado
    if (failureReason && shouldCancelContract(failureReason)) {
      const baseContract = this.generateBaseContract(config);
      return {
        ...baseContract,
        status: ContractStatus.ANULADO,
        takenByOthersInfo: {
          takenAt: currentDate,
          resolutionReason: failureReason,
          canReturnToAvailable: false,
        },
      };
    }

    // Determinar se contrato precisa de bônus na rolagem de recompensa
    const needsRewardBonus = shouldGetUnresolvedBonus(outcome, failureReason);

    // Gerar contrato com bônus aplicado à rolagem se necessário
    const baseContract = this.generateBaseContractWithRewardBonus(
      config,
      needsRewardBonus ? 2 : 0
    );

    // Determinar se pode voltar a ficar disponível
    const canReturn = canContractReturnToAvailable(outcome, failureReason);

    // Se foi resolvido ou resolvido com ressalvas, marcar como resolvido por outros
    if (
      outcome === ContractResolution.RESOLVIDO ||
      outcome === ContractResolution.RESOLVIDO_COM_RESSALVAS
    ) {
      return {
        ...baseContract,
        status: ContractStatus.RESOLVIDO_POR_OUTROS,
        takenByOthersInfo: {
          takenAt: currentDate,
          resolutionReason: outcome,
          canReturnToAvailable: false,
        },
      };
    }

    // Marcar como aceito por outros aventureiros
    return {
      ...baseContract,
      status: ContractStatus.ACEITO_POR_OUTROS,
      takenByOthersInfo: {
        takenAt: currentDate,
        resolutionReason: failureReason,
        canReturnToAvailable: canReturn,
        estimatedResolutionDate: canReturn
          ? // Adicionar tempo estimado para resolução (1-4 semanas)
            addDays(currentDate, rollDice({ notation: "1d4" }).result * 7)
          : undefined,
      },
    };
  }

  /**
   * Calcula o valor do contrato
   * 1. Rola 1d100 para valor base na tabela
   * 2. Gera contratante para saber que tipo de modificadores aplicar
   * 3. Calcula modificadores que afetam a rolagem baseado no contratante
   * 4. Gera pré-requisitos e cláusulas baseados no valor preliminar
   * 5. Aplica modificadores à rolagem
   * 6. Consulta a tabela novamente com as rolagens modificadas
   * 7. Aplica multiplicadores de dificuldade
   */
  private static calculateContractValue(
    baseRoll: number,
    guild: Guild,
    contractorType: ContractorType,
    difficultyEntry?: TableEntry<{
      difficulty: ContractDifficulty;
      experienceMultiplier: number;
      rewardMultiplier: number;
    }>,
    distanceRoll?: number
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

    // 2. Calcular todos os modificadores que afetam a rolagem baseado no tipo de contratante
    const rollModifiers = this.calculateRollModifiers(guild, contractorType, distanceRoll);

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
      baseRoll + rollModifiers.experienceModifier
    );
    const rewardRoll = Math.max(
      1,
      baseRoll + rollModifiers.rewardModifier + requirementsBonusToRoll
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
    const difficultyMultipliers =
      this.calculateDifficultyMultipliers(difficultyEntry);
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
   * Calcula o valor do contrato com bônus adicional aplicado à rolagem de recompensa
   * Usado quando contratos não resolvidos ganham bônus na recompensa
   */
  static calculateContractValueWithRewardBonus(
    baseRoll: number,
    guild: Guild,
    contractorType: ContractorType,
    difficultyEntry?: TableEntry<{
      difficulty: ContractDifficulty;
      experienceMultiplier: number;
      rewardMultiplier: number;
    }>,
    distanceRoll?: number,
    rewardRollBonus: number = 0
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

    // 2. Calcular todos os modificadores que afetam a rolagem baseado no tipo de contratante
    const rollModifiers = this.calculateRollModifiers(guild, contractorType, distanceRoll);

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
    // Incluindo bônus de pré-requisitos e cláusulas + bônus adicional de recompensa
    const experienceRoll = Math.max(
      1,
      baseRoll + rollModifiers.experienceModifier
    );
    const rewardRoll = Math.max(
      1,
      baseRoll +
        rollModifiers.rewardModifier +
        requirementsBonusToRoll +
        rewardRollBonus
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
    const difficultyMultipliers =
      this.calculateDifficultyMultipliers(difficultyEntry);
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
      rewardRollBonus: rewardRollBonus > 0 ? rewardRollBonus : undefined,
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
  private static calculateRollModifiers(
    guild: Guild,
    contractorType: ContractorType,
    distanceRoll?: number
  ): {
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
    const finalDistanceRoll =
      distanceRoll || rollDice({ notation: "1d20" }).result;
    const distanceEntry = CONTRACT_DISTANCE_TABLE.find(
      (entry) =>
        finalDistanceRoll >= entry.min && finalDistanceRoll <= entry.max
    );
    const distanceModifier = distanceEntry?.result.valueModifier || 0;
    experienceModifier += distanceModifier;
    rewardModifier += distanceModifier;

    // 2. Modificadores por relação com população (APENAS para contratos do tipo POVO)
    let populationValueModifier = 0;
    let populationRewardModifier = 0;
    if (contractorType === ContractorType.POVO) {
      const populationRelation = this.mapRelationLevelToString(
        guild.relations.population
      );
      const populationMods = POPULATION_RELATION_MODIFIERS[
        populationRelation
      ] || {
        valueModifier: 0,
        rewardModifier: 0,
      };
      populationValueModifier = populationMods.valueModifier;
      populationRewardModifier = populationMods.rewardModifier;
      experienceModifier += populationMods.valueModifier;
      rewardModifier += populationMods.rewardModifier;
    }

    // 3. Modificadores por relação com governo (APENAS para contratos do tipo GOVERNO)
    let governmentValueModifier = 0;
    let governmentRewardModifier = 0;
    if (contractorType === ContractorType.GOVERNO) {
      const governmentRelation = this.mapRelationLevelToString(
        guild.relations.government
      );
      const governmentMods = GOVERNMENT_RELATION_MODIFIERS[
        governmentRelation
      ] || {
        valueModifier: 0,
        rewardModifier: 0,
      };
      governmentValueModifier = governmentMods.valueModifier;
      governmentRewardModifier = governmentMods.rewardModifier;
      experienceModifier += governmentMods.valueModifier;
      rewardModifier += governmentMods.rewardModifier;
    }
    // Nota: Instituições de Ofício são neutras (sem modificadores de relação)

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
      populationRelationValue: populationValueModifier,
      populationRelationReward: populationRewardModifier,
      governmentRelationValue: governmentValueModifier,
      governmentRelationReward: governmentRewardModifier,
      staffPreparation,
    };
  }

  /**
   * Calcula multiplicadores de dificuldade
   */
  private static calculateDifficultyMultipliers(
    difficultyEntry?: TableEntry<{
      difficulty: ContractDifficulty;
      experienceMultiplier: number;
      rewardMultiplier: number;
    }>
  ): {
    experienceMultiplier: number;
    rewardMultiplier: number;
  } {
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
   * Gera objetivo principal e especificações usando multiRollHandler para tratar "role duas vezes"
   */
  private static generateObjective(): ContractObjective {
    // Usar o sistema multiRollHandler para tratar "role duas vezes" corretamente
    const objectiveResult = handleMultipleRolls({
      table: MAIN_OBJECTIVE_TABLE,
      shouldRollAgain: (result: { category: ObjectiveCategory; name: string; description: string }) => shouldRollTwiceForObjective(result),
      context: "Objetivos Principais",
      maxUniqueResults: 5 // Máximo de 5 objetivos para evitar complexidade excessiva
    });

    // Se temos múltiplos objetivos (resultado de "role duas vezes")
    if (objectiveResult.results.length > 1) {
      const firstObjective = objectiveResult.results[0];
      const secondObjective = objectiveResult.results[1];

      // Gerar especificações para ambos os objetivos
      const firstSpec = this.generateObjectiveSpecification(firstObjective.category);
      const secondSpec = this.generateObjectiveSpecification(secondObjective.category);

      return {
        category: firstObjective.category,
        description: `${firstObjective.description}. Além disso, ${secondObjective.description.toLowerCase()}`,
        specificObjective: `${firstSpec.target} e ${secondSpec.target}`,
      };
    }

    // Objetivo único
    const objectiveEntry = objectiveResult.results[0];

    // Gerar especificação baseada na categoria
    const specification = this.generateObjectiveSpecification(objectiveEntry.category);

    return {
      category: objectiveEntry.category,
      description: objectiveEntry.description,
      specificObjective: specification.target,
    };
  }

  /**
   * Gera especificação do objetivo baseado na categoria usando multiRollHandler
   */
  private static generateObjectiveSpecification(category: ObjectiveCategory): {
    target: string;
    description: string;
  } {
    const specTable = getObjectiveSpecificationTable(category);
    
    // Usar multiRollHandler para tratar "role duas vezes" nas especificações
    const specResult = handleMultipleRolls({
      table: specTable,
      shouldRollAgain: (result: { target: string; description: string; rollTwice?: boolean }) => 
        shouldRollTwiceForSpecification(result),
      context: `Especificação ${category}`,
      maxUniqueResults: 5 // Máximo de 5 especificações
    });

    // Se temos múltiplas especificações (resultado de "role duas vezes")
    if (specResult.results.length > 1) {
      const firstSpec = specResult.results[0];
      const secondSpec = specResult.results[1];

      return {
        target: `${firstSpec.target}, além disso ${secondSpec.target.toLowerCase()}`,
        description: `${firstSpec.description}. Além disso, ${secondSpec.description.toLowerCase()}`,
      };
    }

    // Especificação única
    return specResult.results[0];
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
   * Gera antagonista usando multiRollHandler
   */
  private static generateAntagonist(): Antagonist {
    return AntagonistGenerator.generateAntagonist();
  }

  /**
   * Gera complicações usando o complicationGenerator
   */
  private static generateComplications(): Complication[] {
    // Usar o complicationGenerator que já implementa corretamente o multiRollHandler
    const complication = generateComplication();
    return [complication];
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
   * Obter a descrição da distância baseada na rolagem
   */
  private static getDistanceDescription(distanceRoll: number): string {
    const distanceEntry = CONTRACT_DISTANCE_TABLE.find(
      (entry) => distanceRoll >= entry.min && distanceRoll <= entry.max
    );
    return distanceEntry?.result.description || "Distância não especificada";
  }

  /**
   * Obter a descrição da distância de um contrato
   */
  static getContractDistanceDescription(contract: Contract): string {
    if (!contract.generationData.distanceRoll) {
      return "Distância não especificada";
    }
    return this.getDistanceDescription(contract.generationData.distanceRoll);
  }

  /**
   * Mapeamento de números em texto para valores numéricos e suas configurações
   */
  private static readonly HEXAGON_PATTERNS = [
    {
      pattern: /Um hexágono/i,
      value: 1,
      getRanges: (desc: string) =>
        desc.includes("ou menos") ? { min: 0, max: 1 } : { min: 1, max: 10 },
    },
    {
      pattern: /Dois hexágonos/i,
      value: 2,
      getRanges: (desc: string) =>
        desc.includes("ou menos") ? { min: 0, max: 2 } : { min: 2, max: 10 },
    },
    {
      pattern: /Três hexágonos/i,
      value: 3,
      getRanges: (desc: string) =>
        desc.includes("ou menos") ? { min: 0, max: 3 } : { min: 3, max: 10 },
    },
    {
      pattern: /Quatro hexágonos/i,
      value: 4,
      getRanges: () => ({ min: 4, max: 10 }),
    },
    {
      pattern: /Cinco hexágonos/i,
      value: 5,
      getRanges: () => ({ min: 5, max: 10 }),
    },
    {
      pattern: /Seis hexágonos/i,
      value: 6,
      getRanges: () => ({ min: 6, max: 10 }),
    },
    {
      pattern: /Sete hexágonos/i,
      value: 7,
      getRanges: () => ({ min: 7, max: 10 }),
    },
    {
      pattern: /Oito hexágonos/i,
      value: 8,
      getRanges: () => ({ min: 8, max: 10 }),
    },
  ] as const;

  /**
   * Constante para conversão de hexágonos para quilômetros
   */
  private static readonly KM_PER_HEXAGON = 9.5;

  /**
   * Extrai informações de hexágonos da descrição de distância
   */
  private static extractHexagonsFromDescription(
    description: string
  ): { min: number; max: number } | null {
    const matchedPattern = this.HEXAGON_PATTERNS.find((pattern) =>
      pattern.pattern.test(description)
    );

    return matchedPattern ? matchedPattern.getRanges(description) : null;
  }

  /**
   * Converte hexágonos para quilômetros com arredondamento apropriado
   */
  private static hexagonsToKilometers(hexagons: { min: number; max: number }): {
    min: number;
    max: number;
  } {
    return {
      min: Math.round(hexagons.min * this.KM_PER_HEXAGON * 10) / 10,
      max: Math.round(hexagons.max * this.KM_PER_HEXAGON * 10) / 10,
    };
  }

  /**
   * Obtém entrada da tabela de distância baseada na rolagem
   */
  private static getDistanceTableEntry(distanceRoll: number) {
    return CONTRACT_DISTANCE_TABLE.find(
      (entry) => distanceRoll >= entry.min && distanceRoll <= entry.max
    );
  }

  /**
   * Obter informações detalhadas da distância de um contrato
   */
  static getContractDistanceDetails(contract: Contract): {
    description: string;
    hexagons: { min: number; max: number } | null;
    kilometers: { min: number; max: number } | null;
  } {
    const distanceRoll = contract.generationData.distanceRoll;

    if (!distanceRoll) {
      return {
        description: "Distância não especificada",
        hexagons: null,
        kilometers: null,
      };
    }

    const distanceEntry = this.getDistanceTableEntry(distanceRoll);

    if (!distanceEntry) {
      return {
        description: "Distância não especificada",
        hexagons: null,
        kilometers: null,
      };
    }

    const description = distanceEntry.result.description;
    const hexagons = this.extractHexagonsFromDescription(description);
    const kilometers = hexagons ? this.hexagonsToKilometers(hexagons) : null;

    return {
      description,
      hexagons,
      kilometers,
    };
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
    distanceRoll?: number;
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
      distanceRoll,
    } = params;

    const sections: string[] = [];

    // 1. Contratante
    sections.push(
      `**Contratante:** ${contractor.name} (${contractor.description})`
    );

    // 2. Objetivo
    const objectiveText = `**Objetivo:** ${objective.description} (${objective.specificObjective})`;
    sections.push(objectiveText);

    // 3. Localidade com todas as informações organizadas
    let locationText = `**Local:** ${location.name} (${location.specification?.location})`;

    if (location.specification) {
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

    // 4. Distância
    if (distanceRoll) {
      const distanceDescription = this.getDistanceDescription(distanceRoll);

      // Obter detalhes da distância para mostrar a aproximação correta em km
      const distanceDetails = this.getContractDistanceDetails({
        generationData: { distanceRoll },
      } as Contract);

      let kmInfo = "";
      if (distanceDetails.kilometers) {
        if (distanceDetails.kilometers.min === distanceDetails.kilometers.max) {
          kmInfo = ` (aproximadamente ${distanceDetails.kilometers.min} km)`;
        } else {
          kmInfo = ` (aproximadamente ${distanceDetails.kilometers.min}-${distanceDetails.kilometers.max} km)`;
        }
      }

      sections.push(`**Distância:** ${distanceDescription}${kmInfo}`);
    }

    // 5. Antagonista
    sections.push(
      `**Antagonista:** ${antagonist.specificType}: ${antagonist.description}`
    );

    // 6. Complicações
    if (complications.length > 0) {
      const complicationTexts = complications
        .map((c) => `${c.description}`)
        .join("\n");
      sections.push(`**Complicações:** ${complicationTexts}`);
    }

    // 7. Aliados (se houver)
    if (allies.length > 0) {
      const allyTexts = allies
        .map(
          (ally) => `• ${ally.name} (${ally.category}) - ${ally.description}`
        )
        .join("\n");
      sections.push(`**Aliados potenciais:**\n${allyTexts}`);
    }

    // 8. Reviravoltas (se houver)
    if (twists.length > 0) {
      const twistTexts = twists.map((t) => `• ${t.description}`).join("\n");
      sections.push(`**Reviravoltas:**\n${twistTexts}`);
    }

    // 9. Valor em XP
    sections.push(`**Experiência:** ${finalValueResult.experienceValue} XP`);

    // 10. Recompensa principal
    const formattedReward = Number(
      finalValueResult.finalGoldReward.toFixed(1)
    ).toString();
    sections.push(`**Recompensa:** ${formattedReward} PO$`);

    // 11. Recompensas e incentivos (se houver)
    if (additionalRewards.length > 0) {
      const rewardTexts = additionalRewards
        .map((reward) => {
          const prefix = reward.isPositive ? "✓" : "⚠";
          return `${prefix} ${reward.description}`;
        })
        .join("\n");
      sections.push(`**Recompensas e Incentivos:**\n${rewardTexts}`);
    }

    // 12. Consequências severas (se houver)
    if (severeConsequences.length > 0) {
      const consequenceTexts = severeConsequences
        .map(
          (consequence) =>
            `• ${consequence.description}\n  Afeta contratados: ${consequence.affectsContractors}`
        )
        .join("\n");
      sections.push(`**Consequências por falha:**\n${consequenceTexts}`);
    }

    // 13. Prazo
    if (deadline.type !== DeadlineType.SEM_PRAZO) {
      sections.push(`**Prazo:** ${deadline.value}`);
    }

    // 14. Pré-requisitos (se houver)
    if (prerequisites.length > 0) {
      const prerequisiteTexts = prerequisites.map((p) => `• ${p}`).join("\n");
      sections.push(`**Pré-requisitos:**\n${prerequisiteTexts}`);
    }

    // 15. Cláusulas (se houver)
    if (clauses.length > 0) {
      const clauseTexts = clauses.map((c) => `• ${c}`).join("\n");
      sections.push(`**Cláusulas:**\n${clauseTexts}`);
    }

    // 16. Tipo de pagamento
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

    // 2. Gerar tipos de aliados usando multiRollHandler
    const allyTypesResult = handleMultipleRolls({
      table: ALLY_TYPES_TABLE,
      shouldRollAgain: (result) => String(result).includes("Role duas vezes"),
      context: "Tipos de Aliados"
    });

    // 3. Gerar timing usando multiRollHandler
    const timingResult = handleMultipleRolls({
      table: ALLY_APPEARANCE_TIMING_TABLE,
      shouldRollAgain: (result) => String(result).includes("Role duas vezes"),
      context: "Timing de Aparição"
    });

    // 4. Criar aliados para cada combinação de tipo e timing
    for (let i = 0; i < Math.max(allyTypesResult.results.length, timingResult.results.length); i++) {
      const allyTypeString = String(allyTypesResult.results[i % allyTypesResult.results.length]);
      const timingString = String(timingResult.results[i % timingResult.results.length]);
      
      const allyCategory = this.mapStringToAllyCategory(allyTypeString);
      const allyTiming = this.mapStringToAllyTiming(timingString);

      // 5. Gerar detalhes específicos do aliado
      const allyDetails = this.generateAllyDetails(allyCategory);

      // 6. Criar o objeto do aliado
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
    }

    return allies;
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
      // Usar multiRollHandler para tratar "Role duas vezes e use ambos"
      const multiRollResult = handleMultipleRolls({
        table: detailTable,
        shouldRollAgain: (result) => String(result).includes("Role duas vezes"),
        context: `Detalhamento da Consequência ${consequenceCategory}`
      });

      // 4. Criar as consequências
      for (const specificConsequence of multiRollResult.results) {
        const consequence: SevereConsequence = {
          category: consequenceCategory,
          specificConsequence: String(specificConsequence),
          description: this.generateConsequenceDescription(
            consequenceCategory,
            String(specificConsequence)
          ),
          affectsContractors: this.generateContractorConsequenceDescription(
            consequenceCategory,
            String(specificConsequence)
          ),
        };

        consequences.push(consequence);
      }
    }

    return consequences;
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
      rewards.push(rewardDetail);
      
      // Se há resultados adicionais de rolagem múltipla, criar recompensas extras
      if ('additionalResults' in rewardDetail) {
        const additionalResults = (rewardDetail as AdditionalReward & { additionalResults: string[] }).additionalResults;
        for (const additionalResult of additionalResults) {
          rewards.push({
            category: rewardDetail.category,
            specificReward: additionalResult,
            description: this.generateRewardDescription(rewardDetail.category, additionalResult),
            isPositive: rewardDetail.isPositive,
          });
        }
      }
    }

    return rewards;
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

    // Usar multiRollHandler para tratar "Role duas vezes e use ambos"
    const multiRollResult = handleMultipleRolls({
      table: detailTable,
      shouldRollAgain: (result) => String(result).includes("Role duas vezes"),
      context: `Detalhamento ${rewardType}`
    });

    // Se temos múltiplos resultados, retornar apenas o primeiro
    // O sistema de recompensas tratará múltiplos resultados no nível superior
    const specificReward = multiRollResult.results.length > 0 
      ? String(multiRollResult.results[0])
      : "Recompensa padrão";

    return {
      category,
      specificReward,
      description: this.generateRewardDescription(category, specificReward),
      isPositive,
      // Se houve rolagem múltipla, guardar os resultados extras para processamento posterior
      ...(multiRollResult.results.length > 1 && { 
        additionalResults: multiRollResult.results.slice(1).map(String) 
      })
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

  /**
   * Atualiza a descrição do contrato quando a recompensa é reajustada
   * Mostra o valor anterior e o novo valor com o motivo do reajuste
   */
  public static updateContractDescriptionWithBonusReward(
    contract: Contract,
    previousValue: number,
    reason: string = "bônus por não resolução"
  ): string {
    // Função auxiliar para formatar valores evitando dízimas periódicas
    const formatCurrency = (value: number): string => {
      return Number(value.toFixed(1)).toString();
    };

    // Buscar a seção de recompensa na descrição atual
    const currentDescription = contract.description;
    const rewardPattern =
      /\*\*Recompensa:\*\* ([\d.,]+) PO\$( \*\(reajustada\)\*)?/;

    const formattedPrevious = formatCurrency(previousValue);
    const formattedCurrent = formatCurrency(contract.value.finalGoldReward);

    // Substituir a seção de recompensa existente
    const bonusText = `**Recompensa:** ${formattedCurrent} PO$ **(reajustada)**\n> Histórico do Reajuste\n- **Valor original:** ${formattedPrevious} PO$\n- **Bônus aplicado:** Por ${reason}\n- **Valor atual:** ${formattedCurrent} PO$`;

    return currentDescription.replace(rewardPattern, bonusText);
  }
}
