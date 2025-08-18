import { z } from "zod";
import type {
  Service,
  ServiceContractorType,
  ServiceDeadlineType,
  ServicePaymentType,
  ServiceValue,
  ServiceObjective,
  ServiceComplication,
  ServiceRival,
  ServiceOrigin,
} from "@/types/service";
import {
  ServiceStatus as ServiceStatusEnum,
  ServiceContractorType as ContractorTypeEnum,
  ServiceDeadlineType as DeadlineTypeEnum,
  ServiceComplexity,
  ServiceObjectiveType,
  ServiceComplicationType,
  ServiceComplicationConsequence,
  ServiceRivalAction,
  ServiceRivalMotivation,
  ServiceOriginCause,
  ServiceAdditionalComplicator,
} from "@/types/service";
import type { Guild, RelationLevel } from "@/types/guild";
import type { GameDate } from "@/types/timeline";
import type { RollModifier } from "@/types/tables";
import { rollOnTable } from "@/utils/tableRoller";
import { rollDice } from "@/utils/dice";
import {
  SERVICE_QUANTITY_TABLE,
  SERVICE_VISITOR_REDUCTION_TABLE,
  SERVICE_DEADLINE_TABLE,
  SERVICE_PAYMENT_TYPE_TABLE,
  getServiceDiceBySize,
  getVisitorReductionIndex,
} from "@/data/tables/service-base-tables";
import {
  SERVICE_CONTRACTOR_TABLE,
  SERVICE_GOVERNMENT_CONTRACTOR_TABLE,
  SERVICE_POPULATION_RELATION_MODIFIERS,
  SERVICE_GOVERNMENT_RELATION_MODIFIERS,
  type PopulationRelationLevel,
  type GovernmentRelationLevel,
} from "@/data/tables/service-contractor-tables";
import {
  SERVICE_OBJECTIVE_TYPE_TABLE,
  generateServiceObjective,
  generateEnhancedServiceObjective,
} from "@/data/tables/service-objective-tables";
import { SERVICE_NARRATIVE_TABLES } from "@/data/tables/service-narrative-tables";
import {
  SERVICE_DIFFICULTY_TABLE,
  SERVICE_COMPLEXITY_TABLE,
  createServiceTestStructure,
} from "@/data/tables/service-difficulty-tables";

// ===== INTERFACES DE CONFIGURAÇÃO =====

/**
 * Configuração para geração de serviços
 */
export interface ServiceGenerationConfig {
  guild: Guild;
  currentDate: GameDate;
  quantity?: number; // Se não fornecido, será calculado
  applyReductions?: boolean; // Aplicar reduções por frequentadores
}

/**
 * Resultado da geração de serviços
 * Inclui informações sobre processo e validações
 */
export interface ServiceGenerationResult {
  services: Service[];
  metadata: {
    baseQuantity: number;
    finalQuantity: number;
    reductionApplied: number;
    guildSize: string;
    staffModifier: number;
    generatedAt: GameDate;
    notes: string[];
  };
}

/**
 * Configuração interna para um serviço individual
 */
interface IndividualServiceConfig {
  guild: Guild;
  currentDate: GameDate;
  serviceIndex: number;
  totalServices: number;
}

// ===== VALIDAÇÃO ZOD SIMPLIFICADA =====

const ServiceGenerationConfigSchema = z.object({
  guild: z.any().refine((guild) => guild && guild.id, {
    message: "Guild deve ser um objeto válido com ID",
  }),
  currentDate: z.object({
    day: z.number().min(1).max(31),
    month: z.number().min(1).max(12),
    year: z.number().min(1),
  }),
  quantity: z.number().int().min(0).optional(),
  applyReductions: z.boolean().optional().default(true),
});

// ===== CLASSE PRINCIPAL DO GERADOR =====

