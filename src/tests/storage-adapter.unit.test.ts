import {
  installFakeIndexedDB,
  uninstallFakeIndexedDB,
} from "./utils/fakeIndexedDB";
import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { clearAdapter } from "@/utils/storage-adapter-resolver";
import { getAdapter } from "@/utils/storage-adapter-resolver";

describe("Storage Adapter Resolver and IndexedDB Adapter - Issue 6.1", () => {
  beforeEach(async () => {
    installFakeIndexedDB();
    // ensure fresh adapter resolution between tests
    // adapter resolver keeps module-level cache; require again is not trivial here,
    // but calling basic operations is sufficient to validate behavior.
  });

  afterEach(() => {
    // uninstall shim synchronously so other tests relying on localStorage aren't affected
    try {
      uninstallFakeIndexedDB();
    } catch (e) {
      // ignore
    }
    // clear cached adapter so other tests resolve correctly
    try {
      clearAdapter();
    } catch (e) {
      // ignore
    }
  });

  it("resolves to an available adapter and performs put/get/del/list", async () => {
    const adapter = getAdapter();
    expect(adapter).toBeDefined();
    expect(typeof adapter.isAvailable).toBe("function");
    expect(adapter.isAvailable()).toBe(true);

    // Use store 'settings' which is part of schema
    await adapter.put("settings", "sa-test-key", {
      hello: "world",
      createdAt: new Date(),
    });
    const got = await adapter.get("settings", "sa-test-key");
    expect(got).toBeTruthy();
    // cleanup
    await adapter.del("settings", "sa-test-key");

    // list should return an array (may be empty)
    const list = await adapter.list("settings");
    expect(Array.isArray(list)).toBe(true);
  });
});
