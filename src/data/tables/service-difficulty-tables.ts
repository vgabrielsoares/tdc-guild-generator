import type { TableEntry } from "@/types/tables";
import {
  ServiceDifficulty,
  ServiceComplexity,
  type ServiceTestStructure,
  type ServiceTest,
  type ServiceTestOutcome,
} from "@/types/service";

/**
 * Interface para resultados da tabela de dificuldade
 * Combina dificuldade, recompensa e recorrência conforme especificação
 */
interface DifficultyResult {
  difficulty: ServiceDifficulty;
  baseReward: string;
  recurrence: string;
  description: string;
}

/**
 * Interface para resultados da tabela de complexidade
 * Define estrutura completa conforme especificações do markdown
 */
interface ComplexityResult {
  complexity: ServiceComplexity;
  testCount: number;
  skillRequirement: "same" | "different" | "mixed";
  difficultyModifiers: number[];
  successOutcomes: {
    [successCount: number]: {
      result: string;
      renownModifier: number;
      rewardModifier: number;
    };
  };
  description: string;
}

/**
 * TABELA DE DIFICULDADE E RECOMPENSAS
 * Baseada na seção "Dificuldade e Recompensa"
 *
 * Rolagem: 1d20
 * Especifica: ND do teste, recompensa base e valor de recorrência
 */
export const SERVICE_DIFFICULTY_TABLE: TableEntry<DifficultyResult>[] = [
  {
    min: 1,
    max: 1,
    result: {
      difficulty: ServiceDifficulty.MUITO_FACIL,
      baseReward: "3d6 C$",
      recurrence: "+3 C$",
      description: "Tarefas simples que qualquer pessoa pode executar",
    },
  },
  {
    min: 2,
    max: 3,
    result: {
      difficulty: ServiceDifficulty.FACIL_ND14,
      baseReward: "3d8 C$",
      recurrence: "+5 C$",
      description: "Tarefas básicas que requerem alguma habilidade",
    },
  },
  {
    min: 4,
    max: 6,
    result: {
      difficulty: ServiceDifficulty.FACIL_ND15,
      baseReward: "5d6 C$",
      recurrence: "+6 C$",
      description: "Trabalhos fáceis com pequenos desafios",
    },
  },
  {
    min: 7,
    max: 7,
    result: {
      difficulty: ServiceDifficulty.FACIL_ND16,
      baseReward: "(1d3+1)*10 C$",
      recurrence: "+7 C$",
      description: "Serviços que exigem competência específica",
    },
  },
  {
    min: 8,
    max: 12,
    result: {
      difficulty: ServiceDifficulty.MEDIA_ND17,
      baseReward: "(1d4+1)*10 C$",
      recurrence: "+10 C$",
      description: "Trabalhos de dificuldade moderada",
    },
  },
  {
    min: 13,
    max: 13,
    result: {
      difficulty: ServiceDifficulty.MEDIA_ND18,
      baseReward: "3d4*10 C$",
      recurrence: "+12 C$",
      description: "Serviços que demandam experiência",
    },
  },
  {
    min: 14,
    max: 14,
    result: {
      difficulty: ServiceDifficulty.MEDIA_ND19,
      baseReward: "4d4*10 C$",
      recurrence: "+15 C$",
      description: "Tarefas complexas com múltiplos aspectos",
    },
  },
  {
    min: 15,
    max: 16,
    result: {
      difficulty: ServiceDifficulty.DIFICIL_ND20,
      baseReward: "4d6*10 C$",
      recurrence: "+20 C$",
      description: "Trabalhos difíceis que testam habilidades",
    },
  },
  {
    min: 17,
    max: 17,
    result: {
      difficulty: ServiceDifficulty.DIFICIL_ND21,
      baseReward: "4d8*10 C$",
      recurrence: "+25 C$",
      description: "Serviços altamente especializados",
    },
  },
  {
    min: 18,
    max: 18,
    result: {
      difficulty: ServiceDifficulty.DESAFIADOR_ND22,
      baseReward: "1d6 PO$",
      recurrence: "+50 C$",
      description: "Desafios que poucos conseguem superar",
    },
  },
  {
    min: 19,
    max: 19,
    result: {
      difficulty: ServiceDifficulty.DESAFIADOR_ND23,
      baseReward: "2d6 PO$",
      recurrence: "+75 C$",
      description: "Trabalhos de extrema dificuldade",
    },
  },
  {
    min: 20,
    max: 20,
    result: {
      difficulty: ServiceDifficulty.MUITO_DIFICIL,
      baseReward: "3d6 PO$",
      recurrence: "+1 PO$",
      description: "Tarefas quase impossíveis para pessoas comuns",
    },
  },
];

