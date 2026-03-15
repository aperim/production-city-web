import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CategoryTag } from "./CategoryTag";

describe("CategoryTag", () => {
  it("renders the category name", () => {
    render(<CategoryTag name="News" slug="news" />);
    expect(screen.getByText("News")).toBeInTheDocument();
  });

  it("sets data-slug attribute", () => {
    render(<CategoryTag name="News" slug="news" />);
    expect(screen.getByText("News")).toHaveAttribute("data-slug", "news");
  });

  it("has aria-pressed false by default", () => {
    render(<CategoryTag name="News" slug="news" />);
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("has aria-pressed true when active", () => {
    render(<CategoryTag name="News" slug="news" active />);
    expect(screen.getByRole("button")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("calls onClick when clicked", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<CategoryTag name="News" slug="news" onClick={handleClick} />);
    await user.click(screen.getByText("News"));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("applies active styling", () => {
    const { container } = render(
      <CategoryTag name="News" slug="news" active />,
    );
    const btn = container.querySelector("button");
    expect(btn?.className).toContain("text-primary");
  });
});
