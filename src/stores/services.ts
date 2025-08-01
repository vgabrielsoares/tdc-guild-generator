// Services Store - Basic structure
// Will be implemented in Phase 5
import { defineStore } from "pinia";
import { ref } from "vue";
import type { Service } from "@/types/service";

export const useServicesStore = defineStore("services", () => {
  // State
  const services = ref<Service[]>([]);
  const isLoading = ref(false);

  // Actions (placeholder)
  const generateServices = async () => {
    isLoading.value = true;
    try {
      // Implementation in Issue 5.3
      console.log("[SERVICES STORE] Generate services - to be implemented");
    } finally {
      isLoading.value = false;
    }
  };

  return {
    services,
    isLoading,
    generateServices,
  };
});
