import { rollOnTable } from "@/utils/tableRoller";
import type { Antagonist } from "@/types/contract";
import {
  ANTAGONIST_TYPES_TABLE,
  ANTAGONIST_DETAIL_TABLE_MAP,
  mapAntagonistTypeToCategory,
  shouldRollTwice,
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
    // Rola na tabela principal para determinar o tipo
    const typeResult = rollOnTable(ANTAGONIST_TYPES_TABLE);

    // Se der "Role duas vezes", gera dois antagonistas separados
    if (shouldRollTwice(typeResult.result)) {
      return this.generateMultipleAntagonists();
    }

    // Gera detalhes do antagonista baseado no tipo
    return this.generateSingleAntagonist(typeResult.result);
  }

  /**
   * Gera múltiplos antagonistas quando o resultado indica "Role duas vezes"
   */
  private static generateMultipleAntagonists(): Antagonist {
    const firstType = rollOnTable(ANTAGONIST_TYPES_TABLE).result;
    const secondType = rollOnTable(ANTAGONIST_TYPES_TABLE).result;

    const firstAntagonist = this.generateSingleAntagonist(firstType);
    const secondAntagonist = this.generateSingleAntagonist(secondType);

    // Combina os dois antagonistas
    return {
      category: firstAntagonist.category,
      specificType: `${firstAntagonist.specificType} e ${secondAntagonist.specificType}`,
      name: `${firstAntagonist.name} & ${secondAntagonist.name}`,
      description: `Dupla ameaça: ${firstAntagonist.description} Em adição, ${secondAntagonist.description}`,
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

    // Rola na tabela de detalhes
    const detailResult = rollOnTable(detailTable);
    let specificType = detailResult.result;

    // Se der "Role duas vezes" na tabela de detalhes, combina dois resultados
    if (shouldRollTwice(specificType)) {
      const firstDetail = rollOnTable(detailTable).result;
      const secondDetail = rollOnTable(detailTable).result;
      specificType = `${firstDetail} e ${secondDetail}`;
    }

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
    return `Um ${specificType.toLowerCase()} que representa uma ameaça do tipo "${antagonistType}".`;
  }
}
