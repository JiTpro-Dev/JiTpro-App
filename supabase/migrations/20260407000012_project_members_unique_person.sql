-- Migration: Add unique constraint on (project_id, person_id)
-- Prevents the same person from being assigned to a project twice.

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'project_members_unique_person'
      and conrelid = 'public.project_members'::regclass
  ) then
    alter table public.project_members
      add constraint project_members_unique_person
      unique (project_id, person_id);
  end if;
end
$$;
