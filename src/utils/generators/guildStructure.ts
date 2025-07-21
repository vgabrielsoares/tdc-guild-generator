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
 * Maps SettlementType enum to SETTLEMENT_DICE keys
 */
function mapSettlementType(settlementType: SettlementType): string {
  const mapping: Record<SettlementType, string> = {
    [SettlementType.LUGAREJO]: "Lugarejo",
    [SettlementType.ALDEIA]: "Aldeia",
    [SettlementType.CIDADE_PEQUENA]: "Cidade grande",
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
  const diceRoll = rollDice({
    notation: `${diceConfig.dice}${diceConfig.modifier + modifier >= 0 ? "+" : ""}${diceConfig.modifier + modifier}`,
  });
  const result = rollOnTable(HEADQUARTERS_SIZE_TABLE);

  return { size: result.result, roll: diceRoll.result };
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
    const diceRoll = rollDice({ notation: "d25" });
    const result = rollOnTable(HEADQUARTERS_CHARACTERISTICS_TABLE);

    // Avoid duplicates
    if (!characteristics.includes(result.result)) {
      characteristics.push(result.result);
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
  const diceRoll = rollDice({ notation: "d25" });
  const result = rollOnTable(EMPLOYEES_TABLE);

  return { employees: result.result, roll: diceRoll.result };
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
  const diceRoll = rollDice({
    notation: `${diceConfig.dice}${diceConfig.modifier + modifier >= 0 ? "+" : ""}${diceConfig.modifier + modifier}`,
  });
  const result = rollOnTable(VISITORS_FREQUENCY_TABLE);

  return { frequency: result.result, roll: diceRoll.result };
}

/**
 * Generates guild resources
 */
export function generateResources(): { level: ResourceLevel; roll: number } {
  const diceRoll = rollDice({ notation: "d20" });
  const result = rollOnTable(RESOURCES_LEVEL_TABLE);

  // Convert string to enum using proper mapping
  let resourceLevel: ResourceLevel;
  switch (result.result) {
    case "Escassos":
      resourceLevel = ResourceLevel.ESCASSOS;
      break;
    case "Básicos":
      resourceLevel = ResourceLevel.BÁSICOS;
      break;
    case "Adequados":
      resourceLevel = ResourceLevel.ADEQUADOS;
      break;
    case "Abundantes":
      resourceLevel = ResourceLevel.ABUNDANTES;
      break;
    case "Vastos":
      resourceLevel = ResourceLevel.VASTOS;
      break;
    case "Lendários":
      resourceLevel = ResourceLevel.LENDARIOS;
      break;
    default:
      resourceLevel = ResourceLevel.ADEQUADOS;
      break;
  }

  return { level: resourceLevel, roll: diceRoll.result };
}

/**
 * Applies modifiers based on guild features
 */
function calculateModifiers(
  employees: string,
  resources: ResourceLevel,
  customModifiers?: { structure?: number; visitors?: number }
): {
  structureModifier: number;
  visitorsModifier: number;
  governmentModifier: number;
  populationModifier: number;
} {
  let structureModifier = customModifiers?.structure || 0;
  let visitorsModifier = customModifiers?.visitors || 0;
  let governmentModifier = 0;
  let populationModifier = 0;

  // Employee modifiers
  if (employees.includes("despreparado")) {
    visitorsModifier -= 1;
    populationModifier -= 1;
  } else if (employees.includes("experiente")) {
    visitorsModifier += 1;
    populationModifier += 1;
  }

  // Resource modifiers
  switch (resources) {
    case ResourceLevel.ESCASSOS:
      visitorsModifier -= 6;
      structureModifier -= 3;
      governmentModifier -= 2;
      populationModifier -= 2;
      break;
    case ResourceLevel.BÁSICOS:
      visitorsModifier -= 2;
      structureModifier -= 1;
      governmentModifier -= 1;
      populationModifier -= 1;
      break;
    case ResourceLevel.ABUNDANTES:
      visitorsModifier += 3;
      structureModifier += 2;
      governmentModifier += 1;
      populationModifier += 2;
      break;
    case ResourceLevel.VASTOS:
      visitorsModifier += 6;
      structureModifier += 4;
      governmentModifier += 3;
      populationModifier += 3;
      break;
    case ResourceLevel.LENDARIOS:
      visitorsModifier += 9;
      structureModifier += 6;
      governmentModifier += 4;
      populationModifier += 4;
      break;
    case ResourceLevel.ADEQUADOS:
    default:
      // Adequate resources: no modifiers
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
    resourcesResult.level,
    config.customModifiers
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
