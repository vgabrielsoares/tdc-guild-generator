import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useGuildStore } from "@/stores/guild";
import { SettlementType } from "@/types/guild";
import {
  GUILD_NAME_PREFIXES_CLASSIFIED,
  GUILD_NAME_SUFFIXES_CLASSIFIED,
} from "@/data/guild-names";
import { type Guild } from "@/types/guild";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

describe("Issue 3.4 - Guild Store Complete", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe("Store State Management", () => {
    it("should initialize with empty state", () => {
      const store = useGuildStore();

      expect(store.currentGuild).toBeNull();
      expect(store.guildHistory).toEqual([]);
      expect(store.isGenerating).toBe(false);
      expect(store.lastConfig).toBeNull();
      expect(store.lastGenerated).toBeNull();
    });

    it("should have correct computed properties", () => {
      const store = useGuildStore();

      expect(store.hasCurrentGuild).toBe(false);
      expect(store.historyCount).toBe(0);
      expect(store.canRegenerate).toBe(false);
    });

    it("should update computed properties when state changes", async () => {
      const store = useGuildStore();

      await store.generateGuild({
        settlementType: SettlementType.ALDEIA,
        saveToHistory: true,
      });

      expect(store.hasCurrentGuild).toBe(true);
      expect(store.historyCount).toBe(1);
      expect(store.canRegenerate).toBe(true);
    });
  });

  describe("Guild Generation", () => {
    it("should generate a complete guild", async () => {
      const store = useGuildStore();

      const guild = await store.generateGuild({
        settlementType: SettlementType.ALDEIA,
        saveToHistory: true,
      });

      expect(guild).toBeDefined();
      expect(guild?.id).toBeDefined();
      expect(guild?.name).toBeDefined();
      expect(guild?.settlementType).toBe(SettlementType.ALDEIA);
      expect(guild?.structure).toBeDefined();
      expect(guild?.relations).toBeDefined();
      expect(guild?.staff).toBeDefined();
      expect(guild?.visitors).toBeDefined();
      expect(guild?.resources).toBeDefined();
      expect(guild?.createdAt).toBeDefined();
    });

    it("should generate guild with custom modifiers", async () => {
      const store = useGuildStore();

      const guild = await store.generateGuild({
        settlementType: SettlementType.CIDADE_GRANDE,
        customModifiers: {
          structure: { size: 5, employees: 2 },
          visitors: { frequency: -2 },
          relations: { government: 3, population: -1 },
          resources: { level: 4 },
        },
        saveToHistory: true,
      });

      expect(guild).toBeDefined();
      expect(guild?.settlementType).toBe(SettlementType.CIDADE_GRANDE);
      expect(store.lastConfig?.customModifiers).toEqual({
        structure: { size: 5, employees: 2 },
        visitors: { frequency: -2 },
        relations: { government: 3, population: -1 },
        resources: { level: 4 },
      });
    });

    it("should add guild to history when saveToHistory is true", async () => {
      const store = useGuildStore();

      await store.generateGuild({
        settlementType: SettlementType.ALDEIA,
        saveToHistory: true,
      });

      expect(store.historyCount).toBe(1);
      expect(store.guildHistory[0]).toStrictEqual(store.currentGuild);
    });

    it("should not add guild to history when saveToHistory is false", async () => {
      const store = useGuildStore();

      await store.generateGuild({
        settlementType: SettlementType.ALDEIA,
        saveToHistory: false,
      });

      expect(store.historyCount).toBe(0);
      expect(store.currentGuild).toBeDefined();
    });

    it("should set isGenerating state correctly", async () => {
      const store = useGuildStore();

      expect(store.isGenerating).toBe(false);

      const promise = store.generateGuild({
        settlementType: SettlementType.ALDEIA,
      });

      expect(store.isGenerating).toBe(true);

      await promise;

      expect(store.isGenerating).toBe(false);
    });
  });

  describe("Guild Regeneration", () => {
    it("should regenerate current guild with same parameters", async () => {
      const store = useGuildStore();

      const firstGuild = await store.generateGuild({
        settlementType: SettlementType.ALDEIA,
        customModifiers: { structure: { size: 2 } },
      });

      const secondGuild = await store.regenerateCurrentGuild();

      expect(secondGuild).toBeDefined();
      expect(secondGuild?.id).toBe(firstGuild?.id); // Same ID - regenerated current guild
      expect(secondGuild?.settlementType).toBe(firstGuild?.settlementType);
      expect(store.historyCount).toBe(1); // Same guild, just regenerated
    });

    it("should throw error when trying to regenerate without current guild", async () => {
      const store = useGuildStore();

      await expect(store.regenerateCurrentGuild()).rejects.toThrow(
        "Cannot regenerate: no current guild or config"
      );
    });

    it("should regenerate only structure", async () => {
      const store = useGuildStore();

      await store.generateGuild({
        settlementType: SettlementType.ALDEIA,
      });

      const originalRelations = store.currentGuild?.relations;
      const originalResources = store.currentGuild?.resources;

      await store.regenerateStructure();

      // Relations and resources should remain the same
      expect(store.currentGuild?.relations).toEqual(originalRelations);
      expect(store.currentGuild?.resources).toEqual(originalResources);
      // Structure and staff might be different
    });

    it("should regenerate only relations", async () => {
      const store = useGuildStore();

      await store.generateGuild({
        settlementType: SettlementType.ALDEIA,
      });

      const originalStructure = store.currentGuild?.structure;
      const originalStaff = store.currentGuild?.staff;

      await store.regenerateRelations();

      // Structure should remain the same, relations should change
      expect(store.currentGuild?.structure).toEqual(originalStructure);
      expect(store.currentGuild?.staff).toEqual(originalStaff);
      // Relations, visitors, and resources might be different
    });
  });

  describe("History Management", () => {
    it("should select guild from history", async () => {
      const store = useGuildStore();

      const guild1 = await store.generateGuild({
        settlementType: SettlementType.ALDEIA,
      });
      const guild2 = await store.generateGuild({
        settlementType: SettlementType.POVOADO,
      });

      expect(store.currentGuild?.id).toBe(guild2?.id);

      const success = store.selectGuildFromHistory(guild1?.id || "");

      expect(success).toBe(true);
      expect(store.currentGuild?.id).toBe(guild1?.id);
    });

    it("should return false when selecting non-existent guild", () => {
      const store = useGuildStore();

      const success = store.selectGuildFromHistory("non-existent-id");

      expect(success).toBe(false);
      expect(store.currentGuild).toBeNull();
    });

    it("should remove guild from history", async () => {
      const store = useGuildStore();

      const guild = await store.generateGuild({
        settlementType: SettlementType.ALDEIA,
      });

      expect(store.historyCount).toBe(1);

      const success = await store.removeFromHistory(guild?.id || "");

      expect(success).toBe(true);
      expect(store.historyCount).toBe(0);
      expect(store.currentGuild).toBeNull();
    });

    it("should return false when removing non-existent guild", async () => {
      const store = useGuildStore();

      const success = await store.removeFromHistory("non-existent-id");

      expect(success).toBe(false);
    });

    it("should clear all history", async () => {
      const store = useGuildStore();

      await store.generateGuild({ settlementType: SettlementType.ALDEIA });
      await store.generateGuild({
        settlementType: SettlementType.POVOADO,
      });

      expect(store.historyCount).toBe(2);

      await store.clearHistory();

      expect(store.historyCount).toBe(0);
      expect(store.guildHistory).toEqual([]);
    });

    it("should limit history to 50 guilds", async () => {
      const store = useGuildStore();

      // Generate 52 guilds
      for (let i = 0; i < 52; i++) {
        await store.generateGuild({
          settlementType: SettlementType.ALDEIA,
          saveToHistory: true,
        });
      }

      expect(store.historyCount).toBe(50);
    });
  });

  describe("State Management", () => {
    it("should clear current guild", async () => {
      const store = useGuildStore();

      await store.generateGuild({
        settlementType: SettlementType.ALDEIA,
      });

      expect(store.hasCurrentGuild).toBe(true);

      store.clearCurrentGuild();

      expect(store.hasCurrentGuild).toBe(false);
      expect(store.currentGuild).toBeNull();
      expect(store.lastConfig).toBeNull();
      expect(store.lastGenerated).toBeNull();
    });
  });

  describe("Import/Export", () => {
    it("should export current guild as JSON", async () => {
      const store = useGuildStore();

      const guild = await store.generateGuild({
        settlementType: SettlementType.ALDEIA,
      });

      const exported = store.exportCurrentGuild();

      expect(exported).toBeDefined();
      expect(exported).toContain(guild?.id || "");
      expect(exported).toContain(guild?.name || "");

      const parsed = JSON.parse(exported || "");
      expect(parsed.id).toBe(guild?.id);
      expect(parsed.name).toBe(guild?.name);
    });

    it("should return null when exporting without current guild", () => {
      const store = useGuildStore();

      const exported = store.exportCurrentGuild();

      expect(exported).toBeNull();
    });

    it("should export guild history as JSON", async () => {
      const store = useGuildStore();

      await store.generateGuild({ settlementType: SettlementType.ALDEIA });
      await store.generateGuild({
        settlementType: SettlementType.POVOADO,
      });

      const exported = store.exportHistory();

      expect(exported).toBeDefined();

      const parsed = JSON.parse(exported || "");
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed).toHaveLength(2);
    });

    it("should import guild from JSON", async () => {
      const store = useGuildStore();

      const originalGuild = await store.generateGuild({
        settlementType: SettlementType.ALDEIA,
        saveToHistory: false,
      });

      const exported = store.exportCurrentGuild();
      store.clearCurrentGuild();

      const success = await store.importGuild(exported || "");

      expect(success).toBe(true);
      expect(store.hasCurrentGuild).toBe(true);
      expect(store.currentGuild?.name).toBe(originalGuild?.name);
      expect(store.currentGuild?.settlementType).toBe(
        originalGuild?.settlementType
      );
      expect(store.historyCount).toBe(1); // Imported guild added to history
    });

    it("should return false when importing invalid JSON", async () => {
      const store = useGuildStore();

      const success = await store.importGuild("invalid json");

      expect(success).toBe(false);
      expect(store.hasCurrentGuild).toBe(false);
    });

    it("should return false when importing invalid guild data", async () => {
      const store = useGuildStore();

      const invalidGuild = { invalid: "data" };
      const success = await store.importGuild(JSON.stringify(invalidGuild));

      expect(success).toBe(false);
      expect(store.hasCurrentGuild).toBe(false);
    });
  });

  describe("Persistence", () => {
    it("should save state to localStorage", async () => {
      const store = useGuildStore();

      await store.generateGuild({
        settlementType: SettlementType.ALDEIA,
      });

      // useStorage saves with a debounce (200ms). Wait a bit before asserting.
      await new Promise((resolve) => setTimeout(resolve, 250));

      expect(localStorageMock.setItem).toHaveBeenCalled();
      // adapter may prefix keys (e.g. "settings:guild-store"); assert a call used the guild-store suffix
      const calls = (localStorageMock.setItem as any).mock.calls as any[];
      expect(
        calls.some(
          (c: any[]) => typeof c[0] === "string" && c[0].endsWith("guild-store")
        )
      ).toBe(true);
    });

    it("should load state from localStorage", async () => {
      const store1 = useGuildStore();

      await store1.generateGuild({
        settlementType: SettlementType.ALDEIA,
      });

      // Simular que os dados estão no localStorage
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          currentGuild: store1.currentGuild,
          guildHistory: store1.guildHistory,
          lastConfig: null,
        })
      );

      // Create new store instance to test loading (automaticamente carrega do storage)
      const store2 = useGuildStore();

      expect(store2.hasCurrentGuild).toBe(true);
      expect(store2.currentGuild?.settlementType).toBe(SettlementType.ALDEIA);
    });

    it("should handle corrupted localStorage data gracefully", async () => {
      localStorageMock.getItem.mockReturnValue("invalid json");

      // Com storage automático, dados corrompidos são ignorados
      const store = useGuildStore();

      expect(store.hasCurrentGuild).toBe(false);
    });
  });

  describe("Guild ID and Name Generation", () => {
    it("should generate unique guild IDs", async () => {
      const store = useGuildStore();

      const guild1 = await store.generateGuild({
        settlementType: SettlementType.ALDEIA,
      });
      const guild2 = await store.generateGuild({
        settlementType: SettlementType.ALDEIA,
      });

      expect(guild1?.id).toBeDefined();
      expect(guild2?.id).toBeDefined();
      expect(guild1?.id).not.toBe(guild2?.id);
    });

    it("should generate guild names with proper format", async () => {
      const store = useGuildStore();

      const guild = await store.generateGuild({
        settlementType: SettlementType.ALDEIA,
      });

      expect(guild?.name).toBeDefined();

      const guildName = guild?.name;
      expect(guildName).toBeDefined();

      // Usar listas classificadas que são efetivamente utilizadas pela função
      const classifiedPrefixes = GUILD_NAME_PREFIXES_CLASSIFIED.map(
        (p) => p.name
      );
      const classifiedSuffixes = GUILD_NAME_SUFFIXES_CLASSIFIED.map(
        (s) => s.name
      );

      // Criar regex dinamicamente baseado nas listas classificadas
      const prefixPattern = classifiedPrefixes
        .map((p: string) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("|");
      const suffixPattern = classifiedSuffixes
        .map((s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("|");
      const modernPattern = new RegExp(
        `^(${prefixPattern}) (${suffixPattern})$`
      );

      // Testa nomes especiais (para assentamentos grandes) - mantido para compatibilidade
      const specialPattern =
        /^(Rosa Dourada|Luz Cerúlea|Forja Ancestral|Lâmina Prata|Escudo de Ferro|Coroa Imperial|Torre de Marfim|Punho de Aço)$/;

      // O nome deve corresponder a um dos padrões
      const isValidName =
        modernPattern.test(guildName!) || specialPattern.test(guildName!);
      expect(isValidName).toBe(true);
    });

    describe("Manual Save to History (migrado)", () => {
      beforeEach(() => {
        setActivePinia(createPinia());
      });

      it("should save guild to history manually with correct date conversion", async () => {
        const guildStore = useGuildStore();
        await guildStore.generateGuild({
          settlementType: SettlementType.POVOADO,
          saveToHistory: false,
        });
        expect(guildStore.currentGuild).toBeTruthy();
        expect(guildStore.guildHistory).toHaveLength(0);
        const currentGuild = guildStore.currentGuild!;
        const guildCopy = JSON.parse(JSON.stringify(currentGuild));
        if (guildCopy.createdAt && typeof guildCopy.createdAt === "string")
          guildCopy.createdAt = new Date(guildCopy.createdAt);
        if (guildCopy.updatedAt && typeof guildCopy.updatedAt === "string")
          guildCopy.updatedAt = new Date(guildCopy.updatedAt);
        const guildToSave = guildCopy as Guild;
        guildStore.addToHistory(guildToSave);
        expect(guildStore.guildHistory).toHaveLength(1);
        expect(guildStore.guildHistory[0].id).toBe(currentGuild.id);
        expect(guildStore.guildHistory[0].createdAt).toBeInstanceOf(Date);
      });

      it("should not duplicate guild in history", async () => {
        const guildStore = useGuildStore();
        await guildStore.generateGuild({
          settlementType: SettlementType.POVOADO,
          saveToHistory: false,
        });
        const currentGuild = guildStore.currentGuild!;
        const processGuildForSave = (guild: typeof currentGuild) => {
          const guildCopy = JSON.parse(JSON.stringify(guild));
          if (guildCopy.createdAt && typeof guildCopy.createdAt === "string")
            guildCopy.createdAt = new Date(guildCopy.createdAt);
          if (guildCopy.updatedAt && typeof guildCopy.updatedAt === "string")
            guildCopy.updatedAt = new Date(guildCopy.updatedAt);
          return guildCopy as Guild;
        };
        guildStore.addToHistory(processGuildForSave(currentGuild));
        expect(guildStore.guildHistory).toHaveLength(1);
        guildStore.addToHistory(processGuildForSave(currentGuild));
        expect(guildStore.guildHistory).toHaveLength(1);
      });

      it("should validate guild object before saving", () => {
        const guildStore = useGuildStore();
        expect(() => {
          guildStore.addToHistory({} as Guild);
        }).toThrow("Invalid guild object");
      });
    });
  });
});
