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
  description: string;
  sections: HelpSection[];
  tips?: string[];
  examples?: HelpExample[];
}

export const contractHelpData: Record<string, HelpData> = {
  "contract-overview": {
    title: "Sistema de Contratos da Guilda",
    description:
      "Os contratos são uma parte essencial da dinâmica de uma guilda, permitindo que aventureiros se unam para cumprir missões, resolver problemas e ganhar recompensas.",
    sections: [
      {
        title: "Como Funcionam os Contratos",
        content: [
          'Cada contrato representa uma "missão" ou "aventura" em um RPG.',
          "A quantidade de contratos disponíveis depende do tamanho da sede da guilda.",
          "Contratos novos surgem de tempos em tempos baseado no sistema de timeline.",
          "Cada contrato possui valor em experiência (XP) e recompensa em moedas de ouro (PO$).",
          'O valor em XP serve como "orçamento" para o mestre criar desafios apropriados.',
        ],
      },
      {
        title: "Primeira Visita à Sede",
        content: [
          "Ao entrar pela primeira vez em uma sede, role para descobrir quantos contratos estão disponíveis.",
          "Nem todos os contratos gerados estarão disponíveis - alguns podem ter sido aceitos por outros aventureiros.",
          "A redução de contratos depende do nível de frequentadores da sede.",
        ],
      },
      {
        title: "Sistema de Valores",
        content: [
          "O valor em XP é usado pelo mestre como orçamento para criar desafios.",
          "A recompensa em PO$ é calculada multiplicando o valor por 0.1.",
          "Jogadores percebem a dificuldade através da recompensa oferecida.",
          "Contratos são gerados aleatoriamente, então nem sempre estarão balanceados com o nível dos jogadores.",
        ],
      },
    ],
    tips: [
      "Use o valor em XP como guia para balancear encontros, armadilhas e desafios sociais.",
      "Nem sempre os jogadores ganharão todo o XP - depende de como resolvem os desafios.",
      "Contratos com recompensas altas geralmente indicam desafios mais perigosos.",
      "Considere as relações da guilda com governo e população ao narrar os contratos.",
    ],
    examples: [
      {
        title: "Contrato Simples",
        description:
          "Valor 500 XP/PO$ = 50 moedas de ouro de recompensa + orçamento de 500 XP para criar desafios apropriados.",
      },
      {
        title: "Contrato Complexo",
        description:
          "Valor 5000 XP/PO$ = 500 moedas de ouro + múltiplos encontros, NPCs importantes e desafios elaborados.",
      },
    ],
  },

  "contract-quantity": {
    title: "Quantidade e Prazos de Contratos",
    description:
      "A quantidade de contratos disponíveis e seus prazos são determinados pelo tamanho da sede, funcionários e suas condições.",
    sections: [
      {
        title: "Dados por Tamanho da Sede",
        content: [
          "Sedes maiores atraem mais contratantes, resultando em mais contratos.",
          "Os dados usados são equivalentes à estrutura da sede da guilda.",
          "Minúsculo: 1d4 | Muito pequeno: 1d6 | Pequeno: 1d6+1",
          "Mediano: 1d8+2 | Grande: 1d10+2 | Luxuoso: 1d12+4",
          "Enorme: 1d20+4 | Colossal: 1d20+8 | Colossal primorosa: 1d20+10",
        ],
      },
      {
        title: "Modificadores por Funcionários",
        content: [
          "Funcionários despreparados: -1 ao resultado final",
          "Funcionários experientes: +1 ao resultado final",
          "Estes modificadores afetam tanto quantidade quanto prazos.",
        ],
      },
      {
        title: "Redução por Frequentadores",
        content: [
          "Sedes muito movimentadas têm menos contratos disponíveis.",
          "Vazia: Todos disponíveis | Quase deserta: -1 contrato",
          "Pouco movimentada: -1d4 | Normal: -1d6+1",
          "Muito frequentada: -2d6 | Abarrotada: -3d6 | Lotada: -4d6",
          "Se o saldo ficar negativo, retire dos próximos contratos rolados.",
        ],
      },
    ],
    tips: [
      "Sedes menores podem ter contratos mais interessantes narrativamente.",
      'Use a redução por frequentadores para criar tensão - "alguém pegou antes de vocês".',
      "Funcionários experientes não apenas atraem mais contratos, mas também analisam melhor a dificuldade.",
      "Contratos sem prazo oferecem mais flexibilidade narrativa.",
    ],
    examples: [
      {
        title: "Sede Movimentada",
        description:
          "Uma sede grande (1d10+2) muito frequentada (-2d6) pode ter de 0 a 6 contratos disponíveis.",
      },
      {
        title: "Sede Isolada",
        description:
          "Uma sede pequena (1d6+1) quase deserta (-1) ainda oferece contratos exclusivos para aventureiros corajosos.",
      },
    ],
  },

  "contract-values": {
    title: "Valores e Recompensas",
    description:
      "Sistema de determinação do valor em experiência e recompensa em moedas de ouro para cada contrato.",
    sections: [
      {
        title: "Tabela Base 1d100",
        content: [
          "Todos os contratos rolam 1d100 na tabela base, independente do assentamento.",
          "Valores variam de 75 (rolagens 1-8) até 50.000 (rolagem 100).",
          "O mesmo valor é usado inicialmente para XP e recompensa.",
          "Modificadores são aplicados após a rolagem inicial.",
        ],
      },
      {
        title: "Sistema de Modificadores",
        content: [
          "Distância: Contratos distantes valem mais (+5 a +20), próximos valem menos (-5 a -20).",
          "Relações com governo: Péssima (-25/-25) até Excelente (+5/+10).",
          "Relações com população: Péssima (+5/-20) até Excelente (+0/+5).",
          "Funcionários: Despreparados (-2 na rolagem) vs Experientes (+2 na rolagem).",
          "Dificuldade: Fácil (1x/1x) | Médio (2x/1.3x) | Difícil (4x/2x) | Mortal (8x/3x).",
        ],
      },
      {
        title: "Uso dos Valores",
        content: [
          "Valor XP = orçamento do mestre para criar desafios.",
          "Recompensa PO$ = valor final multiplicado por 0.1.",
          "Exemplo: 1000 valor = 1000 XP para desafios + 100 PO$ de recompensa.",
          "Jogadores não veem o valor XP, apenas a recompensa oferecida.",
        ],
      },
    ],
    tips: [
      "Use o orçamento XP para balancear criaturas, armadilhas, enigmas e desafios sociais.",
      "Nem sempre os jogadores ganharão todo o XP - depende das escolhas que fazem.",
      "Recompensas muito altas podem indicar contratos perigosos ou com pegadinhas.",
      "Considere que aventureiros podem evitar desafios com criatividade.",
    ],
    examples: [
      {
        title: "Contrato Balanceado",
        description:
          "Valor base 1000, relação neutra, distância média = 1000 XP para desafios + 100 PO$ de recompensa.",
      },
      {
        title: "Contrato Perigoso",
        description:
          "Valor base 2000, dificuldade Mortal = 16.000 XP para desafios épicos + 600 PO$ de recompensa.",
      },
    ],
  },

  "contract-requirements": {
    title: "Pré-requisitos e Cláusulas",
    description:
      "Sistema de exigências especiais e condições adicionais que podem ser impostas aos contratos.",
    sections: [
      {
        title: "Pré-requisitos de Contratos",
        content: [
          "Baseados no valor final do contrato - contratos mais valiosos têm mais exigências.",
          "Podem incluir: renome mínimo, habilidades específicas, equipamentos.",
          "Exemplos: conjurador, perícia em Força, veículo de carga, 50 de renome.",
          "Grupo mínimo de 6 membros para contratos mais complexos.",
          "Cada pré-requisito adiciona +5 à recompensa do contrato.",
        ],
      },
      {
        title: "Cláusulas Adicionais",
        content: [
          "Condições especiais que devem ser seguidas durante a missão.",
          "Nenhum inimigo deve ser morto, sigilo absoluto, horário específico.",
          "Troféu obrigatório, supervisor deve ser protegido, relatório escrito.",
          "Competição com outros grupos, propriedade de tesouros.",
          "Cada cláusula adiciona +5 à recompensa do contrato.",
        ],
      },
      {
        title: "Quebra de Contrato",
        content: [
          "Gera multa de 10% da recompensa em PO$.",
          "Se não puder pagar: processo, contrato sem recompensa, trabalho na guilda.",
          "Em caso de morte: guilda pode se apropriar dos bens.",
          "Alguns membros são conhecidos por recolher pertences de fatalidades.",
        ],
      },
    ],
    tips: [
      "Use pré-requisitos para criar contratos exclusivos para grupos específicos.",
      "Cláusulas podem criar reviravoltas interessantes na narrativa.",
      "Competição entre grupos pode gerar tensão e urgência.",
      "Considere as consequências de quebrar contratos na reputação do grupo.",
    ],
    examples: [
      {
        title: "Contrato Exclusivo",
        description:
          "Requer conjurador arcano + 25 de renome = apenas grupos estabelecidos e preparados podem aceitar.",
      },
      {
        title: "Missão Diplomática",
        description:
          'Cláusula "nenhum inimigo morto" + supervisor = missão de negociação delicada.',
      },
    ],
  },

  "contract-contractors": {
    title: "Tipos de Contratantes",
    description:
      "Diferentes tipos de pessoas e organizações que podem contratar os serviços da guilda.",
    sections: [
      {
        title: "Contratantes do Povo",
        content: [
          "Cidadãos comuns, comerciantes, artesãos e pequenos empresários.",
          "Problemas pessoais, questões comerciais, proteção familiar.",
          "Geralmente oferecem recompensas menores mas histórias pessoais.",
          "Podem ser mais flexíveis com prazos e métodos.",
        ],
      },
      {
        title: "Instituições de Ofício",
        content: [
          "Guildas de comerciantes, ordens religiosas, academias arcanas.",
          "Problemas organizacionais, questões profissionais específicas.",
          "Recompensas moderadas com possível apoio institucional.",
          "Contratos técnicos que podem requerer conhecimento especializado.",
        ],
      },
      {
        title: "Governo Local",
        content: [
          "Líderes oficiais, guardas, representantes da lei.",
          "Questões de segurança pública, diplomacia, aplicação da lei.",
          "Recompensas variam conforme relação com o governo.",
          "Podem oferecer autoridade oficial e recursos governamentais.",
        ],
      },
    ],
    tips: [
      "Varie os tipos de contratantes para criar diversidade narrativa.",
      "Contratantes do povo criam conexões emocionais mais fortes.",
      "Governo oferece legitimidade mas pode ter agenda política.",
      "Instituições podem oferecer recompensas únicas (conhecimento, equipamentos).",
    ],
    examples: [
      {
        title: "Drama Pessoal",
        description:
          "Uma mãe desesperada contrata a guilda para encontrar seu filho desaparecido.",
      },
      {
        title: "Questão Oficial",
        description:
          "O capitão da guarda precisa de aventureiros para investigar contrabando nos portos.",
      },
    ],
  },

  "contract-objectives": {
    title: "Objetivos de Contratos",
    description:
      "Diferentes tipos de missões e tarefas que podem ser solicitadas pelos contratantes.",
    sections: [
      {
        title: "Categorias Principais",
        content: [
          "Eliminação: Derrotar criaturas, bandidos ou ameaças específicas.",
          "Escolta: Proteger pessoas ou caravanas durante viagens.",
          "Investigação: Descobrir informações, resolver mistérios.",
          "Recuperação: Encontrar objetos, pessoas ou locais perdidos.",
          "Diplomacia: Negociar acordos, resolver conflitos pacificamente.",
        ],
      },
      {
        title: "Especificações por Objetivo",
        content: [
          "Cada categoria tem subcategorias detalhadas.",
          "Eliminação pode ser: bandidos, monstros, pragas urbanas.",
          "Escolta varia: mercadores, diplomatas, caravanas valiosas.",
          "Investigação inclui: crimes, mistérios arcanos, espionagem.",
          "Recuperação: tesouros, pessoas, informações perdidas.",
        ],
      },
      {
        title: "Adaptação Narrativa",
        content: [
          "Use o objetivo como base, mas adapte à sua campanha.",
          "Combine diferentes elementos para criar missões únicas.",
          "Considere como o objetivo se relaciona com o contratante.",
          "Pense nas consequências de sucesso ou falha.",
        ],
      },
    ],
    tips: [
      "Combine objetivos diferentes para criar missões mais complexas.",
      "Use o valor XP para determinar a escala dos desafios.",
      "Considere motivações ocultas dos contratantes.",
      "Prepare consequências interessantes para diferentes abordagens.",
    ],
    examples: [
      {
        title: "Missão Simples",
        description:
          "Eliminar lobos que atacam fazendas próximas - objetivo direto com combate.",
      },
      {
        title: "Missão Complexa",
        description:
          "Investigar desaparecimentos + Escolta de testemunha + Diplomacia com suspeitos.",
      },
    ],
  },

  "contract-locations": {
    title: "Localidades de Contratos",
    description:
      "Diferentes tipos de locais onde as missões dos contratos podem ocorrer.",
    sections: [
      {
        title: "Tipos de Localidades",
        content: [
          "Urbanas: Dentro da cidade, bairros específicos, edifícios importantes.",
          "Rurais: Fazendas, estradas, pequenas comunidades rurais.",
          "Selvagens: Florestas, montanhas, pântanos e outros ambientes naturais.",
          "Subterrâneas: Cavernas, masmorras, túneis e complexos enterrados.",
          "Aquáticas: Rios, lagos, costas marítimas e embarcações.",
        ],
      },
      {
        title: "Características Específicas",
        content: [
          "Cada tipo de localidade tem características únicas.",
          "Localidades urbanas podem ter política complexa e testemunhas.",
          "Ambientes selvagens oferecem perigos naturais e criaturas.",
          "Locais subterrâneos são claustrofóbicos com navegação limitada.",
          "Áreas aquáticas requerem preparação especial e equipamentos.",
        ],
      },
      {
        title: "Integração com Distância",
        content: [
          "A distância afeta o valor do contrato e sua dificuldade.",
          "Locais próximos (1-2 hexágonos) reduzem o valor.",
          "Locais distantes (6+ hexágonos) aumentam significativamente o valor.",
          "Considere tempo de viagem e recursos necessários.",
        ],
      },
    ],
    tips: [
      "Use localidades para criar atmosferas específicas.",
      "Combine tipo de local com objetivo para máximo impacto narrativo.",
      "Considere logística: como os aventureiros chegarão lá?",
      "Locais distantes podem justificar recompensas maiores.",
    ],
    examples: [
      {
        title: "Mistério Urbano",
        description:
          "Investigação em bairro nobre da cidade - política, intriga e testemunhas nervosas.",
      },
      {
        title: "Expedição Selvagem",
        description:
          "Eliminar bandidos em floresta distante - sobrevivência, combate e navegação.",
      },
    ],
  },

  "contract-antagonists": {
    title: "Antagonistas de Contratos",
    description:
      "Diferentes tipos de oposição que os aventureiros podem enfrentar durante as missões.",
    sections: [
      {
        title: "Categorias de Antagonistas",
        content: [
          "Humanoides: Bandidos, cultistas, mercenários, espiões.",
          "Monstros: Bestas selvagens, aberrações, mortos-vivos.",
          "Naturais: Desastres, pragas, fenômenos climáticos.",
          "Políticos: Corrupção, burocracia, conflitos de interesse.",
          "Arcanos: Magia descontrolada, entidades planares, maldições.",
        ],
      },
      {
        title: "Detalhamento por Categoria",
        content: [
          "Cada categoria tem subcategorias específicas.",
          "Bandidos podem ser: saqueadores, contrabandistas, assassinos.",
          "Monstros variam: predadores territoriais, invasores planares.",
          "Problemas naturais: pragas de insetos, doenças, clima extremo.",
          "Política inclui: funcionários corruptos, leis injustas.",
        ],
      },
      {
        title: "Balanceamento com Valor XP",
        content: [
          "Use o valor XP do contrato para dimensionar antagonistas.",
          "Contratos de baixo valor = ameaças locais simples.",
          "Contratos de alto valor = antagonistas poderosos ou múltiplos.",
          "Considere tanto o desafio quanto a narrativa.",
        ],
      },
    ],
    tips: [
      "Varie antagonistas para manter o interesse dos jogadores.",
      "Nem todo antagonista precisa ser combatido - alguns podem ser negociados.",
      "Use motivações claras para tornar antagonistas mais interessantes.",
      "Considere consequências de diferentes abordagens para lidar com eles.",
    ],
    examples: [
      {
        title: "Ameaça Simples",
        description:
          "Grupo de bandidos atacando comerciantes - combate direto com motivação simples (ganância).",
      },
      {
        title: "Ameaça Complexa",
        description:
          "Cult liderado por mago corrompido + demônio invocado + autoridades subornadas.",
      },
    ],
  },

  "contract-complications": {
    title: "Complicações e Reviravoltas",
    description:
      "Elementos que podem tornar os contratos mais interessantes e desafiadores além do objetivo básico.",
    sections: [
      {
        title: "Tipos de Complicações",
        content: [
          "Informações falsas ou incompletas do contratante.",
          "Interferência de terceiros com agendas próprias.",
          "Problemas logísticos: clima, equipamentos, suprimentos.",
          "Dilemas morais que complicam o objetivo simples.",
          "Revelações que mudam completamente a natureza da missão.",
        ],
      },
      {
        title: "Elementos de Reviravolta",
        content: [
          "O verdadeiro vilão não é quem parece ser inicialmente.",
          "O objeto/pessoa procurada tem significado maior.",
          "Aliados se revelam traidores ou vice-versa.",
          "A missão é teste ou parte de algo maior.",
          "Consequências imprevistas das ações dos aventureiros.",
        ],
      },
      {
        title: "Consequências Severas",
        content: [
          "Falhar pode ter repercussões além da perda de recompensa.",
          "Sucesso parcial pode gerar novos problemas.",
          "Ações durante a missão afetam relações futuras.",
          "Escolhas morais têm consequências duradouras.",
        ],
      },
    ],
    tips: [
      "Use complicações para aprofundar a narrativa, não apenas dificultar.",
      "Reviravoltas devem fazer sentido em retrospecto.",
      "Nem todo contrato precisa de complicação - simplicidade também tem valor.",
      "Considere como complicações afetam personagens individualmente.",
    ],
    examples: [
      {
        title: "Reviravolta Clássica",
        description:
          'Contrato para eliminar "bandidos" revela que são rebeldes lutando contra tirano local.',
      },
      {
        title: "Complicação Logística",
        description:
          "Escolta simples complicada por tempestade que força desvio por território hostil.",
      },
    ],
  },

  "contract-allies": {
    title: "Aliados e Recompensas Extras",
    description:
      "Personagens que podem ajudar os aventureiros e benefícios adicionais que podem surgir durante as missões.",
    sections: [
      {
        title: "Aparição de Aliados",
        content: [
          "NPCs que podem auxiliar durante a missão.",
          "Podem aparecer no início, meio ou final da missão.",
          "Motivações variadas: gratidão, interesse próprio, coincidência.",
          "Habilidades complementares às do grupo.",
          "Podem oferecer conhecimento local, contatos ou recursos.",
        ],
      },
      {
        title: "Tipos de Aliados",
        content: [
          "Especialistas: guias locais, sábios, artesãos.",
          "Combatentes: guardas, mercenários, outros aventureiros.",
          "Sociais: nobres, comerciantes, funcionários públicos.",
          "Arcanos: magos, clérigos, estudiosos.",
          "Informacionais: espiões, batedores, informantes.",
        ],
      },
      {
        title: "Recompensas Adicionais",
        content: [
          "Podem surgir além da recompensa base do contrato.",
          "Itens mágicos, informações valiosas, contatos importantes.",
          "Favores futuros, acesso a locais restritos.",
          "Reconhecimento público, títulos honorários.",
          "Oportunidades de negócio ou aventuras futuras.",
        ],
      },
    ],
    tips: [
      "Use aliados para compensar fraquezas do grupo.",
      "Aliados temporários criam dinâmicas interessantes.",
      "Recompensas extras motivam exploração além do objetivo mínimo.",
      "Considere como aliados podem retornar em aventuras futuras.",
    ],
    examples: [
      {
        title: "Guia Local",
        description:
          "Caçador veterano que conhece atalhos secretos e perigos da região.",
      },
      {
        title: "Descoberta Valiosa",
        description:
          "Durante missão de resgate, grupo encontra mapa de tesouro antigo como recompensa extra.",
      },
    ],
  },

  "contract-payment": {
    title: "Tipos de Pagamento",
    description:
      "Diferentes formas como as recompensas dos contratos podem ser disponibilizadas aos aventureiros.",
    sections: [
      {
        title: "Modalidades de Pagamento",
        content: [
          "Pagamento total na guilda em PO$ (mais comum e seguro).",
          "Pagamento direto com contratante (pode ter riscos).",
          "Metade com guilda, metade com contratante (balanceado).",
          "Pagamento em materiais, joias ou bens (variável).",
          "Combinação de PO$ e serviços do contratante.",
        ],
      },
      {
        title: "Segurança dos Pagamentos",
        content: [
          "Guilda oferece mais segurança - pagamento garantido.",
          "Pagamento antecipado com guilda protege contra calotes.",
          "Pagamento direto pode ser mais arriscado mas às vezes mais vantajoso.",
          "Contratos de alto valor geralmente usam guilda como intermediária.",
          "Falhar em pagar pode resultar em consequências legais graves.",
        ],
      },
      {
        title: "Variações Especiais",
        content: [
          "Alguns contratantes não têm dinheiro mas oferecem bens valiosos.",
          "Serviços podem incluir: trabalho especializado, informações, favores.",
          "Materiais podem ser: equipamentos, gemas, obras de arte.",
          "Combinações permitem maior flexibilidade para ambas as partes.",
        ],
      },
    ],
    tips: [
      "Use variações de pagamento para criar narrativas interessantes.",
      "Contratantes pobres podem oferecer recompensas criativas.",
      "Pagamentos em bens podem valer mais ou menos que o esperado.",
      "Considere o que os aventureiros mais precisam no momento.",
    ],
    examples: [
      {
        title: "Pagamento Seguro",
        description:
          "Mercador próspero deixa 500 PO$ com a guilda antes da partida dos aventureiros.",
      },
      {
        title: "Pagamento Criativo",
        description:
          "Ferreiro oferece equipamentos personalizados + uma gema rara ao invés de moedas.",
      },
    ],
  },

  "contract-lifecycle": {
    title: "Ciclo de Vida dos Contratos",
    description:
      "Como os contratos evoluem ao longo do tempo, desde sua criação até resolução final.",
    sections: [
      {
        title: "Conclusões Automáticas",
        content: [
          "Contratos podem ser resolvidos automaticamente após certo tempo.",
          "Outros aventureiros podem aceitar e completar contratos disponíveis.",
          "Problemas podem se resolver naturalmente ou piorar.",
          "Prazos vencidos podem tornar contratos impossíveis de completar.",
        ],
      },
      {
        title: "Contratos Assinados por Outros",
        content: [
          "Rolagem periódica determina o que acontece com contratos aceitos.",
          "1-12: Contrato resolvido com sucesso.",
          "13-16: Contrato não resolvido (podem retornar).",
          "17-18: Resolvido mas com ressalvas.",
          "19-20: Ainda não se sabe o resultado.",
        ],
      },
      {
        title: "Contratos Não Assinados",
        content: [
          "Contratos não aceitos podem ter vários destinos.",
          "Podem ser resolvidos por NPCs, cancelados ou modificados.",
          "Problemas urgentes podem atrair outros solucionadores.",
          "Alguns problemas podem piorar se ignorados.",
        ],
      },
    ],
    tips: [
      "Use resoluções automáticas para criar sensação de mundo vivo.",
      'Contratos "perdidos" podem gerar arrependimento e urgência.',
      "Considere as consequências de problemas não resolvidos.",
      "NPCs competindo cria pressão temporal natural.",
    ],
    examples: [
      {
        title: "Oportunidade Perdida",
        description:
          "Grupo hesita em aceitar contrato lucrativo, que é pego por aventureiros rivais.",
      },
      {
        title: "Problema Agravado",
        description:
          "Pragas não eliminadas se espalham, criando crise maior na região.",
      },
    ],
  },
};
