# DECISIONS

Non-obvious decisions made during this /goal run.

---

## D1 — Keep existing quiz schema (more sophisticated than spec)

**Date:** 2026-05-15
**Decision:** Use the existing `src/lib/quiz-schema.ts` 17-question schema (snap 10 + deep 7, mixed formats including chips-multi / rank-5 / single-card / four-card / paired-card / thrill-drain / commit / chart-pick), NOT rewrite to the spec's simpler RIASEC-binary + Big-Five-scale design.
**Alternatives considered:**
- Rewrite to spec's design (simpler but less differentiated, would discard high-quality existing work)
- Hybrid (merge ideas) — adds churn for no clear benefit
**Why this one:** Existing schema is deterministic, well-scored, with answer-quoting why-bullets. It maps to the same 17 axes the spec wants. The spec's design is a baseline; existing implementation exceeds it.
**What would invalidate this choice:** Match quality complaints from real users; A/B test showing simpler quiz converts better.

---

## D2 — Keep existing 30-hustle catalog and 30 bundled playbook JSONs

**Date:** 2026-05-15
**Decision:** Use existing `src/lib/hustles.ts` (30 hustles, 8 buckets, 17-dim fingerprints) and `src/content/playbooks/*.json` (30 playbooks). Spot-check quality rather than regenerate.
**Alternatives considered:**
- Regenerate all 30 from a clean GPT-4o-mini prompt per spec §5.3
- Hand-write 10 + LLM 20 per spec §5.3 Option A
**Why this one:** Existing 30 are already structured with the full Playbook schema (hero, 90-day, toolStack, firstTenCustomers, pricing, failureModes, realLaunches, setup, scaling). Regenerating risks losing detail. Spot-checking 3-4 is faster.
**What would invalidate this choice:** Spot check reveals low quality, unrealistic claims, or compliance issues.

---

## D3 — Distinguish `(quiz)/upgrade.tsx` (deep-dive gate) from `paywall.tsx` (subscription)

**Date:** 2026-05-15
**Decision:** Keep existing `app/(quiz)/upgrade.tsx` as the in-quiz "deep dive upsell" (FREE, only changes match confidence). Build NEW `app/paywall.tsx` as the subscription/IAP paywall (Phase 4 work).
**Alternatives considered:**
- Merge into one screen (semantic confusion — they serve different purposes)
- Rename existing to disambiguate
**Why this one:** They are different surfaces with different copy and CTAs. The existing one is wired into the quiz flow. The subscription paywall hits between `/results` and `/playbook/[slug]`.
**What would invalidate this choice:** Confusion in analytics, repeated user reports of misunderstanding which paywall is which.

---

## D4 — Tracking docs live in `hustleai-app/` (Expo repo), not at the parent dir

**Date:** 2026-05-15
**Decision:** Place WORKLOG.md, DECISIONS.md, etc. inside `hustleai-app/` because that's the actual git repo connected to GitHub (`Amplifirm/test-app-1`). The parent dir is not under version control.
**Alternatives considered:**
- Track in the parent `urfen app 1 - side hustle ai/` (not a repo)
- Track in the Next.js sibling `hustleai/` (not pushed to GitHub yet)
**Why this one:** Anything inside `hustleai-app/` ends up on GitHub on push. Founder can see progress.
**What would invalidate this choice:** Decision to combine both apps into a monorepo.
