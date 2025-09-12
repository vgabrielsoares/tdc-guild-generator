// Enums para classificação gramatical
export enum Gender {
  MASCULINE = "masculine",
  FEMININE = "feminine",
  NEUTRAL = "neutral",
}

export enum SuffixType {
  ADJECTIVE = "adjective",
  NOUN = "noun",
}

// Interfaces para classificação gramatical
export interface ClassifiedPrefix {
  readonly name: string;
  readonly gender: Gender;
}

export interface ClassifiedSuffix {
  readonly name: string;
  readonly type: SuffixType;
  readonly masculineForm?: string; // Para adjetivos: forma masculina
  readonly feminineForm?: string; // Para adjetivos: forma feminina
  readonly neutralForm?: string; // Para adjetivos: forma neutra
}

// Prefixos/Substantivos classificados por gênero (Tabela 1 – 1d100)
export const GUILD_NAME_PREFIXES_CLASSIFIED: readonly ClassifiedPrefix[] = [
  // d100: 1-100 - Seguindo ordem EXATA da tabela original
  { name: "Guilda", gender: Gender.FEMININE }, // 1
  { name: "Irmandade", gender: Gender.FEMININE }, // 2
  { name: "Sociedade", gender: Gender.FEMININE }, // 3
  { name: "Companhia", gender: Gender.FEMININE }, // 4
  { name: "Círculo", gender: Gender.MASCULINE }, // 5
  { name: "Ordem", gender: Gender.FEMININE }, // 6
  { name: "Conclave", gender: Gender.MASCULINE }, // 7
  { name: "Aliança", gender: Gender.FEMININE }, // 8
  { name: "Legião", gender: Gender.FEMININE }, // 9
  { name: "Vigília", gender: Gender.FEMININE }, // 10
  { name: "Torre", gender: Gender.FEMININE }, // 11
  { name: "Refúgio", gender: Gender.MASCULINE }, // 12
  { name: "Bastião", gender: Gender.MASCULINE }, // 13
  { name: "Sentinela", gender: Gender.MASCULINE }, // 14
  { name: "Trono", gender: Gender.MASCULINE }, // 15
  { name: "Arsenal", gender: Gender.MASCULINE }, // 16
  { name: "Lança", gender: Gender.FEMININE }, // 17
  { name: "Rosa", gender: Gender.FEMININE }, // 18
  { name: "Prisma", gender: Gender.MASCULINE }, // 19
  { name: "Portal", gender: Gender.MASCULINE }, // 20
  { name: "Presa", gender: Gender.FEMININE }, // 21
  { name: "Castelo", gender: Gender.MASCULINE }, // 22
  { name: "Porta", gender: Gender.FEMININE }, // 23
  { name: "Chama", gender: Gender.FEMININE }, // 24
  { name: "Lâmina", gender: Gender.FEMININE }, // 25
  { name: "Eco", gender: Gender.MASCULINE }, // 26
  { name: "Véu", gender: Gender.MASCULINE }, // 27
  { name: "Miragem", gender: Gender.FEMININE }, // 28
  { name: "Horizonte", gender: Gender.MASCULINE }, // 29
  { name: "Forja", gender: Gender.FEMININE }, // 30
  { name: "Escudo", gender: Gender.MASCULINE }, // 31
  { name: "Falcão", gender: Gender.MASCULINE }, // 32
  { name: "Oásis", gender: Gender.MASCULINE }, // 33
  { name: "Vale", gender: Gender.MASCULINE }, // 34
  { name: "Labirinto", gender: Gender.MASCULINE }, // 35
  { name: "Domo", gender: Gender.MASCULINE }, // 36
  { name: "Códice", gender: Gender.MASCULINE }, // 37
  { name: "Bastilha", gender: Gender.FEMININE }, // 38
  { name: "Lótus", gender: Gender.MASCULINE }, // 39
  { name: "Lince", gender: Gender.MASCULINE }, // 40
  { name: "Luar", gender: Gender.MASCULINE }, // 41
  { name: "Grifo", gender: Gender.MASCULINE }, // 42
  { name: "Relíquia", gender: Gender.FEMININE }, // 43
  { name: "Cristal", gender: Gender.MASCULINE }, // 44
  { name: "Caverna", gender: Gender.FEMININE }, // 45
  { name: "Cume", gender: Gender.MASCULINE }, // 46
  { name: "Cúpula", gender: Gender.FEMININE }, // 47
  { name: "Bastão", gender: Gender.MASCULINE }, // 48
  { name: "Lenda", gender: Gender.FEMININE }, // 49
  { name: "Lobo", gender: Gender.MASCULINE }, // 50
  { name: "Machado", gender: Gender.MASCULINE }, // 51
  { name: "Muralha", gender: Gender.FEMININE }, // 52
  { name: "Ninho", gender: Gender.MASCULINE }, // 53
  { name: "Orbe", gender: Gender.MASCULINE }, // 54
  { name: "Pedra", gender: Gender.FEMININE }, // 55
  { name: "Pilar", gender: Gender.MASCULINE }, // 56
  { name: "Espiral", gender: Gender.FEMININE }, // 57
  { name: "Profundezas", gender: Gender.FEMININE }, // 58
  { name: "Relâmpago", gender: Gender.MASCULINE }, // 59
  { name: "Rocha", gender: Gender.FEMININE }, // 60
  { name: "Coroa", gender: Gender.FEMININE }, // 61
  { name: "Rubi", gender: Gender.MASCULINE }, // 62
  { name: "Ruína", gender: Gender.FEMININE }, // 63
  { name: "Sábio", gender: Gender.MASCULINE }, // 64
  { name: "Salão", gender: Gender.MASCULINE }, // 65
  { name: "Santuário", gender: Gender.MASCULINE }, // 66
  { name: "Selo", gender: Gender.MASCULINE }, // 67
  { name: "Sepulcro", gender: Gender.MASCULINE }, // 68
  { name: "Silêncio", gender: Gender.MASCULINE }, // 69
  { name: "Sol", gender: Gender.MASCULINE }, // 70
  { name: "Sombras", gender: Gender.FEMININE }, // 71
  { name: "Tempestade", gender: Gender.FEMININE }, // 72
  { name: "Tesouro", gender: Gender.MASCULINE }, // 73
  { name: "Torreão", gender: Gender.MASCULINE }, // 74
  { name: "Ígnea", gender: Gender.FEMININE }, // 75
  { name: "Auréola", gender: Gender.FEMININE }, // 76
  { name: "Vento", gender: Gender.MASCULINE }, // 77
  { name: "Vigia", gender: Gender.MASCULINE }, // 78
  { name: "Vila", gender: Gender.FEMININE }, // 79
  { name: "Vínculo", gender: Gender.MASCULINE }, // 80
  { name: "Vórtice", gender: Gender.MASCULINE }, // 81
  { name: "Zênite", gender: Gender.MASCULINE }, // 82
  { name: "Abismo", gender: Gender.MASCULINE }, // 83
  { name: "Alvorada", gender: Gender.FEMININE }, // 84
  { name: "Âncora", gender: Gender.FEMININE }, // 85
  { name: "Anel", gender: Gender.MASCULINE }, // 86
  { name: "Antro", gender: Gender.MASCULINE }, // 87
  { name: "Arco", gender: Gender.MASCULINE }, // 88
  { name: "Areia", gender: Gender.FEMININE }, // 89
  { name: "Gália", gender: Gender.FEMININE }, // 90
  { name: "Asas", gender: Gender.FEMININE }, // 91
  { name: "Ato", gender: Gender.MASCULINE }, // 92
  { name: "Aurora", gender: Gender.FEMININE }, // 93
  { name: "Égide", gender: Gender.FEMININE }, // 94
  { name: "Clareira", gender: Gender.FEMININE }, // 95
  { name: "Cicatriz", gender: Gender.FEMININE }, // 96
  { name: "Penumbra", gender: Gender.FEMININE }, // 97
  { name: "Fragmento", gender: Gender.MASCULINE }, // 98
  { name: "Mirante", gender: Gender.MASCULINE }, // 99
  { name: "Guardião", gender: Gender.MASCULINE }, // 100
] as const;

