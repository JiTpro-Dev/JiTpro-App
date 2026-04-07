# 05 — Procurement Execution Engine

## Scope

Migrate the timeline system from sandbox to production and build the Control Tower: procurement timelines connected to real items, baselines, audit trails, schedule visualization, and FD/FS constraints.

## What Is Built (Sandbox Only)

- Procurement Timeline builder with interactive phase editing
- JSONB timeline_data storage with configurable review rounds (1-3)
- Baseline creation (numbered, immutable snapshots)
- Edit logging with field-level change tracking and reason capture
- FD/FS constraint toggles (lock/unlock)
- Gantt schedule visualization
- Two calculation modes (backward from delivery, forward from start)
- Working-day calculation respecting calendar

**All of the above exists only in the sandbox Supabase project, scoped by `auth.uid()` not `company_id`.** None is connected to production procurement items.

## What Is Not Built (Production)

- Production timeline tables (need company-scoped RLS, not user-scoped)
- Connection between procurement items and their timelines
- Baseline management in production
- Edit audit trail in production
- Schedule/Gantt page in production (disabled in nav)
- Requests/RFI system (disabled in nav)
- Documents/file upload (disabled in nav)
- Task assignments to team members
- Actual date entry and variance calculations

## What Is Blocked

- Depends on Project 02 (vendors, locations, submittals) being complete
- Migration path decision needed (see open_questions.md Q5)
- Team management needed for task assignments

## Next Likely Steps

1. Design production timeline schema (adapt sandbox schema with company-scoped RLS)
2. Create production migration
3. Build timeline creation flow (attach to procurement item)
4. Build timeline editing with baseline enforcement
5. Build schedule/Gantt page
6. Build audit trail viewer
