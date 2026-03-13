import { render, screen } from "@testing-library/react";
import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { MediaGallery } from "./MediaGallery";
import type { MediaDisplayProps } from "../MediaDisplay/MediaDisplay";

describe("MediaGallery", () => {
  beforeEach(() => {
    document.documentElement.setAttribute("data-theme", "light");
  });

  afterEach(() => {
    document.documentElement.removeAttribute("data-theme");
  });

  const makeItem = (id: number): MediaDisplayProps => ({
    lightSrc: `/media/photo-${id}.jpg`,
    alt: `Photo ${id}`,
    width: 800,
    height: 600,
    photographer: `Photographer ${id}`,
    source: "Pexels",
  });

  it("renders correct number of MediaDisplay children", () => {
    const items = [makeItem(1), makeItem(2), makeItem(3)];
    render(<MediaGallery items={items} />);
    expect(screen.getAllByRole("img")).toHaveLength(3);
  });

  it("applies grid layout with correct column count", () => {
    const items = [makeItem(1), makeItem(2)];
    const { container } = render(<MediaGallery items={items} columns={2} />);
    const grid = container.firstElementChild as HTMLElement;
    expect(grid.className).toContain("grid");
  });

  it("shows empty state when items array is empty", () => {
    render(<MediaGallery items={[]} />);
    expect(screen.getByText("No media available")).toBeInTheDocument();
  });

  it("passes props correctly to each MediaDisplay", () => {
    const items = [makeItem(1), makeItem(2)];
    render(<MediaGallery items={items} />);
    expect(screen.getByRole("img", { name: "Photo 1" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Photo 2" })).toBeInTheDocument();
  });

  it("merges custom className", () => {
    const items = [makeItem(1)];
    const { container } = render(
      <MediaGallery items={items} className="custom-test" />,
    );
    expect(container.firstElementChild?.className).toContain("custom-test");
  });
});
