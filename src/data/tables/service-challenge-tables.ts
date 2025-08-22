import type { TableEntry } from "@/types/tables";

// ===== TABELAS DE DESAFIOS ADICIONAIS E CRIATIVIDADE =====

// ===== CHANCE DE DESAFIO ADICIONAL =====

// Interface para chance de desafio adicional
interface AdditionalChallengeChance {
  hasChallenge: boolean;
  description: string;
}

// Tabela: Chance de Desafio Adicional (d20)
// Determina se um serviço terá um desafio adicional único
export const ADDITIONAL_CHALLENGE_CHANCE_TABLE: TableEntry<AdditionalChallengeChance>[] =
  [
    {
      min: 1,
      max: 19,
      result: {
        hasChallenge: false,
        description: "Não",
      },
    },
    {
      min: 20,
      max: 20,
      result: {
        hasChallenge: true,
        description: "Sim",
      },
    },
  ];

// ===== TABELA DE DESAFIOS ADICIONAIS (d100) =====

// Interface para desafio adicional
interface AdditionalChallenge {
  description: string;
}

// Tabela: Desafios Adicionais (d100)
// 100 desafios únicos e criativos para enriquecer serviços
export const ADDITIONAL_CHALLENGE_TABLE: TableEntry<AdditionalChallenge>[] = [
  {
    min: 1,
    max: 1,
    result: {
      description:
        "Pescadores precisam de criaturas fortes para puxar peixes muito pesados",
    },
  },
  {
    min: 2,
    max: 2,
    result: {
      description:
        "Um adepto arcano que quer contar os passos de um lugar longínquo a outro",
    },
  },
  {
    min: 3,
    max: 3,
    result: {
      description:
        "Maníaco por limpeza contrata humanoides para sujarem uma construção",
    },
  },
  {
    min: 4,
    max: 4,
    result: {
      description: "Um ancião precisa de ajuda para hastear uma bandeira",
    },
  },
  {
    min: 5,
    max: 5,
    result: {
      description:
        "O filho do contratante te desafia para um embate de Duelo de Criaturas, e só para quando vencer",
    },
  },
  {
    min: 6,
    max: 6,
    result: {
      description: "Um gato pede ajuda para tirar seu anão da árvore",
    },
  },
  {
    min: 7,
    max: 7,
    result: {
      description:
        "O melhor amigo do contratante conta uma história triste e diz que você precisa escolher entre matá-lo ou matar o contratante",
    },
  },
  {
    min: 8,
    max: 8,
    result: {
      description:
        "Um fazendeiro precisa de ajuda para descobrir o que são estranhas marcações em suas plantações",
    },
  },
  {
    min: 9,
    max: 9,
    result: {
      description:
        "Um combatente relata que a estátua que tinha na praça saiu correndo e ele precisa de ajuda para recuperá-la",
    },
  },
  {
    min: 10,
    max: 10,
    result: {
      description:
        "Uma família precisa que façam seu filho dormir pois ele tem muito medo de alguma coisa",
    },
  },
  {
    min: 11,
    max: 11,
    result: {
      description:
        "Um mendigo precisa achar os meliantes que judiaram dele uns dias atrás",
    },
  },
  {
    min: 12,
    max: 12,
    result: {
      description: "Um elfo precisa de ajuda para perder seu medo de aranhas",
    },
  },
  {
    min: 13,
    max: 13,
    result: {
      description:
        "Empregado contrata alguém para ajudá-lo a limpar um estábulo",
    },
  },
  {
    min: 14,
    max: 14,
    result: {
      description:
        "Um gnomo pede ajuda para tirar sua mochila de dentro de um cubo gelatinoso",
    },
  },
  {
    min: 15,
    max: 15,
    result: {
      description:
        "Um plebeu do assentamento pede sua ajuda para desvendar a verdadeira identidade de outro plebeu",
    },
  },
  {
    min: 16,
    max: 16,
    result: {
      description:
        "Nobre que não consegue entrar em sua própria moradia pois 2d6 gansos agressivos o impedem",
    },
  },
  {
    min: 17,
    max: 17,
    result: {
      description:
        "Um livro pede para a criatura lê-lo na frente de uma grande plateia",
    },
  },
  {
    min: 18,
    max: 18,
    result: {
      description: "Uma criança pede ajuda para tirarem uma espada da mão dele",
    },
  },
  {
    min: 19,
    max: 19,
    result: {
      description:
        "Um humanoide não está se dando bem com seu companheiro e pede a sua ajuda",
    },
  },
  {
    min: 20,
    max: 20,
    result: {
      description:
        "Um humanoide vestido de gênio pede para os contratados que o ajudem a recuperar sua lâmpada mágica",
    },
  },
  {
    min: 21,
    max: 21,
    result: {
      description:
        "Um humanoide vestido de gênio pede para os contratados que o ajudem a realizar os três desejos de uma criança",
    },
  },
  {
    min: 22,
    max: 22,
    result: {
      description:
        "Gnomo procura alguém para cuidar de seu jardim por 2d4 dias",
    },
  },
  {
    min: 23,
    max: 23,
    result: {
      description: "Humanoide não consegue deixar de sentir frio e pede ajuda",
    },
  },
  {
    min: 24,
    max: 24,
    result: {
      description:
        "Um engenhoqueiro precisa de alguém para testar sua engenhoca mortal",
    },
  },
  {
    min: 25,
    max: 25,
    result: {
      description:
        "Humanoide precisa de ajuda para confeccionar uma sobremesa para um cliente insuportavelmente perfeccionista",
    },
  },
  {
    min: 26,
    max: 26,
    result: {
      description:
        "Um duplo imita os humanoides como um mímico. O contratante quer que você faça ele parar",
    },
  },
  {
    min: 27,
    max: 27,
    result: {
      description:
        "Um espírito não conseguirá descansar em paz até que a criatura que amada deixe aquele que a maltrata",
    },
  },
  {
    min: 28,
    max: 28,
    result: {
      description: "Um humanoide pede ajuda para animar a festa de uma criança",
    },
  },
  {
    min: 29,
    max: 29,
    result: {
      description:
        "Taverneiro pede ajuda para organizar um banquete, porém ele só tem ingredientes duvidosos",
    },
  },
  {
    min: 30,
    max: 30,
    result: {
      description:
        "Humanoide pede para ser resgatado e ressuscitado em sua casa em 1d4 dias, exatamente às 22:47",
    },
  },
  {
    min: 31,
    max: 31,
    result: {
      description:
        "Um halfling pede para você entrar em sua banda e ajudar em uma apresentação",
    },
  },
  {
    min: 32,
    max: 32,
    result: {
      description: "Crianças pedem ajuda para o seu amigo imaginário",
    },
  },
  {
    min: 33,
    max: 33,
    result: {
      description:
        "Um dos competidores de Duelo de Criaturas pede para sabotarem o baralho de um rival em uma competição de DDC",
    },
  },
  {
    min: 34,
    max: 34,
    result: {
      description:
        "2d4+4 ratos, montados em cachorros pedem ajuda à criatura na guerra contra os gatos escaldados que vai ocorrer no esgoto",
    },
  },
  {
    min: 35,
    max: 35,
    result: {
      description:
        "Um espírito pede para que a alma de seu amado seja liberta de uma maldição da bruxa local",
    },
  },
  {
    min: 36,
    max: 36,
    result: {
      description: "Um analfabeto precisa que você escreva uma carta secreta",
    },
  },
  {
    min: 37,
    max: 37,
    result: {
      description:
        "Um gigante pede ajuda para retirar pequenos humanoides que invadiram sua moradia",
    },
  },
  {
    min: 38,
    max: 38,
    result: {
      description: "Um vampiro busca ajuda para superar seu medo de escuro",
    },
  },
  {
    min: 39,
    max: 39,
    result: {
      description:
        "Vizinhos pedem ajuda para acabar com sons irritantes em horários inapropriados",
    },
  },
  {
    min: 40,
    max: 40,
    result: {
      description:
        "O contratante quer que você experimente tudo que ele for comer para provar que não está envenenado",
    },
  },
  {
    min: 41,
    max: 41,
    result: {
      description:
        "Escultor busca ajuda para transportar uma escultura extremamente pesada, porém frágil e delicada",
    },
  },
  {
    min: 42,
    max: 42,
    result: {
      description:
        "Humanoides procuram por cobaias para um experimento científico/poções desconhecidas",
    },
  },
  {
    min: 43,
    max: 43,
    result: {
      description: "Um kuo-toa quer comer um peixe cozinhado com magia",
    },
  },
  {
    min: 44,
    max: 44,
    result: {
      description: "Um especialista te contrata para fazer ciúmes em seu ex",
    },
  },
  {
    min: 45,
    max: 45,
    result: {
      description:
        "Mercador precisa de alguém para cuidar de sua barraquinha por 2d4 dias pois vai sair em viagem",
    },
  },
  {
    min: 46,
    max: 46,
    result: {
      description:
        "Um humanoide precisa de ajuda motivacional para entrar em forma e conseguir um trabalho que ele goste",
    },
  },
  {
    min: 47,
    max: 47,
    result: {
      description:
        "Um coveiro novato com medo do cemitério pede ajuda para trabalhar",
    },
  },
  {
    min: 48,
    max: 48,
    result: {
      description:
        'Um nobre pede para tirar uma espada "mágica" enfincada numa pedra',
    },
  },
  {
    min: 49,
    max: 49,
    result: {
      description:
        "Contratante com amnésia pede ajuda para investigar sua própria vida",
    },
  },
  {
    min: 50,
    max: 50,
    result: {
      description:
        "Taverneiro precisa que você vença um de seus clientes em alguma competição na taverna",
    },
  },
  {
    min: 51,
    max: 51,
    result: {
      description:
        "Um bardo pede para o contratado fingir ser seu amigo em uma festa",
    },
  },
  {
    min: 52,
    max: 52,
    result: {
      description:
        "Um ferreiro precisa de humanoides para servirem de modelos para suas novas armaduras",
    },
  },
  {
    min: 53,
    max: 53,
    result: {
      description:
        "Um corvo de cartola e terno fala que é um antigo nobre e quer voltar à sua forma normal",
    },
  },
  {
    min: 54,
    max: 54,
    result: {
      description: "Humanoide precisa de mão-de-obra para reformar sua moradia",
    },
  },
  {
    min: 55,
    max: 55,
    result: {
      description: "Um artista contrata para fingirem ser seus fãs",
    },
  },
  {
    min: 56,
    max: 56,
    result: {
      description: "Um jovem pescador quer ajuda para pegar um peixe lendário",
    },
  },
  {
    min: 57,
    max: 57,
    result: {
      description: "Nobre exótico contrata humanoides para um reality show",
    },
  },
  {
    min: 58,
    max: 58,
    result: {
      description:
        "Um diabrete pede ajuda para pregar uma peça bastante elaborada",
    },
  },
  {
    min: 59,
    max: 59,
    result: {
      description:
        "Um velho supersticioso pede ajuda para encontrar o seu dente da sorte perdido",
    },
  },
  {
    min: 60,
    max: 60,
    result: {
      description:
        "Um mercador pede para o contratado ser garoto propaganda de sua loja",
    },
  },
  {
    min: 61,
    max: 61,
    result: {
      description:
        "Um humanoide que diz está vivendo o mesmo dia, todos os dias, pede ajuda para quebrar o encanto",
    },
  },
  {
    min: 62,
    max: 62,
    result: {
      description:
        "Um martelo falante pede ajuda para recuperar seu ferreiro que foi comprar pregos e nunca mais voltou",
    },
  },
  {
    min: 63,
    max: 63,
    result: {
      description:
        "Um cão teleportador pede ajuda para localizar uma guloseima que enterrou",
    },
  },
  {
    min: 64,
    max: 64,
    result: {
      description:
        "Um patrulheiro pede ajuda para mudar um grupo de animais predadores para outro território",
    },
  },
  {
    min: 65,
    max: 65,
    result: {
      description:
        "Um goblin descobriu que ele tem o poder de ler mentes e pede ajuda para desenvolver esse poder (no momento só pode ler a própria mente)",
    },
  },
  {
    min: 66,
    max: 66,
    result: {
      description:
        'Um fã contrata seu ídolo para que passe um "dia dos sonhos" com ele',
    },
  },
  {
    min: 67,
    max: 67,
    result: {
      description:
        "Uma trupe de fantasmas pede ajuda para achar a localização de seus túmulos no assentamento",
    },
  },
  {
    min: 68,
    max: 68,
    result: {
      description:
        "Um nobre pede para o contratado trabalhar como garçom num evento chique",
    },
  },
  {
    min: 69,
    max: 69,
    result: {
      description:
        "Líder local pede ajuda para limpar parte suja do assentamento",
    },
  },
  {
    min: 70,
    max: 70,
    result: {
      description: "O dono de um circo precisa de ajuda com as apresentações",
    },
  },
  {
    min: 71,
    max: 71,
    result: {
      description: "Um arcanista pede ajuda para encontrar sua capa invisível",
    },
  },
  {
    min: 72,
    max: 72,
    result: {
      description:
        "Humanoide contrata alguém para cuidar de um bebê com magia selvagem inata e descontrolada por 1d4+1 dias",
    },
  },
  {
    min: 73,
    max: 73,
    result: {
      description:
        "Um nobre quer que você roube algo dele, mas não explica o por quê",
    },
  },
  {
    min: 74,
    max: 74,
    result: {
      description:
        'Um humanoide pede ajuda para descobrir quem foi o mago que saiu de um portal em sua frente e disse "droga, errei de novo"',
    },
  },
  {
    min: 75,
    max: 75,
    result: {
      description:
        "Um humanoide pede ajuda para remover sua sombra que está lutando contra ele há anos",
    },
  },
  {
    min: 76,
    max: 76,
    result: {
      description:
        "Um troll está tendo crises existenciais no meio da estrada, a população lhe paga para dar-lhe apoio emocional",
    },
  },
  {
    min: 77,
    max: 77,
    result: {
      description:
        "Contratante pede ajuda para conseguir partes do corpo de diferentes humanoides para criar uma criatura",
    },
  },
  {
    min: 78,
    max: 78,
    result: {
      description: "Um nobre paga para aquele que o fizer rir",
    },
  },
  {
    min: 79,
    max: 79,
    result: {
      description:
        "Um paladino que quebrou seus votos pede ajuda para fazer seu ritual de penitência",
    },
  },
  {
    min: 80,
    max: 80,
    result: {
      description:
        "Um dançarino pede para alguém substituir seu parceiro de dança doente em uma apresentação",
    },
  },
  {
    min: 81,
    max: 81,
    result: {
      description: "Elfo pede ajuda para traduzir pergaminhos antigos",
    },
  },
  {
    min: 82,
    max: 82,
    result: {
      description:
        "Um arqueiro precisa que você seja o teste de uma apresentação dele",
    },
  },
  {
    min: 83,
    max: 83,
    result: {
      description:
        "Um humanoide pede ajuda para encontrar ratos para sua grande fera",
    },
  },
  {
    min: 84,
    max: 84,
    result: {
      description:
        "Um humanoide quer ajuda para decidir para qual divindade dedicar a sua vida",
    },
  },
  {
    min: 85,
    max: 85,
    result: {
      description:
        "Um draconato com uma rinite incurável pede ajuda pois expele uma baforada a cada espirro",
    },
  },
  {
    min: 86,
    max: 86,
    result: {
      description:
        "A guilda precisa de alguém para confiscar ou recuperar pertences de membros que a devem",
    },
  },
  {
    min: 87,
    max: 87,
    result: {
      description: "Um anão contrata pintores de muro",
    },
  },
  {
    min: 88,
    max: 88,
    result: {
      description:
        "Uma criança pede por socorro e afirma que uma bugiganga caiu do céu e grudou no seu pulso",
    },
  },
  {
    min: 89,
    max: 89,
    result: {
      description: "Bardo precisa de materiais mágicos para seus instrumentos",
    },
  },
  {
    min: 90,
    max: 90,
    result: {
      description:
        "Um humanoide lhe pede para ajudá-lo a organizar sua biblioteca pessoal",
    },
  },
  {
    min: 91,
    max: 91,
    result: {
      description:
        "Um humanoide quer ficar mais feio porque ele se acha tão bonito a ponto de se prender no espelho",
    },
  },
  {
    min: 92,
    max: 92,
    result: {
      description: "Um antigo chefe de cozinha pede ajuda para se atualizar",
    },
  },
  {
    min: 93,
    max: 93,
    result: {
      description: "Encontre as vacas furtivas do fazendeiro",
    },
  },
  {
    min: 94,
    max: 94,
    result: {
      description: "Um alfaiate pede ajuda para achar tecidos",
    },
  },
  {
    min: 95,
    max: 95,
    result: {
      description: "Estabelecimento comercial procura garoto propaganda",
    },
  },
  {
    min: 96,
    max: 96,
    result: {
      description: "Cuidar dos quadrigêmeos de um humanoide",
    },
  },
  {
    min: 97,
    max: 97,
    result: {
      description: "Demônios lhe contratarão como babá",
    },
  },
  {
    min: 98,
    max: 98,
    result: {
      description: "Construtor precisa de ajuda para carregar material",
    },
  },
  {
    min: 99,
    max: 99,
    result: {
      description:
        "Um monge pede ajuda à criatura para que não deixem que ninguém o interrompa por 7 dias inteiros enquanto medita",
    },
  },
  {
    min: 100,
    max: 100,
    result: {
      description:
        "Um pescador pede para que você consiga um peixe raro que é um dos preferidos dos dragões",
    },
  },
];

