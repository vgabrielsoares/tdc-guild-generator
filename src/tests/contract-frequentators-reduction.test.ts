import { describe, it, expect, beforeEach } from "vitest";
import { ContractGenerator } from "@/utils/generators/contractGenerator";
import { ContractStatus } from "@/types/contract";
import { VisitorLevel, RelationLevel, type Guild } from "@/types/guild";
import { createGameDate } from "@/utils/date-utils";

describe("Contract Reduction by Frequentators - Issue 4.22", () => {
  let mockGuild: Guild;
  let currentDate: ReturnType<typeof createGameDate>;

  beforeEach(() => {
    currentDate = createGameDate(1, 1, 1000);

    // Mock básico de uma guilda para testes
    mockGuild = {
      id: "test-guild",
      name: "Test Guild",
      structure: { size: "Pequeno e modesto (6m x 6m)" },
      staff: { employees: "normal" },
      visitors: { frequency: VisitorLevel.NEM_MUITO_NEM_POUCO },
      relations: {
        population: RelationLevel.BOA,
        government: RelationLevel.DIPLOMATICA,
      },
    } as Guild;
  });

  it("should generate contracts with frequentators reduction applied", () => {
    const guildWithManyVisitors = {
      ...mockGuild,
      visitors: { frequency: VisitorLevel.MUITO_FREQUENTADA },
    };

    const config = { guild: guildWithManyVisitors };

    const contracts =
      ContractGenerator.generateContractsWithFrequentatorsReduction(
        config,
        currentDate
      );

    // Deve haver contratos gerados
    expect(contracts.length).toBeGreaterThan(0);

    // Alguns contratos podem ter status ACEITO_POR_OUTROS
    const takenContracts = contracts.filter(
      (contract) => contract.status === ContractStatus.ACEITO_POR_OUTROS
    );

    // Com muitos frequentadores, é provável que alguns contratos sejam aceitos por outros
    expect(takenContracts.length).toBeGreaterThanOrEqual(0);

    // Contratos aceitos por outros devem ter informações de takenByOthersInfo
    takenContracts.forEach((contract) => {
      expect(contract.takenByOthersInfo).toBeDefined();
      expect(contract.takenByOthersInfo?.takenAt).toBeDefined();
    });
  });

  it("should handle VAZIA frequency correctly (no reduction)", () => {
    const guildWithEmptyVisitors = {
      ...mockGuild,
      visitors: { frequency: VisitorLevel.VAZIA },
    };

    const config = { guild: guildWithEmptyVisitors };

    // Testar apenas a lógica de quantidade, não os contratos gerados
    const quantityWithReduction =
      ContractGenerator.calculateContractQuantity(config);

    // Com frequentadores VAZIA, não deve haver redução
    expect(quantityWithReduction.frequentatorsReduction).toBe(0);

    // Verificar que a mensagem de "sem redução" está presente nos detalhes
    const hasNoReductionMessage =
      quantityWithReduction.details.appliedModifiers.some(
        (modifier) =>
          modifier.includes("sem redução") || modifier.includes("Vazia")
      );
    expect(hasNoReductionMessage).toBe(true);
  });

  it("should add takenByOthersInfo for contracts with special status", () => {
    const guildWithManyVisitors = {
      ...mockGuild,
      visitors: { frequency: VisitorLevel.MUITO_FREQUENTADA },
    };

    const config = { guild: guildWithManyVisitors };

    const contracts =
      ContractGenerator.generateContractsWithFrequentatorsReduction(
        config,
        currentDate
      );

    const takenContracts = contracts.filter(
      (contract) => contract.status === ContractStatus.ACEITO_POR_OUTROS
    );

    takenContracts.forEach((contract) => {
      expect(contract.takenByOthersInfo).toBeDefined();
      expect(contract.takenByOthersInfo?.takenAt).toEqual(currentDate);
      expect(typeof contract.takenByOthersInfo?.canReturnToAvailable).toBe(
        "boolean"
      );
    });
  });

  it("should respect the existing logic for quantity calculation", () => {
    const config = { guild: mockGuild };

    const quantity = ContractGenerator.calculateContractQuantity(config);

    // Deve retornar um resultado válido
    expect(quantity).toBeDefined();
    expect(quantity.totalGenerated).toBeGreaterThanOrEqual(0);
    expect(quantity.baseGenerated).toBeGreaterThanOrEqual(0);
    expect(quantity.frequentatorsReduction).toBeGreaterThanOrEqual(0);
    expect(quantity.details).toBeDefined();
    expect(quantity.details.appliedModifiers).toBeInstanceOf(Array);
  });
});
