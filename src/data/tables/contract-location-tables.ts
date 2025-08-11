/**
 * Tabelas de Localidades para Contratos da Guilda
 *
 * Implementa todas as tabelas do sistema de localidades dos contratos:
 * - Localidade Principal
 * - Especificações por tipo de localidade
 * - Características do local (Importância e Peculiaridade)
 * - Distrito Específico
 */

import type { TableEntry } from "@/types/tables";
import { LocationCategory, UrbanLocation } from "@/types/contract";

// ====================================
// TIPOS E ENUMS ESPECÍFICOS
// ====================================

// Enum para localidades principais da tabela base
export enum MainLocation {
  CIDADE_GRANDE = "cidade_grande",
  RUINAS_MASMORRAS = "ruinas_masmorras",
  REGIAO_SELVAGEM = "regiao_selvagem",
  LUGAR_ISOLADO = "lugar_isolado",
  ZONA_RURAL = "zona_rural",
  LOCALIDADE_EXOTICA = "localidade_exotica",
  PROFUNDEZAS = "profundezas",
  TERRAS_MORBIDAS = "terras_morbidas",
}

// Enum para importância do local
export enum LocationImportance {
  NENHUMA = "nenhuma",
  ACONTECIMENTO_HISTORICO = "acontecimento_historico",
  EXTRACAO_RECURSOS = "extracao_recursos",
  LOCAL_SAGRADO = "local_sagrado",
  PONTO_INTERESSE_ANTIGO = "ponto_interesse_antigo",
  RELEVANTE_CONTRATANTE = "relevante_contratante",
  BERCO_LENDAS = "berco_lendas",
  FLUTUACAO_MAGICA = "flutuacao_magica",
  ESTRATEGICAMENTE_VANTAJOSO = "estrategicamente_vantajoso",
  RELIQUIA_ESQUECIDA = "reliquia_esquecida",
}

// Enum para peculiaridades
export enum LocationPeculiarity {
  NENHUMA = "nenhuma",
  RELEVANTE_CONTRATADO = "relevante_contratado",
  CONJURADORES_FREQUENTAM = "conjuradores_frequentam",
  COMBATENTES_EVITAM = "combatentes_evitam",
  ADEPTOS_ESTUDAM = "adeptos_estudam",
  ESPECIALISTAS_TRABALHAM = "especialistas_trabalham",
  TEMA_CONTOS = "tema_contos",
  AVENTUREIROS_FREQUENTES = "aventureiros_frequentes",
  INTERESSE_DRAGOES = "interesse_dragoes",
  INTERESSE_ASSENTAMENTOS = "interesse_assentamentos",
}

// Enum para distritos específicos
export enum DistrictType {
  MARGINALIZADO = "marginalizado",
  PLEBEU = "plebeu",
  CORPORACOES_OFICIO = "corporacoes_oficio",
  COMERCIAL = "comercial",
  RELIGIOSO = "religioso",
  NOBRE = "nobre",
  PROXIMO_FORA = "proximo_fora",
}

// ====================================
// INTERFACES
// ====================================

// Interface para entrada de localidade principal
interface MainLocationEntry {
  category: MainLocation;
  name: string;
  description: string;
}

// Interface para especificações de localidade
interface LocationSpecificationEntry {
  location: string;
  description: string;
  rollTwice?: boolean;
}

// Interface para características do local
interface LocationCharacteristicEntry {
  type: LocationImportance | LocationPeculiarity;
  name: string;
  description: string;
}

// Interface para distrito
interface DistrictEntry {
  type: DistrictType;
  name: string;
  description: string;
  rollTwice?: boolean;
}

// ====================================
// TABELA PRINCIPAL - LOCALIDADES
// ====================================

/**
 * Localidade Principal - Tabela base para determinar o tipo de local
 * Rolagem: 1d20
 */
export const MAIN_LOCATION_TABLE: TableEntry<MainLocationEntry>[] = [
  {
    min: 1,
    max: 4,
    result: {
      category: MainLocation.CIDADE_GRANDE,
      name: "Cidade grande",
      description: "Qualquer vila grande, cidadela ou cidade grande",
    },
  },
  {
    min: 5,
    max: 9,
    result: {
      category: MainLocation.RUINAS_MASMORRAS,
      name: "Ruínas ou masmorras",
      description:
        "Estruturas antigas, complexos subterrâneos ou construções arruinadas",
    },
  },
  {
    min: 10,
    max: 12,
    result: {
      category: MainLocation.REGIAO_SELVAGEM,
      name: "Região selvagem",
      description:
        "Territórios naturais indomados, florestas, desertos ou montanhas",
    },
  },
  {
    min: 13,
    max: 14,
    result: {
      category: MainLocation.LUGAR_ISOLADO,
      name: "Lugar isolado",
      description:
        "Locais remotos, de difícil acesso ou completamente separados da civilização",
    },
  },
  {
    min: 15,
    max: 17,
    result: {
      category: MainLocation.ZONA_RURAL,
      name: "Zona rural",
      description: "Áreas agrícolas, aldeias pequenas e comunidades rurais",
    },
  },
  {
    min: 18,
    max: 18,
    result: {
      category: MainLocation.LOCALIDADE_EXOTICA,
      name: "Localidade exótica",
      description: "Locais mágicos, planares ou de natureza extraordinária",
    },
  },
  {
    min: 19,
    max: 19,
    result: {
      category: MainLocation.PROFUNDEZAS,
      name: "Profundezas",
      description:
        "Locais subterrâneos profundos, cavernas ou estruturas enterradas",
    },
  },
  {
    min: 20,
    max: 20,
    result: {
      category: MainLocation.TERRAS_MORBIDAS,
      name: "Terras mórbidas",
      description: "Locais corrompidos, amaldiçoados ou tocados pela morte",
    },
  },
];

