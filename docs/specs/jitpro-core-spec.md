# JiTpro Core — Product Specification

## Overview

JiTpro Core is a subscription-based toolset that helps general contractors identify, organize, and track every procurement item on a project — and manage the flow of missing information from the earliest stages through construction.

Core includes two standalone tools:

1. **Scope Builder** — Systematic identification of all procurement items
2. **Specification/Selection Register** — Tracking of missing design, specs, and selections

---

## Business Model

### JiTpro Core (Monthly Subscription)
- Includes Scope Builder + Spec/Selection Register
- Standalone tools — no additional purchase required to use
- Designed for pre-construction and early project phases

### JiTpro Control Tower (Per-Project Purchase)
- Full procurement timeline management (8-step process)
- One-time cost per project, with optional payment plan to align with client billing
- Direct cost replacement — replaces work the contractor would/should be doing
- Consumes data from Core — no re-entry required
- Core data (items, vendors, locations, specs) flows directly into Control Tower

---

## Scope Builder

### Purpose

Help contractors systematically identify every product and material that needs to be procured for a project, organized by CSI division and project location.

### Navigation & UX

**Two-panel layout: Division Cards landing → Split Panel working view**

1. **Division Cards** (landing view) — Responsive grid of cards (3-4 per row), one per CSI division
   - Shows division name (and numeric code if company preference is "show numbers")
   - Shows count of items already added in that division
   - The "hide numbers" company setting hides numeric codes only — descriptions and structure always visible
   - Clicking a card enters the Split Panel view for that division

2. **Split Panel** (working view) — CSI tree on left, item content on right
   - Left sidebar: collapsible CSI tree showing divisions and subdivisions. Active node highlighted with amber accent. User clicks any node to view/add items.
   - Right panel: shows items for the selected CSI node, with an inline "Add Procurement Item" form
   - No page navigation required — everything on one screen once inside the Scope Builder

3. **Inline Add/Edit Form** — Form appears directly in the right panel below existing items
   - No modals or slide-outs — stays in the flow
   - Amber border highlight on the form to distinguish it from the item list
   - Fields: Item Name, Vendor, Location(s) as tags, Description, Submittal toggle, Submittal type checkboxes
   - Save/Cancel buttons at bottom of form

### Two Organization Modes

Users can navigate their procurement items by:

- **By CSI Division** — "What concrete do I need project-wide?"
- **By Location** — "What do I need for the lobby?"

Both are views into the same underlying data.

### Procurement Item (Atomic Unit)

Each procurement item captures:

| Field | Description |
|-------|-------------|
| **Item Name** | Descriptive name (e.g., "Kitchen Cabinets - Unit A") |
| **Description** | Additional details |
| **CSI Code** | Reference to cost code node |
| **Location(s)** | One or more project locations (required) |
| **Vendor** | Responsible vendor (name, contact) |
| **Requires Submittal** | Yes / No toggle |
| **Submittal Types** | If Yes — one or more from the list below |
| **Design Status** | Final / Pending / Missing |
| **Selection Status** | Made / Pending / Not Required |
| **Notes** | Free text |

### Submittal Types

When a procurement item requires submittals, the user selects which types apply:

- **Shop Drawings** — Detailed fabrication drawings (cabinets, structural steel, curtain wall)
- **Product Data** — Manufacturer cut sheets, spec sheets (appliances, fixtures, equipment)
- **Samples** — Physical material samples (paint colors, tile, flooring, fabric)
- **Mockups** — Full-scale or partial assemblies (concrete walls, curtain wall sections)
- **Certificates / Test Reports** — Material certifications, test results (concrete mix, steel mill certs)
- **Design Mix** — Specific to concrete/asphalt (mix proportions)
- **Manufacturer's Instructions** — Installation instructions required for review
- **Warranties** — Required warranty documentation

A single procurement item may require multiple submittal types (e.g., cabinets may need shop drawings + product data + finish samples).

### Non-Submittal Items

Items flagged as "no submittal required" are still tracked in the system. Missing design or specifications can block procurement and delivery regardless of whether a formal submittal is needed.

### Location Assignment

- Every procurement item requires at least one location
- The same CSI category can produce multiple procurement items because different locations have different specs
- Example: "Kitchen Cabinets - Unit A" (maple, shaker) vs "Kitchen Cabinets - Unit B" (thermofoil, flat panel)
- Locations are where specifications diverge

### Re-Grouping for Procurement

