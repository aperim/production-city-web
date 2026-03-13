/**
 * Security audit tests for media API endpoints (#164).
 *
 * Verifies: localPath exclusion, field sanitization, input validation,
 * CSRF, auth guards, archived asset handling.
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

/** Create an admin user with media:manage permission */
async function createMediaAdmin(
  prisma: Awaited<ReturnType<typeof createPrismaClient>>,
  email: string,
) {
  const user = await prisma.user.create({
    data: { email, status: "active" },
  });

  const role = await prisma.role.create({
    data: { name: `sec-admin-${user.id.slice(0, 8)}`, description: "Security Test Admin" },
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
async function createSecurityTestAsset(
  prisma: Awaited<ReturnType<typeof createPrismaClient>>,
  overrides: Record<string, unknown> = {},
) {
  const id = `sec-asset-${Math.random().toString(36).slice(2, 10)}`;
  return prisma.mediaAsset.create({
    data: {
      id,
      source: "pexels",
      externalId: `ext-${id}`,
      externalUrl: "https://www.pexels.com/photo/12345",
      photographer: "Security Test Photographer",
      photographerUrl: "https://www.pexels.com/@sectest",
      originalWidth: 1920,
      originalHeight: 1080,
      alt: "Security test image",
      mimeType: "image/jpeg",
      localPath: `public/media/test/${id}.jpg`,
      publicPath: `/media/test/${id}.jpg`,
      downloadUrl: "https://images.pexels.com/photos/12345/original.jpeg",
      license: "pexels",
      themeVariant: "light",
      contentContext: `ctx-${id}`,
      reviewStatus: "accepted",
      ...overrides,
    },
  });
}

// --- localPath never in public response ---

describe("Security: localPath exclusion from public API", () => {
  it("GET /v1/media/pairs/:context — response has no localPath", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const light = await createSecurityTestAsset(prisma, { themeVariant: "light" });
      const dark = await createSecurityTestAsset(prisma, { themeVariant: "dark" });
      await prisma.mediaPair.create({
        data: { contentContext: "sec-pair-ctx", lightAssetId: light.id, darkAssetId: dark.id },
      });

      const req = new Request("http://localhost/v1/media/pairs/sec-pair-ctx");
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);

      const text = await res.text();
      expect(text).not.toContain("localPath");
      expect(text).not.toContain("downloadUrl");
      expect(text).not.toContain("public/media/");
    } finally {
      await prisma.$disconnect();
    }
  });

  it("GET /v1/media/assets/:id — response has no localPath", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const asset = await createSecurityTestAsset(prisma);

      const req = new Request(`http://localhost/v1/media/assets/${asset.id}`);
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);

      const text = await res.text();
      expect(text).not.toContain("localPath");
      expect(text).not.toContain("downloadUrl");
    } finally {
      await prisma.$disconnect();
    }
  });

  it("GET /v1/media/pairs (batch) — response has no localPath", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const light = await createSecurityTestAsset(prisma, { themeVariant: "light" });
      const dark = await createSecurityTestAsset(prisma, { themeVariant: "dark" });
      await prisma.mediaPair.create({
        data: { contentContext: "sec-batch-ctx", lightAssetId: light.id, darkAssetId: dark.id },
      });

      const req = new Request("http://localhost/v1/media/pairs?contexts=sec-batch-ctx");
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);

      const text = await res.text();
      expect(text).not.toContain("localPath");
      expect(text).not.toContain("downloadUrl");
    } finally {
      await prisma.$disconnect();
    }
  });
});

// --- Archived asset exclusion ---