// ====================================
// CARACTERÍSTICAS DO LOCAL
// ====================================

/**
 * Importância do Local
 * Rolagem: 1d20
 * Baseado na seção "Importância do Local"
 */
export const LOCATION_IMPORTANCE_TABLE: TableEntry<LocationCharacteristicEntry>[] =
  [
    {
      min: 1,
      max: 11,
      result: {
        type: LocationImportance.NENHUMA,
        name: "Aparentemente nenhuma",
        description: "O local não parece ter qualquer importância especial",
      },
    },
    {
      min: 12,
      max: 12,
      result: {
        type: LocationImportance.ACONTECIMENTO_HISTORICO,
        name: "Acontecimento histórico relevante",
        description: "Local onde ocorreu um evento histórico importante",
      },
    },
    {
      min: 13,
      max: 13,
      result: {
        type: LocationImportance.EXTRACAO_RECURSOS,
        name: "Extração de recursos",
        description: "Local rico em recursos naturais ou materiais valiosos",
      },
    },
    {
      min: 14,
      max: 14,
      result: {
        type: LocationImportance.LOCAL_SAGRADO,
        name: "Local sagrado para algum culto",
        description: "Lugar de importância religiosa ou espiritual",
      },
    },
    {
      min: 15,
      max: 15,
      result: {
        type: LocationImportance.PONTO_INTERESSE_ANTIGO,
        name: "Ponto de interesse de uma antiga civilização",
        description: "Vestígios ou ruínas de uma civilização perdida",
      },
    },
    {
      min: 16,
      max: 16,
      result: {
        type: LocationImportance.RELEVANTE_CONTRATANTE,
        name: "Local relevante para o contratante",
        description:
          "O local tem significado pessoal para quem ofereceu o contrato",
      },
    },
    {
      min: 17,
      max: 17,
      result: {
        type: LocationImportance.BERCO_LENDAS,
        name: "Berço de lendas/pessoas importantes",
        description:
          "Local famoso por ter sido lar de heróis ou figuras legendárias",
      },
    },
    {
      min: 18,
      max: 18,
      result: {
        type: LocationImportance.FLUTUACAO_MAGICA,
        name: "Flutuação mágica na trama da magia",
        description:
          "Local onde a magia se comporta de forma instável ou diferente",
      },
    },
    {
      min: 19,
      max: 19,
      result: {
        type: LocationImportance.ESTRATEGICAMENTE_VANTAJOSO,
        name: "Local estrategicamente vantajoso",
        description:
          "Posição que oferece vantagens militares, comerciais ou políticas",
      },
    },
    {
      min: 20,
      max: 20,
      result: {
        type: LocationImportance.RELIQUIA_ESQUECIDA,
        name: "Relíquia esquecida",
        description: "Local que abriga algum artefato ou conhecimento perdido",
      },
    },
  ];

/**
 * Peculiaridade do Local
 * Rolagem: 1d20
 * Baseado na seção "Peculiaridade"
 */
export const LOCATION_PECULIARITY_TABLE: TableEntry<LocationCharacteristicEntry>[] =
  [
    {
      min: 1,
      max: 11,
      result: {
        type: LocationPeculiarity.NENHUMA,
        name: "Aparentemente nenhuma",
        description:
          "O local não demonstra características peculiares evidentes",
      },
    },
    {
      min: 12,
      max: 12,
      result: {
        type: LocationPeculiarity.RELEVANTE_CONTRATADO,
        name: "Local relevante para o contratado",
        description: "O local tem alguma conexão pessoal com os aventureiros",
      },
    },
    {
      min: 13,
      max: 13,
      result: {
        type: LocationPeculiarity.CONJURADORES_FREQUENTAM,
        name: "Conjuradores frequentam o local",
        description:
          "Magos e feiticeiros costumam visitar ou estudar este lugar",
      },
    },
    {
      min: 14,
      max: 14,
      result: {
        type: LocationPeculiarity.COMBATENTES_EVITAM,
        name: "Combatentes o evitam",
        description:
          "Guerreiros e lutadores tendem a evitar este local por algum motivo",
      },
    },
    {
      min: 15,
      max: 15,
      result: {
        type: LocationPeculiarity.ADEPTOS_ESTUDAM,
        name: "Adeptos estudam o local",
        description:
          "Estudiosos e eruditos consideram este lugar importante para pesquisa",
      },
    },
    {
      min: 16,
      max: 16,
      result: {
        type: LocationPeculiarity.ESPECIALISTAS_TRABALHAM,
        name: "Especialistas usam como trabalho",
        description:
          "Artesãos ou profissionais específicos operam regularmente aqui",
      },
    },
    {
      min: 17,
      max: 17,
      result: {
        type: LocationPeculiarity.TEMA_CONTOS,
        name: "Tema de contos e canções",
        description: "Local famoso nas histórias e lendas populares",
      },
    },
    {
      min: 18,
      max: 18,
      result: {
        type: LocationPeculiarity.AVENTUREIROS_FREQUENTES,
        name: "Aventureiros são frequentes por lá",
        description: "O local é comumente visitado por grupos de aventureiros",
      },
    },
    {
      min: 19,
      max: 19,
      result: {
        type: LocationPeculiarity.INTERESSE_DRAGOES,
        name: "Ponto de interesse de dragões",
        description: "Dragões têm algum interesse especial neste local",
      },
    },
    {
      min: 20,
      max: 20,
      result: {
        type: LocationPeculiarity.INTERESSE_ASSENTAMENTOS,
        name: "Ponto de interesse de outros assentamentos",
        description:
          "Outras cidades ou reinos consideram este local estratégico",
      },
    },
  ];

