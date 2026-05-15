// Push notifications via Expo.
// TODO_INSTALL: `npx expo install expo-notifications expo-device`
// Then replace the LOCAL_MOCK branches.
//
// For v1 we prefer SCHEDULED LOCAL notifications (no server needed).
// Remote pushes via Expo Push Service can be wired post-launch from a
// Supabase edge function when D14/D30 server-side logic is added.

// Imports activate once the real SDK is wired in:
// import { Platform } from 'react-native';
// import { updateProfile } from './db';
// import { track } from './analytics';

type ScheduleInput = {
  id: string;          // stable id; we cancel by id when user takes the action
  title: string;
  body: string;
  data?: Record<string, unknown>;
  triggerSeconds: number; // seconds from now
};

// ──────────────────────────────────────────────────────────────────────
// PERMISSION (request after quiz complete — better acceptance rates)
// ──────────────────────────────────────────────────────────────────────
export async function requestNotificationPermission(): Promise<'granted' | 'denied' | 'undetermined'> {
  // LOCAL_MOCK: when expo-notifications installed:
  //   const Notifications = require('expo-notifications');
  //   const { status } = await Notifications.requestPermissionsAsync();
  //   if (status === 'granted') track('push_permission_granted');
  //   else track('push_permission_denied');
  //   return status;
  if (__DEV__) console.log('[notifications] permission request mocked');
  return 'undetermined';
}

export async function getCurrentPermission(): Promise<'granted' | 'denied' | 'undetermined'> {
  // LOCAL_MOCK: getPermissionsAsync
  return 'undetermined';
}

// ──────────────────────────────────────────────────────────────────────
// TOKEN (for server-pushed; not strictly needed if only using local)
// ──────────────────────────────────────────────────────────────────────
export async function registerPushTokenForProfile(profileId: string): Promise<string | null> {
  // LOCAL_MOCK: when expo-notifications + expo-device installed:
  //   const Device = require('expo-device');
  //   if (!Device.isDevice) return null;
  //   const Notifications = require('expo-notifications');
  //   const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  //   const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
  //   await updateProfile(profileId, { push_token: token });
  //   return token;
  return null;
}

// ──────────────────────────────────────────────────────────────────────
// SCHEDULED LOCAL NOTIFICATIONS
// ──────────────────────────────────────────────────────────────────────
const _scheduledIds = new Map<string, string>(); // our id → OS notification id

export async function schedule(input: ScheduleInput): Promise<void> {
  // LOCAL_MOCK: when SDK installed:
  //   const Notifications = require('expo-notifications');
  //   const osId = await Notifications.scheduleNotificationAsync({
  //     content: { title: input.title, body: input.body, data: input.data ?? {} },
  //     trigger: { seconds: input.triggerSeconds },
  //   });
  //   _scheduledIds.set(input.id, osId);
  if (__DEV__) console.log(`[notifications] scheduled "${input.id}" in ${input.triggerSeconds}s`);
}

export async function cancel(id: string): Promise<void> {
  // LOCAL_MOCK: real impl uses Notifications.cancelScheduledNotificationAsync(osId);
  _scheduledIds.delete(id);
}

// ──────────────────────────────────────────────────────────────────────
// LIFECYCLE SCHEDULES — wire these from quiz completion + paywall events
// ──────────────────────────────────────────────────────────────────────
const DAY = 24 * 60 * 60;

export async function schedulePostQuizSchedule(opts: {
  topMatchTitle: string;
  onTrial: boolean;
}): Promise<void> {
  await schedule({
    id: 'd1_top_match',
    title: `${opts.topMatchTitle} is your #1 match.`,
    body: 'Day 1 of the playbook takes 12 minutes.',
    triggerSeconds: 1 * DAY,
  });

  if (opts.onTrial) {
    // D2 trial reminder — 18h before charge (day 3 trial → fire at ~54h)
    await schedule({
      id: 'd2_trial_reminder',
      title: 'Heads up: your trial ends tomorrow.',
      body: 'Cancel anytime in Settings.',
      triggerSeconds: Math.floor(2.25 * DAY),
    });
  }

  await schedule({
    id: 'd3_outreach',
    title: 'Day 3: first outreach script.',
    body: `${opts.topMatchTitle} starts to move now.`,
    triggerSeconds: 3 * DAY,
  });

  await schedule({
    id: 'd7_week1',
    title: 'Your Week 1 score is ready.',
    body: 'Tap to see what to ship next.',
    triggerSeconds: 7 * DAY,
  });
}

export async function scheduleIncompleteQuizNudge(): Promise<void> {
  await schedule({
    id: 'incomplete_quiz_15m',
    title: 'Your matches are 1 question away.',
    body: 'Pick up where you left off →',
    triggerSeconds: 15 * 60,
  });
}

export async function cancelIncompleteQuizNudge(): Promise<void> {
  await cancel('incomplete_quiz_15m');
}
