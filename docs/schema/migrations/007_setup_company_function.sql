-- ============================================
-- 007: setup_company function (security definer)
-- ============================================
-- Called from the setup wizard Step 1 via supabase.rpc('setup_company', {...}).
-- Bypasses RLS to handle the chicken-and-egg problem:
-- user can't insert into companies because RLS checks users table,
-- but user record doesn't exist yet.

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
  p_timezone text default 'America/Los_Angeles'
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

  -- If user already has a company, update it
  if exists (select 1 from public.users where auth_id = v_auth_id) then
    select company_id into v_company_id from public.users where auth_id = v_auth_id;

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
    where id = v_company_id;

    return v_company_id;
  end if;

  -- Create new company
  insert into public.companies (
    legal_name, display_name, address, city, state, zip,
    license_number, states_licensed_in, company_phone,
    company_email, website, timezone
  ) values (
    p_legal_name, p_display_name, p_address, p_city, p_state, p_zip,
    p_license_number, p_states_licensed_in, p_company_phone,
    p_company_email, p_website, p_timezone
  )
  returning id into v_company_id;

  -- Create primary admin user record
  insert into public.users (
    auth_id, company_id, first_name, last_name, email, role
  ) values (
    v_auth_id, v_company_id, 'Admin', '(Setup)', v_email, 'primary_admin'
  );

  return v_company_id;
end;
$$;
