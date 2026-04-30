import type { Meta, StoryObj } from "@storybook/react-vite";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { buildLocaleUrl } from "./url-utils";

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

export const URLAware: Story = {
  args: {
    onLanguageChange: (code: string) => {
      const url = buildLocaleUrl(code, "/facilities");
      console.log("Navigate to:", url);
    },
  },
};

export const URLAwareWithQueryHash: Story = {
  args: {
    onLanguageChange: (code: string) => {
      const url = buildLocaleUrl(code, "/facilities?view=map#studio-a");
      console.log("Navigate to:", url);
    },
  },
};

export const URLAwareEnglishPrefixRemoval: Story = {
  args: {
    currentLanguage: "zh",
    onLanguageChange: (code: string) => {
      const url = buildLocaleUrl(code, "/zh/facilities");
      console.log("Navigate to:", url);
    },
  },
};

export const URLAwareRTL: Story = {
  args: {
    currentLanguage: "ar",
    onLanguageChange: (code: string) => {
      const url = buildLocaleUrl(code, "/ar/contact");
      console.log("Navigate to:", url);
    },
  },
  decorators: [
    (Story) => (
      <div dir="rtl" lang="ar">
        <Story />
      </div>
    ),
  ],
};

/** Tab to the trigger to see the focus ring. Open the menu and use Arrow keys to navigate items — each item shows a focus indicator. */
export const FocusVisible: Story = {
  args: {},
};
