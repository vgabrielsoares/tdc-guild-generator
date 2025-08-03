/**
 * Tabelas de Palavras-chave Temáticas e Contratantes Inusitados
 * 
 * Este arquivo implementa as tabelas para:
 * - Palavras-chave temáticas para criatividade nos contratos
 * - Teste de excentricidade para contratantes
 * - Tabela de contratantes inusitados (d100)
 * - Conjuntos de palavras-chave para criatividade
 */

import type { TableEntry } from "@/types/tables";
import { ThemeKeywordSet } from "@/types/contract";

// ===== PALAVRAS-CHAVE TEMÁTICAS =====

/**
 * Primeira Tabela Temática - Tema Macabro (1d20)
 */
export const THEME_MACABRE_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Macabro" },
  { min: 2, max: 2, result: "Abóbora" },
  { min: 3, max: 3, result: "Corvo" },
  { min: 4, max: 4, result: "Corte" },
  { min: 5, max: 5, result: "Cabeça" },
  { min: 6, max: 6, result: "Esqueleto" },
  { min: 7, max: 7, result: "Demônio" },
  { min: 8, max: 8, result: "Diabo" },
  { min: 9, max: 9, result: "Lua cheia" },
  { min: 10, max: 10, result: "Morcego" },
  { min: 11, max: 11, result: "Pacto" },
  { min: 12, max: 12, result: "Flagelo" },
  { min: 13, max: 13, result: "Invocação" },
  { min: 14, max: 14, result: "Fantasma" },
  { min: 15, max: 15, result: "Estátua" },
  { min: 16, max: 16, result: "Fantoche" },
  { min: 17, max: 17, result: "Profundeza" },
  { min: 18, max: 18, result: "Alma" },
  { min: 19, max: 19, result: "Cemitério" },
  { min: 20, max: 20, result: "Trevas" },
];

/**
 * Segunda Tabela Temática - Tema Guerra (1d20)
 */
export const THEME_WAR_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Morte" },
  { min: 2, max: 2, result: "General" },
  { min: 3, max: 3, result: "Tristeza" },
  { min: 4, max: 4, result: "Agonia" },
  { min: 5, max: 5, result: "Gritos" },
  { min: 6, max: 6, result: "Bandeira" },
  { min: 7, max: 7, result: "Castelo" },
  { min: 8, max: 8, result: "Fome" },
  { min: 9, max: 9, result: "Tortura" },
  { min: 10, max: 10, result: "Motivo" },
  { min: 11, max: 11, result: "Guerreiro" },
  { min: 12, max: 12, result: "Desonra" },
  { min: 13, max: 13, result: "Glória" },
  { min: 14, max: 14, result: "Nação" },
  { min: 15, max: 15, result: "Traição" },
  { min: 16, max: 16, result: "Sangue" },
  { min: 17, max: 17, result: "Assassinato" },
  { min: 18, max: 18, result: "Luto" },
  { min: 19, max: 19, result: "Conquista" },
  { min: 20, max: 20, result: "Espólios" },
];

/**
 * Terceira Tabela Temática - Tema Fantasia (1d20)
 */
export const THEME_FANTASY_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Dragão" },
  { min: 2, max: 2, result: "Velho" },
  { min: 3, max: 3, result: "Ritual" },
  { min: 4, max: 4, result: "Feitiço" },
  { min: 5, max: 5, result: "Bruxa" },
  { min: 6, max: 6, result: "Armadura" },
  { min: 7, max: 7, result: "Língua" },
  { min: 8, max: 8, result: "Divindade" },
  { min: 9, max: 9, result: "Imortal" },
  { min: 10, max: 10, result: "Lago" },
  { min: 11, max: 11, result: "Morto-vivo" },
  { min: 12, max: 12, result: "Grilhões" },
  { min: 13, max: 13, result: "Miserável" },
  { min: 14, max: 14, result: "Espelho" },
  { min: 15, max: 15, result: "Licantropo" },
  { min: 16, max: 16, result: "Sofrimento" },
  { min: 17, max: 17, result: "Engenhoca" },
  { min: 18, max: 18, result: "Amuleto" },
  { min: 19, max: 19, result: "Fazendeiro" },
  { min: 20, max: 20, result: "Brasão" },
];

