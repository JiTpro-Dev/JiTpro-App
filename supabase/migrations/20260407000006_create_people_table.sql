-- Migration: Create unified people table
-- Single canonical table for all directory people (users + contacts).
-- Does not modify, migrate, or drop any existing tables.

-- 1. Create table
create table if not exists public.people (
  id uuid primary key default gen_random_uuid(),

  auth_id uuid references auth.users(id) on delete cascade,

  company_id uuid not null references public.companies(id) on delete cascade,

  organization_id uuid references public.organizations(id) on delete set null,

  first_name text not null,
  last_name text not null,

  email text,
  phone text,
  title text,

  person_type text not null check (person_type in ('user', 'contact')),

  contact_type text check (contact_type in ('internal', 'external')),

  role text,
  role_category text,

  company_organization text,
  address text,
  notes text,

  is_active boolean not null default true,

  invited_at timestamptz,
  accepted_at timestamptz,

  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Indexes
create index if not exists idx_people_company
  on public.people (company_id);

create index if not exists idx_people_auth_id
  on public.people (auth_id)
  where auth_id is not null;

create index if not exists idx_people_organization
  on public.people (organization_id)
  where organization_id is not null;

create index if not exists idx_people_email
  on public.people (email);

create index if not exists idx_people_person_type
  on public.people (company_id, person_type);

-- 3. Unique constraint (safe on rerun)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'people_auth_id_company_id_key'
      and conrelid = 'public.people'::regclass
  ) then
    alter table public.people
      add constraint people_auth_id_company_id_key
      unique (auth_id, company_id);
  end if;
end
$$;

-- 4. Updated_at trigger (safe on rerun)
do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'people_updated_at'
      and tgrelid = 'public.people'::regclass
  ) then
    create trigger people_updated_at
      before update on public.people
      for each row execute function public.update_updated_at();
  end if;
end
$$;

-- 5. RLS (safe on rerun)
alter table public.people enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where policyname = 'Read own company people'
      and tablename = 'people'
  ) then
    create policy "Read own company people" on public.people
      for select using (public.user_belongs_to_company(company_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where policyname = 'Manage own company people'
      and tablename = 'people'
  ) then
    create policy "Manage own company people" on public.people
      for all
      using (public.user_belongs_to_company(company_id))
      with check (public.user_belongs_to_company(company_id));
  end if;
end
$$;
