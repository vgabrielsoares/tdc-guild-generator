import type { TableEntry } from "@/types/tables";

export interface DiceNotation {
  dice: string;
  modifier: number;
}

// Interface para estrutura da guilda
export interface GuildStructureResult {
  headquarters: {
    size: string;
    characteristics: string[];
  };
  relations: {
    government: string;
    population: string;
  };
  visitors: {
    level: string;
    types: string[];
  };
  resources: {
    level: string;
    specialties: string[];
  };
}

// Tamanho da Sede (1d20)
export const HEADQUARTERS_SIZE_TABLE: TableEntry<string>[] = [
  { min: 1, max: 2, result: 'Minúsculo (3m x 1,5m)' },
  { min: 3, max: 5, result: 'Muito pequeno (4,5m x 3m)' },
  { min: 6, max: 6, result: 'Pequeno e modesto (6m x 6m)' },
  { min: 7, max: 8, result: 'Pequeno e confortável (7,5m x 6m, +1 andar)' },
  { min: 9, max: 9, result: 'Mediano e comum (9m x 9m)' },
  { min: 10, max: 14, result: 'Mediano em dobro (10,5m x 9m, +1 andar)' },
  { min: 15, max: 16, result: 'Grande (12m x 12m)' },
  { min: 17, max: 17, result: 'Luxuosamente grande (12m x 12m, +2 andares)' },
  { min: 18, max: 18, result: 'Enorme (15m x 15m, +1 andar)' },
  { min: 19, max: 19, result: 'Enorme e confortável (15m x 15m, +2 andares)' },
  { min: 20, max: 20, result: 'Colossal (20m x 20m, +1 andar)' },
  { min: 21, max: 25, result: 'Colossal e primorosa (20m x 20m, +2 andares)' }
];

// Características da Sede (2d6 para número de características)
export const HEADQUARTERS_COUNT_TABLE: TableEntry<number>[] = [
  { min: 2, max: 4, result: 1, description: "1 característica especial" },
  { min: 5, max: 9, result: 2, description: "2 características especiais" },
  { min: 10, max: 11, result: 3, description: "3 características especiais" },
  { min: 12, max: 12, result: 4, description: "4 características especiais" },
];

// Características Específicas da Sede (1d20)
export const HEADQUARTERS_CHARACTERISTICS_TABLE: TableEntry<string>[] = [
  { min: 1, max: 2, result: 'Antiga e mal conservada' },
  { min: 3, max: 4, result: 'Suja e desorganizada' },
  { min: 5, max: 8, result: 'Bem organizada e limpa' },
  { min: 9, max: 9, result: 'Recém-construída' },
  { min: 10, max: 10, result: 'Dentro de um calabouço' },
  { min: 11, max: 13, result: 'Junto à sede do governo local' },
  { min: 14, max: 15, result: 'Elegante, funcionários arrogantes' },
  { min: 16, max: 17, result: 'Afastada do assentamento' },
  { min: 18, max: 18, result: 'Também usada como museu' },
  { min: 19, max: 19, result: 'Junto a um acervo de conhecimento' },
  { min: 20, max: 20, result: 'Engenhosamente moderna' },
  { min: 21, max: 25, result: 'Modernidade mágica' }
];

// Relações com o Governo (1d12)
export const GOVERNMENT_RELATIONS_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 1,
    result: "Hostil",
    description: "A guilda é vista como ameaça pelo governo",
  },
  {
    min: 2,
    max: 3,
    result: "Suspeita",
    description: "O governo desconfia das atividades da guilda",
  },
  {
    min: 4,
    max: 6,
    result: "Indiferente",
    description: "O governo não se importa com a guilda",
  },
  {
    min: 7,
    max: 9,
    result: "Tolerante",
    description: "O governo aceita a existência da guilda",
  },
  {
    min: 10,
    max: 11,
    result: "Cooperativa",
    description: "A guilda colabora com o governo ocasionalmente",
  },
  {
    min: 12,
    max: 12,
    result: "Aliada",
    description: "A guilda é parceira oficial do governo",
  },
];

