import { z } from "zod";

// Status do contrato durante seu ciclo de vida
export enum ContractStatus {
  DISPONIVEL = "Disponível",
  ACEITO = "Aceito",
  EM_ANDAMENTO = "Em andamento",
  CONCLUIDO = "Concluído",
  FALHOU = "Falhou",
  EXPIRADO = "Expirado",
  ANULADO = "Anulado",
  RESOLVIDO_POR_OUTROS = "Resolvido por outros",
  QUEBRADO = "Quebrado",
}

// Níveis de dificuldade dos contratos
export enum ContractDifficulty {
  FACIL = "Fácil",
  MEDIO = "Médio",
  DIFICIL = "Difícil",
  MORTAL = "Mortal",
}

// Tipos de contratantes conforme as regras
export enum ContractorType {
  POVO = "Povo",
  INSTITUICAO = "Instituição",
  GOVERNO = "Governo",
}

// Tipos de prazo para conclusão
export enum DeadlineType {
  SEM_PRAZO = "Sem prazo",
  DIAS = "Dias",
  SEMANAS = "Semanas",
}

// Tipos de pagamento disponíveis
export enum PaymentType {
  DIRETO_CONTRATANTE = "Pagamento em PO$ direto com contratante",
  METADE_GUILDA_METADE_CONTRATANTE = "Metade com a guilda, metade com o contratante",
  METADE_GUILDA_METADE_BENS = "Metade com a guilda, metade, em bens, com o contratante",
  BENS_SERVICOS = "Em materiais, joias, bens ou serviços do contratante",
  TOTAL_GUILDA = "Pagamento total na guilda em PO$",
  TOTAL_GUILDA_MAIS_SERVICOS = "Pagamento total na guilda em PO$ e serviços do contratante",
}

// Resultado de resolução automática
export enum ContractResolution {
  RESOLVIDO = "O contrato foi resolvido",
  NAO_RESOLVIDO = "O contrato não foi resolvido",
  RESOLVIDO_COM_RESSALVAS = "O contrato foi resolvido mas com ressalvas",
  AINDA_NAO_SE_SABE = "Ainda não se sabe",
}

// Motivos para não resolução
export enum FailureReason {
  DESISTENCIA = "Quebra devido a desistência",
  PICARETAGEM = "Quebra devido a picaretagem do contratante",
  OBITO = "Óbito de todos ou maioria dos envolvidos",
  PRAZO_NAO_CUMPRIDO = "Prazo não cumprido ou contratados desaparecidos",
  CLAUSULA_NAO_CUMPRIDA = "Quebra devido a cláusula adicional não cumprida",
  CONTRATANTE_MORTO = "Contratante morto ou desaparecido",
}

// Resultados de resolução automática de contratos não assinados
export enum UnsignedResolutionResult {
  TODOS_CONTINUAM = "Nenhum foi assinado, todos continuam disponíveis",
  TODOS_RESOLVIDOS = "Todos foram devidamente resolvidos",
  MENORES_XP_RESOLVIDOS = "Os de menor XP foram resolvidos",
  MELHORES_RECOMPENSAS_RESOLVIDOS = "Contratos com as melhores Recompensas foram resolvidos",
  ALEATORIOS_RESOLVIDOS = "contratos aleatórios são resolvidos",
  ASSINADOS_NAO_RESOLVIDOS = "contratos são assinados, porém não são resolvidos",
  MOTIVO_ESTRANHO = "Nenhum foi assinado, e há algum motivo estranho para isso",
}

// ===== INTERFACES PARA VALOR E RECOMPENSA =====

// Interface para controlar valores e recompensas do contrato
export interface ContractValue {
  // Valor base rolado na tabela 1d100
  baseValue: number;

  // Valor em XP para estruturar o contrato (orçamento do mestre)
  experienceValue: number;

  // Valor da recompensa em pontos (convertido para PO$ * 0.1)
  rewardValue: number;

  // Valor final em PO$ que será pago (rewardValue * 0.1)
  finalGoldReward: number;

  // Todos os modificadores aplicados
  modifiers: ContractModifiers;
}

// Interface para todos os modificadores que afetam valores
export interface ContractModifiers {
  // Modificador por distância (aplicado a ambos valor e recompensa)
  distance: number;

  // Modificadores por relação com população (separados para valor e recompensa)
  populationRelationValue: number;
  populationRelationReward: number;

  // Modificadores por relação com governo (separados para valor e recompensa)
  governmentRelationValue: number;
  governmentRelationReward: number;

  // Modificador por funcionários experientes/despreparados
  staffPreparation: number;

  // Modificador por dificuldade (multiplicadores)
  difficultyMultiplier: {
    experienceMultiplier: number; // 1, 2, 4, 8
    rewardMultiplier: number; // 1, 1.3, 2, 3
  };

  // Modificadores por pré-requisitos e cláusulas (+5 cada)
  requirementsAndClauses: number;
}

// ===== INTERFACES PRINCIPAIS =====

// Interface principal do contrato conforme Issue 4.1
export interface Contract {
  readonly id: string;

  // Informações básicas
  title: string;
  description: string;
  status: ContractStatus;
  difficulty: ContractDifficulty;

  // Informações do contratante
  contractorType: ContractorType;
  contractorName?: string;

  // Objetivo e localização do contrato
  objective?: ContractObjective;
  location?: ContractLocation;

  // Valores e recompensas
  value: ContractValue;

  // Prazo e tempo
  deadline: {
    type: DeadlineType;
    value?: string;
  };

  // Tipo de pagamento
  paymentType: PaymentType;

