# 02 — Core Data & Permissions Handoff

## Last Session: 2026-04-07

## Status: In Progress — Vendor CRUD built, corrections needed

### What Was Completed
- Vendor list page with search, sort, create/edit modal, delete confirmation
- Route `/app/vendors`, nav item under Directories, breadcrumb label
- TypeScript builds clean

### What Needs Correction (Before Continuing)
1. **Schema migration**: Add `is_active boolean default true` to `vendors` and `company_contacts`
2. **Vendors.tsx**: Replace hard DELETE with UPDATE `is_active = false`
3. **Vendors.tsx**: Add Inactive badge, show/hide toggle, Reactivate action

### Why the Correction
Product-model decision: vendors/contacts are **company-level directory records**, not project-owned. They must be deactivated, not deleted. Projects reference them but cannot mutate them. See `decision_log.md` entry 2026-04-07 and `domain_rules.md` "Company Directory Model" section.

### Exact Next Steps
1. Create migration `011_directory_soft_delete.sql` (requires user approval per CLAUDE.md change control)
2. Update Vendors.tsx to deactivate instead of delete
3. Then proceed to Task 8: Add vendor selector to AddItemForm

### What NOT to Redo
- Do not recreate the Vendors page — the list, search, sort, create, and edit are correct
- Do not change the route, nav, or breadcrumb — placement is correct
- Do not add role-based permission enforcement yet — that's Project 01
