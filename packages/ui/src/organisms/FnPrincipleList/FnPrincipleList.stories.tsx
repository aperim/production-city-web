import type { Meta, StoryObj } from "@storybook/react-vite";
import { FnPrincipleList } from "./FnPrincipleList";

const meta = {
  title: "Organisms/FnPrincipleList",
  component: FnPrincipleList,
  tags: ["autodocs"],
  parameters: {
    layout: "padded",
  },
} satisfies Meta<typeof FnPrincipleList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    items: [
      {
        number: "01",
        children: (
          <>
            <strong style={{ color: "var(--ochre)", fontWeight: 500 }}>
              Free, prior, and informed consent
            </strong>{" "}
            is embedded in how we handle material from or referencing First Nations communities.
          </>
        ),
      },
      {
        number: "02",
        children: (
          <>
            <strong style={{ color: "var(--ochre)", fontWeight: 500 }}>
              Provenance is tracked end-to-end.
            </strong>{" "}
            The origin of training data, reference material, captured performance, and derived assets is recorded and auditable.
          </>
        ),
      },
      {
        number: "03",
        children: (
          <>
            <strong style={{ color: "var(--ochre)", fontWeight: 500 }}>
              Cultural safety protocols
            </strong>{" "}
            are built into production workflows, including virtual production, motion capture, and generative tools.
          </>
        ),
      },
      {
        number: "04",
        children: (
          <>
            <strong style={{ color: "var(--ochre)", fontWeight: 500 }}>
              Benefit remains with the people a story comes from
            </strong>{" "}
            — agreements keep recognition and benefit with communities, not the production company by default.
          </>
        ),
      },
    ],
  },
};

export const SinglePrinciple: Story = {
  args: {
    items: [
      {
        number: "01",
        children: (
          <>
            <strong style={{ color: "var(--ochre)", fontWeight: 500 }}>Free, prior, and informed consent</strong>{" "}
            is embedded in how we handle material from or referencing First Nations communities.
          </>
        ),
      },
    ],
  },
};
