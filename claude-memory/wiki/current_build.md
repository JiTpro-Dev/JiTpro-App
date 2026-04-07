# Current Build — Implementation Inventory

> Last updated: 2026-04-07
> Source of truth: actual code inspection, not documentation

## Routes (from src/App.tsx)

| Route | Component | Status |
|-------|-----------|--------|
| `/login` | Login.tsx | Functional |
| `/reset-password` | ResetPassword.tsx | Functional |
| `/dashboard` | Dashboard.tsx | Functional |
| `/demo` | Demo.tsx | Functional |
| `/demo/procurement-timeline` | ProcurementTimeline.tsx | Functional (sandbox) |
| `/demo/procurement-schedule` | ProcurementSchedule.tsx | Functional (sandbox) |
| `/demo/view-procurement-timeline` | ViewProcurementTimeline.tsx | Functional (sandbox) |
| `/app/home` | CompanyHome.tsx | Functional |
| `/app/projects` | Projects.tsx | Functional |
| `/app/projects/new` | CreateProject.tsx | Functional |
| `/app/people` | People.tsx | Functional |
| `/app/organizations` | Organizations.tsx | Functional |
| `/app/cost-codes` | CostCodes.tsx | Functional |
| `/app/calendars` | Calendars.tsx | Functional |
| `/app/project-templates` | ProjectTemplates.tsx | Functional |
| `/app/billing` | Billing.tsx | Placeholder ("Coming soon") |
| `/app/settings` | Settings.tsx | Placeholder (5 cards) |
| `/app/project/:id/home` | ProjectHome.tsx | Functional |
| `/app/project/:id/scope-builder` | ScopeBuilder.tsx | Functional |
| `/app/project/:id/selection-register` | SelectionRegister.tsx | Functional |
| `/setup` | SetupWizard.tsx | Functional (6 steps) |
| `/project/new` | (legacy) | Legacy route — may be orphaned |
| `/project/:id` | ProjectDashboard.tsx | Legacy route — may be orphaned |

**Archived files (not routed):**
- `src/pages/CompanySetup.tsx` — Old wizard, superseded by SetupWizard
- `src/pages/app/pre-bid/sampleData.ts` — Dead code, no imports (safe to delete)

## Auth State

- **Provider:** Supabase Auth (email/password only)
- **Guard:** RequireAuth wraps all `/app/*` and `/dashboard` routes
- **Session:** Managed by AuthContext, subscribed to Supabase auth changes
- **Dual auth:** AuthContext syncs login/logout across production and sandbox Supabase instances
- **Super admin:** Flag in `app_metadata.is_super_admin` (no UI enforcement yet)
- **No signup:** No public registration form; users must be created via Supabase or setup wizard

## Database State

### Tables With Active UI Queries
| Table | Operations | Called From |
|-------|-----------|------------|
| `companies` | SELECT, INSERT, UPDATE, DELETE | Dashboard, SetupWizard, CompanyContext |
| `users` | SELECT, INSERT, UPDATE | Dashboard, People, SetupWizard |
| `projects` | SELECT, INSERT | Projects, CreateProject, CompanyHome, ProjectContext |
| `project_members` | INSERT | CreateProject (auto-add creator) |
| `procurement_items` | SELECT, INSERT, UPDATE, DELETE | ScopeBuilder, SelectionRegister, ProjectHome |
| `cost_codes` | SELECT, DELETE, INSERT | CostCodes, ScopeBuilder, SetupWizard |
| `company_work_weeks` | SELECT, UPSERT | Calendars, SetupWizard |
| `company_holidays` | SELECT, DELETE, INSERT | Calendars, SetupWizard |
| `company_contacts` | SELECT, INSERT | People, Organizations, SetupWizard |
| `pcl_templates` | SELECT, DELETE, INSERT | ProjectTemplates, SetupWizard |
| `pcl_template_tasks` | SELECT, DELETE, INSERT | ProjectTemplates, SetupWizard |

### Tables With Schema But No UI
| Table | Notes |
|-------|-------|
| `vendors` | RLS policies exist. No CRUD UI. vendor_id always null. |
| `project_locations` | 3-level hierarchy schema. No management UI. |
| `procurement_item_locations` | Junction table. No assignment UI. |
| `procurement_item_submittals` | Junction table. requires_submittal always false. |
| `submittal_types` | 8 types seeded. Not queried by any UI. |

## Key Components

### Layout
- **AppShell** — Main layout: LeftNav + TopBar + Outlet
- **LeftNav** — Collapsible sidebar (200px/52px), company vs project nav modes
- **TopBar** — Breadcrumbs, dashboard link, NotificationBell, ProfileMenu
- **CompanySwitcher** — Bottom of LeftNav
- **ProjectSwitcher** — Top of LeftNav when in project context

### Shared
- **PageHeader** — Title + stats + filters + actions (used across pages)
- **Navbar** — Legacy top nav (demo/auth pages only)
- **ProfileMenu** — Avatar dropdown with logout (initials hardcoded "JK")
- **NotificationBell** — Bell icon, count hardcoded 0, empty dropdown

### Navigation Config
- `navConfig.ts` defines company and project nav groups
- **Explicitly disabled** (`disabled: true`): Procurement, Schedule, Requests, Documents (Control Tower group)
- **Enabled but no routes**: Team, Baselines, Reports, Settings (Project Admin group) — these appear clickable but have nowhere to go

## Environment / Config

- **Vite 8** with `@vitejs/plugin-react`
- **TypeScript** strict mode, target ES2023
- **Tailwind** scanning `./src/**/*.{js,ts,jsx,tsx}`
- **ESLint** with react-hooks and react-refresh plugins
- **Cloudflare Pages** with `public/_redirects` SPA fallback
- **No CI/CD pipeline**
- **No staging environment**
- **No automated tests**

## Confirmed Gaps

1. No post-setup company editing UI
2. No project editing or deletion
3. No vendor management
4. No location management
5. No submittal type assignment
6. No team management beyond auto-add on project creation
7. No user invitation flow
8. No role-based UI restrictions
9. No file/document upload
10. No email sending (Resend key exists, no code)
11. No billing/payments
12. No centralized error handling
13. No loading skeleton states (uses basic spinners)
14. Profile menu initials hardcoded to "JK"
15. Procurement timeline only in sandbox — not connected to production items
