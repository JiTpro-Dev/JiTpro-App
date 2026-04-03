-- ============================================
-- 002: Users
-- ============================================
-- Replaces the old profiles table.
-- Links Supabase auth users to a company with a role.
-- Primary and secondary admins are created during Setup Step 2.

-- Drop old placeholder if it exists
drop table if exists public.profiles cascade;

create table public.users (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid references auth.users(id) on delete cascade,
  company_id uuid references public.companies(id) on delete cascade not null,

  -- Identity
  first_name text not null,
  last_name text not null,
  title text,
  email text not null,
  phone text,

  -- Role within the company
  role text not null check (role in (
    'primary_admin',
    'admin',
    'project_manager',
    'project_engineer',
    'superintendent',
    'foreman',
    'read_only'
  )),

  -- Status
  is_active boolean default true,
  invited_at timestamptz,
  accepted_at timestamptz,

  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger users_updated_at
  before update on public.users
  for each row execute function public.update_updated_at();

-- One user record per auth account per company
alter table public.users add constraint users_auth_id_company_id_key unique (auth_id, company_id);

-- Indexes
create index idx_users_company_id on public.users(company_id);
create index idx_users_auth_id on public.users(auth_id);
create index idx_users_email on public.users(email);

-- RLS
alter table public.users enable row level security;

-- Users can read other users in their company
create policy "Users can read own company users"
  on public.users for select
  using (
    company_id in (
      select company_id from public.users
      where auth_id = auth.uid()
    )
  );

-- Users can update their own record
create policy "Users can update own record"
  on public.users for update
  using (auth_id = auth.uid());

-- Admins can insert users (invitations)
create policy "Admins can insert users"
  on public.users for insert
  with check (
    company_id in (
      select company_id from public.users
      where auth_id = auth.uid() and role in ('admin', 'primary_admin')
    )
  );

-- Auto-create user record when auth user signs up via invite
-- (This will be customized based on the invite flow)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Placeholder: invite flow will populate company_id and role
  -- For now, do nothing — user record is created during setup wizard
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
