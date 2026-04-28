/**
 * Sample data for People workspace canvases.
 * @see Issue #415
 */

export const PEOPLE_SAMPLE_DATA = {
  table: {
    columns: [
      { key: 'name', label: 'Name', sortable: true },
      { key: 'role', label: 'Role' },
      { key: 'department', label: 'Department', sortable: true },
      { key: 'status', label: 'Status' },
    ],
    data: [
      { id: '1', name: 'Jane Smith', role: 'Production Manager', department: 'Production', status: 'Active' },
      { id: '2', name: 'Bob Johnson', role: 'Sound Engineer', department: 'Post-Production', status: 'Active' },
      { id: '3', name: 'Maria Chen', role: 'Director of Photography', department: 'Production', status: 'Active' },
      { id: '4', name: 'Tom Williams', role: 'Set Designer', department: 'Art', status: 'On Leave' },
      { id: '5', name: 'Sarah Lee', role: 'VFX Supervisor', department: 'Post-Production', status: 'Active' },
      { id: '6', name: 'James Brown', role: 'Gaffer', department: 'Lighting', status: 'Contractor' },
    ],
  },
  board: {
    lanes: [
      { id: 'available', label: 'Available' },
      { id: 'assigned', label: 'Assigned' },
      { id: 'on-leave', label: 'On Leave' },
    ],
    cards: [
      { id: 'c1', laneId: 'assigned', title: 'Jane Smith', subtitle: 'Project Aurora' },
      { id: 'c2', laneId: 'assigned', title: 'Bob Johnson', subtitle: 'Australian Stories' },
      { id: 'c3', laneId: 'assigned', title: 'Maria Chen', subtitle: 'Reef Runners' },
      { id: 'c4', laneId: 'on-leave', title: 'Tom Williams', subtitle: 'Returns Apr 1' },
      { id: 'c5', laneId: 'available', title: 'Sarah Lee', subtitle: 'VFX Supervisor' },
      { id: 'c6', laneId: 'available', title: 'James Brown', subtitle: 'Gaffer' },
    ],
  },
};
