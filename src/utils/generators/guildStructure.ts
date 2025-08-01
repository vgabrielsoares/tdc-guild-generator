import type {
  Guild,
  GuildGenerationConfig,
  GuildGenerationResult,
} from "../../types/guild";
import {
  RelationLevel,
  ResourceLevel,
  SettlementType,
  VisitorLevel,
} from "../../types/guild";
import { rollDice } from "../dice";

import type { TableEntry } from "../../types/tables";
import {
  HEADQUARTERS_SIZE_TABLE,
  HEADQUARTERS_CHARACTERISTICS_TABLE,
  HEADQUARTERS_TYPE_TABLE,
  EMPLOYEES_TABLE,
  GOVERNMENT_RELATIONS_TABLE,
  POPULATION_RELATIONS_TABLE,
  RESOURCES_LEVEL_TABLE,
  VISITORS_FREQUENCY_TABLE,
  SETTLEMENT_DICE,
  RESOURCE_MODIFIERS,
} from "../../data/tables/guild-structure";
import { ModifierCalculator } from "./resources-visitors-generator";

/**
 * Helper function to find table entry by roll value
 */
function findTableEntry<T>(table: TableEntry<T>[], roll: number): T | null {
  const entry = table.find((entry) => roll >= entry.min && roll <= entry.max);
  return entry ? entry.result : null;
}

/**
 * Helper to build dice notation string (e.g. 1d8+2, 1d20-1)
 */
function buildDiceNotation(dice: string, modifier: number): string {
  if (!modifier) return `1${dice}`;
  return `1${dice}${modifier >= 0 ? "+" : ""}${modifier}`;
}

/**
 * Helper function to lookup a value in a table
 */
function lookupTableValue<T>(table: TableEntry<T>[], value: number): T {
  const matchingEntry = table.find(
    (entry) => value >= entry.min && value <= entry.max
  );

  if (!matchingEntry) {
    // Use the closest entry as fallback
    const closest = table.reduce((prev, curr) => {
      const prevDistance = Math.min(
        Math.abs(prev.min - value),
        Math.abs(prev.max - value)
      );
      const currDistance = Math.min(
        Math.abs(curr.min - value),
        Math.abs(curr.max - value)
      );
      return currDistance < prevDistance ? curr : prev;
    });

    return closest.result;
  }

  return matchingEntry.result;
}

/**
 * Maps SettlementType enum to SETTLEMENT_DICE keys
 */
function mapSettlementType(settlementType: SettlementType): string {
  const mapping: Record<SettlementType, string> = {
    [SettlementType.LUGAREJO]: "Lugarejo",
    [SettlementType.POVOADO]: "Povoado",
    [SettlementType.ALDEIA]: "Aldeia",
    [SettlementType.VILAREJO]: "Vilarejo",
    [SettlementType.VILA_GRANDE]: "Vila Grande",
    [SettlementType.CIDADELA]: "Cidadela",
    [SettlementType.CIDADE_GRANDE]: "Cidade Grande",
    [SettlementType.METROPOLE]: "Metrópole",
  };
  return mapping[settlementType] || "Aldeia";
}

/**
 * Generates the headquarters type (Normal or Sede Matriz) based on settlement type
 */
export function generateHeadquartersType(settlementType: SettlementType): {
  isHeadquarters: boolean;
  roll: number;
} {
  const mappedSettlement = mapSettlementType(settlementType);
  const diceConfig =
    SETTLEMENT_DICE.structure[
      mappedSettlement as keyof typeof SETTLEMENT_DICE.structure
    ];

  if (!diceConfig) {
    // Fallback to d8 for unknown settlement types
    const fallbackConfig = { dice: "d8", modifier: 0 };
    const notation = buildDiceNotation(
      fallbackConfig.dice,
      fallbackConfig.modifier
    );
    const diceRoll = rollDice({
      notation,
      context: "Headquarters type (fallback)",
    });
    const result = lookupTableValue(HEADQUARTERS_TYPE_TABLE, diceRoll.result);
    const isHeadquarters = result === "Sede Matriz";
    return { isHeadquarters, roll: diceRoll.result };
  }

  const notation = buildDiceNotation(diceConfig.dice, diceConfig.modifier);
  const diceRoll = rollDice({
    notation,
    context: `Headquarters type (${mappedSettlement})`,
  });
  const result = lookupTableValue(HEADQUARTERS_TYPE_TABLE, diceRoll.result);
  const isHeadquarters = result === "Sede Matriz";

  return { isHeadquarters, roll: diceRoll.result };
}

