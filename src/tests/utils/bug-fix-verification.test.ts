import { describe, it, expect } from "vitest";
import { matchesServiceCode } from "@/utils/id-search";

describe("Bug Fix Verification", () => {
  const mockServiceId = "service-uuid-example-6A3998B2";

  it("should fix the issues reported by user", () => {
    // PROBLEMA 1: "#" sozinho fazia todos os serviços desaparecerem
    // CORREÇÃO: "#" agora retorna true (traz todos os serviços, pois todos têm códigos)
    expect(matchesServiceCode("#", mockServiceId)).toBe(true);

    // PROBLEMA 2: Primeiro dígito nunca trazia resultados
    // CORREÇÃO: Agora busca por 1 caractere funciona se for o primeiro do código
    expect(matchesServiceCode("6", mockServiceId)).toBe(true);
    expect(matchesServiceCode("#6", mockServiceId)).toBe(true);

    // VERIFICAÇÃO: Segundo dígito ainda funciona como antes
    expect(matchesServiceCode("6A", mockServiceId)).toBe(true);
    expect(matchesServiceCode("#6A", mockServiceId)).toBe(true);

    // VERIFICAÇÃO: Busca completa ainda funciona
    expect(matchesServiceCode("6A3998B2", mockServiceId)).toBe(true);
    expect(matchesServiceCode("#6A3998B2", mockServiceId)).toBe(true);
  });

  it("should maintain good search behavior", () => {
    // Não deve retornar falsos positivos
    expect(matchesServiceCode("X", mockServiceId)).toBe(false); // código não começa com X
    expect(matchesServiceCode("A", mockServiceId)).toBe(false); // código não começa com A

    // Busca parcial funciona
    expect(matchesServiceCode("99", mockServiceId)).toBe(true); // contém "99"
    expect(matchesServiceCode("8B2", mockServiceId)).toBe(true); // contém "8B2"
  });
});
