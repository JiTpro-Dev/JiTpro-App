export type SubmittalType =
  | 'shop_drawings'
  | 'product_data'
  | 'samples'
  | 'mockups'
  | 'certificates'
  | 'design_mix'
  | 'manufacturer_instructions'
  | 'warranties';

export type ItemStatus = 'ready' | 'pending_selection' | 'missing_design';

export interface ProcurementItem {
  id: string;
  name: string;
  description: string;
  csiCode: string;
  csiDivision: string;
  csiLabel: string;
  locations: string[];
  vendor: string | null;
  requiresSubmittal: boolean;
  submittalTypes: SubmittalType[];
  status: ItemStatus;
  notes: string;
}

export interface CsiSubdivision {
  code: string;
  name: string;
}

export interface CsiDivision {
  code: string;
  name: string;
  icon: string;
  subdivisions: CsiSubdivision[];
}

export const submittalTypeLabels: Record<SubmittalType, string> = {
  shop_drawings: 'Shop Drawings',
  product_data: 'Product Data',
  samples: 'Samples',
  mockups: 'Mockups',
  certificates: 'Certificates',
  design_mix: 'Design Mix',
  manufacturer_instructions: 'Mfr Instructions',
  warranties: 'Warranties',
};

export const statusConfig: Record<ItemStatus, { label: string; badgeClass: string; rowClass: string }> = {
  ready: {
    label: 'Ready',
    badgeClass: 'bg-green-100 text-green-700',
    rowClass: '',
  },
  pending_selection: {
    label: 'Pending Selection',
    badgeClass: 'bg-amber-100 text-amber-700',
    rowClass: 'bg-amber-50',
  },
  missing_design: {
    label: 'Missing Design',
    badgeClass: 'bg-red-100 text-red-700',
    rowClass: 'bg-red-50',
  },
};

export const sampleDivisions: CsiDivision[] = [
  {
    code: '03', name: 'Concrete', icon: 'Blocks',
    subdivisions: [
      { code: '03 10 00', name: 'Cast-in-Place Concrete' },
      { code: '03 30 00', name: 'Precast Concrete' },
      { code: '03 01 00', name: 'Concrete Repair' },
    ],
  },
  {
    code: '05', name: 'Metals', icon: 'Wrench',
    subdivisions: [
      { code: '05 12 00', name: 'Structural Steel' },
      { code: '05 50 00', name: 'Metal Fabrications' },
      { code: '05 70 00', name: 'Decorative Metal' },
    ],
  },
  {
    code: '06', name: 'Wood, Plastics & Composites', icon: 'TreePine',
    subdivisions: [
      { code: '06 10 00', name: 'Rough Carpentry' },
      { code: '06 20 00', name: 'Finish Carpentry' },
      { code: '06 40 00', name: 'Architectural Woodwork' },
    ],
  },
  {
    code: '08', name: 'Openings', icon: 'DoorOpen',
    subdivisions: [
      { code: '08 11 00', name: 'Doors & Frames' },
      { code: '08 50 00', name: 'Windows' },
      { code: '08 71 00', name: 'Hardware' },
      { code: '08 80 00', name: 'Glazing' },
    ],
  },
  {
    code: '09', name: 'Finishes', icon: 'PaintBucket',
    subdivisions: [
      { code: '09 20 00', name: 'Plaster & Gypsum Board' },
      { code: '09 30 00', name: 'Tile' },
      { code: '09 60 00', name: 'Flooring' },
      { code: '09 91 00', name: 'Painting' },
      { code: '09 72 00', name: 'Wall Coverings' },
    ],
  },
  {
    code: '10', name: 'Specialties', icon: 'Signpost',
    subdivisions: [
      { code: '10 14 00', name: 'Signage' },
      { code: '10 28 00', name: 'Toilet Accessories' },
      { code: '10 44 00', name: 'Fire Extinguishers' },
    ],
  },
  {
    code: '11', name: 'Equipment', icon: 'Refrigerator',
    subdivisions: [
      { code: '11 31 00', name: 'Appliances' },
      { code: '11 05 00', name: 'Loading Dock Equipment' },
    ],
  },
  {
    code: '12', name: 'Furnishings', icon: 'Armchair',
    subdivisions: [
      { code: '12 32 00', name: 'Casework / Cabinets' },
      { code: '12 36 00', name: 'Countertops' },
      { code: '12 20 00', name: 'Window Treatments' },
    ],
  },
];

export const sampleLocations = [
  'Bldg A › L1 › Lobby',
  'Bldg A › L1 › Kitchen',
  'Bldg A › L1 › Unit A',
  'Bldg A › L1 › Unit B',
  'Bldg A › L1 › Master Bath',
  'Bldg A › L2 › Unit C',
  'Bldg A › L2 › Unit D',
  'All Locations',
  'All Interior',
  'Exterior › East Side',
  'Exterior › Parking Garage',
];

