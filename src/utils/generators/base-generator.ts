/**
 * Sistema base de geração - classe abstrata para todos os geradores
 * Define interfaces e padrões comuns para geração procedural
 */

import type { SettlementType } from '@/types/guild';
import { rollDice } from '@/utils/dice';

// Interface base para configuração de geração
export interface BaseGenerationConfig {
  readonly settlementType: SettlementType;
  readonly customModifiers?: Record<string, number>;
  readonly seed?: string;
  readonly debug?: boolean;
}

// Interface base para resultado de geração
export interface BaseGenerationResult<TData, TRolls = Record<string, number>> {
  readonly data: TData;
  readonly rolls: TRolls;
  readonly logs: readonly string[];
  readonly timestamp: Date;
}

// Classe abstrata base para geradores
export abstract class BaseGenerator<TConfig extends BaseGenerationConfig, TResult> {
  protected logs: string[] = [];
  protected debug: boolean = false;

  constructor(protected config: TConfig) {
    this.debug = config.debug || false;
  }

  // Método principal de geração (template method pattern)
  public generate(): TResult {
    this.logs = [];
    this.log(`Starting generation for ${this.config.settlementType}`);
    
    try {
      const result = this.doGenerate();
      this.log(`Generation completed successfully`);
      return result;
    } catch (error) {
      this.log(`Generation failed: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  // Método abstrato que cada gerador deve implementar
  protected abstract doGenerate(): TResult;

  // Utilitários para logging
  protected log(message: string, category: string = 'GENERATOR'): void {
    const logMessage = `[${category}] ${message}`;
    this.logs.push(logMessage);
    
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log(logMessage);
    }
  }

  // Utilitário para rolagem com logging automático
  protected rollWithLog(
    notation: string,
    description: string,
    category: string = 'ROLL'
  ): { result: number; details: string } {
    const roll = rollDice({ notation });
    const details = `${description}: ${notation} = ${roll.result}`;
    this.log(details, category);
    
    return {
      result: roll.result,
      details
    };
  }

  // Utilitário para aplicar modificadores
  protected applyModifier(
    baseValue: number,
    modifier: number,
    description: string
  ): number {
    const finalValue = baseValue + modifier;
    if (modifier !== 0) {
      this.log(
        `${description}: ${baseValue} ${modifier >= 0 ? '+' : ''}${modifier} = ${finalValue}`,
        'MODIFIER'
      );
    }
    return finalValue;
  }

  // Getter para logs (somente leitura)
  public getLogs(): readonly string[] {
    return [...this.logs];
  }

  // Método para validar configuração
  protected validateConfig(): void {
    if (!this.config.settlementType) {
      throw new Error('Settlement type is required');
    }
  }
}
