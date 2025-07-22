/**
 * Gerador especializado para estrutura física da guilda
 * Implementa a geração de tamanho, características e funcionários
 */

import type { GuildStructure, GuildStaff } from '@/types/guild';
import { BaseGenerator, type BaseGenerationConfig, type BaseGenerationResult } from './base-generator';
import { lookupTableValue } from '@/utils/table-operations';
import { mapSettlementTypeToTableKey } from '@/utils/enum-mappers';
import {
  HEADQUARTERS_SIZE_TABLE,
  HEADQUARTERS_CHARACTERISTICS_TABLE,
  EMPLOYEES_TABLE,
  SETTLEMENT_DICE,
} from '@/data/tables/guild-structure';

// Configuração específica para geração de estrutura
export interface StructureGenerationConfig extends BaseGenerationConfig {
  readonly customModifiers?: {
    readonly size?: number;
    readonly characteristics?: number;
    readonly employees?: number;
  };
}

// Dados gerados pela estrutura
export interface StructureData {
  readonly structure: GuildStructure;
  readonly staff: GuildStaff;
}

// Rolls específicos da estrutura
export interface StructureRolls {
  readonly size: number;
  readonly characteristics: readonly number[];
  readonly employees: number;
}

// Resultado completo da geração de estrutura
export type StructureGenerationResult = BaseGenerationResult<StructureData, StructureRolls>;

/**
 * Gerador de estrutura da guilda
 * Responsável por gerar tamanho, características e funcionários
 */
export class StructureGenerator extends BaseGenerator<StructureGenerationConfig, StructureGenerationResult> {
  
  protected doGenerate(): StructureGenerationResult {
    this.validateConfig();
    
    // Gerar tamanho da sede
    const sizeResult = this.generateSize();
    
    // Gerar características baseadas no tamanho
    const characteristicsResult = this.generateCharacteristics(sizeResult.roll);
    
    // Gerar funcionários
    const employeesResult = this.generateEmployees();
    
    return {
      data: {
        structure: {
          size: sizeResult.size,
          characteristics: characteristicsResult.characteristics,
        },
        staff: {
          employees: employeesResult.employees,
        },
      },
      rolls: {
        size: sizeResult.roll,
        characteristics: characteristicsResult.rolls,
        employees: employeesResult.roll,
      },
      logs: this.getLogs(),
      timestamp: new Date(),
    };
  }

  /**
   * Gera o tamanho da sede baseado no tipo de assentamento
   */
  private generateSize(): { size: string; roll: number } {
    const settlementKey = mapSettlementTypeToTableKey(this.config.settlementType);
    const diceConfig = SETTLEMENT_DICE.structure[settlementKey as keyof typeof SETTLEMENT_DICE.structure];
    
    if (!diceConfig) {
      this.log(`Unknown settlement type: ${settlementKey}, using fallback d8`, 'WARNING');
      const fallbackConfig = { dice: 'd8', modifier: 0 };
      const modifier = this.config.customModifiers?.size || 0;
      const notation = this.buildDiceNotation(fallbackConfig.dice, fallbackConfig.modifier + modifier);
      
      const rollResult = this.rollWithLog(notation, 'Headquarters size (fallback)');
      const size = lookupTableValue(HEADQUARTERS_SIZE_TABLE, rollResult.result);
      
      return { size, roll: rollResult.result };
    }
    
    const modifier = this.config.customModifiers?.size || 0;
    const notation = this.buildDiceNotation(diceConfig.dice, diceConfig.modifier + modifier);
    
    const rollResult = this.rollWithLog(notation, `Headquarters size (${settlementKey})`);
    const size = lookupTableValue(HEADQUARTERS_SIZE_TABLE, rollResult.result);
    
    this.log(`Size determined: ${size}`, 'STRUCTURE');
    return { size, roll: rollResult.result };
  }

