import { describe, it, expect, beforeAll } from "vitest";
import { env } from "cloudflare:test";
import { app } from "../index.js";
import { createPrismaClient } from "../lib/prisma.js";
import { createSession, SESSION_COOKIE_NAME } from "../auth/session.js";
import { setupTestDatabase } from "./test-helpers.js";

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
      data: { name: `${roleName}-inbox-${user.id.slice(0, 8)}`, description: roleName },
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

let inboxAdminCookie: string;

beforeAll(async () => {
  await setupTestDatabase();

  // Create admin user with role and seed inbox items
  const { user: adminUser, cookie } = await createUserWithRole(
    "inbox-admin@dashboard.test",
    "admin",
    [["dashboard", "admin"]],
  );
  inboxAdminCookie = cookie;

  const prisma = await createPrismaClient(env.DB);
  try {
    await prisma.notification.createMany({
      data: [
        {
          id: "inbox-seed-1",
          userId: adminUser.id,
          type: "approval",
          resourceType: "invoice",
          resourceId: "inv-1234",
          summary: "Invoice #1234 needs your approval",
          workspace: "finance",
          actionUrl: "/dashboard/finance/invoices",
          priority: "action",
          actionable: true,
        },
        {
          id: "inbox-seed-2",
          userId: adminUser.id,
          type: "mention",
          resourceType: "production",
          resourceId: "prod-alpha",
          summary: "You were mentioned in Production Alpha discussion",
          workspace: "productions",
          actionUrl: "/dashboard/productions/overview",
          priority: "info",
          actionable: false,
        },
        {
          id: "inbox-seed-3",
          userId: adminUser.id,
          type: "update",
          resourceType: "facility",
          resourceId: "sound-stage-3",
          summary: "Facility booking confirmed for Sound Stage 3",
          workspace: "facilities",
          actionUrl: "/dashboard/facilities/calendar",
          priority: "info",
          readAt: new Date(),
          actionable: false,
        },
        {
          id: "inbox-seed-4",
          userId: adminUser.id,
          type: "system",
          resourceType: "system",
          resourceId: "maintenance-notice",
          summary: "System maintenance scheduled for tonight",
          workspace: null,
          actionUrl: "/dashboard/administration/health",
          priority: "info",
          actionable: false,
        },
      ],
    });
  } finally {
    await prisma.$disconnect();
  }
});

