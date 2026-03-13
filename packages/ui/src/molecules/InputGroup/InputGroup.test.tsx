import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { InputGroup } from "./InputGroup";

describe("InputGroup", () => {
  it("renders an input", () => {
    render(<InputGroup placeholder="Search" />);
    expect(screen.getByPlaceholderText("Search")).toBeInTheDocument();
  });

  it("renders prefix addon text", () => {
    render(<InputGroup prefix="$" placeholder="Amount" />);
    expect(screen.getByText("$")).toBeInTheDocument();
  });

  it("renders suffix addon text", () => {
    render(<InputGroup suffix=".com" placeholder="domain" />);
    expect(screen.getByText(".com")).toBeInTheDocument();
  });

  it("renders clickable prefix as button", () => {
    const handleClick = vi.fn();
    render(
      <InputGroup
        prefix="🔍"
        onPrefixClick={handleClick}
        prefixLabel="Search"
        placeholder="query"
      />,
    );
    expect(screen.getByRole("button", { name: "Search" })).toBeInTheDocument();
  });

  it("fires onPrefixClick when prefix button clicked", async () => {
    const handleClick = vi.fn();
    render(
      <InputGroup
        prefix="Search"
        onPrefixClick={handleClick}
        prefixLabel="Search"
        placeholder="query"
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Search" }));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("renders clickable suffix as button", () => {
    const handleClick = vi.fn();
    render(
      <InputGroup
        suffix="Clear"
        onSuffixClick={handleClick}
        suffixLabel="Clear input"
        placeholder="text"
      />,
    );
    expect(screen.getByRole("button", { name: "Clear input" })).toBeInTheDocument();
  });

  it("sets aria-invalid when error=true", () => {
    render(<InputGroup error placeholder="test" />);
    expect(screen.getByPlaceholderText("test")).toHaveAttribute("aria-invalid", "true");
  });

  it("forwards ref to input element", () => {
    const ref = { current: null };
    render(<InputGroup ref={ref} placeholder="ref-test" />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });
});
