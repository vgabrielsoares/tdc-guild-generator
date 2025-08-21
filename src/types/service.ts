/**
 * Tipos TypeScript para Sistema de Serviços da Guilda
 *
 * Serviços são tarefas simples, rápidas e de baixo risco,
 * diferenciadas dos contratos por sua natureza cotidiana.
 */

import { z } from "zod";
import type { GameDate } from "@/types/timeline";

// ===== ENUMS BÁSICOS =====

/**
 * Status do serviço durante seu ciclo de vida
 * Similar aos contratos mas com nuances específicas para serviços
 */
export enum ServiceStatus {
  DISPONIVEL = "Disponível",
  ACEITO = "Aceito",
  EM_ANDAMENTO = "Em andamento",
  CONCLUIDO = "Concluído",
  FALHOU = "Falhou",
  EXPIRADO = "Expirado",
  ANULADO = "Anulado",
  RESOLVIDO_POR_OUTROS = "Resolvido por outros",
  ACEITO_POR_OUTROS = "Aceito por outros aventureiros",
  QUEBRADO = "Quebrado",
}

/**
 * Complexidade dos serviços conforme tabela "Nível de Complexidade"
 */
export enum ServiceComplexity {
  SIMPLES = "Simples",
  MODERADA_E_DIRETA = "Moderada e Direta",
  MODERADA = "Moderada",
  COMPLEXA_E_DIRETA = "Complexa e Direta",
  COMPLEXA = "Complexa",
  EXTREMAMENTE_COMPLEXA_E_DIRETA = "Extremamente complexa e Direta",
  EXTREMAMENTE_COMPLEXA = "Extremamente complexa",
}

/**
 * Dificuldade dos serviços conforme tabela "Dificuldade e Recompensas"
 */
export enum ServiceDifficulty {
  MUITO_FACIL = "Muito Fácil (ND 10)",
  FACIL_ND14 = "Fácil (ND 14)",
  FACIL_ND15 = "Fácil (ND 15)",
  FACIL_ND16 = "Fácil (ND 16)",
  MEDIA_ND17 = "Média (ND 17)",
  MEDIA_ND18 = "Média (ND 18)",
  MEDIA_ND19 = "Média (ND 19)",
  DIFICIL_ND20 = "Difícil (ND 20)",
  DIFICIL_ND21 = "Difícil (ND 21)",
  DESAFIADOR_ND22 = "Desafiador (ND 22)",
  DESAFIADOR_ND23 = "Desafiador (ND 23)",
  MUITO_DIFICIL = "Muito Difícil (ND 25)",
}

/**
 * Tipos de contratantes específicos para serviços
 */
export enum ServiceContractorType {
  POVO = "Povo",
  INSTITUICAO_OFICIO = "Instituição de Ofício",
  GOVERNO = "Governo",
}

/**
 * Tipos de prazo para serviços
 */
export enum ServiceDeadlineType {
  SEM_PRAZO = "Sem prazo",
  DIAS = "Dias",
  SEMANAS = "Semanas",
}

/**
 * Tipos de pagamento específicos para serviços
 */
export enum ServicePaymentType {
  PAGAMENTO_DIRETO_CONTRATANTE = "Pagamento em PO$ direto com contratante",
  METADE_GUILDA_METADE_CONTRATANTE = "Metade com a guilda, metade com o contratante",
  METADE_GUILDA_METADE_BENS = "Metade com a guilda, metade, em bens, com o contratante",
  MATERIAIS_BENS_SERVICOS = "Em materiais, bens ou serviços do contratante",
  PAGAMENTO_TOTAL_GUILDA = "Pagamento total na guilda em PO$",
}

/**
 * Resultado de resolução automática de serviços assinados
 * Conforme tabela "Resoluções para Serviços Firmados"
 */
export enum ServiceResolution {
  RESOLVIDO = "O serviço foi resolvido",
  NAO_RESOLVIDO = "O serviço não foi resolvido",
  RESOLVIDO_COM_RESSALVAS = "O serviço foi resolvido mas com ressalvas",
  AINDA_NAO_SE_SABE = "Ainda não se sabe",
}

