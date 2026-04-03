# JITPRO_CURRENT_STATE.md

> Generated: 2026-04-03
> Based on: Full codebase audit of JiTpro-App repository (main branch)

---

## 1. PRODUCT OVERVIEW (CURRENT REALITY ONLY)

### What the product actually does today

- **Authentication:** Users can log in with email/password via Supabase Auth. Password reset works. Signup is invitation-only (no public registration form).
- **Company Setup Wizard:** A 6-step wizard creates a company with profile, admin, calendar, contacts, cost codes, and PCL templates. Data persists to Supabase.
- **Multi-Company Dashboard:** After login, users see all companies they belong to. Super admins (Jeff) can create multiple companies. Regular users are limited to one.
- **Company Data Views:** Read-only pages for People, Organizations, Cost Codes, Calendars, and Project Templates — all pulling real data from Supabase.
- **Projects List:** Displays projects belonging to a company from Supabase. No project creation UI exists.
- **Demo Procurement Timeline:** A functional demo lets users create procurement timelines, view them in a list, and visualize them on an interactive Gantt chart. Data persists to Supabase.
- **Scope Builder / Selection Register:** Functional UI with filtering, sorting, and item management — but uses hardcoded sample data, NOT connected to Supabase.

### What a real user can do right now

1. Log in (if they have an account)
2. Reset their password
3. Set up a new company through the 6-step wizard
4. View their company's people, organizations, cost codes, calendars, and templates
5. View a list of projects (if any exist in the database)
6. Use the procurement timeline demo tools
7. Browse the scope builder and selection register (sample data only)

### What a real user CANNOT do right now

- Sign up without an invitation
- Create a new project
- Edit company settings after initial setup
- Manage team members or invitations
- Use billing/subscription features
- Use the Control Tower features (procurement, schedule, requests, documents)
- Receive any email notifications

---

## 2. FRONTEND — MARKETING SITE

**There is no marketing site in this codebase.** All pages except `/login` and `/reset-password` require authentication. The login page links externally to `https://jit-pro.com/contact/contractor` for inquiries — that site is separate from this repository.

### Public Pages (No Auth Required)

| Page | Route | Purpose | Static/Dynamic | Forms | Submit Action |
|------|-------|---------|---------------|-------|---------------|
| Login | `/login` | Email/password authentication | Static | Yes — email, password, remember me | Calls `supabase.auth.signInWithPassword()` → redirects to `/dashboard` |
| Reset Password | `/reset-password` | Password recovery | Static | Yes — email | Calls `supabase.auth.resetPasswordForEmail()` → shows confirmation |

**Notes:**
- Login page states: "JiTpro accounts are currently available by invitation only"
- No contact form exists in this codebase
- No Turnstile/captcha is implemented (env var exists in `.env.example` but no code uses it)

---

## 3. BACKEND — SUPABASE

### Tables

#### Core Tables (Company Setup & Management)

| Table | Purpose | Key Fields | Relationships |
|-------|---------|------------|---------------|
| `companies` | Company/customer profiles | legal_name, display_name, address, city, state, zip, license_number, states_licensed_in, timezone, setup_completed, subscription_tier | Parent of all company-scoped data |
| `users` | Links auth users to companies with roles | auth_id (FK→auth.users), company_id (FK→companies), first_name, last_name, email, role | Belongs to companies; references auth.users |
| `company_work_weeks` | Work days per company (Mon-Sun booleans) | company_id (UNIQUE), monday–sunday booleans | Belongs to companies |
| `company_holidays` | Company holiday calendar | company_id, name, date_description, is_recurring, is_active, is_default, sort_order | Belongs to companies |
| `company_contacts` | Contact directory (internal/external) | company_id, first_name, last_name, title, company_organization, email, phone, contact_type, role_category | Belongs to companies |
| `cost_codes` | Hierarchical cost codes (CSI-like, 4 levels) | company_id, code, title, level (1-4), parent_id (self-ref), sort_order | Belongs to companies; self-referential hierarchy |
| `pcl_templates` | Procurement cycle lifecycle templates | company_id, name, description, examples, review_rounds, sort_order | Belongs to companies |
| `pcl_template_tasks` | Tasks within PCL templates | template_id (FK→pcl_templates), name, default_days, sort_order | Belongs to pcl_templates |

#### Project Tables

| Table | Purpose | Key Fields | Relationships |
|-------|---------|------------|---------------|
| `projects` | Construction projects | company_id, name, description, project_number, address, status, has_control_tower | Belongs to companies |
| `project_locations` | Hierarchical locations (Building>Floor>Room, 3 levels) | project_id, name, level (1-3), parent_id (self-ref) | Belongs to projects |
| `project_members` | User-project assignments | project_id (FK→projects), user_id (FK→users), project_role | Junction: projects ↔ users |
| `vendors` | Company vendor directory | company_id, name, contact_name, contact_email | Belongs to companies |
| `submittal_types` | Static lookup (8 types) | id (text PK), label, sort_order | Standalone lookup; seeded with 8 rows |

#### Procurement Tables (Scope Builder Schema)

| Table | Purpose | Key Fields | Relationships |
|-------|---------|------------|---------------|
| `procurement_items` | Items needing procurement/spec | project_id, name, cost_code_id, vendor_id, status (ready/pending_selection/missing_design) | Belongs to projects; refs cost_codes, vendors |
| `procurement_item_locations` | Item ↔ location junction | item_id (FK→procurement_items), location_id (FK→project_locations) | Junction table |
| `procurement_item_submittals` | Item ↔ submittal type junction | item_id (FK→procurement_items), submittal_type_id (FK→submittal_types) | Junction table |

#### Demo Tables (Procurement Timeline Demo)

