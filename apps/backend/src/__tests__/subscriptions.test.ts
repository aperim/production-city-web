/**
 * Tests for Subscription System API & Double Opt-In (#288).
 */

import { describe, it, expect, beforeAll, beforeEach } from "vitest";
import { env } from "cloudflare:test";
import { app } from "../index.js";
import { createPrismaClient } from "../lib/prisma.js";
import { createSession, SESSION_COOKIE_NAME } from "../auth/session.js";
import { setupTestDatabase } from "./test-helpers.js";

const BASE = "http://localhost";
const TWILIO_AUTH_TOKEN = "test-twilio-auth-token-do-not-use-in-production";

/**
 * Generate a valid Twilio HMAC-SHA1 signature for test requests.
 */
async function generateTwilioSignature(
  authToken: string,
  url: string,
  params: Record<string, string>,
): Promise<string> {
  const sortedKeys = Object.keys(params).sort();
  let dataString = url;
  for (const key of sortedKeys) {
    dataString += key + params[key];
  }
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(authToken),
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(dataString));
  return btoa(String.fromCharCode(...new Uint8Array(sig)));
}

beforeAll(async () => {
  await setupTestDatabase();
});

// --- Helpers ---

async function createTestUserWithPerms(email: string, permissions: string[][], phone?: string) {
  const prisma = await createPrismaClient(env.DB);
  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, status: "active", phone: phone ?? null },
    });

    const roleName = `role-${user.id.slice(0, 8)}-${Date.now()}`;
    const role = await prisma.role.create({
      data: { name: roleName, description: "Test role" },
    });

    for (const pair of permissions) {
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
    return { user, session };
  } finally {
    await prisma.$disconnect();
  }
}

function authHeaders(token: string): Record<string, string> {
  return {
    Cookie: `${SESSION_COOKIE_NAME}=${token}`,
    Origin: "http://localhost",
    "Content-Type": "application/json",
  };
}

async function ensureCategory(id: string, name: string, slug: string, isActive = 1) {
  const prisma = await createPrismaClient(env.DB);
  try {
    await prisma.announcementCategory.upsert({
      where: { slug },
      update: {},
      create: { id, name, slug, isActive, sortOrder: 0 },
    });
  } finally {
    await prisma.$disconnect();
  }
  return { id, name, slug };
}

async function cleanSubscriptions() {
  await env.DB.prepare(`DELETE FROM "CategorySubscription"`).run();
  await env.DB.prepare(`DELETE FROM "AuditLog" WHERE resource = 'subscription' OR resource = 'sms_suppression'`).run();
  await env.DB.prepare(`DELETE FROM "SmsSuppression"`).run();
}

// --- Tests ---

