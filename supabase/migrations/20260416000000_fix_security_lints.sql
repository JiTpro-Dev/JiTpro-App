-- Migration: Fix Supabase security linter findings
--
-- Addresses two ERROR-level lints reported on the prod project
-- (dgvtipyjsiyvokbcubea, "JiTpro-webapp"):
--
--   1. rls_disabled_in_public  — public.submittal_types
--   2. security_definer_view   — public.directory_people
--
-- No application code changes required. Column list of directory_people
-- is preserved so existing queries in the UI continue to work.


-- ============================================
-- Part 1: submittal_types — enable RLS, read-only
-- ============================================
-- Static seeded lookup (8 rows: shop_drawings, product_data, samples,
-- mockups, certificates, design_mix, manufacturer_instructions, warranties).
-- No application code currently reads or writes this table; enabling RLS
-- with a read-only SELECT policy preserves future read access for
-- authenticated users while blocking anon access via PostgREST and
-- preventing all writes.

alter table public.submittal_types enable row level security;

drop policy if exists "submittal_types are readable by authenticated users"
  on public.submittal_types;

create policy "submittal_types are readable by authenticated users"
  on public.submittal_types
  for select
  to authenticated
  using (true);

-- Intentionally no insert/update/delete policies — table is a static
-- seeded lookup and must not be mutated through the public API.


-- ============================================
-- Part 2: directory_people — recreate with security_invoker = true
-- ============================================
-- Live state verified on prod (2026-04-16):
--   owner        = postgres
--   view_options = NULL
--
-- A view owned by postgres with no security_invoker option evaluates
-- in the owner's context, which bypasses the RLS policies on the
-- underlying tables (public.people and public.organizations). This is
-- what triggers the security_definer_view lint. Recreating the view
-- with security_invoker = true makes Postgres evaluate the underlying
-- table access using the caller's role, so the existing RLS on
-- public.people (company-scoped via user_belongs_to_company) is
-- enforced for every read of directory_people.
--
-- The SELECT body is identical to the most recent prior definition in
-- 20260407000008_directory_people_from_people.sql — column list,
-- aliases, and join unchanged so application queries do not need
-- to be modified.

drop view if exists public.directory_people;

create view public.directory_people
with (security_invoker = true) as
select
  p.id as person_id,
  p.person_type,
  p.company_id,
  p.organization_id,
  o.name as organization_name,
  p.first_name,
  p.last_name,
  p.email,
  p.phone,
  p.title,
  coalesce(p.role, p.role_category) as role_label,
  p.contact_type,
  p.is_active,
  p.created_at
from public.people p
left join public.organizations o on p.organization_id = o.id;
