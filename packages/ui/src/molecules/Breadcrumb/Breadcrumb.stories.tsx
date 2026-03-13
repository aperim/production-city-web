import type { Meta, StoryObj } from "@storybook/react-vite";
import { Breadcrumb } from "./Breadcrumb";

const meta = {
  title: "Molecules/Breadcrumb",
  component: Breadcrumb,
  tags: ["autodocs"],
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      { label: "Home", href: "/" },
      { label: "Products", href: "/products" },
      { label: "Widget Pro" },
    ],
  },
};

export const CustomSeparator: Story = {
  args: {
    items: [
      { label: "Dashboard", href: "/dashboard" },
      { label: "Settings", href: "/settings" },
      { label: "Profile" },
    ],
    separator: "›",
  },
};

export const TwoLevels: Story = {
  args: {
    items: [
      { label: "Home", href: "/" },
      { label: "About" },
    ],
  },
};

export const SingleLevel: Story = {
  args: {
    items: [{ label: "Home" }],
  },
};

export const DeepPath: Story = {
  args: {
    items: [
      { label: "Home", href: "/" },
      { label: "Library", href: "/library" },
      { label: "Category", href: "/library/category" },
      { label: "Sub-category", href: "/library/category/sub" },
      { label: "Current Page" },
    ],
  },
};
