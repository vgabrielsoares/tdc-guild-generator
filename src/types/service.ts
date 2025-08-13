/**
 * Tipos TypeScript para Sistema de Serviços da Guilda
 *
 * Serviços são tarefas simples, rápidas e de baixo risco,
 * diferenciadas dos contratos por sua natureza cotidiana.
 */

import { z } from "zod";
import type { GameDate } from "@/types/timeline";

// ===== ENUMS BÁSICOS =====

/**
 * Status do serviço durante seu ciclo de vida
 * Similar aos contratos mas com nuances específicas para serviços
 */
export enum ServiceStatus {
  DISPONIVEL = "Disponível",
  ACEITO = "Aceito",
  EM_ANDAMENTO = "Em andamento",
  CONCLUIDO = "Concluído",
  FALHOU = "Falhou",
  EXPIRADO = "Expirado",
  ANULADO = "Anulado",
  RESOLVIDO_POR_OUTROS = "Resolvido por outros",
  ACEITO_POR_OUTROS = "Aceito por outros aventureiros",
  QUEBRADO = "Quebrado",
}

/**
 * Complexidade dos serviços conforme tabela "Nível de Complexidade"
 */
export enum ServiceComplexity {
  SIMPLES = "Simples",
  MODERADA_E_DIRETA = "Moderada e Direta",
  MODERADA = "Moderada",
  COMPLEXA_E_DIRETA = "Complexa e Direta",
  COMPLEXA = "Complexa",
  EXTREMAMENTE_COMPLEXA_E_DIRETA = "Extremamente complexa e Direta",
  EXTREMAMENTE_COMPLEXA = "Extremamente complexa",
}

/**
 * Dificuldade dos serviços conforme tabela "Dificuldade e Recompensas"
 */
export enum ServiceDifficulty {
  MUITO_FACIL = "Muito Fácil (ND 10)",
  FACIL_ND14 = "Fácil (ND 14)",
  FACIL_ND15 = "Fácil (ND 15)",
  FACIL_ND16 = "Fácil (ND 16)",
  MEDIA_ND17 = "Média (ND 17)",
  MEDIA_ND18 = "Média (ND 18)",
  MEDIA_ND19 = "Média (ND 19)",
  DIFICIL_ND20 = "Difícil (ND 20)",
  DIFICIL_ND21 = "Difícil (ND 21)",
  DESAFIADOR_ND22 = "Desafiador (ND 22)",
  DESAFIADOR_ND23 = "Desafiador (ND 23)",
  MUITO_DIFICIL = "Muito Difícil (ND 25)",
}

/**
 * Tipos de contratantes específicos para serviços
 */
export enum ServiceContractorType {
  POVO = "Povo",
  INSTITUICAO_OFICIO = "Instituição de Ofício",
  GOVERNO = "Governo",
}

/**
 * Tipos de prazo para serviços
 */
export enum ServiceDeadlineType {
  SEM_PRAZO = "Sem prazo",
  DIAS = "Dias",
  SEMANAS = "Semanas",
}

/**
 * Tipos de pagamento específicos para serviços
 */
export enum ServicePaymentType {
  PAGAMENTO_DIRETO_CONTRATANTE = "Pagamento em PO$ direto com contratante",
  METADE_GUILDA_METADE_CONTRATANTE = "Metade com a guilda, metade com o contratante",
  METADE_GUILDA_METADE_BENS = "Metade com a guilda, metade, em bens, com o contratante",
  MATERIAIS_BENS_SERVICOS = "Em materiais, bens ou serviços do contratante",
  PAGAMENTO_TOTAL_GUILDA = "Pagamento total na guilda em PO$",
}

/**
 * Resultado de resolução automática de serviços assinados
 * Conforme tabela "Resoluções para Serviços Firmados"
 */
export enum ServiceResolution {
  RESOLVIDO = "O serviço foi resolvido",
  NAO_RESOLVIDO = "O serviço não foi resolvido",
  RESOLVIDO_COM_RESSALVAS = "O serviço foi resolvido mas com ressalvas",
  AINDA_NAO_SE_SABE = "Ainda não se sabe",
}

/**
 * Motivos para não resolução de serviços
 * Conforme tabela "Motivos para Não Resolução"
 */
export enum ServiceFailureReason {
  DESISTENCIA = "Quebra devido a desistência",
  PICARETAGEM = "Quebra devido a picaretagem do contratante",
  LESOES_GRAVES = "Lesões Graves de todos ou maioria dos envolvidos",
  PRAZO_NAO_CUMPRIDO = "Prazo não cumprido ou contratados desaparecidos",
  CLAUSULA_NAO_CUMPRIDA = "Quebra devido a cláusula adicional não cumprida",
  CONTRATANTE_DESAPARECIDO = "Contratante desaparecido",
}

