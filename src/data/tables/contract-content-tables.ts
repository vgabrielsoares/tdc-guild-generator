/**
 * Tabelas de Contratantes e Objetivos para Contratos da Guilda
 *
 * Implementa todas as tabelas de geração de conteúdo dos contratos:
 * - Contratantes (Povo/Instituição/Governo)
 * - Contratante específico do governo
 * - Objetivo principal e suas especificações detalhadas
 * - Modificadores por relação aplicados aos contratantes
 */

import type { TableEntry } from "@/types/tables";
import {
  ContractorType,
  ObjectiveCategory,
  LocationType,
} from "@/types/contract";

// ====================================
// TIPOS E ENUMS ESPECÍFICOS
// ====================================

// Tipos específicos de contratantes do governo
export enum GovernmentContractorType {
  ARCANISTA_DIPLOMATA = "arcanista_diplomata",
  CLERO_IMPORTANTE = "clero_importante",
  NOBRE_PODEROSO = "nobre_poderoso",
  FAMILIA_GOVERNANTE = "familia_governante",
  AGENTE_BUROCRATICO = "agente_burocratico",
  MILITAR_ALTO_ESCALAO = "militar_alto_escalao",
  GOVERNO_OUTRO_ASSENTAMENTO = "governo_outro_assentamento",
  LIDER_LOCAL = "lider_local",
}

// ====================================
// INTERFACES
// ====================================

// Interface para contratantes
interface ContractorEntry {
  type: ContractorType;
  description: string;
  relationshipModifiers?: {
    population?: number;
    government?: number;
  };
}

// Interface para contratantes específicos do governo
interface GovernmentContractorEntry {
  type: GovernmentContractorType;
  name: string;
  description: string;
}

// Interface para objetivos principais
interface ObjectiveEntry {
  category: ObjectiveCategory;
  name: string;
  description: string;
}

// Interface para especificações por objetivo
interface ObjectiveSpecificationEntry {
  target: string;
  description: string;
  rollTwice?: boolean;
}

// Interface para modificadores de relação
interface RelationModifiers {
  population: {
    pessima: number;
    ruim: number;
    dividida: number;
    boa: number;
    muito_boa: number;
    excelente: number;
  };
  government: {
    pessima: number;
    ruim: number;
    diplomatica: number;
    boa: number;
    muito_boa: number;
    excelente: number;
  };
}

// ====================================
// TABELAS DE CONTRATANTES
// ====================================

/**
 * Tabela Principal de Contratantes
 * Rolagem: 1d20 com modificadores por relação
 */
export const CONTRACTOR_TABLE: TableEntry<ContractorEntry>[] = [
  // 1-12: Povo
  {
    min: 1,
    max: 12,
    result: {
      type: ContractorType.POVO,
      description: "Povo",
      relationshipModifiers: {
        population: 1, // Influencia diretamente contratos do povo
        government: 0,
      },
    },
  },
  // 13-14: Instituição de Ofício
  {
    min: 13,
    max: 14,
    result: {
      type: ContractorType.INSTITUICAO,
      description: "Instituição de Ofício",
      relationshipModifiers: {
        population: 0.5, // Influencia parcialmente
        government: 0.5,
      },
    },
  },
  // 15-20: Governo
  {
    min: 15,
    max: 20,
    result: {
      type: ContractorType.GOVERNO,
      description: "Governo",
      relationshipModifiers: {
        population: 0,
        government: 1, // Influencia diretamente contratos do governo
      },
    },
  },
];

/**
 * Modificadores de Relação para Contratantes
 * Aplicados na rolagem da tabela de contratantes principal
 * Baseado na seção "Modificadores por Relação"
 */
export const CONTRACTOR_RELATION_MODIFIERS: RelationModifiers = {
  population: {
    pessima: 4,
    ruim: 2,
    dividida: 0,
    boa: -1,
    muito_boa: -2,
    excelente: -5,
  },
  government: {
    pessima: -4,
    ruim: -2,
    diplomatica: 0,
    boa: 1,
    muito_boa: 2,
    excelente: 5,
  },
};

/**
 * Tabela de Contratantes Específicos do Governo
 * Utilizada quando o contratante for do governo
 * Rolagem: 1d20
 */