  // Pré-requisitos e cláusulas
  prerequisites: string[];
  clauses: string[];

  // Antagonistas
  antagonist: Antagonist;

  // Complicações
  complications: Complication[];

  // Reviravoltas
  twists: Twist[];

  // Aliados que podem surgir durante o contrato
  allies: Ally[];

  // Consequências severas por falha
  severeConsequences: SevereConsequence[];

  // Recompensas adicionais
  additionalRewards?: AdditionalReward[];

  // Datas importantes
  createdAt: Date;
  expiresAt?: Date;
  completedAt?: Date;

  // Metadados para geração
  generationData: {
    baseRoll: number; // Rolagem 1d100 original
    distanceRoll?: number;
    difficultyRoll?: number;
    settlementType?: string; // Tipo de assentamento onde foi gerado
    prerequisiteRolls?: number[];
    clauseRolls?: number[];
    antagonistRoll?: number;
  };
}

// Schema para modificadores de contratos
export const ContractModifiersSchema = z.object({
  distance: z.number().int().min(-20).max(20),
  populationRelationValue: z.number().int().min(-10).max(5),
  populationRelationReward: z.number().int().min(-20).max(5),
  governmentRelationValue: z.number().int().min(-25).max(5),
  governmentRelationReward: z.number().int().min(-25).max(10),
  staffPreparation: z.number().int().min(-2).max(2),
  difficultyMultiplier: z.object({
    experienceMultiplier: z.number().positive(),
    rewardMultiplier: z.number().positive(),
  }),
  requirementsAndClauses: z.number().int().nonnegative(),
});

// Schema para valores do contrato
export const ContractValueSchema = z.object({
  baseValue: z.number().int().min(75).max(50000),
  experienceValue: z.number().int().nonnegative(),
  rewardValue: z.number().int().nonnegative(),
  finalGoldReward: z.number().nonnegative(),
  modifiers: ContractModifiersSchema,
});

// Schema para prazo
export const DeadlineSchema = z.object({
  type: z.nativeEnum(DeadlineType),
  value: z.string().optional(),
});

// Schema para dados de geração
export const GenerationDataSchema = z.object({
  baseRoll: z.number().int().min(1).max(100),
  distanceRoll: z.number().int().min(1).max(20).optional(),
  difficultyRoll: z.number().int().min(1).max(20).optional(),
  settlementType: z.string().optional(),
  prerequisiteRolls: z.array(z.number().int()).optional(),
  clauseRolls: z.array(z.number().int()).optional(),
  antagonistRoll: z.number().int().optional(),
});

// Schema principal do contrato
export const ContractSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().min(1),
  status: z.nativeEnum(ContractStatus),
  difficulty: z.nativeEnum(ContractDifficulty),
  contractorType: z.nativeEnum(ContractorType),
  contractorName: z.string().optional(),
  objective: z.lazy(() => ContractObjectiveSchema).optional(),
  location: z.lazy(() => ContractLocationSchema).optional(),
  value: ContractValueSchema,
  deadline: DeadlineSchema,
  paymentType: z.nativeEnum(PaymentType),
  prerequisites: z.array(z.string()),
  clauses: z.array(z.string()),
  antagonist: z.lazy(() => AntagonistSchema),
  complications: z.array(z.lazy(() => ComplicationSchema)),
  twists: z.array(z.lazy(() => TwistSchema)),
  allies: z.array(z.lazy(() => AllySchema)),
  severeConsequences: z.array(z.lazy(() => SevereConsequenceSchema)),
  additionalRewards: z.array(z.lazy(() => AdditionalRewardSchema)).optional(),
  createdAt: z.date(),
  expiresAt: z.date().optional(),
  completedAt: z.date().optional(),
  generationData: GenerationDataSchema,
});

export type ContractInput = z.input<typeof ContractSchema>;
export type ContractOutput = z.output<typeof ContractSchema>;

/**
 * Valida os dados de um contrato usando o schema Zod
 * @param data - Dados do contrato para validar
 * @returns Contrato validado
 * @throws ZodError se os dados não forem válidos
 */
export function validateContract(data: unknown): Contract {
  return ContractSchema.parse(data);
}

/**
 * Calcula o valor final em ouro baseado no valor da recompensa
 * @param rewardValue - Valor da recompensa em pontos
 * @returns Valor em moedas de ouro (PO$)
 */
export function calculateFinalGoldReward(rewardValue: number): number {
  return rewardValue * 0.1;
}

/**
 * Calcula multa por quebra de contrato (10% da recompensa)
 * @param finalGoldReward - Recompensa final em PO$
 * @returns Valor da multa em PO$
 */
export function calculateBreachPenalty(finalGoldReward: number): number {
  return finalGoldReward * 0.1;
}

/**
 * Verifica se um contrato está expirado
 * @param contract - Contrato para verificar
 * @returns true se o contrato estiver expirado
 */
export function isContractExpired(contract: Contract): boolean {
  if (!contract.expiresAt) return false;
  return new Date() > contract.expiresAt;
}

/**
 * Aplica modificador de aumento por não resolução (+2 na recompensa)
 * @param rewardValue - Valor atual da recompensa
 * @returns Novo valor da recompensa
 */
export function applyUnresolvedBonus(rewardValue: number): number {
  return rewardValue + 2;
}

// ===== OBJETIVOS DO CONTRATO =====

// ===== OBJETIVOS DOS CONTRATOS =====

