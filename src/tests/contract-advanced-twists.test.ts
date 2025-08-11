/**
 * Testes para as Funcionalidades Avançadas de Reviravoltas
 */

import { describe, it, expect, vi } from "vitest";
import { generateTwist } from "@/utils/generators/complicationGenerator";
import {
  generateUnusualContractor,
  generateThemeKeywords,
  generateContractorThemeKeywords,
  generateAdvancedNarrativeElements,
  suggestKeywordIntegration,
} from "@/utils/generators/narrativeElementsGenerator";
import {
  TwistAndFirst,
  TwistAndSecond,
  ThemeKeywordSet,
} from "@/types/contract";
import {
  TWIST_AND_FIRST_TABLE,
  TWIST_AND_SECOND_TABLE,
} from "@/data/tables/contract-twist-tables";
import {
  UNUSUAL_CONTRACTOR_CHANCE_TABLE,
  UNUSUAL_CONTRACTORS_TABLE,
} from "@/data/tables/contract-themes-tables";

describe("Advanced Twist System - Tabelas E...", () => {
  describe("generateTwist com tabelas E...", () => {
    it("deve gerar reviravolta com elementos E... quando solicitado", () => {
      // Forçar reviravolta favorável
      vi.spyOn(Math, "random").mockReturnValue(0.95);

      const twist = generateTwist();

      expect(twist.hasTwist).toBe(true);
      expect(twist.who).toBeDefined();
      expect(twist.what).toBeDefined();
      expect(twist.but).toBeDefined();
      expect(twist.andFirst).toBeDefined();
      expect(twist.andSecond).toBeDefined();
      expect(twist.description).toContain("REVIRAVOLTA:");
      expect(twist.description).toContain("E ");

      // Verificar que os elementos E... são válidos
      expect(Object.values(TwistAndFirst)).toContain(twist.andFirst);
      expect(Object.values(TwistAndSecond)).toContain(twist.andSecond);

      vi.restoreAllMocks();
    });

    it("deve gerar reviravolta completa sempre incluindo tabelas E...", () => {
      // Forçar reviravolta favorável
      vi.spyOn(Math, "random").mockReturnValue(0.95);

      const twist = generateTwist();

      expect(twist.hasTwist).toBe(true);
      expect(twist.who).toBeDefined();
      expect(twist.what).toBeDefined();
      expect(twist.but).toBeDefined();
      expect(twist.andFirst).toBeDefined();
      expect(twist.andSecond).toBeDefined();
      expect(twist.description).toContain("REVIRAVOLTA:");
      expect(twist.description).toContain("E ");

      vi.restoreAllMocks();
    });

    it("deve sempre incluir tabelas E... por padrão", () => {
      // Forçar reviravolta favorável
      vi.spyOn(Math, "random").mockReturnValue(0.95);

      const twist = generateTwist(); // sem parâmetro

      expect(twist.hasTwist).toBe(true);
      expect(twist.andFirst).toBeDefined();
      expect(twist.andSecond).toBeDefined();

      vi.restoreAllMocks();
    });
  });

  describe("TWIST_AND_FIRST_TABLE", () => {
    it("deve cobrir toda a faixa 1-20", () => {
      const coveredNumbers = new Set<number>();

      TWIST_AND_FIRST_TABLE.forEach((entry) => {
        for (let i = entry.min; i <= entry.max; i++) {
          coveredNumbers.add(i);
        }
      });

      expect(coveredNumbers.size).toBe(20);
      expect(Math.min(...coveredNumbers)).toBe(1);
      expect(Math.max(...coveredNumbers)).toBe(20);
    });

    it("deve ter todos os elementos válidos do enum", () => {
      TWIST_AND_FIRST_TABLE.forEach((entry) => {
        expect(Object.values(TwistAndFirst)).toContain(entry.result);
      });
    });

    it("deve ter entradas únicas", () => {
      const results = TWIST_AND_FIRST_TABLE.map((entry) => entry.result);
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBe(results.length);
    });
  });

  describe("TWIST_AND_SECOND_TABLE", () => {
    it("deve cobrir toda a faixa 1-20", () => {
      const coveredNumbers = new Set<number>();

      TWIST_AND_SECOND_TABLE.forEach((entry) => {
        for (let i = entry.min; i <= entry.max; i++) {
          coveredNumbers.add(i);
        }
      });

      expect(coveredNumbers.size).toBe(20);
      expect(Math.min(...coveredNumbers)).toBe(1);
      expect(Math.max(...coveredNumbers)).toBe(20);
    });

    it("deve ter todos os elementos válidos do enum", () => {
      TWIST_AND_SECOND_TABLE.forEach((entry) => {
        expect(Object.values(TwistAndSecond)).toContain(entry.result);
      });
    });

    it("deve ter entradas únicas", () => {
      const results = TWIST_AND_SECOND_TABLE.map((entry) => entry.result);
      const uniqueResults = new Set(results);
      expect(uniqueResults.size).toBe(results.length);
    });
  });
});

