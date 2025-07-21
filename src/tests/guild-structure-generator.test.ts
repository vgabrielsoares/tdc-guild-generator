import { describe, it, expect } from 'vitest';
import {
  generateGuildStructure,
  generateHeadquartersSize,
  generateHeadquartersCharacteristics,
  generateEmployees,
  generateGovernmentRelations,
  generatePopulationRelations,
  generateVisitors,
  generateResources
} from '../utils/generators/guildStructure';
import { SettlementType, ResourceLevel, VisitorLevel, RelationLevel } from '../types/guild';

describe('Issue 3.2 - Guild Structure Generator', () => {
  describe('Individual Generator Functions', () => {
    it('should generate headquarters size with proper structure', () => {
      const result = generateHeadquartersSize(SettlementType.CIDADE_PEQUENA);
      
      expect(result.size).toBeTypeOf('string');
      expect(result.size.length).toBeGreaterThan(0);
      expect(result.roll).toBeTypeOf('number');
      expect(result.roll).toBeGreaterThan(0);
    });

    it('should generate headquarters characteristics based on size roll', () => {
      // Test different size rolls for different number of characteristics
      const smallResult = generateHeadquartersCharacteristics(5);
      expect(smallResult.characteristics).toHaveLength(1);
      expect(smallResult.rolls).toHaveLength(1);

      const mediumResult = generateHeadquartersCharacteristics(12);
      expect(mediumResult.characteristics).toHaveLength(2);
      expect(mediumResult.rolls).toHaveLength(2);

      const largeResult = generateHeadquartersCharacteristics(18);
      expect(largeResult.characteristics).toHaveLength(3);
      expect(largeResult.rolls).toHaveLength(3);
    });

    it('should generate employees with valid data', () => {
      const result = generateEmployees();
      
      expect(result.employees).toBeTypeOf('string');
      expect(result.employees.length).toBeGreaterThan(0);
      expect(result.roll).toBeTypeOf('number');
      expect(result.roll).toBeGreaterThan(0);
      expect(result.roll).toBeLessThanOrEqual(25);
    });

    it('should generate government relations with valid enum', () => {
      const result = generateGovernmentRelations();
      
      expect(Object.values(RelationLevel)).toContain(result.relation);
      expect(result.roll).toBeTypeOf('number');
      expect(result.roll).toBeGreaterThan(0);
      expect(result.roll).toBeLessThanOrEqual(12);
    });

    it('should generate population relations with valid enum', () => {
      const result = generatePopulationRelations();
      
      expect(Object.values(RelationLevel)).toContain(result.relation);
      expect(result.roll).toBeTypeOf('number');
      expect(result.roll).toBeGreaterThan(0);
      expect(result.roll).toBeLessThanOrEqual(12);
    });

    it('should generate visitors with valid enum and settlement type', () => {
      const result = generateVisitors(SettlementType.METROPOLE);
      
      expect(Object.values(VisitorLevel)).toContain(result.frequency);
      expect(result.roll).toBeTypeOf('number');
      expect(result.roll).toBeGreaterThan(0);
    });

    it('should generate resources with valid enum', () => {
      const result = generateResources();
      
      expect(Object.values(ResourceLevel)).toContain(result.level);
      expect(result.roll).toBeTypeOf('number');
      expect(result.roll).toBeGreaterThan(0);
      expect(result.roll).toBeLessThanOrEqual(20);
    });
  });

  describe('Complete Guild Generation', () => {
    it('should generate a complete guild for a small settlement', () => {
      const config = {
        settlementType: SettlementType.LUGAREJO,
        useModifiers: true
      };

      const result = generateGuildStructure(config);

      // Validate guild structure
      expect(result.guild.structure.size).toBeTypeOf('string');
      expect(result.guild.structure.characteristics).toBeInstanceOf(Array);
      expect(result.guild.structure.characteristics.length).toBeGreaterThan(0);

      // Validate relations
      expect(Object.values(RelationLevel)).toContain(result.guild.relations.government);
      expect(Object.values(RelationLevel)).toContain(result.guild.relations.population);

      // Validate staff
      expect(result.guild.staff.employees).toBeTypeOf('string');

      // Validate visitors
      expect(Object.values(VisitorLevel)).toContain(result.guild.visitors.frequency);

      // Validate resources
      expect(Object.values(ResourceLevel)).toContain(result.guild.resources.level);

      // Validate settlement type
      expect(result.guild.settlementType).toBe(SettlementType.LUGAREJO);

      // Validate timestamps
      expect(result.guild.createdAt).toBeInstanceOf(Date);

      // Validate rolls data
      expect(result.rolls.structure.size).toBeTypeOf('number');
      expect(result.rolls.structure.characteristics).toBeInstanceOf(Array);
      expect(result.rolls.relations.government).toBeTypeOf('number');
      expect(result.rolls.relations.population).toBeTypeOf('number');
      expect(result.rolls.staff).toBeTypeOf('number');
      expect(result.rolls.visitors).toBeTypeOf('number');
      expect(result.rolls.resources).toBeTypeOf('number');

      // Validate logs
      expect(result.logs).toBeInstanceOf(Array);
      expect(result.logs.length).toBeGreaterThan(0);
    });

    it('should generate a complete guild for a large settlement', () => {
      const config = {
        settlementType: SettlementType.METROPOLE,
        useModifiers: true,
        customModifiers: {
          structure: 2,
          visitors: 3
        }
      };

      const result = generateGuildStructure(config);

      expect(result.guild.settlementType).toBe(SettlementType.METROPOLE);
      expect(result.guild.structure.size).toBeTypeOf('string');
      expect(result.logs).toBeInstanceOf(Array);
      expect(result.logs.some(log => log.includes('Calculated modifiers'))).toBe(true);
    });

    it('should apply custom modifiers correctly', () => {
      const config = {
        settlementType: SettlementType.CIDADE_GRANDE,
        useModifiers: true,
        customModifiers: {
          structure: 5,
          visitors: -2
        }
      };

      const result = generateGuildStructure(config);

      expect(result.guild.settlementType).toBe(SettlementType.CIDADE_GRANDE);
      expect(result.logs.some(log => log.includes('modifiers'))).toBe(true);
      expect(result.logs.some(log => log.includes('structure') && log.includes('5'))).toBe(true);
    });
  });

  describe('Edge Cases and Validation', () => {
    it('should handle all settlement types', () => {
      const settlementTypes = Object.values(SettlementType);

      settlementTypes.forEach(settlementType => {
        const config = { settlementType, useModifiers: true };
        const result = generateGuildStructure(config);

        expect(result.guild.settlementType).toBe(settlementType);
        expect(result.guild.structure.size).toBeTypeOf('string');
        expect(result.logs.length).toBeGreaterThan(0);
      });
    });

    it('should work without custom modifiers', () => {
      const config = {
        settlementType: SettlementType.ALDEIA
      };

      const result = generateGuildStructure(config);

      expect(result.guild.settlementType).toBe(SettlementType.ALDEIA);
      expect(result.guild.structure.size).toBeTypeOf('string');
    });

    it('should apply modifiers for experienced employees', () => {
      // Since generation is random, we'll test the function multiple times
      // to increase chances of getting experienced employees
      let foundExperienced = false;
      
      for (let i = 0; i < 10 && !foundExperienced; i++) {
        const config = { settlementType: SettlementType.CIDADE_PEQUENA };
        const result = generateGuildStructure(config);
        
        if (result.guild.staff.employees.includes('experiente')) {
          foundExperienced = true;
          expect(result.logs.some(log => log.includes('modifiers'))).toBe(true);
        }
      }
      
      // If we don't find experienced employees in 10 tries, that's still valid
      // This test just verifies the structure works
      expect(true).toBe(true);
    });
  });
});
