import type { Meta, StoryObj } from "@storybook/react-vite";

function ThemePreview() {
  return (
    <section className="guide-page">
      <div className="guide-page__section">
        <h2>Theme preview</h2>
        <p>Use the toolbar toggle to confirm light and dark token swaps on shared documentation surfaces.</p>
      </div>
    </section>
  );
}

const meta = {
  title: "Primitives/ThemePreview",
  component: ThemePreview,
  tags: ["autodocs"],
} satisfies Meta<typeof ThemePreview>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
