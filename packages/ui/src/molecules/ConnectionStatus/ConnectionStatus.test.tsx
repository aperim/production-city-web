import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ConnectionStatus } from "./ConnectionStatus";

describe("ConnectionStatus", () => {
  it("renders connected state with dot only (no label by default)", () => {
    const { container } = render(<ConnectionStatus state="connected" />);
    expect(screen.getByRole("status")).toHaveAttribute("aria-label", "Connected");
    expect(container.querySelector("span.text-xs")).toBeNull();
  });

  it("renders reconnecting state with label visible", () => {
    render(<ConnectionStatus state="reconnecting" />);
    expect(screen.getByText("Reconnecting...")).toBeInTheDocument();
  });

  it("renders disconnected state with label visible", () => {
    render(<ConnectionStatus state="disconnected" />);
    expect(screen.getByText("Disconnected")).toBeInTheDocument();
  });

  it("accepts custom label", () => {
    render(<ConnectionStatus state="disconnected" label="Offline" />);
    expect(screen.getByText("Offline")).toBeInTheDocument();
  });

  it("compact mode hides label", () => {
    const { container } = render(<ConnectionStatus state="disconnected" compact />);
    expect(container.querySelector("span.text-xs")).toBeNull();
  });
});
