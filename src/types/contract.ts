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
  ARBITRARIO = "Arbitrário",
  JANELA_OPORTUNIDADE = "Janela de oportunidade",
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
  // Modificador por distância (-20 a +20)
  distance: number;

  // Modificador por relação com população (-20 a +5)
  populationRelation: number;

  // Modificador por relação com governo (-25 a +10)
  governmentRelation: number;

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

  // Valores e recompensas
  value: ContractValue;

  // Prazo e tempo
  deadline: {
    type: DeadlineType;
    value?: string; // "3 dias", "1 semana", etc.
    isFlexible: boolean;
    isArbitrary: boolean;
  };

  // Tipo de pagamento
  paymentType: PaymentType;

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
  };
}

// Schema para modificadores de contratos
export const ContractModifiersSchema = z.object({
  distance: z.number().int().min(-20).max(20),
  populationRelation: z.number().int().min(-20).max(5),
  governmentRelation: z.number().int().min(-25).max(10),
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
  isFlexible: z.boolean(),
  isArbitrary: z.boolean(),
});

// Schema para dados de geração
export const GenerationDataSchema = z.object({
  baseRoll: z.number().int().min(1).max(100),
  distanceRoll: z.number().int().min(1).max(20).optional(),
  difficultyRoll: z.number().int().min(1).max(20).optional(),
  settlementType: z.string().optional(),
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
  value: ContractValueSchema,
  deadline: DeadlineSchema,
  paymentType: z.nativeEnum(PaymentType),
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

// Categorias principais de objetivos
export enum ObjectiveCategory {
  ESCOLTA = "Escolta",
  INVESTIGACAO = "Investigação",
  RECUPERACAO = "Recuperação",
  ELIMINACAO = "Eliminação",
  EXPLORACAO = "Exploração",
  NEGOCIACAO = "Negociação",
  PROTECAO = "Proteção",
  ENTREGA = "Entrega",
  RESGATE = "Resgate",
  INFILTRACAO = "Infiltração",
}

// Especificações detalhadas por tipo de objetivo
export enum EscortObjective {
  PESSOA_IMPORTANTE = "Escoltar pessoa importante",
  CARAVANA_COMERCIAL = "Escoltar caravana comercial",
  PRISIONEIRO = "Escoltar prisioneiro",
  DIPLOMATA = "Escoltar diplomata",
  REFUGIADOS = "Escoltar refugiados",
}

export enum InvestigationObjective {
  CRIME_LOCAL = "Investigar crime local",
  DESAPARECIMENTO = "Investigar desaparecimento",
  FENOMENO_ESTRANHO = "Investigar fenômeno estranho",
  ESPIONAGEM = "Investigar atividade suspeita",
  CORRUPCAO = "Investigar corrupção",
}

export enum RecoveryObjective {
  ITEM_ROUBADO = "Recuperar item roubado",
  ARTEFATO_PERDIDO = "Recuperar artefato perdido",
  DOCUMENTO_IMPORTANTE = "Recuperar documento importante",
  TESOURO_ANCESTRAL = "Recuperar tesouro ancestral",
  PROPRIEDADE = "Recuperar propriedade",
}

export enum EliminationObjective {
  CRIATURA_PERIGOSA = "Eliminar criatura perigosa",
  BANDIDOS = "Eliminar grupo de bandidos",
  PRAGA_MONSTROS = "Eliminar praga de monstros",
  LIDER_INIMIGO = "Eliminar líder inimigo",
  AMEACA_MAGICA = "Eliminar ameaça mágica",
}

// Interface principal do objetivo
export interface ContractObjective {
  category: ObjectiveCategory;
  specificObjective: string;
  description: string;
  targetName?: string;
  targetLocation?: string;
  urgencyLevel: "Baixa" | "Média" | "Alta" | "Crítica";
  isSecretMission: boolean;

  // Especificações adicionais baseadas no tipo
  specifications: {
    minimumPartySize?: number;
    requiredSkills?: string[];
    forbiddenActions?: string[];
    specialEquipment?: string[];
    timeWindow?: string;
  };
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

  // Características da localidade
  characteristics: {
    dangerLevel: "Seguro" | "Baixo" | "Moderado" | "Alto" | "Extremo";
    accessibility: "Fácil" | "Moderado" | "Difícil" | "Muito difícil";
    population:
      | "Desabitado"
      | "Pouco habitado"
      | "Moderado"
      | "Povoado"
      | "Densamente povoado";
    civilizationLevel: "Primitivo" | "Rural" | "Civilizado" | "Avançado";
  };

  // Modificadores específicos da localidade
  modifiers: {
    experienceBonus: number;
    rewardModifier: number;
    difficultyIncrease: number;
  };

  // Informações de viagem
  travel: {
    distanceInHexes: number;
    estimatedTravelTime: string;
    transportRequired: boolean;
    specialRequirements?: string[];
  };
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

export enum ComplicationCategory {
  TEMPO = "Temporal",
  SOCIAL = "Social",
  AMBIENTAL = "Ambiental",
  MAGICA = "Mágica",
  POLITICA = "Política",
  MORAL = "Moral",
  FINANCEIRA = "Financeira",
  PESSOAL = "Pessoal",
}

export enum TemporalComplication {
  PRAZO_APERTADO = "Prazo mais apertado que o esperado",
  COMPETICAO = "Outro grupo com o mesmo objetivo",
  JANELA_LIMITADA = "Janela de oportunidade muito específica",
  EVENTOS_SIMULTANEOS = "Múltiplos eventos acontecendo ao mesmo tempo",
}

export enum SocialComplication {
  TESTEMUNHAS = "Presença de testemunhas",
  COBERTURA_NECESSARIA = "Necessidade de manter disfarce",
  RELACOES_COMPLEXAS = "Relacionamentos complexos entre NPCs",
  REPUTACAO_EM_RISCO = "Reputação da guilda em jogo",
}

export enum EnvironmentalComplication {
  CLIMA_SEVERO = "Condições climáticas severas",
  TERRENO_DIFICIL = "Terreno mais difícil que esperado",
  RECURSOS_LIMITADOS = "Recursos limitados na região",
  FAUNA_HOSTIL = "Fauna local hostil",
}

// Interface principal da complicação
export interface Complication {
  category: ComplicationCategory;
  specificType: string;
  title: string;
  description: string;

  // Impacto na missão
  impact: {
    severity: "Menor" | "Moderado" | "Maior" | "Crítico";
    affectedAspects: (
      | "Tempo"
      | "Recursos"
      | "Stealth"
      | "Combat"
      | "Social"
      | "Navigation"
    )[];
    experienceModifier: number;
    difficultyIncrease: number;
  };

  // Possíveis soluções
  solutions: {
    direct: string[];
    creative: string[];
    avoidance?: string[];
  };

  // Revelação da complicação
  revelation: {
    timing:
      | "Imediato"
      | "Durante planejamento"
      | "No meio da missão"
      | "No clímax";
    method: "Óbvio" | "Investigação" | "Descoberta acidental" | "Traição";
  };
}

// ===== ALIADOS =====

export enum AllyCategory {
  INFORMANTE = "Informante",
  COMBATENTE = "Combatente",
  ESPECIALISTA = "Especialista",
  CONTATO_SOCIAL = "Contato Social",
  GUIA = "Guia",
  RECURSO = "Recurso",
  PROTETOR = "Protetor",
}

export enum AllyAvailability {
  SEMPRE_DISPONIVEL = "Sempre disponível",
  CONDICIONAL = "Disponível sob condições",
  UMA_VEZ = "Apenas uma vez",
  EMERGENCIA = "Apenas em emergências",
  TEMPORAL = "Por tempo limitado",
}

export enum AllyLoyalty {
  TOTAL = "Lealdade total",
  ALTA = "Alta lealdade",
  MODERADA = "Lealdade moderada",
  CONDICIONAL = "Lealdade condicional",
  DUVIDOSA = "Lealdade duvidosa",
  INTERESSADA = "Apenas por interesse",
}

// Interface principal do aliado
export interface ContractAlly {
  category: AllyCategory;
  name: string;
  description: string;

  // Características pessoais
  personal: {
    race?: string;
    profession?: string;
    personality: string[];
    motivation: string;
  };

  // Disponibilidade e lealdade
  availability: {
    type: AllyAvailability;
    conditions?: string[];
    limitations?: string[];
    duration?: string;
  };

  loyalty: {
    level: AllyLoyalty;
    factors: string[];
    breakingPoints?: string[];
  };

  // Capacidades e recursos
  capabilities: {
    primarySkills: string[];
    secondarySkills?: string[];
    equipment?: string[];
    connections?: string[];
    knowledgeAreas?: string[];
  };

  // Como e quando aparece
  introduction: {
    timing:
      | "Início da missão"
      | "Durante planejamento"
      | "No meio da aventura"
      | "Momento crítico";
    method:
      | "Enviado pela guilda"
      | "Encontro casual"
      | "Contato prévio"
      | "Interesse próprio";
    requirements?: string[];
  };

  // Custos ou obrigações
  costs?: {
    payment?: number;
    favors?: string[];
    futureObligations?: string[];
    risks?: string[];
  };
}

// ===== RECOMPENSAS ADICIONAIS =====

export enum RewardCategory {
  MONETARIA = "Monetária",
  EQUIPAMENTO = "Equipamento",
  INFORMACAO = "Informação",
  SOCIAL = "Social",
  MAGICA = "Mágica",
  PROPRIEDADE = "Propriedade",
  SERVICO = "Serviço",
  CONHECIMENTO = "Conhecimento",
}

export enum MonetaryReward {
  BONUS_OURO = "Bônus em ouro",
  JOIAS = "Joias valiosas",
  GEMAS = "Gemas preciosas",
  OBRAS_ARTE = "Obras de arte",
  ANTIGUIDADES = "Antiguidades valiosas",
}

export enum EquipmentReward {
  ARMA_MAGICA = "Arma mágica",
  ARMADURA_ESPECIAL = "Armadura especial",
  ITEM_UTILITARIO = "Item utilitário mágico",
  POCOES = "Poções raras",
  PERGAMINHOS = "Pergaminhos mágicos",
  FERRAMENTAS = "Ferramentas especializadas",
}

// Interface principal da recompensa adicional
export interface ContractReward {
  category: RewardCategory;
  specificType: string;
  name: string;
  description: string;

  // Valor e raridade
  value: {
    estimatedGoldValue: number;
    rarity: "Comum" | "Incomum" | "Raro" | "Muito raro" | "Lendário" | "Único";
    experienceValue?: number;
  };

  // Condições para obtenção
  conditions: {
    isAutomatic: boolean;
    requirements?: string[];
    performanceBased?: boolean;
    secretive?: boolean;
    optional?: boolean;
  };

  // Benefícios mecânicos
  benefits?: {
    statBonus?: string[];
    specialAbilities?: string[];
    ongoingEffects?: string[];
    socialBenefits?: string[];
  };

  // Limitações ou custos
  limitations?: {
    temporaryEffect?: boolean;
    maintenanceCost?: number;
    curses?: string[];
    restrictions?: string[];
  };
}

// ===== SCHEMAS ZOD PARA VALIDAÇÃO =====

export const ObjectiveSpecificationsSchema = z.object({
  minimumPartySize: z.number().optional(),
  requiredSkills: z.array(z.string()).optional(),
  forbiddenActions: z.array(z.string()).optional(),
  specialEquipment: z.array(z.string()).optional(),
  timeWindow: z.string().optional(),
});

export const ContractObjectiveSchema = z.object({
  category: z.nativeEnum(ObjectiveCategory),
  specificObjective: z.string(),
  description: z.string(),
  targetName: z.string().optional(),
  targetLocation: z.string().optional(),
  urgencyLevel: z.enum(["Baixa", "Média", "Alta", "Crítica"]),
  isSecretMission: z.boolean(),
  specifications: ObjectiveSpecificationsSchema,
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
  specificType: z.string(),
  title: z.string(),
  description: z.string(),
  impact: z.object({
    severity: z.enum(["Menor", "Moderado", "Maior", "Crítico"]),
    affectedAspects: z.array(
      z.enum(["Tempo", "Recursos", "Stealth", "Combat", "Social", "Navigation"])
    ),
    experienceModifier: z.number(),
    difficultyIncrease: z.number(),
  }),
  solutions: z.object({
    direct: z.array(z.string()),
    creative: z.array(z.string()),
    avoidance: z.array(z.string()).optional(),
  }),
  revelation: z.object({
    timing: z.enum([
      "Imediato",
      "Durante planejamento",
      "No meio da missão",
      "No clímax",
    ]),
    method: z.enum([
      "Óbvio",
      "Investigação",
      "Descoberta acidental",
      "Traição",
    ]),
  }),
});

export const ContractAllySchema = z.object({
  category: z.nativeEnum(AllyCategory),
  name: z.string(),
  description: z.string(),
  personal: z.object({
    race: z.string().optional(),
    profession: z.string().optional(),
    personality: z.array(z.string()),
    motivation: z.string(),
  }),
  availability: z.object({
    type: z.nativeEnum(AllyAvailability),
    conditions: z.array(z.string()).optional(),
    limitations: z.array(z.string()).optional(),
    duration: z.string().optional(),
  }),
  loyalty: z.object({
    level: z.nativeEnum(AllyLoyalty),
    factors: z.array(z.string()),
    breakingPoints: z.array(z.string()).optional(),
  }),
  capabilities: z.object({
    primarySkills: z.array(z.string()),
    secondarySkills: z.array(z.string()).optional(),
    equipment: z.array(z.string()).optional(),
    connections: z.array(z.string()).optional(),
    knowledgeAreas: z.array(z.string()).optional(),
  }),
  introduction: z.object({
    timing: z.enum([
      "Início da missão",
      "Durante planejamento",
      "No meio da aventura",
      "Momento crítico",
    ]),
    method: z.enum([
      "Enviado pela guilda",
      "Encontro casual",
      "Contato prévio",
      "Interesse próprio",
    ]),
    requirements: z.array(z.string()).optional(),
  }),
  costs: z
    .object({
      payment: z.number().optional(),
      favors: z.array(z.string()).optional(),
      futureObligations: z.array(z.string()).optional(),
      risks: z.array(z.string()).optional(),
    })
    .optional(),
});

export const ContractRewardSchema = z.object({
  category: z.nativeEnum(RewardCategory),
  specificType: z.string(),
  name: z.string(),
  description: z.string(),
  value: z.object({
    estimatedGoldValue: z.number(),
    rarity: z.enum([
      "Comum",
      "Incomum",
      "Raro",
      "Muito raro",
      "Lendário",
      "Único",
    ]),
    experienceValue: z.number().optional(),
  }),
  conditions: z.object({
    isAutomatic: z.boolean(),
    requirements: z.array(z.string()).optional(),
    performanceBased: z.boolean().optional(),
    secretive: z.boolean().optional(),
    optional: z.boolean().optional(),
  }),
  benefits: z
    .object({
      statBonus: z.array(z.string()).optional(),
      specialAbilities: z.array(z.string()).optional(),
      ongoingEffects: z.array(z.string()).optional(),
      socialBenefits: z.array(z.string()).optional(),
    })
    .optional(),
  limitations: z
    .object({
      temporaryEffect: z.boolean().optional(),
      maintenanceCost: z.number().optional(),
      curses: z.array(z.string()).optional(),
      restrictions: z.array(z.string()).optional(),
    })
    .optional(),
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
 * Valida um aliado usando o schema Zod
 */
export function validateContractAlly(data: unknown): ContractAlly {
  return ContractAllySchema.parse(data);
}

/**
 * Valida uma recompensa adicional usando o schema Zod
 */
export function validateContractReward(data: unknown): ContractReward {
  return ContractRewardSchema.parse(data);
}

/**
 * Calcula modificador de dificuldade baseado em complicações
 */
export function calculateComplicationDifficultyModifier(
  complications: Complication[]
): number {
  return complications.reduce((total, complication) => {
    const severityMap = { Menor: 1, Moderado: 2, Maior: 3, Crítico: 5 };
    return total + severityMap[complication.impact.severity];
  }, 0);
}

/**
 * Verifica se um aliado está disponível baseado nas condições
 */
export function isAllyAvailable(
  ally: ContractAlly,
  conditions: string[] = []
): boolean {
  if (ally.availability.type === AllyAvailability.SEMPRE_DISPONIVEL) {
    return true;
  }

  if (ally.availability.type === AllyAvailability.CONDICIONAL) {
    return (
      ally.availability.conditions?.every((condition) =>
        conditions.includes(condition)
      ) ?? false
    );
  }

  return false;
}

/**
 * Calcula valor total de recompensas adicionais
 */
export function calculateAdditionalRewardsValue(
  rewards: ContractReward[]
): number {
  return rewards.reduce(
    (total, reward) => total + reward.value.estimatedGoldValue,
    0
  );
}
