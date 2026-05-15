-- HustleAI initial schema — Phase 2 of the /goal spec.
-- Apply with `supabase db push` after running `supabase link --project-ref <ref>`.

-- ──────────────────────────────────────────────────────────────────────
-- PROFILES — Supabase auth.users extension; device_id is the pre-auth handle
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  device_id TEXT,
  email TEXT,
  region_code TEXT,
  age_bracket TEXT,
  push_token TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS idx_profiles_device ON profiles(device_id);

-- ──────────────────────────────────────────────────────────────────────
-- QUIZ SESSIONS — one per quiz run; many per profile/device over lifetime
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id),
  device_id TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  axis_vector JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_device ON quiz_sessions(device_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_profile ON quiz_sessions(profile_id);

-- ──────────────────────────────────────────────────────────────────────
-- MATCHES — top-3 results for a quiz session
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_session_id UUID NOT NULL REFERENCES quiz_sessions(id) ON DELETE CASCADE,
  hustle_id TEXT NOT NULL,
  rank INT NOT NULL CHECK (rank BETWEEN 1 AND 10),
  fit_score INT NOT NULL CHECK (fit_score BETWEEN 0 AND 100),
  reasoning JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_matches_session ON matches(quiz_session_id);

-- ──────────────────────────────────────────────────────────────────────
-- ENTITLEMENTS — paid unlocks; one row per active entitlement
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS entitlements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id),
  device_id TEXT,
  type TEXT NOT NULL CHECK (type IN (
    'subscription_weekly',
    'subscription_annual',
    'subscription_lifetime',
    'playbook_single',
    'premium_upgrade'
  )),
  hustle_id TEXT,
  source TEXT NOT NULL CHECK (source IN ('apple_iap', 'google_iap', 'manual', 'revenuecat')),
  active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  raw_purchase_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_entitlements_profile ON entitlements(profile_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_device ON entitlements(device_id);
CREATE INDEX IF NOT EXISTS idx_entitlements_active ON entitlements(active) WHERE active = true;

-- ──────────────────────────────────────────────────────────────────────
-- PLAYBOOK PROGRESS — checkable tasks per (profile, hustle)
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS playbook_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id),
  device_id TEXT,
  hustle_id TEXT NOT NULL,
  current_day INT NOT NULL DEFAULT 1,
  completed_tasks JSONB NOT NULL DEFAULT '[]'::jsonb,
  last_opened_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(profile_id, hustle_id)
);

-- ──────────────────────────────────────────────────────────────────────
-- COACH MESSAGES — AI coach chat, rate-limited per profile/day
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coach_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id),
  hustle_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  token_count INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_coach_messages_profile_day ON coach_messages(profile_id, created_at DESC);

-- ──────────────────────────────────────────────────────────────────────
-- REFERRALS
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_profile_id UUID REFERENCES profiles(id),
  referee_profile_id UUID REFERENCES profiles(id),
  code TEXT UNIQUE NOT NULL,
  redeemed_at TIMESTAMPTZ,
  reward_granted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ──────────────────────────────────────────────────────────────────────
-- EVENTS LOG — backup to PostHog; useful for ad-hoc SQL exploration
-- ──────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS events_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES profiles(id),
  device_id TEXT,
  event_name TEXT NOT NULL,
  properties JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_events_log_created ON events_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_log_event ON events_log(event_name, created_at DESC);

-- ──────────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ──────────────────────────────────────────────────────────────────────
ALTER TABLE profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches             ENABLE ROW LEVEL SECURITY;
ALTER TABLE entitlements        ENABLE ROW LEVEL SECURITY;
ALTER TABLE playbook_progress   ENABLE ROW LEVEL SECURITY;
ALTER TABLE coach_messages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals           ENABLE ROW LEVEL SECURITY;
ALTER TABLE events_log          ENABLE ROW LEVEL SECURITY;

-- Own-data policies (require auth)
CREATE POLICY "own_profile"        ON profiles         FOR ALL    USING (auth.uid() = id);
CREATE POLICY "own_quiz"           ON quiz_sessions    FOR ALL    USING (auth.uid() = profile_id);
CREATE POLICY "own_matches"        ON matches          FOR SELECT USING (
  quiz_session_id IN (SELECT id FROM quiz_sessions WHERE profile_id = auth.uid())
);
CREATE POLICY "own_entitlements"   ON entitlements     FOR SELECT USING (auth.uid() = profile_id);
CREATE POLICY "own_progress"       ON playbook_progress FOR ALL   USING (auth.uid() = profile_id);
CREATE POLICY "own_coach"          ON coach_messages   FOR ALL    USING (auth.uid() = profile_id);
CREATE POLICY "own_referrals_sent" ON referrals        FOR SELECT USING (auth.uid() = referrer_profile_id);
CREATE POLICY "own_events"         ON events_log       FOR ALL    USING (auth.uid() = profile_id);

-- Service role bypasses RLS by default — used by edge functions for ingest writes
-- (e.g. RevenueCat webhook reconciliation, anonymous quiz-session inserts).
