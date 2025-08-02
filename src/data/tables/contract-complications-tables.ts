/**
 * Tabelas de Complicações e Reviravoltas para Contratos
 *
 * Este arquivo implementa as tabelas para:
 * - Tipos de complicações (1d20)
 * - Detalhamento específico de cada tipo de complicação
 * - Sistema de reviravoltas
 * - Elementos das reviravoltas (Quem? Na verdade... Mas...)
 */

import type { TableEntry } from "@/types/tables";
import {
  ComplicationCategory,
  TwistWho,
  TwistWhat,
  TwistBut,
} from "@/types/contract";

// ===== COMPLICAÇÕES =====

/**
 * Tabela principal de tipos de complicações
 * Baseado na seção "Tipos de Complicações"
 */
export const COMPLICATION_TYPES_TABLE: TableEntry<ComplicationCategory>[] = [
  { min: 1, max: 3, result: ComplicationCategory.RECURSOS },
  { min: 4, max: 6, result: ComplicationCategory.VITIMAS },
  { min: 7, max: 8, result: ComplicationCategory.ORGANIZACAO },
  { min: 9, max: 9, result: ComplicationCategory.MIRACULOSO },
  { min: 10, max: 12, result: ComplicationCategory.AMBIENTE_HOSTIL },
  { min: 13, max: 13, result: ComplicationCategory.INUSITADO },
  { min: 14, max: 15, result: ComplicationCategory.PROBLEMAS_DIPLOMATICOS },
  { min: 16, max: 16, result: ComplicationCategory.PROTECAO },
  { min: 17, max: 17, result: ComplicationCategory.CONTRA_TEMPO_AMISTOSO },
  { min: 18, max: 20, result: ComplicationCategory.ENCONTRO_HOSTIL },
];

// ===== DETALHAMENTO DAS COMPLICAÇÕES =====

/**
 * Detalhamento: Recursos (1d20)
 */
export const RECURSOS_COMPLICATIONS_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Um grande tesouro está em risco" },
  { min: 2, max: 2, result: "O inimigo possui recursos infindáveis" },
  { min: 3, max: 3, result: "As armas dos aventureiros não são eficazes" },
  { min: 4, max: 4, result: "Algo torna a magia mais caótica" },
  { min: 5, max: 5, result: "Tentativas de roubo" },
  { min: 6, max: 6, result: "Fonte de água/comida contaminada" },
  { min: 7, max: 7, result: "Artefato mágico fora de controle" },
  { min: 8, max: 8, result: "Todos os tesouros são bugigangas" },
  { min: 9, max: 9, result: "Crise econômica" },
  { min: 10, max: 10, result: "Tesouro amaldiçoado" },
  { min: 11, max: 11, result: "Equipamentos se deterioram rapidamente" },
  { min: 12, max: 12, result: "Suprimentos escassos" },
  { min: 13, max: 13, result: "Moeda local desvalorizada" },
  { min: 14, max: 14, result: "Materiais de má qualidade" },
  { min: 15, max: 15, result: "Preços inflacionados" },
  { min: 16, max: 16, result: "Embargo comercial" },
  { min: 17, max: 17, result: "Recursos controlados por inimigos" },
  { min: 18, max: 18, result: "Ferramentas inadequadas" },
  { min: 19, max: 19, result: "Reservas esgotadas" },
  { min: 20, max: 20, result: "Role duas vezes e use ambos" },
];

/**
 * Detalhamento: Vítimas (1d20)
 */
export const VITIMAS_COMPLICATIONS_TABLE: TableEntry<string>[] = [
  { min: 1, max: 2, result: "Grande número de inocentes afetados" },
  { min: 3, max: 3, result: "Rival afetado que pede ajuda" },
  { min: 4, max: 4, result: "Nobre orgulhoso" },
  { min: 5, max: 5, result: "Entidade sobrenatural" },
  { min: 6, max: 6, result: "Inocente levando a culpa" },
  { min: 7, max: 7, result: "Criatura amada em perigo" },
  { min: 8, max: 8, result: "Vítimas agem como vilões" },
  { min: 9, max: 9, result: "Reféns com risco de morte" },
  { min: 10, max: 10, result: "Refugiados de zona de conflito" },
  { min: 11, max: 11, result: "Crianças/filhos do inimigo afetados" },
  { min: 12, max: 12, result: "Anciãos indefesos" },
  { min: 13, max: 13, result: "Visitantes estrangeiros" },
  { min: 14, max: 14, result: "Comerciantes presos" },
  { min: 15, max: 15, result: "Estudiosos capturados" },
  { min: 16, max: 16, result: "Artistas perseguidos" },
  { min: 17, max: 17, result: "Testemunhas importantes" },
  { min: 18, max: 18, result: "Líderes religiosos" },
  { min: 19, max: 20, result: "Role duas vezes e use ambos" },
];

