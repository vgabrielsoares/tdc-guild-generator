import type { TableEntry } from "@/types/tables";
import { ServiceObjectiveType } from "@/types/service";
import { rollOnTable } from "@/utils/tableRoller";

// ===== TABELAS DE OBJETIVOS DE SERVIÇOS =====

// ===== TABELA PRINCIPAL - TIPOS DE OBJETIVO (1d20) =====

/**
 * Interface para resultado da tabela principal de tipos de objetivo
 */
interface ServiceObjectiveTypeResult {
  type: ServiceObjectiveType;
  description: string;
  hasMultiple: boolean; // Para resultado 20 (role duas vezes)
}

/**
 * Tabela principal de tipos de objetivo para serviços
 * Conforme tabela "Tipos de Objetivo"
 */
export const SERVICE_OBJECTIVE_TYPE_TABLE: TableEntry<ServiceObjectiveTypeResult>[] =
  [
    {
      min: 1,
      max: 4,
      result: {
        type: ServiceObjectiveType.TREINAR_OU_ENSINAR,
        description: "Treinar ou ensinar",
        hasMultiple: false,
      },
    },
    {
      min: 5,
      max: 6,
      result: {
        type: ServiceObjectiveType.RECRUTAR,
        description: "Recrutar",
        hasMultiple: false,
      },
    },
    {
      min: 7,
      max: 8,
      result: {
        type: ServiceObjectiveType.CURAR_OU_RECUPERAR,
        description: "Curar ou recuperar",
        hasMultiple: false,
      },
    },
    {
      min: 9,
      max: 9,
      result: {
        type: ServiceObjectiveType.NEGOCIAR_OU_COAGIR,
        description: "Negociar ou coagir",
        hasMultiple: false,
      },
    },
    {
      min: 10,
      max: 12,
      result: {
        type: ServiceObjectiveType.AUXILIAR_OU_CUIDAR,
        description: "Auxiliar ou cuidar",
        hasMultiple: false,
      },
    },
    {
      min: 13,
      max: 14,
      result: {
        type: ServiceObjectiveType.EXTRAIR_RECURSOS,
        description: "Extrair recursos",
        hasMultiple: false,
      },
    },
    {
      min: 15,
      max: 16,
      result: {
        type: ServiceObjectiveType.CONSTRUIR_CRIAR_OU_REPARAR,
        description: "Construir, criar ou reparar",
        hasMultiple: false,
      },
    },
    {
      min: 17,
      max: 17,
      result: {
        type: ServiceObjectiveType.SERVICOS_ESPECIFICOS,
        description: "Serviços específicos",
        hasMultiple: false,
      },
    },
    {
      min: 18,
      max: 19,
      result: {
        type: ServiceObjectiveType.RELIGIOSO,
        description: "Religioso",
        hasMultiple: false,
      },
    },
    {
      min: 20,
      max: 20,
      result: {
        type: ServiceObjectiveType.MULTIPLO,
        description: "Role duas vezes e use ambos",
        hasMultiple: true,
      },
    },
  ];

// ===== INTERFACE PARA TABELAS DE TRÊS COLUNAS =====

/**
 * Interface específica para entradas de tabelas de objetivos com três colunas
 * Cada objetivo tem: Ação (o que) + Alvo (para quem/que) + Complicação (mas...)
 */
interface ThreeColumnObjectiveEntry {
  action: string; // Primeira coluna: o que fazer
  target: string; // Segunda coluna: para quem/que
  complication: string; // Terceira coluna: mas... (complicação)
}

/**
 * Tipo para tabelas de três colunas de objetivos
 * Cada entrada mapeia um número de 1d20 para um resultado de três colunas
 */
type ThreeColumnObjectiveTable = TableEntry<ThreeColumnObjectiveEntry>[];

// ===== TREINAR OU ENSINAR (d20 x 3 colunas) =====

/**
 * Tabela de "Treinar ou Ensinar"
 * Sistema de três colunas: [Treinar ou ensinar] + [Para...] + [Mas...]
 *
 * Exemplo de uso: rolagem 3, 5, 2 = "Treinar ou ensinar a arte do combate para crianças órfãs, mas o conhecimento será usado contra você."
 */
export const TRAIN_OR_TEACH_TABLE: ThreeColumnObjectiveTable = [
  {
    min: 1,
    max: 1,
    result: {
      action: "Uma nova língua",
      target: "Uma besta",
      complication: "Contra a vontade/discorda de tudo",
    },
  },
  {
    min: 2,
    max: 2,
    result: {
      action: "Uma perícia",
      target: "Um humanoide nada habilidoso",
      complication: "O conhecimento será usado contra você",
    },
  },
  {
    min: 3,
    max: 3,
    result: {
      action: "A arte do combate",
      target: "Um humanoide hostil",
      complication: "Trauma sobre o que será ensinado",
    },
  },
  {
    min: 4,
    max: 4,
    result: {
      action: "Arcanismo/magias",
      target: "Criança desinteressada",
      complication: "O ambiente é cheio de distrações",
    },
  },
  {
    min: 5,
    max: 5,
    result: {
      action: "Boas maneiras",
      target: "Para crianças órfãs",
      complication: "O treinado tem dificuldade de aprendizado",
    },
  },
  {
    min: 6,
    max: 6,
    result: {
      action: "Conhecimentos gerais",
      target: "Combatentes",
      complication: "O conhecimento é proibido no local",
    },
  },
  {
    min: 7,
    max: 7,
    result: {
      action: "Técnicas de sobrevivência",
      target: "Um grupo de viajantes",
      complication: "O ambiente dificulta o aprendizado",
    },
  },
  {
    min: 8,
    max: 8,
    result: {
      action: "Música ou arte",
      target: "Um aprendiz entusiasmado",
      complication: "O material disponível é inadequado",
    },
  },
  {
    min: 9,
    max: 9,
    result: {
      action: "Etiqueta profissional",
      target: "Um comerciante inexperiente",
      complication: "O treinado é muito distraído",
    },
  },
  {
    min: 10,
    max: 10,
    result: {
      action: "Uso de ferramentas simples",
      target: "Um grupo de trabalhadores",
      complication: "O tempo para ensinar é muito curto",
    },
  },
  {
    min: 11,
    max: 11,
    result: {
      action: "Culinária básica",
      target: "Um grupo de idosos",
      complication: "Ingredientes ou utensílios estão em falta",
    },
  },
  {
    min: 12,
    max: 12,
    result: {
      action: "Jardinagem ou cultivo",
      target: "Crianças curiosas",
      complication: "O treinado tenta ensinar de volta, mas de forma errada",
    },
  },
  {
    min: 13,
    max: 13,
    result: {
      action: "Primeiros socorros",
      target: "Um animal de estimação",
      complication: "O aprendiz faz perguntas demais e atrasa tudo",
    },
  },
  {
    min: 14,
    max: 14,
    result: {
      action: "Contar histórias",
      target: "Um grupo de forasteiros",
      complication: "O treinado prefere outro método",
    },
  },
  {
    min: 15,
    max: 15,
    result: {
      action: "Escrever e ler",
      target: "Um aprendiz adulto",
      complication: "O aprendiz tem bloqueio ou vergonha",
    },
  },
  {
    min: 16,
    max: 16,
    result: {
      action: "Negociação e barganha",
      target: "Um grupo de mercadores",
      complication: "O treinado questiona a utilidade do que está aprendendo",
    },
  },
  {
    min: 17,
    max: 17,
    result: {
      action: "Cuidar de animais",
      target: "Um camponês inexperiente",
      complication: "O resultado é melhor do que o esperado (mas causa inveja)",
    },
  },
  {
    min: 18,
    max: 18,
    result: {
      action: "Empreendedorismo",
      target: "Um grupo religioso",
      complication: "O treinado se apega demais ao instrutor",
    },
  },
  {
    min: 19,
    max: 19,
    result: {
      action: "Técnicas de limpeza",
      target: "Um grupo de jovens",
      complication:
        "O conhecimento ensinado entra em conflito com crenças pessoais",
    },
  },
  {
    min: 20,
    max: 20,
    result: {
      action: "Jogos e esportes simples",
      target: "Um grupo de crianças",
      complication: "O treinado espera recompensas extras para se dedicar",
    },
  },
];

