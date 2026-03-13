import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LandingPageTemplate } from "./LandingPageTemplate";

const navProps = {
  brand: "Production City",
  links: [{ label: "Home", href: "/" }],
  languages: [{ code: "en", label: "English" }],
  currentLanguage: "en",
  onLanguageChange: () => {},
};

const footerProps = {
  linkGroups: [{ heading: "Explore", links: [{ label: "About", href: "/about" }] }],
  legalText: {
    copyright: "\u00a9 2026 Aperim Pty Ltd.",
    trademark: "Production City\u2122",
    acknowledgement: "We acknowledge Traditional Owners.",
  },
  contactInfo: { email: "hello@productioncity.com", phoneAU: "+61 7 1234 5678", phoneUS: "+1 555 123 4567" },
  legalLinks: [{ label: "Privacy", href: "/privacy" }],
  languages: [{ code: "en", label: "English" }],
  currentLanguage: "en",
  onLanguageChange: () => {},
};

describe("LandingPageTemplate", () => {
  it("renders skip-to-content link", () => {
    render(
      <LandingPageTemplate nav={navProps} footer={footerProps}>
        <p>Content</p>
      </LandingPageTemplate>
    );
    const skipLink = screen.getByText("Skip to main content");
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute("href", "#main-content");
  });

  it("renders navigation", () => {
    render(
      <LandingPageTemplate nav={navProps} footer={footerProps}>
        <p>Content</p>
      </LandingPageTemplate>
    );
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("renders main content", () => {
    render(
      <LandingPageTemplate nav={navProps} footer={footerProps}>
        <p>Page content here</p>
      </LandingPageTemplate>
    );
    expect(screen.getByText("Page content here")).toBeInTheDocument();
  });

  it("wraps content in main element with id", () => {
    render(
      <LandingPageTemplate nav={navProps} footer={footerProps}>
        <p>Content</p>
      </LandingPageTemplate>
    );
    const main = screen.getByRole("main");
    expect(main).toHaveAttribute("id", "main-content");
  });

  it("renders footer", () => {
    render(
      <LandingPageTemplate nav={navProps} footer={footerProps}>
        <p>Content</p>
      </LandingPageTemplate>
    );
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("uses max-width container per Uncodixify", () => {
    const { container } = render(
      <LandingPageTemplate nav={navProps} footer={footerProps}>
        <p>Content</p>
      </LandingPageTemplate>
    );
    const mainContent = container.querySelector("main > div");
    expect(mainContent?.getAttribute("class")).toContain("max-w-");
  });
});
