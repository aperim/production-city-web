import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { VisibilityBadge } from "./VisibilityBadge";

describe("VisibilityBadge", () => {
  it("renders 'Public' for public visibility", () => {
    render(<VisibilityBadge visibility="public" />);
    expect(screen.getByText("Public")).toBeInTheDocument();
  });

  it("renders 'Private' for private visibility", () => {
    render(<VisibilityBadge visibility="private" />);
    expect(screen.getByText("Private")).toBeInTheDocument();
  });

  it("applies public-specific styling", () => {
    const { container } = render(<VisibilityBadge visibility="public" />);
    const badge = container.querySelector("span");
    expect(badge?.className).toContain("text-sky");
  });

  it("applies private-specific styling", () => {
    const { container } = render(<VisibilityBadge visibility="private" />);
    const badge = container.querySelector("span");
    expect(badge?.className).toContain("text-amber");
  });

  it("merges custom className", () => {
    const { container } = render(
      <VisibilityBadge visibility="public" className="extra" />,
    );
    const badge = container.querySelector("span");
    expect(badge?.className).toContain("extra");
  });
});
