import type { Guild } from "@/types/guild";
import type { ScheduledEvent } from "@/types/timeline";
import type { Contract } from "@/types/contract";
import type { Service } from "@/types/service";

// Entradas no banco IndexedDB — tipadas a partir dos tipos existentes
export interface DBGuild {
  id: string;
  value: Guild;
  createdAt: Date;
  updatedAt?: Date;
}

export interface DBContract {
  id: string;
  guildId: string;
  value: Contract;
  status: string;
  deadline?: Date;
  createdAt: Date;
}

export interface DBService {
  id: string;
  guildId: string;
  value: Service;
  status: string;
  deadline?: Date;
  createdAt: Date;
}

export interface DBTimelineEntry {
  id: string;
  guildId: string;
  event: ScheduledEvent;
  eventDate: Date;
  eventType: string;
}

export interface DBSetting {
  key: string;
  value: unknown;
}

export type DBStoreName =
  | "guilds"
  | "contracts"
  | "services"
  | "timeline"
  | "settings";
