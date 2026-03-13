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
  const hmacSecret = (c.env as unknown as Record<string, string>).HMAC_SECRET ?? "test-hmac-secret";

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

    // Delete media pairs and assets
    await prisma.mediaPair.deleteMany({});
    await prisma.mediaAsset.deleteMany({});

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

/**
 * POST /v1/test/seed-media
 * Seeds deterministic media assets and pairs for E2E testing.
 * Creates assets with known flags (AI-assisted, AI-generated, First Nations)
 * and pairs them under known content contexts.
 */
testApp.post("/v1/test/seed-media", async (c) => {
  const prisma = await createPrismaClient(c.env.DB);
  try {
    // Clean existing media data first
    await prisma.mediaPair.deleteMany({});
    await prisma.mediaAsset.deleteMany({});

    // --- Hero pair: standard Pexels attribution, no special flags ---
    const heroLight = await prisma.mediaAsset.create({
      data: {
        id: "test-hero-light",
        source: "pexels",
        externalId: "pexels-1001",
        externalUrl: "https://www.pexels.com/photo/1001",
        photographer: "Jane Smith",
        photographerUrl: "https://www.pexels.com/@janesmith",
        photographerId: "1001",
        originalWidth: 1920,
        originalHeight: 1080,
        averageColor: "#4A6B8A",
        alt: "Modern production studio with natural lighting",
        originalAlt: "Modern production studio",
        mimeType: "image/jpeg",
        fileSize: 245000,
        checksum: "abc123hero-light",
        localPath: "public/media/hero-home/hero-home-light.jpg",
        publicPath: "/media/hero-home/hero-home-light.jpg",
        downloadUrl: "https://images.pexels.com/photos/1001/original.jpeg",
        license: "pexels",
        attributionRequired: true,
        attributionText: "Photo by Jane Smith on Pexels",
        aiAssisted: false,
        aiGenerated: false,
        hasFirstNationsPermission: false,
        themeVariant: "light",
        contentContext: "hero-home",
        reviewStatus: "accepted",
      },
    });

    const heroDark = await prisma.mediaAsset.create({
      data: {
        id: "test-hero-dark",
        source: "pexels",
        externalId: "pexels-1002",
        externalUrl: "https://www.pexels.com/photo/1002",
        photographer: "Jane Smith",
        photographerUrl: "https://www.pexels.com/@janesmith",
        photographerId: "1001",
        originalWidth: 1920,
        originalHeight: 1080,
        averageColor: "#1A2B3C",
        alt: "Modern production studio at night",
        originalAlt: "Production studio night",
        mimeType: "image/jpeg",
        fileSize: 230000,
        checksum: "abc123hero-dark",
        localPath: "public/media/hero-home/hero-home-dark.jpg",
        publicPath: "/media/hero-home/hero-home-dark.jpg",
        downloadUrl: "https://images.pexels.com/photos/1002/original.jpeg",
        license: "pexels",
        attributionRequired: true,
        attributionText: "Photo by Jane Smith on Pexels",
        aiAssisted: false,
        aiGenerated: false,
        hasFirstNationsPermission: false,
        themeVariant: "dark",
        contentContext: "hero-home",
        reviewStatus: "accepted",
      },
    });

    await prisma.mediaPair.create({
      data: {
        id: "test-pair-hero-home",
        contentContext: "hero-home",
        lightAssetId: heroLight.id,
        darkAssetId: heroDark.id,
      },
    });

    // --- Facilities pair: AI-assisted flag ---
    const facLight = await prisma.mediaAsset.create({
      data: {
        id: "test-fac-light",
        source: "pexels",
        externalId: "pexels-2001",
        photographer: "Bob Chen",
        photographerUrl: "https://www.pexels.com/@bobchen",
        originalWidth: 1920,
        originalHeight: 1080,
        averageColor: "#7A8B6A",
        alt: "AI-enhanced studio facilities overview",
        mimeType: "image/jpeg",
        fileSize: 300000,
        checksum: "abc123fac-light",
        localPath: "public/media/hero-facilities/hero-facilities-light.jpg",
        publicPath: "/media/hero-facilities/hero-facilities-light.jpg",
        license: "pexels",
        attributionRequired: true,
        attributionText: "Photo by Bob Chen on Pexels",
        aiAssisted: true,
        aiGenerated: false,
        hasFirstNationsPermission: false,
        themeVariant: "light",
        contentContext: "hero-facilities",
        reviewStatus: "accepted",
      },
    });

    const facDark = await prisma.mediaAsset.create({
      data: {
        id: "test-fac-dark",
        source: "pexels",
        externalId: "pexels-2002",
        photographer: "Bob Chen",
        photographerUrl: "https://www.pexels.com/@bobchen",
        originalWidth: 1920,
        originalHeight: 1080,
        averageColor: "#2A3B1C",
        alt: "AI-enhanced studio facilities at night",
        mimeType: "image/jpeg",
        fileSize: 280000,
        checksum: "abc123fac-dark",
        localPath: "public/media/hero-facilities/hero-facilities-dark.jpg",
        publicPath: "/media/hero-facilities/hero-facilities-dark.jpg",
        license: "pexels",
        attributionRequired: true,
        attributionText: "Photo by Bob Chen on Pexels",
        aiAssisted: true,
        aiGenerated: false,
        hasFirstNationsPermission: false,
        themeVariant: "dark",
        contentContext: "hero-facilities",
        reviewStatus: "accepted",
      },
    });

    await prisma.mediaPair.create({
      data: {
        id: "test-pair-hero-facilities",
        contentContext: "hero-facilities",
        lightAssetId: facLight.id,
        darkAssetId: facDark.id,
      },
    });

    // --- Gallery pair: AI-generated flag ---
    const galLight = await prisma.mediaAsset.create({
      data: {
        id: "test-gal-light",
        source: "custom",
        externalId: "custom-gen-3001",
        photographer: "AI Studio",
        originalWidth: 1024,
        originalHeight: 1024,
        averageColor: "#5A4B8A",
        alt: "AI-generated creative workspace visualization",
        mimeType: "image/png",
        fileSize: 500000,
        checksum: "abc123gal-light",
        localPath: "public/media/gallery-creative/gallery-creative-light.png",
        publicPath: "/media/gallery-creative/gallery-creative-light.png",
        license: "custom",
        attributionRequired: false,
        aiAssisted: false,
        aiGenerated: true,
        hasFirstNationsPermission: false,
        themeVariant: "light",
        contentContext: "gallery-creative",
        reviewStatus: "accepted",
      },
    });

    const galDark = await prisma.mediaAsset.create({
      data: {
        id: "test-gal-dark",
        source: "custom",
        externalId: "custom-gen-3002",
        photographer: "AI Studio",
        originalWidth: 1024,
        originalHeight: 1024,
        averageColor: "#2A1B4A",
        alt: "AI-generated creative workspace at night",
        mimeType: "image/png",
        fileSize: 480000,
        checksum: "abc123gal-dark",
        localPath: "public/media/gallery-creative/gallery-creative-dark.png",
        publicPath: "/media/gallery-creative/gallery-creative-dark.png",
        license: "custom",
        attributionRequired: false,
        aiAssisted: false,
        aiGenerated: true,
        hasFirstNationsPermission: false,
        themeVariant: "dark",
        contentContext: "gallery-creative",
        reviewStatus: "accepted",
      },
    });

    await prisma.mediaPair.create({
      data: {
        id: "test-pair-gallery-creative",
        contentContext: "gallery-creative",
        lightAssetId: galLight.id,
        darkAssetId: galDark.id,
      },
    });

    // --- Community pair: First Nations flag ---
    const comLight = await prisma.mediaAsset.create({
      data: {
        id: "test-com-light",
        source: "pexels",
        externalId: "pexels-4001",
        photographer: "Aunty Marcia",
        photographerUrl: "https://www.pexels.com/@auntymarcia",
        originalWidth: 1920,
        originalHeight: 1280,
        averageColor: "#8A6B4A",
        alt: "Community gathering space with First Nations artwork",
        mimeType: "image/jpeg",
        fileSize: 350000,
        checksum: "abc123com-light",
        localPath: "public/media/hero-community/hero-community-light.jpg",
        publicPath: "/media/hero-community/hero-community-light.jpg",
        license: "pexels",
        attributionRequired: true,
        attributionText: "Photo by Aunty Marcia on Pexels",
        aiAssisted: false,
        aiGenerated: false,
        hasFirstNationsPermission: true,
        culturalNotes: "Used with permission from the local Aboriginal community",
        themeVariant: "light",
        contentContext: "hero-community",
        reviewStatus: "accepted",
      },
    });

    const comDark = await prisma.mediaAsset.create({
      data: {
        id: "test-com-dark",
        source: "pexels",
        externalId: "pexels-4002",
        photographer: "Aunty Marcia",
        photographerUrl: "https://www.pexels.com/@auntymarcia",
        originalWidth: 1920,
        originalHeight: 1280,
        averageColor: "#3A2B1A",
        alt: "Community space at dusk with First Nations artwork",
        mimeType: "image/jpeg",
        fileSize: 340000,
        checksum: "abc123com-dark",
        localPath: "public/media/hero-community/hero-community-dark.jpg",
        publicPath: "/media/hero-community/hero-community-dark.jpg",
        license: "pexels",
        attributionRequired: true,
        attributionText: "Photo by Aunty Marcia on Pexels",
        aiAssisted: false,
        aiGenerated: false,
        hasFirstNationsPermission: true,
        culturalNotes: "Used with permission from the local Aboriginal community",
        themeVariant: "dark",
        contentContext: "hero-community",
        reviewStatus: "accepted",
      },
    });

    await prisma.mediaPair.create({
      data: {
        id: "test-pair-hero-community",
        contentContext: "hero-community",
        lightAssetId: comLight.id,
        darkAssetId: comDark.id,
      },
    });

    return c.json({
      message: "Media test data seeded.",
      pairs: [
        { contentContext: "hero-home", lightId: heroLight.id, darkId: heroDark.id },
        { contentContext: "hero-facilities", lightId: facLight.id, darkId: facDark.id },
        { contentContext: "gallery-creative", lightId: galLight.id, darkId: galDark.id },
        { contentContext: "hero-community", lightId: comLight.id, darkId: comDark.id },
      ],
    }, 200);
  } finally {
    await prisma.$disconnect().catch(() => {});
  }
});
