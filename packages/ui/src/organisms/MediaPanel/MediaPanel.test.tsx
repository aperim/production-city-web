import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MediaPanel } from "./MediaPanel";

const defaultProps = {
  imageSrc: "/media/facilities-hero/dark.jpg",
  imageAlt: "Studio facility",
};

describe("MediaPanel", () => {
  it("renders image and text content", () => {
    render(
      <MediaPanel {...defaultProps}>
        <p>Panel text content</p>
      </MediaPanel>,
    );
    const img = screen.getByRole("img", { name: "Studio facility" });
    expect(img).toBeInTheDocument();
    expect(screen.getByText("Panel text content")).toBeInTheDocument();
  });

  it("renders with image on the left by default", () => {
    const { container } = render(
      <MediaPanel {...defaultProps}>
        <p>Content</p>
      </MediaPanel>,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    // Should not have reverse class by default
    expect(wrapper.className).not.toMatch(/row-reverse|flex-row-reverse/);
  });

  it("renders with image on the right", () => {
    const { container } = render(
      <MediaPanel {...defaultProps} imagePosition="right">
        <p>Content</p>
      </MediaPanel>,
    );
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.className).toMatch(/row-reverse|flex-row-reverse/);
  });

  it("has hover zoom class on image", () => {
    const { container } = render(
      <MediaPanel {...defaultProps}>
        <p>Content</p>
      </MediaPanel>,
    );
    const imageContainer = container.querySelector("[data-testid='media-panel-image']");
    expect(imageContainer).toBeInTheDocument();
    const html = imageContainer?.innerHTML ?? "";
    expect(html + (imageContainer?.className ?? "")).toMatch(/hover|scale|zoom|overflow/);
  });

  it("renders attribution when provided", () => {
    render(
      <MediaPanel
        {...defaultProps}
        attribution={{ photographer: "Jane Doe", source: "Pexels" }}
      >
        <p>Content</p>
      </MediaPanel>,
    );
    expect(screen.getByText(/Jane Doe/)).toBeInTheDocument();
  });
});
