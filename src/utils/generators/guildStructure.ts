import type {
  Guild,
  GuildGenerationConfig,
  GuildGenerationResult,
} from "../../types/guild";
import {
  ResourceLevel,
  SettlementType,
} from "../../types/guild";
import { rollDice } from "../dice";
import { rollOnTable } from "../tableRoller";
import type { TableEntry } from "../../types/tables";
import {
  HEADQUARTERS_SIZE_TABLE,
  HEADQUARTERS_CHARACTERISTICS_TABLE,
  EMPLOYEES_TABLE,
  VISITORS_FREQUENCY_TABLE,
  GOVERNMENT_RELATIONS_TABLE,
  POPULATION_RELATIONS_TABLE,
  RESOURCES_LEVEL_TABLE,
  SETTLEMENT_DICE,
} from "../../data/tables/guild-structure";

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
    [SettlementType.ALDEIA]: "Aldeia", 
    [SettlementType.CIDADE_PEQUENA]: "Cidadela",
    [SettlementType.CIDADE_GRANDE]: "Cidade grande",
    [SettlementType.METROPOLE]: "Metrópole",
  };
  return mapping[settlementType] || "Aldeia";
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
    const fallbackConfig = { dice: 'd8', modifier: 0 };
    const notation = `1${fallbackConfig.dice}${fallbackConfig.modifier + modifier >= 0 ? "+" : ""}${fallbackConfig.modifier + modifier}`;
    const diceRoll = rollDice({ notation });
    const size = lookupTableValue(HEADQUARTERS_SIZE_TABLE, diceRoll.result);
    return { size, roll: diceRoll.result };
  }
  
  const notation = `1${diceConfig.dice}${diceConfig.modifier + modifier >= 0 ? "+" : ""}${diceConfig.modifier + modifier}`;
  const diceRoll = rollDice({ notation });
  const size = lookupTableValue(HEADQUARTERS_SIZE_TABLE, diceRoll.result);

  return { size, roll: diceRoll.result };
}

/**
 * Generates headquarters characteristics based on size roll
 */
export function generateHeadquartersCharacteristics(sizeRoll: number): {
  characteristics: string[];
  rolls: number[];
} {
  const characteristics: string[] = [];
  const rolls: number[] = [];

  // Determine number of characteristics based on size roll
  let numCharacteristics = 1;
  if (sizeRoll >= 15) numCharacteristics = 3;
  else if (sizeRoll >= 10) numCharacteristics = 2;

  for (let i = 0; i < numCharacteristics; i++) {
    const diceRoll = rollDice({ notation: "d20" });
    const result = lookupTableValue(HEADQUARTERS_CHARACTERISTICS_TABLE, diceRoll.result);

    // Avoid duplicates
    if (!characteristics.includes(result)) {
      characteristics.push(result);
      rolls.push(diceRoll.result);
    } else {
      // Re-roll if duplicate
      i--;
    }
  }

  return { characteristics, rolls };
}

/**
 * Generates employees for the guild
 */
export function generateEmployees(): { employees: string; roll: number } {
  const diceRoll = rollDice({ notation: "d20" });
  const result = lookupTableValue(EMPLOYEES_TABLE, diceRoll.result);

  return { employees: result, roll: diceRoll.result };
}

/**
 * Generates government relations for guild structure
 */
export function generateStructureGovernmentRelations(modifier: number = 0): {
  relation: string;
  roll: number;
} {
  const diceRoll = rollDice({
    notation: `d12${modifier >= 0 ? "+" : ""}${modifier}`,
  });
  const result = rollOnTable(GOVERNMENT_RELATIONS_TABLE);

  return { relation: result.result, roll: diceRoll.result };
}

/**
 * Generates population relations for guild structure
 */
export function generateStructurePopulationRelations(modifier: number = 0): {
  relation: string;
  roll: number;
} {
  const diceRoll = rollDice({
    notation: `d12${modifier >= 0 ? "+" : ""}${modifier}`,
  });
  const result = rollOnTable(POPULATION_RELATIONS_TABLE);

  return { relation: result.result, roll: diceRoll.result };
}

/**
 * Generates visitor frequency based on settlement type and modifiers
 */
export function generateVisitors(
  settlementType: SettlementType,
  modifier: number = 0
): { frequency: string; roll: number } {
  const mappedSettlement = mapSettlementType(settlementType);
  const diceConfig =
    SETTLEMENT_DICE.visitors[
      mappedSettlement as keyof typeof SETTLEMENT_DICE.visitors
    ];
  
  if (!diceConfig) {
    // Fallback to d8 for unknown settlement types
    const fallbackConfig = { dice: 'd8', modifier: 0 };
    const notation = `1${fallbackConfig.dice}${fallbackConfig.modifier + modifier >= 0 ? "+" : ""}${fallbackConfig.modifier + modifier}`;
    const diceRoll = rollDice({ notation });
    const frequency = lookupTableValue(VISITORS_FREQUENCY_TABLE, diceRoll.result);
    return { frequency, roll: diceRoll.result };
  }
  
  const notation = `1${diceConfig.dice}${diceConfig.modifier + modifier >= 0 ? "+" : ""}${diceConfig.modifier + modifier}`;
  const diceRoll = rollDice({ notation });
  const frequency = lookupTableValue(VISITORS_FREQUENCY_TABLE, diceRoll.result);

  return { frequency, roll: diceRoll.result };
}

/**
 * Generates guild resources
 */