// Categorias principais de objetivos
export enum ObjectiveCategory {
  ATACAR_DESTRUIR = "Atacar/Destruir",
  ENCONTRAR_RECUPERAR = "Encontrar/Recuperar",
  CAPTURAR = "Capturar",
  PROTEGER_SALVAR = "Proteger/Salvar",
  EXPLORAR_DESCOBRIR = "Explorar/Descobrir",
  ENTREGAR_RECEBER = "Entregar/Receber",
  INVESTIGAR_SABOTAR = "Investigar/Sabotar",
  SERVICOS_PERIGOSOS = "Serviços perigosos",
  RELIGIOSO = "Religioso",
}

// Tipos de locais para especificações (conforme tabela "Tipo de Local")
export enum LocationType {
  MUNDANO = "Mundano",
  MAGICO = "Mágico",
  SAGRADO = "Sagrado",
  PROFANO = "Profano",
  ESTRANHO = "Estranho",
}

// Interface para objetivo principal do contrato
export interface ContractObjective {
  category: ObjectiveCategory;
  description: string;
  specificObjective: string;
  targetName?: string;
  targetLocation?: string;
}

// Interface para especificações detalhadas por objetivo
export interface ObjectiveSpecification {
  target: string;
  description: string;
  rollTwice?: boolean;
}

// ===== LOCALIDADES DO CONTRATO =====

export enum LocationCategory {
  URBANO = "Urbano",
  RURAL = "Rural",
  SELVAGEM = "Selvagem",
  SUBTERRANEO = "Subterrâneo",
  AQUATICO = "Aquático",
  AEREO = "Aéreo",
  PLANAR = "Planar",
  MAGICO = "Mágico",
}

export enum UrbanLocation {
  TAVERNA = "Taverna local",
  MANSAO_NOBRE = "Mansão de nobre",
  DISTRITO_POBRE = "Distrito pobre",
  MERCADO = "Área do mercado",
  TEMPLO = "Templo ou igreja",
  PALACIO = "Palácio governamental",
  ESGOTOS = "Sistema de esgotos",
  CEMITERIO = "Cemitério",
}

export enum RuralLocation {
  FAZENDA_ISOLADA = "Fazenda isolada",
  VILA_PEQUENA = "Vila pequena",
  ESTRADA_COMERCIAL = "Estrada comercial",
  PONTE_IMPORTANTE = "Ponte importante",
  MOINHOS = "Área de moinhos",
  CAMPOS_CULTIVO = "Campos de cultivo",
  PASTAGENS = "Pastagens",
}

export enum WildLocation {
  FLORESTA_DENSA = "Floresta densa",
  MONTANHAS = "Região montanhosa",
  PANTANO = "Pântano perigoso",
  DESERTO = "Área desértica",
  TUNDRA = "Tundra gelada",
  CAVERNAS = "Sistema de cavernas",
  RUINAS_ANTIGAS = "Ruínas antigas",
}

// Interface principal da localidade
export interface ContractLocation {
  category: LocationCategory;
  specificLocation: string;
  name: string;
  description: string;
  importance?: {
    type: string;
    name: string;
    description: string;
  };
  peculiarity?: {
    type: string;
    name: string;
    description: string;
  };
  specification?: {
    location: string;
    description: string;
  } | null;
  district?: {
    primary: {
      type: string;
      name: string;
      description: string;
    };
    secondary?: {
      type: string;
      name: string;
      description: string;
    };
  } | null;
}

// ===== ANTAGONISTAS =====

export enum AntagonistCategory {
  HUMANOIDE_PODEROSO = "Humanoide poderoso",
  ARTEFATO_MAGICO = "Artefato mágico",
  ORGANIZACAO = "Organização",
  PERIGO_IMINENTE = "Perigo iminente",
  ENTIDADE_SOBRENATURAL = "Entidade sobrenatural",
  ANOMALIA = "Anomalia",
  DESASTRE_ACIDENTE = "Desastre ou acidente",
  CRISE = "Crise",
  MISTERIO = "Mistério",
}

export enum HumanoidAntagonist {
  MERCENARIO_ASSASSINO = "Mercenário/assassino",
  CONJURADOR = "Conjurador",
  NOBRE = "Nobre",
  LIDER_IMPORTANTE = "Líder importante",
  DUPLO = "Duplo",
  ALQUIMISTA_PERTURBADO = "Alquimista perturbado",
  RIVAL_CONTRATANTE = "Rival do contratante",
  HEROI_AVENTUREIRO = "Herói/aventureiro",
  FANATICO_RELIGIOSO = "Fanático religioso",
  FUGITIVO = "Fugitivo",
  COMERCIANTE_CORRUPTO = "Comerciante corrupto",
  GENERAL_RENEGADO = "General renegado",
  SACERDOTE_CAIDO = "Sacerdote caído",
  ESPIAO_INFILTRADO = "Espião infiltrado",
  ARTISTA_EXCENTRICO = "Artista excêntrico",
  DIPLOMATA_TRAIDOR = "Diplomata traidor",
  REVOLUCIONARIO_RADICAL = "Revolucionário radical",
  MENTOR_DECAIDO = "Mentor decaído",
}

export enum MagicalArtifactAntagonist {
  CONSTRUCTO_DESCONTROLADO = "Constructo descontrolado",
  RELIQUIA_DIVINA = "Relíquia divina",
  ARTEFATO_ALIENIGENA = "Artefato alienígena",
  JOIA_ALMA_PODEROSA = "Joia com a alma de um ser poderoso",
  ARMADURA_ENFEITICADA = "Armadura enfeitiçada",
  ARMA_SENCIENTE = "Arma senciente",
  GRIMORIO_PROIBIDO = "Grimório proibido",
  FOCO_ARCANO_CORROMPIDO = "Foco arcano danificado/corrompido",
  PERGAMINHO_MILENAR = "Pergaminho milenar",
  OBJETO_AMALDICOADO = "Objeto amaldiçoado",
  PORTAL_INSTAVEL = "Portal instável",
  CRISTAL_ENERGIA = "Cristal de energia",
  ESPELHO_DIMENSIONAL = "Espelho dimensional",
  AMULETO_CORRUPTOR = "Amuleto corruptor",
  INSTRUMENTO_MUSICAL_MAGICO = "Instrumento musical mágico",
  TOTEM_ANCESTRAL = "Totem ancestral",
  ORBE_PODER = "Orbe de poder",
  MAQUINA_ANTIGA = "Máquina antiga",
  RECIPIENTE_ALMAS = "Recipiente de almas",
}