export class ServiceGenerator {
  /**
   * Gera serviços baseados na configuração da guilda
   */
  static generateServices(
    config: ServiceGenerationConfig
  ): ServiceGenerationResult {
    // Validação básica da configuração
    try {
      ServiceGenerationConfigSchema.parse(config);
    } catch (error) {
      throw new Error(
        `Configuração inválida: ${error instanceof Error ? error.message : "Erro desconhecido"}`
      );
    }

    try {
      // ETAPA 1: Determinar quantidade base de serviços
      const baseQuantity = this.calculateBaseQuantity(config);

      // ETAPA 2: Aplicar reduções por frequentadores (apenas se quantidade não foi especificada manualmente)
      let finalQuantity = baseQuantity;
      let reductionApplied = 0;

      if (config.applyReductions !== false && config.quantity === undefined) {
        const reduction = this.calculateVisitorReduction(config.guild);
        reductionApplied = reduction;
        finalQuantity = Math.max(0, baseQuantity - reduction);
      }

      // ETAPA 3: Gerar serviços individuais
      const services: Service[] = [];
      const notes: string[] = [];

      for (let i = 0; i < finalQuantity; i++) {
        const serviceConfig: IndividualServiceConfig = {
          guild: config.guild,
          currentDate: config.currentDate,
          serviceIndex: i,
          totalServices: finalQuantity,
        };

        try {
          const service = this.generateIndividualService(serviceConfig);
          services.push(service);
        } catch (error) {
          notes.push(
            `Erro ao gerar serviço ${i + 1}: ${error instanceof Error ? error.message : "Erro desconhecido"}`
          );
        }
      }

      // ETAPA 4: Metadados e informações da geração
      const staffModifier = this.getStaffModifier(config.guild);

      if (reductionApplied > 0) {
        notes.push(
          `Redução de ${reductionApplied} serviços aplicada por frequentadores (${config.guild.visitors.frequency})`
        );
      }

      if (reductionApplied > baseQuantity) {
        notes.push(
          "AVISO: Redução foi maior que quantidade base. Aplicar redução aos próximos serviços conforme regra do .md"
        );
      }

      return {
        services,
        metadata: {
          baseQuantity,
          finalQuantity,
          reductionApplied,
          guildSize: config.guild.structure.size,
          staffModifier,
          generatedAt: config.currentDate,
          notes,
        },
      };
    } catch (error) {
      throw new Error(
        `Falha na geração de serviços: ${error instanceof Error ? error.message : "Erro desconhecido"}`
      );
    }
  }

  /**
   * Calcula quantidade base de serviços
   * Baseado em: "Dados por Tamanho da Sede" + "Quantidade Disponível" + "Modificadores por Condição"
   */
  private static calculateBaseQuantity(
    config: ServiceGenerationConfig
  ): number {
    if (config.quantity !== undefined && config.quantity >= 0) {
      return config.quantity;
    }

    // Passo 1: Rolar na tabela de quantidade disponível (1d20)
    const quantityTableResult = rollOnTable(SERVICE_QUANTITY_TABLE);

    // Passo 2: Extrair apenas a notação de dados da string
    const quantityString = quantityTableResult.result.quantity;
    const diceNotationMatch = quantityString.match(/(\d+d\d+(?:[+-]\d+)?)/);

    if (!diceNotationMatch) {
      throw new Error(
        `Formato de dados inválido na tabela de quantidade: ${quantityString}`
      );
    }

    const diceNotation = diceNotationMatch[1];

    // Passo 3: Rolar os dados da quantidade
    const quantityDiceResult = rollDice({
      notation: diceNotation,
    });

    // Passo 4: Aplicar modificador de funcionários ao resultado final
    const finalQuantity = Math.max(
      0,
      quantityDiceResult.result + this.getStaffModifier(config.guild)
    );

    return finalQuantity;
  }

  /**
   * Calcula redução por frequentadores
   * Baseado em: "Redução por Frequentadores"
   */
  private static calculateVisitorReduction(guild: Guild): number {
    // Mapear frequentadores para índice da tabela
    const visitorIndex = getVisitorReductionIndex(guild.visitors.frequency);

    // Obter entrada da tabela de redução
    const reductionEntry = SERVICE_VISITOR_REDUCTION_TABLE.find(
      (entry) => entry.min <= visitorIndex && entry.max >= visitorIndex
    );

    if (!reductionEntry) {
      return 0; // Fallback seguro
    }

    // Se não há redução (Vazia), retornar 0
    if (reductionEntry.result.reduction.includes("disponíveis")) {
      return 0;
    }

    // Extrair e calcular redução
    const reductionText = reductionEntry.result.reduction;

    if (reductionText === "-1 serviço") {
      return 1;
    }

    // Para dados (ex: "-1d4 serviços", "-2d4+2 serviços")
    const diceMatch = reductionText.match(/-(\d+d\d+(?:[+-]\d+)?)/);
    if (diceMatch) {
      const diceNotation = diceMatch[1];
      const rollResult = rollDice({ notation: diceNotation });
      return rollResult.result;
    }

    return 0;
  }