export const GOVERNMENT_CONTRACTOR_TABLE: TableEntry<GovernmentContractorEntry>[] =
  [
    // 1-2: Arcanista diplomata
    {
      min: 1,
      max: 2,
      result: {
        type: GovernmentContractorType.ARCANISTA_DIPLOMATA,
        name: "Arcanista diplomata",
        description:
          "Mago ou arcanista especializado em relações diplomáticas e assuntos mágicos do governo",
      },
    },
    // 3-5: Membro importante do clero
    {
      min: 3,
      max: 5,
      result: {
        type: GovernmentContractorType.CLERO_IMPORTANTE,
        name: "Clérigo importante",
        description:
          "Alto clérigo com influência significativa no governo local",
      },
    },
    // 6-10: Nobre poderoso
    {
      min: 6,
      max: 10,
      result: {
        type: GovernmentContractorType.NOBRE_PODEROSO,
        name: "Nobre poderoso",
        description:
          "Membro da nobreza com considerável poder político e econômico",
      },
    },
    // 11-15: Família governante
    {
      min: 11,
      max: 15,
      result: {
        type: GovernmentContractorType.FAMILIA_GOVERNANTE,
        name: "Família governante",
        description:
          "Familiares próximos ou conselheiros diretos dos líderes do governo",
      },
    },
    // 16: Agente burocrático
    {
      min: 16,
      max: 16,
      result: {
        type: GovernmentContractorType.AGENTE_BUROCRATICO,
        name: "Agente burocrático",
        description:
          "Funcionário do governo como cobrador de impostos, juiz, advogado ou similar",
      },
    },
    // 17: Militar de alto escalão
    {
      min: 17,
      max: 17,
      result: {
        type: GovernmentContractorType.MILITAR_ALTO_ESCALAO,
        name: "Militar de alto escalão",
        description:
          "Oficial militar de alta patente com autoridade para contratar aventureiros",
      },
    },
    // 18-19: Governo de outro assentamento
    {
      min: 18,
      max: 19,
      result: {
        type: GovernmentContractorType.GOVERNO_OUTRO_ASSENTAMENTO,
        name: "Governo de outro assentamento",
        description:
          "Representante governamental de outro assentamento em missão diplomática ou oficial",
      },
    },
    // 20: Líder local
    {
      min: 20,
      max: 20,
      result: {
        type: GovernmentContractorType.LIDER_LOCAL,
        name: "Líder local",
        description:
          "O próprio líder do assentamento ou seu representante direto",
      },
    },
  ];

// ====================================
// TABELAS DE OBJETIVOS
// ====================================

/**
 * Tabela de Objetivo Principal
 * Define a natureza fundamental da tarefa do contrato
 * Rolagem: 1d20
 */
export const MAIN_OBJECTIVE_TABLE: TableEntry<ObjectiveEntry>[] = [
  // 1-2: Atacar ou destruir
  {
    min: 1,
    max: 2,
    result: {
      category: ObjectiveCategory.ATACAR_DESTRUIR,
      name: "Atacar ou destruir",
      description: "Eliminar, destruir ou atacar um alvo específico",
    },
  },
  // 3-5: Encontrar ou recuperar
  {
    min: 3,
    max: 5,
    result: {
      category: ObjectiveCategory.ENCONTRAR_RECUPERAR,
      name: "Encontrar ou recuperar",
      description: "Localizar e recuperar algo perdido, roubado ou escondido",
    },
  },
  // 6-7: Capturar
  {
    min: 6,
    max: 7,
    result: {
      category: ObjectiveCategory.CAPTURAR,
      name: "Capturar",
      description:
        "Capturar vivo um alvo específico ou tomar controle de um local",
    },
  },
  // 8-9: Proteger ou salvar
  {
    min: 8,
    max: 9,
    result: {
      category: ObjectiveCategory.PROTEGER_SALVAR,
      name: "Proteger ou salvar",
      description:
        "Defender ou resgatar pessoas, objetos ou locais importantes",
    },
  },
  // 10-11: Explorar ou descobrir
  {
    min: 10,
    max: 11,
    result: {
      category: ObjectiveCategory.EXPLORAR_DESCOBRIR,
      name: "Explorar ou descobrir",
      description:
        "Explorar novos territórios ou descobrir informações importantes",
    },
  },
  // 12-13: Entregar ou receber
  {
    min: 12,
    max: 13,
    result: {
      category: ObjectiveCategory.ENTREGAR_RECEBER,
      name: "Entregar ou receber",
      description: "Transportar e entregar algo valioso ou importante",
    },
  },
  // 14: Investigar ou sabotar
  {
    min: 14,
    max: 14,
    result: {
      category: ObjectiveCategory.INVESTIGAR_SABOTAR,
      name: "Investigar ou sabotar",
      description: "Investigar mistérios ou sabotar operações inimigas",
    },
  },
  // 15-18: Serviços perigosos
  {
    min: 15,
    max: 18,
    result: {
      category: ObjectiveCategory.SERVICOS_PERIGOSOS,
      name: "Serviços perigosos",
      description:
        "Realizar tarefas específicas que envolvem perigo considerável",
    },
  },
  // 19: Religioso
  {
    min: 19,
    max: 19,
    result: {
      category: ObjectiveCategory.RELIGIOSO,
      name: "Religioso",
      description: "Cumprir uma missão de natureza religiosa ou espiritual",
    },
  },
  // 20: Role duas vezes e use ambos
  {
    min: 20,
    max: 20,
    result: {
      category: ObjectiveCategory.ATACAR_DESTRUIR, // TODO: Placeholder - deve ser tratado na lógica
      name: "Role duas vezes e use ambos",
      description:
        "O contrato possui dois objetivos principais que devem ser cumpridos",
    },
  },
];

