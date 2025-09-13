import { describe, it, expect } from "vitest";
import {
  createTextBasedRollAgainChecker,
  createBooleanBasedRollAgainChecker,
} from "@/utils/multiRollHandler";

describe("MultiRollHandler - Helper Functions", () => {
  describe("createTextBasedRollAgainChecker", () => {
    it("deve detectar texto específico", () => {
      const checker = createTextBasedRollAgainChecker("Role duas vezes");

      expect(checker("Role duas vezes e use ambos")).toBe(true);
      expect(checker("Role duas vezes")).toBe(true);
      expect(checker("Resultado normal")).toBe(false);
      expect(checker("ROLE DUAS VEZES")).toBe(false);
    });

    it("deve detectar diferentes padrões", () => {
      const checker = createTextBasedRollAgainChecker("roll again");

      expect(checker("roll again and use both")).toBe(true);
      expect(checker("normal result")).toBe(false);
    });
  });

  describe("createBooleanBasedRollAgainChecker", () => {
    it("deve detectar propriedade boolean true", () => {
      const checker = createBooleanBasedRollAgainChecker<{
        rollTwice: boolean;
      }>("rollTwice");

      expect(checker({ rollTwice: true })).toBe(true);
      expect(checker({ rollTwice: false })).toBe(false);
    });

    it("deve funcionar com valores truthy/falsy", () => {
      const checker = createBooleanBasedRollAgainChecker<{ count: number }>(
        "count"
      );

      expect(checker({ count: 1 })).toBe(true);
      expect(checker({ count: 0 })).toBe(false);
    });

    it("deve funcionar com strings", () => {
      const checker = createBooleanBasedRollAgainChecker<{ status: string }>(
        "status"
      );

      expect(checker({ status: "active" })).toBe(true);
      expect(checker({ status: "" })).toBe(false);
    });
  });
});
