import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatementBlock } from "./StatementBlock";

const meta = {
  title: "Organisms/StatementBlock",
  component: StatementBlock,
  tags: ["autodocs"],
  args: {
    text: "Where stories come to life",
  },
} satisfies Meta<typeof StatementBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const WithAttribution: Story = {
  args: {
    text: "Innovation through craft, technology, and collaboration",
    attribution: "Production City Vision Statement",
  },
};

export const PrimaryAccent: Story = {
  args: {
    text: "Building the future of production",
    accent: "primary",
  },
};

export const SecondaryAccent: Story = {
  args: {
    text: "Creative energy meets technical excellence",
    accent: "secondary",
  },
};