/**
 * Motivos para não resolução de serviços
 * Conforme tabela "Motivos para Não Resolução"
 */
export enum ServiceFailureReason {
  DESISTENCIA = "Quebra devido a desistência",
  PICARETAGEM = "Quebra devido a picaretagem do contratante",
  LESOES_GRAVES = "Lesões Graves de todos ou maioria dos envolvidos",
  PRAZO_NAO_CUMPRIDO = "Prazo não cumprido ou contratados desaparecidos",
  CLAUSULA_NAO_CUMPRIDA = "Quebra devido a cláusula adicional não cumprida",
  CONTRATANTE_DESAPARECIDO = "Contratante desaparecido",
}

/**
 * Resultado de resolução automática de serviços não assinados
 * Conforme tabela "Resolução para Serviços que Não Foram Assinados"
 */
export enum ServiceUnsignedResolution {
  TODOS_CONTINUAM = "Nenhum foi assinado, todos continuam disponíveis",
  TODOS_RESOLVIDOS = "Todos foram devidamente resolvidos",
  MENORES_RECOMPENSAS_RESOLVIDOS = "Serviços com as menores Recompensas foram resolvidos",
  MELHORES_RECOMPENSAS_RESOLVIDOS = "Serviços com as melhores Recompensas foram resolvidos",
  ALEATORIOS_RESOLVIDOS = "serviços aleatórios são resolvidos",
  ASSINADOS_NAO_RESOLVIDOS = "serviços são assinados, porém não são resolvidos",
  RESOLVIDOS_MAIS_UM = "serviços são resolvidos",
  MOTIVO_ESTRANHO = "Nenhum foi assinado, e há algum motivo estranho para isso",
}

// ===== INTERFACES PARA VALOR E RECOMPENSA =====

/**
 * Interface para controlar valores e recompensas específicos de serviços
 */
export interface ServiceValue {
  // Sistema de recompensas conforme tabela "Dificuldade e Recompensas"
  rewardRoll: string; // Ex: "1d6 C$", "3d4 C$", "5d6 C$", "2d4+1 PO$"
  rewardAmount: number; // Valor calculado da rolagem
  currency: "C$" | "PO$"; // Moeda conforme tabela (100 C$ = 1 PO$)

  // Taxa de recorrência específica conforme tabela
  recurrenceBonus: string; // Ex: "+0,5 C$", "+1 C$", "+5 C$", "+25 C$"
  recurrenceBonusAmount: number; // Valor numérico do bônus
  // Quanto aumenta a cada aplicação (valor por aplicação)
  recurrenceStepAmount?: number;
  // Quantas vezes a taxa de recorrência foi aplicada a este serviço
  recurrenceAppliedCount?: number;

  // Dificuldade associada à recompensa
  difficulty: ServiceDifficulty; // ND específico da tabela

  // Modificadores aplicados (se houver)
  modifiers?: ServiceModifiers;
  // Multiplicador aplicado pela complexidade do serviço (1, 1.5, 2, 3, ...)
  complexityMultiplier?: number;
}

/**
 * Interface para todos os modificadores que afetam valores de serviços
 */
export interface ServiceModifiers {
  // Modificadores por relações da guilda (conforme sistema de contratos adaptado)
  populationRelation: number; // Modificador baseado na relação com população
  governmentRelation: number; // Modificador baseado na relação com governo

  // Modificadores por condição dos funcionários
  staffCondition: number; // -1 (despreparados) ou +1 (experientes)
}

// ===== INTERFACES PARA SISTEMA DE TESTES E ND =====

/**
 * Interface para um teste individual conforme nível de complexidade
 * Baseado nas especificações para estrutura de testes
 */
export interface ServiceTest {
  /** ND base extraído da dificuldade do serviço */
  baseND: number;
  /** Modificador de ND específico deste teste (ex: -1, 0, +1, +2) */
  ndModifier: number;
  /** ND final para este teste (baseND + ndModifier) */
  finalND: number;
  /** Índice do teste na sequência (0, 1, 2, etc.) */
  testIndex: number;
  /** Se o teste foi realizado */
  completed: boolean;
  /** Resultado do teste (valor da rolagem do usuário) */
  rollResult?: number;
  /** Se o teste foi bem-sucedido */
  success?: boolean;
}

