import { DIM } from './dimensions';

export type QuestionFormat =
  | 'chips-multi'
  | 'rank-5'
  | 'single-card'
  | 'four-card'
  | 'paired-card'
  | 'thrill-drain'
  | 'commit'
  | 'chart-pick';

export type Delta = { dim: number; delta: number };

export type Question = {
  id: string;
  phase: 'snap' | 'deep';
  index: number;
  prompt: string;
  subPrompt?: string;
  format: QuestionFormat;
  options?: Option[];
  required?: boolean;
  skippable?: boolean;
  // Compute scoring deltas + side effects (skills/blockers) from raw answer
  score: (answer: any) => { deltas: Delta[]; skills?: string[]; blockers?: string[] };
  // Render a human-readable summary of the user's answer ("you said X")
  answerLabel: (answer: any) => string;
};

export type Option = {
  id: string;
  label: string;
  sub?: string;
  emoji?: string;
};

// ── Q1 Skills ────────────────────────────────────────────────────────
export const SKILLS = [
  'Writing', 'Design', 'Coding', 'Talking to strangers',
  'Organizing', 'Photography', 'Tutoring', 'Video editing',
  'Sales', 'Cooking', 'Fitness', 'Music',
  'Languages', 'Research', 'Fixing things', 'Social media',
  'Spreadsheets', 'Public speaking',
];

const SKILL_DELTAS: Record<string, Delta[]> = {
  Writing: [{ dim: DIM.A, delta: 15 }, { dim: DIM.I, delta: 8 }],
  Design: [{ dim: DIM.A, delta: 18 }, { dim: DIM.R, delta: 5 }],
  Coding: [{ dim: DIM.I, delta: 18 }, { dim: DIM.R, delta: 10 }],
  'Talking to strangers': [{ dim: DIM.E, delta: 15 }, { dim: DIM.S, delta: 10 }, { dim: DIM.Extra, delta: 10 }],
  Organizing: [{ dim: DIM.C, delta: 18 }, { dim: DIM.Conscient, delta: 10 }],
  Photography: [{ dim: DIM.A, delta: 15 }, { dim: DIM.R, delta: 5 }],
  Tutoring: [{ dim: DIM.S, delta: 18 }],
  'Video editing': [{ dim: DIM.A, delta: 15 }, { dim: DIM.R, delta: 5 }],
  Sales: [{ dim: DIM.E, delta: 18 }, { dim: DIM.Extra, delta: 5 }],
  Cooking: [{ dim: DIM.R, delta: 15 }, { dim: DIM.A, delta: 5 }],
  Fitness: [{ dim: DIM.R, delta: 10 }, { dim: DIM.S, delta: 5 }],
  Music: [{ dim: DIM.A, delta: 18 }],
  Languages: [{ dim: DIM.S, delta: 10 }, { dim: DIM.I, delta: 8 }],
  Research: [{ dim: DIM.I, delta: 18 }, { dim: DIM.C, delta: 8 }],
  'Fixing things': [{ dim: DIM.R, delta: 18 }],
  'Social media': [{ dim: DIM.A, delta: 10 }, { dim: DIM.E, delta: 10 }, { dim: DIM.Visibility, delta: 10 }],
  Spreadsheets: [{ dim: DIM.C, delta: 18 }, { dim: DIM.I, delta: 8 }],
  'Public speaking': [{ dim: DIM.E, delta: 15 }, { dim: DIM.S, delta: 10 }, { dim: DIM.Visibility, delta: 15 }],
};

// ── Q2 Saturday rank ────────────────────────────────────────────────
const RANK_DELTA = [30, 15, 0, -15, -25]; // by position 0..4

