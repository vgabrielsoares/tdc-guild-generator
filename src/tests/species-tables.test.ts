import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  SPECIES_MAIN_TABLE,
  CENTAUR_SUBRACE_TABLE,
  ELF_SUBRACE_TABLE,
  BEAST_SUBRACE_TABLE,
  HALF_BLOOD_SUBRACE_TABLE,
  rollSpecies,
  rollSubrace,
  resolveSpecialCases,
  generateCompleteSpecies,
  getSpeciesFullName,
} from "@/data/tables/species-tables";
import { Species, CentaurSubrace, ElfSubrace } from "@/types/species";
import { validateTableCoverage } from "@/utils/table-operations";

// Mock da função rollOnTable para testes determinísticos
vi.mock("@/utils/tableRoller", () => ({
  rollOnTable: vi.fn(),
}));

import { rollOnTable } from "@/utils/tableRoller";
const mockRollOnTable = vi.mocked(rollOnTable);

describe("Species Tables - Issue 7.3", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Validação das Tabelas", () => {
    it("deve ter cobertura completa na tabela principal (d100)", () => {
      expect(validateTableCoverage(SPECIES_MAIN_TABLE, 100)).toBe(true);
    });

    it("deve ter casos especiais implementados conforme .md", () => {
      // Vampiro: 98-99
      const vampireEntries = SPECIES_MAIN_TABLE.filter(
        (entry) => entry.result === Species.VAMPIRE
      );
      expect(vampireEntries).toHaveLength(1);
      expect(vampireEntries[0]).toEqual({
        min: 98,
        max: 99,
        result: Species.VAMPIRE,
      });

      // Semideus: 100
      const demigodEntries = SPECIES_MAIN_TABLE.filter(
        (entry) => entry.result === Species.DEMIGOD
      );
      expect(demigodEntries).toHaveLength(1);
      expect(demigodEntries[0]).toEqual({
        min: 100,
        max: 100,
        result: Species.DEMIGOD,
      });
    });

    it("deve ter sub-raças com cobertura correta", () => {
      expect(validateTableCoverage(CENTAUR_SUBRACE_TABLE, 100)).toBe(true);
      expect(validateTableCoverage(ELF_SUBRACE_TABLE, 100)).toBe(true);
      expect(validateTableCoverage(BEAST_SUBRACE_TABLE, 100)).toBe(true);
      expect(validateTableCoverage(HALF_BLOOD_SUBRACE_TABLE, 100)).toBe(true);
    });
  });

  describe("Funções de Rolagem", () => {
    it("deve rolar espécie corretamente", () => {
      mockRollOnTable.mockReturnValue({
        entry: { min: 34, max: 39, result: Species.HUMAN },
        roll: 36,
        modifiers: [],
        finalRoll: 36,
        result: Species.HUMAN,
      });

      const result = rollSpecies("test");
      expect(result).toBe(Species.HUMAN);
    });

    it("deve rolar sub-raça para espécies apropriadas", () => {
      mockRollOnTable.mockReturnValue({
        entry: { min: 1, max: 50, result: CentaurSubrace.MEIRCHGYWIR },
        roll: 25,
        modifiers: [],
        finalRoll: 25,
        result: CentaurSubrace.MEIRCHGYWIR,
      });

      const result = rollSubrace(Species.CENTAUR);
      expect(result).toBe(CentaurSubrace.MEIRCHGYWIR);
    });

    it("deve retornar undefined para espécies sem sub-raças", () => {
      const result = rollSubrace(Species.HUMAN);
      expect(result).toBeUndefined();
    });
  });

  describe("Casos Especiais", () => {
    it("deve resolver vampiro verdadeiro", () => {
      mockRollOnTable.mockReturnValue({
        entry: { min: 98, max: 99, result: Species.VAMPIRE },
        roll: 98,
        modifiers: [],
        finalRoll: 98,
        result: Species.VAMPIRE,
      });

      const result = resolveSpecialCases(Species.VAMPIRE);
      expect(result.species).toBe(Species.TRUE_VAMPIRE);
    });

    it("deve resolver divindade", () => {
      mockRollOnTable.mockReturnValue({
        entry: { min: 100, max: 100, result: Species.DEMIGOD },
        roll: 100,
        modifiers: [],
        finalRoll: 100,
        result: Species.DEMIGOD,
      });

      const result = resolveSpecialCases(Species.DEMIGOD);
      expect(result.species).toBe(Species.DEITY);
    });

    it("deve processar meio-sangue corretamente", () => {
      mockRollOnTable
        .mockReturnValueOnce({
          entry: { min: 12, max: 20, result: Species.ELF },
          roll: 15,
          modifiers: [],
          finalRoll: 15,
          result: Species.ELF,
        })
        .mockReturnValueOnce({
          entry: { min: 1, max: 16, result: ElfSubrace.AN_LUSAN },
          roll: 10,
          modifiers: [],
          finalRoll: 10,
          result: ElfSubrace.AN_LUSAN,
        });

      const result = resolveSpecialCases(Species.HALF_BLOOD);
      expect(result.species).toBe(Species.HALF_BLOOD);
      expect(result.secondarySpecies).toBe(Species.ELF);
      expect(result.secondarySubrace).toBe(ElfSubrace.AN_LUSAN);
    });
  });

  describe("Geração Completa", () => {
    it("deve gerar espécie completa", () => {
      mockRollOnTable.mockReturnValue({
        entry: { min: 34, max: 39, result: Species.HUMAN },
        roll: 36,
        modifiers: [],
        finalRoll: 36,
        result: Species.HUMAN,
      });

      const result = generateCompleteSpecies();
      expect(result.species).toBe(Species.HUMAN);
      expect(result.subrace).toBeUndefined();
    });

    it("deve formatar nomes corretamente", () => {
      const simpleSpecies = { species: Species.HUMAN };
      expect(getSpeciesFullName(simpleSpecies)).toBe("Humano");

      const withSubrace = {
        species: Species.ELF,
        subrace: ElfSubrace.AN_LUSAN,
      };
      expect(getSpeciesFullName(withSubrace)).toContain("Elfo");
      expect(getSpeciesFullName(withSubrace)).toContain("An Lusan");
    });
  });

  describe("Conformidade com Arquivo .md", () => {
    it("deve implementar nota sobre determinação automática", () => {
      // Verifica que generateCompleteSpecies implementa:
      // "Sempre que uma pessoa for mencionada no quadro de avisos, determine sua espécie"
      mockRollOnTable.mockReturnValue({
        entry: { min: 34, max: 39, result: Species.HUMAN },
        roll: 36,
        modifiers: [],
        finalRoll: 36,
        result: Species.HUMAN,
      });

      const result = generateCompleteSpecies("Notice board species generation");
      expect(result).toBeDefined();
      expect(result.species).toBeDefined();
    });

    it("deve ter casos especiais de vampiro verdadeiro e divindade", () => {
      expect(Species.TRUE_VAMPIRE).toBeDefined();
      expect(Species.DEITY).toBeDefined();

      const vampireInHalfBlood = HALF_BLOOD_SUBRACE_TABLE.find(
        (entry) => entry.result === Species.TRUE_VAMPIRE
      );
      expect(vampireInHalfBlood).toBeDefined();

      const deityInHalfBlood = HALF_BLOOD_SUBRACE_TABLE.find(
        (entry) => entry.result === Species.DEITY
      );
      expect(deityInHalfBlood).toBeDefined();
    });
  });
});
