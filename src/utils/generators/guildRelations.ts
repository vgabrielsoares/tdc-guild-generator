import type {
  GuildRelations,
  GuildResources,
  GuildVisitors,
  SettlementType,
} from "@/types/guild";
import {
  RelationLevel,
  ResourceLevel,
  VisitorLevel,
} from "@/types/guild";
import { rollOnTable } from "@/utils/tableRoller";
import {
  GOVERNMENT_RELATIONS_TABLE,
  POPULATION_RELATIONS_TABLE,
  RESOURCES_LEVEL_TABLE,
  VISITORS_FREQUENCY_TABLE,
  VISITOR_TYPES_TABLE,
  RESOURCE_SPECIALTIES_TABLE,
  getResourceSpecialtiesCount,
  SETTLEMENT_DICE,
} from "@/data/tables/guild-structure";

export interface RelationsGenerationConfig {
  settlementType: SettlementType;
  customModifiers?: {
    governmentMod?: number;
    populationMod?: number;
    resourcesMod?: number;
    visitorsMod?: number;
  };
}

/**
 * Create a custom log message for tracking operations
 */
function createCustomLog(category: string, message: string): void {
  // eslint-disable-next-line no-console
  console.log(`[${category}] ${message}`);
}

/**
 * Generate government relations for the guild
 */
export function generateGovernmentRelations(
  config: RelationsGenerationConfig
): RelationLevel {
  const modifiers = config.customModifiers?.governmentMod
    ? [
        {
          name: "Custom Modifier",
          value: config.customModifiers.governmentMod,
          description: "Custom government modifier",
        },
      ]
    : [];

  const result = rollOnTable(GOVERNMENT_RELATIONS_TABLE, modifiers);

  createCustomLog(
    "GUILD RELATIONS",
    `Government: ${result.result} (rolled ${result.finalRoll})`
  );
  return stringToRelationLevel(result.result);
}

/**
 * Generate population relations for the guild
 */
export function generatePopulationRelations(
  config: RelationsGenerationConfig
): RelationLevel {
  const modifiers = config.customModifiers?.populationMod
    ? [
        {
          name: "Custom Modifier",
          value: config.customModifiers.populationMod,
          description: "Custom population modifier",
        },
      ]
    : [];

  const result = rollOnTable(POPULATION_RELATIONS_TABLE, modifiers);

  createCustomLog(
    "GUILD RELATIONS",
    `Population: ${result.result} (rolled ${result.finalRoll})`
  );
  return stringToRelationLevel(result.result);
}

/**
 * Generate resource level for the guild
 */
export function generateResourceLevel(
  config: RelationsGenerationConfig
): ResourceLevel {
  const modifiers = config.customModifiers?.resourcesMod
    ? [
        {
          name: "Custom Modifier",
          value: config.customModifiers.resourcesMod,
          description: "Custom resources modifier",
        },
      ]
    : [];

  const result = rollOnTable(RESOURCES_LEVEL_TABLE, modifiers);

  createCustomLog(
    "GUILD RESOURCES",
    `Level: ${result.result} (rolled ${result.finalRoll})`
  );
  return stringToResourceLevel(result.result);
}

/**
 * Generate resource specialties based on the resource level
 */
export function generateResourceSpecialties(
  resourceLevel: ResourceLevel
): string[] {
  const count = getResourceSpecialtiesCount(resourceLevel);
  const specialties: string[] = [];
  const usedResults = new Set<string>();

  createCustomLog(
    "GUILD RESOURCES",
    `Generating ${count} specialties for ${resourceLevel} level`
  );

  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let specialty: string;

    do {
      const result = rollOnTable(RESOURCE_SPECIALTIES_TABLE);
      specialty = result.result;
      attempts++;
    } while (usedResults.has(specialty) && attempts < 20);

    if (!usedResults.has(specialty)) {
      specialties.push(specialty);
      usedResults.add(specialty);
      createCustomLog("GUILD RESOURCES", `Specialty ${i + 1}: ${specialty}`);
    }
  }

  return specialties;
}

