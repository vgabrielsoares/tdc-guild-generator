import {
  rollMultipleWithCombining,
  createTextBasedRollAgainChecker,
} from "@/utils/multiRollHandler";
import type { Antagonist } from "@/types/contract";
import {
  ANTAGONIST_TYPES_TABLE,
  ANTAGONIST_DETAIL_TABLE_MAP,
  mapAntagonistTypeToCategory,
} from "@/data/tables/contract-antagonist-tables";

// ===== GERADOR DE ANTAGONISTAS =====

/**
 * Gera um antagonista baseado na seção "Antagonistas"
 */
export class AntagonistGenerator {
  /**
   * Gera um antagonista principal seguindo as regras das tabelas
   */
  static generateAntagonist(): Antagonist {
    // Usa sistema de múltiplas rolagens para tipos de antagonistas
    const typeResults = rollMultipleWithCombining(
      ANTAGONIST_TYPES_TABLE,
      createTextBasedRollAgainChecker("Role duas vezes"),
      "Tipos de Antagonistas",
      2 // Limitar a 2 tipos máximo
    );

    // Se houve múltiplos tipos, gera antagonistas combinados
    if (typeResults.includes(" E ")) {
      return this.generateCombinedAntagonists(typeResults);
    }

    // Gera detalhes do antagonista baseado no tipo
    return this.generateSingleAntagonist(typeResults);
  }

  /**
   * Gera múltiplos antagonistas combinados baseado nos tipos coletados
   */
  private static generateCombinedAntagonists(
    combinedTypes: string
  ): Antagonist {
    const types = combinedTypes.split(" E ").map((t) => t.trim());
    const antagonists = types.map((type) =>
      this.generateSingleAntagonist(type)
    );

    if (antagonists.length === 2) {
      const [first, second] = antagonists;
      return {
        category: first.category,
        specificType: `${first.specificType} e ${second.specificType}`,
        name: `${first.name} & ${second.name}`,
        description: `Dupla ameaça: ${first.description} Em adição, ${second.description}`,
      };
    }

    // Para mais de 2 antagonistas, combina tudo
    const combinedCategory = antagonists[0].category;
    const combinedSpecificType = antagonists
      .map((a) => a.specificType)
      .join(", ");
    const combinedName = antagonists.map((a) => a.name).join(" & ");
    const combinedDescription = `Múltiplas ameaças: ${antagonists.map((a) => a.description).join(" Além disso, ")}`;

    return {
      category: combinedCategory,
      specificType: combinedSpecificType,
      name: combinedName,
      description: combinedDescription,
    };
  }

  /**
   * Gera um antagonista único baseado no tipo especificado
   */
  private static generateSingleAntagonist(antagonistType: string): Antagonist {
    // Obtém a tabela de detalhamento correspondente
    const detailTable = ANTAGONIST_DETAIL_TABLE_MAP[antagonistType];
    if (!detailTable) {
      throw new Error(
        `Tabela de detalhes não encontrada para tipo: ${antagonistType}`
      );
    }

    // Usa novo sistema de múltiplas rolagens para detalhes específicos
    const specificType = rollMultipleWithCombining(
      detailTable,
      createTextBasedRollAgainChecker("Role duas vezes"),
      `Detalhes ${antagonistType}`
    );

    const category = mapAntagonistTypeToCategory(antagonistType);

    return {
      category,
      specificType,
      name: this.generateSimpleName(specificType),
      description: this.generateSimpleDescription(antagonistType, specificType),
    };
  }

  /**
   * Gera nome simples baseado no tipo específico
   */
  private static generateSimpleName(specificType: string): string {
    // Usa o próprio tipo específico como base para o nome
    const words = specificType.split(" ");
    const capitalizedWords = words.map(
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    );
    return capitalizedWords.join(" ");
  }

  /**
   * Gera descrição simples
   */
  private static generateSimpleDescription(
    antagonistType: string,
    specificType: string
  ): string {
    const capitalized =
      specificType && specificType.length > 0
        ? specificType.charAt(0).toUpperCase() + specificType.slice(1)
        : specificType;
    return `${capitalized} que representa uma ameaça do tipo "${antagonistType}".`;
  }
}
