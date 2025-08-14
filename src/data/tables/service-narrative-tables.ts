import type { TableEntry } from "@/types/tables";

// ===== TABELAS DE ELEMENTOS NARRATIVOS DE SERVIÇOS =====

// Implementa elementos narrativos avançados para enriquecer a experiência dos serviços

// ===== A RAIZ DO PROBLEMA =====

// Interface para origem do problema
interface ServiceOriginResult {
  description: string;
}

// Tabela: Origem do Problema (d20)
// Todo serviço nasce de uma necessidade real ou circunstância específica
export const SERVICE_ORIGIN_TABLE: TableEntry<ServiceOriginResult>[] = [
  {
    min: 1,
    max: 1,
    result: {
      description: "Tradição/conflito familiar",
    },
  },
  {
    min: 2,
    max: 2,
    result: {
      description: "Corrupção no governo local",
    },
  },
  {
    min: 3,
    max: 3,
    result: {
      description: "Aproveitador/charlatão",
    },
  },
  {
    min: 4,
    max: 4,
    result: {
      description: "Algo mundano, corriqueiro ou natural",
    },
  },
  {
    min: 5,
    max: 5,
    result: {
      description: "Antiga promessa não cumprida",
    },
  },
  {
    min: 6,
    max: 6,
    result: {
      description: "Falta de comunicação entre grupos",
    },
  },
  {
    min: 7,
    max: 7,
    result: {
      description: "Criaturas de fora do assentamento",
    },
  },
  {
    min: 8,
    max: 8,
    result: {
      description: "Desinformação ou boatos espalhados",
    },
  },
  {
    min: 9,
    max: 9,
    result: {
      description: "Ordem religiosa com boas intenções",
    },
  },
  {
    min: 10,
    max: 10,
    result: {
      description: "Escassez de recursos essenciais",
    },
  },
  {
    min: 11,
    max: 11,
    result: {
      description: "Peste ou doença contagiosa",
    },
  },
  {
    min: 12,
    max: 12,
    result: {
      description: "Profecia (possivelmente mal interpretada)",
    },
  },
  {
    min: 13,
    max: 13,
    result: {
      description: "Falta de mão-de-obra",
    },
  },
  {
    min: 14,
    max: 14,
    result: {
      description: "Interferência de feiticeiro/eremita",
    },
  },
  {
    min: 15,
    max: 15,
    result: {
      description: "Fenômeno natural incomum",
    },
  },
  {
    min: 16,
    max: 16,
    result: {
      description: "Espionagem política",
    },
  },
  {
    min: 17,
    max: 17,
    result: {
      description: "Mudança repentina de liderança local",
    },
  },
  {
    min: 18,
    max: 18,
    result: {
      description: "Disputa por território ou recursos",
    },
  },
  {
    min: 19,
    max: 19,
    result: {
      description: "Evento sazonal inesperado",
    },
  },
  {
    min: 20,
    max: 20,
    result: {
      description: "A morte de um humanoide importante",
    },
  },
];

// Interface para complicador adicional
interface ServiceAdditionalComplicatorResult {
  description: string;
}

// Tabela: Complicador Adicional (d20)
// Elementos que agravam ou complexificam a situação original
export const SERVICE_ADDITIONAL_COMPLICATOR_TABLE: TableEntry<ServiceAdditionalComplicatorResult>[] =
  [
    {
      min: 1,
      max: 1,
      result: {
        description: "Um pouco de azar",
      },
    },
    {
      min: 2,
      max: 2,
      result: {
        description: "Um mal entendido",
      },
    },
    {
      min: 3,
      max: 3,
      result: {
        description: "Intervenção divina",
      },
    },
    {
      min: 4,
      max: 4,
      result: {
        description: "Ganância",
      },
    },
    {
      min: 5,
      max: 5,
      result: {
        description: "A quebra de uma maldição",
      },
    },
    {
      min: 6,
      max: 6,
      result: {
        description: "Um romance interrompido",
      },
    },
    {
      min: 7,
      max: 7,
      result: {
        description: "Traição",
      },
    },
    {
      min: 8,
      max: 8,
      result: {
        description: "O sumiço de um importante artefato",
      },
    },
    {
      min: 9,
      max: 9,
      result: {
        description: "Conflito entre facções",
      },
    },
    {
      min: 10,
      max: 10,
      result: {
        description: "Chantagem",
      },
    },
    {
      min: 11,
      max: 11,
      result: {
        description: "Dívida",
      },
    },
    {
      min: 12,
      max: 12,
      result: {
        description: "Um atraso inesperado",
      },
    },
    {
      min: 13,
      max: 13,
      result: {
        description: "Pressão do tempo",
      },
    },
    {
      min: 14,
      max: 14,
      result: {
        description: "Uma visita surpresa",
      },
    },
    {
      min: 15,
      max: 15,
      result: {
        description: "Incompetência",
      },
    },
    {
      min: 16,
      max: 16,
      result: {
        description: "Acidente inesperado",
      },
    },
    {
      min: 17,
      max: 17,
      result: {
        description: "Excesso de burocracia",
      },
    },
    {
      min: 18,
      max: 18,
      result: {
        description: "Interferência externa",
      },
    },
    {
      min: 19,
      max: 19,
      result: {
        description: "Mudança de planos",
      },
    },
    {
      min: 20,
      max: 20,
      result: {
        description: "Evento climático/desastre natural",
      },
    },
  ];

