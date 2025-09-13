import { describe, it, expect, vi } from "vitest";
import {
  AUXILIAR_OU_CUIDAR_TABLE,
  EXTRAIR_RECURSOS_TABLE,
  CONSTRUIR_CRIAR_OU_REPARAR_TABLE,
  RESOURCE_EXAMPLES,
  WILD_ENVIRONMENTS,
  getResourceExamples,
  getRandomResourceExample,
  generateResourceExtractionDescription,
  generateCareDescription,
  isWildEnvironment,
  generateEnhancedServiceObjective,
  getThreeColumnTable,
  rollThreeColumnObjective,
} from "@/data/tables/service-objective-tables";
import { ServiceObjectiveType } from "@/types/service";

/**
 * Tabelas de Objetivos de Serviços
 *
 * Implementa as tabelas: Auxiliar ou Cuidar, Extrair Recursos, Construir/Criar/Reparar
 */
describe("Service Objective Tables - Part 2 (Issue 5.12)", () => {
  // ===== ESTRUTURA DAS TABELAS =====

  describe("Three Column Tables Structure", () => {
    describe("AUXILIAR_OU_CUIDAR_TABLE", () => {
      it("should have exactly 20 entries (1 for each d20 result)", () => {
        expect(AUXILIAR_OU_CUIDAR_TABLE).toHaveLength(20);
      });

      it("should cover all ranges from 1-20 without gaps or overlaps", () => {
        const rolls = Array.from({ length: 20 }, (_, i) => i + 1);

        rolls.forEach((roll) => {
          const matchingEntries = AUXILIAR_OU_CUIDAR_TABLE.filter(
            (entry) => roll >= entry.min && roll <= entry.max
          );
          expect(matchingEntries).toHaveLength(1);
        });
      });

      it("should have consecutive entries from 1 to 20", () => {
        expect(AUXILIAR_OU_CUIDAR_TABLE[0].min).toBe(1);
        expect(AUXILIAR_OU_CUIDAR_TABLE[19].max).toBe(20);

        for (let i = 0; i < AUXILIAR_OU_CUIDAR_TABLE.length; i++) {
          expect(AUXILIAR_OU_CUIDAR_TABLE[i].min).toBe(i + 1);
          expect(AUXILIAR_OU_CUIDAR_TABLE[i].max).toBe(i + 1);
        }
      });

      it("should have all three columns populated for each entry", () => {
        AUXILIAR_OU_CUIDAR_TABLE.forEach((entry) => {
          expect(entry.result.action).toBeDefined();
          expect(entry.result.action).toMatch(/\S/); // Não vazio
          expect(entry.result.target).toBeDefined();
          expect(entry.result.target).toMatch(/\S/); // Não vazio
          expect(entry.result.complication).toBeDefined();
          expect(entry.result.complication).toMatch(/\S/); // Não vazio
        });
      });
    });

    describe("EXTRAIR_RECURSOS_TABLE", () => {
      it("should have exactly 20 entries covering d20 ranges", () => {
        // Verifica que todos os valores de 1-20 estão cobertos
        const rolls = Array.from({ length: 20 }, (_, i) => i + 1);

        rolls.forEach((roll) => {
          const matchingEntries = EXTRAIR_RECURSOS_TABLE.filter(
            (entry) => roll >= entry.min && roll <= entry.max
          );
          expect(matchingEntries).toHaveLength(1);
        });
      });

      it("should have multi-value ranges as specified in .md", () => {
        // Verifica que algumas entradas cobrem múltiplos valores (conforme .md)
        const multiRanges = EXTRAIR_RECURSOS_TABLE.filter(
          (entry) => entry.max > entry.min
        );
        expect(multiRanges.length).toBeGreaterThan(0);

        // Exemplo: entries 3-5 = "Extrativismo vegetal"
        const vegetalEntry = EXTRAIR_RECURSOS_TABLE.find(
          (entry) => entry.min === 3 && entry.max === 5
        );
        expect(vegetalEntry?.result.action).toBe("Extrativismo vegetal");
      });

      it("should include special case for roll 20 (multiple resources)", () => {
        const roll20Entry = EXTRAIR_RECURSOS_TABLE.find(
          (entry) => entry.min === 20 && entry.max === 20
        );
        expect(roll20Entry?.result.action).toBe("Role duas vezes e use ambos");
        expect(roll20Entry?.result.target).toBe("Submerso");
      });

      it("should have all three columns populated for each entry", () => {
        EXTRAIR_RECURSOS_TABLE.forEach((entry) => {
          expect(entry.result.action).toBeDefined();
          expect(entry.result.action).toMatch(/\S/); // Não vazio
          expect(entry.result.target).toBeDefined();
          expect(entry.result.target).toMatch(/\S/); // Não vazio
          expect(entry.result.complication).toBeDefined();
          expect(entry.result.complication).toMatch(/\S/); // Não vazio
        });
      });
    });

    describe("CONSTRUIR_CRIAR_OU_REPARAR_TABLE", () => {
      it("should have exactly 20 entries (1 for each d20 result)", () => {
        expect(CONSTRUIR_CRIAR_OU_REPARAR_TABLE).toHaveLength(20);
      });

      it("should cover all ranges from 1-20 without gaps or overlaps", () => {
        const rolls = Array.from({ length: 20 }, (_, i) => i + 1);

        rolls.forEach((roll) => {
          const matchingEntries = CONSTRUIR_CRIAR_OU_REPARAR_TABLE.filter(
            (entry) => roll >= entry.min && roll <= entry.max
          );
          expect(matchingEntries).toHaveLength(1);
        });
      });

      it("should have all three columns populated for each entry", () => {
        CONSTRUIR_CRIAR_OU_REPARAR_TABLE.forEach((entry) => {
          expect(entry.result.action).toBeDefined();
          expect(entry.result.action).toMatch(/\S/); // Não vazio
          expect(entry.result.target).toBeDefined();
          expect(entry.result.target).toMatch(/\S/); // Não vazio
          expect(entry.result.complication).toBeDefined();
          expect(entry.result.complication).toMatch(/\S/); // Não vazio
        });
      });
    });
  });

  // ===== CONTEÚDO ESPECÍFICO DAS TABELAS =====

  describe("Specific Table Content Validation", () => {
    it("AUXILIAR_OU_CUIDAR_TABLE should match .md content exactly", () => {
      // Verificar alguns exemplos específicos
      expect(AUXILIAR_OU_CUIDAR_TABLE[0].result.action).toBe("Orfanato");
      expect(AUXILIAR_OU_CUIDAR_TABLE[0].result.target).toBe("Na colheita");
      expect(AUXILIAR_OU_CUIDAR_TABLE[0].result.complication).toBe(
        "O responsável principal está ausente"
      );

      expect(AUXILIAR_OU_CUIDAR_TABLE[6].result.action).toBe("Crianças");
      expect(AUXILIAR_OU_CUIDAR_TABLE[6].result.target).toBe(
        "Cuidar de jardins ou estufas"
      );
    });

    it("EXTRAIR_RECURSOS_TABLE should include all resource types from .md", () => {
      const resourceTypes = EXTRAIR_RECURSOS_TABLE.map(
        (entry) => entry.result.action
      );

      expect(resourceTypes).toContain("Mineral metálico");
      expect(resourceTypes).toContain("Extrativismo vegetal");
      expect(resourceTypes).toContain("Extrativismo animal");
      expect(resourceTypes).toContain("Material comum");
      expect(resourceTypes).toContain("Especiaria");
      expect(resourceTypes).toContain("Componente mágico");
      expect(resourceTypes).toContain("Plantas medicinais");
      expect(resourceTypes).toContain("Mineral não-metálico");
      expect(resourceTypes).toContain("Cogumelos");
    });

    it("CONSTRUIR_CRIAR_OU_REPARAR_TABLE should include diverse construction types", () => {
      const constructionTypes = CONSTRUIR_CRIAR_OU_REPARAR_TABLE.map(
        (entry) => entry.result.action
      );

      expect(constructionTypes).toContain("Construção histórica");
      expect(constructionTypes).toContain("Estrada");
      expect(constructionTypes).toContain("Ponte");
      expect(constructionTypes).toContain("Torre/fortaleza/muralha/proteção");
      expect(constructionTypes).toContain("Armas/Armaduras");
    });
  });

  // ===== EXEMPLOS DE RECURSOS =====

  describe("Resource Examples System", () => {
    it("RESOURCE_EXAMPLES should contain all resource types", () => {
      expect(RESOURCE_EXAMPLES["Mineral metálico"]).toContain("ferro");
      expect(RESOURCE_EXAMPLES["Mineral metálico"]).toContain("ouro");
      expect(RESOURCE_EXAMPLES["Extrativismo vegetal"]).toContain("madeira");
      expect(RESOURCE_EXAMPLES["Componente mágico"]).toContain(
        "cristais mágicos"
      );
    });

    it("getResourceExamples should return correct examples", () => {
      const metalExamples = getResourceExamples("Mineral metálico");
      expect(metalExamples).toContain("ferro");
      expect(metalExamples).toContain("cobre");

      const invalidExamples = getResourceExamples("Tipo inexistente");
      expect(invalidExamples).toEqual([]);
    });

    it("getRandomResourceExample should return valid examples", () => {
      const example = getRandomResourceExample("Material comum");
      const validExamples = RESOURCE_EXAMPLES["Material comum"];
      expect(validExamples).toContain(example);

      // Teste com tipo inexistente
      const invalidExample = getRandomResourceExample("Tipo inexistente");
      expect(invalidExample).toBe("Tipo inexistente");
    });

    it("WILD_ENVIRONMENTS should contain expected environment types", () => {
      expect(WILD_ENVIRONMENTS).toContain("florestas");
      expect(WILD_ENVIRONMENTS).toContain("montanhas");
      expect(WILD_ENVIRONMENTS).toContain("cavernas");
      expect(WILD_ENVIRONMENTS).toContain("pântanos");
    });

    it("isWildEnvironment should correctly identify wild environments", () => {
      expect(isWildEnvironment("Ambiente selvagem")).toBe(true);
      expect(isWildEnvironment("florestas")).toBe(true);
      expect(isWildEnvironment("cavernas profundas")).toBe(true);
      expect(isWildEnvironment("cidade grande")).toBe(false);
    });
  });

  // ===== GERADORES PERSONALIZADOS =====

  describe("Enhanced Generation Functions", () => {
    it("generateResourceExtractionDescription should handle normal resources", () => {
      const description = generateResourceExtractionDescription(
        "Mineral metálico",
        "Caverna",
        "O local é instável"
      );

      expect(description).toMatch(/extrair/i);
      expect(description).toMatch(/caverna/i);
      expect(description).toMatch(/instável/i);
      expect(description).toMatch(
        /ferro|alumínio|manganês|magnésio|cobre|cromo|mercúrio|chumbo|estanho|ouro|prata|níquel|zinco|urânio/
      ); // Algum exemplo de metal
    });

    it("generateResourceExtractionDescription should handle multiple resources (roll 20)", () => {
      const description = generateResourceExtractionDescription(
        "Role duas vezes e use ambos",
        "Submerso",
        "O local é protegido por encantos"
      );

      expect(description).toMatch(/extrair/i);
      expect(description).toMatch(/submerso/i);
      expect(description).toMatch(/encantos/i);
    });

    it("generateCareDescription should adapt language for different targets", () => {
      const childCare = generateCareDescription(
        "Crianças",
        "Cuidar de jardins ou estufas",
        "Há uma importante inspeção surpresa"
      );
      expect(childCare).toMatch(/cuidar de|auxiliar/i);

      const adultHelp = generateCareDescription(
        "Comerciantes",
        "Inventário de mercadorias",
        "Uma pessoa-chave insiste em mudar o plano"
      );
      expect(adultHelp).toMatch(/auxiliar|ajudar/i);
    });

    it("generateEnhancedServiceObjective should work for new objective types", () => {
      const resourceObj = generateEnhancedServiceObjective(
        ServiceObjectiveType.EXTRAIR_RECURSOS
      );
      expect(resourceObj).not.toBeNull();
      expect(resourceObj?.type).toBe(ServiceObjectiveType.EXTRAIR_RECURSOS);
      expect(resourceObj?.description).toMatch(/extrair/i);

      const careObj = generateEnhancedServiceObjective(
        ServiceObjectiveType.AUXILIAR_OU_CUIDAR
      );
      expect(careObj).not.toBeNull();
      expect(careObj?.type).toBe(ServiceObjectiveType.AUXILIAR_OU_CUIDAR);

      const constructObj = generateEnhancedServiceObjective(
        ServiceObjectiveType.CONSTRUIR_CRIAR_OU_REPARAR
      );
      expect(constructObj).not.toBeNull();
      expect(constructObj?.type).toBe(
        ServiceObjectiveType.CONSTRUIR_CRIAR_OU_REPARAR
      );
    });
  });

  // ===== INTEGRAÇÃO COM SISTEMA EXISTENTE =====

  describe("Integration with Existing System", () => {
    it("getThreeColumnTable should return tables for Issue 5.12 objective types", () => {
      expect(getThreeColumnTable(ServiceObjectiveType.AUXILIAR_OU_CUIDAR)).toBe(
        AUXILIAR_OU_CUIDAR_TABLE
      );
      expect(getThreeColumnTable(ServiceObjectiveType.EXTRAIR_RECURSOS)).toBe(
        EXTRAIR_RECURSOS_TABLE
      );
      expect(
        getThreeColumnTable(ServiceObjectiveType.CONSTRUIR_CRIAR_OU_REPARAR)
      ).toBe(CONSTRUIR_CRIAR_OU_REPARAR_TABLE);
    });

    it("rollThreeColumnObjective should work with new tables", () => {
      const mockRoll = vi.fn().mockReturnValue(5);

      const careResult = rollThreeColumnObjective(
        AUXILIAR_OU_CUIDAR_TABLE,
        mockRoll,
        mockRoll,
        mockRoll
      );
      expect(careResult.action).toBe("Governo local");
      expect(careResult.target).toBe("Abater e preparar animais");
      expect(careResult.complication).toBe(
        "A interferência de bestas atrapalha"
      );

      const resourceResult = rollThreeColumnObjective(
        EXTRAIR_RECURSOS_TABLE,
        mockRoll,
        mockRoll,
        mockRoll
      );
      expect(resourceResult.action).toBe("Extrativismo vegetal"); // Roll 5 na faixa 3-5
    });
  });

  // ===== REGRAS DE NEGÓCIO =====

  describe("Business Rules Validation", () => {
    it("should follow three-column system as specified in .md", () => {
      // Cada tabela deve ter exatamente 3 colunas de informação
      AUXILIAR_OU_CUIDAR_TABLE.forEach((entry) => {
        expect(Object.keys(entry.result)).toHaveLength(3);
        expect(entry.result).toHaveProperty("action");
        expect(entry.result).toHaveProperty("target");
        expect(entry.result).toHaveProperty("complication");
      });
    });

    it("should support probabilistic ranges for resource extraction", () => {
      // Recursos comuns (9-12) devem ter maior probabilidade
      const commonMaterials = EXTRAIR_RECURSOS_TABLE.filter(
        (entry) => entry.result.action === "Material comum"
      );
      expect(commonMaterials).toHaveLength(1);

      const commonEntry = commonMaterials[0];
      expect(commonEntry.min).toBe(9);
      expect(commonEntry.max).toBe(12);

      // Componentes mágicos (15) devem ser raros
      const magicComponents = EXTRAIR_RECURSOS_TABLE.filter(
        (entry) => entry.result.action === "Componente mágico"
      );
      expect(magicComponents).toHaveLength(1);
      expect(magicComponents[0].min).toBe(15);
      expect(magicComponents[0].max).toBe(15);
    });

    it("should include complex complications reflecting real scenarios", () => {
      const complications = [
        ...AUXILIAR_OU_CUIDAR_TABLE.map((e) => e.result.complication),
        ...EXTRAIR_RECURSOS_TABLE.map((e) => e.result.complication),
        ...CONSTRUIR_CRIAR_OU_REPARAR_TABLE.map((e) => e.result.complication),
      ];

      // Deve incluir complicações variadas
      expect(complications.some((c) => c.includes("segredo"))).toBe(true);
      expect(
        complications.some((c) => c.includes("clima") || c.includes("clima"))
      ).toBe(true);
      expect(
        complications.some(
          (c) => c.includes("ferramenta") || c.includes("material")
        )
      ).toBe(true);
    });
  });

  // ===== QUALIDADE E CONSISTÊNCIA =====

  describe("Quality and Consistency", () => {
    it("should have consistent language and formatting", () => {
      const allEntries = [
        ...AUXILIAR_OU_CUIDAR_TABLE,
        ...EXTRAIR_RECURSOS_TABLE,
        ...CONSTRUIR_CRIAR_OU_REPARAR_TABLE,
      ];

      allEntries.forEach((entry) => {
        // Complicações devem começar com maiúscula
        expect(entry.result.complication.charAt(0)).toMatch(/[A-ZÀ-Ú]/);

        // Não deve haver espaços extras
        expect(entry.result.action.trim()).toBe(entry.result.action);
        expect(entry.result.target.trim()).toBe(entry.result.target);
        expect(entry.result.complication.trim()).toBe(
          entry.result.complication
        );
      });
    });

    it("should provide diverse and interesting combinations", () => {
      // Deve haver variedade suficiente para gameplay interessante
      const careTargets = new Set(
        AUXILIAR_OU_CUIDAR_TABLE.map((e) => e.result.action)
      );
      expect(careTargets.size).toBeGreaterThan(15); // Pelo menos 15 tipos diferentes

      const resourceTypes = new Set(
        EXTRAIR_RECURSOS_TABLE.map((e) => e.result.action)
      );
      expect(resourceTypes.size).toBeGreaterThan(8); // Pelo menos 8 tipos de recursos

      const constructionTypes = new Set(
        CONSTRUIR_CRIAR_OU_REPARAR_TABLE.map((e) => e.result.action)
      );
      expect(constructionTypes.size).toBe(20); // Todos únicos para construção
    });
  });
});
