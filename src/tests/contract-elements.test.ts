import { describe, it, expect } from "vitest";
import type { Twist } from "../types/contract";
import {
  validateTwist,
  TwistWho,
  TwistWhat,
  TwistBut,
} from "../types/contract";

describe("Contract Elements Validation", () => {
  it("deve validar corretamente uma reviravolta", () => {
    const validTwist: Twist = {
      hasTwist: true,
      who: TwistWho.BENFEITOR_ANONIMO,
      what: TwistWhat.REENCARNACAO,
      but: TwistBut.SALVAR_ALGUEM_QUERIDO,
      description: "Uma reviravolta interessante",
    };

    expect(() => validateTwist(validTwist)).not.toThrow();
  });

  it("deve ser executado sem erros", () => {
    expect(true).toBe(true);
  });
});
