import { describe, it, expect, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useServicesStore } from "@/stores/services";
import { useGuildStore } from "@/stores/guild";
import { useTimelineStore } from "@/stores/timeline";
import { useServicesStorage } from "@/composables/useServicesStorage";
import { ServiceStatus } from "@/types/service";
import { SettlementType } from "@/types/guild";
import { createTestGuild } from "@/tests/utils/test-helpers";

describe("Services Persistence Fix - Issue Recarregamento", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it("deve persistir currentGuildId e recuperar serviços após simulação de recarregamento", async () => {
    // === PRIMEIRA SESSÃO: Simular uso normal ===
    const guildStore1 = useGuildStore();
    const servicesStore1 = useServicesStore();

    // Configurar guilda
    const testGuild = createTestGuild({
      id: "test-guild-persistence",
      name: "Guilda de Teste Persistência",
      settlementType: SettlementType.CIDADELA,
    });

    guildStore1.addToHistory(testGuild);
    guildStore1.setCurrentGuild(testGuild);

    // Inicializar store de serviços
    await servicesStore1.initializeStore();

    // Gerar alguns serviços
    const initialServices = await servicesStore1.generateServices(testGuild, 3);
    expect(initialServices.length).toBe(3);
    expect(servicesStore1.services.length).toBe(3);

    // Aguardar persistência
    await new Promise((resolve) => setTimeout(resolve, 100));

    // === SIMULAÇÃO DE RECARREGAMENTO: Nova sessão ===
    setActivePinia(createPinia()); // Simula nova instância dos stores

    const guildStore2 = useGuildStore();
    const servicesStore2 = useServicesStore();

    // Restaurar guilda no novo store
    guildStore2.addToHistory(testGuild);
    guildStore2.setCurrentGuild(testGuild);

    // Inicializar store de serviços, deve carregar dados persistidos
    await servicesStore2.initializeStore();

    // Verificar se os serviços foram restaurados
    expect(servicesStore2.services.length).toBe(3);
    expect(servicesStore2.currentGuildId).toBe(testGuild.id);

    // Verificar se os serviços têm os dados corretos
    servicesStore2.services.forEach((service) => {
      expect(service.guildId).toBe(testGuild.id);
      expect(service.status).toBe(ServiceStatus.DISPONIVEL);
    });
  });

  it("deve manter persistência ao trocar entre guildas", async () => {
    const guildStore = useGuildStore();
    const servicesStore = useServicesStore();
    const timelineStore = useTimelineStore();
    const storage = useServicesStorage();

    // Criar duas guildas de teste
    const guild1 = createTestGuild({
      id: "guild-1",
      name: "Guilda Um",
      settlementType: SettlementType.CIDADE_GRANDE,
    });

    const guild2 = createTestGuild({
      id: "guild-2",
      name: "Guilda Dois",
      settlementType: SettlementType.CIDADELA,
    });

    // Configurar primeira guilda e gerar serviços
    guildStore.setCurrentGuild(guild1);
    timelineStore.setCurrentGuild(guild1.id);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const services1 = await servicesStore.generateServices(guild1, 2);
    expect(services1.length).toBe(2);
    expect(storage.data.value.currentGuildId).toBe(guild1.id);

    await new Promise((resolve) => setTimeout(resolve, 100));

    // Trocar para segunda guilda e gerar serviços
    guildStore.setCurrentGuild(guild2);
    timelineStore.setCurrentGuild(guild2.id);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const services2 = await servicesStore.generateServices(guild2, 1);
    expect(services2.length).toBe(1);
    expect(storage.data.value.currentGuildId).toBe(guild2.id);

    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verificar que cada guilda mantém seus próprios serviços
    expect(storage.getServicesForGuild(guild1.id).length).toBe(2);
    expect(storage.getServicesForGuild(guild2.id).length).toBe(1);

    // Voltar para a primeira guilda
    guildStore.setCurrentGuild(guild1);
    timelineStore.setCurrentGuild(guild1.id);

    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(storage.data.value.currentGuildId).toBe(guild1.id);
    expect(servicesStore.services.length).toBe(2);

    // Verificar se os serviços da guilda 1 foram recarregados corretamente
    servicesStore.services.forEach((service) => {
      expect(service.guildId).toBe(guild1.id);
    });
  });

  it("deve persistir currentGuildId mesmo sem serviços gerados", async () => {
    const guildStore = useGuildStore();
    const servicesStore = useServicesStore();
    const timelineStore = useTimelineStore();
    const storage = useServicesStorage();

    const testGuild = createTestGuild({
      id: "guild-no-services",
      name: "Guilda Sem Serviços",
      settlementType: SettlementType.VILA_GRANDE,
    });

    // Configurar guilda sem gerar serviços
    guildStore.setCurrentGuild(testGuild);
    timelineStore.setCurrentGuild(testGuild.id);

    await new Promise((resolve) => setTimeout(resolve, 100));

    // Mesmo sem serviços, currentGuildId deve ser persistido
    expect(storage.data.value.currentGuildId).toBe(testGuild.id);
    expect(servicesStore.services.length).toBe(0);

    // Simular recarregamento
    setActivePinia(createPinia());

    const guildStore2 = useGuildStore();
    const storage2 = useServicesStorage();

    guildStore2.setCurrentGuild(testGuild);

    await new Promise((resolve) => setTimeout(resolve, 100));

    // currentGuildId deve ter sido restaurado
    expect(storage2.data.value.currentGuildId).toBe(testGuild.id);
  });
});
