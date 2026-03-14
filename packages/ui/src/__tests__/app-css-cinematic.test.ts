import fs from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";

const appCssPath = path.resolve(
  import.meta.dirname,
  "../../../../apps/web/app.css",
);
const css = fs.readFileSync(appCssPath, "utf-8");

describe("Issue #236 — app.css Cinematic Base Styles", () => {
  it("smooth scrolling is gated behind prefers-reduced-motion: no-preference", () => {
    // Must be inside a media query, not ungated
    expect(css).toMatch(
      /prefers-reduced-motion:\s*no-preference[^}]*scroll-behavior:\s*smooth/s,
    );
  });

  it("does NOT set scroll-behavior: smooth ungated on html/body", () => {
    // If scroll-behavior appears, it must only be inside a media query
    const lines = css.split("\n");
    let insideMediaQuery = false;
    let mediaDepth = 0;
    for (const line of lines) {
      if (line.includes("@media")) {
        insideMediaQuery = true;
        mediaDepth++;
      }
      if (insideMediaQuery) {
        const opens = (line.match(/{/g) ?? []).length;
        const closes = (line.match(/}/g) ?? []).length;
        mediaDepth += opens - closes;
        if (mediaDepth <= 0) {
          insideMediaQuery = false;
          mediaDepth = 0;
        }
      }
      if (
        !insideMediaQuery &&
        line.includes("scroll-behavior") &&
        line.includes("smooth")
      ) {
        expect.fail(
          "scroll-behavior: smooth found outside of @media prefers-reduced-motion",
        );
      }
    }
  });

  it("sets color-scheme on body via inherit (defers to :root / .light override)", () => {
    // body should use color-scheme: inherit so .light class on html can override
    expect(css).toMatch(/color-scheme:\s*inherit/);
  });
});
