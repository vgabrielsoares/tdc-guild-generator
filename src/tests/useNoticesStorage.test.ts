import { describe, it, expect, beforeEach, vi } from "vitest";
import { useNoticesStorage } from "@/composables/useNoticesStorage";
import type { Notice } from "@/types/notice";
import { NoticeType, NoticeStatus } from "@/types/notice";

// Mock do useStorageAdapter
vi.mock("@/composables/useStorageAdapter", () => ({
  useStorageAdapter: () => ({
    list: vi.fn().mockResolvedValue([]),
    get: vi.fn().mockResolvedValue(null),
    put: vi.fn().mockResolvedValue(undefined),
    del: vi.fn().mockResolvedValue(undefined),
  }),
}));

// Mock do deserializeData
vi.mock("@/utils/storage", () => ({
  deserializeData: vi.fn((data) => JSON.parse(data)),
}));

describe("useNoticesStorage", () => {
  let storage: ReturnType<typeof useNoticesStorage>;

  beforeEach(async () => {
    // Reset da instância singleton
    vi.clearAllMocks();
    storage = useNoticesStorage();

    // Limpar todos os dados antes de cada teste
    await storage.clearAllNotices();
    await storage.setCurrentGuild(null);
  });

  it("should create storage instance with default state", () => {
    expect(storage.guildNotices).toEqual({});
    expect(storage.currentGuildId).toBeNull();
    expect(storage.globalLastUpdate).toBeNull();
  });

  it("should add notice correctly", async () => {
    const testNotice: Notice = {
      id: "test-notice-1",
      guildId: "test-guild",
      type: NoticeType.RESIDENTS_NOTICE,
      status: NoticeStatus.ACTIVE,
      createdDate: new Date(),
      content: null,
      mentionedSpecies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await storage.addNotice(testNotice);

    const notices = storage.getNoticesForGuild("test-guild");
    expect(notices).toHaveLength(1);
    expect(notices[0].id).toBe("test-notice-1");
  });

  it("should remove notice correctly", async () => {
    const testNotice: Notice = {
      id: "test-notice-2",
      guildId: "test-guild-remove",
      type: NoticeType.COMMERCIAL_PROPOSAL,
      status: NoticeStatus.ACTIVE,
      createdDate: new Date(),
      content: null,
      mentionedSpecies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await storage.addNotice(testNotice);
    expect(storage.getNoticesForGuild("test-guild-remove")).toHaveLength(1);

    await storage.removeNotice("test-notice-2", "test-guild-remove");
    expect(storage.getNoticesForGuild("test-guild-remove")).toHaveLength(0);
  });

  it("should update notice correctly", async () => {
    const testNotice: Notice = {
      id: "test-notice-3",
      guildId: "test-guild-update",
      type: NoticeType.WANTED_POSTER,
      status: NoticeStatus.ACTIVE,
      createdDate: new Date(),
      content: null,
      mentionedSpecies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await storage.addNotice(testNotice);

    const updatedNotice = {
      ...testNotice,
      status: NoticeStatus.RESOLVED,
    };

    await storage.updateNotice(updatedNotice);

    const notices = storage.getNoticesForGuild("test-guild-update");
    expect(notices[0].status).toBe(NoticeStatus.RESOLVED);
  });

  it("should handle multiple guilds correctly", async () => {
    const notice1: Notice = {
      id: "notice-guild1",
      guildId: "guild-1",
      type: NoticeType.EXECUTION,
      status: NoticeStatus.ACTIVE,
      createdDate: new Date(),
      content: null,
      mentionedSpecies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const notice2: Notice = {
      id: "notice-guild2",
      guildId: "guild-2",
      type: NoticeType.HUNT_PROPOSAL,
      status: NoticeStatus.ACTIVE,
      createdDate: new Date(),
      content: null,
      mentionedSpecies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await storage.addNotice(notice1);
    await storage.addNotice(notice2);

    expect(storage.getNoticesForGuild("guild-1")).toHaveLength(1);
    expect(storage.getNoticesForGuild("guild-2")).toHaveLength(1);
    expect(storage.getNoticesForGuild("guild-1")[0].id).toBe("notice-guild1");
    expect(storage.getNoticesForGuild("guild-2")[0].id).toBe("notice-guild2");
  });

  it("should set current guild correctly", async () => {
    await storage.setCurrentGuild("current-guild-test");
    expect(storage.currentGuildId).toBe("current-guild-test");

    await storage.setCurrentGuild(null);
    expect(storage.currentGuildId).toBeNull();
  });

  it("should get guild info correctly", async () => {
    const testNotice: Notice = {
      id: "test-notice-info",
      guildId: "info-guild",
      type: NoticeType.ANNOUNCEMENT,
      status: NoticeStatus.ACTIVE,
      createdDate: new Date(),
      content: null,
      mentionedSpecies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await storage.addNotice(testNotice);

    const guildInfo = storage.getGuildInfo("info-guild");
    expect(guildInfo).toBeTruthy();
    expect(guildInfo!.guildId).toBe("info-guild");
    expect(guildInfo!.notices).toHaveLength(1);
    expect(guildInfo!.generationCount).toBe(0);
  });

  it("should handle load function without errors", async () => {
    await expect(storage.load()).resolves.not.toThrow();
  });

  it("should handle persist function without errors", async () => {
    await expect(storage.persist()).resolves.not.toThrow();
  });

  it("should clear all notices correctly", async () => {
    const testNotice: Notice = {
      id: "test-clear",
      guildId: "clear-guild",
      type: NoticeType.SERVICES,
      status: NoticeStatus.ACTIVE,
      createdDate: new Date(),
      content: null,
      mentionedSpecies: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await storage.addNotice(testNotice);
    expect(storage.getNoticesForGuild("clear-guild")).toHaveLength(1);

    await storage.clearAllNotices();
    expect(storage.getNoticesForGuild("clear-guild")).toHaveLength(0);
  });

  it("should have timeline integration methods", () => {
    expect(typeof storage.configureTimelineIntegration).toBe("function");
    expect(typeof storage.processTimelineEvents).toBe("function");
  });
});
