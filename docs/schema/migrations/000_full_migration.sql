-- ============================================
-- JiTpro Full Schema Migration
-- ============================================
-- Paste this entire file into the Supabase SQL Editor and click Run.
-- Creates all tables, indexes, triggers, functions, and RLS policies.
-- ============================================


-- ============================================
-- PART 1: HELPER FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;


-- ============================================
-- PART 2: CREATE ALL TABLES
-- ============================================

-- ---------- Companies ----------

create table public.companies (
  id uuid primary key default gen_random_uuid(),
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
  cost_code_format text check (cost_code_format in ('upload', 'csi50', 'csi16', 'skip')) default 'skip',
  show_cost_code_numbers boolean default true,
  setup_completed boolean default false,
  setup_completed_at timestamptz,
  subscription_tier text check (subscription_tier in ('core', 'core_trial')) default 'core_trial',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger companies_updated_at
  before update on public.companies
  for each row execute function public.update_updated_at();


-- ---------- Users (replaces old profiles table) ----------

drop table if exists public.profiles cascade;

create table public.users (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid references auth.users(id) on delete cascade unique,
  company_id uuid references public.companies(id) on delete cascade not null,
  first_name text not null,
  last_name text not null,
  title text,
  email text not null,
  phone text,
  role text not null check (role in (
    'primary_admin', 'admin', 'project_manager', 'project_engineer',
    'superintendent', 'foreman', 'read_only'
  )),
  is_active boolean default true,
  invited_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger users_updated_at
  before update on public.users
  for each row execute function public.update_updated_at();

create index idx_users_company_id on public.users(company_id);
create index idx_users_auth_id on public.users(auth_id);
create index idx_users_email on public.users(email);


-- ---------- Company Work Weeks ----------

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


-- ---------- Company Holidays ----------

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


-- ---------- Company Contacts ----------

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


-- ---------- Cost Codes ----------

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


-- ---------- PCL Templates ----------

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

create table public.pcl_template_tasks (
  id uuid primary key default gen_random_uuid(),
  template_id uuid references public.pcl_templates(id) on delete cascade not null,
  name text not null,
  default_days int not null,
  sort_order int default 0
);

create index idx_pcl_template_tasks_template on public.pcl_template_tasks(template_id);


-- ---------- Projects ----------

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade not null,
  name text not null,
  description text,
  project_number text,
  address text,
  city text,
  state text,
  zip text,
  status text not null check (status in ('active', 'completed', 'on_hold', 'archived')) default 'active',
  is_completed boolean default false,
  show_cost_code_numbers boolean,
  has_control_tower boolean default false,
  control_tower_purchased_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_projects_company on public.projects(company_id);
create index idx_projects_status on public.projects(company_id, status);

create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.update_updated_at();


-- ---------- Project Locations ----------

create table public.project_locations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  name text not null,
  level int not null check (level between 1 and 3),
  parent_id uuid references public.project_locations(id) on delete cascade,
  sort_order int default 0,
  created_at timestamptz default now()
);

create index idx_project_locations_project on public.project_locations(project_id);
create index idx_project_locations_parent on public.project_locations(parent_id);


-- ---------- Project Members ----------

create table public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null,
  project_role text check (project_role in (
    'project_manager', 'project_engineer', 'superintendent',
    'foreman', 'read_only'
  )),
  created_at timestamptz default now(),
  unique(project_id, user_id)
);

create index idx_project_members_project on public.project_members(project_id);
create index idx_project_members_user on public.project_members(user_id);


-- ---------- Vendors ----------

create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade not null,
  name text not null,
  contact_name text,
  contact_email text,
  contact_phone text,
  address text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_vendors_company on public.vendors(company_id);
create unique index idx_vendors_company_name on public.vendors(company_id, name);

create trigger vendors_updated_at
  before update on public.vendors
  for each row execute function public.update_updated_at();


-- ---------- Submittal Types (static lookup) ----------

create table public.submittal_types (
  id text primary key,
  label text not null,
  sort_order int default 0
);

insert into public.submittal_types (id, label, sort_order) values
  ('shop_drawings', 'Shop Drawings', 1),
  ('product_data', 'Product Data', 2),
  ('samples', 'Samples', 3),
  ('mockups', 'Mockups', 4),
  ('certificates', 'Certificates', 5),
  ('design_mix', 'Design Mix', 6),
  ('manufacturer_instructions', 'Mfr Instructions', 7),
  ('warranties', 'Warranties', 8);