| Table | Purpose | Key Fields | Relationships |
|-------|---------|------------|---------------|
| `roles` | Role category lookup (seeded) | category, sub_role, sort_order | Standalone lookup |
| `project_team` | Demo project team members | user_id (FK→auth.users), first_name, last_name, role_id | Scoped to auth user, NOT company |
| `procurement_timelines` | Demo timeline items | user_id, name, delivery_date, timeline_data (JSONB), status, baseline_count | Scoped to auth user, NOT company |
| `timeline_assignments` | Task-to-team-member assignments | timeline_id, task_name, team_member_id | Belongs to procurement_timelines |
| `timeline_baselines` | Immutable timeline snapshots | timeline_id, baseline_number, snapshot (JSONB) | Belongs to procurement_timelines; no update/delete |
| `timeline_edit_log` | Timeline change audit trail | timeline_id, task_name, field_changed, old_value, new_value, reason | Belongs to procurement_timelines; no update/delete |

**Total tables: 22** (16 core + 6 demo)

### Database Functions

| Function | Type | Purpose | Called By |
|----------|------|---------|-----------|
| `setup_company(...)` | Security definer RPC | Creates company + primary admin user record; handles resume setup via p_company_id param; enforces super admin multi-company rule | `supabase.rpc('setup_company', params)` from setup wizard step 1 |
| `user_belongs_to_company(p_company_id)` | Security definer helper | Returns boolean: does current auth user belong to given company? | RLS policies on company settings tables |
| `current_company_id()` | Security definer helper | Returns first company_id for current auth user (LIMIT 1) | RLS policies on projects, procurement, vendors tables |
| `update_updated_at()` | Trigger function | Sets `updated_at = now()` on row update | BEFORE UPDATE triggers on 11 tables |
| `handle_new_user()` | Security definer trigger | **NO-OP placeholder** — intended for future invite flow | AFTER INSERT on auth.users |

### Edge Functions

- **None exist.** The `supabase/functions/` directory does not exist.

### Auth System

- **Login method:** Email/password via Supabase Auth
- **Signup:** Invitation-only (no public signup form exists)
- **Roles:** Defined in `users.role` column: `primary_admin`, `admin`, `project_manager`, `project_engineer`, `superintendent`, `foreman`, `read_only`
- **Super admin:** Stored in auth user `app_metadata.is_super_admin = true` — allows multiple company creation
- **Session management:** Supabase client handles JWT tokens; AuthContext subscribes to `onAuthStateChange`
- **Invitation flow:** NOT IMPLEMENTED (placeholder in `handle_new_user()` trigger)

### RLS Pattern

All user-data tables have RLS enabled. Two patterns are used:

1. **Company settings tables** (work weeks, holidays, contacts, cost codes, templates): Use `user_belongs_to_company(company_id)` — supports multi-company
2. **Project/procurement tables** (projects, vendors, procurement items, locations, members): Use `current_company_id()` — returns LIMIT 1, does NOT fully support multi-company yet

---

## 4. APPLICATION (JiTpro App)

### Pages — FUNCTIONAL

| Page | Route | Layout | Data Source | Status |
|------|-------|--------|-------------|--------|
| Login | `/login` | AuthLayout | Supabase Auth | FUNCTIONAL |
| Reset Password | `/reset-password` | AuthLayout | Supabase Auth | FUNCTIONAL |
| Dashboard | `/dashboard` | AppLayout | Supabase (users, companies) | FUNCTIONAL |
| Setup Wizard (6 steps) | `/setup`, `/setup/:companyId` | SetupLayout | Supabase (RPC + direct queries) | FUNCTIONAL |
| Projects | `/app/projects` | AppShell | Supabase (projects) | FUNCTIONAL |
| People | `/app/people` | AppShell | Supabase (company_contacts, users) | FUNCTIONAL |
| Organizations | `/app/organizations` | AppShell | Supabase (company_contacts) | FUNCTIONAL |
| Cost Codes | `/app/cost-codes` | AppShell | Supabase (cost_codes, companies) | FUNCTIONAL |
| Calendars | `/app/calendars` | AppShell | Supabase (company_work_weeks, company_holidays) | FUNCTIONAL |
| Project Templates | `/app/project-templates` | AppShell | Supabase (pcl_templates, pcl_template_tasks) | FUNCTIONAL |
| Demo Hub | `/demo` | AppLayout | None (static links) | FUNCTIONAL |
| Procurement Timeline | `/demo/procurement-timeline` | AppLayout | Supabase (procurement_timelines) | FUNCTIONAL |
| View Timelines | `/demo/view-procurement-timeline` | AppLayout | Supabase (procurement_timelines) | FUNCTIONAL |
| Procurement Schedule | `/demo/procurement-schedule` | AppLayout | Supabase (procurement_timelines) | FUNCTIONAL |

### Pages — PARTIAL (Hardcoded Demo Data)

| Page | Route | What Works | What's Missing |
|------|-------|------------|----------------|
| Company Home | `/app/home` | Layout renders, summary cards display | All data is hardcoded; no Supabase queries |
| Project Home | `/app/project/:projectId/home` | Layout renders, summary cards, scope builder summary | All data is hardcoded |
| Scope Builder | `/app/project/:projectId/scope-builder` | Full UI with card view, split panel, add item form | Uses `sampleData.ts`, not connected to Supabase |
| Selection Register | `/app/project/:projectId/selection-register` | Full UI with search, filtering, sorting | Uses `sampleData.ts`, not connected to Supabase |

### Pages — PLACEHOLDER (Coming Soon)

| Page | Route | Status |
|------|-------|--------|
| Billing | `/app/billing` | "Coming soon" message |
| Settings | `/app/settings` | 5 placeholder cards (Company Profile, User Management, Subscription, Notifications, Integrations) |
| Project Information | `/project/new` | "Will be built here" message |
| Project Dashboard | `/project/:id` | Displays project ID only |

### Pages — NOT IMPLEMENTED (In Nav But Disabled)

These appear in the sidebar navigation config (`navConfig.ts`) with `disabled: true`:

- `/app/project/:projectId/procurement` — Control Tower: Procurement
- `/app/project/:projectId/schedule` — Control Tower: Schedule
- `/app/project/:projectId/requests` — Control Tower: Requests
- `/app/project/:projectId/documents` — Control Tower: Documents
- `/app/project/:projectId/team` — Project Admin: Team
- `/app/project/:projectId/baselines` — Project Admin: Baselines
- `/app/project/:projectId/reports` — Project Admin: Reports
- `/app/project/:projectId/settings` — Project Admin: Settings

