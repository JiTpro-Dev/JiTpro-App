-- Migration 026: Drop vendor_id from procurement_items
-- vendor_id was always null (no UI ever set it).
-- Vendor concept has been absorbed into organizations.

alter table public.procurement_items
  drop column if exists vendor_id;