/**
 * Convert string result to RelationLevel enum
 */
function stringToRelationLevel(value: string): RelationLevel {
  const mapping: Record<string, RelationLevel> = {
    'Hostil': RelationLevel.HOSTIL,
    'Suspeita': RelationLevel.SUSPEITA,
    'Indiferente': RelationLevel.INDIFERENTE,
    'Tolerante': RelationLevel.TOLERANTE,
    'Cooperativa': RelationLevel.COOPERATIVA,
    'Aliada': RelationLevel.ALIADA,
    'Temida': RelationLevel.TEMIDA,
    'Desconfiada': RelationLevel.DESCONFIADA,
    'Respeitada': RelationLevel.RESPEITADA,
    'Admirada': RelationLevel.ADMIRADA,
    'Reverenciada': RelationLevel.REVERENCIADA,
  };
  
  return mapping[value] || RelationLevel.INDIFERENTE;
}

/**
 * Convert string result to ResourceLevel enum
 */
function stringToResourceLevel(value: string): ResourceLevel {
  const mapping: Record<string, ResourceLevel> = {
    'Escassos': ResourceLevel.ESCASSOS,
    'Limitados': ResourceLevel.LIMITADOS,
    'Básicos': ResourceLevel.BÁSICOS,
    'Adequados': ResourceLevel.ADEQUADOS,
    'Abundantes': ResourceLevel.ABUNDANTES,
    'Vastos': ResourceLevel.VASTOS,
    'Lendários': ResourceLevel.LENDARIOS,
  };
  
  return mapping[value] || ResourceLevel.ADEQUADOS;
}

/**
 * Convert string result to VisitorLevel enum
 */
function stringToVisitorLevel(value: string): VisitorLevel {
  const mapping: Record<string, VisitorLevel> = {
    'Vazia': VisitorLevel.VAZIA,
    'Quase deserta': VisitorLevel.QUASE_DESERTA,
    'Pouco movimentada': VisitorLevel.POUCO_MOVIMENTADA,
    'Nem muito nem pouco': VisitorLevel.NEM_MUITO_NEM_POUCO,
    'Muito frequentada': VisitorLevel.MUITO_FREQUENTADA,
    'Abarrotada': VisitorLevel.ABARROTADA,
    'Lotada': VisitorLevel.LOTADA,
  };
  
  return mapping[value] || VisitorLevel.NEM_MUITO_NEM_POUCO;
}

/**
 * Generate visitor frequency level for the guild
 */
export function generateVisitorLevel(
  config: RelationsGenerationConfig
): VisitorLevel {
  // Get settlement-specific dice notation
  const settlementKey = getSettlementKey(config.settlementType);
  const visitorDice = SETTLEMENT_DICE.visitors as Record<
    string,
    { dice: string; modifier: number }
  >;
  const settlementDice = visitorDice[settlementKey];

  if (!settlementDice) {
    createCustomLog(
      "GUILD VISITORS",
      `Unknown settlement type: ${config.settlementType}, using default d8`
    );
  }

  const modifiers = config.customModifiers?.visitorsMod
    ? [
        {
          name: "Custom Modifier",
          value: config.customModifiers.visitorsMod,
          description: "Custom visitors modifier",
        },
      ]
    : [];

  const result = rollOnTable(VISITORS_FREQUENCY_TABLE, modifiers);

  createCustomLog(
    "GUILD VISITORS",
    `Frequency: ${result.result} (rolled ${result.finalRoll})`
  );

  // Convert string result to VisitorLevel enum
  return stringToVisitorLevel(result.result);
}

/**
 * Map SettlementType enum to string keys used in tables
 */
