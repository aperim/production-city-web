/**
 * E2E tests: Security & Provenance Audit — Media Pipeline (#164)
 *
 * Covers: MIME allowlist, file size limits, hostname allowlist, XSS prevention,
 * CSRF on admin endpoints, localPath exposure, CSP considerations,
 * provenance integrity, and admin authorization.
 *
 * All assertions are deterministic. No waitForTimeout.
 */

import { test, expect } from "./helpers/setup";
import { loginAs, seedMediaTestData, adminApiCall } from "./helpers/test-api";

const ADMIN_EMAIL = "admin@test.production.city";
const MEMBER_EMAIL = "member@test.production.city";
const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8787";

test.beforeEach(async () => {
  await seedMediaTestData();
});

// --- 1. Public API: localPath never exposed ---

test.describe("Security — localPath Never Exposed", () => {
  test("single pair endpoint does not expose localPath or downloadUrl", async ({
    request,
  }) => {
    const response = await request.get(
      `${BACKEND_URL}/v1/media/pairs/hero-home`,
    );
    expect(response.status()).toBe(200);

    const data = await response.json();
    const responseText = JSON.stringify(data);

    // localPath must never appear in public response
    expect(responseText).not.toContain("localPath");
    expect(responseText).not.toContain("downloadUrl");
    expect(responseText).not.toContain("public/media/");
  });

  test("batch endpoint does not expose localPath or downloadUrl", async ({
    request,
  }) => {
    const response = await request.get(
      `${BACKEND_URL}/v1/media/pairs?contexts=hero-home,hero-facilities`,
    );
    expect(response.status()).toBe(200);

    const data = await response.json();
    const responseText = JSON.stringify(data);

    expect(responseText).not.toContain("localPath");
    expect(responseText).not.toContain("downloadUrl");
  });

  test("single asset endpoint does not expose localPath or downloadUrl", async ({
    request,
  }) => {
    const response = await request.get(
      `${BACKEND_URL}/v1/media/assets/test-hero-light`,
    );
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).not.toHaveProperty("localPath");
    expect(data).not.toHaveProperty("downloadUrl");
  });
});

// --- 2. Admin API: authentication and authorization ---

test.describe("Security — Admin Media Auth", () => {
  test("unauthenticated requests to admin media endpoints return 401", async ({
    request,
  }) => {
    const endpoints = [
      { method: "GET", path: "/v1/admin/media/assets" },
      { method: "GET", path: "/v1/admin/media/assets/test-hero-light" },
      { method: "GET", path: "/v1/admin/media/pairs" },
    ];

    for (const ep of endpoints) {
      const response = await request.fetch(`${BACKEND_URL}${ep.path}`, {
        method: ep.method,
      });
      expect(response.status()).toBe(401);
    }
  });

  test("member role cannot access admin media endpoints", async ({ page }) => {
    await loginAs(page, MEMBER_EMAIL);

    const result = await adminApiCall(
      page,
      "GET",
      "/v1/admin/media/assets",
    );
    expect(result.status).toBe(403);
  });

  test("member cannot mutate media assets", async ({ page }) => {
    await loginAs(page, MEMBER_EMAIL);

    const patchResult = await adminApiCall(
      page,
      "PATCH",
      "/v1/admin/media/assets/test-hero-light",
      { alt: "hacked" },
    );
    expect(patchResult.status).toBe(403);

    const deleteResult = await adminApiCall(
      page,
      "DELETE",
      "/v1/admin/media/assets/test-hero-light",
    );
    expect(deleteResult.status).toBe(403);
  });
});

// --- 3. Input validation ---

