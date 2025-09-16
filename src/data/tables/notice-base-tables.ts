import type { TableEntry } from "@/types/tables";

// ===== TABELAS BASE DE MURAL DE AVISOS =====

// Implementa todas as tabelas do sistema de mural de avisos conforme [3] Mural de Avisos - Guilda.md

// ===== MODIFICADORES POR TAMANHO DO ASSENTAMENTO =====

// Modificadores por tamanho do assentamento (aplicados como bônus na rolagem)
export const SETTLEMENT_SIZE_MODIFIERS: Record<string, number> = {
  Lugarejo: 0,
  Povoado: 0,
  Aldeia: 0,
  Vilarejo: 2,
  "Vila grande": 2,
  Cidadela: 4,
  "Cidade grande": 8,
  Metrópole: 12,
};

// ===== DISPONIBILIDADE INICIAL DE AVISOS =====

// Interface para disponibilidade inicial
interface InitialAvailabilityResult {
  available: boolean;
  description: string;
  modifier?: string; // Para casos como "-4d20", "-2d20"
}

// Tabela 1d20: Há algum aviso inicialmente?
export const INITIAL_AVAILABILITY_TABLE: TableEntry<InitialAvailabilityResult>[] =
  [
    {
      min: 1,
      max: 10,
      result: {
        available: false,
        description: "Não, nenhum",
      },
    },
    {
      min: 11,
      max: 13,
      result: {
        available: true,
        description: "Talvez",
        modifier: "-4d20",
      },
    },
    {
      min: 14,
      max: 16,
      result: {
        available: true,
        description: "Mais ou menos",
        modifier: "-2d20",
      },
    },
    {
      min: 17,
      max: 999, // 17-20+
      result: {
        available: true,
        description: "Sim",
      },
    },
  ];

// ===== DADOS POR TAMANHO =====

// Dados por tamanho do assentamento
export const SETTLEMENT_SIZE_DICE: Record<string, string> = {
  Lugarejo: "1d20",
  Povoado: "2d20",
  Aldeia: "2d20",
  Vilarejo: "3d20",
  "Vila grande": "4d20",
  Cidadela: "5d20",
  "Cidade grande": "6d20",
  Metrópole: "8d20",
};

// Modificadores por tamanho da sede da guilda
export const GUILD_HQ_SIZE_MODIFIERS: Record<string, string> = {
  Minúsculo: "-1d20",
  "Muito pequeno": "-1d20",
  "Pequeno e modesto": "+1d20-15",
  "Pequeno e confortável": "+1d20-15",
  "Mediano e comum": "+2d20-15",
  "Mediano em dobro": "+2d20-15",
  Grande: "+1d20-10",
  "Luxuosamente grande": "+1d20-10",
  Enorme: "+2d20-10",
  "Enorme e confortável": "+2d20-10",
  Colossal: "+1d20-5",
  "Colossal e primorosa": "+2d20-5",
};

// Modificadores por condição dos funcionários
export const STAFF_CONDITION_MODIFIERS: Record<string, string> = {
  despreparados: "-1d20",
  experientes: "+1d20",
};

// ===== TABELA DE TIPOS DE AVISOS (1d20) =====

// Interface para tipos de avisos conforme tabela 1d20 "O que é?"
interface NoticeTypeResult {
  type: string;
  description: string;
  hasSubtables?: boolean;
}

// Tabela 1d20: O que é?
export const NOTICE_TYPE_TABLE: TableEntry<NoticeTypeResult>[] = [
  {
    min: 1,
    max: 1,
    result: {
      type: "Nada",
      description: "Não há avisos relevantes",
      hasSubtables: false,
    },
  },
  {
    min: 2,
    max: 6,
    result: {
      type: "Aviso dos habitantes",
      description: "Mensagens deixadas pelo povo",
      hasSubtables: true,
    },
  },
  {
    min: 7,
    max: 8,
    result: {
      type: "1d4 serviços",
      description: "Serviços oferecidos por criaturas sem pagamento padrão",
      hasSubtables: false,
    },
  },
  {
    min: 9,
    max: 10,
    result: {
      type: "Proposta comercial",
      description: "Anúncios de compra, venda ou troca",
      hasSubtables: true,
    },
  },
  {
    min: 11,
    max: 13,
    result: {
      type: "Divulgação",
      description: "Chamados públicos para eventos",
      hasSubtables: true,
    },
  },
  {
    min: 14,
    max: 14,
    result: {
      type: "Proposta de caçada",
      description: "Solicitações contra feras, monstros e malfeitores",
      hasSubtables: true,
    },
  },
  {
    min: 15,
    max: 16,
    result: {
      type: "Cartaz de procurado",
      description: "Retratos de criminosos e desaparecidos",
      hasSubtables: true,
    },
  },
  {
    min: 17,
    max: 18,
    result: {
      type: "1d4 contratos",
      description: "Contratos de criaturas sem pagamento padrão",
      hasSubtables: false,
    },
  },
  {
    min: 19,
    max: 19,
    result: {
      type: "Execução",
      description: "Notificações de penas capitais de condenados",
      hasSubtables: true,
    },
  },
  {
    min: 20,
    max: 20,
    result: {
      type: "Pronunciamento",
      description: "Comunicados oficiais de autoridades",
      hasSubtables: true,
    },
  },
];

// ===== TABELA DE PAGAMENTO ALTERNATIVO (1d20) =====

// Tabela de pagamento alternativo para contratos e serviços do mural
export const ALTERNATIVE_PAYMENT_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 6,
    result: "Não há pagamento",
  },
  {
    min: 7,
    max: 7,
    result: "Ferro ou peças de cobre",
  },
  {
    min: 8,
    max: 8,
    result: "Cobre ou prata",
  },
  {
    min: 9,
    max: 11,
    result: "Equivalente em animais",
  },
  {
    min: 12,
    max: 12,
    result: "Equivalente em terras",
  },
  {
    min: 13,
    max: 14,
    result: "Equivalente em colheita",
  },
  {
    min: 15,
    max: 16,
    result: "Favores",
  },
  {
    min: 17,
    max: 17,
    result: "Mapa ou localização de tesouro",
  },
  {
    min: 18,
    max: 19,
    result: "Equivalente em especiarias",
  },
  {
    min: 20,
    max: 20,
    result: "Objetos valiosos",
  },
];

// ===== TABELAS ESPECÍFICAS POR TIPO DE AVISO =====

// ===== PROPOSTA COMERCIAL =====

// Tipo de Proposta (1d20)
export const COMMERCIAL_PROPOSAL_TYPE_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 5,
    result: "Compra",
  },
  {
    min: 6,
    max: 10,
    result: "Venda",
  },
  {
    min: 11,
    max: 11,
    result: "Leiloa",
  },
  {
    min: 12,
    max: 14,
    result: "Troca por serviços",
  },
  {
    min: 15,
    max: 15,
    result: "Troca por favores",
  },
  {
    min: 16,
    max: 16,
    result: "Troca por informações",
  },
  {
    min: 17,
    max: 17,
    result: "Troca por comida",
  },
  {
    min: 18,
    max: 18,
    result: "Troca por comodidade",
  },
  {
    min: 19,
    max: 19,
    result: "Troca por arte ou pedras preciosas",
  },
  {
    min: 20,
    max: 20,
    result: "Troca por item mágico",
  },
];