/**
 * Detalhamento: Organização (1d20)
 */
export const ORGANIZACAO_COMPLICATIONS_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Grupo rival de aventureiros" },
  { min: 2, max: 2, result: "Grupo de mercenários" },
  { min: 3, max: 3, result: "Casa nobre que quer se beneficiar" },
  { min: 4, max: 4, result: "Seita religiosa" },
  { min: 5, max: 5, result: "Facção criminosa" },
  { min: 6, max: 6, result: "Clã/família de grande renome" },
  { min: 7, max: 7, result: "Sindicato de mercadores" },
  { min: 8, max: 8, result: "Realeza é contra a conclusão do objetivo" },
  { min: 9, max: 9, result: "Interesse direto da guilda" },
  { min: 10, max: 10, result: "Revolucionários têm o mesmo objetivo" },
  { min: 11, max: 11, result: "Ordem militar interferindo" },
  { min: 12, max: 12, result: "Conselho de magos opositores" },
  { min: 13, max: 13, result: "Tribunal corrupto" },
  { min: 14, max: 14, result: "Irmandade secreta" },
  { min: 15, max: 15, result: "Companhia rival" },
  { min: 16, max: 16, result: "Aliança de cidades inimigas" },
  { min: 17, max: 17, result: "Colégio de sábios contra" },
  { min: 18, max: 18, result: "Rede de espiões" },
  { min: 19, max: 19, result: "Círculo de druidas hostis" },
  { min: 20, max: 20, result: "Role duas vezes e use ambos" },
];

/**
 * Detalhamento: Miraculoso (1d20)
 */
export const MIRACULOSO_COMPLICATIONS_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Maldição ancestral" },
  { min: 2, max: 2, result: "Local sagrado para uma cultura" },
  { min: 3, max: 3, result: "Energia corrosiva" },
  { min: 4, max: 4, result: "A magia parece ter vida própria" },
  { min: 5, max: 5, result: "Almas penadas" },
  { min: 6, max: 6, result: "Antigo mal desperta" },
  { min: 7, max: 7, result: "Tempestade de neve não natural" },
  { min: 8, max: 8, result: "Objetos mágicos têm mal funcionamento" },
  { min: 9, max: 9, result: "Comunicação impossível" },
  { min: 10, max: 10, result: "Magia impede de chegar ao local" },
  { min: 11, max: 11, result: "Intervenção divina misteriosa" },
  { min: 12, max: 12, result: "Profecia se cumprindo" },
  { min: 13, max: 13, result: "Milagres inesperados" },
  { min: 14, max: 14, result: "Presença celestial" },
  { min: 15, max: 15, result: "Bênção corrompida" },
  { min: 16, max: 16, result: "Ritual antigo ativado" },
  { min: 17, max: 17, result: "Portal divino aberto" },
  { min: 18, max: 18, result: "Revelação sobrenatural" },
  { min: 19, max: 20, result: "Role duas vezes e use ambos" },
];

/**
 * Detalhamento: Ambiente Hostil (1d20)
 */
