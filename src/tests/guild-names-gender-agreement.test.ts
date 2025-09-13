/**
 * Teste da correção de concordância de gênero nos nomes de guilda
 * Verifica se a função aplica corretamente as flexões em português
 */

import { describe, it, expect, vi } from "vitest";
import {
  generateRandomGuildName,
  applyConcordance,
  getPrefixGender,
  Gender,
  SuffixType,
  GUILD_NAME_PREFIXES_CLASSIFIED,
  GUILD_NAME_SUFFIXES_CLASSIFIED,
} from "@/data/guild-names";

describe("Guild Names - Gender Agreement System", () => {
  describe("generateRandomGuildName", () => {
    it("deve gerar nomes com concordância correta para substantivos femininos + adjetivos", () => {
      // Simular rolagem para "Aurora" (feminino) + "Prateado" (adjetivo)
      const mockDiceRoller = vi.fn();

      // Aurora está no índice 92 (93-1) da lista de prefixos
      const auroraIndex = GUILD_NAME_PREFIXES_CLASSIFIED.findIndex(
        (p) => p.name === "Aurora"
      );
      mockDiceRoller.mockReturnValueOnce(auroraIndex + 1); // +1 porque rolagem começa em 1

      // Prateado está nos sufixos adjetivos
      const prateadoIndex = GUILD_NAME_SUFFIXES_CLASSIFIED.findIndex(
        (s) => s.name === "Prateado"
      );
      mockDiceRoller.mockReturnValueOnce(prateadoIndex + 1);

      const result = generateRandomGuildName(mockDiceRoller);

      expect(result).toBe("Aurora Prateada"); // Deve aplicar a forma feminina
      expect(result).not.toBe("Aurora Prateado"); // Não deve usar a forma masculina
    });

    it("deve manter substantivos femininos + substantivos sem flexão", () => {
      const mockDiceRoller = vi.fn();

      // Aurora (feminino)
      const auroraIndex = GUILD_NAME_PREFIXES_CLASSIFIED.findIndex(
        (p) => p.name === "Aurora"
      );
      mockDiceRoller.mockReturnValueOnce(auroraIndex + 1);

      // "do Sol" (substantivo, não flexiona)
      const doSolIndex = GUILD_NAME_SUFFIXES_CLASSIFIED.findIndex(
        (s) => s.name === "do Sol"
      );
      mockDiceRoller.mockReturnValueOnce(doSolIndex + 1);

      const result = generateRandomGuildName(mockDiceRoller);

      expect(result).toBe("Aurora do Sol"); // Substantivos não flexionam
    });

    it("deve gerar nomes com concordância correta para substantivos masculinos + adjetivos", () => {
      const mockDiceRoller = vi.fn();

      // Círculo (masculino)
      const circuloIndex = GUILD_NAME_PREFIXES_CLASSIFIED.findIndex(
        (p) => p.name === "Círculo"
      );
      mockDiceRoller.mockReturnValueOnce(circuloIndex + 1);

      // Sagrado (adjetivo)
      const sagradoIndex = GUILD_NAME_SUFFIXES_CLASSIFIED.findIndex(
        (s) => s.name === "Sagrado"
      );
      mockDiceRoller.mockReturnValueOnce(sagradoIndex + 1);

      const result = generateRandomGuildName(mockDiceRoller);

      expect(result).toBe("Círculo Sagrado"); // Deve manter a forma masculina
      expect(result).not.toBe("Círculo Sagrada"); // Não deve usar a forma feminina
    });

    it("deve tratar adjetivos invariáveis corretamente", () => {
      const mockDiceRoller = vi.fn();

      // Torre (feminino)
      const torreIndex = GUILD_NAME_PREFIXES_CLASSIFIED.findIndex(
        (p) => p.name === "Torre"
      );
      mockDiceRoller.mockReturnValueOnce(torreIndex + 1);

      // Verde (adjetivo invariável)
      const verdeIndex = GUILD_NAME_SUFFIXES_CLASSIFIED.findIndex(
        (s) => s.name === "Verde"
      );
      mockDiceRoller.mockReturnValueOnce(verdeIndex + 1);

      const result = generateRandomGuildName(mockDiceRoller);

      expect(result).toBe("Torre Verde"); // Verde é invariável
    });
  });

  describe("applyConcordance", () => {
    it("deve aplicar concordância manual corretamente", () => {
      const result1 = applyConcordance("Aurora", "Prateado");
      expect(result1).toBe("Aurora Prateada");

      const result2 = applyConcordance("Círculo", "Sagrado");
      expect(result2).toBe("Círculo Sagrado");

      const result3 = applyConcordance("Torre", "do Sol");
      expect(result3).toBe("Torre do Sol"); // Substantivo não flexiona
    });

    it("deve retornar string original para nomes não encontrados", () => {
      const result = applyConcordance("NomeInexistente", "AdjetivoInexistente");
      expect(result).toBe("NomeInexistente AdjetivoInexistente");
    });
  });

  describe("getPrefixGender", () => {
    it("deve retornar o gênero correto para substantivos conhecidos", () => {
      expect(getPrefixGender("Aurora")).toBe(Gender.FEMININE);
      expect(getPrefixGender("Círculo")).toBe(Gender.MASCULINE);
      expect(getPrefixGender("Torre")).toBe(Gender.FEMININE);
      expect(getPrefixGender("Bastião")).toBe(Gender.MASCULINE);
    });

    it("deve retornar null para substantivos não encontrados", () => {
      expect(getPrefixGender("NomeInexistente")).toBeNull();
    });
  });

  describe("Classificação de dados", () => {
    it("deve ter todos os prefixos classificados por gênero", () => {
      expect(GUILD_NAME_PREFIXES_CLASSIFIED).toHaveLength(100);

      GUILD_NAME_PREFIXES_CLASSIFIED.forEach((prefix) => {
        expect(prefix.name).toBeDefined();
        // Verifica se o gênero está entre os valores aceitos
        expect([Gender.MASCULINE, Gender.FEMININE]).toContain(prefix.gender);
        expect(typeof prefix.name).toBe("string");
        expect(prefix.name.length).toBeGreaterThan(0);
      });
    });

    it("deve ter todos os sufixos classificados por tipo", () => {
      expect(GUILD_NAME_SUFFIXES_CLASSIFIED).toHaveLength(100);

      GUILD_NAME_SUFFIXES_CLASSIFIED.forEach((suffix) => {
        expect(suffix.name).toBeDefined();
        // Verifica se o tipo do sufixo é ADJECTIVE ou NOUN
        expect([SuffixType.ADJECTIVE, SuffixType.NOUN]).toContain(suffix.type);
        expect(typeof suffix.name).toBe("string");
        expect(suffix.name.length).toBeGreaterThan(0);

        // Adjetivos devem ter OU formas de gênero (variáveis) OU forma neutra (invariáveis)
        if (suffix.type === SuffixType.ADJECTIVE) {
          const hasGenderForms = Boolean(
            suffix.masculineForm && suffix.feminineForm
          );
          const hasNeutralForm = Boolean(suffix.neutralForm);

          // Deve ter OU formas de gênero OU forma neutra, mas não ambos
          expect(hasGenderForms || hasNeutralForm).toBe(true);
          expect(hasGenderForms && hasNeutralForm).toBe(false);
        }
      });
    });

    it("deve garantir que adjetivos tenham formas apropriadas", () => {
      const adjectives = GUILD_NAME_SUFFIXES_CLASSIFIED.filter(
        (s) => s.type === SuffixType.ADJECTIVE
      );

      const variableAdjectives = adjectives.filter(
        (adj) => adj.masculineForm && adj.feminineForm
      );
      const invariableAdjectives = adjectives.filter((adj) => adj.neutralForm);

      // Adjetivos variáveis devem ter formas masculina e feminina
      variableAdjectives.forEach((adj) => {
        expect(adj.masculineForm).toBeDefined();
        expect(adj.feminineForm).toBeDefined();
        expect(typeof adj.masculineForm).toBe("string");
        expect(typeof adj.feminineForm).toBe("string");
        expect(adj.neutralForm).toBeUndefined(); // Não deve ter forma neutra
      });

      // Adjetivos invariáveis devem ter apenas forma neutra
      invariableAdjectives.forEach((adj) => {
        expect(adj.neutralForm).toBeDefined();
        expect(typeof adj.neutralForm).toBe("string");
        expect(adj.masculineForm).toBeUndefined(); // Não deve ter formas de gênero
        expect(adj.feminineForm).toBeUndefined();
      });

      // Verificar que temos ambos os tipos
      expect(variableAdjectives.length).toBeGreaterThan(0);
      expect(invariableAdjectives.length).toBeGreaterThan(0);
    });
  });

  describe("Casos específicos de concordância", () => {
    it("deve resolver casos problemáticos conhecidos", () => {
      // Casos que eram problemáticos antes da correção
      const problemCases = [
        { prefix: "Aurora", suffix: "Prateado", expected: "Aurora Prateada" },
        { prefix: "Torre", suffix: "Dourado", expected: "Torre Dourada" },
        { prefix: "Rosa", suffix: "Vermelho", expected: "Rosa Vermelha" },
        { prefix: "Círculo", suffix: "Sagrado", expected: "Círculo Sagrado" },
        { prefix: "Bastião", suffix: "Antigo", expected: "Bastião Antigo" },
      ];

      problemCases.forEach(({ prefix, suffix, expected }) => {
        const result = applyConcordance(prefix, suffix);
        expect(result).toBe(expected);
      });
    });
  });
});
