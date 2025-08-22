/**
 * Utilitários para resolução de serviços através de testes de perícia
 *
 * Integra com as funções já existentes em service-difficulty-tables.ts
 */

import type {
  Service,
  ServiceTestStructure,
  ServiceTestOutcome,
} from "@/types/service";
import {
  createServiceTestStructure,
  processServiceTest as processTestFromTables,
} from "@/data/tables/service-difficulty-tables";

/**
 * Interface para resultado de um teste de perícia
 */
export interface SkillTestResult {
  success: boolean;
  rollResult: number;
  finalND: number;
  testIndex: number;
  message: string;
}

/**
 * Interface para sugestões de perícias baseadas no objetivo
 */
export interface SkillSuggestion {
  skillName: string;
  description: string;
  reasoning: string;
}

/**
 * Inicializa estrutura de testes para um serviço aceito
 * Reutiliza função existente em service-difficulty-tables.ts
 *
 * @param service - Serviço para inicializar testes
 * @returns Estrutura de testes inicializada
 */
export function initializeServiceTests(service: Service): ServiceTestStructure {
  return createServiceTestStructure(service.complexity, service.difficulty);
}

/**
 * Processa um único teste de perícia para um serviço
 * Wrapper que reutiliza função existente para manter compatibilidade
 *
 * @param testStructure - Estrutura atual de testes
 * @param testIndex - Índice do teste a ser processado
 * @param rollResult - Resultado da rolagem (1-50)
 * @returns Resultado do teste e estrutura atualizada
 */
export function processSkillTest(
  testStructure: ServiceTestStructure,
  testIndex: number,
  rollResult: number
): { result: SkillTestResult; updatedStructure: ServiceTestStructure } {
  // Validação de entrada
  if (testIndex < 0 || testIndex >= testStructure.tests.length) {
    throw new Error(`Índice de teste inválido: ${testIndex}`);
  }

  if (rollResult < 1 || rollResult > 50) {
    throw new Error(
      `Resultado de rolagem inválido: ${rollResult} (deve ser 1-50)`
    );
  }

  const test = testStructure.tests[testIndex];
  const success = rollResult >= test.finalND;

  // Usar função existente para processar o teste
  const updatedStructure = processTestFromTables(
    testStructure,
    testIndex,
    rollResult
  );

  // Criar resultado formatado para a interface
  const result: SkillTestResult = {
    success,
    rollResult,
    finalND: test.finalND,
    testIndex,
    message: success
      ? `Sucesso! Rolagem ${rollResult} ≥ ND ${test.finalND}`
      : `Fracasso! Rolagem ${rollResult} < ND ${test.finalND}`,
  };

  return { result, updatedStructure };
}

/**
 * Verifica se todos os testes foram completados
 *
 * @param testStructure - Estrutura de testes
 * @returns True se todos os testes foram completados
 */
export function areAllTestsCompleted(
  testStructure: ServiceTestStructure
): boolean {
  return testStructure.completed;
}

/**
 * Obtém o próximo teste a ser realizado
 *
 * @param testStructure - Estrutura de testes
 * @returns Índice do próximo teste ou -1 se todos foram completados
 */
export function getNextTestIndex(testStructure: ServiceTestStructure): number {
  const nextTest = testStructure.tests.findIndex((test) => !test.completed);
  return nextTest;
}

/**
 * Obtém informações do teste atual para exibição na interface
 *
 * @param testStructure - Estrutura de testes
 * @param testIndex - Índice do teste atual
 * @returns Informações formatadas do teste
 */
export function getCurrentTestInfo(
  testStructure: ServiceTestStructure,
  testIndex: number
): {
  testNumber: number;
  totalTests: number;
  finalND: number;
  skillRequirement: string;
  modifier: string;
  isCompleted: boolean;
} {
  if (testIndex < 0 || testIndex >= testStructure.tests.length) {
    throw new Error(`Índice de teste inválido: ${testIndex}`);
  }

  const test = testStructure.tests[testIndex];
  const skillRequirementText = {
    same: "Mesma perícia",
    different: "Perícias diferentes",
    mixed: "Perícias mistas",
  }[testStructure.skillRequirement];

  const modifierText =
    test.ndModifier === 0
      ? "ND padrão"
      : test.ndModifier > 0
        ? `+${test.ndModifier} ND`
        : `${test.ndModifier} ND`;

  return {
    testNumber: testIndex + 1,
    totalTests: testStructure.totalTests,
    finalND: test.finalND,
    skillRequirement: skillRequirementText,
    modifier: modifierText,
    isCompleted: test.completed,
  };
}

/**
 * Gera sugestões de perícias baseadas no objetivo do serviço
 * Análise simples baseada em palavras-chave do objetivo
 *
 * @param objective - Objetivo do serviço
 * @param skillRequirement - Tipo de perícia exigido
 * @returns Lista de sugestões de perícias
 */
