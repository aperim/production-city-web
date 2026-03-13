import type { Meta, StoryObj } from "@storybook/react-vite";
import { FAQItem } from "./FAQItem";

const meta = {
  title: "Molecules/FAQItem",
  component: FAQItem,
  tags: ["autodocs"],
} satisfies Meta<typeof FAQItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Collapsed: Story = {
  args: {
    question: "What is Production City?",
    answer: "Production City is a world-class creative campus designed for film, television, and digital content production.",
  },
};

export const Expanded: Story = {
  args: {
    question: "Where is Production City located?",
    answer: "The primary campus is planned for Queensland, Australia, with additional locations in Singapore, Hawaii, Europe, and the USA.",
    defaultOpen: true,
  },
};

export const RTL: Story = {
  args: {
    question: "ما هي مدينة الإنتاج؟",
    answer: "مدينة الإنتاج هي حرم إبداعي عالمي مصمم لإنتاج الأفلام والتلفزيون والمحتوى الرقمي.",
  },
  decorators: [
    (Story) => (
      <div dir="rtl" lang="ar">
        <Story />
      </div>
    ),
  ],
};
