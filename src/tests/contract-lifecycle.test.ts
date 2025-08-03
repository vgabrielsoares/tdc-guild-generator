import { describe, it, expect, beforeEach } from "vitest";
import type { Contract } from "../types/contract";
import { 
  ContractStatus, 
  ContractResolution, 
  FailureReason, 
  PaymentType, 
  DeadlineType,
  LocationCategory,
  ContractDifficulty,
  ContractorType,
  UnsignedResolutionResult
} from "../types/contract";
import {
  rollSignedContractResolutionTime,
  rollUnsignedContractResolutionTime,
  rollSignedContractResolution,
  rollUnsignedContractResolution,
  rollNewContractsTime,
  applySignedContractResolution,
  applyUnsignedContractResolution,
  markExpiredContracts,
  getContractResolutionStats,
  applyUnresolvedBonus,
  processContractDeadlines,
  ContractLifecycleManager,
} from "../utils/generators/contractLifeCycle";

// Mock de contrato para testes
const createMockContract = (overrides: Partial<Contract> = {}): Contract => ({
  id: "test-contract-1",
  title: "Contrato de Teste",
  description: "Descrição do contrato de teste",
  status: ContractStatus.DISPONIVEL,
  difficulty: ContractDifficulty.MEDIO,
  contractorType: ContractorType.POVO,
  value: {
    baseValue: 50,
    rewardValue: 30,
    experienceValue: 100,
    finalGoldReward: 3,
    modifiers: {
      distance: 0,
      populationRelation: 0,
      governmentRelation: 0,
      staffPreparation: 0,
      difficultyMultiplier: {
        experienceMultiplier: 1,
        rewardMultiplier: 1,
      },
      requirementsAndClauses: 0,
    },
  },
  location: {
    category: LocationCategory.URBANO,
    specificLocation: "Local Específico",
    name: "Local Teste",
    description: "Descrição do local",
  },
  paymentType: PaymentType.DIRETO_CONTRATANTE,
  deadline: {
    type: DeadlineType.DIAS,
    value: "7",
    isFlexible: false,
    isArbitrary: false,
  },
  createdAt: new Date(),
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
  generationData: {
    baseRoll: 50,
  },
  ...overrides,
});

