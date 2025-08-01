/**
 * Gerador principal da guilda - orquestra todos os sub-geradores
 * Implementa o fluxo completo de geração
 */

import type { Guild, SettlementType } from '@/types/guild';
import { generateRandomGuildName } from '@/data/guild-names';
import { 
  StructureGenerator, 
  type StructureGenerationConfig,
  type StructureGenerationResult
} from './structure-generator';
import { 
  RelationsGenerator, 
  type RelationsGenerationConfig,
  type RelationsGenerationResult
} from './relations-generator';
import { 
  ResourcesVisitorsGenerator, 
  type ResourcesVisitorsGenerationConfig,
  type ResourcesVisitorsGenerationResult
} from './resources-visitors-generator';

// Configuração principal para geração de guilda
export interface GuildGenerationConfig {
  readonly settlementType: SettlementType;
  readonly name?: string;
  readonly seed?: string;
  readonly debug?: boolean;
  readonly customModifiers?: {
    readonly structure?: {
      readonly size?: number;
      readonly characteristics?: number;
      readonly employees?: number;
    };
    readonly relations?: {
      readonly government?: number;
      readonly population?: number;
    };
    readonly resources?: {
      readonly level?: number;
    };
    readonly visitors?: {
      readonly frequency?: number;
    };
  };
}

// Dados completos da guilda gerada
export interface GuildData {
  readonly guild: Guild;
}

// Todos os rolls realizados durante a geração
export interface GuildRolls {
  readonly structure: {
    readonly headquartersType: number;
    readonly size: number;
    readonly characteristics: readonly number[];
    readonly employees: number;
  };
  readonly relations: {
    readonly government: number;
    readonly population: number;
  };
  readonly resources: number;
  readonly visitors: number;
}

// Resultado completo da geração de guilda
export interface GuildGenerationResult {
  readonly data: GuildData;
  readonly rolls: GuildRolls;
  readonly logs: readonly string[];
  readonly timestamp: Date;
}

/**
 * Gerador principal de guildas
 * Coordena a geração de todos os aspectos da guilda seguindo as regras corretas
 */
export class GuildGenerator {
  private logs: string[] = [];
  private debug: boolean;

  constructor(private config: GuildGenerationConfig) {
    this.debug = config.debug || false;
  }