export const AMBIENTE_HOSTIL_COMPLICATIONS_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Difícil acesso" },
  { min: 2, max: 2, result: "Habitantes hostis" },
  { min: 3, max: 3, result: "Armadilhas mortais" },
  { min: 4, max: 4, result: "Emboscadas frequentes" },
  { min: 5, max: 5, result: "Ar rarefeito" },
  { min: 6, max: 6, result: "Canibais agressivos" },
  { min: 7, max: 7, result: "Toxinas nocivas" },
  { min: 8, max: 8, result: "Profundezas oceânicas" },
  { min: 9, max: 9, result: "Tempestades frequentes" },
  { min: 10, max: 10, result: "Temperaturas extremas" },
  { min: 11, max: 11, result: "Terreno instável" },
  { min: 12, max: 12, result: "Radiação mágica" },
  { min: 13, max: 13, result: "Névoa densa permanente" },
  { min: 14, max: 14, result: "Predadores territoriais" },
  { min: 15, max: 15, result: "Labirinto natural" },
  { min: 16, max: 16, result: "Zona de magia morta" },
  { min: 17, max: 17, result: "Correntezas perigosas" },
  { min: 18, max: 18, result: "Plantas carnívoras" },
  { min: 19, max: 19, result: "Gravidade alterada" },
  { min: 20, max: 20, result: "Role duas vezes e use ambos" },
];

/**
 * Detalhamento: Inusitado (1d20)
 */
export const INUSITADO_COMPLICATIONS_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Dividido em 4 partes" },
  { min: 2, max: 2, result: "Não existe/está nesse plano" },
  { min: 3, max: 3, result: "Atitudes questionáveis" },
  { min: 4, max: 4, result: "Disfarce imperceptível" },
  { min: 5, max: 5, result: "Está em constante movimento" },
  { min: 6, max: 6, result: "Informação equivocada" },
  { min: 7, max: 7, result: "O contratante desaparece" },
  { min: 8, max: 8, result: "Completamente esquecido" },
  { min: 9, max: 9, result: "Memórias roubadas" },
  { min: 10, max: 10, result: "Aliado confundido com inimigo" },
  { min: 11, max: 11, result: "Existe apenas em sonhos" },
  { min: 12, max: 12, result: "Invisível para alguns" },
  { min: 13, max: 13, result: "Muda de forma constantemente" },
  { min: 14, max: 14, result: "Só existe em determinada hora" },
  { min: 15, max: 15, result: "Espelhado/invertido" },
  { min: 16, max: 16, result: "Fragmentado no tempo" },
  { min: 17, max: 17, result: "Compartilha consciência" },
  { min: 18, max: 18, result: "Reage ao contrário do esperado" },
  { min: 19, max: 20, result: "Role duas vezes e use ambos" },
];

/**
 * Detalhamento: Problemas Diplomáticos (1d20)
 */
export const PROBLEMAS_DIPLOMATICOS_COMPLICATIONS_TABLE: TableEntry<string>[] =
  [
    { min: 1, max: 1, result: "Problemas de jurisdição" },
    { min: 2, max: 2, result: "Interferência política" },
    { min: 3, max: 3, result: "Disputas de poder" },
    { min: 4, max: 4, result: "Espionagem" },
    { min: 5, max: 5, result: "Corrupção" },
    { min: 6, max: 6, result: "Taxas abusivas" },
    { min: 7, max: 7, result: "Líder manipulado" },
    { min: 8, max: 8, result: "Odeiam forasteiros" },
    { min: 9, max: 9, result: "Criminosos infiltrados" },
    { min: 10, max: 10, result: "Cumprir o objetivo pode iniciar uma guerra" },
    { min: 11, max: 11, result: "Protocolo rígido obrigatório" },
    { min: 12, max: 12, result: "Embaixador hostil" },
    { min: 13, max: 13, result: "Tratado violado" },
    { min: 14, max: 14, result: "Negociação fracassada" },
    { min: 15, max: 15, result: "Mediador corrompido" },
    { min: 16, max: 16, result: "Aliança frágil ameaçada" },
    { min: 17, max: 17, result: "Insulto cultural grave" },
    { min: 18, max: 18, result: "Refém diplomático" },
    { min: 19, max: 19, result: "Sanções comerciais" },
    { min: 20, max: 20, result: "Role duas vezes e use ambos" },
  ];

/**
 * Detalhamento: Proteção (1d20)
 */