/**
 * TABELA DE NÍVEL DE COMPLEXIDADE
 * Baseada na seção "Nível de Complexidade"
 *
 * Rolagem: 1d20
 * Especifica: Tipo de complexidade
 */
export const SERVICE_COMPLEXITY_TABLE: TableEntry<ComplexityResult>[] = [
  {
    min: 1,
    max: 10,
    result: {
      complexity: ServiceComplexity.SIMPLES,
      testCount: 1,
      skillRequirement: "same",
      difficultyModifiers: [0], // ND padrão
      successOutcomes: {
        0: {
          result: "Serviço mal feito",
          renownModifier: 0,
          rewardModifier: 1,
        },
        1: {
          result: "Serviço bem feito",
          renownModifier: 0,
          rewardModifier: 1,
        },
      },
      description:
        "Apenas um único teste de perícia com a ND padrão é necessário",
    },
  },
  {
    min: 11,
    max: 12,
    result: {
      complexity: ServiceComplexity.MODERADA_E_DIRETA,
      testCount: 2,
      skillRequirement: "same",
      difficultyModifiers: [0, 0], // Mesma ND, mesma perícia
      successOutcomes: {
        0: { result: "Fracasso total", renownModifier: -1, rewardModifier: 0 },
        1: {
          result: "Serviço mal feito porém ainda recebe a recompensa",
          renownModifier: -1,
          rewardModifier: 1,
        },
        2: {
          result: "O serviço foi concluído com êxito",
          renownModifier: 0,
          rewardModifier: 1,
        },
      },
      description: "Dois testes com a mesma ND e mesma perícia",
    },
  },
  {
    min: 13,
    max: 15,
    result: {
      complexity: ServiceComplexity.MODERADA,
      testCount: 2,
      skillRequirement: "different",
      difficultyModifiers: [0, 0], // Mesma ND, perícias diferentes
      successOutcomes: {
        0: { result: "Fracasso total", renownModifier: -1, rewardModifier: 0 },
        1: {
          result: "Serviço mal feito porém ainda recebe a recompensa",
          renownModifier: -1,
          rewardModifier: 1,
        },
        2: {
          result: "O serviço foi concluído com êxito",
          renownModifier: 0,
          rewardModifier: 1,
        },
      },
      description: "Dois testes com a mesma ND e perícias diferentes",
    },
  },
  {
    min: 16,
    max: 16,
    result: {
      complexity: ServiceComplexity.COMPLEXA_E_DIRETA,
      testCount: 3,
      skillRequirement: "mixed", // Duas perícias diferentes ou menos
      difficultyModifiers: [0, -1, 1], // ND padrão, -1, +1
      successOutcomes: {
        0: { result: "Fracasso total", renownModifier: -1, rewardModifier: 0 },
        1: {
          result: "Fracasso parcial",
          renownModifier: -1,
          rewardModifier: 0.5,
        },
        2: {
          result: "Serviço mal feito porém ainda recebe a recompensa",
          renownModifier: -1,
          rewardModifier: 1,
        },
        3: {
          result: "O serviço foi concluído com êxito",
          renownModifier: 0,
          rewardModifier: 1,
        },
      },
      description:
        "Três testes: ND padrão, ND-1, ND+1 (duas perícias diferentes ou menos)",
    },
  },
  {
    min: 17,
    max: 18,
    result: {
      complexity: ServiceComplexity.COMPLEXA,
      testCount: 3,
      skillRequirement: "different",
      difficultyModifiers: [0, -1, 1], // ND padrão, -1, +1
      successOutcomes: {
        0: { result: "Fracasso total", renownModifier: -1, rewardModifier: 0 },
        1: {
          result: "Fracasso parcial",
          renownModifier: -1,
          rewardModifier: 0.5,
        },
        2: {
          result: "Serviço mal feito porém ainda recebe a recompensa",
          renownModifier: -1,
          rewardModifier: 1,
        },
        3: {
          result: "O serviço foi concluído com êxito",
          renownModifier: 0,
          rewardModifier: 1,
        },
      },
      description: "Três testes: ND padrão, ND-1, ND+1 (perícias diferentes)",
    },
  },
  {
    min: 19,
    max: 19,
    result: {
      complexity: ServiceComplexity.EXTREMAMENTE_COMPLEXA_E_DIRETA,
      testCount: 5,
      skillRequirement: "mixed", // Três perícias diferentes ou menos
      difficultyModifiers: [0, 1, 2, -1, -2], // ND padrão, +1, +2, -1, -2
      successOutcomes: {
        0: { result: "Fracasso total", renownModifier: -3, rewardModifier: 0 },
        1: {
          result: "Fracasso parcial",
          renownModifier: -2,
          rewardModifier: 0,
        },
        2: {
          result: "Serviço mal feito",
          renownModifier: -1,
          rewardModifier: 0.5,
        },
        3: {
          result: "Serviço mal feito porém ainda recebe a recompensa",
          renownModifier: -1,
          rewardModifier: 1,
        },
        4: {
          result: "O serviço foi concluído com êxito",
          renownModifier: 0,
          rewardModifier: 1,
        },
        5: {
          result: "Trabalho primoroso",
          renownModifier: 1,
          rewardModifier: 2,
        },
      },
      description:
        "Cinco testes: ND padrão, ND+1, ND+2, ND-1, ND-2 (três perícias diferentes ou menos)",
    },
  },
  {
    min: 20,
    max: 20,
    result: {
      complexity: ServiceComplexity.EXTREMAMENTE_COMPLEXA,
      testCount: 5,
      skillRequirement: "different",
      difficultyModifiers: [0, 1, 2, -1, -2], // ND padrão, +1, +2, -1, -2
      successOutcomes: {
        0: { result: "Fracasso total", renownModifier: -5, rewardModifier: 0 },
        1: {
          result: "Fracasso parcial",
          renownModifier: -3,
          rewardModifier: 0,
        },
        2: {
          result: "Serviço mal feito",
          renownModifier: -1,
          rewardModifier: 0.5,
        },
        3: {
          result: "Serviço mal feito porém ainda recebe a recompensa",
          renownModifier: -1,
          rewardModifier: 1,
        },
        4: {
          result: "O serviço foi concluído com êxito",
          renownModifier: 0,
          rewardModifier: 1,
        },
        5: {
          result: "Trabalho primoroso",
          renownModifier: 1,
          rewardModifier: 2,
        },
      },
      description:
        "Cinco testes: ND padrão, ND+1, ND+2, ND-1, ND-2 (perícias diferentes)",
    },
  },
];