describe("Security: archived assets excluded from public API", () => {
  it("archived asset returns 404 from public endpoint", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const asset = await createSecurityTestAsset(prisma, { archivedAt: new Date() });

      const req = new Request(`http://localhost/v1/media/assets/${asset.id}`);
      const res = await app.fetch(req, env);
      expect(res.status).toBe(404);
    } finally {
      await prisma.$disconnect();
    }
  });

  it("pair with archived light asset returns 404", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const light = await createSecurityTestAsset(prisma, {
        themeVariant: "light",
        archivedAt: new Date(),
      });
      const dark = await createSecurityTestAsset(prisma, { themeVariant: "dark" });
      await prisma.mediaPair.create({
        data: { contentContext: "sec-archived-ctx", lightAssetId: light.id, darkAssetId: dark.id },
      });

      const req = new Request("http://localhost/v1/media/pairs/sec-archived-ctx");
      const res = await app.fetch(req, env);
      expect(res.status).toBe(404);
    } finally {
      await prisma.$disconnect();
    }
  });

  it("rejected single asset returns 404 from public endpoint", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const asset = await createSecurityTestAsset(prisma, { reviewStatus: "rejected" });

      const req = new Request(`http://localhost/v1/media/assets/${asset.id}`);
      const res = await app.fetch(req, env);
      expect(res.status).toBe(404);
    } finally {
      await prisma.$disconnect();
    }
  });

  it("pending single asset returns 404 from public endpoint", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const asset = await createSecurityTestAsset(prisma, { reviewStatus: "pending" });

      const req = new Request(`http://localhost/v1/media/assets/${asset.id}`);
      const res = await app.fetch(req, env);
      expect(res.status).toBe(404);
    } finally {
      await prisma.$disconnect();
    }
  });

  it("pair with rejected asset returns 404", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const light = await createSecurityTestAsset(prisma, {
        themeVariant: "light",
        reviewStatus: "rejected",
      });
      const dark = await createSecurityTestAsset(prisma, { themeVariant: "dark" });
      await prisma.mediaPair.create({
        data: { contentContext: "sec-rejected-ctx", lightAssetId: light.id, darkAssetId: dark.id },
      });

      const req = new Request("http://localhost/v1/media/pairs/sec-rejected-ctx");
      const res = await app.fetch(req, env);
      expect(res.status).toBe(404);
    } finally {
      await prisma.$disconnect();
    }
  });
});

// --- Input validation ---

describe("Security: input validation on content context", () => {
  it("rejects path traversal attempts", async () => {
    const payloads = ["../etc/passwd", "..%2F..%2F", "....//"];
    for (const payload of payloads) {
      const req = new Request(`http://localhost/v1/media/pairs/${encodeURIComponent(payload)}`);
      const res = await app.fetch(req, env);
      expect(res.status).toBe(400);
    }
  });

  it("rejects script injection in context", async () => {
    const payloads = ["<script>alert(1)</script>", "';DROP TABLE;--"];
    for (const payload of payloads) {
      const req = new Request(`http://localhost/v1/media/pairs/${encodeURIComponent(payload)}`);
      const res = await app.fetch(req, env);
      expect(res.status).toBe(400);
    }
  });

  it("rejects oversized context (>100 chars)", async () => {
    const longCtx = "a".repeat(101);
    const req = new Request(`http://localhost/v1/media/pairs/${longCtx}`);
    const res = await app.fetch(req, env);
    expect(res.status).toBe(400);
  });
});

// --- Admin auth enforcement ---

describe("Security: admin media endpoints require auth", () => {
  it("GET /v1/admin/media/assets returns 401 without auth", async () => {
    const req = new Request("http://localhost/v1/admin/media/assets");
    const res = await app.fetch(req, env);
    expect(res.status).toBe(401);
  });

  it("PATCH /v1/admin/media/assets/:id returns 401 without auth", async () => {
    const req = new Request("http://localhost/v1/admin/media/assets/some-id", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Origin: "http://localhost" },
      body: JSON.stringify({ alt: "test" }),
    });
    const res = await app.fetch(req, env);
    expect(res.status).toBe(401);
  });

  it("DELETE /v1/admin/media/assets/:id returns 401 without auth", async () => {
    const req = new Request("http://localhost/v1/admin/media/assets/some-id", {
      method: "DELETE",
      headers: { Origin: "http://localhost" },
    });
    const res = await app.fetch(req, env);
    expect(res.status).toBe(401);
  });

  it("POST /v1/admin/media/pairs returns 401 without auth", async () => {
    const req = new Request("http://localhost/v1/admin/media/pairs", {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: "http://localhost" },
      body: JSON.stringify({ contentContext: "test", lightAssetId: "a", darkAssetId: "b" }),
    });
    const res = await app.fetch(req, env);
    expect(res.status).toBe(401);
  });
});

// --- CSRF enforcement on admin mutations ---

