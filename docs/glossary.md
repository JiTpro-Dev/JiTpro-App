# JiTpro Glossary (v3 — Locked System Language)

> Updated: 2026-04-06
> Status: Authoritative. This glossary defines the official system language for JiTpro.
> All code, documentation, and AI tools must use terminology as defined here.

---

## Enforced Naming Rules

These naming rules are mandatory across all code, documentation, and communication.

| Concept | Canonical Name | Route | Rule |
|---------|---------------|-------|------|
| Multi-company picker | **Dashboard** | `/dashboard` | Never call this "Home." It is the company picker, not a workspace. |
| Company workspace landing | **Company Home** | `/app/home` | Never call this "Dashboard." Sidebar may label it "Home" but the system name is Company Home. |
| Project workspace landing | **Project Home** | `/app/project/:id/home` | Never call this "Dashboard" or "Overview." |
| Core procurement object | **Procurement Item** | — | The atomic unit of procurement. "Item" is acceptable shorthand. Never call this a "Timeline." |
| Schedule attached to an item | **Procurement Timeline** | — | Always a child of a Procurement Item. Never standalone. Never called an "Item." |
| Procurement item table view | **Selection Register** | `/app/project/:id/selection-register` | This is the canonical name. "Spec Register" is disallowed (see Disallowed Terminology). |
| Directory record without login | **Contact** | — | A Contact is NOT a User Account. Contacts cannot log in. |
| Authenticated login identity | **User Account** | — | A User Account is NOT a Contact. Has `auth.users` record. |

---

## Canonical Object Relationship Rules

### Procurement Item → Procurement Timeline

```
Procurement Item (parent)
  └── Procurement Timeline (child)
```

**Rules:**

1. A Procurement Item is the parent object. It defines *what* is being procured.
2. A Procurement Timeline is the child object. It defines *how long* each phase will take.
3. A Procurement Timeline must never exist without a parent Procurement Item.
4. A Procurement Timeline is NOT a standalone concept — it is always scoped to an item.
5. One Procurement Timeline per Procurement Item (unless explicitly extended in a future version).
6. The Scope Builder creates Procurement Items. It does NOT create Procurement Timelines.
7. Procurement Timelines are generated when an item enters the Control Tower scheduling system.

**Implementation Note:** In the current sandbox, timelines exist without item parents because the sandbox predates the production item system. This is a known deviation that will be resolved when the systems merge.

---

## Procurement Flow of Record

This is the canonical procurement workflow:

1. **Scope Builder** creates Procurement Items (identity, cost code, status, vendor, submittals)
2. **Selection Register** displays items in a searchable/filterable table view
3. When a project is activated, items receive **Procurement Timelines** (phases, durations, milestones)
4. The **Procurement Timeline** governs execution and tracks progress through procurement phases
5. **Baselines** capture immutable snapshots of timeline state for variance tracking
6. **Audit Logs** record field-level changes to active timelines with required reasons

---

## Disallowed Terminology

| Disallowed | Correct | Why |
|------------|---------|-----|
| "Spec Register" | **Selection Register** | "Spec Register" appears in navConfig.ts but conflicts with the component name, URL, and breadcrumb. Selection Register is canonical. |
| "Timeline" as standalone | **Procurement Timeline** (child of item) | Timelines do not exist independently. They are always attached to a Procurement Item. |
| Using "Item" and "Timeline" interchangeably | Distinct concepts | Item = what to procure. Timeline = how long each phase takes. These are parent-child, not synonyms. |
| "Scope Builder creates timelines" | **Scope Builder creates items** | Timelines are generated when items enter the scheduling system, not in the Scope Builder. |
| "Dashboard" for Company Home | **Company Home** for `/app/home` | Dashboard is exclusively the multi-company picker at `/dashboard`. |

---

## 1. Core Platform Terms

### Company

