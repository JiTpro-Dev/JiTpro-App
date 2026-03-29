-- Enable RLS on roles lookup table
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- All authenticated users can read roles (shared lookup data)
CREATE POLICY "Authenticated users can view roles"
  ON roles FOR SELECT
  USING (auth.role() = 'authenticated');

-- No insert/update/delete policies — roles are managed via migrations only
