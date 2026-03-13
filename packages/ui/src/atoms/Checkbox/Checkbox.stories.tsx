import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Checkbox, CheckboxGroup } from "./Checkbox";

const meta = {
  title: "Atoms/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    indeterminate: { control: "boolean" },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { label: "Accept terms and conditions" },
};

export const WithDescription: Story = {
  args: {
    label: "Marketing emails",
    description: "Receive updates about new products and features",
  },
};

export const Checked: Story = {
  args: { label: "Agreed", defaultChecked: true },
};

export const Disabled: Story = {
  args: { label: "Unavailable option", disabled: true },
};

export const DisabledChecked: Story = {
  args: { label: "Already agreed", disabled: true, defaultChecked: true },
};

export const Indeterminate: Story = {
  args: { label: "Select all", indeterminate: true },
};

export const GroupBasic: StoryObj = {
  render: () => (
    <CheckboxGroup
      label="Notifications"
      options={[
        { value: "email", label: "Email notifications", description: "Daily digest" },
        { value: "sms", label: "SMS notifications" },
        { value: "push", label: "Push notifications", disabled: true },
      ]}
    />
  ),
};

export const GroupWithSelectAll: StoryObj = {
  render: () => {
    const [state, setState] = useState({ a: false, b: false, c: false });
    const options = [
      {
        value: "a",
        label: "Option A",
        checked: state.a,
        onChange: (checked: boolean) => setState((s) => ({ ...s, a: checked })),
      },
      {
        value: "b",
        label: "Option B",
        checked: state.b,
        onChange: (checked: boolean) => setState((s) => ({ ...s, b: checked })),
      },
      {
        value: "c",
        label: "Option C",
        checked: state.c,
        onChange: (checked: boolean) => setState((s) => ({ ...s, c: checked })),
      },
    ];
    return <CheckboxGroup label="Features" options={options} selectAll />;
  },
};