// ====================================
// ESPECIFICAÇÕES POR OBJETIVO
// ====================================

/**
 * Especificações para "Atacar ou Destruir"
 * Rolagem: 1d20
 */
export const ATTACK_DESTROY_SPECIFICATIONS: TableEntry<ObjectiveSpecificationEntry>[] =
  [
    {
      min: 1,
      max: 1,
      result: {
        target: "Uma pessoa poderosa",
        description: "Eliminar um indivíduo influente",
      },
    },
    {
      min: 2,
      max: 3,
      result: {
        target: "Uma organização",
        description: "Destruir ou desmantelar uma organização",
      },
    },
    {
      min: 4,
      max: 5,
      result: {
        target: "Uma comunidade",
        description: "Atacar um assentamento ou comunidade",
      },
    },
    {
      min: 6,
      max: 6,
      result: {
        target: "Um artefato ou objeto",
        description: "Destruir um item específico",
      },
    },
    {
      min: 7,
      max: 10,
      result: {
        target: "Uma criatura ou monstro",
        description: "Eliminar uma criatura perigosa",
      },
    },
    {
      min: 11,
      max: 12,
      result: {
        target: "Um local ou território",
        description: "Destruir ou tomar um local específico",
      },
    },
    {
      min: 13,
      max: 13,
      result: {
        target: "Uma ideia, aliança ou reputação",
        description: "Destruir conceitos abstratos",
      },
    },
    {
      min: 14,
      max: 14,
      result: {
        target: "Recursos",
        description: "Destruir suprimentos ou recursos",
      },
    },
    {
      min: 15,
      max: 15,
      result: {
        target: "Um evento",
        description: "Impedir que um evento aconteça",
      },
    },
    {
      min: 16,
      max: 16,
      result: {
        target: "Um veículo ou engenhoca",
        description: "Destruir transporte ou maquinário",
      },
    },
    {
      min: 17,
      max: 19,
      result: {
        target: "Uma gangue ou quadrilha",
        description: "Eliminar grupo de criminosos",
      },
    },
    {
      min: 20,
      max: 20,
      result: {
        target: "Role duas vezes e use ambos",
        description: "Múltiplos alvos para destruir",
        rollTwice: true,
      },
    },
  ];

/**
 * Especificações para "Encontrar ou Recuperar"
 * Rolagem: 1d20
 */
export const FIND_RECOVER_SPECIFICATIONS: TableEntry<ObjectiveSpecificationEntry>[] =
  [
    {
      min: 1,
      max: 1,
      result: {
        target: "Um artefato mágico ou grimório",
        description: "Localizar item mágico poderoso",
      },
    },
    {
      min: 2,
      max: 3,
      result: {
        target: "Uma ou mais criaturas desaparecidas ou sequestradas",
        description: "Resgatar pessoas perdidas",
      },
    },
    {
      min: 4,
      max: 4,
      result: {
        target: "Um pergaminho único/conhecimento perdido",
        description: "Recuperar informação valiosa",
      },
    },
    {
      min: 5,
      max: 6,
      result: {
        target: "Algo que foi perdido ou roubado",
        description: "Recuperar propriedade perdida",
      },
    },
    {
      min: 7,
      max: 7,
      result: {
        target: "Uma fonte de recursos",
        description: "Encontrar nova fonte de suprimentos",
      },
    },
    {
      min: 8,
      max: 8,
      result: {
        target: "Ingredientes ou materiais",
        description: "Coletar componentes específicos",
      },
    },
    {
      min: 9,
      max: 10,
      result: {
        target: "A entrada de uma ruína/masmorra",
        description: "Localizar entrada oculta",
      },
    },
    {
      min: 11,
      max: 11,
      result: {
        target: "Informações ou documentos importantes",
        description: "Obter dados cruciais",
      },
    },
    {
      min: 12,
      max: 12,
      result: {
        target: "A fonte de uma calamidade",
        description: "Identificar origem de problema",
      },
    },
    {
      min: 13,
      max: 13,
      result: {
        target: "A cura para uma maldição",
        description: "Encontrar solução para maldição",
      },
    },
    {
      min: 14,
      max: 14,
      result: {
        target: "Um caminho ou rota segura",
        description: "Estabelecer rota de viagem",
      },
    },
    {
      min: 15,
      max: 16,
      result: {
        target: "Um local ou território",
        description: "Descobrir local específico",
      },
    },
    {
      min: 17,
      max: 18,
      result: {
        target: "Um lugar desaparecido ou oculto",
        description: "Encontrar local perdido",
      },
    },
    {
      min: 19,
      max: 19,
      result: {
        target: "Um símbolo ou relíquia sagrada",
        description: "Recuperar item religioso",
      },
    },
    {
      min: 20,
      max: 20,
      result: {
        target: "Role duas vezes e use ambos",
        description: "Múltiplos itens para recuperar",
        rollTwice: true,
      },
    },
  ];

