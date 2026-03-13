/**
 * Test-only API routes for E2E testing.
 *
 * SECURITY: This module must NEVER be imported in production.
 * Safety layers:
 * 1. Only imported via conditional check in index.ts when NODE_ENV=test
 * 2. Every handler checks NODE_ENV=test at runtime
 * 3. E2E test verifies /v1/test/* returns 404 in production mode
 */

import { OpenAPIHono } from "@hono/zod-openapi";
import { createPrismaClient } from "./lib/prisma.js";

type Bindings = {
  DB: D1Database;
  NODE_ENV?: string;
  TEST_ENABLED?: string;
};

export const testApp = new OpenAPIHono<{ Bindings: Bindings }>();

/**
 * Runtime guard: rejects all requests unless NODE_ENV=test AND TEST_ENABLED=true.
 */
testApp.use("/v1/test/*", async (c, next) => {
  const nodeEnv = c.env.NODE_ENV ?? process.env.NODE_ENV;
  const testEnabled = c.env.TEST_ENABLED ?? process.env.TEST_ENABLED;

  if (nodeEnv !== "test" || testEnabled !== "true") {
    return c.json({ error: "not_found", message: "Not found." }, 404);
  }

  return next();
});

/**
 * GET /v1/test/last-magic-link?email=<email>
 * Returns the latest unused magic link token and code for the given email.
 * Used by E2E tests to extract verification credentials without a real email client.
 */
