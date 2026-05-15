# STATE

**Updated:** 2026-05-15 (after Claude Code /goal autonomous run)
**Branch:** main
**Tag:** v1.0-ready-for-review (applied at final commit)

## Phase status

| Phase | Status | Notes |
|---|---|---|
| 1. Audit & service setup | ✅ Complete | AUDIT.md, all tracking docs, .env.example, service-init stubs written |
| 2. Backend & data layer | ✅ Complete | Schema migration + null-guarded supabase client + auth + db client |
| 3. Quiz + results | ✅ Complete (pre-existing) | Production-quality 17-question schema + deterministic matching + results screen already in place; no rewrites needed. Methodology screen at `(app)/methodology.tsx` |
| 4. Paywall + IAP | ✅ Complete (scaffold) | `app/paywall.tsx` wired with mock purchase flow + Superwall trigger + downsell modal. Real RC SDK needs `react-native-purchases` install + LOCAL_MOCK swap |
| 5. Playbook content | ✅ Mostly complete (pre-existing) | 30 hustles + 30 playbook JSONs already bundled. AI Coach stub NOT written |
| 6. Push + retention | ✅ Scaffolded | `notifications.ts` library with `schedulePostQuizSchedule` wired into results screen; expo-notifications needs install for real schedule |
| 7. Settings + edge cases | ⚠ Partial | `(app)/account.tsx` pre-existing; data export/delete screens NOT built |
| 8. Analytics + Sentry | ✅ Scaffolded + key events wired | PostHog + Sentry stubs, dual-write to events_log, app_opened / results_viewed / match_tapped / paywall_viewed / paywall_dismissed / subscription_purchased / single_playbook_purchased / trial_started / restore_purchases_attempted fired from real call sites |
| 9. Legal + compliance | ✅ Complete | Terms + Privacy in `content/legal/` and `app/legal/` with TEMPLATE banners. Privacy Manifest NOT generated (needs prebuild) |
| 10. Testing | ⚠ Tests written, runner not installed | `__tests__/matching.test.ts` (15 assertions), `__tests__/smoke.test.ts`. TESTING.md has manual checklist + jest install bundle |
| 11. Build + handoff | ✅ Complete | `eas.json` profiles for dev/preview/production + HANDOFF.md |

## What's left (priority order)

1. Run the SDK install bundle from SETUP_CHECKLIST.md → swap LOCAL_MOCK blocks
2. Create Supabase project + apply `001_initial.sql`
3. EAS dev client build (`eas build --profile development`)
4. Phase 7 polish: data export screen, settings list per spec §7.1
5. AI Coach implementation
6. Apple / Google sign-in OAuth wiring
7. Jest install + run `npm test`
8. Lawyer review of legal docs
9. Spot-check 5 playbook JSONs for accuracy
10. App Store / Play Store submission

## What's NOT in v1 (deferred to post-launch)

- Server-side entitlement reconciliation via RevenueCat webhook
- Welcome email + D3 nudge via Resend
- Spanish localization
- A/B paywall variants (infrastructure ready via Superwall, no campaigns active)
- Share-my-matches image generation
- Win-back push logic for cancelled subscribers
