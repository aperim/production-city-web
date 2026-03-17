/**
 * Sample data for Analytics workspace canvases.
 * @see Issue #415
 */

export const ANALYTICS_SAMPLE_DATA = {
  charts: {
    charts: [
      {
        id: 'utilization',
        title: 'Facility Utilisation',
        type: 'area' as const,
        data: [
          { name: 'Jan', value: 72 },
          { name: 'Feb', value: 78 },
          { name: 'Mar', value: 85 },
          { name: 'Apr', value: 81 },
          { name: 'May', value: 88 },
          { name: 'Jun', value: 92 },
        ],
        color: '#3b82f6',
      },
      {
        id: 'productions',
        title: 'Active Productions',
        type: 'bar' as const,
        data: [
          { name: 'Film', value: 4 },
          { name: 'TV Series', value: 7 },
          { name: 'Commercial', value: 12 },
          { name: 'Documentary', value: 3 },
        ],
        color: '#8b5cf6',
      },
      {
        id: 'revenue-trend',
        title: 'Revenue Trend',
        type: 'line' as const,
        data: [
          { name: 'Q1 2025', value: 2800000 },
          { name: 'Q2 2025', value: 3200000 },
          { name: 'Q3 2025', value: 3500000 },
          { name: 'Q4 2025', value: 3100000 },
          { name: 'Q1 2026', value: 3800000 },
        ],
        color: '#22c55e',
      },
      {
        id: 'workspace-usage',
        title: 'Workspace Usage',
        type: 'pie' as const,
        data: [
          { name: 'Productions', value: 35 },
          { name: 'Facilities', value: 28 },
          { name: 'Finance', value: 15 },
          { name: 'People', value: 12 },
          { name: 'Other', value: 10 },
        ],
      },
    ],
  },
  table: {
    columns: [
      { key: 'metric', label: 'Metric', sortable: true },
      { key: 'current', label: 'Current' },
      { key: 'previous', label: 'Previous' },
      { key: 'change', label: 'Change' },
    ],
    data: [
      { id: '1', metric: 'Facility Utilisation', current: '85%', previous: '78%', change: '+7%' },
      { id: '2', metric: 'Active Productions', current: '26', previous: '22', change: '+4' },
      { id: '3', metric: 'Monthly Revenue', current: '$3.8M', previous: '$3.1M', change: '+22.6%' },
      { id: '4', metric: 'Staff On-Site', current: '142', previous: '128', change: '+14' },
    ],
  },
};
