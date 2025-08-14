import { describe, it, expect } from "vitest";
import {
  SERVICE_DIFFICULTY_TABLE,
  SERVICE_COMPLEXITY_TABLE,
  calculateServiceReward,
  getComplexityRequirements,
  calculateSuccessChance,
  calculateServiceResult,
  getTestDifficulties
} from "@/data/tables/service-difficulty-tables";
import { ServiceDifficulty, ServiceComplexity } from "@/types/service";

describe("SERVICE_DIFFICULTY_TABLE", () => {
  describe("Cobertura e Estrutura da Tabela", () => {
    it("deve cobrir todos os valores de 1 a 20 sem gaps", () => {
      const coveredValues = new Set<number>();
      
      SERVICE_DIFFICULTY_TABLE.forEach(entry => {
        for (let i = entry.min; i <= entry.max; i++) {
          expect(coveredValues.has(i)).toBe(false); // Não deve haver sobreposição
          coveredValues.add(i);
        }
      });
      
      // Verificar cobertura completa de 1d20
      for (let i = 1; i <= 20; i++) {
        expect(coveredValues.has(i)).toBe(true);
      }
      
      expect(coveredValues.size).toBe(20);
    });

    it("deve ter 12 entradas conforme especificação do markdown", () => {
      expect(SERVICE_DIFFICULTY_TABLE).toHaveLength(12);
    });

    it("deve ter estrutura correta para cada entrada", () => {
      SERVICE_DIFFICULTY_TABLE.forEach(entry => {
        expect(entry).toHaveProperty('min');
        expect(entry).toHaveProperty('max');
        expect(entry).toHaveProperty('result');
        
        const { result } = entry;
        expect(result).toHaveProperty('difficulty');
        expect(result).toHaveProperty('baseReward');
        expect(result).toHaveProperty('recurrence');
        expect(result).toHaveProperty('description');
        
        expect(typeof result.difficulty).toBe('string');
        expect(typeof result.baseReward).toBe('string');
        expect(typeof result.recurrence).toBe('string');
        expect(typeof result.description).toBe('string');
      });
    });
  });

  describe("Valores Específicos de Dificuldade Conforme Markdown", () => {
    it("deve retornar 'Muito Fácil (ND 10)' para rolagem 1", () => {
      const entry = SERVICE_DIFFICULTY_TABLE.find(e => e.min <= 1 && e.max >= 1);
      expect(entry?.result.difficulty).toBe(ServiceDifficulty.MUITO_FACIL);
      expect(entry?.result.baseReward).toBe("1d6 C$");
      expect(entry?.result.recurrence).toBe("+0,5 C$");
    });

    it("deve retornar 'Fácil (ND 14)' para rolagens 2-3", () => {
      [2, 3].forEach(roll => {
        const entry = SERVICE_DIFFICULTY_TABLE.find(e => e.min <= roll && e.max >= roll);
        expect(entry?.result.difficulty).toBe(ServiceDifficulty.FACIL_ND14);
        expect(entry?.result.baseReward).toBe("3d4 C$");
        expect(entry?.result.recurrence).toBe("+1 C$");
      });
    });

    it("deve retornar 'Fácil (ND 15)' para rolagens 4-6", () => {
      [4, 5, 6].forEach(roll => {
        const entry = SERVICE_DIFFICULTY_TABLE.find(e => e.min <= roll && e.max >= roll);
        expect(entry?.result.difficulty).toBe(ServiceDifficulty.FACIL_ND15);
        expect(entry?.result.baseReward).toBe("3d6 C$");
        expect(entry?.result.recurrence).toBe("+2 C$");
      });
    });

    it("deve retornar 'Fácil (ND 16)' para rolagem 7", () => {
      const entry = SERVICE_DIFFICULTY_TABLE.find(e => e.min <= 7 && e.max >= 7);
      expect(entry?.result.difficulty).toBe(ServiceDifficulty.FACIL_ND16);
      expect(entry?.result.baseReward).toBe("3d8 C$");
      expect(entry?.result.recurrence).toBe("+3 C$");
    });

    it("deve retornar 'Média (ND 17)' para rolagens 8-12", () => {
      [8, 9, 10, 11, 12].forEach(roll => {
        const entry = SERVICE_DIFFICULTY_TABLE.find(e => e.min <= roll && e.max >= roll);
        expect(entry?.result.difficulty).toBe(ServiceDifficulty.MEDIA_ND17);
        expect(entry?.result.baseReward).toBe("5d6 C$");
        expect(entry?.result.recurrence).toBe("+5 C$");
      });
    });

    it("deve retornar 'Média (ND 18)' para rolagem 13", () => {
      const entry = SERVICE_DIFFICULTY_TABLE.find(e => e.min <= 13 && e.max >= 13);
      expect(entry?.result.difficulty).toBe(ServiceDifficulty.MEDIA_ND18);
      expect(entry?.result.baseReward).toBe("(1d3+1)*10 C$");
      expect(entry?.result.recurrence).toBe("+6 C$");
    });

    it("deve retornar 'Média (ND 19)' para rolagem 14", () => {
      const entry = SERVICE_DIFFICULTY_TABLE.find(e => e.min <= 14 && e.max >= 14);
      expect(entry?.result.difficulty).toBe(ServiceDifficulty.MEDIA_ND19);
      expect(entry?.result.baseReward).toBe("(1d4+1)*10 C$");
      expect(entry?.result.recurrence).toBe("+7 C$");
    });

    it("deve retornar 'Difícil (ND 20)' para rolagens 15-16", () => {
      [15, 16].forEach(roll => {
        const entry = SERVICE_DIFFICULTY_TABLE.find(e => e.min <= roll && e.max >= roll);
        expect(entry?.result.difficulty).toBe(ServiceDifficulty.DIFICIL_ND20);
        expect(entry?.result.baseReward).toBe("3d4*10 C$");
        expect(entry?.result.recurrence).toBe("+10 C$");
      });
    });

    it("deve retornar 'Difícil (ND 21)' para rolagem 17", () => {
      const entry = SERVICE_DIFFICULTY_TABLE.find(e => e.min <= 17 && e.max >= 17);
      expect(entry?.result.difficulty).toBe(ServiceDifficulty.DIFICIL_ND21);
      expect(entry?.result.baseReward).toBe("4d4*10 C$");
      expect(entry?.result.recurrence).toBe("+12 C$");
    });

    it("deve retornar 'Desafiador (ND 22)' para rolagem 18", () => {
      const entry = SERVICE_DIFFICULTY_TABLE.find(e => e.min <= 18 && e.max >= 18);
      expect(entry?.result.difficulty).toBe(ServiceDifficulty.DESAFIADOR_ND22);
      expect(entry?.result.baseReward).toBe("4d6*10 C$");
      expect(entry?.result.recurrence).toBe("+15 C$");
    });

    it("deve retornar 'Desafiador (ND 23)' para rolagem 19", () => {
      const entry = SERVICE_DIFFICULTY_TABLE.find(e => e.min <= 19 && e.max >= 19);
      expect(entry?.result.difficulty).toBe(ServiceDifficulty.DESAFIADOR_ND23);
      expect(entry?.result.baseReward).toBe("4d8*10 C$");
      expect(entry?.result.recurrence).toBe("+17 C$");
    });

    it("deve retornar 'Muito Difícil (ND 25)' para rolagem 20", () => {
      const entry = SERVICE_DIFFICULTY_TABLE.find(e => e.min <= 20 && e.max >= 20);
      expect(entry?.result.difficulty).toBe(ServiceDifficulty.MUITO_DIFICIL);
      expect(entry?.result.baseReward).toBe("2d4+1 PO$");
      expect(entry?.result.recurrence).toBe("+25 C$");
    });
  });

  describe("Progressão de Recompensas", () => {
    it("deve ter progressão crescente de recorrência", () => {
      const recurrenceValues = SERVICE_DIFFICULTY_TABLE.map(entry => {
        const match = entry.result.recurrence.match(/\+([0-9,]+)/);
        return match ? parseFloat(match[1].replace(',', '.')) : 0;
      });
      
      // Verificar que valores são crescentes (com algumas exceções por ranges)
      const uniqueValues = [...new Set(recurrenceValues)].sort((a, b) => a - b);
      expect(uniqueValues).toEqual([0.5, 1, 2, 3, 5, 6, 7, 10, 12, 15, 17, 25]);
    });

    it("deve ter formatos de recompensa válidos", () => {
      SERVICE_DIFFICULTY_TABLE.forEach(entry => {
        const { baseReward } = entry.result;
        // Verificar formatos: "1d6 C$", "3d4 C$", "(1d3+1)*10 C$", "3d4*10 C$", "2d4+1 PO$"
        const validFormats = [
          /^\d+d\d+(\+\d+)?\s+(C\$|PO\$)$/, // Formato simples
          /^\d+d\d+\*\d+\s+(C\$|PO\$)$/, // Formato com multiplicação
          /^\(\d+d\d+(\+\d+)?\)\*\d+\s+(C\$|PO\$)$/ // Formato com parênteses
        ];
        
        const isValid = validFormats.some(regex => regex.test(baseReward));
        expect(isValid).toBe(true);
      });
    });
  });
});

