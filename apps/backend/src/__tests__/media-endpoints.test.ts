import { describe, it, expect, beforeAll } from "vitest";
import { env } from "cloudflare:test";
import { app } from "../index.js";
import { createPrismaClient } from "../lib/prisma.js";
import { createSession, SESSION_COOKIE_NAME } from "../auth/session.js";
import { setupTestDatabase } from "./test-helpers.js";

beforeAll(async () => { await setupTestDatabase(); });

/** Create an admin user with media:manage permission */
async function createMediaAdmin(
  prisma: Awaited<ReturnType<typeof createPrismaClient>>,
  email: string,
) {
  const user = await prisma.user.create({
    data: { email, status: "active" },
  });

  const role = await prisma.role.create({
    data: { name: `media-admin-${user.id.slice(0, 8)}`, description: "Media Admin" },
  });

  let perm = await prisma.permission.findUnique({
    where: { resource_action: { resource: "media", action: "manage" } },
  });
  if (!perm) {
    perm = await prisma.permission.create({ data: { resource: "media", action: "manage" } });
  }

  try {
    await prisma.rolePermission.create({
      data: { roleId: role.id, permissionId: perm.id },
    });
  } catch {
    // skip duplicate
  }

  await prisma.userRole.create({
    data: { userId: user.id, roleId: role.id },
  });

  const session = await createSession(prisma, user.id);
  return { user, role, session };
}

/** Create a test media asset */
async function createTestAsset(
  prisma: Awaited<ReturnType<typeof createPrismaClient>>,
  overrides: Record<string, unknown> = {},
) {
  const id = `asset-${Math.random().toString(36).slice(2, 10)}`;
  return prisma.mediaAsset.create({
    data: {
      id,
      source: "pexels",
      externalId: `ext-${id}`,
      photographer: "Test Photographer",
      originalWidth: 1920,
      originalHeight: 1080,
      alt: "Test image description",
      mimeType: "image/jpeg",
      localPath: `public/media/test/${id}.jpg`,
      publicPath: `/media/test/${id}.jpg`,
      license: "pexels",
      themeVariant: "light",
      contentContext: `ctx-${id}`,
      reviewStatus: "accepted",
      ...overrides,
    },
  });
}

// --- Public endpoint tests ---

describe("GET /v1/media/pairs/:contentContext", () => {
  it("returns 200 with light/dark asset pair for valid context", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const lightAsset = await createTestAsset(prisma, { themeVariant: "light" });
      const darkAsset = await createTestAsset(prisma, { themeVariant: "dark" });
      const pair = await prisma.mediaPair.create({
        data: {
          contentContext: "hero-test-public",
          lightAssetId: lightAsset.id,
          darkAssetId: darkAsset.id,
        },
      });

      const req = new Request("http://localhost/v1/media/pairs/hero-test-public");
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);

      const body = await res.json() as Record<string, unknown>;
      expect(body.id).toBe(pair.id);
      expect(body.contentContext).toBe("hero-test-public");
      expect(body).toHaveProperty("light");
      expect(body).toHaveProperty("dark");

      // Verify public fields are present, localPath is NOT
      const light = body.light as Record<string, unknown>;
      expect(light.publicPath).toBe(lightAsset.publicPath);
      expect(light.photographer).toBe("Test Photographer");
      expect(light).not.toHaveProperty("localPath");
      expect(light).not.toHaveProperty("downloadUrl");

      // Verify cache headers
      expect(res.headers.get("Cache-Control")).toBe("public, max-age=300, stale-while-revalidate=600");
      expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
    } finally {
      await prisma.$disconnect();
    }
  });

  it("returns 404 when content context has no pair", async () => {
    const req = new Request("http://localhost/v1/media/pairs/nonexistent-ctx");
    const res = await app.fetch(req, env);
    expect(res.status).toBe(404);
  });

  it("returns 400 for invalid content context format", async () => {
    const req = new Request("http://localhost/v1/media/pairs/invalid%20context!");
    const res = await app.fetch(req, env);
    expect(res.status).toBe(400);
  });
});