/**
 * Resultado de resolução automática de serviços não assinados
 * Conforme tabela "Resolução para Serviços que Não Foram Assinados"
 */
export enum ServiceUnsignedResolution {
  TODOS_CONTINUAM = "Nenhum foi assinado, todos continuam disponíveis",
  TODOS_RESOLVIDOS = "Todos foram devidamente resolvidos",
  MENORES_RECOMPENSAS_RESOLVIDOS = "Serviços com as menores Recompensas foram resolvidos",
  MELHORES_RECOMPENSAS_RESOLVIDOS = "Serviços com as melhores Recompensas foram resolvidos",
  ALEATORIOS_RESOLVIDOS = "serviços aleatórios são resolvidos",
  ASSINADOS_NAO_RESOLVIDOS = "serviços são assinados, porém não são resolvidos",
  RESOLVIDOS_MAIS_UM = "serviços são resolvidos",
  MOTIVO_ESTRANHO = "Nenhum foi assinado, e há algum motivo estranho para isso",
}

// ===== INTERFACES PARA VALOR E RECOMPENSA =====

/**
 * Interface para controlar valores e recompensas específicos de serviços
 */
export interface ServiceValue {
  // Sistema de recompensas conforme tabela "Dificuldade e Recompensas"
  rewardRoll: string; // Ex: "1d6 C$", "3d4 C$", "5d6 C$", "2d4+1 PO$"
  rewardAmount: number; // Valor calculado da rolagem
  currency: "C$" | "PO$"; // Moeda conforme tabela (100 C$ = 1 PO$)

  // Taxa de recorrência específica conforme tabela
  recurrenceBonus: string; // Ex: "+0,5 C$", "+1 C$", "+5 C$", "+25 C$"
  recurrenceBonusAmount: number; // Valor numérico do bônus

  // Dificuldade associada à recompensa
  difficulty: ServiceDifficulty; // ND específico da tabela

  // Modificadores aplicados (se houver)
  modifiers?: ServiceModifiers;
}

/**
 * Interface para todos os modificadores que afetam valores de serviços
 */
export interface ServiceModifiers {
  // Modificadores por relações da guilda (conforme sistema de contratos adaptado)
  populationRelation: number; // Modificador baseado na relação com população
  governmentRelation: number; // Modificador baseado na relação com governo

  // Modificadores por condição dos funcionários
  staffCondition: number; // -1 (despreparados) ou +1 (experientes)
}

// ===== INTERFACES PARA STORAGE POR GUILDA =====

/**
 * Interface para serviços agrupados por guilda
 * Similar aos contratos mas específico para serviços
 */
export interface GuildServices {
  guildId: string;
  services: Service[];
  lastUpdate: Date | null;
  generationCount: number;
}

/**
 * Interface para todo o storage de serviços segregado por guilda
 */
export interface ServicesStorageState {
  guildServices: Record<string, GuildServices>;
  currentGuildId: string | null;
  globalLastUpdate: Date | null;
}

// ===== INTERFACE PRINCIPAL =====

/**
 * Interface principal do serviço
 * Estrutura básica focada na simplicidade e rapidez
 */
export interface Service {
  readonly id: string;

  // Informações básicas
  title: string;
  description: string;
  status: ServiceStatus;
  complexity: ServiceComplexity;
  difficulty: ServiceDifficulty; // ND para testes

  // Informações do contratante
  contractorType: ServiceContractorType;
  contractorName?: string;

  // Objetivo do serviço
  objective?: ServiceObjective;

  // Valores e recompensas
  value: ServiceValue;

  // Prazo e tempo
  deadline: {
    type: ServiceDeadlineType;
    value?: string;
  };
  deadlineDate?: GameDate; // Data calculada para o prazo

  // Tipo de pagamento
  paymentType: ServicePaymentType;

  // Datas de controle
  createdAt: GameDate;
  acceptedAt?: GameDate;
  completedAt?: GameDate;

  // Estado temporal
  isActive: boolean; // Se está sendo processado no timeline
  isExpired: boolean; // Se passou do prazo
}

// ===== INTERFACE PARA OBJETIVO (PLACEHOLDER) =====

/**
 * Interface básica para objetivo do serviço
 */
export interface ServiceObjective {
  // To be implemented in Issue 5.8
  type: string;
  description: string;
}

// ===== SCHEMAS ZOD PARA VALIDAÇÃO =====

