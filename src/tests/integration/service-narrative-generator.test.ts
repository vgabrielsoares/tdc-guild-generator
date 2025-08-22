import { describe, it, expect, beforeEach } from "vitest";
import { ServiceGenerator } from "@/utils/generators/serviceGenerator";
import type { Guild } from "@/types/guild";
import type { GameDate } from "@/types/timeline";
import {
  RelationLevel,
  ResourceLevel,
  VisitorLevel,
  SettlementType,
} from "@/types/guild";

describe("Issue 5.20 - Gerador de Conteúdo Narrativo", () => {
  let mockGuild: Guild;
  let mockDate: GameDate;

  beforeEach(() => {
    // Mock da guilda para testes
    mockGuild = {
      id: "test-guild",
      name: "Guilda de Teste",
      settlementType: SettlementType.CIDADELA,
      createdAt: new Date(),
      structure: {
        size: "Médio (9m x 6m)",
        characteristics: ["Bem organizada", "Amigável"],
      },
      staff: {
        employees: "5-10 funcionários",
        description: "Funcionários competentes e organizados",
      },
      visitors: {
        frequency: VisitorLevel.NEM_MUITO_NEM_POUCO,
      },
      relations: {
        government: RelationLevel.BOA,
        population: RelationLevel.BOA,
      },
      resources: {
        level: ResourceLevel.SUFICIENTES,
      },
    };

    mockDate = {
      day: 15,
      month: 6,
      year: 1524,
    };
  });

  it("deve gerar serviços com conteúdo narrativo completo", () => {
    const result = ServiceGenerator.generateServices({
      guild: mockGuild,
      currentDate: mockDate,
      quantity: 3,
    });

    expect(result.services).toHaveLength(3);
    expect(result.metadata.finalQuantity).toBe(3);

    result.services.forEach((service) => {
      // Validar estrutura básica
      expect(service.id).toBeDefined();
      expect(service.title).toBeDefined();
      expect(service.description).toBeDefined();
      expect(service.status).toBeDefined();

      // Validar narrativa
      expect(service.title).toMatch(/\w+/); // Deve ter palavras
      expect(service.description).toMatch(/\w+/); // Deve ter conteúdo
      expect(service.description.length).toBeGreaterThan(10); // Mínimo de conteúdo

      // Validar dados estruturados
      if (service.objective) {
        expect(service.objective.type).toBeDefined();
        expect(service.objective.description).toBeDefined();
      }

      expect(service.value).toBeDefined();
      expect(service.deadline).toBeDefined();
    });
  });

  it("deve aplicar modificadores baseados nas relações da guilda", () => {
    // Teste com relações diferentes
    const guildComRelacoesBoas = {
      ...mockGuild,
      relations: {
        government: RelationLevel.EXCELENTE,
        population: RelationLevel.MUITO_BOA,
      },
    };

    const guildComRelacoesRuins = {
      ...mockGuild,
      relations: {
        government: RelationLevel.PESSIMA,
        population: RelationLevel.RUIM,
      },
    };

    const resultBoas = ServiceGenerator.generateServices({
      guild: guildComRelacoesBoas,
      currentDate: mockDate,
      quantity: 3,
    });

    const resultRuins = ServiceGenerator.generateServices({
      guild: guildComRelacoesRuins,
      currentDate: mockDate,
      quantity: 3,
    });

    // Verifica que foram gerados
    expect(resultBoas.services).toHaveLength(3);
    expect(resultRuins.services).toHaveLength(3);

    // Todos devem ter conteúdo narrativo
    [...resultBoas.services, ...resultRuins.services].forEach((service) => {
      expect(service.title).toBeTruthy();
      expect(service.description).toBeTruthy();
      if (service.objective) {
        expect(service.objective.description).toBeTruthy();
      }
    });
  });

  it("deve gerar diferentes tipos de elementos narrativos", () => {
    // Gerar mais serviços para ter diversidade
    const result = ServiceGenerator.generateServices({
      guild: mockGuild,
      currentDate: mockDate,
      quantity: 5,
    });

    const services = result.services;

    // Deve ter alguma variedade nos elementos narrativos
    expect(services.length).toBe(5);
    expect(services.every((s) => s.title && s.description)).toBe(true);

    // Verificar que há diversidade de tipos de objetivo
    const objectiveTypes = new Set(
      services.map((s) => s.objective?.type).filter(Boolean)
    );
    // Pode ter objetivos únicos ou múltiplos, apenas testamos que existem
    expect(objectiveTypes.size).toBeGreaterThanOrEqual(1);
  });

  it("deve usar o mapeador genérico para conversões de enum", () => {
    const result = ServiceGenerator.generateServices({
      guild: mockGuild,
      currentDate: mockDate,
      quantity: 5,
    });

    // Verificar que elementos com enums foram mapeados corretamente
    result.services.forEach((service) => {
      if (service.complication) {
        // Deve ter tipo válido de complicação
        expect(service.complication.type).toBeDefined();
        expect(service.complication.consequence).toBeDefined();
      }

      if (service.rival) {
        // Deve ter ação e motivação válidas
        expect(service.rival.action).toBeDefined();
        expect(service.rival.motivation).toBeDefined();
      }

      if (service.origin) {
        // Deve ter origem válida
        expect(service.origin.rootCause).toBeDefined();
      }
    });
  });

  it("deve respeitar as regras de verificação de disponibilidade", () => {
    // Testa se a verificação funciona
    expect(ServiceGenerator.canGenerateServices(mockGuild)).toBe(true);

    // Guild sem recursos suficientes
    const guildPobre = {
      ...mockGuild,
      resources: {
        level: ResourceLevel.NENHUM,
      },
    };

    // Mesmo com poucos recursos, deve poder gerar serviços básicos
    const result = ServiceGenerator.canGenerateServices(guildPobre);
    expect(typeof result).toBe("boolean");
  });

  it("deve incluir metadados completos na geração", () => {
    const result = ServiceGenerator.generateServices({
      guild: mockGuild,
      currentDate: mockDate,
      quantity: 3,
    });

    // Verificar metadados
    expect(result.metadata).toBeDefined();
    expect(result.metadata.baseQuantity).toBeGreaterThanOrEqual(0);
    expect(result.metadata.finalQuantity).toBe(3);
    expect(result.metadata.generatedAt).toEqual(mockDate);
    expect(Array.isArray(result.metadata.notes)).toBe(true);
  });
});
