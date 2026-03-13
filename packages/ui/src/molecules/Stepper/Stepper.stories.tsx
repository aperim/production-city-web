import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stepper, type StepItem } from "./Stepper";

const meta = {
  title: "Molecules/Stepper",
  component: Stepper,
  tags: ["autodocs"],
  argTypes: {
    orientation: { control: "select", options: ["horizontal", "vertical"] },
  },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

const baseSteps: StepItem[] = [
  { id: "s1", label: "Account setup", status: "completed" },
  { id: "s2", label: "Personal details", status: "active" },
  { id: "s3", label: "Payment", status: "pending" },
  { id: "s4", label: "Confirm", status: "pending" },
];

export const Default: Story = {
  args: { steps: baseSteps },
};

export const Vertical: Story = {
  args: {
    steps: baseSteps,
    orientation: "vertical",
  },
};

export const WithDescriptions: Story = {
  args: {
    steps: [
      { id: "s1", label: "Account", description: "Create your account", status: "completed" },
      { id: "s2", label: "Profile", description: "Add your details", status: "active" },
      { id: "s3", label: "Done", description: "Review and confirm", status: "pending" },
    ],
  },
};

export const WithError: Story = {
  args: {
    steps: [
      { id: "s1", label: "Upload", status: "completed" },
      { id: "s2", label: "Process", status: "error" },
      { id: "s3", label: "Complete", status: "pending" },
    ],
  },
};

export const Interactive: StoryObj = {
  render: () => {
    const [activeIndex, setActiveIndex] = useState(1);
    const steps: StepItem[] = [
      { id: "s1", label: "Step 1", status: activeIndex > 0 ? "completed" : "active" },
      { id: "s2", label: "Step 2", status: activeIndex === 1 ? "active" : activeIndex > 1 ? "completed" : "pending" },
      { id: "s3", label: "Step 3", status: activeIndex === 2 ? "active" : "pending" },
    ];
    return (
      <Stepper
        steps={steps}
        onStepClick={(id) => {
          const idx = steps.findIndex((s) => s.id === id);
          setActiveIndex(idx);
        }}
      />
    );
  },
};
