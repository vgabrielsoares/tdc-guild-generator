/**
 * Testes das Tabelas de Localidades para Contratos da Guilda
 *
 * Valida a implementação das tabelas de localidades
 */

import { describe, it, expect } from "vitest";
import {
  MAIN_LOCATION_TABLE,
  LOCATION_IMPORTANCE_TABLE,
  LOCATION_PECULIARITY_TABLE,
  CIDADE_GRANDE_SPECIFICATIONS,
  RUINAS_MASMORRAS_SPECIFICATIONS,
  REGIAO_SELVAGEM_SPECIFICATIONS,
  LUGAR_ISOLADO_SPECIFICATIONS,
  ZONA_RURAL_SPECIFICATIONS,
  LOCALIDADE_EXOTICA_SPECIFICATIONS,
  PROFUNDEZAS_SPECIFICATIONS,
  TERRAS_MORBIDAS_SPECIFICATIONS,
  DISTRITO_ESPECIFICO_TABLE,
  MainLocation,
  LocationImportance,
  LocationPeculiarity,
  DistrictType,
  getLocationSpecificationTable,
  shouldRollTwiceForLocation,
  requiresDistrictRoll,
  mapLocationToCategory,
  mapUrbanSpecificationToType,
} from "@/data/tables/contract-location-tables";
import { LocationCategory, UrbanLocation } from "@/types/contract";

