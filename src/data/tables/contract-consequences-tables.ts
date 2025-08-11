/**
 * Tabelas de Consequências Severas e Palavras-chave Temáticas
 *
 * Este arquivo implementa as tabelas para:
 * - Chance de consequências severas por falha em contratos
 * - Tipos e detalhamento de consequências severas
 * - Consequências adicionais para os contratados
 * - Palavras-chave temáticas para criatividade
 * - Contratantes inusitados
 */

import type { TableEntry } from "@/types/tables";
import { SevereConsequenceCategory } from "@/types/contract";

// ===== TABELAS DE CONSEQUÊNCIAS SEVERAS =====

/**
 * Chance de consequências severas por falha no contrato
 * Rolagem: 1d20
 */
export const SEVERE_CONSEQUENCES_CHANCE_TABLE: TableEntry<boolean>[] = [
  { min: 1, max: 2, result: true },
  { min: 3, max: 20, result: false },
];

/**
 * Tipos de consequências severas
 * Rolagem: 1d20
 */
export const SEVERE_CONSEQUENCES_TYPES_TABLE: TableEntry<SevereConsequenceCategory>[] =
  [
    { min: 1, max: 3, result: SevereConsequenceCategory.MALDICAO },
    { min: 4, max: 5, result: SevereConsequenceCategory.GUERRA },
    { min: 6, max: 7, result: SevereConsequenceCategory.CALAMIDADE_NATURAL },
    { min: 8, max: 10, result: SevereConsequenceCategory.PRAGA },
    {
      min: 11,
      max: 12,
      result: SevereConsequenceCategory.EVENTOS_SOBRENATURAIS,
    },
    { min: 13, max: 14, result: SevereConsequenceCategory.FOME_SECA },
    { min: 15, max: 16, result: SevereConsequenceCategory.CRISE_ECONOMICA },
    { min: 17, max: 18, result: SevereConsequenceCategory.PERSEGUICAO },
    { min: 19, max: 20, result: SevereConsequenceCategory.MORTE_IMPORTANTES },
  ];

// ===== DETALHAMENTO DAS CONSEQUÊNCIAS SEVERAS =====

/**
 * Detalhamento: Maldição (1d20)
 */
export const CURSE_CONSEQUENCES_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Doença incurável" },
  { min: 2, max: 2, result: "Transformação permanente" },
  { min: 3, max: 3, result: "Metamorfose ou troca de espécie" },
  { min: 4, max: 4, result: "Envelhecimento" },
  { min: 5, max: 5, result: "Perda de características" },
  { min: 6, max: 6, result: "Amnésia" },
  { min: 7, max: 7, result: "Insanidade" },
  { min: 8, max: 8, result: "Perseguição constante" },
  { min: 9, max: 9, result: "Perda da capacidade de comunicação" },
  { min: 10, max: 10, result: "Separação para sempre de quem amam" },
  { min: 11, max: 11, result: "Marca visível de vergonha" },
  { min: 12, max: 12, result: "Incapacidade de mentir" },
  { min: 13, max: 13, result: "Atração de monstros" },
  { min: 14, max: 14, result: "Pesadelos eternos" },
  { min: 15, max: 15, result: "Perda de memórias felizes" },
  { min: 16, max: 16, result: "Incapacidade de tocar ouro" },
  { min: 17, max: 17, result: "Sombra ganha vida própria" },
  { min: 18, max: 18, result: "Reflexo desaparece" },
  { min: 19, max: 19, result: "Fala apenas verdades dolorosas" },
  { min: 20, max: 20, result: "Role duas vezes e use ambos" },
];

/**
 * Detalhamento: Guerra (1d20)
 */
