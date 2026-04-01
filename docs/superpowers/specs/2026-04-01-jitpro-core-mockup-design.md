# JiTpro Core Mockup — UI Design

## What We're Building

Interactive mockups for JiTpro Core's two tools — Scope Builder and Spec/Selection Register. These are functional React components with hardcoded sample data, living inside the existing AppShell at the routes already defined in `navConfig.ts`:

- `/app/pre-bid/scope-builder`
- `/app/pre-bid/selection-register`

All sample data will be replaced when Supabase is connected. No database, no API calls — just UI with local state.

## Design Decisions (Validated via Visual Companion)

| Decision | Choice | Alternatives Considered |
|----------|--------|------------------------|
| Division landing layout | Card Grid | Accordion List, Hybrid expand |
| Drill-down pattern | Split Panel (CSI tree left, items right) | Full page navigation with breadcrumbs |
| Add item form | Inline in right panel | Slide-out overlay panel |
| Spec Register | Single sortable/filterable table | Dashboard + table, Donut chart + action lists |

---

## Screen 1: Scope Builder — Division Cards

**Route:** `/app/pre-bid/scope-builder`

**Layout:** Responsive card grid (4 columns desktop, 2 tablet, 1 mobile) inside the AppShell main content area.

**Each card shows:**
- Division icon (lucide icon or emoji placeholder)
- Division name (always visible)
- Division number (shown/hidden per company `showCostCodeNumbers` preference)
- Item count badge (amber if items exist, gray if zero)

**Interaction:** Clicking a card transitions to the Split Panel view for that division.

**Sample divisions (8):**
03 Concrete, 05 Metals, 06 Wood/Plastics/Composites, 08 Openings, 09 Finishes, 10 Specialties, 11 Equipment, 12 Furnishings

---

## Screen 2: Scope Builder — Split Panel

**Route:** Same as above — state-driven, not a separate route.

**Left sidebar (CSI Tree):**
- Dark background (`bg-slate-800`) to match the app's left nav feel
- Width: ~220px, not collapsible (separate from the app's main LeftNav)
- Shows all divisions as top-level nodes
- Active division expanded to show subdivisions
- Selected node highlighted with amber left border accent
- Clicking any node updates the right panel
- "Back to Cards" link at top to return to the grid view

**Right panel (Items + Form):**
- Header: selected CSI code + name, item count
- List of existing items as compact cards showing:
  - Item name (bold) + description (secondary line)
  - Location, vendor
  - Submittal type tags
  - Status badge (Ready / Pending Selection / Missing Design)
- "+ Add Procurement Item" button at bottom
- Clicking the button reveals the inline form

**Inline Add Form (amber border highlight):**
- Item Name (text input, required)
- Vendor (select/add, optional)
- Location(s) (tag-style multi-select, required)
- Description (textarea, optional)
- Requires Submittal toggle (Yes/No)
- If Yes: submittal type checkboxes (Shop Drawings, Product Data, Samples, Mockups, Certificates, Design Mix, Mfr Instructions, Warranties)
- Save / Cancel buttons

---

## Screen 3: Spec/Selection Register — Table

**Route:** `/app/pre-bid/selection-register`

**Filter bar (top):**
- Dropdown filters: CSI Division, Location, Vendor, Status
- Search input for item name
- Item count display

**Table columns (all sortable):**
| Column | Content |
|--------|---------|
| Item | Name (bold) + notes/description (secondary line) |
| CSI Code | Numeric code (e.g., 12 32 00) |
| Location | Hierarchical path (e.g., Bldg A > L1 > Kitchen) |
| Vendor | Vendor name, or "Not assigned" in italic gray |
| Submittals | Tags for each type, or "No submittal" |
| Status | Color-coded badge |

**Status badges:**
- **Ready** — green badge, white row background
- **Pending Selection** — amber badge, light amber row background (`bg-amber-50`)
- **Missing Design** — red badge, light red row background (`bg-red-50`)

**Data source:** Same sample data as Scope Builder — the register reads from the same item array. Items are added/edited in Scope Builder; status can be updated in the register.

---

## Data Model (Sample/Mockup)

```typescript
interface ProcurementItem {
  id: string;
  name: string;
  description: string;
  csiCode: string;       // e.g., "12 32 00"
  csiDivision: string;   // e.g., "12"
  csiLabel: string;      // e.g., "Casework / Cabinets"
  locations: string[];   // e.g., ["Bldg A > L1 > Kitchen"]
  vendor: string | null;
  requiresSubmittal: boolean;
  submittalTypes: SubmittalType[];
  status: 'ready' | 'pending_selection' | 'missing_design';
  notes: string;
}

type SubmittalType =
  | 'shop_drawings'
  | 'product_data'
  | 'samples'
  | 'mockups'
  | 'certificates'
  | 'design_mix'
  | 'manufacturer_instructions'
  | 'warranties';

interface CsiDivision {
  code: string;         // "12"
  name: string;         // "Furnishings"
  subdivisions: CsiSubdivision[];
}

interface CsiSubdivision {
  code: string;         // "12 32 00"
  name: string;         // "Casework / Cabinets"
}
```

---

## Component Structure

```
src/pages/app/pre-bid/
  ScopeBuilder.tsx              — Main page: manages view state (cards vs split panel)
  ScopeBuilderCards.tsx         — Division card grid
  ScopeBuilderSplitPanel.tsx    — Split panel (tree + items)
  CsiTree.tsx                   — Left sidebar CSI tree navigation
  ItemList.tsx                  — Right panel item list
  AddItemForm.tsx               — Inline add/edit form
  SelectionRegister.tsx         — Table view with filters
  sampleData.ts                 — All hardcoded sample divisions, items, locations
```

---

## Routing

Add to `App.tsx` inside the `/app` route:

```tsx
<Route path="pre-bid/scope-builder" element={<ScopeBuilder />} />
<Route path="pre-bid/selection-register" element={<SelectionRegister />} />
```

---

## Styling

- Follow existing AppShell patterns (PageHeader component, spacing, typography)
- Use `bg-slate-800` for CSI tree sidebar (matches app LeftNav)
- Use existing button color `bg-slate-800` / `hover:bg-slate-700` for all buttons
- Amber (`#f59e0b` / `bg-amber-500`) for accents: item count badges, active node indicator, form border
- Status colors: green (`bg-green-100` text `text-green-700`), amber (`bg-amber-100` text `text-amber-700`), red (`bg-red-100` text `text-red-700`)
- All sample data hardcoded — no Supabase calls

---

## What's NOT in This Mockup

- No database persistence (local React state only)
- No authentication-gated features
- No progress tracking or dashboards (Control Tower)
- No procurement timeline integration
- No project location setup UI (locations are hardcoded in sample data)
- No company cost code integration (sample CSI divisions used)
