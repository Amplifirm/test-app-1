import { DIM, VECTOR_LEN } from './dimensions';

export type Vector = number[]; // length VECTOR_LEN

export type Bucket =
  | 'content'
  | 'digital-products'
  | 'services'
  | 'micro-saas'
  | 'creator-services'
  | 'local-offline'
  | 'marketplace'
  | 'skills-as-service';

export const BUCKETS: { id: Bucket; label: string; sub: string }[] = [
  { id: 'content',           label: 'Content / Audience',   sub: 'Audience-first plays' },
  { id: 'digital-products',  label: 'Digital products',     sub: 'Templates, kits, courses' },
  { id: 'services',          label: 'Done-for-you services',sub: 'Retainers, agency work' },
  { id: 'micro-saas',        label: 'Micro-SaaS / AI tools',sub: 'Build something durable' },
  { id: 'creator-services',  label: 'Creator economy',      sub: 'UGC, clips, thumbnails' },
  { id: 'local-offline',     label: 'Local / offline',      sub: 'Wheels, water, wrenches' },
  { id: 'marketplace',       label: 'Reselling / arbitrage',sub: 'Flip, list, ship' },
  { id: 'skills-as-service', label: 'Skills-as-a-service',  sub: 'Tutoring, coaching, lessons' },
];

// ── Archetype fingerprints (length VECTOR_LEN, all 0..100) ─────────
// Order: R, I, A, S, E, C, Conscient, Extra, Open, IncomeTarget, Speed, Recurring, Risk, Sprint, Scale, Visibility, Team
const A = (
  R: number, I: number, Ar: number, S: number, E: number, C: number,
  Co: number, Ex: number, Op: number,
  IT: number, Sp: number, Re: number, Ri: number, Spr: number, Sc: number, Vi: number, Te: number,
): Vector => [R, I, Ar, S, E, C, Co, Ex, Op, IT, Sp, Re, Ri, Spr, Sc, Vi, Te];

const ARCH: Record<Bucket, Vector> = {
  // R I A S E C Co Ex Op IT Sp Re Ri Spr Sc Vi Te
  content:           A(20, 65, 75, 35, 30, 50,  70, 35, 55, 55, 25, 80, 30, 25, 50, 60, 25),
  'digital-products':A(35, 50, 80, 25, 40, 70,  75, 30, 60, 50, 50, 65, 35, 55, 45, 35, 25),
  services:          A(30, 50, 35, 55, 80, 70,  80, 65, 45, 70, 55, 35, 45, 35, 50, 60, 50),
  'micro-saas':      A(55, 85, 50, 25, 35, 60,  75, 35, 75, 75, 25, 90, 60, 30, 75, 35, 55),
  'creator-services':A(35, 35, 80, 45, 65, 45,  65, 70, 60, 55, 80, 30, 40, 70, 40, 80, 30),
  'local-offline':   A(85, 30, 25, 50, 60, 55,  75, 60, 35, 55, 85, 25, 35, 60, 40, 45, 30),
  marketplace:       A(55, 45, 35, 30, 70, 75,  75, 45, 50, 60, 65, 35, 55, 55, 50, 25, 30),
  'skills-as-service':A(25, 50, 45, 90, 50, 50, 65, 70, 55, 55, 70, 40, 30, 35, 30, 70, 25),
};

export type Hustle = {
  id: string;
  slug: string;
  bucket: Bucket;
  title: string;
  tagline: string;
  accent: string;
  // Money + time
  monthly: string;
  monthlyEstimate: number;
  startup: string;
  startCost: number;
  time: string;
  hoursMin: number;
  firstDollar: string;
  // Skill / blocker requirements
  requiredSkills: string[];
  blockerTags: string[];
  // 17-dim fingerprint
  fingerprint: Vector;
};

// Apply per-axis deltas to an archetype vector
function tune(arch: Bucket, deltas: Partial<Record<keyof typeof DIM, number>>): Vector {
  const v = ARCH[arch].slice();
  for (const k in deltas) {
    const idx = (DIM as any)[k];
    if (typeof idx === 'number') v[idx] = Math.max(0, Math.min(100, v[idx] + (deltas as any)[k]));
  }
  return v;
}

