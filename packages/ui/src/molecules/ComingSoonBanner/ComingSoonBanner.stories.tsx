import type { Meta, StoryObj } from '@storybook/react-vite';
import { ComingSoonBanner } from './ComingSoonBanner';

const meta: Meta<typeof ComingSoonBanner> = {
  title: 'Molecules/ComingSoonBanner',
  component: ComingSoonBanner,
};
export default meta;
type Story = StoryObj<typeof ComingSoonBanner>;

export const Idle: Story = {
  args: {
    status: 'coming_soon',
    targetQuarter: 'Q3 2026',
    featureId: 'productions.shooting.shoot_scheduling',
    subscribeState: 'idle',
  },
};

export const Submitting: Story = {
  args: {
    status: 'coming_soon',
    targetQuarter: 'Q3 2026',
    featureId: 'productions.shooting.shoot_scheduling',
    subscribeState: 'submitting',
  },
};

export const Subscribed: Story = {
  args: {
    status: 'coming_soon',
    targetQuarter: 'Q3 2026',
    featureId: 'productions.shooting.shoot_scheduling',
    subscribeState: 'subscribed',
  },
};

export const Error: Story = {
  args: {
    status: 'coming_soon',
    targetQuarter: 'Q3 2026',
    featureId: 'productions.shooting.shoot_scheduling',
    subscribeState: 'error',
  },
};

export const Planned: Story = {
  args: {
    status: 'planned',
    targetQuarter: null,
    featureId: 'productions.vfx.compositing',
    subscribeState: 'idle',
  },
};
