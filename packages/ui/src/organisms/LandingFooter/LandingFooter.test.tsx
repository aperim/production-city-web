import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LandingFooter } from "./LandingFooter";

const defaultProps = {
  linkGroups: [
    {
      heading: "Explore",
      links: [
        { label: "Facilities", href: "/facilities" },
        { label: "Creative", href: "/creative" },
      ],
    },
  ],
  legalText: {
    copyright: "\u00a9 2026 Aperim Pty Ltd. All rights reserved.",
    trademark: "Production City\u2122 is a trademark of Aperim Pty Ltd.",
    acknowledgement: "We acknowledge the Traditional Owners of the land.",
  },
  contactInfo: {
    email: "hello@productioncity.com",
    phoneAU: "+61 7 1234 5678",
    phoneUS: "+1 (555) 123-4567",
  },
  legalLinks: [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Use", href: "/terms" },
  ],
  languages: [
    { code: "en", label: "English" },
    { code: "ar", label: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629" },
  ],
  currentLanguage: "en",
  onLanguageChange: () => {},
};

describe("LandingFooter", () => {
  it("renders footer landmark", () => {
    render(<LandingFooter {...defaultProps} />);
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("renders navigation link groups", () => {
    render(<LandingFooter {...defaultProps} />);
    expect(screen.getByText("Explore")).toBeInTheDocument();
    expect(screen.getByText("Facilities")).toBeInTheDocument();
  });

  it("renders copyright text", () => {
    render(<LandingFooter {...defaultProps} />);
    expect(screen.getByText(/All rights reserved/)).toBeInTheDocument();
  });

  it("renders trademark text", () => {
    render(<LandingFooter {...defaultProps} />);
    expect(screen.getByText(/trademark/)).toBeInTheDocument();
  });

  it("renders contact info", () => {
    render(<LandingFooter {...defaultProps} />);
    expect(screen.getByText("hello@productioncity.com")).toBeInTheDocument();
  });

  it("renders legal links", () => {
    render(<LandingFooter {...defaultProps} />);
    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
    expect(screen.getByText("Terms of Use")).toBeInTheDocument();
  });

  it("renders language switcher", () => {
    render(<LandingFooter {...defaultProps} />);
    expect(screen.getByRole("button", { name: /language/i })).toBeInTheDocument();
  });

  it("merges custom className", () => {
    const { container } = render(<LandingFooter {...defaultProps} className="custom" />);
    expect(container.firstElementChild?.getAttribute("class")).toContain("custom");
  });
});
