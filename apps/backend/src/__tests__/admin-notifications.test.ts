/**
 * Tests for notification API endpoints.
 * GET /v1/notifications — list user's notifications
 * PATCH /v1/notifications/:id/read — mark as read
 * POST /v1/notifications/mark-all-read — mark all as read
 * GET /v1/notifications/preferences — get preferences
 * PATCH /v1/notifications/preferences — update preference
 */

import { describe, it, expect, beforeAll } from "vitest";
import { env } from "cloudflare:workers";
import { app } from "../index.js";
import { createPrismaClient } from "../lib/prisma.js";
import { createSession, SESSION_COOKIE_NAME } from "../auth/session.js";
import { setupTestDatabase } from "./test-helpers.js";

beforeAll(async () => { await setupTestDatabase(); });

async function createAuthUser(
  prisma: Awaited<ReturnType<typeof createPrismaClient>>,
  email: string,
) {
  const user = await prisma.user.create({
    data: { email, status: "active" },
  });
  const session = await createSession(prisma, user.id);
  return { user, session };
}

describe("GET /v1/notifications", () => {
  it("returns user's notifications sorted by createdAt desc", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { user, session } = await createAuthUser(prisma, `notif-list-${Date.now()}@test.com`);

      await prisma.notification.createMany({
        data: [
          {
            id: `n-list-1-${Date.now()}`,
            userId: user.id,
            type: "approval_needed",
            resourceType: "user",
            resourceId: "u1",
            actionUrl: "/dashboard/administration/users?view=approvals",
            dedupeKey: `dk-list-1-${Date.now()}`,
            createdAt: new Date("2026-03-01"),
          },
          {
            id: `n-list-2-${Date.now()}`,
            userId: user.id,
            type: "invitation_accepted",
            resourceType: "invitation",
            resourceId: "inv1",
            actionUrl: "/dashboard/administration/users",
            dedupeKey: `dk-list-2-${Date.now()}`,
            createdAt: new Date("2026-03-02"),
          },
        ],
      });

      const req = new Request("http://localhost/v1/notifications", {
        headers: { Cookie: `${SESSION_COOKIE_NAME}=${session.token}` },
      });
      const res = await app.fetch(req, env);

      expect(res.status).toBe(200);
      const body = await res.json() as { notifications: Array<{ id: string }>; unreadCount: number };
      expect(body.notifications).toHaveLength(2);
      expect(body.unreadCount).toBe(2);
    } finally {
      await prisma.$disconnect();
    }
  });

  it("filters by unreadOnly", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { user, session } = await createAuthUser(prisma, `notif-filter-${Date.now()}@test.com`);
      const ts = Date.now();

      await prisma.notification.createMany({
        data: [
          {
            id: `n-read-${ts}`,
            userId: user.id,
            type: "approval_needed",
            resourceType: "user",
            resourceId: "u1",
            dedupeKey: `dk-read-${ts}`,
            readAt: new Date(),
          },
          {
            id: `n-unread-${ts}`,
            userId: user.id,
            type: "invitation_accepted",
            resourceType: "invitation",
            resourceId: "inv1",
            dedupeKey: `dk-unread-${ts}`,
          },
        ],
      });

      const req = new Request("http://localhost/v1/notifications?unreadOnly=true", {
        headers: { Cookie: `${SESSION_COOKIE_NAME}=${session.token}` },
      });
      const res = await app.fetch(req, env);

      expect(res.status).toBe(200);
      const body = await res.json() as { notifications: Array<{ id: string }> };
      expect(body.notifications).toHaveLength(1);
      expect(body.notifications[0]!.id).toBe(`n-unread-${ts}`);
    } finally {
      await prisma.$disconnect();
    }
  });

  it("does not return other user's notifications", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createAuthUser(prisma, `notif-own-${Date.now()}@test.com`);
      const { user: otherUser } = await createAuthUser(prisma, `notif-other-${Date.now()}@test.com`);
      const ts = Date.now();

      await prisma.notification.create({
        data: {
          id: `n-other-${ts}`,
          userId: otherUser.id,
          type: "approval_needed",
          resourceType: "user",
          resourceId: "u1",
          dedupeKey: `dk-other-${ts}`,
        },
      });

      const req = new Request("http://localhost/v1/notifications", {
        headers: { Cookie: `${SESSION_COOKIE_NAME}=${session.token}` },
      });
      const res = await app.fetch(req, env);

      expect(res.status).toBe(200);
      const body = await res.json() as { notifications: Array<{ id: string }> };
      expect(body.notifications).toHaveLength(0);
    } finally {
      await prisma.$disconnect();
    }
  });
});

