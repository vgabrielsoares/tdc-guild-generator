import type {
  DiceRoll,
  DiceValidation,
  RollConfig,
  TableRoll,
  TableRollConfig,
  RollLog,
  DiceResult,
} from "@/types/dice";

// Dice roll logs for debugging and history
const rollLogs: RollLog[] = [];

/**
 * Parse dice notation (e.g., "1d20", "2d6+3", "1d20+5", "3d8-2")
 * Supports: XdY, XdY+Z, XdY-Z
 */
export function parseDiceNotation(notation: string): DiceValidation {
  const cleanNotation = notation.trim().toLowerCase();

  // Regex for dice notation: optional count, d, sides, optional modifier
  const diceRegex = /^(\d+)?d(\d+)([+-]\d+)?$/;
  const match = cleanNotation.match(diceRegex);

  if (!match) {
    return {
      isValid: false,
      error: `Invalid dice notation: ${notation}. Use format like "1d20", "2d6+3", "1d8-1"`,
    };
  }

  const count = parseInt(match[1] || "1");
  const sides = parseInt(match[2]);
  const modifierStr = match[3] || "+0";
  const modifier = parseInt(modifierStr);

  // Validation
  if (count < 1 || count > 100) {
    return {
      isValid: false,
      error: `Invalid dice count: ${count}. Must be between 1 and 100`,
    };
  }

  if (sides < 2 || sides > 1000) {
    return {
      isValid: false,
      error: `Invalid dice sides: ${sides}. Must be between 2 and 1000`,
    };
  }

  if (modifier < -1000 || modifier > 1000) {
    return {
      isValid: false,
      error: `Invalid modifier: ${modifier}. Must be between -1000 and 1000`,
    };
  }

  return {
    isValid: true,
    parsed: {
      count,
      sides,
      modifier,
    },
  };
}

/**
 * Roll a single die with given number of sides
 */
export function rollSingleDie(sides: number): number {
  return Math.floor(Math.random() * sides) + 1;
}

/**
 * Roll dice with given notation
 */
export function rollDice(config: RollConfig): DiceRoll {
  const validation = parseDiceNotation(config.notation);

  if (!validation.isValid || !validation.parsed) {
    throw new Error(validation.error || "Invalid dice notation");
  }

  const { count, sides, modifier } = validation.parsed;
  const individual: number[] = [];

  // Handle advantage/disadvantage for single dice
  if ((config.advantage || config.disadvantage) && count === 1) {
    const roll1 = rollSingleDie(sides);
    const roll2 = rollSingleDie(sides);

    if (config.advantage) {
      individual.push(Math.max(roll1, roll2));
      console.log(
        `[DICE] Advantage roll: ${roll1}, ${roll2} -> took ${Math.max(roll1, roll2)}`
      );
    } else if (config.disadvantage) {
      individual.push(Math.min(roll1, roll2));
      console.log(
        `[DICE] Disadvantage roll: ${roll1}, ${roll2} -> took ${Math.min(roll1, roll2)}`
      );
    }
  } else {
    // Normal rolls
    for (let i = 0; i < count; i++) {
      individual.push(rollSingleDie(sides));
    }
  }

  const total = individual.reduce((sum, roll) => sum + roll, 0);
  const result = total + modifier;

  const diceRoll: DiceRoll = {
    notation: config.notation,
    result,
    individual: [...individual],
    modifier,
    timestamp: new Date(),
  };

  // Log the roll
  if (config.logRoll !== false) {
    logRoll(diceRoll, config.context);
  }

  console.log(
    `[DICE] Rolling ${config.notation}${config.context ? ` (${config.context})` : ""}: [${individual.join(", ")}] + ${modifier} = ${result}`
  );

  return diceRoll;
}

/**
 * Simple dice roll function (backward compatibility)
 */
export function rollDiceSimple(notation: string, context?: string): DiceResult {
  const diceRoll = rollDice({ notation, logRoll: false, context });
  return {
    total: diceRoll.result,
    rolls: diceRoll.individual,
    modifier: diceRoll.modifier,
    notation,
  };
}

