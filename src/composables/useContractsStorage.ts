import { ref, watch } from "vue";
import type { Ref } from "vue";
import { useStorageAdapter } from "@/composables/useStorageAdapter";
import { serializeData, deserializeData } from "@/utils/storage";
import type { Contract, GuildContracts } from "@/types/contract";
import {
  ContractSchema,
  ContractStatus,
  ContractDifficulty,
  ContractorType,
  PaymentType,
} from "@/types/contract";
import { DBContractSchema } from "@/utils/database-schema";

// Helper para gerar IDs
function generateId(): string {
  return `contract_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

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

  // helper: extrair com segurança guildId de uma linha do DB ou wrapper legado
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

  // helper: extrair com segurança o id de uma linha do DB ou wrapper legado
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

  // carregar todas as entradas de contratos da store 'contracts' e montar no formato esperado
  async function load() {
    try {
      const rows = await adapter.list<Record<string, unknown>>("contracts");

      // as linhas são registros salvos com o campo guildId ou entradas genéricas de contrato
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

        // Converter para Record para facilitar o processamento
        const rowData = r as Record<string, unknown>;
        let processed = false;

        // Tentar interpretar como DBContractSchema primeiro
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
          if (contractParse.success) {
            grouped[gid].contracts.push(contractParse.data as Contract);
          } else {
            // Tentar recuperar contrato com dados mínimos
            try {
              const safeNewDate = (val: unknown): Date => {
                if (!val) return new Date();
                if (val instanceof Date) return val;
                if (typeof val === "string" || typeof val === "number")
                  return new Date(val);
                return new Date();
              };

              // Primeiro, tentar converter apenas as datas problemáticas
              const contractWithFixedDates = {
                ...rec.value,
                createdAt: safeNewDate(rec.value.createdAt),
                expiresAt: rec.value.expiresAt
                  ? safeNewDate(rec.value.expiresAt)
                  : undefined,
                completedAt: rec.value.completedAt
                  ? safeNewDate(rec.value.completedAt)
                  : undefined,
              };

              // Tentar validar novamente com datas corrigidas
              const dateFixedParse = ContractSchema.safeParse(
                contractWithFixedDates
              );
              if (dateFixedParse.success) {
                grouped[gid].contracts.push(dateFixedParse.data as Contract);
                continue; // Pular para o próximo contrato
              }

              // Se ainda falhar, usar fallback com dados mínimos
              const minimalContract = {
                id: rec.value.id || generateId(),
                title: rec.value.title || "Contrato recuperado",
                description: rec.value.description || "Descrição recuperada",
                status: rec.value.status || ContractStatus.DISPONIVEL,
                difficulty: rec.value.difficulty || ContractDifficulty.FACIL,
                contractorType: rec.value.contractorType || ContractorType.POVO,
                prerequisites: rec.value.prerequisites || [],
                clauses: rec.value.clauses || [],
                complications: rec.value.complications || [],
                twists: rec.value.twists || [],
                allies: rec.value.allies || [],
                severeConsequences: rec.value.severeConsequences || [],
                paymentType: rec.value.paymentType || PaymentType.TOTAL_GUILDA,
                value: rec.value.value || {
                  baseValue: 0,
                  experienceValue: 0,
                  rewardValue: 0,
                  finalGoldReward: 0,
                  modifiers: {},
                },
                deadline: rec.value.deadline || {
                  type: "days",
                  value: 30,
                  description: "30 dias",
                },
                antagonist: rec.value.antagonist || {
                  category: "ORGANIZACAO",
                  type: "COMERCIANTE",
                  name: "Antagonista desconhecido",
                  description: "Descrição não disponível",
                },
                generationData: rec.value.generationData || {
                  settlementType: "cidade",
                  timestamp: new Date(),
                  version: "1.0.0",
                },
                createdAt: safeNewDate(rec.value.createdAt),
                expiresAt: rec.value.expiresAt
                  ? safeNewDate(rec.value.expiresAt)
                  : undefined,
                completedAt: rec.value.completedAt
                  ? safeNewDate(rec.value.completedAt)
                  : undefined,
                ...rec.value,
              };

              const recoveredParse = ContractSchema.safeParse(minimalContract);
              if (recoveredParse.success) {
                grouped[gid].contracts.push(recoveredParse.data as Contract);
              } else {
                // Como último recurso, adicionar sem validação
                grouped[gid].contracts.push(rec.value as unknown as Contract);
              }
            } catch (recoveryError) {
              // Como último recurso, tentar criar contrato básico apenas com campos essenciais
              const contractId =
                rec.value.id && typeof rec.value.id === "string"
                  ? rec.value.id
                  : generateId();

              try {
                const basicContract = {
                  id: contractId,
                  title: "Contrato recuperado (dados parciais)",
                  description:
                    "Contrato recuperado com dados mínimos devido a problemas de validação",
                  status: ContractStatus.DISPONIVEL,
                  difficulty: ContractDifficulty.FACIL,
                  contractorType: ContractorType.POVO,
                  prerequisites: [],
                  clauses: [],
                  complications: [],
                  twists: [],
                  allies: [],
                  severeConsequences: [],
                  paymentType: PaymentType.TOTAL_GUILDA,
                  value: {
                    baseValue: 0,
                    experienceValue: 0,
                    rewardValue: 0,
                    finalGoldReward: 0,
                    modifiers: {},
                  },
                  deadline: { type: "days", value: 30, description: "30 dias" },
                  antagonist: {
                    category: "ORGANIZACAO",
                    type: "COMERCIANTE",
                    name: "Antagonista desconhecido",
                    description: "Descrição não disponível",
                  },
                  generationData: {
                    settlementType: "cidade",
                    timestamp: new Date(),
                    version: "1.0.0",
                  },
                  createdAt: new Date(),
                } as unknown as Contract;

                grouped[gid].contracts.push(basicContract);
                if (import.meta.env.DEV) {
                  // eslint-disable-next-line no-console
                  console.log(
                    `[CONTRACTS_STORAGE] Created basic contract as fallback for ${contractId}`
                  );
                }
              } catch (basicError) {
                if (import.meta.env.DEV) {
                  // eslint-disable-next-line no-console
                  console.error(
                    `[CONTRACTS_STORAGE] Even basic contract creation failed:`,
                    basicError
                  );
                  // eslint-disable-next-line no-console
                  console.log(
                    `[CONTRACTS_STORAGE] Skipping contract ${contractId} entirely`
                  );
                }
              }
            }
          }
          processed = true;
        } else {
          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.warn(
              `[CONTRACTS_STORAGE] DB schema validation failed for id=${getIdFromRow(rowData) ?? "unknown"} guild=${getGuildIdFromRow(rowData) ?? "unknown"}`,
              dbParse.error
            );
          }
        }

        // Se ainda não processado, tentar interpretações de fallback
        if (!processed) {
          // Fallback: tentar interpretar como dados brutos de contrato
          if (rowData && rowData.id && rowData.guildId) {
            const gid = String(rowData.guildId);

            grouped[gid] = grouped[gid] || {
              guildId: gid,
              contracts: [],
              lastUpdate: null,
              generationCount: 0,
            };

            // Tentar usar o campo 'value' ou o próprio registro como contrato
            const contractData = rowData.value || rowData;
            const contractParse = ContractSchema.safeParse(contractData);
            if (contractParse.success) {
              grouped[gid].contracts.push(contractParse.data as Contract);
            } else {
              // aviso conciso para que desenvolvedores saibam qual contrato falhou
              if (import.meta.env.DEV) {
                // eslint-disable-next-line no-console
                console.warn(
                  `[CONTRACTS_STORAGE] Fallback parsing failed for contract id=${String(rowData.id)} guild=${gid}`,
                  contractParse.error
                );
              }
              // Último recurso: adicionar como está
              grouped[gid].contracts.push(contractData as unknown as Contract);
            }
            processed = true;
          }

          // Fallback: formato legado onde a entrada encapsula um contrato em `value` e value.guildId existe
          if (
            !processed &&
            rowData &&
            rowData.value &&
            typeof rowData.value === "object" &&
            (rowData.value as Record<string, unknown>).guildId
          ) {
            const g = String(
              (rowData.value as Record<string, unknown>).guildId
            );
            grouped[g] = grouped[g] || {
              guildId: g,
              contracts: [],
              lastUpdate: null,
              generationCount: 0,
            };
            const contractParse = ContractSchema.safeParse(
              rowData.value as unknown
            );
            if (contractParse.success) {
              grouped[g].contracts.push(contractParse.data as Contract);
            } else {
              // aviso conciso de fallback
              if (import.meta.env.DEV) {
                // eslint-disable-next-line no-console
                console.warn(
                  `[CONTRACTS_STORAGE] Legacy wrapper parsing failed for guild=${g} id=${getIdFromRow(rowData) ?? "unknown"}`,
                  contractParse.error
                );
              }
              grouped[g].contracts.push(rowData.value as unknown as Contract);
            }
            processed = true;
          }
        }

        // Não foi possível interpretar esta entrada, pular
        if (!processed) {
          if (import.meta.env.DEV) {
            // eslint-disable-next-line no-console
            console.warn(
              `[CONTRACTS_STORAGE] Could not interpret row, skipping id=${getIdFromRow(rowData) ?? "unknown"} guild=${getGuildIdFromRow(rowData) ?? "unknown"}`
            );
          }
        }
      }

      // converter para o formato GuildContracts
      const guildContracts: Record<string, GuildContracts> = {};

      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.log(
          `[CONTRACTS_STORAGE] Converting grouped data: ${Object.keys(grouped).length} guilds`
        );
      }

      for (const k of Object.keys(grouped)) {
        const contractCount = grouped[k].contracts.length;

        guildContracts[k] = {
          guildId: grouped[k].guildId,
          contracts: grouped[k].contracts,
          lastUpdate: grouped[k].lastUpdate ?? new Date(),
          generationCount:
            grouped[k].generationCount ?? (contractCount > 0 ? 1 : 0),
        };

        if (import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.log(
            `[CONTRACTS_STORAGE] Converted guild ${k}: ${contractCount} contracts`
          );
        }
      }

      data.value.guildContracts = guildContracts;

      if (import.meta.env.DEV) {
        const totalGuilds = Object.keys(guildContracts).length;
        const totalContracts = Object.values(guildContracts).reduce(
          (sum, g) => sum + (g.contracts?.length || 0),
          0
        );
        // eslint-disable-next-line no-console
        console.log(
          `[CONTRACTS_STORAGE] Loaded ${totalContracts} contracts for ${totalGuilds} guilds`
        );
      }

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
  // Para evitar problemas de persistência assíncrona, usamos debounce e persistence forçada
  let persistTimeout: ReturnType<typeof setTimeout> | null = null;

  watch(
    () => data.value.guildContracts,
    (newVal) => {
      // Limpar timeout anterior se existir
      if (persistTimeout) {
        clearTimeout(persistTimeout);
      }

      // Criar novo timeout com delay menor para evitar perda de dados
      persistTimeout = setTimeout(() => {
        void (async () => {
          try {
            for (const gid of Object.keys(newVal)) {
              const entry = newVal[gid] as GuildContracts | undefined;
              if (!entry) continue;

              // Persistir contratos em batch para melhor performance
              const batchPromises: Promise<void>[] = [];

              for (const c of entry.contracts) {
                const promise = (async () => {
                  try {
                    const plain = deserializeData<Record<string, unknown>>(
                      serializeData(c)
                    );

                    const recordToSave = {
                      id: c.id,
                      guildId: gid,
                      value: plain,
                      status: c.status,
                      createdAt: (c as Contract).createdAt ?? new Date(),
                    };

                    // Persistindo contrato (detalhes omitidos em logs para reduzir verbosidade)

                    await adapter.put("contracts", c.id, recordToSave);
                  } catch (e) {
                    // eslint-disable-next-line no-console
                    console.warn("failed to persist contract", c.id, e);
                  }
                })();

                batchPromises.push(promise);
              }

              // Aguardar todas as persistências do guild atual
              await Promise.all(batchPromises);
              // Em DEV, reportar quantos contratos foram persistidos neste batch
              if (import.meta.env.DEV) {
                // eslint-disable-next-line no-console
                console.log(
                  `[CONTRACTS_STORAGE] Persisted ${entry.contracts.length} contracts for guild ${gid}`
                );
              }
            }

            // Persistir snapshot para recuperação rápida
            await adapter.put("settings", "contracts-store-v2", {
              guildContracts: data.value.guildContracts,
              currentGuildId: data.value.currentGuildId,
              globalLastUpdate: data.value.globalLastUpdate,
            });
          } catch (e) {
            // eslint-disable-next-line no-console
            console.warn("useContractsStorage.persist failed", e);
          }
        })();
      }, 100); // Timeout mais curto (100ms) para persistência mais rápida
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
