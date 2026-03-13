import { render, screen } from "@testing-library/react";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { MediaHero } from "./MediaHero";

describe("MediaHero", () => {
  beforeEach(() => {
    document.documentElement.setAttribute("data-theme", "light");
  });

  afterEach(() => {
    document.documentElement.removeAttribute("data-theme");
  });

  const defaultProps = {
    lightSrc: "/media/hero-light.jpg",
    darkSrc: "/media/hero-dark.jpg",
    alt: "Hero image",
    width: 1920,
    height: 1080,
    photographer: "Jane Doe",
    source: "Pexels",
  };

  it("renders full-width container", () => {
    const { container } = render(<MediaHero {...defaultProps} />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).toContain("w-full");
  });

  it("renders children as overlay content", () => {
    render(
      <MediaHero {...defaultProps}>
        <h1>Hero Title</h1>
      </MediaHero>,
    );
    expect(screen.getByText("Hero Title")).toBeInTheDocument();
  });

  it("has gradient overlay for text readability", () => {
    const { container } = render(
      <MediaHero {...defaultProps}>
        <h1>Title</h1>
      </MediaHero>,
    );
    const overlay = container.querySelector("[data-testid='hero-gradient']");
    expect(overlay).toBeInTheDocument();
  });

  it("passes loading='eager' to ThemedImage", () => {
    render(<MediaHero {...defaultProps} />);
    const img = screen.getByRole("img", { name: "Hero image" });
    expect(img).toHaveAttribute("loading", "eager");
  });

  it("passes fetchPriority='high' to ThemedImage", () => {
    render(<MediaHero {...defaultProps} />);
    const img = screen.getByRole("img", { name: "Hero image" });
    expect(img).toHaveAttribute("fetchpriority", "high");
  });

  it("renders attribution", () => {
    render(<MediaHero {...defaultProps} />);
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });

  it("applies configurable height", () => {
    const { container } = render(
      <MediaHero {...defaultProps} height={600} />,
    );
    // MediaHero uses a min-height style
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.minHeight).toBeTruthy();
  });

  it("merges custom className", () => {
    const { container } = render(
      <MediaHero {...defaultProps} className="custom-test" />,
    );
    expect(container.firstElementChild?.className).toContain("custom-test");
  });
});
