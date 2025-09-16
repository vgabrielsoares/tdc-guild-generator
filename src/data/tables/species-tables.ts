import type { TableEntry } from "@/types/tables";
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
  type SpeciesWithSubrace,
  getSpeciesDisplayName,
  getSubraceDisplayName,
} from "@/types/species";
import { rollOnTable } from "@/utils/tableRoller";

// Type union para qualquer sub-raça
type AnySubrace =
  | CentaurSubrace
  | ElfSubrace
  | BeastSubrace
  | DragonbornSubrace
  | ConstructSubrace
  | UrganiSubrace
  | MooganiSubrace
  | GazaraiSubrace;
// Baseada na seção "Especificações de Espécie"

export const SPECIES_MAIN_TABLE: TableEntry<Species>[] = [
  {
    min: 1,
    max: 3,
    result: Species.INFERNAL,
  },
  {
    min: 4,
    max: 9,
    result: Species.DWARF,
  },
  {
    min: 10,
    max: 11,
    result: Species.CENTAUR,
  },
  {
    min: 12,
    max: 17,
    result: Species.ELF,
  },
  {
    min: 18,
    max: 23,
    result: Species.BEAST,
  },
  {
    min: 24,
    max: 26,
    result: Species.GLASNEE,
  },
  {
    min: 27,
    max: 30,
    result: Species.GNOME,
  },
  {
    min: 31,
    max: 33,
    result: Species.HALFLING,
  },
  {
    min: 34,
    max: 39,
    result: Species.HUMAN,
  },
  {
    min: 40,
    max: 41,
    result: Species.KHARGI,
  },
  {
    min: 42,
    max: 43,
    result: Species.HALF_BLOOD,
  },
  {
    min: 44,
    max: 46,
    result: Species.HOBGOBLIN,
  },
  {
    min: 47,
    max: 50,
    result: Species.DRAGONBORN,
  },
  {
    min: 51,
    max: 53,
    result: Species.WINGED,
  },
  {
    min: 54,
    max: 59,
    result: Species.ORC,
  },
  {
    min: 60,
    max: 61,
    result: Species.TRITON,
  },
  {
    min: 62,
    max: 62,
    result: Species.CONSTRUCT,
  },
  {
    min: 63,
    max: 68,
    result: Species.GOBLIN,
  },
  {
    min: 69,
    max: 69,
    result: Species.SPRITE,
  },
  {
    min: 70,
    max: 71,
    result: Species.FAIRY,
  },
  {
    min: 72,
    max: 73,
    result: Species.HARPY,
  },
  {
    min: 74,
    max: 76,
    result: Species.BUGBEAR,
  },
  {
    min: 77,
    max: 79,
    result: Species.FIRBOLG,
  },
  {
    min: 80,
    max: 83,
    result: Species.SATYR,
  },
  {
    min: 84,
    max: 84,
    result: Species.MERMAID,
  },
  {
    min: 85,
    max: 88,
    result: Species.GIANT,
  },
  {
    min: 89,
    max: 90,
    result: Species.GWELD,
  },
  {
    min: 91,
    max: 93,
    result: Species.URGANI,
  },
  {
    min: 94,
    max: 95,
    result: Species.MOOGANI,
  },
  {
    min: 96,
    max: 97,
    result: Species.GAZARAI,
  },
  {
    min: 98,
    max: 99,
    result: Species.VAMPIRE,
  },
  {
    min: 100,
    max: 100,
    result: Species.DEMIGOD,
  },
];

// ===== TABELAS DE SUB-RAÇAS =====

// Centauro Sub-raças (d100)
export const CENTAUR_SUBRACE_TABLE: TableEntry<CentaurSubrace>[] = [
  {
    min: 1,
    max: 50,
    result: CentaurSubrace.MEIRCHGYWIR,
  },
  {
    min: 51,
    max: 100,
    result: CentaurSubrace.UNEGUI,
  },
];

