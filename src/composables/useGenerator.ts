// Generator composable
// Will be expanded in future issues
import { ref } from 'vue'

export function useGenerator() {
  const isGenerating = ref(false)
  const generationHistory = ref<any[]>([])

  const generate = async <T>(generator: () => T | Promise<T>): Promise<T> => {
    isGenerating.value = true
    try {
      const result = await generator()
      generationHistory.value.unshift({
        result,
        timestamp: new Date(),
        type: 'generation'
      })
      return result
    } finally {
      isGenerating.value = false
    }
  }

  const clearHistory = () => {
    generationHistory.value = []
  }

  return {
    isGenerating,
    generationHistory,
    generate,
    clearHistory
  }
}
