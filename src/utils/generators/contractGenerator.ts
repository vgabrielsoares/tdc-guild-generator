// Contract Generator
// Will be implemented in Issue 4.3
import type { Contract } from "@/types/contract";
import {
  ContractStatus,
  ContractDifficulty,
  ContractorType,
  PaymentType,
  DeadlineType,
} from "@/types/contract";

/**
 * Generate contracts
 * To be implemented in Issue 4.3
 */
export class ContractGenerator {
  static generate(): Contract {
    // Placeholder implementation
    return {
      id: "00000000-0000-0000-0000-000000000000",
      title: "",
      description: "",
      status: ContractStatus.DISPONIVEL,
      difficulty: ContractDifficulty.FACIL,
      contractorType: ContractorType.POVO,
      value: {
        baseValue: 75,
        experienceValue: 75,
        rewardValue: 75,
        finalGoldReward: 7.5,
        modifiers: {
          distance: 0,
          populationRelation: 0,
          governmentRelation: 0,
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
        isFlexible: true,
        isArbitrary: false,
      },
      paymentType: PaymentType.TOTAL_GUILDA,
      createdAt: new Date(),
      generationData: {
        baseRoll: 50,
      },
    };
  }
}
