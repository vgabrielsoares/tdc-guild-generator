/**
 * Gerador especializado para recursos e visitantes da guilda
 * Implementa a geração com aplicação de modificadores baseados em relações
 */

import type { GuildResources, GuildVisitors } from '@/types/guild';
import { ResourceLevel, VisitorLevel, RelationLevel } from '@/types/guild';
import { BaseGenerator, type BaseGenerationConfig, type BaseGenerationResult } from './base-generator';
import { findTableEntry } from '@/utils/table-operations';
import { 
  mapResourceStringToEnum, 
  mapVisitorStringToEnum, 
  mapSettlementTypeToTableKey,
  mapResourceLevelToString
} from '@/utils/enum-mappers';
import {
  SETTLEMENT_DICE,
  RESOURCE_MODIFIERS,
  VISITOR_FREQUENCY_MODIFIERS,
  RESOURCES_LEVEL_TABLE,
  VISITORS_FREQUENCY_TABLE,
} from '@/data/tables/guild-structure';

// Configuração específica para geração de recursos e visitantes
export interface ResourcesVisitorsGenerationConfig extends BaseGenerationConfig {
  readonly customModifiers?: {
    readonly resources?: number;
    readonly visitors?: number;
  };
  readonly relationModifiers?: {
    readonly government?: RelationLevel;
    readonly population?: RelationLevel;
    readonly employees?: string;
    readonly currentResources?: ResourceLevel;
  };
}

// Dados gerados por recursos e visitantes
export interface ResourcesVisitorsData {
  readonly resources: GuildResources;
  readonly visitors: GuildVisitors;
}

// Rolls específicos de recursos e visitantes
export interface ResourcesVisitorsRolls {
  readonly resources: number;
  readonly visitors: number;
}

// Resultado completo da geração
export type ResourcesVisitorsGenerationResult = BaseGenerationResult<ResourcesVisitorsData, ResourcesVisitorsRolls>;

/**
 * Calculadora de modificadores baseados em relações e outros fatores
 */
export class ModifierCalculator {
  
  /**
   * Mapeia enum de RelationLevel para string de governo
   */
  private static mapGovernmentRelation(relation: RelationLevel): string {
    // Mapeamento direto para governo - usa os valores dos enums diretamente
    return relation as string;
  }
  
  /**
   * Mapeia enum de RelationLevel para string de população
   */
  private static mapPopulationRelation(relation: RelationLevel): string {
    // Mapeamento específico para população conforme markdown
    const mapping: Record<RelationLevel, string> = {
      [RelationLevel.PESSIMA]: "Péssima, puro ódio",
      [RelationLevel.PESSIMA_ODIO]: "Péssima, puro ódio",
      [RelationLevel.RUIM]: "Ruim, vistos como mercenários",
      [RelationLevel.RUIM_MERCENARIOS]: "Ruim, vistos como mercenários",
      [RelationLevel.RUIM_CORDIAL]: "Ruim, vistos como mercenários",
      [RelationLevel.RUIM_PROBLEMAS]: "Ruim, só causam problemas",
      [RelationLevel.DIPLOMATICA]: "Opinião dividida",
      [RelationLevel.OPINIAO_DIVIDIDA]: "Opinião dividida",
      [RelationLevel.BOA_TENSAO]: "Boa, ajudam com problemas",
      [RelationLevel.BOA]: "Boa, ajudam com problemas",
      [RelationLevel.BOA_AJUDAM]: "Boa, ajudam com problemas",
      [RelationLevel.BOA_SEGUROS]: "Boa, nos mantêm seguros",
      [RelationLevel.MUITO_BOA]: "Muito boa, sem eles estaríamos perdidos",
      [RelationLevel.MUITO_BOA_PERDIDOS]: "Muito boa, sem eles estaríamos perdidos",
      [RelationLevel.EXCELENTE]: "Excelente, a guilda faz o assentamento funcionar",
      [RelationLevel.EXCELENTE_FUNCIONAR]: "Excelente, a guilda faz o assentamento funcionar",
    };
    
    return mapping[relation] || relation as string;
  }
  
  /**
   * Calcula modificadores para recursos baseado em relações
   */
  static calculateResourceModifiers(
    government?: RelationLevel,
    population?: RelationLevel
  ): number {
    let modifier = 0;
    
    if (government) {
      const governmentString = this.mapGovernmentRelation(government);
      const govModifier = (RESOURCE_MODIFIERS.government as Record<string, number>)[governmentString];
      if (govModifier !== undefined) {
        modifier += govModifier;
      }
    }
    
    if (population) {
      const populationString = this.mapPopulationRelation(population);
      const popModifier = (RESOURCE_MODIFIERS.population as Record<string, number>)[populationString];
      if (popModifier !== undefined) {
        modifier += popModifier;
      }
    }
    
    return modifier;
  }
  
