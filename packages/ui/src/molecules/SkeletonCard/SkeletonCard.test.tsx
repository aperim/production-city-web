import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SkeletonCard } from "./SkeletonCard";

describe("SkeletonCard", () => {
  it("renders without errors", () => {
    const { container } = render(<SkeletonCard />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it("is aria-hidden for accessibility", () => {
    const { container } = render(<SkeletonCard />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("contains skeleton children", () => {
    const { container } = render(<SkeletonCard />);
    const skeletons = container.querySelectorAll('[aria-hidden="true"]');
    // Root + inner skeletons
    expect(skeletons.length).toBeGreaterThan(1);
  });

  it("applies custom className", () => {
    const { container } = render(<SkeletonCard className="w-72" />);
    expect((container.firstChild as HTMLElement).className).toContain("w-72");
  });
});
