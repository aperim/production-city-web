import type { Meta, StoryObj } from "@storybook/react-vite";
import { FAQSection } from "./FAQSection";

const items = [
  { question: "What is Production City?", answer: "Production City is a world-class creative campus designed for film, television, and digital content production." },
  { question: "Where is Production City located?", answer: "The primary campus is planned for Sydney, Australia, with additional locations in Singapore, Hawaii, Europe, and the USA." },
  { question: "How do I express interest?", answer: "Use the expression of interest form on our contact page to tell us about your project." },
  { question: "What facilities are available?", answer: "Production City offers sound stages, broadcast theatres, post-production suites, motion capture stages, and more." },
];

const meta = {
  title: "Organisms/FAQSection",
  component: FAQSection,
  tags: ["autodocs"],
} satisfies Meta<typeof FAQSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { heading: "Frequently Asked Questions", items },
};

export const WithSearch: Story = {
  args: { heading: "FAQ", items, searchPlaceholder: "Search questions...", emptyMessage: "No matching questions found." },
};