/**
 * Especificações para "Capturar"
 * Rolagem: 1d20
 */
export const CAPTURE_SPECIFICATIONS: TableEntry<ObjectiveSpecificationEntry>[] =
  [
    {
      min: 1,
      max: 2,
      result: {
        target: "O líder de uma organização ou facção",
        description: "Capturar figura de autoridade",
      },
    },
    {
      min: 3,
      max: 4,
      result: {
        target: "Uma criatura ou monstro",
        description: "Capturar viva criatura específica",
      },
    },
    {
      min: 5,
      max: 5,
      result: {
        target: "Uma pessoa poderosa/influente",
        description: "Capturar figura importante",
      },
    },
    {
      min: 6,
      max: 8,
      result: {
        target: "Um fugitivo",
        description: "Capturar criminoso foragido",
      },
    },
    {
      min: 9,
      max: 11,
      result: {
        target: "Uma masmorra ou forte",
        description: "Tomar controle de fortificação",
      },
    },
    {
      min: 12,
      max: 12,
      result: {
        target: "Um animal selvagem",
        description: "Capturar besta não-senciente",
      },
    },
    {
      min: 13,
      max: 13,
      result: {
        target: "Um veículo ou comboio/caravana",
        description: "Interceptar transporte",
      },
    },
    {
      min: 14,
      max: 14,
      result: {
        target: "Os ocupantes de uma ruína próxima",
        description: "Capturar habitantes de ruínas",
      },
    },
    {
      min: 15,
      max: 16,
      result: {
        target: "Um ou mais foras-da-lei",
        description: "Capturar bandidos conhecidos",
      },
    },
    {
      min: 17,
      max: 17,
      result: {
        target: "Um objeto importante",
        description: "Tomar posse de item valioso",
      },
    },
    {
      min: 18,
      max: 18,
      result: {
        target: "Um portal ou passagem/caminho",
        description: "Controlar ponto de passagem",
      },
    },
    {
      min: 19,
      max: 19,
      result: {
        target: "Um local ou território",
        description: "Tomar controle de área",
      },
    },
    {
      min: 20,
      max: 20,
      result: {
        target: "Role duas vezes e use ambos",
        description: "Múltiplos alvos para capturar",
        rollTwice: true,
      },
    },
  ];

/**
 * Especificações para "Proteger ou Salvar"
 * Rolagem: 1d20
 */
