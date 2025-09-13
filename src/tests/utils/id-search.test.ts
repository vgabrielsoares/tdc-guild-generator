import { describe, it, expect } from "vitest";
import {
  extractIdCode,
  normalizeCodeSearch,
  matchesIdCode,
  matchesContractCode,
  matchesServiceCode,
  getContractDisplayCode,
  getServiceDisplayCode,
} from "@/utils/id-search";

describe("ID Search Utilities", () => {
  // Mock IDs para testes
  const mockContractId = "contract-uuid-1234-5678-9abc-def012345678";
  const mockServiceId = "service-uuid-abcd-1234-efgh-5678ijklmnop";

  describe("extractIdCode", () => {
    it("should extract last 4 characters for contracts", () => {
      const result = extractIdCode(mockContractId, 4);
      expect(result).toBe("5678");
    });

    it("should extract last 8 characters for services", () => {
      const result = extractIdCode(mockServiceId, 8);
      expect(result).toBe("IJKLMNOP");
    });

    it("should return uppercase characters", () => {
      const lowercaseId = "test-id-abcdef";
      const result = extractIdCode(lowercaseId, 6);
      expect(result).toBe("ABCDEF");
    });
  });

  describe("normalizeCodeSearch", () => {
    it("should remove # symbol and convert to uppercase", () => {
      expect(normalizeCodeSearch("#1234")).toBe("1234");
      expect(normalizeCodeSearch("#abcd")).toBe("ABCD");
    });

    it("should remove spaces and dashes", () => {
      expect(normalizeCodeSearch("12 34")).toBe("1234");
      expect(normalizeCodeSearch("12-34")).toBe("1234");
      expect(normalizeCodeSearch("# 12-34 ")).toBe("1234");
    });

    it("should handle mixed case and special characters", () => {
      expect(normalizeCodeSearch("#Ab-1 2")).toBe("AB12");
    });
  });

  describe("matchesIdCode", () => {
    it("should match exact code", () => {
      expect(matchesIdCode("5678", mockContractId, 4)).toBe(true);
      expect(matchesIdCode("#5678", mockContractId, 4)).toBe(true);
      expect(matchesIdCode("IJKLMNOP", mockServiceId, 8)).toBe(true);
      expect(matchesIdCode("#IJKLMNOP", mockServiceId, 8)).toBe(true);
    });

    it("should match partial code (2+ characters)", () => {
      expect(matchesIdCode("56", mockContractId, 4)).toBe(true);
      expect(matchesIdCode("78", mockContractId, 4)).toBe(true);
      expect(matchesIdCode("IJKL", mockServiceId, 8)).toBe(true);
      expect(matchesIdCode("MNOP", mockServiceId, 8)).toBe(true);
    });

    it("should match single character at start of code", () => {
      // Para contratos: código "5678" deve corresponder a busca "5"
      expect(matchesIdCode("5", mockContractId, 4)).toBe(true);
      // Para serviços: código "IJKLMNOP" deve corresponder a busca "I"
      expect(matchesIdCode("I", mockServiceId, 8)).toBe(true);

      // Mas não deve corresponder se não for o primeiro caractere
      expect(matchesIdCode("6", mockContractId, 4)).toBe(false); // "5678" não começa com "6"
      expect(matchesIdCode("J", mockServiceId, 8)).toBe(false); // "IJKLMNOP" não começa com "J"
    });

    it("should not match incorrect codes", () => {
      expect(matchesIdCode("9999", mockContractId, 4)).toBe(false);
      expect(matchesIdCode("XXXX", mockServiceId, 8)).toBe(false);
    });

    it("should handle case insensitive search", () => {
      expect(matchesIdCode("ijklmnop", mockServiceId, 8)).toBe(true);
      expect(matchesIdCode("ijkl", mockServiceId, 8)).toBe(true);
    });

    it("should handle empty or invalid inputs", () => {
      expect(matchesIdCode("", mockContractId, 4)).toBe(false);
      expect(matchesIdCode("1234", "", 4)).toBe(false);
      expect(matchesIdCode("", "", 4)).toBe(false);
    });

    it("should return all items when searching with only #", () => {
      // "#" sozinho deve retornar true (traz todos os itens)
      expect(matchesIdCode("#", mockContractId, 4)).toBe(true);
      expect(matchesIdCode("#", mockServiceId, 8)).toBe(true);

      // Espaços e outros caracteres especiais também devem retornar true
      expect(matchesIdCode("# ", mockContractId, 4)).toBe(true);
      expect(matchesIdCode(" # ", mockServiceId, 8)).toBe(true);
    });
  });

  describe("matchesContractCode", () => {
    it("should use 4-character code length", () => {
      expect(matchesContractCode("5678", mockContractId)).toBe(true);
      expect(matchesContractCode("#5678", mockContractId)).toBe(true);
      expect(matchesContractCode("56", mockContractId)).toBe(true);
      expect(matchesContractCode("9999", mockContractId)).toBe(false);
    });

    it("should return all contracts when searching with only #", () => {
      expect(matchesContractCode("#", mockContractId)).toBe(true);
    });
  });

  describe("matchesServiceCode", () => {
    it("should use 8-character code length", () => {
      expect(matchesServiceCode("IJKLMNOP", mockServiceId)).toBe(true);
      expect(matchesServiceCode("#IJKLMNOP", mockServiceId)).toBe(true);
      expect(matchesServiceCode("IJKL", mockServiceId)).toBe(true);
      expect(matchesServiceCode("XXXXXXXX", mockServiceId)).toBe(false);
    });

    it("should return all services when searching with only #", () => {
      expect(matchesServiceCode("#", mockServiceId)).toBe(true);
    });
  });

  describe("getContractDisplayCode", () => {
    it("should return formatted contract code", () => {
      expect(getContractDisplayCode(mockContractId)).toBe("5678");
    });
  });

  describe("getServiceDisplayCode", () => {
    it("should return formatted service code", () => {
      expect(getServiceDisplayCode(mockServiceId)).toBe("IJKLMNOP");
    });
  });

  describe("Integration scenarios", () => {
    it("should match common user search patterns for contracts", () => {
      const contractId = "uuid-contract-example-9376";

      // Common search patterns
      expect(matchesContractCode("#9376", contractId)).toBe(true);
      expect(matchesContractCode("9376", contractId)).toBe(true);
      expect(matchesContractCode("93", contractId)).toBe(true);
      expect(matchesContractCode("#93", contractId)).toBe(true);
      expect(matchesContractCode("76", contractId)).toBe(true);

      // Should not match
      expect(matchesContractCode("1234", contractId)).toBe(false);
    });

    it("should match common user search patterns for services", () => {
      const serviceId = "uuid-service-example-6A3998B2";

      // Common search patterns
      expect(matchesServiceCode("#6A3998B2", serviceId)).toBe(true);
      expect(matchesServiceCode("6A3998B2", serviceId)).toBe(true);
      expect(matchesServiceCode("6a3998b2", serviceId)).toBe(true);
      expect(matchesServiceCode("6A39", serviceId)).toBe(true);
      expect(matchesServiceCode("#6A39", serviceId)).toBe(true);
      expect(matchesServiceCode("98B2", serviceId)).toBe(true);

      // Should not match
      expect(matchesServiceCode("XXXXXXXX", serviceId)).toBe(false);
    });
  });
});
