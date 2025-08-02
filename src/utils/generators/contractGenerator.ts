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
    const difficulty = difficultyEntry?.result.difficulty || ContractDifficulty.MEDIO;

    // 7. Gerar contratante seguindo as regras do markdown
    const contractor = this.generateContractor(guild);

    // 8. Gerar objetivo conforme tabela do markdown
    const objective = this.generateObjective();

    // 9. Gerar localidade conforme tabela do markdown
    const location = this.generateLocation();

    // 10. Gerar pré-requisitos baseados no valor
    const prerequisites = this.generatePrerequisites(valueResult.experienceValue);

    // 11. Gerar cláusulas especiais
    const clauses = this.generateClauses();

    // 12. Gerar tipo de pagamento
    const paymentType = this.generatePaymentType();

    // 13. Estrutura básica do contrato
    const contract: Contract = {
      id: this.generateId(),
      title: `Contrato #${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
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

  /**
   * Gera o contratante
   * 1. Rola 1d20 para determinar tipo (Povo/Instituição/Governo)
   * 2. Aplica modificadores por relação com população e governo
   * 3. Se for governo, gera contratante específico
   */
  private static generateContractor(guild: Guild): { type: ContractorType; name: string; description: string } {
    // 1. Rolagem base 1d20
    let contractorRoll = rollDice({ notation: "1d20" }).result;

    // 2. Aplicar modificadores por relação com população
    const populationRelation = this.mapRelationLevelToString(guild.relations.population);
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
    const governmentRelation = this.mapRelationLevelToString(guild.relations.government);
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
  private static generateGovernmentContractor(): { name: string; description: string } {
    const governmentRoll = rollDice({ notation: "1d20" }).result;

    if (governmentRoll <= 2) {
      return {
        name: "Arcanista Diplomata",
        description: "Um mago experiente que representa os interesses arcanos do governo",
      };
    } else if (governmentRoll <= 5) {
      return {
        name: "Membro Importante do Clero",
        description: "Um alto sacerdote com influência política significativa",
      };
    } else if (governmentRoll <= 10) {
      return {
        name: "Nobre Poderoso",
        description: "Um aristocrata com considerável poder político e econômico",
      };
    } else if (governmentRoll <= 15) {
      return {
        name: "Círculo Familiar dos Governantes",
        description: "Um membro da família real ou do círculo íntimo dos líderes",
      };
    } else if (governmentRoll === 16) {
      return {
        name: "Agente Burocrático",
        description: "Um funcionário público de alto escalão (juiz, cobrador de impostos, advogado)",
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
    const objectiveRoll = rollDice({ notation: "1d20" }).result;
    
    let category: string;
    let rollTwice = false;
    
    if (objectiveRoll <= 2) {
      category = "Atacar ou destruir";
    } else if (objectiveRoll <= 5) {
      category = "Encontrar ou recuperar";
    } else if (objectiveRoll <= 7) {
      category = "Capturar";
    } else if (objectiveRoll <= 9) {
      category = "Proteger ou salvar";
    } else if (objectiveRoll <= 11) {
      category = "Explorar ou descobrir";
    } else if (objectiveRoll <= 13) {
      category = "Entregar ou receber";
    } else if (objectiveRoll === 14) {
      category = "Investigar ou sabotar";
    } else if (objectiveRoll <= 18) {
      category = "Serviços perigosos";
    } else if (objectiveRoll === 19) {
      category = "Religioso";
    } else {
      rollTwice = true;
      category = "Múltiplos objetivos";
    }

    // 2. Gerar especificação baseada na categoria
    const specification = this.generateObjectiveSpecification(category, rollTwice);

    return {
      category: ObjectiveCategory.ELIMINACAO, // Usar enum padrão por enquanto
      specificObjective: specification.target,
      description: specification.description,
      urgencyLevel: this.generateUrgencyLevel(),
      isSecretMission: Math.random() < 0.1, // 10% chance de ser missão secreta
      specifications: {
        minimumPartySize: this.generateMinimumPartySize(),
        requiredSkills: this.generateRequiredSkills(category),
        forbiddenActions: this.generateForbiddenActions(),
        specialEquipment: this.generateSpecialEquipment(category),
        timeWindow: this.generateTimeWindow(),
      },
    };
  }

  /**
   * Gera especificação do objetivo baseado na categoria
   */
  private static generateObjectiveSpecification(category: string, rollTwice: boolean): { target: string; description: string } {
    if (rollTwice) {
      // Para múltiplos objetivos, combinar dois objetivos
      const firstObjective = this.generateSingleObjectiveSpecification();
      const secondObjective = this.generateSingleObjectiveSpecification();
      return {
        target: `${firstObjective.target} e ${secondObjective.target}`,
        description: `${firstObjective.description} Além disso, ${secondObjective.description}`,
      };
    }

    return this.generateSingleObjectiveSpecification(category);
  }

  /**
   * Gera uma especificação individual de objetivo
   */
  private static generateSingleObjectiveSpecification(category?: string): { target: string; description: string } {
    if (!category) {
      // Rolar categoria aleatória
      const categories = [
        "Atacar ou destruir",
        "Encontrar ou recuperar", 
        "Capturar",
        "Proteger ou salvar",
        "Explorar ou descobrir",
        "Entregar ou receber",
        "Investigar ou sabotar",
        "Serviços perigosos",
        "Religioso"
      ];
      category = categories[Math.floor(Math.random() * categories.length)];
    }

    const specRoll = rollDice({ notation: "1d20" }).result;

    switch (category) {
      case "Atacar ou destruir":
        return this.generateAttackDestroySpec(specRoll);
      case "Encontrar ou recuperar":
        return this.generateFindRecoverSpec(specRoll);
      case "Capturar":
        return this.generateCaptureSpec(specRoll);
      case "Proteger ou salvar":
        return this.generateProtectSaveSpec(specRoll);
      case "Explorar ou descobrir":
        return this.generateExploreDiscoverSpec(specRoll);
      case "Entregar ou receber":
        return this.generateDeliverReceiveSpec(specRoll);
      case "Investigar ou sabotar":
        return this.generateInvestigateSabotageSpec(specRoll);
      case "Serviços perigosos":
        return this.generateDangerousServicesSpec(specRoll);
      case "Religioso":
        return this.generateReligiousSpec(specRoll);
      default:
        return {
          target: "Objetivo indeterminado",
          description: "Um objetivo complexo que requer análise detalhada",
        };
    }
  }

  // Métodos para gerar especificações por categoria (implementação simplificada)
  private static generateAttackDestroySpec(roll: number): { target: string; description: string } {
    if (roll === 1) return { target: "Uma pessoa poderosa", description: "Eliminar ou neutralizar uma figura influente" };
    if (roll <= 3) return { target: "Uma organização", description: "Desmantelar ou destruir uma organização criminosa" };
    if (roll <= 5) return { target: "Uma comunidade", description: "Atacar ou dispersar uma comunidade hostil" };
    if (roll === 6) return { target: "Um artefato ou objeto", description: "Destruir um item perigoso ou mágico" };
    if (roll <= 10) return { target: "Uma criatura ou monstro", description: "Eliminar uma ameaça bestial" };
    if (roll <= 12) return { target: "Um local ou território", description: "Tomar ou destruir uma fortificação" };
    if (roll === 13) return { target: "Uma ideia, aliança ou reputação", description: "Sabotar relacionamentos ou reputações" };
    if (roll === 14) return { target: "Recursos", description: "Destruir suprimentos ou recursos estratégicos" };
    if (roll === 15) return { target: "Um evento", description: "Impedir ou sabotar um evento importante" };
    if (roll === 16) return { target: "Um veículo ou engenhoca", description: "Destruir meio de transporte ou máquina" };
    if (roll <= 19) return { target: "Uma gangue ou quadrilha", description: "Eliminar grupo de criminosos organizados" };
    return { target: "Múltiplos alvos", description: "Eliminar vários alvos relacionados" };
  }

  private static generateFindRecoverSpec(roll: number): { target: string; description: string } {
    if (roll === 1) return { target: "Uma pessoa", description: "Localizar e recuperar pessoa desaparecida" };
    if (roll <= 3) return { target: "Um objeto", description: "Encontrar item perdido ou roubado" };
    if (roll <= 5) return { target: "Uma criatura", description: "Capturar criatura específica viva" };
    if (roll <= 7) return { target: "Informação", description: "Descobrir segredos ou inteligência" };
    if (roll <= 9) return { target: "Um local", description: "Encontrar localização perdida ou secreta" };
    if (roll <= 11) return { target: "Recursos", description: "Localizar e recuperar recursos valiosos" };
    if (roll <= 13) return { target: "Prova ou evidência", description: "Encontrar evidências de crime ou conspiração" };
    if (roll <= 15) return { target: "Aliado perdido", description: "Resgatar aliado capturado ou perdido" };
    if (roll <= 17) return { target: "Artefato mágico", description: "Recuperar item com poderes sobrenaturais" };
    if (roll <= 19) return { target: "Conhecimento ancestral", description: "Descobrir sabedoria ou técnicas perdidas" };
    return { target: "Múltiplos itens", description: "Recuperar vários objetos relacionados" };
  }

  private static generateCaptureSpec(roll: number): { target: string; description: string } {
    if (roll <= 5) return { target: "Criminoso", description: "Capturar fugitivo da justiça" };
    if (roll <= 10) return { target: "Criatura específica", description: "Capturar viva criatura para estudo" };
    if (roll <= 15) return { target: "Espião ou infiltrado", description: "Capturar agente inimigo" };
    return { target: "Alvo de alto valor", description: "Capturar pessoa muito importante" };
  }

  private static generateProtectSaveSpec(roll: number): { target: string; description: string } {
    if (roll <= 5) return { target: "Pessoa importante", description: "Proteger VIP de ameaças" };
    if (roll <= 10) return { target: "Local estratégico", description: "Defender posição importante" };
    if (roll <= 15) return { target: "Caravana ou grupo", description: "Escoltar grupo em viagem perigosa" };
    return { target: "Evento especial", description: "Garantir segurança de evento importante" };
  }

  private static generateExploreDiscoverSpec(roll: number): { target: string; description: string } {
    if (roll <= 5) return { target: "Território desconhecido", description: "Explorar e mapear região inexplorada" };
    if (roll <= 10) return { target: "Ruínas antigas", description: "Investigar sítio arqueológico" };
    if (roll <= 15) return { target: "Fenômeno estranho", description: "Estudar evento ou anomalia inexplicável" };
    return { target: "Rota comercial", description: "Estabelecer nova rota segura" };
  }

  private static generateDeliverReceiveSpec(roll: number): { target: string; description: string } {
    if (roll <= 5) return { target: "Mensagem importante", description: "Entregar comunicação confidencial" };
    if (roll <= 10) return { target: "Carga valiosa", description: "Transportar bens preciosos" };
    if (roll <= 15) return { target: "Suprimentos", description: "Entregar mantimentos ou equipamentos" };
    return { target: "Pessoa", description: "Transportar indivíduo com segurança" };
  }

  private static generateInvestigateSabotageSpec(roll: number): { target: string; description: string } {
    if (roll <= 5) return { target: "Investigar conspiração", description: "Descobrir trama contra autoridades" };
    if (roll <= 10) return { target: "Sabotar operação", description: "Impedir planos inimigos" };
    if (roll <= 15) return { target: "Infiltrar organização", description: "Obter informações de dentro" };
    return { target: "Desmantelar rede", description: "Destruir organização por dentro" };
  }

  private static generateDangerousServicesSpec(roll: number): { target: string; description: string } {
    if (roll <= 5) return { target: "Trabalho perigoso", description: "Realizar tarefa com alto risco" };
    if (roll <= 10) return { target: "Missão de resgate", description: "Salvar vítimas em situação perigosa" };
    if (roll <= 15) return { target: "Operação especial", description: "Executar missão militar especializada" };
    return { target: "Serviço único", description: "Realizar tarefa que requer habilidades específicas" };
  }

  private static generateReligiousSpec(roll: number): { target: string; description: string } {
    if (roll <= 5) return { target: "Missão sagrada", description: "Cumprir tarefa de natureza divina" };
    if (roll <= 10) return { target: "Purificar local", description: "Limpar área de influência maligna" };
    if (roll <= 15) return { target: "Recuperar relíquia", description: "Resgatar item sagrado" };
    return { target: "Cerimônia especial", description: "Participar ou proteger ritual importante" };
  }

  // Métodos auxiliares para gerar características do objetivo
  private static generateUrgencyLevel(): "Baixa" | "Média" | "Alta" | "Crítica" {
    const roll = Math.random();
    if (roll < 0.4) return "Baixa";
    if (roll < 0.7) return "Média";
    if (roll < 0.9) return "Alta";
    return "Crítica";
  }

  private static generateMinimumPartySize(): number {
    return Math.floor(Math.random() * 4) + 1; // 1-4 pessoas
  }

  private static generateRequiredSkills(category: string): string[] {
    const skillsByCategory: Record<string, string[]> = {
      "Atacar ou destruir": ["Combate", "Táticas"],
      "Encontrar ou recuperar": ["Investigação", "Rastreamento"],
      "Capturar": ["Combate não-letal", "Intimidação"],
      "Proteger ou salvar": ["Vigilância", "Primeiros socorros"],
      "Explorar ou descobrir": ["Sobrevivência", "Navegação"],
      "Entregar ou receber": ["Viagem", "Diplomacia"],
      "Investigar ou sabotar": ["Furtividade", "Investigação"],
      "Serviços perigosos": ["Especialização específica"],
      "Religioso": ["Conhecimento religioso"],
    };
    
    return skillsByCategory[category] || ["Habilidades gerais"];
  }

  private static generateForbiddenActions(): string[] {
    const forbidden = ["Sem mortes", "Discrição total", "Sem magia", "Sem violência"];
    const count = Math.floor(Math.random() * 3);
    return forbidden.slice(0, count);
  }

  private static generateSpecialEquipment(category: string): string[] {
    const equipmentByCategory: Record<string, string[]> = {
      "Atacar ou destruir": ["Armas especiais"],
      "Encontrar ou recuperar": ["Equipamento de rastreamento"],
      "Capturar": ["Redes", "Cordas"],
      "Proteger ou salvar": ["Armaduras", "Escudos"],
      "Explorar ou descobrir": ["Equipamento de exploração"],
      "Entregar ou receber": ["Veículo"],
      "Investigar ou sabotar": ["Ferramentas de espionagem"],
      "Serviços perigosos": ["Equipamento especializado"],
      "Religioso": ["Símbolos sagrados"],
    };
    
    return equipmentByCategory[category] || [];
  }

  private static generateTimeWindow(): string {
    const windows = ["Durante o dia", "Durante a noite", "Em lua nova", "Em festivais", "Em qualquer momento"];
    return windows[Math.floor(Math.random() * windows.length)];
  }

  /**
   * Gera localidade do contrato seguindo as regras do markdown
   */
  private static generateLocation(): ContractLocation {
    // Rolar tipo de localidade (1d20)
    const locationRoll = rollDice({ notation: "1d20" }).result;
    
    let specificLocation: string;
    let name: string;
    let description: string;
    
    if (locationRoll <= 5) {
      const urban = this.generateUrbanLocation();
      specificLocation = urban.type;
      name = urban.name;
      description = urban.description;
    } else if (locationRoll <= 10) {
      const rural = this.generateRuralLocation();
      specificLocation = rural.type;
      name = rural.name;
      description = rural.description;
    } else if (locationRoll <= 15) {
      const wild = this.generateWildLocation();
      specificLocation = wild.type;
      name = wild.name;
      description = wild.description;
    } else {
      const underground = this.generateUndergroundLocation();
      specificLocation = underground.type;
      name = underground.name;
      description = underground.description;
    }

    return {
      category: LocationCategory.URBANO, // Usar enum padrão por enquanto
      specificLocation,
      name,
      description,
      characteristics: {
        dangerLevel: this.generateDangerLevel(),
        accessibility: this.generateAccessibility(),
        population: this.generatePopulationLevel(),
        civilizationLevel: this.generateCivilizationLevel(),
      },
      modifiers: {
        experienceBonus: this.generateExperienceBonus(),
        rewardModifier: this.generateRewardModifier(),
        difficultyIncrease: this.generateDifficultyIncrease(),
      },
      travel: {
        distanceInHexes: this.generateDistance(),
        estimatedTravelTime: this.generateTravelTime(),
        transportRequired: Math.random() < 0.3,
        specialRequirements: this.generateSpecialRequirements(),
      },
    };
  }

  private static generateUrbanLocation(): { type: string; name: string; description: string } {
    const types = [
      { type: "Taverna local", name: "A Candeia Dourada", description: "Uma taverna movimentada no centro da cidade" },
      { type: "Mansão de nobre", name: "Solar dos Corvos", description: "Residência aristocrática nos altos da cidade" },
      { type: "Distrito pobre", name: "Quarteirão da Lama", description: "Área carente com becos estreitos" },
      { type: "Mercado", name: "Praça do Comércio", description: "Centro comercial com dezenas de bancas" },
      { type: "Templo", name: "Catedral da Luz", description: "Grande templo dedicado às divindades locais" },
    ];
    return types[Math.floor(Math.random() * types.length)];
  }

  private static generateRuralLocation(): { type: string; name: string; description: string } {
    const types = [
      { type: "Fazenda isolada", name: "Fazenda Pedraverde", description: "Propriedade rural distante do centro" },
      { type: "Vila pequena", name: "Vilarejo do Riacho", description: "Pequena comunidade rural" },
      { type: "Estrada comercial", name: "Rota dos Mercadores", description: "Estrada principal entre cidades" },
      { type: "Ponte importante", name: "Ponte dos Dois Rios", description: "Travessia estratégica sobre o rio" },
      { type: "Moinhos", name: "Moinhos do Vento Sul", description: "Complexo de moinhos na colina" },
    ];
    return types[Math.floor(Math.random() * types.length)];
  }

  private static generateWildLocation(): { type: string; name: string; description: string } {
    const types = [
      { type: "Floresta densa", name: "Mata do Eco Sombrio", description: "Floresta fechada com árvores centenárias" },
      { type: "Montanhas", name: "Picos da Névoa", description: "Cadeia montanhosa de difícil acesso" },
      { type: "Pântano", name: "Charco das Almas", description: "Área alagadiça perigosa e misteriosa" },
      { type: "Deserto", name: "Areias Vermelhas", description: "Vasta extensão de dunas ardentes" },
      { type: "Cavernas", name: "Gruta dos Cristais", description: "Sistema de cavernas naturais" },
    ];
    return types[Math.floor(Math.random() * types.length)];
  }

  private static generateUndergroundLocation(): { type: string; name: string; description: string } {
    const types = [
      { type: "Esgotos", name: "Canais Subterrâneos", description: "Sistema de drenagem da cidade" },
      { type: "Catacumbas", name: "Túmulos Ancestrais", description: "Cemitério subterrâneo antigo" },
      { type: "Minas", name: "Poços de Ferro", description: "Minas abandonadas nas montanhas" },
      { type: "Túneis", name: "Passagens Secretas", description: "Rede de túneis sob a cidade" },
      { type: "Masmorra", name: "Prisões Esquecidas", description: "Calabouços em ruínas" },
    ];
    return types[Math.floor(Math.random() * types.length)];
  }

  // Métodos auxiliares para características da localidade
  private static generateDangerLevel(): "Seguro" | "Baixo" | "Moderado" | "Alto" | "Extremo" {
    const levels: Array<"Seguro" | "Baixo" | "Moderado" | "Alto" | "Extremo"> = ["Seguro", "Baixo", "Moderado", "Alto", "Extremo"];
    return levels[Math.floor(Math.random() * levels.length)];
  }

  private static generateAccessibility(): "Fácil" | "Moderado" | "Difícil" | "Muito difícil" {
    const levels: Array<"Fácil" | "Moderado" | "Difícil" | "Muito difícil"> = ["Fácil", "Moderado", "Difícil", "Muito difícil"];
    return levels[Math.floor(Math.random() * levels.length)];
  }

  private static generatePopulationLevel(): "Desabitado" | "Pouco habitado" | "Moderado" | "Povoado" | "Densamente povoado" {
    const levels: Array<"Desabitado" | "Pouco habitado" | "Moderado" | "Povoado" | "Densamente povoado"> = 
      ["Desabitado", "Pouco habitado", "Moderado", "Povoado", "Densamente povoado"];
    return levels[Math.floor(Math.random() * levels.length)];
  }

  private static generateCivilizationLevel(): "Primitivo" | "Rural" | "Civilizado" | "Avançado" {
    const levels: Array<"Primitivo" | "Rural" | "Civilizado" | "Avançado"> = ["Primitivo", "Rural", "Civilizado", "Avançado"];
    return levels[Math.floor(Math.random() * levels.length)];
  }

  private static generateExperienceBonus(): number {
    return Math.floor(Math.random() * 21); // 0-20
  }

  private static generateRewardModifier(): number {
    return Math.floor(Math.random() * 41) - 20; // -20 a +20
  }

  private static generateDifficultyIncrease(): number {
    return Math.floor(Math.random() * 11); // 0-10
  }

  private static generateDistance(): number {
    return Math.floor(Math.random() * 20) + 1; // 1-20 hexes
  }

  private static generateTravelTime(): string {
    const times = ["1 dia", "2-3 dias", "1 semana", "2 semanas", "1 mês"];
    return times[Math.floor(Math.random() * times.length)];
  }

  private static generateSpecialRequirements(): string[] {
    const requirements = ["Guia local", "Equipamento especial", "Autorização", "Suprimentos extras"];
    const count = Math.floor(Math.random() * 3);
    return requirements.slice(0, count);
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
