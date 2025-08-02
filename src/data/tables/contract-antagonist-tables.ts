import type { TableEntry } from "@/types/tables";
import { AntagonistCategory } from "@/types/contract";

// ===== TABELAS DE ANTAGONISTAS DE CONTRATOS =====

// Implementa as tabelas de antagonistas

// ===== TIPOS DE ANTAGONISTAS (1d20) =====

// Tabela principal para determinar o tipo de antagonista
export const ANTAGONIST_TYPES_TABLE: TableEntry<string>[] = [
  { min: 1, max: 4, result: "Humanoide poderoso" },
  { min: 5, max: 6, result: "Artefato mágico" },
  { min: 7, max: 9, result: "Organização" },
  { min: 10, max: 12, result: "Perigo iminente" },
  { min: 13, max: 13, result: "Entidade sobrenatural" },
  { min: 14, max: 14, result: "Anomalia" },
  { min: 15, max: 16, result: "Desastre ou acidente" },
  { min: 17, max: 18, result: "Crise" },
  { min: 19, max: 19, result: "Mistério" },
  { min: 20, max: 20, result: "Role duas vezes e use ambos" },
];

// ===== DETALHAMENTO DOS ANTAGONISTAS =====

// HUMANOIDE PODEROSO (1d20)
export const HUMANOID_ANTAGONIST_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Mercenário/assassino" },
  { min: 2, max: 2, result: "Conjurador" },
  { min: 3, max: 3, result: "Nobre" },
  { min: 4, max: 4, result: "Líder importante" },
  { min: 5, max: 5, result: "Duplo" },
  { min: 6, max: 6, result: "Alquimista perturbado" },
  { min: 7, max: 7, result: "Rival do contratante" },
  { min: 8, max: 8, result: "Herói/aventureiro" },
  { min: 9, max: 9, result: "Fanático religioso" },
  { min: 10, max: 10, result: "Fugitivo" },
  { min: 11, max: 11, result: "Comerciante corrupto" },
  { min: 12, max: 12, result: "General renegado" },
  { min: 13, max: 13, result: "Sacerdote caído" },
  { min: 14, max: 14, result: "Espião infiltrado" },
  { min: 15, max: 15, result: "Artista excêntrico" },
  { min: 16, max: 16, result: "Diplomata traidor" },
  { min: 17, max: 17, result: "Revolucionário radical" },
  { min: 18, max: 18, result: "Mentor decaído" },
  { min: 19, max: 20, result: "Role duas vezes e use ambos" },
];

// ARTEFATO MÁGICO (1d20)
export const MAGICAL_ARTIFACT_ANTAGONIST_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Constructo descontrolado" },
  { min: 2, max: 2, result: "Relíquia divina" },
  { min: 3, max: 3, result: "Artefato alienígena" },
  { min: 4, max: 4, result: "Joia com a alma de um ser poderoso" },
  { min: 5, max: 5, result: "Armadura enfeitiçada" },
  { min: 6, max: 6, result: "Arma senciente" },
  { min: 7, max: 7, result: "Grimório proibido" },
  { min: 8, max: 8, result: "Foco arcano danificado/corrompido" },
  { min: 9, max: 9, result: "Pergaminho milenar" },
  { min: 10, max: 10, result: "Objeto amaldiçoado" },
  { min: 11, max: 11, result: "Portal instável" },
  { min: 12, max: 12, result: "Cristal de energia" },
  { min: 13, max: 13, result: "Espelho dimensional" },
  { min: 14, max: 14, result: "Amuleto corruptor" },
  { min: 15, max: 15, result: "Instrumento musical mágico" },
  { min: 16, max: 16, result: "Totem ancestral" },
  { min: 17, max: 17, result: "Orbe de poder" },
  { min: 18, max: 18, result: "Máquina antiga" },
  { min: 19, max: 19, result: "Recipiente de almas" },
  { min: 20, max: 20, result: "Role duas vezes e use ambos" },
];

// ORGANIZAÇÃO (1d20)
export const ORGANIZATION_ANTAGONIST_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Grupo ameaçador" },
  { min: 2, max: 2, result: "Facção criminosa" },
  { min: 3, max: 3, result: "Seita cultista" },
  { min: 4, max: 4, result: "Alta sociedade" },
  { min: 5, max: 5, result: "Corte real inimiga" },
  { min: 6, max: 6, result: "Clã/família poderosa" },
  { min: 7, max: 7, result: "Sociedade secreta" },
  { min: 8, max: 8, result: "Grupo de aventureiros" },
  { min: 9, max: 9, result: "Revolucionários" },
  { min: 10, max: 10, result: "Sindicato" },
  { min: 11, max: 11, result: "Uma guilda rival" },
  { min: 12, max: 12, result: "Irmandade militar" },
  { min: 13, max: 13, result: "Ordem de magos" },
  { min: 14, max: 14, result: "Companhia mercantil" },
  { min: 15, max: 15, result: "Conselho de anciãos" },
  { min: 16, max: 16, result: "Tribunal corrupto" },
  { min: 17, max: 17, result: "Colégio de bardos" },
  { min: 18, max: 18, result: "Rede de espionagem" },
  { min: 19, max: 19, result: "Pacto de druidas" },
  { min: 20, max: 20, result: "Role duas vezes e use ambos" },
];

