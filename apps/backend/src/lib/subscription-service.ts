/**
 * Subscription service: token generation, HMAC, confirmation, and lifecycle.
 * Uses a dedicated SUBSCRIPTION_HMAC_SECRET (not the shared HMAC_SECRET).
 */

import type { PrismaClient } from "@prisma/client";
import { hmacSha256Hex, generateToken } from "../email/service.js";

/** Expiration windows */
const EMAIL_EXPIRY_DAYS = 7;
const SMS_EXPIRY_DAYS = 14;

/** Resend rate limit: max 3 per subscription per hour */
const RESEND_LIMIT = 3;
const RESEND_WINDOW_MS = 60 * 60 * 1000;

/** Admin rate limits */
const ADMIN_SUBSCRIBE_LIMIT_PER_HOUR = 20;
const ADMIN_TARGET_USER_PENDING_LIMIT = 5;

/**
 * Generate a confirmation token and its HMAC hash.
 * Returns both the raw token (to send to user) and the hash (to store).
 */
export async function generateConfirmationToken(
  hmacSecret: string,
): Promise<{ token: string; tokenHash: string }> {
  const token = generateToken();
  const tokenHash = await hmacSha256Hex(hmacSecret, token);
  return { token, tokenHash };
}

/**
 * Hash a token with the subscription HMAC secret for lookup.
 */
export async function hashConfirmationToken(
  hmacSecret: string,
  token: string,
): Promise<string> {
  return hmacSha256Hex(hmacSecret, token);
}

/**
 * Calculate expiration date for a subscription based on channel.
 */
export function getExpirationDate(channel: "email" | "sms"): Date {
  const days = channel === "email" ? EMAIL_EXPIRY_DAYS : SMS_EXPIRY_DAYS;
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

/**
 * Check resend rate limit for a specific subscription.
 * Returns true if resend is allowed.
 */
export async function checkResendRateLimit(
  prisma: PrismaClient,
  subscriptionId: string,
): Promise<boolean> {
  const windowStart = new Date(Date.now() - RESEND_WINDOW_MS);

  // Count audit log entries for resend actions on this subscription
  const count = await prisma.auditLog.count({
    where: {
      action: "subscription:resend",
      resource: "subscription",
      details: { contains: subscriptionId },
      createdAt: { gte: windowStart },
    },
  });

  return count < RESEND_LIMIT;
}

/**
 * Check admin subscribe rate limit (per admin actor).
 * Returns true if allowed.
 */
export async function checkAdminSubscribeRateLimit(
  prisma: PrismaClient,
  adminUserId: string,
): Promise<boolean> {
  const windowStart = new Date(Date.now() - 60 * 60 * 1000);

  const count = await prisma.auditLog.count({
    where: {
      actorId: adminUserId,
      action: "subscription:create",
      resource: "subscription",
      createdAt: { gte: windowStart },
    },
  });

  return count < ADMIN_SUBSCRIBE_LIMIT_PER_HOUR;
}

/**
 * Check pending subscription limit per target user.
 * Returns true if allowed.
 */
export async function checkTargetUserPendingLimit(
  prisma: PrismaClient,
  targetUserId: string,
): Promise<boolean> {
  const count = await prisma.categorySubscription.count({
    where: {
      userId: targetUserId,
      status: "pending",
    },
  });

  return count < ADMIN_TARGET_USER_PENDING_LIMIT;
}

/**
 * Check if a phone number is SMS-suppressed.
 */
export async function isSmsSuppressed(
  prisma: PrismaClient,
  phoneNumber: string,
): Promise<boolean> {
  const suppression = await prisma.smsSuppression.findUnique({
    where: { phoneNumber },
    select: { removedAt: true },
  });
  return suppression !== null && suppression.removedAt === null;
}

/**
 * Mask a phone number for admin display.
 * Shows country code prefix + "***" + last 4 digits.
 * "+61412345678" => "+61***5678"
 */
export function maskPhoneNumber(phone: string): string {
  if (phone.length <= 7) return phone;
  const lastFour = phone.slice(-4);
  // Keep first 3 chars (e.g., "+61" or "+1.") as the visible prefix
  const prefix = phone.slice(0, 3);
  return `${prefix}***${lastFour}`;
}

/**
 * Mask an email address for admin display.
 * Shows first 2 chars + "***" + domain.
 * "user@example.com" => "us***@example.com"
 */
export function maskEmail(email: string): string {
  const atIndex = email.indexOf("@");
  if (atIndex <= 0) return "***@***";
  const local = email.slice(0, atIndex);
  const domain = email.slice(atIndex);
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}***${domain}`;
}