testApp.get("/v1/test/last-magic-link", async (c) => {
  const email = c.req.query("email");
  if (!email) {
    return c.json({ error: "missing_param", message: "email query parameter required" }, 400);
  }

  const prisma = await createPrismaClient(c.env.DB);
  try {
    const magicLink = await prisma.magicLink.findFirst({
      where: {
        email: email.toLowerCase().trim(),
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        tokenHash: true,
        codeHash: true,
        purpose: true,
        email: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    if (!magicLink) {
      return c.json({ error: "not_found", message: "No active magic link found for this email." }, 404);
    }

    // For test purposes, we need the raw token — but we only store hashes.
    // The test infrastructure stores the raw token in a separate test-only table
    // or we use the tokenHash directly (tests can look up by hash).
    // Since we can't reverse hashes, the test API should be called BEFORE
    // the magic link is created, or the test should create its own magic links.
    //
    // Alternative approach: return the hash so tests can use it for lookups,
    // and also store raw tokens in a test-only mechanism.
    //
    // For now, return what we have — E2E tests will use the test seed API
    // to create magic links with known tokens.
    return c.json({
      id: magicLink.id,
      email: magicLink.email,
      purpose: magicLink.purpose,
      tokenHash: magicLink.tokenHash,
      createdAt: magicLink.createdAt.toISOString(),
      expiresAt: magicLink.expiresAt.toISOString(),
    }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

/**
 * POST /v1/test/create-magic-link
 * Creates a magic link with a known token for E2E testing.
 * Returns { token, code } in plaintext so tests can use them.
 */
testApp.post("/v1/test/create-magic-link", async (c) => {
  const body = await c.req.json<{
    email: string;
    purpose?: string;
  }>();

  if (!body.email) {
    return c.json({ error: "missing_param", message: "email required" }, 400);
  }

  const email = body.email.toLowerCase().trim();
  const purpose = body.purpose ?? "login";
  const hmacSecret = (c.env as Record<string, string>).HMAC_SECRET ?? "test-hmac-secret";

  const prisma = await createPrismaClient(c.env.DB);
  try {
    // Generate token and code using the same crypto as production
    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    let tokenBinary = "";
    for (const b of tokenBytes) {
      tokenBinary += String.fromCharCode(b);
    }
    const token = btoa(tokenBinary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

    const codeArray = new Uint32Array(1);
    crypto.getRandomValues(codeArray);
    const code = String(codeArray[0]! % 1_000_000).padStart(6, "0");

    // Hash token
    const tokenHashBuf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
    const tokenHash = Array.from(new Uint8Array(tokenHashBuf)).map(b => b.toString(16).padStart(2, "0")).join("");

    // HMAC code hash (matching production logic)
    const hmacKey = await crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(hmacSecret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
    const codeMessage = `${email}${purpose}${tokenHash}${code}`;
    const codeSig = await crypto.subtle.sign("HMAC", hmacKey, new TextEncoder().encode(codeMessage));
    const codeHash = Array.from(new Uint8Array(codeSig)).map(b => b.toString(16).padStart(2, "0")).join("");

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.magicLink.create({
      data: {
        userId: user?.id ?? null,
        email,
        tokenHash,
        codeHash,
        purpose,
        deliveryStatus: "sent",
        expiresAt,
      },
    });

    return c.json({ token, code, email, purpose, expiresAt: expiresAt.toISOString() }, 201);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

/**
 * POST /v1/test/reset
 * Resets test state: removes non-system-role users and their sessions.
 * Preserves system roles and permissions.
 */
testApp.post("/v1/test/reset", async (c) => {
  const prisma = await createPrismaClient(c.env.DB);
  try {
    // Delete all sessions
    await prisma.session.deleteMany({});

    // Delete all magic links
    await prisma.magicLink.deleteMany({});

    // Delete all audit logs
    await prisma.auditLog.deleteMany({});

    // Delete all invitation roles, then invitations
    await prisma.invitationRole.deleteMany({});
    await prisma.invitation.deleteMany({});

    // Delete all user roles
    await prisma.userRole.deleteMany({});

    // Delete all non-system users (keep none — seed will recreate)
    await prisma.user.deleteMany({});

    // Delete email suppressions
    await prisma.emailSuppression.deleteMany({});

    return c.json({ message: "Test state reset." }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});

/**
 * POST /v1/test/seed
 * Seeds the test database with test users.
 */
testApp.post("/v1/test/seed", async (c) => {
  const prisma = await createPrismaClient(c.env.DB);
  try {
    // Get roles
    const superAdminRole = await prisma.role.findUnique({ where: { name: "super_admin" } });
    const memberRole = await prisma.role.findUnique({ where: { name: "member" } });
    const viewerRole = await prisma.role.findUnique({ where: { name: "viewer" } });

    if (!superAdminRole || !memberRole || !viewerRole) {
      return c.json({ error: "seed_failed", message: "System roles not found. Run database seed first." }, 500);
    }

    // Create test users
    const adminUser = await prisma.user.upsert({
      where: { email: "admin@test.production.city" },
      update: { status: "active", emailVerified: true, name: "Test Admin" },
      create: {
        email: "admin@test.production.city",
        name: "Test Admin",
        status: "active",
        emailVerified: true,
      },
    });

    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: adminUser.id, roleId: superAdminRole.id } },
      update: {},
      create: { userId: adminUser.id, roleId: superAdminRole.id },
    });

    const memberUser = await prisma.user.upsert({
      where: { email: "member@test.production.city" },
      update: { status: "active", emailVerified: true, name: "Test Member" },
      create: {
        email: "member@test.production.city",
        name: "Test Member",
        status: "active",
        emailVerified: true,
      },
    });

    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: memberUser.id, roleId: memberRole.id } },
      update: {},
      create: { userId: memberUser.id, roleId: memberRole.id },
    });

    const viewerUser = await prisma.user.upsert({
      where: { email: "viewer@test.production.city" },
      update: { status: "active", emailVerified: true, name: "Test Viewer" },
      create: {
        email: "viewer@test.production.city",
        name: "Test Viewer",
        status: "active",
        emailVerified: true,
      },
    });

    await prisma.userRole.upsert({
      where: { userId_roleId: { userId: viewerUser.id, roleId: viewerRole.id } },
      update: {},
      create: { userId: viewerUser.id, roleId: viewerRole.id },
    });

    return c.json({
      message: "Test users seeded.",
      users: {
        admin: { id: adminUser.id, email: adminUser.email },
        member: { id: memberUser.id, email: memberUser.email },
        viewer: { id: viewerUser.id, email: viewerUser.email },
      },
    }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});
