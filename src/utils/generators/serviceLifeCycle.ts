import { rollDice, rollOnTable } from "../dice";
import {
  convertTimeStringToDays,
  selectByCriteria,
  selectRandomItems,
} from "../lifecycle-utils";
import { createGameDate } from "../date-utils";
import type { Service } from "../../types/service";
import {
  ServiceStatus,
  ServiceResolution,
  ServiceFailureReason,
  ServiceUnsignedResolution,
  calculateFinalServiceReward,
  applyRecurrenceBonus,
} from "../../types/service";
import {
  SERVICE_SIGNED_RESOLUTION_TIME_TABLE,
  SERVICE_UNSIGNED_RESOLUTION_TIME_TABLE,
  NEW_SERVICES_TIME_TABLE,
} from "../../data/tables/service-base-tables";
import {
  SERVICE_SIGNED_RESOLUTION_TABLE,
  SERVICE_UNSIGNED_RESOLUTION_TABLE,
  SERVICE_FAILURE_REASONS_TABLE,
  mapServiceActionToResult,
  shouldCancelService,
  shouldGetServiceRecurrenceBonus,
} from "../../data/tables/service-resolution-tables";

// ===== TIPOS ESPECÍFICOS PARA CICLO DE VIDA DOS SERVIÇOS =====

export interface ServiceResolutionTime {
  signed: number; // dias para resolução de serviços assinados
  unsigned: number; // dias para resolução de serviços não assinados
}

export interface NewServicesTime {
  days: number; // dias até novos serviços aparecerem
}

// ===== FUNÇÕES DE ROLAGEM DE TEMPO =====

/**
 * Rola tempo de resolução para serviços assinados
 * Baseado na tabela "Tempo de Resolução - Serviços Firmados"
 */
export function rollServiceSignedResolutionTime(): number {
  const result = rollOnTable({
    table: SERVICE_SIGNED_RESOLUTION_TIME_TABLE,
    context: "Tempo de resolução - serviços assinados",
  });
  return convertTimeStringToDays(result.result.time);
}

/**
 * Rola tempo de resolução para serviços não assinados
 * Baseado na tabela "Tempo de Resolução - Serviços Não-Assinados"
 */
export function rollServiceUnsignedResolutionTime(): number {
  const result = rollOnTable({
    table: SERVICE_UNSIGNED_RESOLUTION_TIME_TABLE,
    context: "Tempo de resolução - serviços não assinados",
  });
  return convertTimeStringToDays(result.result.time);
}

/**
 * Rola tempo até novos serviços aparecerem
 * Baseado na tabela "Novos Serviços Em"
 */
export function rollNewServicesTime(): number {
  const result = rollOnTable({
    table: NEW_SERVICES_TIME_TABLE,
    context: "Tempo até novos serviços",
  });
  return convertTimeStringToDays(result.result.time);
}

/**
 * Gera tempos de resolução para uma guilda
 * Função de conveniência para obter ambos os tempos
 */
export function generateServiceResolutionTimes(): ServiceResolutionTime {
  return {
    signed: rollServiceSignedResolutionTime(),
    unsigned: rollServiceUnsignedResolutionTime(),
  };
}

// ===== FUNÇÕES DE RESOLUÇÃO =====

/**
 * Rola resolução para serviços assinados
 * Baseado na tabela "Resoluções para Serviços Firmados"
 */
export function rollServiceSignedResolution(): {
  result: ServiceResolution;
  reason?: ServiceFailureReason;
} {
  const resolution = rollOnTable({
    table: SERVICE_SIGNED_RESOLUTION_TABLE,
    context: "Resolução de serviços assinados",
  });

  const response: {
    result: ServiceResolution;
    reason?: ServiceFailureReason;
  } = {
    result: resolution.result as ServiceResolution,
  };

  // Se não foi resolvido, rolar motivo
  if (resolution.result === ServiceResolution.NAO_RESOLVIDO) {
    const reasonResult = rollOnTable({
      table: SERVICE_FAILURE_REASONS_TABLE,
      context: "Motivo para não resolução de serviço",
    });
    response.reason = reasonResult.result as ServiceFailureReason;
  }

  return response;
}

/**
 * Rola resolução para serviços não assinados
 * Baseado na tabela "Resolução para Serviços que Não Foram Assinados"
 */
