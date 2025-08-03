/**
 * Tabelas de Aliados e Recompensas para Contratos
 *
 * Seções: "Aparição de Aliados" e "Recompensas e Incentivos"
 *
 * Estas tabelas implementam:
 * - Sistema de aparição de aliados (chance e tipos)
 * - Quando/como os aliados surgem
 * - Detalhamento específico por tipo de aliado
 * - Sistema de recompensas adicionais
 * - Detalhamento das recompensas por categoria
 */

import type { TableEntry } from "@/types/tables";

// ===== TABELAS DE ALIADOS =====

/**
 * Chance de aparição de aliados durante a execução do contrato
 * Rolagem: 1d20
 */
export const ALLY_APPEARANCE_CHANCE_TABLE: TableEntry<boolean>[] = [
  { min: 1, max: 10, result: false },
  { min: 11, max: 20, result: true },
];

/**
 * Tipos de aliados que podem surgir durante um contrato
 * Rolagem: 1d20
 */
export const ALLY_TYPES_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Artefato" },
  { min: 2, max: 4, result: "Criatura poderosa" },
  { min: 5, max: 5, result: "Inesperado" },
  { min: 6, max: 6, result: "Ajuda sobrenatural" },
  { min: 7, max: 12, result: "Civis ordinários" },
  { min: 13, max: 13, result: "Natureza" },
  { min: 14, max: 16, result: "Organização" },
  { min: 17, max: 17, result: "Refúgio" },
  { min: 18, max: 19, result: "Aventureiros" },
  { min: 20, max: 20, result: "Monstruosidade amigável" },
];

/**
 * Quando e como os aliados surgem durante o contrato
 * Rolagem: 1d20
 */
export const ALLY_APPEARANCE_TIMING_TABLE: TableEntry<string>[] = [
  { min: 1, max: 2, result: "Correndo perigo" },
  { min: 3, max: 5, result: "De um jeito constrangedor" },
  { min: 6, max: 11, result: "De maneira comum e pacata" },
  { min: 12, max: 12, result: "Pedindo ajuda durante um descanso" },
  { min: 13, max: 14, result: "Ainda no assentamento" },
  { min: 15, max: 16, result: "Já estará lidando com a complicação" },
  { min: 17, max: 17, result: "1d4 dias após o começo do contrato" },
  { min: 18, max: 18, result: "2d4 dias após o começo do contrato" },
  { min: 19, max: 19, result: "Magicamente invocado" },
  { min: 20, max: 20, result: "Para salvar o dia" },
];

// ===== DETALHAMENTO DOS ALIADOS =====

/**
 * Artefatos que podem servir como aliados
 * Rolagem: 1d20
 */
export const ALLY_ARTIFACT_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Runa antiga" },
  { min: 2, max: 2, result: "Amuleto que ajuda a chegar ao objetivo" },
  { min: 3, max: 3, result: "Arma senciente" },
  { min: 4, max: 4, result: "Vestimenta/acessório vivo" },
  { min: 5, max: 5, result: "Totem de uma região próxima" },
  { min: 6, max: 6, result: "Livro com conhecimento necessário" },
  { min: 7, max: 7, result: "Criatura presa/transformada em objeto/animal" },
  { min: 8, max: 8, result: "Artefato perdido de uma divindade menor" },
  { min: 9, max: 9, result: "Item amaldiçoado" },
  { min: 10, max: 10, result: "Engenhoca voadora" },
  { min: 11, max: 11, result: "Cristal de comunicação" },
  { min: 12, max: 12, result: "Mapa mágico que se atualiza" },
  { min: 13, max: 13, result: "Chave universal" },
  { min: 14, max: 14, result: "Espelho de revelação" },
  { min: 15, max: 15, result: "Cajado de proteção" },
  { min: 16, max: 16, result: "Anel de tradução" },
  { min: 17, max: 17, result: "Corda infinita" },
  { min: 18, max: 18, result: "Poção renovável" },
  { min: 19, max: 19, result: "Bússola dimensional" },
  { min: 20, max: 20, result: "Role duas vezes e use ambos" },
];

/**
 * Criaturas poderosas que podem servir como aliados
 * Rolagem: 1d20
 */
