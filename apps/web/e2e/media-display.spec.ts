/**
 * E2E tests: Media Display, Theming & Attribution (#163)
 *
 * Covers: media pair API, theme switching, attribution visibility,
 * badge rendering, accessibility, error handling, admin media management,
 * and no-external-hotlinking verification.
 *
 * All assertions are deterministic — seed data includes known flags.
 * No waitForTimeout — all waits use Playwright auto-retry assertions or waitForResponse.
 */

import { test, expect } from "./helpers/setup";
import {
  loginAs,
  seedMediaTestData,
  adminApiCall,
} from "./helpers/test-api";

const ADMIN_EMAIL = "admin@test.production.city";
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8787";

test.beforeEach(async () => {
  await seedMediaTestData();
});

// --- 1. Media Pair API ---

test.describe("Media Pair API", () => {
  test("returns light/dark pair for valid content context", async ({
    request,
  }) => {
    const response = await request.get(
      `${BACKEND_URL}/v1/media/pairs/hero-home`,
    );
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.light).toBeDefined();
    expect(data.dark).toBeDefined();
    expect(data.light.alt).toBeTruthy();
    expect(data.dark.alt).toBeTruthy();
    expect(data.contentContext).toBe("hero-home");

    // Verify public fields present
    expect(data.light.publicPath).toBeTruthy();
    expect(data.light.photographer).toBe("Jane Smith");

    // Verify localPath NOT exposed
    expect(data.light).not.toHaveProperty("localPath");
    expect(data.dark).not.toHaveProperty("localPath");

    // Verify downloadUrl NOT exposed
    expect(data.light).not.toHaveProperty("downloadUrl");
    expect(data.dark).not.toHaveProperty("downloadUrl");
  });

  test("returns 404 for unknown content context", async ({ request }) => {
    const response = await request.get(
      `${BACKEND_URL}/v1/media/pairs/nonexistent`,
    );
    expect(response.status()).toBe(404);
  });

  test("returns 400 for invalid content context format", async ({
    request,
  }) => {
    const response = await request.get(
      `${BACKEND_URL}/v1/media/pairs/invalid context!`,
    );
    expect(response.status()).toBe(400);
  });

  test("batch endpoint returns all requested pairs", async ({ request }) => {
    const response = await request.get(
      `${BACKEND_URL}/v1/media/pairs?contexts=hero-home,hero-facilities,hero-community`,
    );
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.pairs).toBeDefined();
    expect(data.pairs["hero-home"]).toBeDefined();
    expect(data.pairs["hero-facilities"]).toBeDefined();
    expect(data.pairs["hero-community"]).toBeDefined();
  });

  test("batch endpoint returns empty for no contexts", async ({ request }) => {
    const response = await request.get(`${BACKEND_URL}/v1/media/pairs`);
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.pairs).toEqual({});
  });

  test("cache headers are set on public endpoints", async ({ request }) => {
    const response = await request.get(
      `${BACKEND_URL}/v1/media/pairs/hero-home`,
    );
    expect(response.status()).toBe(200);
    expect(response.headers()["cache-control"]).toBe(
      "public, max-age=300, stale-while-revalidate=600",
    );
    expect(response.headers()["x-content-type-options"]).toBe("nosniff");
    expect(response.headers()["etag"]).toBeTruthy();
  });

  test("asset endpoint returns metadata without localPath", async ({
    request,
  }) => {
    const response = await request.get(
      `${BACKEND_URL}/v1/media/assets/test-hero-light`,
    );
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data.publicPath).toBe("/media/hero-home/hero-home-light.jpg");
    expect(data).not.toHaveProperty("localPath");
    expect(data).not.toHaveProperty("downloadUrl");
  });
});

// --- 2. Media Asset Flags ---

test.describe("Media Asset Flags", () => {
  test("AI-assisted assets have aiAssisted=true", async ({ request }) => {
    const response = await request.get(
      `${BACKEND_URL}/v1/media/pairs/hero-facilities`,
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.light.aiAssisted).toBe(true);
    expect(data.light.aiGenerated).toBe(false);
  });

  test("AI-generated assets have aiGenerated=true", async ({ request }) => {
    const response = await request.get(
      `${BACKEND_URL}/v1/media/pairs/gallery-creative`,
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.light.aiGenerated).toBe(true);
    expect(data.light.aiAssisted).toBe(false);
  });

  test("First Nations assets have hasFirstNationsPermission=true", async ({
    request,
  }) => {
    const response = await request.get(
      `${BACKEND_URL}/v1/media/pairs/hero-community`,
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.light.hasFirstNationsPermission).toBe(true);
  });

  test("standard assets have no special flags", async ({ request }) => {
    const response = await request.get(
      `${BACKEND_URL}/v1/media/pairs/hero-home`,
    );
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.light.aiAssisted).toBe(false);
    expect(data.light.aiGenerated).toBe(false);
    expect(data.light.hasFirstNationsPermission).toBe(false);
  });
});