describe("SERVICE_COMPLEXITY_TABLE", () => {
  describe("Cobertura e Estrutura da Tabela", () => {
    it("deve cobrir todos os valores de 1 a 20 sem gaps", () => {
      const coveredValues = new Set<number>();
      
      SERVICE_COMPLEXITY_TABLE.forEach(entry => {
        for (let i = entry.min; i <= entry.max; i++) {
          expect(coveredValues.has(i)).toBe(false); // Não deve haver sobreposição
          coveredValues.add(i);
        }
      });
      
      // Verificar cobertura completa de 1d20
      for (let i = 1; i <= 20; i++) {
        expect(coveredValues.has(i)).toBe(true);
      }
      
      expect(coveredValues.size).toBe(20);
    });

    it("deve ter 7 entradas conforme especificação do markdown", () => {
      expect(SERVICE_COMPLEXITY_TABLE).toHaveLength(7);
    });

    it("deve ter estrutura correta para cada entrada", () => {
      SERVICE_COMPLEXITY_TABLE.forEach(entry => {
        expect(entry).toHaveProperty('min');
        expect(entry).toHaveProperty('max');
        expect(entry).toHaveProperty('result');
        
        const { result } = entry;
        expect(result).toHaveProperty('complexity');
        expect(result).toHaveProperty('testCount');
        expect(result).toHaveProperty('skillRequirement');
        expect(result).toHaveProperty('difficultyModifiers');
        expect(result).toHaveProperty('successOutcomes');
        expect(result).toHaveProperty('description');
        
        expect(typeof result.complexity).toBe('string');
        expect(typeof result.testCount).toBe('number');
        expect(['same', 'different', 'mixed']).toContain(result.skillRequirement);
        expect(Array.isArray(result.difficultyModifiers)).toBe(true);
        expect(typeof result.successOutcomes).toBe('object');
        expect(typeof result.description).toBe('string');
      });
    });
  });

  describe("Valores Específicos de Complexidade Conforme Markdown", () => {
    it("deve retornar 'Simples' para rolagens 1-10", () => {
      [1, 5, 10].forEach(roll => {
        const entry = SERVICE_COMPLEXITY_TABLE.find(e => e.min <= roll && e.max >= roll);
        expect(entry?.result.complexity).toBe(ServiceComplexity.SIMPLES);
        expect(entry?.result.testCount).toBe(1);
        expect(entry?.result.skillRequirement).toBe("same");
        expect(entry?.result.difficultyModifiers).toEqual([0]);
      });
    });

    it("deve retornar 'Moderada e Direta' para rolagens 11-12", () => {
      [11, 12].forEach(roll => {
        const entry = SERVICE_COMPLEXITY_TABLE.find(e => e.min <= roll && e.max >= roll);
        expect(entry?.result.complexity).toBe(ServiceComplexity.MODERADA_E_DIRETA);
        expect(entry?.result.testCount).toBe(2);
        expect(entry?.result.skillRequirement).toBe("same");
        expect(entry?.result.difficultyModifiers).toEqual([0, 0]);
      });
    });

    it("deve retornar 'Moderada' para rolagens 13-15", () => {
      [13, 14, 15].forEach(roll => {
        const entry = SERVICE_COMPLEXITY_TABLE.find(e => e.min <= roll && e.max >= roll);
        expect(entry?.result.complexity).toBe(ServiceComplexity.MODERADA);
        expect(entry?.result.testCount).toBe(2);
        expect(entry?.result.skillRequirement).toBe("different");
        expect(entry?.result.difficultyModifiers).toEqual([0, 0]);
      });
    });

    it("deve retornar 'Complexa e Direta' para rolagem 16", () => {
      const entry = SERVICE_COMPLEXITY_TABLE.find(e => e.min <= 16 && e.max >= 16);
      expect(entry?.result.complexity).toBe(ServiceComplexity.COMPLEXA_E_DIRETA);
      expect(entry?.result.testCount).toBe(3);
      expect(entry?.result.skillRequirement).toBe("mixed");
      expect(entry?.result.difficultyModifiers).toEqual([0, -1, 1]);
    });

    it("deve retornar 'Complexa' para rolagens 17-18", () => {
      [17, 18].forEach(roll => {
        const entry = SERVICE_COMPLEXITY_TABLE.find(e => e.min <= roll && e.max >= roll);
        expect(entry?.result.complexity).toBe(ServiceComplexity.COMPLEXA);
        expect(entry?.result.testCount).toBe(3);
        expect(entry?.result.skillRequirement).toBe("different");
        expect(entry?.result.difficultyModifiers).toEqual([0, -1, 1]);
      });
    });

    it("deve retornar 'Extremamente complexa e Direta' para rolagem 19", () => {
      const entry = SERVICE_COMPLEXITY_TABLE.find(e => e.min <= 19 && e.max >= 19);
      expect(entry?.result.complexity).toBe(ServiceComplexity.EXTREMAMENTE_COMPLEXA_E_DIRETA);
      expect(entry?.result.testCount).toBe(5);
      expect(entry?.result.skillRequirement).toBe("mixed");
      expect(entry?.result.difficultyModifiers).toEqual([0, 1, 2, -1, -2]);
    });

    it("deve retornar 'Extremamente complexa' para rolagem 20", () => {
      const entry = SERVICE_COMPLEXITY_TABLE.find(e => e.min <= 20 && e.max >= 20);
      expect(entry?.result.complexity).toBe(ServiceComplexity.EXTREMAMENTE_COMPLEXA);
      expect(entry?.result.testCount).toBe(5);
      expect(entry?.result.skillRequirement).toBe("different");
      expect(entry?.result.difficultyModifiers).toEqual([0, 1, 2, -1, -2]);
    });
  });

  describe("Estrutura de Sucessos e Falhas", () => {
    it("deve ter outcomes corretos para complexidade Simples", () => {
      const entry = SERVICE_COMPLEXITY_TABLE.find(e => 
        e.result.complexity === ServiceComplexity.SIMPLES
      );
      const outcomes = entry?.result.successOutcomes;
      
      expect(outcomes?.[0]).toEqual({
        result: "Serviço mal feito",
        renownModifier: 0,
        rewardModifier: 1
      });
      expect(outcomes?.[1]).toEqual({
        result: "Serviço bem feito",
        renownModifier: 0,
        rewardModifier: 1
      });
    });

    it("deve ter outcomes corretos para complexidade Extremamente Complexa", () => {
      const entry = SERVICE_COMPLEXITY_TABLE.find(e => 
        e.result.complexity === ServiceComplexity.EXTREMAMENTE_COMPLEXA
      );
      const outcomes = entry?.result.successOutcomes;
      
      expect(outcomes?.[0]).toEqual({
        result: "Fracasso total",
        renownModifier: -5,
        rewardModifier: 0
      });
      expect(outcomes?.[5]).toEqual({
        result: "Trabalho primoroso",
        renownModifier: 1,
        rewardModifier: 2
      });
    });
  });
});

