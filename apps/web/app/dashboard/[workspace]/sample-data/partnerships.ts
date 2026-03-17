/**
 * Sample data for Partnerships workspace canvases.
 * @see Issue #415
 */

export const PARTNERSHIPS_SAMPLE_DATA = {
  table: {
    columns: [
      { key: 'partner', label: 'Partner', sortable: true },
      { key: 'type', label: 'Type', sortable: true },
      { key: 'status', label: 'Status' },
      { key: 'startDate', label: 'Start Date', sortable: true },
    ],
    data: [
      { id: '1', partner: 'Queensland University of Technology', type: 'Education', status: 'Active', startDate: '2025-01-15' },
      { id: '2', partner: 'Disguise', type: 'Technology', status: 'Active', startDate: '2025-06-01' },
      { id: '3', partner: 'First Nations Film Council', type: 'First Nations', status: 'Active', startDate: '2024-09-01' },
      { id: '4', partner: 'Queensland Government — Screen QLD', type: 'Government', status: 'Active', startDate: '2024-01-01' },
      { id: '5', partner: 'Epic Games', type: 'Technology', status: 'Proposed', startDate: '2026-04-01' },
    ],
  },
  board: {
    lanes: [
      { id: 'proposed', label: 'Proposed' },
      { id: 'negotiation', label: 'Negotiation' },
      { id: 'active', label: 'Active' },
      { id: 'completed', label: 'Completed' },
    ],
    cards: [
      { id: 'c1', laneId: 'active', title: 'QUT Partnership', subtitle: 'Education' },
      { id: 'c2', laneId: 'active', title: 'Disguise', subtitle: 'Technology' },
      { id: 'c3', laneId: 'active', title: 'First Nations Film Council', subtitle: 'First Nations' },
      { id: 'c4', laneId: 'active', title: 'Screen QLD', subtitle: 'Government' },
      { id: 'c5', laneId: 'proposed', title: 'Epic Games', subtitle: 'Technology' },
    ],
  },
};
