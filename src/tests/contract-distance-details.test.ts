import { describe, it, expect } from "vitest";
import { ContractGenerator } from "@/utils/generators/contractGenerator";
import type { Contract } from "@/types/contract";
import {
  ContractStatus,
  ContractDifficulty,
  ContractorType,
  PaymentType,
  DeadlineType,
  AntagonistCategory,
} from "@/types/contract";

// Mock de contrato para teste
const createMockContract = (distanceRoll: number): Contract => ({
  id: "test-contract",
  title: "Contrato de Teste",
  description: "Descrição de teste",
  status: ContractStatus.DISPONIVEL,
  difficulty: ContractDifficulty.MEDIO,
  contractorType: ContractorType.POVO,
  contractorName: "Contratante Teste",
  prerequisites: [],
  clauses: [],
  antagonist: {
    category: AntagonistCategory.HUMANOIDE_PODEROSO,
    specificType: "Bandido",
    name: "Bandido Teste",
    description: "Um bandido perigoso",
  },
  complications: [],
  twists: [],
  allies: [],
  severeConsequences: [],
  additionalRewards: [],
  value: {
    baseValue: 100,
    experienceValue: 100,
    rewardValue: 100,
    finalGoldReward: 10,
    modifiers: {
      distance: 0,
      populationRelationValue: 0,
      populationRelationReward: 0,
      governmentRelationValue: 0,
      governmentRelationReward: 0,
      staffPreparation: 0,
      difficultyMultiplier: {
        experienceMultiplier: 1,
        rewardMultiplier: 1,
      },
      requirementsAndClauses: 0,
    },
  },
  deadline: {
    type: DeadlineType.SEM_PRAZO,
  },
  paymentType: PaymentType.DIRETO_CONTRATANTE,
  generationData: {
    baseRoll: 50,
    distanceRoll,
    difficultyRoll: 10,
    settlementType: "cidade",
  },
  createdAt: new Date(),
});

describe("Contract Distance Details - Issue Distance Display", () => {
  describe("getContractDistanceDetails", () => {
    it('should return correct details for "Um hexágono ou menos" (roll 1-4)', () => {
      const contract = createMockContract(2);
      const details = ContractGenerator.getContractDistanceDetails(contract);

      expect(details.description).toBe("Um hexágono ou menos");
      expect(details.hexagons).toEqual({ min: 0, max: 1 });
      expect(details.kilometers).toEqual({ min: 0, max: 9.5 });
    });

    it('should return correct details for "Dois hexágonos ou menos" (roll 5-6)', () => {
      const contract = createMockContract(5);
      const details = ContractGenerator.getContractDistanceDetails(contract);

      expect(details.description).toBe("Dois hexágonos ou menos");
      expect(details.hexagons).toEqual({ min: 0, max: 2 });
      expect(details.kilometers).toEqual({ min: 0, max: 19 });
    });

    it('should return correct details for "Três hexágonos ou mais" (roll 11-12)', () => {
      const contract = createMockContract(11);
      const details = ContractGenerator.getContractDistanceDetails(contract);

      expect(details.description).toBe("Três hexágonos ou mais");
      expect(details.hexagons).toEqual({ min: 3, max: 10 });
      expect(details.kilometers).toEqual({ min: 28.5, max: 95 });
    });

    it('should return correct details for "Oito hexágonos ou mais" (roll 20)', () => {
      const contract = createMockContract(20);
      const details = ContractGenerator.getContractDistanceDetails(contract);

      expect(details.description).toBe("Oito hexágonos ou mais");
      expect(details.hexagons).toEqual({ min: 8, max: 10 });
      expect(details.kilometers).toEqual({ min: 76, max: 95 });
    });

    it("should handle contract without distanceRoll", () => {
      const contract = createMockContract(0);
      contract.generationData.distanceRoll = undefined;
      const details = ContractGenerator.getContractDistanceDetails(contract);

      expect(details.description).toBe("Distância não especificada");
      expect(details.hexagons).toBeNull();
      expect(details.kilometers).toBeNull();
    });

    it("should correctly calculate kilometers using 9.5 km per hexagon", () => {
      const contract = createMockContract(13); // "Quatro hexágonos ou mais"
      const details = ContractGenerator.getContractDistanceDetails(contract);

      expect(details.hexagons).toEqual({ min: 4, max: 10 });

      // 4 * 9.5 = 38 km, 10 * 9.5 = 95 km
      expect(details.kilometers).toEqual({ min: 38, max: 95 });
    });

    it("should round kilometers to one decimal place", () => {
      const contract = createMockContract(1); // "Um hexágono ou menos"
      const details = ContractGenerator.getContractDistanceDetails(contract);

      // 0 * 9.5 = 0, 1 * 9.5 = 9.5
      expect(details.kilometers?.min).toBe(0);
      expect(details.kilometers?.max).toBe(9.5);
    });
  });

  describe("getContractDistanceDescription backwards compatibility", () => {
    it("should still work for basic description", () => {
      const contract = createMockContract(15);
      const description =
        ContractGenerator.getContractDistanceDescription(contract);

      expect(description).toBe("Quatro hexágonos ou mais");
    });
  });
});
