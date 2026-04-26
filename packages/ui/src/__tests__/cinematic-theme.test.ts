// @vitest-environment node
import fs from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";

const globalsPath = path.resolve(import.meta.dirname, "../globals.css");
const css = fs.readFileSync(globalsPath, "utf-8");

/**
 * Extract the value of a CSS custom property from a block matching the selector.
 * Handles comma-separated selectors (e.g. ".light,\n[data-theme='light']").
 * Uses brace-depth tracking for accuracy with comment filtering.
 */
function getVarValue(selectorPart: string, varName: string): string | null {
  // Remove CSS comments to avoid false matches
  const cleaned = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const lines = cleaned.split("\n");
  let inTarget = false;
  let depth = 0;
  let body = "";
  let selectorBuffer = "";

  for (const line of lines) {
    const trimmed = line.trim();
    if (!inTarget) {
      // Skip @import and empty lines — not selectors
      if (trimmed.startsWith("@import") || trimmed === "") {
        selectorBuffer = "";
        continue;
      }
      if (!line.includes("{")) {
        selectorBuffer += " " + line;
      } else {
        selectorBuffer += " " + line.slice(0, line.indexOf("{"));
        if (selectorBuffer.includes(selectorPart)) {
          inTarget = true;
          depth = 1;
          body = line.slice(line.indexOf("{") + 1);
          selectorBuffer = "";
          continue;
        }
        selectorBuffer = "";
      }
    } else {
      for (const ch of line) {
        if (ch === "{") depth++;
        else if (ch === "}") depth--;
      }
      if (depth <= 0) {
        const escapedVar = varName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const propRegex = new RegExp(`${escapedVar}\\s*:\\s*([^;]+);`);
        const propMatch = body.match(propRegex);
        if (propMatch?.[1]) return propMatch[1].trim();
        inTarget = false;
        body = "";
      } else {
        body += "\n" + line;
      }
    }
  }
  return null;
}

describe("Issue #236 — Dark-Mode-First Cinematic Theme", () => {
  describe(":root defaults to dark palette", () => {
    it("--color-background is neutral-950 (deep dark)", () => {
      const val = getVarValue(":root", "--color-background");
      expect(val).toBe("var(--pc-color-neutral-950)");
    });

    it("--color-foreground is neutral-100 (light text)", () => {
      const val = getVarValue(":root", "--color-foreground");
      expect(val).toBe("var(--pc-color-neutral-100)");
    });

    it("--color-primary is primary-400 (blue accent)", () => {
      const val = getVarValue(":root", "--color-primary");
      expect(val).toBe("var(--pc-color-primary-400)");
    });

    it("--color-secondary is secondary-400 (magenta accent)", () => {
      const val = getVarValue(":root", "--color-secondary");
      expect(val).toBe("var(--pc-color-secondary-400)");
    });

    it("--color-muted is neutral-800 (subtle dark surface)", () => {
      const val = getVarValue(":root", "--color-muted");
      expect(val).toBe("var(--pc-color-neutral-800)");
    });

    it("--color-muted-foreground is neutral-400 (subdued text)", () => {
      const val = getVarValue(":root", "--color-muted-foreground");
      expect(val).toBe("var(--pc-color-neutral-400)");
    });

    it("sets color-scheme: dark", () => {
      const val = getVarValue(":root", "color-scheme");
      expect(val).toBe("dark");
    });
  });

  describe("Cinematic layout custom properties", () => {
    it("defines --section-padding", () => {
      expect(css).toContain("--section-padding:");
    });

    it("defines --hero-height", () => {
      expect(css).toContain("--hero-height:");
    });

    it("defines --content-max-width", () => {
      expect(css).toContain("--content-max-width:");
    });
  });

  describe("Typography scale custom properties", () => {
    it("defines --font-size-display", () => {
      expect(css).toContain("--font-size-display:");
    });

    it("defines --font-size-heading", () => {
      expect(css).toContain("--font-size-heading:");
    });

    it("defines --font-size-body", () => {
      expect(css).toContain("--font-size-body:");
    });

    it("defines --font-size-caption", () => {
      expect(css).toContain("--font-size-caption:");
    });
  });

  describe(".light class overrides work correctly", () => {
    it(".light overrides --color-background to a light value", () => {
      const val = getVarValue(".light", "--color-background");
      expect(val).not.toBeNull();
      expect(val!).toMatch(/--pc-color-neutral-50/);
    });

    it(".light overrides --color-foreground to a dark value", () => {
      const val = getVarValue(".light", "--color-foreground");
      expect(val).not.toBeNull();
      expect(val!).toMatch(/--pc-color-neutral-950/);
    });

    it(".light overrides --color-primary to a darker shade", () => {
      const val = getVarValue(".light", "--color-primary");
      expect(val).not.toBeNull();
      expect(val!).toMatch(/--pc-color-primary-700/);
    });
  });

  describe("@theme inline registers cinematic tokens for Tailwind v4", () => {
    it("registers --section-padding in @theme inline", () => {
      expect(css).toMatch(/@theme inline\s*\{[^}]*--section-padding:/s);
    });

    it("registers --hero-height in @theme inline", () => {
      expect(css).toMatch(/@theme inline\s*\{[^}]*--hero-height:/s);
    });

    it("registers --content-max-width in @theme inline", () => {
      expect(css).toMatch(/@theme inline\s*\{[^}]*--content-max-width:/s);
    });

    it("registers --font-size-display in @theme inline", () => {
      expect(css).toMatch(/@theme inline\s*\{[^}]*--font-size-display:/s);
    });

    it("registers --font-size-heading in @theme inline", () => {
      expect(css).toMatch(/@theme inline\s*\{[^}]*--font-size-heading:/s);
    });

    it("registers --font-size-body in @theme inline", () => {
      expect(css).toMatch(/@theme inline\s*\{[^}]*--font-size-body:/s);
    });

    it("registers --font-size-caption in @theme inline", () => {
      expect(css).toMatch(/@theme inline\s*\{[^}]*--font-size-caption:/s);
    });
  });
});
