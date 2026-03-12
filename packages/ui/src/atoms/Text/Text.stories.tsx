import type { Meta, StoryObj } from "@storybook/react-vite";
import { Text } from "./Text";

const meta = {
  title: "Atoms/Text",
  component: Text,
  tags: ["autodocs"],
  argTypes: {
    as: {
      control: "select",
      options: ["h1", "h2", "h3", "h4", "p", "span", "caption"],
    },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Heading1: Story = {
  args: { as: "h1", children: "Heading 1" },
};

export const Heading2: Story = {
  args: { as: "h2", children: "Heading 2" },
};

export const Heading3: Story = {
  args: { as: "h3", children: "Heading 3" },
};

export const Heading4: Story = {
  args: { as: "h4", children: "Heading 4" },
};

export const Paragraph: Story = {
  args: { as: "p", children: "This is a paragraph of body text." },
};

export const Span: Story = {
  args: { as: "span", children: "Inline text" },
};

export const Caption: Story = {
  args: { as: "caption", children: "Caption text" },
  decorators: [
    (Story) => (
      <table>
        <Story />
        <tbody>
          <tr>
            <td>Sample data</td>
          </tr>
        </tbody>
      </table>
    ),
  ],
};

export const DefaultElement: Story = {
  args: { children: "Default renders as a paragraph" },
};

export const WithClassName: Story = {
  args: { as: "p", children: "Custom styled text", className: "text-destructive" },
};
