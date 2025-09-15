import { z } from "zod";

// Enum principal de espécies baseado na tabela d100 do arquivo .md
export enum Species {
  // 1-3: Infernal (Alshayatin)
  INFERNAL = "infernal",
  // 4-9: Anão (Dvergar)
  DWARF = "dwarf",
  // 10-11: Centauro (Rhesymeirch)
  CENTAUR = "centaur",
  // 12-17: Elfo (Caolduine)
  ELF = "elf",
  // 18-23: Animalesco (Ffyrnig)
  BEAST = "beast",
  // 24-26: Glasnee
  GLASNEE = "glasnee",
  // 27-30: Gnomo (T'zuk)
  GNOME = "gnome",
  // 31-33: Halfling (Haneru)
  HALFLING = "halfling",
  // 34-39: Humano
  HUMAN = "human",
  // 40-41: Khargi
  KHARGI = "khargi",
  // 42-43: Meio-Sangue
  HALF_BLOOD = "half_blood",
  // 44-46: Hobgoblin (Muremure)
  HOBGOBLIN = "hobgoblin",
  // 47-50: Dracônico (Nolddraig)
  DRAGONBORN = "dragonborn",
  // 51-53: Alados (Ogadain)
  WINGED = "winged",
  // 54-59: Orc (Meehun)
  ORC = "orc",
  // 60-61: Tritão (Mowason)
  TRITON = "triton",
  // 62: Construto
  CONSTRUCT = "construct",
  // 63-68: Goblin (Umusobi)
  GOBLIN = "goblin",
  // 69: Duende
  SPRITE = "sprite",
  // 70-71: Fada (Teglwyth)
  FAIRY = "fairy",
  // 72-73: Harpia
  HARPY = "harpy",
  // 74-76: Bugbear (Inyamanswa)
  BUGBEAR = "bugbear",
  // 77-79: Firbolg (Mnoprei)
  FIRBOLG = "firbolg",
  // 80-83: Sátiro
  SATYR = "satyr",
  // 84: Sereia (Siren)
  MERMAID = "mermaid",
  // 85-88: Gigante
  GIANT = "giant",
  // 89-90: Gweld
  GWELD = "gweld",
  // 91-93: Urgani (Homem-planta)
  URGANI = "urgani",
  // 94-95: Moogani (Homem-fungo)
  MOOGANI = "moogani",
  // 96-97: Gazarai (Elementais)
  GAZARAI = "gazarai",
  // 98-99: Vampiro (role de novo)
  VAMPIRE = "vampire",
  // 100: Semideus (role de novo)
  DEMIGOD = "demigod",
  // Casos especiais de dupla rolagem
  TRUE_VAMPIRE = "true_vampire", // Vampiro duas vezes
  DEITY = "deity", // Semideus duas vezes
}

// Sub-raças específicas

// Centauro Sub-raças
export enum CentaurSubrace {
  MEIRCHGYWIR = "meirchgywir", // 1-50
  UNEGUI = "unegui", // 51-100
}

// Elfo Sub-raças
export enum ElfSubrace {
  AN_LUSAN = "an_lusan", // An'Lusan (Floresta) 1-16
  AN_GEAL = "an_geal", // An'Geal (Neve) 17-32
  AN_GHRIAN = "an_ghrian", // An'Ghrian (Deserto) 33-48
  AN_DUBH = "an_dubh", // An'Dubh (Caverna) 49-64
  AN_UISGEACH = "an_uisgeach", // An'Uisgeach (Água) 65-80
  AN_AARD = "an_aard", // An'Aard (Montanha) 81-96
  MIXED = "mixed", // Mestiço (Role duas vezes) 97-100
}

