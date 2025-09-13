import { describe, it, expect } from "vitest";
import {
  matchesServiceCode,
  extractIdCode,
  normalizeCodeSearch,
} from "@/utils/id-search";

describe("Service ID Search Bug Investigation", () => {
  const mockServiceId = "service-uuid-example-6A3998B2";

  it("should debug the exact issue reported", () => {
    // Extrair o código que deveria aparecer
    const extractedCode = extractIdCode(mockServiceId, 8);
    console.log("Extracted code from", mockServiceId, ":", extractedCode);

    // Testar casos específicos mencionados pelo usuário
    const testCases = [
      {
        input: "#",
        shouldMatch: true,
        description: "hash only should match all services",
      },
      {
        input: "6",
        shouldMatch: true,
        description: "single digit should match if code starts with it",
      },
      {
        input: "#6",
        shouldMatch: true,
        description: "#6 should match if code starts with 6",
      },
      { input: "6A", shouldMatch: true, description: "6A should match" },
      { input: "#6A", shouldMatch: true, description: "#6A should match" },
    ];

    testCases.forEach(({ input, shouldMatch, description }) => {
      const normalized = normalizeCodeSearch(input);
      const actualMatch = matchesServiceCode(input, mockServiceId);

      console.log(`Testing "${input}":`, {
        normalized,
        extractedCode,
        expected: shouldMatch,
        actual: actualMatch,
        description,
      });

      if (shouldMatch) {
        expect(
          actualMatch,
          `${description} - "${input}" should match "${extractedCode}"`
        ).toBe(true);
      } else {
        expect(
          actualMatch,
          `${description} - "${input}" should NOT match "${extractedCode}"`
        ).toBe(false);
      }
    });
  });

  it("should handle edge cases that might cause the bug", () => {
    // Teste com IDs que terminam de forma estranha
    const edgeCaseIds = [
      "very-short-id-AB", // ID muito curto
      "id-ending-with-12AB", // ID que termina com números/letras
      "uuid-example-6A3998B2", // ID do exemplo
    ];

    edgeCaseIds.forEach((id) => {
      const code = extractIdCode(id, 8);
      console.log(`ID: ${id} -> Code: "${code}" (length: ${code.length})`);

      // Testar se busca por # sozinho retorna todos os itens
      const hashOnlyMatch = matchesServiceCode("#", id);
      expect(hashOnlyMatch, `"#" alone should match any ID`).toBe(true);

      // Testar se primeiro caractere funciona (quando deveria)
      if (code.length >= 1) {
        const firstChar = code[0];
        const firstCharMatch = matchesServiceCode(firstChar, id);
        expect(
          firstCharMatch,
          `Single character "${firstChar}" should match codes starting with it`
        ).toBe(true);

        if (code.length >= 2) {
          const twoChars = code.substring(0, 2);
          const twoCharMatch = matchesServiceCode(twoChars, id);
          expect(
            twoCharMatch,
            `Two characters "${twoChars}" should match`
          ).toBe(true);
        }
      }
    });
  });

  it("should analyze the normalization logic", () => {
    const testInputs = ["#", "6", "#6", "6A", "#6A"];

    testInputs.forEach((input) => {
      const normalized = normalizeCodeSearch(input);
      console.log(
        `Input: "${input}" -> Normalized: "${normalized}" (length: ${normalized.length})`
      );

      // Verificar se normalização está correta
      if (input === "#") {
        expect(normalized).toBe(""); // # sozinho vira string vazia
      }
      if (input === "#6") {
        expect(normalized).toBe("6"); // #6 vira 6
      }
      if (input === "#6A") {
        expect(normalized).toBe("6A"); // #6A vira 6A
      }
    });
  });
});