export enum OrganizationAntagonist {
  GRUPO_AMEACADOR = "Grupo ameaçador",
  FACCAO_CRIMINOSA = "Facção criminosa",
  SEITA_CULTISTA = "Seita cultista",
  ALTA_SOCIEDADE = "Alta sociedade",
  CORTE_REAL_INIMIGA = "Corte real inimiga",
  CLA_FAMILIA_PODEROSA = "Clã/família poderosa",
  SOCIEDADE_SECRETA = "Sociedade secreta",
  GRUPO_AVENTUREIROS = "Grupo de aventureiros",
  REVOLUCIONARIOS = "Revolucionários",
  SINDICATO = "Sindicato",
  GUILDA_RIVAL = "Uma guilda rival",
  IRMANDADE_MILITAR = "Irmandade militar",
  ORDEM_MAGOS = "Ordem de magos",
  COMPANHIA_MERCANTIL = "Companhia mercantil",
  CONSELHO_ANCIAOS = "Conselho de anciãos",
  TRIBUNAL_CORRUPTO = "Tribunal corrupto",
  COLEGIO_BARDOS = "Colégio de bardos",
  REDE_ESPIONAGEM = "Rede de espionagem",
  PACTO_DRUIDAS = "Pacto de druidas",
}

export enum ImminentDangerAntagonist {
  HUMANOIDES_TRIBAIS = "Humanoides tribais/canibais",
  ANIMAIS_SELVAGENS = "Animais selvagens",
  BESTAS_PRE_HISTORICAS = "Bestas pré-históricas",
  PLANTAS_GUARDIAS = "Plantas guardiãs",
  LICANTROPOS = "Licantropos",
  ENXAMES_INSETOS = "Enxames de insetos",
  SAQUEADORES_FREQUENTES = "Saqueadores frequentes",
  ELEMENTAIS = "Elementais",
  CRIATURA_MITOLOGICA = "Criatura mitológica",
  ANIMAIS_ATROZES = "Animais atrozes",
  HORDA_MORTOS_VIVOS = "Horda de mortos-vivos",
  BANDIDOS_ORGANIZADOS = "Bandidos organizados",
  PREDADORES_NOTURNOS = "Predadores noturnos",
  CRIATURAS_SUBTERRANEAS = "Criaturas subterrâneas",
  INVASORES_PLANARES = "Invasores planares",
  MONSTROS_AQUATICOS = "Monstros aquáticos",
  FERAS_CORROMPIDAS = "Feras corrompidas",
  ABERRACOES_ANTIGAS = "Aberrações antigas",
  ESPIRITOS_VINGATIVOS = "Espíritos vingativos",
}

export enum SupernaturalEntityAntagonist {
  VAMPIRO = "Vampiro",
  SER_INCORPOREO = "Ser incorpóreo",
  MORTO_VIVO_PODEROSO = "Morto-vivo poderoso",
  CELESTIAL_DESCONTROLADO = "Celestial descontrolado",
  FADA = "Fada",
  DEMONIO_MENOR = "Demônio menor",
  ANJO_CAIDO = "Anjo caído",
  ESPECTRO_ANTIGO = "Espectro antigo",
  SENHOR_SOMBRAS = "Senhor das sombras",
  ARQUIFADA = "Arquifada",
  ENTIDADE_COSMICA = "Entidade cósmica",
  ESPIRITO_ELEMENTAL = "Espírito elemental",
  ALMA_PERDIDA = "Alma perdida",
  GUARDIAO_CORROMPIDO = "Guardião corrompido",
}

export enum AnomalyAntagonist {
  MONSTRUOSIDADE = "Monstruosidade",
  DEMONIO_DIABO = "Demônio ou diabo",
  FENDA_PLANAR = "Fenda planar",
  HIBRIDO_ANIMALESCO = "Híbrido ou Animalesco",
  NEVOA_SOBRENATURAL = "Névoa sobrenatural",
  INVASAO_ZUMBI = "Invasão zumbi/esqueleto",
  LIMO = "Limo",
  ANORMALIDADES_NATUREZA = "Anormalidades na natureza",
  CRIATURA_ADORMECIDA = "Criatura poderosa adormecida",
  CLIMATICA = "Climática",
  ZONA_MAGIA_SELVAGEM = "Zona de magia selvagem",
  DISTORCAO_TEMPORAL = "Distorção temporal",
  MUTACAO_DESCONTROLADA = "Mutação descontrolada",
  CORRUPCAO_ARCANA = "Corrupção arcana",
  FISSURA_REALIDADE = "Fissura na realidade",
  MANIFESTACAO_PSIQUICA = "Manifestação psíquica",
}