  /**
   * Obtém modificador de funcionários
   * Baseado em: "Modificadores por Condição"
   */
  private static getStaffModifier(guild: Guild): number {
    const staffDescription = guild.staff.description || "";

    if (staffDescription.toLowerCase().includes("despreparados")) {
      return -1;
    }

    if (staffDescription.toLowerCase().includes("experientes")) {
      return 1;
    }

    return 0;
  }

  /**
   * Gera um serviço individual
   */
  private static generateIndividualService(
    config: IndividualServiceConfig
  ): Service {
    const serviceId = this.generateServiceId();

    // GERAÇÃO DE CONTRATANTE
    const contractor = this.generateContractor(config.guild);

    // GERAÇÃO DE PRAZO
    const deadline = this.generateDeadline();

    // GERAÇÃO DE TIPO DE PAGAMENTO
    const paymentType = this.generatePaymentType();

    // VALORES E RECOMPENSAS
    const value = this.generateBasicValue(config.guild);

    // GERAÇÃO DE COMPLEXIDADE
    const complexity = this.generateServiceComplexity();

    // GERAÇÃO DE ESTRUTURA DE TESTES
    const testStructure = createServiceTestStructure(
      complexity,
      value.difficulty
    );

    // GERAÇÃO DE CONTEÚDO NARRATIVO
    const objective = this.generateServiceObjective();
    const complication = this.generateComplication();
    const rival = this.generateRival();
    const origin = this.generateOrigin();

    // CRIAÇÃO DO SERVIÇO
    const service: Service = {
      id: serviceId,
      title: "",
      description: this.generateServiceDescription(objective),
      status: ServiceStatusEnum.DISPONIVEL,
      complexity: complexity,
      difficulty: value.difficulty,
      testStructure,
      contractorType: contractor.type,
      contractorName: contractor.name,
      value,
      deadline,
      paymentType: paymentType.type,
      createdAt: config.currentDate,
      isActive: false,
      isExpired: false,
      // Novos campos narrativos
      objective,
      complication,
      rival,
      origin,
    };

    return service;
  }

  /**
   * Gera contratante do serviço
   * Baseado em: "Contratante do Serviço" + "Modificadores de Relação"
   */
  private static generateContractor(guild: Guild): {
    type: ServiceContractorType;
    name?: string;
  } {
    // Gerar modificadores baseados nas relações da guilda
    const populationModifier = this.getPopulationRelationModifier(
      guild.relations.population
    );
    const governmentModifier = this.getGovernmentRelationModifier(
      guild.relations.government
    );

    const modifiers: RollModifier[] = [
      { name: "Relação População", value: populationModifier },
      { name: "Relação Governo", value: governmentModifier },
    ];

    // Rolar na tabela de contratantes com modificadores
    const contractorResult = rollOnTable(SERVICE_CONTRACTOR_TABLE, modifiers);
    const contractorType = contractorResult.result;

    // Se for governo, rolar contratante específico
    let contractorName: string | undefined;
    if (contractorType === ContractorTypeEnum.GOVERNO) {
      const specificGovernmentResult = rollOnTable(
        SERVICE_GOVERNMENT_CONTRACTOR_TABLE
      );
      contractorName = specificGovernmentResult.result;
    }

    return {
      type: contractorType,
      name: contractorName,
    };
  }