  /**
   * Gera uma guilda completa
   */
  public generate(): GuildGenerationResult {
    this.logs = [];
    this.log(`=== Starting complete guild generation ===`);
    this.validateConfig();
    
    try {
      // Fase 1: Gerar estrutura e funcionários
      const structureResult = this.generateStructure();
      
      // Extrair informação de Sede Matriz
      const headquartersModifier = structureResult.data.structure.isHeadquarters ? 5 : 0;
      
      // Fase 2: Gerar relações
      const relationsResult = this.generateRelations(headquartersModifier);
      
      // Fase 3: Gerar recursos (aplicando modificadores de relações e Sede Matriz)
      const resourcesVisitorsResult = this.generateResourcesAndVisitors(
        structureResult.data.staff.employees,
        relationsResult.data.relations.government,
        relationsResult.data.relations.population,
        headquartersModifier
      );
      
      // Fase 4: Montar a guilda final
      const guild = this.assembleGuild(
        structureResult,
        relationsResult,
        resourcesVisitorsResult
      );
      
      this.log(`=== Guild generation completed ===`);
      
      return {
        data: { guild },
        rolls: {
          structure: {
            headquartersType: structureResult.rolls.headquartersType,
            size: structureResult.rolls.size,
            characteristics: structureResult.rolls.characteristics,
            employees: structureResult.rolls.employees,
          },
          relations: {
            government: relationsResult.rolls.government,
            population: relationsResult.rolls.population,
          },
          resources: resourcesVisitorsResult.rolls.resources,
          visitors: resourcesVisitorsResult.rolls.visitors,
        },
        logs: [...this.logs],
        timestamp: new Date(),
      };
    } catch (error) {
      this.log(`Generation failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Gera a estrutura física e funcionários da guilda
   */
  private generateStructure() {
    this.log(`--- Phase 1: Generating structure ---`, 'PHASE');
    
    const config: StructureGenerationConfig = {
      settlementType: this.config.settlementType,
      customModifiers: this.config.customModifiers?.structure,
      debug: this.debug,
    };
    
    const generator = new StructureGenerator(config);
    const result = generator.generate();
    
    // Incorporar logs do sub-gerador
    result.logs.forEach(log => this.logs.push(log));
    
    return result;
  }

  /**
   * Gera as relações da guilda com governo e população
   */
  private generateRelations(headquartersModifier: number = 0) {
    this.log(`--- Phase 2: Generating relations ---`, 'PHASE');
    
    const config: RelationsGenerationConfig = {
      settlementType: this.config.settlementType,
      customModifiers: {
        government: (this.config.customModifiers?.relations?.government || 0) + headquartersModifier,
        population: (this.config.customModifiers?.relations?.population || 0) + headquartersModifier,
      },
      debug: this.debug,
    };
    
    const generator = new RelationsGenerator(config);
    const result = generator.generate();
    
    // Incorporar logs do sub-gerador
    result.logs.forEach(log => this.logs.push(log));
    
    return result;
  }

  /**
   * Gera recursos e visitantes aplicando modificadores baseados em relações
   */
  private generateResourcesAndVisitors(
    employees: string,
    government: import('@/types/guild').RelationLevel,
    population: import('@/types/guild').RelationLevel,
    headquartersModifier: number = 0
  ) {
    this.log(`--- Phase 3: Generating resources and visitors ---`, 'PHASE');
    
    const config: ResourcesVisitorsGenerationConfig = {
      settlementType: this.config.settlementType,
      customModifiers: {
        resources: (this.config.customModifiers?.resources?.level || 0) + headquartersModifier,
        visitors: (this.config.customModifiers?.visitors?.frequency || 0) + headquartersModifier,
      },
      relationModifiers: {
        government,
        population,
        employees,
      },
      debug: this.debug,
    };
    
    const generator = new ResourcesVisitorsGenerator(config);
    const result = generator.generate();
    
    // Incorporar logs do sub-gerador
    result.logs.forEach(log => this.logs.push(log));
    
    return result;
  }

  /**
   * Monta a guilda final combinando todos os resultados
   */
  private assembleGuild(
    structureResult: StructureGenerationResult,
    relationsResult: RelationsGenerationResult,
    resourcesVisitorsResult: ResourcesVisitorsGenerationResult
  ): Guild {
    this.log(`--- Phase 4: Assembling final guild ---`, 'PHASE');
    
    const guildName = this.config.name || this.generateGuildName();
    
    const guild: Guild = {
      id: this.generateGuildId(),
      name: guildName,
      structure: structureResult.data.structure,
      relations: relationsResult.data.relations,
      staff: structureResult.data.staff,
      visitors: resourcesVisitorsResult.data.visitors,
      resources: resourcesVisitorsResult.data.resources,
      settlementType: this.config.settlementType,
      createdAt: new Date(),
    };
    
    this.log(`Guild "${guildName}" assembled successfully`, 'ASSEMBLY');
    
    return guild;
  }

  /**
   * Gera um ID único para a guilda
   */
  private generateGuildId(): string {
    return `guild_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Gera um nome para a guilda se não fornecido
   */
  private generateGuildName(): string {
    return generateRandomGuildName();
  }

  /**
   * Validação da configuração
   */
  private validateConfig(): void {
    if (!this.config.settlementType) {
      throw new Error('Settlement type is required');
    }
    
    if (this.config.name && this.config.name.trim().length === 0) {
      throw new Error('Guild name cannot be empty');
    }
  }

  /**
   * Utilitário para logging
   */
  private log(message: string, category: string = 'GENERATOR'): void {
    const logMessage = `[${category}] ${message}`;
    this.logs.push(logMessage);
    
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log(logMessage);
    }
  }
}

// Função de conveniência para geração rápida de guilda
export function generateGuild(config: GuildGenerationConfig): GuildGenerationResult {
  const generator = new GuildGenerator(config);
  return generator.generate();
}

// Função simplificada para geração rápida apenas com tipo de assentamento
export function generateQuickGuild(settlementType: SettlementType, name?: string): Guild {
  const config: GuildGenerationConfig = {
    settlementType,
    name,
  };
  
  const result = generateGuild(config);
  return result.data.guild;
}
