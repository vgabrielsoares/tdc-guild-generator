import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useContractsStore } from '@/stores/contracts';
import { 
  createEmptyGuildContracts, 
  canGuildGenerateContracts,
  type GuildContracts 
} from '@/types/contract';

describe('Storage de Contratos por Guilda - Issue 4.20', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('deve criar estrutura vazia para uma guilda', () => {
    const guildId = 'test-guild-id';
    const guildContracts = createEmptyGuildContracts(guildId);

    expect(guildContracts.guildId).toBe(guildId);
    expect(guildContracts.contracts).toEqual([]);
    expect(guildContracts.lastUpdate).toBeNull();
    expect(guildContracts.generationCount).toBe(0);
  });

  it('deve verificar se guilda pode gerar contratos', () => {
    const guildId = 'test-guild-id';
    const emptyGuildContracts = createEmptyGuildContracts(guildId);
    const guildWithContracts: GuildContracts = {
      ...emptyGuildContracts,
      generationCount: 1
    };

    expect(canGuildGenerateContracts(emptyGuildContracts)).toBe(true);
    expect(canGuildGenerateContracts(guildWithContracts)).toBe(false);
  });

  it('deve carregar contratos de guilda específica', () => {
    const contractsStore = useContractsStore();
    const guildId = 'test-guild-id';

    // Carregar contratos de uma guilda
    contractsStore.loadGuildContracts(guildId);

    expect(contractsStore.currentGuildId).toBe(guildId);
    expect(contractsStore.contracts).toEqual([]);
    expect(contractsStore.lastUpdate).toBeNull();
  });

  it('deve limpar contratos de guilda removida', () => {
    const contractsStore = useContractsStore();
    const guildId = 'test-guild-id';

    // Carregar contratos da guilda
    contractsStore.loadGuildContracts(guildId);
    expect(contractsStore.currentGuildId).toBe(guildId);

    // Limpar contratos da guilda
    contractsStore.cleanupGuildContracts(guildId);
    expect(contractsStore.currentGuildId).toBeNull();
    expect(contractsStore.contracts).toEqual([]);
  });

  it('deve verificar se guilda pode gerar contratos', () => {
    const contractsStore = useContractsStore();
    const guildId = 'test-guild-id';

    // Sem guilda atual
    expect(contractsStore.canGenerateContracts).toBe(false);

    // Com guilda carregada (primeira vez)
    contractsStore.loadGuildContracts(guildId);
    expect(contractsStore.canGenerateContracts).toBe(true);
  });

  it('deve sincronizar com guilda atual', () => {
    const contractsStore = useContractsStore();

    // Simular uma guilda sendo definida
    contractsStore.syncWithCurrentGuild();

    // Sem guilda atual, deve limpar contratos
    expect(contractsStore.currentGuildId).toBeNull();
  });
});
