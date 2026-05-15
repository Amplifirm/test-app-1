import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Answers = Record<string, any>;

// ──────────────────────────────────────────────────────────────────────
// PLAYBOOK PROGRESS (gamification slice)
// ──────────────────────────────────────────────────────────────────────
export type Milestone = {
  week: number;
  kind: 'badge' | 'unlock';
  at: string;          // ISO timestamp
};

export type ProgressEntry = {
  hustleSlug: string;
  startedAt: string;                  // ISO
  completedDayIds: number[];          // marked-done absolute day numbers (1..90)
  completedTaskIds: string[];         // legacy sub-task ids (kept for v1 compat)
  streakDays: number;                 // consecutive days with ≥ 1 completion
  lastStreakDate: string | null;      // YYYY-MM-DD (local)
  pausedUntil: string | null;         // ISO timestamp when pause expires
  pausesUsed: number;                 // out of 2 per 90 days
  milestonesHit: Milestone[];
  unlockedScripts: string[];          // script template ids gated by week
};

function todayLocalDate(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function diffDays(a: string, b: string): number {
  const ad = new Date(a + 'T00:00:00');
  const bd = new Date(b + 'T00:00:00');
  return Math.round((bd.getTime() - ad.getTime()) / (24 * 60 * 60 * 1000));
}

function newProgressEntry(hustleSlug: string): ProgressEntry {
  return {
    hustleSlug,
    startedAt: new Date().toISOString(),
    completedDayIds: [],
    completedTaskIds: [],
    streakDays: 0,
    lastStreakDate: null,
    pausedUntil: null,
    pausesUsed: 0,
    milestonesHit: [],
    unlockedScripts: [],
  };
}

type State = {
  // Core
  answers: Answers;
  email: string | null;
  unlocks: string[]; // playbook slugs; '__all__' = on subscription
  setAnswer: (id: string, value: any) => void;
  setEmail: (e: string) => void;
  unlock: (slug: string, all?: boolean) => void;
  resetQuiz: () => void;
  resetAll: () => void;
  isUnlocked: (slug: string) => boolean;

  // Playbook progress / gamification
  playbookProgress: Record<string, ProgressEntry>;
  ensureProgress: (hustleSlug: string) => ProgressEntry;
  markDayDone: (hustleSlug: string, dayNumber: number) => { newStreak: number; weekJustCompleted: number | null };
  markDayUndone: (hustleSlug: string, dayNumber: number) => void;
  isPaused: (hustleSlug: string) => boolean;
  pausePlaybook: (hustleSlug: string, hours: number) => { ok: boolean; reason?: string };
  unlockMilestone: (hustleSlug: string, week: number, kind?: 'badge' | 'unlock') => void;
  unlockScript: (hustleSlug: string, scriptId: string) => void;
  currentDay: (hustleSlug: string) => number; // 1..90 — based on startedAt elapsed days
  weekFromDay: (dayNumber: number) => number; // 1..12
};

export const useApp = create<State>()(
  persist(
    (set, get) => ({
      answers: {},
      email: null,
      unlocks: [],
      playbookProgress: {},

      setAnswer: (id, value) => set((s) => ({ answers: { ...s.answers, [id]: value } })),
      setEmail: (email) => set({ email }),
      unlock: (slug, all = false) =>
        set((s) => {
          const next = new Set(s.unlocks);
          if (all) next.add('__all__');
          else next.add(slug);
          return { unlocks: Array.from(next) };
        }),
      resetQuiz: () => set({ answers: {} }),
      resetAll: () => set({ answers: {}, email: null, unlocks: [], playbookProgress: {} }),
      isUnlocked: (slug) => {
        const u = get().unlocks;
        return u.includes('__all__') || u.includes(slug);
      },

      // ── Playbook progress helpers ───────────────────────────────────
      ensureProgress: (hustleSlug) => {
        const existing = get().playbookProgress[hustleSlug];
        if (existing) return existing;
        const fresh = newProgressEntry(hustleSlug);
        set((s) => ({ playbookProgress: { ...s.playbookProgress, [hustleSlug]: fresh } }));
        return fresh;
      },

      markDayDone: (hustleSlug, dayNumber) => {
        const today = todayLocalDate();
        let resultNewStreak = 0;
        let resultWeek: number | null = null;
        set((s) => {
          const p = s.playbookProgress[hustleSlug] ?? newProgressEntry(hustleSlug);
          if (p.completedDayIds.includes(dayNumber)) {
            resultNewStreak = p.streakDays;
            return s;
          }
          const completedDayIds = [...p.completedDayIds, dayNumber].sort((a, b) => a - b);

          // Streak logic: if first completion today, bump or reset
          let streakDays = p.streakDays;
          let lastStreakDate = p.lastStreakDate;
          if (p.lastStreakDate !== today) {
            if (p.lastStreakDate && diffDays(p.lastStreakDate, today) === 1) {
              streakDays = p.streakDays + 1;
            } else {
              streakDays = 1;
            }
            lastStreakDate = today;
          }
          resultNewStreak = streakDays;

          // Detect week completion: did this day finish a 7-day block?
          const week = Math.ceil(dayNumber / 7); // approximate (we'll refine when day→week mapping is in the JSON)
          const weekStart = (week - 1) * 7 + 1;
          const weekEnd = Math.min(week * 7, 90);
          const allWeekDays: number[] = [];
          for (let d = weekStart; d <= weekEnd; d++) allWeekDays.push(d);
          const weekComplete = allWeekDays.every((d) => completedDayIds.includes(d));
          if (weekComplete && !p.milestonesHit.some((m) => m.week === week)) {
            resultWeek = week;
          }

          const next: ProgressEntry = { ...p, completedDayIds, streakDays, lastStreakDate };
          return { playbookProgress: { ...s.playbookProgress, [hustleSlug]: next } };
        });
        return { newStreak: resultNewStreak, weekJustCompleted: resultWeek };
      },

      markDayUndone: (hustleSlug, dayNumber) => {
        set((s) => {
          const p = s.playbookProgress[hustleSlug];
          if (!p) return s;
          return {
            playbookProgress: {
              ...s.playbookProgress,
              [hustleSlug]: { ...p, completedDayIds: p.completedDayIds.filter((d) => d !== dayNumber) },
            },
          };
        });
      },

      isPaused: (hustleSlug) => {
        const p = get().playbookProgress[hustleSlug];
        if (!p?.pausedUntil) return false;
        return new Date(p.pausedUntil).getTime() > Date.now();
      },

      pausePlaybook: (hustleSlug, hours) => {
        const p = get().ensureProgress(hustleSlug);
        if (p.pausesUsed >= 2) return { ok: false, reason: 'no-pauses-left' };
        const until = new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
        set((s) => ({
          playbookProgress: {
            ...s.playbookProgress,
            [hustleSlug]: { ...p, pausedUntil: until, pausesUsed: p.pausesUsed + 1 },
          },
        }));
        return { ok: true };
      },

      unlockMilestone: (hustleSlug, week, kind = 'badge') => {
        set((s) => {
          const p = s.playbookProgress[hustleSlug] ?? newProgressEntry(hustleSlug);
          if (p.milestonesHit.some((m) => m.week === week)) return s;
          const milestonesHit = [...p.milestonesHit, { week, kind, at: new Date().toISOString() }];
          return { playbookProgress: { ...s.playbookProgress, [hustleSlug]: { ...p, milestonesHit } } };
        });
      },

      unlockScript: (hustleSlug, scriptId) => {
        set((s) => {
          const p = s.playbookProgress[hustleSlug] ?? newProgressEntry(hustleSlug);
          if (p.unlockedScripts.includes(scriptId)) return s;
          return {
            playbookProgress: {
              ...s.playbookProgress,
              [hustleSlug]: { ...p, unlockedScripts: [...p.unlockedScripts, scriptId] },
            },
          };
        });
      },

      currentDay: (hustleSlug) => {
        const p = get().playbookProgress[hustleSlug];
        if (!p) return 1;
        const elapsed = Math.floor((Date.now() - new Date(p.startedAt).getTime()) / (24 * 60 * 60 * 1000));
        return Math.max(1, Math.min(90, elapsed + 1));
      },

      weekFromDay: (dayNumber) => Math.max(1, Math.min(12, Math.ceil(dayNumber / 7))),
    }),
    {
      name: 'hustleai_v2',
      storage: createJSONStorage(() => AsyncStorage),
      version: 2,
      migrate: (persisted: any, version) => {
        // v1 (Phase 12) had: answers, email, unlocks. v2 adds playbookProgress.
        if (!persisted) return persisted;
        if (version < 2) {
          return { ...persisted, playbookProgress: {} };
        }
        return persisted;
      },
    }
  )
);