// Sufixos/Adjetivos e Substantivos classificados (Tabela 2 – 1d100)
export const GUILD_NAME_SUFFIXES_CLASSIFIED: readonly ClassifiedSuffix[] = [
  // d100: 1-100 - Seguindo ordem EXATA da tabela original
  { name: "dos Aventureiros", type: SuffixType.NOUN }, // 1
  { name: "dos Artesãos", type: SuffixType.NOUN }, // 2
  { name: "da Lâmina", type: SuffixType.NOUN }, // 3
  { name: "do Norte", type: SuffixType.NOUN }, // 4
  { name: "do Horizonte", type: SuffixType.NOUN }, // 5
  { name: "do Carvalho", type: SuffixType.NOUN }, // 6
  { name: "do Dragão", type: SuffixType.NOUN }, // 7
  { name: "do Véu", type: SuffixType.NOUN }, // 8
  { name: "do Martelo", type: SuffixType.NOUN }, // 9
  { name: "do Escudo", type: SuffixType.NOUN }, // 10
  { name: "do Falcão", type: SuffixType.NOUN }, // 11
  { name: "do Prisma", type: SuffixType.NOUN }, // 12
  { name: "do Bastião", type: SuffixType.NOUN }, // 13
  { name: "do Oásis", type: SuffixType.NOUN }, // 14
  { name: "do Crepúsculo", type: SuffixType.NOUN }, // 15
  { name: "do Amanhecer", type: SuffixType.NOUN }, // 16
  { name: "do Silêncio", type: SuffixType.NOUN }, // 17
  { name: "do Sul", type: SuffixType.NOUN }, // 18
  { name: "do Domo", type: SuffixType.NOUN }, // 19
  { name: "do Refúgio", type: SuffixType.NOUN }, // 20
  { name: "Verde", type: SuffixType.ADJECTIVE, neutralForm: "Verde" }, // 21
  {
    name: "Vermelho",
    type: SuffixType.ADJECTIVE,
    masculineForm: "Vermelho",
    feminineForm: "Vermelha",
  }, // 22
  {
    name: "Dourado",
    type: SuffixType.ADJECTIVE,
    masculineForm: "Dourado",
    feminineForm: "Dourada",
  }, // 23
  {
    name: "Sombrio",
    type: SuffixType.ADJECTIVE,
    masculineForm: "Sombrio",
    feminineForm: "Sombria",
  }, // 24
  {
    name: "Antigo",
    type: SuffixType.ADJECTIVE,
    masculineForm: "Antigo",
    feminineForm: "Antiga",
  }, // 25
  { name: "Azul", type: SuffixType.ADJECTIVE, neutralForm: "Azul" }, // 26
  {
    name: "Prateado",
    type: SuffixType.ADJECTIVE,
    masculineForm: "Prateado",
    feminineForm: "Prateada",
  }, // 27
  {
    name: "Sábio",
    type: SuffixType.ADJECTIVE,
    masculineForm: "Sábio",
    feminineForm: "Sábia",
  }, // 28
  {
    name: "Esquecido",
    type: SuffixType.ADJECTIVE,
    masculineForm: "Esquecido",
    feminineForm: "Esquecida",
  }, // 29
  {
    name: "Moderno",
    type: SuffixType.ADJECTIVE,
    masculineForm: "Moderno",
    feminineForm: "Moderna",
  }, // 30
  {
    name: "Oculto",
    type: SuffixType.ADJECTIVE,
    masculineForm: "Oculto",
    feminineForm: "Oculta",
  }, // 31
  {
    name: "Sagrado",
    type: SuffixType.ADJECTIVE,
    masculineForm: "Sagrado",
    feminineForm: "Sagrada",
  }, // 32
  {
    name: "Rápido",
    type: SuffixType.ADJECTIVE,
    masculineForm: "Rápido",
    feminineForm: "Rápida",
  }, // 33
  { name: "Feroz", type: SuffixType.ADJECTIVE, neutralForm: "Feroz" }, // 34
  {
    name: "Silencioso",
    type: SuffixType.ADJECTIVE,
    masculineForm: "Silencioso",
    feminineForm: "Silenciosa",
  }, // 35
  {
    name: "Eterno",
    type: SuffixType.ADJECTIVE,
    masculineForm: "Eterno",
    feminineForm: "Eterna",
  }, // 36
  {
    name: "Bravio",
    type: SuffixType.ADJECTIVE,
    masculineForm: "Bravio",
    feminineForm: "Bravia",
  }, // 37
  { name: "Celeste", type: SuffixType.ADJECTIVE, neutralForm: "Celeste" }, // 38
  {
    name: "Profundo",
    type: SuffixType.ADJECTIVE,
    masculineForm: "Profundo",
    feminineForm: "Profunda",
  }, // 39
  { name: "Radiante", type: SuffixType.ADJECTIVE, neutralForm: "Radiante" }, // 40
  { name: "dos Mercenários", type: SuffixType.NOUN }, // 41
  { name: "da Colina", type: SuffixType.NOUN }, // 42
  { name: "do Rio", type: SuffixType.NOUN }, // 43
  { name: "da Aurora", type: SuffixType.NOUN }, // 44
  { name: "do Mercado", type: SuffixType.NOUN }, // 45
  { name: "do Porto", type: SuffixType.NOUN }, // 46
  { name: "do Bosque", type: SuffixType.NOUN }, // 47
  { name: "da Ponte", type: SuffixType.NOUN }, // 48
  { name: "do Vale", type: SuffixType.NOUN }, // 49
  { name: "do Cálamo", type: SuffixType.NOUN }, // 50
  { name: "do Penhasco", type: SuffixType.NOUN }, // 51
  { name: "do Labirinto", type: SuffixType.NOUN }, // 52
  { name: "do Farol", type: SuffixType.NOUN }, // 53
  { name: "do Desfiladeiro", type: SuffixType.NOUN }, // 54
  { name: "da Ilha", type: SuffixType.NOUN }, // 55
  { name: "do Castelo", type: SuffixType.NOUN }, // 56
  { name: "do Jardim", type: SuffixType.NOUN }, // 57
  { name: "do Santuário", type: SuffixType.NOUN }, // 58
  { name: "do Pântano", type: SuffixType.NOUN }, // 59
  { name: "da Montanha", type: SuffixType.NOUN }, // 60
  { name: "dos Sábios", type: SuffixType.NOUN }, // 61
  { name: "do Destino", type: SuffixType.NOUN }, // 62
  { name: "do Éter", type: SuffixType.NOUN }, // 63
  { name: "das Lendas", type: SuffixType.NOUN }, // 64
  { name: "do Vácuo", type: SuffixType.NOUN }, // 65
  { name: "das Estrelas", type: SuffixType.NOUN }, // 66
  { name: "do Pesadelo", type: SuffixType.NOUN }, // 67
  { name: "do Inverno", type: SuffixType.NOUN }, // 68
  { name: "do Tempo", type: SuffixType.NOUN }, // 69
  { name: "do Abismo", type: SuffixType.NOUN }, // 70
  { name: "da Fênix", type: SuffixType.NOUN }, // 71
  { name: "do Rubi", type: SuffixType.NOUN }, // 72
  { name: "do Vendaval", type: SuffixType.NOUN }, // 73
  { name: "do Sol", type: SuffixType.NOUN }, // 74
  { name: "da Chama", type: SuffixType.NOUN }, // 75
  { name: "do Granito", type: SuffixType.NOUN }, // 76
  { name: "do Manto", type: SuffixType.NOUN }, // 77
  { name: "da Alvorada", type: SuffixType.NOUN }, // 78
  { name: "do Ciclo", type: SuffixType.NOUN }, // 79
  { name: "do Éden", type: SuffixType.NOUN }, // 80
  { name: "do Relâmpago", type: SuffixType.NOUN }, // 81
  { name: "do Espinho", type: SuffixType.NOUN }, // 82
  { name: "do Eco", type: SuffixType.NOUN }, // 83
  { name: "do Lince", type: SuffixType.NOUN }, // 84
  { name: "do Luar", type: SuffixType.NOUN }, // 85
  { name: "do Grifo", type: SuffixType.NOUN }, // 86
  { name: "da Relíquia", type: SuffixType.NOUN }, // 87
  { name: "do Cristal", type: SuffixType.NOUN }, // 88
  { name: "da Caverna", type: SuffixType.NOUN }, // 89
  { name: "do Cume", type: SuffixType.NOUN }, // 90
  { name: "do Códice", type: SuffixType.NOUN }, // 91
  { name: "da Cúpula", type: SuffixType.NOUN }, // 92
  { name: "do Bastão", type: SuffixType.NOUN }, // 93
  { name: "da Lenda", type: SuffixType.NOUN }, // 94
  { name: "da Lança", type: SuffixType.NOUN }, // 95
  { name: "do Lobo", type: SuffixType.NOUN }, // 96
  { name: "do Machado", type: SuffixType.NOUN }, // 97
  { name: "da Muralha", type: SuffixType.NOUN }, // 98
  { name: "do Ninho", type: SuffixType.NOUN }, // 99
  { name: "do Orbe", type: SuffixType.NOUN }, // 100
] as const;

