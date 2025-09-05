// Renown Tables
// Will be implemented in Issue 8.2
import type { TableEntry } from "@/types/tables";

// Placeholder tables - to be implemented in Issue 8.2
export const RENOWN_BENEFITS_TABLE: TableEntry<string>[] = [
  { min: 1, max: 3, result: "Desconto básico" },
  { min: 4, max: 6, result: "Acesso especial" },
  { min: 7, max: 10, result: "Privilégios VIP" },
];

export const RENOWN_TITLES_TABLE: TableEntry<string>[] = [
  { min: 1, max: 4, result: "Novato" },
  { min: 5, max: 7, result: "Aventureiro" },
  { min: 8, max: 10, result: "Herói" },
];

// More tables will be added in Issue 8.2
