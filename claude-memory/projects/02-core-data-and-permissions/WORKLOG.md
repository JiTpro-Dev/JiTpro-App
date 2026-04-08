# WORKLOG — 02 Core Data & Permissions

## 2026-04-07 — Session: Vendor CRUD + Directory Model Correction

### What Was Worked On
- Built Vendors.tsx — full CRUD page (list, search, sort, create/edit modal, delete confirmation)
- Added route `/app/vendors` in App.tsx
- Added "Vendors" nav item under Directories in navConfig.ts (Truck icon)
- Added "vendors" breadcrumb label in TopBar.tsx
- TypeScript builds clean, no errors

### What Changed
- Files created: `src/pages/app/Vendors.tsx`
- Files modified: `src/App.tsx`, `src/layouts/AppShell/navConfig.ts`, `src/layouts/AppShell/TopBar.tsx`

### Key Decisions Made
- **Company directory model** (critical): Vendors/contacts are company-level records, deactivated not deleted, projects reference but don't own them. Logged in decision_log.md and domain_rules.md.
- Hard delete in Vendors.tsx must be replaced with deactivation before shipping

### Issues Encountered
- `vendors` table lacks `is_active` column — needs schema migration
- `company_contacts` table also lacks `is_active` — should be added at the same time
- No role enforcement exists — all users see edit/deactivate buttons (deferred to Project 01)

### Learnings
- The People.tsx pattern is a good template for company directory pages
- `ON DELETE SET NULL` on `procurement_items.vendor_id` means hard delete wouldn't break items, but deactivation is still better for preserving context
- Schema migrations should be planned before building UI that depends on columns that don't exist yet

### Next Steps
1. Create migration for `is_active` columns
2. Update Vendors.tsx: deactivate instead of delete
3. Add vendor selector to AddItemForm

## 2026-04-07 — Session: System Initialization (Preparation)

- Verified all 4 schema-only tables exist with RLS policies
- Confirmed vendor_id is always null in AddItemForm
- Confirmed requires_submittal is always false
- Confirmed no CRUD UI exists for vendors, locations, submittals, or team
- Documented task breakdown by subsystem in TASKS.md
