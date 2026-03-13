import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Card } from "./Card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("renders card header, body, footer", () => {
    render(
      <Card>
        <Card.Header>Header</Card.Header>
        <Card.Body>Body</Card.Body>
        <Card.Footer>Footer</Card.Footer>
      </Card>,
    );
    expect(screen.getByText("Header")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("renders as button when asButton=true", () => {
    render(<Card asButton>Clickable</Card>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("renders as button when onClick is provided", () => {
    render(<Card onClick={() => {}}>Clickable</Card>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("fires onClick when clicked", async () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Click me</Card>);
    await userEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it("fires onClick on Enter key press", async () => {
    const handleClick = vi.fn();
    render(<Card onClick={handleClick}>Press Enter</Card>);
    const card = screen.getByRole("button");
    card.focus();
    await userEvent.keyboard("{Enter}");
    expect(handleClick).toHaveBeenCalled();
  });

  it("applies elevated variant class", () => {
    const { container } = render(<Card variant="elevated">Content</Card>);
    expect(container.firstChild).toHaveClass("shadow-sm");
  });

  it("renders Card.Media", () => {
    render(
      <Card>
        <Card.Media>
          <img src="test.jpg" alt="test" />
        </Card.Media>
      </Card>,
    );
    expect(screen.getByRole("img")).toBeInTheDocument();
  });
});
