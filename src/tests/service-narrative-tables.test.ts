/**
 * Testes para Validação das Tabelas Narrativas de Serviços
 * 
 * Valida:
 * - Cobertura completa dos ranges de dados
 * - Textos exatos conforme especificação
 */

import { describe, it, expect } from "vitest";
import {
  SERVICE_ORIGIN_TABLE,
  SERVICE_ADDITIONAL_COMPLICATOR_TABLE,
  SERVICE_COMPLICATION_CHANCE_TABLE,
  SERVICE_COMPLICATION_TYPE_TABLE,
  SERVICE_COMPLICATION_CONSEQUENCE_TABLE,
  SERVICE_RIVAL_CHANCE_TABLE,
  SERVICE_RIVAL_ACTION_TABLE,
  SERVICE_RIVAL_MOTIVATION_TABLE,
} from "@/data/tables/service-narrative-tables";

describe("Service Narrative Tables - Issue 5.14", () => {
  describe("Tabela de Origem do Problema (d20)", () => {
    it("should have exactly 20 entries covering 1-20", () => {
      expect(SERVICE_ORIGIN_TABLE).toHaveLength(20);
      
      for (let i = 1; i <= 20; i++) {
        const hasEntry = SERVICE_ORIGIN_TABLE.some(
          entry => i >= entry.min && i <= entry.max
        );
        expect(hasEntry).toBe(true);
      }
    });

    it("should match exact markdown table entries", () => {
      const expectedOrigins = [
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

      const tableEntries = SERVICE_ORIGIN_TABLE.map(entry => entry.result.description);
      expect(tableEntries).toEqual(expectedOrigins);
    });
  });

  describe("Tabela de Complicador Adicional (d20)", () => {
    it("should have exactly 20 entries covering 1-20", () => {
      expect(SERVICE_ADDITIONAL_COMPLICATOR_TABLE).toHaveLength(20);
      
      for (let i = 1; i <= 20; i++) {
        const hasEntry = SERVICE_ADDITIONAL_COMPLICATOR_TABLE.some(
          entry => i >= entry.min && i <= entry.max
        );
        expect(hasEntry).toBe(true);
      }
    });

    it("should match exact markdown table entries", () => {
      const expectedComplicators = [
        "Um pouco de azar",
        "Um mal entendido",
        "Intervenção divina",
        "Ganância",
        "A quebra de uma maldição",
        "Um romance interrompido",
        "Traição",
        "O sumiço de um importante artefato",
        "Conflito entre facções",
        "Chantagem",
        "Dívida",
        "Um atraso inesperado",
        "Pressão do tempo",
        "Uma visita surpresa",
        "Incompetência",
        "Acidente inesperado",
        "Excesso de burocracia",
        "Interferência externa",
        "Mudança de planos",
        "Evento climático/desastre natural",
      ];

      const tableEntries = SERVICE_ADDITIONAL_COMPLICATOR_TABLE.map(entry => entry.result.description);
      expect(tableEntries).toEqual(expectedComplicators);
    });
  });

  describe("Tabela de Chance de Complicações (d20)", () => {
    it("should have correct probability distribution", () => {
      expect(SERVICE_COMPLICATION_CHANCE_TABLE).toHaveLength(2);
      
      // 1-14: Não (70% chance)
      const noComplicationEntry = SERVICE_COMPLICATION_CHANCE_TABLE.find(
        entry => entry.result.hasComplication === false
      );
      expect(noComplicationEntry?.min).toBe(1);
      expect(noComplicationEntry?.max).toBe(14);
      expect(noComplicationEntry?.result.description).toBe("Não");

      // 15-20: Sim (30% chance)  
      const hasComplicationEntry = SERVICE_COMPLICATION_CHANCE_TABLE.find(
        entry => entry.result.hasComplication === true
      );
      expect(hasComplicationEntry?.min).toBe(15);
      expect(hasComplicationEntry?.max).toBe(20);
      expect(hasComplicationEntry?.result.description).toBe("Sim");
    });
  });

  describe("Tabela de Tipos de Complicações (d20)", () => {
    it("should have exactly 20 entries covering 1-20", () => {
      expect(SERVICE_COMPLICATION_TYPE_TABLE).toHaveLength(20);
      
      for (let i = 1; i <= 20; i++) {
        const hasEntry = SERVICE_COMPLICATION_TYPE_TABLE.some(
          entry => i >= entry.min && i <= entry.max
        );
        expect(hasEntry).toBe(true);
      }
    });

    it("should match exact markdown table entries", () => {
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

      const tableEntries = SERVICE_COMPLICATION_TYPE_TABLE.map(entry => entry.result.description);
      expect(tableEntries).toEqual(expectedComplications);
    });
  });

  describe("Tabela de Consequências das Complicações (d20)", () => {
    it("should have exactly 20 entries covering 1-20", () => {
      expect(SERVICE_COMPLICATION_CONSEQUENCE_TABLE).toHaveLength(20);
      
      for (let i = 1; i <= 20; i++) {
        const hasEntry = SERVICE_COMPLICATION_CONSEQUENCE_TABLE.some(
          entry => i >= entry.min && i <= entry.max
        );
        expect(hasEntry).toBe(true);
      }
    });

    it("should match exact markdown table entries", () => {
      const expectedConsequences = [
        "Entrará com medidas legais",
        "Manipulará as coisas por baixo dos panos",
        "Tentará te convencer a desistir",
        "Complicará sua vida caso seja bem-sucedido",
        "Abusará de seu poder para conseguir o que quer",
        "Usarão de violência para te impedir",
        "Contratante exigirá retrabalho",
        "Terá que negociar uma solução alternativa",
        "Dará ordens contraditórias",
        "Reclamações de terceiros",
        "Sumirá com documentos essenciais",
        "Fiscalização extra",
        "Vazará informações confidenciais",
        "Exigirá compensação simbólica",
        "Contratará concorrentes para atrapalhar",
        "Tentará atrasar o pagamento indefinidamente",
        "Espalhará fofocas sobre sua competência",
        "Fará exigências fora do escopo original",
        "Contratante exige garantia adicional",
        "Role duas vezes e use ambos",
      ];

      const tableEntries = SERVICE_COMPLICATION_CONSEQUENCE_TABLE.map(entry => entry.result.description);
      expect(tableEntries).toEqual(expectedConsequences);
    });
  });

  describe("Tabela de Chance de Rivais (d20)", () => {
    it("should have correct probability distribution", () => {
      expect(SERVICE_RIVAL_CHANCE_TABLE).toHaveLength(2);
      
      // 1-18: Não (90% chance)
      const noRivalEntry = SERVICE_RIVAL_CHANCE_TABLE.find(
        entry => entry.result.hasRival === false
      );
      expect(noRivalEntry?.min).toBe(1);
      expect(noRivalEntry?.max).toBe(18);
      expect(noRivalEntry?.result.description).toBe("Não");

      // 19-20: Sim (10% chance)  
      const hasRivalEntry = SERVICE_RIVAL_CHANCE_TABLE.find(
        entry => entry.result.hasRival === true
      );
      expect(hasRivalEntry?.min).toBe(19);
      expect(hasRivalEntry?.max).toBe(20);
      expect(hasRivalEntry?.result.description).toBe("Sim");
    });
  });

  describe("Tabela de Ações do Rival (d20)", () => {
    it("should have correct range distribution", () => {
      expect(SERVICE_RIVAL_ACTION_TABLE).toHaveLength(10);
      
      // Verificar ranges específicos conforme markdown
      const expectedRanges = [
        { min: 1, max: 5, description: "Irá contra seu objetivo" },
        { min: 6, max: 6, description: "Fará a mesma coisa que você" },
        { min: 7, max: 8, description: "Sabota/Implanta armadilhas" },
        { min: 9, max: 10, description: "Roubará recursos importantes" },
        { min: 11, max: 12, description: "Tentará ficar com os créditos" },
        { min: 13, max: 13, description: "Espalha rumores maldosos" },
        { min: 14, max: 14, description: "Fingirá ser o contratado" },
        { min: 15, max: 16, description: "Dará dicas falsas sobre o serviço" },
        { min: 17, max: 18, description: "Oferecerá valiosas informações" },
        { min: 19, max: 20, description: "Tentará te subornar ou ameaçar" },
      ];

      expectedRanges.forEach((expected, index) => {
        const entry = SERVICE_RIVAL_ACTION_TABLE[index];
        expect(entry.min).toBe(expected.min);
        expect(entry.max).toBe(expected.max);
        expect(entry.result.description).toBe(expected.description);
      });
    });
  });

  describe("Tabela de Motivação do Rival (d20)", () => {
    it("should have correct range distribution", () => {
      expect(SERVICE_RIVAL_MOTIVATION_TABLE).toHaveLength(17);
      
      // Verificar que cobre 1-20
      for (let i = 1; i <= 20; i++) {
        const hasEntry = SERVICE_RIVAL_MOTIVATION_TABLE.some(
          entry => i >= entry.min && i <= entry.max
        );
        expect(hasEntry).toBe(true);
      }
    });

    it("should match exact markdown table entries", () => {
      const expectedMotivations = [
        { min: 1, max: 1, description: "Faz isso por amor" },
        { min: 2, max: 2, description: "Se atrapalha todo" },
        { min: 3, max: 5, description: "Faz isso porque precisa" },
        { min: 6, max: 6, description: "Busca reconhecimento" },
        { min: 7, max: 8, description: "Busca uma recompensa pessoal" },
        { min: 9, max: 9, description: "Está seguindo ordens de terceiros" },
        { min: 10, max: 10, description: "Faz isso por pura diversão" },
        { min: 11, max: 11, description: "Faz isso por vingança" },
        { min: 12, max: 12, description: "Está sob influência mágica ou mental" },
        { min: 13, max: 13, description: "Está tentando evitar um desastre maior" },
        { min: 14, max: 14, description: "Faz isso pelas crianças" },
        { min: 15, max: 15, description: "Se arrepende" },
        { min: 16, max: 16, description: "Desaparece depois disso" },
        { min: 17, max: 17, description: "No fundo gosta, e faz isso por você" },
        { min: 18, max: 18, description: "Faz isso porque te odeia" },
        { min: 19, max: 19, description: "Faz isso contra a vontade dele" },
        { min: 20, max: 20, description: "Na verdade é o contratante" },
      ];

      expectedMotivations.forEach((expected, index) => {
        const entry = SERVICE_RIVAL_MOTIVATION_TABLE[index];
        expect(entry.min).toBe(expected.min);
        expect(entry.max).toBe(expected.max);
        expect(entry.result.description).toBe(expected.description);
      });
    });
  });

  describe("Integração com Sistema de Rolagem", () => {
    it("should have tables compatible with standard dice rolling", () => {
      // Verificar se todas as tabelas são compatíveis com d20
      const tables = [
        SERVICE_ORIGIN_TABLE,
        SERVICE_ADDITIONAL_COMPLICATOR_TABLE,
        SERVICE_COMPLICATION_CHANCE_TABLE,
        SERVICE_COMPLICATION_TYPE_TABLE,
        SERVICE_COMPLICATION_CONSEQUENCE_TABLE,
        SERVICE_RIVAL_CHANCE_TABLE,
        SERVICE_RIVAL_ACTION_TABLE,
        SERVICE_RIVAL_MOTIVATION_TABLE,
      ];

      tables.forEach(table => {
        const minValue = Math.min(...table.map(entry => entry.min));
        const maxValue = Math.max(...table.map(entry => entry.max));
        
        expect(minValue).toBe(1);
        expect(maxValue).toBe(20);
      });
    });
  });
});
