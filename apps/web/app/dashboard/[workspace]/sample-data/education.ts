/**
 * Sample data for Education workspace canvases.
 * @see Issue #415
 */

export const EDUCATION_SAMPLE_DATA = {
  table: {
    columns: [
      { key: 'name', label: 'Course', sortable: true },
      { key: 'type', label: 'Type', sortable: true },
      { key: 'instructor', label: 'Instructor' },
      { key: 'level', label: 'Level' },
      { key: 'enrollment', label: 'Enrolled' },
    ],
    data: [
      { id: '1', name: 'Introduction to Virtual Production', type: 'Course', instructor: 'Dr. Sarah Lee', level: 'Beginner', enrollment: '24/30' },
      { id: '2', name: 'Advanced Colour Grading', type: 'Workshop', instructor: 'Maria Chen', level: 'Advanced', enrollment: '12/15' },
      { id: '3', name: 'LED Volume Operations', type: 'Certification', instructor: 'Tom Williams', level: 'Intermediate', enrollment: '8/20' },
      { id: '4', name: 'Sound Design Masterclass', type: 'Masterclass', instructor: 'Bob Johnson', level: 'Advanced', enrollment: '18/20' },
      { id: '5', name: 'Production Management 101', type: 'Course', instructor: 'Jane Smith', level: 'Beginner', enrollment: '22/25' },
    ],
  },
  catalog: {
    items: [
      { id: '1', title: 'Introduction to Virtual Production', subtitle: 'Beginner — 8 weeks', tags: ['virtual-production', 'beginner'] },
      { id: '2', title: 'Advanced Colour Grading', subtitle: 'Advanced — 2 days', tags: ['post-production', 'advanced'] },
      { id: '3', title: 'LED Volume Operations', subtitle: 'Intermediate — 4 weeks', tags: ['virtual-production', 'certification'] },
      { id: '4', title: 'Sound Design Masterclass', subtitle: 'Advanced — 3 days', tags: ['audio', 'masterclass'] },
      { id: '5', title: 'Production Management 101', subtitle: 'Beginner — 12 weeks', tags: ['management', 'beginner'] },
    ],
    categories: ['All', 'Virtual Production', 'Post-Production', 'Audio', 'Management'],
  },
};
