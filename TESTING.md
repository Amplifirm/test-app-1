# Testing

## Automated tests (after installing jest)

Install:
```bash
npm install --save-dev --legacy-peer-deps \
  jest \
  jest-expo \
  @types/jest \
  @testing-library/react-native
```

Add to `package.json` scripts:
```json
"test": "jest",
"test:watch": "jest --watch"
```

Add to `package.json` (root or jest field):
```json
"jest": {
  "preset": "jest-expo",
  "transformIgnorePatterns": [
    "node_modules/(?!(jest-)?@?react-native|@react-native-community|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)"
  ]
}
```

### Test suites

- `__tests__/matching.test.ts` — determinism, hard-filter, ranking, profile summary, edge cases. **The most important test in the repo.** Run it after any change to:
  - `src/lib/score.ts`
  - `src/lib/quiz-schema.ts`
  - `src/lib/hustles.ts`
  - `src/lib/dimensions.ts`
- `__tests__/smoke.test.ts` — imports + shape checks. Catches accidental breakages of exported constants and counts (must stay 17 questions, 30 hustles, 8 buckets).

## Manual critical-path tests (do these before EVERY TestFlight build)

Execute each on iOS simulator. Document pass/fail in CHANGELOG or PR description.

### 1. Fresh install → quiz → results
1. Reset the simulator (`xcrun simctl erase all`)
2. `npm start` and open in simulator
3. Tap "Start the 60-second quiz"
4. Answer all 17 questions
5. **Expect:** thinking screen → results screen with 3 matches, top match labeled "TOP MATCH", fit % visible
6. Tap match #1
7. **Expect:** paywall opens with the matched hustle name + fit %

### 2. Mock purchase → unlock
1. From paywall (in dev mode, with no RevenueCat key), tap "Start 3-day free trial"
2. **Expect:** routes to `/playbook/[slug]` with full playbook content visible
3. Force-quit, reopen app, navigate back to playbook
4. **Expect:** still unlocked (entitlement persists via Zustand)

### 3. Single playbook purchase
1. From paywall, tap "Just this one playbook — $4.99"
2. In the modal, tap "Unlock this playbook — $4.99"
3. **Expect:** routes to the SPECIFIC playbook page, that one unlocked. Other playbooks should still show the paywall (until full subscription).

### 4. Quiz again
1. From results, tap account → "Quiz again" (when wired in Phase 7)
2. Replay quiz with different answers
3. **Expect:** different matches. Re-answer identical → same matches (determinism)

### 5. Restore purchases
1. From paywall top-right, tap "Restore"
2. **Expect:** no crash. If RevenueCat is wired and user has prior purchase, entitlement restored.

### 6. Legal pages
1. From paywall footer, tap "Terms" and "Privacy"
2. **Expect:** each renders with the "TEMPLATE — REVIEW BY LAWYER BEFORE LAUNCH" coral banner

### 7. Methodology
1. From results, tap "How we calculate this →"
2. **Expect:** methodology page renders. Copy should match spec §3.5 disclaimers.

### 8. Network failure
1. Toggle airplane mode after launch
2. Navigate to a playbook
3. **Expect:** core playbook content (bundled JSON) renders. AI personalization layer falls back to `fallbackPersonalized()` from `src/lib/playbook.ts`.

## Performance budget

Measure on iPhone 15 simulator:

| Metric | Target | Notes |
|---|---|---|
| Cold start → interactive | <3s | Splash dismisses + first screen visible |
| Quiz question advance | <100ms | Tap-to-next-screen |
| Results screen render | <500ms | After thinking screen completes |

Document actuals in `PERFORMANCE.md` after measuring. File any >2x miss as a known issue in `WORKLOG.md`.