export const PROTECT_SAVE_SPECIFICATIONS: TableEntry<ObjectiveSpecificationEntry>[] =
  [
    {
      min: 1,
      max: 2,
      result: {
        target: "Uma comunidade",
        description: "Defender assentamento ou grupo",
      },
    },
    {
      min: 3,
      max: 4,
      result: {
        target: "Um local ou território",
        description: "Proteger área importante",
      },
    },
    {
      min: 5,
      max: 6,
      result: {
        target: "Uma pessoa poderosa",
        description: "Defender figura importante",
      },
    },
    {
      min: 7,
      max: 7,
      result: {
        target: "Um objeto importante",
        description: "Proteger item valioso",
      },
    },
    {
      min: 8,
      max: 8,
      result: {
        target: "Uma informação ou segredo",
        description: "Proteger dados sensíveis",
      },
    },
    {
      min: 9,
      max: 9,
      result: { target: "Um tesouro", description: "Defender riquezas" },
    },
    {
      min: 10,
      max: 10,
      result: {
        target: "Anomalia mágica",
        description: "Proteger fenômeno mágico",
      },
    },
    {
      min: 11,
      max: 12,
      result: {
        target: "Um veículo ou comboio/caravana",
        description: "Escoltar transporte",
      },
    },
    {
      min: 13,
      max: 14,
      result: {
        target: "Um evento",
        description: "Proteger cerimônia ou evento",
      },
    },
    {
      min: 15,
      max: 15,
      result: {
        target: "Prisioneiros",
        description: "Proteger cativos importantes",
      },
    },
    {
      min: 16,
      max: 18,
      result: {
        target: "Um grupo de pessoas",
        description: "Defender grupo específico",
      },
    },
    {
      min: 19,
      max: 19,
      result: {
        target: "Um recurso essencial",
        description: "Proteger fonte vital",
      },
    },
    {
      min: 20,
      max: 20,
      result: {
        target: "Role duas vezes e use ambos",
        description: "Múltiplos alvos para proteger",
        rollTwice: true,
      },
    },
  ];

/**
 * Especificações para "Explorar ou Descobrir"
 * Rolagem: 1d20
 */
export const EXPLORE_DISCOVER_SPECIFICATIONS: TableEntry<ObjectiveSpecificationEntry>[] =
  [
    {
      min: 1,
      max: 3,
      result: { target: "Uma ruína", description: "Explorar estrutura antiga" },
    },
    {
      min: 4,
      max: 4,
      result: {
        target: "Um ambiente selvagem para mapeá-lo",
        description: "Cartografar território inexplorado",
      },
    },
    {
      min: 5,
      max: 5,
      result: {
        target: "A verdade sobre uma lenda",
        description: "Investigar mitos e lendas",
      },
    },
    {
      min: 6,
      max: 6,
      result: {
        target: "Zonas de magia morta ou selvagem",
        description: "Estudar anomalias mágicas",
      },
    },
    {
      min: 7,
      max: 9,
      result: {
        target: "Um covil ou masmorra",
        description: "Explorar complexo subterrâneo",
      },
    },
    {
      min: 10,
      max: 10,
      result: {
        target: "Uma passagem misteriosa",
        description: "Investigar túnel ou caminho secreto",
      },
    },
    {
      min: 11,
      max: 11,
      result: {
        target: "Um plano/fenda dimensional",
        description: "Explorar outro plano de existência",
      },
    },
    {
      min: 12,
      max: 12,
      result: {
        target: "Resquícios de outra civilização",
        description: "Estudar cultura perdida",
      },
    },
    {
      min: 13,
      max: 13,
      result: {
        target: "Uma ilha exótica",
        description: "Explorar terra isolada",
      },
    },
    {
      min: 14,
      max: 15,
      result: {
        target: "Um local ou território",
        description: "Reconhecer área desconhecida",
      },
    },
    {
      min: 16,
      max: 16,
      result: {
        target: "Um local de difícil acesso",
        description: "Alcançar lugar inacessível",
      },
    },
    {
      min: 17,
      max: 18,
      result: {
        target: "Um labirinto ou estrutura subterrânea",
        description: "Navegar complexo labiríntico",
      },
    },
    {
      min: 19,
      max: 19,
      result: {
        target: "Uma cidade ou assentamento perdido",
        description: "Encontrar civilização perdida",
      },
    },
    {
      min: 20,
      max: 20,
      result: {
        target: "Role duas vezes e use ambos",
        description: "Múltiplas explorações",
        rollTwice: true,
      },
    },
  ];

/**
 * Especificações para "Entregar ou Receber"
 * Rolagem: 1d20
 */
