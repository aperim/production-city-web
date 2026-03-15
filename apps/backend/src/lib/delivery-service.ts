/**
 * Delivery enqueue service.
 * Called from the publish endpoint to enqueue delivery jobs for all confirmed subscribers.
 * Queue messages contain ONLY IDs — no PII.
 */

import type { PrismaClient } from "@prisma/client";

/** Queue message schema for announcement delivery. */
export interface AnnouncementDeliveryJob {
  type: "announcement_delivery";
  version: "1.0.0";
  idempotencyKey: string;
  correlationId: string;
  payload: {
    deliveryId: string;
    announcementId: string;
    subscriptionId: string;
    userId: string;
    channel: "email" | "sms";
  };
}

export interface DeliveryEnqueueResult {
  totalSubscribers: number;
  deliveryCount: number;
  suppressedCount: number;
  roleExcludedCount?: number;
}

/** Batch size for queue enqueue operations. */
const ENQUEUE_BATCH_SIZE = 50;

/**
 * Enqueue delivery jobs for all confirmed subscribers of an announcement.
 * Deduplicates by (userId, channel) — one delivery per user per channel.
 * Checks email/SMS suppression before creating delivery records.
 *
 * @param prisma - Prisma client
 * @param queue - Cloudflare Queue producer
 * @param announcementId - The announcement being published
 * @param categoryIds - The announcement's category IDs
 * @param visibility - "public" or "private"
 * @param roleIds - Role IDs for private announcements
 */
export async function enqueueDeliveries(
  prisma: PrismaClient,
  queue: { send: (message: unknown) => Promise<void> },
  announcementId: string,
  categoryIds: string[],
  visibility: string,
  roleIds: string[],
): Promise<DeliveryEnqueueResult> {
  // 1. Find all confirmed subscriptions for these categories
  const subscriptions = await prisma.categorySubscription.findMany({
    where: {
      categoryId: { in: categoryIds },
      status: "confirmed",
      user: { status: "active" },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          phone: true,
          userRoles: { select: { roleId: true } },
        },
      },
    },
  });

  const totalSubscribers = new Set(subscriptions.map((s) => s.userId)).size;

  // 2. For private announcements, filter by role
  let roleExcludedCount = 0;
  let filtered = subscriptions;
  if (visibility === "private" && roleIds.length > 0) {
    const roleIdSet = new Set(roleIds);
    filtered = subscriptions.filter((sub) => {
      const userRoleIds = sub.user.userRoles.map((r: { roleId: string }) => r.roleId);
      return userRoleIds.some((rid) => roleIdSet.has(rid));
    });
    roleExcludedCount = subscriptions.length - filtered.length;
  }

  // 3. Deduplicate by (userId, channel)
  const seen = new Set<string>();
  const unique = filtered.filter((sub) => {
    const key = `${sub.userId}:${sub.channel}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // 4. Check suppressions
  let suppressedCount = 0;
  const toDeliver: typeof unique = [];

  // Load suppression lists
  const emailAddresses = unique
    .filter((s) => s.channel === "email")
    .map((s) => s.user.email.toLowerCase().trim());
  const phoneNumbers = unique
    .filter((s) => s.channel === "sms" && s.user.phone)
    .map((s) => s.user.phone!);

  const emailSuppressions = emailAddresses.length > 0
    ? await prisma.emailSuppression.findMany({
        where: { email: { in: emailAddresses }, removedAt: null },
        select: { email: true },
      })
    : [];
  const suppressedEmails = new Set(emailSuppressions.map((s) => s.email));

  const smsSuppressions = phoneNumbers.length > 0
    ? await prisma.smsSuppression.findMany({
        where: { phoneNumber: { in: phoneNumbers }, removedAt: null },
        select: { phoneNumber: true },
      })
    : [];
  const suppressedPhones = new Set(smsSuppressions.map((s) => s.phoneNumber));

  for (const sub of unique) {
    if (sub.channel === "email" && suppressedEmails.has(sub.user.email.toLowerCase().trim())) {
      suppressedCount++;
      continue;
    }
    if (sub.channel === "sms") {
      if (!sub.user.phone) {
        suppressedCount++;
        continue;
      }
      if (suppressedPhones.has(sub.user.phone)) {
        suppressedCount++;
        continue;
      }
    }
    toDeliver.push(sub);
  }

  // 5. Create delivery records and enqueue jobs in batches
  const jobs: AnnouncementDeliveryJob[] = [];

  for (const sub of toDeliver) {
    // Create delivery record — unique constraint prevents duplicates from double-publish
    try {
      const delivery = await prisma.announcementDelivery.create({
        data: {
          announcementId,
          subscriptionId: sub.id,
          userId: sub.userId,
          channel: sub.channel,
          status: "queued",
        },
      });

      jobs.push({
        type: "announcement_delivery",
        version: "1.0.0",
        idempotencyKey: delivery.id,
        correlationId: announcementId,
        payload: {
          deliveryId: delivery.id,
          announcementId,
          subscriptionId: sub.id,
          userId: sub.userId,
          channel: sub.channel as "email" | "sms",
        },
      });
    } catch (err: unknown) {
      // Unique constraint violation — delivery already exists (double-publish protection)
      if (err && typeof err === "object" && "code" in err && err.code === "P2002") {
        continue;
      }
      throw err;
    }
  }

  // Enqueue in batches
  for (let i = 0; i < jobs.length; i += ENQUEUE_BATCH_SIZE) {
    const batch = jobs.slice(i, i + ENQUEUE_BATCH_SIZE);
    await Promise.all(batch.map((job) => queue.send(job)));
  }

  return {
    totalSubscribers,
    deliveryCount: jobs.length,
    suppressedCount,
    roleExcludedCount: visibility === "private" ? roleExcludedCount : undefined,
  };
}