// O que? (1d20)
export const COMMERCIAL_PROPOSAL_WHAT_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 4,
    result: "Partes de animais",
  },
  {
    min: 5,
    max: 8,
    result: "Serviços",
  },
  {
    min: 9,
    max: 11,
    result: "Animais rurais",
  },
  {
    min: 12,
    max: 12,
    result: "Poções mágicas",
  },
  {
    min: 13,
    max: 13,
    result: "Objetos de arte",
  },
  {
    min: 14,
    max: 15,
    result: "Especiarias",
  },
  {
    min: 16,
    max: 16,
    result: "Armas",
  },
  {
    min: 17,
    max: 17,
    result: "Proteção",
  },
  {
    min: 18,
    max: 18,
    result: "Bênçãos e orações",
  },
  {
    min: 19,
    max: 19,
    result: "Engenhoca",
  },
  {
    min: 20,
    max: 20,
    result: "Item mágico",
  },
];

// Quem? (1d20)
export const COMMERCIAL_PROPOSAL_WHO_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 8,
    result: "Plebeu medíocre",
  },
  {
    min: 9,
    max: 10,
    result: "Especialista",
  },
  {
    min: 11,
    max: 12,
    result: "Plebeu experiente",
  },
  {
    min: 13,
    max: 13,
    result: "Aristocrata",
  },
  {
    min: 14,
    max: 14,
    result: "Adepto arcano",
  },
  {
    min: 15,
    max: 15,
    result: "Adepto divino",
  },
  {
    min: 16,
    max: 16,
    result: "Adepto acadêmico",
  },
  {
    min: 17,
    max: 17,
    result: "Aventureiro",
  },
  {
    min: 18,
    max: 18,
    result: "Criança despreparada",
  },
  {
    min: 19,
    max: 20,
    result: "Combatente",
  },
];

// ===== DIVULGAÇÃO =====

// Tipo de Divulgação (1d20)
export const DIVULGATION_TYPE_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 7,
    result: "Uma loja divulga seus produtos/serviços",
  },
  {
    min: 8,
    max: 8,
    result: "Uma nova descoberta",
  },
  {
    min: 9,
    max: 9,
    result: "Exposição/leilão",
  },
  {
    min: 10,
    max: 10,
    result: "Pronunciamento verbal",
  },
  {
    min: 11,
    max: 12,
    result: "Recrutamento",
  },
  {
    min: 13,
    max: 13,
    result: "Celebração religiosa",
  },
  {
    min: 14,
    max: 16,
    result: "Apresentação de entretenimento",
  },
  {
    min: 17,
    max: 18,
    result: "Aula/ensino",
  },
  {
    min: 19,
    max: 19,
    result: "Evento esportivo/competição",
  },
  {
    min: 20,
    max: 20,
    result: "Festividades/eventos triviais",
  },
];

// De Quem? (1d20)
export const DIVULGATION_WHO_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 2,
    result: "Nobreza",
  },
  {
    min: 3,
    max: 9,
    result: "Plebeus/comunidade local",
  },
  {
    min: 10,
    max: 11,
    result: "Especialistas",
  },
  {
    min: 12,
    max: 12,
    result: "Da própria guilda",
  },
  {
    min: 13,
    max: 13,
    result: "Clero",
  },
  {
    min: 14,
    max: 14,
    result: "Nômades",
  },
  {
    min: 15,
    max: 16,
    result: "Uma organização",
  },
  {
    min: 17,
    max: 18,
    result: "Adeptos",
  },
  {
    min: 19,
    max: 19,
    result: "Humanoides hostis",
  },
  {
    min: 20,
    max: 20,
    result: "Aventureiros",
  },
];

// ===== EXECUÇÃO =====

// Quem Será Executado (1d20)
export const EXECUTION_WHO_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 5,
    result: "1d4 bandidos",
  },
  {
    min: 6,
    max: 6,
    result: "Uma bruxa",
  },
  {
    min: 7,
    max: 9,
    result: "2d6 plebeus",
  },
  {
    min: 10,
    max: 12,
    result: "Procurado capturado",
  },
  {
    min: 13,
    max: 13,
    result: "1d6 inimigos públicos",
  },
  {
    min: 14,
    max: 14,
    result: "2d4 cultistas",
  },
  {
    min: 15,
    max: 15,
    result: "1d4 adeptos",
  },
  {
    min: 16,
    max: 18,
    result: "1d6 humanoides hostis",
  },
  {
    min: 19,
    max: 19,
    result: "Inocente",
  },
  {
    min: 20,
    max: 20,
    result: "1d4 aventureiros",
  },
];

// Motivo (1d20)
export const EXECUTION_REASON_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 5,
    result: "Por motivos hediondos",
  },
  {
    min: 6,
    max: 6,
    result: "Por não pagar impostos/dívidas",
  },
  {
    min: 7,
    max: 10,
    result: "Assassinatos",
  },
  {
    min: 11,
    max: 12,
    result: "Furtos/roubos menores",
  },
  {
    min: 13,
    max: 13,
    result: "Grandes assaltos",
  },
  {
    min: 14,
    max: 14,
    result: "Traição/espionagem/conspiração",
  },
  {
    min: 15,
    max: 16,
    result: "Falsificação/fraude/estelionato",
  },
  {
    min: 17,
    max: 18,
    result: "Motivo fútil",
  },
  {
    min: 19,
    max: 19,
    result: "Conter uma calamidade",
  },
  {
    min: 20,
    max: 20,
    result: "Uso indevido de magia",
  },
];

// Modo de Execução (1d20)
export const EXECUTION_METHOD_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 4,
    result: "Forca",
  },
  {
    min: 5,
    max: 8,
    result: "Guilhotina",
  },
  {
    min: 9,
    max: 9,
    result: "Fogueira",
  },
  {
    min: 10,
    max: 10,
    result: "Apedrejamento",
  },
  {
    min: 11,
    max: 12,
    result: "Trancafiado em uma masmorra",
  },
  {
    min: 13,
    max: 13,
    result: "Arena de combate",
  },
  {
    min: 14,
    max: 14,
    result: "Envenenamento",
  },
  {
    min: 15,
    max: 16,
    result: "Exilado em local inóspito",
  },
  {
    min: 17,
    max: 17,
    result: "Enterrado até o pescoço",
  },
  {
    min: 18,
    max: 18,
    result: "Ritual religioso",
  },
  {
    min: 19,
    max: 19,
    result: "Jogado no covil de uma criatura",
  },
  {
    min: 20,
    max: 20,
    result: "Magia",
  },
];