// Relações com a População (1d12)
export const POPULATION_RELATIONS_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 1,
    result: "Temida",
    description: "A população tem medo da guilda",
  },
  {
    min: 2,
    max: 3,
    result: "Desconfiada",
    description: "A população desconfia das intenções da guilda",
  },
  {
    min: 4,
    max: 6,
    result: "Indiferente",
    description: "A população não tem opinião sobre a guilda",
  },
  {
    min: 7,
    max: 9,
    result: "Respeitada",
    description: "A população respeita o trabalho da guilda",
  },
  {
    min: 10,
    max: 11,
    result: "Admirada",
    description: "A população admira e apoia a guilda",
  },
  {
    min: 12,
    max: 12,
    result: "Reverenciada",
    description: "A população vê a guilda como heróis",
  },
];

// Nível de Frequentadores (1d8)
export const VISITORS_LEVEL_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 2,
    result: "Baixo",
    description: "Poucos visitantes, principalmente locais",
  },
  {
    min: 3,
    max: 5,
    result: "Moderado",
    description: "Fluxo regular de aventureiros comuns",
  },
  {
    min: 6,
    max: 7,
    result: "Alto",
    description: "Muitos aventureiros experientes",
  },
  {
    min: 8,
    max: 8,
    result: "Muito Alto",
    description: "Aventureiros lendários frequentam a guilda",
  },
];

// Tipos de Frequentadores (1d12, role múltiplas vezes baseado no nível)
export const VISITOR_TYPES_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 1,
    result: "Guerreiros",
    description: "Especialistas em combate corpo a corpo",
  },
  { min: 2, max: 2, result: "Magos", description: "Usuários de magia arcana" },
  {
    min: 3,
    max: 3,
    result: "Ladinos",
    description: "Especialistas em stealth e habilidades",
  },
  {
    min: 4,
    max: 4,
    result: "Clérigos",
    description: "Usuários de magia divina",
  },
  {
    min: 5,
    max: 5,
    result: "Bárbaros",
    description: "Combatentes selvagens e ferozes",
  },
  {
    min: 6,
    max: 6,
    result: "Bardos",
    description: "Artistas e contadores de histórias",
  },
  {
    min: 7,
    max: 7,
    result: "Rangers",
    description: "Especialistas em natureza e rastreamento",
  },
  {
    min: 8,
    max: 8,
    result: "Paladinos",
    description: "Guerreiros sagrados e justiceiros",
  },
  {
    min: 9,
    max: 9,
    result: "Mercadores",
    description: "Comerciantes e negociantes",
  },
  {
    min: 10,
    max: 10,
    result: "Nobres",
    description: "Aristocratas em busca de aventura",
  },
  {
    min: 11,
    max: 11,
    result: "Estudiosos",
    description: "Pesquisadores e sábios",
  },
  {
    min: 12,
    max: 12,
    result: "Artesãos",
    description: "Criadores de equipamentos especiais",
  },
];

// Nível de Recursos (1d12 + modificadores de tamanho)
export const RESOURCES_LEVEL_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 3,
    result: "Escassos",
    description: "Recursos muito limitados",
  },
  {
    min: 4,
    max: 6,
    result: "Básicos",
    description: "Recursos suficientes para operação básica",
  },
  {
    min: 7,
    max: 9,
    result: "Adequados",
    description: "Recursos suficientes para expansão moderada",
  },
  {
    min: 10,
    max: 12,
    result: "Abundantes",
    description: "Recursos suficientes para grandes projetos",
  },
  {
    min: 13,
    max: 15,
    result: "Vastos",
    description: "Recursos praticamente ilimitados",
  },
  {
    min: 16,
    max: 20,
    result: "Lendários",
    description: "Recursos que outros apenas sonham",
  },
];

