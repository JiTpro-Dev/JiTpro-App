-- ============================================
-- 006: RLS fixes for setup wizard flow
-- ============================================
-- During initial setup, the user doesn't have a users record yet.
-- These policies allow authenticated users to create their first
-- company and user record.

-- Allow any authenticated user to create a company (first-time setup)
create policy "Authenticated users can create a company"
  on public.companies for insert
  with check (auth.uid() is not null);

-- Allow any authenticated user to create their own user record (first-time setup)
create policy "Authenticated users can create own user record"
  on public.users for insert
  with check (auth.uid() is not null);

-- Allow the setup wizard to insert work week, holidays, contacts, cost codes, templates
-- These use user_belongs_to_company() which will work after step 1 creates the user record
