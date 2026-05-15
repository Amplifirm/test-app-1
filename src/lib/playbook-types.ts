// Shared Playbook schema — used by:
//   - hustleai/scripts/generate-playbooks.ts (build-time generation)
//   - hustleai/app/api/personalize/route.ts (runtime personalization)
//   - hustleai-app/app/playbook/[slug].tsx (rendering)
//   - hustleai-app/src/lib/pdf.ts (PDF export)
//
// Schema v2 (phase-13): adds day-by-day breakdowns, mental models, operator
// interviews, case studies, FAQs, weekly metrics, gated scripts.
// All new fields are OPTIONAL so the existing 30 JSONs continue to parse —
// the playbook UI gracefully degrades to legacy rendering when a field is absent.

// ──────────────────────────────────────────────────────────────────────
// LEGACY (v1) — preserved for backwards compatibility
// ──────────────────────────────────────────────────────────────────────

export type PlaybookDayAction = {
  day?: string;            // optional day-of-week (legacy)
  action: string;
  minutes: number;
  success: string;         // what counts as done
};

export type PlaybookTool = {
  name: string;
  why: string;
  pricing: string;         // e.g. "Free → $42/mo"
};

export type PlaybookLaunch = {
  name: string;            // brand name OR operator name
  operator: string;        // e.g. "Marcus R."
  months: number;          // months to reach mrr
  mrr: string;             // e.g. "$4,100"
  channels: string[];      // 2-4 acquisition channels
  sourceUrl?: string;      // NEW — link to public source (Indie Hackers, Twitter) for proof
};

// ──────────────────────────────────────────────────────────────────────
// V2 — daily breakdown + retention assets
// ──────────────────────────────────────────────────────────────────────

export type PlaybookDay = {
  dayNumber: number;       // 1..90 — absolute day within the 90-day plan
  title: string;           // e.g. "Write your About paragraph"
  minutes: number;         // time-cost estimate
  description: string;     // 2–3 sentences: what + why
  successCriteria: string; // what counts as "marked done"
  resources?: string[];    // links/templates referenced (optional)
};

export type MetricGoal = {
  id: string;              // stable id for tracking, e.g. "w1-replies"
  label: string;           // human label, "Replies received"
  target: number;          // numeric goal
  unit: string;            // "replies" / "$" / "subscribers"
  week: number;            // 1..12 — which week this metric applies to
};

export type PlaybookWeek = {
  week: number;            // 1..12
  title: string;
  outcome?: string;        // NEW v2: one-line milestone description
  metric: string | MetricGoal; // legacy string OR v2 numeric metric
  actions?: PlaybookDayAction[]; // legacy v1 actions
  days?: PlaybookDay[];    // v2: 5–7 day items per week
  reward?: {
    kind: 'badge' | 'unlock' | 'template';
    label: string;
    assetId?: string;      // refs a ScriptTemplate.id or asset slug
  };
};

export type MentalModel = {
  id: string;
  title: string;           // "The compounding email lever"
  summary: string;         // 3–4 sentences explaining the framework
  when: string;            // when to apply it: "Week 2 when reply rate stalls"
};

export type OperatorQA = {
  id: string;
  name: string;            // REAL operator name — must be sourced from a public post
  role: string;            // e.g. "Founder, AcmeNewsletter"
  weeksToMRR: number;
  mrr: string;             // "$4,100/mo"
  transcript: string;      // 200–400 word text Q&A — first-person, conversational
  sourceUrl?: string;      // optional citation
};

export type CaseStudy = {
  id: string;
  title: string;
  before: string;          // 1–2 sentences: where they started
  after: string;           // 1–2 sentences + metric: where they ended up
  story: string;           // 200–400 words: the journey
  takeaway: string;        // 1–2 sentences: the principle to extract
  sourceUrl?: string;
};

export type FaqEntry = {
  id: string;
  question: string;
  answer: string;          // 60–150 words; troubleshooting-grade specific
};

export type ScriptTemplate = {
  id: string;
  label: string;           // "First-10-customers DM"
  body: string;            // copy-paste-ready, [placeholders]
  unlocksAtWeek: number;   // 1..12 — gated reveal
};

export type Playbook = {
  slug: string;
  hero: {
    thesis: string;
    marketSize: string;
    payingEvidence: string;
  };
  ninetyDay: PlaybookWeek[];
  toolStack: PlaybookTool[];
  firstTenCustomers: {
    channels: string[];
    script: string;
    cadence: string;
  };
  pricing: {
    starter: string;
    growth: string;
    premium: string;
    raisingRules: string;
  };
  failureModes: string[];
  realLaunches: PlaybookLaunch[];
  setup: {
    llc: string;
    payments: string;
    contracts: string;
    insurance?: string;
  };
  scaling: string;

  // ──── V2 retention + depth ─────────────────────────────────────────
  mentalModels?: MentalModel[];        // 3–5 frameworks
  operatorInterviews?: OperatorQA[];   // 2–3 Q&As
  caseStudies?: CaseStudy[];           // 2–3 deep dives
  faq?: FaqEntry[];                    // 8–12 troubleshooting entries
  weeklyMetrics?: MetricGoal[];        // numeric goals indexed by week
  scripts?: ScriptTemplate[];          // unlockable scripts gated by week
  community?: {
    discordUrl?: string;
    slackUrl?: string;
    cohortTag?: string;                // for grouping users in same playbook
  };
  meta?: {
    generatedAt?: string;              // ISO timestamp
    generator?: string;                // e.g. "hand-v1" | "gpt-4o-mini-v1"
    schemaVersion?: 2;
  };
};

// Runtime personalization layer (returned by /api/personalize)
export type PersonalizedLayer = {
  intro: string;       // one paragraph quoting user's actual answers
  scripts: {           // 3 outreach scripts tailored to user tone
    label: string;
    body: string;
  }[];
};