export const sampleItems: ProcurementItem[] = [
  {
    id: '1', name: 'Kitchen Cabinets — Unit A', description: 'Maple, shaker style, soft-close',
    csiCode: '12 32 00', csiDivision: '12', csiLabel: 'Casework / Cabinets',
    locations: ['Bldg A › L1 › Kitchen'], vendor: 'ABC Millwork',
    requiresSubmittal: true, submittalTypes: ['shop_drawings', 'product_data'],
    status: 'ready', notes: '',
  },
  {
    id: '2', name: 'Kitchen Cabinets — Unit B', description: 'Style TBD — owner reviewing options',
    csiCode: '12 32 00', csiDivision: '12', csiLabel: 'Casework / Cabinets',
    locations: ['Bldg A › L1 › Unit B'], vendor: 'ABC Millwork',
    requiresSubmittal: true, submittalTypes: ['shop_drawings', 'samples'],
    status: 'pending_selection', notes: 'Owner reviewing 3 finish options',
  },
  {
    id: '3', name: 'Bathroom Vanities — All Units', description: 'Standard vanity, spec pending',
    csiCode: '12 32 00', csiDivision: '12', csiLabel: 'Casework / Cabinets',
    locations: ['All Locations'], vendor: null,
    requiresSubmittal: true, submittalTypes: ['shop_drawings', 'product_data'],
    status: 'missing_design', notes: 'Waiting on architect vanity layout',
  },
  {
    id: '4', name: 'Granite Countertops — Kitchen', description: 'Per allowance spec, color selected',
    csiCode: '12 36 00', csiDivision: '12', csiLabel: 'Countertops',
    locations: ['Bldg A › L1 › Kitchen'], vendor: 'Stone World',
    requiresSubmittal: true, submittalTypes: ['samples', 'shop_drawings'],
    status: 'ready', notes: '',
  },
  {
    id: '5', name: 'Structural Steel Package', description: 'W-shapes, HSS columns per S-101',
    csiCode: '05 12 00', csiDivision: '05', csiLabel: 'Structural Steel',
    locations: ['All Locations'], vendor: 'Pacific Steel',
    requiresSubmittal: true, submittalTypes: ['shop_drawings', 'certificates'],
    status: 'ready', notes: '',
  },
  {
    id: '6', name: 'Decorative Metal Railing — Lobby', description: 'Custom design, pending architect detail',
    csiCode: '05 70 00', csiDivision: '05', csiLabel: 'Decorative Metal',
    locations: ['Bldg A › L1 › Lobby'], vendor: null,
    requiresSubmittal: true, submittalTypes: ['shop_drawings', 'samples'],
    status: 'missing_design', notes: 'Architect revising railing detail',
  },
  {
    id: '7', name: 'Interior Paint — All Units', description: 'Colors not yet selected by designer',
    csiCode: '09 91 00', csiDivision: '09', csiLabel: 'Painting',
    locations: ['All Interior'], vendor: null,
    requiresSubmittal: true, submittalTypes: ['product_data', 'samples'],
    status: 'pending_selection', notes: 'Designer presenting color palette next week',
  },
  {
    id: '8', name: 'Lobby Stone Flooring', description: 'Architect redesigning lobby layout',
    csiCode: '09 60 00', csiDivision: '09', csiLabel: 'Flooring',
    locations: ['Bldg A › L1 › Lobby'], vendor: null,
    requiresSubmittal: true, submittalTypes: ['samples', 'mockups'],
    status: 'missing_design', notes: 'Lobby redesign in progress',
  },
  {
    id: '9', name: 'Tile — Master Bath', description: 'Porcelain floor and wall tile',
    csiCode: '09 30 00', csiDivision: '09', csiLabel: 'Tile',
    locations: ['Bldg A › L1 › Master Bath'], vendor: 'TileMax',
    requiresSubmittal: true, submittalTypes: ['product_data', 'samples'],
    status: 'pending_selection', notes: 'Owner selecting from 3 options',
  },
  {
    id: '10', name: 'Retaining Wall — East', description: 'Structural engineer pending geotech report',
    csiCode: '03 30 00', csiDivision: '03', csiLabel: 'Precast Concrete',
    locations: ['Exterior › East Side'], vendor: 'Metro Concrete',
    requiresSubmittal: true, submittalTypes: ['design_mix', 'shop_drawings'],
    status: 'missing_design', notes: 'Geotech report expected in 2 weeks',
  },
  {
    id: '11', name: 'Appliance Package — All Units', description: 'Per owner allowance specs',
    csiCode: '11 31 00', csiDivision: '11', csiLabel: 'Appliances',
    locations: ['All Locations'], vendor: 'HomeStyle Supply',
    requiresSubmittal: false, submittalTypes: [],
    status: 'ready', notes: '',
  },
  {
    id: '12', name: 'Entry Doors & Frames', description: 'Hollow metal frames, solid core doors',
    csiCode: '08 11 00', csiDivision: '08', csiLabel: 'Doors & Frames',
    locations: ['All Locations'], vendor: 'DoorCraft Inc.',
    requiresSubmittal: true, submittalTypes: ['shop_drawings', 'product_data', 'warranties'],
    status: 'ready', notes: '',
  },
];