/**
 * Generates the headquarters size based on settlement type and modifiers
 */
export function generateHeadquartersSize(
  settlementType: SettlementType,
  modifier: number = 0
): { size: string; roll: number } {
  const mappedSettlement = mapSettlementType(settlementType);
  const diceConfig =
    SETTLEMENT_DICE.structure[
      mappedSettlement as keyof typeof SETTLEMENT_DICE.structure
    ];

  if (!diceConfig) {
    // Fallback to d8 for unknown settlement types
    const fallbackConfig = { dice: "d8", modifier: 0 };
    const notation = buildDiceNotation(
      fallbackConfig.dice,
      fallbackConfig.modifier + modifier
    );
    const diceRoll = rollDice({ notation });
    const size = lookupTableValue(HEADQUARTERS_SIZE_TABLE, diceRoll.result);
    return { size, roll: diceRoll.result };
  }

  const notation = buildDiceNotation(
    diceConfig.dice,
    diceConfig.modifier + modifier
  );
  const diceRoll = rollDice({ notation });
  const size = lookupTableValue(HEADQUARTERS_SIZE_TABLE, diceRoll.result);

  return { size, roll: diceRoll.result };
}

/**
 * Generates headquarters characteristics based on size roll and settlement type
 */
export function generateHeadquartersCharacteristics(
  sizeRoll: number,
  settlementType: SettlementType,
  headquartersModifier: number = 0
): {
  characteristics: string[];
  rolls: number[];
} {
  const characteristics: string[] = [];
  const rolls: number[] = [];

  // Determine number of characteristics based on size roll
  let numCharacteristics = 1;
  if (sizeRoll >= 15) numCharacteristics = 3;
  else if (sizeRoll >= 10) numCharacteristics = 2;

  const usedCharacteristics = new Set<string>();

  // Get settlement-specific dice configuration
  const mappedSettlement = mapSettlementType(settlementType);
  const diceConfig =
    SETTLEMENT_DICE.structure[
      mappedSettlement as keyof typeof SETTLEMENT_DICE.structure
    ];

  // Use settlement dice or fallback to d20
  const baseDice = diceConfig ? diceConfig.dice : "d20";
  const baseModifier = diceConfig ? diceConfig.modifier : 0;
  const totalModifier = baseModifier + headquartersModifier;

  for (let i = 0; i < numCharacteristics; i++) {
    let attempts = 0;
    let result: string;
    let diceRoll: { result: number };

    do {
      const notation = buildDiceNotation(baseDice, totalModifier);
      diceRoll = rollDice({
        notation,
        context: `Headquarters characteristics (${mappedSettlement})`,
      });
      result = lookupTableValue(
        HEADQUARTERS_CHARACTERISTICS_TABLE,
        diceRoll.result
      );
      attempts++;
    } while (usedCharacteristics.has(result) && attempts < 50); // Limit attempts to prevent infinite loop

    if (!usedCharacteristics.has(result)) {
      characteristics.push(result);
      usedCharacteristics.add(result);
      rolls.push(diceRoll.result);
    } else {
      // If we couldn't find a unique result after 50 attempts, just use it anyway
      characteristics.push(result);
      rolls.push(diceRoll.result);
    }
  }

  return { characteristics, rolls };
}

/**
 * Generates employees for the guild
 */
export function generateEmployees(
  settlementType: SettlementType,
  modifier: number = 0
): {
  employees: string;
  roll: number;
} {
  // Use settlement-specific dice based on the markdown rules
  const mappedSettlement = mapSettlementType(settlementType);
  const diceConfig =
    SETTLEMENT_DICE.structure[
      mappedSettlement as keyof typeof SETTLEMENT_DICE.structure
    ];

  if (!diceConfig) {
    // Fallback to d8 for unknown settlement types
    const fallbackConfig = { dice: "d8", modifier: 0 };
    const totalModifier = fallbackConfig.modifier + modifier;
    const notation = buildDiceNotation(fallbackConfig.dice, totalModifier);
    const diceRoll = rollDice({
      notation,
      context: `Employees (${mappedSettlement})`,
    });
    const result = lookupTableValue(EMPLOYEES_TABLE, diceRoll.result);
    return { employees: result, roll: diceRoll.result };
  }

  const totalModifier = diceConfig.modifier + modifier;
  const notation = buildDiceNotation(diceConfig.dice, totalModifier);
  const diceRoll = rollDice({
    notation,
    context: `Employees (${mappedSettlement})`,
  });
  const result = lookupTableValue(EMPLOYEES_TABLE, diceRoll.result);

  return { employees: result, roll: diceRoll.result };
}