// ===== CONJUNTOS DE PALAVRAS-CHAVE PARA CRIATIVIDADE =====

// Interface para palavra-chave
interface CreativityKeyword {
  keyword: string;
}

// Conjunto 7 (d20)
export const CREATIVITY_KEYWORD_SET_7: TableEntry<CreativityKeyword>[] = [
  { min: 1, max: 1, result: { keyword: "Bêbado" } },
  { min: 2, max: 2, result: { keyword: "Dragão" } },
  { min: 3, max: 3, result: { keyword: "Anão" } },
  { min: 4, max: 4, result: { keyword: "Nunca" } },
  { min: 5, max: 5, result: { keyword: "Magia" } },
  { min: 6, max: 6, result: { keyword: "Guilda" } },
  { min: 7, max: 7, result: { keyword: "Esfirra" } },
  { min: 8, max: 8, result: { keyword: "Monge" } },
  { min: 9, max: 9, result: { keyword: "Ladino" } },
  { min: 10, max: 10, result: { keyword: "Cavalo" } },
  { min: 11, max: 11, result: { keyword: "Sereia" } },
  { min: 12, max: 12, result: { keyword: "Chave" } },
  { min: 13, max: 13, result: { keyword: "Armadura" } },
  { min: 14, max: 14, result: { keyword: "Taverna" } },
  { min: 15, max: 15, result: { keyword: "Gato" } },
  { min: 16, max: 16, result: { keyword: "Poço" } },
  { min: 17, max: 17, result: { keyword: "Cego" } },
  { min: 18, max: 18, result: { keyword: "Corda" } },
  { min: 19, max: 19, result: { keyword: "Sombra" } },
  { min: 20, max: 20, result: { keyword: "Relógio" } },
];