export const ALLY_POWERFUL_CREATURE_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Elemental" },
  { min: 2, max: 2, result: "Mercenário veterano" },
  { min: 3, max: 3, result: "Humanoide buscando vingança" },
  { min: 4, max: 4, result: "Líder local" },
  { min: 5, max: 5, result: "Trabalhador braçal fora do comum" },
  { min: 6, max: 6, result: "Nobre longe de casa" },
  { min: 7, max: 7, result: "Herói renomado" },
  { min: 8, max: 8, result: "Criatura de outro plano" },
  { min: 9, max: 9, result: "Criminoso influente do submundo" },
  { min: 10, max: 10, result: "Avatar de uma divindade" },
  { min: 11, max: 11, result: "Dragão jovem bondoso" },
  { min: 12, max: 12, result: "Celestial menor" },
  { min: 13, max: 13, result: "Arquimago sábio" },
  { min: 14, max: 14, result: "Paladino errante" },
  { min: 15, max: 15, result: "Druida ancião" },
  { min: 16, max: 16, result: "Espírito guardião" },
  { min: 17, max: 17, result: "Gigante benevolente" },
  { min: 18, max: 18, result: "Fada poderosa" },
  { min: 19, max: 19, result: "Um avatar" },
  { min: 20, max: 20, result: "Role duas vezes e use ambos" },
];

/**
 * Aliados inesperados que podem aparecer
 * Rolagem: 1d20
 */
export const ALLY_UNEXPECTED_TABLE: TableEntry<string>[] = [
  { min: 1, max: 2, result: "Um antigo inimigo/rival" },
  { min: 3, max: 3, result: "Metamorfo" },
  { min: 4, max: 4, result: "Constructo" },
  { min: 5, max: 5, result: "Criatura do próximo encontro aleatório" },
  { min: 6, max: 6, result: "Inimigo desertor" },
  { min: 7, max: 7, result: "Objeto animado" },
  { min: 8, max: 10, result: "Velho conhecido de um dos jogadores" },
  { min: 11, max: 11, result: "Fã/interesse amoroso de um personagem" },
  { min: 12, max: 12, result: "Animal inteligente" },
  { min: 13, max: 13, result: "Informações de uma fonte inesperada" },
  { min: 14, max: 14, result: "Criança precoce" },
  { min: 15, max: 15, result: "Fantasma arrependido" },
  { min: 16, max: 16, result: "Rival reconciliado" },
  { min: 17, max: 17, result: "Ex-inimigo reabilitado" },
  { min: 18, max: 18, result: "Duplo bondoso" },
  { min: 19, max: 19, result: "Reflexo de espelho mágico" },
  { min: 20, max: 20, result: "Role duas vezes e use ambos" },
];

/**
 * Ajuda sobrenatural que pode aparecer
 * Rolagem: 1d20
 */
export const ALLY_SUPERNATURAL_HELP_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Deus maligno menor" },
  { min: 2, max: 2, result: "Espectro" },
  { min: 3, max: 3, result: "Infectados" },
  { min: 4, max: 5, result: "Sonhos/pesadelos/visões" },
  { min: 6, max: 6, result: "Portal mágico" },
  { min: 7, max: 7, result: "Elo mental" },
  { min: 8, max: 8, result: "Pseudo-dragão" },
  { min: 9, max: 9, result: "Forças divinas misteriosas" },
  { min: 10, max: 10, result: "Ressurgido vingativo" },
  { min: 11, max: 11, result: "Celestial" },
  { min: 12, max: 12, result: "Manifestação divina" },
  { min: 13, max: 13, result: "Oráculo místico" },
  { min: 14, max: 14, result: "Proteção ancestral" },
  { min: 15, max: 15, result: "Bênção inesperada" },
  { min: 16, max: 16, result: "Guardião planar" },
  { min: 17, max: 18, result: "Alma benevolente" },
  { min: 19, max: 19, result: "Fenômeno cósmico" },
  { min: 20, max: 20, result: "Role duas vezes e use ambos" },
];

/**
 * Civis ordinários que podem ajudar
 * Rolagem: 1d20
 */
