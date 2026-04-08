-- Migration: Migrate vendors into organizations table
-- Vendors become organizations with org_type = 'supplier'.
-- Preserves UUIDs so any future FK references can be repointed.
-- Does not drop the vendors table yet (backward compatibility).

-- 1. Copy vendors into organizations (preserving UUIDs)
insert into public.organizations (
  id,
  company_id,
  name,
  org_type,
  contact_email,
  contact_phone,
  address,
  notes,
  is_active,
  created_at,
  updated_at
)
select
  id,
  company_id,
  name,
  'supplier',
  contact_email,
  contact_phone,
  address,
  notes,
  is_active,
  created_at,
  updated_at
from public.vendors
on conflict (id) do nothing;
