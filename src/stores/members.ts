// Members Store - Basic structure
// Will be implemented in Phase 6
import { defineStore } from "pinia";
import { ref } from "vue";
import type { GuildMember } from "@/types/member";

export const useMembersStore = defineStore("members", () => {
  // State
  const members = ref<GuildMember[]>([]);
  const isLoading = ref(false);

  // Actions (placeholder)
  const generateMembers = async () => {
    isLoading.value = true;
    try {
      // Implementation in Issue 6.3
      console.log("[MEMBERS STORE] Generate members - to be implemented");
    } finally {
      isLoading.value = false;
    }
  };

  return {
    members,
    isLoading,
    generateMembers,
  };
});
