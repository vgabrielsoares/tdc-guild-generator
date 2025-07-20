export interface DiceRoll {
  notation: string;
  result: number;
  individual: number[];
  modifier: number;
  timestamp: Date;
}

export interface DiceNotation {
  count: number; // Number of dice (e.g., 2 in "2d6")
  sides: number; // Number of sides (e.g., 6 in "2d6")
  modifier: number; // Modifier (e.g., +3 in "1d20+3")
  advantage?: boolean; // Advantage roll (roll twice, take higher)
  disadvantage?: boolean; // Disadvantage roll (roll twice, take lower)
}

export interface TableRoll<T> {
  roll: DiceRoll;
  result: T;
  tableEntry: TableEntry<T>;
}

export interface TableEntry<T> {
  min: number;
  max: number;
  result: T;
  weight?: number;
  description?: string;
}

export interface RollLog {
  id: string;
  notation: string;
  result: number;
  timestamp: Date;
  context?: string; // What was being rolled for
  individual?: number[];
  modifier?: number;
}

// Dice validation types
export interface DiceValidation {
  isValid: boolean;
  error?: string;
  parsed?: DiceNotation;
}

// Roll configuration
export interface RollConfig {
  notation: string;
  context?: string;
  logRoll?: boolean;
  advantage?: boolean;
  disadvantage?: boolean;
}

// Table roll configuration
export interface TableRollConfig<T> {
  table: TableEntry<T>[];
  modifier?: number;
  context?: string;
  logRoll?: boolean;
}

// Legacy types for backward compatibility
export interface DiceResult {
  total: number;
  rolls: number[];
  modifier: number;
  notation: string;
}
