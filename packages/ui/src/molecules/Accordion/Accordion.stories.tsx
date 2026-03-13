import type { Meta, StoryObj } from "@storybook/react-vite";
import { Accordion, type AccordionItem } from "./Accordion";

const meta = {
  title: "Molecules/Accordion",
  component: Accordion,
  tags: ["autodocs"],
  argTypes: {
    multiple: { control: "boolean" },
  },
} satisfies Meta<typeof Accordion>;

export default meta;
type Story = StoryObj<typeof meta>;

const items: AccordionItem[] = [
  {
    id: "q1",
    heading: "What is Production City?",
    content: (
      <p className="text-muted-foreground">
        Production City is a platform for managing creative production workflows.
      </p>
    ),
  },
  {
    id: "q2",
    heading: "How do I get started?",
    content: (
      <p className="text-muted-foreground">
        Sign up for an account and follow the onboarding wizard.
      </p>
    ),
  },
  {
    id: "q3",
    heading: "What integrations are available?",
    content: (
      <p className="text-muted-foreground">
        We support integrations with Slack, GitHub, and more.
      </p>
    ),
  },
];

export const Default: Story = {
  args: { items },
};

export const Multiple: Story = {
  args: {
    items,
    multiple: true,
  },
};

export const DefaultOpen: Story = {
  args: {
    items: [
      { id: "q1", heading: items[0]!.heading, content: items[0]!.content, defaultOpen: true },
      { id: "q2", heading: items[1]!.heading, content: items[1]!.content },
      { id: "q3", heading: items[2]!.heading, content: items[2]!.content },
    ],
  },
};

export const WithDisabled: Story = {
  args: {
    items: [
      { id: "q1", heading: items[0]!.heading, content: items[0]!.content },
      { id: "q2", heading: items[1]!.heading, content: items[1]!.content, disabled: true },
      { id: "q3", heading: items[2]!.heading, content: items[2]!.content },
    ],
  },
};
