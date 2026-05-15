// Typed DB client wrapping the Supabase SDK with the operations our app needs.
// Every function takes a `ctx` shape with device_id and optional profile_id,
// so the same call site works for anonymous and authenticated users.

import { supabase } from './supabase';
import type {
  CoachMessage,
  CoachRole,
  Entitlement,
  EntitlementSource,
  EntitlementType,
  EventsLog,
  Match,
  PlaybookProgress,
  Profile,
  QuizSession,
} from './database.types';

export type Ctx = { deviceId: string; profileId?: string | null };

// ──────────────────────────────────────────────────────────────────────
// QUIZ SESSIONS
// ──────────────────────────────────────────────────────────────────────
export async function createQuizSession(ctx: Ctx): Promise<QuizSession | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('quiz_sessions')
    .insert({ device_id: ctx.deviceId, profile_id: ctx.profileId ?? null } as any)
    .select('*')
    .single();
  if (error) {
    if (__DEV__) console.warn('[db] createQuizSession', error.message);
    return null;
  }
  return data as QuizSession;
}

export async function saveQuizAnswer(sessionId: string, questionId: string, answer: unknown): Promise<void> {
  if (!supabase) return;
  const { data: row } = await supabase.from('quiz_sessions').select('answers').eq('id', sessionId).maybeSingle();
  const current = ((row as { answers?: Record<string, unknown> } | null)?.answers) ?? {};
  const next = { ...current, [questionId]: answer };
  await supabase.from('quiz_sessions').update({ answers: next } as any).eq('id', sessionId);
}

export async function completeQuizSession(sessionId: string, axisVector: number[]): Promise<void> {
  if (!supabase) return;
  await supabase
    .from('quiz_sessions')
    .update({ completed_at: new Date().toISOString(), axis_vector: axisVector } as any)
    .eq('id', sessionId);
}

// ──────────────────────────────────────────────────────────────────────
// MATCHES
// ──────────────────────────────────────────────────────────────────────
export async function saveMatches(sessionId: string, matches: Omit<Match, 'id' | 'quiz_session_id' | 'created_at'>[]): Promise<void> {
  if (!supabase) return;
  const rows = matches.map((m) => ({ ...m, quiz_session_id: sessionId }));
  await supabase.from('matches').insert(rows as any);
}

export async function getMatches(sessionId: string): Promise<Match[]> {
  if (!supabase) return [];
  const { data } = await supabase.from('matches').select('*').eq('quiz_session_id', sessionId).order('rank');
  return (data as Match[]) ?? [];
}

// ──────────────────────────────────────────────────────────────────────
// ENTITLEMENTS
// ──────────────────────────────────────────────────────────────────────
export async function getEntitlements(ctx: Ctx): Promise<Entitlement[]> {
  if (!supabase) return [];
  let q = supabase.from('entitlements').select('*').eq('active', true);
  if (ctx.profileId) q = q.eq('profile_id', ctx.profileId);
  else q = q.eq('device_id', ctx.deviceId);
  const { data } = await q;
  return (data as Entitlement[]) ?? [];
}

export async function recordEntitlement(
  ctx: Ctx,
  type: EntitlementType,
  source: EntitlementSource,
  opts: { hustleId?: string; expiresAt?: string; rawPurchaseId?: string } = {}
): Promise<Entitlement | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('entitlements')
    .insert({
      profile_id: ctx.profileId ?? null,
      device_id: ctx.deviceId,
      type,
      source,
      active: true,
      hustle_id: opts.hustleId ?? null,
      expires_at: opts.expiresAt ?? null,
      raw_purchase_id: opts.rawPurchaseId ?? null,
    } as any)
    .select('*')
    .single();
  if (error) {
    if (__DEV__) console.warn('[db] recordEntitlement', error.message);
    return null;
  }
  return data as Entitlement;
}

export function entitlesPlaybook(entitlements: Entitlement[], hustleId: string): boolean {
  return entitlements.some(
    (e) =>
      e.active &&
      (
        e.type === 'subscription_weekly' ||
        e.type === 'subscription_annual' ||
        e.type === 'subscription_lifetime' ||
        (e.type === 'playbook_single' && e.hustle_id === hustleId)
      )
  );
}

// ──────────────────────────────────────────────────────────────────────
// PLAYBOOK PROGRESS
// ──────────────────────────────────────────────────────────────────────
export async function upsertPlaybookProgress(ctx: Ctx, hustleId: string, patch: Partial<PlaybookProgress>): Promise<void> {
  if (!supabase) return;
  await supabase.from('playbook_progress').upsert(
    {
      profile_id: ctx.profileId ?? null,
      device_id: ctx.deviceId,
      hustle_id: hustleId,
      ...patch,
      last_opened_at: new Date().toISOString(),
    } as any,
    { onConflict: 'profile_id,hustle_id' }
  );
}

export async function getPlaybookProgress(ctx: Ctx, hustleId: string): Promise<PlaybookProgress | null> {
  if (!supabase) return null;
  let q = supabase.from('playbook_progress').select('*').eq('hustle_id', hustleId);
  if (ctx.profileId) q = q.eq('profile_id', ctx.profileId);
  else q = q.eq('device_id', ctx.deviceId);
  const { data } = await q.maybeSingle();
  return (data as PlaybookProgress | null) ?? null;
}

// ──────────────────────────────────────────────────────────────────────
// COACH MESSAGES
// ──────────────────────────────────────────────────────────────────────
export async function recordCoachMessage(
  profileId: string,
  hustleId: string,
  role: CoachRole,
  content: string,
  tokenCount?: number
): Promise<CoachMessage | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('coach_messages')
    .insert({ profile_id: profileId, hustle_id: hustleId, role, content, token_count: tokenCount ?? null } as any)
    .select('*')
    .single();
  if (error) {
    if (__DEV__) console.warn('[db] recordCoachMessage', error.message);
    return null;
  }
  return data as CoachMessage;
}

export async function coachMessagesSentToday(profileId: string): Promise<number> {
  if (!supabase) return 0;
  const since = new Date();
  since.setHours(0, 0, 0, 0);
  const { count } = await supabase
    .from('coach_messages')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', profileId)
    .eq('role', 'user')
    .gte('created_at', since.toISOString());
  return count ?? 0;
}

// ──────────────────────────────────────────────────────────────────────
// EVENTS LOG (backup to PostHog)
// ──────────────────────────────────────────────────────────────────────
export async function recordEvent(
  ctx: Ctx | { deviceId?: string | null; profileId?: string | null },
  eventName: string,
  properties?: Record<string, unknown>
): Promise<void> {
  if (!supabase) return;
  await supabase.from('events_log').insert({
    profile_id: ctx.profileId ?? null,
    device_id: ctx.deviceId ?? null,
    event_name: eventName,
    properties: (properties as EventsLog['properties']) ?? null,
  } as any);
}

// ──────────────────────────────────────────────────────────────────────
// PROFILE
// ──────────────────────────────────────────────────────────────────────
export async function updateProfile(profileId: string, patch: Partial<Profile>): Promise<void> {
  if (!supabase) return;
  await supabase.from('profiles').update(patch as any).eq('id', profileId);
}

export async function deleteOwnProfile(profileId: string): Promise<void> {
  if (!supabase) return;
  // Soft delete first, then cascade via auth.users delete
  await supabase.from('profiles').update({ deleted_at: new Date().toISOString() } as any).eq('id', profileId);
  await supabase.auth.signOut();
}
