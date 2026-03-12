import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const PACKAGE_ROOT = resolve(import.meta.dirname, "../..");
const STORY_DOCS_ROOT = resolve(PACKAGE_ROOT, "stories/docs");
const MAIN_CONFIG_PATH = resolve(PACKAGE_ROOT, ".storybook/main.ts");
const PREVIEW_CONFIG_PATH = resolve(PACKAGE_ROOT, ".storybook/preview.ts");

describe("storybook infrastructure", () => {
  it("loads stories from src and stories directories, including MDX docs", () => {
    const mainConfig = readFileSync(MAIN_CONFIG_PATH, "utf-8");

    expect(mainConfig).toContain("../src/**/*.stories.@(ts|tsx)");
    expect(mainConfig).toContain("../src/**/*.mdx");
    expect(mainConfig).toContain("../stories/**/*.stories.@(ts|tsx)");
    expect(mainConfig).toContain("../stories/**/*.mdx");
  });

  it("registers Storybook 10-compatible addons for docs, theming, a11y, testing, and design metadata", () => {
    const mainConfig = readFileSync(MAIN_CONFIG_PATH, "utf-8");

    expect(mainConfig).toContain("@storybook/addon-docs");
    expect(mainConfig).toContain("@storybook/addon-a11y");
    expect(mainConfig).toContain("@storybook/addon-themes");
    expect(mainConfig).toContain("storybook/viewport");
    expect(mainConfig).toContain("@storybook/addon-designs");
    expect(mainConfig).toContain("storybook-design-token");
    expect(mainConfig).toContain("@storybook/addon-vitest");
  });

  it("enables autodocs and a CI-failing accessibility mode", () => {
    const mainConfig = readFileSync(MAIN_CONFIG_PATH, "utf-8");
    const previewConfig = readFileSync(PREVIEW_CONFIG_PATH, "utf-8");

    expect(mainConfig).toContain('autodocs: "tag"');
    expect(previewConfig).toContain("a11y");
    expect(previewConfig).toContain('test: "error"');
  });

  it("defines a dark-first theme toolbar with light and dark modes", () => {
    const previewConfig = readFileSync(PREVIEW_CONFIG_PATH, "utf-8");

    expect(previewConfig).toContain("globalTypes");
    expect(previewConfig).toContain("theme");
    expect(previewConfig).toContain('defaultValue: "dark"');
    expect(previewConfig).toContain('value: "dark"');
    expect(previewConfig).toContain('value: "light"');
  });

  it("defines named viewport breakpoints for Storybook previews", () => {
    const previewConfig = readFileSync(PREVIEW_CONFIG_PATH, "utf-8");

    expect(previewConfig).toContain("viewport");
    expect(previewConfig).toContain('mobile: {');
    expect(previewConfig).toContain('name: "Mobile"');
    expect(previewConfig).toContain('tablet: {');
    expect(previewConfig).toContain('name: "Tablet"');
    expect(previewConfig).toContain('laptop: {');
    expect(previewConfig).toContain('name: "Laptop"');
    expect(previewConfig).toContain('desktop: {');
    expect(previewConfig).toContain('name: "Desktop"');
  });

  it("provides a reusable style guide page template and core docs pages", () => {
    const requiredFiles = [
      "GuidePage.tsx",
      "Brand.mdx",
      "Colour.mdx",
      "Typography.mdx",
      "Layout.mdx",
      "Accessibility.mdx",
      "Iconography.mdx",
      "Voice.mdx",
    ];

    for (const relativePath of requiredFiles) {
      expect(existsSync(resolve(STORY_DOCS_ROOT, relativePath))).toBe(true);
    }
  });

  it("uses token-driven light and dark theme selectors in the shared stylesheet", () => {
    const globalsCss = readFileSync(resolve(PACKAGE_ROOT, "src/globals.css"), "utf-8");

    expect(globalsCss).toContain('[data-theme="light"]');
    expect(globalsCss).toContain('[data-theme="dark"]');
    expect(globalsCss).toContain("--color-background");
    expect(globalsCss).toContain("--color-foreground");
  });
});