// Conjunto 8 (d20)
export const CREATIVITY_KEYWORD_SET_8: TableEntry<CreativityKeyword>[] = [
  { min: 1, max: 1, result: { keyword: "Amor" } },
  { min: 2, max: 2, result: { keyword: "Raiva" } },
  { min: 3, max: 3, result: { keyword: "Tristeza" } },
  { min: 4, max: 4, result: { keyword: "Felicidade" } },
  { min: 5, max: 5, result: { keyword: "Destruir" } },
  { min: 6, max: 6, result: { keyword: "Angústia" } },
  { min: 7, max: 7, result: { keyword: "Prazer" } },
  { min: 8, max: 8, result: { keyword: "Frio" } },
  { min: 9, max: 9, result: { keyword: "Avareza" } },
  { min: 10, max: 10, result: { keyword: "Medo" } },
  { min: 11, max: 11, result: { keyword: "Esperança" } },
  { min: 12, max: 12, result: { keyword: "Orgulho" } },
  { min: 13, max: 13, result: { keyword: "Ciúme" } },
  { min: 14, max: 14, result: { keyword: "Coragem" } },
  { min: 15, max: 15, result: { keyword: "Saudade" } },
  { min: 16, max: 16, result: { keyword: "Paciência" } },
  { min: 17, max: 17, result: { keyword: "Culpa" } },
  { min: 18, max: 18, result: { keyword: "Surpresa" } },
  { min: 19, max: 19, result: { keyword: "Tédio" } },
  { min: 20, max: 20, result: { keyword: "Ansiedade" } },
];

