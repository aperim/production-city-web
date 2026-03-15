/**
 * Content block Zod schema for announcement structured content.
 * Validates on write. Stored as JSON string in contentBlocks column.
 */

import { z } from "@hono/zod-openapi";

/** Dangerous patterns to reject in text content */
const SCRIPT_TAG = /<script[\s>]/i;
const IFRAME_TAG = /<iframe[\s>]/i;
const JS_URI = /javascript:/i;
const EVENT_HANDLER = /\bon\w+\s*=/i;

/** Validates text is free of XSS vectors */
function isSafeText(text: string): boolean {
  return (
    !SCRIPT_TAG.test(text) &&
    !IFRAME_TAG.test(text) &&
    !JS_URI.test(text) &&
    !EVENT_HANDLER.test(text)
  );
}

const safeText = z.string().refine(isSafeText, {
  message: "Text contains disallowed HTML or script content",
});

const HeaderBlock = z.object({
  type: z.literal("header"),
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  text: safeText
    .refine((t) => !t.includes("\r") && !t.includes("\n"), {
      message: "Header text must not contain line breaks",
    })
    .pipe(z.string().max(500)),
});

const TextBlock = z.object({
  type: z.literal("text"),
  content: safeText.pipe(z.string().max(10000)),
});

const ImageBlock = z.object({
  type: z.literal("image"),
  mediaAssetId: z.string().min(1),
  alt: z.string().max(200),
  caption: z.string().max(200).optional(),
});

const ImageTextLeftBlock = z.object({
  type: z.literal("image_text_left"),
  mediaAssetId: z.string().min(1),
  alt: z.string().max(200),
  text: safeText.pipe(z.string().max(10000)),
});

const ImageTextRightBlock = z.object({
  type: z.literal("image_text_right"),
  mediaAssetId: z.string().min(1),
  alt: z.string().max(200),
  text: safeText.pipe(z.string().max(10000)),
});

const SpacerBlock = z.object({
  type: z.literal("spacer"),
  size: z.enum(["sm", "md", "lg"]),
});

/** A single content block (discriminated union) */
export const ContentBlockSchema = z.discriminatedUnion("type", [
  HeaderBlock,
  TextBlock,
  ImageBlock,
  ImageTextLeftBlock,
  ImageTextRightBlock,
  SpacerBlock,
]);

/** Array of content blocks */
export const ContentBlocksSchema = z.array(ContentBlockSchema).min(1);

export type ContentBlock = z.infer<typeof ContentBlockSchema>;
export type ContentBlocks = z.infer<typeof ContentBlocksSchema>;
