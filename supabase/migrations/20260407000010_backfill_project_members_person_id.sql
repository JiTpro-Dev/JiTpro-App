-- Migration: Backfill project_members.person_id from user_id and contact_id
-- Data copy only. Does not modify or drop any existing columns.

-- 1. Set person_id from user_id (users → people with preserved UUIDs)
update public.project_members
  set person_id = user_id
  where user_id is not null
    and person_id is null;

-- 2. Set person_id from contact_id (contacts → people with preserved UUIDs)
update public.project_members
  set person_id = contact_id
  where contact_id is not null
    and person_id is null;

-- 3. Verification (run manually after migration to confirm):
-- SELECT count(*) FROM public.project_members WHERE person_id IS NULL;
-- Expected result: 0