  /**
   * Gera prazo do serviço
   * Baseado em: "Prazo para Conclusão"
   * NOTA: "Os prazos de conclusão não usam os dados por tipo de assentamento"
   */
  private static generateDeadline(): {
    type: ServiceDeadlineType;
    value?: string;
  } {
    const deadlineResult = rollOnTable(SERVICE_DEADLINE_TABLE);
    const deadlineText = deadlineResult.result.deadline;

    if (deadlineText === "Sem prazo") {
      return {
        type: DeadlineTypeEnum.SEM_PRAZO,
      };
    }

    // Processar dados se houver notação de dados
    let processedValue = deadlineText;

    // Verificar se tem notação de dados (ex: "1d4 dias", "1d6+1 dias")
    const diceMatch = deadlineText.match(/(\d+d\d+(?:[+-]\d+)?)/);
    if (diceMatch) {
      try {
        const rollResult = rollDice({ notation: diceMatch[1] });
        // Substituir a notação pelo resultado
        processedValue = deadlineText.replace(
          diceMatch[1],
          rollResult.result.toString()
        );
      } catch {
        // Em caso de erro, manter o texto original
        processedValue = deadlineText;
      }
    }

    // Determinar tipo baseado no texto
    const type = deadlineText.includes("semana")
      ? DeadlineTypeEnum.SEMANAS
      : DeadlineTypeEnum.DIAS;

    return {
      type,
      value: processedValue,
    };
  }

  /**
   * Gera tipo de pagamento
   * Baseado em: "Tipo de Pagamento"
   */
  private static generatePaymentType(): { type: ServicePaymentType } {
    const paymentResult = rollOnTable(SERVICE_PAYMENT_TYPE_TABLE);
    return {
      type: paymentResult.result.type,
    };
  }

  /**
   * Gera valor completo do serviço com dificuldade e complexidade
   * Baseado nas tabelas "Dificuldade e Recompensas" e "Nível de Complexidade"
   */
  private static generateBasicValue(guild: Guild): ServiceValue {
    // ETAPA 1: Gerar dificuldade e recompensa (1d20)
    const difficultyResult = rollOnTable(SERVICE_DIFFICULTY_TABLE);
    const difficulty = difficultyResult.result.difficulty;
    const rewardRoll = difficultyResult.result.baseReward;
    const recurrenceBonus = difficultyResult.result.recurrence;

    // ETAPA 2: Calcular recompensa atual
    let rewardAmount = 0;
    try {
      // PRIMEIRO: Para recompensas multiplicadas com parênteses como "(1d4+1)*10 C$"
      const multiplierWithParentheses = rewardRoll.match(
        /\((\d+d\d+(?:[+-]\d+)?)\)\*(\d+)/
      );
      if (multiplierWithParentheses) {
        const baseRoll = rollDice({ notation: multiplierWithParentheses[1] });
        const multiplier = parseInt(multiplierWithParentheses[2]);
        rewardAmount = baseRoll.result * multiplier;
      } else {
        // SEGUNDO: Para recompensas multiplicadas sem parênteses como "4d8*10 C$"
        const multiplierWithoutParentheses = rewardRoll.match(
          /(\d+d\d+(?:[+-]\d+)?)\*(\d+)/
        );
        if (multiplierWithoutParentheses) {
          const baseRoll = rollDice({
            notation: multiplierWithoutParentheses[1],
          });
          const multiplier = parseInt(multiplierWithoutParentheses[2]);
          rewardAmount = baseRoll.result * multiplier;
        } else {
          // TERCEIRO: Para recompensas normais como "1d6 C$" ou "3d4 C$"
          const diceMatch = rewardRoll.match(/(\d+d\d+(?:[+-]\d+)?)/);
          if (diceMatch) {
            const rollResult = rollDice({ notation: diceMatch[1] });
            rewardAmount = rollResult.result;
          } else {
            // Fallback para casos não cobertos
            rewardAmount = 5;
          }
        }
      }
    } catch {
      rewardAmount = 5; // Fallback seguro
    }

    // ETAPA 3: Calcular valor de recorrência
    let recurrenceBonusAmount = 0;
    try {
      const bonusMatch = recurrenceBonus.match(/\+([0-9,]+)\s*C\$/);
      if (bonusMatch) {
        recurrenceBonusAmount = parseFloat(bonusMatch[1].replace(",", "."));
      }
    } catch {
      recurrenceBonusAmount = 0.5; // Fallback
    }

    // ETAPA 4: Determinar moeda
    const currency = rewardRoll.includes("PO$") ? "PO$" : "C$";

    return {
      rewardRoll,
      rewardAmount,
      currency,
      recurrenceBonus,
      recurrenceBonusAmount,
      difficulty,
      modifiers: {
        populationRelation: this.getPopulationRelationModifier(
          guild.relations.population
        ),
        governmentRelation: this.getGovernmentRelationModifier(
          guild.relations.government
        ),
        staffCondition: this.getStaffModifier(guild),
      },
    };
  }

