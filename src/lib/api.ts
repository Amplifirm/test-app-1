// Typed client for hustleai backend (hustleai-zeta.vercel.app)
// In dev, this hits the deployed Vercel project. To point at localhost during backend dev,
// set EXPO_PUBLIC_API_BASE in .env (e.g. http://192.168.1.10:4242).

import { PersonalizedLayer } from './playbook-types';

const API_BASE = (process.env.EXPO_PUBLIC_API_BASE as string) || 'https://hustleai-zeta.vercel.app';

type PersonalizeRequest = {
  hustleSlug: string;
  hustleTitle: string;
  hustleTagline: string;
  hustleThesis: string;
  userProfile: {
    riasecLabel: string;
    riasecSecondary?: string;
    goalReadout: string;
    skills: string[];
    hours: number;
    budget: number;
    topAnswers: { qLabel: string; answer: string }[];
  };
};

export async function fetchPersonalized(req: PersonalizeRequest, timeoutMs = 15000): Promise<PersonalizedLayer> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const r = await fetch(`${API_BASE}/api/personalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
      signal: controller.signal,
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return (await r.json()) as PersonalizedLayer;
  } finally {
    clearTimeout(timeout);
  }
}