// Function to map government relations table results to enum values
function mapGovernmentRelationToEnum(tableResult: string): RelationLevel {
  switch (tableResult) {
    case "Péssima":
      return RelationLevel.PESSIMA;
    case "Ruim":
      return RelationLevel.RUIM;
    case "Ruim, mas tentam manter a cordialidade":
      return RelationLevel.RUIM_CORDIAL;
    case "Diplomática":
      return RelationLevel.DIPLOMATICA;
    case "Boa, mas o governo tenta miná-los secretamente":
      return RelationLevel.BOA_TENSAO;
    case "Boa":
      return RelationLevel.BOA;
    case "Muito boa, cooperam frequentemente":
      return RelationLevel.MUITO_BOA;
    case "Excelente, governo e guilda são quase como um":
      return RelationLevel.EXCELENTE;
    default:
      return RelationLevel.DIPLOMATICA;
  }
}

// Function to map population relations table results to enum values
function mapPopulationRelationToEnum(tableResult: string): RelationLevel {
  switch (tableResult) {
    case "Péssima, puro ódio":
      return RelationLevel.PESSIMA;
    case "Ruim, vistos como mercenários":
      return RelationLevel.RUIM;
    case "Ruim, só causam problemas":
      return RelationLevel.RUIM_PROBLEMAS;
    case "Opinião dividida":
      return RelationLevel.OPINIAO_DIVIDIDA;
    case "Boa, ajudam com problemas":
      return RelationLevel.BOA_AJUDAM;
    case "Boa, nos mantêm seguros":
      return RelationLevel.BOA_SEGUROS;
    case "Muito boa, sem eles estaríamos perdidos":
      return RelationLevel.MUITO_BOA_PERDIDOS;
    case "Excelente, a guilda faz o assentamento funcionar":
      return RelationLevel.EXCELENTE_FUNCIONAR;
    default:
      return RelationLevel.OPINIAO_DIVIDIDA;
  }
}

/**
 * Generates government relations for guild structure
 */
export function generateStructureGovernmentRelations(
  settlementType: SettlementType,
  modifier: number = 0
): {
  relation: string;
  roll: number;
} {
  // Get settlement-specific dice configuration
  const mappedSettlement = mapSettlementType(settlementType);
  const diceConfig =
    SETTLEMENT_DICE.structure[
      mappedSettlement as keyof typeof SETTLEMENT_DICE.structure
    ];

  // Use settlement dice or fallback to d20
  const baseDice = diceConfig ? diceConfig.dice : "d20";
  const baseModifier = diceConfig ? diceConfig.modifier : 0;
  const totalModifier = baseModifier + modifier;

  const notation = buildDiceNotation(baseDice, totalModifier);
  const diceRoll = rollDice({
    notation,
    context: `Government relations (${mappedSettlement})`,
  });
  const tableResult = findTableEntry(
    GOVERNMENT_RELATIONS_TABLE,
    diceRoll.result
  );
  const enumValue = mapGovernmentRelationToEnum(tableResult || "Diplomática");

  return { relation: enumValue, roll: diceRoll.result };
}

/**
 * Generates population relations for guild structure
 */
export function generateStructurePopulationRelations(
  settlementType: SettlementType,
  modifier: number = 0
): {
  relation: string;
  roll: number;
} {
  // Get settlement-specific dice configuration
  const mappedSettlement = mapSettlementType(settlementType);
  const diceConfig =
    SETTLEMENT_DICE.structure[
      mappedSettlement as keyof typeof SETTLEMENT_DICE.structure
    ];

  // Use settlement dice or fallback to d20
  const baseDice = diceConfig ? diceConfig.dice : "d20";
  const baseModifier = diceConfig ? diceConfig.modifier : 0;
  const totalModifier = baseModifier + modifier;

  const notation = buildDiceNotation(baseDice, totalModifier);
  const diceRoll = rollDice({
    notation,
    context: `Population relations (${mappedSettlement})`,
  });
  const tableResult = findTableEntry(
    POPULATION_RELATIONS_TABLE,
    diceRoll.result
  );
  const enumValue = mapPopulationRelationToEnum(
    tableResult || "Opinião dividida"
  );

  return { relation: enumValue, roll: diceRoll.result };
}

