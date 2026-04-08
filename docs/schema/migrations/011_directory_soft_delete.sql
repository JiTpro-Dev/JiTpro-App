-- Migration 011: Add is_active to company directory tables
-- Enables soft-delete (deactivation) for vendors and contacts
-- instead of hard deletion. Preserves referential integrity
-- and historical context across all projects.

-- 1. Add is_active to vendors
alter table public.vendors
  add column if not exists is_active boolean not null default true;

-- 2. Add is_active to company_contacts
alter table public.company_contacts
  add column if not exists is_active boolean not null default true;