export const ALLY_ORDINARY_CIVILIANS_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Taverneiro" },
  { min: 2, max: 2, result: "Grupo de nômades" },
  { min: 3, max: 3, result: "Mercador local" },
  { min: 4, max: 4, result: "Funcionário de estalagem" },
  { min: 5, max: 5, result: "Aventureiro aposentado" },
  { min: 6, max: 6, result: "Trabalhador braçal" },
  { min: 7, max: 7, result: "Plebeu" },
  { min: 8, max: 8, result: "Adepto acadêmico/religioso" },
  { min: 9, max: 9, result: "Especialista" },
  { min: 10, max: 10, result: "Artesão habilidoso" },
  { min: 11, max: 11, result: "Guarda local" },
  { min: 12, max: 12, result: "Camponês sábio" },
  { min: 13, max: 13, result: "Marinheiro experiente" },
  { min: 14, max: 14, result: "Curandeiro local" },
  { min: 15, max: 15, result: "Escriba letrado" },
  { min: 16, max: 16, result: "Cocheiro veterano" },
  { min: 17, max: 17, result: "Minerador conhecedor" },
  { min: 18, max: 18, result: "Pastor de animais" },
  { min: 19, max: 20, result: "Role duas vezes e use ambos" },
];

/**
 * Elementos da natureza que podem ajudar
 * Rolagem: 1d20
 */
export const ALLY_NATURE_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Matilha de lobos" },
  { min: 2, max: 2, result: "Águia/falcão" },
  { min: 3, max: 3, result: "Pequenos mamíferos" },
  { min: 4, max: 4, result: "Anomalia climática" },
  { min: 5, max: 5, result: "Ente ou árvore desperta" },
  { min: 6, max: 6, result: "Humanoides da floresta" },
  { min: 7, max: 7, result: "Fada" },
  { min: 8, max: 8, result: "Filhote de um monstro temido" },
  { min: 9, max: 9, result: "A própria flora local" },
  { min: 10, max: 10, result: "Besta grande ou atroz" },
  { min: 11, max: 11, result: "Espíritos da natureza" },
  { min: 12, max: 12, result: "Enxame protetor" },
  { min: 13, max: 13, result: "Corrente favorável" },
  { min: 14, max: 14, result: "Vento auxiliador" },
  { min: 15, max: 15, result: "Caminho natural revelado" },
  { min: 16, max: 16, result: "Fonte de água pura" },
  { min: 17, max: 17, result: "Abrigo natural" },
  { min: 18, max: 18, result: "Plantas medicinais" },
  { min: 19, max: 19, result: "Guia animal" },
  { min: 20, max: 20, result: "Role duas vezes e use ambos" },
];

/**
 * Organizações que podem servir como aliados
 * Rolagem: 1d20
 */
export const ALLY_ORGANIZATIONS_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Companhia de mercenários" },
  { min: 2, max: 2, result: "Ordem religiosa" },
  { min: 3, max: 3, result: "Comunidade local" },
  { min: 4, max: 4, result: "Líder de um pequeno clã" },
  { min: 5, max: 5, result: "Sindicato de comerciantes" },
  { min: 6, max: 6, result: "Facção criminosa" },
  { min: 7, max: 7, result: "Grupo circense" },
  { min: 8, max: 8, result: "Companhia militar" },
  { min: 9, max: 9, result: "Revolucionários/rebeldes" },
  { min: 10, max: 10, result: "Espiões infiltrados" },
  { min: 11, max: 11, result: "Guilda de artesãos" },
  { min: 12, max: 12, result: "Conselho de anciãos" },
  { min: 13, max: 13, result: "Irmandade de magos" },
  { min: 14, max: 14, result: "Colégio de bardos" },
  { min: 15, max: 15, result: "Ordem de cavaleiros" },
  { min: 16, max: 16, result: "Círculo de druidas" },
  { min: 17, max: 17, result: "Casa nobre aliada" },
  { min: 18, max: 18, result: "Sociedade de estudiosos" },
  { min: 19, max: 19, result: "Rede de informantes" },
  { min: 20, max: 20, result: "Role duas vezes e use ambos" },
];

/**
 * Refúgios que podem ser encontrados
 * Rolagem: 1d20
 */
export const ALLY_REFUGE_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Fortaleza abandonada" },
  { min: 2, max: 2, result: "Torre de arcanista vazia" },
  { min: 3, max: 3, result: "Pequena construção com recursos" },
  { min: 4, max: 4, result: "Esconderijo/sala secreta" },
  { min: 5, max: 5, result: "Santuário de um deus bondoso" },
  { min: 6, max: 6, result: "Calabouço esquecido" },
  { min: 7, max: 7, result: "Clareira magicamente segura" },
  { min: 8, max: 8, result: "Fonte de cura" },
  { min: 9, max: 9, result: "Caverna/gruta segura" },
  { min: 10, max: 10, result: "Máquina de guerra inativa" },
  { min: 11, max: 11, result: "Templo abandonado" },
  { min: 12, max: 12, result: "Biblioteca protegida" },
  { min: 13, max: 13, result: "Portal de escape" },
  { min: 14, max: 14, result: "Abrigo dimensional" },
  { min: 15, max: 15, result: "Base subterrânea" },
  { min: 16, max: 16, result: "Navio encalhado" },
  { min: 17, max: 17, result: "Observatório antigo" },
  { min: 18, max: 18, result: "Jardim encantado" },
  { min: 19, max: 19, result: "Fortaleza flutuante" },
  { min: 20, max: 20, result: "Role duas vezes e use ambos" },
];