/**
 * Interface para estrutura completa de testes de um serviço
 * Conforme tabela "Nível de Complexidade"
 */
export interface ServiceTestStructure {
  /** Complexidade do serviço */
  complexity: ServiceComplexity;
  /** ND base extraído da dificuldade */
  baseND: number;
  /** Quantidade total de testes necessários */
  totalTests: number;
  /** Exigência de perícias (same/different/mixed) */
  skillRequirement: "same" | "different" | "mixed";
  /** Lista de testes individuais com seus modificadores */
  tests: ServiceTest[];
  /** Quantidade de sucessos obtidos */
  successCount: number;
  /** Se a estrutura de testes foi completada */
  completed: boolean;
  /** Resultado final conforme tabela de complexidade */
  outcome?: ServiceTestOutcome;
}

/**
 * Interface para resultado de conclusão de testes
 * Baseado nos resultados das tabelas de complexidade
 */
export interface ServiceTestOutcome {
  /** Descrição do resultado */
  result: string;
  /** Modificador de renome (-5 a +1) */
  renownModifier: number;
  /** Multiplicador de recompensa (0, 0.5, 1, 2) */
  rewardModifier: number;
  /** Se o serviço foi considerado "bem feito" */
  wellDone: boolean;
  /** Se houve trabalho primoroso (recompensa dupla) */
  masterwork: boolean;
}

// ===== INTERFACES PARA STORAGE POR GUILDA =====

/**
 * Interface para serviços agrupados por guilda
 * Similar aos contratos mas específico para serviços
 */
export interface GuildServices {
  guildId: string;
  services: Service[];
  lastUpdate: Date | null;
  generationCount: number;
}

/**
 * Interface para todo o storage de serviços segregado por guilda
 */
export interface ServicesStorageState {
  guildServices: Record<string, GuildServices>;
  currentGuildId: string | null;
  globalLastUpdate: Date | null;
}

// ===== INTERFACE PRINCIPAL =====

/**
 * Interface principal do serviço
 * Estrutura básica focada na simplicidade e rapidez
 */
export interface Service {
  readonly id: string;

  // Informações básicas
  title: string;
  description: string;
  status: ServiceStatus;
  complexity: ServiceComplexity;
  difficulty: ServiceDifficulty; // ND para testes

  // Sistema de testes e perícias
  testStructure: ServiceTestStructure;

  // Informações do contratante
  contractorType: ServiceContractorType;
  contractorName?: string;

  // Objetivo do serviço
  objective?: ServiceObjective;

  // Elementos narrativos específicos
  complication?: ServiceComplication;
  rival?: ServiceRival;
  origin?: ServiceOrigin;
  additionalChallenge?: ServiceAdditionalChallenge;
  // Palavras-chave de criatividade para inspirar variações no desafio
  creativityKeywords?: { keyword: string }[];

  // Valores e recompensas
  value: ServiceValue;

  // Prazo e tempo
  deadline: {
    type: ServiceDeadlineType;
    value?: string;
  };
  deadlineDate?: GameDate; // Data calculada para o prazo

  // Tipo de pagamento
  paymentType: ServicePaymentType;

  // Datas de controle
  createdAt: GameDate;
  acceptedAt?: GameDate;
  completedAt?: GameDate;

  // Estado temporal
  isActive: boolean; // Se está sendo processado no timeline
  isExpired: boolean; // Se passou do prazo

  // Informações para serviços aceitos por outros aventureiros
  takenByOthersInfo?: {
    takenAt: GameDate;
    estimatedResolutionDate?: GameDate;
    resolutionReason?: string;
    canReturnToAvailable?: boolean;
  };
}

// ===== INTERFACES PARA ELEMENTOS NARRATIVOS =====

/**
 * Tipos de objetivo dos serviços
 */
