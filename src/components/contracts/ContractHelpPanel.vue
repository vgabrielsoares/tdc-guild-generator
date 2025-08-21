<template>
  <div
    v-if="isOpen"
    class="bg-gray-900 border border-gray-600 rounded-lg mb-4 flex flex-col max-h-[50vh] sm:max-h-[60vh] lg:max-h-[70vh]"
  >
    <!-- Header fixo -->
    <div
      class="flex items-center justify-between p-4 border-b border-gray-600 flex-shrink-0"
    >
      <h4
        class="text-lg font-semibold text-amber-400 flex items-center space-x-2"
      >
        <InformationCircleIcon class="w-5 h-5" />
        <span>{{ helpData?.title || "Ajuda" }}</span>
      </h4>
      <button
        @click="$emit('close')"
        class="text-gray-400 hover:text-white transition-colors duration-200 p-1 rounded focus:outline-none"
      >
        <XMarkIcon class="w-4 h-4" />
      </button>
    </div>

    <!-- Conteúdo com scroll -->
    <div
      v-if="helpData"
      class="flex-1 overflow-y-auto p-4 sm:p-4 space-y-3 custom-scrollbar"
    >
      <!-- Descrição principal -->
      <div
        v-if="helpData.description"
        class="text-gray-300 text-sm leading-relaxed"
      >
        {{ helpData.description }}
      </div>

      <!-- Seções de explicação -->
      <div v-if="helpData.sections" class="space-y-3">
        <div
          v-for="section in helpData.sections"
          :key="section.title"
          class="bg-gray-800 rounded-lg p-3"
        >
          <h5
            class="font-medium text-amber-300 mb-2 flex items-center space-x-2"
          >
            <DocumentTextIcon class="w-4 h-4 flex-shrink-0" />
            <span class="break-words">{{ section.title }}</span>
          </h5>
          <ul class="space-y-1">
            <li
              v-for="(item, index) in section.content"
              :key="index"
              class="text-gray-300 text-sm leading-relaxed break-words"
            >
              {{ item }}
            </li>
          </ul>
        </div>
      </div>

      <!-- Dicas para mestres -->
      <div
        v-if="helpData.tips && helpData.tips.length > 0"
        class="bg-blue-900/30 rounded-lg p-3"
      >
        <h5 class="font-medium text-blue-300 mb-2 flex items-center space-x-2">
          <LightBulbIcon class="w-4 h-4 flex-shrink-0" />
          <span>Dicas para Mestres</span>
        </h5>
        <ul class="space-y-1">
          <li
            v-for="tip in helpData.tips"
            :key="tip"
            class="text-blue-200 text-sm leading-relaxed flex items-start space-x-2"
          >
            <span class="text-blue-400 mt-1 flex-shrink-0">•</span>
            <span class="break-words">{{ tip }}</span>
          </li>
        </ul>
      </div>

      <!-- Exemplos -->
      <div
        v-if="helpData.examples && helpData.examples.length > 0"
        class="space-y-2"
      >
        <h5 class="font-medium text-green-300 flex items-center space-x-2">
          <DocumentTextIcon class="w-4 h-4 flex-shrink-0" />
          <span>Exemplos</span>
        </h5>
        <div
          v-for="example in helpData.examples"
          :key="example.title"
          class="bg-green-900/20 rounded-lg p-3"
        >
          <h6 class="font-medium text-green-200 mb-1 break-words">
            {{ example.title }}
          </h6>
          <p class="text-green-100 text-sm leading-relaxed break-words">
            {{ example.description }}
          </p>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-else class="flex items-center justify-center py-8 px-4">
      <div
        class="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-400"
      ></div>
      <span class="ml-2 text-gray-300 text-sm">Carregando...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import {
  XMarkIcon,
  InformationCircleIcon,
  LightBulbIcon,
  DocumentTextIcon,
} from "@heroicons/vue/24/outline";
import { guildHelpData } from "@/data/help/guild-help";
import { contractHelpData } from "@/data/help/contract-help";
import { serviceHelpData } from "@/data/help/service-help";

interface HelpSection {
  title: string;
  content: string[];
}

interface HelpExample {
  title: string;
  description: string;
}

interface HelpData {
  title: string;
  description?: string;
  sections?: HelpSection[];
  tips?: string[];
  examples?: HelpExample[];
}

interface Props {
  isOpen: boolean;
  helpKey?: string;
}

const props = defineProps<Props>();

defineEmits<{
  close: [];
}>();

const helpData = ref<HelpData | null>(null);

// Carregar dados de ajuda baseado na helpKey
watch(
  () => [props.helpKey, props.isOpen] as const,
  async ([newKey, isOpen]) => {
    if (newKey && isOpen) {
      helpData.value = null;

      // Pequeno delay para simular carregamento
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Carregar dados reais da ajuda (contratos -> guildas -> serviços)
      if (newKey in contractHelpData) {
        helpData.value = contractHelpData[newKey];
      } else if (newKey in guildHelpData) {
        helpData.value = guildHelpData[newKey];
      } else if (newKey in serviceHelpData) {
        helpData.value = serviceHelpData[newKey];
      } else {
        // Fallback para chaves não encontradas
        helpData.value = {
          title: "Ajuda não encontrada",
          description: `Desculpe, não foi possível encontrar informações de ajuda para "${newKey}".`,
          tips: [
            "Verifique se a funcionalidade está implementada ou contate o suporte.",
          ],
        };
      }
    }
  },
  { immediate: true }
);
</script>

<style scoped>
.custom-scrollbar {
  /* Webkit Browsers (Chrome, Safari, Edge) */
  scrollbar-width: thin;
  scrollbar-color: rgb(75, 85, 99) rgb(31, 41, 55);
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgb(31, 41, 55);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgb(75, 85, 99);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgb(107, 114, 128);
}

/* Transição suave para o painel */
.v-enter-active,
.v-leave-active {
  transition: all 0.3s ease-in-out;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .custom-scrollbar {
    scrollbar-width: auto;
  }

  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
}

/* Melhorar touch scrolling em dispositivos móveis */
@media (max-width: 768px) {
  .custom-scrollbar {
    -webkit-overflow-scrolling: touch;
  }
}

/* Reduzir padding em telas muito pequenas */
@media (max-width: 480px) {
  .custom-scrollbar {
    padding: 0.75rem;
  }
}
</style>
