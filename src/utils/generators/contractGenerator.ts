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

  /**
   * Gera localidade do contrato seguindo as regras do markdown
   */
  private static generateLocation(): ContractLocation {
    // 1. Rolar localidade principal (1d20)
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

    // 2. Gerar especificação baseada na localidade principal
    const specification = this.generateLocationSpecification(mainLocation);

    return {
      category: LocationCategory.URBANO, // Usar enum padrão por enquanto
      specificLocation: specification.specific,
      name: specification.name,
      description: `${mainLocation}: ${specification.specific}`,
    };
  }

  /**
   * Gera especificação de localidade baseada no tipo principal
   */
  private static generateLocationSpecification(mainLocation: string): { specific: string; name: string } {
    const specRoll = rollDice({ notation: "1d20" }).result;
    
    switch (mainLocation) {
      case "Cidade grande":
        return this.generateCidadeGrandeSpec(specRoll);
      case "Ruínas ou masmorras":
        return this.generateRuinasMasmorrasSpec(specRoll);
      case "Região selvagem":
        return this.generateRegiaoSelvagemSpec(specRoll);
      case "Lugar isolado":
        return this.generateLugarIsoladoSpec(specRoll);
      case "Zona rural":
        return this.generateZonaRuralSpec(specRoll);
      case "Localidade exótica":
        return this.generateLocalidadeExoticaSpec(specRoll);
      case "Profundezas":
        return this.generateProfundezasSpec(specRoll);
      case "Terras mórbidas":
        return this.generateTerrasMorbidasSpec(specRoll);
      default:
        return { specific: "Local indefinido", name: "Local Desconhecido" };
    }
  }

  // Métodos para gerar especificações por tipo de localidade (seguindo exatamente as tabelas do .md)
  private static generateCidadeGrandeSpec(roll: number): { specific: string; name: string } {
    if (roll === 1) return { specific: "Esgotos/subterrâneo da cidade", name: "Esgotos da Cidade" };
    if (roll === 2) return { specific: "Na moradia do líder local", name: "Palácio do Governante" };
    if (roll <= 4) return { specific: "Em um distrito específico", name: "Distrito da Cidade" };
    if (roll === 5) return { specific: "Casarão nobre", name: "Mansão Nobre" };
    if (roll === 6) return { specific: "Em uma das tavernas", name: "Taverna Local" };
    if (roll === 7) return { specific: "Templo local", name: "Templo da Cidade" };
    if (roll === 8) return { specific: "Local de recuperação de enfermos", name: "Hospital" };
    if (roll === 9) return { specific: "Construção/local icônico", name: "Marco da Cidade" };
    if (roll === 10) return { specific: "Centro de treinamento/estudos", name: "Academia" };
    if (roll <= 12) return { specific: "Submundo urbano", name: "Área Criminosa" };
    if (roll <= 14) return { specific: "Cemitério ou cripta", name: "Necrópole" };
    if (roll === 15) return { specific: "Mercado ou praça central", name: "Praça Central" };
    if (roll === 16) return { specific: "Quartel ou posto de guarda", name: "Quartel" };
    if (roll === 17) return { specific: "Área portuária ou entrada da cidade", name: "Portões da Cidade" };
    if (roll === 18) return { specific: "Armazém ou depósito", name: "Armazéns" };
    if (roll === 19) return { specific: "Torre ou fortificação", name: "Torre de Guarda" };
    return { specific: "Múltiplos locais na cidade", name: "Vários Locais" };
  }

  private static generateRuinasMasmorrasSpec(roll: number): { specific: string; name: string } {
    if (roll === 1) return { specific: "Complexo de cavernas", name: "Cavernas Antigas" };
    if (roll === 2) return { specific: "Assentamento humanoide", name: "Ruínas de Vila" };
    if (roll <= 4) return { specific: "Torre/fortaleza esquecida", name: "Torre Arruinada" };
    if (roll === 5) return { specific: "Labirinto", name: "Labirinto Perdido" };
    if (roll <= 7) return { specific: "Mina abandonada", name: "Minas Desertas" };
    if (roll === 8) return { specific: "Calabouço arruinado", name: "Prisão Antiga" };
    if (roll === 9) return { specific: "Tumba de um antigo Rei", name: "Sepulcro Real" };
    if (roll === 10) return { specific: "Estrutura soterrada/inundada", name: "Estrutura Submersa" };
    if (roll === 11) return { specific: "Ilha amaldiçoada", name: "Ilha Maldita" };
    if (roll <= 14) return { specific: "Masmorra", name: "Masmorra Profunda" };
    if (roll === 15) return { specific: "Encontradas em um distrito específico", name: "Ruínas Urbanas" };
    if (roll <= 17) return { specific: "Templo em ruínas", name: "Templo Abandonado" };
    if (roll === 18) return { specific: "Prisão ou cativeiro antigo", name: "Cárcere Antigo" };
    if (roll === 19) return { specific: "Cidade subterrânea perdida", name: "Cidade Subterrânea" };
    return { specific: "Múltiplas ruínas", name: "Complexo de Ruínas" };
  }

  private static generateRegiaoSelvagemSpec(roll: number): { specific: string; name: string } {
    if (roll === 1) return { specific: "Floresta/bosque", name: "Floresta Densa" };
    if (roll === 2) return { specific: "Deserto escaldante", name: "Deserto Árido" };
    if (roll === 3) return { specific: "Pântano viscoso", name: "Pântano Perigoso" };
    if (roll === 4) return { specific: "Complexo de cavernas", name: "Cavernas Selvagens" };
    if (roll === 5) return { specific: "Tundra esquecida", name: "Tundra Gelada" };
    if (roll === 6) return { specific: "Montanhas sinuosas", name: "Cordilheira" };
    if (roll === 7) return { specific: "Savana/descampado/pradaria", name: "Planícies Abertas" };
    if (roll === 8) return { specific: "Desfiladeiro/ravina mortal", name: "Desfiladeiro" };
    if (roll === 9) return { specific: "Região vulcânica", name: "Terras Vulcânicas" };
    if (roll === 10) return { specific: "Cânions profundos", name: "Cânions" };
    if (roll === 11) return { specific: "Região costeira perigosa", name: "Costa Selvagem" };
    if (roll === 12) return { specific: "Platô isolado", name: "Platô Remoto" };
    if (roll === 13) return { specific: "Estepe gelada", name: "Estepe Congelada" };
    if (roll === 14) return { specific: "Selva densa e hostil", name: "Selva Perigosa" };
    if (roll === 15) return { specific: "Território de geysers e fontes termais", name: "Campos Geotérmicos" };
    if (roll === 16) return { specific: "Planície alagada", name: "Terras Alagadas" };
    if (roll === 17) return { specific: "Penhasco gélido", name: "Penhascos Gelados" };
    if (roll === 18) return { specific: "Oásis oculto", name: "Oásis Secreto" };
    if (roll === 19) return { specific: "Colinas traiçoeiras", name: "Colinas Perigosas" };
    return { specific: "Múltiplas regiões selvagens", name: "Territórios Selvagens" };
  }

  private static generateLugarIsoladoSpec(roll: number): { specific: string; name: string } {
    if (roll === 1) return { specific: "Região não mapeada ou inexplorada", name: "Terra Desconhecida" };
    if (roll === 2) return { specific: "Monastério", name: "Monastério Isolado" };
    if (roll === 3) return { specific: "Fortaleza distante", name: "Forte Remoto" };
    if (roll === 4) return { specific: "Torre de um arcanista", name: "Torre do Mago" };
    if (roll === 5) return { specific: "Floresta densa", name: "Mata Fechada" };
    if (roll === 6) return { specific: "Covil de uma criatura rara", name: "Covil da Criatura" };
    if (roll === 7) return { specific: "Ilha exótica", name: "Ilha Misteriosa" };
    if (roll === 8) return { specific: "Posto avançado em zona de conflito", name: "Posto de Guerra" };
    if (roll === 9) return { specific: "Engenhoca monumental", name: "Máquina Antiga" };
    if (roll === 10) return { specific: "Masmorra inóspita", name: "Masmorra Perigosa" };
    if (roll === 11) return { specific: "Vale oculto entre montanhas", name: "Vale Secreto" };
    if (roll === 12) return { specific: "Caverna de difícil acesso", name: "Gruta Inacessível" };
    if (roll === 13) return { specific: "Refúgio subterrâneo", name: "Abrigo Subterrâneo" };
    if (roll === 14) return { specific: "Pico nevado isolado", name: "Pico Isolado" };
    if (roll === 15) return { specific: "Penhasco ou abismo remoto", name: "Abismo Remoto" };
    if (roll === 16) return { specific: "Minas desativadas", name: "Minas Abandonadas" };
    if (roll === 17) return { specific: "Poço profundo no deserto", name: "Poço do Deserto" };
    if (roll === 18) return { specific: "Vila eremita ou de exilados", name: "Vila dos Exilados" };
    if (roll === 19) return { specific: "Santuário natural protegido", name: "Santuário Natural" };
    return { specific: "Múltiplos locais isolados", name: "Locais Remotos" };
  }

  private static generateZonaRuralSpec(roll: number): { specific: string; name: string } {
    if (roll <= 2) return { specific: "Pequena aldeia", name: "Aldeia Rural" };
    if (roll === 3) return { specific: "Vilarejo desprotegido", name: "Vila Indefesa" };
    if (roll === 4) return { specific: "Grande plantação/vinhedo", name: "Plantação" };
    if (roll === 5) return { specific: "Lugarejo", name: "Lugarejo Simples" };
    if (roll === 6) return { specific: "Povoado humilde", name: "Povoado Pobre" };
    if (roll === 7) return { specific: "Fazenda", name: "Fazenda Rural" };
    if (roll === 8) return { specific: "Comunidade itinerante", name: "Acampamento Nômade" };
    if (roll === 9) return { specific: "Celeiro/moinho/estábulo", name: "Instalação Agrícola" };
    if (roll === 10) return { specific: "Criadouro/abatedouro", name: "Criação de Animais" };
    if (roll === 11) return { specific: "Pousada isolada", name: "Estalagem Rural" };
    if (roll === 12) return { specific: "Campo de cultivo", name: "Campos de Plantio" };
    if (roll === 13) return { specific: "Mercado rural", name: "Feira Rural" };
    if (roll === 14) return { specific: "Capela ou santuário na natureza", name: "Capela Rural" };
    if (roll === 15) return { specific: "Escola ou posto em um campo", name: "Posto Rural" };
    if (roll === 16) return { specific: "Oficina rural", name: "Oficina do Campo" };
    if (roll === 17) return { specific: "Armazém de grãos", name: "Celeiro de Grãos" };
    if (roll === 18) return { specific: "Área de pastagem", name: "Pastagens" };
    return { specific: "Múltiplas áreas rurais", name: "Região Rural" };
  }

  private static generateLocalidadeExoticaSpec(roll: number): { specific: string; name: string } {
    if (roll <= 2) return { specific: "Plano feérico", name: "Reino das Fadas" };
    if (roll === 3) return { specific: "Dentro de um objeto pequeno", name: "Espaço Extradimensional" };
    if (roll <= 6) return { specific: "Floresta mágica", name: "Floresta Encantada" };
    if (roll === 7) return { specific: "Plano elemental", name: "Plano Elemental" };
    if (roll === 8) return { specific: "Dentro de uma criatura", name: "Interior de Criatura" };
    if (roll <= 10) return { specific: "Pirâmide/zigurate", name: "Pirâmide Antiga" };
    if (roll === 11) return { specific: "Assentamento submarino", name: "Cidade Submarina" };
    if (roll === 12) return { specific: "Plano astral", name: "Plano Astral" };
    if (roll === 13) return { specific: "Abismo ou Inferno", name: "Planos Infernais" };
    if (roll === 14) return { specific: "Umbra", name: "Plano Sombrio" };
    if (roll === 15) return { specific: "Labirinto dimensional", name: "Labirinto Planar" };
    if (roll === 16) return { specific: "Cidade voadora", name: "Cidade Flutuante" };
    if (roll === 17) return { specific: "Ilha flutuante", name: "Ilha Voadora" };
    if (roll === 18) return { specific: "Biblioteca infinita", name: "Biblioteca Eterna" };
    if (roll === 19) return { specific: "Santuário cristalino", name: "Templo de Cristal" };
    return { specific: "Múltiplas localidades exóticas", name: "Locais Mágicos" };
  }

  private static generateProfundezasSpec(roll: number): { specific: string; name: string } {
    if (roll === 1) return { specific: "Complexo de cavernas", name: "Cavernas Profundas" };
    if (roll === 2) return { specific: "Despenhadeiro", name: "Abismo Rochoso" };
    if (roll === 3) return { specific: "Ravina subterrânea", name: "Fenda Subterrânea" };
    if (roll === 4) return { specific: "Fossa abissal", name: "Poço Abissal" };
    if (roll <= 6) return { specific: "Tumba esquecida", name: "Sepulcro Antigo" };
    if (roll <= 8) return { specific: "Cripta", name: "Cripta Subterrânea" };
    if (roll <= 10) return { specific: "Assentamento de humanoides", name: "Cidade das Profundezas" };
    if (roll === 11) return { specific: "Fenda submarina", name: "Abismo Submarino" };
    if (roll === 12) return { specific: "Cemitério de monstruosidades", name: "Cemitério dos Monstros" };
    if (roll === 13) return { specific: "Labirinto", name: "Labirinto Subterrâneo" };
    if (roll <= 15) return { specific: "Mina abandonada", name: "Minas Profundas" };
    if (roll === 16) return { specific: "Sistema de túneis", name: "Rede de Túneis" };
    if (roll === 17) return { specific: "Gruta submersa", name: "Caverna Inundada" };
    if (roll === 18) return { specific: "Câmaras secretas", name: "Câmaras Ocultas" };
    if (roll === 19) return { specific: "Prisão subterrânea", name: "Calabouço Profundo" };
    return { specific: "Múltiplas profundezas", name: "Complexo Subterrâneo" };
  }

  private static generateTerrasMorbidasSpec(roll: number): { specific: string; name: string } {
    if (roll === 1) return { specific: "Cemitério esquecido", name: "Necrópole Abandonada" };
    if (roll === 2) return { specific: "Catacumbas", name: "Catacumbas Antigas" };
    if (roll === 3) return { specific: "Templo profanado", name: "Templo Corrompido" };
    if (roll === 4) return { specific: "Campo de batalha devastado", name: "Campo de Guerra" };
    if (roll === 5) return { specific: "Zona morta", name: "Terras Mortas" };
    if (roll === 6) return { specific: "Vales rúnicos", name: "Vale das Runas" };
    if (roll === 7) return { specific: "Assentamento próximo", name: "Vila Amaldiçoada" };
    if (roll === 8) return { specific: "Ruína maldita", name: "Ruínas Malditas" };
    if (roll === 9) return { specific: "Covil monstruoso", name: "Covil do Horror" };
    if (roll === 10) return { specific: "Pântano sombrio", name: "Charco Sombrio" };
    if (roll === 11) return { specific: "Terra amaldiçoada", name: "Solo Amaldiçoado" };
    if (roll === 12) return { specific: "Floresta necrótica", name: "Mata Morta" };
    if (roll === 13) return { specific: "Deserto de ossos", name: "Deserto Ósseo" };
    if (roll === 14) return { specific: "Lago venenoso", name: "Lago Tóxico" };
    if (roll === 15) return { specific: "Montanha assombrada", name: "Monte Assombrado" };
    if (roll === 16) return { specific: "Cidade fantasma", name: "Cidade Espectral" };
    if (roll === 17) return { specific: "Bosque corrompido", name: "Bosque Corrompido" };
    if (roll <= 19) return { specific: "Floresta assombrada", name: "Floresta dos Mortos" };
    return { specific: "Múltiplas terras mórbidas", name: "Região Amaldiçoada" };
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
