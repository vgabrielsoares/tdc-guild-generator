import { describe, it, expect } from "vitest";
import {
  Species,
  CentaurSubrace,
  ElfSubrace,
  BeastSubrace,
  DragonbornSubrace,
  ConstructSubrace,
  UrganiSubrace,
  MooganiSubrace,
  GazaraiSubrace,
  validateSpecies,
  validateSpeciesWithSubrace,
  getSpeciesDisplayName,
  getSubraceDisplayName,
  type SpeciesWithSubrace,
} from "@/types/species";

describe("Species Types", () => {
  describe("Species Enum", () => {
    it("should include all main species from the d100 table", () => {
      // Testando algumas espécies principais
      expect(Species.HUMAN).toBe("human");
      expect(Species.ELF).toBe("elf");
      expect(Species.DWARF).toBe("dwarf");
      expect(Species.INFERNAL).toBe("infernal");
      expect(Species.TRUE_VAMPIRE).toBe("true_vampire");
      expect(Species.DEITY).toBe("deity");
    });

    it("should include special double-roll cases", () => {
      expect(Species.TRUE_VAMPIRE).toBe("true_vampire");
      expect(Species.DEITY).toBe("deity");
    });
  });

  describe("Subrace Enums", () => {
    it("should include centaur subraces correctly", () => {
      expect(CentaurSubrace.MEIRCHGYWIR).toBe("meirchgywir");
      expect(CentaurSubrace.UNEGUI).toBe("unegui");
    });

    it("should include elf subraces with proper naming", () => {
      expect(ElfSubrace.AN_LUSAN).toBe("an_lusan");
      expect(ElfSubrace.AN_GEAL).toBe("an_geal");
      expect(ElfSubrace.MIXED).toBe("mixed");
    });

    it("should include beast subraces covering all animal types", () => {
      expect(BeastSubrace.CANINE).toBe("canine");
      expect(BeastSubrace.FELINE).toBe("feline");
      expect(BeastSubrace.OCTOPUS).toBe("octopus");
      expect(BeastSubrace.SPIDER).toBe("spider");
    });

    it("should include dragonborn subraces with color/damage mapping", () => {
      expect(DragonbornSubrace.RED).toBe("red");
      expect(DragonbornSubrace.BLUE).toBe("blue");
      expect(DragonbornSubrace.GOLD).toBe("gold");
    });

    it("should include construct subraces", () => {
      expect(ConstructSubrace.STONE).toBe("stone");
      expect(ConstructSubrace.METAL).toBe("metal");
      expect(ConstructSubrace.FLESH).toBe("flesh");
    });

    it("should include urgani (plant-man) subraces", () => {
      expect(UrganiSubrace.ANGIOSPERMS).toBe("angiosperms");
      expect(UrganiSubrace.BRYOPHYTES).toBe("bryophytes");
    });

    it("should include moogani (mushroom-man) subraces", () => {
      expect(MooganiSubrace.ASCOMYCOTA).toBe("ascomycota");
      expect(MooganiSubrace.BASIDIOMYCOTA).toBe("basidiomycota");
    });

    it("should include gazarai (elemental) subraces", () => {
      expect(GazaraiSubrace.FIRE).toBe("fire");
      expect(GazaraiSubrace.WATER).toBe("water");
      expect(GazaraiSubrace.METAL).toBe("metal");
    });
  });

  describe("Validation Functions", () => {
    it("should validate correct species", () => {
      expect(validateSpecies("human")).toBe(Species.HUMAN);
      expect(validateSpecies("elf")).toBe(Species.ELF);
      expect(validateSpecies("true_vampire")).toBe(Species.TRUE_VAMPIRE);
    });

    it("should throw error for invalid species", () => {
      expect(() => validateSpecies("invalid_species")).toThrow();
      expect(() => validateSpecies(123)).toThrow();
      expect(() => validateSpecies(null)).toThrow();
    });

    it("should validate species with subrace", () => {
      const elfWithSubrace: SpeciesWithSubrace = {
        species: Species.ELF,
        subrace: ElfSubrace.AN_LUSAN,
      };

      const validated = validateSpeciesWithSubrace(elfWithSubrace);
      expect(validated.species).toBe(Species.ELF);
      expect(validated.subrace).toBe(ElfSubrace.AN_LUSAN);
    });

    it("should validate half-blood with secondary species", () => {
      const halfBlood: SpeciesWithSubrace = {
        species: Species.HALF_BLOOD,
        subrace: undefined,
        secondarySpecies: Species.HUMAN,
      };

      const validated = validateSpeciesWithSubrace(halfBlood);
      expect(validated.species).toBe(Species.HALF_BLOOD);
      expect(validated.secondarySpecies).toBe(Species.HUMAN);
    });

    it("should throw error for invalid species with subrace", () => {
      const invalidData = {
        species: "invalid_species",
        subrace: "invalid_subrace",
      };

      expect(() => validateSpeciesWithSubrace(invalidData)).toThrow();
    });
  });

  describe("Display Name Functions", () => {
    it("should return proper display names for species", () => {
      expect(getSpeciesDisplayName(Species.HUMAN)).toBe("Humano");
      expect(getSpeciesDisplayName(Species.ELF)).toBe("Elfo (Caolduine)");
      expect(getSpeciesDisplayName(Species.DWARF)).toBe("Anão (Dvergar)");
      expect(getSpeciesDisplayName(Species.INFERNAL)).toBe(
        "Infernal (Alshayatin)"
      );
      expect(getSpeciesDisplayName(Species.TRUE_VAMPIRE)).toBe(
        "Vampiro Verdadeiro"
      );
      expect(getSpeciesDisplayName(Species.DEITY)).toBe("Divindade");
    });

    it("should return formatted subrace names", () => {
      expect(getSubraceDisplayName(ElfSubrace.AN_LUSAN)).toBe("An Lusan");
      expect(getSubraceDisplayName(BeastSubrace.CANINE)).toBe("Canine");
      expect(getSubraceDisplayName(DragonbornSubrace.BLUE)).toBe("Blue");
    });
  });

  describe("Complex Species Cases", () => {
    it("should handle mixed elf properly", () => {
      const mixedElf: SpeciesWithSubrace = {
        species: Species.ELF,
        subrace: ElfSubrace.MIXED,
      };

      expect(validateSpeciesWithSubrace(mixedElf).subrace).toBe(
        ElfSubrace.MIXED
      );
    });

    it("should handle animalesco with specific subrace", () => {
      const catPerson: SpeciesWithSubrace = {
        species: Species.BEAST,
        subrace: BeastSubrace.FELINE,
      };

      expect(validateSpeciesWithSubrace(catPerson).subrace).toBe(
        BeastSubrace.FELINE
      );
    });

    it("should handle construct with specific material", () => {
      const stoneGolem: SpeciesWithSubrace = {
        species: Species.CONSTRUCT,
        subrace: ConstructSubrace.STONE,
      };

      expect(validateSpeciesWithSubrace(stoneGolem).subrace).toBe(
        ConstructSubrace.STONE
      );
    });
  });
});

describe("Species Coverage Tests", () => {
  it("should cover all ranges from d100 table", () => {
    // Teste que verifica se temos cobertura para todas as entradas da tabela d100
    const speciesCount = Object.keys(Species).length;

    // Devemos ter pelo menos as espécies principais + casos especiais
    expect(speciesCount).toBeGreaterThan(30);
  });

  it("should have all major subrace types", () => {
    expect(Object.keys(CentaurSubrace)).toHaveLength(2); // 2 sub-raças de centauro
    expect(Object.keys(ElfSubrace)).toHaveLength(7); // 6 tipos + mestiço
    expect(Object.keys(BeastSubrace)).toHaveLength(27); // Exatos 27 tipos de animalescos
    expect(Object.keys(DragonbornSubrace)).toHaveLength(10); // 10 cores de dragão
    expect(Object.keys(ConstructSubrace)).toHaveLength(10); // 10 materiais
    expect(Object.keys(UrganiSubrace)).toHaveLength(4); // 4 tipos de plantas
    expect(Object.keys(MooganiSubrace)).toHaveLength(4); // 4 tipos de fungos
    expect(Object.keys(GazaraiSubrace)).toHaveLength(10); // 10 elementos
  });
});