export const DELIVER_RECEIVE_SPECIFICATIONS: TableEntry<ObjectiveSpecificationEntry>[] =
  [
    {
      min: 1,
      max: 2,
      result: {
        target: "Uma mensagem ou documento importante/sigiloso",
        description: "Transportar informação confidencial",
      },
    },
    {
      min: 3,
      max: 3,
      result: {
        target: "Um artefato mágico",
        description: "Transportar item de poder",
      },
    },
    {
      min: 4,
      max: 5,
      result: {
        target: "Uma mercadoria em grande quantidade",
        description: "Transportar carga volumosa",
      },
    },
    {
      min: 6,
      max: 6,
      result: {
        target: "Uma planta rara muito delicada",
        description: "Transportar espécime frágil",
      },
    },
    {
      min: 7,
      max: 8,
      result: {
        target: "Um prisioneiro perigoso",
        description: "Transportar criminoso perigoso",
      },
    },
    {
      min: 9,
      max: 9,
      result: {
        target: "Suprimentos para uma comunidade",
        description: "Entregar provisões essenciais",
      },
    },
    {
      min: 10,
      max: 10,
      result: {
        target: "Um objeto de arte valioso",
        description: "Transportar obra de arte",
      },
    },
    {
      min: 11,
      max: 11,
      result: {
        target: "Um mapa ou chave estranha",
        description: "Entregar item misterioso",
      },
    },
    {
      min: 12,
      max: 12,
      result: {
        target: "Um objeto de magia instável",
        description: "Transportar item mágico perigoso",
      },
    },
    {
      min: 13,
      max: 13,
      result: {
        target: "Um animal exótico ou mágico",
        description: "Transportar criatura especial",
      },
    },
    {
      min: 14,
      max: 14,
      result: {
        target: "Um presente diplomático",
        description: "Entregar oferta oficial",
      },
    },
    {
      min: 15,
      max: 15,
      result: {
        target: "Um equipamento ou ferramenta especial",
        description: "Transportar instrumento específico",
      },
    },
    {
      min: 16,
      max: 16,
      result: {
        target: "Um símbolo ou relíquia sagrada",
        description: "Transportar item religioso",
      },
    },
    {
      min: 17,
      max: 19,
      result: {
        target: "Role novamente, mas a carga é secreta",
        description: "Entrega com sigilo absoluto",
      },
    },
    {
      min: 20,
      max: 20,
      result: {
        target: "Role duas vezes e use ambos",
        description: "Múltiplas entregas",
        rollTwice: true,
      },
    },
  ];

/**
 * Especificações para "Investigar ou Sabotar"
 * Rolagem: 1d20
 */
export const INVESTIGATE_SABOTAGE_SPECIFICATIONS: TableEntry<ObjectiveSpecificationEntry>[] =
  [
    {
      min: 1,
      max: 2,
      result: {
        target: "Uma organização",
        description: "Investigar ou infiltrar grupo",
      },
    },
    {
      min: 3,
      max: 3,
      result: {
        target: "Um enriquecimento suspeito",
        description: "Investigar riqueza inexplicável",
      },
    },
    {
      min: 4,
      max: 4,
      result: {
        target: "Um assentamento que não se tem notícias",
        description: "Investigar comunicação perdida",
      },
    },
    {
      min: 5,
      max: 7,
      result: {
        target: "Um crime",
        description: "Solucionar mistério criminal",
      },
    },
    {
      min: 8,
      max: 8,
      result: {
        target: "Um veículo ou comboio/caravana",
        description: "Sabotar ou investigar transporte",
      },
    },
    {
      min: 9,
      max: 9,
      result: {
        target: "Um membro influente da sociedade",
        description: "Investigar figura poderosa",
      },
    },
    {
      min: 10,
      max: 10,
      result: {
        target: "Suposto posto avançado",
        description: "Investigar instalação militar",
      },
    },
    {
      min: 11,
      max: 11,
      result: {
        target: "Anomalia mágica ou ritual",
        description: "Investigar fenômeno sobrenatural",
      },
    },
    {
      min: 12,
      max: 12,
      result: {
        target: "Eventos sobrenaturais estranhos",
        description: "Investigar ocorrências místicas",
      },
    },
    {
      min: 13,
      max: 14,
      result: {
        target: "Rumores suspeitos",
        description: "Verificar boatos importantes",
      },
    },
    {
      min: 15,
      max: 16,
      result: {
        target: "Um desaparecimento misterioso",
        description: "Investigar pessoa perdida",
      },
    },
    {
      min: 17,
      max: 17,
      result: {
        target: "Um local de acesso restrito",
        description: "Infiltrar área protegida",
      },
    },
    {
      min: 18,
      max: 19,
      result: {
        target: "Um local ou território",
        description: "Reconhecer área específica",
      },
    },
    {
      min: 20,
      max: 20,
      result: {
        target: "Role duas vezes e use ambos",
        description: "Múltiplas investigações",
        rollTwice: true,
      },
    },
  ];

/**
 * Especificações para "Serviços Perigosos"
 * Rolagem: 1d20
 */