/**
 * Tipo para valores de recompensa calculados
 */
export interface RewardCalculation {
  baseDice: string;
  amount: number;
  currency: "C$" | "PO$";
  recurrenceBonus: number;
  total: number;
}

/**
 * Calcula a recompensa base para uma dificuldade específica
 *
 * @param difficulty - Nível de dificuldade do serviço
 * @returns Estrutura de cálculo da recompensa
 */
export function calculateServiceReward(
  difficulty: ServiceDifficulty
): RewardCalculation {
  const difficultyData = SERVICE_DIFFICULTY_TABLE.find(
    (entry) => entry.result.difficulty === difficulty
  );

  if (!difficultyData) {
    throw new Error(`Dificuldade não encontrada: ${difficulty}`);
  }

  const { baseReward, recurrence } = difficultyData.result;

  // Parse de formatos: "1d6 C$", "3d4 C$", "(1d3+1)*10 C$", "3d4*10 C$", "2d4+1 PO$"
  let rewardMatch = baseReward.match(/^(\d+d\d+(?:\+\d+)?)\s+(C\$|PO\$)$/);

  if (!rewardMatch) {
    // Tenta formato com multiplicação: "3d4*10 C$"
    rewardMatch = baseReward.match(/^(\d+d\d+)\*(\d+)\s+(C\$|PO\$)$/);
    if (rewardMatch) {
      const [, diceExpr, multiplier, currency] = rewardMatch;
      const diceMatch = diceExpr.match(/(\d+)d(\d+)(\+\d+)?/);
      if (diceMatch) {
        const [, diceCount, diceSize, bonus] = diceMatch;
        const bonusValue = bonus ? parseInt(bonus.replace("+", "")) : 0;
        const avgRoll = (parseInt(diceSize) + 1) / 2;
        const amount = Math.round(
          (parseInt(diceCount) * avgRoll + bonusValue) * parseInt(multiplier)
        );

        return {
          baseDice: baseReward,
          amount,
          currency: currency as "C$" | "PO$",
          recurrenceBonus: parseRecurrence(recurrence),
          total: amount,
        };
      }
    }

    // Tenta formato com parênteses: "(1d3+1)*10 C$"
    rewardMatch = baseReward.match(
      /^\((\d+d\d+(?:\+\d+)?)\)\*(\d+)\s+(C\$|PO\$)$/
    );
    if (rewardMatch) {
      const [, diceExpr, multiplier, currency] = rewardMatch;
      const diceMatch = diceExpr.match(/(\d+)d(\d+)(\+\d+)?/);
      if (diceMatch) {
        const [, diceCount, diceSize, bonus] = diceMatch;
        const bonusValue = bonus ? parseInt(bonus.replace("+", "")) : 0;
        const avgRoll = (parseInt(diceSize) + 1) / 2;
        const amount = Math.round(
          (parseInt(diceCount) * avgRoll + bonusValue) * parseInt(multiplier)
        );

        return {
          baseDice: baseReward,
          amount,
          currency: currency as "C$" | "PO$",
          recurrenceBonus: parseRecurrence(recurrence),
          total: amount,
        };
      }
    }

    throw new Error(`Formato de recompensa inválido: ${baseReward}`);
  }

  const [, diceExpr, currency] = rewardMatch;
  const diceMatch = diceExpr.match(/(\d+)d(\d+)(\+\d+)?/);
  if (!diceMatch) {
    throw new Error(`Formato de dados inválido: ${diceExpr}`);
  }

  const [, diceCount, diceSize, bonus] = diceMatch;
  const bonusValue = bonus ? parseInt(bonus.replace("+", "")) : 0;

  // Simula rolagem média dos dados
  const avgRoll = (parseInt(diceSize) + 1) / 2;
  const amount = Math.round(parseInt(diceCount) * avgRoll + bonusValue);

  return {
    baseDice: baseReward,
    amount,
    currency: currency as "C$" | "PO$",
    recurrenceBonus: parseRecurrence(recurrence),
    total: amount,
  };
}