/**
 * Quarta Tabela Temática - Tema Steampunk (1d20)
 */
export const THEME_STEAMPUNK_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Martelo" },
  { min: 2, max: 2, result: "Prato" },
  { min: 3, max: 3, result: "Energia" },
  { min: 4, max: 4, result: "Gancho" },
  { min: 5, max: 5, result: "Berinjela" },
  { min: 6, max: 6, result: "Ferrugem" },
  { min: 7, max: 7, result: "Relógio de bolso" },
  { min: 8, max: 8, result: "Chifre" },
  { min: 9, max: 9, result: "Explosão" },
  { min: 10, max: 10, result: "Cobre" },
  { min: 11, max: 11, result: "Manopla" },
  { min: 12, max: 12, result: "Chamas" },
  { min: 13, max: 13, result: "Engrenagem" },
  { min: 14, max: 14, result: "Mola" },
  { min: 15, max: 15, result: "Garfo" },
  { min: 16, max: 16, result: "Binóculo/luneta" },
  { min: 17, max: 17, result: "Ajuste" },
  { min: 18, max: 18, result: "Vento" },
  { min: 19, max: 19, result: "Fumaça" },
  { min: 20, max: 20, result: "Óleo" },
];

/**
 * Quinta Tabela Temática - Tema Masmorras (1d20)
 */
export const THEME_DUNGEONS_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Corrupção" },
  { min: 2, max: 2, result: "Tocha" },
  { min: 3, max: 3, result: "Goblin" },
  { min: 4, max: 4, result: "Orc" },
  { min: 5, max: 5, result: "Elemental" },
  { min: 6, max: 6, result: "Mímico" },
  { min: 7, max: 7, result: "Tesouro" },
  { min: 8, max: 8, result: "Escuridão" },
  { min: 9, max: 9, result: "Musgo" },
  { min: 10, max: 10, result: "Frio" },
  { min: 11, max: 11, result: "Armadilha" },
  { min: 12, max: 12, result: "Mofo" },
  { min: 13, max: 13, result: "Buraco" },
  { min: 14, max: 14, result: "Pavor" },
  { min: 15, max: 15, result: "Correntes" },
  { min: 16, max: 16, result: "Prisão" },
  { min: 17, max: 17, result: "Perigo" },
  { min: 18, max: 18, result: "Segredo" },
  { min: 19, max: 19, result: "Covil" },
  { min: 20, max: 20, result: "Cadáveres" },
];

/**
 * Sexta Tabela Temática - Tema Política (1d20)
 */
export const THEME_POLITICS_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Governo" },
  { min: 2, max: 2, result: "Rei" },
  { min: 3, max: 3, result: "Crise" },
  { min: 4, max: 4, result: "Música" },
  { min: 5, max: 5, result: "Religião" },
  { min: 6, max: 6, result: "Impostos" },
  { min: 7, max: 7, result: "Nobreza" },
  { min: 8, max: 8, result: "Filosofia" },
  { min: 9, max: 9, result: "Maus tratos" },
  { min: 10, max: 10, result: "Pobreza" },
  { min: 11, max: 11, result: "Preconceito" },
  { min: 12, max: 12, result: "Insatisfação" },
  { min: 13, max: 13, result: "Protesto" },
  { min: 14, max: 14, result: "Violência" },
  { min: 15, max: 15, result: "Injustiça" },
  { min: 16, max: 16, result: "Privilegiado" },
  { min: 17, max: 17, result: "Doutrina" },
  { min: 18, max: 18, result: "União" },
  { min: 19, max: 19, result: "Repressão" },
  { min: 20, max: 20, result: "Alienação" },
];

