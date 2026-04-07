# DEPRECATED DOCUMENT

This document no longer reflects the current JiTpro system.

Refer to:
docs/CURRENT_STATE_UPDATED.md

---

# JiTpro Core Mockup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build interactive mockups for Scope Builder and Spec/Selection Register inside the existing AppShell, using hardcoded sample data.

**Architecture:** Two new page components at existing nav routes (`/app/pre-bid/scope-builder` and `/app/pre-bid/selection-register`). Scope Builder has two views (card grid landing → split panel drill-down). Register is a single sortable/filterable table. Shared sample data module provides types, CSI divisions, and mock procurement items. All state is local React state — no database.

**Tech Stack:** React, TypeScript, Tailwind CSS, lucide-react icons, react-router-dom (existing)

---

### Task 1: Sample Data & Types

**Files:**
- Create: `src/pages/app/pre-bid/sampleData.ts`

- [ ] **Step 1: Create the sample data file with types, divisions, and items**

```typescript
// src/pages/app/pre-bid/sampleData.ts

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
    code: '03',
    name: 'Concrete',
    icon: 'Blocks',
    subdivisions: [
      { code: '03 10 00', name: 'Cast-in-Place Concrete' },
      { code: '03 30 00', name: 'Precast Concrete' },
      { code: '03 01 00', name: 'Concrete Repair' },
    ],
  },
  {
    code: '05',
    name: 'Metals',
    icon: 'Wrench',
    subdivisions: [
      { code: '05 12 00', name: 'Structural Steel' },
      { code: '05 50 00', name: 'Metal Fabrications' },
      { code: '05 70 00', name: 'Decorative Metal' },
    ],
  },
  {
    code: '06',
    name: 'Wood, Plastics & Composites',
    icon: 'TreePine',
    subdivisions: [
      { code: '06 10 00', name: 'Rough Carpentry' },
      { code: '06 20 00', name: 'Finish Carpentry' },
      { code: '06 40 00', name: 'Architectural Woodwork' },
    ],
  },
  {
    code: '08',
    name: 'Openings',
    icon: 'DoorOpen',
    subdivisions: [
      { code: '08 11 00', name: 'Doors & Frames' },
      { code: '08 50 00', name: 'Windows' },
      { code: '08 71 00', name: 'Hardware' },
      { code: '08 80 00', name: 'Glazing' },
    ],
  },
  {
    code: '09',
    name: 'Finishes',
    icon: 'PaintBucket',
    subdivisions: [
      { code: '09 20 00', name: 'Plaster & Gypsum Board' },
      { code: '09 30 00', name: 'Tile' },
      { code: '09 60 00', name: 'Flooring' },
      { code: '09 91 00', name: 'Painting' },
      { code: '09 72 00', name: 'Wall Coverings' },
    ],
  },
  {
    code: '10',
    name: 'Specialties',
    icon: 'Signpost',
    subdivisions: [
      { code: '10 14 00', name: 'Signage' },
      { code: '10 28 00', name: 'Toilet Accessories' },
      { code: '10 44 00', name: 'Fire Extinguishers' },
    ],
  },
  {
    code: '11',
    name: 'Equipment',
    icon: 'Refrigerator',
    subdivisions: [
      { code: '11 31 00', name: 'Appliances' },
      { code: '11 05 00', name: 'Loading Dock Equipment' },
    ],
  },
  {
    code: '12',
    name: 'Furnishings',
    icon: 'Armchair',
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
    id: '1',
    name: 'Kitchen Cabinets — Unit A',
    description: 'Maple, shaker style, soft-close',
    csiCode: '12 32 00',
    csiDivision: '12',
    csiLabel: 'Casework / Cabinets',
    locations: ['Bldg A › L1 › Kitchen'],
    vendor: 'ABC Millwork',
    requiresSubmittal: true,
    submittalTypes: ['shop_drawings', 'product_data'],
    status: 'ready',
    notes: '',
  },
  {
    id: '2',
    name: 'Kitchen Cabinets — Unit B',
    description: 'Style TBD — owner reviewing options',
    csiCode: '12 32 00',
    csiDivision: '12',
    csiLabel: 'Casework / Cabinets',
    locations: ['Bldg A › L1 › Unit B'],
    vendor: 'ABC Millwork',
    requiresSubmittal: true,
    submittalTypes: ['shop_drawings', 'samples'],
    status: 'pending_selection',
    notes: 'Owner reviewing 3 finish options',
  },
  {
    id: '3',
    name: 'Bathroom Vanities — All Units',
    description: 'Standard vanity, spec pending',
    csiCode: '12 32 00',
    csiDivision: '12',
    csiLabel: 'Casework / Cabinets',
    locations: ['All Locations'],
    vendor: null,
    requiresSubmittal: true,
    submittalTypes: ['shop_drawings', 'product_data'],
    status: 'missing_design',
    notes: 'Waiting on architect vanity layout',
  },
  {
    id: '4',
    name: 'Granite Countertops — Kitchen',
    description: 'Per allowance spec, color selected',
    csiCode: '12 36 00',
    csiDivision: '12',
    csiLabel: 'Countertops',
    locations: ['Bldg A › L1 › Kitchen'],
    vendor: 'Stone World',
    requiresSubmittal: true,
    submittalTypes: ['samples', 'shop_drawings'],
    status: 'ready',
    notes: '',
  },
  {
    id: '5',
    name: 'Structural Steel Package',
    description: 'W-shapes, HSS columns per S-101',
    csiCode: '05 12 00',
    csiDivision: '05',
    csiLabel: 'Structural Steel',
    locations: ['All Locations'],
    vendor: 'Pacific Steel',
    requiresSubmittal: true,
    submittalTypes: ['shop_drawings', 'certificates'],
    status: 'ready',
    notes: '',
  },
  {
    id: '6',
    name: 'Decorative Metal Railing — Lobby',
    description: 'Custom design, pending architect detail',
    csiCode: '05 70 00',
    csiDivision: '05',
    csiLabel: 'Decorative Metal',
    locations: ['Bldg A › L1 › Lobby'],
    vendor: null,
    requiresSubmittal: true,
    submittalTypes: ['shop_drawings', 'samples'],
    status: 'missing_design',
    notes: 'Architect revising railing detail',
  },
  {
    id: '7',
    name: 'Interior Paint — All Units',
    description: 'Colors not yet selected by designer',
    csiCode: '09 91 00',
    csiDivision: '09',
    csiLabel: 'Painting',
    locations: ['All Interior'],
    vendor: null,
    requiresSubmittal: true,
    submittalTypes: ['product_data', 'samples'],
    status: 'pending_selection',
    notes: 'Designer presenting color palette next week',
  },
  {
    id: '8',
    name: 'Lobby Stone Flooring',
    description: 'Architect redesigning lobby layout',
    csiCode: '09 60 00',
    csiDivision: '09',
    csiLabel: 'Flooring',
    locations: ['Bldg A › L1 › Lobby'],
    vendor: null,
    requiresSubmittal: true,
    submittalTypes: ['samples', 'mockups'],
    status: 'missing_design',
    notes: 'Lobby redesign in progress',
  },
  {
    id: '9',
    name: 'Tile — Master Bath',
    description: 'Porcelain floor and wall tile',
    csiCode: '09 30 00',
    csiDivision: '09',
    csiLabel: 'Tile',
    locations: ['Bldg A › L1 › Master Bath'],
    vendor: 'TileMax',
    requiresSubmittal: true,
    submittalTypes: ['product_data', 'samples'],
    status: 'pending_selection',
    notes: 'Owner selecting from 3 options',
  },
  {
    id: '10',
    name: 'Retaining Wall — East',
    description: 'Structural engineer pending geotech report',
    csiCode: '03 30 00',
    csiDivision: '03',
    csiLabel: 'Precast Concrete',
    locations: ['Exterior › East Side'],
    vendor: 'Metro Concrete',
    requiresSubmittal: true,
    submittalTypes: ['design_mix', 'shop_drawings'],
    status: 'missing_design',
    notes: 'Geotech report expected in 2 weeks',
  },
  {
    id: '11',
    name: 'Appliance Package — All Units',
    description: 'Per owner allowance specs',
    csiCode: '11 31 00',
    csiDivision: '11',
    csiLabel: 'Appliances',
    locations: ['All Locations'],
    vendor: 'HomeStyle Supply',
    requiresSubmittal: false,
    submittalTypes: [],
    status: 'ready',
    notes: '',
  },
  {
    id: '12',
    name: 'Entry Doors & Frames',
    description: 'Hollow metal frames, solid core doors',
    csiCode: '08 11 00',
    csiDivision: '08',
    csiLabel: 'Doors & Frames',
    locations: ['All Locations'],
    vendor: 'DoorCraft Inc.',
    requiresSubmittal: true,
    submittalTypes: ['shop_drawings', 'product_data', 'warranties'],
    status: 'ready',
    notes: '',
  },
];
```

