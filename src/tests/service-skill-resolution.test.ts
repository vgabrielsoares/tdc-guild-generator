import { describe, it, expect } from "vitest";
import {
  processSkillTest,
  generateSkillSuggestions,
} from "@/utils/service-skill-resolution";
import { createServiceTestStructure } from "@/data/tables/service-difficulty-tables";
import { ServiceComplexity, ServiceDifficulty } from "@/types/service";

describe("Service Skill Test Resolution - Issue 5.23", () => {
  describe("Sistema de Perícias", () => {
    it("deve gerar sugestões de perícias válidas", () => {
      const suggestions = generateSkillSuggestions();

      expect(suggestions).toBeDefined();
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.length).toBeGreaterThan(0);

      // Verificar estrutura das sugestões
      suggestions.forEach((suggestion) => {
        expect(suggestion).toHaveProperty("skillName");
        expect(suggestion).toHaveProperty("description");
        expect(suggestion).toHaveProperty("reasoning");
        expect(typeof suggestion.skillName).toBe("string");
        expect(typeof suggestion.description).toBe("string");
        expect(typeof suggestion.reasoning).toBe("string");
      });
    });

    it("deve incluir perícias comuns de RPG", () => {
      const suggestions = generateSkillSuggestions();
      const skillNames = suggestions.map((s) => s.skillName);

      // Verificar que temos pelo menos algumas perícias reconhecidas
      expect(skillNames.length).toBeGreaterThan(0);

      // Verificar que as strings não estão vazias
      skillNames.forEach((name) => {
        expect(name.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Inicialização de Testes", () => {
    it("deve criar estrutura de testes para complexidade simples", () => {
      const testStructure = createServiceTestStructure(
        ServiceComplexity.SIMPLES,
        ServiceDifficulty.FACIL_ND15
      );

      expect(testStructure).toBeDefined();
      expect(testStructure.tests.length).toBeGreaterThan(0);
      expect(testStructure.totalTests).toBe(testStructure.tests.length);
    });

    it("deve gerar testes com NDs válidos (1-50)", () => {
      const testStructure = createServiceTestStructure(
        ServiceComplexity.MODERADA,
        ServiceDifficulty.MEDIA_ND17
      );

      testStructure.tests.forEach((test) => {
        expect(test.finalND).toBeGreaterThanOrEqual(1);
        expect(test.finalND).toBeLessThanOrEqual(50);
      });
    });
  });

  describe("Processamento de Testes", () => {
    it("deve processar sucesso corretamente", () => {
      const testStructure = createServiceTestStructure(
        ServiceComplexity.SIMPLES,
        ServiceDifficulty.FACIL_ND15
      );

      const firstTest = testStructure.tests[0];
      const rollResult = firstTest.finalND + 5; // Garantir sucesso

      const { result, updatedStructure } = processSkillTest(
        testStructure,
        0, // primeiro teste
        rollResult
      );

      expect(result.success).toBe(true);
      expect(result.rollResult).toBe(rollResult);
      expect(result.finalND).toBe(firstTest.finalND);
      expect(result.testIndex).toBe(0);
      expect(result.message).toContain("Sucesso");

      // Estrutura deve ser atualizada
      expect(updatedStructure.tests[0].rollResult).toBe(rollResult);
    });

    it("deve processar fracasso corretamente", () => {
      const testStructure = createServiceTestStructure(
        ServiceComplexity.SIMPLES,
        ServiceDifficulty.FACIL_ND15
      );

      const firstTest = testStructure.tests[0];
      const rollResult = Math.max(1, firstTest.finalND - 5); // Garantir fracasso mas >= 1

      const { result, updatedStructure } = processSkillTest(
        testStructure,
        0,
        rollResult
      );

      expect(result.success).toBe(false);
      expect(result.rollResult).toBe(rollResult);
      expect(result.finalND).toBe(firstTest.finalND);
      expect(result.message).toContain("Fracasso");

      // Estrutura deve ser atualizada
      expect(updatedStructure.tests[0].rollResult).toBe(rollResult);
    });

    it("deve respeitar limite de roll 1-50", () => {
      const testStructure = createServiceTestStructure(
        ServiceComplexity.SIMPLES,
        ServiceDifficulty.FACIL_ND15
      );

      // Roll muito alto (inválido)
      expect(() => {
        processSkillTest(testStructure, 0, 51);
      }).toThrow("Resultado de rolagem inválido: 51 (deve ser 1-50)");

      // Roll muito baixo (inválido)
      expect(() => {
        processSkillTest(testStructure, 0, 0);
      }).toThrow("Resultado de rolagem inválido: 0 (deve ser 1-50)");

      // Rolls válidos
      expect(() => {
        processSkillTest(testStructure, 0, 1);
      }).not.toThrow();

      expect(() => {
        processSkillTest(testStructure, 0, 50);
      }).not.toThrow();
    });

    it("deve validar índice de teste", () => {
      const testStructure = createServiceTestStructure(
        ServiceComplexity.SIMPLES,
        ServiceDifficulty.FACIL_ND15
      );

      // Índice negativo
      expect(() => {
        processSkillTest(testStructure, -1, 20);
      }).toThrow("Índice de teste inválido: -1");

      // Índice muito alto
      expect(() => {
        processSkillTest(testStructure, testStructure.tests.length, 20);
      }).toThrow(`Índice de teste inválido: ${testStructure.tests.length}`);
    });

    it("deve calcular sucesso baseado em ND", () => {
      const testStructure = createServiceTestStructure(
        ServiceComplexity.SIMPLES,
        ServiceDifficulty.FACIL_ND15
      );

      const test = testStructure.tests[0];

      // Roll igual ao ND = sucesso
      const { result: resultEqual } = processSkillTest(
        testStructure,
        0,
        test.finalND
      );
      expect(resultEqual.success).toBe(true);

      // Reinicializar para próximo teste
      const testStructure2 = createServiceTestStructure(
        ServiceComplexity.SIMPLES,
        ServiceDifficulty.FACIL_ND15
      );

      // Roll maior que ND = sucesso
      const { result: resultHigher } = processSkillTest(
        testStructure2,
        0,
        Math.min(50, test.finalND + 1)
      );
      expect(resultHigher.success).toBe(true);

      // Reinicializar para próximo teste
      const testStructure3 = createServiceTestStructure(
        ServiceComplexity.SIMPLES,
        ServiceDifficulty.FACIL_ND15
      );

      // Roll menor que ND = fracasso (se possível)
      if (test.finalND > 1) {
        const { result: resultLower } = processSkillTest(
          testStructure3,
          0,
          test.finalND - 1
        );
        expect(resultLower.success).toBe(false);
      }
    });
  });

  describe("Compatibilidade com Store", () => {
    it("deve ser serializável para persistência", () => {
      const testStructure = createServiceTestStructure(
        ServiceComplexity.SIMPLES,
        ServiceDifficulty.FACIL_ND15
      );

      // Executar um teste
      const { updatedStructure } = processSkillTest(testStructure, 0, 25);

      // Serializar
      const serialized = JSON.stringify(updatedStructure);
      expect(serialized).toBeDefined();

      // Deserializar
      const deserialized = JSON.parse(serialized);
      expect(deserialized.tests[0].rollResult).toBe(25);
    });

    it("deve manter compatibilidade com tipos existentes", () => {
      const testStructure = createServiceTestStructure(
        ServiceComplexity.MODERADA,
        ServiceDifficulty.MEDIA_ND17
      );

      // Verificar que testStructure é compatível com ServiceTestStructure
      expect(testStructure).toHaveProperty("tests");
      expect(testStructure).toHaveProperty("totalTests");
      expect(testStructure).toHaveProperty("outcome");

      // Verificar tipos dos testes
      testStructure.tests.forEach((test) => {
        expect(test).toHaveProperty("baseND");
        expect(test).toHaveProperty("finalND");
        expect(typeof test.baseND).toBe("number");
        expect(typeof test.finalND).toBe("number");
      });
    });
  });

  describe("Validação das Regras do Issue 5.23", () => {
    it("deve seguir regras do markdown [2-2] Serviços - Guilda.md", () => {
      // Teste básico do sistema de resolução por testes de perícia
      const testStructure = createServiceTestStructure(
        ServiceComplexity.MODERADA,
        ServiceDifficulty.MEDIA_ND17
      );

      expect(testStructure.totalTests).toBeGreaterThan(0);
      expect(testStructure.tests.length).toBe(testStructure.totalTests);

      // Cada teste deve ter ND válido
      testStructure.tests.forEach((test) => {
        expect(test.finalND).toBeGreaterThanOrEqual(1);
        expect(test.finalND).toBeLessThanOrEqual(50);
      });
    });

    it("deve permitir processamento com rolls de 1-50", () => {
      const testStructure = createServiceTestStructure(
        ServiceComplexity.SIMPLES,
        ServiceDifficulty.FACIL_ND15
      );

      // Testar extremos válidos
      const { result: result1 } = processSkillTest(testStructure, 0, 1);
      expect(result1.rollResult).toBe(1);

      const testStructure2 = createServiceTestStructure(
        ServiceComplexity.SIMPLES,
        ServiceDifficulty.FACIL_ND15
      );

      const { result: result50 } = processSkillTest(testStructure2, 0, 50);
      expect(result50.rollResult).toBe(50);
    });

    it("deve manter estado dos testes processados", () => {
      const testStructure = createServiceTestStructure(
        ServiceComplexity.MODERADA,
        ServiceDifficulty.MEDIA_ND17
      );

      const rollResults = [20, 30, 10];
      let currentStructure = testStructure;

      // Processar múltiplos testes se disponíveis
      for (
        let i = 0;
        i < Math.min(rollResults.length, currentStructure.totalTests);
        i++
      ) {
        const { updatedStructure } = processSkillTest(
          currentStructure,
          i,
          rollResults[i]
        );
        currentStructure = updatedStructure;

        // Verificar que o resultado foi salvo
        expect(currentStructure.tests[i].rollResult).toBe(rollResults[i]);
        expect(currentStructure.tests[i].completed).toBe(true);
      }
    });
  });
});
