import {
  installFakeIndexedDB,
  uninstallFakeIndexedDB,
} from "./utils/fakeIndexedDB";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { createTestGuild } from "@/tests/utils/test-helpers";

beforeEach(() => installFakeIndexedDB());
afterEach(() => uninstallFakeIndexedDB());
import {
  DB_STORES,
  DBGuildSchema,
  DBContractSchema,
  DBServiceSchema,
} from "@/utils/database-schema";

describe("Database Schema and Zod validations - Issue 6.2", () => {
  it("defines expected stores", () => {
    const names = DB_STORES.map((s) => s.name).sort();
    expect(names).toEqual(
      ["contracts", "guilds", "services", "settings", "timeline"].sort()
    );
  });

  it("validates sample guild, contract and service entries", () => {
    const guild = createTestGuild({ id: "g1", name: "G1" });
    const sampleGuild = {
      id: "g1",
      value: guild,
      createdAt: new Date(),
    };
    expect(() => DBGuildSchema.parse(sampleGuild)).not.toThrow();

    const sampleContract = {
      id: "c1",
      guildId: "g1",
      value: { title: "T" },
      status: "AVAILABLE",
      createdAt: new Date(),
    };
    expect(() => DBContractSchema.parse(sampleContract)).not.toThrow();

    const sampleService = {
      id: "s1",
      guildId: "g1",
      value: { title: "S" },
      status: "OPEN",
      createdAt: new Date(),
    };
    expect(() => DBServiceSchema.parse(sampleService)).not.toThrow();
  });
});
