import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Drawer } from "./Drawer";

function TestDrawer(props: Partial<Parameters<typeof Drawer>[0]>) {
  return (
    <Drawer open={false} onClose={() => {}} {...props}>
      <p>Drawer content</p>
      <button>Action</button>
    </Drawer>
  );
}

describe("Drawer", () => {
  it("renders nothing when closed", () => {
    render(<TestDrawer open={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders dialog when open", () => {
    render(<TestDrawer open={true} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders content", () => {
    render(<TestDrawer open={true} />);
    expect(screen.getByText("Drawer content")).toBeInTheDocument();
  });

  it("shows title when provided", () => {
    render(<TestDrawer open={true} title="Settings" />);
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("shows close button by default", () => {
    render(<TestDrawer open={true} />);
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("calls onClose when close button clicked", async () => {
    const handleClose = vi.fn();
    render(<TestDrawer open={true} onClose={handleClose} />);
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(handleClose).toHaveBeenCalledOnce();
  });

  it("calls onClose when backdrop clicked", async () => {
    const handleClose = vi.fn();
    render(<TestDrawer open={true} onClose={handleClose} />);
    // Click the backdrop (aria-hidden div behind the panel)
    const backdrop = document.querySelector('[aria-hidden="true"]') as HTMLElement;
    if (backdrop) await userEvent.click(backdrop);
    expect(handleClose).toHaveBeenCalled();
  });

  it("calls onClose when Escape is pressed", async () => {
    const handleClose = vi.fn();
    render(<TestDrawer open={true} onClose={handleClose} />);
    await userEvent.keyboard("{Escape}");
    expect(handleClose).toHaveBeenCalledOnce();
  });

  it("has aria-modal=true on dialog", () => {
    render(<TestDrawer open={true} />);
    expect(screen.getByRole("dialog")).toHaveAttribute("aria-modal", "true");
  });

  it("uses aria-label when provided", () => {
    render(<TestDrawer open={true} aria-label="Navigation menu" />);
    expect(screen.getByRole("dialog", { name: "Navigation menu" })).toBeInTheDocument();
  });

  it("hides close button when showClose=false", () => {
    render(<TestDrawer open={true} showClose={false} />);
    expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
  });
});
