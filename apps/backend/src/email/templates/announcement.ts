/**
 * Announcement email template.
 * Renders HTML table-based layout matching web content blocks.
 * All user-supplied content is HTML-escaped or sanitized.
 */

import { escapeHtml } from "./magic-link.js";

/** Content block types from the announcement schema. */
export interface ContentBlock {
  type: "header" | "text" | "image" | "image_text_left" | "image_text_right" | "spacer";
  level?: 1 | 2 | 3;
  text?: string;
  content?: string;
  mediaAssetId?: string;
  alt?: string;
  size?: "sm" | "md" | "lg";
  url?: string;
}

export interface AnnouncementEmailParams {
  title: string;
  summary: string;
  contentBlocks: ContentBlock[];
  categories: string[];
  announcementUrl: string;
  unsubscribeUrl: string;
  /** Resolved media asset URLs by ID */
  mediaUrls: Record<string, string>;
}

/** Strip CRLF characters to prevent email header injection. */
export function stripCRLF(str: string): string {
  return str.replace(/[\r\n]/g, "");
}

/** Spacer heights by size. */
const SPACER_HEIGHTS: Record<string, number> = { sm: 16, md: 32, lg: 48 };

/**
 * Simple markdown to HTML conversion for email.
 * Supports: bold, italic, links, lists, paragraphs.
 * Strips raw HTML. Rejects javascript: URIs and on* handlers.
 */
export function markdownToEmailHtml(md: string): string {
  // Strip raw HTML tags (anything that looks like <tag...> or </tag>)
  let text = md.replace(/<\/?[^>]+(>|$)/g, "");

  // Escape remaining HTML entities
  text = escapeHtml(text);

  // Convert markdown syntax (order matters)
  // Bold: **text** or __text__
  text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  text = text.replace(/__(.+?)__/g, "<strong>$1</strong>");

  // Italic: *text* or _text_
  text = text.replace(/\*(.+?)\*/g, "<em>$1</em>");
  text = text.replace(/_(.+?)_/g, "<em>$1</em>");

  // Links: [text](url) — only allow https:
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, linkText, url) => {
    const trimmedUrl = url.trim();
    // Only allow https: URLs
    if (!trimmedUrl.startsWith("https://")) {
      return linkText;
    }
    // Reject on* handlers and javascript:
    if (/^javascript:/i.test(trimmedUrl) || /\bon\w+=/i.test(trimmedUrl)) {
      return linkText;
    }
    return `<a href="${escapeHtml(trimmedUrl)}" style="color:#2563eb;text-decoration:underline;">${linkText}</a>`;
  });

  // Unordered lists: lines starting with - or *
  text = text.replace(/^[\-\*]\s+(.+)$/gm, "<li>$1</li>");
  text = text.replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul style="margin:8px 0;padding-left:24px;">${match}</ul>`);

  // Ordered lists: lines starting with 1. 2. etc.
  text = text.replace(/^\d+\.\s+(.+)$/gm, "<li>$1</li>");

  // Paragraphs: double newline separates paragraphs
  const paragraphs = text.split(/\n\n+/).filter(Boolean);
  text = paragraphs
    .map((p) => {
      const trimmed = p.trim();
      if (trimmed.startsWith("<ul") || trimmed.startsWith("<li")) return trimmed;
      return `<p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#374151;">${trimmed.replace(/\n/g, "<br>")}</p>`;
    })
    .join("");

  return text;
}