  /**
   * Obtém modificador de relação com população
   * Baseado em: "Modificadores de Relação" - "Relação com a população local"
   */
  private static getPopulationRelationModifier(
    relation: RelationLevel
  ): number {
    const relationMap: Record<string, PopulationRelationLevel> = {
      Péssima: "péssima" as PopulationRelationLevel,
      Ruim: "ruim" as PopulationRelationLevel,
      Dividida: "dividida" as PopulationRelationLevel,
      Boa: "boa" as PopulationRelationLevel,
      "Muito boa": "muito boa" as PopulationRelationLevel,
      Excelente: "excelente" as PopulationRelationLevel,
    };

    const mappedRelation = relationMap[relation];
    return SERVICE_POPULATION_RELATION_MODIFIERS[mappedRelation] || 0;
  }

  /**
   * Obtém modificador de relação com governo
   * Baseado em: "Modificadores de Relação" - "Relação com o governo local"
   */
  private static getGovernmentRelationModifier(
    relation: RelationLevel
  ): number {
    const relationMap: Record<string, GovernmentRelationLevel> = {
      Péssima: "péssima" as GovernmentRelationLevel,
      Ruim: "ruim" as GovernmentRelationLevel,
      Diplomática: "diplomática" as GovernmentRelationLevel,
      Boa: "boa" as GovernmentRelationLevel,
      "Muito boa": "muito boa" as GovernmentRelationLevel,
      Excelente: "excelente" as GovernmentRelationLevel,
    };

    const mappedRelation = relationMap[relation];
    return SERVICE_GOVERNMENT_RELATION_MODIFIERS[mappedRelation] || 0;
  }

  // ===== MÉTODOS UTILITÁRIOS ESTÁTICOS =====

  /**
   * Valida se uma guilda pode gerar serviços
   * Similar à validação de contratos
   */
  static canGenerateServices(guild: Guild): boolean {
    return !!(
      guild.id &&
      guild.structure &&
      guild.staff &&
      guild.visitors &&
      guild.relations
    );
  }

  /**
   * Calcula quantidade estimada de serviços sem gerar
   * Útil para preview e validações
   */
  static estimateServiceQuantity(guild: Guild): {
    min: number;
    max: number;
    average: number;
  } {
    try {
      const guildSizeDice = getServiceDiceBySize(guild.structure.size);
      const staffModifier = this.getStaffModifier(guild);

      // Estimativa baseada nos dados da sede
      const diceResult = rollDice({ notation: guildSizeDice });
      const baseEstimate = diceResult.result + staffModifier;

      // Estimativa de redução por frequentadores
      const reductionEstimate = this.calculateVisitorReduction(guild);

      const min = Math.max(0, baseEstimate - reductionEstimate - 3); // Margem conservadora
      const max = baseEstimate + 5; // Margem otimista
      const average = Math.round((min + max) / 2);

      return { min, max, average };
    } catch {
      return { min: 1, max: 4, average: 2 }; // Fallback seguro
    }
  }

  // ===== GERAÇÃO DE CONTEÚDO NARRATIVO =====

  /**
   * Gera complexidade do serviço
   * Baseado na tabela "Nível de Complexidade"
   */
  private static generateServiceComplexity(): ServiceComplexity {
    const complexityResult = rollOnTable(SERVICE_COMPLEXITY_TABLE);
    return complexityResult.result.complexity;
  }