export enum DisasterAntagonist {
  INUNDACAO = "Inundação",
  TERREMOTO = "Terremoto",
  NAUFRAGIO = "Naufrágio",
  FEITICO_DESCONTROLADO = "Feitiço fora de controle",
  EXPERIMENTO_ERRADO = "Experimento que deu errado",
  CONSTRUCOES_DEPREDADAS = "Construções depredadas/desabamento",
  INCENDIO = "Incêndio",
  METEORO = "Meteoro",
  NEVASCA_IMPETUOSA = "Nevasca impetuosa",
  ACIDENTE_TRABALHO = "Acidente de trabalho",
  DESLIZAMENTO_TERRA = "Deslizamento de terra",
  TEMPESTADE_DEVASTADORA = "Tempestade devastadora",
  EXPLOSAO_ARCANA = "Explosão arcana",
  PRAGA_INSETOS = "Praga de insetos",
  CONTAMINACAO_TOXICA = "Contaminação tóxica",
  FALHA_PORTAL = "Falha em portal",
  ACIDENTE_CRIATURAS = "Acidente com criaturas",
  AVALANCHE = "Avalanche",
}

export enum CrisisAntagonist {
  CONFLITO_POLITICO = "Conflito político",
  DOENCA = "Doença",
  ESCASSEZ_RECURSOS = "Escassez de recursos básicos",
  PARASITA_PRAGA = "Parasita ou praga",
  GUERRA_IMINENTE = "Guerra iminente/Disputa territorial",
  REVOLUCAO_REVOLTA = "Revolução/revolta",
  ECONOMICA = "Econômica",
  DRAGAO = "Dragão",
  QUEDA_FIGURA_IMPORTANTE = "Queda de uma figura importante",
  CONFLITO_RELIGIOSO = "Conflito religioso",
  CRISE_DIPLOMATICA = "Crise diplomática",
  COLAPSO_INSTITUICOES = "Colapso de instituições",
  SUCESSAO_CONTESTADA = "Sucessão contestada",
  CORRUPCAO_GENERALIZADA = "Corrupção generalizada",
  CISMA_SOCIAL = "Cisma social",
  FUGA_MASSA = "Fuga em massa",
  BOICOTE_COMERCIAL = "Boicote comercial",
  CONSPIRACAO_REVELADA = "Conspiração revelada",
  PERDA_CONFIANCA = "Perda de confiança",
}

export enum MysteryAntagonist {
  CONSPIRACAO = "Conspiração",
  COMPORTAMENTO_ANORMAL = "Comportamento/fenômeno anormal",
  MORTES_MISTERIOSAS = "Mortes misteriosas",
  ROUBOS_DESAPARECIMENTOS = "Roubos/Desaparecimentos",
  MALDICAO_CASTIGO_DIVINO = "Maldição/castigo divino",
  ATENTADO = "Atentado",
  PROFECIA = "Profecia",
  SURTOS_MAGIA = "Surtos de magia",
  RITUAIS_SIMBOLOS = "Rituais e símbolos",
  LENDA_URBANA = "Lenda urbana/local",
  MEMORIAS_PERDIDAS = "Memórias perdidas",
  IDENTIDADE_FALSA = "Identidade falsa",
  MENSAGENS_CODIFICADAS = "Mensagens codificadas",
  TESTEMUNHAS_CONFLITANTES = "Testemunhas conflitantes",
  SEGREDO_FAMILIAR = "Segredo familiar",
  ARTEFATO_PERDIDO = "Artefato perdido",
  PRESSAGIO_SOMBRIO = "Presságio sombrio",
  PASSADO_OCULTO = "Passado oculto",
  CONEXAO_INESPERADA = "Conexão inesperada",
}

// Interface principal do antagonista
export interface Antagonist {
  category: AntagonistCategory;
  specificType: string;
  name: string;
  description: string;
}

// ===== COMPLICAÇÕES =====

// Categorias principais de complicações
export enum ComplicationCategory {
  RECURSOS = "Recursos",
  VITIMAS = "Vítimas",
  ORGANIZACAO = "Organização",
  MIRACULOSO = "Miraculoso",
  AMBIENTE_HOSTIL = "Ambiente hostil",
  INUSITADO = "Inusitado",
  PROBLEMAS_DIPLOMATICOS = "Problemas diplomáticos",
  PROTECAO = "Proteção",
  CONTRA_TEMPO_AMISTOSO = "Contra-tempo amistoso",
  ENCONTRO_HOSTIL = "Encontro hostil",
}

// Interface principal da complicação
export interface Complication {
  category: ComplicationCategory;
  specificDetail: string;
  description: string;
}

// ===== REVIRAVOLTAS =====

// Quem está envolvido na reviravolta
export enum TwistWho {
  CONTRATANTE = "O contratante",
  ALIADO = "Um aliado",
  COMPLICACAO = "A complicação",
  OBJETIVO = "O objetivo",
  VITIMA_INOCENTE = "A vítima/um inocente",
  VELHO_CONHECIDO = "Um velho conhecido surge e...",
  FUNCIONARIO_GUILDA = "Um funcionário da guilda",
  ESPECTADOR_NEUTRO = "Um espectador aparentemente neutro",
  INFORMANTE = "Um informante",
  AUTORIDADE_LOCAL = "A autoridade local",
  MERCADOR = "Um mercador envolvido",
  GUARDA_PATRULHA = "O guarda que patrulha a área",
  FONTE_PISTAS = "A pessoa que forneceu as pistas",
  MEMBRO_FAMILIA_REAL = "Um membro da família real",
  CURANDEIRO_SABIO = "O curandeiro/sábio consultado",
  CRIANCA_INVISIVEL = "A criança que ninguém nota",
  RIVAL_LONGA_DATA = "Um rival de longa data",
  MORTO_DESAPARECIDO = "Um dos mortos/desaparecidos",
  BENFEITOR_ANONIMO = "Um benfeitor anônimo",
  TERRA_LOCAL = "A própria terra/local",
}

