-- Migration: Fix created_by on companies table
-- Problem: setup_company() never set created_by, so it's NULL for all companies.
-- The DELETE RLS policy requires created_by = auth.uid(), which always fails.
-- Fix: (1) backfill created_by from people table, (2) update setup_company() to set it.

-- 1. Backfill created_by for existing companies using the primary admin record
update public.companies c
set created_by = p.auth_id
from public.people p
where p.company_id = c.id
  and p.person_type = 'user'
  and p.role = 'primary_admin'
  and p.auth_id is not null
  and c.created_by is null;

-- 2. Update setup_company() to include created_by in the insert
create or replace function public.setup_company(
  p_legal_name text,
  p_display_name text default null,
  p_address text default null,
  p_city text default null,
  p_state text default null,
  p_zip text default null,
  p_license_number text default null,
  p_states_licensed_in text[] default '{}',
  p_company_phone text default null,
  p_company_email text default null,
  p_website text default null,
  p_timezone text default 'America/Los_Angeles',
  p_company_id uuid default null
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_company_id uuid;
  v_auth_id uuid;
  v_email text;
begin
  v_auth_id := auth.uid();
  if v_auth_id is null then
    raise exception 'Not authenticated';
  end if;

  select email into v_email from auth.users where id = v_auth_id;

  -- If a company_id was provided, update that specific company (resume setup)
  if p_company_id is not null then
    -- Verify the user owns this company
    if not exists (
      select 1 from public.people
      where auth_id = v_auth_id
        and company_id = p_company_id
        and person_type = 'user'
    ) then
      raise exception 'Not authorized for this company';
    end if;

    update public.companies set
      legal_name = p_legal_name,
      display_name = p_display_name,
      address = p_address,
      city = p_city,
      state = p_state,
      zip = p_zip,
      license_number = p_license_number,
      states_licensed_in = p_states_licensed_in,
      company_phone = p_company_phone,
      company_email = p_company_email,
      website = p_website,
      timezone = p_timezone
    where id = p_company_id;

    return p_company_id;
  end if;

  -- Create a new company (multi-company allowed for all users)
  insert into public.companies (
    legal_name, display_name, address, city, state, zip,
    license_number, states_licensed_in, company_phone,
    company_email, website, timezone, created_by
  ) values (
    p_legal_name, p_display_name, p_address, p_city, p_state, p_zip,
    p_license_number, p_states_licensed_in, p_company_phone,
    p_company_email, p_website, p_timezone, v_auth_id
  )
  returning id into v_company_id;

  -- Create primary admin record in people table
  insert into public.people (
    auth_id, company_id, first_name, last_name, email,
    person_type, contact_type, role, is_active
  ) values (
    v_auth_id, v_company_id, 'Admin', '(Setup)', v_email,
    'user', 'internal', 'primary_admin', true
  );

  return v_company_id;
end;
$$;
