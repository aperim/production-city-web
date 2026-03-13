import type { Meta, StoryObj } from "@storybook/react-vite";
import { EmptyState } from "./EmptyState";

const meta = {
  title: "Molecules/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["page", "inline"] },
  },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    illustration: <span style={{ fontSize: 48 }}>📭</span>,
    title: "No messages",
    description: "When you receive messages, they will appear here.",
    action: (
      <button className="rounded-sm bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
        Compose message
      </button>
    ),
  },
};

export const Inline: Story = {
  args: {
    variant: "inline",
    illustration: <span style={{ fontSize: 32 }}>🔍</span>,
    title: "No results",
    description: "Try adjusting your search or filter.",
  },
};

export const TitleOnly: Story = {
  args: {
    title: "No data available",
  },
};

export const WithAction: Story = {
  args: {
    illustration: <span style={{ fontSize: 48 }}>📁</span>,
    title: "No projects yet",
    description: "Create your first project to get started.",
    action: (
      <button className="rounded-sm border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent">
        New project
      </button>
    ),
  },
};
