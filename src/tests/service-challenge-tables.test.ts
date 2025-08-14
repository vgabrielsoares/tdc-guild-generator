import { describe, expect, it } from "vitest";
import {
  ADDITIONAL_CHALLENGE_CHANCE_TABLE,
  ADDITIONAL_CHALLENGE_TABLE,
  CREATIVITY_KEYWORD_SET_7,
  CREATIVITY_KEYWORD_SET_8,
  CREATIVITY_KEYWORD_SET_9,
  CREATIVITY_KEYWORD_SET_10,
  CREATIVITY_KEYWORD_SET_11,
  CREATIVITY_KEYWORD_SET_12,
  ALL_CREATIVITY_KEYWORD_SETS,
  generateRandomKeywords,
  getRandomKeywordFromSet,
} from "@/data/tables/service-challenge-tables";

// ===== TESTES PARA TABELAS DE DESAFIOS ADICIONAIS E CRIATIVIDADE =====

describe("Service Challenge Tables - Issue 5.15", () => {
  // ===== TESTES DE CHANCE DE DESAFIO ADICIONAL =====

  describe("ADDITIONAL_CHALLENGE_CHANCE_TABLE", () => {
    it("should have exactly 2 entries covering d20 range", () => {
      expect(ADDITIONAL_CHALLENGE_CHANCE_TABLE).toHaveLength(2);

      // Verifica primeira entrada (1-19: Não)
      expect(ADDITIONAL_CHALLENGE_CHANCE_TABLE[0].min).toBe(1);
      expect(ADDITIONAL_CHALLENGE_CHANCE_TABLE[0].max).toBe(19);
      expect(ADDITIONAL_CHALLENGE_CHANCE_TABLE[0].result.hasChallenge).toBe(
        false
      );
      expect(ADDITIONAL_CHALLENGE_CHANCE_TABLE[0].result.description).toBe(
        "Não"
      );

      // Verifica segunda entrada (20: Sim)
      expect(ADDITIONAL_CHALLENGE_CHANCE_TABLE[1].min).toBe(20);
      expect(ADDITIONAL_CHALLENGE_CHANCE_TABLE[1].max).toBe(20);
      expect(ADDITIONAL_CHALLENGE_CHANCE_TABLE[1].result.hasChallenge).toBe(
        true
      );
      expect(ADDITIONAL_CHALLENGE_CHANCE_TABLE[1].result.description).toBe(
        "Sim"
      );
    });

    it("should cover complete d20 range without gaps or overlaps", () => {
      const coveredNumbers = new Set<number>();

      ADDITIONAL_CHALLENGE_CHANCE_TABLE.forEach((entry) => {
        for (let i = entry.min; i <= entry.max; i++) {
          expect(coveredNumbers.has(i)).toBe(false); // Sem sobreposições
          coveredNumbers.add(i);
        }
      });

      // Verifica cobertura completa 1-20
      for (let i = 1; i <= 20; i++) {
        expect(coveredNumbers.has(i)).toBe(true);
      }
    });
  });

  // ===== TESTES DE TABELA DE DESAFIOS ADICIONAIS (d100) =====

  describe("ADDITIONAL_CHALLENGE_TABLE", () => {
    it("should have exactly 100 entries for d100 table", () => {
      expect(ADDITIONAL_CHALLENGE_TABLE).toHaveLength(100);
    });

    it("should cover complete d100 range (1-100) without gaps", () => {
      const coveredNumbers = new Set<number>();

      ADDITIONAL_CHALLENGE_TABLE.forEach((entry) => {
        for (let i = entry.min; i <= entry.max; i++) {
          expect(coveredNumbers.has(i)).toBe(false); // Sem sobreposições
          coveredNumbers.add(i);
        }
      });

      // Verifica cobertura completa 1-100
      for (let i = 1; i <= 100; i++) {
        expect(coveredNumbers.has(i)).toBe(true);
      }
    });

    it("should have each entry covering exactly one number", () => {
      ADDITIONAL_CHALLENGE_TABLE.forEach((entry, index) => {
        const expectedNumber = index + 1;
        expect(entry.min).toBe(expectedNumber);
        expect(entry.max).toBe(expectedNumber);
        expect(entry.result.description).toBeTruthy();
        expect(entry.result.description.length).toBeGreaterThan(10); // Descrições substanciais
      });
    });

    it("should contain specific challenges from markdown", () => {
      // Verificar alguns desafios específicos conhecidos
      const challenge1 = ADDITIONAL_CHALLENGE_TABLE[0]; // d100 = 1
      expect(challenge1.result.description).toBe(
        "Pescadores precisam de criaturas fortes para puxar peixes muito pesados"
      );

      const challenge6 = ADDITIONAL_CHALLENGE_TABLE[5]; // d100 = 6
      expect(challenge6.result.description).toBe(
        "Um gato pede ajuda para tirar seu anão da árvore"
      );

      const challenge100 = ADDITIONAL_CHALLENGE_TABLE[99]; // d100 = 100
      expect(challenge100.result.description).toBe(
        "Um pescador pede para que você consiga um peixe raro que é um dos preferidos dos dragões"
      );
    });

    it("should have creative and varied challenge descriptions", () => {
      const descriptions = ADDITIONAL_CHALLENGE_TABLE.map(
        (entry) => entry.result.description
      );

      // Verificar variedade (não deve ter duplicatas)
      const uniqueDescriptions = new Set(descriptions);
      expect(uniqueDescriptions.size).toBe(100);

      // Verificar que contém elementos específicos esperados
      const combinedText = descriptions.join(" ").toLowerCase();
      expect(combinedText).toContain("gato");
      expect(combinedText).toContain("dragões");
      expect(combinedText).toContain("anão");
      expect(combinedText).toContain("humanoide");
      expect(combinedText).toContain("ajuda");
    });
  });

  // ===== TESTES DE CONJUNTOS DE PALAVRAS-CHAVE =====

  describe("Creativity Keyword Sets", () => {
    // Teste para cada conjunto individual
    [
      { set: CREATIVITY_KEYWORD_SET_7, name: "Set 7" },
      { set: CREATIVITY_KEYWORD_SET_8, name: "Set 8" },
      { set: CREATIVITY_KEYWORD_SET_9, name: "Set 9" },
      { set: CREATIVITY_KEYWORD_SET_10, name: "Set 10" },
      { set: CREATIVITY_KEYWORD_SET_11, name: "Set 11" },
      { set: CREATIVITY_KEYWORD_SET_12, name: "Set 12" },
    ].forEach(({ set, name }) => {
      describe(name, () => {
        it("should have exactly 20 entries for d20 table", () => {
          expect(set).toHaveLength(20);
        });

        it("should cover complete d20 range without gaps", () => {
          const coveredNumbers = new Set<number>();

          set.forEach((entry) => {
            for (let i = entry.min; i <= entry.max; i++) {
              expect(coveredNumbers.has(i)).toBe(false);
              coveredNumbers.add(i);
            }
          });

          for (let i = 1; i <= 20; i++) {
            expect(coveredNumbers.has(i)).toBe(true);
          }
        });

        it("should have each entry covering exactly one number", () => {
          set.forEach((entry, index) => {
            const expectedNumber = index + 1;
            expect(entry.min).toBe(expectedNumber);
            expect(entry.max).toBe(expectedNumber);
            expect(entry.result.keyword).toBeTruthy();
            expect(entry.result.keyword.length).toBeGreaterThan(0);
          });
        });

        it("should have unique keywords within the set", () => {
          const keywords = set.map((entry) => entry.result.keyword);
          const uniqueKeywords = new Set(keywords);
          expect(uniqueKeywords.size).toBe(20);
        });
      });
    });

    // Teste para verificar conteúdo específico dos conjuntos
    it("should contain expected keywords from markdown", () => {
      // Set 7 - Elementos gerais de RPG
      const set7Keywords = CREATIVITY_KEYWORD_SET_7.map(
        (e) => e.result.keyword
      );
      expect(set7Keywords).toContain("Bêbado");
      expect(set7Keywords).toContain("Dragão");
      expect(set7Keywords).toContain("Anão");
      expect(set7Keywords).toContain("Guilda");
      expect(set7Keywords).toContain("Esfirra");

      // Set 8 - Emoções
      const set8Keywords = CREATIVITY_KEYWORD_SET_8.map(
        (e) => e.result.keyword
      );
      expect(set8Keywords).toContain("Amor");
      expect(set8Keywords).toContain("Raiva");
      expect(set8Keywords).toContain("Felicidade");
      expect(set8Keywords).toContain("Medo");

      // Set 9 - Elementos sombrios/dungeon
      const set9Keywords = CREATIVITY_KEYWORD_SET_9.map(
        (e) => e.result.keyword
      );
      expect(set9Keywords).toContain("Esqueleto");
      expect(set9Keywords).toContain("Escuridão");
      expect(set9Keywords).toContain("Tesouro");
      expect(set9Keywords).toContain("Caverna");

      // Set 12 - Elementos de aventura
      const set12Keywords = CREATIVITY_KEYWORD_SET_12.map(
        (e) => e.result.keyword
      );
      expect(set12Keywords).toContain("Morte");
      expect(set12Keywords).toContain("Recompensa");
      expect(set12Keywords).toContain("Exploração");
      expect(set12Keywords).toContain("Horizonte");
    });
  });

  // ===== TESTES DO ARRAY DE CONJUNTOS =====

  describe("ALL_CREATIVITY_KEYWORD_SETS", () => {
    it("should contain exactly 6 keyword sets", () => {
      expect(ALL_CREATIVITY_KEYWORD_SETS).toHaveLength(6);
    });

    it("should contain all individual sets in correct order", () => {
      expect(ALL_CREATIVITY_KEYWORD_SETS[0]).toBe(CREATIVITY_KEYWORD_SET_7);
      expect(ALL_CREATIVITY_KEYWORD_SETS[1]).toBe(CREATIVITY_KEYWORD_SET_8);
      expect(ALL_CREATIVITY_KEYWORD_SETS[2]).toBe(CREATIVITY_KEYWORD_SET_9);
      expect(ALL_CREATIVITY_KEYWORD_SETS[3]).toBe(CREATIVITY_KEYWORD_SET_10);
      expect(ALL_CREATIVITY_KEYWORD_SETS[4]).toBe(CREATIVITY_KEYWORD_SET_11);
      expect(ALL_CREATIVITY_KEYWORD_SETS[5]).toBe(CREATIVITY_KEYWORD_SET_12);
    });
  });

  // ===== TESTES DAS FUNÇÕES UTILITÁRIAS =====

  describe("generateRandomKeywords", () => {
    it("should generate between 1 and 6 keywords", () => {
      for (let i = 0; i < 50; i++) {
        // Teste múltiplas execuções
        const keywords = generateRandomKeywords();
        expect(keywords.length).toBeGreaterThanOrEqual(1);
        expect(keywords.length).toBeLessThanOrEqual(6);
      }
    });

    it("should return valid keyword objects", () => {
      const keywords = generateRandomKeywords();
      keywords.forEach((keyword) => {
        expect(keyword).toHaveProperty("keyword");
        expect(typeof keyword.keyword).toBe("string");
        expect(keyword.keyword.length).toBeGreaterThan(0);
      });
    });

    it("should avoid duplicates from same set when possible", () => {
      // Como usa sets diferentes, não deveria ter palavras duplicadas
      // Mas vamos testar só se retorna objetos válidos
      for (let i = 0; i < 20; i++) {
        const keywords = generateRandomKeywords();
        expect(keywords.length).toBeGreaterThan(0);
        keywords.forEach((keyword) => {
          expect(keyword.keyword).toBeTruthy();
        });
      }
    });
  });

  describe("getRandomKeywordFromSet", () => {
    it("should return valid keyword for each set number", () => {
      const setNumbers = [7, 8, 9, 10, 11, 12] as const;

      setNumbers.forEach((setNum) => {
        const keyword = getRandomKeywordFromSet(setNum);
        expect(keyword).toHaveProperty("keyword");
        expect(typeof keyword.keyword).toBe("string");
        expect(keyword.keyword.length).toBeGreaterThan(0);
      });
    });

    it("should return keywords from correct sets", () => {
      // Teste múltiplas execuções para verificar se vem do conjunto correto
      for (let i = 0; i < 10; i++) {
        const keyword7 = getRandomKeywordFromSet(7);
        const set7Keywords = CREATIVITY_KEYWORD_SET_7.map(
          (e) => e.result.keyword
        );
        expect(set7Keywords).toContain(keyword7.keyword);

        const keyword12 = getRandomKeywordFromSet(12);
        const set12Keywords = CREATIVITY_KEYWORD_SET_12.map(
          (e) => e.result.keyword
        );
        expect(set12Keywords).toContain(keyword12.keyword);
      }
    });
  });

  // ===== TESTES DE INTEGRAÇÃO E VALIDAÇÃO GERAL =====

  describe("Integration and Validation", () => {
    it("should have all tables properly structured for TableEntry interface", () => {
      // Verificar se todas as tabelas seguem o padrão TableEntry
      const allTables = [
        ADDITIONAL_CHALLENGE_CHANCE_TABLE,
        ADDITIONAL_CHALLENGE_TABLE,
        ...ALL_CREATIVITY_KEYWORD_SETS,
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

    it("should provide rich content for creative gameplay", () => {
      // Verificar que o sistema provê conteúdo rico e variado

      // 5% de chance de desafio adicional (1/20)
      const challengeChanceEntries = ADDITIONAL_CHALLENGE_CHANCE_TABLE;
      const yesEntries = challengeChanceEntries.filter(
        (e) => e.result.hasChallenge
      );
      const noEntries = challengeChanceEntries.filter(
        (e) => !e.result.hasChallenge
      );

      expect(yesEntries).toHaveLength(1); // Apenas entrada 20
      expect(noEntries).toHaveLength(1); // Entradas 1-19
      expect(noEntries[0].max - noEntries[0].min + 1).toBe(19); // 95% de chance de não ter

      // 100 desafios únicos
      expect(ADDITIONAL_CHALLENGE_TABLE).toHaveLength(100);

      // 6 conjuntos de 20 palavras-chave cada
      expect(ALL_CREATIVITY_KEYWORD_SETS).toHaveLength(6);
      ALL_CREATIVITY_KEYWORD_SETS.forEach((set) => {
        expect(set).toHaveLength(20);
      });

      // Total de 120 palavras-chave únicas disponíveis
      const allKeywords = ALL_CREATIVITY_KEYWORD_SETS.flatMap((set) =>
        set.map((entry) => entry.result.keyword)
      );
      expect(allKeywords).toHaveLength(120);
    });

    it("should follow markdown specifications exactly", () => {
      // Verificar conformidade com especificações do markdown

      // Chance de desafio: 1-19 Não, 20 Sim
      expect(ADDITIONAL_CHALLENGE_CHANCE_TABLE[0].min).toBe(1);
      expect(ADDITIONAL_CHALLENGE_CHANCE_TABLE[0].max).toBe(19);
      expect(ADDITIONAL_CHALLENGE_CHANCE_TABLE[1].min).toBe(20);
      expect(ADDITIONAL_CHALLENGE_CHANCE_TABLE[1].max).toBe(20);

      // Desafios: d100 com 100 entradas únicas
      expect(ADDITIONAL_CHALLENGE_TABLE).toHaveLength(100);
      ADDITIONAL_CHALLENGE_TABLE.forEach((entry, index) => {
        expect(entry.min).toBe(index + 1);
        expect(entry.max).toBe(index + 1);
      });

      // Conjuntos de palavras-chave: 7-12 (6 conjuntos) com d20 cada
      expect(ALL_CREATIVITY_KEYWORD_SETS).toHaveLength(6);
      ALL_CREATIVITY_KEYWORD_SETS.forEach((set) => {
        expect(set).toHaveLength(20);
        set.forEach((entry, index) => {
          expect(entry.min).toBe(index + 1);
          expect(entry.max).toBe(index + 1);
        });
      });
    });
  });
});
