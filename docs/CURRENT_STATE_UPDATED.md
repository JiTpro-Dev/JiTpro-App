# JiTpro — Current State (Updated)

> Generated: 2026-04-06
> Based on: Full codebase audit of JiTpro-App repository (main branch)

---

## Documentation Rules

- This document is the ONLY source of truth for current system behavior.
- All other markdown files must align with this document.
- If any document conflicts with this one, this document takes precedence.
- Sandbox features are NOT considered production unless explicitly stated.
- Database schema alone does NOT imply functionality — only UI-wired features count as implemented.
- "Exists in schema" means a table or column is defined in the database. It does NOT mean users can interact with it.
- A feature is "implemented" only when a user can perform the action through the UI and data persists correctly.

---

## Document Classification Rules

Documents in this repository fall into three categories:

### 1. Current State (Truth)

- `CURRENT_STATE_UPDATED.md` (this document)
- Represents actual implemented system behavior
- Overrides all other documents

### 2. Design / Intent

- Product spec, technical architecture spec, UI/UX spec, company app pages spec
- Located in `docs/specs/` with a "DESIGN / INTENT DOCUMENT" header
- Describes what the system SHOULD become
- May not match current implementation
- Design/Intent documents must NEVER be archived solely because they differ from the current implementation

### 3. Archive

- Deprecated or outdated documents
- Located in `docs/archive/` with a "DEPRECATED DOCUMENT" header
- Must not be used for development decisions

---

## Claude Usage Rules

- When analyzing the system, always reference this document first.
- Do not assume other markdown files are accurate unless they align with this document.
- Do not infer functionality from database schema alone.
- Do not treat sandbox features as production features.
- If unsure, prefer codebase over documentation.
- If a conflict exists, this document overrides all others.

---

## Versioning Rule

- A new CURRENT_STATE document must be generated after any major feature or architectural change
- Previous versions must be moved to /docs/archive/
- Only one CURRENT_STATE document may exist in /docs/ at any time

---

## 1. What the Product Actually Does Today

- **Authentication:** Users log in with email/password via Supabase Auth. Password reset works. Signup is invitation-only (no public registration form).
- **Multi-Company Dashboard:** After login, users see all companies they belong to. Super admins can create multiple companies. Regular users are limited to one. Users can delete companies from this dashboard.
- **Company Setup Wizard:** A 6-step wizard creates a company with profile, admin, calendar, contacts, cost codes, and PCL templates. Data persists to Supabase. Incomplete setups can be resumed.
- **Company Home:** Displays real project data from Supabase — active/on-hold/completed counts, clickable project cards that navigate into project workspaces.
- **Company Data Views:** Read-only pages for People, Organizations, Cost Codes, Calendars, and Project Templates — all pulling real data from Supabase.
- **Project Creation:** Users can create new projects with name, number, description, and address. The creator is automatically added as project manager. Projects are company-scoped.
- **Project Home:** Displays real procurement item and cost code data from Supabase for the selected project.
- **Scope Builder:** Fully functional UI connected to Supabase. Users can create, update, and delete procurement items scoped to a project. Items are organized by cost code hierarchy. Supports card view and split-panel layout.
- **Selection Register:** Table view of procurement items with search, filtering, and sorting — all reading from Supabase.
- **Demo Procurement Timeline:** A separate sandbox lets users create procurement timelines, view them in a list, and visualize them on an interactive Gantt chart. Data persists to Supabase but is user-scoped (not company-scoped).

---

## 2. What a Real User Can Do

1. Log in (if they have an account)
2. Reset their password
3. View all companies they belong to on the dashboard
4. Set up a new company through the 6-step wizard
5. Switch between companies (if they belong to multiple)
6. Navigate back to the dashboard from any company page via the top nav icon
7. View their company's people, organizations, cost codes, calendars, and templates
8. Create a new project with name, number, description, and address
9. View project summary with real procurement and cost code data
10. Add, edit, and delete procurement items in the Scope Builder (connected to Supabase)
11. Search, filter, and sort procurement items in the Selection Register
12. Use the procurement timeline demo tools (sandbox, user-scoped)

---

## 3. What a Real User Cannot Do

- Sign up without an invitation
- Edit company settings after initial setup
- Manage team members or invitations
- Invite other users to the platform
- Edit or delete projects after creation
- Assign vendors to procurement items (field exists but no vendor management UI)
- Manage project locations (table exists but no UI)
- Manage submittal types on procurement items (junction table exists but no UI)
- Use billing/subscription features
- Use the Control Tower features (Procurement, Schedule, Requests, Documents)
- Manage project teams, baselines, or reports
- Receive any email notifications
- Upload files or documents

---

## 4. Frontend State

### Functional Pages

| Page | Route | Data Source |
|------|-------|-------------|
| Login | `/login` | Supabase Auth |
| Reset Password | `/reset-password` | Supabase Auth |
| Dashboard | `/dashboard` | Supabase (users, companies) |
| Setup Wizard (6 steps) | `/setup`, `/setup/:companyId` | Supabase (RPC + direct queries) |
| Company Home | `/app/home` | Supabase (projects) |
| Projects | `/app/projects` | Supabase (projects) |
| Create Project | `/app/projects/new` | Supabase (projects, project_members) |
| People | `/app/people` | Supabase (company_contacts, users) |
| Organizations | `/app/organizations` | Supabase (company_contacts) |
| Cost Codes | `/app/cost-codes` | Supabase (cost_codes, companies) |
| Calendars | `/app/calendars` | Supabase (company_work_weeks, company_holidays) |
| Project Templates | `/app/project-templates` | Supabase (pcl_templates, pcl_template_tasks) |
| Project Home | `/app/project/:projectId/home` | Supabase (procurement_items, cost_codes) |
| Scope Builder | `/app/project/:projectId/scope-builder` | Supabase (procurement_items, cost_codes) |
| Selection Register | `/app/project/:projectId/selection-register` | Supabase (procurement_items) |
| Demo Hub | `/demo` | Static links |
| Procurement Timeline | `/demo/procurement-timeline` | Supabase (procurement_timelines) |
| View Timelines | `/demo/view-procurement-timeline` | Supabase (procurement_timelines) |
| Procurement Schedule | `/demo/procurement-schedule` | Supabase (procurement_timelines) |