describe("Security: CSRF on admin media mutations", () => {
  it("PATCH without Origin header is rejected", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createMediaAdmin(prisma, "csrf-patch@test.com");
      const asset = await createSecurityTestAsset(prisma);

      const req = new Request(`http://localhost/v1/admin/media/assets/${asset.id}`, {
        method: "PATCH",
        headers: {
          Cookie: `${SESSION_COOKIE_NAME}=${session.token}`,
          "Content-Type": "application/json",
          // No Origin header
        },
        body: JSON.stringify({ alt: "hacked" }),
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(403);
      const body = await res.json() as Record<string, string>;
      expect(body.error).toBe("csrf_failed");
    } finally {
      await prisma.$disconnect();
    }
  });

  it("PATCH with mismatched Origin is rejected", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createMediaAdmin(prisma, "csrf-mismatch@test.com");
      const asset = await createSecurityTestAsset(prisma);

      const req = new Request(`http://localhost/v1/admin/media/assets/${asset.id}`, {
        method: "PATCH",
        headers: {
          Cookie: `${SESSION_COOKIE_NAME}=${session.token}`,
          "Content-Type": "application/json",
          Origin: "https://evil.example.com",
        },
        body: JSON.stringify({ alt: "hacked" }),
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(403);
      const body = await res.json() as Record<string, string>;
      expect(body.error).toBe("csrf_failed");
    } finally {
      await prisma.$disconnect();
    }
  });
});

// --- Error response sanitization ---

describe("Security: error response sanitization", () => {
  it("404 does not leak internal paths", async () => {
    const req = new Request("http://localhost/v1/media/assets/nonexistent");
    const res = await app.fetch(req, env);
    expect(res.status).toBe(404);

    const text = await res.text();
    expect(text).not.toContain("public/media/");
    expect(text).not.toContain("/home/");
    expect(text).not.toContain("node_modules");
  });

  it("400 does not leak stack traces", async () => {
    const req = new Request("http://localhost/v1/media/pairs/invalid%20context!");
    const res = await app.fetch(req, env);
    expect(res.status).toBe(400);

    const text = await res.text();
    expect(text).not.toContain("at ");
    expect(text).not.toContain(".ts:");
  });
});

// --- Admin mutation creates audit log ---

describe("Security: audit logging for admin media mutations", () => {
  it("PATCH creates audit log entry", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session, user } = await createMediaAdmin(prisma, "audit-patch@test.com");
      const asset = await createSecurityTestAsset(prisma);

      const req = new Request(`http://localhost/v1/admin/media/assets/${asset.id}`, {
        method: "PATCH",
        headers: {
          Cookie: `${SESSION_COOKIE_NAME}=${session.token}`,
          "Content-Type": "application/json",
          Origin: "http://localhost",
        },
        body: JSON.stringify({ alt: "Audit test" }),
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);

      // Verify audit log was created
      const auditEntry = await prisma.auditLog.findFirst({
        where: { actorId: user.id, action: "media.asset.updated" },
        orderBy: { createdAt: "desc" },
      });
      expect(auditEntry).not.toBeNull();
      expect(auditEntry!.resource).toBe("media_asset");
    } finally {
      await prisma.$disconnect();
    }
  });

  it("DELETE (archive) creates audit log entry", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session, user } = await createMediaAdmin(prisma, "audit-del@test.com");
      const asset = await createSecurityTestAsset(prisma);

      const req = new Request(`http://localhost/v1/admin/media/assets/${asset.id}`, {
        method: "DELETE",
        headers: {
          Cookie: `${SESSION_COOKIE_NAME}=${session.token}`,
          Origin: "http://localhost",
        },
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);

      const auditEntry = await prisma.auditLog.findFirst({
        where: { actorId: user.id, action: "media.asset.archived" },
        orderBy: { createdAt: "desc" },
      });
      expect(auditEntry).not.toBeNull();
    } finally {
      await prisma.$disconnect();
    }
  });
});

// --- Cache headers ---

describe("Security: cache headers on public endpoints", () => {
  it("public pair endpoint sets Cache-Control and X-Content-Type-Options", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const light = await createSecurityTestAsset(prisma, { themeVariant: "light" });
      const dark = await createSecurityTestAsset(prisma, { themeVariant: "dark" });
      await prisma.mediaPair.create({
        data: { contentContext: "cache-header-ctx", lightAssetId: light.id, darkAssetId: dark.id },
      });

      const req = new Request("http://localhost/v1/media/pairs/cache-header-ctx");
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);

      expect(res.headers.get("Cache-Control")).toBe("public, max-age=300, stale-while-revalidate=600");
      expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
      expect(res.headers.get("ETag")).toBeTruthy();
    } finally {
      await prisma.$disconnect();
    }
  });
});
