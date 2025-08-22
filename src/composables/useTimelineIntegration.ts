/**
 * Composable para integração automática entre Timeline e outros stores
 * Este composable gerencia a comunicação entre o sistema de timeline e todos os módulos
 */

import { onMounted, onUnmounted } from "vue";
import { useTimelineStore } from "@/stores/timeline";
import { useContractsStore } from "@/stores/contracts";
import { useServicesStore } from "@/stores/services";
// TODO: Descomentar conforme módulos são implementados
// import { useMembersStore } from '@/stores/members';
// import { useNoticesStore } from '@/stores/notices';
// import { useRenownStore } from '@/stores/renown';
import type { TimeAdvanceResult } from "@/types/timeline";

/**
 * Hook para integração automática entre timeline e todos os módulos
 * Deve ser usado na raiz da aplicação ou em componentes principais
 */
export function useTimelineIntegration() {
  const timelineStore = useTimelineStore();
  const contractsStore = useContractsStore();
  const servicesStore = useServicesStore();

  // TODO: Adicionar outros stores conforme implementados
  // const membersStore = useMembersStore();
  // const noticesStore = useNoticesStore();
  // const renownStore = useRenownStore();

  /**
   * Callback que é chamado quando o tempo avança
   * Integra automaticamente com todos os sistemas implementados
   */
  const handleTimeAdvance = (result: TimeAdvanceResult) => {
    // Processar mudanças de tempo no sistema
    contractsStore.processTimeAdvance(result);
    servicesStore.processTimeAdvance?.(result);

    // TODO: Adicionar processamento para outros módulos conforme implementados
    // membersStore.processTimeAdvance?.(result);
    // noticesStore.processTimeAdvance?.(result);
    // renownStore.processTimeAdvance?.(result);
  };

  /**
   * Inicializa a integração
   */
  const initializeIntegration = () => {
    // Registrar callback no timeline
    timelineStore.registerTimeAdvanceCallback(handleTimeAdvance);
  };

  /**
   * Remove a integração
   */
  const cleanupIntegration = () => {
    // Remover callback do timeline
    timelineStore.unregisterTimeAdvanceCallback(handleTimeAdvance);
  };

  // Auto-inicializar quando o composable é usado
  onMounted(() => {
    initializeIntegration();
  });

  // Auto-limpeza quando o componente é desmontado
  onUnmounted(() => {
    cleanupIntegration();
  });

  return {
    initializeIntegration,
    cleanupIntegration,
    handleTimeAdvance,
  };
}

/**
 * Função utilitária para integração manual
 * Use quando quiser controlar manualmente o processo
 */
export function createTimelineIntegration() {
  const timelineStore = useTimelineStore();
  const contractsStore = useContractsStore();
  const servicesStore = useServicesStore();

  // TODO: Adicionar outros stores conforme implementados
  // const membersStore = useMembersStore();
  // const noticesStore = useNoticesStore();
  // const renownStore = useRenownStore();

  const handleTimeAdvance = (result: TimeAdvanceResult) => {
    contractsStore.processTimeAdvance(result);
    servicesStore.processTimeAdvance?.(result);

    // TODO: Adicionar processamento para outros módulos conforme implementados
    // membersStore.processTimeAdvance?.(result);
    // noticesStore.processTimeAdvance?.(result);
    // renownStore.processTimeAdvance?.(result);
  };

  return {
    register: () =>
      timelineStore.registerTimeAdvanceCallback(handleTimeAdvance),
    unregister: () =>
      timelineStore.unregisterTimeAdvanceCallback(handleTimeAdvance),
    handleTimeAdvance,
  };
}