// Conjunto 9 (d20)
export const CREATIVITY_KEYWORD_SET_9: TableEntry<CreativityKeyword>[] = [
  { min: 1, max: 1, result: { keyword: "Sujo" } },
  { min: 2, max: 2, result: { keyword: "Esqueleto" } },
  { min: 3, max: 3, result: { keyword: "Gosma" } },
  { min: 4, max: 4, result: { keyword: "Cadáver" } },
  { min: 5, max: 5, result: { keyword: "Perigo" } },
  { min: 6, max: 6, result: { keyword: "Escuridão" } },
  { min: 7, max: 7, result: { keyword: "Tesouro" } },
  { min: 8, max: 8, result: { keyword: "Pedra" } },
  { min: 9, max: 9, result: { keyword: "Armadilha" } },
  { min: 10, max: 10, result: { keyword: "Ponte" } },
  { min: 11, max: 11, result: { keyword: "Poeira" } },
  { min: 12, max: 12, result: { keyword: "Corrente" } },
  { min: 13, max: 13, result: { keyword: "Ossos" } },
  { min: 14, max: 14, result: { keyword: "Lama" } },
  { min: 15, max: 15, result: { keyword: "Túnel" } },
  { min: 16, max: 16, result: { keyword: "Grito" } },
  { min: 17, max: 17, result: { keyword: "Fenda" } },
  { min: 18, max: 18, result: { keyword: "Mofo" } },
  { min: 19, max: 19, result: { keyword: "Areia" } },
  { min: 20, max: 20, result: { keyword: "Caverna" } },
];