// ====================================
// ESPECIFICAÇÕES POR LOCALIDADE
// ====================================

/**
 * Cidade Grande - Especificações
 * Rolagem: 1d20
 * Baseado na seção "Cidade Grande"
 */
export const CIDADE_GRANDE_SPECIFICATIONS: TableEntry<LocationSpecificationEntry>[] =
  [
    {
      min: 1,
      max: 1,
      result: {
        location: "Esgotos/subterrâneo da cidade",
        description: "Nos túneis e canais subterrâneos que correm sob a cidade",
      },
    },
    {
      min: 2,
      max: 2,
      result: {
        location: "Na moradia do líder local",
        description: "Na residência oficial ou palácio do governante da cidade",
      },
    },
    {
      min: 3,
      max: 4,
      result: {
        location: "Em um distrito específico",
        description:
          "Em um bairro ou distrito particular da cidade (role na tabela de distritos)",
      },
    },
    {
      min: 5,
      max: 5,
      result: {
        location: "Casarão nobre",
        description: "Na mansão ou propriedade de uma família nobre",
      },
    },
    {
      min: 6,
      max: 6,
      result: {
        location: "Em uma das tavernas",
        description: "Em alguma taverna, estalagem ou estabelecimento similar",
      },
    },
    {
      min: 7,
      max: 7,
      result: {
        location: "Templo local",
        description: "No principal templo ou local de adoração da cidade",
      },
    },
    {
      min: 8,
      max: 8,
      result: {
        location: "Local de recuperação de enfermos",
        description: "Hospital, sanatorium ou local de cura",
      },
    },
    {
      min: 9,
      max: 9,
      result: {
        location: "Construção/local icônico",
        description: "Marco famoso ou construção emblemática da cidade",
      },
    },
    {
      min: 10,
      max: 10,
      result: {
        location: "Centro de treinamento/estudos",
        description:
          "Academia, universidade, escola de magia ou centro de treinamento",
      },
    },
    {
      min: 11,
      max: 12,
      result: {
        location: "Submundo urbano",
        description:
          "Áreas controladas por criminosos, guetos ou zonas perigosas",
      },
    },
    {
      min: 13,
      max: 14,
      result: {
        location: "Cemitério ou cripta",
        description: "Necrópole, cemitério municipal ou mausoléu importante",
      },
    },
    {
      min: 15,
      max: 15,
      result: {
        location: "Mercado ou praça central",
        description:
          "Praça principal de comércio ou centro econômico da cidade",
      },
    },
    {
      min: 16,
      max: 16,
      result: {
        location: "Quartel ou posto de guarda",
        description:
          "Instalação militar, quartel da guarda ou posto de segurança",
      },
    },
    {
      min: 17,
      max: 17,
      result: {
        location: "Área portuária ou entrada da cidade",
        description:
          "Portões principais, porto, docas ou área de entrada/saída",
      },
    },
    {
      min: 18,
      max: 18,
      result: {
        location: "Armazém ou depósito",
        description: "Instalações de armazenamento, depósitos ou entrepostos",
      },
    },
    {
      min: 19,
      max: 19,
      result: {
        location: "Torre ou fortificação",
        description: "Torre de observação, forte ou estrutura defensiva",
      },
    },
    {
      min: 20,
      max: 20,
      result: {
        location: "Role duas vezes e use ambos",
        description: "Combine dois locais diferentes na mesma cidade",
        rollTwice: true,
      },
    },
  ];

/**
 * Ruínas ou Masmorras - Especificações
 * Rolagem: 1d20
 * Baseado na seção "Ruínas ou Masmorras"
 */
export const RUINAS_MASMORRAS_SPECIFICATIONS: TableEntry<LocationSpecificationEntry>[] =
  [
    {
      min: 1,
      max: 1,
      result: {
        location: "Complexo de cavernas",
        description:
          "Sistema natural de cavernas, grutas e passagens subterrâneas",
      },
    },
    {
      min: 2,
      max: 2,
      result: {
        location: "Assentamento humanoide",
        description:
          "Ruínas de cidade, vila ou acampamento de raças humanoides",
      },
    },
    {
      min: 3,
      max: 4,
      result: {
        location: "Torre/fortaleza esquecida",
        description: "Estrutura militar ou defensiva em ruínas",
      },
    },
    {
      min: 5,
      max: 5,
      result: {
        location: "Labirinto",
        description: "Complexo de passagens confusas, natural ou construído",
      },
    },
    {
      min: 6,
      max: 7,
      result: {
        location: "Mina abandonada",
        description: "Instalação de mineração desativada com túneis e poços",
      },
    },
    {
      min: 8,
      max: 8,
      result: {
        location: "Calabouço arruinado",
        description: "Antiga prisão ou masmorra em estado de deterioração",
      },
    },
    {
      min: 9,
      max: 9,
      result: {
        location: "Tumba de um antigo Rei",
        description: "Sepulcro real ou de figura importante do passado",
      },
    },
    {
      min: 10,
      max: 10,
      result: {
        location: "Estrutura soterrada/inundada",
        description: "Construção coberta pela terra ou submersa",
      },
    },
    {
      min: 11,
      max: 11,
      result: {
        location: "Ilha amaldiçoada",
        description: "Ilha isolada com alguma maldição ou poder sombrio",
      },
    },
    {
      min: 12,
      max: 14,
      result: {
        location: "Masmorra",
        description: "Complexo subterrâneo artificial com múltiplos níveis",
      },
    },
    {
      min: 15,
      max: 15,
      result: {
        location: "Encontradas em um distrito específico",
        description: "Ruínas localizadas dentro ou sob um distrito urbano",
      },
    },
    {
      min: 16,
      max: 17,
      result: {
        location: "Templo em ruínas",
        description: "Local de adoração antigo, agora em estado de abandono",
      },
    },
    {
      min: 18,
      max: 18,
      result: {
        location: "Prisão ou cativeiro antigo",
        description: "Complexo carcerário ou local de detenção em ruínas",
      },
    },
    {
      min: 19,
      max: 19,
      result: {
        location: "Cidade subterrânea perdida",
        description:
          "Metrópole inteira construída no subsolo, agora abandonada",
      },
    },
    {
      min: 20,
      max: 20,
      result: {
        location: "Role duas vezes e use ambos",
        description: "Combine dois tipos diferentes de ruínas ou masmorras",
        rollTwice: true,
      },
    },
  ];

