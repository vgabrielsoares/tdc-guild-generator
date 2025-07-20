import { ref } from "vue";
import { rollOnTable } from "@/utils/tableRoller";
import type { TableEntry, TableRollResult, RollModifier } from "@/types/tables";

export function useTable<T>() {
  const isRolling = ref(false);
  const lastResult = ref<TableRollResult<T> | null>(null);

  const rollOn = async (
    table: TableEntry<T>[],
    modifiers: RollModifier[] = []
  ) => {
    isRolling.value = true;
    try {
      // Add small delay for visual effect
      await new Promise((resolve) => setTimeout(resolve, 300));

      const result = rollOnTable(table, modifiers);
      lastResult.value = result;

      return result;
    } finally {
      isRolling.value = false;
    }
  };

  const clearResult = () => {
    lastResult.value = null;
  };

  return {
    isRolling,
    lastResult,
    rollOn,
    clearResult,
  };
}
