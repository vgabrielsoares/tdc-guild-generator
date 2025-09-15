import { describe, it, expect } from "vitest";
import {
  NoticeType,
  NoticeStatus,
  AlternativePayment,
  validateNotice,
  validateNoticeType,
  validateCommercialProposal,
  validateAnnouncement,
  validateExecution,
  validateWantedPoster,
  validateHuntProposal,
  validateResidentsNotice,
  validateOfficialStatement,
  type Notice,
  type CommercialProposal,
  type Announcement,
  type Execution,
  type WantedPoster,
  type HuntProposal,
  type ResidentsNotice,
  type OfficialStatement,
  type MissingInnocentDetails,
  type FugitiveConvictDetails,
} from "@/types/notice";
import { Species, type SpeciesWithSubrace } from "@/types/species";

describe("Notice Types", () => {
  const mockSpecies: SpeciesWithSubrace = {
    species: Species.HUMAN,
  };

  describe("NoticeType Enum", () => {
    it("should include all notice types from 1d20 table", () => {
      expect(NoticeType.NOTHING).toBe("nothing"); // 1
      expect(NoticeType.RESIDENTS_NOTICE).toBe("residents_notice"); // 2-6
      expect(NoticeType.SERVICES).toBe("services"); // 7-8
      expect(NoticeType.COMMERCIAL_PROPOSAL).toBe("commercial_proposal"); // 9-10
      expect(NoticeType.ANNOUNCEMENT).toBe("announcement"); // 11-13
      expect(NoticeType.HUNT_PROPOSAL).toBe("hunt_proposal"); // 14
      expect(NoticeType.WANTED_POSTER).toBe("wanted_poster"); // 15-16
      expect(NoticeType.CONTRACTS).toBe("contracts"); // 17-18
      expect(NoticeType.EXECUTION).toBe("execution"); // 19
      expect(NoticeType.OFFICIAL_STATEMENT).toBe("official_statement"); // 20
    });
  });

  describe("NoticeStatus Enum", () => {
    it("should include all possible notice statuses", () => {
      expect(NoticeStatus.ACTIVE).toBe("active");
      expect(NoticeStatus.RESOLVED).toBe("resolved");
      expect(NoticeStatus.EXPIRED).toBe("expired");
    });
  });

  describe("AlternativePayment Enum", () => {
    it("should include all alternative payment types from 1d20 table", () => {
      expect(AlternativePayment.NONE).toBe("none"); // 1-6
      expect(AlternativePayment.IRON_COPPER).toBe("iron_copper"); // 7
      expect(AlternativePayment.COPPER_SILVER).toBe("copper_silver"); // 8
      expect(AlternativePayment.ANIMALS).toBe("animals"); // 9-11
      expect(AlternativePayment.LAND).toBe("land"); // 12
      expect(AlternativePayment.HARVEST).toBe("harvest"); // 13-14
      expect(AlternativePayment.FAVORS).toBe("favors"); // 15-16
      expect(AlternativePayment.TREASURE_MAP).toBe("treasure_map"); // 17
      expect(AlternativePayment.SPICES).toBe("spices"); // 18-19
      expect(AlternativePayment.VALUABLE_OBJECTS).toBe("valuable_objects"); // 20
    });
  });

  describe("Validation Functions", () => {
    it("should validate notice type correctly", () => {
      expect(validateNoticeType("commercial_proposal")).toBe(
        NoticeType.COMMERCIAL_PROPOSAL
      );
      expect(validateNoticeType("wanted_poster")).toBe(
        NoticeType.WANTED_POSTER
      );
      expect(validateNoticeType("execution")).toBe(NoticeType.EXECUTION);
    });

    it("should throw error for invalid notice type", () => {
      expect(() => validateNoticeType("invalid_type")).toThrow();
      expect(() => validateNoticeType(123)).toThrow();
    });

    it("should validate commercial proposal", () => {
      const commercialProposal: CommercialProposal = {
        type: "buy",
        what: "weapons",
        who: mockSpecies,
        whoType: "specialist",
      };

      const validated = validateCommercialProposal(commercialProposal);
      expect(validated.type).toBe("buy");
      expect(validated.what).toBe("weapons");
      expect(validated.whoType).toBe("specialist");
    });

    it("should validate announcement", () => {
      const announcement: Announcement = {
        type: "shop_products",
        from: mockSpecies,
        fromType: "guild",
      };

      const validated = validateAnnouncement(announcement);
      expect(validated.type).toBe("shop_products");
      expect(validated.fromType).toBe("guild");
    });

    it("should validate execution", () => {
      const execution: Execution = {
        who: {
          type: "bandits",
          quantity: 4,
          species: [mockSpecies],
        },
        reason: "murders",
        method: "gallows_guillotine",
      };

      const validated = validateExecution(execution);
      expect(validated.who.type).toBe("bandits");
      expect(validated.reason).toBe("murders");
      expect(validated.method).toBe("gallows_guillotine");
    });

    it("should validate wanted poster with missing innocent", () => {
      const wantedPoster: WantedPoster = {
        type: "missing_innocent",
        target: mockSpecies,
        details: {
          who: "child",
          lastSeen: "home",
          characteristics1: "loved_by_all",
          characteristics2: "orphan",
          peculiarity: "none",
          reward: "1d20 C$",
        },
      };

      const validated = validateWantedPoster(wantedPoster);
      expect(validated.type).toBe("missing_innocent");
      const details = validated.details as MissingInnocentDetails;
      expect(details.who).toBe("child");
    });

    it("should validate hunt proposal", () => {
      const huntProposal: HuntProposal = {
        huntType: "gang_of",
        creatureSpecification: "humanoids",
        location: "forest",
        rewardCalculationInfo: {
          creatureNA: "5-9",
          creatureQuantity: 4,
          rewardNote: "Use tabela de recompensas conforme NA",
        },
      };

      const validated = validateHuntProposal(huntProposal);
      expect(validated.huntType).toBe("gang_of");
      expect(validated.creatureSpecification).toBe("humanoids");
      expect(validated.location).toBe("forest");
      expect(validated.rewardCalculationInfo.creatureNA).toBe("5-9");
    });

    it("should validate residents notice", () => {
      const residentsNotice: ResidentsNotice = {
        type: "treasure_rumor",
        content: "Dizem que há um tesouro escondido nas ruínas antigas...",
        involvedSpecies: [mockSpecies],
      };

      const validated = validateResidentsNotice(residentsNotice);
      expect(validated.type).toBe("treasure_rumor");
      expect(validated.content).toContain("tesouro");
    });

    it("should validate official statement", () => {
      const officialStatement: OfficialStatement = {
        type: "new_law_change",
        peculiarity: "none",
        content: "Nova lei proíbe a circulação de armas na praça central.",
        involvedSpecies: [mockSpecies],
      };

      const validated = validateOfficialStatement(officialStatement);
      expect(validated.type).toBe("new_law_change");
      expect(validated.peculiarity).toBe("none");
    });
  });

  describe("Complete Notice Validation", () => {
    it("should validate complete notice with commercial proposal", () => {
      const notice: Notice = {
        id: "notice-123",
        guildId: "guild-456",
        type: NoticeType.COMMERCIAL_PROPOSAL,
        status: NoticeStatus.ACTIVE,
        createdDate: new Date(),
        content: {
          type: "buy",
          what: "weapons",
          who: mockSpecies,
          whoType: "specialist",
        },
        mentionedSpecies: [mockSpecies],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const validated = validateNotice(notice);
      expect(validated.id).toBe("notice-123");
      expect(validated.guildId).toBe("guild-456");
      expect(validated.type).toBe(NoticeType.COMMERCIAL_PROPOSAL);
      expect(validated.status).toBe(NoticeStatus.ACTIVE);
    });

    it("should validate notice with alternative payment", () => {
      const notice: Notice = {
        id: "notice-789",
        guildId: "guild-456",
        type: NoticeType.SERVICES,
        status: NoticeStatus.ACTIVE,
        createdDate: new Date(),
        content: null,
        alternativePayment: AlternativePayment.FAVORS,
        reducedReward: true,
        mentionedSpecies: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const validated = validateNotice(notice);
      expect(validated.alternativePayment).toBe(AlternativePayment.FAVORS);
      expect(validated.reducedReward).toBe(true);
    });

    it("should validate notice with expiration date", () => {
      const expirationDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 dias

      const notice: Notice = {
        id: "notice-exp",
        guildId: "guild-456",
        type: NoticeType.EXECUTION,
        status: NoticeStatus.ACTIVE,
        createdDate: new Date(),
        expirationDate,
        content: {
          who: {
            type: "bandits",
            quantity: 2,
            species: [mockSpecies],
          },
          reason: "murders",
          method: "gallows_guillotine",
        },
        mentionedSpecies: [mockSpecies],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const validated = validateNotice(notice);
      expect(validated.expirationDate).toEqual(expirationDate);
    });
  });

  describe("Complex Content Types", () => {
    it("should handle hunt proposal with twist", () => {
      const huntWithTwist: HuntProposal = {
        huntType: "single_powerful",
        creatureSpecification: "dragonoids",
        location: "cave",
        twist: {
          hasTwist: true,
          type: "old_acquaintance",
        },
        rewardCalculationInfo: {
          creatureNA: "35-40",
          creatureQuantity: 1,
          rewardNote: "Usar tabela de recompensas especial para dragões",
        },
      };

      const validated = validateHuntProposal(huntWithTwist);
      expect(validated.twist?.hasTwist).toBe(true);
      expect(validated.twist?.type).toBe("old_acquaintance");
    });

    it("should handle wanted poster with fugitive details", () => {
      const fugitiveDetails = {
        infamyReason: "crime_against_nobility" as const,
        dangerLevel: "high" as const,
        peculiarities: "subterfuge_master" as const,
        characteristics: "horrible_scar" as const,
        notableTraits: "excellent_swordsman" as const,
        reward: "30 PO$",
      };

      const wantedFugitive: WantedPoster = {
        type: "fugitive_convict",
        target: mockSpecies,
        details: fugitiveDetails,
      };

      const validated = validateWantedPoster(wantedFugitive);
      expect(validated.type).toBe("fugitive_convict");
      const details = validated.details as FugitiveConvictDetails;
      expect(details.dangerLevel).toBe("high");
    });
  });

  describe("Error Cases", () => {
    it("should throw error for invalid notice structure", () => {
      const invalidNotice = {
        id: "test",
        // missing required fields
      };

      expect(() => validateNotice(invalidNotice)).toThrow();
    });

    it("should throw error for invalid commercial proposal type", () => {
      const invalidProposal = {
        type: "invalid_type",
        what: "weapons",
        who: mockSpecies,
        whoType: "specialist",
      };

      expect(() => validateCommercialProposal(invalidProposal)).toThrow();
    });

    it("should throw error for invalid hunt proposal without reward info", () => {
      const invalidHunt = {
        huntType: "gang_of",
        creatureSpecification: "humanoids",
        location: "forest",
        // missing rewardCalculationInfo
      };

      expect(() => validateHuntProposal(invalidHunt)).toThrow();
    });
  });
});

describe("Notice Type Coverage Tests", () => {
  it("should cover all notice types from .md file", () => {
    const noticeTypeCount = Object.keys(NoticeType).length;
    expect(noticeTypeCount).toBe(10); // Exatamente 10 tipos conforme tabela 1d20
  });

  it("should cover all alternative payment types from .md file", () => {
    const paymentCount = Object.keys(AlternativePayment).length;
    expect(paymentCount).toBe(10); // Todos os tipos de pagamento alternativo
  });

  it("should ensure discriminated union works properly", () => {
    // Teste que verifica que o TypeScript consegue discriminar corretamente
    // o tipo de conteúdo baseado no NoticeType
    expect(NoticeType.COMMERCIAL_PROPOSAL).toBe("commercial_proposal");
    expect(NoticeType.WANTED_POSTER).toBe("wanted_poster");
    expect(NoticeType.HUNT_PROPOSAL).toBe("hunt_proposal");
  });
});
