export interface TableEntry<T = any> {
  min: number;
  max: number;
  result: T;
  weight?: number;
  description?: string;
  metadata?: Record<string, any>;
}

export interface RollModifier {
  name: string;
  value: number;
  condition?: string;
  description?: string;
}

export interface TableValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface WeightedEntry<T = any> {
  result: T;
  weight: number;
  description?: string;
}

export interface TableRollResult<T = any> {
  result: T;
  entry: TableEntry<T>;
  roll: number;
  modifiers: RollModifier[];
  finalRoll: number;
}

export interface TableMetadata {
  name?: string;
  description?: string;
  diceNotation?: string;
  modifiers?: RollModifier[];
  tags?: string[];
}

export interface CompleteTable<T = any> {
  entries: TableEntry<T>[];
  metadata: TableMetadata;
  validation: TableValidation;
}

// Legacy type for backward compatibility
export type TableResult<T = any> = T;