/**
 * Schema para modificadores de serviços
 */
export const ServiceModifiersSchema = z.object({
  populationRelation: z.number().int().min(-5).max(5),
  governmentRelation: z.number().int().min(-5).max(5),
  staffCondition: z.number().int().min(-1).max(1),
});

/**
 * Schema para valor de serviços
 */
export const ServiceValueSchema = z.object({
  rewardRoll: z.string().min(1).max(50), // Ex: "1d6 C$", "3d4 C$"
  rewardAmount: z.number().int().min(1).max(10000),
  currency: z.enum(["C$", "PO$"]),
  recurrenceBonus: z.string().min(1).max(20), // Ex: "+0,5 C$", "+5 C$"
  recurrenceBonusAmount: z.number().min(0).max(100),
  difficulty: z.nativeEnum(ServiceDifficulty),
  modifiers: ServiceModifiersSchema,
});

/**
 * Schema principal para serviços
 */
export const ServiceSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  status: z.nativeEnum(ServiceStatus),
  complexity: z.nativeEnum(ServiceComplexity),
  difficulty: z.nativeEnum(ServiceDifficulty),
  contractorType: z.nativeEnum(ServiceContractorType),
  contractorName: z.string().optional(),
  value: ServiceValueSchema,
  deadline: z.object({
    type: z.nativeEnum(ServiceDeadlineType),
    value: z.string().optional(),
  }),
  deadlineDate: z
    .object({
      day: z.number().int().min(1).max(31),
      month: z.number().int().min(1).max(12),
      year: z.number().int().min(1).max(9999),
    })
    .optional(),
  paymentType: z.nativeEnum(ServicePaymentType),
  createdAt: z.object({
    day: z.number().int().min(1).max(31),
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(1).max(9999),
  }),
  acceptedAt: z
    .object({
      day: z.number().int().min(1).max(31),
      month: z.number().int().min(1).max(12),
      year: z.number().int().min(1).max(9999),
    })
    .optional(),
  completedAt: z
    .object({
      day: z.number().int().min(1).max(31),
      month: z.number().int().min(1).max(12),
      year: z.number().int().min(1).max(9999),
    })
    .optional(),
  isActive: z.boolean(),
  isExpired: z.boolean(),
});

// ===== FUNÇÕES UTILITÁRIAS =====

/**
 * Validação de serviço usando Zod
 */
export const validateService = (data: unknown): Service => {
  return ServiceSchema.parse(data);
};

/**
 * Calcula recompensa final considerando modificadores e bônus de recorrência
 */
export const calculateFinalServiceReward = (service: Service): number => {
  const { rewardAmount, recurrenceBonusAmount } = service.value;

  // Soma simples: valor base + bônus de recorrência
  const finalAmount = rewardAmount + recurrenceBonusAmount;

  return Math.max(1, finalAmount);
};

/**
 * Verifica se um serviço está expirado baseado na data atual
 */
export const isServiceExpired = (
  service: Service,
  currentDate: GameDate
): boolean => {
  if (
    !service.deadlineDate ||
    service.deadline.type === ServiceDeadlineType.SEM_PRAZO
  ) {
    return false;
  }

  const deadlineYear = service.deadlineDate.year;
  const deadlineMonth = service.deadlineDate.month;
  const deadlineDay = service.deadlineDate.day;

  if (currentDate.year > deadlineYear) return true;
  if (currentDate.year < deadlineYear) return false;

  if (currentDate.month > deadlineMonth) return true;
  if (currentDate.month < deadlineMonth) return false;

  return currentDate.day > deadlineDay;
};

/**
 * Aplica bônus de recorrência para serviços não resolvidos
 */
export const applyRecurrenceBonus = (service: Service): Service => {
  const currentBonusAmount = service.value.recurrenceBonusAmount || 0;

  // Incrementa bônus conforme regras (pode variar por dificuldade)
  let newBonusAmount: number;
  let newBonusText: string;

  // Sistema baseado na moeda
  if (service.value.currency === "C$") {
    newBonusAmount = Math.min(currentBonusAmount + 5, 25); // Máximo +25 C$
    newBonusText = `+${newBonusAmount} C$`;
  } else {
    // Para PO$, incremento menor mas mais valioso
    newBonusAmount = Math.min(currentBonusAmount + 1, 5); // Máximo +5 PO$
    newBonusText = `+${newBonusAmount} PO$`;
  }

  return {
    ...service,
    value: {
      ...service.value,
      recurrenceBonus: newBonusText,
      recurrenceBonusAmount: newBonusAmount,
    },
  };
};
