/**
 * Gerador especializado para relações da guilda
 * Implementa a geração de relações com governo e população
 */

import type { GuildRelations } from '@/types/guild';
import { RelationLevel } from '@/types/guild';
import { BaseGenerator, type BaseGenerationConfig, type BaseGenerationResult } from './base-generator';
import { findTableEntry } from '@/utils/table-operations';
import { mapGovernmentRelationToEnum, mapPopulationRelationToEnum, mapSettlementTypeToTableKey } from '@/utils/enum-mappers';
import {
  GOVERNMENT_RELATIONS_TABLE,
  POPULATION_RELATIONS_TABLE,
  SETTLEMENT_DICE,
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
  
  /**
   * Obtém a configuração de dados baseada no tipo de assentamento
   */
  private getSettlementDiceConfig(): { dice: string; modifier: number } {
    const settlementKey = mapSettlementTypeToTableKey(this.config.settlementType);
    const diceConfig = SETTLEMENT_DICE.structure[settlementKey as keyof typeof SETTLEMENT_DICE.structure];
    
    // Use settlement dice or fallback to d20
    return diceConfig ? diceConfig : { dice: 'd20', modifier: 0 };
  }
  
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
    const customModifier = this.config.customModifiers?.government || 0;
    const diceConfig = this.getSettlementDiceConfig();
    const totalModifier = diceConfig.modifier + customModifier;
    
    const notation = totalModifier === 0 ? diceConfig.dice : `${diceConfig.dice}${totalModifier >= 0 ? '+' : ''}${totalModifier}`;
    const settlementKey = mapSettlementTypeToTableKey(this.config.settlementType);
    
    const rollResult = this.rollWithLog(notation, `Government relations (${settlementKey})`);
    
    // Para cada tipo de assentamento, clamp correto: mínimo = 1 + modifier, máximo = 20 + modifier
    // Qualquer valor acima de 20 + modifier é tratado como 21+
    const minValue = 1 + diceConfig.modifier;
    const maxValue = 20 + diceConfig.modifier;
    let clampedRoll = rollResult.result;
    if (clampedRoll < minValue) clampedRoll = minValue;
    if (clampedRoll > maxValue) clampedRoll = maxValue + 1; // 21+
    if (clampedRoll !== rollResult.result) {
      this.log(`Roll ${rollResult.result} clamped to ${clampedRoll} for table range ${minValue}-${maxValue}${clampedRoll > maxValue ? ' (21+)' : ''}`, 'MODIFIER');
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
    const customModifier = this.config.customModifiers?.population || 0;
    const diceConfig = this.getSettlementDiceConfig();
    const totalModifier = diceConfig.modifier + customModifier;
    
    const notation = totalModifier === 0 ? diceConfig.dice : `${diceConfig.dice}${totalModifier >= 0 ? '+' : ''}${totalModifier}`;
    const settlementKey = mapSettlementTypeToTableKey(this.config.settlementType);
    
    const rollResult = this.rollWithLog(notation, `Population relations (${settlementKey})`);
    
    // Para cada tipo de assentamento, clamp correto: mínimo = 1 + modifier, máximo = 20 + modifier
    // Qualquer valor acima de 20 + modifier é tratado como 21+
    const minValue = 1 + diceConfig.modifier;
    const maxValue = 20 + diceConfig.modifier;
    let clampedRoll = rollResult.result;
    if (clampedRoll < minValue) clampedRoll = minValue;
    if (clampedRoll > maxValue) clampedRoll = maxValue + 1; // 21+
    if (clampedRoll !== rollResult.result) {
      this.log(`Roll ${rollResult.result} clamped to ${clampedRoll} for table range ${minValue}-${maxValue}${clampedRoll > maxValue ? ' (21+)' : ''}`, 'MODIFIER');
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