/**
 * Generates visitor frequency based on settlement type and modifiers
 */
export function generateVisitors(
  settlementType: SettlementType,
  modifier: number = 0
): { frequency: VisitorLevel; roll: number } {
  // Use settlement-specific dice based on the markdown rules
  const mappedSettlement = mapSettlementType(settlementType);
  const diceConfig =
    SETTLEMENT_DICE.visitors[
      mappedSettlement as keyof typeof SETTLEMENT_DICE.visitors
    ];

  // Use the unified frequency table - let the dice result determine what we can get
  const frequencyTable = VISITORS_FREQUENCY_TABLE;

  if (!diceConfig) {
    // Fallback to d8 for unknown settlement types
    const fallbackConfig = { dice: "d8", modifier: 0 };
    const finalModifier = (fallbackConfig.modifier || 0) + modifier;
    const notation = buildDiceNotation(fallbackConfig.dice, finalModifier);
    const diceRoll = rollDice({
      notation,
      context: `Visitor frequency (${mappedSettlement})`,
    });
    const clampedRoll = Math.max(1, diceRoll.result);
    const result = findTableEntry(frequencyTable, clampedRoll);
    return {
      frequency: mapVisitorStringToEnum(result || "Nem muito nem pouco"),
      roll: clampedRoll,
    };
  }

  const finalModifier = (diceConfig.modifier || 0) + modifier;
  const notation = buildDiceNotation(diceConfig.dice, finalModifier);
  const diceRoll = rollDice({
    notation,
    context: `Visitor frequency (${mappedSettlement})`,
  });
  const clampedRoll = Math.max(1, diceRoll.result);
  const result = findTableEntry(frequencyTable, clampedRoll);

  return {
    frequency: mapVisitorStringToEnum(result || "Nem muito nem pouco"),
    roll: clampedRoll,
  };
}

/**
 * Maps visitor string to enum
 */
function mapVisitorStringToEnum(visitorString: string): VisitorLevel {
  switch (visitorString) {
    case "Vazia":
      return VisitorLevel.VAZIA;
    case "Quase deserta":
      return VisitorLevel.QUASE_DESERTA;
    case "Pouco movimentada":
      return VisitorLevel.POUCO_MOVIMENTADA;
    case "Nem muito nem pouco":
      return VisitorLevel.NEM_MUITO_NEM_POUCO;
    case "Muito frequentada":
      return VisitorLevel.MUITO_FREQUENTADA;
    case "Abarrotada":
      return VisitorLevel.ABARROTADA;
    case "Lotada":
      return VisitorLevel.LOTADA;
    default:
      return VisitorLevel.NEM_MUITO_NEM_POUCO;
  }
}

/**
 * Generates guild resources based on settlement type and modifiers
 */
export function generateResources(
  settlementType: SettlementType,
  modifier: number = 0
): { level: ResourceLevel; roll: number } {
  // Use settlement-specific dice based on the markdown rules
  const mappedSettlement = mapSettlementType(settlementType);
  const diceConfig =
    SETTLEMENT_DICE.structure[
      mappedSettlement as keyof typeof SETTLEMENT_DICE.structure
    ];

  // Use the unified resource table - let the dice result determine what we can get
  const resourceTable = RESOURCES_LEVEL_TABLE;

  if (!diceConfig) {
    // Fallback to d8 for unknown settlement types
    const fallbackConfig = { dice: "d8", modifier: 0 };
    const totalModifier = fallbackConfig.modifier + modifier;
    const notation = buildDiceNotation(fallbackConfig.dice, totalModifier);
    const diceRoll = rollDice({
      notation,
      context: `Resources (${mappedSettlement})`,
    });
    const clampedRoll = Math.max(1, diceRoll.result);
    const result = findTableEntry(resourceTable, clampedRoll);
    return {
      level: mapResourceStringToEnum(result || "Limitados"),
      roll: clampedRoll,
    };
  }

  const totalModifier = diceConfig.modifier + modifier;
  const notation = buildDiceNotation(diceConfig.dice, totalModifier);
  const diceRoll = rollDice({
    notation,
    context: `Resources (${mappedSettlement})`,
  });
  const clampedRoll = Math.max(1, diceRoll.result);
  const result = findTableEntry(resourceTable, clampedRoll);

  return {
    level: mapResourceStringToEnum(result || "Limitados"),
    roll: clampedRoll,
  };
}

