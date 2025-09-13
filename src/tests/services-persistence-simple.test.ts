import { describe, it, expect, beforeEach } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useServicesStore } from "@/stores/services";
import { useGuildStore } from "@/stores/guild";
import { ServiceStatus } from "@/types/service";
import { SettlementType } from "@/types/guild";
import { createTestGuild } from "@/tests/utils/test-helpers";

describe("Services Persistence Fix - Teste Simples", () => {
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

    console.log("=== PRIMEIRA SESSÃO ===");
    console.log("Serviços criados:", servicesStore1.services.length);
    console.log("currentGuildId:", servicesStore1.currentGuildId);

    // Aguardar persistência
    await new Promise((resolve) => setTimeout(resolve, 100));

    // === SIMULAÇÃO DE RECARREGAMENTO: Nova sessão ===
    setActivePinia(createPinia()); // Simula nova instância dos stores

    const guildStore2 = useGuildStore();
    const servicesStore2 = useServicesStore();

    // Restaurar guilda no novo store
    guildStore2.addToHistory(testGuild);
    guildStore2.setCurrentGuild(testGuild);

    console.log("=== SEGUNDA SESSÃO ===");
    console.log(
      "Antes do initializeStore - Serviços:",
      servicesStore2.services.length
    );
    console.log(
      "Antes do initializeStore - currentGuildId:",
      servicesStore2.currentGuildId
    );

    // Inicializar store de serviços - deve carregar dados persistidos
    await servicesStore2.initializeStore();

    console.log(
      "Depois do initializeStore - Serviços:",
      servicesStore2.services.length
    );
    console.log(
      "Depois do initializeStore - currentGuildId:",
      servicesStore2.currentGuildId
    );

    // Verificar se os serviços foram restaurados
    expect(servicesStore2.services.length).toBe(3);
    expect(servicesStore2.currentGuildId).toBe(testGuild.id);

    // Verificar se os serviços têm os dados corretos
    servicesStore2.services.forEach((service) => {
      expect(service.guildId).toBe(testGuild.id);
      expect(service.status).toBe(ServiceStatus.DISPONIVEL);
    });
  });
});
