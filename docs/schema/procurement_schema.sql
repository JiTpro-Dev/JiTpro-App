-- ============================================
-- Procurement Timeline Schema (Demo)
-- ============================================


-- ============================================
-- 1. Roles Lookup Table
-- ============================================

CREATE TABLE roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  category TEXT NOT NULL,
  sub_role TEXT NOT NULL,
  sort_order INT DEFAULT 0,

  UNIQUE (category, sub_role)
);

-- Seed roles data
INSERT INTO roles (category, sub_role, sort_order) VALUES
  -- Owner
  ('owner', 'Owner', 1),
  ('owner', 'Owner Spouse', 2),
  ('owner', 'Owner Representative', 3),

  -- Architect
  ('architect', 'Lead Architect', 1),
  ('architect', 'Project Architect', 2),

  -- Engineer
  ('engineer', 'Lead Engineer', 1),
  ('engineer', 'Project Engineer', 2),

  -- General Contractor
  ('general_contractor', 'Principle', 1),
  ('general_contractor', 'Senior Project Manager', 2),
  ('general_contractor', 'Project Manager', 3),
  ('general_contractor', 'Project Engineer', 4),
  ('general_contractor', 'Superintendent', 5),
  ('general_contractor', 'Foreman', 6),

  -- Subcontractor
  ('subcontractor', 'Principle', 1),
  ('subcontractor', 'Project Manager', 2),
  ('subcontractor', 'Superintendent', 3),

  -- Supplier (no sub-roles yet)
  ('supplier', 'Supplier', 1),

  -- Consultant (sub-roles TBD)
  ('consultant', 'Consultant', 1),

  -- Other (sub-roles TBD)
  ('other', 'Other', 1);


-- ============================================
-- 2. Project Team Members (demo version)
-- ============================================

CREATE TABLE project_team (
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

-- RLS
ALTER TABLE project_team ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own team members"
  ON project_team FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own team members"
  ON project_team FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own team members"
  ON project_team FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own team members"
  ON project_team FOR DELETE USING (auth.uid() = user_id);


-- ============================================
-- 3. Procurement Timelines
-- ============================================

CREATE TABLE procurement_timelines (
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
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE procurement_timelines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own timelines"
  ON procurement_timelines FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own timelines"
  ON procurement_timelines FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own timelines"
  ON procurement_timelines FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own timelines"
  ON procurement_timelines FOR DELETE USING (auth.uid() = user_id);


-- ============================================
-- 4. Timeline Assignments (task → team member)
-- ============================================

CREATE TABLE timeline_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timeline_id UUID REFERENCES procurement_timelines(id) ON DELETE CASCADE NOT NULL,
  task_name TEXT NOT NULL,
  team_member_id UUID REFERENCES project_team(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),

  UNIQUE (timeline_id, task_name, team_member_id)
);

-- RLS (inherits access through timeline ownership)
ALTER TABLE timeline_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view assignments for their timelines"
  ON timeline_assignments FOR SELECT
  USING (timeline_id IN (
    SELECT id FROM procurement_timelines WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert assignments for their timelines"
  ON timeline_assignments FOR INSERT
  WITH CHECK (timeline_id IN (
    SELECT id FROM procurement_timelines WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update assignments for their timelines"
  ON timeline_assignments FOR UPDATE
  USING (timeline_id IN (
    SELECT id FROM procurement_timelines WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can delete assignments for their timelines"
  ON timeline_assignments FOR DELETE
  USING (timeline_id IN (
    SELECT id FROM procurement_timelines WHERE user_id = auth.uid()
  ));


-- ============================================
-- 5. Auto-update triggers
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER project_team_updated_at
  BEFORE UPDATE ON project_team
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER procurement_timelines_updated_at
  BEFORE UPDATE ON procurement_timelines
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
