/**
 * Comprehensive tests for Announcement CRUD, Publishing & Visibility API.
 */
import { describe, it, expect, beforeAll } from "vitest";
import { env } from "cloudflare:test";
import { app } from "../index.js";
import { createPrismaClient } from "../lib/prisma.js";
import { createSession, SESSION_COOKIE_NAME } from "../auth/session.js";
import { setupTestDatabase } from "./test-helpers.js";

const ORIGIN = "http://localhost";

// --- Test data ---

let adminToken: string;
let memberToken: string;
let adminRoleId: string;
let categoryId1: string;
let categoryId2: string;
let tagId1: string;

function adminHeaders(): Record<string, string> {
  return {
    Cookie: `${SESSION_COOKIE_NAME}=${adminToken}`,
    Origin: ORIGIN,
    "Content-Type": "application/json",
  };
}

function memberHeaders(): Record<string, string> {
  return {
    Cookie: `${SESSION_COOKIE_NAME}=${memberToken}`,
    Origin: ORIGIN,
    "Content-Type": "application/json",
  };
}

const validContentBlocks = [
  { type: "header", level: 1, text: "Test Header" },
  { type: "text", content: "Test body content" },
];

const validCreateBody = {
  title: "Test Announcement",
  summary: "Test summary for the announcement",
  contentBlocks: validContentBlocks,
  visibility: "public",
  categoryIds: [] as string[], // will be set after seeding
  tagIds: [] as string[],
  roleIds: [],
};

async function fetchApp(path: string, init?: RequestInit) {
  return app.fetch(new Request(`${ORIGIN}${path}`, init), env);
}

beforeAll(async () => {
  await setupTestDatabase();

  const prisma = await createPrismaClient(env.DB);
  try {
    // --- Admin user + role ---
    const adminUser = await prisma.user.create({
      data: { email: `ann-admin-${Date.now()}@test.com`, status: "active" },
    });
    const adminRole = await prisma.role.create({
      data: { name: `ann-admin-role-${Date.now()}`, description: "Admin" },
    });
    adminRoleId = adminRole.id;

    const adminPerms = [
      ["announcement", "read_admin"],
      ["announcement", "create"],
      ["announcement", "update"],
      ["announcement", "delete"],
      ["announcement", "publish"],
      ["announcement", "read"],
      ["category", "read"],
      ["tag", "read"],
    ];
    for (const [resource, action] of adminPerms) {
      let perm = await prisma.permission.findUnique({
        where: { resource_action: { resource: resource!, action: action! } },
      });
      if (!perm) {
        perm = await prisma.permission.create({ data: { resource: resource!, action: action! } });
      }
      try {
        await prisma.rolePermission.create({ data: { roleId: adminRole.id, permissionId: perm.id } });
      } catch { /* dup */ }
    }

    await prisma.userRole.create({ data: { userId: adminUser.id, roleId: adminRole.id } });
    const adminSession = await createSession(prisma, adminUser.id);
    adminToken = adminSession.token;

    // --- Member user + role ---
    const memberUser = await prisma.user.create({
      data: { email: `ann-member-${Date.now()}@test.com`, status: "active" },
    });
    const memberRole = await prisma.role.create({
      data: { name: `ann-member-role-${Date.now()}`, description: "Member" },
    });
    const memberPerms = [
      ["announcement", "read"],
      ["category", "read"],
      ["tag", "read"],
    ];
    for (const [resource, action] of memberPerms) {
      let perm = await prisma.permission.findUnique({
        where: { resource_action: { resource: resource!, action: action! } },
      });
      if (!perm) {
        perm = await prisma.permission.create({ data: { resource: resource!, action: action! } });
      }
      try {
        await prisma.rolePermission.create({ data: { roleId: memberRole.id, permissionId: perm.id } });
      } catch { /* dup */ }
    }

    await prisma.userRole.create({ data: { userId: memberUser.id, roleId: memberRole.id } });
    const memberSession = await createSession(prisma, memberUser.id);
    memberToken = memberSession.token;

    // --- Categories ---
    const cat1 = await prisma.announcementCategory.upsert({
      where: { slug: "ann-test-general" },
      update: {},
      create: { name: `Ann General ${Date.now()}`, slug: "ann-test-general", sortOrder: 0, isActive: 1 },
    });
    categoryId1 = cat1.id;

    const cat2 = await prisma.announcementCategory.upsert({
      where: { slug: "ann-test-dev" },
      update: {},
      create: { name: `Ann Dev ${Date.now()}`, slug: "ann-test-dev", sortOrder: 1, isActive: 1 },
    });
    categoryId2 = cat2.id;

    // --- Tag ---
    const tag = await prisma.announcementTag.upsert({
      where: { slug: "ann-test-infra" },
      update: {},
      create: { name: `Ann Infra ${Date.now()}`, slug: "ann-test-infra" },
    });
    tagId1 = tag.id;

    // Set up validCreateBody with real IDs
    validCreateBody.categoryIds = [categoryId1];
    validCreateBody.tagIds = [tagId1];
  } finally {
    await prisma.$disconnect();
  }
});