export enum ServiceObjectiveType {
  TREINAR_OU_ENSINAR = "Treinar ou ensinar",
  RECRUTAR = "Recrutar",
  CURAR_OU_RECUPERAR = "Curar ou recuperar",
  NEGOCIAR_OU_COAGIR = "Negociar ou coagir",
  AUXILIAR_OU_CUIDAR = "Auxiliar ou cuidar",
  EXTRAIR_RECURSOS = "Extrair recursos",
  CONSTRUIR_CRIAR_OU_REPARAR = "Construir, criar ou reparar",
  SERVICOS_ESPECIFICOS = "Serviços específicos",
  RELIGIOSO = "Religioso",
  MULTIPLO = "Role duas vezes e use ambos", // Resultado 20 na tabela
}

/**
 * Interface completa para objetivos de serviços
 * Baseada nas tabelas específicas de cada tipo de objetivo
 */
export interface ServiceObjective {
  type: ServiceObjectiveType;
  description: string;

  // Especificações (três colunas)
  action: string; // Primeira coluna: o que fazer
  target: string; // Segunda coluna: para quem/que
  complication: string; // Terceira coluna: mas... (complicação)

  // Para objetivos múltiplos (resultado 20)
  secondaryObjective?: ServiceObjective;
}

/**
 * Interface para complicações de serviços
 * Baseada nas tabelas "Tipos de Complicações" e "Consequências das Complicações"
 */
export interface ServiceComplication {
  type: ServiceComplicationType;
  consequence: ServiceComplicationConsequence;
  description: string; // Descrição narrativa gerada
}

/**
 * Tipos de complicações conforme tabela "Tipos de Complicações"
 */
export enum ServiceComplicationType {
  GOVERNO_LOCAL_DESAPROVA = "Governo local desaprova",
  FACCAO_CRIMINOSA_APROVEITA = "Facção criminosa quer se aproveitar",
  ORDEM_RELIGIOSA_INTERESSADA = "Ordem religiosa/arcana interessada",
  RIVAL_CONTRATANTE_ENCIUMADO = "Um rival do contratante fica enciumado",
  INSTITUICAO_OFICIO_AFETADA = "Instituição de ofício afetada",
  HUMANOIDES_HOSTIS = "Humanoides hostis",
  EVENTO_LOCAL_INTERFERE = "Evento local interfere no cronograma",
  ANIMAL_ATRAPALHA = "Animal ou mascote atrapalha",
  MORADORES_SE_OPOEM = "Grupo de moradores se opõe",
  ALIADO_CONTRATANTE_DISCORDA = "Aliado do contratante discorda",
  AUTORIDADE_EXIGE_SUPERVISAO = "Autoridade exige supervisão extra",
  ERRO_BUROCRATICO = "Erro burocrático atrasa o andamento",
  GRUPO_RIVAL_SABOTA = "Grupo rival tenta sabotar discretamente",
  ACIDENTE_DANOS_LEVES = "Acidente causa danos leves",
  BOATO_NEGATIVO = "Boato negativo se espalha",
  FISCAL_INESPERADO = "Fiscal inesperado aparece",
  COMPETIDOR_MAIS_BARATO = "Competidor oferece serviço mais barato",
  TERCEIROS_OCUPAM_LOCAL = "Terceiros ocupam o local",
  ALTERACAO_ULTIMA_HORA = "Pedido de alteração de última hora",
  MULTIPLAS_COMPLICACOES = "Role duas vezes e use ambos",
}

/**
 * Consequências das complicações conforme tabela "Consequências das Complicações"
 */