// PERIGO IMINENTE (1d20)
export const IMMINENT_DANGER_ANTAGONIST_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Humanoides tribais/canibais" },
  { min: 2, max: 2, result: "Animais selvagens" },
  { min: 3, max: 3, result: "Bestas pré-históricas" },
  { min: 4, max: 4, result: "Plantas guardiãs" },
  { min: 5, max: 5, result: "Licantropos" },
  { min: 6, max: 6, result: "Enxames de insetos" },
  { min: 7, max: 7, result: "Saqueadores frequentes" },
  { min: 8, max: 8, result: "Elementais" },
  { min: 9, max: 9, result: "Criatura mitológica" },
  { min: 10, max: 10, result: "Animais atrozes" },
  { min: 11, max: 11, result: "Horda de mortos-vivos" },
  { min: 12, max: 12, result: "Bandidos organizados" },
  { min: 13, max: 13, result: "Predadores noturnos" },
  { min: 14, max: 14, result: "Criaturas subterrâneas" },
  { min: 15, max: 15, result: "Invasores planares" },
  { min: 16, max: 16, result: "Monstros aquáticos" },
  { min: 17, max: 17, result: "Feras corrompidas" },
  { min: 18, max: 18, result: "Aberrações antigas" },
  { min: 19, max: 19, result: "Espíritos vingativos" },
  { min: 20, max: 20, result: "Role duas vezes e use ambos" },
];

// ENTIDADE SOBRENATURAL (1d20)
export const SUPERNATURAL_ENTITY_ANTAGONIST_TABLE: TableEntry<string>[] = [
  { min: 1, max: 3, result: "Vampiro" },
  { min: 4, max: 4, result: "Ser incorpóreo" },
  { min: 5, max: 7, result: "Morto-vivo poderoso" },
  { min: 8, max: 8, result: "Celestial descontrolado" },
  { min: 9, max: 9, result: "Fada" },
  { min: 10, max: 10, result: "Demônio menor" },
  { min: 11, max: 11, result: "Anjo caído" },
  { min: 12, max: 12, result: "Espectro antigo" },
  { min: 13, max: 13, result: "Senhor das sombras" },
  { min: 14, max: 14, result: "Arquifada" },
  { min: 15, max: 15, result: "Entidade cósmica" },
  { min: 16, max: 16, result: "Espírito elemental" },
  { min: 17, max: 18, result: "Alma perdida" },
  { min: 19, max: 19, result: "Guardião corrompido" },
  { min: 20, max: 20, result: "Role duas vezes e use ambos" },
];

// ANOMALIA (1d20)
export const ANOMALY_ANTAGONIST_TABLE: TableEntry<string>[] = [
  { min: 1, max: 2, result: "Monstruosidade" },
  { min: 3, max: 4, result: "Demônio ou diabo" },
  { min: 5, max: 5, result: "Fenda planar" },
  { min: 6, max: 6, result: "Híbrido ou Animalesco" },
  { min: 7, max: 7, result: "Névoa sobrenatural" },
  { min: 8, max: 8, result: "Invasão zumbi/esqueleto" },
  { min: 9, max: 9, result: "Limo" },
  { min: 10, max: 10, result: "Anormalidades na natureza" },
  { min: 11, max: 11, result: "Criatura poderosa adormecida" },
  { min: 12, max: 12, result: "Climática" },
  { min: 13, max: 14, result: "Zona de magia selvagem" },
  { min: 15, max: 15, result: "Distorção temporal" },
  { min: 16, max: 16, result: "Mutação descontrolada" },
  { min: 17, max: 17, result: "Corrupção arcana" },
  { min: 18, max: 18, result: "Fissura na realidade" },
  { min: 19, max: 19, result: "Manifestação psíquica" },
  { min: 20, max: 20, result: "Role duas vezes e use ambos" },
];

// DESASTRE OU ACIDENTE (1d20)
export const DISASTER_ANTAGONIST_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Inundação" },
  { min: 2, max: 2, result: "Terremoto" },
  { min: 3, max: 3, result: "Naufrágio" },
  { min: 4, max: 4, result: "Feitiço fora de controle" },
  { min: 5, max: 5, result: "Experimento que deu errado" },
  { min: 6, max: 6, result: "Construções depredadas/desabamento" },
  { min: 7, max: 7, result: "Incêndio" },
  { min: 8, max: 8, result: "Meteoro" },
  { min: 9, max: 9, result: "Nevasca impetuosa" },
  { min: 10, max: 10, result: "Acidente de trabalho" },
  { min: 11, max: 11, result: "Deslizamento de terra" },
  { min: 12, max: 12, result: "Tempestade devastadora" },
  { min: 13, max: 13, result: "Explosão arcana" },
  { min: 14, max: 14, result: "Praga de insetos" },
  { min: 15, max: 15, result: "Contaminação tóxica" },
  { min: 16, max: 16, result: "Falha em portal" },
  { min: 17, max: 17, result: "Acidente com criaturas" },
  { min: 18, max: 18, result: "Avalanche" },
  { min: 19, max: 20, result: "Role duas vezes e use ambos" },
];

