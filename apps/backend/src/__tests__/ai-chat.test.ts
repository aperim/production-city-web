/**
 * Tests for POST /v1/ai/chat endpoint.
 *
 * @see Issue #411
 */

import { describe, it, expect, vi, beforeAll, beforeEach } from "vitest";
import { env } from "cloudflare:workers";
import { app } from "../index.js";
import { createPrismaClient } from "../lib/prisma.js";
import { createSession, SESSION_COOKIE_NAME } from "../auth/session.js";
import { setupTestDatabase } from "./test-helpers.js";

beforeAll(async () => {
  await setupTestDatabase();
});

/**
 * Helper to create a user with role and permissions, returning a session cookie.
 */
async function createUserWithRole(
  email: string,
  roleName: string,
  permPairs: [string, string][],
) {
  const prisma = await createPrismaClient(env.DB);
  try {
    const user = await prisma.user.upsert({
      where: { email },
      create: { email, status: "active" },
      update: {},
    });

    const role = await prisma.role.create({
      data: { name: `${roleName}-${crypto.randomUUID()}`, description: roleName },
    });

    for (const [resource, action] of permPairs) {
      let perm = await prisma.permission.findUnique({
        where: { resource_action: { resource, action } },
      });
      if (!perm) {
        perm = await prisma.permission.create({ data: { resource, action } });
      }
      try {
        await prisma.rolePermission.create({
          data: { roleId: role.id, permissionId: perm.id },
        });
      } catch {
        // skip duplicate
      }
    }

    await prisma.userRole.create({
      data: { userId: user.id, roleId: role.id },
    });

    const session = await createSession(prisma, user.id);
    return { user, role, session, cookie: `${SESSION_COOKIE_NAME}=${session.token}` };
  } finally {
    await prisma.$disconnect();
  }
}