// ===== CARTAZ DE PROCURADO =====

// Tipo de Procurado (1d20)
export const WANTED_POSTER_TYPE_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 7,
    result: "Inocente desaparecido",
  },
  {
    min: 8,
    max: 20,
    result: "Condenado fugitivo",
  },
];

// === INOCENTE DESAPARECIDO ===

// Quem Desapareceu (1d20)
export const MISSING_INNOCENT_WHO_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 1,
    result: "Nobre",
  },
  {
    min: 2,
    max: 4,
    result: "Criança",
  },
  {
    min: 5,
    max: 8,
    result: "Plebeu",
  },
  {
    min: 9,
    max: 11,
    result: "Animal doméstico",
  },
  {
    min: 12,
    max: 13,
    result: "Comerciante",
  },
  {
    min: 14,
    max: 14,
    result: "Aventureiro aposentado",
  },
  {
    min: 15,
    max: 16,
    result: "Especialista",
  },
  {
    min: 17,
    max: 18,
    result: "Adepto",
  },
  {
    min: 19,
    max: 19,
    result: "Criatura carismática",
  },
  {
    min: 20,
    max: 20,
    result: "Aventureiro",
  },
];

// Tabela 1d20: Visto pela Última Vez (Inocente Desaparecido)
export const MISSING_LAST_SEEN_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 2,
    result: "Em sua moradia",
  },
  {
    min: 3,
    max: 4,
    result: "Taverna ou estalagem",
  },
  {
    min: 5,
    max: 5,
    result: "Em um templo",
  },
  {
    min: 6,
    max: 7,
    result: "Saindo do assentamento",
  },
  {
    min: 8,
    max: 10,
    result: "Local público",
  },
  {
    min: 11,
    max: 12,
    result: "Moradia alheia",
  },
  {
    min: 13,
    max: 15,
    result: "Fazendo coisas rotineiras",
  },
  {
    min: 16,
    max: 16,
    result: "Morada de um nobre",
  },
  {
    min: 17,
    max: 17,
    result: "Construção do governo local",
  },
  {
    min: 18,
    max: 20,
    result: "No trabalho",
  },
];

// Tabela 1d20: Características I (Inocente Desaparecido)
export const MISSING_CHARACTERISTICS_I_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 3,
    result: "Amado por todos",
  },
  {
    min: 4,
    max: 5,
    result: "Odiado por muitos",
  },
  {
    min: 6,
    max: 6,
    result: "Atividades suspeitas",
  },
  {
    min: 7,
    max: 7,
    result: "Ninguém conhece",
  },
  {
    min: 8,
    max: 11,
    result: "Gentil e tímido",
  },
  {
    min: 12,
    max: 13,
    result: "Recluso e rabugento",
  },
  {
    min: 14,
    max: 15,
    result: "Ingênuo até demais",
  },
  {
    min: 16,
    max: 16,
    result: "Covarde e traiçoeiro",
  },
  {
    min: 17,
    max: 17,
    result: "O melhor em uma atividade",
  },
  {
    min: 18,
    max: 20,
    result: "Doente e fraco",
  },
];

// Tabela 1d20: Características II (Inocente Desaparecido)
export const MISSING_CHARACTERISTICS_II_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 2,
    result: "Fofoqueiro",
  },
  {
    min: 3,
    max: 3,
    result: "Prodígio",
  },
  {
    min: 4,
    max: 4,
    result: "Ateu",
  },
  {
    min: 5,
    max: 6,
    result: "Rebelde",
  },
  {
    min: 7,
    max: 8,
    result: "Cicatriz singular",
  },
  {
    min: 9,
    max: 10,
    result: "Azarado",
  },
  {
    min: 11,
    max: 11,
    result: "Amizade selvagem",
  },
  {
    min: 12,
    max: 14,
    result: "Atrapalhado",
  },
  {
    min: 15,
    max: 16,
    result: "Órfão",
  },
  {
    min: 17,
    max: 20,
    result: "Deformidade",
  },
];

// Tabela 1d20: Peculiaridade (Inocente Desaparecido)
export const MISSING_PECULIARITY_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 2,
    result: "Amaldiçoado",
  },
  {
    min: 3,
    max: 3,
    result: "Sensibilidade à luz do sol",
  },
  {
    min: 4,
    max: 4,
    result: "Símbolos ritualísticos",
  },
  {
    min: 5,
    max: 5,
    result: "Familiar de um antigo herói",
  },
  {
    min: 6,
    max: 7,
    result: "Vida secreta",
  },
  {
    min: 8,
    max: 12,
    result: "Nenhuma",
  },
  {
    min: 13,
    max: 16,
    result: "Magia envolvida",
  },
  {
    min: 17,
    max: 17,
    result: "Não é desse plano",
  },
  {
    min: 18,
    max: 19,
    result: "Estranhamente familiar",
  },
  {
    min: 20,
    max: 20,
    result: "Declarado morto",
  },
];

// Recompensa (1d20)
export const MISSING_REWARD_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 8,
    result: "Nenhuma",
  },
  {
    min: 9,
    max: 10,
    result: "1d20 C$",
  },
  {
    min: 11,
    max: 12,
    result: "4d20 C$",
  },
  {
    min: 13,
    max: 14,
    result: "6d20 C$",
  },
  {
    min: 15,
    max: 15,
    result: "8d20 C$",
  },
  {
    min: 16,
    max: 16,
    result: "1 PO$",
  },
  {
    min: 17,
    max: 17,
    result: "1d4+1 PO$",
  },
  {
    min: 18,
    max: 18,
    result: "2d6+1 PO$",
  },
  {
    min: 19,
    max: 19,
    result: "3d6 PO$",
  },
  {
    min: 20,
    max: 20,
    result: "3d6+5 PO$",
  },
];

// === CONDENADO FUGITIVO ===

// Motivo da Infâmia (1d20)
export const FUGITIVE_INFAMY_REASON_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 2,
    result: "Crime contra nobreza",
  },
  {
    min: 3,
    max: 4,
    result: "Crime contra oficiais",
  },
  {
    min: 5,
    max: 9,
    result: "Crime contra o assentamento/governo",
  },
  {
    min: 10,
    max: 10,
    result: "Crime contra os deuses",
  },
  {
    min: 11,
    max: 14,
    result: "Crime contra os cidadãos",
  },
  {
    min: 15,
    max: 16,
    result: "Crime contra organizações",
  },
  {
    min: 17,
    max: 17,
    result: "Crimes hediondos",
  },
  {
    min: 18,
    max: 18,
    result: "Vítima de conspiração",
  },
  {
    min: 19,
    max: 19,
    result: "Crime ambiental",
  },
  {
    min: 20,
    max: 20,
    result: "Role duas vezes e use ambos",
  },
];

