import type { TableEntry } from "@/types/tables";
import { ServiceObjectiveType } from "@/types/service";

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

    // Tabelas não implementadas nesta issue (serão feitas nas Issues 5.12 e 5.13)
    case ServiceObjectiveType.AUXILIAR_OU_CUIDAR:
    case ServiceObjectiveType.EXTRAIR_RECURSOS:
    case ServiceObjectiveType.CONSTRUIR_CRIAR_OU_REPARAR:
    case ServiceObjectiveType.SERVICOS_ESPECIFICOS:
    case ServiceObjectiveType.RELIGIOSO:
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
  const table = getThreeColumnTable(objectiveType);
  if (!table) {
    return null; // Tabela não implementada nesta issue
  }

  const result = rollThreeColumnObjective(table);

  // Formata descrição
  const description = `${objectiveType} ${result.action} ${result.target}, mas ${result.complication}`;

  return {
    type: objectiveType,
    description,
    action: result.action,
    target: result.target,
    complication: result.complication,
  };
}

// ===== CONSTANTES E CONFIGURAÇÕES =====

/**
 * Lista dos tipos de objetivo implementados nesta issue
 * Útil para validações e interfaces
 */
export const IMPLEMENTED_OBJECTIVE_TYPES: ServiceObjectiveType[] = [
  ServiceObjectiveType.TREINAR_OU_ENSINAR,
  ServiceObjectiveType.RECRUTAR,
  ServiceObjectiveType.CURAR_OU_RECUPERAR,
  ServiceObjectiveType.NEGOCIAR_OU_COAGIR,
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