- **Dev Abbreviation:** `company`
- **System Name:** Company
- **UI Label:** (company display_name or legal_name)
- **Environment:** Core
- **Definition:** The primary tenant boundary in JiTpro. Represents a construction firm that subscribes to the platform. All data (projects, contacts, cost codes, templates) is scoped to a company via `company_id`. A user can belong to multiple companies.
- **System Rule:** Company is the top-level data boundary. All production data must be company-scoped.
- **Common Misuse:** Sometimes confused with "Organization." In JiTpro, Company is the tenant; Organization is a contact grouping within the People directory.

### Project

- **Dev Abbreviation:** `project`
- **System Name:** Project
- **UI Label:** Project
- **Environment:** Core
- **Definition:** A construction project belonging to a company. Contains procurement items, team members, locations, and scheduling data. Created via `/app/projects/new`. Statuses: `active`, `completed`, `on_hold`, `archived`.
- **System Rule:** Every project must belong to exactly one company. Project-scoped data (items, locations, members) inherits company isolation via the project's `company_id`.

### Procurement Item

- **Dev Abbreviation:** `procurement_items`
- **System Name:** ProcurementItem
- **UI Label:** Item (in Scope Builder and Selection Register)
- **Environment:** Core
- **Definition:** The atomic unit of procurement tracking. Represents something that needs to be procured for a project (e.g., "Kitchen Cabinets — Unit A"). Has a name, cost code assignment, status, vendor reference, and submittal flag. Created and managed in the Scope Builder.
- **System Rule:** Procurement Item is the parent object. A Procurement Timeline is its child. Items exist in production; timelines are generated when scheduling begins.
- **Common Misuse:** Not interchangeable with "Procurement Timeline." Item = what to procure. Timeline = the schedule for procuring it.

### Procurement Timeline

- **Dev Abbreviation:** `procurement_timelines`
- **System Name:** ProcurementTimeline
- **UI Label:** (no production UI label yet)
- **Environment:** Core
- **Definition:** The schedule attached to a Procurement Item, defining how long each procurement phase will take. Contains an ordered sequence of phases (Buyout, Submittal Coordination, Review Rounds, Fabrication, Shipping, etc.) with durations in working days. Stored as JSONB `timeline_data`.
- **System Rule:** A Procurement Timeline must always be a child of a Procurement Item. It must never exist as a standalone object. One timeline per item.
- **Common Misuse:** Must not be treated as standalone. Must not be confused with the item itself.
- **Implementation Notes:** Currently implemented only in the sandbox with user-scoped data and no FK to production `procurement_items`. This is a known deviation. When merged into production, timelines will be project-scoped and linked to items via foreign key.

### Scope Builder

- **Dev Abbreviation:** —
- **System Name:** ScopeBuilder
- **UI Label:** Scope Builder
- **Environment:** Core
- **Definition:** The primary interface for creating, editing, and organizing Procurement Items within a project. Displays items grouped by CSI division in a card view or split-panel layout with a cost code tree. Supports full CRUD against Supabase.
- **System Rule:** Scope Builder creates Procurement Items only. It does NOT create Procurement Timelines.

### Selection Register

- **Dev Abbreviation:** —
- **System Name:** SelectionRegister
- **UI Label:** Selection Register
- **Environment:** Core
- **Definition:** A read-only table view of all Procurement Items in a project. Supports search, filtering by status/division, and sorting by name/CSI code/status.
- **System Rule:** The canonical name is "Selection Register." The sidebar currently displays "Spec Register" — this is a known inconsistency that should be corrected.
- **Common Misuse:** "Spec Register" is disallowed. Use "Selection Register" everywhere.

### Control Tower

- **Dev Abbreviation:** —
- **System Name:** Control Tower
- **UI Label:** Control Tower
- **Environment:** Core
- **Definition:** The feature set for active procurement execution: Procurement, Schedule, Requests, and Documents modules. Currently disabled in the sidebar navigation. Activation is tied to a per-project purchase model (not yet implemented).