### Layouts

| Layout | File | Used By |
|--------|------|---------|
| AuthLayout | `src/layouts/AuthLayout.tsx` | Login, Reset Password |
| AppLayout | `src/layouts/AppLayout.tsx` | Dashboard, Demo pages, ProjectDashboard, ProjectInformation |
| SetupLayout | `src/layouts/SetupLayout.tsx` | Setup Wizard only |
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
| TopBar | `src/layouts/AppShell/TopBar.tsx` | Breadcrumb, create button, notifications, profile |
| ProjectSwitcher | `src/layouts/AppShell/ProjectSwitcher.tsx` | Project context switcher in sidebar |

### Context Providers

| Provider | File | Purpose |
|----------|------|---------|
| AuthContext | `src/context/AuthContext.tsx` | Session/user state, login/logout/resetPassword methods |

### State Management

- **No Redux, Zustand, or global state library** — React local state only (`useState`, `useEffect`)
- Auth state managed via `AuthContext`
- Each page independently fetches its own data from Supabase on mount
- Setup wizard holds all 6 steps of form data in local component state

---

## 5. INTEGRATIONS

| Service | Purpose | Where Referenced | Status |
|---------|---------|-----------------|--------|
| **Supabase** | Database, Auth, RLS | `supabase/client.ts`, all pages | WORKING |
| **Cloudflare Pages** | Hosting/deployment | Recent commit messages reference it | WORKING (deployed) |
| **Cloudflare Turnstile** | Captcha/bot protection | `.env.example` has `VITE_TURNSTILE_SITE_KEY` | NOT IMPLEMENTED — env var exists but zero code uses it |
| **Resend** | Email service | `.env.example` has `RESEND_API_KEY`, referenced in CLAUDE.md | NOT IMPLEMENTED — no edge functions or email code exists |
| **Stripe** | Payments | Referenced in `docs/guides/security.md` as `STRIPE_SECRET_KEY` | NOT IMPLEMENTED — no code exists |
| **Lucide React** | Icon library | `package.json` dependency, used throughout UI | WORKING |

---

## 6. DATA FLOW

### A. Contact Form Submission

**DOES NOT EXIST.** There is no contact form in this codebase. The login page links to an external URL (`https://jit-pro.com/contact/contractor`) which is a separate site.

### B. User Authentication Flow

1. User navigates to `/login`
2. User enters email and password
3. `handleSubmit()` calls `login(email, password)` from AuthContext
4. AuthContext calls `supabase.auth.signInWithPassword({ email, password })`
5. Supabase returns session with JWT containing user ID and app_metadata
6. AuthContext updates `user` and `session` state
7. `RequireAuth` wrapper detects authenticated user
8. User is redirected to `/dashboard`
9. Dashboard fetches user's company_ids from `users` table
10. Dashboard fetches company details from `companies` table
11. User clicks a company card → navigates to `/app/home` or `/setup/:companyId`

### C. Company Setup Flow

1. User clicks "+ Setup New Company" on Dashboard
2. Navigates to `/setup` (new) or `/setup/:companyId` (resume)
3. **Step 1:** User fills company profile → `supabase.rpc('setup_company', params)` → creates company + primary admin user record → returns company UUID
4. **Step 2:** User fills admin info → `supabase.from('users').update(...)` scoped to company_id
5. **Step 3:** User configures work week + holidays → upsert to `company_work_weeks`, delete+insert to `company_holidays`
6. **Step 4:** User imports CSV or manually adds contacts → delete+insert to `company_contacts`
7. **Step 5:** User uploads cost codes → delete+insert to `cost_codes` (sequential for parent_id mapping)
8. **Step 6:** Default PCL templates displayed → delete+insert to `pcl_templates` + `pcl_template_tasks` → `companies.setup_completed = true`
9. Redirect to `/app/home`

### D. Invitation Flow

**NOT IMPLEMENTED.** The `handle_new_user()` trigger is a no-op placeholder. There is no invitation sending, acceptance, or email dispatch mechanism.

---

## 7. ENVIRONMENTS & DEPLOYMENT

### Local Development

- **Runtime:** Node.js with Vite dev server (`npm run dev`)
- **Build:** `tsc -b && vite build` → outputs to `dist/`
- **Framework:** React 19 + TypeScript 5.9 + Tailwind CSS 3.4
- **Router:** React Router v7

### GitHub

- **Repository:** `JiTpro-App` (private, user: JiTpro-Dev)
- **Branch:** `main`
- **CI/CD:** None configured (no `.github/workflows/` directory)

### Hosting

- **Frontend:** Cloudflare Pages (based on recent commit messages about `wrangler` SPA config and `_redirects`)
- **Wrangler config:** No `wrangler.toml` exists in repo — likely configured in Cloudflare dashboard
- **Database/Auth:** Supabase (hosted)

### Environment Variables

| Variable | Location | Purpose | Status |
|----------|----------|---------|--------|
| `VITE_SUPABASE_URL` | Client-side | Supabase project URL | REQUIRED, USED |
| `VITE_SUPABASE_ANON_KEY` | Client-side | Supabase anonymous key | REQUIRED, USED |
| `VITE_TURNSTILE_SITE_KEY` | Client-side | Cloudflare Turnstile captcha | DEFINED, NOT USED |
| `RESEND_API_KEY` | Server-side | Resend email service | DEFINED, NOT USED |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side | Supabase admin access | DEFINED, NOT USED |
| `APP_ENV` | Server-side | Environment identifier | DEFINED, NOT USED |
| `APP_URL` | Server-side | Application base URL | DEFINED, NOT USED |

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

---

## 8. KNOWN GAPS / INCOMPLETE AREAS

### Critical

- **No invitation flow:** Users cannot be invited to the platform. The `handle_new_user()` trigger is a no-op. Secondary admins created in setup have no way to actually sign in.
- **No email capability:** Resend is referenced but no edge functions or email-sending code exists. No welcome emails, no password reset emails beyond Supabase defaults, no notifications.
- **No project creation:** The "Create New Project" button is disabled with "Coming soon." Projects can only exist if manually inserted into the database.
- **RLS inconsistency for multi-company:** Project/procurement/vendor RLS policies still use `current_company_id()` which returns `LIMIT 1` — this will break for super admins accessing their second+ company's projects.

