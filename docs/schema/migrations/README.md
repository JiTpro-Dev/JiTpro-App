# Database Migrations

Run these in order against your Supabase project SQL Editor.

| File | Tables | Source |
|------|--------|--------|
| `001_companies.sql` | `companies` | Company Profile setup |
| `002_users.sql` | `users` (replaces `profiles`) | Company Admin setup |
| `003_company_settings.sql` | `company_work_weeks`, `company_holidays`, `company_contacts`, `cost_codes`, `pcl_templates`, `pcl_template_tasks` | Setup Steps 3-6 |
| `004_projects.sql` | `projects`, `project_locations`, `project_members` | Project creation |
| `005_procurement.sql` | `vendors`, `submittal_types`, `procurement_items`, `procurement_item_locations`, `procurement_item_submittals` | Scope Builder + Spec Register |

## Notes

- All tables use UUID primary keys
- All tables have RLS enabled with company-scoped policies
- `public.current_company_id()` helper function is used across all RLS policies
- `public.update_updated_at()` trigger function handles `updated_at` timestamps
- The old `profiles` table is dropped in migration 002
- `submittal_types` is a static lookup table (no RLS, publicly readable)
- `projects.show_cost_code_numbers` overrides company default when not null
