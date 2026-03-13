import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Avatar, AvatarGroup } from "./Avatar";

describe("Avatar", () => {
  it("renders initials when no image", () => {
    render(<Avatar initials="JD" />);
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("truncates initials to 2 characters", () => {
    render(<Avatar initials="ABC" />);
    expect(screen.getByText("AB")).toBeInTheDocument();
  });

  it("renders image when src is provided", () => {
    render(<Avatar src="https://example.com/avatar.jpg" alt="John Doe" />);
    const img = screen.getByRole("img", { name: "John Doe" });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/avatar.jpg");
  });

  it("falls back to initials when image fails to load", async () => {
    render(<Avatar src="invalid-url" alt="John Doe" initials="JD" />);
    const img = screen.getByRole("img", { name: "John Doe" });
    img.dispatchEvent(new Event("error"));
    // After error, initials should be shown
    expect(await screen.findByText("JD")).toBeInTheDocument();
  });

  it("exposes alt as container aria-label when falling back to initials", () => {
    render(<Avatar initials="JD" alt="John Doe" />);
    const container = screen.getByLabelText("John Doe");
    expect(container).toBeInTheDocument();
  });

  it("renders icon as final fallback", () => {
    render(<Avatar icon={<span data-testid="icon" />} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("renders status indicator with label", () => {
    render(<Avatar initials="JD" status="online" statusLabel="Online" />);
    expect(screen.getByRole("img", { name: "Online" })).toBeInTheDocument();
  });

  it("hides status indicator from AT when no statusLabel", () => {
    render(<Avatar initials="JD" status="online" />);
    const statusDot = document.querySelector("[aria-hidden='true']");
    expect(statusDot).toBeInTheDocument();
  });
});

describe("AvatarGroup", () => {
  const avatars = [
    { initials: "AA", alt: "Alice A" },
    { initials: "BB", alt: "Bob B" },
    { initials: "CC", alt: "Carol C" },
    { initials: "DD", alt: "Dave D" },
    { initials: "EE", alt: "Eve E" },
  ];

  it("renders visible avatars up to max", () => {
    render(<AvatarGroup avatars={avatars} max={3} />);
    expect(screen.getByText("AA")).toBeInTheDocument();
    expect(screen.getByText("BB")).toBeInTheDocument();
    expect(screen.getByText("CC")).toBeInTheDocument();
    expect(screen.queryByText("DD")).not.toBeInTheDocument();
  });

  it("shows overflow count", () => {
    render(<AvatarGroup avatars={avatars} max={3} />);
    expect(screen.getByLabelText("2 more")).toBeInTheDocument();
  });

  it("does not show overflow when all fit", () => {
    render(<AvatarGroup avatars={avatars.slice(0, 3)} max={3} />);
    expect(screen.queryByText(/\+/)).not.toBeInTheDocument();
  });

  it("renders as a list", () => {
    render(<AvatarGroup avatars={avatars} />);
    expect(screen.getByRole("list")).toBeInTheDocument();
  });
});
