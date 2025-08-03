// Contracts Store
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Contract } from "@/types/contract";
import { ContractStatus, calculateBreachPenalty } from "@/types/contract";
import {
  ContractLifecycleManager,
  type ContractLifecycleState,
  markExpiredContracts,
  processContractDeadlines,
  getContractResolutionStats,
} from "@/utils/generators/contractLifeCycle";

export const useContractsStore = defineStore("contracts", () => {
  // Estado dos contratos
  const contracts = ref<Contract[]>([]);
  const isLoading = ref(false);
  const lastUpdate = ref<Date | null>(null);

  // Gerenciador de ciclo de vida
  const lifecycleManager = new ContractLifecycleManager();

  // ===== COMPUTED =====

  // Filtros de contratos por status
  const availableContracts = computed(() =>
    contracts.value.filter((c) => c.status === ContractStatus.DISPONIVEL)
  );

  const acceptedContracts = computed(() =>
    contracts.value.filter((c) => c.status === ContractStatus.ACEITO)
  );

  const inProgressContracts = computed(() =>
    contracts.value.filter((c) => c.status === ContractStatus.EM_ANDAMENTO)
  );

  const completedContracts = computed(() =>
    contracts.value.filter(
      (c) =>
        c.status === ContractStatus.CONCLUIDO ||
        c.status === ContractStatus.RESOLVIDO_POR_OUTROS
    )
  );

  const failedContracts = computed(() =>
    contracts.value.filter(
      (c) =>
        c.status === ContractStatus.FALHOU ||
        c.status === ContractStatus.QUEBRADO ||
        c.status === ContractStatus.ANULADO
    )
  );

  const expiredContracts = computed(() =>
    contracts.value.filter((c) => c.status === ContractStatus.EXPIRADO)
  );

  // Estatísticas
  const contractStats = computed(() => getContractResolutionStats(contracts.value));

  // Informações do gerenciador de ciclo de vida
  const nextActions = computed(() => lifecycleManager.getNextActions());

  // ===== ACTIONS =====

  /**
   * Inicializa o gerenciador de ciclo de vida
   */
  const initializeLifecycle = () => {
    lifecycleManager.initializeResolutionTimes();
  };

  /**
   * Gera novos contratos (placeholder - será implementado nas próximas issues)
   */
  const generateContracts = async () => {
    isLoading.value = true;
    try {
      lifecycleManager.markNewContractsGenerated();
      lastUpdate.value = new Date();
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Processa o ciclo de vida dos contratos
   */
  const processContractLifecycle = () => {
    // Verificar prazos expirados
    contracts.value = processContractDeadlines(contracts.value);
    
    // Marcar contratos expirados
    contracts.value = markExpiredContracts(contracts.value);
    
    // Processar resoluções automáticas
    contracts.value = lifecycleManager.processContractResolution(contracts.value);
    
    lastUpdate.value = new Date();
  };

  /**
   * Força a resolução automática de contratos (para teste/debug)
   */
  const forceResolution = () => {
    contracts.value = lifecycleManager.forceContractResolution(contracts.value);
    lastUpdate.value = new Date();
  };

  /**
   * Aceita um contrato
   */
  const acceptContract = (contractId: string) => {
    const contract = contracts.value.find((c) => c.id === contractId);
    if (contract && contract.status === ContractStatus.DISPONIVEL) {
      contract.status = ContractStatus.ACEITO;
      lastUpdate.value = new Date();
    }
  };

  /**
   * Inicia um contrato aceito
   */
  const startContract = (contractId: string) => {
    const contract = contracts.value.find((c) => c.id === contractId);
    if (contract && contract.status === ContractStatus.ACEITO) {
      contract.status = ContractStatus.EM_ANDAMENTO;
      lastUpdate.value = new Date();
    }
  };

  /**
   * Completa um contrato em andamento
   */
  const completeContract = (contractId: string) => {
    const contract = contracts.value.find((c) => c.id === contractId);
    if (contract && contract.status === ContractStatus.EM_ANDAMENTO) {
      contract.status = ContractStatus.CONCLUIDO;
      contract.completedAt = new Date();
      lastUpdate.value = new Date();
    }
  };

  /**
   * Marca um contrato como falhado
   */
  const failContract = (contractId: string) => {
    const contract = contracts.value.find((c) => c.id === contractId);
    if (contract && 
        (contract.status === ContractStatus.ACEITO || 
         contract.status === ContractStatus.EM_ANDAMENTO)) {
      contract.status = ContractStatus.FALHOU;
      lastUpdate.value = new Date();
    }
  };

  /**
   * Quebra um contrato (aplica penalidade)
   */
  const breakContract = (contractId: string): number => {
    const contract = contracts.value.find((c) => c.id === contractId);
    if (contract && 
        (contract.status === ContractStatus.ACEITO || 
         contract.status === ContractStatus.EM_ANDAMENTO)) {
      contract.status = ContractStatus.QUEBRADO;
      lastUpdate.value = new Date();
      
      // Retorna o valor da penalidade
      return calculateBreachPenalty(contract.value.finalGoldReward);
    }
    return 0;
  };

  /**
   * Cancela/anula um contrato
   */
  const cancelContract = (contractId: string) => {
    const contract = contracts.value.find((c) => c.id === contractId);
    if (contract) {
      contract.status = ContractStatus.ANULADO;
      lastUpdate.value = new Date();
    }
  };

  /**
   * Adiciona um novo contrato
   */
  const addContract = (contract: Contract) => {
    contracts.value.push(contract);
    lastUpdate.value = new Date();
  };

  /**
   * Remove um contrato
   */
  const removeContract = (contractId: string) => {
    const index = contracts.value.findIndex((c) => c.id === contractId);
    if (index >= 0) {
      contracts.value.splice(index, 1);
      lastUpdate.value = new Date();
    }
  };

  /**
   * Limpa todos os contratos
   */
  const clearContracts = () => {
    contracts.value = [];
    lastUpdate.value = new Date();
  };

  /**
   * Obtém um contrato por ID
   */
  const getContractById = (contractId: string): Contract | undefined => {
    return contracts.value.find((c) => c.id === contractId);
  };

  /**
   * Verifica se é hora de processar resoluções
   */
  const shouldProcessLifecycle = (): boolean => {
    return lifecycleManager.shouldResolveContracts();
  };

  /**
   * Verifica se é hora de gerar novos contratos
   */
  const shouldGenerateNewContracts = (): boolean => {
    return lifecycleManager.shouldGenerateNewContracts();
  };

  /**
   * Exporta estado para persistência
   */
  const exportState = () => {
    return {
      contracts: contracts.value,
      lastUpdate: lastUpdate.value?.toISOString() || null,
      lifecycle: lifecycleManager.exportState(),
    };
  };

  /**
   * Importa estado da persistência
   */
  const importState = (state: {
    contracts: Contract[];
    lastUpdate: string | null;
    lifecycle: ContractLifecycleState;
  }) => {
    contracts.value = state.contracts;
    lastUpdate.value = state.lastUpdate ? new Date(state.lastUpdate) : null;
    lifecycleManager.importState(state.lifecycle);
  };

  /**
   * Processa automaticamente o ciclo de vida se necessário
   */
  const autoProcessLifecycle = () => {
    if (shouldProcessLifecycle()) {
      processContractLifecycle();
    }
  };

  // Inicializa o gerenciador na criação do store
  initializeLifecycle();

  return {
    // Estado
    contracts,
    isLoading,
    lastUpdate,

    // Computed
    availableContracts,
    acceptedContracts,
    inProgressContracts,
    completedContracts,
    failedContracts,
    expiredContracts,
    contractStats,
    nextActions,

    // Actions - Geração
    generateContracts,
    
    // Actions - Ciclo de Vida
    processContractLifecycle,
    forceResolution,
    autoProcessLifecycle,
    
    // Actions - Gerenciamento Manual
    acceptContract,
    startContract,
    completeContract,
    failContract,
    breakContract,
    cancelContract,
    
    // Actions - CRUD
    addContract,
    removeContract,
    clearContracts,
    getContractById,
    
    // Actions - Estado
    shouldProcessLifecycle,
    shouldGenerateNewContracts,
    exportState,
    importState,
    
    // Funções do gerenciador
    initializeLifecycle,
  };
});

export type ContractsStore = ReturnType<typeof useContractsStore>;