// O que realmente são
export enum TwistWhat {
  VERDADEIRO_INIMIGO = "É o verdadeiro inimigo",
  PARENTE_PROXIMO = "É um parente próximo",
  HEROI_LENDARIO = "É um herói lendário dado como morto",
  NAO_E_O_QUE_PARECE = "Não é o que parece",
  AUXILIA_ANTAGONISTA = "Auxilia o antagonista secretamente",
  FANTASMA = "É um fantasma",
  ESPIAO_INFILTRADO = "É um espião infiltrado",
  CONTROLADO_POSSUIDO = "É controlado/possuído por outra entidade",
  ILUSAO_DISFARCE = "É uma ilusão ou disfarce",
  OUTRA_DIMENSAO = "É de outra dimensão/plano",
  CLONE_IMPOSTOR = "É um clone ou impostor",
  MAIS_PODEROSO = "É muito mais poderoso do que aparenta",
  PERDEU_MEMORIA = "Perdeu a memória de quem realmente é",
  METAMORFO = "É um metamorfo",
  SENDO_CHANTAGEADO = "Está sendo chantageado",
  CRIACAO_ARTIFICIAL = "É uma criação artificial",
  VIAJANTE_TEMPORAL = "Vem do futuro ou passado",
  DEUS_DISFARCADO = "É um deus disfarçado",
  REENCARNACAO = "É a reencarnação de alguém importante",
  MULTIPLAS_PESSOAS = "São múltiplas pessoas agindo como uma",
}

// Motivação ou circunstância especial
export enum TwistBut {
  PELAS_CRIANCAS = "Faz isso pelas crianças",
  ANTAGONISTA_SEM_CULPA = "O antagonista não tem culpa",
  ASSASSINADO_MISTERIOSAMENTE = "Ele é assassinado misteriosamente",
  LIGADO_PROFECIA = "O objetivo está ligado a uma profecia",
  PROTEGER_NATUREZA = "Faz isso para proteger a natureza",
  OBJETIVO_EXIGE_SACRIFICIO = "O objetivo exige um sacrifício",
  SALVAR_ALGUEM_QUERIDO = "Está tentando salvar alguém querido",
  FORCADO_MALDICAO = "Foi forçado por uma maldição",
  ACREDITA_FAZER_BEM = "Acredita estar fazendo o bem",
  CUMPRINDO_PROMESSA = "Está cumprindo uma promessa antiga",
  EVITAR_ALGO_PIOR = "É a única forma de evitar algo pior",
  PROTEGENDO_SEGREDO = "Está protegendo um segredo terrível",
  DIAS_DE_VIDA = "Tem apenas dias de vida",
  MANIPULADO_SEM_SABER = "Está sendo manipulado sem saber",
  SALVAR_ALMA = "Precisa salvar sua alma",
  DESFAZER_ERRO_PASSADO = "Está tentando desfazer um erro do passado",
  UNICO_QUE_PODE = "É o único que pode fazer isso",
  HONRANDO_MEMORIA = "Está honrando a memória de alguém",
  PROVAR_VALOR = "Precisa provar seu valor/inocência",
  TEMPO_SE_ESGOTANDO = "O tempo está se esgotando",
}

// Primeira tabela "E..." - Complicações adicionais da reviravolta
export enum TwistAndFirst {
  TODOS_MORTOS = "Todos já estão mortos",
  CONTRATADO_VILAO = "O contratado é o verdadeiro vilão",
  NOVO_ANTAGONISTA = "Um novo antagonista surge em paralelo",
  INFORMACOES_FALSAS = "As informações fornecidas são falsas",
  ANTAGONISTA_PARENTE = "O antagonista é um parente próximo",
  OUTRO_GRUPO_CUMPRE = "Outro grupo cumpre o objetivo",
  OBJETIVO_INEXISTENTE = "O objetivo nunca existiu realmente",
  CONSPIRACAO_MAIOR = "Há uma conspiração maior por trás",
  LOCAL_AMALDICOADO = "O local está amaldiçoado",
  TESTE_CARATER = "Tudo é um teste de caráter",
  TEMPO_LOOP = "O tempo está em loop",
  MULTIPLAS_REALIDADES = "Existem múltiplas versões da realidade",
  CONTRATO_DISTRACAO = "O contrato é uma distração para outro plano",
  ALGUEM_OBSERVA = "Alguém está observando e julgando",
  OBJETIVO_DIFERENTE = "O verdadeiro objetivo é completamente diferente",
  TRAIDOR_GRUPO = "Há um traidor no grupo",
  PROBLEMA_SE_RESOLVE = "O problema se resolve sozinho",
  RITUAL_MAIOR = "Tudo faz parte de um ritual maior",
  ANTAGONISTA_CERTO = "O antagonista está certo",
  CONSEQUENCIAS_IRREVERSIVEIS = "As consequências são irreversíveis",
}

