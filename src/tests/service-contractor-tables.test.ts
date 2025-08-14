/**
 * Testes para Tabelas de Contratantes de Serviços
 *
 * Validação completa das tabelas de contratantes
 */

import { describe, it, expect } from "vitest";
import {
  // Tabelas principais
  SERVICE_CONTRACTOR_TABLE,
  SERVICE_GOVERNMENT_CONTRACTOR_TABLE,

  // Enums
  ServiceGovernmentContractorType,
  PopulationRelationLevel,
  GovernmentRelationLevel,

  // Modificadores
  SERVICE_POPULATION_RELATION_MODIFIERS,
  SERVICE_GOVERNMENT_RELATION_MODIFIERS,

  // Funções utilitárias
  applyContractorModifiers,
  determineServiceContractor,
  mapPopulationRelation,
  mapGovernmentRelation,
  validateServiceContractorTables,

  // Tipos
  type ServiceContractorModifiers,
} from "@/data/tables/service-contractor-tables";
import { ServiceContractorType } from "@/types/service";

describe("Service Contractor Tables - Issue 5.10", () => {
  describe("SERVICE_CONTRACTOR_TABLE", () => {
    it("should have exact entries matching [2-2] Serviços - Guilda.md", () => {
      expect(SERVICE_CONTRACTOR_TABLE).toHaveLength(3);

      // Verificar entradas
      expect(SERVICE_CONTRACTOR_TABLE[0]).toEqual({
        min: 1,
        max: 6,
        result: ServiceContractorType.POVO,
      });
      expect(SERVICE_CONTRACTOR_TABLE[1]).toEqual({
        min: 7,
        max: 14,
        result: ServiceContractorType.INSTITUICAO_OFICIO,
      });
      expect(SERVICE_CONTRACTOR_TABLE[2]).toEqual({
        min: 15,
        max: 20,
        result: ServiceContractorType.GOVERNO,
      });
    });

    it("should cover range 1-20 without gaps", () => {
      const coveredNumbers = new Set<number>();

      SERVICE_CONTRACTOR_TABLE.forEach((entry) => {
        for (let i = entry.min; i <= entry.max; i++) {
          coveredNumbers.add(i);
        }
      });

      // Verificar cobertura completa de 1-20
      for (let i = 1; i <= 20; i++) {
        expect(coveredNumbers.has(i)).toBe(true);
      }
    });
  });

  describe("SERVICE_GOVERNMENT_CONTRACTOR_TABLE", () => {
    it("should have exact entries matching md table", () => {
      expect(SERVICE_GOVERNMENT_CONTRACTOR_TABLE).toHaveLength(8);

      // Verificar algumas entradas específicas
      expect(SERVICE_GOVERNMENT_CONTRACTOR_TABLE[0]).toEqual({
        min: 1,
        max: 2,
        result: ServiceGovernmentContractorType.ARCANISTA_DIPLOMATA,
      });
      expect(SERVICE_GOVERNMENT_CONTRACTOR_TABLE[4]).toEqual({
        min: 16,
        max: 16,
        result: ServiceGovernmentContractorType.AGENTE_BUROCRATICO,
      });
      expect(SERVICE_GOVERNMENT_CONTRACTOR_TABLE[7]).toEqual({
        min: 20,
        max: 20,
        result: ServiceGovernmentContractorType.LIDER_LOCAL,
      });
    });

    it("should cover range 1-20 without gaps", () => {
      const coveredNumbers = new Set<number>();

      SERVICE_GOVERNMENT_CONTRACTOR_TABLE.forEach((entry) => {
        for (let i = entry.min; i <= entry.max; i++) {
          coveredNumbers.add(i);
        }
      });

      // Verificar cobertura completa de 1-20
      for (let i = 1; i <= 20; i++) {
        expect(coveredNumbers.has(i)).toBe(true);
      }
    });
  });

  describe("Relation Modifiers", () => {
    it("should have correct population relation modifiers", () => {
      expect(
        SERVICE_POPULATION_RELATION_MODIFIERS[PopulationRelationLevel.PESSIMA]
      ).toBe(4);
      expect(
        SERVICE_POPULATION_RELATION_MODIFIERS[PopulationRelationLevel.RUIM]
      ).toBe(2);
      expect(
        SERVICE_POPULATION_RELATION_MODIFIERS[PopulationRelationLevel.DIVIDIDA]
      ).toBe(0);
      expect(
        SERVICE_POPULATION_RELATION_MODIFIERS[PopulationRelationLevel.BOA]
      ).toBe(-1);
      expect(
        SERVICE_POPULATION_RELATION_MODIFIERS[PopulationRelationLevel.MUITO_BOA]
      ).toBe(-2);
      expect(
        SERVICE_POPULATION_RELATION_MODIFIERS[PopulationRelationLevel.EXCELENTE]
      ).toBe(-5);
    });

    it("should have correct government relation modifiers", () => {
      expect(
        SERVICE_GOVERNMENT_RELATION_MODIFIERS[GovernmentRelationLevel.PESSIMA]
      ).toBe(-4);
      expect(
        SERVICE_GOVERNMENT_RELATION_MODIFIERS[GovernmentRelationLevel.RUIM]
      ).toBe(-2);
      expect(
        SERVICE_GOVERNMENT_RELATION_MODIFIERS[
          GovernmentRelationLevel.DIPLOMATICA
        ]
      ).toBe(0);
      expect(
        SERVICE_GOVERNMENT_RELATION_MODIFIERS[GovernmentRelationLevel.BOA]
      ).toBe(1);
      expect(
        SERVICE_GOVERNMENT_RELATION_MODIFIERS[GovernmentRelationLevel.MUITO_BOA]
      ).toBe(2);
      expect(
        SERVICE_GOVERNMENT_RELATION_MODIFIERS[GovernmentRelationLevel.EXCELENTE]
      ).toBe(5);
    });
  });

  describe("Utility Functions", () => {
    describe("applyContractorModifiers", () => {
      it("should apply population and government modifiers correctly", () => {
        const modifiers: ServiceContractorModifiers = {
          populationRelation: PopulationRelationLevel.BOA, // -1
          governmentRelation: GovernmentRelationLevel.PESSIMA, // -4
        };

        const result = applyContractorModifiers(10, modifiers);
        expect(result).toBe(5); // 10 + (-1) + (-4) = 5
      });

      it("should handle positive modifiers", () => {
        const modifiers: ServiceContractorModifiers = {
          populationRelation: PopulationRelationLevel.PESSIMA, // +4
          governmentRelation: GovernmentRelationLevel.EXCELENTE, // +5
        };

        const result = applyContractorModifiers(10, modifiers);
        expect(result).toBe(19); // 10 + 4 + 5 = 19
      });

      it("should handle neutral modifiers", () => {
        const modifiers: ServiceContractorModifiers = {
          populationRelation: PopulationRelationLevel.DIVIDIDA, // 0
          governmentRelation: GovernmentRelationLevel.DIPLOMATICA, // 0
        };

        const result = applyContractorModifiers(10, modifiers);
        expect(result).toBe(10); // 10 + 0 + 0 = 10
      });
    });

    describe("determineServiceContractor", () => {
      it("should return correct contractor for modified rolls", () => {
        const modifiers: ServiceContractorModifiers = {
          populationRelation: PopulationRelationLevel.BOA, // -1
          governmentRelation: GovernmentRelationLevel.EXCELENTE, // +5
        };

        // Roll 10 + (-1) + 5 = 14 → INSTITUICAO_OFICIO
        const result = determineServiceContractor(10, modifiers);
        expect(result).toBe(ServiceContractorType.INSTITUICAO_OFICIO);
      });

      it("should handle edge cases with extreme modifiers", () => {
        const negativeModifiers: ServiceContractorModifiers = {
          populationRelation: PopulationRelationLevel.EXCELENTE, // -5
          governmentRelation: GovernmentRelationLevel.PESSIMA, // -4
        };

        // Roll 5 + (-5) + (-4) = -4, clamped to 1 → POVO
        const resultNegative = determineServiceContractor(5, negativeModifiers);
        expect(resultNegative).toBe(ServiceContractorType.POVO);

        const positiveModifiers: ServiceContractorModifiers = {
          populationRelation: PopulationRelationLevel.PESSIMA, // +4
          governmentRelation: GovernmentRelationLevel.EXCELENTE, // +5
        };

        // Roll 15 + 4 + 5 = 24, above 20 → GOVERNO
        const resultPositive = determineServiceContractor(
          15,
          positiveModifiers
        );
        expect(resultPositive).toBe(ServiceContractorType.GOVERNO);
      });

      it("should handle boundary values correctly", () => {
        const neutralModifiers: ServiceContractorModifiers = {
          populationRelation: PopulationRelationLevel.DIVIDIDA,
          governmentRelation: GovernmentRelationLevel.DIPLOMATICA,
        };

        // Teste boundaries das tabelas
        expect(determineServiceContractor(6, neutralModifiers)).toBe(
          ServiceContractorType.POVO
        );
        expect(determineServiceContractor(7, neutralModifiers)).toBe(
          ServiceContractorType.INSTITUICAO_OFICIO
        );
        expect(determineServiceContractor(14, neutralModifiers)).toBe(
          ServiceContractorType.INSTITUICAO_OFICIO
        );
        expect(determineServiceContractor(15, neutralModifiers)).toBe(
          ServiceContractorType.GOVERNO
        );
        expect(determineServiceContractor(20, neutralModifiers)).toBe(
          ServiceContractorType.GOVERNO
        );
      });
    });

    describe("Relation Mapping Functions", () => {
      it("should map population relation strings correctly", () => {
        expect(mapPopulationRelation("péssima")).toBe(
          PopulationRelationLevel.PESSIMA
        );
        expect(mapPopulationRelation("Ruim")).toBe(
          PopulationRelationLevel.RUIM
        );
        expect(mapPopulationRelation("DIVIDIDA")).toBe(
          PopulationRelationLevel.DIVIDIDA
        );
        expect(mapPopulationRelation("boa")).toBe(PopulationRelationLevel.BOA);
        expect(mapPopulationRelation("muito boa")).toBe(
          PopulationRelationLevel.MUITO_BOA
        );
        expect(mapPopulationRelation("excelente")).toBe(
          PopulationRelationLevel.EXCELENTE
        );

        // Fallback para valores desconhecidos
        expect(mapPopulationRelation("desconhecido")).toBe(
          PopulationRelationLevel.DIVIDIDA
        );
      });

      it("should map government relation strings correctly", () => {
        expect(mapGovernmentRelation("péssima")).toBe(
          GovernmentRelationLevel.PESSIMA
        );
        expect(mapGovernmentRelation("Ruim")).toBe(
          GovernmentRelationLevel.RUIM
        );
        expect(mapGovernmentRelation("DIPLOMÁTICA")).toBe(
          GovernmentRelationLevel.DIPLOMATICA
        );
        expect(mapGovernmentRelation("boa")).toBe(GovernmentRelationLevel.BOA);
        expect(mapGovernmentRelation("muito boa")).toBe(
          GovernmentRelationLevel.MUITO_BOA
        );
        expect(mapGovernmentRelation("excelente")).toBe(
          GovernmentRelationLevel.EXCELENTE
        );

        // Fallback para valores desconhecidos
        expect(mapGovernmentRelation("desconhecido")).toBe(
          GovernmentRelationLevel.DIPLOMATICA
        );
      });
    });

    describe("validateServiceContractorTables", () => {
      it("should validate that all tables have complete coverage", () => {
        const isValid = validateServiceContractorTables();
        expect(isValid).toBe(true);
      });
    });
  });

  describe("Integration Tests", () => {
    it("should work with realistic guild relation scenarios", () => {
      const scenarios = [
        {
          name: "Guilda com relações ruins",
          population: "péssima",
          government: "ruim",
          baseRoll: 10,
          expectedModifiedRoll: 12, // 10 + 4 + (-2) = 12
          expectedContractor: ServiceContractorType.INSTITUICAO_OFICIO,
        },
        {
          name: "Guilda com relações excelentes",
          population: "excelente",
          government: "excelente",
          baseRoll: 15,
          expectedModifiedRoll: 15, // 15 + (-5) + 5 = 15
          expectedContractor: ServiceContractorType.GOVERNO,
        },
        {
          name: "Guilda com relações neutras",
          population: "dividida",
          government: "diplomática",
          baseRoll: 8,
          expectedModifiedRoll: 8, // 8 + 0 + 0 = 8
          expectedContractor: ServiceContractorType.INSTITUICAO_OFICIO,
        },
      ];

      scenarios.forEach((scenario) => {
        const modifiers = {
          populationRelation: mapPopulationRelation(scenario.population),
          governmentRelation: mapGovernmentRelation(scenario.government),
        };

        const modifiedRoll = applyContractorModifiers(
          scenario.baseRoll,
          modifiers
        );
        expect(modifiedRoll).toBe(scenario.expectedModifiedRoll);

        const contractor = determineServiceContractor(
          scenario.baseRoll,
          modifiers
        );
        expect(contractor).toBe(scenario.expectedContractor);
      });
    });
  });

  describe("Table Structure Validation", () => {
    it("should have all tables with proper TableEntry structure", () => {
      // Verificar estrutura da tabela principal
      SERVICE_CONTRACTOR_TABLE.forEach((entry) => {
        expect(entry).toHaveProperty("min");
        expect(entry).toHaveProperty("max");
        expect(entry).toHaveProperty("result");
        expect(typeof entry.min).toBe("number");
        expect(typeof entry.max).toBe("number");
        expect(entry.min).toBeLessThanOrEqual(entry.max);
        expect(Object.values(ServiceContractorType)).toContain(entry.result);
      });

      // Verificar estrutura da tabela de governo
      SERVICE_GOVERNMENT_CONTRACTOR_TABLE.forEach((entry) => {
        expect(entry).toHaveProperty("min");
        expect(entry).toHaveProperty("max");
        expect(entry).toHaveProperty("result");
        expect(typeof entry.min).toBe("number");
        expect(typeof entry.max).toBe("number");
        expect(entry.min).toBeLessThanOrEqual(entry.max);
        expect(Object.values(ServiceGovernmentContractorType)).toContain(
          entry.result
        );
      });
    });

    it("should have no overlapping ranges in tables", () => {
      // Testar tabela principal
      for (let i = 0; i < SERVICE_CONTRACTOR_TABLE.length - 1; i++) {
        const current = SERVICE_CONTRACTOR_TABLE[i];
        const next = SERVICE_CONTRACTOR_TABLE[i + 1];
        expect(current.max).toBeLessThan(next.min);
      }

      // Testar tabela de governo
      for (let i = 0; i < SERVICE_GOVERNMENT_CONTRACTOR_TABLE.length - 1; i++) {
        const current = SERVICE_GOVERNMENT_CONTRACTOR_TABLE[i];
        const next = SERVICE_GOVERNMENT_CONTRACTOR_TABLE[i + 1];
        expect(current.max).toBeLessThan(next.min);
      }
    });
  });
});
