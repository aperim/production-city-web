/**
 * Session management: creation, validation, sliding expiry, and revocation.
 */

import type { PrismaClient } from "@prisma/client";
import { generateSessionToken, sha256Hex } from "./token.js";

/** Session hard limit: 90 days */
const SESSION_HARD_LIMIT_MS = 90 * 24 * 60 * 60 * 1000;
/** Session idle limit: 30 days */
const SESSION_IDLE_LIMIT_MS = 30 * 24 * 60 * 60 * 1000;
/** Sliding window: update lastActiveAt at most once per 5 minutes */
const SLIDING_THROTTLE_MS = 5 * 60 * 1000;

/**
 * Cookie name: __Secure- prefix requires Secure but allows Domain,
 * enabling the cookie to be shared between production.city and api.production.city.
 */
export const SESSION_COOKIE_NAME = "__Secure-session";
/** Max-Age in seconds (90 days) */
export const SESSION_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;

export interface SessionCreateResult {
  token: string;
  sessionId: string;
  expiresAt: Date;
}

/**
 * Creates a new session for the given user.
 * Stores SHA-256 hash of token in database.
 */
export async function createSession(
  prisma: PrismaClient,
  userId: string,
  ipAddress?: string,
  userAgent?: string,
): Promise<SessionCreateResult> {
  const token = generateSessionToken();
  const tokenHash = await sha256Hex(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_HARD_LIMIT_MS);

  const session = await prisma.session.create({
    data: {
      userId,
      token: tokenHash,
      ipAddress: ipAddress ?? null,
      userAgent: userAgent ?? null,
      expiresAt,
      lastActiveAt: now,
    },
  });

  return { token, sessionId: session.id, expiresAt };
}

export interface ValidatedSession {
  sessionId: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  lastActiveAt: Date;
}

/**
 * Validates a session token. Checks:
 * 1. Token hash exists in database
 * 2. Session is not revoked
 * 3. Hard expiry not exceeded (90 days)
 * 4. Idle expiry not exceeded (30 days)
 * 5. Updates lastActiveAt if throttle window passed
 */
export async function validateSession(
  prisma: PrismaClient,
  token: string,
  now?: Date,
): Promise<ValidatedSession | null> {
  const tokenHash = await sha256Hex(token);
  const currentTime = now ?? new Date();

  const session = await prisma.session.findUnique({
    where: { token: tokenHash },
    select: {
      id: true,
      userId: true,
      createdAt: true,
      expiresAt: true,
      lastActiveAt: true,
      revokedAt: true,
    },
  });

  if (!session) return null;
  if (session.revokedAt !== null) return null;
  if (session.expiresAt <= currentTime) return null;

  // Idle check: 30 days since last active
  const idleMs = currentTime.getTime() - session.lastActiveAt.getTime();
  if (idleMs > SESSION_IDLE_LIMIT_MS) return null;

  // Sliding expiry: update lastActiveAt at most once per 5 minutes
  if (idleMs > SLIDING_THROTTLE_MS) {
    await prisma.session.update({
      where: { id: session.id },
      data: { lastActiveAt: currentTime },
    });
  }

  return {
    sessionId: session.id,
    userId: session.userId,
    createdAt: session.createdAt,
    expiresAt: session.expiresAt,
    lastActiveAt: session.lastActiveAt,
  };
}

/**
 * Revokes a single session by ID.
 */
export async function revokeSession(
  prisma: PrismaClient,
  sessionId: string,
): Promise<boolean> {
  const result = await prisma.session.updateMany({
    where: { id: sessionId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  return result.count > 0;
}

/**
 * Revokes all active sessions for a user.
 * Returns the count of revoked sessions.
 */
export async function revokeAllUserSessions(
  prisma: PrismaClient,
  userId: string,
): Promise<number> {
  const result = await prisma.session.updateMany({
    where: { userId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
  return result.count;
}

/**
 * Builds the session cookie string with security attributes.
 * __Secure- prefix: HttpOnly, Secure, SameSite=Lax, Domain=production.city, Path=/.
 * Domain is set so the cookie is shared between production.city and api.production.city.
 */
export function buildSessionCookie(token: string, maxAge: number = SESSION_MAX_AGE_SECONDS): string {
  return `${SESSION_COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Domain=production.city; Path=/; Max-Age=${maxAge}`;
}

/**
 * Builds a cookie string that clears the session cookie.
 */
export function buildClearSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Domain=production.city; Path=/; Max-Age=0`;
}

/**
 * Extract session token from cookie header.
 */
export function extractSessionToken(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.split("=");
    if (name?.trim() === SESSION_COOKIE_NAME) {
      return valueParts.join("=").trim() || null;
    }
  }
  return null;
}
