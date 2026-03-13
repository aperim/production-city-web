import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { MediaDisplay } from "./MediaDisplay";

describe("MediaDisplay", () => {
  beforeEach(() => {
    document.documentElement.setAttribute("data-theme", "light");
  });

  afterEach(() => {
    document.documentElement.removeAttribute("data-theme");
  });

  const defaultProps = {
    lightSrc: "/media/light.jpg",
    darkSrc: "/media/dark.jpg",
    alt: "A test photo",
    width: 800,
    height: 600,
    photographer: "Jane Doe",
    photographerUrl: "https://example.com/jane",
    source: "Pexels",
    sourceUrl: "https://pexels.com",
  };

  it("renders ThemedImage with correct light/dark sources", () => {
    render(<MediaDisplay {...defaultProps} />);
    const img = screen.getByRole("img", { name: "A test photo" });
    expect(img).toHaveAttribute("src", "/media/light.jpg");
  });

  it("renders MediaAttribution with photographer info", () => {
    render(<MediaDisplay {...defaultProps} />);
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("Pexels")).toBeInTheDocument();
  });

  it("shows correct badges based on classification flags", () => {
    render(<MediaDisplay {...defaultProps} aiAssisted aiGenerated />);
    expect(screen.getByLabelText("AI-assisted media")).toBeInTheDocument();
    expect(screen.getByLabelText("AI-generated media")).toBeInTheDocument();
  });

  it("shows skeleton during image load", () => {
    const { container } = render(<MediaDisplay {...defaultProps} />);
    expect(container.querySelector("[aria-hidden='true']")).toBeInTheDocument();
  });

  it("shows error state on load failure with attribution still visible", () => {
    render(<MediaDisplay {...defaultProps} />);
    const img = screen.getByRole("img", { name: "A test photo" });
    fireEvent.error(img);
    expect(screen.getByText("Image unavailable")).toBeInTheDocument();
    // Attribution should still be visible
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
  });

  it("has correct aspect ratio", () => {
    const { container } = render(
      <MediaDisplay {...defaultProps} aspectRatio="16/9" />,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.aspectRatio).toBe("16/9");
  });

  it("has figure role with aria-label", () => {
    const { container } = render(<MediaDisplay {...defaultProps} />);
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).toHaveAttribute("role", "figure");
    expect(wrapper.getAttribute("aria-label")).toContain("Jane Doe");
  });

  it("merges custom className", () => {
    const { container } = render(
      <MediaDisplay {...defaultProps} className="custom-test" />,
    );
    expect(container.firstElementChild?.className).toContain("custom-test");
  });
});
