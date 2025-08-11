/**
 * Composable para integração automática entre Timeline e outros stores
 * Este composable gerencia a comunicação entre o sistema de timeline e contratos
 */

import { onMounted, onUnmounted } from 'vue';
import { useTimelineStore } from '@/stores/timeline';
import { useContractsStore } from '@/stores/contracts';
import type { TimeAdvanceResult } from '@/types/timeline';

/**
 * Hook para integração automática entre timeline e contratos
 * Deve ser usado na raiz da aplicação ou em componentes principais
 */
export function useTimelineIntegration() {
  const timelineStore = useTimelineStore();
  const contractsStore = useContractsStore();

  /**
   * Callback que é chamado quando o tempo avança
   * Integra automaticamente com o sistema de contratos
   */
  const handleTimeAdvance = (result: TimeAdvanceResult) => {
    // Processar mudanças de tempo no sistema de contratos
    contractsStore.processTimeAdvance(result);
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

  const handleTimeAdvance = (result: TimeAdvanceResult) => {
    contractsStore.processTimeAdvance(result);
  };

  return {
    register: () => timelineStore.registerTimeAdvanceCallback(handleTimeAdvance),
    unregister: () => timelineStore.unregisterTimeAdvanceCallback(handleTimeAdvance),
    handleTimeAdvance,
  };
}
