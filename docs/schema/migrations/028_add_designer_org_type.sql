-- Migration: Add 'designer' to organizations.org_type constraint
-- Required by cd_mapping_v06: designer maps to Design Team group.
-- Non-destructive: widens the existing check constraint.

-- 1. Drop old constraint and recreate with designer included
alter table public.organizations
  drop constraint if exists organizations_org_type_check;

alter table public.organizations
  add constraint organizations_org_type_check
  check (org_type in (
    'subcontractor', 'architect', 'engineer', 'designer',
    'owner', 'consultant', 'supplier', 'other'
  ));