// Animalesco Sub-raças
export enum BeastSubrace {
  AMPHIBIAN = "amphibian", // Anfíbio 1-7
  ARTIODACTYL = "artiodactyl", // Artiodáctilo 8-11
  BIRD = "bird", // Ave 12-18
  CANINE = "canine", // Canídeo 19-26
  ELEPHANT = "elephant", // Elefantídeo 27-28
  FELINE = "feline", // Felídeo 29-36
  RABBIT = "rabbit", // Leporídeo 37-43
  MARSUPIAL = "marsupial", // Marsupial 44-46
  HORSE = "horse", // Perissodáctilo 47-48
  PRIMATE = "primate", // Primata 49-51
  REPTILE = "reptile", // Réptil 51-58
  RODENT = "rodent", // Roedor 59-66
  BEAR = "bear", // Ursídeo 67-73
  INSECT = "insect", // Inseto 74-80
  WEASEL = "weasel", // Mustelídeo 81-82
  FISH = "fish", // Peixe 83-85
  BAT = "bat", // Quiróptero 86
  HYENA = "hyena", // Hiena 87-88
  MONGOOSE = "mongoose", // Herpestídeo 89-91
  WHALE = "whale", // Cetáceo 92
  SEAL = "seal", // Pinnípede 93
  RACCOON = "raccoon", // Procionídeo 94-95
  ARMADILLO = "armadillo", // Xenartro 96
  MANATEE = "manatee", // Sirênio 97
  PLATYPUS = "platypus", // Monotremado 98
  SPIDER = "spider", // Aracnídeo 99
  OCTOPUS = "octopus", // Cefalópode 100
}

// Dracônico Sub-raças
export enum DragonbornSubrace {
  YELLOW = "yellow", // Amarelo (Ácido) 1-10
  BLUE = "blue", // Azul (Elétrico) 11-20
  WHITE = "white", // Branco (Frio) 21-30
  GRAY = "gray", // Cinza (Vento) 31-40
  GOLD = "gold", // Dourado (Mental) 41-50
  ORANGE = "orange", // Laranja (Sonoro) 51-60
  SILVER = "silver", // Prateado (Místico) 61-70
  BLACK = "black", // Preto (Necrótico) 71-80
  GREEN = "green", // Verde (Veneno) 81-90
  RED = "red", // Vermelho (Fogo) 91-100
}

// Construto Sub-raças
export enum ConstructSubrace {
  STONE = "stone", // Pedra 1-10
  CLAY = "clay", // Barro 11-20
  GLASS = "glass", // Vidro 21-30
  ARCANE = "arcane", // Arcano 31-40
  METAL = "metal", // Metal 41-50
  CERAMIC = "ceramic", // Argila 51-60
  FLESH = "flesh", // Carne 61-70
  CRYSTAL = "crystal", // Cristal 71-80
  QUARTZ = "quartz", // Quartzo 81-90
  OBJECT = "object", // Objeto 91-100
}

// Urgani Sub-raças (Homem-planta)
export enum UrganiSubrace {
  ANGIOSPERMS = "angiosperms", // Angiospérmicas 1-25
  GYMNOSPERMS = "gymnosperms", // Gimnospermas 26-50
  PTERIDOPHYTES = "pteridophytes", // Pteridófitas 51-75
  BRYOPHYTES = "bryophytes", // Briófitas 76-100
}

// Moogani Sub-raças (Homem-fungo)
export enum MooganiSubrace {
  ASCOMYCOTA = "ascomycota", // Ascomycota 1-25
  BASIDIOMYCOTA = "basidiomycota", // Basidiomycota 26-50
  GLOMEROMYCOTA = "glomeromycota", // Glomeromycota 51-75
  ZYGOMYCOTA = "zygomycota", // Zygomycota 76-100
}

// Gazarai Sub-raças (Elementais)
export enum GazaraiSubrace {
  FIRE = "fire", // Fogo 1-10
  WATER = "water", // Água 11-20
  EARTH = "earth", // Terra 21-30
  AIR = "air", // Ar 31-40
  LIGHTNING = "lightning", // Raio 41-50
  MYSTIC = "mystic", // Místico 51-60
  ICE = "ice", // Gelo 61-70
  PLANT = "plant", // Planta 71-80
  LIGHT = "light", // Luz 81-90
  METAL = "metal", // Metal 91-100
}

// Tipo principal que representa uma espécie com sub-raça opcional
export interface SpeciesWithSubrace {
  species: Species;
  subrace?:
    | CentaurSubrace
    | ElfSubrace
    | BeastSubrace
    | DragonbornSubrace
    | ConstructSubrace
    | UrganiSubrace
    | MooganiSubrace
    | GazaraiSubrace;
  // Para meio-sangue, pode ter uma segunda espécie
  secondarySpecies?: Species;
  secondarySubrace?:
    | CentaurSubrace
    | ElfSubrace
    | BeastSubrace
    | DragonbornSubrace
    | ConstructSubrace
    | UrganiSubrace
    | MooganiSubrace
    | GazaraiSubrace;
}

