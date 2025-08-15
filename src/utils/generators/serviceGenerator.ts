import { z } from "zod";
import type {
  Service,
  ServiceContractorType,
  ServiceDeadlineType,
  ServicePaymentType,
  ServiceValue,
} from "@/types/service";
import {
  ServiceStatus as ServiceStatusEnum,
  ServiceContractorType as ContractorTypeEnum,
  ServiceDeadlineType as DeadlineTypeEnum,
  ServiceComplexity as ComplexityEnum,
  ServiceDifficulty as DifficultyEnum,
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

      // ETAPA 2: Aplicar reduções por frequentadores (se habilitado)
      let finalQuantity = baseQuantity;
      let reductionApplied = 0;

      if (config.applyReductions !== false) {
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

    // Passo 2: Rolar os dados da quantidade
    const quantityDiceResult = rollDice({
      notation: quantityTableResult.result.quantity,
    });

    // Passo 3: Aplicar modificador de funcionários ao resultado final
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
   * Implementa geração básica
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

    // CRIAÇÃO DO SERVIÇO
    const service: Service = {
      id: serviceId,
      title: `Serviço ${config.serviceIndex + 1}`,
      description: `Serviço gerado para ${contractor.type}`,
      status: ServiceStatusEnum.DISPONIVEL,
      complexity: ComplexityEnum.SIMPLES,
      difficulty: DifficultyEnum.MUITO_FACIL,
      contractorType: contractor.type,
      contractorName: contractor.name,
      value,
      deadline,
      paymentType: paymentType.type,
      createdAt: config.currentDate,
      isActive: false,
      isExpired: false,
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

    // Determinar tipo baseado no texto
    const type = deadlineText.includes("semana")
      ? DeadlineTypeEnum.SEMANAS
      : DeadlineTypeEnum.DIAS;

    return {
      type,
      value: deadlineText,
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
   * Gera valor básico do serviço
   * TODO: Implementação completa será na Issue 5.20-5.21
   */
  private static generateBasicValue(guild: Guild): ServiceValue {
    // Implementação básica temporária
    const baseReward = rollDice({ notation: "1d6" });

    return {
      rewardRoll: "1d6 C$",
      rewardAmount: baseReward.result,
      currency: "C$",
      recurrenceBonus: "+0,5 C$",
      recurrenceBonusAmount: 0.5,
      difficulty: DifficultyEnum.MUITO_FACIL,
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

  // ===== MÉTODOS PRIVADOS DE APOIO =====

  /**
   * Gera um ID único para o serviço
   * Usa a mesma abordagem do generateGuildId para consistência
   */
  private static generateServiceId(): string {
    return `service_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}
