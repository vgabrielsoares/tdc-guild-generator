import { z } from "zod";

// Status do contrato durante seu ciclo de vida
export enum ContractStatus {
  DISPONIVEL = "Disponível",
  ACEITO = "Aceito",
  EM_ANDAMENTO = "Em andamento",
  CONCLUIDO = "Concluído",
  FALHOU = "Falhou",
  EXPIRADO = "Expirado",
  ANULADO = "Anulado",
  RESOLVIDO_POR_OUTROS = "Resolvido por outros",
  QUEBRADO = "Quebrado",
}

// Níveis de dificuldade dos contratos
export enum ContractDifficulty {
  FACIL = "Fácil",
  MEDIO = "Médio",
  DIFICIL = "Difícil",
  MORTAL = "Mortal",
}

// Tipos de contratantes conforme as regras
export enum ContractorType {
  POVO = "Povo",
  INSTITUICAO = "Instituição",
  GOVERNO = "Governo",
}

// Tipos de prazo para conclusão
export enum DeadlineType {
  SEM_PRAZO = "Sem prazo",
  DIAS = "Dias",
  SEMANAS = "Semanas",
  ARBITRARIO = "Arbitrário",
  JANELA_OPORTUNIDADE = "Janela de oportunidade",
}

// Tipos de pagamento disponíveis
export enum PaymentType {
  DIRETO_CONTRATANTE = "Pagamento em PO$ direto com contratante",
  METADE_GUILDA_METADE_CONTRATANTE = "Metade com a guilda, metade com o contratante",
  METADE_GUILDA_METADE_BENS = "Metade com a guilda, metade, em bens, com o contratante",
  BENS_SERVICOS = "Em materiais, joias, bens ou serviços do contratante",
  TOTAL_GUILDA = "Pagamento total na guilda em PO$",
  TOTAL_GUILDA_MAIS_SERVICOS = "Pagamento total na guilda em PO$ e serviços do contratante",
}

// Resultado de resolução automática
export enum ContractResolution {
  RESOLVIDO = "O contrato foi resolvido",
  NAO_RESOLVIDO = "O contrato não foi resolvido",
  RESOLVIDO_COM_RESSALVAS = "O contrato foi resolvido mas com ressalvas",
  AINDA_NAO_SE_SABE = "Ainda não se sabe",
}

// Motivos para não resolução
export enum FailureReason {
  DESISTENCIA = "Quebra devido a desistência",
  PICARETAGEM = "Quebra devido a picaretagem do contratante",
  OBITO = "Óbito de todos ou maioria dos envolvidos",
  PRAZO_NAO_CUMPRIDO = "Prazo não cumprido ou contratados desaparecidos",
  CLAUSULA_NAO_CUMPRIDA = "Quebra devido a cláusula adicional não cumprida",
  CONTRATANTE_MORTO = "Contratante morto ou desaparecido",
}

// ===== INTERFACES PARA VALOR E RECOMPENSA =====

// Interface para controlar valores e recompensas do contrato
export interface ContractValue {
  // Valor base rolado na tabela 1d100
  baseValue: number;

  // Valor em XP para estruturar o contrato (orçamento do mestre)
  experienceValue: number;

  // Valor da recompensa em pontos (convertido para PO$ * 0.1)
  rewardValue: number;

  // Valor final em PO$ que será pago (rewardValue * 0.1)
  finalGoldReward: number;

  // Todos os modificadores aplicados
  modifiers: ContractModifiers;
}

// Interface para todos os modificadores que afetam valores
export interface ContractModifiers {
  // Modificador por distância (-20 a +20)
  distance: number;

  // Modificador por relação com população (-20 a +5)
  populationRelation: number;

  // Modificador por relação com governo (-25 a +10)
  governmentRelation: number;

  // Modificador por funcionários experientes/despreparados
  staffPreparation: number;

  // Modificador por dificuldade (multiplicadores)
  difficultyMultiplier: {
    experienceMultiplier: number; // 1, 2, 4, 8
    rewardMultiplier: number; // 1, 1.3, 2, 3
  };

  // Modificadores por pré-requisitos e cláusulas (+5 cada)
  requirementsAndClauses: number;
}

// ===== INTERFACES PRINCIPAIS =====

// Interface principal do contrato conforme Issue 4.1
export interface Contract {
  readonly id: string;

