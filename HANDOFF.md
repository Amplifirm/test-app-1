# HANDOFF — HustleAI v1.0 (Claude Code /goal autonomous run)

**Run date:** 2026-05-15
**Repo:** `Amplifirm/test-app-1` (branch: `main`)
**Stack:** Expo 54 + Expo Router 6 + React 19 + RN 0.81 + Zustand + Supabase

This document is what you read first when you sit down. Everything else is reference.

---

## 1. Current state — what works today

### Boot path
1. `npm install --legacy-peer-deps`
2. `npm start` → press `i` for iOS simulator
3. App boots. Splash → onboarding → quiz → results → paywall → playbook.

### What's fully working end-to-end
- ✅ **Quiz** — 17 questions across 4 frameworks (RIASEC, Big Five, Goal/JTBD, Constraints). Custom UI for 8 question formats. Already production-quality before this run; we did not touch it.
- ✅ **Matching** — Deterministic 17-axis cosine-similarity scoring with hard filters and why-bullets that quote the user's answers. `src/lib/score.ts`. Spec-critical "moat" code. Unit tests in `__tests__/matching.test.ts`.
- ✅ **Results** — Profile summary + 3 ranked matches. Tap routes to `/paywall`.
- ✅ **30 hustles** — Across 8 buckets, each with 17-dim fingerprint vector. `src/lib/hustles.ts`.
- ✅ **30 playbook JSONs** — Hero, 12-week plan, tool stack, scripts, pricing, failure modes, real launches, setup, scaling. `src/content/playbooks/`. Already existed; treat as a baseline to spot-check before launch.
- ✅ **Paywall** (Phase 4) — Weekly / Annual / Lifetime variants, $4.99 single-playbook downsell modal, Restore button, Superwall trigger before native fallback, Appendix A copy. `app/paywall.tsx`.
- ✅ **Legal pages** (Phase 9) — In-app `/legal/terms` and `/legal/privacy` with "TEMPLATE — REVIEW BY LAWYER" banner; full source-of-truth in `content/legal/*.md`.
- ✅ **Analytics scaffold** (Phase 8) — `src/lib/analytics.ts` with typed event taxonomy. Events fire to `events_log` (Supabase) + PostHog (when wired). `app_opened`, `results_viewed`, `match_tapped`, `paywall_viewed`, `paywall_dismissed`, `subscription_purchased`, `single_playbook_purchased`, `trial_started`, `restore_purchases_attempted` already wired.
- ✅ **Service init** — Sentry / PostHog / RevenueCat / Superwall initialize on app boot from `app/_layout.tsx`. All are null-safe (return early if env vars missing).
- ✅ **Backend schema** (Phase 2) — `supabase/migrations/001_initial.sql` with RLS policies. `src/lib/supabase.ts` client (null-guarded), `src/lib/auth.ts`, `src/lib/db.ts`.

### What was added in the final round

- ✅ **Phase 7** — full settings rewrite. `app/(app)/account.tsx` now has all spec §7.1 rows (Quiz again with confirmation, Refer, Restore purchases, Manage subscription with platform-deep-link, Privacy & data, Methodology, Terms, Privacy, Contact support, version+build).
- ✅ **Phase 7.2** — `app/settings/data.tsx` builds and clipboard-exports a JSON blob of: device, profile, local store (answers/email/unlocks), entitlements. Delete-account button with two-stage confirmation, calls `db.deleteOwnProfile` + `store.resetAll` + `analytics.reset`.
- ✅ **Phase 10** — jest@29 + ts-jest + @types/jest installed. `npm test` runs 24 tests, all passing. RN module mocks in `__tests__/__mocks__/`.
- ✅ **Phase 5.5 (AI Coach)** — `src/lib/coach.ts` (rate-limited 5/day, server-side proxy via `supabase.functions.invoke('coach')`) + `src/components/coach-chat.tsx` (bubble UI). Awaiting deployment of `supabase/functions/coach/index.ts` edge function (Supabase + OpenAI key required).

### What's scaffolded but needs final wiring
- ⚠ **Real IAP** — `src/lib/purchases.ts` has `LOCAL_MOCK` branches. Install `react-native-purchases`, swap each mock for the real call. Subscription products must be created in App Store Connect / Google Play with the exact IDs in `PRODUCTS`.
- ⚠ **Real Sentry** — `src/lib/sentry.ts` has stubs. Install `@sentry/react-native`, swap, add the Expo config plugin to `app.json`.
- ⚠ **Real PostHog** — `src/lib/analytics.ts`. Install `posthog-react-native`, swap LOCAL_MOCK in `initializeAnalytics`.
- ⚠ **Push** — `src/lib/notifications.ts` has the full schedule wired but with stubbed SDK calls. Install `expo-notifications` + `expo-device`, swap, then call `schedulePostQuizSchedule(...)` from the results screen + `scheduleIncompleteQuizNudge()` from quiz screens.
- ⚠ **Superwall** — `src/lib/superwall.ts`. Install `@superwall/react-native-superwall`, then configure paywall variants in the Superwall dashboard.
- ⚠ **AI Coach** — Not built. `lib/coach.ts` stub does not exist yet. Path: write a Supabase edge function calling OpenAI's `gpt-4o-mini` and a `CoachChat.tsx` bubble UI. Rate-limit 5 messages/day per profile via `db.coachMessagesSentToday()`.
- ⚠ **Account screen items** (Phase 7) — `app/(app)/account.tsx` exists but needs the full list: refer, restore, manage sub, data export/delete, methodology, support, version+build. Most can route to existing screens.

