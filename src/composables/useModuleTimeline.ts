/**
 * Composables para configuração do ModuleTimeline
 * Facilita a criação de configurações padronizadas para diferentes módulos
 */

import type {
  ModuleTimelineConfig,
  ModuleTimelineStat,
  ModuleTimelineItem,
} from "@/components/timeline/ModuleTimeline.vue";
import { ScheduledEventType } from "@/types/timeline";
import type { Contract } from "@/types/contract";
import type { Service } from "@/types/service";

/**
 * Configuração para Timeline de Contratos
 */
export function useContractTimelineConfig() {
  const createConfig = (stats: ModuleTimelineStat[]): ModuleTimelineConfig => ({
    displayName: "Contratos",
    helpKey: "contract-lifecycle",
    tooltipTitle: "Ciclo de Vida dos Contratos",
    tooltipContent:
      "Sistema de evolução temporal dos contratos: resolução automática, competição com NPCs e mudanças de status.",
    stats,
    eventTypes: [
      ScheduledEventType.NEW_CONTRACTS,
      ScheduledEventType.CONTRACT_RESOLUTION,
      ScheduledEventType.CONTRACT_EXPIRATION,
    ],
  });

  return { createConfig };
}

/**
 * Configuração para Timeline de Serviços
 */
export function useServiceTimelineConfig() {
  const createConfig = (stats: ModuleTimelineStat[]): ModuleTimelineConfig => ({
    displayName: "Serviços",
    helpKey: "service-lifecycle",
    tooltipTitle: "Ciclo de Vida dos Serviços",
    tooltipContent:
      "Sistema de evolução temporal dos serviços: resolução automática, competição com NPCs e mudanças de status.",
    stats,
    eventTypes: [
      ScheduledEventType.NEW_SERVICES,
      ScheduledEventType.SERVICE_RESOLUTION,
    ],
  });

  return { createConfig };
}

/**
 * Configuração para Timeline de Avisos
 */
export function useNoticeTimelineConfig() {
  const createConfig = (stats: ModuleTimelineStat[]): ModuleTimelineConfig => ({
    displayName: "Avisos",
    helpKey: "notice-lifecycle",
    tooltipTitle: "Ciclo de Vida dos Avisos",
    tooltipContent:
      "Sistema de evolução temporal dos avisos: expiração automática e atualizações do mural.",
    stats,
    eventTypes: [
      ScheduledEventType.NEW_NOTICES,
      ScheduledEventType.NOTICE_EXPIRATION,
    ],
  });

  return { createConfig };
}

/**
 * Configuração para Timeline de Membros
 */
export function useMemberTimelineConfig() {
  const createConfig = (stats: ModuleTimelineStat[]): ModuleTimelineConfig => ({
    displayName: "Membros",
    helpKey: "member-lifecycle",
    tooltipTitle: "Registro de Membros",
    tooltipContent: "Sistema de atualização do registro de membros da guilda.",
    stats,
    eventTypes: [ScheduledEventType.MEMBER_REGISTRY_UPDATE],
  });

  return { createConfig };
}

/**
 * Configuração para Timeline de Renome
 */
export function useRenownTimelineConfig() {
  const createConfig = (stats: ModuleTimelineStat[]): ModuleTimelineConfig => ({
    displayName: "Renome",
    helpKey: "renown-lifecycle",
    tooltipTitle: "Sistema de Renome",
    tooltipContent:
      "Sistema de autorização de renome e disponibilidade de recursos.",
    stats,
    eventTypes: [
      ScheduledEventType.RENOWN_AUTHORIZATION,
      ScheduledEventType.RESOURCE_AVAILABILITY,
    ],
  });

  return { createConfig };
}

/**
 * Utilitários para conversão de dados específicos para o formato genérico
 */

/**
 * Converte contrato para formato genérico
 */
export function contractToTimelineItem(contract: Contract): ModuleTimelineItem {
  return {
    id: contract.id,
    title: contract.contractorType || "Contratante não definido",
    description: contract.objective?.description || "Objetivo não definido",
    deadlineDate: contract.deadlineDate,
    value: contract.value ? `${contract.value.finalGoldReward} PO$` : undefined,
  };
}

/**
 * Converte serviço para formato genérico
 */
export function serviceToTimelineItem(service: Service): ModuleTimelineItem {
  return {
    id: service.id,
    title: service.contractorType || "Contratante não definido",
    description: service.description || "Descrição não definida",
    deadlineDate: service.deadlineDate,
    value: service.value
      ? `${service.value.rewardAmount} ${service.value.currency}`
      : undefined,
  };
}

/**
 * Hook para criar estatísticas padrão
 */
export function useStandardStats() {
  const createStats = (
    available: number,
    inProgress: number,
    expiring: number,
    completed: number
  ): ModuleTimelineStat[] => [
    {
      key: "available",
      label: "Disponíveis",
      value: available,
    },
    {
      key: "inProgress",
      label: "Em Andamento",
      value: inProgress,
    },
    {
      key: "expiring",
      label: "Expirando Em Breve",
      value: expiring,
    },
    {
      key: "completed",
      label: "Concluídos",
      value: completed,
    },
  ];

  return { createStats };
}