describe("User Subscriptions (/v1/me/subscriptions)", () => {
  let userToken: string;
  let userId: string;
  let category: { id: string; name: string; slug: string };

  beforeAll(async () => {
    const { user, session } = await createTestUserWithPerms(
      "sub-user@test.com", [], "+61412345678",
    );
    userToken = session.token;
    userId = user.id;
    category = await ensureCategory("sub-cat-1", "Development Updates", "development-updates");
  });

  beforeEach(async () => {
    await cleanSubscriptions();
  });

  it("subscribes to email channel", async () => {
    const res = await app.fetch(
      new Request(`${BASE}/v1/me/subscriptions`, {
        method: "POST",
        headers: authHeaders(userToken),
        body: JSON.stringify({ categoryId: category.id, channels: ["email"] }),
      }),
      env,
    );

    expect(res.status).toBe(201);
    const body = await res.json() as { subscriptions: Array<{ channel: string; status: string; category: { id: string } }> };
    expect(body.subscriptions).toHaveLength(1);
    expect(body.subscriptions[0]!.channel).toBe("email");
    expect(body.subscriptions[0]!.status).toBe("pending");
  });

  it("subscribes to sms channel with phone number", async () => {
    const res = await app.fetch(
      new Request(`${BASE}/v1/me/subscriptions`, {
        method: "POST",
        headers: authHeaders(userToken),
        body: JSON.stringify({ categoryId: category.id, channels: ["sms"] }),
      }),
      env,
    );

    expect(res.status).toBe(201);
    const body = await res.json() as { subscriptions: Array<{ channel: string }> };
    expect(body.subscriptions[0]!.channel).toBe("sms");
  });

  it("subscribes to both channels", async () => {
    const res = await app.fetch(
      new Request(`${BASE}/v1/me/subscriptions`, {
        method: "POST",
        headers: authHeaders(userToken),
        body: JSON.stringify({ categoryId: category.id, channels: ["email", "sms"] }),
      }),
      env,
    );

    expect(res.status).toBe(201);
    const body = await res.json() as { subscriptions: Array<{ channel: string }> };
    expect(body.subscriptions).toHaveLength(2);
  });

  it("rejects SMS subscription without phone number", async () => {
    const { session } = await createTestUserWithPerms("sub-nophone@test.com", []);

    const res = await app.fetch(
      new Request(`${BASE}/v1/me/subscriptions`, {
        method: "POST",
        headers: authHeaders(session.token),
        body: JSON.stringify({ categoryId: category.id, channels: ["sms"] }),
      }),
      env,
    );

    expect(res.status).toBe(422);
    const body = await res.json() as { error: string };
    expect(body.error).toBe("NO_PHONE");
  });

  it("returns 409 for already confirmed subscription", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      await prisma.categorySubscription.create({
        data: {
          userId, categoryId: category.id, channel: "email",
          status: "confirmed", confirmedAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          subscribedById: userId,
        },
      });
    } finally {
      await prisma.$disconnect();
    }

    const res = await app.fetch(
      new Request(`${BASE}/v1/me/subscriptions`, {
        method: "POST",
        headers: authHeaders(userToken),
        body: JSON.stringify({ categoryId: category.id, channels: ["email"] }),
      }),
      env,
    );

    expect(res.status).toBe(409);
  });

  it("rejects subscription to non-existent category", async () => {
    const res = await app.fetch(
      new Request(`${BASE}/v1/me/subscriptions`, {
        method: "POST",
        headers: authHeaders(userToken),
        body: JSON.stringify({ categoryId: "non-existent", channels: ["email"] }),
      }),
      env,
    );

    expect(res.status).toBe(422);
  });

  it("rejects subscription to inactive category", async () => {
    await ensureCategory("sub-cat-inactive", "Inactive Cat", "inactive-sub-cat", 0);

    const res = await app.fetch(
      new Request(`${BASE}/v1/me/subscriptions`, {
        method: "POST",
        headers: authHeaders(userToken),
        body: JSON.stringify({ categoryId: "sub-cat-inactive", channels: ["email"] }),
      }),
      env,
    );

    expect(res.status).toBe(422);
  });

  it("lists my subscriptions", async () => {
    // Create one first
    const prisma = await createPrismaClient(env.DB);
    try {
      await prisma.categorySubscription.create({
        data: {
          userId, categoryId: category.id, channel: "email",
          status: "pending",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          subscribedById: userId,
        },
      });
    } finally {
      await prisma.$disconnect();
    }

    const res = await app.fetch(
      new Request(`${BASE}/v1/me/subscriptions`, {
        method: "GET",
        headers: authHeaders(userToken),
      }),
      env,
    );

    expect(res.status).toBe(200);
    const body = await res.json() as { subscriptions: unknown[] };
    expect(body.subscriptions.length).toBeGreaterThan(0);
  });

  it("deletes a subscription", async () => {
    const prisma = await createPrismaClient(env.DB);
    let subId: string;
    try {
      const sub = await prisma.categorySubscription.create({
        data: {
          userId, categoryId: category.id, channel: "email",
          status: "confirmed",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          subscribedById: userId,
        },
      });
      subId = sub.id;
    } finally {
      await prisma.$disconnect();
    }

    const res = await app.fetch(
      new Request(`${BASE}/v1/me/subscriptions/${subId}`, {
        method: "DELETE",
        headers: authHeaders(userToken),
      }),
      env,
    );

    expect(res.status).toBe(200);
  });

  it("requires authentication", async () => {
    const res = await app.fetch(
      new Request(`${BASE}/v1/me/subscriptions`, {
        method: "GET",
        headers: { Origin: "http://localhost" },
      }),
      env,
    );

    expect(res.status).toBe(401);
  });
});