### Baseline

- **Dev Abbreviation:** `timeline_baselines`
- **System Name:** Baseline
- **UI Label:** (no production UI yet; "Set Baseline" button in sandbox)
- **Environment:** Core
- **Definition:** An immutable, sequentially numbered snapshot of a Procurement Timeline's complete state at a specific point in time. Stored as JSONB. Setting the first baseline promotes the timeline from `draft` to `active` status. Baselines cannot be updated or deleted.
- **System Rule:** Baselines are append-only. No update or delete operations are permitted.
- **Implementation Notes:** Currently implemented only in the sandbox (`timeline_baselines` table). Will be part of production Control Tower when built.

### Audit Log

- **Dev Abbreviation:** `timeline_edit_log`
- **System Name:** Audit Log / Edit Log
- **UI Label:** (no UI viewer currently)
- **Environment:** Core
- **Definition:** A record of field-level changes made to active Procurement Timelines. Each entry captures: timeline_id, task_name, field_changed, old_value, new_value, reason, changed_by, changed_at. Only required when the timeline status is `active`. Immutable — no update or delete operations.
- **System Rule:** Audit logs are append-only. Edit reasons are required for active timeline changes.
- **Implementation Notes:** Currently implemented only in the sandbox (`timeline_edit_log` table). Will be replicated in production.

### PCL (Procurement Complexity Level)

- **Dev Abbreviation:** `pcl_templates`
- **System Name:** PCL
- **UI Label:** Project Templates (in sidebar navigation)
- **Environment:** Core
- **Definition:** A classification system for Procurement Items based on the complexity of their procurement process. Determines the number and type of tasks in the Procurement Timeline. Templates (PCL 1 through PCL 5) define different task structures with default durations. Company-scoped.
- **System Rule:** PCL templates define the task structure for Procurement Timelines. Each template has tasks stored in `pcl_template_tasks`.

### Cost Code

- **Dev Abbreviation:** `cost_codes`
- **System Name:** CostCode
- **UI Label:** Cost Codes
- **Environment:** Core
- **Definition:** A hierarchical categorization system for construction work, based on CSI MasterFormat. Has 4 levels: Division (1), Section (2), Subsection (3), Paragraph (4). Procurement Items can only be assigned to level 2 or deeper. Company-scoped.
- **System Rule:** Items cannot be assigned to level-1 divisions — only to level 2+ codes beneath them.

### CSI Division

- **Dev Abbreviation:** `csi_division`
- **System Name:** CSI Division
- **UI Label:** (shown as division code + title in Scope Builder cards)
- **Environment:** Core
- **Definition:** A level-1 cost code representing a major trade category (e.g., "03 — Concrete", "09 — Finishes"). Used to group Procurement Items in the Scope Builder card view.

### Vendor

- **Dev Abbreviation:** `vendors`
- **System Name:** Vendor
- **UI Label:** (no UI currently)
- **Environment:** Core
- **Definition:** A company in the vendor directory that supplies materials or services. Company-scoped. Table exists in the database but no UI reads or writes to it. `procurement_items.vendor_id` is always null from the UI.
- **Implementation Notes:** Schema complete. UI not yet built. See BUILD_ROADMAP Phase 2, Task 5.

### Super Admin

- **Dev Abbreviation:** `is_super_admin`
- **System Name:** Super Admin
- **UI Label:** (no visible label)
- **Environment:** Core
- **Definition:** A user flag stored in `auth.users.app_metadata.is_super_admin`. Allows creating multiple companies. Regular users are limited to one company.

### Setup Wizard

- **Dev Abbreviation:** —
- **System Name:** SetupWizard
- **UI Label:** (full-screen flow, no nav label)
- **Environment:** Core
- **Definition:** A 6-step onboarding flow for creating a new company. Steps: (1) Company Profile, (2) Admin Info, (3) Work Week + Holidays, (4) Contacts, (5) Cost Codes, (6) PCL Templates. Data persists to Supabase. Supports resume for incomplete setups.

