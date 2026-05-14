import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Playbook, PersonalizedLayer } from './playbook-types';
import { fetchPersonalized } from './api';
import { Answers } from './store';
import { buildUserVector, profileSummary } from './score';
import { getHustleBySlug } from './hustles';
import { QUESTIONS, getQuestion } from './quiz-schema';

// Bundle every playbook as a static import — RN supports JSON imports out of the box.
// Tradeoff: bundle bloat (~500KB), but no network needed for the 95% of value.

const PLAYBOOK_MODULES: Record<string, () => Playbook> = {
  'newsletter-solo-lawyers':       () => require('~/content/playbooks/newsletter-solo-lawyers.json'),
  'newsletter-product-managers':   () => require('~/content/playbooks/newsletter-product-managers.json'),
  'niche-podcast':                 () => require('~/content/playbooks/niche-podcast.json'),
  'substack-essays':               () => require('~/content/playbooks/substack-essays.json'),
  'notion-templates-therapists':   () => require('~/content/playbooks/notion-templates-therapists.json'),
  'figma-ui-kits':                 () => require('~/content/playbooks/figma-ui-kits.json'),
  'prompt-packs':                  () => require('~/content/playbooks/prompt-packs.json'),
  'niche-mini-course':             () => require('~/content/playbooks/niche-mini-course.json'),
  'cold-email-agency':             () => require('~/content/playbooks/cold-email-agency.json'),
  'seo-audits':                    () => require('~/content/playbooks/seo-audits.json'),
  'podcast-editing':               () => require('~/content/playbooks/podcast-editing.json'),
  'web-dev-retainer':              () => require('~/content/playbooks/web-dev-retainer.json'),
  'ai-voice-agent-dental':         () => require('~/content/playbooks/ai-voice-agent-dental.json'),
  'micro-saas-realtors':           () => require('~/content/playbooks/micro-saas-realtors.json'),
  'niche-scheduler':               () => require('~/content/playbooks/niche-scheduler.json'),
  'ai-workflow-builder':           () => require('~/content/playbooks/ai-workflow-builder.json'),
  'ugc-creator-dtc':               () => require('~/content/playbooks/ugc-creator-dtc.json'),
  'youtube-thumbnails':            () => require('~/content/playbooks/youtube-thumbnails.json'),
  'short-form-clips':              () => require('~/content/playbooks/short-form-clips.json'),
  'pressure-washing':              () => require('~/content/playbooks/pressure-washing.json'),
  'mobile-detailing':              () => require('~/content/playbooks/mobile-detailing.json'),
  'vending-machines':              () => require('~/content/playbooks/vending-machines.json'),
  'mobile-dog-wash':               () => require('~/content/playbooks/mobile-dog-wash.json'),
  'ebay-vintage-flips':            () => require('~/content/playbooks/ebay-vintage-flips.json'),
  'whatnot-toys':                  () => require('~/content/playbooks/whatnot-toys.json'),
  'amazon-fba-niche':              () => require('~/content/playbooks/amazon-fba-niche.json'),
  'esl-tutoring':                  () => require('~/content/playbooks/esl-tutoring.json'),
  'online-music-lessons':          () => require('~/content/playbooks/online-music-lessons.json'),
  'career-coaching':               () => require('~/content/playbooks/career-coaching.json'),
  'online-personal-training':      () => require('~/content/playbooks/online-personal-training.json'),
};

export function loadPlaybook(slug: string): Playbook | null {
  const loader = PLAYBOOK_MODULES[slug];
  if (!loader) return null;
  try { return loader(); } catch { return null; }
}

// ── Personalization layer (with AsyncStorage cache) ──────────────────
const CACHE_PREFIX = 'personalize:v1:';

function cacheKey(slug: string, answersHash: string) {
  return `${CACHE_PREFIX}${slug}:${answersHash}`;
}

// Stable fingerprint of the answers that drive personalization — used as cache key.
// We don't need cryptographic uniqueness; a simple stringify-then-hash is enough.
function hashAnswers(answers: Answers): string {
  const keys = Object.keys(answers).sort();
  const s = keys.map((k) => `${k}:${JSON.stringify(answers[k])}`).join('|');
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}

export async function loadPersonalizedFromCache(slug: string, answers: Answers): Promise<PersonalizedLayer | null> {
  try {
    const raw = await AsyncStorage.getItem(cacheKey(slug, hashAnswers(answers)));
    if (!raw) return null;
    return JSON.parse(raw) as PersonalizedLayer;
  } catch { return null; }
}

export async function fetchAndCachePersonalized(slug: string, answers: Answers): Promise<PersonalizedLayer | null> {
  const playbook = loadPlaybook(slug);
  const hustle = getHustleBySlug(slug);
  if (!playbook || !hustle) return null;

  const profile = profileSummary(answers);
  const userVec = buildUserVector(answers);

  // Build verbatim quotes — top 4 most informative answers
  const interestingQ = ['q5', 'q6', 'q7', 'q8', 'q12', 'q13'];
  const topAnswers = interestingQ
    .map((id) => {
      const q = getQuestion(id);
      const a = answers[id];
      if (!q || a === undefined) return null;
      return { qLabel: q.prompt, answer: q.answerLabel(a) };
    })
    .filter((x): x is { qLabel: string; answer: string } => x !== null)
    .slice(0, 4);

  try {
    const result = await fetchPersonalized({
      hustleSlug: slug,
      hustleTitle: hustle.title,
      hustleTagline: hustle.tagline,
      hustleThesis: playbook.hero.thesis,
      userProfile: {
        riasecLabel: profile.topRiasec[0]?.label || 'Investigative',
        riasecSecondary: profile.topRiasec[1]?.label,
        goalReadout: profile.goalReadout,
        skills: userVec.skills,
        hours: userVec.hours,
        budget: userVec.budget,
        topAnswers,
      },
    });
    // Cache it
    await AsyncStorage.setItem(cacheKey(slug, hashAnswers(answers)), JSON.stringify(result));
    return result;
  } catch (e) {
    console.warn('[personalize] fetch failed:', (e as Error).message);
    return null;
  }
}

// Fallback intro when the API is unavailable
export function fallbackPersonalized(slug: string, answers: Answers): PersonalizedLayer {
  const profile = profileSummary(answers);
  const r1 = profile.topRiasec[0]?.label || 'Investigative';
  const goal = profile.goalReadout || 'patient, solo-first';
  return {
    intro: `Based on your ${r1}-leaning profile and ${goal} goal vector, the standard playbook below is the right starting point. Skip the warm-up — your skill mix maps directly to the first 7 days.`,
    scripts: [
      {
        label: 'Cold DM to a first prospect',
        body: `Hey [Name] — I'm building a [niche] resource and noticed you're [specific signal]. Quick question — what's the most painful part of [their workflow] right now? No pitch, just trying to map the space.`,
      },
    ],
  };
}
