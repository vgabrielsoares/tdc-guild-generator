import { ContractStatus } from "@/types/contract";

/**
 * Retorna o rótulo para um status de contrato.
 * Centraliza a lógica para evitar duplicação entre componentes.
 */
export function getStatusLabel(status: ContractStatus): string {
  switch (status) {
    case ContractStatus.DISPONIVEL:
      return "Disponíveis";
    case ContractStatus.ACEITO:
      return "Aceitos";
    case ContractStatus.EM_ANDAMENTO:
      return "Em Andamento";
    case ContractStatus.CONCLUIDO:
      return "Concluídos";
    case ContractStatus.FALHOU:
      return "Falharam";
    case ContractStatus.EXPIRADO:
      return "Expirados";
    case ContractStatus.ANULADO:
      return "Anulados";
    case ContractStatus.RESOLVIDO_POR_OUTROS:
      return "Resolvidos por Outros";
    case ContractStatus.ACEITO_POR_OUTROS:
      return "Aceitos por Outros";
    case ContractStatus.QUEBRADO:
      return "Quebrados";
    default:
      return String(status);
  }
}
