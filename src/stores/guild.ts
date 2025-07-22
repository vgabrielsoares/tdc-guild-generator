import { defineStore } from 'pinia';
import { ref, computed, readonly } from 'vue';
import type { Guild, SettlementType } from '@/types/guild';
import { SettlementType as SettlementTypeEnum } from '@/types/guild';
import { 
  GuildGenerator, 
  type GuildGenerationConfig,
  type GuildGenerationResult 
} from '@/utils/generators/guild-generator';
import { createGuild, isGuild } from '@/types/guild';

// Interface para opções de geração
export interface GenerateGuildOptions {
  readonly settlementType: SettlementType;
  readonly name?: string;
  readonly customModifiers?: GuildGenerationConfig['customModifiers'];
  readonly saveToHistory?: boolean;
  readonly debug?: boolean;
}

// Interface para filtros de histórico
export interface GuildHistoryFilters {
  readonly settlementType?: SettlementType;
  readonly nameContains?: string;
  readonly createdAfter?: Date;
  readonly createdBefore?: Date;
}

/**
 * Store da guilda com funcionalidades completas de CRUD e geração
 */
export const useGuildStore = defineStore('guild', () => {
  // Estado reativo
  const currentGuild = ref<Guild | null>(null);
  const guildHistory = ref<Guild[]>([]);
  const isGenerating = ref(false);
  const lastGenerationResult = ref<GuildGenerationResult | null>(null);
  const lastConfig = ref<GuildGenerationConfig | null>(null);
  const error = ref<string | null>(null);

  // Getters computados
  const hasCurrentGuild = computed(() => currentGuild.value !== null);
  
  const historyCount = computed(() => guildHistory.value.length);
  
  const lastGenerated = computed(() => 
    lastGenerationResult.value?.timestamp || null
  );
  
  const canRegenerate = computed(() => 
    currentGuild.value !== null && lastConfig.value !== null
  );
  
  const generationLogs = computed(() => 
    lastGenerationResult.value?.logs || []
  );

  const filteredHistory = computed(() => {
    return (filters: GuildHistoryFilters) => {
      return guildHistory.value.filter(guild => {
        if (filters.settlementType && guild.settlementType !== filters.settlementType) {
          return false;
        }
        
        if (filters.nameContains && !guild.name.toLowerCase().includes(filters.nameContains.toLowerCase())) {
          return false;
        }
        
        if (filters.createdAfter && guild.createdAt < filters.createdAfter) {
          return false;
        }
        
        if (filters.createdBefore && guild.createdAt > filters.createdBefore) {
          return false;
        }
        
        return true;
      });
    };
  });

  // Actions principais
  async function generateGuild(options: GenerateGuildOptions): Promise<Guild> {
    if (isGenerating.value) {
      throw new Error('Guild generation already in progress');
    }

    isGenerating.value = true;
    error.value = null;

    try {
      validateGenerationOptions(options);

      const config: GuildGenerationConfig = {
        settlementType: options.settlementType,
        name: options.name,
        customModifiers: options.customModifiers,
        debug: options.debug || false,
      };

      const generator = new GuildGenerator(config);
      const result = await Promise.resolve(generator.generate());

      // Salvar configuração para regeneração
      lastConfig.value = config;

      // Validar resultado
      const guild = createGuild(result.data.guild);
      
      lastGenerationResult.value = result;
      currentGuild.value = guild;

      if (options.saveToHistory !== false) {
        addToHistory(guild);
      }

      await saveToStorage();
      
      return guild;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error during generation';
      error.value = errorMessage;
      throw new Error(`Guild generation failed: ${errorMessage}`);
    } finally {
      isGenerating.value = false;
    }
  }

  // Geração rápida simplificada
  async function generateQuickGuildAction(
    settlementType: SettlementType, 
    name?: string
  ): Promise<Guild> {
    return generateGuild({
      settlementType,
      name,
      saveToHistory: true,
    });
  }

  // Regenerar a guilda atual com as mesmas configurações
  async function regenerateCurrentGuild(): Promise<Guild> {
    if (!currentGuild.value || !lastConfig.value) {
      throw new Error('Cannot regenerate: no current guild or config');
    }

    const originalId = currentGuild.value.id;

    const options: GenerateGuildOptions = {
      settlementType: lastConfig.value.settlementType,
      name: lastConfig.value.name,
      customModifiers: lastConfig.value.customModifiers,
      saveToHistory: false,
    };

    const newGuild = await generateGuild(options);
    
    // Manter o mesmo ID para regeneração
    const regeneratedGuild = { ...newGuild, id: originalId };
    currentGuild.value = regeneratedGuild;
    
    // Atualizar no histórico se existir
    const historyIndex = guildHistory.value.findIndex(g => g.id === originalId);
    if (historyIndex !== -1) {
      guildHistory.value[historyIndex] = regeneratedGuild;
    }
    
    await saveToStorage();
    return regeneratedGuild;
  }

  // Regenerar apenas a estrutura
  async function regenerateStructure(): Promise<void> {
    if (!currentGuild.value || !lastConfig.value) {
      throw new Error('Cannot regenerate: no current guild or config');
    }

    const originalId = currentGuild.value.id;
    const originalRelations = currentGuild.value.relations;
    const originalResources = currentGuild.value.resources;
    const originalVisitors = currentGuild.value.visitors;
    const originalSettlementType = currentGuild.value.settlementType;
    const originalName = currentGuild.value.name;
    const originalCreatedAt = currentGuild.value.createdAt;

    // Gerar uma nova guilda para obter nova estrutura
    const options: GenerateGuildOptions = {
      settlementType: lastConfig.value.settlementType,
      name: lastConfig.value.name,
      customModifiers: lastConfig.value.customModifiers,
      saveToHistory: false,
    };

    const newGuild = await generateGuild(options);
    
    // Criar guilda com nova estrutura mas mantendo outros dados
    const regeneratedGuild: Guild = {
      id: originalId,
      name: originalName,
      structure: newGuild.structure,
      relations: originalRelations,
      staff: newGuild.staff,
      visitors: originalVisitors,
      resources: originalResources,
      settlementType: originalSettlementType,
      createdAt: originalCreatedAt,
    };
    
    currentGuild.value = regeneratedGuild;
    
    // Atualizar no histórico se existir
    const historyIndex = guildHistory.value.findIndex(g => g.id === originalId);
    if (historyIndex !== -1) {
      guildHistory.value[historyIndex] = regeneratedGuild;
    }
    
    await saveToStorage();
  }

  // Regenerar apenas as relações
  async function regenerateRelations(): Promise<void> {
    if (!currentGuild.value || !lastConfig.value) {
      throw new Error('Cannot regenerate: no current guild or config');
    }

    const originalId = currentGuild.value.id;
    const originalStructure = currentGuild.value.structure;
    const originalStaff = currentGuild.value.staff;
    const originalSettlementType = currentGuild.value.settlementType;
    const originalName = currentGuild.value.name;
    const originalCreatedAt = currentGuild.value.createdAt;

    // Gerar uma nova guilda para obter novas relações
    const options: GenerateGuildOptions = {
      settlementType: lastConfig.value.settlementType,
      name: lastConfig.value.name,
      customModifiers: lastConfig.value.customModifiers,
      saveToHistory: false,
    };

    const newGuild = await generateGuild(options);
    
    // Criar guilda com novas relações mas mantendo estrutura
    const regeneratedGuild: Guild = {
      id: originalId,
      name: originalName,
      structure: originalStructure,
      relations: newGuild.relations,
      staff: originalStaff,
      visitors: newGuild.visitors,
      resources: newGuild.resources,
      settlementType: originalSettlementType,
      createdAt: originalCreatedAt,
    };
    
    currentGuild.value = regeneratedGuild;
    
    // Atualizar no histórico se existir
    const historyIndex = guildHistory.value.findIndex(g => g.id === originalId);
    if (historyIndex !== -1) {
      guildHistory.value[historyIndex] = regeneratedGuild;
    }
    
    await saveToStorage();
  }

  // CRUD do histórico
  function addToHistory(guild: Guild): void {
    if (!isGuild(guild)) {
      throw new Error('Invalid guild object');
    }

    // Evitar duplicatas baseadas no ID
    const existingIndex = guildHistory.value.findIndex(g => g.id === guild.id);
    if (existingIndex === -1) {
      guildHistory.value.unshift(guild);
      
      // Limitar histórico a 50 guildas
      if (guildHistory.value.length > 50) {
        guildHistory.value = guildHistory.value.slice(0, 50);
      }
    }
  }

  function removeFromHistory(guildId: string): boolean {
    const initialLength = guildHistory.value.length;
    
    // Se a guilda atual está sendo removida, limpar
    if (currentGuild.value?.id === guildId) {
      currentGuild.value = null;
      lastConfig.value = null;
    }
    
    guildHistory.value = guildHistory.value.filter(g => g.id !== guildId);
    
    const removed = guildHistory.value.length < initialLength;
    if (removed) {
      saveToStorage();
    }
    
    return removed;
  }

  function clearHistory(): void {
    guildHistory.value = [];
    saveToStorage();
  }

  function loadGuildFromHistory(guildId: string): Guild | null {
    const guild = guildHistory.value.find(g => g.id === guildId);
    if (guild) {
      currentGuild.value = guild;
      return guild;
    }
    return null;
  }

  // Selecionar guilda do histórico
  function selectGuildFromHistory(guildId: string): boolean {
    const guild = loadGuildFromHistory(guildId);
    return guild !== null;
  }

  // Gerenciamento de estado
  function setCurrentGuild(guild: Guild | null): void {
    if (guild && !isGuild(guild)) {
      throw new Error('Invalid guild object');
    }
    currentGuild.value = guild;
  }

  function clearCurrentGuild(): void {
    currentGuild.value = null;
    lastGenerationResult.value = null;
    lastConfig.value = null;
    error.value = null;
  }

  // Exportar guilda atual como JSON
  function exportCurrentGuild(): string | null {
    if (!currentGuild.value) {
      return null;
    }
    
    try {
      return JSON.stringify(currentGuild.value, dateReplacer, 2);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Failed to export current guild:', err);
      return null;
    }
  }

  // Exportar histórico como JSON
  function exportHistory(): string {
    try {
      return JSON.stringify(guildHistory.value, dateReplacer, 2);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Failed to export guild history:', err);
      return '[]';
    }
  }

  // Gerar nome de guilda
  function generateGuildName(): string {
    const prefixes = ['Guilda dos', 'Irmandade dos', 'Companhia dos', 'Ordem dos', 'Círculo dos', 'Liga dos', 'Conselho dos', 'União dos'];
    const suffixes = ['Artesãos', 'Mercadores', 'Ferreiros', 'Tecelões', 'Alquimistas', 'Escribas', 'Construtores', 'Aventureiros', 'Exploradores', 'Protetores', 'Comerciantes', 'Mestres'];
    
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
    
    return `${prefix} ${suffix}`;
  }

  // Importar guilda do JSON
  async function importGuild(jsonData: string): Promise<boolean> {
    try {
      const guildData = JSON.parse(jsonData, dateReviver);
      
      // Validação mais flexível para importação
      if (
        guildData &&
        typeof guildData === 'object' &&
        guildData.id &&
        guildData.name &&
        guildData.structure &&
        guildData.relations &&
        guildData.staff &&
        guildData.visitors &&
        guildData.resources &&
        guildData.settlementType
      ) {
        // Garantir que createdAt seja uma data válida
        if (!guildData.createdAt) {
          guildData.createdAt = new Date();
        } else if (!(guildData.createdAt instanceof Date)) {
          guildData.createdAt = new Date(guildData.createdAt);
        }
        
        currentGuild.value = guildData as Guild;
        addToHistory(guildData as Guild);
        await saveToStorage();
        
        return true;
      }
      
      return false;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Failed to import guild:', err);
      return false;
    }
  }

  function clearError(): void {
    error.value = null;
  }

  // Persistência
  async function saveToStorage(): Promise<void> {
    try {
      const state = {
        currentGuild: currentGuild.value,
        guildHistory: guildHistory.value,
        lastGenerated: lastGenerated.value,
      };
      
      localStorage.setItem('generator-guild-store', JSON.stringify(state, dateReplacer));
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Failed to save guild state to storage:', err);
    }
  }

  async function loadFromStorage(): Promise<void> {
    try {
      const stored = localStorage.getItem('generator-guild-store');
      if (!stored) return;

      const state = JSON.parse(stored, dateReviver);
      
      if (state.currentGuild && isGuild(state.currentGuild)) {
        currentGuild.value = state.currentGuild;
      }
      
      if (Array.isArray(state.guildHistory)) {
        guildHistory.value = state.guildHistory.filter(isGuild);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Failed to load guild state from storage, cleaning up:', err);
      localStorage.removeItem('generator-guild-store');
    }
  }

  // Utilitários
  function validateGenerationOptions(options: GenerateGuildOptions): void {
    if (!options.settlementType) {
      throw new Error('Settlement type is required');
    }

    if (!Object.values(SettlementTypeEnum).includes(options.settlementType)) {
      throw new Error(`Invalid settlement type: ${options.settlementType}`);
    }

    if (options.name && options.name.trim().length === 0) {
      throw new Error('Guild name cannot be empty');
    }
  }

  // Serialização de datas para localStorage
  function dateReplacer(_key: string, value: unknown): unknown {
    if (value instanceof Date) {
      return { __type: 'Date', value: value.toISOString() };
    }
    return value;
  }

  function dateReviver(_key: string, value: unknown): unknown {
    if (
      typeof value === 'object' && 
      value !== null && 
      '__type' in value && 
      value.__type === 'Date' &&
      'value' in value &&
      typeof value.value === 'string'
    ) {
      return new Date(value.value);
    }
    return value;
  }

  // Inicialização
  loadFromStorage();

  // Retornar API pública do store
  return {
    // Estado
    currentGuild: readonly(currentGuild),
    guildHistory: readonly(guildHistory),
    isGenerating: readonly(isGenerating),
    lastConfig: readonly(lastConfig),
    error: readonly(error),
    
    // Getters
    hasCurrentGuild,
    historyCount,
    lastGenerated,
    canRegenerate,
    generationLogs,
    filteredHistory,
    
    // Actions
    generateGuild,
    generateQuickGuildAction,
    regenerateCurrentGuild,
    regenerateStructure,
    regenerateRelations,
    addToHistory,
    removeFromHistory,
    clearHistory,
    loadGuildFromHistory,
    selectGuildFromHistory,
    setCurrentGuild,
    clearCurrentGuild,
    clearError,
    saveToStorage,
    loadFromStorage,
    exportCurrentGuild,
    exportHistory,
    importGuild,
    generateGuildName,
  };
});

// Função de conveniência para acesso rápido ao store
export function useQuickGuildGeneration() {
  const store = useGuildStore();
  
  return {
    generate: store.generateQuickGuildAction,
    isGenerating: store.isGenerating,
    error: store.error,
    current: store.currentGuild,
  };
}