describe("calculateServiceReward", () => {
  describe("Validação de Entrada", () => {
    it("deve lançar erro para dificuldade inexistente", () => {
      expect(() => {
        calculateServiceReward("Dificuldade Inexistente" as ServiceDifficulty);
      }).toThrow("Dificuldade não encontrada");
    });

    it("deve processar todas as dificuldades válidas", () => {
      const validDifficulties = [
        ServiceDifficulty.MUITO_FACIL,
        ServiceDifficulty.FACIL_ND14,
        ServiceDifficulty.FACIL_ND15,
        ServiceDifficulty.FACIL_ND16,
        ServiceDifficulty.MEDIA_ND17,
        ServiceDifficulty.MEDIA_ND18,
        ServiceDifficulty.MEDIA_ND19,
        ServiceDifficulty.DIFICIL_ND20,
        ServiceDifficulty.DIFICIL_ND21,
        ServiceDifficulty.DESAFIADOR_ND22,
        ServiceDifficulty.DESAFIADOR_ND23,
        ServiceDifficulty.MUITO_DIFICIL
      ];

      validDifficulties.forEach(difficulty => {
        expect(() => calculateServiceReward(difficulty)).not.toThrow();
      });
    });
  });

  describe("Cálculo de Recompensas", () => {
    it("deve calcular corretamente recompensa para Muito Fácil", () => {
      const reward = calculateServiceReward(ServiceDifficulty.MUITO_FACIL);
      
      expect(reward.baseDice).toBe("1d6 C$");
      expect(reward.currency).toBe("C$");
      expect(reward.recurrenceBonus).toBe(0.5);
      expect(reward.amount).toBeGreaterThan(0);
      expect(reward.amount).toBeLessThanOrEqual(6);
    });

    it("deve calcular corretamente recompensa para Muito Difícil", () => {
      const reward = calculateServiceReward(ServiceDifficulty.MUITO_DIFICIL);
      
      expect(reward.baseDice).toBe("2d4+1 PO$");
      expect(reward.currency).toBe("PO$");
      expect(reward.recurrenceBonus).toBe(25);
      expect(reward.amount).toBeGreaterThan(2); // Mínimo 2d4+1 = 3
      expect(reward.amount).toBeLessThanOrEqual(9); // Máximo 2d4+1 = 9
    });

    it("deve calcular corretamente formatos complexos", () => {
      const rewardND18 = calculateServiceReward(ServiceDifficulty.MEDIA_ND18);
      expect(rewardND18.baseDice).toBe("(1d3+1)*10 C$");
      expect(rewardND18.currency).toBe("C$");
      expect(rewardND18.amount).toBeGreaterThanOrEqual(20); // (1+1)*10 = 20
      expect(rewardND18.amount).toBeLessThanOrEqual(40); // (3+1)*10 = 40

      const rewardND20 = calculateServiceReward(ServiceDifficulty.DIFICIL_ND20);
      expect(rewardND20.baseDice).toBe("3d4*10 C$");
      expect(rewardND20.currency).toBe("C$");
      expect(rewardND20.amount).toBeGreaterThanOrEqual(30); // 3*1*10 = 30
      expect(rewardND20.amount).toBeLessThanOrEqual(120); // 3*4*10 = 120
    });
  });
});

