import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { RadioGroup } from "./RadioGroup";

const meta = {
  title: "Atoms/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  argTypes: {
    orientation: { control: "select", options: ["vertical", "horizontal"] },
    disabled: { control: "boolean" },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const sizeOptions = [
  { value: "sm", label: "Small", description: "Ideal for mobile views" },
  { value: "md", label: "Medium", description: "Best for most use cases" },
  { value: "lg", label: "Large", description: "For high-density displays" },
];

export const Vertical: Story = {
  args: { label: "Size", options: sizeOptions, defaultValue: "md" },
};

export const Horizontal: Story = {
  args: { label: "Size", options: sizeOptions, orientation: "horizontal", defaultValue: "md" },
};

export const Controlled: StoryObj = {
  render: () => {
    const [value, setValue] = useState("md");
    return (
      <div>
        <RadioGroup
          label="Size"
          options={sizeOptions}
          value={value}
          onValueChange={setValue}
        />
        <p className="mt-2 text-sm text-muted-foreground">Selected: {value}</p>
      </div>
    );
  },
};

export const Disabled: Story = {
  args: { label: "Size", options: sizeOptions, disabled: true, defaultValue: "md" },
};

export const WithDisabledOption: Story = {
  args: {
    label: "Plan",
    options: [
      { value: "free", label: "Free", description: "Up to 3 projects" },
      { value: "pro", label: "Pro", description: "Unlimited projects" },
      { value: "enterprise", label: "Enterprise", description: "Contact sales", disabled: true },
    ],
    defaultValue: "free",
  },
};
