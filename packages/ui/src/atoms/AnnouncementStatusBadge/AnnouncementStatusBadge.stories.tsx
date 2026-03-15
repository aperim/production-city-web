import type { Meta, StoryObj } from "@storybook/react-vite";
import { AnnouncementStatusBadge } from "./AnnouncementStatusBadge";

const meta = {
  title: "Atoms/AnnouncementStatusBadge",
  component: AnnouncementStatusBadge,
  tags: ["autodocs"],
  argTypes: {
    status: {
      control: "select",
      options: ["draft", "published", "archived"],
    },
  },
} satisfies Meta<typeof AnnouncementStatusBadge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Draft: Story = {
  args: { status: "draft" },
};

export const Published: Story = {
  args: { status: "published" },
};

export const Archived: Story = {
  args: { status: "archived" },
};
