import type { Meta, StoryObj } from '@storybook/react-vite';
import { SkipNavLink } from './SkipNavLink';

const meta = {
  title: 'Atoms/SkipNavLink',
  component: SkipNavLink,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component:
          'Visually hidden link that appears on focus. Allows keyboard users to skip navigation and jump to main content. WCAG 2.4.1 Bypass Blocks.',
      },
    },
  },
} satisfies Meta<typeof SkipNavLink>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Default state — visually hidden. Tab into the story to see the link appear. */
export const Hidden: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div>
        <p className="text-sm text-muted-foreground mb-4">
          Press Tab to reveal the skip link.
        </p>
        <Story />
        <div id="main-content" tabIndex={-1} className="mt-8 p-4 border border-border rounded-sm">
          <p className="text-sm">Main content area</p>
        </div>
      </div>
    ),
  ],
};

/** Custom label and target. */
export const CustomLabel: Story = {
  args: {
    label: 'Jump to dashboard',
    targetId: 'dashboard-content',
  },
};