  /**
   * Gera características baseadas no roll de tamanho
   */
  private generateCharacteristics(sizeRoll: number): { 
    characteristics: string[]; 
    rolls: number[] 
  } {
    // Determinar número de características baseado no tamanho
    const numCharacteristics = this.determineCharacteristicsCount(sizeRoll);
    this.log(`Generating ${numCharacteristics} characteristics based on size roll ${sizeRoll}`, 'STRUCTURE');
    
    const characteristics: string[] = [];
    const rolls: number[] = [];
    const usedCharacteristics = new Set<string>();
    
    for (let i = 0; i < numCharacteristics; i++) {
      const result = this.generateUniqueCharacteristic(usedCharacteristics, i + 1);
      characteristics.push(result.characteristic);
      rolls.push(result.roll);
      usedCharacteristics.add(result.characteristic);
    }
    
    return { characteristics, rolls };
  }

  /**
   * Determina quantas características gerar baseado no roll de tamanho
   */
  private determineCharacteristicsCount(sizeRoll: number): number {
    if (sizeRoll >= 15) return 3;
    if (sizeRoll >= 10) return 2;
    return 1;
  }

  /**
   * Gera uma característica única
   */
  private generateUniqueCharacteristic(
    usedCharacteristics: Set<string>,
    attemptNumber: number
  ): { characteristic: string; roll: number } {
    const maxAttempts = 50;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const rollResult = this.rollWithLog('d20', `Characteristic ${attemptNumber} (attempt ${attempt})`);
      const characteristic = lookupTableValue(HEADQUARTERS_CHARACTERISTICS_TABLE, rollResult.result);
      
      if (!usedCharacteristics.has(characteristic)) {
        this.log(`Selected characteristic: ${characteristic}`, 'STRUCTURE');
        return { characteristic, roll: rollResult.result };
      }
      
      if (attempt === maxAttempts) {
        this.log(`Max attempts reached, using duplicate: ${characteristic}`, 'WARNING');
        return { characteristic, roll: rollResult.result };
      }
    }
    
    // Este código nunca deveria ser alcançado, mas TypeScript exige
    throw new Error('Failed to generate characteristic');
  }

  /**
   * Gera funcionários baseado no tipo de assentamento
   */
  private generateEmployees(): { employees: string; roll: number } {
    const settlementKey = mapSettlementTypeToTableKey(this.config.settlementType);
    const diceConfig = SETTLEMENT_DICE.structure[settlementKey as keyof typeof SETTLEMENT_DICE.structure];
    
    if (!diceConfig) {
      this.log(`Unknown settlement type: ${settlementKey}, using fallback d8`, 'WARNING');
      const fallbackConfig = { dice: 'd8', modifier: 0 };
      const modifier = this.config.customModifiers?.employees || 0;
      const notation = this.buildDiceNotation(fallbackConfig.dice, fallbackConfig.modifier + modifier);
      
      const rollResult = this.rollWithLog(notation, 'Employees (fallback)');
      const employees = lookupTableValue(EMPLOYEES_TABLE, rollResult.result);
      
      return { employees, roll: rollResult.result };
    }
    
    const modifier = this.config.customModifiers?.employees || 0;
    const notation = this.buildDiceNotation(diceConfig.dice, diceConfig.modifier + modifier);
    
    const rollResult = this.rollWithLog(notation, `Employees (${settlementKey})`);
    const employees = lookupTableValue(EMPLOYEES_TABLE, rollResult.result);
    
    this.log(`Employees determined: ${employees}`, 'STRUCTURE');
    return { employees, roll: rollResult.result };
  }

  /**
   * Constrói notação de dados com modificadores
   */
  private buildDiceNotation(dice: string, modifier: number): string {
    if (modifier === 0) return `1${dice}`;
    const sign = modifier >= 0 ? '+' : '';
    return `1${dice}${sign}${modifier}`;
  }
}

// Função de conveniência para geração rápida
export function generateGuildStructure(config: StructureGenerationConfig): StructureGenerationResult {
  const generator = new StructureGenerator(config);
  return generator.generate();
}