/**
 * Função auxiliar para parsear a recorrência
 */
function parseRecurrence(recurrence: string): number {
  // Para "+1 PO$", converter para equivalente em C$ (1 PO$ = 100 C$)
  const poMatch = recurrence.match(/\+([0-9,]+)\s+PO\$/);
  if (poMatch) {
    return parseFloat(poMatch[1].replace(",", ".")) * 100; // Converter PO$ para C$
  }

  // Para valores em C$
  const cMatch = recurrence.match(/\+([0-9,]+)\s+C\$/);
  return cMatch ? parseFloat(cMatch[1].replace(",", ".")) : 0;
}

/**
 * Determina os requisitos de teste para um nível de complexidade
 *
 * @param complexity - Nível de complexidade do serviço
 * @returns Dados sobre testes necessários e critérios
 */
export function getComplexityRequirements(
  complexity: ServiceComplexity
): ComplexityResult {
  const complexityData = SERVICE_COMPLEXITY_TABLE.find(
    (entry) => entry.result.complexity === complexity
  );

  if (!complexityData) {
    throw new Error(`Complexidade não encontrada: ${complexity}`);
  }

  return complexityData.result;
}

/**
 * Calcula o resultado de um serviço baseado na complexidade e sucessos obtidos
 *
 * @param complexity - Nível de complexidade
 * @param successCount - Número de sucessos obtidos nos testes
 * @returns Resultado do serviço com modificadores
 */
