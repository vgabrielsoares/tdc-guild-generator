/**
 * Teste simples para demonstrar a funcionalidade de concordância de gênero
 */

import { describe, it, expect } from "vitest";
import { generateRandomGuildName, applyConcordance } from "@/data/guild-names";

describe("Demo - Concordância de Gênero", () => {
  it("deve demonstrar a correção de concordância funcionando", () => {
    // eslint-disable-next-line no-console
    console.log("\n=== DEMONSTRAÇÃO DA CORREÇÃO DE CONCORDÂNCIA ===\n");

    // Testes manuais com casos específicos
    const testCases = [
      { prefix: "Aurora", suffix: "Prateado", expected: "Aurora Prateada" },
      { prefix: "Torre", suffix: "Dourado", expected: "Torre Dourada" },
      { prefix: "Rosa", suffix: "Vermelho", expected: "Rosa Vermelha" },
      { prefix: "Círculo", suffix: "Sagrado", expected: "Círculo Sagrado" },
      { prefix: "Bastião", suffix: "Antigo", expected: "Bastião Antigo" },
      { prefix: "Guilda", suffix: "Oculto", expected: "Guilda Oculta" },
      { prefix: "Companhia", suffix: "Sábio", expected: "Companhia Sábia" },
      { prefix: "Ordem", suffix: "Eterno", expected: "Ordem Eterna" },
    ];

    // eslint-disable-next-line no-console
    console.log("Aplicando concordância manual:");
    testCases.forEach(({ prefix, suffix, expected }) => {
      const result = applyConcordance(prefix, suffix);
      const status = result === expected ? "✅" : "❌";
      // eslint-disable-next-line no-console
      console.log(
        `${status} ${prefix} + ${suffix} = ${result} (esperado: ${expected})`
      );
      expect(result).toBe(expected);
    });

    // eslint-disable-next-line no-console
    console.log("\nGerando nomes aleatórios com concordância automática:");
    for (let i = 0; i < 10; i++) {
      const randomName = generateRandomGuildName();
      // eslint-disable-next-line no-console
      console.log(`${i + 1}. ${randomName}`);
      expect(typeof randomName).toBe("string");
      expect(randomName.length).toBeGreaterThan(0);
    }

    // eslint-disable-next-line no-console
    console.log("\n=== CORREÇÃO IMPLEMENTADA COM SUCESSO ===\n");
  });
});