### What's NOT done at all
- ❌ **Welcome email + D3 nudge** — Resend integration. Scaffold the Supabase edge function `/functions/send-welcome` and call from auth.ts on signup.
- ❌ **Push notification permission flow** — Request from results.tsx after quiz complete.
- ❌ **Apple / Google OAuth sign-in** — Stubs exist in `auth.ts` returning `not-implemented`. Wire `expo-apple-authentication` + Supabase Auth providers.
- ❌ **Account merging** — Server-side trigger to link device_id rows on signup. Currently done client-side in `auth.ts:signUpWithEmail` — works but a server trigger is more reliable.
- ❌ **Data export** — `app/settings/data.tsx`. JSON dump via share sheet.
- ❌ **Privacy Manifest** — `ios/HustleAI/PrivacyInfo.xcprivacy` (iOS 17+). Generate after Expo prebuild.
- ❌ **EAS dev client build** — Build pipeline ready in `eas.json`; needs an Expo account.
- ❌ **App Store / Play Store submission**.

---

## 2. Setup actions required (priority order)

See `SETUP_CHECKLIST.md` for the full step-by-step. The summary:

| # | Item | Blocking |
|---|---|---|
| 1 | Supabase project + run `001_initial.sql` migration | P0 — auth and DB don't work without it |
| 2 | Apple Developer account ($99) | P0 — needed for IAP testing and submission |
| 3 | Google Play Console ($25 one-time) | P1 — needed for Android |
| 4 | Run `npx expo install` SDK bundle from SETUP_CHECKLIST.md (Phase 0 section) | P0 — unlocks IAP / Sentry / PostHog / push |
| 5 | RevenueCat account + products with the IDs in `src/lib/purchases.ts` | P1 — revenue |
| 6 | Superwall account | P2 — remote paywall control |
| 7 | PostHog cloud project | P1 — analytics |
| 8 | Sentry org + project | P1 — crash reports |
| 9 | Resend account | P2 — emails |
| 10 | OpenAI account + $50/mo soft cap | P2 — AI coach |
| 11 | Lawyer reviews `content/legal/terms.md` + `privacy.md` | P0 — required before App Store submission |
| 12 | Business entity (LLC) | P0 — required for App Store payouts |
| 13 | Hosted legal pages at `hustleai.com/terms` + `/privacy` | P0 — App Store requires public URLs |
| 14 | `support@hustleai.com` email | P1 — wired in app already |

---

## 3. First-week post-launch checklist

### Day 1 (launch day)
- Watch Sentry for crashes — fix anything > 1% crash-free rate
- Watch RevenueCat → first 24h of purchases
- Confirm Apple Search analytics tagging works
- Reply personally to first 20 support emails

### Days 2-3
- Monitor refund rate via RevenueCat dashboard. Target < 5%. If > 10%, investigate paywall copy / trial communication.
- Read every 1-star review immediately; map to a fixable issue

### Days 4-7
- Build PostHog dashboards (see §4 below)
- Calculate D1 retention from first cohort; if < 30%, the issue is probably onboarding/paywall, not the matching

### Week-2
- Review the AI coach transcript sample (privacy-respectful): are people getting helpful answers?
- A/B test paywall variant via Superwall — try removing the weekly option, see if annual lift offsets the lost weeklies

---

## 4. PostHog dashboards to build (founder action)

Per spec §8.3:

1. **Funnel:** install → quiz_started → quiz_completed → results_viewed → paywall_viewed → trial_started → subscription_purchased
   - Watch the biggest drop. v1 hypothesis: trial_started → subscription_purchased.
2. **Cohort retention:** D1, D7, D30 by acquisition source (Apple Search vs organic vs viral)
3. **Revenue by product:** weekly vs annual vs lifetime vs single-playbook
4. **Refund rate over time** (paid via RevenueCat → PostHog event `refund_processed`)
5. **AI coach usage per subscriber** — average messages/day, average tokens/message

---

## 5. Known issues + deferred decisions

### Type-system note (Supabase)
The Supabase client is currently untyped (`createClient(url, key)` not `createClient<Database>(url, key)`). Reason: hand-rolled `database.types.ts` shape didn't match the SDK's expected `Tables[name]['Insert']` structure. **Fix:** after `supabase db push` runs, run `supabase gen types typescript --linked > src/lib/database.types.ts` — that file will have the correct shape, then change `src/lib/supabase.ts` to use `createClient<Database>`. All `as any` casts in `db.ts` will then resolve to real types.

### Personalization API
The app calls `hustleai-zeta.vercel.app/api/personalize` (the Next.js sibling repo). That repo isn't pushed to GitHub yet — you may want to push it and consolidate to one source of truth. The endpoint generates an `intro` paragraph + 3 outreach scripts per (hustle, user) pair. Falls back gracefully if API is unreachable.