// ===== CONTRATANTES INUSITADOS =====

/**
 * Teste de excentricidade - verifica se o contratante será inusitado
 * Rolagem: 1d20
 */
export const UNUSUAL_CONTRACTOR_CHANCE_TABLE: TableEntry<boolean>[] = [
  { min: 1, max: 1, result: true },
  { min: 2, max: 20, result: false },
];

/**
 * Tabela de contratantes inusitados (d100)
 */
export const UNUSUAL_CONTRACTORS_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Família nobre em desgraça por conta de conspiração política" },
  { min: 2, max: 2, result: "Humanoide com uma doença contagiosa e debilitante" },
  { min: 3, max: 3, result: "Lacaio de um lich em busca de mais poder" },
  { min: 4, max: 4, result: "Sacerdote de uma religião que ainda não possui santuário no local" },
  { min: 5, max: 5, result: "Cultistas canibais que fazem rituais com crianças" },
  { min: 6, max: 6, result: "Feiticeiro em busca de algo que restaure seus poderes mágicos selados" },
  { min: 7, max: 7, result: "Filho do líder local mas ele foi morto em combate numa emboscada" },
  { min: 8, max: 8, result: "Comandante de tropas conquistadoras de outro reino" },
  { min: 9, max: 9, result: "Trupe de músicos fugindo de alguma coisa" },
  { min: 10, max: 10, result: "Um deus tentando compreender os mortais" },
  { min: 11, max: 11, result: "Humanoide dado como morto anos atrás" },
  { min: 12, max: 12, result: "Succubus/incubus apaixonado por um mortal procurando o seu amor" },
  { min: 13, max: 13, result: "Vampiro vegetariano" },
  { min: 14, max: 14, result: "Bruxo que busca vingança contra inquisidores que queimaram sua família" },
  { min: 15, max: 15, result: "Dragão metamorfoseado em ser humano" },
  { min: 16, max: 16, result: "Trupe circense que faz espetáculos hipnóticos" },
  { min: 17, max: 17, result: "Criatura exótica capturada em terras distantes" },
  { min: 18, max: 18, result: "Veterano de guerra mutilado, inválido ou aposentado" },
  { min: 19, max: 19, result: "Agente da lei atrás de um criminoso procurado" },
  { min: 20, max: 20, result: "Uma antiga paixão do contratado tentando se re-aproximar" },
  { min: 21, max: 21, result: "Seguidores de um antigo mal atrás de um artefato lendário capaz de libertá-lo" },
  { min: 22, max: 22, result: "Sequestradores" },
  { min: 23, max: 23, result: "Pai/mãe tentando se aproximar do filho" },
  { min: 24, max: 24, result: "Membros de uma sociedade secreta contra o governo" },
  { min: 25, max: 25, result: "Um jovem humano que deseja capturar todos os monstros" },
  { min: 26, max: 26, result: "Sobreviventes de um ataque do Tarrasque" },
  { min: 27, max: 27, result: "Águia gigante" },
  { min: 28, max: 28, result: "Um arquiteto inovador" },
  { min: 29, max: 29, result: "Selvagens saqueadores" },
  { min: 30, max: 30, result: "O líder local disfarçado" },
  { min: 31, max: 31, result: "Nômades misteriosos" },
  { min: 32, max: 32, result: "Bugbear pescador" },
  { min: 33, max: 33, result: "Bando de homens ratos" },
  { min: 34, max: 34, result: "Mestre insano em busca de seu discípulo que fugiu com o seu amor" },
  { min: 35, max: 35, result: "O último membro de um antigo e poderoso clã" },
  { min: 36, max: 36, result: "Humanoide amaldiçoado, que se transforma em Falcão durante o dia" },
  { min: 37, max: 37, result: "Monge com costumes diferentes" },
  { min: 38, max: 38, result: "Coletores de impostos a mando do governo" },
  { min: 39, max: 39, result: "O contratante acredita ser o último de sua espécie" },
  { min: 40, max: 40, result: "Humanoide que deve muito dinheiro para criaturas poderosas" },
  { min: 41, max: 41, result: "Imigrantes refugiados" },
  { min: 42, max: 42, result: "Orc fugindo de um mal maior que oprime suas terras" },
  { min: 43, max: 43, result: "Um centauro exótico, civilizado e liderando cavaleiros" },
  { min: 44, max: 44, result: "Humanoide amaldiçoado, que se transforma em lobo durante a noite" },
  { min: 45, max: 45, result: "Licantropo vegano e altruísta" },
  { min: 46, max: 46, result: "Humanoide de aparência frágil, que diz ter vindo de uma época futura" },
  { min: 47, max: 47, result: "Humanoide que recebeu a imortalidade dos deuses há 5 mil anos e que busca uma forma de morrer" },
  { min: 48, max: 48, result: "Mago que se diz filho da própria morte e ameaça desintegrar pessoas quando se descontrola" },
  { min: 49, max: 49, result: "Ancião (muito velho) bárbaro em busca de uma última aventura antes de se aposentar" },
  { min: 50, max: 50, result: "Vampiro viajando pelo mundo buscando compreender sua própria existência" },
  { min: 51, max: 51, result: "Humanoide de uma terra distante que não fala o idioma local" },
  { min: 52, max: 52, result: "Grupo de botânicos" },
  { min: 53, max: 53, result: "Grupo de aventureiros quase idêntico ao dos jogadores mas com nomes e alinhamentos trocados" },
  { min: 54, max: 54, result: "Mago buscando imortalidade" },
  { min: 55, max: 55, result: "Nobres de um reino aliado ou em processo de aliança" },
  { min: 56, max: 56, result: "Grupo de aventureiros esquisito e chamativo" },
  { min: 57, max: 57, result: "Mago de coração gentil que busca novos alunos para ensinar magia" },
  { min: 58, max: 58, result: "Dragão majestoso e bondoso, cheio de conselhos e sabedoria" },
  { min: 59, max: 59, result: "Nobre paranoico preparado para tudo" },
  { min: 60, max: 60, result: "Ente" },
  { min: 61, max: 61, result: "Investigador oficial do governo e seu assistente" },
  { min: 62, max: 62, result: "Um escritor despreparado que quer ver tudo de perto" },
  { min: 63, max: 63, result: "Um nobre poderoso, que de noite se disfarça para combater o crime" },
  { min: 64, max: 64, result: "Humanoide que diz ser filho de um deus que busca matá-lo" },
  { min: 65, max: 65, result: "Excêntrico alquimista e seu minizoológico" },
  { min: 66, max: 66, result: "Filósofos tentando levar iluminação ao mundo" },
  { min: 67, max: 67, result: "Mineradores atrás de boatos" },
  { min: 68, max: 68, result: "Orc erudito" },
  { min: 69, max: 69, result: "Casal de nobres condenado à morte" },
  { min: 70, max: 70, result: "Grupo de aventureiros famoso" },
  { min: 71, max: 71, result: "Grupo de fugitivos políticos que participaram de uma intriga para matar o líder local" },
  { min: 72, max: 72, result: "Xamã em busca de reclamar uma região que faz parte das lendas de sua tribo" },
  { min: 73, max: 73, result: "Um kenku" },
  { min: 74, max: 74, result: "Item mágico falante senciente" },
  { min: 75, max: 75, result: "Caçador de recompensas interessado em fazer do novo mundo o seu campo de caça" },
  { min: 76, max: 76, result: "Clérigo antigo pretendendo fazer ressurgir sua religião" },
  { min: 77, max: 77, result: "Estudiosos em uma expedição para provar que a terra é plana" },
  { min: 78, max: 78, result: "Um animal que foi amaldiçoado e transformado em humanoide" },
  { min: 79, max: 79, result: "Eruditos com livros para montar uma biblioteca" },
  { min: 80, max: 80, result: "Uma legião inteira de recrutas com ordens para expandir territórios" },
  { min: 81, max: 81, result: "Monges com intuito de abrir um monastério" },
  { min: 82, max: 82, result: "Animal falante revoltado com humanoides" },
  { min: 83, max: 83, result: "Um humanoide que na verdade são três goblins em um sobretudo" },
  { min: 84, max: 84, result: "Cultista que busca invocar um deus antigo" },
  { min: 85, max: 85, result: "Pintor de muito talento" },
  { min: 86, max: 86, result: "Humanoide que possui um artefato que faz ele virar seres de outros planos" },
  { min: 87, max: 87, result: "O contratante não dorme há dias pois sempre tem um mesmo sonho de que sai em uma aventura" },
  { min: 88, max: 88, result: "Bandidos que fizeram um refúgio próximo" },
  { min: 89, max: 89, result: "Humanoides infectados com um misterioso parasita dos mares" },
  { min: 90, max: 90, result: "Avatar de um deus, porém com amnésia" },
  { min: 91, max: 91, result: "Humanoides de uma terra desconhecida que surgem quando desaparecimentos acontecem" },
  { min: 92, max: 92, result: "Lendário explorador" },
  { min: 93, max: 93, result: "Crianças que alegam serem adultos amaldiçoados durante a viagem" },
  { min: 94, max: 94, result: "O contratante é um famoso campeão de duelo de criaturas" },
  { min: 95, max: 95, result: "Fanático religioso em busca de hereges" },
  { min: 96, max: 96, result: "Comitiva de anões para explorar montanhas" },
  { min: 97, max: 97, result: "Comitiva de elfos para explorar florestas" },
  { min: 98, max: 98, result: "Fantasma preso a um humanoide" },
  { min: 99, max: 99, result: "Duplo assassino em série" },
  { min: 100, max: 100, result: "3 magos guiados por uma estrela, buscando uma criança profética" },
];