### AppShell

- **Dev Abbreviation:** —
- **System Name:** AppShell
- **UI Label:** (not user-facing)
- **Environment:** Core
- **Definition:** The main application layout component wrapping all `/app/*` routes. Contains the collapsible LeftNav sidebar, TopBar with breadcrumbs, and content area. Provides context-aware navigation (company-level vs project-level).

---

## 2. Navigation & UI Terms

### Dashboard

- **UI Label:** (no explicit nav label)
- **Route:** `/dashboard`
- **Environment:** Core
- **Definition:** The multi-company landing page shown after login. Displays all companies the user belongs to as clickable cards. Allows company creation (super admins) and company deletion.
- **System Rule:** "Dashboard" refers exclusively to `/dashboard`. Never use "Dashboard" for Company Home.

### Company Home

- **UI Label:** Home (in sidebar)
- **Route:** `/app/home`
- **Environment:** Core
- **Definition:** The workspace landing page within a selected company. Displays real project data: active/on-hold/completed counts and clickable project cards.
- **System Rule:** The sidebar displays "Home" but the system name is "Company Home." Never call this "Dashboard."

### Project Home

- **UI Label:** Home (in project sidebar)
- **Route:** `/app/project/:projectId/home`
- **Environment:** Core
- **Definition:** The project-level landing page. Displays Procurement Item summary, per-division status bars, and Control Tower activation status.

### Scope Builder (nav)

- **UI Label:** Scope Builder
- **Route:** `/app/project/:projectId/scope-builder`
- **Environment:** Core
- **Definition:** See Section 1 (Scope Builder).

### Selection Register (nav)

- **UI Label:** Selection Register (canonical; sidebar currently shows "Spec Register")
- **Route:** `/app/project/:projectId/selection-register`
- **Environment:** Core
- **Definition:** See Section 1 (Selection Register).
- **System Rule:** The nav label must be updated from "Spec Register" to "Selection Register" to match the canonical name.

### Schedule

- **UI Label:** Schedule
- **Route:** `/app/project/:projectId/schedule`
- **Environment:** Core
- **Definition:** Planned Control Tower module for procurement schedule visualization. Currently disabled in navConfig.

### Navigation Groups

| Group | Level | Contains |
|-------|-------|----------|
| **Workspace** | Company | Home, Projects |
| **Directories** | Company | People, Organizations |
| **Standards** | Company | Cost Codes, Calendars, Project Templates |
| **Admin** | Company | Billing, Settings |
| **Project** | Project | Home |
| **Core** | Project | Scope Builder, Selection Register |
| **Control Tower** | Project | Procurement, Schedule, Requests, Documents (all disabled) |
| **Project Admin** | Project | Team, Baselines, Reports, Settings (no routes built) |

### Other UI Components

| Component | UI Label | Definition |
|-----------|----------|------------|
| CompanySwitcher | "Switch Company" | LeftNav footer component for switching between companies. Only renders for multi-company users. |
| ProfileMenu | (user avatar) | TopBar dropdown with placeholder links and working Sign Out. |
| NotificationBell | (bell icon) | TopBar icon. Always shows "No new notifications." No notification system exists. |
| PageHeader | (not user-facing) | Reusable page title bar with stats, filters, and action slots. |

---

## 3. Procurement & Scheduling Terms

### Procurement Phases (in execution order)

