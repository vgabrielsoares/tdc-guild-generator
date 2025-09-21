/**
 * Composable para integração automática entre Timeline e outros stores
 * Este composable gerencia a comunicação entre o sistema de timeline e todos os módulos
 */

import { onMounted, onUnmounted, getCurrentInstance } from "vue";
import { useTimelineStore } from "@/stores/timeline";
import { useContractsStore } from "@/stores/contracts";
import { useServicesStore } from "@/stores/services";
import { useNoticesStore } from "@/stores/notices";
// TODO: Descomentar conforme módulos são implementados
// import { useMembersStore } from '@/stores/members';
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
  const noticesStore = useNoticesStore();

  // TODO: Adicionar outros stores conforme implementados
  // const membersStore = useMembersStore();
  // const renownStore = useRenownStore();

  /**
   * Callback que é chamado quando o tempo avança
   * Integra automaticamente com todos os sistemas implementados
   */
  const handleTimeAdvance = (result: TimeAdvanceResult) => {
    // Processar mudanças de tempo no sistema
    contractsStore.processTimeAdvance(result);
    servicesStore.processTimeAdvance?.(result);
    noticesStore.processTimeAdvance?.(result);

    // TODO: Adicionar processamento para outros módulos conforme implementados
    // membersStore.processTimeAdvance?.(result);
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

  // Auto-inicializar quando o composable é usado dentro de um setup()
  // Evitar registrar hooks caso o composable seja chamado fora de um
  // contexto de componente (ex: em módulos globais durante inicialização).
  const vm = getCurrentInstance();
  if (vm) {
    onMounted(() => {
      initializeIntegration();
    });

    // Auto-limpeza quando o componente é desmontado
    onUnmounted(() => {
      cleanupIntegration();
    });
  } else {
    // Se não houver instância ativa, não registramos hooks automaticamente.
    // Neste caso, recomendo que o chamador use `createTimelineIntegration()`
    // e chame manualmente `register()` / `unregister()` quando apropriado.
  }

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
  const noticesStore = useNoticesStore();

  // TODO: Adicionar outros stores conforme implementados
  // const membersStore = useMembersStore();
  // const renownStore = useRenownStore();

  const handleTimeAdvance = (result: TimeAdvanceResult) => {
    contractsStore.processTimeAdvance(result);
    servicesStore.processTimeAdvance?.(result);
    noticesStore.processTimeAdvance?.(result);

    // TODO: Adicionar processamento para outros módulos conforme implementados
    // membersStore.processTimeAdvance?.(result);
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
