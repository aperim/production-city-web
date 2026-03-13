import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Breadcrumb } from "./Breadcrumb";

const items = [
  { label: "Home", href: "/" },
  { label: "Products", href: "/products" },
  { label: "Widget" },
];

describe("Breadcrumb", () => {
  it("renders a nav landmark with default aria-label", () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByRole("navigation", { name: "Breadcrumb" })).toBeInTheDocument();
  });

  it("uses custom aria-label", () => {
    render(<Breadcrumb items={items} aria-label="Page path" />);
    expect(screen.getByRole("navigation", { name: "Page path" })).toBeInTheDocument();
  });

  it("renders all item labels", () => {
    render(<Breadcrumb items={items} />);
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Products")).toBeInTheDocument();
    expect(screen.getByText("Widget")).toBeInTheDocument();
  });

  it("marks the last item with aria-current=page", () => {
    render(<Breadcrumb items={items} />);
    const current = screen.getByText("Widget");
    expect(current).toHaveAttribute("aria-current", "page");
  });

  it("renders links for non-last items with href", () => {
    render(<Breadcrumb items={items} />);
    const homeLink = screen.getByRole("link", { name: "Home" });
    expect(homeLink).toHaveAttribute("href", "/");
    const productsLink = screen.getByRole("link", { name: "Products" });
    expect(productsLink).toHaveAttribute("href", "/products");
  });

  it("does not render the last item as a link", () => {
    render(<Breadcrumb items={items} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(2);
  });

  it("renders custom separator", () => {
    render(<Breadcrumb items={items} separator=">" />);
    const separators = screen.getAllByText(">");
    expect(separators.length).toBeGreaterThan(0);
  });

  it("renders single item without separator", () => {
    render(<Breadcrumb items={[{ label: "Home" }]} />);
    expect(screen.getByText("Home")).toBeInTheDocument();
  });
});
