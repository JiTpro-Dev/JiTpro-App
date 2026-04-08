# JiTpro Current State

> Last updated: 2026-04-07 (audit verified)
>
> Legend: **Confirmed in code** | **Schema only** (DB exists, no UI) | **Not implemented**

---

## What Is Actually Built

### Authentication & Session
- Email/password login via Supabase Auth (Login.tsx, AuthContext.tsx)
- Password reset flow (ResetPassword.tsx)
- Session persistence in browser
- Route guard via RequireAuth component
- Invitation-only — no public signup form exists

### Multi-Company Support
- Dashboard shows all companies user belongs to (Dashboard.tsx)
- Companies split into "Active" and "Pending Setup" on dashboard
- Company switching persisted to localStorage
- CompanyContext validates user membership before setting active company
- RLS uses `user_belongs_to_company()` helper — multi-company bug fixed (migration 008, applied 2026-04-06)

### Company Setup Wizard (6 steps)
- Step 1: Company Profile (name, address, license) — uses `setup_company()` RPC
- Step 2: Admin Users (primary + optional secondary)
- Step 3: Calendar (work week + holidays)
- Step 4: Contacts (CSV import or manual entry)
- Step 5: Cost Codes (CSV upload or manual tree builder)
- Step 6: PCL Templates (default templates with editable tasks/days)
- Marks `setup_completed = true` on completion

### Company-Level Pages (functional)
- Company Home — project counts, active project list, quick actions
- Projects — grid of project cards, create new project form
- People — combined users + contacts directory, searchable/sortable
- Organizations — contacts grouped by company_organization
- Cost Codes — hierarchical viewer (Division > Section > Subsection > Paragraph)
- Calendars — work week display + holiday list (read-only)
- Project Templates — PCL template cards with task breakdown

### Project-Level Pages (functional)
- Project Home — summary cards (Ready/Pending/Missing counts), division breakdown
- Scope Builder — two-panel item editor, cost code tree, CRUD to Supabase
- Selection Register — filterable/sortable item table

### Navigation
- AppShell layout with collapsible left nav (company mode + project mode)
- TopBar with breadcrumbs, dashboard link, notification bell, profile menu
- Company switcher and project switcher in nav

### Demo/Sandbox System
- Separate Supabase project (`jitpro-sandbox`) for `/demo/*` routes
- Procurement Timeline builder (interactive, JSONB storage)
- Procurement Schedule Gantt view
- View Timeline page
- Fully isolated from production data

## What Is Partially Built

### Vendor System
- `vendors` table exists in schema with RLS policies
- Company-level Vendors page built (`/app/vendors`) with list, search, sort, create/edit modal
- **Correction needed**: Page currently hard-deletes — must switch to deactivation (`is_active` column needed)
- `vendor_id` on procurement_items is always null (vendor selector not yet added to AddItemForm)
- No `is_active` column on vendors table yet (schema migration pending)

### Location System
- `project_locations` table exists (3-level: Building > Floor > Room)
- `procurement_item_locations` junction table exists
- No management UI exists
- No assignment UI exists

### Submittal System
- `procurement_item_submittals` junction table exists
- `submittal_types` lookup table seeded with 8 types
- `requires_submittal` field on procurement_items exists (always false)
- No UI for toggling or assigning submittal types

### Project Team / Members
- `project_members` table exists, auto-adds creator as PM on project creation
- No team management UI
- No role enforcement beyond RLS

### User Invitation
- `handle_new_user()` trigger exists but is a no-op placeholder
- No invitation flow, no token generation, no email sending

### Notifications
- NotificationBell component renders with hardcoded count of 0
- Dropdown says "No new notifications"
- No notification storage or delivery system

## What Is Not Built

- **Control Tower** — Timeline system exists only in sandbox; not connected to production items
- **Baseline management** — Sandbox only (timeline_baselines table)
- **Edit audit trail** — Sandbox only (timeline_edit_log table)
- **FD/FS constraint enforcement** — Sandbox only
- **Schedule / Gantt page** — Disabled in nav
- **Requests (RFI)** — Disabled in nav
- **Documents / file upload** — Disabled in nav
- **Billing / Stripe integration** — Placeholder page ("Coming soon")
- **Settings page** — Placeholder (5 cards, all "Coming soon")
- **Reports** — No route, no UI
- **Email notifications** — Resend API key in env but no sending code
- **Role-based access control** — No UI restrictions beyond RLS
- **Company profile editing** — No post-setup editing UI
- **Project editing/deletion** — Can create but not edit or delete
- **CI/CD pipeline** — None
- **Automated testing** — None
- **Error handling / logging** — No centralized system
- **Staging environment** — None; single production Supabase instance

## Legacy / Archived Code

- `src/pages/app/pre-bid/sampleData.ts` — Dead code. Contains type definitions (SubmittalType, ItemStatus, ProcurementItem, CsiDivision) but **nothing imports it**. Safe to delete.
- `src/pages/CompanySetup.tsx` — Archived. Superseded by SetupWizard. Comment in App.tsx: "Old wizard archived."
- Legacy routes in App.tsx: `/project/new` and `/project/:id` — Point to ProjectDashboard and ProjectInformation. May be orphaned from earlier routing structure.

## Immediate Blockers

1. Cost code CSV import needs end-to-end validation — user must export with exact 8-column format (division_code, division_title, section_code, section_title, subsection_code, subsection_title, paragraph_code, paragraph_title)
2. `sampleData.ts` cleanup (trivial — confirmed no imports exist)

## Likely Next Steps

1. Complete cost code import verification
2. Build vendor CRUD UI and connect to procurement items
3. Build location management UI and assignment to items
4. Build submittal type assignment UI
5. Build project team management
6. Move timeline system from sandbox to production (connect to real items)
