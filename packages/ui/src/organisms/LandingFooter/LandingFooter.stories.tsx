import type { Meta, StoryObj } from "@storybook/react-vite";
import { LandingFooter } from "./LandingFooter";

const meta = {
  title: "Organisms/LandingFooter",
  component: LandingFooter,
  tags: ["autodocs"],
  args: {
    linkGroups: [
      {
        heading: "Explore",
        links: [
          { label: "Facilities", href: "/facilities" },
          { label: "Creative", href: "/creative" },
          { label: "Vision", href: "/vision" },
        ],
      },
      {
        heading: "Community",
        links: [
          { label: "FAQ", href: "/faq" },
          { label: "Community", href: "/community" },
          { label: "Contact", href: "/contact" },
        ],
      },
    ],
    legalText: {
      copyright: "\u00a9 2026 Aperim Pty Ltd. All rights reserved.",
      trademark: "Production City\u2122 is a trademark of Aperim Pty Ltd.",
      acknowledgement: "We acknowledge the Traditional Owners of the land on which we operate.",
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
    onLanguageChange: (code: string) => console.log("Language:", code),
  },
} satisfies Meta<typeof LandingFooter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const RTL: Story = {
  args: { currentLanguage: "ar" },
  decorators: [(Story) => <div dir="rtl" lang="ar"><Story /></div>],
};
