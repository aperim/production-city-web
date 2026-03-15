import type { Meta, StoryObj } from "@storybook/react-vite";
import { ProfileForm } from "./ProfileForm";

const meta = {
  title: "Molecules/ProfileForm",
  component: ProfileForm,
  tags: ["autodocs"],
} satisfies Meta<typeof ProfileForm>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    defaultName: "Jane Doe",
    onSubmit: async (name: string) => {
      await new Promise((r) => setTimeout(r, 500));
      console.log("Saved:", name);
    },
  },
};

export const Empty: Story = {
  args: {
    defaultName: "",
    onSubmit: async () => {
      await new Promise((r) => setTimeout(r, 500));
    },
  },
};

export const WithError: Story = {
  args: {
    defaultName: "Jane Doe",
    onSubmit: async () => {
      await new Promise((r) => setTimeout(r, 300));
      throw new Error("Failed to update profile");
    },
  },
};

export const Saving: Story = {
  args: {
    defaultName: "Jane Doe",
    onSubmit: () => new Promise(() => {}), // never resolves
  },
};