export function calculateServiceResult(
  complexity: ServiceComplexity,
  successCount: number
): {
  result: string;
  renownModifier: number;
  rewardModifier: number;
} {
  const requirements = getComplexityRequirements(complexity);
  const outcome = requirements.successOutcomes[successCount];

  if (!outcome) {
    throw new Error(
      `Número de sucessos inválido: ${successCount} para complexidade ${complexity}`
    );
  }

  return outcome;
}

/**
 * Calcula a chance de sucesso para um serviço baseado na complexidade
 *
 * @param complexity - Nível de complexidade
 * @param playerBonus - Bônus do jogador/guilda nos testes
 * @param baseND - ND base para os testes (padrão: 17)
 * @returns Percentual estimado de chance de sucesso total
 */
export function calculateSuccessChance(
  complexity: ServiceComplexity,
  playerBonus: number = 0,
  baseND: number = 17
): number {
  const requirements = getComplexityRequirements(complexity);
  const { testCount, difficultyModifiers } = requirements;

  // Calcula chance individual para cada teste
  const individualChances = difficultyModifiers.map((modifier) => {
    const adjustedND = baseND + modifier;
    const successChance = Math.min(
      0.95,
      Math.max(0.05, (20 + playerBonus - adjustedND) / 20)
    );
    return successChance;
  });

  // Calcula probabilidades para cada número de sucessos usando combinações
  const probabilities: number[] = new Array(testCount + 1).fill(0);

  // Função recursiva para calcular todas as combinações
  function calculateCombinations(
    testIndex: number,
    currentSuccesses: number,
    currentProbability: number
  ) {
    if (testIndex === testCount) {
      probabilities[currentSuccesses] += currentProbability;
      return;
    }

    const successChance = individualChances[testIndex];
    const failChance = 1 - successChance;

    // Sucesso neste teste
    calculateCombinations(
      testIndex + 1,
      currentSuccesses + 1,
      currentProbability * successChance
    );
    // Falha neste teste
    calculateCombinations(
      testIndex + 1,
      currentSuccesses,
      currentProbability * failChance
    );
  }

  calculateCombinations(0, 0, 1);

  // Soma probabilidades de resultados que não são fracasso total
  let totalSuccessChance = 0;
  for (let successes = 1; successes <= testCount; successes++) {
    if (requirements.successOutcomes[successes]) {
      totalSuccessChance += probabilities[successes];
    }
  }

  return Math.round(totalSuccessChance * 100);
}

/**
 * Gera um resumo das dificuldades de teste para uma complexidade
 *
 * @param complexity - Nível de complexidade
 * @param baseND - ND base (padrão: 17)
 * @returns Array com as NDs de cada teste
 */
export function getTestDifficulties(
  complexity: ServiceComplexity,
  baseND: number = 17
): number[] {
  const requirements = getComplexityRequirements(complexity);
  return requirements.difficultyModifiers.map((modifier) => baseND + modifier);
}

// ===== FUNÇÕES PARA SISTEMA DE ND E TESTES =====

/**
 * Extrai o valor de ND de uma ServiceDifficulty
 * Baseado na tabela "Dificuldade e Recompensas"
 *
 * @param difficulty - Dificuldade do serviço
 * @returns Valor numérico do ND
 */
export function extractNDFromDifficulty(difficulty: ServiceDifficulty): number {
  // Extrair ND do texto da dificuldade (ex: "Muito Fácil (ND 10)" -> 10)
  const ndMatch = difficulty.match(/ND (\d+)/);
  if (ndMatch) {
    return parseInt(ndMatch[1], 10);
  }

  // Fallback para casos não previstos
  return 17; // ND médio como fallback
}

/**
 * Cria estrutura completa de testes baseada na complexidade e dificuldade
 *
 * @param complexity - Complexidade do serviço
 * @param difficulty - Dificuldade do serviço (para extrair ND base)
 * @returns Estrutura completa de testes
 */
