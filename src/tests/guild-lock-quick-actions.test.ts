import { describe, it, expect, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useGuildStore } from "@/stores/guild";
import { SettlementType } from "@/types/guild";

describe("Guild Lock Quick Actions", () => {
  let store: ReturnType<typeof useGuildStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useGuildStore();
  });

  it("should toggle guild lock status", async () => {
    // 1. Gerar uma guilda
    const guild = await store.generateQuickGuildAction(
      SettlementType.CIDADELA,
      "Test Guild"
    );
    expect(guild.locked).toBe(false);

    // 2. Salvar no histórico primeiro
    store.addToHistory(guild);

    // 3. Bloquear a guilda
    const toggleSuccess1 = await store.toggleGuildLock(guild.id);
    expect(toggleSuccess1).toBe(true);
    expect(store.currentGuild?.locked).toBe(true);

    // 4. Desbloquear a guilda
    const toggleSuccess2 = await store.toggleGuildLock(guild.id);
    expect(toggleSuccess2).toBe(true);
    expect(store.currentGuild?.locked).toBe(false);
  });

  it("should prevent locking guilds not in history", async () => {
    // 1. Gerar uma guilda SEM salvar no histórico
    const guild = await store.generateGuild({
      settlementType: SettlementType.CIDADELA,
      name: "Test Guild",
      saveToHistory: false,
    });
    expect(guild.locked).toBe(false);

    // 2. Tentar bloquear sem salvar no histórico deve falhar
    const toggleSuccess = await store.toggleGuildLock(guild.id);
    expect(toggleSuccess).toBe(false);
    expect(store.currentGuild?.locked).toBe(false);
  });

  it("should maintain lock status in history when toggling current guild", async () => {
    // 1. Gerar e salvar guilda no histórico
    const guild = await store.generateQuickGuildAction(
      SettlementType.CIDADELA,
      "Test Guild"
    );
    store.addToHistory(guild);

    // 2. Bloquear a guilda atual
    await store.toggleGuildLock(guild.id);
    expect(store.currentGuild?.locked).toBe(true);

    // 3. Verificar que o histórico também foi atualizado
    const historyGuild = store.guildHistory.find((g) => g.id === guild.id);
    expect(historyGuild?.locked).toBe(true);
  });

  it("should allow visitor regeneration even when guild is locked via quick actions", async () => {
    // 1. Gerar e salvar guilda
    const guild = await store.generateQuickGuildAction(
      SettlementType.CIDADELA,
      "Test Guild"
    );
    store.addToHistory(guild);

    // 2. Bloquear guilda
    await store.toggleGuildLock(guild.id);
    expect(store.currentGuild?.locked).toBe(true);

    // 3. Regeneração de frequentadores deve funcionar mesmo bloqueada
    await expect(store.regenerateVisitors()).resolves.not.toThrow();

    // 4. Outras regenerações devem estar bloqueadas
    await expect(store.regenerateStructure()).rejects.toThrow("locked");
    await expect(store.regenerateRelations()).rejects.toThrow("locked");
    await expect(store.regenerateCurrentGuild()).rejects.toThrow("locked");
  });

  it("should handle toggle when guild is not found", async () => {
    // Tentar alternar lock de uma guilda inexistente
    const result = await store.toggleGuildLock("non-existent-id");
    expect(result).toBe(false);
  });

  it("should sync lock status between current guild and history", async () => {
    // 1. Gerar guilda
    const guild = await store.generateQuickGuildAction(
      SettlementType.CIDADELA,
      "Test Guild"
    );

    // 2. Salvar no histórico
    store.addToHistory(guild);

    // 3. Bloquear via current guild
    await store.toggleGuildLock(guild.id);
    expect(store.currentGuild?.locked).toBe(true);

    // 4. Verificar que o histórico também foi atualizado
    const historyGuild = store.guildHistory.find((g) => g.id === guild.id);
    expect(historyGuild?.locked).toBe(true);

    // 5. Limpar e carregar do histórico
    store.clearCurrentGuild();
    store.selectGuildFromHistory(guild.id);

    // 6. Verificar que o status de lock foi mantido
    expect(store.currentGuild?.locked).toBe(true);

    // 7. Desbloquear via current guild
    await store.toggleGuildLock(guild.id);
    expect(store.currentGuild?.locked).toBe(false);

    // 8. Verificar que o histórico foi atualizado novamente
    const updatedHistoryGuild = store.guildHistory.find(
      (g) => g.id === guild.id
    );
    expect(updatedHistoryGuild?.locked).toBe(false);
  });

  it("should require guild to be in history before allowing lock", async () => {
    // 1. Gerar guilda mas NÃO salvar no histórico
    const guild = await store.generateGuild({
      settlementType: SettlementType.CIDADELA,
      name: "Test Guild",
      saveToHistory: false,
    });

    // 2. Verificar que a guilda não está no histórico
    const isInHistory = store.guildHistory.some((g) => g.id === guild.id);
    expect(isInHistory).toBe(false);

    // 3. Tentar bloquear deve falhar
    const lockResult = await store.toggleGuildLock(guild.id);
    expect(lockResult).toBe(false);
    expect(store.currentGuild?.locked).toBe(false);

    // 4. Salvar no histórico
    store.addToHistory(guild);

    // 5. Agora deve ser possível bloquear
    const lockResult2 = await store.toggleGuildLock(guild.id);
    expect(lockResult2).toBe(true);
    expect(store.currentGuild?.locked).toBe(true);
  });
});