describe("GET /v1/media/pairs (batch)", () => {
  it("returns pairs for multiple contexts", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const light1 = await createTestAsset(prisma, { themeVariant: "light" });
      const dark1 = await createTestAsset(prisma, { themeVariant: "dark" });
      const light2 = await createTestAsset(prisma, { themeVariant: "light" });
      const dark2 = await createTestAsset(prisma, { themeVariant: "dark" });

      await prisma.mediaPair.create({
        data: { contentContext: "batch-a", lightAssetId: light1.id, darkAssetId: dark1.id },
      });
      await prisma.mediaPair.create({
        data: { contentContext: "batch-b", lightAssetId: light2.id, darkAssetId: dark2.id },
      });

      const req = new Request("http://localhost/v1/media/pairs?contexts=batch-a,batch-b");
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);

      const body = await res.json() as Record<string, unknown>;
      const pairs = body.pairs as Record<string, unknown>;
      expect(pairs).toHaveProperty("batch-a");
      expect(pairs).toHaveProperty("batch-b");
    } finally {
      await prisma.$disconnect();
    }
  });

  it("returns empty object when no contexts provided", async () => {
    const req = new Request("http://localhost/v1/media/pairs");
    const res = await app.fetch(req, env);
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.pairs).toEqual({});
  });
});

describe("GET /v1/media/assets/:id", () => {
  it("returns 200 with asset metadata for valid ID", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const asset = await createTestAsset(prisma);

      const req = new Request(`http://localhost/v1/media/assets/${asset.id}`);
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);

      const body = await res.json() as Record<string, unknown>;
      expect(body.id).toBe(asset.id);
      expect(body.publicPath).toBe(asset.publicPath);
      expect(body).not.toHaveProperty("localPath");
    } finally {
      await prisma.$disconnect();
    }
  });

  it("returns 404 for non-existent ID", async () => {
    const req = new Request("http://localhost/v1/media/assets/nonexistent-id");
    const res = await app.fetch(req, env);
    expect(res.status).toBe(404);
  });

  it("returns 404 for archived asset", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const asset = await createTestAsset(prisma, { archivedAt: new Date() });

      const req = new Request(`http://localhost/v1/media/assets/${asset.id}`);
      const res = await app.fetch(req, env);
      expect(res.status).toBe(404);
    } finally {
      await prisma.$disconnect();
    }
  });
});

// --- Admin endpoint tests ---

describe("GET /v1/admin/media/assets", () => {
  it("returns 401 without auth", async () => {
    const req = new Request("http://localhost/v1/admin/media/assets");
    const res = await app.fetch(req, env);
    expect(res.status).toBe(401);
  });

  it("returns paginated list for admin", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createMediaAdmin(prisma, "media-admin-list@test.com");
      await createTestAsset(prisma);

      const req = new Request("http://localhost/v1/admin/media/assets?page=1&pageSize=10", {
        headers: { Cookie: `${SESSION_COOKIE_NAME}=${session.token}`, Origin: "http://localhost" },
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);

      const body = await res.json() as Record<string, unknown>;
      expect(body).toHaveProperty("assets");
      expect(body).toHaveProperty("pagination");
    } finally {
      await prisma.$disconnect();
    }
  });

  it("filters by source", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createMediaAdmin(prisma, "media-admin-filter@test.com");
      await createTestAsset(prisma, { source: "unsplash" });

      const req = new Request("http://localhost/v1/admin/media/assets?source=unsplash", {
        headers: { Cookie: `${SESSION_COOKIE_NAME}=${session.token}`, Origin: "http://localhost" },
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);

      const body = await res.json() as Record<string, unknown>;
      const assets = body.assets as Array<Record<string, unknown>>;
      for (const asset of assets) {
        expect(asset.source).toBe("unsplash");
      }
    } finally {
      await prisma.$disconnect();
    }
  });

  it("excludes archived assets by default", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createMediaAdmin(prisma, "media-admin-arch@test.com");
      const archived = await createTestAsset(prisma, { archivedAt: new Date() });

      const req = new Request("http://localhost/v1/admin/media/assets", {
        headers: { Cookie: `${SESSION_COOKIE_NAME}=${session.token}`, Origin: "http://localhost" },
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);

      const body = await res.json() as Record<string, unknown>;
      const assets = body.assets as Array<Record<string, unknown>>;
      const ids = assets.map((a) => a.id);
      expect(ids).not.toContain(archived.id);
    } finally {
      await prisma.$disconnect();
    }
  });
});

