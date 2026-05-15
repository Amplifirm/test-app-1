// Inline text for in-app legal screens. Source of truth is content/legal/*.md;
// keep these strings in sync. (No Metro markdown transformer wired.)
//
// To regenerate: copy from content/legal/terms.md / privacy.md and strip the
// front-matter blockquote, since the in-app surface has its own banner.

export const TERMS = `# Terms of Service

**Last updated:** [DATE — set on launch]
**Effective date:** [DATE — set on launch]

## 1. Who we are
HustleAI ("we") is operated by [BUSINESS ENTITY NAME] at [ADDRESS]. By using HustleAI you agree to these Terms.

## 2. What HustleAI does
HustleAI helps you discover side-business ideas ("hustles") that fit your personality, skills, time, and goals — based on a short quiz — and provides 90-day playbooks of suggested actions. **HustleAI does not provide business, financial, legal, or tax advice.** Outcomes vary; income figures are medians or estimates from public sources, not promises.

## 3. Eligibility
You must be at least 13 years old to use the App.

## 4. Subscriptions, trials, and refunds
The App offers subscriptions managed by Apple or Google. Pricing and trial terms are shown on each paywall before purchase. Subscriptions auto-renew until you cancel in your platform settings. Refunds are processed by Apple/Google per their policies; we cannot directly refund in-app purchases.

## 5. Acceptable use
No reverse engineering, no scraping for commercial republication, no bypassing paid gates. Violations may result in account suspension.

## 6. Intellectual property
The App and playbook content are owned by us or our licensors. You receive a limited license while your entitlement is active. Your data (quiz answers, progress, coach messages) remains yours.

## 7. AI features
AI-generated content may contain errors. Do not rely on AI output for legal, financial, medical, tax, or safety decisions.

## 8. Disclaimers
Provided AS IS, AS AVAILABLE. No warranties.

## 9. Limitation of liability
To the maximum extent permitted by law, our aggregate liability for any claim is capped at the greater of (a) the amount you paid us in the prior 12 months or (b) US$50.

## 10. Governing law
Laws of [STATE/COUNTRY]. Disputes resolved by binding arbitration in [CITY], except small-claims; class actions waived. EU/UK consumer protections apply notwithstanding.

## 11. Changes
We may update these Terms; material changes communicated via in-app notice.

## 12. Contact
[support@hustleai.com]
`;

export const PRIVACY = `# Privacy Policy

**Last updated:** [DATE — set on launch]

## 1. Who we are
HustleAI is operated by [BUSINESS ENTITY NAME]. For privacy questions: [privacy@hustleai.com].

## 2. What we collect
- Account identifiers (email if you sign up, device ID, profile ID)
- Quiz answers and derived axis scores
- Usage data (screens viewed, errors)
- Purchases (subscription/playbook status from Apple/Google — we don't see your credit card)
- AI coach messages (for rate-limiting and quality)
- Push token (if you opt in)
- Optional region selection

We do **NOT** collect: precise GPS location, contacts, microphone, camera, health data, or financial credentials.

## 3. How we use it
To run the quiz, deliver matches and playbooks, process purchases, send transactional notifications you opt into, diagnose crashes, and produce aggregate analytics for product decisions.

We do not sell personal information. We do not track across apps for advertising.

## 4. Sub-processors
Supabase (database, auth), RevenueCat (subscription validation), Superwall (paywall logic), PostHog (analytics), Sentry (crash reports), OpenAI (AI coach), Apple/Google (distribution + payments).

## 5. International transfers
Data may be stored in the US or other countries. Where required, we rely on standard contractual clauses.

## 6. Retention
Account data retained while your account is active + 30-day grace period after deletion. Coach messages: 12 months. Anonymous device-only data: 90 days from last activity. Aggregated analytics: indefinitely (deidentified).

## 7. Your rights
Access, delete, correct, opt out, restrict, portability. Use Settings → Privacy & data, or email [privacy@hustleai.com]. We respond within 30 days. EU/UK GDPR rights and California CCPA rights apply.

## 8. Children
Not directed to children under 13.

## 9. Security
TLS in transit; Supabase Auth handles credential hashing; row-level security on user data; encrypted device storage for tokens.

## 10. Changes
Material changes notified via in-app banner.

## 11. Contact
Privacy: [privacy@hustleai.com]. Support: [support@hustleai.com].
`;
