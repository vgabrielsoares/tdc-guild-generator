import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  SERVICE_OBJECTIVE_TYPE_TABLE,
  TRAIN_OR_TEACH_TABLE,
  RECRUIT_TABLE,
  HEAL_OR_RECOVER_TABLE,
  NEGOTIATE_OR_COERCE_TABLE,
  rollThreeColumnObjective,
  getThreeColumnTable,
  generateServiceObjective,
  IMPLEMENTED_OBJECTIVE_TYPES,
} from "@/data/tables/service-objective-tables";
import { ServiceObjectiveType } from "@/types/service";

describe("Service Objective Tables - Part 1 (Issue 5.11)", () => {
  describe("SERVICE_OBJECTIVE_TYPE_TABLE", () => {
    it("should cover all ranges from 1-20 without gaps", () => {
      for (let i = 1; i <= 20; i++) {
        const entry = SERVICE_OBJECTIVE_TYPE_TABLE.find(
          (entry) => i >= entry.min && i <= entry.max
        );
        expect(entry).toBeDefined();
      }
    });

    it("should have correct objective type distributions according to .md", () => {
      // Treinar ou ensinar: 1-4 (4 resultados)
      const trainTeachEntries = SERVICE_OBJECTIVE_TYPE_TABLE.filter(
        (entry) => entry.result.type === ServiceObjectiveType.TREINAR_OU_ENSINAR
      );
      expect(trainTeachEntries).toHaveLength(1);
      expect(trainTeachEntries[0].min).toBe(1);
      expect(trainTeachEntries[0].max).toBe(4);

      // Recrutar: 5-6 (2 resultados)
      const recruitEntries = SERVICE_OBJECTIVE_TYPE_TABLE.filter(
        (entry) => entry.result.type === ServiceObjectiveType.RECRUTAR
      );
      expect(recruitEntries).toHaveLength(1);
      expect(recruitEntries[0].min).toBe(5);
      expect(recruitEntries[0].max).toBe(6);

      // Curar ou recuperar: 7-8 (2 resultados)
      const healEntries = SERVICE_OBJECTIVE_TYPE_TABLE.filter(
        (entry) => entry.result.type === ServiceObjectiveType.CURAR_OU_RECUPERAR
      );
      expect(healEntries).toHaveLength(1);
      expect(healEntries[0].min).toBe(7);
      expect(healEntries[0].max).toBe(8);

      // Negociar ou coagir: 9 (1 resultado)
      const negotiateEntries = SERVICE_OBJECTIVE_TYPE_TABLE.filter(
        (entry) => entry.result.type === ServiceObjectiveType.NEGOCIAR_OU_COAGIR
      );
      expect(negotiateEntries).toHaveLength(1);
      expect(negotiateEntries[0].min).toBe(9);
      expect(negotiateEntries[0].max).toBe(9);

      // Múltiplo: 20 (1 resultado)
      const multipleEntries = SERVICE_OBJECTIVE_TYPE_TABLE.filter(
        (entry) => entry.result.type === ServiceObjectiveType.MULTIPLO
      );
      expect(multipleEntries).toHaveLength(1);
      expect(multipleEntries[0].min).toBe(20);
      expect(multipleEntries[0].max).toBe(20);
      expect(multipleEntries[0].result.hasMultiple).toBe(true);
    });

    it("should only mark multiple objective as hasMultiple", () => {
      SERVICE_OBJECTIVE_TYPE_TABLE.forEach((entry) => {
        if (entry.result.type === ServiceObjectiveType.MULTIPLO) {
          expect(entry.result.hasMultiple).toBe(true);
        } else {
          expect(entry.result.hasMultiple).toBe(false);
        }
      });
    });
  });

  describe("Three Column Tables Structure", () => {
    const tablesToTest = [
      { name: "TRAIN_OR_TEACH_TABLE", table: TRAIN_OR_TEACH_TABLE },
      { name: "RECRUIT_TABLE", table: RECRUIT_TABLE },
      { name: "HEAL_OR_RECOVER_TABLE", table: HEAL_OR_RECOVER_TABLE },
      { name: "NEGOTIATE_OR_COERCE_TABLE", table: NEGOTIATE_OR_COERCE_TABLE },
    ];

    tablesToTest.forEach(({ name, table }) => {
      describe(name, () => {
        it("should have exactly 20 entries (1 for each d20 result)", () => {
          expect(table).toHaveLength(20);
        });

        it("should cover all ranges from 1-20 without gaps or overlaps", () => {
          for (let i = 1; i <= 20; i++) {
            const matchingEntries = table.filter(
              (entry) => i >= entry.min && i <= entry.max
            );
            expect(matchingEntries).toHaveLength(1);
          }
        });

        it("should have consecutive entries from 1 to 20", () => {
          table.forEach((entry, index) => {
            expect(entry.min).toBe(index + 1);
            expect(entry.max).toBe(index + 1);
          });
        });

        it("should have all three columns populated for each entry", () => {
          table.forEach((entry) => {
            expect(entry.result.action).toBeTruthy();
            expect(entry.result.target).toBeTruthy();
            expect(entry.result.complication).toBeTruthy();
            expect(typeof entry.result.action).toBe("string");
            expect(typeof entry.result.target).toBe("string");
            expect(typeof entry.result.complication).toBe("string");
          });
        });
      });
    });
  });

  describe("Specific Table Content Validation", () => {
    it("TRAIN_OR_TEACH_TABLE should match .md content exactly", () => {
      // Teste algumas entradas específicas
      expect(TRAIN_OR_TEACH_TABLE[0].result).toEqual({
        action: "Uma nova língua",
        target: "Uma besta",
        complication: "Contra a vontade/discorda de tudo",
      });

      expect(TRAIN_OR_TEACH_TABLE[2].result).toEqual({
        action: "A arte do combate",
        target: "Um humanoide hostil",
        complication: "Trauma sobre o que será ensinado",
      });

      expect(TRAIN_OR_TEACH_TABLE[4].result).toEqual({
        action: "Boas maneiras",
        target: "Para crianças órfãs",
        complication: "O treinado tem dificuldade de aprendizado",
      });
    });

    it("RECRUIT_TABLE should match .md content exactly", () => {
      expect(RECRUIT_TABLE[0].result).toEqual({
        action: "Combatentes",
        target: "Contrato específico",
        complication: "Vai contra os princípios do recrutado",
      });

      expect(RECRUIT_TABLE[5].result).toEqual({
        action: "Uma bruxa",
        target: "Trabalhar em um evento",
        complication: "O recrutado não gosta de trabalhar com outros",
      });
    });

    it("HEAL_OR_RECOVER_TABLE should match .md content exactly", () => {
      expect(HEAL_OR_RECOVER_TABLE[0].result).toEqual({
        action: "Doença contagiosa",
        target: "Bestas enfermas",
        complication: "O afetado não colabora",
      });

      expect(HEAL_OR_RECOVER_TABLE[3].result).toEqual({
        action: "Bugiganga que criou vida",
        target: "Um engenhoqueiro",
        complication: "Cria-se um laço sentimental muito forte",
      });
    });

    it("NEGOTIATE_OR_COERCE_TABLE should match .md content exactly", () => {
      expect(NEGOTIATE_OR_COERCE_TABLE[0].result).toEqual({
        action: "Mercadores locais",
        target: "Assinar um contrato",
        complication: "Isso afetará seus familiares",
      });

      expect(NEGOTIATE_OR_COERCE_TABLE[9].result).toEqual({
        action: "Comerciante itinerante",
        target: "Obter apoio financeiro ou político",
        complication: "Insiste em selar o pacto com um beijo",
      });
    });
  });

  describe("rollThreeColumnObjective", () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it("should use three independent dice rolls", () => {
      const mockActionRoll = vi.fn().mockReturnValue(1);
      const mockTargetRoll = vi.fn().mockReturnValue(5);
      const mockComplicationRoll = vi.fn().mockReturnValue(10);

      const result = rollThreeColumnObjective(
        TRAIN_OR_TEACH_TABLE,
        mockActionRoll,
        mockTargetRoll,
        mockComplicationRoll
      );

      expect(mockActionRoll).toHaveBeenCalledTimes(1);
      expect(mockTargetRoll).toHaveBeenCalledTimes(1);
      expect(mockComplicationRoll).toHaveBeenCalledTimes(1);

      // Deve combinar resultados de diferentes rolagens
      expect(result.action).toBe("Uma nova língua"); // Rolagem 1
      expect(result.target).toBe("Para crianças órfãs"); // Rolagem 5
      expect(result.complication).toBe("O tempo para ensinar é muito curto"); // Rolagem 10
    });

    it("should work with default random rolls", () => {
      const result = rollThreeColumnObjective(TRAIN_OR_TEACH_TABLE);

      expect(result.action).toBeTruthy();
      expect(result.target).toBeTruthy();
      expect(result.complication).toBeTruthy();
      expect(typeof result.action).toBe("string");
      expect(typeof result.target).toBe("string");
      expect(typeof result.complication).toBe("string");
    });

    it("should handle edge case rolls (1 and 20)", () => {
      const result1 = rollThreeColumnObjective(
        TRAIN_OR_TEACH_TABLE,
        () => 1,
        () => 1,
        () => 1
      );

      expect(result1.action).toBe("Uma nova língua");
      expect(result1.target).toBe("Uma besta");
      expect(result1.complication).toBe("Contra a vontade/discorda de tudo");

      const result20 = rollThreeColumnObjective(
        TRAIN_OR_TEACH_TABLE,
        () => 20,
        () => 20,
        () => 20
      );

      expect(result20.action).toBe("Jogos e esportes simples");
      expect(result20.target).toBe("Um grupo de crianças");
      expect(result20.complication).toBe(
        "O treinado espera recompensas extras para se dedicar"
      );
    });
  });

  describe("getThreeColumnTable", () => {
    it("should return correct tables for implemented objective types", () => {
      expect(getThreeColumnTable(ServiceObjectiveType.TREINAR_OU_ENSINAR)).toBe(
        TRAIN_OR_TEACH_TABLE
      );
      expect(getThreeColumnTable(ServiceObjectiveType.RECRUTAR)).toBe(
        RECRUIT_TABLE
      );
      expect(getThreeColumnTable(ServiceObjectiveType.CURAR_OU_RECUPERAR)).toBe(
        HEAL_OR_RECOVER_TABLE
      );
      expect(getThreeColumnTable(ServiceObjectiveType.NEGOCIAR_OU_COAGIR)).toBe(
        NEGOTIATE_OR_COERCE_TABLE
      );

      expect(
        getThreeColumnTable(ServiceObjectiveType.AUXILIAR_OU_CUIDAR)
      ).not.toBeNull();
      expect(
        getThreeColumnTable(ServiceObjectiveType.EXTRAIR_RECURSOS)
      ).not.toBeNull();
      expect(
        getThreeColumnTable(ServiceObjectiveType.CONSTRUIR_CRIAR_OU_REPARAR)
      ).not.toBeNull();
    });

    it("should return null only for MULTIPLO objective type (handled separately)", () => {
      expect(
        getThreeColumnTable(ServiceObjectiveType.SERVICOS_ESPECIFICOS)
      ).not.toBeNull();
      expect(getThreeColumnTable(ServiceObjectiveType.RELIGIOSO)).not.toBeNull();
      expect(getThreeColumnTable(ServiceObjectiveType.MULTIPLO)).toBeNull();
    });
  });

  describe("generateServiceObjective", () => {
    it("should generate complete objectives for implemented types", () => {
      const objective = generateServiceObjective(
        ServiceObjectiveType.TREINAR_OU_ENSINAR
      );

      expect(objective).not.toBeNull();
      expect(objective!.type).toBe(ServiceObjectiveType.TREINAR_OU_ENSINAR);
      expect(objective!.description).toContain("para");
      expect(objective!.description).toContain("mas");
      expect(objective!.action).toBeTruthy();
      expect(objective!.target).toBeTruthy();
      expect(objective!.complication).toBeTruthy();
    });

    it("should handle all objective types after Issue 5.13 implementation", () => {
      expect(
        generateServiceObjective(ServiceObjectiveType.SERVICOS_ESPECIFICOS)
      ).not.toBeNull();
      expect(
        generateServiceObjective(ServiceObjectiveType.RELIGIOSO)
      ).not.toBeNull();
      expect(
        generateServiceObjective(ServiceObjectiveType.MULTIPLO)
      ).not.toBeNull();
    });

    it("should format description correctly according to .md example", () => {
      // Mock para gerar o exemplo
      const mockActionRoll = () => 3; // "A arte do combate"
      const mockTargetRoll = () => 5; // "Para crianças órfãs"
      const mockComplicationRoll = () => 2; // "O conhecimento será usado contra você"

      const result = rollThreeColumnObjective(
        TRAIN_OR_TEACH_TABLE,
        mockActionRoll,
        mockTargetRoll,
        mockComplicationRoll
      );

      // Verifica se as rolagens independentes foram aplicadas corretamente
      expect(result.action).toBe("A arte do combate");
      expect(result.target).toBe("Para crianças órfãs");
      expect(result.complication).toBe("O conhecimento será usado contra você");

      // Verifica formatação da descrição
      const description = `${ServiceObjectiveType.TREINAR_OU_ENSINAR} ${result.action} ${result.target}, mas ${result.complication}`;
      expect(description).toBe(
        "Treinar ou ensinar A arte do combate Para crianças órfãs, mas O conhecimento será usado contra você"
      );
    });
  });

  describe("IMPLEMENTED_OBJECTIVE_TYPES constant", () => {
    it("should contain all 10 objective types after Issue 5.13 completion", () => {
      expect(IMPLEMENTED_OBJECTIVE_TYPES).toHaveLength(10);
      expect(IMPLEMENTED_OBJECTIVE_TYPES).toContain(
        ServiceObjectiveType.TREINAR_OU_ENSINAR
      );
      expect(IMPLEMENTED_OBJECTIVE_TYPES).toContain(
        ServiceObjectiveType.RECRUTAR
      );
      expect(IMPLEMENTED_OBJECTIVE_TYPES).toContain(
        ServiceObjectiveType.CURAR_OU_RECUPERAR
      );
      expect(IMPLEMENTED_OBJECTIVE_TYPES).toContain(
        ServiceObjectiveType.NEGOCIAR_OU_COAGIR
      );
      expect(IMPLEMENTED_OBJECTIVE_TYPES).toContain(
        ServiceObjectiveType.AUXILIAR_OU_CUIDAR
      );
      expect(IMPLEMENTED_OBJECTIVE_TYPES).toContain(
        ServiceObjectiveType.EXTRAIR_RECURSOS
      );
      expect(IMPLEMENTED_OBJECTIVE_TYPES).toContain(
        ServiceObjectiveType.CONSTRUIR_CRIAR_OU_REPARAR
      );
    });

    it("should now include all objective types including Issue 5.13 additions", () => {
      expect(IMPLEMENTED_OBJECTIVE_TYPES).toContain(
        ServiceObjectiveType.SERVICOS_ESPECIFICOS
      );
      expect(IMPLEMENTED_OBJECTIVE_TYPES).toContain(
        ServiceObjectiveType.RELIGIOSO
      );
      expect(IMPLEMENTED_OBJECTIVE_TYPES).toContain(
        ServiceObjectiveType.MULTIPLO
      );
    });
  });

  describe("Integration with ServiceObjective interface", () => {
    it("should generate objectives compatible with ServiceObjective interface", () => {
      const objective = generateServiceObjective(ServiceObjectiveType.RECRUTAR);

      expect(objective).not.toBeNull();

      // Verifica compatibilidade com interface ServiceObjective
      const serviceObjective = {
        type: objective!.type,
        description: objective!.description,
        action: objective!.action,
        target: objective!.target,
        complication: objective!.complication,
        // secondaryObjective seria adicionado para tipo MULTIPLO
      };

      expect(serviceObjective.type).toBe(ServiceObjectiveType.RECRUTAR);
      expect(typeof serviceObjective.description).toBe("string");
      expect(typeof serviceObjective.action).toBe("string");
      expect(typeof serviceObjective.target).toBe("string");
      expect(typeof serviceObjective.complication).toBe("string");
    });
  });

  describe("Business Rules Validation", () => {
    it("should follow three-column system as specified in .md", () => {
      // "Como as tabelas possuem três colunas, role um dado para cada coluna"
      const actionRoll = 3;
      const targetRoll = 5;
      const complicationRoll = 2;

      const result = rollThreeColumnObjective(
        TRAIN_OR_TEACH_TABLE,
        () => actionRoll,
        () => targetRoll,
        () => complicationRoll
      );

      // Deve usar resultados independentes para cada coluna
      expect(result.action).toBe(
        TRAIN_OR_TEACH_TABLE[actionRoll - 1].result.action
      );
      expect(result.target).toBe(
        TRAIN_OR_TEACH_TABLE[targetRoll - 1].result.target
      );
      expect(result.complication).toBe(
        TRAIN_OR_TEACH_TABLE[complicationRoll - 1].result.complication
      );
    });

    it("should generate descriptions following the format pattern", () => {
      const objective = generateServiceObjective(
        ServiceObjectiveType.CURAR_OU_RECUPERAR
      );

      expect(objective).not.toBeNull();
      expect(objective!.description).toMatch(
        /^.+ para .+, mas .+$/
      );
    });
  });
});
