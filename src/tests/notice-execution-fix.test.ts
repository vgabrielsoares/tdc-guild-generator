import { describe, it, expect, vi } from "vitest";
import { rollNoticeExpiration } from "@/utils/generators/noticeLifeCycle";
import { NoticeType } from "@/types/notice";

describe("Notice Execution Fix", () => {
  it("should schedule executions normally, not remove immediately", () => {
    // Mock do dice roller para resultado determinístico
    const mockRoller = vi.fn().mockReturnValue(10); // Rolagem que resulta em "duas semanas"

    const result = rollNoticeExpiration(NoticeType.EXECUTION, mockRoller);

    // Execuções NÃO devem ser removidas imediatamente
    expect(result.immediateRemoval).toBe(false);

    // Deve ter uma data futura válida
    expect(result.days).toBeGreaterThan(0);

    // Deve indicar que é dia de execução
    expect(result.isExecutionDay).toBe(true);

    // Descrição deve mencionar execução
    expect(result.description).toContain("Execução");
  });

  it("should apply correct modifier for executions (0)", () => {
    // Testa múltiplas rolagens para verificar que modificador 0 é aplicado
    const mockRoller = vi.fn().mockReturnValue(15); // Rolagem base

    const result = rollNoticeExpiration(NoticeType.EXECUTION, mockRoller);

    // Com modificador 0, rolagem 15 deve resultar em algo da tabela para valor 15
    expect(result.days).toBe(4); // "Quatro dias" para rolagem 14-15
    expect(result.description).toContain("Execução em Quatro dias");
  });

  it("should treat executions like other notices for scheduling", () => {
    const mockRoller = vi.fn().mockReturnValue(20); // Rolagem máxima

    const executionResult = rollNoticeExpiration(
      NoticeType.EXECUTION,
      mockRoller
    );
    const contractResult = rollNoticeExpiration(
      NoticeType.CONTRACTS,
      mockRoller
    );

    // Execuções devem usar mesma tabela, apenas com modificador diferente
    // Execução: modificador 0, Contrato: modificador -4
    expect(executionResult.days).toBe(1); // Rolagem 20 = "Um dia"
    expect(contractResult.days).toBe(3); // Rolagem 20-4=16 = "Três dias"

    // Ambos seguem fluxo normal (não imediato)
    expect(executionResult.immediateRemoval).toBe(false);
    expect(contractResult.immediateRemoval).toBe(false);
  });

  it("should handle variable dice rolls for executions", () => {
    // Testa caso com dados variáveis (2d4 semanas)
    const mockRoller = vi
      .fn()
      .mockReturnValueOnce(6) // Rolagem inicial que resulta em "2d4 semanas"
      .mockReturnValueOnce(6); // Rolagem do 2d4 = 6 semanas

    const result = rollNoticeExpiration(NoticeType.EXECUTION, mockRoller);

    expect(result.days).toBe(42); // 6 semanas * 7 dias = 42 dias
    expect(result.description).toContain("Execução em 2d4 semanas");
    expect(result.isExecutionDay).toBe(true);
  });
});