// ===== CONJUNTOS DE PALAVRAS-CHAVE PARA CRIATIVIDADE =====

/**
 * Conjunto 1 - Palavras místicas/sobrenaturais (d20)
 */
export const CREATIVITY_KEYWORDS_SET1_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Vazio" },
  { min: 2, max: 2, result: "Demônio" },
  { min: 3, max: 3, result: "Abismo" },
  { min: 4, max: 4, result: "Verde" },
  { min: 5, max: 5, result: "Ritual" },
  { min: 6, max: 6, result: "Dragão" },
  { min: 7, max: 7, result: "Horrível" },
  { min: 8, max: 8, result: "Vampiro" },
  { min: 9, max: 9, result: "Amaldiçoado" },
  { min: 10, max: 10, result: "Asas" },
  { min: 11, max: 11, result: "Nebuloso" },
  { min: 12, max: 12, result: "Dourado" },
  { min: 13, max: 13, result: "Sussurro" },
  { min: 14, max: 14, result: "Fragmento" },
  { min: 15, max: 15, result: "Véu" },
  { min: 16, max: 16, result: "Pulsante" },
  { min: 17, max: 17, result: "Etéreo" },
  { min: 18, max: 18, result: "Radiante" },
  { min: 19, max: 19, result: "Gelado" },
  { min: 20, max: 20, result: "Enigmático" },
];

