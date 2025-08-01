import { describe, it, expect } from "vitest";
import type { Contract } from "../types/contract";
import {
  ContractStatus,
  ContractDifficulty,
  ContractorType,
  PaymentType,
  DeadlineType,
  ContractResolution,
  FailureReason,
  validateContract,
  calculateFinalGoldReward,
  calculateBreachPenalty,
  isContractExpired,
  applyUnresolvedBonus,
} from "../types/contract";

describe("Contract Types - Issue 4.1", () => {
  describe("Enums", () => {
    it("should have all required ContractStatus values", () => {
      const expectedStatuses = [
        "Disponível",
        "Aceito",
        "Em andamento",
        "Concluído",
        "Falhou",
        "Expirado",
        "Anulado",
        "Resolvido por outros",
        "Quebrado",
      ];

      expectedStatuses.forEach((status) => {
        expect(Object.values(ContractStatus)).toContain(status);
      });
    });

    it("should have all required ContractDifficulty values based on .md file", () => {
      // Baseado na tabela de dificuldade do arquivo [2-1] Contratos - Guilda.md
      const expectedDifficulties = ["Fácil", "Médio", "Difícil", "Mortal"];

      expectedDifficulties.forEach((difficulty) => {
        expect(Object.values(ContractDifficulty)).toContain(difficulty);
      });
    });

    it("should have all required ContractorType values from .md file", () => {
      // Baseado nos tipos de contratantes mencionados no arquivo
      const expectedTypes = ["Povo", "Instituição", "Governo"];

      expectedTypes.forEach((type) => {
        expect(Object.values(ContractorType)).toContain(type);
      });
    });

    it("should have PaymentType values matching .md file table", () => {
      // Baseado na tabela "Tipo de Pagamento"
      const expectedPayments = [
        "Pagamento em PO$ direto com contratante",
        "Metade com a guilda, metade com o contratante",
        "Metade com a guilda, metade, em bens, com o contratante",
        "Em materiais, joias, bens ou serviços do contratante",
        "Pagamento total na guilda em PO$",
        "Pagamento total na guilda em PO$ e serviços do contratante",
      ];

      expectedPayments.forEach((payment) => {
        expect(Object.values(PaymentType)).toContain(payment);
      });
    });
  });

  describe("Contract Value Calculations", () => {
    it("should calculate final gold reward correctly (value * 0.1)", () => {
      // Baseado na regra: "Multiplique o valor da recompensa por 0.1 para obter o valor em PO$"
      expect(calculateFinalGoldReward(1000)).toBe(100);
      expect(calculateFinalGoldReward(500)).toBe(50);
      expect(calculateFinalGoldReward(2500)).toBe(250);
    });

    it("should calculate breach penalty correctly (10% of reward)", () => {
      // Baseado na regra: "Quebrar um contrato gera uma multa no valor de 10% da recompensa em PO$"
      expect(calculateBreachPenalty(100)).toBe(10);
      expect(calculateBreachPenalty(250)).toBe(25);
      expect(calculateBreachPenalty(500)).toBe(50);
    });

    it("should apply unresolved bonus correctly (+2)", () => {
      // Baseado na regra: "aumente o seu nível de recompensa em 2"
      expect(applyUnresolvedBonus(100)).toBe(102);
      expect(applyUnresolvedBonus(50)).toBe(52);
    });
  });

  describe("Contract Validation", () => {
    const createValidContract = (): Contract => ({
      id: crypto.randomUUID(),
      title: "Teste Contract",
      description: "Um contrato de teste",
      status: ContractStatus.DISPONIVEL,
      difficulty: ContractDifficulty.FACIL,
      contractorType: ContractorType.POVO,
      value: {
        baseValue: 100,
        experienceValue: 100,
        rewardValue: 100,
        finalGoldReward: 10,
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
    });

    it("should validate a complete contract successfully", () => {
      const contract = createValidContract();

      expect(() => validateContract(contract)).not.toThrow();
      const validated = validateContract(contract);
      expect(validated.id).toBe(contract.id);
      expect(validated.title).toBe(contract.title);
    });

    it("should enforce base value range (75-50000) from .md table", () => {
      const contract = createValidContract();

      // Valor muito baixo (abaixo do mínimo da tabela)
      contract.value.baseValue = 50;
      expect(() => validateContract(contract)).toThrow();

      // Valor muito alto (acima do máximo da tabela)
      contract.value.baseValue = 60000;
      expect(() => validateContract(contract)).toThrow();

      // Valores válidos da tabela
      contract.value.baseValue = 75; // Mínimo
      expect(() => validateContract(contract)).not.toThrow();

      contract.value.baseValue = 50000; // Máximo
      expect(() => validateContract(contract)).not.toThrow();
    });

    it("should enforce distance modifier range (-20 to +20)", () => {
      const contract = createValidContract();

      // Valores inválidos
      contract.value.modifiers.distance = -25;
      expect(() => validateContract(contract)).toThrow();

      contract.value.modifiers.distance = 25;
      expect(() => validateContract(contract)).toThrow();

      // Valores válidos da tabela de distância
      contract.value.modifiers.distance = -20; // Mínimo
      expect(() => validateContract(contract)).not.toThrow();

      contract.value.modifiers.distance = 20; // Máximo
      expect(() => validateContract(contract)).not.toThrow();
    });

    it("should enforce population relation modifier range (-20 to +5)", () => {
      const contract = createValidContract();

      // Baseado na tabela "Relação com a População Local"
      contract.value.modifiers.populationRelation = -20; // Péssima
      expect(() => validateContract(contract)).not.toThrow();

      contract.value.modifiers.populationRelation = 5; // Excelente
      expect(() => validateContract(contract)).not.toThrow();

      // Fora do range
      contract.value.modifiers.populationRelation = -25;
      expect(() => validateContract(contract)).toThrow();

      contract.value.modifiers.populationRelation = 10;
      expect(() => validateContract(contract)).toThrow();
    });

    it("should enforce government relation modifier range (-25 to +10)", () => {
      const contract = createValidContract();

      // Baseado na tabela "Relação com o Governo Local"
      contract.value.modifiers.governmentRelation = -25; // Péssima
      expect(() => validateContract(contract)).not.toThrow();

      contract.value.modifiers.governmentRelation = 10; // Excelente
      expect(() => validateContract(contract)).not.toThrow();

      // Fora do range
      contract.value.modifiers.governmentRelation = -30;
      expect(() => validateContract(contract)).toThrow();

      contract.value.modifiers.governmentRelation = 15;
      expect(() => validateContract(contract)).toThrow();
    });
  });

  describe("Contract Expiration", () => {
    it("should correctly identify expired contracts", () => {
      const contract: Contract = {
        id: crypto.randomUUID(),
        title: "Expired Contract",
        description: "This contract has expired",
        status: ContractStatus.DISPONIVEL,
        difficulty: ContractDifficulty.FACIL,
        contractorType: ContractorType.POVO,
        value: {
          baseValue: 100,
          experienceValue: 100,
          rewardValue: 100,
          finalGoldReward: 10,
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
          type: DeadlineType.DIAS,
          value: "3 dias",
          isFlexible: false,
          isArbitrary: true,
        },
        paymentType: PaymentType.TOTAL_GUILDA,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() - 86400000), // 1 dia atrás
        generationData: {
          baseRoll: 50,
        },
      };

      expect(isContractExpired(contract)).toBe(true);

      // Contrato sem data de expiração
      const contractNoExpiry = { ...contract };
      delete contractNoExpiry.expiresAt;
      expect(isContractExpired(contractNoExpiry)).toBe(false);

      // Contrato com data futura
      contract.expiresAt = new Date(Date.now() + 86400000); // 1 dia à frente
      expect(isContractExpired(contract)).toBe(false);
    });
  });

  describe("Resolution Types", () => {
    it("should have all resolution types from .md file", () => {
      // Baseado na tabela "Resoluções para Contratos Firmados"
      const expectedResolutions = [
        "O contrato foi resolvido",
        "O contrato não foi resolvido",
        "O contrato foi resolvido mas com ressalvas",
        "Ainda não se sabe",
      ];

      expectedResolutions.forEach((resolution) => {
        expect(Object.values(ContractResolution)).toContain(resolution);
      });
    });

    it("should have all failure reasons from .md file", () => {
      // Baseado na tabela "Motivos para Não Resolução"
      const expectedReasons = [
        "Quebra devido a desistência",
        "Quebra devido a picaretagem do contratante",
        "Óbito de todos ou maioria dos envolvidos",
        "Prazo não cumprido ou contratados desaparecidos",
        "Quebra devido a cláusula adicional não cumprida",
        "Contratante morto ou desaparecido",
      ];

      expectedReasons.forEach((reason) => {
        expect(Object.values(FailureReason)).toContain(reason);
      });
    });
  });
});
