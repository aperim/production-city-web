/**
 * Tests for Categories & Tags Admin API (issue #286).
 */

import { describe, it, expect, beforeAll } from "vitest";
import { env } from "cloudflare:test";
import { app } from "../index.js";
import { createPrismaClient } from "../lib/prisma.js";
import { createSession, SESSION_COOKIE_NAME } from "../auth/session.js";
import { setupTestDatabase } from "./test-helpers.js";

beforeAll(async () => {
  await setupTestDatabase();
});

async function createAdminWithPerms(
  prisma: Awaited<ReturnType<typeof createPrismaClient>>,
  email: string,
  perms: string[][],
) {
  const user = await prisma.user.create({
    data: { email, status: "active" },
  });

  const role = await prisma.role.create({
    data: { name: `role-${user.id.slice(0, 8)}`, description: "Test role" },
  });

  for (const pair of perms) {
    const resource = pair[0]!;
    const action = pair[1]!;
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
      // duplicate
    }
  }

  await prisma.userRole.create({
    data: { userId: user.id, roleId: role.id },
  });

  const session = await createSession(prisma, user.id);
  return { user, role, session };
}

function authHeaders(token: string): Record<string, string> {
  return {
    Cookie: `${SESSION_COOKIE_NAME}=${token}`,
    Origin: "http://localhost",
    "Content-Type": "application/json",
  };
}

// ============================================================================
// Categories
// ============================================================================

describe("GET /v1/categories (public)", () => {
  it("returns active categories without auth", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      // Seed a category
      await prisma.announcementCategory.upsert({
        where: { slug: "pub-test-cat" },
        update: {},
        create: { name: "Pub Test Cat", slug: "pub-test-cat", description: "Test", sortOrder: 99, isActive: 1 },
      });
      // Seed an inactive category
      await prisma.announcementCategory.upsert({
        where: { slug: "inactive-cat" },
        update: {},
        create: { name: "Inactive Cat", slug: "inactive-cat", description: "Hidden", sortOrder: 100, isActive: 0 },
      });
    } finally {
      await prisma.$disconnect();
    }

    const res = await app.fetch(
      new Request("http://localhost/v1/categories"),
      env,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { categories: Array<{ slug: string; subscriberCount?: number; announcementCount?: number }> };
    expect(body.categories).toBeDefined();
    // Active category should be present
    const active = body.categories.find((c) => c.slug === "pub-test-cat");
    expect(active).toBeDefined();
    // Inactive category should NOT be present
    const inactive = body.categories.find((c) => c.slug === "inactive-cat");
    expect(inactive).toBeUndefined();
    // Public response must NOT include subscriberCount or announcementCount
    if (active) {
      expect(active.subscriberCount).toBeUndefined();
      expect(active.announcementCount).toBeUndefined();
    }
  });
});

describe("GET /v1/categories/:slug (public)", () => {
  it("returns category by slug", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      await prisma.announcementCategory.upsert({
        where: { slug: "slug-lookup-test" },
        update: {},
        create: { name: "Slug Lookup Test", slug: "slug-lookup-test", description: "For lookup", sortOrder: 50 },
      });
    } finally {
      await prisma.$disconnect();
    }

    const res = await app.fetch(
      new Request("http://localhost/v1/categories/slug-lookup-test"),
      env,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { name: string };
    expect(body.name).toBe("Slug Lookup Test");
  });

  it("returns 404 for non-existent slug", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/categories/nonexistent-slug-xyz"),
      env,
    );
    expect(res.status).toBe(404);
  });

  it("returns 404 for inactive category", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/categories/inactive-cat"),
      env,
    );
    expect(res.status).toBe(404);
  });
});

