import { z } from "zod";

// Enums para valores fixos
export enum ResourceLevel {
  ESCASSOS = "Escassos",
  LIMITADOS = "Limitados",
  BÁSICOS = "Básicos",
  ADEQUADOS = "Adequados",
  ABUNDANTES = "Abundantes",
  VASTOS = "Vastos",
  LENDARIOS = "Lendários",
}

export enum VisitorLevel {
  VAZIA = "Vazia",
  QUASE_DESERTA = "Quase deserta",
  POUCO_MOVIMENTADA = "Pouco movimentada",
  NEM_MUITO_NEM_POUCO = "Nem muito nem pouco",
  MUITO_FREQUENTADA = "Muito frequentada",
  ABARROTADA = "Abarrotada",
  LOTADA = "Lotada",
}

export enum RelationLevel {
  HOSTIL = "Hostil",
  SUSPEITA = "Suspeita",
  INDIFERENTE = "Indiferente",
  TOLERANTE = "Tolerante",
  COOPERATIVA = "Cooperativa",
  ALIADA = "Aliada",
  TEMIDA = "Temida",
  DESCONFIADA = "Desconfiada",
  RESPEITADA = "Respeitada",
  ADMIRADA = "Admirada",
  REVERENCIADA = "Reverenciada",
}

export enum SettlementType {
  LUGAREJO = "Lugarejo",
  ALDEIA = "Aldeia",
  CIDADE_PEQUENA = "Cidade Pequena",
  CIDADE_GRANDE = "Cidade Grande",
  METROPOLE = "Metrópole",
}

// Interface para a estrutura física da guilda
export interface GuildStructure {
  size: string;
  characteristics: string[];
  location?: string;
  description?: string;
}

// Interface para relações da guilda
export interface GuildRelations {
  government: string;
  population: string;
  notes?: string;
}

// Interface para funcionários da guilda
export interface GuildStaff {
  employees: string;
  description?: string;
  count?: number;
}

// Interface para visitantes
export interface GuildVisitors {
  frequency: string;
  description?: string;
  types?: string[];
}

// Interface para recursos
export interface GuildResources {
  level: string;
  description?: string;
  details?: string[];
}

// Interface principal da guilda
export interface Guild {
  id: string;
  name: string;
  structure: GuildStructure;
  relations: GuildRelations;
  staff: GuildStaff;
  visitors: GuildVisitors;
  resources: GuildResources;
  settlementType: SettlementType;
  createdAt: Date;
  updatedAt?: Date;
}

// Interface para configuração de geração
export interface GuildGenerationConfig {
  settlementType: SettlementType;
  useModifiers?: boolean;
  customModifiers?: {
    structure?: number;
    visitors?: number;
  };
}

// Interface para o resultado de geração
export interface GuildGenerationResult {
  guild: Guild;
  rolls: {
    structure: {
      size: number;
      characteristics: number[];
    };
    relations: {
      government: number;
      population: number;
    };
    staff: number;
    visitors: number;
    resources: number;
  };
  logs: string[];
}

// Schemas Zod para validação
export const ResourceLevelSchema = z.enum([
  "Escassos",
  "Limitados",
  "Básicos",
  "Adequados",
  "Abundantes",
  "Vastos",
  "Lendários",
]);
export const VisitorLevelSchema = z.enum([
  "Vazia",
  "Quase deserta",
  "Pouco movimentada",
  "Nem muito nem pouco",
  "Muito frequentada",
  "Abarrotada",
  "Lotada",
]);
export const RelationLevelSchema = z.enum([
  "Hostil",
  "Suspeita",
  "Indiferente",
  "Tolerante",
  "Cooperativa",
  "Aliada",
  "Temida",
  "Desconfiada",
  "Respeitada",
  "Admirada",
  "Reverenciada",
]);
export const SettlementTypeSchema = z.nativeEnum(SettlementType);

export const GuildStructureSchema = z.object({
  size: z.string().min(1, "Size is required"),
  characteristics: z
    .array(z.string())
    .min(1, "At least one characteristic is required"),
  location: z.string().optional(),
  description: z.string().optional(),
});

export const GuildRelationsSchema = z.object({
  government: RelationLevelSchema,
  population: RelationLevelSchema,
  notes: z.string().optional(),
});

export const GuildStaffSchema = z.object({
  employees: z.string().min(1, "Employee description is required"),
  description: z.string().optional(),
  count: z.number().int().min(0).optional(),
});

export const GuildVisitorsSchema = z.object({
  frequency: VisitorLevelSchema,
  description: z.string().optional(),
  types: z.array(z.string()).optional(),
});

export const GuildResourcesSchema = z.object({
  level: ResourceLevelSchema,
  description: z.string().optional(),
  details: z.array(z.string()).optional(),
});

export const GuildSchema = z.object({
  id: z.string(),
  name: z.string(),
  structure: GuildStructureSchema,
  relations: GuildRelationsSchema,
  staff: GuildStaffSchema,
  visitors: GuildVisitorsSchema,
  resources: GuildResourcesSchema,
  settlementType: SettlementTypeSchema,
  createdAt: z.date(),
  updatedAt: z.date().optional(),
});

export const GuildGenerationConfigSchema = z.object({
  settlementType: SettlementTypeSchema,
  useModifiers: z.boolean().optional().default(true),
  customModifiers: z
    .object({
      structure: z.number().int().optional(),
      visitors: z.number().int().optional(),
    })
    .optional(),
});

export const GuildGenerationResultSchema = z.object({
  guild: GuildSchema,
  rolls: z.object({
    structure: z.object({
      size: z.number().int(),
      characteristics: z.array(z.number().int()),
    }),
    relations: z.object({
      government: z.number().int(),
      population: z.number().int(),
    }),
    staff: z.number().int(),
    visitors: z.number().int(),
    resources: z.number().int(),
  }),
  logs: z.array(z.string()),
});

// Type guards para verificação de tipos em runtime
export const isGuild = (obj: unknown): obj is Guild => {
  return GuildSchema.safeParse(obj).success;
};

export const isGuildGenerationConfig = (
  obj: unknown
): obj is GuildGenerationConfig => {
  return GuildGenerationConfigSchema.safeParse(obj).success;
};

export const isGuildGenerationResult = (
  obj: unknown
): obj is GuildGenerationResult => {
  return GuildGenerationResultSchema.safeParse(obj).success;
};

// Função utilitária para validar e criar uma guilda
export const createGuild = (data: unknown): Guild => {
  const result = GuildSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`Invalid guild data: ${result.error.message}`);
  }
  return result.data;
};

// Função utilitária para validar configuração de geração
export const createGuildGenerationConfig = (
  data: unknown
): GuildGenerationConfig => {
  const result = GuildGenerationConfigSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`Invalid generation config: ${result.error.message}`);
  }
  return result.data;
};

// Manter compatibilidade com código existente
export type GuildData = Guild;