/**
 * Aventureiros que podem ajudar
 * Rolagem: 1d20
 */
export const ALLY_ADVENTURERS_TABLE: TableEntry<string>[] = [
  { min: 1, max: 3, result: "Bárbaro espirituoso" },
  { min: 4, max: 4, result: "Arcanista erudito" },
  { min: 5, max: 7, result: "Guerreiro destemido" },
  { min: 8, max: 8, result: "Druida errante" },
  { min: 9, max: 9, result: "Clérigo fiel" },
  { min: 10, max: 11, result: "Paladino honrado" },
  { min: 12, max: 14, result: "Ladino sagaz" },
  { min: 15, max: 17, result: "Sentinela talentoso" },
  { min: 18, max: 18, result: "Monge disciplinado" },
  { min: 19, max: 20, result: "Bardo carismático" },
];

/**
 * Nível do aventureiro aliado
 * Rolagem: 1d20
 */
export const ALLY_ADVENTURER_LEVEL_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "NA 0" },
  { min: 2, max: 2, result: "NA 1" },
  { min: 3, max: 3, result: "NA 2" },
  { min: 4, max: 4, result: "NA 3" },
  { min: 5, max: 5, result: "NA 4" },
  { min: 6, max: 6, result: "NA 5" },
  { min: 7, max: 7, result: "NA 6" },
  { min: 8, max: 8, result: "NA 7" },
  { min: 9, max: 9, result: "NA 8" },
  { min: 10, max: 10, result: "NA 9" },
  { min: 11, max: 11, result: "NA 10" },
  { min: 12, max: 12, result: "NA 11" },
  { min: 13, max: 13, result: "NA 12" },
  { min: 14, max: 14, result: "NA 13" },
  { min: 15, max: 15, result: "NA 14" },
  { min: 16, max: 16, result: "NA 15" },
  { min: 17, max: 17, result: "NA 20" },
  { min: 18, max: 18, result: "NA 25" },
  { min: 19, max: 19, result: "NA 30" },
  { min: 20, max: 20, result: "Role duas vezes e use ambos" },
];

/**
 * Monstruosidades amigáveis que podem ajudar
 * Rolagem: 1d20
 */
export const ALLY_FRIENDLY_MONSTROSITY_TABLE: TableEntry<string>[] = [
  { min: 1, max: 3, result: "Goblin" },
  { min: 4, max: 5, result: "Morto-vivo" },
  { min: 6, max: 6, result: "Kobold" },
  { min: 7, max: 10, result: "Hobgoblin" },
  { min: 11, max: 13, result: "Orc" },
  { min: 14, max: 14, result: "Gigante da colina" },
  { min: 15, max: 15, result: "Troll" },
  { min: 16, max: 19, result: "Animalesco" },
  { min: 20, max: 20, result: "Dragão" },
];

/**
 * Características da monstruosidade amigável
 * Rolagem: 1d20
 */
export const ALLY_MONSTROSITY_CHARACTERISTICS_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Que acredita ser de outra raça" },
  { min: 2, max: 2, result: "Erudito" },
  { min: 3, max: 3, result: "Fisicamente avantajado" },
  { min: 4, max: 4, result: "Sedutor" },
  { min: 5, max: 5, result: "Extremamente honrado" },
  { min: 6, max: 6, result: "Heroico" },
  { min: 7, max: 7, result: "Inocente e fofo" },
  { min: 8, max: 8, result: "Covarde" },
  { min: 9, max: 9, result: "Triste e desmotivado" },
  { min: 10, max: 10, result: "Amado pelos habitantes" },
  { min: 11, max: 11, result: "Artista habilidoso" },
  { min: 12, max: 12, result: "Comerciante astuto" },
  { min: 13, max: 13, result: "Guerreiro nobre" },
  { min: 14, max: 14, result: "Protetor zeloso" },
  { min: 15, max: 15, result: "Sábio conselheiro" },
  { min: 16, max: 16, result: "Explorador curioso" },
  { min: 17, max: 17, result: "Diplomata hábil" },
  { min: 18, max: 18, result: "Inventor criativo" },
  { min: 19, max: 20, result: "Role duas vezes e use ambos" },
];

