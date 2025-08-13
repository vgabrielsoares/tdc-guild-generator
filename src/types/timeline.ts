import { z } from "zod";

// Estrutura para uma data do jogo
export interface GameDate {
  day: number;
  month: number;
  year: number;
}

// Tipos de eventos que podem ser agendados
export enum ScheduledEventType {
  NEW_CONTRACTS = "new_contracts",
  CONTRACT_EXPIRATION = "contract_expiration", 
  CONTRACT_RESOLUTION = "contract_resolution",
  
  // Serviços (preparação para Fase 5)
  NEW_SERVICES = "new_services",
  SERVICE_RESOLUTION = "service_resolution",
  
  // Mural de Avisos (preparação para Fase 7)
  NEW_NOTICES = "new_notices",
  NOTICE_EXPIRATION = "notice_expiration",
  
  // Membros (preparação para Fase 6)
  MEMBER_REGISTRY_UPDATE = "member_registry_update",
  
  // Renome (preparação para Fase 8)
  RENOWN_AUTHORIZATION = "renown_authorization",
  RESOURCE_AVAILABILITY = "resource_availability",
}

// Evento agendado na timeline
export interface ScheduledEvent {
  id: string;
  type: ScheduledEventType;
  date: GameDate;
  description: string;
  data?: Record<string, unknown>; // Dados específicos do evento
}

// Estado da timeline para uma guilda específica
export interface GuildTimeline {
  guildId: string;
  currentDate: GameDate;
  events: ScheduledEvent[];
  createdAt: Date;
  updatedAt: Date;
}

// Configurações do calendário
export interface CalendarConfig {
  monthNames: string[];
  daysInMonth: number[];
  startYear: number;
}

// Resultado da passagem de tempo
export interface TimeAdvanceResult {
  newDate: GameDate;
  triggeredEvents: ScheduledEvent[];
  eventsRemaining: ScheduledEvent[];
}

// Schema de validação para GameDate
export const GameDateSchema = z.object({
  day: z.number().min(1).max(31),
  month: z.number().min(1).max(12),
  year: z.number().min(1),
});

// Schema para evento agendado
export const ScheduledEventSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(ScheduledEventType),
  date: GameDateSchema,
  description: z.string().min(1),
  data: z.record(z.unknown()).optional(),
});

// Schema para timeline da guilda
export const GuildTimelineSchema = z.object({
  guildId: z.string(),
  currentDate: GameDateSchema,
  events: z.array(ScheduledEventSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Funções de validação
export function validateGameDate(data: unknown): GameDate {
  return GameDateSchema.parse(data);
}

export function validateScheduledEvent(data: unknown): ScheduledEvent {
  return ScheduledEventSchema.parse(data);
}

export function validateGuildTimeline(data: unknown): GuildTimeline {
  return GuildTimelineSchema.parse(data);
}

// Configuração padrão do calendário
export const DEFAULT_CALENDAR_CONFIG: CalendarConfig = {
  monthNames: [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ],
  daysInMonth: [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],
  startYear: 1000, // Ano inicial padrão para o mundo do jogo
};

// Utilitários para trabalhar com datas
export function isLeapYear(year: number): boolean {
  return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}

export function getDaysInMonth(month: number, year: number): number {
  if (month === 2 && isLeapYear(year)) {
    return 29;
  }
  return DEFAULT_CALENDAR_CONFIG.daysInMonth[month - 1];
}

export function createGameDate(day: number, month: number, year: number): GameDate {
  const maxDays = getDaysInMonth(month, year);
  
  if (day < 1 || day > maxDays) {
    throw new Error(`Dia inválido: ${day}. Mês ${month} do ano ${year} tem apenas ${maxDays} dias.`);
  }
  
  if (month < 1 || month > 12) {
    throw new Error(`Mês inválido: ${month}. Deve estar entre 1 e 12.`);
  }
  
  if (year < 1) {
    throw new Error(`Ano inválido: ${year}. Deve ser maior que 0.`);
  }
  
  return { day, month, year };
}

export function formatGameDate(date: GameDate): string {
  const monthName = DEFAULT_CALENDAR_CONFIG.monthNames[date.month - 1];
  return `${date.day} de ${monthName} de ${date.year}`;
}

export function formatShortGameDate(date: GameDate): string {
  return `${date.day.toString().padStart(2, '0')}/${date.month.toString().padStart(2, '0')}/${date.year}`;
}

export function isSameDate(date1: GameDate, date2: GameDate): boolean {
  return date1.day === date2.day && 
         date1.month === date2.month && 
         date1.year === date2.year;
}

export function isDateBefore(date1: GameDate, date2: GameDate): boolean {
  if (date1.year !== date2.year) {
    return date1.year < date2.year;
  }
  if (date1.month !== date2.month) {
    return date1.month < date2.month;
  }
  return date1.day < date2.day;
}

export function isDateAfter(date1: GameDate, date2: GameDate): boolean {
  return !isDateBefore(date1, date2) && !isSameDate(date1, date2);
}

export function isDateBeforeOrEqual(date1: GameDate, date2: GameDate): boolean {
  return isDateBefore(date1, date2) || isSameDate(date1, date2);
}

export function isDateAfterOrEqual(date1: GameDate, date2: GameDate): boolean {
  return isDateAfter(date1, date2) || isSameDate(date1, date2);
}