// ── HUSTLE CATALOG (30 across all 8 buckets) ──────────────────────────
export const HUSTLES: Hustle[] = [
  // ── 1. CONTENT / AUDIENCE (4) ──────────────────────────────────────
  {
    id: 'h-newsletter-lawyers', slug: 'newsletter-solo-lawyers', bucket: 'content',
    title: 'Newsletter for solo lawyers',
    tagline: 'Weekly digest of wins, tools, and AI workflows for the 1.3M solo practitioners in the US.',
    accent: 'Hot niche',
    monthly: '$3,400', monthlyEstimate: 3400, startup: '$0', startCost: 0,
    time: '4 hrs/wk', hoursMin: 4, firstDollar: '14 days',
    requiredSkills: ['Writing', 'Research'], blockerTags: [],
    fingerprint: tune('content', { I: +8, Recurring: +5 }),
  },
  {
    id: 'h-newsletter-pms', slug: 'newsletter-product-managers', bucket: 'content',
    title: 'Newsletter for senior PMs',
    tagline: 'High-signal weekly for the 400k Senior+ PMs paying for career edge.',
    accent: 'High-LTV audience',
    monthly: '$4,800', monthlyEstimate: 4800, startup: '$0', startCost: 0,
    time: '5 hrs/wk', hoursMin: 5, firstDollar: '21 days',
    requiredSkills: ['Writing', 'Research'], blockerTags: [],
    fingerprint: tune('content', { I: +10, IncomeTarget: +10 }),
  },
  {
    id: 'h-podcast-niche', slug: 'niche-podcast', bucket: 'content',
    title: 'Niche podcast (solo founder interviews)',
    tagline: 'A 30-min weekly Zoom show. Sponsors pay $400/episode by month 4.',
    accent: 'Audio-first',
    monthly: '$2,200', monthlyEstimate: 2200, startup: '$50', startCost: 50,
    time: '6 hrs/wk', hoursMin: 6, firstDollar: '60 days',
    requiredSkills: ['Talking to strangers', 'Research'], blockerTags: ['on-camera'],
    fingerprint: tune('content', { S: +15, E: +10, Visibility: -15, A: -10 }),
  },
  {
    id: 'h-substack-essays', slug: 'substack-essays', bucket: 'content',
    title: 'Paid essay Substack',
    tagline: 'Long-form weekly essays. Premium tier converts at 4–7%.',
    accent: 'Pure writing',
    monthly: '$1,900', monthlyEstimate: 1900, startup: '$0', startCost: 0,
    time: '6 hrs/wk', hoursMin: 6, firstDollar: '45 days',
    requiredSkills: ['Writing'], blockerTags: [],
    fingerprint: tune('content', { A: +5, Speed: -10 }),
  },

  // ── 2. DIGITAL PRODUCTS (4) ────────────────────────────────────────
  {
    id: 'h-notion-therapists', slug: 'notion-templates-therapists', bucket: 'digital-products',
    title: 'Notion templates for therapists',
    tagline: 'Compliance-friendly intake + session notes. Sold on Gumroad.',
    accent: 'Quick start',
    monthly: '$1,800', monthlyEstimate: 1800, startup: '$50', startCost: 50,
    time: '6 hrs/wk', hoursMin: 6, firstDollar: '21 days',
    requiredSkills: ['Design', 'Organizing'], blockerTags: [],
    fingerprint: tune('digital-products', { S: +5 }),
  },
  {
    id: 'h-figma-kits', slug: 'figma-ui-kits', bucket: 'digital-products',
    title: 'Figma UI kit for indie devs',
    tagline: 'Production-ready components. $39 one-time, no support.',
    accent: 'Designer cash',
    monthly: '$2,400', monthlyEstimate: 2400, startup: '$0', startCost: 0,
    time: '8 hrs/wk', hoursMin: 8, firstDollar: '30 days',
    requiredSkills: ['Design', 'Coding'], blockerTags: [],
    fingerprint: tune('digital-products', { I: +10, R: +5 }),
  },
  {
    id: 'h-prompt-pack', slug: 'prompt-packs', bucket: 'digital-products',
    title: 'AI prompt packs for marketers',
    tagline: 'Vertical-specific prompt libraries. $19–$49 per pack.',
    accent: 'Riding the wave',
    monthly: '$1,500', monthlyEstimate: 1500, startup: '$0', startCost: 0,
    time: '5 hrs/wk', hoursMin: 5, firstDollar: '14 days',
    requiredSkills: ['Writing', 'Research'], blockerTags: [],
    fingerprint: tune('digital-products', { I: +10, Open: +15, Speed: +10 }),
  },
  {
    id: 'h-niche-course', slug: 'niche-mini-course', bucket: 'digital-products',
    title: 'Mini-course on a niche skill',
    tagline: '4-hour course. $99–$199. Launched on email list.',
    accent: 'High margin',
    monthly: '$2,800', monthlyEstimate: 2800, startup: '$100', startCost: 100,
    time: '10 hrs/wk', hoursMin: 10, firstDollar: '60 days',
    requiredSkills: ['Writing', 'Tutoring', 'Video editing'], blockerTags: ['on-camera'],
    fingerprint: tune('digital-products', { S: +10, Visibility: +20 }),
  },

  // ── 3. DONE-FOR-YOU SERVICES (4) ───────────────────────────────────
  {
    id: 'h-cold-email', slug: 'cold-email-agency', bucket: 'services',
    title: 'Cold email infra for B2B agencies',
    tagline: 'DFY domain warmup + Instantly setup. $1.5k retainers.',
    accent: 'High margin',
    monthly: '$4,500', monthlyEstimate: 4500, startup: '$200', startCost: 200,
    time: '10 hrs/wk', hoursMin: 10, firstDollar: '30 days',
    requiredSkills: ['Sales', 'Spreadsheets'], blockerTags: ['cold-call'],
    fingerprint: tune('services', { Recurring: +15, Speed: -5 }),
  },
  {
    id: 'h-seo-audits', slug: 'seo-audits', bucket: 'services',
    title: 'SEO audits for local services',
    tagline: '$500 audit + $1k/mo retainer for ongoing work.',
    accent: 'Productized service',
    monthly: '$3,800', monthlyEstimate: 3800, startup: '$200', startCost: 200,
    time: '12 hrs/wk', hoursMin: 12, firstDollar: '21 days',
    requiredSkills: ['Research', 'Spreadsheets', 'Sales'], blockerTags: [],
    fingerprint: tune('services', { I: +10, R: -5 }),
  },
  {
    id: 'h-podcast-editing', slug: 'podcast-editing', bucket: 'services',
    title: 'Podcast editing service',
    tagline: '$200–$400 per episode. 4–8 shows per retainer.',
    accent: 'Quiet money',
    monthly: '$3,200', monthlyEstimate: 3200, startup: '$100', startCost: 100,
    time: '15 hrs/wk', hoursMin: 15, firstDollar: '21 days',
    requiredSkills: ['Video editing'], blockerTags: [],
    fingerprint: tune('services', { A: +20, E: -15, S: -10, Visibility: -20 }),
  },
  {
    id: 'h-web-dev-retainer', slug: 'web-dev-retainer', bucket: 'services',
    title: 'Webflow / Framer dev retainer',
    tagline: '2–3 marketing sites/month. $2k–$5k each.',
    accent: 'Skilled retainers',
    monthly: '$6,500', monthlyEstimate: 6500, startup: '$0', startCost: 0,
    time: '20 hrs/wk', hoursMin: 20, firstDollar: '30 days',
    requiredSkills: ['Coding', 'Design'], blockerTags: [],
    fingerprint: tune('services', { I: +10, A: +15, IncomeTarget: +15 }),
  },

  // ── 4. MICRO-SAAS / AI TOOLS (4) ───────────────────────────────────
  {
    id: 'h-voice-agent-dental', slug: 'ai-voice-agent-dental', bucket: 'micro-saas',
    title: 'AI voice agent for dental offices',
    tagline: 'Answer after-hours calls, book appointments. $299/mo per location.',
    accent: 'High ceiling',
    monthly: '$5,200', monthlyEstimate: 5200, startup: '$200', startCost: 200,
    time: '12 hrs/wk', hoursMin: 12, firstDollar: '45 days',
    requiredSkills: ['Coding', 'Sales'], blockerTags: [],
    fingerprint: tune('micro-saas', { E: +20, S: +5 }),
  },
  {
    id: 'h-listing-summarizer', slug: 'micro-saas-realtors', bucket: 'micro-saas',
    title: 'Listing summarizer for realtors',
    tagline: 'Paste MLS text → polished social copy. $19/mo per agent.',
    accent: 'Recurring',
    monthly: '$2,800', monthlyEstimate: 2800, startup: '$200', startCost: 200,
    time: '8 hrs/wk', hoursMin: 8, firstDollar: '40 days',
    requiredSkills: ['Coding', 'Writing'], blockerTags: [],
    fingerprint: tune('micro-saas', { A: +10 }),
  },
  {
    id: 'h-niche-scheduler', slug: 'niche-scheduler', bucket: 'micro-saas',
    title: 'Booking tool for mobile groomers',
    tagline: 'SMS-first scheduling for a vertical Calendly ignores. $29/mo.',
    accent: 'Under-served',
    monthly: '$3,100', monthlyEstimate: 3100, startup: '$500', startCost: 500,
    time: '15 hrs/wk', hoursMin: 15, firstDollar: '60 days',
    requiredSkills: ['Coding', 'Sales'], blockerTags: [],
    fingerprint: tune('micro-saas', { Risk: +5 }),
  },
  {
    id: 'h-ai-workflow', slug: 'ai-workflow-builder', bucket: 'micro-saas',
    title: 'Custom AI workflows for SMBs',
    tagline: 'Build n8n / Make automations for service businesses. $2k setup + $300/mo.',
    accent: 'Builder + sales',
    monthly: '$4,200', monthlyEstimate: 4200, startup: '$200', startCost: 200,
    time: '15 hrs/wk', hoursMin: 15, firstDollar: '30 days',
    requiredSkills: ['Coding', 'Sales', 'Spreadsheets'], blockerTags: [],
    fingerprint: tune('micro-saas', { E: +20, R: +10, Speed: +20 }),
  },

  // ── 5. CREATOR-ECONOMY SERVICES (3) ────────────────────────────────
  {
    id: 'h-ugc-dtc', slug: 'ugc-creator-dtc', bucket: 'creator-services',
    title: 'UGC creator for DTC brands',
    tagline: 'Film 30-second product clips with your phone. $150–$400/video.',
    accent: 'Quick cash',
    monthly: '$2,200', monthlyEstimate: 2200, startup: '$0', startCost: 0,
    time: '5 hrs/wk', hoursMin: 5, firstDollar: '10 days',
    requiredSkills: ['Video editing', 'Social media'], blockerTags: ['on-camera'],
    fingerprint: tune('creator-services', {}),
  },
  {
    id: 'h-thumbnails', slug: 'youtube-thumbnails', bucket: 'creator-services',
    title: 'YouTube thumbnail designer',
    tagline: 'Retainer with mid-tier creators. $50–$120/thumbnail.',
    accent: 'Behind the lens',
    monthly: '$3,000', monthlyEstimate: 3000, startup: '$0', startCost: 0,
    time: '12 hrs/wk', hoursMin: 12, firstDollar: '21 days',
    requiredSkills: ['Design', 'Social media'], blockerTags: [],
    fingerprint: tune('creator-services', { A: +10, Visibility: -30 }),
  },
  {
    id: 'h-short-clips', slug: 'short-form-clips', bucket: 'creator-services',
    title: 'Short-form clipper for podcasters',
    tagline: 'Cut 30 clips per podcast episode. $500/podcast retainer.',
    accent: 'Volume play',
    monthly: '$3,800', monthlyEstimate: 3800, startup: '$0', startCost: 0,
    time: '15 hrs/wk', hoursMin: 15, firstDollar: '14 days',
    requiredSkills: ['Video editing', 'Social media'], blockerTags: [],
    fingerprint: tune('creator-services', { Visibility: -25, A: +5 }),
  },

  // ── 6. LOCAL / OFFLINE (4) ─────────────────────────────────────────
  {
    id: 'h-pressure-washing', slug: 'pressure-washing', bucket: 'local-offline',
    title: 'Pressure-washing route',
    tagline: 'Driveways and decks. $250–$500/job, 2 jobs/Saturday.',
    accent: 'Saturday hustle',
    monthly: '$3,200', monthlyEstimate: 3200, startup: '$1000', startCost: 1000,
    time: '8 hrs/wk', hoursMin: 8, firstDollar: '7 days',
    requiredSkills: ['Fixing things', 'Fitness'], blockerTags: [],
    fingerprint: tune('local-offline', {}),
  },
  {
    id: 'h-mobile-detail', slug: 'mobile-detailing', bucket: 'local-offline',
    title: 'Mobile car detailing',
    tagline: 'You + truck + supplies. $150–$300/car, 1–2/day.',
    accent: 'Premium local',
    monthly: '$4,000', monthlyEstimate: 4000, startup: '$1500', startCost: 1500,
    time: '15 hrs/wk', hoursMin: 15, firstDollar: '10 days',
    requiredSkills: ['Fixing things', 'Sales'], blockerTags: [],
    fingerprint: tune('local-offline', { E: +10 }),
  },
  {
    id: 'h-vending', slug: 'vending-machines', bucket: 'local-offline',
    title: 'Bulk vending machine route',
    tagline: '4–8 machines at offices and laundromats. $50–$150/mo each.',
    accent: 'Passive-ish',
    monthly: '$1,400', monthlyEstimate: 1400, startup: '$3000', startCost: 3000,
    time: '5 hrs/wk', hoursMin: 5, firstDollar: '30 days',
    requiredSkills: ['Sales', 'Fixing things', 'Organizing'], blockerTags: [],
    fingerprint: tune('local-offline', { Recurring: +25, R: -10, Sprint: -10 }),
  },
  {
    id: 'h-dog-wash', slug: 'mobile-dog-wash', bucket: 'local-offline',
    title: 'Mobile dog wash',
    tagline: 'Subscription monthly + one-offs. $60–$120/dog.',
    accent: 'Recurring local',
    monthly: '$3,500', monthlyEstimate: 3500, startup: '$2000', startCost: 2000,
    time: '20 hrs/wk', hoursMin: 20, firstDollar: '14 days',
    requiredSkills: ['Fitness', 'Sales'], blockerTags: [],
    fingerprint: tune('local-offline', { Recurring: +20 }),
  },

  // ── 7. MARKETPLACE / RESELLER (3) ──────────────────────────────────
  {
    id: 'h-ebay-flips', slug: 'ebay-vintage-flips', bucket: 'marketplace',
    title: 'eBay vintage clothing flips',
    tagline: 'Thrift to listing. $40/hr blended once you have the eye.',
    accent: 'Saturday flips',
    monthly: '$2,000', monthlyEstimate: 2000, startup: '$500', startCost: 500,
    time: '10 hrs/wk', hoursMin: 10, firstDollar: '7 days',
    requiredSkills: ['Photography', 'Organizing'], blockerTags: ['inventory'],
    fingerprint: tune('marketplace', { A: +15 }),
  },
  {
    id: 'h-whatnot-toys', slug: 'whatnot-toys', bucket: 'marketplace',
    title: 'Whatnot live seller (toys/cards)',
    tagline: 'Live auctions 3x/week. $400–$1k per stream.',
    accent: 'Live commerce',
    monthly: '$3,500', monthlyEstimate: 3500, startup: '$1000', startCost: 1000,
    time: '12 hrs/wk', hoursMin: 12, firstDollar: '14 days',
    requiredSkills: ['Sales', 'Talking to strangers'], blockerTags: ['inventory', 'on-camera'],
    fingerprint: tune('marketplace', { E: +15, Visibility: +50, Extra: +20 }),
  },
  {
    id: 'h-fba-niche', slug: 'amazon-fba-niche', bucket: 'marketplace',
    title: 'Amazon FBA niche product',
    tagline: 'Source private-label, sell on Amazon. 18% net margins.',
    accent: 'Recurring SKU',
    monthly: '$2,800', monthlyEstimate: 2800, startup: '$5000', startCost: 5000,
    time: '8 hrs/wk', hoursMin: 8, firstDollar: '60 days',
    requiredSkills: ['Spreadsheets', 'Research', 'Sales'], blockerTags: ['inventory'],
    fingerprint: tune('marketplace', { Recurring: +20, Risk: +10 }),
  },

  // ── 8. SKILLS-AS-A-SERVICE (4) ─────────────────────────────────────
  {
    id: 'h-esl-tutoring', slug: 'esl-tutoring', bucket: 'skills-as-service',
    title: 'ESL tutoring on Cambly/Preply',
    tagline: '$15–$30/hr. Booked solid evenings + weekends.',
    accent: 'No setup',
    monthly: '$1,800', monthlyEstimate: 1800, startup: '$0', startCost: 0,
    time: '10 hrs/wk', hoursMin: 10, firstDollar: '7 days',
    requiredSkills: ['Languages', 'Tutoring'], blockerTags: ['on-camera'],
    fingerprint: tune('skills-as-service', { Speed: +10 }),
  },
  {
    id: 'h-music-lessons', slug: 'online-music-lessons', bucket: 'skills-as-service',
    title: 'Online music lessons',
    tagline: '$60–$100/hr. 10 students = full pipeline.',
    accent: 'Premium hourly',
    monthly: '$2,800', monthlyEstimate: 2800, startup: '$200', startCost: 200,
    time: '10 hrs/wk', hoursMin: 10, firstDollar: '14 days',
    requiredSkills: ['Music', 'Tutoring'], blockerTags: ['on-camera'],
    fingerprint: tune('skills-as-service', { A: +30 }),
  },
  {
    id: 'h-career-coaching', slug: 'career-coaching', bucket: 'skills-as-service',
    title: 'Career coaching for engineers',
    tagline: '$200–$400/hr. 8 clients = $10k+ mo.',
    accent: 'High hourly',
    monthly: '$8,000', monthlyEstimate: 8000, startup: '$0', startCost: 0,
    time: '12 hrs/wk', hoursMin: 12, firstDollar: '21 days',
    requiredSkills: ['Talking to strangers', 'Public speaking', 'Research'], blockerTags: ['on-camera'],
    fingerprint: tune('skills-as-service', { E: +15, IncomeTarget: +20 }),
  },
  {
    id: 'h-personal-training', slug: 'online-personal-training', bucket: 'skills-as-service',
    title: 'Online personal training',
    tagline: 'Custom programs + weekly check-ins. $99–$199/mo.',
    accent: 'Recurring coaching',
    monthly: '$4,200', monthlyEstimate: 4200, startup: '$100', startCost: 100,
    time: '15 hrs/wk', hoursMin: 15, firstDollar: '14 days',
    requiredSkills: ['Fitness', 'Tutoring'], blockerTags: ['on-camera'],
    fingerprint: tune('skills-as-service', { R: +20, Recurring: +20 }),
  },
];

export const getHustleBySlug = (slug: string) => HUSTLES.find((h) => h.slug === slug);
export const getHustleById = (id: string) => HUSTLES.find((h) => h.id === id);
