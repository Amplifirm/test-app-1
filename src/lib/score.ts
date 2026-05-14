import {
  DIM, DIM_NAMES, VECTOR_LEN, FAMILY_WEIGHT,
  RIASEC_DIMS, PERSONALITY_DIMS, GOAL_DIMS, clamp,
} from './dimensions';
import { Answers } from './store';
import { Hustle, Vector, HUSTLES } from './hustles';
import { QUESTIONS, getQuestion } from './quiz-schema';

export type ProfileSummary = {
  topRiasec: { dim: number; label: string; value: number }[]; // top 2
  goalReadout: string; // e.g. "recurring-leaning, patient, solo-first"
  confidence: 'medium' | 'high';
  signalsCaptured: number;
  totalSignals: number;
};

export type UserVec = {
  vec: Vector;
  hours: number;
  budget: number;
  skills: string[];
  blockers: string[];
  confidence: 'medium' | 'high';
  signalsCaptured: number;
};

export type WhyBullet = {
  text: string;
  negative?: boolean;
  dim: number;
};

export type ScoredMatch = {
  hustle: Hustle;
  score: number;            // 0..98 (display)
  rawScore: number;         // 0..1 (internal)
  contribs: { dim: number; weight: number }[]; // ranked
  why: WhyBullet[];
};

// ──────────────────────────────────────────────────────────────────────
// USER VECTOR BUILDER
// ──────────────────────────────────────────────────────────────────────
export function buildUserVector(answers: Answers): UserVec {
  const v: Vector = new Array(VECTOR_LEN).fill(50);
  let skills: string[] = [];
  let blockers: string[] = [];
  let hours = 8;
  let budget = 200;
  let answered = 0;

  for (const q of QUESTIONS) {
    const a = answers[q.id];
    if (a === undefined || a === null) continue;
    if (Array.isArray(a) && a.length === 0) continue;
    if (typeof a === 'object' && !Array.isArray(a) && Object.keys(a).length === 0) continue;
    answered++;

    // q9 hours+budget pulled directly
    if (q.id === 'q9' && a && typeof a === 'object') {
      hours = a.hours ?? hours;
      budget = a.budget ?? budget;
    }

    const { deltas, skills: addS, blockers: addB } = q.score(a);
    deltas.forEach(({ dim, delta }) => { v[dim] = v[dim] + delta; });
    if (addS) skills.push(...addS);
    if (addB) blockers.push(...addB);
  }

  // map income_target axis from q5 + q15 implicit + q9 budget
  if (answers.q9?.budget >= 1000) v[DIM.IncomeTarget] += 10;
  if (answers.q9?.budget >= 5000) v[DIM.IncomeTarget] += 10;

  // clamp final values
  for (let i = 0; i < VECTOR_LEN; i++) v[i] = clamp(v[i]);

  const confidence: 'medium' | 'high' =
    QUESTIONS.filter((q) => q.phase === 'deep')
      .some((q) => answers[q.id] !== undefined) ? 'high' : 'medium';

  return {
    vec: v,
    hours, budget,
    skills: Array.from(new Set(skills)),
    blockers: Array.from(new Set(blockers)),
    confidence,
    signalsCaptured: answered,
  };
}

// ──────────────────────────────────────────────────────────────────────
// HARD FILTERS + SCORING
// ──────────────────────────────────────────────────────────────────────
function passesHardFilters(u: UserVec, h: Hustle): boolean {
  if (u.hours < h.hoursMin) return false;
  if (u.budget < h.startCost) return false;
  if (h.blockerTags.some((t) => u.blockers.includes(t))) return false;
  return true;
}

