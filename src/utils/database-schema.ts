import { z } from "zod";
import { GuildSchema } from "@/types/guild";
import { ScheduledEventSchema } from "@/types/timeline";

// Schemas Zod para validação de registros no DB
export const DBGuildSchema = z.object({
  id: z.string().min(1),
  value: GuildSchema,
  createdAt: z.date(),
  updatedAt: z.date().optional(),
});

export const DBContractSchema = z.object({
  id: z.string().min(1),
  guildId: z.string().min(1),
  value: z.record(z.unknown()),
  status: z.string(),
  deadline: z.union([z.date(), z.string()]).optional(),
  createdAt: z
    .union([z.date(), z.string()])
    .transform((val) => (typeof val === "string" ? new Date(val) : val)),
});

export const DBServiceSchema = z.object({
  id: z.string().min(1),
  guildId: z.string().min(1),
  value: z.record(z.unknown()),
  status: z.string(),
  deadline: z
    .union([
      z.date(),
      z.string(),
      z.object({
        type: z.string(),
        value: z.string().optional(),
      }),
    ])
    .optional(),
  createdAt: z
    .union([
      z.date(),
      z.string(),
      z.object({
        day: z.number().int().min(1).max(31),
        month: z.number().int().min(1).max(12),
        year: z.number().int().min(1).max(9999),
      }),
    ])
    .transform((val) => {
      if (typeof val === "string") return new Date(val);
      if (val instanceof Date) return val;
      // Se for objeto com day/month/year, transformar em Date
      if (
        typeof val === "object" &&
        val &&
        "day" in val &&
        "month" in val &&
        "year" in val
      ) {
        return new Date(val.year, val.month - 1, val.day);
      }
      return new Date();
    }),
});

export const DBNoticeSchema = z.object({
  id: z.string().min(1),
  guildId: z.string().min(1),
  value: z.record(z.unknown()),
  status: z.string(),
  type: z.string(),
  createdAt: z
    .union([z.date(), z.string()])
    .transform((val) => (typeof val === "string" ? new Date(val) : val)),
  expirationDate: z
    .union([z.date(), z.string()])
    .optional()
    .transform((val) => {
      if (!val) return undefined;
      return typeof val === "string" ? new Date(val) : val;
    }),
});

export const DBTimelineSchema = z.object({
  id: z.string().min(1),
  guildId: z.string().min(1),
  event: ScheduledEventSchema,
  eventDate: z.date(),
  eventType: z.string(),
});

export const DBSettingSchema = z.object({
  key: z.string().min(1),
  value: z.unknown(),
});

// Configuração de stores para ser consumida pelo gerenciador de DB
export const DB_STORES = [
  { name: "guilds", keyPath: "id", indices: ["createdAt", "locked"] },
  {
    name: "contracts",
    keyPath: "id",
    // suporte a índice composto para guildId + status para consultas otimizadas
    indices: [
      "guildId",
      "status",
      "deadline",
      "createdAt",
      { name: "guildId_status", keyPath: ["guildId", "status"] },
    ],
  },
  {
    name: "services",
    keyPath: "id",
    indices: ["guildId", "status", "deadline", "createdAt", "complexity"],
  },
  {
    name: "notices",
    keyPath: "id",
    indices: ["guildId", "status", "type", "createdAt", "expirationDate"],
  },
  {
    name: "timeline",
    keyPath: "id",
    indices: ["guildId", "eventDate", "eventType"],
  },
  { name: "settings", keyPath: "key", indices: [] },
];
