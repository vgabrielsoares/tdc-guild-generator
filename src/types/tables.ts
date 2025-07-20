// Types for table system
// Will be implemented in Phase 2

export interface TableEntry<T = any> {
  min: number
  max: number
  result: T
  weight?: number
}

export interface RollModifier {
  name: string
  value: number
  condition?: string
}

// Placeholder - to be expanded in Issue 2.2
export type TableResult<T = any> = T
