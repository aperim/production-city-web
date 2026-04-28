import type { Meta, StoryObj } from "@storybook/react-vite";
import { CaseStudyCard } from "./CaseStudyCard";

const meta = {
  title: "Molecules/CaseStudyCard",
  component: CaseStudyCard,
  tags: ["autodocs"],
} satisfies Meta<typeof CaseStudyCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithImageStatAndQuote: Story = {
  args: {
    title: "Marvel Studios — Virtual Production on Avengers: Secret Wars",
    imageSrc: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80",
    imageAlt: "LED volume stage with crew",
    stat: { value: "60%", label: "Fewer location shoots" },
    children: (
      <p>
        Production City's LED volume stage enabled Marvel to shoot over 80% of exterior scenes
        in-camera, dramatically reducing travel costs and carbon footprint while maintaining the
        cinematic scale audiences expect from a global blockbuster.
      </p>
    ),
    quote: {
      text: "The creative control we got from virtual production was unlike anything we'd experienced before.",
      attribution: "VFX Supervisor, Marvel Studios",
    },
  },
};

export const Minimal: Story = {
  args: {
    title: "NRMA Insurance — Brand Campaign",
    children: (
      <p>
        A nationwide brand refresh shot entirely within our Sydney facility, leveraging real-time
        LED environments to simulate Australian landscapes with zero location risk.
      </p>
    ),
  },
};

export const WithoutImage: Story = {
  args: {
    title: "Nine Network — Live Sports Broadcast Integration",
    children: (
      <>
        <p>
          Broadcast-grade production infrastructure enabled Nine Network to deliver a 14-hour live
          coverage event from a single campus, integrating multiple studios, control rooms, and
          remote feeds.
        </p>
        <p className="mt-2">
          The unified technical plant reduced inter-facility coordination overhead by an estimated 40%.
        </p>
      </>
    ),
    quote: {
      text: "Running a live event of this scale from one campus was a first for us — and it worked flawlessly.",
      attribution: "Head of Technical Operations, Nine Network",
    },
  },
};
