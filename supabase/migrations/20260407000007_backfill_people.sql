-- Migration: Backfill people table from users and company_contacts
-- Copy only. Does not modify or delete any existing data.

-- 1. Insert all users into people
insert into public.people (
  id,
  auth_id,
  company_id,
  organization_id,
  first_name,
  last_name,
  email,
  phone,
  title,
  person_type,
  contact_type,
  role,
  is_active,
  invited_at,
  accepted_at,
  created_at,
  updated_at
)
select
  id,
  auth_id,
  company_id,
  organization_id,
  first_name,
  last_name,
  email,
  phone,
  title,
  'user',
  'internal',
  role,
  is_active,
  invited_at,
  accepted_at,
  created_at,
  updated_at
from public.users
on conflict (id) do nothing;

-- 2. Insert all company_contacts into people
insert into public.people (
  id,
  auth_id,
  company_id,
  organization_id,
  first_name,
  last_name,
  email,
  phone,
  title,
  person_type,
  contact_type,
  role_category,
  company_organization,
  address,
  notes,
  is_active,
  created_at,
  updated_at
)
select
  id,
  null,
  company_id,
  organization_id,
  first_name,
  last_name,
  email,
  phone,
  title,
  'contact',
  contact_type,
  role_category,
  company_organization,
  address,
  notes,
  is_active,
  created_at,
  updated_at
from public.company_contacts
on conflict (id) do nothing;