export const PROTECAO_COMPLICATIONS_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Guardado por uma criatura poderosa" },
  { min: 2, max: 2, result: "Protegido por magias e maldições" },
  { min: 3, max: 3, result: "Protegido por lei" },
  { min: 4, max: 4, result: "Falha de segurança grave" },
  { min: 5, max: 5, result: "Protegido por um elemental (gênio)" },
  { min: 6, max: 6, result: "Selo celestial" },
  { min: 7, max: 7, result: "Selo abissal/infernal" },
  { min: 8, max: 8, result: "Construção anã antiga" },
  { min: 9, max: 9, result: "Protegido por um dragão adormecido" },
  { min: 10, max: 10, result: "Protegido por inocentes" },
  { min: 11, max: 11, result: "Barreira mágica poderosa" },
  { min: 12, max: 12, result: "Guardião artificial" },
  { min: 13, max: 13, result: "Sistema de vigilância arcano" },
  { min: 14, max: 14, result: "Proteção temporal" },
  { min: 15, max: 15, result: "Guardas de elite" },
  { min: 16, max: 16, result: "Fortaleza impenetrável" },
  { min: 17, max: 17, result: "Proteção divina ativa" },
  { min: 18, max: 18, result: "Armadilhas inteligentes" },
  { min: 19, max: 19, result: "Defesa psíquica" },
  { min: 20, max: 20, result: "Role duas vezes e use ambos" },
];

/**
 * Detalhamento: Contra-tempo Amistoso (1d20)
 */
export const CONTRA_TEMPO_AMISTOSO_COMPLICATIONS_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Gnomos pregando peças" },
  { min: 2, max: 2, result: "Um grande herói tem o objetivo contrário" },
  { min: 3, max: 3, result: "Objetivo conflita com o ideal do contratado" },
  { min: 4, max: 4, result: "Criaturas bondosas tentando fazer amizade" },
  { min: 5, max: 5, result: "Humanoides atrapalham tentando ajudar" },
  { min: 6, max: 6, result: "Inocente se entrega para salvar o culpado" },
  { min: 7, max: 7, result: "Rival tenta duelar o tempo todo" },
  { min: 8, max: 8, result: "Festividades e badernas que tiram o foco" },
  { min: 9, max: 9, result: "Clérigos que evitam conflito" },
  { min: 10, max: 10, result: "Contratante vai junto/manda um supervisor" },
  { min: 11, max: 11, result: "Criança perdida pede ajuda" },
  { min: 12, max: 12, result: "Animal ferido precisa de cuidados" },
  { min: 13, max: 13, result: "Ancião sábio oferece conselhos" },
  { min: 14, max: 14, result: "Bardo quer documentar a aventura" },
  { min: 15, max: 15, result: "Comerciante insiste em vender" },
  { min: 16, max: 16, result: "Inventor quer testar invenções" },
  { min: 17, max: 17, result: "Romântico persistente" },
  { min: 18, max: 18, result: "Guia perdido oferece direções erradas" },
  { min: 19, max: 19, result: "Grupo religioso quer converter" },
  { min: 20, max: 20, result: "Role duas vezes e use ambos" },
];

/**
 * Detalhamento: Encontro Hostil (1d20)
 */
export const ENCONTRO_HOSTIL_COMPLICATIONS_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Acontece um encontro hostil adicional por dia" },
  { min: 2, max: 2, result: "Para cada encontro hostil, acontece mais um" },
  { min: 3, max: 3, result: "A cada dois dias acontece um encontro hostil" },
  { min: 4, max: 4, result: "Todo encontro é hostil" },
  { min: 5, max: 5, result: "Se o encontro não for hostil, ele não acontece" },
  { min: 6, max: 6, result: "Inimigos hostis são mais poderosos" },
  { min: 7, max: 7, result: "Oponentes tendem a ficar hostis mais facilmente" },
  { min: 8, max: 8, result: "Aumente os PV de todos inimigos hostis" },
  { min: 9, max: 9, result: "Inimigos hostis SEMPRE têm itens mágicos" },
  {
    min: 10,
    max: 10,
    result: "Caso estejam perdendo, fogem mas retornam para se vingar",
  },
  {
    min: 11,
    max: 11,
    result: "Encontros acontecem em momentos inconvenientes",
  },
  { min: 12, max: 12, result: "Inimigos trabalham em coordenação" },
  { min: 13, max: 13, result: "Adversários conhecem táticas do grupo" },
  { min: 14, max: 14, result: "Encontros são emboscadas planejadas" },
  { min: 15, max: 15, result: "Inimigos têm vantagem de terreno" },
  { min: 16, max: 16, result: "Oponentes são imunes a negociação" },
  { min: 17, max: 17, result: "Encontros escalam rapidamente" },
  { min: 18, max: 18, result: "Inimigos chamam reforços constantemente" },
  { min: 19, max: 19, result: "Adversários são persistentes" },
  { min: 20, max: 20, result: "Role duas vezes e use ambos" },
];

