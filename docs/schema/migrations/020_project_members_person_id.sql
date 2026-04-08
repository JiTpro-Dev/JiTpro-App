-- Migration 020: Add person_id to project_members
-- Additive only. Does not modify or remove existing columns.

-- 1. Add person_id FK (nullable — will be backfilled then made NOT NULL later)
alter table public.project_members
  add column if not exists person_id uuid
  references public.people(id) on delete cascade;

-- 2. Index for lookups
create index if not exists idx_project_members_person
  on public.project_members (person_id);
