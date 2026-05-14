import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Answers = Record<string, any>;

type State = {
  answers: Answers;
  email: string | null;
  unlocks: string[]; // playbook slugs; if includes '__all__' user is on subscription
  setAnswer: (id: string, value: any) => void;
  setEmail: (e: string) => void;
  unlock: (slug: string, all?: boolean) => void;
  resetQuiz: () => void;
  resetAll: () => void;
  isUnlocked: (slug: string) => boolean;
};

export const useApp = create<State>()(
  persist(
    (set, get) => ({
      answers: {},
      email: null,
      unlocks: [],
      setAnswer: (id, value) =>
        set((s) => ({ answers: { ...s.answers, [id]: value } })),
      setEmail: (email) => set({ email }),
      unlock: (slug, all = false) =>
        set((s) => {
          const next = new Set(s.unlocks);
          if (all) next.add('__all__');
          else next.add(slug);
          return { unlocks: Array.from(next) };
        }),
      resetQuiz: () => set({ answers: {} }),
      resetAll: () => set({ answers: {}, email: null, unlocks: [] }),
      isUnlocked: (slug) => {
        const u = get().unlocks;
        return u.includes('__all__') || u.includes(slug);
      },
    }),
    {
      name: 'hustleai_v1',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);
