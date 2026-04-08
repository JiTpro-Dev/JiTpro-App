-- Migration: Add organization_id to users table
-- Allows internal users to belong to an organization,
-- aligning with the company directory model where all
-- people (users and contacts) can be grouped by organization.

-- 1. Add organization_id FK (nullable)
alter table public.users
  add column if not exists organization_id uuid
  references public.organizations(id) on delete set null;

-- 2. Index for performance
create index if not exists idx_users_organization_id
  on public.users (organization_id);
