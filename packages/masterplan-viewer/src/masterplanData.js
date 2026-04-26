export const sitePlan = {
  name: '6 Hectare Australian Campus',
  width: 300,
  depth: 200,
  areaSqm: 60000,
  purpose:
    'A 300m x 200m production campus that separates a south public arrival road from secure production movement, with six large-format stages, a broadcast theatre with fly tower, backlot, workshops, wardrobe, post-production, and public event space.'
};

export const campusNotes = [
  ['Site area', '6 ha / 60,000 sqm, modelled as a 300m x 200m Australian site.'],
  ['Stage capacity', 'Six large-format sound stages: one 60m mega stage plus five 45m class stages.'],
  ['Public interface', 'South public arrival road with drop-off, theatre lobby, exhibition, hospitality, plaza, event lawn, and visitor parking.'],
  ['Production logistics', 'Secure north/east/west service roads, controlled production gate, central stage spine, loading aprons, backlot, water tank, warehouse, and workshops.']
];

export const facilities = [
  {
    id: 'broadcast-theatre',
    name: 'Broadcast Theatre & Fly Tower',
    shortName: 'Theatre',
    category: 'public',
    purpose:
      'A broadcast-ready theatre with public lobby, auditorium, proscenium stage, dedicated back-of-house dock, and a tall fly tower for scenery, lighting battens, and stage machinery.',
    metrics: [
      ['Capacity assumption', '650 seated / 420 flat-floor broadcast event'],
      ['Fly tower', '38m high stage-house volume over a 40m x 20m stage'],
      ['Broadcast provision', 'Control tie-lines, camera galleries, loading dock, orchestra pit allowance'],
      ['Public access', 'Directly addresses the arrival plaza and hospitality frontage']
    ],
    color: '#8c7469',
    accent: '#f28c44',
    label: [-88, 44, 19],
    blocks: [
      { kind: 'lobby', position: [-112, 4, 72], size: [62, 8, 26], color: '#b7aaa0' },
      { kind: 'auditorium', position: [-112, 9, 42], size: [52, 18, 34], color: '#8c7469' },
      { kind: 'stageHouse', position: [-112, 9, 15], size: [40, 18, 20], color: '#75625d' },
      { kind: 'flyTower', position: [-112, 19, -5], size: [38, 38, 20], color: '#675650' },
      { kind: 'dock', position: [-136, 4, 4], size: [8, 8, 38], color: '#5d5652' }
    ]
  },
  {
    id: 'public-forum',
    name: 'Public Forum, Exhibition & Hospitality',
    shortName: 'Forum',
    category: 'public',
    purpose:
      'The public-facing front door: exhibition space, restaurant/bar, industry events, visitor amenities, and a shaded plaza edge before visitors enter secure production areas.',
    metrics: [
      ['Footprint', 'Approx. 2,050 sqm across lobby, exhibition, hospitality, and terrace volumes'],
      ['Role', 'Public events, launches, showcases, education open days'],
      ['Planning intent', 'Keeps public movement south of the secure production gate']
    ],
    color: '#b8aba0',
    accent: '#45b985',
    label: [-26, 22, 70],
    blocks: [
      { kind: 'exhibition', position: [-52, 5, 70], size: [54, 10, 26], color: '#b8aba0' },
      { kind: 'hospitality', position: [-7, 4, 76], size: [32, 8, 18], color: '#9d8f83' },
      { kind: 'canopy', position: [-52, 6.5, 93], size: [70, 3, 8], color: '#d8cdbf' }
    ]
  },
  {
    id: 'creative-hub',
    name: 'Creative Hub, Artist Studio & VFX Post',
    shortName: 'Creative Hub',
    category: 'creative',
    purpose:
      'A multi-storey studio workplace for up to 200 artists, VFX teams, post-production, production offices, client review, shared common areas, and secure links into the stage grid.',
    metrics: [
      ['Capacity', 'Up to 200 artists and production staff across flexible studio floors'],
      ['Artist floors', 'Open-plan VFX / animation workrooms, team pods, dailies rooms, and production offices'],
      ['Post / review', 'Secure edit, color, audio, data I/O, screening, client review, and broadcast-control suites'],
      ['Common areas', 'Ground-floor atrium, cafe / town-hall, shared stair, roof terraces, and informal breakout zones'],
      ['Operational role', 'Client-facing south frontage with secure north-side production access to stages and control rooms']
    ],
    color: '#66706d',
    accent: '#7dd3fc',
    label: [-56, 45, 44],
    blocks: [
      { kind: 'studioBase', position: [-56.5, 6.75, 38.75], size: [57, 13.5, 26.5], color: '#66706d' },
      { kind: 'artistFloors', position: [-53, 22.5, 39], size: [39, 18, 22], color: '#56635f' },
      { kind: 'vfxWing', position: [-36, 20.25, 34], size: [16, 13.5, 17], color: '#4d5a58' },
      { kind: 'reviewCrown', position: [-70, 34.75, 38], size: [20, 6.5, 18], color: '#798481' },
      { kind: 'atrium', position: [-79.5, 8.2, 45.2], size: [9, 16.4, 13.6], color: '#20383a' }
    ]
  },
  {
    id: 'mega-stage-01',
    name: 'Mega Volume Stage 01',
    shortName: 'Mega 01',
    category: 'stage',
    purpose:
      'The campus anchor stage: a 60m x 50m acoustic shell sized for large-scale feature work, large set builds, motion-control rigs, and future LED Volume interior layouts.',
    metrics: [
      ['Clear floor', '60m x 50m / 3,000 sqm'],
      ['Building height', '20m shell, allowing approx. 17m to grid'],
      ['Access', 'Central spine loading, truck apron, adjacent backlot and workshop route'],
      ['Future interior', 'Reserved for LED Volume, catwalk, control rooms, and plant rooms']
    ],
    color: '#f2efea',
    accent: '#58d7f2',
    label: [-28, 28, -55],
    blocks: [
      { kind: 'stage', position: [-28, 10, -55], size: [60, 20, 50] },
      { kind: 'supportAnnex', position: [-63, 4, -55], size: [10, 8, 36], color: '#d7d0c8' }
    ]
  },
  {
    id: 'sound-stage-02',
    name: 'Large Format Sound Stage 02',
    shortName: 'Stage 02',
    category: 'stage',
    purpose:
      'A 45m class acoustic stage for feature, episodic, commercial, and broadcast production with an isolated truck apron and LED Volume allowance.',
    metrics: [
      ['Clear floor', '45m x 45m / 2,025 sqm'],
      ['Building height', '18m shell, allowing approx. 15m to grid'],
      ['Access', 'North-row loading apron and central production spine']
    ],
    color: '#fff8ef',
    accent: '#70d6ff',
    label: [36, 26, -42],
    blocks: [
      { kind: 'stage', position: [42, 9, -55], size: [45, 18, 45] }
    ]
  },
  {
    id: 'sound-stage-03',
    name: 'Large Format Sound Stage 03',
    shortName: 'Stage 03',
    category: 'stage',
    purpose:
      'A second north-row 45m class stage paired with Stage 02 for concurrent production blocks and shared loading movement.',
    metrics: [
      ['Clear floor', '45m x 45m / 2,025 sqm'],
      ['Building height', '18m shell, allowing approx. 15m to grid'],
      ['Access', 'North-row loading apron and eastern service road']
    ],
    color: '#edf3f5',
    accent: '#63c9ff',
    label: [108, 31, -69],
    blocks: [
      { kind: 'stage', position: [100, 9, -55], size: [45, 18, 45] }
    ]
  },
  {
    id: 'sound-stage-04',
    name: 'Large Format Sound Stage 04',
    shortName: 'Stage 04',
    category: 'stage',
    purpose:
      'A 45m class stage on the south production row, close to wardrobe, dressing, and construction support.',
    metrics: [
      ['Clear floor', '45m x 45m / 2,025 sqm'],
      ['Building height', '18m shell, allowing approx. 15m to grid'],
      ['Access', 'Central spine, wardrobe support, and service gate']
    ],
    color: '#f4efe7',
    accent: '#7df0e7',
    label: [-25, 26, 2],
    blocks: [
      { kind: 'stage', position: [-25, 9, 2], size: [45, 18, 45] }
    ]
  },
  {
    id: 'sound-stage-05',
    name: 'Large Format Sound Stage 05',
    shortName: 'Stage 05',
    category: 'stage',
    purpose:
      'A central 45m class stage sized for long-running episodic production with direct wardrobe and workshop adjacency.',
    metrics: [
      ['Clear floor', '45m x 45m / 2,025 sqm'],
      ['Building height', '18m shell, allowing approx. 15m to grid'],
      ['Access', 'Central spine, southern loading apron, and shared support route']
    ],
    color: '#f8f7f0',
    accent: '#64d6ff',
    label: [35, 26, 2],
    blocks: [
      { kind: 'stage', position: [35, 9, 2], size: [45, 18, 45] }
    ]
  },
  {
    id: 'sound-stage-06',
    name: 'Large Format Sound Stage 06',
    shortName: 'Stage 06',
    category: 'stage',
    purpose:
      'An eastern 45m class stage with direct access to warehouse, set construction, and the eastern perimeter service road.',
    metrics: [
      ['Clear floor', '45m x 45m / 2,025 sqm'],
      ['Building height', '18m shell, allowing approx. 15m to grid'],
      ['Access', 'Eastern service road, warehouse yard, and central spine']
    ],
    color: '#eef5f7',
    accent: '#59c7f5',
    label: [95, 26, 2],
    blocks: [
      { kind: 'stage', position: [95, 9, 2], size: [45, 18, 45] }
    ]
  },
  {
    id: 'wardrobe-support',
    name: 'Dressing, Wardrobe & Laundry Spine',
    shortName: 'Wardrobe',
    category: 'support',
    purpose:
      'A cast and crew support spine for dressing rooms, green rooms, wardrobe, laundry, makeup, holding, and secure circulation into the stage grid.',
    metrics: [
      ['Footprint', 'Approx. 1,760 sqm support spine'],
      ['Program', 'Dressing rooms, makeup, wardrobe, laundry, green rooms'],
      ['Planning intent', 'Shared by Stages 04-06 and theatre back-of-house']
    ],
    color: '#c8b79d',
    accent: '#f5bd63',
    label: [4, 18, 48],
    blocks: [
      { kind: 'support', position: [0, 5, 54], size: [50, 10, 20] }
    ]
  },
  {
    id: 'workshop-warehouse',
    name: 'Set Construction, Warehouse & Paint',
    shortName: 'Workshop',
    category: 'support',
    purpose:
      'Heavy production support for set construction, prop fabrication, scenic paint, storage, forklifts, and truck movements without crossing the public plaza.',
    metrics: [
      ['Warehouse', '92m x 30m main shed with high-bay loading'],
      ['Paint / prop shop', '45m x 20m dedicated fabrication volume'],
      ['Access', 'Directly tied to the eastern service road and stage aprons']
    ],
    color: '#9b6654',
    accent: '#ff7c59',
    label: [72, 20, 62],
    blocks: [
      { kind: 'warehouse', position: [72, 6, 62], size: [92, 12, 30] },
      { kind: 'workshop', position: [29, 4, 84], size: [34, 8, 10], color: '#b8836e' },
      { kind: 'dock', position: [130, 3, 48], size: [24, 6, 12], color: '#5b5752' }
    ]
  },
  {
    id: 'backlot-water',
    name: 'Outdoor Backlot, Greenscreen & Water Tank',
    shortName: 'Backlot',
    category: 'stage',
    purpose:
      'A secured exterior shooting zone with a large-scale outdoor greenscreen, clear hardstand shooting apron, and water tank for controlled exterior, vehicle, rain, VFX, and marine sequence work.',
    metrics: [
      ['Backlot pad', 'Approx. 62m x 50m hardstand'],
      ['Outdoor greenscreen', 'Approx. 44m x 17m main wall with a 43m return for large-scale VFX plate work'],
      ['Water tank', '24m diameter tank footprint'],
      ['Access', 'Separated from public areas, near Mega Stage 01 and the northern service road']
    ],
    color: '#b9b1a7',
    accent: '#4abde8',
    label: [-108, 16, -58],
    blocks: [
      { kind: 'backlotPad', position: [-101.5, 0.14, -56], size: [53, 0.28, 46], color: '#8f8a82' },
      { kind: 'greenScreenDeck', position: [-107.5, 0.35, -59], size: [41, 0.1, 32], color: '#249f4d' },
      { kind: 'greenScreenWall', position: [-129.35, 8.65, -57], size: [0.9, 17.3, 43], color: '#20b951' },
      { kind: 'greenScreenWall', position: [-106.7, 7.65, -79.15], size: [42.4, 15.3, 0.9], color: '#20b951' },
      { kind: 'waterTank', shape: 'cylinder', position: [-86, 0.4, -43], radius: 12, height: 0.8, color: '#3d7480' }
    ]
  },
  {
    id: 'public-realm',
    name: 'Arrival Plaza, Event Lawn & Parking',
    shortName: 'Public Realm',
    category: 'public',
    purpose:
      'Public open space for arrivals, premieres, markets, education showcases, outdoor screenings, visitor parking, and a clear civic threshold before the secure production campus.',
    metrics: [
      ['Arrival promenade', 'Raised, patterned public threshold connecting theatre, forum, Creative Hub client entry, lawn, and parking'],
      ['Public plaza', 'Premiere and spill-out zone between the theatre/forum frontage and the south public road'],
      ['Event lawn', 'Outdoor public program, casual amphitheatre seating, and screening area'],
      ['Parking', 'Short-stay visitor and accessible parking accessed only from the public arrival road']
    ],
    color: '#78a96e',
    accent: '#88d06d',
    label: [72, 10, 91],
    blocks: [
      { kind: 'plaza', position: [-60, 0.16, 89], size: [122, 0.32, 7], color: '#d0c8ba' },
      { kind: 'lawn', position: [62, 0.18, 84.5], size: [26, 0.36, 15], color: '#78a96e' },
      { kind: 'parking', position: [100, 0.14, 85.5], size: [44, 0.28, 13], color: '#4a5050' }
    ]
  }
];

