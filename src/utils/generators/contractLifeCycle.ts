import { rollDice, rollOnTable } from "../dice";
import type { Contract } from "../../types/contract";
import { 
  ContractStatus, 
  ContractResolution, 
  FailureReason,
  UnsignedResolutionResult,
  isContractExpired
} from "../../types/contract";
import {
  SIGNED_CONTRACT_RESOLUTION_TIME_TABLE,
  UNSIGNED_CONTRACT_RESOLUTION_TIME_TABLE,
  SIGNED_CONTRACT_RESOLUTION_TABLE,
  UNSIGNED_CONTRACT_RESOLUTION_TABLE,
  CONTRACT_FAILURE_REASONS_TABLE,
  NEW_CONTRACTS_TIME_TABLE,
  UNRESOLVED_CONTRACT_BONUS
} from "../../data/tables/contract-modifier-tables";

// Tipos específicos para o ciclo de vida dos contratos

export interface ContractResolutionTime {
  signed: number; // dias para resolução de contratos assinados
  unsigned: number; // dias para resolução de contratos não assinados
}

export interface NewContractsTime {
  days: number; // dias até novos contratos aparecerem
}

// ===== FUNÇÕES UTILITÁRIAS =====

/**
 * Converte string de dados em dias
 */
function convertTimeStringToDays(timeString: string): number {
  // Remove espaços e converte para lowercase
  const cleaned = timeString.toLowerCase().trim();
  
  if (cleaned.includes("dia")) {
    // Extrair e rolar dados para dias
    const diceMatch = cleaned.match(/(\d+d\d+(?:\+\d+)?|\d+)/);
    if (diceMatch) {
      const diceNotation = diceMatch[1];
      if (diceNotation.includes("d")) {
        return rollDice({ notation: diceNotation }).result;
      } else {
        return parseInt(diceNotation);
      }
    }
  } else if (cleaned.includes("semana")) {
    // Extrair e rolar dados para semanas, depois converter para dias
    const diceMatch = cleaned.match(/(\d+d\d+(?:\+\d+)?|\d+)/);
    if (diceMatch) {
      const diceNotation = diceMatch[1];
      let weeks: number;
      if (diceNotation.includes("d")) {
        weeks = rollDice({ notation: diceNotation }).result;
      } else {
        weeks = parseInt(diceNotation);
      }
      return weeks * 7; // Converter semanas para dias
    }
  } else if (cleaned.includes("mês") || cleaned.includes("mes")) {
    // Extrair e rolar dados para meses, depois converter para dias
    const diceMatch = cleaned.match(/(\d+d\d+(?:\+\d+)?|\d+)/);
    if (diceMatch) {
      const diceNotation = diceMatch[1];
      let months: number;
      if (diceNotation.includes("d")) {
        months = rollDice({ notation: diceNotation }).result;
      } else {
        months = parseInt(diceNotation);
      }
      return months * 30; // Converter meses para dias (aproximado)
    }
  }
  
  // Fallback - tentar extrair número diretamente
  const numberMatch = cleaned.match(/\d+/);
  if (numberMatch) {
    return parseInt(numberMatch[0]);
  }
  
  return 7; // Default de 1 semana
}

// ===== FUNÇÕES DE ROLAGEM =====

/**
 * Rola tempo de resolução para contratos assinados
 */
export function rollSignedContractResolutionTime(): number {
  const result = rollOnTable({
    table: SIGNED_CONTRACT_RESOLUTION_TIME_TABLE,
    context: "Tempo de resolução - contratos assinados",
  });
  return convertTimeStringToDays(result.result as string);
}

/**
 * Rola tempo de resolução para contratos não assinados
 */
export function rollUnsignedContractResolutionTime(): number {
  const result = rollOnTable({
    table: UNSIGNED_CONTRACT_RESOLUTION_TIME_TABLE,
    context: "Tempo de resolução - contratos não assinados",
  });
  return convertTimeStringToDays(result.result as string);
}

/**
 * Rola resolução para contratos assinados
 */
export function rollSignedContractResolution(): {
  result: ContractResolution;
  reason?: FailureReason;
} {
  const resolution = rollOnTable({
    table: SIGNED_CONTRACT_RESOLUTION_TABLE,
    context: "Resolução de contratos assinados",
  });
  
  const response: {
    result: ContractResolution;
    reason?: FailureReason;
  } = {
    result: resolution.result as ContractResolution,
  };
  
  // Se não foi resolvido, rolar motivo
  if (resolution.result === ContractResolution.NAO_RESOLVIDO) {
    const reasonResult = rollOnTable({
      table: CONTRACT_FAILURE_REASONS_TABLE,
      context: "Motivo para não resolução",
    });
    response.reason = reasonResult.result as FailureReason;
  }
  
  return response;
}