| Phase | Type | Default Days | Definition |
|-------|------|-------------|------------|
| Start Buyout | Milestone | 0 | Marks the beginning of the procurement process. |
| Buyout | Phase | 15 | Securing a contract or purchase order with a vendor/subcontractor. |
| Submittal Coordination | Phase | 22 | Project team gathers everything a vendor needs before they can produce submittals. Includes confirming scope, resolving design gaps, answering RFIs, and cross-discipline coordination. This is the project team's work, not the vendor's. |
| Submittal Preparation | Phase | 22 | Vendor produces the actual submittal package (shop drawings, product data, samples) after receiving information from coordination. This is the vendor's work. |
| Initial Submittal | Milestone | 0 | Vendor's first formal submittal package delivered to the review team. |
| 1st Review | Phase | 15 | First review period after the initial submittal is received. |
| Vendor Rev 1 | Phase | 8 | Vendor's first revision after review feedback. Only present when review rounds >= 2. |
| REV 1 Review | Phase | 10 | Review of first vendor revision. Only present when review rounds >= 2. |
| Vendor Rev 2 | Phase | 5 | Vendor's second revision. Only present when review rounds = 3. |
| REV 2 Review | Phase | 6 | Review of second vendor revision. Only present when review rounds = 3. |
| Approval | Milestone | 0 | Submittal approved after all review rounds complete. |
| Release to Fab | Milestone | 0 | Approved submittal released for fabrication. |
| Fabrication | Phase | 130 | Manufacturing/production of the procured item. Longest single phase. |
| Shipping | Phase | 8 | Delivery transit from manufacturer to job site. |
| Delivered - Ready for Install | Milestone | 0 | Item arrived on site and ready for installation. Final milestone. |

### Review Round

- **Environment:** Core
- **Definition:** A cycle of reviewing a vendor's submittal and providing feedback. Timelines support 1, 2, or 3 review rounds. Each round includes a review phase and (if not the last) a vendor revision phase.

### Final Design (FD)

- **Environment:** Core
- **Definition:** A constraint milestone representing the date by which design must be finalized. Displayed as a draggable marker above the timeline bar. Can be enabled/disabled per item.

### Final Selection (FS)

- **Environment:** Core
- **Definition:** A constraint milestone representing the date by which owner/architect selections (finishes, fixtures, colors) must be made. Displayed as a draggable marker above the timeline bar. Can be enabled/disabled per item.

### Required Onsite Date

- **Environment:** Core
- **Definition:** The date a Procurement Item must be on site and ready for installation. Used as the anchor date for backward scheduling calculations. Stored as `delivery_date` in the database.

### Backward Calculation (Mode A)

- **Environment:** Core
- **Definition:** Scheduling mode where the delivery date is fixed and the start date is calculated backward by subtracting total working days. Used when the start date is in the future.

### Forward Calculation (Mode B)

