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

// Relação com o Governo Local (1d20)
export const GOVERNMENT_RELATIONS_TABLE: TableEntry<string>[] = [
  { min: 1, max: 2, result: "Péssima", description: "Relação péssima com o governo" },
  { min: 3, max: 4, result: "Ruim", description: "Relação ruim com o governo" },
  { min: 5, max: 8, result: "Ruim, mas tentam manter a cordialidade", description: "Relação ruim mas cordial" },
  { min: 9, max: 14, result: "Diplomática", description: "Relação diplomática" },
  { min: 15, max: 15, result: "Boa, mas o governo tenta miná-los secretamente", description: "Boa mas com tensão" },
  { min: 16, max: 17, result: "Boa", description: "Boa relação" },
  { min: 18, max: 20, result: "Muito boa, cooperam frequentemente", description: "Muito boa relação" },
  { min: 21, max: 50, result: "Excelente, governo e guilda são quase como um", description: "Excelente relação" },
];

// Reputação com a População Local (1d20)
export const POPULATION_RELATIONS_TABLE: TableEntry<string>[] = [
  { min: 1, max: 2, result: "Péssima, puro ódio", description: "Reputação péssima" },
  { min: 3, max: 8, result: "Ruim, vistos como mercenários", description: "Reputação ruim" },
  { min: 9, max: 12, result: "Ruim, só causam problemas", description: "Vistos negativamente" },
  { min: 13, max: 14, result: "Opinião dividida", description: "Opinião dividida" },
  { min: 15, max: 16, result: "Boa, ajudam com problemas", description: "Boa reputação" },
  { min: 17, max: 18, result: "Boa, nos mantêm seguros", description: "Vistos como protetores" },
  { min: 19, max: 20, result: "Muito boa, sem eles estaríamos perdidos", description: "Muito boa reputação" },
  { min: 21, max: 50, result: "Excelente, a guilda faz o assentamento funcionar", description: "Excelente reputação" },
];

// Nível de Frequentadores (1d8)
export const VISITORS_LEVEL_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 5,
    result: "Vazia",
    description: "Nenhum visitante",
  },
  {
    min: 6,
    max: 9,
    result: "Quase deserta",
    description: "Muito poucos visitantes",
  },
  {
    min: 10,
    max: 12,
    result: "Pouco movimentada",
    description: "Poucos visitantes",
  },
  {
    min: 13,
    max: 16,
    result: "Nem muito nem pouco",
    description: "Quantidade normal de visitantes",
  },
  {
    min: 17,
    max: 18,
    result: "Muito frequentada",
    description: "Muitos visitantes",
  },
  {
    min: 19,
    max: 19,
    result: "Abarrotada",
    description: "Quantidade excessiva de visitantes",
  },
  {
    min: 20,
    max: 25,
    result: "Lotada",
    description: "Superlotação",
  },
];

// Tipos de Frequentadores (1d12, role múltiplas vezes baseado no nível)
// TODO: Aumentar robustez dos tipos de frequentadores
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
    result: "Serviços de Cura",
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

export const RESOURCES_LEVEL_TABLE: TableEntry<string>[] = [
  // Extensão para valores negativos devido a modificadores
  { min: -20, max: 0, result: "Em débito", description: "A guilda deve dinheiro" },
  { min: 1, max: 2, result: "Em débito", description: "A guilda deve dinheiro" },
  { min: 3, max: 5, result: "Nenhum", description: "Sem recursos" },
  { min: 6, max: 8, result: "Escassos", description: "Recursos muito limitados" },
  { min: 9, max: 9, result: "Escassos e obtidos com muito esforço e honestidade", description: "Recursos honestos mas difíceis" },
  { min: 10, max: 12, result: "Limitados", description: "Recursos suficientes para sobreviver" },
  { min: 13, max: 15, result: "Suficientes", description: "Recursos adequados" },
  { min: 16, max: 16, result: "Excedentes", description: "Recursos em abundância" },
  { min: 17, max: 17, result: "Excedentes mas alimenta fins malignos", description: "Recursos questionáveis" },
  { min: 18, max: 19, result: "Abundantes porém quase todo vindo do governo de um assentamento próximo", description: "Recursos governamentais" },
  { min: 20, max: 20, result: "Abundantes", description: "Recursos muito abundantes" },
  // Extensão para valores altos devido a modificadores (21+)
  { min: 21, max: 50, result: "Abundantes vindos de muitos anos de serviço", description: "Recursos de longa data" },
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
    case "Em débito":
      return 0;
    case "Nenhum":
      return 0;
    case "Escassos":
    case "Escassos e obtidos com muito esforço e honestidade":
      return 1;
    case "Limitados":
      return 2;
    case "Suficientes":
      return 3;
    case "Excedentes":
    case "Excedentes mas alimenta fins malignos":
      return 4;
    case "Abundantes":
    case "Abundantes porém quase todo vindo do governo de um assentamento próximo":
    case "Abundantes vindos de muitos anos de serviço":
      return 5;
    default:
      return 2;
  }
}

