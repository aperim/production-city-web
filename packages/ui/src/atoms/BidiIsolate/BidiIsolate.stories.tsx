import type { Meta, StoryObj } from "@storybook/react-vite";
import { BidiIsolate } from "./BidiIsolate";

const meta = {
  title: "Atoms/BidiIsolate",
  component: BidiIsolate,
  tags: ["autodocs"],
  args: {
    children: "Hello World",
  },
} satisfies Meta<typeof BidiIsolate>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LTRContentInRTLContext: Story = {
  args: { children: "Production City", dir: "ltr" },
  decorators: [
    (Story) => (
      <div dir="rtl" lang="ar" style={{ fontFamily: "sans-serif" }}>
        <p>
          مرحبًا بكم في <Story />
        </p>
      </div>
    ),
  ],
};

export const PhoneNumberInRTL: Story = {
  args: { children: "+1-555-0100", dir: "ltr" },
  decorators: [
    (Story) => (
      <div dir="rtl" lang="ar" style={{ fontFamily: "sans-serif" }}>
        <p>
          اتصل بنا على <Story />
        </p>
      </div>
    ),
  ],
};

export const URLInRTL: Story = {
  args: { children: "https://production.city", dir: "ltr" },
  decorators: [
    (Story) => (
      <div dir="rtl" lang="ar" style={{ fontFamily: "sans-serif" }}>
        <p>
          تفضل بزيارة <Story />
        </p>
      </div>
    ),
  ],
};

export const BrandNameInRTL: Story = {
  args: { children: "Production City", dir: "ltr" },
  decorators: [
    (Story) => (
      <div dir="rtl" lang="ar" style={{ fontFamily: "sans-serif" }}>
        <p>
          <Story /> هو مركز الإبداع
        </p>
      </div>
    ),
  ],
};

export const AutoDirection: Story = {
  args: { children: "Auto-detected direction" },
};

export const NestedBidiIsolate: Story = {
  render: () => (
    <div dir="rtl" lang="ar" style={{ fontFamily: "sans-serif" }}>
      <p>
        <BidiIsolate dir="ltr">
          Call <BidiIsolate dir="ltr">+1-555-0100</BidiIsolate> today
        </BidiIsolate>
      </p>
    </div>
  ),
};

export const EmptyChildren: Story = {
  args: { children: "" },
};

export const LongLTRString: Story = {
  args: {
    children: "A".repeat(200),
    dir: "ltr",
  },
  decorators: [
    (Story) => (
      <div dir="rtl" lang="ar" style={{ fontFamily: "sans-serif", maxWidth: "400px" }}>
        <p>
          نص طويل: <Story />
        </p>
      </div>
    ),
  ],
};

export const TextOverflowEllipsis: Story = {
  args: {
    children: "This is a very long text that should be truncated with ellipsis when it overflows its container",
    dir: "ltr",
    className: "overflow-hidden text-ellipsis whitespace-nowrap",
  },
  decorators: [
    (Story) => (
      <div dir="rtl" lang="ar" style={{ fontFamily: "sans-serif", maxWidth: "200px" }}>
        <p style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          <Story />
        </p>
      </div>
    ),
  ],
};