describe("PATCH /v1/admin/media/assets/:id", () => {
  it("returns 401 without auth", async () => {
    const req = new Request("http://localhost/v1/admin/media/assets/some-id", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Origin: "http://localhost" },
      body: JSON.stringify({ alt: "new alt" }),
    });
    const res = await app.fetch(req, env);
    expect(res.status).toBe(401);
  });

  it("updates alt text", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createMediaAdmin(prisma, "media-admin-patch@test.com");
      const asset = await createTestAsset(prisma);

      const req = new Request(`http://localhost/v1/admin/media/assets/${asset.id}`, {
        method: "PATCH",
        headers: {
          Cookie: `${SESSION_COOKIE_NAME}=${session.token}`,
          "Content-Type": "application/json",
          Origin: "http://localhost",
        },
        body: JSON.stringify({ alt: "Updated alt text" }),
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);

      const body = await res.json() as Record<string, unknown>;
      expect(body.alt).toBe("Updated alt text");
    } finally {
      await prisma.$disconnect();
    }
  });

  it("returns 404 for non-existent asset", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createMediaAdmin(prisma, "media-admin-patch404@test.com");

      const req = new Request("http://localhost/v1/admin/media/assets/nonexistent", {
        method: "PATCH",
        headers: {
          Cookie: `${SESSION_COOKIE_NAME}=${session.token}`,
          "Content-Type": "application/json",
          Origin: "http://localhost",
        },
        body: JSON.stringify({ alt: "new" }),
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(404);
    } finally {
      await prisma.$disconnect();
    }
  });
});

describe("DELETE /v1/admin/media/assets/:id", () => {
  it("soft-deletes (archives) the asset", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createMediaAdmin(prisma, "media-admin-del@test.com");
      const asset = await createTestAsset(prisma);

      const req = new Request(`http://localhost/v1/admin/media/assets/${asset.id}`, {
        method: "DELETE",
        headers: { Cookie: `${SESSION_COOKIE_NAME}=${session.token}`, Origin: "http://localhost" },
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);

      // Verify it's archived
      const updated = await prisma.mediaAsset.findUnique({ where: { id: asset.id } });
      expect(updated?.archivedAt).not.toBeNull();
    } finally {
      await prisma.$disconnect();
    }
  });

  it("returns 404 for non-existent asset", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createMediaAdmin(prisma, "media-admin-del404@test.com");

      const req = new Request("http://localhost/v1/admin/media/assets/nonexistent", {
        method: "DELETE",
        headers: { Cookie: `${SESSION_COOKIE_NAME}=${session.token}`, Origin: "http://localhost" },
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(404);
    } finally {
      await prisma.$disconnect();
    }
  });
});

describe("POST /v1/admin/media/assets/:id/restore", () => {
  it("restores archived asset", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createMediaAdmin(prisma, "media-admin-restore@test.com");
      const asset = await createTestAsset(prisma, { archivedAt: new Date() });

      const req = new Request(`http://localhost/v1/admin/media/assets/${asset.id}/restore`, {
        method: "POST",
        headers: { Cookie: `${SESSION_COOKIE_NAME}=${session.token}`, Origin: "http://localhost" },
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);

      const updated = await prisma.mediaAsset.findUnique({ where: { id: asset.id } });
      expect(updated?.archivedAt).toBeNull();
    } finally {
      await prisma.$disconnect();
    }
  });
});