interface TableEntry<T = unknown> {
  min: number;
  max: number;
  result: T;
}

const tableLookupCache = new Map<string, Map<number, TableEntry>>();

/**
 * Create an optimized lookup map for a table
 * Uses a Map for O(1) average case lookup instead of O(n) array find
 */
function createTableLookupMap<T>(
  table: TableEntry<T>[]
): Map<number, TableEntry<T>> {
  const lookupMap = new Map<number, TableEntry<T>>();

  for (const entry of table) {
    // Map each possible roll value to its corresponding entry
    for (let value = entry.min; value <= entry.max; value++) {
      lookupMap.set(value, entry);
    }
  }

  return lookupMap;
}

/**
 * Get cached lookup map or create new one
 */
function getTableLookupMap<T>(
  table: TableEntry<T>[],
  cacheKey?: string
): Map<number, TableEntry<T>> {
  if (cacheKey && tableLookupCache.has(cacheKey)) {
    return tableLookupCache.get(cacheKey)! as Map<number, TableEntry<T>>;
  }

  const lookupMap = createTableLookupMap(table);

  if (cacheKey) {
    tableLookupCache.set(cacheKey, lookupMap as Map<number, TableEntry>);
  }

  return lookupMap;
}

/**
 * Binary search for table entry (for very large sparse tables)
 */
function binarySearchTable<T>(
  table: TableEntry<T>[],
  value: number
): TableEntry<T> | null {
  // Sort table by min value if not already sorted
  const sortedTable = [...table].sort((a, b) => a.min - b.min);

  let left = 0;
  let right = sortedTable.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const entry = sortedTable[mid];

    if (value >= entry.min && value <= entry.max) {
      return entry;
    } else if (value < entry.min) {
      right = mid - 1;
    } else {
      left = mid + 1;
    }
  }

  return null;
}

/**
 * Roll on a table using dice - optimized for performance
 */
export function rollOnTable<T>(config: TableRollConfig<T>): TableRoll<T> {
  const { table, modifier = 0, context, logRoll = true } = config;

  if (!table || table.length === 0) {
    throw new Error("Table is empty or undefined");
  }

  // Determine dice notation based on table range
  const maxValue = Math.max(...table.map((entry) => entry.max));
  const minValue = Math.min(...table.map((entry) => entry.min));

  let diceNotation: string;

  // Auto-determine dice based on range
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
    // For larger tables, use multiple dice
    diceNotation = "2d20";
  }

  if (modifier !== 0) {
    diceNotation += modifier > 0 ? `+${modifier}` : `${modifier}`;
  }

  const roll = rollDice({
    notation: diceNotation,
    context: context ? `Table: ${context}` : "Table roll",
    logRoll,
  });

  // Choose lookup strategy based on table characteristics
  let tableEntry: TableEntry<T> | null = null;

  const tableRange = maxValue - minValue + 1;
  const tableSize = table.length;
  const density = tableSize / tableRange; // How dense is the table

  if (tableSize >= 50) {
    // Use binary search for large tables regardless of density
    tableEntry = binarySearchTable(table, roll.result);
  } else if (density >= 0.1 && tableSize >= 10 && tableRange <= 1000) {
    // Use Map lookup for dense tables
    const cacheKey = context || `table-${tableSize}-${minValue}-${maxValue}`;
    const lookupMap = getTableLookupMap(table, cacheKey);
    tableEntry = lookupMap.get(roll.result) || null;
  } else {
    // Use linear search for small or very sparse tables
    tableEntry =
      table.find(
        (entry) => roll.result >= entry.min && roll.result <= entry.max
      ) || null;
  }

  if (!tableEntry) {
    console.warn(
      `[TABLE] No table entry found for roll ${roll.result} (range: ${minValue}-${maxValue})`
    );
    // Return first entry as fallback
    return {
      roll,
      result: table[0].result,
      tableEntry: table[0],
    };
  }

  console.log(
    `[TABLE] Table roll: ${roll.result} -> ${JSON.stringify(tableEntry.result)}`
  );

  return {
    roll,
    result: tableEntry.result,
    tableEntry,
  };
}

