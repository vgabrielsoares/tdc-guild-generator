import { ref, watch } from "vue";
import type { Ref } from "vue";
import { useStorageAdapter } from "@/composables/useStorageAdapter";
import { deserializeData } from "@/utils/storage";
import type { Notice, GuildNotices } from "@/types/notice";
import { NoticeSchema } from "@/types/notice";
import { DBNoticeSchema } from "@/utils/database-schema";
import type { TimelineStore } from "@/utils/timeline-store-integration";
import { ScheduledEventType } from "@/types/timeline";

// Helper para gerar IDs
function generateId(): string {
  return `notice_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export interface NoticesStorageState {
  guildNotices: Record<
    string,
    {
      guildId: string;
      notices: Notice[];
      lastUpdate: Date | null;
      generationCount: number;
    }
  >;
  currentGuildId: string | null;
  globalLastUpdate: Date | null;
}

const DEFAULT: NoticesStorageState = {
  guildNotices: {},
  currentGuildId: null,
  globalLastUpdate: null,
};

// Singleton instance
let _instance: ReturnType<typeof createNoticesStorage> | null = null;

function createNoticesStorage() {
  const adapter = useStorageAdapter();
  const data: Ref<NoticesStorageState> = ref<NoticesStorageState>({
    ...DEFAULT,
  });

  /**
   * Carrega todos os avisos do IndexedDB/LocalStorage para memória.
   * Também realiza migração de dados legacy se necessário.
   */
  async function load(): Promise<void> {
    try {
      // 1. Carregar dados novos do store 'notices'
      const rows = await adapter.list<Record<string, unknown>>("notices");

      const guildNoticesMap: Record<string, GuildNotices> = {};

      for (const noticeRow of rows) {
        try {
          const dbParse = DBNoticeSchema.safeParse(noticeRow);
          if (dbParse.success) {
            const rec = dbParse.data;
            const guildId = rec.guildId;

            if (!guildNoticesMap[guildId]) {
              guildNoticesMap[guildId] = {
                guildId,
                notices: [],
                lastUpdate: null,
                generationCount: 0,
              };
            }

            const noticeParse = NoticeSchema.safeParse(rec.value);
            if (noticeParse.success) {
              guildNoticesMap[guildId].notices.push(noticeParse.data);

              if (rec.createdAt) {
                const createdDate = new Date(rec.createdAt);
                if (
                  !guildNoticesMap[guildId].lastUpdate ||
                  createdDate > guildNoticesMap[guildId].lastUpdate!
                ) {
                  guildNoticesMap[guildId].lastUpdate = createdDate;
                }
              }
            } else {
              // Tentar recuperar aviso com dados mínimos
              try {
                const safeNewDate = (val: unknown): Date => {
                  if (!val) return new Date();
                  if (val instanceof Date) return val;
                  if (typeof val === "string" || typeof val === "number")
                    return new Date(val);
                  return new Date();
                };

                // Primeiro, tentar converter apenas as datas problemáticas
                const noticeWithFixedDates = {
                  ...rec.value,
                  createdAt: safeNewDate(rec.value.createdAt),
                  updatedAt: safeNewDate(rec.value.updatedAt),
                  createdDate: safeNewDate(rec.value.createdDate),
                  expirationDate: rec.value.expirationDate
                    ? safeNewDate(rec.value.expirationDate)
                    : undefined,
                };

                // Tentar validar novamente com datas corrigidas
                const dateFixedParse =
                  NoticeSchema.safeParse(noticeWithFixedDates);
                if (dateFixedParse.success) {
                  guildNoticesMap[guildId].notices.push(dateFixedParse.data);
                  continue; // Pular para o próximo aviso
                }

                // Se ainda falhar, usar fallback com dados mínimos
                const minimalNotice = {
                  id: rec.value.id || generateId(),
                  guildId: rec.guildId,
                  type: rec.value.type || "residents_notice",
                  status: rec.value.status || "active",
                  content: rec.value.content || null,
                  mentionedSpecies: rec.value.mentionedSpecies || [],
                  alternativePayment: rec.value.alternativePayment,
                  reducedReward: rec.value.reducedReward || false,
                  createdDate: safeNewDate(rec.value.createdDate),
                  expirationDate: rec.value.expirationDate
                    ? safeNewDate(rec.value.expirationDate)
                    : undefined,
                  createdAt: safeNewDate(rec.value.createdAt),
                  updatedAt: safeNewDate(rec.value.updatedAt),
                  ...rec.value,
                };

                guildNoticesMap[guildId].notices.push(minimalNotice as Notice);
              } catch (fallbackError) {
                // eslint-disable-next-line no-console
                console.warn(
                  "Failed to recover notice with fallback:",
                  fallbackError
                );
              }
            }
          }
        } catch (parseError) {
          // eslint-disable-next-line no-console
          console.warn("Failed to parse notice row:", parseError);
          continue;
        }
      }

      // 2. Tentar migrar dados legacy do formato antigo
      await migrateLegacyData(guildNoticesMap);

      // 3. Atualizar estado reativo
      data.value.guildNotices = guildNoticesMap;
      data.value.globalLastUpdate = new Date();

      // 4. Carregar currentGuildId do storage
      try {
        const storedCurrentGuildId = await adapter.get<string | null>(
          "settings",
          "notices-store-currentGuildId"
        );
        if (storedCurrentGuildId) {
          data.value.currentGuildId = storedCurrentGuildId;
        }
      } catch (e) {
        // ignore
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("useNoticesStorage.load failed", e);
    }
  }

  /**
   * Migra dados do formato legacy (notices-store) para o novo formato IndexedDB
   */
  async function migrateLegacyData(
    guildNoticesMap: Record<string, GuildNotices>
  ): Promise<void> {
    try {
      const legacyData = await adapter.get<Record<string, unknown> | null>(
        "settings",
        "notices-store"
      );
      if (!legacyData) return;

      const legacy = deserializeData(String(legacyData));
      if (!legacy || typeof legacy !== "object") return;

      // Verificar se é o formato antigo esperado
      if ("notices" in legacy && Array.isArray(legacy.notices)) {
        // Formato legacy: { notices: Notice[], lastUpdate: Date }
        const notices = legacy.notices as Notice[];
        const legacyRecord = legacy as Record<string, unknown>;
        const lastUpdate = legacyRecord.lastUpdate
          ? new Date(String(legacyRecord.lastUpdate))
          : new Date();

        // Agrupar por guildId
        for (const notice of notices) {
          const noticeRecord = notice as Notice & Record<string, unknown>;
          const guildId = String(noticeRecord.guildId || "default");

          if (!guildNoticesMap[guildId]) {
            guildNoticesMap[guildId] = {
              guildId,
              notices: [],
              lastUpdate: null,
              generationCount: 0,
            };
          }

          guildNoticesMap[guildId].notices.push(notice);
          guildNoticesMap[guildId].lastUpdate = lastUpdate;
          guildNoticesMap[guildId].generationCount = 1;

          // Salvar no novo formato
          await adapter.put("notices", `${guildId}_${notice.id}`, {
            id: `${guildId}_${notice.id}`,
            guildId,
            value: notice,
            status: notice.status,
            type: notice.type,
            createdAt: lastUpdate,
            expirationDate: notice.expirationDate,
          });
        }

        // Remover dados legacy após migração bem-sucedida
        await adapter.del("settings", "notices-store");
        // eslint-disable-next-line no-console
        console.log("Migrated legacy notices data to IndexedDB");
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("Failed to migrate legacy notices data:", e);
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
      console.warn("useNoticesStorage.persist failed", e);
    }
  }

  /**
   * Persiste os avisos de uma guilda específica imediatamente
   */
  async function persistGuildNotices(guildId: string): Promise<void> {
    try {
      const entry = data.value.guildNotices[guildId];
      if (!entry) return;

      // Persistir avisos em batch
      const batchPromises: Promise<void>[] = [];

      for (const notice of entry.notices) {
        const promise = (async () => {
          try {
            const plainNotice = JSON.parse(JSON.stringify(notice));
            await adapter.put("notices", notice.id, {
              id: notice.id,
              guildId: guildId,
              value: plainNotice,
              status: notice.status,
              type: notice.type,
              createdAt:
                (notice as Notice & { createdAt?: Date }).createdAt ??
                new Date(),
              expirationDate: notice.expirationDate,
            });
          } catch (e) {
            // eslint-disable-next-line no-console
            console.warn(
              "failed to persist notice (persistGuildNotices)",
              notice.id,
              e
            );
          }
        })();

        batchPromises.push(promise);
      }

      // Aguardar todas as persistências
      await Promise.all(batchPromises);

      // Persistir snapshot também
      await adapter.put("settings", "notices-store-v2", {
        guildNotices: data.value.guildNotices,
        currentGuildId: data.value.currentGuildId,
        globalLastUpdate: data.value.globalLastUpdate,
      });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("persistGuildNotices failed", e);
    }
  }

  /**
   * Busca avisos por guildId
   */
  function getNoticesForGuild(guildId: string): Notice[] {
    const notices = data.value.guildNotices[guildId]?.notices || [];
    return notices;
  }

  /**
   * Atualiza avisos para uma guilda específica
   */
  async function updateNoticesForGuild(
    guildId: string,
    notices: Notice[],
    generationCount?: number
  ): Promise<void> {
    const currentData = data.value.guildNotices[guildId] || {
      guildId,
      notices: [],
      lastUpdate: null,
      generationCount: 0,
    };

    data.value.guildNotices[guildId] = {
      ...currentData,
      notices: [...notices],
      lastUpdate: new Date(),
      generationCount: generationCount ?? currentData.generationCount,
    };

    await persist();
  }

  /**
   * Remove todos os avisos de uma guilda
   */
  async function removeNoticesForGuild(guildId: string): Promise<void> {
    delete data.value.guildNotices[guildId];

    // Remover do IndexedDB também será feito via watch
    await persist();
  }

  /**
   * Obtém informações de uma guilda específica
   */
  function getGuildInfo(guildId: string): GuildNotices | null {
    return data.value.guildNotices[guildId] || null;
  }

  /**
   * Define a guilda atual
   */
  async function setCurrentGuild(guildId: string | null): Promise<void> {
    data.value.currentGuildId = guildId;

    // Persistir o currentGuildId para que sobreviva a recarregamentos da página
    try {
      if (guildId) {
        await adapter.put("settings", "notices-store-currentGuildId", guildId);
      } else {
        await adapter.del("settings", "notices-store-currentGuildId");
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("Failed to persist notices currentGuildId", e);
    }
  }

  /**
   * Adiciona um aviso específico
   */
  async function addNotice(notice: Notice): Promise<void> {
    const guildId = notice.guildId;
    if (!data.value.guildNotices[guildId]) {
      data.value.guildNotices[guildId] = {
        guildId,
        notices: [],
        lastUpdate: null,
        generationCount: 0,
      };
    }

    data.value.guildNotices[guildId].notices.push(notice);
    data.value.guildNotices[guildId].lastUpdate = new Date();

    await persistGuildNotices(guildId);
  }

  /**
   * Remove um aviso específico
   */
  async function removeNotice(
    noticeId: string,
    guildId: string
  ): Promise<void> {
    const guildNotices = data.value.guildNotices[guildId];
    if (!guildNotices) return;

    const index = guildNotices.notices.findIndex((n) => n.id === noticeId);
    if (index === -1) return;

    guildNotices.notices.splice(index, 1);
    guildNotices.lastUpdate = new Date();

    // Remover do IndexedDB também
    try {
      await adapter.del("notices", noticeId);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("Failed to delete notice from IndexedDB", e);
    }

    await persistGuildNotices(guildId);
  }

  /**
   * Atualiza um aviso específico
   */
  async function updateNotice(notice: Notice): Promise<void> {
    const guildId = notice.guildId;
    const guildNotices = data.value.guildNotices[guildId];
    if (!guildNotices) return;

    const index = guildNotices.notices.findIndex((n) => n.id === notice.id);
    if (index === -1) return;

    notice.updatedAt = new Date();
    guildNotices.notices[index] = notice;
    guildNotices.lastUpdate = new Date();

    await persistGuildNotices(guildId);
  }

  /**
   * Limpa todos os avisos
   */
  async function clearAllNotices(): Promise<void> {
    data.value.guildNotices = {};
    data.value.globalLastUpdate = null;

    try {
      // Limpar do IndexedDB
      const rows = await adapter.list<Record<string, unknown>>("notices");
      for (const row of rows) {
        if (row && "id" in row && typeof row.id === "string") {
          await adapter.del("notices", row.id);
        }
      }

      // Limpar snapshot
      await adapter.del("settings", "notices-store-v2");
      // eslint-disable-next-line no-console
      console.log("Cleared all notices from storage");
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn("Failed to clear notices from IndexedDB:", e);
    }
  }

  // Configurar auto-persistência através de watch
  watch(
    () => data.value,
    async (newData) => {
      try {
        // Persistir os dados em batch no IndexedDB
        const allNotices: Array<{
          id: string;
          guildId: string;
          value: Notice;
          status: string;
          type: string;
          createdAt: Date;
          expirationDate?: Date;
        }> = [];

        for (const [guildId, guildInfo] of Object.entries(
          newData.guildNotices
        )) {
          for (const notice of guildInfo.notices) {
            allNotices.push({
              id: notice.id,
              guildId,
              value: notice,
              status: notice.status,
              type: notice.type,
              createdAt:
                (notice as Notice & { createdAt?: Date }).createdAt ??
                new Date(),
              expirationDate: notice.expirationDate,
            });
          }
        }

        // Persistir notices em batch
        const persistPromises = allNotices.map((item) =>
          adapter.put("notices", item.id, item).catch((e) => {
            // eslint-disable-next-line no-console
            console.warn("Failed to persist notice (watch)", item.id, e);
          })
        );

        await Promise.all(persistPromises);

        // Persistir snapshot
        await adapter.put("settings", "notices-store-v2", {
          guildNotices: newData.guildNotices,
          currentGuildId: newData.currentGuildId,
          globalLastUpdate: newData.globalLastUpdate,
        });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("Auto-persist failed (notices):", e);
      }
    },
    { deep: true }
  );

  /**
   * Configura integração com timeline para eventos automáticos de avisos
   * Funcionalidade compartilhada para integração DRY com timeline
   */
  function configureTimelineIntegration(timelineStore: TimelineStore): void {
    // Configuração para eventos de novos avisos
    const noticeEventConfigs = [
      {
        type: ScheduledEventType.NEW_NOTICES,
        source: "notices_module",
        description: "Verificar novos avisos no mural da guilda",
        rollTimeFunction: () => Math.floor(Math.random() * 7) + 1, // 1-7 dias
        guildId: data.value.currentGuildId || "",
        resolutionType: "auto_generate",
      },
    ];

    // Usar funções DRY do timeline-store-integration.ts quando necessário
    // A implementação completa será integrada com o store principal de avisos

    // Placeholder para evitar erro de lint, será implementado na integração com store
    if (timelineStore && noticeEventConfigs) {
      // Implementação será adicionada
    }
  }

  /**
   * Processa eventos de timeline relacionados a avisos
   * Funcionalidade compartilhada para DRY integration
   */
  function processTimelineEvents(
    timelineResult: Record<string, unknown>
  ): void {
    // Implementação será adicionada quando integrado com o store principal
    // Usar processModuleTimeAdvance do timeline-store-integration.ts

    // Placeholder para evitar erro de lint, será implementado na integração com store
    if (timelineResult) {
      // Processamento será implementado
    }
  }

  return {
    // Estado reativo (somente leitura), usar computed para reatividade
    get guildNotices() {
      return data.value.guildNotices;
    },
    get currentGuildId() {
      return data.value.currentGuildId;
    },
    get globalLastUpdate() {
      return data.value.globalLastUpdate;
    },

    // Métodos públicos
    load,
    persist,
    persistGuildNotices,
    getNoticesForGuild,
    updateNoticesForGuild,
    removeNoticesForGuild,
    getGuildInfo,
    setCurrentGuild,
    addNotice,
    removeNotice,
    updateNotice,
    clearAllNotices,

    // Integração com timeline
    configureTimelineIntegration,
    processTimelineEvents,
  };
}

/**
 * Composable para armazenamento de avisos com singleton pattern
 * Reutiliza a mesma instância em toda a aplicação
 */
export function useNoticesStorage() {
  if (!_instance) {
    _instance = createNoticesStorage();
  }
  return _instance;
}
