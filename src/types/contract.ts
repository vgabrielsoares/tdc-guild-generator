import { z } from "zod";

// Enum para status do contrato
export enum StatusContrato {
  DISPONIVEL = "Disponível",
  ACEITO = "Aceito",
  CONCLUIDO = "Concluído",
  FALHOU = "Falhou",
  ANULADO = "Anulado",
}

// Enum para dificuldade do contrato
export enum DificuldadeContrato {
  FACIL = "Fácil",
  NORMAL = "Normal",
  DIFICIL = "Difícil",
  MORTAL = "Mortal",
}

// Enum para tipo de contratante
export enum TipoContratante {
  POVO = "Povo",
  INSTITUICAO = "Instituição",
  GOVERNO = "Governo",
}

// Interface para valor e recompensa do contrato
export interface ValorContrato {
  valorBase: number; // Valor base em moedas
  valorXP: number; // Valor em XP
  valorRecompensa?: number; // Valor da recompensa em moedas
}

// Interface principal do contrato
export interface Contrato {
  readonly id: string;
  titulo: string;
  descricao: string;
  status: StatusContrato;
  dificuldade: DificuldadeContrato;
  tipoContratante: TipoContratante;
  valor: ValorContrato;
  criadoEm: Date;
  expiraEm?: Date;
}

// Zod schemas para validação
export const ValorContratoSchema = z.object({
  valorBase: z.number().int().nonnegative(),
  valorXP: z.number().int().nonnegative(),
  valorRecompensa: z.number().int().nonnegative().optional(),
});

export const ContratoSchema = z.object({
  id: z.string().uuid(),
  titulo: z.string().min(1),
  descricao: z.string().min(1),
  status: z.nativeEnum(StatusContrato),
  dificuldade: z.nativeEnum(DificuldadeContrato),
  tipoContratante: z.nativeEnum(TipoContratante),
  valor: ValorContratoSchema,
  criadoEm: z.date(),
  expiraEm: z.date(),
});

export type ContratoInput = z.input<typeof ContratoSchema>;
export type ContratoOutput = z.output<typeof ContratoSchema>;

// Função utilitária para validação
export function validarContrato(data: unknown): Contrato {
  return ContratoSchema.parse(data);
}
