import type { TableEntry } from "@/types/tables";
import { ServicePaymentType } from "@/types/service";

// ===== TABELAS BASE DE SERVIÇOS =====

// Implementa as tabelas fundamentais: quantidade, valores, prazos e tipos de pagamento
// Baseado em: "[2-2] Serviços - Guilda.md"

// ===== DADOS POR TAMANHO DA SEDE =====

// Reutiliza a mesma estrutura de contratos
// "Os dados usados em 'Quantidade e Prazos' é equivalente à estrutura da sede da guilda"
export const SERVICE_DICE_BY_SIZE: Record<string, string> = {
  "Minúsculo (3m x 1,5m)": "1d4",
  "Muito pequeno (4,5m x 3m)": "1d6",
  "Pequeno e modesto (6m x 6m)": "1d6+1",
  "Pequeno e confortável (7,5m x 6m, +1 andar)": "1d6+1",
  "Mediano e comum (9m x 9m)": "1d8+2",
  "Mediano em dobro (10,5m x 9m, +1 andar)": "1d8+2",
  "Grande (12m x 12m)": "1d10+2",
  "Luxuosamente grande (12m x 12m, +2 andares)": "1d12+4",
  "Enorme (15m x 15m, +1 andar)": "1d20+4",
  "Enorme e confortável (15m x 15m, +2 andares)": "1d20+4",
  "Colossal (20m x 20m, +1 andar)": "1d20+8",
  "Colossal e primorosa (20m x 20m, +2 andares)": "1d20+10",
};

// ===== MODIFICADORES POR CONDIÇÃO DOS FUNCIONÁRIOS =====

// Mesmo padrão dos contratos: -1 para despreparados, +1 para experientes
export const SERVICE_STAFF_CONDITION_MODIFIERS: Record<string, number> = {
  despreparados: -1,
  experientes: 1,
};

// ===== QUANTIDADE DISPONÍVEL DE SERVIÇOS (1d20) =====

// Interface para representar quantidade de serviços
interface ServiceQuantityResult {
  quantity: string;
}

export const SERVICE_QUANTITY_TABLE: TableEntry<ServiceQuantityResult>[] = [
  {
    min: 1,
    max: 4,
    result: {
      quantity: "1d4 serviços",
    },
  },
  {
    min: 5,
    max: 6,
    result: {
      quantity: "1d4+1 serviços",
    },
  },
  {
    min: 7,
    max: 9,
    result: {
      quantity: "1d6+2 serviços",
    },
  },
  {
    min: 10,
    max: 10,
    result: {
      quantity: "1d8+1 serviços",
    },
  },
  {
    min: 11,
    max: 11,
    result: {
      quantity: "2d6+2 serviços",
    },
  },
  {
    min: 12,
    max: 13,
    result: {
      quantity: "4d4+2 serviços",
    },
  },
  {
    min: 14,
    max: 16,
    result: {
      quantity: "4d6+1 serviços",
    },
  },
  {
    min: 17,
    max: 18,
    result: {
      quantity: "5d6 serviços",
    },
  },
  {
    min: 19,
    max: 19,
    result: {
      quantity: "6d6 serviços",
    },
  },
  {
    min: 20,
    max: 20,
    result: {
      quantity: "5d8+1 serviços",
    },
  },
  {
    min: 21,
    max: 999,
    result: {
      quantity: "5d10 serviços",
    },
  },
];

// ===== REDUÇÃO POR FREQUENTADORES =====

// Interface para representar redução de serviços
interface ServiceReductionResult {
  description: string;
  reduction: string;
}

export const SERVICE_VISITOR_REDUCTION_TABLE: TableEntry<ServiceReductionResult>[] =
  [
    {
      min: 1,
      max: 1,
      result: {
        description: "Vazia",
        reduction: "Todos os serviços estão disponíveis",
      },
    },
    {
      min: 2,
      max: 2,
      result: {
        description: "Quase deserta",
        reduction: "-1d4 serviços",
      },
    },
    {
      min: 3,
      max: 3,
      result: {
        description: "Pouco movimentada",
        reduction: "-1d6 serviços",
      },
    },
    {
      min: 4,
      max: 4,
      result: {
        description: "Nem muito nem pouco",
        reduction: "-1d8+1 serviços",
      },
    },
    {
      min: 5,
      max: 5,
      result: {
        description: "Muito frequentada",
        reduction: "-1d12+1 serviços",
      },
    },
    {
      min: 6,
      max: 6,
      result: {
        description: "Abarrotada",
        reduction: "-2d6+2 serviços",
      },
    },
    {
      min: 7,
      max: 7,
      result: {
        description: "Lotada",
        reduction: "-3d6+1 serviços",
      },
    },
  ];

// ===== PRAZO PARA CONCLUSÃO (1d20) =====

