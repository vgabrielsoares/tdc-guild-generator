import { describe, it, expect } from "vitest";
import { ServiceGenerator } from "@/utils/generators/serviceGenerator";
import { ServiceObjectiveType } from "@/types/service";
import type { ServiceObjective } from "@/types/service";

describe("Service Description Fix - Extrair Recursos", () => {
  it("should generate correct description for 'Material comum de Poço'", () => {
    const objective: ServiceObjective = {
      type: ServiceObjectiveType.EXTRAIR_RECURSOS,
      description: "",
      action: "Material comum",
      target: "Poço",
      complication: "Exige ferramentas caras e específicas",
    };

    // Acessar método privado para teste
    const description = (
      ServiceGenerator as unknown as {
        generateServiceDescription: (obj: ServiceObjective) => string;
      }
    ).generateServiceDescription(objective);

    // Deve incluir "de poço" corretamente (não "poço" sem preposição)
    expect(description).toContain("de material comum de poço");

    // Não deve ter descrição duplicada sem preposição
    expect(description).not.toContain("material comum poço");
  });

  it("should generate correct description for 'Especiaria de Caverna'", () => {
    const objective: ServiceObjective = {
      type: ServiceObjectiveType.EXTRAIR_RECURSOS,
      description: "",
      action: "Especiaria",
      target: "Caverna",
      complication: "O local é instável",
    };

    const description = (
      ServiceGenerator as unknown as {
        generateServiceDescription: (obj: ServiceObjective) => string;
      }
    ).generateServiceDescription(objective);

    // Deve incluir "de caverna" corretamente (não "caverna" sem preposição)
    expect(description).toContain("de especiaria de caverna");

    // Não deve ter descrição malformada sem preposição
    expect(description).not.toContain("especiaria caverna");
  });

  it("should generate correct description for 'Mineral metálico de Poço'", () => {
    const objective: ServiceObjective = {
      type: ServiceObjectiveType.EXTRAIR_RECURSOS,
      description: "",
      action: "Mineral metálico",
      target: "Poço",
      complication: "O local está infestado/ocupado",
    };

    const description = (
      ServiceGenerator as unknown as {
        generateServiceDescription: (obj: ServiceObjective) => string;
      }
    ).generateServiceDescription(objective);

    // Deve incluir "de poço" corretamente
    expect(description).toContain("de mineral metálico de poço");
  });

  it("should handle other objective types normally", () => {
    const objective: ServiceObjective = {
      type: ServiceObjectiveType.AUXILIAR_OU_CUIDAR,
      description: "",
      action: "pessoa doente",
      target: "templo",
      complication: "Alguma complicação",
    };

    const description = (
      ServiceGenerator as unknown as {
        generateServiceDescription: (obj: ServiceObjective) => string;
      }
    ).generateServiceDescription(objective);

    // Deve manter o comportamento original para outros tipos
    expect(description).toContain("Auxiliar ou cuidar de pessoa doente");
  });
});