describe("Resend Confirmation", () => {
  let userToken: string;
  let userId: string;
  let category: { id: string };

  beforeAll(async () => {
    const { user, session } = await createTestUserWithPerms("sub-resend@test.com", []);
    userToken = session.token;
    userId = user.id;
    category = await ensureCategory("sub-cat-resend", "Resend Category", "resend-sub-cat");
  });

  beforeEach(async () => {
    await cleanSubscriptions();
  });

  it("resends confirmation for pending subscription", async () => {
    const prisma = await createPrismaClient(env.DB);
    let subId: string;
    try {
      const sub = await prisma.categorySubscription.create({
        data: {
          userId, categoryId: category.id, channel: "email",
          status: "pending", confirmationTokenHash: "old-hash",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          subscribedById: userId,
        },
      });
      subId = sub.id;
    } finally {
      await prisma.$disconnect();
    }

    const res = await app.fetch(
      new Request(`${BASE}/v1/me/subscriptions/${subId}/resend`, {
        method: "POST",
        headers: authHeaders(userToken),
      }),
      env,
    );

    expect(res.status).toBe(200);

    // Verify token was regenerated
    const row = await env.DB.prepare(
      `SELECT confirmationTokenHash FROM "CategorySubscription" WHERE id = ?`,
    ).bind(subId).first() as { confirmationTokenHash: string } | null;
    expect(row!.confirmationTokenHash).not.toBe("old-hash");
  });

  it("returns 404 for non-pending subscription", async () => {
    const prisma = await createPrismaClient(env.DB);
    let subId: string;
    try {
      const sub = await prisma.categorySubscription.create({
        data: {
          userId, categoryId: category.id, channel: "email",
          status: "confirmed", confirmedAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          subscribedById: userId,
        },
      });
      subId = sub.id;
    } finally {
      await prisma.$disconnect();
    }

    const res = await app.fetch(
      new Request(`${BASE}/v1/me/subscriptions/${subId}/resend`, {
        method: "POST",
        headers: authHeaders(userToken),
      }),
      env,
    );

    expect(res.status).toBe(404);
  });
});

describe("Confirm/Decline (/v1/subscriptions/confirm, /v1/subscriptions/decline)", () => {
  let userId: string;
  let category: { id: string; name: string };

  beforeAll(async () => {
    const { user } = await createTestUserWithPerms("sub-confirm@test.com", []);
    userId = user.id;
    category = await ensureCategory("sub-cat-confirm", "Confirm Category", "confirm-sub-cat");
  });

  beforeEach(async () => {
    await cleanSubscriptions();
  });

  it("confirms a valid pending subscription", async () => {
    const { generateConfirmationToken } = await import("../lib/subscription-service.js");
    const secret = "dev-subscription-hmac-secret-do-not-use-in-production";
    const { token, tokenHash } = await generateConfirmationToken(secret);

    const prisma = await createPrismaClient(env.DB);
    try {
      await prisma.categorySubscription.create({
        data: {
          userId, categoryId: category.id, channel: "email",
          status: "pending", confirmationTokenHash: tokenHash,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          subscribedById: userId,
        },
      });
    } finally {
      await prisma.$disconnect();
    }

    const res = await app.fetch(
      new Request(`${BASE}/v1/subscriptions/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: "http://localhost" },
        body: JSON.stringify({ token }),
      }),
      env,
    );

    expect(res.status).toBe(200);
    const body = await res.json() as { subscription: { status: string } };
    expect(body.subscription.status).toBe("confirmed");
  });

  it("returns uniform 404 for invalid token", async () => {
    const res = await app.fetch(
      new Request(`${BASE}/v1/subscriptions/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: "http://localhost" },
        body: JSON.stringify({ token: "invalid-token" }),
      }),
      env,
    );

    expect(res.status).toBe(404);
  });

  it("returns uniform 404 for expired subscription", async () => {
    const { generateConfirmationToken } = await import("../lib/subscription-service.js");
    const secret = "dev-subscription-hmac-secret-do-not-use-in-production";
    const { token, tokenHash } = await generateConfirmationToken(secret);

    const prisma = await createPrismaClient(env.DB);
    try {
      await prisma.categorySubscription.create({
        data: {
          userId, categoryId: category.id, channel: "email",
          status: "pending", confirmationTokenHash: tokenHash,
          expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // expired
          subscribedById: userId,
        },
      });
    } finally {
      await prisma.$disconnect();
    }

    const res = await app.fetch(
      new Request(`${BASE}/v1/subscriptions/confirm`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: "http://localhost" },
        body: JSON.stringify({ token }),
      }),
      env,
    );

    expect(res.status).toBe(404);
  });

  it("declines a pending subscription", async () => {
    const { generateConfirmationToken } = await import("../lib/subscription-service.js");
    const secret = "dev-subscription-hmac-secret-do-not-use-in-production";
    const { token, tokenHash } = await generateConfirmationToken(secret);

    const prisma = await createPrismaClient(env.DB);
    let subId: string;
    try {
      const sub = await prisma.categorySubscription.create({
        data: {
          userId, categoryId: category.id, channel: "email",
          status: "pending", confirmationTokenHash: tokenHash,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          subscribedById: userId,
        },
      });
      subId = sub.id;
    } finally {
      await prisma.$disconnect();
    }

    const res = await app.fetch(
      new Request(`${BASE}/v1/subscriptions/decline`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Origin: "http://localhost" },
        body: JSON.stringify({ token }),
      }),
      env,
    );

    expect(res.status).toBe(200);

    const row = await env.DB.prepare(
      `SELECT status FROM "CategorySubscription" WHERE id = ?`,
    ).bind(subId).first() as { status: string } | null;
    expect(row!.status).toBe("declined");
  });
});

