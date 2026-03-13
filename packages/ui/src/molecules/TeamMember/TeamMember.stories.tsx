import type { Meta, StoryObj } from "@storybook/react-vite";
import { TeamMember } from "./TeamMember";

const meta = {
  title: "Molecules/TeamMember",
  component: TeamMember,
  tags: ["autodocs"],
} satisfies Meta<typeof TeamMember>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "Jane Doe",
    role: "Creative Director",
  },
};

export const WithDescription: Story = {
  args: {
    name: "Jane Doe",
    role: "Creative Director",
    description: "20 years of experience in film and television production.",
  },
};

export const RTL: Story = {
  args: {
    name: "محمد أحمد",
    role: "المدير الإبداعي",
    description: "خبرة 20 عامًا في إنتاج الأفلام والتلفزيون.",
  },
  decorators: [
    (Story) => (
      <div dir="rtl" lang="ar">
        <Story />
      </div>
    ),
  ],
};
