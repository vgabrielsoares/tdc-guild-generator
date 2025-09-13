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
import { useGuildStorage } from "@/composables/useGuildStorage";
import { useStorageAdapter } from "@/composables/useStorageAdapter";
import { useCurrentGuildPersistence } from "@/composables/useCurrentGuildPersistence";

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

/**
 * Store da guilda com funcionalidades completas de CRUD e geração
 */
export const useGuildStore = defineStore("guild", () => {
  // Estado reativo
  const isGenerating = ref(false);
  const lastGenerationResult = ref<GuildGenerationResult | null>(null);
  const error = ref<string | null>(null);

  // Storage resiliente
  const guildStorage = useGuildStorage();
  const storageAdapter = useStorageAdapter();
  const currentGuildPersistence = useCurrentGuildPersistence();

  // Refs computados a partir do storage com validação
  const currentGuild = computed({
    get: () => {
      const guild = guildStorage.data.value.currentGuild;
      if (!guild) {
        // Tentar recuperar do localStorage (para guildas não salvas no histórico)
        const persistedGuild = currentGuildPersistence.currentGuild.value;
        if (persistedGuild) {
          // Restaurar a guilda do localStorage e sincronizar com IndexedDB
          guildStorage.data.value.currentGuild = persistedGuild;
          return persistedGuild;
        }
        return null;
      }

      // Validate the stored guild using Zod helper. If invalid, remove it.
      try {
        const valid = createGuild(guild);
        // createGuild coerces/validates dates according to schema, so ensure storage has normalized value
        if (valid !== guild) {
          guildStorage.data.value.currentGuild = valid;
        }
        // Sincronizar com localStorage sempre que houver uma guilda válida
        if (
          JSON.stringify(valid) !==
          JSON.stringify(currentGuildPersistence.currentGuild.value)
        ) {
          currentGuildPersistence.setCurrentGuild(valid);
        }
        return valid;
      } catch (err) {
        // invalid data persisted. clear it to avoid runtime errors
        // eslint-disable-next-line no-console
        console.warn("Invalid stored currentGuild removed:", err);
        guildStorage.data.value.currentGuild = null;
        currentGuildPersistence.clearCurrentGuild();
        return null;
      }
    },
    set: (value) => {
      guildStorage.data.value.currentGuild = value;
      // Sincronizar com localStorage
      currentGuildPersistence.setCurrentGuild(value);
    },
  });

  const guildHistory = computed({
    get: () => {
      const storedGuilds = guildStorage.data.value.guildHistory;

      // validate each guild using Zod. keep only valid entries
      const validGuilds: Guild[] = [];
      for (const g of storedGuilds) {
        try {
          const vg = createGuild(g);
          validGuilds.push(vg);
        } catch (err) {
          // drop invalid entry
          // eslint-disable-next-line no-console
          console.warn("Dropping invalid guild from history:", err);
        }
      }

      // Update storage only if we removed/normalized entries
      if (validGuilds.length !== storedGuilds.length) {
        guildStorage.data.value.guildHistory = validGuilds;
      } else {
        // Even if lengths match, some entries might have been normalized by createGuild
        for (let i = 0; i < validGuilds.length; i++) {
          if (validGuilds[i] !== storedGuilds[i]) {
            guildStorage.data.value.guildHistory = validGuilds;
            break;
          }
        }
      }

      return validGuilds;
    },
    set: (value) => {
      guildStorage.data.value.guildHistory = value;
    },
  });

  const lastConfig = computed<GenerateGuildOptions | null>({
    get: () =>
      (guildStorage.data.value.lastConfig as GenerateGuildOptions | null) ??
      null,
    set: (value) => {
      guildStorage.data.value.lastConfig = value as unknown;
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
    const historyIndex = guildStorage.data.value.guildHistory.findIndex(
      (g) => g.id === originalId
    );
    if (historyIndex !== -1) {
      const newHistory = guildStorage.data.value.guildHistory.slice();
      newHistory[historyIndex] = regeneratedGuild;
      guildStorage.data.value.guildHistory = newHistory;
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
    const historyIndex = guildStorage.data.value.guildHistory.findIndex(
      (g) => g.id === originalId
    );
    if (historyIndex !== -1) {
      const newHistory = guildStorage.data.value.guildHistory.slice();
      newHistory[historyIndex] = regeneratedGuild;
      guildStorage.data.value.guildHistory = newHistory;
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
    const historyIndex = guildStorage.data.value.guildHistory.findIndex(
      (g) => g.id === originalId
    );
    if (historyIndex !== -1) {
      const newHistory = guildStorage.data.value.guildHistory.slice();
      newHistory[historyIndex] = regeneratedGuild;
      guildStorage.data.value.guildHistory = newHistory;
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
    const historyIndex = guildStorage.data.value.guildHistory.findIndex(
      (g) => g.id === originalGuild.id
    );
    if (historyIndex !== -1) {
      guildStorage.data.value.guildHistory[historyIndex] = regeneratedGuild;
    }
  }

  // Regenerar apenas o nome da guilda
  async function regenerateGuildName(): Promise<void> {
    if (!currentGuild.value) {
      throw new Error("Cannot regenerate: no current guild");
    }

    // Verificar se a guilda está bloqueada
    if (currentGuild.value.locked) {
      throw new Error("Cannot regenerate guild name: guild is locked");
    }

    const originalGuild = currentGuild.value;

    // Gerar novo nome usando o gerador de nomes
    const newName = generateRandomGuildName();

    // Criar guilda com novo nome mas mantendo todo o resto igual
    const regeneratedGuild: Guild = {
      ...originalGuild,
      name: newName,
      updatedAt: new Date(),
    };

    currentGuild.value = regeneratedGuild;

    // Atualizar no histórico se existir - modificar o storage diretamente
    const historyIndex = guildStorage.data.value.guildHistory.findIndex(
      (g) => g.id === originalGuild.id
    );
    if (historyIndex !== -1) {
      guildStorage.data.value.guildHistory[historyIndex] = regeneratedGuild;
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
        createdAt:
          guild.createdAt instanceof Date
            ? guild.createdAt
            : new Date(guild.createdAt || Date.now()),
        updatedAt:
          guild.updatedAt instanceof Date
            ? guild.updatedAt
            : new Date(guild.updatedAt),
      };
    } else {
      guildToSave = {
        ...guild,
        createdAt:
          guild.createdAt instanceof Date
            ? guild.createdAt
            : new Date(guild.createdAt || Date.now()),
      };
    }

    // Evitar duplicatas baseadas no ID - verificar no storage diretamente
    const existingIndex = guildStorage.data.value.guildHistory.findIndex(
      (g) => g.id === guildToSave.id
    );
    if (existingIndex === -1) {
      // Prepend immutably so Vue detects the change
      const newHistory = [guildToSave, ...guildStorage.data.value.guildHistory];

      // Limit history to 50 guilds
      guildStorage.data.value.guildHistory =
        newHistory.length > 50 ? newHistory.slice(0, 50) : newHistory;

      // If there is no currentGuild, set this as current for immediate rendering
      if (!currentGuild.value) {
        currentGuild.value = guildToSave;
      }
    }
  }

  async function removeFromHistory(guildId: string): Promise<boolean> {
    const guild = guildStorage.data.value.guildHistory.find(
      (g) => g.id === guildId
    );

    // Não permitir remoção se a guilda estiver bloqueada
    if (guild?.locked) {
      return false;
    }

    // Não permitir remoção se existir uma timeline ativa para esta guilda
    try {
      const { useTimelineStore } = await import("./timeline");
      const timelineStore = useTimelineStore();
      if (timelineStore.currentGuildId === guildId) return false;
    } catch {
      // ignore if timeline store can't be resolved
    }

    const initialLength = guildStorage.data.value.guildHistory.length;

    // Se a guilda atual está sendo removida, limpar
    if (currentGuild.value?.id === guildId) {
      currentGuild.value = null;
      lastConfig.value = null;
    }

    // Modificar o storage diretamente
    guildStorage.data.value.guildHistory =
      guildStorage.data.value.guildHistory.filter((g) => g.id !== guildId);

    const removed = guildStorage.data.value.guildHistory.length < initialLength;

    // Se removeu com sucesso, limpar contratos associados
    if (removed) {
      // Importar de forma dinâmica para evitar dependência circular
      import("./contracts")
        .then(({ useContractsStore }) => {
          const contractsStore = useContractsStore();
          contractsStore.cleanupGuildContracts(guildId);
        })
        .catch(() => {
          // Erro silencioso na limpeza de contratos
        });
    }

    return removed;
  }

  function clearHistory(): void {
    // Obter IDs das guildas que serão removidas para limpeza de contratos
    const guildIdsToRemove = guildStorage.data.value.guildHistory
      .filter((g) => !g.locked)
      .map((g) => g.id);

    // Manter apenas as guildas bloqueadas - modificar o storage diretamente
    guildStorage.data.value.guildHistory =
      guildStorage.data.value.guildHistory.filter((g) => g.locked);

    // Limpar contratos das guildas removidas
    if (guildIdsToRemove.length > 0) {
      import("./contracts")
        .then(({ useContractsStore }) => {
          const contractsStore = useContractsStore();
          guildIdsToRemove.forEach((guildId) => {
            contractsStore.cleanupGuildContracts(guildId);
          });
        })
        .catch(() => {
          // Erro silencioso na limpeza de contratos
        });
    }
  }

  /**
   * Limpa contratos órfãos (de guildas que não existem mais no histórico)
   */
  function cleanupOrphanedContracts(): void {
    const existingGuildIds = guildStorage.data.value.guildHistory.map(
      (g) => g.id
    );

    import("./contracts")
      .then(({ useContractsStore }) => {
        const contractsStore = useContractsStore();
        contractsStore.cleanupRemovedGuilds(existingGuildIds);
      })
      .catch(() => {
        // Erro silencioso na limpeza de contratos
      });
  }
  async function toggleGuildLock(guildId: string): Promise<boolean> {
    const guildIndex = guildStorage.data.value.guildHistory.findIndex(
      (g) => g.id === guildId
    );
    if (guildIndex === -1) {
      return false;
    }

    const guild = guildStorage.data.value.guildHistory[guildIndex];

    if (guild.locked) {
      // If trying to unlock, ensure there isn't an active timeline for this guild
      try {
        const { useTimelineStore } = await import("./timeline");
        const timelineStore = useTimelineStore();
        const active = timelineStore.currentGuildId;
        if (active === guildId) {
          // do not allow unlocking while timeline is active
          return false;
        }

        // Verificar se existe timeline criada para esta guilda
        const hasTimeline = timelineStore.timelines[guildId];
        if (hasTimeline) {
          // Não permitir desbloqueio se existe timeline, mesmo que não seja a atual
          return false;
        }
      } catch {
        // ignore import errors and proceed with original checks
      }
      // Verificar se existe dados de contratos para esta guilda diretamente no localStorage
      const contractsStorageKey = "contracts-store-v2";
      try {
        const stored = await storageAdapter.get<Record<string, unknown> | null>(
          "settings",
          contractsStorageKey
        );
        if (stored && typeof stored === "object") {
          const guildContracts = (stored as Record<string, unknown>)
            .guildContracts as Record<string, unknown> | undefined;
          const entry = guildContracts ? guildContracts[guildId] : undefined;
          if (
            entry &&
            typeof (entry as Record<string, unknown>)["generationCount"] ===
              "number"
          ) {
            const gen = (entry as Record<string, unknown>)[
              "generationCount"
            ] as number;
            if (gen > 0) return false;
          }
        }
      } catch (e) {
        // on any error, allow toggle for safety
      }
    }

    const newGuild = { ...guild, locked: !guild.locked };
    // Replace the history array immutably to ensure Vue reactivity consumers update
    const newHistory = guildStorage.data.value.guildHistory.slice();
    newHistory[guildIndex] = newGuild;
    guildStorage.data.value.guildHistory = newHistory;

    // If the current guild is being modified, update it as well
    if (currentGuild.value?.id === guildId) {
      currentGuild.value = newGuild;
    }

    return true;
  }

  function loadGuildFromHistory(guildId: string): Guild | null {
    const guild = guildStorage.data.value.guildHistory.find(
      (g) => g.id === guildId
    );
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
    const historyIndex = guildStorage.data.value.guildHistory.findIndex(
      (g) => g.id === updatedGuild.id
    );
    if (historyIndex !== -1) {
      guildStorage.data.value.guildHistory = [
        ...guildStorage.data.value.guildHistory.slice(0, historyIndex),
        updatedGuild,
        ...guildStorage.data.value.guildHistory.slice(historyIndex + 1),
      ];
    }

    return true;
  }

  function clearCurrentGuild(): void {
    currentGuild.value = null;
    lastGenerationResult.value = null;
    lastConfig.value = null;
    error.value = null;

    // Limpar também do storage IndexedDB para garantir consistência
    void (async () => {
      try {
        await storageAdapter.del("settings", "guild-current-id");
      } catch (e) {
        // ignorar erros
      }
    })();
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
      const parsed = JSON.parse(jsonData, dateReviver);
      // Use createGuild to validate and coerce the imported data
      const valid = createGuild(parsed);

      currentGuild.value = valid;
      addToHistory(valid);

      return true;
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
    regenerateGuildName,
    addToHistory,
    removeFromHistory,
    clearHistory,
    cleanupOrphanedContracts,
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