### Placeholder Pages

| Page | Route | Status |
|------|-------|--------|
| Billing | `/app/billing` | "Coming soon" message |
| Settings | `/app/settings` | 5 placeholder cards (Company Profile, User Management, Subscription, Notifications, Integrations) — no functionality |
| Project Information | `/project/new` | Legacy route — "Will be built here" message |
| Project Dashboard | `/project/:id` | Legacy route — displays project ID only |

### Disabled Navigation Items (In Sidebar, Not Implemented)

These appear in `navConfig.ts` with `disabled: true`:

- Procurement (Control Tower)
- Schedule (Control Tower)
- Requests (Control Tower)
- Documents (Control Tower)

These appear in `navConfig.ts` without `disabled: true` but have no corresponding route or page:

- Team (Project Admin)
- Baselines (Project Admin)
- Reports (Project Admin)
- Settings (Project Admin)

### Layouts

| Layout | File | Used By |
|--------|------|---------|
| AuthLayout | `src/layouts/AuthLayout.tsx` | Login, Reset Password |
| AppLayout | `src/layouts/AppLayout.tsx` | Dashboard, Demo pages, legacy ProjectDashboard/ProjectInformation |
| SetupLayout | `src/layouts/SetupLayout.tsx` | Setup Wizard |
| AppShell | `src/layouts/AppShell/AppShell.tsx` | All `/app/*` routes |

### Key Components

| Component | File | Purpose |
|-----------|------|---------|
| Navbar | `src/components/Navbar.tsx` | Top nav for non-app pages (logo, page title, logout) |
| PageHeader | `src/components/PageHeader.tsx` | Page title bar with optional stats, filters, actions |
| ProfileMenu | `src/components/ProfileMenu.tsx` | User avatar dropdown (sign out, placeholder links) |
| NotificationBell | `src/components/NotificationBell.tsx` | Bell icon with dropdown ("No new notifications") |
| DemoSubNav | `src/components/DemoSubNav.tsx` | Tab bar for demo pages |
| LeftNav | `src/layouts/AppShell/LeftNav.tsx` | Collapsible sidebar with context-aware navigation |
| TopBar | `src/layouts/AppShell/TopBar.tsx` | Breadcrumb, dashboard link icon, notifications, help, profile |
| ProjectSwitcher | `src/layouts/AppShell/ProjectSwitcher.tsx` | Project context switcher in sidebar |
| CompanySwitcher | `src/layouts/AppShell/CompanySwitcher.tsx` | Company switcher in LeftNav footer (only renders for multi-company users) |

### Context Providers

| Provider | File | Purpose |
|----------|------|---------|
| AuthContext | `src/context/AuthContext.tsx` | Session/user state, login/logout/resetPassword methods |
| CompanyContext | `src/context/CompanyContext.tsx` | Active company ID, company info, validation. Persists selection to localStorage. Wraps all authenticated routes. |
| ProjectContext | `src/context/ProjectContext.tsx` | Extracts project ID from URL, fetches project info from Supabase. Used by TopBar breadcrumbs and project-level pages. |

### State Management

- No Redux, Zustand, or global state library — React local state (`useState`, `useEffect`) plus three context providers (Auth, Company, Project).
- Each page independently fetches its own data from Supabase on mount.
- Active company persisted to `localStorage` via CompanyContext.

---

## 5. Backend / Supabase State

### Tables In Active Use (UI reads and/or writes)

| Table | Used By | Operations |
|-------|---------|------------|
| `companies` | Dashboard, Setup Wizard, CompanyContext, CompanySwitcher | Read, Create (via RPC), Update, Delete |
| `users` | Dashboard, Setup Wizard, People page, CompanyContext, RLS | Read, Create (via RPC), Update |
| `company_work_weeks` | Setup Wizard, Calendars page | Read, Upsert |
| `company_holidays` | Setup Wizard, Calendars page | Read, Delete+Insert |
| `company_contacts` | Setup Wizard, People page, Organizations page | Read, Delete+Insert |
| `cost_codes` | Setup Wizard, Cost Codes page, Scope Builder, ProjectHome | Read, Delete+Insert |
| `pcl_templates` | Setup Wizard, Project Templates page | Read, Delete+Insert |
| `pcl_template_tasks` | Setup Wizard, Project Templates page | Read, Delete+Insert |
| `projects` | CompanyHome, Projects page, CreateProject, ProjectContext | Read, Create |
| `project_members` | CreateProject | Create |
| `procurement_items` | Scope Builder, Selection Register, ProjectHome | Read, Create, Update, Delete |
| `procurement_timelines` | Demo timeline pages | Read, Create, Update (sandbox, user-scoped) |
| `timeline_baselines` | Demo timeline pages | Read, Create (sandbox) |
| `timeline_edit_log` | Demo timeline pages | Read, Create (sandbox) |
| `timeline_assignments` | Demo timeline pages | Read, Create (sandbox) |
| `project_team` | Demo timeline pages | Read, Create (sandbox) |
| `roles` | Demo timeline pages | Read (sandbox) |

### Tables That Exist But Are Not Used By UI

