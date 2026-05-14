// Shared Playbook schema — used by:
//   - hustleai/scripts/generate-playbooks.ts (build-time generation)
//   - hustleai/app/api/personalize/route.ts (runtime personalization)
//   - hustleai-app/app/playbook/[slug].tsx (rendering)
//   - hustleai-app/src/lib/pdf.ts (PDF export)

export type PlaybookDayAction = {
  day?: string;            // optional day-of-week
  action: string;
  minutes: number;
  success: string;         // what counts as done
};

export type PlaybookWeek = {
  week: number;            // 1..12
  title: string;
  actions: PlaybookDayAction[];
  metric: string;          // success metric for the week
};

export type PlaybookTool = {
  name: string;
  why: string;
  pricing: string;         // e.g. "Free → $42/mo"
};

export type PlaybookLaunch = {
  name: string;            // brand name
  operator: string;        // e.g. "Marcus R."
  months: number;          // months to reach mrr
  mrr: string;             // e.g. "$4,100"
  channels: string[];      // 2-4 acquisition channels
};

export type Playbook = {
  slug: string;
  hero: {
    thesis: string;            // 2-3 paragraphs: why this niche, why now
    marketSize: string;        // e.g. "1.3M solo lawyers in the US"
    payingEvidence: string;    // 1-2 sentences with named comps
  };
  ninetyDay: PlaybookWeek[];   // 12 weeks
  toolStack: PlaybookTool[];   // 5-8 tools
  firstTenCustomers: {
    channels: string[];        // 3-5 channels
    script: string;            // outreach copy template (with [placeholders])
    cadence: string;           // how many per day, expected response rate
  };
  pricing: {
    starter: string;
    growth: string;
    premium: string;
    raisingRules: string;
  };
  failureModes: string[];      // 6-8 specific ways this fails
  realLaunches: PlaybookLaunch[]; // 3 real comps
  setup: {
    llc: string;
    payments: string;
    contracts: string;
    insurance?: string;
  };
  scaling: string;             // 3-4 paragraphs on going beyond solo
};

// Runtime personalization layer (returned by /api/personalize)
export type PersonalizedLayer = {
  intro: string;       // one paragraph quoting user's actual answers
  scripts: {           // 3 outreach scripts tailored to user tone
    label: string;
    body: string;
  }[];
};
