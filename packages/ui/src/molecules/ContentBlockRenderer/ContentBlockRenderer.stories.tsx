import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContentBlockRenderer } from "./ContentBlockRenderer";
import type {
  HeaderBlock,
  TextBlock,
  ImageBlock,
  ImageTextLeftBlock,
  ImageTextRightBlock,
  SpacerBlock,
} from "../../types/announcements";

const meta = {
  title: "Molecules/ContentBlockRenderer",
  component: ContentBlockRenderer,
  tags: ["autodocs"],
  argTypes: {
    mode: { control: "select", options: ["web", "email"] },
  },
} satisfies Meta<typeof ContentBlockRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

const h1Block: HeaderBlock = { id: "1", position: 0, type: "header", level: "h1", text: "Main Heading" };
const h2Block: HeaderBlock = { id: "2", position: 1, type: "header", level: "h2", text: "Section Heading" };
const h3Block: HeaderBlock = { id: "3", position: 2, type: "header", level: "h3", text: "Subsection Heading" };

const textBlock: TextBlock = {
  id: "4", position: 3, type: "text",
  markdown: "This is a **bold** and *italic* paragraph with a [link](https://example.com).\n\nThis is a second paragraph.",
};

const longTextBlock: TextBlock = {
  id: "5", position: 4, type: "text",
  markdown: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.\n\nDuis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. **Excepteur sint occaecat** cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
};

const imageBlock: ImageBlock = {
  id: "6", position: 5, type: "image",
  src: "https://placehold.co/800x400/1a1a2e/e0e0e0?text=Studio+A", alt: "Studio A", caption: "Studio A — Main soundstage",
};

const imageNoCaptionBlock: ImageBlock = {
  id: "7", position: 6, type: "image",
  src: "https://placehold.co/800x400/1a1a2e/e0e0e0?text=Image", alt: "Example image",
};

const imageTextLeftBlock: ImageTextLeftBlock = {
  id: "8", position: 7, type: "image_text_left",
  src: "https://placehold.co/400x300/1a1a2e/e0e0e0?text=Left+Image", alt: "Left image",
  markdown: "Text appears on the **left** side of the image. This layout is useful for content that should flow alongside visual media.",
};

const imageTextRightBlock: ImageTextRightBlock = {
  id: "9", position: 8, type: "image_text_right",
  src: "https://placehold.co/400x300/1a1a2e/e0e0e0?text=Right+Image", alt: "Right image",
  markdown: "Text appears on the **right** side of the image. The image sits to the left.",
};

const spacerSm: SpacerBlock = { id: "10", position: 9, type: "spacer", size: "sm" };
const spacerMd: SpacerBlock = { id: "11", position: 10, type: "spacer", size: "md" };
const spacerLg: SpacerBlock = { id: "12", position: 11, type: "spacer", size: "lg" };

// Web mode stories
export const HeaderH1: Story = { args: { block: h1Block } };
export const HeaderH2: Story = { args: { block: h2Block } };
export const HeaderH3: Story = { args: { block: h3Block } };
export const TextShort: Story = { args: { block: textBlock } };
export const TextLong: Story = { args: { block: longTextBlock } };
export const ImageWithCaption: Story = { args: { block: imageBlock } };
export const ImageWithoutCaption: Story = { args: { block: imageNoCaptionBlock } };
export const ImageTextLeft: Story = { args: { block: imageTextLeftBlock } };
export const ImageTextRight: Story = { args: { block: imageTextRightBlock } };
export const SpacerSmall: Story = { args: { block: spacerSm } };
export const SpacerMedium: Story = { args: { block: spacerMd } };
export const SpacerLarge: Story = { args: { block: spacerLg } };

// Broken image
export const ImageNotFound: Story = {
  args: {
    block: {
      id: "13", position: 12, type: "image",
      src: "https://invalid.example.com/missing.jpg", alt: "Missing image",
    } as ImageBlock,
  },
};

// XSS attempt
export const TextWithXss: Story = {
  args: {
    block: {
      id: "14", position: 13, type: "text",
      markdown: '<script>alert("xss")</script> This text should render safely. **Bold** works.',
    } as TextBlock,
  },
};

// Email mode stories
export const EmailHeaderH1: Story = { args: { block: h1Block, mode: "email" } };
export const EmailHeaderH2: Story = { args: { block: h2Block, mode: "email" } };
export const EmailHeaderH3: Story = { args: { block: h3Block, mode: "email" } };
export const EmailText: Story = { args: { block: textBlock, mode: "email" } };
export const EmailImage: Story = { args: { block: imageBlock, mode: "email" } };
export const EmailImageTextLeft: Story = { args: { block: imageTextLeftBlock, mode: "email" } };
export const EmailImageTextRight: Story = { args: { block: imageTextRightBlock, mode: "email" } };
export const EmailSpacerSm: Story = { args: { block: spacerSm, mode: "email" } };
export const EmailSpacerMd: Story = { args: { block: spacerMd, mode: "email" } };
export const EmailSpacerLg: Story = { args: { block: spacerLg, mode: "email" } };
export const EmailImageNotFound: Story = {
  args: {
    block: {
      id: "15", position: 14, type: "image",
      src: "https://invalid.example.com/missing.jpg", alt: "Missing image",
    } as ImageBlock,
    mode: "email",
  },
};
