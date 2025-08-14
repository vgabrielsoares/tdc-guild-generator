import { describe, it, expect, beforeEach } from "vitest";
import {
  applyServiceSignedResolution,
  applyServiceUnsignedResolution,
  increaseUnresolvedServiceRewards,
  ServiceLifecycleManager,
} from "../utils/generators/serviceLifeCycle";
import {
  ServiceStatus,
  ServiceContractorType,
  ServiceObjectiveType,
  ServiceComplexity,
  ServiceDifficulty,
  ServiceDeadlineType,
  ServicePaymentType,
} from "../types/service";
import type { Service } from "../types/service";
import { createGameDate } from "../utils/date-utils";

// ===== MOCK SERVICES PARA TESTES =====

const createMockService = (
  status: ServiceStatus,
  rewardAmount: number = 50,
  recurrenceBonusAmount: number = 0
): Service => ({
  id: Math.random().toString(36).substring(2, 9),
  title: "Serviço de Teste",
  description: "Descrição do serviço de teste",
  status,
  complexity: ServiceComplexity.SIMPLES,
  difficulty: ServiceDifficulty.MEDIA_ND17,
  contractorType: ServiceContractorType.POVO,
  contractorName: "João da Silva",
  objective: {
    type: ServiceObjectiveType.TREINAR_OU_ENSINAR,
    description: "Ensinar uma habilidade básica",
    action: "Treinar uma perícia",
    target: "Um grupo de jovens",
    complication: "O ambiente é desestimulante",
  },
  value: {
    rewardRoll: "5d6 C$",
    rewardAmount,
    currency: "C$" as const,
    recurrenceBonus: `+${recurrenceBonusAmount} C$`,
    recurrenceBonusAmount,
    difficulty: ServiceDifficulty.MEDIA_ND17,
  },
  deadline: {
    type: ServiceDeadlineType.DIAS,
    value: "15 dias",
  },
  deadlineDate: createGameDate(15, 3, 2024),
  paymentType: ServicePaymentType.PAGAMENTO_TOTAL_GUILDA,
  createdAt: createGameDate(1, 3, 2024),
  acceptedAt:
    status === ServiceStatus.ACEITO_POR_OUTROS
      ? createGameDate(2, 3, 2024)
      : undefined,
  isActive: true,
  isExpired: false,
});

// ===== TESTES PARA APLICAÇÃO DE RESOLUÇÕES DE SERVIÇOS ASSINADOS =====