### Incomplete

- **Company Home page:** Renders but all data is hardcoded demo content — not connected to Supabase.
- **Project Home page:** Same — all hardcoded.
- **Scope Builder:** Full UI exists but uses `sampleData.ts` instead of the `procurement_items`, `project_locations`, and related tables that exist in the schema.
- **Selection Register:** Same — full UI, sample data only.
- **Settings page:** 5 placeholder cards, no functionality.
- **Billing page:** Placeholder only. No Stripe integration exists.
- **Cost code loading:** "Load CSI MasterFormat 50-division" and "Load CSI MasterFormat 16-division" buttons in setup are placeholders — no CSI data is bundled.
- **Notifications:** `NotificationBell` component exists but always shows "No new notifications." No notification system exists.
- **Profile menu:** "My Profile", "Notification Preferences", "Company Settings", "Help & Support" links are placeholder — no pages exist for them.

### Not Wired Together

- **Scope Builder schema vs UI:** The database has `procurement_items`, `procurement_item_locations`, `procurement_item_submittals`, `vendors`, `project_locations`, and `submittal_types` tables — but the Scope Builder UI reads from hardcoded `sampleData.ts` instead.
- **Demo tables vs core schema:** The procurement timeline demo (`procurement_timelines`, `project_team`, `roles`, etc.) is scoped to `auth.uid()` rather than `company_id`. These tables are separate from the core company-scoped schema and would need reconciliation.
- **Control Tower features:** Navigation items exist for Procurement, Schedule, Requests, and Documents — all disabled. No pages or components exist for them.

### Missing Entirely

- User invitation + onboarding flow
- Email notifications (any kind)
- Stripe/payment integration
- Turnstile captcha implementation
- Company settings editing (post-setup)
- User management (roles, deactivation)
- Project creation workflow
- Project team management
- File/document management
- Reporting
- Audit logging (outside of demo timeline_edit_log)
- CI/CD pipeline
- Automated tests (zero test files exist)
- Error monitoring / observability

---

## 9. ASSUMPTIONS / RISKS

### Architecture Risks

