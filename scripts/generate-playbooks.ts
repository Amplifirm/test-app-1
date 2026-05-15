// scripts/generate-playbooks.ts
//
// Regenerates v2-schema playbooks for every hustle in the catalog that
// hasn't been hand-written. Uses gpt-4o-mini via the OpenAI Responses API.
//
// Usage:
//   OPENAI_API_KEY=sk-... npx ts-node scripts/generate-playbooks.ts
//   OPENAI_API_KEY=sk-... npx ts-node scripts/generate-playbooks.ts --slug=mobile-detailing
//   OPENAI_API_KEY=sk-... npx ts-node scripts/generate-playbooks.ts --dry-run
//
// Cost: ~$0.10 total for all 25 remaining playbooks at gpt-4o-mini pricing.
//
// The hand-written cold-email-agency.json is loaded as the few-shot template
// so the LLM matches schema + voice. After generation, ALWAYS spot-check
// 3-5 random files before committing.

import * as fs from 'fs';
import * as path from 'path';

const PLAYBOOKS_DIR = path.join(__dirname, '..', 'src', 'content', 'playbooks');
const FEW_SHOT_SLUG = 'cold-email-agency'; // the hero hand-written one

// Hustles already written by hand (skip these)
const HAND_WRITTEN = new Set<string>([
  'cold-email-agency',
  // Add the other 4 hero playbooks here as they're written:
  // 'newsletter-product-managers',
  // 'mobile-detailing',
  // 'ai-voice-agent-dental',
  // 'web-dev-retainer',
]);

type Hustle = { slug: string; title: string; tagline: string; monthly: string; hoursMin: number; startCost: number };