| Table | Schema Status | Why Unused |
|-------|--------------|------------|
| `project_locations` | Complete, 3-level hierarchy | No location management UI exists |
| `vendors` | Complete, company-scoped | No vendor management UI exists; `procurement_items.vendor_id` is always set to null from the UI |
| `procurement_item_locations` | Complete, junction table | No UI for item-location mapping |
| `procurement_item_submittals` | Complete, junction table | No UI for item-submittal mapping |
| `submittal_types` | Complete, seeded with 8 types | Not queried by any UI; `procurement_items.requires_submittal` is always set to false from the UI |

### Database Functions

| Function | Type | Purpose | Status |
|----------|------|---------|--------|
| `setup_company(...)` | Security definer RPC | Creates company + primary admin user; handles resume via `p_company_id`; enforces super admin multi-company rule | ACTIVE |
| `user_belongs_to_company(p_company_id)` | Security definer helper | Returns boolean: does current auth user belong to given company? | ACTIVE (used by company settings RLS) |
| `current_company_id()` | Security definer helper | Returns first `company_id` for current auth user (LIMIT 1) | DEPRECATED — migration 008 replaces all usage with `user_belongs_to_company()`. Function still exists but is no longer referenced by any RLS policy if migration 008 is applied. |
| `update_updated_at()` | Trigger function | Sets `updated_at = now()` on row update | ACTIVE (triggers on 11 tables) |
| `handle_new_user()` | Security definer trigger | NO-OP placeholder for future invite flow | INACTIVE |

### RLS Pattern

All user-data tables have RLS enabled. Two patterns:

1. **Company settings tables** (work weeks, holidays, contacts, cost codes, templates): Use `user_belongs_to_company(company_id)` — correctly supports multi-company.
2. **Project/procurement tables** (projects, vendors, procurement items, locations, members): Use `user_belongs_to_company(company_id)` — migration 008 was applied to production on 2026-04-06, fixing multi-company support. All tables now use the same RLS pattern as company settings tables.

### Edge Functions

None exist. The `supabase/functions/` directory does not exist.

---

## 6. Data Flow (Updated)

### A. User Authentication Flow

1. User navigates to `/login`
2. User enters email and password
3. `handleSubmit()` calls `login(email, password)` from AuthContext
4. AuthContext calls `supabase.auth.signInWithPassword({ email, password })`
5. Supabase returns session with JWT containing user ID and `app_metadata`
6. AuthContext updates `user` and `session` state
7. `RequireAuth` wrapper detects authenticated user
8. User is redirected to `/dashboard`
9. Dashboard fetches user's `company_id`s from `users` table
10. Dashboard fetches company details from `companies` table
11. User clicks a company card → CompanyContext stores selection in localStorage → navigates to `/app/home` or `/setup/:companyId`

### B. Company Setup Flow

1. User clicks "+ Setup New Company" on Dashboard
2. Navigates to `/setup` (new) or `/setup/:companyId` (resume)
3. **Step 1:** Company profile → `supabase.rpc('setup_company', params)` → creates company + primary admin user record → returns company UUID
4. **Step 2:** Admin info → `supabase.from('users').update(...)` scoped to `company_id`
5. **Step 3:** Work week + holidays → upsert to `company_work_weeks`, delete+insert to `company_holidays`
6. **Step 4:** CSV import or manual contacts → delete+insert to `company_contacts`
7. **Step 5:** Cost codes → delete+insert to `cost_codes` (sequential for parent_id mapping)
8. **Step 6:** PCL templates → delete+insert to `pcl_templates` + `pcl_template_tasks` → `companies.setup_completed = true`
9. Redirect to `/app/home`

### C. Project Creation Flow

1. User navigates to `/app/projects` and clicks "New Project" (or navigates directly to `/app/projects/new`)
2. User fills form: name (required), project number, description, address, city, state, zip
3. On submit, inserts into `projects` table with `company_id` from CompanyContext and `status: 'active'`
4. Looks up the current user's `users` record for this company
5. Inserts into `project_members` with `project_role: 'project_manager'`
6. Navigates to `/app/project/:projectId/home`

### D. Procurement Item Flow (Scope Builder)

1. User navigates to a project's Scope Builder (`/app/project/:projectId/scope-builder`)
2. Component fetches `cost_codes` for the active company and `procurement_items` for the project from Supabase
3. Cost codes are built into a tree structure for the left panel
4. User can create items via AddItemForm: name, description, cost code (required, must be at least section level), CSI code/division/label, status, notes. `vendor_id` is set to null; `requires_submittal` is set to false.
5. Items are inserted into `procurement_items` with `project_id` scope
6. User can update item fields (name, description, status, notes) inline
7. User can delete items
8. Selection Register provides a read-only table view with search, filtering by status, and sorting

### E. Invitation Flow

**NOT IMPLEMENTED.** The `handle_new_user()` trigger is a no-op. There is no invitation sending, acceptance, or email dispatch mechanism.

---

## 7. System Reality

### Production Application System

- **Routes:** `/app/*`
- **Layout:** AppShell (LeftNav + TopBar)
- **Data isolation:** Company-scoped via `company_id` foreign keys + RLS
- **Context:** CompanyContext manages active company; ProjectContext manages active project

**Fully functional:**
- Company setup wizard (6 steps, persists to Supabase)
- Multi-company dashboard with company switching
- Company data views: People, Organizations, Cost Codes, Calendars, Project Templates
- Company Home with real project data
- Project creation
- Project Home with real procurement/cost code data
- Scope Builder: full CRUD against `procurement_items` in Supabase
- Selection Register: read with search/filter/sort from Supabase

**Not functional:**
- Company settings editing (post-setup)
- User invitation and onboarding
- Vendor management
- Project location management
- Submittal type assignment
- Control Tower features (Procurement, Schedule, Requests, Documents)
- Project Admin features (Team, Baselines, Reports, Settings)
- Billing / subscription
- Email notifications

### Internal Sandbox System

- **Routes:** `/demo/*`
- **Layout:** AppLayout + DemoSubNav
- **Data isolation:** User-scoped via `auth.uid()` — NOT company-scoped
- **Database:** Same Supabase project as production (NOT isolated)