- **No tests exist.** Zero test files in the entire repository. Any change risks breaking existing functionality with no safety net.
- **No CI/CD pipeline.** Deployments are manual. No automated build verification, linting, or type-checking on push.
- **RLS `current_company_id()` returns LIMIT 1.** This is a latent bug — when the super admin has multiple companies and enters the app for company #2, project/vendor/procurement queries may return data from company #1. Only the company settings tables have been fixed to use `user_belongs_to_company()`.
- **Demo tables are user-scoped, not company-scoped.** The procurement timeline demo bypasses the multi-tenant architecture. If this feature graduates to production, the data model needs migration.
- **`handle_new_user()` trigger does nothing.** Any future invite flow must account for the fact that this trigger fires on every auth signup but currently has no logic.
- **All server-side env vars are defined but unused.** `RESEND_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `APP_ENV`, `APP_URL` — none have consuming code. When edge functions are eventually built, these will need to be set in the deployment environment.

### Data Risks

- **No backup strategy documented.** Supabase handles this by default but no explicit backup/restore process is documented.
- **CASCADE DELETE everywhere.** Deleting a company cascades to all users, projects, contacts, cost codes, templates, and procurement items. One accidental delete wipes everything.
- **No soft-delete pattern.** Tables have `is_active` flags in some places but no consistent soft-delete pattern. Hard deletes are used throughout the setup wizard (delete+reinsert).

### Dependency Risks

- **Single Supabase project.** No staging/development environment is documented. All development appears to hit the same Supabase instance.
- **No environment separation.** `APP_ENV` variable exists but nothing reads it. No conditional logic for dev vs staging vs production behavior.

---

## 10. SYSTEM BREAKDOWN

### A. Production Application System

- **Purpose:** Company-scoped, multi-tenant SaaS for construction procurement management
- **Routes:** `/app/*`
- **Layout:** AppShell (sidebar + topbar)
- **Data isolation:** Company-scoped via `company_id` foreign keys + RLS

**What exists:**
- Company setup wizard (6 steps, fully functional, persists to Supabase)
- Company data views: Projects, People, Organizations, Cost Codes, Calendars, Project Templates
- Navigation structure with company-level and project-level contexts
- Scope Builder and Selection Register UI components

**What is partial:**
- Company Home — layout renders, data is hardcoded
- Project Home — layout renders, data is hardcoded
- Scope Builder — full UI exists but reads from `sampleData.ts`, not Supabase
- Selection Register — full UI exists but reads from `sampleData.ts`, not Supabase

**What is missing:**
- Project creation workflow
- Company settings editing (post-setup)
- User invitation and onboarding
- User management (roles, deactivation)
- Control Tower features (Procurement, Schedule, Requests, Documents)
- Project Admin features (Team, Baselines, Reports, Settings)
- Billing / subscription management
- Email notifications of any kind

---

### B. Internal Sandbox System

- **Purpose:** Experimental engine development, workflow testing, UI prototyping
- **Routes:** `/demo/*` (to be renamed `/sandbox/*`)
- **Layout:** AppLayout + DemoSubNav
- **Data isolation:** User-scoped via `auth.uid()` — NOT company-scoped
- **Current Supabase client:** Same project as production (NOT isolated yet)

**What exists:**
- Procurement Timeline editor — create/edit timelines with phases, review rounds, milestones
- Timeline list view — browse all saved timelines with status/date info
- Procurement Schedule — interactive Gantt chart with zoom, sort, tooltips, workday math
- Baseline system — immutable snapshots with baseline numbering
- Edit audit log — field-level change tracking with reason capture
- Team assignment structure — link team members to timeline tasks

**What is partial:**
- Team assignments are structurally defined but not wired into the timeline editor UI

**What is missing:**
- Isolation from production Supabase (currently shares the same database)
- Company-scoping (all sandbox data is user-scoped)

---

### C. Authentication & Identity System

- **Purpose:** User authentication, session management, role-based access
- **Provider:** Supabase Auth (email/password)

**What exists:**
- Login page with email/password
- Password reset via email
- AuthContext provider with session subscription
- RequireAuth route guard
- Super admin flag in `app_metadata.is_super_admin`
- Role definitions in `users.role` column (7 roles)

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
- Cost code hierarchy builder

**What is partial:**
- CSI MasterFormat loading (50-division and 16-division buttons exist, no data bundled)
- Logo upload field exists in UI but no storage integration

**What is missing:**
- Post-setup editing of any company configuration
- Settings page functionality (5 placeholder cards, zero implementation)

---

### E. Project & Procurement Data System

- **Purpose:** Structured relational model for projects, procurement items, locations, vendors, submittals
- **Schema location:** `docs/schema/migrations/004_projects.sql`, `005_procurement.sql`

**What exists (in database):**
- `projects` table with status, company scope, Control Tower flag
- `project_locations` (3-level hierarchy)
- `project_members` (user-project junction with project roles)
- `vendors` (company-level vendor directory)
- `procurement_items` with status, CSI code, vendor, submittal requirements
- `procurement_item_locations` (item ↔ location junction)
- `procurement_item_submittals` (item ↔ submittal type junction)
- `submittal_types` (8-type seeded lookup)

**What is partial:**
- Projects page reads from Supabase but project creation is disabled
- Scope Builder UI exists but is NOT wired to the database tables above

**What is missing:**
- Project creation UI/workflow
- Any CRUD operations against `procurement_items`, `project_locations`, `vendors` from the UI
- Connection between Scope Builder UI and the relational procurement schema

---

### F. UI Layer (AppShell, Pages, Navigation)

- **Purpose:** Layout structure, navigation, shared components

**What exists:**
- 4 layout systems: AuthLayout, AppLayout, SetupLayout, AppShell
- AppShell with collapsible LeftNav, TopBar, breadcrumbs, ProfileMenu, NotificationBell
- Context-aware navigation (company-level vs project-level)
- ProjectSwitcher component
- PageHeader with stats, filters, actions slots
- Responsive grid layouts throughout

**What is partial:**
- ProfileMenu links (My Profile, Notification Preferences, Company Settings, Help) go nowhere
- NotificationBell always shows "No new notifications"
- Create button in TopBar has no implemented action

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
- Domain: `app.jit-pro.com`
- Vite build pipeline (`tsc -b && vite build`)

**What is partial:**
- Environment variable definitions exist for Resend, Turnstile, service role key — but no consuming code

**What is missing:**
- Supabase Edge Functions (directory doesn't exist)
- CI/CD pipeline (no GitHub Actions)
- Staging/dev environment separation
- Error monitoring / observability
- Automated tests

---

## 11. SOURCE OF TRUTH ANALYSIS

| Domain | Source of Truth | Table/System | Status | Notes |
|--------|----------------|-------------|--------|-------|
| **Authentication** | Supabase Auth | `auth.users` + JWT | PRODUCTION | Working. Super admin flag in `app_metadata`. |
| **User-Company Membership** | Supabase | `public.users` | PRODUCTION | Links auth users to companies with roles. Multi-company supported via composite unique constraint. |
| **Company Data** | Supabase | `companies`, `company_work_weeks`, `company_holidays`, `company_contacts`, `cost_codes`, `pcl_templates`, `pcl_template_tasks` | PRODUCTION | All populated by setup wizard. Read-only views exist. No post-setup editing. |
| **Projects** | Supabase | `projects` | PRODUCTION (schema only) | Table exists and is queried by Projects page. No creation UI. Data must be manually inserted. |
| **Procurement Items** | **SPLIT** | `procurement_items` (DB) vs `sampleData.ts` (UI) | SPLIT — CONFLICT EXISTS | The database has a proper relational schema (`procurement_items`, `procurement_item_locations`, `procurement_item_submittals`). The Scope Builder UI ignores this entirely and uses hardcoded TypeScript arrays. These are not connected. |
| **Procurement Timelines** | Supabase | `procurement_timelines` | SANDBOX | User-scoped (not company-scoped). JSONB `timeline_data` column stores phase arrays. Used only by `/demo/*` routes. No production equivalent exists. |
| **Scheduling Logic** | In-memory (demo) | Workday math in `ProcurementSchedule.tsx` | SANDBOX | Weekend-skip logic, date calculations, and Gantt rendering exist only in the demo Gantt chart component. No shared utility library. Not reusable by production. |
| **Vendors** | Supabase | `vendors` | PRODUCTION (schema only) | Table exists with company scope. No UI reads or writes to it. |
| **Project Locations** | Supabase | `project_locations` | PRODUCTION (schema only) | Table exists with 3-level hierarchy. No UI reads or writes to it. |
| **Submittal Types** | Supabase | `submittal_types` | PRODUCTION | Seeded lookup with 8 types. Used by `sampleData.ts` type definitions but not queried from DB by UI. |
| **Team / Roles** | **SPLIT** | `users` + `project_members` (production) vs `project_team` + `roles` (sandbox) | SPLIT — CONFLICT EXISTS | Production has `users.role` (company-level) and `project_members.project_role` (project-level). Sandbox has its own `project_team` and `roles` tables scoped to `auth.uid()`. Two parallel systems, no overlap. |
| **Baselines / Audit** | Supabase | `timeline_baselines`, `timeline_edit_log` | SANDBOX | Immutable snapshot and edit audit systems exist only for sandbox timelines. No production audit system exists. |

### Key Conflicts

1. **Procurement Items:** The relational schema in the database (`procurement_items` + junction tables) and the TypeScript sample data in the UI (`sampleData.ts`) represent the SAME concept but are completely disconnected. The UI must be rewired to the database.

2. **Procurement Timelines vs Procurement Items:** These are different concepts that share the word "procurement." Items = "what am I procuring?" Timelines = "how long will each phase take?" They will eventually need to be linked (a timeline describes the schedule for an item), but currently they exist in separate worlds (sandbox vs production schema).

3. **Team Membership:** Production uses `users` + `project_members`. Sandbox uses `project_team` + `roles`. These serve similar purposes with incompatible structures.

---

## 12. DATA MODEL STATUS

### Production-Ready (Used in real app, correctly scoped)

| Table | Used By | Scoping | Notes |
|-------|---------|---------|-------|
| `companies` | Dashboard, Setup Wizard, AppShell | company_id PK | Fully functional |
| `users` | Dashboard, Setup Wizard, People page, RLS | company_id FK | Multi-company supported |
| `company_work_weeks` | Setup Wizard, Calendars page | company_id FK (unique) | Functional |
| `company_holidays` | Setup Wizard, Calendars page | company_id FK | Functional |
| `company_contacts` | Setup Wizard, People page, Organizations page | company_id FK | Functional |
| `cost_codes` | Setup Wizard, Cost Codes page | company_id FK | Functional, hierarchical |
| `pcl_templates` | Setup Wizard, Project Templates page | company_id FK | Functional |
| `pcl_template_tasks` | Setup Wizard, Project Templates page | template_id FK | Functional |

### Exists But Not Fully Used (Tables exist, UI/workflows not wired)

| Table | Schema Status | UI Status | What's Missing |
|-------|--------------|-----------|----------------|
| `projects` | Complete, company-scoped | Read-only list view works | No creation UI, no editing, no project detail pages wired |
| `project_locations` | Complete, 3-level hierarchy | Not used by any UI | Scope Builder uses hardcoded locations from `sampleData.ts` |
| `project_members` | Complete, user-project junction | Not used by any UI | No team management page exists |
| `vendors` | Complete, company-scoped | Not used by any UI | Scope Builder uses inline vendor strings from `sampleData.ts` |
| `procurement_items` | Complete with status, CSI, vendor refs | Not used by any UI | Scope Builder uses `sampleData.ts` instead |
| `procurement_item_locations` | Complete, junction table | Not used by any UI | Scope Builder manages locations in-memory |
| `procurement_item_submittals` | Complete, junction table | Not used by any UI | Scope Builder manages submittals in-memory |
| `submittal_types` | Complete, seeded with 8 types | Not queried by any UI | `sampleData.ts` has its own submittal type config |

### Sandbox / Experimental (Used only in `/demo/*`)

| Table | Purpose | Scoping | Production Concern |
|-------|---------|---------|-------------------|
| `procurement_timelines` | Timeline phase management | `auth.uid()` — user-scoped | JSONB `timeline_data` stores phase arrays — flexible but not relational. Not company-scoped. |
| `timeline_baselines` | Immutable snapshots | via `procurement_timelines` | JSONB snapshots — good audit pattern but tied to sandbox schema |
| `timeline_edit_log` | Field-level change audit | via `procurement_timelines` | Good pattern — should be replicated in production |
| `timeline_assignments` | Task-to-team links | via `procurement_timelines` | References `project_team` (sandbox), not `users`/`project_members` (production) |
| `project_team` | Sandbox team members | `auth.uid()` — user-scoped | Parallel to `users` + `project_members`. Not company-scoped. |
| `roles` | Role category lookup | Shared (all authenticated) | Could potentially be reused in production as a lookup table |

### Missing (Required by Product Spec but Do Not Exist)

| Missing Table/Structure | Required For | Notes |
|------------------------|-------------|-------|
| Invitation tracking | User invitation flow | Need to track invite status, token, expiry, acceptance |
| Notification records | In-app + email notifications | No notification model exists |
| Subscription / billing records | Billing page, Control Tower purchases | No Stripe integration, no billing tables |
| Document storage metadata | Document management (Control Tower) | No file/document tracking tables |
| Request / RFI tracking | Requests feature (Control Tower) | No request tables |
| Production timeline/schedule | Control Tower: Schedule | Sandbox has `procurement_timelines` but production needs company-scoped, project-scoped equivalent |
| Audit log (production) | Change tracking on production data | Sandbox has `timeline_edit_log` pattern but nothing for production tables |

---

## 13. BUILD BLOCKERS

These issues **MUST** be resolved before major feature development continues. They are not improvements — they are structural problems that will cause failures or require rework.

### BLOCKER 1: RLS `current_company_id()` Returns LIMIT 1

- **Impact:** ALL project-level and procurement-level RLS policies
- **Tables affected:** `projects`, `project_locations`, `project_members`, `vendors`, `procurement_items`, `procurement_item_locations`, `procurement_item_submittals`
- **Problem:** `current_company_id()` returns `SELECT company_id FROM users WHERE auth_id = auth.uid() LIMIT 1`. For the super admin (Jeff) with multiple companies, this always returns company #1. Accessing company #2's projects will either show company #1's data or show nothing.
- **Fix:** Replace `current_company_id()` usage with `user_belongs_to_company(company_id)` in all remaining RLS policies (same pattern already applied to company settings tables).
- **Severity:** HIGH — silently returns wrong data for multi-company users

### BLOCKER 2: No User Invitation System

- **Impact:** Cannot onboard any user beyond the initial account creator
- **Problem:** Secondary admins created in setup wizard get a `users` row but no `auth.users` entry. There is no mechanism to send invite emails, generate invite tokens, or handle invite acceptance. The `handle_new_user()` trigger is a no-op.
- **Dependency:** Requires Supabase Edge Function + Resend integration (neither exists)
- **Severity:** HIGH — the product is single-user until this is built

### BLOCKER 3: No Project Creation Flow

- **Impact:** Cannot use any project-level features (Scope Builder, Selection Register, Control Tower)
- **Problem:** The "Create New Project" button is disabled. Projects can only exist via direct database insertion. All project-level pages depend on a project existing.
- **Dependency:** Requires at minimum an insert form + RLS policy that allows admin project creation
- **Severity:** HIGH — blocks all project-level feature development and testing

### BLOCKER 4: Scope Builder Not Connected to Database

- **Impact:** Scope Builder and Selection Register are non-functional for real data
- **Problem:** The UI reads from `sampleData.ts` (hardcoded TypeScript arrays) instead of querying `procurement_items`, `project_locations`, `vendors`, and `submittal_types` from Supabase. The database tables exist and are correctly structured — the UI just isn't wired to them.
- **Severity:** MEDIUM — the UI works as a prototype but cannot be used with real data

### BLOCKER 5: Sandbox and Production Share a Database

- **Impact:** Demo/sandbox data pollutes the production database
- **Problem:** Both systems use the same Supabase client pointing to the same project. Sandbox tables (`procurement_timelines`, `project_team`, `roles`, etc.) live alongside production tables. There is no isolation.
- **Planned fix:** Move sandbox to a separate Supabase project with its own credentials
- **Severity:** MEDIUM — not breaking today but prevents clean production data

### BLOCKER 6: No Company Context in App Routes

- **Impact:** Multi-company users cannot select which company's data to view in the app
- **Problem:** When a user clicks a company card on the Dashboard, they navigate to `/app/home` — but the app has no mechanism to track WHICH company was selected. `AppShell` fetches the company name using `.maybeSingle()` which returns the first match. All subsequent pages independently query `users.company_id` with no shared company context.
- **Severity:** HIGH for multi-company users — they will see data from whatever company the query happens to return first

---

## 14. DEPRECATION / CLEANUP CANDIDATES

### Sandbox-Only — Do Not Promote Directly

These exist in the sandbox and must NOT be ported into production. They will be rebuilt from scratch when the production equivalent is needed.

| Item | Reason |
|------|--------|
| `procurement_timelines` table | User-scoped (not company/project-scoped). JSONB `timeline_data` column stores denormalized phase arrays. Production needs relational, company-scoped, project-linked timelines. |
| `project_team` table | User-scoped parallel to `users` + `project_members`. Production already has the correct team model. |
| `timeline_assignments` table | References `project_team` (sandbox). Production equivalent would reference `users` or `project_members`. |
| `roles` lookup table | Potentially reusable but role categories don't align with production `users.role` values. Evaluate during production team feature design. |
| Workday math in `ProcurementSchedule.tsx` | Logic is sound but embedded in a 600-line component. Needs extraction into a shared utility before any production use. |

### Needs Refactor Before Promotion

These items contain valuable patterns or logic that should inform production design, but require structural changes.

| Item | What's Valuable | What Needs Refactoring |
|------|----------------|----------------------|
| `timeline_baselines` pattern | Immutable snapshots with baseline numbering is the correct audit pattern | Must be re-scoped to company/project context. Snapshot format must match production data model, not sandbox JSONB. |
| `timeline_edit_log` pattern | Field-level change tracking with reason capture is the correct audit pattern | Must be generalized beyond timelines. Production audit should cover all editable entities. |
| Gantt chart rendering (`ProcurementSchedule.tsx`) | Zoom levels, workday calculations, interactive tooltips, weekend shading — all production-quality | Must be extracted from the monolithic component into reusable chart components. Must accept production data shapes, not sandbox JSONB. |
| Timeline phase editor (`ProcurementTimeline.tsx`) | Phase-based timeline creation, review round configuration, color coding | 1000+ line component. Must be decomposed. Must integrate with production `pcl_templates` for phase definitions rather than ad-hoc user input. |

### Should Become Production Foundation

These items are already correctly structured and should be used as-is or with minor adaptation.

| Item | Status | Notes |
|------|--------|-------|
| `procurement_items` + junction tables | Schema complete, not wired to UI | Correct relational structure. Wire the Scope Builder UI to these tables. |
| `project_locations` (3-level hierarchy) | Schema complete, not wired to UI | Correct hierarchical model. Wire to Scope Builder location selection. |
| `vendors` table | Schema complete, not wired to UI | Correct company-scoped model. Wire to Scope Builder vendor selection. |
| `submittal_types` lookup | Seeded with 8 types | Correct lookup. Replace hardcoded submittal config in `sampleData.ts`. |
| `project_members` junction | Schema complete, not wired to UI | Correct project-user assignment model. |
| `user_belongs_to_company()` RLS pattern | Working on settings tables | Extend to all remaining tables (projects, procurement, vendors). |

---

## 15. SANDBOX vs PRODUCTION BOUNDARY

### What Belongs ONLY in Sandbox

| Category | Items | Rationale |
|----------|-------|-----------|
| Experimental data structures | JSONB `timeline_data` column storing phase arrays | Production needs relational, normalized data — not flexible JSON blobs |
| User-scoped data | `project_team`, `procurement_timelines` scoped to `auth.uid()` | Production data must be company-scoped and project-scoped |
| Prototype workflows | Ad-hoc phase creation, freeform timeline editing | Production phases must derive from company `pcl_templates` |
| Unaudited mutations | Direct INSERT/UPDATE without audit trail in sandbox | Production requires audit logging for compliance |
| Demo navigation | `/demo/*` routes, `DemoSubNav` component | Internal only — customers never see these |

### What Belongs ONLY in Production

| Category | Items | Rationale |
|----------|-------|-----------|
| Company-scoped data | All tables with `company_id` FK | Multi-tenant isolation is non-negotiable |
| RLS-protected data | All user/project/procurement tables with RLS policies | Data access must be controlled |
| Setup wizard flow | Company creation, admin setup, calendar, contacts, cost codes, templates | Audited onboarding process |
| Role-based access | `users.role`, `project_members.project_role` | Permission model is production-only |
| Subscription/billing | Future billing tables, Stripe integration | Financial data has strict requirements |
| Invitation system | Future invite tokens, email dispatch | Must be production-grade from day one |

### What Exists in BOTH (Separately)

| Concept | Production Implementation | Sandbox Implementation | Reconciliation Path |
|---------|--------------------------|----------------------|-------------------|
| **Procurement item definition** | `procurement_items` table (relational, project-scoped, with vendor/location/submittal junctions) | Not in sandbox — sandbox has timelines, not items | No conflict. Production schema is correct. Wire UI to it. |
| **Procurement timeline/schedule** | NOT YET BUILT | `procurement_timelines` with JSONB phases, baselines, edit log, Gantt chart | Rebuild in production: relational phases linked to `pcl_template_tasks`, company/project-scoped, using production audit pattern |
| **Team membership** | `users` + `project_members` (company and project scoped) | `project_team` + `roles` (user-scoped) | Production model is correct. Do not port `project_team`. |
| **Workday calculations** | Not extracted — no shared utility | Embedded in `ProcurementSchedule.tsx` | Extract into `src/utils/workdays.ts`. Production will use company `company_work_weeks` for workday definitions. |
| **Audit trail** | Does not exist | `timeline_baselines` + `timeline_edit_log` | Replicate the PATTERN (immutable snapshots, field-level logging) in production with proper scoping |
| **CSI cost codes** | `cost_codes` table (company-scoped, 4-level hierarchy) | Referenced in `sampleData.ts` as `csiCode`/`csiDivision` strings | Production is correct. Scope Builder must query `cost_codes` instead of using hardcoded strings. |

### Enforcement Rules

1. **Sandbox code never imports from production paths** and vice versa (currently not enforced — both use `supabase/client.ts`)
2. **Sandbox routes are hidden from customers** — they should not appear in production navigation (currently `/demo` link is in the Navbar for authenticated users)
3. **Sandbox database should be isolated** — a separate Supabase project with its own credentials (currently shares the same database)
4. **No data migration from sandbox to production** — features are rebuilt, not ported

---

## 16. PROMOTION READINESS FRAMEWORK

### Stage Definitions

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  EXPERIMENTAL    │ ──▶ │   INTERNALLY    │ ──▶ │   DATA MODEL    │ ──▶ │  PRE-DEPLOYMENT │ ──▶ │   PRODUCTION    │
│  (Sandbox Only)  │     │    USABLE       │     │    LOCKED       │     │    TESTED       │     │     READY       │
└─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Stage 1: Experimental (Sandbox Only)

**Criteria:**
- Feature exists in sandbox with working UI
- Data structures may be flexible (JSONB, denormalized, user-scoped)
- No RLS enforcement required
- No company/project scoping required
- May use hardcoded data or ad-hoc schemas

**Exit criteria to advance:**
- Core workflow is validated (the feature does what it's supposed to do)
- User feedback confirms the approach is correct
- Edge cases and failure modes are understood

**Current features at this stage:**
- Procurement Timeline editor
- Gantt chart / procurement schedule
- Baseline snapshotting
- Edit audit logging
- Team task assignments

---

### Stage 2: Internally Usable

**Criteria:**
- Feature has been validated in sandbox
- Production data model has been DESIGNED (not necessarily built)
- UI patterns have been proven and can be decomposed into reusable components
- Integration points with production system are identified (e.g., "this needs pcl_templates, cost_codes, project scope")

**Exit criteria to advance:**
- Written data model spec exists (table definitions, relationships, RLS policies)
- Component extraction plan exists (what gets reused, what gets rewritten)
- No unresolved architectural questions

**Current features at this stage:**
- None — no sandbox feature has had its production data model designed yet

---

### Stage 3: Data Model Locked

**Criteria:**
- Production database tables are created (migration written and applied)
- RLS policies are defined and tested
- Table is company-scoped and project-scoped where appropriate
- Foreign key relationships to existing production tables are established
- No JSONB blobs for structured data — everything is relational

**Exit criteria to advance:**
- Tables exist in Supabase
- RLS policies pass manual testing (correct data visible for correct users)
- TypeScript types generated or manually defined to match schema

**Current features at this stage:**
- Procurement Items system (tables exist: `procurement_items`, `procurement_item_locations`, `procurement_item_submittals` — but UI is not wired)

---

### Stage 4: Pre-Deployment Tested

**Criteria:**
- UI is connected to production database tables (no sample data, no JSONB)
- CRUD operations work through the UI
- RLS enforcement verified (users see only their company/project data)
- Error handling exists for failed operations
- Feature works end-to-end in local development

**Exit criteria to advance:**
- Manual QA pass on the full workflow
- No console errors or unhandled promise rejections
- Data persists correctly across page reloads

**Current features at this stage:**
- Company Setup Wizard (all 6 steps)
- Company data views (People, Organizations, Cost Codes, Calendars, Templates)
- Projects list (read-only)

---

### Stage 5: Production Ready

**Criteria:**
- Feature is deployed to `app.jit-pro.com`
- Works for all user roles (not just super admin)
- Company data isolation verified in production
- No sandbox data dependencies
- Feature is accessible through production navigation (AppShell)

**Current features at this stage:**
- Authentication (login, password reset)
- Dashboard (multi-company display)
- Company Setup Wizard
- Company data views (People, Organizations, Cost Codes, Calendars, Templates)

---

### Current Feature Promotion Status

| Feature | Current Stage | Next Step Required |
|---------|-------------|-------------------|
| Auth + Login | **5 — Production Ready** | — |
| Dashboard | **5 — Production Ready** | — |
| Company Setup Wizard | **5 — Production Ready** | — |
| Company Data Views | **5 — Production Ready** | — |
| Projects List | **4 — Pre-Deployment Tested** (read-only) | Build project creation UI |
| Scope Builder UI | **3 — Data Model Locked** (tables exist, UI not wired) | Wire UI to `procurement_items` + related tables |
| Selection Register UI | **3 — Data Model Locked** (tables exist, UI not wired) | Wire UI to `procurement_items` + related tables |
| Procurement Timeline | **1 — Experimental** (sandbox) | Design production data model |
| Gantt Schedule | **1 — Experimental** (sandbox) | Extract workday utilities; design production schedule model |
| Baseline System | **1 — Experimental** (sandbox) | Design production audit/baseline pattern |
| Edit Audit Log | **1 — Experimental** (sandbox) | Design production audit pattern |
| User Invitations | **Does not exist** | Build from scratch |
| Project Creation | **Does not exist** | Build from scratch |
| Control Tower | **Does not exist** | Build from scratch (after procurement timeline promotion) |
| Billing | **Does not exist** | Build from scratch |
| Email Notifications | **Does not exist** | Build from scratch (requires Edge Functions + Resend) |

---

*This document reflects reality as of 2026-04-03 based on the current codebase. Items marked NOT IMPLEMENTED have no code — they may be planned but do not exist. Sections 10–16 added 2026-04-03 to establish system boundaries, source of truth analysis, and promotion framework.*