// ===== TABELAS DE RECOMPENSAS =====

/**
 * Chance de recompensas adicionais além da recompensa básica
 * Rolagem: 1d20
 */
export const REWARD_CHANCE_TABLE: TableEntry<boolean>[] = [
  { min: 1, max: 13, result: false },
  { min: 14, max: 20, result: true },
];

/**
 * Tipos de recompensas adicionais que podem aparecer
 * Rolagem: 1d20
 */
export const REWARD_TYPES_TABLE: TableEntry<string>[] = [
  { min: 1, max: 2, result: "Riquezas" },
  { min: 3, max: 4, result: "Artefatos mágicos" },
  { min: 5, max: 5, result: "Poder" },
  { min: 6, max: 6, result: "Conhecimento" },
  { min: 7, max: 8, result: "Influência e renome" },
  { min: 9, max: 9, result: "Glória" },
  { min: 10, max: 13, result: "Moral" },
  { min: 14, max: 17, result: "Pagamento diferenciado" },
  { min: 18, max: 18, result: "Recompensa bizarra" },
  { min: 19, max: 20, result: "Aparências enganam" },
];

// ===== DETALHAMENTO DAS RECOMPENSAS =====

/**
 * Riquezas que podem ser oferecidas como recompensa adicional
 * Rolagem: 1d20
 */
export const REWARD_RICHES_TABLE: TableEntry<string>[] = [
  { min: 1, max: 2, result: "Uma grande soma de ouro e prata" },
  { min: 3, max: 3, result: "Obra de arte/gema perdida" },
  { min: 4, max: 4, result: "Partes do lucro de um estabelecimento" },
  { min: 5, max: 5, result: "Escritura de um estabelecimento/construção" },
  { min: 6, max: 6, result: "Prole de criatura rara" },
  { min: 7, max: 8, result: "Item mágico" },
  { min: 9, max: 9, result: "Terras/fazendas" },
  { min: 10, max: 10, result: "Itens mundanos de alto valor e raridade" },
  { min: 11, max: 11, result: "Montaria/meio de transporte" },
  { min: 12, max: 12, result: "Engenhoca" },
  { min: 13, max: 14, result: "Pedras preciosas" },
  { min: 15, max: 15, result: "Coleção de antiguidades" },
  { min: 16, max: 16, result: "Participação em navio mercante" },
  { min: 17, max: 17, result: "Arsenal de armas finas" },
  { min: 18, max: 18, result: "Tesouro pirata enterrado" },
  { min: 19, max: 19, result: "Herança nobre" },
  { min: 20, max: 20, result: "Role duas vezes e use ambos" },
];

/**
 * Artefatos mágicos que podem ser dados como recompensa
 * Rolagem: 1d20
 */
export const REWARD_MAGICAL_ARTIFACTS_TABLE: TableEntry<string>[] = [
  { min: 1, max: 2, result: "Arma mágica" },
  { min: 3, max: 3, result: "Pergaminho poderoso" },
  { min: 4, max: 4, result: "Grimório" },
  { min: 5, max: 6, result: "Itens maravilhosos" },
  { min: 7, max: 7, result: "Proteção mágica" },
  { min: 8, max: 8, result: "Varinha" },
  { min: 9, max: 9, result: "Cajado" },
  { min: 10, max: 11, result: "Anel mágico" },
  { min: 12, max: 12, result: "Bastão/cetro" },
  { min: 13, max: 14, result: "Item amaldiçoado" },
  { min: 15, max: 15, result: "Orbe de poder" },
  { min: 16, max: 16, result: "Amuleto raro" },
  { min: 17, max: 17, result: "Manto encantado" },
  { min: 18, max: 18, result: "Botas mágicas" },
  { min: 19, max: 19, result: "Elmo encantado" },
  { min: 20, max: 20, result: "Role duas vezes e use ambos" },
];

/**
 * Poder que pode ser concedido como recompensa
 * Rolagem: 1d20
 */
