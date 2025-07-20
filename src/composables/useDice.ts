import { ref } from "vue";
import { rollDice } from "@/utils/dice";
import type { DiceRoll } from "@/types/dice";

export function useDice() {
  const isRolling = ref(false);
  const lastResult = ref<DiceRoll | null>(null);
  const rollHistory = ref<DiceRoll[]>([]);

  const roll = async (notation: string) => {
    isRolling.value = true;
    try {
      // Add small delay for visual effect
      await new Promise((resolve) => setTimeout(resolve, 500));

      const result = rollDice({ notation, context: "Composable roll" });
      lastResult.value = result;
      rollHistory.value.unshift(result);

      return result;
    } finally {
      isRolling.value = false;
    }
  };

  const clearHistory = () => {
    rollHistory.value = [];
    lastResult.value = null;
  };

  return {
    isRolling,
    lastResult,
    rollHistory,
    roll,
    clearHistory,
  };
}