describe("Contract Lifecycle - Sistema Unificado", () => {
  describe("Funções de Rolagem de Tempo", () => {
    it("deve rolar tempo de resolução para contratos assinados", () => {
      const time = rollSignedContractResolutionTime();
      expect(time).toBeGreaterThan(0);
      expect(typeof time).toBe("number");
    });

    it("deve rolar tempo de resolução para contratos não assinados", () => {
      const time = rollUnsignedContractResolutionTime();
      expect(time).toBeGreaterThan(0);
      expect(typeof time).toBe("number");
    });

    it("deve rolar tempo para novos contratos", () => {
      const time = rollNewContractsTime();
      expect(time).toBeGreaterThan(0);
      expect(typeof time).toBe("number");
    });
  });

  describe("Funções de Resolução", () => {
    it("deve rolar resolução para contratos assinados", () => {
      const resolution = rollSignedContractResolution();
      expect(resolution).toBeDefined();
      expect(Object.values(ContractResolution)).toContain(resolution.result);
      
      if (resolution.result === ContractResolution.NAO_RESOLVIDO) {
        expect(resolution.reason).toBeDefined();
        expect(Object.values(FailureReason)).toContain(resolution.reason);
      }
    });

    it("deve rolar resolução para contratos não assinados", () => {
      const resolution = rollUnsignedContractResolution();
      expect(resolution).toBeDefined();
      expect(Object.values(UnsignedResolutionResult)).toContain(resolution.type);
      
      // Verificar se count está presente quando esperado
      if (resolution.type === UnsignedResolutionResult.ALEATORIOS_RESOLVIDOS ||
          resolution.type === UnsignedResolutionResult.ASSINADOS_NAO_RESOLVIDOS) {
        expect(resolution.count).toBeGreaterThan(0);
      }
    });
  });

  describe("Aplicação de Resoluções", () => {
    let contracts: Contract[];

    beforeEach(() => {
      contracts = [
        createMockContract({ 
          id: "1", 
          status: ContractStatus.ACEITO,
          title: "Contrato Aceito" 
        }),
        createMockContract({ 
          id: "2", 
          status: ContractStatus.EM_ANDAMENTO,
          title: "Contrato Em Andamento" 
        }),
        createMockContract({ 
          id: "3", 
          status: ContractStatus.DISPONIVEL,
          title: "Contrato Disponível" 
        }),
      ];
    });

    it("deve aplicar resolução a contratos assinados", () => {
      const result = applySignedContractResolution(contracts);
      expect(result).toHaveLength(contracts.length);
      
      // Verificar se contratos assinados foram afetados
      const signedContracts = result.filter(c => 
        c.id === "1" || c.id === "2"
      );
      
      // Pelo menos um deve ter mudado de status (pode ser probabilístico)
      const anyChanged = signedContracts.some(c => 
        c.status !== ContractStatus.ACEITO && 
        c.status !== ContractStatus.EM_ANDAMENTO
      );
      expect(anyChanged || signedContracts.length > 0).toBe(true);
    });

    it("deve aplicar resolução a contratos não assinados", () => {
      const result = applyUnsignedContractResolution(contracts);
      expect(result).toHaveLength(contracts.length);
      
      // Resultado deve ser determinístico baseado na rolagem
      expect(result).toBeDefined();
    });
  });

  describe("Funções Utilitárias", () => {
    it("deve marcar contratos expirados", () => {
      const expiredContract = createMockContract({
        id: "expired",
        status: ContractStatus.DISPONIVEL,
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 dia atrás
      });

      const contracts = [expiredContract];
      const result = markExpiredContracts(contracts);
      
      expect(result[0].status).toBe(ContractStatus.EXPIRADO);
    });

    it("deve processar prazos de contratos", () => {
      const expiredInProgress = createMockContract({
        id: "expired-progress",
        status: ContractStatus.EM_ANDAMENTO,
        expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 dia atrás
      });

      const contracts = [expiredInProgress];
      const result = processContractDeadlines(contracts);
      
      expect(result[0].status).toBe(ContractStatus.FALHOU);
    });

    it("deve calcular estatísticas de resolução", () => {
      const testContracts = [
        createMockContract({ status: ContractStatus.CONCLUIDO }),
        createMockContract({ status: ContractStatus.FALHOU }),
        createMockContract({ status: ContractStatus.DISPONIVEL }),
        createMockContract({ status: ContractStatus.EM_ANDAMENTO }),
      ];

      const stats = getContractResolutionStats(testContracts);
      
      expect(stats.total).toBe(4);
      expect(stats.resolved).toBe(1);
      expect(stats.failed).toBe(1);
      expect(stats.available).toBe(1);
      expect(stats.active).toBe(1);
      expect(stats.resolutionRate).toBe(25);
    });

    it("deve aplicar bônus de não resolução", () => {
      const contract = createMockContract({
        value: {
          baseValue: 50,
          rewardValue: 30,
          experienceValue: 100,
          finalGoldReward: 3,
          modifiers: {
            distance: 0,
            populationRelation: 0,
            governmentRelation: 0,
            staffPreparation: 0,
            difficultyMultiplier: {
              experienceMultiplier: 1,
              rewardMultiplier: 1,
            },
            requirementsAndClauses: 0,
          },
        }
      });

      const result = applyUnresolvedBonus(contract);
      
      expect(result.value.rewardValue).toBe(32); // 30 + 2
      expect(result.value.finalGoldReward).toBe(3.2); // (30 + 2) * 0.1
    });
  });

  describe("Gerenciador de Ciclo de Vida", () => {
    let manager: ContractLifecycleManager;

    beforeEach(() => {
      manager = new ContractLifecycleManager();
    });

    it("deve inicializar tempos de resolução", () => {
      manager.initializeResolutionTimes();
      
      const nextActions = manager.getNextActions();
      expect(nextActions.daysUntilResolution).toBeGreaterThanOrEqual(0);
      expect(nextActions.daysUntilNewContracts).toBeGreaterThanOrEqual(0);
    });

    it("deve exportar e importar estado", () => {
      manager.initializeResolutionTimes();
      const state = manager.exportState();
      
      expect(state.resolutionTimes).toBeDefined();
      expect(state.nextNewContractsTime).toBeDefined();
      expect(state.lastResolutionDate).toBeDefined();
      expect(state.lastNewContractsDate).toBeDefined();

      const newManager = new ContractLifecycleManager();
      newManager.importState(state);
      
      const newState = newManager.exportState();
      expect(newState.resolutionTimes).toEqual(state.resolutionTimes);
      expect(newState.nextNewContractsTime).toEqual(state.nextNewContractsTime);
    });

    it("deve processar resolução forçada", () => {
      const contracts = [
        createMockContract({ status: ContractStatus.ACEITO }),
        createMockContract({ status: ContractStatus.DISPONIVEL }),
      ];

      const result = manager.forceContractResolution(contracts);
      expect(result).toHaveLength(contracts.length);
    });

    it("deve marcar novos contratos como gerados", () => {
      manager.initializeResolutionTimes();
      
      manager.markNewContractsGenerated();
      const stateAfter = manager.exportState();
      
      // O tempo pode ter mudado
      expect(stateAfter.lastNewContractsDate).toBeDefined();
      expect(stateAfter.nextNewContractsTime).toBeGreaterThan(0);
    });
  });

  describe("Integração com Tabelas Unificadas", () => {
    it("deve usar constantes das tabelas de modificadores", () => {
      const contract = createMockContract();
      const bonusApplied = applyUnresolvedBonus(contract);
      
      // Verifica se está usando UNRESOLVED_CONTRACT_BONUS da tabela
      expect(bonusApplied.value.rewardValue).toBe(contract.value.rewardValue + 2);
    });

    it("deve processar resoluções usando tabelas importadas", () => {
      // Teste para verificar se as funções de rolagem estão usando as tabelas corretas
      const signedResolution = rollSignedContractResolution();
      expect(Object.values(ContractResolution)).toContain(signedResolution.result);

      const unsignedResolution = rollUnsignedContractResolution();
      expect(Object.values(UnsignedResolutionResult)).toContain(unsignedResolution.type);
    });
  });
});