export function rollServiceUnsignedResolution(): {
  type: ServiceUnsignedResolution;
  count?: number;
} {
  const resolution = rollOnTable({
    table: SERVICE_UNSIGNED_RESOLUTION_TABLE,
    context: "Resolução de serviços não assinados",
  });

  // Capturar o resultado como objeto
  const result = resolution.result as {
    description: string;
    action: string;
  };

  const response: {
    type: ServiceUnsignedResolution;
    count?: number;
  } = {
    type: mapServiceActionToResult(result.action),
  };

  // Calcular count se necessário baseado na ação
  switch (result.action) {
    case "resolve_random_1d4":
      response.count = rollDice({ notation: "1d4" }).result;
      break;
    case "resolve_1d4plus1":
      response.count = rollDice({ notation: "1d4+1" }).result;
      break;
    case "resolve_1d4plus2":
      response.count = rollDice({ notation: "1d4+2" }).result;
      break;
    case "sign_but_not_resolve_1d4":
      response.count = rollDice({ notation: "1d4" }).result;
      break;
    // Para outras ações que não precisam de count, não definir
  }

  return response;
}

// ===== FUNÇÕES DE APLICAÇÃO DE RESOLUÇÕES =====

/**
 * Aplicar resolução automática a serviços assinados
 * Baseado na tabela "Resoluções para Serviços Firmados"
 */
export function applyServiceSignedResolution(services: Service[]): Service[] {
  const signedServices = services.filter(
    (service) => service.status === ServiceStatus.ACEITO_POR_OUTROS
  );

  return services.map((service) => {
    if (!signedServices.includes(service)) {
      return service;
    }

    const resolution = rollServiceSignedResolution();

    switch (resolution.result) {
      case ServiceResolution.RESOLVIDO:
        return {
          ...service,
          status: ServiceStatus.RESOLVIDO_POR_OUTROS,
          completedAt: createGameDate(1, 1, 2024), // TODO: usar data atual do jogo
        };

      case ServiceResolution.RESOLVIDO_COM_RESSALVAS:
        return {
          ...service,
          status: ServiceStatus.RESOLVIDO_POR_OUTROS,
          completedAt: createGameDate(1, 1, 2024), // TODO: usar data atual do jogo
          // Poderia adicionar flag para ressalvas
        };

      case ServiceResolution.NAO_RESOLVIDO:
        if (resolution.reason && shouldCancelService(resolution.reason)) {
          // Anular serviço - "Serviços anulados não voltam a ficar disponíveis"
          return {
            ...service,
            status: ServiceStatus.ANULADO,
            canceledAt: createGameDate(1, 1, 2024), // TODO: usar data atual do jogo
            cancelReason: resolution.reason,
          };
        } else {
          // Volta a ficar disponível e ganha taxa de recorrência
          const updatedService = {
            ...service,
            status: ServiceStatus.DISPONIVEL,
          };

          // Aplicar taxa de recorrência se aplicável
          if (
            shouldGetServiceRecurrenceBonus(
              resolution.result,
              resolution.reason
            )
          ) {
            return applyRecurrenceBonus(updatedService);
          }

          return updatedService;
        }

      case ServiceResolution.AINDA_NAO_SE_SABE:
        // Mantém status atual para próxima resolução
        return service;

      default:
        return service;
    }
  });
}

/**
 * Aplicar resolução automática a serviços não assinados
 * Baseado na tabela "Resolução para Serviços que Não Foram Assinados"
 */