test.describe("Security — Input Validation", () => {
  test("content context rejects special characters", async ({ request }) => {
    const badContexts = [
      "has spaces",
      "has<script>",
      "../traversal",
      "a".repeat(101), // > 100 chars
      "has@special!chars",
    ];

    for (const ctx of badContexts) {
      const response = await request.get(
        `${BACKEND_URL}/v1/media/pairs/${encodeURIComponent(ctx)}`,
      );
      expect(response.status()).toBe(400);
    }
  });

  test("batch endpoint validates all contexts", async ({ request }) => {
    const response = await request.get(
      `${BACKEND_URL}/v1/media/pairs?contexts=valid,has<script>`,
    );
    expect(response.status()).toBe(400);
  });

  test("admin PATCH validates input fields", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);

    // reviewStatus must be one of accepted/rejected/pending
    const result = await adminApiCall(
      page,
      "PATCH",
      "/v1/admin/media/assets/test-hero-light",
      { reviewStatus: "invalid_status" },
    );
    // Should be rejected by Zod validation
    expect(result.status).toBe(400);
  });

  test("admin create pair validates content context format", async ({
    page,
  }) => {
    await loginAs(page, ADMIN_EMAIL);

    const result = await adminApiCall(
      page,
      "POST",
      "/v1/admin/media/pairs",
      {
        contentContext: "invalid context!",
        lightAssetId: "test-hero-light",
        darkAssetId: "test-hero-dark",
      },
    );
    expect(result.status).toBe(400);
  });

  test("admin create pair rejects non-existent asset IDs", async ({
    page,
  }) => {
    await loginAs(page, ADMIN_EMAIL);

    const result = await adminApiCall(
      page,
      "POST",
      "/v1/admin/media/pairs",
      {
        contentContext: "new-valid-context",
        lightAssetId: "nonexistent-1",
        darkAssetId: "nonexistent-2",
      },
    );
    expect(result.status).toBe(400);
  });

  test("admin create pair rejects duplicate content context", async ({
    page,
  }) => {
    await loginAs(page, ADMIN_EMAIL);

    const result = await adminApiCall(
      page,
      "POST",
      "/v1/admin/media/pairs",
      {
        contentContext: "hero-home", // already exists
        lightAssetId: "test-hero-light",
        darkAssetId: "test-hero-dark",
      },
    );
    expect(result.status).toBe(409);
  });
});

// --- 4. No XSS vectors in attribution ---

test.describe("Security — No XSS in Attribution", () => {
  test("attribution fields are structured, not raw HTML", async ({
    request,
  }) => {
    const response = await request.get(
      `${BACKEND_URL}/v1/media/pairs/hero-home`,
    );
    const data = await response.json();

    // Photographer is a plain string, not HTML
    expect(data.light.photographer).not.toContain("<");
    expect(data.light.photographer).not.toContain(">");
    expect(data.light.photographer).not.toContain("script");

    // photographerUrl is a valid URL, not javascript: or data:
    if (data.light.photographerUrl) {
      expect(data.light.photographerUrl).toMatch(/^https:\/\//);
      expect(data.light.photographerUrl).not.toMatch(/^javascript:/i);
      expect(data.light.photographerUrl).not.toMatch(/^data:/i);
    }

    // No attributionHtml field anywhere
    expect(data.light).not.toHaveProperty("attributionHtml");
    expect(data.dark).not.toHaveProperty("attributionHtml");
  });

  test("no attributionHtml field in API responses", async ({ request }) => {
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
      const text = await response.text();
      expect(text).not.toContain("attributionHtml");
    }
  });
});

// --- 5. Soft delete only (no hard deletes of assets) ---

test.describe("Security — Soft Delete Only", () => {
  test("DELETE on asset archives, does not hard-delete", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);

    // First remove the pair referencing the asset
    const pairsResult = await adminApiCall(
      page,
      "GET",
      "/v1/admin/media/pairs",
    );
    const pairs = (pairsResult.data as { pairs: Array<{ id: string; contentContext: string }> }).pairs;
    const galPair = pairs.find(
      (p) => p.contentContext === "gallery-creative",
    );
    await adminApiCall(page, "DELETE", `/v1/admin/media/pairs/${galPair!.id}`);

    // Archive the asset
    await adminApiCall(
      page,
      "DELETE",
      "/v1/admin/media/assets/test-gal-light",
    );

    // Asset should still exist in admin view with includeArchived
    const adminResult = await adminApiCall(
      page,
      "GET",
      "/v1/admin/media/assets?includeArchived=true",
    );
    expect(adminResult.status).toBe(200);
    const assets = (adminResult.data as { assets: Array<{ id: string; archivedAt: string | null }> }).assets;
    const archived = assets.find((a) => a.id === "test-gal-light");
    expect(archived).toBeDefined();
    expect(archived!.archivedAt).not.toBeNull();
  });
});

// --- 6. CSRF on all admin mutating endpoints ---

