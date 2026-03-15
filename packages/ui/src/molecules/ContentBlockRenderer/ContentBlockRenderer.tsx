"use client";

import type { HTMLAttributes, ReactElement } from "react";
import { cn } from "../../lib/utils";
import type { ContentBlock } from "../../types/announcements";

/** Props for the ContentBlockRenderer molecule. */
export interface ContentBlockRendererProps
  extends HTMLAttributes<HTMLDivElement> {
  /** The content block to render. */
  block: ContentBlock;
  /** Rendering mode — web uses Tailwind classes, email uses inline styles. */
  mode?: "web" | "email";
}

/**
 * Sanitise text to prevent XSS.
 *
 * Strips HTML tags, removes javascript: URIs, and escapes entities.
 * For markdown text blocks, this is the baseline sanitiser —
 * no raw HTML is allowed through.
 */
function sanitiseText(input: string): string {
  return input
    .replace(/<[^>]*>/g, "") // strip HTML tags
    .replace(/javascript\s*:/gi, "") // strip javascript: URIs
    .replace(/on\w+\s*=/gi, "") // strip event handlers
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;");
}

/**
 * Convert simple markdown to safe HTML.
 *
 * Supports: **bold**, *italic*, [links](url), paragraphs.
 * All HTML in the source is stripped before processing.
 *
 * SECURITY NOTE: This function intentionally strips ALL raw HTML from the
 * input before processing markdown syntax. The output is safe for use with
 * React's dangerouslySetInnerHTML because:
 * 1. All HTML tags are removed from the source
 * 2. javascript: URIs are stripped
 * 3. Event handler attributes (on*) are stripped
 * 4. Only https?:// links are converted to anchor tags
 * 5. URLs are validated with the URL constructor and quotes are escaped
 * 6. Output only contains <p>, <strong>, <em>, <a>, <br /> tags
 */
function markdownToSafeHtml(markdown: string): string {
  const stripped = markdown
    .replace(/<[^>]*>/g, "")
    .replace(/javascript\s*:/gi, "")
    .replace(/on\w+\s*=/gi, "");

  const lines = stripped.split("\n\n");
  return lines
    .map((para) => {
      const html = para
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>")
        .replace(
          /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
          (_match, text: string, url: string) => {
            try {
              const parsed = new URL(url);
              if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
                return text;
              }
              const safeUrl = parsed
                .toString()
                .replace(/&/g, "&amp;")
                .replace(/"/g, "&quot;");
              return `<a href="${safeUrl}" rel="noopener noreferrer">${text}</a>`;
            } catch {
              return text;
            }
          },
        )
        .replace(/\n/g, "<br />");
      return `<p>${html}</p>`;
    })
    .join("");
}

/**
 * Renders a single content block.
 *
 * Security: All user-generated text is sanitised. Markdown is converted to a
 * strict subset of HTML. No raw HTML or javascript: URIs pass through.
 */
function ContentBlockRenderer({
  block,
  mode = "web",
  className,
  ...props
}: ContentBlockRendererProps) {
  if (mode === "email") {
    return (
      <div className={className} {...props}>
        {renderEmailBlock(block)}
      </div>
    );
  }

  return (
    <div className={cn("w-full", className)} {...props}>
      {renderWebBlock(block)}
    </div>
  );
}