  // Informações básicas
  title: string;
  description: string;
  status: ContractStatus;
  difficulty: ContractDifficulty;

  // Informações do contratante
  contractorType: ContractorType;
  contractorName?: string;

  // Valores e recompensas
  value: ContractValue;

  // Prazo e tempo
  deadline: {
    type: DeadlineType;
    value?: string; // "3 dias", "1 semana", etc.
    isFlexible: boolean;
    isArbitrary: boolean;
  };

  // Tipo de pagamento
  paymentType: PaymentType;

  // Datas importantes
  createdAt: Date;
  expiresAt?: Date;
  completedAt?: Date;

  // Metadados para geração
  generationData: {
    baseRoll: number; // Rolagem 1d100 original
    distanceRoll?: number;
    difficultyRoll?: number;
    settlementType?: string; // Tipo de assentamento onde foi gerado
  };
}

// Schema para modificadores de contratos
export const ContractModifiersSchema = z.object({
  distance: z.number().int().min(-20).max(20),
  populationRelation: z.number().int().min(-20).max(5),
  governmentRelation: z.number().int().min(-25).max(10),
  staffPreparation: z.number().int().min(-2).max(2),
  difficultyMultiplier: z.object({
    experienceMultiplier: z.number().positive(),
    rewardMultiplier: z.number().positive(),
  }),
  requirementsAndClauses: z.number().int().nonnegative(),
});

// Schema para valores do contrato
export const ContractValueSchema = z.object({
  baseValue: z.number().int().min(75).max(50000),
  experienceValue: z.number().int().nonnegative(),
  rewardValue: z.number().int().nonnegative(),
  finalGoldReward: z.number().nonnegative(),
  modifiers: ContractModifiersSchema,
});

// Schema para prazo
export const DeadlineSchema = z.object({
  type: z.nativeEnum(DeadlineType),
  value: z.string().optional(),
  isFlexible: z.boolean(),
  isArbitrary: z.boolean(),
});

// Schema para dados de geração
export const GenerationDataSchema = z.object({
  baseRoll: z.number().int().min(1).max(100),
  distanceRoll: z.number().int().min(1).max(20).optional(),
  difficultyRoll: z.number().int().min(1).max(20).optional(),
  settlementType: z.string().optional(),
});

// Schema principal do contrato
export const ContractSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().min(1),
  status: z.nativeEnum(ContractStatus),
  difficulty: z.nativeEnum(ContractDifficulty),
  contractorType: z.nativeEnum(ContractorType),
  contractorName: z.string().optional(),
  value: ContractValueSchema,
  deadline: DeadlineSchema,
  paymentType: z.nativeEnum(PaymentType),
  createdAt: z.date(),
  expiresAt: z.date().optional(),
  completedAt: z.date().optional(),
  generationData: GenerationDataSchema,
});

export type ContractInput = z.input<typeof ContractSchema>;
export type ContractOutput = z.output<typeof ContractSchema>;

/**
 * Valida os dados de um contrato usando o schema Zod
 * @param data - Dados do contrato para validar
 * @returns Contrato validado
 * @throws ZodError se os dados não forem válidos
 */
export function validateContract(data: unknown): Contract {
  return ContractSchema.parse(data);
}

/**
 * Calcula o valor final em ouro baseado no valor da recompensa
 * @param rewardValue - Valor da recompensa em pontos
 * @returns Valor em moedas de ouro (PO$)
 */
export function calculateFinalGoldReward(rewardValue: number): number {
  return rewardValue * 0.1;
}

/**
 * Calcula multa por quebra de contrato (10% da recompensa)
 * @param finalGoldReward - Recompensa final em PO$
 * @returns Valor da multa em PO$
 */
export function calculateBreachPenalty(finalGoldReward: number): number {
  return finalGoldReward * 0.1;
}

/**
 * Verifica se um contrato está expirado
 * @param contract - Contrato para verificar
 * @returns true se o contrato estiver expirado
 */
export function isContractExpired(contract: Contract): boolean {
  if (!contract.expiresAt) return false;
  return new Date() > contract.expiresAt;
}

/**
 * Aplica modificador de aumento por não resolução (+2 na recompensa)
 * @param rewardValue - Valor atual da recompensa
 * @returns Novo valor da recompensa
 */
export function applyUnresolvedBonus(rewardValue: number): number {
  return rewardValue + 2;
}