/**
 * Região Selvagem - Especificações
 * Rolagem: 1d20
 * Baseado na seção "Região Selvagem"
 */
export const REGIAO_SELVAGEM_SPECIFICATIONS: TableEntry<LocationSpecificationEntry>[] =
  [
    {
      min: 1,
      max: 1,
      result: {
        location: "Floresta/bosque",
        description: "Área densamente arborizada com vegetação fechada",
      },
    },
    {
      min: 2,
      max: 2,
      result: {
        location: "Deserto escaldante",
        description: "Região árida com temperaturas extremas e pouca água",
      },
    },
    {
      min: 3,
      max: 3,
      result: {
        location: "Pântano viscoso",
        description:
          "Área alagadiça com lama, gases tóxicos e vegetação aquática",
      },
    },
    {
      min: 4,
      max: 4,
      result: {
        location: "Complexo de cavernas",
        description:
          "Sistema natural de cavernas ao ar livre ou semi-subterrâneas",
      },
    },
    {
      min: 5,
      max: 5,
      result: {
        location: "Tundra esquecida",
        description: "Planície gelada com pouca vegetação e clima severo",
      },
    },
    {
      min: 6,
      max: 6,
      result: {
        location: "Montanhas sinuosas",
        description: "Cadeia montanhosa com picos altos e vales profundos",
      },
    },
    {
      min: 7,
      max: 7,
      result: {
        location: "Savana/descampado/pradaria",
        description:
          "Planície aberta com vegetação rasteira e poucos obstáculos",
      },
    },
    {
      min: 8,
      max: 8,
      result: {
        location: "Desfiladeiro/ravina mortal",
        description:
          "Passagem estreita entre rochas ou vale profundo e perigoso",
      },
    },
    {
      min: 9,
      max: 9,
      result: {
        location: "Região vulcânica",
        description: "Área com atividade vulcânica, lava e terreno instável",
      },
    },
    {
      min: 10,
      max: 10,
      result: {
        location: "Cânions profundos",
        description:
          "Formações rochosas com gargantas e precipícios vertiginosos",
      },
    },
    {
      min: 11,
      max: 11,
      result: {
        location: "Região costeira perigosa",
        description:
          "Litoral com recifes, tempestades marítimas e correntes traiçoeiras",
      },
    },
    {
      min: 12,
      max: 12,
      result: {
        location: "Platô isolado",
        description: "Elevação rochosa de topo plano, difícil de acessar",
      },
    },
    {
      min: 13,
      max: 13,
      result: {
        location: "Estepe gelada",
        description: "Planície fria com ventos constantes e vegetação escassa",
      },
    },
    {
      min: 14,
      max: 14,
      result: {
        location: "Selva densa e hostil",
        description:
          "Floresta tropical impenetrável com vida selvagem perigosa",
      },
    },
    {
      min: 15,
      max: 15,
      result: {
        location: "Território de geysers e fontes termais",
        description: "Área com atividade geotérmica, águas quentes e vapor",
      },
    },
    {
      min: 16,
      max: 16,
      result: {
        location: "Planície alagada",
        description: "Região de várzea constantemente inundada",
      },
    },
    {
      min: 17,
      max: 17,
      result: {
        location: "Penhasco gélido",
        description: "Formação rochosa vertical em região de clima frio",
      },
    },
    {
      min: 18,
      max: 18,
      result: {
        location: "Oásis oculto",
        description: "Fonte de água escondida em região árida",
      },
    },
    {
      min: 19,
      max: 19,
      result: {
        location: "Colinas traiçoeiras",
        description: "Terreno acidentado com elevações perigosas ou instáveis",
      },
    },
    {
      min: 20,
      max: 20,
      result: {
        location: "Role duas vezes e use ambos",
        description: "Combine dois tipos diferentes de terreno selvagem",
        rollTwice: true,
      },
    },
  ];

/**
 * Lugar Isolado - Especificações
 * Rolagem: 1d20
 * Baseado na seção "Lugar Isolado"
 */
