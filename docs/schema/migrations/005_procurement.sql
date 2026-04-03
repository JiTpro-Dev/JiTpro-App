-- ============================================
-- 005: Procurement (Scope Builder + Spec Register)
-- ============================================
-- Core procurement data: vendors, procurement items, and
-- the submittal types junction table.

-- ============================================
-- 5a. Vendors
-- ============================================
-- Company-level vendor directory. Referenced by procurement items.

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

-- ============================================
-- 5b. Submittal Types (lookup)
-- ============================================
-- Static lookup table for the 8 submittal types.

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

-- ============================================
-- 5c. Procurement Items
-- ============================================
-- The atomic unit created in the Scope Builder.
-- Displayed in both Scope Builder and Spec/Selection Register.

create table public.procurement_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade not null,

  -- Identity
  name text not null,
  description text,

  -- CSI code reference (from company's cost codes)
  cost_code_id uuid references public.cost_codes(id),
  csi_code text,
  csi_division text,
  csi_label text,

  -- Vendor
  vendor_id uuid references public.vendors(id) on delete set null,

  -- Submittal
  requires_submittal boolean default true,

  -- Status (Core: simple 3-state)
  status text not null check (status in ('ready', 'pending_selection', 'missing_design')) default 'missing_design',

  -- Notes
  notes text,

  -- Ordering
  sort_order int default 0,

  -- Timestamps
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

-- ============================================
-- 5d. Procurement Item Locations (junction)
-- ============================================
-- An item can be in multiple locations. Same CSI item in
-- different locations may have different specs.

create table public.procurement_item_locations (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references public.procurement_items(id) on delete cascade not null,
  location_id uuid references public.project_locations(id) on delete cascade not null,
  unique(item_id, location_id)
);

create index idx_procurement_item_locations_item on public.procurement_item_locations(item_id);
create index idx_procurement_item_locations_location on public.procurement_item_locations(location_id);

-- ============================================
-- 5e. Procurement Item Submittal Types (junction)
-- ============================================
-- Which submittal types are required for each item.

create table public.procurement_item_submittals (
  id uuid primary key default gen_random_uuid(),
  item_id uuid references public.procurement_items(id) on delete cascade not null,
  submittal_type_id text references public.submittal_types(id) not null,
  unique(item_id, submittal_type_id)
);

create index idx_procurement_item_submittals_item on public.procurement_item_submittals(item_id);

-- ============================================
-- RLS
-- ============================================

alter table public.vendors enable row level security;
alter table public.procurement_items enable row level security;
alter table public.procurement_item_locations enable row level security;
alter table public.procurement_item_submittals enable row level security;
-- submittal_types is a public lookup table, no RLS needed

-- Vendors scoped to company
create policy "Read own company vendors" on public.vendors
  for select using (public.user_belongs_to_company(company_id));

create policy "Manage own company vendors" on public.vendors
  for all
  using (public.user_belongs_to_company(company_id))
  with check (public.user_belongs_to_company(company_id));

-- Procurement items scoped to company's projects
create policy "Read own procurement items" on public.procurement_items
  for select using (
    project_id in (
      select id from public.projects
      where public.user_belongs_to_company(company_id)
    )
  );

create policy "Manage own procurement items" on public.procurement_items
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

-- Item locations
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

-- Item submittals
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