// Funcionários da Guilda (1d20)
export const EMPLOYEES_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: '1 funcionário despreparado', description: 'Funcionário incompetente' },
  { min: 2, max: 4, result: '1d4 funcionários despreparados para o trabalho', description: 'Funcionários não qualificados' },
  { min: 5, max: 6, result: '1d4+2 funcionários despreparados para o trabalho', description: 'Mais funcionários não qualificados' },
  { min: 7, max: 9, result: '1 funcionário experiente', description: 'Funcionário competente' },
  { min: 10, max: 10, result: '1d4+1 membros do clero', description: 'Clero capacitado' },
  { min: 11, max: 12, result: '1d4+1 ex-membros da guilda', description: 'Ex-membros experientes' },
  { min: 13, max: 14, result: '1 nobre e seus serviçais', description: 'Nobre com equipe' },
  { min: 15, max: 15, result: '1 aventureiro pagando dívidas', description: 'Aventureiro devedor' },
  { min: 16, max: 18, result: '1 experiente explorador', description: 'Explorador expert' },
  { min: 19, max: 19, result: '1 animal falante', description: 'Animal especialista' },
  { min: 20, max: 20, result: '1d4 ex-aventureiros', description: 'Ex-aventureiros especialistas' },
  { min: 21, max: 25, result: '1d6+3 funcionários experientes', description: 'Equipe experiente' }
];

export const VISITORS_FREQUENCY_TABLE: TableEntry<string>[] = [
  // Extensão para valores negativos devido a modificadores
  { min: -20, max: 0, result: "Vazia", description: "Nenhum visitante" },
  { min: 1, max: 5, result: "Vazia", description: "Nenhum visitante" },
  { min: 6, max: 9, result: "Quase deserta", description: "Muito poucos visitantes" },
  { min: 10, max: 12, result: "Pouco movimentada", description: "Poucos visitantes" },
  { min: 13, max: 16, result: "Nem muito nem pouco", description: "Quantidade normal de visitantes" },
  { min: 17, max: 18, result: "Muito frequentada", description: "Muitos visitantes" },
  { min: 19, max: 19, result: "Abarrotada", description: "Quantidade excessiva de visitantes" },
  // Extensão para valores altos devido a modificadores (20+)
  { min: 20, max: 50, result: "Lotada", description: "Superlotação" },
];

// Modificadores para recursos baseado nas relações
export const RESOURCE_MODIFIERS = {
  government: {
    'Péssima': -3,
    'Ruim': -2,
    'Ruim, mas tentam manter a cordialidade': -2,
    'Diplomática': -1,
    'Boa, mas o governo tenta miná-los secretamente': +1,
    'Boa': +1,
    'Muito boa, cooperam frequentemente': +2,
    'Excelente, governo e guilda são quase como um': +3
  },
  population: {
    'Péssima, puro ódio': -3,
    'Ruim, vistos como mercenários': -2,
    'Ruim, só causam problemas': -2,
    'Opinião dividida': -1,
    'Boa, ajudam com problemas': +1,
    'Boa, nos mantêm seguros': +1,
    'Muito boa, sem eles estaríamos perdidos': +2,
    'Excelente, a guilda faz o assentamento funcionar': +3
  }
};

// Modificadores para frequentadores baseado em funcionários e recursos
export const VISITOR_FREQUENCY_MODIFIERS = {
  employees: {
    // Funcionários despreparados
    'funcionário despreparado': -1,
    'funcionários despreparados': -1,
    'despreparado': -1,
    'despreparados': -1,
    // Funcionários experientes  
    'funcionário experiente': +1,
    'funcionários experientes': +1,
    'experiente': +1,
    'experientes': +1,
    'explorador': +1,
    'ex-membros': +1,
    'ex-aventureiros': +1,
    'clero': +1,
    'nobre': +1,
    'aventureiro': +1,
    'animal falante': +1
  },
  resources: {
    'Em débito': -6,
    'Nenhum': -3,
    'Escassos': -2,
    'Escassos e obtidos com muito esforço e honestidade': -2,
    'Limitados': 0,
    'Suficientes': +2,
    'Excedentes': +3,
    'Excedentes mas alimenta fins malignos': +3,
    'Abundantes': +6,
    'Abundantes porém quase todo vindo do governo de um assentamento próximo': +6,
    'Abundantes vindos de muitos anos de serviço': +6
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

// Tabela de tipo de sede
export const HEADQUARTERS_TYPE_TABLE: TableEntry<string>[] = [
  { min: 1, max: 20, result: 'Sede Normal' },
  { min: 21, max: 25, result: 'Sede Matriz' }
];

// Legacy exports for backward compatibility
export const GUILD_SIZE_TABLE = HEADQUARTERS_SIZE_TABLE;
export const GUILD_CHARACTERISTICS_TABLE = HEADQUARTERS_CHARACTERISTICS_TABLE;
