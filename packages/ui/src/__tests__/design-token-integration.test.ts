import fs from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";

const globalsPath = path.resolve(import.meta.dirname, "../globals.css");
const css = fs.readFileSync(globalsPath, "utf-8");

describe("Issue #215 — Design Token Integration", () => {
  describe("Radius tokens use spacing scale", () => {
    it("--radius-sm uses --pc-spacing-1 (4px)", () => {
      expect(css).toContain("--radius-sm: var(--pc-spacing-1)");
    });

    it("--radius-md uses --pc-spacing-2 (8px)", () => {
      expect(css).toContain("--radius-md: var(--pc-spacing-2)");
    });

    it("--radius-lg uses --pc-spacing-3 (12px)", () => {
      expect(css).toContain("--radius-lg: var(--pc-spacing-3)");
    });
  });

  describe("Font family tokens reference generated CSS variables", () => {
    it("body font-family uses --pc-font-font-family-primary", () => {
      expect(css).toContain("var(--pc-font-font-family-primary)");
    });

    it("mono font uses --pc-font-font-family-mono", () => {
      expect(css).toContain("var(--pc-font-font-family-mono)");
    });

    it("does NOT reference non-existent --pc-font-family-primary", () => {
      // The generated tokens.css uses --pc-font-font-family-primary (double font)
      expect(css).not.toContain("var(--pc-font-family-primary)");
    });

    it("does NOT reference non-existent --pc-font-family-mono", () => {
      expect(css).not.toContain("var(--pc-font-family-mono)");
    });
  });

  describe("Theme inline block registers all semantic colors for Tailwind v4", () => {
    it("registers --color-primary in @theme inline", () => {
      expect(css).toMatch(/@theme inline\s*\{[^}]*--color-primary:/s);
    });

    it("registers --color-secondary in @theme inline", () => {
      expect(css).toMatch(/@theme inline\s*\{[^}]*--color-secondary:/s);
    });

    it("registers --color-ring in @theme inline", () => {
      expect(css).toMatch(/@theme inline\s*\{[^}]*--color-ring:/s);
    });

    it("registers --radius-sm in @theme inline", () => {
      expect(css).toMatch(/@theme inline\s*\{[^}]*--radius-sm:/s);
    });
  });

  describe("Uncodixify compliance — no banned patterns", () => {
    it("no gradient backgrounds in globals.css", () => {
      expect(css).not.toMatch(/linear-gradient|radial-gradient|conic-gradient/);
    });

    it("no oversized border-radius (>12px) in globals.css", () => {
      // radius-lg at 12px is the max per Uncodixify
      expect(css).not.toMatch(/border-radius:\s*(1[3-9]|[2-9]\d)\s*px/);
    });
  });
});