export enum ServiceComplicationConsequence {
  MEDIDAS_LEGAIS = "Entrará com medidas legais",
  MANIPULACAO_BAIXO_PANOS = "Manipulará as coisas por baixo dos panos",
  TENTATIVA_CONVENCER_DESISTIR = "Tentará te convencer a desistir",
  COMPLICARA_VIDA_SUCESSO = "Complicará sua vida caso seja bem-sucedido",
  ABUSO_PODER = "Abusará de seu poder para conseguir o que quer",
  VIOLENCIA_IMPEDIR = "Usarão de violência para te impedir",
  CONTRATANTE_EXIGE_RETRABALHO = "Contratante exigirá retrabalho",
  NEGOCIAR_SOLUCAO_ALTERNATIVA = "Terá que negociar uma solução alternativa",
  ORDENS_CONTRADITORIAS = "Dará ordens contraditórias",
  RECLAMACOES_TERCEIROS = "Reclamações de terceiros",
  SUMIRA_DOCUMENTOS = "Sumirá com documentos essenciais",
  FISCALIZACAO_EXTRA = "Fiscalização extra",
  VAZARA_INFORMACOES = "Vazará informações confidenciais",
  COMPENSACAO_SIMBOLICA = "Exigirá compensação simbólica",
  CONTRATAR_CONCORRENTES = "Contratará concorrentes para atrapalhar",
  ATRASAR_PAGAMENTO = "Tentará atrasar o pagamento indefinidamente",
  FOFOCAS_COMPETENCIA = "Espalhará fofocas sobre sua competência",
  EXIGENCIAS_FORA_ESCOPO = "Fará exigências fora do escopo original",
  GARANTIA_ADICIONAL = "Contratante exige garantia adicional",
  MULTIPLAS_CONSEQUENCIAS = "Role duas vezes e use ambos",
}

/**
 * Interface para rivais em serviços
 * Baseada nas tabelas "Ações do Rival" e "Motivação do Rival"
 */
export interface ServiceRival {
  action: ServiceRivalAction;
  motivation: ServiceRivalMotivation;
  description: string; // Descrição narrativa gerada
}

/**
 * Ações do rival conforme tabela "Ações do Rival"
 */
export enum ServiceRivalAction {
  IRA_CONTRA_OBJETIVO = "Irá contra seu objetivo",
  FARA_MESMA_COISA = "Fará a mesma coisa que você",
  SABOTA_ARMADILHAS = "Sabota/Implanta armadilhas",
  ROUBARA_RECURSOS = "Roubará recursos importantes",
  TENTARA_FICAR_CREDITOS = "Tentará ficar com os créditos",
  ESPALHA_RUMORES = "Espalha rumores maldosos",
  FINGIRA_SER_CONTRATADO = "Fingirá ser o contratado",
  DARA_DICAS_FALSAS = "Dará dicas falsas sobre o serviço",
  OFERECERA_INFORMACOES = "Oferecerá valiosas informações",
  TENTARA_SUBORNAR_AMEACAR = "Tentará te subornar ou ameaçar",
}

/**
 * Motivação do rival conforme tabela "Motivação do Rival"
 */
export enum ServiceRivalMotivation {
  FAZ_POR_AMOR = "Faz isso por amor",
  SE_ATRAPALHA_TODO = "Se atrapalha todo",
  FAZ_PORQUE_PRECISA = "Faz isso porque precisa",
  BUSCA_RECONHECIMENTO = "Busca reconhecimento",
  BUSCA_RECOMPENSA_PESSOAL = "Busca uma recompensa pessoal",
  SEGUINDO_ORDENS_TERCEIROS = "Está seguindo ordens de terceiros",
  FAZ_POR_DIVERSAO = "Faz isso por pura diversão",
  FAZ_POR_VINGANCA = "Faz isso por vingança",
  SOB_INFLUENCIA_MAGICA = "Está sob influência mágica ou mental",
  EVITAR_DESASTRE_MAIOR = "Está tentando evitar um desastre maior",
  FAZ_PELAS_CRIANCAS = "Faz isso pelas crianças",
  SE_ARREPENDE = "Se arrepende",
  DESAPARECE_DEPOIS = "Desaparece depois disso",
  NO_FUNDO_GOSTA = "No fundo gosta, e faz isso por você",
  FAZ_PORQUE_TE_ODEIA = "Faz isso porque te odeia",
  FAZ_CONTRA_VONTADE = "Faz isso contra a vontade dele",
  NA_VERDADE_E_CONTRATANTE = "Na verdade é o contratante",
}

/**
 * Interface para a origem do problema
 * Baseada nas tabelas "Origem do Problema" e "Complicador Adicional"
 */
export interface ServiceOrigin {
  rootCause: ServiceOriginCause;
  additionalComplicator: ServiceAdditionalComplicator;
  description: string; // Descrição narrativa gerada
}

/**
 * Causas raiz conforme tabela "Origem do Problema"
 */
