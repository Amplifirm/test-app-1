# Privacy Policy

> **TEMPLATE — REVIEW BY LAWYER BEFORE LAUNCH**
> The text below is a working draft. It is not legal advice. A licensed
> attorney must review and adapt it for GDPR, CCPA, COPPA, and any other
> applicable regimes before launch.

**Last updated:** [DATE — set on launch]
**Effective date:** [DATE — set on launch]

## 1. Who we are

HustleAI ("we") is operated by [BUSINESS ENTITY NAME], located at [ADDRESS]. For privacy questions, contact [privacy@hustleai.com].

In the EU/UK, our data controller is [BUSINESS ENTITY NAME]. If we have an EU representative, contact: [EU REP NAME, ADDRESS].

## 2. What we collect

| Category | Examples | Why we collect |
|---|---|---|
| Account identifiers | Email (if you sign up), device ID, profile ID | To run your account and personalize your matches |
| Quiz answers | Your 17 quiz responses, derived axis scores | To compute your match results — this is the core function |
| Usage data | Screens viewed, taps, time-on-screen, errors | To improve the product and debug crashes |
| Purchases | Subscription status, single-playbook unlocks (from Apple/Google) | To gate paid content. We do **not** see your credit card |
| AI coach messages | The chat history within the AI coach feature | To deliver coaching responses; retained for rate-limiting and quality |
| Push token | Apple/Google push notifier ID (if you opt in) | To send playbook reminders |
| Optional region | Country/region picker answer | To filter region-appropriate hustles |

We do **not** collect: precise GPS location, contacts, microphone audio, camera video, health data, or financial account credentials.

## 3. How we use it

- Run the quiz, compute matches, deliver playbooks (this is the core service)
- Process purchases (Apple / Google handle payment; we receive entitlement status only)
- Send transactional emails (welcome, trial reminder) and push notifications you opt into
- Diagnose crashes and errors (via Sentry or equivalent)
- Aggregate usage analytics (via PostHog or equivalent) — these are deidentified for product decisions

We do **not** sell your personal information. We do not engage in cross-app tracking for advertising. We do not share quiz answers with employers, recruiters, or third parties for hiring or credit decisions.

## 4. Who we share with (sub-processors)

- **Supabase** — primary database and authentication
- **RevenueCat** — subscription receipt validation
- **Superwall** — paywall presentation logic
- **PostHog** — product analytics
- **Sentry** — crash and error reporting
- **OpenAI** — AI coach inference (your message text + minimal context is sent at request time; no training on your data per OpenAI's API terms)
- **Apple / Google** — App distribution and payment

Each sub-processor handles only the data needed for their function, under their own privacy policy.

## 5. International transfers

Data may be stored on servers in the United States or other countries. Where required (e.g. EU/UK), we rely on standard contractual clauses with sub-processors.

## 6. Retention

- Account data: retained while your account is active, plus a 30-day grace period after deletion request
- Quiz answers + playbook progress: same as account data
- Coach messages: 12 months from creation
- Anonymous device-only data (no signup): 90 days from last activity
- Aggregated analytics: indefinitely (deidentified)

After retention windows, we delete or fully anonymize the records.

## 7. Your rights (GDPR / CCPA / general)

You can:

- **Access** — request a copy of your data (in-app: Settings → Privacy & data → Export)
- **Delete** — request account deletion (in-app: Settings → Delete my account)
- **Correct** — update your email or profile fields
- **Opt out** — turn off push notifications, opt out of analytics (we honor Global Privacy Control where supported)
- **Restrict** — pause processing while a dispute is resolved
- **Portability** — request a machine-readable copy of your data

For **EU/UK** residents, the lawful basis for processing is either (a) performance of a contract (running the service you signed up for), (b) legitimate interests (security, fraud prevention, analytics), or (c) consent (push notifications, optional email).

For **California** residents (CCPA/CPRA): you have the rights above plus the right to non-discrimination and the right to know categories of personal info collected. We do not sell or share for cross-context behavioral advertising.

To exercise rights, email [privacy@hustleai.com]. We respond within 30 days.

## 8. Children

The App is not directed to children under 13. We do not knowingly collect personal information from children under 13. If we learn we have, we will delete it. For 13-to-majority users, parent/guardian consent may be required in your jurisdiction.

## 9. Security

We use industry-standard measures (TLS, hashed credentials via Supabase Auth, row-level security on user data, encrypted device storage for tokens). No system is 100% secure — please use a strong password and enable platform-level protections.

## 10. Changes

Material changes will be notified via in-app banner and email (if we have one). The "Last updated" date at the top will reflect the latest version.

## 11. Contact

- **Privacy:** [privacy@hustleai.com]
- **General support:** [support@hustleai.com]
- **EU representative:** [if applicable]
- **California Privacy Coordinator:** [if applicable]