describe("POST /v1/admin/categories", () => {
  it("creates a category with correct permissions", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createAdminWithPerms(prisma, `cat-create-${Date.now()}@test.com`, [
        ["category", "create"],
      ]);

      const res = await app.fetch(
        new Request("http://localhost/v1/admin/categories", {
          method: "POST",
          headers: authHeaders(session.token),
          body: JSON.stringify({ name: `Create Test ${Date.now()}`, description: "A test category" }),
        }),
        env,
      );
      expect(res.status).toBe(201);
      const body = (await res.json()) as { name: string; slug: string; isActive: boolean; announcementCount: number };
      expect(body.slug).toBeDefined();
      expect(body.isActive).toBe(true);
      expect(body.announcementCount).toBe(0);
    } finally {
      await prisma.$disconnect();
    }
  });

  it("returns 401 without auth", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: "http://localhost" },
        body: JSON.stringify({ name: "No Auth" }),
      }),
      env,
    );
    expect(res.status).toBe(401);
  });

  it("returns 403 without category:create permission", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createAdminWithPerms(prisma, `cat-noperm-${Date.now()}@test.com`, [
        ["user", "read"],
      ]);

      const res = await app.fetch(
        new Request("http://localhost/v1/admin/categories", {
          method: "POST",
          headers: authHeaders(session.token),
          body: JSON.stringify({ name: "No Permission" }),
        }),
        env,
      );
      expect(res.status).toBe(403);
    } finally {
      await prisma.$disconnect();
    }
  });

  it("returns 409 for duplicate name", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createAdminWithPerms(prisma, `cat-dup-${Date.now()}@test.com`, [
        ["category", "create"],
      ]);
      const name = `Dup Test ${Date.now()}`;

      // Create first
      await app.fetch(
        new Request("http://localhost/v1/admin/categories", {
          method: "POST",
          headers: authHeaders(session.token),
          body: JSON.stringify({ name }),
        }),
        env,
      );

      // Create duplicate
      const res = await app.fetch(
        new Request("http://localhost/v1/admin/categories", {
          method: "POST",
          headers: authHeaders(session.token),
          body: JSON.stringify({ name }),
        }),
        env,
      );
      expect(res.status).toBe(409);
    } finally {
      await prisma.$disconnect();
    }
  });
});

describe("PATCH /v1/admin/categories/:id", () => {
  it("updates category name and regenerates slug", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createAdminWithPerms(prisma, `cat-update-${Date.now()}@test.com`, [
        ["category", "create"],
        ["category", "update"],
      ]);

      // Create category
      const createRes = await app.fetch(
        new Request("http://localhost/v1/admin/categories", {
          method: "POST",
          headers: authHeaders(session.token),
          body: JSON.stringify({ name: `Update Test ${Date.now()}` }),
        }),
        env,
      );
      const created = (await createRes.json()) as { id: string };

      // Update
      const newName = `Updated Name ${Date.now()}`;
      const updateRes = await app.fetch(
        new Request(`http://localhost/v1/admin/categories/${created.id}`, {
          method: "PATCH",
          headers: authHeaders(session.token),
          body: JSON.stringify({ name: newName }),
        }),
        env,
      );
      expect(updateRes.status).toBe(200);
      const updated = (await updateRes.json()) as { name: string; slug: string };
      expect(updated.name).toBe(newName);
      expect(updated.slug).toContain("updated-name");
    } finally {
      await prisma.$disconnect();
    }
  });

  it("returns 404 for non-existent category", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createAdminWithPerms(prisma, `cat-update-404-${Date.now()}@test.com`, [
        ["category", "update"],
      ]);

      const res = await app.fetch(
        new Request("http://localhost/v1/admin/categories/nonexistent-id", {
          method: "PATCH",
          headers: authHeaders(session.token),
          body: JSON.stringify({ name: "New Name" }),
        }),
        env,
      );
      expect(res.status).toBe(404);
    } finally {
      await prisma.$disconnect();
    }
  });
});

describe("DELETE /v1/admin/categories/:id", () => {
  it("soft-deletes by setting isActive to false", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createAdminWithPerms(prisma, `cat-del-${Date.now()}@test.com`, [
        ["category", "create"],
        ["category", "delete"],
      ]);

      // Create
      const createRes = await app.fetch(
        new Request("http://localhost/v1/admin/categories", {
          method: "POST",
          headers: authHeaders(session.token),
          body: JSON.stringify({ name: `Delete Test ${Date.now()}` }),
        }),
        env,
      );
      const created = (await createRes.json()) as { id: string };

      // Delete
      const delRes = await app.fetch(
        new Request(`http://localhost/v1/admin/categories/${created.id}`, {
          method: "DELETE",
          headers: authHeaders(session.token),
        }),
        env,
      );
      expect(delRes.status).toBe(200);

      // Verify it's deactivated
      const cat = await prisma.announcementCategory.findUnique({
        where: { id: created.id },
      });
      expect(cat).not.toBeNull();
      expect(cat!.isActive).toBe(0);
    } finally {
      await prisma.$disconnect();
    }
  });
});

