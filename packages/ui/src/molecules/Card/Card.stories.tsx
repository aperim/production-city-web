import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card } from "./Card";

const meta = {
  title: "Molecules/Card",
  component: Card,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["default", "outlined", "elevated", "interactive"] },
    asButton: { control: "boolean" },
  },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: (
      <>
        <Card.Header>
          <span className="font-medium text-sm">Card title</span>
          <span className="text-xs text-muted-foreground">Optional subtitle</span>
        </Card.Header>
        <Card.Body>
          <p className="text-sm text-muted-foreground">Card body content goes here.</p>
        </Card.Body>
        <Card.Footer>
          <button className="text-sm text-primary">Action</button>
        </Card.Footer>
      </>
    ),
  },
};

export const Elevated: Story = {
  args: {
    variant: "elevated",
    children: (
      <Card.Body>
        <p className="text-sm">Elevated card with shadow.</p>
      </Card.Body>
    ),
  },
};

export const Interactive: Story = {
  args: {
    asButton: true,
    children: (
      <Card.Body>
        <p className="text-sm">Click me — I am interactive.</p>
      </Card.Body>
    ),
    onClick: () => alert("Card clicked"),
  },
};

export const WithMedia: Story = {
  args: {
    children: (
      <>
        <Card.Media>
          <div className="h-32 bg-muted flex items-center justify-center text-sm text-muted-foreground">
            Media placeholder
          </div>
        </Card.Media>
        <Card.Body>
          <p className="text-sm font-medium">Card with media</p>
        </Card.Body>
      </>
    ),
  },
};

export const BodyOnly: Story = {
  args: {
    children: (
      <Card.Body>
        <p className="text-sm text-muted-foreground">Simple card with only a body section.</p>
      </Card.Body>
    ),
  },
};