describe("POST /v1/admin/media/pairs", () => {
  it("creates pair with valid assets", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createMediaAdmin(prisma, "media-admin-pair-create@test.com");
      const light = await createTestAsset(prisma, { themeVariant: "light" });
      const dark = await createTestAsset(prisma, { themeVariant: "dark" });

      const req = new Request("http://localhost/v1/admin/media/pairs", {
        method: "POST",
        headers: {
          Cookie: `${SESSION_COOKIE_NAME}=${session.token}`,
          "Content-Type": "application/json",
          Origin: "http://localhost",
        },
        body: JSON.stringify({
          contentContext: "test-pair-create",
          lightAssetId: light.id,
          darkAssetId: dark.id,
        }),
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(201);

      const body = await res.json() as Record<string, unknown>;
      expect(body.contentContext).toBe("test-pair-create");
    } finally {
      await prisma.$disconnect();
    }
  });

  it("returns 409 when pair already exists for context", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createMediaAdmin(prisma, "media-admin-pair-dup@test.com");
      const light = await createTestAsset(prisma);
      const dark = await createTestAsset(prisma);

      await prisma.mediaPair.create({
        data: { contentContext: "dup-pair-ctx", lightAssetId: light.id, darkAssetId: dark.id },
      });

      const req = new Request("http://localhost/v1/admin/media/pairs", {
        method: "POST",
        headers: {
          Cookie: `${SESSION_COOKIE_NAME}=${session.token}`,
          "Content-Type": "application/json",
          Origin: "http://localhost",
        },
        body: JSON.stringify({
          contentContext: "dup-pair-ctx",
          lightAssetId: light.id,
          darkAssetId: dark.id,
        }),
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(409);
    } finally {
      await prisma.$disconnect();
    }
  });

  it("returns 400 when asset IDs don't exist", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createMediaAdmin(prisma, "media-admin-pair-bad@test.com");

      const req = new Request("http://localhost/v1/admin/media/pairs", {
        method: "POST",
        headers: {
          Cookie: `${SESSION_COOKIE_NAME}=${session.token}`,
          "Content-Type": "application/json",
          Origin: "http://localhost",
        },
        body: JSON.stringify({
          contentContext: "bad-assets-pair",
          lightAssetId: "nonexistent-1",
          darkAssetId: "nonexistent-2",
        }),
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(400);
    } finally {
      await prisma.$disconnect();
    }
  });
});

describe("DELETE /v1/admin/media/pairs/:id", () => {
  it("removes pair", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createMediaAdmin(prisma, "media-admin-pair-del@test.com");
      const light = await createTestAsset(prisma);
      const dark = await createTestAsset(prisma);
      const pair = await prisma.mediaPair.create({
        data: { contentContext: "del-pair-ctx", lightAssetId: light.id, darkAssetId: dark.id },
      });

      const req = new Request(`http://localhost/v1/admin/media/pairs/${pair.id}`, {
        method: "DELETE",
        headers: { Cookie: `${SESSION_COOKIE_NAME}=${session.token}`, Origin: "http://localhost" },
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);

      const deleted = await prisma.mediaPair.findUnique({ where: { id: pair.id } });
      expect(deleted).toBeNull();
    } finally {
      await prisma.$disconnect();
    }
  });

  it("returns 404 for non-existent pair", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createMediaAdmin(prisma, "media-admin-pair-del404@test.com");

      const req = new Request("http://localhost/v1/admin/media/pairs/nonexistent", {
        method: "DELETE",
        headers: { Cookie: `${SESSION_COOKIE_NAME}=${session.token}`, Origin: "http://localhost" },
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(404);
    } finally {
      await prisma.$disconnect();
    }
  });
});