// --- Tests ---

describe("Announcement Admin API", () => {
  let createdAnnouncementId: string;

  beforeAll(async () => {
    // Create a base announcement via the API for subsequent tests
    const res = await fetchApp("/v1/admin/announcements", {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify(validCreateBody),
    });
    const data = await res.json() as Record<string, unknown>;
    createdAnnouncementId = data.id as string;
  });

  describe("POST /v1/admin/announcements - Create", () => {
    it("creates a draft announcement", async () => {
      const res = await fetchApp("/v1/admin/announcements", {
        method: "POST",
        headers: adminHeaders(),
        body: JSON.stringify({ ...validCreateBody, title: "Another Draft" }),
      });
      expect(res.status).toBe(201);
      const data = await res.json() as Record<string, unknown>;
      expect(data.title).toBe("Another Draft");
      expect(data.status).toBe("draft");
      expect(data.visibility).toBe("public");
      expect(Array.isArray(data.categories)).toBe(true);
    });

    it("strips CRLF from title and summary", async () => {
      const res = await fetchApp("/v1/admin/announcements", {
        method: "POST",
        headers: adminHeaders(),
        body: JSON.stringify({
          ...validCreateBody,
          title: "Title\r\nWith\nNewlines",
          summary: "Summary\r\nWith\nBreaks",
        }),
      });
      expect(res.status).toBe(201);
      const data = await res.json() as Record<string, unknown>;
      expect(data.title).toBe("Title  With Newlines");
      expect(data.summary).toBe("Summary  With Breaks");
    });

    it("rejects XSS content blocks", async () => {
      const res = await fetchApp("/v1/admin/announcements", {
        method: "POST",
        headers: adminHeaders(),
        body: JSON.stringify({
          ...validCreateBody,
          contentBlocks: [{ type: "text", content: '<script>alert("xss")</script>' }],
        }),
      });
      expect(res.status).toBe(400);
    });

    it("rejects XSS in title", async () => {
      const res = await fetchApp("/v1/admin/announcements", {
        method: "POST",
        headers: adminHeaders(),
        body: JSON.stringify({
          ...validCreateBody,
          title: '<script>alert("xss")</script>',
        }),
      });
      expect(res.status).toBe(400);
    });

    it("rejects private announcement without roleIds", async () => {
      const res = await fetchApp("/v1/admin/announcements", {
        method: "POST",
        headers: adminHeaders(),
        body: JSON.stringify({
          ...validCreateBody,
          visibility: "private",
          roleIds: [],
        }),
      });
      expect(res.status).toBe(400);
      const data = await res.json() as Record<string, unknown>;
      expect(data.error).toBe("VALIDATION_ERROR");
    });

    it("rejects missing categories", async () => {
      const res = await fetchApp("/v1/admin/announcements", {
        method: "POST",
        headers: adminHeaders(),
        body: JSON.stringify({
          ...validCreateBody,
          categoryIds: [],
        }),
      });
      expect(res.status).toBe(400);
    });

    it("rejects invalid category IDs", async () => {
      const res = await fetchApp("/v1/admin/announcements", {
        method: "POST",
        headers: adminHeaders(),
        body: JSON.stringify({
          ...validCreateBody,
          categoryIds: ["nonexistent-cat"],
        }),
      });
      expect(res.status).toBe(400);
    });

    it("returns 403 for member without create permission", async () => {
      const res = await fetchApp("/v1/admin/announcements", {
        method: "POST",
        headers: memberHeaders(),
        body: JSON.stringify(validCreateBody),
      });
      expect(res.status).toBe(403);
    });
  });

  describe("GET /v1/admin/announcements - Admin List", () => {
    it("lists all announcements for admin", async () => {
      const res = await fetchApp("/v1/admin/announcements", {
        headers: adminHeaders(),
      });
      expect(res.status).toBe(200);
      const data = await res.json() as { announcements: unknown[]; pagination: { total: number } };
      expect(Array.isArray(data.announcements)).toBe(true);
      expect(data.pagination.total).toBeGreaterThan(0);
    });

    it("returns 403 for member (no announcement:read_admin)", async () => {
      const res = await fetchApp("/v1/admin/announcements", {
        headers: memberHeaders(),
      });
      expect(res.status).toBe(403);
    });

    it("verifies announcement:read does NOT grant admin access", async () => {
      // member has announcement:read but not announcement:read_admin
      const res = await fetchApp("/v1/admin/announcements", {
        headers: memberHeaders(),
      });
      expect(res.status).toBe(403);
    });
  });

  describe("GET /v1/admin/announcements/:id - Admin Get", () => {
    it("returns announcement by ID for admin", async () => {
      const res = await fetchApp(`/v1/admin/announcements/${createdAnnouncementId}`, {
        headers: adminHeaders(),
      });
      expect(res.status).toBe(200);
      const data = await res.json() as Record<string, unknown>;
      expect(data.id).toBe(createdAnnouncementId);
    });

    it("returns 404 for nonexistent ID", async () => {
      const res = await fetchApp("/v1/admin/announcements/nonexistent", {
        headers: adminHeaders(),
      });
      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /v1/admin/announcements/:id - Update", () => {
    it("updates title and summary", async () => {
      const res = await fetchApp(`/v1/admin/announcements/${createdAnnouncementId}`, {
        method: "PATCH",
        headers: adminHeaders(),
        body: JSON.stringify({ title: "Updated Title", summary: "Updated summary" }),
      });
      expect(res.status).toBe(200);
      const data = await res.json() as Record<string, unknown>;
      expect(data.title).toBe("Updated Title");
      expect(data.summary).toBe("Updated summary");
    });

    it("regenerates slug when title changes in draft", async () => {
      const res = await fetchApp(`/v1/admin/announcements/${createdAnnouncementId}`, {
        method: "PATCH",
        headers: adminHeaders(),
        body: JSON.stringify({ title: "New Title For Slug" }),
      });
      expect(res.status).toBe(200);
      const data = await res.json() as Record<string, unknown>;
      expect(data.slug).toBe("new-title-for-slug");
    });

    it("replaces categories on update", async () => {
      const res = await fetchApp(`/v1/admin/announcements/${createdAnnouncementId}`, {
        method: "PATCH",
        headers: adminHeaders(),
        body: JSON.stringify({ categoryIds: [categoryId2] }),
      });
      expect(res.status).toBe(200);
      const data = await res.json() as { categories: { id: string }[] };
      expect(data.categories).toHaveLength(1);
      expect(data.categories[0]!.id).toBe(categoryId2);
    });

    it("rejects changing visibility to private without roleIds", async () => {
      // createdAnnouncementId is public with no roles
      const res = await fetchApp(`/v1/admin/announcements/${createdAnnouncementId}`, {
        method: "PATCH",
        headers: adminHeaders(),
        body: JSON.stringify({ visibility: "private" }),
      });
      expect(res.status).toBe(400);
      const data = await res.json() as Record<string, unknown>;
      expect(data.error).toBe("VALIDATION_ERROR");
    });

    it("returns 403 for member", async () => {
      const res = await fetchApp(`/v1/admin/announcements/${createdAnnouncementId}`, {
        method: "PATCH",
        headers: memberHeaders(),
        body: JSON.stringify({ title: "Forbidden" }),
      });
      expect(res.status).toBe(403);
    });
  });

  describe("POST /v1/admin/announcements/:id/publish - Publish", () => {
    // Helper: create a fresh draft and return its id + slug
    async function createDraft(title = `Pub Test ${Date.now()}`) {
      const res = await fetchApp("/v1/admin/announcements", {
        method: "POST",
        headers: adminHeaders(),
        body: JSON.stringify({ ...validCreateBody, title }),
      });
      return (await res.json()) as { id: string; slug: string };
    }

    it("publishes a draft announcement", async () => {
      const draft = await createDraft();
      const res = await fetchApp(`/v1/admin/announcements/${draft.id}/publish`, {
        method: "POST",
        headers: adminHeaders(),
      });
      expect(res.status).toBe(200);
      const data = await res.json() as Record<string, unknown>;
      expect(data.message).toBeDefined();
    });

    it("returns 409 for double-publish (optimistic locking)", async () => {
      const draft = await createDraft();
      // First publish
      const pub1 = await fetchApp(`/v1/admin/announcements/${draft.id}/publish`, {
        method: "POST",
        headers: adminHeaders(),
      });
      expect(pub1.status).toBe(200);
      // Second publish should 409
      const pub2 = await fetchApp(`/v1/admin/announcements/${draft.id}/publish`, {
        method: "POST",
        headers: adminHeaders(),
      });
      expect(pub2.status).toBe(409);
    });

    it("freezes slug when title updated after publish", async () => {
      const draft = await createDraft("Freeze Slug Test");
      const originalSlug = draft.slug;
      // Publish it
      await fetchApp(`/v1/admin/announcements/${draft.id}/publish`, {
        method: "POST",
        headers: adminHeaders(),
      });
      // Update title — slug should NOT change
      const res = await fetchApp(`/v1/admin/announcements/${draft.id}`, {
        method: "PATCH",
        headers: adminHeaders(),
        body: JSON.stringify({ title: "Changed After Publish" }),
      });
      expect(res.status).toBe(200);
      const data = await res.json() as { slug: string; warnings?: string[] };
      expect(data.slug).toBe(originalSlug);
      expect(data.warnings).toBeDefined();
      expect(data.warnings!.some((w: string) => w.includes("slug"))).toBe(true);
    });

    it("sets lastEditedAt when content edited after publish", async () => {
      const draft = await createDraft("LastEdited Test");
      // Publish it
      await fetchApp(`/v1/admin/announcements/${draft.id}/publish`, {
        method: "POST",
        headers: adminHeaders(),
      });
      // Edit after publish
      const res = await fetchApp(`/v1/admin/announcements/${draft.id}`, {
        method: "PATCH",
        headers: adminHeaders(),
        body: JSON.stringify({ summary: "Edited after publish" }),
      });
      expect(res.status).toBe(200);
      const data = await res.json() as Record<string, unknown>;
      expect(data.lastEditedAt).not.toBeNull();
    });

    it("returns 403 for member", async () => {
      const draft = await createDraft("Member Publish Perm");
      const res = await fetchApp(`/v1/admin/announcements/${draft.id}/publish`, {
        method: "POST",
        headers: memberHeaders(),
      });
      expect(res.status).toBe(403);
    });
  });

  describe("POST /v1/admin/announcements/:id/unpublish - Unpublish", () => {
    it("unpublishes a published announcement", async () => {
      // Create and publish
      const createRes = await fetchApp("/v1/admin/announcements", {
        method: "POST",
        headers: adminHeaders(),
        body: JSON.stringify({ ...validCreateBody, title: `Unpub Test ${Date.now()}` }),
      });
      const draft = await createRes.json() as { id: string };
      await fetchApp(`/v1/admin/announcements/${draft.id}/publish`, {
        method: "POST",
        headers: adminHeaders(),
      });
      // Now unpublish
      const res = await fetchApp(`/v1/admin/announcements/${draft.id}/unpublish`, {
        method: "POST",
        headers: adminHeaders(),
      });
      expect(res.status).toBe(200);
      const data = await res.json() as Record<string, unknown>;
      expect(data.message).toBeDefined();
    });

    it("returns 400 for non-published announcement", async () => {
      // createdAnnouncementId is still a draft (from beforeAll)
      const res = await fetchApp(`/v1/admin/announcements/${createdAnnouncementId}/unpublish`, {
        method: "POST",
        headers: adminHeaders(),
      });
      expect(res.status).toBe(400);
    });
  });

  describe("POST /v1/admin/announcements/:id/archive - Archive", () => {
    it("archives an announcement", async () => {
      const res = await fetchApp(`/v1/admin/announcements/${createdAnnouncementId}/archive`, {
        method: "POST",
        headers: adminHeaders(),
      });
      expect(res.status).toBe(200);
    });

    it("rejects updates to archived announcement", async () => {
      // Create and archive a fresh one
      const createRes = await fetchApp("/v1/admin/announcements", {
        method: "POST",
        headers: adminHeaders(),
        body: JSON.stringify({ ...validCreateBody, title: `Archive Test ${Date.now()}` }),
      });
      const draft = await createRes.json() as { id: string };
      await fetchApp(`/v1/admin/announcements/${draft.id}/archive`, {
        method: "POST",
        headers: adminHeaders(),
      });
      // Try to update
      const res = await fetchApp(`/v1/admin/announcements/${draft.id}`, {
        method: "PATCH",
        headers: adminHeaders(),
        body: JSON.stringify({ title: "Should Fail" }),
      });
      expect(res.status).toBe(400);
      const data = await res.json() as Record<string, unknown>;
      expect(data.error).toBe("CANNOT_UPDATE_ARCHIVED");
    });
  });
});

describe("Public Announcement API - Visibility Filtering", () => {
  let publicSlug: string;
  let privateSlug: string;

  beforeAll(async () => {
    // Create and publish a public announcement
    const pubRes = await fetchApp("/v1/admin/announcements", {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify({
        ...validCreateBody,
        title: "Public Visibility Test",
      }),
    });
    const pubData = await pubRes.json() as { id: string; slug: string };
    publicSlug = pubData.slug;

    await fetchApp(`/v1/admin/announcements/${pubData.id}/publish`, {
      method: "POST",
      headers: adminHeaders(),
    });

    // Create and publish a private announcement (visible only to admin role)
    const privRes = await fetchApp("/v1/admin/announcements", {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify({
        ...validCreateBody,
        title: "Private Admin Only",
        visibility: "private",
        roleIds: [adminRoleId],
      }),
    });
    const privData = await privRes.json() as { id: string; slug: string };
    privateSlug = privData.slug;

    await fetchApp(`/v1/admin/announcements/${privData.id}/publish`, {
      method: "POST",
      headers: adminHeaders(),
    });
  });

  describe("GET /v1/announcements - Public List", () => {
    it("unauthenticated user sees only public announcements", async () => {
      const res = await fetchApp("/v1/announcements", {
        headers: { Origin: ORIGIN },
      });
      expect(res.status).toBe(200);
      const data = await res.json() as { announcements: Array<{ visibility: string; title: string }> };
      // Should see public but NOT private
      const titles = data.announcements.map((a) => a.title);
      expect(titles).toContain("Public Visibility Test");
      expect(titles).not.toContain("Private Admin Only");
    });

    it("member without matching role does NOT see private announcements", async () => {
      const res = await fetchApp("/v1/announcements", {
        headers: {
          Cookie: `${SESSION_COOKIE_NAME}=${memberToken}`,
          Origin: ORIGIN,
        },
      });
      expect(res.status).toBe(200);
      const data = await res.json() as { announcements: Array<{ title: string }> };
      const titles = data.announcements.map((a) => a.title);
      expect(titles).not.toContain("Private Admin Only");
    });

    it("admin with matching role sees private announcements", async () => {
      const res = await fetchApp("/v1/announcements", {
        headers: {
          Cookie: `${SESSION_COOKIE_NAME}=${adminToken}`,
          Origin: ORIGIN,
        },
      });
      expect(res.status).toBe(200);
      const data = await res.json() as { announcements: Array<{ title: string }> };
      const titles = data.announcements.map((a) => a.title);
      expect(titles).toContain("Public Visibility Test");
      expect(titles).toContain("Private Admin Only");
    });

    it("pagination total only reflects visible announcements", async () => {
      const res = await fetchApp("/v1/announcements", {
        headers: { Origin: ORIGIN },
      });
      const data = await res.json() as { pagination: { total: number }; announcements: unknown[] };
      // Total should equal the actual array length (no hidden items counted)
      expect(data.pagination.total).toBe(data.announcements.length);
    });
  });

  describe("GET /v1/announcements/:slug - Public Get", () => {
    it("returns public announcement to unauthenticated user", async () => {
      const res = await fetchApp(`/v1/announcements/${publicSlug}`, {
        headers: { Origin: ORIGIN },
      });
      expect(res.status).toBe(200);
      const data = await res.json() as Record<string, unknown>;
      expect(data.title).toBe("Public Visibility Test");
    });

    it("returns 404 for private announcement to unauthenticated user (no info leakage)", async () => {
      const res = await fetchApp(`/v1/announcements/${privateSlug}`, {
        headers: { Origin: ORIGIN },
      });
      expect(res.status).toBe(404);
    });

    it("returns 404 for private announcement to member without role (no info leakage)", async () => {
      const res = await fetchApp(`/v1/announcements/${privateSlug}`, {
        headers: {
          Cookie: `${SESSION_COOKIE_NAME}=${memberToken}`,
          Origin: ORIGIN,
        },
      });
      expect(res.status).toBe(404);
    });

    it("returns private announcement to admin with matching role", async () => {
      const res = await fetchApp(`/v1/announcements/${privateSlug}`, {
        headers: {
          Cookie: `${SESSION_COOKIE_NAME}=${adminToken}`,
          Origin: ORIGIN,
        },
      });
      expect(res.status).toBe(200);
      const data = await res.json() as Record<string, unknown>;
      expect(data.title).toBe("Private Admin Only");
    });

    it("returns 404 for nonexistent slug", async () => {
      const res = await fetchApp("/v1/announcements/does-not-exist", {
        headers: { Origin: ORIGIN },
      });
      expect(res.status).toBe(404);
    });

    it("private 404 is identical to nonexistent 404 (no info leakage)", async () => {
      const nonexistentRes = await fetchApp("/v1/announcements/does-not-exist", {
        headers: { Origin: ORIGIN },
      });
      const privateRes = await fetchApp(`/v1/announcements/${privateSlug}`, {
        headers: { Origin: ORIGIN },
      });
      const nonexistentData = await nonexistentRes.json();
      const privateData = await privateRes.json();
      expect(nonexistentRes.status).toBe(privateRes.status);
      expect(nonexistentData).toEqual(privateData);
    });
  });
});

describe("Slug Generation", () => {
  it("generates unique slugs for duplicate titles", async () => {
    const title = `Duplicate Title ${Date.now()}`;
    const slug = title.toLowerCase().replace(/\s+/g, "-");
    const res1 = await fetchApp("/v1/admin/announcements", {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify({ ...validCreateBody, title }),
    });
    const res2 = await fetchApp("/v1/admin/announcements", {
      method: "POST",
      headers: adminHeaders(),
      body: JSON.stringify({ ...validCreateBody, title }),
    });
    expect(res1.status).toBe(201);
    expect(res2.status).toBe(201);
    const data1 = await res1.json() as { slug: string };
    const data2 = await res2.json() as { slug: string };
    expect(data1.slug).toBe(slug);
    expect(data2.slug).toBe(`${slug}-2`);
  });
});