-- ---------- Procurement Items ----------

create table public.procurement_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,
  name text not null,
  description text,
  cost_code_id uuid references public.cost_codes(id),
  csi_code text,
  csi_division text,
  csi_label text,
  vendor_id uuid references public.vendors(id) on delete set null,
  requires_submittal boolean default true,
  status text not null check (status in ('ready', 'pending_selection', 'missing_design')) default 'missing_design',
  notes text,
  sort_order int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_procurement_items_project on public.procurement_items(project_id);
create index idx_procurement_items_cost_code on public.procurement_items(cost_code_id);
create index idx_procurement_items_vendor on public.procurement_items(vendor_id);
create index idx_procurement_items_status on public.procurement_items(project_id, status);

create trigger procurement_items_updated_at
  before update on public.procurement_items
  for each row execute function public.update_updated_at();


-- ---------- Procurement Item Locations (junction) ----------

create table public.procurement_item_locations (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references public.procurement_items(id) on delete cascade not null,
  location_id uuid references public.project_locations(id) on delete cascade not null,
  unique(item_id, location_id)
);

create index idx_procurement_item_locations_item on public.procurement_item_locations(item_id);
create index idx_procurement_item_locations_location on public.procurement_item_locations(location_id);


-- ---------- Procurement Item Submittal Types (junction) ----------

create table public.procurement_item_submittals (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references public.procurement_items(id) on delete cascade not null,
  submittal_type_id text references public.submittal_types(id) not null,
  unique(item_id, submittal_type_id)
);

create index idx_procurement_item_submittals_item on public.procurement_item_submittals(item_id);


-- ============================================
-- PART 3: HELPER FUNCTION FOR RLS
-- ============================================

create or replace function public.current_company_id()
returns uuid as $$
  select company_id from public.users where auth_id = auth.uid() limit 1;
$$ language sql stable security definer;


-- ============================================
-- PART 4: ENABLE RLS ON ALL TABLES
-- ============================================

alter table public.companies enable row level security;
alter table public.users enable row level security;
alter table public.company_work_weeks enable row level security;
alter table public.company_holidays enable row level security;
alter table public.company_contacts enable row level security;
alter table public.cost_codes enable row level security;
alter table public.pcl_templates enable row level security;
alter table public.pcl_template_tasks enable row level security;
alter table public.projects enable row level security;
alter table public.project_locations enable row level security;
alter table public.project_members enable row level security;
alter table public.vendors enable row level security;
alter table public.procurement_items enable row level security;
alter table public.procurement_item_locations enable row level security;
alter table public.procurement_item_submittals enable row level security;


-- ============================================
-- PART 5: RLS POLICIES
-- ============================================

-- Companies
create policy "Company members can read own company" on public.companies
  for select using (id in (select company_id from public.users where auth_id = auth.uid()));

create policy "Company admins can update own company" on public.companies
  for update using (id in (select company_id from public.users where auth_id = auth.uid() and role in ('admin', 'primary_admin')));

-- Users
create policy "Users can read own company users" on public.users
  for select using (company_id in (select company_id from public.users where auth_id = auth.uid()));

create policy "Users can update own record" on public.users
  for update using (auth_id = auth.uid());

create policy "Admins can insert users" on public.users
  for insert with check (company_id in (select company_id from public.users where auth_id = auth.uid() and role in ('admin', 'primary_admin')));

-- Company Settings (work week, holidays, contacts, cost codes, templates)
-- All use user_belongs_to_company() for multi-company support.
create policy "Read own company work week" on public.company_work_weeks
  for select using (public.user_belongs_to_company(company_id));
create policy "Admins manage work week" on public.company_work_weeks
  for all
  using (public.user_belongs_to_company(company_id))
  with check (public.user_belongs_to_company(company_id));

create policy "Read own company holidays" on public.company_holidays
  for select using (public.user_belongs_to_company(company_id));
create policy "Admins manage holidays" on public.company_holidays
  for all
  using (public.user_belongs_to_company(company_id))
  with check (public.user_belongs_to_company(company_id));

create policy "Read own company contacts" on public.company_contacts
  for select using (public.user_belongs_to_company(company_id));
create policy "Admins manage contacts" on public.company_contacts
  for all
  using (public.user_belongs_to_company(company_id))
  with check (public.user_belongs_to_company(company_id));

create policy "Read own company cost codes" on public.cost_codes
  for select using (public.user_belongs_to_company(company_id));
