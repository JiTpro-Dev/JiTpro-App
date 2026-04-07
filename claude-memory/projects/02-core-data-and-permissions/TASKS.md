# 02 — Core Data & Permissions Tasks

## Objective

Complete the four data entities that procurement items depend on (vendors, locations, submittals, team), giving Scope Builder and Selection Register full functionality.

## Definition of Done

- Users can create, view, edit, and delete vendors at the company level
- Users can assign vendors to procurement items in Scope Builder
- Users can manage project locations (Building > Floor > Room hierarchy)
- Users can assign locations to procurement items
- Users can toggle submittal requirements and assign submittal types to items
- Users can manage project team members
- All new data displays correctly on Selection Register and Project Home
- All operations use existing RLS policies (no schema changes needed)

## Prerequisite

- [ ] Verify cost code CSV import works end-to-end (blocker from SESSION_HANDOFF)

---

## Phase 1: Vendors (Start Here)

_Simplest system — flat table, no hierarchy, no junctions. Establishes the CRUD pattern._

1. [ ] Build vendor list page (company-level, under Directories nav group)
2. [ ] Build vendor create/edit form (modal or inline)
3. [ ] Build vendor delete with confirmation
4. [ ] Add vendor selector dropdown to Scope Builder AddItemForm
5. [ ] Display vendor column on Selection Register
6. [ ] Display vendor info on Project Home summary (if useful)

## Phase 2: Locations

_3-level hierarchy with junction table. More complex than vendors._

7. [ ] Build location management page (project-level, under Project Admin)
8. [ ] Build location tree UI (Building > Floor > Room)
9. [ ] Add location assignment to Scope Builder items (multi-select via junction)
10. [ ] Display locations on Selection Register

## Phase 3: Submittals

_Toggle + multi-select. Depends on existing submittal_types lookup._

11. [ ] Add requires_submittal toggle to Scope Builder item form
12. [ ] Add submittal type multi-select when toggle is on (uses submittal_types lookup)
13. [ ] Display submittal requirements on Selection Register
14. [ ] Show submittal status summary on Project Home

## Phase 4: Project Team

_Member management. Uses existing project_members table._

15. [ ] Build project team management page (project-level)
16. [ ] Add member (select from company users table)
17. [ ] Remove member with confirmation
18. [ ] Assign/change role for member
19. [ ] Display team roster on Project Home

---

## Completed

(none yet)