  /**
   * Calcula modificadores para visitantes baseado em funcionários e recursos
   */
  static calculateVisitorModifiers(
    employees?: string,
    resources?: ResourceLevel
  ): number {
    let modifier = 0;
    
    // Modificadores de funcionários - verifica palavras-chave conforme markdown
    if (employees) {
      const employeesLower = employees.toLowerCase();
      
      // Funcionários despreparados (-1)
      if (employeesLower.includes('despreparado')) {
        modifier -= 1;
      }
      // Funcionários experientes (+1)
      else if (
        employeesLower.includes('experiente') ||
        employeesLower.includes('explorador') ||
        employeesLower.includes('ex-membro') ||
        employeesLower.includes('ex-aventureiro') ||
        employeesLower.includes('clero') ||
        employeesLower.includes('nobre') ||
        employeesLower.includes('aventureiro') ||
        employeesLower.includes('animal falante')
      ) {
        modifier += 1;
      }
    }
    
    // Modificadores de recursos
    if (resources) {
      const resourceString = mapResourceLevelToString(resources);
      const resourceModifier = (VISITOR_FREQUENCY_MODIFIERS.resources as Record<string, number>)[resourceString];
      if (resourceModifier !== undefined) {
        modifier += resourceModifier;
      }
    }
    
    return modifier;
  }
}

/**
 * Gerador de recursos e visitantes da guilda
 */
export class ResourcesVisitorsGenerator extends BaseGenerator<ResourcesVisitorsGenerationConfig, ResourcesVisitorsGenerationResult> {
  
  protected doGenerate(): ResourcesVisitorsGenerationResult {
    this.validateConfig();
    
    // Calcular modificadores baseados em relações
    const resourceModifier = this.calculateResourceModifier();
    const visitorsModifier = this.calculateVisitorsModifier();
    
    // Gerar recursos com modificadores
    const resourcesResult = this.generateResources(resourceModifier);
    
    // Gerar visitantes com modificadores
    const visitorsResult = this.generateVisitors(visitorsModifier);
    
    return {
      data: {
        resources: {
          level: resourcesResult.level,
        },
        visitors: {
          frequency: visitorsResult.frequency,
        },
      },
      rolls: {
        resources: resourcesResult.roll,
        visitors: visitorsResult.roll,
      },
      logs: this.getLogs(),
      timestamp: new Date(),
    };
  }

  /**
   * Calcula modificador para recursos baseado em relações
   */
  private calculateResourceModifier(): number {
    const government = this.config.relationModifiers?.government;
    const population = this.config.relationModifiers?.population;
    const customModifier = this.config.customModifiers?.resources || 0;
    
    const relationModifier = ModifierCalculator.calculateResourceModifiers(government, population);
    const totalModifier = relationModifier + customModifier;
    
    if (totalModifier !== 0) {
      this.log(
        `Resource modifiers: relations=${relationModifier}, custom=${customModifier}, total=${totalModifier}`,
        'MODIFIERS'
      );
    }
    
    return totalModifier;
  }

  /**
   * Calcula modificador para visitantes baseado em funcionários e recursos
   */
  private calculateVisitorsModifier(): number {
    const employees = this.config.relationModifiers?.employees;
    const resources = this.config.relationModifiers?.currentResources;
    const customModifier = this.config.customModifiers?.visitors || 0;
    
    const relationModifier = ModifierCalculator.calculateVisitorModifiers(employees, resources);
    const totalModifier = relationModifier + customModifier;
    
    if (totalModifier !== 0) {
      this.log(
        `Visitor modifiers: relations=${relationModifier}, custom=${customModifier}, total=${totalModifier}`,
        'MODIFIERS'
      );
    }
    
    return totalModifier;
  }

  /**
   * Determina o range máximo baseado no tipo de dado e tabela
   */
  private getDiceRange(dice: string, context: 'resources' | 'visitors' = 'resources'): { min: number; max: number } {
    switch (dice) {
      case 'd8': return { min: 1, max: 8 };
      case 'd10': return { min: 1, max: 10 };
      case 'd12': return { min: 1, max: 12 };
      case 'd20': 
        // A tabela de recursos D20 vai até 25 devido a modificadores
        if (context === 'resources') return { min: 1, max: 25 };
        return { min: 1, max: 20 };
      case 'd25': return { min: 1, max: 25 };
      default: return { min: 1, max: 20 }; // fallback
    }
  }

