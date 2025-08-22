<template>
  <div class="space-y-8">
    <div class="text-center">
      <h1
        class="text-3xl font-medieval font-bold text-gold-400 mb-4 flex items-center justify-center gap-3"
      >
        <HomeIcon class="w-7 h-7 text-gold-400" />
        Estrutura da Guilda
        <Tooltip
          content="Sistema completo de geração de sedes da Guilda com estrutura, relações e recursos dinâmicos."
          title="Gerador de Guildas"
          position="auto"
        >
          <InfoButton
            help-key="guild-overview"
            @open-help="openHelpModal"
            button-class="ml-2"
          />
        </Tooltip>
      </h1>
      <p class="text-lg text-gray-300 mb-4">
        Gere e visualize a estrutura completa da sua guilda.
      </p>
    </div>

    <!-- Guilda Atual e Geração -->
    <GuildDisplay @open-help="openHelpModal" />

    <!-- Histórico de Guildas -->
    <GuildHistory />

    <!-- Modal de Ajuda Global -->
    <HelpModal
      :is-open="showHelpModal"
      :help-key="currentHelpKey"
      @close="closeHelpModal"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { HomeIcon } from "@heroicons/vue/24/outline";
import GuildDisplay from "@/components/guild/GuildDisplay.vue";
import GuildHistory from "@/components/guild/GuildHistory.vue";
import Tooltip from "@/components/common/Tooltip.vue";
import InfoButton from "@/components/common/InfoButton.vue";
import HelpModal from "@/components/common/HelpModal.vue";

// Sistema de Ajuda
const showHelpModal = ref(false);
const currentHelpKey = ref<string>("");

const openHelpModal = (helpKey: string) => {
  currentHelpKey.value = helpKey;
  showHelpModal.value = true;
};

const closeHelpModal = () => {
  showHelpModal.value = false;
  currentHelpKey.value = "";
};
</script>
