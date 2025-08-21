<template>
  <Teleport to="body">
    <Transition enter-active-class="transition-opacity duration-300"
      leave-active-class="transition-opacity duration-300" enter-from-class="opacity-0" leave-to-class="opacity-0">
      <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-75"
        @click="closeModal">
        <Transition enter-active-class="transition-all duration-300" leave-active-class="transition-all duration-300"
          enter-from-class="opacity-0 transform scale-95" leave-to-class="opacity-0 transform scale-95">
          <div v-if="isOpen" @click.stop
            class="relative bg-gray-800 rounded-lg shadow-xl border border-gray-600 max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-600">
              <h3 class="text-xl font-semibold text-amber-400 flex items-center space-x-2">
                <InformationCircleIcon class="w-6 h-6" />
                <span>{{ helpData?.title || 'Ajuda' }}</span>
              </h3>
              <button @click="closeModal"
                class="text-gray-400 hover:text-white transition-colors duration-200 p-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                <XMarkIcon class="w-6 h-6" />
              </button>
            </div>

            <!-- Content -->
            <div class="p-6 overflow-y-auto max-h-96">
              <div v-if="helpData">
                <!-- Descrição principal -->
                <div v-if="helpData.description" class="text-gray-300 mb-4">
                  {{ helpData.description }}
                </div>

                <!-- Seções de explicação -->
                <div v-if="helpData.sections" class="space-y-4">
                  <div v-for="section in helpData.sections" :key="section.title"
                    class="border-l-4 border-blue-500 pl-4">
                    <h4 class="font-semibold text-blue-400 mb-2">{{ section.title }}</h4>
                    <div class="text-gray-300 text-sm space-y-2">
                      <p v-for="paragraph in section.content" :key="paragraph">
                        {{ paragraph }}
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Dicas -->
                <div v-if="helpData.tips"
                  class="mt-6 bg-amber-900 bg-opacity-20 rounded-lg p-4 border border-amber-700">
                  <h4 class="font-semibold text-amber-400 mb-2 flex items-center space-x-2">
                    <LightBulbIcon class="w-5 h-5" />
                    <span>Dicas para Mestres</span>
                  </h4>
                  <ul class="text-amber-200 text-sm space-y-1">
                    <li v-for="tip in helpData.tips" :key="tip" class="flex items-start space-x-2">
                      <span class="text-amber-400 mt-1">•</span>
                      <span>{{ tip }}</span>
                    </li>
                  </ul>
                </div>

                <!-- Exemplos -->
                <div v-if="helpData.examples"
                  class="mt-6 bg-green-900 bg-opacity-20 rounded-lg p-4 border border-green-700">
                  <h4 class="font-semibold text-green-400 mb-2 flex items-center space-x-2">
                    <DocumentTextIcon class="w-5 h-5" />
                    <span>Exemplos</span>
                  </h4>
                  <div class="text-green-200 text-sm space-y-2">
                    <div v-for="example in helpData.examples" :key="example.title">
                      <div class="font-medium text-green-300">{{ example.title }}</div>
                      <div class="text-green-200">{{ example.description }}</div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Loading state -->
              <div v-else class="flex items-center justify-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                <span class="ml-2 text-gray-300">Carregando...</span>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex justify-end p-6 border-t border-gray-600">
              <button @click="closeModal"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                Entendi
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  XMarkIcon,
  InformationCircleIcon,
  LightBulbIcon,
  DocumentTextIcon
} from '@heroicons/vue/24/outline'
import { guildHelpData } from '@/data/help/guild-help'
import { contractHelpData } from '@/data/help/contract-help'
import { serviceHelpData } from '@/data/help/service-help'

interface HelpSection {
  title: string
  content: string[]
}

interface HelpExample {
  title: string
  description: string
}

interface HelpData {
  title: string
  description?: string
  sections?: HelpSection[]
  tips?: string[]
  examples?: HelpExample[]
}

interface Props {
  isOpen: boolean
  helpKey?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'close': []
}>()

const helpData = ref<HelpData | null>(null)

// Carregar dados de ajuda baseado na helpKey
watch(() => [props.helpKey, props.isOpen] as const, async ([newKey, isOpen]) => {
  if (newKey && isOpen) {
    helpData.value = null

    // Pequeno delay para simular carregamento
    await new Promise(resolve => setTimeout(resolve, 150))

    // Carregar dados reais da ajuda (primeiro tentar contratos, depois serviços, depois guildas)
    if (newKey in contractHelpData) {
      helpData.value = contractHelpData[newKey]
    } else if (newKey in serviceHelpData) {
      helpData.value = serviceHelpData[newKey]
    } else if (newKey in guildHelpData) {
      helpData.value = guildHelpData[newKey]
    } else {
      // Fallback para chaves não encontradas
      helpData.value = {
        title: 'Ajuda não encontrada',
        description: `Desculpe, não foi possível encontrar informações de ajuda para "${newKey}".`,
        tips: ['Verifique se a funcionalidade está implementada ou contate o suporte.']
      }
    }
  }
}, { immediate: true })

function closeModal() {
  emit('close')
}

// Fechar com ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && props.isOpen) {
    closeModal()
  }
})
</script>
