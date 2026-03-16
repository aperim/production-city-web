/**
 * Email service: orchestrates sending, rate limiting, suppression checking,
 * delivery tracking, and anti-enumeration.
 */

import type { PrismaClient } from "@prisma/client";
import { t } from "../i18n/index.js";
import { sendEmail } from "./postmark.js";
import type { PostmarkSendRequest } from "./postmark.js";
import {
  renderMagicLinkHtml,
  renderMagicLinkText,
} from "./templates/magic-link.js";
import {
  renderInvitationHtml,
  renderInvitationText,
  validateInvitationMessage,
} from "./templates/invitation.js";

/** Rate limit: max requests per email per window. */
const EMAIL_RATE_LIMIT = 3;
/** Rate limit: max requests per IP per window. */
const IP_RATE_LIMIT = 10;
/** Rate limit window in milliseconds (10 minutes). */
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

/** Sender address for transactional emails. */
const FROM_ADDRESS = "Production City <noreply@production.city>";

/**
 * Generates a cryptographically random opaque requestId (32 bytes, base64url).
 */
export function generateRequestId(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

/**
 * Generates a cryptographically random 6-digit code.
 */
export function generateCode(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  // Modulo 1_000_000 gives 0-999999, pad to 6 digits
  const value = array[0]!;
  return String(value % 1_000_000).padStart(6, "0");
}

/**
 * Generates a cryptographically random token (32 bytes, base64url).
 */
export function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

/** SHA-256 hash of a string, returned as hex. */
export async function sha256Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * HMAC-SHA256 of a message using the given key.
 * Used for code hashing: HMAC(server_secret, email + purpose + id + code).
 */
export async function hmacSha256Hex(
  key: string,
  message: string,
): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    encoder.encode(message),
  );
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Base64url encode a Uint8Array. */
function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export interface RateLimitResult {
  allowed: boolean;
  retryAfterSeconds?: number;
}

/**
 * Check email-based rate limit: max 3 magic link requests per email per 10 minutes.
 */
export async function checkEmailRateLimit(
  prisma: PrismaClient,
  email: string,
  nowMs?: number,
): Promise<RateLimitResult> {
  const now = nowMs ?? Date.now();
  const windowStart = new Date(now - RATE_LIMIT_WINDOW_MS);

  const count = await prisma.magicLink.count({
    where: {
      email: email.toLowerCase().trim(),
      createdAt: { gte: windowStart },
    },
  });

  if (count >= EMAIL_RATE_LIMIT) {
    // Calculate retry-after: time until oldest record in window expires
    const oldest = await prisma.magicLink.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        createdAt: { gte: windowStart },
      },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    });
    const retryAfterMs = oldest
      ? RATE_LIMIT_WINDOW_MS - (now - oldest.createdAt.getTime())
      : RATE_LIMIT_WINDOW_MS;
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(Math.max(retryAfterMs, 0) / 1000),
    };
  }

  return { allowed: true };
}

/**
 * Check IP-based rate limit: max 10 magic link requests per IP per 10 minutes.
 * Uses MagicLink records with ipAddress field tracked via AuditLog.
 * For simplicity, counts AuditLog entries for magic_link_request by IP.
 */
export async function checkIpRateLimit(
  prisma: PrismaClient,
  ipAddress: string,
  nowMs?: number,
): Promise<RateLimitResult> {
  const now = nowMs ?? Date.now();
  const windowStart = new Date(now - RATE_LIMIT_WINDOW_MS);

  const count = await prisma.auditLog.count({
    where: {
      action: "magic_link_request",
      ipAddress,
      createdAt: { gte: windowStart },
    },
  });

  if (count >= IP_RATE_LIMIT) {
    const oldest = await prisma.auditLog.findFirst({
      where: {
        action: "magic_link_request",
        ipAddress,
        createdAt: { gte: windowStart },
      },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true },
    });
    const retryAfterMs = oldest
      ? RATE_LIMIT_WINDOW_MS - (now - oldest.createdAt.getTime())
      : RATE_LIMIT_WINDOW_MS;
    return {
      allowed: false,
      retryAfterSeconds: Math.ceil(Math.max(retryAfterMs, 0) / 1000),
    };
  }

  return { allowed: true };
}

