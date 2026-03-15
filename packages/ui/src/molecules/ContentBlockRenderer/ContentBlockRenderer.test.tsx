import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  ContentBlockRenderer,
  sanitiseText,
  markdownToSafeHtml,
} from "./ContentBlockRenderer";
import type {
  HeaderBlock,
  TextBlock,
  ImageBlock,
  ImageTextLeftBlock,
  ImageTextRightBlock,
  SpacerBlock,
} from "../../types/announcements";

// ---------------------------------------------------------------------------
// sanitiseText unit tests
// ---------------------------------------------------------------------------
describe("sanitiseText", () => {
  it("strips HTML tags", () => {
    expect(sanitiseText("<script>alert('xss')</script>")).not.toContain(
      "<script>",
    );
  });

  it("strips javascript: URIs", () => {
    expect(sanitiseText("javascript:alert(1)")).not.toContain("javascript:");
  });

  it("strips event handlers", () => {
    expect(sanitiseText('onerror=alert(1)')).not.toContain("onerror=");
  });

  it("strips HTML tags completely", () => {
    const result = sanitiseText("<b>bold</b>");
    expect(result).not.toContain("<b>");
    expect(result).toContain("bold");
  });

  it("escapes ampersands and quotes", () => {
    const result = sanitiseText('Hello & "world"');
    expect(result).toContain("&amp;");
    expect(result).toContain("&quot;");
  });

  it("preserves normal text", () => {
    expect(sanitiseText("Hello World")).toContain("Hello World");
  });
});

// ---------------------------------------------------------------------------
// markdownToSafeHtml unit tests
// ---------------------------------------------------------------------------
describe("markdownToSafeHtml", () => {
  it("converts bold markdown", () => {
    expect(markdownToSafeHtml("**bold**")).toContain("<strong>bold</strong>");
  });

  it("converts italic markdown", () => {
    expect(markdownToSafeHtml("*italic*")).toContain("<em>italic</em>");
  });

  it("converts links with https", () => {
    const result = markdownToSafeHtml("[Link](https://example.com)");
    expect(result).toContain('href="https://example.com/');
    expect(result).toContain("noopener noreferrer");
  });

  it("rejects javascript: links", () => {
    const result = markdownToSafeHtml(
      "[evil](javascript:alert(1))",
    );
    expect(result).not.toContain("javascript:");
  });

  it("escapes quotes in URLs to prevent attribute injection", () => {
    const result = markdownToSafeHtml(
      '[click](https://example.com/path"onmouseover="alert(1))',
    );
    expect(result).not.toContain('onmouseover');
  });

  it("rejects invalid URLs", () => {
    const result = markdownToSafeHtml("[click](not-a-url)");
    expect(result).not.toContain("href");
    expect(result).toContain("click");
  });

  it("strips raw HTML from markdown", () => {
    const result = markdownToSafeHtml(
      '<img src=x onerror=alert(1)> **safe**',
    );
    expect(result).not.toContain("<img");
    expect(result).toContain("<strong>safe</strong>");
  });

  it("wraps paragraphs", () => {
    const result = markdownToSafeHtml("Para one\n\nPara two");
    expect(result).toContain("<p>Para one</p>");
    expect(result).toContain("<p>Para two</p>");
  });
});

