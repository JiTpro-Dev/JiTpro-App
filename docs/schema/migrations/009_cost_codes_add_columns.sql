-- ============================================
-- 009: Add columns to cost_codes table
-- ============================================
-- Adds is_custom, source_type, active, and updated_at
-- to match the schema defined in cost_codes_schema_decision.md.
--
-- Safe to run on existing data — all new columns have defaults
-- that apply to existing rows automatically.

alter table public.cost_codes
  add column if not exists is_custom boolean not null default false;

alter table public.cost_codes
  add column if not exists source_type text not null default 'imported'
  check (source_type in ('imported', 'custom', 'system'));

alter table public.cost_codes
  add column if not exists active boolean not null default true;

alter table public.cost_codes
  add column if not exists updated_at timestamptz default now();

-- Auto-update updated_at on row modification (same pattern as other tables)
drop trigger if exists cost_codes_updated_at on public.cost_codes;

create trigger cost_codes_updated_at
  before update on public.cost_codes
  for each row execute function public.update_updated_at();