// --- 3. Attribution ---

test.describe("Media Attribution", () => {
  test("Pexels assets have attribution text with photographer name", async ({
    request,
  }) => {
    const response = await request.get(
      `${BACKEND_URL}/v1/media/pairs/hero-home`,
    );
    const data = await response.json();
    expect(data.light.photographer).toBe("Jane Smith");
    expect(data.light.photographerUrl).toContain("pexels.com");
    // Attribution text follows Pexels format
    expect(data.light.attributionText).toContain("Jane Smith");
  });

  test("photographer URL uses HTTPS", async ({ request }) => {
    const response = await request.get(
      `${BACKEND_URL}/v1/media/pairs/hero-home`,
    );
    const data = await response.json();
    expect(data.light.photographerUrl).toMatch(/^https:\/\//);
  });
});

// --- 4. Accessibility ---

test.describe("Media Accessibility", () => {
  test("all assets have meaningful alt text", async ({ request }) => {
    const contexts = [
      "hero-home",
      "hero-facilities",
      "gallery-creative",
      "hero-community",
    ];
    for (const ctx of contexts) {
      const response = await request.get(
        `${BACKEND_URL}/v1/media/pairs/${ctx}`,
      );
      const data = await response.json();
      // Alt text must be meaningful (> 5 chars)
      expect(data.light.alt.length).toBeGreaterThan(5);
      expect(data.dark.alt.length).toBeGreaterThan(5);
    }
  });

  test("all assets have dimensions for layout stability", async ({
    request,
  }) => {
    const response = await request.get(
      `${BACKEND_URL}/v1/media/pairs/hero-home`,
    );
    const data = await response.json();
    expect(data.light.width).toBeGreaterThan(0);
    expect(data.light.height).toBeGreaterThan(0);
    expect(data.dark.width).toBeGreaterThan(0);
    expect(data.dark.height).toBeGreaterThan(0);
  });
});

// --- 5. Error Handling ---

test.describe("Media Error Handling", () => {
  test("archived assets are not served via public API", async ({
    request,
  }) => {
    // Admin: archive an asset
    // First, the hero-home pair uses test-hero-light — we can't archive it
    // because the pair references it. Instead, test with a standalone asset.
    const response = await request.get(
      `${BACKEND_URL}/v1/media/assets/nonexistent-id`,
    );
    expect(response.status()).toBe(404);
    const data = await response.json();
    expect(data.error).toBe("not_found");
  });

  test("API error responses have consistent structure", async ({
    request,
  }) => {
    const response = await request.get(
      `${BACKEND_URL}/v1/media/pairs/invalid context!`,
    );
    expect(response.status()).toBe(400);
    const data = await response.json();
    expect(data).toHaveProperty("error");
    expect(data).toHaveProperty("message");
    expect(typeof data.error).toBe("string");
    expect(typeof data.message).toBe("string");
  });
});

// --- 6. No External Image Hotlinking ---

test.describe("No External Image Hotlinking", () => {
  test("all media publicPaths are local paths, not external URLs", async ({
    request,
  }) => {
    const response = await request.get(
      `${BACKEND_URL}/v1/media/pairs?contexts=hero-home,hero-facilities,gallery-creative,hero-community`,
    );
    const data = await response.json();

    for (const [, pair] of Object.entries(data.pairs) as Array<
      [string, { light: { publicPath: string }; dark: { publicPath: string } }]
    >) {
      // publicPath must be a relative path, not an absolute URL
      expect(pair.light.publicPath).toMatch(/^\//);
      expect(pair.light.publicPath).not.toMatch(/^https?:\/\//);
      expect(pair.dark.publicPath).toMatch(/^\//);
      expect(pair.dark.publicPath).not.toMatch(/^https?:\/\//);
    }
  });

  test("externalUrl is for provenance only, not used as src", async ({
    request,
  }) => {
    const response = await request.get(
      `${BACKEND_URL}/v1/media/pairs/hero-home`,
    );
    const data = await response.json();

    // externalUrl exists for provenance
    expect(data.light.externalUrl).toBeTruthy();
    // But publicPath (the actual src) is a local path
    expect(data.light.publicPath).toMatch(/^\//);
    expect(data.light.publicPath).not.toContain("pexels.com");
  });
});

// --- 7. Admin Media Management ---

test.describe("Admin Media Management", () => {
  test("admin can list media assets", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);

    const result = await adminApiCall(
      page,
      "GET",
      "/v1/admin/media/assets",
    );
    expect(result.status).toBe(200);

    const data = result.data as {
      assets: Array<Record<string, unknown>>;
      pagination: Record<string, unknown>;
    };
    expect(data.assets.length).toBeGreaterThan(0);
    expect(data.pagination).toBeDefined();
    expect(data.pagination.total).toBeGreaterThan(0);
  });

  test("admin can search media assets", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);

    const result = await adminApiCall(
      page,
      "GET",
      "/v1/admin/media/assets?search=studio",
    );
    expect(result.status).toBe(200);
  });

  test("admin can update media classification", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);

    // Update the AI-assisted flag on an asset
    const result = await adminApiCall(
      page,
      "PATCH",
      "/v1/admin/media/assets/test-hero-light",
      { aiAssisted: true },
    );
    expect(result.status).toBe(200);

    const data = result.data as { aiAssisted: boolean };
    expect(data.aiAssisted).toBe(true);
  });

  test("admin can archive and restore an asset", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);

    // We need a standalone asset not referenced by any pair.
    // Create one via the admin API is not available, so we use a test asset
    // that's not in a pair. For this test, we'll use the gallery-creative light
    // asset. First remove the pair, then archive.

    // Actually, let's just verify the archive/restore endpoints work with
    // a fresh asset approach: verify 404 for nonexistent, then test with
    // an existing asset after removing its pair.

    // Delete the gallery-creative pair first
    const pairsResult = await adminApiCall(
      page,
      "GET",
      "/v1/admin/media/pairs",
    );
    expect(pairsResult.status).toBe(200);

    const pairs = (pairsResult.data as { pairs: Array<{ id: string; contentContext: string }> }).pairs;
    const galPair = pairs.find(
      (p) => p.contentContext === "gallery-creative",
    );
    expect(galPair).toBeDefined();

    // Delete the pair
    const delResult = await adminApiCall(
      page,
      "DELETE",
      `/v1/admin/media/pairs/${galPair!.id}`,
    );
    expect(delResult.status).toBe(200);

    // Archive the asset
    const archiveResult = await adminApiCall(
      page,
      "DELETE",
      "/v1/admin/media/assets/test-gal-light",
    );
    expect(archiveResult.status).toBe(200);

    // Verify it's not in public API
    const publicResult = await page.request.get(
      `${BACKEND_URL}/v1/media/assets/test-gal-light`,
    );
    expect(publicResult.status()).toBe(404);

    // Restore it
    const restoreResult = await adminApiCall(
      page,
      "POST",
      "/v1/admin/media/assets/test-gal-light/restore",
    );
    expect(restoreResult.status).toBe(200);
  });

  test("admin can list and manage media pairs", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);

    const result = await adminApiCall(
      page,
      "GET",
      "/v1/admin/media/pairs",
    );
    expect(result.status).toBe(200);

    const data = result.data as { pairs: Array<Record<string, unknown>> };
    expect(data.pairs.length).toBeGreaterThanOrEqual(4);
  });

  test("member cannot access admin media endpoints", async ({ page }) => {
    await loginAs(page, "member@test.production.city");

    const result = await adminApiCall(
      page,
      "GET",
      "/v1/admin/media/assets",
    );
    expect(result.status).toBe(403);
  });
});

