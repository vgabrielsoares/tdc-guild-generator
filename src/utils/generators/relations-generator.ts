/**
 * Gerador especializado para relações da guilda
 * Implementa a geração de relações com governo e população
 */

import type { GuildRelations } from '@/types/guild';
import { RelationLevel } from '@/types/guild';
import { BaseGenerator, type BaseGenerationConfig, type BaseGenerationResult } from './base-generator';
import { findTableEntry } from '@/utils/table-operations';
import { mapGovernmentRelationToEnum, mapPopulationRelationToEnum } from '@/utils/enum-mappers';
import {
  GOVERNMENT_RELATIONS_TABLE,
  POPULATION_RELATIONS_TABLE,
} from '@/data/tables/guild-structure';

// Configuração específica para geração de relações
export interface RelationsGenerationConfig extends BaseGenerationConfig {
  readonly customModifiers?: {
    readonly government?: number;
    readonly population?: number;
  };
}

// Dados gerados pelas relações
export interface RelationsData {
  readonly relations: GuildRelations;
}

// Rolls específicos das relações
export interface RelationsRolls {
  readonly government: number;
  readonly population: number;
}

// Resultado completo da geração de relações
export type RelationsGenerationResult = BaseGenerationResult<RelationsData, RelationsRolls>;

/**
 * Gerador de relações da guilda
 * Responsável por gerar relações com governo e população
 */
export class RelationsGenerator extends BaseGenerator<RelationsGenerationConfig, RelationsGenerationResult> {
  
  protected doGenerate(): RelationsGenerationResult {
    this.validateConfig();
    
    // Gerar relações com governo
    const governmentResult = this.generateGovernmentRelations();
    
    // Gerar relações com população
    const populationResult = this.generatePopulationRelations();
    
    return {
      data: {
        relations: {
          government: governmentResult.relation,
          population: populationResult.relation,
        },
      },
      rolls: {
        government: governmentResult.roll,
        population: populationResult.roll,
      },
      logs: this.getLogs(),
      timestamp: new Date(),
    };
  }

  /**
   * Gera relações com o governo
   */
  private generateGovernmentRelations(): { relation: RelationLevel; roll: number } {
    const modifier = this.config.customModifiers?.government || 0;
    const notation = modifier === 0 ? 'd20' : `d20${modifier >= 0 ? '+' : ''}${modifier}`;
    
    const rollResult = this.rollWithLog(notation, 'Government relations');
    
    // Clampar o resultado para o range válido da tabela (1-20)
    const clampedRoll = Math.max(1, Math.min(20, rollResult.result));
    if (clampedRoll !== rollResult.result) {
      this.log(`Roll ${rollResult.result} clamped to ${clampedRoll} for table range 1-20`, 'MODIFIER');
    }
    
    const tableResult = findTableEntry(GOVERNMENT_RELATIONS_TABLE, clampedRoll);
    
    if (!tableResult) {
      this.log(`No table entry found for roll ${clampedRoll}, using default`, 'WARNING');
      return { relation: RelationLevel.DIPLOMATICA, roll: rollResult.result };
    }
    
    const relation = mapGovernmentRelationToEnum(tableResult);
    this.log(`Government relation: ${relation}`, 'RELATIONS');
    
    return { relation, roll: rollResult.result };
  }

  /**
   * Gera relações com a população
   */
  private generatePopulationRelations(): { relation: RelationLevel; roll: number } {
    const modifier = this.config.customModifiers?.population || 0;
    const notation = modifier === 0 ? 'd20' : `d20${modifier >= 0 ? '+' : ''}${modifier}`;
    
    const rollResult = this.rollWithLog(notation, 'Population relations');
    
    // Clampar o resultado para o range válido da tabela (1-20)
    const clampedRoll = Math.max(1, Math.min(20, rollResult.result));
    if (clampedRoll !== rollResult.result) {
      this.log(`Roll ${rollResult.result} clamped to ${clampedRoll} for table range 1-20`, 'MODIFIER');
    }
    
    const tableResult = findTableEntry(POPULATION_RELATIONS_TABLE, clampedRoll);
    
    if (!tableResult) {
      this.log(`No table entry found for roll ${clampedRoll}, using default`, 'WARNING');
      return { relation: RelationLevel.OPINIAO_DIVIDIDA, roll: rollResult.result };
    }
    
    const relation = mapPopulationRelationToEnum(tableResult);
    this.log(`Population relation: ${relation}`, 'RELATIONS');
    
    return { relation, roll: rollResult.result };
  }
}

// Função de conveniência para geração rápida
export function generateGuildRelations(config: RelationsGenerationConfig): RelationsGenerationResult {
  const generator = new RelationsGenerator(config);
  return generator.generate();
}
