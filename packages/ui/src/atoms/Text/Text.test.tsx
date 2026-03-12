import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Text } from "./Text";

describe("Text", () => {
  it("renders as p by default", () => {
    const { container } = render(<Text>Hello</Text>);
    const el = container.querySelector("p");
    expect(el).toBeInTheDocument();
    expect(el?.textContent).toBe("Hello");
  });

  it("renders as h1", () => {
    render(<Text as="h1">Title</Text>);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Title");
  });

  it("renders as h2", () => {
    render(<Text as="h2">Subtitle</Text>);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent("Subtitle");
  });

  it("renders as h3", () => {
    render(<Text as="h3">Section</Text>);
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent("Section");
  });

  it("renders as h4", () => {
    render(<Text as="h4">Subsection</Text>);
    expect(screen.getByRole("heading", { level: 4 })).toHaveTextContent("Subsection");
  });

  it("renders as span", () => {
    const { container } = render(<Text as="span">Inline</Text>);
    const el = container.querySelector("span");
    expect(el).toBeInTheDocument();
    expect(el?.textContent).toBe("Inline");
  });

  it("renders as caption", () => {
    const { container } = render(
      <table>
        <Text as="caption">Table caption</Text>
        <tbody><tr><td>data</td></tr></tbody>
      </table>
    );
    const el = container.querySelector("caption");
    expect(el).toBeInTheDocument();
    expect(el?.textContent).toBe("Table caption");
  });

  it("merges custom className", () => {
    const { container } = render(<Text className="custom">Styled</Text>);
    const el = container.querySelector("p");
    expect(el?.getAttribute("class")).toContain("custom");
  });
});