// Minimal duplicate of the hustles list — kept here to avoid importing the
// full app source from Node. Sync with src/lib/hustles.ts when adding hustles.
const HUSTLES: Hustle[] = [
  { slug: 'newsletter-solo-lawyers', title: 'Newsletter for solo lawyers', tagline: 'Weekly digest for the 1.3M solo practitioners.', monthly: '$3,400', hoursMin: 4, startCost: 0 },
  { slug: 'newsletter-product-managers', title: 'Newsletter for senior PMs', tagline: 'High-signal weekly for the 400k Senior+ PMs.', monthly: '$4,800', hoursMin: 5, startCost: 0 },
  { slug: 'niche-podcast', title: 'Niche podcast (solo founder interviews)', tagline: '30-min weekly Zoom show, $400/episode sponsors.', monthly: '$2,200', hoursMin: 6, startCost: 50 },
  { slug: 'substack-essays', title: 'Paid essay Substack', tagline: 'Long-form weekly. Premium converts at 4-7%.', monthly: '$1,900', hoursMin: 6, startCost: 0 },
  { slug: 'notion-templates-therapists', title: 'Notion templates for therapists', tagline: 'Compliance-friendly intake + session notes.', monthly: '$1,800', hoursMin: 6, startCost: 50 },
  { slug: 'figma-ui-kits', title: 'Figma UI kit for indie devs', tagline: 'Production-ready components. $39 one-time.', monthly: '$2,400', hoursMin: 8, startCost: 0 },
  { slug: 'prompt-packs', title: 'AI prompt packs for marketers', tagline: 'Vertical-specific prompt libraries.', monthly: '$1,500', hoursMin: 5, startCost: 0 },
  { slug: 'niche-mini-course', title: 'Mini-course on a niche skill', tagline: '4-hour course. $99-$199.', monthly: '$2,800', hoursMin: 10, startCost: 100 },
  { slug: 'seo-audits', title: 'SEO audits for local services', tagline: '$500 audit + $1k/mo retainer.', monthly: '$3,800', hoursMin: 12, startCost: 200 },
  { slug: 'podcast-editing', title: 'Podcast editing service', tagline: '$200-$400 per episode.', monthly: '$3,200', hoursMin: 15, startCost: 100 },
  { slug: 'web-dev-retainer', title: 'Webflow / Framer dev retainer', tagline: '2-3 marketing sites/mo. $2k-$5k each.', monthly: '$6,500', hoursMin: 20, startCost: 0 },
  { slug: 'ai-voice-agent-dental', title: 'AI voice agent for dental offices', tagline: 'Answer after-hours calls. $299/mo per location.', monthly: '$5,200', hoursMin: 12, startCost: 200 },
  { slug: 'micro-saas-realtors', title: 'Listing summarizer for realtors', tagline: 'Paste MLS text → polished social copy. $19/mo per agent.', monthly: '$2,800', hoursMin: 8, startCost: 200 },
  { slug: 'niche-scheduler', title: 'Booking tool for mobile groomers', tagline: 'SMS-first scheduling. $29/mo.', monthly: '$3,100', hoursMin: 15, startCost: 500 },
  { slug: 'ai-workflow-builder', title: 'Custom AI workflows for SMBs', tagline: 'n8n/Make automations. $2k setup + $300/mo.', monthly: '$4,200', hoursMin: 15, startCost: 200 },
  { slug: 'ugc-creator-dtc', title: 'UGC creator for DTC brands', tagline: '30-sec product clips. $150-$400/video.', monthly: '$2,200', hoursMin: 5, startCost: 0 },
  { slug: 'youtube-thumbnails', title: 'YouTube thumbnail designer', tagline: 'Retainer w/ mid-tier creators. $50-$120/thumbnail.', monthly: '$3,000', hoursMin: 12, startCost: 0 },
  { slug: 'short-form-clips', title: 'Short-form clipper for podcasters', tagline: '30 clips per episode. $500/podcast retainer.', monthly: '$3,800', hoursMin: 15, startCost: 0 },
  { slug: 'pressure-washing', title: 'Pressure-washing route', tagline: 'Driveways and decks. $250-$500/job.', monthly: '$3,200', hoursMin: 8, startCost: 1000 },
  { slug: 'mobile-detailing', title: 'Mobile car detailing', tagline: 'You + truck + supplies. $150-$300/car.', monthly: '$4,000', hoursMin: 15, startCost: 1500 },
  { slug: 'vending-machines', title: 'Bulk vending machine route', tagline: '4-8 machines. $50-$150/mo each.', monthly: '$1,400', hoursMin: 5, startCost: 3000 },
  { slug: 'mobile-dog-wash', title: 'Mobile dog wash', tagline: 'Subscription monthly + one-offs. $60-$120/dog.', monthly: '$3,500', hoursMin: 20, startCost: 2000 },
  { slug: 'ebay-vintage-flips', title: 'eBay vintage clothing flips', tagline: 'Thrift to listing. $40/hr blended.', monthly: '$2,000', hoursMin: 10, startCost: 500 },
  { slug: 'whatnot-toys', title: 'Whatnot live seller (toys/cards)', tagline: 'Live auctions 3x/week. $400-$1k per stream.', monthly: '$3,500', hoursMin: 12, startCost: 1000 },
  { slug: 'amazon-fba-niche', title: 'Amazon FBA niche product', tagline: 'Source private-label. 18% net margins.', monthly: '$2,800', hoursMin: 8, startCost: 5000 },
  { slug: 'esl-tutoring', title: 'ESL tutoring on Cambly/Preply', tagline: '$15-$30/hr.', monthly: '$1,800', hoursMin: 10, startCost: 0 },
  { slug: 'online-music-lessons', title: 'Online music lessons', tagline: '$60-$100/hr.', monthly: '$2,800', hoursMin: 10, startCost: 200 },
  { slug: 'career-coaching', title: 'Career coaching for engineers', tagline: '$200-$400/hr. 8 clients = $10k+ mo.', monthly: '$8,000', hoursMin: 12, startCost: 0 },
  { slug: 'online-personal-training', title: 'Online personal training', tagline: 'Custom programs + weekly check-ins. $99-$199/mo.', monthly: '$4,200', hoursMin: 15, startCost: 100 },
];

async function loadFewShot(): Promise<string> {
  const fewShotPath = path.join(PLAYBOOKS_DIR, `${FEW_SHOT_SLUG}.json`);
  const raw = fs.readFileSync(fewShotPath, 'utf-8');
  return raw;
}

