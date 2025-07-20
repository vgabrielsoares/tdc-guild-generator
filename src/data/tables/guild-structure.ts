// Guild Structure Tables
// Will be implemented in Issue 2.3
import type { TableEntry } from '@/types/tables'

// Placeholder tables - to be implemented in Issue 2.3
export const GUILD_SIZE_TABLE: TableEntry<string>[] = [
  { min: 1, max: 3, result: 'Pequena' },
  { min: 4, max: 6, result: 'Média' },
  { min: 7, max: 10, result: 'Grande' }
]

export const GUILD_CHARACTERISTICS_TABLE: TableEntry<string>[] = [
  { min: 1, max: 5, result: 'Bem organizada' },
  { min: 6, max: 10, result: 'Caótica' }
]

// More tables will be added in Issue 2.3
