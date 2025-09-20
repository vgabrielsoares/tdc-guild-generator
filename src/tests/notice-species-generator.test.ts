import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  NoticeSpeciesGenerator,
  generateNoticeSpecies,
  analyzeNoticeSpecies,
} from "@/utils/generators/noticeSpeciesGenerator";
import { NoticeType } from "@/types/notice";
import { Species } from "@/types/species";
import {
  isPersonMention,
  CreatureContext,
  NOTICE_TYPE_SPECIES_CONTEXT,
} from "@/data/tables/notice-species-mapping";

// Mock das funções de rolagem para testes determinísticos
const mockDiceRoller = vi.fn();

// Mock da função generateCompleteSpecies
vi.mock("@/data/tables/species-tables", () => ({
  generateCompleteSpecies: vi.fn(),
  getSpeciesFullName: vi.fn(),
}));

import {
  generateCompleteSpecies,
  getSpeciesFullName,
} from "@/data/tables/species-tables";
const mockGenerateCompleteSpecies = vi.mocked(generateCompleteSpecies);
const mockGetSpeciesFullName = vi.mocked(getSpeciesFullName);

describe("Notice Species Generator - Issue 7.18", () => {
  let generator: NoticeSpeciesGenerator;

  beforeEach(() => {
    vi.clearAllMocks();
    mockDiceRoller.mockReturnValue(50); // Valor médio padrão
    generator = new NoticeSpeciesGenerator({ diceRoller: mockDiceRoller });

    // Mock padrão para generateCompleteSpecies
    mockGenerateCompleteSpecies.mockReturnValue({
      species: Species.HUMAN,
      subrace: undefined,
      secondarySpecies: undefined,
      secondarySubrace: undefined,
    });

    mockGetSpeciesFullName.mockReturnValue("Humano");
  });

  describe("Mapeamento de Contextos", () => {
    it("deve identificar tipos que sempre geram espécies", () => {
      const alwaysPersonTypes = [
        NoticeType.COMMERCIAL_PROPOSAL,
        NoticeType.ANNOUNCEMENT,
        NoticeType.EXECUTION,
        NoticeType.OFFICIAL_STATEMENT,
        NoticeType.SERVICES,
        NoticeType.CONTRACTS,
      ];

      alwaysPersonTypes.forEach((type) => {
        expect(NOTICE_TYPE_SPECIES_CONTEXT[type]).toBe(
          CreatureContext.ALWAYS_PERSON
        );
      });
    });

    it("deve identificar tipos que nunca geram espécies", () => {
      expect(NOTICE_TYPE_SPECIES_CONTEXT[NoticeType.NOTHING]).toBe(
        CreatureContext.ALWAYS_ANIMAL
      );
    });

    it("deve identificar tipos context-dependent", () => {
      const contextDependentTypes = [
        NoticeType.RESIDENTS_NOTICE,
        NoticeType.HUNT_PROPOSAL,
      ];

      contextDependentTypes.forEach((type) => {
        expect(NOTICE_TYPE_SPECIES_CONTEXT[type]).toBe(
          CreatureContext.CONTEXT_DEPENDENT
        );
      });
    });
  });

  describe("Detecção de Menções de Pessoas", () => {
    it("deve identificar contextos de animais", () => {
      const animalContexts = [
        "domestic_animal",
        "rural_animals",
        "animal_parts",
        "fauna",
        "beasts",
        "livestock",
      ];

      animalContexts.forEach((context) => {
        expect(isPersonMention(context)).toBe(false);
      });
    });

    it("deve identificar contextos de pessoas", () => {
      const personContexts = [
        "noble",
        "commoner",
        "child",
        "merchant",
        "specialist",
        "adept",
        "adventurer",
        "bandits",
        "witch",
      ];

      personContexts.forEach((context) => {
        expect(isPersonMention(context)).toBe(true);
      });
    });

    it("deve assumir pessoa para contextos ambíguos", () => {
      const ambiguousContexts = [
        "mysterious_figure",
        "unknown_entity",
        "strange_being",
      ];

      ambiguousContexts.forEach((context) => {
        expect(isPersonMention(context)).toBe(true);
      });
    });
  });

  describe("Análise de Menções", () => {
    it("deve sempre gerar espécie para tipos ALWAYS_PERSON", () => {
      const analysis = generator.analyzeMention(
        NoticeType.COMMERCIAL_PROPOSAL,
        "merchant"
      );

      expect(analysis.shouldGenerate).toBe(true);
      expect(analysis.context).toBe(CreatureContext.ALWAYS_PERSON);
      expect(analysis.reason).toContain("sempre menciona pessoas");
    });

    it("deve nunca gerar espécie para tipos ALWAYS_ANIMAL", () => {
      const analysis = generator.analyzeMention(
        NoticeType.NOTHING,
        "any_context"
      );

      expect(analysis.shouldGenerate).toBe(false);
      expect(analysis.context).toBe(CreatureContext.ALWAYS_ANIMAL);
      expect(analysis.reason).toContain("nunca menciona pessoas");
    });

    it("deve usar rolagem para tipos CONTEXT_DEPENDENT", () => {
      // Simular rolagem alta (70) para gerar espécie
      mockDiceRoller.mockReturnValue(70);

      const analysis = generator.analyzeMention(
        NoticeType.RESIDENTS_NOTICE,
        "generic_mention"
      );

      expect(analysis.shouldGenerate).toBe(true);
      expect(analysis.context).toBe(CreatureContext.CONTEXT_DEPENDENT);
      expect(analysis.reason).toContain("decisão aleatória");
    });

    it("deve distinguir pessoa vs animal em tipos MIXED", () => {
      // Teste com pessoa
      const personAnalysis = generator.analyzeMention(
        NoticeType.WANTED_POSTER,
        "noble"
      );
      expect(personAnalysis.shouldGenerate).toBe(true);

      // Teste com animal
      const animalAnalysis = generator.analyzeMention(
        NoticeType.WANTED_POSTER,
        "domestic_animal"
      );
      expect(animalAnalysis.shouldGenerate).toBe(false);
    });
  });

  describe("Análise de Caçadas", () => {
    it("deve sempre gerar espécie para humanoides", () => {
      const analysis = generator.analyzeMention(
        NoticeType.HUNT_PROPOSAL,
        "target",
        "humanoids"
      );

      expect(analysis.shouldGenerate).toBe(true);
      expect(analysis.reason).toContain("sempre são pessoas inteligentes");
    });

    it("deve nunca gerar espécie para criaturas bestiais", () => {
      const beastTypes = ["fauna", "monstrosities", "constructs", "demons"];

      beastTypes.forEach((type) => {
        const analysis = generator.analyzeMention(
          NoticeType.HUNT_PROPOSAL,
          "target",
          type
        );

        expect(analysis.shouldGenerate).toBe(false);
        expect(analysis.reason).toContain("sempre são criaturas sem espécie");
      });
    });

    it("deve usar pesos específicos para criaturas context-dependent", () => {
      // Gigantes têm 60% chance de serem inteligentes
      mockDiceRoller.mockReturnValue(50); // Menor que 60%

      const giantAnalysis = generator.analyzeMention(
        NoticeType.HUNT_PROPOSAL,
        "target",
        "giants"
      );

      expect(giantAnalysis.shouldGenerate).toBe(true);
      expect(giantAnalysis.reason).toContain("vs 60% chance de pessoa");
    });

    it("deve usar peso padrão para criaturas não mapeadas", () => {
      mockDiceRoller.mockReturnValue(15); // Menor que 20%

      const unknownAnalysis = generator.analyzeMention(
        NoticeType.HUNT_PROPOSAL,
        "target",
        "unknown_creature"
      );

      expect(unknownAnalysis.shouldGenerate).toBe(true);
      expect(unknownAnalysis.reason).toContain("vs 20% chance de pessoa");
    });
  });

  describe("Geração de Espécies", () => {
    it("deve gerar espécie quando análise determina que deve", () => {
      const species = generator.generateSpeciesForMention(
        NoticeType.COMMERCIAL_PROPOSAL,
        "merchant"
      );

      expect(species).not.toBeNull();
      expect(mockGenerateCompleteSpecies).toHaveBeenCalledWith(
        "Notice commercial_proposal - merchant"
      );
    });

    it("deve retornar null quando análise determina que não deve", () => {
      const species = generator.generateSpeciesForMention(
        NoticeType.WANTED_POSTER,
        "domestic_animal"
      );

      expect(species).toBeNull();
      expect(mockGenerateCompleteSpecies).not.toHaveBeenCalled();
    });

    it("deve gerar múltiplas espécies corretamente", () => {
      const mentions = ["noble", "merchant", "domestic_animal", "commoner"];
      const species = generator.generateSpeciesForMultipleMentions(
        NoticeType.EXECUTION,
        mentions
      );

      // Para EXECUTION (ALWAYS_PERSON), todas as menções geram espécie
      // incluindo "domestic_animal" porque o tipo ignora o contexto individual
      expect(species).toHaveLength(4);
      expect(mockGenerateCompleteSpecies).toHaveBeenCalledTimes(4);
    });

    it("deve incluir contexto específico para caçadas", () => {
      generator.generateSpeciesForMention(
        NoticeType.HUNT_PROPOSAL,
        "target",
        "humanoids"
      );

      expect(mockGenerateCompleteSpecies).toHaveBeenCalledWith(
        "Notice hunt_proposal - target (humanoids)"
      );
    });
  });

  describe("Geração para Contextos Comuns", () => {
    it("deve retornar contextos apropriados por tipo de aviso", () => {
      const contexts = generator.generateSpeciesForCommonContexts(
        NoticeType.COMMERCIAL_PROPOSAL
      );

      // Verificar que retorna contextos específicos de proposta comercial
      expect(Object.keys(contexts)).toContain("merchant");
      expect(Object.keys(contexts)).toContain("aristocrat");
      expect(Object.keys(contexts)).toContain("specialist");
    });

    it("deve gerar espécies apenas para contextos de pessoas", () => {
      mockGenerateCompleteSpecies.mockReturnValue({
        species: Species.ELF,
        subrace: undefined,
        secondarySpecies: undefined,
        secondarySubrace: undefined,
      });

      const contexts = generator.generateSpeciesForCommonContexts(
        NoticeType.EXECUTION
      );

      // Todos os contextos de execução são pessoas, então todos devem gerar espécie
      const generatedCount = Object.values(contexts).filter(
        (s) => s !== null
      ).length;
      expect(generatedCount).toBeGreaterThan(0);
    });
  });

  describe("Validação de Contextos", () => {
    it("deve validar contextos conhecidos", () => {
      const validation = generator.validateMentionContext(
        NoticeType.COMMERCIAL_PROPOSAL,
        "merchant"
      );

      expect(validation.isValid).toBe(true);
      expect(validation.suggestions).toHaveLength(0);
    });

    it("deve fornecer sugestões para contextos inválidos", () => {
      // Como isPersonMention retorna true para contextos desconhecidos,
      // vamos usar um contexto que sabemos ser animal para testar
      const animalValidation = generator.validateMentionContext(
        NoticeType.COMMERCIAL_PROPOSAL,
        "domestic_animal"
      );

      expect(animalValidation.isValid).toBe(false);
      expect(animalValidation.suggestions).toHaveLength(3);
    });
  });

  describe("Funções Utilitárias", () => {
    it("generateNoticeSpecies deve funcionar como wrapper", () => {
      const species = generateNoticeSpecies(
        NoticeType.ANNOUNCEMENT,
        "nobility",
        undefined,
        mockDiceRoller
      );

      expect(species).not.toBeNull();
      expect(mockGenerateCompleteSpecies).toHaveBeenCalled();
    });

    it("analyzeNoticeSpecies deve funcionar como wrapper", () => {
      const analysis = analyzeNoticeSpecies(
        NoticeType.RESIDENTS_NOTICE,
        "commoner",
        undefined,
        mockDiceRoller
      );

      expect(analysis).toHaveProperty("shouldGenerate");
      expect(analysis).toHaveProperty("reason");
      expect(analysis).toHaveProperty("context");
    });
  });

  describe("Casos Especiais e Edge Cases", () => {
    it("deve lidar com contextos vazios ou undefined", () => {
      const analysis = generator.analyzeMention(
        NoticeType.COMMERCIAL_PROPOSAL,
        ""
      );

      // Mesmo com contexto vazio, tipo ALWAYS_PERSON deve gerar espécie
      expect(analysis.shouldGenerate).toBe(true);
    });

    it("deve manter determinismo com mesmo diceRoller", () => {
      const mockDeterministicRoller = vi.fn().mockReturnValue(42);
      const generator1 = new NoticeSpeciesGenerator({
        diceRoller: mockDeterministicRoller,
      });
      const generator2 = new NoticeSpeciesGenerator({
        diceRoller: mockDeterministicRoller,
      });

      const analysis1 = generator1.analyzeMention(
        NoticeType.RESIDENTS_NOTICE,
        "generic"
      );
      const analysis2 = generator2.analyzeMention(
        NoticeType.RESIDENTS_NOTICE,
        "generic"
      );

      expect(analysis1.shouldGenerate).toBe(analysis2.shouldGenerate);
    });

    it("deve funcionar sem diceRoller injetado", () => {
      const generatorWithoutDice = new NoticeSpeciesGenerator();
      const analysis = generatorWithoutDice.analyzeMention(
        NoticeType.COMMERCIAL_PROPOSAL,
        "merchant"
      );

      // Deve funcionar mesmo sem diceRoller específico
      expect(analysis).toHaveProperty("shouldGenerate");
      expect(analysis.shouldGenerate).toBe(true);
    });
  });

  describe("Integração com Sistema de Espécies Existente", () => {
    it("deve usar generateCompleteSpecies do sistema existente", () => {
      generator.generateSpeciesForMention(NoticeType.EXECUTION, "bandits");

      expect(mockGenerateCompleteSpecies).toHaveBeenCalledWith(
        expect.stringContaining("Notice execution - bandits")
      );
    });

    it("deve preservar casos especiais do sistema de espécies", () => {
      // Simular retorno de caso especial (vampiro)
      mockGenerateCompleteSpecies.mockReturnValue({
        species: Species.VAMPIRE,
        subrace: undefined,
        secondarySpecies: undefined,
        secondarySubrace: undefined,
      });

      const species = generator.generateSpeciesForMention(
        NoticeType.WANTED_POSTER,
        "fugitive"
      );

      expect(species?.species).toBe(Species.VAMPIRE);
    });
  });
});