describe("Admin Subscriptions (/v1/admin/subscriptions)", () => {
  let adminToken: string;
  let adminId: string;
  let targetUserId: string;
  let category: { id: string; name: string };

  beforeAll(async () => {
    const admin = await createTestUserWithPerms("sub-admin@test.com", [
      ["subscription", "read"],
      ["subscription", "manage"],
    ]);
    adminToken = admin.session.token;
    adminId = admin.user.id;

    const target = await createTestUserWithPerms("sub-target@test.com", [], "+61498765432");
    targetUserId = target.user.id;

    category = await ensureCategory("sub-cat-admin", "Admin Category", "admin-sub-cat");
  });

  beforeEach(async () => {
    await cleanSubscriptions();
  });

  it("lists all subscriptions", async () => {
    const res = await app.fetch(
      new Request(`${BASE}/v1/admin/subscriptions`, {
        method: "GET",
        headers: authHeaders(adminToken),
      }),
      env,
    );

    expect(res.status).toBe(200);
    const body = await res.json() as { subscriptions: unknown[]; pagination: { total: number } };
    expect(body.subscriptions).toBeInstanceOf(Array);
  });

  it("admin creates subscription for a user", async () => {
    const res = await app.fetch(
      new Request(`${BASE}/v1/admin/subscriptions`, {
        method: "POST",
        headers: authHeaders(adminToken),
        body: JSON.stringify({
          userId: targetUserId,
          categoryId: category.id,
          channels: ["email"],
        }),
      }),
      env,
    );

    expect(res.status).toBe(201);
    const body = await res.json() as { subscriptions: Array<{ status: string }> };
    expect(body.subscriptions[0]!.status).toBe("pending");
  });

  it("admin deletes a subscription", async () => {
    const prisma = await createPrismaClient(env.DB);
    let subId: string;
    try {
      const sub = await prisma.categorySubscription.create({
        data: {
          userId: targetUserId, categoryId: category.id, channel: "email",
          status: "confirmed",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          subscribedById: adminId,
        },
      });
      subId = sub.id;
    } finally {
      await prisma.$disconnect();
    }

    const res = await app.fetch(
      new Request(`${BASE}/v1/admin/subscriptions/${subId}`, {
        method: "DELETE",
        headers: authHeaders(adminToken),
      }),
      env,
    );

    expect(res.status).toBe(200);
  });

  it("gets subscription stats", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      await prisma.categorySubscription.create({
        data: {
          userId: targetUserId, categoryId: category.id, channel: "email",
          status: "confirmed", confirmedAt: new Date(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          subscribedById: adminId,
        },
      });
    } finally {
      await prisma.$disconnect();
    }

    const res = await app.fetch(
      new Request(`${BASE}/v1/admin/subscriptions/stats`, {
        method: "GET",
        headers: authHeaders(adminToken),
      }),
      env,
    );

    expect(res.status).toBe(200);
    const body = await res.json() as { stats: Array<{ category: { id: string }; confirmed: { email: number } }> };
    const catStats = body.stats.find((s) => s.category.id === category.id);
    expect(catStats).toBeDefined();
    expect(catStats!.confirmed.email).toBe(1);
  });

  it("masks phone numbers without read_pii permission", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      await prisma.categorySubscription.create({
        data: {
          userId: targetUserId, categoryId: category.id, channel: "sms",
          status: "pending",
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          subscribedById: adminId,
        },
      });
    } finally {
      await prisma.$disconnect();
    }

    const res = await app.fetch(
      new Request(`${BASE}/v1/admin/subscriptions`, {
        method: "GET",
        headers: authHeaders(adminToken),
      }),
      env,
    );

    expect(res.status).toBe(200);
    const body = await res.json() as { subscriptions: Array<{ user: { phone: string | null } }> };
    const sub = body.subscriptions.find((s) => s.user.phone !== null);
    if (sub) {
      expect(sub.user.phone).toContain("***");
    }
  });

  it("rejects request without subscription:read permission", async () => {
    const noPerm = await createTestUserWithPerms("sub-noperm@test.com", []);

    const res = await app.fetch(
      new Request(`${BASE}/v1/admin/subscriptions`, {
        method: "GET",
        headers: authHeaders(noPerm.session.token),
      }),
      env,
    );

    expect(res.status).toBe(403);
  });

  it("returns 404 for non-existent target user", async () => {
    const res = await app.fetch(
      new Request(`${BASE}/v1/admin/subscriptions`, {
        method: "POST",
        headers: authHeaders(adminToken),
        body: JSON.stringify({
          userId: "non-existent-user-id",
          categoryId: category.id,
          channels: ["email"],
        }),
      }),
      env,
    );

    expect(res.status).toBe(404);
  });
});