export const siteFeatures = [
  { id: 'public-arrival-road', kind: 'publicRoad', position: [-5, 0.05, 96], size: [270, 0.1, 7] },
  { id: 'north-service-road', kind: 'serviceRoad', position: [0, 0.05, -92.5], size: [284, 0.1, 8] },
  { id: 'west-service-road', kind: 'serviceRoad', position: [-146, 0.05, -57.5], size: [8, 0.1, 73] },
  { id: 'east-service-road', kind: 'serviceRoad', position: [146, 0.05, 0], size: [8, 0.1, 180] },
  { id: 'central-production-spine', kind: 'serviceRoad', position: [0, 0.05, -25.25], size: [284, 0.1, 8.5] },
  { id: 'west-interstage-service-lane', kind: 'serviceRoad', position: [5, 0.05, 4], size: [8, 0.1, 50] },
  { id: 'east-interstage-service-lane', kind: 'serviceRoad', position: [65, 0.05, 4], size: [8, 0.1, 50] },
  { id: 'north-stage-apron', kind: 'apron', position: [40, 0.08, -83.5], size: [184, 0.12, 7] },
  { id: 'south-stage-loading-apron', kind: 'apron', position: [58, 0.08, 33.5], size: [168, 0.12, 16] },
  { id: 'workshop-yard-apron', kind: 'apron', position: [130, 0.08, 66], size: [24, 0.12, 22] },
  { id: 'theatre-entry-pavers', kind: 'paver', position: [-112, 0.38, 87.4], size: [52, 0.08, 4] },
  { id: 'forum-entry-pavers', kind: 'paver', position: [-45, 0.38, 87.4], size: [58, 0.08, 4] },
  { id: 'creative-client-path', kind: 'paver', position: [-80, 0.38, 71.5], size: [1.4, 0.08, 35] },
  { id: 'creative-client-crosslink', kind: 'paver', position: [-58, 0.48, 54], size: [44, 0.08, 4] },
  { id: 'parking-lawn-path', kind: 'paver', position: [74, 0.38, 85.5], size: [54, 0.08, 4] },
  { id: 'public-entry-gate', kind: 'gate', position: [-112, 0.22, 96], size: [22, 0.02, 5] },
  { id: 'visitor-parking-entry', kind: 'gate', position: [100, 0.22, 96], size: [22, 0.02, 5] },
  { id: 'secure-production-gate', kind: 'gate', position: [-18, 0.22, 34], size: [16, 0.02, 5] },
  { id: 'east-truck-entry-gate', kind: 'gate', position: [146, 0.22, 84], size: [8, 0.02, 8] },
  { id: 'north-service-entry-gate', kind: 'gate', position: [0, 0.22, -92.5], size: [22, 0.02, 5] },
  { id: 'fire-break-north', kind: 'lawn', position: [0, 0.08, -99], size: [290, 0.12, 2] },
  { id: 'fire-break-south', kind: 'lawn', position: [0, 0.08, 104], size: [290, 0.12, 4] }
];

