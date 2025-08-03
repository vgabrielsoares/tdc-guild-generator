/**
 * Tabelas Específicas de Reviravoltas Avançadas
 *
 * Este arquivo implementa apenas as tabelas "E..." das reviravoltas:
 * - E... (primeira tabela) - Complicações adicionais fundamentais
 * - E... (segunda tabela) - Complicações extremas e conceituais
 *
 * Para outras funcionalidades relacionadas a contratos, veja:
 * - contract-themes-tables.ts (palavras-chave temáticas e contratantes inusitados)
 * - contract-complications-tables.ts (complicações básicas)
 */

import type { TableEntry } from "@/types/tables";
import { TwistAndFirst, TwistAndSecond } from "@/types/contract";

// ===== TABELAS "E..." DAS REVIRAVOLTAS =====

/**
 * E... (primeira tabela) (1d20)
 * Complicações adicionais fundamentais da reviravolta
 * Baseado na seção "E... (primeira tabela)" das regras
 */
export const TWIST_AND_FIRST_TABLE: TableEntry<TwistAndFirst>[] = [
  { min: 1, max: 1, result: TwistAndFirst.TODOS_MORTOS },
  { min: 2, max: 2, result: TwistAndFirst.CONTRATADO_VILAO },
  { min: 3, max: 3, result: TwistAndFirst.NOVO_ANTAGONISTA },
  { min: 4, max: 4, result: TwistAndFirst.INFORMACOES_FALSAS },
  { min: 5, max: 5, result: TwistAndFirst.ANTAGONISTA_PARENTE },
  { min: 6, max: 6, result: TwistAndFirst.OUTRO_GRUPO_CUMPRE },
  { min: 7, max: 7, result: TwistAndFirst.OBJETIVO_INEXISTENTE },
  { min: 8, max: 8, result: TwistAndFirst.CONSPIRACAO_MAIOR },
  { min: 9, max: 9, result: TwistAndFirst.LOCAL_AMALDICOADO },
  { min: 10, max: 10, result: TwistAndFirst.TESTE_CARATER },
  { min: 11, max: 11, result: TwistAndFirst.TEMPO_LOOP },
  { min: 12, max: 12, result: TwistAndFirst.MULTIPLAS_REALIDADES },
  { min: 13, max: 13, result: TwistAndFirst.CONTRATO_DISTRACAO },
  { min: 14, max: 14, result: TwistAndFirst.ALGUEM_OBSERVA },
  { min: 15, max: 15, result: TwistAndFirst.OBJETIVO_DIFERENTE },
  { min: 16, max: 16, result: TwistAndFirst.TRAIDOR_GRUPO },
  { min: 17, max: 17, result: TwistAndFirst.PROBLEMA_SE_RESOLVE },
  { min: 18, max: 18, result: TwistAndFirst.RITUAL_MAIOR },
  { min: 19, max: 19, result: TwistAndFirst.ANTAGONISTA_CERTO },
  { min: 20, max: 20, result: TwistAndFirst.CONSEQUENCIAS_IRREVERSIVEIS },
];

/**
 * E... (segunda tabela) (1d20)
 * Complicações extremas e conceituais da reviravolta
 * Baseado na seção "E... (segunda tabela)" das regras
 */
export const TWIST_AND_SECOND_TABLE: TableEntry<TwistAndSecond>[] = [
  { min: 1, max: 1, result: TwistAndSecond.CUMPLICIDADE_VITIMAS },
  { min: 2, max: 2, result: TwistAndSecond.TUDO_UM_JOGO },
  { min: 3, max: 3, result: TwistAndSecond.AFETA_OUTRO_PLANO },
  { min: 4, max: 4, result: TwistAndSecond.DOIS_ANTAGONISTAS },
  { min: 5, max: 5, result: TwistAndSecond.TUDO_SONHO },
  { min: 6, max: 6, result: TwistAndSecond.VINGANCA_PLANEJADA },
  { min: 7, max: 7, result: TwistAndSecond.ILUSAO_COLETIVA },
  { min: 8, max: 8, result: TwistAndSecond.VERSAO_ALTERNATIVA },
  { min: 9, max: 9, result: TwistAndSecond.REESCREVENDO_HISTORIA },
  { min: 10, max: 10, result: TwistAndSecond.CONFLITO_CICLICO },
  { min: 11, max: 11, result: TwistAndSecond.PECAS_JOGO_MAIOR },
  { min: 12, max: 12, result: TwistAndSecond.SOLUCAO_CRIA_PROBLEMA },
  { min: 13, max: 13, result: TwistAndSecond.NADA_PODE_DESFAZER },
  { min: 14, max: 14, result: TwistAndSecond.PODER_NAS_CRIANCAS },
  { min: 15, max: 15, result: TwistAndSecond.MORTE_NAO_PERMANENTE },
  { min: 16, max: 16, result: TwistAndSecond.OBSERVADORES_DIMENSIONAIS },
  { min: 17, max: 17, result: TwistAndSecond.LOCAL_CONSCIENTE },
  { min: 18, max: 18, result: TwistAndSecond.TEMPO_DIFERENTE },
  { min: 19, max: 19, result: TwistAndSecond.MEMORIAS_ALTERADAS },
  { min: 20, max: 20, result: TwistAndSecond.REALIDADE_DESFAZENDO },
];
