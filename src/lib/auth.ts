// Auth helpers. Device-id-first: every user has a stable device UUID even
// before signup. Account creation links the device_id quiz data into a
// new profile row.

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { supabase, supabaseEnabled } from './supabase';
import type { Profile } from './database.types';

const DEVICE_ID_KEY = 'hustleai_device_id_v1';

// ──────────────────────────────────────────────────────────────────────
// DEVICE ID
// ──────────────────────────────────────────────────────────────────────
let _cachedDeviceId: string | null = null;

function makeUUID(): string {
  // RFC4122 v4 UUID — sufficient for device id, no crypto guarantees needed.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function getDeviceId(): Promise<string> {
  if (_cachedDeviceId) return _cachedDeviceId;
  try {
    const existing = await SecureStore.getItemAsync(DEVICE_ID_KEY);
    if (existing) {
      _cachedDeviceId = existing;
      return existing;
    }
  } catch {
    // SecureStore is unavailable in web; fall through to generation.
  }
  const id = makeUUID();
  try {
    await SecureStore.setItemAsync(DEVICE_ID_KEY, id);
  } catch {
    if (__DEV__) console.warn('[auth] SecureStore write failed; device_id is process-only');
  }
  _cachedDeviceId = id;
  return id;
}

// ──────────────────────────────────────────────────────────────────────
// AUTH
// ──────────────────────────────────────────────────────────────────────
export async function getCurrentUser(): Promise<Profile | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).maybeSingle();
  return (profile as Profile | null) ?? null;
}

/**
 * Sign up with email + password. Links any device_id-scoped quiz data
 * into the newly-created profile.
 */
export async function signUpWithEmail(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: 'supabase-not-configured' };
  const deviceId = await getDeviceId();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error || !data.user) return { ok: false, error: error?.message ?? 'unknown' };

  // Create profile row, carrying the device_id so server-side linking can find existing rows.
  await supabase.from('profiles').upsert(
    { id: data.user.id, email, device_id: deviceId } as any,
    { onConflict: 'id' }
  );

  // Link any prior anonymous quiz_sessions / entitlements / progress to this profile.
  // (Triggers / edge function recommended for production — for now, do it client-side.)
  await Promise.all([
    supabase.from('quiz_sessions').update({ profile_id: data.user.id } as any).eq('device_id', deviceId).is('profile_id', null),
    supabase.from('entitlements').update({ profile_id: data.user.id } as any).eq('device_id', deviceId).is('profile_id', null),
    supabase.from('playbook_progress').update({ profile_id: data.user.id } as any).eq('device_id', deviceId).is('profile_id', null),
  ]);

  return { ok: true };
}

export async function signInWithEmail(email: string, password: string): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) return { ok: false, error: 'supabase-not-configured' };
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return error ? { ok: false, error: error.message } : { ok: true };
}

/**
 * Apple Sign-In. Implementation deferred — needs `expo-apple-authentication`
 * (iOS only) + Supabase Auth provider config in dashboard.
 * Returns a stub indicating not-configured.
 */
export async function signInWithApple(): Promise<{ ok: boolean; error?: string }> {
  if (Platform.OS !== 'ios') return { ok: false, error: 'not-supported-on-platform' };
  return { ok: false, error: 'apple-signin-not-implemented' };
}

/**
 * Google Sign-In. Implementation deferred — needs Google OAuth client
 * (configured in Supabase Auth providers) and `expo-auth-session`.
 */
export async function signInWithGoogle(): Promise<{ ok: boolean; error?: string }> {
  return { ok: false, error: 'google-signin-not-implemented' };
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export { supabaseEnabled };
