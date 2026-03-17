import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DetailPanel, type DetailPanelProps } from "./DetailPanel";

const defaultProps: DetailPanelProps = {
  open: true,
  onClose: vi.fn(),
  title: "Production Detail",
  children: <div>Detail content here</div>,
};

describe("DetailPanel", () => {
  it("renders when open", () => {
    render(<DetailPanel {...defaultProps} />);
    expect(screen.getByText("Production Detail")).toBeDefined();
    expect(screen.getByText("Detail content here")).toBeDefined();
  });

  it("does not render when closed", () => {
    render(<DetailPanel {...defaultProps} open={false} />);
    expect(screen.queryByText("Production Detail")).toBeNull();
  });

  it("calls onClose when X button is clicked", () => {
    const onClose = vi.fn();
    render(<DetailPanel {...defaultProps} onClose={onClose} />);
    fireEvent.click(screen.getByLabelText(/close/i));
    expect(onClose).toHaveBeenCalled();
  });

  it("calls onClose on Escape key", () => {
    const onClose = vi.fn();
    render(<DetailPanel {...defaultProps} onClose={onClose} />);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalled();
  });

  it("has correct width class", () => {
    const { container } = render(<DetailPanel {...defaultProps} />);
    const panel = container.querySelector("[data-detail-panel]");
    expect(panel?.className).toContain("w-[480px]");
  });

  it("renders with slide animation class", () => {
    const { container } = render(<DetailPanel {...defaultProps} />);
    const panel = container.querySelector("[data-detail-panel]");
    expect(panel?.className).toContain("animate");
  });

  it("has independent scroll", () => {
    const { container } = render(<DetailPanel {...defaultProps} />);
    const body = container.querySelector("[data-detail-body]");
    expect(body?.className).toContain("overflow-y-auto");
  });

  it("has dialog role", () => {
    render(<DetailPanel {...defaultProps} />);
    expect(screen.getByRole("dialog")).toBeDefined();
  });
});