export const WAR_CONSEQUENCES_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Entre duas facções locais" },
  { min: 2, max: 2, result: "Civil" },
  { min: 3, max: 3, result: "Contra os líderes locais" },
  { min: 4, max: 4, result: "Revolução" },
  { min: 5, max: 6, result: "Contra uma criatura poderosa" },
  { min: 7, max: 7, result: "Contra um reino aliado" },
  { min: 8, max: 8, result: "Para colonizar terras indígenas" },
  { min: 9, max: 9, result: "Contra um reino inimigo" },
  { min: 10, max: 10, result: "Expansão territorial" },
  { min: 11, max: 11, result: "Contra a natureza" },
  { min: 12, max: 12, result: "Conflito geracional" },
  { min: 13, max: 13, result: "Guerra de sucessão" },
  { min: 14, max: 14, result: "Guerra de recursos" },
  { min: 15, max: 15, result: "Conflito racial" },
  { min: 16, max: 16, result: "Guerra comercial violenta" },
  { min: 17, max: 17, result: "Contra rebeldes organizados" },
  { min: 18, max: 19, result: "Guerra de vingança" },
  { min: 20, max: 20, result: "Role duas vezes e use ambos" },
];

/**
 * Detalhamento: Calamidade Natural (1d20)
 */
export const NATURAL_CALAMITY_CONSEQUENCES_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Terremoto" },
  { min: 2, max: 2, result: "Vulcão ativo" },
  { min: 3, max: 3, result: "Furacão impetuoso" },
  { min: 4, max: 4, result: "Tsunami" },
  { min: 5, max: 5, result: "Enchente" },
  { min: 6, max: 6, result: "Desmoronamento" },
  { min: 7, max: 7, result: "Incêndio florestal" },
  { min: 8, max: 8, result: "Meteoro" },
  { min: 9, max: 9, result: "Nevasca impetuosa" },
  { min: 10, max: 10, result: "Acidente de trabalho" },
  { min: 11, max: 11, result: "Seca prolongada" },
  { min: 12, max: 12, result: "Tempestade de granizo" },
  { min: 13, max: 13, result: "Deslizamento de terra" },
  { min: 14, max: 14, result: "Tromba d'água" },
  { min: 15, max: 15, result: "Geada devastadora" },
  { min: 16, max: 16, result: "Erosão acelerada" },
  { min: 17, max: 17, result: "Inversão de maré" },
  { min: 18, max: 18, result: "Ventos destrutivos" },
  { min: 19, max: 19, result: "Avalanche" },
  { min: 20, max: 20, result: "Role duas vezes e use ambos" },
];

/**
 * Detalhamento: Praga (1d20)
 */
export const PLAGUE_CONSEQUENCES_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Febre mortal" },
  { min: 2, max: 2, result: "Torna as pessoas insanas" },
  { min: 3, max: 3, result: "Mortos-vivos que ressurgem" },
  { min: 4, max: 4, result: "Esterilidade em massa" },
  { min: 5, max: 5, result: "Parasitas" },
  { min: 6, max: 6, result: "Alucinações" },
  { min: 7, max: 7, result: "Torna as pessoas agressivas" },
  { min: 8, max: 8, result: "Perda do desenvolvimento mental" },
  { min: 9, max: 9, result: "Transforma pessoas em monstros" },
  { min: 10, max: 10, result: "Amaldiçoa a magia das pessoas" },
  { min: 11, max: 11, result: "Cegueira progressiva" },
  { min: 12, max: 12, result: "Perda de memória coletiva" },
  { min: 13, max: 13, result: "Mutação corporal" },
  { min: 14, max: 14, result: "Sonambulismo violento" },
  { min: 15, max: 15, result: "Envenenamento do sangue" },
  { min: 16, max: 16, result: "Perda da fala" },
  { min: 17, max: 17, result: "Deterioração dos ossos" },
  { min: 18, max: 18, result: "Sensibilidade extrema à luz" },
  { min: 19, max: 19, result: "Paralisia gradual" },
  { min: 20, max: 20, result: "Role duas vezes e use ambos" },
];

/**
 * Detalhamento: Eventos Sobrenaturais (1d20)
 */
