/**
 * Testes para o sistema de Complicações e Reviravoltas
 */

import { describe, it, expect, vi } from "vitest";
import {
  generateComplication,
  generateTwist,
} from "@/utils/generators/complicationGenerator";
import { ComplicationCategory, TwistBut } from "@/types/contract";
import {
  COMPLICATION_TYPES_TABLE,
  COMPLICATION_DETAIL_TABLES,
  TWIST_CHANCE_TABLE,
  TWIST_BUT_TABLE,
} from "@/data/tables/contract-complications-tables";

describe("Complication Generator - Funcionalidades Base", () => {
  describe("generateComplication", () => {
    it("deve gerar uma complicação válida", () => {
      const complication = generateComplication();

      expect(complication).toBeDefined();
      expect(complication.category).toBeDefined();
      expect(complication.specificDetail).toBeDefined();
      expect(complication.description).toBeDefined();

      // Verificar que a categoria é válida
      expect(Object.values(ComplicationCategory)).toContain(
        complication.category
      );

      // Verificar que o detalhe não está vazio
      expect(complication.specificDetail).toBeTruthy();

      // Verificar que a descrição contém a categoria e o detalhe
      expect(complication.description).toContain(complication.category);
      expect(complication.description).toContain(complication.specificDetail);
    });

    it("deve gerar complicações diferentes em múltiplas chamadas", () => {
      const complications = new Set();

      for (let i = 0; i < 10; i++) {
        const complication = generateComplication();
        complications.add(
          `${complication.category}-${complication.specificDetail}`
        );
      }

      // Com 10 gerações, devemos ter pelo menos 2 diferentes (estatisticamente muito provável)
      expect(complications.size).toBeGreaterThan(1);
    });

    it('deve tratar corretamente "Role duas vezes e use ambos"', () => {
      // Simular resultado que gera "Role duas vezes"
      vi.spyOn(Math, "random").mockReturnValue(0.95); // Força resultado alto

      const complication = generateComplication();

      // Deve gerar uma complicação válida mesmo com "Role duas vezes"
      expect(complication.specificDetail).toBeTruthy();
      expect(complication.specificDetail).not.toBe(
        "Role duas vezes e use ambos"
      );

      vi.restoreAllMocks();
    });
  });

  describe("generateTwist", () => {
    it("deve gerar reviravolta válida quando chance for favorável", () => {
      // Forçar chance de reviravolta (19-20)
      vi.spyOn(Math, "random").mockReturnValue(0.95);

      const twist = generateTwist();

      expect(twist.hasTwist).toBe(true);
      expect(twist.who).toBeDefined();
      expect(twist.what).toBeDefined();
      expect(twist.but).toBeDefined();
      expect(twist.description).toBeDefined();
      expect(twist.description).toContain("REVIRAVOLTA:");

      vi.restoreAllMocks();
    });

    it('deve retornar "não há reviravolta" quando chance for desfavorável', () => {
      // Forçar chance baixa (1-18)
      vi.spyOn(Math, "random").mockReturnValue(0.1);

      const twist = generateTwist();

      expect(twist.hasTwist).toBe(false);
      expect(twist.description).toContain("Não há reviravoltas");
      expect(twist.who).toBeUndefined();
      expect(twist.what).toBeUndefined();
      expect(twist.but).toBeUndefined();

      vi.restoreAllMocks();
    });

    it("deve gerar elementos válidos da reviravolta", () => {
      // Forçar reviravolta
      vi.spyOn(Math, "random").mockReturnValue(0.95);

      const twist = generateTwist();

      if (twist.hasTwist) {
        expect(typeof twist.who).toBe("string");
        expect(typeof twist.what).toBe("string");
        expect(typeof twist.but).toBe("string");
        expect(twist.who!.length).toBeGreaterThan(0);
        expect(twist.what!.length).toBeGreaterThan(0);
        expect(twist.but!.length).toBeGreaterThan(0);
      }

      vi.restoreAllMocks();
    });
  });
});