function renderWebBlock(block: ContentBlock): ReactElement {
  switch (block.type) {
    case "header": {
      const Tag = block.level;
      const sizeClass =
        block.level === "h1"
          ? "text-2xl font-bold"
          : block.level === "h2"
            ? "text-xl font-semibold"
            : "text-lg font-semibold";
      return (
        <Tag className={cn(sizeClass, "text-foreground")}>
          {sanitiseText(block.text)}
        </Tag>
      );
    }

    case "text": {
      // SECURITY: markdownToSafeHtml strips all raw HTML, event handlers,
      // and javascript: URIs. Output only contains safe tags.
      const safeHtml = markdownToSafeHtml(block.markdown);
      return (
        <div
          className="prose prose-sm text-foreground max-w-none"
dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
      );
    }

    case "image":
      return (
        <figure>
          <img
            src={block.src}
            alt={sanitiseText(block.alt)}
            className="w-full rounded-lg"
            loading="lazy"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = "none";
              const fallback = target.nextElementSibling;
              if (fallback instanceof HTMLElement) {
                fallback.style.display = "flex";
              }
            }}
          />
          <div
            className="hidden items-center justify-center rounded-lg bg-muted p-8 text-sm text-muted-foreground"
            role="img"
            aria-label={sanitiseText(block.alt)}
          >
            Image not available
          </div>
          {block.caption && (
            <figcaption className="mt-2 text-center text-xs text-muted-foreground">
              {sanitiseText(block.caption)}
            </figcaption>
          )}
        </figure>
      );

    case "image_text_left":
    case "image_text_right": {
      const isLeft = block.type === "image_text_left";
      const safeHtml = markdownToSafeHtml(block.markdown);
      return (
        <div className="flex flex-col gap-4 md:flex-row md:items-start">
          {isLeft && (
            <div
              className="prose prose-sm text-foreground max-w-none md:w-1/2"
              dangerouslySetInnerHTML={{ __html: safeHtml }}
            />
          )}
          <img
            src={block.src}
            alt={sanitiseText(block.alt)}
            className="w-full rounded-lg md:w-1/2"
            loading="lazy"
          />
          {!isLeft && (
            <div
              className="prose prose-sm text-foreground max-w-none md:w-1/2"
              dangerouslySetInnerHTML={{ __html: safeHtml }}
            />
          )}
        </div>
      );
    }

    case "spacer": {
      const height =
        block.size === "sm" ? "h-4" : block.size === "md" ? "h-8" : "h-16";
      return <div className={height} aria-hidden="true" />;
    }
  }
}

function renderEmailBlock(block: ContentBlock): ReactElement {
  switch (block.type) {
    case "header": {
      const fontSize =
        block.level === "h1" ? "24px" : block.level === "h2" ? "20px" : "16px";
      return (
        <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
          <tbody>
            <tr>
              <td
                style={{
                  fontSize,
                  fontWeight: "bold",
                  color: "#e5e5e5",
                  padding: "8px 0",
                  fontFamily: "Inter, system-ui, sans-serif",
                }}
              >
                {sanitiseText(block.text)}
              </td>
            </tr>
          </tbody>
        </table>
      );
    }

    case "text": {
      const safeHtml = markdownToSafeHtml(block.markdown);
      return (
        <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
          <tbody>
            <tr>
              <td
                style={{
                  fontSize: "14px",
                  lineHeight: "1.5",
                  color: "#d4d4d4",
                  padding: "4px 0",
                  fontFamily: "Inter, system-ui, sans-serif",
                }}
                  dangerouslySetInnerHTML={{ __html: safeHtml }}
              />
            </tr>
          </tbody>
        </table>
      );
    }

    case "image":
      return (
        <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
          <tbody>
            <tr>
              <td style={{ padding: "8px 0" }} align="center">
                <img
                  src={block.src}
                  alt={sanitiseText(block.alt)}
                  style={{ maxWidth: "100%", borderRadius: "8px", display: "block" }}
                />
                {block.caption && (
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#a3a3a3",
                      textAlign: "center",
                      margin: "8px 0 0",
                    }}
                  >
                    {sanitiseText(block.caption)}
                  </p>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      );

    case "image_text_left":
    case "image_text_right": {
      const isLeft = block.type === "image_text_left";
      const safeHtml = markdownToSafeHtml(block.markdown);
      const textCell = (
        <td
          width="50%"
          style={{
            fontSize: "14px",
            lineHeight: "1.5",
            color: "#d4d4d4",
            padding: "8px",
            verticalAlign: "top",
            fontFamily: "Inter, system-ui, sans-serif",
          }}
          dangerouslySetInnerHTML={{ __html: safeHtml }}
        />
      );
      const imageCell = (
        <td width="50%" style={{ padding: "8px", verticalAlign: "top" }}>
          <img
            src={block.src}
            alt={sanitiseText(block.alt)}
            style={{ maxWidth: "100%", borderRadius: "8px", display: "block" }}
          />
        </td>
      );
      return (
        <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
          <tbody>
            <tr>
              {isLeft ? (
                <>
                  {textCell}
                  {imageCell}
                </>
              ) : (
                <>
                  {imageCell}
                  {textCell}
                </>
              )}
            </tr>
          </tbody>
        </table>
      );
    }

    case "spacer": {
      const height =
        block.size === "sm" ? "16px" : block.size === "md" ? "32px" : "64px";
      return (
        <table width="100%" cellPadding={0} cellSpacing={0} role="presentation">
          <tbody>
            <tr>
              <td style={{ height, lineHeight: height }}>&nbsp;</td>
            </tr>
          </tbody>
        </table>
      );
    }
  }
}

export { ContentBlockRenderer, sanitiseText, markdownToSafeHtml };
