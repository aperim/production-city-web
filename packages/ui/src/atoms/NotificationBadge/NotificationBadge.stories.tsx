import type { Meta, StoryObj } from "@storybook/react-vite";
import { NotificationBadge } from "./NotificationBadge";

const meta = {
  title: "Atoms/NotificationBadge",
  component: NotificationBadge,
  tags: ["autodocs"],
  argTypes: {
    count: { control: "number" },
  },
} satisfies Meta<typeof NotificationBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const SingleDigit: Story = {
  args: { count: 3 },
};

export const DoubleDigit: Story = {
  args: { count: 42 },
};

export const Capped: Story = {
  args: { count: 150 },
};

export const Empty: Story = {
  args: { count: 0 },
};

export const AllStates: StoryObj = {
  render: () => (
    <div className="flex items-center gap-4">
      <NotificationBadge count={1} />
      <NotificationBadge count={9} />
      <NotificationBadge count={99} />
      <NotificationBadge count={100} />
    </div>
  ),
};
