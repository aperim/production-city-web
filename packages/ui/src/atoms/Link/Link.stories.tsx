import type { Meta, StoryObj } from "@storybook/react-vite";
import { Link } from "./Link";

const meta = {
  title: "Atoms/Link",
  component: Link,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["inline", "standalone", "external"] },
    external: { control: "boolean" },
    href: { control: "text" },
  },
} satisfies Meta<typeof Link>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Inline: Story = {
  args: { children: "documentation", href: "/docs" },
  render: () => (
    <p className="text-sm">
      Visit our <Link href="/docs">documentation</Link> to learn more.
    </p>
  ),
};

export const Standalone: Story = {
  args: { href: "/about", variant: "standalone", children: "Learn more about us" },
};

export const External: Story = {
  args: { href: "https://example.com", variant: "external", children: "Visit Example.com" },
};

export const Mailto: Story = {
  args: { href: "mailto:hello@example.com", children: "Email us" },
};

export const Tel: Story = {
  args: { href: "tel:+1800555000", children: "+1 800 555 000" },
};

export const BlockedJavascript: Story = {
  name: "Blocked: javascript: scheme",
  args: { href: "javascript:alert(1)", children: "This should not execute JS" },
};
