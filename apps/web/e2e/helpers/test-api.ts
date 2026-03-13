/**
 * E2E test helpers for interacting with the test-only API.
 * These helpers call /v1/test/* endpoints which are only available
 * when NODE_ENV=test AND TEST_ENABLED=true.
 */

import type { Page } from "@playwright/test";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://localhost:8787";
const APP_URL = process.env.BASE_URL ?? "http://localhost:4321";

interface MagicLinkResult {
  token: string;
  code: string;
  email: string;
  purpose: string;
  expiresAt: string;
}

interface SeedResult {
  message: string;
  users: {
    admin: { id: string; email: string };
    member: { id: string; email: string };
    viewer: { id: string; email: string };
  };
}

/**
 * Creates a magic link for the given email via the test API.
 * Returns the raw token and code that can be used for verification.
 */
export async function createMagicLink(
  email: string,
  purpose = "login",
): Promise<MagicLinkResult> {
  const res = await fetch(`${BACKEND_URL}/v1/test/create-magic-link`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, purpose }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to create magic link: ${res.status} ${err}`);
  }

  return res.json() as Promise<MagicLinkResult>;
}

/**
 * Gets the magic code for a given email from the test API.
 */
export async function getMagicCode(email: string): Promise<string> {
  const result = await createMagicLink(email);
  return result.code;
}

/**
 * Gets the magic token for a given email from the test API.
 */
export async function getMagicToken(email: string): Promise<string> {
  const result = await createMagicLink(email);
  return result.token;
}

/**
 * Resets all test state via the test API.
 */
export async function resetTestState(): Promise<void> {
  const res = await fetch(`${BACKEND_URL}/v1/test/reset`, {
    method: "POST",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to reset test state: ${res.status} ${err}`);
  }
}

/**
 * Seeds test users via the test API.
 */
export async function seedTestUsers(): Promise<SeedResult> {
  const res = await fetch(`${BACKEND_URL}/v1/test/seed`, {
    method: "POST",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Failed to seed test users: ${res.status} ${err}`);
  }

  return res.json() as Promise<SeedResult>;
}

/**
 * Logs in as a specific user by creating a magic link and verifying it.
 * Sets the session cookie on the page context.
 */
export async function loginAs(page: Page, email: string): Promise<void> {
  const { token } = await createMagicLink(email);
  const verifyUrl = `${APP_URL}/auth/verify?token=${encodeURIComponent(token)}`;

  // Navigate to verify URL — this will set the session cookie
  await page.goto(verifyUrl);

  // Wait for redirect to dashboard (or wherever the verify page redirects)
  await page.waitForURL("**/dashboard**", { timeout: 15_000 });
}

/**
 * Logs in via the login page UI (email entry + code verification).
 * This tests the full user-facing login flow.
 */
export async function loginViaUI(page: Page, email: string): Promise<void> {
  // Create a magic link so we have a valid code
  const { code } = await createMagicLink(email);

  await page.goto("/login");

  // Enter email
  const emailInput = page.getByPlaceholder("you@example.com");
  await emailInput.fill(email);

  // Submit
  const submitButton = page.getByRole("button", { name: /send magic link/i });
  await submitButton.click();

  // Wait for code input to appear
  const codeInput = page.getByPlaceholder("000000");
  await codeInput.waitFor({ state: "visible", timeout: 10_000 });

  // Enter code
  await codeInput.fill(code);

  // Verify
  const verifyButton = page.getByRole("button", { name: /verify/i });
  await verifyButton.click();

  // Wait for redirect
  await page.waitForURL("**/dashboard**", { timeout: 15_000 });
}

/**
 * Performs an admin API call with the session cookie from the page.
 */
export async function adminApiCall(
  page: Page,
  method: string,
  path: string,
  body?: unknown,
): Promise<{ status: number; data: unknown }> {
  const result = await page.evaluate(
    async ({ method, path, body }: { method: string; path: string; body: unknown }) => {
      const init: RequestInit = {
        method,
        credentials: "include",
        headers: { Accept: "application/json" },
      };
      if (body !== undefined) {
        (init.headers as Record<string, string>)["Content-Type"] = "application/json";
        init.body = JSON.stringify(body);
      }
      const res = await fetch(path, init);
      const data = await res.json();
      return { status: res.status, data };
    },
    { method, path, body },
  );
  return result as { status: number; data: unknown };
}