export function applyServiceUnsignedResolution(services: Service[]): Service[] {
  const unsignedServices = services.filter(
    (service) => service.status === ServiceStatus.DISPONIVEL
  );

  if (unsignedServices.length === 0) {
    return services;
  }

  const resolution = rollServiceUnsignedResolution();

  switch (resolution.type) {
    case ServiceUnsignedResolution.TODOS_CONTINUAM:
      // Nenhuma mudança
      return services;

    case ServiceUnsignedResolution.TODOS_RESOLVIDOS:
      return services.map((service) =>
        unsignedServices.includes(service)
          ? {
              ...service,
              status: ServiceStatus.RESOLVIDO_POR_OUTROS,
              completedAt: createGameDate(1, 1, 2024), // TODO: usar data atual do jogo
            }
          : service
      );

    case ServiceUnsignedResolution.MENORES_RECOMPENSAS_RESOLVIDOS: {
      // Ordenar por recompensa e pegar os menores
      const toResolve = selectByCriteria(
        unsignedServices,
        (service) => calculateFinalServiceReward(service),
        "lowest"
      );

      return services.map((service) =>
        toResolve.includes(service)
          ? {
              ...service,
              status: ServiceStatus.RESOLVIDO_POR_OUTROS,
              completedAt: createGameDate(1, 1, 2024), // TODO: usar data atual do jogo
            }
          : service
      );
    }

    case ServiceUnsignedResolution.MELHORES_RECOMPENSAS_RESOLVIDOS: {
      // Ordenar por recompensa e pegar os melhores
      const toResolve = selectByCriteria(
        unsignedServices,
        (service) => calculateFinalServiceReward(service),
        "highest"
      );

      return services.map((service) =>
        toResolve.includes(service)
          ? {
              ...service,
              status: ServiceStatus.RESOLVIDO_POR_OUTROS,
              completedAt: createGameDate(1, 1, 2024), // TODO: usar data atual do jogo
            }
          : service
      );
    }

    case ServiceUnsignedResolution.ALEATORIOS_RESOLVIDOS: {
      const count = resolution.count || 1;
      const toResolve = selectRandomItems(unsignedServices, count);

      return services.map((service) =>
        toResolve.includes(service)
          ? {
              ...service,
              status: ServiceStatus.RESOLVIDO_POR_OUTROS,
              completedAt: createGameDate(1, 1, 2024), // TODO: usar data atual do jogo
            }
          : service
      );
    }

    case ServiceUnsignedResolution.ASSINADOS_NAO_RESOLVIDOS: {
      const count = resolution.count || 1;
      const toSign = selectRandomItems(unsignedServices, count);

      return services.map((service) => {
        if (!toSign.includes(service)) {
          return service;
        }

        // Assinar mas não resolver (rolar motivo de falha)
        const reasonResult = rollOnTable({
          table: SERVICE_FAILURE_REASONS_TABLE,
          context: "Motivo para não resolução de serviço assinado",
        });
        const reason = reasonResult.result as ServiceFailureReason;

        if (shouldCancelService(reason)) {
          // Anular serviço
          return {
            ...service,
            status: ServiceStatus.ANULADO,
            canceledAt: createGameDate(1, 1, 2024), // TODO: usar data atual do jogo
            cancelReason: reason,
          };
        } else {
          // Volta a ficar disponível com taxa de recorrência
          const updatedService = {
            ...service,
            status: ServiceStatus.DISPONIVEL,
          };
          return applyRecurrenceBonus(updatedService);
        }
      });
    }

    case ServiceUnsignedResolution.MOTIVO_ESTRANHO:
      // Nenhuma mudança, mas poderia adicionar flag especial
      return services;

    default:
      return services;
  }
}

/**
 * Aumenta recompensa de serviços não resolvidos com taxa de recorrência
 * "Sempre que um serviço não for resolvido mas permanecer disponível,
 *  consulte a tabela de 'Taxa de recorrência'"
 */
export function increaseUnresolvedServiceRewards(
  services: Service[]
): Service[] {
  return services.map((service) => {
    // Aplicar apenas aos serviços que não foram resolvidos mas continuam disponíveis
    if (
      service.status === ServiceStatus.DISPONIVEL &&
      service.value.recurrenceBonusAmount > 0
    ) {
      return applyRecurrenceBonus(service);
    }
    return service;
  });
}

// ===== SISTEMA COMPLETO DE GERENCIAMENTO =====

/**
 * Interface para estado persistente do gerenciador de serviços
 */
export interface ServiceLifecycleState {
  nextSignedResolution: Date | null;
  nextUnsignedResolution: Date | null;
  nextNewServices: Date | null;
  lastSignedResolution: Date | null;
  lastUnsignedResolution: Date | null;
  lastNewServices: Date | null;
}

/**
 * Sistema completo de ciclo de vida de serviços
 * Gerencia todos os aspectos temporais dos serviços
 */
export class ServiceLifecycleManager {
  private state: ServiceLifecycleState;