// ===== RECRUTAR (d20 x 3 colunas) =====

/**
 * Tabela de "Recrutar"
 * Sistema de três colunas: [Recrutar] + [Para...] + [Mas...]
 */
export const RECRUIT_TABLE: ThreeColumnObjectiveTable = [
  {
    min: 1,
    max: 1,
    result: {
      action: "Combatentes",
      target: "Contrato específico",
      complication: "Vai contra os princípios do recrutado",
    },
  },
  {
    min: 2,
    max: 2,
    result: {
      action: "Conjurador experiente",
      target: "Explorar terras remotas",
      complication: "O recrutado é fundamental",
    },
  },
  {
    min: 3,
    max: 3,
    result: {
      action: "Especialista",
      target: "Localizar um artefato",
      complication: "Não há boas escolhas",
    },
  },
  {
    min: 4,
    max: 4,
    result: {
      action: "Aristocrata de menor nobreza",
      target: "Um sindicato/associação",
      complication: "O recrutado não entende a língua local",
    },
  },
  {
    min: 5,
    max: 5,
    result: {
      action: "Trabalhador braçal",
      target: "Fazer um acordo",
      complication: "O recrutado não tem interesse",
    },
  },
  {
    min: 6,
    max: 6,
    result: {
      action: "Uma bruxa",
      target: "Trabalhar em um evento",
      complication: "O recrutado não gosta de trabalhar com outros",
    },
  },
  {
    min: 7,
    max: 7,
    result: {
      action: "Curandeiro",
      target: "Cobrir ausência temporária",
      complication: "O local é insalubre",
    },
  },
  {
    min: 8,
    max: 8,
    result: {
      action: "Artesão",
      target: "Cuidar de feridos",
      complication: "O prazo é apertado",
    },
  },
  {
    min: 9,
    max: 9,
    result: {
      action: "Mensageiro",
      target: "Reforçar uma equipe existente",
      complication: "O recrutado é emocionalmente instável",
    },
  },
  {
    min: 10,
    max: 10,
    result: {
      action: "Músico",
      target: "Produzir itens simples",
      complication: "O recrutado tem uma condição de saúde debilitante",
    },
  },
  {
    min: 11,
    max: 11,
    result: {
      action: "Cozinheiro",
      target: "Preparar refeições",
      complication: "O recrutado exige condições especiais para aceitar",
    },
  },
  {
    min: 12,
    max: 12,
    result: {
      action: "Guardião",
      target: "Entregar correspondências",
      complication: "O local é mal frequentado",
    },
  },
  {
    min: 13,
    max: 13,
    result: {
      action: "Instrutor",
      target: "Ensinar uma habilidade",
      complication: "Exige discrição absoluta",
    },
  },
  {
    min: 14,
    max: 14,
    result: {
      action: "Agricultor",
      target: "Ajudar na colheita",
      complication: "O clima não colabora",
    },
  },
  {
    min: 15,
    max: 15,
    result: {
      action: "Navegador",
      target: "Ajudar em campanha social",
      complication: "Pode atrair atenção indesejada",
    },
  },
  {
    min: 16,
    max: 16,
    result: {
      action: "Bibliotecário",
      target: "Pequena reforma",
      complication: "Exige a aprovação de uma autoridade local",
    },
  },
  {
    min: 17,
    max: 17,
    result: {
      action: "Pintor",
      target: "Proteger um local",
      complication: "Depende de um item ou ferramenta específica",
    },
  },
  {
    min: 18,
    max: 18,
    result: {
      action: "Alfaiate",
      target: "Animar uma celebração",
      complication: "O recrutado tem uma agenda oculta",
    },
  },
  {
    min: 19,
    max: 19,
    result: {
      action: "Pedreiro",
      target: "Guiar uma caravana",
      complication: "Ferramentas estão danificadas",
    },
  },
  {
    min: 20,
    max: 20,
    result: {
      action: "Voluntário",
      target: "Supervisionar tarefa delicada",
      complication: "O recrutado tem outros compromissos",
    },
  },
];

// ===== CURAR OU RECUPERAR (d20 x 3 colunas) =====

/**
 * Tabela de "Curar ou Recuperar"
 * Sistema de três colunas: [Curar ou recuperar] + [De...] + [Mas...]
 */
export const HEAL_OR_RECOVER_TABLE: ThreeColumnObjectiveTable = [
  {
    min: 1,
    max: 1,
    result: {
      action: "Doença contagiosa",
      target: "Bestas enfermas",
      complication: "O afetado não colabora",
    },
  },
  {
    min: 2,
    max: 2,
    result: {
      action: "Lesão/doença/cicatriz",
      target: "Humanoide amargurado",
      complication: "Tem outra doença que atrapalha",
    },
  },
  {
    min: 3,
    max: 3,
    result: {
      action: "Moral/reputação",
      target: "Crianças debilitadas",
      complication: "Não existe cura/não tem jeito",
    },
  },
  {
    min: 4,
    max: 4,
    result: {
      action: "Bugiganga que criou vida",
      target: "Um engenhoqueiro",
      complication: "Cria-se um laço sentimental muito forte",
    },
  },
  {
    min: 5,
    max: 5,
    result: {
      action: "O psicológico",
      target: "Velhos bisbilhoteiros",
      complication: "O problema passa para quem o resolveu",
    },
  },
  {
    min: 6,
    max: 6,
    result: {
      action: "Um vício",
      target: "Criatura hostil",
      complication: "Outro especialista discorda de você",
    },
  },
  {
    min: 7,
    max: 7,
    result: {
      action: "Fadiga extrema",
      target: "Trabalhadores exaustos",
      complication: "Precisa ser realizado em um local específico",
    },
  },
  {
    min: 8,
    max: 8,
    result: {
      action: "Perda de memória",
      target: "Um ancião",
      complication: "Requer a aprovação de uma autoridade local",
    },
  },
  {
    min: 9,
    max: 9,
    result: {
      action: "Medo irracional",
      target: "Um aprendiz",
      complication: "Precisa ser realizado durante um evento específico",
    },
  },
  {
    min: 10,
    max: 10,
    result: {
      action: "Falta de motivação",
      target: "Um grupo de jovens",
      complication: "O ambiente é desestimulante",
    },
  },
  {
    min: 11,
    max: 11,
    result: {
      action: "Pequenas feridas",
      target: "Crianças brincalhonas",
      complication: "Depende de um item ou ferramenta específica",
    },
  },
  {
    min: 12,
    max: 12,
    result: {
      action: "Ressaca",
      target: "Um grupo de festeiros",
      complication: "Exige um sacrifício simbólico ou literal",
    },
  },
  {
    min: 13,
    max: 13,
    result: {
      action: "Rouquidão",
      target: "Um bardo",
      complication: "Pode causar uma mudança temporária de personalidade.",
    },
  },
  {
    min: 14,
    max: 14,
    result: {
      action: "Dificuldade de aprendizado",
      target: "Um estudante",
      complication: "O método não funciona",
    },
  },
  {
    min: 15,
    max: 15,
    result: {
      action: "Dores crônicas",
      target: "Um trabalhador",
      complication: "O trabalho exige esforço contínuo",
    },
  },
  {
    min: 16,
    max: 16,
    result: {
      action: "Falta de apetite",
      target: "Um animal de estimação",
      complication: "O paciente fica obcecado por quem o ajudou",
    },
  },
  {
    min: 17,
    max: 17,
    result: {
      action: "Insônia",
      target: "Um comerciante",
      complication: "Precisa ser feito em segredo",
    },
  },
  {
    min: 18,
    max: 18,
    result: {
      action: "Venenos ou toxinas",
      target: "Um grupo de aventureiros",
      complication: "Já tentou antes e desenvolveu resistência",
    },
  },
  {
    min: 19,
    max: 19,
    result: {
      action: "Visão, audição ou outro sentido",
      target: "Um idoso",
      complication: "O paciente mente sobre seus sintomas",
    },
  },
  {
    min: 20,
    max: 20,
    result: {
      action: "Falta de fé",
      target: "Um religioso",
      complication: "O líder local desaprova a ajuda",
    },
  },
];

