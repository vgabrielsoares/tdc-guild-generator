/**
 * Gerador especializado para estrutura física da guilda
 * Implementa a geração de tamanho, características e funcionários
 */

import type { GuildStructure, GuildStaff } from "@/types/guild";
import {
  BaseGenerator,
  type BaseGenerationConfig,
  type BaseGenerationResult,
} from "./base-generator";
import {
  HEADQUARTERS_SIZE_TABLE,
  HEADQUARTERS_CHARACTERISTICS_TABLE,
  HEADQUARTERS_TYPE_TABLE,
  EMPLOYEES_TABLE,
  SETTLEMENT_DICE,
  getDiceNotationString,
} from "@/data/tables/guild-structure";
import { lookupTableValue } from "@/utils/table-operations";
import { mapSettlementTypeToTableKey } from "@/utils/enum-mappers";
import { rollDiceSimple } from "@/utils/dice";

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
  readonly headquartersType: number;
  readonly size: number;
  readonly characteristics: readonly number[];
  readonly employees: number;
}

// Resultado completo da geração de estrutura
export type StructureGenerationResult = BaseGenerationResult<
  StructureData,
  StructureRolls
>;

/**
 * Gerador de estrutura da guilda
 * Responsável por gerar tamanho, características e funcionários
 */
export class StructureGenerator extends BaseGenerator<
  StructureGenerationConfig,
  StructureGenerationResult