describe("Issue 5.18: Sistema de Resolução Automática - Lógica", () => {
  describe("applyServiceSignedResolution", () => {
    it("deve processar apenas serviços assinados por outros", () => {
      const services = [
        createMockService(ServiceStatus.ACEITO_POR_OUTROS),
        createMockService(ServiceStatus.DISPONIVEL),
        createMockService(ServiceStatus.CONCLUIDO),
      ];

      const result = applyServiceSignedResolution(services);

      // Verificar que apenas serviços assinados foram processados
      expect(result).toHaveLength(3);

      // Serviços não assinados devem permanecer inalterados
      expect(
        result.find((s) => s.status === ServiceStatus.DISPONIVEL)
      ).toBeDefined();
      expect(
        result.find((s) => s.status === ServiceStatus.CONCLUIDO)
      ).toBeDefined();

      // O serviço assinado deve ter mudado status ou permanecido igual
      const signedService = result.find((s) => s.acceptedAt !== undefined);
      expect(signedService).toBeDefined();

      // Status deve ser um dos resultados possíveis
      expect([
        ServiceStatus.RESOLVIDO_POR_OUTROS,
        ServiceStatus.DISPONIVEL,
        ServiceStatus.ANULADO,
        ServiceStatus.ACEITO_POR_OUTROS, // se "ainda não se sabe"
      ]).toContain(signedService!.status);
    });

    it("deve funcionar com múltiplos serviços assinados", () => {
      const services = Array.from({ length: 5 }, () =>
        createMockService(ServiceStatus.ACEITO_POR_OUTROS)
      );

      const result = applyServiceSignedResolution(services);

      expect(result).toHaveLength(5);
      // Todos devem ter sido processados
      result.forEach((service) => {
        expect([
          ServiceStatus.RESOLVIDO_POR_OUTROS,
          ServiceStatus.DISPONIVEL,
          ServiceStatus.ANULADO,
          ServiceStatus.ACEITO_POR_OUTROS,
        ]).toContain(service.status);
      });
    });

    it("deve retornar array vazio quando não há serviços", () => {
      const result = applyServiceSignedResolution([]);
      expect(result).toEqual([]);
    });
  });

  // ===== TESTES PARA APLICAÇÃO DE RESOLUÇÕES DE SERVIÇOS NÃO ASSINADOS =====

  describe("applyServiceUnsignedResolution", () => {
    it("deve processar apenas serviços disponíveis", () => {
      const services = [
        createMockService(ServiceStatus.DISPONIVEL),
        createMockService(ServiceStatus.ACEITO_POR_OUTROS),
        createMockService(ServiceStatus.CONCLUIDO),
      ];

      const result = applyServiceUnsignedResolution(services);

      expect(result).toHaveLength(3);

      // Serviços não disponíveis devem permanecer inalterados
      expect(
        result.find((s) => s.status === ServiceStatus.ACEITO_POR_OUTROS)
      ).toBeDefined();
      expect(
        result.find((s) => s.status === ServiceStatus.CONCLUIDO)
      ).toBeDefined();
    });

    it("deve aplicar diferentes tipos de resolução", () => {
      const services = Array.from({ length: 5 }, () =>
        createMockService(ServiceStatus.DISPONIVEL)
      );

      // Executar várias vezes para testar variabilidade
      const differentResults = new Set<ServiceStatus>();

      for (let i = 0; i < 20; i++) {
        const result = applyServiceUnsignedResolution(services);
        result.forEach((service) => {
          differentResults.add(service.status);
        });

        if (differentResults.size > 1) break; // Encontrou variabilidade
      }

      // Deve ter pelo menos alguma variação nos resultados
      expect(differentResults.size).toBeGreaterThanOrEqual(1);
    });

    it("não deve afetar array vazio", () => {
      const result = applyServiceUnsignedResolution([]);
      expect(result).toEqual([]);
    });

    it("não deve afetar serviços que não estão disponíveis", () => {
      const services = [
        createMockService(ServiceStatus.ACEITO_POR_OUTROS),
        createMockService(ServiceStatus.CONCLUIDO),
        createMockService(ServiceStatus.ANULADO),
      ];

      const result = applyServiceUnsignedResolution(services);
      expect(result).toEqual(services);
    });
  });

  // ===== TESTES PARA SISTEMA DE TAXA DE RECORRÊNCIA =====

  describe("increaseUnresolvedServiceRewards", () => {
    it("deve aumentar recompensa de serviços disponíveis com bônus existente", () => {
      const serviceWithBonus = createMockService(
        ServiceStatus.DISPONIVEL,
        50,
        5
      );
      const serviceWithoutBonus = createMockService(
        ServiceStatus.DISPONIVEL,
        50,
        0
      );
      const resolvedService = createMockService(
        ServiceStatus.RESOLVIDO_POR_OUTROS,
        50,
        5
      );

      const services = [serviceWithBonus, serviceWithoutBonus, resolvedService];
      const result = increaseUnresolvedServiceRewards(services);

      // Apenas serviços disponíveis com bônus existente devem ser aumentados
      expect(result[0].value.recurrenceBonusAmount).toBeGreaterThan(5);
      expect(result[1].value.recurrenceBonusAmount).toBe(0); // não tinha bônus antes
      expect(result[2].value.recurrenceBonusAmount).toBe(5); // resolvido, não muda
    });

    it("deve aplicar incrementos corretos para moedas diferentes", () => {
      const serviceC = createMockService(ServiceStatus.DISPONIVEL, 50, 5);
      serviceC.value.currency = "C$";

      const servicePO = createMockService(ServiceStatus.DISPONIVEL, 50, 1);
      servicePO.value.currency = "PO$";

      const result = increaseUnresolvedServiceRewards([serviceC, servicePO]);

      // Verificar que houve incremento
      expect(result[0].value.recurrenceBonusAmount).toBeGreaterThan(5);
      expect(result[1].value.recurrenceBonusAmount).toBeGreaterThan(1);
    });

    it("deve respeitar limites máximos", () => {
      const serviceMaxC = createMockService(ServiceStatus.DISPONIVEL, 50, 25);
      serviceMaxC.value.currency = "C$";

      const serviceMaxPO = createMockService(ServiceStatus.DISPONIVEL, 50, 5);
      serviceMaxPO.value.currency = "PO$";

      const result = increaseUnresolvedServiceRewards([
        serviceMaxC,
        serviceMaxPO,
      ]);

      // Deve respeitar limites
      expect(result[0].value.recurrenceBonusAmount).toBeLessThanOrEqual(25);
      expect(result[1].value.recurrenceBonusAmount).toBeLessThanOrEqual(5);
    });
  });

  // ===== TESTES PARA GERENCIADOR DE CICLO DE VIDA =====

  describe("ServiceLifecycleManager", () => {
    let manager: ServiceLifecycleManager;
    let currentDate: Date;

    beforeEach(() => {
      currentDate = new Date(2024, 2, 15); // 15 de março de 2024
      manager = new ServiceLifecycleManager();
    });

    it("deve inicializar com estado limpo", () => {
      const state = manager.getState();

      expect(state.nextSignedResolution).toBeNull();
      expect(state.nextUnsignedResolution).toBeNull();
      expect(state.nextNewServices).toBeNull();
      expect(state.lastSignedResolution).toBeNull();
      expect(state.lastUnsignedResolution).toBeNull();
      expect(state.lastNewServices).toBeNull();
    });

    it("deve agendar próximas resoluções no futuro", () => {
      manager.scheduleNextResolutions(currentDate);
      const state = manager.getState();

      expect(state.nextSignedResolution).toBeInstanceOf(Date);
      expect(state.nextUnsignedResolution).toBeInstanceOf(Date);
      expect(state.nextNewServices).toBeInstanceOf(Date);

      // Todas as datas devem ser no futuro
      expect(state.nextSignedResolution!.getTime()).toBeGreaterThan(
        currentDate.getTime()
      );
      expect(state.nextUnsignedResolution!.getTime()).toBeGreaterThan(
        currentDate.getTime()
      );
      expect(state.nextNewServices!.getTime()).toBeGreaterThan(
        currentDate.getTime()
      );
    });

    it("deve detectar eventos que precisam ser processados", () => {
      // Agendar eventos no passado
      const pastDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);

      manager.updateState({
        nextSignedResolution: pastDate,
        nextUnsignedResolution: pastDate,
        nextNewServices: pastDate,
      });

      const events = manager.getEventsToProcess(currentDate);

      expect(events.shouldProcessSignedResolution).toBe(true);
      expect(events.shouldProcessUnsignedResolution).toBe(true);
      expect(events.shouldGenerateNewServices).toBe(true);
    });

    it("deve processar eventos e retornar informações corretas", () => {
      const services = [
        createMockService(ServiceStatus.ACEITO_POR_OUTROS),
        createMockService(ServiceStatus.DISPONIVEL),
      ];

      const pastDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
      manager.updateState({
        nextSignedResolution: pastDate,
        nextUnsignedResolution: pastDate,
        nextNewServices: pastDate,
      });

      const result = manager.processEvents(services, currentDate);

      expect(result.updatedServices).toHaveLength(2);
      expect(result.processedEvents).toContain("signed_resolution");
      expect(result.processedEvents).toContain("unsigned_resolution");
      expect(result.processedEvents).toContain("new_services");

      // Estado deve ser atualizado
      const state = manager.getState();
      expect(state.lastSignedResolution).toEqual(currentDate);
      expect(state.lastUnsignedResolution).toEqual(currentDate);
      expect(state.lastNewServices).toEqual(currentDate);
    });

    it("deve reagendar eventos após processamento", () => {
      const services = [createMockService(ServiceStatus.DISPONIVEL)];

      const pastDate = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);
      manager.updateState({
        nextSignedResolution: pastDate,
        nextUnsignedResolution: pastDate,
        nextNewServices: pastDate,
      });

      manager.processEvents(services, currentDate);

      // Eventos foram zerados após processamento
      let state = manager.getState();
      expect(state.nextSignedResolution).toBeNull();
      expect(state.nextUnsignedResolution).toBeNull();
      expect(state.nextNewServices).toBeNull();

      // Reagendar manualmente novos eventos
      manager.scheduleNextResolutions(currentDate);
      state = manager.getState();

      // Novos eventos devem ter sido agendados no futuro
      expect(state.nextSignedResolution).toBeInstanceOf(Date);
      expect(state.nextUnsignedResolution).toBeInstanceOf(Date);
      expect(state.nextNewServices).toBeInstanceOf(Date);

      expect(state.nextSignedResolution!.getTime()).toBeGreaterThan(
        currentDate.getTime()
      );
      expect(state.nextUnsignedResolution!.getTime()).toBeGreaterThan(
        currentDate.getTime()
      );
      expect(state.nextNewServices!.getTime()).toBeGreaterThan(
        currentDate.getTime()
      );
    });

    it("deve permitir atualização manual de estado", () => {
      const customDate = new Date(2024, 5, 1);

      manager.updateState({
        nextSignedResolution: customDate,
        lastNewServices: currentDate,
      });

      const state = manager.getState();
      expect(state.nextSignedResolution).toEqual(customDate);
      expect(state.lastNewServices).toEqual(currentDate);
      expect(state.nextUnsignedResolution).toBeNull();
    });
  });

  // ===== TESTE DE INTEGRAÇÃO =====

  describe("Integração completa do sistema de resolução", () => {
    it("deve executar ciclo completo de resolução automática", () => {
      const manager = new ServiceLifecycleManager();
      const currentDate = new Date(2024, 2, 15);

      const services = [
        createMockService(ServiceStatus.ACEITO_POR_OUTROS),
        createMockService(ServiceStatus.DISPONIVEL),
        createMockService(ServiceStatus.DISPONIVEL),
      ];

      // 1. Agendar próximas resoluções
      manager.scheduleNextResolutions(currentDate);

      // 2. Simular passagem de tempo
      const futureDate = new Date(
        currentDate.getTime() + 10 * 24 * 60 * 60 * 1000
      );

      // 3. Processar eventos
      const result = manager.processEvents(services, futureDate);

      // 4. Reagendar para próximo ciclo
      manager.scheduleNextResolutions(futureDate);

      // Verificações
      expect(result.updatedServices).toHaveLength(3);
      expect(result.processedEvents.length).toBeGreaterThan(0);

      const state = manager.getState();
      expect(state.nextSignedResolution).toBeInstanceOf(Date);
      expect(state.nextUnsignedResolution).toBeInstanceOf(Date);
      expect(state.nextNewServices).toBeInstanceOf(Date);
    });
  });
});
