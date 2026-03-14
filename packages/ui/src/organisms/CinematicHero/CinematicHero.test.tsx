import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CinematicHero, isSafeHref } from "./CinematicHero";

const defaultProps = {
  imageSrc: "/media/home-hero/dark.jpg",
  imageAlt: "Cinematic studio interior",
  title: "Production City",
};

describe("CinematicHero", () => {
  it("renders full-viewport height (100dvh by default)", () => {
    const { container } = render(<CinematicHero {...defaultProps} />);
    const section = container.firstElementChild as HTMLElement;
    expect(section.style.height || section.className).toMatch(/dvh|100dvh/);
  });

  it("renders image as semantic <img>, NOT CSS background (Finding #3)", () => {
    render(<CinematicHero {...defaultProps} />);
    const img = screen.getByRole("img", { name: "Cinematic studio interior" });
    expect(img).toBeInTheDocument();
    expect(img.tagName).toBe("IMG");
  });

  it("image has correct alt text", () => {
    render(<CinematicHero {...defaultProps} />);
    const img = screen.getByRole("img", { name: "Cinematic studio interior" });
    expect(img).toHaveAttribute("alt", "Cinematic studio interior");
  });

  it("renders title as h1", () => {
    render(<CinematicHero {...defaultProps} />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("Production City");
  });

  it("renders CTAs with correct hrefs", () => {
    render(
      <CinematicHero
        {...defaultProps}
        ctas={[
          { label: "Get Started", href: "/start", variant: "primary" },
          { label: "Learn More", href: "/about", variant: "secondary" },
        ]}
      />,
    );
    const link1 = screen.getByRole("link", { name: "Get Started" });
    const link2 = screen.getByRole("link", { name: "Learn More" });
    expect(link1).toHaveAttribute("href", "/start");
    expect(link2).toHaveAttribute("href", "/about");
  });

  it("applies overlay class", () => {
    const { container } = render(
      <CinematicHero {...defaultProps} overlay="dark" />,
    );
    const overlay = container.querySelector("[data-testid='cinematic-overlay']");
    expect(overlay).toBeInTheDocument();
  });

  it("attribution renders when provided", () => {
    render(
      <CinematicHero
        {...defaultProps}
        attribution={{ photographer: "John Smith", source: "Pexels" }}
      />,
    );
    expect(screen.getByText(/John Smith/)).toBeInTheDocument();
  });

  it("responds to height prop variants", () => {
    const { container } = render(
      <CinematicHero {...defaultProps} height="tall" />,
    );
    const section = container.firstElementChild as HTMLElement;
    expect(section.style.height || section.className).toMatch(/80dvh|tall/);
  });

  it("renders subtitle when provided", () => {
    render(
      <CinematicHero {...defaultProps} subtitle="The future of production" />,
    );
    expect(screen.getByText("The future of production")).toBeInTheDocument();
  });

  it("uses 100dvh not 100vh (Finding #18)", () => {
    const { container } = render(<CinematicHero {...defaultProps} />);
    const section = container.firstElementChild as HTMLElement;
    const style = section.getAttribute("style") ?? "";
    expect(style).toContain("dvh");
    expect(style).not.toMatch(/\b100vh\b(?!.*dvh)/);
  });
});

describe("CinematicHero — href XSS prevention", () => {
  it("sanitizes javascript: URLs to #", () => {
    render(
      <CinematicHero
        {...defaultProps}
        ctas={[{ label: "Evil", href: "javascript:alert(1)", variant: "primary" }]}
      />,
    );
    const link = screen.getByRole("link", { name: "Evil" });
    expect(link).toHaveAttribute("href", "#");
  });

  it("sanitizes data: URLs to #", () => {
    render(
      <CinematicHero
        {...defaultProps}
        ctas={[{ label: "Data", href: "data:text/html,<script>alert(1)</script>", variant: "primary" }]}
      />,
    );
    const link = screen.getByRole("link", { name: "Data" });
    expect(link).toHaveAttribute("href", "#");
  });

  it("allows relative URLs", () => {
    render(
      <CinematicHero
        {...defaultProps}
        ctas={[{ label: "Relative", href: "/about", variant: "primary" }]}
      />,
    );
    const link = screen.getByRole("link", { name: "Relative" });
    expect(link).toHaveAttribute("href", "/about");
  });

  it("allows https: URLs", () => {
    render(
      <CinematicHero
        {...defaultProps}
        ctas={[{ label: "Secure", href: "https://example.com", variant: "primary" }]}
      />,
    );
    const link = screen.getByRole("link", { name: "Secure" });
    expect(link).toHaveAttribute("href", "https://example.com");
  });

  it("rejects http: URLs", () => {
    render(
      <CinematicHero
        {...defaultProps}
        ctas={[{ label: "Insecure", href: "http://example.com", variant: "primary" }]}
      />,
    );
    const link = screen.getByRole("link", { name: "Insecure" });
    expect(link).toHaveAttribute("href", "#");
  });
});

describe("isSafeHref", () => {
  it("allows relative paths", () => {
    expect(isSafeHref("/about")).toBe(true);
    expect(isSafeHref("#section")).toBe(true);
    expect(isSafeHref("?query=1")).toBe(true);
    expect(isSafeHref("about")).toBe(true);
  });

  it("allows https URLs", () => {
    expect(isSafeHref("https://example.com")).toBe(true);
  });

  it("rejects dangerous schemes", () => {
    expect(isSafeHref("javascript:alert(1)")).toBe(false);
    expect(isSafeHref("data:text/html,<h1>hi</h1>")).toBe(false);
    expect(isSafeHref("vbscript:MsgBox")).toBe(false);
  });

  it("rejects http URLs", () => {
    expect(isSafeHref("http://example.com")).toBe(false);
  });
});

describe("CinematicHero — light overlay contrast", () => {
  it("uses dark text on light overlay", () => {
    render(
      <CinematicHero {...defaultProps} overlay="light" subtitle="Sub" />,
    );
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.className).toContain("text-neutral-950");
    expect(heading.className).not.toContain("text-white");
  });

  it("uses dark subtitle text on light overlay", () => {
    render(
      <CinematicHero {...defaultProps} overlay="light" subtitle="Sub" />,
    );
    const subtitle = screen.getByText("Sub");
    expect(subtitle.className).toContain("text-neutral-950");
  });

  it("uses dark attribution on light overlay", () => {
    render(
      <CinematicHero
        {...defaultProps}
        overlay="light"
        attribution={{ photographer: "Jane", source: "Pexels" }}
      />,
    );
    const attr = screen.getByText(/Jane/);
    expect(attr.className).toContain("text-neutral-950");
  });

  it("uses white text on dark overlay (default)", () => {
    render(<CinematicHero {...defaultProps} />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading.className).toContain("text-white");
  });
});
