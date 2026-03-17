import type { Meta, StoryObj } from '@storybook/react-vite';
import { WireframePreview, WIREFRAME_TYPES } from './WireframePreview';

const meta: Meta<typeof WireframePreview> = {
  title: 'Molecules/WireframePreview',
  component: WireframePreview,
  argTypes: {
    type: { control: 'select', options: [...WIREFRAME_TYPES] },
  },
};
export default meta;
type Story = StoryObj<typeof WireframePreview>;

export const Board: Story = { args: { type: 'board' } };
export const Calendar: Story = { args: { type: 'calendar' } };
export const Table: Story = { args: { type: 'table' } };
export const Timeline: Story = { args: { type: 'timeline' } };
export const Catalog: Story = { args: { type: 'catalog' } };
export const Document: Story = { args: { type: 'document' } };
export const Charts: Story = { args: { type: 'charts' } };
export const Form: Story = { args: { type: 'form' } };