describe("Unusual Contractors System", () => {
  describe("generateUnusualContractor", () => {
    it("deve sempre incluir palavras-chave para contratante comum", () => {
      // Forçar teste de excentricidade negativo (2-20)
      vi.spyOn(Math, "random").mockReturnValue(0.1);

      const contractor = generateUnusualContractor();

      expect(contractor.isUnusual).toBe(false);
      expect(contractor.description).toContain("Contratante comum");
      expect(contractor.themeKeywords).toBeDefined();
      expect(Array.isArray(contractor.themeKeywords)).toBe(true);

      vi.restoreAllMocks();
    });

    it("deve gerar contratante inusitado quando teste passa", () => {
      // Forçar teste de excentricidade positivo (1)
      vi.spyOn(Math, "random").mockReturnValue(0.001);

      const contractor = generateUnusualContractor();

      expect(contractor.isUnusual).toBe(true);
      expect(contractor.description).toBeDefined();
      expect(contractor.description.length).toBeGreaterThan(0);
      expect(contractor.description).not.toContain("Contratante comum");
      expect(contractor.themeKeywords).toBeDefined();

      vi.restoreAllMocks();
    });

    it("deve sempre incluir palavras-chave em contratantes inusitados", () => {
      // Forçar teste de excentricidade positivo
      vi.spyOn(Math, "random").mockReturnValue(0.001);

      const contractor = generateUnusualContractor();

      expect(contractor.isUnusual).toBe(true);
      expect(contractor.themeKeywords).toBeDefined();
      expect(Array.isArray(contractor.themeKeywords)).toBe(true);
      expect(contractor.themeKeywords.length).toBeGreaterThan(0);

      vi.restoreAllMocks();
    });

    it("deve gerar múltiplas palavras-chave para criatividade", () => {
      // Forçar teste de excentricidade positivo
      vi.spyOn(Math, "random").mockReturnValue(0.001);

      const contractor = generateUnusualContractor();

      expect(contractor.isUnusual).toBe(true);
      expect(contractor.themeKeywords).toBeDefined();
      // Deve ter pelo menos 1 palavra-chave (1d6, então 1-6)
      expect(contractor.themeKeywords.length).toBeGreaterThanOrEqual(1);
      expect(contractor.themeKeywords.length).toBeLessThanOrEqual(6);

      vi.restoreAllMocks();
    });
  });

  describe("UNUSUAL_CONTRACTOR_CHANCE_TABLE", () => {
    it("deve ter baixa chance de contratante inusitado", () => {
      const trueEntries = UNUSUAL_CONTRACTOR_CHANCE_TABLE.filter(
        (entry) => entry.result === true
      );
      const falseEntries = UNUSUAL_CONTRACTOR_CHANCE_TABLE.filter(
        (entry) => entry.result === false
      );

      // Apenas 1 resultado deve ser true (entrada 1)
      expect(trueEntries.length).toBe(1);
      expect(trueEntries[0].min).toBe(1);
      expect(trueEntries[0].max).toBe(1);

      // Demais resultados devem ser false (entradas 2-20)
      expect(falseEntries.length).toBe(1);
      expect(falseEntries[0].min).toBe(2);
      expect(falseEntries[0].max).toBe(20);
    });
  });

  describe("UNUSUAL_CONTRACTORS_TABLE", () => {
    it("deve cobrir toda a faixa 1-100", () => {
      const coveredNumbers = new Set<number>();

      UNUSUAL_CONTRACTORS_TABLE.forEach((entry) => {
        for (let i = entry.min; i <= entry.max; i++) {
          coveredNumbers.add(i);
        }
      });

      expect(coveredNumbers.size).toBe(100);
      expect(Math.min(...coveredNumbers)).toBe(1);
      expect(Math.max(...coveredNumbers)).toBe(100);
    });

    it("deve ter 100 contratantes únicos", () => {
      expect(UNUSUAL_CONTRACTORS_TABLE.length).toBe(100);

      const descriptions = UNUSUAL_CONTRACTORS_TABLE.map(
        (entry) => entry.result
      );
      const uniqueDescriptions = new Set(descriptions);
      expect(uniqueDescriptions.size).toBe(100);
    });

    it("deve ter descrições não vazias", () => {
      UNUSUAL_CONTRACTORS_TABLE.forEach((entry) => {
        expect(typeof entry.result).toBe("string");
        expect(entry.result.length).toBeGreaterThan(0);
      });
    });
  });
});

