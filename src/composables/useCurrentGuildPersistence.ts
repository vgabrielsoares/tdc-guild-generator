import { ref, watch } from "vue";
import type { Ref } from "vue";
import type { Guild } from "@/types/guild";
import { createGuild } from "@/types/guild";

const CURRENT_GUILD_KEY = "current-guild";

/**
 * Composable para gerenciar a persistência da guilda atual no localStorage
 * Salva a guilda completa para garantir persistência mesmo se não estiver no histórico
 */
export function useCurrentGuildPersistence(): {
  currentGuild: Ref<Guild | null>;
  setCurrentGuild: (guild: Guild | null) => void;
  clearCurrentGuild: () => void;
  loadCurrentGuild: () => void;
} {
  const currentGuild = ref<Guild | null>(null);

  // Carregar do localStorage na inicialização
  function loadCurrentGuild() {
    try {
      const stored = localStorage.getItem(CURRENT_GUILD_KEY);
      if (stored) {
        const parsedGuild = JSON.parse(stored);
        // Validar e criar guild usando Zod
        currentGuild.value = createGuild(parsedGuild);
      } else {
        currentGuild.value = null;
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("Failed to load current guild from localStorage:", error);
      currentGuild.value = null;
      // Limpar localStorage corrompido
      try {
        localStorage.removeItem(CURRENT_GUILD_KEY);
      } catch (e) {
        // ignore
      }
    }
  }

  // Definir guilda atual
  function setCurrentGuild(guild: Guild | null) {
    currentGuild.value = guild;
    persistCurrentGuild();
  }

  // Limpar guilda atual
  function clearCurrentGuild() {
    currentGuild.value = null;
    persistCurrentGuild();
  }

  // Persistir no localStorage
  function persistCurrentGuild() {
    try {
      if (currentGuild.value) {
        localStorage.setItem(
          CURRENT_GUILD_KEY,
          JSON.stringify(currentGuild.value)
        );
      } else {
        localStorage.removeItem(CURRENT_GUILD_KEY);
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.warn("Failed to persist current guild to localStorage:", error);
    }
  }

  // Watch para persistir mudanças automaticamente
  watch(
    currentGuild,
    () => {
      persistCurrentGuild();
    },
    { immediate: false }
  );

  // Carregar na inicialização
  loadCurrentGuild();

  return {
    currentGuild,
    setCurrentGuild,
    clearCurrentGuild,
    loadCurrentGuild,
  };
}
