import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Skeleton, SkeletonText } from "./Skeleton";

describe("Skeleton", () => {
  it("renders without errors", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("is aria-hidden for accessibility (decorative)", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("renders rectangular variant by default", () => {
    const { container } = render(<Skeleton />);
    expect((container.firstChild as HTMLElement).className).toContain("rounded-sm");
  });

  it("renders circular variant", () => {
    const { container } = render(<Skeleton variant="circular" width={40} height={40} />);
    expect((container.firstChild as HTMLElement).className).toContain("rounded-full");
  });

  it("renders text variant", () => {
    const { container } = render(<Skeleton variant="text" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("h-4");
  });

  it("applies width and height via style", () => {
    const { container } = render(<Skeleton width={200} height={100} />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe("200px");
    expect(el.style.height).toBe("100px");
  });

  it("applies width as string value", () => {
    const { container } = render(<Skeleton width="50%" />);
    const el = container.firstChild as HTMLElement;
    expect(el.style.width).toBe("50%");
  });

  it("has pulse animation class", () => {
    const { container } = render(<Skeleton />);
    expect((container.firstChild as HTMLElement).className).toContain("animate-pulse");
  });
});

describe("SkeletonText", () => {
  it("renders the specified number of lines", () => {
    const { container } = render(<SkeletonText lines={4} />);
    // Count direct children skeleton lines
    const lines = container.querySelectorAll("[aria-hidden='true'] [aria-hidden='true']");
    expect(lines.length).toBe(4);
  });

  it("is aria-hidden", () => {
    const { container } = render(<SkeletonText />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("renders 3 lines by default", () => {
    const { container } = render(<SkeletonText />);
    const lines = container.querySelectorAll("[aria-hidden='true'] [aria-hidden='true']");
    expect(lines.length).toBe(3);
  });
});
