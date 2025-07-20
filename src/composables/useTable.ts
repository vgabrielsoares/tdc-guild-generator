// Table composable
// Will be expanded in Issue 2.2
import { ref } from 'vue'
import { rollOnTable } from '@/utils/tableRoller'
import type { TableEntry, TableResult } from '@/types/tables'

export function useTable<T>() {
  const isRolling = ref(false)
  const lastResult = ref<TableResult<T> | null>(null)

  const rollOn = async (table: TableEntry<T>[], modifier = 0) => {
    isRolling.value = true
    try {
      // Add small delay for visual effect
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const result = rollOnTable(table, modifier)
      lastResult.value = result
      
      return result
    } finally {
      isRolling.value = false
    }
  }

  const clearResult = () => {
    lastResult.value = null
  }

  return {
    isRolling,
    lastResult,
    rollOn,
    clearResult
  }
}