// Elfo Sub-raças (d100)
export const ELF_SUBRACE_TABLE: TableEntry<ElfSubrace>[] = [
  {
    min: 1,
    max: 16,
    result: ElfSubrace.AN_LUSAN,
  },
  {
    min: 17,
    max: 32,
    result: ElfSubrace.AN_GEAL,
  },
  {
    min: 33,
    max: 48,
    result: ElfSubrace.AN_GHRIAN,
  },
  {
    min: 49,
    max: 64,
    result: ElfSubrace.AN_DUBH,
  },
  {
    min: 65,
    max: 80,
    result: ElfSubrace.AN_UISGEACH,
  },
  {
    min: 81,
    max: 96,
    result: ElfSubrace.AN_AARD,
  },
  {
    min: 97,
    max: 100,
    result: ElfSubrace.MIXED,
  },
];

// Animalesco Sub-raças (d100)
export const BEAST_SUBRACE_TABLE: TableEntry<BeastSubrace>[] = [
  {
    min: 1,
    max: 7,
    result: BeastSubrace.AMPHIBIAN,
  },
  {
    min: 8,
    max: 11,
    result: BeastSubrace.ARTIODACTYL,
  },
  {
    min: 12,
    max: 18,
    result: BeastSubrace.BIRD,
  },
  {
    min: 19,
    max: 26,
    result: BeastSubrace.CANINE,
  },
  {
    min: 27,
    max: 28,
    result: BeastSubrace.ELEPHANT,
  },
  {
    min: 29,
    max: 36,
    result: BeastSubrace.FELINE,
  },
  {
    min: 37,
    max: 43,
    result: BeastSubrace.RABBIT,
  },
  {
    min: 44,
    max: 46,
    result: BeastSubrace.MARSUPIAL,
  },
  {
    min: 47,
    max: 48,
    result: BeastSubrace.HORSE,
  },
  {
    min: 49,
    max: 50,
    result: BeastSubrace.PRIMATE,
  },
  {
    min: 51,
    max: 58,
    result: BeastSubrace.REPTILE,
  },
  {
    min: 59,
    max: 66,
    result: BeastSubrace.RODENT,
  },
  {
    min: 67,
    max: 73,
    result: BeastSubrace.BEAR,
  },
  {
    min: 74,
    max: 80,
    result: BeastSubrace.INSECT,
  },
  {
    min: 81,
    max: 82,
    result: BeastSubrace.WEASEL,
  },
  {
    min: 83,
    max: 85,
    result: BeastSubrace.FISH,
  },
  {
    min: 86,
    max: 86,
    result: BeastSubrace.BAT,
  },
  {
    min: 87,
    max: 88,
    result: BeastSubrace.HYENA,
  },
  {
    min: 89,
    max: 91,
    result: BeastSubrace.MONGOOSE,
  },
  {
    min: 92,
    max: 92,
    result: BeastSubrace.WHALE,
  },
  {
    min: 93,
    max: 93,
    result: BeastSubrace.SEAL,
  },
  {
    min: 94,
    max: 95,
    result: BeastSubrace.RACCOON,
  },
  {
    min: 96,
    max: 96,
    result: BeastSubrace.ARMADILLO,
  },
  {
    min: 97,
    max: 97,
    result: BeastSubrace.MANATEE,
  },
  {
    min: 98,
    max: 98,
    result: BeastSubrace.PLATYPUS,
  },
  {
    min: 99,
    max: 99,
    result: BeastSubrace.SPIDER,
  },
  {
    min: 100,
    max: 100,
    result: BeastSubrace.OCTOPUS,
  },
];

