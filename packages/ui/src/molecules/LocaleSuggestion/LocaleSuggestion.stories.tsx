import type { Meta, StoryObj } from "@storybook/react-vite";
import { LocaleSuggestion } from "./LocaleSuggestion";

const meta: Meta<typeof LocaleSuggestion> = {
  title: "Molecules/LocaleSuggestion",
  component: LocaleSuggestion,
  tags: ["autodocs"],
  args: {
    currentLocale: "en",
    onAccept: (locale: string) => console.log("Accepted locale:", locale),
    onDismiss: () => console.log("Dismissed"),
  },
  decorators: [
    (Story) => (
      <div style={{ minHeight: 200, position: "relative" }}>
        <p style={{ padding: "1rem" }}>Page content behind the suggestion banner.</p>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

/** Chinese suggestion on English page. */
export const ChineseSuggestion: Story = {
  args: {
    suggestedLocale: "zh",
    currentLocale: "en",
  },
};

/** Arabic suggestion — RTL variant. */
export const ArabicSuggestionRTL: Story = {
  args: {
    suggestedLocale: "ar",
    currentLocale: "en",
  },
};

/** Japanese suggestion. */
export const JapaneseSuggestion: Story = {
  args: {
    suggestedLocale: "ja",
    currentLocale: "en",
  },
};

/** Dismissed state — not visible. */
export const Dismissed: Story = {
  args: {
    suggestedLocale: "zh",
    currentLocale: "en",
    dismissed: true,
  },
};

/** Same locale — not visible. */
export const SameLocale: Story = {
  args: {
    suggestedLocale: "en",
    currentLocale: "en",
  },
};

/** No suggestion — not visible. */
export const NoSuggestion: Story = {
  args: {
    suggestedLocale: null,
    currentLocale: "en",
  },
};