// ── Q3 Inbox emoji chips ────────────────────────────────────────────
const INBOX_OPTS: (Option & { d: Delta[] })[] = [
  { id: 'energized', label: 'Energized', emoji: '🔥', d: [{ dim: DIM.Conscient, delta: 10 }, { dim: DIM.C, delta: 8 }] },
  { id: 'focused',   label: 'Focused',   emoji: '🎯', d: [{ dim: DIM.Conscient, delta: 15 }, { dim: DIM.C, delta: 15 }] },
  { id: 'organized', label: 'Organized', emoji: '🗂️', d: [{ dim: DIM.C, delta: 18 }, { dim: DIM.Conscient, delta: 12 }] },
  { id: 'anxious',   label: 'Anxious',   emoji: '😬', d: [{ dim: DIM.Conscient, delta: -5 }] },
  { id: 'drained',   label: 'Drained',   emoji: '😴', d: [{ dim: DIM.Conscient, delta: -15 }, { dim: DIM.Extra, delta: -5 }] },
  { id: 'overwhelmed', label: 'Overwhelmed', emoji: '🌀', d: [{ dim: DIM.C, delta: -15 }, { dim: DIM.Conscient, delta: -10 }] },
  { id: 'avoidant',  label: 'Avoidant',  emoji: '🤐', d: [{ dim: DIM.Conscient, delta: -15 }] },
  { id: 'ready',     label: 'Ready to ship', emoji: '🚀', d: [{ dim: DIM.Conscient, delta: 18 }, { dim: DIM.C, delta: 10 }] },
];

// ── Q4 Shipping habit ───────────────────────────────────────────────
const SHIP_OPTS: (Option & { d: Delta[] })[] = [
  { id: 'never',   label: 'Never shipped one',     sub: 'Lots of ideas, none out the door.',
    d: [{ dim: DIM.Conscient, delta: -25 }, { dim: DIM.Open, delta: 5 }] },
  { id: 'stalled', label: 'Started one, stalled',  sub: 'I get to 80% and freeze.',
    d: [{ dim: DIM.Conscient, delta: -5 }, { dim: DIM.Open, delta: 10 }] },
  { id: 'few',     label: 'A few finished',        sub: 'Some wins, some duds.',
    d: [{ dim: DIM.Conscient, delta: 10 }, { dim: DIM.Open, delta: 5 }] },
  { id: 'finisher',label: "I'm a finisher",        sub: 'If I start, it ships.',
    d: [{ dim: DIM.Conscient, delta: 25 }, { dim: DIM.Open, delta: -5 }] },
];

// ── Q5 Dream payment ─────────────────────────────────────────────────
const PAYMENT_OPTS: (Option & { d: Delta[] })[] = [
  { id: 'fifty',  label: '$19 from 50 strangers', sub: 'A wave of small bings.',
    d: [{ dim: DIM.Recurring, delta: 35 }, { dim: DIM.Risk, delta: -10 }, { dim: DIM.Scale, delta: 5 }] },
  { id: 'one3k',  label: 'One $3k client',        sub: 'One Stripe ping, hot meal.',
    d: [{ dim: DIM.Recurring, delta: -20 }, { dim: DIM.Speed, delta: 15 }, { dim: DIM.Risk, delta: 5 }] },
  { id: 'gigs',   label: '$400 quick gigs',       sub: 'Hustle in, hustle out.',
    d: [{ dim: DIM.Recurring, delta: -30 }, { dim: DIM.Speed, delta: 25 }, { dim: DIM.Sprint, delta: 15 }] },
  { id: 'exit',   label: '$50k acquisition',      sub: 'Sold the thing, onto next.',
    d: [{ dim: DIM.Recurring, delta: -10 }, { dim: DIM.Risk, delta: 25 }, { dim: DIM.Scale, delta: 30 }, { dim: DIM.Sprint, delta: 10 }] },
];