export enum ServiceOriginCause {
  TRADICAO_CONFLITO_FAMILIAR = "Tradição/conflito familiar",
  CORRUPCAO_GOVERNO = "Corrupção no governo local",
  APROVEITADOR_CHARLATAO = "Aproveitador/charlatão",
  ALGO_MUNDANO_NATURAL = "Algo mundano, corriqueiro ou natural",
  ANTIGA_PROMESSA_NAO_CUMPRIDA = "Antiga promessa não cumprida",
  FALTA_COMUNICACAO = "Falta de comunicação entre grupos",
  CRIATURAS_FORA_ASSENTAMENTO = "Criaturas de fora do assentamento",
  DESINFORMACAO_BOATOS = "Desinformação ou boatos espalhados",
  ORDEM_RELIGIOSA_BOAS_INTENCOES = "Ordem religiosa com boas intenções",
  ESCASSEZ_RECURSOS = "Escassez de recursos essenciais",
  PESTE_DOENCA = "Peste ou doença contagiosa",
  PROFECIA_MAL_INTERPRETADA = "Profecia (possivelmente mal interpretada)",
  FALTA_MAO_OBRA = "Falta de mão-de-obra",
  INTERFERENCIA_FEITICEIRO = "Interferência de feiticeiro/eremita",
  FENOMENO_NATURAL_INCOMUM = "Fenômeno natural incomum",
  ESPIONAGEM_POLITICA = "Espionagem política",
  MUDANCA_LIDERANCA = "Mudança repentina de liderança local",
  DISPUTA_TERRITORIO = "Disputa por território ou recursos",
  EVENTO_SAZONAL = "Evento sazonal inesperado",
  MORTE_HUMANOIDE_IMPORTANTE = "A morte de um humanoide importante",
}

/**
 * Complicadores adicionais conforme tabela "Complicador Adicional"
 */
export enum ServiceAdditionalComplicator {
  UM_POUCO_AZAR = "Um pouco de azar",
  MAL_ENTENDIDO = "Um mal entendido",
  INTERVENCAO_DIVINA = "Intervenção divina",
  GANANCIA = "Ganância",
  QUEBRA_MALDICAO = "A quebra de uma maldição",
  ROMANCE_INTERROMPIDO = "Um romance interrompido",
  TRAICAO = "Traição",
  SUMIÇO_ARTEFATO = "O sumiço de um importante artefato",
  CONFLITO_FACCOES = "Conflito entre facções",
  CHANTAGEM = "Chantagem",
  DIVIDA = "Dívida",
  ATRASO_INESPERADO = "Um atraso inesperado",
  PRESSAO_TEMPO = "Pressão do tempo",
  VISITA_SURPRESA = "Uma visita surpresa",
  INCOMPETENCIA = "Incompetência",
  ACIDENTE_INESPERADO = "Acidente inesperado",
  EXCESSO_BUROCRACIA = "Excesso de burocracia",
  INTERFERENCIA_EXTERNA = "Interferência externa",
  MUDANCA_PLANOS = "Mudança de planos",
  EVENTO_CLIMATICO = "Evento climático/desastre natural",
}

/**
 * Interface para desafios adicionais conforme seção "Desafio Adicional"
 * Representa obstáculos únicos que surgem durante a execução do serviço
 */
export interface ServiceAdditionalChallenge {
  description: string; // Descrição do desafio (vem da tabela d100)
  hasChallenge: boolean; // Se há desafio (rolagem 1d20, só 20 = sim)
}

/**
// ===== SCHEMAS ZOD PARA VALIDAÇÃO =====

/**
 * Schema para modificadores de serviços
 */
export const ServiceModifiersSchema = z.object({
  populationRelation: z.number().int().min(-5).max(5),
  governmentRelation: z.number().int().min(-5).max(5),
  staffCondition: z.number().int().min(-1).max(1),
});

/**
 * Schema para valor de serviços
 */
