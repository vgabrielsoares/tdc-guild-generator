import { describe, it, expect } from "vitest";
import {
  SERVICE_QUANTITY_TABLE,
  SERVICE_VISITOR_REDUCTION_TABLE,
  SERVICE_DEADLINE_TABLE,
  SERVICE_PAYMENT_TYPE_TABLE,
  SERVICE_SIGNED_RESOLUTION_TIME_TABLE,
  SERVICE_UNSIGNED_RESOLUTION_TIME_TABLE,
  NEW_SERVICES_TIME_TABLE,
  getServiceDiceBySize,
  applyServiceStaffModifier,
  getVisitorReductionIndex,
} from "@/data/tables/service-base-tables";
import { ServicePaymentType } from "@/types/service";

describe("Service Base Tables - Issue 5.9", () => {
  describe("SERVICE_QUANTITY_TABLE", () => {
    it("should have exact entries matching [2-2] Serviços - Guilda.md", () => {
      expect(SERVICE_QUANTITY_TABLE).toHaveLength(11);

      // Verificar entradas específicas
      expect(SERVICE_QUANTITY_TABLE[0]).toEqual({
        min: 1,
        max: 4,
        result: { quantity: "1d4 serviços" },
      });

      expect(SERVICE_QUANTITY_TABLE[5]).toEqual({
        min: 12,
        max: 13,
        result: { quantity: "2d4 serviços" },
      });

      // Verificar entrada 21+ (último range)
      expect(SERVICE_QUANTITY_TABLE[10]).toEqual({
        min: 21,
        max: 999,
        result: { quantity: "5d6 serviços" },
      });
    });

    it("should cover ranges 1-20 and 21+ without gaps", () => {
      // Verificar cobertura de 1-20
      for (let i = 1; i <= 20; i++) {
        const hasRange = SERVICE_QUANTITY_TABLE.some(
          (entry) => i >= entry.min && i <= entry.max
        );
        expect(hasRange).toBe(true);
      }

      // Verificar 21+
      expect(SERVICE_QUANTITY_TABLE[10].min).toBe(21);
      expect(SERVICE_QUANTITY_TABLE[10].max).toBe(999);
    });
  });

  describe("SERVICE_VISITOR_REDUCTION_TABLE", () => {
    it("should have all 7 visitor levels from md table", () => {
      expect(SERVICE_VISITOR_REDUCTION_TABLE).toHaveLength(7);

      const expectedDescriptions = [
        "Vazia",
        "Quase deserta",
        "Pouco movimentada",
        "Nem muito nem pouco",
        "Muito frequentada",
        "Abarrotada",
        "Lotada",
      ];

      SERVICE_VISITOR_REDUCTION_TABLE.forEach((entry, index) => {
        expect(entry.result.description).toBe(expectedDescriptions[index]);
        expect(entry.min).toBe(index + 1);
        expect(entry.max).toBe(index + 1);
      });
    });

    it("should have correct reduction patterns", () => {
      // Vazia - sem redução
      expect(SERVICE_VISITOR_REDUCTION_TABLE[0].result.reduction).toBe(
        "Todos os serviços estão disponíveis"
      );

      // Quase deserta - redução mínima
      expect(SERVICE_VISITOR_REDUCTION_TABLE[1].result.reduction).toBe(
        "-1 serviço"
      );

      // Lotada - redução máxima
      expect(SERVICE_VISITOR_REDUCTION_TABLE[6].result.reduction).toBe(
        "-3d4 serviços"
      );
    });
  });

  describe("SERVICE_DEADLINE_TABLE", () => {
    it("should have exact entries matching md table", () => {
      expect(SERVICE_DEADLINE_TABLE).toHaveLength(10);

      // Verificar entradas específicas
      expect(SERVICE_DEADLINE_TABLE[0]).toEqual({
        min: 1,
        max: 1,
        result: { deadline: "1d4 dias" },
      });

      expect(SERVICE_DEADLINE_TABLE[1]).toEqual({
        min: 2,
        max: 2,
        result: { deadline: "3 dias" },
      });

      // Range 11-20 (sem prazo)
      expect(SERVICE_DEADLINE_TABLE[9]).toEqual({
        min: 11,
        max: 20,
        result: { deadline: "Sem prazo" },
      });
    });

    it("should cover range 1-20 without gaps", () => {
      for (let i = 1; i <= 20; i++) {
        const hasRange = SERVICE_DEADLINE_TABLE.some(
          (entry) => i >= entry.min && i <= entry.max
        );
        expect(hasRange).toBe(true);
      }
    });
  });

  describe("SERVICE_PAYMENT_TYPE_TABLE", () => {
    it("should have exact entries matching md table", () => {
      expect(SERVICE_PAYMENT_TYPE_TABLE).toHaveLength(5);

      // Verificar range 1-10 (direto com contratante)
      expect(SERVICE_PAYMENT_TYPE_TABLE[0]).toEqual({
        min: 1,
        max: 10,
        result: {
          type: ServicePaymentType.PAGAMENTO_DIRETO_CONTRATANTE,
          description: "Pagamento em PO$ direto com contratante",
          guildPercentage: 0,
          contractorPercentage: 100,
          includesGoods: false,
          includesServices: false,
        },
      });

      // Verificar range 17-20 (total na guilda)
      expect(SERVICE_PAYMENT_TYPE_TABLE[4]).toEqual({
        min: 17,
        max: 20,
        result: {
          type: ServicePaymentType.PAGAMENTO_TOTAL_GUILDA,
          description: "Pagamento total na guilda em PO$",
          guildPercentage: 100,
          contractorPercentage: 0,
          includesGoods: false,
          includesServices: false,
        },
      });
    });

    it("should have correct payment percentages", () => {
      SERVICE_PAYMENT_TYPE_TABLE.forEach((entry) => {
        const { guildPercentage, contractorPercentage } = entry.result;
        expect(guildPercentage + contractorPercentage).toBe(100);
      });
    });
  });

  describe("Resolution Time Tables", () => {
    it("should have SERVICE_SIGNED_RESOLUTION_TIME_TABLE with all entries", () => {
      expect(SERVICE_SIGNED_RESOLUTION_TIME_TABLE).toHaveLength(10);

      // Verificar cobertura 1-20
      for (let i = 1; i <= 20; i++) {
        const hasRange = SERVICE_SIGNED_RESOLUTION_TIME_TABLE.some(
          (entry) => i >= entry.min && i <= entry.max
        );
        expect(hasRange).toBe(true);
      }
    });

    it("should have SERVICE_UNSIGNED_RESOLUTION_TIME_TABLE with all entries", () => {
      expect(SERVICE_UNSIGNED_RESOLUTION_TIME_TABLE).toHaveLength(10);

      // Verificar cobertura 1-20
      for (let i = 1; i <= 20; i++) {
        const hasRange = SERVICE_UNSIGNED_RESOLUTION_TIME_TABLE.some(
          (entry) => i >= entry.min && i <= entry.max
        );
        expect(hasRange).toBe(true);
      }
    });
  });

  describe("NEW_SERVICES_TIME_TABLE", () => {
    it("should have exact entries matching md table", () => {
      expect(NEW_SERVICES_TIME_TABLE).toHaveLength(10);

      // Verificar entradas específicas
      expect(NEW_SERVICES_TIME_TABLE[0]).toEqual({
        min: 1,
        max: 4,
        result: { time: "1 semana" },
      });

      expect(NEW_SERVICES_TIME_TABLE[9]).toEqual({
        min: 20,
        max: 20,
        result: { time: "2d4+1 meses" },
      });
    });
  });

  describe("Utility Functions", () => {
    describe("getServiceDiceBySize", () => {
      it("should return correct dice for each size category", () => {
        expect(getServiceDiceBySize("Minúsculo (3m x 1,5m)")).toBe("1d4");
        expect(getServiceDiceBySize("Muito pequeno (4,5m x 3m)")).toBe("1d6");
        expect(
          getServiceDiceBySize("Colossal e primorosa (20m x 20m, +2 andares)")
        ).toBe("1d20+10");
      });

      it("should return 1d4 for unknown sizes", () => {
        expect(getServiceDiceBySize("Tamanho desconhecido")).toBe("1d4");
      });
    });

    describe("applyServiceStaffModifier", () => {
      it("should apply correct modifiers for staff conditions", () => {
        expect(applyServiceStaffModifier(10, "despreparados")).toBe(9);
        expect(applyServiceStaffModifier(10, "experientes")).toBe(11);
        expect(applyServiceStaffModifier(10, "normais")).toBe(10);
      });
    });

    describe("getVisitorReductionIndex", () => {
      it("should return correct indices for visitor descriptions", () => {
        expect(getVisitorReductionIndex("Vazia")).toBe(1);
        expect(getVisitorReductionIndex("Quase deserta")).toBe(2);
        expect(getVisitorReductionIndex("Lotada")).toBe(7);
        expect(getVisitorReductionIndex("Desconhecido")).toBe(1);
      });
    });
  });

  describe("Table Structure Validation", () => {
    it("should have all tables with proper TableEntry structure", () => {
      const tables = [
        SERVICE_QUANTITY_TABLE,
        SERVICE_VISITOR_REDUCTION_TABLE,
        SERVICE_DEADLINE_TABLE,
        SERVICE_PAYMENT_TYPE_TABLE,
        SERVICE_SIGNED_RESOLUTION_TIME_TABLE,
        SERVICE_UNSIGNED_RESOLUTION_TIME_TABLE,
        NEW_SERVICES_TIME_TABLE,
      ];

      tables.forEach((table) => {
        table.forEach((entry) => {
          expect(entry).toHaveProperty("min");
          expect(entry).toHaveProperty("max");
          expect(entry).toHaveProperty("result");
          expect(typeof entry.min).toBe("number");
          expect(typeof entry.max).toBe("number");
          expect(entry.min).toBeLessThanOrEqual(entry.max);
        });
      });
    });
  });
});