/** Render a single content block to email HTML. */
function renderContentBlock(block: ContentBlock, mediaUrls: Record<string, string>): string {
  switch (block.type) {
    case "header": {
      const level = block.level ?? 1;
      const sizes: Record<number, string> = { 1: "24px", 2: "20px", 3: "16px" };
      const fontSize = sizes[level] ?? "24px";
      return `<tr><td style="padding:0 0 16px;">
        <h${level} style="margin:0;font-size:${fontSize};font-weight:600;color:#111827;">${escapeHtml(block.text ?? "")}</h${level}>
      </td></tr>`;
    }

    case "text": {
      const html = markdownToEmailHtml(block.content ?? "");
      return `<tr><td style="padding:0 0 16px;">${html}</td></tr>`;
    }

    case "image": {
      const url = block.mediaAssetId ? mediaUrls[block.mediaAssetId] : block.url;
      if (!url) return ""; // Skip if no URL
      const alt = escapeHtml(block.alt ?? "");
      return `<tr><td style="padding:0 0 16px;" align="center">
        <img src="${escapeHtml(url)}" alt="${alt}" style="max-width:600px;width:100%;height:auto;display:block;border-radius:4px;" />
      </td></tr>`;
    }

    case "image_text_left":
    case "image_text_right": {
      const url = block.mediaAssetId ? mediaUrls[block.mediaAssetId] : block.url;
      if (!url) return "";
      const alt = escapeHtml(block.alt ?? "");
      const textHtml = markdownToEmailHtml(block.text ?? "");
      const imgCell = `<td style="width:40%;vertical-align:top;padding:8px;">
        <img src="${escapeHtml(url)}" alt="${alt}" style="max-width:100%;height:auto;display:block;border-radius:4px;" />
      </td>`;
      const textCell = `<td style="width:60%;vertical-align:top;padding:8px;">${textHtml}</td>`;

      const cells = block.type === "image_text_left" ? imgCell + textCell : textCell + imgCell;
      return `<tr><td style="padding:0 0 16px;">
        <table width="100%" cellpadding="0" cellspacing="0"><tr>${cells}</tr></table>
      </td></tr>`;
    }

    case "spacer": {
      const height = SPACER_HEIGHTS[block.size ?? "md"] ?? 32;
      return `<tr><td style="height:${height}px;"></td></tr>`;
    }

    default:
      return "";
  }
}

/** Render the full announcement email HTML. */
export function renderAnnouncementHtml(params: AnnouncementEmailParams): string {
  const safeTitle = escapeHtml(params.title);
  const categoryBadges = params.categories
    .map((c) => `<span style="display:inline-block;padding:2px 8px;margin:0 4px 4px 0;font-size:12px;background-color:#e5e7eb;border-radius:4px;color:#374151;">${escapeHtml(c)}</span>`)
    .join("");

  const contentHtml = params.contentBlocks
    .map((block) => renderContentBlock(block, params.mediaUrls))
    .join("");

  const safeAnnouncementUrl = escapeHtml(params.announcementUrl);
  const safeUnsubscribeUrl = escapeHtml(params.unsubscribeUrl);
  const categoriesList = params.categories.map((c) => escapeHtml(c)).join(", ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${safeTitle}</title>
</head>
<body style="margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background-color:#f4f4f5;color:#18181b;">
<table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:40px 20px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:8px;border:1px solid #e4e4e7;">

<!-- Logo Header -->
<tr><td style="padding:24px 32px;border-bottom:1px solid #e4e4e7;">
  <strong style="font-size:16px;color:#111827;">Production City</strong>
</td></tr>

<!-- Title & Categories -->
<tr><td style="padding:32px 32px 16px;">
  <h1 style="margin:0 0 12px;font-size:24px;font-weight:700;color:#111827;">${safeTitle}</h1>
  <div style="margin:0 0 16px;">${categoryBadges}</div>
</td></tr>

<!-- Content Blocks -->
<tr><td style="padding:0 32px;">
<table width="100%" cellpadding="0" cellspacing="0">
${contentHtml}
</table>
</td></tr>

<!-- Read More -->
<tr><td style="padding:16px 32px;">
  <table cellpadding="0" cellspacing="0">
  <tr><td style="border-radius:6px;background-color:#111827;">
    <a href="${safeAnnouncementUrl}" style="display:inline-block;padding:12px 24px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:6px;">Read More</a>
  </td></tr>
  </table>
</td></tr>

<!-- Footer -->
<tr><td style="padding:24px 32px;border-top:1px solid #e4e4e7;font-size:12px;color:#9ca3af;line-height:1.6;">
  You received this because you are subscribed to ${categoriesList}.<br>
  <a href="${safeUnsubscribeUrl}" style="color:#6b7280;text-decoration:underline;">Unsubscribe</a>
</td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

/** Render plain-text version of the announcement. */
export function renderAnnouncementText(params: AnnouncementEmailParams): string {
  const lines: string[] = [];
  lines.push(params.title);
  lines.push("=".repeat(Math.min(params.title.length, 60)));
  lines.push("");
  lines.push(`Categories: ${params.categories.join(", ")}`);
  lines.push("");
  lines.push(params.summary);
  lines.push("");
  lines.push(`Read more: ${params.announcementUrl}`);
  lines.push("");
  lines.push("---");
  lines.push(`You received this because you are subscribed to ${params.categories.join(", ")}.`);
  lines.push(`Unsubscribe: ${params.unsubscribeUrl}`);
  return lines.join("\n");
}