describe("Complication Tables - Validação Conforme Arquivo Base", () => {
  describe("COMPLICATION_TYPES_TABLE", () => {
    it("deve cobrir toda a faixa 1-20", () => {
      const coveredNumbers = new Set<number>();

      COMPLICATION_TYPES_TABLE.forEach((entry) => {
        for (let i = entry.min; i <= entry.max; i++) {
          coveredNumbers.add(i);
        }
      });

      expect(coveredNumbers.size).toBe(20);
      expect(Math.min(...coveredNumbers)).toBe(1);
      expect(Math.max(...coveredNumbers)).toBe(20);
    });

    it("deve mapear para categorias válidas", () => {
      COMPLICATION_TYPES_TABLE.forEach((entry) => {
        expect(Object.values(ComplicationCategory)).toContain(entry.result);
      });
    });
  });

  describe("COMPLICATION_DETAIL_TABLES", () => {
    it("deve ter tabelas para todas as categorias", () => {
      Object.values(ComplicationCategory).forEach((category) => {
        expect(COMPLICATION_DETAIL_TABLES[category]).toBeDefined();
        expect(COMPLICATION_DETAIL_TABLES[category].length).toBeGreaterThan(0);
      });
    });

    it("todas as tabelas de detalhamento devem cobrir 1-20", () => {
      Object.entries(COMPLICATION_DETAIL_TABLES).forEach(
        ([category, table]) => {
          const coveredNumbers = new Set<number>();

          table.forEach((entry) => {
            for (let i = entry.min; i <= entry.max; i++) {
              coveredNumbers.add(i);
            }
          });

          expect(
            coveredNumbers.size,
            `Categoria ${category} deve cobrir 1-20`
          ).toBe(20);
          expect(
            Math.min(...coveredNumbers),
            `Categoria ${category} deve começar em 1`
          ).toBe(1);
          expect(
            Math.max(...coveredNumbers),
            `Categoria ${category} deve terminar em 20`
          ).toBe(20);
        }
      );
    });
  });

  describe("TWIST_CHANCE_TABLE", () => {
    it("deve cobrir 1-20 com resultados booleanos", () => {
      const coveredNumbers = new Set<number>();

      TWIST_CHANCE_TABLE.forEach((entry) => {
        for (let i = entry.min; i <= entry.max; i++) {
          coveredNumbers.add(i);
        }
      });

      expect(coveredNumbers.size).toBe(20);
      expect(Math.min(...coveredNumbers)).toBe(1);
      expect(Math.max(...coveredNumbers)).toBe(20);
    });

    it("deve ter chance baixa de reviravolta (19-20)", () => {
      const trueEntries = TWIST_CHANCE_TABLE.filter(
        (entry) => entry.result === true
      );
      const falseEntries = TWIST_CHANCE_TABLE.filter(
        (entry) => entry.result === false
      );

      expect(trueEntries.length).toBe(1);
      expect(falseEntries.length).toBe(1);

      // Verificar que apenas 19-20 resulta em true
      const trueEntry = trueEntries[0];
      expect(trueEntry.min).toBe(19);
      expect(trueEntry.max).toBe(20);
    });
  });

  describe("TWIST_BUT_TABLE", () => {
    it("deve cobrir toda a faixa 1-20 sem lacunas", () => {
      const coveredNumbers = new Set<number>();

      TWIST_BUT_TABLE.forEach((entry) => {
        for (let i = entry.min; i <= entry.max; i++) {
          coveredNumbers.add(i);
        }
      });

      expect(coveredNumbers.size).toBe(20);
      expect(Math.min(...coveredNumbers)).toBe(1);
      expect(Math.max(...coveredNumbers)).toBe(20);
    });

    it("deve mapear para valores válidos de TwistBut", () => {
      TWIST_BUT_TABLE.forEach((entry) => {
        expect(Object.values(TwistBut)).toContain(entry.result);
      });
    });

    it("deve ter 20 entradas únicas (uma para cada valor de 1d20)", () => {
      expect(TWIST_BUT_TABLE).toHaveLength(20);

      // Verificar que cada entrada é única (min === max para mapeamento 1-para-1)
      TWIST_BUT_TABLE.forEach((entry) => {
        expect(entry.min).toBe(entry.max);
      });
    });

    it('deve incluir todos os valores da tabela "Mas..." do arquivo base', () => {
      const expectedValues = [
        "Faz isso pelas crianças",
        "O antagonista não tem culpa",
        "Ele é assassinado misteriosamente",
        "O objetivo está ligado a uma profecia",
        "Faz isso para proteger a natureza",
        "O objetivo exige um sacrifício",
        "Está tentando salvar alguém querido",
        "Foi forçado por uma maldição",
        "Acredita estar fazendo o bem",
        "Está cumprindo uma promessa antiga",
        "É a única forma de evitar algo pior",
        "Está protegendo um segredo terrível",
        "Tem apenas dias de vida",
        "Está sendo manipulado sem saber",
        "Precisa salvar sua alma",
        "Está tentando desfazer um erro do passado",
        "É o único que pode fazer isso",
        "Está honrando a memória de alguém",
        "Precisa provar seu valor/inocência",
        "O tempo está se esgotando",
      ];

      const tableValues = TWIST_BUT_TABLE.map((entry) => entry.result);

      expectedValues.forEach((expectedValue) => {
        expect(tableValues).toContain(expectedValue);
      });
    });
  });
});
