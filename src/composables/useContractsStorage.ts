import { ref, watch } from "vue";
import type { Ref } from "vue";
import { useStorageAdapter } from "@/composables/useStorageAdapter";
import { serializeData, deserializeData } from "@/utils/storage";
import type { Contract, GuildContracts } from "@/types/contract";
import { ContractSchema } from "@/types/contract";
import { DBContractSchema } from "@/utils/database-schema";

export interface ContractsStorageState {
  guildContracts: Record<
    string,
    {
      guildId: string;
      contracts: Contract[];
      lastUpdate: Date | null;
      generationCount: number;
    }
  >;
  currentGuildId: string | null;
  globalLastUpdate: Date | null;
}

const DEFAULT: ContractsStorageState = {
  guildContracts: {},
  currentGuildId: null,
  globalLastUpdate: null,
};

/**
 * Composable responsável por persistir contratos no store `contracts` do adapter (IndexedDB quando disponível).
 * Também fornece uma migração do formato legacy salvo em `settings:contracts-store-v2`.
 */
export function useContractsStorage() {
  const adapter = useStorageAdapter();
  const data: Ref<ContractsStorageState> = ref<ContractsStorageState>({
    ...DEFAULT,
  });

  // helper: safely extract guildId from a DB row or legacy wrapper
  function getGuildIdFromRow(
    row: Record<string, unknown> | undefined | null
  ): string | null {
    if (!row) return null;
    const maybe = row["guildId"];
    if (typeof maybe === "string" && maybe) return maybe;
    const val = row["value"];
    if (val && typeof val === "object") {
      const v = val as Record<string, unknown>;
      const gid = v["guildId"];
      if (typeof gid === "string" && gid) return gid;
    }
    return null;
  }

  // helper: safely extract id from a DB row or legacy wrapper
  function getIdFromRow(
    row: Record<string, unknown> | undefined | null
  ): string | undefined {
    if (!row) return undefined;
    const maybe = row["id"];
    if (typeof maybe === "string") return maybe;
    const val = row["value"];
    if (val && typeof val === "object") {
      const v = val as Record<string, unknown>;
      const id = v["id"];
      if (typeof id === "string") return id;
    }
    return undefined;
  }

  // load all guild contract entries from 'contracts' store and assemble into the expected shape
  async function load() {
    try {
      const rows = await adapter.list<Record<string, unknown>>("contracts");
      // rows are records saved with guildId field or generic contract entries
      const grouped: Record<
        string,
        {
          guildId: string;
          contracts: Contract[];
          lastUpdate: Date | null;
          generationCount: number;
        }
      > = {};

      for (const r of rows) {
        if (!r) continue;
        // Try to interpret as DBContractSchema first
        const dbParse = DBContractSchema.safeParse(r);
        if (dbParse.success) {
          const rec = dbParse.data;
          const gid = rec.guildId;
          grouped[gid] = grouped[gid] || {
            guildId: gid,
            contracts: [],
            lastUpdate: null,
            generationCount: 0,
          };
          const contractParse = ContractSchema.safeParse(rec.value);
          if (contractParse.success)
            grouped[gid].contracts.push(contractParse.data as Contract);
          else grouped[gid].contracts.push(rec.value as unknown as Contract);
          continue;
        }

        // Fallback: legacy shape where an entry wraps a contract in `value` and value.guildId exists
        const recAny = r as Record<string, unknown>;
        if (
          recAny &&
          recAny.value &&
          typeof recAny.value === "object" &&
          (recAny.value as Record<string, unknown>).guildId
        ) {
          const g = String((recAny.value as Record<string, unknown>).guildId);
          grouped[g] = grouped[g] || {
            guildId: g,
            contracts: [],
            lastUpdate: null,
            generationCount: 0,
          };
          const contractParse = ContractSchema.safeParse(
            recAny.value as unknown
          );
          if (contractParse.success)
            grouped[g].contracts.push(contractParse.data as Contract);
          else grouped[g].contracts.push(recAny.value as unknown as Contract);
          continue;
        }

        // Could not interpret this row, skip
        continue;
      }

      // convert to guildContracts shape
      const guildContracts: Record<string, GuildContracts> = {};
      for (const k of Object.keys(grouped)) {
        guildContracts[k] = {
          guildId: grouped[k].guildId,
          contracts: grouped[k].contracts,
          lastUpdate: grouped[k].lastUpdate ?? new Date(),
          generationCount:
            grouped[k].generationCount ??
            (grouped[k].contracts.length > 0 ? 1 : 0),
        };
      }

      data.value.guildContracts = guildContracts;

      // If no rows were found in the 'contracts' store, try to recover from a
      // persisted snapshot in settings (robustness for older clients / partial writes)
      if (Object.keys(guildContracts).length === 0) {
        try {
          const snapshot = await adapter.get<Record<string, unknown> | null>(
            "settings",
            "contracts-store-v2"
          );
          if (snapshot && typeof snapshot === "object") {
            const maybeGuilds = (snapshot as Record<string, unknown>)
              .guildContracts as Record<string, unknown> | undefined;
            if (maybeGuilds) {
              const recovered: Record<string, GuildContracts> = {};
              for (const gid of Object.keys(maybeGuilds)) {
                try {
                  const entry = maybeGuilds[gid] as unknown as Record<
                    string,
                    unknown
                  >;
                  recovered[gid] = {
                    guildId: gid,
                    contracts: (entry.contracts || []) as Contract[],
                    lastUpdate: entry.lastUpdate
                      ? new Date(String(entry.lastUpdate))
                      : new Date(),
                    generationCount:
                      typeof entry.generationCount === "number"
                        ? (entry.generationCount as number)
                        : entry.contracts &&
                            Array.isArray(entry.contracts) &&
                            (entry.contracts as unknown[]).length > 0
                          ? 1
                          : 0,
                  };
                } catch {
                  // skip malformed
                }
              }
              if (Object.keys(recovered).length > 0)
                data.value.guildContracts = recovered;
            }
            const cur = (snapshot as Record<string, unknown>).currentGuildId as
              | string
              | undefined;
            if (cur) data.value.currentGuildId = cur;
          }
        } catch (e) {
          // ignore
        }
      }
      // load currentGuildId from settings store (backward compatibility)
      try {
        const cur = await adapter.get<string | null>(
          "settings",
          "contracts-store-v2-currentGuildId"
        );
        if (cur) data.value.currentGuildId = cur;
      } catch (e) {
        // ignore
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("useContractsStorage.load failed", e);
    }
  }

  // Migrate legacy settings-based storage (contracts-store-v2) into proper contracts store
  async function migrateLegacyIfNeeded() {
    try {
      const legacy = await adapter.get<Record<string, unknown> | null>(
        "settings",
        "contracts-store-v2"
      );
      if (!legacy || typeof legacy !== "object") return;

      // legacy.guildContracts expected to be an object keyed by guildId
      const guilds = ((legacy as Record<string, unknown>).guildContracts ??
        {}) as Record<string, unknown>;
      for (const gid of Object.keys(guilds)) {
        const payload = guilds[gid] as Record<string, unknown> | undefined;
        // payload should be GuildContracts-like
        const contractsArr: Contract[] =
          (payload && (payload.contracts as Contract[])) ?? [];
        for (const c of contractsArr) {
          try {
            // Save each contract into the 'contracts' store using contract id
            await adapter.put("contracts", c.id, {
              id: c.id,
              guildId: gid,
              value: c,
              status: c.status,
              createdAt: c.createdAt ?? new Date(),
            });
          } catch (e) {
            // eslint-disable-next-line no-console
            console.warn("contract migration entry failed", e);
          }
        }
      }

      // After migrating, remove legacy key
      try {
        await adapter.del("settings", "contracts-store-v2");
      } catch (e) {
        // ignore
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("legacy contracts migration failed", e);
    }
  }

  // Persist helpers: when a guildContracts entry is updated we save each contract individually
  watch(
    () => data.value.guildContracts,
    (newVal) => {
      void (async () => {
        for (const gid of Object.keys(newVal)) {
          const entry = newVal[gid] as GuildContracts | undefined;
          if (!entry) continue;
          try {
            // ensure each contract is stored in 'contracts' store
            for (const c of entry.contracts) {
              try {
                // Clone contract into a plain object to avoid storing Vue proxies/reactive internals
                const plain = deserializeData<Record<string, unknown>>(
                  serializeData(c)
                );
                await adapter.put("contracts", c.id, {
                  id: c.id,
                  guildId: gid,
                  value: plain,
                  status: c.status,
                  createdAt: (c as Contract).createdAt ?? new Date(),
                });
              } catch (e) {
                // eslint-disable-next-line no-console
                console.warn("failed to persist contract", c.id, e);
              }
            }
          } catch (e) {
            // eslint-disable-next-line no-console
            console.warn("useContractsStorage.persist failed", e);
          }
        }
      })();
    },
    { deep: true }
  );

  // delete helper: delete all contract records for a guild
  async function deleteGuildContracts(guildId: string) {
    try {
      const rows = await adapter.list<Record<string, unknown>>("contracts");
      for (const r of rows) {
        const rec = r as Record<string, unknown>;
        const gid = getGuildIdFromRow(rec);
        if (gid === guildId) {
          try {
            const id = getIdFromRow(rec);
            if (id) await adapter.del("contracts", id);
          } catch (e) {
            // ignore per-entry
          }
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("deleteGuildContracts failed", e);
    }
  }

  // Persist a single guild's contracts immediately and return when done
  async function persistGuildContracts(guildId: string) {
    try {
      const entry = data.value.guildContracts[guildId];
      if (!entry) return;
      for (const c of entry.contracts) {
        try {
          const plain = deserializeData<Record<string, unknown>>(
            serializeData(c)
          );
          await adapter.put("contracts", c.id, {
            id: c.id,
            guildId: guildId,
            value: plain,
            status: c.status,
            createdAt: (c as Contract).createdAt ?? new Date(),
          });
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn(
            "failed to persist contract (persistGuildContracts)",
            c.id,
            e
          );
        }
      }
      // Also persist a snapshot for quick recovery (legacy compatibility / robust reload)
      try {
        await adapter.put("settings", "contracts-store-v2", {
          guildContracts: data.value.guildContracts,
          currentGuildId: data.value.currentGuildId,
          globalLastUpdate: data.value.globalLastUpdate,
        });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("failed to persist contracts snapshot", e);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("persistGuildContracts failed", e);
    }
  }

  // reset: clear all contracts (used by tests)
  async function reset() {
    data.value = { ...DEFAULT };
    try {
      const rows = await adapter.list<Record<string, unknown>>("contracts");
      for (const r of rows) {
        try {
          const id = getIdFromRow(r as Record<string, unknown>) as
            | string
            | undefined;
          if (id) await adapter.del("contracts", id);
        } catch (_) {
          // ignore
        }
      }
      await adapter.del("settings", "contracts-store-v2");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("useContractsStorage.reset failed", e);
    }
  }

  // expose API
  return {
    data,
    load,
    reset,
    migrateLegacyIfNeeded,
    deleteGuildContracts,
    persistGuildContracts,
  };
}
