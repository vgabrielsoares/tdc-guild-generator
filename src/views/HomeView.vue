<template>
  <div class="space-y-8">
    <div
      class="text-center bg-gradient-to-r from-guild-800 to-guild-900 rounded-lg p-8 mb-8"
    >
      <div class="flex items-center justify-center mb-6">
        <img
          src="/guild-logo.svg"
          alt="Logo da Guilda"
          class="w-20 h-20 mr-4"
        />
        <div>
          <h1 class="text-4xl font-medieval font-bold text-gold-400 mb-2">
            A Guilda
          </h1>
          <p class="text-lg text-blue-300 italic">
            "A lâmina que desbrava; a mão que une."
          </p>
        </div>
      </div>
      <p class="text-xl text-gray-300 mb-6 max-w-3xl mx-auto">
        Sistema completo para geração procedural de guildas de aventureiros para
        RPG de mesa. Em um mundo onde a magia pulsa nas veias da realidade, A
        Guilda surgiu da mais pragmática das necessidades: resolver problemas
        que ninguém mais ousa enfrentar.
      </p>

      <!-- Botão das Regras da Guilda -->
      <div class="flex justify-center space-x-4">
        <button
          @click="openRulesModal"
          class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium flex items-center space-x-2"
        >
          <BookOpenIcon class="w-5 h-5" />
          <span>Regras da Guilda</span>
        </button>
        <button
          @click="navigateTo('/guild')"
          class="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors duration-200 font-medium flex items-center space-x-2"
        >
          <HomeIcon class="w-5 h-5" />
          <span>Começar Agora</span>
        </button>
      </div>
    </div>

    <!-- Sobre a Guilda -->
    <div class="bg-gray-800 rounded-lg p-8 border border-gray-700">
      <h2
        class="text-2xl font-semibold text-amber-400 mb-4 flex items-center space-x-2"
      >
        <InformationCircleIcon class="w-6 h-6" />
        <span>O que é a Guilda?</span>
      </h2>
      <div class="text-gray-300 space-y-4">
        <p>
          <strong class="text-white">A Guilda</strong> não é uma família,
          caridade ou governo. É uma ponte entre quem precisa e quem pode
          resolver. Seu papel é garantir que contratos sejam justos, pagamentos
          honrados e riscos calculados.
        </p>
        <p>
          Por trás de cada missão há uma história, uma necessidade: um camponês
          oferecendo suas economias para salvar a filha raptada; um anão
          trocando sua herança por vingança; um mago pagando fortunas por
          conhecimento proibido.
          <strong class="text-amber-400"
            >A Guilda não julga motivos — apenas garante que o acordo seja
            cumprido.</strong
          >
        </p>
        <div
          class="bg-blue-900 bg-opacity-20 rounded-lg p-4 border border-blue-700"
        >
          <h3 class="font-semibold text-blue-300 mb-2">Para Mestres de RPG</h3>
          <p class="text-blue-200 text-sm">
            Este sistema permite criar rapidamente sedes da Guilda com
            características únicas, relações políticas complexas e recursos
            variados. Use os resultados gerados como base para aventuras, mas
            sinta-se livre para adaptar tudo à sua campanha.
          </p>
        </div>
      </div>
    </div>

    <!-- Quick Start Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="feature in features"
        :key="feature.title"
        class="bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition-colors cursor-pointer"
        @click="navigateTo(feature.path)"
      >
        <div
          class="flex items-center justify-center w-12 h-12 bg-amber-600 rounded-lg mb-4"
        >
          <component :is="feature.icon" class="w-6 h-6 text-white" />
        </div>
        <h3 class="text-lg font-semibold text-white mb-2">
          {{ feature.title }}
        </h3>
        <p class="text-gray-400">{{ feature.description }}</p>
      </div>
    </div>

    <!-- Getting Started -->
    <div class="bg-guild-800 rounded-lg p-8">
      <h2 class="text-2xl font-semibold text-white mb-4">Como Começar</h2>
      <div class="space-y-4 text-gray-300">
        <div class="flex items-start space-x-3">
          <span
            class="bg-guild-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5"
            >1</span
          >
          <div>
            <h3 class="font-semibold text-white">Gere sua Guilda</h3>
            <p>
              Comece criando a estrutura básica da sua guilda, incluindo
              tamanho, recursos e relações.
            </p>
          </div>
        </div>
        <div class="flex items-start space-x-3">
          <span
            class="bg-guild-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5"
            >2</span
          >
          <div>
            <h3 class="font-semibold text-white">
              Explore Contratos e Serviços
            </h3>
            <p>
              Descubra os contratos disponíveis e serviços que sua guilda pode
              oferecer.
            </p>
          </div>
        </div>
        <div class="flex items-start space-x-3">
          <span
            class="bg-guild-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mt-0.5"
            >3</span
          >
          <div>
            <h3 class="font-semibold text-white">Gerencie Membros e Renome</h3>
            <p>
              Contrate aventureiros e acompanhe a progressão do seu renome na
              guilda.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal das Regras da Guilda -->
    <HelpModal
      :is-open="showRulesModal"
      help-key="guild-rules"
      @close="showRulesModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import {
  HomeIcon,
  DocumentTextIcon,
  WrenchScrewdriverIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  TrophyIcon,
  BookOpenIcon,
  InformationCircleIcon,
} from "@heroicons/vue/24/solid";
import HelpModal from "@/components/common/HelpModal.vue";

const router = useRouter();
const showRulesModal = ref(false);

const features = [
  {
    title: "Estrutura da Guilda",
    description:
      "Gere a sede, recursos, relações e funcionários da sua guilda.",
    icon: HomeIcon,
    path: "/guild",
  },
  {
    title: "Contratos",
    description: "Contratos disponíveis com valores dinâmicos e modificadores.",
    icon: DocumentTextIcon,
    path: "/contracts",
  },
  {
    title: "Serviços",
    description: "Serviços especializados com pagamentos alternativos.",
    icon: WrenchScrewdriverIcon,
    path: "/services",
  },
  {
    title: "Membros",
    description: "Contrate aventureiros de diferentes níveis e especialidades.",
    icon: UserGroupIcon,
    path: "/members",
  },
  {
    title: "Mural de Avisos",
    description: "Avisos, execuções, procurados e oportunidades comerciais.",
    icon: ClipboardDocumentListIcon,
    path: "/notices",
  },
  {
    title: "Sistema de Renome",
    description: "Acompanhe sua progressão e benefícios na guilda.",
    icon: TrophyIcon,
    path: "/renown",
  },
];

const navigateTo = (path: string) => {
  router.push(path);
};

const openRulesModal = () => {
  showRulesModal.value = true;
};
</script>
