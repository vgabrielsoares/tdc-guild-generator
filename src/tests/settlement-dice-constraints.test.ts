import { describe, it, expect } from "vitest";
import { SettlementType as ST } from "@/types/guild";
import {
  generateHeadquartersSize,
  generateVisitors,
  generateGuildStructure,
} from "@/utils/generators/guildStructure";

describe("Settlement Dice Constraints - Bug Fix Validation", () => {
  describe("Real Dice Roll Validation", () => {
    it("should respect dice limitations for small settlements over multiple generations", () => {
      // Teste múltiplas gerações para verificar consistência
      const results = Array.from({ length: 10 }, () => ({
        lugarejo: generateHeadquartersSize(ST.LUGAREJO, 0),
        aldeia: generateHeadquartersSize(ST.ALDEIA, 0),
      }));

      results.forEach((result, index) => {
        // Lugarejo e Aldeia devem usar d8 (máximo 8)
        expect(result.lugarejo.roll).toBeLessThanOrEqual(8);
        expect(result.lugarejo.roll).toBeGreaterThanOrEqual(1);
        
        expect(result.aldeia.roll).toBeLessThanOrEqual(8);
        expect(result.aldeia.roll).toBeGreaterThanOrEqual(1);
        
        if (result.lugarejo.roll > 8 || result.aldeia.roll > 8) {
          throw new Error(`Small settlement exceeded dice limits - Test ${index}: Lugarejo=${result.lugarejo.roll}, Aldeia=${result.aldeia.roll}`);
        }
      });
    });

    it("should allow appropriate ranges for larger settlements", () => {
      const results = Array.from({ length: 10 }, () => ({
        cidadePequena: generateHeadquartersSize(ST.CIDADE_PEQUENA, 0),
        cidadeGrande: generateHeadquartersSize(ST.CIDADE_GRANDE, 0),
        metropole: generateHeadquartersSize(ST.METROPOLE, 0),
      }));

      results.forEach((result) => {
        // Cidade Pequena mapeia para Cidadela (d20, máximo 20)
        expect(result.cidadePequena.roll).toBeLessThanOrEqual(20);
        expect(result.cidadePequena.roll).toBeGreaterThanOrEqual(1);
        
        // Cidade Grande usa d20+4 (mínimo 5, máximo 24)
        expect(result.cidadeGrande.roll).toBeLessThanOrEqual(24);
        expect(result.cidadeGrande.roll).toBeGreaterThanOrEqual(5);
        
        // Metrópole usa d20+8 (mínimo 9, máximo 28)
        expect(result.metropole.roll).toBeLessThanOrEqual(28);
        expect(result.metropole.roll).toBeGreaterThanOrEqual(9);
      });
    });

    it("should prevent visitor frequency violations for small settlements", () => {
      const results = Array.from({ length: 10 }, () => ({
        lugarejoVisitors: generateVisitors(ST.LUGAREJO, 0),
        aldeiaVisitors: generateVisitors(ST.ALDEIA, 0),
      }));

      results.forEach((result, index) => {
        // Pequenos assentamentos devem usar d8 para visitantes (máximo 8)
        expect(result.lugarejoVisitors.roll).toBeLessThanOrEqual(8);
        expect(result.lugarejoVisitors.roll).toBeGreaterThanOrEqual(1);
        
        expect(result.aldeiaVisitors.roll).toBeLessThanOrEqual(8);
        expect(result.aldeiaVisitors.roll).toBeGreaterThanOrEqual(1);
        
        if (result.lugarejoVisitors.roll > 8 || result.aldeiaVisitors.roll > 8) {
          throw new Error(`Small settlement visitors exceeded dice limits - Test ${index}: LugarejoV=${result.lugarejoVisitors.roll}, AldeiaV=${result.aldeiaVisitors.roll}`);
        }
      });
    });

    it("should show clear differences between settlement types", () => {
      const smallResults = Array.from({ length: 5 }, () => 
        generateGuildStructure({
          settlementType: ST.LUGAREJO,
          useModifiers: false,
        })
      );
      
      const largeResults = Array.from({ length: 5 }, () =>
        generateGuildStructure({
          settlementType: ST.METROPOLE,
          useModifiers: false,
        })
      );
      
      // Verifica que assentamentos pequenos nunca excedem 8
      smallResults.forEach((result) => {
        expect(result.rolls.structure.size).toBeLessThanOrEqual(8);
        expect(result.rolls.visitors).toBeLessThanOrEqual(8);
      });
      
      // Verifica que assentamentos grandes podem ter valores > 8
      const hasHighStructure = largeResults.some(r => r.rolls.structure.size > 8);
      const hasHighVisitors = largeResults.some(r => r.rolls.visitors > 8);
      
      // Pelo menos um dos resultados grandes deve ser > 8 (não é garantido, mas é provável)
      expect(hasHighStructure || hasHighVisitors).toBe(true);
    });

    it("should handle all settlement types without errors", () => {
      const settlementTypes = [ST.LUGAREJO, ST.ALDEIA, ST.CIDADE_PEQUENA, ST.CIDADE_GRANDE, ST.METROPOLE];

      settlementTypes.forEach((settlementType) => {
        expect(() => {
          const result = generateGuildStructure({
            settlementType,
            useModifiers: false,
          });
          
          // Verifica que a estrutura básica está presente
          expect(result.guild).toBeDefined();
          expect(result.guild.settlementType).toBe(settlementType);
          expect(result.rolls).toBeDefined();
          expect(result.rolls.structure).toBeDefined();
          expect(result.rolls.visitors).toBeDefined();
        }).not.toThrow();
      });
    });

    it("should maintain consistency in regeneration logic", () => {
      // Este teste valida que a regeneração está funcionando corretamente
      const config = {
        settlementType: ST.LUGAREJO,
        useModifiers: false,
      };
      
      const firstGeneration = generateGuildStructure(config);
      const secondGeneration = generateGuildStructure(config);
      
      // Ambas gerações devem seguir as mesmas regras
      expect(firstGeneration.rolls.structure.size).toBeLessThanOrEqual(8);
      expect(firstGeneration.rolls.visitors).toBeLessThanOrEqual(8);
      
      expect(secondGeneration.rolls.structure.size).toBeLessThanOrEqual(8);
      expect(secondGeneration.rolls.visitors).toBeLessThanOrEqual(8);
      
      // E devem ter a mesma estrutura básica
      expect(firstGeneration.guild.settlementType).toBe(secondGeneration.guild.settlementType);
    });
  });
});
