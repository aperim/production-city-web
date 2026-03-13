import type { Meta, StoryObj } from "@storybook/react-vite";
import { LandingPageTemplate } from "./LandingPageTemplate";

const navProps = {
  brand: "Production City",
  links: [
    { label: "Home", href: "/" },
    { label: "Facilities", href: "/facilities" },
    { label: "Creative", href: "/creative" },
    { label: "Vision", href: "/vision" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ],
  languages: [
    { code: "en", label: "English" },
    { code: "ar", label: "العربية" },
  ],
  currentLanguage: "en",
  onLanguageChange: (code: string) => console.log("Language:", code),
};

const footerProps = {
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
    acknowledgement: "We acknowledge the Traditional Owners.",
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
    { code: "ar", label: "العربية" },
  ],
  currentLanguage: "en",
  onLanguageChange: (code: string) => console.log("Language:", code),
};

const meta = {
  title: "Templates/LandingPageTemplate",
  component: LandingPageTemplate,
  tags: ["autodocs"],
  parameters: { layout: "fullscreen" },
  args: { nav: navProps, footer: footerProps },
} satisfies Meta<typeof LandingPageTemplate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <div style={{ padding: "2rem 0" }}>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>Welcome to Production City</h1>
        <p style={{ marginTop: "0.5rem", color: "var(--color-muted-foreground)" }}>
          World-class creative campus for film, television, and digital content.
        </p>
      </div>
    ),
  },
};
