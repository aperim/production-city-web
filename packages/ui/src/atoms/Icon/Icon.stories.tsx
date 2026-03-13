import type { Meta, StoryObj } from "@storybook/react-vite";
import { Icon } from "./Icon";

const HomeSvg = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="100%" height="100%">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const meta = {
  title: "Atoms/Icon",
  component: Icon,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg", "xl"] },
    label: { control: "text" },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Decorative: Story = {
  args: { children: <HomeSvg /> },
};

export const Meaningful: Story = {
  args: { children: <HomeSvg />, label: "Home" },
};

export const AllSizes: StoryObj = {
  render: () => (
    <div className="flex items-center gap-4">
      <Icon size="sm"><HomeSvg /></Icon>
      <Icon size="md"><HomeSvg /></Icon>
      <Icon size="lg"><HomeSvg /></Icon>
      <Icon size="xl"><HomeSvg /></Icon>
    </div>
  ),
};
