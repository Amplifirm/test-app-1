// Hand-rolled types matching `supabase/migrations/001_initial.sql`.
// TODO: regenerate with `supabase gen types typescript --linked > src/lib/database.types.ts`
// once a Supabase project is linked.

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type EntitlementType =
  | 'subscription_weekly'
  | 'subscription_annual'
  | 'subscription_lifetime'
  | 'playbook_single'
  | 'premium_upgrade';

export type EntitlementSource = 'apple_iap' | 'google_iap' | 'manual' | 'revenuecat';

export type CoachRole = 'user' | 'assistant' | 'system';

export interface Profile {
  id: string;
  device_id: string | null;
  email: string | null;
  region_code: string | null;
  age_bracket: string | null;
  push_token: string | null;
  created_at: string;
  deleted_at: string | null;
}

export interface QuizSession {
  id: string;
  profile_id: string | null;
  device_id: string;
  started_at: string;
  completed_at: string | null;
  answers: Json;
  axis_vector: Json | null;
  created_at: string;
}

export interface Match {
  id: string;
  quiz_session_id: string;
  hustle_id: string;
  rank: number;
  fit_score: number;
  reasoning: Json | null;
  created_at: string;
}

export interface Entitlement {
  id: string;
  profile_id: string | null;
  device_id: string | null;
  type: EntitlementType;
  hustle_id: string | null;
  source: EntitlementSource;
  active: boolean;
  expires_at: string | null;
  raw_purchase_id: string | null;
  created_at: string;
}

export interface PlaybookProgress {
  id: string;
  profile_id: string | null;
  device_id: string | null;
  hustle_id: string;
  current_day: number;
  completed_tasks: string[]; // JSONB array
  last_opened_at: string | null;
  created_at: string;
}

export interface CoachMessage {
  id: string;
  profile_id: string;
  hustle_id: string;
  role: CoachRole;
  content: string;
  token_count: number | null;
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_profile_id: string | null;
  referee_profile_id: string | null;
  code: string;
  redeemed_at: string | null;
  reward_granted: boolean;
  created_at: string;
}

export interface EventsLog {
  id: string;
  profile_id: string | null;
  device_id: string | null;
  event_name: string;
  properties: Json | null;
  created_at: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & Pick<Profile, 'id'>; Update: Partial<Profile> };
      quiz_sessions: { Row: QuizSession; Insert: Partial<QuizSession> & Pick<QuizSession, 'device_id'>; Update: Partial<QuizSession> };
      matches: { Row: Match; Insert: Omit<Match, 'id' | 'created_at'>; Update: Partial<Match> };
      entitlements: { Row: Entitlement; Insert: Partial<Entitlement> & Pick<Entitlement, 'type' | 'source'>; Update: Partial<Entitlement> };
      playbook_progress: { Row: PlaybookProgress; Insert: Partial<PlaybookProgress> & Pick<PlaybookProgress, 'hustle_id'>; Update: Partial<PlaybookProgress> };
      coach_messages: { Row: CoachMessage; Insert: Omit<CoachMessage, 'id' | 'created_at'>; Update: Partial<CoachMessage> };
      referrals: { Row: Referral; Insert: Partial<Referral> & Pick<Referral, 'code'>; Update: Partial<Referral> };
      events_log: { Row: EventsLog; Insert: Partial<EventsLog> & Pick<EventsLog, 'event_name'>; Update: Partial<EventsLog> };
    };
  };
}
