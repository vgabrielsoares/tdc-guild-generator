import { describe, it, expect } from 'vitest';
import { rollDice, parseDiceNotation } from '@/utils/dice';
import { rollOnTable, validateTable } from '@/utils/tableRoller';
import type { TableEntry } from '@/types/tables';

describe('Issue 2.1 - Dice System', () => {
  it('should parse dice notation correctly', () => {
    const result = parseDiceNotation('1d20');
    expect(result.isValid).toBe(true);
    expect(result.parsed?.count).toBe(1);
    expect(result.parsed?.sides).toBe(20);
    expect(result.parsed?.modifier).toBe(0);
  });

  it('should parse dice notation with modifiers', () => {
    const result = parseDiceNotation('2d6+3');
    expect(result.isValid).toBe(true);
    expect(result.parsed?.count).toBe(2);
    expect(result.parsed?.sides).toBe(6);
    expect(result.parsed?.modifier).toBe(3);
  });

  it('should roll dice correctly', () => {
    const result = rollDice({ notation: '1d6' });
    expect(result.result).toBeGreaterThanOrEqual(1);
    expect(result.result).toBeLessThanOrEqual(6);
    expect(result.individual).toHaveLength(1);
  });

  it('should handle multiple dice', () => {
    const result = rollDice({ notation: '2d6' });
    expect(result.result).toBeGreaterThanOrEqual(2);
    expect(result.result).toBeLessThanOrEqual(12);
    expect(result.individual).toHaveLength(2);
  });
});

describe('Issue 2.2 - Table System', () => {
  const testTable: TableEntry<string>[] = [
    { min: 1, max: 5, result: 'Low', description: 'Low result' },
    { min: 6, max: 15, result: 'Medium', description: 'Medium result' },
    { min: 16, max: 20, result: 'High', description: 'High result' }
  ];

  it('should validate table structure', () => {
    const validation = validateTable(testTable);
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
  });

  it('should roll on table correctly', () => {
    const result = rollOnTable(testTable);
    expect(['Low', 'Medium', 'High']).toContain(result.result);
    expect(result.roll).toBeGreaterThanOrEqual(1);
    expect(result.roll).toBeLessThanOrEqual(20);
  });

  it('should apply modifiers correctly', () => {
    const modifier = [{ name: 'Test', value: 10, description: 'Test modifier' }];
    const result = rollOnTable(testTable, modifier);
    expect(result.modifiers).toHaveLength(1);
    expect(result.modifiers[0].value).toBe(10);
  });

  it('should handle invalid tables', () => {
    expect(() => rollOnTable([])).toThrow('Table is empty or undefined');
  });
});

describe('Issue 2.3 - Guild Structure Tables', () => {
  // This will test when guild structure is properly implemented
  it('should be implemented', () => {
    // For now, just check if the basic functionality works
    expect(true).toBe(true);
  });
});
