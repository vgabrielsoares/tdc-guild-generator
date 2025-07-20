import type { TableEntry } from "@/types/tables";

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
  {
    min: 1,
    max: 8,
    result: "Pequena",
    description: "Sede pequena - modificador -2 para recursos",
  },
  {
    min: 9,
    max: 15,
    result: "Média",
    description: "Sede média - sem modificadores",
  },
  {
    min: 16,
    max: 19,
    result: "Grande",
    description: "Sede grande - modificador +2 para recursos",
  },
  {
    min: 20,
    max: 20,
    result: "Enorme",
    description: "Sede enorme - modificador +4 para recursos",
  },
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
  {
    min: 1,
    max: 1,
    result: "Biblioteca Arcana",
    description: "Acesso a conhecimentos mágicos raros",
  },
  {
    min: 2,
    max: 2,
    result: "Forja Mágica",
    description: "Facilita criação de itens mágicos",
  },
  {
    min: 3,
    max: 3,
    result: "Sala de Treinamento",
    description: "Melhora habilidades de combate",
  },
  {
    min: 4,
    max: 4,
    result: "Laboratório de Alquimia",
    description: "Criação de poções e elixires",
  },
  {
    min: 5,
    max: 5,
    result: "Estábulos Especiais",
    description: "Montarias exóticas disponíveis",
  },
  {
    min: 6,
    max: 6,
    result: "Torre de Observação",
    description: "Vantagem em vigilância e defesa",
  },
  {
    min: 7,
    max: 7,
    result: "Cofres Protegidos",
    description: "Armazenamento ultra-seguro",
  },
  {
    min: 8,
    max: 8,
    result: "Portal de Transporte",
    description: "Viagem rápida para locais conhecidos",
  },
  {
    min: 9,
    max: 9,
    result: "Jardim Medicinal",
    description: "Suprimento de ervas curativas",
  },
  {
    min: 10,
    max: 10,
    result: "Sala de Reuniões Encantada",
    description: "Comunicação mágica à distância",
  },
  {
    min: 11,
    max: 11,
    result: "Arsenal Avançado",
    description: "Equipamentos de qualidade superior",
  },
  {
    min: 12,
    max: 12,
    result: "Quartos de Hóspedes",
    description: "Acomoda clientes importantes",
  },
  {
    min: 13,
    max: 13,
    result: "Cozinha Encantada",
    description: "Produz alimentos especiais",
  },
  {
    min: 14,
    max: 14,
    result: "Santuário Divino",
    description: "Serviços de cura e bênçãos",
  },
  {
    min: 15,
    max: 15,
    result: "Rede de Informantes",
    description: "Acesso a informações privilegiadas",
  },
  {
    min: 16,
    max: 16,
    result: "Sistema de Defesa",
    description: "Proteções mágicas e armadilhas",
  },
  {
    min: 17,
    max: 17,
    result: "Loja de Suprimentos",
    description: "Equipamentos básicos sempre disponíveis",
  },
  {
    min: 18,
    max: 18,
    result: "Centro de Mensagens",
    description: "Comunicação rápida com outras guildas",
  },
  {
    min: 19,
    max: 19,
    result: "Arquivo de Contratos",
    description: "Histórico detalhado de missões",
  },
  {
    min: 20,
    max: 20,
    result: "Característica Única",
    description: "Role novamente ou invente algo especial",
  },
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

// Legacy exports for backward compatibility
export const GUILD_SIZE_TABLE = HEADQUARTERS_SIZE_TABLE;
export const GUILD_CHARACTERISTICS_TABLE = HEADQUARTERS_CHARACTERISTICS_TABLE;