// Para compatibilidade com código existente
export const GUILD_NAME_PREFIXES = [
  ...GUILD_NAME_PREFIXES_CLASSIFIED.map((p) => p.name),
] as const;

export const GUILD_NAME_SUFFIXES = [
  ...GUILD_NAME_SUFFIXES_CLASSIFIED.map((s) => s.name),
] as const;

/**
 * Função para gerar nome de guilda com concordância de gênero correta
 * @param diceRoller Função de rolagem de dados (para testes)
 * @returns Nome de guilda com concordância gramatical adequada
 */
export function generateRandomGuildName(
  diceRoller: (sides: number) => number = (sides) =>
    Math.floor(Math.random() * sides) + 1
): string {
  // Rolar para escolher prefixo (substantivo)
  const prefixIndex = diceRoller(GUILD_NAME_PREFIXES_CLASSIFIED.length) - 1;
  const selectedPrefix = GUILD_NAME_PREFIXES_CLASSIFIED[prefixIndex];

  // Rolar para escolher sufixo
  const suffixIndex = diceRoller(GUILD_NAME_SUFFIXES_CLASSIFIED.length) - 1;
  const selectedSuffix = GUILD_NAME_SUFFIXES_CLASSIFIED[suffixIndex];

  // Aplicar concordância de gênero se o sufixo for adjetivo
  let finalSuffix: string;

  if (selectedSuffix.type === SuffixType.ADJECTIVE) {
    // Para adjetivos invariáveis (que têm neutralForm)
    if (selectedSuffix.neutralForm) {
      finalSuffix = selectedSuffix.neutralForm;
    }
    // Para adjetivos que flexionam (masculineForm/feminineForm)
    else if (
      selectedPrefix.gender === Gender.FEMININE &&
      selectedSuffix.feminineForm
    ) {
      finalSuffix = selectedSuffix.feminineForm;
    } else if (
      selectedPrefix.gender === Gender.MASCULINE &&
      selectedSuffix.masculineForm
    ) {
      finalSuffix = selectedSuffix.masculineForm;
    } else {
      // Fallback: usar forma masculina ou nome original
      finalSuffix = selectedSuffix.masculineForm || selectedSuffix.name;
    }
  } else {
    // Substantivos não flexionam
    finalSuffix = selectedSuffix.name;
  }

  return `${selectedPrefix.name} ${finalSuffix}`;
}

