import { describe, it, expect } from "vitest";
import { matchesContractCode, matchesServiceCode } from "@/utils/id-search";

describe("ID Search Integration Tests", () => {
  describe("Real-world usage scenarios", () => {
    // Simulando IDs reais como seriam gerados pelo sistema
    const realContractIds = [
      "01234567-89ab-cdef-0123-456789abcdef", // código: CDEF
      "a1b2c3d4-e5f6-7890-abcd-1234567890ef", // código: 90EF
      "contract-uuid-test-example-9376abcd", // código: ABCD
    ];

    const realServiceIds = [
      "01234567-89ab-cdef-0123-456789abcdef01", // código: ABCDEF01 (últimos 8 chars)
      "service-a1b2c3d4-e5f6-7890-6A3998B2", // código: 3998B2 (últimos 8 chars)
      "another-service-uuid-test-74F20C1A", // código: F20C1A (últimos 8 chars)
    ];

    it("should find contracts by their display codes", () => {
      // Teste padrão: buscar "Contrato #CDEF" com input "#CDEF"
      expect(matchesContractCode("#CDEF", realContractIds[0])).toBe(true);
      expect(matchesContractCode("CDEF", realContractIds[0])).toBe(true);
      expect(matchesContractCode("cdef", realContractIds[0])).toBe(true);

      // Teste com ID que termina em 90EF
      expect(matchesContractCode("#90EF", realContractIds[1])).toBe(true);
      expect(matchesContractCode("90ef", realContractIds[1])).toBe(true);

      // Teste com ID que termina em ABCD
      expect(matchesContractCode("#ABCD", realContractIds[2])).toBe(true);
      expect(matchesContractCode("abcd", realContractIds[2])).toBe(true);
    });

    it("should find contracts by partial codes", () => {
      // Buscar por parte do código (mínimo 2 caracteres)
      expect(matchesContractCode("CD", realContractIds[0])).toBe(true); // CDEF contém CD
      expect(matchesContractCode("EF", realContractIds[0])).toBe(true); // CDEF contém EF
      expect(matchesContractCode("90", realContractIds[1])).toBe(true); // 90EF contém 90
      expect(matchesContractCode("AB", realContractIds[2])).toBe(true); // ABCD contém AB
    });

    it("should find services by their display codes", () => {
      // Serviços usam 8 caracteres finais
      expect(matchesServiceCode("#ABCDEF01", realServiceIds[0])).toBe(true);
      expect(matchesServiceCode("abcdef01", realServiceIds[0])).toBe(true);

      // ID que termina em 3998B2 (note: último ID tem apenas 6 chars, pega últimos 8)
      expect(matchesServiceCode("#3998B2", realServiceIds[1])).toBe(true);
      expect(matchesServiceCode("3998b2", realServiceIds[1])).toBe(true);

      // ID que termina em F20C1A
      expect(matchesServiceCode("#F20C1A", realServiceIds[2])).toBe(true);
      expect(matchesServiceCode("f20c1a", realServiceIds[2])).toBe(true);
    });

    it("should find services by partial codes", () => {
      // Buscar por parte do código de serviço
      expect(matchesServiceCode("ABCD", realServiceIds[0])).toBe(true);
      expect(matchesServiceCode("F01", realServiceIds[0])).toBe(true);
      expect(matchesServiceCode("3998", realServiceIds[1])).toBe(true);
      expect(matchesServiceCode("B2", realServiceIds[1])).toBe(true);
      expect(matchesServiceCode("F20C", realServiceIds[2])).toBe(true);
      expect(matchesServiceCode("1A", realServiceIds[2])).toBe(true);
    });

    it("should not match incorrect codes", () => {
      // Códigos que não existem
      expect(matchesContractCode("XXXX", realContractIds[0])).toBe(false);
      expect(matchesContractCode("1111", realContractIds[1])).toBe(false);

      expect(matchesServiceCode("XXXXXXXX", realServiceIds[0])).toBe(false);
      expect(matchesServiceCode("11111111", realServiceIds[1])).toBe(false);
    });

    it("should handle edge cases gracefully", () => {
      // Busca por primeiro caractere agora deve funcionar
      expect(matchesContractCode("C", realContractIds[0])).toBe(true); // "CDEF" começa com "C"
      expect(matchesServiceCode("A", realServiceIds[0])).toBe(true); // "ABCDEF01" começa com "A"

      // IDs vazios ou inválidos
      expect(matchesContractCode("CDEF", "")).toBe(false);
      expect(matchesServiceCode("ABCDEF01", "")).toBe(false);

      // Busca vazia
      expect(matchesContractCode("", realContractIds[0])).toBe(false);
      expect(matchesServiceCode("", realServiceIds[0])).toBe(false);
    });
  });

  describe("Filter integration simulation", () => {
    // Simula como os filtros usariam essas funções
    const mockContracts = [
      { id: "contract-1-uuid-example-9376", title: "Contrato de Exemplo 1" },
      { id: "contract-2-uuid-example-7514", title: "Contrato de Exemplo 2" },
      { id: "contract-3-uuid-example-3455", title: "Contrato de Exemplo 3" },
    ];

    const mockServices = [
      { id: "service-1-uuid-6A3998B2", title: "Serviço de Exemplo 1" },
      { id: "service-2-uuid-74F20C1A", title: "Serviço de Exemplo 2" },
      { id: "service-3-uuid-DC2AB3D8", title: "Serviço de Exemplo 3" },
    ];

    it("should filter contracts by code search", () => {
      const filterContracts = (searchText: string) => {
        return mockContracts.filter(
          (contract) =>
            contract.title.toLowerCase().includes(searchText.toLowerCase()) ||
            matchesContractCode(searchText, contract.id)
        );
      };

      // Buscar por código específico
      let results = filterContracts("#9376");
      expect(results).toHaveLength(1);
      expect(results[0].id).toContain("9376");

      results = filterContracts("7514");
      expect(results).toHaveLength(1);
      expect(results[0].id).toContain("7514");

      // Buscar por código parcial
      results = filterContracts("34");
      expect(results).toHaveLength(1);
      expect(results[0].id).toContain("3455");

      // Buscar por título (funcionalidade existente continua funcionando)
      results = filterContracts("Exemplo 2");
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe("Contrato de Exemplo 2");
    });

    it("should filter services by code search", () => {
      const filterServices = (searchText: string) => {
        return mockServices.filter(
          (service) =>
            service.title.toLowerCase().includes(searchText.toLowerCase()) ||
            matchesServiceCode(searchText, service.id)
        );
      };

      // Buscar por código específico
      let results = filterServices("#6A3998B2");
      expect(results).toHaveLength(1);
      expect(results[0].id).toContain("6A3998B2");

      results = filterServices("74F20C1A");
      expect(results).toHaveLength(1);
      expect(results[0].id).toContain("74F20C1A");

      // Buscar por código parcial
      results = filterServices("DC2A");
      expect(results).toHaveLength(1);
      expect(results[0].id).toContain("DC2AB3D8");

      // Buscar por título (funcionalidade existente continua funcionando)
      results = filterServices("Exemplo 3");
      expect(results).toHaveLength(1);
      expect(results[0].title).toBe("Serviço de Exemplo 3");
    });
  });
});
