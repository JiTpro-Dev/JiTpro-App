-- ============================================
-- 003: Company Settings
-- ============================================
-- Work week, holidays, contacts, cost codes, PCL templates.
-- All scoped to a company via company_id.

-- ============================================
-- 3a. Work Week (Setup Step 3)
-- ============================================
-- One row per company. Stored as individual day booleans
-- for easy querying in workday calculations.

create table public.company_work_weeks (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade not null unique,
  monday boolean default true,
  tuesday boolean default true,
  wednesday boolean default true,
  thursday boolean default true,
  friday boolean default true,
  saturday boolean default false,
  sunday boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger company_work_weeks_updated_at
  before update on public.company_work_weeks
  for each row execute function public.update_updated_at();

-- ============================================
-- 3b. Holidays (Setup Step 3)
-- ============================================

create table public.company_holidays (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade not null,
  name text not null,
  date_description text not null,
  is_recurring boolean default true,
  is_active boolean default true,
  is_default boolean default false,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_company_holidays_company on public.company_holidays(company_id);

create trigger company_holidays_updated_at
  before update on public.company_holidays
  for each row execute function public.update_updated_at();

-- ============================================
-- 3c. Company Contacts (Setup Step 4)
-- ============================================

create table public.company_contacts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade not null,
  first_name text not null,
  last_name text not null,
  title text,
  company_organization text,
  email text,
  phone text,
  address text,
  contact_type text check (contact_type in ('internal', 'external')),
  role_category text check (role_category in (
    'principal', 'senior_project_manager', 'project_manager', 'project_engineer',
    'project_administrator', 'superintendent', 'foreman',
    'owner', 'architect', 'engineer', 'designer', 'consultant',
    'subcontractor', 'supplier', 'other'
  )),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_company_contacts_company on public.company_contacts(company_id);

create trigger company_contacts_updated_at
  before update on public.company_contacts
  for each row execute function public.update_updated_at();

-- ============================================
-- 3d. Cost Codes (Setup Step 5)
-- ============================================
-- Hierarchical tree. level 1 = division, 2 = section, 3 = subsection, 4 = paragraph.
-- parent_id creates the tree structure.

create table public.cost_codes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade not null,
  code text not null,
  title text not null,
  level int not null check (level between 1 and 4),
  parent_id uuid references public.cost_codes(id) on delete cascade,
  sort_order int default 0,
  created_at timestamptz default now()
);

create index idx_cost_codes_company on public.cost_codes(company_id);
create index idx_cost_codes_parent on public.cost_codes(parent_id);
create unique index idx_cost_codes_company_code on public.cost_codes(company_id, code);

-- ============================================
-- 3e. PCL Templates (Setup Step 6)
-- ============================================

create table public.pcl_templates (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade not null,
  name text not null,
  description text,
  examples text,
  review_rounds int default 1,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_pcl_templates_company on public.pcl_templates(company_id);

create trigger pcl_templates_updated_at
  before update on public.pcl_templates
  for each row execute function public.update_updated_at();

-- PCL template tasks (ordered steps within a template)
create table public.pcl_template_tasks (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references public.pcl_templates(id) on delete cascade not null,
  name text not null,
  default_days int not null,
  sort_order int default 0
);

create index idx_pcl_template_tasks_template on public.pcl_template_tasks(template_id);

-- ============================================
-- RLS for all company settings tables
-- ============================================

alter table public.company_work_weeks enable row level security;
alter table public.company_holidays enable row level security;
alter table public.company_contacts enable row level security;
alter table public.cost_codes enable row level security;
alter table public.pcl_templates enable row level security;
alter table public.pcl_template_tasks enable row level security;

-- Helper: check if the current user belongs to a given company
create or replace function public.user_belongs_to_company(p_company_id uuid)
returns boolean as $$
  select exists (
    select 1 from public.users
    where auth_id = auth.uid() and company_id = p_company_id
  );
$$ language sql stable security definer;

-- Company members can read their company's settings
create policy "Read own company work week" on public.company_work_weeks
  for select using (public.user_belongs_to_company(company_id));

create policy "Read own company holidays" on public.company_holidays
  for select using (public.user_belongs_to_company(company_id));

create policy "Read own company contacts" on public.company_contacts
  for select using (public.user_belongs_to_company(company_id));

create policy "Read own company cost codes" on public.cost_codes
  for select using (public.user_belongs_to_company(company_id));

create policy "Read own company PCL templates" on public.pcl_templates
  for select using (public.user_belongs_to_company(company_id));

create policy "Read own company PCL tasks" on public.pcl_template_tasks
  for select using (
    template_id in (
      select id from public.pcl_templates
      where public.user_belongs_to_company(company_id)
    )
  );

-- Admins can insert/update/delete company settings
create policy "Admins manage work week" on public.company_work_weeks
  for all
  using (public.user_belongs_to_company(company_id))
  with check (public.user_belongs_to_company(company_id));

create policy "Admins manage holidays" on public.company_holidays
  for all
  using (public.user_belongs_to_company(company_id))
  with check (public.user_belongs_to_company(company_id));

create policy "Admins manage contacts" on public.company_contacts
  for all
  using (public.user_belongs_to_company(company_id))
  with check (public.user_belongs_to_company(company_id));

create policy "Admins manage cost codes" on public.cost_codes
  for all
  using (public.user_belongs_to_company(company_id))
  with check (public.user_belongs_to_company(company_id));

create policy "Admins manage PCL templates" on public.pcl_templates
  for all
  using (public.user_belongs_to_company(company_id))
  with check (public.user_belongs_to_company(company_id));

create policy "Admins manage PCL tasks" on public.pcl_template_tasks
  for all
  using (
    template_id in (
      select id from public.pcl_templates
      where public.user_belongs_to_company(company_id)
    )
  )
  with check (
    template_id in (
      select id from public.pcl_templates
      where public.user_belongs_to_company(company_id)
    )
  );