describe("Subscription Service", () => {
  it("generates different tokens each time", async () => {
    const { generateConfirmationToken } = await import("../lib/subscription-service.js");
    const result1 = await generateConfirmationToken("test-secret");
    const result2 = await generateConfirmationToken("test-secret");
    expect(result1.token).not.toBe(result2.token);
    expect(result1.tokenHash).not.toBe(result2.tokenHash);
  });

  it("hashes token with HMAC deterministically", async () => {
    const { generateConfirmationToken, hashConfirmationToken } = await import("../lib/subscription-service.js");
    const { token, tokenHash } = await generateConfirmationToken("test-secret");
    const rehash = await hashConfirmationToken("test-secret", token);
    expect(rehash).toBe(tokenHash);
  });

  it("calculates correct expiration dates", async () => {
    const { getExpirationDate } = await import("../lib/subscription-service.js");
    const emailExp = getExpirationDate("email");
    const smsExp = getExpirationDate("sms");
    const now = Date.now();
    const emailDays = (emailExp.getTime() - now) / (24 * 60 * 60 * 1000);
    const smsDays = (smsExp.getTime() - now) / (24 * 60 * 60 * 1000);
    expect(emailDays).toBeGreaterThan(6.9);
    expect(emailDays).toBeLessThan(7.1);
    expect(smsDays).toBeGreaterThan(13.9);
    expect(smsDays).toBeLessThan(14.1);
  });

  it("masks phone numbers correctly", async () => {
    const { maskPhoneNumber } = await import("../lib/subscription-service.js");
    expect(maskPhoneNumber("+61412345678")).toBe("+61***5678");
    expect(maskPhoneNumber("+14155551234")).toBe("+14***1234");
  });
});

