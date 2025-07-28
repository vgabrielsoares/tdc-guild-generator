import { describe, it, expect } from 'vitest';
import { 
  RESOURCES_LEVEL_TABLE, 
  VISITORS_FREQUENCY_TABLE,
  SETTLEMENT_DICE
} from '@/data/tables/guild-structure';
import { findTableEntry } from '@/utils/table-operations';

describe('Unified Table System', () => {
  describe('Resources Level Table', () => {
    it('should have complete range from -20 to 50', () => {
      // Test boundary cases
      const minEntry = findTableEntry(RESOURCES_LEVEL_TABLE, -20);
      expect(minEntry).toBe('Em débito');
      
      const maxEntry = findTableEntry(RESOURCES_LEVEL_TABLE, 50);
      expect(maxEntry).toBe('Abundantes vindos de muitos anos de serviço');
      
      // Test middle values
      const neutralEntry = findTableEntry(RESOURCES_LEVEL_TABLE, 15);
      expect(neutralEntry).toBe('Suficientes');
      
      // Test out of bounds
      const belowMin = findTableEntry(RESOURCES_LEVEL_TABLE, -25);
      expect(belowMin).toBeNull();
      
      const aboveMax = findTableEntry(RESOURCES_LEVEL_TABLE, 55);
      expect(aboveMax).toBeNull();
    });

    it('should cover all possible settlement dice results', () => {
      // D8 settlements can roll 1-8, which maps to different ranges
      const d8Results = [1, 2, 3, 4, 5, 6, 7, 8];
      d8Results.forEach(roll => {
        const entry = findTableEntry(RESOURCES_LEVEL_TABLE, roll);
        expect(entry).toBeDefined();
      });

      // D12 settlements can roll 1-12
      const d12Results = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
      d12Results.forEach(roll => {
        const entry = findTableEntry(RESOURCES_LEVEL_TABLE, roll);
        expect(entry).toBeDefined();
      });

      // D20 settlements can roll 1-20, but often with modifiers
      const d20Results = [1, 5, 10, 15, 20, 25, 30]; // Sample values
      d20Results.forEach(roll => {
        const entry = findTableEntry(RESOURCES_LEVEL_TABLE, roll);
        expect(entry).toBeDefined();
      });
    });
  });

  describe('Visitors Frequency Table', () => {
    it('should have complete range from 1 to 20', () => {
      // Test boundary cases
      const minEntry = findTableEntry(VISITORS_FREQUENCY_TABLE, 1);
      expect(minEntry).toBe('Vazia');
      
      const maxEntry = findTableEntry(VISITORS_FREQUENCY_TABLE, 20);
      expect(maxEntry).toBe('Lotada');
      
      // Test middle values
      const midEntry = findTableEntry(VISITORS_FREQUENCY_TABLE, 14);
      expect(midEntry).toBe('Nem muito nem pouco');
      
      // Test out of bounds
      const belowMin = findTableEntry(VISITORS_FREQUENCY_TABLE, 0);
      expect(belowMin).toBe('Vazia'); // Should handle negative values
      
      const aboveMax = findTableEntry(VISITORS_FREQUENCY_TABLE, 25);
      expect(aboveMax).toBe('Lotada'); // Extended range for high modifiers
    });

    it('should cover all possible settlement dice results', () => {
      // All settlement types use d8-d20 for visitors
      const possibleRolls = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
      possibleRolls.forEach(roll => {
        const entry = findTableEntry(VISITORS_FREQUENCY_TABLE, roll);
        expect(entry).toBeDefined();
      });
    });
  });

  describe('Settlement Dice Configuration', () => {
    it('should maintain proper dice configuration for each settlement type', () => {
      // Test that each settlement has proper dice configuration
      expect(SETTLEMENT_DICE.structure.Lugarejo.dice).toBe('d8');
      expect(SETTLEMENT_DICE.visitors.Lugarejo.dice).toBe('d8');
      
      expect(SETTLEMENT_DICE.structure.Aldeia.dice).toBe('d8');
      expect(SETTLEMENT_DICE.visitors.Aldeia.dice).toBe('d8');
      
      expect(SETTLEMENT_DICE.structure.Vilarejo.dice).toBe('d12');
      expect(SETTLEMENT_DICE.visitors.Vilarejo.dice).toBe('d10');
      
      expect(SETTLEMENT_DICE.structure['Cidade Grande'].dice).toBe('d20');
      expect(SETTLEMENT_DICE.structure['Cidade Grande'].modifier).toBe(4);
      expect(SETTLEMENT_DICE.visitors['Cidade Grande'].dice).toBe('d20');
    });

    it('should demonstrate proper business logic of unified tables', () => {
      // The beauty of unified tables: smaller dice naturally get limited results
      // while larger dice/modifiers access higher ranges
      
      // D8 (1-8) will only access first 8 entries of unified table
      const d8Roll = 5;
      const d8Entry = findTableEntry(RESOURCES_LEVEL_TABLE, d8Roll);
      expect(d8Entry).toBe('Nenhum'); // Should be early entry
      
      // D20+8 (9-28) will access middle-to-high entries
      const d20PlusRoll = 25;
      const d20Entry = findTableEntry(RESOURCES_LEVEL_TABLE, d20PlusRoll);
      expect(d20Entry).toBe('Abundantes vindos de muitos anos de serviço'); // Should be higher entry
      
      // This demonstrates how the unified table naturally constrains
      // different settlement types without complex logic
    });
  });

  describe('Table Completeness', () => {
    it('should have no gaps in resource level table', () => {
      // Check that there are no gaps in the table ranges
      const sortedTable = [...RESOURCES_LEVEL_TABLE].sort((a, b) => a.min - b.min);
      
      for (let i = 0; i < sortedTable.length - 1; i++) {
        const current = sortedTable[i];
        const next = sortedTable[i + 1];
        
        // Next entry should start exactly where current ends + 1
        expect(next.min).toBe(current.max + 1);
      }
    });

    it('should have no gaps in visitors frequency table', () => {
      // Check that there are no gaps in the table ranges
      const sortedTable = [...VISITORS_FREQUENCY_TABLE].sort((a, b) => a.min - b.min);
      
      for (let i = 0; i < sortedTable.length - 1; i++) {
        const current = sortedTable[i];
        const next = sortedTable[i + 1];
        
        // Next entry should start exactly where current ends + 1
        expect(next.min).toBe(current.max + 1);
      }
    });
  });

  describe('Real-world Settlement Generation', () => {
    it('should generate consistent results for same settlement type', () => {
      // Simulate multiple generations for same settlement type
      // All should be within expected ranges
      
      // Lugarejo uses d8 for resources (1-8), should get limited results
      const lugarejoResults = Array.from({ length: 8 }, (_, i) => i + 1); // 1-8
      lugarejoResults.forEach(roll => {
        const entry = findTableEntry(RESOURCES_LEVEL_TABLE, roll);
        expect(entry).toBeDefined();
        // Should be in the lower tier of resource levels
        expect(['Em débito', 'Nenhum', 'Escassos', 'Escassos e obtidos com muito esforço e honestidade']).toContain(entry);
      });
      
      // Cidade uses d20+8 for resources (9-28), should get higher results
      const cidadeResults = Array.from({ length: 20 }, (_, i) => i + 9); // 9-28
      cidadeResults.forEach(roll => {
        const entry = findTableEntry(RESOURCES_LEVEL_TABLE, roll);
        expect(entry).toBeDefined();
        // Should NOT be in the lowest tiers, but should be higher level results
        expect(['Escassos e obtidos com muito esforço e honestidade', 'Limitados', 'Suficientes', 'Excedentes', 'Excedentes mas alimenta fins malignos', 'Abundantes porém quase todo vindo do governo de um assentamento próximo', 'Abundantes', 'Abundantes vindos de muitos anos de serviço']).toContain(entry);
      });
    });
  });
});
