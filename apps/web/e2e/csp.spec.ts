/**
 * E2E tests: CSP violation detection.
 * Verifies that browsing key public pages triggers no Content-Security-Policy
 * violations in the browser — both via the SecurityPolicyViolation DOM event
 * and via CSP-related console errors.
 *
 * Would have caught the 6e2daa8 regression before merge.
 *
 * @see PRO-401
 */
import { test, expect } from "@playwright/test";

declare global {
  interface Window {
    __cspViolations: string[];
  }
}

const KEY_PAGES = [
  { path: "/", name: "home" },
  { path: "/facilities", name: "facilities" },
  { path: "/network", name: "network" },
];

test.describe("CSP violations", () => {
  for (const { path, name } of KEY_PAGES) {
    test(`${name} page has no CSP violations @csp`, async ({ page }) => {
      const consoleErrors: string[] = [];

      // Register the securitypolicyviolation listener before any page script
      // runs so we capture violations from inline scripts on initial load.
      await page.addInitScript(() => {
        window.__cspViolations = [];
        document.addEventListener("securitypolicyviolation", (e) => {
          window.__cspViolations.push(
            `${e.violatedDirective}: blocked <${e.blockedURI}>`,
          );
        });
      });

      // Capture CSP-related console errors (browsers emit these alongside the
      // SecurityPolicyViolation event but the text is more human-readable).
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          const text = msg.text();
          if (
            text.includes("Content-Security-Policy") ||
            text.includes("Refused to") ||
            /\bCSP\b/i.test(text)
          ) {
            consoleErrors.push(text);
          }
        }
      });

      await page.goto(path, { waitUntil: "networkidle" });

      const violations: string[] = await page.evaluate(
        () => window.__cspViolations ?? [],
      );

      expect(
        violations,
        `SecurityPolicyViolation events on ${path}:\n${violations.join("\n")}`,
      ).toHaveLength(0);

      expect(
        consoleErrors,
        `CSP console errors on ${path}:\n${consoleErrors.join("\n")}`,
      ).toHaveLength(0);
    });
  }
});