describe("Twilio Inbound Webhook (SMS STOP)", () => {
  let userId: string;
  let userPhone: string;
  let category: { id: string };

  beforeAll(async () => {
    const { user } = await createTestUserWithPerms("sub-twilio@test.com", [], "+61400111222");
    userId = user.id;
    userPhone = "+61400111222";
    category = await ensureCategory("sub-cat-twilio", "Twilio Category", "twilio-sub-cat");
  });

  beforeEach(async () => {
    await cleanSubscriptions();
  });

  it("handles STOP keyword - suppresses and declines subscriptions", async () => {
    const prisma = await createPrismaClient(env.DB);
    try {
      await prisma.categorySubscription.create({
        data: {
          userId, categoryId: category.id, channel: "sms",
          status: "confirmed", confirmedAt: new Date(),
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          subscribedById: userId,
        },
      });
    } finally {
      await prisma.$disconnect();
    }

    const stopParams = {
      From: userPhone,
      To: "+61400000000",
      Body: "STOP",
      MessageSid: "SM_stop_test_1",
    };
    const stopUrl = `${BASE}/v1/webhooks/twilio/inbound`;
    const stopSig = await generateTwilioSignature(TWILIO_AUTH_TOKEN, stopUrl, stopParams);

    const res = await app.fetch(
      new Request(stopUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Origin: "http://localhost",
          "X-Twilio-Signature": stopSig,
        },
        body: new URLSearchParams(stopParams).toString(),
      }),
      env,
    );

    expect(res.status).toBe(200);

    // Verify suppression created
    const suppression = await env.DB.prepare(
      `SELECT reason FROM "SmsSuppression" WHERE phoneNumber = ?`,
    ).bind(userPhone).first() as { reason: string } | null;
    expect(suppression).not.toBeNull();
    expect(suppression!.reason).toBe("stop_keyword");

    // Verify subscription declined
    const subs = await env.DB.prepare(
      `SELECT status FROM "CategorySubscription" WHERE userId = ? AND channel = 'sms'`,
    ).bind(userId).all();
    for (const s of subs.results) {
      expect((s as { status: string }).status).toBe("declined");
    }
  });

  it("handles START keyword - removes suppression", async () => {
    // Create suppression first
    await env.DB.prepare(
      `INSERT INTO "SmsSuppression" (id, phoneNumber, reason, createdAt) VALUES (?, ?, 'stop_keyword', datetime('now'))`,
    ).bind(crypto.randomUUID(), userPhone).run();

    const startParams = {
      From: userPhone,
      To: "+61400000000",
      Body: "START",
      MessageSid: "SM_start_test_1",
    };
    const startUrl = `${BASE}/v1/webhooks/twilio/inbound`;
    const startSig = await generateTwilioSignature(TWILIO_AUTH_TOKEN, startUrl, startParams);

    const res = await app.fetch(
      new Request(startUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Origin: "http://localhost",
          "X-Twilio-Signature": startSig,
        },
        body: new URLSearchParams(startParams).toString(),
      }),
      env,
    );

    expect(res.status).toBe(200);

    const suppression = await env.DB.prepare(
      `SELECT removedAt FROM "SmsSuppression" WHERE phoneNumber = ?`,
    ).bind(userPhone).first() as { removedAt: string | null } | null;
    expect(suppression!.removedAt).not.toBeNull();
  });

  it("ignores non-keyword messages", async () => {
    const ignoreParams = {
      From: userPhone,
      To: "+61400000000",
      Body: "Hello, I have a question",
      MessageSid: "SM_ignore_1",
    };
    const ignoreUrl = `${BASE}/v1/webhooks/twilio/inbound`;
    const ignoreSig = await generateTwilioSignature(TWILIO_AUTH_TOKEN, ignoreUrl, ignoreParams);

    const res = await app.fetch(
      new Request(ignoreUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Origin: "http://localhost",
          "X-Twilio-Signature": ignoreSig,
        },
        body: new URLSearchParams(ignoreParams).toString(),
      }),
      env,
    );

    expect(res.status).toBe(200);

    const suppression = await env.DB.prepare(
      `SELECT id FROM "SmsSuppression" WHERE phoneNumber = ?`,
    ).bind(userPhone).first();
    expect(suppression).toBeNull();
  });
});