describe("getComplexityRequirements", () => {
  describe("Validação de Entrada", () => {
    it("deve lançar erro para complexidade inexistente", () => {
      expect(() => {
        getComplexityRequirements("Complexidade Inexistente" as ServiceComplexity);
      }).toThrow("Complexidade não encontrada");
    });

    it("deve processar todas as complexidades válidas", () => {
      const validComplexities = [
        ServiceComplexity.SIMPLES,
        ServiceComplexity.MODERADA_E_DIRETA,
        ServiceComplexity.MODERADA,
        ServiceComplexity.COMPLEXA_E_DIRETA,
        ServiceComplexity.COMPLEXA,
        ServiceComplexity.EXTREMAMENTE_COMPLEXA_E_DIRETA,
        ServiceComplexity.EXTREMAMENTE_COMPLEXA
      ];

      validComplexities.forEach(complexity => {
        expect(() => getComplexityRequirements(complexity)).not.toThrow();
      });
    });
  });

  describe("Requisitos por Complexidade", () => {
    it("deve retornar requisitos corretos para Simples", () => {
      const requirements = getComplexityRequirements(ServiceComplexity.SIMPLES);
      
      expect(requirements.complexity).toBe(ServiceComplexity.SIMPLES);
      expect(requirements.testCount).toBe(1);
      expect(requirements.skillRequirement).toBe("same");
      expect(requirements.difficultyModifiers).toEqual([0]);
    });

    it("deve retornar requisitos corretos para Extremamente Complexa", () => {
      const requirements = getComplexityRequirements(ServiceComplexity.EXTREMAMENTE_COMPLEXA);
      
      expect(requirements.complexity).toBe(ServiceComplexity.EXTREMAMENTE_COMPLEXA);
      expect(requirements.testCount).toBe(5);
      expect(requirements.skillRequirement).toBe("different");
      expect(requirements.difficultyModifiers).toEqual([0, 1, 2, -1, -2]);
    });
  });
});

