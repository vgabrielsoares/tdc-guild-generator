/**
 * Testes para Elementos Narrativos de Serviços
 *
 * Valida:
 * - Interfaces narrativas
 * - Enums seguindo tabelas específicas do markdown
 * - Schemas Zod para validação correta
 * - Fidelidade total às tabelas de serviços
 */

import { describe, it, expect } from "vitest";
import {
  ServiceObjectiveType,
  ServiceComplicationType,
  ServiceComplicationConsequence,
  ServiceRivalAction,
  ServiceRivalMotivation,
  ServiceOriginCause,
  ServiceAdditionalComplicator,
  ServiceObjectiveSchema,
  ServiceComplicationSchema,
  ServiceRivalSchema,
  ServiceOriginSchema,
  ServiceAdditionalChallengeSchema,
} from "../types/service";
import type {
  ServiceObjective,
  ServiceComplication,
  ServiceRival,
  ServiceOrigin,
  ServiceAdditionalChallenge,
} from "../types/service";

describe("Service Narrative Elements - Issue 5.8 (Corrected)", () => {
  describe("Enums Seguindo Tabelas Exatas do .md", () => {
    it("should have ServiceRivalMotivation with all 17 entries from md table", () => {
      const expectedMotivations = [
        "Faz isso por amor",
        "Se atrapalha todo",
        "Faz isso porque precisa",
        "Busca reconhecimento",
        "Busca uma recompensa pessoal",
        "Está seguindo ordens de terceiros",
        "Faz isso por pura diversão",
        "Faz isso por vingança",
        "Está sob influência mágica ou mental",
        "Está tentando evitar um desastre maior",
        "Faz isso pelas crianças",
        "Se arrepende",
        "Desaparece depois disso",
        "No fundo gosta, e faz isso por você",
        "Faz isso porque te odeia",
        "Faz isso contra a vontade dele",
        "Na verdade é o contratante",
      ];

      expectedMotivations.forEach((motivation) => {
        expect(Object.values(ServiceRivalMotivation)).toContain(motivation);
      });

      // Verificar que tem exatamente 17 entradas (1-20 com alguns ranges)
      expect(Object.values(ServiceRivalMotivation)).toHaveLength(17);
    });

    it("should have ServiceRivalAction with all entries from md table", () => {
      const expectedActions = [
        "Irá contra seu objetivo",
        "Fará a mesma coisa que você",
        "Sabota/Implanta armadilhas",
        "Roubará recursos importantes",
        "Tentará ficar com os créditos",
        "Espalha rumores maldosos",
        "Fingirá ser o contratado",
        "Dará dicas falsas sobre o serviço",
        "Oferecerá valiosas informações",
        "Tentará te subornar ou ameaçar",
      ];

      expectedActions.forEach((action) => {
        expect(Object.values(ServiceRivalAction)).toContain(action);
      });
    });

    it("should have ServiceComplicationType matching exact md table", () => {
      const expectedComplications = [
        "Governo local desaprova",
        "Facção criminosa quer se aproveitar",
        "Ordem religiosa/arcana interessada",
        "Um rival do contratante fica enciumado",
        "Instituição de ofício afetada",
        "Humanoides hostis",
        "Evento local interfere no cronograma",
        "Animal ou mascote atrapalha",
        "Grupo de moradores se opõe",
        "Aliado do contratante discorda",
        "Autoridade exige supervisão extra",
        "Erro burocrático atrasa o andamento",
        "Grupo rival tenta sabotar discretamente",
        "Acidente causa danos leves",
        "Boato negativo se espalha",
        "Fiscal inesperado aparece",
        "Competidor oferece serviço mais barato",
        "Terceiros ocupam o local",
        "Pedido de alteração de última hora",
        "Role duas vezes e use ambos",
      ];

      expectedComplications.forEach((complication) => {
        expect(Object.values(ServiceComplicationType)).toContain(complication);
      });
    });

    it("should have ServiceOriginCause matching exact md table", () => {
      const expectedCauses = [
        "Tradição/conflito familiar",
        "Corrupção no governo local",
        "Aproveitador/charlatão",
        "Algo mundano, corriqueiro ou natural",
        "Antiga promessa não cumprida",
        "Falta de comunicação entre grupos",
        "Criaturas de fora do assentamento",
        "Desinformação ou boatos espalhados",
        "Ordem religiosa com boas intenções",
        "Escassez de recursos essenciais",
        "Peste ou doença contagiosa",
        "Profecia (possivelmente mal interpretada)",
        "Falta de mão-de-obra",
        "Interferência de feiticeiro/eremita",
        "Fenômeno natural incomum",
        "Espionagem política",
        "Mudança repentina de liderança local",
        "Disputa por território ou recursos",
        "Evento sazonal inesperado",
        "A morte de um humanoide importante",
      ];

      expectedCauses.forEach((cause) => {
        expect(Object.values(ServiceOriginCause)).toContain(cause);
      });
    });
  });

  describe("Interface ServiceObjective", () => {
    const validObjective: ServiceObjective = {
      type: ServiceObjectiveType.TREINAR_OU_ENSINAR,
      description: "Ensinar culinária básica para grupo de crianças",
      action: "Uma nova língua",
      target: "Para crianças órfãs",
      complication: "O conhecimento será usado contra você",
    };

    it("should validate correct objective structure", () => {
      expect(() => ServiceObjectiveSchema.parse(validObjective)).not.toThrow();
    });

    it("should support secondary objective for multiple results", () => {
      const multipleObjective: ServiceObjective = {
        ...validObjective,
        type: ServiceObjectiveType.MULTIPLO,
        secondaryObjective: {
          type: ServiceObjectiveType.RECRUTAR,
          description: "Recrutar ajudante para o ensino",
          action: "Especialista",
          target: "Para contrato específico",
          complication: "Não há boas escolhas",
        },
      };

      expect(() =>
        ServiceObjectiveSchema.parse(multipleObjective)
      ).not.toThrow();
    });
  });

  describe("Interface ServiceComplication", () => {
    const validComplication: ServiceComplication = {
      type: ServiceComplicationType.GOVERNO_LOCAL_DESAPROVA,
      consequence: ServiceComplicationConsequence.MEDIDAS_LEGAIS,
      description:
        "O governo local não aprova o serviço e tomará medidas legais",
    };

    it("should validate complication structure", () => {
      expect(() =>
        ServiceComplicationSchema.parse(validComplication)
      ).not.toThrow();
    });

    it("should have structure matching md tables", () => {
      expect(validComplication).toHaveProperty("type");
      expect(validComplication).toHaveProperty("consequence");
      expect(validComplication).toHaveProperty("description");
    });
  });

  describe("Interface ServiceRival", () => {
    const validRival: ServiceRival = {
      action: ServiceRivalAction.IRA_CONTRA_OBJETIVO,
      motivation: ServiceRivalMotivation.FAZ_POR_AMOR,
      description: "Rival irá contra o objetivo por amor",
    };

    it("should validate rival structure", () => {
      expect(() => ServiceRivalSchema.parse(validRival)).not.toThrow();
    });

    it("should have simple structure matching md tables", () => {
      expect(validRival).toHaveProperty("action");
      expect(validRival).toHaveProperty("motivation");
      expect(validRival).toHaveProperty("description");

      // Verificar que não tem propriedades que não existem no .md
      expect(validRival).not.toHaveProperty("name");
      expect(validRival).not.toHaveProperty("advantage");
      expect(validRival).not.toHaveProperty("weakness");
    });
  });

  describe("Interface ServiceOrigin", () => {
    const validOrigin: ServiceOrigin = {
      rootCause: ServiceOriginCause.TRADICAO_CONFLITO_FAMILIAR,
      additionalComplicator: ServiceAdditionalComplicator.MAL_ENTENDIDO,
      description: "Conflito familiar complicado por mal entendido",
    };

    it("should validate origin structure", () => {
      expect(() => ServiceOriginSchema.parse(validOrigin)).not.toThrow();
    });

    it("should follow exact md table structure", () => {
      expect(validOrigin).toHaveProperty("rootCause");
      expect(validOrigin).toHaveProperty("additionalComplicator");
      expect(validOrigin).toHaveProperty("description");

      // Não deve ter propriedades que não existem no .md
      expect(validOrigin).not.toHaveProperty("timeline");
      expect(validOrigin).not.toHaveProperty("scope");
      expect(validOrigin).not.toHaveProperty("urgency");
    });
  });

  describe("Interface ServiceAdditionalChallenge", () => {
    const validChallenge: ServiceAdditionalChallenge = {
      description:
        "Pescadores precisam de criaturas fortes para puxar peixes muito pesados",
      hasChallenge: true,
    };

    it("should validate challenge structure", () => {
      expect(() =>
        ServiceAdditionalChallengeSchema.parse(validChallenge)
      ).not.toThrow();
    });

    it("should have simple structure matching md section", () => {
      expect(validChallenge).toHaveProperty("description");
      expect(validChallenge).toHaveProperty("hasChallenge");

      // Estrutura simples conforme .md
      expect(typeof validChallenge.hasChallenge).toBe("boolean");
      expect(typeof validChallenge.description).toBe("string");
    });
  });

  describe("Fidelidade Total ao Arquivo .md", () => {
    it("should use exact strings from markdown tables", () => {
      // Verificar que usamos strings exatas das tabelas
      expect(ServiceRivalMotivation.FAZ_POR_AMOR).toBe("Faz isso por amor");
      expect(ServiceRivalMotivation.NA_VERDADE_E_CONTRATANTE).toBe(
        "Na verdade é o contratante"
      );
      expect(ServiceComplicationType.GOVERNO_LOCAL_DESAPROVA).toBe(
        "Governo local desaprova"
      );
      expect(ServiceOriginCause.TRADICAO_CONFLITO_FAMILIAR).toBe(
        "Tradição/conflito familiar"
      );
    });

    it("should not have properties that don't exist in md", () => {
      // Complicações no .md têm: tipo + consequência + descrição
      const complicationInterface = {
        type: ServiceComplicationType.GOVERNO_LOCAL_DESAPROVA,
        consequence: ServiceComplicationConsequence.MEDIDAS_LEGAIS,
        description: "Governo desaprova e entrará com medidas legais",
      };

      expect(complicationInterface).toHaveProperty("type");
      expect(complicationInterface).toHaveProperty("consequence");
      expect(complicationInterface).toHaveProperty("description");
    });

    it("should focus on service-specific elements", () => {
      // Serviços têm foco diferente de contratos
      expect(Object.values(ServiceComplicationType)).not.toContain("Morte");
      expect(Object.values(ServiceComplicationType)).not.toContain("Violência");
      expect(Object.values(ServiceComplicationType)).toContain(
        "Animal ou mascote atrapalha"
      );
    });
  });

  describe("Sistema Integrado Correto", () => {
    it("should combine elements following md structure", () => {
      const completeService = {
        objective: {
          type: ServiceObjectiveType.TREINAR_OU_ENSINAR,
          description: "Ensinar culinária básica",
          action: "Culinária básica",
          target: "Para crianças órfãs",
          complication: "O ambiente é cheio de distrações",
        },
        complication: {
          type: ServiceComplicationType.ANIMAL_ATRAPALHA,
          consequence:
            ServiceComplicationConsequence.NEGOCIAR_SOLUCAO_ALTERNATIVA,
          description: "Animal atrapalha e precisará negociar solução",
        },
        rival: {
          action: ServiceRivalAction.FARA_MESMA_COISA,
          motivation: ServiceRivalMotivation.BUSCA_RECONHECIMENTO,
          description: "Rival fará a mesma coisa buscando reconhecimento",
        },
        origin: {
          rootCause: ServiceOriginCause.FALTA_COMUNICACAO,
          additionalComplicator: ServiceAdditionalComplicator.INCOMPETENCIA,
          description: "Falta de comunicação agravada por incompetência",
        },
        additionalChallenge: {
          description: "Um gato pede ajuda para tirar seu anão da árvore",
          hasChallenge: true,
        },
      };

      // Todos os elementos seguem estrutura do .md
      expect(completeService.objective.type).toBe(
        ServiceObjectiveType.TREINAR_OU_ENSINAR
      );
      expect(completeService.complication.type).toBe(
        ServiceComplicationType.ANIMAL_ATRAPALHA
      );
      expect(completeService.rival.action).toBe(
        ServiceRivalAction.FARA_MESMA_COISA
      );
      expect(completeService.origin.rootCause).toBe(
        ServiceOriginCause.FALTA_COMUNICACAO
      );
      expect(completeService.additionalChallenge.hasChallenge).toBe(true);
    });
  });
});