/**
 * Conjunto 2 - Palavras de aventura/pirataria (d20)
 */
export const CREATIVITY_KEYWORDS_SET2_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Roubo" },
  { min: 2, max: 2, result: "Tesouro" },
  { min: 3, max: 3, result: "Caveira" },
  { min: 4, max: 4, result: "Prata" },
  { min: 5, max: 5, result: "Saquear" },
  { min: 6, max: 6, result: "Bandeira" },
  { min: 7, max: 7, result: "Fantasma" },
  { min: 8, max: 8, result: "Sujo" },
  { min: 9, max: 9, result: "Molusco" },
  { min: 10, max: 10, result: "Pirata" },
  { min: 11, max: 11, result: "Espada" },
  { min: 12, max: 12, result: "Navio" },
  { min: 13, max: 13, result: "Mapa" },
  { min: 14, max: 14, result: "Cofre" },
  { min: 15, max: 15, result: "Joia" },
  { min: 16, max: 16, result: "Corrente" },
  { min: 17, max: 17, result: "Âncora" },
  { min: 18, max: 18, result: "Leme" },
  { min: 19, max: 19, result: "Gruta" },
  { min: 20, max: 20, result: "Lenda" },
];

/**
 * Conjunto 3 - Palavras de itens mágicos (d20)
 */