/**
 * Rola resolução para contratos não assinados
 */
export function rollUnsignedContractResolution(): {
  type: UnsignedResolutionResult;
  count?: number;
} {
  const resolution = rollOnTable({
    table: UNSIGNED_CONTRACT_RESOLUTION_TABLE,
    context: "Resolução de contratos não assinados",
  });
  
  // Capturar o resultado como objeto ou string
  const result = resolution.result as { description: string; action: string } | string;
  
  const response: {
    type: UnsignedResolutionResult;
    count?: number;
  } = {
    type: UnsignedResolutionResult.TODOS_CONTINUAM, // default
  };

  // Se é um objeto com action, usar mapActionToResult
  if (result && typeof result === 'object' && 'action' in result) {
    response.type = mapActionToResult(result.action);
    
    // Calcular count se necessário baseado na ação
    switch (result.action) {
      case "resolve_random_1d6":
        response.count = rollDice({ notation: "1d6" }).result;
        break;
      case "resolve_1d6plus2":
        response.count = rollDice({ notation: "1d6+2" }).result;
        break;
      case "resolve_2d6plus2":
        response.count = rollDice({ notation: "2d6+2" }).result;
        break;
      case "sign_but_not_resolve_1d4plus2":
        response.count = rollDice({ notation: "1d4+2" }).result;
        break;
      // Para outras ações que não precisam de count, não definir
    }
  } else if (typeof result === 'string') {
    // Se é uma string direta, mapear diretamente
    response.type = result as UnsignedResolutionResult;
  }
  
  return response;
}

/**
 * Mapeia ação da tabela para enum UnsignedResolutionResult
 */
function mapActionToResult(action: string): UnsignedResolutionResult {
  switch (action) {
    case "keep_all":
      return UnsignedResolutionResult.TODOS_CONTINUAM;
    case "resolve_all":
      return UnsignedResolutionResult.TODOS_RESOLVIDOS;
    case "resolve_lowest_xp":
      return UnsignedResolutionResult.MENORES_XP_RESOLVIDOS;
    case "resolve_highest_reward":
      return UnsignedResolutionResult.MELHORES_RECOMPENSAS_RESOLVIDOS;
    case "resolve_random_1d6":
    case "resolve_1d6plus2":
    case "resolve_2d6plus2":
      return UnsignedResolutionResult.ALEATORIOS_RESOLVIDOS;
    case "sign_but_not_resolve_1d4plus2":
      return UnsignedResolutionResult.ASSINADOS_NAO_RESOLVIDOS;
    case "strange_reason":
      return UnsignedResolutionResult.MOTIVO_ESTRANHO;
    default:
      return UnsignedResolutionResult.TODOS_CONTINUAM;
  }
}

/**
 * Rola tempo até novos contratos aparecerem
 */
export function rollNewContractsTime(): number {
  const result = rollOnTable({
    table: NEW_CONTRACTS_TIME_TABLE,
    context: "Tempo até novos contratos",
  });
  return convertTimeStringToDays(result.result);
}

/**
 * Gera tempos de resolução para uma guilda
 */
export function generateResolutionTimes(): ContractResolutionTime {
  return {
    signed: rollSignedContractResolutionTime(),
    unsigned: rollUnsignedContractResolutionTime(),
  };
}

// ===== FUNÇÕES DE APLICAÇÃO DE RESOLUÇÕES =====

/**
 * Aplicar resolução automática a contratos assinados
 */
