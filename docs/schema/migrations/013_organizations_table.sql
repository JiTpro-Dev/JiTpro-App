-- Migration 013: Create organizations table and link to company_contacts
-- Organizations are company-level directory records.
-- Contacts can optionally belong to an organization via FK.

-- 1. Create organizations table
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade not null,
  name text not null,
  org_type text check (org_type in (
    'subcontractor', 'architect', 'engineer', 'owner',
    'consultant', 'supplier', 'other'
  )),
  contact_email text,
  contact_phone text,
  address text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Indexes
create index if not exists idx_organizations_company
  on public.organizations (company_id);

create unique index if not exists idx_organizations_company_name
  on public.organizations (company_id, name);

-- 3. Updated_at trigger (safe on rerun)
do $$
begin
  if not exists (
    select 1 from pg_trigger
    where tgname = 'organizations_updated_at'
      and tgrelid = 'public.organizations'::regclass
  ) then
    create trigger organizations_updated_at
      before update on public.organizations
      for each row execute function public.update_updated_at();
  end if;
end
$$;

-- 4. Add organization_id FK to company_contacts
alter table public.company_contacts
  add column if not exists organization_id uuid references public.organizations(id) on delete set null;

create index if not exists idx_company_contacts_organization
  on public.company_contacts (organization_id)
  where organization_id is not null;

-- 5. RLS for organizations (safe on rerun)
alter table public.organizations enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where policyname = 'Read own company organizations'
      and tablename = 'organizations'
  ) then
    create policy "Read own company organizations" on public.organizations
      for select using (public.user_belongs_to_company(company_id));
  end if;

  if not exists (
    select 1 from pg_policies
    where policyname = 'Manage own company organizations'
      and tablename = 'organizations'
  ) then
    create policy "Manage own company organizations" on public.organizations
      for all
      using (public.user_belongs_to_company(company_id))
      with check (public.user_belongs_to_company(company_id));
  end if;
end
$$;