**What exists:**
- Procurement Timeline editor with phases and review rounds
- Timeline list view
- Procurement Schedule with interactive Gantt chart, zoom, sort, workday math
- Baseline system (immutable snapshots)
- Edit audit log (field-level change tracking)
- Team assignment structure

### What Was Connected vs Still Demo

| Feature | Status |
|---------|--------|
| Company Home data | Connected to Supabase |
| Project Home data | Connected to Supabase |
| Scope Builder | Connected to Supabase (full CRUD) |
| Selection Register | Connected to Supabase (read) |
| Procurement Timeline | Sandbox only (user-scoped, `/demo/*` routes) |
| `sampleData.ts` | Orphaned file — still exists at `src/pages/app/pre-bid/sampleData.ts` but is not imported anywhere |

---

## 8. Known Gaps

### Schema Exists But Users Cannot Access

- **Vendor management:** `vendors` table exists in the database. Users cannot create, view, or assign vendors through the product. `procurement_items.vendor_id` is always null.
- **Project locations:** `project_locations` table exists in the database. Users cannot create or manage locations. `procurement_item_locations` junction table is always empty.
- **Submittal types:** `submittal_types` lookup and `procurement_item_submittals` junction table exist in the database. Users cannot assign submittal types to items. `requires_submittal` is always false.
- **Sandbox vs production isolation:** The procurement timeline demo (`procurement_timelines`, `project_team`, `roles`, etc.) is scoped to `auth.uid()`, not `company_id`. These tables share the same Supabase project as production but are architecturally separate with no foreign keys into the production schema.

### Incomplete UI Elements

- **NotificationBell:** Always shows "No new notifications." No notification system exists.
- **ProfileMenu:** "My Profile", "Notification Preferences", "Company Settings", "Help & Support" links are placeholders — no pages exist.
- **Settings page:** 5 placeholder cards, zero functionality.
- **Billing page:** Placeholder only. No Stripe integration.
- **CSI MasterFormat loading:** "Load CSI MasterFormat 50-division" and "Load CSI MasterFormat 16-division" buttons in setup are placeholders — no CSI data is bundled.
- **Logo upload:** Field exists in setup wizard UI but no storage integration.

### Missing Entirely

- User invitation + onboarding flow
- Email notifications (any kind)
- Stripe/payment integration
- Turnstile captcha implementation
- Company settings editing (post-setup)
- User management (roles, deactivation)
- Project editing/deletion
- Project team management
- File/document management
- Reporting
- Audit logging (outside of demo `timeline_edit_log`)
- CI/CD pipeline
- Automated tests (zero test files exist)
- Error monitoring / observability

---

## 9. Current Blockers (Updated)

### RESOLVED: RLS `current_company_id()` Multi-Company Bug

- **Status:** FIXED — migration 008 applied to production on 2026-04-06, manually verified
- **What was fixed:** All project-level and procurement-level RLS policies on `projects`, `project_locations`, `project_members`, `vendors`, `procurement_items`, `procurement_item_locations`, `procurement_item_submittals` now use `user_belongs_to_company(company_id)` instead of `current_company_id()`.
- **Note:** The `current_company_id()` function still exists in the database as a deprecated helper. It is no longer referenced by any RLS policy.

### BLOCKER 2: No User Invitation System

- **Impact:** Cannot onboard any user beyond the initial account creator
- **Problem:** Secondary admins created in setup wizard get a `users` row but no `auth.users` entry. No mechanism to send invite emails, generate invite tokens, or handle invite acceptance.
- **Dependency:** Requires Supabase Edge Function + email integration (neither exists)
- **Severity:** HIGH — the product is single-user until this is built

### BLOCKER 3: Sandbox and Production Share a Database

- **Impact:** Demo/sandbox data pollutes the production database
- **Problem:** Both systems use the same Supabase client. Sandbox tables live alongside production tables with no isolation.
- **Severity:** MEDIUM — not breaking today but prevents clean production data

---

## 10. Risks

### Architecture Risks