Items are disaggregated during scope building (location by location, area by area — how contractors think when reviewing drawings). But procurement happens at the package level.

Items must be re-groupable by:
- **CSI Code** — All cabinets from all locations bundled into one cabinet procurement package
- **Vendor** — Everything going to Vendor X across divisions
- **Both** — CSI within a vendor, or vendor within a CSI

This re-grouping is critical for Control Tower but the data structure in Core must support it.

---

## Specification / Selection Register

### Purpose

A single, sortable, filterable list of every procurement item on the project — showing whether each item is ready for procurement or blocked by missing design or pending selections.

This is the contractor's working list, not a dashboard. Open it, see what's ready and what's not, filter to what matters, and know where the gaps are.

### Data Source

All items flow in from the Scope Builder. No duplicate entry.

### Status Model (Core)

Each item has one status in Core:

| Status | Color | Meaning |
|--------|-------|---------|
| **Ready** | Green | Design is final and selection is made — item can proceed to procurement |
| **Pending Selection** | Amber | Design exists but product/material selection not yet made |
| **Missing Design** | Red | Design is not yet finalized — blocks everything downstream |

Progress tracking, trend analysis, and timeline management are **Control Tower** features, not Core.

### Single Table View

The register is one screen — a well-designed table with:

**Filter bar:**
- Dropdown filters for CSI Division, Location, Vendor, and Status
- Search box to find items by name

**Sortable columns:**
- Item (name + description/notes on second line)
- CSI Code
- Location
- Vendor
- Submittals (type tags, or "No submittal")
- Status (color-coded badge)

**Row color coding:**
- White background — Ready items
- Light amber background — Pending Selection items
- Light red background — Missing Design items

**Behavior:**
- Clicking an item row allows inline editing of status and details
- New items are added via the Scope Builder, not directly in the register
- Status can be updated directly in the register (e.g., marking an item as Ready once design is finalized)

---

## Project Locations

### Structure

Hierarchical: **Building > Floor/Level > Area/Room**

Examples:
- Building A > Level 1 > Lobby
- Building A > Level 1 > Unit 101
- Building A > Level 2 > Unit 201
- Building B > Level 1 > Common Area
- Exterior > Parking Garage
- Exterior > Landscaping
- Site > Utilities

### Setup

Locations are project-specific and defined during project setup (or on-the-fly within the Scope Builder).

---

## Sample CSI Divisions for Mockup

The following divisions and subdivisions will be used for initial UI mockups. Full cost code schema to be uploaded later.

| Division | Name | Sample Subdivisions |
|----------|------|-------------------|
| 03 | Concrete | Cast-in-Place, Precast, Concrete Repair |
| 05 | Metals | Structural Steel, Metal Fabrications, Decorative Metal |
| 06 | Wood, Plastics, Composites | Rough Carpentry, Finish Carpentry, Architectural Woodwork |
| 08 | Openings | Doors/Frames, Windows, Hardware, Glazing |
| 09 | Finishes | Plaster, Tile, Flooring, Painting, Wall Coverings |
| 10 | Specialties | Signage, Toilet Accessories, Fire Extinguishers |
| 11 | Equipment | Appliances, Loading Dock Equipment |
| 12 | Furnishings | Casework/Cabinets, Countertops, Window Treatments |

All sample data is placeholder and will be replaced when connected to Supabase.

---

## Mockup Screen Plan

Priority screens to build:

1. **Scope Builder — Division Cards** (landing page, card grid)
2. **Scope Builder — Split Panel** (CSI tree left, items + inline form right)
3. **Spec/Selection Register — Table View** (single sortable/filterable table)

---

## Relationship to Control Tower

```
Scope Builder (Core)
    ↓ items with locations, vendors, submittal types
Spec/Selection Register (Core)
    ↓ items with complete specs, finalized selections
Control Tower (per-project purchase)
    ↓ procurement packages with 8-step timelines
    ↓ Buyout → Coordination → Prep → Reviews → Fab → Ship → Delivery
```

Core creates the atomic procurement items and ensures information completeness. Control Tower consumes those items, bundles them into procurement packages, and manages the timeline to delivery.

---

## Revision History

| Date | Change |
|------|--------|
| 2026-04-01 | Initial spec created from sequential thinking session |
| 2026-04-01 | Updated UI decisions: card grid landing, split panel drill-down, inline form, single table register. Removed dashboard/progress tracking from Core (Control Tower only). |