// ===== NEGOCIAR OU COAGIR (d20 x 3 colunas) =====

/**
 * Tabela de "Negociar ou Coagir"
 * Sistema de três colunas: [Negociar ou coagir] + [Para...] + [Mas...]
 */
export const NEGOTIATE_OR_COERCE_TABLE: ThreeColumnObjectiveTable = [
  {
    min: 1,
    max: 1,
    result: {
      action: "Mercadores locais",
      target: "Assinar um contrato",
      complication: "Isso afetará seus familiares",
    },
  },
  {
    min: 2,
    max: 2,
    result: {
      action: "Um nobre poderoso",
      target: "Vender suas terras",
      complication: "Por ganância do contratante",
    },
  },
  {
    min: 3,
    max: 3,
    result: {
      action: "Plebeu miserável",
      target: "Flexibilizar um acerto de contas",
      complication: "A contra-proposta é desleal",
    },
  },
  {
    min: 4,
    max: 4,
    result: {
      action: "Aventureiros",
      target: "Desocuparem um local",
      complication: "O assentamento sofrerá com isso",
    },
  },
  {
    min: 5,
    max: 5,
    result: {
      action: "Criatura hostil",
      target: "Espalhar informação (falsa ou não)",
      complication: "Humanoides irão pôr sua vida em risco",
    },
  },
  {
    min: 6,
    max: 6,
    result: {
      action: "Religioso",
      target: "Distribuir riquezas",
      complication: "Começam a achar que você é um criminoso",
    },
  },
  {
    min: 7,
    max: 7,
    result: {
      action: "Artesão",
      target: "Reduzir preços",
      complication: "O contratante tem segundas intenções",
    },
  },
  {
    min: 8,
    max: 8,
    result: {
      action: "Crianças",
      target: "Evitar um conflito iminente",
      complication: "O contratante não revelou todos os detalhes",
    },
  },
  {
    min: 9,
    max: 9,
    result: {
      action: "Guardas",
      target: "Ignorar uma infração",
      complication: "O alvo está sendo vigiado por um terceiro",
    },
  },
  {
    min: 10,
    max: 10,
    result: {
      action: "Comerciante itinerante",
      target: "Obter apoio financeiro ou político",
      complication: "Insiste em selar o pacto com um beijo",
    },
  },
  {
    min: 11,
    max: 11,
    result: {
      action: "Grupo de artistas",
      target: "Fornecer informações privilegiadas",
      complication: "O alvo é hostil",
    },
  },
  {
    min: 12,
    max: 12,
    result: {
      action: "Pescadores",
      target: "Compartilhar técnicas",
      complication: "Segredos de família estão em jogo",
    },
  },
  {
    min: 13,
    max: 13,
    result: {
      action: "Estudantes",
      target: "Aceitar novas regras",
      complication: "Pode ser visto como um ato de traição",
    },
  },
  {
    min: 14,
    max: 14,
    result: {
      action: "Caçadores",
      target: "Abandonar uma tradição prejudicial",
      complication: "Só aceita se resolver um problema dele primeiro",
    },
  },
  {
    min: 15,
    max: 15,
    result: {
      action: "Um grupo de idosos",
      target: "Participar de evento",
      complication: "O alvo acredita que isso é um teste de lealdade",
    },
  },
  {
    min: 16,
    max: 16,
    result: {
      action: "Um mago",
      target: "Evitar espalhar informação (falsa ou não)",
      complication: "O contratante exige uma identidade falsa",
    },
  },
  {
    min: 17,
    max: 17,
    result: {
      action: "Um grupo de turistas",
      target: "Respeitar costumes locais",
      complication: "Não entendem a língua",
    },
  },
  {
    min: 18,
    max: 18,
    result: {
      action: "Um sindicato",
      target: "Aceitar acordo",
      complication: "O alvo não pode tomar decisões sozinho",
    },
  },
  {
    min: 19,
    max: 19,
    result: {
      action: "Um rival comercial",
      target: "Fazer uma parceria",
      complication: "Desconfia das intenções",
    },
  },
  {
    min: 20,
    max: 20,
    result: {
      action: "Um grupo de jovens",
      target: "Participar de campanha social",
      complication: "Acham a causa desinteressante",
    },
  },
];

// ===== AUXILIAR OU CUIDAR (d20 x 3 colunas) =====

/**
 * Tabela de "Auxiliar ou Cuidar"
 * Sistema de três colunas: [Auxiliar ou cuidar de...] + [Em...] + [Mas...]
 */
export const AUXILIAR_OU_CUIDAR_TABLE: ThreeColumnObjectiveTable = [
  {
    min: 1,
    max: 1,
    result: {
      action: "Orfanato",
      target: "Na colheita",
      complication: "O responsável principal está ausente",
    },
  },
  {
    min: 2,
    max: 2,
    result: {
      action: "Plebeu trabalhador",
      target: "Em uma infestação",
      complication: "Tudo está comprometido",
    },
  },
  {
    min: 3,
    max: 3,
    result: {
      action: "Ordem religiosa",
      target: "Distribuir mantimentos",
      complication: "Os recursos são insuficientes",
    },
  },
  {
    min: 4,
    max: 4,
    result: {
      action: "Instituição de ofício",
      target: "Assuntos burocráticos",
      complication: "Não contaram toda a verdade",
    },
  },
  {
    min: 5,
    max: 5,
    result: {
      action: "Governo local",
      target: "Abater e preparar animais",
      complication: "A interferência de bestas atrapalha",
    },
  },
  {
    min: 6,
    max: 6,
    result: {
      action: "Turistas/forasteiros",
      target: "Gerenciar estabelecimento",
      complication: "Você descobre um esquema de corrupção",
    },
  },
  {
    min: 7,
    max: 7,
    result: {
      action: "Crianças",
      target: "Cuidar de jardins ou estufas",
      complication: "Há uma importante inspeção surpresa",
    },
  },
  {
    min: 8,
    max: 8,
    result: {
      action: "Idosos",
      target: "Consertar estruturas simples",
      complication: "O clima não é adequado",
    },
  },
  {
    min: 9,
    max: 9,
    result: {
      action: "Estudantes",
      target: "Preparar para provas",
      complication: "Recursos foram danificados por um acidente",
    },
  },
  {
    min: 10,
    max: 10,
    result: {
      action: "Comerciantes",
      target: "Inventário de mercadorias",
      complication: "Uma pessoa-chave insiste em mudar o plano",
    },
  },
  {
    min: 11,
    max: 11,
    result: {
      action: "Animais de estimação",
      target: "Banho (e/ou tosa)",
      complication: "O contratante exige discrição absoluta",
    },
  },
  {
    min: 12,
    max: 12,
    result: {
      action: "Grupo de aventureiros",
      target: "Planejar viagem",
      complication: "Exige ferramentas específicas",
    },
  },
  {
    min: 13,
    max: 13,
    result: {
      action: "Artistas",
      target: "Alimentar animais",
      complication: "Há resistência a mudanças",
    },
  },
  {
    min: 14,
    max: 14,
    result: {
      action: "Agricultores",
      target: "No plantio",
      complication: "É preciso seguir regras excessivamente rígidas",
    },
  },
  {
    min: 15,
    max: 15,
    result: {
      action: "Pescadores",
      target: "Limpar equipamentos",
      complication: "Ferramentas estão degradadas",
    },
  },
  {
    min: 16,
    max: 16,
    result: {
      action: "Grupo de jovens",
      target: "Organizar evento cultural",
      complication: "Precisa feito em horários específicos",
    },
  },
  {
    min: 17,
    max: 17,
    result: {
      action: "Professores",
      target: "Corrigir provas",
      complication: "Deve ser feito sem contato direto com o alvo",
    },
  },
  {
    min: 18,
    max: 18,
    result: {
      action: "Voluntários",
      target: "Limpar e reorganizar um espaço",
      complication: "A demanda é maior que o esperado",
    },
  },
  {
    min: 19,
    max: 19,
    result: {
      action: "Taberneiro",
      target: "Ensaiar apresentação",
      complication: "O alvo está em constante deslocamento",
    },
  },
  {
    min: 20,
    max: 20,
    result: {
      action: "Refugiados",
      target: "Resolver disputa",
      complication: "O alvo exige discrição absoluta",
    },
  },
];

