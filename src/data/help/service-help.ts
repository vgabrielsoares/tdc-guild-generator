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

export const serviceHelpData: Record<string, HelpData> = {
  "service-overview": {
    title: "Gerador de Serviços da Guilda",
    description:
      "Serviços são tarefas curtas, de baixo risco e recompensa, geradas pela sede da guilda. Use-os como ganchos rápidos e atividades de curto prazo para jogadores.",
    sections: [
      {
        title: "Quantidade e Prazos",
        content: [
          "A quantidade de serviços e seus prazos dependem do tamanho da sede, do número/condição dos funcionários e do nível de frequentadores.",
          "Dados por tamanho da sede (ex.: Minúsculo 1d4, Muito pequeno 1d6, Pequeno 1d6+1, Mediano 1d8+2, etc.).",
          "Modificadores: funcionários despreparados -1; funcionários experientes +1.",
          "Redução por frequentadores pode diminuir o número disponível (ex.: Quase deserta -1d4, Lotada -3d6+1).",
        ],
      },
      {
        title: "Prazos e Resolução Automática",
        content: [
          "Prazos são rolados em 1d20 (ex.: 1 = 1d4 dias, 2 = 3 dias, 11-20 = sem prazo).",
          "Serviços podem ser resolvidos automaticamente após um tempo (tabelas específicas para assinados e não-assinados).",
          "As rolagens de resolução são feitas uma vez por guilda e não por serviço individualmente.",
        ],
      },
      {
        title: "Contratante e Tipo de Pagamento",
        content: [
          "Contratantes podem ser Povo, Instituições de Ofício ou Governo (1d20 com modificadores por relações).",
          "Tipo de pagamento varia (1-10 pagamento direto em PO$, 11-14 metade guilda/metade contratante, 17-20 pagamento total na guilda, etc.).",
        ],
      },
    ],
    tips: [
      "Use serviços para recompensas rápidas e ganchos narrativos sem colocar a vida dos jogadores em risco.",
      "Considere permitir pagamentos adiantados para serviços com risco de não pagamento pelo contratante.",
      'Repita o processo de geração quando a tabela de "Novos serviços em" indicar chegada de novos serviços.',
    ],
    examples: [
      {
        title: "Serviço Simples",
        description:
          "Encontrar um animal perdido para um camponês (prazo curto, pagamento em PO$ direto, contratante: povo).",
      },
      {
        title: "Serviço Oficial",
        description:
          "Remover pragas de um depósito para um agente do governo (prazo fixo, pagamento na guilda, contratante: governo com agente específico).",
      },
    ],
  },

  "service-contractors": {
    title: "Contratantes e Tipos",
    description:
      "Explicação sobre os tipos de contratantes que solicitam serviços e como isso afeta pagamento e relações.",
    sections: [
      {
        title: "Tipos de Contratantes",
        content: [
          "Povo: contratantes comuns e camponeses.",
          "Instituições de Ofício: guildas, comerciantes e mestres de ofício.",
          "Governo: agentes oficiais.",
        ],
      },
      {
        title: "Impacto nas Recompensas e Modificadores",
        content: [
          "A origem do contratante pode aplicar modificadores ao valor base (ex.: contratos governamentais tendem a oferecer maiores recompensas).",
          "Relações com governo ou população podem aumentar/diminuir o valor efetivo recebido.",
        ],
      },
      {
        title: "Segurança e Confiança",
        content: [
          "Contratantes públicos geralmente são mais confiáveis quanto ao pagamento, mas podem exigir garantias ou agentes de verificação.",
          "Contratantes do povo podem não pagar integralmente se houver risco; considere opções de pagamento antecipado na guilda.",
        ],
      },
    ],
    tips: [
      "Considere ajustar prazos e condições com base no tipo de contratante.",
      "Para serviços de alto valor, prefira garantias (pagamento na guilda) quando o contratante for desconhecido.",
    ],
  },

  "service-quantity-and-deadlines": {
    title: "Quantidade de Serviços e Prazos",
    description:
      "Como gerar a quantidade de serviços disponíveis e seus prazos, seguindo as regras do manual de Serviços.",
    sections: [
      {
        title: "Dados por Tamanho da Sede",
        content: [
          "Minúsculo: 1d4 | Muito pequeno: 1d6 | Pequeno e modesto/confortável: 1d6+1",
          "Mediano e comum/Mediano em dobro: 1d8+2 | Grande: 1d10+2 | Luxuosamente grande: 1d12+4",
          "Enorme/Enorme e confortável: 1d20+4 | Colossal: 1d20+8 | Colossal primorosa: 1d20+10",
        ],
      },
      {
        title: "Modificadores por Condição",
        content: [
          "Funcionários despreparados: -1 ao resultado final.",
          "Funcionários experientes: +1 ao resultado final.",
        ],
      },
      {
        title: "Redução por Frequentadores",
        content: [
          "Vazia: Todos os serviços estão disponíveis.",
          "Quase deserta: -1d4 serviços | Pouco movimentada: -1d6 serviços",
          "Nem muito nem pouco: -1d8+1 | Muito frequentada: -1d12+1",
          "Abarrotada: -2d6+2 | Lotada: -3d6+1",
          "Nota: Se o saldo ficar negativo, retire do próximo rolamento de serviços.",
        ],
      },
    ],
    tips: [
      "Aplique modificadores na rolagem inicial e depois ajuste pela redução de frequentadores.",
    ],
  },

  "service-automatic-resolutions": {
    title: "Resoluções Automáticas e Tempos de Resolução",
    description:
      "Como e quando rolar resoluções automáticas para serviços assinados e não-assinados.",
    sections: [
      {
        title: "Tempo de Resolução",
        content: [
          "Serviço Firmado: rolagem 1d20 determina em quantos dias rolar a tabela de resoluções (ex.: 1-6 => 1d6 dias, 7-8 => 1 semana, 19 => 3 semanas, 20 => 2d8 dias).",
          "Serviço Não-Assinado: há outra tabela (ex.: 1-4 => 3 dias, 5-6 => 4 dias, 20 => 1 dia).",
          "As rolagens de resolução devem ser feitas uma vez por guilda para a leva de serviços assinados e outra para os não-assinados.",
        ],
      },
      {
        title: "Resultados Possíveis",
        content: [
          "Para serviços firmados: 1-12 resolvido; 13-16 não resolvido (role motivo); 17-18 resolvido com ressalvas; 19-20 ainda não se sabe (role na próxima leva).",
          "Para não-assinados: resultados variam de nenhum resolvido até vários (ex.: 1-2 nenhum assinado; 3-5 todos resolvidos; 13-14 1d4 serviços resolvidos).",
        ],
      },
      {
        title: "Motivos para Não Resolução",
        content: [
          "1-6 Desistência | 7 Picaretagem do contratante (anular) | 8-14 Lesões graves | 15-17 Prazo não cumprido | 18-19 Cláusula não cumprida | 20 Contratante desaparecido (anular se local).",
        ],
      },
    ],
    tips: [
      "Serviços anulados não voltam a ficar disponíveis.",
      "Serviços não resolvidos podem receber recompensa adicional pela guilda para manter reputação (Taxa de recorrência).",
    ],
  },

  "service-new-and-when": {
    title: "Novos e Antigos Serviços",
    description:
      "Quando rolar para criar novos serviços e como interpretar os resultados.",
    sections: [
      {
        title: "Novos Serviços Em",
        content: [
          "1-4: 1d4 meses | 5-8: 2d4+1 semanas | 9-10: 1d4+1 semanas | 11-12: 1 mês | 13-14: 2d6 dias | 15: 1 semana",
          "16: 2d4 dias | 17-18: 1d8 dias | 19: 1d6 dias | 20: 1d4 dias",
        ],
      },
    ],
    tips: [
      'Repita a geração quando a data de "Novos serviços" expirar para atualizar a lista disponível.',
    ],
  },

  "service-lifecycle": {
    title: "Ciclo de Vida dos Serviços",
    description:
      "Explica como os serviços evoluem no tempo: geração periódica, resolução automática, competição com NPCs e alteração de status.",
    sections: [
      {
        title: "Geração e Novas Levas",
        content: [
          "Serviços são gerados periodicamente conforme a configuração da guilda e eventos programados.",
          "Verifique a tabela 'Novos serviços em' para entender quando novas levas aparecem.",
        ],
      },
      {
        title: "Resolução Automática",
        content: [
          "A cada ciclo, a guilda realiza rolagens que podem resolver parcialmente ou totalmente alguns serviços.",
          "Serviços assinados e não-assinados possuem tabelas separadas de resolução.",
        ],
      },
      {
        title: "Competição e Perda",
        content: [
          "NPCs e outros grupos podem competir pelos mesmos serviços; alguns podem ser aceitos por terceiros.",
          "Serviços com prazos podem expirar e serem removidos da lista.",
        ],
      },
    ],
    tips: [
      "Monitore a timeline do módulo para identificar levas e resoluções automáticas.",
      "Serviços não resolvidos podem receber bônus de recorrência para torná-los atraentes.",
    ],
  },

  "service-difficulty": {
    title: "Sistema de Dificuldade dos Serviços",
    description:
      "Como a dificuldade afeta os testes e a recompensa dos serviços.",
    sections: [
      {
        title: "Níveis de Dificuldade",
        content: [
          "Muito Fácil (ND 10): Tarefas triviais que qualquer pessoa pode executar",
          "Fácil (ND 14): Tarefas simples que requerem alguma habilidade básica",
          "Médio (ND 16): Tarefas que exigem competência e experiência",
          "Difícil (ND 20): Tarefas complexas que desafiam aventureiros experientes",
          "Extremamente Difícil (ND 25): Tarefas que testam os limites das habilidades",
        ],
      },
      {
        title: "Complexidade",
        content: [
          "Simples: Apenas um teste é necessário",
          "Complexa: Múltiplos testes ou abordagens diferentes",
          "Extremamente complexa: Sequência elaborada de testes e decisões",
        ],
      },
    ],
    tips: [
      "ND mais alto = maior dificuldade = maior recompensa",
      "A complexidade afeta quantos testes serão necessários",
    ],
  },

  "service-rewards": {
    title: "Sistema de Recompensas",
    description: "Como são calculadas as recompensas dos serviços.",
    sections: [
      {
        title: "Cálculo de Recompensa",
        content: [
          "Valor base rolado + modificadores da sede da guilda",
          "Modificadores por relações (governo/população)",
          "Modificadores por funcionários da guilda",
          "Bônus de recorrência para serviços não resolvidos anteriormente",
        ],
      },
      {
        title: "Taxa de Recorrência",
        content: [
          "Serviços que não foram resolvidos por outros ganham recompensa adicional",
          "Este bônus é oferecido pela guilda para manter sua reputação",
          "Incentiva aventureiros a pegarem serviços 'deixados para trás'",
        ],
      },
    ],
    tips: [
      "Serviços com maior dificuldade têm recompensas proporcionalmente maiores",
      "Guildas com melhor infraestrutura oferecem valores mais altos",
    ],
  },

  "service-terms": {
    title: "Prazos e Formas de Pagamento",
    description:
      "Como funcionam os prazos e diferentes tipos de pagamento dos serviços.",
    sections: [
      {
        title: "Tipos de Prazo",
        content: [
          "Sem prazo: Serviço pode ser feito a qualquer momento",
          "Prazo arbitrário: Flexível, o importante é cumprir a tarefa",
          "Janela específica: Deve ser feito dentro do período exato",
          "Prazos variam de 1d4 dias até várias semanas",
        ],
      },
      {
        title: "Formas de Pagamento",
        content: [
          "Pagamento direto: Receba diretamente do contratante após conclusão",
          "Pagamento na guilda: Valor depositado antecipadamente na sede",
          "Pagamento misto: Parte na guilda, parte com contratante",
          "Pagamento em bens: Materiais, serviços ou outros itens",
        ],
      },
    ],
    tips: [
      "Pagamento antecipado na guilda é mais seguro",
      "Pagamento direto pode ser arriscado com contratantes mal-intencionados",
    ],
  },
};
