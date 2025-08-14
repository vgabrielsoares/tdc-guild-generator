import type { TableEntry } from "@/types/tables";
import {
  ServiceResolution,
  ServiceFailureReason,
  ServiceUnsignedResolution,
} from "@/types/service";

// ===== RESOLUÇÃO PARA SERVIÇOS FIRMADOS (1d20) =====

/**
 * "Resoluções para Serviços Firmados"
 * Determina o que aconteceu com serviços assinados por outros aventureiros
 */
export const SERVICE_SIGNED_RESOLUTION_TABLE: TableEntry<ServiceResolution>[] =
  [
    { min: 1, max: 12, result: ServiceResolution.RESOLVIDO },
    { min: 13, max: 16, result: ServiceResolution.NAO_RESOLVIDO },
    { min: 17, max: 18, result: ServiceResolution.RESOLVIDO_COM_RESSALVAS },
    { min: 19, max: 20, result: ServiceResolution.AINDA_NAO_SE_SABE },
  ];

// ===== RESOLUÇÃO PARA SERVIÇOS NÃO ASSINADOS (1d20) =====

/**
 * "Resolução para Serviços que Não Foram Assinados"
 * Determina o que aconteceu com serviços que permaneceram disponíveis
 */
interface ServiceUnsignedResolutionResult {
  description: string;
  action: string;
}

export const SERVICE_UNSIGNED_RESOLUTION_TABLE: TableEntry<ServiceUnsignedResolutionResult>[] =
  [
    {
      min: 1,
      max: 2,
      result: {
        description: "Nenhum foi assinado, todos continuam disponíveis",
        action: "keep_all",
      },
    },
    {
      min: 3,
      max: 5,
      result: {
        description: "Todos foram devidamente resolvidos",
        action: "resolve_all",
      },
    },
    {
      min: 6,
      max: 10,
      result: {
        description: "Serviços com as menores Recompensas foram resolvidos",
        action: "resolve_lowest_reward",
      },
    },
    {
      min: 11,
      max: 12,
      result: {
        description: "Serviços com as melhores Recompensas foram resolvidos",
        action: "resolve_highest_reward",
      },
    },
    {
      min: 13,
      max: 14,
      result: {
        description: "1d4 serviços aleatórios são resolvidos",
        action: "resolve_random_1d4",
      },
    },
    {
      min: 15,
      max: 15,
      result: {
        description:
          "1d4 serviços são assinados, porém não são resolvidos (Role a tabela Motivos para não resolução)",
        action: "sign_but_not_resolve_1d4",
      },
    },
    {
      min: 16,
      max: 16,
      result: {
        description:
          "1d4 serviços são assinados, porém não são resolvidos (Role a tabela Motivos para não resolução)",
        action: "sign_but_not_resolve_1d4",
      },
    },
    {
      min: 17,
      max: 18,
      result: {
        description: "1d4+1 serviços são resolvidos",
        action: "resolve_1d4plus1",
      },
    },
    {
      min: 19,
      max: 19,
      result: {
        description: "1d4+2 serviços são resolvidos",
        action: "resolve_1d4plus2",
      },
    },
    {
      min: 20,
      max: 20,
      result: {
        description:
          "Nenhum foi assinado, e há algum motivo estranho para isso",
        action: "strange_reason",
      },
    },
  ];

// ===== MOTIVOS PARA NÃO RESOLUÇÃO (1d20) =====

/**
 * "Motivos para Não Resolução"
 * Determina por que um serviço não foi resolvido
 */
export const SERVICE_FAILURE_REASONS_TABLE: TableEntry<ServiceFailureReason>[] =
  [
    { min: 1, max: 6, result: ServiceFailureReason.DESISTENCIA },
    { min: 7, max: 7, result: ServiceFailureReason.PICARETAGEM },
    { min: 8, max: 14, result: ServiceFailureReason.LESOES_GRAVES },
    { min: 15, max: 17, result: ServiceFailureReason.PRAZO_NAO_CUMPRIDO },
    { min: 18, max: 19, result: ServiceFailureReason.CLAUSULA_NAO_CUMPRIDA },
    { min: 20, max: 20, result: ServiceFailureReason.CONTRATANTE_DESAPARECIDO },
  ];

// ===== FUNÇÕES UTILITÁRIAS =====

/**
 * Mapeia ação da tabela para enum ServiceUnsignedResolution
 */
export function mapServiceActionToResult(
  action: string
): ServiceUnsignedResolution {
  switch (action) {
    case "keep_all":
      return ServiceUnsignedResolution.TODOS_CONTINUAM;
    case "resolve_all":
      return ServiceUnsignedResolution.TODOS_RESOLVIDOS;
    case "resolve_lowest_reward":
      return ServiceUnsignedResolution.MENORES_RECOMPENSAS_RESOLVIDOS;
    case "resolve_highest_reward":
      return ServiceUnsignedResolution.MELHORES_RECOMPENSAS_RESOLVIDOS;
    case "resolve_random_1d4":
    case "resolve_1d4plus1":
    case "resolve_1d4plus2":
      return ServiceUnsignedResolution.ALEATORIOS_RESOLVIDOS;
    case "sign_but_not_resolve_1d4":
      return ServiceUnsignedResolution.ASSINADOS_NAO_RESOLVIDOS;
    case "strange_reason":
      return ServiceUnsignedResolution.MOTIVO_ESTRANHO;
    default:
      return ServiceUnsignedResolution.TODOS_CONTINUAM;
  }
}

/**
 * Verifica se um serviço deve ser anulado baseado no motivo da falha
 * "Quebra devido a picaretagem do contratante (anule o serviço)"
 * "Contratante desaparecido (anule o serviço caso seja da população local)"
 */
export function shouldCancelService(reason: ServiceFailureReason): boolean {
  return (
    reason === ServiceFailureReason.PICARETAGEM ||
    reason === ServiceFailureReason.CONTRATANTE_DESAPARECIDO
  );
}

/**
 * Verifica se um serviço pode voltar a ficar disponível
 * "Os serviços que não foram resolvidos voltam a ficar disponíveis"
 * "Serviços anulados não voltam a ficar disponíveis para os jogadores"
 */
export function canServiceReturnToAvailable(
  outcome: ServiceResolution,
  reason?: ServiceFailureReason
): boolean {
  if (
    outcome === ServiceResolution.RESOLVIDO ||
    outcome === ServiceResolution.RESOLVIDO_COM_RESSALVAS
  ) {
    return false; // Serviços resolvidos não voltam
  }

  if (outcome === ServiceResolution.NAO_RESOLVIDO && reason) {
    return !shouldCancelService(reason); // Só volta se não foi anulado
  }

  if (outcome === ServiceResolution.AINDA_NAO_SE_SABE) {
    return true; // Ainda pode ser resolvido no futuro
  }

  return false;
}

/**
 * Determina se serviço deve ter bônus de taxa de recorrência
 * "Sempre que um serviço não for resolvido mas permanecer disponível,
 *  consulte a tabela de 'Taxa de recorrência'"
 */
export function shouldGetServiceRecurrenceBonus(
  outcome: ServiceResolution,
  reason?: ServiceFailureReason
): boolean {
  return (
    outcome === ServiceResolution.NAO_RESOLVIDO &&
    reason !== undefined &&
    !shouldCancelService(reason)
  );
}
