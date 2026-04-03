-- ============================================
-- 004: Projects
-- ============================================
-- Each project belongs to a company. Projects have their own
-- settings that can override company defaults.

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id) on delete cascade not null,

  -- Basic info
  name text not null,
  description text,
  project_number text,
  address text,
  city text,
  state text,
  zip text,

  -- Status
  status text not null check (status in ('active', 'completed', 'on_hold', 'archived')) default 'active',
  is_completed boolean default false,

  -- Project-level overrides (null = use company default)
  show_cost_code_numbers boolean,

  -- Control Tower
  has_control_tower boolean default false,
  control_tower_purchased_at timestamptz,

  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_projects_company on public.projects(company_id);
create index idx_projects_status on public.projects(company_id, status);

create trigger projects_updated_at
  before update on public.projects
  for each row execute function public.update_updated_at();

-- ============================================
-- Project Locations (hierarchical)
-- ============================================
-- Building > Floor/Level > Area/Room
-- parent_id creates the tree.

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

-- ============================================
-- Project Team (users assigned to a project)
-- ============================================

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

-- ============================================
-- RLS
-- ============================================

alter table public.projects enable row level security;
alter table public.project_locations enable row level security;
alter table public.project_members enable row level security;

-- Company members can see their company's projects
create policy "Read own company projects" on public.projects
  for select using (public.user_belongs_to_company(company_id));

-- Admins can manage projects
create policy "Admins manage projects" on public.projects
  for all
  using (public.user_belongs_to_company(company_id))
  with check (public.user_belongs_to_company(company_id));

-- Project locations visible to company members
create policy "Read own project locations" on public.project_locations
  for select using (
    project_id in (
      select id from public.projects
      where public.user_belongs_to_company(company_id)
    )
  );

create policy "Manage own project locations" on public.project_locations
  for all
  using (
    project_id in (
      select id from public.projects
      where public.user_belongs_to_company(company_id)
    )
  )
  with check (
    project_id in (
      select id from public.projects
      where public.user_belongs_to_company(company_id)
    )
  );

-- Project members visible to company
create policy "Read own project members" on public.project_members
  for select using (
    project_id in (
      select id from public.projects
      where public.user_belongs_to_company(company_id)
    )
  );

create policy "Manage own project members" on public.project_members
  for all
  using (
    project_id in (
      select id from public.projects
      where public.user_belongs_to_company(company_id)
    )
  )
  with check (
    project_id in (
      select id from public.projects
      where public.user_belongs_to_company(company_id)
    )
  );
