// Table rolling utility functions
// Will be implemented in Issue 2.2
import type { TableEntry, TableResult } from '@/types/tables'

/**
 * Roll on a table and return the result
 * To be implemented in Issue 2.2
 */
export function rollOnTable<T>(table: TableEntry<T>[], modifier = 0): TableResult<T> {
  // Placeholder implementation
  console.log('🎯 Roll on table with modifier:', modifier)
  if (table.length === 0) return null as any
  
  const randomIndex = Math.floor(Math.random() * table.length)
  return table[randomIndex].result
}

/**
 * Validate table structure
 * To be implemented in Issue 2.2
 */
export function validateTable<T>(table: TableEntry<T>[]): boolean {
  // Placeholder implementation
  console.log('✅ Validate table structure')
  return table.length > 0
}
