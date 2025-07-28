import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGuildStore } from '@/stores/guild';
import { SettlementType, type Guild } from '@/types/guild';

describe('Manual Save to History', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should save guild to history manually with correct date conversion', async () => {
    const guildStore = useGuildStore();
    
    // Gerar uma guilda
    await guildStore.generateGuild({
      settlementType: SettlementType.POVOADO,
      saveToHistory: false
    });
    
    expect(guildStore.currentGuild).toBeTruthy();
    expect(guildStore.guildHistory).toHaveLength(0);
    
    // Simular o processo de salvamento manual
    const currentGuild = guildStore.currentGuild!;
    
    // Converter para simular o processo JSON.parse/stringify
    const guildCopy = JSON.parse(JSON.stringify(currentGuild));
    
    // Converter strings de data de volta para objetos Date
    if (guildCopy.createdAt && typeof guildCopy.createdAt === 'string') {
      guildCopy.createdAt = new Date(guildCopy.createdAt);
    }
    if (guildCopy.updatedAt && typeof guildCopy.updatedAt === 'string') {
      guildCopy.updatedAt = new Date(guildCopy.updatedAt);
    }
    
    const guildToSave = guildCopy as Guild;
    
    // Adicionar ao histórico
    guildStore.addToHistory(guildToSave);
    
    // Verificar se foi salvo
    expect(guildStore.guildHistory).toHaveLength(1);
    expect(guildStore.guildHistory[0].id).toBe(currentGuild.id);
    expect(guildStore.guildHistory[0].createdAt).toBeInstanceOf(Date);
  });

  it('should not duplicate guild in history', async () => {
    const guildStore = useGuildStore();
    
    // Gerar uma guilda
    await guildStore.generateGuild({
      settlementType: SettlementType.POVOADO,
      saveToHistory: false
    });
    
    const currentGuild = guildStore.currentGuild!;
    
    // Simular o salvamento manual duas vezes
    const processGuildForSave = (guild: typeof currentGuild) => {
      const guildCopy = JSON.parse(JSON.stringify(guild));
      if (guildCopy.createdAt && typeof guildCopy.createdAt === 'string') {
        guildCopy.createdAt = new Date(guildCopy.createdAt);
      }
      if (guildCopy.updatedAt && typeof guildCopy.updatedAt === 'string') {
        guildCopy.updatedAt = new Date(guildCopy.updatedAt);
      }
      return guildCopy as Guild;
    };
    
    // Primeiro salvamento
    guildStore.addToHistory(processGuildForSave(currentGuild));
    expect(guildStore.guildHistory).toHaveLength(1);
    
    // Segundo salvamento da mesma guilda
    guildStore.addToHistory(processGuildForSave(currentGuild));
    expect(guildStore.guildHistory).toHaveLength(1); // Não deve duplicar
  });

  it('should validate guild object before saving', () => {
    const guildStore = useGuildStore();
    
    // Tentar adicionar objeto inválido
    expect(() => {
      guildStore.addToHistory({} as Guild);
    }).toThrow('Invalid guild object');
  });
});