function systemPrompt(): string {
  return `You write 90-day side-hustle playbooks for HustleAI, a $50/yr coaching app.
Output STRICT JSON only, no markdown, no commentary. Match the exact schema of the few-shot example.

Constraints:
- 12 weeks × 7 daily items = 84 day entries with dayNumber 1..84 (use dayNumber 1..84).
- Each day: title (verb-led), minutes (10-90), description (2-3 specific sentences with real tools/prices), successCriteria.
- Tools, prices, and platforms must be real (Stripe, Apollo, Notion, etc.) with current 2025-2026 pricing.
- No income guarantees. No "get rich" language.
- mentalModels: 3-5 frameworks with title, 3-4 sentence summary, when-to-apply guidance.
- operatorInterviews: 2 composite Q&As (use initials like "B.L." not full names), realistic numbers.
- caseStudies: 2 deep dives with before/after metrics.
- faq: 10 specific troubleshooting entries.
- scripts: 5 unlockable templates with unlocksAtWeek between 1-12.
- realLaunches: 3 composite operators, anonymized initials, plausible MRR.
- weeklyMetrics: 12 numeric goals (one per week).
- meta: { schemaVersion: 2, generator: "gpt-4o-mini-v1", generatedAt: "<ISO>" }`;
}

function userPrompt(hustle: Hustle, fewShot: string): string {
  return `Write a complete v2 playbook for this hustle, matching the schema and depth of the few-shot.

HUSTLE: ${hustle.title}
TAGLINE: ${hustle.tagline}
MEDIAN MRR: ${hustle.monthly}
HOURS/WEEK MIN: ${hustle.hoursMin}
STARTUP COST: $${hustle.startCost}
SLUG: ${hustle.slug}

FEW-SHOT TEMPLATE (cold-email-agency at v2 depth):
${fewShot}

Now output the complete JSON playbook for "${hustle.title}", same shape, same depth. STRICT JSON. No surrounding text.`;
}

async function callOpenAI(prompt: { system: string; user: string }): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error('OPENAI_API_KEY env var is required');
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: prompt.system },
        { role: 'user', content: prompt.user },
      ],
      temperature: 0.6,
      max_tokens: 8000,
    }),
  });
  if (!r.ok) throw new Error(`OpenAI ${r.status}: ${await r.text()}`);
  const data: any = await r.json();
  return data.choices?.[0]?.message?.content ?? '';
}

async function regenerateOne(hustle: Hustle, fewShot: string, dryRun: boolean): Promise<void> {
  const outPath = path.join(PLAYBOOKS_DIR, `${hustle.slug}.json`);
  console.log(`→ ${hustle.slug}…`);
  if (dryRun) {
    console.log(`   (dry-run, would write to ${outPath})`);
    return;
  }
  const raw = await callOpenAI({
    system: systemPrompt(),
    user: userPrompt(hustle, fewShot),
  });
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    console.error(`   ✗ JSON parse failed for ${hustle.slug}. Raw:`, raw.slice(0, 400));
    return;
  }
  parsed.slug = hustle.slug;
  if (!parsed.meta) parsed.meta = {};
  parsed.meta.schemaVersion = 2;
  parsed.meta.generator = 'gpt-4o-mini-v1';
  parsed.meta.generatedAt = new Date().toISOString();
  fs.writeFileSync(outPath, JSON.stringify(parsed, null, 2) + '\n', 'utf-8');
  console.log(`   ✓ wrote ${outPath}`);
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const slugArg = args.find((a) => a.startsWith('--slug='))?.split('=')[1];

  const targets = HUSTLES.filter((h) =>
    slugArg ? h.slug === slugArg : !HAND_WRITTEN.has(h.slug)
  );

  if (!targets.length) {
    console.log('Nothing to regenerate. All hustles are either hand-written or no slug match.');
    return;
  }

  console.log(`Regenerating ${targets.length} playbook(s)${dryRun ? ' (dry run)' : ''}.`);

  const fewShot = await loadFewShot();

  for (const h of targets) {
    try {
      await regenerateOne(h, fewShot, dryRun);
    } catch (e) {
      console.error(`   ✗ ${h.slug} failed:`, (e as Error).message);
    }
    // Light pacing
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log('Done. Spot-check 3-5 random files before committing.');
}

main().catch((e) => {
  console.error('Fatal:', e);
  process.exit(1);
});
