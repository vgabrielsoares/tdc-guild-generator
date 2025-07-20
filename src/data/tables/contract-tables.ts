// Contract Tables
// Will be implemented in Issue 4.2
import type { TableEntry } from '@/types/tables'

// Placeholder tables - to be implemented in Issue 4.2
export const CONTRACT_QUANTITY_TABLE: TableEntry<number>[] = [
  { min: 1, max: 3, result: 1 },
  { min: 4, max: 6, result: 2 },
  { min: 7, max: 10, result: 3 }
]

export const CONTRACT_DIFFICULTY_TABLE: TableEntry<string>[] = [
  { min: 1, max: 4, result: 'Fácil' },
  { min: 5, max: 7, result: 'Médio' },
  { min: 8, max: 10, result: 'Difícil' }
]

// More tables will be added in Issue 4.2