// CRISE (1d20)
export const CRISIS_ANTAGONIST_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Conflito político" },
  { min: 2, max: 2, result: "Doença" },
  { min: 3, max: 3, result: "Escassez de recursos básicos" },
  { min: 4, max: 4, result: "Parasita ou praga" },
  { min: 5, max: 5, result: "Guerra iminente/Disputa territorial" },
  { min: 6, max: 6, result: "Revolução/revolta" },
  { min: 7, max: 7, result: "Econômica" },
  { min: 8, max: 8, result: "Dragão" },
  { min: 9, max: 9, result: "Queda de uma figura importante" },
  { min: 10, max: 10, result: "Conflito religioso" },
  { min: 11, max: 11, result: "Crise diplomática" },
  { min: 12, max: 12, result: "Colapso de instituições" },
  { min: 13, max: 13, result: "Sucessão contestada" },
  { min: 14, max: 14, result: "Corrupção generalizada" },
  { min: 15, max: 15, result: "Cisma social" },
  { min: 16, max: 16, result: "Fuga em massa" },
  { min: 17, max: 17, result: "Boicote comercial" },
  { min: 18, max: 18, result: "Conspiração revelada" },
  { min: 19, max: 19, result: "Perda de confiança" },
  { min: 20, max: 20, result: "Role duas vezes e use ambos" },
];

// MISTÉRIO (1d20)
export const MYSTERY_ANTAGONIST_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Conspiração" },
  { min: 2, max: 2, result: "Comportamento/fenômeno anormal" },
  { min: 3, max: 3, result: "Mortes misteriosas" },
  { min: 4, max: 4, result: "Roubos/Desaparecimentos" },
  { min: 5, max: 5, result: "Maldição/castigo divino" },
  { min: 6, max: 6, result: "Atentado" },
  { min: 7, max: 7, result: "Profecia" },
  { min: 8, max: 8, result: "Surtos de magia" },
  { min: 9, max: 9, result: "Rituais e símbolos" },
  { min: 10, max: 10, result: "Lenda urbana/local" },
  { min: 11, max: 11, result: "Memórias perdidas" },
  { min: 12, max: 12, result: "Identidade falsa" },
  { min: 13, max: 13, result: "Mensagens codificadas" },
  { min: 14, max: 14, result: "Testemunhas conflitantes" },
  { min: 15, max: 15, result: "Segredo familiar" },
  { min: 16, max: 16, result: "Artefato perdido" },
  { min: 17, max: 17, result: "Presságio sombrio" },
  { min: 18, max: 18, result: "Passado oculto" },
  { min: 19, max: 19, result: "Conexão inesperada" },
  { min: 20, max: 20, result: "Role duas vezes e use ambos" },
];

// ===== MAPEAMENTO DE CATEGORIAS =====

// Mapeia o resultado da tabela principal para as tabelas de detalhamento
export const ANTAGONIST_DETAIL_TABLE_MAP: Record<string, TableEntry<string>[]> =
  {
    "Humanoide poderoso": HUMANOID_ANTAGONIST_TABLE,
    "Artefato mágico": MAGICAL_ARTIFACT_ANTAGONIST_TABLE,
    Organização: ORGANIZATION_ANTAGONIST_TABLE,
    "Perigo iminente": IMMINENT_DANGER_ANTAGONIST_TABLE,
    "Entidade sobrenatural": SUPERNATURAL_ENTITY_ANTAGONIST_TABLE,
    Anomalia: ANOMALY_ANTAGONIST_TABLE,
    "Desastre ou acidente": DISASTER_ANTAGONIST_TABLE,
    Crise: CRISIS_ANTAGONIST_TABLE,
    Mistério: MYSTERY_ANTAGONIST_TABLE,
  };

// ===== FUNÇÕES UTILITÁRIAS =====

/**
 * Mapeia o resultado da tabela principal para a categoria enum correspondente
 */
export function mapAntagonistTypeToCategory(
  antagonistType: string
): AntagonistCategory {
  const mapping: Record<string, AntagonistCategory> = {
    "Humanoide poderoso": AntagonistCategory.HUMANOIDE_PODEROSO,
    "Artefato mágico": AntagonistCategory.ARTEFATO_MAGICO,
    Organização: AntagonistCategory.ORGANIZACAO,
    "Perigo iminente": AntagonistCategory.PERIGO_IMINENTE,
    "Entidade sobrenatural": AntagonistCategory.ENTIDADE_SOBRENATURAL,
    Anomalia: AntagonistCategory.ANOMALIA,
    "Desastre ou acidente": AntagonistCategory.DESASTRE_ACIDENTE,
    Crise: AntagonistCategory.CRISE,
    Mistério: AntagonistCategory.MISTERIO,
  };

  return mapping[antagonistType] || AntagonistCategory.HUMANOIDE_PODEROSO;
}

/**
 * Verifica se o resultado indica para rolar duas vezes
 */
export function shouldRollTwice(result: string): boolean {
  return result.includes("Role duas vezes");
}
