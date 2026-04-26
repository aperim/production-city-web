// @vitest-environment node
import fs from "node:fs";
import path from "node:path";
import { describe, it, expect } from "vitest";

const globalsPath = path.resolve(import.meta.dirname, "../globals.css");
const css = fs.readFileSync(globalsPath, "utf-8");

/**
 * Extract the value of a CSS custom property from a block matching the selector.
 * Uses a more robust approach that handles complex selectors.
 */
function getVarValue(selectorPart: string, varName: string): string | null {
  const escapedSelector = selectorPart.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const blockRegex = new RegExp(escapedSelector + "[^{]*\\{([^}]+)\\}", "s");
  const match = css.match(blockRegex);
  if (!match?.[1]) return null;
  const block = match[1];
  const escapedVar = varName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const propRegex = new RegExp(`${escapedVar}\\s*:\\s*([^;]+);`);
  const propMatch = block.match(propRegex);
  return propMatch?.[1]?.trim() ?? null;
}

describe("Issue #213 — Brand Color Theme Variables", () => {
  describe("Dark mode (:root — default)", () => {
    it("--color-primary uses primary blue token, not neutral", () => {
      const val = getVarValue(":root", "--color-primary");
      expect(val).not.toBeNull();
      expect(val!).toMatch(/--pc-color-primary-/);
      expect(val!).not.toMatch(/--pc-color-neutral-/);
    });

    it("--color-primary-foreground provides readable contrast", () => {
      const val = getVarValue(":root", "--color-primary-foreground");
      expect(val).not.toBeNull();
    });

    it("--color-secondary uses secondary magenta token, not neutral", () => {
      const val = getVarValue(":root", "--color-secondary");
      expect(val).not.toBeNull();
      expect(val!).toMatch(/--pc-color-secondary-/);
      expect(val!).not.toMatch(/--pc-color-neutral-/);
    });

    it("--color-accent uses a brand color token for CTAs", () => {
      const val = getVarValue(":root", "--color-accent");
      expect(val).not.toBeNull();
      expect(val!).not.toBe("var(--pc-color-neutral-100)");
    });

    it("--color-ring uses brand color for focus rings", () => {
      const val = getVarValue(":root", "--color-ring");
      expect(val).not.toBeNull();
      expect(val!).toMatch(/--pc-color-primary-/);
    });

    it("--color-background remains neutral", () => {
      const val = getVarValue(":root", "--color-background");
      expect(val).not.toBeNull();
      expect(val!).toMatch(/--pc-color-neutral-/);
    });

    it("--color-foreground remains neutral for text", () => {
      const val = getVarValue(":root", "--color-foreground");
      expect(val).not.toBeNull();
      expect(val!).toMatch(/--pc-color-neutral-/);
    });
  });

  describe("Light mode (.light class)", () => {
    it("--color-primary uses primary blue token, not neutral", () => {
      const val = getVarValue(".light", "--color-primary");
      expect(val).not.toBeNull();
      expect(val!).toMatch(/--pc-color-primary-/);
      expect(val!).not.toMatch(/--pc-color-neutral-/);
    });

    it("--color-secondary uses secondary magenta token, not neutral", () => {
      const val = getVarValue(".light", "--color-secondary");
      expect(val).not.toBeNull();
      expect(val!).toMatch(/--pc-color-secondary-/);
      expect(val!).not.toMatch(/--pc-color-neutral-/);
    });

    it("--color-accent uses a brand color, not neutral-800", () => {
      const val = getVarValue(".light", "--color-accent");
      expect(val).not.toBeNull();
      expect(val!).not.toBe("var(--pc-color-neutral-800)");
    });

    it("--color-ring uses brand color for focus rings", () => {
      const val = getVarValue(".light", "--color-ring");
      expect(val).not.toBeNull();
      expect(val!).toMatch(/--pc-color-primary-/);
    });

    it("--color-background remains neutral", () => {
      const val = getVarValue(".light", "--color-background");
      expect(val).not.toBeNull();
      expect(val!).toMatch(/--pc-color-neutral-/);
    });
  });
});