> {
  protected doGenerate(): StructureGenerationResult {
    this.validateConfig();

    // Primeiro, determinar se é uma Sede Matriz
    const headquartersTypeResult = this.generateHeadquartersType();

    // Calcular modificador para Sede Matriz
    const headquartersModifier = headquartersTypeResult.isHeadquarters ? 5 : 0;

    // Gerar tamanho da sede com modificador
    const sizeResult = this.generateSize(headquartersModifier);

    // Gerar características baseadas no tamanho
    const characteristicsResult = this.generateCharacteristics(sizeResult.roll);

    // Gerar funcionários com modificador
    const employeesResult = this.generateEmployees(headquartersModifier);

    return {
      data: {
        structure: {
          size: sizeResult.size,
          characteristics: characteristicsResult.characteristics,
          isHeadquarters: headquartersTypeResult.isHeadquarters,
        },
        staff: {
          employees: employeesResult.employees,
        },
      },
      rolls: {
        headquartersType: headquartersTypeResult.roll,
        size: sizeResult.roll,
        characteristics: characteristicsResult.rolls,
        employees: employeesResult.roll,
      },
      logs: this.getLogs(),
      timestamp: new Date(),
    };
  }

  /**
   * Gera o tipo de sede (Normal ou Matriz) baseado no tipo de assentamento
   */
  private generateHeadquartersType(): {
    isHeadquarters: boolean;
    roll: number;
  } {
    const settlementKey = mapSettlementTypeToTableKey(
      this.config.settlementType
    );
    const diceConfig =
      SETTLEMENT_DICE.structure[
        settlementKey as keyof typeof SETTLEMENT_DICE.structure
      ];

    if (!diceConfig) {
      this.log(
        `Unknown settlement type: ${settlementKey}, using fallback d8`,
        "WARNING"
      );
      const fallbackConfig = { dice: "d8", modifier: 0 };
      const notation = this.buildDiceNotation(
        fallbackConfig.dice,
        fallbackConfig.modifier
      );

      const rollResult = this.rollWithLog(
        notation,
        "Headquarters type (fallback)"
      );
      const result = lookupTableValue(
        HEADQUARTERS_TYPE_TABLE,
        rollResult.result
      );
      const isHeadquarters = result === "Sede Matriz";

      this.log(`Headquarters type: ${result}`, "STRUCTURE");
      return { isHeadquarters, roll: rollResult.result };
    }

    const notation = this.buildDiceNotation(
      diceConfig.dice,
      diceConfig.modifier
    );
    const rollResult = this.rollWithLog(
      notation,
      `Headquarters type (${settlementKey})`
    );
    const result = lookupTableValue(HEADQUARTERS_TYPE_TABLE, rollResult.result);
    const isHeadquarters = result === "Sede Matriz";

    this.log(
      `Headquarters type: ${result}${isHeadquarters ? " (+5 to all structure rolls)" : ""}`,
      "STRUCTURE"
    );
    return { isHeadquarters, roll: rollResult.result };
  }

  /**
   * Gera o tamanho da sede baseado no tipo de assentamento
   */
  private generateSize(headquartersModifier: number = 0): {
    size: string;
    roll: number;
  } {
    const settlementKey = mapSettlementTypeToTableKey(
      this.config.settlementType
    );
    const diceConfig =
      SETTLEMENT_DICE.structure[
        settlementKey as keyof typeof SETTLEMENT_DICE.structure
      ];

    if (!diceConfig) {
      this.log(
        `Unknown settlement type: ${settlementKey}, using fallback d8`,
        "WARNING"
      );
      const fallbackConfig = { dice: "d8", modifier: 0 };
      const modifier =
        (this.config.customModifiers?.size || 0) + headquartersModifier;
      const notation = this.buildDiceNotation(
        fallbackConfig.dice,
        fallbackConfig.modifier + modifier
      );

      const rollResult = this.rollWithLog(
        notation,
        "Headquarters size (fallback)"
      );
      const size = lookupTableValue(HEADQUARTERS_SIZE_TABLE, rollResult.result);

      return { size, roll: rollResult.result };
    }

    const modifier =
      (this.config.customModifiers?.size || 0) + headquartersModifier;
    const notation = this.buildDiceNotation(
      diceConfig.dice,
      diceConfig.modifier + modifier
    );

    const rollResult = this.rollWithLog(
      notation,
      `Headquarters size (${settlementKey})`
    );
    const size = lookupTableValue(HEADQUARTERS_SIZE_TABLE, rollResult.result);

    this.log(`Size determined: ${size}`, "STRUCTURE");
    return { size, roll: rollResult.result };
  }

  /**
   * Gera características baseadas no roll de tamanho
   */
  private generateCharacteristics(sizeRoll: number): {
    characteristics: string[];
    rolls: number[];
  } {
    // Determinar número de características baseado no tamanho
    const numCharacteristics = this.determineCharacteristicsCount(sizeRoll);
    this.log(
      `Generating ${numCharacteristics} characteristics based on size roll ${sizeRoll}`,
      "STRUCTURE"
    );

    const characteristics: string[] = [];
    const rolls: number[] = [];
    const usedCharacteristics = new Set<string>();

    for (let i = 0; i < numCharacteristics; i++) {
      const result = this.generateUniqueCharacteristic(
        usedCharacteristics,
        i + 1
      );
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

    // Usar o dado específico do tipo de assentamento
    const settlementKey = mapSettlementTypeToTableKey(
      this.config.settlementType
    );
    const diceNotation = getDiceNotationString(settlementKey, "structure");

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const rollResult = this.rollWithLog(
        diceNotation,
        `Headquarters characteristics (${settlementKey})`
      );
      const characteristic = lookupTableValue(
        HEADQUARTERS_CHARACTERISTICS_TABLE,
        rollResult.result
      );

      if (!usedCharacteristics.has(characteristic)) {
        this.log(`Selected characteristic: ${characteristic}`, "STRUCTURE");
        return { characteristic, roll: rollResult.result };
      }

      // Se chegou no último attempt, retorna a característica mesmo que duplicada
      if (attempt === maxAttempts) {
        this.log(
          `Max attempts reached, using duplicate: ${characteristic}`,
          "WARNING"
        );
        return { characteristic, roll: rollResult.result };
      }
    }

    // Esta linha nunca deveria ser alcançada devido à lógica do loop
    // Mantida apenas para satisfazer o TypeScript
    const fallbackRoll = this.rollWithLog(
      diceNotation,
      `Fallback characteristic ${attemptNumber}`
    );
    const fallbackCharacteristic = lookupTableValue(
      HEADQUARTERS_CHARACTERISTICS_TABLE,
      fallbackRoll.result
    );
    this.log(
      `Fallback characteristic used: ${fallbackCharacteristic}`,
      "WARNING"
    );
    return {
      characteristic: fallbackCharacteristic,
      roll: fallbackRoll.result,
    };
  }

  /**
   * Gera funcionários baseado no tipo de assentamento
   */
  private generateEmployees(headquartersModifier: number = 0): {
    employees: string;
    count?: number;
    roll: number;
  } {
    const settlementKey = mapSettlementTypeToTableKey(
      this.config.settlementType
    );
    const diceConfig =
      SETTLEMENT_DICE.structure[
        settlementKey as keyof typeof SETTLEMENT_DICE.structure
      ];
    let employeesRaw: string;
    let rollValue: number;
    if (!diceConfig) {
      this.log(
        `Unknown settlement type: ${settlementKey}, using fallback d8`,
        "WARNING"
      );
      const fallbackConfig = { dice: "d8", modifier: 0 };
      const modifier =
        (this.config.customModifiers?.employees || 0) + headquartersModifier;
      const notation = this.buildDiceNotation(
        fallbackConfig.dice,
        fallbackConfig.modifier + modifier
      );
      const rollResult = this.rollWithLog(notation, "Employees (fallback)");
      employeesRaw = lookupTableValue(EMPLOYEES_TABLE, rollResult.result);
      rollValue = rollResult.result;
    } else {
      const modifier =
        (this.config.customModifiers?.employees || 0) + headquartersModifier;
      const notation = this.buildDiceNotation(
        diceConfig.dice,
        diceConfig.modifier + modifier
      );
      const rollResult = this.rollWithLog(
        notation,
        `Employees (${settlementKey})`
      );
      employeesRaw = lookupTableValue(EMPLOYEES_TABLE, rollResult.result);
      rollValue = rollResult.result;
    }

    // Detecta notação de dados no início da string
    const diceMatch = employeesRaw.match(/^(\d*d\d+[+-]?\d*)\s+(.*)$/i);
    if (diceMatch) {
      const [, diceNotation, desc] = diceMatch;
      const context = `Employees numbers: ${diceNotation} ${desc} (${settlementKey})`;
      const diceResult = rollDiceSimple(diceNotation, context);
      const employees = `${diceResult.total} ${desc}`;
      this.log(
        `Employees determined: ${employees} (rolled ${diceNotation} = ${diceResult.total})`,
        "STRUCTURE"
      );
      return { employees, count: diceResult.total, roll: rollValue };
    } else {
      // Tenta detectar número fixo
      const numMatch = employeesRaw.match(/^(\d+)\s+(.*)$/);
      if (numMatch) {
        const [, num, desc] = numMatch;
        const employees = `${num} ${desc}`;
        this.log(`Employees determined: ${employees}`, "STRUCTURE");
        return { employees, count: parseInt(num, 10), roll: rollValue };
      }
      // Caso não detecte nada, retorna string original
      this.log(`Employees determined: ${employeesRaw}`, "STRUCTURE");
      return { employees: employeesRaw, roll: rollValue };
    }
  }

  /**
   * Constrói notação de dados com modificadores
   */
  private buildDiceNotation(dice: string, modifier: number): string {
    if (modifier === 0) return `1${dice}`;
    const sign = modifier >= 0 ? "+" : "";
    return `1${dice}${sign}${modifier}`;
  }
}

// Função de conveniência para geração rápida
export function generateGuildStructure(
  config: StructureGenerationConfig
): StructureGenerationResult {
  const generator = new StructureGenerator(config);
  return generator.generate();
}
