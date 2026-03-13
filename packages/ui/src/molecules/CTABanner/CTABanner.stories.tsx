import type { Meta, StoryObj } from "@storybook/react-vite";
import { CTABanner } from "./CTABanner";

const meta = {
  title: "Molecules/CTABanner",
  component: CTABanner,
  tags: ["autodocs"],
} satisfies Meta<typeof CTABanner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inline: Story = {
  args: {
    heading: "Interested in Production City?",
    subtext: "Register your expression of interest today.",
    buttonLabel: "Get in Touch",
    buttonHref: "#contact",
  },
};

export const Footer: Story = {
  args: {
    heading: "Ready to start?",
    subtext: "We'd love to hear from you.",
    buttonLabel: "Contact Us",
    variant: "footer",
  },
};

export const Compact: Story = {
  args: {
    heading: "Learn more",
    buttonLabel: "View Facilities",
    compact: true,
  },
};

export const RTL: Story = {
  args: {
    heading: "مهتم بمدينة الإنتاج؟",
    subtext: "سجل اهتمامك اليوم.",
    buttonLabel: "تواصل معنا",
  },
  decorators: [
    (Story) => (
      <div dir="rtl" lang="ar">
        <Story />
      </div>
    ),
  ],
};
