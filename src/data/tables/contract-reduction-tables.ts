import type { TableEntry } from "@/types/tables";
import { ContractResolution, FailureReason } from "@/types/contract";

// ===== TABELA DE RESOLUÇÃO PARA CONTRATOS ACEITOS POR OUTROS =====

// Tabela para determinar o que aconteceu com contratos aceitos por outros aventureiros
export const SIGNED_CONTRACT_RESOLUTION_TABLE: TableEntry<ContractResolution>[] =
  [
    { min: 1, max: 12, result: ContractResolution.RESOLVIDO },
    { min: 13, max: 16, result: ContractResolution.NAO_RESOLVIDO },
    { min: 17, max: 18, result: ContractResolution.RESOLVIDO_COM_RESSALVAS },
    { min: 19, max: 20, result: ContractResolution.AINDA_NAO_SE_SABE },
  ];

// ===== FUNÇÕES UTILITÁRIAS =====

/**
 * Verifica se um contrato deve ser anulado baseado no motivo da falha
 */
export function shouldCancelContract(reason: FailureReason): boolean {
  return (
    reason === FailureReason.PICARETAGEM ||
    reason === FailureReason.CONTRATANTE_MORTO
  );
}

/**
 * Verifica se um contrato pode voltar a ficar disponível
 */
export function canContractReturnToAvailable(
  outcome: ContractResolution,
  reason?: FailureReason
): boolean {
  if (
    outcome === ContractResolution.RESOLVIDO ||
    outcome === ContractResolution.RESOLVIDO_COM_RESSALVAS
  ) {
    return false; // Contratos resolvidos não voltam
  }

  if (outcome === ContractResolution.NAO_RESOLVIDO && reason) {
    return !shouldCancelContract(reason); // Só volta se não foi anulado
  }

  if (outcome === ContractResolution.AINDA_NAO_SE_SABE) {
    return true; // Ainda pode ser resolvido no futuro
  }

  return false;
}

/**
 * Determina se contrato deve ter bônus de recompensa por não ter sido resolvido
 */
export function shouldGetUnresolvedBonus(
  outcome: ContractResolution,
  reason?: FailureReason
): boolean {
  if (outcome === ContractResolution.NAO_RESOLVIDO && reason) {
    return !shouldCancelContract(reason); // Só ganha bônus se não foi anulado
  }
  return false;
}
