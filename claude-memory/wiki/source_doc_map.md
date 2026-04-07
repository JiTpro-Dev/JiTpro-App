# Source Document Map

Index of important documentation in the repository and what each file covers.

## Active Documentation

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Repo-level rules for AI coding sessions (change discipline, secrets, restricted areas) |
| `docs/README.md` | Documentation index and navigation guide |
| `docs/BUILD_ROADMAP.md` | Phased development plan (6 phases, 17+ tasks) with status tracking |
| `docs/CURRENT_STATE_UPDATED.md` | Detailed implementation status as of 2026-04-06 |
| `docs/SESSION_HANDOFF.md` | Session continuity notes (last session context, next steps) |
| `docs/glossary.md` | Locked system terminology (v3) — canonical names, disallowed terms, phase definitions |
| `docs/schema/migrations/README.md` | Migration file index with descriptions |
| `docs/schema/migrations/000_full_migration.sql` | Combined production schema (all tables, RLS, functions) |
| `docs/schema/sandbox_bootstrap.sql` | Sandbox database setup script |
| `docs/specs/product-spec.md` | Product specification (JiTpro Core + Control Tower vision) |
| `docs/specs/technical-architecture-spec.md` | Target technical architecture |
| `docs/specs/company-app-pages-spec.md` | Company-level page specifications |
| `docs/specs/ui_ux_spec_outline.md` | UI/UX design specification outline |

## Archived Documentation

| File | Purpose |
|------|---------|
| `docs/archive/JITPRO_CURRENT_STATE.md` | Earlier state snapshot (superseded by CURRENT_STATE_UPDATED.md) |
| `docs/archive/build-summary.md` | Earlier build summary |
| `docs/archive/claude-instructions.md` | Earlier AI session instructions (superseded by root CLAUDE.md) |
| `docs/archive/consistency-guide.md` | UI consistency guidelines |
| `docs/archive/implementation.md` | Earlier implementation notes |
| `docs/archive/system-overview.md` | Earlier system architecture overview |
| `docs/archive/2026-03-28-app-shell-implementation.md` | App shell build session notes |
| `docs/archive/2026-03-28-company-setup-steps-3-6.md` | Setup wizard build session notes |
| `docs/archive/2026-04-01-jitpro-core-mockup.md` | Core mockup session notes |

## Database Migrations

| File | Description |
|------|-------------|
| `supabase/migrations/*_001_companies.sql` | Company profile table |
| `supabase/migrations/*_002_users.sql` | Users table (replaces old profiles) |
| `supabase/migrations/*_003_company_settings.sql` | Settings tables + RLS helpers |
| `supabase/migrations/*_004_projects.sql` | Projects, locations, members |
| `supabase/migrations/*_005_procurement.sql` | Vendors, items, submittal types, junctions |
| `supabase/migrations/*_006_setup_rls_fix.sql` | RLS bypass for setup wizard |
| `supabase/migrations/*_007_setup_company_function.sql` | `setup_company()` RPC |
| `supabase/migrations/*_008_rls_multi_company_fix.sql` | Multi-company RLS fix |
| `supabase/migrations/*_009_cost_codes_add_columns.sql` | Cost code metadata columns |
| `supabase/migrations/*_010_cost_codes_hierarchy_check.sql` | Hierarchy validation trigger |
| `supabase/migrations/20260406000000_rls_multi_company_fix.sql` | Additional RLS fix |

## Configuration Files

| File | Purpose |
|------|---------|
| `package.json` | Dependencies and scripts |
| `vite.config.ts` | Vite build configuration |
| `tsconfig.json` | TypeScript project config |
| `tailwind.config.js` | Tailwind CSS configuration |
| `eslint.config.js` | ESLint rules |
| `.env.example` | Required environment variables |
| `public/_redirects` | Cloudflare Pages SPA fallback |