create policy "Admins manage cost codes" on public.cost_codes
  for all
  using (public.user_belongs_to_company(company_id))
  with check (public.user_belongs_to_company(company_id));

create policy "Read own company PCL templates" on public.pcl_templates
  for select using (public.user_belongs_to_company(company_id));
create policy "Admins manage PCL templates" on public.pcl_templates
  for all
  using (public.user_belongs_to_company(company_id))
  with check (public.user_belongs_to_company(company_id));

create policy "Read own company PCL tasks" on public.pcl_template_tasks
  for select using (
    template_id in (select id from public.pcl_templates where public.user_belongs_to_company(company_id))
  );
create policy "Admins manage PCL tasks" on public.pcl_template_tasks
  for all
  using (
    template_id in (select id from public.pcl_templates where public.user_belongs_to_company(company_id))
  )
  with check (
    template_id in (select id from public.pcl_templates where public.user_belongs_to_company(company_id))
  );

-- Projects
create policy "Read own company projects" on public.projects
  for select using (public.user_belongs_to_company(company_id));
create policy "Admins manage projects" on public.projects
  for all
  using (public.user_belongs_to_company(company_id))
  with check (public.user_belongs_to_company(company_id));

-- Project Locations
create policy "Read own project locations" on public.project_locations
  for select using (
    project_id in (select id from public.projects where public.user_belongs_to_company(company_id))
  );
create policy "Manage own project locations" on public.project_locations
  for all
  using (
    project_id in (select id from public.projects where public.user_belongs_to_company(company_id))
  )
  with check (
    project_id in (select id from public.projects where public.user_belongs_to_company(company_id))
  );

-- Project Members
create policy "Read own project members" on public.project_members
  for select using (
    project_id in (select id from public.projects where public.user_belongs_to_company(company_id))
  );
create policy "Manage own project members" on public.project_members
  for all
  using (
    project_id in (select id from public.projects where public.user_belongs_to_company(company_id))
  )
  with check (
    project_id in (select id from public.projects where public.user_belongs_to_company(company_id))
  );

-- Vendors
create policy "Read own company vendors" on public.vendors
  for select using (public.user_belongs_to_company(company_id));
create policy "Manage own company vendors" on public.vendors
  for all
  using (public.user_belongs_to_company(company_id))
  with check (public.user_belongs_to_company(company_id));

-- Procurement Items
create policy "Read own procurement items" on public.procurement_items
  for select using (
    project_id in (select id from public.projects where public.user_belongs_to_company(company_id))
  );
create policy "Manage own procurement items" on public.procurement_items
  for all
  using (
    project_id in (select id from public.projects where public.user_belongs_to_company(company_id))
  )
  with check (
    project_id in (select id from public.projects where public.user_belongs_to_company(company_id))
  );

-- Procurement Item Locations
create policy "Read own item locations" on public.procurement_item_locations
  for select using (
    item_id in (
      select pi.id from public.procurement_items pi
      join public.projects p on pi.project_id = p.id
      where public.user_belongs_to_company(p.company_id)
    )
  );
create policy "Manage own item locations" on public.procurement_item_locations
  for all
  using (
    item_id in (
      select pi.id from public.procurement_items pi
      join public.projects p on pi.project_id = p.id
      where public.user_belongs_to_company(p.company_id)
    )
  )
  with check (
    item_id in (
      select pi.id from public.procurement_items pi
      join public.projects p on pi.project_id = p.id
      where public.user_belongs_to_company(p.company_id)
    )
  );

-- Procurement Item Submittals
create policy "Read own item submittals" on public.procurement_item_submittals
  for select using (
    item_id in (
      select pi.id from public.procurement_items pi
      join public.projects p on pi.project_id = p.id
      where public.user_belongs_to_company(p.company_id)
    )
  );
create policy "Manage own item submittals" on public.procurement_item_submittals
  for all
  using (
    item_id in (
      select pi.id from public.procurement_items pi
      join public.projects p on pi.project_id = p.id
      where public.user_belongs_to_company(p.company_id)
    )
  )
  with check (
    item_id in (
      select pi.id from public.procurement_items pi
      join public.projects p on pi.project_id = p.id
      where public.user_belongs_to_company(p.company_id)
    )
  );


-- ============================================
-- PART 6: AUTH TRIGGER
-- ============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  -- Placeholder: invite flow will populate company_id and role
  -- For now, user record is created during setup wizard
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
