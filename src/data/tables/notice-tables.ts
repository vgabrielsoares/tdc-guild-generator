// Notice Tables
// Will be implemented in Issue 7.2
import type { TableEntry } from '@/types/tables'

// Placeholder tables - to be implemented in Issue 7.2
export const NOTICE_TYPE_TABLE: TableEntry<string>[] = [
  { min: 1, max: 3, result: 'Procurado' },
  { min: 4, max: 6, result: 'Comercial' },
  { min: 7, max: 10, result: 'Aviso' }
]

export const NOTICE_URGENCY_TABLE: TableEntry<string>[] = [
  { min: 1, max: 5, result: 'Normal' },
  { min: 6, max: 8, result: 'Urgente' },
  { min: 9, max: 10, result: 'Crítico' }
]

// More tables will be added in Issue 7.2