/**
 * Check if an email is suppressed (hard bounce or spam complaint).
 */
export async function isEmailSuppressed(
  prisma: PrismaClient,
  email: string,
): Promise<boolean> {
  const suppression = await prisma.emailSuppression.findUnique({
    where: { email: email.toLowerCase().trim() },
    select: { removedAt: true },
  });
  // Suppressed if exists and not removed
  return suppression !== null && suppression.removedAt === null;
}

export interface MagicLinkRequest {
  email: string;
  ipAddress: string;
  userAgent?: string;
}

export interface MagicLinkResponse {
  requestId: string;
  status: string;
  message: string;
  deliveryToken: string;
}

export interface SendMagicLinkDeps {
  prisma: PrismaClient;
  postmarkApiToken: string;
  hmacSecret: string;
  baseUrl: string;
}

/**
 * Handles a magic link login request with full anti-enumeration, rate limiting,
 * suppression checking, and email sending.
 *
 * ALWAYS returns the same success response regardless of whether the email is
 * registered, suppressed, or otherwise undeliverable.
 */
export async function handleMagicLinkRequest(
  deps: SendMagicLinkDeps,
  request: MagicLinkRequest,
): Promise<{ status: 200 | 429; body: MagicLinkResponse | { error: string; retryAfter: number; message: string } }> {
  const { prisma, postmarkApiToken, hmacSecret, baseUrl } = deps;
  const email = request.email.toLowerCase().trim();

  // Check email rate limit
  const emailLimit = await checkEmailRateLimit(prisma, email);
  if (!emailLimit.allowed) {
    return {
      status: 429,
      body: {
        error: "rate_limited",
        retryAfter: emailLimit.retryAfterSeconds!,
        message: t("errors.rateLimited"),
      },
    };
  }

  // Check IP rate limit
  const ipLimit = await checkIpRateLimit(prisma, request.ipAddress);
  if (!ipLimit.allowed) {
    return {
      status: 429,
      body: {
        error: "rate_limited",
        retryAfter: ipLimit.retryAfterSeconds!,
        message: t("errors.rateLimited"),
      },
    };
  }

  // Generate token, code, requestId
  const token = generateToken();
  const code = generateCode();
  const requestId = generateRequestId();

  const tokenHash = await sha256Hex(token);
  const requestIdHash = await sha256Hex(requestId);

  // Look up the user
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, status: true },
  });

  // Check for pending invitation (for unregistered users)
  const pendingInvitation = user
    ? null
    : await prisma.invitation.findFirst({
        where: { email, status: "pending" },
        select: { id: true },
      });

  // Check suppression
  const suppressed = await isEmailSuppressed(prisma, email);

  // Determine if we should actually send
  const shouldSend = !suppressed && (user !== null || pendingInvitation !== null);
  const purpose = "login";

  if (!shouldSend) {
    console.warn(JSON.stringify({
      event: "email.magic_link.skipped",
      reason: suppressed ? "email_suppressed" : "no_user_or_invitation",
      email: email.replace(/^(.{1,2}).*(@.*)$/, "$1***$2"),
    }));
  }

  // Create MagicLink record regardless (for rate limiting tracking)
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  const codeHash = await hmacSha256Hex(
    hmacSecret,
    `${email}${purpose}${requestIdHash}${code}`,
  );

  const deliveryToken = crypto.randomUUID();

  await prisma.magicLink.create({
    data: {
      userId: user?.id ?? null,
      email,
      tokenHash,
      codeHash,
      purpose,
      deliveryStatus: shouldSend ? "sending" : "pending",
      expiresAt,
      deliveryToken,
    },
  });

  // Log the request in AuditLog (for IP rate limiting)
  await prisma.auditLog.create({
    data: {
      actorId: user?.id ?? null,
      action: "magic_link_request",
      resource: "magic_link",
      ipAddress: request.ipAddress,
      userAgent: request.userAgent,
      details: JSON.stringify({
        email,
        suppressed,
        userExists: user !== null,
        sent: shouldSend,
      }),
    },
  });

  // Send email if appropriate
  if (shouldSend) {
    const magicLinkUrl = `${baseUrl}/auth/verify?token=${encodeURIComponent(token)}`;

    const postmarkRequest: PostmarkSendRequest = {
      From: FROM_ADDRESS,
      To: email,
      Subject: t("email.magicLink.subject"),
      HtmlBody: renderMagicLinkHtml({
        magicLinkUrl,
        code,
        expiresIn: "15 minutes",
      }),
      TextBody: renderMagicLinkText({
        magicLinkUrl,
        code,
        expiresIn: "15 minutes",
      }),
      MessageStream: "outbound",
      Tag: "magic-link-login",
    };

    const result = await sendEmail(postmarkApiToken, postmarkRequest);

    // Update magic link with postmark message ID and status
    if (result.ok) {
      await prisma.magicLink.update({
        where: { tokenHash },
        data: {
          postmarkMessageId: result.data.MessageID,
          deliveryStatus: "sent",
        },
      });
    } else {
      await prisma.magicLink.update({
        where: { tokenHash },
        data: { deliveryStatus: "failed" },
      });
      console.error(
        JSON.stringify({
          event: "email.send.failed",
          errorCode: result.error.ErrorCode,
          errorMessage: result.error.Message,
        }),
      );
    }
  }

  // Anti-enumeration: always return the same response
  // Include deliveryToken for WebSocket delivery status tracking
  return {
    status: 200,
    body: {
      requestId,
      status: "sending",
      message: t("auth.login.checkEmail"),
      deliveryToken,
    },
  };
}