export function applySignedContractResolution(contracts: Contract[]): Contract[] {
  const signedContracts = contracts.filter(
    (contract) => 
      contract.status === ContractStatus.ACEITO_POR_OUTROS
  );
  
  return contracts.map((contract) => {
    if (!signedContracts.includes(contract)) {
      return contract;
    }
    
    const resolution = rollSignedContractResolution();
    
    switch (resolution.result) {
      case ContractResolution.RESOLVIDO:
        return {
          ...contract,
          status: ContractStatus.RESOLVIDO_POR_OUTROS,
          completedAt: new Date(),
        };
        
      case ContractResolution.RESOLVIDO_COM_RESSALVAS:
        return {
          ...contract,
          status: ContractStatus.RESOLVIDO_POR_OUTROS,
          completedAt: new Date(),
          // Poderia adicionar flag para ressalvas
        };
        
      case ContractResolution.NAO_RESOLVIDO:
        if (resolution.reason === FailureReason.PICARETAGEM ||
            resolution.reason === FailureReason.CONTRATANTE_MORTO) {
          return {
            ...contract,
            status: ContractStatus.ANULADO,
          };
        } else {
          // Contrato não foi resolvido, volta a ficar disponível com recompensa aumentada
          return {
            ...contract,
            status: ContractStatus.DISPONIVEL,
            takenByOthersInfo: undefined, // Remover informação de aceito por outros
            value: {
              ...contract.value,
              rewardValue: contract.value.rewardValue + UNRESOLVED_CONTRACT_BONUS, // Aumenta recompensa
              finalGoldReward: (contract.value.rewardValue + UNRESOLVED_CONTRACT_BONUS) * 0.1,
            },
          };
        }
        
      case ContractResolution.AINDA_NAO_SE_SABE:
        // Manter status ACEITO_POR_OUTROS, será resolvido na próxima vez
        return contract;
        
      default:
        return contract;
    }
  });
}

/**
 * Aplicar resolução automática a contratos não assinados
 */
export function applyUnsignedContractResolution(contracts: Contract[]): Contract[] {
  const unsignedContracts = contracts.filter(
    (contract) => contract.status === ContractStatus.DISPONIVEL
  );
  
  if (unsignedContracts.length === 0) {
    return contracts;
  }
  
  const resolution = rollUnsignedContractResolution();
  
  switch (resolution.type) {
    case UnsignedResolutionResult.TODOS_CONTINUAM:
      // Nenhuma mudança
      return contracts;
      
    case UnsignedResolutionResult.TODOS_RESOLVIDOS:
      return contracts.map((contract) =>
        unsignedContracts.includes(contract)
          ? { ...contract, status: ContractStatus.RESOLVIDO_POR_OUTROS, completedAt: new Date() }
          : contract
      );
      
    case UnsignedResolutionResult.MENORES_XP_RESOLVIDOS: {
      // Ordenar por XP e pegar os menores
      const sortedByXP = [...unsignedContracts].sort((a, b) => a.value.experienceValue - b.value.experienceValue);
      const halfCount = Math.ceil(sortedByXP.length / 2);
      const toResolve = sortedByXP.slice(0, halfCount);
      
      return contracts.map((contract) =>
        toResolve.includes(contract)
          ? { ...contract, status: ContractStatus.RESOLVIDO_POR_OUTROS, completedAt: new Date() }
          : contract
      );
    }
    
    case UnsignedResolutionResult.MELHORES_RECOMPENSAS_RESOLVIDOS: {
      // Ordenar por recompensa e pegar os melhores
      const sortedByReward = [...unsignedContracts].sort((a, b) => b.value.finalGoldReward - a.value.finalGoldReward);
      const halfCount = Math.ceil(sortedByReward.length / 2);
      const toResolve = sortedByReward.slice(0, halfCount);
      
      return contracts.map((contract) =>
        toResolve.includes(contract)
          ? { ...contract, status: ContractStatus.RESOLVIDO_POR_OUTROS, completedAt: new Date() }
          : contract
      );
    }
    
    case UnsignedResolutionResult.ALEATORIOS_RESOLVIDOS: {
      // Resolver quantidade aleatória
      const count = Math.min(resolution.count || 1, unsignedContracts.length);
      const shuffled = [...unsignedContracts].sort(() => Math.random() - 0.5);
      const toResolve = shuffled.slice(0, count);
      
      return contracts.map((contract) =>
        toResolve.includes(contract)
          ? { ...contract, status: ContractStatus.RESOLVIDO_POR_OUTROS, completedAt: new Date() }
          : contract
      );
    }
    
    case UnsignedResolutionResult.ASSINADOS_NAO_RESOLVIDOS: {
      // Marcar como aceitos mas não resolvidos
      const count = Math.min(resolution.count || 1, unsignedContracts.length);
      const shuffled = [...unsignedContracts].sort(() => Math.random() - 0.5);
      const toSign = shuffled.slice(0, count);
      
      return contracts.map((contract) => {
        if (toSign.includes(contract)) {
          // Rolar motivo de não resolução
          const reasonResult = rollOnTable({
            table: CONTRACT_FAILURE_REASONS_TABLE,
            context: "Motivo para não resolução de contrato assinado",
          });
          
          if ((reasonResult.result as FailureReason) === FailureReason.PICARETAGEM ||
              (reasonResult.result as FailureReason) === FailureReason.CONTRATANTE_MORTO) {
            return { ...contract, status: ContractStatus.ANULADO };
          } else {
            return {
              ...contract,
              status: ContractStatus.DISPONIVEL,
              value: {
                ...contract.value,
                rewardValue: contract.value.rewardValue + UNRESOLVED_CONTRACT_BONUS, // Aumentar recompensa
                finalGoldReward: (contract.value.rewardValue + UNRESOLVED_CONTRACT_BONUS) * 0.1,
              },
            };
          }
        }
        return contract;
      });
    }
    
    case UnsignedResolutionResult.MOTIVO_ESTRANHO:
      // Nenhuma mudança, mas poderia adicionar flag para motivo estranho
      return contracts;
      
    default:
      return contracts;
  }
}

