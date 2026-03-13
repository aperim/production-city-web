/**
 * Audit logging helper. Enforces field allowlist per action.
 * Never logs tokens, codes, or full URLs.
 */

import type { PrismaClient } from "@prisma/client";

/** Redact IPv4 to /24, IPv6 to /48. */
export function redactIp(ip: string | null | undefined): string | null {
  if (!ip) return null;

  // IPv4: e.g. 192.168.1.42 → 192.168.1.0/24
  if (ip.includes(".") && !ip.includes(":")) {
    const parts = ip.split(".");
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
    }
  }

  // IPv6: redact to /48 (first 3 groups)
  if (ip.includes(":")) {
    const groups = ip.split(":");
    if (groups.length >= 3) {
      return `${groups.slice(0, 3).join(":")}::/48`;
    }
  }

  return ip;
}

/** Allowed detail keys per audit action. */
const DETAIL_ALLOWLIST: Record<string, string[]> = {
  "auth.magic_link.requested": ["email", "suppressed", "userExists", "sent"],
  "auth.magic_link.verified": ["email", "purpose"],
  "auth.code.verified": ["email", "purpose"],
  "auth.code.failed": ["email", "remainingAttempts", "reason"],
  "auth.login": ["email", "method"],
  "auth.logout": [],
  "auth.session.expired": ["sessionId"],
  "auth.session.revoked": ["sessionId", "reason"],
  "user.created": ["email", "source"],
  "user.status_changed": ["previousStatus", "newStatus", "revokedSessionCount"],
  "user.role_changed": ["roleName", "changeType"],
  "invitation.created": ["email"],
  "invitation.revoked": ["email"],
  "invitation.resent": ["email"],
  "invitation.accepted": ["email"],
  "approval.approved": ["email"],
  "approval.rejected": ["email"],
  "media.asset.updated": ["assetId", "changes"],
  "media.asset.archived": ["assetId"],
  "media.asset.restored": ["assetId"],
  "media.pair.created": ["contentContext"],
  "media.pair.deleted": ["contentContext"],
};

/** Filter details to only allowed keys for the given action. */
function filterDetails(action: string, details: Record<string, unknown>): string {
  const allowed = DETAIL_ALLOWLIST[action];
  if (!allowed) {
    // Unknown action: strip all details
    return JSON.stringify({});
  }
  const filtered: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in details) {
      filtered[key] = details[key];
    }
  }
  return JSON.stringify(filtered);
}

export interface AuditLogEntry {
  actorId?: string | null;
  subjectId?: string | null;
  action: string;
  resource: string;
  details?: Record<string, unknown>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

/**
 * Create an audit log entry with field allowlist enforcement and IP redaction.
 */
export async function createAuditLog(
  prisma: PrismaClient,
  entry: AuditLogEntry,
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      actorId: entry.actorId ?? null,
      subjectId: entry.subjectId ?? null,
      action: entry.action,
      resource: entry.resource,
      details: entry.details ? filterDetails(entry.action, entry.details) : null,
      ipAddress: redactIp(entry.ipAddress),
      userAgent: entry.userAgent ?? null,
    },
  });
}