export const ServiceValueSchema = z.object({
  rewardRoll: z.string().min(1).max(50), // Ex: "1d6 C$", "3d4 C$"
  rewardAmount: z.number().int().min(1).max(10000),
  currency: z.enum(["C$", "PO$"]),
  recurrenceBonus: z.string().min(1).max(20), // Ex: "+0,5 C$", "+5 C$"
  recurrenceBonusAmount: z.number().min(0).max(100000),
  recurrenceStepAmount: z.number().min(0).max(100000).optional(),
  recurrenceAppliedCount: z.number().int().min(0).optional(),
  difficulty: z.nativeEnum(ServiceDifficulty),
  modifiers: ServiceModifiersSchema,
  complexityMultiplier: z.number().min(0).optional(),
});

/**
 * Schema para objetivo de serviços
 */
export const ServiceObjectiveSchema: z.ZodType<ServiceObjective> = z.object({
  type: z.nativeEnum(ServiceObjectiveType),
  description: z.string().min(1).max(500),
  action: z.string().min(1).max(200),
  target: z.string().min(1).max(200),
  complication: z.string().min(1).max(300),
  secondaryObjective: z.lazy(() => ServiceObjectiveSchema).optional(),
});

/**
 * Schema para complicações de serviços
 */
export const ServiceComplicationSchema = z.object({
  type: z.nativeEnum(ServiceComplicationType),
  consequence: z.nativeEnum(ServiceComplicationConsequence),
  description: z.string().min(1).max(300),
});

/**
 * Schema para rivais em serviços
 */
export const ServiceRivalSchema = z.object({
  action: z.nativeEnum(ServiceRivalAction),
  motivation: z.nativeEnum(ServiceRivalMotivation),
  description: z.string().min(1).max(300),
});

/**
 * Schema para origem do serviço
 */
export const ServiceOriginSchema = z.object({
  rootCause: z.nativeEnum(ServiceOriginCause),
  additionalComplicator: z.nativeEnum(ServiceAdditionalComplicator),
  description: z.string().min(1).max(300),
});

// ===== SCHEMAS PARA SISTEMA DE TESTES =====

/**
 * Schema para teste individual
 */
export const ServiceTestSchema = z.object({
  baseND: z.number().int().min(10).max(30),
  ndModifier: z.number().int().min(-5).max(5),
  finalND: z.number().int().min(5).max(35),
  testIndex: z.number().int().min(0).max(10),
  completed: z.boolean(),
  rollResult: z.number().int().min(1).max(20).optional(),
  success: z.boolean().optional(),
});

/**
 * Schema para resultado de testes
 */
export const ServiceTestOutcomeSchema = z.object({
  result: z.string().min(1).max(200),
  renownModifier: z.number().int().min(-5).max(5),
  rewardModifier: z.number().min(0).max(2),
  wellDone: z.boolean(),
  masterwork: z.boolean(),
});

/**
 * Schema para estrutura completa de testes
 */
export const ServiceTestStructureSchema = z.object({
  complexity: z.nativeEnum(ServiceComplexity),
  baseND: z.number().int().min(10).max(30),
  totalTests: z.number().int().min(1).max(5),
  skillRequirement: z.enum(["same", "different", "mixed"]),
  tests: z.array(ServiceTestSchema),
  successCount: z.number().int().min(0).max(5),
  completed: z.boolean(),
  outcome: ServiceTestOutcomeSchema.optional(),
});

/**
 * Schema principal para serviços
 */

/**
 * Schema para desafios adicionais
 */
export const ServiceAdditionalChallengeSchema = z.object({
  description: z.string().min(1).max(500),
  hasChallenge: z.boolean(),
});

/**
 * Schema principal para serviços
 */
