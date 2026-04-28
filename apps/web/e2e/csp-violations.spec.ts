/**
 * E2E tests: CSP (Content Security Policy) violation detection — PRO-401
 *
 * Verifies that key pages render without triggering any browser CSP violations.
 * Uses securitypolicyviolation DOM events (registered before navigation via
 * addInitScript) plus console error pattern matching.
 *
 * Selective run: pnpm exec playwright test --grep @csp
 */

import { test, expect } from "@playwright/test";

const KEY_PAGES = [
  "/",
  "/facilities",
  "/vision",
  "/community",
  "/faq",
  "/contact",
];

// CSP console error patterns emitted by Chrome/Firefox/Safari
const CSP_CONSOLE_PATTERN =
  /refused to (execute|load|connect|apply|frame|display|evaluate)/i;

for (const pagePath of KEY_PAGES) {
  test(`no CSP violations on ${pagePath} @csp`, async ({ page }) => {
    const violations: string[] = [];

    // Register securitypolicyviolation listener before the page navigates so
    // violations fired during initial load are not missed.
    await page.addInitScript(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).__cspViolations = [] as string[];
      window.addEventListener("securitypolicyviolation", (e) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (window as any).__cspViolations.push(
          `violatedDirective=${e.violatedDirective} effectiveDirective=${e.effectiveDirective} blockedURI="${e.blockedURI}"`,
        );
      });
    });

    // Collect browser console errors that match CSP refusal messages.
    page.on("console", (msg) => {
      if (msg.type() === "error" && CSP_CONSOLE_PATTERN.test(msg.text())) {
        violations.push(`[console.error] ${msg.text()}`);
      }
    });

    // Collect uncaught page errors — CSP violations can surface here too.
    page.on("pageerror", (err) => {
      if (/content.?security.?policy|CSP/i.test(err.message)) {
        violations.push(`[pageerror] ${err.message}`);
      }
    });

    await page.goto(pagePath);
    await page.waitForLoadState("networkidle");

    // Drain violations captured via the DOM event listener.
    const domViolations = await page.evaluate<string[]>(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      () => (window as any).__cspViolations ?? [],
    );
    for (const v of domViolations) {
      violations.push(`[securitypolicyviolation] ${v}`);
    }

    expect(
      violations,
      [
        `CSP violations detected on "${pagePath}":`,
        ...violations.map((v) => `  • ${v}`),
      ].join("\n"),
    ).toHaveLength(0);
  });
}
