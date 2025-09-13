import { describe, it, expect } from "vitest";
import {
  CONTRACT_DICE_BY_SIZE,
  STAFF_CONDITION_MODIFIERS,
  CONTRACT_QUANTITY_TABLE,
  CROWD_REDUCTION_TABLE,
  CONTRACT_DEADLINE_TABLE,
  CONTRACT_VALUE_TABLE,
  CONTRACT_DIFFICULTY_TABLE,
  CONTRACT_DISTANCE_TABLE,
  POPULATION_RELATION_MODIFIERS,
  GOVERNMENT_RELATION_MODIFIERS,
  STAFF_PREPARATION_ROLL_MODIFIERS,
  DIVERSE_STAFF_BONUSES,
  getContractDiceBySize,
  getStaffModifier,
  calculateExtendedValue,
  getPopulationRelationModifiers,
  getGovernmentRelationModifiers,
  getStaffPreparationRollModifier,
  getDiverseStaffBonus,
} from "@/data/tables/contract-base-tables";

describe("Contract Base Tables - Issue 4.3", () => {
  describe("CONTRACT_DICE_BY_SIZE", () => {
    it("should match exactly the headquarters size specifications from .md", () => {
      expect(getContractDiceBySize("Minúsculo (3m x 2m)")).toBe("1d4");
      expect(getContractDiceBySize("Muito pequeno (5m x 3m)")).toBe("1d6");
      expect(getContractDiceBySize("Pequeno e modesto (6m x 6m)")).toBe(
        "1d6+1"
      );
      expect(
        getContractDiceBySize("Pequeno e confortável (8m x 6m, +1 andar)")
      ).toBe("1d6+1");
      expect(getContractDiceBySize("Mediano e comum (9m x 9m)")).toBe("1d8+2");
      expect(
        getContractDiceBySize("Mediano em dobro (10m x 9m, +1 andar)")
      ).toBe("1d8+2");
      expect(getContractDiceBySize("Grande (12m x 12m)")).toBe("1d10+2");
      expect(
        getContractDiceBySize("Luxuosamente grande (12m x 12m, +2 andares)")
      ).toBe("1d12+4");
      expect(getContractDiceBySize("Enorme (15m x 15m, +1 andar)")).toBe(
        "1d20+4"
      );
      expect(
        getContractDiceBySize("Enorme e confortável (15m x 15m, +2 andares)")
      ).toBe("1d20+4");
      expect(getContractDiceBySize("Colossal (20m x 20m, +1 andar)")).toBe(
        "1d20+8"
      );
      expect(
        getContractDiceBySize("Colossal e primorosa (20m x 20m, +2 andares)")
      ).toBe("1d20+10");
    });

    it("should return default 1d4 for unknown sizes", () => {
      expect(getContractDiceBySize("Tamanho inexistente")).toBe("1d4");
    });
  });

  describe("STAFF_CONDITION_MODIFIERS", () => {
    it("should apply correct modifiers from .md specifications", () => {
      expect(getStaffModifier("despreparados")).toBe(-1);
      expect(getStaffModifier("experientes")).toBe(1);
      expect(getStaffModifier("inexistente")).toBe(0);
    });
  });

  describe("CONTRACT_QUANTITY_TABLE", () => {
    it("should cover all 1d20 ranges without gaps", () => {
      for (let roll = 1; roll <= 20; roll++) {
        const hasMatch = CONTRACT_QUANTITY_TABLE.some(
          (entry) => roll >= entry.min && roll <= entry.max
        );
        expect(hasMatch).toBe(true);
      }
    });

    it("should handle 21+ range correctly", () => {
      const entry21Plus = CONTRACT_QUANTITY_TABLE.find((e) => e.min === 21);
      expect(entry21Plus).toBeDefined();
      expect(entry21Plus?.result).toBe("5d6 contratos");
    });

    it("should match specific values from .md", () => {
      const roll1to4 = CONTRACT_QUANTITY_TABLE.find(
        (e) => e.min === 1 && e.max === 4
      );
      expect(roll1to4?.result).toBe("1 contrato");

      const roll20 = CONTRACT_QUANTITY_TABLE.find(
        (e) => e.min === 20 && e.max === 20
      );
      expect(roll20?.result).toBe("4d6 contratos");
    });
  });

  describe("CROWD_REDUCTION_TABLE", () => {
    it("should match all crowd levels from .md", () => {
      const vazia = CROWD_REDUCTION_TABLE.find((e) => e.min === 1);
      expect(vazia?.result.description).toBe("Vazia");
      expect(vazia?.result.reduction).toBe(
        "Todos os contratos estão disponíveis"
      );

      const quaseDeserta = CROWD_REDUCTION_TABLE.find((e) => e.min === 2);
      expect(quaseDeserta?.result.description).toBe("Quase deserta");
      expect(quaseDeserta?.result.reduction).toBe("-1 contrato");

      const lotada = CROWD_REDUCTION_TABLE.find((e) => e.min === 7);
      expect(lotada?.result.description).toBe("Lotada");
      expect(lotada?.result.reduction).toBe("-4d6 contratos");
    });
  });

  describe("CONTRACT_DEADLINE_TABLE", () => {
    it("should cover all 1d20 ranges for deadlines", () => {
      for (let roll = 1; roll <= 20; roll++) {
        const hasMatch = CONTRACT_DEADLINE_TABLE.some(
          (entry) => roll >= entry.min && roll <= entry.max
        );
        expect(hasMatch).toBe(true);
      }
    });

    it("should match specific deadline values from .md", () => {
      const roll1 = CONTRACT_DEADLINE_TABLE.find(
        (e) => e.min === 1 && e.max === 1
      );
      expect(roll1?.result.deadline).toBe("1d4 dias");

      const roll2 = CONTRACT_DEADLINE_TABLE.find(
        (e) => e.min === 2 && e.max === 2
      );
      expect(roll2?.result.deadline).toBe("3 dias");

      const semPrazo = CONTRACT_DEADLINE_TABLE.find((e) => e.min === 11);
      expect(semPrazo?.result.deadline).toBe("Sem prazo");
    });
  });

  describe("CONTRACT_VALUE_TABLE", () => {
    it("should cover all 1d100 ranges without gaps", () => {
      for (let roll = 1; roll <= 100; roll++) {
        const hasMatch = CONTRACT_VALUE_TABLE.some(
          (entry) => roll >= entry.min && roll <= entry.max
        );
        expect(hasMatch).toBe(true);
      }
    });

    it("should match specific values from .md", () => {
      // Verificar alguns valores específicos da tabela
      const roll1to8 = CONTRACT_VALUE_TABLE.find(
        (e) => e.min === 1 && e.max === 8
      );
      expect(roll1to8?.result).toBe(75);

      const roll9to15 = CONTRACT_VALUE_TABLE.find(
        (e) => e.min === 9 && e.max === 15
      );
      expect(roll9to15?.result).toBe(100);

      const roll100 = CONTRACT_VALUE_TABLE.find(
        (e) => e.min === 100 && e.max === 100
      );
      expect(roll100?.result).toBe(50000);
    });

    it("should have no overlapping ranges", () => {
      for (let i = 0; i < CONTRACT_VALUE_TABLE.length - 1; i++) {
        const current = CONTRACT_VALUE_TABLE[i];
        const next = CONTRACT_VALUE_TABLE[i + 1];
        expect(current.max).toBeLessThan(next.min);
      }
    });
  });

  describe("calculateExtendedValue", () => {
    it("should return base value for rolls <= 100", () => {
      expect(calculateExtendedValue(50, 1000)).toBe(1000);
      expect(calculateExtendedValue(100, 2500)).toBe(2500);
    });

    it("should follow rule 101+: previous value * 1.1 progression starting from table value 100", () => {
      // Rolagem 101: 50000 (valor de 100 na tabela) * 1.1 = 55000
      expect(calculateExtendedValue(101, 50000)).toBe(55000);

      // Rolagem 102: 55000 * 1.1 = 60500
      expect(calculateExtendedValue(102, 50000)).toBe(60500);

      // Rolagem 103: 60500 * 1.1 = 66550
      expect(calculateExtendedValue(103, 50000)).toBe(66550);

      // Rolagem 105: aplicar 5 multiplicações
      // 50000 -> 55000 -> 60500 -> 66550 -> 73205 -> 80525
      expect(calculateExtendedValue(105, 50000)).toBe(80525);
    });

    it("should always use table value for roll 100 as base (ignores baseValue parameter for 101+)", () => {
      // Para rolagens 101+, sempre usar o valor da rolagem 100 na tabela (50000)
      // independente do baseValue passado
      expect(calculateExtendedValue(101, 1000)).toBe(55000);
      expect(calculateExtendedValue(101, 9999)).toBe(55000);
      expect(calculateExtendedValue(102, 1000)).toBe(60500);

      // Isso garante consistência: rolagens 101+ sempre seguem a progressão
      // a partir do valor fixo da rolagem 100 na tabela
    });
  });

  describe("CONTRACT_DIFFICULTY_TABLE", () => {
    it("should cover all 1d20 ranges for difficulty", () => {
      for (let roll = 1; roll <= 20; roll++) {
        const hasMatch = CONTRACT_DIFFICULTY_TABLE.some(
          (entry) => roll >= entry.min && roll <= entry.max
        );
        expect(hasMatch).toBe(true);
      }
    });

    it("should match specific difficulty values from .md", () => {
      const easy = CONTRACT_DIFFICULTY_TABLE.find(
        (e) => e.min === 1 && e.max === 10
      );
      expect(easy?.result.experienceMultiplier).toBe(1);
      expect(easy?.result.rewardMultiplier).toBe(1);

      const medium = CONTRACT_DIFFICULTY_TABLE.find(
        (e) => e.min === 11 && e.max === 16
      );
      expect(medium?.result.experienceMultiplier).toBe(2);
      expect(medium?.result.rewardMultiplier).toBe(1.3);

      const hard = CONTRACT_DIFFICULTY_TABLE.find(
        (e) => e.min === 17 && e.max === 19
      );
      expect(hard?.result.experienceMultiplier).toBe(4);
      expect(hard?.result.rewardMultiplier).toBe(2);

      const deadly = CONTRACT_DIFFICULTY_TABLE.find(
        (e) => e.min === 20 && e.max === 20
      );
      expect(deadly?.result.experienceMultiplier).toBe(8);
      expect(deadly?.result.rewardMultiplier).toBe(3);
    });
  });

  describe("CONTRACT_DISTANCE_TABLE", () => {
    it("should cover all 1d20 ranges for distance", () => {
      for (let roll = 1; roll <= 20; roll++) {
        const hasMatch = CONTRACT_DISTANCE_TABLE.some(
          (entry) => roll >= entry.min && roll <= entry.max
        );
        expect(hasMatch).toBe(true);
      }
    });

    it("should match specific distance values from .md", () => {
      const close = CONTRACT_DISTANCE_TABLE.find(
        (e) => e.min === 1 && e.max === 4
      );
      expect(close?.result.description).toBe("Um hexágono ou menos");
      expect(close?.result.valueModifier).toBe(-20);
      expect(close?.result.rewardModifier).toBe(-20);

      const far = CONTRACT_DISTANCE_TABLE.find(
        (e) => e.min === 20 && e.max === 20
      );
      expect(far?.result.description).toBe("Oito hexágonos ou mais");
      expect(far?.result.valueModifier).toBe(20);
      expect(far?.result.rewardModifier).toBe(20);
    });
  });

  describe("POPULATION_RELATION_MODIFIERS", () => {
    it("should match all relation values from .md", () => {
      expect(getPopulationRelationModifiers("Péssima")).toEqual({
        valueModifier: 5,
        rewardModifier: -20,
      });

      expect(getPopulationRelationModifiers("Excelente")).toEqual({
        valueModifier: 0,
        rewardModifier: 5,
      });

      expect(getPopulationRelationModifiers("Inexistente")).toEqual({
        valueModifier: 0,
        rewardModifier: 0,
      });
    });
  });

  describe("GOVERNMENT_RELATION_MODIFIERS", () => {
    it("should match all government relation values from .md", () => {
      expect(getGovernmentRelationModifiers("Péssima")).toEqual({
        valueModifier: -25,
        rewardModifier: -25,
      });

      expect(getGovernmentRelationModifiers("Excelente")).toEqual({
        valueModifier: 5,
        rewardModifier: 10,
      });

      expect(getGovernmentRelationModifiers("Inexistente")).toEqual({
        valueModifier: 0,
        rewardModifier: 0,
      });
    });
  });

  describe("STAFF_PREPARATION_ROLL_MODIFIERS", () => {
    it("should apply correct roll modifiers for staff preparation", () => {
      expect(getStaffPreparationRollModifier("despreparados")).toBe(-2);
      expect(getStaffPreparationRollModifier("experientes")).toBe(2);
      expect(getStaffPreparationRollModifier("inexistente")).toBe(0);
    });
  });

  describe("DIVERSE_STAFF_BONUSES", () => {
    it("should provide correct bonuses for diverse staff types", () => {
      const clergy = getDiverseStaffBonus("Membros do clero");
      expect(clergy?.contractBonus).toBe("1d6");
      expect(clergy?.description).toContain("religião");

      const nobles = getDiverseStaffBonus("Nobres e seus serviçais");
      expect(nobles?.contractBonus).toBe("1d6");
      expect(nobles?.rewardBonus).toBe(10);

      const exAdventurers = getDiverseStaffBonus("Ex-aventureiros");
      expect(exAdventurers?.contractReduction).toBe("1d6");

      const nonExistent = getDiverseStaffBonus("Tipo inexistente");
      expect(nonExistent).toBeNull();
    });
  });

  describe("Table Validation", () => {
    it("should have all new tables properly defined", () => {
      expect(CONTRACT_DIFFICULTY_TABLE).toBeDefined();
      expect(CONTRACT_DISTANCE_TABLE).toBeDefined();
      expect(POPULATION_RELATION_MODIFIERS).toBeDefined();
      expect(GOVERNMENT_RELATION_MODIFIERS).toBeDefined();
      expect(STAFF_PREPARATION_ROLL_MODIFIERS).toBeDefined();
      expect(DIVERSE_STAFF_BONUSES).toBeDefined();
    });

    it("should have all original tables properly defined", () => {
      expect(CONTRACT_DICE_BY_SIZE).toBeDefined();
      expect(STAFF_CONDITION_MODIFIERS).toBeDefined();
      expect(CONTRACT_QUANTITY_TABLE).toBeDefined();
      expect(CROWD_REDUCTION_TABLE).toBeDefined();
      expect(CONTRACT_DEADLINE_TABLE).toBeDefined();
      expect(CONTRACT_VALUE_TABLE).toBeDefined();
    });

    it("should have consistent data structures for all tables", () => {
      // Verificar que todas as entradas de tabela têm min, max e result
      CONTRACT_QUANTITY_TABLE.forEach((entry) => {
        expect(entry.min).toBeDefined();
        expect(entry.max).toBeDefined();
        expect(entry.result).toBeDefined();
        expect(typeof entry.min).toBe("number");
        expect(typeof entry.max).toBe("number");
      });

      CONTRACT_VALUE_TABLE.forEach((entry) => {
        expect(entry.min).toBeDefined();
        expect(entry.max).toBeDefined();
        expect(entry.result).toBeDefined();
        expect(typeof entry.min).toBe("number");
        expect(typeof entry.max).toBe("number");
        expect(typeof entry.result).toBe("number");
      });

      CONTRACT_DIFFICULTY_TABLE.forEach((entry) => {
        expect(entry.result.difficulty).toBeDefined();
        expect(entry.result.experienceMultiplier).toBeDefined();
        expect(entry.result.rewardMultiplier).toBeDefined();
        expect(typeof entry.result.experienceMultiplier).toBe("number");
        expect(typeof entry.result.rewardMultiplier).toBe("number");
      });

      CONTRACT_DISTANCE_TABLE.forEach((entry) => {
        expect(entry.result.description).toBeDefined();
        expect(entry.result.valueModifier).toBeDefined();
        expect(entry.result.rewardModifier).toBeDefined();
        expect(typeof entry.result.valueModifier).toBe("number");
        expect(typeof entry.result.rewardModifier).toBe("number");
      });
    });
  });
});