// Segunda tabela "E..." - Complicações extremas da reviravolta
export enum TwistAndSecond {
  CUMPLICIDADE_VITIMAS = "Há cumplicidade da(s) vítima(s) com o vilão",
  TUDO_UM_JOGO = "Era tudo parte de um jogo",
  AFETA_OUTRO_PLANO = "Cumprir o objetivo afeta negativamente outro plano",
  DOIS_ANTAGONISTAS = "O contratado está sendo manipulado por dois antagonistas",
  TUDO_SONHO = "Tudo não passa de um sonho",
  VINGANCA_PLANEJADA = "Tudo foi uma vingança friamente planejada",
  ILUSAO_COLETIVA = "O problema era uma ilusão coletiva",
  VERSAO_ALTERNATIVA = "Existe uma versão alternativa dos eventos",
  REESCREVENDO_HISTORIA = "Alguém está reescrevendo a história",
  CONFLITO_CICLICO = "O conflito é cíclico e se repete eternamente",
  PECAS_JOGO_MAIOR = "Todos os envolvidos são peças de um jogo maior",
  SOLUCAO_CRIA_PROBLEMA = "A solução cria um problema ainda maior",
  NADA_PODE_DESFAZER = "Nada do que aconteceu pode ser desfeito",
  PODER_NAS_CRIANCAS = "O verdadeiro poder está nas mãos de uma criança",
  MORTE_NAO_PERMANENTE = "A morte não é permanente neste caso",
  OBSERVADORES_DIMENSIONAIS = "Há observadores de outras dimensões",
  LOCAL_CONSCIENTE = "O local tem sua própria consciência",
  TEMPO_DIFERENTE = "O tempo flui diferente para cada pessoa",
  MEMORIAS_ALTERADAS = "As memórias de todos estão sendo alteradas",
  REALIDADE_DESFAZENDO = "A realidade está se desfazendo lentamente",
}

// Interface da reviravolta completa
export interface Twist {
  hasTwist: boolean;
  who?: TwistWho;
  what?: TwistWhat;
  but?: TwistBut;
  andFirst?: TwistAndFirst;
  andSecond?: TwistAndSecond;
  description: string;
}

// ===== ALIADOS =====

// Tipos de aliados que podem surgir durante contratos
export enum AllyCategory {
  ARTEFATO = "Artefato",
  CRIATURA_PODEROSA = "Criatura poderosa",
  INESPERADO = "Inesperado",
  AJUDA_SOBRENATURAL = "Ajuda sobrenatural",
  CIVIS_ORDINARIOS = "Civis ordinários",
  NATUREZA = "Natureza",
  ORGANIZACAO = "Organização",
  REFUGIO = "Refúgio",
  AVENTUREIROS = "Aventureiros",
  MONSTRUOSIDADE_AMIGAVEL = "Monstruosidade amigável",
}

// Quando/Como os aliados aparecem
export enum AllyTiming {
  CORRENDO_PERIGO = "Correndo perigo",
  JEITO_CONSTRANGEDOR = "De um jeito constrangedor",
  MANEIRA_COMUM = "De maneira comum e pacata",
  PEDINDO_AJUDA_DESCANSO = "Pedindo ajuda durante um descanso",
  AINDA_ASSENTAMENTO = "Ainda no assentamento",
  LIDANDO_COMPLICACAO = "Já estará lidando com a complicação",
  UM_D4_DIAS_APOS = "1d4 dias após o começo do contrato",
  DOIS_D4_DIAS_APOS = "2d4 dias após o começo do contrato",
  MAGICAMENTE_INVOCADO = "Magicamente invocado",
  PARA_SALVAR_DIA = "Para salvar o dia",
}

// Interface principal do aliado
export interface Ally {
  category: AllyCategory;
  specificType: string;
  name: string;
  description: string;
  timing: AllyTiming;
  powerLevel?: number; // Para aventureiros (NA 0-30)
  characteristics?: string[]; // Para monstruosidades amigáveis
}

// ===== RECOMPENSAS ADICIONAIS =====

// Categorias de recompensas adicionais
export enum RewardCategory {
  RIQUEZAS = "Riquezas",
  ARTEFATOS_MAGICOS = "Artefatos mágicos",
  PODER = "Poder",
  CONHECIMENTO = "Conhecimento",
  INFLUENCIA_RENOME = "Influência e renome",
  GLORIA = "Glória",
  MORAL = "Moral",
  PAGAMENTO_DIFERENCIADO = "Pagamento diferenciado",
  RECOMPENSA_BIZARRA = "Recompensa bizarra",
  APARENCIAS_ENGANAM = "Aparências enganam",
}

// Interface principal da recompensa adicional
export interface AdditionalReward {
  category: RewardCategory;
  specificReward: string;
  description: string;
  value?: number; // Valor estimado quando aplicável
  isPositive: boolean; // False para "Aparências enganam"
}

// ===== CONSEQUÊNCIAS SEVERAS =====

// Categorias de consequências por falha
export enum SevereConsequenceCategory {
  MALDICAO = "Maldição",
  GUERRA = "Guerra",
  CALAMIDADE_NATURAL = "Calamidade natural",
  PRAGA = "Praga",
  EVENTOS_SOBRENATURAIS = "Eventos sobrenaturais",
  FOME_SECA = "Fome/Seca",
  CRISE_ECONOMICA = "Crise econômica",
  PERSEGUICAO = "Perseguição",
  MORTE_IMPORTANTES = "Morte de importantes",
}

// Interface para consequências severas
export interface SevereConsequence {
  category: SevereConsequenceCategory;
  specificConsequence: string;
  description: string;
  affectsContractors: string; // O que acontece com os contratados
  additionalEffect?: string; // Efeito adicional da segunda tabela "E..."
}

// ===== PALAVRAS-CHAVE TEMÁTICAS =====

// Conjuntos de palavras-chave para criatividade
export enum ThemeKeywordSet {
  MACABRO = "Primeira Tabela Temática",
  GUERRA = "Segunda Tabela Temática",
  FANTASIA = "Terceira Tabela Temática",
  STEAMPUNK = "Quarta Tabela Temática",
  MASMORRAS = "Quinta Tabela Temática",
  POLITICA = "Sexta Tabela Temática",
}