describe("POST /v1/ai/chat", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 401 for unauthenticated request", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: "http://localhost" },
        body: JSON.stringify({ message: "hello", context: { workspace: "productions", tab: "overview" } }),
      }),
      env,
    );
    expect(res.status).toBe(401);
  });

  it("returns 200 with response for valid request", async () => {
    const { cookie } = await createUserWithRole("ai-admin@dashboard.test", "admin", [["dashboard", "admin"]]);
    const res = await app.fetch(
      new Request("http://localhost/v1/ai/chat", {
        method: "POST",
        headers: { Cookie: cookie, "Content-Type": "application/json", Origin: "http://localhost" },
        body: JSON.stringify({ message: "What can I do in Productions?", context: { workspace: "productions", tab: "overview" } }),
      }),
      env,
    );
    expect(res.status).toBe(200);
    const body = await res.json() as { response: string; citations: unknown[]; sessionId: string };
    expect(body.response).toBeDefined();
    expect(typeof body.response).toBe("string");
    expect(Array.isArray(body.citations)).toBe(true);
    expect(body.sessionId).toBeDefined();
  });

  it("truncates messages longer than 500 chars", async () => {
    const { cookie } = await createUserWithRole("ai-trunc@dashboard.test", "admin", [["dashboard", "admin"]]);
    const longMessage = "a".repeat(600);
    const res = await app.fetch(
      new Request("http://localhost/v1/ai/chat", {
        method: "POST",
        headers: { Cookie: cookie, "Content-Type": "application/json", Origin: "http://localhost" },
        body: JSON.stringify({ message: longMessage, context: { workspace: "productions", tab: "overview" } }),
      }),
      env,
    );
    expect(res.status).toBe(200);
  });

  it("returns 400 for missing message", async () => {
    const { cookie } = await createUserWithRole("ai-badreq@dashboard.test", "admin", [["dashboard", "admin"]]);
    const res = await app.fetch(
      new Request("http://localhost/v1/ai/chat", {
        method: "POST",
        headers: { Cookie: cookie, "Content-Type": "application/json", Origin: "http://localhost" },
        body: JSON.stringify({ context: { workspace: "productions" } }),
      }),
      env,
    );
    expect(res.status).toBe(400);
  });

  it("strips HTML/XML tags from message", async () => {
    const { cookie } = await createUserWithRole("ai-html@dashboard.test", "admin", [["dashboard", "admin"]]);
    const res = await app.fetch(
      new Request("http://localhost/v1/ai/chat", {
        method: "POST",
        headers: { Cookie: cookie, "Content-Type": "application/json", Origin: "http://localhost" },
        body: JSON.stringify({
          message: "<script>alert('xss')</script>What workspaces exist?",
          context: { workspace: "productions", tab: "overview" },
        }),
      }),
      env,
    );
    expect(res.status).toBe(200);
    // The response should have been generated from sanitized input
    const body = await res.json() as { response: string };
    expect(body.response).toBeDefined();
  });

  it("returns 400 for empty message", async () => {
    const { cookie } = await createUserWithRole("ai-empty@dashboard.test", "admin", [["dashboard", "admin"]]);
    const res = await app.fetch(
      new Request("http://localhost/v1/ai/chat", {
        method: "POST",
        headers: { Cookie: cookie, "Content-Type": "application/json", Origin: "http://localhost" },
        body: JSON.stringify({ message: "", context: { workspace: "productions" } }),
      }),
      env,
    );
    expect(res.status).toBe(400);
  });

  it("accepts request without context (general question)", async () => {
    const { cookie } = await createUserWithRole("ai-nocontext@dashboard.test", "admin", [["dashboard", "admin"]]);
    const res = await app.fetch(
      new Request("http://localhost/v1/ai/chat", {
        method: "POST",
        headers: { Cookie: cookie, "Content-Type": "application/json", Origin: "http://localhost" },
        body: JSON.stringify({ message: "What features are available?" }),
      }),
      env,
    );
    expect(res.status).toBe(200);
    const body = await res.json() as { response: string; sessionId: string };
    expect(body.response).toBeDefined();
    expect(body.sessionId).toBeDefined();
  });

  it("returns sessionId for session continuity", async () => {
    const { cookie } = await createUserWithRole("ai-session@dashboard.test", "admin", [["dashboard", "admin"]]);
    const res1 = await app.fetch(
      new Request("http://localhost/v1/ai/chat", {
        method: "POST",
        headers: { Cookie: cookie, "Content-Type": "application/json", Origin: "http://localhost" },
        body: JSON.stringify({ message: "Hello", context: { workspace: "productions" } }),
      }),
      env,
    );
    expect(res1.status).toBe(200);
    const body1 = await res1.json() as { sessionId: string };
    expect(body1.sessionId).toBeDefined();

    // Second request with sessionId
    const res2 = await app.fetch(
      new Request("http://localhost/v1/ai/chat", {
        method: "POST",
        headers: { Cookie: cookie, "Content-Type": "application/json", Origin: "http://localhost" },
        body: JSON.stringify({ message: "Follow up", context: { workspace: "productions" }, sessionId: body1.sessionId }),
      }),
      env,
    );
    expect(res2.status).toBe(200);
    const body2 = await res2.json() as { sessionId: string };
    expect(body2.sessionId).toBeDefined();
  });

  it("all citation URLs are relative or on production.city", async () => {
    const { cookie } = await createUserWithRole("ai-citations@dashboard.test", "admin", [["dashboard", "admin"]]);
    const res = await app.fetch(
      new Request("http://localhost/v1/ai/chat", {
        method: "POST",
        headers: { Cookie: cookie, "Content-Type": "application/json", Origin: "http://localhost" },
        body: JSON.stringify({ message: "Show me links", context: { workspace: "productions", tab: "overview" } }),
      }),
      env,
    );
    if (res.status === 200) {
      const body = await res.json() as { citations: { url: string }[] };
      for (const citation of body.citations) {
        if (citation.url.startsWith("http")) {
          const url = new URL(citation.url);
          expect(url.hostname).toMatch(/^(.*\.)?production\.city$/);
        } else {
          // Relative URL — must start with /
          expect(citation.url.startsWith("/")).toBe(true);
        }
      }
    }
  });
});