// Tabela especial para Meio-sangue (d100)
export const HALF_BLOOD_SUBRACE_TABLE: TableEntry<Species>[] = [
  {
    min: 1,
    max: 5,
    result: Species.INFERNAL,
  },
  {
    min: 6,
    max: 9,
    result: Species.DWARF,
  },
  {
    min: 10,
    max: 11,
    result: Species.CENTAUR,
  },
  {
    min: 12,
    max: 20,
    result: Species.ELF,
  },
  {
    min: 21,
    max: 24,
    result: Species.BEAST, // Nota: Role a sub-raça
  },
  {
    min: 25,
    max: 32,
    result: Species.GLASNEE,
  },
  {
    min: 33,
    max: 35,
    result: Species.GNOME,
  },
  {
    min: 36,
    max: 38,
    result: Species.HALFLING,
  },
  {
    min: 39,
    max: 41,
    result: Species.KHARGI,
  },
  {
    min: 42,
    max: 44,
    result: Species.HOBGOBLIN,
  },
  {
    min: 45,
    max: 47,
    result: Species.DRAGONBORN,
  },
  {
    min: 48,
    max: 53,
    result: Species.WINGED,
  },
  {
    min: 54,
    max: 62,
    result: Species.ORC,
  },
  {
    min: 63,
    max: 63,
    result: Species.TRITON,
  },
  {
    min: 64,
    max: 69,
    result: Species.GOBLIN,
  },
  {
    min: 70,
    max: 70,
    result: Species.SPRITE,
  },
  {
    min: 71,
    max: 72,
    result: Species.FAIRY,
  },
  {
    min: 73,
    max: 77,
    result: Species.HARPY,
  },
  {
    min: 78,
    max: 80,
    result: Species.BUGBEAR,
  },
  {
    min: 81,
    max: 83,
    result: Species.FIRBOLG,
  },
  {
    min: 84,
    max: 86,
    result: Species.SATYR,
  },
  {
    min: 87,
    max: 92,
    result: Species.MERMAID,
  },
  {
    min: 93,
    max: 94,
    result: Species.GIANT,
  },
  {
    min: 95,
    max: 96,
    result: Species.GWELD,
  },
  {
    min: 97,
    max: 98,
    result: Species.GAZARAI,
  },
  {
    min: 99,
    max: 99,
    result: Species.TRUE_VAMPIRE,
  },
  {
    min: 100,
    max: 100,
    result: Species.DEITY,
  },
];

// Dracônico Sub-raças (d100)
export const DRAGONBORN_SUBRACE_TABLE: TableEntry<DragonbornSubrace>[] = [
  {
    min: 1,
    max: 10,
    result: DragonbornSubrace.YELLOW,
  },
  {
    min: 11,
    max: 20,
    result: DragonbornSubrace.BLUE,
  },
  {
    min: 21,
    max: 30,
    result: DragonbornSubrace.WHITE,
  },
  {
    min: 31,
    max: 40,
    result: DragonbornSubrace.GRAY,
  },
  {
    min: 41,
    max: 50,
    result: DragonbornSubrace.GOLD,
  },
  {
    min: 51,
    max: 60,
    result: DragonbornSubrace.ORANGE,
  },
  {
    min: 61,
    max: 70,
    result: DragonbornSubrace.SILVER,
  },
  {
    min: 71,
    max: 80,
    result: DragonbornSubrace.BLACK,
  },
  {
    min: 81,
    max: 90,
    result: DragonbornSubrace.GREEN,
  },
  {
    min: 91,
    max: 100,
    result: DragonbornSubrace.RED,
  },
];

// Construto Sub-raças (d100)
export const CONSTRUCT_SUBRACE_TABLE: TableEntry<ConstructSubrace>[] = [
  {
    min: 1,
    max: 10,
    result: ConstructSubrace.STONE,
  },
  {
    min: 11,
    max: 20,
    result: ConstructSubrace.CLAY,
  },
  {
    min: 21,
    max: 30,
    result: ConstructSubrace.GLASS,
  },
  {
    min: 31,
    max: 40,
    result: ConstructSubrace.ARCANE,
  },
  {
    min: 41,
    max: 50,
    result: ConstructSubrace.METAL,
  },
  {
    min: 51,
    max: 60,
    result: ConstructSubrace.CERAMIC,
  },
  {
    min: 61,
    max: 70,
    result: ConstructSubrace.FLESH,
  },
  {
    min: 71,
    max: 80,
    result: ConstructSubrace.CRYSTAL,
  },
  {
    min: 81,
    max: 90,
    result: ConstructSubrace.QUARTZ,
  },
  {
    min: 91,
    max: 100,
    result: ConstructSubrace.OBJECT,
  },
];

// Urgani Sub-raças (d100)
export const URGANI_SUBRACE_TABLE: TableEntry<UrganiSubrace>[] = [
  {
    min: 1,
    max: 25,
    result: UrganiSubrace.ANGIOSPERMS,
  },
  {
    min: 26,
    max: 50,
    result: UrganiSubrace.GYMNOSPERMS,
  },
  {
    min: 51,
    max: 75,
    result: UrganiSubrace.PTERIDOPHYTES,
  },
  {
    min: 76,
    max: 100,
    result: UrganiSubrace.BRYOPHYTES,
  },
];

