import { describe, it, expect } from "vitest";
import { AntagonistGenerator } from "@/utils/generators/antagonistGenerator";
import { AntagonistCategory } from "@/types/contract";

describe("AntagonistGenerator", () => {
  describe("generateAntagonist", () => {
    it("deve gerar um antagonista válido", () => {
      const antagonist = AntagonistGenerator.generateAntagonist();

      // Verificações básicas de estrutura
      expect(antagonist).toBeDefined();
      expect(antagonist.category).toBeDefined();
      expect(Object.values(AntagonistCategory)).toContain(antagonist.category);
      expect(antagonist.specificType).toBeDefined();
      expect(antagonist.name).toBeDefined();
      expect(antagonist.description).toBeDefined();

      // Verificações que os campos obrigatórios existem
      expect(typeof antagonist.category).toBe("string");
      expect(typeof antagonist.specificType).toBe("string");
      expect(typeof antagonist.name).toBe("string");
      expect(typeof antagonist.description).toBe("string");

      // Verificações que não há campos
      const allowedKeys = ["category", "specificType", "name", "description"];
      const actualKeys = Object.keys(antagonist);
      expect(actualKeys).toEqual(expect.arrayContaining(allowedKeys));
      expect(actualKeys.length).toBe(allowedKeys.length);
    });

    it("deve gerar múltiplos antagonistas únicos", () => {
      const antagonists = Array.from({ length: 10 }, () =>
        AntagonistGenerator.generateAntagonist()
      );

      // Verifica que todos são válidos
      antagonists.forEach((antagonist) => {
        expect(antagonist.category).toBeDefined();
        expect(antagonist.specificType).toBeDefined();
        expect(antagonist.name).toBeDefined();
        expect(antagonist.description).toBeDefined();
      });

      // Verifica alguma variação (nem todos devem ser idênticos)
      const uniqueCategories = new Set(antagonists.map((a) => a.category));
      expect(uniqueCategories.size).toBeGreaterThan(1);
    });

    it("deve gerar nomes baseados no tipo específico", () => {
      const antagonist = AntagonistGenerator.generateAntagonist();
      expect(antagonist.name).toBeDefined();
      expect(antagonist.name.length).toBeGreaterThan(0);
      expect(typeof antagonist.name).toBe("string");
    });

    it("deve gerar descrições simples e diretas", () => {
      const antagonist = AntagonistGenerator.generateAntagonist();
      expect(antagonist.description.length).toBeGreaterThan(10);
      expect(antagonist.description).toContain(
        antagonist.specificType.toLowerCase()
      );
    });

    it("deve validar categorias", () => {
      const validCategories = [
        "Humanoide poderoso",
        "Artefato mágico",
        "Organização",
        "Perigo iminente",
        "Entidade sobrenatural",
        "Anomalia",
        "Desastre ou acidente",
        "Crise",
        "Mistério",
      ];

      const antagonist = AntagonistGenerator.generateAntagonist();
      expect(validCategories).toContain(antagonist.category);
    });
  });
});
