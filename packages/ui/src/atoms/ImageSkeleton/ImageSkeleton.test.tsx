import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ImageSkeleton } from "./ImageSkeleton";

describe("ImageSkeleton", () => {
  it("renders with correct aspect ratio from width/height", () => {
    const { container } = render(<ImageSkeleton width={800} height={600} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.aspectRatio).toBe("800 / 600");
  });

  it("uses averageColor as background", () => {
    const { container } = render(
      <ImageSkeleton width={400} height={300} averageColor="#8b5cf6" />,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.style.backgroundColor).toBe("rgb(139, 92, 246)");
  });

  it("has pulse animation class", () => {
    const { container } = render(<ImageSkeleton width={400} height={300} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain("animate-pulse");
  });

  it("falls back to muted background when averageColor not provided", () => {
    const { container } = render(<ImageSkeleton width={400} height={300} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain("bg-muted");
    expect(el.style.backgroundColor).toBe("");
  });

  it("is aria-hidden as decorative", () => {
    const { container } = render(<ImageSkeleton width={400} height={300} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el).toHaveAttribute("aria-hidden", "true");
  });

  it("renders full width when no explicit width style needed", () => {
    const { container } = render(<ImageSkeleton width={400} height={300} />);
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain("w-full");
  });

  it("merges custom className", () => {
    const { container } = render(
      <ImageSkeleton width={400} height={300} className="custom-test" />,
    );
    const el = container.firstElementChild as HTMLElement;
    expect(el.className).toContain("custom-test");
  });
});