/**
 * Log a roll for debugging and history
 */
export function logRoll(roll: DiceRoll, context?: string): void {
  const log: RollLog = {
    id: `roll-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    notation: roll.notation,
    result: roll.result,
    timestamp: roll.timestamp,
    context,
    individual: roll.individual,
    modifier: roll.modifier,
  };

  rollLogs.push(log);

  // Keep only last 100 rolls to prevent memory issues
  if (rollLogs.length > 100) {
    rollLogs.splice(0, rollLogs.length - 100);
  }
}

/**
 * Get roll history
 */
export function getRollHistory(limit = 20): RollLog[] {
  return rollLogs.slice(-limit).reverse();
}

/**
 * Clear roll history
 */
export function clearRollHistory(): void {
  rollLogs.length = 0;
  console.log("[DICE] Cleared roll history");
}

/**
 * Clear table lookup cache to free memory
 */
export function clearTableCache(): void {
  tableLookupCache.clear();
}

/**
 * Get cache statistics for debugging
 */
export function getCacheStats(): { cacheSize: number; totalEntries: number } {
  let totalEntries = 0;
  for (const cache of tableLookupCache.values()) {
    totalEntries += cache.size;
  }

  return {
    cacheSize: tableLookupCache.size,
    totalEntries,
  };
}

/**
 * Advanced dice rolling with multiple options
 */
export function rollAdvanced(
  notation: string,
  options: {
    advantage?: boolean;
    disadvantage?: boolean;
    rerollOnes?: boolean;
    exploding?: boolean;
    dropLowest?: boolean;
    dropHighest?: boolean;
    context?: string;
  } = {}
): DiceRoll {
  const config: RollConfig = {
    notation,
    context: options.context,
    advantage: options.advantage,
    disadvantage: options.disadvantage,
  };

  const result = rollDice(config);

  // Reroll ones
  if (options.rerollOnes) {
    const rerolled: number[] = [];
    for (let i = 0; i < result.individual.length; i++) {
      if (result.individual[i] === 1) {
        const newRoll = rollSingleDie(
          parseDiceNotation(notation).parsed!.sides
        );
        rerolled.push(newRoll);
        console.log(`[DICE] Rerolled 1 -> ${newRoll}`);
      } else {
        rerolled.push(result.individual[i]);
      }
    }
    result.individual = rerolled;
    result.result =
      rerolled.reduce((sum, roll) => sum + roll, 0) + result.modifier;
  }

  // Exploding dice (roll again on max)
  if (options.exploding) {
    const sides = parseDiceNotation(notation).parsed!.sides;
    const exploded: number[] = [...result.individual];

    for (let i = 0; i < exploded.length; i++) {
      if (exploded[i] === sides) {
        const extraRoll = rollSingleDie(sides);
        exploded.push(extraRoll);
        console.log(`[DICE] Exploding dice: ${sides} -> +${extraRoll}`);
      }
    }

    result.individual = exploded;
    result.result =
      exploded.reduce((sum, roll) => sum + roll, 0) + result.modifier;
  }

  // Drop lowest/highest
  if (options.dropLowest && result.individual.length > 1) {
    const sorted = [...result.individual].sort((a, b) => a - b);
    sorted.shift(); // Remove lowest
    result.individual = sorted;
    result.result =
      sorted.reduce((sum, roll) => sum + roll, 0) + result.modifier;
    console.log(`[DICE] Dropped lowest roll`);
  }

  if (options.dropHighest && result.individual.length > 1) {
    const sorted = [...result.individual].sort((a, b) => b - a);
    sorted.shift(); // Remove highest
    result.individual = sorted;
    result.result =
      sorted.reduce((sum, roll) => sum + roll, 0) + result.modifier;
    console.log(`[DICE] Dropped highest roll`);
  }

  return result;
}

// Export for testing and debugging
export { rollLogs };