describe("PATCH /v1/admin/categories/reorder", () => {
  it("reorders categories atomically", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createAdminWithPerms(prisma, `cat-reorder-${Date.now()}@test.com`, [
        ["category", "create"],
        ["category", "update"],
      ]);

      // Create two categories
      const ts = Date.now();
      const r1 = await app.fetch(
        new Request("http://localhost/v1/admin/categories", {
          method: "POST",
          headers: authHeaders(session.token),
          body: JSON.stringify({ name: `Reorder A ${ts}` }),
        }),
        env,
      );
      const c1 = (await r1.json()) as { id: string };

      const r2 = await app.fetch(
        new Request("http://localhost/v1/admin/categories", {
          method: "POST",
          headers: authHeaders(session.token),
          body: JSON.stringify({ name: `Reorder B ${ts}` }),
        }),
        env,
      );
      const c2 = (await r2.json()) as { id: string };

      // Reorder
      const reorderRes = await app.fetch(
        new Request("http://localhost/v1/admin/categories/reorder", {
          method: "PATCH",
          headers: authHeaders(session.token),
          body: JSON.stringify({
            items: [
              { id: c1.id, sortOrder: 10 },
              { id: c2.id, sortOrder: 5 },
            ],
          }),
        }),
        env,
      );
      expect(reorderRes.status).toBe(200);

      // Verify
      const cat1 = await prisma.announcementCategory.findUnique({ where: { id: c1.id } });
      const cat2 = await prisma.announcementCategory.findUnique({ where: { id: c2.id } });
      expect(cat1!.sortOrder).toBe(10);
      expect(cat2!.sortOrder).toBe(5);
    } finally {
      await prisma.$disconnect();
    }
  });

  it("returns 400 for non-existent category IDs", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createAdminWithPerms(prisma, `cat-reorder-bad-${Date.now()}@test.com`, [
        ["category", "update"],
      ]);

      const res = await app.fetch(
        new Request("http://localhost/v1/admin/categories/reorder", {
          method: "PATCH",
          headers: authHeaders(session.token),
          body: JSON.stringify({
            items: [{ id: "nonexistent-id", sortOrder: 1 }],
          }),
        }),
        env,
      );
      expect(res.status).toBe(400);
    } finally {
      await prisma.$disconnect();
    }
  });
});

// ============================================================================
// Tags
// ============================================================================

describe("GET /v1/tags (public)", () => {
  it("returns tags without auth", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      await prisma.announcementTag.upsert({
        where: { slug: "test-tag-pub" },
        update: {},
        create: { name: "Test Tag Pub", slug: "test-tag-pub" },
      });
    } finally {
      await prisma.$disconnect();
    }

    const res = await app.fetch(
      new Request("http://localhost/v1/tags"),
      env,
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { tags: Array<{ slug: string; announcementCount?: number }> };
    expect(body.tags).toBeDefined();
    const tag = body.tags.find((t) => t.slug === "test-tag-pub");
    expect(tag).toBeDefined();
    // Public response must NOT include announcementCount
    if (tag) {
      expect(tag.announcementCount).toBeUndefined();
    }
  });
});