// Moogani Sub-raças (d100)
export const MOOGANI_SUBRACE_TABLE: TableEntry<MooganiSubrace>[] = [
  {
    min: 1,
    max: 25,
    result: MooganiSubrace.ASCOMYCOTA,
  },
  {
    min: 26,
    max: 50,
    result: MooganiSubrace.BASIDIOMYCOTA,
  },
  {
    min: 51,
    max: 75,
    result: MooganiSubrace.GLOMEROMYCOTA,
  },
  {
    min: 76,
    max: 100,
    result: MooganiSubrace.ZYGOMYCOTA,
  },
];

// Gazarai Sub-raças (d100)
export const GAZARAI_SUBRACE_TABLE: TableEntry<GazaraiSubrace>[] = [
  {
    min: 1,
    max: 10,
    result: GazaraiSubrace.FIRE,
  },
  {
    min: 11,
    max: 20,
    result: GazaraiSubrace.WATER,
  },
  {
    min: 21,
    max: 30,
    result: GazaraiSubrace.EARTH,
  },
  {
    min: 31,
    max: 40,
    result: GazaraiSubrace.AIR,
  },
  {
    min: 41,
    max: 50,
    result: GazaraiSubrace.LIGHTNING,
  },
  {
    min: 51,
    max: 60,
    result: GazaraiSubrace.MYSTIC,
  },
  {
    min: 61,
    max: 70,
    result: GazaraiSubrace.ICE,
  },
  {
    min: 71,
    max: 80,
    result: GazaraiSubrace.PLANT,
  },
  {
    min: 81,
    max: 90,
    result: GazaraiSubrace.LIGHT,
  },
  {
    min: 91,
    max: 100,
    result: GazaraiSubrace.METAL,
  },
];

// ===== FUNÇÕES DE RESOLUÇÃO =====
// Implementam a lógica de rolagem e casos especiais conforme .md

/**
 * Rola uma espécie na tabela principal d100
 * @param context Contexto da rolagem para logs
 * @returns Resultado da rolagem da espécie
 */
export function rollSpecies(context = "Species generation"): Species {
  const result = rollOnTable(SPECIES_MAIN_TABLE, [], context);
  return result.entry.result;
}

/**
 * Rola uma sub-raça baseada na espécie
 * @param species Espécie para determinar qual tabela de sub-raça usar
 * @param context Contexto da rolagem para logs
 * @returns Sub-raça ou undefined se a espécie não tem sub-raças
 */
export function rollSubrace(
  species: Species,
  context = "Subrace generation"
):
  | CentaurSubrace
  | ElfSubrace
  | BeastSubrace
  | DragonbornSubrace
  | ConstructSubrace
  | UrganiSubrace
  | MooganiSubrace
  | GazaraiSubrace
  | undefined {
  switch (species) {
    case Species.CENTAUR:
      return rollOnTable(CENTAUR_SUBRACE_TABLE, [], context).entry.result;

    case Species.ELF:
      return rollOnTable(ELF_SUBRACE_TABLE, [], context).entry.result;

    case Species.BEAST:
      return rollOnTable(BEAST_SUBRACE_TABLE, [], context).entry.result;

    case Species.DRAGONBORN:
      return rollOnTable(DRAGONBORN_SUBRACE_TABLE, [], context).entry.result;

    case Species.CONSTRUCT:
      return rollOnTable(CONSTRUCT_SUBRACE_TABLE, [], context).entry.result;

    case Species.URGANI:
      return rollOnTable(URGANI_SUBRACE_TABLE, [], context).entry.result;

    case Species.MOOGANI:
      return rollOnTable(MOOGANI_SUBRACE_TABLE, [], context).entry.result;

    case Species.GAZARAI:
      return rollOnTable(GAZARAI_SUBRACE_TABLE, [], context).entry.result;

    default:
      return undefined;
  }
}

/**
 * Resolve casos especiais conforme regras do .md:
 * - Vampiro (98-99): Se rolar duas vezes = Vampiro Verdadeiro
 * - Semideus (100): Se rolar duas vezes = Divindade
 * - Meio-sangue: Rola na tabela especial para segunda espécie
 * @param initialSpecies Espécie inicial rolada
 * @param context Contexto da rolagem para logs
 * @returns Espécie final após resolução de casos especiais
 */