// Conjunto 10 (d20)
export const CREATIVITY_KEYWORD_SET_10: TableEntry<CreativityKeyword>[] = [
  { min: 1, max: 1, result: { keyword: "Prato" } },
  { min: 2, max: 2, result: { keyword: "Fogo" } },
  { min: 3, max: 3, result: { keyword: "Livro" } },
  { min: 4, max: 4, result: { keyword: "Trovão" } },
  { min: 5, max: 5, result: { keyword: "Barba" } },
  { min: 6, max: 6, result: { keyword: "Runa" } },
  { min: 7, max: 7, result: { keyword: "Selvagem" } },
  { min: 8, max: 8, result: { keyword: "Poção" } },
  { min: 9, max: 9, result: { keyword: "Cajado" } },
  { min: 10, max: 10, result: { keyword: "Buraco" } },
  { min: 11, max: 11, result: { keyword: "Véu" } },
  { min: 12, max: 12, result: { keyword: "Máscara" } },
  { min: 13, max: 13, result: { keyword: "Espelho" } },
  { min: 14, max: 14, result: { keyword: "Selo" } },
  { min: 15, max: 15, result: { keyword: "Círculo" } },
  { min: 16, max: 16, result: { keyword: "Medalhão" } },
  { min: 17, max: 17, result: { keyword: "Sino" } },
  { min: 18, max: 18, result: { keyword: "Tinta" } },
  { min: 19, max: 19, result: { keyword: "Relíquia" } },
  { min: 20, max: 20, result: { keyword: "Escada" } },
];

