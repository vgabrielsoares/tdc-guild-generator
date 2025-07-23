import type {
  GuildRelations,
  GuildResources,
  GuildVisitors,
} from "@/types/guild";
import {
  RelationLevel,
  ResourceLevel,
  VisitorLevel,
  SettlementType,
} from "@/types/guild";
import { rollOnTable } from "@/utils/tableRoller";
import {
  GOVERNMENT_RELATIONS_TABLE,
  POPULATION_RELATIONS_TABLE,
  VISITOR_TYPES_TABLE,
  RESOURCE_SPECIALTIES_TABLE,
  getResourceSpecialtiesCount,
  getVisitorFrequencyTable,
  getResourceLevelTable,
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
 * Mapear resultado da tabela para o enum RelationLevel
 */
function mapToRelationLevel(result: string): RelationLevel {
  // Mapeamento direto dos valores das tabelas para o enum
  const mappings: { [key: string]: RelationLevel } = {
    "Péssima": RelationLevel.PESSIMA,
    "Ruim": RelationLevel.RUIM,
    "Ruim, mas tentam manter a cordialidade": RelationLevel.RUIM_CORDIAL,
    "Ruim, só causam problemas": RelationLevel.RUIM_PROBLEMAS,
    "Diplomática": RelationLevel.DIPLOMATICA,
    "Opinião dividida": RelationLevel.OPINIAO_DIVIDIDA,
    "Boa, mas o governo tenta miná-los secretamente": RelationLevel.BOA_TENSAO,
    "Boa": RelationLevel.BOA,
    "Boa, ajudam com problemas": RelationLevel.BOA_AJUDAM,
    "Boa, nos mantêm seguros": RelationLevel.BOA_SEGUROS,
    "Muito boa, cooperam frequentemente": RelationLevel.MUITO_BOA,
    "Muito boa, sem eles estaríamos perdidos": RelationLevel.MUITO_BOA_PERDIDOS,
    "Excelente, governo e guilda são quase como um": RelationLevel.EXCELENTE,
    "Excelente, a guilda faz o assentamento funcionar": RelationLevel.EXCELENTE_FUNCIONAR,
    "Péssima, puro ódio": RelationLevel.PESSIMA_ODIO,
    "Ruim, vistos como mercenários": RelationLevel.RUIM_MERCENARIOS,
  };

  const mapped = mappings[result];
  if (!mapped) {
    createCustomLog(
      "GUILD RELATIONS",
      `Unmapped relation result "${result}" - falling back to DIPLOMATICA. Consider adding explicit mapping.`
    );
    return RelationLevel.DIPLOMATICA;
  }
  
  return mapped;
}

/**
 * Generate government relations for the guild
 */
export function generateGovernmentRelations(
  config: RelationsGenerationConfig
): { level: RelationLevel; result: string; description: string } {
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

  // Handle 21+ case (Excelente result when roll > 20)
  let finalResult = result.result;
  let finalDescription = result.entry.description || "";
  
  if (result.finalRoll > 20) {
    finalResult = "Excelente, governo e guilda são quase como um";
    finalDescription = "Relação excelente";
  }

  createCustomLog(
    "GUILD RELATIONS",
    `Government: ${finalResult} (rolled ${result.finalRoll})`
  );
  
  return {
    level: stringToRelationLevel(finalResult),
    result: finalResult,
    description: finalDescription
  };
}

/**
 * Generate population relations for the guild
 */
export function generatePopulationRelations(
  config: RelationsGenerationConfig
): { level: RelationLevel; result: string; description: string } {
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

  // Handle 21+ case (Excelente result when roll > 20)
  let finalResult = result.result;
  let finalDescription = result.entry.description || "";
  
  if (result.finalRoll > 20) {
    finalResult = "Excelente, a guilda faz o assentamento funcionar";
    finalDescription = "Reputação excelente";
  }

  createCustomLog(
    "GUILD RELATIONS",
    `Population: ${finalResult} (rolled ${result.finalRoll})`
  );
  
  return {
    level: stringToRelationLevel(finalResult),
    result: finalResult,
    description: finalDescription
  };
}

/**
 * Generate resource level for the guild
 */
export function generateResourceLevel(
  config: RelationsGenerationConfig
): ResourceLevel {
  // Map settlement type to string for table lookup
  const settlementMapping: Record<SettlementType, string> = {
    [SettlementType.LUGAREJO]: "Lugarejo",
    [SettlementType.ALDEIA]: "Aldeia",
    [SettlementType.CIDADE_PEQUENA]: "Cidadela",
    [SettlementType.CIDADE_GRANDE]: "Cidade grande",
    [SettlementType.METROPOLE]: "Metrópole",
  };

  const settlementKey = settlementMapping[config.settlementType] || "Aldeia";
  const resourceTable = getResourceLevelTable(settlementKey);

  const modifiers = config.customModifiers?.resourcesMod
    ? [
        {
          name: "Custom Modifier",
          value: config.customModifiers.resourcesMod,
          description: "Custom resources modifier",
        },
      ]
    : [];

  const result = rollOnTable(resourceTable, modifiers);

  // Handle 21+ case (Abundantes vindos de muitos anos de serviço when roll > 20)
  let finalResult = result.result as string;
  
  if (result.finalRoll > 20) {
    finalResult = "Abundantes vindos de muitos anos de serviço";
  }

  createCustomLog(
    "GUILD RESOURCES",
    `Level: ${finalResult} (rolled ${result.finalRoll})`
  );
  return stringToResourceLevel(finalResult);
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
  const exactMapping: Record<string, RelationLevel> = {
    'Péssima': RelationLevel.PESSIMA,
    'Péssima, puro ódio': RelationLevel.PESSIMA_ODIO,
    'Ruim': RelationLevel.RUIM,
    'Ruim, vistos como mercenários': RelationLevel.RUIM_MERCENARIOS,
    'Ruim, mas tentam manter a cordialidade': RelationLevel.RUIM_CORDIAL,
    'Ruim, só causam problemas': RelationLevel.RUIM_PROBLEMAS,
    'Diplomática': RelationLevel.DIPLOMATICA,
    'Opinião dividida': RelationLevel.OPINIAO_DIVIDIDA,
    'Boa, mas o governo tenta miná-los secretamente': RelationLevel.BOA_TENSAO,
    'Boa': RelationLevel.BOA,
    'Boa, ajudam com problemas': RelationLevel.BOA_AJUDAM,
    'Boa, nos mantêm seguros': RelationLevel.BOA_SEGUROS,
    'Muito boa, cooperam frequentemente': RelationLevel.MUITO_BOA,
    'Muito boa, sem eles estaríamos perdidos': RelationLevel.MUITO_BOA_PERDIDOS,
    'Excelente, governo e guilda são quase como um': RelationLevel.EXCELENTE,
    'Excelente, a guilda faz o assentamento funcionar': RelationLevel.EXCELENTE_FUNCIONAR,
  };
  
  const mapped = exactMapping[value];
  if (!mapped) {
    createCustomLog(
      "GUILD RELATIONS",
      `Unmapped relation value "${value}" in stringToRelationLevel - falling back to DIPLOMATICA. Consider adding explicit mapping.`
    );
    return RelationLevel.DIPLOMATICA;
  }
  
  return mapped;
}

/**
 * Convert string result to ResourceLevel enum
 */
function stringToResourceLevel(value: string): ResourceLevel {
  const mapping: Record<string, ResourceLevel> = {
    'Em débito': ResourceLevel.EM_DEBITO,
    'Nenhum': ResourceLevel.NENHUM,
    'Escassos': ResourceLevel.ESCASSOS,
    'Escassos e obtidos com muito esforço e honestidade': ResourceLevel.ESCASSOS_HONESTOS,
    'Limitados': ResourceLevel.LIMITADOS,
    'Suficientes': ResourceLevel.SUFICIENTES,
    'Excedentes': ResourceLevel.EXCEDENTES,
    'Excedentes mas alimenta fins malignos': ResourceLevel.EXCEDENTES_MALIGNOS,
    'Abundantes porém quase todo vindo do governo de um assentamento próximo': ResourceLevel.ABUNDANTES_GOVERNO,
    'Abundantes': ResourceLevel.ABUNDANTES,
    'Abundantes vindos de muitos anos de serviço': ResourceLevel.ABUNDANTES_SERVICO,
  };
  
  return mapping[value] || ResourceLevel.LIMITADOS;
}

/**
 * Convert string result to VisitorLevel enum
 */
function stringToVisitorLevel(value: string): VisitorLevel {
  // Use exact match first, then fallback to contains
  const exactMapping: Record<string, VisitorLevel> = {
    'Vazia': VisitorLevel.VAZIA,
    'Quase deserta': VisitorLevel.QUASE_DESERTA,
    'Pouco movimentada': VisitorLevel.POUCO_MOVIMENTADA,
    'Nem muito nem pouco': VisitorLevel.NEM_MUITO_NEM_POUCO,
    'Muito frequentada': VisitorLevel.MUITO_FREQUENTADA,
    'Abarrotada': VisitorLevel.ABARROTADA,
    'Lotada': VisitorLevel.LOTADA,
  };
  
  return exactMapping[value] || VisitorLevel.NEM_MUITO_NEM_POUCO;
}

/**
 * Generate visitor frequency level for the guild
 */
export function generateVisitorLevel(
  config: RelationsGenerationConfig
): VisitorLevel {
  // Map settlement type to string for table lookup
  const settlementMapping: Record<SettlementType, string> = {
    [SettlementType.LUGAREJO]: "Lugarejo",
    [SettlementType.ALDEIA]: "Aldeia",
    [SettlementType.CIDADE_PEQUENA]: "Cidadela",
    [SettlementType.CIDADE_GRANDE]: "Cidade grande",
    [SettlementType.METROPOLE]: "Metrópole",
  };

  const settlementKey = settlementMapping[config.settlementType] || "Aldeia";
  const visitorsTable = getVisitorFrequencyTable(settlementKey);

  const modifiers = config.customModifiers?.visitorsMod
    ? [
        {
          name: "Custom Modifier",
          value: config.customModifiers.visitorsMod,
          description: "Custom visitors modifier",
        },
      ]
    : [];

  const result = rollOnTable(visitorsTable, modifiers);

  // Handle 20+ case (Lotada when roll > 20)
  let finalResult = result.result as string;
  
  if (result.finalRoll > 20) {
    finalResult = "Lotada";
  }

  createCustomLog(
    "GUILD VISITORS",
    `Frequency: ${finalResult} (rolled ${result.finalRoll})`
  );

  // Convert string result to VisitorLevel enum
  return stringToVisitorLevel(finalResult);
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
    case VisitorLevel.VAZIA:
      return 0;
    case VisitorLevel.QUASE_DESERTA:
      return 1;
    case VisitorLevel.POUCO_MOVIMENTADA:
      return 2;
    case VisitorLevel.NEM_MUITO_NEM_POUCO:
      return 3;
    case VisitorLevel.MUITO_FREQUENTADA:
      return 4;
    case VisitorLevel.ABARROTADA:
      return 5;
    case VisitorLevel.LOTADA:
      return 6;
    default:
      return 2;
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
    government: mapToRelationLevel(government.result),
    governmentDescription: government.description,
    population: mapToRelationLevel(population.result),
    populationDescription: population.description,
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