export const DANGEROUS_SERVICES_SPECIFICATIONS: TableEntry<ObjectiveSpecificationEntry>[] =
  [
    {
      min: 1,
      max: 1,
      result: {
        target: "Treinar criatura selvagem",
        description: "Domar e treinar fera",
      },
    },
    {
      min: 2,
      max: 2,
      result: {
        target: "Recrutar criatura hostil",
        description: "Convencer inimigo a se aliar",
      },
    },
    {
      min: 3,
      max: 3,
      result: {
        target: "Curar enfermos extremamente contagiosos",
        description: "Tratar doença perigosa",
      },
    },
    {
      min: 4,
      max: 5,
      result: {
        target: "Negociar com criaturas do subterrâneo",
        description: "Diplomacia com raças subterrâneas",
      },
    },
    {
      min: 6,
      max: 7,
      result: {
        target: "Extrair recursos em local perigoso",
        description: "Minerar em área hostil",
      },
    },
    {
      min: 8,
      max: 9,
      result: {
        target: "Transportar artefatos amaldiçoados",
        description: "Mover itens perigosos",
      },
    },
    {
      min: 10,
      max: 10,
      result: {
        target: "Mediar um conflito de longa data",
        description: "Resolver disputa histórica",
      },
    },
    {
      min: 11,
      max: 12,
      result: {
        target: "Construir em área selvagem",
        description: "Edificar em território hostil",
      },
    },
    {
      min: 13,
      max: 13,
      result: {
        target: "Expurgar um local tóxico ou pútrido",
        description: "Limpar área contaminada",
      },
    },
    {
      min: 14,
      max: 15,
      result: {
        target: "Desarmar armadilhas",
        description: "Neutralizar dispositivos perigosos",
      },
    },
    {
      min: 16,
      max: 16,
      result: {
        target: "Reparar estrutura em ruínas instáveis",
        description: "Consertar construção perigosa",
      },
    },
    {
      min: 17,
      max: 17,
      result: {
        target: "Recolher espécimes tóxicos",
        description: "Coletar materiais venenosos",
      },
    },
    {
      min: 18,
      max: 19,
      result: {
        target: "Extrair substância perigosa",
        description: "Coletar materiais perigosos",
      },
    },
    {
      min: 20,
      max: 20,
      result: {
        target: "Role duas vezes e use ambos",
        description: "Múltiplos serviços perigosos",
        rollTwice: true,
      },
    },
  ];

/**
 * Especificações para "Religioso"
 * Rolagem: 1d20
 */
export const RELIGIOUS_SPECIFICATIONS: TableEntry<ObjectiveSpecificationEntry>[] =
  [
    {
      min: 1,
      max: 2,
      result: {
        target: "Expulsar mortos-vivos de uma tumba ou cripta",
        description: "Purificar local funerário",
      },
    },
    {
      min: 3,
      max: 3,
      result: {
        target: "Escoltar uma peregrinação por terras inóspitas",
        description: "Proteger jornada sagrada",
      },
    },
    {
      min: 4,
      max: 4,
      result: {
        target: "Destituir um culto maligno",
        description: "Eliminar seita profana",
      },
    },
    {
      min: 5,
      max: 5,
      result: {
        target: "Purificar local profano",
        description: "Consagrar área contaminada",
      },
    },
    {
      min: 6,
      max: 6,
      result: {
        target: "Exorcismo de entidade poderosa",
        description: "Banir espírito maligno",
      },
    },
    {
      min: 7,
      max: 7,
      result: {
        target: "Ajudar um ressurgido",
        description: "Auxiliar morto-vivo benevolente",
      },
    },
    {
      min: 8,
      max: 8,
      result: {
        target: "Dar suporte a um celestial",
        description: "Assistir ser angelical",
      },
    },
    {
      min: 9,
      max: 10,
      result: {
        target: "Recuperar ou proteger local sagrado",
        description: "Defender santuário religioso",
      },
    },
    {
      min: 11,
      max: 11,
      result: {
        target: "Buscar ingredientes para uma magia divina",
        description: "Coletar componentes sagrados",
      },
    },
    {
      min: 12,
      max: 12,
      result: {
        target: "Investigar corrupção interna",
        description: "Descobrir traição religiosa",
      },
    },
    {
      min: 13,
      max: 13,
      result: {
        target: "Conter manifestação de entidade desconhecida",
        description: "Controlar aparição misteriosa",
      },
    },
    {
      min: 14,
      max: 14,
      result: {
        target: "Descobrir a origem de um milagre recente",
        description: "Investigar evento divino",
      },
    },
    {
      min: 15,
      max: 15,
      result: {
        target: "Proteger um ritual sagrado contra sabotagem",
        description: "Defender cerimônia importante",
      },
    },
    {
      min: 16,
      max: 17,
      result: {
        target: "Libertar local tomado por forças profanas",
        description: "Reconquistar território sagrado",
      },
    },
    {
      min: 18,
      max: 18,
      result: {
        target: "Mediar disputa entre duas religiões rivais",
        description: "Resolver conflito religioso",
      },
    },
    {
      min: 19,
      max: 19,
      result: {
        target: "Recuperar relíquia roubada de um templo",
        description: "Resgatar item sagrado",
      },
    },
    {
      min: 20,
      max: 20,
      result: {
        target: "Role duas vezes e use ambos",
        description: "Múltiplas missões religiosas",
        rollTwice: true,
      },
    },
  ];

