import type {
  TableEntry,
  TableRollResult,
  RollModifier,
  TableValidation,
  WeightedEntry,
  CompleteTable,
  TableMetadata,
} from "@/types/tables";
import { rollDice } from "./dice";

const logTable = {
  warn: (message: string, ...args: unknown[]) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.warn(`[TABLE ROLLER] ${message}`, ...args);
    }
  },
  info: (message: string, ...args: unknown[]) => {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(`[TABLE ROLLER] ${message}`, ...args);
    }
  },
};

// Dice notation selection thresholds
const DICE_THRESHOLDS = {
  D6_MAX: 6,
  D8_MAX: 8,
  D10_MAX: 10,
  D12_MAX: 12,
  D20_MAX: 20,
  D100_MAX: 100,
  // For larger ranges using multiple dice
  MULTI_DICE_2D6_RANGE: 36,
} as const;

// Dice notation mappings
const DICE_NOTATIONS = {
  D6: "1d6",
  D8: "1d8",
  D10: "1d10",
  D12: "1d12",
  D20: "1d20",
  D100: "1d100",
  MULTI_2D6: "2d6",
  MULTI_2D20: "2d20",
} as const;

/**
 * Determine appropriate dice notation based on table range
 */
function getDiceNotationForRange(maxValue: number, range: number): string {
  if (maxValue <= DICE_THRESHOLDS.D6_MAX) {
    return DICE_NOTATIONS.D6;
  } else if (maxValue <= DICE_THRESHOLDS.D8_MAX) {
    return DICE_NOTATIONS.D8;
  } else if (maxValue <= DICE_THRESHOLDS.D10_MAX) {
    return DICE_NOTATIONS.D10;
  } else if (maxValue <= DICE_THRESHOLDS.D12_MAX) {
    return DICE_NOTATIONS.D12;
  } else if (maxValue <= DICE_THRESHOLDS.D20_MAX) {
    return DICE_NOTATIONS.D20;
  } else if (maxValue <= DICE_THRESHOLDS.D100_MAX) {
    return DICE_NOTATIONS.D100;
  } else {
    if (range <= DICE_THRESHOLDS.MULTI_DICE_2D6_RANGE) {
      return DICE_NOTATIONS.MULTI_2D6;
    } else {
      return DICE_NOTATIONS.MULTI_2D20;
    }
  }
}

/**
 * Roll on a standard range table (e.g., 1-6, 1-20, etc.)
 */
export function rollOnTable<T>(
  table: TableEntry<T>[],
  modifiers: RollModifier[] = []
): TableRollResult<T> {
  if (!table || table.length === 0) {
    throw new Error("Table is empty or undefined");
  }

  // Validate table first
  const validation = validateTable(table);
  if (!validation.isValid) {
    throw new Error(`Invalid table: ${validation.errors.join(", ")}`);
  }

  // Calculate total modifier value
  const totalModifier = modifiers.reduce((sum, mod) => sum + mod.value, 0);

  // Determine the range and dice needed
  const minValue = Math.min(...table.map((entry) => entry.min));
  const maxValue = Math.max(...table.map((entry) => entry.max));
  const range = maxValue - minValue + 1;

  // Determine appropriate dice notation
  const diceNotation = getDiceNotationForRange(maxValue, range);

  // Add modifier to dice notation if present
  const finalDiceNotation =
    totalModifier !== 0
      ? `${diceNotation}${totalModifier > 0 ? `+${totalModifier}` : `${totalModifier}`}`
      : diceNotation;

  // Roll the dice
  const diceRoll = rollDice({
    notation: finalDiceNotation,
    context: "Table roll",
    logRoll: true,
  });

  const finalRoll = diceRoll.result;

  // Find the matching table entry
  const matchingEntry = table.find(
    (entry) => finalRoll >= entry.min && finalRoll <= entry.max
  );

  if (!matchingEntry) {
    logTable.warn(
      `No table entry found for roll ${finalRoll} (range: ${minValue}-${maxValue})`
    );
    // Use the closest entry as fallback
    const closest = table.reduce((prev, curr) => {
      const prevDistance = Math.min(
        Math.abs(prev.min - finalRoll),
        Math.abs(prev.max - finalRoll)
      );
      const currDistance = Math.min(
        Math.abs(curr.min - finalRoll),
        Math.abs(curr.max - finalRoll)
      );
      return currDistance < prevDistance ? curr : prev;
    });

    logTable.info(`Using closest entry: ${JSON.stringify(closest.result)}`);

    return {
      result: closest.result,
      entry: closest,
      roll: diceRoll.result - totalModifier, // Original roll without modifiers
      modifiers,
      finalRoll,
    };
  }

  logTable.info(
    `Table roll: ${finalRoll} -> ${JSON.stringify(matchingEntry.result)}`
  );

  return {
    result: matchingEntry.result,
    entry: matchingEntry,
    roll: diceRoll.result - totalModifier, // Original roll without modifiers
    modifiers,
    finalRoll,
  };
}