export const SUPERNATURAL_EVENTS_CONSEQUENCES_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Surto de magia" },
  { min: 2, max: 2, result: "Aberturas pro submundo" },
  { min: 3, max: 3, result: "Invocações acidentais" },
  { min: 4, max: 4, result: "Tempestade mágica" },
  { min: 5, max: 5, result: "Magnetismo mágico" },
  { min: 6, max: 6, result: "Pesadelos que afetam o mundo real" },
  { min: 7, max: 7, result: "Visões que confundem populares" },
  { min: 8, max: 8, result: "Portais através do tempo" },
  { min: 9, max: 9, result: "Alteração da realidade" },
  { min: 10, max: 10, result: "Invocação de deuses" },
  { min: 11, max: 11, result: "Fantasmas manifestados" },
  { min: 12, max: 12, result: "Objetos ganham vida" },
  { min: 13, max: 13, result: "Gravidade alterada" },
  { min: 14, max: 14, result: "Clima sobrenatural" },
  { min: 15, max: 15, result: "Ecos do passado" },
  { min: 16, max: 16, result: "Presságios sombrios" },
  { min: 17, max: 17, result: "Energia negativa" },
  { min: 18, max: 18, result: "Rituais espontâneos" },
  { min: 19, max: 19, result: "Manifestações psíquicas" },
  { min: 20, max: 20, result: "Role duas vezes e use ambos" },
];

/**
 * Detalhamento: Fome/Seca (1d20)
 */
export const FAMINE_DROUGHT_CONSEQUENCES_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Por muitos anos" },
  { min: 2, max: 2, result: "Pragas nas plantações" },
  { min: 3, max: 3, result: "Envenenamento da água" },
  { min: 4, max: 4, result: "Terras não são mais férteis" },
  { min: 5, max: 5, result: "Recursos limitados à nobreza" },
  { min: 6, max: 6, result: "Mortes misteriosas do gado" },
  { min: 7, max: 7, result: "Saqueamento constante" },
  { min: 8, max: 8, result: "Guerra longa" },
  { min: 9, max: 9, result: "Crescimento populacional descontrolado" },
  { min: 10, max: 10, result: "Má distribuição de renda" },
  { min: 11, max: 11, result: "Seca prolongada" },
  { min: 12, max: 12, result: "Inundações devastadoras" },
  { min: 13, max: 13, result: "Praga de insetos" },
  { min: 14, max: 14, result: "Solo contaminado" },
  { min: 15, max: 15, result: "Mudanças climáticas extremas" },
  { min: 16, max: 16, result: "Bloqueio comercial" },
  { min: 17, max: 17, result: "Desperdício de recursos" },
  { min: 18, max: 18, result: "Falhas na irrigação" },
  { min: 19, max: 19, result: "Competição por terras" },
  { min: 20, max: 20, result: "Role duas vezes e use ambos" },
];

/**
 * Detalhamento: Crise Econômica (1d20)
 */
export const ECONOMIC_CRISIS_CONSEQUENCES_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Falta de mão de obra" },
  { min: 2, max: 2, result: "Roubo de recursos" },
  { min: 3, max: 3, result: "Aumento descontrolado de preços" },
  { min: 4, max: 4, result: "Perda de rotas comerciais" },
  { min: 5, max: 5, result: "Sabotagem em áreas de trabalho" },
  { min: 6, max: 6, result: "Perda de matéria prima" },
  { min: 7, max: 7, result: "Falta de comunicação" },
  { min: 8, max: 8, result: "Escravidão" },
  { min: 9, max: 9, result: "Grandes roubos e saques" },
  { min: 10, max: 10, result: "Desvio de verbas" },
  { min: 11, max: 11, result: "Inflação descontrolada" },
  { min: 12, max: 12, result: "Escassez de alimentos" },
  { min: 13, max: 13, result: "Desemprego em massa" },
  { min: 14, max: 14, result: "Colapso da moeda" },
  { min: 15, max: 15, result: "Pobreza extrema" },
  { min: 16, max: 16, result: "Mercado negro" },
  { min: 17, max: 17, result: "Falência de comércios" },
  { min: 18, max: 18, result: "Falta de recursos básicos" },
  { min: 19, max: 19, result: "Êxodo populacional" },
  { min: 20, max: 20, result: "Role duas vezes e use ambos" },
];

/**
 * Detalhamento: Perseguição (1d20)
 */
