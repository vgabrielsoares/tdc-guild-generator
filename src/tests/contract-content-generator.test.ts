/**
 * Testes para geração de conteúdo de contratos (Issue 4.12)
 *
 * Valida implementação de:
 * - Geração de contratantes (Povo/Instituição/Governo)
 * - Geração de objetivos e especificações
 * - Geração de localidades
 * - Aplicação de pré-requisitos e cláusulas
 * - Coerência entre elementos
 */

import { describe, test, expect, beforeEach } from "vitest";
import { ContractGenerator } from "../utils/generators/contractGenerator";
import type { Guild } from "../types/guild";
import {
  RelationLevel,
  VisitorLevel,
  SettlementType,
  ResourceLevel,
} from "../types/guild";
import { ContractorType, ContractDifficulty } from "../types/contract";

describe("Contract Content Generator (Issue 4.12)", () => {
  let mockGuild: Guild;

  beforeEach(() => {
    mockGuild = {
      id: "test-guild",
      name: "Guilda de Teste",
      structure: {
        size: "Grande (12m x 12m)",
        description: "Estrutura padrão",
        characteristics: ["Segura", "Moderada", "Fácil acesso"],
      },
      staff: {
        employees: "funcionários padrão",
        description: "Staff normal",
      },
      relations: {
        population: RelationLevel.DIPLOMATICA,
        government: RelationLevel.DIPLOMATICA,
      },
      visitors: {
        frequency: VisitorLevel.NEM_MUITO_NEM_POUCO,
      },
      resources: {
        level: ResourceLevel.SUFICIENTES,
        description: "Recursos adequados",
      },
      settlementType: SettlementType.CIDADELA,
      createdAt: new Date(),
    };
  });

  describe("Geração de Contratantes", () => {
    test("deve gerar contratante com tipo, nome e descrição", () => {
      const contract = ContractGenerator.generateBaseContract({
        guild: mockGuild,
      });

      const validTypes = [
        ContractorType.POVO,
        ContractorType.INSTITUICAO,
        ContractorType.GOVERNO,
      ];
      expect(validTypes).toContain(contract.contractorType);
      expect(contract.contractorName).toBeDefined();
      expect(contract.contractorName).not.toBe("");
      expect(contract.description).toContain("**Contratante:**");
    });

    test("deve aplicar modificadores de relação corretamente", () => {
      // Teste com relação péssima com população (favorece governo)
      const guildBadPopulation = {
        ...mockGuild,
        relations: {
          population: RelationLevel.PESSIMA,
          government: RelationLevel.EXCELENTE,
        },
      };

      const contractsGenerated = [];
      for (let i = 0; i < 20; i++) {
        const contract = ContractGenerator.generateBaseContract({
          guild: guildBadPopulation,
        });
        contractsGenerated.push(contract.contractorType);
      }

      // Deve ter mais contratos do governo do que do povo
      const governmentContracts = contractsGenerated.filter(
        (t) => t === ContractorType.GOVERNO
      ).length;
      const peopleContracts = contractsGenerated.filter(
        (t) => t === ContractorType.POVO
      ).length;

      expect(governmentContracts).toBeGreaterThan(peopleContracts);
    });

    test("deve gerar contratante específico do governo quando aplicável", () => {
      const guildGoodGovernment = {
        ...mockGuild,
        relations: {
          population: RelationLevel.PESSIMA,
          government: RelationLevel.EXCELENTE,
        },
      };

      const contract = ContractGenerator.generateBaseContract({
        guild: guildGoodGovernment,
      });

      if (contract.contractorType === ContractorType.GOVERNO) {
        const governmentTypes = [
          "Arcanista Diplomata",
          "Membro Importante do Clero",
          "Nobre Poderoso",
          "Círculo Familiar dos Governantes",
          "Agente Burocrático",
          "Militar de Alto Escalão",
          "Governo de Outro Assentamento",
          "Líder Local",
        ];

        expect(
          governmentTypes.some((type) =>
            contract.contractorName?.includes(type)
          )
        ).toBe(true);
      }
    });
  });

  describe("Geração de Objetivos", () => {
    test("deve gerar objetivo com categoria e especificação", () => {
      const contract = ContractGenerator.generateBaseContract({
        guild: mockGuild,
      });

      expect(contract.title).toBeDefined();
      expect(contract.title).not.toBe("");
      expect(contract.description).toBeDefined();
      expect(contract.description.length).toBeGreaterThan(10);
    });

    test("deve gerar objetivos variados", () => {
      const objectives = new Set();

      for (let i = 0; i < 50; i++) {
        const contract = ContractGenerator.generateBaseContract({
          guild: mockGuild,
        });
        objectives.add(contract.title);
      }

      // Deve gerar pelo menos 10 objetivos diferentes em 50 tentativas
      expect(objectives.size).toBeGreaterThan(10);
    });

    test("deve incluir especificações detalhadas na descrição", () => {
      const contract = ContractGenerator.generateBaseContract({
        guild: mockGuild,
      });

      // Descrição deve conter informações sobre local, contratante, etc.
      expect(contract.description).toContain("**Local:**");
      expect(contract.description).toContain("**Contratante:**");
    });
  });

  describe("Geração de Localidades", () => {
    test("deve incluir informação de localidade na descrição", () => {
      const contract = ContractGenerator.generateBaseContract({
        guild: mockGuild,
      });

      expect(contract.description).toContain("**Local:**");
    });

    test("deve gerar localizações variadas", () => {
      const locations = new Set();

      for (let i = 0; i < 30; i++) {
        const contract = ContractGenerator.generateBaseContract({
          guild: mockGuild,
        });
        const locationMatch = contract.description.match(
          /\*\*Local:\*\* ([^|]+)/
        );
        if (locationMatch) {
          locations.add(locationMatch[1].trim());
        }
      }

      // Deve gerar pelo menos 5 localizações diferentes
      expect(locations.size).toBeGreaterThan(5);
    });
  });

  describe("Pré-requisitos e Cláusulas", () => {
    test("deve incluir pré-requisitos para contratos de alto valor", () => {
      // Forçar geração de contrato de alto valor testando múltiplas vezes
      let foundPrerequisites = false;

      for (let i = 0; i < 50; i++) {
        const contract = ContractGenerator.generateBaseContract({
          guild: mockGuild,
        });

        if (
          contract.value.experienceValue > 500 &&
          contract.description.includes("Pré-requisitos:")
        ) {
          foundPrerequisites = true;
          break;
        }
      }

      // Pelo menos alguns contratos devem ter pré-requisitos
      expect(foundPrerequisites).toBe(true);
    });

    test("deve incluir cláusulas especiais ocasionalmente", () => {
      let foundClauses = false;

      for (let i = 0; i < 100; i++) {
        const contract = ContractGenerator.generateBaseContract({
          guild: mockGuild,
        });

        if (contract.description.includes("Cláusulas:")) {
          foundClauses = true;
          break;
        }
      }

      // Ocasionalmente deve gerar cláusulas especiais
      expect(foundClauses).toBe(true);
    });
  });

  describe("Tipo de Pagamento", () => {
    test("deve gerar tipos de pagamento variados", () => {
      const paymentTypes = new Set();

      for (let i = 0; i < 50; i++) {
        const contract = ContractGenerator.generateBaseContract({
          guild: mockGuild,
        });
        paymentTypes.add(contract.paymentType);
      }

      // Deve gerar pelo menos 3 tipos diferentes de pagamento
      expect(paymentTypes.size).toBeGreaterThan(3);
    });

    test("deve favorecer pagamento total na guilda", () => {
      const paymentTypes = [];

      for (let i = 0; i < 100; i++) {
        const contract = ContractGenerator.generateBaseContract({
          guild: mockGuild,
        });
        paymentTypes.push(contract.paymentType);
      }

      const totalGuildPayments = paymentTypes.filter(
        (type) => type === "Pagamento total na guilda em PO$"
      ).length;

      // Tipo mais comum deve ser pagamento total na guilda (range 11-18 de 20, que são 8 de 20 = 40%)
      // Mas considerando variação estatística, vamos esperar pelo menos 25%
      expect(totalGuildPayments).toBeGreaterThan(paymentTypes.length * 0.25);
    });
  });

  describe("Coerência entre Elementos", () => {
    test("deve manter coerência entre dificuldade e valor", () => {
      const contract = ContractGenerator.generateBaseContract({
        guild: mockGuild,
      });

      // Contratos mais difíceis devem ter valores modificados pelos multiplicadores
      if (contract.difficulty === ContractDifficulty.MORTAL) {
        expect(contract.value.experienceValue).toBeGreaterThan(
          contract.value.baseValue
        );
      }
    });

    test("deve gerar contrato completo com todos os elementos", () => {
      const contract = ContractGenerator.generateBaseContract({
        guild: mockGuild,
      });

      // Verificar elementos obrigatórios
      expect(contract.id).toBeDefined();
      expect(contract.title).toBeDefined();
      expect(contract.description).toBeDefined();
      expect(contract.contractorType).toBeDefined();
      expect(contract.contractorName).toBeDefined();
      expect(contract.value).toBeDefined();
      expect(contract.deadline).toBeDefined();
      expect(contract.paymentType).toBeDefined();
      expect(contract.difficulty).toBeDefined();
      expect(contract.createdAt).toBeDefined();
      expect(contract.generationData).toBeDefined();

      // Verificar que descrição contém informações essenciais
      expect(contract.description).toContain("**Local:**");
      expect(contract.description).toContain("**Contratante:**");
    });

    test("deve aplicar modificadores de funcionários consistentemente", () => {
      const guildExperienced = {
        ...mockGuild,
        staff: {
          employees: "funcionários experientes",
          description: "Staff experiente",
        },
      };

      const contract = ContractGenerator.generateBaseContract({
        guild: guildExperienced,
      });

      // Modificadores devem estar refletidos nos valores
      expect(contract.value.modifiers.staffPreparation).toBe(2);
    });
  });

  describe("Integração com Sistema Existente", () => {
    test("deve manter compatibilidade com geração múltipla", () => {
      const contracts = ContractGenerator.generateMultipleContracts({
        guild: mockGuild,
      });

      expect(contracts.length).toBeGreaterThan(0);
      contracts.forEach((contract) => {
        expect(contract.contractorType).toBeDefined();
        expect(contract.contractorName).toBeDefined();
        expect(contract.description).toContain("**Local:**");
        expect(contract.description).toContain("**Contratante:**");
      });
    });

    test("deve respeitar cálculo de quantidade existente", () => {
      // Gerar múltiplos contratos e verificar se o número é consistente com o cálculo interno
      // Usar skipFrequentatorsReduction para garantir que sempre haverá pelo menos 1 contrato
      const contracts = ContractGenerator.generateMultipleContracts({
        guild: mockGuild,
        skipFrequentatorsReduction: true,
      });

      // Deve gerar pelo menos 1 contrato e no máximo uma quantidade razoável
      expect(contracts.length).toBeGreaterThan(0);
      expect(contracts.length).toBeLessThanOrEqual(50); // Limite superior razoável

      // Todos os contratos devem ser válidos e ter elementos obrigatórios
      contracts.forEach((contract) => {
        expect(contract).toHaveProperty("id");
        expect(contract).toHaveProperty("description");
        expect(contract).toHaveProperty("value");
        expect(contract).toHaveProperty("difficulty");
        expect(contract.description.length).toBeGreaterThan(0);
      });
    });
  });
});