- **Environment:** Core
- **Definition:** Scheduling mode where the start date is locked (because it's in the past) and the delivery date is calculated forward by adding total working days. Used when work has already begun.

### Workday

- **Environment:** Core
- **Definition:** A business day used for duration calculations. All procurement phase durations are measured in working days.
- **Implementation Notes:** Sandbox uses hardcoded Mon-Fri with no holiday awareness. Production is intended to use company-specific Work Week and Holiday Calendar settings.

---

## 4. Status Systems

### Procurement Item Status (Production)

| Value | UI Label | Badge | Definition |
|-------|----------|-------|------------|
| `ready` | Ready | Green | Item has all design information and selections made; ready to proceed. |
| `pending_selection` | Pending Selection | Amber | Item is waiting for an owner/architect selection decision. |
| `missing_design` | Missing Design | Red | Item is missing required design information. Default for new items. |

**Source:** scopeBuilderTypes.ts (ItemStatus type, statusConfig)

### Procurement Timeline Status

| Value | UI Label | Definition |
|-------|----------|------------|
| `draft` | Draft | Timeline is fully editable. No baseline has been set. |
| `active` | Active | At least one baseline set. Edits require a reason (captured in Audit Log). |
| `complete` | Complete | Timeline is fully locked. No editing allowed. |

**Source:** procurement-edit-logic.md

### Task Status

| Value | UI Label | Definition |
|-------|----------|------------|
| `not_started` | Not Started | Task has not begun. |
| `in_progress` | In Progress | Task is currently underway. |
| `complete` | Complete | Task has been finished. |

**Source:** ProcurementTimeline.tsx (TimelineItem.task_status)

### Project Status

| Value | UI Label | Definition |
|-------|----------|------------|
| `active` | Active | Project is ongoing. Default on creation. |
| `completed` | Completed | Project is finished. |
| `on_hold` | On Hold | Project is temporarily paused. |
| `archived` | Archived | Project is archived. Defined in schema but not currently settable from UI. |

**Source:** 004_projects.sql (CHECK constraint)

### Health Status (Planned — not yet implemented)

| Value | Definition |
|-------|------------|
| On Track | Item is progressing as planned. |
| At Risk | Item may miss its required onsite date. |
| Waiting on External | Item is blocked pending an external party response. |
| Blocked | Item cannot proceed due to an unresolved issue. |
| Late | Item has missed its required onsite date. |

**Source:** product-spec.md, technical-architecture-spec.md. Defined in specs but not implemented.

### Design Status (Planned — not yet implemented)

| Value | Definition |
|-------|------------|
| Final | Design information is complete and finalized. |
| Pending | Design information is expected but not yet available. |
| Missing | Required design information does not exist. |
| Not Required | No design information is needed for this item. |

**Source:** jitpro-core-spec.md. Defined in spec but not implemented.

### Selection Status (Planned — not yet implemented)

| Value | Definition |
|-------|------------|
| Made | Owner/architect selection has been made. |
| Pending | Selection is expected but not yet made. |
| Missing | Selection is needed but owner/architect has not engaged. |
| Not Required | No selection is needed for this item. |

**Source:** jitpro-core-spec.md. Defined in spec but not implemented.

---

## 5. Identity & User Model

### User Account

- **Dev Abbreviation:** `auth.users` + `public.users`
- **Environment:** Core
- **Definition:** An authenticated login identity. Exists in two tables: `auth.users` (Supabase Auth — email/password/JWT) and `public.users` (links auth identity to a company with a role). A user can have multiple `public.users` records — one per company.
- **System Rule:** A User Account is NOT a Contact. Users can log in; Contacts cannot.
- **Common Misuse:** The `public.users` record is a person-company membership, not a unique person. One person with two companies has two `public.users` rows but one `auth.users` row.

### Contact

- **Dev Abbreviation:** `company_contacts`
- **Environment:** Core
- **Definition:** A person or organization record in the company directory. Does NOT have login access. Created during setup (Step 4) via CSV import or manual entry.
- **System Rule:** A Contact is NOT a User Account. Contacts cannot log in. Converting a contact to a user requires the invitation system (not yet built).

### Company Member

- **Environment:** Core
- **Definition:** A User Account that belongs to a company via a `public.users` record. Company membership grants access to company data via RLS policies. Can hold any role from `primary_admin` to `read_only`.

### External Collaborator

- **Environment:** Core (planned — not yet implemented)
- **Definition:** A user outside the general contractor's company (e.g., architect, owner, subcontractor) granted scoped access to specific project data. Access scopes: Full Project, Procurement Only, Assigned Items Only, Shared Items Only.

### Project Team Assignment

- **Dev Abbreviation:** `project_members`
- **Environment:** Core
- **Definition:** A record linking a User Account to a Project with a project-specific role. Currently only created when the project creator is added as `project_manager`. No team management UI exists.

### Company-Level Roles

| Role | Definition |
|------|------------|
| `primary_admin` | First admin created during company setup. Full company access. |
| `admin` | Secondary company administrator. |
| `project_manager` | Can manage projects. |
| `project_engineer` | Engineering role. |
| `superintendent` | Field supervision role. |
| `foreman` | Field crew lead. |
| `read_only` | View-only access. |

### Project-Level Roles

| Role | Definition |
|------|------------|
| `project_manager` | Manages the project. Default role for project creator. |
| `project_engineer` | Engineering support. |
| `superintendent` | Field supervision. |
| `foreman` | Crew lead. |
| `read_only` | View-only project access. |

---

## 6. System Concepts

### Holiday Calendar

- **Dev Abbreviation:** `company_holidays`
- **Environment:** Core
- **Definition:** A company-level list of holidays. Each entry has a name, date_description, is_recurring flag, and is_active flag. Created during Setup Wizard Step 3.
- **Implementation Notes:** Schema and UI for management exist. Not yet integrated into workday calculations.

### Work Week

- **Dev Abbreviation:** `company_work_weeks`
- **Environment:** Core
- **Definition:** Company-level definition of which days are working days, stored as boolean flags for each day (Monday through Sunday). One record per company. Created during Setup Wizard Step 3.
- **Implementation Notes:** Schema and UI for management exist. Not yet integrated into workday calculations.

### Project Activation

- **Environment:** Core (planned — not yet implemented)
- **Definition:** The process of enabling a project for active procurement management via the Control Tower. Tied to a per-project purchase model with capacity tiers.

### Item Capacity

- **Environment:** Core (planned — not yet implemented)
- **Definition:** The maximum number of Procurement Items allowed per activated project, determined by the purchased tier (Tier 1: 500 items, Tier 2: 1500 items).

### Submittal Types

- **Dev Abbreviation:** `submittal_types`
- **Environment:** Core
- **Definition:** A static lookup of 8 submittal document categories: Shop Drawings, Product Data, Samples, Mockups, Certificates, Design Mix, Manufacturer's Instructions, Warranties.
- **Implementation Notes:** Seeded in database. Not currently accessible from the UI.

### Project Location

- **Dev Abbreviation:** `project_locations`
- **Environment:** Core
- **Definition:** A 3-level hierarchical location structure within a project: Building (1) > Floor/Level (2) > Area/Room (3). Uses self-referential `parent_id`.
- **Implementation Notes:** Schema exists. No UI built.

### PCL Template

- **Dev Abbreviation:** `pcl_templates` + `pcl_template_tasks`
- **Environment:** Core
- **Definition:** See Section 1 (PCL).

---

## 7. Environment-Specific Terms

### Sandbox

- **Environment:** Sandbox Only
- **Definition:** The experimental system accessible via `/demo/*` routes. Uses a separate Supabase project (`sandboxSupabase`). Data is user-scoped via `auth.uid()`, NOT company-scoped. Contains procurement timeline creation, Gantt visualization, baselines, and edit logging.
- **System Rule:** Sandbox features are NOT production features. Sandbox data isolation is enforced via a separate database.

### Gantt View / Procurement Schedule (Sandbox)

- **Environment:** Sandbox Only
- **Definition:** An interactive visualization at `/demo/procurement-schedule` showing Procurement Timelines on a shared calendar. Supports zoom levels (quarters/months/weeks/days), sorting, weekend shading, segment tooltips, and workday math. Read-only.
- **Implementation Notes:** Will become part of the Control Tower Schedule module when built for production.

### project_team (Sandbox Table)

- **Environment:** Sandbox Only
- **Definition:** A sandbox-only team membership table scoped to `auth.uid()`. Parallel to the production `users` + `project_members` tables but structurally incompatible. Has no UI.
- **System Rule:** When sandbox timelines merge into production, the `project_team` table will be deprecated in favor of production `project_members`.

### sandboxSupabase

- **Environment:** Sandbox Only
- **Definition:** The Supabase client instance connected to the sandbox project. Exported from `supabase/sandboxClient.ts`. Used exclusively by `/demo/*` pages. Has its own auth session via dual-login.

---

## 8. Naming Conflicts & Risks

### Selection Register vs "Spec Register"

- **Issue:** The same page has two names in the UI.
- **Where Found:** navConfig.ts uses "Spec Register" as the sidebar label. TopBar.tsx uses "Selection Register" in the breadcrumb. The component is `SelectionRegister.tsx`. The URL path is `selection-register`.
- **Why It's a Problem:** Users see "Spec Register" in the nav but "Selection Register" in the breadcrumb. Three names for one feature.
- **Resolution:** "Selection Register" is canonical. The navConfig sidebar label should be updated to match. "Spec Register" is disallowed in all new code and documentation.

### Dashboard vs Company Home

- **Issue:** Both could informally be called "dashboard" or "home."
- **Where Found:** `/dashboard` is the multi-company picker. `/app/home` is the company workspace landing. Sidebar labels the latter "Home."
- **Why It's a Problem:** "Go to the dashboard" is ambiguous.
- **Resolution:** "Dashboard" = `/dashboard` (company picker). "Company Home" = `/app/home` (workspace). These are enforced naming rules. See top of this document.

### Procurement Item vs Procurement Timeline

- **Issue:** Both use "procurement" but are distinct parent-child concepts.
- **Where Found:** Production: `procurement_items` = what to procure. Sandbox: `procurement_timelines` = schedule phases.
- **Why It's a Problem:** "Procurement" is overloaded. Without context, unclear which is meant.
- **Resolution:** Always use full names: "Procurement Item" or "Procurement Timeline." The shorthand "Item" is acceptable for Procurement Item. There is no shorthand for Procurement Timeline — always qualify it.

### Contact vs User Account

- **Issue:** Both represent people but have fundamentally different capabilities.
- **Where Found:** `company_contacts` = directory record. `auth.users` + `public.users` = login identity.
- **Why It's a Problem:** Treating a Contact as a User (or vice versa) breaks the identity model. Contacts cannot log in.
- **Resolution:** See Enforced Naming Rules. Contact and User Account are always distinct. The invitation system (when built) is the bridge between them.

### Team: Production vs Sandbox

- **Issue:** Two incompatible team systems exist.
- **Where Found:** Production: `users` + `project_members` (company-scoped). Sandbox: `project_team` + `roles` (user-scoped).
- **Why It's a Problem:** No shared data, no foreign keys, no common structure.
- **Resolution:** When merging, use the production `project_members` model and deprecate the sandbox `project_team` table.

### Project Admin Nav Items: Not Disabled

- **Issue:** Team, Baselines, Reports, Settings appear in project sidebar without `disabled: true` but have no routes or pages.
- **Where Found:** navConfig.ts — projectNavGroups, "Project Admin" group.
- **Why It's a Problem:** Clicking these items navigates to non-existent routes.
- **Resolution:** Add `disabled: true` to these items until pages are built.

---

## 9. Missing or Undefined Systems

| System | Where Referenced | What's Missing |
|--------|-----------------|----------------|
| **Invitation** | CURRENT_STATE_UPDATED.md (blocker), BUILD_ROADMAP.md | No invitation model, token, flow, or email mechanism. `handle_new_user()` trigger is a no-op. |
| **Notification** | NotificationBell component, Settings.tsx | No notification data model, types, or delivery mechanism. Bell always shows "No new notifications." |
| **Billing / Subscription** | `companies.subscription_tier` column, Billing.tsx placeholder | No Stripe integration, no tier enforcement, no billing tables or UI. |
| **External Portal** | ui_ux_spec_outline.md | Entire external collaboration system is design/intent only. No tables, routes, or components. |
| **Documents** | navConfig.ts (disabled), product-spec.md | No document upload, storage, or metadata tables. |
| **Requests / RFI** | navConfig.ts (disabled), submittal-coordination-and-prep.md | No request data model or UI. |
| **Saved Views** | ui_ux_spec_outline.md | No saved view or filter persistence mechanism. |
| **Grace Period** | product-spec.md, technical-architecture-spec.md | No billing enforcement to define grace period behavior. |