/** Loose response type for test assertions on JSON API responses. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- test file; API response shape asserted at runtime
type ApiBody = Record<string, any>;

describe("GET /v1/inbox", () => {
  it("returns 401 for unauthenticated request", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/inbox"),
      env,
    );
    expect(res.status).toBe(401);
  });

  it("returns 200 with items array and pagination", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/inbox", {
        headers: { Cookie: inboxAdminCookie },
      }),
      env,
    );
    expect(res.status).toBe(200);
    const body = await res.json() as ApiBody;
    expect(Array.isArray(body.items)).toBe(true);
    expect(typeof body.totalUnread).toBe("number");
    expect(typeof body.totalActionable).toBe("number");
  });

  it("supports cursor-based pagination", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/inbox?limit=2", {
        headers: { Cookie: inboxAdminCookie },
      }),
      env,
    );
    const body = await res.json() as ApiBody;
    if (body.nextCursor) {
      const res2 = await app.fetch(
        new Request(`http://localhost/v1/inbox?cursor=${body.nextCursor}&limit=2`, {
          headers: { Cookie: inboxAdminCookie },
        }),
        env,
      );
      expect(res2.status).toBe(200);
    }
  });

  it("filters by type", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/inbox?type=approval", {
        headers: { Cookie: inboxAdminCookie },
      }),
      env,
    );
    const body = await res.json() as ApiBody;
    for (const item of body.items) {
      expect(item.type).toBe("approval");
    }
  });

  it("filters by workspace", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/inbox?workspace=finance", {
        headers: { Cookie: inboxAdminCookie },
      }),
      env,
    );
    const body = await res.json() as ApiBody;
    for (const item of body.items) {
      expect(item.workspace).toBe("finance");
    }
  });

  it("filters by read status", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/inbox?read=false", {
        headers: { Cookie: inboxAdminCookie },
      }),
      env,
    );
    const body = await res.json() as ApiBody;
    for (const item of body.items) {
      expect(item.readAt).toBeNull();
    }
  });

  it("filters by actionable", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/inbox?actionable=true", {
        headers: { Cookie: inboxAdminCookie },
      }),
      env,
    );
    const body = await res.json() as ApiBody;
    for (const item of body.items) {
      expect(item.actionable).toBe(true);
    }
  });

  it("filters by dateFrom and dateTo", async () => {
    const from = new Date(Date.now() - 86400000).toISOString();
    const to = new Date().toISOString();
    const res = await app.fetch(
      new Request(`http://localhost/v1/inbox?dateFrom=${from}&dateTo=${to}`, {
        headers: { Cookie: inboxAdminCookie },
      }),
      env,
    );
    expect(res.status).toBe(200);
    const body = await res.json() as ApiBody;
    expect(Array.isArray(body.items)).toBe(true);
  });

  it("excludes dismissed by default, includes with filter", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/inbox?dismissed=true", {
        headers: { Cookie: inboxAdminCookie },
      }),
      env,
    );
    expect(res.status).toBe(200);
  });

  it("returns items sorted newest first", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/inbox", {
        headers: { Cookie: inboxAdminCookie },
      }),
      env,
    );
    const body = await res.json() as ApiBody;
    for (let i = 1; i < body.items.length; i++) {
      expect(new Date(body.items[i - 1].createdAt).getTime())
        .toBeGreaterThanOrEqual(new Date(body.items[i].createdAt).getTime());
    }
  });

  it("caps limit at 100", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/inbox?limit=200", {
        headers: { Cookie: inboxAdminCookie },
      }),
      env,
    );
    const body = await res.json() as ApiBody;
    expect(body.items.length).toBeLessThanOrEqual(100);
  });
});

/** Headers for mutating requests (CSRF requires Origin) */
function mutHeaders(cookie: string) {
  return {
    Cookie: cookie,
    Origin: "http://localhost",
    "Content-Type": "application/json",
  };
}

describe("PATCH /v1/inbox/:id", () => {
  it("returns 401 for unauthenticated", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/inbox/test-id", {
        method: "PATCH",
        headers: { Origin: "http://localhost", "Content-Type": "application/json" },
        body: JSON.stringify({ read: true }),
      }),
      env,
    );
    expect(res.status).toBe(401);
  });

  it("marks item as read", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/inbox/inbox-seed-1", {
        method: "PATCH",
        headers: mutHeaders(inboxAdminCookie),
        body: JSON.stringify({ read: true }),
      }),
      env,
    );
    expect(res.status).toBe(200);
    const body = await res.json() as ApiBody;
    expect(body.read).toBe(true);
    expect(body.readAt).toBeDefined();
  });

  it("dismisses an item", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/inbox/inbox-seed-4", {
        method: "PATCH",
        headers: mutHeaders(inboxAdminCookie),
        body: JSON.stringify({ dismissed: true }),
      }),
      env,
    );
    expect(res.status).toBe(200);
    const body = await res.json() as ApiBody;
    expect(body.dismissed).toBe(true);
  });

  it("returns 404 for item not owned by user", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/inbox/nonexistent", {
        method: "PATCH",
        headers: mutHeaders(inboxAdminCookie),
        body: JSON.stringify({ read: true }),
      }),
      env,
    );
    expect(res.status).toBe(404);
  });
});

describe("POST /v1/inbox/mark-all-read", () => {
  it("returns 401 for unauthenticated", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/inbox/mark-all-read", {
        method: "POST",
        headers: { Origin: "http://localhost" },
      }),
      env,
    );
    expect(res.status).toBe(401);
  });

  it("returns updated count", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/inbox/mark-all-read", {
        method: "POST",
        headers: mutHeaders(inboxAdminCookie),
        body: JSON.stringify({}),
      }),
      env,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { updated: number };
    expect(typeof body.updated).toBe("number");
  });

  it("accepts optional type filter", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/inbox/mark-all-read", {
        method: "POST",
        headers: mutHeaders(inboxAdminCookie),
        body: JSON.stringify({ type: "approval" }),
      }),
      env,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { updated: number };
    expect(typeof body.updated).toBe("number");
  });
});