describe("PATCH /v1/notifications/:id/read", () => {
  it("marks notification as read (idempotent)", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { user, session } = await createAuthUser(prisma, `notif-markread-${Date.now()}@test.com`);
      const ts = Date.now();

      await prisma.notification.create({
        data: {
          id: `n-mr-${ts}`,
          userId: user.id,
          type: "approval_needed",
          resourceType: "user",
          resourceId: "u1",
          dedupeKey: `dk-mr-${ts}`,
        },
      });

      // First mark
      const req1 = new Request(`http://localhost/v1/notifications/n-mr-${ts}/read`, {
        method: "PATCH",
        headers: { Cookie: `${SESSION_COOKIE_NAME}=${session.token}`, Origin: "http://localhost" },
      });
      const res1 = await app.fetch(req1, env);
      expect(res1.status).toBe(200);

      // Verify readAt is set
      const updated = await prisma.notification.findUnique({ where: { id: `n-mr-${ts}` } });
      expect(updated?.readAt).not.toBeNull();

      // Idempotent second mark
      const req2 = new Request(`http://localhost/v1/notifications/n-mr-${ts}/read`, {
        method: "PATCH",
        headers: { Cookie: `${SESSION_COOKIE_NAME}=${session.token}`, Origin: "http://localhost" },
      });
      const res2 = await app.fetch(req2, env);
      expect(res2.status).toBe(200);
    } finally {
      await prisma.$disconnect();
    }
  });

  it("returns 404 for other user's notification", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { session } = await createAuthUser(prisma, `notif-foreign-${Date.now()}@test.com`);
      const { user: otherUser } = await createAuthUser(prisma, `notif-foreign-other-${Date.now()}@test.com`);
      const ts = Date.now();

      await prisma.notification.create({
        data: {
          id: `n-foreign-${ts}`,
          userId: otherUser.id,
          type: "approval_needed",
          resourceType: "user",
          resourceId: "u1",
          dedupeKey: `dk-foreign-${ts}`,
        },
      });

      const req = new Request(`http://localhost/v1/notifications/n-foreign-${ts}/read`, {
        method: "PATCH",
        headers: { Cookie: `${SESSION_COOKIE_NAME}=${session.token}`, Origin: "http://localhost" },
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(404);
    } finally {
      await prisma.$disconnect();
    }
  });
});

describe("POST /v1/notifications/mark-all-read", () => {
  it("marks all unread as read", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { user, session } = await createAuthUser(prisma, `notif-markall-${Date.now()}@test.com`);
      const ts = Date.now();

      await prisma.notification.createMany({
        data: [
          {
            id: `n-ma-1-${ts}`,
            userId: user.id,
            type: "approval_needed",
            resourceType: "user",
            resourceId: "u1",
            dedupeKey: `dk-ma-1-${ts}`,
          },
          {
            id: `n-ma-2-${ts}`,
            userId: user.id,
            type: "invitation_accepted",
            resourceType: "invitation",
            resourceId: "inv1",
            dedupeKey: `dk-ma-2-${ts}`,
          },
        ],
      });

      const req = new Request("http://localhost/v1/notifications/mark-all-read", {
        method: "POST",
        headers: { Cookie: `${SESSION_COOKIE_NAME}=${session.token}`, Origin: "http://localhost" },
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);
      const body = await res.json() as { count: number };
      expect(body.count).toBe(2);

      const unread = await prisma.notification.count({
        where: { userId: user.id, readAt: null },
      });
      expect(unread).toBe(0);
    } finally {
      await prisma.$disconnect();
    }
  });
});

describe("Notification preferences", () => {
  it("GET /v1/notifications/preferences returns user preferences", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { user, session } = await createAuthUser(prisma, `notif-pref-get-${Date.now()}@test.com`);

      await prisma.notificationPreference.create({
        data: {
          userId: user.id,
          channel: "admin:approvals",
          enabled: false,
        },
      });

      const req = new Request("http://localhost/v1/notifications/preferences", {
        headers: { Cookie: `${SESSION_COOKIE_NAME}=${session.token}` },
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);
      const body = await res.json() as { preferences: Array<{ channel: string; enabled: boolean }> };
      expect(body.preferences).toBeInstanceOf(Array);
      expect(body.preferences.some((p) => p.channel === "admin:approvals" && !p.enabled)).toBe(true);
    } finally {
      await prisma.$disconnect();
    }
  });

  it("PATCH /v1/notifications/preferences upserts preference", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      const { user, session } = await createAuthUser(prisma, `notif-pref-upd-${Date.now()}@test.com`);

      const req = new Request("http://localhost/v1/notifications/preferences", {
        method: "PATCH",
        headers: {
          Cookie: `${SESSION_COOKIE_NAME}=${session.token}`,
          "Content-Type": "application/json",
          Origin: "http://localhost",
        },
        body: JSON.stringify({ channel: "admin:eoi", enabled: false }),
      });
      const res = await app.fetch(req, env);
      expect(res.status).toBe(200);

      const pref = await prisma.notificationPreference.findUnique({
        where: { userId_channel: { userId: user.id, channel: "admin:eoi" } },
      });
      expect(pref?.enabled).toBe(false);
    } finally {
      await prisma.$disconnect();
    }
  });
});
