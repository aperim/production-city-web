import type { Meta, StoryObj } from "@storybook/react-vite";
import { LandingNavigation } from "./LandingNavigation";

const links = [
  { label: "Home", href: "/" },
  { label: "Facilities", href: "/facilities" },
  { label: "Creative", href: "/creative" },
  { label: "Vision", href: "/vision" },
  { label: "Community", href: "/community" },
  { label: "FAQ", href: "/faq" },
  { label: "Contact", href: "/contact" },
];

const languages = [
  { code: "en", label: "English" },
  { code: "ar", label: "\u0627\u0644\u0639\u0631\u0628\u064a\u0629" },
  { code: "zh", label: "\u4e2d\u6587" },
  { code: "ja", label: "\u65e5\u672c\u8a9e" },
];

const meta = {
  title: "Organisms/LandingNavigation",
  component: LandingNavigation,
  tags: ["autodocs"],
  args: {
    brand: "Production City",
    links,
    languages,
    currentLanguage: "en",
    onLanguageChange: (code: string) => console.log("Language:", code),
  },
} satisfies Meta<typeof LandingNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Transparent: Story = {
  args: { transparent: true },
  decorators: [(Story) => (
    <div style={{ minHeight: "200vh", background: "linear-gradient(to bottom, #1a1a2e, #16213e)" }}>
      <Story />
    </div>
  )],
};

export const WithActivePage: Story = {
  args: { activePath: "/facilities" },
};

export const WithSignIn: Story = {
  args: { authLink: { label: "Sign in", href: "/login" } },
};

export const WithDashboard: Story = {
  args: { authLink: { label: "Dashboard", href: "/dashboard" } },
};

export const TransparentWithSignIn: Story = {
  args: { transparent: true, authLink: { label: "Sign in", href: "/login" } },
  decorators: [(Story) => (
    <div style={{ minHeight: "200vh", background: "linear-gradient(to bottom, #1a1a2e, #16213e)" }}>
      <Story />
    </div>
  )],
};

export const RTL: Story = {
  args: { currentLanguage: "ar" },
  decorators: [(Story) => <div dir="rtl" lang="ar"><Story /></div>],
};