function getSettlementKey(settlementType: SettlementType): string {
  switch (settlementType) {
    case "Cidade Pequena":
      return "Vilarejo";
    case "Cidade Grande":
      return "Cidadela";
    case "Metrópole":
      return "Metrópole";
    case "Lugarejo":
      return "Lugarejo";
    case "Aldeia":
      return "Aldeia";
    default:
      return "Vilarejo";
  }
}

/**
 * Generate visitor types based on visitor level
 */
export function generateVisitorTypes(visitorLevel: VisitorLevel): string[] {
  const count = getVisitorTypesCount(visitorLevel);
  const types: string[] = [];
  const usedTypes = new Set<string>();

  createCustomLog(
    "GUILD VISITORS",
    `Generating ${count} visitor types for ${visitorLevel} level`
  );

  for (let i = 0; i < count; i++) {
    let attempts = 0;
    let visitorType: string;

    do {
      const result = rollOnTable(VISITOR_TYPES_TABLE);
      visitorType = result.result;
      attempts++;
    } while (usedTypes.has(visitorType) && attempts < 20);

    if (!usedTypes.has(visitorType)) {
      types.push(visitorType);
      usedTypes.add(visitorType);
      createCustomLog("GUILD VISITORS", `Type ${i + 1}: ${visitorType}`);
    }
  }

  return types;
}

/**
 * Helper function to determine visitor types count based on level
 */
function getVisitorTypesCount(level: VisitorLevel): number {
  switch (level) {
    case "Vazia":
      return 1;
    case "Quase deserta":
      return 1;
    case "Pouco movimentada":
      return 2;
    case "Nem muito nem pouco":
      return 2;
    case "Muito frequentada":
      return 3;
    case "Abarrotada":
      return 4;
    case "Lotada":
      return 5;
    default:
      return 3;
  }
}

/**
 * Generate complete guild relations
 */
export function generateGuildRelations(
  config: RelationsGenerationConfig
): GuildRelations {
  createCustomLog(
    "GUILD RELATIONS",
    `Generating relations for ${config.settlementType} settlement`
  );

  const government = generateGovernmentRelations(config);
  const population = generatePopulationRelations(config);

  return {
    government,
    population,
  };
}

/**
 * Generate complete guild resources
 */
export function generateGuildResources(
  config: RelationsGenerationConfig
): GuildResources {
  createCustomLog(
    "GUILD RESOURCES",
    `Generating resources for ${config.settlementType} settlement`
  );

  const level = generateResourceLevel(config);
  const details = generateResourceSpecialties(level);

  return {
    level,
    details,
  };
}

/**
 * Generate complete guild visitors
 */
export function generateGuildVisitors(
  config: RelationsGenerationConfig
): GuildVisitors {
  createCustomLog(
    "GUILD VISITORS",
    `Generating visitors for ${config.settlementType} settlement`
  );

  const frequency = generateVisitorLevel(config);
  const types = generateVisitorTypes(frequency);

  return {
    frequency,
    types,
  };
}

/**
 * Main generator class for guild relations
 */
export class GuildRelationsGenerator {
  static generate(config: RelationsGenerationConfig): {
    relations: GuildRelations;
    resources: GuildResources;
    visitors: GuildVisitors;
  } {
    createCustomLog("GUILD RELATIONS", "=".repeat(50));
    createCustomLog("GUILD RELATIONS", "Starting guild relations generation");
    createCustomLog("GUILD RELATIONS", `Settlement: ${config.settlementType}`);
    if (config.customModifiers) {
      createCustomLog(
        "GUILD RELATIONS",
        `Custom modifiers: ${JSON.stringify(config.customModifiers)}`
      );
    }

    const relations = generateGuildRelations(config);
    const resources = generateGuildResources(config);
    const visitors = generateGuildVisitors(config);

    createCustomLog("GUILD RELATIONS", "Guild relations generation completed");
    createCustomLog("GUILD RELATIONS", "=".repeat(50));

    return {
      relations,
      resources,
      visitors,
    };
  }
}