// Periculosidade (1d20)
export const FUGITIVE_DANGEROUSNESS_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 1,
    result: "Quase inofensivo",
  },
  {
    min: 2,
    max: 3,
    result: "Baixíssima",
  },
  {
    min: 4,
    max: 5,
    result: "Muito baixa",
  },
  {
    min: 6,
    max: 8,
    result: "Baixa",
  },
  {
    min: 9,
    max: 14,
    result: "Média",
  },
  {
    min: 15,
    max: 16,
    result: "Alta",
  },
  {
    min: 17,
    max: 17,
    result: "Muito alta",
  },
  {
    min: 18,
    max: 18,
    result: "Altíssima",
  },
  {
    min: 19,
    max: 19,
    result: "Crítica",
  },
  {
    min: 20,
    max: 20,
    result: "Perigo mortal",
  },
];

// Recompensa por Periculosidade
export const FUGITIVE_REWARD_BY_DANGER: Record<string, string> = {
  "Quase inofensivo": "1d6 PO$",
  Baixíssima: "2d6 PO$",
  "Muito baixa": "3d6 PO$",
  Baixa: "4d6 PO$",
  Média: "10 PO$",
  Alta: "30 PO$",
  "Muito alta": "60 PO$",
  Altíssima: "100 PO$",
  Crítica: "200 PO$",
  "Perigo mortal": "300 PO$",
};

// Tabela 1d20: Peculiaridades (Condenado Fugitivo)
export const FUGITIVE_PECULIARITIES_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 2,
    result: "Aparência inofensiva",
  },
  {
    min: 3,
    max: 6,
    result: "Mestre do subterfúgio",
  },
  {
    min: 7,
    max: 9,
    result: "Sedutor e persuasivo",
  },
  {
    min: 10,
    max: 11,
    result: "Acrobata atlético",
  },
  {
    min: 12,
    max: 14,
    result: "Brutamontes",
  },
  {
    min: 15,
    max: 15,
    result: "Imunidade a um tipo de dano/condição",
  },
  {
    min: 16,
    max: 16,
    result: "Fama entre criminosos",
  },
  {
    min: 17,
    max: 18,
    result: "Louco/psicopata",
  },
  {
    min: 19,
    max: 19,
    result: "Licantropia",
  },
  {
    min: 20,
    max: 20,
    result: "Traços notáveis",
  },
];

// Tabela 1d20: Características (Condenado Fugitivo)
export const FUGITIVE_CHARACTERISTICS_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 4,
    result: "Cicatriz horrenda",
  },
  {
    min: 5,
    max: 5,
    result: "Próteses mecânicas ou mágicas",
  },
  {
    min: 6,
    max: 7,
    result: "Tatuagens exóticas",
  },
  {
    min: 8,
    max: 8,
    result: "Marca de nascença profética",
  },
  {
    min: 9,
    max: 13,
    result: "Alto demais ou baixinho",
  },
  {
    min: 14,
    max: 15,
    result: "Abastado",
  },
  {
    min: 16,
    max: 16,
    result: "Um dos atributos é 5",
  },
  {
    min: 17,
    max: 17,
    result: "Dom sobrenatural",
  },
  {
    min: 18,
    max: 19,
    result: "Poliglota",
  },
  {
    min: 20,
    max: 20,
    result: "Amaldiçoado",
  },
];

// Tabela 1d20: Traços Notáveis (Condenado Fugitivo)
export const FUGITIVE_NOTABLE_TRAITS_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 4,
    result: "Exímio espadachim",
  },
  {
    min: 5,
    max: 7,
    result: "Conjurador arcano",
  },
  {
    min: 8,
    max: 9,
    result: "Conjurador divino",
  },
  {
    min: 10,
    max: 10,
    result: "Mestre das feras",
  },
  {
    min: 11,
    max: 12,
    result: "Alquimista biruta",
  },
  {
    min: 13,
    max: 14,
    result: "Negociante habilidoso",
  },
  {
    min: 15,
    max: 15,
    result: "Líder de organização",
  },
  {
    min: 16,
    max: 17,
    result: "Ritualista excêntrico",
  },
  {
    min: 18,
    max: 18,
    result: "Fúria incontrolável",
  },
  {
    min: 19,
    max: 20,
    result: "Mestre da mira",
  },
];

// ===== AVISO DOS HABITANTES =====

// Aviso dos Habitantes (1d20)
export const INHABITANTS_NOTICE_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 1,
    result: "Rumor sobre perigos próximos",
  },
  {
    min: 2,
    max: 2,
    result: "Boato sobre o governo ou seus membros",
  },
  {
    min: 3,
    max: 4,
    result: "Boato sobre um produto ou serviço",
  },
  {
    min: 5,
    max: 5,
    result: "Rumor sobre relíquia",
  },
  {
    min: 6,
    max: 9,
    result: "Boato sobre desavenças",
  },
  {
    min: 10,
    max: 10,
    result: "Rumor sobre um tesouro",
  },
  {
    min: 11,
    max: 11,
    result: "Boato sobre um distrito",
  },
  {
    min: 12,
    max: 13,
    result: "Aviso inusitado ou reclamações",
  },
  {
    min: 14,
    max: 14,
    result: "Boato sobre uma organização",
  },
  {
    min: 15,
    max: 20,
    result: "Notícias relevantes para os habitantes locais",
  },
];

// ===== PRONUNCIAMENTO =====

// Tipo de Pronunciamento (1d20)
export const PRONOUNCEMENT_TYPE_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 2,
    result: "Calamidade iminente",
  },
  {
    min: 3,
    max: 4,
    result: "Uma nova lei ou mudança em uma já existente",
  },
  {
    min: 5,
    max: 9,
    result: "Julgamento com júri popular",
  },
  {
    min: 10,
    max: 10,
    result: "Alteração na estrutura de poder",
  },
  {
    min: 11,
    max: 11,
    result: "Benefícios conquistados para a população",
  },
  {
    min: 12,
    max: 13,
    result: "Proibições temporárias",
  },
  {
    min: 14,
    max: 15,
    result: "Obituário",
  },
  {
    min: 16,
    max: 18,
    result: "Tributação",
  },
  {
    min: 19,
    max: 19,
    result: "Nova organização importante para o assentamento",
  },
  {
    min: 20,
    max: 20,
    result: "Condecoração",
  },
];

// Peculiaridade do Pronunciamento (1d20)
export const PRONOUNCEMENT_PECULIARITY_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 1,
    result: "A mensagem está codificada",
  },
  {
    min: 2,
    max: 3,
    result: "Selo de uma família/clã de renome",
  },
  {
    min: 4,
    max: 4,
    result: "Dialeto/idioma incomum para a região",
  },
  {
    min: 5,
    max: 5,
    result: "Tudo foi forjado para enriquecer corruptos",
  },
  {
    min: 6,
    max: 13,
    result: "Nenhuma",
  },
  {
    min: 14,
    max: 14,
    result: "Abruptamente cancelado ou mudado",
  },
  {
    min: 15,
    max: 15,
    result: "Retaliações devido ao pronunciamento",
  },
  {
    min: 16,
    max: 17,
    result: "Pronunciamento tendencioso",
  },
  {
    min: 18,
    max: 19,
    result: "Requisitado pelo líder local",
  },
  {
    min: 20,
    max: 20,
    result: "Fonte não confiável",
  },
];

