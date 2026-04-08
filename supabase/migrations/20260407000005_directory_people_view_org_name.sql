-- Migration: Add organization_name to directory_people view
-- DROP + CREATE because CREATE OR REPLACE cannot add columns
-- to the middle of an existing view's column order.
-- No table changes.

drop view if exists public.directory_people;

create view public.directory_people as

select
  u.id as person_id,
  'user' as person_type,
  u.company_id,
  u.organization_id,
  o.name as organization_name,
  u.first_name,
  u.last_name,
  u.email,
  u.phone,
  u.title,
  u.role as role_label,
  'internal' as contact_type,
  u.is_active,
  u.created_at
from public.users u
left join public.organizations o on u.organization_id = o.id

union all

select
  c.id as person_id,
  'contact' as person_type,
  c.company_id,
  c.organization_id,
  o.name as organization_name,
  c.first_name,
  c.last_name,
  c.email,
  c.phone,
  c.title,
  c.role_category as role_label,
  c.contact_type,
  c.is_active,
  c.created_at
from public.company_contacts c
left join public.organizations o on c.organization_id = o.id;
