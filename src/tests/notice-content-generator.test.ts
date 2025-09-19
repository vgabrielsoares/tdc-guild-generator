import { describe, it, expect } from "vitest";
import { NoticeContentGenerator } from "@/utils/generators/noticeContentGenerator";
import { NoticeType, NoticeStatus } from "@/types/notice";
import type {
  Notice,
  Execution,
  WantedPoster,
  HuntProposal,
  MissingInnocentDetails,
  FugitiveConvictDetails,
} from "@/types/notice";

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

  describe("Commercial Proposals", () => {
    it("should generate commercial proposal content with proper structure", () => {
      const notice = createTestNotice(NoticeType.COMMERCIAL_PROPOSAL);
      const result = generator.generateNoticeContent(notice);

      expect(result.content).toBeDefined();
      expect(result.content).toHaveProperty("type");
      expect(result.content).toHaveProperty("what");
      expect(result.content).toHaveProperty("who");
      expect(result.content).toHaveProperty("whoType");
      expect(result.mentionedSpecies).toBeDefined();
    });
  });

  describe("Wanted Posters - Complete Implementation", () => {
    it("should generate missing innocent with all required fields", () => {
      // Testar múltiplas vezes para conseguir um inocente
      let found = false;
      for (let i = 0; i < 20 && !found; i++) {
        const notice = createTestNotice(NoticeType.WANTED_POSTER);
        const result = generator.generateNoticeContent(notice);

        const wanted = result.content as WantedPoster;
        if (wanted.type === "missing_innocent") {
          found = true;
          expect(wanted.target).toBeDefined();
          expect(wanted.target).toHaveProperty("species");
          expect(wanted.target).toHaveProperty("subrace");

          const details = wanted.details as MissingInnocentDetails;
          expect(details).toHaveProperty("who");
          expect(details).toHaveProperty("lastSeen");
          expect(details).toHaveProperty("characteristics1");
          expect(details).toHaveProperty("characteristics2");
          expect(details).toHaveProperty("peculiarity");
          expect(details).toHaveProperty("reward");
        }
      }
      expect(found).toBe(true);
    });

    it("should generate fugitive convict with all required fields", () => {
      // Testar múltiplas vezes para conseguir um fugitivo
      let found = false;
      for (let i = 0; i < 20 && !found; i++) {
        const notice = createTestNotice(NoticeType.WANTED_POSTER);
        const result = generator.generateNoticeContent(notice);

        const wanted = result.content as WantedPoster;
        if (wanted.type === "fugitive_convict") {
          found = true;
          expect(wanted.target).toBeDefined();

          const details = wanted.details as FugitiveConvictDetails;
          expect(details).toHaveProperty("infamyReason");
          expect(details).toHaveProperty("dangerLevel");
          expect(details).toHaveProperty("peculiarities");
          expect(details).toHaveProperty("characteristics");
          expect(details).toHaveProperty("reward");
        }
      }
      expect(found).toBe(true);
    });
  });

  describe("Hunt Proposals - Complete Implementation", () => {
    it("should generate hunt proposal with all required fields", () => {
      const notice = createTestNotice(NoticeType.HUNT_PROPOSAL);
      const result = generator.generateNoticeContent(notice);

      expect(result.content).toBeDefined();
      const hunt = result.content as HuntProposal;
      expect(hunt).toHaveProperty("huntType");
      expect(hunt).toHaveProperty("creatureSpecification");
      expect(hunt).toHaveProperty("location");
      expect(hunt).toHaveProperty("huntPeculiarity");
      expect(hunt).toHaveProperty("characteristics1");
      expect(hunt).toHaveProperty("characteristics2");
      expect(hunt).toHaveProperty("testAdvantage");
      expect(hunt).toHaveProperty("rewardCalculationInfo");
    });

    it("should handle twist generation correctly", () => {
      // Testar múltiplas vezes para verificar lógica de reviravolta
      let foundNoTwist = false;

      for (let i = 0; i < 30; i++) {
        const notice = createTestNotice(NoticeType.HUNT_PROPOSAL);
        const result = generator.generateNoticeContent(notice);

        const hunt = result.content as HuntProposal;
        if (hunt.twist === null) {
          foundNoTwist = true;
          break;
        }
      }

      // Deve encontrar pelo menos casos sem reviravolta (mais comuns)
      expect(foundNoTwist).toBe(true);
    });

    it("should not calculate reward automatically", () => {
      const notice = createTestNotice(NoticeType.HUNT_PROPOSAL);
      const result = generator.generateNoticeContent(notice);

      const hunt = result.content as HuntProposal;
      expect(hunt.rewardCalculationInfo).toBeDefined();
      expect(hunt.rewardCalculationInfo.rewardNote).toContain("manual");
    });
  });

  describe("Execution Content", () => {
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

    it("should handle dice-based quantity extraction", () => {
      // Testar múltiplas vezes para verificar extração de quantidade
      for (let i = 0; i < 10; i++) {
        const notice = createTestNotice(NoticeType.EXECUTION);
        const result = generator.generateNoticeContent(notice);

        const execution = result.content as Execution;
        expect(execution.who.quantity).toBeGreaterThan(0);
        expect(execution.who.species.length).toBe(execution.who.quantity);
      }
    });
  });

  describe("Species Assignment Rules", () => {
    it("should follow critical rule: assign species to all mentioned persons", () => {
      const commercialNotice = createTestNotice(NoticeType.COMMERCIAL_PROPOSAL);
      const result = generator.generateNoticeContent(commercialNotice);

      // REGRA CRÍTICA: "Sempre que uma pessoa for mencionada no quadro de avisos, determine sua espécie"
      if (result.mentionedSpecies.length > 0) {
        // Verificar que cada espécie tem propriedades obrigatórias
        result.mentionedSpecies.forEach((species) => {
          expect(species).toHaveProperty("species");
          expect(typeof species.species).toBe("string");

          // subrace pode ser undefined para espécies sem sub-raças
          if (species.subrace !== undefined) {
            expect(typeof species.subrace).toBe("string");
          }
        });
      }
    });

    it("should distinguish between persons and animals", () => {
      // Testar múltiplas gerações para verificar a lógica de espécies
      let foundPersonWithSpecies = false;

      for (let i = 0; i < 20; i++) {
        const notice = createTestNotice(NoticeType.COMMERCIAL_PROPOSAL);
        const result = generator.generateNoticeContent(notice);

        // Verificar se é um tipo de pessoa (não animal)
        const commercial = result.content as { whoType: string };
        if (!commercial.whoType.toLowerCase().includes("animal")) {
          if (result.mentionedSpecies.length > 0) {
            foundPersonWithSpecies = true;
            break;
          }
        }
      }

      // Deve encontrar pelo menos casos de pessoas com espécies
      expect(foundPersonWithSpecies).toBe(true);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("should return null content for NOTHING type", () => {
      const notice = createTestNotice(NoticeType.NOTHING);
      const result = generator.generateNoticeContent(notice);

      expect(result.content).toBeNull();
      expect(result.mentionedSpecies).toEqual([]);
    });

    it("should handle SERVICES and CONTRACTS delegation", () => {
      const servicesNotice = createTestNotice(NoticeType.SERVICES);
      const contractsNotice = createTestNotice(NoticeType.CONTRACTS);

      const servicesResult = generator.generateNoticeContent(servicesNotice);
      const contractsResult = generator.generateNoticeContent(contractsNotice);

      expect(servicesResult.content).toBeNull();
      expect(contractsResult.content).toBeNull();
      expect(servicesResult.mentionedSpecies).toEqual([]);
      expect(contractsResult.mentionedSpecies).toEqual([]);
    });
  });

  describe("Announcements and Other Types", () => {
    it("should generate announcement content", () => {
      const notice = createTestNotice(NoticeType.ANNOUNCEMENT);
      const result = generator.generateNoticeContent(notice);

      expect(result.content).toBeDefined();
      expect(result.content).toHaveProperty("type");
      expect(result.content).toHaveProperty("from");
      expect(result.content).toHaveProperty("fromType");
    });

    it("should generate residents notice", () => {
      const notice = createTestNotice(NoticeType.RESIDENTS_NOTICE);
      const result = generator.generateNoticeContent(notice);

      expect(result.content).toBeDefined();
      expect(result.content).toHaveProperty("type");
      expect(result.content).toHaveProperty("content");
    });

    it("should generate official statement", () => {
      const notice = createTestNotice(NoticeType.OFFICIAL_STATEMENT);
      const result = generator.generateNoticeContent(notice);

      expect(result.content).toBeDefined();
      expect(result.content).toHaveProperty("type");
      expect(result.content).toHaveProperty("peculiarity");
      expect(result.content).toHaveProperty("content");
    });
  });

  describe("Comprehensive Integration Test", () => {
    it("should generate all supported notice types without errors", () => {
      const supportedTypes = [
        NoticeType.COMMERCIAL_PROPOSAL,
        NoticeType.ANNOUNCEMENT,
        NoticeType.EXECUTION,
        NoticeType.WANTED_POSTER,
        NoticeType.HUNT_PROPOSAL,
        NoticeType.RESIDENTS_NOTICE,
        NoticeType.OFFICIAL_STATEMENT,
        NoticeType.NOTHING,
        NoticeType.SERVICES,
        NoticeType.CONTRACTS,
      ];

      supportedTypes.forEach((type) => {
        const notice = createTestNotice(type);
        expect(() => {
          const result = generator.generateNoticeContent(notice);
          expect(result).toBeDefined();
          expect(result.type).toBe(type);
        }).not.toThrow();
      });
    });
  });
});
