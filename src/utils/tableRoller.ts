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

  // Determine appropriate dice notation
  let diceNotation: string;
  if (maxValue <= 6) {
    diceNotation = "1d6";
  } else if (maxValue <= 8) {
    diceNotation = "1d8";
  } else if (maxValue <= 10) {
    diceNotation = "1d10";
  } else if (maxValue <= 12) {
    diceNotation = "1d12";
  } else if (maxValue <= 20) {
    diceNotation = "1d20";
  } else if (maxValue <= 100) {
    diceNotation = "1d100";
  } else {
    // For larger ranges, calculate appropriate dice
    const range = maxValue - minValue + 1;
    if (range <= 36) {
      diceNotation = "2d6";
    } else {
      diceNotation = "2d20";
    }
  }

  // Add modifier to dice notation if present
  if (totalModifier !== 0) {
    diceNotation +=
      totalModifier > 0 ? `+${totalModifier}` : `${totalModifier}`;
  }

  // Roll the dice
  const diceRoll = rollDice({
    notation: diceNotation,
    context: "Table roll",
    logRoll: true,
  });

  const finalRoll = diceRoll.result;

  // Find the matching table entry
  const matchingEntry = table.find(
    (entry) => finalRoll >= entry.min && finalRoll <= entry.max
  );

  if (!matchingEntry) {
    console.warn(
      `[TABLE ROLLER] No table entry found for roll ${finalRoll} (range: ${minValue}-${maxValue})`
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

    console.log(
      `[TABLE ROLLER] Using closest entry: ${JSON.stringify(closest.result)}`
    );

    return {
      result: closest.result,
      entry: closest,
      roll: diceRoll.result - totalModifier, // Original roll without modifiers
      modifiers,
      finalRoll,
    };
  }

  console.log(
    `[TABLE ROLLER] Table roll: ${finalRoll} -> ${JSON.stringify(matchingEntry.result)}`
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
      console.log(
        `[TABLE ROLLER] Weighted roll: ${entry.result} (weight: ${entry.weight}/${totalWeight})`
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

  // Check for gaps and overlaps
  const sortedEntries = [...table].sort((a, b) => a.min - b.min);

  for (let i = 0; i < sortedEntries.length - 1; i++) {
    const current = sortedEntries[i];
    const next = sortedEntries[i + 1];

    // Check for overlaps
    if (current.max >= next.min) {
      errors.push(
        `Overlap between entries: [${current.min}-${current.max}] and [${next.min}-${next.max}]`
      );
    }

    // Check for gaps
    if (current.max + 1 < next.min) {
      warnings.push(
        `Gap between entries: ${current.max + 1} to ${next.min - 1}`
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
 * Generate table from weighted entries (automatically assigns ranges)
 */
export function generateTableFromWeights<T>(
  weightedEntries: WeightedEntry<T>[],
  diceNotation = "1d100"
): TableEntry<T>[] {
  if (!weightedEntries || weightedEntries.length === 0) {
    throw new Error("No weighted entries provided");
  }

  const totalWeight = weightedEntries.reduce(
    (sum, entry) => sum + entry.weight,
    0
  );

  // Determine the range based on dice notation (simplified)
  const maxRange = diceNotation.includes("d100")
    ? 100
    : diceNotation.includes("d20")
      ? 20
      : diceNotation.includes("d12")
        ? 12
        : diceNotation.includes("d10")
          ? 10
          : diceNotation.includes("d8")
            ? 8
            : diceNotation.includes("d6")
              ? 6
              : 100;

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
