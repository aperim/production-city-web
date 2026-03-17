/**
 * GET /v1/search — object search across users, productions, and facilities.
 *
 * Fuzzy matching, role-scoped, rate limited.
 * Returns flat results array with workspace field for frontend grouping.
 *
 * @see Issue #413
 */

import { Hono } from "hono";
import { authMiddleware } from "../auth/middleware.js";
import type { AuthContext } from "../auth/middleware.js";
import { resolveDashboardRole } from "../lib/permissions.js";
import { computeVisibleWorkspaces } from "../lib/workspace-resolver.js";
import { createPrismaClient } from "../lib/prisma.js";

type Bindings = {
  DB: D1Database;
  ALLOWED_ORIGIN: string;
  HMAC_SECRET: string;
};

type Variables = { auth: AuthContext };

export const searchApp = new Hono<{ Bindings: Bindings; Variables: Variables }>();

searchApp.use("/v1/search", authMiddleware());

/** Simple hash for audit logging (no plain text queries in logs). */
function hashQuery(q: string): string {
  let hash = 0;
  for (let i = 0; i < q.length; i++) {
    const ch = q.charCodeAt(i);
    hash = ((hash << 5) - hash + ch) | 0;
  }
  return Math.abs(hash).toString(36);
}

/**
 * In-memory rate limiter keyed by user ID.
 *
 * NOTE: On Cloudflare Workers, this is per-isolate and not durable across
 * cold starts or global edge distribution. For production hardening,
 * replace with Durable Objects or KV-backed rate limiting.
 * For the scaffold phase, this provides basic abuse resistance.
 */
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 30;
const RATE_WINDOW_MS = 60_000;

export function checkRateLimit(userId: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);

  if (!entry || now >= entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return { allowed: true, retryAfter: 0 };
  }

  if (entry.count >= RATE_LIMIT) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return { allowed: false, retryAfter };
  }

  entry.count++;
  return { allowed: true, retryAfter: 0 };
}

/** Case-insensitive substring match. */
function matchesQuery(text: string | null | undefined, query: string): boolean {
  if (!text) return false;
  return text.toLowerCase().includes(query.toLowerCase());
}

export interface SearchResult {
  id: string;
  type: "user" | "facility" | "production";
  title: string;
  subtitle?: string;
  workspace: string;
  url: string;
}

searchApp.get("/v1/search", async (c) => {
  const auth = c.get("auth") as AuthContext;
  const q = c.req.query("q");

  if (!q) {
    return c.json({ error: "Missing q parameter" }, 400);
  }

  // Minimum query length
  if (q.length < 2) {
    return c.json({ query: q, results: [], total: 0 });
  }

  // Rate limiting
  const rateCheck = checkRateLimit(auth.user.id);
  if (!rateCheck.allowed) {
    c.header("Retry-After", String(rateCheck.retryAfter));
    return c.json({ error: "Rate limit exceeded" }, 429);
  }

  // Determine visible workspaces for role scoping
  const dashboardRole = resolveDashboardRole(auth.permissions);
  const visibleWorkspaces = computeVisibleWorkspaces(dashboardRole, auth.permissions);
  const visibleWorkspaceIds = new Set(visibleWorkspaces.map((ws) => ws.id));

  const prisma = await createPrismaClient(c.env.DB);
  try {
    const results: SearchResult[] = [];

    // Search users (workspace: "people" or "administration")
    // NOTE: Only name and status are selected — no email, phone, or other PII.
    // Workspace visibility gates which roles can search users at all.
    // When live data integration lands, add finer-grained permission checks
    // (e.g., self-scoped HR roles should only see their own profile).
    if (visibleWorkspaceIds.has("people") || visibleWorkspaceIds.has("administration")) {
      const users = await prisma.user.findMany({
        where: { status: "active" },
        select: { id: true, name: true, status: true },
        take: 100,
      });
      for (const user of users) {
        if (matchesQuery(user.name, q)) {
          results.push({
            id: user.id,
            type: "user",
            title: user.name ?? "Unknown",
            subtitle: user.status,
            workspace: "people",
            url: `/dashboard/people/directory`,
          });
        }
      }
    }

    // Note: Productions and Facilities models don't exist in the schema yet.
    // When they are added, search will expand to include them.
    // For now, we return results from the User model only.

    // Sort by relevance (exact prefix match first, then contains)
    const lowerQ = q.toLowerCase();
    results.sort((a, b) => {
      const aPrefix = a.title.toLowerCase().startsWith(lowerQ) ? 0 : 1;
      const bPrefix = b.title.toLowerCase().startsWith(lowerQ) ? 0 : 1;
      if (aPrefix !== bPrefix) return aPrefix - bPrefix;
      return a.title.localeCompare(b.title);
    });

    // Limit results
    const limited = results.slice(0, 50);

    // Audit log (hash the query, don't store plain text)
    try {
      await prisma.auditLog.create({
        data: {
          actorId: auth.user.id,
          action: "search",
          resource: "search",
          details: JSON.stringify({
            queryHash: hashQuery(q),
            resultCount: limited.length,
            timestamp: new Date().toISOString(),
          }),
        },
      });
    } catch {
      // Non-critical — don't fail the search if audit logging fails
    }

    c.header("Cache-Control", "private, no-store");

    return c.json({
      query: q,
      results: limited,
      total: limited.length,
    });
  } finally {
    await prisma.$disconnect();
  }
});
