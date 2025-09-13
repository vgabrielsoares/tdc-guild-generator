import { describe, it, expect, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useGuildStore } from "@/stores/guild";
import { clearAdapter } from "@/utils/storage-adapter-resolver";
import { SettlementType } from "@/types/guild";

describe("Current Guild Complete Persistence", () => {
  beforeEach(() => {
    clearAdapter();
    localStorage.clear();
    const pinia = createPinia();
    setActivePinia(pinia);
  });

  it("should persist complete guild data even when not saved to history", async () => {
    // Session 1: Generate guild but don't save to history
    const guildStore = useGuildStore();

    const guild = await guildStore.generateGuild({
      settlementType: SettlementType.ALDEIA,
      saveToHistory: false, // Important: NOT saving to history
    });

    expect(guildStore.currentGuild).not.toBeNull();
    expect(guildStore.currentGuild?.id).toBe(guild.id);
    expect(guildStore.guildHistory.length).toBe(0); // Confirm not in history

    // Verify localStorage has the complete guild
    const stored = localStorage.getItem("current-guild");
    expect(stored).toBeTruthy();

    const originalId = guild.id;
    const originalName = guild.name;

    await new Promise((resolve) => setTimeout(resolve, 300));

    // Session 2: Simulate page reload
    clearAdapter();
    const pinia2 = createPinia();
    setActivePinia(pinia2);
    const newGuildStore = useGuildStore();

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Should restore the complete guild even though it's not in history
    expect(newGuildStore.currentGuild).not.toBeNull();
    expect(newGuildStore.currentGuild?.id).toBe(originalId);
    expect(newGuildStore.currentGuild?.name).toBe(originalName);
    expect(newGuildStore.guildHistory.length).toBe(0); // Still not in history
  });

  it("should persist guild from history correctly", async () => {
    // Session 1: Generate and save guild to history
    const guildStore = useGuildStore();

    const guild = await guildStore.generateGuild({
      settlementType: SettlementType.POVOADO,
      saveToHistory: true, // Saving to history
    });

    expect(guildStore.currentGuild).not.toBeNull();
    expect(guildStore.guildHistory.length).toBe(1);

    const originalId = guild.id;
    const originalName = guild.name;

    await new Promise((resolve) => setTimeout(resolve, 300));

    // Session 2: Simulate page reload
    clearAdapter();
    const pinia2 = createPinia();
    setActivePinia(pinia2);
    const newGuildStore = useGuildStore();

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Should restore guild (from localStorage backup)
    expect(newGuildStore.currentGuild).not.toBeNull();
    expect(newGuildStore.currentGuild?.id).toBe(originalId);
    expect(newGuildStore.currentGuild?.name).toBe(originalName);
    expect(newGuildStore.guildHistory.length).toBe(1); // Still in history
  });

  it("should handle loading guild from history after localStorage cleared", async () => {
    // Session 1: Generate guild and save to history
    const guildStore = useGuildStore();

    const guild = await guildStore.generateGuild({
      settlementType: SettlementType.ALDEIA,
      saveToHistory: true,
    });

    const originalId = guild.id;

    // Manually clear localStorage but keep IndexedDB (history)
    localStorage.removeItem("current-guild");

    await new Promise((resolve) => setTimeout(resolve, 300));

    // Session 2: Reload without localStorage backup
    clearAdapter();
    const pinia2 = createPinia();
    setActivePinia(pinia2);
    const newGuildStore = useGuildStore();

    await new Promise((resolve) => setTimeout(resolve, 500));

    // Should still find guild in history through IndexedDB
    expect(newGuildStore.guildHistory.length).toBe(1);
    expect(newGuildStore.guildHistory[0].id).toBe(originalId);

    // Current guild should be null since localStorage backup was cleared
    // and we didn't explicitly set it as current again
    expect(newGuildStore.currentGuild).toBeNull();
  });

  it("should clear both localStorage and IndexedDB when current guild is cleared", async () => {
    const guildStore = useGuildStore();

    await guildStore.generateGuild({
      settlementType: SettlementType.ALDEIA,
      saveToHistory: false,
    });

    expect(guildStore.currentGuild).not.toBeNull();
    expect(localStorage.getItem("current-guild")).toBeTruthy();

    // Clear current guild
    guildStore.clearCurrentGuild();
    expect(guildStore.currentGuild).toBeNull();

    await new Promise((resolve) => setTimeout(resolve, 300));

    // Verify localStorage is cleared
    expect(localStorage.getItem("current-guild")).toBeNull();

    // Session 2: Verify no guild is restored after reload
    clearAdapter();
    const pinia2 = createPinia();
    setActivePinia(pinia2);
    const newGuildStore = useGuildStore();

    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(newGuildStore.currentGuild).toBeNull();
  });

  it("should replace current guild when loading from history", async () => {
    const guildStore = useGuildStore();

    // Generate first guild (saved to history)
    await guildStore.generateGuild({
      settlementType: SettlementType.ALDEIA,
      saveToHistory: true,
    });

    // Generate second guild (saved to history)
    const guild2 = await guildStore.generateGuild({
      settlementType: SettlementType.POVOADO,
      saveToHistory: true,
    });

    expect(guildStore.currentGuild?.id).toBe(guild2.id);
    expect(guildStore.guildHistory.length).toBe(2);

    // Load the second guild from history explicitly
    guildStore.loadGuildFromHistory(guild2.id);
    expect(guildStore.currentGuild?.id).toBe(guild2.id);

    // Verify localStorage is updated with the loaded guild
    const stored = localStorage.getItem("current-guild");
    expect(stored).toBeTruthy();

    const parsedStored = JSON.parse(stored!);
    expect(parsedStored.id).toBe(guild2.id);

    // Session 2: Verify loaded guild persists
    clearAdapter();
    const pinia2 = createPinia();
    setActivePinia(pinia2);
    const newGuildStore = useGuildStore();

    await new Promise((resolve) => setTimeout(resolve, 500));

    expect(newGuildStore.currentGuild?.id).toBe(guild2.id);
  });
});