describe("POST /v1/admin/tags", () => {
  it("creates a tag with correct permissions", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createAdminWithPerms(prisma, `tag-create-${Date.now()}@test.com`, [
        ["tag", "create"],
      ]);

      const res = await app.fetch(
        new Request("http://localhost/v1/admin/tags", {
          method: "POST",
          headers: authHeaders(session.token),
          body: JSON.stringify({ name: `Tag ${Date.now()}` }),
        }),
        env,
      );
      expect(res.status).toBe(201);
      const body = (await res.json()) as { name: string; slug: string; announcementCount: number };
      expect(body.slug).toBeDefined();
      expect(body.announcementCount).toBe(0);
    } finally {
      await prisma.$disconnect();
    }
  });

  it("returns 409 for duplicate tag name", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createAdminWithPerms(prisma, `tag-dup-${Date.now()}@test.com`, [
        ["tag", "create"],
      ]);
      const name = `DupTag ${Date.now()}`;

      await app.fetch(
        new Request("http://localhost/v1/admin/tags", {
          method: "POST",
          headers: authHeaders(session.token),
          body: JSON.stringify({ name }),
        }),
        env,
      );

      const res = await app.fetch(
        new Request("http://localhost/v1/admin/tags", {
          method: "POST",
          headers: authHeaders(session.token),
          body: JSON.stringify({ name }),
        }),
        env,
      );
      expect(res.status).toBe(409);
    } finally {
      await prisma.$disconnect();
    }
  });

  it("returns 401 without auth", async () => {
    const res = await app.fetch(
      new Request("http://localhost/v1/admin/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: "http://localhost" },
        body: JSON.stringify({ name: "No Auth Tag" }),
      }),
      env,
    );
    expect(res.status).toBe(401);
  });
});

describe("PATCH /v1/admin/tags/:id", () => {
  it("updates tag name", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createAdminWithPerms(prisma, `tag-update-${Date.now()}@test.com`, [
        ["tag", "create"],
        ["tag", "update"],
      ]);

      const createRes = await app.fetch(
        new Request("http://localhost/v1/admin/tags", {
          method: "POST",
          headers: authHeaders(session.token),
          body: JSON.stringify({ name: `UpdateTag ${Date.now()}` }),
        }),
        env,
      );
      const created = (await createRes.json()) as { id: string };

      const newName = `Renamed ${Date.now()}`;
      const updateRes = await app.fetch(
        new Request(`http://localhost/v1/admin/tags/${created.id}`, {
          method: "PATCH",
          headers: authHeaders(session.token),
          body: JSON.stringify({ name: newName }),
        }),
        env,
      );
      expect(updateRes.status).toBe(200);
      const body = (await updateRes.json()) as { name: string };
      expect(body.name).toBe(newName);
    } finally {
      await prisma.$disconnect();
    }
  });

  it("returns 404 for non-existent tag", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createAdminWithPerms(prisma, `tag-update-404-${Date.now()}@test.com`, [
        ["tag", "update"],
      ]);

      const res = await app.fetch(
        new Request("http://localhost/v1/admin/tags/nonexistent-tag-id", {
          method: "PATCH",
          headers: authHeaders(session.token),
          body: JSON.stringify({ name: "New Name" }),
        }),
        env,
      );
      expect(res.status).toBe(404);
    } finally {
      await prisma.$disconnect();
    }
  });
});

describe("DELETE /v1/admin/tags/:id", () => {
  it("deletes tag", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createAdminWithPerms(prisma, `tag-del-${Date.now()}@test.com`, [
        ["tag", "create"],
        ["tag", "delete"],
      ]);

      const createRes = await app.fetch(
        new Request("http://localhost/v1/admin/tags", {
          method: "POST",
          headers: authHeaders(session.token),
          body: JSON.stringify({ name: `DelTag ${Date.now()}` }),
        }),
        env,
      );
      const created = (await createRes.json()) as { id: string };

      const delRes = await app.fetch(
        new Request(`http://localhost/v1/admin/tags/${created.id}`, {
          method: "DELETE",
          headers: authHeaders(session.token),
        }),
        env,
      );
      expect(delRes.status).toBe(200);

      // Verify it's actually deleted (not soft-deleted)
      const tag = await prisma.announcementTag.findUnique({ where: { id: created.id } });
      expect(tag).toBeNull();
    } finally {
      await prisma.$disconnect();
    }
  });

  it("returns 404 for non-existent tag", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createAdminWithPerms(prisma, `tag-del-404-${Date.now()}@test.com`, [
        ["tag", "delete"],
      ]);

      const res = await app.fetch(
        new Request("http://localhost/v1/admin/tags/nonexistent-id", {
          method: "DELETE",
          headers: authHeaders(session.token),
        }),
        env,
      );
      expect(res.status).toBe(404);
    } finally {
      await prisma.$disconnect();
    }
  });
});