// ===== COMPLICAÇÕES DO SERVIÇO =====

// Interface para chance de complicações
interface ServiceComplicationChanceResult {
  hasComplication: boolean;
  description: string;
}

// Tabela: Chance de Complicações (d20)
export const SERVICE_COMPLICATION_CHANCE_TABLE: TableEntry<ServiceComplicationChanceResult>[] =
  [
    {
      min: 1,
      max: 14,
      result: {
        hasComplication: false,
        description: "Não",
      },
    },
    {
      min: 15,
      max: 20,
      result: {
        hasComplication: true,
        description: "Sim",
      },
    },
  ];

// Interface para tipos de complicações
interface ServiceComplicationTypeResult {
  description: string;
}

// Tabela: Tipos de Complicações (d20)
export const SERVICE_COMPLICATION_TYPE_TABLE: TableEntry<ServiceComplicationTypeResult>[] =
  [
    {
      min: 1,
      max: 1,
      result: {
        description: "Governo local desaprova",
      },
    },
    {
      min: 2,
      max: 2,
      result: {
        description: "Facção criminosa quer se aproveitar",
      },
    },
    {
      min: 3,
      max: 3,
      result: {
        description: "Ordem religiosa/arcana interessada",
      },
    },
    {
      min: 4,
      max: 4,
      result: {
        description: "Um rival do contratante fica enciumado",
      },
    },
    {
      min: 5,
      max: 5,
      result: {
        description: "Instituição de ofício afetada",
      },
    },
    {
      min: 6,
      max: 6,
      result: {
        description: "Humanoides hostis",
      },
    },
    {
      min: 7,
      max: 7,
      result: {
        description: "Evento local interfere no cronograma",
      },
    },
    {
      min: 8,
      max: 8,
      result: {
        description: "Animal ou mascote atrapalha",
      },
    },
    {
      min: 9,
      max: 9,
      result: {
        description: "Grupo de moradores se opõe",
      },
    },
    {
      min: 10,
      max: 10,
      result: {
        description: "Aliado do contratante discorda",
      },
    },
    {
      min: 11,
      max: 11,
      result: {
        description: "Autoridade exige supervisão extra",
      },
    },
    {
      min: 12,
      max: 12,
      result: {
        description: "Erro burocrático atrasa o andamento",
      },
    },
    {
      min: 13,
      max: 13,
      result: {
        description: "Grupo rival tenta sabotar discretamente",
      },
    },
    {
      min: 14,
      max: 14,
      result: {
        description: "Acidente causa danos leves",
      },
    },
    {
      min: 15,
      max: 15,
      result: {
        description: "Boato negativo se espalha",
      },
    },
    {
      min: 16,
      max: 16,
      result: {
        description: "Fiscal inesperado aparece",
      },
    },
    {
      min: 17,
      max: 17,
      result: {
        description: "Competidor oferece serviço mais barato",
      },
    },
    {
      min: 18,
      max: 18,
      result: {
        description: "Terceiros ocupam o local",
      },
    },
    {
      min: 19,
      max: 19,
      result: {
        description: "Pedido de alteração de última hora",
      },
    },
    {
      min: 20,
      max: 20,
      result: {
        description: "Role duas vezes e use ambos",
      },
    },
  ];