// ====================================
// TABELAS AUXILIARES
// ====================================

/**
 * Tipos de Local (usado quando especificação menciona "Um local")
 * Rolagem: 1d20
 */
export const LOCATION_TYPE_TABLE: TableEntry<{
  type: LocationType;
  description: string;
}>[] = [
  {
    min: 1,
    max: 10,
    result: {
      type: LocationType.MUNDANO,
      description: "Local ou território mundano",
    },
  },
  {
    min: 11,
    max: 12,
    result: { type: LocationType.MAGICO, description: "Local mágico" },
  },
  {
    min: 13,
    max: 14,
    result: { type: LocationType.SAGRADO, description: "Local sagrado" },
  },
  {
    min: 15,
    max: 16,
    result: { type: LocationType.PROFANO, description: "Local profano" },
  },
  {
    min: 17,
    max: 20,
    result: { type: LocationType.ESTRANHO, description: "Local estranho" },
  },
];

// ====================================
// FUNÇÕES UTILITÁRIAS
// ====================================

/**
 * Aplica modificadores de relação para determinação do contratante
 */
export function applyContractorRelationModifiers(
  baseRoll: number,
  populationRelation: string,
  governmentRelation: string
): number {
  let modifiedRoll = baseRoll;

  // Aplicar modificador de população
  const popModifier =
    CONTRACTOR_RELATION_MODIFIERS.population[
      populationRelation as keyof typeof CONTRACTOR_RELATION_MODIFIERS.population
    ] || 0;
  const govModifier =
    CONTRACTOR_RELATION_MODIFIERS.government[
      governmentRelation as keyof typeof CONTRACTOR_RELATION_MODIFIERS.government
    ] || 0;

  modifiedRoll += popModifier + govModifier;

  // Garantir que o resultado esteja no range válido
  return Math.max(1, Math.min(20, modifiedRoll));
}

/**
 * Obtém a tabela de especificações baseada na categoria do objetivo
 */
export function getObjectiveSpecificationTable(
  category: ObjectiveCategory
): TableEntry<ObjectiveSpecificationEntry>[] {
  switch (category) {
    case ObjectiveCategory.ATACAR_DESTRUIR:
      return ATTACK_DESTROY_SPECIFICATIONS;
    case ObjectiveCategory.ENCONTRAR_RECUPERAR:
      return FIND_RECOVER_SPECIFICATIONS;
    case ObjectiveCategory.CAPTURAR:
      return CAPTURE_SPECIFICATIONS;
    case ObjectiveCategory.PROTEGER_SALVAR:
      return PROTECT_SAVE_SPECIFICATIONS;
    case ObjectiveCategory.EXPLORAR_DESCOBRIR:
      return EXPLORE_DISCOVER_SPECIFICATIONS;
    case ObjectiveCategory.ENTREGAR_RECEBER:
      return DELIVER_RECEIVE_SPECIFICATIONS;
    case ObjectiveCategory.INVESTIGAR_SABOTAR:
      return INVESTIGATE_SABOTAGE_SPECIFICATIONS;
    case ObjectiveCategory.SERVICOS_PERIGOSOS:
      return DANGEROUS_SERVICES_SPECIFICATIONS;
    case ObjectiveCategory.RELIGIOSO:
      return RELIGIOUS_SPECIFICATIONS;
    default:
      throw new Error(`Categoria de objetivo não reconhecida: ${category}`);
  }
}

/**
 * Determina se deve rolar duas vezes (resultado 20 na tabela principal)
 */
export function shouldRollTwiceForObjective(
  objectiveResult: ObjectiveEntry
): boolean {
  return objectiveResult.name === "Role duas vezes e use ambos";
}

/**
 * Determina se deve rolar duas vezes na especificação (rollTwice = true)
 */
export function shouldRollTwiceForSpecification(
  specResult: ObjectiveSpecificationEntry
): boolean {
  return specResult.rollTwice === true;
}