export function createServiceTestStructure(
  complexity: ServiceComplexity,
  difficulty: ServiceDifficulty
): ServiceTestStructure {
  const baseND = extractNDFromDifficulty(difficulty);
  const complexityData = getComplexityRequirements(complexity);

  // Criar testes individuais com modificadores
  const tests: ServiceTest[] = complexityData.difficultyModifiers.map(
    (modifier, index) => ({
      baseND,
      ndModifier: modifier,
      finalND: baseND + modifier,
      testIndex: index,
      completed: false,
      rollResult: undefined,
      success: undefined,
    })
  );

  return {
    complexity,
    baseND,
    totalTests: complexityData.testCount,
    skillRequirement: complexityData.skillRequirement,
    tests,
    successCount: 0,
    completed: false,
    outcome: undefined,
  };
}

/**
 * Processa um teste individual (rolagem do usuário vs ND)
 *
 * @param testStructure - Estrutura de testes
 * @param testIndex - Índice do teste (0-based)
 * @param rollResult - Resultado da rolagem do usuário (1-50)
 * @returns Estrutura atualizada com resultado do teste
 */
export function processServiceTest(
  testStructure: ServiceTestStructure,
  testIndex: number,
  rollResult: number
): ServiceTestStructure {
  if (testIndex < 0 || testIndex >= testStructure.tests.length) {
    throw new Error(`Índice de teste inválido: ${testIndex}`);
  }

  if (rollResult < 1 || rollResult > 50) {
    throw new Error(
      `Resultado de rolagem inválido: ${rollResult} (deve ser 1-50)`
    );
  }

  // Atualizar o teste específico
  const updatedTests = [...testStructure.tests];
  const test = updatedTests[testIndex];

  test.rollResult = rollResult;
  test.success = rollResult >= test.finalND;
  test.completed = true;

  // Calcular sucessos totais
  const successCount = updatedTests.filter((t) => t.success === true).length;

  // Verificar se todos os testes foram completados
  const allCompleted = updatedTests.every((t) => t.completed);

  let outcome: ServiceTestOutcome | undefined;
  if (allCompleted) {
    outcome = calculateServiceOutcome(testStructure.complexity, successCount);
  }

  return {
    ...testStructure,
    tests: updatedTests,
    successCount,
    completed: allCompleted,
    outcome,
  };
}

/**
 * Calcula o resultado final baseado na complexidade e sucessos
 * Conforme tabelas de "Nível de Complexidade"
 *
 * @param complexity - Complexidade do serviço
 * @param successCount - Quantidade de sucessos obtidos
 * @returns Resultado final com modificadores
 */
export function calculateServiceOutcome(
  complexity: ServiceComplexity,
  successCount: number
): ServiceTestOutcome {
  const complexityData = getComplexityRequirements(complexity);
  const outcomeData = complexityData.successOutcomes[successCount];

  if (!outcomeData) {
    // Fallback para casos não previstos
    return {
      result: "Resultado indeterminado",
      renownModifier: 0,
      rewardModifier: 0,
      wellDone: false,
      masterwork: false,
    };
  }

  return {
    result: outcomeData.result,
    renownModifier: outcomeData.renownModifier,
    rewardModifier: outcomeData.rewardModifier,
    wellDone:
      outcomeData.rewardModifier >= 1 && outcomeData.renownModifier >= 0,
    masterwork: outcomeData.rewardModifier >= 2, // Trabalho primoroso
  };
}

/**
 * Verifica se um teste específico foi bem-sucedido
 *
 * @param rollResult - Resultado da rolagem (1-50)
 * @param targetND - ND alvo do teste
 * @returns true se rolagem >= ND
 */
export function isTestSuccessful(
  rollResult: number,
  targetND: number
): boolean {
  return rollResult >= targetND;
}

/**
 * Calcula recompensa final baseada no resultado dos testes
 * Aplica modificador de recompensa conforme outcome
 *
 * @param baseRewardAmount - Recompensa base do serviço
 * @param outcome - Resultado dos testes
 * @returns Valor final da recompensa
 */
export function calculateFinalReward(
  baseRewardAmount: number,
  outcome: ServiceTestOutcome
): number {
  let finalReward = baseRewardAmount * outcome.rewardModifier;

  // Para trabalho primoroso, role novamente e some
  if (outcome.masterwork) {
    // Nota: Esta função não faz a rolagem adicional automaticamente
    // Isso deve ser feito externamente para manter a pureza da função
    finalReward = baseRewardAmount + baseRewardAmount; // Dobrar como aproximação
  }

  return Math.floor(finalReward);
}
