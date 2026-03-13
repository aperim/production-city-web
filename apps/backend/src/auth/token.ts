/**
 * Token and code generation/verification for magic link authentication.
 * All crypto operations use Web Crypto API (available in CF Workers).
 */

import type { PrismaClient } from "@prisma/client";

/** Generate a cryptographically random token (32 bytes, base64url). */
export function generateSessionToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return base64UrlEncode(bytes);
}

/** Base64url encode a Uint8Array. */
function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const b of bytes) {
    binary += String.fromCharCode(b);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
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

/** Timing-safe comparison of two hex strings via Web Crypto. */
export async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const encoder = new TextEncoder();
  const aBytes = encoder.encode(a);
  const bBytes = encoder.encode(b);
  if (aBytes.byteLength !== bBytes.byteLength) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    crypto.getRandomValues(new Uint8Array(32)),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const [sigA, sigB] = await Promise.all([
    crypto.subtle.sign("HMAC", key, aBytes),
    crypto.subtle.sign("HMAC", key, bBytes),
  ]);
  const arrA = new Uint8Array(sigA);
  const arrB = new Uint8Array(sigB);
  let result = 0;
  for (let i = 0; i < arrA.length; i++) {
    result |= arrA[i]! ^ arrB[i]!;
  }
  return result === 0;
}

/**
 * HMAC-SHA256 keyed hash for code verification.
 * Format: HMAC(server_secret, email + purpose + id + code)
 */
export async function hmacSha256Hex(key: string, message: string): Promise<string> {
  const encoder = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Generic error for all token/code failures (anti-enumeration). */
export const TOKEN_INVALID_ERROR = {
  error: "token_invalid",
  message: "This link is invalid or has expired. Please request a new one.",
} as const;

export interface TokenVerifyResult {
  ok: true;
  magicLink: { id: string; userId: string | null; email: string; purpose: string };
}

/**
 * Verify a magic link token using atomic conditional update.
 * Returns the magic link record if valid, or null if invalid/expired/used.
 */
export async function verifyMagicLinkToken(
  prisma: PrismaClient,
  token: string,
): Promise<TokenVerifyResult | null> {
  const tokenHash = await sha256Hex(token);

  // Find the magic link
  const magicLink = await prisma.magicLink.findUnique({
    where: { tokenHash },
    select: { id: true, userId: true, email: true, purpose: true, usedAt: true, expiresAt: true },
  });

  if (!magicLink) return null;
  if (magicLink.usedAt !== null) return null;
  if (magicLink.expiresAt <= new Date()) return null;

  // Atomic consumption: UPDATE ... WHERE usedAt IS NULL AND expiresAt > now()
  const result = await prisma.magicLink.updateMany({
    where: {
      id: magicLink.id,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: { usedAt: new Date() },
  });

  // If rows affected = 0, token was consumed by another request
  if (result.count === 0) return null;

  return {
    ok: true,
    magicLink: {
      id: magicLink.id,
      userId: magicLink.userId,
      email: magicLink.email,
      purpose: magicLink.purpose,
    },
  };
}

export interface CodeVerifyResult {
  ok: true;
  magicLink: { id: string; userId: string | null; email: string; purpose: string };
}

/**
 * Verify a magic code using HMAC comparison and atomic consumption.
 * Increments attempts counter and enforces max attempts.
 */
export async function verifyMagicCode(
  prisma: PrismaClient,
  email: string,
  code: string,
  hmacSecret: string,
): Promise<{ result: CodeVerifyResult | null; remainingAttempts?: number; reason?: string }> {
  const normalizedEmail = email.toLowerCase().trim();

  // Find the most recent unused magic link for this email
  const magicLink = await prisma.magicLink.findFirst({
    where: {
      email: normalizedEmail,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      userId: true,
      email: true,
      purpose: true,
      codeHash: true,
      attempts: true,
      maxAttempts: true,
      tokenHash: true,
    },
  });

  if (!magicLink) {
    return { result: null, reason: "no_magic_link" };
  }

  if (magicLink.attempts >= magicLink.maxAttempts) {
    return { result: null, remainingAttempts: 0, reason: "max_attempts_exceeded" };
  }

  // Compute expected HMAC
  const expectedHash = await hmacSha256Hex(
    hmacSecret,
    `${normalizedEmail}${magicLink.purpose}${magicLink.tokenHash}${code}`,
  );

  const isValid = await timingSafeEqual(expectedHash, magicLink.codeHash);

  if (!isValid) {
    // Increment attempts
    await prisma.magicLink.update({
      where: { id: magicLink.id },
      data: { attempts: { increment: 1 } },
    });
    const remaining = magicLink.maxAttempts - magicLink.attempts - 1;
    return { result: null, remainingAttempts: Math.max(0, remaining), reason: "code_invalid" };
  }

  // Atomic consumption
  const result = await prisma.magicLink.updateMany({
    where: {
      id: magicLink.id,
      usedAt: null,
      expiresAt: { gt: new Date() },
    },
    data: { usedAt: new Date() },
  });

  if (result.count === 0) {
    return { result: null, reason: "already_consumed" };
  }

  return {
    result: {
      ok: true,
      magicLink: {
        id: magicLink.id,
        userId: magicLink.userId,
        email: magicLink.email,
        purpose: magicLink.purpose,
      },
    },
  };
}
