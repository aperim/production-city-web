import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { LandingNavigation } from "./LandingNavigation";

const defaultLinks = [
  { label: "Home", href: "/" },
  { label: "Facilities", href: "/facilities" },
  { label: "Creative", href: "/creative" },
  { label: "Vision", href: "/vision" },
];

const languages = [
  { code: "en", label: "English" },
  { code: "ar", label: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629" },
];

const defaultProps = {
  brand: "Production City" as const,
  links: defaultLinks,
  languages,
  currentLanguage: "en",
  onLanguageChange: () => {},
};

describe("LandingNavigation", () => {
  it("renders brand text", () => {
    render(<LandingNavigation {...defaultProps} />);
    expect(screen.getByText("Production City")).toBeInTheDocument();
  });

  it("renders all navigation links", () => {
    render(<LandingNavigation {...defaultProps} />);
    for (const link of defaultLinks) {
      expect(screen.getByText(link.label)).toBeInTheDocument();
    }
  });

  it("renders navigation landmark", () => {
    render(<LandingNavigation {...defaultProps} />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("renders mobile menu button", () => {
    render(<LandingNavigation {...defaultProps} />);
    expect(screen.getByRole("button", { name: /navigation menu/i })).toBeInTheDocument();
  });

  it("toggles mobile menu on button click", async () => {
    const user = userEvent.setup();
    render(<LandingNavigation {...defaultProps} />);
    const menuBtn = screen.getByRole("button", { name: /navigation menu/i });
    await user.click(menuBtn);
    expect(menuBtn).toHaveAttribute("aria-expanded", "true");
  });

  it("renders language switcher", () => {
    render(<LandingNavigation {...defaultProps} />);
    expect(screen.getByRole("button", { name: /language/i })).toBeInTheDocument();
  });

  it("has simple border-bottom styling per Uncodixify", () => {
    const { container } = render(<LandingNavigation {...defaultProps} />);
    const nav = container.querySelector("nav");
    expect(nav?.getAttribute("class")).toContain("border-b");
  });

  it("marks active page link with aria-current", () => {
    render(<LandingNavigation {...defaultProps} activePath="/facilities" />);
    const facilityLink = screen.getAllByText("Facilities")[0]!;
    expect(facilityLink).toHaveAttribute("aria-current", "page");
  });
});

describe("LandingNavigation — mobile overlay (Finding #10)", () => {
  it("mobile menu opens as full-screen overlay", async () => {
    const user = userEvent.setup();
    render(<LandingNavigation {...defaultProps} />);
    const menuBtn = screen.getByRole("button", { name: /navigation menu/i });
    await user.click(menuBtn);
    // Should have a dialog/overlay with role
    const overlay = screen.getByRole("dialog");
    expect(overlay).toBeInTheDocument();
  });

  it("mobile overlay has aria-modal for focus trap", async () => {
    const user = userEvent.setup();
    render(<LandingNavigation {...defaultProps} />);
    const menuBtn = screen.getByRole("button", { name: /navigation menu/i });
    await user.click(menuBtn);
    const overlay = screen.getByRole("dialog");
    expect(overlay).toHaveAttribute("aria-modal", "true");
  });

  it("Escape key closes the mobile menu", async () => {
    const user = userEvent.setup();
    render(<LandingNavigation {...defaultProps} />);
    const menuBtn = screen.getByRole("button", { name: /navigation menu/i });
    await user.click(menuBtn);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("focus returns to hamburger button on close", async () => {
    const user = userEvent.setup();
    render(<LandingNavigation {...defaultProps} />);
    const menuBtn = screen.getByRole("button", { name: /navigation menu/i });
    await user.click(menuBtn);
    await user.keyboard("{Escape}");
    expect(document.activeElement).toBe(menuBtn);
  });

  it("renders close button inside the mobile overlay", async () => {
    const user = userEvent.setup();
    render(<LandingNavigation {...defaultProps} />);
    const menuBtn = screen.getByRole("button", { name: /navigation menu/i });
    await user.click(menuBtn);
    expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument();
  });
});

describe("LandingNavigation — auth link", () => {
  it("renders sign-in link in desktop nav when authLink is provided", () => {
    render(
      <LandingNavigation
        {...defaultProps}
        authLink={{ label: "Sign in", href: "/login" }}
      />,
    );
    // Desktop nav renders the link (there are two: desktop + mobile hidden)
    const signInLinks = screen.getAllByText("Sign in");
    expect(signInLinks.length).toBeGreaterThanOrEqual(1);
    const desktopLink = signInLinks[0]!;
    expect(desktopLink.closest("a")).toHaveAttribute("href", "/login");
  });

  it("does not render auth link when authLink is not provided", () => {
    render(<LandingNavigation {...defaultProps} />);
    expect(screen.queryByText("Sign in")).not.toBeInTheDocument();
    expect(screen.queryByText("Dashboard")).not.toBeInTheDocument();
  });

  it("renders auth link in mobile overlay", async () => {
    const user = userEvent.setup();
    render(
      <LandingNavigation
        {...defaultProps}
        authLink={{ label: "Sign in", href: "/login" }}
      />,
    );
    const menuBtn = screen.getByRole("button", { name: /navigation menu/i });
    await user.click(menuBtn);
    const overlay = screen.getByRole("dialog");
    const mobileSignIn = overlay.querySelector('a[href="/login"]');
    expect(mobileSignIn).toBeInTheDocument();
    expect(mobileSignIn?.textContent).toBe("Sign in");
  });

  it("renders Dashboard link when authenticated", () => {
    render(
      <LandingNavigation
        {...defaultProps}
        authLink={{ label: "Dashboard", href: "/dashboard" }}
      />,
    );
    const dashboardLinks = screen.getAllByText("Dashboard");
    expect(dashboardLinks.length).toBeGreaterThanOrEqual(1);
    expect(dashboardLinks[0]!.closest("a")).toHaveAttribute("href", "/dashboard");
  });

  it("auth link uses subtle styling (text-muted-foreground)", () => {
    const { container } = render(
      <LandingNavigation
        {...defaultProps}
        authLink={{ label: "Sign in", href: "/login" }}
      />,
    );
    // Desktop auth link should use muted foreground for subtle appearance
    const desktopNav = container.querySelector(".lg\\:flex");
    const authAnchor = desktopNav?.querySelector('a[href="/login"]');
    expect(authAnchor?.getAttribute("class")).toContain("text-muted-foreground");
  });
});

describe("LandingNavigation — scroll behavior", () => {
  it("accepts transparent prop for hero overlay mode", () => {
    const { container } = render(
      <LandingNavigation {...defaultProps} transparent />
    );
    const nav = container.querySelector("nav");
    // When transparent, should not have solid bg class
    expect(nav?.getAttribute("class")).not.toContain("bg-background");
  });

  it("defaults to solid background when transparent is not set", () => {
    const { container } = render(<LandingNavigation {...defaultProps} />);
    const nav = container.querySelector("nav");
    expect(nav?.getAttribute("class")).toContain("bg-background");
  });
});
