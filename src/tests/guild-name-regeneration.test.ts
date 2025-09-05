import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useGuildStore } from "@/stores/guild";
import { SettlementType } from "@/types/guild";

// Mock do gerador de nomes
vi.mock("@/data/guild-names", () => ({
  generateRandomGuildName: vi.fn().mockReturnValue("Nome Regenerado"),
}));

describe("Guild Name Regeneration", () => {
  beforeEach(() => {
    // Limpar localStorage antes de cada teste para evitar interferência
    localStorage.clear();
    setActivePinia(createPinia());
  });

  describe("regenerateGuildName", () => {
    it("should regenerate guild name preserving all other data", async () => {
      const store = useGuildStore();

      // Gerar uma guilda inicial
      const originalGuild = await store.generateGuild({
        settlementType: SettlementType.ALDEIA,
        name: "Nome Original",
        saveToHistory: false,
      });

      const originalStructure = originalGuild.structure;
      const originalRelations = originalGuild.relations;
      const originalStaff = originalGuild.staff;
      const originalResources = originalGuild.resources;
      const originalVisitors = originalGuild.visitors;
      const originalSettlementType = originalGuild.settlementType;
      const originalCreatedAt = originalGuild.createdAt;

      // Regenerar apenas o nome
      await store.regenerateGuildName();

      const regeneratedGuild = store.currentGuild;

      expect(regeneratedGuild).toBeDefined();
      expect(regeneratedGuild?.name).toBe("Nome Regenerado");

      // Verificar que todos os outros dados foram preservados
      expect(regeneratedGuild?.structure).toEqual(originalStructure);
      expect(regeneratedGuild?.relations).toEqual(originalRelations);
      expect(regeneratedGuild?.staff).toEqual(originalStaff);
      expect(regeneratedGuild?.resources).toEqual(originalResources);
      expect(regeneratedGuild?.visitors).toEqual(originalVisitors);
      expect(regeneratedGuild?.settlementType).toBe(originalSettlementType);
      expect(regeneratedGuild?.createdAt).toEqual(originalCreatedAt);

      // Verificar que updatedAt foi definido
      expect(regeneratedGuild?.updatedAt).toBeDefined();
      expect(regeneratedGuild?.updatedAt).toBeInstanceOf(Date);
    });

    it("should throw error when no current guild exists", async () => {
      const store = useGuildStore();

      // Verificar que não há guilda atual
      expect(store.currentGuild).toBeNull();

      await expect(store.regenerateGuildName()).rejects.toThrow(
        "Cannot regenerate: no current guild"
      );
    });

    it("should throw error when guild is locked", async () => {
      const store = useGuildStore();

      // Gerar uma guilda e bloqueá-la
      await store.generateGuild({
        settlementType: SettlementType.ALDEIA,
        saveToHistory: true,
      });

      // Simular guilda bloqueada
      const lockedGuild = { ...store.currentGuild!, locked: true };
      store.setCurrentGuild(lockedGuild);

      await expect(store.regenerateGuildName()).rejects.toThrow(
        "Cannot regenerate guild name: guild is locked"
      );
    });

    it("should update guild in history when regenerated", async () => {
      const store = useGuildStore();

      // Gerar uma guilda e salvá-la no histórico
      await store.generateGuild({
        settlementType: SettlementType.ALDEIA,
        name: "Nome Original",
        saveToHistory: true,
      });

      const originalId = store.currentGuild?.id;
      expect(store.historyCount).toBe(1);

      // Regenerar o nome
      await store.regenerateGuildName();

      // Verificar que o histórico foi atualizado
      expect(store.historyCount).toBe(1); // Mesmo número de guildas

      const guildInHistory = store.guildHistory.find(
        (g) => g.id === originalId
      );
      expect(guildInHistory).toBeDefined();
      expect(guildInHistory?.name).toBe("Nome Regenerado");
    });

    it("should preserve guild ID when regenerating name", async () => {
      const store = useGuildStore();

      const originalGuild = await store.generateGuild({
        settlementType: SettlementType.ALDEIA,
        name: "Nome Original",
        saveToHistory: false,
      });

      const originalId = originalGuild.id;

      await store.regenerateGuildName();

      expect(store.currentGuild?.id).toBe(originalId);
    });

    it("should work for guilds not in history", async () => {
      const store = useGuildStore();

      // Gerar guilda sem salvar no histórico
      await store.generateGuild({
        settlementType: SettlementType.ALDEIA,
        name: "Nome Original",
        saveToHistory: false,
      });

      expect(store.historyCount).toBe(0);

      // Regenerar nome deve funcionar mesmo não estando no histórico
      await store.regenerateGuildName();

      expect(store.currentGuild?.name).toBe("Nome Regenerado");
      expect(store.historyCount).toBe(0); // Ainda não no histórico
    });

    it("should use random name generator", async () => {
      const store = useGuildStore();
      const { generateRandomGuildName } = await import("@/data/guild-names");

      await store.generateGuild({
        settlementType: SettlementType.ALDEIA,
        name: "Nome Original",
        saveToHistory: false,
      });

      await store.regenerateGuildName();

      // Verificar que o gerador foi chamado
      expect(generateRandomGuildName).toHaveBeenCalled();
    });
  });

  describe("Integration with UI validations", () => {
    it("should follow same lock validation pattern as other regeneration functions", async () => {
      const store = useGuildStore();

      // Gerar guilda desbloqueada
      await store.generateGuild({
        settlementType: SettlementType.ALDEIA,
        saveToHistory: false,
      });

      // Não deve lançar erro para guilda desbloqueada
      await expect(store.regenerateGuildName()).resolves.not.toThrow();

      // Bloquear guilda
      const lockedGuild = { ...store.currentGuild!, locked: true };
      store.setCurrentGuild(lockedGuild);

      // Deve lançar erro para guilda bloqueada
      await expect(store.regenerateGuildName()).rejects.toThrow(
        "Cannot regenerate guild name: guild is locked"
      );
    });
  });
});
