<template>
  <button
    @click="openModal"
    :class="[
      'inline-flex items-center justify-center w-5 h-5 text-gray-400 hover:text-blue-400 transition-colors duration-200',
      'rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500',
      buttonClass,
    ]"
    :title="tooltip"
    type="button"
  >
    <InformationCircleIcon class="w-4 h-4" />
  </button>
</template>

<script setup lang="ts">
import { InformationCircleIcon } from "@heroicons/vue/24/outline";

interface Props {
  helpKey: string;
  tooltip?: string;
  buttonClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  tooltip: "Mais informações",
  buttonClass: "",
});

const emit = defineEmits<{
  "open-help": [helpKey: string];
}>();

function openModal() {
  emit("open-help", props.helpKey);
}
</script>
