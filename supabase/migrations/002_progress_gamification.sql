-- Phase 13 — Gamification & progress tracking.
-- Extends playbook_progress with streak / pause / milestone columns.
-- Apply with `supabase db push` after migration 001 is in place.

ALTER TABLE playbook_progress
  ADD COLUMN IF NOT EXISTS streak_days INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_streak_date DATE,
  ADD COLUMN IF NOT EXISTS paused_until TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS pauses_used INT NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS milestones_hit JSONB NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS unlocked_scripts JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Index on (profile_id, streak_days) for any future "leaderboard within hustle" queries.
CREATE INDEX IF NOT EXISTS idx_progress_streak ON playbook_progress(profile_id, streak_days DESC);

-- Optional: a view for "anyone active today" — useful for cohort sync features later.
CREATE OR REPLACE VIEW active_today_progress AS
SELECT *
FROM playbook_progress
WHERE last_streak_date = CURRENT_DATE;