export const LUGAR_ISOLADO_SPECIFICATIONS: TableEntry<LocationSpecificationEntry>[] =
  [
    {
      min: 1,
      max: 1,
      result: {
        location: "Região não mapeada ou inexplorada",
        description:
          "Área completamente desconhecida, fora dos mapas convencionais",
      },
    },
    {
      min: 2,
      max: 2,
      result: {
        location: "Monastério",
        description: "Complexo religioso isolado para contemplação e estudo",
      },
    },
    {
      min: 3,
      max: 3,
      result: {
        location: "Fortaleza distante",
        description: "Fortificação militar em local remoto e estratégico",
      },
    },
    {
      min: 4,
      max: 4,
      result: {
        location: "Torre de um arcanista",
        description:
          "Torre solitária usada por mago ou estudioso das artes arcanas",
      },
    },
    {
      min: 5,
      max: 5,
      result: {
        location: "Floresta densa",
        description: "Mata fechada e impenetrável, longe de qualquer trilha",
      },
    },
    {
      min: 6,
      max: 6,
      result: {
        location: "Covil de uma criatura rara",
        description: "Habitação natural de criatura única ou extraordinária",
      },
    },
    {
      min: 7,
      max: 7,
      result: {
        location: "Ilha exótica",
        description: "Ilha isolada com características únicas ou misteriosas",
      },
    },
    {
      min: 8,
      max: 8,
      result: {
        location: "Posto avançado em zona de conflito",
        description:
          "Instalação militar em área de guerra ou disputas territoriais",
      },
    },
    {
      min: 9,
      max: 9,
      result: {
        location: "Engenhoca monumental",
        description:
          "Construção antiga de propósito desconhecido ou maquinário gigante",
      },
    },
    {
      min: 10,
      max: 10,
      result: {
        location: "Masmorra inóspita",
        description: "Complexo subterrâneo em local remoto e de difícil acesso",
      },
    },
    {
      min: 11,
      max: 11,
      result: {
        location: "Vale oculto entre montanhas",
        description: "Depressão escondida cercada por picos montanhosos",
      },
    },
    {
      min: 12,
      max: 12,
      result: {
        location: "Caverna de difícil acesso",
        description: "Gruta em penhasco ou local que requer escalada perigosa",
      },
    },
    {
      min: 13,
      max: 13,
      result: {
        location: "Refúgio subterrâneo",
        description: "Abrigo escavado ou natural em local oculto",
      },
    },
    {
      min: 14,
      max: 14,
      result: {
        location: "Pico nevado isolado",
        description: "Montanha solitária coberta de neve perpétua",
      },
    },
    {
      min: 15,
      max: 15,
      result: {
        location: "Penhasco ou abismo remoto",
        description:
          "Formação rochosa vertical ou buraco profundo em área isolada",
      },
    },
    {
      min: 16,
      max: 16,
      result: {
        location: "Minas desativadas",
        description: "Complexo de mineração abandonado em local distante",
      },
    },
    {
      min: 17,
      max: 17,
      result: {
        location: "Poço profundo no deserto",
        description:
          "Fonte de água ou buraco misterioso em região árida isolada",
      },
    },
    {
      min: 18,
      max: 18,
      result: {
        location: "Vila eremita ou de exilados",
        description:
          "Pequena comunidade de pessoas que se isolaram voluntariamente",
      },
    },
    {
      min: 19,
      max: 19,
      result: {
        location: "Santuário natural protegido",
        description: "Local sagrado natural guardado por forças mysteriosas",
      },
    },
    {
      min: 20,
      max: 20,
      result: {
        location: "Role duas vezes e use ambos",
        description: "Combine dois tipos diferentes de locais isolados",
        rollTwice: true,
      },
    },
  ];

/**
 * Zona Rural - Especificações
 * Rolagem: 1d20
 * Baseado na seção "Zona Rural"
 */
export const ZONA_RURAL_SPECIFICATIONS: TableEntry<LocationSpecificationEntry>[] =
  [
    {
      min: 1,
      max: 2,
      result: {
        location: "Pequena aldeia",
        description:
          "Comunidade rural modesta com algumas dezenas de habitantes",
      },
    },
    {
      min: 3,
      max: 3,
      result: {
        location: "Vilarejo desprotegido",
        description: "Pequeno assentamento sem muralhas ou defesas organizadas",
      },
    },
    {
      min: 4,
      max: 4,
      result: {
        location: "Grande plantação/vinhedo",
        description:
          "Propriedade agrícola extensa dedicada ao cultivo específico",
      },
    },
    {
      min: 5,
      max: 5,
      result: {
        location: "Lugarejo",
        description: "Pequeno agrupamento de casas rurais",
      },
    },
    {
      min: 6,
      max: 6,
      result: {
        location: "Povoado humilde",
        description: "Comunidade rural simples com recursos limitados",
      },
    },
    {
      min: 7,
      max: 7,
      result: {
        location: "Fazenda",
        description:
          "Propriedade rural dedicada à criação de animais e agricultura",
      },
    },
    {
      min: 8,
      max: 8,
      result: {
        location: "Comunidade itinerante",
        description: "Grupo nômade ou semi-nômade que se move sazonalmente",
      },
    },
    {
      min: 9,
      max: 9,
      result: {
        location: "Celeiro/moinho/estábulo",
        description:
          "Instalação agrícola específica para armazenamento ou processamento",
      },
    },
    {
      min: 10,
      max: 10,
      result: {
        location: "Criadouro/abatedouro",
        description: "Instalação dedicada à criação e processamento de animais",
      },
    },
    {
      min: 11,
      max: 11,
      result: {
        location: "Pousada isolada",
        description: "Estabelecimento de hospedagem em estrada rural",
      },
    },
    {
      min: 12,
      max: 12,
      result: {
        location: "Campo de cultivo",
        description: "Área agrícola ativa dedicada ao plantio",
      },
    },
    {
      min: 13,
      max: 13,
      result: {
        location: "Mercado rural",
        description: "Ponto de comércio local para produtos agropecuários",
      },
    },
    {
      min: 14,
      max: 14,
      result: {
        location: "Capela ou santuário na natureza",
        description: "Local de adoração simples em ambiente rural",
      },
    },
    {
      min: 15,
      max: 15,
      result: {
        location: "Escola ou posto em um campo",
        description: "Instalação educacional ou administrativa rural",
      },
    },
    {
      min: 16,
      max: 16,
      result: {
        location: "Oficina rural",
        description: "Local de trabalho artesanal especializado no campo",
      },
    },
    {
      min: 17,
      max: 17,
      result: {
        location: "Armazém de grãos",
        description: "Instalação para estocagem de produtos agrícolas",
      },
    },
    {
      min: 18,
      max: 18,
      result: {
        location: "Área de pastagem",
        description: "Campo aberto dedicado ao pastoreio de animais",
      },
    },
    {
      min: 19,
      max: 20,
      result: {
        location: "Role duas vezes e use ambos",
        description: "Combine dois tipos diferentes de locais rurais",
        rollTwice: true,
      },
    },
  ];

