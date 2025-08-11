/**
 * Testes para Tabelas de Contratantes e Objetivos de Contratos
 *
 * Valida todas as tabelas e funcionalidades da Issue 4.6:
 * - Contratantes (Povo/Instituição/Governo)
 * - Contratantes específicos do governo
 * - Objetivos principais e suas especificações
 * - Modificadores de relação
 * - Funções utilitárias
 */

import { describe, it, expect } from "vitest";
import {
  CONTRACTOR_TABLE,
  GOVERNMENT_CONTRACTOR_TABLE,
  MAIN_OBJECTIVE_TABLE,
  CONTRACTOR_RELATION_MODIFIERS,
  ATTACK_DESTROY_SPECIFICATIONS,
  FIND_RECOVER_SPECIFICATIONS,
  CAPTURE_SPECIFICATIONS,
  PROTECT_SAVE_SPECIFICATIONS,
  EXPLORE_DISCOVER_SPECIFICATIONS,
  DELIVER_RECEIVE_SPECIFICATIONS,
  INVESTIGATE_SABOTAGE_SPECIFICATIONS,
  DANGEROUS_SERVICES_SPECIFICATIONS,
  RELIGIOUS_SPECIFICATIONS,
  LOCATION_TYPE_TABLE,
  GovernmentContractorType,
  applyContractorRelationModifiers,
  getObjectiveSpecificationTable,
  shouldRollTwiceForObjective,
  shouldRollTwiceForSpecification,
} from "@/data/tables/contract-content-tables";
import {
  ContractorType,
  ObjectiveCategory,
  LocationType,
} from "@/types/contract";

