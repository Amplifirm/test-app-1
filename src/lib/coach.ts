// AI Coach — rate-limited chat scoped to a (profile, hustle) pair.
// All OpenAI calls happen server-side (Supabase edge function), never from
// the client. Client never sees an OpenAI key.
//
// TODO_DEPLOY: write the edge function at supabase/functions/coach/index.ts
// that takes { hustleSlug, week, day, recentMessages, userMessage } and
// returns the assistant reply. Use gpt-4o-mini. System prompt below is
// the canonical version — keep it in sync with the server.

import { recordCoachMessage, coachMessagesSentToday } from './db';
import { getCurrentUser } from './auth';
import { supabase } from './supabase';

const DAILY_LIMIT = 5;

export const COACH_SYSTEM_PROMPT = `You are a no-bullshit business coach for someone starting [HUSTLE]. Be specific. Suggest one next action. Keep it under 100 words unless they ask for detail.`;

export type CoachMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type CoachResponse =
  | { ok: true; message: CoachMessage }
  | { ok: false; error: 'rate_limited' | 'not_authenticated' | 'server_error'; remaining?: number };

export async function sendCoachMessage(
  hustleId: string,
  hustleName: string,
  week: number,
  day: number,
  history: CoachMessage[],
  userMessage: string
): Promise<CoachResponse> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: 'not_authenticated' };

  const sentToday = await coachMessagesSentToday(user.id);
  if (sentToday >= DAILY_LIMIT) {
    return { ok: false, error: 'rate_limited', remaining: 0 };
  }

  // Persist the user message first (so even if the assistant call fails,
  // we keep an audit log of what the user asked).
  await recordCoachMessage(user.id, hustleId, 'user', userMessage);

  if (!supabase) {
    return {
      ok: true,
      message: {
        role: 'assistant',
        content: 'AI coach is offline in local-only mode. Pick one task on today\'s playbook and ship it within an hour.',
      },
    };
  }

  // Call the edge function. The function does prompt assembly server-side
  // so the system prompt + last 5 messages don't go through the client.
  try {
    const { data, error } = await supabase.functions.invoke('coach', {
      body: {
        hustleId,
        hustleName,
        week,
        day,
        history: history.slice(-5),
        userMessage,
      },
    });
    if (error || !data?.reply) return { ok: false, error: 'server_error' };

    const reply = String(data.reply);
    await recordCoachMessage(user.id, hustleId, 'assistant', reply, data.tokens ?? undefined);
    return { ok: true, message: { role: 'assistant', content: reply } };
  } catch (e) {
    if (__DEV__) console.warn('[coach] invoke failed', (e as Error).message);
    return { ok: false, error: 'server_error' };
  }
}

export async function remainingMessagesToday(): Promise<number> {
  const user = await getCurrentUser();
  if (!user) return DAILY_LIMIT;
  const sent = await coachMessagesSentToday(user.id);
  return Math.max(0, DAILY_LIMIT - sent);
}