export function generateSkillSuggestions(
  objective?: string,
  skillRequirement: "same" | "different" | "mixed" = "same"
): SkillSuggestion[] {
  const suggestions: SkillSuggestion[] = [];

  if (!objective) {
    // Sugestões genéricas se não há objetivo específico
    suggestions.push({
      skillName: "Investigação",
      description: "Buscar pistas e informações",
      reasoning: "Perícia versátil para serviços gerais",
    });
    suggestions.push({
      skillName: "Persuasão",
      description: "Convencer pessoas",
      reasoning: "Útil para interações sociais",
    });
    return suggestions;
  }

  const objectiveLower = objective.toLowerCase();

  // Mapeamento de palavras-chave para perícias
  const skillMappings = [
    {
      keywords: ["treinar", "ensinar", "instrução", "aprender"],
      skill: "Instrução, Adestramento ou habilidade relevante",
      description: "Ensinar habilidades práticas",
      reasoning: "Apropriado para atividades de ensino",
    },
    {
      keywords: ["recrutar", "encontrar", "localizar"],
      skill: "Sociedade ou Investigação",
      description: "Buscar e localizar pessoas",
      reasoning: "Essencial para encontrar candidatos",
    },
    {
      keywords: ["curar", "recuperar", "medicina", "doença"],
      skill: "Medicina",
      description: "Tratar problemas de saúde",
      reasoning: "Conhecimento médico necessário",
    },
    {
      keywords: ["negociar", "coagir", "convencer", "persuadir"],
      skill: "Persuasão ou Intimidação",
      description: "Influenciar decisões",
      reasoning: "Habilidade social para negociações",
    },
    {
      keywords: ["auxiliar", "cuidar", "ajudar"],
      skill: "Perspicácia",
      description: "Compreender necessidades",
      reasoning: "Empatia para assistência adequada",
    },
    {
      keywords: ["extrair", "recursos", "coletar"],
      skill: "Sobrevivência ou Natureza",
      description: "Localizar e extrair recursos",
      reasoning: "Conhecimento sobre recursos naturais",
    },
    {
      keywords: ["construir", "criar", "reparar", "consertar"],
      skill: "Ofício ou habilidade relevante",
      description: "Trabalhos manuais especializados",
      reasoning: "Habilidade artesanal necessária",
    },
    {
      keywords: ["religioso", "espiritual", "fé"],
      skill: "Religião",
      description: "Conhecimento religioso",
      reasoning: "Entendimento de práticas espirituais",
    },
  ];

  // Encontrar sugestões baseadas em palavras-chave
  for (const mapping of skillMappings) {
    if (mapping.keywords.some((keyword) => objectiveLower.includes(keyword))) {
      suggestions.push({
        skillName: mapping.skill,
        description: mapping.description,
        reasoning: mapping.reasoning,
      });
    }
  }

  // Adicionar sugestões complementares baseadas no tipo de perícia
  if (skillRequirement === "different" && suggestions.length === 1) {
    // Sugerir uma segunda perícia complementar
    suggestions.push({
      skillName: "Atletismo",
      description: "Atividade física complementar",
      reasoning: "Segunda perícia para complementar o teste",
    });
  } else if (skillRequirement === "mixed" && suggestions.length < 2) {
    // Sugerir perícias mistas
    suggestions.push({
      skillName: "Percepção",
      description: "Observar detalhes importantes",
      reasoning: "Perícia versátil para testes mistos",
    });
  }

  // Fallback se nenhuma sugestão foi encontrada
  if (suggestions.length === 0) {
    suggestions.push({
      skillName: "Investigação",
      description: "Buscar informações e resolver problemas",
      reasoning: "Perícia versátil para a maioria dos serviços",
    });
  }

  return suggestions.slice(0, 3); // Máximo 3 sugestões
}

/**
 * Formata o resultado final dos testes para exibição
 *
 * @param outcome - Resultado dos testes
 * @returns Texto formatado do resultado
 */
export function formatTestOutcome(outcome: ServiceTestOutcome): {
  resultText: string;
  renownText: string;
  rewardText: string;
  statusClass: string;
} {
  const renownText =
    outcome.renownModifier === 0
      ? "Sem mudança no renome"
      : outcome.renownModifier > 0
        ? `+${outcome.renownModifier} de renome`
        : `${outcome.renownModifier} de renome`;

  const rewardText =
    outcome.rewardModifier === 0
      ? "Sem recompensa"
      : outcome.rewardModifier === 1
        ? "Recompensa completa"
        : outcome.rewardModifier === 0.5
          ? "Metade da recompensa"
          : `${outcome.rewardModifier}x da recompensa`;

  const statusClass = outcome.renownModifier >= 0 ? "success" : "failure";

  return {
    resultText: outcome.result,
    renownText,
    rewardText,
    statusClass,
  };
}

/**
 * Calcula estatísticas dos testes para exibição
 *
 * @param testStructure - Estrutura de testes
 * @returns Estatísticas formatadas
 */
export function getTestStatistics(testStructure: ServiceTestStructure): {
  totalTests: number;
  completedTests: number;
  successCount: number;
  failureCount: number;
  successRate: number;
  isCompleted: boolean;
} {
  const completedTests = testStructure.tests.filter(
    (test) => test.completed
  ).length;
  const failureCount = completedTests - testStructure.successCount;
  const successRate =
    completedTests > 0
      ? (testStructure.successCount / completedTests) * 100
      : 0;

  return {
    totalTests: testStructure.totalTests,
    completedTests,
    successCount: testStructure.successCount,
    failureCount,
    successRate: Math.round(successRate),
    isCompleted: testStructure.completed,
  };
}
