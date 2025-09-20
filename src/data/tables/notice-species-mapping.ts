import { NoticeType } from "@/types/notice";

/**
 * Configuração de contexto para tipos de pessoas mencionadas em avisos
 * Define quando uma menção requer geração de espécie baseado no contexto do aviso
 */

// Enum para tipos de criaturas/entidades mencionadas
export enum CreatureContext {
  ALWAYS_PERSON = "always_person", // Sempre é uma pessoa com espécie
  ALWAYS_ANIMAL = "always_animal", // Sempre é um animal/besta sem espécie
  CONTEXT_DEPENDENT = "context_dependent", // Pode ser pessoa ou animal, decidir aleatoriamente
  MIXED = "mixed", // Pode incluir pessoas e animais na mesma categoria
}

// Peso para determinação aleatória quando CONTEXT_DEPENDENT
export interface ContextualWeight {
  personChance: number; // Chance de ser pessoa (0-100)
  animalChance: number; // Chance de ser animal (0-100)
}

// Mapeamento de tipos de aviso para contextos de espécies
export const NOTICE_TYPE_SPECIES_CONTEXT: Record<NoticeType, CreatureContext> =
  {
    // Tipos que nunca geram conteúdo
    [NoticeType.NOTHING]: CreatureContext.ALWAYS_ANIMAL, // N/A - sem conteúdo

    // Tipos que sempre mencionam pessoas
    [NoticeType.COMMERCIAL_PROPOSAL]: CreatureContext.ALWAYS_PERSON, // Comerciantes são sempre pessoas
    [NoticeType.ANNOUNCEMENT]: CreatureContext.ALWAYS_PERSON, // Divulgações são de organizações/pessoas
    [NoticeType.EXECUTION]: CreatureContext.ALWAYS_PERSON, // Executados são sempre pessoas inteligentes
    [NoticeType.OFFICIAL_STATEMENT]: CreatureContext.ALWAYS_PERSON, // Pronunciamentos oficiais sobre pessoas
    [NoticeType.SERVICES]: CreatureContext.ALWAYS_PERSON, // Prestadores de serviço são pessoas
    [NoticeType.CONTRACTS]: CreatureContext.ALWAYS_PERSON, // Contratantes são pessoas

    // Tipos que podem mencionar animais ou pessoas
    [NoticeType.HUNT_PROPOSAL]: CreatureContext.MIXED, // Criaturas podem ser monstros ou humanoides

    // Tipos que são context-dependent
    [NoticeType.WANTED_POSTER]: CreatureContext.CONTEXT_DEPENDENT, // Pode ser pessoa desaparecida ou animal doméstico
    [NoticeType.RESIDENTS_NOTICE]: CreatureContext.CONTEXT_DEPENDENT, // Pode ser sobre pessoas ou animais
  };

// Pesos específicos para tipos context-dependent
export const CONTEXTUAL_WEIGHTS: Record<NoticeType, ContextualWeight> = {
  [NoticeType.RESIDENTS_NOTICE]: {
    personChance: 70, // 70% chance de ser sobre pessoas
    animalChance: 30, // 30% chance de ser sobre animais
  },
  [NoticeType.HUNT_PROPOSAL]: {
    personChance: 30, // 30% chance de ser humanoides inteligentes
    animalChance: 70, // 70% chance de ser bestas/monstros
  },
  [NoticeType.WANTED_POSTER]: {
    personChance: 80, // 80% chance de ser pessoas
    animalChance: 20, // 20% chance de ser animais
  },
  // Fallback para outros tipos
  [NoticeType.NOTHING]: { personChance: 0, animalChance: 100 },
  [NoticeType.COMMERCIAL_PROPOSAL]: { personChance: 100, animalChance: 0 },
  [NoticeType.ANNOUNCEMENT]: { personChance: 100, animalChance: 0 },
  [NoticeType.EXECUTION]: { personChance: 100, animalChance: 0 },
  [NoticeType.OFFICIAL_STATEMENT]: { personChance: 100, animalChance: 0 },
  [NoticeType.SERVICES]: { personChance: 100, animalChance: 0 },
  [NoticeType.CONTRACTS]: { personChance: 100, animalChance: 0 },
};

/**
 * Determina se uma menção específica requer geração de espécie
 * @param noticeType Tipo do aviso
 * @param mentionContext Contexto específico da menção (ex: "domestic_animal", "noble", "commoner")
 * @param diceRoller Função de rolagem para casos aleatórios
 * @returns true se deve gerar espécie, false caso contrário
 */
