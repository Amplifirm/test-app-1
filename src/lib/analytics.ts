// Analytics — typed event taxonomy + dual-write to PostHog and events_log.
// TODO_INSTALL (optional): `npx expo install posthog-react-native`
// Pure-JS mode works in Expo Go, but the official SDK has better batching.
//
// While SDK isn't installed, events are written to events_log (Supabase)
// AND console.log'd in dev. Once SDK is installed and EXPO_PUBLIC_POSTHOG_KEY
// is set, events also flow to PostHog.

import { recordEvent } from './db';
import { getDeviceId } from './auth';

// ──────────────────────────────────────────────────────────────────────
// EVENT TAXONOMY — keep in sync with HANDOFF.md dashboard list
// ──────────────────────────────────────────────────────────────────────
export type FunnelEvent =
  | 'app_opened'
  | 'quiz_started'
  | 'quiz_question_answered'
  | 'quiz_completed'
  | 'results_viewed'
  | 'match_tapped'
  | 'paywall_viewed'
  | 'paywall_dismissed'
  | 'trial_started'
  | 'subscription_purchased'
  | 'single_playbook_purchased'
  | 'restore_purchases_attempted';

export type EngagementEvent =
  | 'playbook_opened'
  | 'playbook_task_completed'
  | 'coach_message_sent'
  | 'referral_link_shared'
  | 'referral_redeemed';

export type LifecycleEvent =
  | 'push_permission_granted'
  | 'push_permission_denied'
  | 'email_captured'
  | 'account_created'
  | 'account_deleted'
  | 'subscription_cancelled'
  | 'refund_processed';

export type AnalyticsEvent = FunnelEvent | EngagementEvent | LifecycleEvent;

// ──────────────────────────────────────────────────────────────────────
// CLIENT (PostHog when SDK is installed, otherwise no-op)
// ──────────────────────────────────────────────────────────────────────
let _profileId: string | null = null;
let _posthogClient: unknown = null;

export async function initializeAnalytics(): Promise<void> {
  const key = process.env.EXPO_PUBLIC_POSTHOG_KEY;
  if (!key) return;
  // LOCAL_MOCK: when SDK installed, replace with:
  //   const { PostHog } = require('posthog-react-native');
  //   _posthogClient = new PostHog(key, { host: process.env.EXPO_PUBLIC_POSTHOG_HOST });
}

export function identify(profileId: string, traits?: Record<string, unknown>): void {
  _profileId = profileId;
  if (_posthogClient && typeof (_posthogClient as any).identify === 'function') {
    (_posthogClient as any).identify(profileId, traits ?? {});
  }
}

export async function track(event: AnalyticsEvent, properties: Record<string, unknown> = {}): Promise<void> {
  const deviceId = await getDeviceId();
  const props = { ...properties, _deviceId: deviceId };

  if (__DEV__) console.log(`[track] ${event}`, props);

  // Dual-write to events_log for SQL-based ad-hoc analysis
  void recordEvent({ deviceId, profileId: _profileId }, event, props);

  if (_posthogClient && typeof (_posthogClient as any).capture === 'function') {
    (_posthogClient as any).capture(event, props);
  }
}

export function reset(): void {
  _profileId = null;
  if (_posthogClient && typeof (_posthogClient as any).reset === 'function') {
    (_posthogClient as any).reset();
  }
}