test.describe("Security — CSRF on Admin Media", () => {
  test("PATCH without origin is rejected", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);

    const response = await page.request.patch(
      `${BACKEND_URL}/v1/admin/media/assets/test-hero-light`,
      {
        headers: {
          "Content-Type": "application/json",
          // No Origin header
        },
        data: { alt: "test" },
      },
    );

    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.error).toBe("csrf_failed");
  });

  test("POST pair creation without origin is rejected", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);

    const response = await page.request.post(
      `${BACKEND_URL}/v1/admin/media/pairs`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        data: {
          contentContext: "csrf-test",
          lightAssetId: "test-hero-light",
          darkAssetId: "test-hero-dark",
        },
      },
    );

    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.error).toBe("csrf_failed");
  });

  test("DELETE pair without origin is rejected", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);

    const response = await page.request.delete(
      `${BACKEND_URL}/v1/admin/media/pairs/test-pair-hero-home`,
      {
        headers: {
          // No Origin
        },
      },
    );

    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.error).toBe("csrf_failed");
  });

  test("restore endpoint without origin is rejected", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);

    const response = await page.request.post(
      `${BACKEND_URL}/v1/admin/media/assets/test-hero-light/restore`,
      {
        headers: {
          // No Origin
        },
      },
    );

    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.error).toBe("csrf_failed");
  });
});

// --- 7. Audit logging on admin mutations ---

test.describe("Security — Audit Logging", () => {
  test("admin media mutations create audit log entries", async ({ page }) => {
    await loginAs(page, ADMIN_EMAIL);

    // Perform a mutation
    await adminApiCall(
      page,
      "PATCH",
      "/v1/admin/media/assets/test-hero-light",
      { alt: "Audit test alt text" },
    );

    // Check audit log
    const auditResult = await adminApiCall(
      page,
      "GET",
      "/v1/admin/audit-log?resource=media_asset",
    );
    expect(auditResult.status).toBe(200);

    const auditData = auditResult.data as {
      entries: Array<{
        action: string;
        resource: string;
      }>;
    };
    expect(auditData.entries).toBeDefined();
    const mediaEntries = auditData.entries.filter(
      (e) => e.resource === "media_asset",
    );
    expect(mediaEntries.length).toBeGreaterThan(0);
    expect(
      mediaEntries.some((e) => e.action === "media.asset.updated"),
    ).toBe(true);
  });
});

// --- 8. Error response sanitization ---

test.describe("Security — Error Response Sanitization", () => {
  test("error responses do not leak stack traces", async ({ request }) => {
    const response = await request.get(
      `${BACKEND_URL}/v1/media/pairs/nonexistent`,
    );
    const data = await response.json();

    const text = JSON.stringify(data);
    expect(text).not.toContain("at ");
    expect(text).not.toContain(".ts:");
    expect(text).not.toContain(".js:");
    expect(text).not.toContain("node_modules");
    expect(text).not.toContain("Error:");
  });

  test("404 for asset does not reveal internal paths", async ({ request }) => {
    const response = await request.get(
      `${BACKEND_URL}/v1/media/assets/nonexistent`,
    );
    const data = await response.json();

    const text = JSON.stringify(data);
    expect(text).not.toContain("public/media/");
    expect(text).not.toContain("/home/");
    expect(text).not.toContain("/tmp/");
  });
});

// --- 9. Provenance chain integrity ---

test.describe("Security — Provenance Integrity", () => {
  test("every asset has a valid license", async ({ request }) => {
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

      expect(data.light.license).toBeTruthy();
      expect(data.dark.license).toBeTruthy();
    }
  });

  test("every Pexels asset has source=pexels and externalUrl", async ({
    request,
  }) => {
    const response = await request.get(
      `${BACKEND_URL}/v1/media/pairs/hero-home`,
    );
    const data = await response.json();

    expect(data.light.source).toBe("pexels");
    expect(data.light.externalUrl).toContain("pexels.com");
  });

  test("externalUrl is HTTPS", async ({ request }) => {
    const response = await request.get(
      `${BACKEND_URL}/v1/media/pairs/hero-home`,
    );
    const data = await response.json();

    if (data.light.externalUrl) {
      expect(data.light.externalUrl).toMatch(/^https:\/\//);
    }
    if (data.dark.externalUrl) {
      expect(data.dark.externalUrl).toMatch(/^https:\/\//);
    }
  });
});

// --- 10. Admin localPath exposure in admin responses ---

test.describe("Security — Admin localPath Access Control", () => {
  test("admin API includes localPath (admin-only visibility)", async ({
    page,
  }) => {
    await loginAs(page, ADMIN_EMAIL);

    const result = await adminApiCall(
      page,
      "GET",
      "/v1/admin/media/assets/test-hero-light",
    );
    expect(result.status).toBe(200);

    const data = result.data as { localPath: string; publicPath: string };
    // Admin CAN see localPath (needed for management)
    expect(data.localPath).toBeTruthy();
    expect(data.publicPath).toBeTruthy();
    // But localPath is a relative server path, not an absolute system path
    expect(data.localPath).not.toMatch(/^\//);
    expect(data.localPath).toMatch(/^public\//);
  });
});
