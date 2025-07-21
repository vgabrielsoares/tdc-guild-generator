import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  GuildRelationsGenerator,
  generateGovernmentRelations,
  generatePopulationRelations,
  generateResourceLevel,
  generateResourceSpecialties,
  generateVisitorLevel,
  generateVisitorTypes,
  generateGuildRelations,
  generateGuildResources,
  generateGuildVisitors,
  type RelationsGenerationConfig,
} from "@/utils/generators/guildRelations";
import {
  SettlementType,
  RelationLevel,
  ResourceLevel,
  VisitorLevel,
} from "@/types/guild";

describe("Issue 3.3 - Guild Relations Generator", () => {
  let config: RelationsGenerationConfig;

  beforeEach(() => {
    config = {
      settlementType: SettlementType.CIDADE_PEQUENA,
    };

    // Mock console.log to avoid spam in tests
    vi.spyOn(console, "log").mockImplementation(() => {});
  });

  describe("Individual Generator Functions", () => {
    it("should generate government relations with valid enum", () => {
      const result = generateGovernmentRelations(config);
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(Object.values(RelationLevel)).toContain(result);
    });

    it("should generate population relations with valid enum", () => {
      const result = generatePopulationRelations(config);
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(Object.values(RelationLevel)).toContain(result);
    });

    it("should generate resource level with valid enum", () => {
      const result = generateResourceLevel(config);
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(Object.values(ResourceLevel)).toContain(result);
    });

    it("should generate resource specialties based on level", () => {
      const result = generateResourceSpecialties(ResourceLevel.ADEQUADOS);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((spec) => typeof spec === "string")).toBe(true);

      // Should not have duplicates
      const uniqueSpecs = [...new Set(result)];
      expect(uniqueSpecs.length).toBe(result.length);
    });

    it("should generate visitor level with valid enum", () => {
      const result = generateVisitorLevel(config);
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(Object.values(VisitorLevel)).toContain(result);
    });

    it("should generate visitor types based on level", () => {
      const result = generateVisitorTypes(VisitorLevel.NEM_MUITO_NEM_POUCO);
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(result.every((type) => typeof type === "string")).toBe(true);

      // Should not have duplicates
      const uniqueTypes = [...new Set(result)];
      expect(uniqueTypes.length).toBe(result.length);
    });

    it("should apply custom modifiers correctly", () => {
      const configWithMods: RelationsGenerationConfig = {
        settlementType: SettlementType.CIDADE_GRANDE,
        customModifiers: {
          governmentMod: 5,
          populationMod: -2,
          resourcesMod: 3,
          visitorsMod: -1,
        },
      };

      // These should all complete without errors
      expect(() => generateGovernmentRelations(configWithMods)).not.toThrow();
      expect(() => generatePopulationRelations(configWithMods)).not.toThrow();
      expect(() => generateResourceLevel(configWithMods)).not.toThrow();
      expect(() => generateVisitorLevel(configWithMods)).not.toThrow();
    });
  });

  describe("Complete Generation Functions", () => {
    it("should generate complete guild relations", () => {
      const result = generateGuildRelations(config);

      expect(result).toBeDefined();
      expect(result.government).toBeDefined();
      expect(result.population).toBeDefined();
      expect(Object.values(RelationLevel)).toContain(result.government);
      expect(Object.values(RelationLevel)).toContain(result.population);
    });

    it("should generate complete guild resources", () => {
      const result = generateGuildResources(config);

      expect(result).toBeDefined();
      expect(result.level).toBeDefined();
      expect(result.details).toBeDefined();
      expect(Object.values(ResourceLevel)).toContain(result.level);
      expect(Array.isArray(result.details)).toBe(true);
      expect(result.details!.length).toBeGreaterThan(0);
    });

    it("should generate complete guild visitors", () => {
      const result = generateGuildVisitors(config);

      expect(result).toBeDefined();
      expect(result.frequency).toBeDefined();
      expect(result.types).toBeDefined();
      expect(Object.values(VisitorLevel)).toContain(result.frequency);
      expect(Array.isArray(result.types)).toBe(true);
      expect(result.types!.length).toBeGreaterThan(0);
    });
  });

  describe("Main Generator Class", () => {
    it("should generate complete guild relations data for small settlement", () => {
      const result = GuildRelationsGenerator.generate({
        settlementType: SettlementType.LUGAREJO,
      });

      expect(result).toBeDefined();
      expect(result.relations).toBeDefined();
      expect(result.resources).toBeDefined();
      expect(result.visitors).toBeDefined();

      // Relations
      expect(Object.values(RelationLevel)).toContain(
        result.relations.government
      );
      expect(Object.values(RelationLevel)).toContain(
        result.relations.population
      );

      // Resources
      expect(Object.values(ResourceLevel)).toContain(result.resources.level);
      expect(Array.isArray(result.resources.details)).toBe(true);

      // Visitors
      expect(Object.values(VisitorLevel)).toContain(result.visitors.frequency);
      expect(Array.isArray(result.visitors.types)).toBe(true);
    });

    it("should generate complete guild relations data for large settlement", () => {
      const result = GuildRelationsGenerator.generate({
        settlementType: SettlementType.METROPOLE,
      });

      expect(result).toBeDefined();
      expect(result.relations).toBeDefined();
      expect(result.resources).toBeDefined();
      expect(result.visitors).toBeDefined();

      // Relations
      expect(Object.values(RelationLevel)).toContain(
        result.relations.government
      );
      expect(Object.values(RelationLevel)).toContain(
        result.relations.population
      );

      // Resources
      expect(Object.values(ResourceLevel)).toContain(result.resources.level);
      expect(Array.isArray(result.resources.details)).toBe(true);

      // Visitors
      expect(Object.values(VisitorLevel)).toContain(result.visitors.frequency);
      expect(Array.isArray(result.visitors.types)).toBe(true);
    });

    it("should apply custom modifiers correctly", () => {
      const result = GuildRelationsGenerator.generate({
        settlementType: SettlementType.CIDADE_GRANDE,
        customModifiers: {
          governmentMod: 3,
          populationMod: -1,
          resourcesMod: 2,
          visitorsMod: 1,
        },
      });

      expect(result).toBeDefined();
      expect(result.relations).toBeDefined();
      expect(result.resources).toBeDefined();
      expect(result.visitors).toBeDefined();
    });
  });

  describe("Edge Cases and Validation", () => {
    it("should handle all settlement types", () => {
      const settlementTypes = Object.values(SettlementType);

      for (const settlementType of settlementTypes) {
        const result = GuildRelationsGenerator.generate({ settlementType });

        expect(result).toBeDefined();
        expect(result.relations).toBeDefined();
        expect(result.resources).toBeDefined();
        expect(result.visitors).toBeDefined();
      }
    });

    it("should work without custom modifiers", () => {
      const result = GuildRelationsGenerator.generate({
        settlementType: SettlementType.ALDEIA,
      });

      expect(result).toBeDefined();
      expect(result.relations).toBeDefined();
      expect(result.resources).toBeDefined();
      expect(result.visitors).toBeDefined();
    });

    it("should generate different numbers of specialties based on resource level", () => {
      const escassosSpecs = generateResourceSpecialties(ResourceLevel.ESCASSOS);
      const vastosSpecs = generateResourceSpecialties(ResourceLevel.VASTOS);

      expect(escassosSpecs.length).toBeLessThan(vastosSpecs.length);
      expect(escassosSpecs.length).toBeGreaterThan(0);
      expect(vastosSpecs.length).toBeGreaterThan(0);
    });

    it("should generate different numbers of visitor types based on frequency", () => {
      const baixoTypes = generateVisitorTypes(VisitorLevel.VAZIA);
      const altoTypes = generateVisitorTypes(VisitorLevel.LOTADA);

      expect(baixoTypes.length).toBeLessThan(altoTypes.length);
      expect(baixoTypes.length).toBeGreaterThan(0);
      expect(altoTypes.length).toBeGreaterThan(0);
    });

    it("should handle extreme modifiers gracefully", () => {
      const extremeConfig: RelationsGenerationConfig = {
        settlementType: SettlementType.CIDADE_PEQUENA,
        customModifiers: {
          governmentMod: 100,
          populationMod: -100,
          resourcesMod: 50,
          visitorsMod: -50,
        },
      };

      expect(() =>
        GuildRelationsGenerator.generate(extremeConfig)
      ).not.toThrow();

      const result = GuildRelationsGenerator.generate(extremeConfig);
      expect(result).toBeDefined();
      expect(result.relations).toBeDefined();
      expect(result.resources).toBeDefined();
      expect(result.visitors).toBeDefined();
    });

    it("should maintain consistency across multiple generations", () => {
      const results = [];

      for (let i = 0; i < 10; i++) {
        results.push(GuildRelationsGenerator.generate(config));
      }

      // All results should be valid
      results.forEach((result) => {
        expect(result).toBeDefined();
        expect(result.relations).toBeDefined();
        expect(result.resources).toBeDefined();
        expect(result.visitors).toBeDefined();
      });

      // Should have some variety in results (not all identical)
      const governments = results.map((r) => r.relations.government);
      const uniqueGovernments = [...new Set(governments)];

      // If we run enough times, we should get some variety
      // (This test might occasionally fail due to randomness, but very rarely)
      if (results.length >= 10) {
        expect(uniqueGovernments.length).toBeGreaterThan(1);
      }
    });
  });
});