/**
 * Maps resource string to enum
 */
function mapResourceStringToEnum(resourceString: string): ResourceLevel {
  switch (resourceString) {
    case "Em débito":
      return ResourceLevel.EM_DEBITO;
    case "Nenhum":
      return ResourceLevel.NENHUM;
    case "Escassos":
      return ResourceLevel.ESCASSOS;
    case "Escassos e obtidos com muito esforço e honestidade":
      return ResourceLevel.ESCASSOS_HONESTOS;
    case "Limitados":
      return ResourceLevel.LIMITADOS;
    case "Suficientes":
      return ResourceLevel.SUFICIENTES;
    case "Excedentes":
      return ResourceLevel.EXCEDENTES;
    case "Excedentes mas alimenta fins malignos":
      return ResourceLevel.EXCEDENTES_MALIGNOS;
    case "Abundantes porém quase todo vindo do governo de um assentamento próximo":
      return ResourceLevel.ABUNDANTES_GOVERNO;
    case "Abundantes":
      return ResourceLevel.ABUNDANTES;
    case "Abundantes vindos de muitos anos de serviço":
      return ResourceLevel.ABUNDANTES_SERVICO;
    default:
      return ResourceLevel.LIMITADOS;
  }
}

/**
 * Applies modifiers based on guild features
 */
function calculateModifiers(
  employees: string,
  resourceLevel: ResourceLevel,
  governmentRelation?: string,
  populationRelation?: string
): {
  structureModifier: number;
  visitorsModifier: number;
  resourceModifier: number;
} {
  const structureModifier = 0;
  let visitorsModifier = 0;
  let resourceModifier = 0;

  // Employee modifiers for visitors
  visitorsModifier = ModifierCalculator.calculateVisitorModifiers(
    employees,
    resourceLevel
  );

  // Resource modifiers come from government and population relations
  if (governmentRelation && populationRelation) {
    // Mapear strings para enums se necessário
    const govRelation = governmentRelation as RelationLevel;
    const popRelation = populationRelation as RelationLevel;
    resourceModifier = ModifierCalculator.calculateResourceModifiers(
      govRelation,
      popRelation
    );
  }

  // Government relation modifiers for resources
  if (governmentRelation) {
    const govModifierValue = (
      RESOURCE_MODIFIERS.government as Record<string, number>
    )[governmentRelation];
    if (govModifierValue !== undefined) {
      resourceModifier += govModifierValue;
    }
  }

  // Population relation modifiers for resources
  if (populationRelation) {
    const popModifierValue = (
      RESOURCE_MODIFIERS.population as Record<string, number>
    )[populationRelation];
    if (popModifierValue !== undefined) {
      resourceModifier += popModifierValue;
    }
  }

  return {
    structureModifier,
    visitorsModifier,
    resourceModifier,
  };
}

/**
 * Main function to generate a complete guild structure
 */