// Interface para representar prazos de serviços
interface ServiceDeadlineResult {
  deadline: string;
}

// Nota importante: "Os prazos de conclusão não usam os dados por tipo de assentamento"
export const SERVICE_DEADLINE_TABLE: TableEntry<ServiceDeadlineResult>[] = [
  {
    min: 1,
    max: 1,
    result: {
      deadline: "1d4 dias",
    },
  },
  {
    min: 2,
    max: 2,
    result: {
      deadline: "3 dias",
    },
  },
  {
    min: 3,
    max: 3,
    result: {
      deadline: "1d4+2 dias",
    },
  },
  {
    min: 4,
    max: 4,
    result: {
      deadline: "1d6+1 dias",
    },
  },
  {
    min: 5,
    max: 5,
    result: {
      deadline: "1d8+2 dias",
    },
  },
  {
    min: 6,
    max: 6,
    result: {
      deadline: "1d12+2 dias",
    },
  },
  {
    min: 7,
    max: 8,
    result: {
      deadline: "1 semana",
    },
  },
  {
    min: 9,
    max: 9,
    result: {
      deadline: "1d4+1 semanas",
    },
  },
  {
    min: 10,
    max: 10,
    result: {
      deadline: "1d20+2 dias",
    },
  },
  {
    min: 11,
    max: 20,
    result: {
      deadline: "Sem prazo",
    },
  },
];

// ===== TIPO DE PAGAMENTO (1d20) =====

// Interface para representar tipos de pagamento
interface ServicePaymentResult {
  type: ServicePaymentType;
  description: string;
  guildPercentage: number;
  contractorPercentage: number;
  includesGoods: boolean;
  includesServices: boolean;
}

export const SERVICE_PAYMENT_TYPE_TABLE: TableEntry<ServicePaymentResult>[] = [
  {
    min: 1,
    max: 10,
    result: {
      type: ServicePaymentType.PAGAMENTO_DIRETO_CONTRATANTE,
      description: "Pagamento em PO$ direto com contratante",
      guildPercentage: 0,
      contractorPercentage: 100,
      includesGoods: false,
      includesServices: false,
    },
  },
  {
    min: 11,
    max: 14,
    result: {
      type: ServicePaymentType.METADE_GUILDA_METADE_CONTRATANTE,
      description: "Metade com a guilda, metade com o contratante",
      guildPercentage: 50,
      contractorPercentage: 50,
      includesGoods: false,
      includesServices: false,
    },
  },
  {
    min: 15,
    max: 15,
    result: {
      type: ServicePaymentType.METADE_GUILDA_METADE_BENS,
      description: "Metade com a guilda, metade, em bens, com o contratante",
      guildPercentage: 50,
      contractorPercentage: 50,
      includesGoods: true,
      includesServices: false,
    },
  },
  {
    min: 16,
    max: 16,
    result: {
      type: ServicePaymentType.MATERIAIS_BENS_SERVICOS,
      description: "Em materiais, bens ou serviços do contratante",
      guildPercentage: 0,
      contractorPercentage: 100,
      includesGoods: true,
      includesServices: true,
    },
  },
  {
    min: 17,
    max: 20,
    result: {
      type: ServicePaymentType.PAGAMENTO_TOTAL_GUILDA,
      description: "Pagamento total na guilda em PO$",
      guildPercentage: 100,
      contractorPercentage: 0,
      includesGoods: false,
      includesServices: false,
    },
  },
];

// ===== TEMPO DE RESOLUÇÃO - SERVIÇOS FIRMADOS (1d20) =====

// Interface para representar tempo de resolução
interface ServiceResolutionTimeResult {
  time: string;
}

export const SERVICE_SIGNED_RESOLUTION_TIME_TABLE: TableEntry<ServiceResolutionTimeResult>[] =
  [
    {
      min: 1,
      max: 6,
      result: {
        time: "1d6 dias",
      },
    },
    {
      min: 7,
      max: 8,
      result: {
        time: "1 semana",
      },
    },
    {
      min: 9,
      max: 9,
      result: {
        time: "2d6+3 dias",
      },
    },
    {
      min: 10,
      max: 11,
      result: {
        time: "1d8+1 dias",
      },
    },
    {
      min: 12,
      max: 12,
      result: {
        time: "2 semanas",
      },
    },
    {
      min: 13,
      max: 13,
      result: {
        time: "2d10 dias",
      },
    },
    {
      min: 14,
      max: 15,
      result: {
        time: "1d4 dias",
      },
    },
    {
      min: 16,
      max: 18,
      result: {
        time: "1d6+3 dias",
      },
    },
    {
      min: 19,
      max: 19,
      result: {
        time: "3 semanas",
      },
    },
    {
      min: 20,
      max: 20,
      result: {
        time: "2d8 dias",
      },
    },
  ];

