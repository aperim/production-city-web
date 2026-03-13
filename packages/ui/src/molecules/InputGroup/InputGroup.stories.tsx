import type { Meta, StoryObj } from "@storybook/react-vite";
import { InputGroup } from "./InputGroup";

const meta = {
  title: "Molecules/InputGroup",
  component: InputGroup,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    error: { control: "boolean" },
  },
} satisfies Meta<typeof InputGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithPrefix: Story = {
  args: {
    prefix: "$",
    placeholder: "0.00",
  },
};

export const WithSuffix: Story = {
  args: {
    suffix: ".com",
    placeholder: "yourdomain",
  },
};

export const WithBoth: Story = {
  args: {
    prefix: "https://",
    suffix: "/path",
    placeholder: "example",
  },
};

export const ClickableSuffix: Story = {
  args: {
    placeholder: "Search...",
    suffix: "Go",
    onSuffixClick: () => alert("Search clicked"),
    suffixLabel: "Execute search",
  },
};

export const ErrorState: Story = {
  args: {
    prefix: "@",
    placeholder: "username",
    error: true,
  },
};

export const SmallSize: Story = {
  args: {
    prefix: "$",
    placeholder: "Amount",
    size: "sm",
  },
};

export const LargeSize: Story = {
  args: {
    prefix: "$",
    placeholder: "Amount",
    size: "lg",
  },
};
