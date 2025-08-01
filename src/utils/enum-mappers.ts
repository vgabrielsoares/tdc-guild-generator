/**
 * Utilidades para mapeamento entre strings de tabelas e enums
 * Centraliza toda a lógica de conversão para evitar repetição
 */

import { RelationLevel, ResourceLevel, VisitorLevel, SettlementType } from '@/types/guild';

// Mapeamento de relações governamentais
export function mapGovernmentRelationToEnum(tableResult: string): RelationLevel {
  const mapping: Record<string, RelationLevel> = {
    "Péssima": RelationLevel.PESSIMA,
    "Ruim": RelationLevel.RUIM,
    "Ruim, mas tentam manter a cordialidade": RelationLevel.RUIM_CORDIAL,
    "Diplomática": RelationLevel.DIPLOMATICA,
    "Boa, mas o governo tenta miná-los secretamente": RelationLevel.BOA_TENSAO,
    "Boa": RelationLevel.BOA,
    "Muito boa, cooperam frequentemente": RelationLevel.MUITO_BOA,
    "Excelente, governo e guilda são quase como um": RelationLevel.EXCELENTE,
  };

  return mapping[tableResult] || RelationLevel.DIPLOMATICA;
}

// Mapeamento de relações populacionais
export function mapPopulationRelationToEnum(tableResult: string): RelationLevel {
  const mapping: Record<string, RelationLevel> = {
    "Péssima, puro ódio": RelationLevel.PESSIMA,
    "Ruim, vistos como mercenários": RelationLevel.RUIM,
    "Ruim, só causam problemas": RelationLevel.RUIM_PROBLEMAS,
    "Opinião dividida": RelationLevel.OPINIAO_DIVIDIDA,
    "Boa, ajudam com problemas": RelationLevel.BOA_AJUDAM,
    "Boa, nos mantêm seguros": RelationLevel.BOA_SEGUROS,
    "Muito boa, sem eles estaríamos perdidos": RelationLevel.MUITO_BOA_PERDIDOS,
    "Excelente, a guilda faz o assentamento funcionar": RelationLevel.EXCELENTE_FUNCIONAR,
  };

  return mapping[tableResult] || RelationLevel.OPINIAO_DIVIDIDA;
}

// Mapeamento de níveis de visitantes
export function mapVisitorStringToEnum(visitorString: string): VisitorLevel {
  const mapping: Record<string, VisitorLevel> = {
    "Vazia": VisitorLevel.VAZIA,
    "Quase deserta": VisitorLevel.QUASE_DESERTA,
    "Pouco movimentada": VisitorLevel.POUCO_MOVIMENTADA,
    "Nem muito nem pouco": VisitorLevel.NEM_MUITO_NEM_POUCO,
    "Muito frequentada": VisitorLevel.MUITO_FREQUENTADA,
    "Abarrotada": VisitorLevel.ABARROTADA,
    "Lotada": VisitorLevel.LOTADA,
  };

  return mapping[visitorString] || VisitorLevel.NEM_MUITO_NEM_POUCO;
}

// Mapeamento de níveis de recursos
export function mapResourceStringToEnum(resourceString: string): ResourceLevel {
  const mapping: Record<string, ResourceLevel> = {
    "Em débito": ResourceLevel.EM_DEBITO,
    "Nenhum": ResourceLevel.NENHUM,
    "Escassos": ResourceLevel.ESCASSOS,
    "Escassos e obtidos com muito esforço e honestidade": ResourceLevel.ESCASSOS_HONESTOS,
    "Limitados": ResourceLevel.LIMITADOS,
    "Suficientes": ResourceLevel.SUFICIENTES,
    "Excedentes": ResourceLevel.EXCEDENTES,
    "Excedentes mas alimenta fins malignos": ResourceLevel.EXCEDENTES_MALIGNOS,
    "Abundantes porém quase todo vindo do governo de um assentamento próximo": ResourceLevel.ABUNDANTES_GOVERNO,
    "Abundantes": ResourceLevel.ABUNDANTES,
    "Abundantes vindos de muitos anos de serviço": ResourceLevel.ABUNDANTES_SERVICO,
  };

  return mapping[resourceString] || ResourceLevel.LIMITADOS;
}

// Mapeamento inverso - de enum para string (para lookup em modificadores)
export function mapResourceLevelToString(resourceLevel: ResourceLevel): string {
  return resourceLevel as string;
}

export function mapRelationLevelToString(relationLevel: RelationLevel): string {
  return relationLevel as string;
}

// Mapeamento de tipos de assentamento para chaves das tabelas
export function mapSettlementTypeToTableKey(settlementType: SettlementType): string {
  const mapping: Record<SettlementType, string> = {
    [SettlementType.LUGAREJO]: "Lugarejo",
    [SettlementType.POVOADO]: "Povoado",
    [SettlementType.ALDEIA]: "Aldeia",
    [SettlementType.VILAREJO]: "Vilarejo",
    [SettlementType.VILA_GRANDE]: "Vila grande",
    [SettlementType.CIDADELA]: "Cidadela",
    [SettlementType.CIDADE_GRANDE]: "Cidade Grande",
    [SettlementType.METROPOLE]: "Metrópole",
  };

  return mapping[settlementType] || "Aldeia";
}

// Validação se uma string é um valor válido de enum
export function isValidRelationLevel(value: string): value is RelationLevel {
  return Object.values(RelationLevel).includes(value as RelationLevel);
}

export function isValidResourceLevel(value: string): value is ResourceLevel {
  return Object.values(ResourceLevel).includes(value as ResourceLevel);
}

export function isValidVisitorLevel(value: string): value is VisitorLevel {
  return Object.values(VisitorLevel).includes(value as VisitorLevel);
}

export function isValidSettlementType(value: string): value is SettlementType {
  return Object.values(SettlementType).includes(value as SettlementType);
}