// Conjunto 11 (d20)
export const CREATIVITY_KEYWORD_SET_11: TableEntry<CreativityKeyword>[] = [
  { min: 1, max: 1, result: { keyword: "Esposa" } },
  { min: 2, max: 2, result: { keyword: "Garrafa" } },
  { min: 3, max: 3, result: { keyword: "Janela" } },
  { min: 4, max: 4, result: { keyword: "Mesa" } },
  { min: 5, max: 5, result: { keyword: "Mochila" } },
  { min: 6, max: 6, result: { keyword: "Fedor" } },
  { min: 7, max: 7, result: { keyword: "Ombro" } },
  { min: 8, max: 8, result: { keyword: "Álcool" } },
  { min: 9, max: 9, result: { keyword: "Espada" } },
  { min: 10, max: 10, result: { keyword: "Chão" } },
  { min: 11, max: 11, result: { keyword: "Sapato" } },
  { min: 12, max: 12, result: { keyword: "Chapéu" } },
  { min: 13, max: 13, result: { keyword: "Cinto" } },
  { min: 14, max: 14, result: { keyword: "Tapete" } },
  { min: 15, max: 15, result: { keyword: "Vela" } },
  { min: 16, max: 16, result: { keyword: "Balde" } },
  { min: 17, max: 17, result: { keyword: "Porta" } },
  { min: 18, max: 18, result: { keyword: "Toalha" } },
  { min: 19, max: 19, result: { keyword: "Banco" } },
  { min: 20, max: 20, result: { keyword: "Escada" } },
];

