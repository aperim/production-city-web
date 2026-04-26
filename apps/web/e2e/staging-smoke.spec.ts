/**
 * Staging smoke tests — PRO-199
 *
 * Prerequisites:
 *   - PRO-196: api.staging.production.city CNAME live
 *   - PRO-197/PRO-193: API/WS env resolver deployed to staging
 *   - PRO-194: CSP updated to allow api.staging.production.city
 *
 * Run against staging only (not local dev or CI unit tests):
 *   BASE_URL=https://staging.production.city \
 *   BACKEND_URL=https://api.staging.production.city \
 *   pnpm exec playwright test --config apps/web/playwright.staging.config.ts \
 *     --project staging-smoke
 */

import { test, expect } from "@playwright/test";

const BACKEND_URL =
  process.env.BACKEND_URL ?? "https://api.staging.production.city";

// ─── Frontend loads ───────────────────────────────────────────────────────────

test("staging: homepage returns 200 @staging-smoke", async ({ page }) => {
  const response = await page.goto("/");
  expect(response).not.toBeNull();
  expect(response!.status()).toBe(200);
  await expect(page.locator("html")).toBeVisible();
});

test("staging: page title contains Production City @staging-smoke", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Production City/i);
});

test("staging: no console errors on homepage @staging-smoke", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(errors, `Console errors: ${errors.join(", ")}`).toHaveLength(0);
});

test("staging: main landmark is present @staging-smoke", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("main")).toBeVisible();
});

// ─── Security headers ─────────────────────────────────────────────────────────

test("staging: security headers present @staging-smoke", async ({ page }) => {
  const response = await page.goto("/");
  expect(response).not.toBeNull();
  const headers = response!.headers();

  expect(headers["content-security-policy"]).toBeDefined();
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["x-frame-options"]).toBe("DENY");
});

test("staging: CSP connect-src allows api.staging.production.city @staging-smoke", async ({
  page,
}) => {
  const response = await page.goto("/");
  expect(response).not.toBeNull();
  const csp = response!.headers()["content-security-policy"] ?? "";

  expect(csp).toContain("api.staging.production.city");
  // Must NOT fall back to blocking all cross-origin or only allowing production API
  expect(csp).not.toMatch(/connect-src 'self' https:\/\/api\.production\.city[^;]*;/);
});

// ─── API health ───────────────────────────────────────────────────────────────

test("staging: backend API health endpoint responds @staging-smoke", async ({ request }) => {
  const response = await request.get(`${BACKEND_URL}/health`);
  expect(response.ok()).toBe(true);
  const body = await response.json();
  expect(body).toHaveProperty("status");
});

test("staging: backend API is not serving production data @staging-smoke", async ({ request }) => {
  // /health or /v1/env-info should identify this as staging, not production
  const response = await request.get(`${BACKEND_URL}/health`);
  expect(response.ok()).toBe(true);
  const body = (await response.json()) as Record<string, unknown>;

  // The environment field must not claim to be production
  if (Object.prototype.hasOwnProperty.call(body, "environment")) {
    expect(body["environment"]).not.toBe("production");
  }
  if (Object.prototype.hasOwnProperty.call(body, "env")) {
    expect(body["env"]).not.toBe("production");
  }
});

test("staging: API CORS allows staging origin @staging-smoke", async ({ request }) => {
  const response = await request.get(`${BACKEND_URL}/health`, {
    headers: { Origin: "https://staging.production.city" },
  });
  const allowOrigin = response.headers()["access-control-allow-origin"] ?? "";
  // Must allow staging origin (exact match or wildcard)
  const allowed =
    allowOrigin === "https://staging.production.city" ||
    allowOrigin === "*";
  expect(
    allowed,
    `access-control-allow-origin was "${allowOrigin}", expected staging origin or *`,
  ).toBe(true);
});

test("staging: API CORS does not expose wildcard on authenticated endpoints", async ({
  request,
}) => {
  const response = await request.options(`${BACKEND_URL}/v1/auth/me`, {
    headers: {
      Origin: "https://evil.example.com",
      "Access-Control-Request-Method": "GET",
    },
  });
  const allowOrigin = response.headers()["access-control-allow-origin"] ?? "";
  // An unknown origin must NOT be reflected back
  expect(allowOrigin).not.toBe("https://evil.example.com");
});

// ─── Auth page renders ────────────────────────────────────────────────────────

test("staging: login page renders @staging-smoke", async ({ page }) => {
  const response = await page.goto("/login");
  expect(response).not.toBeNull();
  expect(response!.status()).toBe(200);
  await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
});

test("staging: unauthenticated dashboard redirects to login @staging-smoke", async ({
  page,
}) => {
  await page.goto("/dashboard");
  // Should redirect to login (not throw a 500 or show dashboard content)
  await expect(page).toHaveURL(/\/login(\?.*)?$/);
});

// ─── Static assets ────────────────────────────────────────────────────────────

test("staging: robots.txt accessible @staging-smoke", async ({ page }) => {
  const response = await page.goto("/robots.txt");
  expect(response).not.toBeNull();
  expect(response!.status()).toBe(200);
});

test("staging: 404 page renders for unknown route", async ({ page }) => {
  const response = await page.goto("/this-path-definitely-does-not-exist-xyz");
  expect(response).not.toBeNull();
  expect(response!.status()).toBe(404);
  await expect(page.locator("html")).toBeVisible();
});