export const publicRealmDesign = {
  raisedInlays: [
    { id: 'theatre-premiere-band', color: '#c86f43', position: [-112, 0.64, 88.95], size: [45, 0.035, 0.28] },
    { id: 'theatre-entry-band', color: '#d6a15a', position: [-112, 0.69, 86.1], size: [38, 0.035, 0.24] },
    { id: 'forum-exhibition-band', color: '#3f7f62', position: [-45, 0.65, 88.95], size: [50, 0.035, 0.28] },
    { id: 'forum-hospitality-band', color: '#8b7057', position: [-10, 0.7, 86.1], size: [18, 0.035, 0.24] },
    { id: 'creative-client-band', color: '#567f8d', position: [-80, 0.64, 70.5], size: [0.26, 0.035, 28] },
    { id: 'creative-studio-threshold', color: '#6f8a7a', position: [-58, 0.67, 54], size: [37, 0.035, 0.28] },
    { id: 'lawn-arrival-band', color: '#6f9a62', position: [74, 0.64, 85.5], size: [48, 0.035, 0.28] },
    { id: 'parking-wayfinding-band', color: '#d4c09a', position: [100, 0.63, 91.15], size: [34, 0.035, 0.24] }
  ],
  plazaRibs: [
    { id: 'plaza-rib-01', position: [-128, 0.61, 91.4], size: [0.18, 0.03, 2.2] },
    { id: 'plaza-rib-02', position: [-116, 0.61, 91.4], size: [0.18, 0.03, 2.2] },
    { id: 'plaza-rib-03', position: [-104, 0.61, 91.4], size: [0.18, 0.03, 2.2] },
    { id: 'plaza-rib-04', position: [-92, 0.61, 91.4], size: [0.18, 0.03, 2.2] },
    { id: 'plaza-rib-05', position: [-72, 0.61, 91.4], size: [0.18, 0.03, 2.2] },
    { id: 'plaza-rib-06', position: [-60, 0.61, 91.4], size: [0.18, 0.03, 2.2] },
    { id: 'plaza-rib-07', position: [-48, 0.61, 91.4], size: [0.18, 0.03, 2.2] },
    { id: 'plaza-rib-08', position: [-36, 0.61, 91.4], size: [0.18, 0.03, 2.2] },
    { id: 'plaza-rib-09', position: [-24, 0.61, 91.4], size: [0.18, 0.03, 2.2] },
    { id: 'plaza-rib-10', position: [-12, 0.61, 91.4], size: [0.18, 0.03, 2.2] }
  ],
  lowPlanting: [
    { id: 'theatre-low-planting-west', position: [-132, 0.78, 90.85], size: [8.5, 0.72, 1.35], color: '#6f8e5f' },
    { id: 'theatre-low-planting-east', position: [-92, 0.78, 90.85], size: [8.5, 0.72, 1.35], color: '#7f8d66' },
    { id: 'forum-low-planting-west', position: [-67, 0.78, 90.85], size: [9.5, 0.72, 1.35], color: '#6f8e5f' },
    { id: 'forum-low-planting-east', position: [-24, 0.78, 90.85], size: [9, 0.72, 1.35], color: '#7f8d66' },
    { id: 'creative-court-planting', position: [-43, 0.76, 55.85], size: [7.2, 0.68, 1.3], color: '#5f8564' },
    { id: 'lawn-edge-planting', position: [48, 0.76, 91.45], size: [12, 0.68, 1.3], color: '#6f8e5f' },
    { id: 'parking-entry-planting', position: [115, 0.74, 91.45], size: [12, 0.64, 1.3], color: '#6a8262' }
  ],
  seating: [
    { id: 'theatre-bench-west', position: [-121, 0.78, 90.9], size: [6.5, 0.54, 1.05], rotation: [0, 0, 0] },
    { id: 'theatre-bench-east', position: [-102, 0.78, 90.9], size: [6.5, 0.54, 1.05], rotation: [0, 0, 0] },
    { id: 'forum-bench-west', position: [-58, 0.78, 90.9], size: [6.8, 0.54, 1.05], rotation: [0, 0, 0] },
    { id: 'forum-bench-east', position: [-36, 0.78, 90.9], size: [6.8, 0.54, 1.05], rotation: [0, 0, 0] },
    { id: 'lawn-bench-south', position: [60, 0.78, 91.25], size: [7.4, 0.54, 1.05], rotation: [0, 0, 0] },
    { id: 'parking-wait-bench', position: [91, 0.76, 90.2], size: [6.8, 0.52, 1.05], rotation: [0, 0, 0] }
  ],
  bollardLights: [
    [-137, 0.92, 90.6],
    [-126, 0.92, 90.6],
    [-114, 0.92, 90.6],
    [-102, 0.92, 90.6],
    [-90, 0.92, 90.6],
    [-72, 0.92, 90.6],
    [-60, 0.92, 90.6],
    [-48, 0.92, 90.6],
    [-36, 0.92, 90.6],
    [-24, 0.92, 90.6],
    [48, 0.92, 90.1],
    [61, 0.92, 90.7],
    [74, 0.92, 90.6],
    [88, 0.92, 90.2],
    [102, 0.92, 90.2],
    [116, 0.92, 90.2]
  ],
  shadeCanopies: [
    { id: 'forum-terrace-shade', position: [-18, 4.2, 88.4], size: [18, 1.1, 4.8] },
    { id: 'lawn-gathering-shade', position: [62, 4.3, 86], size: [20, 1.3, 8] },
    { id: 'parking-waiting-shade', position: [103, 3.8, 89.2], size: [17, 1.1, 4.2] }
  ]
};

