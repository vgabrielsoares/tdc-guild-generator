// Service Tables
// Will be implemented in Issue 5.2
import type { TableEntry } from '@/types/tables'

// Placeholder tables - to be implemented in Issue 5.2
export const SERVICE_TYPE_TABLE: TableEntry<string>[] = [
  { min: 1, max: 3, result: 'Escolta' },
  { min: 4, max: 6, result: 'Investigação' },
  { min: 7, max: 10, result: 'Proteção' }
]

export const SERVICE_COMPLEXITY_TABLE: TableEntry<string>[] = [
  { min: 1, max: 4, result: 'Simples' },
  { min: 5, max: 7, result: 'Moderado' },
  { min: 8, max: 10, result: 'Complexo' }
]

// More tables will be added in Issue 5.2