export function generateGuildStructure(
  config: GuildGenerationConfig
): GuildGenerationResult {
  const logs: string[] = [];
  logs.push(
    `[GUILD GENERATOR] Starting guild generation for ${config.settlementType}`
  );

  // Log custom modifiers if provided
  if (config.customModifiers) {
    const structureMod = config.customModifiers.structure || 0;
    logs.push(
      `Applied custom structure modifiers: size=${structureMod >= 0 ? "+" : ""}${structureMod}`
    );
  }

  // Step 1: Generate headquarters type (Normal or Sede Matriz)
  const headquartersTypeResult = generateHeadquartersType(
    config.settlementType
  );
  const headquartersModifier = headquartersTypeResult.isHeadquarters ? 5 : 0;
  logs.push(
    `Headquarters type: ${headquartersTypeResult.roll} -> ${headquartersTypeResult.isHeadquarters ? "Sede Matriz (+5 to all rolls)" : "Sede Normal"}`
  );

  // Step 2: Generate employees with headquarters modifier
  const employeesResult = generateEmployees(
    config.settlementType,
    headquartersModifier
  );
  logs.push(
    `Employees rolled: ${employeesResult.roll} -> ${employeesResult.employees}`
  );

  // Step 3: Generate base relations (headquarters modifier applied internally if needed)
  const governmentResult = generateStructureGovernmentRelations(
    config.settlementType,
    headquartersModifier
  );
  logs.push(
    `Government relations: ${governmentResult.roll} -> ${governmentResult.relation}`
  );

  const populationResult = generateStructurePopulationRelations(
    config.settlementType,
    headquartersModifier
  );
  logs.push(
    `Population relations: ${populationResult.roll} -> ${populationResult.relation}`
  );

  // Step 3: Calculate resource modifiers based on relations
  const relationModifiers = calculateModifiers(
    employeesResult.employees,
    ResourceLevel.LIMITADOS, // temporary
    governmentResult.relation,
    populationResult.relation
  );

  // Step 4: Generate resources with relation modifiers and headquarters bonus
  const totalResourceModifier =
    relationModifiers.resourceModifier + headquartersModifier;
  const resourcesResult = generateResources(
    config.settlementType,
    totalResourceModifier
  );
  logs.push(
    `Resources rolled: ${resourcesResult.roll} -> ${resourcesResult.level}`
  );

  // Step 5: Calculate final modifiers for visitors
  const finalModifiers = calculateModifiers(
    employeesResult.employees,
    resourcesResult.level
  );
  logs.push(
    `Calculated modifiers: visitor=${finalModifiers.visitorsModifier >= 0 ? "+" : ""}${finalModifiers.visitorsModifier}, resource=${relationModifiers.resourceModifier >= 0 ? "+" : ""}${relationModifiers.resourceModifier}`
  );

  // Step 6: Generate headquarters size with headquarters modifier
  const customStructureModifier = config.customModifiers?.structure || 0;
  const totalSizeModifier = headquartersModifier + customStructureModifier;
  const sizeResult = generateHeadquartersSize(
    config.settlementType,
    totalSizeModifier
  );
  logs.push(
    `Headquarters size: ${sizeResult.roll} -> ${sizeResult.size}${headquartersModifier > 0 ? " (with Sede Matriz bonus)" : ""}`
  );

  const characteristicsResult = generateHeadquartersCharacteristics(
    sizeResult.roll,
    config.settlementType,
    headquartersModifier
  );
  logs.push(
    `Headquarters characteristics: ${characteristicsResult.characteristics.join(", ")}`
  );

  // Step 7: Generate visitors with final modifiers
  const totalVisitorsModifier =
    finalModifiers.visitorsModifier + headquartersModifier;
  const visitorsResult = generateVisitors(
    config.settlementType,
    totalVisitorsModifier
  );
  logs.push(`Visitors: ${visitorsResult.roll} -> ${visitorsResult.frequency}`);

  // Create the guild object
  const guild: Guild = {
    id: `temp_${Date.now()}`,
    name: "Guilda Temporária",
    structure: {
      size: sizeResult.size,
      characteristics: characteristicsResult.characteristics,
      isHeadquarters: headquartersTypeResult.isHeadquarters,
    },
    relations: {
      government: governmentResult.relation as RelationLevel,
      population: populationResult.relation as RelationLevel,
    },
    staff: {
      employees: employeesResult.employees,
    },
    visitors: {
      frequency: visitorsResult.frequency,
    },
    resources: {
      level: resourcesResult.level,
    },
    settlementType: config.settlementType,
    createdAt: new Date(),
  };

  const result: GuildGenerationResult = {
    guild,
    rolls: {
      structure: {
        size: sizeResult.roll,
        characteristics: characteristicsResult.rolls,
      },
      relations: {
        government: governmentResult.roll,
        population: populationResult.roll,
      },
      staff: employeesResult.roll,
      visitors: visitorsResult.roll,
      resources: resourcesResult.roll,
    },
    logs,
  };

  logs.push(`[GUILD GENERATOR] Guild generation completed successfully`);

  return result;
}

// Backward compatibility - keeping the class structure
export class GuildStructureGenerator {
  static generate(): GuildGenerationResult {
    return generateGuildStructure({
      settlementType: "Cidade Pequena" as SettlementType,
    });
  }
}