// Interface para consequências das complicações
interface ServiceComplicationConsequenceResult {
  description: string;
}

// Tabela: Consequências das Complicações (d20)
export const SERVICE_COMPLICATION_CONSEQUENCE_TABLE: TableEntry<ServiceComplicationConsequenceResult>[] =
  [
    {
      min: 1,
      max: 1,
      result: {
        description: "Entrará com medidas legais",
      },
    },
    {
      min: 2,
      max: 2,
      result: {
        description: "Manipulará as coisas por baixo dos panos",
      },
    },
    {
      min: 3,
      max: 3,
      result: {
        description: "Tentará te convencer a desistir",
      },
    },
    {
      min: 4,
      max: 4,
      result: {
        description: "Complicará sua vida caso seja bem-sucedido",
      },
    },
    {
      min: 5,
      max: 5,
      result: {
        description: "Abusará de seu poder para conseguir o que quer",
      },
    },
    {
      min: 6,
      max: 6,
      result: {
        description: "Usarão de violência para te impedir",
      },
    },
    {
      min: 7,
      max: 7,
      result: {
        description: "Contratante exigirá retrabalho",
      },
    },
    {
      min: 8,
      max: 8,
      result: {
        description: "Terá que negociar uma solução alternativa",
      },
    },
    {
      min: 9,
      max: 9,
      result: {
        description: "Dará ordens contraditórias",
      },
    },
    {
      min: 10,
      max: 10,
      result: {
        description: "Reclamações de terceiros",
      },
    },
    {
      min: 11,
      max: 11,
      result: {
        description: "Sumirá com documentos essenciais",
      },
    },
    {
      min: 12,
      max: 12,
      result: {
        description: "Fiscalização extra",
      },
    },
    {
      min: 13,
      max: 13,
      result: {
        description: "Vazará informações confidenciais",
      },
    },
    {
      min: 14,
      max: 14,
      result: {
        description: "Exigirá compensação simbólica",
      },
    },
    {
      min: 15,
      max: 15,
      result: {
        description: "Contratará concorrentes para atrapalhar",
      },
    },
    {
      min: 16,
      max: 16,
      result: {
        description: "Tentará atrasar o pagamento indefinidamente",
      },
    },
    {
      min: 17,
      max: 17,
      result: {
        description: "Espalhará fofocas sobre sua competência",
      },
    },
    {
      min: 18,
      max: 18,
      result: {
        description: "Fará exigências fora do escopo original",
      },
    },
    {
      min: 19,
      max: 19,
      result: {
        description: "Contratante exige garantia adicional",
      },
    },
    {
      min: 20,
      max: 20,
      result: {
        description: "Role duas vezes e use ambos",
      },
    },
  ];

// ===== RIVAIS =====

// Interface para chance de rivais
interface ServiceRivalChanceResult {
  hasRival: boolean;
  description: string;
}

// Tabela: Chance de Rivais (d20)
export const SERVICE_RIVAL_CHANCE_TABLE: TableEntry<ServiceRivalChanceResult>[] =
  [
    {
      min: 1,
      max: 18,
      result: {
        hasRival: false,
        description: "Não",
      },
    },
    {
      min: 19,
      max: 20,
      result: {
        hasRival: true,
        description: "Sim",
      },
    },
  ];

// Interface para ações do rival
interface ServiceRivalActionResult {
  description: string;
}

// Tabela: Ações do Rival (d20)
export const SERVICE_RIVAL_ACTION_TABLE: TableEntry<ServiceRivalActionResult>[] =
  [
    {
      min: 1,
      max: 5,
      result: {
        description: "Irá contra seu objetivo",
      },
    },
    {
      min: 6,
      max: 6,
      result: {
        description: "Fará a mesma coisa que você",
      },
    },
    {
      min: 7,
      max: 8,
      result: {
        description: "Sabota/Implanta armadilhas",
      },
    },
    {
      min: 9,
      max: 10,
      result: {
        description: "Roubará recursos importantes",
      },
    },
    {
      min: 11,
      max: 12,
      result: {
        description: "Tentará ficar com os créditos",
      },
    },
    {
      min: 13,
      max: 13,
      result: {
        description: "Espalha rumores maldosos",
      },
    },
    {
      min: 14,
      max: 14,
      result: {
        description: "Fingirá ser o contratado",
      },
    },
    {
      min: 15,
      max: 16,
      result: {
        description: "Dará dicas falsas sobre o serviço",
      },
    },
    {
      min: 17,
      max: 18,
      result: {
        description: "Oferecerá valiosas informações",
      },
    },
    {
      min: 19,
      max: 20,
      result: {
        description: "Tentará te subornar ou ameaçar",
      },
    },
  ];

