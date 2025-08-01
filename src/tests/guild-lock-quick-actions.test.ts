import { describe, it, expect, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useGuildStore } from '@/stores/guild';
import { SettlementType } from '@/types/guild';

describe('Guild Lock Quick Actions', () => {
  let store: ReturnType<typeof useGuildStore>;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useGuildStore();
  });

  it('should toggle guild lock status', async () => {
    // 1. Gerar uma guilda
    const guild = await store.generateQuickGuildAction(SettlementType.CIDADELA, 'Test Guild');
    expect(guild.locked).toBe(false);
    
    // 2. Bloquear a guilda
    const toggleSuccess1 = store.toggleGuildLock(guild.id);
    expect(toggleSuccess1).toBe(true);
    expect(store.currentGuild?.locked).toBe(true);
    
    // 3. Desbloquear a guilda
    const toggleSuccess2 = store.toggleGuildLock(guild.id);
    expect(toggleSuccess2).toBe(true);
    expect(store.currentGuild?.locked).toBe(false);
  });

  it('should maintain lock status in history when toggling current guild', async () => {
    // 1. Gerar e salvar guilda no histórico
    const guild = await store.generateQuickGuildAction(SettlementType.CIDADELA, 'Test Guild');
    store.addToHistory(guild);
    
    // 2. Bloquear a guilda atual
    store.toggleGuildLock(guild.id);
    expect(store.currentGuild?.locked).toBe(true);
    
    // 3. Verificar que o histórico também foi atualizado
    const historyGuild = store.guildHistory.find(g => g.id === guild.id);
    expect(historyGuild?.locked).toBe(true);
  });

  it('should allow visitor regeneration even when guild is locked via quick actions', async () => {
    // 1. Gerar e bloquear guilda
    const guild = await store.generateQuickGuildAction(SettlementType.CIDADELA, 'Test Guild');
    store.toggleGuildLock(guild.id);
    expect(store.currentGuild?.locked).toBe(true);
    
    // 2. Regeneração de frequentadores deve funcionar mesmo bloqueada
    await expect(store.regenerateVisitors()).resolves.not.toThrow();
    
    // 3. Outras regenerações devem estar bloqueadas
    await expect(store.regenerateStructure()).rejects.toThrow('locked');
    await expect(store.regenerateRelations()).rejects.toThrow('locked');
    await expect(store.regenerateCurrentGuild()).rejects.toThrow('locked');
  });

  it('should handle toggle when guild is not found', () => {
    // Tentar alternar lock de uma guilda inexistente
    const result = store.toggleGuildLock('non-existent-id');
    expect(result).toBe(false);
  });

  it('should sync lock status between current guild and history', async () => {
    // 1. Gerar guilda
    const guild = await store.generateQuickGuildAction(SettlementType.CIDADELA, 'Test Guild');
    
    // 2. Salvar no histórico
    store.addToHistory(guild);
    
    // 3. Bloquear via current guild
    store.toggleGuildLock(guild.id);
    expect(store.currentGuild?.locked).toBe(true);
    
    // 4. Verificar que o histórico também foi atualizado
    const historyGuild = store.guildHistory.find(g => g.id === guild.id);
    expect(historyGuild?.locked).toBe(true);
    
    // 5. Limpar e carregar do histórico
    store.clearCurrentGuild();
    store.selectGuildFromHistory(guild.id);
    
    // 6. Verificar que o status de lock foi mantido
    expect(store.currentGuild?.locked).toBe(true);
    
    // 7. Desbloquear via current guild
    store.toggleGuildLock(guild.id);
    expect(store.currentGuild?.locked).toBe(false);
    
    // 8. Verificar que o histórico foi atualizado novamente
    const updatedHistoryGuild = store.guildHistory.find(g => g.id === guild.id);
    expect(updatedHistoryGuild?.locked).toBe(false);
  });
});
