-- Migration 012: Expand project_members to support both users and contacts
-- Enables project team assignment from the full company directory
-- (internal users + external contacts).

-- 1. Add contact_id FK (nullable — populated for external contacts)
alter table public.project_members
  add column if not exists contact_id uuid references public.company_contacts(id) on delete cascade;

-- 2. Make user_id nullable (was NOT NULL — now one of user_id/contact_id must be set)
alter table public.project_members
  alter column user_id drop not null;

-- 3. Add is_active for project-level deactivation (not deletion)
alter table public.project_members
  add column if not exists is_active boolean not null default true;

-- 4. Enforce exactly one of user_id or contact_id (safe on rerun)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'project_members_one_person_check'
      and conrelid = 'public.project_members'::regclass
  ) then
    alter table public.project_members
      add constraint project_members_one_person_check
      check (
        (user_id is not null and contact_id is null)
        or (user_id is null and contact_id is not null)
      );
  end if;
end
$$;

-- 5. Drop any existing unique constraint on (project_id, user_id)
--    regardless of auto-generated name
do $$
declare
  _constraint_name text;
begin
  select con.conname into _constraint_name
  from pg_constraint con
  join pg_class rel on rel.oid = con.conrelid
  join pg_namespace nsp on nsp.oid = rel.relnamespace
  where rel.relname = 'project_members'
    and nsp.nspname = 'public'
    and con.contype = 'u'
    and array_length(con.conkey, 1) = 2
    and exists (
      select 1 from pg_attribute a
      where a.attrelid = con.conrelid
        and a.attnum = any(con.conkey)
        and a.attname = 'user_id'
    )
    and exists (
      select 1 from pg_attribute a
      where a.attrelid = con.conrelid
        and a.attnum = any(con.conkey)
        and a.attname = 'project_id'
    );

  if _constraint_name is not null then
    execute format('alter table public.project_members drop constraint %I', _constraint_name);
  end if;
end
$$;

-- 6. Partial unique indexes (safe on rerun via IF NOT EXISTS)
create unique index if not exists idx_project_members_project_user
  on public.project_members (project_id, user_id)
  where user_id is not null;

create unique index if not exists idx_project_members_project_contact
  on public.project_members (project_id, contact_id)
  where contact_id is not null;

-- 7. Index for contact lookups
create index if not exists idx_project_members_contact
  on public.project_members (contact_id)
  where contact_id is not null;
