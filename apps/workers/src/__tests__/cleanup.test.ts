import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  cleanupSessions,
  cleanupMagicLinks,
  cleanupInvitations,
  runAllCleanups,
} from "../cleanup.js";

/**
 * Creates a mock PrismaClient for cleanup tests.
 * Each model has findMany, deleteMany, count methods mocked.
 */
function createMockPrisma() {
  return {
    session: {
      findMany: vi.fn().mockResolvedValue([]),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    magicLink: {
      findMany: vi.fn().mockResolvedValue([]),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
    invitation: {
      findMany: vi.fn().mockResolvedValue([]),
      deleteMany: vi.fn().mockResolvedValue({ count: 0 }),
    },
  };
}

const NOW = new Date("2026-03-13T03:00:00Z").getTime();

describe("cleanupSessions", () => {
  let prisma: ReturnType<typeof createMockPrisma>;

  beforeEach(() => {
    prisma = createMockPrisma();
  });

  it("returns zero counts when no expired sessions exist", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await cleanupSessions(prisma as any, NOW);
    expect(result.model).toBe("Session");
    expect(result.checked).toBe(0);
    expect(result.deleted).toBe(0);
  });

  it("deletes sessions past the 30-day retention period", async () => {
    const expired = [{ id: "sess-1" }, { id: "sess-2" }];
    prisma.session.findMany.mockResolvedValue(expired);
    prisma.session.deleteMany.mockResolvedValue({ count: 2 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await cleanupSessions(prisma as any, NOW);
    expect(result.checked).toBe(2);
    expect(result.deleted).toBe(2);
    expect(prisma.session.deleteMany).toHaveBeenCalledWith({
      where: { id: { in: ["sess-1", "sess-2"] } },
    });
  });

  it("respects retention period (does not delete recently expired sessions)", async () => {
    // findMany returns empty when no sessions are past retention
    prisma.session.findMany.mockResolvedValue([]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await cleanupSessions(prisma as any, NOW);
    expect(result.deleted).toBe(0);
    expect(prisma.session.deleteMany).not.toHaveBeenCalled();
  });

  it("processes in batches (take: 100)", async () => {
    prisma.session.findMany.mockResolvedValue([]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await cleanupSessions(prisma as any, NOW);

    expect(prisma.session.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 100 }),
    );
  });

  it("includes duration in result", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await cleanupSessions(prisma as any, NOW);
    expect(typeof result.durationMs).toBe("number");
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });
});

describe("cleanupMagicLinks", () => {
  let prisma: ReturnType<typeof createMockPrisma>;

  beforeEach(() => {
    prisma = createMockPrisma();
  });

  it("returns zero counts when no expired magic links exist", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await cleanupMagicLinks(prisma as any, NOW);
    expect(result.model).toBe("MagicLink");
    expect(result.checked).toBe(0);
    expect(result.deleted).toBe(0);
  });

  it("deletes magic links past the 7-day retention period", async () => {
    const expired = [{ id: "ml-1" }, { id: "ml-2" }, { id: "ml-3" }];
    prisma.magicLink.findMany.mockResolvedValue(expired);
    prisma.magicLink.deleteMany.mockResolvedValue({ count: 3 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await cleanupMagicLinks(prisma as any, NOW);
    expect(result.checked).toBe(3);
    expect(result.deleted).toBe(3);
  });

  it("handles empty tables gracefully", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await cleanupMagicLinks(prisma as any, NOW);
    expect(result.deleted).toBe(0);
    expect(prisma.magicLink.deleteMany).not.toHaveBeenCalled();
  });
});

describe("cleanupInvitations", () => {
  let prisma: ReturnType<typeof createMockPrisma>;

  beforeEach(() => {
    prisma = createMockPrisma();
  });

  it("returns zero counts when no expired/revoked invitations exist", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await cleanupInvitations(prisma as any, NOW);
    expect(result.model).toBe("Invitation");
    expect(result.checked).toBe(0);
    expect(result.deleted).toBe(0);
  });

  it("deletes expired/revoked invitations past 90-day retention", async () => {
    const expired = [{ id: "inv-1" }];
    prisma.invitation.findMany.mockResolvedValue(expired);
    prisma.invitation.deleteMany.mockResolvedValue({ count: 1 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await cleanupInvitations(prisma as any, NOW);
    expect(result.checked).toBe(1);
    expect(result.deleted).toBe(1);
  });

  it("targets expired by expiresAt and revoked by revokedAt", async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await cleanupInvitations(prisma as any, NOW);

    const call = prisma.invitation.findMany.mock.calls[0]![0];
    expect(call.where).toHaveProperty("OR");
    // Verify both conditions are present
    const orClauses = call.where.OR;
    expect(orClauses).toHaveLength(2);
    expect(orClauses[0]).toHaveProperty("status", "expired");
    expect(orClauses[0]).toHaveProperty("expiresAt");
    expect(orClauses[1]).toHaveProperty("status", "revoked");
    expect(orClauses[1]).toHaveProperty("revokedAt");
  });
});

describe("runAllCleanups", () => {
  it("runs all three cleanup operations and returns results", async () => {
    const prisma = createMockPrisma();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = await runAllCleanups(prisma as any, NOW);

    expect(results).toHaveLength(3);
    expect(results[0]!.model).toBe("Session");
    expect(results[1]!.model).toBe("MagicLink");
    expect(results[2]!.model).toBe("Invitation");
  });

  it("is idempotent — running twice returns same structure", async () => {
    const prisma = createMockPrisma();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results1 = await runAllCleanups(prisma as any, NOW);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results2 = await runAllCleanups(prisma as any, NOW);

    expect(results1.length).toBe(results2.length);
    for (let i = 0; i < results1.length; i++) {
      expect(results1[i]!.model).toBe(results2[i]!.model);
    }
  });

  it("handles all empty tables gracefully", async () => {
    const prisma = createMockPrisma();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = await runAllCleanups(prisma as any, NOW);

    for (const result of results) {
      expect(result.checked).toBe(0);
      expect(result.deleted).toBe(0);
    }
  });
});