// Interface para motivação do rival
interface ServiceRivalMotivationResult {
  description: string;
}

// Tabela: Motivação do Rival (d20)
export const SERVICE_RIVAL_MOTIVATION_TABLE: TableEntry<ServiceRivalMotivationResult>[] =
  [
    {
      min: 1,
      max: 1,
      result: {
        description: "Faz isso por amor",
      },
    },
    {
      min: 2,
      max: 2,
      result: {
        description: "Se atrapalha todo",
      },
    },
    {
      min: 3,
      max: 5,
      result: {
        description: "Faz isso porque precisa",
      },
    },
    {
      min: 6,
      max: 6,
      result: {
        description: "Busca reconhecimento",
      },
    },
    {
      min: 7,
      max: 8,
      result: {
        description: "Busca uma recompensa pessoal",
      },
    },
    {
      min: 9,
      max: 9,
      result: {
        description: "Está seguindo ordens de terceiros",
      },
    },
    {
      min: 10,
      max: 10,
      result: {
        description: "Faz isso por pura diversão",
      },
    },
    {
      min: 11,
      max: 11,
      result: {
        description: "Faz isso por vingança",
      },
    },
    {
      min: 12,
      max: 12,
      result: {
        description: "Está sob influência mágica ou mental",
      },
    },
    {
      min: 13,
      max: 13,
      result: {
        description: "Está tentando evitar um desastre maior",
      },
    },
    {
      min: 14,
      max: 14,
      result: {
        description: "Faz isso pelas crianças",
      },
    },
    {
      min: 15,
      max: 15,
      result: {
        description: "Se arrepende",
      },
    },
    {
      min: 16,
      max: 16,
      result: {
        description: "Desaparece depois disso",
      },
    },
    {
      min: 17,
      max: 17,
      result: {
        description: "No fundo gosta, e faz isso por você",
      },
    },
    {
      min: 18,
      max: 18,
      result: {
        description: "Faz isso porque te odeia",
      },
    },
    {
      min: 19,
      max: 19,
      result: {
        description: "Faz isso contra a vontade dele",
      },
    },
    {
      min: 20,
      max: 20,
      result: {
        description: "Na verdade é o contratante",
      },
    },
  ];

// ===== CONSTANTES E NOTAS EXPLICATIVAS =====

// Nota sobre uso das tabelas narrativas
export const SERVICE_NARRATIVE_ELEMENTS_NOTE =
  "Os elementos narrativos enriquecem significativamente a experiência dos serviços, " +
  "tornando-os mais interessantes e complexos. Use-os com moderação para manter " +
  "o equilíbrio entre simplicidade (característica dos serviços) e narrativa rica.";

// Nota sobre integração com objetivos
export const SERVICE_NARRATIVE_INTEGRATION_NOTE =
  "Estes elementos narrativos devem ser integrados organicamente com os objetivos " +
  "específicos gerados, criando uma história coesa e envolvente para os jogadores.";

// Exporta todas as tabelas como um objeto para facilitar importação
export const SERVICE_NARRATIVE_TABLES = {
  origin: SERVICE_ORIGIN_TABLE,
  additionalComplicator: SERVICE_ADDITIONAL_COMPLICATOR_TABLE,
  complicationChance: SERVICE_COMPLICATION_CHANCE_TABLE,
  complicationType: SERVICE_COMPLICATION_TYPE_TABLE,
  complicationConsequence: SERVICE_COMPLICATION_CONSEQUENCE_TABLE,
  rivalChance: SERVICE_RIVAL_CHANCE_TABLE,
  rivalAction: SERVICE_RIVAL_ACTION_TABLE,
  rivalMotivation: SERVICE_RIVAL_MOTIVATION_TABLE,
} as const;