// ===== PROPOSTA DE CAÇADA =====

// Tabela 1d20: Tipo de Caçada
export const HUNT_PROPOSAL_TYPE_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 3,
    result: "Um bando de...",
  },
  {
    min: 4,
    max: 4,
    result: "Um único e poderoso...",
  },
  {
    min: 5,
    max: 5,
    result: "Um conjurador e seu...",
  },
  {
    min: 6,
    max: 6,
    result: "Um casal de...",
  },
  {
    min: 7,
    max: 9,
    result: "O líder e seus lacaios...",
  },
  {
    min: 10,
    max: 12,
    result: "Um covil de...",
  },
  {
    min: 13,
    max: 13,
    result: "Uma seita que cultua...",
  },
  {
    min: 14,
    max: 15,
    result: "Vingar vítimas de...",
  },
  {
    min: 16,
    max: 17,
    result: "Rastrear e capturar...",
  },
  {
    min: 18,
    max: 19,
    result: "Os raptores de humanoides, que são...",
  },
  {
    min: 20,
    max: 20,
    result: "Inimigo mortal de um...",
  },
];

// Tabela 1d20: Especificação da Criatura
export const HUNT_CREATURE_SPECIFICATION_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 1,
    result: "Amaldiçoados",
  },
  {
    min: 2,
    max: 2,
    result: "Construtos",
  },
  {
    min: 3,
    max: 3,
    result: "Demônios",
  },
  {
    min: 4,
    max: 5,
    result: "Draconídeos",
  },
  {
    min: 6,
    max: 10,
    result: "Fauna",
  },
  {
    min: 11,
    max: 11,
    result: "Gigantes",
  },
  {
    min: 12,
    max: 16,
    result: "Humanoides",
  },
  {
    min: 17,
    max: 18,
    result: "Monstruosidades",
  },
  {
    min: 19,
    max: 19,
    result: "Mortos-Vivos",
  },
  {
    min: 20,
    max: 20,
    result: "Celestiais",
  },
];

// Tabela 1d20: Local
export const HUNT_LOCATION_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 4,
    result: "Floresta",
  },
  {
    min: 5,
    max: 5,
    result: "Assentamento",
  },
  {
    min: 6,
    max: 6,
    result: "Deserto",
  },
  {
    min: 7,
    max: 9,
    result: "Construção abandonada",
  },
  {
    min: 10,
    max: 10,
    result: "Montanhas/colinas",
  },
  {
    min: 11,
    max: 11,
    result: "Caverna",
  },
  {
    min: 12,
    max: 12,
    result: "Pântano",
  },
  {
    min: 13,
    max: 15,
    result: "Planície",
  },
  {
    min: 16,
    max: 16,
    result: "Subterrâneo",
  },
  {
    min: 17,
    max: 18,
    result: "Litoral",
  },
  {
    min: 19,
    max: 19,
    result: "Subaquático",
  },
  {
    min: 20,
    max: 20,
    result: "Mar-Aberto",
  },
];

// Tabela 1d20: Peculiaridade da Caça
export const HUNT_PECULIARITY_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 3,
    result: "Nenhuma",
  },
  {
    min: 4,
    max: 5,
    result: "+1 em seu maior atributo",
  },
  {
    min: 6,
    max: 6,
    result: "+1 de Deslocamento",
  },
  {
    min: 7,
    max: 8,
    result: "+8 PV",
  },
  {
    min: 9,
    max: 9,
    result: "+1d20 em um teste",
  },
  {
    min: 10,
    max: 10,
    result: "+16 PV",
  },
  {
    min: 11,
    max: 11,
    result: "+2 de Deslocamento",
  },
  {
    min: 12,
    max: 12,
    result: "+24 PV",
  },
  {
    min: 13,
    max: 14,
    result: "Ataque adicional",
  },
  {
    min: 15,
    max: 16,
    result: "Resistência Aprimorada a tipo de dano adicional",
  },
  {
    min: 17,
    max: 17,
    result: "Imunidade a tipo de dano adicional",
  },
  {
    min: 18,
    max: 18,
    result: "RD 3 a qualquer dano",
  },
  {
    min: 19,
    max: 19,
    result: "Ação lendária",
  },
  {
    min: 20,
    max: 20,
    result: "Role duas vezes e use ambos",
  },
];

// Tabela 1d20: Característica I da Caça
export const HUNT_CHARACTERISTIC_I_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 3,
    result: "Nenhuma",
  },
  {
    min: 4,
    max: 5,
    result: "+1 de Defesa",
  },
  {
    min: 6,
    max: 6,
    result: "+1d20 em um teste de resistência",
  },
  {
    min: 7,
    max: 7,
    result: "+1 de Margem de crítico",
  },
  {
    min: 8,
    max: 8,
    result: "Luta por mais 2 turnos após a morte",
  },
  {
    min: 9,
    max: 12,
    result: "Possui um item mágico",
  },
  {
    min: 13,
    max: 13,
    result: "Imunidade a condição adicional",
  },
  {
    min: 14,
    max: 14,
    result: "+2 de Defesa",
  },
  {
    min: 15,
    max: 15,
    result: "+2 de Margem de crítico",
  },
  {
    min: 16,
    max: 16,
    result: "Não pode ser surpreendido",
  },
  {
    min: 17,
    max: 17,
    result: "Uma categoria de tamanho acima",
  },
  {
    min: 18,
    max: 18,
    result: "+1d20 em testes de ataque",
  },
  {
    min: 19,
    max: 19,
    result: "Peculiaridade adicional",
  },
  {
    min: 20,
    max: 20,
    result: "Role duas vezes e use ambos",
  },
];

// Tabela 1d20: Característica II da Caça
export const HUNT_CHARACTERISTIC_II_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 5,
    result: "Nenhuma",
  },
  {
    min: 6,
    max: 6,
    result: "Coloração rara/exótica",
  },
  {
    min: 7,
    max: 7,
    result: "Já foi caçado outra vez",
  },
  {
    min: 8,
    max: 8,
    result: "Não possui medo ou dúvida",
  },
  {
    min: 9,
    max: 9,
    result: "Quase não deixa rastros",
  },
  {
    min: 10,
    max: 10,
    result: "Sofre com uma deformidade",
  },
  {
    min: 11,
    max: 11,
    result: "Protagonista de uma lenda local",
  },
  {
    min: 12,
    max: 12,
    result: "Odor exótico",
  },
  {
    min: 13,
    max: 13,
    result: "Veterano Experiente",
  },
  {
    min: 14,
    max: 14,
    result: "Está doente ou ferido",
  },
  {
    min: 15,
    max: 15,
    result: "Possui aliados",
  },
  {
    min: 16,
    max: 16,
    result: "Inteligência acima do normal",
  },
  {
    min: 17,
    max: 17,
    result: "Marcas rúnicas",
  },
  {
    min: 18,
    max: 18,
    result: "Paranoico",
  },
  {
    min: 19,
    max: 19,
    result: "Tem crias/filhotes",
  },
  {
    min: 20,
    max: 20,
    result: "Role duas vezes e use ambos",
  },
];

