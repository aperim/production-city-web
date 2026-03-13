import { render, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it } from "vitest";
import { Link, sanitizeHref } from "./Link";

describe("sanitizeHref", () => {
  it("allows https URLs", () => {
    expect(sanitizeHref("https://example.com")).toBe("https://example.com");
  });

  it("allows http URLs", () => {
    expect(sanitizeHref("http://example.com")).toBe("http://example.com");
  });

  it("allows mailto URLs", () => {
    expect(sanitizeHref("mailto:user@example.com")).toBe("mailto:user@example.com");
  });

  it("allows tel URLs", () => {
    expect(sanitizeHref("tel:+1234567890")).toBe("tel:+1234567890");
  });

  it("allows relative URLs starting with /", () => {
    expect(sanitizeHref("/about")).toBe("/about");
  });

  it("allows hash links", () => {
    expect(sanitizeHref("#section")).toBe("#section");
  });

  it("blocks javascript: scheme", () => {
    expect(sanitizeHref("javascript:alert(1)")).toBe("#");
  });

  it("blocks data: scheme", () => {
    expect(sanitizeHref("data:text/html,<h1>XSS</h1>")).toBe("#");
  });

  it("blocks vbscript: scheme", () => {
    expect(sanitizeHref("vbscript:msgbox(1)")).toBe("#");
  });

  it("blocks javascript: with leading spaces", () => {
    expect(sanitizeHref("  javascript:alert(1)")).toBe("#");
  });

  it("returns # for undefined href", () => {
    expect(sanitizeHref(undefined)).toBe("#");
  });

  it("blocks protocol-relative URLs (//evil.example)", () => {
    expect(sanitizeHref("//evil.example.com")).toBe("#");
  });

  it("blocks protocol-relative URLs with encoded chars", () => {
    expect(sanitizeHref("//evil.example.com/steal?cookie=x")).toBe("#");
  });
});

describe("Link", () => {
  it("renders with text", () => {
    render(<Link href="https://example.com">Click here</Link>);
    expect(screen.getByRole("link", { name: "Click here" })).toBeInTheDocument();
  });

  it("renders with safe href", () => {
    render(<Link href="https://example.com">Link</Link>);
    expect(screen.getByRole("link")).toHaveAttribute("href", "https://example.com");
  });

  it("blocks javascript: href and replaces with #", () => {
    render(<Link href="javascript:alert(1)">Dangerous</Link>);
    expect(screen.getByRole("link")).toHaveAttribute("href", "#");
  });

  it("blocks data: href and replaces with #", () => {
    render(<Link href="data:text/html,<h1>XSS</h1>">Data link</Link>);
    expect(screen.getByRole("link")).toHaveAttribute("href", "#");
  });

  it("applies rel='noopener noreferrer' for external variant", () => {
    render(<Link href="https://example.com" variant="external">External</Link>);
    expect(screen.getByRole("link")).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("applies rel='noopener noreferrer' when external=true", () => {
    render(<Link href="https://example.com" external>External</Link>);
    expect(screen.getByRole("link")).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("cannot override noopener noreferrer for external links", () => {
    render(<Link href="https://example.com" external rel="noreferrer">Link</Link>);
    // rel must still include noopener for external links
    const rel = screen.getByRole("link").getAttribute("rel");
    expect(rel).toContain("noopener");
    expect(rel).toContain("noreferrer");
  });

  it("opens in new tab for external variant", () => {
    render(<Link href="https://example.com" variant="external">Link</Link>);
    expect(screen.getByRole("link")).toHaveAttribute("target", "_blank");
  });

  it("forwards ref to anchor element", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(<Link href="/about" ref={ref}>About</Link>);
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  });

  it("renders children as ReactNode", () => {
    render(
      <Link href="/about">
        <span data-testid="child">Go to About</span>
      </Link>,
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });
});