// Função auxiliar para obter o gênero de um prefixo
export function getPrefixGender(prefixName: string): Gender | null {
  const prefix = GUILD_NAME_PREFIXES_CLASSIFIED.find(
    (p) => p.name === prefixName
  );
  return prefix ? prefix.gender : null;
}

// Função auxiliar para aplicar concordância manualmente
export function applyConcordance(
  prefixName: string,
  suffixName: string
): string {
  const prefix = GUILD_NAME_PREFIXES_CLASSIFIED.find(
    (p) => p.name === prefixName
  );
  const suffix = GUILD_NAME_SUFFIXES_CLASSIFIED.find(
    (s) => s.name === suffixName
  );

  if (!prefix || !suffix) {
    return `${prefixName} ${suffixName}`;
  }

  if (suffix.type === SuffixType.ADJECTIVE) {
    // Para adjetivos invariáveis (que têm neutralForm)
    if (suffix.neutralForm) {
      return `${prefixName} ${suffix.neutralForm}`;
    }
    // Para adjetivos que flexionam
    else if (prefix.gender === Gender.FEMININE && suffix.feminineForm) {
      return `${prefixName} ${suffix.feminineForm}`;
    } else if (prefix.gender === Gender.MASCULINE && suffix.masculineForm) {
      return `${prefixName} ${suffix.masculineForm}`;
    }
  }

  return `${prefixName} ${suffixName}`;
}

export default {
  GUILD_NAME_PREFIXES,
  GUILD_NAME_SUFFIXES,
  GUILD_NAME_PREFIXES_CLASSIFIED,
  GUILD_NAME_SUFFIXES_CLASSIFIED,
  generateRandomGuildName,
  getPrefixGender,
  applyConcordance,
  Gender,
  SuffixType,
};
