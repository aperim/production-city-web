import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeatureStatusDot } from "./FeatureStatusDot";

describe("FeatureStatusDot", () => {
  it("renders with active status", () => {
    render(<FeatureStatusDot status="active" />);
    expect(screen.getByRole("status")).toBeDefined();
    expect(screen.getByRole("status").getAttribute("aria-label")).toBe("Active");
  });

  it("renders with coming_soon status", () => {
    render(<FeatureStatusDot status="coming_soon" />);
    expect(screen.getByRole("status").getAttribute("aria-label")).toBe("Coming soon");
  });

  it("renders with disabled status", () => {
    render(<FeatureStatusDot status="disabled" />);
    expect(screen.getByRole("status").getAttribute("aria-label")).toBe("Disabled");
  });

  it("applies custom className", () => {
    render(<FeatureStatusDot status="active" className="ml-2" />);
    expect(screen.getByRole("status").className).toContain("ml-2");
  });
});