describe("calculateServiceResult", () => {
  describe("Cálculo de Resultados", () => {
    it("deve calcular resultado correto para Simples com sucesso", () => {
      const result = calculateServiceResult(ServiceComplexity.SIMPLES, 1);
      
      expect(result.result).toBe("Serviço bem feito");
      expect(result.renownModifier).toBe(0);
      expect(result.rewardModifier).toBe(1);
    });

    it("deve calcular resultado correto para Extremamente Complexa com trabalho primoroso", () => {
      const result = calculateServiceResult(ServiceComplexity.EXTREMAMENTE_COMPLEXA, 5);
      
      expect(result.result).toBe("Trabalho primoroso");
      expect(result.renownModifier).toBe(1);
      expect(result.rewardModifier).toBe(2);
    });

    it("deve lançar erro para número de sucessos inválido", () => {
      expect(() => {
        calculateServiceResult(ServiceComplexity.SIMPLES, 5);
      }).toThrow("Número de sucessos inválido");
    });
  });
});

describe("getTestDifficulties", () => {
  describe("Cálculo de NDs", () => {
    it("deve calcular NDs corretas para Simples", () => {
      const difficulties = getTestDifficulties(ServiceComplexity.SIMPLES, 17);
      expect(difficulties).toEqual([17]);
    });

    it("deve calcular NDs corretas para Complexa e Direta", () => {
      const difficulties = getTestDifficulties(ServiceComplexity.COMPLEXA_E_DIRETA, 17);
      expect(difficulties).toEqual([17, 16, 18]); // ND padrão, -1, +1
    });

    it("deve calcular NDs corretas para Extremamente Complexa", () => {
      const difficulties = getTestDifficulties(ServiceComplexity.EXTREMAMENTE_COMPLEXA, 17);
      expect(difficulties).toEqual([17, 18, 19, 16, 15]); // ND padrão, +1, +2, -1, -2
    });
  });
});

