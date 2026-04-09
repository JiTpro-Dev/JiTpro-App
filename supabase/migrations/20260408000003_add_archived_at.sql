-- Migration: Add archived_at to companies table
-- Allows companies to be archived (hidden from dashboard) without deleting data.
-- NULL = active, non-NULL = archived at that timestamp.

alter table public.companies
  add column if not exists archived_at timestamptz default null;

create index if not exists idx_companies_archived_at
  on public.companies (archived_at);