// ===== EXTRAIR RECURSOS (d20 x 3 colunas) =====

/**
 * Tabela de "Extrair Recursos"
 * Sistema de três colunas: [Extrair...] + [De...] + [Mas...]
 */
export const EXTRAIR_RECURSOS_TABLE: ThreeColumnObjectiveTable = [
  {
    min: 1,
    max: 2,
    result: {
      action: "Mineral metálico",
      target: "Poço",
      complication: "O local está infestado/ocupado",
    },
  },
  {
    min: 3,
    max: 5,
    result: {
      action: "Extrativismo vegetal",
      target: "Local condenado/abandonado",
      complication: "Exige ferramentas caras e específicas",
    },
  },
  {
    min: 6,
    max: 8,
    result: {
      action: "Extrativismo animal",
      target: "Clareira",
      complication: "Clima adverso dificulta",
    },
  },
  {
    min: 9,
    max: 12,
    result: {
      action: "Material comum",
      target: "Ambiente selvagem",
      complication: "O acesso é perigoso",
    },
  },
  {
    min: 13,
    max: 14,
    result: {
      action: "Especiaria",
      target: "Caverna",
      complication: "O local é instável",
    },
  },
  {
    min: 15,
    max: 15,
    result: {
      action: "Componente mágico",
      target: "Ruínas antigas",
      complication: "O local/ação é nojenta e/ou humilhante",
    },
  },
  {
    min: 16,
    max: 16,
    result: {
      action: "Plantas medicinais",
      target: "Abismo/ravina",
      complication: "Ambiente de condição extrema",
    },
  },
  {
    min: 17,
    max: 18,
    result: {
      action: "Mineral não-metálico",
      target: "Pântano",
      complication: "O cheiro é insuportável",
    },
  },
  {
    min: 19,
    max: 19,
    result: {
      action: "Cogumelos",
      target: "Covil",
      complication: "Há veneno ou toxinas",
    },
  },
  {
    min: 20,
    max: 20,
    result: {
      action: "Role duas vezes e use ambos",
      target: "Submerso",
      complication: "O local é protegido por encantos",
    },
  },
];

// ===== CONSTRUIR, CRIAR OU REPARAR (d20 x 3 colunas) =====

/**
 * Tabela de "Construir, Criar ou Reparar"
 * Sistema de três colunas: [Construir/Criar/Reparar...] + [Para...] + [Mas...]
 */
export const CONSTRUIR_CRIAR_OU_REPARAR_TABLE: ThreeColumnObjectiveTable = [
  {
    min: 1,
    max: 1,
    result: {
      action: "Construção histórica",
      target: "Instituição de caridade",
      complication: "Recursos adquiridos de maneira ilegal",
    },
  },
  {
    min: 2,
    max: 2,
    result: {
      action: "Estrada",
      target: "Nobre poderoso",
      complication: "Roubam os materiais/ferramentas",
    },
  },
  {
    min: 3,
    max: 3,
    result: {
      action: "Ponte",
      target: "Líder local",
      complication: "Outro especialista discorda de você",
    },
  },
  {
    min: 4,
    max: 4,
    result: {
      action: "Torre/fortaleza/muralha/proteção",
      target: "Adepto religioso/arcano",
      complication: "O serviço deve ser perfeito",
    },
  },
  {
    min: 5,
    max: 5,
    result: {
      action: "Estabelecimento/moradia",
      target: "Um marinheiro/corsário",
      complication: "O local é afastado e inóspito",
    },
  },
  {
    min: 6,
    max: 6,
    result: {
      action: "Um relacionamento",
      target: "Uma organização",
      complication: "Deve ser feito em segredo/escondido",
    },
  },
  {
    min: 7,
    max: 7,
    result: {
      action: "Ferramenta agrícola",
      target: "Agricultor",
      complication: "O material é de baixa qualidade",
    },
  },
  {
    min: 8,
    max: 8,
    result: {
      action: "Instrumento musical",
      target: "Grupo de artistas",
      complication: "Medidas erradas foram passadas",
    },
  },
  {
    min: 9,
    max: 9,
    result: {
      action: "Roupas/uniformes",
      target: "Escola local",
      complication: "O clima atrapalha o trabalho",
    },
  },
  {
    min: 10,
    max: 10,
    result: {
      action: "Brinquedos",
      target: "Crianças",
      complication: "O espaço disponível é menor do que o planejado",
    },
  },
  {
    min: 11,
    max: 11,
    result: {
      action: "Poço ou cisterna",
      target: "Comunidade local",
      complication: "O projeto precisa seguir normas rígidas",
    },
  },
  {
    min: 12,
    max: 12,
    result: {
      action: "Mural ou pintura",
      target: "Governo",
      complication: "O contratante exige personalização exclusiva",
    },
  },
  {
    min: 13,
    max: 13,
    result: {
      action: "Veículo",
      target: "Comerciante itinerante",
      complication: "O trabalho será supervisionado por um avaliador rigoroso",
    },
  },
  {
    min: 14,
    max: 14,
    result: {
      action: "Estátua",
      target: "Templo local",
      complication: "O local é compartilhado com outros grupos",
    },
  },
  {
    min: 15,
    max: 15,
    result: {
      action: "Jardim",
      target: "Casa de idosos",
      complication: "O projeto deve ser silencioso durante a execução",
    },
  },
  {
    min: 16,
    max: 16,
    result: {
      action: "Aqueduto",
      target: "Pescador",
      complication: "O contratante exige documentação detalhada do processo",
    },
  },
  {
    min: 17,
    max: 17,
    result: {
      action: "Ferramenta de ofício",
      target: "Taverneiro",
      complication: "O trabalho precisa agradar várias partes em desacordo",
    },
  },
  {
    min: 18,
    max: 18,
    result: {
      action: "Barco",
      target: "Hospital/Enfermaria",
      complication: "Há pressa excessiva para entrega",
    },
  },
  {
    min: 19,
    max: 19,
    result: {
      action: "Mobília",
      target: "Viajantes",
      complication: "É necessário reutilizar peças/partes/materiais velhos",
    },
  },
  {
    min: 20,
    max: 20,
    result: {
      action: "Armas/Armaduras",
      target: "Mercado local",
      complication:
        "Um detalhe estético é mais importante que a funcionalidade",
    },
  },
];

