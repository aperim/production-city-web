import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ButtonGroup } from "./ButtonGroup";

describe("ButtonGroup", () => {
  it("renders children inside a group role", () => {
    render(
      <ButtonGroup aria-label="Actions">
        <button>Save</button>
        <button>Cancel</button>
      </ButtonGroup>,
    );
    const group = screen.getByRole("group", { name: "Actions" });
    expect(group).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
  });

  it("applies aria-label to the group", () => {
    render(
      <ButtonGroup aria-label="Text formatting">
        <button>Bold</button>
      </ButtonGroup>,
    );
    expect(screen.getByRole("group")).toHaveAttribute("aria-label", "Text formatting");
  });

  it("renders with horizontal orientation by default", () => {
    const { container } = render(
      <ButtonGroup>
        <button>A</button>
      </ButtonGroup>,
    );
    const group = container.firstChild as HTMLElement;
    expect(group.className).toContain("flex-row");
  });

  it("renders with vertical orientation", () => {
    const { container } = render(
      <ButtonGroup orientation="vertical">
        <button>A</button>
      </ButtonGroup>,
    );
    const group = container.firstChild as HTMLElement;
    expect(group.className).toContain("flex-col");
  });

  it("renders multiple buttons", () => {
    render(
      <ButtonGroup>
        <button>One</button>
        <button>Two</button>
        <button>Three</button>
      </ButtonGroup>,
    );
    expect(screen.getAllByRole("button")).toHaveLength(3);
  });

  it("applies connected variant class", () => {
    const { container } = render(
      <ButtonGroup variant="connected">
        <button>A</button>
        <button>B</button>
      </ButtonGroup>,
    );
    const group = container.firstChild as HTMLElement;
    expect(group.className).toContain("rounded-none");
  });
});