/**
 * Aumenta recompensa de contratos não resolvidos
 */
export function increaseUnresolvedContractRewards(contracts: Contract[]): Contract[] {
  return contracts.map((contract) => {
    // Contratos que voltaram a ficar disponíveis após não serem resolvidos
    if (contract.status === ContractStatus.DISPONIVEL && 
        contract.value.rewardValue > 0) { // Assumindo que houve aumento anterior
      return {
        ...contract,
        value: {
          ...contract.value,
          rewardValue: contract.value.rewardValue + UNRESOLVED_CONTRACT_BONUS,
          finalGoldReward: (contract.value.rewardValue + UNRESOLVED_CONTRACT_BONUS) * 0.1,
        },
      };
    }
    return contract;
  });
}

// ===== SISTEMA COMPLETO DE GERENCIAMENTO =====

/**
 * Interface para estado persistente do gerenciador
 */
export interface ContractLifecycleState {
  resolutionTimes: ContractResolutionTime | null;
  nextNewContractsTime: number | null;
  lastResolutionDate: string | null;
  lastNewContractsDate: string | null;
}

/**
 * Sistema completo de ciclo de vida de contratos
 */
export class ContractLifecycleManager {
  private resolutionTimes: ContractResolutionTime | null = null;
  private nextNewContractsTime: number | null = null;
  private lastResolutionDate: Date | null = null;
  private lastNewContractsDate: Date | null = null;

  /**
   * Inicializa tempos de resolução
   */
  initializeResolutionTimes(): void {
    this.resolutionTimes = generateResolutionTimes();
    this.nextNewContractsTime = rollNewContractsTime();
    this.lastResolutionDate = new Date();
    this.lastNewContractsDate = new Date();
  }

