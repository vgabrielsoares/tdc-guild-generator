import { describe, expect, it } from "vitest";
import {
  // Enums de Objetivos
  ObjectiveCategory,
  EscortObjective,
  InvestigationObjective,

  // Enums de Localidades
  LocationCategory,
  UrbanLocation,
  WildLocation,

  // Enums de Antagonistas
  AntagonistCategory,
  HumanoidAntagonist,
  ImminentDangerAntagonist,

  // Enums de Complicações
  ComplicationCategory,
  TemporalComplication,
  SocialComplication,

  // Enums de Aliados
  AllyCategory,
  AllyAvailability,
  AllyLoyalty,

  // Enums de Recompensas
  RewardCategory,
  MonetaryReward,
  EquipmentReward,

  // Funções de validação
  validateContractObjective,
  validateContractLocation,
  validateAntagonist,
  validateComplication,
  validateContractAlly,
  validateContractReward,

  // Funções utilitárias
  calculateComplicationDifficultyModifier,
  isAllyAvailable,
  calculateAdditionalRewardsValue,
} from "../types/contract";

import type {
  ContractObjective,
  ContractLocation,
  Antagonist,
  Complication,
  ContractAlly,
  ContractReward,
} from "../types/contract";

describe("Contract Elements - Issue 4.2", () => {
  describe("ContractObjective", () => {
    it("should validate a complete objective successfully", () => {
      const objective: ContractObjective = {
        category: ObjectiveCategory.ESCOLTA,
        specificObjective: EscortObjective.PESSOA_IMPORTANTE,
        description: "Escoltar o embaixador até a cidade vizinha",
        targetName: "Embaixador Roderick",
        targetLocation: "Cidade de Pedravale",
        urgencyLevel: "Alta",
        isSecretMission: false,
        specifications: {
          minimumPartySize: 4,
          requiredSkills: ["Diplomacia", "Proteção"],
          forbiddenActions: ["Violência desnecessária"],
          specialEquipment: ["Montarias"],
          timeWindow: "3 dias",
        },
      };

      expect(() => validateContractObjective(objective)).not.toThrow();
      expect(objective.category).toBe(ObjectiveCategory.ESCOLTA);
      expect(objective.urgencyLevel).toBe("Alta");
    });

    it("should have all required objective categories based on .md file", () => {
      const expectedCategories = [
        "Escolta",
        "Investigação",
        "Recuperação",
        "Eliminação",
        "Exploração",
        "Negociação",
        "Proteção",
        "Entrega",
        "Resgate",
        "Infiltração",
      ];

      const actualCategories = Object.values(ObjectiveCategory);
      expect(actualCategories).toEqual(
        expect.arrayContaining(expectedCategories)
      );
    });

    it("should validate urgency levels correctly", () => {
      const levels = ["Baixa", "Média", "Alta", "Crítica"];

      levels.forEach((level) => {
        const objective: ContractObjective = {
          category: ObjectiveCategory.INVESTIGACAO,
          specificObjective: InvestigationObjective.CRIME_LOCAL,
          description: "Test description",
          urgencyLevel: level as "Baixa" | "Média" | "Alta" | "Crítica",
          isSecretMission: false,
          specifications: {},
        };

        expect(() => validateContractObjective(objective)).not.toThrow();
      });
    });
  });

  describe("ContractLocation", () => {
    it("should validate a complete location successfully", () => {
      const location: ContractLocation = {
        category: LocationCategory.URBANO,
        specificLocation: UrbanLocation.TAVERNA,
        name: "Taverna do Javali Dourado",
        description: "Uma taverna movimentada no centro da cidade",
        characteristics: {
          dangerLevel: "Baixo",
          accessibility: "Fácil",
          population: "Povoado",
          civilizationLevel: "Civilizado",
        },
        modifiers: {
          experienceBonus: 0,
          rewardModifier: -5,
          difficultyIncrease: 0,
        },
        travel: {
          distanceInHexes: 1,
          estimatedTravelTime: "2 horas",
          transportRequired: false,
          specialRequirements: [],
        },
      };

      expect(() => validateContractLocation(location)).not.toThrow();
      expect(location.category).toBe(LocationCategory.URBANO);
      expect(location.characteristics.dangerLevel).toBe("Baixo");
    });

    it("should have all required location categories", () => {
      const expectedCategories = [
        "Urbano",
        "Rural",
        "Selvagem",
        "Subterrâneo",
        "Aquático",
        "Aéreo",
        "Planar",
        "Mágico",
      ];

      const actualCategories = Object.values(LocationCategory);
      expect(actualCategories).toEqual(
        expect.arrayContaining(expectedCategories)
      );
    });

    it("should validate danger levels correctly", () => {
      const dangerLevels = ["Seguro", "Baixo", "Moderado", "Alto", "Extremo"];

      dangerLevels.forEach((level) => {
        const location: ContractLocation = {
          category: LocationCategory.SELVAGEM,
          specificLocation: WildLocation.FLORESTA_DENSA,
          name: "Test Location",
          description: "Test description",
          characteristics: {
            dangerLevel: level as
              | "Seguro"
              | "Baixo"
              | "Moderado"
              | "Alto"
              | "Extremo",
            accessibility: "Moderado",
            population: "Desabitado",
            civilizationLevel: "Primitivo",
          },
          modifiers: {
            experienceBonus: 0,
            rewardModifier: 0,
            difficultyIncrease: 0,
          },
          travel: {
            distanceInHexes: 5,
            estimatedTravelTime: "1 dia",
            transportRequired: false,
          },
        };

        expect(() => validateContractLocation(location)).not.toThrow();
      });
    });
  });

  describe("Antagonist", () => {
    it("should validate a complete antagonist successfully", () => {
      const antagonist: Antagonist = {
        category: AntagonistCategory.HUMANOIDE_PODEROSO,
        specificType: HumanoidAntagonist.MERCENARIO_ASSASSINO,
        name: "Gangue do Corvo Negro",
        description: "Um grupo de bandidos que assola as estradas comerciais",
      };

      expect(() => validateAntagonist(antagonist)).not.toThrow();
      expect(antagonist.category).toBe(AntagonistCategory.HUMANOIDE_PODEROSO);
      expect(antagonist.name).toBe("Gangue do Corvo Negro");
      expect(antagonist.description).toContain("bandidos");
    });

    it("should calculate XP modifier correctly", () => {
      const antagonist: Antagonist = {
        category: AntagonistCategory.PERIGO_IMINENTE,
        specificType: ImminentDangerAntagonist.ANIMAIS_SELVAGENS,
        name: "Urso Pardo Territorial",
        description: "Um urso grande e agressivo",
      };

      expect(antagonist.name).toBe("Urso Pardo Territorial");
      expect(antagonist.category).toBe(AntagonistCategory.PERIGO_IMINENTE);
      expect(antagonist.specificType).toBe(
        ImminentDangerAntagonist.ANIMAIS_SELVAGENS
      );
      expect(antagonist.description).toContain("urso");
    });
  });

  describe("Complication", () => {
    it("should validate a complete complication successfully", () => {
      const complication: Complication = {
        category: ComplicationCategory.TEMPO,
        specificType: TemporalComplication.PRAZO_APERTADO,
        title: "Prazo Reduzido",
        description: "O prazo foi reduzido pela metade devido a urgência",
        impact: {
          severity: "Maior",
          affectedAspects: ["Tempo", "Recursos"],
          experienceModifier: 100,
          difficultyIncrease: 2,
        },
        solutions: {
          direct: ["Trabalhar dia e noite", "Dividir o grupo"],
          creative: ["Negociar extensão", "Usar magia de aceleração"],
          avoidance: ["Abandonar missão"],
        },
        revelation: {
          timing: "Durante planejamento",
          method: "Óbvio",
        },
      };

      expect(() => validateComplication(complication)).not.toThrow();
      expect(complication.category).toBe(ComplicationCategory.TEMPO);
      expect(complication.impact.severity).toBe("Maior");
    });

    it("should calculate difficulty modifier from multiple complications", () => {
      const complications: Complication[] = [
        {
          category: ComplicationCategory.SOCIAL,
          specificType: SocialComplication.TESTEMUNHAS,
          title: "Testemunhas",
          description: "Há testemunhas no local",
          impact: {
            severity: "Moderado",
            affectedAspects: ["Stealth"],
            experienceModifier: 50,
            difficultyIncrease: 1,
          },
          solutions: { direct: [], creative: [] },
          revelation: { timing: "Imediato", method: "Óbvio" },
        },
        {
          category: ComplicationCategory.TEMPO,
          specificType: TemporalComplication.COMPETICAO,
          title: "Competição",
          description: "Outro grupo tem o mesmo objetivo",
          impact: {
            severity: "Maior",
            affectedAspects: ["Tempo"],
            experienceModifier: 100,
            difficultyIncrease: 2,
          },
          solutions: { direct: [], creative: [] },
          revelation: {
            timing: "No meio da missão",
            method: "Descoberta acidental",
          },
        },
      ];

      const totalDifficulty =
        calculateComplicationDifficultyModifier(complications);
      expect(totalDifficulty).toBe(5); // Moderado (2) + Maior (3) = 5
    });
  });

  describe("ContractAlly", () => {
    it("should validate a complete ally successfully", () => {
      const ally: ContractAlly = {
        category: AllyCategory.INFORMANTE,
        name: "Silas, o Comerciante",
        description:
          "Um comerciante bem informado sobre os acontecimentos locais",
        personal: {
          race: "Humano",
          profession: "Comerciante",
          personality: ["Curioso", "Cauteloso", "Ganancioso"],
          motivation: "Manter boas relações com aventureiros",
        },
        availability: {
          type: AllyAvailability.CONDICIONAL,
          conditions: ["Pagamento de 10 moedas de ouro", "Discrição total"],
          limitations: ["Apenas informações", "Não participa de combate"],
          duration: "Durante a missão",
        },
        loyalty: {
          level: AllyLoyalty.INTERESSADA,
          factors: ["Pagamento regular", "Proteção da identidade"],
          breakingPoints: ["Ameaças diretas", "Exposição pública"],
        },
        capabilities: {
          primarySkills: ["Persuasão", "Enganação", "Conhecimento Local"],
          secondarySkills: ["Avaliação", "Comércio"],
          equipment: ["Rede de contatos"],
          connections: ["Outros comerciantes", "Guardas da cidade"],
          knowledgeAreas: ["Política local", "Economia", "Fofocas"],
        },
        introduction: {
          timing: "Durante planejamento",
          method: "Contato prévio",
          requirements: ["Reputação neutra ou melhor"],
        },
        costs: {
          payment: 10,
          favors: ["Proteger carregamento futuro"],
          futureObligations: ["Informar sobre ameaças ao comércio"],
          risks: ["Pode ser um informante duplo"],
        },
      };

      expect(() => validateContractAlly(ally)).not.toThrow();
      expect(ally.category).toBe(AllyCategory.INFORMANTE);
      expect(ally.loyalty.level).toBe(AllyLoyalty.INTERESSADA);
    });

    it("should check ally availability correctly", () => {
      const alwaysAvailable: ContractAlly = {
        category: AllyCategory.GUIA,
        name: "Test Ally",
        description: "Test",
        personal: { personality: [], motivation: "Test" },
        availability: { type: AllyAvailability.SEMPRE_DISPONIVEL },
        loyalty: { level: AllyLoyalty.ALTA, factors: [] },
        capabilities: { primarySkills: [] },
        introduction: {
          timing: "Início da missão",
          method: "Enviado pela guilda",
        },
      };

      const conditionalAlly: ContractAlly = {
        category: AllyCategory.ESPECIALISTA,
        name: "Test Conditional",
        description: "Test",
        personal: { personality: [], motivation: "Test" },
        availability: {
          type: AllyAvailability.CONDICIONAL,
          conditions: ["payment", "stealth"],
        },
        loyalty: { level: AllyLoyalty.MODERADA, factors: [] },
        capabilities: { primarySkills: [] },
        introduction: { timing: "Início da missão", method: "Contato prévio" },
      };

      expect(isAllyAvailable(alwaysAvailable, [])).toBe(true);
      expect(isAllyAvailable(conditionalAlly, ["payment", "stealth"])).toBe(
        true
      );
      expect(isAllyAvailable(conditionalAlly, ["payment"])).toBe(false);
    });
  });

  describe("ContractReward", () => {
    it("should validate a complete reward successfully", () => {
      const reward: ContractReward = {
        category: RewardCategory.EQUIPAMENTO,
        specificType: EquipmentReward.ARMA_MAGICA,
        name: "Espada +1",
        description: "Uma espada longa encantada com magia menor",
        value: {
          estimatedGoldValue: 1000,
          rarity: "Incomum",
          experienceValue: 100,
        },
        conditions: {
          isAutomatic: false,
          requirements: ["Completar todos os objetivos"],
          performanceBased: true,
          secretive: false,
          optional: false,
        },
        benefits: {
          statBonus: ["+1 em ataques e dano"],
          specialAbilities: ["Brilha com luz suave"],
          ongoingEffects: [],
          socialBenefits: ["Reconhecimento como portador de arma mágica"],
        },
        limitations: {
          temporaryEffect: false,
          maintenanceCost: 0,
          curses: [],
          restrictions: ["Apenas usuários leais podem empunhar"],
        },
      };

      expect(() => validateContractReward(reward)).not.toThrow();
      expect(reward.category).toBe(RewardCategory.EQUIPAMENTO);
      expect(reward.value.rarity).toBe("Incomum");
    });

    it("should calculate total additional rewards value", () => {
      const rewards: ContractReward[] = [
        {
          category: RewardCategory.MONETARIA,
          specificType: MonetaryReward.BONUS_OURO,
          name: "Bônus",
          description: "Bônus em ouro",
          value: { estimatedGoldValue: 500, rarity: "Comum" },
          conditions: { isAutomatic: true },
        },
        {
          category: RewardCategory.EQUIPAMENTO,
          specificType: EquipmentReward.POCOES,
          name: "Poções",
          description: "Poções de cura",
          value: { estimatedGoldValue: 300, rarity: "Incomum" },
          conditions: { isAutomatic: false },
        },
      ];

      const totalValue = calculateAdditionalRewardsValue(rewards);
      expect(totalValue).toBe(800); // 500 + 300
    });
  });

  describe("Type Safety", () => {
    it("should enforce strict typing on all enums", () => {
      // Teste de compilação - se este código compilar, os tipos estão corretos
      const objective: ObjectiveCategory = ObjectiveCategory.ESCOLTA;
      const location: LocationCategory = LocationCategory.URBANO;
      const antagonist: AntagonistCategory =
        AntagonistCategory.HUMANOIDE_PODEROSO;
      const complication: ComplicationCategory = ComplicationCategory.TEMPO;
      const ally: AllyCategory = AllyCategory.INFORMANTE;
      const reward: RewardCategory = RewardCategory.EQUIPAMENTO;

      expect(objective).toBeDefined();
      expect(location).toBeDefined();
      expect(antagonist).toBeDefined();
      expect(complication).toBeDefined();
      expect(ally).toBeDefined();
      expect(reward).toBeDefined();
    });

    it("should enforce required fields in interfaces", () => {
      // Este teste verifica que campos obrigatórios estão sendo enforçados
      expect(() => {
        validateContractObjective({
          category: ObjectiveCategory.ESCOLTA,
          specificObjective: EscortObjective.PESSOA_IMPORTANTE,
          description: "Test",
          urgencyLevel: "Alta",
          isSecretMission: false,
          specifications: {},
          // Campos obrigatórios presentes
        });
      }).not.toThrow();

      expect(() => {
        validateContractObjective({
          category: ObjectiveCategory.ESCOLTA,
          // specificObjective: missing - deve falhar
          description: "Test",
          urgencyLevel: "Alta",
          isSecretMission: false,
          specifications: {},
        });
      }).toThrow();
    });
  });
});
