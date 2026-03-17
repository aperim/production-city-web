import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { WorkspaceIcon, WORKSPACE_ICONS } from "./WorkspaceIcon";

describe("WorkspaceIcon", () => {
  it("renders an SVG element", () => {
    const { container } = render(<WorkspaceIcon icon="film" />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("renders all icon variants without error", () => {
    const icons = Object.keys(WORKSPACE_ICONS);
    expect(icons.length).toBeGreaterThanOrEqual(12);
    for (const icon of icons) {
      const { container } = render(<WorkspaceIcon icon={icon} />);
      expect(container.querySelector("svg")).not.toBeNull();
    }
  });

  it("applies size prop to width and height", () => {
    const { container } = render(<WorkspaceIcon icon="film" size={24} />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("24");
    expect(svg?.getAttribute("height")).toBe("24");
  });

  it("applies custom className", () => {
    const { container } = render(<WorkspaceIcon icon="film" className="text-red-500" />);
    const svg = container.querySelector("svg");
    expect(svg?.classList.contains("text-red-500")).toBe(true);
  });

  it("renders fallback for unknown icon", () => {
    const { container } = render(<WorkspaceIcon icon="nonexistent" />);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
  });

  it("sets aria-hidden when decorative", () => {
    const { container } = render(<WorkspaceIcon icon="film" decorative />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("aria-hidden")).toBe("true");
  });
});