- **No tests exist.** Zero test files in the entire repository. Any change risks breaking existing functionality.
- **No CI/CD pipeline.** Deployments are manual. No automated build verification, linting, or type-checking on push.
- **RLS `current_company_id()` is deprecated.** Migration 008 has been applied to production. The function still exists but is no longer referenced by any RLS policy. Consider dropping it in a future cleanup migration.
- **Demo tables are user-scoped, not company-scoped.** If the procurement timeline feature graduates to production, the data model needs migration.
- **`handle_new_user()` trigger does nothing.** Any future invite flow must account for this trigger firing on every auth signup.
- **All server-side env vars are defined but unused.** `RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `APP_ENV`, `APP_URL` have no consuming code.
- **Project Admin nav items (Team, Baselines, Reports, Settings) are not disabled in navConfig** but have no corresponding routes or pages — clicking them would result in no content or errors.

### Data Risks

- **No backup strategy documented.** Supabase handles backups by default but no explicit process is documented.
- **CASCADE DELETE everywhere.** Deleting a company cascades to all users, projects, contacts, cost codes, templates, and procurement items.
- **No soft-delete pattern.** Hard deletes used throughout setup wizard (delete+reinsert).
- **Orphaned file:** `src/pages/app/pre-bid/sampleData.ts` (237 lines) is not imported by any code and should be removed.

### Dependency Risks

- **Single Supabase project.** No staging/development environment documented. All development appears to hit the same Supabase instance.
- **No environment separation.** `APP_ENV` variable exists but nothing reads it.

---

## Appendix: Environment & Infrastructure

### Local Development

- **Runtime:** Node.js with Vite dev server (`npm run dev`)
- **Build:** `tsc -b && vite build` → outputs to `dist/`
- **Framework:** React 19 + TypeScript 5.9 + Tailwind CSS 3.4
- **Router:** React Router v7

### Hosting

- **Frontend:** Cloudflare Pages (auto-deploy from GitHub main branch)
- **SPA Routing:** `public/_redirects` file (`/* /index.html 200`)
- **No wrangler config in repo** — configured in Cloudflare dashboard
- **Database/Auth:** Supabase (hosted)

### Dependencies (package.json)

**Production:**
- `@supabase/supabase-js` ^2.99.1
- `lucide-react` ^1.7.0
- `react` ^19.2.4
- `react-dom` ^19.2.4
- `react-router-dom` ^7.13.1
- `tslib` ^2.8.1

**Dev:**
- `vite` ^8.0.0
- `typescript` ~5.9.3
- `tailwindcss` ^3.4.19
- `eslint` ^9.39.4
- Standard React/Vite tooling

### Environment Variables

| Variable | Location | Status |
|----------|----------|--------|
| `VITE_SUPABASE_URL` | Client-side | REQUIRED, USED |
| `VITE_SUPABASE_ANON_KEY` | Client-side | REQUIRED, USED |
| `VITE_TURNSTILE_SITE_KEY` | Client-side | DEFINED, NOT USED |
| `RESEND_API_KEY` | Server-side | DEFINED, NOT USED |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side | DEFINED, NOT USED |
| `APP_ENV` | Server-side | DEFINED, NOT USED |
| `APP_URL` | Server-side | DEFINED, NOT USED |

### GitHub

- **Repository:** `JiTpro-App` (private, user: JiTpro-Dev)
- **Branch:** `main`
- **CI/CD:** None configured

---

## 11. Source of Truth Analysis

| Domain | Source of Truth | Table/System | Env | Conflicts |
|--------|----------------|-------------|-----|-----------|
| **Authentication** | Supabase Auth | `auth.users` + JWT | Production | None. Super admin flag in `app_metadata.is_super_admin`. Working. |
| **User-Company Membership** | Supabase | `public.users` | Production | None. Links auth users to companies with roles. Multi-company supported via composite unique constraint `(auth_id, company_id)`. |
| **Company Data** | Supabase | `companies`, `company_work_weeks`, `company_holidays`, `company_contacts`, `cost_codes`, `pcl_templates`, `pcl_template_tasks` | Production | None. All populated by setup wizard. Read-only views exist. No post-setup editing. |
| **Projects** | Supabase | `projects` | Production | None. Table queried by Projects page and CompanyHome. Creation UI functional. No edit/delete UI. |
| **Procurement Items** | Supabase | `procurement_items` | Production | **UI can create, read, update, and delete items.** However, two fields are inaccessible from the UI: `vendor_id` (always set to null) and `requires_submittal` (always set to false) because AddItemForm does not expose them. Junction tables `procurement_item_locations` and `procurement_item_submittals` are never written to by any UI. Users cannot assign vendors, locations, or submittal types to items. Orphaned `sampleData.ts` still exists but is not imported. |
| **Vendors** | Supabase | `vendors` | Production (schema only) | **No UI access.** Table exists in the database with company scope. No page, component, or query reads or writes to it. Users cannot create, view, or assign vendors. The `procurement_items.vendor_id` FK is always null. |
| **Project Locations** | Supabase | `project_locations` | Production (schema only) | **No UI access.** Table exists in the database with 3-level hierarchy. No page, component, or query reads or writes to it. Junction table `procurement_item_locations` is also inaccessible from the product. |
| **Submittal Types** | Supabase | `submittal_types`, `procurement_item_submittals` | Production (schema only) | **No UI access.** Lookup table seeded with 8 types. Junction table exists. No page, component, or query reads or writes to either table. Users cannot manage submittals. |
| **Procurement Timelines** | Supabase | `procurement_timelines` | Sandbox | **Sandbox only — not a production feature.** User-scoped via `auth.uid()`, not company-scoped. Timeline data stored as JSONB array (not normalized). Accessible only via `/demo/*` routes. No production equivalent exists. |
| **Baselines / Audit** | Supabase | `timeline_baselines`, `timeline_edit_log` | Sandbox | **Sandbox only — not a production feature.** Baselines are captured as immutable JSONB snapshots but no comparison or variance UI exists. Edit logs are written on active-item changes but no viewer UI exists. No production audit system. |
| **Team Membership** | **SPLIT** | `users` + `project_members` (production) vs `project_team` + `roles` (sandbox) | Both | **Two incompatible systems exist.** Production uses `users.role` (company-level) and `project_members.project_role` (project-level). Sandbox uses its own `project_team` and `roles` tables scoped to `auth.uid()`. These share no data, no foreign keys, and no common structure. |
| **Scheduling Logic** | In-memory | Workday math in `ProcurementSchedule.tsx` | Sandbox | **Sandbox only — not reusable by production.** Weekend-skip logic, date calculations, and Gantt rendering exist only in the demo component. Not extracted into a shared utility. Hardcoded to Mon-Fri with no holiday awareness. |

---

## 12. Data Model Status

### Production-Ready (Actively Used, Correctly Scoped)

| Table | Used By | Operations | Scoping |
|-------|---------|------------|---------|
| `companies` | Dashboard, Setup Wizard, CompanyContext, CompanySwitcher | Read, Create (RPC), Update, Delete | `company_id` PK |
| `users` | Dashboard, Setup Wizard, People, CompanyContext, RLS | Read, Create (RPC), Update | `company_id` FK, unique `(auth_id, company_id)` |
| `company_work_weeks` | Setup Wizard, Calendars | Read, Upsert | `company_id` FK (unique) |
| `company_holidays` | Setup Wizard, Calendars | Read, Delete+Insert | `company_id` FK |
| `company_contacts` | Setup Wizard, People, Organizations | Read, Delete+Insert | `company_id` FK |
| `cost_codes` | Setup Wizard, Cost Codes, Scope Builder, ProjectHome | Read, Delete+Insert | `company_id` FK, hierarchical 4-level |
| `pcl_templates` | Setup Wizard, Project Templates | Read, Delete+Insert | `company_id` FK |
| `pcl_template_tasks` | Setup Wizard, Project Templates | Read, Delete+Insert | `template_id` FK |
| `projects` | CompanyHome, Projects, CreateProject, ProjectContext | Read, Create | `company_id` FK |
| `project_members` | CreateProject | Create | `project_id` FK + `user_id` FK |
| `procurement_items` | Scope Builder, Selection Register, ProjectHome | Read, Create, Update, Delete | `project_id` FK |

### Schema Only — No UI Access (Tables Exist in Database, Users Cannot Interact)

| Table | Schema Status | Why It Is Inaccessible |
|-------|--------------|------------------------|
| `project_locations` | 3-level hierarchy (Building > Floor > Room) with RLS | No page, component, or query in the application reads or writes to this table. Users cannot create or manage locations. |
| `vendors` | Company-scoped directory with RLS | No page, component, or query in the application reads or writes to this table. Users cannot create, view, or assign vendors. `procurement_items.vendor_id` is always null. |
| `procurement_item_locations` | Junction table (item ↔ location) with unique constraint | No UI exists to assign locations to procurement items. Table is empty unless populated via direct database access. |
| `procurement_item_submittals` | Junction table (item ↔ submittal type) with unique constraint | No UI exists to assign submittal types to procurement items. Table is empty unless populated via direct database access. |
| `submittal_types` | Static lookup, seeded with 8 types (shop_drawings, product_data, samples, mockups, certificates, design_mix, manufacturer_instructions, warranties) | No query in the application reads this table. `requires_submittal` on items is always set to false by AddItemForm. |

### Sandbox / Experimental (Not Production Features — Used Only in `/demo/*`)

| Table | Purpose | Scoping | Production Concern |
|-------|---------|---------|-------------------|
| `procurement_timelines` | Timeline phase management with JSONB data | `auth.uid()` — user-scoped | Not company-scoped. JSONB `timeline_data` stores phase arrays — flexible but not relational. Cannot be used by production without migration to company/project scoping. |
| `timeline_baselines` | Immutable timeline snapshots | via `procurement_timelines` | JSONB snapshots — good audit pattern. Immutable by RLS design (no update/delete policies). No comparison UI built. Sandbox only. |
| `timeline_edit_log` | Field-level change audit trail | via `procurement_timelines` | Good pattern worth replicating in production. Immutable by RLS design. No viewer UI built. Sandbox only. |
| `timeline_assignments` | Task-to-team links | via `procurement_timelines` | References `project_team` (sandbox), not `users`/`project_members` (production). **No UI exists anywhere — table defined in schema only.** |
| `project_team` | Sandbox team members | `auth.uid()` — user-scoped | Parallel to `users` + `project_members`. Not company-scoped. **No UI exists anywhere — table defined in schema only.** |
| `roles` | Role category lookup (seeded) | Shared (all authenticated) | Could potentially be reused in production as a lookup table. |

### Missing (Required but Not Yet Implemented)

| Missing Component | Required For | Notes |
|-------------------|-------------|-------|
| Invitation tracking table | User invitation flow | Need: invite status, token, expiry, acceptance |
| Notification records table | In-app + email notifications | No notification model exists |
| Subscription / billing records | Billing page, Control Tower purchases | No Stripe integration, no billing tables |
| Document storage metadata | Document management (Control Tower) | No file/document tracking tables |
| Request / RFI tracking | Requests feature (Control Tower) | No request tables |
| Production timeline/schedule | Control Tower: Schedule | Sandbox has `procurement_timelines` but production needs company-scoped, project-scoped equivalent |
| Production audit log | Change tracking on production data | Sandbox has `timeline_edit_log` pattern but nothing for production tables |

---

## 13. System Breakdown

### A. Production Application System

- **Purpose:** Company-scoped, multi-tenant SaaS for construction procurement management
- **Routes:** `/app/*`
- **Layout:** AppShell (LeftNav + TopBar)
- **Data isolation:** Company-scoped via `company_id` foreign keys + RLS

**What exists:**
- Multi-company dashboard with company switching and deletion
- Company setup wizard (6 steps, fully functional, persists to Supabase)
- Company data views: People, Organizations, Cost Codes, Calendars, Project Templates
- Company Home with real project data from Supabase
- Project creation with form (name, number, description, address)
- Project Home with real procurement and cost code summary data
- Scope Builder with full CRUD against `procurement_items` in Supabase
- Selection Register with search, filter, sort against Supabase
- Navigation with company-level and project-level contexts
- CompanySwitcher for multi-company users
- Back-to-dashboard icon in TopBar

**What is partial:**
- Scope Builder creates items but always sets `vendor_id: null` and `requires_submittal: false` — no vendor or submittal management UI
- Project creation exists but no project editing or deletion
- `project_members` is written to on creation but no team management UI exists
- Junction tables (`procurement_item_locations`, `procurement_item_submittals`) exist but are never written to

**What is missing:**
- Company settings editing (post-setup)
- User invitation and onboarding
- Vendor management UI
- Project location management UI
- Submittal type assignment UI
- Control Tower features (Procurement, Schedule, Requests, Documents)
- Project Admin features (Team, Baselines, Reports, Settings)
- Billing / subscription management
- Email notifications of any kind

---

### B. Internal Sandbox System

- **Purpose:** Experimental engine development, workflow testing, UI prototyping
- **Routes:** `/demo/*`
- **Layout:** AppLayout + DemoSubNav
- **Data isolation:** User-scoped via `auth.uid()` — NOT company-scoped
- **Database:** Same Supabase project as production (NOT isolated)

**What exists:**
- Procurement Timeline editor — create/edit timelines with phases, review rounds, milestones, FD/FS constraints
- Timeline list view — browse all saved timelines with status/date info
- Procurement Schedule — interactive Gantt chart with zoom (quarters/months/weeks/days), sort, tooltips, weekend shading, workday math
- Baseline system — immutable JSONB snapshots with sequential numbering, status promotion (draft → active)
- Edit audit log — field-level change tracking with required reason capture for active items
- Three-tier status model: draft (fully editable), active (edits require reason), complete (locked)

**What is partial:**
- Team assignments structurally defined in `timeline_assignments` table but no UI built
- Baselines are captured but no comparison/variance view exists
- Edit logs are written but no viewer/search UI exists

**What is missing:**
- Isolation from production Supabase
- Company-scoping (all data is user-scoped)
- Holiday calendar integration in workday calculations
- Export/report generation

---

### C. Authentication & Identity System

- **Purpose:** User authentication, session management, role-based access
- **Provider:** Supabase Auth (email/password)

**What exists:**
- Login page with email/password
- Password reset via email
- AuthContext provider with session subscription via `onAuthStateChange`
- RequireAuth route guard
- Super admin flag in `app_metadata.is_super_admin`
- Role definitions in `users.role`: `primary_admin`, `admin`, `project_manager`, `project_engineer`, `superintendent`, `foreman`, `read_only`

**What is partial:**
- Secondary admin creation exists in setup wizard but those users have no way to sign in (no invite flow)

**What is missing:**
- User invitation flow (email-based)
- Signup form (intentionally — invitation-only model)
- Role-based UI restrictions (all authenticated users see the same UI)
- Session timeout / forced logout
- Multi-factor authentication

---

### D. Company Setup & Configuration System

- **Purpose:** Onboard new companies with profile, admin, calendar, contacts, cost codes, templates
- **Entry point:** `/setup` or `/setup/:companyId`

**What exists:**
- 6-step wizard (all steps functional, data persists)
- `setup_company()` security definer function (bypasses RLS for chicken-and-egg problem)
- Super admin multi-company enforcement
- Resume setup for incomplete companies
- CSV import for contacts
- Cost code hierarchy builder with level validation (trigger enforces parent-child constraints)
- Cost code metadata: `is_custom`, `source_type`, `active` flags

**What is partial:**
- CSI MasterFormat loading (50-division and 16-division buttons exist, no data bundled)
- Logo upload field exists in UI but no storage integration

**What is missing:**
- Post-setup editing of any company configuration
- Settings page functionality (5 placeholder cards, zero implementation)

---

### E. Project & Procurement Data System

- **Purpose:** Structured relational model for projects, procurement items, locations, vendors, submittals
- **Schema:** `docs/schema/migrations/004_projects.sql`, `005_procurement.sql`

**What exists and is wired to UI:**
- `projects`: Create via form, read in list and home views, company-scoped
- `project_members`: Creator added as project_manager on creation
- `procurement_items`: Full CRUD via Scope Builder, read via Selection Register and ProjectHome
- Cost code tree integration: items assigned to cost codes at level 2+, displayed hierarchically

**What exists in database only — users cannot access through the product:**
- `project_locations` (3-level hierarchy) — no UI to create, view, or manage
- `vendors` (company directory) — no UI to create, view, or assign
- `procurement_item_locations` (junction) — no UI to assign locations to items
- `procurement_item_submittals` (junction) — no UI to assign submittal types to items
- `submittal_types` (8-type lookup) — not queried by any page or component

**What is missing:**
- Project editing and deletion
- Project team management (viewing/assigning members beyond initial creator)
- Vendor CRUD and assignment to items
- Location CRUD and assignment to items
- Submittal type assignment to items

---

### F. UI Layer (AppShell, Pages, Navigation)

- **Purpose:** Layout structure, navigation, shared components

**What exists:**
- 4 layout systems: AuthLayout, AppLayout, SetupLayout, AppShell
- AppShell with collapsible LeftNav, TopBar with breadcrumbs (company > project > page)
- TopBar right actions: dashboard link icon, NotificationBell, HelpCircle, ProfileMenu
- Context-aware navigation (company-level vs project-level nav groups)
- ProjectSwitcher and CompanySwitcher components
- PageHeader with stats, filters, actions slots
- 3 context providers: AuthContext, CompanyContext (localStorage persistence), ProjectContext (URL-driven)

**What is partial:**
- ProfileMenu links (My Profile, Notification Preferences, Company Settings, Help) go nowhere
- NotificationBell always shows "No new notifications"
- Project Admin nav items (Team, Baselines, Reports, Settings) appear in sidebar without `disabled: true` but have no routes or pages

**What is missing:**
- Mobile responsiveness testing/optimization
- Loading skeletons / error boundaries
- Toast/notification system for user feedback

---

### G. Infrastructure (Supabase, Cloudflare)

- **Purpose:** Hosting, database, authentication, deployment

**What exists:**
- Single Supabase project (database + auth + RLS)
- Cloudflare Pages deployment (auto-deploy from GitHub main branch)
- SPA routing via `public/_redirects` (`/* /index.html 200`)
- Vite build pipeline (`tsc -b && vite build`)
- 10 migration files in `docs/schema/migrations/` (001 through 010)
- 4 migrations in `supabase/migrations/` (3 sandbox/demo schema + 1 RLS multi-company fix)

**What is partial:**
- Environment variable definitions exist for Resend, Turnstile, service role key — no consuming code
- Migration 008 (`rls_multi_company_fix.sql`) exists in both `docs/schema/migrations/` and `supabase/migrations/` — applied to production on 2026-04-06

**What is missing:**
- Supabase Edge Functions (directory has only demo migrations)
- CI/CD pipeline (no GitHub Actions)
- Staging/dev environment separation
- Error monitoring / observability
- Automated tests

---

## 14. Key Conflicts

### 1. Team Membership: Two Parallel Systems

- **Production:** `users` table (company-level roles) + `project_members` table (project-level roles)
- **Sandbox:** `project_team` + `roles` tables (user-scoped, not company-scoped)
- **Impact:** If the sandbox timeline feature graduates to production, team assignments must be rewired from `project_team` to `users`/`project_members`. The `roles` lookup table structure differs from the `users.role` enum approach.

### 2. Procurement Items vs Procurement Timelines

- **Production:** `procurement_items` = "what am I procuring?" — item identity, status, cost code, vendor
- **Sandbox:** `procurement_timelines` = "how long will each phase take?" — schedule, durations, milestones
- **Impact:** These are complementary concepts that will eventually need linking (a timeline describes the schedule for procuring an item). Currently they exist in separate worlds with no FK relationship. Production items are project-scoped; sandbox timelines are user-scoped.

### 3. Workday Math: Sandbox Only, Not Reusable

- **Location:** `ProcurementSchedule.tsx` contains `isWorkday()`, `addWorkdays()`, `subtractWorkdays()`, `nextWorkday()`, `daysBetween()`
- **Impact:** These are hardcoded to Mon-Fri with no holiday awareness. Production has `company_work_weeks` (custom work days) and `company_holidays` (holiday calendar) tables. When scheduling moves to production, workday math must be rebuilt to use company-specific calendars, not hardcoded weekends.

### 4. Scope Builder: Partial Field Coverage

- **Database schema:** `procurement_items` has `vendor_id`, `requires_submittal`, and junction tables for locations and submittals
- **UI (AddItemForm):** Always sets `vendor_id: null` and `requires_submittal: false`. No fields exist for location or submittal assignment.
- **Impact:** Items created via the UI are always incomplete relative to the full schema. Vendor, location, and submittal data can only be populated via direct database manipulation.

### 5. RLS Migration: Applied

- **Migration 008** (`008_rls_multi_company_fix.sql`) replaced all `current_company_id()` usage with `user_belongs_to_company()` on all project/procurement RLS policies.
- **Status:** Applied to production on 2026-04-06. Multi-company behavior manually verified. File exists in both `docs/schema/migrations/` and `supabase/migrations/`. The consolidated migration (`000_full_migration.sql`) has also been updated.
- **Remaining cleanup:** The `current_company_id()` function still exists in the database but is no longer referenced. Can be dropped in a future migration.

---

## 15. Promotion Readiness Framework

### Stage Definitions

| Stage | Meaning | Criteria |
|-------|---------|----------|
| **Experimental** | Prototype or proof-of-concept. May use hardcoded data, user-scoped isolation, or non-production patterns. | Code exists and runs. Not production-safe. |
| **Internally Usable** | Works for the development team with real data against Supabase. May have gaps in edge cases, validation, or UX polish. | Connected to real database. Core CRUD works. Company/project scoped. |
| **Data Model Locked** | Schema is finalized. RLS policies applied. Migration exists and is documented. Ready for other features to build on. | No expected schema changes. Foreign keys and constraints in place. |
| **Pre-Deployment Tested** | Feature has been tested end-to-end with realistic data. Error states handled. No known bugs. | Manual QA complete. Edge cases covered. |
| **Production Ready** | Safe for external users. Handles all error states, has appropriate access controls, and meets UX standards. | Could ship to a paying customer. |

### Current Feature Stages

| Feature | Stage | Justification |
|---------|-------|---------------|
| **Company Setup Wizard** | Internally Usable | 6 steps work, data persists. CSI loading is placeholder. No post-setup editing. No tests. |
| **Multi-Company Dashboard** | Internally Usable | Works for super admin. Company switching functional. Delete works. RLS fix may not be applied (see Conflict #5). |
| **Project Creation** | Internally Usable | Form works, saves to Supabase, adds creator as PM. No edit/delete. No validation beyond required name. |
| **Scope Builder** | Internally Usable | Full CRUD against Supabase. Cost code tree works. But vendor_id always null, requires_submittal always false, no location or submittal assignment. |
| **Selection Register** | Internally Usable | Read, search, filter, sort all work against Supabase. No inline editing. |
| **Company Data Views** | Internally Usable | People, Orgs, Cost Codes, Calendars, Templates all read real data. No editing capability. |
| **Procurement Timeline (Sandbox)** | Experimental | Full editor with phases, baselines, edit logging. User-scoped, not company-scoped. JSONB storage, not relational. Shares production database. |
| **Gantt Schedule (Sandbox)** | Experimental | Interactive chart with zoom, sort, workday math. Hardcoded Mon-Fri (no holiday support). Not connected to production data. |
| **Baseline System (Sandbox)** | Experimental | Immutable snapshots captured correctly. No comparison/variance UI. Sandbox-only. |
| **Team Assignments (Sandbox)** | Experimental | Table structure defined. No UI exists. Not wired to any component. |
| **Project System (schema)** | Data Model Locked | `projects`, `project_locations`, `project_members` tables defined with constraints and RLS. But only `projects` and `project_members` are used by UI. |
| **Procurement System (schema)** | Data Model Locked | `procurement_items`, junction tables, `vendors`, `submittal_types` all defined with constraints. But junction tables and vendors are unused by UI. |
| **Billing** | Not Started | Placeholder page. No Stripe integration. No billing tables. |
| **Control Tower** | Not Started | Nav items exist (disabled). No pages, no components, no tables. |
| **User Invitation** | Not Started | `handle_new_user()` trigger is a no-op. No invite sending, acceptance, or email mechanism. |
| **Email Notifications** | Not Started | No edge functions. No email-sending code. Resend API key defined but unused. |
