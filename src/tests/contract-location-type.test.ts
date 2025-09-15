import { describe, it, expect, vi, beforeEach } from "vitest";
import { ContractGenerator } from "../../src/utils/generators/contractGenerator";
import { rollOnTable } from "../../src/utils/tableRoller";
import { LOCATION_TYPE_TABLE } from "../../src/data/tables/contract-content-tables";
import { LocationType } from "../../src/types/contract";

// Mock das dependências
vi.mock("../../src/utils/tableRoller");
vi.mock("../../src/utils/dice");

const mockRollOnTable = vi.mocked(rollOnTable);

describe("Contract Generator - Location Type Specification", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("applyLocationTypeIfNeeded", () => {
    it("should apply location type when target contains 'local ou território'", () => {
      // Mock da rolagem de tipo de local para retornar "Local mágico"
      mockRollOnTable.mockReturnValue({
        roll: 11,
        result: {
          type: LocationType.MAGICO,
          description: "Local mágico",
        },
        entry: {
          min: 11,
          max: 12,
          result: { type: LocationType.MAGICO, description: "Local mágico" },
        },
        modifiers: [],
        finalRoll: 11,
      });

      // Usar reflexão para acessar o método privado
      const applyLocationTypeIfNeeded = (
        ContractGenerator as unknown as {
          applyLocationTypeIfNeeded: (spec: {
            target: string;
            description: string;
          }) => { target: string; description: string };
        }
      ).applyLocationTypeIfNeeded;

      const specification = {
        target: "Um local ou território",
        description: "Destruir ou tomar um local específico",
      };

      const result = applyLocationTypeIfNeeded.call(
        ContractGenerator,
        specification
      );

      expect(result.target).toBe("Um local mágico");
      expect(result.description).toBe(
        "Destruir ou tomar um local específico (Local mágico)"
      );
      expect(mockRollOnTable).toHaveBeenCalledWith(LOCATION_TYPE_TABLE);
    });

    it("should apply location type for mixed case 'Local ou Território'", () => {
      // Mock da rolagem de tipo de local para retornar "Local sagrado"
      mockRollOnTable.mockReturnValue({
        roll: 13,
        result: {
          type: LocationType.SAGRADO,
          description: "Local sagrado",
        },
        entry: {
          min: 13,
          max: 14,
          result: { type: LocationType.SAGRADO, description: "Local sagrado" },
        },
        modifiers: [],
        finalRoll: 13,
      });

      const applyLocationTypeIfNeeded = (
        ContractGenerator as unknown as {
          applyLocationTypeIfNeeded: (spec: {
            target: string;
            description: string;
          }) => { target: string; description: string };
        }
      ).applyLocationTypeIfNeeded;

      const specification = {
        target: "Um Local ou Território",
        description: "Proteger local importante",
      };

      const result = applyLocationTypeIfNeeded.call(
        ContractGenerator,
        specification
      );

      expect(result.target).toBe("Um local sagrado");
      expect(result.description).toBe(
        "Proteger local importante (Local sagrado)"
      );
    });

    it("should not apply location type when target does not contain 'local ou território'", () => {
      const applyLocationTypeIfNeeded = (
        ContractGenerator as unknown as {
          applyLocationTypeIfNeeded: (spec: {
            target: string;
            description: string;
          }) => { target: string; description: string };
        }
      ).applyLocationTypeIfNeeded;

      const specification = {
        target: "Uma criatura ou monstro",
        description: "Eliminar uma criatura perigosa",
      };

      const result = applyLocationTypeIfNeeded.call(
        ContractGenerator,
        specification
      );

      expect(result).toEqual(specification);
      expect(mockRollOnTable).not.toHaveBeenCalled();
    });

    it("should handle all location types correctly", () => {
      const applyLocationTypeIfNeeded = (
        ContractGenerator as unknown as {
          applyLocationTypeIfNeeded: (spec: {
            target: string;
            description: string;
          }) => { target: string; description: string };
        }
      ).applyLocationTypeIfNeeded;

      const testCases = [
        {
          mockRoll: 5,
          expectedType: LocationType.MUNDANO,
          expectedDescription: "Local ou território mundano",
        },
        {
          mockRoll: 11,
          expectedType: LocationType.MAGICO,
          expectedDescription: "Local mágico",
        },
        {
          mockRoll: 13,
          expectedType: LocationType.SAGRADO,
          expectedDescription: "Local sagrado",
        },
        {
          mockRoll: 15,
          expectedType: LocationType.PROFANO,
          expectedDescription: "Local profano",
        },
        {
          mockRoll: 17,
          expectedType: LocationType.ESTRANHO,
          expectedDescription: "Local estranho",
        },
      ];

      testCases.forEach(({ mockRoll, expectedType, expectedDescription }) => {
        vi.clearAllMocks();
        mockRollOnTable.mockReturnValue({
          roll: mockRoll,
          result: {
            type: expectedType,
            description: expectedDescription,
          },
          entry: {
            min: mockRoll,
            max: mockRoll,
            result: { type: expectedType, description: expectedDescription },
          },
          modifiers: [],
          finalRoll: mockRoll,
        });

        const specification = {
          target: "Um local ou território",
          description: "Localizar local específico",
        };

        const result = applyLocationTypeIfNeeded.call(
          ContractGenerator,
          specification
        );

        expect(result.target).toBe(`Um ${expectedDescription.toLowerCase()}`);
        expect(result.description).toBe(
          `Localizar local específico (${expectedDescription})`
        );
      });
    });
  });

  describe("generateObjectiveSpecification integration", () => {
    it("should have imported LOCATION_TYPE_TABLE correctly", () => {
      // Verificar que a tabela foi importada e tem o formato correto
      expect(LOCATION_TYPE_TABLE).toBeDefined();
      expect(Array.isArray(LOCATION_TYPE_TABLE)).toBe(true);
      expect(LOCATION_TYPE_TABLE.length).toBe(5);

      // Verificar se contém os tipos de local esperados
      const descriptions = LOCATION_TYPE_TABLE.map(
        (entry) => entry.result.description
      );
      expect(descriptions).toContain("Local ou território mundano");
      expect(descriptions).toContain("Local mágico");
      expect(descriptions).toContain("Local sagrado");
      expect(descriptions).toContain("Local profano");
      expect(descriptions).toContain("Local estranho");
    });
  });
});
