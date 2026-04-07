# Architecture Overview

> Items marked [TARGET] are planned but not yet implemented.
> Items marked [BUILT] are confirmed in code.

## Stack

| Layer | Technology | Status |
|-------|-----------|--------|
| Frontend | React 19 + TypeScript 5.9 | [BUILT] |
| Build | Vite 8 | [BUILT] |
| Styling | Tailwind CSS 3.4 | [BUILT] |
| Routing | React Router v7 | [BUILT] |
| Icons | lucide-react | [BUILT] |
| Auth | Supabase Auth (email/password) | [BUILT] |
| Database | Supabase PostgreSQL with RLS | [BUILT] |
| Hosting | Cloudflare Pages (auto-deploy from main) | [BUILT] |
| Email | Resend API | [TARGET] — env var exists, no sending code |
| Captcha | Cloudflare Turnstile | [TARGET] — env var exists, not integrated |
| Payments | Stripe | [TARGET] — no code exists |
| CI/CD | None | [TARGET] |
| Testing | None | [TARGET] |

## System Architecture

```
Browser (SPA)
  └── React App (Vite)
        ├── Supabase Client (production)
        │     ├── Auth (login, session, password reset)
        │     └── Database (companies, projects, items, settings)
        └── Supabase Client (sandbox)
              └── Database (timelines, baselines, edit logs — demo only)

Cloudflare Pages
  └── Static hosting with SPA fallback (_redirects)
```

## Data Flow Patterns

### Authentication [BUILT]
1. User submits email/password → Supabase Auth
2. Session stored in browser → AuthContext provides session/user
3. RequireAuth guard redirects unauthenticated users to /login

### Company Context [BUILT]
1. Dashboard lists companies from `companies` table
2. User selects company → CompanyContext validates membership
3. Active company persisted to localStorage
4. AppShell checks for active company; redirects to Dashboard if none

### Data Fetching [BUILT]
- Components call Supabase directly (no centralized API layer)
- Standard pattern: `supabase.from('table').select().eq().order()`
- Loading/error states managed locally in useState
- No caching layer, no optimistic updates

### RLS Security Model [BUILT]
- All data tables have RLS enabled
- Helper function: `user_belongs_to_company(company_id)` → boolean
- Company settings tables: direct company_id check
- Project/procurement tables: join through project → company
- Sandbox tables: `auth.uid()` check (user-scoped, not company-scoped)

## Layout Architecture [BUILT]

```
App.tsx (Router)
  ├── AuthLayout → Login, ResetPassword
  ├── AppLayout → Demo pages (legacy layout)
  └── AppShell → All /app/* routes
        ├── LeftNav (collapsible, context-aware)
        │     ├── Company nav mode (workspace, directories, standards)
        │     └── Project nav mode (work, control tower, admin)
        ├── TopBar (breadcrumbs, dashboard link, notifications, profile)
        └── <Outlet /> (page content)
```

## Database Schema (Production)

### Active Tables (used by UI)
- `companies` — Multi-tenant root entity
- `users` — Company-scoped user accounts (unique: auth_id + company_id)
- `projects` — Company-scoped projects
- `project_members` — Project team (auto-adds creator)
- `procurement_items` — Atomic procurement units
- `cost_codes` — 4-level CSI hierarchy (company-scoped)
- `company_work_weeks` — Working days configuration
- `company_holidays` — Holiday calendar
- `company_contacts` — External contacts directory
- `pcl_templates` — Procurement checklist templates
- `pcl_template_tasks` — Template task definitions

### Schema-Only Tables (no UI)
- `vendors` — Company vendor directory
- `project_locations` — 3-level location hierarchy
- `procurement_item_locations` — Item-location junction
- `procurement_item_submittals` — Item-submittal junction
- `submittal_types` — Lookup table (8 types seeded)

### Sandbox-Only Tables (separate Supabase project)
- `procurement_timelines` — Timeline JSONB documents
- `timeline_baselines` — Immutable snapshots
- `timeline_edit_log` — Audit trail
- `timeline_assignments` — Task-to-team links
- `project_team` — Sandbox team members
- `roles` — Role lookup

## Environment Variables

### Frontend (VITE_ prefix, browser-exposed)
- `VITE_SUPABASE_URL` — Production Supabase URL
- `VITE_SUPABASE_ANON_KEY` — Production anon key
- `VITE_SANDBOX_SUPABASE_URL` — Sandbox Supabase URL
- `VITE_SANDBOX_SUPABASE_ANON_KEY` — Sandbox anon key
- `VITE_TURNSTILE_SITE_KEY` — Cloudflare captcha [not integrated]

### Server-Only (must never be in VITE_ vars)
- `RESEND_API_KEY` — Email service
- `SUPABASE_SERVICE_ROLE_KEY` — Admin DB access
- `APP_ENV` — Environment flag
- `APP_URL` — Base URL