describe("Integração entre Dificuldade e Complexidade", () => {
  describe("Combinação de Sistemas", () => {
    it("deve funcionar com todas as combinações de dificuldade e complexidade", () => {
      const difficulties = [
        ServiceDifficulty.MUITO_FACIL,
        ServiceDifficulty.MEDIA_ND18,
        ServiceDifficulty.MUITO_DIFICIL
      ];
      
      const complexities = [
        ServiceComplexity.SIMPLES,
        ServiceComplexity.MODERADA,
        ServiceComplexity.EXTREMAMENTE_COMPLEXA
      ];

      difficulties.forEach(difficulty => {
        complexities.forEach(complexity => {
          expect(() => {
            calculateServiceReward(difficulty);
            getComplexityRequirements(complexity);
            calculateSuccessChance(complexity);
          }).not.toThrow();
        });
      });
    });

    it("deve manter consistência entre tabelas", () => {
      // Verificar que todas as dificuldades na tabela são válidas
      SERVICE_DIFFICULTY_TABLE.forEach(entry => {
        expect(Object.values(ServiceDifficulty)).toContain(entry.result.difficulty);
      });

      // Verificar que todas as complexidades na tabela são válidas  
      SERVICE_COMPLEXITY_TABLE.forEach(entry => {
        expect(Object.values(ServiceComplexity)).toContain(entry.result.complexity);
      });
    });
  });
});