// ── Q6 Six calls ─────────────────────────────────────────────────────
const CALLS_OPTS: (Option & { d: Delta[] })[] = [
  { id: 'buzzing', label: 'Buzzing',                  sub: 'Could do six more.',
    d: [{ dim: DIM.Extra, delta: 25 }, { dim: DIM.S, delta: 15 }, { dim: DIM.E, delta: 15 }] },
  { id: 'fine',    label: 'Fine, I’m good',          sub: 'Steady through.',
    d: [{ dim: DIM.Extra, delta: 10 }, { dim: DIM.S, delta: 5 }] },
  { id: 'drained', label: 'Drained, need recovery',   sub: 'I need a dark room.',
    d: [{ dim: DIM.Extra, delta: -15 }, { dim: DIM.Visibility, delta: -10 }] },
  { id: 'nope',    label: "I'd never schedule 6",     sub: 'I avoid the calendar.',
    d: [{ dim: DIM.Extra, delta: -30 }, { dim: DIM.S, delta: -15 }, { dim: DIM.E, delta: -15 }, { dim: DIM.Visibility, delta: -20 }] },
];

// ── Q7 Time-to-money paired ──────────────────────────────────────────
const TIMING_OPTS: (Option & { d: Delta[] })[] = [
  { id: 'fast',  label: '$200 in 2 weeks',
    d: [{ dim: DIM.Speed, delta: 30 }, { dim: DIM.Sprint, delta: 15 }] },
  { id: 'slow',  label: '$2k in 2 months',
    d: [{ dim: DIM.Speed, delta: -25 }, { dim: DIM.Sprint, delta: -10 }, { dim: DIM.Recurring, delta: 10 }] },
];

// ── Q8 Camera ────────────────────────────────────────────────────────
const CAMERA_OPTS: (Option & { d: Delta[]; blocker?: string })[] = [
  { id: 'born',   label: 'Born for it',           d: [{ dim: DIM.Visibility, delta: 30 }, { dim: DIM.Extra, delta: 10 }] },
  { id: 'can',    label: 'I can do it',           d: [{ dim: DIM.Visibility, delta: 15 }] },
  { id: 'must',   label: 'Only if I must',        d: [{ dim: DIM.Visibility, delta: -10 }] },
  { id: 'no',     label: 'Hard no',               d: [{ dim: DIM.Visibility, delta: -30 }], blocker: 'on-camera' },
];

// ── Q9 Commit (hours + budget) ───────────────────────────────────────
export const BUDGET_TIERS = [
  { v: 0,    label: '$0',   sub: 'Bootstrap' },
  { v: 200,  label: '$200', sub: 'Lean' },
  { v: 1000, label: '$1k',  sub: 'Serious' },
  { v: 5000, label: '$5k+', sub: 'All-in' },
];

// ── Q10 Blockers (skippable) ────────────────────────────────────────
const BLOCKER_OPTS: (Option & { tag: string; d?: Delta[] })[] = [
  { id: 'b-cold',     label: 'Cold call',         tag: 'cold-call' },
  { id: 'b-camera',   label: 'On camera',         tag: 'on-camera',   d: [{ dim: DIM.Visibility, delta: -15 }] },
  { id: 'b-inventory',label: 'Hold inventory',    tag: 'inventory' },
  { id: 'b-code',     label: 'Code',              tag: 'code' },
  { id: 'b-clients',  label: 'Manage clients',    tag: 'client-facing', d: [{ dim: DIM.S, delta: -10 }] },
  { id: 'b-long',     label: 'Wait > 60 days',    tag: 'long-wait',    d: [{ dim: DIM.Speed, delta: 15 }] },
];

// ── Q11 Workspace (deep-dive) ────────────────────────────────────────
const WORKSPACE_OPTS: (Option & { d: Delta[] })[] = [
  { id: 'workshop', label: 'Workshop',     sub: 'Tools, materials, mess.', d: [{ dim: DIM.R, delta: 25 }] },
  { id: 'lab',      label: 'Lab',          sub: 'Screens, data, charts.',  d: [{ dim: DIM.I, delta: 25 }] },
  { id: 'studio',   label: 'Studio',       sub: 'Light, lens, soundproof.', d: [{ dim: DIM.A, delta: 25 }] },
  { id: 'sheets',   label: 'Spreadsheet wall', sub: 'Rows, columns, dashboards.', d: [{ dim: DIM.C, delta: 25 }] },
];