  /**
   * Gera objetivo do serviço com sistema de três colunas
   * Baseado nas tabelas de objetivos específicas
   */
  private static generateServiceObjective(): ServiceObjective {
    // Primeiro, determinar o tipo de objetivo (1d20)
    const objectiveResult = rollOnTable(SERVICE_OBJECTIVE_TYPE_TABLE);

    if (objectiveResult.result.hasMultiple) {
      // Resultado 20: Role duas vezes e use ambos
      const enhanced = generateEnhancedServiceObjective(
        objectiveResult.result.type
      );
      return enhanced || this.createFallbackObjective();
    } else {
      // Gerar objetivo simples
      const objective = generateServiceObjective(objectiveResult.result.type);
      return objective || this.createFallbackObjective();
    }
  }

  /**
   * Gera complicação para o serviço (sistema de chances)
   * Baseado nas tabelas de complicações
   */
  private static generateComplication(): ServiceComplication | undefined {
    // Verificar se há complicação usando tabela de chances
    const chanceResult = rollOnTable(
      SERVICE_NARRATIVE_TABLES.complicationChance
    );

    if (chanceResult.result.hasComplication) {
      // Gerar tipo de complicação
      const typeResult = rollOnTable(SERVICE_NARRATIVE_TABLES.complicationType);

      // Gerar consequência da complicação
      const consequenceResult = rollOnTable(
        SERVICE_NARRATIVE_TABLES.complicationConsequence
      );

      // Mapear descriptions para enums (implementação robusta)
      const type = this.mapDescriptionToComplicationType(
        typeResult.result.description
      );
      const consequence = this.mapDescriptionToComplicationConsequence(
        consequenceResult.result.description
      );

      return {
        type,
        consequence,
        description: `${typeResult.result.description}: ${consequenceResult.result.description}`,
      };
    }

    return undefined;
  }

  /**
   * Gera rival para o serviço (sistema de chances)
   * Baseado nas tabelas de rivais
   */
  private static generateRival(): ServiceRival | undefined {
    // Verificar se há rival usando tabela de chances
    const chanceResult = rollOnTable(SERVICE_NARRATIVE_TABLES.rivalChance);

    if (chanceResult.result.hasRival) {
      const actionResult = rollOnTable(SERVICE_NARRATIVE_TABLES.rivalAction);
      const motivationResult = rollOnTable(
        SERVICE_NARRATIVE_TABLES.rivalMotivation
      );

      // Mapear descriptions para enums
      const action = this.mapDescriptionToRivalAction(
        actionResult.result.description
      );
      const motivation = this.mapDescriptionToRivalMotivation(
        motivationResult.result.description
      );

      return {
        action,
        motivation,
        description: `${actionResult.result.description} - ${motivationResult.result.description}`,
      };
    }

    return undefined;
  }

  /**
   * Gera origem do problema do serviço
   * Baseado na tabela "A Raiz do Problema"
   */
  private static generateOrigin(): ServiceOrigin {
    const originResult = rollOnTable(SERVICE_NARRATIVE_TABLES.origin);
    const complicatorResult = rollOnTable(
      SERVICE_NARRATIVE_TABLES.additionalComplicator
    );

    // Mapear descriptions para enums
    const rootCause = this.mapDescriptionToOriginCause(
      originResult.result.description
    );
    const additionalComplicator = this.mapDescriptionToAdditionalComplicator(
      complicatorResult.result.description
    );

    return {
      rootCause,
      additionalComplicator,
      description: `${originResult.result.description} + ${complicatorResult.result.description}`,
    };
  }

  /**
   * Cria um objetivo fallback caso as funções das tabelas falhem
   */
  private static createFallbackObjective(): ServiceObjective {
    return {
      type: ServiceObjectiveType.AUXILIAR_OU_CUIDAR,
      description: "Auxiliar ou cuidar",
      action: "Auxiliar",
      target: "pessoa local",
      complication: "prazo é apertado",
    };
  }

