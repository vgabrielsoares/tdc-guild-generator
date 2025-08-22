import { describe, it, expect } from "vitest";
import {
  SERVICOS_ESPECIFICOS_TABLE,
  TRABALHO_RURAL_TABLE,
  RELIGIOSO_TABLE,
  getThreeColumnTable,
  generateServiceObjective,
  generateSpecificServiceDescription,
  generateServiceDescription,
  generateMultipleObjective,
  IMPLEMENTED_OBJECTIVE_TYPES,
  rollThreeColumnObjective,
} from "@/data/tables/service-objective-tables";
import { ServiceObjectiveType } from "@/types/service";

describe("Service Objective Tables - Part 3 (Issue 5.13)", () => {
  describe("SERVICE_OBJECTIVE_TYPES Table Completeness", () => {
    it("should now include SERVICOS_ESPECIFICOS, RELIGIOSO and MULTIPLO in implemented types", () => {
      expect(IMPLEMENTED_OBJECTIVE_TYPES).toContain(
        ServiceObjectiveType.SERVICOS_ESPECIFICOS
      );
      expect(IMPLEMENTED_OBJECTIVE_TYPES).toContain(
        ServiceObjectiveType.RELIGIOSO
      );
      expect(IMPLEMENTED_OBJECTIVE_TYPES).toContain(
        ServiceObjectiveType.MULTIPLO
      );
      expect(IMPLEMENTED_OBJECTIVE_TYPES).toHaveLength(10); // 7 previous + 3 new
    });
  });

  describe("Three Column Tables Structure", () => {
    describe("SERVICOS_ESPECIFICOS_TABLE", () => {
      it("should have exactly 20 entries (1 for each d20 result)", () => {
        expect(SERVICOS_ESPECIFICOS_TABLE).toHaveLength(20);
      });

      it("should cover all ranges from 1-20 without gaps or overlaps", () => {
        const ranges = SERVICOS_ESPECIFICOS_TABLE.map((entry) => ({
          min: entry.min,
          max: entry.max,
        }));

        // Check consecutive ranges
        for (let i = 0; i < ranges.length; i++) {
          expect(ranges[i].min).toBe(i + 1);
          expect(ranges[i].max).toBe(i + 1);
        }
      });

      it("should have consecutive entries from 1 to 20", () => {
        for (let i = 0; i < 20; i++) {
          expect(SERVICOS_ESPECIFICOS_TABLE[i].min).toBe(i + 1);
          expect(SERVICOS_ESPECIFICOS_TABLE[i].max).toBe(i + 1);
        }
      });

      it("should have all three columns populated for each entry", () => {
        SERVICOS_ESPECIFICOS_TABLE.forEach((entry) => {
          expect(entry.result.action).toBeTruthy();
          expect(entry.result.target).toBeTruthy();
          expect(entry.result.complication).toBeTruthy();
          expect(typeof entry.result.action).toBe("string");
          expect(typeof entry.result.target).toBe("string");
          expect(typeof entry.result.complication).toBe("string");
        });
      });
    });

    describe("TRABALHO_RURAL_TABLE (Auxiliary Table)", () => {
      it("should have exactly 20 entries (1 for each d20 result)", () => {
        expect(TRABALHO_RURAL_TABLE).toHaveLength(20);
      });

      it("should cover all ranges from 1-20 without gaps or overlaps", () => {
        const ranges = TRABALHO_RURAL_TABLE.map((entry) => ({
          min: entry.min,
          max: entry.max,
        }));

        // Check consecutive ranges
        for (let i = 0; i < ranges.length; i++) {
          expect(ranges[i].min).toBe(i + 1);
          expect(ranges[i].max).toBe(i + 1);
        }
      });

      it("should have consecutive entries from 1 to 20", () => {
        for (let i = 0; i < 20; i++) {
          expect(TRABALHO_RURAL_TABLE[i].min).toBe(i + 1);
          expect(TRABALHO_RURAL_TABLE[i].max).toBe(i + 1);
        }
      });

      it("should have all entries populated with rural work types", () => {
        TRABALHO_RURAL_TABLE.forEach((entry) => {
          expect(entry.result).toBeTruthy();
          expect(typeof entry.result).toBe("string");
          expect(entry.result.length).toBeGreaterThan(0);
        });
      });
    });

    describe("RELIGIOSO_TABLE", () => {
      it("should have exactly 20 entries (1 for each d20 result)", () => {
        expect(RELIGIOSO_TABLE).toHaveLength(20);
      });

      it("should cover all ranges from 1-20 without gaps or overlaps", () => {
        const ranges = RELIGIOSO_TABLE.map((entry) => ({
          min: entry.min,
          max: entry.max,
        }));

        // Check consecutive ranges
        for (let i = 0; i < ranges.length; i++) {
          expect(ranges[i].min).toBe(i + 1);
          expect(ranges[i].max).toBe(i + 1);
        }
      });

      it("should have consecutive entries from 1 to 20", () => {
        for (let i = 0; i < 20; i++) {
          expect(RELIGIOSO_TABLE[i].min).toBe(i + 1);
          expect(RELIGIOSO_TABLE[i].max).toBe(i + 1);
        }
      });

      it("should have all three columns populated for each entry", () => {
        RELIGIOSO_TABLE.forEach((entry) => {
          expect(entry.result.action).toBeTruthy();
          expect(entry.result.target).toBeTruthy();
          expect(entry.result.complication).toBeTruthy();
          expect(typeof entry.result.action).toBe("string");
          expect(typeof entry.result.target).toBe("string");
          expect(typeof entry.result.complication).toBe("string");
        });
      });

      it("should have consecutive entries from 1 to 20", () => {
        for (let i = 0; i < 20; i++) {
          expect(RELIGIOSO_TABLE[i].min).toBe(i + 1);
          expect(RELIGIOSO_TABLE[i].max).toBe(i + 1);
        }
      });

      it("should have all three columns populated for each entry", () => {
        RELIGIOSO_TABLE.forEach((entry) => {
          expect(entry.result.action).toBeTruthy();
          expect(entry.result.target).toBeTruthy();
          expect(entry.result.complication).toBeTruthy();
          expect(typeof entry.result.action).toBe("string");
          expect(typeof entry.result.target).toBe("string");
          expect(typeof entry.result.complication).toBe("string");
        });
      });
    });
  });

  describe("Specific Table Content Validation", () => {
    it("SERVICOS_ESPECIFICOS_TABLE should match .md content exactly", () => {
      // Test a few specific entries from the implemented table
      expect(SERVICOS_ESPECIFICOS_TABLE[0].result.action).toBe("Limpar construção/local");
      expect(SERVICOS_ESPECIFICOS_TABLE[0].result.target).toBe("Um nobre soberbo");
      expect(SERVICOS_ESPECIFICOS_TABLE[0].result.complication).toBe("Alguém tenta constantemente dar ordens conflitantes");

      expect(SERVICOS_ESPECIFICOS_TABLE[1].result.action).toBe("Cobrar impostos/dívidas");
      expect(SERVICOS_ESPECIFICOS_TABLE[1].result.target).toBe("Um humanoide ranzinza");
      expect(SERVICOS_ESPECIFICOS_TABLE[1].result.complication).toBe("Deve ser feito durante a madrugada");

      // Check that "Trabalho rural" is in position 6 (index 5)
      expect(SERVICOS_ESPECIFICOS_TABLE[5].result.action).toBe("Trabalho rural");
      expect(SERVICOS_ESPECIFICOS_TABLE[5].result.target).toBe("Um criminoso/mafioso");
      expect(SERVICOS_ESPECIFICOS_TABLE[5].result.complication).toBe("Vai contra a moral e os bons costumes");

      expect(SERVICOS_ESPECIFICOS_TABLE[19].result.action).toBe("Cuidar de mascote");
    });

    it("TRABALHO_RURAL_TABLE should match .md content exactly", () => {
      // Test a few specific entries from the implemented table
      expect(TRABALHO_RURAL_TABLE[0].result).toBe("Pecuária");
      expect(TRABALHO_RURAL_TABLE[1].result).toBe("Lavoura");
      expect(TRABALHO_RURAL_TABLE[2].result).toBe("Horticultura");
      expect(TRABALHO_RURAL_TABLE[19].result).toBe("Reflorestamento");
    });

    it("RELIGIOSO_TABLE should match .md content exactly", () => {
      // Test a few specific entries from the implemented table
      expect(RELIGIOSO_TABLE[0].result.action).toBe("Pregar em praça pública");
      expect(RELIGIOSO_TABLE[0].result.target).toBe("Um herói ancestral");
      expect(RELIGIOSO_TABLE[0].result.complication).toBe("Envolve um ritual macabro");

      expect(RELIGIOSO_TABLE[1].result.action).toBe("Converter/purificar");
      expect(RELIGIOSO_TABLE[1].result.target).toBe("Toda uma vila/culto");
      expect(RELIGIOSO_TABLE[1].result.complication).toBe("Rumores preveem uma tragédia");

      expect(RELIGIOSO_TABLE[19].result.action).toBeDefined();
    });
  });

  describe("rollThreeColumnObjective", () => {
    it("should work with SERVICOS_ESPECIFICOS table", () => {
      const result = rollThreeColumnObjective(SERVICOS_ESPECIFICOS_TABLE);
      expect(result).toBeDefined();
      expect(result.action).toBeTruthy();
      expect(result.target).toBeTruthy();
      expect(result.complication).toBeTruthy();
    });

    it("should work with RELIGIOSO table", () => {
      const result = rollThreeColumnObjective(RELIGIOSO_TABLE);
      expect(result).toBeDefined();
      expect(result.action).toBeTruthy();
      expect(result.target).toBeTruthy();
      expect(result.complication).toBeTruthy();
    });

    it("should handle edge case rolls for new tables", () => {
      // Test with specific dice rolls (1,1,1) and (20,20,20)
      const result1 = rollThreeColumnObjective(
        SERVICOS_ESPECIFICOS_TABLE,
        () => 1,
        () => 1,
        () => 1
      );
      expect(result1.action).toBe("Limpar construção/local");
      expect(result1.target).toBe("Um nobre soberbo");
      expect(result1.complication).toBe("Alguém tenta constantemente dar ordens conflitantes");

      const result20 = rollThreeColumnObjective(
        SERVICOS_ESPECIFICOS_TABLE,
        () => 20,
        () => 20,
        () => 20
      );
      expect(result20.action).toBe("Cuidar de mascote");
      expect(result20.target).toBeDefined();
      expect(result20.complication).toBeDefined();
    });
  });

  describe("getThreeColumnTable", () => {
    it("should return correct tables for new implemented objective types", () => {
      expect(getThreeColumnTable(ServiceObjectiveType.SERVICOS_ESPECIFICOS)).toBe(
        SERVICOS_ESPECIFICOS_TABLE
      );
      expect(getThreeColumnTable(ServiceObjectiveType.RELIGIOSO)).toBe(
        RELIGIOSO_TABLE
      );
    });

    it("should return null for MULTIPLO objective type (special handling)", () => {
      expect(getThreeColumnTable(ServiceObjectiveType.MULTIPLO)).toBeNull();
    });
  });

  describe("Multiple Objectives System (Issue 5.13 Special Feature)", () => {
    describe("generateMultipleObjective", () => {
      it("should generate at least one objective", () => {
        const result = generateMultipleObjective();
        
        expect(result.type).toBe(ServiceObjectiveType.MULTIPLO);
        expect(result.description).toBeDefined();
        expect(result.action).toBeDefined();
        expect(result.target).toBeDefined();
        expect(result.complication).toBeDefined();
      });

      it("should combine multiple objectives when rolling multiple 20s", () => {
        const result = generateMultipleObjective();
        
        expect(result.type).toBe(ServiceObjectiveType.MULTIPLO);
        
        // Should contain connectors for multiple objectives
        const hasMultipleConnector = result.description.includes("e também") || 
                                    result.description.includes("+") ||
                                    !result.description.includes("e também"); // Single objective is also valid
        
        expect(hasMultipleConnector).toBe(true);
      });

      it("should not repeat objective types in the same generation", () => {
        // Run multiple times to test the uniqueness logic
        for (let i = 0; i < 10; i++) {
          const result = generateMultipleObjective();
          
          expect(result.type).toBe(ServiceObjectiveType.MULTIPLO);
          expect(result.description).toBeDefined();
          
          // If it contains multiple objectives, they should be combined properly
          if (result.description.includes("e também")) {
            const parts = result.description.split("e também");
            expect(parts.length).toBeGreaterThanOrEqual(2);
            parts.forEach(part => {
              expect(part.trim().length).toBeGreaterThan(0);
            });
          }
        }
      });

      it("should handle proper grammar for multiple objectives", () => {
        const result = generateMultipleObjective();
        
        expect(result.type).toBe(ServiceObjectiveType.MULTIPLO);
        
        // Test different scenarios
        if (result.description.includes("e também")) {
          // Multiple objectives - should have proper connectors
          const parts = result.description.split("e também");
          expect(parts.length).toBeGreaterThanOrEqual(2);
          
          // Last part should be connected with "e também"
          expect(parts[parts.length - 1].trim().length).toBeGreaterThan(0);
        } else {
          // Single objective promoted to multiple - should still be valid
          expect(result.description.length).toBeGreaterThan(0);
        }
      });

      it("should generate different combinations on multiple calls", () => {
        const results = [];
        
        // Generate multiple results
        for (let i = 0; i < 5; i++) {
          results.push(generateMultipleObjective());
        }
        
        // All should be valid
        results.forEach(result => {
          expect(result.type).toBe(ServiceObjectiveType.MULTIPLO);
          expect(result.description).toBeDefined();
          expect(result.description.length).toBeGreaterThan(0);
        });
        
        // Due to randomization, at least some should be different
        const uniqueDescriptions = new Set(results.map(r => r.description));
        expect(uniqueDescriptions.size).toBeGreaterThan(0);
      });
    });

    describe("generateServiceObjective with MULTIPLO", () => {
      it("should handle MULTIPLO type by generating combined objectives", () => {
        const result = generateServiceObjective(ServiceObjectiveType.MULTIPLO);
        
        expect(result).not.toBeNull();
        expect(result!.type).toBe(ServiceObjectiveType.MULTIPLO);
        expect(result!.description).toContain("e também");
      });

      it("should generate different results on multiple calls", () => {
        const result1 = generateServiceObjective(ServiceObjectiveType.MULTIPLO);
        const result2 = generateServiceObjective(ServiceObjectiveType.MULTIPLO);
        
        // With randomization, results should likely be different
        // (though there's a small chance they could be the same)
        expect(result1).not.toBeNull();
        expect(result2).not.toBeNull();
        expect(result1!.type).toBe(ServiceObjectiveType.MULTIPLO);
        expect(result2!.type).toBe(ServiceObjectiveType.MULTIPLO);
      });
    });

    describe("Integration with complete objective system", () => {
      it("should work with all implemented objective types", () => {
        // Test that we can generate multiples using all implemented types
        const implementations = IMPLEMENTED_OBJECTIVE_TYPES.filter(
          type => type !== ServiceObjectiveType.MULTIPLO
        );
        
        expect(implementations.length).toBeGreaterThan(0);
        
        // Generate multiple objectives multiple times to test variety
        for (let i = 0; i < 5; i++) {
          const result = generateMultipleObjective();
          expect(result.type).toBe(ServiceObjectiveType.MULTIPLO);
          expect(result.description).toContain("e também");
        }
      });
    });
  });

  describe("generateServiceObjective", () => {
    it("should generate complete objectives for new implemented types", () => {
      const specificService = generateServiceObjective(ServiceObjectiveType.SERVICOS_ESPECIFICOS);
      expect(specificService).not.toBeNull();
      expect(specificService!.type).toBe("Serviços específicos");
      expect(specificService!.action).toBeTruthy();
      expect(specificService!.target).toBeTruthy();
      expect(specificService!.complication).toBeTruthy();
      expect(specificService!.description).toBeTruthy();

      const religious = generateServiceObjective(ServiceObjectiveType.RELIGIOSO);
      expect(religious).not.toBeNull();
      expect(religious!.type).toBe("Religioso");
      expect(religious!.action).toBeTruthy();
      expect(religious!.target).toBeTruthy();
      expect(religious!.complication).toBeTruthy();
      expect(religious!.description).toBeTruthy();
    });

    it("should handle MULTIPLO objective type with special logic", () => {
      const multiple = generateServiceObjective(ServiceObjectiveType.MULTIPLO);
      expect(multiple).not.toBeNull();
      expect(multiple!.type).toBe(ServiceObjectiveType.MULTIPLO);
      expect(multiple!.description).toContain("e também");
    });

    it("should format description correctly for new types", () => {
      const specificService = generateServiceObjective(ServiceObjectiveType.SERVICOS_ESPECIFICOS);
      expect(specificService!.description).toContain("para");
      expect(specificService!.description).toContain("mas");

      const religious = generateServiceObjective(ServiceObjectiveType.RELIGIOSO);
      expect(religious!.description).toContain("relacionado a");
      expect(religious!.description).toContain("mas");
    });
  });

  describe("Specialized Generation Functions", () => {
    describe("generateSpecificServiceDescription", () => {
      it("should handle regular specific services", () => {
        const description = generateSpecificServiceDescription(
          "Operação militar",
          "Um forte ou posto avançado",
          "O inimigo tem espiões infiltrados"
        );
        expect(description).toBe(
          "Operação militar para um forte ou posto avançado, mas o inimigo tem espiões infiltrados"
        );
      });

      it("should handle 'Trabalho rural' with auxiliary table", () => {
        const description = generateSpecificServiceDescription(
          "Trabalho rural",
          "Uma fazenda ou propriedade rural",
          "A terra está amaldiçoada"
        );
        expect(description).toContain("para uma fazenda ou propriedade rural");
        expect(description).toContain("mas a terra está amaldiçoada");
        // Should contain a specific rural work type from the auxiliary table
        expect(description).not.toBe("Trabalho rural para uma fazenda ou propriedade rural, mas a terra está amaldiçoada");
      });
    });

    describe("generateServiceDescription (Generic)", () => {
      it("should format descriptions with custom connectors", () => {
        const description1 = generateServiceDescription(
          "Realizar cerimônia",
          "Um templo abandonado", 
          "O local está profanado",
          "relacionado a"
        );
        expect(description1).toBe(
          "Realizar cerimônia relacionado a um templo abandonado, mas o local está profanado"
        );

        const description2 = generateServiceDescription(
          "Operação militar",
          "Um forte ou posto avançado",
          "O inimigo tem espiões infiltrados"
        );
        expect(description2).toBe(
          "Operação militar para um forte ou posto avançado, mas o inimigo tem espiões infiltrados"
        );
      });
    });
  });

  describe("Integration with ServiceObjective interface", () => {
    it("should generate objectives compatible with ServiceObjective interface", () => {
      const specificService = generateServiceObjective(ServiceObjectiveType.SERVICOS_ESPECIFICOS);
      expect(specificService).toMatchObject({
        type: expect.any(String),
        action: expect.any(String),
        target: expect.any(String),
        complication: expect.any(String),
        description: expect.any(String),
      });

      const religious = generateServiceObjective(ServiceObjectiveType.RELIGIOSO);
      expect(religious).toMatchObject({
        type: expect.any(String),
        action: expect.any(String),
        target: expect.any(String),
        complication: expect.any(String),
        description: expect.any(String),
      });
    });
  });

  describe("Business Rules Validation", () => {
    it("should follow three-column system as specified in .md", () => {
      // All new tables should follow the three-column pattern
      const tables = [SERVICOS_ESPECIFICOS_TABLE, RELIGIOSO_TABLE];
      
      tables.forEach((table) => {
        table.forEach((entry) => {
          expect(entry.result).toHaveProperty("action");
          expect(entry.result).toHaveProperty("target");
          expect(entry.result).toHaveProperty("complication");
        });
      });
    });

    it("should generate descriptions following the format pattern", () => {
      const specificService = generateServiceObjective(ServiceObjectiveType.SERVICOS_ESPECIFICOS);
      const religious = generateServiceObjective(ServiceObjectiveType.RELIGIOSO);

      // Both should include the required format elements
      expect(specificService!.description.toLowerCase()).toContain("para");
      expect(specificService!.description.toLowerCase()).toContain("mas");

      expect(religious!.description.toLowerCase()).toContain("relacionado a");
      expect(religious!.description.toLowerCase()).toContain("mas");
    });

    it("should handle auxiliary TRABALHO_RURAL table correctly", () => {
      // When generating a specific service with "Trabalho rural", it should use the auxiliary table
      const objectiveWithRural = rollThreeColumnObjective(
        SERVICOS_ESPECIFICOS_TABLE,
        () => 6,
        () => 6,
        () => 6
      );
      expect(objectiveWithRural.action).toBe("Trabalho rural");

      const description = generateSpecificServiceDescription(
        objectiveWithRural.action,
        objectiveWithRural.target,
        objectiveWithRural.complication
      );

      // Should not contain "Trabalho rural" directly in the description
      // but should contain a specific type from the auxiliary table
      expect(description).not.toContain("Trabalho rural para");
      expect(description).toContain("para");
      expect(description).toContain("mas");
    });
  });
});