// ===== TEMPO DE RESOLUÇÃO - SERVIÇOS NÃO-ASSINADOS (1d20) =====

export const SERVICE_UNSIGNED_RESOLUTION_TIME_TABLE: TableEntry<ServiceResolutionTimeResult>[] =
  [
    {
      min: 1,
      max: 4,
      result: {
        time: "3 dias",
      },
    },
    {
      min: 5,
      max: 6,
      result: {
        time: "4 dias",
      },
    },
    {
      min: 7,
      max: 9,
      result: {
        time: "1d4 dias",
      },
    },
    {
      min: 10,
      max: 11,
      result: {
        time: "1d6 dias",
      },
    },
    {
      min: 12,
      max: 13,
      result: {
        time: "1 semana",
      },
    },
    {
      min: 14,
      max: 15,
      result: {
        time: "5 dias",
      },
    },
    {
      min: 16,
      max: 16,
      result: {
        time: "1d8 dias",
      },
    },
    {
      min: 17,
      max: 17,
      result: {
        time: "1d12 dias",
      },
    },
    {
      min: 18,
      max: 19,
      result: {
        time: "1d20 dias",
      },
    },
    {
      min: 20,
      max: 20,
      result: {
        time: "1 dia",
      },
    },
  ];

// ===== NOVOS SERVIÇOS EM (1d20) =====

// Interface para representar tempo para novos serviços
interface NewServicesTimeResult {
  time: string;
}

export const NEW_SERVICES_TIME_TABLE: TableEntry<NewServicesTimeResult>[] = [
  {
    min: 1,
    max: 4,
    result: {
      time: "1d4 meses",
    },
  },
  {
    min: 5,
    max: 8,
    result: {
      time: "2d4+1 semanas",
    },
  },
  {
    min: 9,
    max: 10,
    result: {
      time: "1d4+1 semanas",
    },
  },
  {
    min: 11,
    max: 12,
    result: {
      time: "1 mês",
    },
  },
  {
    min: 13,
    max: 14,
    result: {
      time: "2d6 dias",
    },
  },
  {
    min: 15,
    max: 15,
    result: {
      time: "1 semana",
    },
  },
  {
    min: 16,
    max: 16,
    result: {
      time: "2d4 dias",
    },
  },
  {
    min: 17,
    max: 18,
    result: {
      time: "1d8 dias",
    },
  },
  {
    min: 19,
    max: 19,
    result: {
      time: "1d6 dias",
    },
  },
  {
    min: 20,
    max: 20,
    result: {
      time: "1d4 dias",
    },
  },
];

// ===== FUNÇÕES UTILITÁRIAS =====

/**
 * Obtém o dado de serviço baseado no tamanho da sede
 * Reutiliza a mesma lógica dos contratos
 */
export function getServiceDiceBySize(sizeDescription: string): string {
  return SERVICE_DICE_BY_SIZE[sizeDescription] || "1d4";
}

/**
 * Aplica modificadores de condição dos funcionários
 * Mesmo padrão dos contratos: -1 para despreparados, +1 para experientes
 */
export function applyServiceStaffModifier(
  baseRoll: number,
  staffCondition: string
): number {
  const modifier = SERVICE_STAFF_CONDITION_MODIFIERS[staffCondition] || 0;
  return baseRoll + modifier;
}

/**
 * Mapeia descrição de frequentadores para índice da tabela de redução
 * Usado para determinar redução de serviços disponíveis
 */
export function getVisitorReductionIndex(visitorsDescription: string): number {
  const visitorMap: Record<string, number> = {
    Vazia: 1,
    "Quase deserta": 2,
    "Pouco movimentada": 3,
    "Nem muito nem pouco": 4,
    "Muito frequentada": 5,
    Abarrotada: 6,
    Lotada: 7,
  };

  return visitorMap[visitorsDescription] || 1;
}

// ===== CONSTANTES E CONFIGURAÇÕES =====

/**
 * "Caso o saldo de redução por frequentadores fique negativo,
 *  retire o valor dos próximos serviços rolados."
 */
export const SERVICE_NEGATIVE_REDUCTION_NOTE =
  "Caso o saldo fique negativo, retire o valor dos próximos serviços rolados";

/**
 * "Os prazos de conclusão não usam os dados por tipo de assentamento."
 */
export const SERVICE_DEADLINE_INDEPENDENCE_NOTE =
  "Os prazos de conclusão não usam os dados por tipo de assentamento";

/**
 * "Serviços anulados não voltam a ficar disponíveis para os jogadores"
 */
export const SERVICE_CANCELLATION_NOTE =
  "Serviços anulados não voltam a ficar disponíveis para os jogadores";
