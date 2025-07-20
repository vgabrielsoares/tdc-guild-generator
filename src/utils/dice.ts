// Dice utility functions
// Will be implemented in Issue 2.1
import type { DiceResult, DiceNotation } from '@/types/dice'

/**
 * Parse dice notation (e.g., "1d20", "2d6+3")
 * To be implemented in Issue 2.1
 */
export function parseDiceNotation(notation: string): DiceNotation {
  // Placeholder implementation
  console.log('🎲 Parse dice notation:', notation)
  return {
    count: 1,
    sides: 20,
    modifier: 0,
    original: notation
  }
}

/**
 * Roll dice with given notation
 * To be implemented in Issue 2.1
 */
export function rollDice(notation: string): DiceResult {
  // Placeholder implementation
  console.log('🎲 Roll dice:', notation)
  return {
    total: Math.floor(Math.random() * 20) + 1,
    rolls: [Math.floor(Math.random() * 20) + 1],
    modifier: 0,
    notation
  }
}