// Especialidades de Recursos (1d10, role múltiplas vezes baseado no nível)
export const RESOURCE_SPECIALTIES_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 1,
    result: "Equipamentos Mágicos",
    description: "Acesso a itens mágicos raros",
  },
  {
    min: 2,
    max: 2,
    result: "Informações",
    description: "Rede de espionagem e conhecimento",
  },
  {
    min: 3,
    max: 3,
    result: "Contatos Políticos",
    description: "Influência em altas esferas",
  },
  {
    min: 4,
    max: 4,
    result: "Suprimentos",
    description: "Equipamentos e mantimentos abundantes",
  },
  {
    min: 5,
    max: 5,
    result: "Transporte",
    description: "Meios de viagem rápidos e seguros",
  },
  {
    min: 6,
    max: 6,
    result: "Healing Services",
    description: "Serviços de cura e ressurreição",
  },
  {
    min: 7,
    max: 7,
    result: "Treinamento",
    description: "Mestres em diversas habilidades",
  },
  {
    min: 8,
    max: 8,
    result: "Pesquisa",
    description: "Bibliotecas e laboratórios avançados",
  },
  {
    min: 9,
    max: 9,
    result: "Proteção",
    description: "Guarda-costas e segurança",
  },
  {
    min: 10,
    max: 10,
    result: "Financeiro",
    description: "Grandes quantias de ouro e crédito",
  },
];

// Modificadores de Tamanho para Recursos
export const SIZE_MODIFIERS = {
  Pequena: -2,
  Média: 0,
  Grande: +2,
  Enorme: +4,
} as const;

// Modificadores de Relações para Contratos/Serviços
export const RELATION_MODIFIERS = {
  // Governo
  Hostil: -3,
  Suspeita: -1,
  Indiferente: 0,
  Tolerante: +1,
  Cooperativa: +2,
  Aliada: +3,
  // População
  Temida: -2,
  Desconfiada: -1,
  Respeitada: +1,
  Admirada: +2,
  Reverenciada: +3,
} as const;

// Função para determinar quantas características rolar baseado no tamanho
export function getCharacteristicsCount(size: string): number {
  switch (size) {
    case "Pequena":
      return 1;
    case "Média":
      return 2;
    case "Grande":
      return 3;
    case "Enorme":
      return 4;
    default:
      return 2;
  }
}

// Função para determinar quantos tipos de frequentadores baseado no nível
export function getVisitorTypesCount(level: string): number {
  switch (level) {
    case "Baixo":
      return 2;
    case "Moderado":
      return 3;
    case "Alto":
      return 4;
    case "Muito Alto":
      return 5;
    default:
      return 3;
  }
}

// Função para determinar quantas especialidades baseado no nível de recursos
export function getResourceSpecialtiesCount(level: string): number {
  switch (level) {
    case "Escassos":
      return 1;
    case "Básicos":
      return 2;
    case "Adequados":
      return 3;
    case "Abundantes":
      return 4;
    case "Vastos":
      return 5;
    case "Lendários":
      return 6;
    default:
      return 2;
  }
}

// Funcionários da Guilda
export const EMPLOYEES_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: '1 funcionário despreparado' },
  { min: 2, max: 4, result: '1d4 funcionários despreparados' },
  { min: 5, max: 6, result: '1d4+2 funcionários despreparados' },
  { min: 7, max: 9, result: '1 funcionário experiente' },
  { min: 10, max: 10, result: '1d4+1 membros do clero' },
  { min: 11, max: 12, result: '1d4+1 ex-membros da guilda' },
  { min: 13, max: 14, result: '1 nobre e seus serviçais' },
  { min: 15, max: 15, result: '1 aventureiro pagando dívidas' },
  { min: 16, max: 18, result: '1 experiente explorador' },
  { min: 19, max: 19, result: '1 animal falante' },
  { min: 20, max: 20, result: '1d4 ex-aventureiros' },
  { min: 21, max: 25, result: '1d6+3 funcionários experientes' }
];

