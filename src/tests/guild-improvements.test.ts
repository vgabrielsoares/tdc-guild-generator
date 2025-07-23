import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGuildStore } from '@/stores/guild';
import { SettlementType, type Guild } from '@/types/guild';

// Helper para converter guilda readonly para Guild
const convertToGuild = (readonlyGuild: unknown): Guild => {
  // Usar JSON para fazer deep clone e remover readonly
  const cloned = JSON.parse(JSON.stringify(readonlyGuild, (_, value) => {
    // Preservar Dates
    if (value && typeof value === 'object' && value.constructor === Date) {
      return value.toISOString();
    }
    return value;
  }));
  
  // Converter strings de volta para Dates
  if (cloned.createdAt) cloned.createdAt = new Date(cloned.createdAt);
  if (cloned.updatedAt) cloned.updatedAt = new Date(cloned.updatedAt);
  
  cloned.locked = cloned.locked || false;
  return cloned as Guild;
};

describe('Guild Improvements', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  describe('Guild Name Update', () => {
    it('should update guild name successfully', async () => {
      const guildStore = useGuildStore();
      
      // Gerar uma guilda primeiro
      await guildStore.generateGuild({
        settlementType: SettlementType.CIDADE_PEQUENA,
        saveToHistory: false
      });
      
      const originalName = guildStore.currentGuild!.name;
      const newName = 'Nova Guilda Teste';
      
      // Atualizar o nome
      const success = guildStore.updateGuildName(newName);
      
      expect(success).toBe(true);
      expect(guildStore.currentGuild!.name).toBe(newName);
      expect(guildStore.currentGuild!.name).not.toBe(originalName);
      expect(guildStore.currentGuild!.updatedAt).toBeInstanceOf(Date);
    });

    it('should not update with empty name', () => {
      const guildStore = useGuildStore();
      
      const success = guildStore.updateGuildName('');
      expect(success).toBe(false);
    });

    it('should not update with same name', async () => {
      const guildStore = useGuildStore();
      
      await guildStore.generateGuild({
        settlementType: SettlementType.CIDADE_PEQUENA,
        saveToHistory: false
      });
      
      const originalName = guildStore.currentGuild!.name;
      const success = guildStore.updateGuildName(originalName);
      
      expect(success).toBe(false);
    });

    it('should update guild in history when name changes', async () => {
      const guildStore = useGuildStore();
      
      // Gerar e salvar no histórico
      await guildStore.generateGuild({
        settlementType: SettlementType.CIDADE_PEQUENA,
        saveToHistory: false
      });
      
      const guild = convertToGuild(guildStore.currentGuild!);
      guildStore.addToHistory(guild);
      
      const newName = 'Guilda Histórico Teste';
      const success = guildStore.updateGuildName(newName);
      
      expect(success).toBe(true);
      expect(guildStore.guildHistory[0].name).toBe(newName);
    });
  });

  describe('Guild Lock Functionality', () => {
    it('should toggle guild lock status', async () => {
      const guildStore = useGuildStore();
      
      await guildStore.generateGuild({
        settlementType: SettlementType.CIDADE_PEQUENA,
        saveToHistory: false
      });
      
      const guild = convertToGuild(guildStore.currentGuild!);
      guildStore.addToHistory(guild);
      
      // Inicialmente desbloqueada
      expect(guild.locked).toBeFalsy();
      
      // Bloquear
      const success1 = guildStore.toggleGuildLock(guild.id);
      expect(success1).toBe(true);
      expect(guildStore.guildHistory[0].locked).toBe(true);
      
      // Desbloquear
      const success2 = guildStore.toggleGuildLock(guild.id);
      expect(success2).toBe(true);
      expect(guildStore.guildHistory[0].locked).toBe(false);
    });

    it('should prevent removal of locked guilds', async () => {
      const guildStore = useGuildStore();
      
      await guildStore.generateGuild({
        settlementType: SettlementType.CIDADE_PEQUENA,
        saveToHistory: false
      });
      
      const guild = convertToGuild(guildStore.currentGuild!);
      guildStore.addToHistory(guild);
      
      // Bloquear a guilda
      guildStore.toggleGuildLock(guild.id);
      
      // Tentar remover (deve falhar)
      const removed = guildStore.removeFromHistory(guild.id);
      expect(removed).toBe(false);
      expect(guildStore.guildHistory).toHaveLength(1);
    });

    it('should keep locked guilds when clearing history', async () => {
      const guildStore = useGuildStore();
      
      // Gerar múltiplas guildas
      await guildStore.generateGuild({
        settlementType: SettlementType.CIDADE_PEQUENA,
        saveToHistory: false
      });
      const guild1 = convertToGuild(guildStore.currentGuild!);
      guildStore.addToHistory(guild1);
      
      await guildStore.generateGuild({
        settlementType: SettlementType.ALDEIA,
        saveToHistory: false
      });
      const guild2 = convertToGuild(guildStore.currentGuild!);
      guildStore.addToHistory(guild2);
      
      // Bloquear apenas a primeira
      guildStore.toggleGuildLock(guild1.id);
      
      expect(guildStore.guildHistory).toHaveLength(2);
      
      // Limpar histórico
      guildStore.clearHistory();
      
      // Apenas a guilda bloqueada deve permanecer
      expect(guildStore.guildHistory).toHaveLength(1);
      expect(guildStore.guildHistory[0].id).toBe(guild1.id);
      expect(guildStore.guildHistory[0].locked).toBe(true);
    });
  });
});