  /**
   * Gera descrição narrativa completa do serviço
   */
  private static generateServiceDescription(
    objective: ServiceObjective
  ): string {
    // Usar o enum como base, com ajustes mínimos para casos especiais
    let mainVerb: string = objective.type;
    
    // Ajustes específicos apenas quando necessário
    if (objective.type === ServiceObjectiveType.EXTRAIR_RECURSOS) {
      mainVerb = "Extrair recursos de";
    } else if (objective.type === ServiceObjectiveType.SERVICOS_ESPECIFICOS) {
      mainVerb = "Executar";
    } else if (objective.type === ServiceObjectiveType.RELIGIOSO) {
      mainVerb = "Realizar";
    } else if (objective.type === ServiceObjectiveType.MULTIPLO) {
      mainVerb = "Executar";
    }
    
    // Determinar conectivo baseado no tipo de objetivo  
    let connector = "para";
    const objectiveTypeLower = objective.type.toLowerCase();
    
    // Usar "em" para contextos que indicam local/situação específicos
    if (objectiveTypeLower.includes("extrair") || 
        objectiveTypeLower.includes("construir") ||
        objectiveTypeLower.includes("religioso")) {
      connector = "em";
    }
    
    // Formatar componentes
    const action = objective.action.toLowerCase(); // O que do resultado da tabela
    const target = objective.target.toLowerCase(); // Para quem/onde
    
    // Construir descrição base
    let description = `${mainVerb} ${action} ${connector} ${target}`;
    
    // Adicionar complicação se houver
    if (objective.complication) {
      const complication = objective.complication.toLowerCase();
      description += `, mas ${complication}`;
    }

    return description;
  }

  // ===== MÉTODOS PRIVADOS DE APOIO =====

  /**
   * Mapeia descrição para enum utilizando os valores dos próprios enums
   * Solução elegante que elimina mapeamentos manuais propensos a erro
   */
  private static mapDescriptionToEnum<T extends Record<string, string>>(
    description: string,
    enumObj: T
  ): T[keyof T] {
    // Busca por valor exato primeiro
    const exactMatch = Object.values(enumObj).find(
      (value) => value === description
    );
    if (exactMatch) {
      return exactMatch as T[keyof T];
    }

    // Busca por correspondência parcial (case-insensitive)
    const partialMatch = Object.values(enumObj).find(
      (value) =>
        value.toLowerCase().includes(description.toLowerCase()) ||
        description.toLowerCase().includes(value.toLowerCase())
    );

    if (partialMatch) {
      return partialMatch as T[keyof T];
    }

    // Fallback para primeiro valor do enum
    return Object.values(enumObj)[0] as T[keyof T];
  }

  /**
   * Mapeia descrição para enum de tipo de complicação
   */
  private static mapDescriptionToComplicationType(
    description: string
  ): ServiceComplicationType {
    return this.mapDescriptionToEnum(
      description,
      ServiceComplicationType
    ) as ServiceComplicationType;
  }

  /**
   * Mapeia descrição para enum de consequência de complicação
   */
  private static mapDescriptionToComplicationConsequence(
    description: string
  ): ServiceComplicationConsequence {
    return this.mapDescriptionToEnum(
      description,
      ServiceComplicationConsequence
    ) as ServiceComplicationConsequence;
  }

  /**
   * Mapeia descrição para enum de ação de rival
   */
  private static mapDescriptionToRivalAction(
    description: string
  ): ServiceRivalAction {
    return this.mapDescriptionToEnum(
      description,
      ServiceRivalAction
    ) as ServiceRivalAction;
  }

  /**
   * Mapeia descrição para enum de motivação de rival
   */
  private static mapDescriptionToRivalMotivation(
    description: string
  ): ServiceRivalMotivation {
    return this.mapDescriptionToEnum(
      description,
      ServiceRivalMotivation
    ) as ServiceRivalMotivation;
  }

  /**
   * Mapeia descrição para enum de causa de origem
   */
  private static mapDescriptionToOriginCause(
    description: string
  ): ServiceOriginCause {
    return this.mapDescriptionToEnum(
      description,
      ServiceOriginCause
    ) as ServiceOriginCause;
  }

  /**
   * Mapeia descrição para enum de complicador adicional
   */
  private static mapDescriptionToAdditionalComplicator(
    description: string
  ): ServiceAdditionalComplicator {
    return this.mapDescriptionToEnum(
      description,
      ServiceAdditionalComplicator
    ) as ServiceAdditionalComplicator;
  }