// Tabela 1d20: Vantagem em Testes da Caça
export const HUNT_TEST_ADVANTAGE_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 4,
    result: "Nenhum",
  },
  {
    min: 5,
    max: 6,
    result: "+1d20 em um teste de resistência",
  },
  {
    min: 7,
    max: 8,
    result: "+1d20 no teste perícia com maior bônus",
  },
  {
    min: 9,
    max: 10,
    result: "+1d20 em um dos ataques",
  },
  {
    min: 11,
    max: 12,
    result: "+1d20 em testes que envolvam seu maior atributo",
  },
  {
    min: 13,
    max: 14,
    result: "+1d20 em testes que envolvam seu menor atributo",
  },
  {
    min: 15,
    max: 16,
    result: "+2d20 em testes de resistência contra magia",
  },
  {
    min: 17,
    max: 18,
    result: "+2d20 em testes de percepção",
  },
  {
    min: 19,
    max: 20,
    result: "+2d20 em testes de iniciativa",
  },
];

// Tabela para recompensa por NA da criatura (dados de referência)
export const HUNT_REWARD_DICE_BY_CR: Record<string, string> = {
  "0-4": "1d4",
  "5-9": "1d6",
  "10-14": "1d8",
  "15-20": "1d10",
  "25-30": "1d12",
  "35-40": "1d10+3",
  "45-50": "1d10+5",
  "55-60": "1d12+5",
  "65-70": "1d20+2",
  "75-80": "1d20+5",
};

// Tabela 1d100: Recompensa por criatura
export const HUNT_REWARD_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "3d6*5 C$" },
  { min: 2, max: 2, result: "3d6*10 C$" },
  { min: 3, max: 3, result: "5d6*10 C$" },
  { min: 4, max: 4, result: "1d6 PO$" },
  { min: 5, max: 5, result: "1d10 PO$" },
  { min: 6, max: 6, result: "2d6 PO$" },
  { min: 7, max: 7, result: "3d6 PO$" },
  { min: 8, max: 8, result: "4d6 PO$" },
  { min: 9, max: 9, result: "5d6 PO$" },
  { min: 10, max: 10, result: "8d6 PO$" },
  { min: 11, max: 11, result: "10d6 PO$" },
  { min: 12, max: 12, result: "10d10 PO$" },
  { min: 13, max: 13, result: "10d6*2 PO$" },
  { min: 14, max: 14, result: "10d6*3 PO$" },
  { min: 15, max: 15, result: "10d10*3 PO$" },
  { min: 16, max: 16, result: "10d10*5 PO$" },
  { min: 17, max: 17, result: "10d6*10 PO$" },
  { min: 18, max: 18, result: "10d10*12 PO$" },
  { min: 19, max: 19, result: "10d6*20 PO$" },
  { min: 20, max: 20, result: "10d20*10 PO$" },
];

// Tabela 1d20: Há uma Reviravolta?
export const HUNT_TWIST_CHECK_TABLE: TableEntry<boolean>[] = [
  {
    min: 1,
    max: 16,
    result: false, // Não
  },
  {
    min: 17,
    max: 20,
    result: true, // Sim
  },
];

// Tabela 1d20: Tipos de Reviravoltas
export const HUNT_TWIST_TYPE_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 1,
    result: "O alvo é um velho conhecido",
  },
  {
    min: 2,
    max: 2,
    result: "Era o alvo errado",
  },
  {
    min: 3,
    max: 3,
    result: "O contratante foi caçado no meio tempo",
  },
  {
    min: 4,
    max: 5,
    result: "O alvo caça o grupo de volta",
  },
  {
    min: 6,
    max: 6,
    result: "O alvo era falso",
  },
  {
    min: 7,
    max: 7,
    result: "Tudo era uma maldição",
  },
  {
    min: 8,
    max: 8,
    result: "O alvo já estava morto",
  },
  {
    min: 9,
    max: 9,
    result: "O contratante é o culpado por tudo",
  },
  {
    min: 10,
    max: 10,
    result: "A recompensa não é o esperado",
  },
  {
    min: 11,
    max: 11,
    result: "Há outros caçadores",
  },
  {
    min: 12,
    max: 12,
    result: "Há quem queira proteger o alvo",
  },
  {
    min: 13,
    max: 13,
    result: "O alvo é inofensivo",
  },
  {
    min: 14,
    max: 15,
    result: "Era uma armadilha",
  },
  {
    min: 16,
    max: 18,
    result: "Informações são omitidas",
  },
  {
    min: 19,
    max: 19,
    result: "Foi uma luta suspeitamente fácil",
  },
  {
    min: 20,
    max: 20,
    result: "Role duas vezes e use ambos",
  },
];

// ===== TABELA DE ESPÉCIES (d100) =====

// Tabela de espécies para quando uma pessoa é mencionada no quadro de avisos
export const SPECIES_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 3,
    result: "Infernal (Alshayatin)",
  },
  {
    min: 4,
    max: 9,
    result: "Anão (Dvergar)",
  },
  {
    min: 10,
    max: 11,
    result: "Centauro (Rhesymeirch)",
  },
  {
    min: 12,
    max: 17,
    result: "Elfo (Caolduine)",
  },
  {
    min: 18,
    max: 23,
    result: "Animalesco (Ffyrnig)",
  },
  {
    min: 24,
    max: 26,
    result: "Glasnee",
  },
  {
    min: 27,
    max: 30,
    result: "Gnomo (T'zuk)",
  },
  {
    min: 31,
    max: 33,
    result: "Halfling (Haneru)",
  },
  {
    min: 34,
    max: 39,
    result: "Humano",
  },
  {
    min: 40,
    max: 41,
    result: "Khargi",
  },
  {
    min: 42,
    max: 43,
    result: "Meio-Sangue",
  },
  {
    min: 44,
    max: 46,
    result: "Hobgoblin (Muremure)",
  },
  {
    min: 47,
    max: 50,
    result: "Dracônico (Nolddraig)",
  },
  {
    min: 51,
    max: 53,
    result: "Alados (Ogadain)",
  },
  {
    min: 54,
    max: 59,
    result: "Orc (Meehun)",
  },
  {
    min: 60,
    max: 61,
    result: "Tritão (Mowason)",
  },
  {
    min: 62,
    max: 62,
    result: "Construto",
  },
  {
    min: 63,
    max: 68,
    result: "Goblin (Umusobi)",
  },
  {
    min: 69,
    max: 69,
    result: "Duende",
  },
  {
    min: 70,
    max: 71,
    result: "Fada (Teglwyth)",
  },
  {
    min: 72,
    max: 73,
    result: "Harpia",
  },
  {
    min: 74,
    max: 76,
    result: "Bugbear (Inyamanswa)",
  },
  {
    min: 77,
    max: 79,
    result: "Firbolg (Mnoprei)",
  },
  {
    min: 80,
    max: 83,
    result: "Sátiro",
  },
  {
    min: 84,
    max: 84,
    result: "Sereia (Siren)",
  },
  {
    min: 85,
    max: 88,
    result: "Gigante",
  },
  {
    min: 89,
    max: 90,
    result: "Gweld",
  },
  {
    min: 91,
    max: 93,
    result: "Urgani (Homem-planta)",
  },
  {
    min: 94,
    max: 95,
    result: "Moogani (Homem-fungo)",
  },
  {
    min: 96,
    max: 97,
    result: "Gazarai (Elementais)",
  },
  {
    min: 98,
    max: 99,
    result: "Vampiro (role de novo)",
  },
  {
    min: 100,
    max: 100,
    result: "Semideus (role de novo)",
  },
];

