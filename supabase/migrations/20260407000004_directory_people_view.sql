-- Migration: Create unified directory_people view
-- Read-only view combining users and company_contacts
-- into a single queryable directory. Does not modify
-- any underlying tables.

create or replace view public.directory_people as

select
  u.id as person_id,
  'user' as person_type,
  u.company_id,
  u.organization_id,
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

union all

select
  c.id as person_id,
  'contact' as person_type,
  c.company_id,
  c.organization_id,
  c.first_name,
  c.last_name,
  c.email,
  c.phone,
  c.title,
  c.role_category as role_label,
  c.contact_type,
  c.is_active,
  c.created_at
from public.company_contacts c;
