/**
 * Sample data for Finance workspace canvases.
 * @see Issue #415
 */

export const FINANCE_SAMPLE_DATA = {
  table: {
    columns: [
      { key: 'reference', label: 'Reference', sortable: true },
      { key: 'description', label: 'Description' },
      { key: 'amount', label: 'Amount', sortable: true },
      { key: 'status', label: 'Status', sortable: true },
      { key: 'dueDate', label: 'Due Date', sortable: true },
    ],
    data: [
      { id: '1', reference: 'INV-2026-001', description: 'Sound Stage 3 rental — Project Aurora', amount: '$45,000', status: 'Paid', dueDate: '2026-03-15' },
      { id: '2', reference: 'INV-2026-002', description: 'LED Volume setup — Harbour Nights', amount: '$28,500', status: 'Pending', dueDate: '2026-03-30' },
      { id: '3', reference: 'PO-2026-014', description: 'Lighting equipment hire', amount: '$12,200', status: 'Approved', dueDate: '2026-04-01' },
      { id: '4', reference: 'INV-2026-003', description: 'Post-production services — Queensland Stories', amount: '$67,800', status: 'Overdue', dueDate: '2026-03-01' },
      { id: '5', reference: 'BUD-2026-Q2', description: 'Q2 2026 operating budget', amount: '$1,250,000', status: 'Draft', dueDate: '2026-04-15' },
    ],
  },
  charts: {
    charts: [
      {
        id: 'revenue',
        title: 'Monthly Revenue',
        type: 'bar' as const,
        data: [
          { name: 'Jan', value: 850000 },
          { name: 'Feb', value: 920000 },
          { name: 'Mar', value: 1100000 },
          { name: 'Apr', value: 980000 },
        ],
        color: '#3b82f6',
      },
      {
        id: 'expenses',
        title: 'Expense Breakdown',
        type: 'pie' as const,
        data: [
          { name: 'Facilities', value: 450000 },
          { name: 'Equipment', value: 220000 },
          { name: 'Staff', value: 680000 },
          { name: 'Production', value: 340000 },
        ],
      },
      {
        id: 'cashflow',
        title: 'Cash Flow Trend',
        type: 'line' as const,
        data: [
          { name: 'Jan', value: 2100000 },
          { name: 'Feb', value: 2350000 },
          { name: 'Mar', value: 2180000 },
          { name: 'Apr', value: 2500000 },
        ],
        color: '#22c55e',
      },
    ],
  },
};
