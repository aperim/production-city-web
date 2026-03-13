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
  { code: "ar", label: "العربية" },
];

describe("LandingNavigation", () => {
  it("renders brand text", () => {
    render(
      <LandingNavigation
        brand="Production City"
        links={defaultLinks}
        languages={languages}
        currentLanguage="en"
        onLanguageChange={() => {}}
      />
    );
    expect(screen.getByText("Production City")).toBeInTheDocument();
  });

  it("renders all navigation links", () => {
    render(
      <LandingNavigation
        brand="Production City"
        links={defaultLinks}
        languages={languages}
        currentLanguage="en"
        onLanguageChange={() => {}}
      />
    );
    for (const link of defaultLinks) {
      expect(screen.getByText(link.label)).toBeInTheDocument();
    }
  });

  it("renders navigation landmark", () => {
    render(
      <LandingNavigation
        brand="Production City"
        links={defaultLinks}
        languages={languages}
        currentLanguage="en"
        onLanguageChange={() => {}}
      />
    );
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("renders mobile menu button", () => {
    render(
      <LandingNavigation
        brand="Production City"
        links={defaultLinks}
        languages={languages}
        currentLanguage="en"
        onLanguageChange={() => {}}
      />
    );
    expect(screen.getByRole("button", { name: /navigation menu/i })).toBeInTheDocument();
  });

  it("toggles mobile menu on button click", async () => {
    const user = userEvent.setup();
    render(
      <LandingNavigation
        brand="Production City"
        links={defaultLinks}
        languages={languages}
        currentLanguage="en"
        onLanguageChange={() => {}}
      />
    );
    const menuBtn = screen.getByRole("button", { name: /navigation menu/i });
    await user.click(menuBtn);
    expect(menuBtn).toHaveAttribute("aria-expanded", "true");
  });

  it("renders language switcher", () => {
    render(
      <LandingNavigation
        brand="Production City"
        links={defaultLinks}
        languages={languages}
        currentLanguage="en"
        onLanguageChange={() => {}}
      />
    );
    expect(screen.getByRole("button", { name: /language/i })).toBeInTheDocument();
  });

  it("has simple border-bottom styling per Uncodixify", () => {
    const { container } = render(
      <LandingNavigation
        brand="Production City"
        links={defaultLinks}
        languages={languages}
        currentLanguage="en"
        onLanguageChange={() => {}}
      />
    );
    const nav = container.querySelector("nav");
    expect(nav?.getAttribute("class")).toContain("border-b");
  });
});