describe("Contract Location Tables", () => {
  describe("Main Location Table", () => {
    it("should have exactly 8 location types covering 1-20 range", () => {
      expect(MAIN_LOCATION_TABLE).toHaveLength(8);

      // Verificar cobertura completa de 1-20
      const ranges = MAIN_LOCATION_TABLE.map((entry) => ({
        min: entry.min,
        max: entry.max,
      }));

      for (let i = 1; i <= 20; i++) {
        const hasRange = ranges.some(
          (range) => i >= range.min && i <= range.max
        );
        expect(hasRange).toBe(true);
      }
    });

    it("should have correct city types according to .md file", () => {
      const cityResult = MAIN_LOCATION_TABLE.find((entry) => entry.min === 1);
      expect(cityResult?.result.category).toBe(MainLocation.CIDADE_GRANDE);
      expect(cityResult?.result.name).toBe("Cidade grande");
      expect(cityResult?.max).toBe(4);
    });

    it("should have ruins/dungeons as second most common (5-9)", () => {
      const ruinsResult = MAIN_LOCATION_TABLE.find((entry) => entry.min === 5);
      expect(ruinsResult?.result.category).toBe(MainLocation.RUINAS_MASMORRAS);
      expect(ruinsResult?.max).toBe(9);
    });

    it("should have exotic and deadly locations as rare (18-20)", () => {
      const exoticResult = MAIN_LOCATION_TABLE.find(
        (entry) => entry.min === 18
      );
      const profundezasResult = MAIN_LOCATION_TABLE.find(
        (entry) => entry.min === 19
      );
      const morbidasResult = MAIN_LOCATION_TABLE.find(
        (entry) => entry.min === 20
      );

      expect(exoticResult?.result.category).toBe(
        MainLocation.LOCALIDADE_EXOTICA
      );
      expect(profundezasResult?.result.category).toBe(MainLocation.PROFUNDEZAS);
      expect(morbidasResult?.result.category).toBe(
        MainLocation.TERRAS_MORBIDAS
      );
    });
  });

  describe("Location Characteristics Tables", () => {
    it('should have importance table with most results as "none" (1-11)', () => {
      const noneResult = LOCATION_IMPORTANCE_TABLE.find(
        (entry) => entry.min === 1
      );
      expect(noneResult?.max).toBe(11);
      expect(noneResult?.result.type).toBe(LocationImportance.NENHUMA);
      expect(noneResult?.result.name).toBe("Aparentemente nenhuma");
    });

    it('should have peculiarity table with most results as "none" (1-11)', () => {
      const noneResult = LOCATION_PECULIARITY_TABLE.find(
        (entry) => entry.min === 1
      );
      expect(noneResult?.max).toBe(11);
      expect(noneResult?.result.type).toBe(LocationPeculiarity.NENHUMA);
      expect(noneResult?.result.name).toBe("Aparentemente nenhuma");
    });

    it("should have importance table covering 1-20 with no gaps", () => {
      const ranges = LOCATION_IMPORTANCE_TABLE.map((entry) => ({
        min: entry.min,
        max: entry.max,
      }));

      for (let i = 1; i <= 20; i++) {
        const hasRange = ranges.some(
          (range) => i >= range.min && i <= range.max
        );
        expect(hasRange).toBe(true);
      }
    });

    it("should have peculiarity table covering 1-20 with no gaps", () => {
      const ranges = LOCATION_PECULIARITY_TABLE.map((entry) => ({
        min: entry.min,
        max: entry.max,
      }));

      for (let i = 1; i <= 20; i++) {
        const hasRange = ranges.some(
          (range) => i >= range.min && i <= range.max
        );
        expect(hasRange).toBe(true);
      }
    });
  });

  describe("City Specifications", () => {
    it("should have sewers as first result (1)", () => {
      const sewersResult = CIDADE_GRANDE_SPECIFICATIONS.find(
        (entry) => entry.min === 1
      );
      expect(sewersResult?.result.location).toBe(
        "Esgotos/subterrâneo da cidade"
      );
    });

    it("should have specific district option (3-4)", () => {
      const districtResult = CIDADE_GRANDE_SPECIFICATIONS.find(
        (entry) => entry.min === 3
      );
      expect(districtResult?.max).toBe(4);
      expect(districtResult?.result.location).toBe("Em um distrito específico");
    });

    it('should have "roll twice" option at 20', () => {
      const rollTwiceResult = CIDADE_GRANDE_SPECIFICATIONS.find(
        (entry) => entry.min === 20
      );
      expect(rollTwiceResult?.result.rollTwice).toBe(true);
      expect(rollTwiceResult?.result.location).toBe(
        "Role duas vezes e use ambos"
      );
    });

    it("should cover complete 1-20 range", () => {
      const ranges = CIDADE_GRANDE_SPECIFICATIONS.map((entry) => ({
        min: entry.min,
        max: entry.max,
      }));

      for (let i = 1; i <= 20; i++) {
        const hasRange = ranges.some(
          (range) => i >= range.min && i <= range.max
        );
        expect(hasRange).toBe(true);
      }
    });
  });

  describe("Ruins/Dungeons Specifications", () => {
    it("should have cave complex as first result", () => {
      const caveResult = RUINAS_MASMORRAS_SPECIFICATIONS.find(
        (entry) => entry.min === 1
      );
      expect(caveResult?.result.location).toBe("Complexo de cavernas");
    });

    it("should have dungeons as most common (12-14)", () => {
      const dungeonResult = RUINAS_MASMORRAS_SPECIFICATIONS.find(
        (entry) => entry.min === 12
      );
      expect(dungeonResult?.max).toBe(14);
      expect(dungeonResult?.result.location).toBe("Masmorra");
    });

    it("should cover complete range and have roll twice option", () => {
      const ranges = RUINAS_MASMORRAS_SPECIFICATIONS.map((entry) => ({
        min: entry.min,
        max: entry.max,
      }));
      const rollTwiceResult = RUINAS_MASMORRAS_SPECIFICATIONS.find(
        (entry) => entry.min === 20
      );

      for (let i = 1; i <= 20; i++) {
        const hasRange = ranges.some(
          (range) => i >= range.min && i <= range.max
        );
        expect(hasRange).toBe(true);
      }

      expect(rollTwiceResult?.result.rollTwice).toBe(true);
    });
  });

  describe("Wild Region Specifications", () => {
    it("should start with forest/woods", () => {
      const forestResult = REGIAO_SELVAGEM_SPECIFICATIONS.find(
        (entry) => entry.min === 1
      );
      expect(forestResult?.result.location).toBe("Floresta/bosque");
    });

    it("should have dangerous terrain options", () => {
      const desertResult = REGIAO_SELVAGEM_SPECIFICATIONS.find(
        (entry) => entry.min === 2
      );
      const swampResult = REGIAO_SELVAGEM_SPECIFICATIONS.find(
        (entry) => entry.min === 3
      );

      expect(desertResult?.result.location).toBe("Deserto escaldante");
      expect(swampResult?.result.location).toBe("Pântano viscoso");
    });
  });

  describe("Exotic Location Specifications", () => {
    it("should have feywild as most common (1-2)", () => {
      const feywildResult = LOCALIDADE_EXOTICA_SPECIFICATIONS.find(
        (entry) => entry.min === 1
      );
      expect(feywildResult?.max).toBe(2);
      expect(feywildResult?.result.location).toBe("Plano feérico");
    });

    it("should have magical forest as common option (4-6)", () => {
      const magicForestResult = LOCALIDADE_EXOTICA_SPECIFICATIONS.find(
        (entry) => entry.min === 4
      );
      expect(magicForestResult?.max).toBe(6);
      expect(magicForestResult?.result.location).toBe("Floresta mágica");
    });

    it("should have extreme exotic options like infinite library", () => {
      const libraryResult = LOCALIDADE_EXOTICA_SPECIFICATIONS.find(
        (entry) => entry.result.location === "Biblioteca infinita"
      );
      expect(libraryResult).toBeDefined();
    });
  });

  describe("District Table", () => {
    it("should have marginalized as most common (1-5)", () => {
      const marginalizedResult = DISTRITO_ESPECIFICO_TABLE.find(
        (entry) => entry.min === 1
      );
      expect(marginalizedResult?.max).toBe(5);
      expect(marginalizedResult?.result.type).toBe(DistrictType.MARGINALIZADO);
    });

    it("should have noble district as less common (17-18)", () => {
      const nobleResult = DISTRITO_ESPECIFICO_TABLE.find(
        (entry) => entry.min === 17
      );
      expect(nobleResult?.max).toBe(18);
      expect(nobleResult?.result.type).toBe(DistrictType.NOBRE);
    });

    it("should have religious as rare single option (16)", () => {
      const religiousResult = DISTRITO_ESPECIFICO_TABLE.find(
        (entry) => entry.min === 16
      );
      expect(religiousResult?.max).toBe(16);
      expect(religiousResult?.result.type).toBe(DistrictType.RELIGIOSO);
    });
  });

  describe("Utility Functions", () => {
    it("should get correct specification table for each main location", () => {
      expect(getLocationSpecificationTable(MainLocation.CIDADE_GRANDE)).toEqual(
        CIDADE_GRANDE_SPECIFICATIONS
      );
      expect(
        getLocationSpecificationTable(MainLocation.RUINAS_MASMORRAS)
      ).toEqual(RUINAS_MASMORRAS_SPECIFICATIONS);
      expect(getLocationSpecificationTable(MainLocation.ZONA_RURAL)).toEqual(
        ZONA_RURAL_SPECIFICATIONS
      );
    });

    it("should detect roll twice correctly", () => {
      const rollTwiceResult = {
        location: "Role duas vezes e use ambos",
        description: "test",
        rollTwice: true,
      };
      const normalResult = {
        location: "Normal location",
        description: "test",
      };

      expect(shouldRollTwiceForLocation(rollTwiceResult)).toBe(true);
      expect(shouldRollTwiceForLocation(normalResult)).toBe(false);
    });

    it("should detect district requirement correctly", () => {
      const districtSpec = {
        location: "Em um distrito específico",
        description: "role na tabela de distritos",
      };
      const normalSpec = {
        location: "Normal location",
        description: "normal description",
      };

      expect(requiresDistrictRoll(districtSpec)).toBe(true);
      expect(requiresDistrictRoll(normalSpec)).toBe(false);
    });

    it("should map location categories correctly", () => {
      expect(mapLocationToCategory(MainLocation.CIDADE_GRANDE)).toBe(
        LocationCategory.URBANO
      );
      expect(mapLocationToCategory(MainLocation.ZONA_RURAL)).toBe(
        LocationCategory.RURAL
      );
      expect(mapLocationToCategory(MainLocation.REGIAO_SELVAGEM)).toBe(
        LocationCategory.SELVAGEM
      );
      expect(mapLocationToCategory(MainLocation.LOCALIDADE_EXOTICA)).toBe(
        LocationCategory.PLANAR
      );
    });

    it("should map urban specifications to types correctly", () => {
      expect(mapUrbanSpecificationToType("Esgotos/subterrâneo da cidade")).toBe(
        UrbanLocation.ESGOTOS
      );
      expect(mapUrbanSpecificationToType("Em uma das tavernas")).toBe(
        UrbanLocation.TAVERNA
      );
      expect(mapUrbanSpecificationToType("Templo local")).toBe(
        UrbanLocation.TEMPLO
      );
      expect(mapUrbanSpecificationToType("Casarão nobre")).toBe(
        UrbanLocation.MANSAO_NOBRE
      );
    });
  });

  describe("Table Completeness", () => {
    const testTableCompleteness = (
      table: Array<{ min: number; max: number }>,
      tableName: string,
      expectedMin: number = 1,
      expectedMax: number = 20
    ) => {
      it(`${tableName} should have complete range coverage`, () => {
        const ranges = table.map((entry) => ({
          min: entry.min,
          max: entry.max,
        }));

        for (let i = expectedMin; i <= expectedMax; i++) {
          const hasRange = ranges.some(
            (range) => i >= range.min && i <= range.max
          );
          expect(hasRange).toBe(true);
        }
      });

      it(`${tableName} should have no overlaps`, () => {
        const ranges = table.map((entry) => ({
          min: entry.min,
          max: entry.max,
        }));

        for (let i = 0; i < ranges.length; i++) {
          for (let j = i + 1; j < ranges.length; j++) {
            const range1 = ranges[i];
            const range2 = ranges[j];

            // Check if ranges overlap
            const overlap = !(
              range1.max < range2.min || range2.max < range1.min
            );
            expect(overlap).toBe(false);
          }
        }
      });
    };

    testTableCompleteness(MAIN_LOCATION_TABLE, "Main Location Table");
    testTableCompleteness(
      LOCATION_IMPORTANCE_TABLE,
      "Location Importance Table"
    );
    testTableCompleteness(
      LOCATION_PECULIARITY_TABLE,
      "Location Peculiarity Table"
    );
    testTableCompleteness(CIDADE_GRANDE_SPECIFICATIONS, "City Specifications");
    testTableCompleteness(
      RUINAS_MASMORRAS_SPECIFICATIONS,
      "Ruins/Dungeons Specifications"
    );
    testTableCompleteness(
      REGIAO_SELVAGEM_SPECIFICATIONS,
      "Wild Region Specifications"
    );
    testTableCompleteness(
      LUGAR_ISOLADO_SPECIFICATIONS,
      "Isolated Place Specifications"
    );
    testTableCompleteness(
      ZONA_RURAL_SPECIFICATIONS,
      "Rural Zone Specifications"
    );
    testTableCompleteness(
      LOCALIDADE_EXOTICA_SPECIFICATIONS,
      "Exotic Location Specifications"
    );
    testTableCompleteness(PROFUNDEZAS_SPECIFICATIONS, "Depths Specifications");
    testTableCompleteness(
      TERRAS_MORBIDAS_SPECIFICATIONS,
      "Morbid Lands Specifications"
    );
    testTableCompleteness(DISTRITO_ESPECIFICO_TABLE, "Specific District Table");
  });
});
