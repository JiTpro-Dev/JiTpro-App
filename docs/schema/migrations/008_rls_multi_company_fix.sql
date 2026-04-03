-- ============================================
-- 008: Fix RLS policies for multi-company support
-- ============================================
-- Replaces all usage of current_company_id() (LIMIT 1)
-- with user_belongs_to_company(company_id) across
-- project and procurement tables.
--
-- All FOR ALL policies include both USING and WITH CHECK
-- to secure INSERT operations.
--
-- Company settings tables (003) were already fixed.
-- This migration fixes: projects, project_locations,
-- project_members, vendors, procurement_items,
-- procurement_item_locations, procurement_item_submittals.
--
-- Safe to run multiple times (uses DROP IF EXISTS).

-- ============================================
-- STEP 1: Nuke all affected policies
-- ============================================

-- projects
drop policy if exists "Read own company projects" on public.projects;
drop policy if exists "Admins manage projects" on public.projects;

-- project_locations
drop policy if exists "Read own project locations" on public.project_locations;
drop policy if exists "Manage own project locations" on public.project_locations;

-- project_members
drop policy if exists "Read own project members" on public.project_members;
drop policy if exists "Manage own project members" on public.project_members;

-- vendors
drop policy if exists "Read own company vendors" on public.vendors;
drop policy if exists "Manage own company vendors" on public.vendors;

-- procurement_items
drop policy if exists "Read own procurement items" on public.procurement_items;
drop policy if exists "Manage own procurement items" on public.procurement_items;

-- procurement_item_locations
drop policy if exists "Read own item locations" on public.procurement_item_locations;
drop policy if exists "Manage own item locations" on public.procurement_item_locations;

-- procurement_item_submittals
drop policy if exists "Read own item submittals" on public.procurement_item_submittals;
drop policy if exists "Manage own item submittals" on public.procurement_item_submittals;

-- ============================================
-- STEP 2: Recreate policies using user_belongs_to_company()
-- ============================================

-- ---- projects ----

create policy "Read own company projects" on public.projects
  for select
  using (public.user_belongs_to_company(company_id));

create policy "Admins manage projects" on public.projects
  for all
  using (public.user_belongs_to_company(company_id))
  with check (public.user_belongs_to_company(company_id));

-- ---- project_locations ----

create policy "Read own project locations" on public.project_locations
  for select
  using (
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

-- ---- project_members ----

create policy "Read own project members" on public.project_members
  for select
  using (
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

-- ---- vendors ----

create policy "Read own company vendors" on public.vendors
  for select
  using (public.user_belongs_to_company(company_id));

create policy "Manage own company vendors" on public.vendors
  for all
  using (public.user_belongs_to_company(company_id))
  with check (public.user_belongs_to_company(company_id));

-- ---- procurement_items ----

create policy "Read own procurement items" on public.procurement_items
  for select
  using (
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

-- ---- procurement_item_locations ----

create policy "Read own item locations" on public.procurement_item_locations
  for select
  using (
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

-- ---- procurement_item_submittals ----

create policy "Read own item submittals" on public.procurement_item_submittals
  for select
  using (
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