// ===== REVIRAVOLTAS =====

/**
 * Chance de haver uma reviravolta (1d20)
 * Baseado na seção "Chance de Reviravolta"
 */
export const TWIST_CHANCE_TABLE: TableEntry<boolean>[] = [
  { min: 1, max: 18, result: false }, // Não
  { min: 19, max: 20, result: true }, // Sim
];

/**
 * Quem está envolvido na reviravolta (1d20)
 * Baseado na tabela "Quem?" dos elementos da reviravolta
 */
export const TWIST_WHO_TABLE: TableEntry<TwistWho>[] = [
  { min: 1, max: 1, result: TwistWho.CONTRATANTE },
  { min: 2, max: 2, result: TwistWho.ALIADO },
  { min: 3, max: 3, result: TwistWho.COMPLICACAO },
  { min: 4, max: 4, result: TwistWho.OBJETIVO },
  { min: 5, max: 5, result: TwistWho.VITIMA_INOCENTE },
  { min: 6, max: 6, result: TwistWho.VELHO_CONHECIDO },
  { min: 7, max: 7, result: TwistWho.FUNCIONARIO_GUILDA },
  { min: 8, max: 8, result: TwistWho.ESPECTADOR_NEUTRO },
  { min: 9, max: 9, result: TwistWho.INFORMANTE },
  { min: 10, max: 10, result: TwistWho.AUTORIDADE_LOCAL },
  { min: 11, max: 11, result: TwistWho.MERCADOR },
  { min: 12, max: 12, result: TwistWho.GUARDA_PATRULHA },
  { min: 13, max: 13, result: TwistWho.FONTE_PISTAS },
  { min: 14, max: 14, result: TwistWho.MEMBRO_FAMILIA_REAL },
  { min: 15, max: 15, result: TwistWho.CURANDEIRO_SABIO },
  { min: 16, max: 16, result: TwistWho.CRIANCA_INVISIVEL },
  { min: 17, max: 17, result: TwistWho.RIVAL_LONGA_DATA },
  { min: 18, max: 18, result: TwistWho.MORTO_DESAPARECIDO },
  { min: 19, max: 19, result: TwistWho.BENFEITOR_ANONIMO },
  { min: 20, max: 20, result: TwistWho.TERRA_LOCAL },
];

/**
 * Na verdade... (1d20)
 * Baseado na tabela "Na verdade..." dos elementos da reviravolta
 */
export const TWIST_WHAT_TABLE: TableEntry<TwistWhat>[] = [
  { min: 1, max: 1, result: TwistWhat.VERDADEIRO_INIMIGO },
  { min: 2, max: 2, result: TwistWhat.PARENTE_PROXIMO },
  { min: 3, max: 3, result: TwistWhat.HEROI_LENDARIO },
  { min: 4, max: 4, result: TwistWhat.NAO_E_O_QUE_PARECE },
  { min: 5, max: 5, result: TwistWhat.AUXILIA_ANTAGONISTA },
  { min: 6, max: 6, result: TwistWhat.FANTASMA },
  { min: 7, max: 7, result: TwistWhat.ESPIAO_INFILTRADO },
  { min: 8, max: 8, result: TwistWhat.CONTROLADO_POSSUIDO },
  { min: 9, max: 9, result: TwistWhat.ILUSAO_DISFARCE },
  { min: 10, max: 10, result: TwistWhat.OUTRA_DIMENSAO },
  { min: 11, max: 11, result: TwistWhat.CLONE_IMPOSTOR },
  { min: 12, max: 12, result: TwistWhat.MAIS_PODEROSO },
  { min: 13, max: 13, result: TwistWhat.PERDEU_MEMORIA },
  { min: 14, max: 14, result: TwistWhat.METAMORFO },
  { min: 15, max: 15, result: TwistWhat.SENDO_CHANTAGEADO },
  { min: 16, max: 16, result: TwistWhat.CRIACAO_ARTIFICIAL },
  { min: 17, max: 17, result: TwistWhat.VIAJANTE_TEMPORAL },
  { min: 18, max: 18, result: TwistWhat.DEUS_DISFARCADO },
  { min: 19, max: 19, result: TwistWhat.REENCARNACAO },
  { min: 20, max: 20, result: TwistWhat.MULTIPLAS_PESSOAS },
];