describe("Contract Content Tables - Issue 4.6", () => {
  // =============================================
  // TESTES DE ESTRUTURA DAS TABELAS
  // =============================================

  describe("Table Structure Validation", () => {
    it("should have complete contractor table covering 1-20", () => {
      expect(CONTRACTOR_TABLE).toHaveLength(3);

      expect(CONTRACTOR_TABLE[0]).toMatchObject({
        min: 1,
        max: 12,
        result: { type: ContractorType.POVO, description: "Povo" },
      });

      expect(CONTRACTOR_TABLE[1]).toMatchObject({
        min: 13,
        max: 14,
        result: {
          type: ContractorType.INSTITUICAO,
          description: "Instituição de Ofício",
        },
      });

      expect(CONTRACTOR_TABLE[2]).toMatchObject({
        min: 15,
        max: 20,
        result: { type: ContractorType.GOVERNO, description: "Governo" },
      });
    });

    it("should have complete government contractor table covering 1-20", () => {
      expect(GOVERNMENT_CONTRACTOR_TABLE).toHaveLength(8);

      // Verificar alguns entries específicos
      const arcanist = GOVERNMENT_CONTRACTOR_TABLE.find(
        (entry) =>
          entry.result.type === GovernmentContractorType.ARCANISTA_DIPLOMATA
      );
      expect(arcanist).toMatchObject({
        min: 1,
        max: 2,
        result: { name: "Arcanista diplomata" },
      });

      const localLeader = GOVERNMENT_CONTRACTOR_TABLE.find(
        (entry) => entry.result.type === GovernmentContractorType.LIDER_LOCAL
      );
      expect(localLeader).toMatchObject({
        min: 20,
        max: 20,
        result: { name: "Líder local" },
      });
    });

    it("should have main objective table covering 1-20", () => {
      expect(MAIN_OBJECTIVE_TABLE).toHaveLength(10);

      // Verificar distribuição conforme arquivo .md
      const attackDestroy = MAIN_OBJECTIVE_TABLE.find(
        (entry) => entry.result.category === ObjectiveCategory.ATACAR_DESTRUIR
      );
      expect(attackDestroy).toMatchObject({
        min: 1,
        max: 2,
        result: { name: "Atacar ou destruir" },
      });

      const dangerous = MAIN_OBJECTIVE_TABLE.find(
        (entry) =>
          entry.result.category === ObjectiveCategory.SERVICOS_PERIGOSOS
      );
      expect(dangerous).toMatchObject({
        min: 15,
        max: 18,
        result: { name: "Serviços perigosos" },
      });
    });

    it("should have all objective specification tables with 20 entries", () => {
      const specTables = [
        ATTACK_DESTROY_SPECIFICATIONS,
        FIND_RECOVER_SPECIFICATIONS,
        CAPTURE_SPECIFICATIONS,
        PROTECT_SAVE_SPECIFICATIONS,
        EXPLORE_DISCOVER_SPECIFICATIONS,
        DELIVER_RECEIVE_SPECIFICATIONS,
        INVESTIGATE_SABOTAGE_SPECIFICATIONS,
        DANGEROUS_SERVICES_SPECIFICATIONS,
        RELIGIOUS_SPECIFICATIONS,
      ];

      specTables.forEach((table) => {
        expect(table.length).toBeGreaterThan(0);

        // Verificar que o último entry sempre termina em 20
        const lastEntry = table[table.length - 1];
        expect(lastEntry.max).toBe(20);

        // Verificar que sempre tem o resultado "Role duas vezes"
        expect(lastEntry.result.rollTwice).toBe(true);
      });
    });
  });

  // =============================================
  // TESTES DE MODIFICADORES DE RELAÇÃO
  // =============================================

  describe("Relation Modifiers", () => {
    it("should have correct population relation modifiers", () => {
      const popModifiers = CONTRACTOR_RELATION_MODIFIERS.population;

      expect(popModifiers.pessima).toBe(4);
      expect(popModifiers.ruim).toBe(2);
      expect(popModifiers.dividida).toBe(0);
      expect(popModifiers.boa).toBe(-1);
      expect(popModifiers.muito_boa).toBe(-2);
      expect(popModifiers.excelente).toBe(-5);
    });

    it("should have correct government relation modifiers", () => {
      const govModifiers = CONTRACTOR_RELATION_MODIFIERS.government;

      expect(govModifiers.pessima).toBe(-4);
      expect(govModifiers.ruim).toBe(-2);
      expect(govModifiers.diplomatica).toBe(0);
      expect(govModifiers.boa).toBe(1);
      expect(govModifiers.muito_boa).toBe(2);
      expect(govModifiers.excelente).toBe(5);
    });

    it("should apply relation modifiers correctly", () => {
      // Teste com relação péssima com população e governo
      const roll1 = applyContractorRelationModifiers(10, "pessima", "pessima");
      expect(roll1).toBe(10); // 10 + 4 - 4 = 10

      // Teste com relação excelente com população e governo
      const roll2 = applyContractorRelationModifiers(
        10,
        "excelente",
        "excelente"
      );
      expect(roll2).toBe(10); // 10 - 5 + 5 = 10

      // Teste extremo que deve ser limitado ao máximo
      const roll3 = applyContractorRelationModifiers(1, "pessima", "excelente");
      expect(roll3).toBe(10); // 1 + 4 + 5 = 10

      // Teste extremo inferior que deve ser limitado
      const roll4 = applyContractorRelationModifiers(5, "excelente", "pessima");
      expect(roll4).toBe(1); // 5 - 5 - 4 = -4, limitado a 1

      // Teste com limites superiores
      const roll5 = applyContractorRelationModifiers(
        19,
        "pessima",
        "excelente"
      );
      expect(roll5).toBe(20); // 19 + 4 + 5 = 28, limitado a 20
    });
  });

  // =============================================
  // TESTES DE OBJETIVOS E ESPECIFICAÇÕES
  // =============================================

  describe("Objectives and Specifications", () => {
    it("should return correct specification table for each objective category", () => {
      expect(
        getObjectiveSpecificationTable(ObjectiveCategory.ATACAR_DESTRUIR)
      ).toBe(ATTACK_DESTROY_SPECIFICATIONS);

      expect(
        getObjectiveSpecificationTable(ObjectiveCategory.ENCONTRAR_RECUPERAR)
      ).toBe(FIND_RECOVER_SPECIFICATIONS);

      expect(getObjectiveSpecificationTable(ObjectiveCategory.CAPTURAR)).toBe(
        CAPTURE_SPECIFICATIONS
      );

      expect(
        getObjectiveSpecificationTable(ObjectiveCategory.PROTEGER_SALVAR)
      ).toBe(PROTECT_SAVE_SPECIFICATIONS);

      expect(
        getObjectiveSpecificationTable(ObjectiveCategory.EXPLORAR_DESCOBRIR)
      ).toBe(EXPLORE_DISCOVER_SPECIFICATIONS);

      expect(
        getObjectiveSpecificationTable(ObjectiveCategory.ENTREGAR_RECEBER)
      ).toBe(DELIVER_RECEIVE_SPECIFICATIONS);

      expect(
        getObjectiveSpecificationTable(ObjectiveCategory.INVESTIGAR_SABOTAR)
      ).toBe(INVESTIGATE_SABOTAGE_SPECIFICATIONS);

      expect(
        getObjectiveSpecificationTable(ObjectiveCategory.SERVICOS_PERIGOSOS)
      ).toBe(DANGEROUS_SERVICES_SPECIFICATIONS);

      expect(getObjectiveSpecificationTable(ObjectiveCategory.RELIGIOSO)).toBe(
        RELIGIOUS_SPECIFICATIONS
      );
    });

    it("should throw error for invalid objective category", () => {
      expect(() =>
        getObjectiveSpecificationTable("invalid" as ObjectiveCategory)
      ).toThrow("Categoria de objetivo não reconhecida");
    });

    it("should detect roll twice for main objectives correctly", () => {
      const rollTwiceObjective = {
        category: ObjectiveCategory.ATACAR_DESTRUIR,
        name: "Role duas vezes e use ambos",
        description: "Multiple objectives",
      };

      const normalObjective = {
        category: ObjectiveCategory.ATACAR_DESTRUIR,
        name: "Atacar ou destruir",
        description: "Eliminar, destruir ou atacar um alvo específico",
      };

      expect(shouldRollTwiceForObjective(rollTwiceObjective)).toBe(true);
      expect(shouldRollTwiceForObjective(normalObjective)).toBe(false);
    });

    it("should detect roll twice for specifications correctly", () => {
      const rollTwiceSpec = {
        target: "Role duas vezes e use ambos",
        description: "Multiple targets",
        rollTwice: true,
      };

      const normalSpec = {
        target: "Uma pessoa poderosa",
        description: "Normal target",
      };

      expect(shouldRollTwiceForSpecification(rollTwiceSpec)).toBe(true);
      expect(shouldRollTwiceForSpecification(normalSpec)).toBe(false);
    });
  });

  // =============================================
  // TESTES DE CONTEÚDO ESPECÍFICO
  // =============================================

  describe("Specific Content Validation", () => {
    describe("Attack/Destroy Specifications", () => {
      it("should have specific targets from markdown file", () => {
        const person = ATTACK_DESTROY_SPECIFICATIONS.find(
          (entry) => entry.result.target === "Uma pessoa poderosa"
        );
        expect(person).toBeDefined();
        expect(person?.min).toBe(1);
        expect(person?.max).toBe(1);

        const creature = ATTACK_DESTROY_SPECIFICATIONS.find(
          (entry) => entry.result.target === "Uma criatura ou monstro"
        );
        expect(creature).toBeDefined();
        expect(creature?.min).toBe(7);
        expect(creature?.max).toBe(10);
      });
    });

    describe("Find/Recover Specifications", () => {
      it("should have magical artifacts and creatures", () => {
        const artifact = FIND_RECOVER_SPECIFICATIONS.find(
          (entry) => entry.result.target === "Um artefato mágico ou grimório"
        );
        expect(artifact).toBeDefined();

        const creatures = FIND_RECOVER_SPECIFICATIONS.find(
          (entry) =>
            entry.result.target ===
            "Uma ou mais criaturas desaparecidas ou sequestradas"
        );
        expect(creatures).toBeDefined();
        expect(creatures?.min).toBe(2);
        expect(creatures?.max).toBe(3);
      });
    });

    describe("Religious Specifications", () => {
      it("should have religious-specific content", () => {
        const undead = RELIGIOUS_SPECIFICATIONS.find(
          (entry) =>
            entry.result.target ===
            "Expulsar mortos-vivos de uma tumba ou cripta"
        );
        expect(undead).toBeDefined();
        expect(undead?.min).toBe(1);
        expect(undead?.max).toBe(2);

        const cult = RELIGIOUS_SPECIFICATIONS.find(
          (entry) => entry.result.target === "Destituir um culto maligno"
        );
        expect(cult).toBeDefined();
      });
    });
  });

  // =============================================
  // TESTES DE TABELAS AUXILIARES
  // =============================================

  describe("Auxiliary Tables", () => {
    it("should have location type table covering 1-20", () => {
      expect(LOCATION_TYPE_TABLE).toHaveLength(5);

      const mundane = LOCATION_TYPE_TABLE.find(
        (entry) => entry.result.type === LocationType.MUNDANO
      );
      expect(mundane).toMatchObject({
        min: 1,
        max: 10,
        result: { description: "Local ou território mundano" },
      });

      const strange = LOCATION_TYPE_TABLE.find(
        (entry) => entry.result.type === LocationType.ESTRANHO
      );
      expect(strange).toMatchObject({
        min: 17,
        max: 20,
        result: { description: "Local estranho" },
      });
    });
  });

  // =============================================
  // TESTES DE INTEGRAÇÃO E LÓGICA DE NEGÓCIO
  // =============================================

  describe("Business Logic Integration", () => {
    it("should maintain proper relationship between contractors and relations", () => {
      // Testa se contratantes do povo são favorecidos com boa relação popular
      const baseRoll = 15; // Normalmente seria governo
      const modifiedRoll = applyContractorRelationModifiers(
        baseRoll,
        "excelente",
        "pessima"
      );

      // 15 - 5 (pop excelente) - 4 (gov péssima) = 6, que ainda é povo (1-12)
      expect(modifiedRoll).toBe(6);

      const contractorResult = CONTRACTOR_TABLE.find(
        (entry) => modifiedRoll >= entry.min && modifiedRoll <= entry.max
      );
      expect(contractorResult?.result.type).toBe(ContractorType.POVO);
    });

    it("should have consistent target and description structure", () => {
      // Verificar que todas as especificações têm target e description válidos
      const allSpecs = [
        ...ATTACK_DESTROY_SPECIFICATIONS,
        ...FIND_RECOVER_SPECIFICATIONS,
        ...CAPTURE_SPECIFICATIONS,
        ...PROTECT_SAVE_SPECIFICATIONS,
        ...EXPLORE_DISCOVER_SPECIFICATIONS,
        ...DELIVER_RECEIVE_SPECIFICATIONS,
        ...INVESTIGATE_SABOTAGE_SPECIFICATIONS,
        ...DANGEROUS_SERVICES_SPECIFICATIONS,
        ...RELIGIOUS_SPECIFICATIONS,
      ];

      // Verificar que todas as especificações têm target e description não-vazios
      const hasValidTargets = allSpecs.every(
        (spec) => spec.result.target && spec.result.target.length > 0
      );
      const hasValidDescriptions = allSpecs.every(
        (spec) => spec.result.description && spec.result.description.length > 0
      );

      expect(hasValidTargets).toBe(true);
      expect(hasValidDescriptions).toBe(true);
      expect(allSpecs.length).toBeGreaterThan(0);
    });

    it("should have proper government contractor distribution", () => {
      // Verificar distribuição de poder nos contratantes do governo
      const nobles = GOVERNMENT_CONTRACTOR_TABLE.filter(
        (entry) => entry.result.type === GovernmentContractorType.NOBRE_PODEROSO
      );
      expect(nobles).toHaveLength(1);
      expect(nobles[0].max - nobles[0].min + 1).toBe(5); // 6-10, 5 slots

      const family = GOVERNMENT_CONTRACTOR_TABLE.filter(
        (entry) =>
          entry.result.type === GovernmentContractorType.FAMILIA_GOVERNANTE
      );
      expect(family).toHaveLength(1);
      expect(family[0].max - family[0].min + 1).toBe(5); // 11-15, 5 slots
    });
  });

  // =============================================
  // TESTES DE VALIDAÇÃO DE DADOS
  // =============================================

  describe("Data Validation", () => {
    it("should have all objective categories represented", () => {
      const representedCategories = MAIN_OBJECTIVE_TABLE.map(
        (entry) => entry.result.category
      );
      const uniqueCategories = new Set(representedCategories);

      // Verificar que temos a quantidade esperada de categorias únicas
      // (10 entradas, mas 1 é "role duas vezes", então 9 categorias únicas)
      expect(uniqueCategories.size).toBe(9);

      // Verificar categorias específicas importantes
      expect(uniqueCategories.has(ObjectiveCategory.ATACAR_DESTRUIR)).toBe(
        true
      );
      expect(uniqueCategories.has(ObjectiveCategory.RELIGIOSO)).toBe(true);
      expect(uniqueCategories.has(ObjectiveCategory.SERVICOS_PERIGOSOS)).toBe(
        true
      );
    });

    it("should have consistent table entry structure", () => {
      // Verificar que todas as tabelas seguem a estrutura TableEntry
      const allTables = [
        CONTRACTOR_TABLE,
        GOVERNMENT_CONTRACTOR_TABLE,
        MAIN_OBJECTIVE_TABLE,
        ATTACK_DESTROY_SPECIFICATIONS,
        LOCATION_TYPE_TABLE,
      ];

      allTables.forEach((table) => {
        table.forEach((entry) => {
          expect(entry).toHaveProperty("min");
          expect(entry).toHaveProperty("max");
          expect(entry).toHaveProperty("result");
          expect(typeof entry.min).toBe("number");
          expect(typeof entry.max).toBe("number");
          expect(entry.min).toBeLessThanOrEqual(entry.max);
        });
      });
    });

    it("should have proper descriptions for all entries", () => {
      // Verificar que todas as entradas têm descrições válidas
      GOVERNMENT_CONTRACTOR_TABLE.forEach((entry) => {
        expect(entry.result.description).toBeTruthy();
        expect(entry.result.description.length).toBeGreaterThan(10);
      });

      MAIN_OBJECTIVE_TABLE.forEach((entry) => {
        expect(entry.result.description).toBeTruthy();
        expect(entry.result.description.length).toBeGreaterThan(10);
      });
    });
  });
});