// ===== SERVIÇOS ESPECÍFICOS (d20 x 3 colunas) =====

/**
 * Tabela de "Serviços Específicos"
 * Sistema de três colunas: [Serviços específicos...] + [De...] + [Mas...]
 */
export const SERVICOS_ESPECIFICOS_TABLE: ThreeColumnObjectiveTable = [
  {
    min: 1,
    max: 1,
    result: {
      action: "Limpar construção/local",
      target: "Um nobre soberbo",
      complication: "Alguém tenta constantemente dar ordens conflitantes",
    },
  },
  {
    min: 2,
    max: 2,
    result: {
      action: "Cobrar impostos/dívidas",
      target: "Um humanoide ranzinza",
      complication: "Deve ser feito durante a madrugada",
    },
  },
  {
    min: 3,
    max: 3,
    result: {
      action: "Criar/ajudar em um evento",
      target: "Um mercador",
      complication: "Um humanoide insiste em te atrapalhar",
    },
  },
  {
    min: 4,
    max: 4,
    result: {
      action: "Desmentir boatos/fofocas",
      target: "Um grupo de guardas",
      complication: "Você está constantemente sendo vigiado",
    },
  },
  {
    min: 5,
    max: 5,
    result: {
      action: "Traduzir/transcrever material",
      target: "Uma criatura muito desconfiada",
      complication: "local é de difícil acesso",
    },
  },
  {
    min: 6,
    max: 6,
    result: {
      action: "Trabalho rural",
      target: "Um criminoso/mafioso",
      complication: "Vai contra a moral e os bons costumes",
    },
  },
  {
    min: 7,
    max: 7,
    result: {
      action: "Organizar arquivos/livros",
      target: "Um estudioso",
      complication: "Muitos recursos estão danificados",
    },
  },
  {
    min: 8,
    max: 8,
    result: {
      action: "Pintar estrutura",
      target: "Um comerciante",
      complication: "Recursos são de má qualidade",
    },
  },
  {
    min: 9,
    max: 9,
    result: {
      action: "Consertar instrumento musical",
      target: "Um artista local",
      complication: "Itens necessários estão espalhados por vários locais",
    },
  },
  {
    min: 10,
    max: 10,
    result: {
      action: "Preparar refeição comunitária",
      target: "Um grupo de voluntários",
      complication: "Recursos são insuficientes",
    },
  },
  {
    min: 11,
    max: 11,
    result: {
      action: "Ajudar em mudança",
      target: "Uma família",
      complication: "Um visitante inesperado altera os planos",
    },
  },
  {
    min: 12,
    max: 12,
    result: {
      action: "Cuidar de jardim",
      target: "Um idoso",
      complication: "Criaturas estão doentes",
    },
  },
  {
    min: 13,
    max: 13,
    result: {
      action: "Realizar inventário/catalogar coleções",
      target: "Um colecionar excêntrico",
      complication: "Exige transporte de itens frágeis",
    },
  },
  {
    min: 14,
    max: 14,
    result: {
      action: "Entregar correspondência ou pacotes",
      target: "Um grupo de artesões",
      complication: "O espaço é pequeno",
    },
  },
  {
    min: 15,
    max: 15,
    result: {
      action: "Fazer reparos em móveis",
      target: "Um taverneiro",
      complication: "Exige que não haja desperdício",
    },
  },
  {
    min: 16,
    max: 16,
    result: {
      action: "Ajudar em feira",
      target: "Um camponês",
      complication: "O tempo está instável",
    },
  },
  {
    min: 17,
    max: 17,
    result: {
      action: "Preparar decoração",
      target: "Um grupo religioso",
      complication: "O material é frágil",
    },
  },
  {
    min: 18,
    max: 18,
    result: {
      action: "Ajudar em campanha",
      target: "Um curandeiro",
      complication: "Depende de autorização prévia",
    },
  },
  {
    min: 19,
    max: 19,
    result: {
      action: "Supervisionar transporte de carga",
      target: "Um grupo de crianças",
      complication: "Exige uso de uniforme específico",
    },
  },
  {
    min: 20,
    max: 20,
    result: {
      action: "Cuidar de mascote",
      target: "Um grupo de jovens aprendizes",
      complication: "Há uma criatura hiperativa",
    },
  },
];

// ===== TRABALHO RURAL (d20) - Tabela Auxiliar =====

/**
 * Tabela auxiliar para quando o resultado for "Trabalho rural"
 * Expande o tipo específico de trabalho rural
 */
export const TRABALHO_RURAL_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Pecuária" },
  { min: 2, max: 2, result: "Lavoura" },
  { min: 3, max: 3, result: "Horticultura" },
  { min: 4, max: 4, result: "Produtos florestais" },
  { min: 5, max: 5, result: "Apicultura" },
  { min: 6, max: 6, result: "Extrativismo" },
  { min: 7, max: 7, result: "Avicultura" },
  { min: 8, max: 8, result: "Irrigação" },
  { min: 9, max: 9, result: "Cuidar do Esterco/Adubo" },
  { min: 10, max: 10, result: "Plantio de mudas" },
  { min: 11, max: 11, result: "Colheita" },
  { min: 12, max: 12, result: "Manutenção de cercas" },
  { min: 13, max: 13, result: "Controle de pragas" },
  { min: 14, max: 14, result: "Semeadura" },
  { min: 15, max: 15, result: "Limpeza de pastos" },
  { min: 16, max: 16, result: "Ordenha" },
  { min: 17, max: 17, result: "Transporte de produtos rurais" },
  { min: 18, max: 18, result: "Seleção de sementes" },
  { min: 19, max: 19, result: "Cuidado de viveiros" },
  { min: 20, max: 20, result: "Reflorestamento" },
];

// ===== RELIGIOSO (d20 x 3 colunas) =====

/**
 * Tabela de "Religioso"
 * Sistema de três colunas: [Religioso...] + [O que/quem?] + [Mas...]
 */