  constructor(initialState?: Partial<ServiceLifecycleState>) {
    this.state = {
      nextSignedResolution: null,
      nextUnsignedResolution: null,
      nextNewServices: null,
      lastSignedResolution: null,
      lastUnsignedResolution: null,
      lastNewServices: null,
      ...initialState,
    };
  }

  /**
   * Obtém o estado atual do gerenciador
   */
  getState(): ServiceLifecycleState {
    return { ...this.state };
  }

  /**
   * Atualiza o estado do gerenciador
   */
  updateState(newState: Partial<ServiceLifecycleState>): void {
    this.state = { ...this.state, ...newState };
  }

  /**
   * Agenda próximas resoluções baseado na data atual
   */
  scheduleNextResolutions(currentDate: Date): void {
    const signedTime = rollServiceSignedResolutionTime();
    const unsignedTime = rollServiceUnsignedResolutionTime();
    const newServicesTime = rollNewServicesTime();

    const addDays = (date: Date, days: number) => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    };

    this.state.nextSignedResolution = addDays(currentDate, signedTime);
    this.state.nextUnsignedResolution = addDays(currentDate, unsignedTime);
    this.state.nextNewServices = addDays(currentDate, newServicesTime);
  }

  /**
   * Verifica quais eventos devem ser processados na data atual
   */
  getEventsToProcess(currentDate: Date): {
    shouldProcessSignedResolution: boolean;
    shouldProcessUnsignedResolution: boolean;
    shouldGenerateNewServices: boolean;
  } {
    return {
      shouldProcessSignedResolution:
        this.state.nextSignedResolution !== null &&
        this.state.nextSignedResolution <= currentDate,
      shouldProcessUnsignedResolution:
        this.state.nextUnsignedResolution !== null &&
        this.state.nextUnsignedResolution <= currentDate,
      shouldGenerateNewServices:
        this.state.nextNewServices !== null &&
        this.state.nextNewServices <= currentDate,
    };
  }

  /**
   * Processa todos os eventos pendentes
   */
  processEvents(
    services: Service[],
    currentDate: Date
  ): {
    updatedServices: Service[];
    processedEvents: string[];
  } {
    let updatedServices = [...services];
    const processedEvents: string[] = [];

    const events = this.getEventsToProcess(currentDate);

    if (events.shouldProcessSignedResolution) {
      updatedServices = applyServiceSignedResolution(updatedServices);
      this.state.lastSignedResolution = currentDate;
      this.state.nextSignedResolution = null;
      processedEvents.push("signed_resolution");
    }

    if (events.shouldProcessUnsignedResolution) {
      updatedServices = applyServiceUnsignedResolution(updatedServices);
      this.state.lastUnsignedResolution = currentDate;
      this.state.nextUnsignedResolution = null;
      processedEvents.push("unsigned_resolution");
    }

    if (events.shouldGenerateNewServices) {
      this.state.lastNewServices = currentDate;
      this.state.nextNewServices = null;
      processedEvents.push("new_services");
    }

    return {
      updatedServices,
      processedEvents,
    };
  }

  /**
   * Força o agendamento de novos eventos após processamento
   */
  rescheduleAfterProcessing(currentDate: Date): void {
    const events = this.getEventsToProcess(currentDate);

    // Re-agendar eventos que foram processados
    if (
      events.shouldProcessSignedResolution &&
      !this.state.nextSignedResolution
    ) {
      const signedTime = rollServiceSignedResolutionTime();
      const addDays = (date: Date, days: number) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
      };
      this.state.nextSignedResolution = addDays(currentDate, signedTime);
    }

    if (
      events.shouldProcessUnsignedResolution &&
      !this.state.nextUnsignedResolution
    ) {
      const unsignedTime = rollServiceUnsignedResolutionTime();
      const addDays = (date: Date, days: number) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
      };
      this.state.nextUnsignedResolution = addDays(currentDate, unsignedTime);
    }

    if (events.shouldGenerateNewServices && !this.state.nextNewServices) {
      const newServicesTime = rollNewServicesTime();
      const addDays = (date: Date, days: number) => {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
      };
      this.state.nextNewServices = addDays(currentDate, newServicesTime);
    }
  }
}
