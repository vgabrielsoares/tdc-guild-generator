import { defineStore } from "pinia";
import { ref, computed, readonly } from "vue";
import type { Guild, SettlementType } from "@/types/guild";
import { SettlementType as SettlementTypeEnum } from "@/types/guild";
import {
  GuildGenerator,
  type GuildGenerationConfig,
  type GuildGenerationResult,
} from "@/utils/generators/guild-generator";
import { createGuild, isGuild } from "@/types/guild";
import { generateRandomGuildName } from "@/data/guild-names";
import { useStorage } from "@/composables/useStorage";

// Interface para opções de geração
export interface GenerateGuildOptions {
  readonly settlementType: SettlementType;
  readonly name?: string;
  readonly customModifiers?: GuildGenerationConfig["customModifiers"];
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

// Interface para o estado do storage
interface GuildStorageState {
  currentGuild: Guild | null;
  guildHistory: Guild[];
  lastConfig: GenerateGuildOptions | null;
}

/**
 * Store da guilda com funcionalidades completas de CRUD e geração
 */
export const useGuildStore = defineStore("guild", () => {
  // Estado reativo
  const isGenerating = ref(false);
  const lastGenerationResult = ref<GuildGenerationResult | null>(null);
  const error = ref<string | null>(null);

  // Storage resiliente
  const storage = useStorage<GuildStorageState>("guild-store", {
    currentGuild: null,
    guildHistory: [],
    lastConfig: null,
  });

  // Refs computados a partir do storage com validação
  const currentGuild = computed({
    get: () => {
      const guild = storage.data.value.currentGuild;
      if (!guild) return null;

      // Validar e corrigir a data se necessário
      if (guild.createdAt && !(guild.createdAt instanceof Date)) {
        try {
          const correctedGuild = {
            ...guild,
            createdAt: new Date(guild.createdAt),
          };
          // Atualizar o storage com a guilda corrigida
          storage.data.value.currentGuild = correctedGuild;
          return correctedGuild;
        } catch {
          const correctedGuild = {
            ...guild,
            createdAt: new Date(),
          };
          storage.data.value.currentGuild = correctedGuild;
          return correctedGuild;
        }
      }

      return guild;
    },
    set: (value) => {
      storage.data.value.currentGuild = value;
    },
  });

  const guildHistory = computed({
    get: () => {
      // retornar diretamente o storage, apenas com validação básica
      const storedGuilds = storage.data.value.guildHistory;
      
      // Filtrar apenas guildas com problemas críticos (IDs ou nomes ausentes)
      const validGuilds = storedGuilds.filter((guild) => {
        return guild && guild.id && guild.name;
      });

      // Atualizar o storage apenas se removemos guildas inválidas
      if (validGuilds.length !== storedGuilds.length) {
        storage.data.value.guildHistory = validGuilds;
      }

      return validGuilds;
    },
    set: (value) => {
      storage.data.value.guildHistory = value;
    },
  });

  const lastConfig = computed({
    get: () => storage.data.value.lastConfig,
    set: (value) => {
      storage.data.value.lastConfig = value;
    },
  });

  // Getters computados
  const hasCurrentGuild = computed(() => currentGuild.value !== null);

  const historyCount = computed(() => guildHistory.value.length);

  const lastGenerated = computed(
    () => lastGenerationResult.value?.timestamp || null
  );

  const canRegenerate = computed(
    () => currentGuild.value !== null && lastConfig.value !== null
  );

  const generationLogs = computed(() => lastGenerationResult.value?.logs || []);

  const filteredHistory = computed(() => {
    return (filters: GuildHistoryFilters) => {
      return guildHistory.value.filter((guild) => {
        if (
          filters.settlementType &&
          guild.settlementType !== filters.settlementType
        ) {
          return false;
        }

        if (
          filters.nameContains &&
          !guild.name.toLowerCase().includes(filters.nameContains.toLowerCase())
        ) {
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
      throw new Error("Guild generation already in progress");
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

      return guild;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Unknown error during generation";
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
      throw new Error("Cannot regenerate: no current guild or config");
    }

    // Verificar se a guilda está bloqueada
    if (currentGuild.value.locked) {
      throw new Error("Cannot regenerate: guild is locked");
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

    // Atualizar no histórico se existir - modificar o storage diretamente
    const historyIndex = storage.data.value.guildHistory.findIndex(
      (g) => g.id === originalId
    );
    if (historyIndex !== -1) {
      storage.data.value.guildHistory[historyIndex] = regeneratedGuild;
    }

    return regeneratedGuild;
  }

  // Regenerar apenas a estrutura
  async function regenerateStructure(): Promise<void> {
    if (!currentGuild.value || !lastConfig.value) {
      throw new Error("Cannot regenerate: no current guild or config");
    }

    // Verificar se a guilda está bloqueada
    if (currentGuild.value.locked) {
      throw new Error("Cannot regenerate structure: guild is locked");
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

    // Atualizar no histórico se existir - modificar o storage diretamente
    const historyIndex = storage.data.value.guildHistory.findIndex(
      (g) => g.id === originalId
    );
    if (historyIndex !== -1) {
      storage.data.value.guildHistory[historyIndex] = regeneratedGuild;
    }
  }

  // Regenerar apenas as relações
  async function regenerateRelations(): Promise<void> {
    if (!currentGuild.value || !lastConfig.value) {
      throw new Error("Cannot regenerate: no current guild or config");
    }

    // Verificar se a guilda está bloqueada
    if (currentGuild.value.locked) {
      throw new Error("Cannot regenerate relations: guild is locked");
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

    // Atualizar no histórico se existir - modificar o storage diretamente
    const historyIndex = storage.data.value.guildHistory.findIndex(
      (g) => g.id === originalId
    );
    if (historyIndex !== -1) {
      storage.data.value.guildHistory[historyIndex] = regeneratedGuild;
    }
  }

  // Regenerar apenas os frequentadores
  async function regenerateVisitors(): Promise<void> {
    if (!currentGuild.value || !lastConfig.value) {
      throw new Error("Cannot regenerate: no current guild or config");
    }

    const originalGuild = currentGuild.value;

    const { regenerateVisitorsOnly } = await import(
      "@/utils/generators/resources-visitors-generator"
    );

    // Regenerar visitantes preservando todos os modificadores originais
    const visitorsResult = regenerateVisitorsOnly(
      originalGuild.settlementType,
      originalGuild.staff.description || "",
      originalGuild.resources.level,
      lastConfig.value.customModifiers?.visitors
        ? { visitors: lastConfig.value.customModifiers.visitors.frequency }
        : undefined,
      lastConfig.value.debug || false
    );

    // Criar guilda com novos frequentadores mas mantendo todo o resto igual
    const regeneratedGuild: Guild = {
      ...originalGuild,
      visitors: {
        frequency: visitorsResult.frequency,
      },
    };

    currentGuild.value = regeneratedGuild;

    // Atualizar no histórico se existir - modificar o storage diretamente
    const historyIndex = storage.data.value.guildHistory.findIndex(
      (g) => g.id === originalGuild.id
    );
    if (historyIndex !== -1) {
      storage.data.value.guildHistory[historyIndex] = regeneratedGuild;
    }
  }

  // CRUD do histórico
  function addToHistory(guild: Guild): void {
    if (!isGuild(guild)) {
      throw new Error("Invalid guild object");
    }

    // Garantir que as datas sejam objetos Date antes de salvar
    let guildToSave: Guild;
    if (guild.updatedAt) {
      guildToSave = {
        ...guild,
        createdAt: guild.createdAt instanceof Date ? guild.createdAt : new Date(guild.createdAt || Date.now()),
        updatedAt: guild.updatedAt instanceof Date ? guild.updatedAt : new Date(guild.updatedAt),
      };
    } else {
      guildToSave = {
        ...guild,
        createdAt: guild.createdAt instanceof Date ? guild.createdAt : new Date(guild.createdAt || Date.now()),
      };
    }

    // Evitar duplicatas baseadas no ID - verificar no storage diretamente
    const existingIndex = storage.data.value.guildHistory.findIndex(
      (g) => g.id === guildToSave.id
    );
    if (existingIndex === -1) {
      // Modificar o storage diretamente para garantir persistência
      storage.data.value.guildHistory.unshift(guildToSave);

      // Limitar histórico a 50 guildas
      if (storage.data.value.guildHistory.length > 50) {
        storage.data.value.guildHistory = storage.data.value.guildHistory.slice(0, 50);
      }
    }
  }

  function removeFromHistory(guildId: string): boolean {
    const guild = storage.data.value.guildHistory.find((g) => g.id === guildId);

    // Não permitir remoção se a guilda estiver bloqueada
    if (guild?.locked) {
      return false;
    }

    const initialLength = storage.data.value.guildHistory.length;

    // Se a guilda atual está sendo removida, limpar
    if (currentGuild.value?.id === guildId) {
      currentGuild.value = null;
      lastConfig.value = null;
    }

    // Modificar o storage diretamente
    storage.data.value.guildHistory = storage.data.value.guildHistory.filter((g) => g.id !== guildId);

    const removed = storage.data.value.guildHistory.length < initialLength;
    return removed;
  }

  function clearHistory(): void {
    // Manter apenas as guildas bloqueadas - modificar o storage diretamente
    storage.data.value.guildHistory = storage.data.value.guildHistory.filter((g) => g.locked);
  }

  function toggleGuildLock(guildId: string): boolean {
    const guildIndex = storage.data.value.guildHistory.findIndex((g) => g.id === guildId);
    if (guildIndex === -1) {
      return false;
    }

    const guild = storage.data.value.guildHistory[guildIndex];
    const newGuild = { ...guild, locked: !guild.locked };
    // Modificar o storage diretamente
    storage.data.value.guildHistory[guildIndex] = newGuild;

    // Se a guilda atual está sendo modificada, atualizar também
    if (currentGuild.value?.id === guildId) {
      currentGuild.value = newGuild;
    }

    return true;
  }

  function loadGuildFromHistory(guildId: string): Guild | null {
    const guild = storage.data.value.guildHistory.find((g) => g.id === guildId);
    if (guild) {
      currentGuild.value = guild;
      return guild;
    }
    return null;
  }

  // Selecionar guilda do histórico
  function selectGuildFromHistory(guildId: string): boolean {
    const guild = loadGuildFromHistory(guildId);
    if (guild !== null) {
      lastConfig.value = {
        settlementType: guild.settlementType,
        name: guild.name,
        customModifiers: {}, // Não temos os modificadores originais, usar padrão
        saveToHistory: false, // Para regenerações, não salvar automaticamente
      };
      return true;
    }
    return false;
  }

  // Gerenciamento de estado
  function setCurrentGuild(guild: Guild | null): void {
    if (guild && !isGuild(guild)) {
      throw new Error("Invalid guild object");
    }
    currentGuild.value = guild;
  }

  function updateGuildName(newName: string): boolean {
    if (!currentGuild.value || !newName.trim()) {
      return false;
    }

    const trimmedName = newName.trim();
    if (trimmedName === currentGuild.value.name) {
      return false;
    }

    // Criar nova instância da guilda com o nome atualizado
    const updatedGuild: Guild = {
      ...currentGuild.value,
      name: trimmedName,
      updatedAt: new Date(),
    };

    currentGuild.value = updatedGuild;

    // Atualizar no histórico se existe - modificar o storage diretamente
    const historyIndex = storage.data.value.guildHistory.findIndex(
      (g) => g.id === updatedGuild.id
    );
    if (historyIndex !== -1) {
      storage.data.value.guildHistory = [
        ...storage.data.value.guildHistory.slice(0, historyIndex),
        updatedGuild,
        ...storage.data.value.guildHistory.slice(historyIndex + 1),
      ];
    }

    return true;
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
      console.warn("Failed to export current guild:", err);
      return null;
    }
  }

  // Exportar histórico como JSON
  function exportHistory(): string {
    try {
      return JSON.stringify(guildHistory.value, dateReplacer, 2);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("Failed to export guild history:", err);
      return "[]";
    }
  }

  // Gerar nome de guilda
  function generateGuildName(): string {
    return generateRandomGuildName();
  }

  // Importar guilda do JSON
  async function importGuild(jsonData: string): Promise<boolean> {
    try {
      const guildData = JSON.parse(jsonData, dateReviver);

      // Validação mais flexível para importação
      if (
        guildData &&
        typeof guildData === "object" &&
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

        return true;
      }

      return false;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn("Failed to import guild:", err);
      return false;
    }
  }

  function clearError(): void {
    error.value = null;
  }

  // Utilitários
  function validateGenerationOptions(options: GenerateGuildOptions): void {
    if (!options.settlementType) {
      throw new Error("Settlement type is required");
    }

    if (!Object.values(SettlementTypeEnum).includes(options.settlementType)) {
      throw new Error(`Invalid settlement type: ${options.settlementType}`);
    }

    if (options.name && options.name.trim().length === 0) {
      throw new Error("Guild name cannot be empty");
    }
  }

  // Serialização de datas para exports
  function dateReplacer(_key: string, value: unknown): unknown {
    if (value instanceof Date) {
      return { __type: "Date", value: value.toISOString() };
    }
    return value;
  }

  function dateReviver(_key: string, value: unknown): unknown {
    if (
      typeof value === "object" &&
      value !== null &&
      "__type" in value &&
      value.__type === "Date" &&
      "value" in value &&
      typeof value.value === "string"
    ) {
      return new Date(value.value);
    }
    return value;
  }

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
    regenerateVisitors,
    addToHistory,
    removeFromHistory,
    clearHistory,
    toggleGuildLock,
    loadGuildFromHistory,
    selectGuildFromHistory,
    setCurrentGuild,
    updateGuildName,
    clearCurrentGuild,
    clearError,
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
