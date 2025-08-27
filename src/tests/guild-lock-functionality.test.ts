import { describe, it, expect, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useGuildStore } from "@/stores/guild";
import { SettlementType } from "@/types/guild";

describe("Guild Lock Functionality", () => {
  let store: ReturnType<typeof useGuildStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useGuildStore();
  });

  it("should prevent regenerateCurrentGuild when guild is locked", async () => {
    // Criar uma guilda de teste
    const guild = await store.generateQuickGuildAction(
      SettlementType.CIDADELA,
      "Test Guild"
    );

    // Adicionar ao histórico e bloquear
    store.addToHistory(guild);
    await store.toggleGuildLock(guild.id);

    // Verificar que a guilda está bloqueada
    expect(store.currentGuild?.locked).toBe(true);

    // Tentar regenerar - deve falhar
    await expect(store.regenerateCurrentGuild()).rejects.toThrow();
  });

  it("should prevent regenerateStructure when guild is locked", async () => {
    // Criar uma guilda de teste
    const guild = await store.generateQuickGuildAction(
      SettlementType.CIDADELA,
      "Test Guild"
    );

    // Adicionar ao histórico e bloquear
    store.addToHistory(guild);
    await store.toggleGuildLock(guild.id);

    // Verificar que a guilda está bloqueada
    expect(store.currentGuild?.locked).toBe(true);

    // Tentar regenerar estrutura - deve falhar
    await expect(store.regenerateStructure()).rejects.toThrow();
  });

  it("should prevent regenerateRelations when guild is locked", async () => {
    // Criar uma guilda de teste
    const guild = await store.generateQuickGuildAction(
      SettlementType.CIDADELA,
      "Test Guild"
    );

    // Adicionar ao histórico e bloquear
    store.addToHistory(guild);
    await store.toggleGuildLock(guild.id);

    // Verificar que a guilda está bloqueada
    expect(store.currentGuild?.locked).toBe(true);

    // Tentar regenerar relações - deve falhar
    await expect(store.regenerateRelations()).rejects.toThrow();
  });

  it("should allow regenerateVisitors even when guild is locked", async () => {
    // Criar uma guilda de teste
    const guild = await store.generateQuickGuildAction(
      SettlementType.CIDADELA,
      "Test Guild"
    );

    // Adicionar ao histórico e bloquear
    store.addToHistory(guild);
    await store.toggleGuildLock(guild.id);

    // Verificar que a guilda está bloqueada
    expect(store.currentGuild?.locked).toBe(true);

    // Regenerar frequentadores - deve funcionar
    await expect(store.regenerateVisitors()).resolves.not.toThrow();

    // Verificar que a guilda ainda está bloqueada
    expect(store.currentGuild?.locked).toBe(true);

    // Verificar que apenas os frequentadores mudaram
    expect(store.currentGuild?.structure).toEqual(guild.structure);
    expect(store.currentGuild?.relations).toEqual(guild.relations);
    expect(store.currentGuild?.resources).toEqual(guild.resources);
    expect(store.currentGuild?.staff).toEqual(guild.staff);

    // Os frequentadores podem ter mudado ou não (depende da geração aleatória)
    // Mas o importante é que a função executou sem erro
  });

  it("should allow all regeneration functions when guild is not locked", async () => {
    // Criar uma guilda de teste
    const guild = await store.generateQuickGuildAction(
      SettlementType.CIDADELA,
      "Test Guild"
    );

    // Adicionar ao histórico mas NÃO bloquear
    store.addToHistory(guild);

    // Verificar que a guilda NÃO está bloqueada
    expect(store.currentGuild?.locked).toBeFalsy();

    // Todas as funções de regeneração devem funcionar
    await expect(store.regenerateStructure()).resolves.not.toThrow();
    await expect(store.regenerateRelations()).resolves.not.toThrow();
    await expect(store.regenerateVisitors()).resolves.not.toThrow();
    await expect(store.regenerateCurrentGuild()).resolves.not.toThrow();
  });

  it("should preserve lock status when regenerating visitors", async () => {
    // Criar uma guilda de teste
    const guild = await store.generateQuickGuildAction(
      SettlementType.CIDADELA,
      "Test Guild"
    );

    // Adicionar ao histórico e bloquear
    store.addToHistory(guild);
    await store.toggleGuildLock(guild.id);

    // Verificar que a guilda está bloqueada
    expect(store.currentGuild?.locked).toBe(true);

    // Regenerar frequentadores
    await store.regenerateVisitors();

    // Verificar que a guilda ainda está bloqueada após regeneração
    expect(store.currentGuild?.locked).toBe(true);

    // Verificar que ela também permanece bloqueada no histórico
    const guildInHistory = store.guildHistory.find((g) => g.id === guild.id);
    expect(guildInHistory?.locked).toBe(true);
  });
});