// ===== SUB-RAÇAS DAS ESPÉCIES =====

// Tabela d100: Centauro
export const CENTAUR_SUBRACE_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 50,
    result: "Meirchgywir",
  },
  {
    min: 51,
    max: 100,
    result: "Unegui",
  },
];

// Tabela d100: Elfo
export const ELF_SUBRACE_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 16,
    result: "An'Lusan (Floresta)",
  },
  {
    min: 17,
    max: 32,
    result: "An'Geal (Neve)",
  },
  {
    min: 33,
    max: 48,
    result: "An'Ghrian (Deserto)",
  },
  {
    min: 49,
    max: 64,
    result: "An'Dubh (Caverna)",
  },
  {
    min: 65,
    max: 80,
    result: "An'Uisgeach (Água)",
  },
  {
    min: 81,
    max: 96,
    result: "An'Aard (Montanha)",
  },
  {
    min: 97,
    max: 100,
    result: "Mestiço (Role duas vezes)",
  },
];

// Tabela d100: Animalesco
export const ANIMALESQUE_SUBRACE_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 7,
    result: "Anfíbio",
  },
  {
    min: 8,
    max: 11,
    result: "Artiodáctilo",
  },
  {
    min: 12,
    max: 18,
    result: "Ave",
  },
  {
    min: 19,
    max: 26,
    result: "Canídeo",
  },
  {
    min: 27,
    max: 28,
    result: "Elefantídeo",
  },
  {
    min: 29,
    max: 36,
    result: "Felídeo",
  },
  {
    min: 37,
    max: 43,
    result: "Leporídeo",
  },
  {
    min: 44,
    max: 46,
    result: "Marsupial",
  },
  {
    min: 47,
    max: 48,
    result: "Perissodáctilo",
  },
  {
    min: 49,
    max: 51,
    result: "Primata",
  },
  {
    min: 51,
    max: 58,
    result: "Réptil",
  },
  {
    min: 59,
    max: 66,
    result: "Roedor",
  },
  {
    min: 67,
    max: 73,
    result: "Ursídeo",
  },
  {
    min: 74,
    max: 80,
    result: "Inseto",
  },
  {
    min: 81,
    max: 82,
    result: "Mustelídeo",
  },
  {
    min: 83,
    max: 85,
    result: "Peixe",
  },
  {
    min: 86,
    max: 86,
    result: "Quiróptero",
  },
  {
    min: 87,
    max: 88,
    result: "Hiena",
  },
  {
    min: 89,
    max: 91,
    result: "Herpestídeo",
  },
  {
    min: 92,
    max: 92,
    result: "Cetáceo",
  },
  {
    min: 93,
    max: 93,
    result: "Pinnípede",
  },
  {
    min: 94,
    max: 95,
    result: "Procionídeo",
  },
  {
    min: 96,
    max: 96,
    result: "Xenartro",
  },
  {
    min: 97,
    max: 97,
    result: "Sirênio",
  },
  {
    min: 98,
    max: 98,
    result: "Monotremado",
  },
  {
    min: 99,
    max: 99,
    result: "Aracnídeo",
  },
  {
    min: 100,
    max: 100,
    result: "Cefalópode",
  },
];

// Tabela d100: Meio-sangue
export const HALFBLOOD_SUBRACE_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 5,
    result: "Infernal (Alshayatin)",
  },
  {
    min: 6,
    max: 9,
    result: "Anão (Dvergar)",
  },
  {
    min: 9,
    max: 11,
    result: "Centauro (Rhesymeirch)",
  },
  {
    min: 12,
    max: 20,
    result: "Elfo (Caolduine)",
  },
  {
    min: 21,
    max: 24,
    result: "Animalesco (Role a sub-raça)",
  },
  {
    min: 25,
    max: 32,
    result: "Glasnee",
  },
  {
    min: 33,
    max: 35,
    result: "Gnomo (T'zuk)",
  },
  {
    min: 36,
    max: 38,
    result: "Halfling (Haneru)",
  },
  {
    min: 39,
    max: 41,
    result: "Khargi",
  },
  {
    min: 42,
    max: 44,
    result: "Hobgoblin (Muremure)",
  },
  {
    min: 45,
    max: 47,
    result: "Dracônico (Nolddraig)",
  },
  {
    min: 48,
    max: 53,
    result: "Alados (Ogadain)",
  },
  {
    min: 54,
    max: 62,
    result: "Orc (Meehun)",
  },
  {
    min: 63,
    max: 63,
    result: "Tritão (Mowason)",
  },
  {
    min: 64,
    max: 69,
    result: "Goblin (Umusobi)",
  },
  {
    min: 70,
    max: 70,
    result: "Duende",
  },
  {
    min: 71,
    max: 72,
    result: "Fada (Teglwyth)",
  },
  {
    min: 73,
    max: 77,
    result: "Harpia",
  },
  {
    min: 78,
    max: 80,
    result: "Bugbear (Inyamanswa)",
  },
  {
    min: 81,
    max: 83,
    result: "Firbolg (Mnoprei)",
  },
  {
    min: 84,
    max: 86,
    result: "Sátiro",
  },
  {
    min: 87,
    max: 92,
    result: "Sereia (Siren)",
  },
  {
    min: 93,
    max: 94,
    result: "Gigante",
  },
  {
    min: 95,
    max: 96,
    result: "Gweld",
  },
  {
    min: 97,
    max: 98,
    result: "Gazarai (Elementais)",
  },
  {
    min: 99,
    max: 99,
    result: "Vampiro Verdadeiro",
  },
  {
    min: 100,
    max: 100,
    result: "Divindade",
  },
];

