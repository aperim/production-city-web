import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FormField } from "./FormField";

describe("FormField", () => {
  it("renders label and children", () => {
    render(
      <FormField label="Email">
        <input id="email" type="email" />
      </FormField>,
    );
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("shows required indicator when required=true", () => {
    render(
      <FormField label="Name" required>
        <input id="name" />
      </FormField>,
    );
    // asterisk is aria-hidden but visible
    const label = screen.getByText("Name");
    expect(label).toBeInTheDocument();
    expect(document.querySelector("[aria-hidden='true']")).toHaveTextContent("*");
  });

  it("shows optional indicator when optional=true", () => {
    render(
      <FormField label="Nickname" optional>
        <input id="nick" />
      </FormField>,
    );
    expect(screen.getByText("(optional)")).toBeInTheDocument();
  });

  it("renders helper text when no error", () => {
    render(
      <FormField label="Bio" helperText="Max 200 chars">
        <textarea id="bio" />
      </FormField>,
    );
    expect(screen.getByText("Max 200 chars")).toBeInTheDocument();
  });

  it("renders error message and hides helper text when errorMessage is set", () => {
    render(
      <FormField label="Email" helperText="Enter your email" errorMessage="Invalid email">
        <input id="email2" />
      </FormField>,
    );
    expect(screen.getByText("Invalid email")).toBeInTheDocument();
    expect(screen.queryByText("Enter your email")).not.toBeInTheDocument();
  });

  it("error message has role=alert", () => {
    render(
      <FormField label="Email" errorMessage="Required field">
        <input id="email3" />
      </FormField>,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Required field");
  });

  it("renders character count when provided", () => {
    render(
      <FormField label="Bio" characterCount="50 / 200">
        <textarea id="bio2" />
      </FormField>,
    );
    expect(screen.getByText("50 / 200")).toBeInTheDocument();
  });

  it("applies inline layout class when inline=true", () => {
    const { container } = render(
      <FormField label="Toggle" inline>
        <input type="checkbox" id="chk" />
      </FormField>,
    );
    const root = container.firstChild as HTMLElement;
    expect(root.className).toContain("flex-row");
  });

  it("does not show optional indicator when required=true", () => {
    render(
      <FormField label="Field" required optional>
        <input id="f1" />
      </FormField>,
    );
    expect(screen.queryByText("(optional)")).not.toBeInTheDocument();
  });
});
