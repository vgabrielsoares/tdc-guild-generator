export interface HelpSection {
  title: string;
  content: string[];
}

export interface HelpExample {
  title: string;
  description: string;
}

export interface HelpData {
  title: string;
  description?: string;
  sections?: HelpSection[];
  tips?: string[];
  examples?: HelpExample[];
}

export const guildHelpData: Record<string, HelpData> = {
  "guild-naming": {
    title: "Nome da Guilda",
    description:
      "Cada sede da Guilda pode ter um nome próprio para fins de identificação e personalização, mas todas fazem parte da mesma organização maior.",
    sections: [
      {
        title: "Sistema de Nomenclatura",
        content: [
          "O nome é usado apenas para organização e identificação da sede específica.",
          'Todas as sedes, independente do nome, pertencem à organização "A Guilda".',
          "Você pode usar nomes que reflitam a localização, características ou história da sede.",
          "O sistema possui um gerador automático de nomes para inspiração.",
        ],
      },
      {
        title: "Identidade Oficial da Guilda",
        content: [
          "Símbolo: Uma mão segurando uma espada pela lâmina, fundo azul",
          'Lema: "A lâmina que desbrava; a mão que une."',
          "Todas as sedes usam o mesmo símbolo e seguem as mesmas regras fundamentais",
          "O nome local é uma personalização, não uma organização diferente",
        ],
      },
    ],
    tips: [
      "Use nomes que facilitem a identificação durante suas sessões de RPG",
      "Considere incluir referências geográficas (Vila do Norte, Sede do Porto, etc.)",
      "Nomes podem mudar conforme a sede evolui na campanha",
      "Mantenha consistência com o tom da sua campanha",
    ],
    examples: [
      {
        title: "Baseado em Localização",
        description:
          "Guilda do Porto Dourado, Sede da Colina Verde, Bastião do Norte",
      },
      {
        title: "Baseado em Características",
        description:
          "Torre dos Sábios, Refúgio dos Mercenários, Forja dos Heróis",
      },
    ],
  },

  "guild-rules": {
    title: "Regras da Guilda",
    description:
      "O Código de Conduta que rege o comportamento de todos os membros registrados da Guilda. Essas regras mantêm a ordem, reputação e eficiência da organização.",
    sections: [
      {
        title: "Código de Conduta para Membros",
        content: [
          '1. Lealdade Inquestionável - "A Guilda é seu lar e sua bandeira. Traí-la é trair a si mesmo."',
          '2. Santidade do Contrato - "Ouro recebido, palavra empenhada." Termos devem ser cumpridos rigorosamente.',
          '3. Proteção dos Inocentes - "Nossa espada defende, nunca oprime." Força contra não-combatentes é proibida.',
          '4. Submissão à Lei Local - "Respeite o solo que pisa." Obedeça autoridades locais legítimas.',
          '5. Trato com Prisioneiros - "Inimigo rendido é dever cumprido." Entregue capturados às autoridades.',
          '6. Conflitos Internos - "Ferir colega é ferir a Guilda." Disputas são resolvidas pelo Conselho.',
          '7. Voto de Silêncio - "Segredos guardados são vidas preservadas." Não vaze informações confidenciais.',
        ],
      },
      {
        title: "Sistema de Punições",
        content: [
          "Infrações são analisadas e punidas pelo Conselho da Guilda.",
          "Punições variam de advertências até expulsão permanente.",
          "Traição à Guilda pode resultar em banimento e caça aos infratores.",
          "Danos a colegas exigem reparação em dobro do valor causado.",
        ],
      },
      {
        title: "Benefícios da Afiliação",
        content: [
          "Acesso a contratos oficiais e sistema de recompensas estruturado",
          "Ficha de contrato mágica (resistente a fogo, água e rasgos)",
          "Capa azul oficial com brasão da Guilda para identificação",
          "Carta de prova de participação reconhecida em múltiplas regiões",
          "Proteção legal da organização em caso de acusações infundadas",
        ],
      },
      {
        title: "Taxas e Custos",
        content: [
          "Taxa de inscrição: 10 moedas de ouro (5 para tinta mágica + 5 administrativa)",
          "Renovação anual: 10 moedas de ouro",
          "Contratantes pagam 1,5 moedas de ouro para criar contratos",
          "Serviços custam 1 moeda de cobre para contratantes",
        ],
      },
    ],
    tips: [
      "Use essas regras como base para roleplay e decisões morais dos personagens",
      "Conflitos entre regras podem criar dilemas interessantes (lei local vs proteção de inocentes)",
      "A Regra #3 sempre prevalece sobre as outras em casos de conflito",
      "Considere como as ações dos jogadores afetam sua reputação dentro da Guilda",
    ],
    examples: [
      {
        title: "Dilema Moral",
        description:
          "Autoridades locais ordenam prisão de refugiados inocentes. A Regra #3 prevalece sobre a #4.",
      },
      {
        title: "Conflito Interno",
        description:
          "Dois grupos de aventureiros disputam o mesmo contrato. O Conselho deve mediar e definir protocolo.",
      },
    ],
  },

  "guild-overview": {
    title: "Sistema Gerador de Guildas",
    description:
      "Um sistema completo para criar sedes da Guilda dinamicamente adaptadas aos diferentes tipos de assentamentos, desde pequenos lugarejos até grandes metrópoles.",
    sections: [
      {
        title: "Como Funciona o Sistema",
        content: [
          "O gerador usa tabelas de dados que se interconectam para criar resultados únicos e balanceados.",
          "Cada elemento gerado influencia outros aspectos da Guilda, garantindo coerência interna.",
          "As regras são executadas automaticamente, mas você sempre pode ajustar resultados para sua campanha.",
          "Diferentes tipos de assentamento usam dados diferentes, criando variação natural entre sedes.",
        ],
      },
      {
        title: "Elementos Gerados",
        content: [
          "Estrutura Física: tamanho, características e funcionários",
          "Relações Sociais: como governo e população local veem a Guilda",
          "Recursos Disponíveis: determinados pelas relações e características da sede",
          "Frequentadores: quanta atividade a sede tem baseado nos outros fatores",
        ],
      },
      {
        title: "Integração com Campanhas",
        content: [
          "Use características geradas como ganchos de aventura e elementos narrativos",
          "Relações ruins podem criar conflitos e complicações interessantes",
          "Recursos abundantes permitem apoio adicional para aventureiros",
          "A evolução da sede pode refletir as ações dos jogadores ao longo da campanha",
        ],
      },
    ],
    tips: [
      "Gere várias sedes para comparar e escolher a que melhor se encaixa na sua história",
      "Use o histórico para manter diferentes sedes para diferentes cidades da campanha",
      "Considere como as ações dos jogadores podem melhorar ou piorar as relações da sede",
      "Sedes com problemas (recursos baixos, relações ruins) podem ser projetos de longo prazo para os jogadores",
    ],
    examples: [
      {
        title: "Sede Problemática",
        description:
          "Uma sede em débito com governo hostil pode precisar da ajuda dos jogadores para resolver situações políticas e financeiras.",
      },
      {
        title: "Sede Próspera",
        description:
          "Uma sede matriz em metrópole pode servir como base para aventuras de alto nível com acesso a recursos mágicos raros.",
      },
    ],
  },

  "guild-structure": {
    title: "Estrutura da Guilda",
    description:
      "A estrutura física da Guilda varia drasticamente dependendo do assentamento onde está localizada. Desde pequenos escritórios em tavernas até complexos majestosos de múltiplos andares.",
    sections: [
      {
        title: "Como Funciona a Geração",
        content: [
          "O sistema rola dados baseados no tipo de assentamento - cidades maiores têm dados maiores (1d20+8 para Metrópoles vs 1d8 para Lugarejos).",
          "Resultados maiores sempre representam estruturas melhores, mais recursos e maior prestígio.",
          'Modificadores são aplicados quando a sede é uma "Sede Matriz", adicionando +5 a todas as rolagens.',
        ],
      },
      {
        title: "Tipos de Assentamento",
        content: [
          "Lugarejo/Povoado/Aldeia: Comunidades pequenas com recursos limitados (1d8)",
          "Vilarejo/Vila Grande: Assentamentos medianos com alguma infraestrutura (1d12)",
          "Cidadela: Cidades fortificadas com boa estrutura (1d20)",
          "Cidade Grande: Centros urbanos importantes (1d20+4)",
          "Metrópole: Grandes centros de poder e comércio (1d20+8)",
        ],
      },
      {
        title: "Existência da Sede",
        content: [
          "Nem todo assentamento possui uma sede da Guilda. Role 1d20:",
          "1-7: Não há sede (baixa demanda ou recursos insuficientes)",
          "8-20: Sede normal presente",
          "21+: Sede Matriz (centro regional de operações)",
        ],
      },
    ],
    tips: [
      "Sedes menores podem ser mais interessantes narrativamente - um escritório na taverna local cria uma atmosfera diferente de um complexo majestoso.",
      'Use as características geradas como ganchos de aventura - uma sede "mal conservada" pode ter problemas internos.',
      "Sedes Matriz são excelentes para campanhas de alto nível, oferecendo recursos e missões mais complexas.",
      "A relação com o governo local afeta diretamente os tipos de contratos disponíveis.",
    ],
    examples: [
      {
        title: "Sede em Lugarejo",
        description:
          'Um pequeno escritório no canto da taverna "O Javali Dourado", com apenas uma mesa e um funcionário de meio período. Ideal para aventureiros iniciantes.',
      },
      {
        title: "Sede Matriz em Metrópole",
        description:
          "Um complexo de três andares com círculos de teletransporte, biblioteca mágica, sala de reuniões do conselho e dormitórios para membros visitantes.",
      },
    ],
  },

  "guild-relations": {
    title: "Relações da Guilda",
    description:
      "As relações da Guilda com o governo local e a população determinam que tipos de contratos estão disponíveis e como a organização é percebida na comunidade.",
    sections: [
      {
        title: "Relação com o Governo",
        content: [
          "Varia de péssima (1-2) até excelente (21+), afetando diretamente a disponibilidade de recursos.",
          "Governos hostis podem restringir operações ou até mesmo perseguir membros.",
          "Boas relações resultam em contratos oficiais e apoio em situações difíceis.",
          'Uma relação "diplomática" (9-14) é neutra - nem ajuda nem atrapalha significativamente.',
        ],
      },
      {
        title: "Reputação com a População",
        content: [
          "Reflete como os cidadãos comuns veem a Guilda e seus membros.",
          "Populações hostis podem recusar ajuda ou até mesmo sabotar missões.",
          "Boa reputação facilita a obtenção de informações e apoio local.",
          "A reputação pode mudar com base nas ações dos aventureiros ao longo da campanha.",
        ],
      },
      {
        title: "Modificadores de Recursos",
        content: [
          "As relações afetam diretamente os recursos disponíveis na sede.",
          "Some os modificadores de governo e população: relação péssima (-3) até excelente (+3).",
          "Uma sede com boa relação com ambos (+1 e +2 = +3) terá recursos significativamente melhores.",
          "Relações ruins podem deixar até mesmo uma sede grande com recursos escassos.",
        ],
      },
    ],
    tips: [
      "Use tensões políticas como fonte de conflito - uma sede perseguida pelo governo cria drama.",
      "Relações podem mudar durante a campanha baseado nas ações dos jogadores.",
      "Uma população hostil mas governo amigável (ou vice-versa) cria situações interessantes.",
      "Considere que aventureiros podem trabalhar para melhorar relações através de suas ações.",
    ],
    examples: [
      {
        title: "Conflito de Interesses",
        description:
          "Governo excelente (+3) mas população péssima (-3) = recursos normais, mas membros precisam se esconder da população hostil.",
      },
      {
        title: "Apoio Total",
        description:
          "Tanto governo quanto população amam a Guilda (+3 cada) = recursos abundantes e apoio total em missões.",
      },
    ],
  },

  "guild-staff": {
    title: "Funcionários da Guilda",
    description:
      "Os funcionários são a força vital de cada sede, desde burocratas despreparados até dragões disfarçados. Cada tipo oferece diferentes capacidades e atmosfera.",
    sections: [
      {
        title: "Tipos de Funcionários",
        content: [
          "Funcionários Despreparados: Novatos ou incompetentes, podem causar problemas mas são baratos.",
          "Funcionários Experientes: Veteranos eficientes que mantêm a operação funcionando.",
          "Ex-membros da Guilda: Aventureiros aposentados com conhecimento profundo do sistema.",
          "Especialistas: Membros do clero, nobres, ou até mesmo animais falantes.",
        ],
      },
      {
        title: "Regra Especial dos Dragões",
        content: [
          "Se todas as rolagens de estrutura resultarem em exatamente 23, o funcionário é um dragão disfarçado.",
          "Este é um easter egg rara que pode criar campanhas épicas.",
          "O dragão pode ser benevolente (ajudando secretamente) ou ter seus próprios planos.",
          "Cabe ao Mestre decidir como revelar e usar essa informação.",
        ],
      },
      {
        title: "Impacto nos Frequentadores",
        content: [
          "Funcionários despreparados reduzem o movimento na sede (-1 modificador).",
          "Funcionários experientes atraem mais visitantes (+1 modificador).",
          "A competência da equipe afeta diretamente a reputação local da sede.",
        ],
      },
    ],
    tips: [
      "Funcionários podem ser NPCs recorrentes e memoráveis para os jogadores.",
      "Use funcionários despreparados para alívio cômico ou complicações menores.",
      "Ex-aventureiros podem oferecer conselhos valiosos baseados em experiência.",
      "Um animal falante como funcionário pode ser um elemento único e divertido.",
    ],
    examples: [
      {
        title: "O Escriturário Desastrado",
        description:
          "Aldric sempre perde papéis importantes e confunde nomes, mas tem um coração de ouro e eventualmente resolve os problemas.",
      },
      {
        title: "A Veterana Sábia",
        description:
          "Helena, ex-sentinela aposentada, conhece todos os segredos da região e pode orientar aventureiros sobre perigos específicos.",
      },
    ],
  },

  "guild-resources": {
    title: "Recursos da Guilda",
    description:
      "Os recursos determinam que equipamentos, informações e apoio a sede pode oferecer aos seus membros. Vão desde sedes endividadas até complexos abundantemente financiados.",
    sections: [
      {
        title: "Níveis de Recursos",
        content: [
          "Em Débito: A sede deve dinheiro e pode ter operações limitadas ou sob pressão.",
          "Nenhum/Escassos: Operações básicas, sem extras ou benefícios especiais.",
          "Limitados: O suficiente para funcionar, mas sem luxos.",
          "Suficientes: Operação normal com algum conforto e benefícios.",
          "Excedentes/Abundantes: Recursos extras permitindo benefícios especiais e apoio adicional.",
        ],
      },
      {
        title: "Modificadores das Relações",
        content: [
          "As relações com governo e população afetam diretamente os recursos.",
          "Some os modificadores: Péssima (-3), Ruim (-2), Diplomática (-1), Boa (+1), Muito Boa (+2), Excelente (+3).",
          'Uma sede com relações péssimas pode cair para "Em Débito" mesmo começando bem.',
          'Boas relações podem elevar recursos "Limitados" para "Abundantes".',
        ],
      },
      {
        title: "Impacto nos Frequentadores",
        content: [
          "Recursos Em Débito: -6 modificador (sede quase vazia)",
          "Nenhum Recurso: -3 modificador",
          "Recursos Escassos: -2 modificador",
          "Recursos Suficientes: +2 modificador",
          "Recursos Excedentes: +3 modificador",
          "Recursos Abundantes: +6 modificador (sede muito movimentada)",
        ],
      },
    ],
    tips: [
      "Recursos baixos podem ser oportunidades narrativas - a sede precisa de ajuda urgente.",
      "Recursos abundantes permitem itens mágicos, informações raras e apoio logístico.",
      "Uma sede em débito pode ter credores perigosos ou estar sob ameaça de fechamento.",
      "Use recursos como recompensa - ações dos jogadores podem melhorar a situação da sede.",
    ],
    examples: [
      {
        title: "Sede em Débito",
        description:
          "A sede deve 500 moedas de ouro ao Banco dos Anões. Funcionários trabalham sem salário e equipamentos estão sendo confiscados.",
      },
      {
        title: "Sede Abundante",
        description:
          "Cofres cheios permitem empréstimos de itens mágicos, informações de espiões em múltiplas cidades e apoio logístico completo.",
      },
    ],
  },

  "guild-visitors": {
    title: "Frequentadores da Guilda",
    description:
      "A movimentação na sede reflete sua importância, reputação e recursos. Uma sede movimentada indica sucesso, enquanto uma vazia pode ter problemas sérios.",
    sections: [
      {
        title: "Níveis de Movimento",
        content: [
          "Vazia: Ninguém visita, pode indicar problemas sérios ou má reputação.",
          "Quase Deserta: Apenas visitantes ocasionais, operação mínima.",
          "Pouco Movimentada: Algum movimento, mas bem abaixo do normal.",
          "Normal: Movimento equilibrado de aventureiros, clientes e curiosos.",
          "Muito Frequentada: Popular na região, centro de atividade local.",
          "Abarrotada/Lotada: Extremamente popular, pode haver filas e tumulto.",
        ],
      },
      {
        title: "Modificadores que Afetam",
        content: [
          "Funcionários: Despreparados (-1), Experientes (+1)",
          "Recursos: Em Débito (-6), Nenhum (-3), Escassos (-2), Suficientes (+2), Excedentes (+3), Abundantes (+6)",
          "A combinação destes fatores determina se a sede é um centro movimentado ou um local abandonado.",
        ],
      },
      {
        title: "Dados por Assentamento",
        content: [
          "Assentamentos menores usam dados menores (1d8 para lugarejos)",
          "Cidades grandes usam dados maiores (1d20+5 para metrópoles)",
          "Isso significa que metrópoles raramente têm sedes vazias, enquanto lugarejos podem facilmente ter sedes desertas.",
        ],
      },
    ],
    tips: [
      "Use o nível de movimento para estabelecer a atmosfera da sede.",
      "Uma sede vazia pode ser um mistério - por que ninguém vem mais?",
      "Sedes lotadas podem ter filas, competição por atenção e rumores abundantes.",
      "O movimento pode mudar baseado nas ações dos jogadores na região.",
    ],
    examples: [
      {
        title: "Sede Vazia",
        description:
          "Rumores de incompetência ou corrupção afastaram todos. Apenas contratos desesperados ou de baixo valor estão disponíveis.",
      },
      {
        title: "Sede Lotada",
        description:
          "Aventureiros fazem fila do lado de fora. Múltiplas mesas atendem clientes simultaneamente. Rumores e oportunidades abundam.",
      },
    ],
  },

  "settlement-types": {
    title: "Tipos de Assentamento",
    description:
      "O tipo de assentamento determina fundamentalmente que tipo de sede da Guilda pode existir ali, desde pequenos escritórios até complexos majestosos.",
    sections: [
      {
        title: "Hierarquia de Assentamentos",
        content: [
          "Lugarejo: Comunidade rural pequena, economia simples.",
          "Povoado: Maior que lugarejo, ainda rural.",
          "Aldeia: Centro local menor com alguns serviços.",
          "Vilarejo: Comunidade organizada com infraestrutura básica.",
          "Vila Grande: Centro regional importante.",
          "Cidadela: Cidade fortificada, centro de poder local.",
          "Cidade Grande: Centro urbano importante.",
          "Metrópole: Grande centro de poder, comércio e cultura.",
        ],
      },
      {
        title: "Dados Correspondentes",
        content: [
          "Lugarejo/Povoado/Aldeia: 1d8 (resultados 1-8)",
          "Vilarejo/Vila Grande: 1d12 (resultados 1-12)",
          "Cidadela: 1d20 (resultados 1-20)",
          "Cidade Grande: 1d20+4 (resultados 5-24)",
          "Metrópole: 1d20+8 (resultados 9-28)",
        ],
      },
      {
        title: "Implicações Narrativas",
        content: [
          "Assentamentos menores têm sedes mais humildes mas podem ser mais pessoais.",
          "Grandes cidades permitem operações complexas e recursos abundantes.",
          "O tipo de assentamento afeta que tipo de aventuras e contratos estão disponíveis.",
          "Considere a economia local - uma aldeia de pescadores terá problemas diferentes de uma cidadela militar.",
        ],
      },
    ],
    tips: [
      "Use o contraste entre diferentes tipos de sede para variar a experiência.",
      "Sedes em assentamentos menores podem ter charme pessoal único.",
      "Grandes cidades permitem tramas políticas e operações de larga escala.",
      "Considere a jornada entre diferentes sedes como parte da aventura.",
    ],
    examples: [
      {
        title: "Escritório em Taverna (Lugarejo)",
        description:
          "Uma mesa no canto da taverna local, atendida pela filha do taverneiro nas manhãs. Conhece todos os problemas locais pessoalmente.",
      },
      {
        title: "Complexo Metropolitano",
        description:
          "Edifício de três andares com portais de teletransporte, biblioteca, salas de reunião e dormitórios para membros visitantes.",
      },
    ],
  },
};
