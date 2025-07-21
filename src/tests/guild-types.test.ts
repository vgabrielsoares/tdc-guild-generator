import { describe, it, expect } from "vitest";
import type {
  Guild,
  GuildStructure,
  GuildRelations,
  GuildStaff,
  GuildVisitors,
  GuildResources,
  GuildGenerationConfig,
  GuildGenerationResult,
} from "../types/guild";
import {
  ResourceLevel,
  VisitorLevel,
  RelationLevel,
  SettlementType,
  createGuild,
  createGuildGenerationConfig,
  isGuild,
  isGuildGenerationConfig,
  GuildSchema,
  GuildGenerationConfigSchema,
} from "../types/guild";

describe("Issue 3.1 - Guild TypeScript Types", () => {
  describe("Enums", () => {
    it("should have correct ResourceLevel values", () => {
      expect(ResourceLevel.ESCASSOS).toBe("Escassos");
      expect(ResourceLevel.LIMITADOS).toBe("Limitados");
      expect(ResourceLevel.BÁSICOS).toBe("Básicos");
      expect(ResourceLevel.ADEQUADOS).toBe("Adequados");
      expect(ResourceLevel.ABUNDANTES).toBe("Abundantes");
      expect(ResourceLevel.VASTOS).toBe("Vastos");
      expect(ResourceLevel.LENDARIOS).toBe("Lendários");
    });

    it("should have correct VisitorLevel values", () => {
      expect(VisitorLevel.VAZIA).toBe("Vazia");
      expect(VisitorLevel.QUASE_DESERTA).toBe("Quase deserta");
      expect(VisitorLevel.POUCO_MOVIMENTADA).toBe("Pouco movimentada");
      expect(VisitorLevel.NEM_MUITO_NEM_POUCO).toBe("Nem muito nem pouco");
      expect(VisitorLevel.MUITO_FREQUENTADA).toBe("Muito frequentada");
      expect(VisitorLevel.ABARROTADA).toBe("Abarrotada");
      expect(VisitorLevel.LOTADA).toBe("Lotada");
    });

    it("should have correct RelationLevel values", () => {
      expect(RelationLevel.HOSTIL).toBe("Hostil");
      expect(RelationLevel.SUSPEITA).toBe("Suspeita");
      expect(RelationLevel.INDIFERENTE).toBe("Indiferente");
      expect(RelationLevel.TOLERANTE).toBe("Tolerante");
      expect(RelationLevel.COOPERATIVA).toBe("Cooperativa");
      expect(RelationLevel.ALIADA).toBe("Aliada");
      expect(RelationLevel.TEMIDA).toBe("Temida");
      expect(RelationLevel.DESCONFIADA).toBe("Desconfiada");
      expect(RelationLevel.RESPEITADA).toBe("Respeitada");
      expect(RelationLevel.ADMIRADA).toBe("Admirada");
      expect(RelationLevel.REVERENCIADA).toBe("Reverenciada");
    });

    it("should have correct SettlementType values", () => {
      expect(SettlementType.LUGAREJO).toBe("Lugarejo");
      expect(SettlementType.ALDEIA).toBe("Aldeia");
      expect(SettlementType.CIDADE_PEQUENA).toBe("Cidade Pequena");
      expect(SettlementType.CIDADE_GRANDE).toBe("Cidade Grande");
      expect(SettlementType.METROPOLE).toBe("Metrópole");
    });
  });

  describe("Guild Structure Interface", () => {
    it("should create valid GuildStructure object", () => {
      const structure: GuildStructure = {
        size: "Pequena (5m x 5m)",
        characteristics: ["Bem conservada", "Modernidade mágica"],
        location: "Centro da cidade",
        description: "Uma guilda acolhedora",
      };

      expect(structure.size).toBe("Pequena (5m x 5m)");
      expect(structure.characteristics).toHaveLength(2);
      expect(structure.location).toBe("Centro da cidade");
      expect(structure.description).toBe("Uma guilda acolhedora");
    });
  });

  describe("Guild Relations Interface", () => {
    it("should create valid GuildRelations object", () => {
      const relations: GuildRelations = {
        government: RelationLevel.INDIFERENTE,
        population: RelationLevel.RESPEITADA,
        notes: "Relações estáveis",
      };

      expect(relations.government).toBe(RelationLevel.INDIFERENTE);
      expect(relations.population).toBe(RelationLevel.RESPEITADA);
      expect(relations.notes).toBe("Relações estáveis");
    });
  });

  describe("Guild Staff Interface", () => {
    it("should create valid GuildStaff object", () => {
      const staff: GuildStaff = {
        employees: "1d6+3 funcionários experientes",
        description: "Equipe qualificada",
        count: 6,
      };

      expect(staff.employees).toBe("1d6+3 funcionários experientes");
      expect(staff.description).toBe("Equipe qualificada");
      expect(staff.count).toBe(6);
    });
  });

  describe("Guild Visitors Interface", () => {
    it("should create valid GuildVisitors object", () => {
      const visitors: GuildVisitors = {
        frequency: VisitorLevel.MUITO_FREQUENTADA,
        description: "Muitos aventureiros",
        types: ["Aventureiros", "Mercadores", "Nobres"],
      };

      expect(visitors.frequency).toBe(VisitorLevel.MUITO_FREQUENTADA);
      expect(visitors.description).toBe("Muitos aventureiros");
      expect(visitors.types).toHaveLength(3);
    });
  });

  describe("Guild Resources Interface", () => {
    it("should create valid GuildResources object", () => {
      const resources: GuildResources = {
        level: ResourceLevel.ADEQUADOS,
        description: "Recursos suficientes",
        details: ["Cofres bem abastecidos", "Equipamentos básicos"],
      };

      expect(resources.level).toBe(ResourceLevel.ADEQUADOS);
      expect(resources.description).toBe("Recursos suficientes");
      expect(resources.details).toHaveLength(2);
    });
  });

  describe("Guild Main Interface", () => {
    it("should create valid Guild object", () => {
      const guild: Guild = {
        id: "guild-001",
        name: "Guilda dos Aventureiros",
        structure: {
          size: "Média (10m x 10m)",
          characteristics: ["Bem conservada"],
        },
        relations: {
          government: RelationLevel.INDIFERENTE,
          population: RelationLevel.RESPEITADA,
        },
        staff: {
          employees: "1d6+2 funcionários",
        },
        visitors: {
          frequency: VisitorLevel.POUCO_MOVIMENTADA,
        },
        resources: {
          level: ResourceLevel.ADEQUADOS,
        },
        settlementType: SettlementType.CIDADE_PEQUENA,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(guild.id).toBe("guild-001");
      expect(guild.name).toBe("Guilda dos Aventureiros");
      expect(guild.settlementType).toBe(SettlementType.CIDADE_PEQUENA);
    });
  });

  describe("Guild Generation Config Interface", () => {
    it("should create valid GuildGenerationConfig object", () => {
      const config: GuildGenerationConfig = {
        settlementType: SettlementType.METROPOLE,
        useModifiers: true,
        customModifiers: {
          structure: 5,
          visitors: 3,
        },
      };

      expect(config.settlementType).toBe(SettlementType.METROPOLE);
      expect(config.useModifiers).toBe(true);
      expect(config.customModifiers?.structure).toBe(5);
      expect(config.customModifiers?.visitors).toBe(3);
    });
  });

  describe("Guild Generation Result Interface", () => {
    it("should create valid GuildGenerationResult object", () => {
      const result: GuildGenerationResult = {
        guild: {
          id: "test-guild-123",
          name: "Guilda de Teste",
          structure: {
            size: "Grande (15m x 15m)",
            characteristics: ["Luxuosa", "Fortificada"],
          },
          relations: {
            government: RelationLevel.ALIADA,
            population: RelationLevel.ADMIRADA,
          },
          staff: {
            employees: "2d6+5 funcionários experientes",
          },
          visitors: {
            frequency: VisitorLevel.LOTADA,
          },
          resources: {
            level: ResourceLevel.ABUNDANTES,
          },
          settlementType: SettlementType.METROPOLE,
          createdAt: new Date(),
        },
        rolls: {
          structure: {
            size: 18,
            characteristics: [12, 8],
          },
          relations: {
            government: 9,
            population: 11,
          },
          staff: 15,
          visitors: 23,
          resources: 16,
        },
        logs: ["Rolling for guild structure...", "Generated large guild"],
      };

      expect(result.guild.settlementType).toBe(SettlementType.METROPOLE);
      expect(result.rolls.structure.size).toBe(18);
      expect(result.rolls.structure.characteristics).toHaveLength(2);
      expect(result.logs).toHaveLength(2);
    });
  });

  describe("Zod Schema Validation", () => {
    it("should validate valid guild with GuildSchema", () => {
      const validGuild = {
        id: "test-guild-id",
        name: "Guilda de Teste",
        structure: {
          size: "Pequena (5m x 5m)",
          characteristics: ["Bem conservada"],
        },
        relations: {
          government: RelationLevel.INDIFERENTE,
          population: RelationLevel.RESPEITADA,
        },
        staff: {
          employees: "1d4+1 funcionários",
        },
        visitors: {
          frequency: VisitorLevel.POUCO_MOVIMENTADA,
        },
        resources: {
          level: ResourceLevel.ADEQUADOS,
        },
        settlementType: SettlementType.ALDEIA,
        createdAt: new Date(),
      };

      const result = GuildSchema.safeParse(validGuild);
      expect(result.success).toBe(true);
    });

    it("should reject invalid guild with GuildSchema", () => {
      const invalidGuild = {
        structure: {
          size: "", // Empty size should fail
          characteristics: [], // Empty characteristics should fail
        },
        relations: {
          government: "INVALID_RELATION", // Invalid enum value
          population: RelationLevel.RESPEITADA,
        },
        staff: {
          employees: "", // Empty employees should fail
        },
        visitors: {
          frequency: VisitorLevel.POUCO_MOVIMENTADA,
        },
        resources: {
          level: ResourceLevel.ADEQUADOS,
        },
        settlementType: SettlementType.ALDEIA,
      };

      const result = GuildSchema.safeParse(invalidGuild);
      expect(result.success).toBe(false);
    });

    it("should validate valid generation config with GuildGenerationConfigSchema", () => {
      const validConfig = {
        settlementType: SettlementType.CIDADE_GRANDE,
        useModifiers: true,
        customModifiers: {
          structure: 2,
          visitors: -1,
        },
      };

      const result = GuildGenerationConfigSchema.safeParse(validConfig);
      expect(result.success).toBe(true);
    });
  });

  describe("Type Guards", () => {
    it("should correctly identify valid Guild objects", () => {
      const validGuild = {
        id: "test-guild-id",
        name: "Guilda de Teste",
        structure: {
          size: "Média (10m x 10m)",
          characteristics: ["Moderna"],
        },
        relations: {
          government: RelationLevel.INDIFERENTE,
          population: RelationLevel.RESPEITADA,
        },
        staff: {
          employees: "1d6 funcionários",
        },
        visitors: {
          frequency: VisitorLevel.POUCO_MOVIMENTADA,
        },
        resources: {
          level: ResourceLevel.ADEQUADOS,
        },
        settlementType: SettlementType.CIDADE_PEQUENA,
        createdAt: new Date(),
      };

      expect(isGuild(validGuild)).toBe(true);
      expect(isGuild({})).toBe(false);
      expect(isGuild(null)).toBe(false);
    });

    it("should correctly identify valid GuildGenerationConfig objects", () => {
      const validConfig = {
        settlementType: SettlementType.METROPOLE,
        useModifiers: true,
      };

      expect(isGuildGenerationConfig(validConfig)).toBe(true);
      expect(isGuildGenerationConfig({})).toBe(false);
      expect(isGuildGenerationConfig(null)).toBe(false);
    });
  });

  describe("Utility Functions", () => {
    it("should create guild with createGuild function", () => {
      const guildData = {
        id: "test-guild-id",
        name: "Guilda de Teste",
        structure: {
          size: "Grande (15m x 15m)",
          characteristics: ["Luxuosa", "Segura"],
        },
        relations: {
          government: RelationLevel.ALIADA,
          population: RelationLevel.ADMIRADA,
        },
        staff: {
          employees: "2d6+3 funcionários experientes",
        },
        visitors: {
          frequency: VisitorLevel.LOTADA,
        },
        resources: {
          level: ResourceLevel.ABUNDANTES,
        },
        settlementType: SettlementType.METROPOLE,
        createdAt: new Date(),
      };

      const guild = createGuild(guildData);
      expect(guild.settlementType).toBe(SettlementType.METROPOLE);
      expect(guild.structure.size).toBe("Grande (15m x 15m)");
    });

    it("should throw error for invalid guild data in createGuild", () => {
      const invalidData = {
        structure: {
          size: "", // Invalid empty size
          characteristics: [],
        },
      };

      expect(() => createGuild(invalidData)).toThrow("Invalid guild data");
    });

    it("should create config with createGuildGenerationConfig function", () => {
      const configData = {
        settlementType: SettlementType.CIDADE_GRANDE,
        useModifiers: false,
      };

      const config = createGuildGenerationConfig(configData);
      expect(config.settlementType).toBe(SettlementType.CIDADE_GRANDE);
      expect(config.useModifiers).toBe(false);
    });

    it("should throw error for invalid config data in createGuildGenerationConfig", () => {
      const invalidConfigData = {
        settlementType: "INVALID_TYPE",
      };

      expect(() => createGuildGenerationConfig(invalidConfigData)).toThrow(
        "Invalid generation config"
      );
    });
  });
});