// Tabela d100: Dracônico
export const DRACONIC_SUBRACE_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 10,
    result: "Amarelo (Ácido)",
  },
  {
    min: 11,
    max: 20,
    result: "Azul (Elétrico)",
  },
  {
    min: 21,
    max: 30,
    result: "Branco (Frio)",
  },
  {
    min: 31,
    max: 40,
    result: "Cinza (Vento)",
  },
  {
    min: 41,
    max: 50,
    result: "Dourado (Mental)",
  },
  {
    min: 51,
    max: 60,
    result: "Laranja (Sonoro)",
  },
  {
    min: 61,
    max: 70,
    result: "Prateado (Místico)",
  },
  {
    min: 71,
    max: 80,
    result: "Preto (Necrótico)",
  },
  {
    min: 81,
    max: 90,
    result: "Verde (Veneno)",
  },
  {
    min: 91,
    max: 100,
    result: "Vermelho (Fogo)",
  },
];

// Tabela d100: Construto
export const CONSTRUCT_SUBRACE_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 10,
    result: "Pedra",
  },
  {
    min: 11,
    max: 20,
    result: "Barro",
  },
  {
    min: 21,
    max: 30,
    result: "Vidro",
  },
  {
    min: 31,
    max: 40,
    result: "Arcano",
  },
  {
    min: 41,
    max: 50,
    result: "Metal",
  },
  {
    min: 51,
    max: 60,
    result: "Argila",
  },
  {
    min: 61,
    max: 70,
    result: "Carne",
  },
  {
    min: 71,
    max: 80,
    result: "Cristal",
  },
  {
    min: 81,
    max: 90,
    result: "Quartzo",
  },
  {
    min: 91,
    max: 100,
    result: "Objeto",
  },
];

// Tabela d100: Urgani
export const URGANI_SUBRACE_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 25,
    result: "Angiospérmicas",
  },
  {
    min: 26,
    max: 50,
    result: "Gimnospermas",
  },
  {
    min: 51,
    max: 75,
    result: "Pteridófitas",
  },
  {
    min: 76,
    max: 100,
    result: "Briófitas",
  },
];

// Tabela d100: Moogani
export const MOOGANI_SUBRACE_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 25,
    result: "Ascomycota",
  },
  {
    min: 26,
    max: 50,
    result: "Basidiomycota",
  },
  {
    min: 51,
    max: 75,
    result: "Glomeromycota",
  },
  {
    min: 76,
    max: 100,
    result: "Zygomycota",
  },
];

// Tabela d100: Gazarai
export const GAZARAI_SUBRACE_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 10,
    result: "Fogo",
  },
  {
    min: 11,
    max: 20,
    result: "Água",
  },
  {
    min: 21,
    max: 30,
    result: "Terra",
  },
  {
    min: 31,
    max: 40,
    result: "Ar",
  },
  {
    min: 41,
    max: 50,
    result: "Raio",
  },
  {
    min: 51,
    max: 60,
    result: "Místico",
  },
  {
    min: 61,
    max: 70,
    result: "Gelo",
  },
  {
    min: 71,
    max: 80,
    result: "Planta",
  },
  {
    min: 81,
    max: 90,
    result: "Luz",
  },
  {
    min: 91,
    max: 100,
    result: "Metal",
  },
];

// ===== RENOVAÇÃO DO MURAL =====

// Tabela 1d20: Quando Novos Avisos Serão Fixados
export const NEW_NOTICES_TIMING_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 1,
    result: "2d4 meses",
  },
  {
    min: 2,
    max: 2,
    result: "Três meses",
  },
  {
    min: 3,
    max: 4,
    result: "Dois meses",
  },
  {
    min: 5,
    max: 9,
    result: "Um mês",
  },
  {
    min: 10,
    max: 13,
    result: "2d4 semanas",
  },
  {
    min: 14,
    max: 15,
    result: "Três semanas",
  },
  {
    min: 16,
    max: 17,
    result: "Duas semanas",
  },
  {
    min: 18,
    max: 18,
    result: "Uma semana",
  },
  {
    min: 19,
    max: 19,
    result: "Quatro dias",
  },
  {
    min: 20,
    max: 20,
    result: "Dois dias",
  },
];

// Dados por Tamanho do Assentamento (para renovação)
export const RENEWAL_DICE_BY_SETTLEMENT: Record<string, string> = {
  Lugarejo: "1d20-15",
  Povoado: "2d20-15",
  Aldeia: "1d20-10",
  Vilarejo: "2d20-10",
  "Vila grande": "1d20-5",
  Cidadela: "2d20-5",
  "Cidade grande": "2d20",
  Metrópole: "2d20+5",
};

// Tabela 1d20: Quando Avisos São Retirados ou Resolvidos
export const NOTICE_REMOVAL_TIMING_TABLE: TableEntry<string>[] = [
  {
    min: 1,
    max: 1,
    result: "Três meses",
  },
  {
    min: 2,
    max: 2,
    result: "Dois meses",
  },
  {
    min: 3,
    max: 4,
    result: "Um mês",
  },
  {
    min: 5,
    max: 6,
    result: "2d4 semanas",
  },
  {
    min: 7,
    max: 10,
    result: "Duas semanas",
  },
  {
    min: 11,
    max: 13,
    result: "Uma semana",
  },
  {
    min: 14,
    max: 15,
    result: "Quatro dias",
  },
  {
    min: 16,
    max: 17,
    result: "Três dias",
  },
  {
    min: 18,
    max: 19,
    result: "Dois dias",
  },
  {
    min: 20,
    max: 20,
    result: "Um dia",
  },
];

// Modificadores por Tipo de Aviso (para remoção)
export const NOTICE_REMOVAL_MODIFIERS: Record<string, number> = {
  "Aviso dos habitantes": 8,
  Serviços: 6,
  "Proposta comercial": 4,
  Divulgação: 2,
  "Proposta de caçada": 0,
  "Cartaz de procurado": -2,
  Contratos: -4,
  Pronunciamento: -8,
};

// ===== FUNÇÕES UTILITÁRIAS BÁSICAS =====

/**
 * Calcula o modificador por tamanho do assentamento
 */
export function getSettlementSizeModifier(settlementType: string): number {
  return SETTLEMENT_SIZE_MODIFIERS[settlementType] || 0;
}

/**
 * Obtém o dado por tamanho do assentamento
 */
export function getSettlementSizeDice(settlementType: string): string {
  return SETTLEMENT_SIZE_DICE[settlementType] || "1d20";
}

/**
 * Obtém o modificador por tamanho da sede da guilda
 */
export function getGuildHQSizeModifier(hqSize: string): string {
  return GUILD_HQ_SIZE_MODIFIERS[hqSize] || "+0";
}

/**
 * Obtém o modificador por condição dos funcionários
 */
export function getStaffConditionModifier(condition: string): string {
  return STAFF_CONDITION_MODIFIERS[condition] || "+0";
}

/**
 * Obtém recompensa por periculosidade do fugitivo
 */
export function getFugitiveRewardByDanger(dangerLevel: string): string {
  return FUGITIVE_REWARD_BY_DANGER[dangerLevel] || "0 PO$";
}