function cosineSubset(a: Vector, b: Vector, dims: number[]): number {
  let dot = 0, na = 0, nb = 0;
  for (const i of dims) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (!na || !nb) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

function jaccard(a: string[], b: string[]): number {
  if (!a.length && !b.length) return 0;
  const sa = new Set(a), sb = new Set(b);
  let inter = 0;
  sa.forEach((x) => { if (sb.has(x)) inter++; });
  const uni = sa.size + sb.size - inter;
  return uni ? inter / uni : 0;
}

function rankContribs(u: Vector, h: Vector): { dim: number; weight: number }[] {
  // For each scored dim, compute alignment (1 - normalized distance) times its family weight
  const families: Record<number, keyof typeof FAMILY_WEIGHT> = {};
  RIASEC_DIMS.forEach((d) => (families[d] = 'riasec'));
  PERSONALITY_DIMS.forEach((d) => (families[d] = 'personality'));
  GOAL_DIMS.forEach((d) => (families[d] = 'goal'));

  const out: { dim: number; weight: number }[] = [];
  for (let i = 0; i < VECTOR_LEN; i++) {
    const align = 1 - Math.abs(u[i] - h[i]) / 100;
    const fw = FAMILY_WEIGHT[families[i]] || 0.15;
    out.push({ dim: i, weight: align * fw });
  }
  return out.sort((a, b) => b.weight - a.weight);
}

export function scoreOne(u: UserVec, h: Hustle): ScoredMatch | null {
  if (!passesHardFilters(u, h)) return null;
  const sR = cosineSubset(u.vec, h.fingerprint, RIASEC_DIMS);
  const sG = cosineSubset(u.vec, h.fingerprint, GOAL_DIMS);
  const sP = cosineSubset(u.vec, h.fingerprint, PERSONALITY_DIMS);
  const sS = jaccard(u.skills, h.requiredSkills);
  const raw =
    sR * FAMILY_WEIGHT.riasec +
    sG * FAMILY_WEIGHT.goal +
    sP * FAMILY_WEIGHT.personality +
    sS * FAMILY_WEIGHT.skills;

  // Map raw (≈0.4..1) → display 60..98
  const displayPct = Math.round(60 + Math.max(0, Math.min(1, raw)) * 38);
  const contribs = rankContribs(u.vec, h.fingerprint);
  return { hustle: h, score: displayPct, rawScore: raw, contribs, why: [] };
}

export function topMatches(answers: Answers, n = 3): { user: UserVec; matches: ScoredMatch[] } {
  const user = buildUserVector(answers);
  const scored = HUSTLES
    .map((h) => scoreOne(user, h))
    .filter((m): m is ScoredMatch => m !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, n);

  scored.forEach((m, i) => {
    m.why = explain(answers, user, m, i);
  });

  return { user, matches: scored };
}

// ──────────────────────────────────────────────────────────────────────
// WHY EXPLANATIONS — quote the user's actual answers
// ──────────────────────────────────────────────────────────────────────
const FMT = {
  pct: (n: number) => `${Math.round(n)}%`,
};

type ExplainCtx = { answers: Answers; user: UserVec; m: ScoredMatch };

const POS_TEMPLATES: Record<number, (c: ExplainCtx) => string | null> = {
  [DIM.R]: (c) => c.user.vec[DIM.R] >= 60 && c.m.hustle.fingerprint[DIM.R] >= 60
    ? `You lean builder — this hustle is ${FMT.pct(c.m.hustle.fingerprint[DIM.R])}% hands-on craft work.` : null,
  [DIM.I]: (c) => c.user.vec[DIM.I] >= 60 && c.m.hustle.fingerprint[DIM.I] >= 60
    ? `You ranked research / puzzle-solving high — this hustle is ${FMT.pct(c.m.hustle.fingerprint[DIM.I])}% analytical.` : null,
  [DIM.A]: (c) => c.user.vec[DIM.A] >= 60 && c.m.hustle.fingerprint[DIM.A] >= 60
    ? `You pull toward craft and aesthetics — this hustle is ${FMT.pct(c.m.hustle.fingerprint[DIM.A])}% creative output.` : null,
  [DIM.S]: (c) => c.user.vec[DIM.S] >= 60 && c.m.hustle.fingerprint[DIM.S] >= 60
    ? `You light up around people — this hustle is ${FMT.pct(c.m.hustle.fingerprint[DIM.S])}% direct-to-human work.` : null,
  [DIM.E]: (c) => c.user.vec[DIM.E] >= 60 && c.m.hustle.fingerprint[DIM.E] >= 60
    ? `You're built for selling — this hustle is ${FMT.pct(c.m.hustle.fingerprint[DIM.E])}% sales-driven.` : null,
  [DIM.C]: (c) => c.user.vec[DIM.C] >= 60 && c.m.hustle.fingerprint[DIM.C] >= 60
    ? `You said "organized / focused" — this hustle is ${FMT.pct(c.m.hustle.fingerprint[DIM.C])}% systems work.` : null,

  [DIM.Conscient]: (c) => {
    const q4 = getQuestion('q4');
    const label = q4 && c.answers.q4 ? q4.answerLabel(c.answers.q4) : null;
    if (!label || c.user.vec[DIM.Conscient] < 60) return null;
    return `You said you're "${label}" with side projects — this hustle rewards finishers.`;
  },
  [DIM.Extra]: (c) => {
    const q6 = getQuestion('q6');
    const label = q6 && c.answers.q6 ? q6.answerLabel(c.answers.q6) : null;
    if (!label) return null;
    return `You said 6 client calls would leave you ${label} — and this hustle is ${FMT.pct(c.m.hustle.fingerprint[DIM.Extra])}% client-facing.`;
  },
  [DIM.Open]: (c) => {
    if (c.user.vec[DIM.Open] < 60) return null;
    const q12 = c.answers.q12 ? getQuestion('q12')?.answerLabel(c.answers.q12) : null;
    return q12
      ? `You picked ${q12} — this hustle leans novel.`
      : `You score high on novelty — this hustle has room to experiment.`;
  },

  [DIM.Recurring]: (c) => {
    const q5 = c.answers.q5 ? getQuestion('q5')?.answerLabel(c.answers.q5) : null;
    if (!q5 || c.m.hustle.fingerprint[DIM.Recurring] < 60) return null;
    return `You picked ${q5} as your dream payment — this hustle is ${FMT.pct(c.m.hustle.fingerprint[DIM.Recurring])}% recurring.`;
  },
  [DIM.Speed]: (c) => {
    const q7 = c.answers.q7 ? getQuestion('q7')?.answerLabel(c.answers.q7) : null;
    if (!q7) return null;
    return c.user.vec[DIM.Speed] >= 60
      ? `You said ${q7} — first dollar lands here in ${c.m.hustle.firstDollar}.`
      : null;
  },
  [DIM.Risk]: (c) => {
    if (c.user.vec[DIM.Risk] >= 60 && c.m.hustle.fingerprint[DIM.Risk] >= 50)
      return `You're up for variance — this hustle has the highest ceiling of your 3 matches.`;
    if (c.user.vec[DIM.Risk] < 40 && c.m.hustle.fingerprint[DIM.Risk] < 40)
      return `You want a floor, not a ceiling — this one is steady, not lottery.`;
    return null;
  },
  [DIM.Visibility]: (c) => {
    const q8 = c.answers.q8 ? getQuestion('q8')?.answerLabel(c.answers.q8) : null;
    if (!q8) return null;
    if (c.user.vec[DIM.Visibility] < 40 && c.m.hustle.fingerprint[DIM.Visibility] < 50)
      return `You said you're ${q8} on camera — this hustle is mostly behind-the-scenes.`;
    if (c.user.vec[DIM.Visibility] >= 65 && c.m.hustle.fingerprint[DIM.Visibility] >= 65)
      return `You're comfortable being public — this hustle leans into that (${FMT.pct(c.m.hustle.fingerprint[DIM.Visibility])}% public-facing).`;
    return null;
  },
  [DIM.Sprint]: (c) => {
    if (c.user.vec[DIM.Sprint] >= 65 && c.m.hustle.fingerprint[DIM.Sprint] >= 55)
      return `You picked "sprint then coast" — this hustle front-loads the work.`;
    return null;
  },
  [DIM.Scale]: (c) => {
    if (c.user.vec[DIM.Scale] < 40 && c.m.hustle.fingerprint[DIM.Scale] < 45)
      return `You want side-income, not an empire — this stays comfortable solo.`;
    if (c.user.vec[DIM.Scale] >= 65 && c.m.hustle.fingerprint[DIM.Scale] >= 60)
      return `You want scale — this is one of the few in your top 3 with real ceiling.`;
    return null;
  },
  [DIM.Team]: (c) => null,
  [DIM.IncomeTarget]: (c) => null,
};

const NEG_TEMPLATES: Record<number, (c: ExplainCtx) => string | null> = {
  [DIM.Visibility]: (c) => {
    if (c.user.vec[DIM.Visibility] < 40 && c.m.hustle.fingerprint[DIM.Visibility] >= 60)
      return `Lost points: this one requires being on-camera, and you'd rather not.`;
    return null;
  },
  [DIM.Recurring]: (c) => {
    if (c.user.vec[DIM.Recurring] >= 60 && c.m.hustle.fingerprint[DIM.Recurring] < 40)
      return `Lost points: income here is lumpy, but you picked recurring as your dream.`;
    return null;
  },
  [DIM.Speed]: (c) => {
    if (c.user.vec[DIM.Speed] >= 65 && c.m.hustle.firstDollar.includes('60')) {
      return `Lost points: first dollar takes ${c.m.hustle.firstDollar}, but you wanted cash fast.`;
    }
    return null;
  },
  [DIM.E]: (c) => {
    if (c.user.vec[DIM.E] < 40 && c.m.hustle.fingerprint[DIM.E] >= 65)
      return `Lost points: this leans heavy on selling, and you'd rather not.`;
    return null;
  },
  [DIM.R]: (c) => {
    if (c.user.vec[DIM.R] < 40 && c.m.hustle.fingerprint[DIM.R] >= 70)
      return `Lost points: this is hands-on physical work, and your answers leaned digital.`;
    return null;
  },
};

function explain(answers: Answers, user: UserVec, m: ScoredMatch, rank: number): WhyBullet[] {
  const ctx: ExplainCtx = { answers, user, m };
  const bullets: WhyBullet[] = [];

  // Positive bullets — pick top contributors that have templates
  for (const c of m.contribs) {
    if (bullets.length >= (rank === 0 ? 4 : 3)) break;
    const t = POS_TEMPLATES[c.dim];
    if (!t) continue;
    const txt = t(ctx);
    if (txt) bullets.push({ text: txt, dim: c.dim });
  }

  // Negative bullet for ranks 1 and 2 (matches #2 and #3 in 1-indexed)
  if (rank >= 1) {
    for (const dim of [DIM.Visibility, DIM.Recurring, DIM.E, DIM.Speed, DIM.R]) {
      const t = NEG_TEMPLATES[dim];
      const txt = t?.(ctx);
      if (txt) { bullets.push({ text: txt, dim, negative: true }); break; }
    }
  }

  // Fallback if no templates fired (rare): generic skill-overlap bullet
  if (bullets.length === 0) {
    const overlap = m.hustle.requiredSkills.filter((s) => user.skills.includes(s));
    if (overlap.length) {
      bullets.push({
        text: `You picked ${overlap.slice(0, 2).join(' + ')} — this hustle needs exactly that.`,
        dim: DIM.R,
      });
    } else {
      bullets.push({
        text: `Match driven by your vibe profile: it lines up across goal + work-style.`,
        dim: DIM.R,
      });
    }
  }

  return bullets;
}

// ──────────────────────────────────────────────────────────────────────
// PROFILE SUMMARY — for the results page callout
// ──────────────────────────────────────────────────────────────────────
export function profileSummary(answers: Answers): ProfileSummary {
  const u = buildUserVector(answers);
  const r = RIASEC_DIMS
    .map((i) => ({ dim: i, value: u.vec[i], label: DIM_NAMES[i] }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 2);
  const parts: string[] = [];
  if (u.vec[DIM.Recurring] >= 60) parts.push('recurring-leaning');
  else if (u.vec[DIM.Recurring] < 40) parts.push('lumpy-OK');
  if (u.vec[DIM.Speed] >= 60) parts.push('wants cash fast');
  else parts.push('patient');
  if (u.vec[DIM.Scale] < 40) parts.push('solo-first');
  else if (u.vec[DIM.Scale] >= 65) parts.push('scale-hungry');
  if (u.vec[DIM.Risk] >= 60) parts.push('high-variance OK');

  return {
    topRiasec: r,
    goalReadout: parts.join(', '),
    confidence: u.confidence,
    signalsCaptured: u.signalsCaptured,
    totalSignals: QUESTIONS.length,
  };
}