export const ServiceSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(1000),
  status: z.nativeEnum(ServiceStatus),
  complexity: z.nativeEnum(ServiceComplexity),
  difficulty: z.nativeEnum(ServiceDifficulty),

  // Sistema de testes
  testStructure: ServiceTestStructureSchema,

  contractorType: z.nativeEnum(ServiceContractorType),
  contractorName: z.string().optional(),

  // Elementos narrativos expandidos
  objective: ServiceObjectiveSchema.optional(),
  complication: ServiceComplicationSchema.optional(),
  rival: ServiceRivalSchema.optional(),
  origin: ServiceOriginSchema.optional(),
  additionalChallenge: ServiceAdditionalChallengeSchema.optional(),
  creativityKeywords: z
    .array(
      z.object({
        keyword: z.string().min(1).max(50),
      })
    )
    .optional(),

  value: ServiceValueSchema,
  deadline: z.object({
    type: z.nativeEnum(ServiceDeadlineType),
    value: z.string().optional(),
  }),
  deadlineDate: z
    .object({
      day: z.number().int().min(1).max(31),
      month: z.number().int().min(1).max(12),
      year: z.number().int().min(1).max(9999),
    })
    .optional(),
  paymentType: z.nativeEnum(ServicePaymentType),
  createdAt: z.object({
    day: z.number().int().min(1).max(31),
    month: z.number().int().min(1).max(12),
    year: z.number().int().min(1).max(9999),
  }),
  acceptedAt: z
    .object({
      day: z.number().int().min(1).max(31),
      month: z.number().int().min(1).max(12),
      year: z.number().int().min(1).max(9999),
    })
    .optional(),
  completedAt: z
    .object({
      day: z.number().int().min(1).max(31),
      month: z.number().int().min(1).max(12),
      year: z.number().int().min(1).max(9999),
    })
    .optional(),
  isActive: z.boolean(),
  isExpired: z.boolean(),
});

// ===== FUNÇÕES UTILITÁRIAS =====

/**
 * Validação de serviço usando Zod
 */
export const validateService = (data: unknown): Service => {
  return ServiceSchema.parse(data);
};

/**
 * Calcula recompensa final considerando modificadores e bônus de recorrência
 */
export const calculateFinalServiceReward = (service: Service): number => {
  // O valor final é a soma do valor base (rewardAmount) mais o bônus de recorrência acumulado
  const base = service.value.rewardAmount || 0;
  const recurrence = service.value.recurrenceBonusAmount || 0;
  const complexityMult = service.value.complexityMultiplier || 1;
  const total = Math.max(1, Math.floor((base + recurrence) * complexityMult));
  return total;
};

/**
 * Verifica se um serviço está expirado baseado na data atual
 */
export const isServiceExpired = (
  service: Service,
  currentDate: GameDate
): boolean => {
  if (
    !service.deadlineDate ||
    service.deadline.type === ServiceDeadlineType.SEM_PRAZO
  ) {
    return false;
  }

  const deadlineYear = service.deadlineDate.year;
  const deadlineMonth = service.deadlineDate.month;
  const deadlineDay = service.deadlineDate.day;

  if (currentDate.year > deadlineYear) return true;
  if (currentDate.year < deadlineYear) return false;

  if (currentDate.month > deadlineMonth) return true;
  if (currentDate.month < deadlineMonth) return false;

  return currentDate.day > deadlineDay;
};

/**
 * Aplica bônus de recorrência para serviços não resolvidos
 */
export const applyRecurrenceBonus = (service: Service): Service => {
  const currentBonusAmount = service.value.recurrenceBonusAmount || 0;
  const step =
    typeof service.value.recurrenceStepAmount === "number"
      ? service.value.recurrenceStepAmount
      : service.value.currency === "C$"
        ? 5
        : 1;

  const newBonusAmount = currentBonusAmount + step;
  const newRecurrenceAppliedCount =
    (service.value.recurrenceAppliedCount || 0) + 1;

  const currency = service.value.currency || "C$";
  const formatForCurrency = (amt: number) => {
    if (currency === "PO$") {
      const r = Math.round((amt + Number.EPSILON) * 100) / 100;
      const s = r.toFixed(2);
      return s.replace(/\.00$/, "").replace(/(\.[0-9])0$/, "$1");
    }
    return Number.isInteger(amt) ? String(amt) : String(amt);
  };

  const newBonusText = `+${formatForCurrency(newBonusAmount)} ${currency}`;

  return {
    ...service,
    value: {
      ...service.value,
      recurrenceBonus: newBonusText,
      recurrenceBonusAmount: newBonusAmount,
      recurrenceAppliedCount: newRecurrenceAppliedCount,
      recurrenceStepAmount: service.value.recurrenceStepAmount,
    },
  };
};