export const RELIGIOSO_TABLE: ThreeColumnObjectiveTable = [
  {
    min: 1,
    max: 1,
    result: {
      action: "Pregar em praça pública",
      target: "Um herói ancestral",
      complication: "Envolve um ritual macabro",
    },
  },
  {
    min: 2,
    max: 2,
    result: {
      action: "Converter/purificar",
      target: "Toda uma vila/culto",
      complication: "Rumores preveem uma tragédia",
    },
  },
  {
    min: 3,
    max: 3,
    result: {
      action: "Retirar maldição",
      target: "Um condenado",
      complication: "Há uma maldição",
    },
  },
  {
    min: 4,
    max: 4,
    result: {
      action: "Ministrar um evento religioso",
      target: "Artefato mágico vivo",
      complication: "O líder local desaprova",
    },
  },
  {
    min: 5,
    max: 5,
    result: {
      action: "Fazer um exorcismo",
      target: "Nobre poderoso",
      complication: "Cultistas te observam",
    },
  },
  {
    min: 6,
    max: 6,
    result: {
      action: "Administrar um templo",
      target: "Outros aventureiros",
      complication: "Um charlatão tenta se aproveitar",
    },
  },
  {
    min: 7,
    max: 7,
    result: {
      action: "Organizar procissão",
      target: "Comunidade local",
      complication: "O clima está ruim",
    },
  },
  {
    min: 8,
    max: 8,
    result: {
      action: "Preparar oferenda",
      target: "Divindade menor",
      complication: "Um falso profeta surge",
    },
  },
  {
    min: 9,
    max: 9,
    result: {
      action: "Ensinar cânticos",
      target: "Crianças do vilarejo",
      complication: "Símbolos religiosos foram roubados",
    },
  },
  {
    min: 10,
    max: 10,
    result: {
      action: "Restaurar altar",
      target: "Templo antigo",
      complication: "O local é de difícil acesso",
    },
  },
  {
    min: 11,
    max: 11,
    result: {
      action: "Abençoar colheita",
      target: "Agricultores",
      complication: "Recursos são considerados impuros",
    },
  },
  {
    min: 12,
    max: 12,
    result: {
      action: "Realizar batismo",
      target: "Grupo de jovens",
      complication: "Ofende outra religião/divindade",
    },
  },
  {
    min: 13,
    max: 13,
    result: {
      action: "Preparar festival",
      target: "Besta Sagrada",
      complication: "O evento coincide com outro",
    },
  },
  {
    min: 14,
    max: 14,
    result: {
      action: "Mediar disputa religiosa",
      target: "Nobres menores",
      complication: "O contratante esconde informações",
    },
  },
  {
    min: 15,
    max: 15,
    result: {
      action: "Escrever sermão",
      target: "Sacerdote",
      complication: "O ritual exige silêncio absoluto",
    },
  },
  {
    min: 16,
    max: 16,
    result: {
      action: "Traduzir texto sagrado",
      target: "Estudioso",
      complication: "Há divisão por rivalidade",
    },
  },
  {
    min: 17,
    max: 17,
    result: {
      action: "Cuidar de relíquia",
      target: "Ordem religiosa",
      complication: "O evento é alvo de sabotagem",
    },
  },
  {
    min: 18,
    max: 18,
    result: {
      action: "Organizar retiro espiritual",
      target: "Grupo de fiéis",
      complication: "O local é afastado",
    },
  },
  {
    min: 19,
    max: 19,
    result: {
      action: "Preparar casamento",
      target: "Líder Religioso",
      complication: "O evento precisa ser secreto",
    },
  },
  {
    min: 20,
    max: 20,
    result: {
      action: "Ajudar em enterro",
      target: "Festival Tradicional",
      complication: "Atrai curiosos indesejados",
    },
  },
];

// ===== EXEMPLOS DE RECURSOS =====

/**
 * Lista detalhada de exemplos para cada tipo de recurso
 */
export const RESOURCE_EXAMPLES = {
  "Mineral metálico": [
    "ferro",
    "alumínio",
    "manganês",
    "magnésio",
    "cobre",
    "cromo",
    "mercúrio",
    "chumbo",
    "estanho",
    "ouro",
    "prata",
    "níquel",
    "zinco",
    "urânio",
  ],
  "Extrativismo vegetal": [
    "frutos",
    "madeira",
    "raízes",
    "folhas",
    "flores",
    "sementes",
    "resinas",
    "óleos",
    "fibras",
    "turfa",
    "carvão",
    "cascas",
  ],
  "Extrativismo animal": [
    "caça",
    "pesca",
    "ovos",
    "mel",
    "couro",
    "lã",
    "leite",
    "cera",
    "penas",
  ],
  "Material comum": [
    "pedra",
    "água",
    "barro",
    "terra",
    "madeira",
    "carvão vegetal",
    "cogumelos",
    "petróleo",
  ],
  Especiaria: [
    "ervas aromáticas",
    "temperos",
    "flores raras",
    "sementes exóticas",
  ],
  "Componente mágico": [
    "materiais de feitiços",
    "cristais mágicos",
    "outros componentes arcanos",
  ],
  "Plantas medicinais": [
    "ervas curativas",
    "raízes medicinais",
    "flores terapêuticas",
    "folhas medicinais",
  ],
  "Mineral não-metálico": [
    "sal",
    "enxofre",
    "fosfatos",
    "nitratos",
    "quartzo",
    "argila",
    "gesso",
    "calcário",
    "granito",
    "mármore",
    "areia",
    "cascalho",
    "amianto",
    "carvão mineral",
    "pedras preciosas",
    "pedras semi-preciosas",
  ],
  Cogumelos: [
    "cogumelos comestíveis",
    "cogumelos venenosos",
    "cogumelos raros",
    "fungos medicinais",
    "cogumelos luminescentes",
  ],
} as const;

/**
 * Ambientes selvagens para extração de recursos
 */
export const WILD_ENVIRONMENTS = [
  "florestas",
  "montanhas",
  "desertos",
  "bosques",
  "cavernas",
  "vales",
  "pântanos",
  "rios",
  "campos",
  "lagos",
  "cachoeiras",
  "planícies",
] as const;

// ===== FUNÇÕES UTILITÁRIAS =====

/**
 * Rola em uma tabela de três colunas de objetivos
 * Executa três rolagens independentes (1d20 cada) para formar um objetivo completo
 *
 * @param table - Tabela de três colunas para rolar
 * @param rollAction - Função de rolagem para primeira coluna (padrão: d20)
 * @param rollTarget - Função de rolagem para segunda coluna (padrão: d20)
 * @param rollComplication - Função de rolagem para terceira coluna (padrão: d20)
 * @returns Resultado combinado das três colunas
 */
export function rollThreeColumnObjective(
  table: ThreeColumnObjectiveTable,
  rollAction: () => number = () => Math.floor(Math.random() * 20) + 1,
  rollTarget: () => number = () => Math.floor(Math.random() * 20) + 1,
  rollComplication: () => number = () => Math.floor(Math.random() * 20) + 1
): ThreeColumnObjectiveEntry {
  // Rolagem independente para cada coluna
  const actionRoll = rollAction();
  const targetRoll = rollTarget();
  const complicationRoll = rollComplication();

  // Busca entrada correspondente para cada rolagem (todas usam a mesma tabela)
  const actionEntry = table.find(
    (entry) => actionRoll >= entry.min && actionRoll <= entry.max
  );
  const targetEntry = table.find(
    (entry) => targetRoll >= entry.min && targetRoll <= entry.max
  );
  const complicationEntry = table.find(
    (entry) => complicationRoll >= entry.min && complicationRoll <= entry.max
  );

  // Combina os resultados das três colunas
  return {
    action: actionEntry?.result.action || "Ação não encontrada",
    target: targetEntry?.result.target || "Alvo não encontrado",
    complication:
      complicationEntry?.result.complication || "Complicação não encontrada",
  };
}

/**
 * Obtém a tabela de três colunas apropriada baseada no tipo de objetivo
 *
 * @param objectiveType - Tipo de objetivo do serviço
 * @returns Tabela correspondente ou null se não implementada
 */
export function getThreeColumnTable(
  objectiveType: ServiceObjectiveType
): ThreeColumnObjectiveTable | null {
  switch (objectiveType) {
    case ServiceObjectiveType.TREINAR_OU_ENSINAR:
      return TRAIN_OR_TEACH_TABLE;
    case ServiceObjectiveType.RECRUTAR:
      return RECRUIT_TABLE;
    case ServiceObjectiveType.CURAR_OU_RECUPERAR:
      return HEAL_OR_RECOVER_TABLE;
    case ServiceObjectiveType.NEGOCIAR_OU_COAGIR:
      return NEGOTIATE_OR_COERCE_TABLE;
    case ServiceObjectiveType.AUXILIAR_OU_CUIDAR:
      return AUXILIAR_OU_CUIDAR_TABLE;
    case ServiceObjectiveType.EXTRAIR_RECURSOS:
      return EXTRAIR_RECURSOS_TABLE;
    case ServiceObjectiveType.CONSTRUIR_CRIAR_OU_REPARAR:
      return CONSTRUIR_CRIAR_OU_REPARAR_TABLE;
    case ServiceObjectiveType.SERVICOS_ESPECIFICOS:
      return SERVICOS_ESPECIFICOS_TABLE;
    case ServiceObjectiveType.RELIGIOSO:
      return RELIGIOSO_TABLE;

    // Tabela especial - não implementada como tabela de três colunas
    case ServiceObjectiveType.MULTIPLO:
      return null;

    default:
      return null;
  }
}

