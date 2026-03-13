/**
 * Scheduled cleanup worker for expired sessions, magic links, and invitations.
 * Runs as a Cloudflare Cron Trigger at 03:00 UTC daily.
 *
 * All operations are idempotent and safe to retry.
 * Processes records in batches to avoid D1 timeout.
 */

import type { PrismaClient } from "@prisma/client";

/** Batch size for each cleanup operation. */
const BATCH_SIZE = 100;

/** Retention periods in milliseconds. */
const RETENTION = {
  /** Sessions: 30 days past expiry or revocation. */
  session: 30 * 24 * 60 * 60 * 1000,
  /** Magic links: 7 days past expiry or use. */
  magicLink: 7 * 24 * 60 * 60 * 1000,
  /** Invitations: 90 days for expired/revoked status. */
  invitation: 90 * 24 * 60 * 60 * 1000,
} as const;

export interface CleanupResult {
  model: string;
  checked: number;
  deleted: number;
  durationMs: number;
}

/**
 * Cleans up expired sessions past the retention period.
 * Deletes sessions where:
 * - expiresAt < now - 30 days, OR
 * - revokedAt IS NOT NULL AND revokedAt < now - 30 days
 */
export async function cleanupSessions(
  prisma: PrismaClient,
  nowMs?: number,
): Promise<CleanupResult> {
  const start = Date.now();
  const now = nowMs ?? Date.now();
  const cutoff = new Date(now - RETENTION.session);

  // Find candidates: expired OR revoked, past retention
  const candidates = await prisma.session.findMany({
    where: {
      OR: [
        { expiresAt: { lt: cutoff } },
        { revokedAt: { not: null, lt: cutoff } },
      ],
    },
    select: { id: true },
    take: BATCH_SIZE,
  });

  if (candidates.length === 0) {
    return { model: "Session", checked: 0, deleted: 0, durationMs: Date.now() - start };
  }

  const ids = candidates.map((c) => c.id);
  const result = await prisma.session.deleteMany({
    where: { id: { in: ids } },
  });

  return {
    model: "Session",
    checked: candidates.length,
    deleted: result.count,
    durationMs: Date.now() - start,
  };
}

/**
 * Cleans up used/expired magic links past the retention period.
 * Deletes magic links where:
 * - expiresAt < now - 7 days, OR
 * - usedAt IS NOT NULL AND usedAt < now - 7 days
 */
export async function cleanupMagicLinks(
  prisma: PrismaClient,
  nowMs?: number,
): Promise<CleanupResult> {
  const start = Date.now();
  const now = nowMs ?? Date.now();
  const cutoff = new Date(now - RETENTION.magicLink);

  const candidates = await prisma.magicLink.findMany({
    where: {
      OR: [
        { expiresAt: { lt: cutoff } },
        { usedAt: { not: null, lt: cutoff } },
      ],
    },
    select: { id: true },
    take: BATCH_SIZE,
  });

  if (candidates.length === 0) {
    return { model: "MagicLink", checked: 0, deleted: 0, durationMs: Date.now() - start };
  }

  const ids = candidates.map((c) => c.id);
  const result = await prisma.magicLink.deleteMany({
    where: { id: { in: ids } },
  });

  return {
    model: "MagicLink",
    checked: candidates.length,
    deleted: result.count,
    durationMs: Date.now() - start,
  };
}

/**
 * Cleans up expired/revoked invitations past the retention period.
 * Uses the relevant status-change timestamp for retention:
 * - expired: expiresAt (when it actually expired) < now - 90 days
 * - revoked: revokedAt (when admin revoked it) < now - 90 days
 */
export async function cleanupInvitations(
  prisma: PrismaClient,
  nowMs?: number,
): Promise<CleanupResult> {
  const start = Date.now();
  const now = nowMs ?? Date.now();
  const cutoff = new Date(now - RETENTION.invitation);

  const candidates = await prisma.invitation.findMany({
    where: {
      OR: [
        { status: "expired", expiresAt: { lt: cutoff } },
        { status: "revoked", revokedAt: { not: null, lt: cutoff } },
      ],
    },
    select: { id: true },
    take: BATCH_SIZE,
  });

  if (candidates.length === 0) {
    return { model: "Invitation", checked: 0, deleted: 0, durationMs: Date.now() - start };
  }

  const ids = candidates.map((c) => c.id);
  const result = await prisma.invitation.deleteMany({
    where: { id: { in: ids } },
  });

  return {
    model: "Invitation",
    checked: candidates.length,
    deleted: result.count,
    durationMs: Date.now() - start,
  };
}

/**
 * Runs all cleanup operations and returns structured results.
 */
export async function runAllCleanups(
  prisma: PrismaClient,
  nowMs?: number,
): Promise<CleanupResult[]> {
  const results: CleanupResult[] = [];

  results.push(await cleanupSessions(prisma, nowMs));
  results.push(await cleanupMagicLinks(prisma, nowMs));
  results.push(await cleanupInvitations(prisma, nowMs));

  return results;
}