// Frequentadores da Guilda - Quantidade
export const VISITORS_FREQUENCY_TABLE: TableEntry<string>[] = [
  { min: 1, max: 5, result: 'Vazia' },
  { min: 6, max: 9, result: 'Quase deserta' },
  { min: 10, max: 12, result: 'Pouco movimentada' },
  { min: 13, max: 16, result: 'Nem muito nem pouco' },
  { min: 17, max: 18, result: 'Muito frequentada' },
  { min: 19, max: 19, result: 'Abarrotada' },
  { min: 20, max: 25, result: 'Lotada' }
];

// Modificadores para recursos
export const RESOURCE_MODIFIERS = {
  byRelation: {
    'Péssima': -3,
    'Ruim': -2,
    'Diplomática': -1,
    'Opinião dividida': -1,
    'Boa': +1,
    'Muito boa': +2,
    'Excelente': +3
  }
};

// Modificadores para frequentadores
export const VISITOR_FREQUENCY_MODIFIERS = {
  byEmployees: {
    'despreparados': -1,
    'experientes': +1
  },
  byResources: {
    'Em débito': -6,
    'Nenhum': -3,
    'Escassos': -2,
    'Limitados': 0,
    'Suficientes': +2,
    'Excedentes': +3,
    'Abundantes': +6
  }
};

// Dados por tipo de assentamento
export const SETTLEMENT_DICE = {
  structure: {
    'Lugarejo': { dice: 'd8', modifier: 0 },
    'Povoado': { dice: 'd8', modifier: 0 },
    'Aldeia': { dice: 'd8', modifier: 0 },
    'Vilarejo': { dice: 'd12', modifier: 0 },
    'Vila grande': { dice: 'd12', modifier: 0 },
    'Cidadela': { dice: 'd20', modifier: 0 },
    'Cidade grande': { dice: 'd20', modifier: 4 },
    'Metrópole': { dice: 'd20', modifier: 8 }
  },
  visitors: {
    'Lugarejo': { dice: 'd8', modifier: 0 },
    'Povoado': { dice: 'd8', modifier: 0 },
    'Aldeia': { dice: 'd8', modifier: 0 },
    'Vilarejo': { dice: 'd10', modifier: 0 },
    'Vila grande': { dice: 'd10', modifier: 0 },
    'Cidadela': { dice: 'd12', modifier: 0 },
    'Cidade grande': { dice: 'd20', modifier: 0 },
    'Metrópole': { dice: 'd20', modifier: 5 }
  }
} as const;

export function getDiceNotationString(settlementType: string, category: 'structure' | 'visitors'): string {
  const diceNotation = SETTLEMENT_DICE[category][settlementType as keyof typeof SETTLEMENT_DICE[typeof category]];
  if (!diceNotation) return '1d20';
  
  const modifierStr = diceNotation.modifier === 0 ? '' : 
                     diceNotation.modifier > 0 ? `+${diceNotation.modifier}` : 
                     `${diceNotation.modifier}`;
  return `1${diceNotation.dice}${modifierStr}`;
}

export function validateSimpleDiceNotation(notation: DiceNotation): boolean {
  // Basic validation for dice string format (e.g., 'd8', 'd20')
  const dicePattern = /^d\d+$/;
  return (
    dicePattern.test(notation.dice) &&
    notation.modifier >= -1000 && 
    notation.modifier <= 1000
  );
}

// Tabela de existência de sede
export const HEADQUARTERS_EXISTENCE_TABLE = {
  human: [
    { min: 1, max: 7, value: 'Não' },
    { min: 8, max: 20, value: 'Sim' },
    { min: 21, max: 25, value: 'Sede matriz' }
  ],
  other: [
    { min: 1, max: 20, value: 'Não' },
    { min: 21, max: 25, value: 'Sim' }
  ]
};

// Legacy exports for backward compatibility
export const GUILD_SIZE_TABLE = HEADQUARTERS_SIZE_TABLE;
export const GUILD_CHARACTERISTICS_TABLE = HEADQUARTERS_CHARACTERISTICS_TABLE;
