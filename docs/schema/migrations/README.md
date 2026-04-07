# Database Migrations

Run these in order against your Supabase project SQL Editor.

| File | Tables / Purpose | Source |
|------|------------------|--------|
| `001_companies.sql` | `companies` | Company Profile setup |
| `002_users.sql` | `users` (replaces `profiles`) | Company Admin setup |
| `003_company_settings.sql` | `company_work_weeks`, `company_holidays`, `company_contacts`, `cost_codes`, `pcl_templates`, `pcl_template_tasks` + `user_belongs_to_company()` function | Setup Steps 3-6 |
| `004_projects.sql` | `projects`, `project_locations`, `project_members` | Project creation |
| `005_procurement.sql` | `vendors`, `submittal_types`, `procurement_items`, `procurement_item_locations`, `procurement_item_submittals` | Scope Builder + Spec Register |
| `006_setup_rls_fix.sql` | RLS bypass for setup wizard | Setup wizard chicken-and-egg fix |
| `007_setup_company_function.sql` | `setup_company()` security definer function | Company creation RPC |
| `008_rls_multi_company_fix.sql` | Replaces all `current_company_id()` RLS policies with `user_belongs_to_company()` on project/procurement tables | Multi-company bug fix |
| `009_cost_codes_add_columns.sql` | Adds `is_custom`, `source_type`, `active` to `cost_codes` | Cost code metadata |
| `010_cost_codes_hierarchy_check.sql` | Hierarchy validation trigger on `cost_codes` | Enforce parent-child level rules |

## Notes

- All tables use UUID primary keys
- All tables have RLS enabled with company-scoped policies
- `public.user_belongs_to_company(company_id)` is the standard RLS helper — returns true if the current auth user belongs to the given company
- `public.current_company_id()` exists but is deprecated — migration 008 replaces all usage with `user_belongs_to_company()`
- `public.update_updated_at()` trigger function handles `updated_at` timestamps
- The old `profiles` table is dropped in migration 002
- `submittal_types` is a static lookup table (no RLS, publicly readable)
- `projects.show_cost_code_numbers` overrides company default when not null
