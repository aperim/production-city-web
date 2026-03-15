import type { Meta, StoryObj } from "@storybook/react-vite";
import { SkeletonTableRow } from "./SkeletonTableRow";

const meta: Meta<typeof SkeletonTableRow> = {
  title: "Molecules/SkeletonTableRow",
  component: SkeletonTableRow,
  tags: ["autodocs"],
  argTypes: {
    columns: { control: "number" },
  },
  decorators: [
    (Story) => (
      <table className="w-full border-collapse">
        <tbody>
          <Story />
        </tbody>
      </table>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { columns: 4 },
};

export const SixColumns: Story = {
  args: { columns: 6 },
};

export const MultipleRows: StoryObj = {
  render: () => (
    <table className="w-full border-collapse">
      <tbody>
        <SkeletonTableRow columns={5} />
        <SkeletonTableRow columns={5} />
        <SkeletonTableRow columns={5} />
        <SkeletonTableRow columns={5} />
      </tbody>
    </table>
  ),
};