export function resolveSpecialCases(
  initialSpecies: Species,
  context = "Special case resolution"
): SpeciesWithSubrace {
  let finalSpecies = initialSpecies;
  let subrace: AnySubrace | undefined = undefined;
  let secondarySpecies: Species | undefined = undefined;
  let secondarySubrace: AnySubrace | undefined = undefined;

  // Caso especial: Vampiro - rolar novamente para verificar se é Vampiro Verdadeiro
  if (initialSpecies === Species.VAMPIRE) {
    const secondRoll = rollSpecies(`${context} - Vampire reroll`);
    if (secondRoll === Species.VAMPIRE) {
      finalSpecies = Species.TRUE_VAMPIRE;
    }
  }

  // Caso especial: Semideus - rolar novamente para verificar se é Divindade
  else if (initialSpecies === Species.DEMIGOD) {
    const secondRoll = rollSpecies(`${context} - Demigod reroll`);
    if (secondRoll === Species.DEMIGOD) {
      finalSpecies = Species.DEITY;
    }
  }

  // Caso especial: Meio-sangue - rolar na tabela especial
  else if (initialSpecies === Species.HALF_BLOOD) {
    const secondaryResult = rollOnTable(
      HALF_BLOOD_SUBRACE_TABLE,
      [],
      `${context} - Half-blood secondary species`
    );
    secondarySpecies = secondaryResult.entry.result;

    // Se a segunda espécie também tem sub-raça, rolar para ela
    secondarySubrace = rollSubrace(
      secondarySpecies,
      `${context} - Half-blood secondary subrace`
    );
  }

  // Rolar sub-raça para a espécie final (se aplicável)
  subrace = rollSubrace(finalSpecies, `${context} - Primary subrace`);

  // Caso especial: Elfo Mestiço - rolar duas sub-raças de elfo
  if (finalSpecies === Species.ELF && subrace === ElfSubrace.MIXED) {
    const firstElfSubrace = rollSubrace(
      Species.ELF,
      `${context} - Elf mixed first subrace`
    );
    const secondElfSubrace = rollSubrace(
      Species.ELF,
      `${context} - Elf mixed second subrace`
    );

    // Retorna como meio-sangue com duas sub-raças de elfo
    return {
      species: Species.HALF_BLOOD,
      subrace: firstElfSubrace,
      secondarySpecies: Species.ELF,
      secondarySubrace: secondElfSubrace,
    };
  }

  // Caso especial: Animalesco em Meio-sangue - deve rolar sub-raça
  if (secondarySpecies === Species.BEAST && !secondarySubrace) {
    secondarySubrace = rollSubrace(
      Species.BEAST,
      `${context} - Half-blood beast secondary subrace`
    );
  }

  return {
    species: finalSpecies,
    subrace,
    secondarySpecies,
    secondarySubrace,
  };
}

/**
 * Função principal para gerar espécie completa com sub-raças e casos especiais
 * Esta é a função que deve ser usada sempre que uma pessoa for mencionada no quadro de avisos
 * @param context Contexto da rolagem para logs (padrão para avisos)
 * @returns Espécie completa com sub-raças e casos especiais resolvidos
 */
export function generateCompleteSpecies(
  context = "Notice board species generation"
): SpeciesWithSubrace {
  const initialSpecies = rollSpecies(`${context} - Initial roll`);
  return resolveSpecialCases(initialSpecies, context);
}

/**
 * Função utilitária para obter nome completo da espécie gerada
 * @param speciesData Dados da espécie gerada
 * @returns String formatada com espécie e sub-raça
 */
export function getSpeciesFullName(speciesData: SpeciesWithSubrace): string {
  let result = getSpeciesDisplayName(speciesData.species);

  if (speciesData.subrace) {
    result += ` (${getSubraceDisplayName(speciesData.subrace)})`;
  }

  if (speciesData.secondarySpecies) {
    result += ` / ${getSpeciesDisplayName(speciesData.secondarySpecies)}`;

    if (speciesData.secondarySubrace) {
      result += ` (${getSubraceDisplayName(speciesData.secondarySubrace)})`;
    }
  }

  return result;
}