/**
 * Localidade Exótica - Especificações
 * Rolagem: 1d20
 * Baseado na seção "Localidade Exótica"
 */
export const LOCALIDADE_EXOTICA_SPECIFICATIONS: TableEntry<LocationSpecificationEntry>[] =
  [
    {
      min: 1,
      max: 2,
      result: {
        location: "Plano feérico",
        description: "Dimensão mágica habitada por fadas e criaturas feéricas",
      },
    },
    {
      min: 3,
      max: 3,
      result: {
        location: "Dentro de um objeto pequeno",
        description:
          "Espaço extradimensional contido em item aparentemente comum",
      },
    },
    {
      min: 4,
      max: 6,
      result: {
        location: "Floresta mágica",
        description: "Mata encantada com propriedades sobrenaturais",
      },
    },
    {
      min: 7,
      max: 7,
      result: {
        location: "Plano elemental",
        description: "Dimensão dedicada a um dos elementos primordiais",
      },
    },
    {
      min: 8,
      max: 8,
      result: {
        location: "Dentro de uma criatura",
        description: "Interior do corpo de uma criatura gigantesca ou mágica",
      },
    },
    {
      min: 9,
      max: 10,
      result: {
        location: "Pirâmide/zigurate",
        description:
          "Estrutura antiga em formato piramidal com propósitos místicos",
      },
    },
    {
      min: 11,
      max: 11,
      result: {
        location: "Assentamento submarino",
        description: "Cidade ou vila construída sob as águas",
      },
    },
    {
      min: 12,
      max: 12,
      result: {
        location: "Plano astral",
        description:
          "Dimensão espiritual onde as almas e pensamentos têm forma",
      },
    },
    {
      min: 13,
      max: 13,
      result: {
        location: "Abismo ou Inferno",
        description: "Planos malignos habitados por demônios ou diabos",
      },
    },
    {
      min: 14,
      max: 14,
      result: {
        location: "Umbra",
        description: "Plano das sombras, reflexo sombrio do mundo material",
      },
    },
    {
      min: 15,
      max: 15,
      result: {
        location: "Labirinto dimensional",
        description: "Estrutura que atravessa múltiplas dimensões",
      },
    },
    {
      min: 16,
      max: 16,
      result: {
        location: "Cidade voadora",
        description: "Assentamento que flutua no ar por meios mágicos",
      },
    },
    {
      min: 17,
      max: 17,
      result: {
        location: "Ilha flutuante",
        description: "Massa de terra suspensa no ar ou em outra substância",
      },
    },
    {
      min: 18,
      max: 18,
      result: {
        location: "Biblioteca infinita",
        description: "Repositório de conhecimento que se estende infinitamente",
      },
    },
    {
      min: 19,
      max: 19,
      result: {
        location: "Santuário cristalino",
        description: "Local sagrado feito inteiramente de cristais mágicos",
      },
    },
    {
      min: 20,
      max: 20,
      result: {
        location: "Role duas vezes e use ambos",
        description: "Combine dois tipos diferentes de localidades exóticas",
        rollTwice: true,
      },
    },
  ];

/**
 * Profundezas - Especificações
 * Rolagem: 1d20
 * Baseado na seção "Profundezas"
 */
export const PROFUNDEZAS_SPECIFICATIONS: TableEntry<LocationSpecificationEntry>[] =
  [
    {
      min: 1,
      max: 1,
      result: {
        location: "Complexo de cavernas",
        description: "Sistema natural extenso de cavernas interligadas",
      },
    },
    {
      min: 2,
      max: 2,
      result: {
        location: "Despenhadeiro",
        description: "Precipício profundo ou abismo natural",
      },
    },
    {
      min: 3,
      max: 3,
      result: {
        location: "Ravina subterrânea",
        description: "Fenda profunda no solo que se estende para baixo",
      },
    },
    {
      min: 4,
      max: 4,
      result: {
        location: "Fossa abissal",
        description: "Buraco extremamente profundo de origem misteriosa",
      },
    },
    {
      min: 5,
      max: 6,
      result: {
        location: "Tumba esquecida",
        description: "Sepulcro antigo localizado em grandes profundidades",
      },
    },
    {
      min: 7,
      max: 8,
      result: {
        location: "Cripta",
        description: "Câmara mortuária subterrânea com múltiplas sepulturas",
      },
    },
    {
      min: 9,
      max: 10,
      result: {
        location: "Assentamento de humanoides",
        description:
          "Cidade ou vila subterrânea de raças que vivem nas profundezas",
      },
    },
    {
      min: 11,
      max: 11,
      result: {
        location: "Fenda submarina",
        description: "Abismo no fundo do mar ou lago",
      },
    },
    {
      min: 12,
      max: 12,
      result: {
        location: "Cemitério de monstruosidades",
        description: "Local onde criaturas gigantescas vão morrer",
      },
    },
    {
      min: 13,
      max: 13,
      result: {
        location: "Labirinto",
        description: "Complexo de túneis confusos nas profundezas",
      },
    },
    {
      min: 14,
      max: 15,
      result: {
        location: "Mina abandonada",
        description:
          "Instalação de mineração desativada que se estende profundamente",
      },
    },
    {
      min: 16,
      max: 16,
      result: {
        location: "Sistema de túneis",
        description: "Rede interligada de passagens subterrâneas",
      },
    },
    {
      min: 17,
      max: 17,
      result: {
        location: "Gruta submersa",
        description: "Caverna completamente inundada",
      },
    },
    {
      min: 18,
      max: 18,
      result: {
        location: "Câmaras secretas",
        description: "Salas ocultas em estruturas subterrâneas",
      },
    },
    {
      min: 19,
      max: 19,
      result: {
        location: "Prisão subterrânea",
        description: "Complexo carcerário construído nas profundezas",
      },
    },
    {
      min: 20,
      max: 20,
      result: {
        location: "Role duas vezes e use ambos",
        description: "Combine dois tipos diferentes de locais profundos",
        rollTwice: true,
      },
    },
  ];