  /**
   * Verifica se é hora de resolver contratos
   */
  shouldResolveContracts(): boolean {
    if (!this.resolutionTimes || !this.lastResolutionDate) {
      return false;
    }

    const now = new Date();
    const daysPassed = Math.floor(
      (now.getTime() - this.lastResolutionDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysPassed >= Math.min(this.resolutionTimes.signed, this.resolutionTimes.unsigned);
  }

  /**
   * Verifica se é hora de gerar novos contratos
   */
  shouldGenerateNewContracts(): boolean {
    if (!this.nextNewContractsTime || !this.lastNewContractsDate) {
      return false;
    }

    const now = new Date();
    const daysPassed = Math.floor(
      (now.getTime() - this.lastNewContractsDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    return daysPassed >= this.nextNewContractsTime;
  }

  /**
   * Processa resolução automática de contratos
   */
  processContractResolution(contracts: Contract[]): Contract[] {
    if (!this.shouldResolveContracts()) {
      return contracts;
    }

    // Aplicar resoluções
    let updatedContracts = applySignedContractResolution(contracts);
    updatedContracts = applyUnsignedContractResolution(updatedContracts);

    // Resetar tempos para próxima resolução
    this.resolutionTimes = generateResolutionTimes();
    this.lastResolutionDate = new Date();

    return updatedContracts;
  }

  /**
   * Marca que novos contratos foram gerados
   */
  markNewContractsGenerated(): void {
    this.nextNewContractsTime = rollNewContractsTime();
    this.lastNewContractsDate = new Date();
  }

  /**
   * Obter informações sobre próximas ações
   */
  getNextActions(currentGameDate?: Date): {
    daysUntilResolution: number | null;
    daysUntilNewContracts: number | null;
  } {
    const now = currentGameDate || new Date();
    
    let daysUntilResolution: number | null = null;
    if (this.resolutionTimes && this.lastResolutionDate) {
      const daysPassed = Math.floor(
        (now.getTime() - this.lastResolutionDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const minResolutionTime = Math.min(this.resolutionTimes.signed, this.resolutionTimes.unsigned);
      daysUntilResolution = Math.max(0, minResolutionTime - daysPassed);
    }

    let daysUntilNewContracts: number | null = null;
    if (this.nextNewContractsTime && this.lastNewContractsDate) {
      const daysPassed = Math.floor(
        (now.getTime() - this.lastNewContractsDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      daysUntilNewContracts = Math.max(0, this.nextNewContractsTime - daysPassed);
    }

    return {
      daysUntilResolution,
      daysUntilNewContracts,
    };
  }

  /**
   * Exportar estado para persistência
   */
  exportState(): ContractLifecycleState {
    return {
      resolutionTimes: this.resolutionTimes,
      nextNewContractsTime: this.nextNewContractsTime,
      lastResolutionDate: this.lastResolutionDate?.toISOString() || null,
      lastNewContractsDate: this.lastNewContractsDate?.toISOString() || null,
    };
  }

  /**
   * Importar estado da persistência
   */
  importState(state: ContractLifecycleState): void {
    this.resolutionTimes = state.resolutionTimes;
    this.nextNewContractsTime = state.nextNewContractsTime;
    this.lastResolutionDate = state.lastResolutionDate ? new Date(state.lastResolutionDate) : null;
    this.lastNewContractsDate = state.lastNewContractsDate ? new Date(state.lastNewContractsDate) : null;
  }

  /**
   * Força a resolução automática de contratos (para debugging/testing)
   */
  forceContractResolution(contracts: Contract[]): Contract[] {
    let updatedContracts = applySignedContractResolution(contracts);
    updatedContracts = applyUnsignedContractResolution(updatedContracts);
    return updatedContracts;
  }
}

// ===== FUNÇÕES UTILITÁRIAS ADICIONAIS =====

/**
 * Marca contratos expirados
 */
export function markExpiredContracts(contracts: Contract[]): Contract[] {
  return contracts.map(contract => {
    if (contract.status === ContractStatus.DISPONIVEL && isContractExpired(contract)) {
      return {
        ...contract,
        status: ContractStatus.EXPIRADO
      };
    }
    return contract;
  });
}

/**
 * Obter estatísticas de resolução de contratos
 */
export function getContractResolutionStats(contracts: Contract[]): {
  total: number;
  resolved: number;
  failed: number;
  expired: number;
  active: number;
  available: number;
  resolutionRate: number;
} {
  const total = contracts.length;
  const resolved = contracts.filter(c => 
    c.status === ContractStatus.CONCLUIDO || 
    c.status === ContractStatus.RESOLVIDO_POR_OUTROS
  ).length;
  const failed = contracts.filter(c => 
    c.status === ContractStatus.FALHOU || 
    c.status === ContractStatus.QUEBRADO ||
    c.status === ContractStatus.ANULADO
  ).length;
  const expired = contracts.filter(c => c.status === ContractStatus.EXPIRADO).length;
  const active = contracts.filter(c => 
    c.status === ContractStatus.ACEITO || 
    c.status === ContractStatus.EM_ANDAMENTO
  ).length;
  const available = contracts.filter(c => c.status === ContractStatus.DISPONIVEL).length;
  
  const resolutionRate = total > 0 ? (resolved / total) * 100 : 0;

  return {
    total,
    resolved,
    failed,
    expired,
    active,
    available,
    resolutionRate
  };
}

/**
 * Aplica o bônus de +2 na recompensa para contratos não resolvidos
 */
export function applyUnresolvedBonus(contract: Contract): Contract {
  return {
    ...contract,
    value: {
      ...contract.value,
      rewardValue: contract.value.rewardValue + UNRESOLVED_CONTRACT_BONUS,
      finalGoldReward: (contract.value.rewardValue + UNRESOLVED_CONTRACT_BONUS) * 0.1,
    },
  };
}

/**
 * Processa expiração de prazos de contratos
 */
export function processContractDeadlines(contracts: Contract[], currentDate: Date = new Date()): Contract[] {
  return contracts.map(contract => {
    // Verificar se o prazo expirou para contratos em andamento
    if (contract.status === ContractStatus.EM_ANDAMENTO && contract.expiresAt && currentDate > contract.expiresAt) {
      return {
        ...contract,
        status: ContractStatus.FALHOU
      };
    }
    
    // Verificar se contratos disponíveis expiraram
    if (contract.status === ContractStatus.DISPONIVEL && contract.expiresAt && currentDate > contract.expiresAt) {
      return {
        ...contract,
        status: ContractStatus.EXPIRADO
      };
    }
    
    return contract;
  });
}