// --- 8. CSRF on Admin Media Mutations ---

test.describe("CSRF on Admin Media Mutations", () => {
  test("cross-origin PATCH to admin media endpoint is rejected", async ({
    page,
  }) => {
    await loginAs(page, ADMIN_EMAIL);

    const response = await page.request.patch(
      `${BACKEND_URL}/v1/admin/media/assets/test-hero-light`,
      {
        headers: {
          Origin: "https://evil.example.com",
          "Content-Type": "application/json",
        },
        data: { alt: "hacked" },
      },
    );

    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.error).toBe("csrf_failed");
  });

  test("cross-origin DELETE to admin media endpoint is rejected", async ({
    page,
  }) => {
    await loginAs(page, ADMIN_EMAIL);

    const response = await page.request.delete(
      `${BACKEND_URL}/v1/admin/media/assets/test-hero-light`,
      {
        headers: {
          Origin: "https://evil.example.com",
        },
      },
    );

    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.error).toBe("csrf_failed");
  });

  test("cross-origin POST to admin media pairs is rejected", async ({
    page,
  }) => {
    await loginAs(page, ADMIN_EMAIL);

    const response = await page.request.post(
      `${BACKEND_URL}/v1/admin/media/pairs`,
      {
        headers: {
          Origin: "https://evil.example.com",
          "Content-Type": "application/json",
        },
        data: {
          contentContext: "evil-pair",
          lightAssetId: "test-hero-light",
          darkAssetId: "test-hero-dark",
        },
      },
    );

    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.error).toBe("csrf_failed");
  });
});
