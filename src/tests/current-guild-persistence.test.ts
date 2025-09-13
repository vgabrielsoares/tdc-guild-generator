import { describe, it, expect, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useGuildStore } from "@/stores/guild";
import { clearAdapter } from "@/utils/storage-adapter-resolver";
import { SettlementType } from "@/types/guild";

describe("Current Guild Persistence", () => {
  beforeEach(() => {
    clearAdapter();

    localStorage.clear();

    const pinia = createPinia();
    setActivePinia(pinia);
  });

  it("should persist current guild ID after reload", async () => {
    const guildStore = useGuildStore();

    const guild = await guildStore.generateGuild({
      settlementType: SettlementType.ALDEIA,
      saveToHistory: true,
    });

    expect(guildStore.currentGuild).not.toBeNull();
    expect(guildStore.currentGuild?.id).toBe(guild.id);

    const originalId = guild.id;

    await new Promise((resolve) => setTimeout(resolve, 300));

    clearAdapter();
    const pinia2 = createPinia();
    setActivePinia(pinia2);
    const newGuildStore = useGuildStore();

    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(newGuildStore.currentGuild).not.toBeNull();
    expect(newGuildStore.currentGuild?.id).toBe(originalId);
  });

  it("should clear current guild from storage when set to null", async () => {
    const guildStore = useGuildStore();

    await guildStore.generateGuild({
      settlementType: SettlementType.ALDEIA,
      saveToHistory: true,
    });

    expect(guildStore.currentGuild).not.toBeNull();

    guildStore.clearCurrentGuild();
    expect(guildStore.currentGuild).toBeNull();

    await new Promise((resolve) => setTimeout(resolve, 300));

    const localStorageValue = localStorage.getItem("current-guild-id");
    // eslint-disable-next-line no-console
    console.log("localStorage after clear:", localStorageValue);

    clearAdapter();
    const pinia2 = createPinia();
    setActivePinia(pinia2);
    const newGuildStore = useGuildStore();

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Debug info
    // eslint-disable-next-line no-console
    console.log(
      "After reload - current guild:",
      newGuildStore.currentGuild?.id
    );
    // eslint-disable-next-line no-console
    console.log(
      "After reload - history length:",
      newGuildStore.guildHistory.length
    );
    // eslint-disable-next-line no-console
    console.log(
      "After reload - localStorage:",
      localStorage.getItem("current-guild-id")
    );

    expect(newGuildStore.currentGuild).toBeNull();
  });

  it("should handle missing guild in history gracefully", async () => {
    const guildStore = useGuildStore();

    const guild = await guildStore.generateGuild({
      settlementType: SettlementType.ALDEIA,
      saveToHistory: true,
    });

    guildStore.removeFromHistory(guild.id);

    await new Promise((resolve) => setTimeout(resolve, 300));

    clearAdapter();
    const pinia2 = createPinia();
    setActivePinia(pinia2);
    const newGuildStore = useGuildStore();

    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(() => newGuildStore.currentGuild).not.toThrow();
  });
});
