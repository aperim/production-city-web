/**
 * Tests for content block Zod schema validation.
 */

import { describe, it, expect } from "vitest";
import { ContentBlockSchema, ContentBlocksSchema } from "../lib/content-blocks.js";

describe("ContentBlockSchema", () => {
  describe("header block", () => {
    it("accepts valid header", () => {
      const result = ContentBlockSchema.safeParse({ type: "header", level: 1, text: "Hello" });
      expect(result.success).toBe(true);
    });

    it("accepts levels 1, 2, 3", () => {
      for (const level of [1, 2, 3]) {
        const result = ContentBlockSchema.safeParse({ type: "header", level, text: "Hello" });
        expect(result.success).toBe(true);
      }
    });

    it("rejects level 4", () => {
      const result = ContentBlockSchema.safeParse({ type: "header", level: 4, text: "Hello" });
      expect(result.success).toBe(false);
    });

    it("rejects header with line breaks", () => {
      const result = ContentBlockSchema.safeParse({ type: "header", level: 1, text: "Hello\nWorld" });
      expect(result.success).toBe(false);
    });

    it("rejects header with carriage return", () => {
      const result = ContentBlockSchema.safeParse({ type: "header", level: 1, text: "Hello\rWorld" });
      expect(result.success).toBe(false);
    });
  });

  describe("text block", () => {
    it("accepts valid text", () => {
      const result = ContentBlockSchema.safeParse({ type: "text", content: "Hello world" });
      expect(result.success).toBe(true);
    });

    it("accepts markdown content", () => {
      const result = ContentBlockSchema.safeParse({ type: "text", content: "**bold** and _italic_" });
      expect(result.success).toBe(true);
    });
  });

  describe("image block", () => {
    it("accepts valid image", () => {
      const result = ContentBlockSchema.safeParse({
        type: "image",
        mediaAssetId: "clxyz123",
        alt: "A photo",
      });
      expect(result.success).toBe(true);
    });

    it("accepts image with caption", () => {
      const result = ContentBlockSchema.safeParse({
        type: "image",
        mediaAssetId: "clxyz123",
        alt: "A photo",
        caption: "Photo caption",
      });
      expect(result.success).toBe(true);
    });

    it("rejects alt over 200 chars", () => {
      const result = ContentBlockSchema.safeParse({
        type: "image",
        mediaAssetId: "clxyz123",
        alt: "a".repeat(201),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("image_text_left block", () => {
    it("accepts valid image_text_left", () => {
      const result = ContentBlockSchema.safeParse({
        type: "image_text_left",
        mediaAssetId: "clxyz123",
        alt: "Photo",
        text: "Description",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("image_text_right block", () => {
    it("accepts valid image_text_right", () => {
      const result = ContentBlockSchema.safeParse({
        type: "image_text_right",
        mediaAssetId: "clxyz123",
        alt: "Photo",
        text: "Description",
      });
      expect(result.success).toBe(true);
    });
  });

  describe("spacer block", () => {
    it("accepts valid sizes", () => {
      for (const size of ["sm", "md", "lg"]) {
        const result = ContentBlockSchema.safeParse({ type: "spacer", size });
        expect(result.success).toBe(true);
      }
    });

    it("rejects invalid size", () => {
      const result = ContentBlockSchema.safeParse({ type: "spacer", size: "xl" });
      expect(result.success).toBe(false);
    });
  });

  describe("XSS prevention", () => {
    it("rejects script tags in text", () => {
      const result = ContentBlockSchema.safeParse({ type: "text", content: '<script>alert("xss")</script>' });
      expect(result.success).toBe(false);
    });

    it("rejects iframe tags", () => {
      const result = ContentBlockSchema.safeParse({ type: "text", content: '<iframe src="evil.com"></iframe>' });
      expect(result.success).toBe(false);
    });

    it("rejects javascript: URIs", () => {
      const result = ContentBlockSchema.safeParse({ type: "text", content: 'Click [here](javascript:alert(1))' });
      expect(result.success).toBe(false);
    });

    it("rejects event handlers", () => {
      const result = ContentBlockSchema.safeParse({ type: "text", content: '<div onclick="alert(1)">click</div>' });
      expect(result.success).toBe(false);
    });

    it("rejects script tags in headers", () => {
      const result = ContentBlockSchema.safeParse({ type: "header", level: 1, text: '<script>xss</script>' });
      expect(result.success).toBe(false);
    });

    it("rejects onerror handler in text", () => {
      const result = ContentBlockSchema.safeParse({ type: "text", content: '<img onerror="alert(1)">' });
      expect(result.success).toBe(false);
    });

    it("accepts safe HTML-like content", () => {
      const result = ContentBlockSchema.safeParse({ type: "text", content: "Use <em> for emphasis" });
      expect(result.success).toBe(true);
    });
  });

  describe("unknown type", () => {
    it("rejects unknown block type", () => {
      const result = ContentBlockSchema.safeParse({ type: "video", src: "url" });
      expect(result.success).toBe(false);
    });
  });
});

describe("ContentBlocksSchema", () => {
  it("accepts array of valid blocks", () => {
    const result = ContentBlocksSchema.safeParse([
      { type: "header", level: 1, text: "Title" },
      { type: "text", content: "Body text" },
      { type: "spacer", size: "md" },
    ]);
    expect(result.success).toBe(true);
  });

  it("rejects empty array", () => {
    const result = ContentBlocksSchema.safeParse([]);
    expect(result.success).toBe(false);
  });

  it("rejects if any block is invalid", () => {
    const result = ContentBlocksSchema.safeParse([
      { type: "header", level: 1, text: "Title" },
      { type: "text", content: '<script>xss</script>' },
    ]);
    expect(result.success).toBe(false);
  });
});
