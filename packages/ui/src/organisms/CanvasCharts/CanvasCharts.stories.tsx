import type { Meta, StoryObj } from '@storybook/react-vite';
import { CanvasCharts } from './CanvasCharts';

const meta: Meta<typeof CanvasCharts> = {
  title: 'Organisms/CanvasCharts',
  component: CanvasCharts,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof CanvasCharts>;

const revenueData = [
  { name: 'Jan', value: 95000 },
  { name: 'Feb', value: 120000 },
  { name: 'Mar', value: 115000 },
  { name: 'Apr', value: 140000 },
  { name: 'May', value: 132000 },
  { name: 'Jun', value: 155000 },
];

const utilizationData = [
  { name: 'Stage A', value: 85 },
  { name: 'Stage B', value: 72 },
  { name: 'Stage C', value: 91 },
  { name: 'Stage D', value: 65 },
];

const departmentData = [
  { name: 'Production', value: 42 },
  { name: 'Post', value: 28 },
  { name: 'Sound', value: 15 },
  { name: 'VFX', value: 15 },
];

export const Default: Story = {
  args: {
    charts: [
      { id: 'revenue', title: 'Revenue', type: 'line', data: revenueData },
      { id: 'utilization', title: 'Facility Utilization', type: 'bar', data: utilizationData },
    ],
  },
};

export const AllChartTypes: Story = {
  args: {
    charts: [
      { id: 'line', title: 'Revenue Trend', type: 'line', data: revenueData },
      { id: 'bar', title: 'Stage Utilization', type: 'bar', data: utilizationData },
      { id: 'area', title: 'Bookings Over Time', type: 'area', data: revenueData },
      { id: 'pie', title: 'Department Split', type: 'pie', data: departmentData },
    ],
  },
};

export const WithDataTable: Story = {
  args: {
    charts: [
      { id: 'revenue', title: 'Revenue', type: 'line', data: revenueData },
      { id: 'utilization', title: 'Utilization', type: 'bar', data: utilizationData },
    ],
    showTable: true,
  },
};

export const SingleChart: Story = {
  args: {
    charts: [
      { id: 'revenue', title: 'Monthly Revenue', type: 'area', data: revenueData },
    ],
  },
};

export const Empty: Story = {
  args: {
    charts: [],
  },
};