export function generateResources(): { level: ResourceLevel; roll: number } {
  const diceRoll = rollDice({ notation: "d20" });
  const result = lookupTableValue(RESOURCES_LEVEL_TABLE, diceRoll.result);

  // Convert string to enum using proper mapping
  let resourceLevel: ResourceLevel;
  switch (result) {
    case "Em débito":
      resourceLevel = ResourceLevel.EM_DEBITO;
      break;
    case "Nenhum":
      resourceLevel = ResourceLevel.NENHUM;
      break;
    case "Escassos":
      resourceLevel = ResourceLevel.ESCASSOS;
      break;
    case "Escassos e obtidos com muito esforço e honestidade":
      resourceLevel = ResourceLevel.ESCASSOS_HONESTOS;
      break;
    case "Limitados":
      resourceLevel = ResourceLevel.LIMITADOS;
      break;
    case "Suficientes":
      resourceLevel = ResourceLevel.SUFICIENTES;
      break;
    case "Excedentes":
      resourceLevel = ResourceLevel.EXCEDENTES;
      break;
    case "Excedentes mas alimenta fins malignos":
      resourceLevel = ResourceLevel.EXCEDENTES_MALIGNOS;
      break;
    case "Abundantes porém quase todo vindo do governo de um assentamento próximo":
      resourceLevel = ResourceLevel.ABUNDANTES_GOVERNO;
      break;
    case "Abundantes":
      resourceLevel = ResourceLevel.ABUNDANTES;
      break;
    case "Abundantes vindos de muitos anos de serviço":
      resourceLevel = ResourceLevel.ABUNDANTES_SERVICO;
      break;
    default:
      resourceLevel = ResourceLevel.LIMITADOS;
      break;
  }

  return { level: resourceLevel, roll: diceRoll.result };
}

/**
 * Applies modifiers based on guild features
 */
function calculateModifiers(
  employees: string,
  resources: ResourceLevel
): {
  structureModifier: number;
  visitorsModifier: number;
  governmentModifier: number;
  populationModifier: number;
} {
  const structureModifier = 0;
  const visitorsModifier = 0;
  let governmentModifier = 0;
  let populationModifier = 0;

  // Employee modifiers
  if (employees.includes("despreparado")) {
    populationModifier -= 1;
    governmentModifier -= 1;
  } else if (employees.includes("experiente")) {
    populationModifier += 1;
    governmentModifier += 1;
  }

  // Resource modifiers
  switch (resources) {
    case ResourceLevel.EM_DEBITO:
    case ResourceLevel.NENHUM:
      governmentModifier -= 3;
      populationModifier -= 3;
      break;
    case ResourceLevel.ESCASSOS:
    case ResourceLevel.ESCASSOS_HONESTOS:
      governmentModifier -= 2;
      populationModifier -= 2;
      break;
    case ResourceLevel.LIMITADOS:
      governmentModifier -= 1;
      populationModifier -= 1;
      break;
    case ResourceLevel.EXCEDENTES:
    case ResourceLevel.EXCEDENTES_MALIGNOS:
      governmentModifier += 1;
      populationModifier += 1;
      break;
    case ResourceLevel.ABUNDANTES:
    case ResourceLevel.ABUNDANTES_GOVERNO:
    case ResourceLevel.ABUNDANTES_SERVICO:
      governmentModifier += 2;
      populationModifier += 2;
      break;
    case ResourceLevel.SUFICIENTES:
    default:
      // Sufficient resources: no modifiers
      break;
  }

  return {
    structureModifier,
    visitorsModifier,
    governmentModifier,
    populationModifier,
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

  // Step 1: Generate resources first (influences other aspects)
  const resourcesResult = generateResources();
  logs.push(
    `Resources rolled: ${resourcesResult.roll} -> ${resourcesResult.level}`
  );

  // Step 2: Generate employees
  const employeesResult = generateEmployees();
  logs.push(
    `Employees rolled: ${employeesResult.roll} -> ${employeesResult.employees}`
  );

  // Step 3: Calculate modifiers
  const modifiers = calculateModifiers(
    employeesResult.employees,
    resourcesResult.level
  );
  logs.push(
    `Calculated modifiers: structure ${modifiers.structureModifier >= 0 ? "+" : ""}${modifiers.structureModifier}, visitors ${modifiers.visitorsModifier >= 0 ? "+" : ""}${modifiers.visitorsModifier}`
  );

  // Step 4: Generate headquarters with modifiers
  const sizeResult = generateHeadquartersSize(
    config.settlementType,
    modifiers.structureModifier
  );
  logs.push(`Headquarters size: ${sizeResult.roll} -> ${sizeResult.size}`);

  const characteristicsResult = generateHeadquartersCharacteristics(
    sizeResult.roll
  );
  logs.push(
    `Headquarters characteristics: ${characteristicsResult.characteristics.join(", ")}`
  );

  // Step 5: Generate relations with modifiers
  const governmentResult = generateStructureGovernmentRelations(
    modifiers.governmentModifier
  );
  logs.push(
    `Government relations: ${governmentResult.roll} -> ${governmentResult.relation}`
  );

  const populationResult = generateStructurePopulationRelations(
    modifiers.populationModifier
  );
  logs.push(
    `Population relations: ${populationResult.roll} -> ${populationResult.relation}`
  );

  // Step 6: Generate visitors with modifiers
  const visitorsResult = generateVisitors(
    config.settlementType,
    modifiers.visitorsModifier
  );
  logs.push(
    `Visitors frequency: ${visitorsResult.roll} -> ${visitorsResult.frequency}`
  );

  // Create the guild object
  const guild: Guild = {
    id: `temp_${Date.now()}`,
    name: "Guilda Temporária",
    structure: {
      size: sizeResult.size,
      characteristics: characteristicsResult.characteristics,
    },
    relations: {
      government: governmentResult.relation,
      population: populationResult.relation,
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