export const CREATIVITY_KEYWORDS_SET3_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Anel" },
  { min: 2, max: 2, result: "Braço" },
  { min: 3, max: 3, result: "Orbe" },
  { min: 4, max: 4, result: "Cálice" },
  { min: 5, max: 5, result: "Pedra" },
  { min: 6, max: 6, result: "Divindade" },
  { min: 7, max: 7, result: "Botas" },
  { min: 8, max: 8, result: "Bastão" },
  { min: 9, max: 9, result: "Brilho" },
  { min: 10, max: 10, result: "Vingança" },
  { min: 11, max: 11, result: "Amuleto" },
  { min: 12, max: 12, result: "Coroa" },
  { min: 13, max: 13, result: "Elmo" },
  { min: 14, max: 14, result: "Escudo" },
  { min: 15, max: 15, result: "Pergaminho" },
  { min: 16, max: 16, result: "Poção" },
  { min: 17, max: 17, result: "Armadura" },
  { min: 18, max: 18, result: "Relíquia" },
  { min: 19, max: 19, result: "Talismã" },
  { min: 20, max: 20, result: "Artefato" },
];

/**
 * Conjunto 4 - Palavras de emoções positivas (d20)
 */
export const CREATIVITY_KEYWORDS_SET4_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Macabro" },
  { min: 2, max: 2, result: "Sono" },
  { min: 3, max: 3, result: "Não existe" },
  { min: 4, max: 4, result: "Realização" },
  { min: 5, max: 5, result: "Paixão" },
  { min: 6, max: 6, result: "Paz" },
  { min: 7, max: 7, result: "Curiosidade" },
  { min: 8, max: 8, result: "Alívio" },
  { min: 9, max: 9, result: "Euforia" },
  { min: 10, max: 10, result: "Aconchego" },
  { min: 11, max: 11, result: "Esperança" },
  { min: 12, max: 12, result: "Felicidade" },
  { min: 13, max: 13, result: "Inspiração" },
  { min: 14, max: 14, result: "Serenidade" },
  { min: 15, max: 15, result: "Coragem" },
  { min: 16, max: 16, result: "Sabedoria" },
  { min: 17, max: 17, result: "Harmonia" },
  { min: 18, max: 18, result: "Liberdade" },
  { min: 19, max: 19, result: "Gratidão" },
  { min: 20, max: 20, result: "Triunfo" },
];

/**
 * Conjunto 5 - Palavras de emoções negativas (d20)
 */
export const CREATIVITY_KEYWORDS_SET5_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Maníaco" },
  { min: 2, max: 2, result: "Raiva" },
  { min: 3, max: 3, result: "Solidão" },
  { min: 4, max: 4, result: "Fome" },
  { min: 5, max: 5, result: "Desespero" },
  { min: 6, max: 6, result: "Dor" },
  { min: 7, max: 7, result: "Medo" },
  { min: 8, max: 8, result: "Ciúmes" },
  { min: 9, max: 9, result: "Incapacidade" },
  { min: 10, max: 10, result: "Confusão" },
  { min: 11, max: 11, result: "Ansiedade" },
  { min: 12, max: 12, result: "Tristeza" },
  { min: 13, max: 13, result: "Ódio" },
  { min: 14, max: 14, result: "Vergonha" },
  { min: 15, max: 15, result: "Culpa" },
  { min: 16, max: 16, result: "Frustração" },
  { min: 17, max: 17, result: "Desconfiança" },
  { min: 18, max: 18, result: "Arrependimento" },
  { min: 19, max: 19, result: "Melancolia" },
  { min: 20, max: 20, result: "Tormento" },
];

