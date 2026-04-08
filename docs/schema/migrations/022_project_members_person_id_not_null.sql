-- Migration 022: Enforce person_id NOT NULL on project_members
-- Safe because migration 021 backfilled all existing rows.

-- Verify before running:
-- SELECT count(*) FROM public.project_members WHERE person_id IS NULL;
-- Expected: 0

alter table public.project_members
  alter column person_id set not null;
