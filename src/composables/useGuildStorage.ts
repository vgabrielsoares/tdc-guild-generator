import { ref, watch } from "vue";
import type { Ref } from "vue";
import { useStorageAdapter } from "@/composables/useStorageAdapter";
import type { Guild } from "@/types/guild";
import { createGuild } from "@/types/guild";

interface GuildStorageState {
  currentGuild: Guild | null;
  guildHistory: Guild[];
  lastConfig: unknown | null;
}

const LEGACY_KEY = "guild-store"; // legacy settings key
const CURRENT_GUILD_KEY = "guild-current-id";
const LAST_CONFIG_KEY = "guild-last-config";

export function useGuildStorage(): {
  data: Ref<GuildStorageState>;
  load: () => Promise<void>;
  reset: () => Promise<void>;
} {
  const adapter = useStorageAdapter();

  const data = ref<GuildStorageState>({
    currentGuild: null,
    guildHistory: [],
    lastConfig: null,
  });

  let initializing = true;

  async function migrateLegacyIfNeeded() {
    try {
      const legacy = await adapter.get<Record<string, unknown> | null>(
        "settings",
        LEGACY_KEY
      );
      if (legacy && typeof legacy === "object") {
        const guildsRaw = (legacy.guildHistory || []) as unknown[];
        const guilds: Guild[] = [];
        for (const g of guildsRaw) {
          try {
            const parsed = createGuild(g as unknown);
            guilds.push(parsed);
          } catch (e) {
            // skip invalid legacy entry
          }
        }
        // save each guild into guilds store
        for (const g of guilds) {
          try {
            const createdAt = g.createdAt ? new Date(g.createdAt) : new Date();
            const updatedAt = g.updatedAt ? new Date(g.updatedAt) : undefined;
            await adapter.put("guilds", g.id, {
              value: g,
              createdAt,
              updatedAt,
            });
          } catch (e) {
            // ignore per-entry errors
            // eslint-disable-next-line no-console
            console.warn("guild migration entry failed", e);
          }
        }

        // migrate currentGuild id
        if (
          legacy.currentGuild &&
          typeof legacy.currentGuild === "object" &&
          "id" in legacy.currentGuild &&
          typeof (legacy.currentGuild as Record<string, unknown>).id ===
            "string"
        ) {
          await adapter.put(
            "settings",
            CURRENT_GUILD_KEY,
            (legacy.currentGuild as Record<string, unknown>).id as string
          );
        }

        // migrate lastConfig if exists
        if (legacy.lastConfig) {
          await adapter.put("settings", LAST_CONFIG_KEY, legacy.lastConfig);
        }

        // remove legacy key
        try {
          await adapter.del("settings", LEGACY_KEY);
        } catch (e) {
          // ignore
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("legacy migration failed", e);
    }
  }

  async function load() {
    // ensure any legacy data is migrated first
    await migrateLegacyIfNeeded();

    try {
      // load all guilds from 'guilds' store
      const rows = await adapter.list<Record<string, unknown>>("guilds");
      // adapter may return records shaped as { id, value, createdAt, updatedAt } or raw Guilds
      const guilds: Guild[] = [];
      for (const r of rows) {
        if (!r) continue;
        const rec = r as Record<string, unknown>;
        let candidate: unknown = null;
        if (rec.value && typeof rec.value === "object") candidate = rec.value;
        else candidate = rec;

        try {
          const parsed = createGuild(candidate as unknown);
          guilds.push(parsed);
        } catch (e) {
          // skip invalid
        }
      }

      // sort by createdAt desc if available
      guilds.sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da;
      });

      // Merge with any in-memory entries that may have been added before async load completed
      // Prefer in-memory entries (they are likely newer creations during startup/tests)
      try {
        const inMemory = data.value.guildHistory || [];
        const mergedMap = new Map<string, Guild>();
        // first add loaded ones
        for (const g of guilds) mergedMap.set(g.id, g);
        // then overwrite/add with any in-memory ones
        for (const g of inMemory) mergedMap.set(g.id, g);
        const merged = Array.from(mergedMap.values());
        // sort again
        merged.sort((a, b) => {
          const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return db - da;
        });
        data.value.guildHistory = merged;
      } catch (e) {
        data.value.guildHistory = guilds;
      }

      // load current guild id from settings and fetch
      const currentId = await adapter.get<string>(
        "settings",
        CURRENT_GUILD_KEY
      );
      let localBackupExists = false;
      try {
        localBackupExists = localStorage.getItem("current-guild") !== null;
      } catch (e) {
        localBackupExists = false;
      }

      if (currentId && localBackupExists) {
        // First, try to restore from the in-memory/merged guildHistory
        try {
          const found = (data.value.guildHistory || []).find(
            (g) => g.id === currentId
          );
          if (found && !data.value.currentGuild) {
            data.value.currentGuild = createGuild(found as unknown);
          }
        } catch {
          // ignore and continue to try adapter.get below
        }

        // If we still don't have the currentGuild, try fetching the guild row directly
        // from the adapter (preferred when available).
        if (!data.value.currentGuild) {
          const g = await adapter.get<Record<string, unknown> | Guild | null>(
            "guilds",
            currentId
          );
          if (g) {
            try {
              // If a currentGuild was set in-memory by another store (e.g. timeline)
              // during startup, prefer the in-memory value and do not overwrite it.
              if (!data.value.currentGuild) {
                data.value.currentGuild = createGuild(g as unknown);
              }
            } catch (_) {
              // fallback: try extract .value
              try {
                const rec = g as Record<string, unknown>;
                if (rec.value) {
                  if (!data.value.currentGuild) {
                    data.value.currentGuild = createGuild(rec.value as unknown);
                  }
                }
              } catch (err) {
                // ignore
              }
            }
          }
        }
      }

      // lastConfig
      const last = await adapter.get<Record<string, unknown> | null>(
        "settings",
        LAST_CONFIG_KEY
      );
      // prefer existing in-memory lastConfig if present
      if (last && !data.value.lastConfig) data.value.lastConfig = last;
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("useGuildStorage.load failed", e);
    } finally {
      initializing = false;
    }
  }

  // Watchers to persist changes to underlying storage
  let saveTimer: ReturnType<typeof setTimeout> | null = null;

  watch(
    () => data.value.guildHistory,
    (newVal) => {
      // Immediate write of incoming/updated guilds so consumers/tests see persistence effects synchronously.
      // cleanup of deleted rows is debounced to avoid excessive delete churn.
      if (saveTimer) clearTimeout(saveTimer);
      void (async () => {
        for (const g of newVal) {
          try {
            await adapter.put("guilds", g.id, {
              value: g,
              createdAt: g.createdAt ?? new Date(),
              updatedAt: g.updatedAt ?? new Date(),
            });
          } catch (e) {
            // eslint-disable-next-line no-console
            console.warn("failed to persist guild", g.id, e);
          }
        }
        // Also persist a legacy snapshot for compatibility/tests
        try {
          await adapter.put("settings", LEGACY_KEY, {
            currentGuild: data.value.currentGuild,
            guildHistory: data.value.guildHistory,
            lastConfig: data.value.lastConfig,
          });
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn("failed to persist legacy guild-store snapshot", e);
        }
      })();

      // schedule cleanup (delete removed entries) after debounce
      // If still initializing, skip running the cleanup step until initialization completes to avoid deleting rows while a load is in progress.
      if (initializing) {
        // simply reset any existing timer but don't schedule deletion now
        saveTimer = null;
        return;
      }

      saveTimer = setTimeout(async () => {
        try {
          const existing =
            await adapter.list<Record<string, unknown>>("guilds");
          const existingIds = new Set<string>();
          for (const r of existing) {
            if (!r) continue;
            const rec = r as Record<string, unknown>;
            if (typeof rec.id === "string") existingIds.add(rec.id as string);
            else if (
              rec.value &&
              typeof (rec.value as Record<string, unknown>).id === "string"
            )
              existingIds.add(
                (rec.value as Record<string, unknown>).id as string
              );
          }

          const incomingIds = new Set(newVal.map((g) => g.id));

          for (const id of existingIds) {
            if (!incomingIds.has(id as string)) {
              try {
                await adapter.del("guilds", id as string);
              } catch (e) {
                // eslint-disable-next-line no-console
                console.warn("failed to delete guild during sync", id, e);
              }
            }
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn("guildHistory sync failed", e);
        }
        saveTimer = null;
      }, 200);
    },
    { deep: true }
  );

  watch(
    () => data.value.currentGuild,
    (newVal) => {
      // persist current guild id to settings
      void (async () => {
        try {
          if (newVal && newVal.id) {
            await adapter.put("settings", CURRENT_GUILD_KEY, newVal.id);
          } else {
            await adapter.del("settings", CURRENT_GUILD_KEY);
          }
        } catch (e) {
          // eslint-disable-next-line no-console
          console.warn("failed to persist currentGuild id", e);
        }
      })();
    },
    { deep: false }
  );

  async function reset() {
    data.value = { currentGuild: null, guildHistory: [], lastConfig: null };
    try {
      // clear settings keys
      await adapter.del("settings", CURRENT_GUILD_KEY);
      await adapter.del("settings", LAST_CONFIG_KEY);
      // delete all guild entries
      const existing = await adapter.list<Record<string, unknown>>("guilds");
      for (const r of existing) {
        if (!r) continue;
        const rec = r as Record<string, unknown>;
        const id =
          typeof rec.id === "string"
            ? (rec.id as string)
            : typeof rec.value === "object" &&
                typeof (rec.value as Record<string, unknown>).id === "string"
              ? ((rec.value as Record<string, unknown>).id as string)
              : null;
        if (id) await adapter.del("guilds", id);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("useGuildStorage.reset failed", e);
    }
  }

  // initial async load
  void load();

  return { data, load, reset };
}
