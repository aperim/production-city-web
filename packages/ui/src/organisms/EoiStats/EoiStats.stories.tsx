import type { Meta, StoryObj } from "@storybook/react-vite";
import { EoiStats } from "./EoiStats";

const meta = {
  title: "Organisms/EoiStats",
  component: EoiStats,
  tags: ["autodocs"],
} satisfies Meta<typeof EoiStats>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    byCategory: { general: 12, producer: 5, creative: 8, partner: 3, investor: 2, education: 7, employment: 4 },
    byStatus: { new: 15, contacted: 10, converted: 8, archived: 8 },
    total: 41,
  },
};

export const Loading: Story = {
  args: {
    byCategory: {},
    byStatus: {},
    total: 0,
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    byCategory: {},
    byStatus: {},
    total: 0,
  },
};