export const REWARD_POWER_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Comando sobre um grupo" },
  { min: 2, max: 3, result: "Favor de alguém importante" },
  { min: 4, max: 4, result: "Contrato de casamento com figura poderosa" },
  { min: 5, max: 5, result: "Lugar de destaque em uma organização poderosa" },
  { min: 6, max: 6, result: "Contatos da classe alta local" },
  { min: 7, max: 7, result: "Cargo importante no governo local" },
  { min: 8, max: 8, result: "Permissão para explorar local restrito" },
  { min: 9, max: 9, result: "Pacto com entidade" },
  { min: 10, max: 10, result: "Vista grossa de autoridades da lei" },
  { min: 11, max: 11, result: "Bênção divina" },
  { min: 12, max: 12, result: "Autoridade sobre território" },
  { min: 13, max: 13, result: "Direito de coletar impostos" },
  { min: 14, max: 14, result: "Comando de forças militares" },
  { min: 15, max: 15, result: "Assento em um conselho" },
  { min: 16, max: 16, result: "Direito de julgar crimes" },
  { min: 17, max: 17, result: "Acesso a arquivos secretos" },
  { min: 18, max: 18, result: "Proteção real garantida" },
  { min: 19, max: 19, result: "Imunidade diplomática" },
  { min: 20, max: 20, result: "Role duas vezes e use ambos" },
];

/**
 * Conhecimento que pode ser compartilhado como recompensa
 * Rolagem: 1d20
 */
export const REWARD_KNOWLEDGE_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Verdades sobre uma lenda" },
  { min: 2, max: 2, result: "Paradeiro de um tesouro esquecido" },
  { min: 3, max: 3, result: "Verdade sobre seu passado" },
  { min: 4, max: 4, result: "Fórmula de item mágico" },
  { min: 5, max: 5, result: "Acesso a biblioteca arcana renomada" },
  { min: 6, max: 6, result: "Descoberta de tecnologia ancestral" },
  { min: 7, max: 7, result: "Fofocas/segredos da nobreza" },
  { min: 8, max: 8, result: "Corrupção descoberta" },
  { min: 9, max: 9, result: "Fraqueza de um inimigo" },
  { min: 10, max: 10, result: "Magia poderosa" },
  { min: 11, max: 11, result: "Localização de portal dimensional" },
  { min: 12, max: 12, result: "Identidade de espião infiltrado" },
  { min: 13, max: 13, result: "História perdida de civilização" },
  { min: 14, max: 14, result: "Códigos de comunicação secreta" },
  { min: 15, max: 15, result: "Profecias não reveladas" },
  { min: 16, max: 16, result: "Mapas de rotas comerciais" },
  { min: 17, max: 18, result: "Segredo do governo local" },
  { min: 19, max: 19, result: "Nome verdadeiro de demônio" },
  { min: 20, max: 20, result: "Role duas vezes e use ambos" },
];

/**
 * Influência e renome que podem ser ganhos
 * Rolagem: 1d20
 */
export const REWARD_INFLUENCE_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Sobre uma casa nobre" },
  { min: 2, max: 2, result: "Com a Guilda" },
  { min: 3, max: 3, result: "Com uma facção criminosa/submundo" },
  { min: 4, max: 4, result: "Com uma sociedade secreta" },
  { min: 5, max: 5, result: "Ordem religiosa" },
  { min: 6, max: 6, result: "Seguidores" },
  { min: 7, max: 7, result: "Mercadores e comerciantes" },
  { min: 8, max: 8, result: "Tratado de aliança" },
  { min: 9, max: 9, result: "Organização/clã medíocre" },
  { min: 10, max: 10, result: "População local" },
  { min: 11, max: 11, result: "Entre aventureiros famosos" },
  { min: 12, max: 12, result: "Com líderes militares" },
  { min: 13, max: 13, result: "Entre estudiosos" },
  { min: 14, max: 14, result: "Com artesãos mestres" },
  { min: 15, max: 15, result: "Entre navegadores" },
  { min: 16, max: 16, result: "Com diplomatas" },
  { min: 17, max: 17, result: "Entre bardos e artistas" },
  { min: 18, max: 18, result: "Com exploradores" },
  { min: 19, max: 19, result: "Entre curandeiros" },
  { min: 20, max: 20, result: "Role duas vezes e use ambos" },
];

/**
 * Glória que pode ser conquistada
 * Rolagem: 1d20
 */
