// Contracts Store
import { defineStore } from "pinia";
import { ref, computed, readonly } from "vue";
import type { Contract } from "@/types/contract";
import {
  ContractStatus,
  ContractDifficulty,
  ContractorType,
  DeadlineType,
  calculateBreachPenalty,
} from "@/types/contract";
import {
  ContractLifecycleManager,
  type ContractLifecycleState,
  markExpiredContracts,
  processContractDeadlines,
  getContractResolutionStats,
} from "@/utils/generators/contractLifeCycle";
import {
  ContractGenerator,
  type ContractGenerationConfig,
} from "@/utils/generators/contractGenerator";
import { useGuildStore } from "./guild";
import { useStorage } from "@/composables/useStorage";

export const useContractsStore = defineStore("contracts", () => {
  // Estado dos contratos
  const contracts = ref<Contract[]>([]);
  const isLoading = ref(false);
  const lastUpdate = ref<Date | null>(null);
  const generationError = ref<string | null>(null);

  // Gerenciador de ciclo de vida
  const lifecycleManager = new ContractLifecycleManager();

  // Filtros
  const filters = ref({
    status: null as ContractStatus | null,
    difficulty: null as ContractDifficulty | null,
    contractor: null as ContractorType | null,
    searchText: "",
    minValue: null as number | null,
    maxValue: null as number | null,
    hasDeadline: null as boolean | null,
  });

  // Persistência
  const storage = useStorage("contracts-store", {
    contracts: [] as Contract[],
    lastUpdate: null as string | null,
    lifecycle: {} as ContractLifecycleState,
  });

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

  // Contratos filtrados baseado nos filtros ativos
  const filteredContracts = computed(() => {
    let result = contracts.value;

    // Filtro por status
    if (filters.value.status !== null) {
      result = result.filter((c) => c.status === filters.value.status);
    }

    // Filtro por dificuldade
    if (filters.value.difficulty !== null) {
      result = result.filter((c) => c.difficulty === filters.value.difficulty);
    }

    // Filtro por contratante
    if (filters.value.contractor !== null) {
      result = result.filter(
        (c) => c.contractorType === filters.value.contractor
      );
    }

    // Filtro por texto (busca em título, descrição, objetivo)
    if (filters.value.searchText.trim()) {
      const searchLower = filters.value.searchText.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(searchLower) ||
          c.description.toLowerCase().includes(searchLower) ||
          c.objective?.description.toLowerCase().includes(searchLower) ||
          c.contractorName?.toLowerCase().includes(searchLower)
      );
    }

    // Filtro por valor mínimo
    if (filters.value.minValue !== null) {
      result = result.filter(
        (c) => c.value.finalGoldReward >= filters.value.minValue!
      );
    }

    // Filtro por valor máximo
    if (filters.value.maxValue !== null) {
      result = result.filter(
        (c) => c.value.finalGoldReward <= filters.value.maxValue!
      );
    }

    // Filtro por prazo
    if (filters.value.hasDeadline !== null) {
      if (filters.value.hasDeadline) {
        result = result.filter(
          (c) => c.deadline.type !== DeadlineType.SEM_PRAZO
        );
      } else {
        result = result.filter(
          (c) => c.deadline.type === DeadlineType.SEM_PRAZO
        );
      }
    }

    return result;
  });

  // Estatísticas dos contratos filtrados
  const filteredStats = computed(() => {
    const filtered = filteredContracts.value;
    return {
      total: filtered.length,
      available: filtered.filter((c) => c.status === ContractStatus.DISPONIVEL)
        .length,
      accepted: filtered.filter((c) => c.status === ContractStatus.ACEITO)
        .length,
      inProgress: filtered.filter(
        (c) => c.status === ContractStatus.EM_ANDAMENTO
      ).length,
      completed: filtered.filter(
        (c) =>
          c.status === ContractStatus.CONCLUIDO ||
          c.status === ContractStatus.RESOLVIDO_POR_OUTROS
      ).length,
      failed: filtered.filter(
        (c) =>
          c.status === ContractStatus.FALHOU ||
          c.status === ContractStatus.QUEBRADO ||
          c.status === ContractStatus.ANULADO
      ).length,
      totalValue: filtered.reduce((sum, c) => sum + c.value.finalGoldReward, 0),
      averageValue:
        filtered.length > 0
          ? filtered.reduce((sum, c) => sum + c.value.finalGoldReward, 0) /
            filtered.length
          : 0,
    };
  });

  // Estatísticas gerais
  const contractStats = computed(() =>
    getContractResolutionStats(contracts.value)
  );

  // Informações do gerenciador de ciclo de vida
  const nextActions = computed(() => lifecycleManager.getNextActions());

  // ===== ACTIONS =====

  /**
   * Inicializa o store carregando dados persistidos
   */
  const initializeStore = async () => {
    try {
      storage.load();
      if (storage.data.value.contracts.length > 0) {
        contracts.value = storage.data.value.contracts;
        lastUpdate.value = storage.data.value.lastUpdate
          ? new Date(storage.data.value.lastUpdate)
          : null;

        if (Object.keys(storage.data.value.lifecycle).length > 0) {
          lifecycleManager.importState(storage.data.value.lifecycle);
        }
      }
    } catch (error) {
      generationError.value = "Erro ao carregar dados salvos";
    }
  };

  /**
   * Salva o estado atual no storage
   */
  const saveToStorage = () => {
    try {
      storage.data.value = {
        contracts: contracts.value,
        lastUpdate: lastUpdate.value?.toISOString() || null,
        lifecycle: lifecycleManager.exportState(),
      };
    } catch (error) {
      // Erro silencioso no salvamento
    }
  };

  /**
   * Inicializa o gerenciador de ciclo de vida
   */
  const initializeLifecycle = () => {
    lifecycleManager.initializeResolutionTimes();
  };

  /**
   * Gera novos contratos baseado na guilda atual
   */
  const generateContracts = async () => {
    const guildStore = useGuildStore();
    const currentGuild = guildStore.currentGuild;

    if (!currentGuild) {
      generationError.value = "Nenhuma guilda selecionada para gerar contratos";
      return;
    }

    isLoading.value = true;
    generationError.value = null;

    try {
      const config: ContractGenerationConfig = {
        guild: currentGuild,
        skipFrequentatorsReduction: false,
      };

      const newContracts = ContractGenerator.generateMultipleContracts(config);

      // Adicionar novos contratos
      contracts.value.push(...newContracts);

      lifecycleManager.markNewContractsGenerated();
      lastUpdate.value = new Date();
      saveToStorage();
    } catch (error) {
      generationError.value =
        error instanceof Error ? error.message : "Erro desconhecido na geração";
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
    contracts.value = lifecycleManager.processContractResolution(
      contracts.value
    );

    lastUpdate.value = new Date();
    saveToStorage();
  };

  /**
   * Força a resolução automática de contratos (para teste/debug)
   */
  const forceResolution = () => {
    contracts.value = lifecycleManager.forceContractResolution(contracts.value);
    lastUpdate.value = new Date();
    saveToStorage();
  };

  /**
   * Aceita um contrato
   */
  const acceptContract = (contractId: string) => {
    const contract = contracts.value.find((c) => c.id === contractId);
    if (contract && contract.status === ContractStatus.DISPONIVEL) {
      contract.status = ContractStatus.ACEITO;
      lastUpdate.value = new Date();
      saveToStorage();
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
      saveToStorage();
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
      saveToStorage();
    }
  };

  /**
   * Marca um contrato como falhado
   */
  const failContract = (contractId: string) => {
    const contract = contracts.value.find((c) => c.id === contractId);
    if (
      contract &&
      (contract.status === ContractStatus.ACEITO ||
        contract.status === ContractStatus.EM_ANDAMENTO)
    ) {
      contract.status = ContractStatus.FALHOU;
      lastUpdate.value = new Date();
      saveToStorage();
    }
  };

  /**
   * Quebra um contrato (aplica penalidade)
   * 10% da recompensa em PO$ como multa
   */
  const breakContract = (contractId: string): number => {
    const contract = contracts.value.find((c) => c.id === contractId);
    if (
      contract &&
      (contract.status === ContractStatus.ACEITO ||
        contract.status === ContractStatus.EM_ANDAMENTO)
    ) {
      contract.status = ContractStatus.QUEBRADO;
      lastUpdate.value = new Date();
      saveToStorage();

      // Retorna o valor da penalidade (10% da recompensa)
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
      saveToStorage();
    }
  };

  /**
   * Adiciona um novo contrato
   */
  const addContract = (contract: Contract) => {
    contracts.value.push(contract);
    lastUpdate.value = new Date();
    saveToStorage();
  };

  /**
   * Remove um contrato
   */
  const removeContract = (contractId: string) => {
    const index = contracts.value.findIndex((c) => c.id === contractId);
    if (index >= 0) {
      contracts.value.splice(index, 1);
      lastUpdate.value = new Date();
      saveToStorage();
    }
  };

  /**
   * Limpa todos os contratos
   */
  const clearContracts = () => {
    contracts.value = [];
    lastUpdate.value = new Date();
    saveToStorage();
  };

  /**
   * Obtém um contrato por ID
   */
  const getContractById = (contractId: string): Contract | undefined => {
    return contracts.value.find((c) => c.id === contractId);
  };

  // ===== FILTROS =====

  /**
   * Define filtro por status
   */
  const setStatusFilter = (status: ContractStatus | null) => {
    filters.value.status = status;
  };

  /**
   * Define filtro por dificuldade
   */
  const setDifficultyFilter = (difficulty: ContractDifficulty | null) => {
    filters.value.difficulty = difficulty;
  };

  /**
   * Define filtro por contratante
   */
  const setContractorFilter = (contractor: ContractorType | null) => {
    filters.value.contractor = contractor;
  };

  /**
   * Define filtro por texto de busca
   */
  const setSearchFilter = (searchText: string) => {
    filters.value.searchText = searchText;
  };

  /**
   * Define filtro por faixa de valores
   */
  const setValueRangeFilter = (min: number | null, max: number | null) => {
    filters.value.minValue = min;
    filters.value.maxValue = max;
  };

  /**
   * Define filtro por prazo
   */
  const setDeadlineFilter = (hasDeadline: boolean | null) => {
    filters.value.hasDeadline = hasDeadline;
  };

  /**
   * Limpa todos os filtros
   */
  const clearFilters = () => {
    filters.value = {
      status: null,
      difficulty: null,
      contractor: null,
      searchText: "",
      minValue: null,
      maxValue: null,
      hasDeadline: null,
    };
  };

  // ===== ESTADO E VERIFICAÇÕES =====

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
   * Exporta estado para persistência externa (backup/debug)
   */
  const exportState = () => {
    return {
      contracts: contracts.value,
      lastUpdate: lastUpdate.value?.toISOString() || null,
      lifecycle: lifecycleManager.exportState(),
      filters: filters.value,
    };
  };

  /**
   * Importa estado da persistência externa
   */
  const importState = (state: {
    contracts: Contract[];
    lastUpdate: string | null;
    lifecycle: ContractLifecycleState;
    filters?: typeof filters.value;
  }) => {
    contracts.value = state.contracts;
    lastUpdate.value = state.lastUpdate ? new Date(state.lastUpdate) : null;
    lifecycleManager.importState(state.lifecycle);

    if (state.filters) {
      filters.value = { ...filters.value, ...state.filters };
    }

    saveToStorage();
  };

  /**
   * Processa automaticamente o ciclo de vida se necessário
   */
  const autoProcessLifecycle = () => {
    if (shouldProcessLifecycle()) {
      processContractLifecycle();
    }
  };

  /**
   * Atualiza as estatísticas e processa ciclo se necessário
   */
  const updateAndProcess = () => {
    autoProcessLifecycle();
    lastUpdate.value = new Date();
    saveToStorage();
  };

  // Inicializa o store na criação
  initializeLifecycle();
  initializeStore();

  return {
    // ===== ESTADO =====
    contracts: readonly(contracts),
    isLoading: readonly(isLoading),
    lastUpdate: readonly(lastUpdate),
    generationError: readonly(generationError),
    filters: readonly(filters),

    // ===== COMPUTED =====
    availableContracts,
    acceptedContracts,
    inProgressContracts,
    completedContracts,
    failedContracts,
    expiredContracts,
    filteredContracts,
    filteredStats,
    contractStats,
    nextActions,

    // ===== ACTIONS - Geração e Ciclo de Vida =====
    generateContracts,
    processContractLifecycle,
    forceResolution,
    autoProcessLifecycle,
    updateAndProcess,

    // ===== ACTIONS - Gerenciamento Manual =====
    acceptContract,
    startContract,
    completeContract,
    failContract,
    breakContract,
    cancelContract,

    // ===== ACTIONS - CRUD =====
    addContract,
    removeContract,
    clearContracts,
    getContractById,

    // ===== ACTIONS - Filtros =====
    setStatusFilter,
    setDifficultyFilter,
    setContractorFilter,
    setSearchFilter,
    setValueRangeFilter,
    setDeadlineFilter,
    clearFilters,

    // ===== ACTIONS - Estado =====
    shouldProcessLifecycle,
    shouldGenerateNewContracts,
    exportState,
    importState,
    initializeStore,

    // ===== FUNÇÕES DO GERENCIADOR =====
    initializeLifecycle,
  };
});

export type ContractsStore = ReturnType<typeof useContractsStore>;
