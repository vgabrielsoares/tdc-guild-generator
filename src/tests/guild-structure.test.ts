import { describe, it, expect } from 'vitest';
import {
  HEADQUARTERS_SIZE_TABLE,
  HEADQUARTERS_CHARACTERISTICS_TABLE,
  EMPLOYEES_TABLE,
  VISITORS_FREQUENCY_TABLE,
  GOVERNMENT_RELATIONS_TABLE,
  POPULATION_RELATIONS_TABLE,
  RESOURCES_LEVEL_TABLE,
  HEADQUARTERS_EXISTENCE_TABLE,
  SETTLEMENT_DICE
} from '../data/tables/guild-structure';
import { rollOnTable } from '../utils/tableRoller';

describe('Guild Structure Tables', () => {
  describe('Headquarters Tables', () => {
    it('should roll on headquarters size table', () => {
      const result = rollOnTable(HEADQUARTERS_SIZE_TABLE);
      expect(result).toBeDefined();
      expect(typeof result.result).toBe('string');
    });

    it('should roll on headquarters characteristics table', () => {
      const result = rollOnTable(HEADQUARTERS_CHARACTERISTICS_TABLE);
      expect(result).toBeDefined();
      expect(typeof result.result).toBe('string');
    });
  });

  describe('Employees Table', () => {
    it('should roll on employees table', () => {
      const result = rollOnTable(EMPLOYEES_TABLE);
      expect(result).toBeDefined();
      expect(typeof result.result).toBe('string');
      expect(result.result).toMatch(/funcionário|membro|nobre|aventureiro|explorador|animal|ex-/);
    });

    it('should handle special result for 23 (dragon disguised)', () => {
      // This would need to be handled by the generator logic
      expect(EMPLOYEES_TABLE.find(entry => entry.min <= 23 && entry.max >= 23)).toBeDefined();
    });
  });

  describe('Visitors Frequency Table', () => {
    it('should roll on visitors frequency table', () => {
      const result = rollOnTable(VISITORS_FREQUENCY_TABLE);
      expect(result).toBeDefined();
      expect(typeof result.result).toBe('string');
      expect(['Vazia', 'Quase deserta', 'Pouco movimentada', 'Nem muito nem pouco', 'Muito frequentada', 'Abarrotada', 'Lotada'])
        .toContain(result.result);
    });
  });

  describe('Relations Tables', () => {
    it('should roll on government relations table', () => {
      const result = rollOnTable(GOVERNMENT_RELATIONS_TABLE);
      expect(result).toBeDefined();
      expect(typeof result.result).toBe('string');
    });

    it('should roll on population relations table', () => {
      const result = rollOnTable(POPULATION_RELATIONS_TABLE);
      expect(result).toBeDefined();
      expect(typeof result.result).toBe('string');
    });
  });

  describe('Resources Table', () => {
    it('should roll on resources table', () => {
      const result = rollOnTable(RESOURCES_LEVEL_TABLE);
      expect(result).toBeDefined();
      expect(typeof result.result).toBe('string');
    });
  });

  describe('Settlement Dice Configuration', () => {
    it('should have proper dice configuration for structure', () => {
      expect(SETTLEMENT_DICE.structure).toBeDefined();
      expect(SETTLEMENT_DICE.structure['Lugarejo']).toEqual({ dice: 'd8', modifier: 0 });
      expect(SETTLEMENT_DICE.structure['Metrópole']).toEqual({ dice: 'd20', modifier: 8 });
    });

    it('should have proper dice configuration for visitors', () => {
      expect(SETTLEMENT_DICE.visitors).toBeDefined();
      expect(SETTLEMENT_DICE.visitors['Lugarejo']).toEqual({ dice: 'd8', modifier: 0 });
      expect(SETTLEMENT_DICE.visitors['Metrópole']).toEqual({ dice: 'd20', modifier: 5 });
    });
  });

  describe('Headquarters Existence Table', () => {
    it('should have human settlement rules', () => {
      expect(HEADQUARTERS_EXISTENCE_TABLE.human).toBeDefined();
      expect(HEADQUARTERS_EXISTENCE_TABLE.human.length).toBe(3);
      expect(HEADQUARTERS_EXISTENCE_TABLE.human[2].value).toBe('Sede matriz');
    });

    it('should have other settlement rules', () => {
      expect(HEADQUARTERS_EXISTENCE_TABLE.other).toBeDefined();
      expect(HEADQUARTERS_EXISTENCE_TABLE.other.length).toBe(2);
    });
  });

  describe('Table Coverage', () => {
    it('should cover all required ranges in headquarters size table', () => {
      const minValue = Math.min(...HEADQUARTERS_SIZE_TABLE.map(e => e.min));
      const maxValue = Math.max(...HEADQUARTERS_SIZE_TABLE.map(e => e.max));
      expect(minValue).toBe(1);
      expect(maxValue).toBeGreaterThanOrEqual(21); // supports 21+ results
    });

    it('should cover all required ranges in employees table', () => {
      const minValue = Math.min(...EMPLOYEES_TABLE.map(e => e.min));
      const maxValue = Math.max(...EMPLOYEES_TABLE.map(e => e.max));
      expect(minValue).toBe(1);
      expect(maxValue).toBeGreaterThanOrEqual(21);
    });
  });
});