/**
 * Roll on a weighted table (entries with weight property)
 */
export function rollOnWeightedTable<T>(entries: WeightedEntry<T>[]): T {
  if (!entries || entries.length === 0) {
    throw new Error("Weighted table is empty");
  }

  const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0);
  if (totalWeight <= 0) {
    throw new Error("Total weight must be greater than 0");
  }

  const random = Math.random() * totalWeight;
  let currentWeight = 0;

  for (const entry of entries) {
    currentWeight += entry.weight;
    if (random <= currentWeight) {
      logTable.info(
        `Weighted roll: ${entry.result} (weight: ${entry.weight}/${totalWeight})`
      );
      return entry.result;
    }
  }

  // Fallback (should never reach here with valid weights)
  return entries[entries.length - 1].result;
}

/**
 * Validate table structure
 */
export function validateTable<T>(table: TableEntry<T>[]): TableValidation {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!table || table.length === 0) {
    errors.push("Table is empty");
    return { isValid: false, errors, warnings };
  }

  // Create a map to track original indices for better error reporting
  const entryIndices = new Map<TableEntry<T>, number>();
  table.forEach((entry, index) => {
    entryIndices.set(entry, index);
  });

  // Check for valid min/max values
  for (let i = 0; i < table.length; i++) {
    const entry = table[i];

    if (typeof entry.min !== "number" || typeof entry.max !== "number") {
      errors.push(`Entry ${i}: min and max must be numbers`);
      continue;
    }

    if (entry.min > entry.max) {
      errors.push(
        `Entry ${i}: min (${entry.min}) cannot be greater than max (${entry.max})`
      );
    }

    if (entry.min < 1) {
      warnings.push(`Entry ${i}: min value (${entry.min}) is less than 1`);
    }
  }

  // Sort entries by min value for efficient overlap/gap detection
  const sortedEntries = [...table].sort((a, b) => a.min - b.min);

  // Single pass to detect overlaps and gaps
  for (let i = 0; i < sortedEntries.length - 1; i++) {
    const current = sortedEntries[i];
    const next = sortedEntries[i + 1];
    const currentIndex = entryIndices.get(current)!;
    const nextIndex = entryIndices.get(next)!;

    // Check for overlaps
    if (current.max >= next.min) {
      errors.push(
        `Overlap between entries ${currentIndex} and ${nextIndex}: [${current.min}-${current.max}] and [${next.min}-${next.max}]`
      );
    }

    // Check for gaps
    if (current.max + 1 < next.min) {
      warnings.push(
        `Gap between entries ${currentIndex} and ${nextIndex}: ${current.max + 1} to ${next.min - 1}`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Create a complete table with validation and metadata
 */
export function createTable<T>(
  entries: TableEntry<T>[],
  metadata: TableMetadata = {}
): CompleteTable<T> {
  const validation = validateTable(entries);

  return {
    entries,
    metadata,
    validation,
  };
}

/**
 * Parse dice notation to extract maximum range
 */
function getDiceMaxRange(diceNotation: string): number {
  if (diceNotation.includes("d100")) {
    return DICE_THRESHOLDS.D100_MAX;
  } else if (diceNotation.includes("d20")) {
    return DICE_THRESHOLDS.D20_MAX;
  } else if (diceNotation.includes("d12")) {
    return DICE_THRESHOLDS.D12_MAX;
  } else if (diceNotation.includes("d10")) {
    return DICE_THRESHOLDS.D10_MAX;
  } else if (diceNotation.includes("d8")) {
    return DICE_THRESHOLDS.D8_MAX;
  } else if (diceNotation.includes("d6")) {
    return DICE_THRESHOLDS.D6_MAX;
  } else {
    return DICE_THRESHOLDS.D100_MAX; // Default fallback
  }
}

/**
 * Generate table from weighted entries (automatically assigns ranges)
 */
export function generateTableFromWeights<T>(
  weightedEntries: WeightedEntry<T>[],
  diceNotation = DICE_NOTATIONS.D100
): TableEntry<T>[] {
  if (!weightedEntries || weightedEntries.length === 0) {
    throw new Error("No weighted entries provided");
  }

  const totalWeight = weightedEntries.reduce(
    (sum, entry) => sum + entry.weight,
    0
  );

  // Determine the range based on dice notation
  const maxRange = getDiceMaxRange(diceNotation);

  const entries: TableEntry<T>[] = [];
  let currentMin = 1;

  for (const weightedEntry of weightedEntries) {
    const range = Math.round((weightedEntry.weight / totalWeight) * maxRange);
    const currentMax = Math.min(currentMin + range - 1, maxRange);

    entries.push({
      min: currentMin,
      max: currentMax,
      result: weightedEntry.result,
      weight: weightedEntry.weight,
      description: weightedEntry.description,
    });

    currentMin = currentMax + 1;
  }

  // Ensure the last entry reaches the maximum
  if (entries.length > 0) {
    entries[entries.length - 1].max = maxRange;
  }

  return entries;
}

/**
 * Merge multiple modifiers into a single value
 */
export function calculateModifiers(modifiers: RollModifier[]): number {
  return modifiers.reduce((total, modifier) => total + modifier.value, 0);
}

/**
 * Get table statistics (range, coverage, etc.)
 */
export function getTableStats<T>(table: TableEntry<T>[]): {
  minValue: number;
  maxValue: number;
  totalEntries: number;
  coverage: number;
  gaps: Array<{ start: number; end: number }>;
} {
  if (!table || table.length === 0) {
    return {
      minValue: 0,
      maxValue: 0,
      totalEntries: 0,
      coverage: 0,
      gaps: [],
    };
  }

  const minValue = Math.min(...table.map((entry) => entry.min));
  const maxValue = Math.max(...table.map((entry) => entry.max));
  const totalRange = maxValue - minValue + 1;

  // Calculate covered values
  const coveredValues = new Set<number>();
  table.forEach((entry) => {
    for (let i = entry.min; i <= entry.max; i++) {
      coveredValues.add(i);
    }
  });

  // Find gaps
  const gaps: Array<{ start: number; end: number }> = [];
  let gapStart: number | null = null;

  for (let i = minValue; i <= maxValue; i++) {
    if (!coveredValues.has(i)) {
      if (gapStart === null) {
        gapStart = i;
      }
    } else {
      if (gapStart !== null) {
        gaps.push({ start: gapStart, end: i - 1 });
        gapStart = null;
      }
    }
  }

  // Close final gap if exists
  if (gapStart !== null) {
    gaps.push({ start: gapStart, end: maxValue });
  }

  return {
    minValue,
    maxValue,
    totalEntries: table.length,
    coverage: coveredValues.size / totalRange,
    gaps,
  };
}
