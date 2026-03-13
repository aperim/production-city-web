import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tag } from "./Tag";

const meta = {
  title: "Molecules/Tag",
  component: Tag,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["default", "primary", "success", "warning", "error"] },
    size: { control: "select", options: ["sm", "md"] },
  },
} satisfies Meta<typeof Tag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { label: "React" } };
export const Primary: Story = { args: { label: "Featured", variant: "primary" } };
export const Success: Story = { args: { label: "Published", variant: "success" } };
export const Warning: Story = { args: { label: "Pending", variant: "warning" } };
export const Error: Story = { args: { label: "Failed", variant: "error" } };

export const Removable: Story = {
  args: {
    label: "TypeScript",
    onRemove: () => alert("Remove clicked"),
  },
};

export const WithIcon: Story = {
  args: {
    label: "Verified",
    icon: "✓",
    variant: "success",
  },
};

export const Selectable: Story = {
  args: {
    label: "JavaScript",
    onSelect: () => alert("Selected"),
    selected: false,
  },
};

export const Small: Story = {
  args: { label: "Tag", size: "sm" },
};

export const TagGroup: StoryObj = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Tag label="React" variant="default" onRemove={() => {}} />
      <Tag label="TypeScript" variant="primary" onRemove={() => {}} />
      <Tag label="Deployed" variant="success" />
      <Tag label="Review" variant="warning" />
      <Tag label="Failed" variant="error" />
    </div>
  ),
};