// ---------------------------------------------------------------------------
// Web mode rendering
// ---------------------------------------------------------------------------
describe("ContentBlockRenderer (web)", () => {
  it("renders h1 header", () => {
    const block: HeaderBlock = {
      id: "1",
      position: 0,
      type: "header",
      level: "h1",
      text: "Main Title",
    };
    render(<ContentBlockRenderer block={block} />);
    expect(screen.getByText("Main Title").tagName).toBe("H1");
  });

  it("renders h2 header", () => {
    const block: HeaderBlock = {
      id: "1",
      position: 0,
      type: "header",
      level: "h2",
      text: "Section Title",
    };
    render(<ContentBlockRenderer block={block} />);
    expect(screen.getByText("Section Title").tagName).toBe("H2");
  });

  it("renders h3 header", () => {
    const block: HeaderBlock = {
      id: "1",
      position: 0,
      type: "header",
      level: "h3",
      text: "Subsection",
    };
    render(<ContentBlockRenderer block={block} />);
    expect(screen.getByText("Subsection").tagName).toBe("H3");
  });

  it("renders text block with markdown", () => {
    const block: TextBlock = {
      id: "1",
      position: 0,
      type: "text",
      markdown: "Hello **world**",
    };
    const { container } = render(<ContentBlockRenderer block={block} />);
    expect(container.querySelector("strong")?.textContent).toBe("world");
  });

  it("sanitises XSS in text block", () => {
    const block: TextBlock = {
      id: "1",
      position: 0,
      type: "text",
      markdown: '<script>alert("xss")</script> safe text',
    };
    const { container } = render(<ContentBlockRenderer block={block} />);
    expect(container.innerHTML).not.toContain("<script>");
    expect(container.textContent).toContain("safe text");
  });

  it("renders image block", () => {
    const block: ImageBlock = {
      id: "1",
      position: 0,
      type: "image",
      src: "https://example.com/img.jpg",
      alt: "Test image",
    };
    render(<ContentBlockRenderer block={block} />);
    const img = screen.getByAltText("Test image");
    expect(img).toHaveAttribute("src", "https://example.com/img.jpg");
  });

  it("renders image with caption", () => {
    const block: ImageBlock = {
      id: "1",
      position: 0,
      type: "image",
      src: "https://example.com/img.jpg",
      alt: "Test image",
      caption: "A test caption",
    };
    render(<ContentBlockRenderer block={block} />);
    expect(screen.getByText("A test caption")).toBeInTheDocument();
  });

  it("renders image_text_left block", () => {
    const block: ImageTextLeftBlock = {
      id: "1",
      position: 0,
      type: "image_text_left",
      src: "https://example.com/img.jpg",
      alt: "Side image",
      markdown: "Text on **left**",
    };
    const { container } = render(<ContentBlockRenderer block={block} />);
    expect(container.querySelector("strong")?.textContent).toBe("left");
    expect(screen.getByAltText("Side image")).toBeInTheDocument();
  });

  it("renders image_text_right block", () => {
    const block: ImageTextRightBlock = {
      id: "1",
      position: 0,
      type: "image_text_right",
      src: "https://example.com/img.jpg",
      alt: "Side image",
      markdown: "Text on **right**",
    };
    const { container } = render(<ContentBlockRenderer block={block} />);
    expect(container.querySelector("strong")?.textContent).toBe("right");
  });

  it("renders spacer sm", () => {
    const block: SpacerBlock = {
      id: "1",
      position: 0,
      type: "spacer",
      size: "sm",
    };
    const { container } = render(<ContentBlockRenderer block={block} />);
    const spacer = container.querySelector("[aria-hidden='true']");
    expect(spacer?.className).toContain("h-4");
  });

  it("renders spacer md", () => {
    const block: SpacerBlock = {
      id: "1",
      position: 0,
      type: "spacer",
      size: "md",
    };
    const { container } = render(<ContentBlockRenderer block={block} />);
    const spacer = container.querySelector("[aria-hidden='true']");
    expect(spacer?.className).toContain("h-8");
  });

  it("renders spacer lg", () => {
    const block: SpacerBlock = {
      id: "1",
      position: 0,
      type: "spacer",
      size: "lg",
    };
    const { container } = render(<ContentBlockRenderer block={block} />);
    const spacer = container.querySelector("[aria-hidden='true']");
    expect(spacer?.className).toContain("h-16");
  });
});

// ---------------------------------------------------------------------------
// Email mode rendering
// ---------------------------------------------------------------------------
describe("ContentBlockRenderer (email)", () => {
  it("renders header in email mode using table layout", () => {
    const block: HeaderBlock = {
      id: "1",
      position: 0,
      type: "header",
      level: "h1",
      text: "Email Title",
    };
    const { container } = render(
      <ContentBlockRenderer block={block} mode="email" />,
    );
    expect(container.querySelector("table")).toBeInTheDocument();
    expect(container.textContent).toContain("Email Title");
  });

  it("renders text in email mode using table layout", () => {
    const block: TextBlock = {
      id: "1",
      position: 0,
      type: "text",
      markdown: "Email **content**",
    };
    const { container } = render(
      <ContentBlockRenderer block={block} mode="email" />,
    );
    expect(container.querySelector("table")).toBeInTheDocument();
    expect(container.querySelector("strong")?.textContent).toBe("content");
  });

  it("renders image in email mode", () => {
    const block: ImageBlock = {
      id: "1",
      position: 0,
      type: "image",
      src: "https://example.com/img.jpg",
      alt: "Email image",
      caption: "Caption",
    };
    render(<ContentBlockRenderer block={block} mode="email" />);
    expect(screen.getByAltText("Email image")).toBeInTheDocument();
    expect(screen.getByText("Caption")).toBeInTheDocument();
  });

  it("renders image_text_left in email mode with table cells", () => {
    const block: ImageTextLeftBlock = {
      id: "1",
      position: 0,
      type: "image_text_left",
      src: "https://example.com/img.jpg",
      alt: "Left image",
      markdown: "Left text",
    };
    const { container } = render(
      <ContentBlockRenderer block={block} mode="email" />,
    );
    const tds = container.querySelectorAll("td");
    expect(tds.length).toBeGreaterThanOrEqual(2);
  });

  it("renders spacer in email mode", () => {
    const block: SpacerBlock = {
      id: "1",
      position: 0,
      type: "spacer",
      size: "lg",
    };
    const { container } = render(
      <ContentBlockRenderer block={block} mode="email" />,
    );
    expect(container.querySelector("table")).toBeInTheDocument();
  });

  it("sanitises XSS in email mode", () => {
    const block: TextBlock = {
      id: "1",
      position: 0,
      type: "text",
      markdown: '<script>alert("xss")</script>',
    };
    const { container } = render(
      <ContentBlockRenderer block={block} mode="email" />,
    );
    expect(container.innerHTML).not.toContain("<script>");
  });
});