export const accessRouteLegend = [
  { kind: 'public', label: 'Public arrival', color: '#3fbf78' },
  { kind: 'secure', label: 'Secure production', color: '#e59a32' },
  { kind: 'truck', label: 'Truck / service', color: '#3d7ea6' },
  { kind: 'pedestrian', label: 'Pedestrian', color: '#f2e2bd' }
];

export const accessRoutes = [
  {
    id: 'public-arrival',
    name: 'Public arrival loop',
    kind: 'public',
    color: '#3fbf78',
    segments: [
      { position: [-5, 0.48, 96], size: [248, 0.12, 2.6] },
      { position: [-112, 0.5, 92.5], size: [3.2, 0.12, 9] },
      { position: [100, 0.5, 90.7], size: [3.2, 0.12, 12.2] }
    ],
    arrows: [
      { position: [-132, 0.62, 96], direction: 'east' },
      { position: [-70, 0.62, 96], direction: 'east' },
      { position: [22, 0.62, 96], direction: 'east' },
      { position: [-112, 0.62, 92], direction: 'north' },
      { position: [100, 0.62, 91], direction: 'north' }
    ]
  },
  {
    id: 'secure-production',
    name: 'Secure production movement',
    kind: 'secure',
    color: '#e59a32',
    segments: [
      { position: [-18, 0.5, 34], size: [18, 0.12, 3.2] },
      { position: [58, 0.5, 33.5], size: [160, 0.12, 3.2] },
      { position: [5, 0.5, 4], size: [3.2, 0.12, 50] },
      { position: [65, 0.5, 4], size: [3.2, 0.12, 50] },
      { position: [0, 0.5, -25.25], size: [250, 0.12, 3.2] }
    ],
    arrows: [
      { position: [-18, 0.62, 34], direction: 'east' },
      { position: [30, 0.62, 33.5], direction: 'east' },
      { position: [98, 0.62, 33.5], direction: 'east' },
      { position: [5, 0.62, 6], direction: 'north' },
      { position: [65, 0.62, 6], direction: 'north' },
      { position: [32, 0.62, -25.25], direction: 'east' }
    ]
  },
  {
    id: 'truck-service',
    name: 'Truck and service ring',
    kind: 'truck',
    color: '#3d7ea6',
    segments: [
      { position: [146, 0.52, 0], size: [3.2, 0.12, 176] },
      { position: [0, 0.52, -92.5], size: [250, 0.12, 3.2] },
      { position: [-146, 0.52, -57.5], size: [3.2, 0.12, 70] },
      { position: [130, 0.52, 66], size: [24, 0.12, 3.2] },
      { position: [0, 0.52, -25.25], size: [250, 0.12, 2.6] }
    ],
    arrows: [
      { position: [146, 0.64, 74], direction: 'north' },
      { position: [146, 0.64, 8], direction: 'north' },
      { position: [146, 0.64, -58], direction: 'north' },
      { position: [88, 0.64, -92.5], direction: 'west' },
      { position: [-76, 0.64, -92.5], direction: 'west' },
      { position: [-146, 0.64, -66], direction: 'south' },
      { position: [130, 0.64, 66], direction: 'east' }
    ]
  },
  {
    id: 'pedestrian',
    name: 'Pedestrian public paths',
    kind: 'pedestrian',
    color: '#f2e2bd',
    segments: [
      { position: [-60, 0.62, 89], size: [118, 0.08, 2.4] },
      { position: [-112, 0.62, 87.4], size: [52, 0.08, 2.8] },
      { position: [-45, 0.62, 87.4], size: [58, 0.08, 2.8] },
      { position: [-80, 0.62, 71.5], size: [1.2, 0.08, 35] },
      { position: [-58, 0.62, 54], size: [44, 0.08, 2.8] },
      { position: [74, 0.62, 85.5], size: [54, 0.08, 2.8] }
    ],
    arrows: [
      { position: [-104, 0.72, 89], direction: 'east' },
      { position: [-48, 0.72, 89], direction: 'east' },
      { position: [-80, 0.72, 72], direction: 'north' },
      { position: [-58, 0.72, 54], direction: 'east' },
      { position: [74, 0.72, 85.5], direction: 'west' }
    ]
  }
];