// Interface para palavra-chave temática
export interface ThemeKeyword {
  set: ThemeKeywordSet;
  keyword: string;
}

// ===== CONTRATANTES INUSITADOS =====

// Interface para contratante inusitado
export interface UnusualContractor {
  isUnusual: boolean;
  description: string;
  motivations?: string[];
  quirks?: string[];
  themeKeywords: ThemeKeyword[];
}

// ===== SCHEMAS ZOD PARA VALIDAÇÃO =====

export const ContractObjectiveSchema = z.object({
  category: z.nativeEnum(ObjectiveCategory),
  specificObjective: z.string(),
  description: z.string(),
  targetName: z.string().optional(),
  targetLocation: z.string().optional(),
});

export const LocationCharacteristicsSchema = z.object({
  dangerLevel: z.enum(["Seguro", "Baixo", "Moderado", "Alto", "Extremo"]),
  accessibility: z.enum(["Fácil", "Moderado", "Difícil", "Muito difícil"]),
  population: z.enum([
    "Desabitado",
    "Pouco habitado",
    "Moderado",
    "Povoado",
    "Densamente povoado",
  ]),
  civilizationLevel: z.enum(["Primitivo", "Rural", "Civilizado", "Avançado"]),
});

export const ContractLocationSchema = z.object({
  category: z.nativeEnum(LocationCategory),
  specificLocation: z.string(),
  name: z.string(),
  description: z.string(),
  characteristics: LocationCharacteristicsSchema,
  modifiers: z.object({
    experienceBonus: z.number(),
    rewardModifier: z.number(),
    difficultyIncrease: z.number(),
  }),
  travel: z.object({
    distanceInHexes: z.number(),
    estimatedTravelTime: z.string(),
    transportRequired: z.boolean(),
    specialRequirements: z.array(z.string()).optional(),
  }),
});

export const AntagonistSchema = z.object({
  category: z.nativeEnum(AntagonistCategory),
  specificType: z.string(),
  name: z.string(),
  description: z.string(),
});

export const ComplicationSchema = z.object({
  category: z.nativeEnum(ComplicationCategory),
  specificDetail: z.string(),
  description: z.string(),
});

export const TwistSchema = z.object({
  hasTwist: z.boolean(),
  who: z.nativeEnum(TwistWho).optional(),
  what: z.nativeEnum(TwistWhat).optional(),
  but: z.nativeEnum(TwistBut).optional(),
  andFirst: z.nativeEnum(TwistAndFirst).optional(),
  andSecond: z.nativeEnum(TwistAndSecond).optional(),
  description: z.string(),
});

export const ThemeKeywordSchema = z.object({
  set: z.nativeEnum(ThemeKeywordSet),
  keyword: z.string(),
});

export const AllySchema = z.object({
  category: z.nativeEnum(AllyCategory),
  specificType: z.string(),
  name: z.string(),
  description: z.string(),
  timing: z.nativeEnum(AllyTiming),
  powerLevel: z.number().min(0).max(30).optional(),
  characteristics: z.array(z.string()).optional(),
});

export const AdditionalRewardSchema = z.object({
  category: z.nativeEnum(RewardCategory),
  specificReward: z.string(),
  description: z.string(),
  value: z.number().optional(),
  isPositive: z.boolean(),
});

export const SevereConsequenceSchema = z.object({
  category: z.nativeEnum(SevereConsequenceCategory),
  specificConsequence: z.string(),
  description: z.string(),
  affectsContractors: z.string(),
  additionalEffect: z.string().optional(),
});

export const UnusualContractorSchema = z.object({
  isUnusual: z.boolean(),
  description: z.string(),
  motivations: z.array(z.string()).optional(),
  quirks: z.array(z.string()).optional(),
  themeKeywords: z.array(ThemeKeywordSchema),
});

// ===== FUNÇÕES UTILITÁRIAS =====

/**
 * Valida um objetivo de contrato usando o schema Zod
 */
export function validateContractObjective(data: unknown): ContractObjective {
  return ContractObjectiveSchema.parse(data);
}

/**
 * Valida uma localidade de contrato usando o schema Zod
 */
export function validateContractLocation(data: unknown): ContractLocation {
  return ContractLocationSchema.parse(data);
}

/**
 * Valida um antagonista usando o schema Zod
 */
export function validateAntagonist(data: unknown): Antagonist {
  return AntagonistSchema.parse(data);
}

/**
 * Valida uma complicação usando o schema Zod
 */
export function validateComplication(data: unknown): Complication {
  return ComplicationSchema.parse(data);
}

/**
 * Valida uma reviravolta usando o schema Zod
 */
export function validateTwist(data: unknown): Twist {
  return TwistSchema.parse(data);
}

/**
 * Valida um aliado usando o schema Zod
 */
export function validateAlly(data: unknown): Ally {
  return AllySchema.parse(data);
}

/**
 * Valida uma recompensa adicional usando o schema Zod
 */
export function validateAdditionalReward(data: unknown): AdditionalReward {
  return AdditionalRewardSchema.parse(data);
}

/**
 * Valida uma consequência severa usando o schema Zod
 */
export function validateSevereConsequence(data: unknown): SevereConsequence {
  return SevereConsequenceSchema.parse(data);
}

/**
 * Valida uma palavra-chave temática usando o schema Zod
 */
export function validateThemeKeyword(data: unknown): ThemeKeyword {
  return ThemeKeywordSchema.parse(data);
}

/**
 * Valida um contratante inusitado usando o schema Zod
 */
export function validateUnusualContractor(data: unknown): UnusualContractor {
  return UnusualContractorSchema.parse(data);
}
