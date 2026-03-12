import type { Meta, StoryObj } from "@storybook/react-vite";
import { HoldingPage } from "./HoldingPage";

const meta = {
  title: "Templates/HoldingPage",
  component: HoldingPage,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof HoldingPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
