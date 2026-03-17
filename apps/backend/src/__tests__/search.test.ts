import { describe, it, expect, beforeAll, vi, afterEach } from "vitest";
import { env } from "cloudflare:test";
import { app } from "../index.js";
import { createPrismaClient } from "../lib/prisma.js";
import { createSession, SESSION_COOKIE_NAME } from "../auth/session.js";
import { setupTestDatabase } from "./test-helpers.js";

beforeAll(async () => {
  await setupTestDatabase();
});

afterEach(() => {
  vi.restoreAllMocks();
});

/**
 * Helper to create a user with role and permissions, returning a session cookie.
 */
async function createUserWithRole(
  email: string,
  roleName: string,
  permPairs: [string, string][],
  userName?: string,
) {
  const prisma = await createPrismaClient(env.DB);
  try {
    const user = await prisma.user.upsert({
      where: { email },
      create: { email, status: "active", name: userName },
      update: { name: userName },
    });

    const role = await prisma.role.create({
      data: { name: `${roleName}-search-${user.id.slice(0, 8)}`, description: roleName },
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

describe("GET /v1/search", () => {
  it("returns 401 for unauthenticated request", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/search?q=test"),
      env,
    );
    expect(res.status).toBe(401);
  });

  it("returns empty results for query shorter than 2 chars", async () => {
    const { cookie } = await createUserWithRole(
      "search-short@dashboard.test", "admin",
      [["dashboard", "admin"]],
    );
    const res = await app.fetch(
      new Request("http://localhost/v1/search?q=a", {
        headers: { Cookie: cookie },
      }),
      env,
    );
    expect(res.status).toBe(200);
    const body = await res.json() as { results: unknown[]; total: number };
    expect(body.results).toEqual([]);
    expect(body.total).toBe(0);
  });

  it("returns results with workspace field and echoes query", async () => {
    // Create a named user to search for
    await createUserWithRole(
      "stage-manager@dashboard.test", "staff",
      [["dashboard", "staff"]],
      "Stage Manager Bob",
    );

    const { cookie } = await createUserWithRole(
      "search-query@dashboard.test", "admin",
      [["dashboard", "admin"]],
    );
    const res = await app.fetch(
      new Request("http://localhost/v1/search?q=Stage", {
        headers: { Cookie: cookie },
      }),
      env,
    );
    expect(res.status).toBe(200);
    const body = await res.json() as {
      query: string;
      results: Array<{ workspace: string; type: string; title: string; url: string }>;
      total: number;
    };
    expect(body.query).toBe("Stage");
    expect(body.results).toBeDefined();
    expect(typeof body.total).toBe("number");
    for (const result of body.results) {
      expect(result.workspace).toBeDefined();
      expect(result.type).toBeDefined();
      expect(result.title).toBeDefined();
      expect(result.url).toBeDefined();
    }
  });

  it("returns 400 for missing q parameter", async () => {
    const { cookie } = await createUserWithRole(
      "search-noq@dashboard.test", "admin",
      [["dashboard", "admin"]],
    );
    const res = await app.fetch(
      new Request("http://localhost/v1/search", {
        headers: { Cookie: cookie },
      }),
      env,
    );
    expect(res.status).toBe(400);
  });

  it("does not include sensitive fields in results", async () => {
    // Create a user named "John" to ensure results exist
    await createUserWithRole(
      "john-sensitive@dashboard.test", "staff",
      [["dashboard", "staff"]],
      "John Doe",
    );

    const { cookie } = await createUserWithRole(
      "search-pii@dashboard.test", "admin",
      [["dashboard", "admin"]],
    );
    const res = await app.fetch(
      new Request("http://localhost/v1/search?q=John", {
        headers: { Cookie: cookie },
      }),
      env,
    );
    const body = await res.json() as {
      results: Array<Record<string, unknown>>;
    };
    for (const result of body.results) {
      expect(result.email).toBeUndefined();
      expect(result.phone).toBeUndefined();
    }
  });

  it("scopes results by user role — guest cannot see admin workspace", async () => {
    const { cookie } = await createUserWithRole(
      "search-guest@dashboard.test", "guest",
      [["dashboard", "guest"], ["events", "browse"], ["education", "browse"]],
    );
    const res = await app.fetch(
      new Request("http://localhost/v1/search?q=admin", {
        headers: { Cookie: cookie },
      }),
      env,
    );
    const body = await res.json() as {
      results: Array<{ workspace: string }>;
    };
    for (const result of body.results) {
      expect(result.workspace).not.toBe("administration");
    }
  });
});
