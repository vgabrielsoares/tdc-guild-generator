import type { TableEntry } from "@/types/tables";
import { ContractDifficulty } from "@/types/contract";

// ===== TABELAS BASE DE CONTRATOS =====

// Implementa as tabelas fundamentais: quantidade, valores, prazos e modificadores por condição

// ===== DADOS POR TAMANHO DA SEDE =====

// Mapeia o tamanho da sede para o dado usado em quantidade e prazos
export const CONTRACT_DICE_BY_SIZE: Record<string, string> = {
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

// Modificadores aplicados ao resultado final da rolagem
export const STAFF_CONDITION_MODIFIERS: Record<string, number> = {
  "despreparados": -1,
  "experientes": 1,
};

// ===== QUANTIDADE DISPONÍVEL (1d20) =====

// Tabela para determinar quantos contratos estão disponíveis
export const CONTRACT_QUANTITY_TABLE: TableEntry<string>[] = [
  { min: 1, max: 4, result: "1 contrato" },
  { min: 5, max: 6, result: "1d4 contratos" },
  { min: 7, max: 9, result: "1d4+1 contratos" },
  { min: 10, max: 10, result: "1d6 contratos" },
  { min: 11, max: 11, result: "1d6+1 contratos" },
  { min: 12, max: 13, result: "2d6 contratos" },
  { min: 14, max: 16, result: "2d6+1 contratos" },
  { min: 17, max: 18, result: "3d6 contratos" },
  { min: 19, max: 19, result: "3d6+1 contratos" },
  { min: 20, max: 20, result: "4d6 contratos" },
  { min: 21, max: 999, result: "5d6 contratos" }, // 21+
];

// ===== REDUÇÃO POR FREQUENTADORES =====

// Redução na quantidade de contratos baseada no nível de frequentadores
export const CROWD_REDUCTION_TABLE: TableEntry<{ description: string; reduction: string }>[] = [
  { 
    min: 1, max: 1, 
    result: { 
      description: "Vazia", 
      reduction: "Todos os contratos estão disponíveis" 
    } 
  },
  { 
    min: 2, max: 2, 
    result: { 
      description: "Quase deserta", 
      reduction: "-1 contrato" 
    } 
  },
  { 
    min: 3, max: 3, 
    result: { 
      description: "Pouco movimentada", 
      reduction: "-1d4 contratos" 
    } 
  },
  { 
    min: 4, max: 4, 
    result: { 
      description: "Nem muito nem pouco", 
      reduction: "-1d6+1 contratos" 
    } 
  },
  { 
    min: 5, max: 5, 
    result: { 
      description: "Muito frequentada", 
      reduction: "-2d6 contratos" 
    } 
  },
  { 
    min: 6, max: 6, 
    result: { 
      description: "Abarrotada", 
      reduction: "-3d6 contratos" 
    } 
  },
  { 
    min: 7, max: 7, 
    result: { 
      description: "Lotada", 
      reduction: "-4d6 contratos" 
    } 
  },
];

// ===== PRAZO PARA CONCLUSÃO (1d20) =====

// Interface para representar prazos
interface DeadlineResult {
  deadline: string;
}

// Tabela de prazos para conclusão de contratos
export const CONTRACT_DEADLINE_TABLE: TableEntry<DeadlineResult>[] = [
  { 
    min: 1, max: 1, 
    result: { 
      deadline: "1d4 dias"
    } 
  },
  { 
    min: 2, max: 2, 
    result: { 
      deadline: "3 dias"
    } 
  },
  { 
    min: 3, max: 3, 
    result: { 
      deadline: "1d4+2 dias"
    } 
  },
  { 
    min: 4, max: 4, 
    result: { 
      deadline: "1d6+1 dias"
    } 
  },
  { 
    min: 5, max: 5, 
    result: { 
      deadline: "1d8+2 dias"
    } 
  },
  { 
    min: 6, max: 6, 
    result: { 
      deadline: "1d12+2 dias"
    } 
  },
  { 
    min: 7, max: 8, 
    result: { 
      deadline: "1 semana"
    } 
  },
  { 
    min: 9, max: 9, 
    result: { 
      deadline: "1d4+1 semanas"
    } 
  },
  { 
    min: 10, max: 10, 
    result: { 
      deadline: "1d20+2 dias"
    } 
  },
  { 
    min: 11, max: 999, 
    result: { 
      deadline: "Sem prazo"
    } 
  },
];

// ===== TABELA DE VALORES E RECOMPENSAS (1d100) =====

// Tabela principal para determinar valor base dos contratos
// Este valor é usado tanto para XP (orçamento do mestre) quanto para recompensa inicial
export const CONTRACT_VALUE_TABLE: TableEntry<number>[] = [
  { min: 1, max: 8, result: 75 },
  { min: 9, max: 15, result: 100 },
  { min: 16, max: 20, result: 125 },
  { min: 21, max: 23, result: 150 },
  { min: 24, max: 26, result: 175 },
  { min: 27, max: 29, result: 200 },
  { min: 30, max: 31, result: 250 },
  { min: 32, max: 33, result: 300 },
  { min: 34, max: 35, result: 350 },
  { min: 36, max: 37, result: 400 },
  { min: 38, max: 39, result: 450 },
  { min: 40, max: 41, result: 500 },
  { min: 42, max: 43, result: 550 },
  { min: 44, max: 45, result: 600 },
  { min: 46, max: 47, result: 700 },
  { min: 48, max: 49, result: 800 },
  { min: 50, max: 51, result: 900 },
  { min: 52, max: 53, result: 1000 },
  { min: 54, max: 55, result: 1100 },
  { min: 56, max: 57, result: 1200 },
  { min: 58, max: 59, result: 1300 },
  { min: 60, max: 61, result: 1500 },
  { min: 62, max: 63, result: 1700 },
  { min: 64, max: 65, result: 1900 },
  { min: 66, max: 67, result: 2100 },
  { min: 68, max: 69, result: 2300 },
  { min: 70, max: 71, result: 2500 },
  { min: 72, max: 72, result: 2800 },
  { min: 73, max: 73, result: 3200 },
  { min: 74, max: 74, result: 3600 },
  { min: 75, max: 75, result: 4000 },
  { min: 76, max: 76, result: 4400 },
  { min: 77, max: 77, result: 4800 },
  { min: 78, max: 78, result: 5200 },
  { min: 79, max: 79, result: 5600 },
  { min: 80, max: 80, result: 6000 },
  { min: 81, max: 81, result: 6400 },
  { min: 82, max: 82, result: 6800 },
  { min: 83, max: 83, result: 7200 },
  { min: 84, max: 84, result: 7600 },
  { min: 85, max: 85, result: 8000 },
  { min: 86, max: 86, result: 8500 },
  { min: 87, max: 87, result: 8900 },
  { min: 88, max: 88, result: 9300 },
  { min: 89, max: 89, result: 9700 },
  { min: 90, max: 90, result: 11000 },
  { min: 91, max: 91, result: 15000 },
  { min: 92, max: 92, result: 19000 },
  { min: 93, max: 93, result: 23000 },
  { min: 94, max: 94, result: 27000 },
  { min: 95, max: 95, result: 31000 },
  { min: 96, max: 96, result: 35000 },
  { min: 97, max: 97, result: 39000 },
  { min: 98, max: 98, result: 43000 },
  { min: 99, max: 99, result: 47000 },
  { min: 100, max: 100, result: 50000 },
  // Nota: 101+ seria "Valor anterior * 1,1" - implementado na lógica do gerador
];

// ===== TABELA DE DIFICULDADE DOS CONTRATOS (1d20) =====

// Interface para representar dificuldade com multiplicadores
interface DifficultyResult {
  difficulty: ContractDifficulty;
  experienceMultiplier: number;
  rewardMultiplier: number;
}

// Tabela de dificuldade
export const CONTRACT_DIFFICULTY_TABLE: TableEntry<DifficultyResult>[] = [
  { 
    min: 1, max: 10, 
    result: { 
      difficulty: ContractDifficulty.FACIL,
      experienceMultiplier: 1,
      rewardMultiplier: 1
    } 
  },
  { 
    min: 11, max: 16, 
    result: { 
      difficulty: ContractDifficulty.MEDIO,
      experienceMultiplier: 2,
      rewardMultiplier: 1.3
    } 
  },
  { 
    min: 17, max: 19, 
    result: { 
      difficulty: ContractDifficulty.DIFICIL,
      experienceMultiplier: 4,
      rewardMultiplier: 2
    } 
  },
  { 
    min: 20, max: 20, 
    result: { 
      difficulty: ContractDifficulty.MORTAL,
      experienceMultiplier: 8,
      rewardMultiplier: 3
    } 
  },
];

// ===== TABELA DE DISTÂNCIA (1d20) =====

// Interface para representar distância com modificador
interface DistanceResult {
  description: string;
  valueModifier: number;
  rewardModifier: number;
}

// Tabela de distância
export const CONTRACT_DISTANCE_TABLE: TableEntry<DistanceResult>[] = [
  { 
    min: 1, max: 4, 
    result: { 
      description: "Um hexágono ou menos",
      valueModifier: -20,
      rewardModifier: -20
    } 
  },
  { 
    min: 5, max: 6, 
    result: { 
      description: "Dois hexágonos ou menos",
      valueModifier: -15,
      rewardModifier: -15
    } 
  },
  { 
    min: 7, max: 8, 
    result: { 
      description: "Três hexágonos ou menos",
      valueModifier: -10,
      rewardModifier: -10
    } 
  },
  { 
    min: 9, max: 10, 
    result: { 
      description: "Dois hexágonos ou mais",
      valueModifier: -5,
      rewardModifier: -5
    } 
  },
  { 
    min: 11, max: 12, 
    result: { 
      description: "Três hexágonos ou mais",
      valueModifier: 0,
      rewardModifier: 0
    } 
  },
  { 
    min: 13, max: 15, 
    result: { 
      description: "Quatro hexágonos ou mais",
      valueModifier: 5,
      rewardModifier: 5
    } 
  },
  { 
    min: 16, max: 17, 
    result: { 
      description: "Cinco hexágonos ou mais",
      valueModifier: 10,
      rewardModifier: 10
    } 
  },
  { 
    min: 18, max: 18, 
    result: { 
      description: "Seis hexágonos ou mais",
      valueModifier: 12,
      rewardModifier: 12
    } 
  },
  { 
    min: 19, max: 19, 
    result: { 
      description: "Sete hexágonos ou mais",
      valueModifier: 14,
      rewardModifier: 14
    } 
  },
  { 
    min: 20, max: 20, 
    result: { 
      description: "Oito hexágonos ou mais",
      valueModifier: 20,
      rewardModifier: 20
    } 
  },
];

// ===== MODIFICADORES POR RELAÇÕES =====

// Interface para modificadores de relação
interface RelationModifiers {
  valueModifier: number;
  rewardModifier: number;
}

// Modificadores por relação com a população local
export const POPULATION_RELATION_MODIFIERS: Record<string, RelationModifiers> = {
  "Péssima": { valueModifier: 5, rewardModifier: -20 },
  "Ruim": { valueModifier: -10, rewardModifier: -15 },
  "Dividida": { valueModifier: -5, rewardModifier: -10 },
  "Boa": { valueModifier: 1, rewardModifier: -5 },
  "Muito boa": { valueModifier: 0, rewardModifier: 0 },
  "Excelente": { valueModifier: 0, rewardModifier: 5 },
};

// Modificadores por relação com o governo local
export const GOVERNMENT_RELATION_MODIFIERS: Record<string, RelationModifiers> = {
  "Péssima": { valueModifier: -25, rewardModifier: -25 },
  "Ruim": { valueModifier: -15, rewardModifier: -20 },
  "Diplomática": { valueModifier: -10, rewardModifier: -15 },
  "Boa": { valueModifier: -5, rewardModifier: -5 },
  "Muito boa": { valueModifier: 5, rewardModifier: 5 },
  "Excelente": { valueModifier: 5, rewardModifier: 10 },
};

// ===== MODIFICADORES POR PREPARAÇÃO DOS FUNCIONÁRIOS =====

// Modificadores aplicados à rolagem d100 de recompensa (não ao valor final)
export const STAFF_PREPARATION_ROLL_MODIFIERS: Record<string, number> = {
  "despreparados": -2,
  "experientes": 2,
};

// ===== FUNCIONÁRIOS DIVERSOS - BÔNUS EM CONTRATOS =====

// Interface para bônus de funcionários diversos
interface StaffBonus {
  description: string;
  contractBonus?: string;
  rewardBonus?: number;
  contractReduction?: string;
}

// Bônus por tipos diversos de funcionários
export const DIVERSE_STAFF_BONUSES: Record<string, StaffBonus> = {
  "Membros do clero": {
    description: "+1d6 contratos envolvendo religião",
    contractBonus: "1d6",
  },
  "Ex-membros da guilda": {
    description: "+1d4 contratos",
    contractBonus: "1d4",
  },
  "Nobres e seus serviçais": {
    description: "+1d6 contratos com a nobreza",
    contractBonus: "1d6",
    rewardBonus: 10,
  },
  "Aventureiro pagando dívidas": {
    description: "+1d4 contratos sem recompensa",
    contractBonus: "1d4",
  },
  "Experiente explorador": {
    description: "+1d4 contratos que envolvem apenas descobrir novos locais",
    contractBonus: "1d4",
  },
  "Animal falante": {
    description: "+1d6 contratos envolvendo magia e bestas mágicas",
    contractBonus: "1d6",
  },
  "Ex-aventureiros": {
    description: "-1d6 contratos (Eles guardam os melhores para seus amigos)",
    contractReduction: "1d6",
  },
};

// ===== FUNÇÕES UTILITÁRIAS =====

/**
 * Obtém o dado de contrato baseado no tamanho da sede
 */
export function getContractDiceBySize(sizeDescription: string): string {
  return CONTRACT_DICE_BY_SIZE[sizeDescription] || "1d4";
}

/**
 * Obtém o modificador baseado na condição dos funcionários
 */
export function getStaffModifier(condition: string): number {
  return STAFF_CONDITION_MODIFIERS[condition] || 0;
}

/**
 * Calcula valor para rolagem 101+ (valor anterior * 1.1)
 */
export function calculateExtendedValue(roll: number, baseValue: number): number {
  if (roll <= 100) return baseValue;
  
  // Para 101+, multiplica por 1.1
  return Math.floor(baseValue * 1.1);
}

/**
 * Obtém modificadores de relação com a população
 */
export function getPopulationRelationModifiers(relation: string): RelationModifiers {
  return POPULATION_RELATION_MODIFIERS[relation] || { valueModifier: 0, rewardModifier: 0 };
}

/**
 * Obtém modificadores de relação com o governo
 */
export function getGovernmentRelationModifiers(relation: string): RelationModifiers {
  return GOVERNMENT_RELATION_MODIFIERS[relation] || { valueModifier: 0, rewardModifier: 0 };
}

/**
 * Obtém modificador de rolagem para funcionários experientes/despreparados
 */
export function getStaffPreparationRollModifier(condition: string): number {
  return STAFF_PREPARATION_ROLL_MODIFIERS[condition] || 0;
}

/**
 * Obtém bônus de funcionários diversos
 */
export function getDiverseStaffBonus(staffType: string): StaffBonus | null {
  return DIVERSE_STAFF_BONUSES[staffType] || null;
}
