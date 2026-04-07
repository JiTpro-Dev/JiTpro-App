-- ============================================
-- JiTpro Sandbox Bootstrap Script
-- ============================================
-- Run this in the jitpro-sandbox Supabase project SQL Editor.
-- Creates all tables required by /demo/* routes.
-- Idempotent — safe to run multiple times.
--
-- Source migrations:
--   20260325175104_procurement_schema.sql
--   20260325175646_roles_rls.sql
--   20260325224609_procurement_edit_logic.sql
-- ============================================


-- ============================================
-- 1. Helper: update_updated_at trigger function
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ============================================
-- 2. Roles Lookup Table
-- ============================================

CREATE TABLE IF NOT EXISTS roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  sub_role TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  UNIQUE (category, sub_role)
);

-- Seed roles (skip if already present)
INSERT INTO roles (category, sub_role, sort_order) VALUES
  ('owner', 'Owner', 1),
  ('owner', 'Owner Spouse', 2),
  ('owner', 'Owner Representative', 3),
  ('architect', 'Lead Architect', 1),
  ('architect', 'Project Architect', 2),
  ('engineer', 'Lead Engineer', 1),
  ('engineer', 'Project Engineer', 2),
  ('general_contractor', 'Principle', 1),
  ('general_contractor', 'Senior Project Manager', 2),
  ('general_contractor', 'Project Manager', 3),
  ('general_contractor', 'Project Engineer', 4),
  ('general_contractor', 'Superintendent', 5),
  ('general_contractor', 'Foreman', 6),
  ('subcontractor', 'Principle', 1),
  ('subcontractor', 'Project Manager', 2),
  ('subcontractor', 'Superintendent', 3),
  ('supplier', 'Supplier', 1),
  ('consultant', 'Consultant', 1),
  ('other', 'Other', 1)
ON CONFLICT (category, sub_role) DO NOTHING;

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- RLS: all authenticated users can read roles
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'roles' AND policyname = 'Authenticated users can view roles'
  ) THEN
    CREATE POLICY "Authenticated users can view roles"
      ON roles FOR SELECT
      USING (auth.role() = 'authenticated');
  END IF;
END $$;


-- ============================================
-- 3. Project Team Members
-- ============================================

CREATE TABLE IF NOT EXISTS project_team (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  title TEXT,
  company TEXT,
  email TEXT,
  phone TEXT,
  role_id UUID REFERENCES roles(id) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE project_team ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_team' AND policyname = 'Users can view their own team members') THEN
    CREATE POLICY "Users can view their own team members" ON project_team FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_team' AND policyname = 'Users can insert their own team members') THEN
    CREATE POLICY "Users can insert their own team members" ON project_team FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_team' AND policyname = 'Users can update their own team members') THEN
    CREATE POLICY "Users can update their own team members" ON project_team FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_team' AND policyname = 'Users can delete their own team members') THEN
    CREATE POLICY "Users can delete their own team members" ON project_team FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

DROP TRIGGER IF EXISTS project_team_updated_at ON project_team;
CREATE TRIGGER project_team_updated_at
  BEFORE UPDATE ON project_team
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================
-- 4. Procurement Timelines
-- ============================================

CREATE TABLE IF NOT EXISTS procurement_timelines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  delivery_date DATE NOT NULL,
  timeline_data JSONB NOT NULL,
  final_design_enabled BOOLEAN DEFAULT false,
  final_design_date DATE,
  final_selection_enabled BOOLEAN DEFAULT false,
  final_selection_date DATE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'complete')),
  baseline_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE procurement_timelines ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'procurement_timelines' AND policyname = 'Users can view their own timelines') THEN
    CREATE POLICY "Users can view their own timelines" ON procurement_timelines FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'procurement_timelines' AND policyname = 'Users can insert their own timelines') THEN
    CREATE POLICY "Users can insert their own timelines" ON procurement_timelines FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'procurement_timelines' AND policyname = 'Users can update their own timelines') THEN
    CREATE POLICY "Users can update their own timelines" ON procurement_timelines FOR UPDATE USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'procurement_timelines' AND policyname = 'Users can delete their own timelines') THEN
    CREATE POLICY "Users can delete their own timelines" ON procurement_timelines FOR DELETE USING (auth.uid() = user_id);
  END IF;
END $$;

DROP TRIGGER IF EXISTS procurement_timelines_updated_at ON procurement_timelines;
CREATE TRIGGER procurement_timelines_updated_at
  BEFORE UPDATE ON procurement_timelines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ============================================
-- 5. Timeline Assignments
-- ============================================

CREATE TABLE IF NOT EXISTS timeline_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timeline_id UUID REFERENCES procurement_timelines(id) ON DELETE CASCADE NOT NULL,
  task_name TEXT NOT NULL,
  team_member_id UUID REFERENCES project_team(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (timeline_id, task_name, team_member_id)
);

ALTER TABLE timeline_assignments ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'timeline_assignments' AND policyname = 'Users can view assignments for their timelines') THEN
    CREATE POLICY "Users can view assignments for their timelines" ON timeline_assignments FOR SELECT
      USING (timeline_id IN (SELECT id FROM procurement_timelines WHERE user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'timeline_assignments' AND policyname = 'Users can insert assignments for their timelines') THEN
    CREATE POLICY "Users can insert assignments for their timelines" ON timeline_assignments FOR INSERT
      WITH CHECK (timeline_id IN (SELECT id FROM procurement_timelines WHERE user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'timeline_assignments' AND policyname = 'Users can update assignments for their timelines') THEN
    CREATE POLICY "Users can update assignments for their timelines" ON timeline_assignments FOR UPDATE
      USING (timeline_id IN (SELECT id FROM procurement_timelines WHERE user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'timeline_assignments' AND policyname = 'Users can delete assignments for their timelines') THEN
    CREATE POLICY "Users can delete assignments for their timelines" ON timeline_assignments FOR DELETE
      USING (timeline_id IN (SELECT id FROM procurement_timelines WHERE user_id = auth.uid()));
  END IF;
END $$;


-- ============================================
-- 6. Timeline Baselines (immutable snapshots)
-- ============================================

CREATE TABLE IF NOT EXISTS timeline_baselines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timeline_id UUID REFERENCES procurement_timelines(id) ON DELETE CASCADE NOT NULL,
  baseline_number INT NOT NULL,
  snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE (timeline_id, baseline_number)
);

ALTER TABLE timeline_baselines ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'timeline_baselines' AND policyname = 'Users can view baselines for their timelines') THEN
    CREATE POLICY "Users can view baselines for their timelines" ON timeline_baselines FOR SELECT
      USING (timeline_id IN (SELECT id FROM procurement_timelines WHERE user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'timeline_baselines' AND policyname = 'Users can insert baselines for their timelines') THEN
    CREATE POLICY "Users can insert baselines for their timelines" ON timeline_baselines FOR INSERT
      WITH CHECK (timeline_id IN (SELECT id FROM procurement_timelines WHERE user_id = auth.uid()));
  END IF;
END $$;

-- Baselines are permanent — no update or delete policies


-- ============================================
-- 7. Timeline Edit Log (audit trail)
-- ============================================

CREATE TABLE IF NOT EXISTS timeline_edit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timeline_id UUID REFERENCES procurement_timelines(id) ON DELETE CASCADE NOT NULL,
  task_name TEXT NOT NULL,
  field_changed TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  reason TEXT NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE timeline_edit_log ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'timeline_edit_log' AND policyname = 'Users can view edit logs for their timelines') THEN
    CREATE POLICY "Users can view edit logs for their timelines" ON timeline_edit_log FOR SELECT
      USING (timeline_id IN (SELECT id FROM procurement_timelines WHERE user_id = auth.uid()));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'timeline_edit_log' AND policyname = 'Users can insert edit logs for their timelines') THEN
    CREATE POLICY "Users can insert edit logs for their timelines" ON timeline_edit_log FOR INSERT
      WITH CHECK (timeline_id IN (SELECT id FROM procurement_timelines WHERE user_id = auth.uid()));
  END IF;
END $$;

-- Edit logs are permanent — no update or delete policies


-- ============================================
-- Done. All sandbox/demo tables restored.
-- ============================================
