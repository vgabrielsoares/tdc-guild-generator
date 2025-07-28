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
      const results = Array.from({ length: 3 }, () => ({
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
      const results = Array.from({ length: 3 }, () => ({
        povoado: generateHeadquartersSize(ST.POVOADO, 0),
        cidadeGrande: generateHeadquartersSize(ST.CIDADE_GRANDE, 0),
        metropole: generateHeadquartersSize(ST.METROPOLE, 0),
      }));

      results.forEach((result) => {
        // Povoado usa d8 (máximo 8)
        expect(result.povoado.roll).toBeLessThanOrEqual(8);
        expect(result.povoado.roll).toBeGreaterThanOrEqual(1);

        // Cidade Grande usa d20+4 (mínimo 5, máximo 24)
        expect(result.cidadeGrande.roll).toBeLessThanOrEqual(24);
        expect(result.cidadeGrande.roll).toBeGreaterThanOrEqual(5);

        // Metrópole usa d20+8 (mínimo 9, máximo 28)
        expect(result.metropole.roll).toBeLessThanOrEqual(28);
        expect(result.metropole.roll).toBeGreaterThanOrEqual(9);
      });
    });

    it("should prevent visitor frequency violations for small settlements", () => {
      const results = Array.from({ length: 3 }, () => ({
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
      const results: Record<string, ReturnType<typeof generateGuildStructure>[]> = {};
      const settlementTypes = [ST.LUGAREJO, ST.POVOADO, ST.ALDEIA, ST.VILAREJO, ST.VILA_GRANDE, ST.CIDADELA, ST.CIDADE_GRANDE, ST.METROPOLE];
      
      // Gerar várias guildas para cada tipo de assentamento
      settlementTypes.forEach((settlementType) => {
        const guilds = [];
        for (let i = 0; i < 10; i++) {
          const result = generateGuildStructure({ settlementType, useModifiers: false });
          guilds.push(result);
        }
        results[settlementType] = guilds;
      });

      // Verificar que diferentes tipos de assentamento produzem resultados distintos
      const lugarejosRolls = results[ST.LUGAREJO].map((r) => r.rolls.structure.size);
      const metropoleRolls = results[ST.METROPOLE].map((r) => r.rolls.structure.size);
      
      // Lugarejo deve ter rolls menores que metrópole em média
      const avgLugarejo = lugarejosRolls.reduce((a: number, b: number) => a + b, 0) / lugarejosRolls.length;
      const avgMetropole = metropoleRolls.reduce((a: number, b: number) => a + b, 0) / metropoleRolls.length;
      
      expect(avgLugarejo).toBeLessThan(avgMetropole);
    });

    it("should handle all settlement types without errors", () => {
      const settlementTypes = [ST.LUGAREJO, ST.POVOADO, ST.ALDEIA, ST.VILAREJO, ST.VILA_GRANDE, ST.CIDADELA, ST.CIDADE_GRANDE, ST.METROPOLE];

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
      const settlementType = ST.POVOADO;
      const config = { settlementType, useModifiers: false };
      
      // Gerar várias guildas com a mesma configuração
      const results = [];
      for (let i = 0; i < 20; i++) {
        results.push(generateGuildStructure(config));
      }
      
      // Verificar que todas têm o mesmo tipo de assentamento
      results.forEach((result) => {
        expect(result.guild.settlementType).toBe(settlementType);
        expect(result.rolls.structure).toBeDefined();
        expect(result.rolls.structure.size).toBeGreaterThan(0);
        expect(result.rolls.structure.characteristics).toBeInstanceOf(Array);
        expect(result.rolls.structure.characteristics.length).toBeGreaterThan(0);
      });
      
      // Verificar que os rolls estão dentro dos limites esperados para cidade pequena
      const sizeRolls = results.map(r => r.rolls.structure.size);
      expect(Math.min(...sizeRolls)).toBeGreaterThanOrEqual(1);
      expect(Math.max(...sizeRolls)).toBeLessThanOrEqual(20); // d20 base
    });
  });
});