export const PERSECUTION_CONSEQUENCES_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Por piratas" },
  { min: 2, max: 2, result: "Pelos líderes locais" },
  { min: 3, max: 3, result: "Por caçadores de recompensa" },
  { min: 4, max: 4, result: "Por outro reino" },
  { min: 5, max: 5, result: "Por criaturas poderosas" },
  { min: 6, max: 6, result: "Por agentes do governo" },
  { min: 7, max: 7, result: "Por criminosos organizados" },
  { min: 8, max: 8, result: "Por membros da família" },
  { min: 9, max: 9, result: "Por fanáticos" },
  { min: 10, max: 10, result: "Por magos" },
  { min: 11, max: 11, result: "Por mercenários" },
  { min: 12, max: 12, result: "Por cultistas" },
  { min: 13, max: 13, result: "Por inquisidores" },
  { min: 14, max: 14, result: "Por assassinos profissionais" },
  { min: 15, max: 15, result: "Por bestas selvagens" },
  { min: 16, max: 16, result: "Por espíritos vingativos" },
  { min: 17, max: 17, result: "Por autoridades corruptas" },
  { min: 18, max: 18, result: "Por rivais comerciais" },
  { min: 19, max: 19, result: "Por ex-aliados" },
  { min: 20, max: 20, result: "Role duas vezes e use ambos" },
];

/**
 * Detalhamento: Morte de Importantes (1d20)
 */
export const IMPORTANT_DEATHS_CONSEQUENCES_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Família de um líder local" },
  { min: 2, max: 2, result: "Herói famoso" },
  { min: 3, max: 3, result: "Membro importante de uma organização" },
  { min: 4, max: 4, result: "Líderes de todas as casas nobres" },
  { min: 5, max: 5, result: "Membro de alta patente na religião local" },
  { min: 6, max: 6, result: "Aventureiros famosos" },
  { min: 7, max: 7, result: "Mercador influente" },
  { min: 8, max: 8, result: "Líder de uma facção criminosa" },
  { min: 9, max: 9, result: "Enviado/diplomata" },
  { min: 10, max: 10, result: "Toda a família real" },
  { min: 11, max: 11, result: "Guarda real" },
  { min: 12, max: 12, result: "Conselheiro do rei" },
  { min: 13, max: 13, result: "Mestre artesão" },
  { min: 14, max: 14, result: "General respeitado" },
  { min: 15, max: 15, result: "Líder religioso" },
  { min: 16, max: 16, result: "Sábio renomado" },
  { min: 17, max: 17, result: "Juiz respeitado" },
  { min: 18, max: 18, result: "Comandante de guilda" },
  { min: 19, max: 19, result: "Artista celebrado" },
  { min: 20, max: 20, result: "Role duas vezes e use ambos" },
];

// ===== CONSEQUÊNCIAS ADICIONAIS =====

/**
 * O que acontece com os contratados (1d20)
 */
export const CONTRACTOR_CONSEQUENCES_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Acabam enfurecendo uma divindade" },
  { min: 2, max: 2, result: "Acabam tendo sua reputação manchada" },
  { min: 3, max: 3, result: "Saem de mãos abanando" },
  {
    min: 4,
    max: 4,
    result: "Criam uma inimizade forte com um dragão metálico",
  },
  { min: 5, max: 5, result: "Têm um prêmio por suas cabeças" },
  { min: 6, max: 6, result: "Agora são odiados por uma raça específica" },
  { min: 7, max: 7, result: "São perseguidos por um ser poderoso" },
  { min: 8, max: 8, result: "São marcados por uma maldição menor" },
  { min: 9, max: 9, result: "Perdem acesso a um local importante" },
  { min: 10, max: 10, result: "Tornam-se fugitivos da lei" },
  { min: 11, max: 11, result: "Ganham inimigos na nobreza local" },
  { min: 12, max: 12, result: "São expulsos de uma organização" },
  { min: 13, max: 13, result: "Perdem a confiança de aliados próximos" },
  { min: 14, max: 14, result: "Ficam endividados com alguém perigoso" },
  { min: 15, max: 15, result: "São considerados heróis por uma facção" },
  { min: 16, max: 16, result: "Ganham uma obsessão ou vício" },
  { min: 17, max: 17, result: "São banidos de um reino" },
  { min: 18, max: 18, result: "Atraem a atenção de caçadores" },
  { min: 19, max: 19, result: "Perdem algo valioso como pagamento" },
  { min: 20, max: 20, result: "Descobrem um segredo que não queriam saber" },
];