/**
 * Conjunto 6 - Palavras de taverna/social (d20)
 */
export const CREATIVITY_KEYWORDS_SET6_TABLE: TableEntry<string>[] = [
  { min: 1, max: 1, result: "Bebida" },
  { min: 2, max: 2, result: "Bardo" },
  { min: 3, max: 3, result: "Briga" },
  { min: 4, max: 4, result: "Música" },
  { min: 5, max: 5, result: "Taverneiro" },
  { min: 6, max: 6, result: "Comida" },
  { min: 7, max: 7, result: "Aventura" },
  { min: 8, max: 8, result: "Violento" },
  { min: 9, max: 9, result: "Bárbaro" },
  { min: 10, max: 10, result: "Informações" },
  { min: 11, max: 11, result: "Canção" },
  { min: 12, max: 12, result: "Dança" },
  { min: 13, max: 13, result: "Festa" },
  { min: 14, max: 14, result: "Hospitaleiro" },
  { min: 15, max: 15, result: "Jogo" },
  { min: 16, max: 16, result: "Risada" },
  { min: 17, max: 17, result: "Conversa" },
  { min: 18, max: 18, result: "Amizade" },
  { min: 19, max: 19, result: "Celebração" },
  { min: 20, max: 20, result: "Entretenimento" },
];

// ===== MAPEAMENTO DE TABELAS TEMÁTICAS =====

/**
 * Mapeamento dos conjuntos temáticos para suas respectivas tabelas
 */
export const THEME_KEYWORD_TABLES: Record<ThemeKeywordSet, TableEntry<string>[]> = {
  [ThemeKeywordSet.MACABRO]: THEME_MACABRE_TABLE,
  [ThemeKeywordSet.GUERRA]: THEME_WAR_TABLE,
  [ThemeKeywordSet.FANTASIA]: THEME_FANTASY_TABLE,
  [ThemeKeywordSet.STEAMPUNK]: THEME_STEAMPUNK_TABLE,
  [ThemeKeywordSet.MASMORRAS]: THEME_DUNGEONS_TABLE,
  [ThemeKeywordSet.POLITICA]: THEME_POLITICS_TABLE,
};

/**
 * Mapeamento dos conjuntos de criatividade para suas respectivas tabelas
 */
export const CREATIVITY_KEYWORD_TABLES: TableEntry<string>[][] = [
  CREATIVITY_KEYWORDS_SET1_TABLE,
  CREATIVITY_KEYWORDS_SET2_TABLE,
  CREATIVITY_KEYWORDS_SET3_TABLE,
  CREATIVITY_KEYWORDS_SET4_TABLE,
  CREATIVITY_KEYWORDS_SET5_TABLE,
  CREATIVITY_KEYWORDS_SET6_TABLE,
];

// ===== FUNÇÕES DE ACESSO ÀS TABELAS =====

/**
 * Retorna todas as entradas da tabela de palavras-chave temáticas
 */
export function getThemeKeywordsTable() {
  return Object.values(THEME_KEYWORD_TABLES).flat();
}

/**
 * Retorna palavras-chave de um conjunto temático específico
 */
export function getThemeKeywordsBySet(set: ThemeKeywordSet) {
  return THEME_KEYWORD_TABLES[set] || [];
}

/**
 * Retorna todas as entradas da tabela de contratantes inusitados
 */
export function getUnusualContractorsTable() {
  return UNUSUAL_CONTRACTORS_TABLE;
}

/**
 * Retorna todas as variações da tabela de contratantes inusitados
 */
export function getUnusualContractorVariationsTable() {
  return UNUSUAL_CONTRACTORS_TABLE; // Mesma tabela, diferentes usos
}
