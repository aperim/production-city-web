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
  { code: "ar", label: "العربية" },
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
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

export const RTL: Story = {
  args: { currentLanguage: "ar" },
  decorators: [(Story) => <div dir="rtl" lang="ar"><Story /></div>],
};