export const REWARD_GLORY_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Feriado em sua homenagem" },
  { min: 2, max: 2, result: "Título de nobreza" },
  { min: 3, max: 3, result: "Estátua no centro do assentamento" },
  { min: 4, max: 4, result: "Conto sobre sua história" },
  { min: 5, max: 5, result: "Fama entre ladrões" },
  { min: 6, max: 6, result: "Magia/item com seu nome" },
  { min: 7, max: 8, result: "Herói local" },
  { min: 9, max: 9, result: "Local relevante com seu nome" },
  { min: 10, max: 10, result: "Festa/banquete em sua homenagem" },
  { min: 11, max: 11, result: "Canção épica composta" },
  { min: 12, max: 12, result: "Medalha de honra" },
  { min: 13, max: 13, result: "Brasão familiar concedido" },
  { min: 14, max: 14, result: "Arena nomeada em sua honra" },
  { min: 15, max: 15, result: "Lenda contada por gerações" },
  { min: 16, max: 16, result: "Ordem militar fundada" },
  { min: 17, max: 17, result: "Templo dedicado aos seus feitos" },
  { min: 18, max: 18, result: "Livro de história escrito" },
  { min: 19, max: 19, result: "Universidade nomeada" },
  { min: 20, max: 20, result: "Role duas vezes e use ambos" },
];

/**
 * Recompensas morais/satisfação pessoal
 * Rolagem: 1d20
 */
export const REWARD_MORAL_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Plebeus desafortunados salvos" },
  { min: 2, max: 2, result: "Prole nomeada em sua homenagem" },
  { min: 3, max: 3, result: "Trazer paz a um assentamento" },
  { min: 4, max: 4, result: "Felicidade genuína do contratante" },
  { min: 5, max: 5, result: "Liberdade" },
  { min: 6, max: 6, result: "Perdão por crimes/dívidas" },
  { min: 7, max: 7, result: "Crianças desejam ser como você quando crescer" },
  { min: 8, max: 8, result: "Economia local alavancada" },
  { min: 9, max: 9, result: "Crescimento turístico" },
  { min: 10, max: 10, result: "Aumento da defesa do assentamento" },
  { min: 11, max: 11, result: "Família reunificada" },
  { min: 12, max: 12, result: "Comunidade favorecida" },
  { min: 13, max: 13, result: "Órfãos adotados" },
  { min: 14, max: 14, result: "Injustiça corrigida" },
  { min: 15, max: 15, result: "Tradição restaurada" },
  { min: 16, max: 16, result: "Esperança renovada" },
  { min: 17, max: 17, result: "Reconciliação entre inimigos" },
  { min: 18, max: 20, result: "Role duas vezes e use ambos" },
];

/**
 * Pagamento diferenciado (sem recompensa extra, apenas forma diferente)
 * Rolagem: 1d20
 */
export const REWARD_ALTERNATIVE_PAYMENT_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Trigo" },
  { min: 2, max: 2, result: "Vacas/bois" },
  { min: 3, max: 3, result: "Especiarias (Canela, pimenta, sal)" },
  { min: 4, max: 4, result: "Galinhas ou porcos" },
  { min: 5, max: 5, result: "Obras de arte/joias" },
  { min: 6, max: 6, result: "Hospedagem e suprimentos" },
  { min: 7, max: 7, result: "Tecidos e tapeçaria" },
  { min: 8, max: 8, result: "O bem mais valioso do contratante" },
  { min: 9, max: 9, result: "Ferro ou cobre" },
  { min: 10, max: 10, result: "Terras" },
  { min: 11, max: 11, result: "Serviços especializados" },
  { min: 12, max: 12, result: "Cartas de crédito" },
  { min: 13, max: 13, result: "Equipamentos raros" },
  { min: 14, max: 14, result: "Livros e manuscritos" },
  { min: 15, max: 15, result: "Instrumentos musicais" },
  { min: 16, max: 16, result: "Vinhos e licores" },
  { min: 17, max: 17, result: "Madeira nobre" },
  { min: 18, max: 18, result: "Pedras de construção" },
  { min: 19, max: 19, result: "Favores futuros" },
  { min: 20, max: 20, result: "Role duas vezes e use ambos" },
];

/**
 * Recompensas bizarras e incomuns
 * Rolagem: 1d20
 */
