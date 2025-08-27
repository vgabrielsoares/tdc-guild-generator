import { describe, it, expect, beforeEach, vi } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useContractsStore } from "@/stores/contracts";
import { useGuildStore } from "@/stores/guild";
import * as dice from "@/utils/dice";
import { createTestGuild } from "../utils/test-helpers";

// Integration test: generate contracts, persist, clear in-memory and reload from adapter

describe("Contracts persistence integration", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    // Mock dice/table utilities to make generation deterministic for the integration test
    const mockRollDice = vi
      .spyOn(dice, "rollDice")
      .mockImplementation(({ notation }: { notation: string }) => {
        if (notation === "1d20") {
          return {
            result: 10,
            notation,
            individual: [10],
            modifier: 0,
            timestamp: new Date(),
          };
        }
        if (notation === "1d6+1") {
          return {
            result: 4,
            notation,
            individual: [3],
            modifier: 1,
            timestamp: new Date(),
          };
        }
        if (notation === "1d4") {
          return {
            result: 2,
            notation,
            individual: [2],
            modifier: 0,
            timestamp: new Date(),
          };
        }
        if (notation === "1d100") {
          return {
            result: 50,
            notation,
            individual: [50],
            modifier: 0,
            timestamp: new Date(),
          };
        }
        if (notation === "1d6") {
          return {
            result: 3,
            notation,
            individual: [3],
            modifier: 0,
            timestamp: new Date(),
          };
        }
        return {
          result: 1,
          notation,
          individual: [1],
          modifier: 0,
          timestamp: new Date(),
        };
      });

    const mockRollOnTable = vi
      .spyOn(dice, "rollOnTable")
      .mockImplementation(() => ({
        roll: {
          result: 7,
          notation: "1d20",
          individual: [7],
          modifier: 0,
          timestamp: new Date(),
        },
        result: "1 semana",
        tableEntry: { min: 7, max: 8, result: "1 semana" },
      }));
  });

  it("should persist generated contracts and restore after load", async () => {
    const guildStore = useGuildStore();
    const contractsStore = useContractsStore();

    // create a test guild and set as current (use helper to ensure valid shape)
    const testGuild = createTestGuild({
      id: "test-guild-persist",
      name: "Test Guild Persist",
    });

    // Use public API to add and set current guild to respect store reactivity
    guildStore.addToHistory(testGuild);
    guildStore.setCurrentGuild(testGuild);

    // initialize contracts store
    await contractsStore.initializeStore();

    // force timeline setup via generate path
    // use generateContracts to simulate user generation (deterministic due to mocks)
    await contractsStore.generateContracts();

    // ensure some contracts created
    expect(contractsStore.contracts.length).toBeGreaterThan(0);

    const before = contractsStore.contracts.length;

    // simulate app reload: clear in-memory store state
    // create a fresh instance of the contracts composable storage and store
    const freshContractsStore = useContractsStore();

    // manually clear underlying storage.data to simulate fresh runtime memory
    freshContractsStore.resetContracts();

    // now force load of persisted data
    await freshContractsStore.initializeStore();

    // after load, contracts should be restored for the persisted guild
    const after = freshContractsStore.contracts.length;
    expect(after).toBeGreaterThanOrEqual(before);
  });
});
