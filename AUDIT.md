# HustleAI codebase audit

**Date:** 2026-05-15
**Auditor:** Claude Code /goal autonomous run
**Codebase root:** `hustleai-app/` (Expo / React Native mobile app)

---

## TL;DR

The existing codebase is **substantially further along than the spec assumes**. Phases 3 (quiz + matching + results) and 5 (hustle catalog + 30 playbooks) are already implemented to production quality. The actual remaining work concentrates in Phases 2, 4, 6, 7, 8, 9, 10, 11. This roughly halves the remaining scope.

The existing matching algorithm is more sophisticated than the spec describes (17-dim vector with RIASEC + Big Five + Goal axes, family-weighted cosine + Jaccard, why-bullets quoting verbatim answers). Keep it.

---

## Tech stack (existing)

| Concern | Choice | Quality |
|---|---|---|
| Framework | Expo 54 + Expo Router 6 (file-based) | Keep |
| Runtime | React 19, RN 0.81 (new arch enabled) | Keep |
| State | Zustand 5 + persist via AsyncStorage | Keep |
| Styling | StyleSheet + design tokens at `src/design/tokens.ts` | Keep |
| TypeScript | strict mode already on | Keep |
| Path aliases | `@/*` → root, `~/*` → src/* | Keep |
| Fonts | Geist + Geist Mono via @expo-google-fonts | Keep |
| Animations | react-native-reanimated 4 | Keep |
| Haptics | expo-haptics via `src/hooks/useHaptic.ts` | Keep |
| Backend client | `src/lib/api.ts` → POSTs to `hustleai-zeta.vercel.app/api/personalize` | Keep, but this is the OTHER repo (`hustleai/` Next.js) |
| Storage | AsyncStorage + SecureStore not yet present | Add SecureStore for device_id |
| Bundle | Expo Router with stack navigator | Keep |

**Theme:** dark by default, ink/lime palette, single design tokens file.

---

## File-by-file (relevant files)

### Routing layer (`app/`)

| Path | Purpose | Verdict |
|---|---|---|
| `app/_layout.tsx` | Root layout, fonts, splash, store hydration | Keep — add Sentry+PostHog init here |
| `app/index.tsx` | Hero/landing | Read & check copy vs Appendix A |
| `app/onboarding/intro.tsx` | "We don't guess. We measure." | Audit copy vs spec |
| `app/onboarding/calibrate.tsx` | Setting baseline screen | Audit copy vs spec |
| `app/(quiz)/_layout.tsx` | Quiz stack layout | Keep |
| `app/(quiz)/q1-skills.tsx` … `q17-why-now.tsx` | All 17 quiz screens, custom UI per format | KEEP — production quality |
| `app/(quiz)/checkpoint-1.tsx` | After Q4: "Locking in your RIASEC code…" | Keep |
| `app/(quiz)/checkpoint-2.tsx` | After Q8: "Your goal vector is taking shape…" | Keep |
| `app/(quiz)/upgrade.tsx` | "Halfway gate" — deep-dive upsell (NOT subscription paywall) | Keep, but spec wants this misnamed: see `paywall.tsx` work below |
| `app/(quiz)/thinking.tsx` | Calculation animation | Keep |
| `app/results.tsx` | Results screen — profile + 3 matches with why-bullets | Keep — production quality |
| `app/playbook/[slug].tsx` | Dynamic playbook viewer | Keep — must add entitlement gate (currently unprotected) |
| `app/(app)/_layout.tsx` | Authenticated stack | Keep |
| `app/(app)/account.tsx` | Settings/account screen | Refactor to spec §7.1 requirements |
| `app/(app)/methodology.tsx` | "How we calculate this" page | Keep — audit copy vs spec §3.5 |
| `app/(app)/referrals.tsx` | Refer friends | Keep — but stub share sheet wiring |

### Source library (`src/lib/`)

| Path | Purpose | Verdict |
|---|---|---|
| `quiz-schema.ts` | All 17 questions, options, scoring deltas, answer labels | KEEP — production quality, exceeds spec |
| `dimensions.ts` | 17-axis dimension definitions (RIASEC + Personality + Goal) | KEEP |
| `score.ts` | Vector builder, hard filters, scoring, why-bullets, profile summary | KEEP — production quality, deterministic |
| `hustles.ts` | 30 hustles across 8 buckets with 17-dim fingerprints | KEEP — production quality |
| `playbook.ts` | Loads 30 bundled playbook JSONs + personalization layer with cache | KEEP |
| `playbook-types.ts` | Playbook schema types | KEEP |
| `api.ts` | Backend client → Vercel personalization API | KEEP — but `EXPO_PUBLIC_API_BASE` points at LAN IP in `.env` |
| `store.ts` | Zustand store: answers, email, unlocks | Refactor — extend with deviceId, region |
| `dimensions.ts` | (above) | KEEP |
| `pdf.ts` | PDF export of playbook | KEEP (out of spec, but useful) |

### Source components (`src/components/`)

| Path | Purpose | Verdict |
|---|---|---|
| `atoms.tsx` | Buttons, tags, icons | Keep |
| `count-up.tsx` | Number animation | Keep |
| `question-formats.tsx` | Quiz question UI per format | Keep |
| `quiz-frame.tsx` | Quiz wrapper component | Keep |
| `screen.tsx` | Screen wrapper, top bar, confidence band | Keep |

### Content (`src/content/playbooks/`)

30 JSON files, one per hustle. Each is a structured Playbook (hero, 12-week ninetyDay, toolStack, firstTenCustomers, pricing, failureModes, realLaunches, setup, scaling).

**Verdict:** Keep, spot-check a sample for quality.

---

## What spec requires that is MISSING

These are the actual remaining items. Phase numbering matches the spec.

### Phase 2 (Backend & data layer)
- ✗ `supabase/migrations/001_initial.sql` — full schema
- ✗ `lib/auth.ts` — device-id-first, then OAuth + email
- ✗ `lib/db.ts` — typed Supabase client wrapper
- ✗ `lib/database.types.ts` — schema-derived types
- ✗ Supabase project link (will require founder action)

### Phase 4 (Paywall + IAP)
- ✗ `lib/purchases.ts` — RevenueCat wiring
- ✗ `lib/superwall.ts` — Superwall init
- ✗ `app/paywall.tsx` — proper subscription paywall (NOT the existing quiz "upgrade" gate)
- ✗ Single-playbook downsell modal
- ✗ Entitlement gate on `app/playbook/[slug].tsx`
- ✗ RevenueCat webhook → Supabase edge function for entitlement reconciliation (future)

### Phase 5.5 (AI Coach)
- ✗ `lib/coach.ts` (rate-limited, server-side)
- ✗ `components/CoachChat.tsx` — bubble UI
- ✗ Edge function for OpenAI proxy
- Existing personalization API at `hustleai-zeta.vercel.app/api/personalize` is related but different

### Phase 6 (Push + retention)
- ✗ `expo-notifications` install
- ✗ Permission request after quiz completion
- ✗ Scheduled local notifications (15min, D1, D2, D3, D7)
- ✗ Push token storage in profiles
- ✗ In-app re-engagement (open to current playbook day on return after >24h)
- ✗ Welcome email scaffold (Resend or Supabase Auth)

### Phase 7 (Settings + edge cases)
- ⚠ `app/(app)/account.tsx` — exists, but needs spec-aligned items: refresh, refer, restore, manage sub, privacy/data, delete, methodology, support, version
- ✗ `app/settings/data.tsx` — GDPR/CCPA export + delete cascade
- ✗ Account merging on signup (device_id → profile_id)

### Phase 8 (Analytics + observability)
- ✗ `lib/analytics.ts` — PostHog wrapper with full event taxonomy
- ✗ Sentry init at root
- ✗ events_log fallback writes

### Phase 9 (Legal + compliance)
- ✗ `content/legal/terms.md`
- ✗ `content/legal/privacy.md`
- ✗ `app/legal/terms.tsx`
- ✗ `app/legal/privacy.tsx`
- ✗ `ios/HustleAI/PrivacyInfo.xcprivacy` — needs Expo prebuild or config plugin
- ⚠ Age rating in app.json (currently unset)

### Phase 10 (Tests)
- ✗ `__tests__/matching.test.ts` (the scoring algorithm needs deterministic regression tests)
- ✗ `__tests__/smoke.test.ts`
- ✗ React Native Testing Library setup
- ✗ `TESTING.md` with manual E2E checklist
- ✗ `PERFORMANCE.md`

### Phase 11 (Build + handoff)
- ✗ `eas.json`
- ✗ `HANDOFF.md`
- ✗ Version + build number wiring in settings

### Dev tooling
- ✗ ESLint config (spec asks for it; no .eslintrc in repo)
- ✗ Prettier config
- ✗ `.env.example` (only `.env` exists, gitignored)
- ✗ `scripts/` folder (none yet)

---

## Existing routing — visual flow

```
index (hero)
  → onboarding/intro
    → onboarding/calibrate
      → (quiz)/q1-skills
        → q2-saturday → q3-inbox → q4-shipping
          → (quiz)/checkpoint-1
            → q5-payment → q6-calls → q7-timing → q8-camera
              → (quiz)/checkpoint-2
                → q9-commit → q10-blockers
                  → (quiz)/upgrade (gate)
                    → q11-q17 (deep dive)
                      → (quiz)/thinking
                        → /results
                          → /playbook/[slug]
```

The `(app)` group contains the authenticated stack (account, methodology, referrals).

**Gap in flow:** there is no subscription paywall between `/results` (tap match) and `/playbook/[slug]`. That's the Phase 4 work.

---

## Decisions to be made (logged in DECISIONS.md as they arise)

1. **Replace the spec's simpler 4-framework quiz with the existing more sophisticated 17-dim quiz?** YES — existing is better.
2. **Keep `(quiz)/upgrade.tsx` as the "deep-dive upgrade" gate AND add a separate `app/paywall.tsx` for subscriptions?** YES — they serve different purposes.
3. **The Vercel backend at `hustleai-zeta.vercel.app`** — already serves personalization. Will we use this same backend for the Supabase edge functions, or run Supabase Functions separately? TBD — leaning toward Supabase Functions for consistency.
4. **Hard-write more playbooks vs. trust existing 30 JSON?** Spot-check existing first; if quality is high, no need.
5. **AI Coach** — server-side via the existing Vercel project, or a new Supabase Function? TBD.

---

## Pricing of remaining work (rough)

| Phase | Spec budget | Realistic given existing code |
|---|---|---|
| 1 (audit/setup) | 2h | 1h |
| 2 (backend) | 4h | 4h |
| 3 (quiz/results) | 4h | 30min (copy audit + entitlement gate only) |
| 4 (paywall/IAP) | 5h | 5h |
| 5 (playbooks) | 6h | 1h (spot-check + Coach stub) |
| 6 (push) | 3h | 3h |
| 7 (settings) | 2h | 2h |
| 8 (analytics) | 2h | 2h |
| 9 (legal) | 2h | 2h |
| 10 (testing) | 3h | 3h |
| 11 (build) | 2h | 2h |
| **TOTAL** | **35h** | **~26h** |

Still significant. Will need many small commits, and several phases will hit the "scaffold + write SETUP_CHECKLIST" path when external accounts aren't provisioned.
