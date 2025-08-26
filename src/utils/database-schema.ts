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
  deadline: z.date().optional(),
  createdAt: z.date(),
});

export const DBServiceSchema = z.object({
  id: z.string().min(1),
  guildId: z.string().min(1),
  value: z.record(z.unknown()),
  status: z.string(),
  deadline: z.date().optional(),
  createdAt: z.date(),
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

// Store configuration to be consumed by the DB manager
export const DB_STORES = [
  { name: "guilds", keyPath: "id", indices: ["createdAt", "locked"] },
  {
    name: "contracts",
    keyPath: "id",
    indices: ["guildId", "status", "deadline", "createdAt"],
  },
  {
    name: "services",
    keyPath: "id",
    indices: ["guildId", "status", "deadline", "createdAt", "complexity"],
  },
  {
    name: "timeline",
    keyPath: "id",
    indices: ["guildId", "eventDate", "eventType"],
  },
  { name: "settings", keyPath: "key", indices: [] },
];
