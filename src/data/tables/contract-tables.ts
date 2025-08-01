import type { TableEntry } from "@/types/tables";

// Tabela: Dados por Tamanho da Sede
export const CONTRACT_QUANTITY_DICE: Record<string, string> = {
  Minúsculo: "1d4",
  "Muito pequeno": "1d6",
  "Pequeno e modesto": "1d6+1",
  "Pequeno e confortável": "1d6+1",
  "Mediano e comum": "1d8+2",
  "Mediano em dobro": "1d8+2",
  Grande: "1d10+2",
  "Luxuosamente grande": "1d12+4",
  Enorme: "1d20+4",
  "Enorme e confortável": "1d20+4",
  Colossal: "1d20+8",
  "Colossal e primorosa": "1d20+10",
};

// Tabela: Modificadores por Condição dos Funcionários
export const STAFF_CONDITION_MODIFIERS: Record<string, number> = {
  despreparados: -1,
  experientes: 1,
};

// Tabela: Quantidade Disponível (rolagem 1d20)
export const CONTRACTS_AVAILABLE_TABLE: TableEntry[] = [
  { min: 1, max: 4, result: { contracts: 1, services: { dice: "1d4+1" } } },
  {
    min: 5,
    max: 6,
    result: { contracts: { dice: "1d4" }, services: { dice: "1d4+2" } },
  },
  {
    min: 7,
    max: 9,
    result: { contracts: { dice: "1d4" }, services: { dice: "1d6+2" } },
  },
  {
    min: 10,
    max: 10,
    result: { contracts: { dice: "1d6+1" }, services: { dice: "1d4+1" } },
  },
  {
    min: 11,
    max: 11,
    result: { contracts: { dice: "2d6" }, services: { dice: "1d4+2" } },
  },
  { min: 12, max: 13, result: { contracts: { dice: "3d6" } } },
  {
    min: 14,
    max: 16,
    result: { contracts: { dice: "2d6+2" }, services: { dice: "2d4+1" } },
  },
  {
    min: 17,
    max: 18,
    result: { contracts: { dice: "1d12" }, services: { dice: "5d6" } },
  },
  {
    min: 19,
    max: 19,
    result: { contracts: { dice: "3d6" }, services: { dice: "3d4" } },
  },
  { min: 20, max: 20, result: { contracts: { dice: "5d6" } } },
  {
    min: 21,
    max: 99,
    result: { contracts: { dice: "3d6" }, services: { dice: "3d6" } },
  },
];

// Tabela: Redução por Frequentadores
export const CROWD_REDUCTION_TABLE: TableEntry[] = [
  {
    min: 1,
    max: 1,
    result: { contracts: 0, services: 0 },
    description: "Vazia",
  },
  {
    min: 2,
    max: 2,
    result: { contracts: -1, services: -1 },
    description: "Quase deserta",
  },
  {
    min: 3,
    max: 3,
    result: { contracts: { dice: "-1d4" }, services: { dice: "-1d4" } },
    description: "Pouco movimentada",
  },
  {
    min: 4,
    max: 4,
    result: { contracts: { dice: "-1d6+1" }, services: { dice: "-1d6+1" } },
    description: "Nem muito nem pouco",
  },
  {
    min: 5,
    max: 5,
    result: { contracts: { dice: "-2d6" }, services: { dice: "-2d4" } },
    description: "Muito frequentada",
  },
  {
    min: 6,
    max: 6,
    result: { contracts: { dice: "-3d6" }, services: { dice: "-2d4+2" } },
    description: "Abarrotada",
  },
  {
    min: 7,
    max: 7,
    result: { contracts: { dice: "-4d6" }, services: { dice: "-3d4" } },
    description: "Lotada",
  },
];
