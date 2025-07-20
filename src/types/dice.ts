// Types for dice rolling system
// Will be implemented in Phase 2

export interface DiceResult {
  total: number
  rolls: number[]
  modifier: number
  notation: string
}

export interface DiceNotation {
  count: number
  sides: number
  modifier: number
  original: string
}

// Placeholder - to be expanded in Issue 2.1
export type DiceRoll = any
