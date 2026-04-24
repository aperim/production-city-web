import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NetworkStatusChip } from "./NetworkStatusChip";

describe("NetworkStatusChip", () => {
  it("renders label text", () => {
    render(<NetworkStatusChip label="Sydney · Leading candidate" status="lead" />);
    expect(screen.getByText("Sydney · Leading candidate")).toBeInTheDocument();
  });

  it("includes accessible title for status", () => {
    const { container } = render(<NetworkStatusChip label="Sydney" status="lead" />);
    const chip = container.firstElementChild as HTMLElement;
    expect(chip.title).toBe("Lead campus");
  });

  it("renders a dot indicator as aria-hidden", () => {
    const { container } = render(<NetworkStatusChip label="Sydney" status="lead" />);
    const dot = container.querySelector('[aria-hidden="true"]');
    expect(dot).toBeInTheDocument();
  });

  it.each(["lead", "active", "assess", "follow"] as const)(
    "renders %s status without error",
    (status) => {
      render(<NetworkStatusChip label={status} status={status} />);
      expect(screen.getByText(status)).toBeInTheDocument();
    },
  );
});