// ── Q12 Two pitches ──────────────────────────────────────────────────
const PITCH_OPTS: (Option & { d: Delta[] })[] = [
  { id: 'boring',  label: 'The boring proven one', sub: 'Newsletter. Known to work.',
    d: [{ dim: DIM.Open, delta: -15 }, { dim: DIM.Risk, delta: -10 }] },
  { id: 'wild',    label: 'The wild new one',      sub: 'AI voice agent. Untested.',
    d: [{ dim: DIM.Open, delta: 25 }, { dim: DIM.Risk, delta: 15 }] },
];

// ── Q13 Five years ──────────────────────────────────────────────────
const FIVE_OPTS: (Option & { d: Delta[] })[] = [
  { id: 'chill', label: 'Just me + chill',         sub: 'Comfortable, no boss.',
    d: [{ dim: DIM.Scale, delta: -25 }, { dim: DIM.Team, delta: -25 }] },
  { id: 'max',   label: 'Just me + maxed out',     sub: 'Solo, optimized for $.',
    d: [{ dim: DIM.Scale, delta: 15 }, { dim: DIM.Team, delta: -15 }] },
  { id: 'team',  label: 'Small team (2–5)',        sub: 'I want collaborators.',
    d: [{ dim: DIM.Scale, delta: 25 }, { dim: DIM.Team, delta: 25 }] },
  { id: 'sold',  label: 'Sold + onto next',        sub: 'Build, exit, repeat.',
    d: [{ dim: DIM.Scale, delta: 30 }, { dim: DIM.Team, delta: 10 }, { dim: DIM.Risk, delta: 15 }] },
];

// ── Q14 DM thrill/drain ─────────────────────────────────────────────
// Each DM scored thrill (+) or drain (-)
const DMS: { id: string; label: string; sub: string; thrill: Delta[]; drain: Delta[] }[] = [
  { id: 'complaint', label: '"This isn\'t working for me…"',  sub: 'A complaint',
    thrill: [{ dim: DIM.S, delta: 10 }, { dim: DIM.E, delta: 5 }],
    drain:  [{ dim: DIM.S, delta: -10 }] },
  { id: 'buyer',     label: '"How do I buy this?"',           sub: 'A buying question',
    thrill: [{ dim: DIM.E, delta: 20 }],
    drain:  [{ dim: DIM.E, delta: -15 }] },
  { id: 'coaching',  label: '"Can I pick your brain?"',        sub: 'A coaching ask',
    thrill: [{ dim: DIM.S, delta: 25 }],
    drain:  [{ dim: DIM.S, delta: -15 }] },
  { id: 'partner',   label: '"Want to partner on…"',           sub: 'A partnership offer',
    thrill: [{ dim: DIM.E, delta: 15 }, { dim: DIM.Scale, delta: 10 }],
    drain:  [{ dim: DIM.E, delta: -10 }] },
];

// ── Q15 Variance paired ─────────────────────────────────────────────
const VARIANCE_OPTS: (Option & { d: Delta[] })[] = [
  { id: 'steady', label: 'Steady $2k/mo',     sub: 'Forever and ever.',
    d: [{ dim: DIM.Risk, delta: -25 }, { dim: DIM.Recurring, delta: 10 }] },
  { id: 'shot',   label: '1-in-3 shot at $10k/mo', sub: 'Could miss it, could land.',
    d: [{ dim: DIM.Risk, delta: 25 }, { dim: DIM.IncomeTarget, delta: 15 }] },
];

// ── Q16 Effort curve ────────────────────────────────────────────────
const EFFORT_OPTS: (Option & { d: Delta[] })[] = [
  { id: 'sprint', label: 'Sprint then coast', sub: 'Hard launch, then mostly autopilot.',
    d: [{ dim: DIM.Sprint, delta: 25 }] },
  { id: 'climb',  label: 'Steady climb',      sub: 'Consistent every week.',
    d: [{ dim: DIM.Sprint, delta: -5 }] },
  { id: 'burn',   label: 'Slow burn',         sub: 'Compound years before payoff.',
    d: [{ dim: DIM.Sprint, delta: -25 }, { dim: DIM.Speed, delta: -20 }] },
];

