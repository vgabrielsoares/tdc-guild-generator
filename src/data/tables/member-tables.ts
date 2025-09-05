// Member Tables
// Will be implemented in Issue 6.2
import type { TableEntry } from "@/types/tables";

// Placeholder tables - to be implemented in Issue 6.2
export const MEMBER_RANK_TABLE: TableEntry<string>[] = [
  { min: 1, max: 4, result: "Iniciante" },
  { min: 5, max: 7, result: "Experiente" },
  { min: 8, max: 10, result: "Veterano" },
];

export const MEMBER_AVAILABILITY_TABLE: TableEntry<string>[] = [
  { min: 1, max: 6, result: "Disponível" },
  { min: 7, max: 8, result: "Ocupado" },
  { min: 9, max: 10, result: "Indisponível" },
];

// More tables will be added in Issue 6.2
