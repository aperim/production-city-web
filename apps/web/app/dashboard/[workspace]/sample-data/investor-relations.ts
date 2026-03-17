/**
 * Sample data for Investor Relations workspace canvases.
 * @see Issue #415
 */

export const INVESTOR_RELATIONS_SAMPLE_DATA = {
  table: {
    columns: [
      { key: 'title', label: 'Document', sortable: true },
      { key: 'type', label: 'Type', sortable: true },
      { key: 'date', label: 'Date', sortable: true },
      { key: 'status', label: 'Status' },
    ],
    data: [
      { id: '1', title: 'Q1 2026 Investor Update', type: 'Report', date: '2026-04-01', status: 'Draft' },
      { id: '2', title: 'Annual Report 2025', type: 'Report', date: '2026-02-28', status: 'Published' },
      { id: '3', title: 'Campus Development Overview', type: 'Update', date: '2026-03-15', status: 'Published' },
      { id: '4', title: 'Distribution Schedule 2026', type: 'Document', date: '2026-01-15', status: 'Published' },
      { id: '5', title: 'Sustainability Report 2025', type: 'Report', date: '2026-03-01', status: 'Review' },
    ],
  },
  documents: {
    items: [
      { id: '1', name: 'Annual Reports', type: 'folder' as const, childCount: 5 },
      { id: '2', name: 'Quarterly Updates', type: 'folder' as const, childCount: 8 },
      { id: '3', name: 'Investor Presentations', type: 'folder' as const, childCount: 3 },
      { id: '4', name: 'Q1 2026 Investor Update.pdf', type: 'file' as const, fileType: 'pdf', size: 2500000, updatedAt: '2026-03-15' },
      { id: '5', name: 'Annual Report 2025.pdf', type: 'file' as const, fileType: 'pdf', size: 8700000, updatedAt: '2026-02-28' },
    ],
  },
};
