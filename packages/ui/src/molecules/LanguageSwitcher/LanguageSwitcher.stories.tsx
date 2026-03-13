import type { Meta, StoryObj } from "@storybook/react-vite";
import { LanguageSwitcher } from "./LanguageSwitcher";

const languages = [
  { code: "en", label: "English" },
  { code: "ar", label: "العربية" },
  { code: "zh", label: "中文" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "hi", label: "हिन्दी" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Português" },
];

const meta = {
  title: "Molecules/LanguageSwitcher",
  component: LanguageSwitcher,
  tags: ["autodocs"],
  args: {
    languages,
    currentLanguage: "en",
    onLanguageChange: (code: string) => console.log("Language changed:", code),
  },
} satisfies Meta<typeof LanguageSwitcher>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ArabicSelected: Story = {
  args: { currentLanguage: "ar" },
};

export const Disabled: Story = {
  args: { disabled: true },
};

export const RTL: Story = {
  args: { currentLanguage: "ar" },
  decorators: [
    (Story) => (
      <div dir="rtl" lang="ar">
        <Story />
      </div>
    ),
  ],
};