// Schemas Zod para validação

export const SpeciesSchema = z.nativeEnum(Species);

export const CentaurSubraceSchema = z.nativeEnum(CentaurSubrace);
export const ElfSubraceSchema = z.nativeEnum(ElfSubrace);
export const BeastSubraceSchema = z.nativeEnum(BeastSubrace);
export const DragonbornSubraceSchema = z.nativeEnum(DragonbornSubrace);
export const ConstructSubraceSchema = z.nativeEnum(ConstructSubrace);
export const UrganiSubraceSchema = z.nativeEnum(UrganiSubrace);
export const MooganiSubraceSchema = z.nativeEnum(MooganiSubrace);
export const GazaraiSubraceSchema = z.nativeEnum(GazaraiSubrace);

// Union type para qualquer sub-raça
const AnySubraceSchema = z.union([
  CentaurSubraceSchema,
  ElfSubraceSchema,
  BeastSubraceSchema,
  DragonbornSubraceSchema,
  ConstructSubraceSchema,
  UrganiSubraceSchema,
  MooganiSubraceSchema,
  GazaraiSubraceSchema,
]);

export const SpeciesWithSubraceSchema = z.object({
  species: SpeciesSchema,
  subrace: AnySubraceSchema.optional(),
  secondarySpecies: SpeciesSchema.optional(),
  secondarySubrace: AnySubraceSchema.optional(),
});

// Funções de validação
export function validateSpecies(data: unknown): Species {
  return SpeciesSchema.parse(data);
}

export function validateSpeciesWithSubrace(data: unknown): SpeciesWithSubrace {
  return SpeciesWithSubraceSchema.parse(data);
}

// Função utilitária para exibir nome amigável da espécie
export function getSpeciesDisplayName(species: Species): string {
  const displayNames: Record<Species, string> = {
    [Species.INFERNAL]: "Infernal (Alshayatin)",
    [Species.DWARF]: "Anão (Dvergar)",
    [Species.CENTAUR]: "Centauro (Rhesymeirch)",
    [Species.ELF]: "Elfo (Caolduine)",
    [Species.BEAST]: "Animalesco (Ffyrnig)",
    [Species.GLASNEE]: "Glasnee",
    [Species.GNOME]: "Gnomo (T'zuk)",
    [Species.HALFLING]: "Halfling (Haneru)",
    [Species.HUMAN]: "Humano",
    [Species.KHARGI]: "Khargi",
    [Species.HALF_BLOOD]: "Meio-Sangue",
    [Species.HOBGOBLIN]: "Hobgoblin (Muremure)",
    [Species.DRAGONBORN]: "Dracônico (Nolddraig)",
    [Species.WINGED]: "Alados (Ogadain)",
    [Species.ORC]: "Orc (Meehun)",
    [Species.TRITON]: "Tritão (Mowason)",
    [Species.CONSTRUCT]: "Construto",
    [Species.GOBLIN]: "Goblin (Umusobi)",
    [Species.SPRITE]: "Duende",
    [Species.FAIRY]: "Fada (Teglwyth)",
    [Species.HARPY]: "Harpia",
    [Species.BUGBEAR]: "Bugbear (Inyamanswa)",
    [Species.FIRBOLG]: "Firbolg (Mnoprei)",
    [Species.SATYR]: "Sátiro",
    [Species.MERMAID]: "Sereia (Siren)",
    [Species.GIANT]: "Gigante",
    [Species.GWELD]: "Gweld",
    [Species.URGANI]: "Urgani (Homem-planta)",
    [Species.MOOGANI]: "Moogani (Homem-fungo)",
    [Species.GAZARAI]: "Gazarai (Elementais)",
    [Species.VAMPIRE]: "Vampiro",
    [Species.DEMIGOD]: "Semideus",
    [Species.TRUE_VAMPIRE]: "Vampiro Verdadeiro",
    [Species.DEITY]: "Divindade",
  };

  return displayNames[species] || species;
}

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

// Função utilitária para exibir nome amigável da sub-raça
export function getSubraceDisplayName(subrace: AnySubrace): string {
  // Implementação das traduções das sub-raças seria muito extensa
  // Por ora, retorna a string convertida de forma amigável
  return String(subrace)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}