  /**
   * Aplica clamp ao roll baseado no range do dado
   */
  private clampRoll(roll: number, dice: string, context: 'resources' | 'visitors', logContext: string): number {
    const range = this.getDiceRange(dice, context);
    const clampedRoll = Math.max(range.min, Math.min(range.max, roll));
    
    if (clampedRoll !== roll) {
      this.log(
        `${logContext}: Roll ${roll} clamped to ${clampedRoll} for table range ${range.min}-${range.max}`, 
        'MODIFIER'
      );
    }
    
    return clampedRoll;
  }

  /**
   * Gera recursos baseado no tipo de assentamento e modificadores
   */
  private generateResources(modifier: number): { level: ResourceLevel; roll: number } {
    const settlementKey = mapSettlementTypeToTableKey(this.config.settlementType);
    const diceConfig = SETTLEMENT_DICE.structure[settlementKey as keyof typeof SETTLEMENT_DICE.structure];
    
    const resourceTable = RESOURCES_LEVEL_TABLE;
    
    if (!diceConfig) {
      this.log(`Unknown settlement type: ${settlementKey}, using fallback d8`, 'WARNING');
      const notation = modifier === 0 ? 'd8' : `d8${modifier >= 0 ? '+' : ''}${modifier}`;
      
      const rollResult = this.rollWithLog(notation, 'Resources (fallback)');
      const clampedRoll = this.clampRoll(rollResult.result, 'd8', 'resources', 'Resources');
      const tableResult = findTableEntry(resourceTable, clampedRoll);
      const level = mapResourceStringToEnum(tableResult || 'Limitados');
      
      return { level, roll: rollResult.result };
    }
    
    const finalModifier = diceConfig.modifier + modifier;
    const notation = finalModifier === 0 ? `1${diceConfig.dice}` : `1${diceConfig.dice}${finalModifier >= 0 ? '+' : ''}${finalModifier}`;
    
    const rollResult = this.rollWithLog(notation, `Resources (${settlementKey})`);
    const clampedRoll = this.clampRoll(rollResult.result, diceConfig.dice, 'resources', 'Resources');
    const tableResult = findTableEntry(resourceTable, clampedRoll);
    const level = mapResourceStringToEnum(tableResult || 'Limitados');
    
    this.log(`Resource level: ${level}`, 'RESOURCES');
    return { level, roll: rollResult.result };
  }

  /**
   * Gera visitantes baseado no tipo de assentamento e modificadores
   */
  private generateVisitors(modifier: number): { frequency: VisitorLevel; roll: number } {
    const settlementKey = mapSettlementTypeToTableKey(this.config.settlementType);
    const diceConfig = SETTLEMENT_DICE.visitors[settlementKey as keyof typeof SETTLEMENT_DICE.visitors];
    
    const visitorTable = VISITORS_FREQUENCY_TABLE;
    
    if (!diceConfig) {
      this.log(`Unknown settlement type: ${settlementKey}, using fallback d8`, 'WARNING');
      const notation = modifier === 0 ? 'd8' : `d8${modifier >= 0 ? '+' : ''}${modifier}`;
      
      const rollResult = this.rollWithLog(notation, 'Visitors (fallback)');
      const clampedRoll = this.clampRoll(rollResult.result, 'd8', 'visitors', 'Visitors');
      const tableResult = findTableEntry(visitorTable, clampedRoll);
      const frequency = mapVisitorStringToEnum(tableResult || 'Nem muito nem pouco');
      
      return { frequency, roll: rollResult.result };
    }
    
    const finalModifier = diceConfig.modifier + modifier;
    const notation = finalModifier === 0 ? `1${diceConfig.dice}` : `1${diceConfig.dice}${finalModifier >= 0 ? '+' : ''}${finalModifier}`;
    
    const rollResult = this.rollWithLog(notation, `Visitors (${settlementKey})`);
    const clampedRoll = this.clampRoll(rollResult.result, diceConfig.dice, 'visitors', 'Visitors');
    const tableResult = findTableEntry(visitorTable, clampedRoll);
    const frequency = mapVisitorStringToEnum(tableResult || 'Nem muito nem pouco');
    
    this.log(`Visitor frequency: ${frequency}`, 'VISITORS');
    return { frequency, roll: rollResult.result };
  }
}

// Função de conveniência para geração rápida
export function generateResourcesAndVisitors(config: ResourcesVisitorsGenerationConfig): ResourcesVisitorsGenerationResult {
  const generator = new ResourcesVisitorsGenerator(config);
  return generator.generate();
}
