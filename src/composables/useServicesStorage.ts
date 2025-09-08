import { ref, readonly, watch } from "vue";
import type { Ref } from "vue";
import { useStorageAdapter } from "@/composables/useStorageAdapter";
import { deserializeData } from "@/utils/storage";
import type { Service, GuildServices } from "@/types/service";
import { ServiceSchema } from "@/types/service";
import { DBServiceSchema } from "@/utils/database-schema";

export interface ServicesStorageState {
  guildServices: Record<
    string,
    {
      guildId: string;
      services: Service[];
      lastUpdate: Date | null;
      generationCount: number;
    }
  >;
  currentGuildId: string | null;
  globalLastUpdate: Date | null;
}

const DEFAULT: ServicesStorageState = {
  guildServices: {},
  currentGuildId: null,
  globalLastUpdate: null,
};

/**
 * Composable responsável por persistir serviços no store `services` do adapter (IndexedDB quando disponível).
 * Também fornece uma migração do formato legacy salvo em `settings:services-store`.
 */
export function useServicesStorage() {
  const adapter = useStorageAdapter();
  const data: Ref<ServicesStorageState> = ref<ServicesStorageState>({
    ...DEFAULT,
  });

  /**
   * Carrega todos os serviços do IndexedDB/LocalStorage para memória.
   * Também realiza migração de dados legacy se necessário.
   */
  async function load(): Promise<void> {
    try {
      // 1. Carregar dados novos do store 'services'
      const rows = await adapter.list<Record<string, unknown>>("services");

      const guildServicesMap: Record<string, GuildServices> = {};

      for (const serviceRow of rows) {
        try {
          const dbParse = DBServiceSchema.safeParse(serviceRow);
          if (dbParse.success) {
            const rec = dbParse.data;
            const guildId = rec.guildId;

            if (!guildServicesMap[guildId]) {
              guildServicesMap[guildId] = {
                guildId,
                services: [],
                lastUpdate: null,
                generationCount: 0,
              };
            }

            const serviceParse = ServiceSchema.safeParse(rec.value);
            if (serviceParse.success) {
              guildServicesMap[guildId].services.push(serviceParse.data);

              if (rec.createdAt) {
                const createdDate = new Date(rec.createdAt);
                if (
                  !guildServicesMap[guildId].lastUpdate ||
                  createdDate > guildServicesMap[guildId].lastUpdate!
                ) {
                  guildServicesMap[guildId].lastUpdate = createdDate;
                }
              }
            }
          }
        } catch (parseError) {
          // eslint-disable-next-line no-console
          console.warn("Failed to parse service row:", parseError);
          continue;
        }
      }

      // 2. Tentar migrar dados legacy do formato antigo
      await migrateLegacyData(guildServicesMap);

      // 3. Atualizar estado reativo
      data.value.guildServices = guildServicesMap;
      data.value.globalLastUpdate = new Date();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("useServicesStorage.load failed", e);
    }
  }

  /**
   * Migra dados do formato legacy (services-store) para o novo formato IndexedDB
   */
  async function migrateLegacyData(
    guildServicesMap: Record<string, GuildServices>
  ): Promise<void> {
    try {
      const legacyData = await adapter.get<Record<string, unknown> | null>(
        "settings",
        "services-store"
      );
      if (!legacyData) return;

      const legacy = deserializeData(String(legacyData));
      if (!legacy || typeof legacy !== "object") return;

      // Verificar se é o formato antigo esperado
      if ("services" in legacy && Array.isArray(legacy.services)) {
        // Formato legacy: { services: Service[], lastUpdate: Date }
        const services = legacy.services as Service[];
        const legacyRecord = legacy as Record<string, unknown>;
        const lastUpdate = legacyRecord.lastUpdate
          ? new Date(String(legacyRecord.lastUpdate))
          : new Date();

        // Agrupar por guildId (assumindo que serviços legacy têm guildId)
        for (const service of services) {
          const serviceRecord = service as Service & Record<string, unknown>;
          const guildId = String(serviceRecord.guildId || "default");

          if (!guildServicesMap[guildId]) {
            guildServicesMap[guildId] = {
              guildId,
              services: [],
              lastUpdate: null,
              generationCount: 0,
            };
          }

          guildServicesMap[guildId].services.push(service);
          guildServicesMap[guildId].lastUpdate = lastUpdate;
          guildServicesMap[guildId].generationCount = 1;

          // Salvar no novo formato
          await adapter.put("services", `${guildId}_${service.id}`, {
            id: `${guildId}_${service.id}`,
            guildId,
            value: service,
            status: service.status,
            deadline: service.deadline,
            createdAt: lastUpdate,
          });
        }

        // Remover dados legacy após migração bem-sucedida
        await adapter.del("settings", "services-store");
        // eslint-disable-next-line no-console
        console.log("Migrated legacy services data to IndexedDB");
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("Failed to migrate legacy services data:", e);
    }
  }

  /**
   * Salva os dados atuais para o storage persistente
   */
  async function persist(): Promise<void> {
    try {
      // Auto-salvar está implementado via watch, mas este método pode ser útil para force-sync
      data.value.globalLastUpdate = new Date();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("useServicesStorage.persist failed", e);
    }
  }

  /**
   * Persiste os serviços de uma guilda específica imediatamente
   */
  async function persistGuildServices(guildId: string): Promise<void> {
    try {
      const entry = data.value.guildServices[guildId];
      if (!entry) return;

      // Persistir serviços em batch
      const batchPromises: Promise<void>[] = [];

      for (const service of entry.services) {
        const promise = (async () => {
          try {
            const plainService = JSON.parse(JSON.stringify(service));
            await adapter.put("services", service.id, {
              id: service.id,
              guildId: guildId,
              value: plainService,
              status: service.status,
              deadline: service.deadline,
              createdAt:
                (service as Service & { createdAt?: Date }).createdAt ??
                new Date(),
            });
          } catch (e) {
            // eslint-disable-next-line no-console
            console.warn(
              "failed to persist service (persistGuildServices)",
              service.id,
              e
            );
          }
        })();

        batchPromises.push(promise);
      }

      // Aguardar todas as persistências
      await Promise.all(batchPromises);

      // Persistir snapshot também
      await adapter.put("settings", "services-store-v2", {
        guildServices: data.value.guildServices,
        currentGuildId: data.value.currentGuildId,
        globalLastUpdate: data.value.globalLastUpdate,
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("persistGuildServices failed", e);
    }
  }

  /**
   * Busca serviços por guildId
   */
  function getServicesForGuild(guildId: string): Service[] {
    return data.value.guildServices[guildId]?.services || [];
  }

  /**
   * Atualiza serviços para uma guilda específica
   */
  async function updateServicesForGuild(
    guildId: string,
    services: Service[],
    generationCount?: number
  ): Promise<void> {
    const currentData = data.value.guildServices[guildId] || {
      guildId,
      services: [],
      lastUpdate: null,
      generationCount: 0,
    };

    data.value.guildServices[guildId] = {
      ...currentData,
      services: [...services],
      lastUpdate: new Date(),
      generationCount: generationCount ?? currentData.generationCount,
    };

    await persist();
  }

  /**
   * Remove todos os serviços de uma guilda
   */
  async function removeServicesForGuild(guildId: string): Promise<void> {
    delete data.value.guildServices[guildId];

    // Remover do IndexedDB também será feito via watch
    await persist();
  }

  /**
   * Obtém informações de uma guilda específica
   */
  function getGuildInfo(guildId: string): GuildServices | null {
    return data.value.guildServices[guildId] || null;
  }

  /**
   * Define a guilda atual
   */
  function setCurrentGuild(guildId: string | null): void {
    data.value.currentGuildId = guildId;
  }

  /**
   * Limpa todos os dados (para testes e reset)
   */
  async function reset(): Promise<void> {
    data.value = { ...DEFAULT };

    try {
      // Limpar dados do IndexedDB via list() e del()
      const services = await adapter.list<Record<string, unknown>>("services");
      for (const service of services) {
        if (service.id) {
          await adapter.del("services", service.id as string);
        }
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("useServicesStorage.reset failed", e);
    }
  }

  /**
   * Verifica se há dados de serviços salvos
   */
  function hasData(): boolean {
    return Object.keys(data.value.guildServices).length > 0;
  }

  // Auto-carregar dados na inicialização
  load();

  // Auto-persistir mudanças (similar ao padrão de contratos)
  // Para evitar problemas de persistência assíncrona, usamos debounce e persistence forçada
  let persistTimeout: ReturnType<typeof setTimeout> | null = null;

  watch(
    () => data.value.guildServices,
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
              const entry = newVal[gid] as GuildServices | undefined;
              if (!entry) continue;

              // Persistir serviços em batch para melhor performance
              const batchPromises: Promise<void>[] = [];

              // Garantir que cada serviço é armazenado no store 'services'
              for (const service of entry.services) {
                const promise = (async () => {
                  try {
                    // Clonagem para evitar problemas de reatividade
                    const plainService = JSON.parse(JSON.stringify(service));
                    await adapter.put("services", service.id, {
                      id: service.id,
                      guildId: gid,
                      value: plainService,
                      status: service.status,
                      deadline: service.deadline,
                      createdAt:
                        (service as Service & { createdAt?: Date }).createdAt ??
                        new Date(),
                    });
                  } catch (e) {
                    // eslint-disable-next-line no-console
                    console.warn("failed to persist service", service.id, e);
                  }
                })();

                batchPromises.push(promise);
              }

              // Aguardar todas as persistências do guild atual
              await Promise.all(batchPromises);
            }

            // Persistir snapshot para recuperação rápida
            await adapter.put("settings", "services-store-v2", {
              guildServices: data.value.guildServices,
              currentGuildId: data.value.currentGuildId,
              globalLastUpdate: data.value.globalLastUpdate,
            });
          } catch (e) {
            // eslint-disable-next-line no-console
            console.warn("useServicesStorage.persist failed", e);
          }
        })();
      }, 100); // Timeout mais curto (100ms) para persistência mais rápida
    },
    { deep: true }
  );

  return {
    data: readonly(data),
    load,
    persist,
    persistGuildServices,
    getServicesForGuild,
    updateServicesForGuild,
    removeServicesForGuild,
    getGuildInfo,
    setCurrentGuild,
    reset,
    hasData,
  };
}