export interface InvitationEmailRequest {
  email: string;
  inviterName: string;
  message?: string;
  token: string;
  code: string;
  magicLinkUrl: string;
  expiresIn: string;
}

/**
 * Sends an invitation email via Postmark.
 */
export async function sendInvitationEmail(
  postmarkApiToken: string,
  request: InvitationEmailRequest,
): Promise<{ ok: boolean; messageId?: string; error?: string }> {
  // Validate invitation message if present
  if (request.message) {
    const validation = validateInvitationMessage(request.message);
    if (!validation.valid) {
      return { ok: false, error: validation.reason };
    }
  }

  const postmarkRequest: PostmarkSendRequest = {
    From: FROM_ADDRESS,
    To: request.email,
    Subject: t("email.invitation.subject"),
    HtmlBody: renderInvitationHtml({
      inviterName: request.inviterName,
      message: request.message,
      magicLinkUrl: request.magicLinkUrl,
      code: request.code,
      expiresIn: request.expiresIn,
    }),
    TextBody: renderInvitationText({
      inviterName: request.inviterName,
      message: request.message,
      magicLinkUrl: request.magicLinkUrl,
      code: request.code,
      expiresIn: request.expiresIn,
    }),
    MessageStream: "outbound",
    Tag: "invitation",
  };

  const result = await sendEmail(postmarkApiToken, postmarkRequest);
  if (result.ok) {
    return { ok: true, messageId: result.data.MessageID };
  }
  return { ok: false, error: result.error.Message };
}

/**
 * Invalidates all existing unused magic links for a given email and purpose.
 * Must be called before creating a new magic link for resend.
 */
export async function invalidatePreviousMagicLinks(
  prisma: PrismaClient,
  email: string,
  purpose: string,
): Promise<number> {
  const result = await prisma.magicLink.updateMany({
    where: {
      email: email.toLowerCase().trim(),
      purpose,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: { usedAt: new Date() },
  });
  return result.count;
}
