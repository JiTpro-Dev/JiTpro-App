-- Migration: Fix contact_type data integrity
-- Rule (cd_mapping_v07 LOCKED):
--   organization_id IS NOT NULL → contact_type = 'external'
--   organization_id IS NULL     → contact_type = 'internal'
-- This fixes records created before this rule was enforced in the UI.

-- 1. Contacts under external orgs incorrectly marked as internal
UPDATE public.people
SET contact_type = 'external', updated_at = now()
WHERE organization_id IS NOT NULL
  AND contact_type = 'internal';

-- 2. Contacts with no org incorrectly marked as external
UPDATE public.people
SET contact_type = 'internal', updated_at = now()
WHERE organization_id IS NULL
  AND contact_type = 'external'
  AND person_type = 'contact';

-- 3. Contacts with NULL contact_type — derive from organization_id
UPDATE public.people
SET contact_type = CASE
      WHEN organization_id IS NOT NULL THEN 'external'
      ELSE 'internal'
    END,
    updated_at = now()
WHERE contact_type IS NULL;
