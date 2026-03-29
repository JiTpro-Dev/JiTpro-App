-- ============================================
-- Procurement Edit Logic — Schema Updates
-- ============================================

-- 1. Add status and baseline_count to procurement_timelines
ALTER TABLE procurement_timelines
  ADD COLUMN status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'complete')),
  ADD COLUMN baseline_count INT NOT NULL DEFAULT 0;


-- 2. Timeline Baselines (permanent numbered snapshots)
CREATE TABLE timeline_baselines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  timeline_id UUID REFERENCES procurement_timelines(id) ON DELETE CASCADE NOT NULL,
  baseline_number INT NOT NULL,
  snapshot JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),

  UNIQUE (timeline_id, baseline_number)
);

ALTER TABLE timeline_baselines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view baselines for their timelines"
  ON timeline_baselines FOR SELECT
  USING (timeline_id IN (
    SELECT id FROM procurement_timelines WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert baselines for their timelines"
  ON timeline_baselines FOR INSERT
  WITH CHECK (timeline_id IN (
    SELECT id FROM procurement_timelines WHERE user_id = auth.uid()
  ));

-- Baselines are permanent — no update or delete policies


-- 3. Timeline Edit Log (audit trail)
CREATE TABLE timeline_edit_log (
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

CREATE POLICY "Users can view edit logs for their timelines"
  ON timeline_edit_log FOR SELECT
  USING (timeline_id IN (
    SELECT id FROM procurement_timelines WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert edit logs for their timelines"
  ON timeline_edit_log FOR INSERT
  WITH CHECK (timeline_id IN (
    SELECT id FROM procurement_timelines WHERE user_id = auth.uid()
  ));

-- Edit logs are permanent — no update or delete policies
