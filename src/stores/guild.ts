import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Guild, GuildGenerationConfig } from "@/types/guild";
import { SettlementType } from "@/types/guild";
import { generateGuildStructure } from "@/utils/generators/guildStructure";
import { GuildRelationsGenerator } from "@/utils/generators/guildRelations";
import { isGuild } from "@/types/guild";

/**
 * Interface para o estado do store da guilda
 */
export interface GuildStoreState {
  currentGuild: Guild | null;
  guildHistory: Guild[];
  isGenerating: boolean;
  lastConfig: GuildGenerationConfig | null;
  lastGenerated: Date | null;
}

/**
 * Interface para options de geração
 */
export interface GenerateGuildOptions {
  settlementType: SettlementType;
  customModifiers?: {
    structure?: number;
    visitors?: number;
    government?: number;
    population?: number;
    resources?: number;
  };
  saveToHistory?: boolean;
}

/**
 * Store principal para gerenciamento de guildas
 *
 * Funcionalidades:
 * - Geração completa de guildas
 * - Estado reativo da guilda atual
 * - Histórico de guildas geradas
 * - Persistência local no localStorage
 * - CRUD completo de guildas
 */
export const useGuildStore = defineStore("guild", () => {
  // Estado reativo
  const currentGuild = ref<Guild | null>(null);
  const guildHistory = ref<Guild[]>([]);
  const isGenerating = ref(false);
  const lastConfig = ref<GuildGenerationConfig | null>(null);
  const lastGenerated = ref<Date | null>(null);

  // Chave para persistência local
  const STORAGE_KEY = "generator-guild-store";

  // Computadas
  const hasCurrentGuild = computed(() => currentGuild.value !== null);
  const historyCount = computed(() => guildHistory.value.length);
  const guildCount = computed(() => guildHistory.value.length);
  const recentGuilds = computed(() => guildHistory.value.slice(0, 10));
  const canRegenerate = computed(() => lastConfig.value !== null);

  /**
   * Estatísticas do histórico de guildas
   */
  const historyStats = computed(() => {
    const history = guildHistory.value;
    const settlementCounts = history.reduce(
      (acc, guild) => {
        acc[guild.settlementType] = (acc[guild.settlementType] || 0) + 1;
        return acc;
      },
      {} as Record<SettlementType, number>
    );

    const resourceCounts = history.reduce(
      (acc, guild) => {
        const level = guild.resources?.level || "unknown";
        acc[level] = (acc[level] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      total: history.length,
      bySettlement: settlementCounts,
      byResourceLevel: resourceCounts,
      oldestDate:
        history.length > 0
          ? new Date(
              Math.min(...history.map((g) => g.createdAt?.getTime() || 0))
            )
          : null,
      newestDate:
        history.length > 0
          ? new Date(
              Math.max(...history.map((g) => g.createdAt?.getTime() || 0))
            )
          : null,
    };
  });

  /**
   * Gera uma nova guilda completa
   */
  async function generateGuild(
    options: GenerateGuildOptions
  ): Promise<Guild | null> {
    try {
      isGenerating.value = true;

      // Cria configuração de geração
      const config: GuildGenerationConfig = {
        settlementType: options.settlementType,
        useModifiers: !!options.customModifiers,
        customModifiers: options.customModifiers,
      };

      // Gera estrutura da guilda
      const structureResult = generateGuildStructure(config);

      // Gera relações e recursos da guilda
      const relationsResult = GuildRelationsGenerator.generate({
        settlementType: options.settlementType,
        customModifiers: {
          governmentMod: options.customModifiers?.government,
          populationMod: options.customModifiers?.population,
          resourcesMod: options.customModifiers?.resources,
          visitorsMod: options.customModifiers?.visitors,
        },
      });

      // Cria guilda completa combinando os resultados
      const guild: Guild = {
        id: generateGuildId(),
        name: generateGuildName(options.settlementType),
        settlementType: options.settlementType,
        structure: structureResult.guild.structure,
        relations: relationsResult.relations,
        staff: structureResult.guild.staff,
        visitors: relationsResult.visitors,
        resources: relationsResult.resources,
        createdAt: new Date(),
      };

      // Valida guilda completa
      if (!isGuild(guild)) {
        throw new Error("Generated guild is invalid");
      }

      // Atualiza estado
      currentGuild.value = guild;
      lastConfig.value = config;
      lastGenerated.value = guild.createdAt || new Date();

      // Adiciona ao histórico se solicitado
      if (options.saveToHistory !== false) {
        guildHistory.value.unshift(guild);

        // Mantém apenas as últimas 50 guildas no histórico
        if (guildHistory.value.length > 50) {
          guildHistory.value = guildHistory.value.slice(0, 50);
        }
      }

      // Persiste dados
      await saveToStorage();

      return guild;
    } finally {
      isGenerating.value = false;
    }
  }

  /**
   * Regenera a guilda atual com os mesmos parâmetros
   */
  async function regenerateCurrentGuild(): Promise<Guild | null> {
    if (!currentGuild.value || !lastConfig.value) {
      throw new Error("Cannot regenerate: no current guild or config");
    }

    return generateGuild({
      settlementType: currentGuild.value.settlementType,
      customModifiers: lastConfig.value.customModifiers,
      saveToHistory: true,
    });
  }

  /**
   * Regenera apenas a estrutura da guilda atual
   */
  async function regenerateStructure(): Promise<void> {
    if (!currentGuild.value || !lastConfig.value) {
      throw new Error("No current guild to regenerate structure for");
    }

    try {
      isGenerating.value = true;

      const structureResult = generateGuildStructure(lastConfig.value);

      // Atualiza a estrutura, funcionários e visitantes
      currentGuild.value = {
        ...currentGuild.value,
        structure: structureResult.guild.structure,
        staff: structureResult.guild.staff,
        visitors: structureResult.guild.visitors,
        updatedAt: new Date(),
      };

      await saveToStorage();
    } finally {
      isGenerating.value = false;
    }
  }

  /**
   * Regenera apenas as relações da guilda atual
   */
  async function regenerateRelations(): Promise<void> {
    if (!currentGuild.value || !lastConfig.value) {
      throw new Error("No current guild to regenerate relations for");
    }

    try {
      isGenerating.value = true;

      const relationsResult = GuildRelationsGenerator.generate({
        settlementType: currentGuild.value.settlementType,
        customModifiers: {
          governmentMod: lastConfig.value.customModifiers?.government,
          populationMod: lastConfig.value.customModifiers?.population,
          resourcesMod: lastConfig.value.customModifiers?.resources,
          visitorsMod: lastConfig.value.customModifiers?.visitors,
        },
      });

      // Atualiza apenas as relações e recursos
      currentGuild.value = {
        ...currentGuild.value,
        relations: relationsResult.relations,
        resources: relationsResult.resources,
        updatedAt: new Date(),
      };

      await saveToStorage();
    } finally {
      isGenerating.value = false;
    }
  }

  /**
   * Seleciona uma guilda do histórico
   */
  function selectGuildFromHistory(guildId: string): boolean {
    const guild = guildHistory.value.find((g) => g.id === guildId);
    if (!guild) {
      return false;
    }

    currentGuild.value = guild;
    lastGenerated.value = guild.createdAt || new Date();

    return true;
  }

  /**
   * Remove uma guilda do histórico
   */
  async function removeFromHistory(guildId: string): Promise<boolean> {
    const index = guildHistory.value.findIndex((g) => g.id === guildId);
    if (index === -1) {
      return false;
    }

    guildHistory.value.splice(index, 1);

    // Se a guilda removida era a atual, limpa o estado atual
    if (currentGuild.value?.id === guildId) {
      currentGuild.value = null;
      lastConfig.value = null;
      lastGenerated.value = null;
    }

    await saveToStorage();
    return true;
  }

  /**
   * Limpa todo o histórico e guilda atual
   */
  async function clearAll(): Promise<void> {
    guildHistory.value = [];
    currentGuild.value = null;
    lastConfig.value = null;
    lastGenerated.value = null;
    await saveToStorage();
  }

  /**
   * Define a guilda atual
   */
  function setCurrentGuild(guild: Guild): void {
    currentGuild.value = guild;
    lastGenerated.value = guild.createdAt;
  }

  /**
   * Remove uma guilda do histórico (alias para removeFromHistory)
   */
  async function removeGuild(guildId: string): Promise<boolean> {
    return removeFromHistory(guildId);
  }

  /**
   * Gera uma guilda com configuração padrão
   */
  async function generateGuildWithDefaults(): Promise<Guild | null> {
    return generateGuild({
      settlementType: SettlementType.CIDADE_PEQUENA,
      saveToHistory: true,
    });
  }

  /**
   * Limpa todo o histórico
   */
  async function clearHistory(): Promise<void> {
    guildHistory.value = [];
    await saveToStorage();
  }

  /**
   * Limpa a guilda atual
   */
  function clearCurrentGuild(): void {
    currentGuild.value = null;
    lastConfig.value = null;
    lastGenerated.value = null;
  }

  /**
   * Exporta a guilda atual para JSON
   */
  function exportCurrentGuild(): string | null {
    if (!currentGuild.value) {
      return null;
    }

    try {
      return JSON.stringify(currentGuild.value, null, 2);
    } catch (error) {
      return null;
    }
  }

  /**
   * Exporta todo o histórico para JSON
   */
  function exportHistory(): string | null {
    try {
      return JSON.stringify(guildHistory.value, null, 2);
    } catch (error) {
      return null;
    }
  }

  /**
   * Importa guilda de JSON
   */
  async function importGuild(jsonData: string): Promise<boolean> {
    try {
      const parsedData = JSON.parse(jsonData);

      // Converte datas que vêm como string do JSON
      if (parsedData.createdAt && typeof parsedData.createdAt === "string") {
        parsedData.createdAt = new Date(parsedData.createdAt);
      }
      if (parsedData.updatedAt && typeof parsedData.updatedAt === "string") {
        parsedData.updatedAt = new Date(parsedData.updatedAt);
      }

      const guild = parsedData as Guild;

      if (!isGuild(guild)) {
        throw new Error("Invalid guild data");
      }

      // Gera novo ID para evitar conflitos
      guild.id = generateGuildId();
      guild.createdAt = new Date();

      currentGuild.value = guild;
      lastGenerated.value = guild.createdAt;

      // Adiciona ao histórico
      guildHistory.value.unshift(guild);

      await saveToStorage();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Salva o estado no localStorage
   */
  async function saveToStorage(): Promise<void> {
    try {
      const state: GuildStoreState = {
        currentGuild: currentGuild.value,
        guildHistory: guildHistory.value,
        isGenerating: false, // Não persiste estado de loading
        lastConfig: lastConfig.value,
        lastGenerated: lastGenerated.value,
      };

      const serializedState = JSON.stringify(state);

      // Verifica se há espaço suficiente no localStorage
      if (serializedState.length > 5 * 1024 * 1024) {
        // 5MB limite
        // Se muito grande, mantém apenas as últimas 10 guildas
        state.guildHistory = guildHistory.value.slice(0, 10);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      // Em caso de erro (ex: quota excedida), tenta limpar histórico antigo
      try {
        const reducedState: GuildStoreState = {
          currentGuild: currentGuild.value,
          guildHistory: guildHistory.value.slice(0, 5), // Apenas 5 mais recentes
          isGenerating: false,
          lastConfig: lastConfig.value,
          lastGenerated: lastGenerated.value,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reducedState));
      } catch (secondError) {
        // Falha silenciosa - localStorage pode não estar disponível
      }
    }
  }

  /**
   * Carrega o estado do localStorage
   */
  async function loadFromStorage(): Promise<void> {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (!storedData) {
        return;
      }

      const state = JSON.parse(storedData) as GuildStoreState;

      // Converte datas que vêm como string do JSON
      if (state.currentGuild) {
        if (
          state.currentGuild.createdAt &&
          typeof state.currentGuild.createdAt === "string"
        ) {
          state.currentGuild.createdAt = new Date(state.currentGuild.createdAt);
        }
      }

      // Converte datas no histórico
      if (state.guildHistory && Array.isArray(state.guildHistory)) {
        state.guildHistory = state.guildHistory.map((guild) => ({
          ...guild,
          createdAt: guild.createdAt ? new Date(guild.createdAt) : new Date(),
        }));
      }

      // Restaura estado
      currentGuild.value = state.currentGuild;
      guildHistory.value = state.guildHistory || [];
      lastConfig.value = state.lastConfig;
      lastGenerated.value = state.lastGenerated
        ? new Date(state.lastGenerated)
        : null;
    } catch (error) {
      // Limpa dados corrompidos e reinicia com estado limpo
      localStorage.removeItem(STORAGE_KEY);
      currentGuild.value = null;
      guildHistory.value = [];
      lastConfig.value = null;
      lastGenerated.value = null;
    }
  }

  /**
   * Gera um ID único para a guilda
   */
  function generateGuildId(): string {
    return `guild_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Gera um nome para a guilda baseado no assentamento e recursos
   */
  // TODO: Expand this to include more complex naming logic
  function generateGuildName(settlementType?: SettlementType): string {
    const prefixes = [
      "Guilda dos",
      "Irmandade dos",
      "Companhia dos",
      "Ordem dos",
      "Círculo dos",
      "Liga dos",
      "Conselho dos",
      "União dos",
    ];

    const suffixes = [
      "Artesãos",
      "Mercadores",
      "Ferreiros",
      "Tecelões",
      "Alquimistas",
      "Escribas",
      "Construtores",
      "Aventureiros",
      "Exploradores",
      "Protetores",
      "Comerciantes",
      "Mestres",
    ];

    // Nomes especiais para assentamentos grandes
    const specialNames = [
      "Rosa Dourada",
      "Luz Cerúlea",
      "Forja Ancestral",
      "Lâmina Prata",
      "Escudo de Ferro",
      "Coroa Imperial",
      "Torre de Marfim",
      "Punho de Aço",
    ];

    // Para metrópoles e cidades grandes, chance de nome especial
    if (
      settlementType === SettlementType.METROPOLE ||
      settlementType === SettlementType.CIDADE_GRANDE
    ) {
      if (Math.random() < 0.3) {
        return specialNames[Math.floor(Math.random() * specialNames.length)];
      }
    }

    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];

    return `${prefix} ${suffix}`;
  }

  // Carrega dados na inicialização
  loadFromStorage();

  return {
    // Estado
    currentGuild,
    guildHistory,
    isGenerating,
    lastConfig,
    lastGenerated,

    // Computadas
    hasCurrentGuild,
    historyCount,
    guildCount,
    recentGuilds,
    canRegenerate,
    historyStats,

    // Actions
    generateGuild,
    generateGuildWithDefaults,
    regenerateCurrentGuild,
    regenerateStructure,
    regenerateRelations,
    selectGuildFromHistory,
    removeFromHistory,
    removeGuild,
    clearHistory,
    clearAll,
    clearCurrentGuild,
    setCurrentGuild,
    exportCurrentGuild,
    exportHistory,
    importGuild,
    loadFromStorage,
    saveToStorage,
  };
});

export type GuildStore = ReturnType<typeof useGuildStore>;
