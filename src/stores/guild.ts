import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import type { Guild } from "@/types/guild";

export const useGuildStore = defineStore("guild", () => {
  // State
  const currentGuild = ref<Guild | null>(null);
  const guilds = ref<Guild[]>([]);
  const isLoading = ref(false);
  const lastGenerated = ref<Date | null>(null);

  // Load data from localStorage on initialization
  const loadFromStorage = () => {
    try {
      const storedGuilds = localStorage.getItem("guilds");
      if (storedGuilds) {
        guilds.value = JSON.parse(storedGuilds);
        console.log(
          "[GUILD STORE] Loaded guilds from storage:",
          guilds.value.length
        );
      }
    } catch (error) {
      console.error("[GUILD STORE] Error loading guilds from storage:", error);
    }
  };

  // Save to localStorage
  const saveToStorage = () => {
    try {
      localStorage.setItem("guilds", JSON.stringify(guilds.value));
    } catch (error) {
      console.error("[GUILD STORE] Error saving guilds to storage:", error);
    }
  };

  // Auto-save when guilds change
  watch(guilds, saveToStorage, { deep: true });

  // Getters (computed)
  const hasCurrentGuild = computed(() => currentGuild.value !== null);
  const guildCount = computed(() => guilds.value.length);
  const recentGuilds = computed(() =>
    guilds.value
      .slice(0, 5)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
  );

  // Actions
  const generateGuild = async () => {
    isLoading.value = true;
    try {
      const newGuild: Guild = {
        id: `guild-${Date.now()}`,
        name: `Guilda ${guilds.value.length + 1}`,
        createdAt: new Date(),
      };

      // Add to guilds list
      guilds.value.unshift(newGuild);

      // Set as current guild
      currentGuild.value = newGuild;
      lastGenerated.value = new Date();

      console.log("[GUILD STORE] Generated guild:", newGuild);
      return newGuild;
    } finally {
      isLoading.value = false;
    }
  };

  const setCurrentGuild = (guild: Guild | null) => {
    currentGuild.value = guild;
    console.log("[GUILD STORE] Set current guild:", guild?.name || "None");
  };

  const saveGuild = (guild: Guild) => {
    const existingIndex = guilds.value.findIndex((g) => g.id === guild.id);

    if (existingIndex >= 0) {
      // Update existing guild
      guilds.value[existingIndex] = guild;
      console.log("[GUILD STORE] Updated guild:", guild.name);
    } else {
      // Add new guild
      guilds.value.unshift(guild);
      console.log("[GUILD STORE] Added new guild:", guild.name);
    }

    // Update current guild if it's the same
    if (currentGuild.value?.id === guild.id) {
      currentGuild.value = guild;
    }
  };

  const removeGuild = (guildId: string) => {
    const index = guilds.value.findIndex((g) => g.id === guildId);
    if (index >= 0) {
      const removed = guilds.value.splice(index, 1)[0];
      console.log("[GUILD STORE] Removed guild:", removed.name);

      // Clear current guild if it was removed
      if (currentGuild.value?.id === guildId) {
        currentGuild.value = null;
      }
    }
  };

  const clearAll = () => {
    guilds.value = [];
    currentGuild.value = null;
    lastGenerated.value = null;
    console.log("[GUILD STORE] Cleared all guilds");
  };

  // Initialize data from storage
  loadFromStorage();

  return {
    // State
    currentGuild,
    guilds,
    isLoading,
    lastGenerated,
    // Getters
    hasCurrentGuild,
    guildCount,
    recentGuilds,
    // Actions
    generateGuild,
    setCurrentGuild,
    saveGuild,
    removeGuild,
    clearAll,
  };
});