/**
 * Terras Mórbidas - Especificações
 * Rolagem: 1d20
 * Baseado na seção "Terras Mórbidas"
 */
export const TERRAS_MORBIDAS_SPECIFICATIONS: TableEntry<LocationSpecificationEntry>[] =
  [
    {
      min: 1,
      max: 1,
      result: {
        location: "Cemitério esquecido",
        description: "Necrópole antiga abandonada e corrompida",
      },
    },
    {
      min: 2,
      max: 2,
      result: {
        location: "Catacumbas",
        description: "Rede subterrânea de túneis mortuários",
      },
    },
    {
      min: 3,
      max: 3,
      result: {
        location: "Templo profanado",
        description: "Local de adoração corrompido por forças malignas",
      },
    },
    {
      min: 4,
      max: 4,
      result: {
        location: "Campo de batalha devastado",
        description: "Local de conflito onde muitas vidas foram perdidas",
      },
    },
    {
      min: 5,
      max: 5,
      result: {
        location: "Zona morta",
        description: "Área onde nada vive devido à influência necromântica",
      },
    },
    {
      min: 6,
      max: 6,
      result: {
        location: "Vales rúnicos",
        description: "Depressão marcada com símbolos antigos de poder sombrio",
      },
    },
    {
      min: 7,
      max: 7,
      result: {
        location: "Assentamento próximo",
        description:
          "Vila ou cidade afetada pela proximidade com terras mórbidas",
      },
    },
    {
      min: 8,
      max: 8,
      result: {
        location: "Ruína maldita",
        description: "Estrutura antiga tocada por maldições persistentes",
      },
    },
    {
      min: 9,
      max: 9,
      result: {
        location: "Covil monstruoso",
        description: "Habitação de criatura abominável ou morta-viva",
      },
    },
    {
      min: 10,
      max: 10,
      result: {
        location: "Pântano sombrio",
        description: "Área alagadiça corrompida por energias necromânticas",
      },
    },
    {
      min: 11,
      max: 11,
      result: {
        location: "Terra amaldiçoada",
        description:
          "Solo marcado por maldições que impedem o crescimento natural",
      },
    },
    {
      min: 12,
      max: 12,
      result: {
        location: "Floresta necrótica",
        description: "Mata onde as árvores estão mortas mas ainda se movem",
      },
    },
    {
      min: 13,
      max: 13,
      result: {
        location: "Deserto de ossos",
        description: "Região árida coberta de ossadas de criaturas mortas",
      },
    },
    {
      min: 14,
      max: 14,
      result: {
        location: "Lago venenoso",
        description: "Corpo d'água contaminado por toxinas sobrenaturais",
      },
    },
    {
      min: 15,
      max: 15,
      result: {
        location: "Montanha assombrada",
        description: "Elevação onde espíritos inquietos vagam eternamente",
      },
    },
    {
      min: 16,
      max: 16,
      result: {
        location: "Cidade fantasma",
        description: "Assentamento abandonado habitado apenas por espectros",
      },
    },
    {
      min: 17,
      max: 17,
      result: {
        location: "Bosque corrompido",
        description: "Pequena mata infectada por energias malignas",
      },
    },
    {
      min: 18,
      max: 19,
      result: {
        location: "Floresta assombrada",
        description:
          "Mata densa habitada por mortos-vivos e espíritos malignos",
      },
    },
    {
      min: 20,
      max: 20,
      result: {
        location: "Role duas vezes e use ambos",
        description: "Combine dois tipos diferentes de terras mórbidas",
        rollTwice: true,
      },
    },
  ];

// ====================================
// DISTRITO ESPECÍFICO
// ====================================

/**
 * Distrito Específico
 * Rolagem: 1d20
 * Baseado na seção "Distrito Específico"
 * Usado quando as especificações mencionam "Em um distrito específico"
 */