// Conjunto 12 (d20)
export const CREATIVITY_KEYWORD_SET_12: TableEntry<CreativityKeyword>[] = [
  { min: 1, max: 1, result: { keyword: "Morte" } },
  { min: 2, max: 2, result: { keyword: "Bosque" } },
  { min: 3, max: 3, result: { keyword: "Amigos" } },
  { min: 4, max: 4, result: { keyword: "Mapa" } },
  { min: 5, max: 5, result: { keyword: "Recompensa" } },
  { min: 6, max: 6, result: { keyword: "Templo" } },
  { min: 7, max: 7, result: { keyword: "Sangue" } },
  { min: 8, max: 8, result: { keyword: "Masmorra" } },
  { min: 9, max: 9, result: { keyword: "Viagem" } },
  { min: 10, max: 10, result: { keyword: "Exploração" } },
  { min: 11, max: 11, result: { keyword: "Segredo" } },
  { min: 12, max: 12, result: { keyword: "Portal" } },
  { min: 13, max: 13, result: { keyword: "Relíquia" } },
  { min: 14, max: 14, result: { keyword: "Caminho" } },
  { min: 15, max: 15, result: { keyword: "Estrela" } },
  { min: 16, max: 16, result: { keyword: "Véu" } },
  { min: 17, max: 17, result: { keyword: "Névoa" } },
  { min: 18, max: 18, result: { keyword: "Ilha" } },
  { min: 19, max: 19, result: { keyword: "Caverna" } },
  { min: 20, max: 20, result: { keyword: "Horizonte" } },
];

// ===== ARRAYS DOS CONJUNTOS PARA SELEÇÃO ALEATÓRIA =====

// Array contendo todos os conjuntos de palavras-chave para seleção aleatória
export const ALL_CREATIVITY_KEYWORD_SETS = [
  CREATIVITY_KEYWORD_SET_7,
  CREATIVITY_KEYWORD_SET_8,
  CREATIVITY_KEYWORD_SET_9,
  CREATIVITY_KEYWORD_SET_10,
  CREATIVITY_KEYWORD_SET_11,
  CREATIVITY_KEYWORD_SET_12,
] as const;

// ===== FUNÇÕES UTILITÁRIAS =====

/**
 * Gera 1d6 palavras-chave aleatórias de diferentes conjuntos
 * Conforme especificado no arquivo markdown para criatividade
 */
export function generateRandomKeywords(): CreativityKeyword[] {
  const keywordCount = Math.floor(Math.random() * 6) + 1; // 1d6
  const keywords: CreativityKeyword[] = [];
  const usedSets = new Set<number>();

  for (let i = 0; i < keywordCount; i++) {
    // Seleciona um conjunto que ainda não foi usado
    let setIndex: number;
    do {
      setIndex = Math.floor(Math.random() * ALL_CREATIVITY_KEYWORD_SETS.length);
    } while (
      usedSets.has(setIndex) &&
      usedSets.size < ALL_CREATIVITY_KEYWORD_SETS.length
    );

    usedSets.add(setIndex);

    // Seleciona uma palavra aleatória do conjunto
    const selectedSet = ALL_CREATIVITY_KEYWORD_SETS[setIndex];
    const randomIndex = Math.floor(Math.random() * selectedSet.length);
    keywords.push(selectedSet[randomIndex].result);
  }

  return keywords;
}

/**
 * Seleciona uma palavra-chave aleatória de um conjunto específico
 */
export function getRandomKeywordFromSet(
  setNumber: 7 | 8 | 9 | 10 | 11 | 12
): CreativityKeyword {
  const setIndex = setNumber - 7; // Convert to 0-based index
  const selectedSet = ALL_CREATIVITY_KEYWORD_SETS[setIndex];
  const randomIndex = Math.floor(Math.random() * selectedSet.length);
  return selectedSet[randomIndex].result;
}