export const accessPoints = [
  {
    id: 'public-entry',
    name: 'Public Entry',
    kind: 'public',
    labelPosition: [-112, 5.2, 101],
    boothPosition: [-126, 1.45, 91],
    barrierPosition: [-112, 1.05, 96],
    barrierSize: [18, 0.35, 0.35]
  },
  {
    id: 'visitor-parking',
    name: 'Visitor Parking',
    kind: 'public',
    labelPosition: [100, 5.2, 101],
    boothPosition: [88, 1.45, 91],
    barrierPosition: [100, 1.05, 96],
    barrierSize: [16, 0.35, 0.35]
  },
  {
    id: 'secure-gate',
    name: 'Secure Gate',
    kind: 'secure',
    labelPosition: [-18, 5.6, 38],
    boothPosition: [-32, 1.45, 39],
    barrierPosition: [-18, 1.05, 34],
    barrierSize: [15, 0.35, 0.35]
  },
  {
    id: 'east-truck-entry',
    name: 'Truck Entry',
    kind: 'truck',
    labelPosition: [104, 5.4, 78],
    boothPosition: [140, 1.45, 77],
    barrierPosition: [146, 1.05, 84],
    barrierSize: [0.35, 0.35, 9]
  },
  {
    id: 'north-service-entry',
    name: 'North Service',
    kind: 'truck',
    labelPosition: [0, 5.4, -97],
    boothPosition: [14, 1.45, -88],
    barrierPosition: [0, 1.05, -92.5],
    barrierSize: [18, 0.35, 0.35]
  },
  {
    id: 'pedestrian-plaza',
    name: 'Pedestrian Plaza',
    kind: 'pedestrian',
    labelPosition: [-38, 5.1, 82]
  }
];