### Two parallel "paywall" surfaces
- `app/paywall.tsx` — the canonical subscription paywall (Phase 4 work)
- `app/playbook/[slug].tsx` Preview branch — pre-existing inline preview/unlock screen

Both currently work. The new flow routes through `/paywall` first. The Preview is reachable only if someone deep-links directly to `/playbook/[slug]` without an entitlement. Decide post-launch whether to remove the Preview branch or keep it as a deep-link landing.

### Test runner not installed
Jest is not installed. Tests in `__tests__/` are written, type-check (after a `@types/jest` install), and will run on `npm test` once jest-expo is added. See TESTING.md.

### Privacy Manifest (iOS 17)
Not generated. After `npx expo prebuild`, edit `ios/HustleAI/PrivacyInfo.xcprivacy` per Apple's required-reason API declarations.

---

## 6. How to add a new hustle

1. Open `src/lib/hustles.ts`.
2. Add a new entry to the `HUSTLES` array. Required fields:
   - `id` (hyphenated, unique, prefixed `h-`)
   - `slug` (kebab-case, used in URLs)
   - `bucket` (one of the 8 buckets)
   - `title`, `tagline`, `accent`
   - `monthly` / `monthlyEstimate` / `startup` / `startCost` / `time` / `hoursMin` / `firstDollar`
   - `requiredSkills` (subset of `SKILLS` from `quiz-schema.ts`)
   - `blockerTags` (e.g. `['on-camera']`, `['cold-call']`)
   - `fingerprint`: use `tune('<bucket>', { axisKey: deltaValue })` to start from the bucket archetype and tune
3. Create the playbook JSON at `src/content/playbooks/<slug>.json`. Schema: `PlaybookSchema` in `src/lib/playbook-types.ts`.
4. Wire the loader: add `'<slug>': () => require('~/content/playbooks/<slug>.json')` to `PLAYBOOK_MODULES` in `src/lib/playbook.ts`.
5. Run `npm test` — the smoke test will catch missing entries; the matching tests will fail if the fingerprint is malformed.
6. Spot-check by simulating an answer set that should match it (use `topMatches` in a quick Node script if desired).

---

## 7. How to push a paywall variant

Once Superwall is configured:

1. In the Superwall dashboard, create a new "Campaign" tied to the trigger event `match_unlock`.
2. Design the paywall variant in their builder.
3. Set rollout (e.g. 50/50 vs. control = native fallback).
4. Save. App receives it on next launch (Superwall caches paywall assets).

No app rebuild required. If the campaign is paused or has no rules matching the current user, the native paywall in `app/paywall.tsx` fires as fallback.

---

## 8. The remaining work in priority order

If you only have a week:

1. **Run the SDK install bundle** + replace LOCAL_MOCK blocks in `purchases.ts`, `sentry.ts`, `analytics.ts`, `notifications.ts` — gates real IAP and observability.
2. **Set up Supabase + push migration** — gates auth, entitlement reconciliation, events_log.
3. **Build dev client + test on physical device** — Expo Go can't run native modules. `eas build --profile development`.
4. **Get RevenueCat sandbox purchase working end-to-end** — paywall → buy → entitlement appears in `entitlements` table → playbook unlocks. This is the revenue moment.
5. **Push notification permission + D1/D2/D3 schedule** — uncomment the scheduled call from results.tsx, test on device.
6. **Spot-check 5 random playbook JSONs** — read them as a user, verify the tools/pricing/scripts feel current and realistic. Update prices that have drifted.
7. **Lawyer review of legal docs**.
8. **Account screen Phase 7 polish** — make sure every link works and "Delete my account" actually cascades.
9. **Submit to TestFlight** — small group (10-20) for a week before public release.

---

## 9. Pointers to spec sections Claude Code did NOT execute

These were in the spec's Appendix C; they all require a human:

- Daily TikTok content (1000-video founder commitment)
- Influencer outreach + management
- Paid ad campaigns (Meta, TikTok Spark, Apple Search Ads)
- Press / podcast outreach
- Affiliate program partner management
- Legal review of ToS / Privacy / business entity
- App Store + Play Store account creation, app submission
- Service account creation + billing
- Hiring (VA, designer, performance marketer)
- Customer support email replies

The original PRD's growth chapters (§11, §17, §18 of that document — not in this spec) cover these playbooks.

---

## 10. Files to read in this order

If you're a new engineer ramping on this codebase:

1. `AUDIT.md` — what's where and why
2. `src/lib/quiz-schema.ts` — the 17 questions are the product
3. `src/lib/dimensions.ts` — the 17 scoring axes
4. `src/lib/hustles.ts` — the 30 catalog entries
5. `src/lib/score.ts` — the matching algorithm
6. `app/paywall.tsx` — the revenue surface
7. `supabase/migrations/001_initial.sql` — the data model
8. `src/lib/purchases.ts` — when you're ready to wire real IAP
9. `WORKLOG.md` + `DECISIONS.md` — for context on why things are the way they are