/**
 * Mas... (1d20)
 * Baseado na tabela "Mas..." dos elementos da reviravolta
 */
export const TWIST_BUT_TABLE: TableEntry<TwistBut>[] = [
  { min: 1, max: 1, result: TwistBut.PELAS_CRIANCAS },
  { min: 2, max: 2, result: TwistBut.ANTAGONISTA_SEM_CULPA },
  { min: 3, max: 3, result: TwistBut.ASSASSINADO_MISTERIOSAMENTE },
  { min: 4, max: 4, result: TwistBut.LIGADO_PROFECIA },
  { min: 5, max: 5, result: TwistBut.PROTEGER_NATUREZA },
  { min: 6, max: 6, result: TwistBut.OBJETIVO_EXIGE_SACRIFICIO },
  { min: 7, max: 7, result: TwistBut.SALVAR_ALGUEM_QUERIDO },
  { min: 8, max: 8, result: TwistBut.FORCADO_MALDICAO },
  { min: 9, max: 9, result: TwistBut.ACREDITA_FAZER_BEM },
  { min: 10, max: 10, result: TwistBut.CUMPRINDO_PROMESSA },
  { min: 11, max: 11, result: TwistBut.EVITAR_ALGO_PIOR },
  { min: 12, max: 12, result: TwistBut.PROTEGENDO_SEGREDO },
  { min: 13, max: 13, result: TwistBut.DIAS_DE_VIDA },
  { min: 14, max: 14, result: TwistBut.MANIPULADO_SEM_SABER },
  { min: 15, max: 15, result: TwistBut.SALVAR_ALMA },
  { min: 16, max: 16, result: TwistBut.DESFAZER_ERRO_PASSADO },
  { min: 17, max: 17, result: TwistBut.UNICO_QUE_PODE },
  { min: 18, max: 18, result: TwistBut.HONRANDO_MEMORIA },
  { min: 19, max: 19, result: TwistBut.PROVAR_VALOR },
  { min: 20, max: 20, result: TwistBut.TEMPO_SE_ESGOTANDO },
];

// ===== MAPEAMENTO DE TABELAS DE DETALHAMENTO =====

/**
 * Mapeamento das categorias para suas respectivas tabelas de detalhamento
 */
export const COMPLICATION_DETAIL_TABLES: Record<
  ComplicationCategory,
  TableEntry<string>[]
> = {
  [ComplicationCategory.RECURSOS]: RECURSOS_COMPLICATIONS_TABLE,
  [ComplicationCategory.VITIMAS]: VITIMAS_COMPLICATIONS_TABLE,
  [ComplicationCategory.ORGANIZACAO]: ORGANIZACAO_COMPLICATIONS_TABLE,
  [ComplicationCategory.MIRACULOSO]: MIRACULOSO_COMPLICATIONS_TABLE,
  [ComplicationCategory.AMBIENTE_HOSTIL]: AMBIENTE_HOSTIL_COMPLICATIONS_TABLE,
  [ComplicationCategory.INUSITADO]: INUSITADO_COMPLICATIONS_TABLE,
  [ComplicationCategory.PROBLEMAS_DIPLOMATICOS]:
    PROBLEMAS_DIPLOMATICOS_COMPLICATIONS_TABLE,
  [ComplicationCategory.PROTECAO]: PROTECAO_COMPLICATIONS_TABLE,
  [ComplicationCategory.CONTRA_TEMPO_AMISTOSO]:
    CONTRA_TEMPO_AMISTOSO_COMPLICATIONS_TABLE,
  [ComplicationCategory.ENCONTRO_HOSTIL]: ENCONTRO_HOSTIL_COMPLICATIONS_TABLE,
};