/**
 * Gera um objetivo de serviço completo baseado no tipo
 * Combina tipo + rolagem de três colunas + formatação final
 *
 * @param objectiveType - Tipo de objetivo a ser gerado
 * @returns Objetivo completo com descrição formatada ou null se tabela não implementada
 */
export function generateServiceObjective(objectiveType: ServiceObjectiveType): {
  type: ServiceObjectiveType;
  description: string;
  action: string;
  target: string;
  complication: string;
} | null {
  // Tratamento especial para objetivos múltiplos
  if (objectiveType === ServiceObjectiveType.MULTIPLO) {
    return generateMultipleObjective();
  }

  const table = getThreeColumnTable(objectiveType);
  if (!table) {
    return null; // Tabela não implementada nesta issue
  }

  const result = rollThreeColumnObjective(table);

  // Formata descrição usando funções especializadas
  let description: string;

  if (objectiveType === ServiceObjectiveType.SERVICOS_ESPECIFICOS) {
    description = generateSpecificServiceDescription(
      result.action,
      result.target,
      result.complication
    );
  } else if (objectiveType === ServiceObjectiveType.RELIGIOSO) {
    description = generateServiceDescription(
      result.action,
      result.target,
      result.complication,
      "relacionado a"
    );
  } else {
    // Formato padrão para outros tipos
    description = generateServiceDescription(
      result.action,
      result.target,
      result.complication
    );
  }

  return {
    type: objectiveType,
    description,
    action: result.action,
    target: result.target,
    complication: result.complication,
  };
}

/**
 * Gera um objetivo múltiplo (quando rola 20 na tabela principal)
 * Permite múltiplas rolagens de "Múltiplo", acumulando objetivos únicos
 * Para quando não há mais tipos únicos para adicionar
 * GARANTE pelo menos 2 objetivos para justificar o nome "múltiplo"
 */
export function generateMultipleObjective(): {
  type: ServiceObjectiveType;
  description: string;
  action: string;
  target: string;
  complication: string;
} {
  const usedTypes = new Set<ServiceObjectiveType>();
  const objectives: Array<{
    type: ServiceObjectiveType;
    description: string;
    action: string;
    target: string;
    complication: string;
  }> = [];

  // Continue rolando até ter pelo menos 2 objetivos OU não conseguir mais tipos únicos
  let shouldContinue = true;
  while (shouldContinue) {
    const rolledType = rollFromAvailableTypes(usedTypes);

    // Se não há mais tipos disponíveis além dos já usados, parar
    if (!rolledType) {
      shouldContinue = false;
      break;
    }

    // Se rolou "Múltiplo", continue para rolar mais objetivos
    if (rolledType === ServiceObjectiveType.MULTIPLO) {
      // Continue o loop para rolar mais objetivos
      continue;
    }

    // Se já usamos este tipo, pular
    if (usedTypes.has(rolledType)) {
      continue;
    }

    // Gerar o objetivo
    const objective = generateServiceObjective(rolledType);
    if (objective) {
      objectives.push(objective);
      usedTypes.add(rolledType);
    }

    // Se já temos pelo menos 2 objetivos, rolar para ver se continua
    if (objectives.length >= 2) {
      const continueRoll = rollOnTable(SERVICE_OBJECTIVE_TYPE_TABLE);

      // Se não rolou "Múltiplo" novamente, parar
      if (continueRoll.result.type !== ServiceObjectiveType.MULTIPLO) {
        shouldContinue = false;
      }
    }
    // Se ainda tem menos de 2 objetivos, continue forçadamente
  }

  // Se ainda não conseguiu pelo menos 2 objetivos, forçar mais um
  while (objectives.length < 2) {
    const availableTypes = IMPLEMENTED_OBJECTIVE_TYPES.filter(
      (type) => type !== ServiceObjectiveType.MULTIPLO && !usedTypes.has(type)
    );

    if (availableTypes.length === 0) {
      // Se não há mais tipos disponíveis, duplicar o primeiro objetivo com ajuste
      if (objectives.length > 0) {
        const firstObjective = objectives[0];
        const duplicatedObjective = {
          ...firstObjective,
          description: firstObjective.description + " (variação)",
        };
        objectives.push(duplicatedObjective);
      } else {
        // Fallback absoluto
        const fallbackType = ServiceObjectiveType.TREINAR_OU_ENSINAR;
        const fallbackObjective = generateServiceObjective(fallbackType);
        if (fallbackObjective) {
          objectives.push(fallbackObjective);
        }
      }
    } else {
      // Escolher aleatoriamente um tipo disponível
      const randomIndex = Math.floor(Math.random() * availableTypes.length);
      const selectedType = availableTypes[randomIndex];

      const objective = generateServiceObjective(selectedType);
      if (objective) {
        objectives.push(objective);
        usedTypes.add(selectedType);
      }
    }
  }

  // Combinar todos os objetivos
  return combineMultipleObjectives(objectives);
}

/**
 * Rola um tipo de objetivo excluindo os já usados e o tipo "Múltiplo"
 * Retorna null se não há mais tipos disponíveis
 */
function rollFromAvailableTypes(
  usedTypes: Set<ServiceObjectiveType>
): ServiceObjectiveType | null {
  const availableTypes = IMPLEMENTED_OBJECTIVE_TYPES.filter(
    (type) => type !== ServiceObjectiveType.MULTIPLO && !usedTypes.has(type)
  );

  // Se não há mais tipos disponíveis, retornar null
  if (availableTypes.length === 0) {
    return null;
  }

  // Rolar na tabela principal
  const result = rollOnTable(SERVICE_OBJECTIVE_TYPE_TABLE);
  return result.result.type;
}

/**
 * Combina múltiplos objetivos em um único resultado
 */
function combineMultipleObjectives(
  objectives: Array<{
    type: ServiceObjectiveType;
    description: string;
    action: string;
    target: string;
    complication: string;
  }>
): {
  type: ServiceObjectiveType;
  description: string;
  action: string;
  target: string;
  complication: string;
} {
  if (objectives.length === 0) {
    throw new Error("Cannot combine empty objectives array");
  }

  if (objectives.length === 1) {
    return {
      ...objectives[0],
      type: ServiceObjectiveType.MULTIPLO,
    };
  }

  // Combinar descrições com conectores apropriados
  const descriptions = objectives.map((obj) => obj.description);
  const combinedDescription =
    descriptions.length === 2
      ? `${descriptions[0]} e também ${descriptions[1]}`
      : descriptions.slice(0, -1).join(", ") +
        ` e também ${descriptions[descriptions.length - 1]}`;

  // Combinar ações, alvos e complicações
  const combinedAction = objectives.map((obj) => obj.action).join(" + ");
  const combinedTarget = objectives.map((obj) => obj.target).join(" + ");
  const combinedComplication = objectives
    .map((obj) => obj.complication)
    .join(" + ");

  return {
    type: ServiceObjectiveType.MULTIPLO,
    description: combinedDescription,
    action: combinedAction,
    target: combinedTarget,
    complication: combinedComplication,
  };
}

