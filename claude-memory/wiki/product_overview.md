# Product Overview

## Two-Tier Model

### JiTpro Core (Monthly Subscription)

Standalone procurement scoping tools that work without timelines.

**Scope Builder**
- Identify every procurement item on a project
- Organize by CSI division and cost code
- Assign locations, vendors, submittal requirements
- Track design completeness status (Ready / Pending Selection / Missing Design)

**Selection Register**
- Searchable, filterable, sortable table of all procurement items
- Shows design status, vendor assignments, submittal requirements
- The "single source of truth" for what needs to be procured

### JiTpro Control Tower (Per-Project Purchase)

Full timeline management that consumes Core data.

**Procurement Timeline**
- 8-phase execution sequence per item (Buyout through Delivery)
- Configurable review rounds (1-3)
- Working-day calculations respecting company calendar
- Two calculation modes: backward from delivery date, or forward from start date

**Baselines**
- Permanent, numbered snapshots that cannot be edited or deleted
- Enable variance tracking: planned vs. actual vs. current projection

**Audit Trail**
- Every edit to an active timeline requires a reason
- Field-level change tracking with timestamps
- Accountability for delays attributed to specific causes

**FD/FS Constraints**
- Final Design and Final Selection milestones owned by architect/owner
- Can be locked (enforced — delays cascade) or unlocked (informational)
- Visual separation: their milestones above timeline, contractor milestones below

## User Roles

| Role | Description |
|------|-------------|
| Super Admin | Platform-level admin (app_metadata flag) |
| Company Admin | Manages company settings, users, billing |
| Project Manager | Full project access, creates items and timelines |
| Project Member | Project access, limited by role |
| External Contact | Directory record only — cannot log in |

## Multi-Tenancy Model

- Users can belong to multiple companies
- Each company has isolated data (RLS enforced)
- Company context is selected on Dashboard, persisted in localStorage
- Projects belong to one company
- Procurement items belong to one project (and inherit company scope)
