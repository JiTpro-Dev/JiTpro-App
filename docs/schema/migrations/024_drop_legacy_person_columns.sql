-- Migration 024: Remove legacy dual-person model from project_members
-- project_members now uses person_id exclusively.
-- Drops user_id, contact_id, and their associated constraints/indexes.

-- 1. Drop CHECK constraint
alter table public.project_members
  drop constraint if exists project_members_one_person_check;

-- 2. Drop partial unique indexes
drop index if exists idx_project_members_project_user;
drop index if exists idx_project_members_project_contact;
drop index if exists idx_project_members_contact;

-- 3. Drop legacy columns
alter table public.project_members
  drop column if exists user_id;

alter table public.project_members
  drop column if exists contact_id;
