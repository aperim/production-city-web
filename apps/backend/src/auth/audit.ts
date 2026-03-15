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
  "profile.update": ["field", "oldValue", "newValue"],
  "session.revoke": ["sessionId"],
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
  // Category & tag audit actions
  create: ["categoryId", "name", "tagId", "announcementId", "title"],
  update: ["categoryId", "tagId", "changes", "announcementId"],
  delete: ["categoryId", "tagId", "name", "announcementId"],
  reorder: ["itemCount"],
  // Announcement lifecycle audit actions
  "announcement:publish": ["announcementId", "title", "visibility", "deliveryCount"],
  "announcement:unpublish": ["announcementId", "title", "deliveryCount"],
  "announcement:archive": ["announcementId", "title"],
  "announcement:retry_delivery": ["announcementId", "deliveryId"],
  "announcement:retry_failed": ["announcementId", "failedCount"],
  // WebSocket audit actions
  "ws_connect": ["durableObjectId", "userAgent"],
  "ws_disconnect": ["durableObjectId", "reason", "durationMs"],
  "ws_auth_failure": ["reason", "origin"],
  "ws_rate_limited": ["limitType", "currentCount"],
  "ws_channel_denied": ["channel", "missingPermission"],
  // Subscription audit actions
  "subscription:create": ["subscriptionId", "categoryId", "channel"],
  "subscription:confirm": ["subscriptionId", "channel"],
  "subscription:decline": ["subscriptionId", "channel"],
  "subscription:delete": ["subscriptionId", "channel"],
  "subscription:resend": ["subscriptionId", "channel"],
  "subscription:unsubscribe": ["subscriptionId", "channel", "categoryId"],
  // SMS audit actions
  "sms:stop": ["messageSid"],
  "sms:start": ["messageSid"],
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
