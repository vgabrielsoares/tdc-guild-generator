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
  POPULATION_RELATION_MODIFIERS,
  GOVERNMENT_RELATION_MODIFIERS,
  STAFF_PREPARATION_ROLL_MODIFIERS,
  calculateExtendedValue,
} from "../../data/tables/contract-base-tables";
import {
  MAIN_OBJECTIVE_TABLE,
  getObjectiveSpecificationTable,
  shouldRollTwiceForObjective,
  shouldRollTwiceForSpecification,
} from "../../data/tables/contract-content-tables";
import {
  ContractStatus,
  ContractDifficulty,
  ContractorType,
  DeadlineType,
  PaymentType,
  ObjectiveCategory,
  LocationCategory,
} from "../../types/contract";
import type {
  Contract,
  ContractValue,
  ContractModifiers,
  ContractObjective,
  ContractLocation,
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
    const clauses = this.generateClauses();

    // 12. Gerar tipo de pagamento
    const paymentType = this.generatePaymentType();

    // 13. Estrutura básica do contrato
    const contract: Contract = {
      id: this.generateId(),
      title: `Contrato #${Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0")}`,
      description: `${objective.description} | Local: ${location.description} | Contratante: ${contractor.description}${prerequisites.length > 0 ? ` | Pré-requisitos: ${prerequisites.join(", ")}` : ""}${clauses.length > 0 ? ` | Cláusulas: ${clauses.join(", ")}` : ""}`,
      status: ContractStatus.DISPONIVEL,
      difficulty,
      contractorType: contractor.type,
      contractorName: contractor.name,
      objective,
      location,
      value: valueResult,
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
    experienceValue += modifiers.populationRelation;
    rewardValue += modifiers.populationRelation;

    // 6. Aplicar modificadores de relação com governo
    experienceValue += modifiers.governmentRelation;
    rewardValue += modifiers.governmentRelation;

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
    const populationRelation = this.mapRelationLevelToString(
      guild.relations.population
    );
    const populationMods = POPULATION_RELATION_MODIFIERS[populationRelation];
    if (populationMods) {
      modifiers.populationRelation = populationMods.rewardModifier; // Usar rewardModifier conforme regras
    }

    // 3. Aplicar modificadores por relação com governo
    const governmentRelation = this.mapRelationLevelToString(
      guild.relations.government
    );
    const governmentMods = GOVERNMENT_RELATION_MODIFIERS[governmentRelation];
    if (governmentMods) {
      modifiers.governmentRelation = governmentMods.rewardModifier; // Usar rewardModifier conforme regras
    }

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
   * Gera contratante específico do governo conforme tabela do markdown
   */
  private static generateGovernmentContractor(): {
    name: string;
    description: string;
  } {
    const governmentRoll = rollDice({ notation: "1d20" }).result;

    if (governmentRoll <= 2) {
      return {
        name: "Arcanista Diplomata",
        description:
          "Um mago experiente que representa os interesses arcanos do governo",
      };
    } else if (governmentRoll <= 5) {
      return {
        name: "Membro Importante do Clero",
        description: "Um alto sacerdote com influência política significativa",
      };
    } else if (governmentRoll <= 10) {
      return {
        name: "Nobre Poderoso",
        description:
          "Um aristocrata com considerável poder político e econômico",
      };
    } else if (governmentRoll <= 15) {
      return {
        name: "Círculo Familiar dos Governantes",
        description:
          "Um membro da família real ou do círculo íntimo dos líderes",
      };
    } else if (governmentRoll === 16) {
      return {
        name: "Agente Burocrático",
        description:
          "Um funcionário público de alto escalão (juiz, cobrador de impostos, advogado)",
      };
    } else if (governmentRoll === 17) {
      return {
        name: "Militar de Alto Escalão",
        description: "Um general ou comandante das forças armadas locais",
      };
    } else if (governmentRoll <= 19) {
      return {
        name: "Membro do Governo de Outro Assentamento",
        description: "Representante diplomático de outra cidade ou região",
      };
    } else {
      return {
        name: "Líder Local",
        description: "O próprio governante ou seu representante direto",
      };
    }
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
   * Gera objetivo principal e especificações seguindo as tabelas do markdown
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
    // Implementação usando as tabelas de localidades já implementadas
    // Por ora, usar implementação simplificada
    const locationRoll = rollDice({ notation: "1d20" }).result;

    let mainLocation: string;

    if (locationRoll <= 4) {
      mainLocation = "Cidade grande";
    } else if (locationRoll <= 9) {
      mainLocation = "Ruínas ou masmorras";
    } else if (locationRoll <= 12) {
      mainLocation = "Região selvagem";
    } else if (locationRoll <= 14) {
      mainLocation = "Lugar isolado";
    } else if (locationRoll <= 17) {
      mainLocation = "Zona rural";
    } else if (locationRoll === 18) {
      mainLocation = "Localidade exótica";
    } else if (locationRoll === 19) {
      mainLocation = "Profundezas";
    } else {
      mainLocation = "Terras mórbidas";
    }

    return {
      category: LocationCategory.URBANO, // Usar enum padrão por enquanto
      specificLocation: mainLocation,
      name: mainLocation,
      description: `Contrato localizado em: ${mainLocation}`,
    };
  }

  /**
   * Gera pré-requisitos seguindo as tabelas do markdown
   */
  private static generatePrerequisites(contractValue: number): string[] {
    const prerequisites: string[] = [];

    // Determinar se deve ter pré-requisitos baseado no valor
    if (contractValue < 200) {
      return prerequisites; // Contratos simples não têm pré-requisitos
    }

    // Rolar na tabela de pré-requisitos (1d20)
    const prereqRoll = rollDice({ notation: "1d20" }).result;

    if (prereqRoll <= 5) {
      prerequisites.push("Nenhum pré-requisito específico");
    } else if (prereqRoll <= 8) {
      prerequisites.push("Renome mínimo de 5 pontos");
    } else if (prereqRoll <= 10) {
      prerequisites.push("Pelo menos um conjurador no grupo");
    } else if (prereqRoll <= 12) {
      prerequisites.push("Habilidade específica requerida");
    } else if (prereqRoll <= 14) {
      prerequisites.push("Proficiência com ferramentas específicas");
    } else if (prereqRoll <= 16) {
      prerequisites.push("Veículo ou montaria necessária");
    } else if (prereqRoll <= 18) {
      prerequisites.push("Grupo de pelo menos 3 pessoas");
    } else {
      prerequisites.push("Múltiplos pré-requisitos");
      // Rolar novamente para pré-requisitos adicionais
      const additional = this.generatePrerequisites(contractValue / 2);
      prerequisites.push(...additional.slice(0, 2));
    }

    return prerequisites;
  }

  /**
   * Gera cláusulas especiais seguindo as tabelas do markdown
   */
  private static generateClauses(): string[] {
    const clauses: string[] = [];

    // 20% de chance de ter cláusula especial
    if (Math.random() > 0.8) {
      return clauses; // Sem cláusulas especiais
    }

    // Rolar na tabela de cláusulas (1d20)
    const clauseRoll = rollDice({ notation: "1d20" }).result;

    if (clauseRoll <= 2) {
      clauses.push("Proibido matar qualquer criatura");
    } else if (clauseRoll <= 4) {
      clauses.push("Proteger criatura específica durante a missão");
    } else if (clauseRoll <= 6) {
      clauses.push("Troféu ou prova necessária");
    } else if (clauseRoll <= 8) {
      clauses.push("Missão deve ser completada em total discrição");
    } else if (clauseRoll <= 10) {
      clauses.push("Proibido o uso de magia");
    } else if (clauseRoll <= 12) {
      clauses.push("Competição com outros grupos");
    } else if (clauseRoll <= 14) {
      clauses.push("Exterminar completamente a fonte do problema");
    } else if (clauseRoll <= 16) {
      clauses.push("Supervisor acompanhará o grupo");
    } else if (clauseRoll === 17) {
      clauses.push("Restrição de tempo específica");
    } else if (clauseRoll === 18) {
      clauses.push("Relatório detalhado obrigatório");
    } else if (clauseRoll === 19) {
      clauses.push("Todo tesouro conquistado é de posse do contratante");
    } else {
      clauses.push("Identidade secreta obrigatória");
    }

    return clauses;
  }

  /**
   * Gera tipo de pagamento seguindo as tabelas do markdown
   */
  private static generatePaymentType(): PaymentType {
    // Rolar na tabela de tipo de pagamento (1d20)
    const paymentRoll = rollDice({ notation: "1d20" }).result;

    if (paymentRoll <= 3) {
      return PaymentType.DIRETO_CONTRATANTE;
    } else if (paymentRoll <= 6) {
      return PaymentType.METADE_GUILDA_METADE_CONTRATANTE;
    } else if (paymentRoll <= 9) {
      return PaymentType.METADE_GUILDA_METADE_BENS;
    } else if (paymentRoll <= 11) {
      return PaymentType.BENS_SERVICOS;
    } else if (paymentRoll <= 18) {
      return PaymentType.TOTAL_GUILDA;
    } else {
      return PaymentType.TOTAL_GUILDA_MAIS_SERVICOS;
    }
  }
}
