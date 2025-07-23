import { z } from "zod";

// Enums para valores fixos - organizados por categoria
export enum SettlementType {
  LUGAREJO = "Lugarejo",
  ALDEIA = "Aldeia",
  CIDADE_PEQUENA = "Cidade Pequena",
  CIDADE_GRANDE = "Cidade Grande",
  METROPOLE = "Metrópole",
}

export enum ResourceLevel {
  EM_DEBITO = "Em débito",
  NENHUM = "Nenhum",
  ESCASSOS = "Escassos",
  ESCASSOS_HONESTOS = "Escassos e obtidos com muito esforço e honestidade",
  LIMITADOS = "Limitados",
  SUFICIENTES = "Suficientes",
  EXCEDENTES = "Excedentes",
  EXCEDENTES_MALIGNOS = "Excedentes mas alimenta fins malignos",
  ABUNDANTES_GOVERNO = "Abundantes porém quase todo vindo do governo de um assentamento próximo",
  ABUNDANTES = "Abundantes",
  ABUNDANTES_SERVICO = "Abundantes vindos de muitos anos de serviço",
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
  PESSIMA = "Péssima",
  RUIM = "Ruim",
  RUIM_CORDIAL = "Ruim, mas tentam manter a cordialidade",
  RUIM_PROBLEMAS = "Ruim, só causam problemas",
  DIPLOMATICA = "Diplomática", 
  OPINIAO_DIVIDIDA = "Opinião dividida",
  BOA_TENSAO = "Boa, mas o governo tenta miná-los secretamente",
  BOA = "Boa",
  BOA_AJUDAM = "Boa, ajudam com problemas",
  BOA_SEGUROS = "Boa, nos mantêm seguros",
  MUITO_BOA = "Muito boa, cooperam frequentemente",
  MUITO_BOA_PERDIDOS = "Muito boa, sem eles estaríamos perdidos",
  EXCELENTE = "Excelente, governo e guilda são quase como um",
  EXCELENTE_FUNCIONAR = "Excelente, a guilda faz o assentamento funcionar",
}

// Interfaces principais - organizadas e tipadas
export interface GuildStructure {
  readonly size: string;
  readonly characteristics: string[];
  readonly location?: string;
  readonly description?: string;
}

export interface GuildRelations {
  readonly government: RelationLevel;
  readonly governmentDescription?: string;
  readonly population: RelationLevel;
  readonly populationDescription?: string;
  readonly notes?: string;
}

export interface GuildStaff {
  readonly employees: string;
  readonly description?: string;
  readonly count?: number;
}

export interface GuildVisitors {
  readonly frequency: VisitorLevel;
  readonly description?: string;
  readonly types?: readonly string[];
}

export interface GuildResources {
  readonly level: ResourceLevel;
  readonly description?: string;
  readonly details?: readonly string[];
}

export interface Guild {
  readonly id: string;
  readonly name: string;
  readonly structure: GuildStructure;
  readonly relations: GuildRelations;
  readonly staff: GuildStaff;
  readonly visitors: GuildVisitors;
  readonly resources: GuildResources;
  readonly settlementType: SettlementType;
  readonly createdAt: Date;
  readonly updatedAt?: Date;
  readonly locked?: boolean;
}

// Interface para configuração de geração
export interface GuildGenerationConfig {
  settlementType: SettlementType;
  useModifiers?: boolean;
  customModifiers?: {
    structure?: number;
    visitors?: number;
    government?: number;
    population?: number;
    resources?: number;
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

// Schemas Zod para validação - usando enums nativos
export const SettlementTypeSchema = z.nativeEnum(SettlementType);
export const ResourceLevelSchema = z.nativeEnum(ResourceLevel);
export const VisitorLevelSchema = z.nativeEnum(VisitorLevel);
export const RelationLevelSchema = z.nativeEnum(RelationLevel);

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
  governmentDescription: z.string().optional(),
  population: RelationLevelSchema,
  populationDescription: z.string().optional(),
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
  id: z.string().min(1),
  name: z.string().min(1),
  structure: GuildStructureSchema,
  relations: GuildRelationsSchema,
  staff: GuildStaffSchema,
  visitors: GuildVisitorsSchema,
  resources: GuildResourcesSchema,
  settlementType: SettlementTypeSchema,
  createdAt: z.date(),
  updatedAt: z.date().optional(),
  locked: z.boolean().optional().default(false),
});

export const GuildGenerationConfigSchema = z.object({
  settlementType: SettlementTypeSchema,
  useModifiers: z.boolean().optional().default(true),
  customModifiers: z
    .object({
      structure: z.number().int().optional(),
      visitors: z.number().int().optional(),
      government: z.number().int().optional(),
      population: z.number().int().optional(),
      resources: z.number().int().optional(),
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