export function shouldGenerateSpecies(
  noticeType: NoticeType,
  mentionContext: string,
  diceRoller: (notation: string) => number = () => Math.random() * 100
): boolean {
  const context = NOTICE_TYPE_SPECIES_CONTEXT[noticeType];

  // Casos onde NUNCA gera espécie
  if (context === CreatureContext.ALWAYS_ANIMAL) {
    return false;
  }

  // Casos onde SEMPRE gera espécie
  if (context === CreatureContext.ALWAYS_PERSON) {
    return true;
  }

  // Casos específicos baseados no contexto da menção
  if (context === CreatureContext.MIXED) {
    return isPersonMention(mentionContext);
  }

  // Casos context-dependent - usar rolagem com pesos
  if (context === CreatureContext.CONTEXT_DEPENDENT) {
    const weights = CONTEXTUAL_WEIGHTS[noticeType];
    const roll = diceRoller("1d100");
    return roll <= weights.personChance;
  }

  return false;
}

/**
 * Determina se uma menção específica se refere a uma pessoa
 * baseado no contexto/string da menção
 */
export function isPersonMention(mentionContext: string): boolean {
  // Contextos que são SEMPRE animais (não geram espécie)
  const animalContexts = [
    "domestic_animal",
    "rural_animals",
    "animal_parts",
    "fauna",
    "beasts",
    "feral",
    "wild_animal",
    "livestock",
    "pet",
  ];

  // Contextos que são SEMPRE pessoas (geram espécie)
  const personContexts = [
    "noble",
    "commoner",
    "child",
    "merchant",
    "specialist",
    "adept",
    "adventurer",
    "retired_adventurer",
    "charismatic_creature",
    "bandits",
    "witch",
    "public_enemies",
    "cultists",
    "aristocrat",
    "arcane_adept",
    "divine_adept",
    "academic_adept",
    "combatant",
    "nobility",
    "commoners_local",
    "specialists",
    "clergy",
    "organization",
    "adepts",
    "hostile_humanoids",
    "adventurers",
    "mediocre_commoner",
    "experienced_commoner",
    "unprepared_child",
  ];

  // Verificar se é explicitamente animal
  if (
    animalContexts.some((animal) =>
      mentionContext.toLowerCase().includes(animal.toLowerCase())
    )
  ) {
    return false;
  }

  // Verificar se é explicitamente pessoa
  if (
    personContexts.some((person) =>
      mentionContext.toLowerCase().includes(person.toLowerCase())
    )
  ) {
    return true;
  }

  // Para casos ambíguos, assumir que é pessoa (seguindo o princípio de que
  // a regra diz "sempre que uma pessoa for mencionada")
  return true;
}

/**
 * Mapeamento de especificações de criaturas para contextos
 */
export const HUNT_CREATURE_CONTEXTS: Record<string, CreatureContext> = {
  // Sempre são pessoas/humanoides inteligentes (geram espécie)
  humanoids: CreatureContext.ALWAYS_PERSON,
  hostile_humanoids: CreatureContext.ALWAYS_PERSON,
  kidnappers_humanoids: CreatureContext.ALWAYS_PERSON,

  // Sempre são criaturas/monstros (não geram espécie)
  constructs: CreatureContext.ALWAYS_ANIMAL,
  demons: CreatureContext.ALWAYS_ANIMAL,
  dragonoids: CreatureContext.ALWAYS_ANIMAL,
  fauna: CreatureContext.ALWAYS_ANIMAL,
  monstrosities: CreatureContext.ALWAYS_ANIMAL,
  giants: CreatureContext.ALWAYS_ANIMAL, // gigantes já são uma espécie
  celestials: CreatureContext.ALWAYS_ANIMAL, // celestiais já são uma espécie

  // Pode ser qualquer um, decidir aleatoriamente
  cursed: CreatureContext.CONTEXT_DEPENDENT,
  undead: CreatureContext.CONTEXT_DEPENDENT,
};

/**
 * Pesos para criaturas context-dependent em caçadas
 */
export const HUNT_CONTEXTUAL_WEIGHTS: Record<string, ContextualWeight> = {
  undead: {
    personChance: 60,
    animalChance: 40,
  },
  cursed: {
    personChance: 70,
    animalChance: 30,
  },
};