export const REWARD_BIZARRE_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Uma besta te vê como igual" },
  { min: 2, max: 2, result: "Tribo permite que faça o ritual de iniciação" },
  { min: 3, max: 3, result: "Uma noite de prazer" },
  { min: 4, max: 4, result: "Convite para uma irmandade/seita" },
  { min: 5, max: 5, result: "Moedas são cunhadas com seu rosto" },
  { min: 6, max: 6, result: "Começam a vender bugigangas com tema do herói" },
  { min: 7, max: 7, result: "Uma criatura quer ser sua aprendiz" },
  { min: 8, max: 8, result: "O contratante se apaixona por você" },
  { min: 9, max: 9, result: "A melhor comida do assentamento tem seu nome" },
  { min: 10, max: 10, result: "Uma carta de coleção rara" },
  { min: 11, max: 11, result: "Animal falante como companheiro" },
  { min: 12, max: 12, result: "Sonhos proféticos regulares" },
  { min: 13, max: 13, result: "Habilidade de falar com plantas" },
  { min: 14, max: 14, result: "Imunidade a uma doença específica" },
  { min: 15, max: 15, result: "Capacidade de encontrar água" },
  { min: 16, max: 16, result: "Sorte incomum com jogos" },
  { min: 17, max: 17, result: "Animais selvagens te respeitam" },
  { min: 18, max: 18, result: "Capacidade de sentir mentiras" },
  { min: 19, max: 19, result: "Clima favorável onde você vai" },
  { min: 20, max: 20, result: "Role duas vezes e use ambos" },
];

/**
 * Aparências enganam - recompensas que se revelam problemáticas
 * Rolagem: 1d20
 */
export const REWARD_DECEPTIVE_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Mapa para um tesouro amaldiçoado" },
  { min: 2, max: 2, result: "Gemas e objetos de arte falsificados" },
  { min: 3, max: 3, result: "Item mágico falso" },
  { min: 4, max: 4, result: "Objeto valioso roubado" },
  { min: 5, max: 5, result: "Falsos rumores" },
  { min: 6, max: 6, result: "Item mágico amaldiçoado" },
  { min: 7, max: 7, result: "O contratante não paga/foge" },
  { min: 8, max: 8, result: "Caçado por caçadores de recompensa" },
  { min: 9, max: 9, result: "O contratante morre ou forja sua morte" },
  { min: 10, max: 10, result: "O contratante te leva para uma armadilha" },
  { min: 11, max: 11, result: "Recompensa é propriedade de outro" },
  { min: 12, max: 12, result: "Dívida transferida para você" },
  { min: 13, max: 13, result: "Recompensa é evidência de crime" },
  { min: 14, max: 14, result: "Item possui rastreamento mágico" },
  { min: 15, max: 15, result: "Recompensa expira rapidamente" },
  { min: 16, max: 16, result: "Outros reclamam direito sobre ela" },
  { min: 17, max: 17, result: "Recompensa vem com obrigações" },
  { min: 18, max: 18, result: "Pagamento em moeda desvalorizada" },
  { min: 19, max: 19, result: "Contrato tinha cláusulas ocultas" },
  { min: 20, max: 20, result: "Role duas vezes e use ambos" },
];

// ===== FUNÇÕES UTILITÁRIAS =====

/**
 * Verifica se aliados aparecerão no contrato
 */
export function rollForAllyAppearance(): boolean {
  // Implementação será feita nos geradores
  return false;
}

/**
 * Verifica se recompensas adicionais aparecerão no contrato
 */
export function rollForAdditionalRewards(): boolean {
  // Implementação será feita nos geradores
  return false;
}

// ===== FUNÇÕES DE ACESSO ÀS TABELAS =====

/**
 * Retorna todas as entradas da tabela de aliados
 */
export function getAlliesTable() {
  return ALLY_TYPES_TABLE;
}

/**
 * Retorna todas as entradas da tabela de recompensas adicionais
 */
export function getAdditionalRewardsTable() {
  return REWARD_TYPES_TABLE;
}

/**
 * Nota: Tabela "Pagamento diferenciado" não oferece recompensa extra.
 * Apenas o valor básico do contrato, porém pago de forma diferente.
 */
export const PAYMENT_DIFERENTIATED_NOTE =
  "Em 'pagamento diferenciado' não há recompensa extra. Apenas a recompensa pelo próprio contrato, porém o contratante não pagará com ouro, e sim com alguma coisa que tenha o mesmo valor ou o mais próximo disso.";