// ===== CONSTANTES E CONFIGURAÇÕES =====

/**
 * Lista dos tipos de objetivo implementados
 * Útil para validações e interfaces
 */
export const IMPLEMENTED_OBJECTIVE_TYPES: ServiceObjectiveType[] = [
  ServiceObjectiveType.TREINAR_OU_ENSINAR,
  ServiceObjectiveType.RECRUTAR,
  ServiceObjectiveType.CURAR_OU_RECUPERAR,
  ServiceObjectiveType.NEGOCIAR_OU_COAGIR,
  ServiceObjectiveType.AUXILIAR_OU_CUIDAR,
  ServiceObjectiveType.EXTRAIR_RECURSOS,
  ServiceObjectiveType.CONSTRUIR_CRIAR_OU_REPARAR,
  ServiceObjectiveType.SERVICOS_ESPECIFICOS,
  ServiceObjectiveType.RELIGIOSO,
  ServiceObjectiveType.MULTIPLO,
];

/**
 * Nota sobre o sistema de três colunas
 */
export const THREE_COLUMN_SYSTEM_NOTE =
  "Como as tabelas possuem três colunas, role um dado para cada coluna e una os resultados das rolagens respectivas.";

/**
 * Exemplo de uso
 */
export const USAGE_EXAMPLE =
  'Caso os resultados de Treinar ou Ensinar forem 3, 5 e 2, a descrição seria: "Treinar ou ensinar a arte do combate para crianças órfãs, mas o conhecimento será usado contra você."';

// ===== FUNÇÕES UTILITÁRIAS ESPECÍFICAS =====

/**
 * Retorna exemplos de recursos específicos baseados no tipo
 */
export function getResourceExamples(resourceType: string): readonly string[] {
  return (
    RESOURCE_EXAMPLES[resourceType as keyof typeof RESOURCE_EXAMPLES] || []
  );
}

/**
 * Retorna um exemplo aleatório de recurso específico
 */
export function getRandomResourceExample(resourceType: string): string {
  const examples = getResourceExamples(resourceType);
  if (examples.length === 0) return resourceType;

  return examples[Math.floor(Math.random() * examples.length)];
}

/**
 * Gera uma descrição personalizada para objetivos de "Extrair Recursos"
 * Inclui exemplos contextuais quando possível
 */
export function generateResourceExtractionDescription(
  action: string,
  target: string,
  complication: string
): string {
  // Tratamento especial para resultado 20 (múltiplo)
  if (action === "Role duas vezes e use ambos") {
    const alternativeResources = ["Mineral metálico", "Extrativismo vegetal"];
    const altResource =
      alternativeResources[
        Math.floor(Math.random() * alternativeResources.length)
      ];
    const example = getRandomResourceExample(altResource);
    return `Extrair ${example} de ${target.toLowerCase()}, mas ${complication.toLowerCase()}`;
  }

  // Gera um exemplo específico do tipo de recurso
  const specificExample = getRandomResourceExample(action);

  return `Extrair ${specificExample} de ${target.toLowerCase()}, mas ${complication.toLowerCase()}`;
}

/**
 * Gera uma descrição personalizada para objetivos de "Auxiliar ou Cuidar"
 * Ajusta a linguagem conforme o contexto
 */
export function generateCareDescription(
  target: string,
  activity: string,
  complication: string
): string {
  const careAction =
    target.toLowerCase().includes("criança") ||
    target.toLowerCase().includes("idoso")
      ? "cuidar de"
      : "auxiliar";

  return `${careAction.charAt(0).toUpperCase() + careAction.slice(1)} ${target.toLowerCase()} em ${activity.toLowerCase()}, mas ${complication.toLowerCase()}`;
}

/**
 * Valida se um ambiente é considerado selvagem para extração
 */
export function isWildEnvironment(environment: string): boolean {
  return (
    WILD_ENVIRONMENTS.some((wild) =>
      environment.toLowerCase().includes(wild.toLowerCase())
    ) || environment.toLowerCase().includes("selvagem")
  );
}

/**
 * Gera uma descrição genérica para objetivos de serviço
 * @param action - A ação a ser realizada
 * @param target - O alvo da ação
 * @param complication - A complicação
 * @param connector - Palavra de conexão ("para", "relacionado a", etc.)
 */
export function generateServiceDescription(
  action: string,
  target: string,
  complication: string,
  connector: string = "para"
): string {
  // Formatar action: primeira letra maiúscula, resto minúsculo
  const formattedAction =
    action.charAt(0).toUpperCase() + action.slice(1).toLowerCase();

  // Formatar target: remover primeira letra maiúscula (exceto se for nome próprio)
  const formattedTarget = target.toLowerCase();

  // Formatar complication: remover primeira letra maiúscula
  const formattedComplication = complication.toLowerCase();

  return `${formattedAction} ${connector} ${formattedTarget}, mas ${formattedComplication}`;
}

/**
 * Gera uma descrição personalizada para objetivos de "Serviços Específicos"
 * Inclui tratamento especial para "Trabalho rural"
 */
export function generateSpecificServiceDescription(
  action: string,
  target: string,
  complication: string
): string {
  // Se o serviço for "Trabalho rural", gerar especificação
  if (action === "Trabalho rural") {
    const ruralType = rollOnTable(TRABALHO_RURAL_TABLE);
    return generateServiceDescription(
      ruralType.result,
      target,
      complication,
      "para"
    );
  }

  // Determinar conector baseado no tipo de ação
  let connector = "para";
  const actionLower = action.toLowerCase();

  if (actionLower.includes("limpar") || actionLower.includes("pintar")) {
    connector = "em";
  } else if (
    actionLower.includes("cobrar") ||
    actionLower.includes("criar") ||
    actionLower.includes("ajudar")
  ) {
    connector = "para";
  } else if (
    actionLower.includes("traduzir") ||
    actionLower.includes("consertar") ||
    actionLower.includes("preparar")
  ) {
    connector = "para";
  } else if (actionLower.includes("trabalho")) {
    connector = "para";
  }

  return generateServiceDescription(action, target, complication, connector);
}

/**
 * Gera objetivos de serviço com descrições aprimoradas
 * Inclui tratamento especial para os novos tipos implementados
 */
export function generateEnhancedServiceObjective(
  objectiveType: ServiceObjectiveType
): {
  type: ServiceObjectiveType;
  description: string;
  action: string;
  target: string;
  complication: string;
} | null {
  const table = getThreeColumnTable(objectiveType);
  if (!table) {
    return null; // Tabela não implementada
  }

  const result = rollThreeColumnObjective(table);

  // Descrições personalizadas para novos tipos
  let description: string;

  switch (objectiveType) {
    case ServiceObjectiveType.EXTRAIR_RECURSOS:
      description = generateResourceExtractionDescription(
        result.action,
        result.target,
        result.complication
      );
      break;

    case ServiceObjectiveType.AUXILIAR_OU_CUIDAR:
      description = generateCareDescription(
        result.action, // Na nossa implementação, action = quem cuidar
        result.target, // target = atividade
        result.complication
      );
      break;

    case ServiceObjectiveType.CONSTRUIR_CRIAR_OU_REPARAR:
      description = `Construir/criar/reparar ${result.action.toLowerCase()} para ${result.target.toLowerCase()}, mas ${result.complication.toLowerCase()}`;
      break;

    default:
      // Usa a formatação padrão para outros tipos
      description = `${objectiveType} ${result.action} ${result.target}, mas ${result.complication}`;
      break;
  }

  return {
    type: objectiveType,
    description,
    action: result.action,
    target: result.target,
    complication: result.complication,
  };
}
