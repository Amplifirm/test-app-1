# BLOCKERS

Anything currently halting forward progress. Update as resolved.

---

## B1 — Running on user's Mac (against stated preference)

**Severity:** MEDIUM — user explicitly said they didn't want this running locally on their Mac due to thermal/battery concerns. The /goal command was set locally despite that.

**Proposed resolution (founder action):**
1. Run `/goal clear` in this session.
2. Confirm the latest commits are on GitHub (`Amplifirm/test-app-1`).
3. Open claude.ai/code, authorize the GitHub app, connect this repo.
4. Open a new session there, paste the same `/goal` (or upload the MD file) and let it run server-side.

**Workaround if you want to stay local:** plug in power, run `caffeinate -dis` in another terminal, accept the heat. Suggest not closing the lid.

---

## B2 — External service accounts not yet created

**Severity:** MEDIUM — most of Phase 1-9 scaffolding is "wire it but use env-var keys that don't exist yet." Code will compile but most features no-op until founder creates accounts.

**Founder actions required:** See `SETUP_CHECKLIST.md`.

These are scaffolded with `process.env.EXPO_PUBLIC_*_KEY` patterns and guarded with `if (!key) return` early-returns to avoid runtime crashes.

---

(No active hard blockers as of 2026-05-15 14:10.)