- [ ] **Step 2: Verify the file compiles**

Run: `npx tsc --noEmit src/pages/app/pre-bid/sampleData.ts`

If tsc isn't configured for standalone files, just check the dev server has no errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/app/pre-bid/sampleData.ts
git commit -m "feat: add sample data and types for JiTpro Core mockup"
```

---

### Task 2: Scope Builder — Division Card Grid

**Files:**
- Create: `src/pages/app/pre-bid/ScopeBuilderCards.tsx`

- [ ] **Step 1: Create the division card grid component**

```tsx
// src/pages/app/pre-bid/ScopeBuilderCards.tsx
import {
  Blocks, Wrench, TreePine, DoorOpen, PaintBucket,
  Signpost, Refrigerator, Armchair,
} from 'lucide-react';
import type { CsiDivision, ProcurementItem } from './sampleData';

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Blocks, Wrench, TreePine, DoorOpen, PaintBucket,
  Signpost, Refrigerator, Armchair,
};

interface ScopeBuilderCardsProps {
  divisions: CsiDivision[];
  items: ProcurementItem[];
  onSelectDivision: (divisionCode: string) => void;
}

export function ScopeBuilderCards({ divisions, items, onSelectDivision }: ScopeBuilderCardsProps) {
  const getItemCount = (divCode: string) =>
    items.filter((item) => item.csiDivision === divCode).length;

  return (
    <div className="p-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {divisions.map((div) => {
          const Icon = iconMap[div.icon] || Blocks;
          const count = getItemCount(div.code);
          return (
            <button
              key={div.code}
              onClick={() => onSelectDivision(div.code)}
              className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 bg-white p-6 text-center transition-colors hover:border-slate-300 hover:bg-slate-50"
            >
              <Icon size={28} className="text-slate-600" />
              <div className="text-sm font-semibold text-slate-900">{div.name}</div>
              <div className="text-xs text-slate-400">{div.code}</div>
              <span
                className={`mt-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  count > 0
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                {count} {count === 1 ? 'item' : 'items'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/app/pre-bid/ScopeBuilderCards.tsx
git commit -m "feat: add Scope Builder division card grid component"
```

---

### Task 3: CSI Tree Sidebar

**Files:**
- Create: `src/pages/app/pre-bid/CsiTree.tsx`

- [ ] **Step 1: Create the CSI tree sidebar component**

```tsx
// src/pages/app/pre-bid/CsiTree.tsx
import { ArrowLeft, ChevronDown, ChevronRight } from 'lucide-react';
import type { CsiDivision } from './sampleData';

interface CsiTreeProps {
  divisions: CsiDivision[];
  activeDivision: string;
  activeSubdivision: string | null;
  onSelectDivision: (code: string) => void;
  onSelectSubdivision: (code: string) => void;
  onBackToCards: () => void;
}

export function CsiTree({
  divisions,
  activeDivision,
  activeSubdivision,
  onSelectDivision,
  onSelectSubdivision,
  onBackToCards,
}: CsiTreeProps) {
  return (
    <div className="flex w-[220px] flex-shrink-0 flex-col bg-slate-800">
      <button
        onClick={onBackToCards}
        className="flex items-center gap-2 border-b border-slate-700 px-4 py-3 text-xs text-slate-400 transition-colors hover:text-slate-200"
      >
        <ArrowLeft size={14} />
        Back to Divisions
      </button>
      <div className="flex-1 overflow-y-auto py-2">
        {divisions.map((div) => {
          const isActive = div.code === activeDivision;
          return (
            <div key={div.code}>
              <button
                onClick={() => onSelectDivision(div.code)}
                className={`flex w-full items-center justify-between px-4 py-2 text-left text-xs transition-colors ${
                  isActive
                    ? 'bg-slate-700 font-semibold text-white'
                    : 'text-slate-400 hover:bg-slate-700/50 hover:text-slate-200'
                }`}
              >
                <span>{div.code} - {div.name}</span>
                {isActive ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              {isActive &&
                div.subdivisions.map((sub) => (
                  <button
                    key={sub.code}
                    onClick={() => onSelectSubdivision(sub.code)}
                    className={`flex w-full items-center border-l-2 py-1.5 pl-6 pr-4 text-left text-[11px] transition-colors ${
                      activeSubdivision === sub.code
                        ? 'border-amber-500 font-medium text-white'
                        : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {sub.name}
                  </button>
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/app/pre-bid/CsiTree.tsx
git commit -m "feat: add CSI tree sidebar for Scope Builder split panel"
```

---

### Task 4: Item List Component

**Files:**
- Create: `src/pages/app/pre-bid/ItemList.tsx`

- [ ] **Step 1: Create the item list component for the right panel**

```tsx
// src/pages/app/pre-bid/ItemList.tsx
import type { ProcurementItem } from './sampleData';
import { statusConfig, submittalTypeLabels } from './sampleData';

interface ItemListProps {
  items: ProcurementItem[];
  subdivisionCode: string | null;
  subdivisionName: string;
  onAddItem: () => void;
}

export function ItemList({ items, subdivisionCode, subdivisionName, onAddItem }: ItemListProps) {
  const filtered = subdivisionCode
    ? items.filter((item) => item.csiCode === subdivisionCode)
    : [];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            {subdivisionCode ? `${subdivisionCode} — ${subdivisionName}` : 'Select a subdivision'}
          </h2>
          {subdivisionCode && (
            <p className="mt-0.5 text-xs text-slate-400">
              {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
            </p>
          )}
        </div>
      </div>

      {filtered.length === 0 && subdivisionCode && (
        <div className="flex h-24 items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50">
          <p className="text-xs text-slate-400">No items yet</p>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map((item) => {
          const sc = statusConfig[item.status];
          return (
            <div
              key={item.id}
              className="rounded-lg border border-slate-200 bg-white p-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-900">{item.name}</div>
                  {item.description && (
                    <div className="mt-0.5 text-xs text-slate-400">{item.description}</div>
                  )}
                  <div className="mt-1.5 text-xs text-slate-500">
                    {item.locations.join(', ')}
                    {item.vendor && <> · {item.vendor}</>}
                  </div>
                </div>
                <span className={`ml-2 flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${sc.badgeClass}`}>
                  {sc.label}
                </span>
              </div>
              {item.submittalTypes.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.submittalTypes.map((type) => (
                    <span
                      key={type}
                      className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-500"
                    >
                      {submittalTypeLabels[type]}
                    </span>
                  ))}
                </div>
              )}
              {!item.requiresSubmittal && (
                <div className="mt-2">
                  <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-400">
                    No submittal
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {subdivisionCode && (
        <button
          onClick={onAddItem}
          className="mt-4 rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
        >
          + Add Procurement Item
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/app/pre-bid/ItemList.tsx
git commit -m "feat: add item list component for Scope Builder right panel"
```

---

### Task 5: Add Item Form

**Files:**
- Create: `src/pages/app/pre-bid/AddItemForm.tsx`

- [ ] **Step 1: Create the inline add item form**

```tsx
// src/pages/app/pre-bid/AddItemForm.tsx
import { useState } from 'react';
import type { ProcurementItem, SubmittalType, ItemStatus } from './sampleData';
import { submittalTypeLabels, sampleLocations } from './sampleData';

const allSubmittalTypes: SubmittalType[] = [
  'shop_drawings', 'product_data', 'samples', 'mockups',
  'certificates', 'design_mix', 'manufacturer_instructions', 'warranties',
];

const statusOptions: { value: ItemStatus; label: string }[] = [
  { value: 'ready', label: 'Ready' },
  { value: 'pending_selection', label: 'Pending Selection' },
  { value: 'missing_design', label: 'Missing Design' },
];

interface AddItemFormProps {
  csiCode: string;
  csiDivision: string;
  csiLabel: string;
  onSave: (item: ProcurementItem) => void;
  onCancel: () => void;
}

export function AddItemForm({ csiCode, csiDivision, csiLabel, onSave, onCancel }: AddItemFormProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [vendor, setVendor] = useState('');
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [requiresSubmittal, setRequiresSubmittal] = useState(true);
  const [submittalTypes, setSubmittalTypes] = useState<SubmittalType[]>([]);
  const [status, setStatus] = useState<ItemStatus>('pending_selection');
  const [notes, setNotes] = useState('');
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  const toggleSubmittalType = (type: SubmittalType) => {
    setSubmittalTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const addLocation = (loc: string) => {
    if (!selectedLocations.includes(loc)) {
      setSelectedLocations((prev) => [...prev, loc]);
    }
    setShowLocationPicker(false);
  };

  const removeLocation = (loc: string) => {
    setSelectedLocations((prev) => prev.filter((l) => l !== loc));
  };

  const handleSave = () => {
    if (!name.trim() || selectedLocations.length === 0) return;
    onSave({
      id: `new-${Date.now()}`,
      name: name.trim(),
      description: description.trim(),
      csiCode,
      csiDivision,
      csiLabel,
      locations: selectedLocations,
      vendor: vendor.trim() || null,
      requiresSubmittal,
      submittalTypes: requiresSubmittal ? submittalTypes : [],
      status,
      notes: notes.trim(),
    });
  };

  const inputClass = 'w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-300';
  const labelClass = 'block text-xs font-semibold text-slate-600 mb-1';

  return (
    <div className="mt-4 rounded-lg border-2 border-amber-400 bg-white p-4">
      <div className="mb-4 text-sm font-semibold text-slate-900">New Procurement Item</div>

      <div className="grid gap-3 md:grid-cols-2">
        <div>
          <label className={labelClass}>Item Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Master Bath Cabinets"
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Vendor</label>
          <input
            type="text"
            value={vendor}
            onChange={(e) => setVendor(e.target.value)}
            placeholder="Select or add vendor..."
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-3">
        <label className={labelClass}>Location(s) *</label>
        <div className="flex flex-wrap gap-1.5">
          {selectedLocations.map((loc) => (
            <span
              key={loc}
              className="flex items-center gap-1 rounded-full bg-slate-800 px-2.5 py-1 text-xs text-white"
            >
              {loc}
              <button onClick={() => removeLocation(loc)} className="ml-0.5 text-slate-400 hover:text-white">✕</button>
            </span>
          ))}
          <div className="relative">
            <button
              onClick={() => setShowLocationPicker(!showLocationPicker)}
              className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-400 transition-colors hover:bg-slate-100"
            >
              + Add location
            </button>
            {showLocationPicker && (
              <div className="absolute left-0 top-full z-10 mt-1 w-56 rounded-md border border-slate-200 bg-white py-1 shadow-lg">
                {sampleLocations
                  .filter((loc) => !selectedLocations.includes(loc))
                  .map((loc) => (
                    <button
                      key={loc}
                      onClick={() => addLocation(loc)}
                      className="block w-full px-3 py-1.5 text-left text-xs text-slate-600 transition-colors hover:bg-slate-50"
                    >
                      {loc}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3">
        <label className={labelClass}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional notes about this item..."
          rows={2}
          className={inputClass}
        />
      </div>

      <div className="mt-3">
        <label className={labelClass}>Status</label>
        <div className="flex gap-1.5">
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatus(opt.value)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                status === opt.value
                  ? 'bg-slate-800 text-white'
                  : 'border border-slate-200 bg-slate-50 text-slate-400 hover:bg-slate-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <label className="text-xs font-semibold text-slate-600">Requires Submittal?</label>
        <div className="flex gap-1">
          <button
            onClick={() => setRequiresSubmittal(true)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              requiresSubmittal ? 'bg-slate-800 text-white' : 'border border-slate-200 bg-slate-50 text-slate-400'
            }`}
          >
            Yes
          </button>
          <button
            onClick={() => setRequiresSubmittal(false)}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              !requiresSubmittal ? 'bg-slate-800 text-white' : 'border border-slate-200 bg-slate-50 text-slate-400'
            }`}
          >
            No
          </button>
        </div>
      </div>

      {requiresSubmittal && (
        <div className="mt-3 rounded-md bg-slate-50 p-3">
          <label className="mb-2 block text-xs font-semibold text-slate-600">Submittal Types Required</label>
          <div className="flex flex-wrap gap-1.5">
            {allSubmittalTypes.map((type) => (
              <button
                key={type}
                onClick={() => toggleSubmittalType(type)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  submittalTypes.includes(type)
                    ? 'bg-slate-800 text-white'
                    : 'border border-slate-200 bg-white text-slate-400 hover:bg-slate-100'
                }`}
              >
                {submittalTypes.includes(type) && '✓ '}
                {submittalTypeLabels[type]}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3">
        <label className={labelClass}>Notes</label>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Optional notes..."
          className={inputClass}
        />
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm text-slate-400 transition-colors hover:text-slate-600"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
        >
          Save Item
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/app/pre-bid/AddItemForm.tsx
git commit -m "feat: add inline procurement item form for Scope Builder"
```

---

### Task 6: Split Panel Container

**Files:**
- Create: `src/pages/app/pre-bid/ScopeBuilderSplitPanel.tsx`

- [ ] **Step 1: Create the split panel that combines CsiTree, ItemList, and AddItemForm**

```tsx
// src/pages/app/pre-bid/ScopeBuilderSplitPanel.tsx
import { useState } from 'react';
import { CsiTree } from './CsiTree';
import { ItemList } from './ItemList';
import { AddItemForm } from './AddItemForm';
import type { CsiDivision, ProcurementItem } from './sampleData';

interface ScopeBuilderSplitPanelProps {
  divisions: CsiDivision[];
  items: ProcurementItem[];
  onItemsChange: (items: ProcurementItem[]) => void;
  initialDivision: string;
  onBackToCards: () => void;
}

export function ScopeBuilderSplitPanel({
  divisions,
  items,
  onItemsChange,
  initialDivision,
  onBackToCards,
}: ScopeBuilderSplitPanelProps) {
  const [activeDivision, setActiveDivision] = useState(initialDivision);
  const [activeSubdivision, setActiveSubdivision] = useState<string | null>(() => {
    const div = divisions.find((d) => d.code === initialDivision);
    return div?.subdivisions[0]?.code ?? null;
  });
  const [showAddForm, setShowAddForm] = useState(false);

  const handleSelectDivision = (code: string) => {
    setActiveDivision(code);
    const div = divisions.find((d) => d.code === code);
    setActiveSubdivision(div?.subdivisions[0]?.code ?? null);
    setShowAddForm(false);
  };

  const handleSelectSubdivision = (code: string) => {
    setActiveSubdivision(code);
    setShowAddForm(false);
  };

  const handleSaveItem = (item: ProcurementItem) => {
    onItemsChange([...items, item]);
    setShowAddForm(false);
  };

  const activeDiv = divisions.find((d) => d.code === activeDivision);
  const activeSub = activeDiv?.subdivisions.find((s) => s.code === activeSubdivision);

  return (
    <div className="flex flex-1 overflow-hidden">
      <CsiTree
        divisions={divisions}
        activeDivision={activeDivision}
        activeSubdivision={activeSubdivision}
        onSelectDivision={handleSelectDivision}
        onSelectSubdivision={handleSelectSubdivision}
        onBackToCards={onBackToCards}
      />
      <div className="flex-1 overflow-y-auto p-5">
        <ItemList
          items={items}
          subdivisionCode={activeSubdivision}
          subdivisionName={activeSub?.name ?? ''}
          onAddItem={() => setShowAddForm(true)}
        />
        {showAddForm && activeSubdivision && activeSub && (
          <AddItemForm
            csiCode={activeSubdivision}
            csiDivision={activeDivision}
            csiLabel={activeSub.name}
            onSave={handleSaveItem}
            onCancel={() => setShowAddForm(false)}
          />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/app/pre-bid/ScopeBuilderSplitPanel.tsx
git commit -m "feat: add split panel container for Scope Builder"
```

---

### Task 7: Scope Builder Main Page

**Files:**
- Create: `src/pages/app/pre-bid/ScopeBuilder.tsx`

- [ ] **Step 1: Create the main Scope Builder page that switches between card grid and split panel**

```tsx
// src/pages/app/pre-bid/ScopeBuilder.tsx
import { useState } from 'react';
import { PageHeader } from '../../../components/PageHeader';
import { ScopeBuilderCards } from './ScopeBuilderCards';
import { ScopeBuilderSplitPanel } from './ScopeBuilderSplitPanel';
import { sampleDivisions, sampleItems } from './sampleData';
import type { ProcurementItem } from './sampleData';

export function ScopeBuilder() {
  const [items, setItems] = useState<ProcurementItem[]>([...sampleItems]);
  const [selectedDivision, setSelectedDivision] = useState<string | null>(null);

  const stats = `${items.length} items across ${new Set(items.map((i) => i.csiDivision)).size} divisions`;

  return (
    <div className="flex h-full flex-col">
      <PageHeader title="Scope Builder" stats={stats} />
      {selectedDivision === null ? (
        <ScopeBuilderCards
          divisions={sampleDivisions}
          items={items}
          onSelectDivision={setSelectedDivision}
        />
      ) : (
        <ScopeBuilderSplitPanel
          divisions={sampleDivisions}
          items={items}
          onItemsChange={setItems}
          initialDivision={selectedDivision}
          onBackToCards={() => setSelectedDivision(null)}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/app/pre-bid/ScopeBuilder.tsx
git commit -m "feat: add Scope Builder main page with card/split panel views"
```

---

### Task 8: Selection Register Table

**Files:**
- Create: `src/pages/app/pre-bid/SelectionRegister.tsx`

- [ ] **Step 1: Create the sortable, filterable register table**

```tsx
// src/pages/app/pre-bid/SelectionRegister.tsx
import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search } from 'lucide-react';
import { PageHeader } from '../../../components/PageHeader';
import { sampleItems, sampleDivisions, statusConfig, submittalTypeLabels } from './sampleData';
import type { ProcurementItem, ItemStatus } from './sampleData';

type SortKey = 'name' | 'csiCode' | 'location' | 'vendor' | 'status';
type SortDir = 'asc' | 'desc';

const statusOrder: Record<ItemStatus, number> = {
  missing_design: 0,
  pending_selection: 1,
  ready: 2,
};

export function SelectionRegister() {
  const [items] = useState<ProcurementItem[]>([...sampleItems]);
  const [search, setSearch] = useState('');
  const [filterDivision, setFilterDivision] = useState('');
  const [filterVendor, setFilterVendor] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('status');
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  const uniqueVendors = useMemo(
    () => [...new Set(items.map((i) => i.vendor).filter(Boolean))] as string[],
    [items]
  );
  const uniqueLocations = useMemo(
    () => [...new Set(items.flatMap((i) => i.locations))],
    [items]
  );

  const filtered = useMemo(() => {
    let result = items;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((i) => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    }
    if (filterDivision) result = result.filter((i) => i.csiDivision === filterDivision);
    if (filterVendor) result = result.filter((i) => i.vendor === filterVendor);
    if (filterStatus) result = result.filter((i) => i.status === filterStatus);
    if (filterLocation) result = result.filter((i) => i.locations.includes(filterLocation));
    return result;
  }, [items, search, filterDivision, filterVendor, filterStatus, filterLocation]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case 'name': cmp = a.name.localeCompare(b.name); break;
        case 'csiCode': cmp = a.csiCode.localeCompare(b.csiCode); break;
        case 'location': cmp = (a.locations[0] || '').localeCompare(b.locations[0] || ''); break;
        case 'vendor': cmp = (a.vendor || 'zzz').localeCompare(b.vendor || 'zzz'); break;
        case 'status': cmp = statusOrder[a.status] - statusOrder[b.status]; break;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return arr;
  }, [filtered, sortKey, sortDir]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <span className="ml-1 text-slate-300">↕</span>;
    return sortDir === 'asc' ? <ChevronUp size={12} className="ml-0.5 inline" /> : <ChevronDown size={12} className="ml-0.5 inline" />;
  };

  const selectClass = 'rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-300';

  return (
    <div className="flex h-full flex-col">
      <PageHeader
        title="Specification / Selection Register"
        stats={`${sorted.length} of ${items.length} items`}
      />

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 bg-slate-50 px-5 py-3">
        <span className="text-xs font-semibold text-slate-600">Filter:</span>
        <select value={filterDivision} onChange={(e) => setFilterDivision(e.target.value)} className={selectClass}>
          <option value="">All Divisions</option>
          {sampleDivisions.map((d) => (
            <option key={d.code} value={d.code}>{d.code} - {d.name}</option>
          ))}
        </select>
        <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} className={selectClass}>
          <option value="">All Locations</option>
          {uniqueLocations.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
        <select value={filterVendor} onChange={(e) => setFilterVendor(e.target.value)} className={selectClass}>
          <option value="">All Vendors</option>
          {uniqueVendors.map((v) => (
            <option key={v} value={v}>{v}</option>
          ))}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={selectClass}>
          <option value="">All Statuses</option>
          <option value="ready">Ready</option>
          <option value="pending_selection">Pending Selection</option>
          <option value="missing_design">Missing Design</option>
        </select>
        <div className="ml-auto flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2.5 py-1.5">
          <Search size={12} className="text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items..."
            className="w-36 border-0 bg-transparent text-xs text-slate-600 placeholder-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="border-b-2 border-slate-200 bg-slate-50">
              <th onClick={() => handleSort('name')} className="cursor-pointer px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Item <SortIcon col="name" />
              </th>
              <th onClick={() => handleSort('csiCode')} className="cursor-pointer px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                CSI Code <SortIcon col="csiCode" />
              </th>
              <th onClick={() => handleSort('location')} className="cursor-pointer px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Location <SortIcon col="location" />
              </th>
              <th onClick={() => handleSort('vendor')} className="cursor-pointer px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Vendor <SortIcon col="vendor" />
              </th>
              <th className="px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Submittals
              </th>
              <th onClick={() => handleSort('status')} className="cursor-pointer px-4 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Status <SortIcon col="status" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((item) => {
              const sc = statusConfig[item.status];
              return (
                <tr key={item.id} className={`border-b border-slate-100 ${sc.rowClass}`}>
                  <td className="px-4 py-3">
                    <div className="text-sm font-semibold text-slate-900">{item.name}</div>
                    {(item.description || item.notes) && (
                      <div className="mt-0.5 text-[11px] text-slate-400">{item.description || item.notes}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-500">{item.csiCode}</td>
                  <td className="px-4 py-3 text-slate-500">{item.locations.join(', ')}</td>
                  <td className="px-4 py-3">
                    {item.vendor ? (
                      <span className="text-slate-500">{item.vendor}</span>
                    ) : (
                      <span className="italic text-slate-400">Not assigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {item.submittalTypes.length > 0 ? (
                        item.submittalTypes.map((type) => (
                          <span key={type} className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-500">
                            {submittalTypeLabels[type]}
                          </span>
                        ))
                      ) : (
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-400">No submittal</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${sc.badgeClass}`}>
                      {sc.label}
                    </span>
                  </td>
                </tr>
              );
            })}
            {sorted.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">
                  No items match your filters
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/pages/app/pre-bid/SelectionRegister.tsx
git commit -m "feat: add Spec/Selection Register table with sort and filter"
```

---

### Task 9: Wire Routes in App.tsx

**Files:**
- Modify: `src/App.tsx:98-101`

- [ ] **Step 1: Add imports and routes**

Add these imports at the top of `src/App.tsx`:

```tsx
import { ScopeBuilder } from './pages/app/pre-bid/ScopeBuilder';
import { SelectionRegister } from './pages/app/pre-bid/SelectionRegister';
```

Inside the `/app` route block (after the `<Route path="home" ...>` line), add:

```tsx
<Route path="pre-bid/scope-builder" element={<ScopeBuilder />} />
<Route path="pre-bid/selection-register" element={<SelectionRegister />} />
```

- [ ] **Step 2: Verify dev server has no errors**

Run: `npm run dev` and navigate to `http://localhost:5173/app/pre-bid/scope-builder`

Verify:
- Card grid loads with 8 division cards
- Clicking a card shows the split panel
- Items display correctly under subdivisions
- Add Item form opens inline with amber border
- Saving an item adds it to the list

Then navigate to `http://localhost:5173/app/pre-bid/selection-register`

Verify:
- Table loads with 12 sample items
- Filter dropdowns work (division, location, vendor, status)
- Search works
- Column sorting works
- Status badges and row colors are correct

- [ ] **Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire Scope Builder and Selection Register routes"
```

---

### Task 10: Verify & Final Commit

- [ ] **Step 1: Full smoke test**

Navigate through the full flow:
1. `/app/home` — click "Scope Builder" in left nav
2. See 8 division cards with item counts
3. Click "Furnishings" — split panel loads with CSI tree
4. Click "Casework / Cabinets" — see 3 items
5. Click "+ Add Procurement Item" — inline form appears
6. Fill out form and save — item appears in list
7. Click "Selection Register" in left nav
8. See all items in table, sorted by status (missing first)
9. Filter by vendor "ABC Millwork" — see 2 items
10. Search "lobby" — see Lobby Stone Flooring
11. Sort by CSI Code — verify sort works

- [ ] **Step 2: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: address any issues found during smoke test"
```

Only create this commit if changes were made. If smoke test passed clean, skip.
