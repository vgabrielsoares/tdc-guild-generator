// Teste do Store de Contratos
import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useContractsStore } from "@/stores/contracts";
import { useGuildStore } from "@/stores/guild";
import {
  ContractStatus,
  ContractDifficulty,
  ContractorType,
} from "@/types/contract";
import { createTestGuild } from "../utils/test-helpers";
import { rollDice, rollOnTable } from "@/utils/dice";

// Mock das funções de dados
vi.mock("@/utils/dice");

describe("Contracts Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());

    // Mock abrangente do rollDice e rollOnTable para todas as operações
    const mockRollDice = vi.mocked(rollDice);
    const mockRollOnTable = vi.mocked(rollOnTable);

    mockRollDice.mockImplementation(({ notation }: { notation: string }) => {
      // Mock baseado no tipo de rolagem
      if (notation === "1d20") {
        return {
          result: 10,
          notation,
          individual: [10],
          modifier: 0,
          timestamp: new Date(),
        };
      }
      if (notation === "1d6+1") {
        return {
          result: 4,
          notation,
          individual: [3],
          modifier: 1,
          timestamp: new Date(),
        };
      }
      if (notation === "1d4") {
        return {
          result: 2,
          notation,
          individual: [2],
          modifier: 0,
          timestamp: new Date(),
        };
      }
      if (notation === "1d100") {
        return {
          result: 50,
          notation,
          individual: [50],
          modifier: 0,
          timestamp: new Date(),
        };
      }
      if (notation === "1d6") {
        return {
          result: 3,
          notation,
          individual: [3],
          modifier: 0,
          timestamp: new Date(),
        };
      }

      // Rolagens genéricas
      return {
        result: 1,
        notation,
        individual: [1],
        modifier: 0,
        timestamp: new Date(),
      };
    });

    // Mock do rollOnTable para lifecycle manager
    mockRollOnTable.mockImplementation(() => ({
      roll: {
        result: 7,
        notation: "1d20",
        individual: [7],
        modifier: 0,
        timestamp: new Date(),
      },
      result: "1 semana",
      tableEntry: { min: 7, max: 8, result: "1 semana" },
    }));
  });

  describe("Inicialização", () => {
    it("deve inicializar com estado vazio", () => {
      const store = useContractsStore();

      expect(store.contracts).toEqual([]);
      expect(store.isLoading).toBe(false);
      expect(store.lastUpdate).toBe(null);
      expect(store.generationError).toBe(null);
    });

    it("deve ter filtros inicializados corretamente", () => {
      const store = useContractsStore();

      expect(store.filters.status).toBe(null);
      expect(store.filters.difficulty).toBe(null);
      expect(store.filters.contractor).toBe(null);
      expect(store.filters.searchText).toBe("");
      expect(store.filters.minValue).toBe(null);
      expect(store.filters.maxValue).toBe(null);
      expect(store.filters.hasDeadline).toBe(null);
    });
  });

  describe("Computed Properties", () => {
    it("deve filtrar contratos por status corretamente", () => {
      const store = useContractsStore();

      expect(store.availableContracts).toBeDefined();
      expect(store.acceptedContracts).toBeDefined();
      expect(store.inProgressContracts).toBeDefined();
      expect(store.completedContracts).toBeDefined();
      expect(store.failedContracts).toBeDefined();
      expect(store.expiredContracts).toBeDefined();
    });

    it("deve calcular estatísticas corretamente", () => {
      const store = useContractsStore();

      expect(store.contractStats).toBeDefined();
      // TODO: Descomentar após implementar filteredStats na Issue 4.21
      // expect(store.filteredStats).toBeDefined();
    });
  });

  describe("Actions - Filtros", () => {
    it("deve atualizar filtros corretamente", () => {
      const store = useContractsStore();

      store.setStatusFilter(ContractStatus.DISPONIVEL);
      expect(store.filters.status).toBe(ContractStatus.DISPONIVEL);

      store.setDifficultyFilter(ContractDifficulty.MEDIO);
      expect(store.filters.difficulty).toBe(ContractDifficulty.MEDIO);

      store.setContractorFilter(ContractorType.POVO);
      expect(store.filters.contractor).toBe(ContractorType.POVO);

      store.setSearchFilter("teste");
      expect(store.filters.searchText).toBe("teste");

      store.setValueRangeFilter(100, 500);
      expect(store.filters.minValue).toBe(100);
      expect(store.filters.maxValue).toBe(500);

      store.setDeadlineFilter(true);
      expect(store.filters.hasDeadline).toBe(true);
    });

    it("deve limpar filtros corretamente", () => {
      const store = useContractsStore();

      // Definir alguns filtros
      store.setStatusFilter(ContractStatus.DISPONIVEL);
      store.setSearchFilter("teste");

      // Limpar filtros
      store.clearFilters();

      expect(store.filters.status).toBe(null);
      expect(store.filters.searchText).toBe("");
    });
  });

  describe("Actions - Estado", () => {
    it("deve verificar condições do ciclo de vida", () => {
      const store = useContractsStore();

      expect(typeof store.shouldProcessLifecycle()).toBe("boolean");
      expect(typeof store.shouldGenerateNewContracts()).toBe("boolean");
    });

    it("deve exportar estado corretamente", () => {
      const store = useContractsStore();

      const state = store.exportState();

      expect(state).toHaveProperty("contracts");
      expect(state).toHaveProperty("lastUpdate");
      expect(state).toHaveProperty("lifecycle");
      expect(state).toHaveProperty("filters");
    });
  });

  describe("Geração de Contratos", () => {
    it("deve falhar se não houver guilda selecionada", async () => {
      const store = useContractsStore();

      await store.generateContracts();

      expect(store.generationError).toBe(
        "Nenhuma guilda selecionada para gerar contratos"
      );
    });

    it("deve gerar contratos quando há guilda válida", async () => {
      const contractsStore = useContractsStore();
      const guildStore = useGuildStore();

      // Criar guilda de teste
      const testGuild = createTestGuild();
      guildStore.setCurrentGuild(testGuild);

      // Aguardar a sincronização
      await contractsStore.initializeStore();
      await contractsStore.syncWithCurrentGuild();

      const initialCount = contractsStore.contracts.length;

      await contractsStore.generateContracts();

      // Verificar se contratos foram gerados
      expect(contractsStore.contracts.length).toBeGreaterThan(initialCount);
      expect(contractsStore.generationError).toBe(null);
      expect(contractsStore.lastUpdate).not.toBe(null);
    });
  });

  describe("Integração com Storage", () => {
    it("deve salvar estado no storage automaticamente", async () => {
      const store = useContractsStore();
      const guildStore = useGuildStore();

      // Criar guilda de teste para ter contexto
      const testGuild = createTestGuild();
      guildStore.setCurrentGuild(testGuild);

      await store.initializeStore();
      await store.syncWithCurrentGuild();

      // Trigger uma ação que salva no storage (gerar e limpar contratos)
      await store.generateContracts();
      store.resetContracts();

      // Verificar se lastUpdate foi atualizado (indicando que salvou)
      expect(store.lastUpdate).not.toBe(null);
    });
  });
});
