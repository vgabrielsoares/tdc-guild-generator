import { describe, it, expect, vi } from "vitest";
import {
  calculateStaffModifier,
  applyNoticeModifiers,
  applyAlternativePaymentReduction,
  shouldTriggerCrossModuleIntegration,
  validateDependencies,
} from "@/utils/generators/noticeModifiers";
import type { Guild, GuildStaff } from "@/types/guild";
import {
  RelationLevel,
  VisitorLevel,
  ResourceLevel,
  SettlementType,
} from "@/types/guild";

describe("Notice Modifiers - Issue 7.16", () => {
  describe("calculateStaffModifier", () => {
    it("should roll -1d20 for despreparados staff", () => {
      const staff: GuildStaff = {
        employees: "Funcionários despreparados",
        description: "Funcionários sem treinamento adequado",
        count: 5,
      };

      // Mock do diceRoller para retornar 15
      const mockDiceRoller = vi.fn().mockReturnValue(15);
      const modifier = calculateStaffModifier(staff, mockDiceRoller);

      expect(mockDiceRoller).toHaveBeenCalledWith("1d20");
      expect(modifier).toBe(-15); // Negativo do valor rolado
    });

    it("should roll +1d20 for experientes staff", () => {
      const staff: GuildStaff = {
        employees: "Funcionários experientes",
        description: "Funcionários com ampla experiência",
        count: 8,
      };

      // Mock do diceRoller para retornar 12
      const mockDiceRoller = vi.fn().mockReturnValue(12);
      const modifier = calculateStaffModifier(staff, mockDiceRoller);

      expect(mockDiceRoller).toHaveBeenCalledWith("1d20");
      expect(modifier).toBe(12); // Positivo do valor rolado
    });

    it("should return 0 for normal staff without rolling", () => {
      const staff: GuildStaff = {
        employees: "Funcionários normais",
        description: "Funcionários com treinamento padrão",
        count: 6,
      };

      const mockDiceRoller = vi.fn();
      const modifier = calculateStaffModifier(staff, mockDiceRoller);

      expect(mockDiceRoller).not.toHaveBeenCalled(); // Não deve rolar para staff normal
      expect(modifier).toBe(0);
    });

    it("should use default diceRoller when none provided", () => {
      const staff: GuildStaff = {
        employees: "Funcionários experientes",
        description: "Funcionários com ampla experiência",
        count: 8,
      };

      const modifier = calculateStaffModifier(staff);
      // Deve retornar um número entre 1 e 20 (positivo para experientes)
      expect(modifier).toBeGreaterThanOrEqual(1);
      expect(modifier).toBeLessThanOrEqual(20);
    });
  });

  describe("applyAlternativePaymentReduction", () => {
    it("should reduce value to 1/3 of original", () => {
      const originalValue = 300;
      const reducedValue = applyAlternativePaymentReduction(originalValue);
      expect(reducedValue).toBe(100); // 300 / 3 = 100
    });

    it("should handle fractional results by flooring", () => {
      const originalValue = 100;
      const reducedValue = applyAlternativePaymentReduction(originalValue);
      expect(reducedValue).toBe(33); // Math.floor(100 / 3) = 33
    });

    it("should handle zero value", () => {
      const originalValue = 0;
      const reducedValue = applyAlternativePaymentReduction(originalValue);
      expect(reducedValue).toBe(0);
    });
  });

  describe("shouldTriggerCrossModuleIntegration", () => {
    it("should trigger integration for contracts notice type with dynamic quantity", () => {
      // Mock do diceRoller para retornar 3
      const mockDiceRoller = vi.fn().mockReturnValue(3);
      const result = shouldTriggerCrossModuleIntegration(
        "contracts",
        mockDiceRoller
      );

      expect(mockDiceRoller).toHaveBeenCalledWith("1d4");
      expect(result.shouldTrigger).toBe(true);
      expect(result.moduleType).toBe("contracts");
      expect(result.quantity).toBe(3); // Valor rolado
    });

    it("should trigger integration for services notice type with dynamic quantity", () => {
      // Mock do diceRoller para retornar 2
      const mockDiceRoller = vi.fn().mockReturnValue(2);
      const result = shouldTriggerCrossModuleIntegration(
        "services",
        mockDiceRoller
      );

      expect(mockDiceRoller).toHaveBeenCalledWith("1d4");
      expect(result.shouldTrigger).toBe(true);
      expect(result.moduleType).toBe("services");
      expect(result.quantity).toBe(2); // Valor rolado
    });

    it("should trigger integration for '1d4 contratos' notice type", () => {
      // Mock do diceRoller para retornar 4
      const mockDiceRoller = vi.fn().mockReturnValue(4);
      const result = shouldTriggerCrossModuleIntegration(
        "1d4 contratos",
        mockDiceRoller
      );

      expect(mockDiceRoller).toHaveBeenCalledWith("1d4");
      expect(result.shouldTrigger).toBe(true);
      expect(result.moduleType).toBe("contracts");
      expect(result.quantity).toBe(4); // Valor rolado
    });

    it("should trigger integration for '1d4 serviços' notice type", () => {
      // Mock do diceRoller para retornar 1
      const mockDiceRoller = vi.fn().mockReturnValue(1);
      const result = shouldTriggerCrossModuleIntegration(
        "1d4 serviços",
        mockDiceRoller
      );

      expect(mockDiceRoller).toHaveBeenCalledWith("1d4");
      expect(result.shouldTrigger).toBe(true);
      expect(result.moduleType).toBe("services");
      expect(result.quantity).toBe(1); // Valor rolado
    });

    it("should not trigger integration for other notice types", () => {
      const mockDiceRoller = vi.fn();
      const result = shouldTriggerCrossModuleIntegration(
        "announcement",
        mockDiceRoller
      );

      expect(mockDiceRoller).not.toHaveBeenCalled(); // Não deve rolar para outros tipos
      expect(result.shouldTrigger).toBe(false);
      expect(result.moduleType).toBeUndefined();
    });

    it("should use default diceRoller when none provided", () => {
      const result = shouldTriggerCrossModuleIntegration("contracts");

      expect(result.shouldTrigger).toBe(true);
      expect(result.moduleType).toBe("contracts");
      // Deve retornar um número entre 1 e 4
      expect(result.quantity).toBeGreaterThanOrEqual(1);
      expect(result.quantity).toBeLessThanOrEqual(4);
    });
  });

  describe("validateDependencies", () => {
    const createMockGuild = (overrides: Partial<Guild> = {}): Guild => ({
      id: "test-guild-1",
      name: "Test Guild",
      structure: {
        size: "Médio (9m x 6m)",
        location: "Centro da cidade",
        description: "Uma guilda bem estabelecida",
        characteristics: ["Bem organizada", "Eficiente"],
      },
      relations: {
        government: RelationLevel.BOA,
        population: RelationLevel.BOA,
      },
      visitors: {
        frequency: VisitorLevel.MUITO_FREQUENTADA,
        description: "Visitantes ocasionais",
      },
      staff: {
        employees: "Funcionários competentes",
        description: "Equipe bem treinada",
        count: 7,
      },
      resources: {
        level: ResourceLevel.SUFICIENTES,
        description: "Recursos suficientes",
        details: ["Ouro", "Equipamentos"],
      },
      settlementType: SettlementType.CIDADELA,
      createdAt: new Date(),
      ...overrides,
    });

    it("should validate successfully for contracts with proper guild", () => {
      const guild = createMockGuild();
      const result = validateDependencies(guild, "contracts");
      expect(result.isValid).toBe(true);
    });

    it("should validate successfully for services with proper guild", () => {
      const guild = createMockGuild();
      const result = validateDependencies(guild, "services");
      expect(result.isValid).toBe(true);
    });

    it("should fail validation for null guild", () => {
      const result = validateDependencies(null, "contracts");
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe("Guilda não está definida");
    });

    it("should fail validation for guild without ID", () => {
      const guild = createMockGuild({ id: "" });
      const result = validateDependencies(guild, "contracts");
      expect(result.isValid).toBe(false);
      expect(result.reason).toBe("ID da guilda não está definido");
    });
  });

  describe("applyNoticeModifiers", () => {
    const createMockGuild = (staffEmployees: string): Guild => ({
      id: "test-guild-1",
      name: "Test Guild",
      structure: {
        size: "Médio (9m x 6m)",
        location: "Centro da cidade",
        description: "Uma guilda bem estabelecida",
        characteristics: ["Bem organizada", "Eficiente"],
      },
      relations: {
        government: RelationLevel.BOA,
        population: RelationLevel.BOA,
      },
      visitors: {
        frequency: VisitorLevel.MUITO_FREQUENTADA,
        description: "Visitantes ocasionais",
      },
      staff: {
        employees: staffEmployees,
        description: "Equipe da guilda",
        count: 7,
      },
      resources: {
        level: ResourceLevel.SUFICIENTES,
        description: "Recursos suficientes",
        details: ["Ouro", "Equipamentos"],
      },
      settlementType: SettlementType.CIDADELA,
      createdAt: new Date(),
    });

    it("should apply positive modifier for experienced staff with dynamic rolling", () => {
      const guild = createMockGuild("Funcionários experientes");
      const mockDiceRoller = vi.fn().mockReturnValue(20); // Mock retorna 20
      const baseValue = 50;
      const result = applyNoticeModifiers(baseValue, guild, mockDiceRoller);

      expect(mockDiceRoller).toHaveBeenCalledWith("1d20");
      expect(result).toBe(70); // 50 + 20
    });

    it("should apply negative modifier for unprepared staff with dynamic rolling", () => {
      const guild = createMockGuild("Funcionários despreparados");
      const mockDiceRoller = vi.fn().mockReturnValue(20); // Mock retorna 20
      const baseValue = 50;
      const result = applyNoticeModifiers(baseValue, guild, mockDiceRoller);

      expect(mockDiceRoller).toHaveBeenCalledWith("1d20");
      expect(result).toBe(30); // 50 - 20
    });

    it("should not go below zero with dynamic rolling", () => {
      const guild = createMockGuild("Funcionários despreparados");
      const mockDiceRoller = vi.fn().mockReturnValue(15); // Mock retorna 15
      const baseValue = 10;
      const result = applyNoticeModifiers(baseValue, guild, mockDiceRoller);

      expect(mockDiceRoller).toHaveBeenCalledWith("1d20");
      expect(result).toBe(0); // Math.max(0, 10 - 15) = 0
    });

    it("should not modify for normal staff without rolling", () => {
      const guild = createMockGuild("Funcionários normais");
      const mockDiceRoller = vi.fn();
      const baseValue = 50;
      const result = applyNoticeModifiers(baseValue, guild, mockDiceRoller);

      expect(mockDiceRoller).not.toHaveBeenCalled(); // Não deve rolar para staff normal
      expect(result).toBe(50); // Sem modificação
    });
  });
});
