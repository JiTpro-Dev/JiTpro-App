# 02 — Core Data & Permissions

## Scope

Complete the data entities that procurement items depend on: vendors, locations, submittals, and project team management. This is BUILD_ROADMAP Phase 2.

## What Is Known

- All four systems have database tables with RLS policies already created
- None of the four systems have UI
- Procurement items reference these entities (vendor_id, location junction, submittal junction) but all references are currently null/empty
- This is the **designated next focus** per BUILD_ROADMAP

## What Is Built (Schema Only)

### Vendors
- `vendors` table: id, company_id, name, contact_name, email, phone, website, notes
- RLS: `user_belongs_to_company(company_id)`
- Referenced by `procurement_items.vendor_id` (always null today)

### Locations
- `project_locations` table: id, project_id, name, level (building/floor/room), parent_id
- 3-level hierarchy: Building > Floor > Room
- `procurement_item_locations` junction table
- No UI exists

### Submittals
- `submittal_types` lookup table (8 types seeded: shop_drawings, product_data, samples, calculations, test_reports, certificates, mock_ups, color_charts)
- `procurement_item_submittals` junction table
- `procurement_items.requires_submittal` field (always false today)
- No UI exists

### Project Team
- `project_members` table: id, project_id, user_id, role
- Auto-adds project creator as "project_manager"
- No management UI beyond auto-creation

## What Is Not Built

- Vendor CRUD UI (list, create, edit, delete)
- Vendor assignment to procurement items
- Location management UI (tree builder)
- Location assignment to procurement items
- Submittal type toggle and assignment UI
- Project team management UI (add/remove members, assign roles)

## Next Likely Steps

1. **Vendors first** — CRUD UI + assign to items in Scope Builder
2. **Locations second** — Tree management + assign to items
3. **Submittals third** — Toggle + type selection on items
4. **Team last** — Member management + role assignment
