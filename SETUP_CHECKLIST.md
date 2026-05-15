# SETUP CHECKLIST — actions the founder must take

Each item below requires a human (account creation, payment, OAuth approval, etc.) and cannot be automated by Claude Code. Order is roughly priority/dependency.

---

## P0 — Install SDKs (single command, when ready for EAS dev client)

Most of the lib files in `src/lib/` (purchases, superwall, analytics, sentry, notifications) are scaffolded with `LOCAL_MOCK` branches. They compile and run fine without their SDKs installed, but the real behavior (real IAP, real PostHog, real Sentry, real push) needs the native modules. These modules **cannot run in Expo Go** — they require an EAS dev client.

When you're ready, run:

```bash
cd hustleai-app
npx expo install \
  react-native-purchases \
  @superwall/react-native-superwall \
  posthog-react-native \
  @sentry/react-native \
  expo-notifications \
  expo-device
```

Then:

1. Replace each `LOCAL_MOCK` block in `src/lib/purchases.ts` / `superwall.ts` / `analytics.ts` / `sentry.ts` / `notifications.ts` with the commented-out real implementation right below it.
2. Add the Sentry config plugin to `app.json` plugins array: `["@sentry/react-native/expo", { /* options */ }]`
3. Build the dev client: `eas build --profile development --platform ios` (and Android).

---

## P0 — Required for app to function at all

### [ ] 1. Supabase project
1. Go to supabase.com → New project
2. Pick a region close to most users (US East / EU West)
3. From Project Settings → API, copy:
   - `Project URL` → set in `.env.local` as `EXPO_PUBLIC_SUPABASE_URL`
   - `anon public key` → set as `EXPO_PUBLIC_SUPABASE_ANON_KEY`
4. Optional: install Supabase CLI, then `supabase link --project-ref <ref>` from `hustleai-app/`
5. Apply the migration: `supabase db push` (uses `supabase/migrations/001_initial.sql`)
6. Optional: regenerate types — `supabase gen types typescript --linked > src/lib/database.types.ts`

### [ ] 2. Apple Developer Account
- $99/year — needed for App Store submission AND for IAP testing in sandbox
- Until this is set up, RevenueCat / paywall flow can only be tested with mocks

### [ ] 3. Google Play Console
- $25 one-time — needed for Android distribution AND for testing IAP

---

## P1 — Required for revenue

### [ ] 4. RevenueCat account
1. Go to revenuecat.com → sign up
2. Create project "HustleAI"
3. Add iOS app: bundle id `com.hustleai.app`
4. Add Android app: package id `com.hustleai.app`
5. In App Store Connect (after Apple account exists), create these products with these EXACT IDs:
   - `hustleai_weekly_699` — auto-renewing, weekly, $6.99
   - `hustleai_annual_4999` — auto-renewing, annual, $49.99, 3-day free trial
   - `hustleai_lifetime_12900` — non-consumable, $129
   - `hustleai_playbook_single_499` — consumable, $4.99
   - `hustleai_premium_1499` — consumable, $14.99
6. Create matching products in Google Play Console with same IDs
7. In RevenueCat → Project Settings → API Keys, copy the iOS and Android public SDK keys
8. Set in `.env.local`:
   - `EXPO_PUBLIC_REVENUECAT_IOS_KEY=...`
   - `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=...`
9. In RevenueCat, create an Entitlement called `pro` and attach the weekly/annual/lifetime products to it. Create `playbook_single` entitlement attached to the per-hustle consumable.
10. (Optional, post-launch) Wire RevenueCat webhook → Supabase edge function for server-side entitlement reconciliation.

### [ ] 5. Superwall account
1. superwall.com → sign up
2. Create app "HustleAI"
3. Copy API key, set as `EXPO_PUBLIC_SUPERWALL_KEY` in `.env.local`
4. (Post-launch) configure remote paywall variants via the Superwall dashboard
5. Native paywall in `app/paywall.tsx` is the fallback if no campaign is active

---

## P1 — Required for analytics & ops

### [ ] 6. PostHog account
1. posthog.com → sign up (cloud)
2. Create project "HustleAI"
3. Copy project API key, set as `EXPO_PUBLIC_POSTHOG_KEY` in `.env.local`
4. Set host: `EXPO_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com` (or EU)
5. (Post-launch) build the dashboards listed in `HANDOFF.md` §First-week post-launch checklist

### [ ] 7. Sentry account
1. sentry.io → sign up, create org
2. New Project → choose `React Native`
3. Copy DSN, set as `EXPO_PUBLIC_SENTRY_DSN` in `.env.local`
4. (Optional) Create release tracking integration; will need Sentry CLI in CI later

---

## P2 — Required for retention emails & AI coach

### [ ] 8. Resend account (transactional email)
1. resend.com → sign up
2. Add domain (or use their testing domain initially)
3. Copy API key, set as `RESEND_API_KEY` in Supabase secrets (server-side only — DO NOT prefix with EXPO_PUBLIC_)
4. From-address: `hello@hustleai.com` (or whatever domain you verify)

### [ ] 9. OpenAI account
1. platform.openai.com → sign up
2. Add a payment method
3. Set spending cap: **$50/month soft cap** initially (Settings → Billing → Limits)
4. Generate an API key, set as `OPENAI_API_KEY` in Supabase secrets (server-side only)
5. Default model: `gpt-4o-mini` (already wired in `lib/coach.ts` once that's built)

---

## P3 — Submission & legal

### [ ] 10. Legal review of `content/legal/terms.md` and `content/legal/privacy.md`
- Both files will be marked "TEMPLATE — REVIEW BY LAWYER BEFORE LAUNCH"
- A lawyer must sign off before App Store submission
- Add governing law, business entity, refund timeline, and contact info

### [ ] 11. Business entity (LLC or equivalent)
- Required for App Store payouts to a business account
- Required for legal docs (ToS, Privacy)
- Stripe / RevenueCat payouts to your name vs an entity is a tax decision — talk to an accountant

### [ ] 12. App Store / Play Store submission
- App icons, screenshots, screenshots, screenshots
- App Privacy questionnaire (matches the in-repo `PrivacyInfo.xcprivacy`)
- Subscription disclosure (3-day trial language, billing terms, restore purchases visibility) — handled in-paywall but must match listing
- Submit for review

### [ ] 13. Custom domain + hosted legal pages
- Host `terms.md` and `privacy.md` at e.g. hustleai.com/terms and hustleai.com/privacy
- App Store requires reachable public URLs (in-app rendering is allowed but not sufficient)

### [ ] 14. Support email
- Set up `support@hustleai.com` (Google Workspace or Fastmail)
- Wire into the in-app "Contact support" link in account screen
- Plan: founder responds personally to first 100 tickets

---

## Status snapshot

Updated by Claude Code as items complete. Founder updates as they take actions.

| # | Item | Status |
|---|---|---|
| 1 | Supabase project | ⬜ not started |
| 2 | Apple Developer | ⬜ not started |
| 3 | Google Play Console | ⬜ not started |
| 4 | RevenueCat | ⬜ not started |
| 5 | Superwall | ⬜ not started |
| 6 | PostHog | ⬜ not started |
| 7 | Sentry | ⬜ not started |
| 8 | Resend | ⬜ not started |
| 9 | OpenAI | ⬜ not started |
| 10 | Legal review | ⬜ not started |
| 11 | Business entity | ⬜ not started |
| 12 | App Store submission | ⬜ not started |
| 13 | Hosted legal pages | ⬜ not started |
| 14 | Support email | ⬜ not started |
