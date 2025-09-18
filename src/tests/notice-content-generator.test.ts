import { describe, it, expect } from "vitest";
import { NoticeContentGenerator } from "@/utils/generators/noticeContentGenerator";
import { NoticeType, NoticeStatus } from "@/types/notice";
import type { Notice, Execution } from "@/types/notice";

describe("NoticeContentGenerator - Issue 7.15", () => {
  const generator = new NoticeContentGenerator();

  const createTestNotice = (type: NoticeType): Notice => ({
    id: `test-${type}`,
    guildId: "test-guild",
    type,
    status: NoticeStatus.ACTIVE,
    createdDate: new Date(),
    content: null,
    mentionedSpecies: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  it("should generate commercial proposal content", () => {
    const notice = createTestNotice(NoticeType.COMMERCIAL_PROPOSAL);
    const result = generator.generateNoticeContent(notice);

    expect(result.content).toBeDefined();
    expect(result.content).toHaveProperty("type");
    expect(result.content).toHaveProperty("what");
    expect(result.content).toHaveProperty("who");
    expect(result.content).toHaveProperty("whoType");
    expect(result.mentionedSpecies).toBeDefined();
    expect(result.mentionedSpecies.length).toBeGreaterThan(0);
  });

  it("should generate execution content with species for each person", () => {
    const notice = createTestNotice(NoticeType.EXECUTION);
    const result = generator.generateNoticeContent(notice);

    expect(result.content).toBeDefined();
    expect(result.content).toHaveProperty("who");
    expect(result.content).toHaveProperty("reason");
    expect(result.content).toHaveProperty("method");

    const execution = result.content as Execution;
    expect(execution.who.species).toBeDefined();
    expect(execution.who.species.length).toBe(execution.who.quantity);
    expect(result.mentionedSpecies.length).toBe(execution.who.quantity);
  });

  it("should return null content for NOTHING type", () => {
    const notice = createTestNotice(NoticeType.NOTHING);
    const result = generator.generateNoticeContent(notice);

    expect(result.content).toBeNull();
    expect(result.mentionedSpecies).toEqual([]);
  });

  it("should follow critical rule: assign species to all mentioned persons", () => {
    const notice = createTestNotice(NoticeType.COMMERCIAL_PROPOSAL);
    const result = generator.generateNoticeContent(notice);

    // REGRA CRÍTICA: "Sempre que uma pessoa for mencionada no quadro de avisos, determine sua espécie"
    expect(result.mentionedSpecies).toBeDefined();
    expect(result.mentionedSpecies.length).toBeGreaterThan(0);

    // Verificar que cada espécie tem propriedades obrigatórias
    result.mentionedSpecies.forEach((species) => {
      expect(species).toHaveProperty("species");
      expect(species).toHaveProperty("subrace");
    });
  });
});