/**
 * E... (segunda tabela de consequências) (1d20)
 */
export const ADDITIONAL_CONSEQUENCES_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Acabam enfurecendo um dragão cromático" },
  { min: 2, max: 2, result: "Atrapalham os planos de um Lich vingativo" },
  { min: 3, max: 3, result: "Ajudam na conclusão de um ritual maligno" },
  { min: 4, max: 4, result: "Auxiliaram conquistadores de outras terras" },
  {
    min: 5,
    max: 5,
    result: "Não são mais bem-vindos em um assentamento importante",
  },
  { min: 6, max: 6, result: "As ações afetam negativamente muitos inocentes" },
  { min: 7, max: 7, result: "Despertam uma antiga maldição familiar" },
  { min: 8, max: 8, result: "Interferem no equilíbrio natural de uma região" },
  { min: 9, max: 9, result: "Tornam-se peças em um jogo político maior" },
  { min: 10, max: 10, result: "Provocam uma guerra entre facções" },
  { min: 11, max: 11, result: "Libertam algo que deveria permanecer preso" },
  { min: 12, max: 12, result: "Destroem um artefato histórico importante" },
  { min: 13, max: 13, result: "Causam uma crise de fé numa religião local" },
  { min: 14, max: 14, result: "Atraem a atenção de entidades planares" },
  { min: 15, max: 15, result: "Comprometem uma missão diplomática crucial" },
  { min: 16, max: 16, result: "Criam um precedente perigoso para outros" },
  { min: 17, max: 17, result: "Violam um tabu cultural antigo" },
  { min: 18, max: 18, result: "Inadvertidamente ajudam um culto maligno" },
  { min: 19, max: 19, result: "Alteram o curso de eventos proféticos" },
  {
    min: 20,
    max: 20,
    result: "Desencadeiam uma série de eventos catastróficos",
  },
];

// ===== MAPEAMENTO DE TABELAS DE DETALHAMENTO =====

/**
 * Mapeamento das categorias para suas respectivas tabelas de detalhamento
 */
export const SEVERE_CONSEQUENCE_DETAIL_TABLES: Record<
  SevereConsequenceCategory,
  TableEntry<string>[]
> = {
  [SevereConsequenceCategory.MALDICAO]: CURSE_CONSEQUENCES_TABLE,
  [SevereConsequenceCategory.GUERRA]: WAR_CONSEQUENCES_TABLE,
  [SevereConsequenceCategory.CALAMIDADE_NATURAL]:
    NATURAL_CALAMITY_CONSEQUENCES_TABLE,
  [SevereConsequenceCategory.PRAGA]: PLAGUE_CONSEQUENCES_TABLE,
  [SevereConsequenceCategory.EVENTOS_SOBRENATURAIS]:
    SUPERNATURAL_EVENTS_CONSEQUENCES_TABLE,
  [SevereConsequenceCategory.FOME_SECA]: FAMINE_DROUGHT_CONSEQUENCES_TABLE,
  [SevereConsequenceCategory.CRISE_ECONOMICA]:
    ECONOMIC_CRISIS_CONSEQUENCES_TABLE,
  [SevereConsequenceCategory.PERSEGUICAO]: PERSECUTION_CONSEQUENCES_TABLE,
  [SevereConsequenceCategory.MORTE_IMPORTANTES]:
    IMPORTANT_DEATHS_CONSEQUENCES_TABLE,
};

// ===== FUNÇÕES DE ACESSO ÀS TABELAS =====

/**
 * Retorna todas as entradas da tabela de consequências severas
 */
export function getSevereConsequencesTable() {
  return SEVERE_CONSEQUENCES_TYPES_TABLE;
}

/**
 * Retorna as consequências de uma categoria específica
 */
export function getSevereConsequencesTableByCategory(
  category: SevereConsequenceCategory
) {
  return SEVERE_CONSEQUENCE_DETAIL_TABLES[category] || [];
}
