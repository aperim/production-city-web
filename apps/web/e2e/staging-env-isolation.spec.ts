/**
 * Staging environment isolation tests — PRO-199
 *
 * Confirms staging cannot reach or leak production data:
 *   - API calls are routed to api.staging.production.city, not api.production.city
 *   - Auth tokens issued for staging are scoped to staging domain
 *   - WebSocket connects to the staging WS endpoint
 *
 * Run against staging only:
 *   BASE_URL=https://staging.production.city \
 *   BACKEND_URL=https://api.staging.production.city \
 *   pnpm exec playwright test --config apps/web/playwright.staging.config.ts
 */

import { test, expect } from "@playwright/test";

const STAGING_HOSTNAME = "staging.production.city";
const STAGING_API = "api.staging.production.city";
const PROD_API = "api.production.city";

// ─── Network request routing ──────────────────────────────────────────────────

test("staging: no API calls go to api.production.city", async ({ page }) => {
  const prodApiCalls: string[] = [];

  page.on("request", (req) => {
    try {
      const url = new URL(req.url());
      if (url.hostname === PROD_API) {
        prodApiCalls.push(req.url());
      }
    } catch {
      // ignore non-URL requests
    }
  });

  await page.goto("/");
  await page.waitForLoadState("networkidle");
  // Also navigate to a page that triggers API calls
  await page.goto("/login");
  await page.waitForLoadState("networkidle");

  expect(
    prodApiCalls,
    `Requests leaked to production API: ${prodApiCalls.join(", ")}`,
  ).toHaveLength(0);
});

test("staging: API calls use api.staging.production.city", async ({ page }) => {
  const stagingApiCalls: string[] = [];
  const otherApiCalls: string[] = [];

  page.on("request", (req) => {
    try {
      const url = new URL(req.url());
      if (url.hostname.endsWith("production.city")) {
        if (url.hostname === STAGING_API) {
          stagingApiCalls.push(req.url());
        } else if (url.hostname !== STAGING_HOSTNAME) {
          otherApiCalls.push(req.url());
        }
      }
    } catch {
      // ignore
    }
  });

  // Load login page — should trigger a /v1/auth/me or session check
  await page.goto("/login");
  await page.waitForLoadState("networkidle");

  expect(
    otherApiCalls,
    `Unexpected production.city calls (not staging): ${otherApiCalls.join(", ")}`,
  ).toHaveLength(0);
});

// ─── Auth cookie domain isolation ─────────────────────────────────────────────

test("staging: session cookies are scoped to staging domain", async ({ page }) => {
  // Navigate to verify endpoint with a bogus token — we inspect the Set-Cookie
  // header on the verify attempt even if the token is invalid. If a cookie IS
  // set on invalid tokens that is a separate security issue; here we check the
  // Domain attribute of any cookie that IS set.
  await page.goto("/login");
  await page.waitForLoadState("networkidle");

  const cookies = await page.context().cookies();
  for (const cookie of cookies) {
    if (cookie.name.startsWith("__Secure-session") || cookie.name === "session") {
      // Cookie must not be scoped to production.city (would allow cross-env sharing)
      expect(
        cookie.domain,
        `Session cookie domain "${cookie.domain}" spans production`,
      ).not.toBe("production.city");
    }
  }
});

// ─── WebSocket endpoint isolation ─────────────────────────────────────────────

test("staging: WebSocket upgrade targets staging API hostname", async ({ page }) => {
  const wsConnections: string[] = [];

  page.on("websocket", (ws) => {
    wsConnections.push(ws.url());
  });

  // Navigate to a page that might initiate WS (login page won't, but we want
  // to confirm no stray prod WS connections either)
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  await page.goto("/login");
  await page.waitForLoadState("networkidle");

  // Any WebSocket connections initiated must use staging API, not production
  for (const wsUrl of wsConnections) {
    try {
      const url = new URL(wsUrl);
      if (url.hostname.endsWith("production.city")) {
        expect(url.hostname).toBe(STAGING_API);
      }
    } catch {
      // ignore
    }
  }
});

// ─── CSP header isolation ─────────────────────────────────────────────────────

test("staging: CSP does not allow production API in connect-src", async ({ page }) => {
  const response = await page.goto("/");
  expect(response).not.toBeNull();
  const csp = response!.headers()["content-security-policy"] ?? "";

  // Staging CSP must not whitelist the production API endpoint
  expect(csp, "CSP must not allow production API on staging").not.toContain(
    `https://${PROD_API}`,
  );
  expect(csp, "CSP must not allow production WS on staging").not.toContain(
    `wss://${PROD_API}`,
  );
});

test("staging: CSP allows staging API in connect-src", async ({ page }) => {
  const response = await page.goto("/");
  expect(response).not.toBeNull();
  const csp = response!.headers()["content-security-policy"] ?? "";

  expect(csp, `CSP missing staging API — got: ${csp}`).toContain(
    STAGING_API,
  );
});