// ── Q17 Why now ─────────────────────────────────────────────────────
const WHY_OPTS: (Option & { tag: string })[] = [
  { id: 'stuck',   label: 'Stuck at my job',   tag: 'stuck' },
  { id: 'layoff',  label: 'Layoff anxiety',    tag: 'layoff' },
  { id: 'baby',    label: 'New baby costs',    tag: 'baby' },
  { id: 'fu',      label: 'FU-money',          tag: 'fu' },
  { id: 'bored',   label: 'Bored / curious',   tag: 'bored' },
];

// Helper to expose option lists to UI
export const OPTS = {
  inbox: INBOX_OPTS,
  shipping: SHIP_OPTS,
  payment: PAYMENT_OPTS,
  calls: CALLS_OPTS,
  timing: TIMING_OPTS,
  camera: CAMERA_OPTS,
  blocker: BLOCKER_OPTS,
  workspace: WORKSPACE_OPTS,
  pitch: PITCH_OPTS,
  five: FIVE_OPTS,
  dms: DMS,
  variance: VARIANCE_OPTS,
  effort: EFFORT_OPTS,
  why: WHY_OPTS,
};

// ─────────────────────────────────────────────────────────────────────
// QUESTION SCHEMA
// ─────────────────────────────────────────────────────────────────────
export const QUESTIONS: Question[] = [
  // ── SNAP QUIZ (10 questions) ──
  {
    id: 'q1', phase: 'snap', index: 1, required: true,
    prompt: 'What are you secretly good at?',
    subPrompt: 'Pick at least 3. The boring ones make the most money.',
    format: 'chips-multi',
    score: (a: string[]) => {
      const deltas: Delta[] = [];
      (a || []).forEach((s) => { (SKILL_DELTAS[s] || []).forEach((d) => deltas.push(d)); });
      return { deltas, skills: a || [] };
    },
    answerLabel: (a: string[]) => (a && a.length ? a.slice(0, 3).join(', ') : 'no skills picked'),
  },
  {
    id: 'q2', phase: 'snap', index: 2, required: true,
    prompt: "Saturday, no plans. Rank these.",
    subPrompt: "Drag the one you'd most enjoy to the top.",
    format: 'rank-5',
    options: [
      { id: 'build',  label: 'Build a thing' },
      { id: 'solve',  label: 'Solve a puzzle' },
      { id: 'pretty', label: 'Make something pretty' },
      { id: 'help',   label: 'Help a friend' },
      { id: 'sell',   label: 'Sell something' },
    ],
    score: (a: string[]) => {
      const deltas: Delta[] = [];
      const RIASEC_MAP: Record<string, number> = {
        build: DIM.R, solve: DIM.I, pretty: DIM.A, help: DIM.S, sell: DIM.E,
      };
      (a || []).forEach((id, i) => {
        const d = RIASEC_MAP[id];
        if (d !== undefined && RANK_DELTA[i] !== undefined) {
          deltas.push({ dim: d, delta: RANK_DELTA[i] });
        }
      });
      return { deltas };
    },
    answerLabel: (a: string[]) => (a && a[0] ? `you ranked "${a[0]}" first` : 'no rank'),
  },
  {
    id: 'q3', phase: 'snap', index: 3, required: true,
    prompt: 'Your inbox at 9am makes you feel…',
    subPrompt: 'Pick 1–3. Be honest.',
    format: 'chips-multi',
    options: INBOX_OPTS,
    score: (a: string[]) => {
      const deltas: Delta[] = [];
      (a || []).forEach((id) => {
        const opt = INBOX_OPTS.find((o) => o.id === id);
        if (opt) deltas.push(...opt.d);
      });
      return { deltas };
    },
    answerLabel: (a: string[]) => {
      if (!a || !a.length) return 'nothing';
      const names = a.map((id) => INBOX_OPTS.find((o) => o.id === id)?.label.toLowerCase()).filter(Boolean);
      return names.join(', ');
    },
  },
  {
    id: 'q4', phase: 'snap', index: 4, required: true,
    prompt: 'You ship side projects…',
    format: 'single-card',
    options: SHIP_OPTS,
    score: (a: string) => {
      const o = SHIP_OPTS.find((x) => x.id === a);
      return { deltas: o?.d || [] };
    },
    answerLabel: (a: string) => SHIP_OPTS.find((o) => o.id === a)?.label.toLowerCase() || '—',
  },
  {
    id: 'q5', phase: 'snap', index: 5, required: true,
    prompt: 'Pick your dream payment notification.',
    format: 'four-card',
    options: PAYMENT_OPTS,
    score: (a: string) => {
      const o = PAYMENT_OPTS.find((x) => x.id === a);
      return { deltas: o?.d || [] };
    },
    answerLabel: (a: string) => `"${PAYMENT_OPTS.find((o) => o.id === a)?.label || '—'}"`,
  },
  {
    id: 'q6', phase: 'snap', index: 6, required: true,
    prompt: 'After 6 client calls you feel…',
    format: 'single-card',
    options: CALLS_OPTS,
    score: (a: string) => {
      const o = CALLS_OPTS.find((x) => x.id === a);
      return { deltas: o?.d || [] };
    },
    answerLabel: (a: string) => `"${CALLS_OPTS.find((o) => o.id === a)?.label || '—'}"`,
  },
  {
    id: 'q7', phase: 'snap', index: 7, required: true,
    prompt: "I'd rather earn…",
    format: 'paired-card',
    options: TIMING_OPTS,
    score: (a: string) => {
      const o = TIMING_OPTS.find((x) => x.id === a);
      return { deltas: o?.d || [] };
    },
    answerLabel: (a: string) => `"${TIMING_OPTS.find((o) => o.id === a)?.label || '—'}"`,
  },
  {
    id: 'q8', phase: 'snap', index: 8, required: true,
    prompt: 'On camera, you are…',
    format: 'four-card',
    options: CAMERA_OPTS,
    score: (a: string) => {
      const o = CAMERA_OPTS.find((x) => x.id === a);
      return { deltas: o?.d || [], blockers: o?.blocker ? [o.blocker] : undefined };
    },
    answerLabel: (a: string) => `"${CAMERA_OPTS.find((o) => o.id === a)?.label || '—'}"`,
  },
  {
    id: 'q9', phase: 'snap', index: 9, required: true,
    prompt: 'How much can you actually commit?',
    subPrompt: 'Be honest. No SaaS at 2 hrs/wk.',
    format: 'commit',
    score: () => ({ deltas: [] }), // hard filters, stored separately
    answerLabel: (a: { hours: number; budget: number }) =>
      a ? `${a.hours} hrs/wk · $${a.budget} budget` : '—',
  },
  {
    id: 'q10', phase: 'snap', index: 10, skippable: true,
    prompt: "Won't do.",
    subPrompt: "Skip if you're flexible.",
    format: 'chips-multi',
    options: BLOCKER_OPTS,
    score: (a: string[]) => {
      const deltas: Delta[] = [];
      const blockers: string[] = [];
      (a || []).forEach((id) => {
        const opt = BLOCKER_OPTS.find((o) => o.id === id);
        if (opt) {
          blockers.push(opt.tag);
          if (opt.d) deltas.push(...opt.d);
        }
      });
      return { deltas, blockers };
    },
    answerLabel: (a: string[]) =>
      a && a.length ? a.map((id) => BLOCKER_OPTS.find((o) => o.id === id)?.label).join(', ') : 'nothing — all flexible',
  },
  // ── DEEP DIVE (7 questions) ──
  {
    id: 'q11', phase: 'deep', index: 11,
    prompt: 'Pick the workspace that pleases you.',
    format: 'four-card',
    options: WORKSPACE_OPTS,
    score: (a: string) => {
      const o = WORKSPACE_OPTS.find((x) => x.id === a);
      return { deltas: o?.d || [] };
    },
    answerLabel: (a: string) => WORKSPACE_OPTS.find((o) => o.id === a)?.label || '—',
  },
  {
    id: 'q12', phase: 'deep', index: 12,
    prompt: 'Two pitches — which excites you?',
    format: 'paired-card',
    options: PITCH_OPTS,
    score: (a: string) => {
      const o = PITCH_OPTS.find((x) => x.id === a);
      return { deltas: o?.d || [] };
    },
    answerLabel: (a: string) => `"${PITCH_OPTS.find((o) => o.id === a)?.label || '—'}"`,
  },
  {
    id: 'q13', phase: 'deep', index: 13,
    prompt: '5 years from now, your hustle is…',
    format: 'four-card',
    options: FIVE_OPTS,
    score: (a: string) => {
      const o = FIVE_OPTS.find((x) => x.id === a);
      return { deltas: o?.d || [] };
    },
    answerLabel: (a: string) => `"${FIVE_OPTS.find((o) => o.id === a)?.label || '—'}"`,
  },
  {
    id: 'q14', phase: 'deep', index: 14,
    prompt: 'This DM thrills you or drains you.',
    subPrompt: 'Tap each.',
    format: 'thrill-drain',
    score: (a: Record<string, 'thrill' | 'drain'>) => {
      const deltas: Delta[] = [];
      DMS.forEach((dm) => {
        const v = a?.[dm.id];
        if (v === 'thrill') deltas.push(...dm.thrill);
        else if (v === 'drain') deltas.push(...dm.drain);
      });
      return { deltas };
    },
    answerLabel: (a: Record<string, string>) => {
      const thrills = Object.entries(a || {}).filter(([_, v]) => v === 'thrill').length;
      return `${thrills} thrill, ${Object.keys(a || {}).length - thrills} drain`;
    },
  },
  {
    id: 'q15', phase: 'deep', index: 15,
    prompt: 'Steady $2k/mo OR shot at $10k/mo?',
    format: 'paired-card',
    options: VARIANCE_OPTS,
    score: (a: string) => {
      const o = VARIANCE_OPTS.find((x) => x.id === a);
      return { deltas: o?.d || [] };
    },
    answerLabel: (a: string) => `"${VARIANCE_OPTS.find((o) => o.id === a)?.label || '—'}"`,
  },
  {
    id: 'q16', phase: 'deep', index: 16,
    prompt: 'Your effort curve.',
    format: 'chart-pick',
    options: EFFORT_OPTS,
    score: (a: string) => {
      const o = EFFORT_OPTS.find((x) => x.id === a);
      return { deltas: o?.d || [] };
    },
    answerLabel: (a: string) => `"${EFFORT_OPTS.find((o) => o.id === a)?.label || '—'}"`,
  },
  {
    id: 'q17', phase: 'deep', index: 17,
    prompt: 'Why now?',
    subPrompt: 'Pick all that fit. Used for flavor, not scoring.',
    format: 'chips-multi',
    options: WHY_OPTS,
    score: () => ({ deltas: [] }), // context only
    answerLabel: (a: string[]) =>
      a && a.length ? a.map((id) => WHY_OPTS.find((o) => o.id === id)?.label).join(', ') : '—',
  },
];

export const SNAP_QUESTIONS = QUESTIONS.filter((q) => q.phase === 'snap');
export const DEEP_QUESTIONS = QUESTIONS.filter((q) => q.phase === 'deep');
export const TOTAL_SIGNALS = QUESTIONS.length; // 17

// Lookup helpers
export const getQuestion = (id: string) => QUESTIONS.find((q) => q.id === id);
