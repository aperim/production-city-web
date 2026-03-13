import type { Meta, StoryObj } from "@storybook/react-vite";
import { SectionDivider } from "./SectionDivider";

const meta: Meta<typeof SectionDivider> = {
  title: "Atoms/SectionDivider",
  component: SectionDivider,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["line", "spacing-only", "with-accent"],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: "1rem" }}>
        <p>Content above divider</p>
        <Story />
        <p>Content below divider</p>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Line: Story = {
  args: { variant: "line" },
};

export const SpacingOnly: Story = {
  args: { variant: "spacing-only" },
};

export const WithAccent: Story = {
  args: { variant: "with-accent" },
};

export const RTL: Story = {
  args: { variant: "line" },
  decorators: [
    (Story) => (
      <div dir="rtl" lang="ar">
        <Story />
      </div>
    ),
  ],
};