describe("Theme Keywords System", () => {
  describe("generateThemeKeywords", () => {
    it("deve gerar 0-5 palavras-chave conforme regras", () => {
      const keywords = generateThemeKeywords();

      expect(Array.isArray(keywords)).toBe(true);
      expect(keywords.length).toBeGreaterThanOrEqual(0);
      expect(keywords.length).toBeLessThanOrEqual(5);
    });

    it("deve gerar palavras-chave com estrutura válida", () => {
      // Forçar geração de pelo menos uma palavra-chave
      vi.spyOn(Math, "random").mockReturnValue(0.9);

      const keywords = generateThemeKeywords();

      if (keywords.length > 0) {
        keywords.forEach((keyword) => {
          expect(keyword.set).toBeDefined();
          expect(keyword.keyword).toBeDefined();
          expect(typeof keyword.keyword).toBe("string");
          expect(keyword.keyword.length).toBeGreaterThan(0);
        });
      }

      vi.restoreAllMocks();
    });

    it("deve retornar array vazio quando quantidade = 0", () => {
      // Forçar quantidade = 0
      vi.spyOn(Math, "random").mockReturnValue(0.001);

      const keywords = generateThemeKeywords();

      expect(keywords).toEqual([]);

      vi.restoreAllMocks();
    });
  });

  describe("generateContractorThemeKeywords", () => {
    it("deve gerar 1-6 palavras-chave", () => {
      const keywords = generateContractorThemeKeywords();

      expect(Array.isArray(keywords)).toBe(true);
      expect(keywords.length).toBeGreaterThanOrEqual(1);
      expect(keywords.length).toBeLessThanOrEqual(6);
    });

    it("deve usar tabelas diferentes quando possível", () => {
      const keywords = generateContractorThemeKeywords();

      if (keywords.length > 1) {
        const sets = keywords.map((k) => k.set);
        const uniqueSets = new Set(sets);

        // Deve tentar usar diferentes conjuntos
        expect(uniqueSets.size).toBeGreaterThan(0);
      }
    });
  });

  describe("suggestKeywordIntegration", () => {
    it("deve retornar mensagem vazia para array vazio", () => {
      const suggestions = suggestKeywordIntegration([]);

      expect(suggestions).toEqual(["Nenhuma palavra-chave para integrar."]);
    });

    it("deve gerar sugestões para palavras-chave fornecidas", () => {
      const keywords = [
        { set: ThemeKeywordSet.MACABRO, keyword: "Fantasma" },
        { set: ThemeKeywordSet.GUERRA, keyword: "Espada" },
      ];

      const suggestions = suggestKeywordIntegration(keywords);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some((s) => s.includes("Fantasma"))).toBe(true);
      expect(suggestions.some((s) => s.includes("Espada"))).toBe(true);
      expect(
        suggestions.some((s) => s.includes("Características físicas"))
      ).toBe(true);
    });
  });
});

describe("Advanced Narrative Elements", () => {
  describe("generateAdvancedNarrativeElements", () => {
    it("deve gerar todos os elementos narrativos", () => {
      const elements = generateAdvancedNarrativeElements();

      expect(elements.unusualContractor).toBeDefined();
      expect(elements.themeKeywords).toBeDefined();
      expect(elements.contractorKeywords).toBeDefined();
      expect(elements.creativityTips).toBeDefined();

      expect(Array.isArray(elements.themeKeywords)).toBe(true);
      expect(Array.isArray(elements.contractorKeywords)).toBe(true);
      expect(Array.isArray(elements.creativityTips)).toBe(true);
      expect(elements.creativityTips.length).toBeGreaterThan(0);
    });

    it("deve fornecer dicas de criatividade úteis", () => {
      const elements = generateAdvancedNarrativeElements();

      expect(elements.creativityTips.length).toBeGreaterThan(0);
      elements.creativityTips.forEach((tip) => {
        expect(typeof tip).toBe("string");
        expect(tip.length).toBeGreaterThan(0);
      });
    });
  });
});
