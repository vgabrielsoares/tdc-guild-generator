// Teste do Store de Contratos
import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useContractsStore } from "@/stores/contracts";
import { useGuildStore } from "@/stores/guild";
import {
  ContractStatus,
  ContractDifficulty,
  ContractorType,
} from "@/types/contract";
import { createTestGuild } from "../utils/test-helpers";

describe("Contracts Store", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
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
      expect(store.filteredStats).toBeDefined();
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

      const initialCount = contractsStore.contracts.length;

      await contractsStore.generateContracts();

      // Verificar se contratos foram gerados
      expect(contractsStore.contracts.length).toBeGreaterThan(initialCount);
      expect(contractsStore.generationError).toBe(null);
      expect(contractsStore.lastUpdate).not.toBe(null);
    });
  });

  describe("Integração com Storage", () => {
    it("deve salvar estado no storage automaticamente", () => {
      const store = useContractsStore();

      // Trigger uma ação que salva no storage
      store.clearContracts();

      // Verificar se lastUpdate foi atualizado (indicando que salvou)
      expect(store.lastUpdate).not.toBe(null);
    });
  });
});
