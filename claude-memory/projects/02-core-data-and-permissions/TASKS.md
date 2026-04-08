# 02 — Core Data & Permissions Tasks

## Objective

Complete the four data entities that procurement items depend on (vendors, locations, submittals, team), following the **company directory model**: directory records are company-level, persistent, deactivated not deleted, and referenced by projects.

## Definition of Done

- Users can create, view, edit, and deactivate vendors at the company level
- Users can assign active vendors to procurement items in Scope Builder
- Users can manage project locations (Building > Floor > Room hierarchy)
- Users can assign locations to procurement items
- Users can toggle submittal requirements and assign submittal types to items
- Users can manage project team members
- All new data displays correctly on Selection Register and Project Home
- Deactivation replaces hard delete for all company directory records
- All operations use existing RLS policies (schema changes limited to adding `is_active` columns)

## Prerequisite

- [ ] Verify cost code CSV import works end-to-end (blocker from SESSION_HANDOFF)

---

## Phase 1: Vendors

### Completed
1. [x] Build vendor list page (company-level, under Directories nav group)
2. [x] Build vendor create/edit form (modal)
3. [x] Build vendor delete with confirmation — **NEEDS CORRECTION: replace with deactivate**

### Corrections Needed (from directory model decision 2026-04-07)
4. [ ] Create migration: add `is_active` to `vendors` and `company_contacts` tables
5. [ ] Replace hard delete with deactivation in Vendors.tsx
6. [ ] Add "Inactive" badge and show/hide toggle for inactive vendors
7. [ ] Add "Reactivate" action for inactive vendors

### Remaining
8. [ ] Add vendor selector dropdown to Scope Builder AddItemForm (show only active vendors)
9. [ ] Display vendor column on Selection Register
10. [ ] Display vendor info on Project Home summary (if useful)

## Phase 2: Locations

_3-level hierarchy with junction table. More complex than vendors._

11. [ ] Build location management page (project-level, under Project Admin)
12. [ ] Build location tree UI (Building > Floor > Room)
13. [ ] Add location assignment to Scope Builder items (multi-select via junction)
14. [ ] Display locations on Selection Register

## Phase 3: Submittals

_Toggle + multi-select. Depends on existing submittal_types lookup._

15. [ ] Add requires_submittal toggle to Scope Builder item form
16. [ ] Add submittal type multi-select when toggle is on (uses submittal_types lookup)
17. [ ] Display submittal requirements on Selection Register
18. [ ] Show submittal status summary on Project Home

## Phase 4: Project Team

_Member management. Uses existing project_members table._

19. [ ] Build project team management page (project-level)
20. [ ] Add member (select from company users table)
21. [ ] Remove member with confirmation
22. [ ] Assign/change role for member
23. [ ] Display team roster on Project Home

---

## Completed

- [x] Vendor list page created — 2026-04-07
- [x] Vendor create/edit modal — 2026-04-07
- [x] Vendor delete with confirmation — 2026-04-07 (to be replaced with deactivation)
- [x] Route added: `/app/vendors` — 2026-04-07
- [x] Nav item added: Vendors under Directories — 2026-04-07
- [x] Breadcrumb label added — 2026-04-07