export const DISTRITO_ESPECIFICO_TABLE: TableEntry<DistrictEntry>[] = [
  {
    min: 1,
    max: 5,
    result: {
      type: DistrictType.MARGINALIZADO,
      name: "Marginalizado",
      description: "Bairro pobre habitado por excluídos sociais e criminosos",
    },
  },
  {
    min: 6,
    max: 10,
    result: {
      type: DistrictType.PLEBEU,
      name: "Plebeu",
      description: "Distrito da classe trabalhadora e pessoas comuns",
    },
  },
  {
    min: 11,
    max: 13,
    result: {
      type: DistrictType.CORPORACOES_OFICIO,
      name: "Corporações de ofício",
      description:
        "Área dominada por guildas de artesãos e profissionais especializados",
    },
  },
  {
    min: 14,
    max: 15,
    result: {
      type: DistrictType.COMERCIAL,
      name: "Comercial",
      description:
        "Centro de atividade mercantil com lojas, mercados e casas comerciais",
    },
  },
  {
    min: 16,
    max: 16,
    result: {
      type: DistrictType.RELIGIOSO,
      name: "Religioso",
      description:
        "Distrito centrado em templos, mosteiros e atividades clericais",
    },
  },
  {
    min: 17,
    max: 18,
    result: {
      type: DistrictType.NOBRE,
      name: "Nobre",
      description:
        "Bairro aristocrático com mansões e residências de alta classe",
    },
  },
  {
    min: 19,
    max: 19,
    result: {
      type: DistrictType.PROXIMO_FORA,
      name: "Próximo a um distrito, mas fora do assentamento",
      description:
        "Área nas proximidades da cidade mas tecnicamente fora dos muros",
    },
  },
  {
    min: 20,
    max: 20,
    result: {
      type: DistrictType.NOBRE,
      name: "Role duas vezes e use ambos",
      description: "Combine dois tipos diferentes de distritos",
      rollTwice: true,
    },
  },
];

// ====================================
// FUNÇÕES UTILITÁRIAS
// ====================================

/**
 * Obtém a tabela de especificações baseada no tipo de localidade principal
 */
export function getLocationSpecificationTable(
  mainLocation: MainLocation
): TableEntry<LocationSpecificationEntry>[] {
  switch (mainLocation) {
    case MainLocation.CIDADE_GRANDE:
      return CIDADE_GRANDE_SPECIFICATIONS;
    case MainLocation.RUINAS_MASMORRAS:
      return RUINAS_MASMORRAS_SPECIFICATIONS;
    case MainLocation.REGIAO_SELVAGEM:
      return REGIAO_SELVAGEM_SPECIFICATIONS;
    case MainLocation.LUGAR_ISOLADO:
      return LUGAR_ISOLADO_SPECIFICATIONS;
    case MainLocation.ZONA_RURAL:
      return ZONA_RURAL_SPECIFICATIONS;
    case MainLocation.LOCALIDADE_EXOTICA:
      return LOCALIDADE_EXOTICA_SPECIFICATIONS;
    case MainLocation.PROFUNDEZAS:
      return PROFUNDEZAS_SPECIFICATIONS;
    case MainLocation.TERRAS_MORBIDAS:
      return TERRAS_MORBIDAS_SPECIFICATIONS;
    default:
      throw new Error(
        `Tipo de localidade principal não reconhecido: ${mainLocation}`
      );
  }
}

/**
 * Determina se deve rolar duas vezes (rollTwice = true)
 */
export function shouldRollTwiceForLocation(
  result: LocationSpecificationEntry | DistrictEntry
): boolean {
  return result.rollTwice === true;
}

/**
 * Verifica se uma especificação requer rolagem de distrito
 */
export function requiresDistrictRoll(
  specification: LocationSpecificationEntry
): boolean {
  return (
    specification.location.toLowerCase().includes("distrito específico") ||
    specification.description
      .toLowerCase()
      .includes("role na tabela de distritos")
  );
}

/**
 * Mapeia localidades para categorias do sistema de tipos
 */
export function mapLocationToCategory(
  mainLocation: MainLocation
): LocationCategory {
  switch (mainLocation) {
    case MainLocation.CIDADE_GRANDE:
      return LocationCategory.URBANO;
    case MainLocation.ZONA_RURAL:
      return LocationCategory.RURAL;
    case MainLocation.REGIAO_SELVAGEM:
    case MainLocation.LUGAR_ISOLADO:
    case MainLocation.PROFUNDEZAS:
    case MainLocation.TERRAS_MORBIDAS:
      return LocationCategory.SELVAGEM;
    case MainLocation.RUINAS_MASMORRAS:
      return LocationCategory.SUBTERRANEO;
    case MainLocation.LOCALIDADE_EXOTICA:
      return LocationCategory.PLANAR;
    default:
      return LocationCategory.SELVAGEM;
  }
}

/**
 * Mapeia especificações urbanas para tipos urbanos específicos
 */
export function mapUrbanSpecificationToType(
  specification: string
): UrbanLocation {
  const spec = specification.toLowerCase();

  if (spec.includes("esgoto") || spec.includes("subterrâneo")) {
    return UrbanLocation.ESGOTOS;
  }
  if (spec.includes("líder") || spec.includes("moradia")) {
    return UrbanLocation.PALACIO;
  }
  if (spec.includes("nobre") || spec.includes("casarão")) {
    return UrbanLocation.MANSAO_NOBRE;
  }
  if (spec.includes("taverna")) {
    return UrbanLocation.TAVERNA;
  }
  if (spec.includes("templo")) {
    return UrbanLocation.TEMPLO;
  }
  if (spec.includes("cemitério") || spec.includes("cripta")) {
    return UrbanLocation.CEMITERIO;
  }
  if (spec.includes("mercado") || spec.includes("praça")) {
    return UrbanLocation.MERCADO;
  }

  // Default para distrito pobre se não encontrar uma correspondência específica
  return UrbanLocation.DISTRITO_POBRE;
}

/**
 * Valida se uma localidade necessita de características especiais
 */
export function requiresLocationCharacteristics(): boolean {
  // Todas as localidades podem ter características, mas algumas são mais propensas
  return true;
}