  /**
   * Gera um ID único para o serviço
   * Formato: número aleatório de 4 dígitos
   */
  private static generateServiceId(): string {
    const fourDigitNumber = Math.floor(1000 + Math.random() * 9000);
    return fourDigitNumber.toString();
  }

  // ===== MÉTODOS PARA SISTEMA DE TESTES E RECOMPENSAS =====

  /**
   * Calcula recompensa final baseada na estrutura de testes
   * Aplica modificadores de outcome e taxa de recorrência
   *
   * @param service - Serviço com estrutura de testes
   * @param timesPreviouslyFailed - Quantas vezes o serviço falhou antes (para recorrência)
   * @returns Valor final da recompensa
   */
  public static calculateFinalReward(
    service: Service,
    timesPreviouslyFailed: number = 0
  ): number {
    let baseReward = service.value.rewardAmount;

    // Aplicar taxa de recorrência se o serviço falhou antes
    if (timesPreviouslyFailed > 0) {
      const recurrenceBonus =
        service.value.recurrenceBonusAmount * timesPreviouslyFailed;
      baseReward += recurrenceBonus;
    }

    // Se não há outcome (testes não concluídos), retornar base + recorrência
    if (!service.testStructure.outcome) {
      return Math.floor(baseReward);
    }

    // Aplicar modificador de recompensa do outcome
    let finalReward = baseReward * service.testStructure.outcome.rewardModifier;

    // Para trabalho primoroso (masterwork), role novamente e some
    if (service.testStructure.outcome.masterwork) {
      // Simular nova rolagem da recompensa base
      const bonusReward = this.rollServiceReward(service.value.rewardRoll);
      finalReward = baseReward + bonusReward;
    }

    return Math.floor(finalReward);
  }

  /**
   * Aplica taxa de recorrência a um serviço não resolvido
   * Conforme especificação "Taxa de recorrência"
   *
   * @param service - Serviço original
   * @param failureCount - Número de falhas consecutivas
   * @returns Serviço com valor atualizado
   */
  public static applyRecurrenceBonus(
    service: Service,
    failureCount: number
  ): Service {
    if (failureCount <= 0) return service;

    const totalBonus = service.value.recurrenceBonusAmount * failureCount;
    const updatedValue = {
      ...service.value,
      rewardAmount: service.value.rewardAmount + totalBonus,
    };

    return {
      ...service,
      value: updatedValue,
    };
  }

  /**
   * Rola recompensa de serviço usando notação de dados
   * Suporte para casos complexos como "(1d3+1)*10 C$"
   */
  private static rollServiceReward(rewardRoll: string): number {
    try {
      // PRIMEIRO: Para recompensas multiplicadas com parênteses como "(1d3+1)*10 C$"
      const multiplierWithParentheses = rewardRoll.match(
        /\((\d+d\d+(?:[+-]\d+)?)\)\*(\d+)/
      );
      if (multiplierWithParentheses) {
        const baseRoll = rollDice({ notation: multiplierWithParentheses[1] });
        const multiplier = parseInt(multiplierWithParentheses[2]);
        return baseRoll.result * multiplier;
      }

      // SEGUNDO: Para recompensas multiplicadas sem parênteses como "4d8*10 C$"
      const multiplierWithoutParentheses = rewardRoll.match(
        /(\d+d\d+(?:[+-]\d+)?)\*(\d+)/
      );
      if (multiplierWithoutParentheses) {
        const baseRoll = rollDice({
          notation: multiplierWithoutParentheses[1],
        });
        const multiplier = parseInt(multiplierWithoutParentheses[2]);
        return baseRoll.result * multiplier;
      }

      // TERCEIRO: Para recompensas simples como "3d4 C$" ou "2d4+1 PO$"
      const diceMatch = rewardRoll.match(/(\d+d\d+(?:[+-]\d+)?)/);
      if (diceMatch) {
        const rollResult = rollDice({ notation: diceMatch[1] });
        return rollResult.result;
      }

      // Fallback
      return 5;
    } catch {
      return 5; // Fallback seguro
    }
  }
}
