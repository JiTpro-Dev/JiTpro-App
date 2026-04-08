-- Migration 019: Update directory_people view to use unified people table
-- Removes UNION of users + company_contacts.
-- Single source: public.people.
-- Column names unchanged — backward compatible with existing UI queries.

drop view if exists public.directory_people;

create view public.directory_people as

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
