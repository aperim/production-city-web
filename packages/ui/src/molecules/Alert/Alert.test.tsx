import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Alert } from "./Alert";

describe("Alert", () => {
  it("renders children", () => {
    render(<Alert>This is an alert</Alert>);
    expect(screen.getByText("This is an alert")).toBeInTheDocument();
  });

  it("uses role=status for info variant by default", () => {
    render(<Alert variant="info">Info</Alert>);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("uses role=alert for error variant by default", () => {
    render(<Alert variant="error">Error occurred</Alert>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("uses role=alert for warning variant by default", () => {
    render(<Alert variant="warning">Warning</Alert>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("uses role=status for success variant by default", () => {
    render(<Alert variant="success">Saved</Alert>);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders title when provided", () => {
    render(<Alert title="Heads up">Something happened</Alert>);
    expect(screen.getByText("Heads up")).toBeInTheDocument();
  });

  it("renders dismiss button when dismissible=true", () => {
    render(<Alert dismissible>Dismissible</Alert>);
    expect(screen.getByRole("button", { name: "Dismiss" })).toBeInTheDocument();
  });

  it("calls onDismiss when dismiss button clicked", async () => {
    const handleDismiss = vi.fn();
    render(<Alert dismissible onDismiss={handleDismiss}>Dismissible</Alert>);
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(handleDismiss).toHaveBeenCalledOnce();
  });

  it("does not render dismiss button when dismissible=false", () => {
    render(<Alert>Non-dismissible</Alert>);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders action slot", () => {
    render(
      <Alert action={<button>Retry</button>}>Upload failed</Alert>,
    );
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });

  it("renders custom icon", () => {
    render(<Alert icon={<span>★</span>}>Custom icon</Alert>);
    expect(screen.getByText("★")).toBeInTheDocument();
  });

  it("respects explicit role override", () => {
    render(<Alert variant="info" role="alert">Critical info</Alert>);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});
