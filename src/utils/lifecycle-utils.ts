import { rollDice } from "./dice";

// ===== FUNÇÕES UTILITÁRIAS =====

/**
 * Converte string de dados/tempo em dias
 * Função reutilizável para contratos, serviços, e outros módulos
 */
export function convertTimeStringToDays(timeString: string): number {
  // Remove espaços e converte para lowercase
  const cleaned = timeString.toLowerCase().trim();

  if (cleaned.includes("dia")) {
    // Extrair e rolar dados para dias
    const diceMatch = cleaned.match(/(\d+d\d+(?:\+\d+)?|\d+)/);
    if (diceMatch) {
      const diceNotation = diceMatch[1];
      if (diceNotation.includes("d")) {
        return rollDice({ notation: diceNotation }).result;
      } else {
        return parseInt(diceNotation);
      }
    }
  } else if (cleaned.includes("semana")) {
    // Extrair e rolar dados para semanas, depois converter para dias
    const diceMatch = cleaned.match(/(\d+d\d+(?:\+\d+)?|\d+)/);
    if (diceMatch) {
      const diceNotation = diceMatch[1];
      let weeks: number;
      if (diceNotation.includes("d")) {
        weeks = rollDice({ notation: diceNotation }).result;
      } else {
        weeks = parseInt(diceNotation);
      }
      return weeks * 7; // Converter semanas para dias
    }
  } else if (cleaned.includes("mês") || cleaned.includes("mes")) {
    // Extrair e rolar dados para meses, depois converter para dias
    const diceMatch = cleaned.match(/(\d+d\d+(?:\+\d+)?|\d+)/);
    if (diceMatch) {
      const diceNotation = diceMatch[1];
      let months: number;
      if (diceNotation.includes("d")) {
        months = rollDice({ notation: diceNotation }).result;
      } else {
        months = parseInt(diceNotation);
      }
      return months * 30; // Converter meses para dias (aproximado)
    }
  }

  // Fallback - tentar extrair número diretamente
  const numberMatch = cleaned.match(/\d+/);
  if (numberMatch) {
    return parseInt(numberMatch[0]);
  }

  return 7; // Default de 1 semana
}

/**
 * Aplica lógica de anulação baseada em motivo de falha
 * Reutilizável para contratos e serviços
 */
export function shouldCancelByReason(
  reason: string,
  cancellationReasons: string[]
): boolean {
  return cancellationReasons.includes(reason);
}

/**
 * Seleciona items por critério de valor (menor/maior recompensa, etc.)
 * Função genérica para ordenação em resoluções automáticas
 */
export function selectByCriteria<T>(
  items: T[],
  getValue: (item: T) => number,
  criteria: "lowest" | "highest",
  count?: number
): T[] {
  const sorted = [...items].sort((a, b) => {
    const valueA = getValue(a);
    const valueB = getValue(b);
    return criteria === "lowest" ? valueA - valueB : valueB - valueA;
  });

  if (count !== undefined) {
    return sorted.slice(0, count);
  }

  // Se não especificou count, pega metade
  const halfCount = Math.ceil(sorted.length / 2);
  return sorted.slice(0, halfCount);
}

/**
 * Seleciona items aleatoriamente
 * Função genérica para resoluções aleatórias
 */
export function selectRandomItems<T>(items: T[], count: number): T[] {
  const shuffled = [...items].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, items.length));
}
