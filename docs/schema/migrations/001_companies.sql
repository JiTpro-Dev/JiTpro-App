-- ============================================
-- 001: Companies
-- ============================================
-- Core company table. One row per JiTpro customer.
-- Created during the Company Setup wizard (Step 1: Company Profile).

create table public.companies (
  id uuid primary key default gen_random_uuid(),

  -- Company Profile (Setup Step 1)
  legal_name text not null,
  display_name text,
  address text,
  city text,
  state text,
  zip text,
  license_number text,
  states_licensed_in text[] default '{}',
  company_phone text,
  company_email text,
  website text,
  timezone text default 'America/Los_Angeles',
  logo_url text,

  -- Cost code preferences (Setup Step 5)
  cost_code_format text check (cost_code_format in ('upload', 'csi50', 'csi16', 'skip')) default 'skip',
  show_cost_code_numbers boolean default true,

  -- Setup tracking
  setup_completed boolean default false,
  setup_completed_at timestamptz,

  -- Subscription tier
  subscription_tier text check (subscription_tier in ('core', 'core_trial')) default 'core_trial',

  -- Ownership
  created_by uuid references auth.users(id),

  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-update updated_at
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger companies_updated_at
  before update on public.companies
  for each row execute function public.update_updated_at();

-- RLS
alter table public.companies enable row level security;

-- Company members can read their own company
-- Uses security definer function to avoid circular RLS dependency
-- (companies policy reading users table, which has its own RLS)
create policy "Company members can read own company"
  on public.companies for select
  using (public.user_belongs_to_company(id));

-- Company admins can update their own company
create policy "Company admins can update own company"
  on public.companies for update
  using (public.user_belongs_to_company(id));

-- Only the creator can delete a company
create policy "Creator can delete own company"
  on public.companies for delete
  using (created_by = auth.uid());
